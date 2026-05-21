/**
 * region-map.ts — Port 1:1 décomp `field_region_map.c` + `region_map.c`
 *                 (= worldmap HOENN affichée depuis le metatile MB_REGION_MAP).
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/field_region_map.c` (= FieldInitRegionMap +
 *     MCB2_FieldUpdateRegionMap state machine 7 états)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/region_map.c` (= InitRegionMap +
 *     ProcessRegionMapInput_Full + MoveRegionMapCursor_Full + constants)
 *
 * Architecture : overlay Phaser GameObjects au-dessus de la scene TestOverworld
 * (= GameObjects depth high, scene non-paused, input via Phaser keys driven by
 * gMain.heldKeys/newKeys). Aspect visuel 1:1 décomp (= même PNG src, cursor,
 * player icon, title, mapsec name window) ; aspect runtime input 1:1 (= same
 * heldKeys check D-pad + newKeys check A/B comme décomp).
 *
 * Flow :
 *   1. `OpenRegionMap()` add GameObjects à la scene Phaser (= Image map +
 *      Sprite cursor + Image player icon + Text title + Text mapsec name)
 *   2. `TickRegionMap()` polled chaque frame depuis TestOverworldScene main loop :
 *      - D-pad HELD → cursor move avec throttle 4 frames
 *      - A/B NEW → close + SignalWaitState
 *   3. `CloseRegionMap()` destroys GameObjects, restore field
 *
 * Constants 1:1 décomp region_map.c:41-46 :
 *   MAP_WIDTH = 28, MAP_HEIGHT = 15
 *   MAPCURSOR_X_MIN = 1, MAPCURSOR_X_MAX = 28 (= 1 + 28 - 1)
 *   MAPCURSOR_Y_MIN = 2, MAPCURSOR_Y_MAX = 16 (= 2 + 15 - 1)
 *
 * Cursor position : pixel = (cursorPosX * 8, cursorPosY * 8) (= tile coords ×8).
 * Carte affichée plein écran GBA 240×160 (= scaled à canvas display).
 */

import type Phaser from 'phaser';
import { SignalWaitState } from './script-opcodes';
import { gameState } from './game-state';
import { gMapHeader } from './map-loader';
import { getMapNameFr } from '../data/map-names-fr';
import { getString } from './gba-strings';
import { getRuntime, getAsset } from './decomp-globals';
import { LockPlayerFieldControls, UnlockPlayerFieldControls } from './script-runtime';
import {
  preloadRegionMapData,
  getRegionMapEntries,
  GetMapSecIdAt,
  GetMapName,
  GetMapsecType,
  CorrectSpecialMapSecId,
  MAPSECTYPE_NONE,
} from './region-map-data';

// ─── Constants 1:1 décomp region_map.c:41-46 ───────────────────────────────

const MAP_WIDTH = 28;
const MAP_HEIGHT = 15;
const MAPCURSOR_X_MIN = 1;
const MAPCURSOR_Y_MIN = 2;
const MAPCURSOR_X_MAX = MAPCURSOR_X_MIN + MAP_WIDTH - 1;
const MAPCURSOR_Y_MAX = MAPCURSOR_Y_MIN + MAP_HEIGHT - 1;

// 1:1 décomp `enum { MAP_INPUT_NONE, MAP_INPUT_MOVE_START, MAP_INPUT_MOVE_CONT,
//   MAP_INPUT_MOVE_END, MAP_INPUT_A_BUTTON, MAP_INPUT_B_BUTTON }`.
// Used dans le port de ProcessRegionMapInput_Full pour distinguer les events.

// GBA virtual screen size (= 240×160). Le canvas Phaser scale ces coords à la
// taille d'affichage actuelle.
const GBA_SCREEN_WIDTH = 240;
const GBA_SCREEN_HEIGHT = 160;

// Z-depth pour les GameObjects overlay (= au-dessus de tout le field).
const REGION_MAP_DEPTH = 2000;

// ─── State (= 1:1 décomp `struct RegionMap`) ──────────────────────────────
// Stocké sur globalThis pour partager entre instances de module (= Vite HMR
// peut créer 2 instances quand on mixe static + dynamic import → sIsOpen
// désynchronisé). Le singleton globalThis garantit que TickRegionMap et
// OpenRegionMap lisent/écrivent le même état même si chargés via deux paths.

interface RegionMapGlobalState {
  isOpen: boolean;
  /** Mode VIEW (= field_region_map.c) vs FLY (= region_map.c CB2_FlyMap). */
  mode: 'VIEW' | 'FLY';
  cursorPosX: number;
  cursorPosY: number;
  cursorMovementFrameCounter: number;
  /** 1:1 décomp sRegionMapCursorAnim1 ANIMCMD_FRAME(0, 20) FRAME(4, 20) JUMP(0).
   *  Counter 0..39 : 0..19 = frame 0 visible, 20..39 = frame 1 visible. */
  cursorAnimFrameCounter: number;
  currentMapsecName: string;
  mapImage: Phaser.GameObjects.Image | null;
  cursorSprite: Phaser.GameObjects.Image | null;
  playerIconSprite: Phaser.GameObjects.Image | null;
  titleWindow: Phaser.GameObjects.Container | null;
  mapsecWindow: Phaser.GameObjects.Container | null;
  mapsecText: Phaser.GameObjects.Text | null;
  assetsLoaded: boolean;
  assetsLoading: boolean;
}

function _state(): RegionMapGlobalState {
  const g = globalThis as Record<string, unknown>;
  if (!g.__regionMapState) {
    g.__regionMapState = {
      isOpen: false,
      mode: 'VIEW',
      cursorPosX: MAPCURSOR_X_MIN,
      cursorPosY: MAPCURSOR_Y_MIN,
      cursorMovementFrameCounter: 0,
      cursorAnimFrameCounter: 0,
      currentMapsecName: '',
      mapImage: null,
      cursorSprite: null,
      playerIconSprite: null,
      titleWindow: null,
      mapsecWindow: null,
      mapsecText: null,
      assetsLoaded: false,
      assetsLoading: false,
    } as RegionMapGlobalState;
  }
  return g.__regionMapState as RegionMapGlobalState;
}

// ─── API publique ──────────────────────────────────────────────────────────

export function IsRegionMapOpen(): boolean {
  return _state().isOpen;
}

/** Mode d'ouverture de la carte :
 *  - `'VIEW'`  : 1:1 décomp `field_region_map.c` (= métatile wall map au PC).
 *    A/B ferme la carte sans rien sélectionner. Carte non-zoomable.
 *  - `'FLY'`   : 1:1 décomp `region_map.c` CB2_FlyMap (= ouverture via HM02 Fly
 *    depuis party menu). A confirme la destination, B annule. Stub posé pour
 *    un raccord ultérieur (= CreateFlyDestIcons + ConfirmFlyDestination).
 *    Pour l'instant, comportement identique à VIEW (= aucun script ne déclenche
 *    encore la map en mode Fly dans la démo).
 */
export type RegionMapMode = 'VIEW' | 'FLY';

/** 1:1 décomp `FieldInitRegionMap(callback)` (field_region_map.c:92-99) :
 *    SetMainCallback2(MCB2_InitRegionMapRegisters);
 *  + état 0 de FieldUpdateRegionMap : InitRegionMap + CreateRegionMapPlayerIcon +
 *  CreateRegionMapCursor.
 *
 *  Async pour pouvoir preload les données décomp (= region_map_data.json) avant
 *  d'initialiser le cursor au mapsec courant 1:1.
 *
 *  @param mode 'VIEW' par défaut (= field_region_map.c). 'FLY' pour future
 *              HM02 Fly transition (= stub, voir RegionMapMode). */
export async function OpenRegionMap(mode: RegionMapMode = 'VIEW'): Promise<void> {
  const st = _state();
  if (st.isOpen) return;
  // Preload data décomp avant de lookup gRegionMapEntries.
  await preloadRegionMapData();
  st.isOpen = true;
  st.mode = mode;
  // 1:1 décomp `FieldCB_DefaultWarpExit` pattern + `field_region_map.c`
  // implicit lock : pendant que la carte est ouverte, le player overworld
  // ne doit pas pouvoir bouger (= sinon il marche derrière l'overlay).
  // Le décomp atteint cela en swappant CB2 entièrement (= le main loop
  // overworld n'est plus exécuté). Notre overlay garde le main loop OW
  // actif → on lock les controls pour empêcher PlayerStep input D-pad.
  // Unlock dans CloseRegionMap (= 1:1 case 6 `SetMainCallback2(callback)`
  // qui restore le contrôle field).
  LockPlayerFieldControls();
  // 1:1 décomp `InitMapBasedOnPlayerLocation` (= state 5 LoadRegionMapGfx) :
  // cursor positionné au mapsec du player + playerIconSpritePos = cursorPos.
  const playerLoc = _getPlayerMapsecLocation();
  st.cursorPosX = playerLoc.x;
  st.cursorPosY = playerLoc.y;
  // 1:1 décomp : currentMapsecName = lookup direct via GetMapName(mapSecId).
  st.currentMapsecName = GetMapName(playerLoc.mapSecId) || _getCurrentMapsecName();
  st.cursorMovementFrameCounter = 0;
  st.cursorAnimFrameCounter = 0;
  _spawnGameObjects(playerLoc);
}

/** 1:1 décomp `FreeRegionMapIconResources` (region_map.c:627-641) + state 6
 *  FieldUpdateRegionMap : destroy sprites + free windows + restore callback.
 *
 *  Pour mode FLY (= stub) : si une callback `_flyCallback` était set par
 *  l'appelant et que la fermeture a été déclenchée par A_BUTTON (= confirm),
 *  on appellerait `_flyCallback(selectedMapSecId)` pour exécuter le warp Fly.
 *  Pas encore branché — le décomp `CB_ExitFlyMap` consulte `sFlyMap->
 *  choseFlyLocation` pour décider warp vs cancel.
 *
 *  @param confirmed (mode FLY only) true si A_BUTTON a fermé (= confirm),
 *                   false si B_BUTTON (= cancel). VIEW ignore. */
export function CloseRegionMap(confirmed = false): void {
  const st = _state();
  if (!st.isOpen) return;
  // 1:1 décomp stub Fly : si mode FLY + confirmed + mapSec valide → fire le
  // callback Fly transition. Pour la démo, juste log et continue.
  if (st.mode === 'FLY' && confirmed) {
    const targetMapSec = GetMapSecIdAt(st.cursorPosX, st.cursorPosY);
    if (_flyCallback) {
      _flyCallback(targetMapSec);
    } else {
      console.log(`[region-map] FLY stub : would warp to ${targetMapSec} (no callback registered)`);
    }
  }
  st.isOpen = false;
  st.mode = 'VIEW';  // reset
  _destroyGameObjects();
  // 1:1 décomp `field_region_map.c` case 6 + `FieldCB_DefaultWarpExit` pattern :
  // restore field controls (= 1:1 `SetMainCallback2(callback)` qui ramène le
  // main loop OW dans son état "field actif"). Pas d'unlock fait depuis le
  // décomp lui-même (= CB2 swap restore tout), donc on doit unlock ici notre
  // proxy lock posé par OpenRegionMap.
  UnlockPlayerFieldControls();
  // 1:1 décomp `SetMainCallback2(sFieldRegionMapHandler->callback)` (= retour field).
  // Notre version : SignalWaitState pour unblock le script `special FieldShowRegionMap`.
  SignalWaitState();
}

// ─── Fly stub (= 1:1 décomp `SetFlyMapCallback`, region_map.c:1700) ─────────

type FlyCallback = (targetMapSecId: string) => void;
let _flyCallback: FlyCallback | null = null;

/** 1:1 décomp `SetFlyMapCallback(callback)` (region_map.c:1700) : enregistre
 *  la callback à exécuter quand le user confirme une destination Fly. Stub
 *  posé pour usage futur (= HM02 Fly depuis party menu, ou
 *  `Special_DoFlyMap`). Pour l'instant aucun call site dans la démo. */
export function SetFlyMapCallback(callback: FlyCallback | null): void {
  _flyCallback = callback;
}

/** Tick called per-frame depuis MainCB2_Overworld (= overlay actif).
 *  1:1 décomp `MCB2_FieldUpdateRegionMap` state 4 (input + cursor move) +
 *  cursor anim blink 2-frame. */
export function TickRegionMap(): void {
  const st = _state();
  if (!st.isOpen) return;
  const rt = getRuntime();
  if (!rt) return;
  const heldKeys = rt.gMain.heldKeys;
  const newKeys = rt.gMain.newKeys;

  // 1:1 décomp `sRegionMapCursorAnim1` (region_map.c:218-223) :
  //   ANIMCMD_FRAME(0, 20) ANIMCMD_FRAME(4, 20) ANIMCMD_JUMP(0)
  // Cursor blink alternant entre frame 0 (tile 0) et frame 1 (tile 4 = 16×16
  // tiles décalées) toutes les 20 frames. Pattern total = 40 frames (= 0..19
  // visible frame 0, 20..39 visible frame 1).
  st.cursorAnimFrameCounter = (st.cursorAnimFrameCounter + 1) % 40;
  _updateCursorBlinkFrame();

  // 1:1 décomp `MAP_INPUT_A_BUTTON` / `MAP_INPUT_B_BUTTON` (region_map.c:675-682).
  // VIEW : A ou B ferme la carte (= field_region_map.c:180-183 case 4).
  // FLY  : A confirme la destination (= choseFlyLocation=TRUE), B annule.
  if (newKeys & 0x01) {  // A_BUTTON
    CloseRegionMap(true);   // confirmed
    return;
  }
  if (newKeys & 0x02) {  // B_BUTTON
    CloseRegionMap(false);  // cancelled
    return;
  }

  // 1:1 décomp `cursorMovementFrameCounter` (region_map.c:685, 695-696) :
  // throttle 4 frames entre chaque cursor move tile.
  if (st.cursorMovementFrameCounter > 0) {
    st.cursorMovementFrameCounter--;
    return;
  }

  // 1:1 décomp `ProcessRegionMapInput_Full` (region_map.c:655-674) :
  // JOY_HELD DPAD_UP/DOWN/LEFT/RIGHT + bounds check.
  let dx = 0;
  let dy = 0;
  if ((heldKeys & 0x40) && st.cursorPosY > MAPCURSOR_Y_MIN) dy = -1;  // UP
  if ((heldKeys & 0x80) && st.cursorPosY < MAPCURSOR_Y_MAX) dy = +1;  // DOWN
  if ((heldKeys & 0x20) && st.cursorPosX > MAPCURSOR_X_MIN) dx = -1;  // LEFT
  if ((heldKeys & 0x10) && st.cursorPosX < MAPCURSOR_X_MAX) dx = +1;  // RIGHT

  if (dx !== 0 || dy !== 0) {
    st.cursorPosX += dx;
    st.cursorPosY += dy;
    st.cursorMovementFrameCounter = 4;  // 1:1 décomp throttle
    _updateCursorPosition();
    // 1:1 décomp `MoveRegionMapCursor_Full` (region_map.c:715-721) : lookup
    // mapSecId à la nouvelle position + update mapSecName display.
    _updateMapsecNameDisplay();
  }
}

// ─── Internal helpers ──────────────────────────────────────────────────────

/** 1:1 décomp `InitMapBasedOnPlayerLocation` (region_map.c:968-1121). Détermine
 *  le mapsec courant du player + ses coords (cursorPosX/Y) sur la worldmap.
 *
 *  Le décomp utilise un switch sur `GetMapTypeByGroupAndId(mapGroup, mapNum)` :
 *  - TOWN/CITY/ROUTE/UNDERWATER/OCEAN_ROUTE → mapSec = gMapHeader.regionMapSectionId
 *  - UNDERGROUND/UNKNOWN → mapSec = escapeWarp's map (cave indoor → exit town)
 *  - SECRET_BASE → mapSec = dynamicWarp's map
 *  - INDOOR → mapSec = current OR escapeWarp si MAPSEC_DYNAMIC
 *
 *  Pour notre démo, on simplifie : lookup direct via `gMapHeader.regionMapSectionId`.
 *  Si en INDOOR (= bedroom 2F), regionMapSectionId = LITTLEROOT_TOWN (= la maison
 *  EST à Bourg-en-Vol). Pas besoin d'escapeWarp pour les early maps.
 *
 *  Le cursor est ensuite positionné à `gRegionMapEntries[mapSecId].x + MAPCURSOR_X_MIN`
 *  + .y + MAPCURSOR_Y_MIN (= conversion grille → cursor coords). */
function _getPlayerMapsecLocation(): { x: number; y: number; mapSecId: string } {
  const rawMapSecId = gMapHeader?.regionMapSectionId ?? '';
  if (!rawMapSecId) return { x: 15, y: 9, mapSecId: 'MAPSEC_NONE' };
  // 1:1 décomp `LoadRegionMapGfx` case 5 (region_map.c:579) :
  //   mapSecId = CorrectSpecialMapSecId_Internal(mapSecId);
  // Mappe les mapsecs spéciaux (= UNDERWATER, AQUA_HIDEOUT, PETALBURG_WOODS,
  // MT_PYRE, etc.) vers leur parent affiché sur la worldmap. Important pour les
  // caves/indoors qui hériteraient sinon d'une coord (0, 0) inutilisable.
  const mapSecId = CorrectSpecialMapSecId(rawMapSecId);
  // 1:1 décomp `gRegionMapEntries[mapSecId]` lookup.
  try {
    const entries = getRegionMapEntries();
    const entry = entries.get(mapSecId);
    if (entry) {
      // 1:1 décomp region_map.c:1119-1120 : cursor = entry.x + MAPCURSOR_X_MIN.
      // MAPCURSOR_X_MIN=1, MAPCURSOR_Y_MIN=2.
      return {
        x: entry.x + MAPCURSOR_X_MIN,
        y: entry.y + MAPCURSOR_Y_MIN,
        mapSecId,
      };
    }
  } catch (e) {
    // Data not preloaded → fallback.
    void e;
  }
  return { x: 15, y: 9, mapSecId };
}

function _getCurrentMapsecName(): string {
  const mapId = gMapHeader?.id ?? '';
  const secId = gMapHeader?.regionMapSectionId ?? mapId;
  // 1:1 décomp `GetMapName(dest, mapSecId, padLength)` (region_map.c:1568) :
  // lookup gRegionMapEntries[mapSecId].name.
  try {
    const name = GetMapName(secId);
    if (name) return name;
  } catch (e) {
    void e;
  }
  return getMapNameFr(secId) || getMapNameFr(mapId) || 'HOENN';
}

function _getScene(): Phaser.Scene | null {
  return (globalThis as Record<string, unknown>).__phaserOverworldScene as Phaser.Scene | null;
}

/** 1:1 décomp state 0 + 1 de FieldUpdateRegionMap (field_region_map.c:144-161) :
 *  InitRegionMap + CreateRegionMapPlayerIcon + CreateRegionMapCursor +
 *  DrawStdFrameWithCustomTileAndPalette(WIN_TITLE) + WIN_MAPSEC_NAME +
 *  BeginNormalPaletteFade. */
function _spawnGameObjects(playerLoc: { x: number; y: number; mapSecId?: string }): void {
  const scene = _getScene();
  if (!scene) return;
  // Load assets dynamically si pas déjà chargés.
  _loadAssetsIfNeeded(scene, () => {
    const st = _state();
    const cam = scene.cameras.main;
    const viewW = cam.width;
    const viewH = cam.height;
    // Scaling factor : GBA virtual coords (240×160) → display canvas size.
    const sx = viewW / GBA_SCREEN_WIDTH;
    const sy = viewH / GBA_SCREEN_HEIGHT;

    // 1:1 décomp state 0 : LZ77UnCompVram(sRegionMapBg_GfxLZ, BG_CHAR_ADDR(2))
    // + LZ77UnCompVram(sRegionMapBg_TilemapLZ, BG_SCREEN_ADDR(28)).
    // Notre version : Phaser Image de map.png plein écran.
    st.mapImage = scene.add.image(0, 0, 'region_map_bg')
      .setOrigin(0, 0)
      .setDisplaySize(viewW, viewH)
      .setDepth(REGION_MAP_DEPTH)
      .setScrollFactor(0);

    // 1:1 décomp `CreateRegionMapCursor` (region_map.c:1418-1419) :
    //   sRegionMap->cursorSprite->x = 8 * sRegionMap->cursorPosX + 4;
    //   sRegionMap->cursorSprite->y = 8 * sRegionMap->cursorPosY + 4;
    // `sprite->x` est le CENTER coord (= GBA decomp convention, sprite.h
    // `struct Sprite`). Le rendu OAM top-left = `sprite->x + sprite->x2 +
    // sprite->centerToCornerVecX` (sprite.c:349). Pour un sprite 16×16,
    // centerToCornerVecX = -8 (= sprite_table_template setup).
    //
    // Donc top-left affiché = (8 * posX + 4) - 8 = 8 * posX - 4.
    // Pour notre Phaser sprite avec origin (0, 0) (= top-left), on assigne
    // directement `x = (posX * 8 - 4) * sx`.
    //
    // Le PNG source `cursor_small.png` est 16×32 (= 2 frames stackées). On crop
    // top half (= frame 0 idle) au spawn, puis tick alterne frame 0/1 via setCrop.
    const cursorPx = (st.cursorPosX * 8 - 4) * sx;
    const cursorPy = (st.cursorPosY * 8 - 4) * sy;
    st.cursorSprite = scene.add.image(cursorPx, cursorPy, 'region_map_cursor')
      .setOrigin(0, 0)
      .setCrop(0, 0, 16, 16)
      .setDisplaySize(16 * sx, 16 * sy)
      .setDepth(REGION_MAP_DEPTH + 2)
      .setScrollFactor(0);

    // 1:1 décomp `CreateRegionMapPlayerIcon` (region_map.c:1470-1471) :
    //   sRegionMap->playerIconSprite->x = sRegionMap->playerIconSpritePosX * 8 + 4;
    //   sRegionMap->playerIconSprite->y = sRegionMap->playerIconSpritePosY * 8 + 4;
    // Idem cursor : sprite->x est le center, top-left rendu = pos*8 - 4 pour
    // un sprite 16×16 (centerToCornerVecX = -8 via sRegionMapPlayerIconOam
    // SPRITE_SHAPE(16x16) + SPRITE_SIZE(16x16) → sprite.c:702 setup).
    // Sprite icon gender-aware au playerIconSpritePos (= same coords que cursor
    // au start, 1:1 décomp `playerIconSpritePosX = cursorPosX` LoadRegionMapGfx case 5).
    const playerKey = gameState.gender === 'MALE' ? 'region_map_brendan' : 'region_map_may';
    const playerPx = (playerLoc.x * 8 - 4) * sx;
    const playerPy = (playerLoc.y * 8 - 4) * sy;
    st.playerIconSprite = scene.add.image(playerPx, playerPy, playerKey)
      .setOrigin(0, 0)
      .setDisplaySize(16 * sx, 16 * sy)
      .setDepth(REGION_MAP_DEPTH + 1)
      .setScrollFactor(0);

    // 1:1 décomp state 1 (field_region_map.c:152-158) :
    //   DrawStdFrameWithCustomTileAndPalette(WIN_TITLE, FALSE, 0x27, 0xd);
    //   offset = GetStringCenterAlignXOffset(FONT_NORMAL, gText_Hoenn, 0x38);
    //   AddTextPrinterParameterized(WIN_TITLE, FONT_NORMAL, gText_Hoenn, offset, 1, 0, NULL);
    //   ScheduleBgCopyTilemapToVram(0);
    //   DrawStdFrameWithCustomTileAndPalette(WIN_MAPSEC_NAME, FALSE, 0x27, 0xd);
    //   PrintRegionMapSecName();
    // WIN_TITLE template = bg=0, left=22 top=1 w=7 h=2 → content 7×2 tiles +
    // frame border 1 tile around = 9×4 tiles render area at pos (21, 0).
    void _renderWindowToCanvas(scene, 7, 2, getString('gText_Hoenn') || 'HOENN', true, 'region_map_title');
    st.titleWindow = scene.add.image(21 * 8 * sx, 0 * 8 * sy, 'region_map_title')
      .setOrigin(0, 0)
      .setDisplaySize(9 * 8 * sx, 4 * 8 * sy)
      .setDepth(REGION_MAP_DEPTH + 3)
      .setScrollFactor(0) as unknown as Phaser.GameObjects.Container;

    // WIN_MAPSEC_NAME template = bg=0, left=17 top=17 w=12 h=2 → content 12×2
    // + frame border = 14×4 tiles at pos (16, 16).
    void _renderWindowToCanvas(scene, 12, 2, st.currentMapsecName, false, 'region_map_mapsec');
    st.mapsecWindow = scene.add.image(16 * 8 * sx, 16 * 8 * sy, 'region_map_mapsec')
      .setOrigin(0, 0)
      .setDisplaySize(14 * 8 * sx, 4 * 8 * sy)
      .setDepth(REGION_MAP_DEPTH + 3)
      .setScrollFactor(0) as unknown as Phaser.GameObjects.Container;
    // Stocke ref pour update au cursor move (= re-render canvas avec nouveau text).
    st.mapsecText = null;  // = pas de text Phaser séparé, le canvas est complet
  });
}

/** 1:1 décomp `DrawStdFrameWithCustomTileAndPalette(windowId, FALSE, 0x27, 0xd)`
 *  (menu.c:687) + `AddTextPrinterParameterized(windowId, FONT_NORMAL, text, ...)`
 *  (= pré-render canvas avec 9-slice border 1:1 + text rendu monospace).
 *
 *  Le frame style est celui sélectionné par l'user via le menu OPTIONS
 *  (= `gameState.options.windowFrameType`, 1..20, 1:1 décomp
 *  `gSaveBlock2Ptr->optionsWindowFrameType`). Charge les tiles via
 *  `GetWindowFrameTilesPal(frameType)` (= 9 tiles 4bpp + palette 16 colors,
 *  1:1 décomp text_window.c:14-23 sTextWindowFrameN_Gfx/_Pal).
 *
 *  Le content area (= width×height tiles) est rempli de la couleur palette[1]
 *  (= PIXEL_FILL(1) du décomp `FillWindowPixelBuffer(windowId, PIXEL_FILL(1))`).
 *  Le text est dessiné en couleur palette[2] (= TEXT_COLOR_DARK_GRAY 1:1 décomp).
 *
 *  Le 9-slice layout (1:1 décomp `WindowFunc_DrawStdFrameWithCustomTileAndPalette`
 *  + `DrawTextBorderOuter` text_window.c:85-100) :
 *    tile[0] TL,   tile[1] top,    tile[2] TR
 *    tile[3] left, tile[4] center, tile[5] right
 *    tile[6] BL,   tile[7] bottom, tile[8] BR */
function _renderWindowToCanvas(
  scene: Phaser.Scene,
  contentW: number, contentH: number,  // window content size in tiles (8×8 each)
  text: string,
  centered: boolean,
  textureKey: string,
): void {
  // Total size = content + 1 tile border each side.
  const totalTilesW = contentW + 2;
  const totalTilesH = contentH + 2;
  const W = totalTilesW * 8;
  const H = totalTilesH * 8;

  // 1:1 décomp : récupère les tiles + palette du frame user-selected.
  // Lazy import pour éviter circular deps.
  const txtWindow = (globalThis as Record<string, unknown>).GetWindowFrameTilesPal as
    ((idx: number) => { tiles: Uint8Array; pal: Uint16Array }) | undefined;
  const frameType = gameState.options.windowFrameType ?? 0;
  const { tiles, pal } = txtWindow ? txtWindow(frameType) : { tiles: new Uint8Array(0x120), pal: new Uint16Array(16) };

  // Canvas hors-écran pour pré-render.
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1:1 décomp `WindowFunc_DrawStdFrameWithCustomTileAndPalette` (menu.c) +
  // `DrawTextBorderOuter` (text_window.c:85-100) : 8 FillBgTilemapBufferRect +
  // 1 fill content. On compose canvas 9-slice :
  //   row 0   : TL  top×W top×W ... top×W  TR    (contentW+2 tiles wide)
  //   rows 1..contentH+1 : left  center×W ... center×W  right
  //   row contentH+1 : BL  bottom×W ... bottom×W  BR
  // Note : tile[4] center est utilisé pour le fond CONTENT du décomp via
  // FillBgTilemapBufferRect(bg, tileNum+4, ...) sur (tilemapLeft, tilemapTop,
  // width, height). Mais notre `FillWindowPixelBuffer` du décomp utilise
  // PIXEL_FILL(1) → couleur palette[1] (= blanc en général). Pour 1:1 visuel,
  // on dessine d'abord tile[4] (= dot/pattern frame) puis on FILL le content
  // area en couleur palette[1] uniforme par-dessus (= matche AddTextPrinter
  // qui FillWindowPixelBuffer en pal[1] avant de dessiner les caractères).
  for (let ty = 0; ty < totalTilesH; ty++) {
    for (let tx = 0; tx < totalTilesW; tx++) {
      // Choix du tile selon position (9-slice).
      let tileIdx: number;
      if (ty === 0) {
        tileIdx = tx === 0 ? 0 : tx === totalTilesW - 1 ? 2 : 1;
      } else if (ty === totalTilesH - 1) {
        tileIdx = tx === 0 ? 6 : tx === totalTilesW - 1 ? 8 : 7;
      } else {
        tileIdx = tx === 0 ? 3 : tx === totalTilesW - 1 ? 5 : 4;
      }
      _drawTile4bpp(ctx, tiles, tileIdx, pal, tx * 8, ty * 8);
    }
  }

  // 1:1 décomp `FillWindowPixelBuffer(windowId, PIXEL_FILL(1))` :
  // remplir le content area avec la couleur palette_bank_15[1] (= white-ish bg).
  // Le window template `paletteNum=15` (field_region_map.c:77/86) référence la
  // palette bank 15. Le décomp ne charge PAS explicitement bank 15 dans
  // field_region_map.c — la palette carry over de l'overworld (= `gMessageBox_Pal`
  // = `sTextWindowPalettes[0]` = palette extraite de `text_window/message_box.png`).
  // C'est la palette TEXTBOX STANDARD ROM (= cream bg + dark text).
  // Notre runtime préchargé via `preloadTextWindowFrames` → assetCache (= sync read).
  const messageBoxPal = (getAsset('gMessageBox_Pal') as Uint16Array | null) ?? pal;
  const bgRgb15 = messageBoxPal[1] ?? 0x7FFF;
  const r = (bgRgb15 & 0x1F) << 3;
  const g = ((bgRgb15 >> 5) & 0x1F) << 3;
  const b = ((bgRgb15 >> 10) & 0x1F) << 3;
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(8, 8, contentW * 8, contentH * 8);

  // 1:1 décomp `AddTextPrinterParameterized(windowId, FONT_NORMAL, text, x, y, ...)` :
  // dessine le text avec sFontShadowSpec = {TEXT_COLOR_TRANSPARENT(0),
  // TEXT_COLOR_DARK_GRAY(2), TEXT_COLOR_LIGHT_GRAY(3)} (= 1:1 décomp
  // sFontNormalShadowSpec text.c). Donc text color = palette_bank_15[2].
  const textRgb15 = messageBoxPal[2] ?? 0x294A;
  const tr = (textRgb15 & 0x1F) << 3;
  const tg = ((textRgb15 >> 5) & 0x1F) << 3;
  const tb = ((textRgb15 >> 10) & 0x1F) << 3;
  ctx.fillStyle = `rgb(${tr},${tg},${tb})`;
  ctx.font = '10px monospace';
  ctx.textBaseline = 'middle';
  const textY = 8 + contentH * 4;  // = vertical center of content area
  if (centered) {
    ctx.textAlign = 'center';
    ctx.fillText(text, 8 + contentW * 4, textY);
  } else {
    ctx.textAlign = 'left';
    ctx.fillText(text, 8 + 4, textY);  // +4 padding 1:1 décomp PrintRegionMapSecName
  }

  // Ajoute la texture à Phaser (= remplace si existe).
  if (scene.textures.exists(textureKey)) scene.textures.remove(textureKey);
  scene.textures.addCanvas(textureKey, canvas);
}

/** Décode un tile 4bpp GBA (= 32 bytes, 8×8 px, 4 bits par pixel low/high
 *  nibble row-major) et le dessine au canvas à (destX, destY). Le pixel idx 0
 *  est rendu transparent (= GBA convention).
 *
 *  1:1 décomp gba/io_reg.h tile data layout :
 *    byte 0 : px(0,0) low nibble | px(1,0) high nibble
 *    byte 1 : px(2,0) low | px(3,0) high
 *    ... 4 bytes par row, 8 rows = 32 bytes par tile. */
function _drawTile4bpp(
  ctx: CanvasRenderingContext2D,
  tiles: Uint8Array, tileIdx: number,
  pal: Uint16Array,
  destX: number, destY: number,
): void {
  const base = tileIdx * 32;
  const imageData = ctx.createImageData(8, 8);
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 4; col++) {
      const byte = tiles[base + row * 4 + col] ?? 0;
      const px1 = byte & 0xF;
      const px2 = (byte >> 4) & 0xF;
      // Pixel left (px1).
      const o1 = (row * 8 + col * 2) * 4;
      if (px1 === 0) {
        imageData.data[o1 + 3] = 0;  // transparent
      } else {
        const rgb15 = pal[px1] ?? 0;
        imageData.data[o1 + 0] = (rgb15 & 0x1F) << 3;
        imageData.data[o1 + 1] = ((rgb15 >> 5) & 0x1F) << 3;
        imageData.data[o1 + 2] = ((rgb15 >> 10) & 0x1F) << 3;
        imageData.data[o1 + 3] = 0xFF;
      }
      // Pixel right (px2).
      const o2 = o1 + 4;
      if (px2 === 0) {
        imageData.data[o2 + 3] = 0;
      } else {
        const rgb15 = pal[px2] ?? 0;
        imageData.data[o2 + 0] = (rgb15 & 0x1F) << 3;
        imageData.data[o2 + 1] = ((rgb15 >> 5) & 0x1F) << 3;
        imageData.data[o2 + 2] = ((rgb15 >> 10) & 0x1F) << 3;
        imageData.data[o2 + 3] = 0xFF;
      }
    }
  }
  ctx.putImageData(imageData, destX, destY);
}

/** Crée un window container Phaser avec frame + text 1:1 décomp style. */
// _createWindowContainer retiré : remplacé par _renderWindowToCanvas (= 1:1
// décomp 9-slice frame tiles user-selected + text rendering).

function _destroyGameObjects(): void {
  const st = _state();
  st.mapImage?.destroy(); st.mapImage = null;
  st.cursorSprite?.destroy(); st.cursorSprite = null;
  st.playerIconSprite?.destroy(); st.playerIconSprite = null;
  st.titleWindow?.destroy(); st.titleWindow = null;
  st.mapsecWindow?.destroy(); st.mapsecWindow = null;
  st.mapsecText = null;
}

function _updateCursorPosition(): void {
  const st = _state();
  if (!st.cursorSprite) return;
  const scene = _getScene();
  if (!scene) return;
  const cam = scene.cameras.main;
  const sx = cam.width / GBA_SCREEN_WIDTH;
  const sy = cam.height / GBA_SCREEN_HEIGHT;
  // 1:1 décomp region_map.c:1418-1419 : sprite->x = 8*posX + 4 (= center coord).
  // OAM top-left rendu = sprite->x + centerToCornerVecX (= -8 pour 16×16
  // sprite.c:349) = 8*posX + 4 - 8 = 8*posX - 4. Phaser origin (0, 0) = top-left.
  st.cursorSprite.x = (st.cursorPosX * 8 - 4) * sx;
  st.cursorSprite.y = (st.cursorPosY * 8 - 4) * sy;
}

/** 1:1 décomp `sRegionMapCursorAnim1` ANIMCMD_FRAME tick (region_map.c:218).
 *  Update le sprite frame selon le counter : 0..19 = frame 0, 20..39 = frame 1.
 *  `cursor_small.png` est 16×32 = 2 frames stackées verticalement
 *  (top = idle, bottom = blink). setCrop sélectionne la portion visible. */
function _updateCursorBlinkFrame(): void {
  const st = _state();
  if (!st.cursorSprite) return;
  const frame = st.cursorAnimFrameCounter < 20 ? 0 : 1;
  // Phaser Image setCrop(x, y, w, h) : crop relatif à la texture source (16×32).
  // Frame 0 = top half (0..16), frame 1 = bottom half (16..32).
  st.cursorSprite.setCrop(0, frame * 16, 16, 16);
}

function _updateMapsecNameDisplay(): void {
  const st = _state();
  const scene = _getScene();
  if (!scene) return;
  // 1:1 décomp `MoveRegionMapCursor_Full` (region_map.c:715-721) :
  //   mapSecId = GetMapSecIdAt(cursorPosX, cursorPosY);
  //   if (mapSecId != sRegionMap->mapSecId) GetMapName(name, mapSecId, MAX_LEN);
  //   PrintRegionMapSecName();   ← re-render the WIN_MAPSEC_NAME window text.
  // Re-render le canvas mapsec window avec le nouveau nom.
  const newName = _getMapsecNameAtCursor();
  _renderWindowToCanvas(scene, 12, 2, newName, false, 'region_map_mapsec');
  // Phaser refresh : la canvas texture a été remplacée, le Image GameObject
  // doit re-render. setTexture force refresh.
  if (st.mapsecWindow) {
    (st.mapsecWindow as unknown as Phaser.GameObjects.Image).setTexture('region_map_mapsec');
  }
}

function _getMapsecNameAtCursor(): string {
  const st = _state();
  // 1:1 décomp `MoveRegionMapCursor_Full` (region_map.c:715-721) :
  //   mapSecId = GetMapSecIdAt(cursorPosX, cursorPosY);
  //   sRegionMap->mapSecType = GetMapsecType(mapSecId);
  //   if (mapSecId != sRegionMap->mapSecId) GetMapName(name, mapSecId, MAX_LEN);
  // + 1:1 `PrintRegionMapSecName` (field_region_map.c:202-215) :
  //   if (mapSecType != MAPSECTYPE_NONE) draw name window;
  //   else fill blank.
  // Utilise le layout 15×28 1:1 décomp + gRegionMapEntries[].name + flag visit.
  const mapSecId = GetMapSecIdAt(st.cursorPosX, st.cursorPosY);
  if (mapSecId === 'MAPSEC_NONE') return '';
  const mapSecType = GetMapsecType(mapSecId, (flag: string) => gameState.hasFlag(flag));
  if (mapSecType === MAPSECTYPE_NONE) return '';  // = 1:1 décomp blank pour types NONE (= Battle Frontier sans flag, Southern Island sans flag)
  return GetMapName(mapSecId) || '';
}

/** Load assets Phaser une seule fois (= cached après 1er open).
 *  Asset state shared via globalThis state (= same singleton que isOpen).
 *
 *  1:1 décomp `LoadRegionMapGfx` (region_map.c:544-619) charge :
 *    - case 0 : map tiles (= sRegionMapBg_GfxLZ → BG_CHAR_ADDR(2))
 *    - case 1 : map tilemap (= sRegionMapBg_TilemapLZ → BG_SCREEN_ADDR(28))
 *    - case 2 : map palette (= sRegionMapBg_Pal → BG_PLTT_ID(7), 3 sub-pals)
 *    - case 3 : cursor sprite (= sRegionMapCursorSmallGfxLZ → cursorSmallImage)
 *  Notre version : compose la map finale via canvas en pré-render (= 1 fois)
 *  à partir des PNG/PAL/BIN sources, puis l'utilise comme texture Phaser. */
function _loadAssetsIfNeeded(scene: Phaser.Scene, onReady: () => void): void {
  const st = _state();
  if (st.assetsLoaded) { onReady(); return; }
  if (st.assetsLoading) return;
  st.assetsLoading = true;
  // Compose la map finale 1:1 décomp via canvas hors-écran (= tiles + tilemap +
  // palette pre-render). Puis utilise le dataURL comme texture Phaser.
  void _composeRegionMapTexture(scene).then(() => {
    // Load les autres assets (= cursor + player icons) directement (= pas besoin
    // de tilemap pour eux).
    scene.load.image('region_map_cursor', '/decomp/em/region_map/cursor_small.png');
    scene.load.image('region_map_brendan', '/decomp/em/region_map/brendan_icon.png');
    scene.load.image('region_map_may', '/decomp/em/region_map/may_icon.png');
    scene.load.once('complete', () => {
      st.assetsLoaded = true;
      st.assetsLoading = false;
      onReady();
    });
    scene.load.start();
  }).catch((e) => {
    console.error('[region-map] compose texture failed:', e);
    st.assetsLoading = false;
  });
}

/** 1:1 décomp pré-render BG2 affine map. Décode tiles (map.png 8bpp indexed)
 *  + palette (map.pal RGB15, 3 sub-pals × 16 colors = 48 entries chargées au
 *  BG_PLTT_ID(7) = BG palettes 7/8/9) + tilemap (map.bin 64×64 1-byte tile ids).
 *
 *  Compose un canvas 240×160 (= GBA visible area) en piochant chaque tile 8×8
 *  dans la PNG selon tilemap[y][x], et résoud chaque pixel via la palette.
 *  Le résultat est ajouté à Phaser TextureManager sous la clé `region_map_bg`. */
async function _composeRegionMapTexture(scene: Phaser.Scene): Promise<void> {
  if (scene.textures.exists('region_map_bg')) return;
  // Lazy import pour éviter coût au module load (= seulement quand on ouvre la map).
  const { loadIndexedPngStrict, loadAffineTilemapBin } =
    await import('./gba/png-loader');
  const { rgb15ToRgba8 } = await import('./gba/types');
  // Charge en parallèle. NB : on utilise la PLTE embeddée dans map.png (= 256
  // entries dont les 32 vraies couleurs HOENN à partir de l'index 113, =
  // alignement palette bank 7 du décomp `LoadPalette(sRegionMapBg_Pal,
  // BG_PLTT_ID(7), ...)`. Les indices `charData` matchent directement cette PLTE).
  // map.pal externe (= 32 entries JASC-PAL) est redondante avec ce que la PLTE
  // PNG contient déjà → pas besoin de loadGbaPal.
  const [png, tilemap] = await Promise.all([
    loadIndexedPngStrict('/decomp/em/region_map/map.png', 8),
    loadAffineTilemapBin('/decomp/em/region_map/map.bin'),
  ]);
  const pal = png.palette;
  // PNG : 128×120 = 16×15 tiles 8×8 = 240 unique tiles.
  // Tilemap : 64×64 = 4096 tile entries (1 byte each = 1:1 décomp BG2 affine
  // paletteMode=1 256-color).
  // BG2 screenSize=2 = 512×512 px BG. Le visible GBA screen = 240×160 px =
  // 30×20 tiles. Avec scroll (0, 0) initial (= CalcZoomScrollParams(0,0,0,0,
  // 0x100, 0x100, 0)), on affiche les 30 premières colonnes × 20 premières lignes.
  const VISIBLE_W = 240, VISIBLE_H = 160;
  const VISIBLE_TILES_W = 30, VISIBLE_TILES_H = 20;
  const TILEMAP_STRIDE = 64;  // = 1:1 BG2 screenSize=2 / 8
  const PNG_TILES_W = 16;     // = png.widthTiles

  // Canvas hors-écran.
  const canvas = document.createElement('canvas');
  canvas.width = VISIBLE_W;
  canvas.height = VISIBLE_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d unsupported');
  const imageData = ctx.createImageData(VISIBLE_W, VISIBLE_H);
  const pixels = imageData.data;

  // Compose tile par tile. `charData` est packé tile-par-tile (= 64 bytes par
  // tile en ordre row-major). Pour accéder au pixel (px, py) du tile_id :
  //   charData[tile_id * 64 + py * 8 + px] = palette index dans la pal externe.
  for (let ty = 0; ty < VISIBLE_TILES_H; ty++) {
    for (let tx = 0; tx < VISIBLE_TILES_W; tx++) {
      // 1:1 décomp tilemap lookup : tile_id = tilemap[ty][tx] (= u8).
      const tileId = tilemap[ty * TILEMAP_STRIDE + tx] & 0xFF;
      const tileBase = tileId * 64;
      // Draw 8×8 du tile au canvas.
      for (let py = 0; py < 8; py++) {
        for (let px = 0; px < 8; px++) {
          // 1:1 décomp : palette index dans le PNG 8bpp (= 32-color subset).
          const palIdx = png.charData[tileBase + py * 8 + px];
          // GBA convention : palette index 0 = transparent. Pour le BG2 affine
          // (paletteMode=1 256-color), on rend toujours en utilisant la pal
          // externe `map.pal` (= 32 colors) chargée par LoadPalette(.., BG_PLTT_ID(7)).
          const rgb15 = pal[palIdx] ?? 0;
          const [r, g, b] = rgb15ToRgba8(rgb15);
          const dstX = tx * 8 + px;
          const dstY = ty * 8 + py;
          const dstOff = (dstY * VISIBLE_W + dstX) * 4;
          pixels[dstOff + 0] = r;
          pixels[dstOff + 1] = g;
          pixels[dstOff + 2] = b;
          pixels[dstOff + 3] = 0xFF;
        }
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
  // Ajoute la texture composée à Phaser.
  scene.textures.addCanvas('region_map_bg', canvas);
  console.log(`[region-map] composed BG texture ${VISIBLE_W}×${VISIBLE_H} from ${png.widthTiles}×${png.heightTiles} tiles (${png.charData.length} bytes) + ${tilemap.length} tilemap entries + ${pal.length} pal colors`);
}
