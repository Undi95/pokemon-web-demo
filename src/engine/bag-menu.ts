/**
 * bag-menu.ts — SAC 1:1 décomp `src/item_menu.c` (2609 l) — RÉÉCRITURE PROPRE
 * ============================================================================
 * Chantier maillon SAC (mémoire BAG-PHASE-2-PLAN). `list_menu.c` (BLOQUANT #1)
 * = 100% 1:1 fait. Ce module REMPLACE le foam reverted `bag-screen.ts`
 * (cddfcfee, base "en mousse") — réécrit PROPRE comme summary-screen.ts.
 * Le câblage start-menu/party bascule vers ici à l'ÉTAPE 9 (le plan le
 * prescrit) ; jusque-là `bag-screen.ts` continue de servir le sac → tsc
 * reste vert, zéro régression runtime.
 *
 * Pattern CB2-swap = IDENTIQUE au summary-screen.ts prouvé/A-B-validé :
 * `SetupBagMenu` (décomp `CB2_Bag` while-loop) → state machine avancée
 * d'UN état par frame par le runtime (1:1 net-effect : tout est derrière
 * un fade noir jusqu'à BlendPalettes/FadeScreen ; adaptation acceptée &
 * validée pour Summary/party — synchrone, PAS d'async ad-hoc = exigence
 * anti-foam respectée).
 *
 * ── ÉTAT D'AVANCEMENT (SPINE, A/B user aux checkpoints) ──────────────────
 *  ÉTAPE 2 (ICI)  : state model gBagMenu/gBagPosition + GoToBagMenu +
 *                   entrées maillon (CB2_BagMenuFrom*) + CB2_Bag +
 *                   SetupBagMenu 1:1 STRUCTURE + CB2/VBlank run.
 *  ÉTAPE 3..9     : helpers `_nyi(...)` (throw LOUD honnête, WORKING-MODE
 *                   §2 — jamais de fake silencieux) portés au fur.
 * Non wiré → ouvrir le sac passe encore par le foam ; ici tsc=0 +
 * import sain (feuille, pas de cycle TDZ) = vérif déterministe étape 2.
 */
import {
  getRuntime, ResetPaletteFade, ResetTasks,
  FreeAllSpritePalettes, ScanlineEffect_Stop, LoadPalette, PIXEL_FILL,
  assetCache, PlaySE,
} from './decomp-globals';
import { ResetSpriteData, PLTT_SIZE_4BPP } from './decomp-bridge';
import { ListMenuLoadStdPalAt } from './gba-menu-system';
import {
  getBagPocketSlots, getBagPocketCapacity, slotItemId,
  CompactItemsInBagPocket, SortBerriesOrTMHMs,
  BagGetItemIdByPocketPosition, BagGetQuantityByPocketPosition,
} from './bag-pockets';
import {
  SetCursorWithinListBounds, SetCursorScrollWithinListBounds, type ListPos,
} from './menu-helpers';
import {
  gMultiuseListMenuTemplate, LIST_CANCEL, LIST_NO_MULTIPLE_SCROLL,
  CURSOR_BLACK_ARROW, gText_SelectorArrow2, ListMenuGetYCoordForPrintingArrowCursor,
  type ListMenuTemplate, type ListMenu,
} from './list-menu';
import { getItemKeyById } from './data-tables';
import { ItemIdToBattleMoveId } from './tmhm-moves';
import { getMoveName } from './data/game-data';
import {
  GetItemName, GetItemDescription, StringCopy, ConvertIntToDecimalStringN,
  STR_CONV_MODE_LEADING_ZEROS, STR_CONV_MODE_RIGHT_ALIGN,
} from './decomp-bridge';
import {
  ShowBg, InitWindows, FillWindowPixelBuffer, PutWindowTilemap,
  LoadMessageBoxGfx, ScheduleBgCopyTilemapToVram, FillWindowPixelRect,
  type WindowTemplate,
} from './gba-window-system';
import { LoadUserWindowBorderGfx } from './gba-text-window';
import {
  DeactivateAllTextPrinters, StringExpandPlaceholders, FONT_NARROW,
  FONT_NORMAL, AddTextPrinterParameterized4, GetMenuCursorDimensionByFont,
  GetStringRightAlignXOffset, TEXT_SKIP_DRAW,
} from './gba-text-system';
import {
  TEXT_COLOR_TRANSPARENT, TEXT_COLOR_WHITE, TEXT_COLOR_DARK_GRAY,
  TEXT_COLOR_LIGHT_GRAY, TEXT_COLOR_RED, TEXT_COLOR_GREEN,
  TEXT_DYNAMIC_COLOR_1, TEXT_DYNAMIC_COLOR_5,
} from './decomp-data/auto/include/constants/characters-data';
import { BG_PLTT_ID } from './decomp-runtime';
import { loadTileBin, loadTilemapBin, loadGbaPal } from './gba/png-loader';
import { gameState } from './game-state';
import {
  ENUM_ITEMMENULOCATION_0, ENUM_ITEMWIN_1, ENUM_ITEMMENUSPRITE_2,
  ITEMMENU_SWAP_LINE_LENGTH,
} from './decomp-data/auto/include/item_menu-data';
import {
  ITEMS_POCKET, BALLS_POCKET, TMHM_POCKET, BERRIES_POCKET,
  KEYITEMS_POCKET, POCKETS_COUNT,
} from './decomp-data/auto/include/constants/item-data';
import { BG_SCREEN_SIZE } from './decomp-data/auto/include/gba/defines-data';
import {
  ITEM_LIST_END, ITEM_HM01, ITEM_HM08, ITEM_TM01,
  ITEM_CHERI_BERRY, BAG_ITEM_CAPACITY_DIGITS, BERRY_CAPACITY_DIGITS,
} from './decomp-data/auto/include/constants/items-data';
import { SE_SELECT } from './decomp-data/auto/include/constants/songs-data';

// ─── Constantes 1:1 (importées decomp-data/auto sauf dérivées documentées) ───
export const ITEMMENULOCATION_FIELD = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_FIELD;
export const ITEMMENULOCATION_BATTLE = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_BATTLE;
export const ITEMMENULOCATION_PARTY = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_PARTY;
export const ITEMMENULOCATION_SHOP = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_SHOP;
export const ITEMMENULOCATION_BERRY_TREE = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_BERRY_TREE;
export const ITEMMENULOCATION_BERRY_BLENDER_CRUSH = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_BERRY_BLENDER_CRUSH;
export const ITEMMENULOCATION_ITEMPC = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_ITEMPC;
export const ITEMMENULOCATION_FAVOR_LADY = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_FAVOR_LADY;
export const ITEMMENULOCATION_QUIZ_LADY = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_QUIZ_LADY;
export const ITEMMENULOCATION_APPRENTICE = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_APPRENTICE;
export const ITEMMENULOCATION_WALLY = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_WALLY;
export const ITEMMENULOCATION_PCBOX = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_PCBOX;
export const ITEMMENULOCATION_LAST = ENUM_ITEMMENULOCATION_0.ITEMMENULOCATION_LAST;

// ITEMMENUSPRITE_COUNT : ⚠️ l'auto-extract donne 5 (FAUX — il n'évalue
// pas l'expression `ITEMMENUSPRITE_SWAP_LINE + ITEMMENU_SWAP_LINE_LENGTH`).
// Décomp item_menu.h:46 : `ITEMMENUSPRITE_COUNT = ITEMMENUSPRITE_SWAP_LINE
// + ITEMMENU_SWAP_LINE_LENGTH` = 4 + 8 = 12. On le DÉRIVE 1:1 (pas hardcode).
const ITEMMENUSPRITE_SWAP_LINE = ENUM_ITEMMENUSPRITE_2.ITEMMENUSPRITE_SWAP_LINE;
export const ITEMMENUSPRITE_BAG = ENUM_ITEMMENUSPRITE_2.ITEMMENUSPRITE_BAG;
export const ITEMMENUSPRITE_COUNT = ITEMMENUSPRITE_SWAP_LINE + ITEMMENU_SWAP_LINE_LENGTH; // 12
export const ITEMWIN_COUNT = ENUM_ITEMWIN_1.ITEMWIN_COUNT; // 10
export { ITEMS_POCKET, BALLS_POCKET, TMHM_POCKET, BERRIES_POCKET, KEYITEMS_POCKET, POCKETS_COUNT };

// 1:1 décomp enum WIN_* (item_menu.c:95) — fenêtres SANS cadre (le fond
// rayé menu.bin BG2 fait le layout ; feedback-bag-no-frames).
const WIN_ITEM_LIST = 0;
const WIN_DESCRIPTION = 1;
const WIN_POCKET_NAME = 2;
const WIN_TMHM_INFO_ICONS = 3;
const WIN_TMHM_INFO = 4;
const WIN_MESSAGE = 5;

// 1:1 décomp `sDefaultBagWindows` (item_menu.c:396). bg/tilemapLeft/Top/
// width/height/paletteNum/baseBlock identiques. (DUMMY_WIN_TEMPLATE = fin.)
const sDefaultBagWindows: readonly WindowTemplate[] = [
  { bg: 0, tilemapLeft: 14, tilemapTop: 2,  width: 15, height: 16, paletteNum: 1,  baseBlock: 0x27  }, // WIN_ITEM_LIST
  { bg: 0, tilemapLeft: 0,  tilemapTop: 13, width: 14, height: 6,  paletteNum: 1,  baseBlock: 0x117 }, // WIN_DESCRIPTION
  { bg: 0, tilemapLeft: 4,  tilemapTop: 1,  width: 8,  height: 2,  paletteNum: 1,  baseBlock: 0x1A1 }, // WIN_POCKET_NAME
  { bg: 0, tilemapLeft: 1,  tilemapTop: 13, width: 5,  height: 6,  paletteNum: 12, baseBlock: 0x16B }, // WIN_TMHM_INFO_ICONS
  { bg: 0, tilemapLeft: 7,  tilemapTop: 13, width: 4,  height: 6,  paletteNum: 12, baseBlock: 0x189 }, // WIN_TMHM_INFO
  { bg: 1, tilemapLeft: 2,  tilemapTop: 15, width: 27, height: 4,  paletteNum: 15, baseBlock: 0x1B1 }, // WIN_MESSAGE
];
/** ids window du sac (= retour InitWindows, indexé par WIN_*). 1:1 décomp :
 *  les WIN_* sont les ids globaux gWindows ; chez nous = ce tableau. */
let _bagWinIds: number[] = [];

// Sentinelles 1:1 : SPRITE_NONE sprite.h:6 / WINDOW_NONE window.h:43 /
// TASK_NONE task.h:6 (TAIL_SENTINEL=0xFF) / NOT_SWAPPING item_menu.c:104.
const SPRITE_NONE = 0xFF;
const WINDOW_NONE = 0xFF;
const TASK_NONE = 0xFF;
const NOT_SWAPPING = 0xFF;

type MainCallback = (() => void) | null;

// ─── struct BagPosition (item_menu.h:49) — PERSISTANT (décomp EWRAM_DATA,
//     jamais libéré : conserve poche/curseur/scroll entre 2 ouvertures) ──────
interface BagPosition {
  exitCallback: MainCallback;
  location: number;
  pocket: number;
  pocketSwitchArrowPos: number;
  cursorPosition: number[]; // [POCKETS_COUNT]
  scrollPosition: number[]; // [POCKETS_COUNT]
}
export const gBagPosition: BagPosition = {
  exitCallback: null,
  location: 0,
  pocket: 0,
  pocketSwitchArrowPos: 0,
  cursorPosition: new Array(POCKETS_COUNT).fill(0),
  scrollPosition: new Array(POCKETS_COUNT).fill(0),
};

// ─── struct BagMenu (item_menu.h:61) — PAR-OUVERTURE (AllocZeroed ;
//     null quand le sac est fermé). Champs 1:1. ──────────────────────────────
interface BagMenu {
  newScreenCallback: MainCallback;
  tilemapBuffer: Uint16Array;        // u8[BG_SCREEN_SIZE] utilisé en tilemap u16
  spriteIds: number[];               // [ITEMMENUSPRITE_COUNT]
  windowIds: number[];               // [ITEMWIN_COUNT]
  toSwapPos: number;
  pocketSwitchDisabled: number;      // :4
  itemIconSlot: number;              // :2
  inhibitItemDescriptionPrint: number; // :1
  hideCloseBagText: number;          // :1
  pocketScrollArrowsTask: number;
  pocketSwitchArrowsTask: number;
  contextMenuItemsPtr: readonly number[] | null;
  contextMenuItemsBuffer: number[];  // [4]
  contextMenuNumItems: number;
  numItemStacks: number[];           // [POCKETS_COUNT]
  numShownItems: number[];           // [POCKETS_COUNT]
  graphicsLoadState: number;         // s16
  pocketNameBuffer: Uint8Array;      // [32][32]
}
export let gBagMenu: BagMenu | null = null;

function _allocZeroedBagMenu(): BagMenu {
  return {
    newScreenCallback: null,
    tilemapBuffer: new Uint16Array(BG_SCREEN_SIZE >> 1), // 2048 octets = 1024 u16
    spriteIds: new Array(ITEMMENUSPRITE_COUNT).fill(0),
    windowIds: new Array(ITEMWIN_COUNT).fill(0),
    toSwapPos: 0,
    pocketSwitchDisabled: 0,
    itemIconSlot: 0,
    inhibitItemDescriptionPrint: 0,
    hideCloseBagText: 0,
    pocketScrollArrowsTask: 0,
    pocketSwitchArrowsTask: 0,
    contextMenuItemsPtr: null,
    contextMenuItemsBuffer: new Array(4).fill(0),
    contextMenuNumItems: 0,
    numItemStacks: new Array(POCKETS_COUNT).fill(0),
    numShownItems: new Array(POCKETS_COUNT).fill(0),
    graphicsLoadState: 0,
    pocketNameBuffer: new Uint8Array(32 * 32),
  };
}

/* ============================================================================
 * ÉTAPE 3 — BagMenu_InitBGs (item_menu.c:789) + LoadBagMenu_Graphics (:805)
 * Pattern BG-buffer + loader gated-bool = IDENTIQUE summary-screen.ts prouvé
 * (net-effect 1:1 du state machine synchrone décomp ; structure gated =
 * exigence anti-foam respectée, pas d'async ad-hoc éparpillé).
 * ========================================================================== */

// 1:1 décomp `sBgTemplates_ItemMenu` (item_menu.c:213) :
//  BG0 char0 map31 ss0 prio1 ; BG1 char0 map30 ss0 prio0 ; BG2 char3 map29 ss0 prio2.
const BAG_BG0_MAP_BASE = 31;
const BAG_BG1_MAP_BASE = 30;
const BAG_BG2_MAP_BASE = 29;
const BAG_BG2_CHAR_BASE = 3;

interface BagAssets {
  bgTiles: Uint8Array;       // gBagScreen_Gfx     (menu.4bpp.bin → BG2 charBase 3)
  bgTilemap: Uint16Array;    // gBagScreen_GfxTileMap (menu.bin → tilemapBuffer)
  palMale: Uint16Array;      // gBagScreenMale_Pal   (menu_male.pal)
  palFemale: Uint16Array;    // gBagScreenFemale_Pal (menu_female.pal)
  stdMenuPal: Uint16Array;   // gStandardMenuPalette (interface/std_menu.pal)
}
let _bagAssets: BagAssets | null = null;
let _bagAssetsLoading: Promise<BagAssets> | null = null;
let _bagGraphicsReady = false;
let _bagGraphicsLoading = false;

async function _bagLoadAssets(): Promise<BagAssets> {
  if (_bagAssets) return _bagAssets;
  if (_bagAssetsLoading) return _bagAssetsLoading;
  _bagAssetsLoading = (async () => {
    const [bgTiles, bgTilemap, palMale, palFemale, stdMenuPal, mi1, mi2, mi3] = await Promise.all([
      loadTileBin('/decomp/em/bag/menu.4bpp.bin', 4),
      loadTilemapBin('/decomp/em/bag/menu.bin'),
      loadGbaPal('/decomp/em/bag/menu_male.pal'),
      loadGbaPal('/decomp/em/bag/menu_female.pal'),
      loadGbaPal('/decomp/em/interface/std_menu.pal'),       // gStandardMenuPalette
      loadGbaPal('/decomp/em/interface/menu_info1.pal'),      // gMenuInfoElements1_Pal
      loadGbaPal('/decomp/em/interface/menu_info2.pal'),      // gMenuInfoElements2_Pal
      loadGbaPal('/decomp/em/interface/menu_info3.pal'),      // gMenuInfoElements3_Pal
    ]);
    // Préchauffe assetCache pour le ListMenuLoadStdPalAt PARTAGÉ (gba-menu-
    // system.ts) — pattern préchargement-symbole prouvé (intro/std_menu).
    assetCache.set('gMenuInfoElements1_Pal', mi1);
    assetCache.set('gMenuInfoElements2_Pal', mi2);
    assetCache.set('gMenuInfoElements3_Pal', mi3);
    _bagAssets = { bgTiles, bgTilemap, palMale, palFemale, stdMenuPal };
    return _bagAssets;
  })();
  return _bagAssetsLoading;
}

/** 1:1 décomp `IsWallysBag` (item_menu.c:2289) :
 *  `return gBagPosition.location == ITEMMENULOCATION_WALLY`. */
function IsWallysBag(): boolean {
  return gBagPosition.location === ITEMMENULOCATION_WALLY;
}

/** 1:1 décomp `SetBgTilemapBuffer(2, gBagMenu->tilemapBuffer)` +
 *  `ScheduleBgCopyTilemapToVram(2)` : le buffer (gBagMenu.tilemapBuffer,
 *  0x800 octets = 1024 u16) → VRAM mapBase BG2. Modèle BG-buffer prouvé
 *  Summary (`_scheduleBgCopy`), 1 seul buffer ici (≠ pages Summary). */
function _bagScheduleBgCopy(bg: number): void {
  const rt = getRuntime();
  if (!rt || !gBagMenu) return;
  if (bg === 0 || bg === 1) return; // BG0/BG1 = windows/ctx, gérés ailleurs
  const buf = gBagMenu.tilemapBuffer;
  const bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  rt.gba.vram.set(bytes, BAG_BG2_MAP_BASE * 0x800);
}

/** 1:1 décomp `BagMenu_InitBGs` (item_menu.c:789). ResetVramOamAndBgCntRegs
 *  + InitBgsFromTemplates(sBgTemplates_ItemMenu) + SetBgTilemapBuffer(2)
 *  + ResetAllBgsCoordinates + ScheduleBgCopy(2) + DISPCNT OBJ + ShowBg
 *  0/1/2 + BLDCNT=0. Style runtime-API = pattern Summary `_initBGs`. */
function BagMenu_InitBGs(): void {
  const rt = getRuntime();
  if (!rt || !gBagMenu) return;
  // ResetVramOamAndBgCntRegs() : DISPCNT/BGxCNT=0, VRAM/OAM/PLTT clear.
  rt.SetGpuReg(0x00, 0);
  rt.SetGpuReg(0x08, 0); rt.SetGpuReg(0x0A, 0); rt.SetGpuReg(0x0C, 0); rt.SetGpuReg(0x0E, 0);
  rt.gba.vram.fill(0);
  for (let i = 0; i < rt.gba.oam.length; i++) {
    const oam = rt.gba.oam[i];
    oam.visible = false; oam.x = 0; oam.y = 0;
    oam.tileId = 0; oam.paletteBank = 0; oam.affineMode = 0;
  }
  for (let i = 0; i < 512; i++) { rt.gPlttBufferUnfaded.set(i, 0); rt.gPlttBufferFaded.set(i, 0); }
  // memset(gBagMenu->tilemapBuffer, 0, sizeof) — déjà zéro à l'alloc, 1:1.
  gBagMenu.tilemapBuffer.fill(0);
  // ResetBgsAndClearDma3BusyFlags(0) + InitBgsFromTemplates(sBgTemplates_ItemMenu).
  const cfg = (n: 0 | 1 | 2 | 3) => rt.gba.bg(n).config;
  const b0 = cfg(0);
  b0.charBaseIndex = 0; b0.mapBaseIndex = BAG_BG0_MAP_BASE; b0.screenSize = 0;
  b0.paletteMode = 0; b0.priority = 1; b0.hofs = 0; b0.vofs = 0;
  const b1 = cfg(1);
  b1.charBaseIndex = 0; b1.mapBaseIndex = BAG_BG1_MAP_BASE; b1.screenSize = 0;
  b1.paletteMode = 0; b1.priority = 0; b1.hofs = 0; b1.vofs = 0;
  const b2 = cfg(2);
  b2.charBaseIndex = BAG_BG2_CHAR_BASE; b2.mapBaseIndex = BAG_BG2_MAP_BASE; b2.screenSize = 0;
  b2.paletteMode = 0; b2.priority = 2; b2.hofs = 0; b2.vofs = 0;
  // SetBgTilemapBuffer(2, gBagMenu->tilemapBuffer) : le buffer EST
  // gBagMenu.tilemapBuffer (rien à enregistrer) ; ResetAllBgsCoordinates.
  for (let i = 0; i < 4; i++) { const c = cfg(i as 0 | 1 | 2 | 3); c.hofs = 0; c.vofs = 0; }
  _bagScheduleBgCopy(2);
  // SetGpuReg(DISPCNT, DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP) (1:1 :798).
  rt.SetGpuReg(0x00, 0x1000 | 0x40);
  ShowBg(0); ShowBg(1); ShowBg(2);
  rt.SetGpuReg(0x50, 0); // BLDCNT = 0
}

/** 1:1 décomp `LoadBagMenu_Graphics` (item_menu.c:805) — STRUCTURE 5
 *  sous-états ; gated-bool = net-effect 1:1 (Summary prouvé). cases 0-2
 *  (fond BG2 = livrable visuel étape 3) ; case3/4 sprite sac =
 *  AddBagVisualSprite étape 5 (notre modèle sprite alloue à la création —
 *  report HONNÊTE, pas un fake) ; default LoadListMenuSwapLineGfx =
 *  swap-line étape 7. */
function LoadBagMenu_Graphics(): boolean {
  const rt = getRuntime();
  if (!rt || !gBagMenu) return false;
  if (_bagGraphicsReady) return true;
  if (_bagGraphicsLoading) return false;
  _bagGraphicsLoading = true;
  void _bagLoadAssets().then((a) => {
    const r = getRuntime();
    if (!r || !gBagMenu) { _bagGraphicsLoading = false; return; }
    // case 0 : DecompressAndCopyTileDataToVram(2, gBagScreen_Gfx) → BG2
    //          charBase 3 (1 charblock = 0x4000 octets).
    r.gba.vram.set(a.bgTiles, BAG_BG2_CHAR_BASE * 0x4000);
    // case 1 : LZDecompressWram(gBagScreen_GfxTileMap, tilemapBuffer)
    //          (0x800 octets = 1024 u16) + ScheduleBgCopy(2).
    gBagMenu.tilemapBuffer.set(a.bgTilemap.subarray(0, gBagMenu.tilemapBuffer.length));
    _bagScheduleBgCopy(2);
    // case 2 : LoadCompressedPalette(gBagScreen{Female,Male}_Pal,
    //          BG_PLTT_ID(0), 2*PLTT_SIZE_4BPP) — gender 1:1 (:822).
    const pal = (!IsWallysBag() && gameState.gender !== 'MALE') ? a.palFemale : a.palMale;
    LoadPalette(pal, BG_PLTT_ID(0), 2 * 16 * 2); // 2 palettes = 32 u16
    _bagGraphicsReady = true;
    _bagGraphicsLoading = false;
  }).catch((e) => { console.error('[bag] graphics load failed:', e); _bagGraphicsLoading = false; });
  return false;
}

// ─── Helpers étapes 4..9 non encore portés — STUB HONNÊTE LOUD ───────────────
// WORKING-MODE §2 : jamais de fake silencieux. Atteint = crash explicite
// (le sac n'est PAS encore wiré au start-menu → jamais atteint en jeu ;
// la structure de la state machine ci-dessous est, elle, 1:1 complète).
function _nyi(step: number, name: string): never {
  throw new Error(`bag-menu SPINE étape ${step} : ${name} pas encore porté (item_menu.c)`);
}

// ─── ResetBagScrollPositions (item_menu.c:556) ───────────────────────────────
export function ResetBagScrollPositions(): void {
  gBagPosition.pocket = ITEMS_POCKET;
  gBagPosition.cursorPosition.fill(0);
  gBagPosition.scrollPosition.fill(0);
}

// ─── Entrées maillon (item_menu.c:563-615) — thin 1:1 ────────────────────────
/** 1:1 décomp `CB2_BagMenuFromStartMenu` (item_menu.c:563). */
export function CB2_BagMenuFromStartMenu(): void {
  // exitCallback CB2_ReturnToFieldWithOpenMenu : câblé à l'étape 9 (flow OW).
  GoToBagMenu(ITEMMENULOCATION_FIELD, POCKETS_COUNT, _cb2ReturnToFieldWithOpenMenu);
}
/** 1:1 décomp `CB2_BagMenuFromBattle` (item_menu.c:568). Branche pyramide =
 *  MAILLON ultérieur (battle_pyramid_bag.c, fichier séparé). */
export function CB2_BagMenuFromBattle(): void {
  // CurrentBattlePyramidLocation()==NONE : pyramide non portée → branche
  // normale uniquement (report honnête ; pyramide = étape MAILLON).
  GoToBagMenu(ITEMMENULOCATION_BATTLE, POCKETS_COUNT, _cb2SetUpReshowBattleScreenAfterMenu2);
}
/** 1:1 décomp `CB2_ChooseBerry` (item_menu.c:577). */
export function CB2_ChooseBerry(): void {
  GoToBagMenu(ITEMMENULOCATION_BERRY_TREE, BERRIES_POCKET, _cb2ReturnToFieldContinueScript);
}
/** 1:1 décomp `ChooseBerryForMachine` (item_menu.c:583). */
export function ChooseBerryForMachine(exitCallback: MainCallback): void {
  GoToBagMenu(ITEMMENULOCATION_BERRY_BLENDER_CRUSH, BERRIES_POCKET, exitCallback);
}

// exitCallbacks externes — résolus au câblage étape 9 (placeholders honnêtes
// NON appelés tant que le sac n'est pas wiré ; pas des fakes silencieux).
const _cb2ReturnToFieldWithOpenMenu: MainCallback = null;
const _cb2SetUpReshowBattleScreenAfterMenu2: MainCallback = null;
const _cb2ReturnToFieldContinueScript: MainCallback = null;

// ─── GoToBagMenu (item_menu.c:617) — 1:1 strict ──────────────────────────────
export function GoToBagMenu(location: number, pocket: number, exitCallback: MainCallback): void {
  gBagMenu = _allocZeroedBagMenu(); // AllocZeroed ne peut pas échouer ici (≠ C OOM)
  if (location !== ITEMMENULOCATION_LAST)
    gBagPosition.location = location;
  if (exitCallback)
    gBagPosition.exitCallback = exitCallback;
  if (pocket < POCKETS_COUNT)
    gBagPosition.pocket = pocket;
  if (gBagPosition.location === ITEMMENULOCATION_BERRY_TREE ||
      gBagPosition.location === ITEMMENULOCATION_BERRY_BLENDER_CRUSH)
    gBagMenu.pocketSwitchDisabled = 1; // :4 bitfield, TRUE
  gBagMenu.newScreenCallback = null;
  gBagMenu.toSwapPos = NOT_SWAPPING;
  gBagMenu.pocketScrollArrowsTask = TASK_NONE;
  gBagMenu.pocketSwitchArrowsTask = TASK_NONE;
  gBagMenu.spriteIds.fill(SPRITE_NONE);
  gBagMenu.windowIds.fill(WINDOW_NONE);
  const rt = getRuntime();
  if (rt) rt.SetMainCallback2(CB2_Bag);
}

// ─── CB2_BagMenuRun / VBlankCB_BagMenuRun (item_menu.c:646/655) ──────────────
// 1:1 net-effect : RunTasks/AnimateSprites/BuildOamBuffer/DoScheduledBg…/
// UpdatePaletteFade (et LoadOam/ProcessSpriteCopyRequests/TransferPlttBuffer)
// = auto-tickés par notre runtime (modèle prouvé Summary `MainCB2_SummaryRun`).
export function CB2_BagMenuRun(): void { /* runtime auto-tick */ }
export function VBlankCB_BagMenuRun(): void { /* transferts auto */ }

// ─── CB2_Bag (item_menu.c:672) + SetupBagMenu (item_menu.c:678) ──────────────
// décomp `CB2_Bag` = `while(!waitLink && !SetupBagMenu() && !linkActive){}`.
// Adaptation 1:1 prouvée (Summary) : le runtime appelle CB2_Bag chaque
// frame, SetupBagMenu avance d'UN état. Net-effect identique (tout sous
// fade noir jusqu'au case 20). Lien : non modélisé → pas de wait link.
export function CB2_Bag(): void {
  SetupBagMenu();
}

/** 1:1 décomp `SetupBagMenu` (item_menu.c:678) — STRUCTURE state machine
 *  0..20 strictement 1:1 ; leaf-helpers étapes 3..9 = `_nyi` (loud). */
function SetupBagMenu(): boolean {
  const rt = getRuntime();
  if (!rt) return false;
  switch (rt.gMain.state) {
    case 0:
      // SetVBlankHBlankCallbacksToNull + ClearScheduledBgCopiesToVram.
      rt.SetVBlankCallback(null);
      rt.gMain.state++; break;
    case 1:
      ScanlineEffect_Stop();
      rt.gMain.state++; break;
    case 2:
      FreeAllSpritePalettes();
      rt.gMain.state++; break;
    case 3:
      ResetPaletteFade();
      rt.gPaletteFade.bufferTransferDisabled = true;
      rt.gMain.state++; break;
    case 4:
      ResetSpriteData();
      rt.gMain.state++; break;
    case 5:
      rt.gMain.state++; break;
    case 6:
      // if (!MenuHelpers_IsLinkActive()) ResetTasks() — lien non modélisé.
      ResetTasks();
      rt.gMain.state++; break;
    case 7:
      BagMenu_InitBGs();
      gBagMenu!.graphicsLoadState = 0;
      rt.gMain.state++; break;
    case 8:
      if (!LoadBagMenu_Graphics())
        break;
      rt.gMain.state++; break;
    case 9:
      LoadBagMenuTextWindows();
      rt.gMain.state++; break;
    case 10:
      UpdatePocketItemLists();
      InitPocketListPositions();
      InitPocketScrollPositions();
      rt.gMain.state++; break;
    case 11:
      AllocateBagItemListBuffers();
      rt.gMain.state++; break;
    case 12:
      LoadBagItemListBuffers(gBagPosition.pocket);
      rt.gMain.state++; break;
    case 13:
      PrintPocketNames(gBagPosition.pocket);
      CopyPocketNameToWindow(0);
      DrawPocketIndicatorSquare(gBagPosition.pocket, true);
      rt.gMain.state++; break;
    case 14: {
      const taskId = CreateBagInputHandlerTask(gBagPosition.location);
      BagSetListTaskId(taskId, ListMenuInitForBag(
        gBagPosition.scrollPosition[gBagPosition.pocket],
        gBagPosition.cursorPosition[gBagPosition.pocket]));
      rt.gMain.state++; break;
    }
    case 15:
      AddBagVisualSprite(gBagPosition.pocket);
      rt.gMain.state++; break;
    case 16:
      CreateItemMenuSwapLine();
      rt.gMain.state++; break;
    case 17:
      CreatePocketScrollArrowPair();
      CreatePocketSwitchArrowPair();
      rt.gMain.state++; break;
    case 18:
      PrepareTMHMMoveWindow();
      rt.gMain.state++; break;
    case 19:
      BlendPalettesBag();
      rt.gMain.state++; break;
    case 20:
      BeginNormalPaletteFadeBag();
      rt.gPaletteFade.bufferTransferDisabled = false;
      rt.gMain.state++; break;
    default:
      rt.SetVBlankCallback(VBlankCB_BagMenuRun);
      rt.SetMainCallback2(CB2_BagMenuRun);
      return true;
  }
  return false;
}

// ─── Leaf-helpers SetupBagMenu — portés étapes 4..9 (stubs LOUD honnêtes) ────
// (BagMenu_InitBGs + LoadBagMenu_Graphics = portés étape 3 ; ListMenuLoad
//  StdPalAt = porté 1:1 dans gba-menu-system.ts, importé en tête — chaînon
//  MAILLON résolu : menu_info{1,2,3}.pal copiés 1:1 + préchargés assetCache.)

/** 1:1 décomp `LoadBagMenuTextWindows` (item_menu.c:2457). InitWindows
 *  (sDefaultBagWindows) + DeactivateAllTextPrinters + palettes border(14)/
 *  msgbox(13)/listStd(12)/stdMenu(15) + FillWindowPixelBuffer(PIXEL_FILL
 *  (0))+PutWindowTilemap pour WIN_ITEM_LIST..WIN_POCKET_NAME (AUCUN
 *  DrawStdFrame — feedback-bag-no-frames) + ScheduleBgCopy 0/1. */
function LoadBagMenuTextWindows(): void {
  // 1:1 :2461 InitWindows(sDefaultBagWindows) — retourne les ids (≠ AddWindow
  // ad-hoc, feedback-bag-refactor landmine #1 : pas de leak gWindows OW).
  _bagWinIds = InitWindows(sDefaultBagWindows);
  DeactivateAllTextPrinters();                              // :2462
  LoadUserWindowBorderGfx(0, 1, BG_PLTT_ID(14));            // :2463
  LoadMessageBoxGfx(0, 10, BG_PLTT_ID(13));                 // :2464
  ListMenuLoadStdPalAt(BG_PLTT_ID(12), 1);                  // :2465 (maillon stub)
  // :2466 LoadPalette(&gStandardMenuPalette, BG_PLTT_ID(15), PLTT_SIZE_4BPP)
  // — assets prêts en case 8 (gate _bagGraphicsReady), lecture sync 1:1.
  if (_bagAssets) LoadPalette(_bagAssets.stdMenuPal, BG_PLTT_ID(15), PLTT_SIZE_4BPP);
  // :2467 for (i=0; i<=WIN_POCKET_NAME; i++) — transparent, SANS cadre.
  for (let i = WIN_ITEM_LIST; i <= WIN_POCKET_NAME; i++) {
    const wid = _bagWinIds[i];
    FillWindowPixelBuffer(wid, PIXEL_FILL(0));
    PutWindowTilemap(wid);
  }
  ScheduleBgCopyTilemapToVram(0);                            // :2472
  ScheduleBgCopyTilemapToVram(1);                            // :2473
}
// 1:1 décomp `#define MAX_ITEMS_SHOWN 8` (item_menu.c:68).
const MAX_ITEMS_SHOWN = 8;

// 1:1 décomp `#define FIRST_BERRY_INDEX ITEM_CHERI_BERRY`
// (include/constants/items.h ; items-data n'expose que _EXPR → dérivé 1:1).
const FIRST_BERRY_INDEX = ITEM_CHERI_BERRY;

// 1:1 décomp enum COLORID (item_menu.c:379-385). POCKET_NAME(1)/UNUSED(3)/
// TMHM_INFO(4) = positions du sFontColorTable (réintroduits nommés à 5f
// PrintPocketNames / étape TMHM) ; ici seuls NORMAL/GRAY_CURSOR/NONE servis.
const COLORID_NORMAL = 0;
const COLORID_GRAY_CURSOR = 2;
const COLORID_NONE = 0xFF;

// 1:1 décomp `sFontColorTable[][3]` (item_menu.c:387-394) {bg,text,shadow}.
// TEXT_COLOR_* importés decomp-data (1:1 include/constants/characters.h:234+).
const sFontColorTable: readonly (readonly [number, number, number])[] = [
  [TEXT_COLOR_TRANSPARENT, TEXT_COLOR_WHITE,      TEXT_COLOR_LIGHT_GRAY], // NORMAL
  [TEXT_COLOR_TRANSPARENT, TEXT_COLOR_WHITE,      TEXT_COLOR_RED],        // POCKET_NAME
  [TEXT_COLOR_TRANSPARENT, TEXT_COLOR_LIGHT_GRAY, TEXT_COLOR_GREEN],      // GRAY_CURSOR
  [TEXT_COLOR_DARK_GRAY,   TEXT_COLOR_WHITE,      TEXT_COLOR_LIGHT_GRAY], // UNUSED
  [TEXT_COLOR_TRANSPARENT, TEXT_DYNAMIC_COLOR_5,  TEXT_DYNAMIC_COLOR_1],  // TMHM_INFO
];

// 1:1 décomp strings.c:252-256 (FR) + table gBagMenu_ReturnToStrings
// (strings.c:258-272) indexée par ITEMMENULOCATION_* + gText_ReturnToVar1
// (strings.c:282) — branche CANCEL de PrintItemDescription.
const gText_TheField = 'au jeu';
const gText_TheBattle = 'au combat';
const gText_ThePokemonList = 'à la LISTE POKéMON';
const gText_TheShop = 'au magasin';
const gText_ThePC = 'au PC';
const gText_ReturnToVar1 = 'Retourner\n{STR_VAR_1}.';
const gBagMenu_ReturnToStrings: Record<number, string> = {
  [ITEMMENULOCATION_FIELD]: gText_TheField,
  [ITEMMENULOCATION_BATTLE]: gText_TheBattle,
  [ITEMMENULOCATION_PARTY]: gText_ThePokemonList,
  [ITEMMENULOCATION_SHOP]: gText_TheShop,
  [ITEMMENULOCATION_BERRY_TREE]: gText_TheField,
  [ITEMMENULOCATION_BERRY_BLENDER_CRUSH]: gText_TheField,
  [ITEMMENULOCATION_ITEMPC]: gText_ThePC,
  [ITEMMENULOCATION_FAVOR_LADY]: gText_TheField,
  [ITEMMENULOCATION_QUIZ_LADY]: gText_TheField,
  [ITEMMENULOCATION_APPRENTICE]: gText_TheField,
  [ITEMMENULOCATION_WALLY]: gText_TheBattle,
  [ITEMMENULOCATION_PCBOX]: gText_ThePC,
};

// 1:1 décomp strings FR `src/strings.c` (valeurs byte-identiques) :
//  :222 gText_CloseBag / :299 gText_NumberItem_HM / :298 gText_NumberItem_TMBerry
//  :219 gText_xVar1. Les codes de contrôle {NO}/{CLEAR n}/{CLEAR_TO n} ne
//  sont pas (encore) interprétés par notre StringExpandPlaceholders/printer
//  (limitation SYSTÉMIQUE du modèle texte projet, commune à tous les menus
//  — PAS un fake local du sac ; honnête WORKING-MODE §2). Le nom est
//  construit 1:1 ; le rendu pixel fin = concern BagMenu_Print (porté plus tard).
const gText_CloseBag = 'FERMER LE SAC';
const gText_NumberItem_HM = '{CLEAR_TO 17}{STR_VAR_1}{CLEAR 5}{STR_VAR_2}';
const gText_NumberItem_TMBerry = '{NO}{STR_VAR_1}{CLEAR 7}{STR_VAR_2}';
const gText_xVar1 = '×{STR_VAR_1}';

// Accès 1:1-sém aux buffers texte gStringVarN : la décomp écrit
// `StringCopy(gStringVar2,…)` / `ConvertIntToDecimalStringN(gStringVar1,…)`
// puis `StringExpandPlaceholders(dest, tmpl)` (qui substitue {STR_VAR_1/2}
// depuis les gStringVarN module). Nos helpers string retournent la valeur
// (dest opaque, modèle projet) → on route l'écriture via le proxy globalThis
// (= set→let module que StringExpandPlaceholders lit en closure, cf.
// gba-text-system.ts:181-190). Net-effect identique à la décomp.
const _gsv = globalThis as unknown as Record<string, string>;

// 1:1 décomp `struct ListBuffer1{ ListMenuItem subBuffers[] }` /
// `struct ListBuffer2{ u8 name[][] }` (item_menu.c:106/110) — alloués
// par AllocateBagItemListBuffers, remplis par LoadBagItemListBuffers (5b).
interface ListMenuItemRef { name: string; id: number; }
let _sListBuffer1: { subBuffers: ListMenuItemRef[] } | null = null;
let _sListBuffer2: { name: string[] } | null = null;

/** 1:1 décomp `UpdatePocketItemList` (item_menu.c:1105) : Sort/Compact la
 *  poche puis compte les slots non-vides → numItemStacks (+1 CLOSE BAG si
 *  !hideCloseBagText) ; numShownItems = min(numItemStacks, MAX). */
function UpdatePocketItemList(pocketId: number): void {
  if (!gBagMenu) return;
  switch (pocketId) {
    case TMHM_POCKET:
    case BERRIES_POCKET:
      SortBerriesOrTMHMs(pocketId);
      break;
    default:
      CompactItemsInBagPocket(pocketId);
      break;
  }
  const slots = getBagPocketSlots(pocketId);
  const capacity = getBagPocketCapacity(pocketId);
  gBagMenu.numItemStacks[pocketId] = 0;
  for (let i = 0; i < capacity && slotItemId(slots[i]) !== 0; i++)
    gBagMenu.numItemStacks[pocketId]++;
  if (!gBagMenu.hideCloseBagText)
    gBagMenu.numItemStacks[pocketId]++;
  if (gBagMenu.numItemStacks[pocketId] > MAX_ITEMS_SHOWN)
    gBagMenu.numShownItems[pocketId] = MAX_ITEMS_SHOWN;
  else
    gBagMenu.numShownItems[pocketId] = gBagMenu.numItemStacks[pocketId];
}

/** 1:1 décomp `UpdatePocketItemLists` (item_menu.c:1134). */
function UpdatePocketItemLists(): void {
  for (let i = 0; i < POCKETS_COUNT; i++)
    UpdatePocketItemList(i);
}

/** 1:1 décomp `UpdatePocketListPosition` (item_menu.c:1142) : SetCursor
 *  WithinListBounds(&scroll[p], &cursor[p], numShownItems, numItemStacks).
 *  Sémantique pointeur → ListPos copié/réécrit (menu-helpers.ts). */
function UpdatePocketListPosition(pocketId: number): void {
  if (!gBagMenu) return;
  const pos: ListPos = {
    scroll: gBagPosition.scrollPosition[pocketId],
    cursor: gBagPosition.cursorPosition[pocketId],
  };
  SetCursorWithinListBounds(pos, gBagMenu.numShownItems[pocketId], gBagMenu.numItemStacks[pocketId]);
  gBagPosition.scrollPosition[pocketId] = pos.scroll;
  gBagPosition.cursorPosition[pocketId] = pos.cursor;
}

/** 1:1 décomp `InitPocketListPositions` (item_menu.c:1146). */
function InitPocketListPositions(): void {
  for (let i = 0; i < POCKETS_COUNT; i++)
    UpdatePocketListPosition(i);
}

/** 1:1 décomp `InitPocketScrollPositions` (item_menu.c:1153) : SetCursor
 *  ScrollWithinListBounds(&scroll[i],&cursor[i],numShownItems,numItemStacks,
 *  MAX_ITEMS_SHOWN) sur chaque poche. */
function InitPocketScrollPositions(): void {
  if (!gBagMenu) return;
  for (let i = 0; i < POCKETS_COUNT; i++) {
    const pos: ListPos = {
      scroll: gBagPosition.scrollPosition[i],
      cursor: gBagPosition.cursorPosition[i],
    };
    SetCursorScrollWithinListBounds(pos, gBagMenu.numShownItems[i], gBagMenu.numItemStacks[i], MAX_ITEMS_SHOWN);
    gBagPosition.scrollPosition[i] = pos.scroll;
    gBagPosition.cursorPosition[i] = pos.cursor;
  }
}

/** 1:1 décomp `AllocateBagItemListBuffers` (item_menu.c:857) : Alloc
 *  sListBuffer1/2 (les remplir = LoadBagItemListBuffers, étape 5b). */
function AllocateBagItemListBuffers(): void {
  _sListBuffer1 = { subBuffers: [] };
  _sListBuffer2 = { name: [] };
}
// ─── Leaf-helpers sprite/desc/render des callbacks — DÉFÉRÉS LOUD (5b) ───────
// WORKING-MODE §2 : déferral honnête documenté > demi-structure foam. NON
// atteints à 5b (sac pas wiré ; sItemListMenu n'est invoqué qu'au
// ListMenuInit étape 5e). Portés en incrément borné AVANT que le sac soit
// réellement ouvrable. Chaque corps décomp est cité pour un port exact.
// ── DÉFÉRÉS LOUD : sous-système sprite item_menu_icons.c (A/B-CRITIQUE =
//    zone reverted-foam cddfcfee ; WORKING-MODE §5 : visuel attend le user
//    présent) + blits gfx (assets non extraits) + data-gap items.json. ──────
/** DÉFÉRÉ — `ShakeBagSprite` (item_menu_icons.c:477) : sprite sac
 *  StartSpriteAffineAnim(ANIM_BAG_SHAKE). Sous-système sprite A/B-critique. */
function ShakeBagSprite(): void { _nyi(5, 'ShakeBagSprite — item_menu_icons.c:477 (sprite sac, A/B-critique user-présent)'); }
/** DÉFÉRÉ — `AddBagItemIconSprite` (item_menu_icons.c:535) : AddItemIconSprite
 *  (item_icon.c, non porté) + tag alloc. Sous-système sprite A/B-critique. */
function AddBagItemIconSprite(_itemId: number, _slot: number): void { _nyi(5, 'AddBagItemIconSprite — item_menu_icons.c:535 (icône objet, item_icon.c non porté, A/B-critique)'); }
/** DÉFÉRÉ — `RemoveBagItemIconSprite` (item_menu_icons.c:555). A/B-critique. */
function RemoveBagItemIconSprite(_slot: number): void { _nyi(5, 'RemoveBagItemIconSprite — item_menu_icons.c:555 (A/B-critique)'); }
/** DÉFÉRÉ — `BlitBitmapToWindow(windowId, gBagMenuHMIcon_Gfx, 8, y-1, 16, 16)`
 *  (item_menu.c:970-971) : asset gfx gBagMenuHMIcon_Gfx non extrait (chaînon
 *  extraction graphics/ ultérieur). */
function _bagBlitHMIcon(_windowId: number, _y: number): void { _nyi(5, 'BlitBitmapToWindow gBagMenuHMIcon_Gfx — item_menu.c:971 (asset gfx non extrait)'); }
/** DÉFÉRÉ — `if (gSaveBlock1Ptr->registeredItem != ITEM_NONE &&
 *  == itemId) BlitBitmapToWindow(windowId, sRegisteredSelect_Gfx, 96, y-1,
 *  24, 16)` (item_menu.c:990-994) : asset sRegisteredSelect_Gfx non extrait
 *  + registeredItem save (chaînon ultérieur). */
function _bagDrawRegisteredIcon(_windowId: number, _y: number, _itemId: number): void {
  _nyi(5, 'sRegisteredSelect_Gfx blit — item_menu.c:993 (asset gfx non extrait + save registeredItem)');
}
/** DÉFÉRÉ — `GetItemImportance` (item.c:910) `gItems[SanitizeItemId
 *  (itemId)].importance`. **DATA-GAP HONNÊTE** : notre items.json (ItemDef)
 *  n'expose PAS le champ `importance` → port 1:1 impossible sans
 *  ré-extraction items data (chaînon dédié). Pas de valeur devinée
 *  (WORKING-MODE §2 : report honnête > fake). */
function GetItemImportance(_itemId: number): number { return _nyi(5, 'GetItemImportance — item.c:910 (items.json sans champ importance, ré-extraction requise)'); }

// ── 5c : leaves TEXTE/DATA — 1:1 sur infra texte A/B-prouvée (≠ foam) ──────
/** `WIN_*` décomp = id gWindows séquentiel ; chez nous = `_bagWinIds[WIN_*]`
 *  (1:1-sém ; cf. LoadBagMenuTextWindows + feedback-bag-refactor : adresser
 *  via les vrais ids InitWindows, pas l'enum brut). */
function _win(w: number): number { return _bagWinIds[w]; }

/** 1:1 décomp `BagMenu_Print` (item_menu.c:2476) :
 *    AddTextPrinterParameterized4(windowId, fontId, left, top, letterSpacing,
 *      lineSpacing, sFontColorTable[colorIndex], speed, str). */
function BagMenu_Print(
  windowId: number, fontId: number, str: string, left: number, top: number,
  letterSpacing: number, lineSpacing: number, speed: number, colorIndex: number,
): void {
  AddTextPrinterParameterized4(
    windowId, fontId, left, top, letterSpacing, lineSpacing,
    sFontColorTable[colorIndex] as unknown as number[], speed, str,
  );
}

/** 1:1 décomp `BagMenu_PrintCursorAtPos` (item_menu.c:1021). */
function BagMenu_PrintCursorAtPos(y: number, colorIndex: number): void {
  if (colorIndex === COLORID_NONE)
    FillWindowPixelRect(_win(WIN_ITEM_LIST), PIXEL_FILL(0), 0, y,
      GetMenuCursorDimensionByFont(FONT_NORMAL, 0), GetMenuCursorDimensionByFont(FONT_NORMAL, 1));
  else
    BagMenu_Print(_win(WIN_ITEM_LIST), FONT_NORMAL, gText_SelectorArrow2, 0, y, 0, 0, 0, colorIndex);
}

/** 1:1 décomp `BagMenu_PrintCursor` (item_menu.c:1016) : BagMenu_PrintCursor
 *  AtPos(ListMenuGetYCoordForPrintingArrowCursor(listTaskId), colorIndex).
 *  ListMenuGetYCoordForPrintingArrowCursor = list-menu.ts (porté 1:1) ;
 *  câblage du listTaskId à l'étape 5e (ici 1:1 structurel). */
function BagMenu_PrintCursor(listTaskId: number, colorIndex: number): void {
  BagMenu_PrintCursorAtPos(ListMenuGetYCoordForPrintingArrowCursor(listTaskId), colorIndex);
}

/** 1:1 décomp `PrintItemDescription` (item_menu.c:998). `GetItemDescription`
 *  (item.c:905, déjà porté decomp-bridge.ts:976) est clé itemKey-string ;
 *  BagGetItemIdByPocketPosition rend l'itemId numérique → pont getItemKeyById
 *  = réalisation 1:1-sém de l'index `gItems[itemId]` (idem CopyItemName). */
function PrintItemDescription(itemIndex: number): void {
  let str: string;
  if (itemIndex !== LIST_CANCEL) {
    str = GetItemDescription(getItemKeyById(BagGetItemIdByPocketPosition(gBagPosition.pocket + 1, itemIndex)));
  } else {
    // Print 'Cancel' description
    _gsv.gStringVar1 = StringCopy('', gBagMenu_ReturnToStrings[gBagPosition.location]);
    str = StringExpandPlaceholders('', gText_ReturnToVar1);
  }
  FillWindowPixelBuffer(_win(WIN_DESCRIPTION), PIXEL_FILL(0));
  BagMenu_Print(_win(WIN_DESCRIPTION), FONT_NORMAL, str, 3, 1, 0, 0, 0, COLORID_NORMAL);
}

/** 1:1 décomp item_menu.c:976-987 (bloc quantité berry/objet) :
 *    ConvertIntToDecimalStringN(gStringVar1, qty, RIGHT_ALIGN, numDigits)
 *    StringExpandPlaceholders(gStringVar4, gText_xVar1)
 *    offset = GetStringRightAlignXOffset(FONT_NARROW, gStringVar4, 119)
 *    BagMenu_Print(windowId, FONT_NARROW, gStringVar4, offset, y, 0,0,
 *      TEXT_SKIP_DRAW, COLORID_NORMAL). STR_CONV_MODE_RIGHT_ALIGN importé. */
function _bagPrintQuantity(windowId: number, itemQuantity: number, y: number, numDigits: number): void {
  _gsv.gStringVar1 = ConvertIntToDecimalStringN('', itemQuantity, STR_CONV_MODE_RIGHT_ALIGN, numDigits);
  const s4 = StringExpandPlaceholders('', gText_xVar1);
  const offset = GetStringRightAlignXOffset(s4, 119);
  BagMenu_Print(windowId, FONT_NARROW, s4, offset, y, 0, 0, TEXT_SKIP_DRAW, COLORID_NORMAL);
}

/** 1:1 décomp `CopyItemName` (item.c:79) : `StringCopy(dst, GetItemName
 *  (itemId))`. `GetItemName` décomp = `gItems[SanitizeItemId(itemId)].name`
 *  (indexé numérique) ; notre table items est clé itemKey-string →
 *  `getItemKeyById` = réalisation 1:1-sém de l'indexation `gItems[itemId]`.
 *  `StringCopy` retourne src (dst opaque, modèle string projet). */
function CopyItemName(itemId: number): string {
  return StringCopy('', GetItemName(getItemKeyById(itemId)));
}

/** 1:1 décomp `GetItemNameFromPocket` (item_menu.c:899). La décomp remplit
 *  `dest` (u8*) via gStringVar1/2 + StringExpandPlaceholders ; notre modèle
 *  string retourne la valeur → on RETOURNE le nom construit (= dest). Les
 *  gStringVarN sont routés via le proxy globalThis (cf. _gsv plus haut). */
function GetItemNameFromPocket(itemId: number): string {
  switch (gBagPosition.pocket) {
    case TMHM_POCKET:
      // StringCopy(gStringVar2, gMoveNames[ItemIdToBattleMoveId(itemId)])
      _gsv.gStringVar2 = StringCopy('', getMoveName(ItemIdToBattleMoveId(itemId)));
      if (itemId >= ITEM_HM01) {
        // Get HM number
        _gsv.gStringVar1 = ConvertIntToDecimalStringN('', itemId - ITEM_HM01 + 1, STR_CONV_MODE_LEADING_ZEROS, 1);
        return StringExpandPlaceholders('', gText_NumberItem_HM);
      } else {
        // Get TM number
        _gsv.gStringVar1 = ConvertIntToDecimalStringN('', itemId - ITEM_TM01 + 1, STR_CONV_MODE_LEADING_ZEROS, 2);
        return StringExpandPlaceholders('', gText_NumberItem_TMBerry);
      }
    case BERRIES_POCKET:
      _gsv.gStringVar1 = ConvertIntToDecimalStringN('', itemId - FIRST_BERRY_INDEX + 1, STR_CONV_MODE_LEADING_ZEROS, 2);
      _gsv.gStringVar2 = CopyItemName(itemId);
      return StringExpandPlaceholders('', gText_NumberItem_TMBerry);
    default:
      return CopyItemName(itemId);
  }
}

/** 1:1 décomp `BagMenu_MoveCursorCallback` (item_menu.c:929) — STRUCTURE
 *  1:1 ; sous-appels sprite/desc = leaf déférés LOUD (cf. bloc ci-dessus). */
function BagMenu_MoveCursorCallback(itemIndex: number, onInit: boolean, _list: ListMenu): void {
  if (onInit !== true) {
    PlaySE(SE_SELECT);
    ShakeBagSprite();
  }
  if (gBagMenu!.toSwapPos === NOT_SWAPPING) {
    RemoveBagItemIconSprite(gBagMenu!.itemIconSlot ^ 1);
    if (itemIndex !== LIST_CANCEL)
      AddBagItemIconSprite(BagGetItemIdByPocketPosition(gBagPosition.pocket + 1, itemIndex), gBagMenu!.itemIconSlot);
    else
      AddBagItemIconSprite(ITEM_LIST_END, gBagMenu!.itemIconSlot);
    gBagMenu!.itemIconSlot ^= 1;
    if (!gBagMenu!.inhibitItemDescriptionPrint)
      PrintItemDescription(itemIndex);
  }
}

/** 1:1 décomp `BagMenu_ItemPrintCallback` (item_menu.c:949) — STRUCTURE
 *  1:1 ; rendus (curseur/HM/quantité/enregistré) = leaf déférés LOUD. */
function BagMenu_ItemPrintCallback(windowId: number, itemIndex: number, y: number): void {
  let itemId: number;
  let itemQuantity: number;
  if (itemIndex !== LIST_CANCEL) {
    if (gBagMenu!.toSwapPos !== NOT_SWAPPING) {
      // Swapping items, draw cursor at original item's location
      if (gBagMenu!.toSwapPos === (itemIndex & 0xFF))
        BagMenu_PrintCursorAtPos(y, COLORID_GRAY_CURSOR);
      else
        BagMenu_PrintCursorAtPos(y, COLORID_NONE);
    }
    itemId = BagGetItemIdByPocketPosition(gBagPosition.pocket + 1, itemIndex);
    itemQuantity = BagGetQuantityByPocketPosition(gBagPosition.pocket + 1, itemIndex);
    // Draw HM icon
    if (itemId >= ITEM_HM01 && itemId <= ITEM_HM08)
      _bagBlitHMIcon(windowId, y);
    if (gBagPosition.pocket === BERRIES_POCKET) {
      // Print berry quantity
      _bagPrintQuantity(windowId, itemQuantity, y, BERRY_CAPACITY_DIGITS);
    } else if (gBagPosition.pocket !== KEYITEMS_POCKET && GetItemImportance(itemId) === 0) {
      // Print item quantity
      _bagPrintQuantity(windowId, itemQuantity, y, BAG_ITEM_CAPACITY_DIGITS);
    } else {
      // Print registered icon
      _bagDrawRegisteredIcon(windowId, y, itemId);
    }
  }
}

/** 1:1 décomp `sItemListMenu` (item_menu.c:244) — template ListMenu du sac
 *  (items=NULL ; callbacks ci-dessus ; windowId=WIN_ITEM_LIST 1:1 littéral
 *  = index gWindows séquentiel, cf. _bagWinIds). Copié dans
 *  gMultiuseListMenuTemplate par LoadBagItemListBuffers. */
const sItemListMenu: ListMenuTemplate = {
  items: [],
  moveCursorFunc: BagMenu_MoveCursorCallback,
  itemPrintFunc: BagMenu_ItemPrintCallback,
  totalItems: 0,
  maxShowed: 0,
  windowId: WIN_ITEM_LIST,
  header_X: 0,
  item_X: 8,
  cursor_X: 0,
  upText_Y: 1,
  cursorPal: 1,
  fillValue: 0,
  cursorShadowPal: 3,
  lettersSpacing: 0,
  itemVerticalPadding: 0,
  scrollMultiple: LIST_NO_MULTIPLE_SCROLL,
  fontId: FONT_NARROW,
  cursorKind: CURSOR_BLACK_ARROW,
};

/** 1:1 décomp `LoadBagItemListBuffers` (item_menu.c:863). Remplit
 *  sListBuffer2->name[] (via GetItemNameFromPocket) + sListBuffer1->
 *  subBuffers[] (ListMenuItem{name,id}) ; +1 entrée "FERMER LE SAC"
 *  (LIST_CANCEL) si !hideCloseBagText ; bind gMultiuseListMenuTemplate
 *  (= sItemListMenu + totalItems/items/maxShowed). */
function LoadBagItemListBuffers(pocketId: number): void {
  if (!gBagMenu || !_sListBuffer1 || !_sListBuffer2) return;
  let i: number;
  const slots = getBagPocketSlots(pocketId);          // &gBagPockets[pocketId]
  const subBuffer = _sListBuffer1.subBuffers;          // sListBuffer1->subBuffers
  if (!gBagMenu.hideCloseBagText) {
    for (i = 0; i < gBagMenu.numItemStacks[pocketId] - 1; i++) {
      _sListBuffer2.name[i] = GetItemNameFromPocket(slotItemId(slots[i]));
      subBuffer[i] = { name: _sListBuffer2.name[i], id: i };
    }
    _sListBuffer2.name[i] = StringCopy('', gText_CloseBag);
    subBuffer[i] = { name: _sListBuffer2.name[i], id: LIST_CANCEL };
  } else {
    for (i = 0; i < gBagMenu.numItemStacks[pocketId]; i++) {
      _sListBuffer2.name[i] = GetItemNameFromPocket(slotItemId(slots[i]));
      subBuffer[i] = { name: _sListBuffer2.name[i], id: i };
    }
  }
  // gMultiuseListMenuTemplate = sItemListMenu (struct copy) puis surcharges.
  Object.assign(gMultiuseListMenuTemplate, sItemListMenu);
  gMultiuseListMenuTemplate.totalItems = gBagMenu.numItemStacks[pocketId];
  gMultiuseListMenuTemplate.items = subBuffer;
  gMultiuseListMenuTemplate.maxShowed = gBagMenu.numShownItems[pocketId];
}
function PrintPocketNames(_pocket: number): void { _nyi(5, 'PrintPocketNames'); }
function CopyPocketNameToWindow(_a: number): void { _nyi(5, 'CopyPocketNameToWindow'); }
function DrawPocketIndicatorSquare(_p: number, _on: boolean): void { _nyi(5, 'DrawPocketIndicatorSquare'); }
function CreateBagInputHandlerTask(_location: number): number { return _nyi(6, 'CreateBagInputHandlerTask'); }
function ListMenuInitForBag(_scroll: number, _cursor: number): number { return _nyi(6, 'ListMenuInit(bag)'); }
function BagSetListTaskId(_taskId: number, _listTaskId: number): void { _nyi(6, 'tListTaskId set'); }
function AddBagVisualSprite(_pocket: number): void { _nyi(5, 'AddBagVisualSprite'); }
function CreateItemMenuSwapLine(): void { _nyi(7, 'CreateItemMenuSwapLine'); }
function CreatePocketScrollArrowPair(): void { _nyi(5, 'CreatePocketScrollArrowPair'); }
function CreatePocketSwitchArrowPair(): void { _nyi(5, 'CreatePocketSwitchArrowPair'); }
function PrepareTMHMMoveWindow(): void { _nyi(7, 'PrepareTMHMMoveWindow'); }
function BlendPalettesBag(): void { _nyi(9, 'BlendPalettes(PALETTES_ALL,16,0)'); }
function BeginNormalPaletteFadeBag(): void { _nyi(9, 'BeginNormalPaletteFade fade-in'); }

/** Sondes d'introspection déterministe (vérif étape 2, pas du gameplay). */
export function __bagMenuDebugState() {
  return {
    gBagMenu: gBagMenu ? {
      spriteIds: gBagMenu.spriteIds.length,
      windowIds: gBagMenu.windowIds.length,
      tilemap: gBagMenu.tilemapBuffer.length,
      pocketSwitchDisabled: gBagMenu.pocketSwitchDisabled,
    } : null,
    gBagPosition: { ...gBagPosition, cursorPosition: [...gBagPosition.cursorPosition] },
    consts: { ITEMMENUSPRITE_COUNT, ITEMWIN_COUNT, POCKETS_COUNT, NOT_SWAPPING },
  };
}
