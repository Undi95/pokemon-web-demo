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
} from '../../../harness/runtime/decomp-globals';
import {PLTT_SIZE_4BPP} from "../../../harness/runtime/decomp-bridge";
import { ListMenuLoadStdPalAt } from '../../menu';
import {
  getBagPocketSlots, getBagPocketCapacity, slotItemId, MoveItemSlotInList,
  CompactItemsInBagPocket, SortBerriesOrTMHMs,
  BagGetItemIdByPocketPosition, BagGetQuantityByPocketPosition,
} from './bag-pockets';
import {
  SetCursorWithinListBounds, SetCursorScrollWithinListBounds, MenuHelpers_IsLinkActive, type ListPos,
} from '../../menu_helpers';
import {
  gMultiuseListMenuTemplate, LIST_CANCEL, LIST_NO_MULTIPLE_SCROLL,
  CURSOR_BLACK_ARROW, CURSOR_INVISIBLE, LISTFIELD_CURSORKIND,
  gText_SelectorArrow2, ListMenuGetYCoordForPrintingArrowCursor,
  ListMenuSetTemplateField,
  type ListMenuTemplate, type ListMenu,
} from '../../list_menu';
import { getItemKeyById, loadConstantsTable, isConstantsLoaded } from '../../../harness/runtime/data-tables';
import { ItemIdToBattleMoveId } from '../pokemon/tmhm-moves';
import { getMoveName, getMove } from '../data/game-data';
import { GetItemName, GetItemDescription, GetItemImportance } from '../../item';
import { STR_CONV_MODE_LEADING_ZEROS, STR_CONV_MODE_RIGHT_ALIGN, ConvertIntToDecimalStringN, gStringVar1 } from '../../../include/string_util';
// Migration TEXTE byte : gStringVarN buffers byte via setStringVar (encode source),
// StringExpandPlaceholders byte écrit gStringVar4, encodeOwText = préproc.
import { setStringVar, encodeOwText } from '../../../include/text';
import { gStringVar4 } from '../../../include/string_util';
import { getString } from '../ui/gba-strings';
import {
  ShowBg, InitWindows, FillWindowPixelBuffer, PutWindowTilemap,
  ResetVramOamAndBgCntRegs, ResetAllBgsCoordinates,
  ScheduleBgCopyTilemapToVram, FillWindowPixelRect,
  FillBgTilemapBufferRect_Palette0, CopyWindowToVram, BlitBitmapToWindow,
  AddWindow, RemoveWindow, GetWindowPixelBuffer, MarkWindowDirty,
  ClearWindowTilemap, BlitBitmapRectToWindow,
  type WindowTemplate,
} from '../../window';
import { LoadUserWindowBorderGfx, LoadMessageBoxGfx } from '../../text_window';
import { DeactivateAllTextPrinters, FONT_NARROW, FONT_NORMAL, GetMenuCursorDimensionByFont, GetStringRightAlignXOffset, TEXT_SKIP_DRAW } from '../../text';
import { AddTextPrinterParameterized4 } from '../../menu';
import { StringExpandPlaceholders } from '../../../include/string_util';
import {
  TEXT_COLOR_TRANSPARENT, TEXT_COLOR_WHITE, TEXT_COLOR_DARK_GRAY,
  TEXT_COLOR_LIGHT_GRAY, TEXT_COLOR_RED, TEXT_COLOR_GREEN,
  TEXT_DYNAMIC_COLOR_1, TEXT_DYNAMIC_COLOR_5,
} from '../../../include/constants/characters';
import { BG_PLTT_ID } from '../../../harness/runtime/decomp-runtime';
import { loadTileBin, loadTilemapBin, loadGbaPal } from '../../../harness/gba/png-loader';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from '../save/save-block-state';
import { MALE } from '../../../harness/runtime/decomp-globals';
import {
  ENUM_ITEMMENULOCATION_0, ENUM_ITEMWIN_1, ENUM_ITEMMENUSPRITE_2,
  ITEMMENU_SWAP_LINE_LENGTH,
} from '../../../include/item_menu';
import {
  ITEMS_POCKET, BALLS_POCKET, TMHM_POCKET, BERRIES_POCKET,
  KEYITEMS_POCKET, POCKETS_COUNT,
} from '../../../include/constants/item';
import { BG_SCREEN_SIZE } from '../../../include/gba/defines';
import {
  ITEM_LIST_END, ITEM_HM01, ITEM_HM08, ITEM_TM01,
  ITEM_CHERI_BERRY, BAG_ITEM_CAPACITY_DIGITS, BERRY_CAPACITY_DIGITS,
} from '../../../include/constants/items';
import { SE_SELECT } from '../../../include/constants/songs';
// ─── Phase 1 (sac ouvrable) — input task + fade + retour terrain 1:1 ─────────
import { JOY_NEW, BlendPalettes, PALETTES_ALL, LoadCompressedSpriteSheet, LoadSpritePalette } from '../../../harness/runtime/decomp-globals';

import { SetTaskFuncWithFollowupFunc, SwitchTaskToFollowupFunc } from '../../task';
import { BeginNormalPaletteFade } from '../../palette';
import { ResetSpriteData } from '../../sprite';
import {
  ListMenuInit, ListMenu_ProcessInput, ListMenuGetScrollAndRow,
  DestroyListMenuTask, LIST_NOTHING_CHOSEN, DPAD_LEFT, DPAD_RIGHT,
} from '../../list_menu';
import { GetStringCenterAlignXOffset } from '../../text';
import {
  MENU_L_PRESSED, MENU_R_PRESSED,
} from '../decomp-data/include/menu_helpers-data';
import {
  MENU_CURSOR_DELTA_LEFT, MENU_CURSOR_DELTA_RIGHT,
} from '../decomp-data/include/menu-data';
import { SELECT_BUTTON, L_BUTTON, R_BUTTON, A_BUTTON } from '../../../include/gba/io_reg';
import type { DecompTask } from '../../../harness/runtime/decomp-runtime';
import { CB2_ReturnToFieldWithOpenMenu_Manual, CB2_ReturnToFieldContinueScript_Manual } from '../ui/option-menu-return';
// Context menu (A_BUTTON sur item) — ouvre UTILIS./DONNER/JETER/RETOUR.
import { Task_ItemContext_Normal, Task_ItemContext_Sell } from './bag-menu-ctx';
import { gSpecialVar } from '../script/script-vars';
import { RemoveBagItem } from './bag';
// Phase 2 (sprites) — icône objet 1:1 (item_menu_icons.c → item_icon.c).
// Arête bag-menu ↔ bag-menu-icons : usage en corps de fn uniquement
// (live binding ESM, pas de TDZ — cf. feedback-map-loader-var-tdz).
import {
  AddBagItemIconSprite, RemoveBagItemIconSprite, RemoveBagSprite,
  AddBagVisualSprite, SetBagVisualPocketId, ShakeBagSprite,
  AddSwitchPocketRotatingBallSprite,
  TAG_BAG_GFX,
} from '../../item_menu_icons';
// Swap line — barre grise ▶ rouge affichée pendant SELECT swap (1:1 menu_helpers.c).
import {
  preloadSwapLineAssets, LoadListMenuSwapLineGfx,
  CreateSwapLineSprites, SetSwapLineSpritesInvisibility, UpdateSwapLineSpritesPos,
  SWAP_LINE_HAS_MARGIN,
} from '../field/swap-line';
import { preloadItemIconAssets } from '../../item_icon';
import {
  AddScrollIndicatorArrowPair, AddScrollIndicatorArrowPairParameterized,
  RemoveScrollIndicatorArrowPair, SCROLL_ARROW_UP, SCROLL_ARROW_LEFT,
  SCROLL_ARROW_RIGHT, type ScrollArrowsTemplate,
} from '../../list_menu';
// 1:1 décomp item_menu.c:54-55 — #define TAG_POCKET_SCROLL_ARROW 110 /
// TAG_BAG_SCROLL_ARROW 111 (tags des flèches d'indicateur de défilement).
const TAG_POCKET_SCROLL_ARROW = 110;
const TAG_BAG_SCROLL_ARROW = 111;

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
export const ITEMMENUSPRITE_BALL = ENUM_ITEMMENUSPRITE_2.ITEMMENUSPRITE_BALL;
export const ITEMMENUSPRITE_ITEM = ENUM_ITEMMENUSPRITE_2.ITEMMENUSPRITE_ITEM;
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
  /** Décomp : `u8 pocketNameBuffer[32][32]` (1024B, 4bpp tile-arranged d'une
   *  fenêtre temp 16×2 tiles utilisée par PrintPocketNames :2421).
   *  TS : layout pixelBuffer linéaire 1B/pixel (8bpp idx) = 128 px × 16 px
   *  = 2048B (sémantique 1:1 = mêmes pixels, différent encoding). Le slide
   *  CopyPocketNameToWindow opère par bulk-copy de slices 64×16 (cf. :2442). */
  pocketNameBuffer: Uint8Array;      // 128 px × 16 px (= 16×2 tiles)
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
    pocketNameBuffer: new Uint8Array(128 * 16),
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
  hmIcon: Uint8Array;        // gBagMenuHMIcon_Gfx (bag/hm.4bpp.bin) — graphique 16×16 4bpp "CS" pour les HM/CS de la liste sac (BlitBitmapToWindow, item_menu.c:971)
  bagSpriteMale: Uint8Array;     // gBagMaleTiles   (bag_male.4bpp.bin, 0x3000 = 6 frames 64×64 4bpp)
  bagSpriteFemale: Uint8Array;   // gBagFemaleTiles (bag_female.4bpp.bin)
  bagSpritePal: Uint16Array;     // gBagPalette     (bag.pal — palette OBJ partagée gender-neutral, item_menu_icons.c:142)
  menuInfoGfx: Uint8Array;       // gMenuInfoElements_Gfx (interface/menu_info.png 128×128 4bpp = 8 KB) — labels + type icons
  menuInfoPal: Uint16Array;      // palette dédiée 16 colors pour menu_info (paletteNum=12 dans les WIN_TMHM_INFO* templates)
}
let _bagAssets: BagAssets | null = null;
let _bagAssetsLoading: Promise<BagAssets> | null = null;
let _bagGraphicsReady = false;
let _bagGraphicsLoading = false;

/** Le sac peut être ouvert via un chemin scene (TestOverworld / CB2-swap)
 *  qui n'a PAS exécuté `OverworldScene.afterMapLoad` → la table `constants`
 *  (enum→id, dont dépend la couche (b) bag-pockets `slotItemId`) n'est pas
 *  peuplée → `getItemId`=0 → liste vide. Le sac charge sa propre dép,
 *  IDEMPOTENT (skip si déjà chargée). Source canonique = même asset que
 *  OverworldScene (`/decomp/em/constants.json`). */
async function _bagEnsureConstantsLoaded(): Promise<void> {
  if (isConstantsLoaded()) return;
  try {
    const res = await fetch('/decomp/em/constants.json');
    if (res.ok) loadConstantsTable(await res.json());
  } catch (e) {
    console.error('[bag] constants.json load failed:', e);
  }
}

async function _bagLoadAssets(): Promise<BagAssets> {
  if (_bagAssets) return _bagAssets;
  if (_bagAssetsLoading) return _bagAssetsLoading;
  _bagAssetsLoading = (async () => {
    // Phase 2 : preloadItemIconAssets — buffers icône préchargés pour que
    // AddItemIconSprite (nav sync 1:1) lise en mémoire (sinon icône absente).
    // preloadSwapLineAssets : barre grise ▶ rouge affichée pendant SELECT swap.
    await Promise.all([_bagEnsureConstantsLoaded(), preloadItemIconAssets(), preloadSwapLineAssets()]);
    const [bgTiles, bgTilemap, palMale, palFemale, stdMenuPal, mi1, mi2, mi3,
           scrollGfx, redPal, hmIcon,
           bagSpriteMale, bagSpriteFemale, bagSpritePal,
           rotatingBallGfx, rotatingBallPal] = await Promise.all([
      loadTileBin('/decomp/em/bag/menu.4bpp.bin', 4),
      loadTilemapBin('/decomp/em/bag/menu.bin'),
      loadGbaPal('/decomp/em/bag/menu_male.pal'),
      loadGbaPal('/decomp/em/bag/menu_female.pal'),
      loadGbaPal('/decomp/em/interface/std_menu.pal'),       // gStandardMenuPalette
      loadGbaPal('/decomp/em/interface/menu_info1.pal'),      // gMenuInfoElements1_Pal
      loadGbaPal('/decomp/em/interface/menu_info2.pal'),      // gMenuInfoElements2_Pal
      loadGbaPal('/decomp/em/interface/menu_info3.pal'),      // gMenuInfoElements3_Pal
      loadTileBin('/decomp/em/interface/scroll_indicator.4bpp.bin', 4), // sScrollIndicator_Gfx
      loadGbaPal('/decomp/em/interface/red.pal'),             // sRedInterface_Pal
      loadTileBin('/decomp/em/bag/hm.4bpp.bin', 4),           // gBagMenuHMIcon_Gfx (badge "CS" 16×16)
      loadTileBin('/decomp/em/bag/bag_male.4bpp.bin', 4),     // gBagMaleTiles (sprite sac mâle, 6×64×64)
      loadTileBin('/decomp/em/bag/bag_female.4bpp.bin', 4),   // gBagFemaleTiles (sprite sac femelle)
      loadGbaPal('/decomp/em/bag/bag_male.gbapal'),           // gBagPalette (palette OBJ, item_menu_icons.c:142 — partagée gender-neutral)
      loadTileBin('/decomp/em/bag/rotating_ball.4bpp.bin', 4), // sRotatingBall_Gfx (16×16 4bpp = 128 octets)
      loadGbaPal('/decomp/em/bag/rotating_ball.gbapal'),       // sRotatingBall_Pal (item_menu_icons.c:36-37)
    ]);
    // Asset gMenuInfoElements_Gfx + palette dédiée (menu.c:113 sMenuInfoIcons)
    // — sheet 128×128 4bpp avec labels TYPE/PUISS/PRÉC/PP + 18 icones de type
    // (= panneau ctx menu poche CT/CS). Chargé en BG_PLTT_ID(12) cf. paletteNum.
    const [menuInfoGfx, menuInfoPal] = await Promise.all([
      loadTileBin('/decomp/em/interface/menu_info.4bpp.bin', 4),
      loadGbaPal('/decomp/em/interface/menu_info.gbapal'),
    ]);
    // Préchauffe assetCache pour le ListMenuLoadStdPalAt PARTAGÉ (gba-menu-
    // system.ts) — pattern préchargement-symbole prouvé (intro/std_menu).
    assetCache.set('gMenuInfoElements1_Pal', mi1);
    assetCache.set('gMenuInfoElements2_Pal', mi2);
    assetCache.set('gMenuInfoElements3_Pal', mi3);
    // Phase 2 flèches : sScrollIndicator_Gfx/sRedInterface_Pal = clés que
    // AddScrollIndicatorArrowPair (list-menu.ts) résout via getAsset.
    assetCache.set('sScrollIndicator_Gfx', scrollGfx);
    assetCache.set('sRedInterface_Pal', redPal);
    _bagAssets = {
      bgTiles, bgTilemap, palMale, palFemale, stdMenuPal, hmIcon,
      bagSpriteMale, bagSpriteFemale, bagSpritePal,
      menuInfoGfx, menuInfoPal,
    };
    // 1:1 décomp item_menu.c:828-836 cases 3+4 graphics state machine :
    // LoadCompressedSpriteSheet(bagMale|bagFemale) + LoadCompressedSpritePalette
    // (gBagPaletteTable). Substrat sprite dynamique : assetCache + tag-keyed
    // LoadCompressedSpriteSheet/LoadSpritePalette (= pattern item-icon prouvé).
    assetCache.set('__bagSpriteMaleTiles', bagSpriteMale);
    assetCache.set('__bagSpriteFemaleTiles', bagSpriteFemale);
    assetCache.set('__bagSpritePal', bagSpritePal);
    // Ball rotative pocket-switch (T10) — assets sous TAG_ROTATING_BALL_GFX.
    // LoadSpriteSheet/LoadSpritePalette appelés à la 1ère AddSwitchPocketRotat
    // ingBallSprite (= au switch, pas au boot — 1:1 décomp item_menu_icons.c:500).
    assetCache.set('__rotatingBallTiles', rotatingBallGfx);
    assetCache.set('__rotatingBallPal', rotatingBallPal);
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
  // 1:1 décomp `ResetVramOamAndBgCntRegs()` (menu_helpers.c:94) — fn PARTAGÉE.
  // (Avant : bloc inline INCOMPLET — il manquait le clear PLTT RAM hardware ;
  //  la fn partagée le rétablit = vrai 1:1, évite tout résidu palette OW.)
  ResetVramOamAndBgCntRegs();
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
  // 1:1 décomp `ResetAllBgsCoordinates()` (menu_helpers.c:106) — fn PARTAGÉE.
  ResetAllBgsCoordinates();
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
    const pal = (!IsWallysBag() && gSaveBlock2Ptr.playerGender !== MALE) ? a.palFemale : a.palMale;
    LoadPalette(pal, BG_PLTT_ID(0), 2 * 16 * 2); // 2 palettes = 32 u16
    // case 3 : LoadCompressedSpriteSheet(&gBagMale/FemaleSpriteSheet) (:828-832) —
    //          Wally → male ; sinon selon gameState.gender. tag=TAG_BAG_GFX=100.
    //          0x3000 = 12288 octets = 6 frames 64×64 4bpp (sBagSpriteAnimTable).
    const tilesKey = (IsWallysBag() || gSaveBlock2Ptr.playerGender === MALE)
      ? '__bagSpriteMaleTiles' : '__bagSpriteFemaleTiles';
    LoadCompressedSpriteSheet({ data: tilesKey, size: 0x3000, tag: TAG_BAG_GFX });
    // case 4 : LoadCompressedSpritePalette(&gBagPaletteTable) (:836). gender-neutral.
    LoadSpritePalette({ data: '__bagSpritePal', tag: TAG_BAG_GFX });
    // default case (= LoadListMenuSwapLineGfx, item_menu.c:840) — barre swap
    // (sprite shared bag/PC/pokeblock, TAG_SWAP_LINE=109).
    LoadListMenuSwapLineGfx();
    // Palette menu_info → BG_PLTT_ID(12) (= paletteNum=12 utilisé par les
    // WindowTemplates WIN_TMHM_INFO_ICONS et WIN_TMHM_INFO). Sans cette
    // palette, le panneau TM/HM affiche en couleurs corrompues (= palette
    // VRAM contient les valeurs de la frame précédente / autre BG).
    LoadPalette(a.menuInfoPal, BG_PLTT_ID(12), 32 /* 16 colors × 2 octets */);
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
  GoToBagMenu(ITEMMENULOCATION_FIELD, POCKETS_COUNT, _cb2ReturnToFieldWithOpenMenu);
}

/** Entrée start-menu — 1:1 décomp `StartMenuBagCallback` (start_menu.c:763) :
 *  `gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu ;
 *   SetMainCallback2(CB2_BagMenuFromStartMenu)`. Pattern IDENTIQUE à
 *  `OpenPartyScreen` (party-screen.ts:2044, prouvé/A-B). Remplace le foam
 *  `bag-screen.ts:OpenBagScreen` (recâblage start-menu = ÉTAPE 9 du plan). */
export function OpenBagScreen(): void {
  const rt = getRuntime();
  if (!rt) return;
  rt.gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu_Manual;
  CB2_BagMenuFromStartMenu();
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

// SHOP (vente) : l'exitCallback décomp `CB2_ExitSellMenu` vit dans shop.c → le
// shop l'enregistre ici (idiome "exitCallbacks externes" ci-dessous), ce qui
// évite le cycle ESM statique shop↔bag (sinon TDZ).
let _cb2ExitSellMenu: MainCallback = null;
export function _setSellMenuExitCallback(cb: MainCallback): void { _cb2ExitSellMenu = cb; }
/** 1:1 décomp `CB2_GoToSellMenu` (item_menu.c:588) :
 *    GoToBagMenu(ITEMMENULOCATION_SHOP, POCKETS_COUNT, CB2_ExitSellMenu). */
export function CB2_GoToSellMenu(): void {
  GoToBagMenu(ITEMMENULOCATION_SHOP, POCKETS_COUNT, _cb2ExitSellMenu);
}

// exitCallbacks externes — résolus au câblage étape 9 (placeholders honnêtes
// NON appelés tant que le sac n'est pas wiré ; pas des fakes silencieux).
// FIELD (START→SAC) : retour terrain + ré-ouverture start menu 1:1 (= décomp
// CB2_ReturnToFieldWithOpenMenu) — porté option-menu-return.ts, prouvé party.
const _cb2ReturnToFieldWithOpenMenu: MainCallback = CB2_ReturnToFieldWithOpenMenu_Manual;
// BATTLE : maillon ultérieur (hors chemin ouvrable Phase 1 ; déferral honnête).
const _cb2SetUpReshowBattleScreenAfterMenu2: MainCallback = null;
// BERRY-TREE (Bag_ChooseBerry) : 1:1 décomp `CB2_ReturnToFieldContinueScript`
// (item_menu.c:579) — restore l'OW + fade FROM_BLACK ; le script de plantation
// bloqué (waitstate après `special Bag_ChooseBerry`) reprend au retour.
const _cb2ReturnToFieldContinueScript: MainCallback = CB2_ReturnToFieldContinueScript_Manual;

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

// ─── MainCB2_BagMenuRun / VBlankCB_BagMenuRun (item_menu.c:646/655) ──────────────
// 1:1 net-effect : RunTasks/AnimateSprites/BuildOamBuffer/DoScheduledBg…/
// UpdatePaletteFade (et LoadOam/ProcessSpriteCopyRequests/TransferPlttBuffer)
// = auto-tickés par notre runtime (modèle prouvé Summary `MainCB2_SummaryRun`).
export function MainCB2_BagMenuRun(): void { /* runtime auto-tick */ }
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
      // 1:1 décomp :823-825 : setup initial = un seul nom rendu (= name1).
      PrintPocketNames(_pocketName(gBagPosition.pocket), null);
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
      rt.SetMainCallback2(MainCB2_BagMenuRun);
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
const COLORID_TMHM_INFO = 4;
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
// Valeurs = CLÉS gText (pas le texte FR) → getString() au point d'usage (la map
// `strings` est peuplée async au boot). Mapping 1:1 décomp gBagMenu_ReturnToStrings
// (strings.c:258-272). gText_ReturnToVar1 (strings.c:282) idem au runtime.
const gBagMenu_ReturnToStringKeys: Record<number, string> = {
  [ITEMMENULOCATION_FIELD]: 'gText_TheField',
  [ITEMMENULOCATION_BATTLE]: 'gText_TheBattle',
  [ITEMMENULOCATION_PARTY]: 'gText_ThePokemonList',
  [ITEMMENULOCATION_SHOP]: 'gText_TheShop',
  [ITEMMENULOCATION_BERRY_TREE]: 'gText_TheField',
  [ITEMMENULOCATION_BERRY_BLENDER_CRUSH]: 'gText_TheField',
  [ITEMMENULOCATION_ITEMPC]: 'gText_ThePC',
  [ITEMMENULOCATION_FAVOR_LADY]: 'gText_TheField',
  [ITEMMENULOCATION_QUIZ_LADY]: 'gText_TheField',
  [ITEMMENULOCATION_APPRENTICE]: 'gText_TheField',
  [ITEMMENULOCATION_WALLY]: 'gText_TheBattle',
  [ITEMMENULOCATION_PCBOX]: 'gText_ThePC',
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
// gText_Var1IsSelected (ctx menu, item_menu.c:1664) + gText_MoveVar1Where (swap
// SELECT, item_menu.c:1449) : tirés de getString() AU POINT D'USAGE — la map
// `strings` est peuplée async au boot (initStringsFromDecomp), donc un const inline
// au module-load serait soit vide soit une copie hardcodée (cf. sonde). Pas de const.
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
interface ListMenuItemRef { name: string | Uint8Array; id: number; }
let _sListBuffer1: { subBuffers: ListMenuItemRef[] } | null = null;
let _sListBuffer2: { name: (string | Uint8Array)[] } | null = null;

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
// AddBagItemIconSprite / RemoveBagItemIconSprite / ShakeBagSprite / Add/Set
// BagVisualSprite : PORTÉS 1:1 Phase 2 (item_menu_icons.c) → importés de
// bag-menu-icons.ts ↑. Call-sites 1:1 inchangés.
// AddBagItemIconSprite / RemoveBagItemIconSprite : PORTÉS 1:1 Phase 2 →
// importés de bag-menu-icons.ts (item_menu_icons.c) ↑. Call-sites 1:1
// inchangés (itemId numérique ; traduction itemKey confinée bag-menu-icons).
/** 1:1 décomp `BlitBitmapToWindow(windowId, gBagMenuHMIcon_Gfx, 8, y-1, 16, 16)`
 *  (item_menu.c:970-971). gBagMenuHMIcon_Gfx = `graphics/bag/hm.png` .4bpp
 *  (extrait `public/decomp/em/bag/hm.4bpp.bin`, 128 o = 16×16 4bpp) —
 *  c'EST le glyphe "CS" du sac HM (pas un char, un BITMAP — root cause
 *  trouvée : le user voyait "CS" sur la ROM = ce blit, qu'on n'exécutait
 *  pas en Phase 1). Préchargé _bagAssets.hmIcon. */
function _bagBlitHMIcon(windowId: number, y: number): void {
  if (_bagAssets) BlitBitmapToWindow(windowId, _bagAssets.hmIcon, 8, y - 1, 16, 16);
}
/** DÉFÉRÉ — `if (gSaveBlock1Ptr->registeredItem != ITEM_NONE &&
 *  == itemId) BlitBitmapToWindow(windowId, sRegisteredSelect_Gfx, 96, y-1,
 *  24, 16)` (item_menu.c:990-994) : asset sRegisteredSelect_Gfx non extrait
 *  + registeredItem save (chaînon ultérieur). */
function _bagDrawRegisteredIcon(_windowId: number, _y: number, _itemId: number): void {
  /* DÉFÉRÉ Phase 3 — blit sRegisteredSelect_Gfx (asset non extrait +
     save registeredItem). No-op honnête (icône SELECT objets-clés =
     cosmétique, non bloquant ouvrable). */
}
// GetItemImportance : PORTÉ 1:1 (item.c:910) → importé de decomp-bridge ↑.
// items.json re-extrait avec le champ `importance` (scripts/extract-items.mjs).
// Sans ça, les CS01..CS08 affichaient "x 1" car GetItemImportance retournait
// toujours 0 → branche quantité au lieu de "registered icon".

// ── 5c : leaves TEXTE/DATA — 1:1 sur infra texte A/B-prouvée (≠ foam) ──────
/** `WIN_*` décomp = id gWindows séquentiel ; chez nous = `_bagWinIds[WIN_*]`
 *  (1:1-sém ; cf. LoadBagMenuTextWindows + feedback-bag-refactor : adresser
 *  via les vrais ids InitWindows, pas l'enum brut). */
function _win(w: number): number { return _bagWinIds[w]; }

/** 1:1 décomp `BagMenu_Print` (item_menu.c:2476) :
 *    AddTextPrinterParameterized4(windowId, fontId, left, top, letterSpacing,
 *      lineSpacing, sFontColorTable[colorIndex], speed, str). */
function BagMenu_Print(
  windowId: number, fontId: number, str: string | Uint8Array, left: number, top: number,
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

/** 1:1 décomp `PrintItemDescription` (item_menu.c:998). Pur numéric →
 *  GetItemDescription (bridge fait la conversion id→itemKey items.json,
 *  y compris la normalisation TM/HM enum-numbered → move-named). AVANT
 *  Phase 1 wrappait getItemKeyById = workaround cassé pour la CT/CS
 *  (string "ITEM_TM01" passée au bridge, mais items.json clé =
 *  "ITEM_TM_FOCUS_PUNCH" → desc vide). */
function PrintItemDescription(itemIndex: number): void {
  let str: string | Uint8Array;
  if (itemIndex !== LIST_CANCEL) {
    str = GetItemDescription(BagGetItemIdByPocketPosition(gBagPosition.pocket + 1, itemIndex));
  } else {
    // Print 'Cancel' description
    setStringVar(1, getString(gBagMenu_ReturnToStringKeys[gBagPosition.location] ?? 'gText_TheField'));
    StringExpandPlaceholders(gStringVar4, encodeOwText(getString('gText_ReturnToVar1')));
    str = gStringVar4;
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
  // 1:1 décomp item_menu.c : ConvertIntToDecimalStringN(gStringVar1, qty, RIGHT_ALIGN, numDigits)
  // écrit les bytes charmap DIRECTEMENT dans gStringVar1 (foyer string_util.ts), plus le
  // round-trip JS-string du bridge ; StringExpandPlaceholders lit gStringVar1 pour {STR_VAR_1}.
  ConvertIntToDecimalStringN(gStringVar1, itemQuantity, STR_CONV_MODE_RIGHT_ALIGN, numDigits);
  StringExpandPlaceholders(gStringVar4, encodeOwText(gText_xVar1));
  const s4 = gStringVar4;
  const offset = GetStringRightAlignXOffset(s4, 119);
  BagMenu_Print(windowId, FONT_NARROW, s4, offset, y, 0, 0, TEXT_SKIP_DRAW, COLORID_NORMAL);
}

/** 1:1 décomp `PrintItemQuantity(windowId, quantity, speed)` (item_menu.c:2526) :
 *  fenêtre ITEMWIN_QUANTITY du sélecteur Toss/Deposit — `×{count}`, leading zeros,
 *  centré. Exporté pour bag-menu-ctx (flow toss). */
export function _CtxPrintQuantityInWindow(windowId: number, count: number): void {
  FillWindowPixelBuffer(windowId, PIXEL_FILL(1));
  ConvertIntToDecimalStringN(gStringVar1, count, STR_CONV_MODE_LEADING_ZEROS, BAG_ITEM_CAPACITY_DIGITS);
  StringExpandPlaceholders(gStringVar4, encodeOwText(gText_xVar1));
  // Décomp : GetStringCenterAlignXOffset(FONT_NORMAL, gStringVar4, 0x28) ; fenêtre
  // largeur 5 (40px) → offset centré ~4px (ajustable A/B).
  BagMenu_Print(windowId, FONT_NORMAL, gStringVar4, 4, 2, 0, 0, TEXT_SKIP_DRAW, COLORID_NORMAL);
  CopyWindowToVram(windowId, 3 /* COPYWIN_FULL */);
}

/** 1:1 décomp `CopyItemName` (item.c:79) : `StringCopy(dst, GetItemName
 *  (itemId))`. `GetItemName` décomp = `gItems[SanitizeItemId(itemId)].name`
 *  (indexé numérique) ; notre table items est clé itemKey-string →
 *  `getItemKeyById` = réalisation 1:1-sém de l'indexation `gItems[itemId]`.
 *  `StringCopy` retourne src (dst opaque, modèle string projet). */
function CopyItemName(itemId: number): string {
  // 1:1 décomp `StringCopy(dst, GetItemName(itemId))` ; modèle source-string :
  // retourne le nom (sera encodé au point d'entrée pipeline byte via setStringVar).
  return GetItemName(getItemKeyById(itemId));
}

/** 1:1 décomp `GetItemNameFromPocket` (item_menu.c:899). La décomp remplit
 *  `dest` (u8*) via gStringVar1/2 + StringExpandPlaceholders ; notre modèle
 *  string retourne la valeur → on RETOURNE le nom construit (= dest). Les
 *  gStringVarN sont routés via le proxy globalThis (cf. _gsv plus haut). */
/** Expand un template OW dans un buffer byte FRAIS (1 par item — 1:1 décomp
 *  `StringCopy(sListBuffer2->name[i], gStringVar4)` qui COPIE ; sans buffer dédié
 *  tous les name[] partageraient gStringVar4 → tous la dernière valeur). */
function _expandItemNameLine(tpl: string): Uint8Array {
  const buf = new Uint8Array(64);
  StringExpandPlaceholders(buf, encodeOwText(tpl));
  return buf;
}

// 1:1 décomp `GetItemName`/`GetItemNameFromPocket` : remplit gStringVar1/2 puis
// StringExpandPlaceholders dans un buffer name dédié (bytes charmap).
function GetItemNameFromPocket(itemId: number): string | Uint8Array {
  switch (gBagPosition.pocket) {
    case TMHM_POCKET:
      // StringCopy(gStringVar2, gMoveNames[ItemIdToBattleMoveId(itemId)])
      setStringVar(2, getMoveName(ItemIdToBattleMoveId(itemId)));
      if (itemId >= ITEM_HM01) {
        // Get HM number
        ConvertIntToDecimalStringN(gStringVar1, itemId - ITEM_HM01 + 1, STR_CONV_MODE_LEADING_ZEROS, 1);
        return _expandItemNameLine(gText_NumberItem_HM);
      } else {
        // Get TM number
        ConvertIntToDecimalStringN(gStringVar1, itemId - ITEM_TM01 + 1, STR_CONV_MODE_LEADING_ZEROS, 2);
        return _expandItemNameLine(gText_NumberItem_TMBerry);
      }
    case BERRIES_POCKET:
      ConvertIntToDecimalStringN(gStringVar1, itemId - FIRST_BERRY_INDEX + 1, STR_CONV_MODE_LEADING_ZEROS, 2);
      setStringVar(2, CopyItemName(itemId));
      return _expandItemNameLine(gText_NumberItem_TMBerry);
    default:
      return CopyItemName(itemId);  // string source (list menu accepte string|byte)
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
    _sListBuffer2.name[i] = gText_CloseBag;  // string source (list menu accepte string|byte)
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
// 1:1 décomp strings.c:283-295 — gPocketNamesStringsTable[] FR, indexé par
// poche (valeurs byte-identiques au décomp FR). Table de texte 1:1 (même
// pattern que gText_CloseBag/gBagMenu_ReturnToStrings ci-dessus : strings-data
// auto n'expose que les NOMS de symboles, pas le texte FR → port 1:1 cité).
// Valeurs = CLÉS gText → getString() au runtime (cf. _pocketName, anti-hardcode).
// Ordre indexé par pocket (1:1 décomp gPocketNamesStringsTable, strings.c:283-287).
const gPocketNamesStringKeys: readonly string[] = [
  'gText_ItemsPocket',     // [ITEMS_POCKET]
  'gText_PokeBallsPocket', // [BALLS_POCKET]
  'gText_TMHMPocket',      // [TMHM_POCKET]
  'gText_BerriesPocket',   // [BERRIES_POCKET]
  'gText_KeyItemsPocket',  // [KEYITEMS_POCKET]
];
/** Nom FR de la poche, tiré de strings.json au runtime (anti-hardcode). */
function _pocketName(pocket: number): string {
  return getString(gPocketNamesStringKeys[pocket] ?? 'gText_ItemsPocket');
}

// 1:1 décomp `RGB_BLACK` (include/constants/rgb.h) = 0.
const RGB_BLACK = 0;

/** 1:1 décomp `PrintPocketNames` (item_menu.c:2421).
 *  Crée une fenêtre temp 16×2 tiles (= 128 px × 16 px), rend `pocketName1`
 *  centré dans les 64 premiers pixels et (si non null) `pocketName2` centré
 *  dans les 64 suivants — soit deux noms de poche côte-à-côte. Snapshot le
 *  pixelBuffer dans `gBagMenu.pocketNameBuffer` pour que `CopyPocketName
 *  ToWindow(a)` puisse en extraire une tranche 64 px-wide à l'offset `a` × 8 px
 *  (= le slide horizontal de l'anim SwitchBagPocket). */
function PrintPocketNames(pocketName1: string, pocketName2: string | null): void {
  // Décomp :2423-2429 : `struct WindowTemplate window = {0}` puis .width=16 .height=2.
  // Sur GBA, baseBlock=0 + bg=0 = chevauche le tile data d'autres fenêtres ;
  // mais on le RemoveWindow avant CopyWindowToVram, donc rien n'est écrit en
  // VRAM. Notre AddWindow alloue un pixelBuffer interne suffisant.
  const tempTemplate: WindowTemplate = {
    bg: 0, tilemapLeft: 0, tilemapTop: 0,
    width: 16, height: 2, paletteNum: 1, baseBlock: 0,
  };
  const tempWid = AddWindow(tempTemplate);
  FillWindowPixelBuffer(tempWid, PIXEL_FILL(0));
  // :2431-2436 BagMenu_Print(windowId, FONT_NORMAL, name, offset, 1, 0, 0, TEXT_SKIP_DRAW, COLORID_POCKET_NAME)
  let offset = GetStringCenterAlignXOffset(pocketName1, 0x40);
  BagMenu_Print(tempWid, FONT_NORMAL, pocketName1, offset, 1, 0, 0, TEXT_SKIP_DRAW, 1 /* COLORID_POCKET_NAME */);
  if (pocketName2) {
    offset = GetStringCenterAlignXOffset(pocketName2, 0x40);
    BagMenu_Print(tempWid, FONT_NORMAL, pocketName2, offset + 0x40, 1, 0, 0, TEXT_SKIP_DRAW, 1);
  }
  // :2438 CpuCopy32(GetWindowAttribute(windowId, WINDOW_TILE_DATA), gBagMenu->pocketNameBuffer, sizeof(...))
  // — snapshot pixelBuffer (8bpp 1B/pixel, 128*16=2048B) dans le buffer struct.
  const src = GetWindowPixelBuffer(tempWid);
  if (src && gBagMenu) {
    gBagMenu.pocketNameBuffer.set(src.subarray(0, gBagMenu.pocketNameBuffer.length));
  }
  // :2439 RemoveWindow(windowId)
  RemoveWindow(tempWid);
}

/** 1:1 décomp `CopyPocketNameToWindow` (item_menu.c:2442).
 *  Copie une tranche 64 px-wide × 16 px-high depuis le `pocketNameBuffer`
 *  (128×16) à l'offset horizontal `a*8` px, vers WIN_POCKET_NAME (64×16).
 *  Pendant l'anim de switch, `a` progresse 0→8 (right) ou 8→0 (left), créant
 *  un slide horizontal qui révèle l'ancien nom → nouveau nom. */
function CopyPocketNameToWindow(a: number): void {
  // :2447 `if (a > 8) a = 8;` (clamp).
  if (a > 8) a = 8;
  if (!gBagMenu) return;
  const wid = _win(WIN_POCKET_NAME);
  const dst = GetWindowPixelBuffer(wid);
  if (!dst) return;
  const src = gBagMenu.pocketNameBuffer;
  // 16 rows × 64 px par row. Source pas: 128 px ; Dest pas: 64 px.
  for (let row = 0; row < 16; row++) {
    const srcOff = row * 128 + a * 8;
    const dstOff = row * 64;
    dst.set(src.subarray(srcOff, srcOff + 64), dstOff);
  }
  // :2454 CopyWindowToVram(WIN_POCKET_NAME, COPYWIN_GFX).
  MarkWindowDirty(wid);
  CopyWindowToVram(wid, 2 /* COPYWIN_GFX */);
}

/** 1:1 décomp `DrawItemListBgRow` (item_menu.c:1412).
 *  *« The background of the item list is a lighter color than the surrounding
 *  menu. When the pocket is switched this lighter background is redrawn row by
 *  row »* — chaque frame de l'anim repeint une rangée du fond clair (= 15
 *  tiles de large, 1 tile de haut, à y+2 sur BG2). Le tile metatile `17` est
 *  la définition de la rangée claire (cf. menu.bin). */
function DrawItemListBgRow(y: number): void {
  FillBgTilemapBufferRect_Palette0(2, 17, 14, y + 2, 15, 1);
  ScheduleBgCopyTilemapToVram(2);
}

/** 1:1 décomp `DrawPocketIndicatorSquare` (item_menu.c:1418). */
function DrawPocketIndicatorSquare(x: number, isCurrentPocket: boolean): void {
  if (!isCurrentPocket)
    FillBgTilemapBufferRect_Palette0(2, 0x1017, x + 5, 3, 1, 1);
  else
    FillBgTilemapBufferRect_Palette0(2, 0x102B, x + 5, 3, 1, 1);
  ScheduleBgCopyTilemapToVram(2);
}

// ─── struct task-data Task_BagMenu_HandleInput (item_menu.c:1213) ────────────
// #define tListTaskId data[0] / tListPosition data[1] / tQuantity data[2]
// tNeverRead data[3] / tItemCount data[8]  (1:1 décomp).
const T_LIST_TASK_ID = 0, T_LIST_POSITION = 1, T_QUANTITY = 2, T_NEVER_READ = 3, T_ITEM_COUNT = 8;
// 1:1 décomp item_menu.c:668-670 task-data extra pour anim slide poche.
const T_POCKET_SWITCH_DIR = 11, T_POCKET_SWITCH_TIMER = 12, T_POCKET_SWITCH_STATE = 13;
// 1:1 décomp enum SWITCH_POCKET_* (item_menu.c:1290 — non exporté par
// decomp-data, dérivé 1:1 local comme COLORID_*/MAX_ITEMS_SHOWN).
const SWITCH_POCKET_NONE = 0, SWITCH_POCKET_LEFT = 1, SWITCH_POCKET_RIGHT = 2;
function _task(taskId: number): DecompTask | undefined {
  return getRuntime()?.gTasks?.[taskId];
}

/** 1:1 décomp `CreateBagInputHandlerTask` (item_menu.c:847). Branche WALLY =
 *  Task_WallyTutorialBagMenu déférée (tuto Wally = maillon ultérieur ; le
 *  chemin FIELD/BATTLE/BERRY couvre l'ouvrable — déferral honnête documenté). */
function CreateBagInputHandlerTask(location: number): number {
  const rt = getRuntime()!;
  if (location === ITEMMENULOCATION_WALLY)
    return rt.CreateTask(Task_BagMenu_HandleInput, 0); // TODO maillon: Task_WallyTutorialBagMenu (flux Wally)
  return rt.CreateTask(Task_BagMenu_HandleInput, 0);
}
/** 1:1 décomp item_menu.c:737 `ListMenuInit(&gMultiuseListMenuTemplate,
 *  scroll, cursor)` (gMultiuseListMenuTemplate lié par LoadBagItemListBuffers). */
function ListMenuInitForBag(scroll: number, cursor: number): number {
  return ListMenuInit(gMultiuseListMenuTemplate, scroll, cursor);
}
/** 1:1 décomp item_menu.c:738-740 : gTasks[taskId].tListTaskId = … ;
 *  tNeverRead = 0 ; tItemCount = 0. */
function BagSetListTaskId(taskId: number, listTaskId: number): void {
  const t = _task(taskId);
  if (!t) return;
  t.data[T_LIST_TASK_ID] = listTaskId;
  t.data[T_NEVER_READ] = 0;
  t.data[T_ITEM_COUNT] = 0;
}

// ── case 15-18 : sprites / swap-line / TMHM-window — DÉFÉRÉS Phase 2/3
//    (sous-système sprite = tag-mismatch substrat, déféré explicite tracké
//    Phase 2 ; swap-line + TMHM = étape 7. NON bloquant pour ouvrable :
//    le spike a prouvé sac navigable sans ces sprites. Pas un fake —
//    no-op documenté, résolu en phase nommée, WORKING-MODE §2). ───────────
// AddBagVisualSprite : PORTÉ 1:1 Phase 2 (item_menu_icons.c:437) → importé de
// bag-menu-icons.ts ↑. Appel case 15 inchangé.

/** 1:1 décomp `CreateItemMenuSwapLine` (item_menu_icons.c:575) :
 *  `CreateSwapLineSprites(&gBagMenu->spriteIds[ITEMMENUSPRITE_SWAP_LINE],
 *   ITEMMENU_SWAP_LINE_LENGTH)`. Alloue 8 sprites SIZE(16x16) côte-à-côte
 *  qui formeront la barre grise + ▶ rouge pendant le mode SELECT swap.
 *  Tous invisibles à la création (= SetSwapLineSpritesInvisibility(.., TRUE)
 *  via SetItemMenuSwapLineInvisibility appelé au bon moment). */
function CreateItemMenuSwapLine(): void {
  if (!gBagMenu) return;
  CreateSwapLineSprites(gBagMenu.spriteIds, ITEMMENUSPRITE_SWAP_LINE, ITEMMENU_SWAP_LINE_LENGTH);
}

/** 1:1 décomp `SetItemMenuSwapLineInvisibility` (item_menu_icons.c:580). */
function SetItemMenuSwapLineInvisibility(invisible: boolean): void {
  if (!gBagMenu) return;
  SetSwapLineSpritesInvisibility(gBagMenu.spriteIds, ITEMMENUSPRITE_SWAP_LINE, ITEMMENU_SWAP_LINE_LENGTH, invisible);
}

/** 1:1 décomp `UpdateItemMenuSwapLinePos` (item_menu_icons.c:585) :
 *  `UpdateSwapLineSpritesPos(&...[SWAP_LINE], LENGTH | SWAP_LINE_HAS_MARGIN,
 *  120, (y + 1) * 16)`. `y` = cursorRow (0..maxShown-1). */
function UpdateItemMenuSwapLinePos(y: number): void {
  if (!gBagMenu) return;
  UpdateSwapLineSpritesPos(
    gBagMenu.spriteIds, ITEMMENUSPRITE_SWAP_LINE,
    ITEMMENU_SWAP_LINE_LENGTH | SWAP_LINE_HAS_MARGIN,
    120, (y + 1) * 16,
  );
}
// 1:1 décomp `sBagScrollArrowsTemplate` (item_menu.c:363) — chevrons L/R
// poche (CreatePocketSwitchArrowPair). palNum 0 (TAG ≠ TAG_NONE → slot pal).
const sBagScrollArrowsTemplate: ScrollArrowsTemplate = {
  firstArrowType: SCROLL_ARROW_LEFT, firstX: 28, firstY: 16,
  secondArrowType: SCROLL_ARROW_RIGHT, secondX: 100, secondY: 16,
  fullyUpThreshold: -1, fullyDownThreshold: -1,
  tileTag: TAG_BAG_SCROLL_ARROW, palTag: TAG_BAG_SCROLL_ARROW, palNum: 0,
};

/** 1:1 décomp `CreatePocketScrollArrowPair` (item_menu.c:1030). `&gBag
 *  Position.scrollPosition[pocket]` → getter live (1:1-sém pointeur). */
function CreatePocketScrollArrowPair(): void {
  if (gBagMenu!.pocketScrollArrowsTask === TASK_NONE)
    gBagMenu!.pocketScrollArrowsTask = AddScrollIndicatorArrowPairParameterized(
      SCROLL_ARROW_UP, 172, 12, 148,
      gBagMenu!.numItemStacks[gBagPosition.pocket] - gBagMenu!.numShownItems[gBagPosition.pocket],
      TAG_POCKET_SCROLL_ARROW, TAG_POCKET_SCROLL_ARROW,
      () => gBagPosition.scrollPosition[gBagPosition.pocket]);
}
/** 1:1 décomp `CreatePocketSwitchArrowPair` (item_menu.c:1054). */
function CreatePocketSwitchArrowPair(): void {
  if (gBagMenu!.pocketSwitchDisabled !== 1 && gBagMenu!.pocketSwitchArrowsTask === TASK_NONE)
    gBagMenu!.pocketSwitchArrowsTask = AddScrollIndicatorArrowPair(
      sBagScrollArrowsTemplate, () => gBagPosition.pocketSwitchArrowPos);
}
/** 1:1 décomp `DestroyPocketSwitchArrowPair` (item_menu.c:1060). */
function DestroyPocketSwitchArrowPair(): void {
  if (gBagMenu!.pocketSwitchArrowsTask !== TASK_NONE) {
    RemoveScrollIndicatorArrowPair(gBagMenu!.pocketSwitchArrowsTask);
    gBagMenu!.pocketSwitchArrowsTask = TASK_NONE;
  }
}
// 1:1 décomp `sMenuInfoIcons[]` (menu.c:113). Chaque entrée = { width, height,
// offset } où offset est en TILES dans le sheet menu_info.png (16 tiles wide).
// Indices : 0 unused ; 1..18 = TYPE_NORMAL+1..TYPE_DARK+1 ; 19=TYPE label,
// 20=POWER, 21=ACCURACY, 22=PP, 23=EFFECT (unused), 24=BALL_RED, 25=BALL_BLUE.
const sMenuInfoIcons: ReadonlyArray<{ width: number; height: number; offset: number }> = [
  { width: 12, height: 12, offset: 0x00 },  // [0] Unused
  { width: 32, height: 12, offset: 0x20 },  // [1] TYPE_NORMAL+1
  { width: 32, height: 12, offset: 0x24 },  // [2] TYPE_FIRE+1
  { width: 32, height: 12, offset: 0x28 },  // [3] TYPE_WATER+1
  { width: 32, height: 12, offset: 0x2C },  // [4] TYPE_GRASS+1
  { width: 32, height: 12, offset: 0x40 },  // [5] TYPE_ELECTRIC+1
  { width: 32, height: 12, offset: 0x44 },  // [6] TYPE_ROCK+1
  { width: 32, height: 12, offset: 0x48 },  // [7] TYPE_GROUND+1
  { width: 32, height: 12, offset: 0x4C },  // [8] TYPE_ICE+1
  { width: 32, height: 12, offset: 0x60 },  // [9] TYPE_FLYING+1
  { width: 32, height: 12, offset: 0x64 },  // [10] TYPE_FIGHTING+1
  { width: 32, height: 12, offset: 0x68 },  // [11] TYPE_GHOST+1
  { width: 32, height: 12, offset: 0x6C },  // [12] TYPE_BUG+1
  { width: 32, height: 12, offset: 0x80 },  // [13] TYPE_POISON+1
  { width: 32, height: 12, offset: 0x84 },  // [14] TYPE_PSYCHIC+1
  { width: 32, height: 12, offset: 0x88 },  // [15] TYPE_STEEL+1
  { width: 32, height: 12, offset: 0x8C },  // [16] TYPE_DARK+1
  { width: 32, height: 12, offset: 0xA0 },  // [17] TYPE_DRAGON+1
  { width: 32, height: 12, offset: 0xA4 },  // [18] TYPE_MYSTERY+1
  { width: 42, height: 12, offset: 0xA8 },  // [19] MENU_INFO_ICON_TYPE
  { width: 42, height: 12, offset: 0xC0 },  // [20] MENU_INFO_ICON_POWER
  { width: 42, height: 12, offset: 0xC8 },  // [21] MENU_INFO_ICON_ACCURACY
  { width: 42, height: 12, offset: 0xE0 },  // [22] MENU_INFO_ICON_PP
];

// Constants 1:1 décomp menu.h:17-23 (= NUMBER_OF_MON_TYPES = 18 + offset).
const MENU_INFO_ICON_TYPE = 19;
const MENU_INFO_ICON_POWER = 20;
const MENU_INFO_ICON_ACCURACY = 21;
const MENU_INFO_ICON_PP = 22;

// Map type string décomp → index sMenuInfoIcons (+1 car [0] = unused).
const _TYPE_NAME_TO_ICON_IDX: Record<string, number> = {
  'TYPE_NORMAL': 1, 'TYPE_FIRE': 2, 'TYPE_WATER': 3, 'TYPE_GRASS': 4,
  'TYPE_ELECTRIC': 5, 'TYPE_ROCK': 6, 'TYPE_GROUND': 7, 'TYPE_ICE': 8,
  'TYPE_FLYING': 9, 'TYPE_FIGHTING': 10, 'TYPE_GHOST': 11, 'TYPE_BUG': 12,
  'TYPE_POISON': 13, 'TYPE_PSYCHIC': 14, 'TYPE_STEEL': 15, 'TYPE_DARK': 16,
  'TYPE_DRAGON': 17, 'TYPE_MYSTERY': 18,
};

/** 1:1 décomp `BlitMenuInfoIcon(windowId, iconId, x, y)` (menu.c:2098).
 *  Blit l'icône `iconId` (= index dans sMenuInfoIcons) depuis le sheet
 *  gMenuInfoElements_Gfx (= preload _bagAssets.menuInfoGfx) à la position
 *  (x, y) du pixelBuffer du window. */
function BlitMenuInfoIcon(windowId: number, iconId: number, x: number, y: number): void {
  if (!_bagAssets) return;
  const icon = sMenuInfoIcons[iconId];
  if (!icon) return;
  // Offset en TILES dans sheet 16 tiles wide → (srcX, srcY) en pixels.
  const srcX = (icon.offset & 15) * 8;
  const srcY = (icon.offset >> 4) * 8;
  BlitBitmapRectToWindow(
    windowId, _bagAssets.menuInfoGfx,
    srcX, srcY, 128, 128,
    x, y, icon.width, icon.height,
  );
}

/** 1:1 décomp `PrepareTMHMMoveWindow` (item_menu.c:2551). Imprime les labels
 *  fixes (TYPE / PUISS. / PRÉC. / PP) dans WIN_TMHM_INFO_ICONS. Appelé une
 *  fois à case 18 du setup. */
function PrepareTMHMMoveWindow(): void {
  const wid = _win(WIN_TMHM_INFO_ICONS);
  FillWindowPixelBuffer(wid, PIXEL_FILL(0));
  BlitMenuInfoIcon(wid, MENU_INFO_ICON_TYPE,     0,  0);
  BlitMenuInfoIcon(wid, MENU_INFO_ICON_POWER,    0, 12);
  BlitMenuInfoIcon(wid, MENU_INFO_ICON_ACCURACY, 0, 24);
  BlitMenuInfoIcon(wid, MENU_INFO_ICON_PP,       0, 36);
  CopyWindowToVram(wid, 2 /* COPYWIN_GFX */);
}

/** 1:1 décomp `PrintTMHMMoveData(itemId)` (item_menu.c:2561). Imprime les
 *  valeurs (type icon + puiss + préc + PP) du move associé à l'item CT/CS,
 *  dans WIN_TMHM_INFO. ITEM_NONE → "---" partout (= cas swap dummy). */
function PrintTMHMMoveData(itemId: number): void {
  const wid = _win(WIN_TMHM_INFO);
  FillWindowPixelBuffer(wid, PIXEL_FILL(0));
  if (itemId === 0 /* ITEM_NONE */) {
    // 1:1 :2570-2572 — 4 lignes "---" (dummy).
    for (let i = 0; i < 4; i++) {
      BagMenu_Print(wid, FONT_NORMAL, '---', 7, i * 12, 0, 0, TEXT_SKIP_DRAW, COLORID_TMHM_INFO);
    }
    CopyWindowToVram(wid, 2);
    return;
  }
  // 1:1 :2576 move = ItemIdToBattleMoveId(itemId).
  const moveId = ItemIdToBattleMoveId(itemId); // = string 'MOVE_FOCUS_PUNCH' etc.
  const move = getMove(moveId);
  // 1:1 :2577 — type icon (= gBattleMoves[move].type + 1).
  const typeIdx = move ? (_TYPE_NAME_TO_ICON_IDX[move.type] ?? 0) : 0;
  if (typeIdx > 0) BlitMenuInfoIcon(wid, typeIdx, 0, 0);
  // 1:1 :2579-2589 power. Décomp : ConvertIntToDecimalStringN(gStringVar1, pw, RIGHT_ALIGN, 3)
  // (ou gText_ThreeDashes si pw<=1) puis BagMenu_Print(gStringVar1). TEXT_SKIP_DRAW = rendu
  // synchrone → réutilisation de gStringVar1 entre power/acc/pp sûre. "---" en littéral
  // (BagMenu_Print l'encode = byte-identique à gText_ThreeDashes).
  const pw = move?.power ?? 0;
  let pwText: string | Uint8Array;
  if (pw <= 1) { pwText = '---'; }
  else { ConvertIntToDecimalStringN(gStringVar1, pw, STR_CONV_MODE_RIGHT_ALIGN, 3); pwText = gStringVar1; }
  BagMenu_Print(wid, FONT_NORMAL, pwText, 7, 12, 0, 0, TEXT_SKIP_DRAW, COLORID_TMHM_INFO);
  // 1:1 :2591-2601 accuracy.
  const acc = move?.accuracy ?? 0;
  let accText: string | Uint8Array;
  if (acc === 0) { accText = '---'; }
  else { ConvertIntToDecimalStringN(gStringVar1, acc, STR_CONV_MODE_RIGHT_ALIGN, 3); accText = gStringVar1; }
  BagMenu_Print(wid, FONT_NORMAL, accText, 7, 24, 0, 0, TEXT_SKIP_DRAW, COLORID_TMHM_INFO);
  // 1:1 :2603-2605 pp.
  const pp = move?.pp ?? 0;
  ConvertIntToDecimalStringN(gStringVar1, pp, STR_CONV_MODE_RIGHT_ALIGN, 3);
  BagMenu_Print(wid, FONT_NORMAL, gStringVar1, 7, 36, 0, 0, TEXT_SKIP_DRAW, COLORID_TMHM_INFO);
  CopyWindowToVram(wid, 2);
}

/** Helper exporté pour bag-menu-ctx : affiche le panneau TM/HM (= remplace
 *  WIN_DESCRIPTION dans le ctx menu en poche TM/HM). 1:1 décomp item_menu.c
 *  :1653-1660. */
export function _CtxShowTMHMPanel(itemId: number): void {
  ClearWindowTilemap(_win(WIN_DESCRIPTION));
  PrintTMHMMoveData(itemId);
  PutWindowTilemap(_win(WIN_TMHM_INFO_ICONS));
  PutWindowTilemap(_win(WIN_TMHM_INFO));
  ScheduleBgCopyTilemapToVram(0);
}

/** 1:1 décomp SetupBagMenu case 19 : `BlendPalettes(PALETTES_ALL, 16, 0)`. */
function BlendPalettesBag(): void {
  BlendPalettes(PALETTES_ALL, 16, 0);
}
/** 1:1 décomp SetupBagMenu case 20 :
 *  `BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK)`. */
function BeginNormalPaletteFadeBag(): void {
  BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK);
}

// ─── BagDestroyPocketScrollArrowPair (item_menu.c:1043) — DÉFÉRÉ Phase 2 ─────
// (flèches non créées → rien à détruire ; no-op honnête tracké Phase 2). ──────
/** 1:1 décomp `BagDestroyPocketScrollArrowPair` (item_menu.c:1044). */
function BagDestroyPocketScrollArrowPair(): void {
  if (gBagMenu!.pocketScrollArrowsTask !== TASK_NONE) {
    RemoveScrollIndicatorArrowPair(gBagMenu!.pocketScrollArrowsTask);
    gBagMenu!.pocketScrollArrowsTask = TASK_NONE;
  }
  DestroyPocketSwitchArrowPair();
}

/** 1:1-sém décomp `FreeBagMenu` (item_menu.c:638) : Free(gBagMenu) +
 *  EWRAM ptr = NULL. Notre modèle : gBagMenu = null (GC = Free). */
function FreeBagMenu(): void {
  gBagMenu = null;
  // Reset le gate "graphics chargé en VRAM" — le terrain reprend BG2 quand
  // on ferme le sac, donc à la ré-ouverture il faut RE-écrire la VRAM (sinon
  // BG2 corrompu, tilemap absent, fond rayé visible). Les assets en mémoire
  // (_bagAssets) restent cachés — c'est juste le bit "déjà écrit en VRAM"
  // qu'il faut reset.
  _bagGraphicsReady = false;
  _bagGraphicsLoading = false;
}

/** 1:1 décomp `ChangeBagPocketId` (item_menu.c:1314) — wrap-around poche.
 *  Sémantique pointeur `u8 *bagPocketId` → valeur retournée (pattern
 *  menu-helpers ListPos : entrée/sortie par valeur, net-effect 1:1). */
function ChangeBagPocketId(bagPocketId: number, deltaBagPocketId: number): number {
  if (deltaBagPocketId === MENU_CURSOR_DELTA_RIGHT && bagPocketId === POCKETS_COUNT - 1)
    return 0;
  if (deltaBagPocketId === MENU_CURSOR_DELTA_LEFT && bagPocketId === 0)
    return POCKETS_COUNT - 1;
  return bagPocketId + deltaBagPocketId;
}

/** 1:1 décomp `CanSwapItems` (item_menu.c:1427). Le swap d'objets est permis
 *  uniquement en FIELD/BATTLE ET dans les poches NON-numérotées (= ni
 *  TM_HM ni BERRIES, qui ont leur ordre fixe Nº01..N défini par enum). */
function CanSwapItems(): boolean {
  if (gBagPosition.location === ITEMMENULOCATION_FIELD
   || gBagPosition.location === ITEMMENULOCATION_BATTLE) {
    if (gBagPosition.pocket !== TMHM_POCKET && gBagPosition.pocket !== BERRIES_POCKET)
      return true;
  }
  return false;
}

/** 1:1 décomp `StartItemSwap` (item_menu.c:1441). SELECT pressé sur item :
 *  marque la position d'origine (toSwapPos), affiche "Où voulez-vous placer
 *  X ?", grise le cursor liste, et bascule la task en Task_HandleSwapping
 *  ItemsInput pour gérer la nouvelle position. */
function StartItemSwap(task: DecompTask): void {
  // 1:1 :1445 ListMenuSetTemplateField(LISTFIELD_CURSORKIND, CURSOR_INVISIBLE) —
  // masque le cursor du list-menu pour qu'il ne bouge pas avec UP/DOWN
  // (= cursor liste figé en gris à la position FROM, seule la swap line bouge).
  ListMenuSetTemplateField(task.data[T_LIST_TASK_ID], LISTFIELD_CURSORKIND, CURSOR_INVISIBLE);
  const pocket = gBagPosition.pocket;
  const pos = gBagPosition.scrollPosition[pocket] + gBagPosition.cursorPosition[pocket];
  task.data[T_LIST_POSITION] = pos;
  if (gBagMenu) gBagMenu.toSwapPos = pos;
  // 1:1 :1448-1451 message "Où voulez-vous placer X ?"
  const itemId = BagGetItemIdByPocketPosition(pocket + 1, pos);
  setStringVar(1, GetItemName(itemId));
  StringExpandPlaceholders(gStringVar4, encodeOwText(getString('gText_MoveVar1Where')));
  const msg = gStringVar4;
  const wid = _win(WIN_DESCRIPTION);
  FillWindowPixelBuffer(wid, PIXEL_FILL(0));
  BagMenu_Print(wid, FONT_NORMAL, msg, 3, 1, 0, 0, 0, COLORID_NORMAL);
  // 1:1 :1452 — révèle la swap line + position à la cursorRow courante.
  SetItemMenuSwapLineInvisibility(false);
  UpdateItemMenuSwapLinePos(gBagPosition.cursorPosition[gBagPosition.pocket]);
  // 1:1 :1453 DestroyPocketSwitchArrowPair (chevrons L/R désactivés pendant le swap).
  DestroyPocketSwitchArrowPair();
  // 1:1 :1454 cursor liste en GRAY (signal "mode swap actif").
  BagMenu_PrintCursor(task.data[T_LIST_TASK_ID], COLORID_GRAY_CURSOR);
  task.func = Task_HandleSwappingItemsInput;
}

/** 1:1 décomp `Task_HandleSwappingItemsInput` (item_menu.c:1458). Pendant
 *  le swap : input SELECT re-déclenche DoItemSwap à la position courante,
 *  UP/DOWN bouge le cursor (sans changer scroll = la liste se "feuillete"
 *  visuellement), A confirme à la nouvelle position, B cancel. */
function Task_HandleSwappingItemsInput(task: DecompTask): void {
  if (JOY_NEW(SELECT_BUTTON)) {
    PlaySE(SE_SELECT);
    const sr = ListMenuGetScrollAndRow(task.data[T_LIST_TASK_ID]);
    gBagPosition.scrollPosition[gBagPosition.pocket] = sr.scrollOffset;
    gBagPosition.cursorPosition[gBagPosition.pocket] = sr.selectedRow;
    DoItemSwap(task);
    return;
  }
  const input = ListMenu_ProcessInput(task.data[T_LIST_TASK_ID]);
  const sr = ListMenuGetScrollAndRow(task.data[T_LIST_TASK_ID]);
  gBagPosition.scrollPosition[gBagPosition.pocket] = sr.scrollOffset;
  gBagPosition.cursorPosition[gBagPosition.pocket] = sr.selectedRow;
  // 1:1 :1474-1475 — chaque frame du swap : maj swap line à la cursorRow.
  SetItemMenuSwapLineInvisibility(false);
  UpdateItemMenuSwapLinePos(gBagPosition.cursorPosition[gBagPosition.pocket]);
  switch (input) {
    case LIST_NOTHING_CHOSEN:
      break;
    case LIST_CANCEL:
      PlaySE(SE_SELECT);
      // 1:1 :1482 : A en même temps que B → DoItemSwap (= confirmer aussi par A).
      if (JOY_NEW(A_BUTTON)) DoItemSwap(task);
      else CancelItemSwap(task);
      break;
    default: // A_BUTTON sur item (= confirmer position)
      PlaySE(SE_SELECT);
      DoItemSwap(task);
      break;
  }
}

/** 1:1 décomp `DoItemSwap` (item_menu.c:1496). Si la nouvelle position est
 *  identique (ou juste avant, cf. décomp special-case "to=realPos-1") on
 *  cancel ; sinon on MoveItemSlotInList + rebuild la liste + adj cursor. */
function DoItemSwap(task: DecompTask): void {
  const pocket = gBagPosition.pocket;
  const realPos = gBagPosition.scrollPosition[pocket] + gBagPosition.cursorPosition[pocket];
  const fromPos = task.data[T_LIST_POSITION];
  if (fromPos === realPos || fromPos === realPos - 1) {
    CancelItemSwap(task);
    return;
  }
  // 1:1 :1510 MoveItemSlotInList(gBagPockets[pocket].itemSlots, from, to).
  MoveItemSlotInList(getBagPocketSlots(pocket), fromPos, realPos);
  if (gBagMenu) gBagMenu.toSwapPos = NOT_SWAPPING;
  // 1:1 :1512 DestroyListMenuTask → rebuild via LoadBagItemListBuffers +
  // ListMenuInit (= la liste se re-imprime avec le nouvel ordre).
  const sr = DestroyListMenuTask(task.data[T_LIST_TASK_ID]);
  gBagPosition.scrollPosition[pocket] = sr.scrollOffset;
  gBagPosition.cursorPosition[pocket] = sr.selectedRow;
  if (fromPos < realPos) gBagPosition.cursorPosition[pocket]--;
  LoadBagItemListBuffers(pocket);
  task.data[T_LIST_TASK_ID] = ListMenuInitForBag(
    gBagPosition.scrollPosition[pocket],
    gBagPosition.cursorPosition[pocket],
  );
  // 1:1 :1517 SetItemMenuSwapLineInvisibility(TRUE) — cache la barre swap.
  SetItemMenuSwapLineInvisibility(true);
  // 1:1 :1518 CreatePocketSwitchArrowPair (= chevrons L/R restored).
  CreatePocketSwitchArrowPair();
  task.func = Task_BagMenu_HandleInput;
}

/** 1:1 décomp `CancelItemSwap` (item_menu.c:1523). Annule le swap sans
 *  déplacer : rebuild la liste à l'ordre actuel + restore Task_BagMenu_HandleInput. */
function CancelItemSwap(task: DecompTask): void {
  const pocket = gBagPosition.pocket;
  if (gBagMenu) gBagMenu.toSwapPos = NOT_SWAPPING;
  const sr = DestroyListMenuTask(task.data[T_LIST_TASK_ID]);
  gBagPosition.scrollPosition[pocket] = sr.scrollOffset;
  gBagPosition.cursorPosition[pocket] = sr.selectedRow;
  const fromPos = task.data[T_LIST_POSITION];
  if (fromPos < gBagPosition.scrollPosition[pocket] + gBagPosition.cursorPosition[pocket])
    gBagPosition.cursorPosition[pocket]--;
  LoadBagItemListBuffers(pocket);
  task.data[T_LIST_TASK_ID] = ListMenuInitForBag(
    gBagPosition.scrollPosition[pocket],
    gBagPosition.cursorPosition[pocket],
  );
  // 1:1 :1535 SetItemMenuSwapLineInvisibility(TRUE).
  SetItemMenuSwapLineInvisibility(true);
  CreatePocketSwitchArrowPair();
  task.func = Task_BagMenu_HandleInput;
}

/** 1:1 décomp `GetLRKeysPressed` (menu_helpers.c) :
 *  `if (JOY_NEW(L_BUTTON)) return MENU_L_PRESSED;
 *   if (JOY_NEW(R_BUTTON)) return MENU_R_PRESSED; return 0;`
 *  Port local (l'auto-transpilé menu_helpers-all-auto renvoyait NONE au
 *  runtime = bouton épaule mort ; même classe que bg-all-auto cassé). */
function GetLRKeysPressed(): number {
  if (JOY_NEW(L_BUTTON)) return MENU_L_PRESSED;
  if (JOY_NEW(R_BUTTON)) return MENU_R_PRESSED;
  return 0; // MENU_NOTHING_PRESSED
}

/** 1:1 décomp `GetSwitchBagPocketDirection` (item_menu.c:1295). Link non
 *  modélisé (cf. convention fichier) ; GetLRKeysPressed/JOY_NEW réels. */
function GetSwitchBagPocketDirection(): number {
  if (gBagMenu!.pocketSwitchDisabled)
    return SWITCH_POCKET_NONE;
  const LRKeys = GetLRKeysPressed();
  if (JOY_NEW(DPAD_LEFT) || LRKeys === MENU_L_PRESSED) {
    PlaySE(SE_SELECT);
    return SWITCH_POCKET_LEFT;
  }
  if (JOY_NEW(DPAD_RIGHT) || LRKeys === MENU_R_PRESSED) {
    PlaySE(SE_SELECT);
    return SWITCH_POCKET_RIGHT;
  }
  return SWITCH_POCKET_NONE;
}

// MenuHelpers_IsLinkActive : RELOCALISÉ dans le miroir `src/game/menu_helpers.ts`
// (1:1 menu_helpers.c:298, single-player → false), importé en tête.

// SetBagVisualPocketId : PORTÉ 1:1 Phase 2 (item_menu_icons.c:446) →
// importé de bag-menu-icons.ts ↑. Appel SwitchBagPocket inchangé.

// AddSwitchPocketRotatingBallSprite : PORTÉ 1:1 Phase 2 (item_menu_icons.c:497)
// → importé de bag-menu-icons.ts ↑. Appel SwitchBagPocket inchangé.

/** 1:1 décomp `SwitchBagPocket` (item_menu.c:1324) — VRAI 1:1, anim 16-frame.
 *  Lance l'animation slide en transformant la task courante en
 *  `Task_SwitchBagPocket` via `SetTaskFuncWithFollowupFunc` (= la task
 *  reprendra sa fonction normale après l'anim grâce à `SwitchTaskToFollowup
 *  Func`). NE COMMIT PAS gBagPosition.pocket ici (= Task_SwitchBagPocket le
 *  fait dans son state 1, fin de slide). */
function SwitchBagPocket(taskId: number, deltaBagPocketId: number, skipEraseList: boolean): void {
  const t = _task(taskId);
  if (!t) return;
  // :1326 s16 *data = gTasks[taskId].data ; :1329-1331 reset task-data anim.
  t.data[T_POCKET_SWITCH_STATE] = 0;
  t.data[T_POCKET_SWITCH_TIMER] = 0;
  t.data[T_POCKET_SWITCH_DIR] = deltaBagPocketId;

  if (!skipEraseList) {
    // :1334-1340
    ClearWindowTilemap(_win(WIN_ITEM_LIST));
    ClearWindowTilemap(_win(WIN_DESCRIPTION));
    const sr = DestroyListMenuTask(t.data[T_LIST_TASK_ID]);
    gBagPosition.scrollPosition[gBagPosition.pocket] = sr.scrollOffset;
    gBagPosition.cursorPosition[gBagPosition.pocket] = sr.selectedRow;
    ScheduleBgCopyTilemapToVram(0);
    // :1338 `gSprites[…ITEMMENUSPRITE_ITEM + (itemIconSlot ^ 1)].invisible = TRUE`
    // — cache l'icône objet de l'AUTRE slot pendant le slide (le slot courant
    // reste visible). itemIconSlot ∈ {0,1} ; ^1 = l'autre.
    if (gBagMenu) {
      const otherIconSpriteId = gBagMenu.spriteIds[ITEMMENUSPRITE_ITEM + (gBagMenu.itemIconSlot ^ 1)];
      const rt = getRuntime();
      if (rt && otherIconSpriteId !== SPRITE_NONE)
        rt.setSpriteInvisible(otherIconSpriteId, true);
    }
    BagDestroyPocketScrollArrowPair();
  }

  // :1341-1342 newPocket = local copy puis wrap-around (NE PAS muter
  // gBagPosition.pocket — l'anim fait ça en state 1).
  const newPocket = ChangeBagPocketId(gBagPosition.pocket, deltaBagPocketId);

  // :1343-1352 deux noms côte-à-côte + slide initial selon direction.
  if (deltaBagPocketId === MENU_CURSOR_DELTA_RIGHT) {
    PrintPocketNames(
      _pocketName(gBagPosition.pocket),
      _pocketName(newPocket),
    );
    CopyPocketNameToWindow(0); // commence à gauche, slide vers droite
  } else {
    PrintPocketNames(
      _pocketName(newPocket),
      _pocketName(gBagPosition.pocket),
    );
    CopyPocketNameToWindow(8); // commence à droite, slide vers gauche
  }

  // :1353-1354 indicateurs de poche : éteindre l'ancienne, allumer la nouvelle.
  DrawPocketIndicatorSquare(gBagPosition.pocket, false);
  DrawPocketIndicatorSquare(newPocket, true);

  // :1355-1356 rangée fond clair init (effacée puis re-dessinée par
  // Task_SwitchBagPocket via DrawItemListBgRow row-by-row).
  FillBgTilemapBufferRect_Palette0(2, 11, 14, 2, 15, 16);
  ScheduleBgCopyTilemapToVram(2);

  // :1357-1359 sprite sac (T9) + ball rotative (T10).
  SetBagVisualPocketId(newPocket, true);
  RemoveBagSprite(ITEMMENUSPRITE_BALL);
  AddSwitchPocketRotatingBallSprite(deltaBagPocketId);

  // :1360 transforme la task en anim ; la func normale (Task_BagMenu_HandleInput
  // ou variant) sera restaurée à la fin du slide par SwitchTaskToFollowupFunc.
  const oldFunc = t.func!;
  SetTaskFuncWithFollowupFunc(taskId, Task_SwitchBagPocket, oldFunc);
}

/** 1:1 décomp `Task_SwitchBagPocket` (item_menu.c:1363) — anim slide 16 frames.
 *  state 0 (16 frames) : DrawItemListBgRow(timer) repeint le fond clair rangée-
 *  par-rangée, et toutes les 2 frames CopyPocketNameToWindow(timer>>1) slide
 *  le nom (= "OBJETS" → "POKé BALLS"). state 1 : commit gBagPosition.pocket,
 *  rebuild la liste de la nouvelle poche, remet les flèches, restaure la
 *  task normale via SwitchTaskToFollowupFunc.
 *
 *  Early-out (:1367-1382) : si LR pressé PENDANT l'anim, on commit la poche
 *  intermédiaire et on relance immédiatement un nouveau slide (= chain rapide
 *  des poches en maintenant LR). Le `IsWallysBag()` désactive ça pour Wally. */
function Task_SwitchBagPocket(task: DecompTask): void {
  // :1367-1382 early-out LR pressé pendant l'anim → chain.
  if (!MenuHelpers_IsLinkActive() && !IsWallysBag()) {
    const dir = GetSwitchBagPocketDirection();
    if (dir === SWITCH_POCKET_LEFT) {
      gBagPosition.pocket = ChangeBagPocketId(gBagPosition.pocket, task.data[T_POCKET_SWITCH_DIR]);
      SwitchTaskToFollowupFunc(task.taskId);
      SwitchBagPocket(task.taskId, MENU_CURSOR_DELTA_LEFT, true);
      return;
    }
    if (dir === SWITCH_POCKET_RIGHT) {
      gBagPosition.pocket = ChangeBagPocketId(gBagPosition.pocket, task.data[T_POCKET_SWITCH_DIR]);
      SwitchTaskToFollowupFunc(task.taskId);
      SwitchBagPocket(task.taskId, MENU_CURSOR_DELTA_RIGHT, true);
      return;
    }
  }
  // :1383-1407 state machine de l'anim.
  if (task.data[T_POCKET_SWITCH_STATE] === 0) {
    // :1386 DrawItemListBgRow(timer) (= rangée y=timer du fond clair).
    DrawItemListBgRow(task.data[T_POCKET_SWITCH_TIMER]);
    // :1387 ++tPocketSwitchTimer en pre-incr puis check parité.
    task.data[T_POCKET_SWITCH_TIMER]++;
    if (!(task.data[T_POCKET_SWITCH_TIMER] & 1)) {
      // :1388-1392 slide du nom toutes les 2 frames.
      if (task.data[T_POCKET_SWITCH_DIR] === MENU_CURSOR_DELTA_RIGHT)
        CopyPocketNameToWindow(task.data[T_POCKET_SWITCH_TIMER] >> 1);
      else
        CopyPocketNameToWindow(8 - (task.data[T_POCKET_SWITCH_TIMER] >> 1));
    }
    if (task.data[T_POCKET_SWITCH_TIMER] === 16)
      task.data[T_POCKET_SWITCH_STATE]++;
  } else if (task.data[T_POCKET_SWITCH_STATE] === 1) {
    // :1398 commit du changement de poche (reporté depuis SwitchBagPocket).
    gBagPosition.pocket = ChangeBagPocketId(gBagPosition.pocket, task.data[T_POCKET_SWITCH_DIR]);
    // :1399-1400 rebuild liste de la nouvelle poche.
    LoadBagItemListBuffers(gBagPosition.pocket);
    task.data[T_LIST_TASK_ID] = ListMenuInit(
      gMultiuseListMenuTemplate,
      gBagPosition.scrollPosition[gBagPosition.pocket],
      gBagPosition.cursorPosition[gBagPosition.pocket],
    );
    // :1401-1403
    PutWindowTilemap(_win(WIN_DESCRIPTION));
    PutWindowTilemap(_win(WIN_POCKET_NAME));
    ScheduleBgCopyTilemapToVram(0);
    // :1404-1405 flèches reposées.
    CreatePocketScrollArrowPair();
    CreatePocketSwitchArrowPair();
    // :1406 restaure la func normale (Task_BagMenu_HandleInput).
    SwitchTaskToFollowupFunc(task.taskId);
  }
}

/** 1:1 décomp `Task_FadeAndCloseBagMenu` (item_menu.c:1077). Exporté pour
 *  `SetUpItemUseCallback` (item-use-callbacks.ts) qui set `gBagMenu.
 *  newScreenCallback` avant de scheduler ce fade. */
export function Task_FadeAndCloseBagMenu(task: DecompTask): void {
  BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);
  task.func = Task_CloseBagMenu;
}

/** 1:1 décomp `Task_CloseBagMenu` (item_menu.c:1083). newScreenCallback
 *  (give-item flow) sinon exitCallback (retour terrain). */
function Task_CloseBagMenu(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || rt.gPaletteFade.active) return;
  const sr = DestroyListMenuTask(task.data[T_LIST_TASK_ID]);
  gBagPosition.scrollPosition[gBagPosition.pocket] = sr.scrollOffset;
  gBagPosition.cursorPosition[gBagPosition.pocket] = sr.selectedRow;
  const newScreen = gBagMenu?.newScreenCallback ?? null;
  const exitCb = newScreen ?? gBagPosition.exitCallback;
  BagDestroyPocketScrollArrowPair();
  ResetSpriteData();
  FreeAllSpritePalettes();
  FreeBagMenu();
  if (exitCb) rt.SetMainCallback2(exitCb);
  else rt.SetMainCallback2(null);
  rt.DestroyTask(task.taskId);
}

/** 1:1 décomp item_menu.c:1663-1666 (section "X est sélectionné." dans
 *  OpenContextMenu). Imprime le message dans WIN_DESCRIPTION (= remplace la
 *  description normale tant que le ctx menu est affiché). Helper exporté
 *  pour bag-menu-ctx (évite cycle d'import). */
export function _CtxPrintItemSelected(itemId: number): void {
  setStringVar(1, GetItemName(itemId));
  StringExpandPlaceholders(gStringVar4, encodeOwText(getString('gText_Var1IsSelected')));
  const msg = gStringVar4;
  const wid = _win(WIN_DESCRIPTION);
  FillWindowPixelBuffer(wid, PIXEL_FILL(0));
  BagMenu_Print(wid, FONT_NORMAL, msg, 3, 1, 0, 0, 0, COLORID_NORMAL);
}

/** Helper exporté pour bag-menu-ctx : print un message arbitraire dans
 *  WIN_DESCRIPTION (= remplace temporairement la description normale ou
 *  "X est sélectionné."). Utilisé par les handlers ItemMenu_UseOutOfBattle
 *  stubs (= "Hmm, c'est pas le moment", "[handler] à porter"). */
export function _CtxPrintItemMessage(msg: string): void {
  const wid = _win(WIN_DESCRIPTION);
  FillWindowPixelBuffer(wid, PIXEL_FILL(0));
  BagMenu_Print(wid, FONT_NORMAL, msg, 3, 1, 0, 0, 0, COLORID_NORMAL);
  ScheduleBgCopyTilemapToVram(0);
}

/** 1:1 décomp `RemoveUsedItem` (item_use.c:824). Decrement bag item count
 *  + update pocket list. Helper utilisé par les handlers item-use qui
 *  consomment un item (Repel, Medicine, Bike-consommable... pas Bike key). */
export function _CtxRemoveUsedItem(itemId: number): void {
  const itemKey = getItemKeyById(itemId);
  // getItemKeyById retourne ITEM_TM01/ITEM_HM01 enum-numbered. Pour bag.ts
  // RemoveBagItem, on a besoin de la clé items.json (move-named pour TM/HM).
  // bag-pockets gère ça via slotItemId/itemKey, on passe l'enum-numbered.
  // RemoveBagItem cherche par itemKey dans gSaveBlock1Ptr.bag.pockets, qui est
  // stocké move-named. Soit on convertit, soit on accepte l'asymétrie :
  // POUR L'INSTANT on tente l'enum direct ; si bug → port _itemKeyForLookup.
  // Pour items normales (POTION etc.) c'est identique.
  RemoveBagItem(itemKey, 1);
}

/** Version de `_CtxReturnToList` qui rebuild aussi la liste (= post-use de
 *  l'item, la quantité a baissé / item a disparu). Appelé par les handlers
 *  qui consomment un item (Repel, etc.). */
export function _CtxReturnToListWithRebuild(taskId: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const task = rt.gTasks[taskId];
  if (!task) return;
  // Rebuild la liste via DestroyListMenuTask + LoadBagItemListBuffers +
  // ListMenuInit (= 1:1 décomp DoItemSwap restore pattern).
  const sr = DestroyListMenuTask(task.data[T_LIST_TASK_ID]);
  gBagPosition.scrollPosition[gBagPosition.pocket] = sr.scrollOffset;
  gBagPosition.cursorPosition[gBagPosition.pocket] = sr.selectedRow;
  LoadBagItemListBuffers(gBagPosition.pocket);
  task.data[T_LIST_TASK_ID] = ListMenuInitForBag(
    gBagPosition.scrollPosition[gBagPosition.pocket],
    gBagPosition.cursorPosition[gBagPosition.pocket],
  );
  // Restore standard.
  _CtxReturnToList(taskId);
}

/** Rebuild de la liste affichée APRÈS une vente, SANS restaurer la description
 *  (≠ `_CtxReturnToListWithRebuild`) : le message "Cédé X contre Y" doit rester
 *  visible jusqu'au A/B de WaitAfterItemSell. 1:1 décomp `SellItem` (item_menu.c:2174)
 *  corps liste : DestroyListMenuTask + UpdatePocketItemList + UpdatePocketListPosition
 *  + LoadBagItemListBuffers + ListMenuInit + BagMenu_PrintCursor(GRAY). */
export function _CtxRebuildListKeepMessage(taskId: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const task = rt.gTasks[taskId];
  if (!task) return;
  const sr = DestroyListMenuTask(task.data[T_LIST_TASK_ID]);
  gBagPosition.scrollPosition[gBagPosition.pocket] = sr.scrollOffset;
  gBagPosition.cursorPosition[gBagPosition.pocket] = sr.selectedRow;
  UpdatePocketItemList(gBagPosition.pocket);
  UpdatePocketListPosition(gBagPosition.pocket);
  LoadBagItemListBuffers(gBagPosition.pocket);
  task.data[T_LIST_TASK_ID] = ListMenuInitForBag(
    gBagPosition.scrollPosition[gBagPosition.pocket],
    gBagPosition.cursorPosition[gBagPosition.pocket],
  );
  BagMenu_PrintCursor(task.data[T_LIST_TASK_ID], COLORID_GRAY_CURSOR);
}

/** 1:1 décomp `ReturnToItemList` (item_menu.c:1284) + restore section de
 *  `ItemMenu_Cancel` (:1985-1994). Appelé par bag-menu-ctx après un
 *  cancel/use pour remettre le sac dans l'état "navigation liste" :
 *   - cursor liste en COLORID_NORMAL (= sortie de l'état "GRAY pendant ctx") ;
 *   - description re-imprimée (au cas où WIN_DESCRIPTION a été clear) ;
 *   - flèches scroll + chevrons L/R recréées (= détruites à l'ouverture ctx) ;
 *   - task.func ← Task_BagMenu_HandleInput.
 *  Exporté pour être appelé depuis bag-menu-ctx.ts (évite cycle d'import). */
export function _CtxReturnToList(taskId: number): void {
  const rt = getRuntime();
  if (!rt) return;
  const task = rt.gTasks[taskId];
  if (!task) return;
  // 1:1 :1288-1290 ReturnToItemList : cache panneau TMHM + restore description.
  ClearWindowTilemap(_win(WIN_TMHM_INFO_ICONS));
  ClearWindowTilemap(_win(WIN_TMHM_INFO));
  PutWindowTilemap(_win(WIN_DESCRIPTION));
  // 1:1 :1990-1993 ItemMenu_Cancel restore :
  PrintItemDescription(task.data[T_LIST_POSITION]);
  ScheduleBgCopyTilemapToVram(0);
  ScheduleBgCopyTilemapToVram(1);
  BagMenu_PrintCursor(task.data[T_LIST_TASK_ID], COLORID_NORMAL);
  // 1:1 :1286-1287 ReturnToItemList :
  CreatePocketScrollArrowPair();
  CreatePocketSwitchArrowPair();
  // 1:1 :1292 task.func = Task_BagMenu_HandleInput.
  task.func = Task_BagMenu_HandleInput;
}

/** 1:1 décomp `Task_BagMenu_HandleInput` (item_menu.c:1221). Link non
 *  modélisé → MenuHelpers_ShouldWaitForLinkRecv()==FALSE (convention
 *  fichier). SELECT swap = CanSwapItems()==FALSE (étape 7, no-op honnête).
 *  A_BUTTON ctx-menu : pose gSpecialVar_ItemId + dispatch
 *  sContextMenuFuncs[location] (= Task_ItemContext_Normal pour FIELD/BATTLE,
 *  branche déférée pour les autres locations). */
function Task_BagMenu_HandleInput(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || rt.gPaletteFade.active) return;
  switch (GetSwitchBagPocketDirection()) {
    case SWITCH_POCKET_LEFT:
      SwitchBagPocket(task.taskId, MENU_CURSOR_DELTA_LEFT, false);
      return;
    case SWITCH_POCKET_RIGHT:
      SwitchBagPocket(task.taskId, MENU_CURSOR_DELTA_RIGHT, false);
      return;
    default:
      if (JOY_NEW(SELECT_BUTTON)) {
        // 1:1 décomp item_menu.c:1252-1257 — SELECT déclenche StartItemSwap
        // si CanSwapItems (= FIELD/BATTLE non-TMHM/BERRIES). Sinon no-op.
        if (CanSwapItems()) {
          const sr = ListMenuGetScrollAndRow(task.data[T_LIST_TASK_ID]);
          gBagPosition.scrollPosition[gBagPosition.pocket] = sr.scrollOffset;
          gBagPosition.cursorPosition[gBagPosition.pocket] = sr.selectedRow;
          StartItemSwap(task);
        }
        return;
      }
      break;
  }
  const listPosition = ListMenu_ProcessInput(task.data[T_LIST_TASK_ID]);
  const sr = ListMenuGetScrollAndRow(task.data[T_LIST_TASK_ID]);
  gBagPosition.scrollPosition[gBagPosition.pocket] = sr.scrollOffset;
  gBagPosition.cursorPosition[gBagPosition.pocket] = sr.selectedRow;
  switch (listPosition) {
    case LIST_NOTHING_CHOSEN:
      break;
    case LIST_CANCEL:
      // BERRY_BLENDER_CRUSH SE_FAILURE = maillon berry-blender (déféré).
      PlaySE(SE_SELECT);
      // 1:1 :1264 gSpecialVar_ItemId = ITEM_NONE — script give-item flow
      // (étape 7+) ; le retour-terrain ne le lit pas → déféré honnête.
      gSpecialVar.ItemId = 0; // ITEM_NONE
      task.func = Task_FadeAndCloseBagMenu;
      break;
    default: {
      // 1:1 décomp item_menu.c:1271-1279 — A_BUTTON sur un item :
      //   PlaySE(SE_SELECT) ; BagDestroyPocketScrollArrowPair() ;
      //   BagMenu_PrintCursor(tListTaskId, COLORID_GRAY_CURSOR) ;
      //   tListPosition = listPosition ; tQuantity = BagGetQuantity… ;
      //   gSpecialVar_ItemId = BagGetItemId… ; sContextMenuFuncs[location](taskId).
      PlaySE(SE_SELECT);
      BagDestroyPocketScrollArrowPair();
      BagMenu_PrintCursor(task.data[T_LIST_TASK_ID], 2 /* COLORID_GRAY_CURSOR */);
      task.data[T_LIST_POSITION] = listPosition;
      task.data[T_QUANTITY] = BagGetQuantityByPocketPosition(gBagPosition.pocket + 1, listPosition);
      gSpecialVar.ItemId = BagGetItemIdByPocketPosition(gBagPosition.pocket + 1, listPosition);
      // 1:1 :1278 dispatch — `sContextMenuFuncs[gBagPosition.location](taskId)`.
      // BERRY_TREE (sContextMenuFuncs, item_menu.c:349) = Task_FadeAndCloseBagMenu :
      // gSpecialVar_ItemId est déjà posé ci-dessus → fade + close → exitCallback
      // CB2_ReturnToFieldContinueScript reprend le script de plantation. Les autres
      // locations (FIELD/BATTLE/PARTY/SHOP/...) → Task_ItemContext_Normal (+ followup
      // pour le retour cancel vers la liste).
      if (gBagPosition.location === ITEMMENULOCATION_BERRY_TREE) {
        task.func = Task_FadeAndCloseBagMenu;
      } else if (gBagPosition.location === ITEMMENULOCATION_SHOP) {
        // 1:1 sContextMenuFuncs[ITEMMENULOCATION_SHOP] = Task_ItemContext_Sell
        // (item_menu.c:348) — A sur un item en mode vente VEND (pas de menu Use/Give/Toss).
        SetTaskFuncWithFollowupFunc(task.taskId, Task_ItemContext_Sell, Task_BagMenu_HandleInput);
      } else {
        SetTaskFuncWithFollowupFunc(task.taskId, Task_ItemContext_Normal, Task_BagMenu_HandleInput);
      }
      break;
    }
  }
}

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
