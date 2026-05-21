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

/** 1:1 décomp `FieldInitRegionMap(callback)` (field_region_map.c:92-99) :
 *    SetMainCallback2(MCB2_InitRegionMapRegisters);
 *  + état 0 de FieldUpdateRegionMap : InitRegionMap + CreateRegionMapPlayerIcon +
 *  CreateRegionMapCursor.
 *
 *  Async pour pouvoir preload les données décomp (= region_map_data.json) avant
 *  d'initialiser le cursor au mapsec courant 1:1. */
export async function OpenRegionMap(): Promise<void> {
  const st = _state();
  if (st.isOpen) return;
  // Preload data décomp avant de lookup gRegionMapEntries.
  await preloadRegionMapData();
  st.isOpen = true;
  // 1:1 décomp `InitMapBasedOnPlayerLocation` (= state 5 LoadRegionMapGfx) :
  // cursor positionné au mapsec du player + playerIconSpritePos = cursorPos.
  const playerLoc = _getPlayerMapsecLocation();
  st.cursorPosX = playerLoc.x;
  st.cursorPosY = playerLoc.y;
  // 1:1 décomp : currentMapsecName = lookup direct via GetMapName(mapSecId).
  st.currentMapsecName = GetMapName(playerLoc.mapSecId) || _getCurrentMapsecName();
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

    // 1:1 décomp `CreateRegionMapCursor` (region_map.c:1375) : sprite 16×16
    // à la position (cursorPosX * 8, cursorPosY * 8) pixel. Le PNG source
    // `cursor_small.png` est 16×32 (= 2 frames stackées). On crop top half
    // (= frame 0 idle) au spawn, puis tick alterne frame 0/1 via setCrop.
    const cursorPx = st.cursorPosX * 8 * sx;
    const cursorPy = st.cursorPosY * 8 * sy;
    st.cursorSprite = scene.add.image(cursorPx, cursorPy, 'region_map_cursor')
      .setOrigin(0, 0)
      .setCrop(0, 0, 16, 16)
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
  if (!st.mapsecText) return;
  // 1:1 décomp `MoveRegionMapCursor_Full` (region_map.c:715-721) :
  //   mapSecId = GetMapSecIdAt(cursorPosX, cursorPosY);
  //   if (mapSecId != sRegionMap->mapSecId) GetMapName(name, mapSecId, MAX_LEN);
  // Notre lookup approximatif (= table sMapSecIdAt 30×16 pas portée 1:1).
  st.mapsecText.setText(_getMapsecNameAtCursor());
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
