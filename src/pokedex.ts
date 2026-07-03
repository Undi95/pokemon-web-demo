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
  ScanlineEffect_Stop, LoadPalette, PlaySE, IsSEPlaying,
  LoadCompressedSpriteSheet, LoadSpritePalettes, assetCache,
} from '../harness/runtime/decomp-globals';
import {
  ResetSpriteData, setReservedSpritePaletteCount,
  CreateSprite, DestroySprite, SetOamMatrix,
  ANIMCMD_FRAME, ANIMCMD_END, type SpriteTemplate,
} from './sprite';
import { gSineTable } from './trig';
import type { DecompSprite } from '../harness/runtime/decomp-runtime';
import { BeginNormalPaletteFade } from './palette';
import { DeactivateAllTextPrinters } from './text';
import {
  ShowBg, HideBg, InitWindows, InitBgsFromTemplates, ResetBgsAndClearDma3BusyFlags,
  CopyToBgTilemapBuffer, CopyBgTilemapBufferToVram, GetBgTilemapBuffer, PutWindowTilemap,
  CopyWindowToVram, FreeAllWindowBuffers, FillWindowPixelRect, FillWindowPixelBuffer, BlitBitmapToWindow,
  ResetVramOamAndBgCntRegs,
  type WindowTemplate, type BgTemplate,
} from './window';
import { FONT_NARROW, TEXT_SKIP_DRAW } from './text';
import { AddTextPrinterParameterized4 } from './menu';
import { TEXT_COLOR_TRANSPARENT, TEXT_COLOR_LIGHT_GRAY, TEXT_COLOR_DARK_GRAY, TEXT_DYNAMIC_COLOR_6 } from '../include/constants/characters';
import { BG_PLTT_ID, type DecompTask } from '../harness/runtime/decomp-runtime';
import { loadTileBin, loadTilemapBin, loadGbaPal, loadIndexedPngRawIndices } from '../harness/gba/png-loader';
import { CopyMonCategoryText, GetStringCenterAlignXOffset } from './international_string_util';
import { CopyToWindowPixelBuffer } from './window';
import { getString } from './engine/ui/gba-strings';
import { gPokedexEntries } from './data/pokemon/pokedex_entries';
import { FONT_NORMAL } from '../include/text';
import { EOS, CHAR_SPACER, CHAR_0, CHAR_COMMA } from '../include/constants/characters';
import { encodeOwText, GetPlayerNameString } from './text';
import { ShowPokedexAreaScreen } from './pokedex_area_screen';
import {
  LoadCryWaveformWindow, LoadCryMeter, UpdateCryWaveformWindow, CryScreenPlayButton,
  IsCryPlaying, FreeCryScreen, setDexCryScreenState,
} from './pokedex_cry_screen';
import { pauseBgm, resumeBgm } from '../harness/runtime/decomp-globals';
import { CB2_ReturnToFieldWithOpenMenu_Manual } from './overworld';
import {
  GetSetPokedexFlag, GetHoennPokedexCount as DexGetHoennCount,
  NationalToHoennOrder, HoennToNationalOrder, NationalPokedexNumToSpecies,
  HOENN_DEX_COUNT, NATIONAL_DEX_COUNT,
} from './engine/ui/pokedex-flags';
import { gSpeciesNames, getSpeciesInfo } from './engine/data/game-data';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import { DisableNationalPokedex, IsNationalPokedexEnabled } from './event_data';
import { GetOverworldTextboxPalettePtr } from './text_window';
import {
  gPokedexOrder_Alphabetical, gPokedexOrder_Weight, gPokedexOrder_Height,
} from './data/pokedex_orders';
import { GetNationalPokedexCount } from './engine/ui/pokedex-flags';
import {
  SE_PC_OFF, SE_DEX_SCROLL, SE_DEX_PAGE, SE_PIN, SE_FAILURE, SE_SELECT,
  SE_PC_LOGIN, SE_BALL, SE_DEX_SEARCH, SE_SUCCESS, SE_TRUCK_DOOR,
} from '../include/constants/songs';
import { reverseDecompConstant } from '../harness/runtime/decomp-constants';

// ─── Constantes 1:1 (pokedex.h / pokedex.c) ──────────────────────────────────
// 1:1 enum pages (pokedex.c:32-42) : MAIN/INFO/SEARCH/SEARCH_RESULTS/UNK/AREA/CRY/SIZE.
const PAGE_MAIN = 0;
const PAGE_INFO = 1;
const PAGE_SEARCH_RESULTS = 3;
const PAGE_AREA = 5;
const PAGE_CRY = 6;
const PAGE_SIZE = 7;

const DEX_MODE_HOENN = 0;
const DEX_MODE_NATIONAL = 1;
const ORDER_NUMERICAL = 0;
const ORDER_ALPHABETICAL = 1;
const ORDER_HEAVIEST = 2;
const ORDER_LIGHTEST = 3;
const ORDER_TALLEST = 4;
const ORDER_SMALLEST = 5;
const PAGE_SEARCH = 2;
// 1:1 enum écrans (pokedex.c:44) — AREA en PREMIER = 0 (selectedScreen défaut, pokedex.c:1637).
const AREA_SCREEN = 0;
const CRY_SCREEN = 1;
const SIZE_SCREEN = 2;
const CANCEL_SCREEN = 3;
const SCREEN_COUNT = 4;
const FLAG_GET_SEEN = 0;
const FLAG_GET_CAUGHT = 1;

// Fiche info (JALON 2). MON_PAGE = position cible du mon sur la fiche (pokedex.c:115).
const MON_PAGE_X = 48;
const MON_PAGE_Y = 56;
// Index des fenêtres de la fiche (1:1 enum WIN_INFO/WIN_FOOTPRINT/WIN_CRY_WAVE/WIN_VU_METER).
const WIN_INFO = 0;
const WIN_FOOTPRINT = 1;
const WIN_CRY_WAVE = 2;
const WIN_VU_METER = 3;
// REG offsets HOFS/VOFS (io_reg.h) — pour ResetOtherVideoRegisters.
const REG_OFFSET_BG0HOFS = 0x10;
const REG_OFFSET_BG0VOFS = 0x12;
const REG_OFFSET_BG1HOFS = 0x14;
const REG_OFFSET_BG1VOFS = 0x16;
const REG_OFFSET_BG2HOFS = 0x18;
const REG_OFFSET_BG3HOFS = 0x1c;
const REG_OFFSET_BG3VOFS = 0x1e;
// DISPCNT fiche info (pokedex.c:3324) : OBJ_1D_MAP(0x40) | OBJ_ON(0x1000) (pas d'OBJWIN).
const DISPCNT_INFO = 0x40 | 0x1000;
// Bits DISPCNT BGx_ON / OBJ_ON pour ResetOtherVideoRegisters (regBits).
const DISPCNT_BG0_ON = 0x100, DISPCNT_BG1_ON = 0x200, DISPCNT_BG2_ON = 0x400, DISPCNT_BG3_ON = 0x800, DISPCNT_OBJ_ON = 0x1000;

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

// ─── 1:1 décomp `sInfoScreen_BgTemplate` (pokedex.c:871) ──────────────────────
// BG0 = WIN_CRY_WAVE (cri, jalon 3) ; BG1 = barre de sélection ; BG2 = WIN_INFO/FOOTPRINT ;
// BG3 = cadre de la fiche (info_screen.bin sur les tiles menu, charBase 0).
const sInfoScreen_BgTemplate: BgTemplate[] = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 12, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 13, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 14, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 15, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
];

// ─── 1:1 décomp `sInfoScreen_WindowTemplates` (pokedex.c:911) ─────────────────
const sInfoScreen_WindowTemplates: WindowTemplate[] = [
  /* WIN_INFO     */ { bg: 2, tilemapLeft: 0,  tilemapTop: 0,  width: 32, height: 20, paletteNum: 0,  baseBlock: 1 },
  /* WIN_FOOTPRINT*/ { bg: 2, tilemapLeft: 25, tilemapTop: 8,  width: 2,  height: 2,  paletteNum: 15, baseBlock: 641 },
  /* WIN_CRY_WAVE */ { bg: 0, tilemapLeft: 0,  tilemapTop: 12, width: 32, height: 7,  paletteNum: 8,  baseBlock: 645 },
  /* WIN_VU_METER */ { bg: 2, tilemapLeft: 18, tilemapTop: 3,  width: 10, height: 8,  paletteNum: 9,  baseBlock: 869 },
];

// ─── struct PokedexView (champs nécessaires aux jalons 1a-1d ; mirror pokedex.h) ──
interface PokedexListItem { dexNum: number; seen: boolean; owned: boolean }
interface PokedexView {
  dexMode: number;
  dexOrder: number;
  currentPage: number;
  currentPageBackup: number;
  isSearchResults: boolean;
  selectedPokemon: number;
  selectedPokemonBackup: number;
  dexModeBackup: number;
  dexOrderBackup: number;
  pokeBallRotationBackup: number;
  selectedScreen: number;
  screenSwitchState: number;   // 1:1 pokedex.h (dispatch inter-écrans fiche/zone/cri/taille)
  pokeBallRotation: number;
  seenCount: number;
  ownCount: number;
  initialVOffset: number;
  menuY: number;
  menuIsOpen: boolean;
  menuCursorPos: number;
  pokedexList: PokedexListItem[];
  pokemonListCount: number;
  listVOffset: number;
  listMovingVOffset: number;
  monSpriteIds: number[];        // 1:1 monSpriteIds[MAX_MONS_ON_SCREEN]
  selectedMonSpriteId: number;   // 1:1 selectedMonSpriteId
  // 1:1 état de scroll (pokedex.h struct PokedexView).
  scrollTimer: number;
  maxScrollTimer: number;
  scrollMonIncrement: number;
  scrollDirection: number;
  scrollSpeed: number;
  pokeBallRotationStep: number;
}
let sPokedexView: PokedexView | null = null;
let sLastSelectedPokemon = 0;
// 1:1 décomp `ResetPokedexScrollPositions`/`ResetPokedex` (pokedex.c:1540/1516) : posent
// sPokeBallRotation = POKEBALL_ROTATION_TOP (64). ResetPokedex est câblé dans
// NewGameInitData (new_game.ts) ; init statique = même valeur pour les autres boots.
let sPokeBallRotation = 64; // POKEBALL_ROTATION_TOP

// 1:1 décomp `ResetPokedexView` (champs 1a ; le reste = jalons suivants).
function ResetPokedexView(v: PokedexView): void {
  v.dexMode = DEX_MODE_HOENN;
  v.dexOrder = ORDER_NUMERICAL;
  v.currentPage = PAGE_MAIN;
  v.currentPageBackup = PAGE_MAIN;
  v.isSearchResults = false;
  v.selectedPokemon = 0;
  v.selectedPokemonBackup = 0;
  v.dexModeBackup = DEX_MODE_HOENN;
  v.dexOrderBackup = ORDER_NUMERICAL;
  v.pokeBallRotationBackup = 0;
  v.selectedScreen = AREA_SCREEN;
  v.screenSwitchState = 0;
  v.pokeBallRotation = 0;
  v.seenCount = 0;
  v.ownCount = 0;
  v.initialVOffset = 0;
  v.menuY = 0;
  v.menuIsOpen = false;
  v.menuCursorPos = 0;
  // 1:1 décomp ResetPokedexView : pokedexList[NATIONAL_DEX_COUNT] dexNum=0xFFFF, +1 sentinelle.
  v.pokedexList = [];
  for (let i = 0; i < NATIONAL_DEX_COUNT; i++) v.pokedexList[i] = { dexNum: 0xffff, seen: false, owned: false };
  v.pokedexList[NATIONAL_DEX_COUNT] = { dexNum: 0, seen: false, owned: false };
  v.pokemonListCount = 0;
  v.listVOffset = 0;
  v.listMovingVOffset = 0;
  v.monSpriteIds = [0xffff, 0xffff, 0xffff, 0xffff];   // MAX_MONS_ON_SCREEN = 4
  v.selectedMonSpriteId = 0xffff;
  v.scrollTimer = 0;
  v.maxScrollTimer = 0;
  v.scrollMonIncrement = 0;
  v.scrollDirection = 0;
  v.scrollSpeed = 0;
  v.pokeBallRotationStep = 0;
}

// Compteurs Vus/Possédés = GetHoennPokedexCount (pokedex-flags.ts, déjà porté 1:1).
// (Affichés en JALON 1c via SpriteCB_SeenOwnInfo ; calculés ici dès 1a.)

// ─── Assets BG (chargés une fois, idempotent) ────────────────────────────────
interface PokedexAssets {
  menuTiles: Uint8Array;          // gPokedexMenu_Gfx (menu.4bpp.bin → BG3 charBase 0)
  listTilemap: Uint16Array;       // gPokedexList_Tilemap (list.bin → BG1)
  underlayTilemap: Uint16Array;   // gPokedexListUnderlay_Tilemap (list_underlay.bin → BG3)
  startMenuTilemap: Uint16Array;  // gPokedexStartMenuMain_Tilemap (start_menu_main.bin → BG0 @0x280)
  bgHoennPal: Uint16Array;        // gPokedexBgHoenn_Pal (bg_hoenn.pal)
  caughtBall: Uint8Array;         // sCaughtBall_Gfx (caught_ball.4bpp.bin, 8×16 icône ball capturée)
  interfaceTiles: Uint8Array;     // gPokedexInterface_Gfx (interface.4bpp.bin, sprites d'interface)
  infoScreenTilemap: Uint16Array;        // gPokedexInfoScreen_Tilemap (info_screen.bin → BG3, fiche)
  screenSelectBarMainTilemap: Uint16Array; // gPokedexScreenSelectBarMain_Tilemap (screen_select_bar_main.bin → BG1)
  sizeScreenTilemap: Uint16Array;          // gPokedexSizeScreen_Tilemap (size_screen.bin → BG3, écran TAILLE)
  screenSelectBarSubmenuTilemap: Uint16Array; // gPokedexScreenSelectBarSubmenu_Tilemap (CRI/TAILLE/RETOUR)
  sizeSilhouettePal: Uint16Array;          // sSizeScreenSilhouette_Pal (silhouettes violettes)
  cryScreenTilemap: Uint16Array;           // gPokedexCryScreen_Tilemap (cry_screen.bin, cadre CRI)
  // ─── Jalon 4 : recherche / National ───
  searchMenuTiles: Uint8Array;             // gPokedexSearchMenu_Gfx (search_menu.4bpp.bin → BG3 charBase 0)
  searchMenuPal: Uint16Array;              // gPokedexSearchMenu_Pal (search_menu.pal, 4 banks)
  searchHoennTilemap: Uint16Array;         // gPokedexSearchMenuHoenn_Tilemap
  searchNationalTilemap: Uint16Array;      // gPokedexSearchMenuNational_Tilemap
  searchResultsBgPal: Uint16Array;         // gPokedexSearchResults_Pal (search_results_bg.pal)
  bgNationalPal: Uint16Array;              // gPokedexBgNational_Pal (bg_national.pal)
  startMenuSearchResultsTilemap: Uint16Array; // gPokedexStartMenuSearchResults_Tilemap
}
let _assets: PokedexAssets | null = null;
let _assetsLoading: Promise<PokedexAssets> | null = null;
function _loadAssets(): Promise<PokedexAssets> {
  if (_assets) return Promise.resolve(_assets);
  if (_assetsLoading) return _assetsLoading;
  _assetsLoading = (async () => {
    const [menuTiles, listTilemap, underlayTilemap, startMenuTilemap, bgHoennPal, caughtBall, interfaceTiles, infoScreenTilemap, screenSelectBarMainTilemap, sizeScreenTilemap, screenSelectBarSubmenuTilemap, sizeSilhouettePal, cryScreenTilemap, searchMenuTiles, searchMenuPal, searchHoennTilemap, searchNationalTilemap, searchResultsBgPal, bgNationalPal, startMenuSearchResultsTilemap] = await Promise.all([
      loadTileBin(`${ASSET}/menu.png`, 4),          // sibling menu.4bpp.bin (indices bruts)
      loadTilemapBin(`${ASSET}/list.bin`),
      loadTilemapBin(`${ASSET}/list_underlay.bin`),
      loadTilemapBin(`${ASSET}/start_menu_main.bin`),
      loadGbaPal(`${ASSET}/bg_hoenn.pal`),
      loadTileBin(`${ASSET}/caught_ball.png`, 4),    // sibling caught_ball.4bpp.bin
      loadTileBin(`${ASSET}/interface.png`, 4),      // sibling interface.4bpp.bin (sprites)
      loadTilemapBin(`${ASSET}/info_screen.bin`),    // gPokedexInfoScreen_Tilemap (cadre fiche)
      loadTilemapBin(`${ASSET}/screen_select_bar_main.bin`), // barre de sélection bas de fiche
      loadTilemapBin(`${ASSET}/size_screen.bin`),    // gPokedexSizeScreen_Tilemap (cadre TAILLE)
      loadTilemapBin(`${ASSET}/screen_select_bar_submenu.bin`), // barre CRI/TAILLE/RETOUR
      loadGbaPal(`${ASSET}/size_silhouette.pal`),    // sSizeScreenSilhouette_Pal
      loadTilemapBin(`${ASSET}/cry_screen.bin`),     // gPokedexCryScreen_Tilemap (cadre CRI)
      loadTileBin(`${ASSET}/search_menu.png`, 4),    // sibling search_menu.4bpp.bin
      loadGbaPal(`${ASSET}/search_menu.pal`),
      loadTilemapBin(`${ASSET}/search_menu_hoenn.bin`),
      loadTilemapBin(`${ASSET}/search_menu_national.bin`),
      loadGbaPal(`${ASSET}/search_results_bg.pal`),
      loadGbaPal(`${ASSET}/bg_national.pal`),
      loadTilemapBin(`${ASSET}/start_menu_search_results.bin`),
    ]);
    _assets = { menuTiles, listTilemap, underlayTilemap, startMenuTilemap, bgHoennPal, caughtBall, interfaceTiles, infoScreenTilemap, screenSelectBarMainTilemap, sizeScreenTilemap, screenSelectBarSubmenuTilemap, sizeSilhouettePal, cryScreenTilemap, searchMenuTiles, searchMenuPal, searchHoennTilemap, searchNationalTilemap, searchResultsBgPal, bgNationalPal, startMenuSearchResultsTilemap };
    // assetCache keyed pour LoadCompressedSpriteSheet/LoadSpritePalettes (sprites d'interface, TAG 4096).
    assetCache.set('gPokedexInterface_Gfx', interfaceTiles);
    assetCache.set('gPokedexBgHoenn_Pal', bgHoennPal);
    return _assets;
  })();
  return _assetsLoading;
}

// ─── Liste des mons (JALON 1b) ───────────────────────────────────────────────
// const LIST_SCROLL_STEP = 16;   // JALON 1d (scroll Up/Down)

// 1:1 décomp `CreatePokedexList` (pokedex.c:2190) — 6 ordres + mode National.
function CreatePokedexList(dexMode: number, order: number): void {
  if (!sPokedexView) return;
  const v = sPokedexView;
  v.pokemonListCount = 0;

  let dexCount: number;
  let isHoennDex: boolean;
  switch (dexMode) {
    default:
    case DEX_MODE_HOENN:
      dexCount = HOENN_DEX_COUNT;
      isHoennDex = true;
      break;
    case DEX_MODE_NATIONAL:
      if (IsNationalPokedexEnabled()) {
        dexCount = NATIONAL_DEX_COUNT;
        isHoennDex = false;
      } else {
        dexCount = HOENN_DEX_COUNT;
        isHoennDex = true;
      }
      break;
  }

  switch (order) {
    case ORDER_NUMERICAL:
      if (isHoennDex) {
        for (let i = 0; i < dexCount; i++) {
          const dexNum = HoennToNationalOrder(i + 1);
          v.pokedexList[i].dexNum = dexNum;
          v.pokedexList[i].seen = GetSetPokedexFlag(dexNum, FLAG_GET_SEEN) !== 0;
          v.pokedexList[i].owned = GetSetPokedexFlag(dexNum, FLAG_GET_CAUGHT) !== 0;
          if (v.pokedexList[i].seen) v.pokemonListCount = i + 1;
        }
      } else {
        // 1:1 : la liste nationale COMMENCE au premier vu (r10 = « déjà croisé un vu »).
        let r5 = 0, r10 = 0;
        for (let i = 0; i < dexCount; i++) {
          const dexNum = i + 1;
          if (GetSetPokedexFlag(dexNum, FLAG_GET_SEEN)) r10 = 1;
          if (r10) {
            v.pokedexList[r5].dexNum = dexNum;
            v.pokedexList[r5].seen = GetSetPokedexFlag(dexNum, FLAG_GET_SEEN) !== 0;
            v.pokedexList[r5].owned = GetSetPokedexFlag(dexNum, FLAG_GET_CAUGHT) !== 0;
            if (v.pokedexList[r5].seen) v.pokemonListCount = r5 + 1;
            r5++;
          }
        }
      }
      break;
    case ORDER_ALPHABETICAL:
      for (let i = 0; i < gPokedexOrder_Alphabetical.length /* NUM_SPECIES - 1 */; i++) {
        const dexNum = gPokedexOrder_Alphabetical[i];
        if (NationalToHoennOrder(dexNum) <= dexCount && GetSetPokedexFlag(dexNum, FLAG_GET_SEEN)) {
          v.pokedexList[v.pokemonListCount].dexNum = dexNum;
          v.pokedexList[v.pokemonListCount].seen = true;
          v.pokedexList[v.pokemonListCount].owned = GetSetPokedexFlag(dexNum, FLAG_GET_CAUGHT) !== 0;
          v.pokemonListCount++;
        }
      }
      break;
    case ORDER_HEAVIEST:
      for (let i = NATIONAL_DEX_COUNT - 1; i >= 0; i--) {
        const dexNum = gPokedexOrder_Weight[i];
        if (NationalToHoennOrder(dexNum) <= dexCount && GetSetPokedexFlag(dexNum, FLAG_GET_CAUGHT)) {
          v.pokedexList[v.pokemonListCount].dexNum = dexNum;
          v.pokedexList[v.pokemonListCount].seen = true;
          v.pokedexList[v.pokemonListCount].owned = true;
          v.pokemonListCount++;
        }
      }
      break;
    case ORDER_LIGHTEST:
      for (let i = 0; i < NATIONAL_DEX_COUNT; i++) {
        const dexNum = gPokedexOrder_Weight[i];
        if (NationalToHoennOrder(dexNum) <= dexCount && GetSetPokedexFlag(dexNum, FLAG_GET_CAUGHT)) {
          v.pokedexList[v.pokemonListCount].dexNum = dexNum;
          v.pokedexList[v.pokemonListCount].seen = true;
          v.pokedexList[v.pokemonListCount].owned = true;
          v.pokemonListCount++;
        }
      }
      break;
    case ORDER_TALLEST:
      for (let i = NATIONAL_DEX_COUNT - 1; i >= 0; i--) {
        const dexNum = gPokedexOrder_Height[i];
        if (NationalToHoennOrder(dexNum) <= dexCount && GetSetPokedexFlag(dexNum, FLAG_GET_CAUGHT)) {
          v.pokedexList[v.pokemonListCount].dexNum = dexNum;
          v.pokedexList[v.pokemonListCount].seen = true;
          v.pokedexList[v.pokemonListCount].owned = true;
          v.pokemonListCount++;
        }
      }
      break;
    case ORDER_SMALLEST:
      for (let i = 0; i < NATIONAL_DEX_COUNT; i++) {
        const dexNum = gPokedexOrder_Height[i];
        if (NationalToHoennOrder(dexNum) <= dexCount && GetSetPokedexFlag(dexNum, FLAG_GET_CAUGHT)) {
          v.pokedexList[v.pokemonListCount].dexNum = dexNum;
          v.pokedexList[v.pokemonListCount].seen = true;
          v.pokedexList[v.pokemonListCount].owned = true;
          v.pokemonListCount++;
        }
      }
      break;
  }

  // 1:1 décomp pokedex.c:2328-2333 : efface (dexNum=0xFFFF) toutes les entrées au-delà.
  for (let i = v.pokemonListCount; i < NATIONAL_DEX_COUNT; i++) {
    v.pokedexList[i].dexNum = 0xffff;
    v.pokedexList[i].seen = false;
    v.pokedexList[i].owned = false;
  }
}

// 1:1 décomp `PrintMonDexNumAndName` (pokedex.c) : couleurs [TRANSPARENT, DYNAMIC_6, LIGHT_GRAY].
function PrintMonDexNumAndName(windowId: number, fontId: number, str: string, left: number, top: number): void {
  const color: [number, number, number] = [TEXT_COLOR_TRANSPARENT, TEXT_DYNAMIC_COLOR_6, TEXT_COLOR_LIGHT_GRAY];
  AddTextPrinterParameterized4(windowId, fontId, left * 8, top * 8 + 1, 0, 0, color, TEXT_SKIP_DRAW, str);
}

// 1:1 décomp `CreateMonDexNum` (pokedex.c:2436) : "{NO}" + n° dex 3 chiffres (Hoenn).
function CreateMonDexNum(entryNum: number, left: number, top: number): void {
  if (!sPokedexView) return;
  let dexNum = sPokedexView.pokedexList[entryNum].dexNum;
  if (sPokedexView.dexMode === DEX_MODE_HOENN) dexNum = NationalToHoennOrder(dexNum);
  PrintMonDexNumAndName(0, FONT_NARROW, '{NO}' + String(dexNum % 1000).padStart(3, '0'), left, top);
}

// 1:1 décomp `CreateCaughtBall` (pokedex.c:2451) : icône ball si possédé, sinon vide.
function CreateCaughtBall(owned: boolean, x: number, y: number): void {
  if (owned && _assets) BlitBitmapToWindow(0, _assets.caughtBall, x * 8, y * 8, 8, 16);
  else FillWindowPixelRect(0, 0, x * 8, y * 8, 8, 16);
}

// 1:1 décomp `CreateMonName` (pokedex.c:2459) : nom espèce ou "----------" (non vu).
function CreateMonName(num: number, left: number, top: number): void {
  const species = NationalPokedexNumToSpecies(num);
  const str = species ? (gSpeciesNames[species] ?? '----------') : '----------';
  PrintMonDexNumAndName(0, FONT_NARROW, str, left, top);
}

// 1:1 décomp `ClearMonListEntry` (pokedex.c:2472).
function ClearMonListEntry(x: number, y: number): void {
  FillWindowPixelRect(0, 0, x * 8, y * 8, 0x60, 16);
}

// 1:1 décomp `CreateMonListEntry` (pokedex.c:2347) — case 0 (Initial : 11 lignes centrées sur b),
// case 1 (Up : 1 ligne au sommet à listVOffset), case 2 (Down : 1 ligne en bas à (listVOffset+10)%16).
function CreateMonListEntry(position: number, b: number, _ignored: number): void {
  if (!sPokedexView) return;
  const v = sPokedexView;
  let entryNum: number;
  switch (position) {
    case 0:
    default:
      entryNum = b - 5;
      for (let i = 0; i <= 10; i++) {
        if (entryNum < 0 || entryNum >= NATIONAL_DEX_COUNT || v.pokedexList[entryNum].dexNum === 0xffff) {
          ClearMonListEntry(17, i * 2);
        } else {
          ClearMonListEntry(17, i * 2);
          if (v.pokedexList[entryNum].seen) {
            CreateMonDexNum(entryNum, 0x12, i * 2);
            CreateCaughtBall(v.pokedexList[entryNum].owned, 0x11, i * 2);
            CreateMonName(v.pokedexList[entryNum].dexNum, 0x16, i * 2);
          } else {
            CreateMonDexNum(entryNum, 0x12, i * 2);
            CreateCaughtBall(false, 0x11, i * 2);
            CreateMonName(0, 0x16, i * 2);
          }
        }
        entryNum++;
      }
      break;
    case 1: // Up
      entryNum = b - 5;
      if (entryNum < 0 || entryNum >= NATIONAL_DEX_COUNT || v.pokedexList[entryNum].dexNum === 0xffff) {
        ClearMonListEntry(17, v.listVOffset * 2);
      } else {
        ClearMonListEntry(17, v.listVOffset * 2);
        if (v.pokedexList[entryNum].seen) {
          CreateMonDexNum(entryNum, 18, v.listVOffset * 2);
          CreateCaughtBall(v.pokedexList[entryNum].owned, 0x11, v.listVOffset * 2);
          CreateMonName(v.pokedexList[entryNum].dexNum, 0x16, v.listVOffset * 2);
        } else {
          CreateMonDexNum(entryNum, 18, v.listVOffset * 2);
          CreateCaughtBall(false, 17, v.listVOffset * 2);
          CreateMonName(0, 0x16, v.listVOffset * 2);
        }
      }
      break;
    case 2: { // Down
      entryNum = b + 5;
      let vOffset = v.listVOffset + 10;
      if (vOffset >= LIST_SCROLL_STEP) vOffset -= LIST_SCROLL_STEP;
      if (entryNum < 0 || entryNum >= NATIONAL_DEX_COUNT || v.pokedexList[entryNum].dexNum === 0xffff) {
        ClearMonListEntry(17, vOffset * 2);
      } else {
        ClearMonListEntry(17, vOffset * 2);
        if (v.pokedexList[entryNum].seen) {
          CreateMonDexNum(entryNum, 18, vOffset * 2);
          CreateCaughtBall(v.pokedexList[entryNum].owned, 0x11, vOffset * 2);
          CreateMonName(v.pokedexList[entryNum].dexNum, 0x16, vOffset * 2);
        } else {
          CreateMonDexNum(entryNum, 18, vOffset * 2);
          CreateCaughtBall(false, 0x11, vOffset * 2);
          CreateMonName(0, 0x16, vOffset * 2);
        }
      }
      break;
    }
  }
  CopyWindowToVram(0, 2 /* COPYWIN_GFX */);
}

// ─── Sprites du mon (JALON 1c-mon) ──────────────────────────────────────────
const MAX_MONS_ON_SCREEN = 4;       // 1:1 pokedex.h
// 1:1 pokedex.c : scroll de la liste.
const LIST_SCROLL_STEP = 16;                       // pokedex.c:109
const POKEBALL_ROTATION_TOP = 64;                  // pokedex.c:111
const POKEBALL_ROTATION_BOTTOM = POKEBALL_ROTATION_TOP - 16; // pokedex.c:112 = 48

/** 1:1 décomp `void ResetPokedexScrollPositions(void)` (pokedex.c:1540-1544).
 *  Appelé par new_game.c (ResetMenuAndMonGlobals) + event_data.c
 *  (EnableNationalPokedex). Exposé sur globalThis pour event_data (foundational)
 *  qui ne doit PAS importer ce module lourd (= cycle/poids ; pattern __rtc). */
export function ResetPokedexScrollPositions(): void {
  sLastSelectedPokemon = 0;
  sPokeBallRotation = POKEBALL_ROTATION_TOP;
}
(globalThis as { __resetPokedexScrollPositions?: () => void }).__resetPokedexScrollPositions = ResetPokedexScrollPositions;

/** 1:1 décomp `u8 gUnusedPokedexU8` (pokedex.c — global UNUSED, 0 lecteur ;
 *  remis à 0 par ResetPokedex ci-bas ET ClearPokedexFlags (new_game.c:101,
 *  qui ne peut pas assigner un binding importé en ESM — même effet, les deux
 *  écrivent 0). */
let gUnusedPokedexU8 = 0;

/** 1:1 décomp `void ResetPokedex(void)` (pokedex.c:1516-1538) : seeding
 *  new-game du SaveBlock2.pokedex (mode Hoenn, national off, flags vus/pris
 *  à zéro). Appelé par NewGameInitData (new_game.c:158). */
export function ResetPokedex(): void {
  sLastSelectedPokemon = 0;
  sPokeBallRotation = POKEBALL_ROTATION_TOP;
  gUnusedPokedexU8 = 0;
  gSaveBlock2Ptr.pokedex.mode = DEX_MODE_HOENN;
  gSaveBlock2Ptr.pokedex.order = 0;
  gSaveBlock2Ptr.pokedex.nationalMagic = 0;
  gSaveBlock2Ptr.pokedex.unknown2 = 0;
  gSaveBlock2Ptr.pokedex.unownPersonality = 0;
  gSaveBlock2Ptr.pokedex.spindaPersonality = 0;
  gSaveBlock2Ptr.pokedex.unknown3 = 0;
  DisableNationalPokedex();
  for (let i = 0; i < gSaveBlock2Ptr.pokedex.owned.length; i++) {   // NUM_DEX_FLAG_BYTES
    gSaveBlock2Ptr.pokedex.owned[i] = 0;
    gSaveBlock2Ptr.pokedex.seen[i] = 0;
    gSaveBlock1Ptr.seen1[i] = 0;
    gSaveBlock1Ptr.seen2[i] = 0;
  }
}
const sScrollMonIncrements = [4, 8, 16, 32, 32];   // pokedex.c:803
const sScrollTimers = [8, 4, 2, 1, 1];             // pokedex.c:804
// Tiles OBJ des mon-pics : la sheet interface occupe 0..255 (vérifié déterministe :
// GetSpriteTileStartByTag(4096)=0). On place les pics au-dessus, 128 tiles/mon
// (anim_front = 2 frames × 64). 4 slots = 256..767, < 1024 (taille OBJ VRAM).
const DEX_MON_TILE_BASE = 256;
const DEX_MON_TILE_STRIDE = 128;

// 1:1 macro `SAFE_DIV(a, b)` (= (b)==0 ? 0 : (a)/(b)), division entière.
function SAFE_DIV(a: number, b: number): number {
  return b === 0 ? 0 : Math.trunc(a / b);
}

// 1:1 décomp `GetPokemonSpriteToDisplay(species)` (pokedex.c:2756). `species` = INDEX
// dans pokedexList (pas une espèce). Renvoie 0xFFFF (invalide), le n° national (vu),
// ou 0 (non-vu = silhouette « ? »). ⚠️ arg traité en u16 (selectedMon-1 = -1 → 0xFFFF).
function GetPokemonSpriteToDisplay(species: number): number {
  if (!sPokedexView) return 0xffff;
  species = species & 0xffff;
  if (species >= NATIONAL_DEX_COUNT || sPokedexView.pokedexList[species].dexNum === 0xffff)
    return 0xffff;
  if (sPokedexView.pokedexList[species].seen)
    return sPokedexView.pokedexList[species].dexNum;
  return 0;
}

// Le port n'a PAS de `CreateMonPicSprite_HandleDeoxys` générique (= machinerie
// trainer_pokemon_sprites.c image-based). On suit le mécanisme mon-pic ÉPROUVÉ du port
// (summary-screen) : `rt.LoadCompressedSpriteSheet(url, byteOffset)` charge le front pic
// en VRAM OBJ + renvoie la palette. Comme le dex affiche 3 mons SIMULTANÉS (≠ summary qui
// en montre 1), on précharge async (gate state-machine) dans 3 régions VRAM + 3 slots
// palette OBJ distincts (slot = monId, 1:1 paletteSlot=i de la décomp ; reservedCount=8
// protège 0..7). Species 0 (non-vu) → pic « ? » (question_mark/circled, = gMonFrontPic_
// CircledQuestionMark de la décomp pour SPECIES_NONE).
function _dexMonPicFolder(species: number): string {
  if (species === 0) return 'question_mark/circled';
  const enumName = reverseDecompConstant(species, 'SPECIES_') ?? 'SPECIES_NONE';
  return enumName.replace('SPECIES_', '').toLowerCase();
}

// Charge async la pic d'un mon dans son slot (tiles DEX_MON_TILE_BASE+slot*STRIDE + palette
// OBJ slot). Appelé par CreatePokedexMonSprite à CHAQUE création (init / scroll / saut de page) :
// le sprite est créé tout de suite ; la pic arrive quelques frames plus tard (masqué par le fade
// à l'init ; au scroll le mon entre depuis hors-écran, data5=±64, invisible jusqu'à -64<data5<64).
// `_dexMonPicLoadsPending` laisse la state-machine d'init ATTENDRE les pics initiales avant
// d'afficher (écran encore noir) ; au scroll on n'attend pas.
let _dexMonPicLoadsPending = 0;
let _dexInitSpritesDone = false;

function _loadDexMonPicIntoSlot(
  rt: NonNullable<ReturnType<typeof getRuntime>>, slot: number, species: number,
): void {
  const folder = _dexMonPicFolder(species);
  const byteOffset = (DEX_MON_TILE_BASE + slot * DEX_MON_TILE_STRIDE) * 32; // 32 octets / tile
  _dexMonPicLoadsPending++;
  void (async () => {
    let pal: Uint16Array | null = null;
    try {
      const ld = await rt.LoadCompressedSpriteSheet(`/decomp/em/pokemon/${folder}/anim_front.png`, byteOffset);
      pal = ld.palette;
    } catch {
      try {                              // anim_front absent → front.png (1 frame)
        const ld = await rt.LoadCompressedSpriteSheet(`/decomp/em/pokemon/${folder}/front.png`, byteOffset);
        pal = ld.palette;
      } catch (e) { console.error('[pokedex] front pic load failed:', folder, e); }
    }
    // 1:1 LoadPicPaletteByTagOrSlot(TAG_NONE) : palette du mon → slot OBJ. gPlttBuffer flat
    // idx OBJ = 0x100 + slot*16 (16 couleurs = 32 octets). Écran TAILLE : le C écrase la
    // vraie palette par la silhouette APRÈS le create synchrone — notre pic arrivant en
    // ASYNC (après la pose silhouette du case 6), on pose la silhouette directement.
    if (sPokedexView?.currentPage === PAGE_SIZE && _assets) {
      LoadPalette(_assets.sizeSilhouettePal.subarray(0, 16), 0x100 + slot * 16, 32);
    } else if (pal) {
      LoadPalette(pal.subarray(0, 16), 0x100 + slot * 16, 32);
    }
  })().finally(() => { _dexMonPicLoadsPending--; });
}

// 1:1 décomp `CreatePokedexMonSprite(num, x, y)` (pokedex.c:2766) : trouve le 1er slot
// monSpriteIds libre `i`, crée le sprite affine du mon, affineMode=NORMAL/priority=3,
// data[0]=0/data[1]=i/data[2]=species. Le port crée via CreateSpriteAtOam pointant la pic
// préchargée à DEX_MON_TILE_BASE + i*STRIDE (slot palette OBJ i = paletteSlot décomp).
function CreatePokedexMonSprite(num: number, x: number, y: number): number {
  if (!sPokedexView) return 0xffff;
  const rt = getRuntime();
  if (!rt) return 0xffff;
  for (let i = 0; i < MAX_MONS_ON_SCREEN; i++) {
    if (sPokedexView.monSpriteIds[i] === 0xffff) {
      const species = NationalPokedexNumToSpecies(num) & 0xffff;
      const tileBase = DEX_MON_TILE_BASE + i * DEX_MON_TILE_STRIDE;
      const { spriteId } = rt.CreateSpriteAtOam({
        tileId: tileBase, paletteBank: i, x, y,
        shape: 0, size: 3,                          // 64×64
        priority: 3,                                // 1:1 oam.priority = 3
        affineMode: 1, affineParamIndex: i + 1,     // ST_OAM_AFFINE_NORMAL, matrixNum = i+1
        // 1:1 trainer_pokemon_sprites.c:197 CreateSprite(..., 0) : subpriority 0 = le mon
        // passe DEVANT les sprites d'interface (subpriority 1). Sans ça (défaut 255), les
        // chiffres VUS/PRIS fadés noir se dessinaient SUR le mon en transition (« barres »).
        subpriority: 0,
      });
      const s = rt.gSprites[spriteId];
      if (s) {
        s.affineMode = 1;
        s.matrixNum = i + 1;
        // matrice identité au create (la CB l'écrase frame 1 — évite tout glitch).
        SetOamMatrix(i + 1, 0x100, 0, 0, 0x100);
        s.data[0] = 0;
        s.data[1] = i;
        s.data[2] = species;
      }
      // Charge la pic du mon dans ce slot (async ; cf. _loadDexMonPicIntoSlot). En décomp
      // CreateMonSpriteFromNationalDexNumber décompresse la pic de façon SYNCHRONE — le port
      // n'a que le loader async, d'où ce chargement différé (substrat).
      _loadDexMonPicIntoSlot(rt, i, species);
      sPokedexView.monSpriteIds[i] = spriteId;
      return spriteId;
    }
  }
  return 0xffff;
}

// 1:1 décomp `SpriteCB_PokedexListMonSprite` (pokedex.c:3054) : aplatit le mon en
// perspective (y2 = gSineTable[data5]·76/256, échelle verticale affine = 0x10000 /
// gSineTable[data5+64]) ; visible si -64<data5<64 ; détruit hors PAGE_MAIN/RESULTS ou
// sorti de l'écran.
function SpriteCB_PokedexListMonSprite(sprite: DecompSprite): void {
  if (!sPokedexView) return;
  const monId = sprite.data[1];
  if (sPokedexView.currentPage !== PAGE_MAIN && sPokedexView.currentPage !== PAGE_SEARCH_RESULTS) {
    _freeDexMonSprite(monId);
  } else {
    sprite.y2 = Math.trunc(gSineTable[sprite.data[5] & 0xff] * 76 / 256);
    let varv = SAFE_DIV(0x10000, gSineTable[sprite.data[5] + 64]);
    if (varv > 0xffff) varv = 0xffff;
    SetOamMatrix(sprite.data[1] + 1, 0x100, 0, 0, varv);
    sprite.matrixNum = monId + 1;
    if (sprite.data[5] > -64 && sprite.data[5] < 64) {
      sprite.invisible = false;
      sprite.data[0] = 1;
    } else {
      sprite.invisible = true;
    }
    if ((sprite.data[5] <= -64 || sprite.data[5] >= 64) && sprite.data[0] !== 0) {
      _freeDexMonSprite(monId);
    }
  }
}

// décomp : FreeAndDestroyMonPicSprite (libère le slot sSpritePics image-based). Le port
// charge les pics par région VRAM (pas via sSpritePics) → DestroySprite suffit ; les
// tiles/palettes sont réinitialisés au prochain ResetSpriteData (réouverture du dex).
function _freeDexMonSprite(monId: number): void {
  if (!sPokedexView) return;
  const id = sPokedexView.monSpriteIds[monId];
  if (id !== 0xffff && id !== undefined) {
    DestroySprite(id);
    sPokedexView.monSpriteIds[monId] = 0xffff;
  }
}

// 1:1 décomp `CreateMonSpritesAtPos` (pokedex.c:2478) : top/mid/bottom mon sprites
// (data[5]=-32/0/32) via GetPokemonSpriteToDisplay + CreatePokedexMonSprite, puis la liste
// texte (CreateMonListEntry). Les pics sont préchargées (async) par _preloadDexMonPics.
function CreateMonSpritesAtPos(selectedMon: number, ignored: number): void {
  if (!sPokedexView) return;
  const rt = getRuntime();
  for (let i = 0; i < MAX_MONS_ON_SCREEN; i++) sPokedexView.monSpriteIds[i] = 0xffff;
  sPokedexView.selectedMonSpriteId = 0xffff;

  let dexNum: number;
  let spriteId: number;
  // top (selectedMon-1)
  dexNum = GetPokemonSpriteToDisplay(selectedMon - 1);
  if (dexNum !== 0xffff) {
    spriteId = CreatePokedexMonSprite(dexNum, 0x60, 0x50);
    const s = rt && rt.gSprites[spriteId];
    if (s) { s.callback = SpriteCB_PokedexListMonSprite as unknown as typeof s.callback; s.data[5] = -32; }
  }
  // mid (selectedMon)
  dexNum = GetPokemonSpriteToDisplay(selectedMon);
  if (dexNum !== 0xffff) {
    spriteId = CreatePokedexMonSprite(dexNum, 0x60, 0x50);
    const s = rt && rt.gSprites[spriteId];
    if (s) { s.callback = SpriteCB_PokedexListMonSprite as unknown as typeof s.callback; s.data[5] = 0; }
  }
  // bottom (selectedMon+1)
  dexNum = GetPokemonSpriteToDisplay(selectedMon + 1);
  if (dexNum !== 0xffff) {
    spriteId = CreatePokedexMonSprite(dexNum, 0x60, 0x50);
    const s = rt && rt.gSprites[spriteId];
    if (s) { s.callback = SpriteCB_PokedexListMonSprite as unknown as typeof s.callback; s.data[5] = 32; }
  }

  CreateMonListEntry(0, selectedMon, ignored);
  if (rt) rt.SetGpuReg(REG_OFFSET_BG2VOFS, sPokedexView.initialVOffset);
  sPokedexView.listVOffset = 0;
  sPokedexView.listMovingVOffset = 0;
}

// ─── Scroll de la liste (JALON 1d) ──────────────────────────────────────────
const DPAD_UP = 0x40, DPAD_DOWN = 0x80, DPAD_LEFT = 0x20, DPAD_RIGHT = 0x10;

// 1:1 décomp `GetNextPosition` (pokedex.c:4568) : ±1 borné (cases 2/3 = loop, inutilisés).
function GetNextPosition(direction: number, position: number, min: number, max: number): number {
  switch (direction) {
    case 1: if (position > min) position--; break;                  // Up/Left
    case 0: if (position < max) position++; break;                  // Down/Right
    case 3: position = position > min ? position - 1 : max; break;  // Up/Left loop (unused)
    case 2: position = position < max ? position + 1 : min; break;  // Down/Right loop (unused)
  }
  return position;
}

// 1:1 décomp `ClearMonSprites` (pokedex.c:2741) : détruit tous les sprites du mon.
function ClearMonSprites(): void {
  if (!sPokedexView) return;
  for (let i = 0; i < MAX_MONS_ON_SCREEN; i++) {
    if (sPokedexView.monSpriteIds[i] !== 0xffff) _freeDexMonSprite(i);
  }
}

// 1:1 décomp `CreateScrollingPokemonSprite` (pokedex.c:2566) : crée le sprite mon ENTRANT
// (haut → data5=-64, bas → data5=64) + avance le listVOffset circulaire (0..15).
function CreateScrollingPokemonSprite(direction: number, selectedMon: number): void {
  if (!sPokedexView) return;
  const v = sPokedexView;
  const rt = getRuntime();
  v.listMovingVOffset = v.listVOffset;
  let dexNum: number, spriteId: number;
  switch (direction) {
    case 1: // up
      dexNum = GetPokemonSpriteToDisplay(selectedMon - 1);
      if (dexNum !== 0xffff) {
        spriteId = CreatePokedexMonSprite(dexNum, 0x60, 0x50);
        const s = rt && rt.gSprites[spriteId];
        if (s) { s.callback = SpriteCB_PokedexListMonSprite as unknown as typeof s.callback; s.data[5] = -64; }
      }
      if (v.listVOffset > 0) v.listVOffset--;
      else v.listVOffset = LIST_SCROLL_STEP - 1;
      break;
    case 2: // down
      dexNum = GetPokemonSpriteToDisplay(selectedMon + 1);
      if (dexNum !== 0xffff) {
        spriteId = CreatePokedexMonSprite(dexNum, 0x60, 0x50);
        const s = rt && rt.gSprites[spriteId];
        if (s) { s.callback = SpriteCB_PokedexListMonSprite as unknown as typeof s.callback; s.data[5] = 64; }
      }
      if (v.listVOffset < LIST_SCROLL_STEP - 1) v.listVOffset++;
      else v.listVOffset = 0;
      break;
  }
}

// 1:1 décomp `UpdateDexListScroll` (pokedex.c:2526) : anime le scroll sur scrollTimer frames
// (BG2VOFS + glissement des sprites mon via data5 + rotation Pokéball). TRUE quand terminé.
function UpdateDexListScroll(direction: number, monMoveIncrement: number, scrollTimerMax: number): boolean {
  if (!sPokedexView) return true;
  const v = sPokedexView;
  const rt = getRuntime();
  if (!rt) return true;
  if (v.scrollTimer) {
    v.scrollTimer--;
    let step: number;
    switch (direction) {
      case 1: // Up
        for (let i = 0; i < MAX_MONS_ON_SCREEN; i++) {
          if (v.monSpriteIds[i] !== 0xffff) { const s = rt.gSprites[v.monSpriteIds[i]]; if (s) s.data[5] += monMoveIncrement; }
        }
        step = Math.trunc(LIST_SCROLL_STEP * (scrollTimerMax - v.scrollTimer) / scrollTimerMax);
        rt.SetGpuReg(REG_OFFSET_BG2VOFS, v.initialVOffset + v.listMovingVOffset * LIST_SCROLL_STEP - step);
        v.pokeBallRotation -= v.pokeBallRotationStep;
        break;
      case 2: // Down
        for (let i = 0; i < MAX_MONS_ON_SCREEN; i++) {
          if (v.monSpriteIds[i] !== 0xffff) { const s = rt.gSprites[v.monSpriteIds[i]]; if (s) s.data[5] -= monMoveIncrement; }
        }
        step = Math.trunc(LIST_SCROLL_STEP * (scrollTimerMax - v.scrollTimer) / scrollTimerMax);
        rt.SetGpuReg(REG_OFFSET_BG2VOFS, v.initialVOffset + v.listMovingVOffset * LIST_SCROLL_STEP + step);
        v.pokeBallRotation += v.pokeBallRotationStep;
        break;
    }
    return false;
  } else {
    rt.SetGpuReg(REG_OFFSET_BG2VOFS, v.initialVOffset + v.listVOffset * LIST_SCROLL_STEP);
    return true;
  }
}

// 1:1 décomp `TryDoPokedexScroll` (pokedex.c:2604) : D-pad haut/bas = scroll fluide,
// gauche/droite = saut de 7 ; met à jour selectedPokemon + l'état de scroll.
function TryDoPokedexScroll(selectedMon: number, ignored: number): number {
  if (!sPokedexView) return selectedMon;
  const v = sPokedexView;
  const rt = getRuntime();
  if (!rt) return selectedMon;
  const held = rt.gMain.heldKeys;
  const neu = rt.gMain.newKeys;
  let scrollDir = 0;
  let startingPos: number;

  if ((held & DPAD_UP) && selectedMon > 0) {
    scrollDir = 1;
    selectedMon = GetNextPosition(1, selectedMon, 0, v.pokemonListCount - 1);
    CreateScrollingPokemonSprite(1, selectedMon);
    CreateMonListEntry(1, selectedMon, ignored);
    PlaySE(SE_DEX_SCROLL);
  } else if ((held & DPAD_DOWN) && selectedMon < v.pokemonListCount - 1) {
    scrollDir = 2;
    selectedMon = GetNextPosition(0, selectedMon, 0, v.pokemonListCount - 1);
    CreateScrollingPokemonSprite(2, selectedMon);
    CreateMonListEntry(2, selectedMon, ignored);
    PlaySE(SE_DEX_SCROLL);
  } else if ((neu & DPAD_LEFT) && selectedMon > 0) {
    startingPos = selectedMon;
    for (let i = 0; i < 7; i++) selectedMon = GetNextPosition(1, selectedMon, 0, v.pokemonListCount - 1);
    v.pokeBallRotation += 16 * (selectedMon - startingPos);
    ClearMonSprites();
    CreateMonSpritesAtPos(selectedMon, 0xe);
    PlaySE(SE_DEX_PAGE);
  } else if ((neu & DPAD_RIGHT) && selectedMon < v.pokemonListCount - 1) {
    startingPos = selectedMon;
    for (let i = 0; i < 7; i++) selectedMon = GetNextPosition(0, selectedMon, 0, v.pokemonListCount - 1);
    v.pokeBallRotation += 16 * (selectedMon - startingPos);
    ClearMonSprites();
    CreateMonSpritesAtPos(selectedMon, 0xe);
    PlaySE(SE_DEX_PAGE);
  }

  if (scrollDir === 0) {
    v.scrollSpeed = 0;     // left/right snap, ou aucune entrée : pas de scroll fluide
    return selectedMon;
  }
  const k = Math.trunc(v.scrollSpeed / 4);
  v.scrollMonIncrement = sScrollMonIncrements[k];
  v.scrollTimer = sScrollTimers[k];
  v.maxScrollTimer = sScrollTimers[k];
  v.scrollDirection = scrollDir;
  v.pokeBallRotationStep = Math.trunc(v.scrollMonIncrement / 2);
  UpdateDexListScroll(v.scrollDirection, v.scrollMonIncrement, v.maxScrollTimer);
  if (v.scrollSpeed < 12) v.scrollSpeed++;
  return selectedMon;
}

// 1:1 décomp `Task_WaitForScroll` (pokedex.c:1735) : avance le scroll, repasse à l'input à la fin.
function Task_WaitForScroll(task: DecompTask): void {
  if (!sPokedexView) return;
  if (UpdateDexListScroll(sPokedexView.scrollDirection, sPokedexView.scrollMonIncrement, sPokedexView.maxScrollTimer))
    task.func = Task_HandlePokedexInput;
}

// 1:1 décomp `UpdateSelectedMonSpriteId` (pokedex.c:2670) : le sprite centré (x2==0 && y2==0).
function UpdateSelectedMonSpriteId(): void {
  if (!sPokedexView) return;
  const rt = getRuntime();
  if (!rt) return;
  for (let i = 0; i < MAX_MONS_ON_SCREEN; i++) {
    const spriteId = sPokedexView.monSpriteIds[i];
    const s = rt.gSprites[spriteId];
    if (s && s.x2 === 0 && s.y2 === 0 && spriteId !== 0xffff) sPokedexView.selectedMonSpriteId = spriteId;
  }
}

// ─── Sprites d'interface (JALON 1c) ─────────────────────────────────────────
const DISPLAY_HEIGHT = 160;
const TAG_DEX_INTERFACE = 4096; // tile+pal tag de tous les sprites d'interface (pokedex.c:689)
const ST_OAM_AFFINE_NORMAL = 1; // sprite.h ST_OAM_AFFINE_NORMAL

// Templates 1:1 décomp (oam shape/size : 32x32=sh0/sz2, 64x32=sh1/sz3, 8x16=sh2/sz0).
// 1:1 sRotatingPokeBallSpriteTemplate (pokedex.c:724) — OBJ_WINDOW, anim frame 16.
const sRotatingPokeBallSpriteTemplate: SpriteTemplate = {
  tileTag: TAG_DEX_INTERFACE, paletteTag: TAG_DEX_INTERFACE,
  oam: { shape: 0, size: 2, priority: 1, objMode: 2 /* OBJ_WINDOW */, affineMode: 0 },
  anims: [[ANIMCMD_FRAME(16, 30), ANIMCMD_END]],
  affineAnims: null, callback: SpriteCB_RotatingPokeBall,
};
// 1:1 sSeenOwnTextSpriteTemplate (pokedex.c:735) — labels VUS/PRIS, anims SeenText(64)/OwnText(96).
const sSeenOwnTextSpriteTemplate: SpriteTemplate = {
  tileTag: TAG_DEX_INTERFACE, paletteTag: TAG_DEX_INTERFACE,
  oam: { shape: 1, size: 3, priority: 0, objMode: 0, affineMode: 0 },
  anims: [[ANIMCMD_FRAME(64, 30), ANIMCMD_END], [ANIMCMD_FRAME(96, 30), ANIMCMD_END]],
  affineAnims: null, callback: SpriteCB_SeenOwnInfo,
};
// 1:1 sHoennDexSeenOwnNumberSpriteTemplate (pokedex.c:757) — chiffres 0..9 (frames 128..146, +2).
const sHoennDexSeenOwnNumberSpriteTemplate: SpriteTemplate = {
  tileTag: TAG_DEX_INTERFACE, paletteTag: TAG_DEX_INTERFACE,
  oam: { shape: 2, size: 0, priority: 0, objMode: 0, affineMode: 0 },
  anims: Array.from({ length: 10 }, (_, d) => [ANIMCMD_FRAME(128 + d * 2, 30), ANIMCMD_END]),
  affineAnims: null, callback: SpriteCB_SeenOwnInfo,
};
// 1:1 sHoennNationalTextSpriteTemplate (pokedex.c:746) — labels HOENN(160)/NATIONAL(168), 32x16.
const sHoennNationalTextSpriteTemplate: SpriteTemplate = {
  tileTag: TAG_DEX_INTERFACE, paletteTag: TAG_DEX_INTERFACE,
  oam: { shape: 1, size: 2, priority: 0, objMode: 0, affineMode: 0 },
  anims: [[ANIMCMD_FRAME(160, 30), ANIMCMD_END], [ANIMCMD_FRAME(168, 30), ANIMCMD_END]],
  affineAnims: null, callback: SpriteCB_SeenOwnInfo,
};
// 1:1 sNationalDexSeenOwnNumberSpriteTemplate (pokedex.c:768) — chiffres 0..9 (frames 176..194, +2).
const sNationalDexSeenOwnNumberSpriteTemplate: SpriteTemplate = {
  tileTag: TAG_DEX_INTERFACE, paletteTag: TAG_DEX_INTERFACE,
  oam: { shape: 2, size: 0, priority: 0, objMode: 0, affineMode: 0 },
  anims: Array.from({ length: 10 }, (_, d) => [ANIMCMD_FRAME(176 + d * 2, 30), ANIMCMD_END]),
  affineAnims: null, callback: SpriteCB_SeenOwnInfo,
};
// 1:1 sDexListStartMenuCursorSpriteTemplate (pokedex.c:779) — curseur menu START (8x16, frame 4).
const sDexListStartMenuCursorSpriteTemplate: SpriteTemplate = {
  tileTag: TAG_DEX_INTERFACE, paletteTag: TAG_DEX_INTERFACE,
  oam: { shape: 2, size: 0, priority: 0, objMode: 0, affineMode: 0 },
  anims: [[ANIMCMD_FRAME(4, 30), ANIMCMD_END]],
  affineAnims: null, callback: SpriteCB_DexListStartMenuCursor,
};
// 1:1 sScrollArrowSpriteTemplate (pokedex.c:702) — flèches défilement haut/bas (16x8, frame 1).
// La décomp n'a qu'1 anim (frame 1) et flippe la flèche BAS via `sprite->vFlip = TRUE`
// (pokedex.c:2800), combiné par SetSpriteOamFlipBits (sprite.c:1246 : oam = animFlip ^ sprite->vFlip).
// Le substrat sprite du port n'implémente PAS ce XOR (SetSpriteOamFlipBits écrase sprite.vFlip
// à chaque frame d'anim) → un vFlip manuel est perdu. En attendant ce fix de substrat (transverse,
// A/B multi-contexte requis), on obtient le MÊME visuel via le flip porté par l'AnimCmd (anim 1),
// qui est le chemin de flip éprouvé du port. anim 0 = flèche normale, anim 1 = vFlippée (bas).
const sScrollArrowSpriteTemplate: SpriteTemplate = {
  tileTag: TAG_DEX_INTERFACE, paletteTag: TAG_DEX_INTERFACE,
  oam: { shape: 1, size: 0, priority: 0, objMode: 0, affineMode: 0 },
  anims: [
    [ANIMCMD_FRAME(1, 30), ANIMCMD_END],
    [ANIMCMD_FRAME(1, 30, { vFlip: true }), ANIMCMD_END],
  ],
  affineAnims: null, callback: SpriteCB_ScrollArrow,
};
// 1:1 sScrollBarSpriteTemplate (pokedex.c:691) — curseur de défilement (8x8, frame 3).
const sScrollBarSpriteTemplate: SpriteTemplate = {
  tileTag: TAG_DEX_INTERFACE, paletteTag: TAG_DEX_INTERFACE,
  oam: { shape: 0, size: 0, priority: 1, objMode: 0, affineMode: 0 },
  anims: [[ANIMCMD_FRAME(3, 30), ANIMCMD_END]],
  affineAnims: null, callback: SpriteCB_Scrollbar,
};
// 1:1 sInterfaceTextSpriteTemplate (pokedex.c:713) — labels d'interface (32x16).
// anims : 0=START(48) 1=RECHERCHE(40) 2=SELECT(32) 3=MENU(56).
// La 5e entrée (4=frame 200) transcrit la //!< French Difference : le jeu FR appelle
// StartSpriteAnim(sprite, 4) alors que sSpriteAnimTable_InterfaceText n'a que 4 entrées →
// lecture OOB qui retombe (layout ROM) sur sSpriteAnimTable_Unused[0] = sSpriteAnim_Unused
// (frame 200). On la matérialise ici en 5e anim explicite (= comportement FR observable).
const sInterfaceTextSpriteTemplate: SpriteTemplate = {
  tileTag: TAG_DEX_INTERFACE, paletteTag: TAG_DEX_INTERFACE,
  oam: { shape: 1, size: 2, priority: 0, objMode: 0, affineMode: 0 },
  anims: [
    [ANIMCMD_FRAME(48, 30), ANIMCMD_END],  // 0 sSpriteAnim_StartButton
    [ANIMCMD_FRAME(40, 30), ANIMCMD_END],  // 1 sSpriteAnim_SearchText
    [ANIMCMD_FRAME(32, 30), ANIMCMD_END],  // 2 sSpriteAnim_SelectButton
    [ANIMCMD_FRAME(56, 30), ANIMCMD_END],  // 3 sSpriteAnim_MenuText
    [ANIMCMD_FRAME(200, 30), ANIMCMD_END], // 4 sSpriteAnim_Unused (diff FR)
  ],
  affineAnims: null, callback: SpriteCB_DexListInterfaceText,
};

// 1:1 décomp `SpriteCB_RotatingPokeBall` (pokedex.c) : tourne la matrice affine (data[0]=30/31)
// via gSineTable[pokeBallRotation+data[1]] + orbite x2/y2 (rayon 40). data[1]=0/128 (2 balls 180°).
function SpriteCB_RotatingPokeBall(sprite: DecompSprite): void {
  if (!sPokedexView) return;
  if (sPokedexView.currentPage !== PAGE_MAIN && sPokedexView.currentPage !== PAGE_SEARCH_RESULTS) {
    DestroySprite(sprite.spriteId);
    return;
  }
  let val = (sPokedexView.pokeBallRotation + sprite.data[1]) & 0xff;
  let r3 = gSineTable[val];
  let r0 = gSineTable[val + 64];
  SetOamMatrix(sprite.data[0], r0, r3, -r3, r0);
  val = (sPokedexView.pokeBallRotation + sprite.data[1] + 64) & 0xff;
  r3 = gSineTable[val];
  r0 = gSineTable[val + 64];
  sprite.x2 = Math.trunc((r0 * 40) / 256);
  sprite.y2 = Math.trunc((r3 * 40) / 256);
}

// 1:1 décomp `SpriteCB_SeenOwnInfo` (pokedex.c) : détruit le sprite si on quitte PAGE_MAIN.
function SpriteCB_SeenOwnInfo(sprite: DecompSprite): void {
  if (sPokedexView && sPokedexView.currentPage !== PAGE_MAIN) DestroySprite(sprite.spriteId);
}

// 1:1 décomp `SpriteCB_Scrollbar` (pokedex.c:3091) : le curseur suit la position dans la liste.
function SpriteCB_Scrollbar(sprite: DecompSprite): void {
  if (!sPokedexView) return;
  if (sPokedexView.currentPage !== PAGE_MAIN && sPokedexView.currentPage !== PAGE_SEARCH_RESULTS) {
    DestroySprite(sprite.spriteId);
  } else {
    // Liste à 1 entrée (recherche à résultat unique) : le C divise par zéro —
    // __divsi3(0,0) agbcc retourne 0 → curseur en haut. En JS 0/0 = NaN (curseur
    // rendu n'importe où, « OOB » verdict A/B) → garde explicite = même résultat ROM.
    const denom = sPokedexView.pokemonListCount - 1;
    sprite.y2 = denom > 0 ? Math.trunc((sPokedexView.selectedPokemon * 120) / denom) : 0;
  }
}

// 1:1 décomp `SpriteCB_ScrollArrow` (pokedex.c:3099) : flèche haut/bas qui pulse (gSineTable),
// masquée aux extrémités de liste ou quand le menu START est ouvert. sIsDownArrow = data[1].
function SpriteCB_ScrollArrow(sprite: DecompSprite): void {
  if (!sPokedexView) return;
  if (sPokedexView.currentPage !== PAGE_MAIN && sPokedexView.currentPage !== PAGE_SEARCH_RESULTS) {
    DestroySprite(sprite.spriteId);
    return;
  }
  let r0: number;
  if (sprite.data[1] /* sIsDownArrow */) {
    sprite.invisible = sPokedexView.selectedPokemon === sPokedexView.pokemonListCount - 1;
    r0 = sprite.data[2] & 0xff;
  } else {
    sprite.invisible = sPokedexView.selectedPokemon === 0;
    r0 = (sprite.data[2] - 128) & 0xff;
  }
  sprite.y2 = Math.trunc(gSineTable[r0] / 64);
  sprite.data[2] = (sprite.data[2] + 8) & 0xffff;
  if (sPokedexView.menuIsOpen === false && sPokedexView.menuY === 0 && sprite.invisible === false)
    sprite.invisible = false;
  else
    sprite.invisible = true;
}

// 1:1 décomp `SpriteCB_DexListInterfaceText` (pokedex.c:3134) : détruit le label hors PAGE_MAIN/RESULTS.
function SpriteCB_DexListInterfaceText(sprite: DecompSprite): void {
  if (!sPokedexView) return;
  if (sPokedexView.currentPage !== PAGE_MAIN && sPokedexView.currentPage !== PAGE_SEARCH_RESULTS)
    DestroySprite(sprite.spriteId);
}

// 1:1 décomp `SpriteCB_DexListStartMenuCursor` (pokedex.c:3165) : visible + oscillant
// quand le menu START est déployé (menuY = 80 main / 96 results), suit menuCursorPos.
function SpriteCB_DexListStartMenuCursor(sprite: DecompSprite): void {
  if (!sPokedexView) return;
  if (sPokedexView.currentPage !== PAGE_MAIN && sPokedexView.currentPage !== PAGE_SEARCH_RESULTS) {
    DestroySprite(sprite.spriteId);
    return;
  }
  const r1 = sPokedexView.currentPage === PAGE_MAIN ? 80 : 96;
  if (sPokedexView.menuIsOpen && sPokedexView.menuY === r1) {
    sprite.invisible = false;
    sprite.y2 = sPokedexView.menuCursorPos * 16;
    sprite.x2 = Math.trunc(gSineTable[sprite.data[2] & 0xff] / 64);
    sprite.data[2] = (sprite.data[2] + 8) & 0xffff;
  } else {
    sprite.invisible = true;
  }
}

// 1:1 décomp `CreateInterfaceSprites` (pokedex.c:2790) — JALON 1c : Pokéball affine + compteurs
// VUS/PRIS (Hoenn). [Flèches scroll / scrollbar / labels START-MENU-SELECT-RECHERCHE / National
// = sous-étapes suivantes ; sprite du mon = CreateMonSpritesAtPos jalon 1c-mon.]
function CreateInterfaceSprites(page: number): void {
  if (!sPokedexView) return;
  const rt = getRuntime();
  if (!rt) return;

  // helpers d'accès sprite (gSprites[id] est | undefined).
  const anim = (id: number, n: number) => rt.StartSpriteAnim(id, n);
  const hide = (id: number) => { const s = rt.gSprites[id]; if (s) s.invisible = true; };

  let id = 0;

  // ─── Flèches de défilement haut/bas (1:1 pokedex.c:2796-2800) ───
  id = CreateSprite(sScrollArrowSpriteTemplate, 184, 4, 0);
  { const s = rt.gSprites[id]; if (s) s.data[1] = 0; }                       // sIsDownArrow = FALSE
  id = CreateSprite(sScrollArrowSpriteTemplate, 184, DISPLAY_HEIGHT - 4, 0);
  { const s = rt.gSprites[id]; if (s) s.data[1] = 1; }                       // sIsDownArrow = TRUE
  // décomp : gSprites[id].vFlip = TRUE (pokedex.c:2800). Substrat du port ne combine pas le
  // vFlip manuel avec l'anim → on flippe via l'anim 1 (cf. sScrollArrowSpriteTemplate).
  anim(id, 1);

  // ─── Curseur de défilement / scrollbar (1:1 pokedex.c:2802) ───
  CreateSprite(sScrollBarSpriteTemplate, 230, 20, 0);

  // ─── Labels d'interface START/MENU/SELECT/RECHERCHE (1:1 pokedex.c:2804-2818) ───
  CreateSprite(sInterfaceTextSpriteTemplate, 16, 120, 0);                    // START (anim 0)
  anim(CreateSprite(sInterfaceTextSpriteTemplate, 48, 120, 0), 3);          // MENU
  id = CreateSprite(sInterfaceTextSpriteTemplate, 16, DISPLAY_HEIGHT - 16, 0); // SELECT
  anim(id, 2);
  { const s = rt.gSprites[id]; if (s) s.data[2] = 0x80; }
  anim(CreateSprite(sInterfaceTextSpriteTemplate, 48, DISPLAY_HEIGHT - 16, 0), 1); // RECHERCHE
  // //!< French Difference : 5e label (StartSpriteAnim 4 = frame 200, cf. sInterfaceTextSpriteTemplate).
  anim(CreateSprite(sInterfaceTextSpriteTemplate, 80, DISPLAY_HEIGHT - 16, 0), 4);

  // 1:1 décomp pokedex.c:2820-2830 : 2 masques OBJ-window affines (Pokéball rotative). Créés pour
  // PAGE_MAIN ET PAGE_SEARCH_RESULTS (non gatés). matrixNum 30/31 (slots fixes), data[1]=0/128
  // (2 trous orbitant à 180°). SpriteCB_RotatingPokeBall tourne via pokeBallRotation (animé au scroll).
  id = CreateSprite(sRotatingPokeBallSpriteTemplate, 0, DISPLAY_HEIGHT / 2, 2);
  { const s = rt.gSprites[id]; if (s) { s.affineMode = 1; s.matrixNum = 30; s.data[0] = 30; s.data[1] = 0; } }
  id = CreateSprite(sRotatingPokeBallSpriteTemplate, 0, DISPLAY_HEIGHT / 2, 2);
  { const s = rt.gSprites[id]; if (s) { s.affineMode = 1; s.matrixNum = 31; s.data[0] = 31; s.data[1] = 128; } }

  // Helper 1:1 : 3 chiffres (centaines/dizaines/unités) avec masquage des zéros de tête.
  const drawCount = (template: SpriteTemplate, value: number, x0: number, y: number, dx: number): void => {
    let drawNextDigit = false;
    let sid = CreateSprite(template, x0, y, 1);
    let digitNum = Math.floor(value / 100);
    anim(sid, digitNum);
    if (digitNum !== 0) drawNextDigit = true; else hide(sid);
    sid = CreateSprite(template, x0 + dx, y, 1);
    digitNum = Math.floor((value % 100) / 10);
    if (digitNum !== 0 || drawNextDigit) anim(sid, digitNum); else hide(sid);
    sid = CreateSprite(template, x0 + dx * 2, y, 1);
    anim(sid, (value % 100) % 10);
  };

  if (page === PAGE_MAIN) {
    if (!IsNationalPokedexEnabled()) {
      // Labels VUS / PRIS + compteurs Hoenn (1:1 pokedex.c:2836-2888).
      CreateSprite(sSeenOwnTextSpriteTemplate, 32, 40, 1);
      anim(CreateSprite(sSeenOwnTextSpriteTemplate, 32, 72, 1), 1);
      drawCount(sHoennDexSeenOwnNumberSpriteTemplate, sPokedexView.seenCount, 24, 48, 8);
      drawCount(sHoennDexSeenOwnNumberSpriteTemplate, sPokedexView.ownCount, 24, 80, 8);
    } else {
      // National (1:1 pokedex.c:2891-3008) : labels VUS/PRIS + HOENN/NATIONAL ×2 +
      // 4 compteurs (vus Hoenn/National, pris Hoenn/National).
      CreateSprite(sSeenOwnTextSpriteTemplate, 32, 40, 1);
      anim(CreateSprite(sSeenOwnTextSpriteTemplate, 32, 76, 1), 1);
      CreateSprite(sHoennNationalTextSpriteTemplate, 17, 45, 1);
      anim(CreateSprite(sHoennNationalTextSpriteTemplate, 17, 55, 1), 1);
      CreateSprite(sHoennNationalTextSpriteTemplate, 17, 81, 1);
      anim(CreateSprite(sHoennNationalTextSpriteTemplate, 17, 91, 1), 1);
      drawCount(sNationalDexSeenOwnNumberSpriteTemplate, DexGetHoennCount(FLAG_GET_SEEN), 40, 45, 8);
      drawCount(sNationalDexSeenOwnNumberSpriteTemplate, sPokedexView.seenCount, 40, 55, 8);
      drawCount(sNationalDexSeenOwnNumberSpriteTemplate, DexGetHoennCount(FLAG_GET_CAUGHT), 40, 81, 8);
      drawCount(sNationalDexSeenOwnNumberSpriteTemplate, sPokedexView.ownCount, 40, 91, 8);
    }
    id = CreateSprite(sDexListStartMenuCursorSpriteTemplate, 136, 96, 1);
    hide(id);
  } else {
    // PAGE_SEARCH_RESULTS (1:1 pokedex.c:3012-3016).
    id = CreateSprite(sDexListStartMenuCursorSpriteTemplate, 136, 80, 1);
    hide(id);
  }
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
      _dexInitSpritesDone = false;    // re-créer + recharger les mon-pics à chaque ouverture
      rt.CreateTask(Task_OpenPokedexMainPage, 0);
      // 1:1 pokedex.c:1631-1648 : dexMode/order depuis gSaveBlock2Ptr->pokedex.
      v.dexMode = _savePokedex().mode;
      if (!IsNationalPokedexEnabled()) v.dexMode = DEX_MODE_HOENN;
      v.dexOrder = _savePokedex().order;
      v.selectedPokemon = sLastSelectedPokemon;
      v.pokeBallRotation = sPokeBallRotation;
      v.selectedScreen = AREA_SCREEN;
      if (!IsNationalPokedexEnabled()) {
        v.seenCount = DexGetHoennCount(FLAG_GET_SEEN);
        v.ownCount = DexGetHoennCount(FLAG_GET_CAUGHT);
      } else {
        v.seenCount = GetNationalPokedexCount(FLAG_GET_SEEN);
        v.ownCount = GetNationalPokedexCount(FLAG_GET_CAUGHT);
      }
      v.initialVOffset = 8;
      rt.gMain.state++;
      break;
    }
    case 3:
      rt.SetVBlankCallback(VBlankCB_Pokedex);
      rt.SetMainCallback2(MainCB2_PokedexRun);
      if (sPokedexView) CreatePokedexList(sPokedexView.dexMode, sPokedexView.dexOrder);
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
  rt.SetGpuReg(REG_OFFSET_BG0VOFS, sPokedexView.menuY);   // 1:1 décomp pokedex.c:1680 (BG0, start-menu slide)
  if (sPokedexView.menuY) {
    sPokedexView.menuY -= 8;
    return;
  }
  const A_BUTTON = 0x0001, B_BUTTON = 0x0002, SELECT_BUTTON = 0x0004, START_BUTTON = 0x0008;
  if ((rt.gMain.newKeys & A_BUTTON) && sPokedexView.pokedexList[sPokedexView.selectedPokemon].seen) {
    // 1:1 décomp pokedex.c:1688-1696.
    UpdateSelectedMonSpriteId();
    const monSprite = rt.gSprites[sPokedexView.selectedMonSpriteId];
    // oam.paletteNum du mon = son slot OBJ = data[1] (monId) dans le port (cf. CreatePokedexMonSprite).
    const palSlot = monSprite ? monSprite.data[1] : 0;
    BeginNormalPaletteFade((~(1 << (palSlot + 16))) >>> 0, 0, 0, 0x10, RGB_BLACK);
    if (monSprite) monSprite.callback = SpriteCB_MoveMonForInfoScreen as unknown as typeof monSprite.callback;
    task.func = Task_OpenInfoScreenAfterMonMovement;
    PlaySE(SE_PIN);
    FreeWindowAndBgBuffers();
  } else if (rt.gMain.newKeys & START_BUTTON) {
    // 1:1 pokedex.c:1697-1704 : ouvre le menu START de la liste (slide BG0).
    sPokedexView.menuY = 0;
    sPokedexView.menuIsOpen = true;
    sPokedexView.menuCursorPos = 0;
    task.func = Task_HandlePokedexStartMenuInput;
    PlaySE(SE_SELECT);
  } else if (rt.gMain.newKeys & SELECT_BUTTON) {
    // 1:1 pokedex.c:1705-1717 : SELECT → menu RECHERCHE.
    PlaySE(SE_SELECT);
    BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 0x10, RGB_BLACK);
    task.data[0] = LoadSearchMenu();
    sPokedexView.screenSwitchState = 0;
    sPokedexView.pokeBallRotationBackup = sPokedexView.pokeBallRotation;
    sPokedexView.selectedPokemonBackup = sPokedexView.selectedPokemon;
    sPokedexView.dexModeBackup = sPokedexView.dexMode;
    sPokedexView.dexOrderBackup = sPokedexView.dexOrder;
    task.func = Task_WaitForExitSearch;
    PlaySE(SE_PC_LOGIN);
    FreeWindowAndBgBuffers();
  } else if (rt.gMain.newKeys & B_BUTTON) {
    BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 0x10, RGB_BLACK);
    task.func = Task_ClosePokedex;
    PlaySE(SE_PC_OFF);
  } else {
    // 1:1 décomp branche D-pad (pokedex.c:1727-1730) : scroll de la liste.
    sPokedexView.selectedPokemon = TryDoPokedexScroll(sPokedexView.selectedPokemon, 0xe);
    if (sPokedexView.scrollTimer) task.func = Task_WaitForScroll;
  }
}

// 1:1 décomp `Task_HandlePokedexStartMenuInput` (pokedex.c:1741) : menu START de la
// liste (RETOUR LISTE / DÉBUT / FIN / FERMER), slide BG0 jusqu'à menuY=80.
function Task_HandlePokedexStartMenuInput(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return;
  rt.SetGpuReg(REG_OFFSET_BG0VOFS, sPokedexView.menuY);
  if (sPokedexView.menuY !== 80) {
    sPokedexView.menuY += 8;
    return;
  }
  const A_BUTTON = 0x0001, B_BUTTON = 0x0002, START_BUTTON = 0x0008;
  if (rt.gMain.newKeys & A_BUTTON) {
    switch (sPokedexView.menuCursorPos) {
      case 0: // RETOUR LISTE
      default:
        rt.gMain.newKeys |= START_BUTTON;   // 1:1 : force la fermeture du menu
        break;
      case 1: // DÉBUT DE LISTE
        sPokedexView.selectedPokemon = 0;
        sPokedexView.pokeBallRotation = 64; // POKEBALL_ROTATION_TOP
        ClearMonSprites();
        CreateMonSpritesAtPos(sPokedexView.selectedPokemon, 0xe);
        rt.gMain.newKeys |= START_BUTTON;
        break;
      case 2: // FIN DE LISTE
        sPokedexView.selectedPokemon = sPokedexView.pokemonListCount - 1;
        sPokedexView.pokeBallRotation = sPokedexView.pokemonListCount * 16 + 48; // POKEBALL_ROTATION_BOTTOM (64-16)
        ClearMonSprites();
        CreateMonSpritesAtPos(sPokedexView.selectedPokemon, 0xe);
        rt.gMain.newKeys |= START_BUTTON;
        break;
      case 3: // FERMER LE POKÉDEX
        BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 0x10, RGB_BLACK);
        task.func = Task_ClosePokedex;
        PlaySE(SE_PC_OFF);
        break;
    }
  }
  if (rt.gMain.newKeys & (START_BUTTON | B_BUTTON)) {
    sPokedexView.menuIsOpen = false;
    task.func = Task_HandlePokedexInput;
    PlaySE(SE_SELECT);
  } else if ((rt.gMain.newAndRepeatedKeys & DPAD_UP) && sPokedexView.menuCursorPos !== 0) {
    sPokedexView.menuCursorPos--;
    PlaySE(SE_SELECT);
  } else if ((rt.gMain.newAndRepeatedKeys & DPAD_DOWN) && sPokedexView.menuCursorPos < 3) {
    sPokedexView.menuCursorPos++;
    PlaySE(SE_SELECT);
  }
}

// 1:1 gSaveBlock2Ptr->pokedex.{mode,order} — champ créé à la volée dans notre save
// (le C l'a en dur dans SaveBlock2 ; la save JSON du port tolère l'ajout).
function _savePokedex(): { mode: number; order: number } {
  const s2 = gSaveBlock2Ptr as unknown as { pokedex?: { mode: number; order: number } };
  s2.pokedex ??= { mode: DEX_MODE_HOENN, order: ORDER_NUMERICAL };
  return s2.pokedex;
}

// ─── Task_ClosePokedex (pokedex.c) ───────────────────────────────────────────
function Task_ClosePokedex(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  if (rt.gPaletteFade.active) return;
  // 1:1 pokedex.c:1861-1864 : persiste mode/order dans la save.
  if (sPokedexView) {
    const sp = _savePokedex();
    sp.mode = IsNationalPokedexEnabled() ? sPokedexView.dexMode : DEX_MODE_HOENN;
    sp.order = sPokedexView.dexOrder;
  }
  sLastSelectedPokemon = sPokedexView ? sPokedexView.selectedPokemon : 0;
  sPokeBallRotation = sPokedexView ? sPokedexView.pokeBallRotation : 0;
  FreeWindowAndBgBuffers();
  rt.SetMainCallback2(rt.gMain.savedCallback ?? CB2_ReturnToFieldWithOpenMenu_Manual);
  rt.DestroyTask(task.taskId);
  sPokedexView = null;
  _isOpen = false;
}

// ════════════════════════════════════════════════════════════════════════════
// FICHE INFO (JALON 2a) — ouverture : transition du mon → cadre + barre + cri.
// (PrintMonInfo texte + footprint = JALON 2b ; sous-écrans AREA/CRY/SIZE = JALON 3.)
// ════════════════════════════════════════════════════════════════════════════
let sPokedexListItem: PokedexListItem | null = null;

// 1:1 décomp `SpriteCB_MoveMonForInfoScreen` (pokedex.c:3030) : coupe l'affine, glisse le
// mon 1px/frame vers MON_PAGE, puis passe la main à EndMove.
function SpriteCB_MoveMonForInfoScreen(sprite: DecompSprite, rt: NonNullable<ReturnType<typeof getRuntime>>): void {
  rt.gba.oam[sprite.oamIndex].priority = 0;   // 1:1 oam.priority = 0
  sprite.affineMode = 0;                        // ST_OAM_AFFINE_OFF
  sprite.x2 = 0;
  sprite.y2 = 0;
  if (sprite.x !== MON_PAGE_X || sprite.y !== MON_PAGE_Y) {
    if (sprite.x > MON_PAGE_X) sprite.x--;
    if (sprite.x < MON_PAGE_X) sprite.x++;
    if (sprite.y > MON_PAGE_Y) sprite.y--;
    if (sprite.y < MON_PAGE_Y) sprite.y++;
  } else {
    sprite.callback = SpriteCB_EndMoveMonForInfoScreen as unknown as typeof sprite.callback;
  }
}

// 1:1 décomp `SpriteCB_EndMoveMonForInfoScreen` (pokedex.c:3019) : rien à faire (mon arrivé).
function SpriteCB_EndMoveMonForInfoScreen(_sprite: DecompSprite): void { /* mon en place */ }

// 1:1 décomp `Task_OpenInfoScreenAfterMonMovement` (pokedex.c:1803) : attend l'arrivée du mon
// à MON_PAGE, puis charge la fiche. (currentPageBackup = restauration recherche = jalon 4.)
function Task_OpenInfoScreenAfterMonMovement(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return;
  const s = rt.gSprites[sPokedexView.selectedMonSpriteId];
  if (s && s.x === MON_PAGE_X && s.y === MON_PAGE_Y) {
    task.data[0] = LoadInfoScreen(sPokedexView.pokedexList[sPokedexView.selectedPokemon], sPokedexView.selectedMonSpriteId);
    task.func = Task_WaitForExitInfoScreen;
  }
}

// 1:1 décomp `IsInfoScreenScrolling` (pokedex.c:3230) : la fiche est « au repos » si
// !tScrolling ET son handler est l'input (sinon transition/scroll en cours).
function IsInfoScreenScrolling(taskId: number): boolean {
  const rt = getRuntime();
  if (!rt) return true;
  const t = rt.gTasks[taskId];
  if (!t.data[0] /* tScrolling */ && t.func === Task_HandleInfoScreenInput) return false;
  return true;
}

// 1:1 décomp `StartInfoScreenScroll` (pokedex.c:3238) : arme le rechargement de la fiche
// sur le nouveau mon (le fade + Task_LoadInfoScreenWaitForFade suivent côté fiche).
function StartInfoScreenScroll(item: PokedexListItem, taskId: number): number {
  const rt = getRuntime();
  if (!rt) return taskId;
  sPokedexListItem = item;
  _loadFootprint(item.dexNum);   // préchargement empreinte du nouveau mon (gate case 1)
  const t = rt.gTasks[taskId];
  t.data[0] = 1;   // tScrolling = TRUE
  t.data[1] = 0;   // tMonSpriteDone = FALSE (recréer le sprite au case 5)
  t.data[2] = 0;   // tBgLoaded = FALSE
  t.data[3] = 0;   // tSkipCry = FALSE (le cri du nouveau mon joue)
  return taskId;
}

// 1:1 décomp `TryDoInfoScreenScroll` (pokedex.c:2683) : D-pad haut/bas sur la fiche =
// mon VU précédent/suivant (saute les non-vus) ; tourne la Pokéball (∓16).
function TryDoInfoScreenScroll(): boolean {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return false;
  let selectedPokemon = sPokedexView.selectedPokemon;
  if ((rt.gMain.newKeys & DPAD_UP) && selectedPokemon) {
    let nextPokemon = selectedPokemon;
    while (nextPokemon !== 0) {
      nextPokemon = GetNextPosition(1, nextPokemon, 0, sPokedexView.pokemonListCount - 1);
      if (sPokedexView.pokedexList[nextPokemon].seen) {
        selectedPokemon = nextPokemon;
        break;
      }
    }
    if (sPokedexView.selectedPokemon === selectedPokemon) {
      return false;
    } else {
      sPokedexView.selectedPokemon = selectedPokemon;
      sPokedexView.pokeBallRotation -= 16;
      return true;
    }
  } else if ((rt.gMain.newKeys & DPAD_DOWN) && selectedPokemon < sPokedexView.pokemonListCount - 1) {
    let nextPokemon = selectedPokemon;
    while (nextPokemon < sPokedexView.pokemonListCount - 1) {
      nextPokemon = GetNextPosition(0, nextPokemon, 0, sPokedexView.pokemonListCount - 1);
      if (sPokedexView.pokedexList[nextPokemon].seen) {
        selectedPokemon = nextPokemon;
        break;
      }
    }
    if (sPokedexView.selectedPokemon === selectedPokemon) {
      return false;
    } else {
      sPokedexView.selectedPokemon = selectedPokemon;
      sPokedexView.pokeBallRotation += 16;
      return true;
    }
  }
  return false;
}

// 1:1 décomp `Task_WaitForExitInfoScreen` (pokedex.c:1813) : surveille la fiche ; D-pad
// haut/bas au repos → StartInfoScreenScroll (fiche du mon suivant/précédent) ; à sa fin
// → retour à la liste.
function Task_WaitForExitInfoScreen(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return;
  if (rt.gTasks[task.data[0]].isActive) {
    if (sPokedexView.currentPage === PAGE_INFO && !IsInfoScreenScrolling(task.data[0]) && TryDoInfoScreenScroll())
      StartInfoScreenScroll(sPokedexView.pokedexList[sPokedexView.selectedPokemon], task.data[0]);
  } else {
    sLastSelectedPokemon = sPokedexView.selectedPokemon;
    sPokeBallRotation = sPokedexView.pokeBallRotation;
    _dexInitSpritesDone = false;   // re-créer liste + mon-pics au retour (gate async du port)
    task.func = Task_OpenPokedexMainPage;
  }
}

// 1:1 décomp `LoadInfoScreen` (pokedex.c:3206) : crée Task_LoadInfoScreen + init BG/fenêtres.
function LoadInfoScreen(item: PokedexListItem, monSpriteId: number): number {
  const rt = getRuntime();
  if (!rt) return 0;
  sPokedexListItem = item;
  _loadFootprint(item.dexNum);   // préchargement async du PNG empreinte (gate case 1)
  const taskId = rt.CreateTask(Task_LoadInfoScreen, 0);
  const t = rt.gTasks[taskId];
  t.data[0] = 0;            // tScrolling = FALSE
  t.data[1] = 1;            // tMonSpriteDone = TRUE (le sprite vient de la liste)
  t.data[2] = 0;            // tBgLoaded = FALSE
  t.data[3] = 0;            // tSkipCry = FALSE
  t.data[4] = monSpriteId;  // tMonSpriteId
  t.data[5] = 0xffff;       // tTrainerSpriteId = SPRITE_NONE
  ResetBgsAndClearDma3BusyFlags(0);
  InitBgsFromTemplates(0, sInfoScreen_BgTemplate, sInfoScreen_BgTemplate.length);
  // 1:1 décomp : SetBgTilemapBuffer(n, AllocZeroed(BG_SCREEN_SIZE)) ×4 — la fiche démarre
  // sur des tilemaps ZÉRO. Nos buffers tilemap sont intrinsèques au runtime (partagés
  // entre écrans) → équivalent exact : les zéroter (sinon les restes de la LISTE — panneau
  // jaune list_underlay sous la barre select 32×3 — transparaissent : couture x=128 vue 2b).
  for (const n of [0, 1, 2, 3] as const) rt.gba.bg(n).tilemap.fill(0);
  InitWindows(sInfoScreen_WindowTemplates);
  DeactivateAllTextPrinters();
  // gMain.state vaut 0 ici (LoadPokedexListPage case 6 l'a remis à 0 ; rien ne l'a touché
  // depuis) — Task_LoadInfoScreen démarre donc bien sur case 0 (1:1 invariant décomp).
  return taskId;
}

// ─── JALON 2b : textes de la fiche + empreinte ───────────────────────────────

// 1:1 décomp `PrintInfoScreenText` (pokedex.c:3189) : couleurs [TRANSPARENT,
// DYNAMIC_6, LIGHT_GRAY], FONT_NORMAL, TEXT_SKIP_DRAW, fenêtre WIN_INFO (0).
function PrintInfoScreenText(str: string | Uint8Array, left: number, top: number): void {
  const color: [number, number, number] = [TEXT_COLOR_TRANSPARENT, TEXT_DYNAMIC_COLOR_6, TEXT_COLOR_LIGHT_GRAY];
  AddTextPrinterParameterized4(0, FONT_NORMAL, left, top, 0, 0, color, TEXT_SKIP_DRAW, str);
}

// 1:1 décomp `PrintInfoSubMenuText` (pokedex.c:4423) — mêmes couleurs, windowId param.
function PrintInfoSubMenuText(windowId: number, str: string | Uint8Array, left: number, top: number): void {
  const color: [number, number, number] = [TEXT_COLOR_TRANSPARENT, TEXT_DYNAMIC_COLOR_6, TEXT_COLOR_LIGHT_GRAY];
  AddTextPrinterParameterized4(windowId, FONT_NORMAL, left, top, 0, 0, color, TEXT_SKIP_DRAW, str);
}

// 1:1 décomp `PrintDecimalNum` (pokedex.c:4488, build métrique FR) : "12,3" avec
// zéros de tête remplacés par CHAR_SPACER — composé en BYTES charmap.
function PrintDecimalNum(windowId: number, num: number, left: number, top: number): void {
  const str = new Uint8Array(6);
  let outputted = false;
  let result = Math.trunc(num / 1000);
  if (result === 0) {
    str[0] = CHAR_SPACER;
    outputted = false;
  } else {
    str[0] = CHAR_0 + result;
    outputted = true;
  }
  result = Math.trunc((num % 1000) / 100);
  if (result === 0 && !outputted) {
    str[1] = CHAR_SPACER;
    outputted = false;
  } else {
    str[1] = CHAR_0 + result;
    outputted = true;
  }
  str[2] = CHAR_0 + Math.trunc(((num % 1000) % 100) / 10);
  str[3] = CHAR_COMMA;              // CHAR_DEC_SEPARATOR (config.h:49, build FR)
  str[4] = CHAR_0 + ((num % 1000) % 100) % 10;
  str[5] = EOS;
  PrintInfoSubMenuText(windowId, str, left, top);
}

// 1:1 décomp `PrintMonHeight`/`PrintMonWeight` (French Difference, pokedex.c:4173) :
// gabarit "          m"/"          kg" puis les chiffres par-dessus.
function PrintMonHeight(height: number, left: number, top: number): void {
  PrintInfoScreenText(getString('gText_EmptyHeight'), left, top);
  PrintDecimalNum(0, height, left, top);
}
function PrintMonWeight(weight: number, left: number, top: number): void {
  PrintInfoScreenText(getString('gText_EmptyWeight'), left, top);
  PrintDecimalNum(0, weight, left, top);
}

// Description FR : décomp `gPokedexEntries[num].description` → pointeur vers
// g<Espèce>PokedexText (data/pokemon/pokedex_text.h) — chez nous strings.json a
// les 388 g*PokedexText ; résolution species → nom global (SPECIES_MR_MIME →
// gMrMimePokedexText : CamelCase des segments).
function _pokedexDescription(num: number): string {
  const species = NationalPokedexNumToSpecies(num);
  const enumName = reverseDecompConstant(species, 'SPECIES_')?.replace(/^SPECIES_/, '');
  if (!enumName) return '';
  const camel = enumName.split('_').map((s) => s.charAt(0) + s.slice(1).toLowerCase()).join('');
  return getString(`g${camel}PokedexText`);
}

// 1:1 décomp `PrintMonInfo(u32 num, u32 value, u32 owned, u32 newEntry)` (pokedex.c:4119).
// value = bool national-dex-enabled (0 → n° Hoenn). Textes FR (French Difference :
// PrintMonHeight/Weight métriques, catégorie sans suffixe POKéMON).
function PrintMonInfo(num: number, value: number, owned: number, newEntry: number): void {
  if (newEntry)
    PrintInfoScreenText(getString('gText_PokedexRegistration'),
      GetStringCenterAlignXOffset(FONT_NORMAL, getString('gText_PokedexRegistration'), 240 /* DISPLAY_WIDTH */), 0);
  if (value === 0)
    value = NationalToHoennOrder(num);
  else
    value = num;
  // StringCopy(str, gText_NumberClear01="{NO}{CLEAR 1}") + ConvertIntToDecimalStringN(LEADING_ZEROS, 3)
  const str = getString('gText_NumberClear01') + String(value % 1000).padStart(3, '0');
  PrintInfoScreenText(str, 0x60, 0x19);
  const natNum = NationalPokedexNumToSpecies(num);
  const name: string = natNum ? (gSpeciesNames[natNum] ?? '----------') : '----------';  // sText_TenDashes2
  PrintInfoScreenText(name, 0x84, 0x19);
  let category: string | Uint8Array;
  if (owned) {
    const str2 = new Uint8Array(32);
    CopyMonCategoryText(num, str2);
    category = str2;
  } else {
    category = getString('gText_5MarksPokemon');
  }
  PrintInfoScreenText(category, 0x64, 0x29);
  PrintInfoScreenText(getString('gText_HTHeight'), 0x60, 0x39);
  PrintInfoScreenText(getString('gText_WTWeight'), 0x60, 0x49);
  if (owned) {
    PrintMonHeight(gPokedexEntries[num].height, 0x90, 0x39); //!< French Difference
    PrintMonWeight(gPokedexEntries[num].weight, 0x90, 0x49); //!< ^
  } else {
    PrintInfoScreenText(getString('gText_UnkHeight'), 0x90, 0x39); //!< French Difference
    PrintInfoScreenText(getString('gText_UnkWeight'), 0x90, 0x49); //!< ^
  }
  const description = owned ? _pokedexDescription(num) : '';  // sExpandedPlaceholder_PokedexDescription = vide
  PrintInfoScreenText(description, GetStringCenterAlignXOffset(FONT_NORMAL, description, 240), 95);
}

// ─── Empreinte (DrawFootprint, pokedex.c:4531) ───────────────────────────────
// Décomp : gMonFootprintTable[species] = 32 bytes 1BPP (4 tiles 8x8, bit N = pixel N).
// Chez nous : public/decomp/em/pokemon/<espèce>/footprint.png (16×16 indexé 1-bit) →
// indices bruts → buffer 1bpp ordre tiles, préchargé async (gate case 1).
const FOOTPRINT_COLOR_IDX = 2;
const NUM_FOOTPRINT_TILES = 4;
const TILE_SIZE_1BPP = 8;
let _footprint1bpp: Uint8Array | null = null;
let _footprintForDexNum = -1;
let _footprintReady = false;

function _loadFootprint(dexNum: number): void {
  _footprintReady = false;
  _footprint1bpp = null;
  _footprintForDexNum = dexNum;
  const species = NationalPokedexNumToSpecies(dexNum);
  const folder = (reverseDecompConstant(species, 'SPECIES_') ?? 'SPECIES_NONE').replace(/^SPECIES_/, '').toLowerCase();
  void loadIndexedPngRawIndices(`/decomp/em/pokemon/${folder}/footprint.png`)
    .then((png: { indices: Uint8Array; widthPx: number }) => {
      if (_footprintForDexNum !== dexNum) return;   // fiche déjà changée
      // pixels (16×16, index 0/1) → 32 bytes 1bpp ordre tiles (bit N = pixel N, LSB=gauche).
      const out = new Uint8Array(TILE_SIZE_1BPP * NUM_FOOTPRINT_TILES);
      for (let t = 0; t < NUM_FOOTPRINT_TILES; t++) {
        const tx = (t % 2) * 8, ty = Math.trunc(t / 2) * 8;
        for (let row = 0; row < 8; row++) {
          let b = 0;
          for (let px = 0; px < 8; px++) {
            if (png.indices[(ty + row) * 16 + tx + px]) b |= 1 << px;
          }
          out[t * 8 + row] = b;
        }
      }
      _footprint1bpp = out;
      _footprintReady = true;
    })
    .catch(() => { _footprint1bpp = null; _footprintReady = true; /* pas d'empreinte (espèce sans asset) */ });
}

// 1:1 décomp `DrawFootprint(u8 windowId, u16 dexNum)` (pokedex.c:4531) : 1BPP → 4BPP
// (FOOTPRINT_COLOR_IDX=2 sur palette 15 de la fenêtre) → CopyToWindowPixelBuffer.
function DrawFootprint(windowId: number, _dexNum: number): void {
  const footprint4bpp = new Uint8Array(32 * NUM_FOOTPRINT_TILES);
  const footprintGfx = _footprint1bpp;
  if (footprintGfx) {
    let tileIdx = 0;
    for (let i = 0; i < TILE_SIZE_1BPP * NUM_FOOTPRINT_TILES; i++) {
      const footprint1bpp = footprintGfx[i];
      for (let j = 0; j < 4; j++) {
        let tile = 0;
        if (footprint1bpp & (1 << (2 * j))) tile |= FOOTPRINT_COLOR_IDX;
        if (footprint1bpp & (2 << (2 * j))) tile |= FOOTPRINT_COLOR_IDX << 4;
        footprint4bpp[tileIdx] = tile;
        tileIdx++;
      }
    }
  }
  CopyToWindowPixelBuffer(windowId, footprint4bpp, footprint4bpp.length, 0);
}

// 1:1 décomp `Task_LoadInfoScreen` (pokedex.c:3248) — state-machine 0..10. Le mon =
// sprite réutilisé de la liste ; DrawFootprint gate sur le préchargement async du PNG.
function Task_LoadInfoScreen(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView || !sPokedexListItem || !_assets) return;
  switch (rt.gMain.state) {
    case 0:
    default:
      if (!rt.gPaletteFade.active) {
        sPokedexView.currentPage = PAGE_INFO;
        rt.SetVBlankCallback(null);    // 1:1 save+null ; on restaure VBlankCB_Pokedex en case 6
        let r2 = 0;
        if (task.data[1]) r2 += DISPCNT_OBJ_ON;   // garder l'OBJ = le sprite du mon survit
        if (task.data[2]) r2 |= DISPCNT_BG1_ON;
        ResetOtherVideoRegisters(r2);
        rt.gMain.state = 1;
      }
      break;
    case 1:
      if (!_footprintReady) break;   // gate async : PNG empreinte (lancé dans LoadInfoScreen)
      // 1:1 DecompressAndLoadBgGfxUsingHeap(3, gPokedexMenu_Gfx) → tiles menu @ charBase 0.
      rt.gba.vram.set(_assets.menuTiles, 0);
      CopyToBgTilemapBuffer(3, _assets.infoScreenTilemap, 0, 0);
      FillWindowPixelBuffer(WIN_INFO, 0);
      PutWindowTilemap(WIN_INFO);
      PutWindowTilemap(WIN_FOOTPRINT);
      DrawFootprint(WIN_FOOTPRINT, sPokedexListItem.dexNum);
      CopyWindowToVram(WIN_FOOTPRINT, 2 /* COPYWIN_GFX */);
      rt.gMain.state++;
      break;
    case 2:
      LoadScreenSelectBarMain(0xd);
      HighlightScreenSelectBarItem(sPokedexView.selectedScreen, 0xd);
      LoadPokedexBgPalette(sPokedexView.isSearchResults);
      rt.gMain.state++;
      break;
    case 3:
      rt.gMain.state++;
      break;
    case 4: {
      // 1:1 : PrintMonInfo(dexNum, national?, owned, 0) + palette BG3 grisée si non-possédé
      // (copie de la palette BG0 offsets 1..15 → BG3 : le cadre perd ses couleurs "owned").
      PrintMonInfo(sPokedexListItem.dexNum, sPokedexView.dexMode === DEX_MODE_HOENN ? 0 : 1, sPokedexListItem.owned ? 1 : 0, 0);
      if (!sPokedexListItem.owned) {
        const buf = new Uint16Array(15);
        for (let i = 0; i < 15; i++) buf[i] = rt.gPlttBufferUnfaded.get(BG_PLTT_ID(0) + 1 + i);
        LoadPalette(buf, BG_PLTT_ID(3) + 1, 15 * 2);
      }
      CopyWindowToVram(WIN_INFO, 3 /* COPYWIN_FULL */);
      CopyBgTilemapBufferToVram(1);
      CopyBgTilemapBufferToVram(2);
      CopyBgTilemapBufferToVram(3);
      rt.gMain.state++;
      break;
    }
    case 5:
      // 1:1 : !tMonSpriteDone (scroll DANS la fiche) → crée le sprite du nouveau mon à
      // MON_PAGE (le pic charge async pendant l'écran noir, comme la liste), priority 0.
      if (!task.data[1]) {
        const spriteId = CreatePokedexMonSprite(sPokedexListItem.dexNum, MON_PAGE_X, MON_PAGE_Y);
        task.data[4] = spriteId;
        const ms = rt.gSprites[spriteId];
        if (ms) {
          SetOamMatrix(ms.data[1] + 1, 0x100, 0, 0, 0x100);  // identité (pas de CB liste)
          const oamIdx = (ms as unknown as { oamIndex?: number }).oamIndex;
          if (oamIdx !== undefined && rt.gba.oam[oamIdx]) rt.gba.oam[oamIdx].priority = 0;
        }
      }
      rt.gMain.state++;
      break;
    case 6: {
      let preservedPalettes = 0;
      if (task.data[2]) preservedPalettes = 0x14;
      if (task.data[1]) {
        const ms = rt.gSprites[task.data[4]];
        if (ms) preservedPalettes |= (1 << (ms.data[1] + 16));   // ms.data[1] = slot OBJ = oam.paletteNum
      }
      BeginNormalPaletteFade((~preservedPalettes) >>> 0, 0, 16, 0, RGB_BLACK);   // fade IN
      rt.SetVBlankCallback(VBlankCB_Pokedex);
      rt.gMain.state++;
      break;
    }
    case 7:
      rt.SetGpuReg(REG_OFFSET_BLDCNT, 0);
      rt.SetGpuReg(REG_OFFSET_BLDALPHA, 0);
      rt.SetGpuReg(REG_OFFSET_BLDY, 0);
      rt.SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_INFO);
      HideBg(0);
      ShowBg(1);
      ShowBg(2);
      ShowBg(3);
      rt.gMain.state++;
      break;
    case 8:
      if (!rt.gPaletteFade.active) {
        rt.gMain.state++;
        if (!task.data[3]) {
          // 1:1 StopCryAndClearCrySongs + PlayCry_NormalNoDucking(species). Cri = WAV pré-extrait.
          const sp = reverseDecompConstant(NationalPokedexNumToSpecies(sPokedexListItem.dexNum), 'SPECIES_') ?? 'SPECIES_NONE';
          void import('../harness/m4a/music').then(({ playCry }) => playCry(sp)).catch(() => { /* cri absent */ });
        } else {
          rt.gMain.state++;
        }
      }
      break;
    case 9:
      // 1:1 IsCryPlayingOrClearCrySongs : le cri du port est async/fire-and-forget → on avance.
      rt.gMain.state++;
      break;
    case 10:
      task.data[0] = 0;   // tScrolling = FALSE
      task.data[1] = 0;   // tMonSpriteDone = FALSE (recharger au prochain passage)
      task.data[2] = 1;   // tBgLoaded = TRUE
      task.data[3] = 1;   // tSkipCry = TRUE
      task.func = Task_HandleInfoScreenInput;
      rt.gMain.state = 0;
      break;
  }
}

// 1:1 décomp `ResetOtherVideoRegisters` (pokedex.c:4384), adapté au substrat du port : la
// config BG (charBase/mapBase/priority) vit dans `gba.bg(n).config` (posé par
// InitBgsFromTemplates dans LoadInfoScreen), PAS dans le registre BGxCNT brut (que
// `applyBgCnt` PARSE → un SetGpuReg(BGxCNT,0) écraserait la config). On reproduit donc
// l'EFFET NET (offsets remis à 0 + couche masquée + OBJ réinit) sans toucher BGxCNT. OBJ
// préservé si DISPCNT_OBJ_ON ∈ regBits (= le sprite du mon survit).
function ResetOtherVideoRegisters(regBits: number): void {
  const rt = getRuntime();
  if (!rt) return;
  if (!(regBits & DISPCNT_BG0_ON)) { HideBg(0); rt.SetGpuReg(REG_OFFSET_BG0HOFS, 0); rt.SetGpuReg(REG_OFFSET_BG0VOFS, 0); }
  if (!(regBits & DISPCNT_BG1_ON)) { HideBg(1); rt.SetGpuReg(REG_OFFSET_BG1HOFS, 0); rt.SetGpuReg(REG_OFFSET_BG1VOFS, 0); }
  if (!(regBits & DISPCNT_BG2_ON)) { HideBg(2); rt.SetGpuReg(REG_OFFSET_BG2HOFS, 0); rt.SetGpuReg(REG_OFFSET_BG2VOFS, 0); }
  if (!(regBits & DISPCNT_BG3_ON)) { HideBg(3); rt.SetGpuReg(REG_OFFSET_BG3HOFS, 0); rt.SetGpuReg(REG_OFFSET_BG3VOFS, 0); }
  if (!(regBits & DISPCNT_OBJ_ON)) { ResetSpriteData(); FreeAllSpritePalettes(); setReservedSpritePaletteCount(8); }
}

// 1:1 décomp `LoadScreenSelectBarMain` (pokedex.c:3887) : barre de sélection sur BG1.
function LoadScreenSelectBarMain(_unused: number): void {
  if (!_assets) return;
  CopyToBgTilemapBuffer(1, _assets.screenSelectBarMainTilemap, 0, 0);
}

// 1:1 décomp `LoadScreenSelectBarSubmenu` (pokedex.c:3892) : barre CRI/TAILLE/RETOUR.
function LoadScreenSelectBarSubmenu(_unused: number): void {
  if (!_assets) return;
  CopyToBgTilemapBuffer(1, _assets.screenSelectBarSubmenuTilemap, 0, 0);
}

// 1:1 décomp `HighlightSubmenuScreenSelectBarItem` (pokedex.c:3924) : items 0-3, le
// sélectionné OU l'item 3 (RETOUR, toujours actif) en palette 0x2000, sinon 0x4000.
function HighlightSubmenuScreenSelectBarItem(a: number, _unused: number): void {
  const ptr = GetBgTilemapBuffer(1);
  for (let i = 0; i < 4; i++) {
    const row = i * 7 + 1;
    const newPalette = (i === a || i === 3) ? 0x2000 : 0x4000;
    for (let j = 0; j < 7; j++) {
      ptr[row + j] = (ptr[row + j] % 0x1000) | newPalette;
      ptr[row + j + 0x20] = (ptr[row + j + 0x20] % 0x1000) | newPalette;
    }
  }
  CopyBgTilemapBufferToVram(1);
}

// ─── Écran TAILLE (SIZE_SCREEN, pokedex.c:3744) ──────────────────────────────
// Silhouettes dresseur/mon comparées (échelle affine trainerScale/pokemonScale de
// gPokedexEntries, palette silhouette violette remplaçant la vraie).

// Pic du dresseur (Brendan/May front) — même mécanisme async que les mon-pics du dex,
// slot VRAM dédié 4 (tiles 768+) + bank palette OBJ 4 (< reservedCount 8).
const DEX_TRAINER_SLOT = 4;
function _loadDexTrainerPic(rt: NonNullable<ReturnType<typeof getRuntime>>): void {
  const folder = (gSaveBlock2Ptr.playerGender ?? 0) === 0 ? 'brendan' : 'may';
  const byteOffset = (DEX_MON_TILE_BASE + DEX_TRAINER_SLOT * DEX_MON_TILE_STRIDE) * 32;
  void rt.LoadCompressedSpriteSheet(`/decomp/em/trainers/front_pics/${folder}.png`, byteOffset)
    .catch((e: unknown) => console.error('[pokedex] trainer pic load failed:', folder, e));
}

// 1:1 décomp `CreateSizeScreenTrainerPic(picId, x, y, palSlot)` (pokedex.c:4611) =
// CreateTrainerPicSprite 64×64 — port : sprite sur le slot VRAM dresseur préchargé.
function CreateSizeScreenTrainerPic(_picId: number, x: number, y: number, _palSlot: number): number {
  const rt = getRuntime();
  if (!rt) return 0xffff;
  const { spriteId } = rt.CreateSpriteAtOam({
    tileId: DEX_MON_TILE_BASE + DEX_TRAINER_SLOT * DEX_MON_TILE_STRIDE,
    paletteBank: DEX_TRAINER_SLOT, x, y,
    shape: 0, size: 3, priority: 0,
    affineMode: 1, affineParamIndex: 1,          // matrixNum 1 (posé aussi ci-dessous)
    subpriority: 0,                              // 1:1 trainer_pokemon_sprites.c CreateSprite(..., 0)
  });
  return spriteId;
}

// ─── Écran CRI (CRY_SCREEN, pokedex.c:3552 + pokedex_cry_screen.ts) ──────────

// 1:1 décomp `PrintCryScreenSpeciesName` (pokedex.c:4444) : nom de l'espèce
// (ou « ----- » si species 0), fenêtre WIN_INFO.
function PrintCryScreenSpeciesName(windowId: number, num: number, left: number, top: number): void {
  const species = NationalPokedexNumToSpecies(num);
  const str = species ? (gSpeciesNames[species] ?? '-----') : '-----';
  PrintInfoSubMenuText(windowId, str, left, top);
}

// 1:1 décomp `LoadPlayArrowPalette` (pokedex.c:3734) : la flèche « play » du
// cadre change de vert (couleur BG palette 5, slot 13) selon lecture en cours.
function LoadPlayArrowPalette(cryPlaying: boolean): void {
  // RGB(18,28,0) / RGB(15,21,0) (gba 5:5:5).
  const color = cryPlaying ? (18 | (28 << 5)) : (15 | (21 << 5));
  LoadPalette(Uint16Array.of(color), BG_PLTT_ID(5) + 13, 2);
}

// 1:1 décomp `Task_LoadCryScreen` (pokedex.c:3552) — state-machine 0..10.
function Task_LoadCryScreen(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView || !sPokedexListItem || !_assets) return;
  switch (rt.gMain.state) {
    case 0:
    default:
      if (!rt.gPaletteFade.active) {
        pauseBgm();   // m4aMPlayStop(&gMPlayInfo_BGM)
        sPokedexView.currentPage = PAGE_CRY;
        rt.SetVBlankCallback(null);
        ResetOtherVideoRegisters(DISPCNT_BG1_ON);
        sPokedexView.selectedScreen = CRY_SCREEN;
        rt.gMain.state = 1;
      }
      break;
    case 1:
      rt.gba.vram.set(_assets.menuTiles, 0);
      CopyToBgTilemapBuffer(3, _assets.cryScreenTilemap, 0, 0);
      FillWindowPixelBuffer(WIN_INFO, 0);
      PutWindowTilemap(WIN_INFO);
      PutWindowTilemap(WIN_VU_METER);
      PutWindowTilemap(WIN_CRY_WAVE);
      rt.gMain.state++;
      break;
    case 2:
      LoadScreenSelectBarSubmenu(0xd);
      HighlightSubmenuScreenSelectBarItem(1, 0xd);
      LoadPokedexBgPalette(sPokedexView.isSearchResults);
      rt.gMain.state++;
      break;
    case 3:
      ResetPaletteFade();
      rt.gMain.state++;
      break;
    case 4:
      PrintInfoScreenText(getString('gText_CryOf'), 82, 33);
      PrintCryScreenSpeciesName(0, sPokedexListItem.dexNum, 82, 49);
      rt.gMain.state++;
      break;
    case 5: {
      const spriteId = CreatePokedexMonSprite(sPokedexListItem.dexNum, MON_PAGE_X, MON_PAGE_Y);
      task.data[4] = spriteId;
      const ms = rt.gSprites[spriteId];
      if (ms) {
        SetOamMatrix(ms.data[1] + 1, 0x100, 0, 0, 0x100);
        const oamIdx = (ms as unknown as { oamIndex?: number }).oamIndex;
        if (oamIdx !== undefined && rt.gba.oam[oamIdx]) rt.gba.oam[oamIdx].priority = 0;
      }
      setDexCryScreenState(0);
      rt.gMain.state++;
      break;
    }
    case 6:
      if (LoadCryWaveformWindow({ unk0: 0x4020, unk2: 31, paletteNo: 8, yPos: 30, xPos: 12 }, WIN_CRY_WAVE)) {
        rt.gMain.state++;
        setDexCryScreenState(0);
      }
      break;
    case 7:
      if (LoadCryMeter({ unk0: 0, paletteNo: 9, xPos: 18, yPos: 3 }, WIN_VU_METER)) {
        rt.gMain.state++;
      }
      CopyWindowToVram(WIN_VU_METER, 2 /* COPYWIN_GFX */);
      CopyWindowToVram(WIN_INFO, 3 /* COPYWIN_FULL */);
      CopyBgTilemapBufferToVram(0);
      CopyBgTilemapBufferToVram(1);
      CopyBgTilemapBufferToVram(2);
      CopyBgTilemapBufferToVram(3);
      break;
    case 8:
      BeginNormalPaletteFade((~0x14) >>> 0, 0, 0x10, 0, RGB_BLACK);
      rt.SetVBlankCallback(VBlankCB_Pokedex);
      rt.gMain.state++;
      break;
    case 9:
      rt.SetGpuReg(REG_OFFSET_BLDCNT, 0);
      rt.SetGpuReg(REG_OFFSET_BLDALPHA, 0);
      rt.SetGpuReg(REG_OFFSET_BLDY, 0);
      rt.SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_INFO);
      ShowBg(0);
      ShowBg(1);
      ShowBg(2);
      ShowBg(3);
      rt.gMain.state++;
      break;
    case 10:
      sPokedexView.screenSwitchState = 0;
      rt.gMain.state = 0;
      task.func = Task_HandleCryScreenInput;
      break;
  }
}

// 1:1 décomp `Task_HandleCryScreenInput` (pokedex.c:3655).
function Task_HandleCryScreenInput(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView || !sPokedexListItem) return;
  const A_BUTTON = 0x0001, B_BUTTON = 0x0002;
  UpdateCryWaveformWindow(WIN_CRY_WAVE);
  LoadPlayArrowPalette(IsCryPlaying());
  if (rt.gMain.newKeys & A_BUTTON) {
    LoadPlayArrowPalette(true);
    CryScreenPlayButton(NationalPokedexNumToSpecies(sPokedexListItem.dexNum));
    return;
  } else if (!rt.gPaletteFade.active) {
    if (rt.gMain.newKeys & B_BUTTON) {
      BeginNormalPaletteFade((~0x14) >>> 0, 0, 0, 0x10, RGB_BLACK);
      resumeBgm();   // m4aMPlayContinue(&gMPlayInfo_BGM)
      sPokedexView.screenSwitchState = 1;
      task.func = Task_SwitchScreensFromCryScreen;
      PlaySE(SE_PC_OFF);
      return;
    }
    if (rt.gMain.newKeys & DPAD_LEFT) {
      BeginNormalPaletteFade((~0x14) >>> 0, 0, 0, 0x10, RGB_BLACK);
      resumeBgm();
      sPokedexView.screenSwitchState = 2;
      task.func = Task_SwitchScreensFromCryScreen;
      PlaySE(SE_DEX_PAGE);
      return;
    }
    if (rt.gMain.newKeys & DPAD_RIGHT) {
      if (!sPokedexListItem.owned) {
        PlaySE(SE_FAILURE);
      } else {
        BeginNormalPaletteFade((~0x14) >>> 0, 0, 0, 0x10, RGB_BLACK);
        resumeBgm();
        sPokedexView.screenSwitchState = 3;
        task.func = Task_SwitchScreensFromCryScreen;
        PlaySE(SE_DEX_PAGE);
      }
      return;
    }
  }
}

// 1:1 décomp `Task_SwitchScreensFromCryScreen` (pokedex.c:3712).
function Task_SwitchScreensFromCryScreen(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return;
  if (!rt.gPaletteFade.active) {
    FreeCryScreen();
    _freeInfoMonSprite(task.data[4]);
    task.data[4] = 0xffff;
    task.data[1] = 0;
    switch (sPokedexView.screenSwitchState) {
      default:
      case 1:
        task.func = Task_LoadInfoScreen;
        break;
      case 2:
        task.func = Task_LoadAreaScreen;
        break;
      case 3:
        task.func = Task_LoadSizeScreen;
        break;
    }
  }
}

// 1:1 décomp `Task_LoadSizeScreen` (pokedex.c:3744) — state-machine 0..9.
function Task_LoadSizeScreen(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView || !sPokedexListItem || !_assets) return;
  switch (rt.gMain.state) {
    case 0:
    default:
      if (!rt.gPaletteFade.active) {
        sPokedexView.currentPage = PAGE_SIZE;
        rt.SetVBlankCallback(null);
        ResetOtherVideoRegisters(DISPCNT_BG1_ON);
        sPokedexView.selectedScreen = SIZE_SCREEN;
        _loadDexTrainerPic(rt);       // préchargement async (le fade noir couvre)
        rt.gMain.state = 1;
      }
      break;
    case 1:
      rt.gba.vram.set(_assets.menuTiles, 0);
      CopyToBgTilemapBuffer(3, _assets.sizeScreenTilemap, 0, 0);
      FillWindowPixelBuffer(WIN_INFO, 0);
      PutWindowTilemap(WIN_INFO);
      rt.gMain.state++;
      break;
    case 2:
      LoadScreenSelectBarSubmenu(0xd);
      HighlightSubmenuScreenSelectBarItem(2, 0xd);
      LoadPokedexBgPalette(sPokedexView.isSearchResults);
      rt.gMain.state++;
      break;
    case 3: {
      // StringCopy(gText_SizeComparedTo) + StringAppend(playerName), centré y=121.
      const str = getString('gText_SizeComparedTo') + GetPlayerNameString();
      PrintInfoScreenText(str, GetStringCenterAlignXOffset(FONT_NORMAL, str, 240), 121);
      rt.gMain.state++;
      break;
    }
    case 4:
      ResetPaletteFade();
      rt.gMain.state++;
      break;
    case 5: {
      // Silhouette du DRESSEUR à (152,56) : matrice 1 = trainerScale, y2 = trainerOffset.
      const entry = gPokedexEntries[sPokedexListItem.dexNum];
      const spriteId = CreateSizeScreenTrainerPic(0, 152, 56, 0);
      const s = rt.gSprites[spriteId];
      if (s) {
        s.affineMode = 1;
        s.matrixNum = 1;
        s.y2 = entry.trainerOffset;
      }
      SetOamMatrix(1, entry.trainerScale, 0, 0, entry.trainerScale);
      LoadPalette(_assets.sizeSilhouettePal.subarray(0, 16), 0x100 + DEX_TRAINER_SLOT * 16, 32);
      task.data[5] = spriteId;   // tTrainerSpriteId
      rt.gMain.state++;
      break;
    }
    case 6: {
      // Silhouette du MON à (88,56) : matrice 2 = pokemonScale, y2 = pokemonOffset.
      const entry = gPokedexEntries[sPokedexListItem.dexNum];
      const spriteId = CreatePokedexMonSprite(sPokedexListItem.dexNum, 88, 56);
      const s = rt.gSprites[spriteId];
      if (s) {
        s.matrixNum = 2;         // 1:1 oam.matrixNum = 2 (écrase le slot+1 du create)
        s.y2 = entry.pokemonOffset;
        const oamIdx = (s as unknown as { oamIndex?: number }).oamIndex;
        if (oamIdx !== undefined && rt.gba.oam[oamIdx]) rt.gba.oam[oamIdx].priority = 0;
        LoadPalette(_assets.sizeSilhouettePal.subarray(0, 16), 0x100 + s.data[1] * 16, 32);
      }
      SetOamMatrix(2, entry.pokemonScale, 0, 0, entry.pokemonScale);
      task.data[4] = spriteId;   // tMonSpriteId
      CopyWindowToVram(WIN_INFO, 3 /* COPYWIN_FULL */);
      CopyBgTilemapBufferToVram(1);
      CopyBgTilemapBufferToVram(2);
      CopyBgTilemapBufferToVram(3);
      rt.gMain.state++;
      break;
    }
    case 7:
      BeginNormalPaletteFade((~0x14) >>> 0, 0, 0x10, 0, RGB_BLACK);
      rt.SetVBlankCallback(VBlankCB_Pokedex);
      rt.gMain.state++;
      break;
    case 8:
      rt.SetGpuReg(REG_OFFSET_BLDCNT, 0);
      rt.SetGpuReg(REG_OFFSET_BLDALPHA, 0);
      rt.SetGpuReg(REG_OFFSET_BLDY, 0);
      rt.SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_INFO);
      HideBg(0);
      ShowBg(1);
      ShowBg(2);
      ShowBg(3);
      rt.gMain.state++;
      break;
    case 9:
      if (!rt.gPaletteFade.active) {
        sPokedexView.screenSwitchState = 0;
        rt.gMain.state = 0;
        task.func = Task_HandleSizeScreenInput;
      }
      break;
  }
}

// 1:1 décomp `Task_HandleSizeScreenInput` (pokedex.c:3843) : B ou GAUCHE → sortie.
function Task_HandleSizeScreenInput(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return;
  const B_BUTTON = 0x0002;
  if (rt.gMain.newKeys & B_BUTTON) {
    BeginNormalPaletteFade((~0x14) >>> 0, 0, 0, 0x10, RGB_BLACK);
    sPokedexView.screenSwitchState = 1;
    task.func = Task_SwitchScreensFromSizeScreen;
    PlaySE(SE_PC_OFF);
  } else if (rt.gMain.newKeys & DPAD_LEFT) {
    BeginNormalPaletteFade((~0x14) >>> 0, 0, 0, 0x10, RGB_BLACK);
    sPokedexView.screenSwitchState = 2;
    task.func = Task_SwitchScreensFromSizeScreen;
    PlaySE(SE_DEX_PAGE);
  }
}

// 1:1 décomp `Task_SwitchScreensFromSizeScreen` (pokedex.c:3862) : libère les 2 sprites,
// retour fiche (1) ou écran CRI (2, dette → fiche en attendant).
function Task_SwitchScreensFromSizeScreen(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return;
  if (!rt.gPaletteFade.active) {
    _freeInfoMonSprite(task.data[4]);
    if (task.data[5] !== 0xffff && task.data[5] !== undefined) {
      try { DestroySprite(task.data[5]); } catch { /* déjà détruit */ }
      task.data[5] = 0xffff;
    }
    task.data[4] = 0xffff;
    task.data[1] = 0;   // tMonSpriteDone = FALSE → la fiche recrée son sprite
    switch (sPokedexView.screenSwitchState) {
      case 2:
        task.func = Task_LoadCryScreen;
        break;
      case 1:
      default:
        task.func = Task_LoadInfoScreen;
        break;
    }
  }
}

// 1:1 décomp `HighlightScreenSelectBarItem` (pokedex.c:3897) : surligne l'item sélectionné
// (palette 0x2000) vs les autres (0x4000) en patchant les bits palette des tiles BG1.
function HighlightScreenSelectBarItem(selectedScreen: number, _unused: number): void {
  const ptr = GetBgTilemapBuffer(1);
  for (let i = 0; i < SCREEN_COUNT; i++) {
    const row = i * 7 + 1;
    const newPalette = (i === selectedScreen) ? 0x2000 : 0x4000;
    for (let j = 0; j < 7; j++) {
      ptr[row + j] = (ptr[row + j] % 0x1000) | newPalette;
      ptr[row + j + 0x20] = (ptr[row + j + 0x20] % 0x1000) | newPalette;
    }
  }
  CopyBgTilemapBufferToVram(1);
}

// 1:1 décomp `Task_HandleInfoScreenInput` (pokedex.c:3380). JALON 2a : B (sortie), D-pad G/D
// (navigation barre), A sur CANCEL (sortie). A sur AREA/CRY/SIZE → JALON 3 (sous-écrans).
function Task_HandleInfoScreenInput(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return;
  const A_BUTTON = 0x0001, B_BUTTON = 0x0002;
  if (task.data[0]) {
    // 1:1 tScrolling : fade noir puis rechargement de la fiche (nouveau mon).
    BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);
    task.func = Task_LoadInfoScreenWaitForFade;
    PlaySE(SE_DEX_SCROLL);
    return;
  }
  if (rt.gMain.newKeys & B_BUTTON) {
    BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);
    task.func = Task_ExitInfoScreen;
    PlaySE(SE_PC_OFF);
    return;
  }
  if (rt.gMain.newKeys & A_BUTTON) {
    switch (sPokedexView.selectedScreen) {
      case AREA_SCREEN:
        BeginNormalPaletteFade((~0x14) >>> 0, 0, 0, 16, RGB_BLACK);
        sPokedexView.screenSwitchState = 1;
        task.func = Task_SwitchScreensFromInfoScreen;
        PlaySE(SE_PIN);
        break;
      case CRY_SCREEN:
        BeginNormalPaletteFade((~0x14) >>> 0, 0, 0, 0x10, RGB_BLACK);
        sPokedexView.screenSwitchState = 2;
        task.func = Task_SwitchScreensFromInfoScreen;
        PlaySE(SE_PIN);
        break;
      case SIZE_SCREEN:
        if (!sPokedexListItem?.owned) {
          PlaySE(SE_FAILURE);
        } else {
          BeginNormalPaletteFade((~0x14) >>> 0, 0, 0, 0x10, RGB_BLACK);
          sPokedexView.screenSwitchState = 3;
          task.func = Task_SwitchScreensFromInfoScreen;
          PlaySE(SE_PIN);
        }
        break;
      case CANCEL_SCREEN:
        BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 0x10, RGB_BLACK);
        task.func = Task_ExitInfoScreen;
        PlaySE(SE_PC_OFF);
        break;
    }
    return;
  }
  // (L/R-button via optionsButtonMode = jalon 3 ; D-pad gauche/droite suffit en 2a.)
  if ((rt.gMain.newKeys & DPAD_LEFT) && sPokedexView.selectedScreen > 0) {
    sPokedexView.selectedScreen--;
    HighlightScreenSelectBarItem(sPokedexView.selectedScreen, 0xd);
    PlaySE(SE_DEX_PAGE);
    return;
  }
  if ((rt.gMain.newKeys & DPAD_RIGHT) && sPokedexView.selectedScreen < CANCEL_SCREEN) {
    sPokedexView.selectedScreen++;
    HighlightScreenSelectBarItem(sPokedexView.selectedScreen, 0xd);
    PlaySE(SE_DEX_PAGE);
    return;
  }
}

// 1:1 décomp `Task_SwitchScreensFromInfoScreen` (pokedex.c:3455) : libère le sprite du
// mon puis dispatch selon screenSwitchState (1=ZONE, 2=CRI, 3=TAILLE). ZONE/CRI = dettes
// (pokedex_area_screen.c / pokedex_cry_screen.c) → retour fiche en attendant, sans freeze.
function Task_SwitchScreensFromInfoScreen(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return;
  if (!rt.gPaletteFade.active) {
    _freeInfoMonSprite(task.data[4]);
    task.data[4] = 0xffff;
    task.data[1] = 0;   // le retour fiche recrée le sprite (case 5 !tMonSpriteDone)
    switch (sPokedexView.screenSwitchState) {
      case 3:
        task.func = Task_LoadSizeScreen;
        break;
      case 2:
        task.func = Task_LoadCryScreen;
        break;
      case 1:
      default:
        task.func = Task_LoadAreaScreen;
        break;
    }
  }
}

// 1:1 décomp `Task_LoadAreaScreen` (pokedex.c:3494) : barre submenu + délégation à
// pokedex_area_screen.ts (ShowPokedexAreaScreen), qui rend la main via screenSwitchState.
function Task_LoadAreaScreen(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView || !sPokedexListItem || !_assets) return;
  switch (rt.gMain.state) {
    case 0:
    default:
      if (!rt.gPaletteFade.active) {
        sPokedexView.currentPage = PAGE_AREA;
        rt.SetVBlankCallback(null);
        ResetOtherVideoRegisters(DISPCNT_BG1_ON);
        sPokedexView.selectedScreen = AREA_SCREEN;
        rt.gMain.state = 1;
      }
      break;
    case 1:
      LoadScreenSelectBarSubmenu(0xd);
      HighlightSubmenuScreenSelectBarItem(0, 0xd);
      LoadPokedexBgPalette(sPokedexView.isSearchResults);
      // SetGpuReg(BG1CNT, priorité 0) — notre BG1 garde sa config template (pri 1
      // → 0 pour passer devant la carte).
      rt.gba.bg(1).config.priority = 0;
      rt.gMain.state++;
      break;
    case 2:
      ShowPokedexAreaScreen(NationalPokedexNumToSpecies(sPokedexListItem.dexNum), {
        set: (v: number) => { if (sPokedexView) sPokedexView.screenSwitchState = v; },
      });
      rt.SetVBlankCallback(VBlankCB_Pokedex);
      sPokedexView.screenSwitchState = 0;
      rt.gMain.state = 0;
      task.func = Task_WaitForAreaScreenInput;
      break;
  }
}

// 1:1 décomp `Task_WaitForAreaScreenInput` (pokedex.c:3527).
function Task_WaitForAreaScreenInput(task: DecompTask): void {
  if (!sPokedexView) return;
  if (sPokedexView.screenSwitchState !== 0)
    task.func = Task_SwitchScreensFromAreaScreen;
}

// 1:1 décomp `Task_SwitchScreensFromAreaScreen` (pokedex.c:3534) : retour fiche (1)
// ou écran CRI (2, dette → fiche en attendant). Restaure la priorité BG1 template.
function Task_SwitchScreensFromAreaScreen(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return;
  if (!rt.gPaletteFade.active) {
    rt.gba.bg(1).config.priority = 1;
    task.data[1] = 0;   // tMonSpriteDone = FALSE → la fiche recrée son sprite
    task.data[4] = 0xffff;
    switch (sPokedexView.screenSwitchState) {
      case 2:
        task.func = Task_LoadCryScreen;
        break;
      case 1:
      default:
        task.func = Task_LoadInfoScreen;
        break;
    }
  }
}

// 1:1 décomp `Task_LoadInfoScreenWaitForFade` (pokedex.c:3477) : fade fini → libère le
// sprite du mon courant et relance Task_LoadInfoScreen (fiche du nouveau mon).
function Task_LoadInfoScreenWaitForFade(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  if (!rt.gPaletteFade.active) {
    _freeInfoMonSprite(task.data[4]);
    task.data[4] = 0xffff;
    task.func = Task_LoadInfoScreen;
  }
}

// 1:1 décomp `Task_ExitInfoScreen` (pokedex.c:3484) : libère le sprite mon + buffers, détruit la tâche.
function Task_ExitInfoScreen(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  if (rt.gPaletteFade.active) return;
  _freeInfoMonSprite(task.data[4]);
  FreeInfoScreenWindowAndBgBuffers();
  rt.DestroyTask(task.taskId);
}

// décomp FreeAndDestroyMonPicSprite : libère le slot image-based. Port = DestroySprite +
// libération du slot monSpriteIds (data[1]) pour que CreatePokedexMonSprite (scroll de
// fiche) retrouve un slot libre. Tiles/palette réinit au prochain ResetSpriteData.
function _freeInfoMonSprite(spriteId: number): void {
  const rt = getRuntime();
  if (spriteId !== 0xffff && spriteId !== undefined) {
    const s = rt?.gSprites[spriteId];
    const slot = s?.data[1];
    try { DestroySprite(spriteId); } catch { /* déjà détruit */ }
    if (sPokedexView && slot !== undefined && sPokedexView.monSpriteIds[slot] === spriteId)
      sPokedexView.monSpriteIds[slot] = 0xffff;
  }
}

// 1:1 décomp `FreeInfoScreenWindowAndBgBuffers` (pokedex.c:3361) : FreeAllWindowBuffers + free
// des tilemap buffers BG (intrinsèques au runtime → seul FreeAllWindowBuffers nécessaire).
function FreeInfoScreenWindowAndBgBuffers(): void {
  FreeAllWindowBuffers();
}

// ─── LoadPokedexListPage (pokedex.c:2066) — BG render (jalon 1a) ──────────────
function LoadPokedexListPage(page: number): boolean {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return false;
  switch (rt.gMain.state) {
    case 0:
    default: {
      if (rt.gPaletteFade.active) return false;
      // Assets async (BG + sheet interface) : attendre qu'ils soient prêts AVANT le rendu —
      // sinon CreateInterfaceSprites (case 1) tournerait sans la sheet chargée. (En ROM décomp
      // tout est synchrone ; ici on gate proprement.)
      if (!_assets) { void _loadAssets(); return false; }
      rt.SetVBlankCallback(null);
      sPokedexView.currentPage = page;
      rt.SetGpuReg(REG_OFFSET_BG2VOFS, sPokedexView.initialVOffset);
      ResetBgsAndClearDma3BusyFlags(0);
      InitBgsFromTemplates(0, sPokedex_BgTemplate, sPokedex_BgTemplate.length);
      // 1:1 SetBgTilemapBuffer(n, AllocZeroed(BG_SCREEN_SIZE)) ×4 : buffers NEUFS ZÉRO.
      // Nos buffers BG sont intrinsèques/partagés → fill(0) obligatoire, sinon le tilemap
      // du sous-écran précédent survit (ex. fenêtre waveform CRI rangées 13-19 sur BG0
      // = corruption bas de liste au retour de fiche, verdict A/B).
      for (const n of [0, 1, 2, 3] as const) rt.gba.bg(n).tilemap.fill(0);
      // 1:1 DecompressAndLoadBgGfxUsingHeap(3, gPokedexMenu_Gfx) → BG3 charBase 0 + tilemaps.
      rt.gba.vram.set(_assets.menuTiles, 0 * 0x4000);
      CopyToBgTilemapBuffer(1, _assets.listTilemap, 0, 0);
      CopyToBgTilemapBuffer(3, _assets.underlayTilemap, 0, 0);
      // 1:1 : menu START main (4 items) ou search-results (5 items, + RETOUR POKÉDEX).
      CopyToBgTilemapBuffer(0, page === PAGE_MAIN ? _assets.startMenuTilemap : _assets.startMenuSearchResultsTilemap, 0, 0x280);
      CopyBgTilemapBufferToVram(0);
      CopyBgTilemapBufferToVram(1);
      CopyBgTilemapBufferToVram(2);
      CopyBgTilemapBufferToVram(3);
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
      // 1:1 LoadCompressedSpriteSheet(sInterfaceSpriteSheet) + LoadSpritePalettes(sInterfaceSpritePalette).
      LoadCompressedSpriteSheet({ data: 'gPokedexInterface_Gfx', size: 0x2000, tag: TAG_DEX_INTERFACE });
      LoadSpritePalettes([{ data: 'gPokedexBgHoenn_Pal', tag: TAG_DEX_INTERFACE }]);
      CreateInterfaceSprites(page);
      rt.gMain.state++;
      return false;
    case 2:
      rt.gMain.state++;
      return false;
    case 3:
      // Crée la liste + les sprites des mons UNE fois (CreatePokedexMonSprite lance le
      // chargement async de chaque pic), puis ATTEND que les pics initiales soient prêtes
      // (écran encore noir) avant d'enchaîner sur le fade-in — sinon 1ers frames = pics pas
      // chargées. En ROM décomp tout est synchrone ; ce gate remplace ce synchronisme.
      if (!_dexInitSpritesDone) {
        if (page === PAGE_MAIN) CreatePokedexList(sPokedexView.dexMode, sPokedexView.dexOrder);
        CreateMonSpritesAtPos(sPokedexView.selectedPokemon, 0xe);
        _dexInitSpritesDone = true;
      }
      if (_dexMonPicLoadsPending > 0) return false;
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
    void _loadAssets().then(() => LoadPokedexBgPalette(isSearchResults));
    return;
  }
  // 1:1 pokedex.c:2160 : results → gPokedexSearchResults_Pal ; sinon Hoenn/National
  // selon IsNationalPokedexEnabled. +1 = 6*16-1 couleurs à partir de l'index 1.
  if (isSearchResults)
    LoadPalette(_assets.searchResultsBgPal.subarray(1), BG_PLTT_ID(0) + 1, (6 * 16 - 1) * 2);
  else if (!IsNationalPokedexEnabled())
    LoadPalette(_assets.bgHoennPal.subarray(1), BG_PLTT_ID(0) + 1, (6 * 16 - 1) * 2);
  else
    LoadPalette(_assets.bgNationalPal.subarray(1), BG_PLTT_ID(0) + 1, (6 * 16 - 1) * 2);
  // LoadPalette(GetOverworldTextboxPalettePtr(), BG_PLTT_ID(15), PLTT_SIZE_4BPP).
  const textboxPal = GetOverworldTextboxPalettePtr();
  if (textboxPal) LoadPalette(textboxPal.subarray(0, 16), BG_PLTT_ID(15), 32);
}

// ─── FreeWindowAndBgBuffers (pokedex.c:2171) ─────────────────────────────────
function FreeWindowAndBgBuffers(): void {
  FreeAllWindowBuffers();
  // Les buffers tilemap BG sont intrinsèques au runtime (pas d'alloc manuelle) → rien à free.
}

// ════════════════════════════════════════════════════════════════════════════
// JALON 4 — RECHERCHE / TRI / NATIONAL (miroir 1:1 pokedex.c:4624-5605)
// ════════════════════════════════════════════════════════════════════════════

// 1:1 enums (pokedex.c:60-108).
const SEARCH_TOPBAR_SEARCH = 0;
const SEARCH_TOPBAR_SHIFT = 1;
const SEARCH_TOPBAR_CANCEL = 2;
const SEARCH_NAME = 0;
const SEARCH_COLOR = 1;
const SEARCH_TYPE_LEFT = 2;
const SEARCH_TYPE_RIGHT = 3;
const SEARCH_ORDER = 4;
const SEARCH_MODE = 5;
const SEARCH_OK = 6;
const SEARCH_COUNT = 7;
const MAX_SEARCH_PARAM_ON_SCREEN = 6;
const MAX_SEARCH_PARAM_CURSOR_POS = MAX_SEARCH_PARAM_ON_SCREEN - 1;
const TYPE_NONE = 255;

// 1:1 gTypeNames (include/data/text/type_names.h, ROM FR).
const gTypeNames: readonly string[] = ['NORMAL', 'COMBAT', 'VOL', 'POISON', 'SOL', 'ROCHE', 'INSECTE',
  'SPECTRE', 'ACIER', '???', 'FEU', 'EAU', 'PLANTE', 'ÉLECTRIK', 'PSY',
  'GLACE', 'DRAGON', 'TÉNÈBRES'];
// 1:1 include/constants/pokemon.h : TYPE_*/BODY_COLOR_* → indices (gSpeciesInfo stocke les enums string).
const _TYPE_INDEX: Record<string, number> = { TYPE_NORMAL: 0, TYPE_FIGHTING: 1, TYPE_FLYING: 2, TYPE_POISON: 3, TYPE_GROUND: 4, TYPE_ROCK: 5, TYPE_BUG: 6, TYPE_GHOST: 7, TYPE_STEEL: 8, TYPE_MYSTERY: 9, TYPE_FIRE: 10, TYPE_WATER: 11, TYPE_GRASS: 12, TYPE_ELECTRIC: 13, TYPE_PSYCHIC: 14, TYPE_ICE: 15, TYPE_DRAGON: 16, TYPE_DARK: 17 };
const _BODY_COLOR_INDEX: Record<string, number> = { BODY_COLOR_RED: 0, BODY_COLOR_BLUE: 1, BODY_COLOR_YELLOW: 2, BODY_COLOR_GREEN: 3, BODY_COLOR_BLACK: 4, BODY_COLOR_BROWN: 5, BODY_COLOR_PURPLE: 6, BODY_COLOR_GRAY: 7, BODY_COLOR_WHITE: 8, BODY_COLOR_PINK: 9 };

// 1:1 sLetterSearchRanges (pokedex.c:1008) — adaptation JS : plages de LETTRES (le C
// compare les bytes charmap CHAR_A..; nos gSpeciesNames sont des strings, un nom FR
// commençant par un caractère hors plage (accent) ne matche aucun groupe = ROM).
const sLetterSearchRanges: readonly (readonly [string, number])[] = [
  ['', 0], ['A', 3], ['D', 3], ['G', 3], ['J', 3], ['M', 3], ['P', 3], ['S', 3], ['V', 3], ['Y', 2],
];
function _letterInRange(letter: string, range: number): boolean {
  const [start, count] = sLetterSearchRanges[range];
  if (!start) return false;
  const up = letter.charCodeAt(0) - start.charCodeAt(0);
  const lo = letter.charCodeAt(0) - start.toLowerCase().charCodeAt(0);
  return (up >= 0 && up < count) || (lo >= 0 && lo < count);
}

// 1:1 sSearchMenuTopBarItems (pokedex.c:1030) — descriptions = clés gText (résolues au print).
const sSearchMenuTopBarItems = [
  { description: 'gText_SearchForPkmnBasedOnParameters', highlightX: 0, highlightY: 0, highlightWidth: 5 },
  { description: 'gText_SwitchPokedexListings', highlightX: 6, highlightY: 0, highlightWidth: 5 },
  { description: 'gText_ReturnToPokedex', highlightX: 12, highlightY: 0, highlightWidth: 5 },
] as const;

// 1:1 sSearchMenuItems (pokedex.c:1055).
const sSearchMenuItems = [
  /* NAME       */ { description: 'gText_ListByFirstLetter', titleBgX: 0, titleBgY: 2, titleBgWidth: 5, selectionBgX: 5, selectionBgY: 2, selectionBgWidth: 12 },
  /* COLOR      */ { description: 'gText_ListByBodyColor', titleBgX: 0, titleBgY: 4, titleBgWidth: 5, selectionBgX: 5, selectionBgY: 4, selectionBgWidth: 12 },
  /* TYPE_LEFT  */ { description: 'gText_ListByType', titleBgX: 0, titleBgY: 6, titleBgWidth: 5, selectionBgX: 5, selectionBgY: 6, selectionBgWidth: 6 },
  /* TYPE_RIGHT */ { description: 'gText_ListByType', titleBgX: 0, titleBgY: 6, titleBgWidth: 5, selectionBgX: 11, selectionBgY: 6, selectionBgWidth: 6 },
  /* ORDER      */ { description: 'gText_SelectPokedexListingMode', titleBgX: 0, titleBgY: 8, titleBgWidth: 5, selectionBgX: 5, selectionBgY: 8, selectionBgWidth: 12 },
  /* MODE       */ { description: 'gText_SelectPokedexMode', titleBgX: 0, titleBgY: 10, titleBgWidth: 5, selectionBgX: 5, selectionBgY: 10, selectionBgWidth: 12 },
  /* OK         */ { description: 'gText_ExecuteSearchSwitch', titleBgX: 0, titleBgY: 12, titleBgWidth: 5, selectionBgX: 0, selectionBgY: 0, selectionBgWidth: 0 },
] as const;

// 1:1 les 4 movement maps [Left, Right, Up, Down] (pokedex.c:1130-1341).
const X = 0xff;
const sSearchMovementMap_SearchNatDex: readonly (readonly number[])[] = [
  /* NAME       */ [X, X, X, SEARCH_COLOR],
  /* COLOR      */ [X, X, SEARCH_NAME, SEARCH_TYPE_LEFT],
  /* TYPE_LEFT  */ [X, SEARCH_TYPE_RIGHT, SEARCH_COLOR, SEARCH_ORDER],
  /* TYPE_RIGHT */ [SEARCH_TYPE_LEFT, X, SEARCH_COLOR, SEARCH_ORDER],
  /* ORDER      */ [X, X, SEARCH_TYPE_LEFT, SEARCH_MODE],
  /* MODE       */ [X, X, SEARCH_ORDER, SEARCH_OK],
  /* OK         */ [X, X, SEARCH_MODE, X],
];
const sSearchMovementMap_ShiftNatDex: readonly (readonly number[])[] = [
  [X, X, X, X], [X, X, X, X], [X, X, X, X], [X, X, X, X],
  /* ORDER */ [X, X, X, SEARCH_MODE],
  /* MODE  */ [X, X, SEARCH_ORDER, SEARCH_OK],
  /* OK    */ [X, X, SEARCH_MODE, X],
];
const sSearchMovementMap_SearchHoennDex: readonly (readonly number[])[] = [
  [X, X, X, SEARCH_COLOR],
  [X, X, SEARCH_NAME, SEARCH_TYPE_LEFT],
  [X, SEARCH_TYPE_RIGHT, SEARCH_COLOR, SEARCH_ORDER],
  [SEARCH_TYPE_LEFT, X, SEARCH_COLOR, SEARCH_ORDER],
  /* ORDER */ [X, X, SEARCH_TYPE_LEFT, SEARCH_OK],
  /* MODE  */ [X, X, X, X],
  /* OK    */ [X, X, SEARCH_ORDER, X],
];
const sSearchMovementMap_ShiftHoennDex: readonly (readonly number[])[] = [
  [X, X, X, X], [X, X, X, X], [X, X, X, X], [X, X, X, X],
  /* ORDER */ [X, X, X, SEARCH_OK],
  /* MODE  */ [X, X, X, X],
  /* OK    */ [X, X, SEARCH_ORDER, X],
];

// 1:1 SearchOptionText tables (pokedex.c:1343-1413) — title/description = clés gText ou
// littéral FR (types) ; sentinelle {null} = terminator du C.
interface SearchOptionText { description: string | null; title: string | null }
const sDexModeOptions: SearchOptionText[] = [
  { description: 'gText_DexHoennDescription', title: 'gText_DexHoennTitle' },
  { description: 'gText_DexNatDescription', title: 'gText_DexNatTitle' },
  { description: null, title: null },
];
const sDexOrderOptions: SearchOptionText[] = [
  { description: 'gText_DexSortNumericalDescription', title: 'gText_DexSortNumericalTitle' },
  { description: 'gText_DexSortAtoZDescription', title: 'gText_DexSortAtoZTitle' },
  { description: 'gText_DexSortHeaviestDescription', title: 'gText_DexSortHeaviestTitle' },
  { description: 'gText_DexSortLightestDescription', title: 'gText_DexSortLightestTitle' },
  { description: 'gText_DexSortTallestDescription', title: 'gText_DexSortTallestTitle' },
  { description: 'gText_DexSortSmallestDescription', title: 'gText_DexSortSmallestTitle' },
  { description: null, title: null },
];
const sDexSearchNameOptions: SearchOptionText[] = [
  { description: 'gText_DexEmptyString', title: 'gText_DexSearchDontSpecify' },
  { description: 'gText_DexEmptyString', title: 'gText_DexSearchAlphaABC' },
  { description: 'gText_DexEmptyString', title: 'gText_DexSearchAlphaDEF' },
  { description: 'gText_DexEmptyString', title: 'gText_DexSearchAlphaGHI' },
  { description: 'gText_DexEmptyString', title: 'gText_DexSearchAlphaJKL' },
  { description: 'gText_DexEmptyString', title: 'gText_DexSearchAlphaMNO' },
  { description: 'gText_DexEmptyString', title: 'gText_DexSearchAlphaPQR' },
  { description: 'gText_DexEmptyString', title: 'gText_DexSearchAlphaSTU' },
  { description: 'gText_DexEmptyString', title: 'gText_DexSearchAlphaVWX' },
  { description: 'gText_DexEmptyString', title: 'gText_DexSearchAlphaYZ' },
  { description: null, title: null },
];
const sDexSearchColorOptions: SearchOptionText[] = [
  { description: 'gText_DexEmptyString', title: 'gText_DexSearchDontSpecify' },
  { description: 'gText_DexEmptyString', title: 'gText_DexSearchColorRed' },
  { description: 'gText_DexEmptyString', title: 'gText_DexSearchColorBlue' },
  { description: 'gText_DexEmptyString', title: 'gText_DexSearchColorYellow' },
  { description: 'gText_DexEmptyString', title: 'gText_DexSearchColorGreen' },
  { description: 'gText_DexEmptyString', title: 'gText_DexSearchColorBlack' },
  { description: 'gText_DexEmptyString', title: 'gText_DexSearchColorBrown' },
  { description: 'gText_DexEmptyString', title: 'gText_DexSearchColorPurple' },
  { description: 'gText_DexEmptyString', title: 'gText_DexSearchColorGray' },
  { description: 'gText_DexEmptyString', title: 'gText_DexSearchColorWhite' },
  { description: 'gText_DexEmptyString', title: 'gText_DexSearchColorPink' },
  { description: null, title: null },
];
// Types : titles = littéraux FR (le C référence gTypeNames directement) — préfixe '=' :
// marqueur interne « littéral, pas une clé gText » (cf. _searchText).
const sDexSearchTypeOptions: SearchOptionText[] = [
  { description: 'gText_DexEmptyString', title: 'gText_DexSearchTypeNone' },
  ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17].map((t) => ({ description: 'gText_DexEmptyString', title: '=' + gTypeNames[t] })),
  { description: null, title: null },
];
const sPokedexModes: readonly number[] = [DEX_MODE_HOENN, DEX_MODE_NATIONAL];
const sOrderOptions: readonly number[] = [ORDER_NUMERICAL, ORDER_ALPHABETICAL, ORDER_HEAVIEST, ORDER_LIGHTEST, ORDER_TALLEST, ORDER_SMALLEST];
const sDexSearchTypeIds: readonly number[] = [TYPE_NONE, 0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17];

// 1:1 sSearchOptions (pokedex.c:1450) : {texts, taskDataCursorPos, taskDataScrollOffset, numOptions}.
const sSearchOptions = [
  /* NAME       */ { texts: sDexSearchNameOptions, taskDataCursorPos: 6, taskDataScrollOffset: 7, numOptions: sDexSearchNameOptions.length - 1 },
  /* COLOR      */ { texts: sDexSearchColorOptions, taskDataCursorPos: 8, taskDataScrollOffset: 9, numOptions: sDexSearchColorOptions.length - 1 },
  /* TYPE_LEFT  */ { texts: sDexSearchTypeOptions, taskDataCursorPos: 10, taskDataScrollOffset: 11, numOptions: sDexSearchTypeOptions.length - 1 },
  /* TYPE_RIGHT */ { texts: sDexSearchTypeOptions, taskDataCursorPos: 12, taskDataScrollOffset: 13, numOptions: sDexSearchTypeOptions.length - 1 },
  /* ORDER      */ { texts: sDexOrderOptions, taskDataCursorPos: 4, taskDataScrollOffset: 5, numOptions: sDexOrderOptions.length - 1 },
  /* MODE       */ { texts: sDexModeOptions, taskDataCursorPos: 2, taskDataScrollOffset: 3, numOptions: sDexModeOptions.length - 1 },
] as const;

// 1:1 sSearchMenu_BgTemplate (pokedex.c:1460) + sSearchMenu_WindowTemplate (pokedex.c:1500).
const sSearchMenu_BgTemplate: BgTemplate[] = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 12, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 13, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 14, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 15, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
];
const sSearchMenu_WindowTemplate: WindowTemplate[] = [
  { bg: 2, tilemapLeft: 0, tilemapTop: 0, width: 32, height: 20, paletteNum: 0, baseBlock: 1 },
];
let _searchWindowId = 0;

// ─── DoPokedexSearch (pokedex.c:4624) ────────────────────────────────────────
function DoPokedexSearch(dexMode: number, order: number, abcGroup: number, bodyColor: number, type1: number, type2: number): number {
  if (!sPokedexView) return 0;
  const v = sPokedexView;
  CreatePokedexList(dexMode, order);

  let resultsCount = 0;
  for (let i = 0; i < NATIONAL_DEX_COUNT; i++) {
    if (v.pokedexList[i].seen) {
      v.pokedexList[resultsCount] = { ...v.pokedexList[i] };
      resultsCount++;
    }
  }
  v.pokemonListCount = resultsCount;

  // Filtre par première lettre du nom.
  if (abcGroup !== 0xff) {
    resultsCount = 0;
    for (let i = 0; i < v.pokemonListCount; i++) {
      const species = NationalPokedexNumToSpecies(v.pokedexList[i].dexNum);
      const firstLetter = (gSpeciesNames[species] ?? '')[0] ?? '';
      if (firstLetter && _letterInRange(firstLetter, abcGroup)) {
        v.pokedexList[resultsCount] = { ...v.pokedexList[i] };
        resultsCount++;
      }
    }
    v.pokemonListCount = resultsCount;
  }

  // Filtre par couleur de corps.
  if (bodyColor !== 0xff) {
    resultsCount = 0;
    for (let i = 0; i < v.pokemonListCount; i++) {
      const species = NationalPokedexNumToSpecies(v.pokedexList[i].dexNum);
      const info = getSpeciesInfo(reverseDecompConstant(species, 'SPECIES_') ?? '');
      if (info && bodyColor === (_BODY_COLOR_INDEX[info.bodyColor] ?? -1)) {
        v.pokedexList[resultsCount] = { ...v.pokedexList[i] };
        resultsCount++;
      }
    }
    v.pokemonListCount = resultsCount;
  }

  // Filtre par type(s) — 1:1 : ne garde que les POSSÉDÉS.
  if (type1 !== TYPE_NONE || type2 !== TYPE_NONE) {
    if (type1 === TYPE_NONE) { type1 = type2; type2 = TYPE_NONE; }
    resultsCount = 0;
    for (let i = 0; i < v.pokemonListCount; i++) {
      if (!v.pokedexList[i].owned) continue;
      const species = NationalPokedexNumToSpecies(v.pokedexList[i].dexNum);
      const info = getSpeciesInfo(reverseDecompConstant(species, 'SPECIES_') ?? '');
      if (!info) continue;
      const t0 = _TYPE_INDEX[info.types[0]] ?? -1;
      const t1 = _TYPE_INDEX[info.types[1]] ?? -1;
      const match = type2 === TYPE_NONE
        ? (t0 === type1 || t1 === type1)
        : ((t0 === type1 && t1 === type2) || (t0 === type2 && t1 === type1));
      if (match) {
        v.pokedexList[resultsCount] = { ...v.pokedexList[i] };
        resultsCount++;
      }
    }
    v.pokemonListCount = resultsCount;
  }

  if (v.pokemonListCount !== 0) {
    for (let i = v.pokemonListCount; i < NATIONAL_DEX_COUNT; i++) {
      v.pokedexList[i].dexNum = 0xffff;
      v.pokedexList[i].seen = false;
      v.pokedexList[i].owned = false;
    }
  }
  return resultsCount;
}

// ─── LoadSearchMenu (pokedex.c:4738) ─────────────────────────────────────────
function LoadSearchMenu(): number {
  const rt = getRuntime();
  if (!rt) return 0;
  return rt.CreateTask(Task_LoadSearchMenu, 0);
}

// _searchText : résout une clé gText OU un littéral (préfixe '=' : types FR).
function _searchText(key: string | null): string {
  if (!key) return '';
  return key.startsWith('=') ? key.slice(1) : getString(key);
}

// 1:1 PrintSearchText (pokedex.c:4744) : couleurs [TRANSPARENT, DYNAMIC_6, DARK_GRAY].
function PrintSearchText(str: string, x: number, y: number): void {
  const color: [number, number, number] = [TEXT_COLOR_TRANSPARENT, TEXT_DYNAMIC_COLOR_6, TEXT_COLOR_DARK_GRAY];
  AddTextPrinterParameterized4(_searchWindowId, FONT_NORMAL, x, y, 0, 0, color, TEXT_SKIP_DRAW, str);
}

function ClearSearchMenuRect(x: number, y: number, width: number, height: number): void {
  FillWindowPixelRect(_searchWindowId, 0, x, y, width, height);
}

// Task data (pokedex.c:1432-1447) : tTopBarItem=0, tMenuItem=1, cursor/scroll par option
// (cf. sSearchOptions), tCursorPos=14, tScrollOffset=15.

// ─── Task_LoadSearchMenu (pokedex.c:4776) ────────────────────────────────────
function Task_LoadSearchMenu(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView || !_assets) return;
  switch (rt.gMain.state) {
    default:
    case 0:
      if (rt.gPaletteFade.active) return;
      sPokedexView.currentPage = PAGE_SEARCH;
      ResetBgsAndClearDma3BusyFlags(0);
      InitBgsFromTemplates(0, sSearchMenu_BgTemplate, sSearchMenu_BgTemplate.length);
      // 1:1 SetBgTilemapBuffer(n, AllocZeroed) ×4 → buffers NEUFS ZÉRO (leçon A/B).
      for (const n of [0, 1, 2, 3] as const) rt.gba.bg(n).tilemap.fill(0);
      {
        const ids = InitWindows(sSearchMenu_WindowTemplate);
        _searchWindowId = ids[0] ?? 0;
      }
      DeactivateAllTextPrinters();
      PutWindowTilemap(_searchWindowId);
      // DecompressAndLoadBgGfxUsingHeap(3, gPokedexSearchMenu_Gfx, 0x2000, 0, 0) → charBase 0.
      rt.gba.vram.set(_assets.searchMenuTiles, 0 * 0x4000);
      CopyToBgTilemapBuffer(3, !IsNationalPokedexEnabled() ? _assets.searchHoennTilemap : _assets.searchNationalTilemap, 0, 0);
      LoadPalette(_assets.searchMenuPal.subarray(1), BG_PLTT_ID(0) + 1, (4 * 16 - 1) * 2);
      rt.gMain.state = 1;
      break;
    case 1:
      LoadCompressedSpriteSheet({ data: 'gPokedexInterface_Gfx', size: 0x2000, tag: TAG_DEX_INTERFACE });
      LoadSpritePalettes([{ data: 'gPokedexBgHoenn_Pal', tag: TAG_DEX_INTERFACE }]);
      CreateSearchParameterScrollArrows(task.taskId);
      for (let i = 0; i < 16; i++) task.data[i] = 0;
      SetDefaultSearchModeAndOrder(task.taskId);
      HighlightSelectedSearchTopBarItem(SEARCH_TOPBAR_SEARCH);
      PrintSelectedSearchParameters(task.taskId);
      CopyWindowToVram(_searchWindowId, 3 /* COPYWIN_FULL */);
      CopyBgTilemapBufferToVram(1);
      CopyBgTilemapBufferToVram(2);
      CopyBgTilemapBufferToVram(3);
      rt.gMain.state++;
      break;
    case 2:
      BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK);
      rt.gMain.state++;
      break;
    case 3:
      rt.SetGpuReg(REG_OFFSET_BLDCNT, 0);
      rt.SetGpuReg(REG_OFFSET_BLDALPHA, 0);
      rt.SetGpuReg(REG_OFFSET_BLDY, 0);
      rt.SetGpuReg(REG_OFFSET_DISPCNT, 0x40 | 0x1000 /* OBJ_1D_MAP | OBJ_ON */);
      HideBg(0);
      ShowBg(1);
      ShowBg(2);
      ShowBg(3);
      rt.gMain.state++;
      break;
    case 4:
      if (!rt.gPaletteFade.active) {
        task.func = Task_SwitchToSearchMenuTopBar;
        rt.gMain.state = 0;
      }
      break;
  }
}

function FreeSearchWindowAndBgBuffers(): void {
  FreeAllWindowBuffers();
  // Buffers tilemap intrinsèques (pas d'alloc manuelle) → rien à free.
}

// ─── Top bar (pokedex.c:4867) ────────────────────────────────────────────────
function Task_SwitchToSearchMenuTopBar(task: DecompTask): void {
  HighlightSelectedSearchTopBarItem(task.data[0]);
  PrintSelectedSearchParameters(task.taskId);
  CopyWindowToVram(_searchWindowId, 2 /* COPYWIN_GFX */);
  CopyBgTilemapBufferToVram(3);
  task.func = Task_HandleSearchTopBarInput;
}

function Task_HandleSearchTopBarInput(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  const A_BUTTON = 0x0001, B_BUTTON = 0x0002;
  if (rt.gMain.newKeys & B_BUTTON) {
    PlaySE(SE_PC_OFF);
    task.func = Task_ExitSearch;
    return;
  }
  if (rt.gMain.newKeys & A_BUTTON) {
    switch (task.data[0]) {
      case SEARCH_TOPBAR_SEARCH:
        PlaySE(SE_PIN);
        task.data[1] = SEARCH_NAME;
        task.func = Task_SwitchToSearchMenu;
        break;
      case SEARCH_TOPBAR_SHIFT:
        PlaySE(SE_PIN);
        task.data[1] = SEARCH_ORDER;
        task.func = Task_SwitchToSearchMenu;
        break;
      case SEARCH_TOPBAR_CANCEL:
        PlaySE(SE_PC_OFF);
        task.func = Task_ExitSearch;
        break;
    }
    return;
  }
  if ((rt.gMain.newKeys & DPAD_LEFT) && task.data[0] > SEARCH_TOPBAR_SEARCH) {
    PlaySE(SE_DEX_PAGE);
    task.data[0]--;
    HighlightSelectedSearchTopBarItem(task.data[0]);
    CopyWindowToVram(_searchWindowId, 2);
    CopyBgTilemapBufferToVram(3);
  }
  if ((rt.gMain.newKeys & DPAD_RIGHT) && task.data[0] < SEARCH_TOPBAR_CANCEL) {
    PlaySE(SE_DEX_PAGE);
    task.data[0]++;
    HighlightSelectedSearchTopBarItem(task.data[0]);
    CopyWindowToVram(_searchWindowId, 2);
    CopyBgTilemapBufferToVram(3);
  }
}

// ─── Menu principal de recherche (pokedex.c:4922) ────────────────────────────
function Task_SwitchToSearchMenu(task: DecompTask): void {
  HighlightSelectedSearchMenuItem(task.data[0], task.data[1]);
  PrintSelectedSearchParameters(task.taskId);
  CopyWindowToVram(_searchWindowId, 2);
  CopyBgTilemapBufferToVram(3);
  task.func = Task_HandleSearchMenuInput;
}

function Task_HandleSearchMenuInput(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return;
  const A_BUTTON = 0x0001, B_BUTTON = 0x0002;
  let movementMap: readonly (readonly number[])[];
  if (task.data[0] !== SEARCH_TOPBAR_SEARCH)
    movementMap = !IsNationalPokedexEnabled() ? sSearchMovementMap_ShiftHoennDex : sSearchMovementMap_ShiftNatDex;
  else
    movementMap = !IsNationalPokedexEnabled() ? sSearchMovementMap_SearchHoennDex : sSearchMovementMap_SearchNatDex;

  if (rt.gMain.newKeys & B_BUTTON) {
    PlaySE(SE_BALL);
    SetDefaultSearchModeAndOrder(task.taskId);
    task.func = Task_SwitchToSearchMenuTopBar;
    return;
  }
  if (rt.gMain.newKeys & A_BUTTON) {
    if (task.data[1] === SEARCH_OK) {
      if (task.data[0] !== SEARCH_TOPBAR_SEARCH) {
        // SHIFT : applique mode/ordre et sort (la liste se recharge avec).
        sPokeBallRotation = 64; // POKEBALL_ROTATION_TOP
        sPokedexView.pokeBallRotationBackup = 64;
        sLastSelectedPokemon = 0;
        sPokedexView.selectedPokemonBackup = 0;
        const sp = _savePokedex();
        sp.mode = GetSearchModeSelection(task.taskId, SEARCH_MODE);
        if (!IsNationalPokedexEnabled()) sp.mode = DEX_MODE_HOENN;
        sPokedexView.dexModeBackup = sp.mode;
        sp.order = GetSearchModeSelection(task.taskId, SEARCH_ORDER);
        sPokedexView.dexOrderBackup = sp.order;
        PlaySE(SE_PC_OFF);
        task.func = Task_ExitSearch;
      } else {
        EraseAndPrintSearchTextBox(getString('gText_SearchingPleaseWait'));
        task.func = Task_StartPokedexSearch;
        PlaySE(SE_DEX_SEARCH);
        CopyWindowToVram(_searchWindowId, 2);
      }
    } else {
      PlaySE(SE_PIN);
      task.func = Task_SelectSearchMenuItem;
    }
    return;
  }

  const move = (dir: number): void => {
    PlaySE(SE_SELECT);
    task.data[1] = movementMap[task.data[1]][dir];
    HighlightSelectedSearchMenuItem(task.data[0], task.data[1]);
    CopyWindowToVram(_searchWindowId, 2);
    CopyBgTilemapBufferToVram(3);
  };
  if ((rt.gMain.newKeys & DPAD_LEFT) && movementMap[task.data[1]][0] !== 0xff) move(0);
  if ((rt.gMain.newKeys & DPAD_RIGHT) && movementMap[task.data[1]][1] !== 0xff) move(1);
  if ((rt.gMain.newKeys & DPAD_UP) && movementMap[task.data[1]][2] !== 0xff) move(2);
  if ((rt.gMain.newKeys & DPAD_DOWN) && movementMap[task.data[1]][3] !== 0xff) move(3);
}

// ─── Lancement de la recherche (pokedex.c:5027) ──────────────────────────────
function Task_StartPokedexSearch(task: DecompTask): void {
  const dexMode = GetSearchModeSelection(task.taskId, SEARCH_MODE);
  const order = GetSearchModeSelection(task.taskId, SEARCH_ORDER);
  const abcGroup = GetSearchModeSelection(task.taskId, SEARCH_NAME);
  const bodyColor = GetSearchModeSelection(task.taskId, SEARCH_COLOR);
  const type1 = GetSearchModeSelection(task.taskId, SEARCH_TYPE_LEFT);
  const type2 = GetSearchModeSelection(task.taskId, SEARCH_TYPE_RIGHT);
  DoPokedexSearch(dexMode, order, abcGroup, bodyColor, type1, type2);
  task.func = Task_WaitAndCompleteSearch;
}

function Task_WaitAndCompleteSearch(task: DecompTask): void {
  if (!sPokedexView) return;
  if (!IsSEPlaying()) {
    if (sPokedexView.pokemonListCount !== 0) {
      PlaySE(SE_SUCCESS);
      EraseAndPrintSearchTextBox(getString('gText_SearchCompleted'));
    } else {
      PlaySE(SE_FAILURE);
      EraseAndPrintSearchTextBox(getString('gText_NoMatchingPkmnWereFound'));
    }
    task.func = Task_SearchCompleteWaitForInput;
    CopyWindowToVram(_searchWindowId, 2);
  }
}

function Task_SearchCompleteWaitForInput(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return;
  if (rt.gMain.newKeys & 0x0001 /* A */) {
    if (sPokedexView.pokemonListCount !== 0) {
      // Retour à la liste avec les résultats.
      sPokedexView.screenSwitchState = 1;
      sPokedexView.dexMode = GetSearchModeSelection(task.taskId, SEARCH_MODE);
      sPokedexView.dexOrder = GetSearchModeSelection(task.taskId, SEARCH_ORDER);
      task.func = Task_ExitSearch;
      PlaySE(SE_PC_OFF);
    } else {
      task.func = Task_SwitchToSearchMenu;
      PlaySE(SE_BALL);
    }
  }
}

// ─── Sélection d'un paramètre (colonne de droite) (pokedex.c:5081) ───────────
function Task_SelectSearchMenuItem(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  DrawOrEraseSearchParameterBox(false);
  const menuItem = task.data[1];
  const cursorPos = task.data[sSearchOptions[menuItem].taskDataCursorPos];
  const scrollOffset = task.data[sSearchOptions[menuItem].taskDataScrollOffset];
  task.data[14] = cursorPos;
  task.data[15] = scrollOffset;
  PrintSearchParameterText(task.taskId);
  PrintSelectorArrow(cursorPos);
  task.func = Task_HandleSearchParameterInput;
  CopyWindowToVram(_searchWindowId, 2);
  CopyBgTilemapBufferToVram(3);
}

function Task_HandleSearchParameterInput(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  const A_BUTTON = 0x0001, B_BUTTON = 0x0002;
  const menuItem = task.data[1];
  const texts = sSearchOptions[menuItem].texts;
  const cpIdx = sSearchOptions[menuItem].taskDataCursorPos;
  const soIdx = sSearchOptions[menuItem].taskDataScrollOffset;
  const maxOption = sSearchOptions[menuItem].numOptions - 1;
  if (rt.gMain.newKeys & A_BUTTON) {
    PlaySE(SE_PIN);
    ClearSearchParameterBoxText();
    DrawOrEraseSearchParameterBox(true);
    task.func = Task_SwitchToSearchMenu;
    CopyWindowToVram(_searchWindowId, 2);
    CopyBgTilemapBufferToVram(3);
    return;
  }
  if (rt.gMain.newKeys & B_BUTTON) {
    PlaySE(SE_BALL);
    ClearSearchParameterBoxText();
    DrawOrEraseSearchParameterBox(true);
    task.data[cpIdx] = task.data[14];
    task.data[soIdx] = task.data[15];
    task.func = Task_SwitchToSearchMenu;
    CopyWindowToVram(_searchWindowId, 2);
    CopyBgTilemapBufferToVram(3);
    return;
  }
  let moved = false;
  if (rt.gMain.newAndRepeatedKeys & DPAD_UP) {
    if (task.data[cpIdx] !== 0) {
      EraseSelectorArrow(task.data[cpIdx]);
      task.data[cpIdx]--;
      PrintSelectorArrow(task.data[cpIdx]);
      moved = true;
    } else if (task.data[soIdx] !== 0) {
      task.data[soIdx]--;
      PrintSearchParameterText(task.taskId);
      PrintSelectorArrow(task.data[cpIdx]);
      moved = true;
    }
    if (moved) {
      PlaySE(SE_SELECT);
      EraseAndPrintSearchTextBox(_searchText(texts[task.data[cpIdx] + task.data[soIdx]].description));
      CopyWindowToVram(_searchWindowId, 2);
    }
    return;
  }
  if (rt.gMain.newAndRepeatedKeys & DPAD_DOWN) {
    if (task.data[cpIdx] < MAX_SEARCH_PARAM_CURSOR_POS && task.data[cpIdx] < maxOption) {
      EraseSelectorArrow(task.data[cpIdx]);
      task.data[cpIdx]++;
      PrintSelectorArrow(task.data[cpIdx]);
      moved = true;
    } else if (maxOption > MAX_SEARCH_PARAM_CURSOR_POS && task.data[soIdx] < maxOption - MAX_SEARCH_PARAM_CURSOR_POS) {
      task.data[soIdx]++;
      PrintSearchParameterText(task.taskId);
      PrintSelectorArrow(5);
      moved = true;
    }
    if (moved) {
      PlaySE(SE_SELECT);
      EraseAndPrintSearchTextBox(_searchText(texts[task.data[cpIdx] + task.data[soIdx]].description));
      CopyWindowToVram(_searchWindowId, 2);
    }
    return;
  }
}

// ─── Sortie de la recherche (pokedex.c:5196) ─────────────────────────────────
function Task_ExitSearch(task: DecompTask): void {
  BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);
  task.func = Task_ExitSearchWaitForFade;
}

function Task_ExitSearchWaitForFade(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  if (!rt.gPaletteFade.active) {
    FreeSearchWindowAndBgBuffers();
    rt.DestroyTask(task.taskId);
  }
}

// ─── Highlights (tilemap BG3, bits palette) (pokedex.c:5210) ─────────────────
function SetSearchRectHighlight(flags: number, x: number, y: number, width: number): void {
  const buf = GetBgTilemapBuffer(3);
  if (!buf) return;
  for (let i = 0; i < width; i++) {
    for (const dy of [0, 1]) {
      const idx = (y + dy) * 32 + x + i;
      buf[idx] = (buf[idx] & 0x0fff) | (flags << 12);
    }
  }
}

const SEARCH_TOPBAR_COUNT = 3;
const SEARCH_BG_TYPE_TITLE = SEARCH_COUNT + SEARCH_TOPBAR_COUNT;

function DrawSearchMenuItemBgHighlight(searchBg: number, unselected: boolean, disabled: boolean): void {
  const highlightFlags = (unselected ? 1 : 0) | ((disabled ? 1 : 0) << 1);
  switch (searchBg) {
    case SEARCH_TOPBAR_SEARCH:
    case SEARCH_TOPBAR_SHIFT:
    case SEARCH_TOPBAR_CANCEL: {
      const it = sSearchMenuTopBarItems[searchBg];
      SetSearchRectHighlight(highlightFlags, it.highlightX, it.highlightY, it.highlightWidth);
      break;
    }
    case SEARCH_NAME + SEARCH_TOPBAR_COUNT:
    case SEARCH_COLOR + SEARCH_TOPBAR_COUNT:
    case SEARCH_ORDER + SEARCH_TOPBAR_COUNT:
    case SEARCH_MODE + SEARCH_TOPBAR_COUNT: {
      const it = sSearchMenuItems[searchBg - SEARCH_TOPBAR_COUNT];
      SetSearchRectHighlight(highlightFlags, it.titleBgX, it.titleBgY, it.titleBgWidth);
      SetSearchRectHighlight(highlightFlags, it.selectionBgX, it.selectionBgY, it.selectionBgWidth);
      break;
    }
    case SEARCH_TYPE_LEFT + SEARCH_TOPBAR_COUNT:
    case SEARCH_TYPE_RIGHT + SEARCH_TOPBAR_COUNT: {
      const it = sSearchMenuItems[searchBg - SEARCH_TOPBAR_COUNT];
      SetSearchRectHighlight(highlightFlags, it.selectionBgX, it.selectionBgY, it.selectionBgWidth);
      break;
    }
    case SEARCH_BG_TYPE_TITLE: {
      const it = sSearchMenuItems[SEARCH_TYPE_LEFT];
      SetSearchRectHighlight(highlightFlags, it.titleBgX, it.titleBgY, it.titleBgWidth);
      break;
    }
    case SEARCH_OK + SEARCH_TOPBAR_COUNT: {
      const it = sSearchMenuItems[SEARCH_OK];
      if (!IsNationalPokedexEnabled())
        SetSearchRectHighlight(highlightFlags, it.titleBgX, it.titleBgY - 2, it.titleBgWidth);
      else
        SetSearchRectHighlight(highlightFlags, it.titleBgX, it.titleBgY, it.titleBgWidth);
      break;
    }
  }
}

function SetInitialSearchMenuBgHighlights(topBarItem: number): void {
  const B = SEARCH_TOPBAR_COUNT;
  switch (topBarItem) {
    case SEARCH_TOPBAR_SEARCH:
      DrawSearchMenuItemBgHighlight(SEARCH_TOPBAR_SEARCH, false, false);
      DrawSearchMenuItemBgHighlight(SEARCH_TOPBAR_SHIFT, true, false);
      DrawSearchMenuItemBgHighlight(SEARCH_TOPBAR_CANCEL, true, false);
      DrawSearchMenuItemBgHighlight(SEARCH_NAME + B, true, false);
      DrawSearchMenuItemBgHighlight(SEARCH_COLOR + B, true, false);
      DrawSearchMenuItemBgHighlight(SEARCH_BG_TYPE_TITLE, true, false);
      DrawSearchMenuItemBgHighlight(SEARCH_TYPE_LEFT + B, true, false);
      DrawSearchMenuItemBgHighlight(SEARCH_TYPE_RIGHT + B, true, false);
      DrawSearchMenuItemBgHighlight(SEARCH_ORDER + B, true, false);
      DrawSearchMenuItemBgHighlight(SEARCH_MODE + B, true, false);
      DrawSearchMenuItemBgHighlight(SEARCH_OK + B, true, false);
      break;
    case SEARCH_TOPBAR_SHIFT:
      DrawSearchMenuItemBgHighlight(SEARCH_TOPBAR_SEARCH, true, false);
      DrawSearchMenuItemBgHighlight(SEARCH_TOPBAR_SHIFT, false, false);
      DrawSearchMenuItemBgHighlight(SEARCH_TOPBAR_CANCEL, true, false);
      DrawSearchMenuItemBgHighlight(SEARCH_NAME + B, true, true);
      DrawSearchMenuItemBgHighlight(SEARCH_COLOR + B, true, true);
      DrawSearchMenuItemBgHighlight(SEARCH_BG_TYPE_TITLE, true, true);
      DrawSearchMenuItemBgHighlight(SEARCH_TYPE_LEFT + B, true, true);
      DrawSearchMenuItemBgHighlight(SEARCH_TYPE_RIGHT + B, true, true);
      DrawSearchMenuItemBgHighlight(SEARCH_ORDER + B, true, false);
      DrawSearchMenuItemBgHighlight(SEARCH_MODE + B, true, false);
      DrawSearchMenuItemBgHighlight(SEARCH_OK + B, true, false);
      break;
    case SEARCH_TOPBAR_CANCEL:
      DrawSearchMenuItemBgHighlight(SEARCH_TOPBAR_SEARCH, true, false);
      DrawSearchMenuItemBgHighlight(SEARCH_TOPBAR_SHIFT, true, false);
      DrawSearchMenuItemBgHighlight(SEARCH_TOPBAR_CANCEL, false, false);
      DrawSearchMenuItemBgHighlight(SEARCH_NAME + B, true, true);
      DrawSearchMenuItemBgHighlight(SEARCH_COLOR + B, true, true);
      DrawSearchMenuItemBgHighlight(SEARCH_BG_TYPE_TITLE, true, true);
      DrawSearchMenuItemBgHighlight(SEARCH_TYPE_LEFT + B, true, true);
      DrawSearchMenuItemBgHighlight(SEARCH_TYPE_RIGHT + B, true, true);
      DrawSearchMenuItemBgHighlight(SEARCH_ORDER + B, true, true);
      DrawSearchMenuItemBgHighlight(SEARCH_MODE + B, true, true);
      DrawSearchMenuItemBgHighlight(SEARCH_OK + B, true, true);
      break;
  }
}

function HighlightSelectedSearchTopBarItem(topBarItem: number): void {
  SetInitialSearchMenuBgHighlights(topBarItem);
  EraseAndPrintSearchTextBox(_searchText(sSearchMenuTopBarItems[topBarItem].description));
}

function HighlightSelectedSearchMenuItem(topBarItem: number, menuItem: number): void {
  SetInitialSearchMenuBgHighlights(topBarItem);
  const B = SEARCH_TOPBAR_COUNT;
  switch (menuItem) {
    case SEARCH_NAME:
      DrawSearchMenuItemBgHighlight(SEARCH_NAME + B, false, false);
      break;
    case SEARCH_COLOR:
      DrawSearchMenuItemBgHighlight(SEARCH_COLOR + B, false, false);
      break;
    case SEARCH_TYPE_LEFT:
      DrawSearchMenuItemBgHighlight(SEARCH_BG_TYPE_TITLE, false, false);
      DrawSearchMenuItemBgHighlight(SEARCH_TYPE_LEFT + B, false, false);
      break;
    case SEARCH_TYPE_RIGHT:
      DrawSearchMenuItemBgHighlight(SEARCH_BG_TYPE_TITLE, false, false);
      DrawSearchMenuItemBgHighlight(SEARCH_TYPE_RIGHT + B, false, false);
      break;
    case SEARCH_ORDER:
      DrawSearchMenuItemBgHighlight(SEARCH_ORDER + B, false, false);
      break;
    case SEARCH_MODE:
      DrawSearchMenuItemBgHighlight(SEARCH_MODE + B, false, false);
      break;
    case SEARCH_OK:
      DrawSearchMenuItemBgHighlight(SEARCH_OK + B, false, false);
      break;
  }
  EraseAndPrintSearchTextBox(_searchText(sSearchMenuItems[menuItem].description));
}

// 1:1 PrintSelectedSearchParameters (pokedex.c:5356).
function PrintSelectedSearchParameters(taskId: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const t = rt.gTasks[taskId];
  ClearSearchMenuRect(40, 16, 96, 80);
  let id = t.data[6] + t.data[7];
  PrintSearchText(_searchText(sDexSearchNameOptions[id].title), 0x2d, 0x11);
  id = t.data[8] + t.data[9];
  PrintSearchText(_searchText(sDexSearchColorOptions[id].title), 0x2d, 0x21);
  id = t.data[10] + t.data[11];
  PrintSearchText(_searchText(sDexSearchTypeOptions[id].title), 0x2d, 0x31);
  id = t.data[12] + t.data[13];
  PrintSearchText(_searchText(sDexSearchTypeOptions[id].title), 0x5d, 0x31);
  id = t.data[4] + t.data[5];
  PrintSearchText(_searchText(sDexOrderOptions[id].title), 0x2d, 0x41);
  if (IsNationalPokedexEnabled()) {
    id = t.data[2] + t.data[3];
    PrintSearchText(_searchText(sDexModeOptions[id].title), 0x2d, 0x51);
  }
}

// 1:1 DrawOrEraseSearchParameterBox (pokedex.c:5385) : cadre tilemap BG3 cols 17-30.
function DrawOrEraseSearchParameterBox(erase: boolean): void {
  const buf = GetBgTilemapBuffer(3);
  if (!buf) return;
  if (!erase) {
    buf[0x11] = 0xc0b;
    for (let i = 0x12; i < 0x1f; i++) buf[i] = 0x80d;
    for (let j = 1; j < 13; j++) {
      buf[0x11 + j * 32] = 0x40a;
      for (let i = 0x12; i < 0x1f; i++) buf[j * 32 + i] = 2;
    }
    buf[0x1b1] = 0x40b;
    for (let i = 0x12; i < 0x1f; i++) buf[0x1a0 + i] = 0xd;
  } else {
    for (let j = 0; j < 14; j++) {
      for (let i = 0x11; i < 0x1e; i++) buf[j * 32 + i] = 0x4f;
    }
  }
}

// 1:1 PrintSearchParameterText (pokedex.c:5420).
function PrintSearchParameterText(taskId: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const t = rt.gTasks[taskId];
  const menuItem = t.data[1];
  const texts = sSearchOptions[menuItem].texts;
  const cursorPos = t.data[sSearchOptions[menuItem].taskDataCursorPos];
  const scrollOffset = t.data[sSearchOptions[menuItem].taskDataScrollOffset];
  ClearSearchParameterBoxText();
  for (let i = 0, j = scrollOffset; i < MAX_SEARCH_PARAM_ON_SCREEN && texts[j].title !== null; i++, j++)
    PrintSearchParameterTitle(i, _searchText(texts[j].title));
  EraseAndPrintSearchTextBox(_searchText(texts[cursorPos + scrollOffset].description));
}

// 1:1 GetSearchModeSelection (pokedex.c:5436).
function GetSearchModeSelection(taskId: number, option: number): number {
  const rt = getRuntime();
  if (!rt) return 0;
  const t = rt.gTasks[taskId];
  const id = t.data[sSearchOptions[option].taskDataCursorPos] + t.data[sSearchOptions[option].taskDataScrollOffset];
  switch (option) {
    default:
      return 0;
    case SEARCH_MODE:
      return sPokedexModes[id];
    case SEARCH_ORDER:
      return sOrderOptions[id];
    case SEARCH_NAME:
      return id === 0 ? 0xff : id;
    case SEARCH_COLOR:
      return id === 0 ? 0xff : id - 1;
    case SEARCH_TYPE_LEFT:
    case SEARCH_TYPE_RIGHT:
      return sDexSearchTypeIds[id];
  }
}

// 1:1 SetDefaultSearchModeAndOrder (pokedex.c:5465).
function SetDefaultSearchModeAndOrder(taskId: number): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return;
  const t = rt.gTasks[taskId];
  t.data[2] = sPokedexView.dexModeBackup === DEX_MODE_NATIONAL ? DEX_MODE_NATIONAL : DEX_MODE_HOENN;   // tCursorPos_Mode
  const o = sPokedexView.dexOrderBackup;
  t.data[4] = (o >= ORDER_NUMERICAL && o <= ORDER_SMALLEST) ? o : ORDER_NUMERICAL;                     // tCursorPos_Order
}

function SearchParamCantScrollUp(taskId: number): boolean {
  const rt = getRuntime();
  if (!rt) return true;
  const t = rt.gTasks[taskId];
  const menuItem = t.data[1];
  const scrollOffset = t.data[sSearchOptions[menuItem].taskDataScrollOffset];
  const lastOption = sSearchOptions[menuItem].numOptions - 1;
  return !(lastOption > MAX_SEARCH_PARAM_CURSOR_POS && scrollOffset !== 0);
}

function SearchParamCantScrollDown(taskId: number): boolean {
  const rt = getRuntime();
  if (!rt) return true;
  const t = rt.gTasks[taskId];
  const menuItem = t.data[1];
  const scrollOffset = t.data[sSearchOptions[menuItem].taskDataScrollOffset];
  const lastOption = sSearchOptions[menuItem].numOptions - 1;
  return !(lastOption > MAX_SEARCH_PARAM_CURSOR_POS && scrollOffset < lastOption - MAX_SEARCH_PARAM_CURSOR_POS);
}

// 1:1 SpriteCB_SearchParameterScrollArrow (pokedex.c:5527) : visibles pendant le scroll
// d'un paramètre seulement, oscillation gSineTable/128. data[0]=taskId, data[1]=isDown.
function SpriteCB_SearchParameterScrollArrow(sprite: DecompSprite): void {
  const rt = getRuntime();
  if (!rt) return;
  const tk = rt.gTasks[sprite.data[0]];
  if (tk && tk.isActive && tk.func === Task_HandleSearchParameterInput) {
    if (sprite.data[1] /* isDownArrow */)
      sprite.invisible = SearchParamCantScrollDown(sprite.data[0]);
    else
      sprite.invisible = SearchParamCantScrollUp(sprite.data[0]);
    const val = (sprite.data[2] + sprite.data[1] * 128) & 0xff;
    sprite.y2 = Math.trunc(gSineTable[val] / 128);
    sprite.data[2] = (sprite.data[2] + 8) & 0xffff;
  } else {
    sprite.invisible = true;
  }
}

// 1:1 CreateSearchParameterScrollArrows (pokedex.c:5556).
function CreateSearchParameterScrollArrows(taskId: number): void {
  const rt = getRuntime();
  if (!rt) return;
  let id = CreateSprite(sScrollArrowSpriteTemplate, 184, 4, 0);
  { const s = rt.gSprites[id]; if (s) { s.data[0] = taskId; s.data[1] = 0; s.callback = SpriteCB_SearchParameterScrollArrow as unknown as typeof s.callback; } }
  id = CreateSprite(sScrollArrowSpriteTemplate, 184, 108, 0);
  { const s = rt.gSprites[id]; if (s) { s.data[0] = taskId; s.data[1] = 1; s.callback = SpriteCB_SearchParameterScrollArrow as unknown as typeof s.callback; } }
  rt.StartSpriteAnim(id, 1);   // vFlip via anim 1 (adaptation flip du port, cf. sScrollArrowSpriteTemplate)
}

// 1:1 helpers texte (pokedex.c:5581-5605).
function EraseAndPrintSearchTextBox(str: string): void {
  ClearSearchMenuRect(8, 120, 224, 32);
  PrintSearchText(str, 8, 121);
}

function EraseSelectorArrow(y: number): void {
  ClearSearchMenuRect(144, y * 16 + 8, 8, 16);
}

function PrintSelectorArrow(y: number): void {
  PrintSearchText(getString('gText_SelectorArrow'), 144, y * 16 + 9);
}

function PrintSearchParameterTitle(y: number, str: string): void {
  PrintSearchText(str, 152, y * 16 + 9);
}

function ClearSearchParameterBoxText(): void {
  ClearSearchMenuRect(144, 8, 96, 96);
}

// ─── Retour de la recherche → liste principale ou résultats (pokedex.c:1830) ─
function Task_WaitForExitSearch(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return;
  if (!rt.gTasks[task.data[0]].isActive) {
    ClearMonSprites();
    if (sPokedexView.screenSwitchState !== 0) {
      // La recherche a produit des résultats.
      sPokedexView.selectedPokemon = 0;
      sPokedexView.pokeBallRotation = 64; // POKEBALL_ROTATION_TOP
      _dexInitSpritesDone = false;
      task.func = Task_OpenSearchResults;
    } else {
      // Annulée : restaure l'état d'avant.
      sPokedexView.pokeBallRotation = sPokedexView.pokeBallRotationBackup;
      sPokedexView.selectedPokemon = sPokedexView.selectedPokemonBackup;
      sPokedexView.dexMode = sPokedexView.dexModeBackup;
      if (!IsNationalPokedexEnabled()) sPokedexView.dexMode = DEX_MODE_HOENN;
      sPokedexView.dexOrder = sPokedexView.dexOrderBackup;
      _dexInitSpritesDone = false;
      task.func = Task_OpenPokedexMainPage;
    }
  }
}

// ─── Écran des résultats de recherche (pokedex.c:1874) ───────────────────────
function Task_OpenSearchResults(task: DecompTask): void {
  if (!sPokedexView) return;
  sPokedexView.isSearchResults = true;
  if (LoadPokedexListPage(PAGE_SEARCH_RESULTS))
    task.func = Task_HandleSearchResultsInput;
}

function Task_HandleSearchResultsInput(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return;
  rt.SetGpuReg(REG_OFFSET_BG0VOFS, sPokedexView.menuY);
  if (sPokedexView.menuY) {
    sPokedexView.menuY -= 8;
    return;
  }
  const A_BUTTON = 0x0001, B_BUTTON = 0x0002, SELECT_BUTTON = 0x0004, START_BUTTON = 0x0008;
  if ((rt.gMain.newKeys & A_BUTTON) && sPokedexView.pokedexList[sPokedexView.selectedPokemon].seen) {
    UpdateSelectedMonSpriteId();
    const monSprite = rt.gSprites[sPokedexView.selectedMonSpriteId];
    const palSlot = monSprite ? monSprite.data[1] : 0;
    if (monSprite) monSprite.callback = SpriteCB_MoveMonForInfoScreen as unknown as typeof monSprite.callback;
    BeginNormalPaletteFade((~(1 << (palSlot + 16))) >>> 0, 0, 0, 0x10, RGB_BLACK);
    task.func = Task_OpenSearchResultsInfoScreenAfterMonMovement;
    PlaySE(SE_PIN);
    FreeWindowAndBgBuffers();
  } else if (rt.gMain.newKeys & START_BUTTON) {
    sPokedexView.menuY = 0;
    sPokedexView.menuIsOpen = true;
    sPokedexView.menuCursorPos = 0;
    task.func = Task_HandleSearchResultsStartMenuInput;
    PlaySE(SE_SELECT);
  } else if (rt.gMain.newKeys & SELECT_BUTTON) {
    BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 0x10, RGB_BLACK);
    task.data[0] = LoadSearchMenu();
    sPokedexView.screenSwitchState = 0;
    task.func = Task_WaitForExitSearch;
    PlaySE(SE_PC_LOGIN);
    FreeWindowAndBgBuffers();
  } else if (rt.gMain.newKeys & B_BUTTON) {
    BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 0x10, RGB_BLACK);
    task.func = Task_ReturnToPokedexFromSearchResults;
    PlaySE(SE_PC_OFF);
  } else {
    sPokedexView.selectedPokemon = TryDoPokedexScroll(sPokedexView.selectedPokemon, 0xe);
    if (sPokedexView.scrollTimer) task.func = Task_WaitForSearchResultsScroll;
  }
}

function Task_WaitForSearchResultsScroll(task: DecompTask): void {
  if (!sPokedexView) return;
  if (UpdateDexListScroll(sPokedexView.scrollDirection, sPokedexView.scrollMonIncrement, sPokedexView.maxScrollTimer))
    task.func = Task_HandleSearchResultsInput;
}

function Task_HandleSearchResultsStartMenuInput(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return;
  rt.SetGpuReg(REG_OFFSET_BG0VOFS, sPokedexView.menuY);
  if (sPokedexView.menuY !== 96) {
    sPokedexView.menuY += 8;
    return;
  }
  const A_BUTTON = 0x0001, B_BUTTON = 0x0002, START_BUTTON = 0x0008;
  if (rt.gMain.newKeys & A_BUTTON) {
    switch (sPokedexView.menuCursorPos) {
      case 0: // RETOUR LISTE
      default:
        rt.gMain.newKeys |= START_BUTTON;
        break;
      case 1: // DÉBUT DE LISTE
        sPokedexView.selectedPokemon = 0;
        sPokedexView.pokeBallRotation = 64;
        ClearMonSprites();
        CreateMonSpritesAtPos(sPokedexView.selectedPokemon, 0xe);
        rt.gMain.newKeys |= START_BUTTON;
        break;
      case 2: // FIN DE LISTE
        sPokedexView.selectedPokemon = sPokedexView.pokemonListCount - 1;
        sPokedexView.pokeBallRotation = sPokedexView.pokemonListCount * 16 + 48;
        ClearMonSprites();
        CreateMonSpritesAtPos(sPokedexView.selectedPokemon, 0xe);
        rt.gMain.newKeys |= START_BUTTON;
        break;
      case 3: // RETOUR AU POKÉDEX
        BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 0x10, RGB_BLACK);
        task.func = Task_ReturnToPokedexFromSearchResults;
        PlaySE(SE_TRUCK_DOOR);
        break;
      case 4: // FERMER LE POKÉDEX
        BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 0x10, RGB_BLACK);
        task.func = Task_ClosePokedexFromSearchResultsStartMenu;
        PlaySE(SE_PC_OFF);
        break;
    }
  }
  if (rt.gMain.newKeys & (START_BUTTON | B_BUTTON)) {
    sPokedexView.menuIsOpen = false;
    task.func = Task_HandleSearchResultsInput;
    PlaySE(SE_SELECT);
  } else if ((rt.gMain.newAndRepeatedKeys & DPAD_UP) && sPokedexView.menuCursorPos) {
    sPokedexView.menuCursorPos--;
    PlaySE(SE_SELECT);
  } else if ((rt.gMain.newAndRepeatedKeys & DPAD_DOWN) && sPokedexView.menuCursorPos < 4) {
    sPokedexView.menuCursorPos++;
    PlaySE(SE_SELECT);
  }
}

function Task_OpenSearchResultsInfoScreenAfterMonMovement(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return;
  const s = rt.gSprites[sPokedexView.selectedMonSpriteId];
  if (s && s.x === MON_PAGE_X && s.y === MON_PAGE_Y) {
    sPokedexView.currentPageBackup = sPokedexView.currentPage;
    task.data[0] = LoadInfoScreen(sPokedexView.pokedexList[sPokedexView.selectedPokemon], sPokedexView.selectedMonSpriteId);
    sPokedexView.selectedMonSpriteId = 0xffff;   // 1:1 : -1
    task.func = Task_WaitForExitSearchResultsInfoScreen;
  }
}

function Task_WaitForExitSearchResultsInfoScreen(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return;
  if (rt.gTasks[task.data[0]].isActive) {
    if (sPokedexView.currentPage === PAGE_INFO && !IsInfoScreenScrolling(task.data[0]) && TryDoInfoScreenScroll())
      StartInfoScreenScroll(sPokedexView.pokedexList[sPokedexView.selectedPokemon], task.data[0]);
  } else {
    // Sortie : retour aux résultats.
    _dexInitSpritesDone = false;
    task.func = Task_OpenSearchResults;
  }
}

function Task_ReturnToPokedexFromSearchResults(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return;
  if (!rt.gPaletteFade.active) {
    sPokedexView.pokeBallRotation = sPokedexView.pokeBallRotationBackup;
    sPokedexView.selectedPokemon = sPokedexView.selectedPokemonBackup;
    sPokedexView.dexMode = sPokedexView.dexModeBackup;
    if (!IsNationalPokedexEnabled()) sPokedexView.dexMode = DEX_MODE_HOENN;
    sPokedexView.dexOrder = sPokedexView.dexOrderBackup;
    _dexInitSpritesDone = false;
    task.func = Task_OpenPokedexMainPage;
    ClearMonSprites();
    FreeWindowAndBgBuffers();
  }
}

function Task_ClosePokedexFromSearchResultsStartMenu(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return;
  if (!rt.gPaletteFade.active) {
    sPokedexView.pokeBallRotation = sPokedexView.pokeBallRotationBackup;
    sPokedexView.selectedPokemon = sPokedexView.selectedPokemonBackup;
    sPokedexView.dexMode = sPokedexView.dexModeBackup;
    if (!IsNationalPokedexEnabled()) sPokedexView.dexMode = DEX_MODE_HOENN;
    sPokedexView.dexOrder = sPokedexView.dexOrderBackup;
    task.func = Task_ClosePokedex;
  }
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
