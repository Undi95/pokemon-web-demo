/**
 * field_camera.ts — miroir 1:1 décomp `src/field_camera.c` (moteur scroll overworld).
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/field_camera.c`
 *
 * Dette d'extraction (= fonctions hébergées ici mais d'un autre .c, à terme à
 * sortir) : `CameraMove` (fieldmap.c:649 — version M3-adaptée intimement couplée
 * au système caméra `_camPos`/`_pendingConnection`) + `_clearMirageTowerPulseBlend
 * Effect` (mirage_tower.c:303 — no-op, Mirage Tower pas porté).
 *
 * Glu maison / déviations M3 (= sans équivalent décomp strict) : couche de push
 * VRAM (flushOverworldTilemaps/clearOverworldTilemaps), signal de transition de
 * connexion (_pendingConnection / getPendingConnection), focus caméra via `_camPos`
 * local (au lieu de gSaveBlock1Ptr->pos direct), flags redraw, hooks scene, trace
 * devtools. Tout le reste = field_camera.c 1:1 strict.
 *
 * Architecture circular buffer 32x32 BG (= 16x16 metatiles) :
 *   - Le BG screen GBA = 32x32 BG tiles = 256x256 px = 16x16 metatiles.
 *   - L'écran visible = 240x160 px = 15x10 metatiles.
 *   - Donc 1 metatile en plus dans chaque direction (= buffer pour scroll).
 *
 *   - sFieldCameraOffset.xTileOffset / yTileOffset (modulo 32) = quel BG tile
 *     dans le screen 32x32 correspond au top-left de la map view.
 *     Quand la camera scrolle de N tiles, xTileOffset += N (mod 32). Pas
 *     besoin de redessiner toute la map — juste 1 ligne/colonne nouvelle qui
 *     entre dans la view.
 *
 *   - sFieldCameraOffset.xPixelOffset / yPixelOffset = sous-tile pixel offset.
 *     Écrit dans REG_OFFSET_BG{1,2,3}HOFS/VOFS chaque frame via
 *     FieldUpdateBgTilemapScroll.
 *
 * Flow CameraUpdate (1:1 décomp:360-426) :
 *   1. Récupère movementSpeedX/Y (= driven par player movement ou Camera object).
 *   2. Si on traverse un tile boundary, deltaX/Y = ±1 (= 1 tile).
 *   3. AddCameraTileOffset(±2, 0) (= 2 BG tiles = 1 metatile).
 *   4. RedrawMapSlice* dans la direction du scroll.
 *   5. AddCameraPixelOffset(speedX, speedY).
 *   6. gTotalCameraPixelOffsetX/Y -= speed (= pour positionner sprites).
 *
 * Notation décomp :
 *   - "x" = colonne en metatiles
 *   - "tile" = BG tile (= 8x8 px)
 *   - 1 metatile = 2x2 BG tiles
 */
import type { DecompRuntime } from '../engine/system/decomp-runtime';
import {
  type MapLayout,
  MapGridGetMetatileIdAt,
  MapGridGetMetatileLayerTypeAt,
  NUM_METATILES_IN_PRIMARY,
  NUM_METATILES_TOTAL,
  NUM_TILES_PER_METATILE,
  METATILE_LAYER_TYPE_NORMAL,
  METATILE_LAYER_TYPE_COVERED,
  METATILE_LAYER_TYPE_SPLIT,
  gMapHeader,
  GetMapBorderIdAt,
  GetIncomingConnection,
  SaveMapView,
  SetPositionFromConnection,
  TransitionToConnection,
  MoveMapViewToBackup,
  setRedrawWholeMapViewHook,
} from './fieldmap';
import { gPlayerAvatar } from './field_player_avatar';
import type { MapConnection } from './fieldmap';
import {
  REG_OFFSET_BG1HOFS, REG_OFFSET_BG1VOFS,
  REG_OFFSET_BG2HOFS, REG_OFFSET_BG2VOFS,
  REG_OFFSET_BG3HOFS, REG_OFFSET_BG3VOFS,
} from '../engine/system/decomp-runtime';
import { callUpdateObjectEventsForCameraUpdate, callAddCameraObject } from '../engine/field/field-globals';
import { getRuntime } from '../engine/system/decomp-globals';
import { DestroySprite } from '../engine/system/decomp-bridge';
import { gSaveBlock1Ptr } from '../engine/ui/gba-menu-system';
import { CONNECTION_NONE, CONNECTION_INVALID } from '../engine/decomp-data/include/constants/global-data';

// ─── 1:1 décomp `struct FieldCameraOffset` (field_camera.c:17-24) ───────────

interface FieldCameraOffset {
  xPixelOffset: number;
  yPixelOffset: number;
  xTileOffset: number;
  yTileOffset: number;
  copyBGToVRAM: boolean;
}

// ─── 1:1 décomp EWRAM/COMMON_DATA globals ───────────────────────────────────

/** 1:1 décomp `static struct FieldCameraOffset sFieldCameraOffset` (field_camera.c:36). */
const sFieldCameraOffset: FieldCameraOffset = {
  xPixelOffset: 0,
  yPixelOffset: 0,
  xTileOffset: 0,
  yTileOffset: 0,
  copyBGToVRAM: true,
};

/** 1:1 décomp `static s16 sHorizontalCameraPan` (field_camera.c:37). Pan utilisé
 *  pour les effets de pan (= bike/zoom). 0 par défaut. */
let sHorizontalCameraPan = 0;
/** 1:1 décomp `sVerticalCameraPan = 32` après `InstallCameraPanAheadCallback`
 *  (field_camera.c:453, called par ResumeMap overworld.c:2139). Default 32 =
 *  visible window shifts down 2 metatiles → player rendered at view row 7
 *  (= 1:1 décomp), evite OOB writes en RedrawMapSlice* aux derniers rows de map.
 *  Avec le +8 dans FieldUpdateBgTilemapScroll, BG_VOFS = yPixelOffset + 40. */
let sVerticalCameraPan = 32;

/** 1:1 décomp `COMMON_DATA u16 gTotalCameraPixelOffsetX/Y` (field_camera.c:43-44).
 *  Tracking du déplacement total pour positionner les sprites overworld
 *  (= gSpriteCoordOffsetX/Y dérivé). */
export const gTotalCamera = { pixelOffsetX: 0, pixelOffsetY: 0 };

/** 1:1 décomp `EWRAM_DATA struct Camera gCamera` (fieldmap.c:30 / global.fieldmap.h).
 *  Set par CameraMove (fieldmap.c:649) :
 *    - `gCamera.active = FALSE` au début (= reset chaque tile boundary).
 *    - Si cross-border : `gCamera.active = TRUE`, `gCamera.x = old_pos.x - new_pos.x`,
 *      `gCamera.y = old_pos.y - new_pos.y` (= delta logique pour translater les
 *      NPCs vers le frame de la new map).
 *  Lu par UpdateObjectEventCoordsForCameraUpdate (event_object_movement.c:2167) :
 *    si `gCamera.active`, translate `currentCoords/initialCoords/previousCoords`
 *    de tous les NPCs actifs.
 *
 *  Phase 4.8 audit : ce flag manquait → on appelait UpdateObjectEventCoordsFor
 *  CameraUpdate manuellement dans handleConnectionTransition sans control flag,
 *  ce qui était fonctionnel mais pas 1:1 décomp. */
export const gCamera = { active: false, x: 0, y: 0 };

/** 1:1 décomp `struct CameraObject gFieldCamera` (field_camera.c:42).
 *  Tracks player sprite for camera follow. Phase 4.2 : version simplifiée
 *  sans sprite tracking (= driven directement par TestOverworldScene). */
export interface FieldCameraObject {
  movementSpeedX: number;
  movementSpeedY: number;
  /** Sub-tile pixel offset modulo 16 (= position dans le tile courant). */
  x: number;
  y: number;
  spriteId: number;
  callback: ((cam: FieldCameraObject) => void) | null;
}
export const gFieldCamera: FieldCameraObject = {
  movementSpeedX: 0,
  movementSpeedY: 0,
  x: 0,
  y: 0,
  spriteId: 0,
  callback: null,
};

// ─── 1:1 décomp helpers (field_camera.c:46-67) ──────────────────────────────

/** 1:1 décomp `ResetCameraOffset(cameraOffset)` (field_camera.c:46-53). */
function ResetCameraOffset(cameraOffset: FieldCameraOffset): void {
  cameraOffset.xTileOffset = 0;
  cameraOffset.yTileOffset = 0;
  cameraOffset.xPixelOffset = 0;
  cameraOffset.yPixelOffset = 0;
  cameraOffset.copyBGToVRAM = true;
}

/** 1:1 décomp `AddCameraTileOffset(cameraOffset, x, y)` (field_camera.c:55-61).
 *  Wrap modulo 32 (= circular buffer 32 BG tiles). */
function AddCameraTileOffset(cameraOffset: FieldCameraOffset, xOffset: number, yOffset: number): void {
  cameraOffset.xTileOffset = ((cameraOffset.xTileOffset + xOffset) % 32 + 32) % 32;
  cameraOffset.yTileOffset = ((cameraOffset.yTileOffset + yOffset) % 32 + 32) % 32;
}

/** 1:1 décomp `AddCameraPixelOffset(cameraOffset, x, y)` (field_camera.c:63-67). */
function AddCameraPixelOffset(cameraOffset: FieldCameraOffset, xOffset: number, yOffset: number): void {
  cameraOffset.xPixelOffset += xOffset;
  cameraOffset.yPixelOffset += yOffset;
}

/** 1:1 décomp `ResetFieldCamera()` (field_camera.c:69-72). */
export function ResetFieldCamera(): void {
  ResetCameraOffset(sFieldCameraOffset);
}

// ─── 1:1 décomp camera panning helpers (field_camera.c:437-507) ─────────────

/** 1:1 décomp `static void (*sFieldCameraPanningCallback)(void)` (field_camera.c:40). */
let sFieldCameraPanningCallback: (() => void) | null = null;
/** 1:1 décomp `static bool8 sBikeCameraPanFlag` (field_camera.c:39). */
let sBikeCameraPanFlag = false;
/** 1:1 décomp `EWRAM_DATA bool8 gUnusedBikeCameraAheadPanback = FALSE` (field_camera.c:15).
 *  Reste FALSE en runtime → `CameraPanningCB_PanAhead` rentre toujours dans le
 *  branche `InstallCameraPanAheadCallback()`. */
const gUnusedBikeCameraAheadPanback = false;

/** 1:1 décomp `gSpriteCoordOffsetX/Y` (field_camera.c:461-462). Lus par les
 *  sprites overworld (= OBJ avec `coordOffsetEnabled = TRUE`) pour shift leur
 *  position selon le total pan + camera offset. */
export const gSpriteCoordOffset = { x: 0, y: 0 };

/** 1:1 décomp `CameraPanningCB_PanAhead(void)` (field_camera.c:465-507).
 *  Avec `gUnusedBikeCameraAheadPanback = FALSE` constant, se réduit à
 *  `InstallCameraPanAheadCallback()` (= ré-install + reset pan vars). */
function CameraPanningCB_PanAhead(): void {
  if (!gUnusedBikeCameraAheadPanback) {
    InstallCameraPanAheadCallback();
  }
  // else : dead path bike camera pan (= jamais atteint dans le jeu).
}

/** 1:1 décomp `SetCameraPanningCallback(void (*callback)(void))` (field_camera.c:437-440). */
export function SetCameraPanningCallback(callback: (() => void) | null): void {
  sFieldCameraPanningCallback = callback;
}

/** 1:1 décomp `InstallCameraPanAheadCallback()` (field_camera.c:448-454).
 *  Appelé dans `ResumeMap` (overworld.c:2139) à chaque load de map. */
export function InstallCameraPanAheadCallback(): void {
  sFieldCameraPanningCallback = CameraPanningCB_PanAhead;
  sBikeCameraPanFlag = false;
  sHorizontalCameraPan = 0;
  sVerticalCameraPan = 32;
}

/** 1:1 décomp `UpdateCameraPanning(void)` (field_camera.c:456-463). À call
 *  chaque frame du main overworld loop (= 1:1 décomp `CB1_Overworld` →
 *  `CB2_Overworld` chain). Déclenche le pan callback puis dérive
 *  `gSpriteCoordOffsetX/Y` que les sprites overworld utilisent pour positionner
 *  via `coordOffsetEnabled`. */
export function UpdateCameraPanning(): void {
  if (sFieldCameraPanningCallback !== null) sFieldCameraPanningCallback();
  gSpriteCoordOffset.x = gTotalCamera.pixelOffsetX - sHorizontalCameraPan;
  gSpriteCoordOffset.y = gTotalCamera.pixelOffsetY - sVerticalCameraPan - 8;
  // Miroir sur le runtime (= système sprite, où vivent gSpriteCoordOffsetX/Y dans
  // la décomp sprite.c) pour que `syncSpritesToOam`/`UpdateOamCoords` applique
  // l'offset aux sprites `coordOffsetEnabled` sans cycle d'import.
  const rt = getRuntime();
  rt.gSpriteCoordOffsetX = gSpriteCoordOffset.x;
  rt.gSpriteCoordOffsetY = gSpriteCoordOffset.y;
}

/** 1:1 décomp `MoveCameraAndRedrawMap(int deltaX, int deltaY)` (field_camera.c:428-435).
 *  Marqué `unused` dans le décomp. Porté pour exhaustivité 1:1. */
export function MoveCameraAndRedrawMap(deltaX: number, deltaY: number): void {
  CameraMove(deltaX, deltaY);
  try {
    callUpdateObjectEventsForCameraUpdate(getRuntime(), deltaX, deltaY);
  } catch (e) { void e; }
  DrawWholeMapView();
  gTotalCamera.pixelOffsetX -= deltaX * 16;
  gTotalCamera.pixelOffsetY -= deltaY * 16;
}

/** 1:1 décomp `CameraUpdateCallback(struct CameraObject *fieldCamera)` (field_camera.c:332-339).
 *  Lit movementSpeedX/Y depuis le sprite caméra tracké (= AddCameraObject) pour
 *  driver le scroll. sCamera_MoveX = data[2], sCamera_MoveY = data[3]. */
function CameraUpdateCallback(cam: FieldCameraObject): void {
  if (cam.spriteId !== 0) {
    const s = getRuntime().gSprites.get(cam.spriteId);
    if (s) {
      cam.movementSpeedX = s.data[2];
      cam.movementSpeedY = s.data[3];
    }
  }
}

/** 1:1 décomp `InitCameraUpdateCallback(u8 trackedSpriteId)` (field_camera.c:351-358).
 *  Détruit l'ancien sprite caméra, crée un CameraObject suivant `trackedSpriteId`
 *  (= le sprite joueur) et installe CameraUpdateCallback. AddCameraObject est
 *  appelé via field-globals (anti-cycle object-events↔field-camera). */
export function InitCameraUpdateCallback(trackedSpriteId: number): number {
  if (gFieldCamera.spriteId !== 0) {
    const old = getRuntime().gSprites.get(gFieldCamera.spriteId);
    if (old) DestroySprite(old);
  }
  gFieldCamera.spriteId = callAddCameraObject(trackedSpriteId);
  gFieldCamera.callback = CameraUpdateCallback;
  return 0;
}

/** 1:1 décomp `ResetCameraUpdateInfo()` (field_camera.c:341-349) — reset
 *  gFieldCamera state (= speeds + sub-tile pixel offset). À call au load de
 *  map (= ResumeMap) sinon scroll buggy après warp (= state stale du map
 *  précédent → wiggle / split visual au prochain step).
 *  Aussi reset gTotalCamera (= 1:1 décomp `InitObjectEventsLocal:2168` qui
 *  set gTotalCameraPixelOffsetX/Y = 0).
 *
 *  [M3-C3.2] Détruit le CameraObject de la map précédente AVANT de zéroter
 *  `spriteId`. Dans le décomp, le warp passe par `ResetSpriteData()` qui efface
 *  TOUS les gSprites (dont le CameraObject) ; notre moteur ne reset pas les
 *  sprites en bloc au warp → sans ça le CameraObject FUITE (camCount grandit de 1
 *  par warp) et l'orphelin génère un delta de téléport parasite (caméra qui saute).
 *  `InitCameraUpdateCallback` ne peut pas le détruire car `spriteId` est déjà 0
 *  ici (= pourquoi le décomp s'appuie sur le reset sprite externe). */
export function ResetCameraUpdateInfo(): void {
  if (gFieldCamera.spriteId !== 0) {
    const cam = getRuntime().gSprites.get(gFieldCamera.spriteId);
    // Garde : ne détruit que si c'est bien le sprite CameraObject (slot non réutilisé).
    if (cam && cam.callback && cam.callback.name === 'SpriteCB_CameraObject') {
      DestroySprite(cam);
    }
  }
  gFieldCamera.movementSpeedX = 0;
  gFieldCamera.movementSpeedY = 0;
  gFieldCamera.x = 0;
  gFieldCamera.y = 0;
  gFieldCamera.spriteId = 0;
  gFieldCamera.callback = null;
  gTotalCamera.pixelOffsetX = 0;
  gTotalCamera.pixelOffsetY = 0;
}

// ─── 1:1 décomp FieldUpdateBgTilemapScroll (field_camera.c:74-86) ───────────

/** Écrit les BG hofs/vofs des layers BG1/BG2/BG3 selon le pixel offset courant.
 *
 *  1:1 décomp `field_camera.c:74-86` :
 *  ```c
 *  void FieldUpdateBgTilemapScroll(void) {
 *    s32 r5 = sFieldCameraOffset.xPixelOffset + sHorizontalCameraPan;
 *    s32 r4 = sVerticalCameraPan + sFieldCameraOffset.yPixelOffset + 8;  // ← +8 critique
 *    SetGpuReg(REG_BG1HOFS, r5);
 *    SetGpuReg(REG_BG1VOFS, r4);
 *    ...
 *  }
 *  ```
 *
 *  Le `+ 8` shifte tout le BG vers le bas de 8 px. C'est parce que le décomp
 *  rend une "vue" 240×144 effective au top (= 18 rows visible) avec une
 *  textbox dialog (= 2 rows = 32px) qui peut overlay BG0 en bas. Le sprite
 *  player center y = 80 (= row 5 mid) devient row 5 mid + 8 = 88. Le BG
 *  rendu décale de 8 → sprite reste visuellement aligné sur le tile.
 *
 *  Audit Opus 2.5 : avant ce fix, le `+ 8` était omis "Phase 4.3 sans dialogue".
 *  Mais Phase 4.5 a wired la dialog box → décollage sprite/BG visible. Réintro
 *  pour matcher 1:1 décomp + sprite y au boot ajusté avec offset +8. */
/** Suspend flag : when true, FieldUpdateBgTilemapScroll early-returns sans
 *  toucher aux BG scrolls. Utilisé par les UI scenes qui réutilisent BG1/2/3
 *  pour leur propre layout (= ChooseStarter, BattleStartTransition, etc.) —
 *  équivalent du décomp `SetMainCallback2(CB2_OtherScene)` qui swap le main
 *  callback2 et donc bypass FieldUpdateBgTilemapScroll. À set false dans la
 *  cleanup phase pour réactiver le scroll overworld. */
let _fieldCameraSuspended = false;

export function setFieldCameraSuspended(suspended: boolean): void {
  _fieldCameraSuspended = suspended;
}

export function FieldUpdateBgTilemapScroll(rt: DecompRuntime): void {
  if (_fieldCameraSuspended) return;
  const r5 = sFieldCameraOffset.xPixelOffset + sHorizontalCameraPan;
  const r4 = sVerticalCameraPan + sFieldCameraOffset.yPixelOffset + 8;

  // 1:1 décomp `field_camera.c:80-85` — pas de mask côté CPU. Le HW BG_HOFS/VOFS
  // register mask déjà via définition register 9 bits. Masquer côté CPU TS écrasait
  // le bit signé sur valeurs négatives (-3 & 0x1FF = 509) → BG_HOFS sautait 512 px
  // = snap visible 1 case = bug "1 case off" post-warp.
  rt.SetGpuReg(REG_OFFSET_BG1HOFS, r5);
  rt.SetGpuReg(REG_OFFSET_BG1VOFS, r4);
  rt.SetGpuReg(REG_OFFSET_BG2HOFS, r5);
  rt.SetGpuReg(REG_OFFSET_BG2VOFS, r4);
  rt.SetGpuReg(REG_OFFSET_BG3HOFS, r5);
  rt.SetGpuReg(REG_OFFSET_BG3VOFS, r4);
}

/** 1:1 décomp `GetCameraOffsetWithPan(x, y)` (field_camera.c:88-92).
 *  Retourne le pixel offset + pan (= utilisé par sprite positioning). */
export function GetCameraOffsetWithPan(): { x: number; y: number } {
  return {
    x: sFieldCameraOffset.xPixelOffset + sHorizontalCameraPan,
    y: sFieldCameraOffset.yPixelOffset + sVerticalCameraPan + 8,
  };
}

// ─── 1:1 décomp DrawMetatile + buffers tilemap (field_camera.c:245-310) ─────

/** Tilemap buffers BG1/BG2/BG3 (= 32x32 u16 = 1024 entries each).
 *  1:1 décomp `gOverworldTilemapBuffer_Bg1/Bg2/Bg3` (field_camera.c). Écrits par
 *  DrawMetatile, copiés en VRAM mapBase via flushOverworldTilemaps().
 *
 *  Note : décomp utilise BG3 = bottom, BG2 = middle, BG1 = top. Notre rt.gba
 *  expose bg(1).tilemap, bg(2).tilemap, bg(3).tilemap qui sont des views
 *  Uint16Array sur la VRAM unifié. On peut donc écrire directement dans ces
 *  views — mais on garde un buffer séparé pour matcher décomp + permettre les
 *  scrolls partiels via copyBGToVRAM. */
const gOverworldTilemapBuffer_Bg1 = new Uint16Array(32 * 32);
const gOverworldTilemapBuffer_Bg2 = new Uint16Array(32 * 32);
const gOverworldTilemapBuffer_Bg3 = new Uint16Array(32 * 32);

/** 1:1 décomp `DrawMetatile(layerType, tiles, offset)` (field_camera.c:245-310).
 *  Place les 8 BG tiles d'un metatile dans les 3 BG layers selon layerType. */
function DrawMetatile(layerType: number, tiles: Uint16Array, tilesOffset: number, mapOffset: number): void {
  // tilesOffset = index dans tiles[] où démarrent les 8 u16 du metatile (= metatileId * 8).
  // mapOffset = position dans le 32x32 BG screen (= y*32 + x). Le metatile occupe
  //             4 BG tiles : (mapOffset, mapOffset+1, mapOffset+0x20, mapOffset+0x21).
  const t = tiles;
  const o = tilesOffset;
  const m = mapOffset;

  switch (layerType) {
    case METATILE_LAYER_TYPE_SPLIT:
      // Bottom 4 → BG3
      gOverworldTilemapBuffer_Bg3[m] = t[o];
      gOverworldTilemapBuffer_Bg3[m + 1] = t[o + 1];
      gOverworldTilemapBuffer_Bg3[m + 0x20] = t[o + 2];
      gOverworldTilemapBuffer_Bg3[m + 0x21] = t[o + 3];
      // Middle = transparent
      gOverworldTilemapBuffer_Bg2[m] = 0;
      gOverworldTilemapBuffer_Bg2[m + 1] = 0;
      gOverworldTilemapBuffer_Bg2[m + 0x20] = 0;
      gOverworldTilemapBuffer_Bg2[m + 0x21] = 0;
      // Top 4 → BG1
      gOverworldTilemapBuffer_Bg1[m] = t[o + 4];
      gOverworldTilemapBuffer_Bg1[m + 1] = t[o + 5];
      gOverworldTilemapBuffer_Bg1[m + 0x20] = t[o + 6];
      gOverworldTilemapBuffer_Bg1[m + 0x21] = t[o + 7];
      break;

    case METATILE_LAYER_TYPE_COVERED:
      // Bottom 4 → BG3
      gOverworldTilemapBuffer_Bg3[m] = t[o];
      gOverworldTilemapBuffer_Bg3[m + 1] = t[o + 1];
      gOverworldTilemapBuffer_Bg3[m + 0x20] = t[o + 2];
      gOverworldTilemapBuffer_Bg3[m + 0x21] = t[o + 3];
      // Top 4 → BG2
      gOverworldTilemapBuffer_Bg2[m] = t[o + 4];
      gOverworldTilemapBuffer_Bg2[m + 1] = t[o + 5];
      gOverworldTilemapBuffer_Bg2[m + 0x20] = t[o + 6];
      gOverworldTilemapBuffer_Bg2[m + 0x21] = t[o + 7];
      // Top BG1 = transparent
      gOverworldTilemapBuffer_Bg1[m] = 0;
      gOverworldTilemapBuffer_Bg1[m + 1] = 0;
      gOverworldTilemapBuffer_Bg1[m + 0x20] = 0;
      gOverworldTilemapBuffer_Bg1[m + 0x21] = 0;
      break;

    case METATILE_LAYER_TYPE_NORMAL:
    default:
      // 1:1 décomp : "garbage" pattern 0x3014 sur BG3 (= caché par BG2 normalement).
      gOverworldTilemapBuffer_Bg3[m] = 0x3014;
      gOverworldTilemapBuffer_Bg3[m + 1] = 0x3014;
      gOverworldTilemapBuffer_Bg3[m + 0x20] = 0x3014;
      gOverworldTilemapBuffer_Bg3[m + 0x21] = 0x3014;
      // Bottom 4 → BG2
      gOverworldTilemapBuffer_Bg2[m] = t[o];
      gOverworldTilemapBuffer_Bg2[m + 1] = t[o + 1];
      gOverworldTilemapBuffer_Bg2[m + 0x20] = t[o + 2];
      gOverworldTilemapBuffer_Bg2[m + 0x21] = t[o + 3];
      // Top 4 → BG1 (couvre player)
      gOverworldTilemapBuffer_Bg1[m] = t[o + 4];
      gOverworldTilemapBuffer_Bg1[m + 1] = t[o + 5];
      gOverworldTilemapBuffer_Bg1[m + 0x20] = t[o + 6];
      gOverworldTilemapBuffer_Bg1[m + 0x21] = t[o + 7];
      break;
  }
}

/** Push les 3 tilemap buffers BG1/BG2/BG3 vers la VRAM mapBase respective.
 *  À call après DrawWholeMapView ou DrawMetatileAt. */
export function flushOverworldTilemaps(rt: DecompRuntime): void {
  // BG1 mapBase = e.g. 28 (= mapBaseIndex 28 → VRAM offset 28 * 0x800 = 0xE000).
  // bg(N).tilemap est un Uint16Array view sur la VRAM unifié à l'offset mapBase.
  rt.gba.bg(1).tilemap.set(gOverworldTilemapBuffer_Bg1);
  rt.gba.bg(2).tilemap.set(gOverworldTilemapBuffer_Bg2);
  rt.gba.bg(3).tilemap.set(gOverworldTilemapBuffer_Bg3);
}

/** Reset les buffers tilemap (= clear). À call avant DrawWholeMapView pour
 *  éviter résidu de map précédente. */
export function clearOverworldTilemaps(): void {
  gOverworldTilemapBuffer_Bg1.fill(0);
  gOverworldTilemapBuffer_Bg2.fill(0);
  gOverworldTilemapBuffer_Bg3.fill(0);
}

// ─── 1:1 décomp DrawMetatileAt + DrawWholeMapView (field_camera.c:226-243 + 100-121) ──

/** 1:1 décomp `DrawMetatileAt(mapLayout, offset, x, y)` (field_camera.c:226-243).
 *  Lookup metatileId via MapGridGetMetatileIdAt(x, y) et dispatch dans le bon
 *  tileset (primary / secondary) pour récupérer les 8 u16 BG tiles. */
export function DrawMetatileAt(mapLayout: MapLayout, mapOffset: number, x: number, y: number): void {
  let metatileId = MapGridGetMetatileIdAt(x, y);
  let metatiles: Uint16Array;
  if (metatileId > NUM_METATILES_TOTAL) metatileId = 0;
  if (metatileId < NUM_METATILES_IN_PRIMARY) {
    metatiles = mapLayout.primaryTileset.metatiles;
  } else {
    metatiles = mapLayout.secondaryTileset.metatiles;
    metatileId -= NUM_METATILES_IN_PRIMARY;
  }
  DrawMetatile(MapGridGetMetatileLayerTypeAt(x, y),
    metatiles, metatileId * NUM_TILES_PER_METATILE, mapOffset);
}

/** 1:1 décomp `DrawWholeMapViewInternal(x, y, mapLayout)` (field_camera.c:100-121).
 *  Draw les 16x16 metatiles visibles (= 32x32 BG tiles = 256x256 px) avec
 *  wrap modulo 32 selon xTileOffset/yTileOffset. */
function DrawWholeMapViewInternal(camX: number, camY: number, mapLayout: MapLayout): void {
  for (let i = 0; i < 32; i += 2) {
    let temp = sFieldCameraOffset.yTileOffset + i;
    if (temp >= 32) temp -= 32;
    const r6 = temp * 32;
    for (let j = 0; j < 32; j += 2) {
      let tempX = sFieldCameraOffset.xTileOffset + j;
      if (tempX >= 32) tempX -= 32;
      DrawMetatileAt(mapLayout, r6 + tempX, camX + j / 2, camY + i / 2);
    }
  }
}

/** 1:1 décomp `DrawWholeMapView(void)` (field_camera.c:94-98) :
 *      DrawWholeMapViewInternal(gSaveBlock1Ptr->pos.x, gSaveBlock1Ptr->pos.y,
 *                                gMapHeader.mapLayout);
 *      sFieldCameraOffset.copyBGToVRAM = TRUE;
 *
 *  Signature 1:1 strict (= no args). Lit `_camPos` (= gSaveBlock1Ptr->pos
 *  équivalent côté TS) + `gMapHeader.mapLayout` internally. Cause du bug
 *  user-flag "Utiliser le PC nous bouge temporairement d'une case a droite"
 *  (2026-05-21) : avant on prenait camX/camY/mapLayout en args, et les
 *  callers (pc-anim.ts, truck-cinematic.ts) passaient `gPlayerAvatar.x/y`
 *  au lieu de `_camPos.x/y` → desync entre la BG redraw et la position
 *  camera réelle → tile shift visible de 1 case. Le décomp utilise TOUJOURS
 *  `gSaveBlock1Ptr->pos`, qui est la camera focus (post-step), pas
 *  nécessairement = player avatar position pendant les transitions. */
export function DrawWholeMapView(): void {
  if (!gMapHeader) {
    console.warn('[field-camera] DrawWholeMapView : gMapHeader null, skipping');
    return;
  }
  DrawWholeMapViewInternal(_camPos.x, _camPos.y, gMapHeader.mapLayout);
  sFieldCameraOffset.copyBGToVRAM = true;
}

// ─── 1:1 décomp RedrawMapSlice* (field_camera.c:138-202) ────────────────────

/** 1:1 décomp `RedrawMapSliceNorth(cameraOffset, mapLayout)` (field_camera.c:138-155).
 *  Redessine la ligne TOP du buffer (= 16 metatiles à y_player + 14 mais wrap
 *  via yTileOffset+28). À call quand le camera scroll vers le NORTH (= y diminue). */
function RedrawMapSliceNorth(camX: number, camY: number, mapLayout: MapLayout): void {
  let temp = sFieldCameraOffset.yTileOffset + 28;
  if (temp >= 32) temp -= 32;
  const r7 = temp * 32;
  for (let i = 0; i < 32; i += 2) {
    let tempX = sFieldCameraOffset.xTileOffset + i;
    if (tempX >= 32) tempX -= 32;
    // décomp utilise gSaveBlock1Ptr->pos.x + i/2, gSaveBlock1Ptr->pos.y + 14
    // (= bottom row in player-relative coords, mais wrap fait que ça atterrit
    // au top du circular buffer).
    DrawMetatileAt(mapLayout, r7 + tempX, camX + i / 2, camY + 14);
  }
}

/** 1:1 décomp `RedrawMapSliceSouth(cameraOffset, mapLayout)` (field_camera.c:157-170). */
function RedrawMapSliceSouth(camX: number, camY: number, mapLayout: MapLayout): void {
  const r7 = sFieldCameraOffset.yTileOffset * 32;
  for (let i = 0; i < 32; i += 2) {
    let tempX = sFieldCameraOffset.xTileOffset + i;
    if (tempX >= 32) tempX -= 32;
    DrawMetatileAt(mapLayout, r7 + tempX, camX + i / 2, camY);
  }
}

/** 1:1 décomp `RedrawMapSliceEast(cameraOffset, mapLayout)` (field_camera.c:172-185). */
function RedrawMapSliceEast(camX: number, camY: number, mapLayout: MapLayout): void {
  const r6 = sFieldCameraOffset.xTileOffset;
  for (let i = 0; i < 32; i += 2) {
    let tempY = sFieldCameraOffset.yTileOffset + i;
    if (tempY >= 32) tempY -= 32;
    DrawMetatileAt(mapLayout, tempY * 32 + r6, camX, camY + i / 2);
  }
}

/** 1:1 décomp `RedrawMapSliceWest(cameraOffset, mapLayout)` (field_camera.c:187-202). */
function RedrawMapSliceWest(camX: number, camY: number, mapLayout: MapLayout): void {
  let r5 = sFieldCameraOffset.xTileOffset + 28;
  if (r5 >= 32) r5 -= 32;
  for (let i = 0; i < 32; i += 2) {
    let tempY = sFieldCameraOffset.yTileOffset + i;
    if (tempY >= 32) tempY -= 32;
    DrawMetatileAt(mapLayout, tempY * 32 + r5, camX + 14, camY + i / 2);
  }
}

/** 1:1 décomp `RedrawMapSlicesForCameraUpdate(cameraOffset, x, y)` (field_camera.c:123-136).
 *  x, y sont les deltas (= ±2 pour 1 metatile dans la direction du scroll). */
function RedrawMapSlicesForCameraUpdate(camX: number, camY: number, dx: number, dy: number): void {
  if (!gMapHeader) return;
  const mapLayout = gMapHeader.mapLayout;
  if (dx > 0) {
    _trace('RedrawMapSliceWest', { camX, mapColRedrawn: camX + 14, BGcolDest: (sFieldCameraOffset.xTileOffset + 28) % 32 });
    RedrawMapSliceWest(camX, camY, mapLayout);
  }
  if (dx < 0) {
    _trace('RedrawMapSliceEast', { camX, mapColRedrawn: camX, BGcolDest: sFieldCameraOffset.xTileOffset });
    RedrawMapSliceEast(camX, camY, mapLayout);
  }
  if (dy > 0) {
    _trace('RedrawMapSliceNorth', { camY, mapRowRedrawn: camY + 14, BGrowDest: (sFieldCameraOffset.yTileOffset + 28) % 32 });
    RedrawMapSliceNorth(camX, camY, mapLayout);
  }
  if (dy < 0) {
    _trace('RedrawMapSliceSouth', { camY, mapRowRedrawn: camY, BGrowDest: sFieldCameraOffset.yTileOffset });
    RedrawMapSliceSouth(camX, camY, mapLayout);
  }
  sFieldCameraOffset.copyBGToVRAM = true;
}

// ─── 1:1 décomp MapPosToBgTilemapOffset + CurrentMapDrawMetatileAt ──────────

/** 1:1 décomp `MapPosToBgTilemapOffset(cameraOffset, x, y)` (field_camera.c:312-330).
 *  Convertit (mapX, mapY) en index dans le BG screen 32x32 (= circular buffer).
 *  Returns -1 si hors view. */
export function MapPosToBgTilemapOffset(camX: number, camY: number, x: number, y: number): number {
  let dx = (x - camX) * 2;
  if (dx >= 32 || dx < 0) return -1;
  dx = dx + sFieldCameraOffset.xTileOffset;
  if (dx >= 32) dx -= 32;

  let dy = (y - camY) * 2;
  if (dy >= 32 || dy < 0) return -1;
  dy = dy + sFieldCameraOffset.yTileOffset;
  if (dy >= 32) dy -= 32;

  return dy * 32 + dx;
}

/** 1:1 décomp `CurrentMapDrawMetatileAt(x, y)` (field_camera.c:204-213). */
export function CurrentMapDrawMetatileAt(camX: number, camY: number, x: number, y: number): void {
  if (!gMapHeader) return;
  const offset = MapPosToBgTilemapOffset(camX, camY, x, y);
  if (offset >= 0) {
    DrawMetatileAt(gMapHeader.mapLayout, offset, x, y);
    sFieldCameraOffset.copyBGToVRAM = true;
  }
}

/** 1:1 décomp `DrawDoorMetatileAt(x, y, tiles)` (field_camera.c:215-224).
 *  Dessine un metatile avec layerType=COVERED (= bottom layer = door tiles,
 *  top layer = transparent over). Utilisé par field-door.ts pour patcher
 *  le tilemap pendant l'animation de porte.
 *
 *  @param camX/camY  Camera focus position en map coords.
 *  @param x/y        Position du metatile à dessiner (= map coords).
 *  @param tiles      8 u16 BG tilemap entries (= sortie de BuildDoorTiles).
 *                    [0..3] = bottom layer (door tiles), [4..7] = top layer (= 0). */
export function DrawDoorMetatileAt(
  camX: number, camY: number, x: number, y: number, tiles: Uint16Array,
): void {
  const offset = MapPosToBgTilemapOffset(camX, camY, x, y);
  if (offset >= 0) {
    DrawMetatile(METATILE_LAYER_TYPE_COVERED, tiles, 0, offset);
    sFieldCameraOffset.copyBGToVRAM = true;
  }
}

// ─── 1:1 décomp CameraUpdate (field_camera.c:360-426) ───────────────────────

/** Camera position (= top-left metatile of current view, en gBackupMapLayout coords).
 *  1:1 décomp `gSaveBlock1Ptr->pos` (= SaveBlock1.pos, struct Coords16, global.h:992).
 *  Source unique partagée avec gPlayerAvatar.x/y (= alias getter/setter dans
 *  player-avatar.ts). Élimine le désync historique cam.x ≠ player.x.
 *
 *  PHASE A.2 : getter dynamique (= chaque accès passe par Proxy gSaveBlock1Ptr
 *  qui lit GetSaveBlock1().pos courant). Survit à LoadSavedGame (= reassign
 *  sCurrentBlock1) sans stale ref. */
const _camPos: { x: number; y: number } = {} as { x: number; y: number };
Object.defineProperty(_camPos, 'x', {
  get(): number { return gSaveBlock1Ptr.pos.x; },
  set(v: number): void { gSaveBlock1Ptr.pos.x = v; },
  enumerable: true,
  configurable: true,
});
Object.defineProperty(_camPos, 'y', {
  get(): number { return gSaveBlock1Ptr.pos.y; },
  set(v: number): void { gSaveBlock1Ptr.pos.y = v; },
  enumerable: true,
  configurable: true,
});

/** DEV : trace buffer pour debug movement. Chaque event (= deltaX/Y fire,
 *  RedrawMapSlice*) push ici. window.dev.movementLog() lit + clear.
 *  Ajouté pour debug "map cassée au scroll" Phase 4.3. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _moveTrace: Array<Record<string, any>> = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).__moveTrace = _moveTrace;
function _trace(event: string, data: Record<string, unknown>): void {
  if (_moveTrace.length < 200) {
    _moveTrace.push({ t: _moveTrace.length, event, ...data });
  }
}
export function clearMovementTrace(): void { _moveTrace.length = 0; }
export function getMovementTrace(): ReadonlyArray<Record<string, unknown>> { return _moveTrace; }

export function GetCameraTopLeftCoords(): { x: number; y: number } {
  return { x: _camPos.x, y: _camPos.y };
}

/** 1:1 décomp `SetSpritePosToMapCoords(s16 mapX, s16 mapY, s16 *destX, s16 *destY)`
 *  (event_object_movement.c:4801-4818). Convertit des coords MAP (INTERNAL) en
 *  coords MONDE pour un sprite `coordOffsetEnabled` : le sprite, posé en (destX,
 *  destY) fixe, suit ensuite la caméra via `gSpriteCoordOffset` (ajouté par
 *  `UpdateOamCoords`/`syncSpritesToOam`).
 *
 *  Placé ici (et non dans object-events.ts = event_object_movement.c) pour éviter
 *  un cycle d'import object-events ↔ field-effect-* ; ne dépend que de globals
 *  caméra (gTotalCamera, gFieldCamera, gSaveBlock1Ptr.pos). */
export function SetSpritePosToMapCoords(mapX: number, mapY: number): { x: number; y: number } {
  const pos = gSaveBlock1Ptr.pos;
  let dx = -gTotalCamera.pixelOffsetX - gFieldCamera.x;
  let dy = -gTotalCamera.pixelOffsetY - gFieldCamera.y;
  if (gFieldCamera.x > 0) dx += 16;
  if (gFieldCamera.x < 0) dx -= 16;
  if (gFieldCamera.y > 0) dy += 16;
  if (gFieldCamera.y < 0) dy -= 16;
  return {
    x: ((mapX - pos.x) << 4) + dx,
    y: ((mapY - pos.y) << 4) + dy,
  };
}

/** 1:1 décomp `SetSpritePosToOffsetMapCoords(s16 *x, s16 *y, s16 dx, s16 dy)`
 *  (event_object_movement.c:4821-4826) : SetSpritePosToMapCoords + offset (dx, dy). */
export function SetSpritePosToOffsetMapCoords(mapX: number, mapY: number, dx: number, dy: number): { x: number; y: number } {
  const p = SetSpritePosToMapCoords(mapX, mapY);
  return { x: p.x + dx, y: p.y + dy };
}

export function SetCameraTopLeftCoords(x: number, y: number): void {
  _camPos.x = x;
  _camPos.y = y;
}

/** Pending connection transition state (= signalé par CameraMove quand camera
 *  crosse un border, picked up par MainCB2 scene pour run TransitionToConnection
 *  + update player.x/y). Évite circular import entre field-camera ↔ player-avatar. */
export interface PendingConnection {
  direction: number;        // CONNECTION_NORTH / SOUTH / WEST / EAST
  connection: MapConnection;
  /** Camera coords AVANT le delta crossing (= gBackupMapLayout coords). */
  oldCamX: number;
  oldCamY: number;
  /** Delta qui a causé le crossing (= ±1 metatile). */
  deltaX: number;
  deltaY: number;
}

let _pendingConnection: PendingConnection | null = null;

export function getPendingConnection(): PendingConnection | null {
  return _pendingConnection;
}

export function clearPendingConnection(): void {
  _pendingConnection = null;
}

// Note 1:1 STRICT chantier OW : le flag `_lastStepCamMoved` (PHASE B' workaround)
// a été RETIRÉ. Le décomp ne dual-write pos — seul CameraMove (= fieldmap.c)
// mute pos. PlayerStep/movement-system step ends ne touchent PAS pos. C'est
// strict 1:1 et élimine le besoin de tout flag de coordination.

/** 1:1 décomp `CameraMove(x, y)` (fieldmap.c:649-678).
 *  Update _camPos par (deltaX, deltaY) en metatiles. Si le camera traverse
 *  un border vers une connexion, signaler via _pendingConnection (= MainCB2
 *  scene picks ça up et run TransitionToConnection sync + update player.x/y).
 *
 *  Returns true si une connexion a été traversée (= équivalent gCamera.active=TRUE
 *  dans décomp). */
/** 1:1 STRICT décomp `ClearMirageTowerPulseBlendEffect` (mirage_tower.c:303-317) :
 *    if (gSaveBlock1Ptr->location.mapGroup != MAP_GROUP(MAP_ROUTE111)
 *     || gSaveBlock1Ptr->location.mapNum   != MAP_NUM(MAP_ROUTE111)
 *     || !FlagGet(FLAG_MIRAGE_TOWER_VISIBLE)
 *     || sMirageTowerPulseBlend == NULL)
 *        return;
 *    [DestroyTask + Unmark/Unload palettes]
 *
 *  Notre port : early-return strict 1:1. Le PulseBlend palette system + tasks
 *  Mirage Tower ne sont pas (encore) portés (feature Route 111). Comme
 *  `sMirageTowerPulseBlend` est toujours NULL dans notre engine, le décomp
 *  early-return aussi. Comportement 1:1 strict. */
function _clearMirageTowerPulseBlendEffect(): void {
  // 1:1 décomp : check map = MAP_ROUTE111. Notre mapId est string.
  const sb1 = (globalThis as { gSaveBlock1Ptr?: { location?: { mapId?: string } } }).gSaveBlock1Ptr;
  const mapId = sb1?.location?.mapId ?? '';
  if (mapId !== 'MAP_ROUTE111') return;
  // 1:1 décomp : check FLAG_MIRAGE_TOWER_VISIBLE.
  const flags = (globalThis as { gSaveBlock1Ptr?: { flags?: Record<string, boolean> } }).gSaveBlock1Ptr?.flags;
  if (!flags?.['FLAG_MIRAGE_TOWER_VISIBLE']) return;
  // 1:1 décomp : check sMirageTowerPulseBlend != NULL. Notre engine = toujours NULL.
  // → return (no-op). Si Mirage Tower port futur, ajouter DestroyTask + Unmark/Unload.
}

function CameraMove(deltaX: number, deltaY: number): boolean {
  // 1:1 décomp `gCamera.active = FALSE;` (fieldmap.c:654) — reset chaque tile
  // boundary. Set TRUE seulement si cross-border détecté.
  gCamera.active = false;

  // 1:1 décomp `GetPostCameraMoveMapBorderId(x, y) = GetMapBorderIdAt(pos.x +
  // MAP_OFFSET + x, pos.y + MAP_OFFSET + y)`. Décomp's `pos` est en LOGICAL
  // coords donc `pos + MAP_OFFSET` = playerGBackup. + delta = post-step.
  //
  // Notre conv : _camPos = playerLogical (= 1:1 décomp gSaveBlock1Ptr->pos).
  //   playerGBackupX = _camPos.x + MAP_OFFSET (= 7)
  //   playerGBackupY = _camPos.y + MAP_OFFSET (= 7)
  //   post-step playerGBackup{X,Y} = _camPos + (7, 7) + delta.
  const predictedPlayerGBX = _camPos.x + 7 + deltaX;
  const predictedPlayerGBY = _camPos.y + 7 + deltaY;
  const direction = GetMapBorderIdAt(predictedPlayerGBX, predictedPlayerGBY);

  // CONNECTION_NONE (0) ou CONNECTION_INVALID (-1) : pas de border cross.
  // Migré vers imports decomp-data global-data.ts (cleanup B7).
  if (direction === CONNECTION_NONE || direction === CONNECTION_INVALID) {
    // 1:1 décomp `pos += delta` (fieldmap.c:658-659).
    _camPos.x += deltaX;
    _camPos.y += deltaY;
    // 1:1 décomp : pas de flag — pos est mutée ici, PlayerStep skip son apply
    // (= retiré). CameraMove est seule source de pos += delta.  // signal PlayerStep step end : skip son delta apply.
    return false;
  }

  // Border crossed : find la connexion correspondante.
  const connection = GetIncomingConnection(direction, _camPos.x, _camPos.y);
  if (!connection) {
    // Fallback safe : pas de connexion → comportement non-cross.
    _camPos.x += deltaX;
    _camPos.y += deltaY;
    // 1:1 décomp : pas de flag — pos est mutée ici, PlayerStep skip son apply
    // (= retiré). CameraMove est seule source de pos += delta.
    return false;
  }

  // 1:1 décomp `CameraMove` cross-border path (fieldmap.c:649-678) :
  //   SaveMapView();
  //   ClearMirageTowerPulseBlendEffect();
  //   old_x = pos.x; old_y = pos.y;
  //   connection = GetIncomingConnection(direction, pos.x, pos.y);
  //   SetPositionFromConnection(connection, direction, x, y);   ← écrit pos = border
  //   LoadMapFromCameraTransition(connection->mapGroup, connection->mapNum);
  //   gCamera.active = TRUE;
  //   gCamera.x = old_x - pos.x;  // delta logique pour translater NPCs
  //   gCamera.y = old_y - pos.y;
  //   pos.x += x; pos.y += y;     ← post-step (1:1 décomp)
  //   MoveMapViewToBackup(direction);
  //
  // PHASE A.2 : pos = gSaveBlock1Ptr.pos source unique (= alias _camPos.x/y et
  // gPlayerAvatar.x/y via Proxy + getter dynamique).

  SaveMapView();  // 1:1 décomp no-args, lit gSaveBlock1Ptr.pos directement.
  // 1:1 STRICT décomp fieldmap.c:664 : ClearMirageTowerPulseBlendEffect().
  // Body 1:1 (mirage_tower.c:303-317) : check Route 111 + FLAG_MIRAGE_TOWER_VISIBLE
  // + sMirageTowerPulseBlend non-null → DestroyTask + Unmark/Unload palettes.
  // Notre port : early-return (= condition Route 111 false hors Route 111, et
  // PulseBlend palette system pas porté = sMirageTowerPulseBlend jamais initialisé).
  // Conforme 1:1 strict : skip si conditions non remplies (= identique au décomp
  // qui early-return aussi).
  _clearMirageTowerPulseBlendEffect();

  const oldX = _camPos.x;
  const oldY = _camPos.y;

  // 1:1 décomp `SetPositionFromConnection(connection, direction, x, y)` (fieldmap
  // .c:624). ÉCRIT gSaveBlock1Ptr.pos = border (= pre-step value). Via Proxy +
  // getter dynamique, _camPos et gPlayerAvatar.x/y reflètent automatiquement.
  SetPositionFromConnection(connection, direction, deltaX, deltaY);

  // LoadMapFromCameraTransition : sync swap gMapHeader + InitMap + secondary
  // tileset + palette. APRÈS ça, gBackupMapLayout = NEW map's data.
  TransitionToConnection(connection);

  // 1:1 décomp `gCamera.active = TRUE; gCamera.x = old_x - pos.x;` etc.
  // À CE moment, pos est encore à PRE-step (= border value).
  gCamera.active = true;
  gCamera.x = oldX - _camPos.x;
  gCamera.y = oldY - _camPos.y;

  // 1:1 décomp `pos.x += x; pos.y += y;` (fieldmap.c:673-674) → POST-step value.
  // PHASE B' : on apply ce delta 1:1 décomp ici (= pos devient post-step).
  // PlayerStep / movement-system step ends NE TOUCHENT PAS pos (= 1:1 strict
  // décomp `field_player_avatar.c`). CameraMove est la seule source de mutation.
  _camPos.x += deltaX;
  _camPos.y += deltaY;

  // 1:1 décomp `MoveMapViewToBackup(direction)` no-args, lit gSaveBlock1Ptr.pos
  // POST-step (= 1:1 strict).
  MoveMapViewToBackup(direction);

  // Signal pending pour scene-level handling (BGM, status, NPC orchestrator).
  // Le swap visuel (BG buffer) est maintenant TOTALEMENT fait par CameraMove.
  // RedrawMapSlicesForCameraUpdate qui suit dans CameraUpdate utilisera NEW
  // gBackupMapLayout pour son partial redraw = strict 1:1 décomp.
  _pendingConnection = {
    direction,
    connection,
    oldCamX: oldX,
    oldCamY: oldY,
    deltaX,
    deltaY,
  };
  return true;
}

/** 1:1 décomp `CameraUpdate()` (field_camera.c:360-426).
 *  À call chaque frame du main overworld loop. Lit gFieldCamera.movementSpeedX/Y
 *  (= driven par player sprite ou input direct), accumule sub-tile offset, et
 *  trigger redraw quand on traverse un tile boundary. */
export function CameraUpdate(): void {
  // Optional callback (= pour CameraObject auto-follow d'un sprite).
  if (gFieldCamera.callback) gFieldCamera.callback(gFieldCamera);
  const movementSpeedX = gFieldCamera.movementSpeedX;
  const movementSpeedY = gFieldCamera.movementSpeedY;
  let deltaX = 0;
  let deltaY = 0;
  const curMovementOffsetX = gFieldCamera.x;
  const curMovementOffsetY = gFieldCamera.y;

  // 1:1 décomp : detect tile boundary crossing
  if (curMovementOffsetX === 0 && movementSpeedX !== 0) {
    deltaX = movementSpeedX > 0 ? 1 : -1;
  }
  if (curMovementOffsetY === 0 && movementSpeedY !== 0) {
    deltaY = movementSpeedY > 0 ? 1 : -1;
  }
  if (curMovementOffsetX !== 0 && curMovementOffsetX === -movementSpeedX) {
    deltaX = movementSpeedX > 0 ? 1 : -1;
  }
  // 1:1 décomp BUG (preserved 1:1) : décomp utilise deltaX au lieu de deltaY
  // pour ce branch (cf. field_camera.c:401-405). On reproduit le bug exactement.
  if (curMovementOffsetY !== 0 && curMovementOffsetY === -movementSpeedY) {
    deltaX = movementSpeedY > 0 ? 1 : -1;
  }

  // Accumulate sub-tile pixel offset modulo 16.
  // 1:1 décomp : utilise modulo C signé (= -2 % 16 = -2, pas 14). Critique
  // pour que les conditions `curOff == -movementSpeed` ne matchent JAMAIS
  // pendant un scroll constant. Si on normalise positif (= ((x % 16) + 16) % 16),
  // les conditions firent des deltaX EXTRA mid-tile → wiggle bug.
  gFieldCamera.x = (gFieldCamera.x + movementSpeedX) % 16;
  gFieldCamera.y = (gFieldCamera.y + movementSpeedY) % 16;

  if (deltaX !== 0 || deltaY !== 0) {
    CameraMove(deltaX, deltaY);
    // 1:1 décomp `UpdateObjectEventsForCameraUpdate(deltaX, deltaY)`
    // (field_camera.c:416). Orchestrate UpdateObjectEventCoordsForCameraUpdate
    // (= translate NPCs si gCamera.active) + TrySpawnObjectEvents (= bounds
    // check + spawn) + RemoveObjectEventsOutsideView (= cleanup).
    //
    // CRITIQUE : appelé UNIQUEMENT au tile boundary (= deltaX/Y non-zero) =
    // 1:1 décomp. Élimine le mid-step capture drift qu'on avait avec per-frame
    // TrySpawn (= NPCs spawnés mid-step capturaient stale cam.y/offY).
    //
    // Skip si _pendingConnection (= cross-border) : la scène handleConnection
    // Transition appellera l'orchestrator après le swap gMapHeader, sinon
    // TrySpawn iterait les templates de l'OLD map.
    if (!_pendingConnection) {
      try {
        callUpdateObjectEventsForCameraUpdate(getRuntime(), deltaX, deltaY);
      } catch (e) {
        // Runtime not yet set au boot très early → no-op safe.
        void e;
      }
    }
    // Dette R3 doc : 1:1 décomp `SetBerryTreesSeen()` (berry.c:1322) cross-border :
    // iter gObjectEvents avec movementType MOVEMENT_TYPE_BERRY_TREE_GROWTH dans
    // rect cam (left .. left+14, top+3 .. top+3+8) → AllowBerryTreeGrowth(treeId).
    // Demande wire BERRY_TREE_GROWTH movement type + helper AllowBerryTreeGrowth
    // (stopGrowth = false) — pas encore câblé (dépendance de feature berry trees).
    AddCameraTileOffset(sFieldCameraOffset, deltaX * 2, deltaY * 2);
    _trace('boundary_cross', {
      deltaX, deltaY,
      newCamPos: { ..._camPos },
      newTileOffset: { x: sFieldCameraOffset.xTileOffset, y: sFieldCameraOffset.yTileOffset },
    });
    // 1:1 décomp : RedrawMapSlice* partial redraw (= une seule colonne par
    // scroll). Critique : la décomp exploite le BG wrap pour que la col
    // qui était view col 0 reste visible à GAUCHE de l'écran pendant le
    // step suivant (= naturellement view col -1 visuellement). Un full
    // DrawWholeMapView casse cette continuité visuelle car overwrite ces
    // cols avec le buffer col logique (= mapCol pos.x+15) au lieu de
    // mapCol pos.x-1.
    //
    // Phase 4.9 strict 1:1 décomp : CameraMove fait maintenant le SWAP complet
    // (= TransitionToConnection + MoveMapViewToBackup) sync au cross. À ce
    // point, gBackupMapLayout = NEW map. RedrawMapSlicesForCameraUpdate utilise
    // NEW gBackupMapLayout → 1:1 décomp comportement. Plus besoin de skip.
    RedrawMapSlicesForCameraUpdate(_camPos.x, _camPos.y, deltaX * 2, deltaY * 2);
  }

  AddCameraPixelOffset(sFieldCameraOffset, movementSpeedX, movementSpeedY);
  gTotalCamera.pixelOffsetX -= movementSpeedX;
  gTotalCamera.pixelOffsetY -= movementSpeedY;
}

// ─── Camera panning (= bike effect, weather, etc.) ──────────────────────────

/** 1:1 décomp `SetCameraPanning(horizontal, vertical)` (field_camera.c:442-446). */
export function SetCameraPanning(horizontal: number, vertical: number): void {
  sHorizontalCameraPan = horizontal;
  sVerticalCameraPan = vertical + 32;
}

/** Accessors pour camera pan offset (= used par sprite render to make player +
 *  NPCs shake WITH the camera during truck cinematic etc.). 1:1 décomp :
 *  les sprites lisent `gSpriteCoordOffsetX/Y` qui = camera pan + total camera
 *  pixel offset. Notre simplification : juste expose le pan ici. */
export function GetCameraPanX(): number { return sHorizontalCameraPan; }
export function GetCameraPanY(): number { return sVerticalCameraPan - 32; }

// ─── Public state accessors (pour debug + intégration TestOverworldScene) ───

export function GetCameraOffsetState(): Readonly<FieldCameraOffset> {
  return sFieldCameraOffset;
}

/** Retourne le baseline BG_VOFS (= sVerticalCameraPan + 8) sans yPixelOffset.
 *  Utile pour sprite engines qui doivent compenser BG_VOFS pour aligner sprites
 *  sur BG (= screen_y_sprite = world_y_sprite - BG_VOFS_baseline + offY scroll).
 *  1:1 décomp `gSpriteCoordOffsetY` proxy. */
export function GetBgVofsBaseline(): number {
  return sVerticalCameraPan + 8;
}

/** Force le redraw de toute la map view au prochain flush. Utile pour reset
 *  quand on charge une nouvelle map (= clear avant DrawWholeMapView). */
export function MarkBgRedrawPending(): void {
  sFieldCameraOffset.copyBGToVRAM = true;
}

export function IsBgRedrawPending(): boolean {
  return sFieldCameraOffset.copyBGToVRAM;
}

export function ClearBgRedrawPending(): void {
  sFieldCameraOffset.copyBGToVRAM = false;
}

// Phase 4.10 fix bug 1 : register hook map-loader → on connections refilled
// après async prefetch, redraw full map view + flush BG. Sinon les borders
// reste vide visually même si sBackupMapData a été refilled.
setRedrawWholeMapViewHook(() => {
  DrawWholeMapView();
});
