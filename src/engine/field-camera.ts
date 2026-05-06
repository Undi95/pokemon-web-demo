/**
 * field-camera.ts — moteur scrolling overworld 1:1 décomp field_camera.c.
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/field_camera.c`
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
import type { DecompRuntime } from './decomp-runtime';
import {
  type MapLayout,
  DrawMetatile,
  MapGridGetMetatileIdAt,
  MapGridGetMetatileLayerTypeAt,
  NUM_METATILES_IN_PRIMARY,
  NUM_METATILES_TOTAL,
  NUM_TILES_PER_METATILE,
  gMapHeader,
} from './map-loader';
import {
  REG_OFFSET_BG1HOFS, REG_OFFSET_BG1VOFS,
  REG_OFFSET_BG2HOFS, REG_OFFSET_BG2VOFS,
  REG_OFFSET_BG3HOFS, REG_OFFSET_BG3VOFS,
} from './decomp-runtime';

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
let sVerticalCameraPan = 0;

/** 1:1 décomp `COMMON_DATA u16 gTotalCameraPixelOffsetX/Y` (field_camera.c:43-44).
 *  Tracking du déplacement total pour positionner les sprites overworld
 *  (= gSpriteCoordOffsetX/Y dérivé). */
export const gTotalCamera = { pixelOffsetX: 0, pixelOffsetY: 0 };

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

// ─── 1:1 décomp FieldUpdateBgTilemapScroll (field_camera.c:74-86) ───────────

/** Écrit les BG hofs/vofs des layers BG1/BG2/BG3 selon le pixel offset courant.
 *
 *  NB : décomp ajoute `+ 8` à yVOFS (field_camera.c:78). Cet offset sert à
 *  laisser de la place pour la textbox dialogue en bas de l'écran (= 2 rows
 *  reservés). Pour Phase 4.3 (= pas encore de dialogue), on omet le +8 pour
 *  garder le sprite + BG parfaitement alignés sur la grid. Phase 4.5 (=
 *  script engine + dialogue) le réintroduira avec ajustement sprite y. */
export function FieldUpdateBgTilemapScroll(rt: DecompRuntime): void {
  const r5 = sFieldCameraOffset.xPixelOffset + sHorizontalCameraPan;
  const r4 = sVerticalCameraPan + sFieldCameraOffset.yPixelOffset;

  rt.SetGpuReg(REG_OFFSET_BG1HOFS, r5 & 0x1FF);
  rt.SetGpuReg(REG_OFFSET_BG1VOFS, r4 & 0x1FF);
  rt.SetGpuReg(REG_OFFSET_BG2HOFS, r5 & 0x1FF);
  rt.SetGpuReg(REG_OFFSET_BG2VOFS, r4 & 0x1FF);
  rt.SetGpuReg(REG_OFFSET_BG3HOFS, r5 & 0x1FF);
  rt.SetGpuReg(REG_OFFSET_BG3VOFS, r4 & 0x1FF);
}

/** 1:1 décomp `GetCameraOffsetWithPan(x, y)` (field_camera.c:88-92).
 *  Retourne le pixel offset + pan (= utilisé par sprite positioning). */
export function GetCameraOffsetWithPan(): { x: number; y: number } {
  return {
    x: sFieldCameraOffset.xPixelOffset + sHorizontalCameraPan,
    y: sFieldCameraOffset.yPixelOffset + sVerticalCameraPan + 8,
  };
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

/** 1:1 décomp `DrawWholeMapView()` (field_camera.c:94-98).
 *  Wrapper qui prend la position courante du player (= camera focus). */
export function DrawWholeMapView(camX: number, camY: number, mapLayout: MapLayout): void {
  DrawWholeMapViewInternal(camX, camY, mapLayout);
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

// ─── 1:1 décomp CameraUpdate (field_camera.c:360-426) ───────────────────────

/** Camera position (= top-left metatile of current view, en gBackupMapLayout coords).
 *  Tracking interne pour Phase 4.2 — Phase 4.3 le wirera sur gSaveBlock1Ptr->pos. */
const _camPos = { x: 0, y: 0 };

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

export function SetCameraTopLeftCoords(x: number, y: number): void {
  _camPos.x = x;
  _camPos.y = y;
}

/** 1:1 décomp `CameraMove(x, y)` (fieldmap.c:649-678) — version simplifiée Phase 4.2.
 *  Phase 4.6 (= warp / connections) implémentera le branch GetIncomingConnection.
 *  Pour l'instant : juste shift _camPos par (x, y) en metatiles. */
function CameraMove(deltaX: number, deltaY: number): boolean {
  _camPos.x += deltaX;
  _camPos.y += deltaY;
  return false;  // = pas de connection traversée
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
    // UpdateObjectEventsForCameraUpdate(deltaX, deltaY);  // TODO Phase 4.4
    // SetBerryTreesSeen();                                // TODO Phase 4.7
    AddCameraTileOffset(sFieldCameraOffset, deltaX * 2, deltaY * 2);
    _trace('boundary_cross', {
      deltaX, deltaY,
      newCamPos: { ..._camPos },
      newTileOffset: { x: sFieldCameraOffset.xTileOffset, y: sFieldCameraOffset.yTileOffset },
    });
    // 1:1 décomp : RedrawMapSlice* partial redraw (= une seule colonne par
    // scroll). Évite flicker du full DrawWholeMapView. Le bug "stale col
    // après wiggle non-symétrique" est masqué par 8-frame turn-in-place
    // dans le player avatar (= rate de direction change limité).
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

// ─── Public state accessors (pour debug + intégration TestOverworldScene) ───

export function GetCameraOffsetState(): Readonly<FieldCameraOffset> {
  return sFieldCameraOffset;
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
