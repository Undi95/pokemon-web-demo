/**
 * pokedex.ts — POKéDEX 1:1 décomp `src/pokedex.c` (5605 l) — RÉÉCRITURE PROPRE.
 * ============================================================================
 * Remplace le stub overlay `engine/ui/pokedex-screen.ts` par le VRAI écran plein
 * CB2 de la décomp. Chantier découpé en JALONS A/B (l'œil du user valide chacun) :
 *
 *  JALON 1a (ICI) : substrat CB2 (CB2_OpenPokedex → CB2_Pokedex) + rendu du FOND
 *                   (cadre menu BG3 + tilemaps liste/underlay/start-menu + palette)
 *                   + InitWindows + B pour fermer + câblage start-menu (CB2 swap).
 *  JALON 1b       : liste des mons (n° dex + ball capturé + nom) — CreatePokedexList,
 *                   CreateMonListEntry.
 *  JALON 1c       : sprite du mon + sprites d'interface (curseur, scrollbar, compteurs)
 *                   — CreateInterfaceSprites, CreateMonSpritesAtPos.
 *  JALON 1d       : scroll (TryDoPokedexScroll / UpdateDexListScroll).
 *  JALON 2+       : fiche info, zone, cri, taille, recherche.
 *
 * Pattern CB2-swap IDENTIQUE au bag-menu prouvé : `SetMainCallback2(fn)` reset
 * gMain.state=0 ; le runtime ticke fn chaque frame ; un setup state-machine avance
 * d'UN état/frame ; à la fin → SetMainCallback2(MainCB2_PokedexRun) (corps vide =
 * le runtime fait RunTasks/AnimateSprites/BuildOamBuffer/UpdatePaletteFade).
 *
 * Stubs des jalons suivants = no-op HONNÊTES documentés (jamais de fake silencieux,
 * WORKING-MODE §2) — le fond doit s'afficher seul (livrable A/B du jalon 1a).
 */
import {
  getRuntime, ResetPaletteFade, ResetTasks, FreeAllSpritePalettes,
  ScanlineEffect_Stop, LoadPalette, PlaySE,
} from '../harness/runtime/decomp-globals';
import { ResetSpriteData, setReservedSpritePaletteCount } from './sprite';
import { BeginNormalPaletteFade } from './palette';
import { DeactivateAllTextPrinters } from './text';
import {
  ShowBg, InitWindows, InitBgsFromTemplates, ResetBgsAndClearDma3BusyFlags,
  CopyToBgTilemapBuffer, CopyBgTilemapBufferToVram, PutWindowTilemap,
  CopyWindowToVram, FreeAllWindowBuffers,
  ResetVramOamAndBgCntRegs,
  type WindowTemplate, type BgTemplate,
} from './engine/ui/gba-window-system';
import { BG_PLTT_ID, type DecompTask } from '../harness/runtime/decomp-runtime';
import { loadTileBin, loadTilemapBin, loadGbaPal } from '../harness/gba/png-loader';
import { CB2_ReturnToFieldWithOpenMenu_Manual } from './engine/ui/option-menu-return';

// ─── Constantes 1:1 (pokedex.h / pokedex.c) ──────────────────────────────────
const PAGE_MAIN = 0;
// const PAGE_SEARCH_RESULTS = 1;            // jalon 4
const DEX_MODE_HOENN = 0;
// const DEX_MODE_NATIONAL = 1;              // national : jalon 4
const ORDER_NUMERICAL = 0;
const AREA_SCREEN = 1;                        // selectedScreen défaut (pokedex.c:1637)
const FLAG_GET_SEEN = 0;
const FLAG_GET_CAUGHT = 1;

// REG offsets GBA (io_reg.h) — hex pour SetGpuReg (modèle bag).
const REG_OFFSET_DISPCNT = 0x00;
const REG_OFFSET_BG2VOFS = 0x1a;
const REG_OFFSET_WININ = 0x48;
const REG_OFFSET_WINOUT = 0x4a;
const REG_OFFSET_WIN0H = 0x40;
const REG_OFFSET_WIN0V = 0x44;
const REG_OFFSET_WIN1H = 0x42;
const REG_OFFSET_WIN1V = 0x46;
const REG_OFFSET_BLDCNT = 0x50;
const REG_OFFSET_BLDALPHA = 0x52;
const REG_OFFSET_BLDY = 0x54;
// DISPCNT bits : MODE_0(0) | OBJ_1D_MAP(0x40) | OBJ_ON(0x1000) | OBJWIN_ON(0x8000).
const DISPCNT_POKEDEX = 0x40 | 0x1000 | 0x8000;
// WININ_WIN0_ALL(0x3F) | WININ_WIN1_ALL(0x3F00) ; WINOUT_WIN01_ALL(0x3F) |
// WINOBJ BG0(0x100)|BG2(0x400)|BG3(0x800)|OBJ(0x1000) (pokedex.c:2133-2134).
const WININ_POKEDEX = 0x3f | 0x3f00;
const WINOUT_POKEDEX = 0x3f | 0x100 | 0x400 | 0x800 | 0x1000;
const RGB_BLACK = 0x0000;
const PALETTES_ALL = 0xffffffff;

const ASSET = '/decomp/em/pokedex';

// ─── 1:1 décomp `sPokedex_BgTemplate` (pokedex.c:806) ────────────────────────
const sPokedex_BgTemplate: BgTemplate[] = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 12, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 13, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 14, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 15, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
];

// ─── 1:1 décomp `sPokemonList_WindowTemplate` (pokedex.c) ─────────────────────
const sPokemonList_WindowTemplate: WindowTemplate[] = [
  { bg: 2, tilemapLeft: 0, tilemapTop: 0, width: 32, height: 32, paletteNum: 0, baseBlock: 1 },
];

// ─── struct PokedexView (champs nécessaires aux jalons 1a-1d ; mirror pokedex.h) ──
interface PokedexView {
  dexMode: number;
  dexOrder: number;
  currentPage: number;
  isSearchResults: boolean;
  selectedPokemon: number;
  selectedScreen: number;
  pokeBallRotation: number;
  seenCount: number;
  ownCount: number;
  initialVOffset: number;
  menuY: number;
  menuIsOpen: boolean;
  menuCursorPos: number;
}
let sPokedexView: PokedexView | null = null;
let sLastSelectedPokemon = 0;
let sPokeBallRotation = 0;

// 1:1 décomp `ResetPokedexView` (champs 1a ; le reste = jalons suivants).
function ResetPokedexView(v: PokedexView): void {
  v.dexMode = DEX_MODE_HOENN;
  v.dexOrder = ORDER_NUMERICAL;
  v.currentPage = PAGE_MAIN;
  v.isSearchResults = false;
  v.selectedPokemon = 0;
  v.selectedScreen = AREA_SCREEN;
  v.pokeBallRotation = 0;
  v.seenCount = 0;
  v.ownCount = 0;
  v.initialVOffset = 0;
  v.menuY = 0;
  v.menuIsOpen = false;
  v.menuCursorPos = 0;
}

// ─── Compteurs Vus/Possédés — 1:1 décomp GetHoennPokedexCount (pokedex.c) ─────
// JALON 1c : les compteurs ne sont DESSINÉS qu'au jalon 1c (sprites seen/own).
// Pour 1a on ne les affiche pas → calcul reporté (set 0). STUB HONNÊTE documenté.
function GetHoennPokedexCount(_caseId: number): number {
  return 0; // JALON 1c : brancher sur le système de flags dex (FlagGet SEEN/CAUGHT).
}

// ─── Assets BG (chargés une fois, idempotent) ────────────────────────────────
interface PokedexAssets {
  menuTiles: Uint8Array;          // gPokedexMenu_Gfx (menu.4bpp.bin → BG3 charBase 0)
  listTilemap: Uint16Array;       // gPokedexList_Tilemap (list.bin → BG1)
  underlayTilemap: Uint16Array;   // gPokedexListUnderlay_Tilemap (list_underlay.bin → BG3)
  startMenuTilemap: Uint16Array;  // gPokedexStartMenuMain_Tilemap (start_menu_main.bin → BG0 @0x280)
  bgHoennPal: Uint16Array;        // gPokedexBgHoenn_Pal (bg_hoenn.pal)
}
let _assets: PokedexAssets | null = null;
let _assetsLoading: Promise<PokedexAssets> | null = null;
function _loadAssets(): Promise<PokedexAssets> {
  if (_assets) return Promise.resolve(_assets);
  if (_assetsLoading) return _assetsLoading;
  _assetsLoading = (async () => {
    const [menuTiles, listTilemap, underlayTilemap, startMenuTilemap, bgHoennPal] = await Promise.all([
      loadTileBin(`${ASSET}/menu.png`, 4),          // sibling menu.4bpp.bin (indices bruts)
      loadTilemapBin(`${ASSET}/list.bin`),
      loadTilemapBin(`${ASSET}/list_underlay.bin`),
      loadTilemapBin(`${ASSET}/start_menu_main.bin`),
      loadGbaPal(`${ASSET}/bg_hoenn.pal`),
    ]);
    _assets = { menuTiles, listTilemap, underlayTilemap, startMenuTilemap, bgHoennPal };
    return _assets;
  })();
  return _assetsLoading;
}

// ════════════════════════════════════════════════════════════════════════════
// CB2_OpenPokedex (pokedex.c:1604) — init multi-état
// ════════════════════════════════════════════════════════════════════════════
export function CB2_OpenPokedex(): void {
  const rt = getRuntime();
  if (!rt) return;
  switch (rt.gMain.state) {
    case 0:
    default:
      rt.SetVBlankCallback(null);
      // ResetOtherVideoRegisters(0) + clear VRAM/OAM/PLTT (= ResetVramOamAndBgCntRegs).
      ResetVramOamAndBgCntRegs();
      rt.gMain.state = 1;
      break;
    case 1:
      ScanlineEffect_Stop();
      ResetTasks();
      ResetSpriteData();
      ResetPaletteFade();
      FreeAllSpritePalettes();
      setReservedSpritePaletteCount(8);
      rt.gMain.state++;
      break;
    case 2: {
      const v: PokedexView = {} as PokedexView;
      ResetPokedexView(v);
      sPokedexView = v;
      rt.CreateTask(Task_OpenPokedexMainPage, 0);
      // dexMode/order depuis le saveblock — jalon 4 (national). 1a = Hoenn défaut.
      v.dexMode = DEX_MODE_HOENN;
      v.dexOrder = ORDER_NUMERICAL;
      v.selectedPokemon = sLastSelectedPokemon;
      v.pokeBallRotation = sPokeBallRotation;
      v.selectedScreen = AREA_SCREEN;
      v.seenCount = GetHoennPokedexCount(FLAG_GET_SEEN);
      v.ownCount = GetHoennPokedexCount(FLAG_GET_CAUGHT);
      v.initialVOffset = 8;
      rt.gMain.state++;
      break;
    }
    case 3:
      rt.SetVBlankCallback(VBlankCB_Pokedex);
      rt.SetMainCallback2(MainCB2_PokedexRun);
      // CreatePokedexList(dexMode, dexOrder) — JALON 1b (liste des mons).
      break;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CB2_Pokedex (pokedex.c:1661) = RunTasks/AnimateSprites/BuildOamBuffer/
// UpdatePaletteFade → corps vide « runtime auto-tick » (modèle bag/summary).
// ════════════════════════════════════════════════════════════════════════════
export function MainCB2_PokedexRun(): void { /* runtime auto-tick */ }
export function VBlankCB_Pokedex(): void { /* transferts auto */ }

// ─── Task_OpenPokedexMainPage (pokedex.c:1669) ───────────────────────────────
function Task_OpenPokedexMainPage(task: DecompTask): void {
  if (!sPokedexView) return;
  sPokedexView.isSearchResults = false;
  if (LoadPokedexListPage(PAGE_MAIN))
    task.func = Task_HandlePokedexInput;
}

// ─── Task_HandlePokedexInput (pokedex.c:1678) — JALON 1a : B ferme ───────────
// (A/START/SELECT/scroll = jalons 1b-1d.)
function Task_HandlePokedexInput(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return;
  rt.SetGpuReg(0x14 /* BG0VOFS */, sPokedexView.menuY);
  if (sPokedexView.menuY) {
    sPokedexView.menuY -= 8;
    return;
  }
  const B_BUTTON = 0x0002;
  if (rt.gMain.newKeys & B_BUTTON) {
    BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 0x10, RGB_BLACK);
    task.func = Task_ClosePokedex;
    PlaySE(20 /* SE_PC_OFF */);
  }
  // JALON 1b-1d : A (info), START (menu), SELECT (recherche), D-pad (scroll).
}

// ─── Task_ClosePokedex (pokedex.c) ───────────────────────────────────────────
function Task_ClosePokedex(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  if (rt.gPaletteFade.active) return;
  sLastSelectedPokemon = sPokedexView ? sPokedexView.selectedPokemon : 0;
  sPokeBallRotation = sPokedexView ? sPokedexView.pokeBallRotation : 0;
  FreeWindowAndBgBuffers();
  rt.SetMainCallback2(rt.gMain.savedCallback ?? CB2_ReturnToFieldWithOpenMenu_Manual);
  rt.DestroyTask(task.taskId);
  sPokedexView = null;
  _isOpen = false;
}

// ─── LoadPokedexListPage (pokedex.c:2066) — BG render (jalon 1a) ──────────────
function LoadPokedexListPage(page: number): boolean {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return false;
  switch (rt.gMain.state) {
    case 0:
    default: {
      if (rt.gPaletteFade.active) return false;
      rt.SetVBlankCallback(null);
      sPokedexView.currentPage = page;
      rt.SetGpuReg(REG_OFFSET_BG2VOFS, sPokedexView.initialVOffset);
      ResetBgsAndClearDma3BusyFlags(0);
      InitBgsFromTemplates(0, sPokedex_BgTemplate, sPokedex_BgTemplate.length);
      // SetBgTilemapBuffer(n, …) : buffer intrinsèque par-BG dans le port → no-op.
      // Assets chargés async (idempotent) ; le rendu BG se fait quand prêts.
      void _loadAssets().then((a) => {
        const r = getRuntime();
        if (!r) return;
        // DecompressAndLoadBgGfxUsingHeap(3, gPokedexMenu_Gfx, 0x2000, 0, 0)
        // → BG3 charBase 0 (= charBaseIndex 0 × 0x4000).
        r.gba.vram.set(a.menuTiles, 0 * 0x4000);
        CopyToBgTilemapBuffer(1, a.listTilemap, 0, 0);
        CopyToBgTilemapBuffer(3, a.underlayTilemap, 0, 0);
        CopyToBgTilemapBuffer(0, a.startMenuTilemap, 0, 0x280);
        CopyBgTilemapBufferToVram(0);
        CopyBgTilemapBufferToVram(1);
        CopyBgTilemapBufferToVram(2);
        CopyBgTilemapBufferToVram(3);
        _bgReady = true;
      });
      ResetPaletteFade();
      sPokedexView.isSearchResults = page !== PAGE_MAIN;
      LoadPokedexBgPalette(sPokedexView.isSearchResults);
      InitWindows(sPokemonList_WindowTemplate);
      DeactivateAllTextPrinters();
      PutWindowTilemap(0);
      CopyWindowToVram(0, 3 /* COPYWIN_FULL */);
      rt.gMain.state = 1;
      return false;
    }
    case 1:
      ResetSpriteData();
      FreeAllSpritePalettes();
      setReservedSpritePaletteCount(8);
      // LoadCompressedSpriteSheet(sInterfaceSpriteSheet) + CreateInterfaceSprites
      // → JALON 1c (sprites d'interface).
      rt.gMain.state++;
      return false;
    case 2:
      rt.gMain.state++;
      return false;
    case 3:
      // CreatePokedexList(jalon 1b) + CreateMonSpritesAtPos(jalon 1c).
      sPokedexView.menuIsOpen = false;
      sPokedexView.menuY = 0;
      rt.gMain.state++;
      return false;
    case 4:
      BeginNormalPaletteFade(PALETTES_ALL, 0, 0x10, 0, RGB_BLACK);
      rt.SetVBlankCallback(VBlankCB_Pokedex);
      rt.gMain.state++;
      return false;
    case 5:
      rt.SetGpuReg(REG_OFFSET_WININ, WININ_POKEDEX);
      rt.SetGpuReg(REG_OFFSET_WINOUT, WINOUT_POKEDEX);
      rt.SetGpuReg(REG_OFFSET_WIN0H, 0);
      rt.SetGpuReg(REG_OFFSET_WIN0V, 0);
      rt.SetGpuReg(REG_OFFSET_WIN1H, 0);
      rt.SetGpuReg(REG_OFFSET_WIN1V, 0);
      rt.SetGpuReg(REG_OFFSET_BLDCNT, 0);
      rt.SetGpuReg(REG_OFFSET_BLDALPHA, 0);
      rt.SetGpuReg(REG_OFFSET_BLDY, 0);
      rt.SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_POKEDEX);
      ShowBg(0); ShowBg(1); ShowBg(2); ShowBg(3);
      rt.gMain.state++;
      return false;
    case 6:
      if (!rt.gPaletteFade.active) {
        rt.gMain.state = 0;
        return true;
      }
      return false;
  }
}
let _bgReady = false;

// ─── LoadPokedexBgPalette (pokedex.c:2160) — Hoenn (1a) ──────────────────────
function LoadPokedexBgPalette(isSearchResults: boolean): void {
  if (!_assets) {
    // Palette chargée avec les assets ; si pas encore prête, re-applique au ready.
    void _loadAssets().then(() => { if (!isSearchResults) _applyHoennBgPalette(); });
    return;
  }
  if (!isSearchResults) _applyHoennBgPalette();
}
function _applyHoennBgPalette(): void {
  if (!_assets) return;
  // LoadPalette(gPokedexBgHoenn_Pal + 1, BG_PLTT_ID(0) + 1, PLTT_SIZEOF(6*16 - 1)).
  LoadPalette(_assets.bgHoennPal.subarray(1), BG_PLTT_ID(0) + 1, (6 * 16 - 1) * 2);
}

// ─── FreeWindowAndBgBuffers (pokedex.c:2171) ─────────────────────────────────
function FreeWindowAndBgBuffers(): void {
  FreeAllWindowBuffers();
  // Les buffers tilemap BG sont intrinsèques au runtime (pas d'alloc manuelle) → rien à free.
}

// ════════════════════════════════════════════════════════════════════════════
// Entrée — câblage start menu (1:1 StartMenuPokedexCallback : CB2 swap).
// ════════════════════════════════════════════════════════════════════════════
let _isOpen = false;
export function IsPokedexScreenOpen(): boolean { return _isOpen; }

/** Ouvre le Pokédex en CB2 plein écran (remplace l'overlay).
 *  1:1 décomp `StartMenuPokedexCallback` (start_menu.c:639) : SetMainCallback2(
 *  CB2_OpenPokedex), retour via gMain.savedCallback. */
export function OpenPokedexFromStartMenu(): void {
  const rt = getRuntime();
  if (!rt) return;
  _isOpen = true;
  _bgReady = false;
  rt.gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu_Manual;
  rt.SetMainCallback2(CB2_OpenPokedex);
}
