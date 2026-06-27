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
} from './engine/ui/gba-window-system';
import { AddTextPrinterParameterized4, FONT_NARROW, TEXT_SKIP_DRAW } from './engine/ui/gba-text-system';
import { TEXT_COLOR_TRANSPARENT, TEXT_COLOR_LIGHT_GRAY, TEXT_DYNAMIC_COLOR_6 } from '../include/constants/characters';
import { BG_PLTT_ID, type DecompTask } from '../harness/runtime/decomp-runtime';
import { loadTileBin, loadTilemapBin, loadGbaPal } from '../harness/gba/png-loader';
import { CB2_ReturnToFieldWithOpenMenu_Manual } from './engine/ui/option-menu-return';
import {
  GetSetPokedexFlag, GetHoennPokedexCount as DexGetHoennCount,
  NationalToHoennOrder, HoennToNationalOrder, NationalPokedexNumToSpecies,
  HOENN_DEX_COUNT, NATIONAL_DEX_COUNT,
} from './engine/ui/pokedex-flags';
import { gSpeciesNames } from './engine/data/game-data';
import { SE_PC_OFF, SE_DEX_SCROLL, SE_DEX_PAGE, SE_PIN } from '../include/constants/songs';
import { reverseDecompConstant } from '../harness/runtime/decomp-constants';

// ─── Constantes 1:1 (pokedex.h / pokedex.c) ──────────────────────────────────
const PAGE_MAIN = 0;
// const PAGE_SEARCH_RESULTS = 1;            // jalon 4
const PAGE_INFO = 2;                          // 1:1 enum pokedex.c:35
const DEX_MODE_HOENN = 0;
// const DEX_MODE_NATIONAL = 1;              // national : jalon 4
const ORDER_NUMERICAL = 0;
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
// 1:1 décomp `ResetPokedexScrollPositions`/`ResetPokedex` (pokedex.c:1521/1543) : posent
// sPokeBallRotation = POKEBALL_ROTATION_TOP (64) au chargement de partie (new_game.c /
// event_data.c). Le port n'appelle pas encore cette chaîne → on initialise la valeur ici.
let sPokeBallRotation = 64; // POKEBALL_ROTATION_TOP

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
}
let _assets: PokedexAssets | null = null;
let _assetsLoading: Promise<PokedexAssets> | null = null;
function _loadAssets(): Promise<PokedexAssets> {
  if (_assets) return Promise.resolve(_assets);
  if (_assetsLoading) return _assetsLoading;
  _assetsLoading = (async () => {
    const [menuTiles, listTilemap, underlayTilemap, startMenuTilemap, bgHoennPal, caughtBall, interfaceTiles, infoScreenTilemap, screenSelectBarMainTilemap] = await Promise.all([
      loadTileBin(`${ASSET}/menu.png`, 4),          // sibling menu.4bpp.bin (indices bruts)
      loadTilemapBin(`${ASSET}/list.bin`),
      loadTilemapBin(`${ASSET}/list_underlay.bin`),
      loadTilemapBin(`${ASSET}/start_menu_main.bin`),
      loadGbaPal(`${ASSET}/bg_hoenn.pal`),
      loadTileBin(`${ASSET}/caught_ball.png`, 4),    // sibling caught_ball.4bpp.bin
      loadTileBin(`${ASSET}/interface.png`, 4),      // sibling interface.4bpp.bin (sprites)
      loadTilemapBin(`${ASSET}/info_screen.bin`),    // gPokedexInfoScreen_Tilemap (cadre fiche)
      loadTilemapBin(`${ASSET}/screen_select_bar_main.bin`), // barre de sélection bas de fiche
    ]);
    _assets = { menuTiles, listTilemap, underlayTilemap, startMenuTilemap, bgHoennPal, caughtBall, interfaceTiles, infoScreenTilemap, screenSelectBarMainTilemap };
    // assetCache keyed pour LoadCompressedSpriteSheet/LoadSpritePalettes (sprites d'interface, TAG 4096).
    assetCache.set('gPokedexInterface_Gfx', interfaceTiles);
    assetCache.set('gPokedexBgHoenn_Pal', bgHoennPal);
    return _assets;
  })();
  return _assetsLoading;
}

// ─── Liste des mons (JALON 1b) ───────────────────────────────────────────────
// const LIST_SCROLL_STEP = 16;   // JALON 1d (scroll Up/Down)

// 1:1 décomp `CreatePokedexList` (pokedex.c:2190) — ORDER_NUMERICAL (Hoenn).
// (Tris alphabétique/poids/taille + mode National = JALON 4.)
function CreatePokedexList(_dexMode: number, _order: number): void {
  if (!sPokedexView) return;
  const v = sPokedexView;
  v.pokemonListCount = 0;
  const dexCount = HOENN_DEX_COUNT; // DEX_MODE_HOENN (National = jalon 4)
  for (let i = 0; i < dexCount; i++) {
    const dexNum = HoennToNationalOrder(i + 1);
    v.pokedexList[i].dexNum = dexNum;
    v.pokedexList[i].seen = GetSetPokedexFlag(dexNum, FLAG_GET_SEEN) !== 0;
    v.pokedexList[i].owned = GetSetPokedexFlag(dexNum, FLAG_GET_CAUGHT) !== 0;
    if (v.pokedexList[i].seen) v.pokemonListCount = i + 1;
  }
  // 1:1 décomp pokedex.c:2328-2333 : efface (dexNum=0xFFFF) toutes les entrées AU-DELÀ du
  // plus haut Nº vu → la liste s'arrête à pokemonListCount (= se fixe au plus gros vu ; les
  // non-vus EN-DESSOUS restent « ---------- », ceux au-dessus disparaissent).
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
    // idx OBJ = 0x100 + slot*16 (16 couleurs = 32 octets).
    if (pal) LoadPalette(pal.subarray(0, 16), 0x100 + slot * 16, 32);
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
  if (sPokedexView.currentPage !== PAGE_MAIN && sPokedexView.currentPage !== 1 /* PAGE_SEARCH_RESULTS */) {
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
  if (sPokedexView.currentPage !== PAGE_MAIN && sPokedexView.currentPage !== 1 /* PAGE_SEARCH_RESULTS */) {
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
  if (sPokedexView.currentPage !== PAGE_MAIN && sPokedexView.currentPage !== 1 /* PAGE_SEARCH_RESULTS */) {
    DestroySprite(sprite.spriteId);
  } else {
    sprite.y2 = Math.trunc((sPokedexView.selectedPokemon * 120) / (sPokedexView.pokemonListCount - 1));
  }
}

// 1:1 décomp `SpriteCB_ScrollArrow` (pokedex.c:3099) : flèche haut/bas qui pulse (gSineTable),
// masquée aux extrémités de liste ou quand le menu START est ouvert. sIsDownArrow = data[1].
function SpriteCB_ScrollArrow(sprite: DecompSprite): void {
  if (!sPokedexView) return;
  if (sPokedexView.currentPage !== PAGE_MAIN && sPokedexView.currentPage !== 1 /* PAGE_SEARCH_RESULTS */) {
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
  if (sPokedexView.currentPage !== PAGE_MAIN && sPokedexView.currentPage !== 1 /* PAGE_SEARCH_RESULTS */)
    DestroySprite(sprite.spriteId);
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

  if (page === PAGE_MAIN) {
    // Hoenn (!IsNationalPokedexEnabled). National = jalon 4.
    let digitNum: number;
    let drawNextDigit: boolean;
    // Labels VUS / PRIS
    CreateSprite(sSeenOwnTextSpriteTemplate, 32, 40, 1);
    anim(CreateSprite(sSeenOwnTextSpriteTemplate, 32, 72, 1), 1);

    // Valeur VUS : centaines / dizaines / unités (masquage des zéros de tête).
    drawNextDigit = false;
    id = CreateSprite(sHoennDexSeenOwnNumberSpriteTemplate, 24, 48, 1);
    digitNum = Math.floor(sPokedexView.seenCount / 100);
    anim(id, digitNum);
    if (digitNum !== 0) drawNextDigit = true; else hide(id);
    id = CreateSprite(sHoennDexSeenOwnNumberSpriteTemplate, 32, 48, 1);
    digitNum = Math.floor((sPokedexView.seenCount % 100) / 10);
    if (digitNum !== 0 || drawNextDigit) anim(id, digitNum); else hide(id);
    id = CreateSprite(sHoennDexSeenOwnNumberSpriteTemplate, 40, 48, 1);
    anim(id, (sPokedexView.seenCount % 100) % 10);

    // Valeur PRIS : centaines / dizaines / unités.
    drawNextDigit = false;
    id = CreateSprite(sHoennDexSeenOwnNumberSpriteTemplate, 24, 80, 1);
    digitNum = Math.floor(sPokedexView.ownCount / 100);
    anim(id, digitNum);
    if (digitNum !== 0) drawNextDigit = true; else hide(id);
    id = CreateSprite(sHoennDexSeenOwnNumberSpriteTemplate, 32, 80, 1);
    digitNum = Math.floor((sPokedexView.ownCount % 100) / 10);
    if (digitNum !== 0 || drawNextDigit) anim(id, digitNum); else hide(id);
    id = CreateSprite(sHoennDexSeenOwnNumberSpriteTemplate, 40, 80, 1);
    anim(id, (sPokedexView.ownCount % 100) % 10);
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
      // dexMode/order depuis le saveblock — jalon 4 (national). 1a = Hoenn défaut.
      v.dexMode = DEX_MODE_HOENN;
      v.dexOrder = ORDER_NUMERICAL;
      v.selectedPokemon = sLastSelectedPokemon;
      v.pokeBallRotation = sPokeBallRotation;
      v.selectedScreen = AREA_SCREEN;
      v.seenCount = DexGetHoennCount(FLAG_GET_SEEN);
      v.ownCount = DexGetHoennCount(FLAG_GET_CAUGHT);
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
  const A_BUTTON = 0x0001, B_BUTTON = 0x0002;
  // JALON 2 : A → fiche info (gaté sur .seen). START (menu list-top/bottom/close) + SELECT
  // (recherche) = jalon 4 (non gérés → tombent dans la branche D-pad).
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

// 1:1 décomp `Task_WaitForExitInfoScreen` (pokedex.c:1813) : tant que la fiche est active, ne
// rien faire (scroll DANS la fiche = jalon 2b/3) ; à sa fin → retour à la liste.
function Task_WaitForExitInfoScreen(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || !sPokedexView) return;
  if (rt.gTasks[task.data[0]].isActive) {
    // JALON 2b/3 : IsInfoScreenScrolling/TryDoInfoScreenScroll/StartInfoScreenScroll.
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
  // SetBgTilemapBuffer(n) : buffers intrinsèques au runtime → no-op (cf. LoadPokedexListPage).
  InitWindows(sInfoScreen_WindowTemplates);
  DeactivateAllTextPrinters();
  // gMain.state vaut 0 ici (LoadPokedexListPage case 6 l'a remis à 0 ; rien ne l'a touché
  // depuis) — Task_LoadInfoScreen démarre donc bien sur case 0 (1:1 invariant décomp).
  return taskId;
}

// 1:1 décomp `Task_LoadInfoScreen` (pokedex.c:3248) — state-machine 0..10. JALON 2a : tout
// SAUF PrintMonInfo (texte) + DrawFootprint (= 2b). Le mon = sprite réutilisé de la liste.
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
      // 1:1 DecompressAndLoadBgGfxUsingHeap(3, gPokedexMenu_Gfx) → tiles menu @ charBase 0.
      rt.gba.vram.set(_assets.menuTiles, 0);
      CopyToBgTilemapBuffer(3, _assets.infoScreenTilemap, 0, 0);
      FillWindowPixelBuffer(WIN_INFO, 0);
      PutWindowTilemap(WIN_INFO);
      PutWindowTilemap(WIN_FOOTPRINT);
      // JALON 2b : DrawFootprint(WIN_FOOTPRINT, dexNum) (besoin de gMonFootprintTable). En 2a
      // la fenêtre footprint reste vide (cadre visible, empreinte ajoutée en 2b).
      FillWindowPixelBuffer(WIN_FOOTPRINT, 0);
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
    case 4:
      // JALON 2b : PrintMonInfo(dexNum, …) = Nº/nom/catégorie FR/taille/poids/description.
      // Sans texte WIN_INFO reste vide ; le cadre + la barre s'affichent.
      CopyWindowToVram(WIN_INFO, 3 /* COPYWIN_FULL */);
      CopyBgTilemapBufferToVram(1);
      CopyBgTilemapBufferToVram(2);
      CopyBgTilemapBufferToVram(3);
      rt.gMain.state++;
      break;
    case 5:
      // tMonSpriteDone TRUE → réutilise le sprite de la liste (déjà chargé) : rien à créer.
      // (Le chemin !tMonSpriteDone = scroll/saut DANS la fiche = jalon 2b/3.)
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
  if (task.data[0]) return;   // tScrolling (scroll dans la fiche) = jalon 2b/3
  if (rt.gMain.newKeys & B_BUTTON) {
    BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);
    task.func = Task_ExitInfoScreen;
    PlaySE(SE_PC_OFF);
    return;
  }
  if (rt.gMain.newKeys & A_BUTTON) {
    switch (sPokedexView.selectedScreen) {
      case CANCEL_SCREEN:
        BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 0x10, RGB_BLACK);
        task.func = Task_ExitInfoScreen;
        PlaySE(SE_PC_OFF);
        break;
      default:
        // JALON 3 : AREA_SCREEN/CRY_SCREEN/SIZE_SCREEN → Task_LoadAreaScreen/Cry/Size.
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

// 1:1 décomp `Task_ExitInfoScreen` (pokedex.c:3484) : libère le sprite mon + buffers, détruit la tâche.
function Task_ExitInfoScreen(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  if (rt.gPaletteFade.active) return;
  _freeInfoMonSprite(task.data[4]);
  FreeInfoScreenWindowAndBgBuffers();
  rt.DestroyTask(task.taskId);
}

// décomp FreeAndDestroyMonPicSprite : libère le slot image-based. Port = DestroySprite (les
// tiles/palette sont réinit au prochain ResetSpriteData de la liste).
function _freeInfoMonSprite(spriteId: number): void {
  if (spriteId !== 0xffff && spriteId !== undefined) {
    try { DestroySprite(spriteId); } catch { /* déjà détruit */ }
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
      // SetBgTilemapBuffer(n, …) : buffer intrinsèque par-BG dans le port → no-op.
      // 1:1 DecompressAndLoadBgGfxUsingHeap(3, gPokedexMenu_Gfx) → BG3 charBase 0 + tilemaps.
      rt.gba.vram.set(_assets.menuTiles, 0 * 0x4000);
      CopyToBgTilemapBuffer(1, _assets.listTilemap, 0, 0);
      CopyToBgTilemapBuffer(3, _assets.underlayTilemap, 0, 0);
      CopyToBgTilemapBuffer(0, _assets.startMenuTilemap, 0, 0x280);
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
