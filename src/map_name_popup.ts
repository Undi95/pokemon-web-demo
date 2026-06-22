/**
 * map_name_popup.ts — 1:1 décomp `src/map_name_popup.c`.
 *
 * Source de vérité (1:1 décomp) :
 *   - `src/map_name_popup.c` (= ShowMapNamePopup, Task_MapNamePopUpWindow,
 *     LoadMapNamePopUpWindowBg, DrawMapNamePopUpFrame)
 *   - `src/menu.c:521` (= AddMapNamePopUpWindow template)
 *   - `src/overworld.c:824` (= ShowMapNamePopup() appelé fin LoadMapFromCameraTransition)
 *
 * Comportement 1:1 décomp :
 *   - Au cross-border / map load (= si mapsec différent), affiche un popup en
 *     haut-gauche de l'écran avec le nom de la map + theme (= wood/marble/etc.).
 *   - Anim : SLIDE_IN (~20 frames) → WAIT (= 120 frames) → SLIDE_OUT (~20 frames).
 *   - Total durée ~160 frames = ~2.7 secondes à 60fps.
 *   - Skip si le mapsec n'a pas changé (= cross-border vers même région).
 *
 * Theme system 1:1 décomp :
 *   - `sMapSectionToThemeId[]` = mapsec → theme (= 6 themes : WOOD, MARBLE,
 *     STONE, BRICK, UNDERWATER, STONE2).
 *   - Chaque theme a `<theme>_outline.png` = 30 tiles frame border (chargés à
 *     BG VRAM offset 0x21D) + `<theme>.gbapal` palette à BG_PLTT_ID(14).
 *   - DrawMapNamePopUpFrame place les tiles dans le tilemap BG0 autour de la
 *     fenêtre (12 top + 6 sides + 12 bottom = 30 tiles).
 *
 * Phase 4.9 : skip le `BlitBitmapToWindow` background fill (= texture wallpaper
 *  inside window). Window stays plain white. Frame border + palette = fonctionnel.
 */

import { getRuntime } from '../harness/runtime/decomp-globals';
import { REG_OFFSET_BG0VOFS } from '../harness/runtime/decomp-runtime';
import { FlagGet } from './engine/script/script-vars';
import { gMapHeader } from './fieldmap';
import type { DecompTask } from '../harness/runtime/decomp-runtime';
import {
  AddWindow, RemoveWindow, FillWindowPixelBuffer, CopyWindowToVram,
  ClearStdWindowAndFrame, FillBgTilemapBufferRect, PutWindowTilemap,
  BlitBitmapToWindow,
} from './engine/ui/gba-window-system';
import { AddTextPrinterParameterized3 } from './engine/ui/gba-text-system';
import { LoadBgTiles } from '../harness/runtime/decomp-globals';
import { LoadPalette } from '../harness/runtime/decomp-globals';
import { loadIndexedPngStrict } from '../harness/gba/png-loader';

// ─── 1:1 décomp constants (map_name_popup.c:212-229, menu.c:521-526) ────────

const POPUP_OFFSCREEN_Y = 40;
const POPUP_SLIDE_SPEED = 2;
const POPUP_PALETTE_NUM = 14;        // 1:1 décomp menu.c:524
const POPUP_PALETTE_FLAT_IDX = 14 * 16;  // = BG_PLTT_ID(14)

// 1:1 décomp tile constants (= map_name_popup.c:371-380)
const TILE_TOP_EDGE_START = 0x21D;
const TILE_TOP_EDGE_END   = 0x228;  // top edge spans 12 tiles (= 0x21D..0x228)
const TILE_LEFT_EDGE_TOP  = 0x229;
const TILE_RIGHT_EDGE_TOP = 0x22A;
const TILE_LEFT_EDGE_MID  = 0x22B;
const TILE_RIGHT_EDGE_MID = 0x22C;
const TILE_LEFT_EDGE_BOT  = 0x22D;
const TILE_RIGHT_EDGE_BOT = 0x22E;
const TILE_BOT_EDGE_START = 0x22F;
const TILE_BOT_EDGE_END   = 0x23A;  // bot edge spans 12 tiles

// 1:1 décomp data slots (= map_name_popup.c:225-229)
const T_STATE          = 0;
const T_ONSCREEN_TIMER = 1;
const T_Y_OFFSET       = 2;
const T_INCOMING_POPUP = 3;
const T_PRINT_TIMER    = 4;

// 1:1 décomp enum (= map_name_popup.c:212-220)
const STATE_SLIDE_IN  = 0;
const STATE_WAIT      = 1;
const STATE_SLIDE_OUT = 2;
const STATE_ERASE     = 4;
const STATE_END       = 5;
const STATE_PRINT     = 6;

// ─── Theme types + mapping (1:1 décomp map_name_popup.c:21-180) ─────────────

type PopupTheme = 'wood' | 'marble' | 'stone' | 'brick' | 'underwater' | 'stone2';

/** 1:1 décomp `sMapSectionToThemeId[]` (map_name_popup.c:75-180).
 *  Mapping mapsec name → theme. Default si mapsec pas listé : WOOD. */
const MAPSEC_TO_THEME: Record<string, PopupTheme> = {
  // Towns (= MAPPOPUP_THEME_WOOD)
  MAPSEC_LITTLEROOT_TOWN: 'wood',
  MAPSEC_OLDALE_TOWN: 'wood',
  MAPSEC_DEWFORD_TOWN: 'wood',
  MAPSEC_LAVARIDGE_TOWN: 'wood',
  MAPSEC_FALLARBOR_TOWN: 'wood',
  MAPSEC_VERDANTURF_TOWN: 'wood',
  MAPSEC_PACIFIDLOG_TOWN: 'wood',
  // Cities (= MAPPOPUP_THEME_BRICK / MARBLE)
  MAPSEC_PETALBURG_CITY: 'brick',
  MAPSEC_SLATEPORT_CITY: 'marble',
  MAPSEC_MAUVILLE_CITY: 'marble',
  MAPSEC_RUSTBORO_CITY: 'marble',
  MAPSEC_FORTREE_CITY: 'brick',
  MAPSEC_LILYCOVE_CITY: 'marble',
  MAPSEC_MOSSDEEP_CITY: 'brick',
  MAPSEC_SOOTOPOLIS_CITY: 'marble',
  MAPSEC_EVER_GRANDE_CITY: 'brick',
  // Routes wood-themed (= 1:1 décomp routes 101..104, 110-123, 132+ etc.)
  MAPSEC_ROUTE_101: 'wood', MAPSEC_ROUTE_102: 'wood', MAPSEC_ROUTE_103: 'wood',
  MAPSEC_ROUTE_104: 'wood', MAPSEC_ROUTE_110: 'wood', MAPSEC_ROUTE_111: 'wood',
  MAPSEC_ROUTE_112: 'wood', MAPSEC_ROUTE_113: 'wood', MAPSEC_ROUTE_114: 'wood',
  MAPSEC_ROUTE_115: 'wood', MAPSEC_ROUTE_116: 'wood', MAPSEC_ROUTE_117: 'wood',
  MAPSEC_ROUTE_118: 'wood', MAPSEC_ROUTE_119: 'wood', MAPSEC_ROUTE_120: 'wood',
  MAPSEC_ROUTE_121: 'wood', MAPSEC_ROUTE_123: 'wood',
  // Routes underwater-themed
  MAPSEC_ROUTE_105: 'underwater', MAPSEC_ROUTE_106: 'underwater',
  MAPSEC_ROUTE_107: 'underwater', MAPSEC_ROUTE_108: 'underwater',
  MAPSEC_ROUTE_109: 'underwater', MAPSEC_ROUTE_122: 'underwater',
  MAPSEC_ROUTE_124: 'underwater', MAPSEC_ROUTE_125: 'underwater',
  MAPSEC_ROUTE_126: 'underwater', MAPSEC_ROUTE_127: 'underwater',
  MAPSEC_ROUTE_128: 'underwater', MAPSEC_ROUTE_129: 'underwater',
  MAPSEC_ROUTE_130: 'underwater', MAPSEC_ROUTE_131: 'underwater',
  MAPSEC_ROUTE_132: 'underwater', MAPSEC_ROUTE_133: 'underwater',
  MAPSEC_ROUTE_134: 'underwater',
  // Underwater locations (= MAPPOPUP_THEME_STONE2)
  MAPSEC_UNDERWATER_124: 'stone2', MAPSEC_UNDERWATER_126: 'stone2',
  MAPSEC_UNDERWATER_127: 'stone2', MAPSEC_UNDERWATER_128: 'stone2',
  MAPSEC_UNDERWATER_SOOTOPOLIS: 'stone2',
  // Caves / mountains (= STONE)
  MAPSEC_GRANITE_CAVE: 'stone', MAPSEC_MT_CHIMNEY: 'stone',
  MAPSEC_RUSTURF_TUNNEL: 'stone', MAPSEC_METEOR_FALLS: 'stone',
  MAPSEC_MT_PYRE: 'stone', MAPSEC_AQUA_HIDEOUT_OLD: 'stone',
  MAPSEC_SHOAL_CAVE: 'stone', MAPSEC_SEAFLOOR_CAVERN: 'stone',
  MAPSEC_VICTORY_ROAD: 'stone', MAPSEC_CAVE_OF_ORIGIN: 'stone',
  MAPSEC_FIERY_PATH: 'stone', MAPSEC_SEALED_CHAMBER: 'stone',
  MAPSEC_SCORCHED_SLAB: 'stone', MAPSEC_ISLAND_CAVE: 'stone',
  MAPSEC_DESERT_RUINS: 'stone', MAPSEC_ANCIENT_TOMB: 'stone',
  MAPSEC_SKY_PILLAR: 'stone', MAPSEC_SECRET_BASE: 'stone',
  // Special (= MARBLE)
  MAPSEC_BATTLE_FRONTIER: 'marble',
  // Misc wood
  MAPSEC_PETALBURG_WOODS: 'wood', MAPSEC_ABANDONED_SHIP: 'wood',
  MAPSEC_SAFARI_ZONE: 'wood', MAPSEC_MIRAGE_ISLAND: 'wood',
  MAPSEC_SOUTHERN_ISLAND: 'wood', MAPSEC_INSIDE_OF_TRUCK: 'wood',
  MAPSEC_NEW_MAUVILLE: 'marble',
};

function getThemeForMapsec(mapsec: string): PopupTheme {
  return MAPSEC_TO_THEME[mapsec] ?? 'wood';  // default WOOD si pas listé
}

// ─── Module state ──────────────────────────────────────────────────────────

let _sPopupTaskId = -1;
let _sLastMapSectionId = '';
let _mapNamesFr: Record<string, string> | null = null;
let _popupWindowId = -1;

/** Cache des themes loadés (= outline tiles + palette + bg fill). Lazy-load. */
type LoadedTheme = {
  /** outline tiles (= frame border, uploaded à BG VRAM 0x21D). */
  outlineTiles: Uint8Array;
  /** bg fill tiles (= textured wallpaper, blitted dans window pixelBuffer). */
  bgFillTiles: Uint8Array;
  /** palette 16 colors (= loaded à BG_PLTT_ID(14)). */
  palette: Uint16Array;
};
const _themeCache: Partial<Record<PopupTheme, LoadedTheme>> = {};

const POPUP_WINDOW_TEMPLATE = {
  bg: 0,
  tilemapLeft: 1,
  tilemapTop: 1,
  width: 10,
  height: 3,
  paletteNum: POPUP_PALETTE_NUM,
  baseBlock: 0x107,
} as const;

// ─── Async loaders ─────────────────────────────────────────────────────────

export async function preloadMapNames(): Promise<void> {
  if (_mapNamesFr) return;
  try {
    const response = await fetch('/decomp/em/map-names-fr.json');
    _mapNamesFr = await response.json() as Record<string, string>;
  } catch (e) {
    console.warn('[map-name-popup] failed to load map-names-fr.json:', e);
    _mapNamesFr = {};
  }
  // Aussi charger dans le module partagé src/data/map-names-fr.ts (= utilisé
  // par start-menu.ts ShowSaveInfoWindow + autres consumers via getMapNameFr).
  try {
    const { loadMapNamesFr } = await import('./data/map-names-fr');
    loadMapNamesFr(_mapNamesFr);
  } catch (e) {
    console.warn('[map-name-popup] failed to bridge to map-names-fr module:', e);
  }
  // Preload tous les 6 themes en parallèle (= évite le miss de theme au 1er
  // popup, le map name FR seul ne fait pas tout). Cache via _themeCache.
  await Promise.all([
    loadTheme('wood'), loadTheme('marble'), loadTheme('stone'),
    loadTheme('brick'), loadTheme('underwater'), loadTheme('stone2'),
  ]);
}

function getMapName(mapsecId: string): string {
  return _mapNamesFr?.[mapsecId] ?? mapsecId;
}

/** Load un theme : outline tiles + bg fill tiles + palette. Cached. */
async function loadTheme(theme: PopupTheme): Promise<LoadedTheme | null> {
  const cached = _themeCache[theme];
  if (cached) return cached;
  try {
    const [outlinePng, bgFillPng] = await Promise.all([
      loadIndexedPngStrict(`/decomp/em/map_popup/${theme}_outline.png`, 4),
      loadIndexedPngStrict(`/decomp/em/map_popup/${theme}.png`, 4),
    ]);
    // Décomp : outline PNG fournit les frame tiles + la palette (= sMapPopUp_PaletteTable
    // est extrait du `_outline.png.gbapal` via INCGFX_U16). bg PNG fournit le fill.
    const loaded: LoadedTheme = {
      outlineTiles: outlinePng.charData,
      bgFillTiles: bgFillPng.charData,
      palette: outlinePng.palette,
    };
    _themeCache[theme] = loaded;
    return loaded;
  } catch (e) {
    console.warn(`[map-name-popup] failed to load theme '${theme}':`, e);
    return null;
  }
}

// ─── ShowMapNamePopup (1:1 décomp map_name_popup.c:231-252) ─────────────────

export function ShowMapNamePopup(): void {
  if (!gMapHeader) return;
  // 1:1 décomp `ShowMapNamePopup` (map_name_popup.c:231) :
  //   if (FlagGet(FLAG_HIDE_MAP_NAME_POPUP) != TRUE) { ... }
  // Skip si le flag est set (= e.g. pendant la cinematic intro où SetIntroFlagsMale
  // le set pour cacher "Bourg-en-Vol" pendant que le dialog Mom est visible).
  // Sans ce check, le popup slide BG0VOFS pendant que le dialog est ouvert →
  // le dialog "rebondit" avec le BG0 scroll.
  if (FlagGet('FLAG_HIDE_MAP_NAME_POPUP')) return;
  const mapsec = gMapHeader.regionMapSectionId;
  if (mapsec === _sLastMapSectionId) return;
  _sLastMapSectionId = mapsec;

  // Pre-load theme async (= used quand SLIDE_IN start ~30 frames plus tard).
  const theme = getThemeForMapsec(mapsec);
  void loadTheme(theme);

  const rt = getRuntime();
  const tasks = rt.gTasks;
  const existingTask = _sPopupTaskId >= 0 ? tasks.get(_sPopupTaskId) : null;
  if (existingTask && existingTask.func === Task_MapNamePopUpWindow) {
    if (existingTask.data[T_STATE] !== STATE_SLIDE_OUT) {
      existingTask.data[T_STATE] = STATE_SLIDE_OUT;
    }
    existingTask.data[T_INCOMING_POPUP] = 1;
    return;
  }

  _sPopupTaskId = rt.CreateTask(Task_MapNamePopUpWindow, 90);
  rt.SetGpuReg(REG_OFFSET_BG0VOFS, POPUP_OFFSCREEN_Y);
  const task = tasks.get(_sPopupTaskId);
  if (!task) return;
  task.data[T_STATE] = STATE_PRINT;
  task.data[T_Y_OFFSET] = POPUP_OFFSCREEN_Y;
  task.data[T_PRINT_TIMER] = 0;
  task.data[T_ONSCREEN_TIMER] = 0;
  task.data[T_INCOMING_POPUP] = 0;
}

// ─── Task state machine (1:1 décomp Task_MapNamePopUpWindow:254-317) ────────

function Task_MapNamePopUpWindow(task: DecompTask): void {
  const rt = getRuntime();
  switch (task.data[T_STATE]) {
    case STATE_PRINT:
      task.data[T_PRINT_TIMER]++;
      if (task.data[T_PRINT_TIMER] > 30) {
        task.data[T_STATE] = STATE_SLIDE_IN;
        task.data[T_PRINT_TIMER] = 0;
        ShowMapNamePopUpWindow();
      }
      break;
    case STATE_SLIDE_IN:
      task.data[T_Y_OFFSET] -= POPUP_SLIDE_SPEED;
      if (task.data[T_Y_OFFSET] <= 0) {
        task.data[T_Y_OFFSET] = 0;
        task.data[T_STATE] = STATE_WAIT;
        task.data[T_ONSCREEN_TIMER] = 0;
      }
      break;
    case STATE_WAIT:
      task.data[T_ONSCREEN_TIMER]++;
      if (task.data[T_ONSCREEN_TIMER] > 120) {
        task.data[T_ONSCREEN_TIMER] = 0;
        task.data[T_STATE] = STATE_SLIDE_OUT;
      }
      break;
    case STATE_SLIDE_OUT:
      task.data[T_Y_OFFSET] += POPUP_SLIDE_SPEED;
      if (task.data[T_Y_OFFSET] >= POPUP_OFFSCREEN_Y) {
        task.data[T_Y_OFFSET] = POPUP_OFFSCREEN_Y;
        if (task.data[T_INCOMING_POPUP]) {
          task.data[T_STATE] = STATE_PRINT;
          task.data[T_PRINT_TIMER] = 0;
          task.data[T_INCOMING_POPUP] = 0;
        } else {
          task.data[T_STATE] = STATE_ERASE;
          return;
        }
      }
      break;
    case STATE_ERASE:
      task.data[T_STATE] = STATE_END;
      break;
    case STATE_END:
      HideMapNamePopUpWindow();
      return;
  }
  rt.SetGpuReg(REG_OFFSET_BG0VOFS, task.data[T_Y_OFFSET]);
}

// ─── Show/Hide window (1:1 décomp map_name_popup.c:319-368) ─────────────────

/** 1:1 décomp `DrawMapNamePopUpFrame(bg, x, y, deltaX, deltaY, _)` (map_name_popup.c:382-401).
 *  Place 12 top + 6 sides + 12 bot = 30 tiles autour du window. Tile indices
 *  référencent les outline tiles uploadées à 0x21D dans BG VRAM. */
function DrawMapNamePopUpFrame(bg: number, x: number, y: number, deltaX: number, deltaY: number): void {
  // Top edge — 12 tiles.
  for (let i = 0; i < 1 + TILE_TOP_EDGE_END - TILE_TOP_EDGE_START; i++) {
    FillBgTilemapBufferRect(bg, TILE_TOP_EDGE_START + i, i - 1 + x, y - 1, 1, 1, POPUP_PALETTE_NUM);
  }
  // Sides.
  FillBgTilemapBufferRect(bg, TILE_LEFT_EDGE_TOP,  x - 1,           y,     1, 1, POPUP_PALETTE_NUM);
  FillBgTilemapBufferRect(bg, TILE_RIGHT_EDGE_TOP, deltaX + x,      y,     1, 1, POPUP_PALETTE_NUM);
  FillBgTilemapBufferRect(bg, TILE_LEFT_EDGE_MID,  x - 1,           y + 1, 1, 1, POPUP_PALETTE_NUM);
  FillBgTilemapBufferRect(bg, TILE_RIGHT_EDGE_MID, deltaX + x,      y + 1, 1, 1, POPUP_PALETTE_NUM);
  FillBgTilemapBufferRect(bg, TILE_LEFT_EDGE_BOT,  x - 1,           y + 2, 1, 1, POPUP_PALETTE_NUM);
  FillBgTilemapBufferRect(bg, TILE_RIGHT_EDGE_BOT, deltaX + x,      y + 2, 1, 1, POPUP_PALETTE_NUM);
  // Bot edge — 12 tiles.
  for (let i = 0; i < 1 + TILE_BOT_EDGE_END - TILE_BOT_EDGE_START; i++) {
    FillBgTilemapBufferRect(bg, TILE_BOT_EDGE_START + i, i - 1 + x, y + deltaY, 1, 1, POPUP_PALETTE_NUM);
  }
}

/** 1:1 décomp `LoadMapNamePopUpWindowBg` (map_name_popup.c:403-426).
 *  Load outline tiles to BG VRAM at 0x21D + DrawMapNamePopUpFrame + theme palette. */
function LoadMapNamePopUpWindowBg(theme: PopupTheme, windowId: number): void {
  void windowId;
  const loaded = _themeCache[theme];
  if (!loaded) {
    console.warn(`[map-name-popup] theme '${theme}' not loaded yet, skipping bg`);
    return;
  }
  // 1:1 décomp : LoadBgTiles(bg, sMapPopUp_OutlineTable[themeId], 0x400, 0x21D).
  // 0x400 bytes = 32 tiles slots (= PNG actually has 30 tiles = 960 bytes).
  const tilesToLoad = Math.min(loaded.outlineTiles.length, 0x400);
  LoadBgTiles(POPUP_WINDOW_TEMPLATE.bg, loaded.outlineTiles, tilesToLoad, 0x21D);
  // 1:1 décomp DrawMapNamePopUpFrame(bg, x=1, y=1, deltaX=10, deltaY=3).
  DrawMapNamePopUpFrame(POPUP_WINDOW_TEMPLATE.bg, POPUP_WINDOW_TEMPLATE.tilemapLeft,
    POPUP_WINDOW_TEMPLATE.tilemapTop, POPUP_WINDOW_TEMPLATE.width, POPUP_WINDOW_TEMPLATE.height);
  // 1:1 décomp : LoadPalette(palette, BG_PLTT_ID(14), sizeof(palette)).
  LoadPalette(loaded.palette, POPUP_PALETTE_FLAT_IDX, loaded.palette.length * 2);
}

function ShowMapNamePopUpWindow(): void {
  if (!gMapHeader) return;
  const mapName = getMapName(gMapHeader.regionMapSectionId);
  const theme = getThemeForMapsec(gMapHeader.regionMapSectionId);
  console.log(`[map-name-popup] ${gMapHeader.regionMapSectionId} → "${mapName}" theme=${theme}`);

  if (_popupWindowId < 0) {
    _popupWindowId = AddWindow(POPUP_WINDOW_TEMPLATE);
  }
  // 1:1 décomp `LoadMapNamePopUpWindowBg` : load theme outline + frame + palette.
  LoadMapNamePopUpWindowBg(theme, _popupWindowId);
  PutWindowTilemap(_popupWindowId);
  // 1:1 décomp `BlitBitmapToWindow(popupWindowId, sMapPopUp_Table[themeId], 0, 0, 80, 24)`.
  // Blit le bg fill texture (= wood pattern, marble pattern, etc.) dans le pixel
  // buffer du window. PNG est 80×24 = exactement la taille de la window content area.
  const themeData = _themeCache[theme];
  if (themeData) {
    BlitBitmapToWindow(_popupWindowId, themeData.bgFillTiles, 0, 0, 80, 24, 80);
  }
  // Render text centré PAR-DESSUS le bg fill.
  // 1:1 décomp `mapDisplayHeader[2] = TEXT_COLOR_TRANSPARENT` (map_name_popup.c:366)
  // → bgColor=0 = skip BOX_FILL pixels = préserve le wood pattern derrière.
  const approxTextWidth = mapName.length * 6;
  const centerX = Math.max(0, Math.floor((80 - approxTextWidth) / 2));
  AddTextPrinterParameterized3(_popupWindowId, 1 /* FONT_NORMAL = 1 */,
    centerX, 3, [0 /* TEXT_COLOR_TRANSPARENT */, 2, 3], 255 /* TEXT_SKIP_DRAW */, mapName);
  CopyWindowToVram(_popupWindowId, 3 /* COPYWIN_FULL */);
}

export function HideMapNamePopUpWindow(): void {
  if (_sPopupTaskId < 0) return;
  const rt = getRuntime();
  if (_popupWindowId >= 0) {
    ClearStdWindowAndFrame(_popupWindowId, true);
    RemoveWindow(_popupWindowId);
    _popupWindowId = -1;
  }
  rt.SetGpuReg(REG_OFFSET_BG0VOFS, 0);
  rt.gTasks.delete(_sPopupTaskId);
  _sPopupTaskId = -1;
}

export function _resetMapNamePopupState(): void {
  _sLastMapSectionId = '';
  HideMapNamePopUpWindow();
}
