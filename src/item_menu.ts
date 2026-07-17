/**
 * item_menu.ts — miroir 1:1 de `src/item_menu.c` (décomp pokeemeraude, 2609 l) : SAC.
 * CONSOLIDATION (2026-06-29) des 2 fichiers éclatés bag-menu.ts (écran SAC, liste
 * + poches) + bag-menu-ctx.ts (menu contextuel UTILIS./DONNER/JETER par poche).
 * Les 2 s'importaient MUTUELLEMENT (cycle) -> fusion = cycle éliminé (refs internes).
 * 4 constantes dupliquées (ITEMMENULOCATION_BATTLE/FIELD, RGB_BLACK, WINDOW_NONE,
 * value-identiques) dédupliquées (gardées depuis bag-menu). Source : src/item_menu.c.
 */
import { getRuntime, ResetPaletteFade, ResetTasks, FreeAllSpritePalettes, ScanlineEffect_Stop, LoadPalette, assetCache, PlaySE } from '../harness/runtime/decomp-globals';
import { PIXEL_FILL } from './window';
import { PLTT_SIZE_4BPP } from '../harness/runtime/decomp-bridge';
import { ListMenuLoadStdPalAt, DrawDialogFrameWithCustomTileAndPalette } from './menu';
import { getBagPocketSlots, getBagPocketCapacity, slotItemId, MoveItemSlotInList, CompactItemsInBagPocket, SortBerriesOrTMHMs, BagGetItemIdByPocketPosition, BagGetQuantityByPocketPosition } from './item';
import { SetCursorWithinListBounds, SetCursorScrollWithinListBounds, MenuHelpers_IsLinkActive, type ListPos } from './menu_helpers';
import { gMultiuseListMenuTemplate, LIST_CANCEL, LIST_NO_MULTIPLE_SCROLL, CURSOR_BLACK_ARROW, CURSOR_INVISIBLE, LISTFIELD_CURSORKIND, gText_SelectorArrow2, ListMenuGetYCoordForPrintingArrowCursor, ListMenuSetTemplateField, type ListMenuTemplate, type ListMenu } from './list_menu';
import { getItemKeyById, loadConstantsTable, isConstantsLoaded } from '../harness/runtime/data-tables';
import { ItemIdToBattleMoveId } from './party_menu';
import { getMoveName, getMove } from './engine/data/game-data';
import { GetItemName, GetItemDescription, GetItemImportance, GetItemBattleFunc, AddPCItem, GetBagItemKey } from './item';
import { ItemIsMail } from './mail_data';
import { STR_CONV_MODE_LEADING_ZEROS, STR_CONV_MODE_RIGHT_ALIGN, STR_CONV_MODE_LEFT_ALIGN, ConvertIntToDecimalStringN, gStringVar1 } from '../include/string_util';
import { setStringVar, encodeOwText } from '../include/text';
import { gStringVar4, gStringVar2 } from '../include/string_util';
import { getString } from '../harness/runtime/decomp-strings';
import { ShowBg, InitWindows, FillWindowPixelBuffer, PutWindowTilemap, ResetVramOamAndBgCntRegs, ResetAllBgsCoordinates, ScheduleBgCopyTilemapToVram, FillWindowPixelRect, FillBgTilemapBufferRect_Palette0, CopyWindowToVram, BlitBitmapToWindow, AddWindow, RemoveWindow, GetWindowPixelBuffer, MarkWindowDirty, ClearWindowTilemap, BlitBitmapRectToWindow, type WindowTemplate } from './window';
import { LoadUserWindowBorderGfx, LoadMessageBoxGfx } from './text_window';
import { DeactivateAllTextPrinters, FONT_NARROW, FONT_NORMAL, GetMenuCursorDimensionByFont, GetStringRightAlignXOffset, TEXT_SKIP_DRAW } from './text';
import { AddTextPrinterParameterized4, AddTextPrinterParameterized2 } from './menu';
import { StringExpandPlaceholders } from '../include/string_util';
import { TEXT_COLOR_TRANSPARENT, TEXT_COLOR_WHITE, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_LIGHT_GRAY, TEXT_COLOR_RED, TEXT_COLOR_GREEN, TEXT_DYNAMIC_COLOR_1, TEXT_DYNAMIC_COLOR_5 } from '../include/constants/characters';
import { BG_PLTT_ID } from '../harness/runtime/decomp-runtime';
import { loadTileBin, loadTilemapBin, loadGbaPal } from '../harness/gba/png-loader';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from './engine/save/save-block-state';
import { ReadMail } from './mail';
import type { Mail } from './engine/save/save-blocks';
import { MALE } from '../harness/runtime/decomp-globals';
import { ENUM_ITEMMENULOCATION_0, ENUM_ITEMWIN_1, ENUM_ITEMMENUSPRITE_2, ITEMMENU_SWAP_LINE_LENGTH } from '../include/item_menu';
import { ITEMS_POCKET, BALLS_POCKET, TMHM_POCKET, BERRIES_POCKET, KEYITEMS_POCKET, POCKETS_COUNT } from '../include/constants/item';
import { BG_SCREEN_SIZE } from '../include/gba/defines';
import { ITEM_NONE, ITEM_LIST_END, ITEM_HM01, ITEM_HM08, ITEM_TM01, ITEM_CHERI_BERRY, ITEM_MACH_BIKE, ITEM_ACRO_BIKE, BAG_ITEM_CAPACITY_DIGITS, BERRY_CAPACITY_DIGITS } from '../include/constants/items';
import { SE_SELECT, SE_PC_LOGIN } from '../include/constants/songs';
import { JOY_NEW, BlendPalettes, PALETTES_ALL, LoadCompressedSpriteSheet, LoadSpritePalette } from '../harness/runtime/decomp-globals';
import { SetTaskFuncWithFollowupFunc, SwitchTaskToFollowupFunc } from './task';
import { BeginNormalPaletteFade } from './palette';
import { ResetSpriteData } from './sprite';
import { ListMenuInit, ListMenu_ProcessInput, ListMenuGetScrollAndRow, DestroyListMenuTask, LIST_NOTHING_CHOSEN, DPAD_LEFT, DPAD_RIGHT } from './list_menu';
import { GetStringCenterAlignXOffset } from './text';
import { MENU_L_PRESSED, MENU_R_PRESSED } from '../include/menu_helpers';
import { MENU_CURSOR_DELTA_LEFT, MENU_CURSOR_DELTA_RIGHT } from '../include/menu';
import { SELECT_BUTTON, L_BUTTON, R_BUTTON, A_BUTTON } from '../include/gba/io_reg';
import type { DecompTask } from '../harness/runtime/decomp-runtime';
import { CB2_ReturnToFieldWithOpenMenu_Manual, CB2_ReturnToFieldContinueScript_Manual, CB2_ReturnToField_Manual, Overworld_ResetStateAfterDigEscRope } from './overworld';
import { CanUseDigOrEscapeRopeOnCurMap, StartEscapeRopeFieldEffect } from './fldeff_dig';
import { gSpecialVar } from './engine/script/script-vars';
import { RemoveBagItem, CheckBagHasItem } from './engine/bag/bag';
import { AddBagItemIconSprite, RemoveBagItemIconSprite, RemoveBagSprite, AddBagVisualSprite, SetBagVisualPocketId, ShakeBagSprite, AddSwitchPocketRotatingBallSprite, TAG_BAG_GFX } from './item_menu_icons';
import { preloadSwapLineAssets, LoadListMenuSwapLineGfx, CreateSwapLineSprites, SetSwapLineSpritesInvisibility, UpdateSwapLineSpritesPos, SWAP_LINE_HAS_MARGIN } from './menu_helpers';
import { preloadItemIconAssets } from './item_icon';
import { AddScrollIndicatorArrowPair, AddScrollIndicatorArrowPairParameterized, RemoveScrollIndicatorArrowPair, SCROLL_ARROW_UP, SCROLL_ARROW_LEFT, SCROLL_ARROW_RIGHT, type ScrollArrowsTemplate } from './list_menu';
import { GetPlayerNameString } from '../include/text';
import { AddMoney, GetMoney, AddMoneyLabelObject, RemoveMoneyLabelObject, PrintMoneyAmountInMoneyBoxWithBorder, PrintMoneyAmount, PrintMoneyAmountInMoneyBox } from './money';
import { CreateYesNoMenuWithCallbacks, AdjustQuantityAccordingToDPadInput, DisplayMessageAndContinueTask, IsWritingMailAllowed } from './menu_helpers';
import { GetPlayerTextSpeedDelay, ClearDialogWindowAndFrameToTransparent } from './menu';
import { FlagSet, FlagClear, FlagGet, VarSet, VarGet } from './engine/script/script-vars';
import { reverseDecompConstant } from '../harness/runtime/decomp-constants';
import { getItem as _getItem } from '../harness/runtime/data-tables';
import { ApplyMedicineEffect } from './engine/bag/bag-item-effects';
import { setItemUseCB, SetUpItemUseCallback, setItemUseOnFieldCB, SetUpItemUseOnFieldCallback, ItemUseCB_Medicine, ItemUseCB_PPRecovery, ItemUseCB_PPUp, ItemUseCB_RareCandy, ItemUseCB_ReduceEV, ItemUseCB_SacredAsh, ItemUseCB_EvolutionStone, ItemUseCB_TMHM, CB2_ChooseMonToGiveItem } from './item_use';
// Handlers d'usage d'objet EN COMBAT (item_use.c → item_use.ts) dispatchés par
// ItemMenu_UseInBattle (foyer 1:1 item_menu.c:1997) via GetItemBattleFunc.
import { ItemUseInBattle_PokeBall, ItemUseInBattle_StatIncrease, ItemUseInBattle_Medicine, ItemUseInBattle_PPRecovery, ItemUseInBattle_Escape } from './item_use';
import { GetSaveBlock1, GetSaveBlock2 } from './save';
import { gMapHeader } from './fieldmap';
import { GetItemEffectType, ITEM_EFFECT_HEAL_HP, ITEM_EFFECT_CURE_POISON, ITEM_EFFECT_CURE_SLEEP, ITEM_EFFECT_CURE_BURN, ITEM_EFFECT_CURE_FREEZE, ITEM_EFFECT_CURE_PARALYSIS, ITEM_EFFECT_CURE_ALL_STATUS, ITEM_EFFECT_HP_EV, ITEM_EFFECT_ATK_EV, ITEM_EFFECT_DEF_EV, ITEM_EFFECT_SPEED_EV, ITEM_EFFECT_SPATK_EV, ITEM_EFFECT_SPDEF_EV, ITEM_EFFECT_RAISE_LEVEL, ITEM_EFFECT_PP_UP, ITEM_EFFECT_PP_MAX, ITEM_EFFECT_HEAL_PP } from './engine/bag/bag-item-effects';
import { DrawStdFrameWithCustomTileAndPalette } from './window';
import { AddTextPrinterParameterized } from './text';
import { GetItemFieldFunc, GetItemType, GetItemSecondaryId, GetItemPrice } from './item';
import { B_BUTTON, DPAD_UP, DPAD_DOWN } from '../include/gba/io_reg';
import { SE_SHOP } from '../include/constants/songs';

// ── depuis bag-menu.ts ──────────────────────────────────────────
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

// Migration TEXTE byte : gStringVarN buffers byte via setStringVar (encode source),
// StringExpandPlaceholders byte écrit gStringVar4, encodeOwText = préproc.

// ─── Phase 1 (sac ouvrable) — input task + fade + retour terrain 1:1 ─────────

// Context menu (A_BUTTON sur item) — ouvre UTILIS./DONNER/JETER/RETOUR.

// Phase 2 (sprites) — icône objet 1:1 (item_menu_icons.c → item_icon.c).
// Arête bag-menu ↔ bag-menu-icons : usage en corps de fn uniquement
// (live binding ESM, pas de TDZ — cf. feedback-map-loader-var-tdz).

// Swap line — barre grise ▶ rouge affichée pendant SELECT swap (1:1 menu_helpers.c).

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
  registeredSelect: Uint8Array; // sRegisteredSelect_Gfx (bag/select_button.4bpp.bin) — 24×16 4bpp icône SELECT de l'objet-clé enregistré (BlitBitmapToWindow, item_menu.c:993)
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
           scrollGfx, redPal, hmIcon, registeredSelect,
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
      loadTileBin('/decomp/em/bag/select_button.4bpp.bin', 4), // sRegisteredSelect_Gfx (icône SELECT 24×16)
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
      bgTiles, bgTilemap, palMale, palFemale, stdMenuPal, hmIcon, registeredSelect,
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
// BATTLE : 1:1 décomp `CB2_SetUpReshowBattleScreenAfterMenu2` (battle_controller_player.c:1555)
// = `SetMainCallback2(ReshowBattleScreenAfterMenu)`. Le vrai reshow vit dans
// reshow_battle_screen.ts (cycle item_menu↔battle_controller_player↔reshow) → résolu par
// pont globalThis `__CB2_SetUpReshowBattleScreenAfterMenu2` que battle_controller_player.ts
// pose AVANT d'ouvrir le sac (_OpenBagAndChooseItem). Pattern anti-cycle IDENTIQUE à
// CB2_FavorLadyExitBagMenu (:3623, lit __FieldCallback_*).
function _cb2SetUpReshowBattleScreenAfterMenu2(): void {
  const cb = (globalThis as Record<string, unknown>).__CB2_SetUpReshowBattleScreenAfterMenu2 as (() => void) | undefined;
  if (cb) { cb(); return; }
  console.error('[item-menu] __CB2_SetUpReshowBattleScreenAfterMenu2 absent (battle_controller_player non câblé — sac de combat)');
}
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
export function UpdatePocketItemList(pocketId: number): void {
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
export function UpdatePocketListPosition(pocketId: number): void {
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
/** 1:1 décomp item_menu.c:990-994 :
 *    if (gSaveBlock1Ptr->registeredItem != ITEM_NONE && gSaveBlock1Ptr->registeredItem == itemId)
 *        BlitBitmapToWindow(windowId, sRegisteredSelect_Gfx, 96, y - 1, 24, 16);
 *  Icône SELECT de l'objet-clé enregistré (poche objets-clés). Asset
 *  sRegisteredSelect_Gfx = bag/select_button.4bpp.bin (préchargé _bagAssets). */
function _bagDrawRegisteredIcon(windowId: number, y: number, itemId: number): void {
  if (gSaveBlock1Ptr.registeredItem !== ITEM_NONE && gSaveBlock1Ptr.registeredItem === itemId) {
    if (_bagAssets) BlitBitmapToWindow(windowId, _bagAssets.registeredSelect, 96, y - 1, 24, 16);
  }
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
  // 1:1 décomp `PrintItemQuantity` (item_menu.c:2526) : AddTextPrinterParameterized
  // (couleurs PAR DÉFAUT du font FONT_NORMAL = fg 2 DARK_GRAY/bg 1/shadow 3), centré
  // dans 0x28 (40px). ⚠️ PAS BagMenu_Print(COLORID_NORMAL) : COLORID_NORMAL a fg=1
  // (WHITE) → texte blanc invisible sur le fond PIXEL_FILL(1) (bug couleur "×NN").
  // Décomp : GetStringCenterAlignXOffset(FONT_NORMAL, gStringVar4, 0x28). Notre
  // signature = (str, totalWidth, fontId) → mêmes valeurs, ordre d'args du port.
  AddTextPrinterParameterized(
    windowId, FONT_NORMAL, gStringVar4,
    GetStringCenterAlignXOffset(gStringVar4, 0x28, FONT_NORMAL), 2, 0, null);
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
      } else if (gBagPosition.location === ITEMMENULOCATION_PARTY) {
        // 1:1 sContextMenuFuncs[ITEMMENULOCATION_PARTY] = Task_ItemContext_GiveToParty
        // (item_menu.c:347) — A sur un item en mode "donner à un mon" → valide + fade-close.
        SetTaskFuncWithFollowupFunc(task.taskId, Task_ItemContext_GiveToParty, Task_BagMenu_HandleInput);
      } else if (gBagPosition.location === ITEMMENULOCATION_PCBOX) {
        // 1:1 sContextMenuFuncs[ITEMMENULOCATION_PCBOX] = Task_ItemContext_GiveToPC
        // (item_menu.c:356) — DONNER un objet du SAC à un mon du PC → valide + fade-close (retour PC).
        SetTaskFuncWithFollowupFunc(task.taskId, Task_ItemContext_GiveToPC, Task_BagMenu_HandleInput);
      } else if (gBagPosition.location === ITEMMENULOCATION_ITEMPC) {
        // 1:1 sContextMenuFuncs[ITEMMENULOCATION_ITEMPC] = Task_ItemContext_Deposit
        // (item_menu.c:351) — A sur un objet du SAC en mode ITEMPC → DÉPOSE dans le PC
        // (pas de menu Use/Give/Toss). INERTE : aucun call-site n'ouvre encore le sac en
        // ITEMPC (player_pc.ts appelle le clone jusqu'au Lot 3).
        SetTaskFuncWithFollowupFunc(task.taskId, Task_ItemContext_Deposit, Task_BagMenu_HandleInput);
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


// ── depuis bag-menu-ctx.ts ──────────────────────────────────────────
/**
 * bag-menu-ctx.ts — context menu du sac 1:1 décomp `src/item_menu.c`
 * ============================================================================
 * Quand le user appuie A sur un item de la liste, ouvre un menu d'actions
 * (UTILIS. / DONNER / JETER / RETOUR, etc.) dont le contenu DÉPEND de la
 * poche (Items/KeyItems/Balls/TM_HM/Berries) et de la location (FIELD/BATTLE/
 * PARTY/SHOP/etc.).
 *
 * 1:1 décomp (item_menu.c) :
 *  - OpenContextMenu               :1540 — choisit la table sContextMenuItems_*
 *                                  selon location/pocket, ajoute la window
 *                                  ITEMWIN_{1x1,1x2,2x2,2x3} et imprime.
 *  - Task_ItemContext_Normal       :1690 — branche vers SingleRow ou MultipleRows
 *                                  selon numItems.
 *  - Task_ItemContext_SingleRow    :1702 — input LEFT/RIGHT/A/B (1 ou 2 actions).
 *  - Task_ItemContext_MultipleRows :1723 — input grid 2 colonnes (4 ou 6 actions).
 *  - sItemMenuActions              :266  — table action → {text, handler}.
 *  - sContextMenuItems_*           :287-342 — actions par poche/contexte.
 *  - sContextMenuWindowTemplates   :455  — 4 dimensions de fenêtre.
 *
 * **Frame user-choisi** : le frame de la fenêtre est celui sélectionné par
 * l'utilisateur dans le menu OPTIONS (= `gSaveBlock2Ptr->optionsWindowFrameType`,
 * 0..19). `LoadBagMenuTextWindows` (item_menu.c:2463) appelle déjà
 * `LoadUserWindowBorderGfx(0, 1, BG_PLTT_ID(14))` qui charge ces tiles en VRAM
 * au boot du sac. `DrawStdFrameWithCustomTileAndPalette(*, FALSE, 1, 14)` les
 * utilise pour dessiner le cadre — donc rien de spécial à faire ici, on hérite
 * automatiquement du frame user (cf. gba-text-window.ts:70 LoadUserWindowBorderGfx).
 *
 * Handlers (ItemMenu_UseOutOfBattle/Toss/Register/Give/Cancel/Show/etc.) :
 * STUBS pour l'instant — chacun retire le ctx window et restaure
 * Task_BagMenu_HandleInput. À implémenter type-d'item-par-type-d'item dans
 * un follow-up.
 */

// ⚠️ Import LAZY de player-avatar (CanFish/StartFishing) : un import statique tire tout le graphe
// fishing (text/window/wild_encounter…) dans la chaîne d'éval de bag-menu-ctx → cycle ESM + TDZ
// (BG_SCREEN_SIZE dans gba-global-scope). player-avatar est déjà chargé par l'overworld au moment où
// on utilise une canne → le dynamic import résout instantané (cache), sans cycle d'éval.
let _playerAvatarMod: typeof import('./field_player_avatar') | null = null;
void import('./field_player_avatar').then((m) => { _playerAvatarMod = m; });
// Lazy import bike.ts (anti-cycle/TDZ : il tire tout le graphe field via player-avatar).
let _bikeMod: typeof import('./bike') | null = null;
void import('./bike').then((m) => { _bikeMod = m; });
let _overworldMod: typeof import('./overworld') | null = null;
void import('./overworld').then((m) => { _overworldMod = m; });
// Lazy import event_object_lock/movement (anti-cycle/TDZ : graphe field) pour
// ScriptUnfreezeObjectEvents (CB vélo) + FreezeObjectEvents (UseRegisteredKeyItemOnField).
let _eventObjLockMod: typeof import('./event_object_lock') | null = null;
void import('./event_object_lock').then((m) => { _eventObjLockMod = m; });
let _eventObjMoveMod: typeof import('./event_object_movement') | null = null;
void import('./event_object_movement').then((m) => { _eventObjMoveMod = m; });
// CalculatePlayerPartyCount() lit `gPlayerParty[i].species` qui peut être 0
// si la party n'est pas synchronisée depuis gameState (= bug observé). On
// utilise directement gSaveBlock1Ptr.playerParty.length qui est la source de vérité.

// ─── Constantes 1:1 décomp (item_menu.h + item_menu.c) ───────────────────────

// 1:1 décomp item_menu.h:25-37 — ITEMWIN_*.
const ITEMWIN_1x1: number = ENUM_ITEMWIN_1.ITEMWIN_1x1;       // 0
const ITEMWIN_1x2: number = ENUM_ITEMWIN_1.ITEMWIN_1x2;       // 1
const ITEMWIN_2x2: number = ENUM_ITEMWIN_1.ITEMWIN_2x2;       // 2
const ITEMWIN_2x3: number = ENUM_ITEMWIN_1.ITEMWIN_2x3;       // 3
const ITEMWIN_MESSAGE: number = ENUM_ITEMWIN_1.ITEMWIN_MESSAGE;       // 4 (vraie message box encadrée)
const ITEMWIN_YESNO_LOW: number = ENUM_ITEMWIN_1.ITEMWIN_YESNO_LOW;   // 5 (toss confirm)
const ITEMWIN_YESNO_HIGH: number = ENUM_ITEMWIN_1.ITEMWIN_YESNO_HIGH; // 6 (sell confirm, au-dessus du message)
const ITEMWIN_QUANTITY: number = ENUM_ITEMWIN_1.ITEMWIN_QUANTITY;     // 7 (toss/deposit count)
const ITEMWIN_QUANTITY_WIDE: number = ENUM_ITEMWIN_1.ITEMWIN_QUANTITY_WIDE; // 8 (sell : count + prix)
const ITEMWIN_MONEY: number = ENUM_ITEMWIN_1.ITEMWIN_MONEY;          // 9 (sell : argent courant)
// (T_QUANTITY/T_ITEM_COUNT définis plus haut, depuis bag-menu — dédup consolidation.)
// taskId courant du flow toss : les yes/no funcs (zéro-arg, comme shop) le réutilisent.
let _tossTaskId = -1;

// 1:1 décomp item_menu.c — enum Action.
const ACTION_USE = 0;
const ACTION_TOSS = 1;
const ACTION_REGISTER = 2;
const ACTION_GIVE = 3;
const ACTION_CANCEL = 4;
const ACTION_BATTLE_USE = 5;
const ACTION_CHECK = 6;
const ACTION_WALK = 7;
const ACTION_DESELECT = 8;
const ACTION_CHECK_TAG = 9;
const ACTION_CONFIRM = 10;
const ACTION_SHOW = 11;
const ACTION_GIVE_FAVOR_LADY = 12;
const ACTION_CONFIRM_QUIZ_LADY = 13;
const ACTION_DUMMY = 14;

// 1:1 décomp constants/item.h — pockets. Import depuis decomp-data (= A8 audit).

// 1:1 décomp include/constants/items.h : digits du compteur d'objets (99 max = 2,
// baies 999 = 3). Canonique partagé — PAS un const local (l'ancien `= 3` était faux).

// 1:1 décomp item_menu.h — ITEMMENULOCATION_* (pas extrait decomp-data, hardcode 1:1 justifié).

// 1:1 décomp item_menu.c:266 sItemMenuActions — strings FR depuis strings.json.
// Le décomp lie text → handler {func}. Notre TS : table {label, handler}.
type ActionHandler = (task: DecompTask) => void;
interface ItemMenuAction { label: string; func: ActionHandler; }
const sItemMenuActions: Record<number, ItemMenuAction> = {
  [ACTION_USE]:               { label: 'UTILIS.',        func: (t) => ItemMenu_UseOutOfBattle(t) },
  [ACTION_TOSS]:              { label: 'JETER',          func: (t) => ItemMenu_Toss(t) },
  [ACTION_REGISTER]:          { label: 'ENREG.',         func: (t) => ItemMenu_Register(t) },
  [ACTION_GIVE]:              { label: 'DONNER',         func: (t) => ItemMenu_Give(t) },
  [ACTION_CANCEL]:            { label: 'RETOUR',         func: (t) => ItemMenu_Cancel(t) },
  [ACTION_BATTLE_USE]:        { label: 'UTILIS.',        func: (t) => ItemMenu_UseInBattle(t) },
  [ACTION_CHECK]:             { label: 'VOIR',           func: (t) => ItemMenu_UseOutOfBattle(t) }, // 1:1: même handler que USE
  [ACTION_WALK]:              { label: 'MARCHER',        func: (t) => ItemMenu_UseOutOfBattle(t) },
  [ACTION_DESELECT]:          { label: 'ANNUL.',         func: (t) => ItemMenu_Register(t) },        // toggle register
  [ACTION_CHECK_TAG]:         { label: 'LIRE ETIQUETTE', func: (t) => ItemMenu_CheckTag(t) },
  [ACTION_CONFIRM]:           { label: 'CONFIRMER',      func: (t) => Task_FadeAndCloseBagMenuStub(t) },
  [ACTION_SHOW]:              { label: 'PRESENTER',      func: (t) => ItemMenu_Show(t) },
  [ACTION_GIVE_FAVOR_LADY]:   { label: 'DONNER',         func: (t) => ItemMenu_GiveFavorLady(t) },
  [ACTION_CONFIRM_QUIZ_LADY]: { label: 'CONFIRMER',      func: (t) => ItemMenu_ConfirmQuizLady(t) },
  [ACTION_DUMMY]:             { label: '',               func: () => {} },
};

// 1:1 décomp item_menu.c:287-311 — actions par poche.
const sContextMenuItems_ItemsPocket    = [ACTION_USE,       ACTION_GIVE,   ACTION_TOSS,  ACTION_CANCEL];
const sContextMenuItems_KeyItemsPocket = [ACTION_USE,       ACTION_REGISTER, ACTION_DUMMY, ACTION_CANCEL];
const sContextMenuItems_BallsPocket    = [ACTION_GIVE,      ACTION_DUMMY,  ACTION_TOSS,  ACTION_CANCEL];
const sContextMenuItems_TmHmPocket     = [ACTION_USE,       ACTION_GIVE,   ACTION_DUMMY, ACTION_CANCEL];
const sContextMenuItems_BerriesPocket  = [ACTION_CHECK_TAG, ACTION_DUMMY,
                                          ACTION_USE,       ACTION_GIVE,
                                          ACTION_TOSS,      ACTION_CANCEL];
const sContextMenuItems_BattleUse      = [ACTION_BATTLE_USE, ACTION_CANCEL];
const sContextMenuItems_Cancel         = [ACTION_CANCEL];

// 1:1 décomp item_menu.c:455 sContextMenuWindowTemplates — bg=1, baseBlock=0x21D,
// paletteNum=15 (= la palette frame chargée par LoadUserWindowBorderGfx via
// LoadBagMenuTextWindows, donc le user-choisi).
const sContextMenuWindowTemplates: WindowTemplate[] = [
  /* ITEMWIN_1x1 */ { bg: 1, tilemapLeft: 22, tilemapTop: 17, width:  7, height: 2, paletteNum: 15, baseBlock: 0x21D },
  /* ITEMWIN_1x2 */ { bg: 1, tilemapLeft: 22, tilemapTop: 15, width:  7, height: 4, paletteNum: 15, baseBlock: 0x21D },
  /* ITEMWIN_2x2 */ { bg: 1, tilemapLeft: 15, tilemapTop: 15, width: 14, height: 4, paletteNum: 15, baseBlock: 0x21D },
  /* ITEMWIN_2x3 */ { bg: 1, tilemapLeft: 15, tilemapTop: 13, width: 14, height: 6, paletteNum: 15, baseBlock: 0x21D },
  /* ITEMWIN_MESSAGE */ { bg: 1, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4, paletteNum: 15, baseBlock: 0x1B1 },
  /* ITEMWIN_YESNO_LOW  (5) */ { bg: 1, tilemapLeft: 24, tilemapTop: 15, width: 5, height: 4, paletteNum: 15, baseBlock: 0x21D },
  /* ITEMWIN_YESNO_HIGH (6) */ { bg: 1, tilemapLeft: 21, tilemapTop:  9, width: 5, height: 4, paletteNum: 15, baseBlock: 0x21D },
  /* ITEMWIN_QUANTITY   (7) */ { bg: 1, tilemapLeft: 24, tilemapTop: 17, width: 5, height: 2, paletteNum: 15, baseBlock: 0x21D },
  /* ITEMWIN_QUANTITY_WIDE (8) — sell : count + prix */ { bg: 1, tilemapLeft: 18, tilemapTop: 11, width: 10, height: 2, paletteNum: 15, baseBlock: 0x245 },
  /* ITEMWIN_MONEY     (9) — sell : argent courant */ { bg: 1, tilemapLeft: 1, tilemapTop: 1, width: 10, height: 2, paletteNum: 15, baseBlock: 0x231 },
];

// ─── Helpers BagMenu_AddWindow / BagMenu_RemoveWindow (1:1 item_menu.c:2486) ──

/** 1:1 décomp `BagMenu_AddWindow(windowType)` (item_menu.c:2486) :
 *  Si windowIds[windowType] est WINDOW_NONE, AddWindow + DrawStdFrameWith
 *  CustomTileAndPalette (baseTile=1 = frame user-choisi, palette=14 standard).
 *  Sinon retourne le windowId existant (= idempotent). */
function BagMenu_AddWindow(windowType: number): number {
  if (!gBagMenu) return 0;
  const cur = gBagMenu.windowIds[windowType];
  if (cur !== WINDOW_NONE) return cur;
  const wid = AddWindow(sContextMenuWindowTemplates[windowType]);
  gBagMenu.windowIds[windowType] = wid;
  // 1:1 :2492 — baseTile=1 (= les tiles du frame user chargées par
  // LoadUserWindowBorderGfx au boot), paletteNum=14.
  DrawStdFrameWithCustomTileAndPalette(wid, false, 1, 14);
  ScheduleBgCopyTilemapToVram(1);
  return wid;
}

/** 1:1 décomp `BagMenu_RemoveWindow(windowType)` (item_menu.c:2498). */
function BagMenu_RemoveWindow(windowType: number): void {
  if (!gBagMenu) return;
  const wid = gBagMenu.windowIds[windowType];
  if (wid === WINDOW_NONE) return;
  // 1:1 :2503 — ClearStdWindowAndFrameToTransparent : clear le frame tilemap
  // en mettant tile=0 (= transparent). On émule via FillBgTilemapBufferRect
  // sur la zone width+2 × height+2 (= frame + intérieur).
  const t = sContextMenuWindowTemplates[windowType];
  FillBgTilemapBufferRect_Palette0(t.bg, 0, t.tilemapLeft - 1, t.tilemapTop - 1, t.width + 2, t.height + 2);
  ClearWindowTilemap(wid);
  RemoveWindow(wid);
  ScheduleBgCopyTilemapToVram(1);
  gBagMenu.windowIds[windowType] = WINDOW_NONE;
}

/** Helper : window type selon numItems (1:1 décomp item_menu.c:1668-1675). */
function _windowTypeFor(numItems: number): number {
  if (numItems === 1) return ITEMWIN_1x1;
  if (numItems === 2) return ITEMWIN_1x2;
  if (numItems === 4) return ITEMWIN_2x2;
  return ITEMWIN_2x3;
}

// ─── Cursor 2D pour grid 2 colonnes (4 ou 6 actions) ──────────────────────────
// 1:1 décomp src/menu.c InitMenuActionGrid + cursor 2D. État local au ctx menu :
// position dans la grille (0..numItems-1), avec layout :
//   numItems=4 : [0, 1]   numItems=6 : [0, 1]
//                [2, 3]                [2, 3]
//                                      [4, 5]
// Stride = 2 colonnes ; row = pos >> 1 ; col = pos & 1.

let _ctxCursorPos = 0;
let _ctxNumItems = 0;
let _ctxItems: ReadonlyArray<number> = [];
let _ctxWindowType = ITEMWIN_1x1;
let _ctxWindowId = WINDOW_NONE;
let _ctxGrid2D = false; // true = 4 ou 6 actions, false = 1 ou 2

// Métriques de rendu (1:1 décomp PrintMenuActionTexts/Grid args).
const TEXT_LEFT_PX = 8;
const TEXT_TOP_PX = 1;
const ROW_HEIGHT_PX = 16;  // grid : lineHeight
const COL_WIDTH_PX = 56;   // grid : optionWidth

function _drawCtxCursor(highlightPos: number): void {
  if (_ctxWindowId === WINDOW_NONE) return;
  // Pour chaque slot d'action : dessine "▶" si highlight, sinon CLEAR la zone
  // cursor (= idx 1, le bg standard du frame). Sans le clear, l'ancien ▶
  // reste visible (= 2 curseurs ; AddTextPrinter écrit par-dessus mais espace
  // ne couvre pas le glyph précédent).
  for (let i = 0; i < _ctxNumItems; i++) {
    if (_ctxItems[i] === ACTION_DUMMY) continue;
    const col = _ctxGrid2D ? (i & 1) : i;
    const row = _ctxGrid2D ? (i >> 1) : 0;
    const x = col * COL_WIDTH_PX;
    const y = TEXT_TOP_PX + row * ROW_HEIGHT_PX;
    if (i === highlightPos) {
      AddTextPrinterParameterized4(
        _ctxWindowId, FONT_NARROW, x, y, 0, 0,
        [0, 2, 3], TEXT_SKIP_DRAW, '▶',
      );
    } else {
      // 1:1 décomp clearMenuCursor : FillWindowPixelRect bgColor 1 sur la
      // zone du cursor (8 px × 16 px = 1 char wide).
      FillWindowPixelRect(_ctxWindowId, 1, x, y, 8, 16);
    }
  }
  CopyWindowToVram(_ctxWindowId, 2 /* COPYWIN_GFX */);
}

function _printCtxItems(): void {
  if (_ctxWindowId === WINDOW_NONE) return;
  FillWindowPixelBuffer(_ctxWindowId, PIXEL_FILL(1));
  // Imprime chaque label à sa position grid.
  for (let i = 0; i < _ctxNumItems; i++) {
    const actionId = _ctxItems[i];
    if (actionId === ACTION_DUMMY) continue;
    const col = _ctxGrid2D ? (i & 1) : i;
    const row = _ctxGrid2D ? (i >> 1) : 0;
    const x = col * COL_WIDTH_PX + TEXT_LEFT_PX;
    const y = TEXT_TOP_PX + row * ROW_HEIGHT_PX;
    AddTextPrinterParameterized4(
      _ctxWindowId, FONT_NARROW, x, y, 0, 0,
      [0, 2, 3], TEXT_SKIP_DRAW,
      sItemMenuActions[actionId].label,
    );
  }
  PutWindowTilemap(_ctxWindowId);
  ScheduleBgCopyTilemapToVram(1);
  // 1:1 :1681 InitMenuInUpperLeftCornerNormal(windowId, numItems, 0) — cursor
  // initial = position 0 (1ère action valide).
  _ctxCursorPos = 0;
  // Skip ACTION_DUMMY si en 1ère position.
  while (_ctxCursorPos < _ctxNumItems && _ctxItems[_ctxCursorPos] === ACTION_DUMMY)
    _ctxCursorPos++;
  _drawCtxCursor(_ctxCursorPos);
  CopyWindowToVram(_ctxWindowId, 3 /* COPYWIN_FULL */);
}

function _isValidCtxPos(pos: number): boolean {
  if (pos < 0) return false;
  if (pos >= _ctxNumItems) return false;
  return _ctxItems[pos] !== ACTION_DUMMY;
}

// ─── OpenContextMenu (1:1 décomp item_menu.c:1540) ────────────────────────────

/** 1:1 décomp `OpenContextMenu(taskId)` (item_menu.c:1540) — choisit la table
 *  d'actions et la fenêtre selon location/pocket, l'imprime + descr "X est
 *  sélectionné.". */
export function OpenContextMenu(_task: DecompTask): void {
  if (!gBagMenu) return;
  let items: ReadonlyArray<number>;
  // 1:1 :1542-1651 — location/pocket dispatch (= covers FIELD/BATTLE pour
  // l'instant, autres stub-cancel).
  switch (gBagPosition.location) {
    case ITEMMENULOCATION_BATTLE:
    case ITEMMENULOCATION_WALLY: {
      // 1:1 :1546 if (GetItemBattleUsage(itemId)) → BattleUse ; sinon Cancel.
      // Stub : on suppose tout item utilisable en battle pour l'instant
      // (raffinage = port GetItemBattleUsage 1:1 plus tard).
      items = sContextMenuItems_BattleUse;
      break;
    }
    default: {
      // 1:1 :1602+ — pour FIELD : link/UnionRoom = juste Give/Cancel ; sinon
      // dispatch par pocket. Notre TS : link non modélisé → branche normale.
      switch (gBagPosition.pocket) {
        case ITEMS_POCKET:    items = sContextMenuItems_ItemsPocket; break;
        case KEYITEMS_POCKET: {
          // 1:1 décomp item_menu.c:1626-1636 : memcpy dans un buffer MUTABLE puis 2 swaps
          // (on NE mute PAS la const partagée → .slice()).
          const buf = sContextMenuItems_KeyItemsPocket.slice();
          // (1) :1630-1631 — objet DÉJÀ enregistré → ENREG.(REGISTER) devient ANNUL.(DESELECT).
          if (gSaveBlock1Ptr.registeredItem === gSpecialVar.ItemId)
            buf[1] = ACTION_DESELECT;
          // (2) :1632-1636 — vélo MACH/ACRO ET déjà à vélo → UTILIS.(USE) devient MARCHER(WALK)
          // (= redescendre du vélo). TestPlayerAvatarFlags via le module field_player_avatar
          // (lazy ; null pendant le boot → skip, comportement par défaut UTILIS.).
          if ((gSpecialVar.ItemId === ITEM_MACH_BIKE || gSpecialVar.ItemId === ITEM_ACRO_BIKE)
            && _playerAvatarMod
            && _playerAvatarMod.TestPlayerAvatarFlags(
              _playerAvatarMod.PLAYER_AVATAR_FLAG_MACH_BIKE | _playerAvatarMod.PLAYER_AVATAR_FLAG_ACRO_BIKE))
            buf[0] = ACTION_WALK;
          items = buf;
          break;
        }
        case BALLS_POCKET:    items = sContextMenuItems_BallsPocket; break;
        case TMHM_POCKET:     items = sContextMenuItems_TmHmPocket; break;
        case BERRIES_POCKET:  items = sContextMenuItems_BerriesPocket; break;
        default:              items = sContextMenuItems_Cancel; break;
      }
    }
  }
  _ctxItems = items;
  _ctxNumItems = items.length;
  gBagMenu.contextMenuItemsPtr = items;
  gBagMenu.contextMenuNumItems = items.length;
  // 1:1 :1653-1666 — TM/HM pocket affiche le panneau type/puiss/préc/PP du
  // move, les autres pockets affichent "X est sélectionné.".
  if (gBagPosition.pocket === TMHM_POCKET) {
    _CtxShowTMHMPanel(gSpecialVar.ItemId);
  } else {
    _CtxPrintItemSelected(gSpecialVar.ItemId);
  }
  // 1:1 :1668-1675 — choisit le window type et imprime.
  _ctxWindowType = _windowTypeFor(_ctxNumItems);
  _ctxGrid2D = _ctxNumItems >= 4;
  _ctxWindowId = BagMenu_AddWindow(_ctxWindowType);
  _printCtxItems();
}

// ─── Task_ItemContext_Normal + SingleRow + MultipleRows (1:1 :1690+) ──────────

/** 1:1 décomp `Task_ItemContext_Normal` (item_menu.c:1690). */
export function Task_ItemContext_Normal(task: DecompTask): void {
  OpenContextMenu(task);
  if (_ctxNumItems <= 2) task.func = Task_ItemContext_SingleRow;
  else                   task.func = Task_ItemContext_MultipleRows;
}

/** 1:1 décomp `Task_ItemContext_SingleRow` (item_menu.c:1702).
 *  Input LEFT/RIGHT bouge le cursor, A sélectionne, B cancel. */
function Task_ItemContext_SingleRow(task: DecompTask): void {
  if (JOY_NEW(DPAD_LEFT)) {
    if (_ctxCursorPos > 0 && _isValidCtxPos(_ctxCursorPos - 1)) {
      PlaySE(SE_SELECT); _ctxCursorPos--; _drawCtxCursor(_ctxCursorPos);
    }
  } else if (JOY_NEW(DPAD_RIGHT)) {
    if (_ctxCursorPos < _ctxNumItems - 1 && _isValidCtxPos(_ctxCursorPos + 1)) {
      PlaySE(SE_SELECT); _ctxCursorPos++; _drawCtxCursor(_ctxCursorPos);
    }
  } else if (JOY_NEW(A_BUTTON)) {
    PlaySE(SE_SELECT);
    sItemMenuActions[_ctxItems[_ctxCursorPos]].func(task);
  } else if (JOY_NEW(B_BUTTON)) {
    PlaySE(SE_SELECT);
    sItemMenuActions[ACTION_CANCEL].func(task);
  }
}

/** 1:1 décomp `Task_ItemContext_MultipleRows` (item_menu.c:1723).
 *  Cursor 2D grid 2 colonnes, input UP/DOWN/LEFT/RIGHT/A/B. */
function Task_ItemContext_MultipleRows(task: DecompTask): void {
  if (JOY_NEW(DPAD_UP)) {
    if (_ctxCursorPos > 0 && _isValidCtxPos(_ctxCursorPos - 2)) {
      PlaySE(SE_SELECT); _ctxCursorPos -= 2; _drawCtxCursor(_ctxCursorPos);
    }
  } else if (JOY_NEW(DPAD_DOWN)) {
    if (_ctxCursorPos < _ctxNumItems - 2 && _isValidCtxPos(_ctxCursorPos + 2)) {
      PlaySE(SE_SELECT); _ctxCursorPos += 2; _drawCtxCursor(_ctxCursorPos);
    }
  } else if (JOY_NEW(DPAD_LEFT)) {
    if ((_ctxCursorPos & 1) && _isValidCtxPos(_ctxCursorPos - 1)) {
      PlaySE(SE_SELECT); _ctxCursorPos--; _drawCtxCursor(_ctxCursorPos);
    }
  } else if (JOY_NEW(DPAD_RIGHT)) {
    if (!(_ctxCursorPos & 1) && _isValidCtxPos(_ctxCursorPos + 1)) {
      PlaySE(SE_SELECT); _ctxCursorPos++; _drawCtxCursor(_ctxCursorPos);
    }
  } else if (JOY_NEW(A_BUTTON)) {
    PlaySE(SE_SELECT);
    sItemMenuActions[_ctxItems[_ctxCursorPos]].func(task);
  } else if (JOY_NEW(B_BUTTON)) {
    PlaySE(SE_SELECT);
    sItemMenuActions[ACTION_CANCEL].func(task);
  }
}

// ─── RemoveContextWindow (1:1 :1784) ──────────────────────────────────────────

/** 1:1 décomp `RemoveContextWindow` (item_menu.c:1784). */
export function RemoveContextWindow(): void {
  BagMenu_RemoveWindow(_ctxWindowType);
  _ctxWindowId = WINDOW_NONE;
}

// ─── Action handlers (usage hors/en combat, toss, register, give, etc.) ──────

/** 1:1 décomp `ItemMenu_UseOutOfBattle` (item_menu.c:1796) :
 *    if (GetItemFieldFunc(itemId)) {
 *        RemoveContextWindow();
 *        if (party_count == 0 && type == ITEM_USE_PARTY_MENU)
 *            PrintThereIsNoPokemon(taskId);
 *        else {
 *            FillWindowPixelBuffer(WIN_DESCRIPTION, PIXEL_FILL(0));
 *            if (type != ITEM_USE_PARTY_MENU) ScheduleBgCopyTilemapToVram(0);
 *            GetItemFieldFunc(itemId)(taskId);  // dispatch
 *        }
 *    }
 *  Notre TS dispatch via le NOM du handler (string depuis items.json, = le
 *  pointeur de fonction GetItemFieldFunc côté décomp). Handlers câblés 1:1 :
 *  CannotUse / Medicine / TMHM / PPRecovery / PPUp / RareCandy / ReduceEV /
 *  SacredAsh / EvolutionStone / Bike / EscapeRope (cf. switch ci-dessous). */
/** 1:1 décomp `CB2_CheckMail` (item_use.c:189) : affiche le DESIGN de la lettre
 *  (fond, sans texte — la lettre du sac n'est pas encore écrite). Mail blanc avec
 *  seulement itemId = gSpecialVar.ItemId ; ReadMail(mail, retour-sac, hasText=FALSE).
 *  ReadMail (mail.ts) = écran 1:1 déjà porté (12 designs + icône + easy-chat). */
function CB2_CheckMail(): void {
  const mail: Mail = { words: [], playerName: [], trainerId: [], species: 0, itemId: gSpecialVar.ItemId };
  // 1:1 CB2_ReturnToBagMenuPocket = GoToBagMenu(ITEMMENULOCATION_LAST) (restaure la poche).
  ReadMail(mail, () => GoToBagMenu(ITEMMENULOCATION_LAST, POCKETS_COUNT, null), false);
}

function ItemMenu_UseOutOfBattle(task: DecompTask): void {
  const itemId = gSpecialVar.ItemId;
  const fieldUseFunc = GetItemFieldFunc(itemId);
  if (!fieldUseFunc) {
    // 1:1 décomp :1797 `if (GetItemFieldFunc(itemId))` — pas de field func :
    // l'item n'a pas d'utilisation hors-battle. Retour direct à la liste.
    RemoveContextWindow();
    _returnToList(task);
    return;
  }
  RemoveContextWindow();
  const itemType = GetItemType(itemId);
  if (itemType === 'ITEM_USE_PARTY_MENU' && gSaveBlock1Ptr.playerParty.length === 0) {
    // 1:1 :1801 PrintThereIsNoPokemon.
    _showItemMessage(task, _itemMsg('gText_NoPokemon'));
    return;
  }
  // 1:1 :1804-1806 — fill desc + dispatch (= GetItemFieldFunc(itemId)(taskId)),
  // via switch sur le nom du handler (chaque case = le field func 1:1 de item_use.c).
  const itemName = GetItemName(itemId);
  let msg: string;
  switch (fieldUseFunc) {
    case 'ItemUseOutOfBattle_CannotUse':
      // 1:1 décomp item_use.c — gText_DadsAdvice (strings.json FR officielle).
      msg = _itemMsg('gText_DadsAdvice');
      break;
    case 'ItemUseOutOfBattle_Medicine': {
      // 1:1 décomp item_use.c:753-757 ItemUseOutOfBattle_Medicine :
      //     gItemUseCB = ItemUseCB_Medicine;
      //     SetUpItemUseCallback(taskId);
      //
      // SetUpItemUseCallback (item_use.c:98) :
      //     gBagMenu->newScreenCallback = CB2_ShowPartyMenuForItemUse;
      //     Task_FadeAndCloseBagMenu(taskId);
      //
      // → fade bag → ouvre party-screen en mode PARTY_ACTION_USE_ITEM
      // ("Utiliser sur quel POKéMON ?") → user select mon → ItemUseCB_Medicine
      // s'exécute (apply ApplyMedicineEffect + remove from bag + close).
      // Le item-use-callbacks.ts module porte CB2_ShowPartyMenuForItemUse,
      // CB2_ReturnToBagMenu, et ItemUseCB_Medicine.
      void itemName;
      void ApplyMedicineEffect;  // (utilisé par ItemUseCB_Medicine, exposé pour DCE)
      if (gSaveBlock1Ptr.playerParty.length === 0) {
        _showItemMessage(task, _itemMsg('gText_NoPokemon'));
        return;
      }
      setItemUseCB(ItemUseCB_Medicine);
      SetUpItemUseCallback(task);
      return;
    }
    case 'ItemUseOutOfBattle_TMHM': {
      // 1:1 décomp item_use.c:789-795 ItemUseOutOfBattle_TMHM :
      //     if (gSpecialVar_ItemId >= ITEM_HM01)
      //         DisplayItemMessage(taskId, FONT_NORMAL, gText_BootedUpHM, BootUpSoundTMHM);
      //     else
      //         DisplayItemMessage(taskId, FONT_NORMAL, gText_BootedUpTM, BootUpSoundTMHM);
      // Chaîne complète : BootUpSoundTMHM (SE_PC_LOGIN) → Task_ShowTMHMContainedMessage
      // (A/B → "Elle contient {move}. Apprendre {move} à un POKéMON?") → UseTMHMYesNo
      // → OUI = UseTMHM (gItemUseCB = ItemUseCB_TMHM + SetUpItemUseCallback) /
      // NON = CloseItemMessage.
      if (gSaveBlock1Ptr.playerParty.length === 0) {
        _showItemMessage(task, _itemMsg('gText_NoPokemon'));
        return;
      }
      ItemUseOutOfBattle_TMHM(task);
      return;
    }
    case 'ItemUseOutOfBattle_PPRecovery': {
      // 1:1 décomp item_use.c:770-775 ItemUseOutOfBattle_PPRecovery :
      //     gItemUseCB = ItemUseCB_PPRecovery;
      //     SetUpItemUseCallback(taskId);
      if (gSaveBlock1Ptr.playerParty.length === 0) {
        _showItemMessage(task, _itemMsg('gText_NoPokemon'));
        return;
      }
      setItemUseCB(ItemUseCB_PPRecovery);
      SetUpItemUseCallback(task);
      return;
    }
    case 'ItemUseOutOfBattle_PPUp': {
      // 1:1 décomp item_use.c:776-781 ItemUseOutOfBattle_PPUp.
      if (gSaveBlock1Ptr.playerParty.length === 0) {
        _showItemMessage(task, _itemMsg('gText_NoPokemon'));
        return;
      }
      setItemUseCB(ItemUseCB_PPUp);
      SetUpItemUseCallback(task);
      return;
    }
    case 'ItemUseOutOfBattle_RareCandy': {
      // 1:1 décomp item_use.c:782-787 ItemUseOutOfBattle_RareCandy.
      if (gSaveBlock1Ptr.playerParty.length === 0) {
        _showItemMessage(task, _itemMsg('gText_NoPokemon'));
        return;
      }
      setItemUseCB(ItemUseCB_RareCandy);
      SetUpItemUseCallback(task);
      return;
    }
    case 'ItemUseOutOfBattle_ReduceEV': {
      // 1:1 décomp item_use.c:758-763 ItemUseOutOfBattle_ReduceEV (= baies).
      if (gSaveBlock1Ptr.playerParty.length === 0) {
        _showItemMessage(task, _itemMsg('gText_NoPokemon'));
        return;
      }
      setItemUseCB(ItemUseCB_ReduceEV);
      SetUpItemUseCallback(task);
      return;
    }
    case 'ItemUseOutOfBattle_SacredAsh': {
      // 1:1 décomp item_use.c:764-769 ItemUseOutOfBattle_SacredAsh.
      if (gSaveBlock1Ptr.playerParty.length === 0) {
        _showItemMessage(task, _itemMsg('gText_NoPokemon'));
        return;
      }
      setItemUseCB(ItemUseCB_SacredAsh);
      SetUpItemUseCallback(task);
      return;
    }
    case 'ItemUseOutOfBattle_EvolutionStone': {
      // 1:1 décomp item_use.c:942-948 ItemUseOutOfBattle_EvolutionStone.
      if (gSaveBlock1Ptr.playerParty.length === 0) {
        _showItemMessage(task, _itemMsg('gText_NoPokemon'));
        return;
      }
      setItemUseCB(ItemUseCB_EvolutionStone);
      SetUpItemUseCallback(task);
      return;
    }
    case 'ItemUseOutOfBattle_Bike': {
      // 1:1 décomp `ItemUseOutOfBattle_Bike` (item_use.c:200) :
      //   if (Overworld_IsBikingAllowed() && !IsBikingDisallowedByPlayer()) {
      //     sItemUseOnFieldCB = ItemUseOnFieldCB_Bike; SetUpItemUseOnFieldCallback(taskId); }
      //   else DisplayDadsAdviceCannotUseItemMessage();
      // `ItemUseOnFieldCB_Bike` → GetOnOffBike(MACH/ACRO selon GetItemSecondaryId). On pose
      // `gFieldCallback` (run au retour OW via RunFieldCallback) + Task_FadeAndCloseBagMenu, comme le rod.
      // (Branche cycling-road/rails « can't dismount » = dette mineure, Cycling Road seulement.)
      if (_bikeMod && _playerAvatarMod && _overworldMod
        && _overworldMod.Overworld_IsBikingAllowed() && !_bikeMod.IsBikingDisallowedByPlayer()) {
        const bk = _bikeMod;
        const pa = _playerAvatarMod;
        const bikeItemId = itemId;
        // 1:1 décomp `sItemUseOnFieldCB = ItemUseOnFieldCB_Bike; SetUpItemUseOnFieldCallback(taskId)`
        // (item_use.c:216-217). Le CB tourne au retour OW (RunFieldCallback → FieldCB_UseItemOnField
        // → Task_CallItemUseOnFieldCallback). ItemUseOnFieldCB_Bike (item_use.c:226) : GetOnOffBike
        // (MACH/ACRO selon GetItemSecondaryId) puis DestroyTask. M3 : précharge la gfx vélo (keystone)
        // avant GetOnOffBike. DestroyTask SYNCHRONE en tête (le task re-tique chaque frame sinon).
        setItemUseOnFieldCB((t) => {
          getRuntime()?.DestroyTask(t.taskId);
          const sec = GetItemSecondaryId(bikeItemId);  // 'MACH_BIKE' / 'ACRO_BIKE'
          const flag = sec === 'ACRO_BIKE' ? pa.PLAYER_AVATAR_FLAG_ACRO_BIKE : pa.PLAYER_AVATAR_FLAG_MACH_BIKE;
          const state = sec === 'ACRO_BIKE' ? pa.PLAYER_AVATAR_STATE_ACRO_BIKE : pa.PLAYER_AVATAR_STATE_MACH_BIKE;
          Promise.resolve(pa.PreloadObjectEventGraphics(pa.GetPlayerAvatarGraphicsIdByStateId(state)))
            .then(() => {
              bk.GetOnOffBike(flag);
              // 1:1 décomp `ItemUseOnFieldCB_Bike` (item_use.c:231-232) : ScriptUnfreeze
              // ObjectEvents() + UnlockPlayerFieldControls() après GetOnOffBike. DÉVERROUILLE le
              // path registered (SELECT vélo → UseRegisteredKeyItemOnField a Freeze+Lock). Idempotent
              // pour le path sac (déjà déverrouillé/dégelé au retour OW).
              _eventObjLockMod?.ScriptUnfreezeObjectEvents();  // item_use.c:231
              (globalThis as Record<string, unknown>).__sLockFieldControls = false;  // UnlockPlayerFieldControls (item_use.c:232)
            });
        });
        SetUpItemUseOnFieldCallback(task);
        return;
      }
      msg = _itemMsg('gText_DadsAdvice');
      break;
    }
    case 'ItemUseOutOfBattle_EscapeRope': {
      // 1:1 décomp `ItemUseOutOfBattle_EscapeRope` (item_use.c:930) :
      //   if (CanUseDigOrEscapeRopeOnCurMap()) { sItemUseOnFieldCB = ItemUseOnFieldCB_
      //     EscapeRope; SetUpItemUseOnFieldCallback(taskId); }
      //   else DisplayDadsAdviceCannotUseItemMessage();
      // ItemUseOnFieldCB_EscapeRope (item_use.c:914) : Overworld_ResetStateAfterDigEscRope
      // + RemoveUsedItem + message + Task_UseDigEscapeRopeOnField → StartEscapeRope
      // FieldEffect (= warp vers escapeWarp, réutilise le mécanisme Dig via fldeff_dig).
      if (CanUseDigOrEscapeRopeOnCurMap()) {
        const escItemId = itemId;
        setItemUseOnFieldCB((t) => {
          getRuntime()?.DestroyTask(t.taskId);
          Overworld_ResetStateAfterDigEscRope();
          _CtxRemoveUsedItem(escItemId);
          // DETTE : DisplayItemMessageOnField ("{PLAYER} a utilisé {ITEM}.") +
          // ResetInitialPlayerAvatarState (dismount bike/surf avant warp) non portés.
          StartEscapeRopeFieldEffect();
        });
        SetUpItemUseOnFieldCallback(task);
        return;
      }
      // 1:1 :939 map n'autorise pas l'évasion → DadsAdvice.
      msg = _itemMsg('gText_DadsAdvice');
      break;
    }
    case 'ItemUseOutOfBattle_Repel': {
      // 1:1 décomp item_use.c:841-873 ItemUseOutOfBattle_Repel + Task_UseRepel.
      const repelActive = VarGet('VAR_REPEL_STEP_COUNT');
      if (repelActive > 0) {
        // 1:1 :845 — un autre repel est encore actif (gText_RepelEffectsLingered).
        _showItemMessage(task, _itemMsg('gText_RepelEffectsLingered'));
      } else {
        // 1:1 :867-868 — set step count = holdEffectParam de l'item + RemoveUsedItem.
        const itemKey = _itemKeyFromBag(itemId);
        const item = itemKey ? _getItem(itemKey) : undefined;
        const steps = item?.holdEffectParam ?? 100;
        VarSet('VAR_REPEL_STEP_COUNT', steps);
        _CtxRemoveUsedItem(itemId);
        // 1:1 Task_UseRepel — gText_UsedVar2WildRepelled ({PLAYER} utilise {STR_VAR_2}…).
        _showItemMessageThenRebuild(task, _itemMsg('gText_UsedVar2WildRepelled', { v2: itemName }));
      }
      return;
    }
    case 'ItemUseOutOfBattle_BlackWhiteFlute': {
      // 1:1 décomp item_use.c:888-902 — set encounter flag selon White/Black.
      // ITEM_WHITE_FLUTE = 43, ITEM_BLACK_FLUTE = 42.
      if (itemId === 43 /* ITEM_WHITE_FLUTE */) {
        FlagSet('FLAG_SYS_ENC_UP_ITEM');
        FlagClear('FLAG_SYS_ENC_DOWN_ITEM');
        msg = _itemMsg('gText_UsedVar2WildLured', { v2: itemName });
      } else {
        FlagSet('FLAG_SYS_ENC_DOWN_ITEM');
        FlagClear('FLAG_SYS_ENC_UP_ITEM');
        msg = _itemMsg('gText_UsedVar2WildRepelled', { v2: itemName });
      }
      // Note 1:1 : flute reusable = pas de RemoveBagItem.
      break;
    }
    case 'ItemUseOutOfBattle_CoinCase': {
      // 1:1 décomp item_use.c:654-667 ItemUseOutOfBattle_CoinCase :
      //     ConvertIntToDecimalStringN(gStringVar1, GetCoins(),
      //         STR_CONV_MODE_LEFT_ALIGN, 4);
      //     StringExpandPlaceholders(gStringVar4, gText_CoinCase);
      //     DisplayItemMessage(gStringVar4, ...);
      const coins = GetSaveBlock1().coins ?? 0;
      const tmpl = getString('gText_CoinCase');  // "JETONS:\n{STR_VAR_1}{PAUSE_UNTIL_PRESS}"
      msg = tmpl
        .replace('{STR_VAR_1}', String(coins))
        .replace('{PAUSE_UNTIL_PRESS}', '')
        .replace(/\\n/g, '\n')
        .replace(/\\p/g, '\n');
      break;
    }
    case 'ItemUseOutOfBattle_PowderJar': {
      // 1:1 décomp item_use.c:669-682 ItemUseOutOfBattle_PowderJar :
      //     ConvertIntToDecimalStringN(gStringVar1, GetBerryPowder(),
      //         STR_CONV_MODE_LEFT_ALIGN, 5);
      //     StringExpandPlaceholders(gStringVar4, gText_PowderQty);
      const powder = GetSaveBlock2().berryCrush?.berryPowderAmount ?? 0;
      const tmpl = getString('gText_PowderQty');  // "QUANT. POUDRE: {STR_VAR_1}{PAUSE_UNTIL_PRESS}"
      msg = tmpl
        .replace('{STR_VAR_1}', String(powder))
        .replace('{PAUSE_UNTIL_PRESS}', '')
        .replace(/\\n/g, '\n')
        .replace(/\\p/g, '\n');
      break;
    }
    case 'ItemUseOutOfBattle_EnigmaBerry': {
      // 1:1 décomp item_use.c:1063-1105 ItemUseOutOfBattle_EnigmaBerry :
      //     switch (GetItemEffectType(item)) {
      //         case HEAL_HP/CURE_*/*_EV: ItemUseOutOfBattle_Medicine(taskId);
      //         case SACRED_ASH: ItemUseOutOfBattle_SacredAsh(taskId);
      //         case RAISE_LEVEL: ItemUseOutOfBattle_RareCandy(taskId);
      //         case PP_UP/PP_MAX: ItemUseOutOfBattle_PPUp(taskId);
      //         case HEAL_PP: ItemUseOutOfBattle_PPRecovery(taskId);
      //         default: ItemUseOutOfBattle_CannotUse(taskId);
      //     }
      // L'EnigmaBerry est custom (= save block enigmaBerry.itemEffect) mais
      // pour cette ROM-port l'enigma berry est vierge → fallback CannotUse 1:1.
      const ef = GetItemEffectType(itemId);
      if (gSaveBlock1Ptr.playerParty.length === 0) {
        _showItemMessage(task, _itemMsg('gText_NoPokemon'));
        return;
      }
      switch (ef) {
        case ITEM_EFFECT_HEAL_HP:
        case ITEM_EFFECT_CURE_POISON:
        case ITEM_EFFECT_CURE_SLEEP:
        case ITEM_EFFECT_CURE_BURN:
        case ITEM_EFFECT_CURE_FREEZE:
        case ITEM_EFFECT_CURE_PARALYSIS:
        case ITEM_EFFECT_CURE_ALL_STATUS:
        case ITEM_EFFECT_HP_EV:
        case ITEM_EFFECT_ATK_EV:
        case ITEM_EFFECT_DEF_EV:
        case ITEM_EFFECT_SPEED_EV:
        case ITEM_EFFECT_SPATK_EV:
        case ITEM_EFFECT_SPDEF_EV:
          setItemUseCB(ItemUseCB_Medicine);
          SetUpItemUseCallback(task);
          return;
        case ITEM_EFFECT_RAISE_LEVEL:
          setItemUseCB(ItemUseCB_RareCandy);
          SetUpItemUseCallback(task);
          return;
        case ITEM_EFFECT_PP_UP:
        case ITEM_EFFECT_PP_MAX:
          setItemUseCB(ItemUseCB_PPUp);
          SetUpItemUseCallback(task);
          return;
        case ITEM_EFFECT_HEAL_PP:
          setItemUseCB(ItemUseCB_PPRecovery);
          SetUpItemUseCallback(task);
          return;
        default:
          msg = _itemMsg('gText_DadsAdvice');
          break;
      }
      break;
    }
    case 'ItemUseOutOfBattle_Itemfinder': {
      // 1:1 décomp item_use.c:286-298 ItemUseOutOfBattle_Itemfinder :
      //     sItemUseOnFieldCB = ItemUseOnFieldCB_Itemfinder;
      //     SetUpItemUseOnFieldCallback(var);
      // → fade bag → ItemfinderCheckForHiddenItems(gMapHeader.events) :
      //   - Scan bgEvents pour kind='hidden_item' dans range player ±7H ±5V
      //   - Si trouvé → Task_UseItemfinder (player spin + bip beeps + face)
      //   - Sinon → gText_ItemFinderNothing "… … … Non!\nPas de réaction."
      // Notre port : check basique = au moins un bg_event hidden_item sur le
      // map (= sans flag-picked check, polish ultérieur). Le sac est fermé
      // pour 1:1 décomp (= fade + display on field), mais notre version
      // garde le sac ouvert et display dans WIN_DESCRIPTION pour ne pas
      // perdre l'état (polish ultérieur = fade + scan animation).
      const events = gMapHeader?.events?.bgEvents ?? [];
      const hasHidden = events.some(e => e.kind === 'hidden_item');
      if (!hasHidden) {
        // 1:1 gText_ItemFinderNothing FR officielle.
        const tmpl = getString('gText_ItemFinderNothing');
        msg = tmpl.replace('{PAUSE_UNTIL_PRESS}', '').replace(/\\n/g, '\n').replace(/\\p/g, '\n');
      } else {
        // 1:1 décomp : si trouvé, lance Task_UseItemfinder (spin anim) → gText_ItemFinderNearby.
        // (Le spin-anim reste un polish ; le texte est désormais celui extrait.)
        msg = _itemMsg('gText_ItemFinderNearby');
      }
      break;
    }
    case 'ItemUseOutOfBattle_Rod': {
      // 1:1 décomp `ItemUseOutOfBattle_Rod` (item_use.c:267) :
      //   if (CanFish()) { sItemUseOnFieldCB = ItemUseOnFieldCB_Rod; SetUpItemUseOnFieldCallback(taskId); }
      //   else DisplayDadsAdviceCannotUseItemMessage();
      // `SetUpItemUseOnFieldCallback` pose `gFieldCallback` (run au retour OW via RunFieldCallback) +
      // `Task_FadeAndCloseBagMenu`. `ItemUseOnFieldCB_Rod` → `StartFishing(GetItemSecondaryId(itemId))`.
      if (_playerAvatarMod && _playerAvatarMod.CanFish()) {
        // GetItemSecondaryId renvoie 'OLD_ROD'/'GOOD_ROD'/'SUPER_ROD' (string) → rod 0/1/2.
        const rodSec = GetItemSecondaryId(itemId);
        const rod = rodSec === 'GOOD_ROD' ? 1 : rodSec === 'SUPER_ROD' ? 2 : 0;
        const pa = _playerAvatarMod;
        // 1:1 décomp `sItemUseOnFieldCB = ItemUseOnFieldCB_Rod; SetUpItemUseOnFieldCallback` (item_use.c:271).
        // ItemUseOnFieldCB_Rod (item_use.c:280) : StartFishing(secondaryId) puis DestroyTask.
        // ⚠️ M3 keystone : précharge le gfx FISHING (canne) AVANT StartFishing — sinon
        // SetPlayerAvatarFishing (Fishing_GetRodOut) swappe vers un gfx non chargé → le perso
        // reste en gfx NORMAL (pas de canne en main) ET l'anim « no-catch » tombe sur une anim de
        // marche qui BOUCLE → Fishing_PutRodAway attend `animEnded` à jamais → tâche zombie + jitter
        // x2. (Même nécessité que le bike + les dev-hooks __StartFishing/__SetPlayerAvatarFishing.)
        setItemUseOnFieldCB((t) => {
          getRuntime()?.DestroyTask(t.taskId);
          Promise.resolve(pa.PreloadObjectEventGraphics(pa.GetPlayerAvatarGraphicsIdByStateId(pa.PLAYER_AVATAR_STATE_FISHING)))
            .then(() => { pa.StartFishing(rod); });
        });
        SetUpItemUseOnFieldCallback(task);
        return;
      }
      msg = _itemMsg('gText_DadsAdvice');
      break;
    }
    case 'ItemUseOutOfBattle_Mail':
      // 1:1 décomp `ItemUseOutOfBattle_Mail` (item_use.c:196) :
      //   gBagMenu->newScreenCallback = CB2_CheckMail; Task_FadeAndCloseBagMenu(taskId);
      // → fade sac → CB2_CheckMail affiche le DESIGN de la lettre (ReadMail, blanc, pas
      //   de texte car la lettre du sac n'est pas encore écrite) → retour sac (LAST).
      gBagMenu!.newScreenCallback = CB2_CheckMail;
      Task_FadeAndCloseBagMenu(task);
      return;
    case 'ItemUseOutOfBattle_PokeblockCase':
    case 'ItemUseOutOfBattle_Berry':
    case 'ItemUseOutOfBattle_WailmerPail':
      // 1:1 décomp : ces handlers ouvrent un screen dédié (pokeblock) ou un sous-système overworld
      // (wailmer berry / plant berry) pas encore portés → DadsAdvice 1:1 (condition prerequisite jamais
      // remplie). À étendre quand pokeblock/berry-water seront portés (chantiers indépendants).
      msg = _itemMsg('gText_DadsAdvice');
      break;
    default:
      // Handler inconnu → DadsAdvice 1:1 FR pour ne pas exposer le nom interne.
      msg = _itemMsg('gText_DadsAdvice');
  }
  _showItemMessage(task, msg);
}

/** Construit un message à partir d'un gText EXTRAIT (strings.json), avec expansion
 *  des placeholders {PLAYER}/{STR_VAR_1}/{STR_VAR_2}/{PAUSE_UNTIL_PRESS}/escapes —
 *  ZÉRO texte FR inline (cf. sonde `scripts/audit-hardcoded-strings.cjs`). */
function _itemMsg(gTextKey: string, opts?: { v1?: string; v2?: string }): string {
  return getString(gTextKey)
    .replace('{PLAYER}', GetPlayerNameString())
    .replace('{STR_VAR_1}', opts?.v1 ?? '')
    .replace('{STR_VAR_2}', opts?.v2 ?? '')
    .replace('{PAUSE_UNTIL_PRESS}', '')
    .replace(/\\n/g, '\n').replace(/\\p/g, '\n');
}

/** Helper temporaire : affiche `msg` dans WIN_DESCRIPTION puis bascule la
 *  task en wait-for-A. Sur press A/B → return list (sans rebuild). */
/** 1:1 décomp : les messages d'utilisation d'item (DadsAdvice, CoinCase, Repel,
 *  Itemfinder…) s'affichent dans la VRAIE boîte message ITEMWIN_MESSAGE (encadrée,
 *  27 tiles pleine largeur) — PAS WIN_DESCRIPTION (14 tiles → débordement, ex
 *  gText_DadsAdvice "…{PLAYER}, chaque chose en son temps!"). On dessine le cadre
 *  dialogue (tile=10 pal=13, = DisplayMessageAndContinueTask) + texte instantané +
 *  wait-task. (Le flux TOSS garde WIN_DESCRIPTION via _CtxPrintItemMessage.) */
function _printItemUseMessageBox(msg: string): void {
  const wid = AddItemMessageWindow(ITEMWIN_MESSAGE);
  DrawDialogFrameWithCustomTileAndPalette(wid, true, 10, 13);
  FillWindowPixelBuffer(wid, PIXEL_FILL(1));
  // 1:1 décomp `DisplayMessageAndContinueTask` (menu_helpers.c:133) : couleurs de la
  // boîte de dialogue = fg=DARK_GRAY (texte SOMBRE), bg=WHITE, shadow=LIGHT_GRAY.
  // ⚠️ PAS COLORID_NORMAL (fg=WHITE=index 1) : dans la palette du cadre-dialogue
  // (slot 13), l'index WHITE rend blanc → texte invisible sur fond clair. (La liste
  // rend sombre avec COLORID_NORMAL car SA fenêtre utilise une AUTRE palette où
  // l'index 1 est sombre.) speed=0 = instantané (le wait-for-A gère la fermeture).
  AddTextPrinterParameterized2(wid, FONT_NORMAL, msg, 0, null,
    TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY);
  ScheduleBgCopyTilemapToVram(1);
}
function _showItemMessage(task: DecompTask, msg: string): void {
  _printItemUseMessageBox(msg);
  task.func = Task_ItemUseMessageWaitForA;
}

/** Variant qui rebuild la liste après press A (= post-use d'item consommé :
 *  Repel/Medicine/etc. → quantité décrémentée, faut recharger la liste). */
function _showItemMessageThenRebuild(task: DecompTask, msg: string): void {
  _printItemUseMessageBox(msg);
  task.func = Task_ItemUseMessageWaitForAThenRebuild;
}

/** Task wait-for-A : tout press A/B → return list. */
function Task_ItemUseMessageWaitForA(task: DecompTask): void {
  if (JOY_NEW(A_BUTTON) || JOY_NEW(B_BUTTON)) {
    PlaySE(SE_SELECT);
    RemoveItemMessageWindow(ITEMWIN_MESSAGE);  // ferme la boîte message encadrée
    _CtxReturnToList(task.taskId);
  }
}

/** Variant Task qui rebuild la liste après press. */
function Task_ItemUseMessageWaitForAThenRebuild(task: DecompTask): void {
  if (JOY_NEW(A_BUTTON) || JOY_NEW(B_BUTTON)) {
    PlaySE(SE_SELECT);
    RemoveItemMessageWindow(ITEMWIN_MESSAGE);  // ferme la boîte message encadrée
    _CtxReturnToListWithRebuild(task.taskId);
  }
}

/** Récupère l'itemKey items.json à partir d'un itemId numérique. Pour les
 *  items non-TM/HM (= cas standard : POTION, REPEL, BIKE, etc.), l'enum-
 *  numbered de constants.items est IDENTIQUE à la clé items.json. Pour TM/HM
 *  (ITEM_TM01 ≠ items.json "ITEM_TM_FOCUS_PUNCH"), les handlers Repel/Bike/
 *  EscapeRope/Mail/etc. ne sont JAMAIS appelés (= leur fieldUseFunc est
 *  Medicine/TMHM, dispatché ailleurs). Donc getItemKeyById suffit ici. */
function _itemKeyFromBag(itemId: number): string {
  return getItemKeyById(itemId);
}

/** 1:1 décomp `ItemMenu_Toss(u8 taskId)` (item_menu.c:1817) : qty==1 → AskTossItems
 *  direct ; sinon → fenêtre quantité (Task_ChooseHowManyToToss). Le yes/no de
 *  confirmation passe par la primitive PARTAGÉE `CreateYesNoMenuWithCallbacks`
 *  (témoin `.func`) au lieu d'un sous-état maison. */
function ItemMenu_Toss(task: DecompTask): void {
  RemoveContextWindow();
  task.data[T_ITEM_COUNT] = 1;
  if (task.data[T_QUANTITY] === 1) {
    AskTossItems(task);
  } else {
    // 1:1 :1828-1834 : "Combien à jeter ?" + AddItemQuantityWindow(ITEMWIN_QUANTITY).
    _CtxPrintItemMessage(_itemMsg('gText_TossHowManyVar1s'));
    const qWid = BagMenu_AddWindow(ITEMWIN_QUANTITY);
    _CtxPrintQuantityInWindow(qWid, 1);
    task.func = Task_ChooseHowManyToToss;
  }
}

/** 1:1 décomp `Task_ChooseHowManyToToss` (item_menu.c:1859) : DPad ajuste le
 *  compte, A confirme (→ AskTossItems), B annule (→ CancelToss). */
function Task_ChooseHowManyToToss(task: DecompTask): void {
  const ref = { value: task.data[T_ITEM_COUNT] };
  if (AdjustQuantityAccordingToDPadInput(ref, task.data[T_QUANTITY])) {
    task.data[T_ITEM_COUNT] = ref.value;
    _CtxPrintQuantityInWindow(gBagMenu!.windowIds[ITEMWIN_QUANTITY], ref.value);
  } else if (JOY_NEW(A_BUTTON)) {
    PlaySE(SE_SELECT);
    BagMenu_RemoveWindow(ITEMWIN_QUANTITY);
    AskTossItems(task);
  } else if (JOY_NEW(B_BUTTON)) {
    PlaySE(SE_SELECT);
    BagMenu_RemoveWindow(ITEMWIN_QUANTITY);
    CancelToss(task);
  }
}

/** 1:1 décomp `AskTossItems` (item_menu.c:1838) : "{item}: en jeter {N}?" +
 *  BagMenu_YesNo(taskId, ITEMWIN_YESNO_LOW, &sYesNoTossFunctions). */
function AskTossItems(task: DecompTask): void {
  _CtxPrintItemMessage(_itemMsg('gText_ConfirmTossItems', { v1: GetItemName(gSpecialVar.ItemId), v2: String(task.data[T_ITEM_COUNT]) }));
  _tossTaskId = task.taskId;
  // 1:1 décomp BagMenu_YesNo = CreateYesNoMenuWithCallbacks(taskId, template, 1, 0, 2, 1, 14, funcs).
  CreateYesNoMenuWithCallbacks(task.taskId, sContextMenuWindowTemplates[ITEMWIN_YESNO_LOW], 1, 0, 2, 1, 14, sYesNoTossFunctions);
}

/** 1:1 décomp `ConfirmToss` (item_menu.c:1882) : "{item}: jeté {N}." puis
 *  repointe vers Task_RemoveItemFromBag. (Func yes/no zéro-arg → _tossTaskId.) */
function ConfirmToss(): void {
  const rt = getRuntime();
  const task = rt?.gTasks[_tossTaskId];
  if (!task) return;
  _CtxPrintItemMessage(_itemMsg('gText_ThrewAwayVar2Var1s', { v1: GetItemName(gSpecialVar.ItemId), v2: String(task.data[T_ITEM_COUNT]) }));
  task.func = Task_RemoveItemFromBag;
}

/** 1:1 décomp `Task_RemoveItemFromBag` (item_menu.c:1898) : attend A/B → RemoveBagItem
 *  + **UpdatePocketItemList (compaction)** + UpdatePocketListPosition + rebuild liste.
 *  La compaction (= virer le slot vidé) est l'étape décomp que j'avais sautée en
 *  prenant le raccourci `_CtxReturnToListWithRebuild` → d'où le phantom "??? ×0". */
function Task_RemoveItemFromBag(task: DecompTask): void {
  if (JOY_NEW(A_BUTTON | B_BUTTON)) {
    PlaySE(SE_SELECT);
    RemoveBagItem(getItemKeyById(gSpecialVar.ItemId), task.data[T_ITEM_COUNT]);
    // 1:1 décomp :1908 : UpdatePocketItemList(pocket) compacte AVANT de reconstruire
    // la liste affichée (sinon le slot vidé reste dans le buffer = "???????? ×0").
    // Version 1:1 locale (item_menu.c:1105, number) = compact + recompute counts,
    // ≠ helper data-only de bag.ts (consolidation : on prend la 1:1).
    UpdatePocketItemList(gBagPosition.pocket);
    _CtxReturnToListWithRebuild(task.taskId);
  }
}

/** 1:1 décomp `CancelToss` (item_menu.c:1850) : re-print desc + cursor + retour liste. */
function CancelToss(task: DecompTask): void {
  _CtxReturnToList(task.taskId);
}
/** Variante zéro-arg pour le yes/no (NON callback) → _tossTaskId. */
function CancelTossYesNo(): void {
  const rt = getRuntime();
  const task = rt?.gTasks[_tossTaskId];
  if (task) CancelToss(task);
}

/** 1:1 décomp `sYesNoTossFunctions` (item_menu.c:359) = {ConfirmToss, CancelToss}. */
const sYesNoTossFunctions = { yesFunc: ConfirmToss, noFunc: CancelTossYesNo };

// ═══════════════════════════════════════════════════════════════════════════
//  ItemPC — DÉPÔT d'objets du sac vers le PC (item_menu.c:593, 2203-2287) — INERTE
// ═══════════════════════════════════════════════════════════════════════════
// `sContextMenuFuncs[ITEMMENULOCATION_ITEMPC] = Task_ItemContext_Deposit` (item_menu.c:351,
// branche ajoutée ci-dessus dans Task_BagMenu_HandleInput). AUCUN call-site n'ouvre encore
// le sac en mode ITEMPC : player_pc.ts appelle le clone bag-screen.ts jusqu'au Lot 3. PORT 1:1.

/** 1:1 décomp `#define MAX_ITEM_DIGITS BERRY_CAPACITY_DIGITS` (include/constants/items.h:458). */
const MAX_ITEM_DIGITS = BERRY_CAPACITY_DIGITS;

/** 1:1 décomp `void CB2_GoToItemDepositMenu(void)` (item_menu.c:593) :
 *  `GoToBagMenu(ITEMMENULOCATION_ITEMPC, POCKETS_COUNT, CB2_PlayerPCExitBagMenu)`.
 *  Ouvre le sac en mode ITEMPC (choisir un objet DU SAC à déposer dans le PC).
 *  L'exitCallback `CB2_PlayerPCExitBagMenu` vit dans player_pc.ts (foyer player_pc.c:571,
 *  hors périmètre Lots 1/2) → résolu par pont globalThis (pattern CB2_FavorLadyExitBagMenu :3489).
 *  Câblage réel (player_pc.ts expose __CB2_PlayerPCExitBagMenu) = Lot 2/3. */
export function CB2_GoToItemDepositMenu(): void {
  GoToBagMenu(ITEMMENULOCATION_ITEMPC, POCKETS_COUNT, _CB2_PlayerPCExitBagMenu);
}
function _CB2_PlayerPCExitBagMenu(): void {
  const cb = (globalThis as Record<string, unknown>).__CB2_PlayerPCExitBagMenu as (() => void) | undefined;
  if (cb) { cb(); return; }
  console.error('[item-deposit] __CB2_PlayerPCExitBagMenu absent (player_pc.ts non câblé — Lot 2/3)');
}

/** 1:1 décomp `Task_ItemContext_Deposit(u8 taskId)` (item_menu.c:2203) : qty==1 → dépôt direct
 *  (TryDepositItem) ; sinon → "Vous voulez en déposer combien?" + fenêtre quantité. */
function Task_ItemContext_Deposit(task: DecompTask): void {
  task.data[T_ITEM_COUNT] = 1; // 1:1 :2207 tItemCount = 1
  if (task.data[T_QUANTITY] === 1) {
    TryDepositItem(task); // 1:1 :2210
  } else {
    // 1:1 :2214-2217 CopyItemName(item, gStringVar1) + StringExpandPlaceholders(gStringVar4,
    // gText_DepositHowManyVar1) + FillWindowPixelBuffer(WIN_DESCRIPTION) + BagMenu_Print.
    setStringVar(1, CopyItemName(gSpecialVar.ItemId));
    StringExpandPlaceholders(gStringVar4, encodeOwText(getString('gText_DepositHowManyVar1')));
    FillWindowPixelBuffer(_win(WIN_DESCRIPTION), PIXEL_FILL(0));
    BagMenu_Print(_win(WIN_DESCRIPTION), FONT_NORMAL, gStringVar4, 3, 1, 0, 0, 0, COLORID_NORMAL);
    // 1:1 :2218 AddItemQuantityWindow(ITEMWIN_QUANTITY) = BagMenu_AddWindow + PrintItemQuantity(...,1).
    const qWid = BagMenu_AddWindow(ITEMWIN_QUANTITY);
    _CtxPrintQuantityInWindow(qWid, 1);
    task.func = Task_ChooseHowManyToDeposit; // 1:1 :2219
  }
}

/** 1:1 décomp `Task_ChooseHowManyToDeposit(u8 taskId)` (item_menu.c:2223) : DPad ajuste le
 *  compte, A dépose (TryDepositItem), B annule (retour liste). */
function Task_ChooseHowManyToDeposit(task: DecompTask): void {
  const ref = { value: task.data[T_ITEM_COUNT] };
  if (AdjustQuantityAccordingToDPadInput(ref, task.data[T_QUANTITY])) {
    // 1:1 :2230 PrintItemQuantity(windowIds[ITEMWIN_QUANTITY], tItemCount, 0).
    task.data[T_ITEM_COUNT] = ref.value;
    _CtxPrintQuantityInWindow(gBagMenu!.windowIds[ITEMWIN_QUANTITY], ref.value);
  } else if (JOY_NEW(A_BUTTON)) {
    // 1:1 :2232-2236 A → dépose.
    PlaySE(SE_SELECT);
    BagMenu_RemoveWindow(ITEMWIN_QUANTITY);
    TryDepositItem(task);
  } else if (JOY_NEW(B_BUTTON)) {
    // 1:1 :2238-2244 B → annule : PrintItemDescription + BagMenu_PrintCursor(NORMAL) +
    // BagMenu_RemoveWindow + ReturnToItemList — folés dans _CtxReturnToList (comme CancelToss).
    PlaySE(SE_SELECT);
    BagMenu_RemoveWindow(ITEMWIN_QUANTITY);
    _CtxReturnToList(task.taskId);
  }
}

/** 1:1 décomp `TryDepositItem(u8 taskId)` (item_menu.c:2248) : refuse les objets importants,
 *  sinon AddPCItem → succès (Task_RemoveItemFromBag retire du sac) ou PC plein (erreur). */
function TryDepositItem(task: DecompTask): void {
  FillWindowPixelBuffer(_win(WIN_DESCRIPTION), PIXEL_FILL(0)); // 1:1 :2252
  if (GetItemImportance(gSpecialVar.ItemId)) {
    // 1:1 :2253-2257 objets importants non-déposables.
    StringExpandPlaceholders(gStringVar4, encodeOwText(getString('gText_CantStoreImportantItems')));
    BagMenu_Print(_win(WIN_DESCRIPTION), FONT_NORMAL, gStringVar4, 3, 1, 0, 0, 0, COLORID_NORMAL);
    task.func = WaitDepositErrorMessage;
  } else if (AddPCItem(GetBagItemKey(gSpecialVar.ItemId), task.data[T_ITEM_COUNT]) === true) {
    // 1:1 :2259-2266 dépôt réussi : "{item}:\ndéposé {N}." puis Task_RemoveItemFromBag.
    setStringVar(1, CopyItemName(gSpecialVar.ItemId)); // CopyItemName(item, gStringVar1)
    ConvertIntToDecimalStringN(gStringVar2, task.data[T_ITEM_COUNT], STR_CONV_MODE_LEFT_ALIGN, MAX_ITEM_DIGITS);
    StringExpandPlaceholders(gStringVar4, encodeOwText(getString('gText_DepositedVar2Var1s')));
    BagMenu_Print(_win(WIN_DESCRIPTION), FONT_NORMAL, gStringVar4, 3, 1, 0, 0, 0, COLORID_NORMAL);
    task.func = Task_RemoveItemFromBag;
  } else {
    // 1:1 :2268-2272 PC plein.
    StringExpandPlaceholders(gStringVar4, encodeOwText(getString('gText_NoRoomForItems')));
    BagMenu_Print(_win(WIN_DESCRIPTION), FONT_NORMAL, gStringVar4, 3, 1, 0, 0, 0, COLORID_NORMAL);
    task.func = WaitDepositErrorMessage;
  }
}

/** 1:1 décomp `WaitDepositErrorMessage(u8 taskId)` (item_menu.c:2276) : A/B → retour liste
 *  (PrintItemDescription + BagMenu_PrintCursor(NORMAL) + ReturnToItemList, folés dans _CtxReturnToList). */
function WaitDepositErrorMessage(task: DecompTask): void {
  if (JOY_NEW(A_BUTTON | B_BUTTON)) {
    PlaySE(SE_SELECT);
    _CtxReturnToList(task.taskId);
  }
}

// ─── Vraie message box du sac (item_menu.c) — ITEMWIN_MESSAGE encadrée ────────

/** 1:1 décomp `AddItemMessageWindow(windowType)` (item_menu.c:2511) : ajoute
 *  (idempotent) la fenêtre ; le cadre dialogue est tracé par DisplayMessageAndContinueTask. */
function AddItemMessageWindow(windowType: number): number {
  if (!gBagMenu) return 0;
  if (gBagMenu.windowIds[windowType] === WINDOW_NONE)
    gBagMenu.windowIds[windowType] = AddWindow(sContextMenuWindowTemplates[windowType]);
  return gBagMenu.windowIds[windowType];
}

/** 1:1 décomp `RemoveItemMessageWindow(windowType)` (item_menu.c:2519). */
function RemoveItemMessageWindow(windowType: number): void {
  if (!gBagMenu) return;
  const wid = gBagMenu.windowIds[windowType];
  if (wid === WINDOW_NONE) return;
  ClearDialogWindowAndFrameToTransparent(wid, false);
  ClearWindowTilemap(wid);
  RemoveWindow(wid);
  ScheduleBgCopyTilemapToVram(1);
  gBagMenu.windowIds[windowType] = WINDOW_NONE;
}

/** 1:1 décomp `DisplayItemMessage(taskId, fontId, str, callback)` (item_menu.c:1165) :
 *  vraie fenêtre message ENCADRÉE (ITEMWIN_MESSAGE) + message ANIMÉ + callback à la
 *  fin d'impression (DisplayMessageAndContinueTask, tile=10 pal=13). */
export function DisplayItemMessage(taskId: number, fontId: number, str: string | Uint8Array, callback: (task: DecompTask) => void): void {
  const wid = AddItemMessageWindow(ITEMWIN_MESSAGE);
  FillWindowPixelBuffer(wid, PIXEL_FILL(1));
  DisplayMessageAndContinueTask(taskId, wid, 10, 13, fontId, GetPlayerTextSpeedDelay(), str, callback);
  ScheduleBgCopyTilemapToVram(1);
}

/** 1:1 décomp `CloseItemMessage(taskId)` (item_menu.c:1175) : retire la fenêtre
 *  message + reconstruit la liste + retour navigation. */
export function CloseItemMessage(task: DecompTask): void {
  RemoveItemMessageWindow(ITEMWIN_MESSAGE);
  _CtxReturnToListWithRebuild(task.taskId);
}

// ─── Chaîne CT/CS (1:1 item_use.c:789-822) ────────────────────────────────────
// ItemUseOutOfBattle_TMHM → BootUpSoundTMHM → Task_ShowTMHMContainedMessage →
// UseTMHMYesNo → { UseTMHM | CloseItemMessage }. Transcrite ICI (comme les autres
// ItemUseOutOfBattle_* du dispatch) car elle consomme l'infra message/YesNo
// privée du sac (DisplayItemMessage / sContextMenuWindowTemplates).

/** 1:1 `void ItemUseOutOfBattle_TMHM(u8 taskId)` (item_use.c:789-795). */
function ItemUseOutOfBattle_TMHM(task: DecompTask): void {
  if (gSpecialVar.ItemId >= ITEM_HM01)
    DisplayItemMessage(task.taskId, FONT_NORMAL, encodeOwText(getString('gText_BootedUpHM')), BootUpSoundTMHM);   // HM
  else
    DisplayItemMessage(task.taskId, FONT_NORMAL, encodeOwText(getString('gText_BootedUpTM')), BootUpSoundTMHM);   // TM
}

/** 1:1 `static void BootUpSoundTMHM(u8 taskId)` (item_use.c:797-801) :
 *  PlaySE(SE_PC_LOGIN) + `gTasks[taskId].func = Task_ShowTMHMContainedMessage`.
 *  (Pattern task : le runtime passe l'OBJET task à func.) */
function BootUpSoundTMHM(task: DecompTask): void {
  PlaySE(SE_PC_LOGIN);
  task.func = Task_ShowTMHMContainedMessage;
}

/** 1:1 `static void Task_ShowTMHMContainedMessage(u8 taskId)` (item_use.c:803-811) :
 *  JOY_NEW(A|B) → gStringVar1 = gMoveNames[ItemIdToBattleMoveId(item)] +
 *  gText_TMHMContainedVar1 ("Elle contient {move}. Apprendre {move} à un
 *  POKéMON?") → DisplayItemMessage(…, UseTMHMYesNo). */
function Task_ShowTMHMContainedMessage(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  const KEY_A = 0x0001, KEY_B = 0x0002;   // A_BUTTON | B_BUTTON
  if (rt.gMain.newKeys & (KEY_A | KEY_B)) {
    const moveName = getMoveName(ItemIdToBattleMoveId(gSpecialVar.ItemId)) || '';
    const msg = (getString('gText_TMHMContainedVar1') || '').replace(/\{STR_VAR_1\}/g, moveName);
    DisplayItemMessage(task.taskId, FONT_NORMAL, encodeOwText(msg), UseTMHMYesNo);
  }
}

/** 1:1 `static void UseTMHMYesNo(u8 taskId)` (item_use.c:813-816) :
 *  BagMenu_YesNo(taskId, ITEMWIN_YESNO_HIGH, &sUseTMHMYesNoFuncTable). */
function UseTMHMYesNo(task: DecompTask): void {
  // 1:1 décomp BagMenu_YesNo = CreateYesNoMenuWithCallbacks(taskId, template, 1, 0, 2, 1, 14, funcs).
  CreateYesNoMenuWithCallbacks(task.taskId, sContextMenuWindowTemplates[ITEMWIN_YESNO_HIGH], 1, 0, 2, 1, 14, sUseTMHMYesNoFuncTable);
}

/** 1:1 `static void UseTMHM(u8 taskId)` (item_use.c:818-822) :
 *  gItemUseCB = ItemUseCB_TMHM ; SetUpItemUseCallback(taskId). */
function UseTMHM(task: DecompTask): void {
  setItemUseCB(ItemUseCB_TMHM);
  SetUpItemUseCallback(task);
}

/** 1:1 `sUseTMHMYesNoFuncTable` (item_use.c:80) = { UseTMHM, CloseItemMessage }. */
const sUseTMHMYesNoFuncTable = { yesFunc: UseTMHM, noFunc: CloseItemMessage };

/** 1:1 décomp `Task_ItemContext_GiveToParty` (item_menu.c:1631) : en mode
 *  ITEMMENULOCATION_PARTY (= choisir un objet à DONNER comme objet tenu à un mon),
 *  A sur un item le valide → `Task_FadeAndCloseBagMenu` (gSpecialVar.ItemId déjà
 *  posé → l'exitCallback CB2_GiveHoldItem le lit). Objet important/clé →
 *  "Impossible de tenir … ici." + retour liste (CloseItemMessage).
 *  DETTE 2a : les branches mail (IsWritingMailAllowed) / IsHoldingItemAllowed =
 *  edge cases différées (le check key-item/importance bloque déjà l'essentiel). */
export function Task_ItemContext_GiveToParty(task: DecompTask): void {
  const item = gSpecialVar.ItemId;
  // 1:1 :1646 — pocket != KEYITEMS && !GetItemImportance → objet donnable.
  if (gBagPosition.pocket !== KEYITEMS_POCKET && GetItemImportance(item) === 0) {
    Task_FadeAndCloseBagMenu(task);
  } else {
    const m = (getString('gText_Var1CantBeHeldHere') || '').replace('{STR_VAR_1}', GetItemName(item));
    DisplayItemMessage(task.taskId, FONT_NORMAL, encodeOwText(m), CloseItemMessage);
  }
}

/** Affiche un gText EXTRAIT (strings.json) dans la message box, après expansion 1:1
 *  des placeholders {STR_VAR_n} (posés via setStringVar) — le `¥` vient du string. */
function _displaySellText(taskId: number, gTextKey: string, callback: (task: DecompTask) => void): void {
  StringExpandPlaceholders(gStringVar4, encodeOwText(getString(gTextKey)));
  DisplayItemMessage(taskId, FONT_NORMAL, gStringVar4, callback);
}

// ─── Flux VENTE (item_menu.c:2078-2201) — chaîne baton + money window ─────────
let _sellTaskId = -1;

/** 1:1 décomp `DisplayCurrentMoneyWindow` (item_menu.c) :
 *    BagMenu_AddWindow(ITEMWIN_MONEY) ; PrintMoneyAmountInMoneyBoxWithBorder(win, 1, 14, money) ;
 *    AddMoneyLabelObject(24, 11) //!< French Difference (label "ARGENT", money.c:187). */
function DisplayCurrentMoneyWindow(): void {
  const wid = BagMenu_AddWindow(ITEMWIN_MONEY);
  PrintMoneyAmountInMoneyBoxWithBorder(wid, 1, 14, GetMoney());
  AddMoneyLabelObject(24, 11);
}

/** 1:1 décomp `RemoveMoneyWindow` (item_menu.c) : BagMenu_RemoveWindow(ITEMWIN_MONEY)
 *  + RemoveMoneyLabelObject. */
function RemoveMoneyWindow(): void {
  BagMenu_RemoveWindow(ITEMWIN_MONEY);
  RemoveMoneyLabelObject();
}

/** 1:1 décomp `PrintItemSoldAmount` (item_menu.c) : "×N" (LEADING_ZEROS) à gauche +
 *  montant gagné à droite (PrintMoneyAmount à x=38). */
function PrintItemSoldAmount(windowId: number, numSold: number, moneyEarned: number): void {
  const numDigits = gBagPosition.pocket === BERRIES_POCKET ? BERRY_CAPACITY_DIGITS : BAG_ITEM_CAPACITY_DIGITS;
  FillWindowPixelBuffer(windowId, PIXEL_FILL(1));
  AddTextPrinterParameterized(windowId, FONT_NORMAL, '×' + String(numSold).padStart(numDigits, '0'), 0, 1, TEXT_SKIP_DRAW, null);
  PrintMoneyAmount(windowId, 38, 1, moneyEarned, 0);
  CopyWindowToVram(windowId, 2 /* COPYWIN_GFX */);
}

/** Prix de revente = GetItemPrice(item) / 2 × count (1:1 décomp, division entière). */
function _sellValue(itemId: number, count: number): number {
  return Math.floor(GetItemPrice(itemId) / 2) * count;
}

/** 1:1 décomp `Task_ItemContext_Sell` (item_menu.c:2078). */
export function Task_ItemContext_Sell(task: DecompTask): void {
  const itemId = gSpecialVar.ItemId;
  if (GetItemPrice(itemId) === 0) {
    // 1:1 :2082 — prix 0 = objet rare/clé invendable : gText_CantBuyKeyItem.
    setStringVar(2, GetItemName(itemId));
    _displaySellText(task.taskId, 'gText_CantBuyKeyItem', CloseItemMessage);
    return;
  }
  task.data[T_ITEM_COUNT] = 1;
  if (task.data[T_QUANTITY] === 1) {
    // 1:1 :2093-2094.
    DisplayCurrentMoneyWindow();
    DisplaySellItemPriceAndConfirm(task);
  } else {
    // 1:1 :2098-2100 : gText_HowManyToSell → callback InitSellHowManyInput.
    setStringVar(2, GetItemName(itemId));
    _displaySellText(task.taskId, 'gText_HowManyToSell', InitSellHowManyInput);
  }
}

/** 1:1 décomp `InitSellHowManyInput` (item_menu.c:2129). */
function InitSellHowManyInput(task: DecompTask): void {
  const wid = BagMenu_AddWindow(ITEMWIN_QUANTITY_WIDE);
  PrintItemSoldAmount(wid, 1, _sellValue(gSpecialVar.ItemId, task.data[T_ITEM_COUNT]));
  DisplayCurrentMoneyWindow();
  task.func = Task_ChooseHowManyToSell;
}

/** 1:1 décomp `Task_ChooseHowManyToSell` (item_menu.c:2139). */
function Task_ChooseHowManyToSell(task: DecompTask): void {
  const ref = { value: task.data[T_ITEM_COUNT] };
  if (AdjustQuantityAccordingToDPadInput(ref, task.data[T_QUANTITY])) {
    task.data[T_ITEM_COUNT] = ref.value;
    PrintItemSoldAmount(gBagMenu!.windowIds[ITEMWIN_QUANTITY_WIDE], ref.value, _sellValue(gSpecialVar.ItemId, ref.value));
  } else if (JOY_NEW(A_BUTTON)) {
    PlaySE(SE_SELECT);
    BagMenu_RemoveWindow(ITEMWIN_QUANTITY_WIDE);
    DisplaySellItemPriceAndConfirm(task);
  } else if (JOY_NEW(B_BUTTON)) {
    PlaySE(SE_SELECT);
    RemoveMoneyWindow();
    BagMenu_RemoveWindow(ITEMWIN_QUANTITY_WIDE);
    RemoveItemMessageWindow(ITEMWIN_MESSAGE);
    _CtxReturnToList(task.taskId);
  }
}

/** 1:1 décomp `DisplaySellItemPriceAndConfirm` (item_menu.c:2105) :
 *  gText_ICanPayVar1 = "Je peux vous en donner {STR_VAR_1}¥.\nÇa vous va?". */
function DisplaySellItemPriceAndConfirm(task: DecompTask): void {
  setStringVar(1, String(_sellValue(gSpecialVar.ItemId, task.data[T_ITEM_COUNT])));
  _displaySellText(task.taskId, 'gText_ICanPayVar1', AskSellItems);
}

/** 1:1 décomp `AskSellItems` (item_menu.c:2114) : BagMenu_YesNo(ITEMWIN_YESNO_HIGH). */
function AskSellItems(task: DecompTask): void {
  _sellTaskId = task.taskId;
  CreateYesNoMenuWithCallbacks(task.taskId, sContextMenuWindowTemplates[ITEMWIN_YESNO_HIGH], 1, 0, 2, 1, 14, sYesNoSellItemFunctions);
}

/** 1:1 décomp `ConfirmSell` (item_menu.c:2164) : gText_TurnedOverVar1ForVar2 =
 *  "Obtenu {STR_VAR_1}¥\npour cette vente." → callback SellItem (fin du message). */
function ConfirmSell(): void {
  const rt = getRuntime();
  const task = rt?.gTasks[_sellTaskId];
  if (!task) return;
  setStringVar(1, String(_sellValue(gSpecialVar.ItemId, task.data[T_ITEM_COUNT])));
  _displaySellText(task.taskId, 'gText_TurnedOverVar1ForVar2', SellItem);
}

/** 1:1 décomp `CancelSell` (item_menu.c:2119) : RemoveMoneyWindow + retire la
 *  message box + retour liste. */
function CancelSell(): void {
  const rt = getRuntime();
  const task = rt?.gTasks[_sellTaskId];
  if (!task) return;
  RemoveMoneyWindow();
  RemoveItemMessageWindow(ITEMWIN_MESSAGE);
  _CtxReturnToList(task.taskId);
}

/** 1:1 décomp `sYesNoSellItemFunctions` (item_menu.c:361) = {ConfirmSell, CancelSell}. */
const sYesNoSellItemFunctions = { yesFunc: ConfirmSell, noFunc: CancelSell };

/** 1:1 décomp `SellItem` (item_menu.c:2174) : SE_SHOP + RemoveBagItem + AddMoney +
 *  rebuild liste + maj money box, puis WaitAfterItemSell. Le message "Obtenu X¥"
 *  reste dans ITEMWIN_MESSAGE (fenêtre encadrée séparée), non touché par le rebuild. */
function SellItem(task: DecompTask): void {
  PlaySE(SE_SHOP);
  const value = _sellValue(gSpecialVar.ItemId, task.data[T_ITEM_COUNT]);
  RemoveBagItem(getItemKeyById(gSpecialVar.ItemId), task.data[T_ITEM_COUNT]);
  AddMoney(value);
  _CtxRebuildListKeepMessage(task.taskId);
  PrintMoneyAmountInMoneyBox(gBagMenu!.windowIds[ITEMWIN_MONEY], GetMoney(), 0);
  task.func = WaitAfterItemSell;
}

/** 1:1 décomp `WaitAfterItemSell` (item_menu.c:2193) : A/B → RemoveMoneyWindow + CloseItemMessage. */
function WaitAfterItemSell(task: DecompTask): void {
  if (JOY_NEW(A_BUTTON | B_BUTTON)) {
    PlaySE(SE_SELECT);
    RemoveMoneyWindow();
    CloseItemMessage(task);
  }
}

/** 1:1 décomp `ItemMenu_Register(u8 taskId)` (item_menu.c:1916-1931) :
 *      if (gSaveBlock1Ptr->registeredItem == gSpecialVar_ItemId)
 *          gSaveBlock1Ptr->registeredItem = ITEM_NONE;
 *      else
 *          gSaveBlock1Ptr->registeredItem = gSpecialVar_ItemId;
 *      DestroyListMenuTask + LoadBagItemListBuffers + ListMenuInit + return list.
 *  Notre port : update saveBlock1.registeredItem direct + sync bridge string
 *  __registeredItemKey + retour liste via _returnToList. */
function ItemMenu_Register(task: DecompTask): void {
  // 1:1 décomp `ItemMenu_Register` (item_menu.c:1916).
  const itemId = gSpecialVar.ItemId;
  // :1922-1925 toggle registeredItem.
  if (gSaveBlock1Ptr.registeredItem === itemId) {
    gSaveBlock1Ptr.registeredItem = 0;  // ITEM_NONE
    gSaveBlock1Ptr.__registeredItemKey = '';
  } else {
    gSaveBlock1Ptr.registeredItem = itemId;
    // Bridge web-port string key sync.
    if (itemId !== 0) {
      const itemKey = reverseDecompConstant(itemId, 'ITEM_');
      gSaveBlock1Ptr.__registeredItemKey = itemKey ?? '';
    } else {
      gSaveBlock1Ptr.__registeredItemKey = '';
    }
  }
  // :1926-1929 DestroyListMenuTask + LoadBagItemListBuffers + ListMenuInit +
  // ScheduleBgCopyTilemapToVram(0) : RECONSTRUIT la liste → BagMenu_ItemPrintCallback
  // se réexécute et (dé)dessine l'icône SELECT (_bagDrawRegisteredIcon) sur la ligne.
  const sr = DestroyListMenuTask(task.data[T_LIST_TASK_ID]);
  gBagPosition.scrollPosition[gBagPosition.pocket] = sr.scrollOffset;
  gBagPosition.cursorPosition[gBagPosition.pocket] = sr.selectedRow;
  LoadBagItemListBuffers(gBagPosition.pocket);
  task.data[T_LIST_TASK_ID] = ListMenuInitForBag(
    gBagPosition.scrollPosition[gBagPosition.pocket],
    gBagPosition.cursorPosition[gBagPosition.pocket],
  );
  ScheduleBgCopyTilemapToVram(0);
  // :1930 ItemMenu_Cancel(taskId) (= RemoveContextWindow + re-print desc/cursor + ReturnToItemList).
  ItemMenu_Cancel(task);
}

/** 1:1 décomp `UseRegisteredKeyItemOnField(void)` (item_menu.c:2046) : appelé sur
 *  SELECT au champ (field_control_avatar.c:188). Si un objet-clé est enregistré ET
 *  encore dans le sac → lock+freeze+`CreateTask(field func)` avec `tUsingRegistered
 *  KeyItem=TRUE` (= data[3], item_use.c:78) ; l'objet plus dans le sac → dé-enregistre.
 *  Le field func (Bike/Rod/Itemfinder) via `SetUpItemUseOnFieldCallback` prend la
 *  branche registered → CB DIRECT (pas de fade-bag). Exposé sur globalThis pour
 *  field_control_avatar (anti-cycle, comme __FieldCallback_Dig).
 *  Checks union/pyramid/pike = single-player → toujours OK (skip). FreezeObjectEvents
 *  (:2059) porté (dégelé par ScriptUnfreezeObjectEvents des CB de sortie). DETTE :
 *  EventScript_SelectWithoutRegisteredItem (message "aucun objet"). */
export function UseRegisteredKeyItemOnField(): boolean {
  const reg = gSaveBlock1Ptr.registeredItem;
  if (reg !== 0) {
    // CheckBagHasItem attend une CLÉ string (le sac stocke des clés, pas l'id numérique).
    if (CheckBagHasItem(getItemKeyById(reg), 1)) {
      // 1:1 :2058 LockPlayerFieldControls() (= __sLockFieldControls, cf. script.ts).
      (globalThis as Record<string, unknown>).__sLockFieldControls = true;
      // 1:1 :2059 FreezeObjectEvents() — gèle les NPCs pendant l'usage de l'objet-clé.
      // Dégelé par ScriptUnfreezeObjectEvents dans le CB de sortie (vélo/itemfinder/rod).
      _eventObjMoveMod?.FreezeObjectEvents();
      // 1:1 item_menu.c:2060-2061 : PlayerFreeze(); StopPlayerAvatar(); — le joueur
      // termine en pose neutre (held FACE_X forcé) au SELECT. Handle lazy _playerAvatarMod
      // (pattern anti-cycle du fichier) : résolu au boot, bien avant tout input SELECT.
      _playerAvatarMod?.PlayerFreeze();
      _playerAvatarMod?.StopPlayerAvatar();
      // 1:1 :2062 gSpecialVar_ItemId = registeredItem ; :2063 CreateTask(GetItemFieldFunc,8).
      // Notre dispatcher = ItemMenu_UseOutOfBattle (lit gSpecialVar.ItemId + GetItemFieldFunc).
      gSpecialVar.ItemId = reg;
      const rt = getRuntime();
      if (rt) {
        const taskId = rt.CreateTask(ItemMenu_UseOutOfBattle, 8);
        const t = rt.gTasks[taskId];
        if (t) t.data[3] = 1;  // tUsingRegisteredKeyItem = TRUE
      }
      return true;
    } else {
      // 1:1 :2069 objet plus dans le sac → dé-enregistre.
      gSaveBlock1Ptr.registeredItem = 0;
      gSaveBlock1Ptr.__registeredItemKey = '';
    }
  }
  // DETTE :2072 ScriptContext_SetupScript(EventScript_SelectWithoutRegisteredItem)
  // ("Aucun objet enregistré.") → pour l'instant : SELECT sans objet = no-op (false).
  return false;
}
(globalThis as Record<string, unknown>).__UseRegisteredKeyItemOnField = UseRegisteredKeyItemOnField;

/** 1:1 décomp `ItemMenu_Give(u8 taskId)` (item_menu.c:1933) : donner l'objet du
 *  SAC à un mon (#12). Trois gardes puis ouverture party (« Donner à quel POKéMON ? ») :
 *    - !IsWritingMailAllowed        → "Impossible d'écrire une LETTRE ici."
 *    - GetItemImportance != 0        → "Impossible de tenir {objet}!" (objet clé/important)
 *    - CalculatePlayerPartyCount==0 → "Il n'y a pas de POKéMON."
 *    - sinon → gBagMenu.newScreenCallback = CB2_ChooseMonToGiveItem + fade+close.
 *  Le retour du party menu revient au SAC (CB2_ReturnToBagMenu = GoToBagMenu LAST).
 *  Note port : les 3 messages d'erreur passent par _showItemMessage (= même boîte
 *  ITEMWIN_MESSAGE + wait A + retour liste) au lieu de DisplayItemMessage+HandleError
 *  Message — visuellement/comportement 1:1 (cf. les autres gardes du dispatcher). */
function ItemMenu_Give(task: DecompTask): void {
  RemoveContextWindow();
  const item = gSpecialVar.ItemId;
  if (!IsWritingMailAllowed(item)) {
    _showItemMessage(task, _itemMsg('gText_CantWriteMail'));
  } else if (GetItemImportance(item) === 0) {
    if (gSaveBlock1Ptr.playerParty.length === 0) {   // 1:1 CalculatePlayerPartyCount() == 0
      _showItemMessage(task, _itemMsg('gText_NoPokemon'));
    } else {
      // 1:1 :1948-1949 — gBagMenu->newScreenCallback = CB2_ChooseMonToGiveItem ;
      // Task_FadeAndCloseBagMenu (l'exitCallback lira gSpecialVar.ItemId).
      gBagMenu!.newScreenCallback = CB2_ChooseMonToGiveItem;
      Task_FadeAndCloseBagMenu(task);
    }
  } else {
    // 1:1 PrintItemCantBeHeld : "Impossible de tenir {STR_VAR_1}!".
    _showItemMessage(task, _itemMsg('gText_Var1CantBeHeld', { v1: GetItemName(item) }));
  }
}

/** 1:1 décomp `Task_ItemContext_GiveToPC` (item_menu.c:2034) — A sur un objet en mode PCBOX
 *  (donner un objet du SAC à un mon du PC). Trois gardes puis fade+close (l'objet choisi est
 *  déjà dans gSpecialVar.ItemId, l'exitCallback CB2_ReturnToPokeStorage le lira via GiveChosenBagItem) :
 *    - ItemIsMail                                  → « Impossible d'écrire une LETTRE ici. »
 *    - pocket == KEYITEMS || GetItemImportance != 0 → « Impossible de tenir {objet}! » (clé/important)
 *    - sinon → Task_FadeAndCloseBagMenu (retour PC avec l'objet). */
function Task_ItemContext_GiveToPC(task: DecompTask): void {
  RemoveContextWindow();
  const item = gSpecialVar.ItemId;
  if (ItemIsMail(item)) {
    _showItemMessage(task, _itemMsg('gText_CantWriteMail'));
  } else if (gBagPosition.pocket !== KEYITEMS_POCKET && GetItemImportance(item) === 0) {
    Task_FadeAndCloseBagMenu(task);
  } else {
    _showItemMessage(task, _itemMsg('gText_Var1CantBeHeld', { v1: GetItemName(item) }));
  }
}

/** 1:1 décomp ItemMenu_Cancel (item_menu.c) — retour liste sans action. */
function ItemMenu_Cancel(task: DecompTask): void {
  RemoveContextWindow();
  _returnToList(task);
}

/** 1:1 décomp `ItemMenu_UseInBattle(u8 taskId)` (item_menu.c:1997) :
 *  `if (GetItemBattleFunc(gSpecialVar_ItemId)) { RemoveContextWindow(); GetItemBattleFunc(gSpecialVar_ItemId)(taskId); }`.
 *  GetItemBattleFunc (item.ts, foyer item.c:941) rend le NOM du handler `battleUseFunc`
 *  (string items.json) → dispatch vers les ItemUseInBattle_* (item_use.ts), EXACTEMENT
 *  comme `ItemMenu_UseOutOfBattle` route `GetItemFieldFunc`. Câblé dans
 *  sItemMenuActions[ACTION_BATTLE_USE] (:2179). */
function ItemMenu_UseInBattle(task: DecompTask): void {
  const item = gSpecialVar.ItemId;
  const battleFunc = GetItemBattleFunc(item); // = gItems[item].battleUseFunc (nom du handler)
  if (battleFunc) {
    RemoveContextWindow();
    // 1:1 :2002 GetItemBattleFunc(item)(taskId) — dispatch nom → impl item_use.ts.
    switch (battleFunc) {
      case 'ItemUseInBattle_PokeBall':     ItemUseInBattle_PokeBall(task); break;
      case 'ItemUseInBattle_StatIncrease': ItemUseInBattle_StatIncrease(task); break;
      case 'ItemUseInBattle_Medicine':     ItemUseInBattle_Medicine(task); break;
      case 'ItemUseInBattle_PPRecovery':   ItemUseInBattle_PPRecovery(task); break;
      case 'ItemUseInBattle_Escape':       ItemUseInBattle_Escape(task); break;
      default:
        console.error('[item-menu] battleUseFunc non porté:', battleFunc);
    }
  }
}

/** 1:1 décomp `ItemMenu_CheckTag(u8 taskId)` (item_menu.c:1979) — dette R3
 *  doc : cascade DoBerryTagScreen (= berry tag UI complet U-tier). */
function ItemMenu_CheckTag(task: DecompTask): void {
  RemoveContextWindow();
  _returnToList(task);
}

/** 1:1 décomp `ItemMenu_Show(u8 taskId)` (item_menu.c, Apprentice ACTION_SHOW)
 *  — dette R3 doc : cascade Apprentice display UI U-tier (= Battle Frontier
 *  subsystem). */
function ItemMenu_Show(task: DecompTask): void {
  RemoveContextWindow();
  _returnToList(task);
}

/** 1:1 décomp `ItemMenu_GiveFavorLady(u8 taskId)` (item_menu.c:2392) : retire
 *  l'objet du sac, Result=TRUE, ferme le sac (le script lit ItemId/Result). */
function ItemMenu_GiveFavorLady(task: DecompTask): void {
  RemoveBagItem(getItemKeyById(gSpecialVar.ItemId), 1);
  gSpecialVar.Result = 1;
  RemoveContextWindow();
  Task_FadeAndCloseBagMenu(task);
}

/** 1:1 décomp `ItemMenu_ConfirmQuizLady(u8 taskId)` (item_menu.c:2408) : confirme
 *  l'objet-prix du quiz custom (Result=TRUE), ferme le sac. */
function ItemMenu_ConfirmQuizLady(task: DecompTask): void {
  gSpecialVar.Result = 1;
  RemoveContextWindow();
  Task_FadeAndCloseBagMenu(task);
}

/** 1:1 décomp `CB2_FavorLadyExitBagMenu` (item_menu.c:2400) : gFieldCallback ←
 *  FieldCallback_FavorLadyEnableScriptContexts puis CB2_ReturnToField. Le field
 *  callback vient de lilycove_lady.ts via pont globalThis (anti-cycle item_menu
 *  ↔ lilycove_lady, pattern trainer_see→scrcmd). */
function CB2_FavorLadyExitBagMenu(): void {
  const g = globalThis as Record<string, unknown>;
  g.gFieldCallback = g.__FieldCallback_FavorLadyEnableScriptContexts ?? null;
  getRuntime()?.SetMainCallback2(CB2_ReturnToField_Manual);
}

/** 1:1 décomp `CB2_QuizLadyExitBagMenu` (item_menu.c:2415). */
function CB2_QuizLadyExitBagMenu(): void {
  const g = globalThis as Record<string, unknown>;
  g.gFieldCallback = g.__FieldCallback_QuizLadyEnableScriptContexts ?? null;
  getRuntime()?.SetMainCallback2(CB2_ReturnToField_Manual);
}

/** 1:1 décomp `void FavorLadyOpenBagMenu(void)` (item_menu.c:605). */
export function FavorLadyOpenBagMenu(): void {
  GoToBagMenu(ITEMMENULOCATION_FAVOR_LADY, POCKETS_COUNT, CB2_FavorLadyExitBagMenu);
  gSpecialVar.Result = 0;
}

/** 1:1 décomp `void QuizLadyOpenBagMenu(void)` (item_menu.c:611). */
export function QuizLadyOpenBagMenu(): void {
  GoToBagMenu(ITEMMENULOCATION_QUIZ_LADY, POCKETS_COUNT, CB2_QuizLadyExitBagMenu);
  gSpecialVar.Result = 0;
}

/** STUB local — fade puis fermeture du sac. Le vrai est dans bag-menu.ts. */
function Task_FadeAndCloseBagMenuStub(task: DecompTask): void {
  RemoveContextWindow();
  // Délégation au handler bag-menu via dynamic resolution (évite cycle import).
  BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);
  // Le suivant tick devra fermer ; pour l'instant on revient à la liste.
  _returnToList(task);
}

/** 1:1 décomp `ReturnToItemList` + restore section `ItemMenu_Cancel` :
 *  re-print desc + cursor NORMAL + recreate flèches + task.func ←
 *  Task_BagMenu_HandleInput. Délégué à bag-menu.ts (évite cycle ; le
 *  helper exporté `_CtxReturnToList` y fait tout le bookkeeping 1:1). */
function _returnToList(task: DecompTask): void {
  _CtxReturnToList(task.taskId);
}
