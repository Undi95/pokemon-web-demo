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
import { getRuntime } from './decomp-globals';

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
  cursorPosX: number;
  cursorPosY: number;
  cursorMovementFrameCounter: number;
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
      cursorPosX: MAPCURSOR_X_MIN,
      cursorPosY: MAPCURSOR_Y_MIN,
      cursorMovementFrameCounter: 0,
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

/** 1:1 décomp `FieldInitRegionMap(callback)` (field_region_map.c:92-99) :
 *    SetMainCallback2(MCB2_InitRegionMapRegisters);
 *  + état 0 de FieldUpdateRegionMap : InitRegionMap + CreateRegionMapPlayerIcon +
 *  CreateRegionMapCursor. */
export function OpenRegionMap(): void {
  const st = _state();
  if (st.isOpen) return;
  st.isOpen = true;
  // 1:1 décomp `InitMapBasedOnPlayerLocation` (= state 5 LoadRegionMapGfx) :
  // cursor positionné au mapsec du player + playerIconSpritePos = cursorPos.
  const playerLoc = _getPlayerMapsecLocation();
  st.cursorPosX = playerLoc.x;
  st.cursorPosY = playerLoc.y;
  st.currentMapsecName = _getCurrentMapsecName();
  st.cursorMovementFrameCounter = 0;
  _spawnGameObjects(playerLoc);
}

/** 1:1 décomp `FreeRegionMapIconResources` (region_map.c:627-641) + state 6
 *  FieldUpdateRegionMap : destroy sprites + free windows + restore callback. */
export function CloseRegionMap(): void {
  const st = _state();
  if (!st.isOpen) return;
  st.isOpen = false;
  _destroyGameObjects();
  // 1:1 décomp `SetMainCallback2(sFieldRegionMapHandler->callback)` (= retour field).
  // Notre version : SignalWaitState pour unblock le script `special FieldShowRegionMap`.
  SignalWaitState();
}

/** Tick called per-frame depuis MainCB2_Overworld (= overlay actif).
 *  1:1 décomp `MCB2_FieldUpdateRegionMap` state 4 (input + cursor move). */
export function TickRegionMap(): void {
  const st = _state();
  if (!st.isOpen) return;
  const rt = getRuntime();
  if (!rt) return;
  const heldKeys = rt.gMain.heldKeys;
  const newKeys = rt.gMain.newKeys;

  // 1:1 décomp `MAP_INPUT_A_BUTTON` / `MAP_INPUT_B_BUTTON` (region_map.c:675-682) :
  // A or B button → exit fade-out → close.
  if (newKeys & 0x01) {  // A_BUTTON
    CloseRegionMap();
    return;
  }
  if (newKeys & 0x02) {  // B_BUTTON
    CloseRegionMap();
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

/** 1:1 décomp `InitMapBasedOnPlayerLocation` (region_map.c, lookup gRegionMapEntries).
 *  Compute cursor (x, y) basé sur le mapsec actuel du player. Mapping
 *  approximatif via mapId → coord HOENN car notre runtime n'a pas porté la
 *  table sMapSecIdAt complète. */
function _getPlayerMapsecLocation(): { x: number; y: number } {
  const mapId = gMapHeader?.id ?? '';
  // 1:1 décomp `gRegionMapEntries[mapSecId]` table mappe each mapsec à (x, y) HOENN.
  // Ces coords sont en GBA tiles (= 1 tile = 8 px), cursor ranges 1-28 X, 2-16 Y.
  // Mapping pour les early-game mapsecs (= LITTLEROOT/OLDALE/ROUTE101/PETALBURG).
  const LITTLEROOT = { x: 4,  y: 11 };   // Bourg-en-Vol = SW
  const OLDALE     = { x: 4,  y: 9  };   // Rosyères = au-dessus de Littleroot
  const PETALBURG  = { x: 1,  y: 9  };   // Algatia = à l'ouest d'Oldale
  const ROUTE101   = { x: 4,  y: 10 };   // entre Littleroot et Oldale
  const ROUTE102   = { x: 2,  y: 9  };   // entre Oldale et Petalburg
  const ROUTE103   = { x: 6,  y: 9  };   // route est d'Oldale
  if (mapId.includes('LITTLEROOT')) return LITTLEROOT;
  if (mapId.includes('OLDALE'))     return OLDALE;
  if (mapId.includes('PETALBURG'))  return PETALBURG;
  if (mapId.includes('ROUTE101'))   return ROUTE101;
  if (mapId.includes('ROUTE102'))   return ROUTE102;
  if (mapId.includes('ROUTE103'))   return ROUTE103;
  if (mapId.includes('INSIDE_OF_TRUCK')) return LITTLEROOT;  // arrival
  // Fallback : centre HOENN.
  return { x: 15, y: 9 };
}

function _getCurrentMapsecName(): string {
  const mapId = gMapHeader?.id ?? '';
  const secId = gMapHeader?.regionMapSectionId ?? mapId;
  return getMapNameFr(secId) || getMapNameFr(mapId) || 'HOENN';
}

function _getScene(): Phaser.Scene | null {
  return (globalThis as Record<string, unknown>).__phaserOverworldScene as Phaser.Scene | null;
}

/** 1:1 décomp state 0 + 1 de FieldUpdateRegionMap (field_region_map.c:144-161) :
 *  InitRegionMap + CreateRegionMapPlayerIcon + CreateRegionMapCursor +
 *  DrawStdFrameWithCustomTileAndPalette(WIN_TITLE) + WIN_MAPSEC_NAME +
 *  BeginNormalPaletteFade. */
function _spawnGameObjects(playerLoc: { x: number; y: number }): void {
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

    // 1:1 décomp `CreateRegionMapCursor` (region_map.c:1375) : sprite 16×16
    // à la position (cursorPosX * 8, cursorPosY * 8) pixel.
    const cursorPx = st.cursorPosX * 8 * sx;
    const cursorPy = st.cursorPosY * 8 * sy;
    st.cursorSprite = scene.add.image(cursorPx, cursorPy, 'region_map_cursor')
      .setOrigin(0, 0)
      .setDisplaySize(16 * sx, 16 * sy)
      .setDepth(REGION_MAP_DEPTH + 2)
      .setScrollFactor(0);

    // 1:1 décomp `CreateRegionMapPlayerIcon` (region_map.c) : sprite icon
    // gender-aware au playerIconSpritePos (= same coords que cursor au start).
    const playerKey = gameState.gender === 'MALE' ? 'region_map_brendan' : 'region_map_may';
    const playerPx = playerLoc.x * 8 * sx;
    const playerPy = playerLoc.y * 8 * sy;
    st.playerIconSprite = scene.add.image(playerPx, playerPy, playerKey)
      .setOrigin(0, 0)
      .setDisplaySize(16 * sx, 16 * sy)
      .setDepth(REGION_MAP_DEPTH + 1)
      .setScrollFactor(0);

    // 1:1 décomp state 1 : `DrawStdFrameWithCustomTileAndPalette(WIN_TITLE, 0x27, 0xd)`
    // + `AddTextPrinterParameterized(WIN_TITLE, gText_Hoenn, centered, 1, ...)`.
    // WIN_TITLE template = bg=0, left=22 top=1 w=7 h=2.
    st.titleWindow = _createWindowContainer(scene,
      22 * 8 * sx, 1 * 8 * sy,         // x, y pixel (= tile coords ×8)
      7 * 8 * sx, 2 * 8 * sy,          // width, height pixel
      getString('gText_Hoenn') || 'HOENN',
      true);  // centered
    st.titleWindow.setDepth(REGION_MAP_DEPTH + 3);

    // 1:1 décomp `DrawStdFrameWithCustomTileAndPalette(WIN_MAPSEC_NAME, ...)`
    // + `AddTextPrinterParameterized(WIN_MAPSEC_NAME, mapSecName, 0, 1, ...)`.
    // WIN_MAPSEC_NAME template = bg=0, left=17 top=17 w=12 h=2.
    st.mapsecWindow = _createWindowContainer(scene,
      17 * 8 * sx, 17 * 8 * sy,
      12 * 8 * sx, 2 * 8 * sy,
      st.currentMapsecName,
      false);  // left-aligned
    st.mapsecWindow.setDepth(REGION_MAP_DEPTH + 3);
    // Stocke ref au Text pour update au cursor move.
    st.mapsecText = st.mapsecWindow.getAt(1) as Phaser.GameObjects.Text;
  });
}

/** Crée un window container Phaser avec frame + text 1:1 décomp style. */
function _createWindowContainer(
  scene: Phaser.Scene,
  x: number, y: number, w: number, h: number,
  text: string,
  centered: boolean,
): Phaser.GameObjects.Container {
  const cam = scene.cameras.main;
  const scaleY = cam.height / GBA_SCREEN_HEIGHT;
  // Frame (= 1:1 DrawStdFrameWithCustomTileAndPalette : fond blanc + border noir).
  const frame = scene.add.rectangle(0, 0, w, h, 0xFFFFFF)
    .setOrigin(0, 0)
    .setStrokeStyle(2 * scaleY, 0x303030);
  // Text (= AddTextPrinter FONT_NORMAL black on white).
  const fontSize = Math.max(8, Math.round(10 * scaleY));
  const txt = scene.add.text(centered ? w / 2 : 4 * scaleY, h / 2, text, {
    fontFamily: 'monospace',
    fontSize: `${fontSize}px`,
    color: '#000',
  });
  if (centered) txt.setOrigin(0.5, 0.5);
  else txt.setOrigin(0, 0.5);
  return scene.add.container(x, y, [frame, txt])
    .setScrollFactor(0);
}

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
  st.cursorSprite.x = st.cursorPosX * 8 * sx;
  st.cursorSprite.y = st.cursorPosY * 8 * sy;
}

function _updateMapsecNameDisplay(): void {
  const st = _state();
  if (!st.mapsecText) return;
  // 1:1 décomp `MoveRegionMapCursor_Full` (region_map.c:715-721) :
  //   mapSecId = GetMapSecIdAt(cursorPosX, cursorPosY);
  //   if (mapSecId != sRegionMap->mapSecId) GetMapName(name, mapSecId, MAX_LEN);
  // Notre lookup approximatif (= table sMapSecIdAt 30×16 pas portée 1:1).
  st.mapsecText.setText(_getMapsecNameAtCursor());
}

function _getMapsecNameAtCursor(): string {
  const st = _state();
  // Mapping approximatif cursor pos → mapsec FR. 1:1 décomp utiliserait la
  // table sMapSecIdAt 30×16. Pour démo : sections approximatives par quadrants.
  const x = st.cursorPosX;
  const y = st.cursorPosY;
  // Centre du player = current mapsec.
  const playerLoc = _getPlayerMapsecLocation();
  if (Math.abs(x - playerLoc.x) <= 1 && Math.abs(y - playerLoc.y) <= 1) {
    return st.currentMapsecName;
  }
  // Mapping approximatif par région HOENN (= early-game sections seulement).
  if (x <= 6 && y >= 10) return 'BOURG-EN-VOL';
  if (x <= 6 && y >= 8)  return 'ROSYERES';
  if (x <= 3 && y <= 8)  return 'ALGATIA';
  if (x <= 8 && y <= 6)  return 'POIVRESSEL';
  if (x >= 20 && y <= 5) return 'ATALANOPOLIS';
  if (x >= 20)           return 'ALGATIA';
  if (y <= 5)            return 'POIVRESSEL';
  if (y >= 13)           return 'NÉNUCRIQUE';
  return 'HOENN';
}

/** Load assets Phaser une seule fois (= cached après 1er open).
 *  Asset state shared via globalThis state (= same singleton que isOpen). */
function _loadAssetsIfNeeded(scene: Phaser.Scene, onReady: () => void): void {
  const st = _state();
  if (st.assetsLoaded) { onReady(); return; }
  if (st.assetsLoading) return;
  st.assetsLoading = true;
  // Load all assets dans le scene's loader.
  scene.load.image('region_map_bg', '/decomp/em/region_map/map.png');
  scene.load.image('region_map_cursor', '/decomp/em/region_map/cursor_small.png');
  scene.load.image('region_map_brendan', '/decomp/em/region_map/brendan_icon.png');
  scene.load.image('region_map_may', '/decomp/em/region_map/may_icon.png');
  scene.load.once('complete', () => {
    st.assetsLoaded = true;
    st.assetsLoading = false;
    onReady();
  });
  scene.load.start();
}
