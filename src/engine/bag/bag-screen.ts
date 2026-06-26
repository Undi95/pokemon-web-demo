/**
 * bag-screen.ts — UI Sac fonctionnel quasi-1:1 décomp `src/item_menu.c`.
 *
 * Affichage à 3 windows :
 *   1. Header window (top) : nom du pocket courant (= "OBJETS" / "POKé BALLS" /
 *      "OBJETS RARES" / "CT/CS" / "BAIES")
 *   2. List window (centre) : items du pocket en cours, scrollable, cursor
 *      navigué via up/down. Format "NOM_ITEM × QTY".
 *   3. Description window (bottom) : description de l'item sélectionné, lue
 *      depuis getItemDescriptionFr(item.descriptionLabel).
 *
 * Inputs :
 *   ↑ / ↓     : scroll item courant dans le pocket actif
 *   ← / →     : switch pocket (5 pockets cycliques)
 *   A         : "use" message (= TODO real use logic en Phase 6+)
 *   B / START : ferme l'écran et revient au start menu
 *
 * Pocket order = 1:1 décomp `gItems[].pocket` enum order :
 *   POCKET_ITEMS, POCKET_POKE_BALLS, POCKET_TM_HM, POCKET_BERRIES, POCKET_KEY_ITEMS
 *
 * Architecture : module standalone, gère son propre lifecycle (Open/Tick/Close).
 * Le start-menu appelle BagScreen.Open() puis observe BagScreen.IsOpen() dans son
 * propre tick pour savoir quand ré-afficher le main menu.
 */

import { FreeAllSpritePalettes } from '../../../harness/runtime/decomp-globals';
import {
  AddWindow, RemoveWindow, DrawStdFrameWithCustomTileAndPalette,
  ClearStdWindowAndFrame, FillWindowPixelBuffer, PutWindowTilemap,
  CopyWindowToVram, BlitBitmapToWindow, ShowBg, HideBg,
  InitWindows, ResetVramOamAndBgCntRegs,
  type WindowTemplate,
} from '../ui/gba-window-system';
import { LoadUserWindowBorderGfx } from '../../text_window';
import { AddTextPrinterParameterized3, GetStringRightAlignXOffset, GetStringCenterAlignXOffset } from '../ui/gba-text-system';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from '../save/save-block-state';
import { resolveDecompConstant } from '../../../harness/runtime/decomp-constants';
import { FEMALE } from '../../../harness/runtime/decomp-globals';
import { LoadSpriteSheet, LoadSpritePalette, AllocOamMatrix, FreeOamMatrix, ResetSpriteData } from '../../sprite';
import { setStringVar, encodeOwText } from '../../../include/text';
import { StringExpandPlaceholders, gStringVar4 } from '../ui/gba-text-system';
import { EOS, CHAR_NEWLINE } from '../../../include/constants/characters';
import { getItem, getItemNameFr, getItemDescriptionFr, getMoveNameFr } from '../../../harness/runtime/data-tables';
import { RemoveBagItem, UpdatePocketItemList, gBagPockets, CountTotalItemQuantityInBag } from './bag';
import { PokemonUseItemEffects } from './bag-item-effects';
import { ItemUseCB_Medicine, ItemUseCB_PPRecovery, setItemUseCB } from '../../item_use';
import { gSpecialVar } from '../script/script-vars';
import {
  PlaySE, LoadPalette, getRuntime, OBJ_PLTT_ID,
  BlendPalettes, ResetPaletteFade, ResetTasks, gMain,
} from '../../../harness/runtime/decomp-globals';

import { CB2_ReturnToFieldWithOpenMenu_Manual, CB2_ReturnToFieldLocal_Manual } from '../ui/option-menu-return';
import { FadeScreen, FADE_TO_BLACK, FADE_FROM_BLACK } from '../../field_weather';
import { loadIndexedPngStrict, loadGbaPal, loadTilemapBin, loadTileBin } from '../../../harness/gba/png-loader';
import { getString } from '../ui/gba-strings';
import { gSineTable, SetOamMatrix } from '../../../harness/runtime/decomp-helpers';
import type { DecompTask } from '../../../harness/runtime/decomp-runtime';

// ─── Constants ───────────────────────────────────────────────────────────────

// FONT_NORMAL/NARROW pas extraits dans decomp-data (= enum FontIds local
// text.h, hardcode 1:1 strict justifié).
const FONT_NORMAL = 1;
/** 1:1 décomp text.h enum FontIds : FONT_NARROW = 7 (pas 2 !).
 *  sItemListMenu.fontId = FONT_NARROW = glyph data narrow différent de FONT_NORMAL. */
const FONT_NARROW = 7;
// TEXT_SKIP_DRAW importé depuis decomp-data (= A8 audit).
import { TEXT_SKIP_DRAW } from '../decomp-data/include/text-data';
/** 1:1 décomp item_menu.c:387 sFontColorTable[COLORID_NORMAL] :
 *    {TEXT_COLOR_TRANSPARENT=0, TEXT_COLOR_WHITE=1, TEXT_COLOR_LIGHT_GRAY=3}
 *  Mapping paletteNum=1 (= sub-palette 1 de menu_male.pal) :
 *    [0] = transparent (= skip pixel, BG2 derrière visible)
 *    [1] = noir (= TEXT_COLOR_WHITE alias, mais palette index 1 = noir → texte noir)
 *    [3] = jaune pâle/gris (= shadow drop)
 *  Avant : [1, 2, 3] = bg=noir/fg=blanc → texte BLANC sur FOND NOIR (faux). */
const COLOR_MAIN: [number, number, number] = [0, 1, 3];
/** 1:1 décomp item_menu.c:390 sFontColorTable[COLORID_POCKET_NAME] :
 *    {TEXT_COLOR_TRANSPARENT, TEXT_COLOR_WHITE, TEXT_COLOR_RED} = [0, 1, 4]. */
const COLOR_POCKET_NAME: [number, number, number] = [0, 1, 4];
/** Colors pour context menu / yes-no / qty (= paletteNum=15 = gStandardMenuPalette
 *  loaded à BG_PLTT_ID(15) par LoadBagMenuTextWindows 1:1 décomp item_menu.c:2466).
 *  std_menu.pal idx 0 transparent, idx 1 cream/off-white, idx 2 dark gray, idx 3 light gray.
 *  bg=1 (cream = matche PIXEL_FILL(1) du frame interior), fg=2 (dark gray = text),
 *  shadow=3 (light gray). 1:1 décomp PrintMenuActionGrid utilise FONT_NARROW
 *  default = ces couleurs sFontInfos[FONT_NARROW]. */
const COLOR_CTX_NORMAL: [number, number, number] = [1, 2, 3];
/** Standard menu frame tile + palette (= même que start menu = cohérent). */
const STD_FRAME_TILE = 0x214;
const STD_FRAME_PAL = 14;

/** Pocket display order — 1:1 décomp items_pocket.c sBagPockets.
 *  Labels = 1:1 décomp src/strings.c gText_*Pocket via getString() (= chargé
 *  depuis /decomp/em/strings.json par gba-strings.ts au boot).
 *  Pas hardcoded → si le décomp change un texte, on suit automatiquement. */
const POCKETS: ReadonlyArray<{
  key: 'items' | 'pokeBalls' | 'tmHm' | 'berries' | 'keyItems';
  textKey: string;
}> = [
  { key: 'items',     textKey: 'gText_ItemsPocket' },
  { key: 'pokeBalls', textKey: 'gText_PokeBallsPocket' },
  { key: 'tmHm',      textKey: 'gText_TMHMPocket' },
  { key: 'berries',   textKey: 'gText_BerriesPocket' },
  { key: 'keyItems',  textKey: 'gText_KeyItemsPocket' },
];

/** 1:1 décomp item_menu.c : list window 15×16 tiles, max 8 items visibles. */
const VISIBLE_ROWS = 8;

/** Palette slot custom pour le sprite sac — différent de STD_FRAME_PAL (14).
 *  Le décomp utilise palette 0 pour bag.pal, mais nos pals 0-12 sont prises
 *  par le BG tilemap overworld (= métatiles). Slot 13 est libre. */
const BAG_SPRITE_PAL = 13;

/** Palette slot pour le tilemap fond menu.bin (= rayures rose/mauve). */
const BAG_BG_PAL = 12;

/** Palette slot pour l'item icon courant (= chaque item a sa propre palette,
 *  on charge à la volée selon item sélectionné). Slot 11 libre. */
const ITEM_ICON_PAL = 11;

/** BG layer pour le tilemap fond. 1:1 décomp item_menu.c sBgTemplates_ItemMenu :
 *  BG2 = char 3, map 29, priority 2 (= le fond rayé).
 *  BG0 = char 0, map 31, priority 1 (= textbox window).
 *  BG1 = char 0, map 30, priority 0 (= ?).
 *
 *  On clobbe l'overworld BG (= map 28-31 sont aussi utilisées par l'overworld),
 *  donc on save/restore VRAM ranges au open/close. */
const BAG_BG_LAYER = 2;

/** VRAM offset (= mapBase) pour le tilemap fond. 1:1 décomp = 29.
 *  29 × 0x800 = 0xE800 → 0xF000. */
const BAG_BG_MAP_BASE = 29;

/** VRAM tile data offset (= charBaseIndex). 1:1 décomp = 3.
 *  3 × 0x4000 = 0xC000 → 0x10000. */
const BAG_BG_CHAR_BASE = 3;

/** Window templates — résolution GBA = 30 tiles wide × 20 tiles high (240×160 px).
 *  Layout pixel-perfect ROM :
 *    Sprite sac (left)     : tilemapLeft 1,  tilemapTop 2,  width 12, height 12 → 96×96 px
 *    Header pocket (top)   : tilemapLeft 14, tilemapTop 0,  width 16, height 2  → "OBJETS 1/5"
 *    List   (right side)   : tilemapLeft 16, tilemapTop 2,  width 13, height 11 → items
 *    Desc + button (bottom): tilemapLeft 0,  tilemapTop 14, width 30, height 5  → desc + select btn */
const SPRITE_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 0, tilemapLeft: 1, tilemapTop: 2, width: 12, height: 12,
  // baseBlock 0x250 = au-dessus de tous les autres baseBlocks (= header 0x1A1
  // + 16 tiles, desc 0x100 + 150 tiles, list 0x40 + 143 tiles, icon 0x150 + 9
  // tiles). Évite collision avec le tilemap entries des autres windows.
  paletteNum: BAG_SPRITE_PAL, baseBlock: 0x250,
};

/** 1:1 décomp item_menu.c:416 sDefaultBagWindows[WIN_POCKET_NAME] :
 *    .bg = 0, .tilemapLeft = 4, .tilemapTop = 1,
 *    .width = 8, .height = 2, .paletteNum = 1, .baseBlock = 0x1A1
 *  Position (4, 1) car le frame orange custom (= chevrons gauche/droite) est
 *  PRÉ-RENDU dans menu.bin BG2 derrière. La window contient juste le texte
 *  de la pocket avec sub-palette 1 (= rose/violet pour le texte).
 *  ⚠️ baseBlock 0x1A1 = élevé pour ne pas overlap d'autres windows. */
const HEADER_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 0, tilemapLeft: 4, tilemapTop: 1, width: 8, height: 2,
  paletteNum: 1, baseBlock: 0x1A1,
};

/** Window pour l'icône de l'item sélectionné (= 24×24 px = 3×3 tiles).
 *  1:1 décomp item_menu_icons.c:549-550 :
 *    gSprites[iconSpriteId].x2 = 24; y2 = 88;
 *  + sBagItemIconSprite OamData : shape SQUARE size 32×32 → centerToCornerVec
 *    = (-16, -16). Donc oam.x = 0 + 24 + (-16) = 8, oam.y = 0 + 88 + (-16) = 72.
 *  → sprite rendu à pixel (8, 72) sur l'écran. Pour notre window 24×24
 *    (= sprite content), tilemap pos = pixel/8 = (1, 9). */
const ITEM_ICON_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 0, tilemapLeft: 1, tilemapTop: 9, width: 3, height: 3,
  paletteNum: ITEM_ICON_PAL, baseBlock: 0x300,
};

/** 1:1 décomp item_menu.c:398 sDefaultBagWindows[WIN_ITEM_LIST] :
 *    .bg = 0, .tilemapLeft = 14, .tilemapTop = 2,
 *    .width = 15, .height = 16, .paletteNum = 1, .baseBlock = 0x27. */
const LIST_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 0, tilemapLeft: 14, tilemapTop: 2, width: 15, height: 16,
  paletteNum: 1, baseBlock: 0x27,
};

/** 1:1 décomp item_menu.c:407 sDefaultBagWindows[WIN_DESCRIPTION] :
 *    .bg = 0, .tilemapLeft = 0, .tilemapTop = 13,
 *    .width = 14, .height = 6, .paletteNum = 1, .baseBlock = 0x117. */
const DESC_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 0, tilemapLeft: 0, tilemapTop: 13, width: 14, height: 6,
  paletteNum: 1, baseBlock: 0x117,
};

/** 1:1 décomp item_menu.c:455 sContextMenuWindowTemplates :
 *    [ITEMWIN_2x2]       = {.bg=1, .tilemapLeft=15, .tilemapTop=15, .width=14, .height=4, .paletteNum=15, .baseBlock=0x21D}
 *    [ITEMWIN_2x3]       = {.bg=1, .tilemapLeft=15, .tilemapTop=13, .width=14, .height=6, .paletteNum=15, .baseBlock=0x21D}
 *    [ITEMWIN_YESNO_LOW] = {.bg=1, .tilemapLeft=24, .tilemapTop=15, .width=5,  .height=4, .paletteNum=15, .baseBlock=0x238}
 *    [ITEMWIN_QUANTITY]  = {.bg=1, .tilemapLeft=24, .tilemapTop=17, .width=5,  .height=2, .paletteNum=15, .baseBlock=0x250}
 *
 *  BG=1 priority=0 (= sBgTemplates_ItemMenu[1]) → rend ON TOP de BG=0 (priority=1
 *  items list / desc / sprite). Items list reste visible derrière context menu. */
const CTX_2X2_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 1, tilemapLeft: 15, tilemapTop: 15, width: 14, height: 4,
  paletteNum: 15, baseBlock: 0x21D,
};
const CTX_2X3_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 1, tilemapLeft: 15, tilemapTop: 13, width: 14, height: 6,
  paletteNum: 15, baseBlock: 0x21D,
};
const YESNO_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 1, tilemapLeft: 24, tilemapTop: 15, width: 5, height: 4,
  paletteNum: 15, baseBlock: 0x238,
};
const QTY_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 1, tilemapLeft: 24, tilemapTop: 17, width: 5, height: 2,
  paletteNum: 15, baseBlock: 0x250,
};

// ─── Module state ────────────────────────────────────────────────────────────

/** Phase de la state machine open/close du bag (= 1:1 décomp).
 *  - 'idle' : fermé
 *  - 'fading_in' : open démarré, fade FROM BLACK en cours
 *  - 'open' : bag visible et interactive
 *  - 'fading_out' : close démarré, fade TO BLACK en cours
 *  - 'switching_pocket' : animation switch pocket (16 frames, DrawItemListBgRow). */
type Phase =
  | 'idle' | 'fading_in' | 'open' | 'fading_out' | 'switching_pocket' | 'list_input'
  | 'context_menu'      // Context menu (Use/Give/Toss/Cancel) overlay
  | 'toss_quantity'     // Quantity selector (1..max) avant confirm toss
  | 'toss_confirm'      // Yes/No confirm "Toss N item?"
  | 'toss_message'      // "Threw away N item" wait A/B before remove
  | 'swap_items'        // SELECT pressed : moving item, list cursor moves
  | 'message'           // Generic field message (Use stub etc.)
  | 'itempc_deposit_qty'    // 1:1 décomp Task_ChooseHowManyToDeposit (ITEMPC)
  | 'itempc_deposit_msg';   // 1:1 décomp deposit success/error message wait
let _phase: Phase = 'idle';

/** 1:1 décomp ItemMenuAction enum (item_menu.c:70). Le mapping action →
 *  textKey (= gMenuText_X) + handler. */
const enum ItemAction {
  USE = 0, TOSS = 1, REGISTER = 2, GIVE = 3, CANCEL = 4,
  BATTLE_USE = 5, CHECK = 6, WALK = 7, DESELECT = 8, CHECK_TAG = 9,
  CONFIRM = 10, SHOW = 11, GIVE_FAVOR_LADY = 12, CONFIRM_QUIZ_LADY = 13, DUMMY = 14,
}
/** Mapping ItemAction → gMenuText_* key. */
const ACTION_TEXT_KEYS: Record<number, string> = {
  [ItemAction.USE]: 'gMenuText_Use',
  [ItemAction.TOSS]: 'gMenuText_Toss',
  [ItemAction.REGISTER]: 'gMenuText_Register',
  [ItemAction.GIVE]: 'gMenuText_Give',
  [ItemAction.CANCEL]: 'gText_Cancel2',
  [ItemAction.BATTLE_USE]: 'gMenuText_Use',
  [ItemAction.CHECK]: 'gMenuText_Check',
  [ItemAction.WALK]: 'gMenuText_Walk',
  [ItemAction.DESELECT]: 'gMenuText_Deselect',
  [ItemAction.CHECK_TAG]: 'gMenuText_CheckTag',
  [ItemAction.CONFIRM]: 'gMenuText_Confirm2',
  [ItemAction.SHOW]: 'gMenuText_Show',
  [ItemAction.GIVE_FAVOR_LADY]: 'gMenuText_Give2',
  [ItemAction.CONFIRM_QUIZ_LADY]: 'gMenuText_Confirm',
  [ItemAction.DUMMY]: '',
};
/** 1:1 décomp sContextMenuItems_*Pocket arrays. 4 actions par pocket (= 2x2 grid),
 *  6 pour berries (= 2x3). DUMMY = blank slot. */
const CTX_ITEMS_POCKET: ItemAction[] = [ItemAction.USE, ItemAction.GIVE, ItemAction.TOSS, ItemAction.CANCEL];
const CTX_KEY_ITEMS_POCKET: ItemAction[] = [ItemAction.USE, ItemAction.REGISTER, ItemAction.DUMMY, ItemAction.CANCEL];
const CTX_BALLS_POCKET: ItemAction[] = [ItemAction.GIVE, ItemAction.DUMMY, ItemAction.TOSS, ItemAction.CANCEL];
const CTX_TMHM_POCKET: ItemAction[] = [ItemAction.USE, ItemAction.GIVE, ItemAction.DUMMY, ItemAction.CANCEL];
const CTX_BERRIES_POCKET: ItemAction[] = [
  ItemAction.CHECK_TAG, ItemAction.DUMMY,
  ItemAction.USE, ItemAction.GIVE,
  ItemAction.TOSS, ItemAction.CANCEL,
];

/** Context menu state. */
let _ctxActions: ItemAction[] = [];
let _ctxCursor = 0;
/** Item selected when A pressed = target of context menu operation. */
let _ctxItemKey: string = '';
let _ctxItemPocketIdx = 0;
let _ctxItemListIdx = 0;
/** Toss quantity selector state. */
let _tossQty = 1;
let _tossMaxQty = 1;
/** Toss yes/no cursor (0=Yes, 1=No). */
let _tossYesNoCursor = 0;
/** Item swap state. */
let _swapFromIdx = -1;

/** State pour Task_SwitchBagPocket animation 1:1 décomp item_menu.c:1363.
 *  16 frames : chaque frame DrawItemListBgRow(timer) = tile 17 (jaune pâle)
 *  fill row à y=timer+2, x=14, w=15, h=1 → clears la list row par row.
 *  Quand timer == 16, swap _pocketIdx + redraw nouveau pocket. */
let _switchTimer = 0;
let _switchDir: -1 | 0 | 1 = 0;
/** 1:1 décomp gBagMenu->pocketNameBuffer pattern : on stocke les indices
 *  source/dest du switch pour la double-buffer animation pocket name. */
let _switchOldPocketIdx = 0;
let _switchNewPocketIdx = 0;

let _isOpen = false;
let _pocketIdx = 0;
let _cursorPos = 0;     // 0..VISIBLE_ROWS-1, position du cursor dans la fenêtre
let _scrollOffset = 0;  // index du 1er item visible
/** 1:1 décomp gBagPosition.cursorPosition[POCKETS_COUNT] + scrollPosition[].
 *  Mémorise la position cursor/scroll par pocket : quand on switch, on save
 *  l'état du pocket courant puis on restore celui du nouveau pocket. */
const _cursorPerPocket: number[] = [0, 0, 0, 0, 0];
const _scrollPerPocket: number[] = [0, 0, 0, 0, 0];

/** 1:1 décomp gBagPosition.location (ITEMMENULOCATION_FIELD = 0, BATTLE = 1,
 *  PARTY = 2, SHOP = 3, PC = 4, etc.). Pour l'instant on supporte FIELD only,
 *  mais le mapping gBagMenu_ReturnToStrings[location] est prêt. */
const enum BagLocation {
  FIELD = 0, BATTLE = 1, PARTY = 2, SHOP = 3, BERRY_TREE = 4,
  BERRY_BLENDER_CRUSH = 5, ITEMPC = 6, FAVOR_LADY = 7, QUIZ_LADY = 8,
  APPRENTICE = 9, WALLY = 10, PCBOX = 11,
}
let _bagLocation: BagLocation = BagLocation.FIELD;
/** Mapping 1:1 décomp gBagMenu_ReturnToStrings[location] → text key. */
const RETURN_TO_STRINGS: Record<BagLocation, string> = {
  [BagLocation.FIELD]: 'gText_TheField',
  [BagLocation.BATTLE]: 'gText_TheBattle',
  [BagLocation.PARTY]: 'gText_ThePokemonList',
  [BagLocation.SHOP]: 'gText_TheShop',
  [BagLocation.BERRY_TREE]: 'gText_TheField',
  [BagLocation.BERRY_BLENDER_CRUSH]: 'gText_TheField',
  [BagLocation.ITEMPC]: 'gText_ThePC',
  [BagLocation.FAVOR_LADY]: 'gText_TheField',
  [BagLocation.QUIZ_LADY]: 'gText_TheField',
  [BagLocation.APPRENTICE]: 'gText_TheField',
  [BagLocation.WALLY]: 'gText_TheBattle',
  [BagLocation.PCBOX]: 'gText_ThePC',
};
let _spriteWid = -1;
let _headerWid = -1;
let _listWid = -1;
let _descWid = -1;
let _itemIconWid = -1;
/** Context menu windows : 2x2 (4 actions) ou 2x3 (6 actions berries).
 *  Spawned dans phase 'context_menu', removed au close. */
let _ctxWid = -1;
let _yesNoWid = -1;
let _qtyWid = -1;
// 🗑️ `_onClose`, `_savedSyncSubspriteHook` removed (session 129 CB2 swap) :
// - onClose callback obsolète depuis CB2 swap (= FieldCB chain reopens start
//   menu via CB2_ReturnToFieldWithOpenMenu_Manual).
// - hook _syncSubspriteOam obsolète (= OW MainCB2 dead pendant bag, plus de
//   syncSpritesToOam concurrent).
/** Cache des item icons chargés pour pas re-fetch chaque scroll. */
const _itemIconCache: Record<string, { charData: Uint8Array; palette: Uint16Array }> = {};
/** Item key actuellement loadé dans la window icon (= évite re-load redondant). */
let _loadedIconKey: string | null = null;


// ─── Sprite sac OAM (= 1:1 décomp item_menu_icons.c sBagSpriteTemplate) ─────

/** 1:1 STRICT décomp item_menu_icons.c sBagSpriteAnimTable[bagPocketId+1] :
 *  tile offsets relatifs au tileStart du bag sprite (= dans gBagMaleTiles).
 *    POCKET_ITEMS=64, POKE_BALLS=192, TM_HM=256, BERRIES=320, KEY_ITEMS=128. */
const BAG_FRAME_TILE_OFFSET: ReadonlyArray<number> = [64, 192, 256, 320, 128];

/** 1:1 STRICT décomp tags GFX/PAL u16 (= item_menu_icons.c). Utilisation des
 *  CONSTANTES numériques décomp pour éviter divergence avec bag-menu.ts qui
 *  utilise aussi TAG_BAG_GFX=100 → si tags différents, 2 slots palette
 *  alloués pour MÊME bag.pal → désync visuel pendant scroll (= bug user). */
const TAG_BAG_SPRITE_GFX = 100;             // 1:1 TAG_BAG_GFX
const TAG_BAG_SPRITE_PAL = 100;             // 1:1 same as GFX (= shared tag)
const TAG_SCROLL_ARROW_GFX = 109;           // 1:1 TAG_SCROLL_INDICATOR
const TAG_SCROLL_ARROW_PAL = 109;
const TAG_ROTATING_BALL_GFX_LOCAL = 110;    // 1:1 TAG_ROTATING_BALL_GFX
const TAG_ROTATING_BALL_PAL = 110;

/** 1:1 STRICT : tileStart + palSlot dynamiquement alloués par LoadSpriteSheet/
 *  LoadSpritePalette. Avant : raw `objVram.set` à offsets hardcoded 0/0x3000/
 *  0x3100 → écrasait player tiles à offset 0 (bug user 2026-05-23). Maintenant :
 *  alloc respecte gReservedSpriteTileCount + paletteTagToSlot. */
let _bagSpriteTileStart = -1;
let _bagSpritePalSlot = -1;
let _scrollArrowTileStart = -1;
let _scrollArrowPalSlot = -1;
let _rotatingBallTileStart_local = -1;
let _rotatingBallPalSlot_local = -1;

let _bagSpriteOamId = -1;
/** OAM index du bag sprite (= différent du spriteId). Used by _syncSubspriteOam
 *  hook pour whitelist ce slot (= ne pas clear son visible chaque frame). */
let _bagSpriteOamIndex = -1;
/** Idempotent flag : ne load le tile data + palette dans VRAM OBJ qu'une fois. */
let _bagAssetsLoadedToObj = false;
/** 1:1 décomp item_menu_icons.c sSpriteAffineAnim_BagShake :
 *  4 frames affine animation (rotate -2/+2/-2/+2) sur 12 frames total. Triggered
 *  par BagMenu_MoveCursorCallback → ShakeBagSprite quand cursor change.
 *  Compteur 0..12 ; angle calculé via _bagShakeAngle table. */
let _bagShakeFrame = 0;
const BAG_SHAKE_FRAMES = 12;

/** OAM ids des 2 chevrons LEFT/RIGHT (= sBagScrollArrowsTemplate firstX=28 secondX=100).
 *  -1 = pas spawn. Spawn à l'open + dans _setupBackgroundTilemap, despawn au close. */
let _arrowLeftOamId = -1;
let _arrowLeftOamIndex = -1;
let _arrowRightOamId = -1;
let _arrowRightOamIndex = -1;
/** Sin position pour le bobbing horizontal (= 1:1 décomp tSinePos += tFrequency).
 *  LEFT freq=8, RIGHT freq=-8. x2 = sin(sinePos & 0xFF) * 2 / 256. */
let _arrowSinePosLeft = 0;
let _arrowSinePosRight = 0;
let _scrollArrowAssetsLoaded = false;

/** OAM ids des 2 flèches UP/DOWN scroll list (= 1:1 décomp item_menu.c:1033
 *  AddScrollIndicatorArrowPairParameterized(UP, commonX=172, firstY=12,
 *  secondY=148). Visible quand list overflows. */
let _arrowUpOamId = -1;
let _arrowUpOamIndex = -1;
let _arrowDownOamId = -1;
let _arrowDownOamIndex = -1;
/** Sin position pour le bobbing VERTICAL (= 1:1 décomp bounceDir=1, y2 = sin*mult/256).
 *  UP freq=8, DOWN freq=-8. */
let _arrowSinePosUp = 0;
let _arrowSinePosDown = 0;

/** OAM id du rotating ball pendant pocket switch. -1 = pas spawn / animation finie. */
let _ballOamId = -1;
let _ballOamIndex = -1;
/** Affine matrix slot alloué pour le ball (= 1:1 décomp InitSpriteAffineAnim
 *  → sOamMatrixAllocBitmap alloc free slot). FreeOamMatrix au remove. */
let _ballMatrixNum = -1;
/** 1:1 décomp sprite->data[0] = rotationDirection (s16). -1 ou +1.
 *  Détermine quelle affineAnims table : Rotation1 (rotation=8/frame) ou
 *  Rotation2 (rotation=248/frame = -8 signed). */
let _ballRotationDir: -1 | 1 = 1;
/** 1:1 décomp sprite->data[3] = frame counter, 0..16. remove à 16. */
let _ballData3 = 0;
/** 1:1 décomp sprite->data[1] = centerToCornerVecY (= -8 pour 16×16 square).
 *  Stocké car UpdateSwitchPocketRotatingBallCoords le réutilise chaque frame :
 *    centerToCornerVecX = data[1] - ((data[3] + 1) & 1);
 *    centerToCornerVecY = data[1] - ((data[3] + 1) & 1);  */
let _ballData1 = 0;
/** Rotation accumulée en u8 ticks (= 0..255 où 256 = 360°). +8 ou -8 par frame
 *  selon dir (= 1:1 décomp AFFINEANIMCMD_FRAME(0, 0, 8/248, 16) rotationDelta). */
let _ballRotation = 0;
/** Phase init (=true au 1er tick = SpriteCB_Init, =false ensuite = Continue). */
let _ballInitPending = false;
let _rotatingBallAssetsLoaded = false;

// 🗑️ `_savedObjVram`, `_savedObjPalettes`, `_savedBgState` removed
// (session 129 CB2 swap refactor) : plus de save/restore VRAM. Le CB2 swap
// décomp swap MainCB2_Overworld → MainCB2_BagMenuRun (= l'OW arrête de tick).
// Au close, CB2_ReturnToFieldWithOpenMenu_Manual re-init l'OW from scratch via
// _restoreOverworldFromMenu (= loadAndInitMap reload tilesets/palettes/NPCs).

// ─── Assets (lazy-loaded au 1er Open) ────────────────────────────────────────

interface BagAssets {
  bagSprite: { charData: Uint8Array; palette: Uint16Array };
  selectButton: { charData: Uint8Array; palette: Uint16Array };
  rotatingBall: { charData: Uint8Array; palette: Uint16Array };
  /** Bag sprite raw 4bpp pour OAM rendu (= 1:1 décomp gBagMaleTiles size 0x3000).
   *  Différent de bagSprite.charData (= via loadIndexedPngStrict canvas remap).
   *  Use loadTileBin → indices bruts qui matchent bag.gbapal. */
  bagSpriteRaw4bpp: Uint8Array;
  bagSpritePal: Uint16Array;
  /** Background tilemap fond rayé (= rayures rose/mauve du décomp). */
  bgTiles: Uint8Array;
  bgTilemap: Uint16Array;
  bgPalette: Uint16Array;
  /** Scroll indicator chevrons (= 1:1 décomp graphics/interface/scroll_indicator.png
   *  16×32, 8 tiles 4bpp). Tile 0-3 = LEFT/RIGHT (avec hflip), tile 4-7 = UP/DOWN. */
  scrollArrowGfx: Uint8Array;
  /** Palette pour les chevrons (= 1:1 décomp graphics/interface/red.pal). */
  scrollArrowPal: Uint16Array;
}

let _assets: BagAssets | null = null;
let _assetsLoading: Promise<BagAssets> | null = null;

async function _loadAssets(): Promise<BagAssets> {
  if (_assets) return _assets;
  if (_assetsLoading) return _assetsLoading;
  _assetsLoading = (async () => {
    const gender = gSaveBlock2Ptr.playerGender === FEMALE ? 'female' : 'male';
    const [bag, button, ball, bgTilesRaw, bgTilemap, bgPal, bagRaw, bagPal,
           scrollArrow, scrollArrowPal] = await Promise.all([
      loadIndexedPngStrict(`/decomp/em/bag/bag_${gender}.png`, 4),
      loadIndexedPngStrict('/decomp/em/bag/select_button.png', 4),
      loadIndexedPngStrict('/decomp/em/bag/rotating_ball.png', 4),
      loadTileBin('/decomp/em/bag/menu.png', 4),
      loadTilemapBin('/decomp/em/bag/menu.bin'),
      loadGbaPal(`/decomp/em/bag/menu_${gender}.pal`),
      // 1:1 décomp gBagMaleTiles / gBagFemaleTiles = bag_male/female.4bpp.bin
      // raw indices pour OAM render (= 12288 bytes = 0x3000 = 384 tiles 4bpp).
      loadTileBin(`/decomp/em/bag/bag_${gender}.png`, 4),
      // 1:1 décomp gBagPalette = bag.pal (= 16 colors JASC-PAL).
      loadGbaPal('/decomp/em/bag/bag.pal'),
      // 1:1 décomp scroll_indicator 16×32 4bpp pour les 2 chevrons LEFT/RIGHT
      // autour du pocket name. loadIndexedPngStrict utilise la palette PLTE
      // du PNG (= matche red.pal car le PNG a été exporté avec).
      loadIndexedPngStrict('/decomp/em/interface/scroll_indicator.png', 4),
      loadGbaPal('/decomp/em/interface/red.pal'),
    ]);
    _assets = {
      bagSprite: { charData: bag.charData, palette: bag.palette },
      selectButton: { charData: button.charData, palette: button.palette },
      rotatingBall: { charData: ball.charData, palette: ball.palette },
      bgTiles: bgTilesRaw,
      bgTilemap: bgTilemap,
      bgPalette: bgPal,
      bagSpriteRaw4bpp: bagRaw,
      bagSpritePal: bagPal,
      scrollArrowGfx: scrollArrow.charData,
      scrollArrowPal: scrollArrowPal,
    };
    _assetsLoading = null;
    return _assets;
  })();
  return _assetsLoading;
}

/** Preload des assets au boot (= idempotent, async fire-and-forget).
 *  Permet d'avoir le sprite sac disponible sans wait au 1er Open. */
export function preloadBagAssets(): void {
  void _loadAssets();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface ItemSlot { itemKey: string; quantity: number }

/** Sentinel itemKey pour la dernière entry "FERMER LE SAC" (= 1:1 décomp
 *  item_menu.c:LoadBagItemListBuffers qui ajoute gText_CloseBag avec id=LIST_CANCEL). */
const CLOSE_BAG_KEY = '__CLOSE_BAG__';

// 1:1 décomp item.h:12-17 — POCKETS order = ITEMS_POCKET, BALLS_POCKET,
// TMHM_POCKET, BERRIES_POCKET, KEYITEMS_POCKET. `_pocketIdx` suit cet ordre.
function _currentPocketItems(): ItemSlot[] {
  const slots = gBagPockets[_pocketIdx]?.itemSlots ?? [];
  // Filter out empty slots, then append CLOSE_BAG sentinel à la fin (= 1:1
  // décomp gText_CloseBag dernière entry, sauf si hideCloseBagText).
  const realItems = slots.filter(s => s?.itemKey && (s.quantity ?? 0) > 0);
  return [...realItems, { itemKey: CLOSE_BAG_KEY, quantity: 0 }];
}

function _selectedItemKey(): string | null {
  const items = _currentPocketItems();
  const idx = _scrollOffset + _cursorPos;
  return items[idx]?.itemKey ?? null;
}

function _drawSprite(): void {
  // Désactivé : sprite sac est maintenant un OAM (= 1:1 décomp). Cf.
  // _spawnBagSpriteOam dans _setupBackgroundTilemap. No-op pour pas casser
  // les callers — le BlitBitmapToWindow path original est removed (dead code).
}

/** 1:1 décomp item_menu.c:DrawPocketIndicatorSquare(x, isCurrentPocket) :
 *    if (!isCurrentPocket)
 *        FillBgTilemapBufferRect_Palette0(2, 0x1017, x + 5, 3, 1, 1);
 *    else
 *        FillBgTilemapBufferRect_Palette0(2, 0x102B, x + 5, 3, 1, 1);
 *
 *  Tile 0x1017 = paletteBank 1 + tile 23 (= dot vide)
 *  Tile 0x102B = paletteBank 1 + tile 43 (= dot rempli courant)
 *  Position (x+5, 3) pour pocket x = 0..4. */
function _drawPocketDots(): void {
  const rt = getRuntime();
  if (!rt) return;
  for (let i = 0; i < POCKETS.length; i++) {
    const tile = (i === _pocketIdx) ? 0x102B : 0x1017;
    _fillBgTilemapRect(rt, tile, i + 5, 3, 1, 1);
  }
}

function _drawDots(): void {
  _drawPocketDots();
}

function _drawHeader(): void {
  if (_headerWid < 0) return;
  // 1:1 décomp item_menu.c:PrintPocketNames :
  //   offset = GetStringCenterAlignXOffset(FONT_NORMAL, pocketName1, 0x40);
  //   BagMenu_Print(windowId, FONT_NORMAL, pocketName1, offset, 1, ...);
  // 0x40 = 64 px = width de la zone pocket name. Center le texte dans 64 px.
  FillWindowPixelBuffer(_headerWid, 0x00);
  // Si on est en train de switch pocket, rendu double-buffer animé.
  // 1:1 décomp PrintPocketNames(pocketName1, pocketName2) où name1 = old + name2 = new,
  // puis CopyPocketNameToWindow(scrollOffset) chaque frame avec scrollOffset
  // de 0 à 8 (en pratique, qui correspond à un scroll horizontal de 8 tiles
  // soit 64 pixels, taille du buffer 32×32 / 2 = 16 tiles).
  if (_phase === 'switching_pocket') {
    // Position scroll : 0..16 → offset 0..-64 ou 0..+64 selon direction.
    const phase = _switchTimer;  // 0..16
    const scrollPx = Math.floor((phase / 16) * 64);  // 0..64
    const oldName = getString(POCKETS[_switchOldPocketIdx].textKey);
    const newName = getString(POCKETS[_switchNewPocketIdx].textKey);
    const oldOffset = GetStringCenterAlignXOffset(oldName, 0x40);
    const newOffset = GetStringCenterAlignXOffset(newName, 0x40);
    // RIGHT switch (dir=+1) : old glisse vers la gauche, new entre par la droite.
    // LEFT switch (dir=-1) : old glisse vers la droite, new entre par la gauche.
    const dir = _switchDir;
    AddTextPrinterParameterized3(
      _headerWid, FONT_NORMAL, oldOffset - dir * scrollPx, 1,
      COLOR_POCKET_NAME, TEXT_SKIP_DRAW, oldName,
    );
    AddTextPrinterParameterized3(
      _headerWid, FONT_NORMAL, newOffset + dir * (64 - scrollPx), 1,
      COLOR_POCKET_NAME, TEXT_SKIP_DRAW, newName,
    );
    _drawDots();
    PutWindowTilemap(_headerWid);
    CopyWindowToVram(_headerWid, 3);
    return;
  }
  const pocketName = getString(POCKETS[_pocketIdx].textKey);
  const offset = GetStringCenterAlignXOffset(pocketName, 0x40);
  AddTextPrinterParameterized3(
    _headerWid, FONT_NORMAL, offset, 1, COLOR_POCKET_NAME, TEXT_SKIP_DRAW,
    pocketName,
  );
  // Pas d'indicator "1/5" dans le décomp original — le pocket actif est
  // indiqué visuellement par le dot rouge sous le header.
  // Draw dots indicateur (= 1:1 DrawPocketIndicatorSquare).
  _drawDots();
  PutWindowTilemap(_headerWid);
  CopyWindowToVram(_headerWid, 3);
}

function _drawList(): void {
  if (_listWid < 0) return;
  FillWindowPixelBuffer(_listWid, 0x00);
  const items = _currentPocketItems();
  for (let i = 0; i < VISIBLE_ROWS; i++) {
    const idx = _scrollOffset + i;
    if (idx >= items.length) break;
    const slot = items[idx];
    const y = 1 + i * 16;
    // 1:1 décomp item_menu.c:1026 BagMenu_PrintCursorAtPos :
    //   BagMenu_Print(WIN_ITEM_LIST, FONT_NORMAL, gText_SelectorArrow2, 0, y, ...)
    // Cursor ▶ rendu en FONT_NORMAL à x=0, indépendamment du nom item.
    if (i === _cursorPos) {
      AddTextPrinterParameterized3(
        _listWid, FONT_NORMAL, 0, y, COLOR_MAIN, TEXT_SKIP_DRAW, '▶',
      );
    }
    if (slot.itemKey === CLOSE_BAG_KEY) {
      // 1:1 décomp gText_CloseBag = "FERMER LE SAC". Pas de quantity.
      // Position x=8 = après le cursor.
      AddTextPrinterParameterized3(
        _listWid, FONT_NARROW, 8, y, COLOR_MAIN, TEXT_SKIP_DRAW,
        getString('gText_CloseBag'),
      );
      continue;
    }
    // 1:1 décomp item_menu.c:262 sItemListMenu.fontId = FONT_NARROW.
    // Item name à x=8 (= après cursor at x=0).
    const pocketKey = POCKETS[_pocketIdx].key;
    const def = getItem(slot.itemKey);
    // 1:1 décomp item_menu.c:899 GetItemNameFromPocket :
    //   TMHM_POCKET → "CT01    FOCUS PUNCH" (= numéro + tab + nom du move).
    //   BERRIES_POCKET → "01  ORAN" (= numéro berry + nom).
    //   Default → nom item plain.
    let displayName = getItemNameFr(slot.itemKey);
    let isHM = false;
    if (pocketKey === 'tmHm' && def?.descriptionLabel) {
      // 1:1 décomp item_menu.c:899 GetItemNameFromPocket TMHM_POCKET render :
      //   StringCopy(gStringVar2, gMoveNames[ItemIdToBattleMoveId(itemId)]);
      //   if (itemId >= ITEM_HM01) → gText_NumberItem_HM avec nombre 1-8 (1 digit)
      //   else                     → gText_NumberItem_TMBerry avec nombre 1-50 (2 digits)
      // Notre items.json a déjà def.name = "CT01" / "CS01" (= prefix FR formatté
      // depuis le décomp). On utilise ça + le move name.
      const tmMatch = def.descriptionLabel.match(/^s(TM|HM)(\d+)Desc$/);
      if (tmMatch) {
        isHM = tmMatch[1] === 'HM';
        const itemNum = def.name;  // "CT01" / "CS01"
        const moveSlug = slot.itemKey.replace(/^ITEM_(TM|HM)_/, '');
        const moveName = getMoveNameFr(`MOVE_${moveSlug}`);
        displayName = `${itemNum} ${moveName}`;
      }
    }
    AddTextPrinterParameterized3(
      _listWid, FONT_NARROW, 8, y, COLOR_MAIN, TEXT_SKIP_DRAW, displayName,
    );
    // 1:1 décomp item_menu.c:969-971 BagMenu_ItemPrintCallback :
    //   if (itemId >= ITEM_HM01 && itemId <= ITEM_HM08)
    //     BlitBitmapToWindow(windowId, gBagMenuHMIcon_Gfx, 8, y - 1, 16, 16);
    // → petit badge "HM" 16×16. TODO : extraire hm_icon.png + blit. Pour
    // l'instant, le prefix "CS0N" du nom suffit à identifier les HMs (= 1:1
    // visuel acceptable car le nom CS01 etc. est déjà distinctif).
    // 1:1 décomp item_menu.c:973-988 BagMenu_ItemPrintCallback :
    //   if (BERRIES_POCKET) → print qty avec BERRY_CAPACITY_DIGITS
    //   else if (!KEYITEMS_POCKET && !GetItemImportance(itemId)) → print qty
    //   else → registered icon (key items) ou rien (HMs ont importance=1)
    // HMs = importance=1 → PAS de qty ("on en a qu'une" — user).
    // TMs = importance=0 → qty affichée comme un item normal ("on peut en avoir
    // plusieurs" — user). gText_xVar1 = "×{STR_VAR_1}".
    const showQty = (pocketKey === 'berries')
      || (pocketKey !== 'keyItems' && !isHM);
    if (showQty) {
      const qtyStr = `×${slot.quantity}`;
      const qtyX = GetStringRightAlignXOffset(qtyStr, 119);
      AddTextPrinterParameterized3(
        _listWid, FONT_NARROW, qtyX, y, COLOR_MAIN, TEXT_SKIP_DRAW, qtyStr,
      );
    }
  }
  PutWindowTilemap(_listWid);
  CopyWindowToVram(_listWid, 3);
}

function _drawDesc(): void {
  if (_descWid < 0) return;
  FillWindowPixelBuffer(_descWid, 0x00);
  // TODO étape 2 : blit du select_button.png (palette dédiée nécessaire =
  // bag.pal n'a pas les couleurs du button → glitch). Pour l'instant juste texte.
  const TEXT_LEFT = 4;
  const itemKey = _selectedItemKey();
  if (itemKey === CLOSE_BAG_KEY) {
    // 1:1 décomp item_menu.c:1008 PrintItemDescription LIST_CANCEL :
    //   StringCopy(gStringVar1, gBagMenu_ReturnToStrings[location]);
    //   StringExpandPlaceholders(gStringVar4, gText_ReturnToVar1);
    // gText_ReturnToVar1 = "Retourner\n{STR_VAR_1}." → dynamique selon location :
    // FIELD="au jeu", BATTLE="au combat", PC="au PC", PARTY="à la LISTE POKéMON".
    const tpl = getString('gText_ReturnToVar1');  // "Retourner\\n{STR_VAR_1}."
    const field = getString(RETURN_TO_STRINGS[_bagLocation]);
    const expanded = tpl.replace('{STR_VAR_1}', field);  // "Retourner\\nau jeu."
    // Le \n est literal dans le JSON, on split sur \\n ou \n.
    const lines = expanded.split(/\\n|\n/);
    for (let i = 0; i < Math.min(lines.length, 3); i++) {
      AddTextPrinterParameterized3(
        _descWid, FONT_NORMAL, TEXT_LEFT, 1 + i * 16, COLOR_MAIN, TEXT_SKIP_DRAW,
        lines[i],
      );
    }
    PutWindowTilemap(_descWid);
    CopyWindowToVram(_descWid, 3);
    return;
  }
  if (itemKey) {
    // 1:1 décomp item.c GetItemDescription(itemId) = gItems[itemId].description
    // = pointer vers le symbol "sPokeBallDesc". Notre items.json a
    // `descriptionLabel: "sPokeBallDesc"` → lookup direct dans strings.json
    // (= zéro hardcode, vraies descriptions FR du décomp).
    // Les newlines literals "\n" du décomp = déjà placés pour les 3 lignes max.
    const def = getItem(itemKey);
    const desc = def?.descriptionLabel ? getString(def.descriptionLabel) : '';
    const lines = desc.split(/\\n|\n/);
    for (let i = 0; i < Math.min(lines.length, 3); i++) {
      AddTextPrinterParameterized3(
        _descWid, FONT_NORMAL, TEXT_LEFT, 1 + i * 16, COLOR_MAIN, TEXT_SKIP_DRAW,
        lines[i],
      );
    }
  }
  // Note : pas de else branch (= itemKey null). _currentPocketItems append
  // toujours CLOSE_BAG_KEY donc une entry sélectionnable existe toujours.
  PutWindowTilemap(_descWid);
  CopyWindowToVram(_descWid, 3);
}

function _wrap(text: string, maxLen: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    if ((current + ' ' + w).trim().length > maxLen) {
      lines.push(current);
      current = w;
    } else {
      current = (current + ' ' + w).trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}

function _drawAll(): void {
  _drawSprite();
  _drawHeader();
  _drawList();
  _drawDesc();
  _drawItemIcon();
}

/** Convertit ITEM_KEY → filename slug pour /decomp/em/items/icons/.
 *  ITEM_POKE_BALL → poke_ball
 *  ITEM_POTION → potion
 *  ITEM_FULL_HEAL → full_heal
 *  Cas spécial : RETURN_TO_FIELD → return_to_field_arrow (= 1:1 décomp
 *  gItemIcon_ReturnToFieldArrow pour ITEM_LIST_END = ITEMS_COUNT). */
/** Mapping ITEM_X → file slug (= gItemIcon_X → "graphics/items/icons/X.png").
 *  Loaded au boot par initItemIconMap depuis /decomp/em/items/item-icon-map.json
 *  (= généré par scripts/extract-item-icon-map.mjs depuis item_icon_table.h
 *  + graphics/items.h du décomp).
 *
 *  1:1 décomp pattern : plusieurs items partagent un sprite (Orb, TM, HM, etc.)
 *  avec une palette différente par item. Sans ce mapping, le slug auto
 *  ITEM_RED_ORB → red_orb.png n'existe pas (= seule orb.png est extraite). */
let _itemIconMap: Record<string, string> = {};
/** Mapping ITEM_X → palette file slug (= gItemIconPalette_X). 1:1 décomp
 *  pattern : RED_ORB et BLUE_ORB partagent gItemIcon_Orb (= orb.png) mais
 *  ont des palettes différentes (red_orb.pal vs blue_orb.pal) qui donnent
 *  des couleurs différentes au même sprite. Sans charger la palette per-item,
 *  les 2 apparaissent identiques (= bug "même sprite" reporté par user). */
let _itemPaletteMap: Record<string, string> = {};

export async function initItemIconMap(): Promise<void> {
  try {
    const [iconResp, palResp] = await Promise.all([
      fetch('/decomp/em/items/item-icon-map.json'),
      fetch('/decomp/em/items/item-palette-map.json'),
    ]);
    if (iconResp.ok) _itemIconMap = await iconResp.json();
    if (palResp.ok) _itemPaletteMap = await palResp.json();
  } catch (e) {
    console.warn('[bag-screen] item-icon-map.json load failed', e);
  }
}

function _itemIconUrlBase(itemKey: string): string {
  if (itemKey === 'ITEM_RETURN_TO_FIELD') {
    return '/decomp/em/items/icons/return_to_field_arrow';
  }
  // 1:1 décomp mapping si présent dans item-icon-map.json.
  const mapped = _itemIconMap[itemKey];
  if (mapped) return `/decomp/em/items/icons/${mapped}`;
  // Fallback TM/HM nommés (notre items.json utilise ITEM_TM_FOCUS_PUNCH mais
  // le décomp utilise ITEM_TM01 → pas dans le mapping). Tous les TM/HM partagent
  // gItemIcon_TM / gItemIcon_HM (= tm.png / hm.png).
  if (itemKey.startsWith('ITEM_TM_')) {
    return '/decomp/em/items/icons/tm';
  }
  if (itemKey.startsWith('ITEM_HM_')) {
    return '/decomp/em/items/icons/hm';
  }
  // Fallback final : slug auto depuis ITEM_X.
  const slug = itemKey.replace(/^ITEM_/, '').toLowerCase();
  return `/decomp/em/items/icons/${slug}`;
}

/** URL de la palette per-item (= 1:1 décomp gItemIconPalette_X). */
function _itemPaletteUrl(itemKey: string): string | null {
  const slug = _itemPaletteMap[itemKey];
  if (!slug) return null;
  return `/decomp/em/items/icon_palettes/${slug}.pal`;
}

/** Charge async l'icône de l'item sélectionné dans une cache, puis la draw.
 *  Idempotent : si même item déjà loadé, juste re-blit.
 *
 *  1:1 décomp : sprite charData partagé + palette per-item (= load les 2
 *  séparément). Le PNG embed sa propre palette mais on l'override avec la
 *  per-item palette du décomp si dispo. */
async function _ensureItemIconLoaded(itemKey: string): Promise<void> {
  if (_itemIconCache[itemKey]) return;
  try {
    const base = _itemIconUrlBase(itemKey);
    const png = await loadIndexedPngStrict(`${base}.png`, 4);
    // 1:1 décomp : si une palette per-item existe (= cas Red/Blue Orb, Potions
    // variants, etc.), elle override la palette embed du PNG.
    let palette = png.palette;
    const palUrl = _itemPaletteUrl(itemKey);
    if (palUrl) {
      try {
        const customPal = await loadGbaPal(palUrl);
        palette = customPal;
      } catch (palErr) {
        console.warn(`[bag-screen] palette load failed for ${itemKey}, using PNG embed`, palErr);
      }
    }
    _itemIconCache[itemKey] = { charData: png.charData, palette };
  } catch (e) {
    // Item icon manquant : on ignore (= window restera vide pour cet item).
    console.warn(`[bag-screen] item icon load failed for ${itemKey}`, e);
  }
}

function _drawItemIcon(): void {
  if (_itemIconWid < 0) return;
  FillWindowPixelBuffer(_itemIconWid, 0x00);
  const itemKey = _selectedItemKey();
  if (!itemKey) {
    PutWindowTilemap(_itemIconWid);
    CopyWindowToVram(_itemIconWid, 3);
    return;
  }
  // 1:1 décomp item_icon.c:GetItemIconPicOrPalette(ITEM_LIST_END) :
  //   if (itemId == ITEM_LIST_END) itemId = ITEMS_COUNT;
  //   gItemIconTable[ITEMS_COUNT] = { gItemIcon_ReturnToFieldArrow, ... };
  // → cursor sur LIST_CANCEL (= FERMER LE SAC) charge return_to_field_arrow.png
  // (= flèche retour 24×24 dans /items/icons/).
  // Treat CLOSE_BAG_KEY comme un item virtuel "ITEM_RETURN_TO_FIELD" : load
  // l'icon (= return_to_field_arrow.png) puis blit normalement.
  const effectiveKey = (itemKey === CLOSE_BAG_KEY) ? 'ITEM_RETURN_TO_FIELD' : itemKey;
  const icon = _itemIconCache[effectiveKey];
  if (!icon) {
    void _ensureItemIconLoaded(effectiveKey).then(() => {
      // 1:1 ROM : ne pas check _isOpen ici. Pendant state 13 (_drawAll), _isOpen
      // est encore false (= set true seulement au state default). Mais la
      // recursion peut résoudre APRÈS bag fully open. Vérifier juste que la
      // selection courante n'a pas changé (= si user a déjà scrollé, skip).
      if (_selectedItemKey() === itemKey && _itemIconWid >= 0) {
        _drawItemIcon();
      }
    });
    PutWindowTilemap(_itemIconWid);
    CopyWindowToVram(_itemIconWid, 3);
    return;
  }
  if (_loadedIconKey !== effectiveKey) {
    LoadPalette(icon.palette, ITEM_ICON_PAL * 16, icon.palette.length * 2);
    _loadedIconKey = effectiveKey;
  }
  BlitBitmapToWindow(_itemIconWid, icon.charData, 0, 0, 24, 24, 24);
  PutWindowTilemap(_itemIconWid);
  CopyWindowToVram(_itemIconWid, 3);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function IsBagScreenOpen(): boolean {
  return _isOpen;
}

/** Open le bag screen. Le caller passe un onClose callback (= start-menu doit
 *  ré-afficher son main menu après que l'user appuie B ici).
 *
 *  1:1 décomp Task_FadeAndCloseBagMenu / SetupBagMenu pattern :
 *    - Setup bag (= load assets, draw windows)
 *    - BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK) → fade IN
 *      depuis BLACK pendant 16 frames
 *    - Wait fade fini → bag interactive */
/** 1:1 décomp BagLocation public mapping pour les callers externes (= bedroom-pc).
 *  Permet d'ouvrir le bag en mode ITEMPC (= dispatch vers Task_ItemContext_Deposit
 *  au lieu du context menu USE/GIVE/TOSS normal). */
export const BAG_LOCATION_FIELD = 0;
export const BAG_LOCATION_ITEMPC = 6;
/** Callback exécuté au close du bag (= 1:1 décomp gBagPosition.exitCallback).
 *  Pour ITEMPC : `CB2_PlayerPCExitBagMenu` qui retourne au PC menu. */
let _bagExitCallback: (() => void) | null = null;

/** Retour combat (CB2 reshow) pour le mode BATTLE — pose en savedCallback a
 *  l'ouverture (meme pattern que le party-screen combat, valide switch #9). */
let _battleReturnCb: (() => void) | null = null;
/** Copie du reshow combat pour les flows multi-ecrans (medecine -> party). */
let _battleReshowCb: (() => void) | null = null;

/** items.json (battleUsage/battleUseFunc par ITEM_*) — fetch lazy module-cache.
 *  1:1 data decomp items.h (.battleUsage / .battleUseFunc). */
let _itemsJsonCache: Record<string, { battleUsage?: string; battleUseFunc?: string }> | null = null;
function _ensureItemsJson(): void {
  if (_itemsJsonCache) return;
  _itemsJsonCache = {};  // anti re-fetch
  void fetch('/decomp/em/items.json').then(r => r.ok ? r.json() : {}).then((j) => {
    _itemsJsonCache = j as Record<string, { battleUsage?: string; battleUseFunc?: string }>;
  }).catch(() => { /* garde vide */ });
}
function _itemBattleUseFunc(itemKey: string): string {
  return _itemsJsonCache?.[itemKey]?.battleUseFunc ?? '';
}

/** Entree SAC EN COMBAT (1:1 CB2_BagMenuFromBattle -> GoToBagMenu(BATTLE) ;
 *  l'UI = bag-screen reel, le retour = CB2_SetUpReshowBattleScreenAfterMenu).
 *  Le resultat (item choisi ou 0 = annule) = (globalThis).__battleBagResultItemId
 *  (bridge gSpecialVar_ItemId decomp), lu par CompleteWhenChoseItem cote
 *  controller. */
export function OpenBagScreenForBattle(returnCb: () => void): void {
  (globalThis as Record<string, unknown>).__battleBagResultItemId = 0;
  _battleReturnCb = returnCb;
  _battleReshowCb = returnCb;
  _ensureItemsJson();
  OpenBagScreen(undefined, BagLocation.BATTLE, undefined);
}

export function OpenBagScreen(_onCloseLegacy?: () => void, location: number = 0, exitCallback?: () => void): void {
  if (_isOpen) return;
  // 1:1 décomp `gBagPosition.location = location` (item_menu.c:617).
  _bagLocation = location as BagLocation;
  _bagExitCallback = exitCallback ?? null;
  // 1:1 décomp `GoToBagMenu` (item_menu.c:617) :
  //   gBagMenu = AllocZeroed(...)  ← notre gBagMenu state est implicite
  //   gBagPosition.exitCallback = exitCallback
  //   SetMainCallback2(CB2_Bag)
  //
  // Le `_onCloseLegacy` arg est obsolète depuis le CB2 swap (= le retour passe
  // par `gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu_Manual` set par
  // sacAction, qui re-init OW + reopen start menu via FieldCB chain — 1:1
  // décomp item_menu.c). Conservé pour compat callers.
  //
  // Pré-load les assets puis swap CB2. Le state machine `CB2_InitBagMenu` fait
  // le setup réel (= state 0..20 + default).
  void _loadAssets().then(() => {
    const rt = getRuntime();
    if (!rt) return;
    rt.gMain.state = 0;
    // 1:1 décomp `gBagPosition.savedCallback` :
    //   ITEMPC → CB2_PlayerPCExitBagMenu (= retour direct PC, PAS start menu)
    //   FIELD  → CB2_ReturnToFieldWithOpenMenu_Manual (= reopen start menu)
    // Sans cette branche, après close du bag ITEMPC, le start menu s'ouvre
    // par-dessus le PC re-open (= bug user "mélange des deux modes du sac").
    // BATTLE (=1) : le retour = le reshow combat (CB2 posee a la fermeture par
    // Task_CloseBagMenu via SetMainCallback2(savedCallback)) — PAS le retour OW.
    rt.gMain.savedCallback = (location === 1 /* BATTLE */ && _battleReturnCb)
      ? _battleReturnCb
      : (location === 6 /* ITEMPC */)
        ? CB2_ReturnToFieldLocal_Manual
        : CB2_ReturnToFieldWithOpenMenu_Manual;
    if (location === 1) _battleReturnCb = null;
    rt.SetMainCallback2(CB2_InitBagMenu);
  }).catch((e) => {
    console.error('[bag-screen] OpenBagScreen asset preload failed', e);
  });
}

// ═════════════════════════════════════════════════════════════════════════
// DEAD CODE REMOVED (session 129 CB2 swap refactor) :
// `_setupBackgroundTilemap` (180 lignes) was replaced by `_initBagBgs` +
// `_loadBagMenuGraphicsCb2` (= 1:1 décomp BagMenu_InitBGs + LoadBagMenu_Graphics).
// Le pattern CB2 swap supprime tous les hacks save/restore VRAM, hook
// _syncSubspriteOam, setFieldCameraSuspended. Cf. fin du fichier pour la
// state machine CB2_InitBagMenu 1:1 décomp item_menu.c.
// ═════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `FillBgTilemapBufferRect_Palette0(bg, tile, x, y, w, h)`.
 *  Overwrite une rect dans le BG tilemap avec un tile_idx donné.
 *  Tile entries u16 = (paletteBank << 12) | tile_idx. paletteBank=0 par défaut. */
function _fillBgTilemapRect(
  rt: ReturnType<typeof getRuntime>,
  tile: number, x: number, y: number, w: number, h: number,
): void {
  if (!rt) return;
  const mapOff = BAG_BG_MAP_BASE * 0x800;
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const px = x + dx;
      const py = y + dy;
      if (px < 0 || px >= 32 || py < 0 || py >= 32) continue;
      const byteIdx = mapOff + (py * 32 + px) * 2;
      rt.gba.vram[byteIdx] = tile & 0xFF;
      rt.gba.vram[byteIdx + 1] = (tile >> 8) & 0xFF;
    }
  }
}

/** 1:1 décomp item_menu_icons.c:437-442 AddBagVisualSprite :
 *    *spriteId = CreateSprite(&sBagSpriteTemplate, 68, 66, 0);
 *    SetBagVisualPocketId(bagPocketId, FALSE);
 *    → StartSpriteAnim(sprite, bagPocketId + 1)
 *
 *  Sprite 64×64 OAM, palette = bag.pal (16 colors, slot dynamique LoadSpritePalette).
 *  Le sprite affiche le sac selon le pocket courant (= différentes "frames"
 *  d'animation = différents tile offsets). */
function _spawnBagSpriteOam(assets: BagAssets): void {
  const rt = getRuntime();
  if (!rt) return;
  // Idempotent : ne load les assets dans VRAM OBJ qu'une fois.
  // 1:1 STRICT décomp item_menu_icons.c : LoadSpriteSheet(sBagSpriteSheet) +
  // LoadSpritePalette(sBagPaletteTable). Tag system honore gReservedSpriteTile
  // Count + alloue first-free → JAMAIS d'écrasement player tiles/palette.
  if (!_bagAssetsLoadedToObj) {
    _bagSpriteTileStart = LoadSpriteSheet({
      data: assets.bagSpriteRaw4bpp,
      size: assets.bagSpriteRaw4bpp.length,
      tag: TAG_BAG_SPRITE_GFX,
    });
    _bagSpritePalSlot = LoadSpritePalette({ data: assets.bagSpritePal, tag: TAG_BAG_SPRITE_PAL });
    _bagAssetsLoadedToObj = true;
  }
  // tileNum dans OAM = tileStart alloué + frame_offset selon pocket.
  // NB: dans le décomp, AnimCmds référencent des tile offsets relatifs au
  // sBagSpriteTemplate.tileTag — les frames pour chaque pocket sont à
  // offset 64, 128, 192, 256, 320 dans gBagMaleTiles.
  const baseTileNum = _bagSpriteTileStart;
  const frameOff = BAG_FRAME_TILE_OFFSET[_pocketIdx] ?? 0;
  const sprite = rt.CreateSpriteAtOam({
    tileId: baseTileNum + frameOff,
    paletteBank: _bagSpritePalSlot,
    // 1:1 décomp CreateSprite(template, 68, 66, 0) — CalcCenterToCornerVec
    // applique automatiquement -32/-32 pour shape=square 64×64. Notre
    // syncSpritesToOam fait oam.x = sprite.x + centerToCornerVecX.
    x: 68, y: 66,
    shape: 0,    // SQUARE
    size: 3,     // 64×64
    priority: 0,
  });
  _bagSpriteOamId = sprite.spriteId;
  _bagSpriteOamIndex = sprite.oamIndex;
}

/** 1:1 décomp item_menu.c:Task_SwitchBagPocket case 0 :
 *    DrawItemListBgRow(tPocketSwitchTimer);
 *    if (!(++tPocketSwitchTimer & 1))
 *        CopyPocketNameToWindow((u8)(tPocketSwitchTimer >> 1));
 *    if (tPocketSwitchTimer == 16)
 *        tPocketSwitchState++;
 *
 *  Démarre l'animation : 16 frames de DrawItemListBgRow row par row qui clear
 *  la list (= tile 17 jaune pâle uni). À la fin, swap pocket + reload list. */
function _startPocketSwitchAnim(dir: -1 | 1): void {
  if (_phase !== 'open') return;
  _phase = 'switching_pocket';
  _switchTimer = 0;
  _switchDir = dir;
  // 1:1 décomp PrintPocketNames(name1, name2) : on store les 2 indices pour
  // double-buffer scroll-in animation indépendamment de _pocketIdx (qui swap
  // au tick 8).
  _switchOldPocketIdx = _pocketIdx;
  _switchNewPocketIdx = (_pocketIdx + dir + POCKETS.length) % POCKETS.length;
  PlaySE(5);
  // 1:1 décomp gBagPosition.cursorPosition/scrollPosition[pocket] save :
  // before switch, save current pocket's cursor + scroll state.
  _cursorPerPocket[_pocketIdx] = _cursorPos;
  _scrollPerPocket[_pocketIdx] = _scrollOffset;
  // 1:1 décomp item_menu.c:SwitchBagPocket appelle :
  //   AddSwitchPocketRotatingBallSprite(rotationDirection);
  // → spawn rotating ball OAM à (16, 16) qui rotate 16 frames puis self-remove.
  if (_assets) {
    _spawnRotatingBallSprite(dir);
  }
  // Cache la list pendant l'animation : draw juste tile 17 sur toute la zone.
  // _tickPocketSwitchAnim va dessiner row par row.
}

// ─── Chevrons LEFT/RIGHT autour du pocket name ───────────────────────────────

/** 1:1 décomp list_menu.c:AddScrollIndicatorArrowPair :
 *    LoadCompressedSpriteSheet(sScrollIndicator_Gfx);
 *    LoadPalette(sRedInterface_Pal, OBJ_PLTT_ID(palNum), 32);
 *    AddScrollIndicatorArrowObject(LEFT, 28, 16, ...);
 *    AddScrollIndicatorArrowObject(RIGHT, 100, 16, ...);
 *
 *  scroll_indicator.png = 16×32 = 8 tiles 4bpp. Frame 0 (tiles 0-3) = LEFT.
 *  RIGHT = même tile data + hflip. Bobbing horizontal sin wave ±2 px. */
function _spawnPocketArrows(assets: BagAssets): void {
  const rt = getRuntime();
  if (!rt) return;
  // Idempotent : load gfx + palette dans VRAM OBJ une fois.
  // 1:1 STRICT décomp list_menu.c LoadCompressedSpriteSheet/LoadSpritePalette.
  if (!_scrollArrowAssetsLoaded) {
    _scrollArrowTileStart = LoadSpriteSheet({
      data: assets.scrollArrowGfx,
      size: assets.scrollArrowGfx.length,
      tag: TAG_SCROLL_ARROW_GFX,
    });
    _scrollArrowPalSlot = LoadSpritePalette({ data: assets.scrollArrowPal, tag: TAG_SCROLL_ARROW_PAL });
    _scrollArrowAssetsLoaded = true;
  }
  const baseTile = _scrollArrowTileStart;
  // 1:1 décomp sScrollIndicatorTemplates[SCROLL_ARROW_LEFT] :
  //   animNum=0 (frame 0, no flip), bounceDir=0 (horizontal), freq=8.
  const left = rt.CreateSpriteAtOam({
    tileId: baseTile, paletteBank: _scrollArrowPalSlot,
    x: 28, y: 16,
    shape: 0, size: 1,    // shape 0=square, size 1=16×16
    priority: 0,
  });
  _arrowLeftOamId = left.spriteId;
  _arrowLeftOamIndex = left.oamIndex;
  // 1:1 décomp animNum=1 = ANIMCMD_FRAME(0, 30, 1, 0) → tile 0 + hflip.
  const right = rt.CreateSpriteAtOam({
    tileId: baseTile, paletteBank: _scrollArrowPalSlot,
    x: 100, y: 16,
    shape: 0, size: 1,
    priority: 0,
  });
  _arrowRightOamId = right.spriteId;
  _arrowRightOamIndex = right.oamIndex;
  const rs = rt.gSprites[_arrowRightOamId];
  if (rs) rs.hFlip = true;
  _arrowSinePosLeft = 0;
  _arrowSinePosRight = 0;
}

function _despawnPocketArrows(): void {
  const rt = getRuntime();
  if (!rt) return;
  for (const id of [_arrowLeftOamId, _arrowRightOamId]) {
    if (id < 0) continue;
    const spr = rt.gSprites[id];
    if (spr) {
      spr.inUse = false;
      const oam = rt.gba.oam[spr.oamIndex];
      if (oam) oam.visible = false;
    }
    rt.gSprites[id] = undefined;
  }
  _arrowLeftOamId = -1;
  _arrowLeftOamIndex = -1;
  _arrowRightOamId = -1;
  _arrowRightOamIndex = -1;
}

/** 1:1 décomp list_menu.c:997-1022 SpriteCallback_ScrollIndicatorArrow case 1 :
 *    multiplier = sprite->tMultiplier;     // = 2 (sScrollIndicatorTemplates[].multiplier)
 *    sprite->x2 = (gSineTable[(u8)(sprite->tSinePos)] * multiplier) / 256;
 *    sprite->tSinePos += sprite->tFrequency;  // LEFT freq=8, RIGHT freq=-8 (=248 u8)
 *  → bobbing horizontal ±2 px chaque frame.
 *
 *  bounceDir = 0 = horizontal x2 (= LEFT/RIGHT chevrons). bounceDir = 1 serait
 *  vertical y2 (UP/DOWN chevrons, pas utilisés ici). */
function _tickPocketArrows(): void {
  const rt = getRuntime();
  if (!rt) return;
  const sLeft = _arrowLeftOamId >= 0 ? rt.gSprites[_arrowLeftOamId] : null;
  if (sLeft) {
    // 1:1 décomp gSineTable[idx & 0xFF] (forme fonction via decomp-helpers, backed par src/trig.ts).
    sLeft.x2 = (gSineTable(_arrowSinePosLeft) * 2) >> 8;
    _arrowSinePosLeft = (_arrowSinePosLeft + 8) & 0xFF;
  }
  const sRight = _arrowRightOamId >= 0 ? rt.gSprites[_arrowRightOamId] : null;
  if (sRight) {
    sRight.x2 = (gSineTable(_arrowSinePosRight) * 2) >> 8;
    // 1:1 décomp tFrequency = -8 → tSinePos -= 8 (u8 wrap → +248).
    _arrowSinePosRight = (_arrowSinePosRight - 8) & 0xFF;
  }
}

// ─── Flèches UP/DOWN scroll list (1:1 décomp item_menu.c:1030) ──────────────

/** 1:1 décomp item_menu.c:1033 CreatePocketScrollArrowPair :
 *    AddScrollIndicatorArrowPairParameterized(SCROLL_ARROW_UP, 172, 12, 148,
 *      numItemStacks - numShownItems, TAG_POCKET_SCROLL_ARROW, TAG_POCKET_SCROLL_ARROW,
 *      &scrollPosition);
 *  → UP arrow à (172, 12), DOWN arrow à (172, 148). Spawn quand list overflow,
 *  visible selon scroll position. */
function _spawnListScrollArrows(): void {
  const rt = getRuntime();
  if (!rt) return;
  // Idempotent — gfx + palette déjà loadés par _spawnPocketArrows (= même
  // scroll_indicator.png + red.pal).
  if (!_scrollArrowAssetsLoaded) return;
  const baseTile = _scrollArrowTileStart;
  // 1:1 décomp animNum=2 = ANIMCMD_FRAME(4, 30) → tile 4 (= frame UP/DOWN base).
  // Pour UP : no flip. Pour DOWN : vflip (= animNum=3 ANIMCMD_FRAME(4, 30, 0, 1)).
  const up = rt.CreateSpriteAtOam({
    tileId: baseTile + 4, paletteBank: _scrollArrowPalSlot,
    x: 172, y: 12,
    shape: 0, size: 1,
    priority: 0,
  });
  _arrowUpOamId = up.spriteId;
  _arrowUpOamIndex = up.oamIndex;
  const down = rt.CreateSpriteAtOam({
    tileId: baseTile + 4, paletteBank: _scrollArrowPalSlot,
    x: 172, y: 148,
    shape: 0, size: 1,
    priority: 0,
  });
  _arrowDownOamId = down.spriteId;
  _arrowDownOamIndex = down.oamIndex;
  const ds = rt.gSprites[_arrowDownOamId];
  if (ds) ds.vFlip = true;
  _arrowSinePosUp = 0;
  _arrowSinePosDown = 0;
}

function _despawnListScrollArrows(): void {
  const rt = getRuntime();
  if (!rt) return;
  for (const id of [_arrowUpOamId, _arrowDownOamId]) {
    if (id < 0) continue;
    const spr = rt.gSprites[id];
    if (spr) {
      spr.inUse = false;
      const oam = rt.gba.oam[spr.oamIndex];
      if (oam) oam.visible = false;
    }
    rt.gSprites[id] = undefined;
  }
  _arrowUpOamId = -1;
  _arrowUpOamIndex = -1;
  _arrowDownOamId = -1;
  _arrowDownOamIndex = -1;
}

/** 1:1 décomp list_menu.c:1126 Task_ScrollIndicatorArrowPair :
 *    - UP invisible si scrollOffset == 0 (fullyUpThreshold)
 *    - DOWN invisible si scrollOffset == numItems - numShown (fullyDownThreshold)
 *  + bobbing VERTICAL (bounceDir=1, y2 = sin*mult/256, UP freq=+8, DOWN freq=-8). */
function _tickListScrollArrows(): void {
  const rt = getRuntime();
  if (!rt) return;
  const items = _currentPocketItems();
  const maxOffset = Math.max(0, items.length - VISIBLE_ROWS);

  const sUp = _arrowUpOamId >= 0 ? rt.gSprites[_arrowUpOamId] : null;
  if (sUp) {
    sUp.invisible = (_scrollOffset === 0);
    sUp.y2 = (gSineTable(_arrowSinePosUp) * 2) >> 8;
    _arrowSinePosUp = (_arrowSinePosUp + 8) & 0xFF;
  }
  const sDown = _arrowDownOamId >= 0 ? rt.gSprites[_arrowDownOamId] : null;
  if (sDown) {
    sDown.invisible = (_scrollOffset >= maxOffset);
    sDown.y2 = (gSineTable(_arrowSinePosDown) * 2) >> 8;
    _arrowSinePosDown = (_arrowSinePosDown - 8) & 0xFF;
  }
}

// ─── Rotating ball au pocket switch (1:1 décomp item_menu_icons.c) ──────────

/** 1:1 décomp item_menu_icons.c:497-504 AddSwitchPocketRotatingBallSprite :
 *    LoadSpriteSheet(&sRotatingBallTable);
 *    LoadSpritePalette(&sRotatingBallPaletteTable);
 *    *spriteId = CreateSprite(&sRotatingBallSpriteTemplate, 16, 16, 0);
 *    gSprites[*spriteId].data[0] = rotationDirection;
 *
 *  sRotatingBallSpriteTemplate.callback = SpriteCB_SwitchPocketRotatingBallInit
 *  → init au 1er tick puis continue 16 frames puis remove. */
function _spawnRotatingBallSprite(dir: -1 | 1): void {
  const rt = getRuntime();
  if (!rt || !_assets) return;
  // 1:1 décomp LoadSpriteSheet(sRotatingBallTable) + LoadSpritePalette :
  //   tag-based VRAM upload une fois, idempotent.
  if (!_rotatingBallAssetsLoaded) {
    // 1:1 STRICT décomp LoadSpriteSheet(sRotatingBallTable) + LoadSpritePalette.
    _rotatingBallTileStart_local = LoadSpriteSheet({
      data: _assets.rotatingBall.charData,
      size: _assets.rotatingBall.charData.length,
      tag: TAG_ROTATING_BALL_GFX_LOCAL,
    });
    _rotatingBallPalSlot_local = LoadSpritePalette({
      data: _assets.rotatingBall.palette,
      tag: TAG_ROTATING_BALL_PAL,
    });
    _rotatingBallAssetsLoaded = true;
  }
  // Despawn ancien (= safety si on enchaîne 2 switches rapidement).
  if (_ballOamId >= 0) {
    _despawnRotatingBall();
  }
  // 1:1 décomp sRotatingBallOamData :
  //   .affineMode = ST_OAM_AFFINE_OFF (= 0)   ← initial, switch à NORMAL dans Init
  //   .shape = SPRITE_SHAPE(16x16) (= 0)
  //   .size = SPRITE_SIZE(16x16) (= 1)
  //   .priority = 2
  //   .matrixNum = 4 (= placeholder dans la struct, override par alloc)
  const baseTile = _rotatingBallTileStart_local;
  const ball = rt.CreateSpriteAtOam({
    tileId: baseTile, paletteBank: _rotatingBallPalSlot_local,
    // 1:1 décomp CreateSprite(template, 16, 16, 0) — sprite center à (16, 16).
    x: 16, y: 16,
    shape: 0, size: 1,        // 16×16 square
    priority: 2,              // 1:1 décomp .priority = 2
    affineMode: 0,            // 1:1 décomp .affineMode = ST_OAM_AFFINE_OFF
  });
  _ballOamId = ball.spriteId;
  _ballOamIndex = ball.oamIndex;
  // 1:1 décomp gSprites[*spriteId].data[0] = rotationDirection.
  _ballRotationDir = dir;
  _ballData3 = 0;
  _ballRotation = 0;
  _ballInitPending = true;  // Init callback exécuté au prochain tick.
}

function _despawnRotatingBall(): void {
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 décomp item_menu_icons.c:RemoveBagSprite(ITEMMENUSPRITE_BALL) :
  //   FreeSpriteTilesByTag(TAG_ROTATING_BALL_GFX);
  //   FreeSpritePaletteByTag(TAG_ROTATING_BALL_GFX);
  //   DestroySprite(&gSprites[*spriteId]);
  //   *spriteId = SPRITE_NONE;
  // → on libère le matrix slot via FreeOamMatrix (= 1:1 décomp DestroySprite si
  //   sprite has affineMode != OFF, sinon no-op).
  if (_ballMatrixNum >= 0) {
    FreeOamMatrix(_ballMatrixNum);
    _ballMatrixNum = -1;
  }
  if (_ballOamId >= 0) {
    const spr = rt.gSprites[_ballOamId];
    if (spr) {
      spr.inUse = false;
      const oam = rt.gba.oam[spr.oamIndex];
      if (oam) oam.visible = false;
    }
    rt.gSprites[_ballOamId] = undefined;
  }
  _ballOamId = -1;
  _ballOamIndex = -1;
  _ballData3 = 0;
  _ballRotation = 0;
  _ballInitPending = false;
}

/** 1:1 décomp item_menu_icons.c:506-510 UpdateSwitchPocketRotatingBallCoords :
 *    sprite->centerToCornerVecX = sprite->data[1] - ((sprite->data[3] + 1) & 1);
 *    sprite->centerToCornerVecY = sprite->data[1] - ((sprite->data[3] + 1) & 1);
 *
 *  data[1] = centerToCornerVecY initial (= -8 pour 16×16 square après l'écrase
 *  bug du décomp `data[1] = ctcvX; data[1] = ctcvY;` cf. SpriteCB_Init line
 *  521-522). data[3] = frame counter 0..16.
 *
 *  Effet : ctcv alterne -8/-9 chaque frame → wobble 1px du sprite. */
function _updateBallCoords(): void {
  const rt = getRuntime();
  const spr = rt?.gSprites[_ballOamId];
  if (!spr) return;
  const adjusted = _ballData1 - (((_ballData3 + 1) & 1));
  spr.centerToCornerVecX = adjusted;
  spr.centerToCornerVecY = adjusted;
}

/** 1:1 décomp src/sprite.c:ObjAffineSet inline pattern (= what
 *  applyMatrixFromAffineState fait dans sprite-engine-impl) :
 *    sin = gSineTable[rotation & 0xFF]
 *    cos = gSineTable[(rotation + 64) & 0xFF]
 *    pa =  (xScale * cos) >> 8         // xScale = 0x100 (= 1.0 = no scale)
 *    pb = -(xScale * sin) >> 8
 *    pc =  (yScale * sin) >> 8
 *    pd =  (yScale * cos) >> 8
 *
 *  ⚠️ ConvertScaleParam pas appliqué ici car xScale=yScale=0x100 → param=0x100
 *  (= identity), donc skipped pour clarté. */
function _ballApplyMatrix(): void {
  const rt = getRuntime();
  if (!rt || _ballMatrixNum < 0) return;
  const sin = gSineTable(_ballRotation & 0xFF);
  const cos = gSineTable((_ballRotation + 64) & 0xFF);
  const xScale = 0x100;
  const yScale = 0x100;
  const pa =  (xScale * cos) >> 8;
  const pb = -(xScale * sin) >> 8;
  const pc =  (yScale * sin) >> 8;
  const pd =  (yScale * cos) >> 8;
  SetOamMatrix(rt.gba, _ballMatrixNum, pa, pb, pc, pd);
}

/** 1:1 décomp item_menu_icons.c:512-525 SpriteCB_SwitchPocketRotatingBallInit :
 *    sprite->oam.affineMode = ST_OAM_AFFINE_NORMAL;
 *    if (sprite->data[0] == -1)
 *        sprite->affineAnims = sRotatingBallAnimCmds;       // Rotation1 +8/frame
 *    else
 *        sprite->affineAnims = sRotatingBallAnimCmds_FullRotation;  // Rotation2 -8/frame
 *
 *    InitSpriteAffineAnim(sprite);   // alloc matrix + reset affine state
 *    sprite->data[1] = sprite->centerToCornerVecX;
 *    sprite->data[1] = sprite->centerToCornerVecY;          // ← écrase data[1] avec ctcvY (bug)
 *    UpdateSwitchPocketRotatingBallCoords(sprite);
 *    sprite->callback = SpriteCB_SwitchPocketRotatingBallContinue; */
function _ballInitCallback(): void {
  const rt = getRuntime();
  if (!rt || _ballOamId < 0) return;
  const spr = rt.gSprites[_ballOamId];
  if (!spr) return;
  // sprite->oam.affineMode = ST_OAM_AFFINE_NORMAL.
  const oam = rt.gba.oam[_ballOamIndex];
  if (oam) oam.affineMode = 1;  // ST_OAM_AFFINE_NORMAL
  spr.affineMode = 1;
  // InitSpriteAffineAnim équiv : alloc matrix slot.
  _ballMatrixNum = AllocOamMatrix();
  spr.matrixNum = _ballMatrixNum;
  if (oam) oam.affineParamIndex = _ballMatrixNum;
  // 1:1 décomp ctcv 16×16 square = -8 (cf. sCenterToCornerVecTable[0][1] =
  // [-8, -8]). data[1] écrasé avec ctcvY (= bug du décomp où ctcvX overwritten).
  _ballData1 = -8;
  // 1:1 décomp Rotation1 / Rotation2 :
  //   Rotation1 (data[0] == -1) : AFFINEANIMCMD_FRAME(0, 0, 8, 16)   → rot += 8/frame
  //   Rotation2 (else)          : AFFINEANIMCMD_FRAME(0, 0, 248, 16) → rot += 248/frame
  // (248 = -8 signed mod 256 → opposite direction)
  // _ballRotationDir tracking → applied dans _ballContinueCallback.
  _updateBallCoords();
  _ballApplyMatrix();
  _ballInitPending = false;
}

/** 1:1 décomp item_menu_icons.c:527-533 SpriteCB_SwitchPocketRotatingBallContinue :
 *    sprite->data[3]++;
 *    UpdateSwitchPocketRotatingBallCoords(sprite);
 *    if (sprite->data[3] == 16)
 *        RemoveBagSprite(ITEMMENUSPRITE_BALL);
 *
 *  En parallèle, le pipeline d'animation affine (AnimateSprite branch
 *  affineAnimEnded) applique AFFINEANIMCMD_FRAME(0, 0, ±8, 16) chaque frame :
 *  rotation += rotationDelta. Ici on simule manuellement. */
function _ballContinueCallback(): void {
  if (_ballOamId < 0) return;
  // 1:1 décomp data[3]++ AVANT update coords (= ordre du décomp).
  _ballData3++;
  // Apply rotation += rotationDelta (= affine anim frame appliquée par pipeline).
  // Rotation1 (data[0] == -1) : +8 ; Rotation2 (data[0] != -1) : +248 (= -8 signed).
  const rotationDelta = (_ballRotationDir === -1) ? 8 : 248;
  _ballRotation = (_ballRotation + rotationDelta) & 0xFF;
  _ballApplyMatrix();
  _updateBallCoords();
  if (_ballData3 === 16) {
    _despawnRotatingBall();
  }
}

/** Tick du rotating ball : appelle Init au 1er tick, Continue ensuite. */
function _tickRotatingBall(): void {
  if (_ballOamId < 0) return;
  if (_ballInitPending) {
    _ballInitCallback();
    return;
  }
  _ballContinueCallback();
}

function _tickPocketSwitchAnim(): void {
  const rt = getRuntime();
  if (!rt) return;
  // 1:1 décomp DrawItemListBgRow(y) :
  //   FillBgTilemapBufferRect_Palette0(2, 17, 14, y + 2, 15, 1);
  // y va de 0 à 15 (= 16 rows). Notre fonction _fillBgTilemapRect fait pareil.
  // Note : la zone list = (14, 2, 15, 16) — y+2 = row absolute dans tilemap.
  _fillBgTilemapRect(rt, 17, 14, _switchTimer + 2, 15, 1);
  _switchTimer++;
  // 1:1 décomp parallel : SpriteCB_SwitchPocketRotatingBallContinue tick chaque
  // frame indépendamment du Task_SwitchBagPocket. data[3] s'incrémente.
  _tickRotatingBall();
  // Tous les 2 frames : update pocket name window pour scroll effect.
  // (= simplifié : on swap le label au tick 8 = milieu de l'anim).
  // 1:1 décomp item_menu.c:Task_SwitchBagPocket case 0 :
  //   if (!(++tPocketSwitchTimer & 1))
  //     CopyPocketNameToWindow((u8)(tPocketSwitchTimer >> 1));
  // → chaque 2 frames, refresh le pocket name window avec scroll offset.
  // On redraw simplement le header chaque frame (= scroll progressif).
  if ((_switchTimer & 1) === 0) {
    _drawHeader();
  }
  if (_switchTimer === 8) {
    _pocketIdx = (_pocketIdx + _switchDir + POCKETS.length) % POCKETS.length;
    // 1:1 décomp gBagPosition.cursorPosition[newPocket] restore (= au lieu de
    // reset à 0). Préserve la position cursor entre switches.
    _cursorPos = _cursorPerPocket[_pocketIdx];
    _scrollOffset = _scrollPerPocket[_pocketIdx];
    _updateBagSpriteOam();
  }
  if (_switchTimer >= 16) {
    // Animation finie → reload la list du nouveau pocket et redraw tout
    // (incluant header au cas où il aurait été cleared par les fillBgTilemap).
    _drawAll();
    _phase = 'open';
    _switchTimer = 0;
    _switchDir = 0;
  }
}

// ─── Context menu (A button → Use/Give/Toss/Cancel) ──────────────────────────

/** 1:1 décomp item_menu.c:OpenContextMenu :
 *    switch (gBagPosition.pocket) {
 *      case ITEMS_POCKET → sContextMenuItems_ItemsPocket (4 actions)
 *      case BERRIES_POCKET → sContextMenuItems_BerriesPocket (6 actions)
 *      ...
 *    }
 *  Setup les actions + display description "{ITEM} est sélectionné" + créer
 *  le window 2x2 ou 2x3 selon pocket. */
function _openContextMenu(): void {
  const itemKey = _selectedItemKey();
  if (!itemKey || itemKey === CLOSE_BAG_KEY) return;
  const pocketKey = POCKETS[_pocketIdx].key;
  // 1:1 décomp dispatch par pocket.
  let actions: ItemAction[];
  switch (pocketKey) {
    case 'items':     actions = [...CTX_ITEMS_POCKET]; break;
    case 'keyItems':  actions = [...CTX_KEY_ITEMS_POCKET]; break;
    case 'pokeBalls': actions = [...CTX_BALLS_POCKET]; break;
    case 'tmHm':      actions = [...CTX_TMHM_POCKET]; break;
    case 'berries':   actions = [...CTX_BERRIES_POCKET]; break;
  }
  // 1:1 item_menu.c OpenContextMenu mode BATTLE : balls -> [UTILISER, ANNULER]
  // (ItemUseInBattle_PokeBall) ; autres poches : battleUsage (medecine/X items)
  // = tranche ulterieure -> [ANNULER] seul (dette documentee).
  if (_bagLocation === BagLocation.BATTLE) {
    // 1:1 data items.h : UTILISER apparait si l'item a un battleUseFunc
    // (balls/medecine/PP/X items/escape) ; sinon RETOUR seul.
    const hasBattleUse = pocketKey === 'pokeBalls' || _itemBattleUseFunc(itemKey) !== '';
    actions = hasBattleUse
      ? [ItemAction.BATTLE_USE, ItemAction.CANCEL]
      : [ItemAction.CANCEL];
  }
  _ctxActions = actions;
  _ctxCursor = 0;
  _ctxItemKey = itemKey;
  _ctxItemPocketIdx = _pocketIdx;
  _ctxItemListIdx = _scrollOffset + _cursorPos;
  _phase = 'context_menu';

  // 1:1 décomp item_menu.c:1573 OpenContextMenu → BagDestroyPocketScrollArrowPair :
  // hide chevrons pocket (LEFT/RIGHT) + flèches UP/DOWN list pendant le context
  // menu (= sinon flèches OAM rendent par-dessus la window context).
  _despawnPocketArrows();
  _despawnListScrollArrows();

  // 1:1 décomp item_menu.c:1638 : description = "{ITEM} est\nsélectionné."
  // FillWindowPixelBuffer(WIN_DESCRIPTION, 0) + BagMenu_Print gText_Var1IsSelected.
  if (_descWid >= 0) {
    FillWindowPixelBuffer(_descWid, 0x00);
    const tpl = getString('gText_Var1IsSelected');  // "{STR_VAR_1} est\nsélectionné."
    const itemName = getItemNameFr(itemKey);
    const expanded = tpl.replace('{STR_VAR_1}', itemName);
    const lines = expanded.split(/\\n|\n/);
    for (let i = 0; i < Math.min(lines.length, 3); i++) {
      AddTextPrinterParameterized3(
        _descWid, FONT_NORMAL, 4, 1 + i * 16, COLOR_MAIN, TEXT_SKIP_DRAW, lines[i],
      );
    }
    PutWindowTilemap(_descWid);
    CopyWindowToVram(_descWid, 3);
  }

  // Create + draw context menu window.
  const tpl = (actions.length > 4) ? CTX_2X3_WINDOW_TEMPLATE : CTX_2X2_WINDOW_TEMPLATE;
  _ctxWid = AddWindow(tpl);
  DrawStdFrameWithCustomTileAndPalette(_ctxWid, true, STD_FRAME_TILE, STD_FRAME_PAL);
  _drawContextMenu();
}

/** Render le context menu (= 2x2 ou 2x3 grid de labels + cursor ▶).
 *  1:1 décomp item_menu.c:1684 PrintContextMenuItemGrid :
 *    PrintMenuActionGrid(windowId, FONT_NARROW, 8, 1, 56, columns, rows,
 *      sItemMenuActions, gBagMenu->contextMenuItemsPtr);
 *  → FONT_NARROW (= même que la list des items), left=8, top=1, optionWidth=56 px. */
function _drawContextMenu(): void {
  if (_ctxWid < 0) return;
  // 1:1 décomp item_menu.c PrintContextMenuItemGrid → PrintMenuActionGrid.
  // PIXEL_FILL(1) = 0x11 (= idx 1 = cream/off-white std_menu.pal palette 15).
  // Le pixel buffer interior est opaque cream → items list BG=0 derrière reste
  // visible MAIS le context menu écrit ses tiles par-dessus à priority=0.
  FillWindowPixelBuffer(_ctxWid, 0x11);
  const cols = 2;
  const colWidth = 56;  // 1:1 décomp optionWidth = 56 px par colonne.
  const rowHeight = 16;
  for (let i = 0; i < _ctxActions.length; i++) {
    const action = _ctxActions[i];
    if (action === ItemAction.DUMMY) continue;
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 8 + col * colWidth;
    const y = 1 + row * rowHeight;
    if (i === _ctxCursor) {
      // Cursor "▶" en couleur dark gray sur cream (= matche text).
      AddTextPrinterParameterized3(
        _ctxWid, FONT_NORMAL, x - 8, y, COLOR_CTX_NORMAL, TEXT_SKIP_DRAW, '▶',
      );
    }
    const textKey = ACTION_TEXT_KEYS[action];
    const label = getString(textKey);
    // 1:1 décomp FONT_NARROW + COLORID_NORMAL [bg=1, fg=2, shadow=3] sur cream.
    AddTextPrinterParameterized3(
      _ctxWid, FONT_NARROW, x, y, COLOR_CTX_NORMAL, TEXT_SKIP_DRAW, label,
    );
  }
  PutWindowTilemap(_ctxWid);
  CopyWindowToVram(_ctxWid, 3);
}

function _closeContextMenu(): void {
  if (_ctxWid >= 0) {
    ClearStdWindowAndFrame(_ctxWid, true);
    RemoveWindow(_ctxWid);
    _ctxWid = -1;
  }
  _ctxActions = [];
  // Le context menu (BG=1) chevauche la list (BG=0) à y=15-18. Au close,
  // ClearStdWindowAndFrame clear ses tilemap entries BG=1, mais la list BG=0
  // dessous reste intacte. Redraw quand même pour s'assurer que tout est OK.
  _drawList();
  _drawDesc();
  _drawItemIcon();
  _phase = 'open';
  // 1:1 décomp item_menu.c:1591 CloseContextMenu : re-spawn chevrons pocket +
  // flèches list que OpenContextMenu avait hidden.
  if (_assets) {
    _spawnPocketArrows(_assets);
    _spawnListScrollArrows();
  }
}

/** Find next non-DUMMY action position dans une direction (= 1:1 décomp
 *  IsValidContextMenuPos check). */
function _ctxMoveCursor(dx: number, dy: number): boolean {
  const cols = 2;
  const total = _ctxActions.length;
  const col = _ctxCursor % cols;
  const row = Math.floor(_ctxCursor / cols);
  const newCol = col + dx;
  const newRow = row + dy;
  if (newCol < 0 || newCol >= cols) return false;
  const newPos = newRow * cols + newCol;
  if (newPos < 0 || newPos >= total) return false;
  if (_ctxActions[newPos] === ItemAction.DUMMY) return false;
  _ctxCursor = newPos;
  return true;
}

function _tickContextMenu(newKeys: number, KEY_A: number, KEY_B: number, KEY_UP: number, KEY_DOWN: number, KEY_LEFT: number, KEY_RIGHT: number): void {
  if (newKeys & KEY_B) {
    PlaySE(5);
    _closeContextMenu();
    return;
  }
  if (newKeys & KEY_A) {
    PlaySE(5);
    const action = _ctxActions[_ctxCursor];
    _executeAction(action);
    return;
  }
  if (newKeys & KEY_UP) {
    if (_ctxMoveCursor(0, -1)) { PlaySE(5); _drawContextMenu(); }
    return;
  }
  if (newKeys & KEY_DOWN) {
    if (_ctxMoveCursor(0, 1)) { PlaySE(5); _drawContextMenu(); }
    return;
  }
  if (newKeys & KEY_LEFT) {
    if (_ctxMoveCursor(-1, 0)) { PlaySE(5); _drawContextMenu(); }
    return;
  }
  if (newKeys & KEY_RIGHT) {
    if (_ctxMoveCursor(1, 0)) { PlaySE(5); _drawContextMenu(); }
    return;
  }
}

/** 1:1 décomp sItemMenuActions[].func dispatch (item_menu.c:260-285 + body
 *  functions :1796-1995).
 *
 *  Cas portés 1:1 cette session :
 *    - REGISTER : toggle gSaveBlock1Ptr.registeredItem (item_menu.c:1916).
 *    - TOSS     : _startToss (= 1:1 item_menu.c:1817).
 *    - CANCEL   : close (= 1:1 item_menu.c:1985).
 *
 *  Cas non portés (= cascade vers screens U-tier non encore portés) :
 *    - USE (= ItemMenu_UseOutOfBattle :1796) : appelle GetItemFieldFunc dispatch
 *      → CB2 swap vers field item-use callbacks. Notre sac OW alternatif via
 *      OpenBag()+field-item-use-callbacks gère déjà 22/22 items. Le wire-up
 *      bag-screen → field demande swap CB2 (= dette R3 documentée).
 *    - GIVE (= ItemMenu_Give :1933) : cascade CB2_ChooseMonToGiveItem
 *      (party_menu.c). U-tier (= party screen state machines U2).
 *    - CHECK (= alias UseOutOfBattle, sItemMenuActions[ACTION_CHECK].func) : idem USE.
 *    - CHECK_TAG (= ItemMenu_CheckTag :1979) : cascade DoBerryTagScreen
 *      (berry_tag_screen.c). U-tier (= berry tag UI complet, screen jamais porté). */
function _executeAction(action: ItemAction): void {
  if (action === ItemAction.CANCEL || action === ItemAction.DUMMY) {
    _closeContextMenu();
    return;
  }
  if (action === ItemAction.TOSS) {
    _startToss();
    return;
  }
  if (action === ItemAction.REGISTER) {
    // 1:1 décomp item_menu.c:1916-1931 :
    //     if (gSaveBlock1Ptr->registeredItem == gSpecialVar_ItemId)
    //         gSaveBlock1Ptr->registeredItem = ITEM_NONE;
    //     else
    //         gSaveBlock1Ptr->registeredItem = gSpecialVar_ItemId;
    //     DestroyListMenuTask + LoadBagItemListBuffers + ListMenuInit
    //     ScheduleBgCopyTilemapToVram(0);
    //     ItemMenu_Cancel(taskId);
    const itemKey = _ctxItemKey;
    if (itemKey) {
      const itemId = resolveDecompConstant(itemKey) ?? 0;
      if (itemId !== 0) {
        if (gSaveBlock1Ptr.registeredItem === itemId) {
          gSaveBlock1Ptr.registeredItem = 0; // ITEM_NONE
          gSaveBlock1Ptr.__registeredItemKey = '';
        } else {
          gSaveBlock1Ptr.registeredItem = itemId;
          gSaveBlock1Ptr.__registeredItemKey = itemKey;
        }
      }
    }
    // 1:1 :1926-1930 : refresh list + cancel ctx window.
    _drawList();
    _closeContextMenu();
    return;
  }
  if (action === ItemAction.BATTLE_USE) {
    // 1:1 dispatch data-driven items.h .battleUseFunc (item_use.c).
    const itemKeyBU = _ctxItemKey;
    const itemIdBU = itemKeyBU ? (resolveDecompConstant(itemKeyBU) ?? 0) : 0;
    if (!itemKeyBU || !itemIdBU) { _closeContextMenu(); return; }
    // 1:1 item_menu.c Task_BagMenu_HandleInput : gSpecialVar_ItemId = item
    // selectionne (lu par ItemUseCB_Medicine/PPRecovery cote party).
    gSpecialVar.ItemId = itemIdBU;
    const useFunc = POCKETS[_pocketIdx].key === 'pokeBalls'
      ? 'ItemUseInBattle_PokeBall' : _itemBattleUseFunc(itemKeyBU);
    const g = globalThis as Record<string, unknown>;
    switch (useFunc) {
      case 'ItemUseInBattle_PokeBall': {
        // 1:1 item_use.c:949 : party+box pleines -> refus (BoxFull) ;
        // sinon RemoveBagItem + fermeture (l'anim throw suit cote moteur).
        const party = (g.gPlayerParty as Array<{ species?: number }> | undefined) ?? [];
        let count = 0;
        for (let i = 0; i < 6; i++) { if (party[i]?.species) count++; }
        const boxFull = (g.__pcBoxesFull as boolean | undefined) === true;
        if (count >= 6 && boxFull) {
          console.warn('[bag-battle] party + boxes pleines (1:1 BoxFull — UI message = dette)');
          _closeContextMenu();
          return;
        }
        RemoveBagItem(itemKeyBU, 1);
        g.__battleBagResultItemId = itemIdBU;
        _closeContextMenu();
        CloseBagScreen();
        return;
      }
      case 'ItemUseInBattle_StatIncrease': {
        // 1:1 item_use.c:994 : effet table sur le MON ACTIF (gBattlerInMenuId) ;
        // echec -> aucun effet (reste dans le bag) ; succes -> Remove + ferme.
        const bs = g.__battleState as { gBattlerPartyIndexes?: number[]; gBattlerInMenuId?: number } | undefined;
        const menuBattler = bs?.gBattlerInMenuId ?? 0;
        const partyIdx = bs?.gBattlerPartyIndexes?.[menuBattler] ?? 0;
        const party = (g.gPlayerParty as Array<Record<string, unknown>> | undefined) ?? [];
        const mon = party[partyIdx];
        if (!mon) { _closeContextMenu(); return; }
        const res = PokemonUseItemEffects(mon as never, itemIdBU, partyIdx, 0);
        if ((res as { cannotUse?: boolean }).cannotUse) {
          console.warn('[bag-battle] X item sans effet (gText_WontHaveEffect — UI message = dette)');
          _closeContextMenu();
          return;
        }
        RemoveBagItem(itemKeyBU, 1);
        g.__battleBagResultItemId = itemIdBU;
        _closeContextMenu();
        CloseBagScreen();
        return;
      }
      case 'ItemUseInBattle_Medicine':
      case 'ItemUseInBattle_PPRecovery': {
        // 1:1 item_use.c:1026/1039 : gItemUseCB = ItemUseCB_* puis le bag se
        // ferme VERS LE PARTY MENU (ChooseMonForInBattleItem). Retour party ->
        // reshow combat + emission selon CONSOMMATION reelle (qty avant/apres).
        setItemUseCB(useFunc === 'ItemUseInBattle_Medicine' ? ItemUseCB_Medicine : ItemUseCB_PPRecovery);
        const qtyBefore = CountTotalItemQuantityInBag(itemKeyBU);
        const reshow = _battleReshowCb;
        let opened = false;
        _battleReturnCb = null;
        const rt2 = getRuntime();
        if (rt2) {
          rt2.gMain.savedCallback = function BattleItemOpenPartyCB2(): void {
            if (opened) return;
            opened = true;
            void import('../ui/party-screen').then((party) => {
              party.OpenPartyScreenForItemUse(function BattleItemPartyReturnCB2(): void {
                const used = CountTotalItemQuantityInBag(itemKeyBU) < qtyBefore;
                (globalThis as Record<string, unknown>).__battleBagResultItemId = used ? itemIdBU : 0;
                reshow?.();
              });
            });
          };
        }
        _closeContextMenu();
        CloseBagScreen();
        return;
      }
      case 'ItemUseInBattle_Escape': {
        // 1:1 item_use.c:1046 : wild -> RemoveUsedItem + fermeture (le moteur
        // joue BattleScript_RunByUsingItem) ; trainer -> refus (DadsAdvice).
        const bs = g.__battleState as { gBattleTypeFlags?: number } | undefined;
        const TRAINER = 1 << 3;
        if (((bs?.gBattleTypeFlags ?? 0) & TRAINER) !== 0) {
          console.warn('[bag-battle] Escape item vs dresseur (DadsAdvice — UI message = dette)');
          _closeContextMenu();
          return;
        }
        RemoveBagItem(itemKeyBU, 1);
        g.__battleBagResultItemId = itemIdBU;
        _closeContextMenu();
        CloseBagScreen();
        return;
      }
      default:
        console.warn('[bag-battle] battleUseFunc non porte:', useFunc, '(dette)');
        _closeContextMenu();
        return;
    }
  }
  // USE / GIVE / CHECK / CHECK_TAG : dette R3 documentée (= cascade vers
  // screens U-tier). Log explicit + close (= comportement 1:1 incomplet, pas
  // un fake — chaque action demande CB2 swap vers screen non porté).
  const _actionName = action === ItemAction.USE ? 'USE'
    : action === ItemAction.GIVE ? 'GIVE'
    : action === ItemAction.CHECK ? 'CHECK'
    : action === ItemAction.CHECK_TAG ? 'CHECK_TAG'
    : `#${action as number}`;
  console.log(`[bag-screen] action ${_actionName} on ${_ctxItemKey} — dette R3 (cascade U-tier)`);
  _closeContextMenu();
}

// ─── Toss flow (1:1 décomp ItemMenu_Toss + Task_ChooseHowManyToToss) ────────

function _startToss(): void {
  // 1:1 décomp ItemMenu_Toss : si quantity == 1 → AskTossItems direct.
  // Sinon → quantity selector. KeyItems toujours qty=1 (pas affiché de toutes
  // façons), donc on saute direct au confirm.
  const slot = _currentPocketItems().find(s => s.itemKey === _ctxItemKey);
  _tossMaxQty = slot?.quantity ?? 1;
  _tossQty = 1;
  // Cleanup ctx window.
  if (_ctxWid >= 0) {
    ClearStdWindowAndFrame(_ctxWid, true);
    RemoveWindow(_ctxWid);
    _ctxWid = -1;
  }
  if (_tossMaxQty === 1) {
    _askTossItems();
  } else {
    _phase = 'toss_quantity';
    _qtyWid = AddWindow(QTY_WINDOW_TEMPLATE);
    DrawStdFrameWithCustomTileAndPalette(_qtyWid, true, STD_FRAME_TILE, STD_FRAME_PAL);
    _drawTossQuantity();
    _drawTossPrompt('gText_TossHowManyVar1s');
  }
}

function _drawTossPrompt(textKey: string): void {
  if (_descWid < 0) return;
  FillWindowPixelBuffer(_descWid, 0x00);
  const tpl = getString(textKey);
  const itemName = getItemNameFr(_ctxItemKey);
  const expanded = tpl
    .replace('{STR_VAR_1}', itemName)
    .replace('{STR_VAR_2}', String(_tossQty));
  const lines = expanded.split(/\\n|\n/);
  for (let i = 0; i < Math.min(lines.length, 3); i++) {
    AddTextPrinterParameterized3(
      _descWid, FONT_NORMAL, 4, 1 + i * 16, COLOR_MAIN, TEXT_SKIP_DRAW, lines[i],
    );
  }
  PutWindowTilemap(_descWid);
  CopyWindowToVram(_descWid, 3);
}

function _drawTossQuantity(): void {
  if (_qtyWid < 0) return;
  // PIXEL_FILL(1) = cream opaque (palette 15 idx 1 std_menu.pal).
  FillWindowPixelBuffer(_qtyWid, 0x11);
  // 1:1 décomp item_menu.c:1203 PrintItemQuantity :
  //   ConvertIntToDecimalStringN(... STR_CONV_MODE_LEADING_ZEROS, BAG_ITEM_CAPACITY_DIGITS=2);
  //   StringExpandPlaceholders(gStringVar4, gText_xVar1);  // "×{STR_VAR_1}"
  //   AddTextPrinterParameterized(windowId, FONT_NORMAL, gStringVar4,
  //     GetStringCenterAlignXOffset(FONT_NORMAL, gStringVar4, 0x28), 2, ...);
  // → "×01".."×99" avec leading zero, centered dans 0x28 (= 40 px), y=2.
  const qtyStr = `×${String(_tossQty).padStart(2, '0')}`;
  const xOffset = GetStringCenterAlignXOffset(qtyStr, 0x28);
  AddTextPrinterParameterized3(
    _qtyWid, FONT_NORMAL, xOffset, 2, COLOR_CTX_NORMAL, TEXT_SKIP_DRAW, qtyStr,
  );
  PutWindowTilemap(_qtyWid);
  CopyWindowToVram(_qtyWid, 3);
}

function _tickTossQuantity(newKeys: number, KEY_A: number, KEY_B: number, KEY_UP: number, KEY_DOWN: number): void {
  if (newKeys & KEY_UP) {
    _tossQty = Math.min(_tossQty + 1, _tossMaxQty);
    PlaySE(5);
    _drawTossQuantity();
    return;
  }
  if (newKeys & KEY_DOWN) {
    _tossQty = Math.max(_tossQty - 1, 1);
    PlaySE(5);
    _drawTossQuantity();
    return;
  }
  if (newKeys & KEY_A) {
    PlaySE(5);
    if (_qtyWid >= 0) {
      ClearStdWindowAndFrame(_qtyWid, true);
      RemoveWindow(_qtyWid);
      _qtyWid = -1;
    }
    _askTossItems();
    return;
  }
  if (newKeys & KEY_B) {
    PlaySE(5);
    _cancelToss();
    return;
  }
}

function _askTossItems(): void {
  _phase = 'toss_confirm';
  _tossYesNoCursor = 0;
  _drawTossPrompt('gText_ConfirmTossItems');
  _yesNoWid = AddWindow(YESNO_WINDOW_TEMPLATE);
  DrawStdFrameWithCustomTileAndPalette(_yesNoWid, true, STD_FRAME_TILE, STD_FRAME_PAL);
  _drawYesNo();
}

function _drawYesNo(): void {
  if (_yesNoWid < 0) return;
  // PIXEL_FILL(1) = cream opaque (palette 15 idx 1 std_menu.pal).
  FillWindowPixelBuffer(_yesNoWid, 0x11);
  for (let i = 0; i < 2; i++) {
    if (i === _tossYesNoCursor) {
      AddTextPrinterParameterized3(
        _yesNoWid, FONT_NORMAL, 0, 1 + i * 16, COLOR_CTX_NORMAL, TEXT_SKIP_DRAW, '▶',
      );
    }
    AddTextPrinterParameterized3(
      _yesNoWid, FONT_NORMAL, 8, 1 + i * 16, COLOR_CTX_NORMAL, TEXT_SKIP_DRAW,
      getString(i === 0 ? 'gText_Yes' : 'gText_No'),
    );
  }
  PutWindowTilemap(_yesNoWid);
  CopyWindowToVram(_yesNoWid, 3);
}

function _tickTossConfirm(newKeys: number, KEY_A: number, KEY_B: number, KEY_UP: number, KEY_DOWN: number): void {
  if (newKeys & KEY_UP) {
    if (_tossYesNoCursor > 0) { _tossYesNoCursor--; PlaySE(5); _drawYesNo(); }
    return;
  }
  if (newKeys & KEY_DOWN) {
    if (_tossYesNoCursor < 1) { _tossYesNoCursor++; PlaySE(5); _drawYesNo(); }
    return;
  }
  if (newKeys & KEY_A) {
    PlaySE(5);
    if (_yesNoWid >= 0) {
      ClearStdWindowAndFrame(_yesNoWid, true);
      RemoveWindow(_yesNoWid);
      _yesNoWid = -1;
    }
    if (_tossYesNoCursor === 0) {
      // Yes → ConfirmToss : show "Threw away N item" message, wait A/B.
      _confirmToss();
    } else {
      _cancelToss();
    }
    return;
  }
  if (newKeys & KEY_B) {
    PlaySE(5);
    _cancelToss();
    return;
  }
}

function _confirmToss(): void {
  _phase = 'toss_message';
  _drawTossPrompt('gText_ThrewAwayVar2Var1s');
}

function _tickTossMessage(newKeys: number, KEY_A: number, KEY_B: number): void {
  if (newKeys & (KEY_A | KEY_B)) {
    PlaySE(5);
    // 1:1 décomp Task_RemoveItemFromBag : RemoveBagItem(itemId, count) +
    // UpdatePocketItemList + ListMenuInit + ReturnToItemList.
    RemoveBagItem(_ctxItemKey, _tossQty);
    const pocketKey = POCKETS[_ctxItemPocketIdx].key;
    UpdatePocketItemList(pocketKey);
    // Fix cursor si on était sur le dernier item et qu'il a disparu.
    const items = _currentPocketItems();
    const maxIdx = items.length - 1;
    if (_scrollOffset + _cursorPos > maxIdx) {
      if (_cursorPos > 0) _cursorPos--;
      else if (_scrollOffset > 0) _scrollOffset--;
    }
    _cursorPerPocket[_pocketIdx] = _cursorPos;
    _scrollPerPocket[_pocketIdx] = _scrollOffset;
    _drawAll();
    _phase = 'open';
  }
}

function _cancelToss(): void {
  if (_qtyWid >= 0) {
    ClearStdWindowAndFrame(_qtyWid, true);
    RemoveWindow(_qtyWid);
    _qtyWid = -1;
  }
  if (_yesNoWid >= 0) {
    ClearStdWindowAndFrame(_yesNoWid, true);
    RemoveWindow(_yesNoWid);
    _yesNoWid = -1;
  }
  _drawDesc();
  _phase = 'open';
}

// ─── Item swap (SELECT button) ───────────────────────────────────────────────

/** 1:1 décomp item_menu.c:CanSwapItems :
 *    if (gBagPosition.location == FIELD || BATTLE)
 *      if (pocket != TMHM_POCKET && pocket != BERRIES_POCKET) return TRUE;
 *  → Swap disabled pour TM/HM (sortés automatiquement) et BAIES. */
function _canSwapItems(): boolean {
  if (_bagLocation !== BagLocation.FIELD && _bagLocation !== BagLocation.BATTLE) return false;
  const pocketKey = POCKETS[_pocketIdx].key;
  if (pocketKey === 'tmHm' || pocketKey === 'berries') return false;
  return true;
}

function _startItemSwap(): void {
  if (!_canSwapItems()) return;
  const itemKey = _selectedItemKey();
  if (!itemKey || itemKey === CLOSE_BAG_KEY) return;
  _phase = 'swap_items';
  _swapFromIdx = _scrollOffset + _cursorPos;
  // 1:1 décomp StringExpandPlaceholders(gStringVar4, gText_MoveVar1Where).
  if (_descWid >= 0) {
    FillWindowPixelBuffer(_descWid, 0x00);
    const tpl = getString('gText_MoveVar1Where');
    const expanded = tpl.replace('{STR_VAR_1}', getItemNameFr(itemKey));
    const lines = expanded.split(/\\n|\n/);
    for (let i = 0; i < Math.min(lines.length, 3); i++) {
      AddTextPrinterParameterized3(
        _descWid, FONT_NORMAL, 4, 1 + i * 16, COLOR_MAIN, TEXT_SKIP_DRAW, lines[i],
      );
    }
    PutWindowTilemap(_descWid);
    CopyWindowToVram(_descWid, 3);
  }
}

function _doItemSwap(toIdx: number): void {
  const arr = gBagPockets[_pocketIdx]?.itemSlots;
  if (!arr) return;
  // 1:1 décomp MoveItemSlotInList : déplace slot from → to en shiftant.
  if (_swapFromIdx !== toIdx && _swapFromIdx >= 0 && toIdx >= 0) {
    const realItems = arr.filter(s => s.itemKey && s.quantity > 0);
    if (_swapFromIdx < realItems.length && toIdx < realItems.length) {
      const moved = realItems.splice(_swapFromIdx, 1)[0];
      realItems.splice(toIdx, 0, moved);
      // Re-write arr.
      for (let i = 0; i < arr.length; i++) {
        if (i < realItems.length) {
          arr[i].itemKey = realItems[i].itemKey;
          arr[i].quantity = realItems[i].quantity;
        } else {
          arr[i].itemKey = '';
          arr[i].quantity = 0;
        }
      }
      // Cursor follow item.
      const total = realItems.length + 1;  // +1 = CLOSE_BAG entry
      const newAbs = Math.min(toIdx, total - 1);
      if (newAbs < VISIBLE_ROWS) {
        _cursorPos = newAbs;
        _scrollOffset = 0;
      } else {
        _cursorPos = VISIBLE_ROWS - 1;
        _scrollOffset = newAbs - (VISIBLE_ROWS - 1);
      }
      _cursorPerPocket[_pocketIdx] = _cursorPos;
      _scrollPerPocket[_pocketIdx] = _scrollOffset;
    }
  }
  _swapFromIdx = -1;
  _drawAll();
  _phase = 'open';
}

function _cancelItemSwap(): void {
  _swapFromIdx = -1;
  _drawDesc();
  _phase = 'open';
}

/** Update sprite sac OAM tileNum + bag jump animation au pocket switch.
 *  1:1 décomp item_menu_icons.c SetBagVisualPocketId(bagPocketId, TRUE) :
 *    sprite->y2 = -5;
 *    sprite->callback = SpriteCB_BagVisualSwitchingPockets;
 *  → sprite shifté -5 px puis revient à 0 chaque frame. */
function _updateBagSpriteOam(): void {
  const rt = getRuntime();
  if (!rt || _bagSpriteOamId < 0) return;
  const sprite = rt.gSprites[_bagSpriteOamId];
  if (!sprite) return;
  const baseTileNum = _bagSpriteTileStart;
  const frameOff = BAG_FRAME_TILE_OFFSET[_pocketIdx] ?? 0;
  const oam = rt.gba.oam[sprite.oamIndex];
  // OAM field = `tileId` (pas tileNum, qui n'existe pas dans la struct). Bug
  // précédent : oam.tileNum= silently créait une prop ignored by renderer.
  if (oam) oam.tileId = baseTileNum + frameOff;
  // 1:1 décomp `sprite->y2 = -5` au switch pocket → bag "jump" effect.
  sprite.y2 = -5;
}

/** 1:1 décomp SpriteCB_BagVisualSwitchingPockets :
 *    if (sprite->y2 != 0) sprite->y2++;
 *  → revient à 0 (= position normale) en 5 frames.
 *  Appelé chaque frame TickBagScreen quand bag est ouvert. */
function _tickBagSpriteJumpAnim(): void {
  const rt = getRuntime();
  if (!rt || _bagSpriteOamId < 0) return;
  const sprite = rt.gSprites[_bagSpriteOamId];
  if (!sprite) return;
  if (sprite.y2 < 0) sprite.y2++;
}

/** 1:1 décomp item_menu_icons.c:ShakeBagSprite + sSpriteAffineAnim_BagShake :
 *    AFFINEANIMCMD_FRAME(0, 0, 254, 2),  // rotation += -2 par frame, 2 frames
 *    AFFINEANIMCMD_FRAME(0, 0,   2, 4),  // rotation += +2 par frame, 4 frames
 *    AFFINEANIMCMD_FRAME(0, 0, 254, 4),  // rotation += -2 par frame, 4 frames
 *    AFFINEANIMCMD_FRAME(0, 0,   2, 2),  // rotation += +2 par frame, 2 frames
 *    AFFINEANIMCMD_END
 *  Total 12 frames. Rotation accumulée : 0 → -4 → +4 → -4 → 0 (u8 wraparound).
 *  Appelé depuis BagMenu_MoveCursorCallback (= chaque cursor change). */
const BAG_SHAKE_ANIM: ReadonlyArray<{ delta: number; duration: number }> = [
  { delta: -2, duration: 2 },   // 254 u8 signed = -2
  { delta:  2, duration: 4 },
  { delta: -2, duration: 4 },
  { delta:  2, duration: 2 },
];
let _bagShakeMatrixNum = -1;
let _bagShakeRotation = 0;

function _triggerBagShake(): void {
  if (_bagShakeFrame > 0 && _bagShakeFrame < BAG_SHAKE_FRAMES) return; // already shaking
  const rt = getRuntime();
  if (!rt || _bagSpriteOamId < 0) return;
  const sprite = rt.gSprites[_bagSpriteOamId];
  const oam = rt.gba.oam[_bagSpriteOamIndex];
  if (!sprite || !oam) return;
  // 1:1 décomp StartSpriteAffineAnim : switch sprite to AFFINE_NORMAL +
  // alloc matrix slot. InitSpriteAffineAnim équivalent.
  oam.affineMode = 1;       // ST_OAM_AFFINE_NORMAL
  sprite.affineMode = 1;
  _bagShakeMatrixNum = AllocOamMatrix();
  sprite.matrixNum = _bagShakeMatrixNum;
  oam.affineParamIndex = _bagShakeMatrixNum;
  _bagShakeRotation = 0;
  _bagShakeFrame = 0;
  _bagShakeApplyMatrix();
}

/** 1:1 décomp ObjAffineSet inline : calcule pa/pb/pc/pd depuis rotation u8.
 *  Identique à _ballApplyMatrix mais pour bag (xScale=yScale=0x100, = 1.0). */
function _bagShakeApplyMatrix(): void {
  const rt = getRuntime();
  if (!rt || _bagShakeMatrixNum < 0) return;
  const sin = gSineTable(_bagShakeRotation & 0xFF);
  const cos = gSineTable((_bagShakeRotation + 64) & 0xFF);
  const xScale = 0x100;
  const yScale = 0x100;
  const pa =  (xScale * cos) >> 8;
  const pb = -(xScale * sin) >> 8;
  const pc =  (yScale * sin) >> 8;
  const pd =  (yScale * cos) >> 8;
  SetOamMatrix(rt.gba, _bagShakeMatrixNum, pa, pb, pc, pd);
}

/** 1:1 décomp ApplyAffineAnimFrameRelative : applique rotationDelta par frame
 *  selon la position dans la table BAG_SHAKE_ANIM. À 12 frames, l'anim se
 *  termine → SpriteCB_ShakeBagSprite → restore AFFINE_OFF + FreeOamMatrix. */
function _tickBagSpriteShake(): void {
  if (_bagShakeFrame >= BAG_SHAKE_FRAMES) return;
  _bagShakeFrame++;
  // Find current animation step from cumulative frame count.
  let cumulative = 0;
  let delta = 0;
  for (const cmd of BAG_SHAKE_ANIM) {
    if (_bagShakeFrame <= cumulative + cmd.duration) {
      delta = cmd.delta;
      break;
    }
    cumulative += cmd.duration;
  }
  // 1:1 décomp AFFINEANIMCMD_FRAME(0, 0, rotationDelta, _) : rotation += delta.
  _bagShakeRotation = (_bagShakeRotation + delta) & 0xFF;
  _bagShakeApplyMatrix();
  if (_bagShakeFrame >= BAG_SHAKE_FRAMES) {
    // 1:1 décomp SpriteCB_ShakeBagSprite : sprite->callback = SpriteCallbackDummy ;
    // mais avant on doit FreeOamMatrix + restore affineMode = AFFINE_OFF pour
    // que le bag continue à rendre correctement.
    const rt = getRuntime();
    if (!rt || _bagSpriteOamId < 0) return;
    const sprite = rt.gSprites[_bagSpriteOamId];
    const oam = rt.gba.oam[_bagSpriteOamIndex];
    if (sprite && oam) {
      oam.affineMode = 0;     // ST_OAM_AFFINE_OFF
      sprite.affineMode = 0;
    }
    if (_bagShakeMatrixNum >= 0) {
      FreeOamMatrix(_bagShakeMatrixNum);
      _bagShakeMatrixNum = -1;
    }
    _bagShakeRotation = 0;
  }
}


/** Drive depuis le tick start-menu. Lit gMain.newKeys et navigue.
 *  Caller doit consume les keys après cet appel.
 *
 *  1:1 décomp list_menu.c:ListMenu_ProcessInput utilise :
 *    - JOY_NEW(A/B)         : new press only (= newKeys & KEY)
 *    - JOY_REPEAT(UP/DOWN)  : new press OU repeated key (= hold to scroll)
 *  JOY_REPEAT lit gMain.newAndRepeatedKeys. Le runtime maintient ce field
 *  avec gKeyRepeatStartDelay=40 + gKeyRepeatContinueDelay=5 (1:1 main.c). */
/** Démarre le close du bag screen. 1:1 décomp item_menu.c:1077
 *  Task_FadeAndCloseBagMenu pattern :
 *    BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);
 *    gTasks[taskId].func = Task_CloseBagMenu;  // wait fade
 *
 *  Le Task créé tick chaque frame via RunTasks dans MainCB2_BagMenuRun.
 *  Quand fade fini, Task_CloseBagMenu free les ressources et
 *  SetMainCallback2(gMain.savedCallback = CB2_ReturnToFieldWithOpenMenu_Manual)
 *  pour return à l'OW + reopen start menu. */
export function CloseBagScreen(): void {
  if (!_isOpen || _phase === 'fading_out') return;
  _phase = 'fading_out';
  const rt = getRuntime();
  if (!rt) return;
  // Kill l'input task pour stopper TickBagScreen pendant fade out
  // (= sinon il consume les keys, user pourrait re-A pendant fade).
  if (_bagInputTaskId >= 0) {
    rt.DestroyTask(_bagInputTaskId);
    _bagInputTaskId = -1;
  }
  // 1:1 décomp Task_FadeAndCloseBagMenu — créé directement.
  // Le exitCallback (= `_bagExitCallback`) est invoqué DANS
  // Task_CloseBagMenu_BagScreen APRÈS `_freeBagMenu` (= windows/sprites/VRAM
  // bag clean). Sans ça, le exitCb (ex. OpenBedroomPC qui re-ouvre le PC)
  // fire pendant que le bag est encore visible → corruption visuelle BG/OAM
  // (user-flag : "quand on sors du menu on a une corruption").
  rt.CreateTask(Task_FadeAndCloseBagMenu_BagScreen, 0);
  _bagLocation = BagLocation.FIELD;  // reset pour next open
}

export function TickBagScreen(newKeys: number): void {
  if (!_isOpen) return;

  // Phase machine : pendant fade in/out, ignore inputs (= 1:1 décomp Task
  // attend !gPaletteFade.active). Fade out cleanup handled par
  // Task_FadeAndCloseBagMenu_BagScreen + Task_CloseBagMenu_BagScreen
  // (= 1:1 décomp item_menu.c). On reste dans 'fading_out' jusqu'à ce que
  // Task swap CB2 (= TickBagScreen ne tournera plus après ça).
  const rt = getRuntime();
  if (_phase === 'fading_in') {
    if (rt && !rt.gPaletteFade.active) _phase = 'open';
    return;
  }
  if (_phase === 'fading_out') {
    return;  // wait pour Task_CloseBagMenu (CB2 swap to OW)
  }
  if (_phase === 'switching_pocket') {
    _tickPocketSwitchAnim();
    return;
  }
  // Bag jump anim : continue en arrière-plan (incremente y2 vers 0).
  _tickBagSpriteJumpAnim();
  // 1:1 décomp list_menu.c:Task_ScrollIndicatorArrowPair → tick les chevrons
  // chaque frame (= sin wave bobbing horizontal).
  _tickPocketArrows();
  // 1:1 décomp idem pour les flèches UP/DOWN scroll list (= visibility +
  // bobbing vertical). Visibles seulement quand scroll possible.
  _tickListScrollArrows();
  // 1:1 décomp : SpriteCB_SwitchPocketRotatingBallContinue tick chaque frame
  // jusqu'à data[3]==16 → RemoveBagSprite. Le sprite outlive le Task_SwitchBagPocket
  // de 1 frame (= task termine à timer==16 mais ball callback a encore 1 continue
  // restant). Tick aussi en phase 'open' pour laisser le ball self-despawn.
  if (_ballOamId >= 0) _tickRotatingBall();
  // 1:1 décomp ShakeBagSprite : tick anim affine (rotate -2/+2 sur 12 frames).
  _tickBagSpriteShake();

  // Note : pas besoin de hide les sprites au tick. Le hook _syncSubspriteOam
  // installé au open s'exécute APRÈS syncSpritesToOam chaque frame et clear
  // tous les OAM. Voir _setupBackgroundTilemap.
  // Constants 1:1 décomp gba/io_reg.h.
  const KEY_A = 0x0001;
  const KEY_B = 0x0002;
  const KEY_SELECT = 0x0004;
  const KEY_START = 0x0008;
  const KEY_RIGHT = 0x0010;
  const KEY_LEFT = 0x0020;
  const KEY_UP = 0x0040;
  const KEY_DOWN = 0x0080;
  const KEY_R = 0x0100;
  const KEY_L = 0x0200;

  // 1:1 décomp list_menu.c:406-414 : UP/DOWN utilisent JOY_REPEAT (= hold to
  // scroll après gKeyRepeatStartDelay=40 frames, puis chaque gKeyRepeatContinueDelay=5).
  const repeatedKeys = (rt?.gMain as unknown as { newAndRepeatedKeys?: number })?.newAndRepeatedKeys ?? newKeys;

  // Phases overlay (context menu / toss / swap) — routes les inputs ici AVANT
  // le scrolling normal de la list.
  if (_phase === 'context_menu') {
    _tickContextMenu(newKeys, KEY_A, KEY_B, KEY_UP, KEY_DOWN, KEY_LEFT, KEY_RIGHT);
    return;
  }
  if (_phase === 'toss_quantity') {
    _tickTossQuantity(repeatedKeys, KEY_A, KEY_B, KEY_UP, KEY_DOWN);
    return;
  }
  if (_phase === 'toss_confirm') {
    _tickTossConfirm(newKeys, KEY_A, KEY_B, KEY_UP, KEY_DOWN);
    return;
  }
  if (_phase === 'toss_message') {
    _tickTossMessage(newKeys, KEY_A, KEY_B);
    return;
  }
  if (_phase === 'itempc_deposit_qty') {
    _tickItemPCDepositQty(repeatedKeys, KEY_A, KEY_B, KEY_UP, KEY_DOWN, KEY_LEFT, KEY_RIGHT);
    return;
  }
  if (_phase === 'itempc_deposit_msg') {
    _tickItemPCDepositMsg(newKeys, KEY_A, KEY_B);
    return;
  }
  if (_phase === 'swap_items') {
    // 1:1 décomp Task_HandleSwappingItemsInput : SELECT confirm swap, B cancel,
    // UP/DOWN scroll, A → swap to cursor pos.
    const items = _currentPocketItems();
    if (newKeys & KEY_SELECT) {
      PlaySE(5);
      _doItemSwap(_scrollOffset + _cursorPos);
      return;
    }
    if (newKeys & KEY_B) {
      PlaySE(5);
      _cancelItemSwap();
      return;
    }
    if (newKeys & KEY_A) {
      PlaySE(5);
      _doItemSwap(_scrollOffset + _cursorPos);
      return;
    }
    if (repeatedKeys & KEY_DOWN) {
      if (items.length === 0) return;
      const totalIdx = _scrollOffset + _cursorPos;
      if (totalIdx >= items.length - 1) return;
      if (_cursorPos < VISIBLE_ROWS - 1) _cursorPos++; else _scrollOffset++;
      PlaySE(5);
      _drawList();
      return;
    }
    if (repeatedKeys & KEY_UP) {
      if (items.length === 0) return;
      if (_cursorPos > 0) _cursorPos--;
      else if (_scrollOffset > 0) _scrollOffset--;
      else return;
      PlaySE(5);
      _drawList();
      return;
    }
    return;
  }

  const items = _currentPocketItems();

  if (newKeys & (KEY_B | KEY_START)) {
    PlaySE(5 /* SE_SELECT */);
    CloseBagScreen();
    return;
  }
  // 1:1 décomp menu_helpers.c GetLRKeysPressed : si gSaveBlock2Ptr.optionsButtonMode
  // == OPTIONS_BUTTON_MODE_LR alors L/R = switch pocket. Notre port accept L/R
  // toujours (= dette R3 doc : optionsButtonMode check pas wire, le switch
  // visible dans les 2 modes au lieu d'1 — pas critique gameplay).
  if (repeatedKeys & (KEY_RIGHT | KEY_R)) {
    _startPocketSwitchAnim(1);
    return;
  }
  if (repeatedKeys & (KEY_LEFT | KEY_L)) {
    _startPocketSwitchAnim(-1);
    return;
  }
  if (repeatedKeys & KEY_DOWN) {
    if (items.length === 0) return;
    const totalIdx = _scrollOffset + _cursorPos;
    if (totalIdx >= items.length - 1) return;
    if (_cursorPos < VISIBLE_ROWS - 1) {
      _cursorPos++;
    } else {
      _scrollOffset++;
    }
    PlaySE(5);
    // 1:1 décomp BagMenu_MoveCursorCallback : ShakeBagSprite + scroll cursor.
    _triggerBagShake();
    _drawList();
    _drawDesc();
    _drawItemIcon();
    // Save cursor state au pocket courant.
    _cursorPerPocket[_pocketIdx] = _cursorPos;
    _scrollPerPocket[_pocketIdx] = _scrollOffset;
    return;
  }
  if (repeatedKeys & KEY_UP) {
    if (items.length === 0) return;
    if (_cursorPos > 0) {
      _cursorPos--;
    } else if (_scrollOffset > 0) {
      _scrollOffset--;
    } else {
      return;
    }
    PlaySE(5);
    _triggerBagShake();
    _drawList();
    _drawDesc();
    _drawItemIcon();
    _cursorPerPocket[_pocketIdx] = _cursorPos;
    _scrollPerPocket[_pocketIdx] = _scrollOffset;
    return;
  }
  if (newKeys & KEY_SELECT) {
    // 1:1 décomp Task_BagMenu_HandleInput JOY_NEW(SELECT_BUTTON) →
    // si CanSwapItems → StartItemSwap.
    if (_canSwapItems()) {
      PlaySE(5);
      _startItemSwap();
    }
    return;
  }
  if (newKeys & KEY_A) {
    const itemKey = _selectedItemKey();
    if (!itemKey) return;
    if (itemKey === CLOSE_BAG_KEY) {
      // 1:1 décomp : LIST_CANCEL → Task_FadeAndCloseBagMenu.
      PlaySE(5);
      CloseBagScreen();
      return;
    }
    PlaySE(5);
    // 1:1 décomp item_menu.c:1278 :
    //   sContextMenuFuncs[gBagPosition.location](taskId);
    // FIELD/PARTY/SHOP/etc. → Task_ItemContext_Normal → OpenContextMenu
    // ITEMPC → Task_ItemContext_Deposit (= bypass context menu, dispatch direct)
    if (_bagLocation === BagLocation.ITEMPC) {
      _itemContextDeposit(itemKey);
    } else {
      _openContextMenu();
    }
    return;
  }
}

// ─── ITEMMENULOCATION_ITEMPC deposit flow (= 1:1 item_menu.c:2203-2274) ─────

let _depositQtySelected = 1;
let _depositMaxQty = 1;
let _depositItemKey = '';
let _depositBagItemIdx = -1;
/** Pocket dans lequel l'item à déposer se trouve (= 1:1 décomp : la list courante
 *  du bag pointe vers ce pocket via gBagPosition.pocket). Sans ça, _findBagItemIdx
 *  ne cherche que dans gSaveBlock1Ptr.bag.items (= POCKET_ITEMS), et tous les autres
 *  pockets (BERRIES/POKE_BALLS/etc.) retournent -1 → deposit muet. */
let _depositPocketKey: 'items' | 'pokeBalls' | 'tmHm' | 'berries' | 'keyItems' = 'items';
/** Index of selected item in pocket array (for ListMenu refresh). */
let _depositListIdx = -1;

/** 1:1 décomp `Task_ItemContext_Deposit` (item_menu.c:2203-2221).
 *  qty=1 → TryDepositItem direct, sinon prompt "Déposer combien?" + qty rolling. */
function _itemContextDeposit(itemKey: string): void {
  _depositItemKey = itemKey;
  _depositListIdx = _scrollOffset + _cursorPos;
  // 1:1 décomp : `gBagPosition.pocket` (= pocket courant du bag) est utilisé
  // par TryDepositItem pour appeler RemoveBagItem qui prend l'itemId et trouve
  // automatiquement le slot via gItems[].pocket. Côté TS, on stocke le pocket
  // courant pour adresser le bon array gSaveBlock1Ptr.bag[*].
  _depositPocketKey = POCKETS[_pocketIdx].key;
  _depositBagItemIdx = _findBagItemIdx(itemKey);
  if (_depositBagItemIdx < 0) {
    console.warn('[bag-screen ITEMPC] bag item not found:', itemKey, 'in pocket', _depositPocketKey);
    return;
  }
  _depositMaxQty = _getBagPocketSlots()[_depositBagItemIdx].quantity;
  _depositQtySelected = 1;
  if (_depositMaxQty === 1) {
    _tryDepositItem();
    return;
  }
  // qty > 1 : prompt "Déposer combien?" dans WIN_DESCRIPTION + qty window
  // séparée (= ITEMWIN_QUANTITY). 1:1 décomp item_menu.c:2214-2219 :
  //   BagMenu_Print(WIN_DESCRIPTION, ..., gStringVar4, ...)  // prompt
  //   AddItemQuantityWindow(ITEMWIN_QUANTITY)                // qty window
  // Avant : on écrasait le prompt avec le qty texte dans _descWid → user voyait
  // "× 01" mais pas le prompt + qty ne s'affichait pas correctement.
  const itemName = getItemNameFr(itemKey);
  setStringVar(1, itemName);
  const tpl = getString('gText_DepositHowManyVar1');
  StringExpandPlaceholders(gStringVar4, encodeOwText(tpl));
  _printDescription(gStringVar4);
  // Open qty window (= 1:1 AddItemQuantityWindow).
  _qtyWid = AddWindow(QTY_WINDOW_TEMPLATE);
  DrawStdFrameWithCustomTileAndPalette(_qtyWid, true, STD_FRAME_TILE, STD_FRAME_PAL);
  _drawDepositQtyWindow();
  _phase = 'itempc_deposit_qty';
}

/** 1:1 décomp : raw slots du pocket courant (= sans filter empty, contrairement
 *  à _currentPocketItems qui ajoute CLOSE_BAG sentinel). */
function _getBagPocketSlots(): ItemSlot[] {
  // 1:1 décomp item.h:12-17 — POCKETS array order matches gBagPockets indices.
  const idx = POCKETS.findIndex(p => p.key === _depositPocketKey);
  return gBagPockets[idx]?.itemSlots ?? [];
}

/** Find slot index dans le pocket courant (= _depositPocketKey) pour l'item donné.
 *  Avant : cherchait seulement dans gSaveBlock1Ptr.bag.items → fail si l'item est dans
 *  un autre pocket (= berries/balls/etc.). */
function _findBagItemIdx(itemKey: string): number {
  const slots = _getBagPocketSlots();
  for (let i = 0; i < slots.length; i++) {
    if (slots[i].itemKey === itemKey && slots[i].quantity > 0) return i;
  }
  return -1;
}

/** Draw "× N" centered dans la qty window (= 1:1 décomp PrintItemQuantity).
 *  Avant : écrivait dans _descWid → écrasait le prompt "Déposer combien?". */
function _drawDepositQtyWindow(): void {
  if (_qtyWid < 0) return;
  // PIXEL_FILL(1) = cream opaque (palette 15 idx 1 std_menu.pal).
  FillWindowPixelBuffer(_qtyWid, 0x11);
  // 1:1 décomp item_menu.c:1203 PrintItemQuantity : "×NN" centered dans 0x28 (= 40 px).
  const qtyStr = `×${String(_depositQtySelected).padStart(2, '0')}`;
  const xOffset = GetStringCenterAlignXOffset(qtyStr, 0x28);
  AddTextPrinterParameterized3(
    _qtyWid, FONT_NORMAL, xOffset, 2, COLOR_CTX_NORMAL, TEXT_SKIP_DRAW, qtyStr,
  );
  PutWindowTilemap(_qtyWid);
  CopyWindowToVram(_qtyWid, 3);
}

/** Split des bytes charmap sur CHAR_NEWLINE (0xFE), jusqu'à EOS. Chaque ligne =
 *  Uint8Array EOS-terminée (consommable par le renderer). */
function _splitOwLines(bytes: Uint8Array): Uint8Array[] {
  const lines: Uint8Array[] = [];
  let start = 0, i = 0;
  const push = (end: number): void => {
    const line = new Uint8Array(end - start + 1);
    line.set(bytes.subarray(start, end));
    line[end - start] = EOS;
    lines.push(line);
  };
  for (; i < bytes.length && bytes[i] !== EOS; i++) {
    if (bytes[i] === CHAR_NEWLINE) { push(i); start = i + 1; }
  }
  push(i);
  return lines;
}

/** Affiche une description sur ≤3 lignes (espacement 16px). `text` = bytes charmap
 *  (déjà résolus par StringExpandPlaceholders) OU source FR string (encodée ici =
 *  préproc), comme la convention AddTextPrinterParameterized3/4. */
function _printDescription(text: string | Uint8Array): void {
  if (_descWid < 0) return;
  FillWindowPixelBuffer(_descWid, 0x00);
  const bytes = typeof text === 'string' ? encodeOwText(text) : text;
  const lines = _splitOwLines(bytes);
  for (let i = 0; i < Math.min(lines.length, 3); i++) {
    AddTextPrinterParameterized3(
      _descWid, FONT_NORMAL, 4, 1 + i * 16, COLOR_MAIN, TEXT_SKIP_DRAW, lines[i],
    );
  }
  PutWindowTilemap(_descWid);
  CopyWindowToVram(_descWid, 3);
}

/** 1:1 décomp `Task_ChooseHowManyToDeposit` (item_menu.c:2223-2246).
 *  D-pad ajuste qty, A confirm → TryDepositItem, B annule → return list. */
function _tickItemPCDepositQty(newKeys: number, KEY_A: number, KEY_B: number, KEY_UP: number, KEY_DOWN: number, KEY_LEFT: number, KEY_RIGHT: number): void {
  let changed = false;
  if (newKeys & KEY_UP)    { _depositQtySelected = Math.min(_depositMaxQty, _depositQtySelected + 1); changed = true; }
  if (newKeys & KEY_DOWN)  { _depositQtySelected = Math.max(1, _depositQtySelected - 1); changed = true; }
  if (newKeys & KEY_RIGHT) { _depositQtySelected = Math.min(_depositMaxQty, _depositQtySelected + 10); changed = true; }
  if (newKeys & KEY_LEFT)  { _depositQtySelected = Math.max(1, _depositQtySelected - 10); changed = true; }
  if (changed) {
    PlaySE(5);
    _drawDepositQtyWindow();
    return;
  }
  if (newKeys & KEY_A) {
    PlaySE(5);
    // 1:1 décomp item_menu.c:2235 : BagMenu_RemoveWindow(ITEMWIN_QUANTITY).
    if (_qtyWid >= 0) {
      ClearStdWindowAndFrame(_qtyWid, true);
      RemoveWindow(_qtyWid);
      _qtyWid = -1;
    }
    _tryDepositItem();
    return;
  }
  if (newKeys & KEY_B) {
    PlaySE(5);
    // 1:1 décomp item_menu.c:2238-2244 : cleanup qty window + return list.
    if (_qtyWid >= 0) {
      ClearStdWindowAndFrame(_qtyWid, true);
      RemoveWindow(_qtyWid);
      _qtyWid = -1;
    }
    _phase = 'list_input';
    _drawDesc();
    return;
  }
}

/** 1:1 décomp `TryDepositItem` (item_menu.c:2248-2274). */
async function _tryDepositItem(): Promise<void> {
  const { AddPCItem } = await import('../pokemon/pc-items');
  if (AddPCItem(_depositItemKey, _depositQtySelected)) {
    // success → remove from bag (= 1:1 RemoveBagItem qui retire du pocket courant).
    const slots = _getBagPocketSlots();
    const slot = slots[_depositBagItemIdx];
    if (slot) {
      slot.quantity -= _depositQtySelected;
      if (slot.quantity <= 0) {
        slot.quantity = 0;
        slot.itemKey = '';
      }
    }
    // 1:1 décomp UpdatePocketItemList resort le pocket (= retire empty slots
    // dans le pocket bag). Sans ça, l'item reste visible "vide" dans la list.
    UpdatePocketItemList(_depositPocketKey);
    // 1:1 décomp gText_DepositedVar2Var1s "{STR_VAR_2} {STR_VAR_1} déposé(s)."
    const itemName = getItemNameFr(_depositItemKey);
    setStringVar(1, itemName);
    setStringVar(2, String(_depositQtySelected));
    const tpl = getString('gText_DepositedVar2Var1s');
    StringExpandPlaceholders(gStringVar4, encodeOwText(tpl));
    _printDescription(gStringVar4);
    _phase = 'itempc_deposit_msg';
  } else {
    // No room in PC.
    _printDescription(getString('gText_NoRoomForItems') ?? 'Pas de place pour les objets.');
    _phase = 'itempc_deposit_msg';
  }
}

/** Wait A/B press après deposit message, refresh list + return to list input. */
function _tickItemPCDepositMsg(newKeys: number, KEY_A: number, KEY_B: number): void {
  if (newKeys & (KEY_A | KEY_B)) {
    PlaySE(5);
    // 1:1 décomp : après deposit, reset cursor au début si l'item courant
    // n'existe plus (= last item du pocket déposé entièrement). Sinon le cursor
    // peut pointer hors-bounds → crash.
    const items = _currentPocketItems();
    if (_scrollOffset + _cursorPos >= items.length) {
      const maxIdx = Math.max(0, items.length - 1);
      _scrollOffset = Math.max(0, maxIdx - (VISIBLE_ROWS - 1));
      _cursorPos = maxIdx - _scrollOffset;
    }
    // Refresh list (= item peut être removed du bag).
    _drawList();
    _drawDesc();
    _drawItemIcon();
    _phase = 'list_input';
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CB2 scene swap 1:1 décomp item_menu.c
// (GoToBagMenu → CB2_Bag → SetupBagMenu state machine → MainCB2_BagMenuRun)
// ════════════════════════════════════════════════════════════════════════════

/** Task id du Task_BagMenu_HandleInput courant (= drive TickBagScreen via
 *  RunTasks). -1 quand bag pas init / déjà closed. */
let _bagInputTaskId = -1;

/** Flag pour state 8 _loadBagMenuGraphicsCb2 async loader. */
let _bagGraphicsReady = false;
let _bagGraphicsLoading = false;
/** Flag pour state 9 _loadBagMenuTextWindowsCb2 async loader. */
let _loadBagMenuTextWindowsCb2Ready = false;
let _loadBagMenuTextWindowsCb2Loading = false;

/** Cache std_menu.pal loaded once via loadGbaPal (= asset shared with all menus
 *  that use BG palette slot 15). */
let _stdMenuPalCache: Uint16Array | null = null;
async function _ensureStdMenuPal(): Promise<Uint16Array> {
  if (_stdMenuPalCache) return _stdMenuPalCache;
  _stdMenuPalCache = await loadGbaPal('/decomp/em/interface/std_menu.pal');
  return _stdMenuPalCache;
}

/** 1:1 décomp item_menu.c:646 CB2_BagMenuRun :
 *      RunTasks(); AnimateSprites(); BuildOamBuffer();
 *      DoScheduledBgTilemapCopiesToVram(); UpdatePaletteFade();
 *  Préfix `MainCB2` → le runtime tickFixed (decomp-runtime.ts:1994) appelle
 *  automatiquement RunTasks + AnimateSprites + BuildOamBuffer + UpdatePaletteFade
 *  pour les callback2.name commençant par "MainCB2". Donc body intentionellement
 *  vide ici — la state machine est driven par les Tasks créées au state 14. */
export function MainCB2_BagMenuRun(): void { /* runtime auto-tick */ }

/** 1:1 décomp item_menu.c:655 VBlankCB_BagMenuRun :
 *      LoadOam(); ProcessSpriteCopyRequests(); TransferPlttBuffer();
 *  Notre runtime fait TransferPlttBuffer automatiquement à la fin de chaque
 *  frame (cf. decomp-runtime.ts:2047+), donc no-op. Marker pour le naming. */
export function VBlankCB_BagMenuRun(): void { /* transferts auto */ }

/** 1:1 décomp item_menu.c:1077 Task_FadeAndCloseBagMenu :
 *      BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);
 *      gTasks[taskId].func = Task_CloseBagMenu;
 *
 *  = équivalent à `FadeScreen(FADE_TO_BLACK, 0)` (= field_weather.c). */
function Task_FadeAndCloseBagMenu_BagScreen(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  FadeScreen(FADE_TO_BLACK, 0);
  task.func = Task_CloseBagMenu_BagScreen;
}

/** 1:1 décomp item_menu.c:1083 Task_CloseBagMenu :
 *      if (!gPaletteFade.active) {
 *        DestroyListMenuTask(tListTaskId, ...);
 *        SetMainCallback2(gBagPosition.exitCallback);
 *        BagDestroyPocketScrollArrowPair();
 *        ResetSpriteData(); FreeAllSpritePalettes(); FreeBagMenu();
 *        DestroyTask(taskId);
 *      } */
function Task_CloseBagMenu_BagScreen(task: DecompTask): void {
  const rt = getRuntime();
  if (!rt || rt.gPaletteFade.active) return;
  _freeBagMenu();
  // 1:1 STRICT décomp item_menu.c:1098-1099 — APRÈS BagDestroyPocketScrollArrowPair
  // (= _freeBagMenu chez nous) et AVANT FreeBagMenu. Sans ces deux appels,
  // les tags bag (TAG_BAG_SPRITE_GFX/_PAL/TAG_SCROLL_ARROW_GFX/TAG_ROTATING_
  // BALL_GFX + leur palette) restent allous dans sSpriteTileRangeTags +
  // sSpritePaletteTags après la fermeture → leak progressif (= AllocSpriteTiles
  // skip ces ranges, bitmap reste sale → écrasement visuels NPCs/field effects
  // après quelques cycles bag/OW + user-flag "sac leak toujours").
  ResetSpriteData();
  FreeAllSpritePalettes();
  // 1:1 décomp `CB2_PlayerPCExitBagMenu` (player_pc.c:571) → ItemStorage_
  // ReshowAfterBagMenu re-render PC. Notre exitCallback (= OpenBedroomPC)
  // doit fire APRÈS que `CB2_ReturnToFieldLocal_Manual` (= savedCb) ait
  // restauré l'OW (= state machine 0→3, async case 1 _restoreOverworldFromMenu).
  // Sans ça : exitCb fire avant restore → PC draw dans context vide, puis
  // restore efface tout → "écran de sélection ne revient jamais".
  //
  // Pattern 1:1 décomp : `gFieldCallback2` set ici, fire au case 2 de
  // ReturnToFieldLocal_Manual (= APRÈS restore OW, équivalent
  // `FieldCB_ReturnToFieldOpenStartMenu` du start menu flow).
  const exitCb = _bagExitCallback;
  _bagExitCallback = null;
  if (exitCb) {
    (globalThis as Record<string, unknown>).gFieldCallback2 = (): boolean => {
      try { exitCb(); } catch (e) { console.error('[bag exit cb]', e); }
      return true;  // state++ → final swap CB2 vers MainCB2_Overworld
    };
  }
  // 1:1 décomp `SetMainCallback2(gBagPosition.exitCallback)` (= notre
  // gMain.savedCallback set par sacAction = CB2_ReturnToFieldWithOpenMenu_Manual
  // OU CB2_ReturnToFieldLocal_Manual pour ITEMPC).
  const savedCb = rt.gMain.savedCallback;
  if (savedCb) {
    rt.gMain.state = 0;  // 1:1 reset state machine pour la nouvelle séquence
    rt.SetMainCallback2(savedCb);
  } else {
    console.warn('[bag-screen] Task_CloseBagMenu : no savedCallback');
    rt.SetMainCallback2(null);
  }
  rt.DestroyTask(task.taskId);
  _bagInputTaskId = -1;
}

/** Task driver appelé chaque frame par RunTasks() pendant MainCB2_BagMenuRun.
 *  Delegate à TickBagScreen (= existant) avec les newKeys courants.
 *  1:1 décomp `Task_BagMenu_HandleInput` (item_menu.c:990). */
function Task_BagMenu_HandleInput_BagScreen(_task: DecompTask): void {
  const rt = getRuntime();
  if (!rt) return;
  TickBagScreen(rt.gMain.newKeys);
}

/** 1:1 décomp item_menu.c:789 BagMenu_InitBGs :
 *      ResetVramOamAndBgCntRegs();
 *      memset(gBagMenu->tilemapBuffer, 0, sizeof(...));
 *      ResetBgsAndClearDma3BusyFlags(0);
 *      InitBgsFromTemplates(0, sBgTemplates_ItemMenu, 3);
 *      SetBgTilemapBuffer(2, gBagMenu->tilemapBuffer);
 *      ResetAllBgsCoordinates();
 *      ScheduleBgCopyTilemapToVram(2);
 *      SetGpuReg(DISPCNT, OBJ_ON | OBJ_1D_MAP);
 *      ShowBg(0/1/2); SetGpuReg(BLDCNT, 0);
 *
 *  BG templates 1:1 sBgTemplates_ItemMenu (item_menu.c:213) :
 *    BG0 char=0 map=31 prio=1 (= windows text/list/desc/header/sprite/icon)
 *    BG1 char=0 map=30 prio=0 (= context menu / yesno / qty overlays)
 *    BG2 char=3 map=29 prio=2 (= fond rayé menu.bin) */
function _initBagBgs(rt: ReturnType<typeof getRuntime>): void {
  if (!rt) return;
  // 1:1 décomp `ResetVramOamAndBgCntRegs()` (menu_helpers.c:94) — fn PARTAGÉE
  // (inclut le clear PLTT RAM hardware, cf. bug couleurs OW session 129).
  ResetVramOamAndBgCntRegs();
  // InitBgsFromTemplates(0, sBgTemplates_ItemMenu, 3).
  const bg0c = rt.gba.bg(0).config;
  bg0c.charBaseIndex = 0; bg0c.mapBaseIndex = 31; bg0c.screenSize = 0;
  bg0c.paletteMode = 0; bg0c.priority = 1; bg0c.visible = true;
  bg0c.hofs = 0; bg0c.vofs = 0;
  const bg1c = rt.gba.bg(1).config;
  bg1c.charBaseIndex = 0; bg1c.mapBaseIndex = 30; bg1c.screenSize = 0;
  bg1c.paletteMode = 0; bg1c.priority = 0; bg1c.visible = true;
  bg1c.hofs = 0; bg1c.vofs = 0;
  const bg2c = rt.gba.bg(2).config;
  bg2c.charBaseIndex = 3; bg2c.mapBaseIndex = 29; bg2c.screenSize = 0;
  bg2c.paletteMode = 0; bg2c.priority = 2; bg2c.visible = true;
  bg2c.hofs = 0; bg2c.vofs = 0;
  const bg3c = rt.gba.bg(3).config;
  bg3c.visible = false;
  // ResetAllBgsCoordinates : BG hofs/vofs registers = 0.
  rt.SetGpuReg(0x10, 0); rt.SetGpuReg(0x12, 0); // BG0HOFS/VOFS
  rt.SetGpuReg(0x14, 0); rt.SetGpuReg(0x16, 0); // BG1HOFS/VOFS
  rt.SetGpuReg(0x18, 0); rt.SetGpuReg(0x1A, 0); // BG2HOFS/VOFS
  // SetGpuReg(DISPCNT, OBJ_ON | OBJ_1D_MAP + BG0/1/2_ON).
  // OBJ_ON=0x1000, OBJ_1D_MAP=0x40, BG0=0x100, BG1=0x200, BG2=0x400.
  rt.SetGpuReg(0x00, 0x1000 | 0x40 | 0x100 | 0x200 | 0x400);
  rt.SetGpuReg(0x50 /* BLDCNT */, 0);
  ShowBg(0); ShowBg(1); ShowBg(2);
  HideBg(3);
}

/** 1:1 décomp item_menu.c:805 LoadBagMenu_Graphics — async load tiles + tilemap
 *  + palettes. Décomp = state machine 5 sub-states (DecompressTileData,
 *  LZDecompressWram, LoadCompressedPalette, LoadCompressedSpriteSheet,
 *  LoadCompressedSpritePalette + LoadListMenuSwapLineGfx). Notre version :
 *  kick off async fetch via _loadAssets, retourne false jusqu'à ready. */
function _loadBagMenuGraphicsCb2(rt: ReturnType<typeof getRuntime>): boolean {
  if (!rt) return false;
  if (_bagGraphicsReady) return true;
  if (_bagGraphicsLoading) return false;
  _bagGraphicsLoading = true;
  void _loadAssets().then(async (assets) => {
    const r = getRuntime();
    if (!r) { _bagGraphicsLoading = false; return; }
    // 1:1 décomp sub-state 0 : DecompressAndCopyTileDataToVram(2, gBagScreen_Gfx).
    // BG2 charBase=3 → VRAM byte offset 3*0x4000 = 0xC000.
    const charOff = BAG_BG_CHAR_BASE * 0x4000;
    r.gba.vram.set(assets.bgTiles, charOff);
    // 1:1 décomp sub-state 1 : LZDecompressWram(gBagScreen_GfxTileMap, tilemapBuffer).
    // BG2 mapBase=29 → VRAM byte offset 29*0x800 = 0xE800.
    const mapOff = BAG_BG_MAP_BASE * 0x800;
    const tilemapBytes = new Uint8Array(
      assets.bgTilemap.buffer, assets.bgTilemap.byteOffset, assets.bgTilemap.byteLength,
    );
    r.gba.vram.set(tilemapBytes, mapOff);
    // 1:1 décomp sub-state 2 : LoadCompressedPalette(gBagScreenMale_Pal,
    // BG_PLTT_ID(0), 2 * PLTT_SIZE_4BPP) → 32 entries à offset 0 (= sub-pal 0+1).
    LoadPalette(assets.bgPalette, 0, assets.bgPalette.length * 2);
    // 1:1 STRICT décomp sub-state 3-4 : LoadCompressedSpriteSheet + Palette
    // via tag system (honore gReservedSpriteTileCount + first-free palette).
    _bagSpriteTileStart = LoadSpriteSheet({
      data: assets.bagSpriteRaw4bpp,
      size: assets.bagSpriteRaw4bpp.length,
      tag: TAG_BAG_SPRITE_GFX,
    });
    _bagSpritePalSlot = LoadSpritePalette({ data: assets.bagSpritePal, tag: TAG_BAG_SPRITE_PAL });
    _bagAssetsLoadedToObj = true;
    // Bag sprite window palette (= slot 13 BG palette pour le sprite window).
    LoadPalette(assets.bagSprite.palette, BAG_SPRITE_PAL * 16, 32);
    _bagGraphicsReady = true;
    _bagGraphicsLoading = false;
  }).catch((e) => {
    console.error('[bag-screen] LoadBagMenu_Graphics failed:', e);
    _bagGraphicsLoading = false;
  });
  return false;
}

/** 1:1 décomp item_menu.c:2457 LoadBagMenuTextWindows :
 *      InitWindows(sDefaultBagWindows);    ← clear gWindows AND alloc new
 *      DeactivateAllTextPrinters();
 *      LoadUserWindowBorderGfx(0, 1, BG_PLTT_ID(14));
 *      LoadMessageBoxGfx(0, 10, BG_PLTT_ID(13));
 *      ListMenuLoadStdPalAt(BG_PLTT_ID(12), 1);
 *      LoadPalette(&gStandardMenuPalette, BG_PLTT_ID(15), PLTT_SIZE_4BPP);
 *      for (i = 0; i <= WIN_POCKET_NAME; i++) { FillWindowPixelBuffer(i, 0); PutWindowTilemap(i); }
 *      ScheduleBgCopyTilemapToVram(0); ScheduleBgCopyTilemapToVram(1);
 *
 *  CRITIQUE : `InitWindows` clear gWindows = wipe les windows OW (map name
 *  popup, dialog leftovers) avant d'alloc les windows bag. Sans ça, les tiles
 *  OW persistent visuellement. */
async function _loadBagMenuTextWindowsCb2(rt: ReturnType<typeof getRuntime>): Promise<void> {
  if (!rt) return;
  // 1:1 décomp : `InitWindows(sDefaultBagWindows)` reset gWindows + alloc 5
  // windows nouveaux. IDs retournés en ordre des templates.
  const ids = InitWindows([
    LIST_WINDOW_TEMPLATE,        // WIN_ITEM_LIST   (= sDefaultBagWindows[0])
    DESC_WINDOW_TEMPLATE,        // WIN_DESCRIPTION (= sDefaultBagWindows[1])
    HEADER_WINDOW_TEMPLATE,      // WIN_POCKET_NAME (= sDefaultBagWindows[2])
    ITEM_ICON_WINDOW_TEMPLATE,   // notre extra (= icon rendering via window jusqu'à port OAM)
  ]);
  _listWid = ids[0];
  _descWid = ids[1];
  _headerWid = ids[2];
  _itemIconWid = ids[3];
  // 1:1 décomp : bag sprite est OAM (= AddBagVisualSprite), PAS un window BG.
  // -1 → les anciens helpers qui checkent skipperont gracieusement.
  _spriteWid = -1;
  // 1:1 décomp : frame tiles + palette 14 à BG=0 baseTile=STD_FRAME_TILE.
  LoadUserWindowBorderGfx(0, STD_FRAME_TILE, STD_FRAME_PAL * 16);
  // 1:1 décomp : `LoadPalette(gStandardMenuPalette, BG_PLTT_ID(15), 32)` —
  // CRITIQUE : sans ce load, context menu + yesno + qty (= paletteNum=15)
  // rendent noir car palette 15 = all zeros.
  const stdMenuPal = await _ensureStdMenuPal();
  LoadPalette(stdMenuPal, 15 * 16, 32);
  // 1:1 décomp item_menu.c:2467 : `for (i = 0; i <= WIN_POCKET_NAME; i++) {
  //   FillWindowPixelBuffer(i, PIXEL_FILL(0)); PutWindowTilemap(i); }`.
  // → AUCUN DrawStdFrameWithCustomTileAndPalette pour header/list/desc !
  // Le fond rayé menu.bin (= BG2) fournit déjà le layout visuel "bag screen".
  FillWindowPixelBuffer(_listWid, 0x00); PutWindowTilemap(_listWid);
  FillWindowPixelBuffer(_descWid, 0x00); PutWindowTilemap(_descWid);
  FillWindowPixelBuffer(_headerWid, 0x00); PutWindowTilemap(_headerWid);
  FillWindowPixelBuffer(_itemIconWid, 0x00); PutWindowTilemap(_itemIconWid);
}

/** 1:1 décomp item_menu.c:1069 FreeBagMenu + Task_CloseBagMenu cleanup :
 *      Free(sListBuffer2); Free(sListBuffer1);
 *      FreeAllWindowBuffers(); Free(gBagMenu);
 *      ResetSpriteData(); FreeAllSpritePalettes();
 *      BagDestroyPocketScrollArrowPair();
 *
 *  Pas de save/restore VRAM/palette — CB2_ReturnToFieldWithOpenMenu_Manual
 *  va re-init OW from scratch via `_restoreOverworldFromMenu` (= loadAndInitMap
 *  reload tilesets + palettes + spawn NPCs). */
function _freeBagMenu(): void {
  const rt = getRuntime();
  // Destroy bag sprite OAM (= 1:1 décomp ResetSpriteData clear all OAM).
  if (_bagSpriteOamId >= 0 && rt) {
    const spr = rt.gSprites[_bagSpriteOamId];
    if (spr) spr.inUse = false;
    rt.gSprites[_bagSpriteOamId] = undefined;
    const oam = rt.gba.oam[spr?.oamIndex ?? -1];
    if (oam) oam.visible = false;
  }
  _bagSpriteOamId = -1;
  _bagSpriteOamIndex = -1;
  _bagAssetsLoadedToObj = false;
  // 1:1 décomp BagDestroyPocketScrollArrowPair + RemoveScrollIndicatorArrowPair.
  _despawnPocketArrows();
  _despawnListScrollArrows();
  _scrollArrowAssetsLoaded = false;
  _despawnRotatingBall();
  _rotatingBallAssetsLoaded = false;
  // 1:1 décomp FreeAllWindowBuffers — remove all bag windows.
  if (_spriteWid >= 0) { RemoveWindow(_spriteWid); _spriteWid = -1; }
  if (_itemIconWid >= 0) { RemoveWindow(_itemIconWid); _itemIconWid = -1; }
  if (_headerWid >= 0) {
    ClearStdWindowAndFrame(_headerWid, true); RemoveWindow(_headerWid); _headerWid = -1;
  }
  if (_listWid >= 0) {
    ClearStdWindowAndFrame(_listWid, true); RemoveWindow(_listWid); _listWid = -1;
  }
  if (_descWid >= 0) {
    ClearStdWindowAndFrame(_descWid, true); RemoveWindow(_descWid); _descWid = -1;
  }
  if (_ctxWid >= 0) {
    ClearStdWindowAndFrame(_ctxWid, true); RemoveWindow(_ctxWid); _ctxWid = -1;
  }
  if (_yesNoWid >= 0) {
    ClearStdWindowAndFrame(_yesNoWid, true); RemoveWindow(_yesNoWid); _yesNoWid = -1;
  }
  if (_qtyWid >= 0) {
    ClearStdWindowAndFrame(_qtyWid, true); RemoveWindow(_qtyWid); _qtyWid = -1;
  }
  _loadedIconKey = null;
  _isOpen = false;
  _phase = 'idle';
  _bagGraphicsReady = false;
  _bagGraphicsLoading = false;
}

/** 1:1 décomp item_menu.c:672 CB2_Bag + 678 SetupBagMenu state machine.
 *  Décomp boucle `while (!SetupBagMenu()) {}` en 1 frame jusqu'à ready.
 *  Notre version : 1 case par frame (= le runtime tick re-appelle CB2_InitBagMenu
 *  à chaque frame jusqu'à state default qui swap vers MainCB2_BagMenuRun). */
export function CB2_InitBagMenu(): void {
  const rt = getRuntime();
  if (!rt) return;
  switch (rt.gMain.state) {
    case 0:
      // SetVBlankHBlankCallbacksToNull + ClearScheduledBgCopiesToVram.
      rt.SetVBlankCallback(null);
      rt.gMain.state++;
      break;
    case 1:
      // ScanlineEffect_Stop (= no-op chez nous).
      rt.gMain.state++;
      break;
    case 2:
      // FreeAllSpritePalettes (= clear OBJ palette tracking).
      rt.gMain.state++;
      break;
    case 3:
      // ResetPaletteFade + gPaletteFade.bufferTransferDisabled = TRUE.
      ResetPaletteFade();
      rt.gPaletteFade.bufferTransferDisabled = true;
      rt.gMain.state++;
      break;
    case 4:
      // ResetSpriteData (= clear gSprites table).
      ResetSpriteData();
      rt.gMain.state++;
      break;
    case 5:
      rt.gMain.state++;
      break;
    case 6:
      // ResetTasks (= clear gTasks Map). Note : Task_BagMenu_HandleInput sera
      // créée au state 14 — DOIT run après ResetTasks pour persister.
      ResetTasks();
      rt.gMain.state++;
      break;
    case 7:
      // BagMenu_InitBGs + gBagMenu->graphicsLoadState = 0.
      _initBagBgs(rt);
      _bagGraphicsReady = false;
      _bagGraphicsLoading = false;
      _loadBagMenuTextWindowsCb2Ready = false;
      _loadBagMenuTextWindowsCb2Loading = false;
      rt.gMain.state++;
      break;
    case 8:
      // if (!LoadBagMenu_Graphics()) break;  ← reste à state 8 jusqu'à ready.
      if (!_loadBagMenuGraphicsCb2(rt)) break;
      rt.gMain.state++;
      break;
    case 9:
      // LoadBagMenuTextWindows = InitWindows + LoadUserWindowBorderGfx +
      // LoadMessageBoxGfx + ListMenuLoadStdPalAt + LoadPalette gStandardMenuPalette
      // BG_PLTT_ID(15). Async (= std_menu.pal fetch). Reste sur state 9 jusqu'à
      // ready pour que state 19 BlendPalettes blackify la palette 15 chargée
      // (= sinon palette 15 reste OW value, on voit des frames cream pendant fade).
      if (!_loadBagMenuTextWindowsCb2Ready) {
        if (!_loadBagMenuTextWindowsCb2Loading) {
          _loadBagMenuTextWindowsCb2Loading = true;
          void _loadBagMenuTextWindowsCb2(rt).then(() => {
            _loadBagMenuTextWindowsCb2Ready = true;
            _loadBagMenuTextWindowsCb2Loading = false;
          });
        }
        break;  // stay on state 9 until ready
      }
      rt.gMain.state++;
      break;
    case 10:
      // UpdatePocketItemLists + InitPocketListPositions + InitPocketScrollPositions.
      // Notre bag-system gère ces lists au runtime ; reset cursor/scroll au open.
      _pocketIdx = 0;
      _cursorPos = 0;
      _scrollOffset = 0;
      _cursorPerPocket.fill(0);
      _scrollPerPocket.fill(0);
      _phase = 'fading_in';
      _loadedIconKey = null;  // force reload palette icon au prochain draw
      rt.gMain.state++;
      break;
    case 11:
      // AllocateBagItemListBuffers (= no-op, on n'alloc pas).
      rt.gMain.state++;
      break;
    case 12:
      // LoadBagItemListBuffers (= populated via _drawList).
      rt.gMain.state++;
      break;
    case 13:
      // PrintPocketNames + CopyPocketNameToWindow + DrawPocketIndicatorSquare.
      // Notre _drawAll fait l'équivalent.
      _drawAll();
      rt.gMain.state++;
      break;
    case 14:
      // CreateBagInputHandlerTask + ListMenuInit (= cursor task).
      _bagInputTaskId = rt.CreateTask(Task_BagMenu_HandleInput_BagScreen, 0);
      rt.gMain.state++;
      break;
    case 15:
      // AddBagVisualSprite — créer le sprite sac OAM 64×64 à (68, 66).
      if (_assets) _spawnBagSpriteOam(_assets);
      rt.gMain.state++;
      break;
    case 16:
      // CreateItemMenuSwapLine (= line marker pour swap mode, no-op).
      rt.gMain.state++;
      break;
    case 17:
      // CreatePocketScrollArrowPair + CreatePocketSwitchArrowPair.
      if (_assets) {
        _spawnPocketArrows(_assets);
        _spawnListScrollArrows();
      }
      rt.gMain.state++;
      break;
    case 18:
      // PrepareTMHMMoveWindow (= no-op chez nous).
      rt.gMain.state++;
      break;
    case 19:
      // BlendPalettes(PALETTES_ALL, 16, 0) — start palette state at fully
      // blended-to-black (avant fade vers visible au case 20).
      BlendPalettes(0xFFFFFFFF, 16, 0);
      rt.gMain.state++;
      break;
    case 20:
      // 1:1 décomp `BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK)` :
      // startY=16=fully black → endY=0=visible sur 16 frames (= fade IN depuis BLACK).
      // = équivalent à `FadeScreen(FADE_FROM_BLACK, 0)` (= field_weather.c).
      FadeScreen(FADE_FROM_BLACK, 0);
      rt.gPaletteFade.bufferTransferDisabled = false;
      PlaySE(6 /* SE_WIN_OPEN */);  // sonore "shing" au fade in
      rt.gMain.state++;
      break;
    default:
      // SetVBlankCallback + SetMainCallback2(CB2_BagMenuRun).
      rt.SetVBlankCallback(VBlankCB_BagMenuRun);
      rt.SetMainCallback2(MainCB2_BagMenuRun);
      _isOpen = true;
      return;
  }
}

// Expose CB2_InitBagMenu et MainCB2_BagMenuRun sur globalThis pour permettre
// référence cross-modules en bare identifier (= 1:1 décomp scope C visibility).
{
  const _g: Record<string, unknown> = {
    CB2_InitBagMenu, MainCB2_BagMenuRun, VBlankCB_BagMenuRun,
    Task_FadeAndCloseBagMenu: Task_FadeAndCloseBagMenu_BagScreen,
    Task_CloseBagMenu: Task_CloseBagMenu_BagScreen,
  };
  for (const [k, v] of Object.entries(_g)) {
    if (typeof (globalThis as Record<string, unknown>)[k] === 'undefined') {
      (globalThis as Record<string, unknown>)[k] = v;
    }
  }
}
