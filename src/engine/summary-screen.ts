/**
 * summary-screen.ts — Écran RÉSUMÉ Pokémon 1:1 décomp `pokemon_summary_screen.c`.
 *
 * Architecture : CB2 swap (= même pattern que bag/trainer-card/party-screen).
 * Pages 1:1 décomp :
 *   PSS_PAGE_INFO = 0       (= "INFOS")
 *   PSS_PAGE_SKILLS = 1     (= "APTITU")
 *   PSS_PAGE_BATTLE_MOVES = 2 (= "CAPACITES")
 *   PSS_PAGE_CONTEST_MOVES = 3
 *
 * BG layout 1:1 décomp `sBgTemplates` (pokemon_summary_screen.c:319) :
 *   BG0 charBase=0 mapBase=31 priority=0 → text windows
 *   BG1 charBase=2 mapBase=27 priority=1 → page background (= page_info.bin etc.)
 *   BG2 charBase=2 mapBase=25 priority=2 → secondary background
 *   BG3 charBase=2 mapBase=29 priority=3 → tertiary
 *
 * MVP scope (= cette session) :
 *   - CB2 swap pattern fonctionnel
 *   - Render bg page_info.bin sur BG1
 *   - A/B exit return to party screen
 *
 * TODO future polish :
 *   - Mon front sprite (= grande image Pokémon 64×64) à gauche
 *   - Text rendering : nickname, level, type, ability, item, OT, ID, EXP, etc.
 *   - Pages flip 1-5 via R/L buttons
 *   - Status icon, gender symbol, shiny indicator
 */

import {
  InitWindows, FillWindowPixelBuffer, PutWindowTilemap, CopyWindowToVram,
  RemoveWindow, ShowBg, HideBg,
} from './gba-window-system';
import {
  PlaySE, LoadPalette, getRuntime,
  BlendPalettes, ResetPaletteFade, ResetTasks,
} from './decomp-globals';
import { ResetSpriteData } from './decomp-bridge';
import { CB2_ReturnToFieldWithOpenMenu_Manual } from './option-menu-return';
import { FadeScreen, FADE_FROM_BLACK } from './fade-screen';
import { loadGbaPal, loadTilemapBin, loadTileBin } from './gba/png-loader';
import type { DecompTask } from './decomp-runtime';
import type { PokemonInstance } from './pokemon';

/** 1:1 décomp `sBgTemplates` (pokemon_summary_screen.c:319). */
const SUMMARY_TILES_CHAR_BASE_BG0 = 0;
const SUMMARY_TILES_CHAR_BASE_BG123 = 2;
const SUMMARY_WIN_MAP_BASE = 31;     // BG0
const SUMMARY_BG_MAP_BASE = 27;      // BG1 = page bg
const SUMMARY_BG2_MAP_BASE = 25;     // BG2
const SUMMARY_BG3_MAP_BASE = 29;     // BG3

interface SummaryAssets {
  tiles: Uint8Array;
  pageInfoTilemap: Uint16Array;
  pageSkillsTilemap: Uint16Array;
  pageBattleMovesTilemap: Uint16Array;
  tilesPalette: Uint16Array;
}

let _isOpen = false;
let _phase: 'idle' | 'open' | 'fading_out' = 'idle';
let _currentMon: PokemonInstance | null = null;
let _currentPage = 0;  // 0 = INFOS, 1 = APTITU, 2 = CAPACITES
let _assets: SummaryAssets | null = null;
let _assetsLoading: Promise<SummaryAssets> | null = null;
let _inputTaskId = -1;
let _graphicsReady = false;
let _graphicsLoading = false;

async function _loadAssets(): Promise<SummaryAssets> {
  if (_assets) return _assets;
  if (_assetsLoading) return _assetsLoading;
  _assetsLoading = (async () => {
    const [tiles, pageInfo, pageSkills, pageBattleMoves, tilesPal] = await Promise.all([
      loadTileBin('/decomp/em/summary_screen/tiles.png', 4),
      loadTilemapBin('/decomp/em/summary_screen/page_info.bin'),
      loadTilemapBin('/decomp/em/summary_screen/page_skills.bin'),
      loadTilemapBin('/decomp/em/summary_screen/page_battle_moves.bin'),
      loadGbaPal('/decomp/em/summary_screen/tiles.pal'),
    ]);
    _assets = {
      tiles,
      pageInfoTilemap: pageInfo,
      pageSkillsTilemap: pageSkills,
      pageBattleMovesTilemap: pageBattleMoves,
      tilesPalette: tilesPal,
    };
    return _assets;
  })();
  return _assetsLoading;
}

function _initSummaryBgs(rt: ReturnType<typeof getRuntime>): void {
  if (!rt) return;
  rt.SetGpuReg(0x00, 0);
  rt.SetGpuReg(0x08, 0); rt.SetGpuReg(0x0A, 0); rt.SetGpuReg(0x0C, 0); rt.SetGpuReg(0x0E, 0);
  rt.gba.vram.fill(0);
  for (let i = 0; i < rt.gba.oam.length; i++) {
    const oam = rt.gba.oam[i];
    oam.visible = false; oam.x = 0; oam.y = 0;
    oam.tileId = 0; oam.paletteBank = 0; oam.affineMode = 0;
  }
  for (let i = 0; i < 512; i++) {
    rt.gPlttBufferUnfaded.set(i, 0);
    rt.gPlttBufferFaded.set(i, 0);
  }
  for (let i = 0; i < 256; i++) rt.gba.palette.loadBgRange(i, [0]);
  for (let i = 0; i < 256; i++) rt.gba.palette.loadObjRange(i, [0]);
  // 1:1 décomp BG templates (pokemon_summary_screen.c:319).
  const bg0c = rt.gba.bg(0).config;
  bg0c.charBaseIndex = SUMMARY_TILES_CHAR_BASE_BG0; bg0c.mapBaseIndex = SUMMARY_WIN_MAP_BASE;
  bg0c.screenSize = 0; bg0c.paletteMode = 0; bg0c.priority = 0; bg0c.visible = true;
  bg0c.hofs = 0; bg0c.vofs = 0;
  const bg1c = rt.gba.bg(1).config;
  bg1c.charBaseIndex = SUMMARY_TILES_CHAR_BASE_BG123; bg1c.mapBaseIndex = SUMMARY_BG_MAP_BASE;
  // ⚠️ Décomp dit screenSize=1 (= 64×32) mais nos page_*.bin sont 32×32 (= 2048 bytes).
  // screenSize=0 fits le tilemap directement.
  bg1c.screenSize = 0; bg1c.paletteMode = 0; bg1c.priority = 1; bg1c.visible = true;
  bg1c.hofs = 0; bg1c.vofs = 0;
  const bg2c = rt.gba.bg(2).config;
  bg2c.charBaseIndex = SUMMARY_TILES_CHAR_BASE_BG123; bg2c.mapBaseIndex = SUMMARY_BG2_MAP_BASE;
  bg2c.screenSize = 0; bg2c.paletteMode = 0; bg2c.priority = 2; bg2c.visible = false;
  bg2c.hofs = 0; bg2c.vofs = 0;
  const bg3c = rt.gba.bg(3).config;
  bg3c.charBaseIndex = SUMMARY_TILES_CHAR_BASE_BG123; bg3c.mapBaseIndex = SUMMARY_BG3_MAP_BASE;
  bg3c.screenSize = 0; bg3c.paletteMode = 0; bg3c.priority = 3; bg3c.visible = false;
  bg3c.hofs = 0; bg3c.vofs = 0;
  rt.SetGpuReg(0x10, 0); rt.SetGpuReg(0x12, 0);
  rt.SetGpuReg(0x14, 0); rt.SetGpuReg(0x16, 0);
  rt.SetGpuReg(0x18, 0); rt.SetGpuReg(0x1A, 0);
  rt.SetGpuReg(0x00, 0x1000 | 0x40 | 0x100 | 0x200);
  rt.SetGpuReg(0x50, 0);
  ShowBg(0); ShowBg(1); HideBg(2); HideBg(3);
}

function _loadSummaryGraphicsCb2(rt: ReturnType<typeof getRuntime>): boolean {
  if (!rt) return false;
  if (_graphicsReady) return true;
  if (_graphicsLoading) return false;
  _graphicsLoading = true;
  void _loadAssets().then((assets) => {
    const r = getRuntime();
    if (!r) { _graphicsLoading = false; return; }
    // Load tiles à charBase=2 (= shared BG1/2/3).
    const charOff = SUMMARY_TILES_CHAR_BASE_BG123 * 0x4000;
    r.gba.vram.set(assets.tiles, charOff);
    // Load page tilemap selon _currentPage.
    const tilemap = _currentPage === 0 ? assets.pageInfoTilemap
                  : _currentPage === 1 ? assets.pageSkillsTilemap
                  : assets.pageBattleMovesTilemap;
    // BG1 mapBase=27 reçoit la page bg tilemap.
    const bgMapOff = SUMMARY_BG_MAP_BASE * 0x800;
    const bgBytes = new Uint8Array(
      tilemap.buffer, tilemap.byteOffset, tilemap.byteLength,
    );
    r.gba.vram.set(bgBytes, bgMapOff);
    // Load palette.
    LoadPalette(assets.tilesPalette, 0, assets.tilesPalette.length * 2);
    _graphicsReady = true;
    _graphicsLoading = false;
  }).catch((e) => {
    console.error('[summary-screen] graphics load failed:', e);
    _graphicsLoading = false;
  });
  return false;
}

function _freeSummary(): void {
  _isOpen = false;
  _phase = 'idle';
  _currentMon = null;
  _currentPage = 0;
  _graphicsReady = false;
  _graphicsLoading = false;
}

function Task_FadeAndCloseSummary(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  FadeScreen(1 /* FADE_TO_BLACK */, 0);
  task.func = Task_CloseSummary;
}

function Task_CloseSummary(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || rt.gPaletteFade.active) return;
  _freeSummary();
  const exitCb = rt.gMain.savedCallback;
  if (exitCb) rt.SetMainCallback2(exitCb);
  else rt.SetMainCallback2(null);
  rt.DestroyTask(task.taskId);
  _inputTaskId = -1;
}

/** Input handler 1:1 décomp `Task_HandleInput` (pokemon_summary_screen.c).
 *  MVP : A/B → close. Future : R/L → page flip. */
function Task_Summary_HandleInput(_task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  if (_phase !== 'open') return;
  const newKeys = rt.gMain.newKeys;
  const KEY_A = 0x0001, KEY_B = 0x0002;
  if (newKeys & (KEY_A | KEY_B)) {
    PlaySE(5);
    CloseSummaryScreen();
  }
}

export function VBlankCB_SummaryRun(): void { /* transferts auto */ }
export function MainCB2_SummaryRun(): void { /* tasks/fade tick auto */ }

export function CB2_InitSummaryScreen(): void {
  const rt = getRuntime();
  if (!rt) return;
  switch (rt.gMain.state) {
    case 0: rt.SetVBlankCallback(null); rt.gMain.state++; break;
    case 1: rt.gMain.state++; break;
    case 2: rt.gMain.state++; break;
    case 3:
      ResetPaletteFade();
      rt.gPaletteFade.bufferTransferDisabled = true;
      rt.gMain.state++; break;
    case 4: ResetSpriteData(); rt.gMain.state++; break;
    case 5: rt.gMain.state++; break;
    case 6: ResetTasks(); rt.gMain.state++; break;
    case 7:
      _initSummaryBgs(rt);
      _graphicsReady = false; _graphicsLoading = false;
      rt.gMain.state++; break;
    case 8:
      if (!_loadSummaryGraphicsCb2(rt)) break;
      rt.gMain.state++; break;
    case 9:
      // Init windows (= TODO text windows pour stats).
      // For MVP, juste advance.
      InitWindows([]);
      rt.gMain.state++; break;
    case 10: _phase = 'open'; rt.gMain.state++; break;
    case 11: rt.gMain.state++; break;
    case 12:
      _inputTaskId = rt.CreateTask(Task_Summary_HandleInput, 0);
      rt.gMain.state++; break;
    case 13: rt.gMain.state++; break;
    case 14: rt.gMain.state++; break;
    case 15: rt.gMain.state++; break;
    case 16: rt.gMain.state++; break;
    case 17: rt.gMain.state++; break;
    case 18: rt.gMain.state++; break;
    case 19:
      BlendPalettes(0xFFFFFFFF, 16, 0);
      rt.gMain.state++; break;
    case 20:
      FadeScreen(FADE_FROM_BLACK, 0);
      rt.gPaletteFade.bufferTransferDisabled = false;
      PlaySE(6);
      rt.gMain.state++; break;
    default:
      rt.SetVBlankCallback(VBlankCB_SummaryRun);
      rt.SetMainCallback2(MainCB2_SummaryRun);
      _isOpen = true;
      return;
  }
}

export function IsSummaryScreenOpen(): boolean {
  return _isOpen;
}

export function OpenSummaryScreen(mon: PokemonInstance): void {
  if (_isOpen) return;
  _currentMon = mon;
  _currentPage = 0;
  void _loadAssets().then(() => {
    const rt = getRuntime();
    if (!rt) return;
    rt.gMain.state = 0;
    rt.gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu_Manual;
    rt.SetMainCallback2(CB2_InitSummaryScreen);
  }).catch((e) => {
    console.error('[summary-screen] preload failed', e);
  });
}

export function CloseSummaryScreen(): void {
  if (!_isOpen || _phase === 'fading_out') return;
  _phase = 'fading_out';
  const rt = getRuntime();
  if (!rt) return;
  if (_inputTaskId >= 0) {
    rt.DestroyTask(_inputTaskId);
    _inputTaskId = -1;
  }
  rt.CreateTask(Task_FadeAndCloseSummary, 0);
}

// Expose to globalThis pour debug.
{
  const _g: Record<string, unknown> = {
    CB2_InitSummaryScreen, OpenSummaryScreen, CloseSummaryScreen, IsSummaryScreenOpen,
  };
  for (const [k, v] of Object.entries(_g)) {
    if (typeof (globalThis as Record<string, unknown>)[k] === 'undefined') {
      (globalThis as Record<string, unknown>)[k] = v;
    }
  }
}
