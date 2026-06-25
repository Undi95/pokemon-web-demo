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
import { BeginNormalPaletteFade } from '../../palette';
import { GetPlayerNameString, setStringVar } from '../system/string-buffers';
import type { DecompTask } from '../../../harness/runtime/decomp-runtime';
import { gBagMenu, gBagPosition, ITEMMENULOCATION_WALLY, Task_FadeAndCloseBagMenu, _CtxReturnToList, _CtxReturnToListWithRebuild, _CtxRebuildListKeepMessage, _CtxRemoveUsedItem, _CtxPrintItemSelected, _CtxShowTMHMPanel, _CtxPrintItemMessage, _CtxPrintQuantityInWindow } from './bag-menu';
import { PrintMoneyAmountInMoneyBoxWithBorder, PrintMoneyAmount, PrintMoneyAmountInMoneyBox } from '../ui/money-box-ui';
import { AddMoney, GetMoney, AddMoneyLabelObject, RemoveMoneyLabelObject } from '../../money';
import { RemoveBagItem, UpdatePocketItemList } from './bag';
import { CreateYesNoMenuWithCallbacks, AdjustQuantityAccordingToDPadInput, DisplayMessageAndContinueTask } from '../../menu_helpers';
import { GetPlayerTextSpeedDelay, ClearDialogWindowAndFrameToTransparent } from '../../menu';
import { StringExpandPlaceholders } from '../../string_util';
import { encodeOwText } from '../../../include/text';
import { gSpecialVar, FlagSet, FlagClear, FlagGet, VarSet, VarGet } from '../script/script-vars';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from '../save/save-block-state';
import { reverseDecompConstant } from '../../../harness/runtime/decomp-constants';
import { getItem as _getItem, getItemKeyById } from '../../../harness/runtime/data-tables';
import { ApplyMedicineEffect } from './bag-item-effects';
import {
  setItemUseCB, SetUpItemUseCallback,
  setItemUseOnFieldCB, SetUpItemUseOnFieldCallback,
  ItemUseCB_Medicine, ItemUseCB_PPRecovery, ItemUseCB_PPUp,
  ItemUseCB_RareCandy, ItemUseCB_ReduceEV, ItemUseCB_SacredAsh,
  ItemUseCB_EvolutionStone, ItemUseCB_TMHM,
} from '../../item_use';
import { getString } from '../ui/gba-strings';
import { GetSaveBlock1, GetSaveBlock2 } from '../../save';
import { gMapHeader } from '../../fieldmap';
import {
  GetItemEffectType,
  ITEM_EFFECT_HEAL_HP, ITEM_EFFECT_CURE_POISON, ITEM_EFFECT_CURE_SLEEP,
  ITEM_EFFECT_CURE_BURN, ITEM_EFFECT_CURE_FREEZE, ITEM_EFFECT_CURE_PARALYSIS,
  ITEM_EFFECT_CURE_ALL_STATUS, ITEM_EFFECT_HP_EV, ITEM_EFFECT_ATK_EV,
  ITEM_EFFECT_DEF_EV, ITEM_EFFECT_SPEED_EV, ITEM_EFFECT_SPATK_EV,
  ITEM_EFFECT_SPDEF_EV, ITEM_EFFECT_RAISE_LEVEL, ITEM_EFFECT_PP_UP,
  ITEM_EFFECT_PP_MAX, ITEM_EFFECT_HEAL_PP,
} from './bag-item-effects';
import {
  AddWindow, RemoveWindow, FillWindowPixelBuffer, FillWindowPixelRect,
  PutWindowTilemap, ClearWindowTilemap, CopyWindowToVram, ScheduleBgCopyTilemapToVram,
  FillBgTilemapBufferRect_Palette0, DrawStdFrameWithCustomTileAndPalette,
  type WindowTemplate,
} from '../ui/gba-window-system';
import { JOY_NEW, PALETTES_ALL, getRuntime } from '../../../harness/runtime/decomp-globals';
import {
  AddTextPrinterParameterized4, AddTextPrinterParameterized, FONT_NARROW, FONT_NORMAL, TEXT_SKIP_DRAW, gStringVar4,
} from '../ui/gba-text-system';

import { GetItemFieldFunc, GetItemType, GetItemName, GetItemSecondaryId, GetItemPrice } from '../../item';
// ⚠️ Import LAZY de player-avatar (CanFish/StartFishing) : un import statique tire tout le graphe
// fishing (text/window/wild_encounter…) dans la chaîne d'éval de bag-menu-ctx → cycle ESM + TDZ
// (BG_SCREEN_SIZE dans gba-global-scope). player-avatar est déjà chargé par l'overworld au moment où
// on utilise une canne → le dynamic import résout instantané (cache), sans cycle d'éval.
let _playerAvatarMod: typeof import('../../field_player_avatar') | null = null;
void import('../../field_player_avatar').then((m) => { _playerAvatarMod = m; });
// Lazy import bike.ts (anti-cycle/TDZ : il tire tout le graphe field via player-avatar).
let _bikeMod: typeof import('../../bike') | null = null;
void import('../../bike').then((m) => { _bikeMod = m; });
let _overworldMod: typeof import('../../overworld') | null = null;
void import('../../overworld').then((m) => { _overworldMod = m; });
// CalculatePlayerPartyCount() lit `gPlayerParty[i].species` qui peut être 0
// si la party n'est pas synchronisée depuis gameState (= bug observé). On
// utilise directement gSaveBlock1Ptr.playerParty.length qui est la source de vérité.
import { PIXEL_FILL } from '../../../harness/runtime/decomp-globals';
import { ENUM_ITEMWIN_1 } from '../../../include/item_menu';
import {
  A_BUTTON, B_BUTTON, DPAD_UP, DPAD_DOWN, DPAD_LEFT, DPAD_RIGHT,
} from '../../../include/gba/io_reg';
import { SE_SELECT, SE_SHOP } from '../../../include/constants/songs';
import { PlaySE } from '../../../harness/runtime/decomp-globals';

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
// task.data 1:1 décomp item_menu.c:662-666 (tQuantity=data[2], tItemCount=data[8]).
const T_QUANTITY = 2, T_ITEM_COUNT = 8;
// taskId courant du flow toss : les yes/no funcs (zéro-arg, comme shop) le réutilisent.
let _tossTaskId = -1;
const WINDOW_NONE = 0xFF;

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
import {
  ITEMS_POCKET, BALLS_POCKET, TMHM_POCKET, BERRIES_POCKET, KEYITEMS_POCKET,
} from '../../../include/constants/item';
// 1:1 décomp include/constants/items.h : digits du compteur d'objets (99 max = 2,
// baies 999 = 3). Canonique partagé — PAS un const local (l'ancien `= 3` était faux).
import { BAG_ITEM_CAPACITY_DIGITS, BERRY_CAPACITY_DIGITS } from '../../../include/constants/items';

// 1:1 décomp item_menu.h — ITEMMENULOCATION_* (pas extrait decomp-data, hardcode 1:1 justifié).
const ITEMMENULOCATION_FIELD = 0;
const ITEMMENULOCATION_BATTLE = 1;
const RGB_BLACK = 0;

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
        case KEYITEMS_POCKET: items = sContextMenuItems_KeyItemsPocket; break;
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

// ─── Action handlers — STUBS (à implémenter type-d'item-par-type-d'item) ──────

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
 *  Notre TS dispatch via le NOM du handler (string depuis items.json). Les
 *  handlers concrets seront portés type-par-type (Medicine, TMHM, Bike, etc.).
 *  Pour l'instant : `CannotUse` 1:1 (= dialog "Pas le moment"), les autres
 *  affichent un message générique "[handler] à porter" → retour liste sur A/B. */
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
    _showItemMessage(task, "Pas de POKéMON\ndans votre équipe !");
    return;
  }
  // 1:1 :1804-1806 — fill desc + dispatch.
  // Dispatcher : pour l'instant, message FR par handler (vrai handler à porter).
  const itemName = GetItemName(itemId);
  let msg: string;
  switch (fieldUseFunc) {
    case 'ItemUseOutOfBattle_CannotUse':
      // 1:1 décomp item_use.c — gText_DadsAdvice (strings.json FR officielle).
      msg = `Conseil de PAPA…\n${GetPlayerNameString() || 'JOUEUR'}, chaque chose en son temps!`;
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
        _showItemMessage(task, "Pas de POKéMON\ndans votre équipe !");
        return;
      }
      setItemUseCB(ItemUseCB_Medicine);
      SetUpItemUseCallback(task);
      return;
    }
    case 'ItemUseOutOfBattle_TMHM': {
      // 1:1 décomp item_use.c:807-825 ItemUseOutOfBattle_TMHM :
      //     RemoveUsingBlankMessageBox;
      //     DisplayItemMessage(taskId, FONT_NORMAL, gText_BootedUpTM_HM,
      //                        BootUpSound_TMHM);
      // → message "CT activée."/"CS activée." + YesNoBox "Apprendre {move}
      // à un POKéMON ?" + UseTMHM = setItemUseCB(ItemUseCB_TMHM) +
      // SetUpItemUseCallback. Notre 1ère itération : skip le YES/NO box
      // (= polish), enchaîne direct setItemUseCB + SetUpItemUseCallback.
      // L'utilisateur verra le party-screen "Apprendre à quel POKéMON ?".
      if (gSaveBlock1Ptr.playerParty.length === 0) {
        _showItemMessage(task, "Pas de POKéMON\ndans votre équipe !");
        return;
      }
      setItemUseCB(ItemUseCB_TMHM);
      SetUpItemUseCallback(task);
      return;
    }
    case 'ItemUseOutOfBattle_PPRecovery': {
      // 1:1 décomp item_use.c:770-775 ItemUseOutOfBattle_PPRecovery :
      //     gItemUseCB = ItemUseCB_PPRecovery;
      //     SetUpItemUseCallback(taskId);
      if (gSaveBlock1Ptr.playerParty.length === 0) {
        _showItemMessage(task, "Pas de POKéMON\ndans votre équipe !");
        return;
      }
      setItemUseCB(ItemUseCB_PPRecovery);
      SetUpItemUseCallback(task);
      return;
    }
    case 'ItemUseOutOfBattle_PPUp': {
      // 1:1 décomp item_use.c:776-781 ItemUseOutOfBattle_PPUp.
      if (gSaveBlock1Ptr.playerParty.length === 0) {
        _showItemMessage(task, "Pas de POKéMON\ndans votre équipe !");
        return;
      }
      setItemUseCB(ItemUseCB_PPUp);
      SetUpItemUseCallback(task);
      return;
    }
    case 'ItemUseOutOfBattle_RareCandy': {
      // 1:1 décomp item_use.c:782-787 ItemUseOutOfBattle_RareCandy.
      if (gSaveBlock1Ptr.playerParty.length === 0) {
        _showItemMessage(task, "Pas de POKéMON\ndans votre équipe !");
        return;
      }
      setItemUseCB(ItemUseCB_RareCandy);
      SetUpItemUseCallback(task);
      return;
    }
    case 'ItemUseOutOfBattle_ReduceEV': {
      // 1:1 décomp item_use.c:758-763 ItemUseOutOfBattle_ReduceEV (= baies).
      if (gSaveBlock1Ptr.playerParty.length === 0) {
        _showItemMessage(task, "Pas de POKéMON\ndans votre équipe !");
        return;
      }
      setItemUseCB(ItemUseCB_ReduceEV);
      SetUpItemUseCallback(task);
      return;
    }
    case 'ItemUseOutOfBattle_SacredAsh': {
      // 1:1 décomp item_use.c:764-769 ItemUseOutOfBattle_SacredAsh.
      if (gSaveBlock1Ptr.playerParty.length === 0) {
        _showItemMessage(task, "Pas de POKéMON\ndans votre équipe !");
        return;
      }
      setItemUseCB(ItemUseCB_SacredAsh);
      SetUpItemUseCallback(task);
      return;
    }
    case 'ItemUseOutOfBattle_EvolutionStone': {
      // 1:1 décomp item_use.c:942-948 ItemUseOutOfBattle_EvolutionStone.
      if (gSaveBlock1Ptr.playerParty.length === 0) {
        _showItemMessage(task, "Pas de POKéMON\ndans votre équipe !");
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
            .then(() => { bk.GetOnOffBike(flag); });
        });
        SetUpItemUseOnFieldCallback(task);
        return;
      }
      msg = `Conseil de PAPA…\n${GetPlayerNameString() || 'JOUEUR'}, chaque chose en son temps!`;
      break;
    }
    case 'ItemUseOutOfBattle_EscapeRope':
      // Escape Rope : warp out (SetEscapeWarp + DoEscapeRopeFieldEffect) non porté → DadsAdvice 1:1.
      msg = `Conseil de PAPA…\n${GetPlayerNameString() || 'JOUEUR'}, chaque chose en son temps!`;
      break;
    case 'ItemUseOutOfBattle_Repel': {
      // 1:1 décomp item_use.c:841-873 ItemUseOutOfBattle_Repel + Task_UseRepel.
      const repelActive = VarGet('VAR_REPEL_STEP_COUNT');
      if (repelActive > 0) {
        // 1:1 :845 — un autre repel est encore actif.
        _showItemMessage(task, "Mais le REPOUSSE précédent\nest toujours actif.");
      } else {
        // 1:1 :867-868 — set step count = holdEffectParam de l'item + RemoveUsedItem.
        const itemKey = _itemKeyFromBag(itemId);
        const item = itemKey ? _getItem(itemKey) : undefined;
        const steps = item?.holdEffectParam ?? 100;
        VarSet('VAR_REPEL_STEP_COUNT', steps);
        _CtxRemoveUsedItem(itemId);
        // 1:1 :870 gText_PlayerUsedVar2 (= player utilise X) + suffix repelled.
        const player = GetPlayerNameString() || 'JOUEUR';
        _showItemMessageThenRebuild(task,
          `${player} utilise\n${itemName}.\nÇa va repousser les\nPOKéMON sauvages.`);
      }
      return;
    }
    case 'ItemUseOutOfBattle_BlackWhiteFlute': {
      // 1:1 décomp item_use.c:888-902 — set encounter flag selon White/Black.
      // ITEM_WHITE_FLUTE = 43, ITEM_BLACK_FLUTE = 42.
      const player = GetPlayerNameString() || 'JOUEUR';
      if (itemId === 43 /* ITEM_WHITE_FLUTE */) {
        FlagSet('FLAG_SYS_ENC_UP_ITEM');
        FlagClear('FLAG_SYS_ENC_DOWN_ITEM');
        msg = `${player} utilise\n${itemName}.\nÇa va attirer les\nPOKéMON sauvages.`;
      } else {
        FlagSet('FLAG_SYS_ENC_DOWN_ITEM');
        FlagClear('FLAG_SYS_ENC_UP_ITEM');
        msg = `${player} utilise\n${itemName}.\nÇa va repousser les\nPOKéMON sauvages.`;
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
        _showItemMessage(task, "Pas de POKéMON\ndans votre équipe !");
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
          msg = `Conseil de PAPA…\n${GetPlayerNameString() || 'JOUEUR'}, chaque chose en son temps!`;
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
        // 1:1 décomp : si trouvé, lance Task_UseItemfinder (spin anim). Polish.
        // En attendant, message "L'objet semble proche !" honnête.
        msg = "Le CHERCH'OBJET réagit !\nUn objet est près d'ici.";
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
      msg = `Conseil de PAPA…\n${GetPlayerNameString() || 'JOUEUR'}, chaque chose en son temps!`;
      break;
    }
    case 'ItemUseOutOfBattle_Mail':
    case 'ItemUseOutOfBattle_PokeblockCase':
    case 'ItemUseOutOfBattle_Berry':
    case 'ItemUseOutOfBattle_WailmerPail':
      // 1:1 décomp : ces handlers ouvrent un screen dédié (mail/pokeblock) ou un sous-système overworld
      // (wailmer berry / plant berry) pas encore portés → DadsAdvice 1:1 (condition prerequisite jamais
      // remplie). À étendre quand mail/pokeblock/berry-water seront portés (chantiers indépendants).
      msg = `Conseil de PAPA…\n${GetPlayerNameString() || 'JOUEUR'}, chaque chose en son temps!`;
      break;
    default:
      // Handler inconnu → DadsAdvice 1:1 FR pour ne pas exposer le nom interne.
      msg = `Conseil de PAPA…\n${GetPlayerNameString() || 'JOUEUR'}, chaque chose en son temps!`;
  }
  _showItemMessage(task, msg);
}

/** Helper temporaire : affiche `msg` dans WIN_DESCRIPTION puis bascule la
 *  task en wait-for-A. Sur press A/B → return list (sans rebuild). */
function _showItemMessage(task: DecompTask, msg: string): void {
  _CtxPrintItemMessage(msg);
  task.func = Task_ItemUseMessageWaitForA;
}

/** Variant qui rebuild la liste après press A (= post-use d'item consommé :
 *  Repel/Medicine/etc. → quantité décrémentée, faut recharger la liste). */
function _showItemMessageThenRebuild(task: DecompTask, msg: string): void {
  _CtxPrintItemMessage(msg);
  task.func = Task_ItemUseMessageWaitForAThenRebuild;
}

/** Task wait-for-A : tout press A/B → return list. */
function Task_ItemUseMessageWaitForA(task: DecompTask): void {
  if (JOY_NEW(A_BUTTON) || JOY_NEW(B_BUTTON)) {
    PlaySE(SE_SELECT);
    _CtxReturnToList(task.taskId);
  }
}

/** Variant Task qui rebuild la liste après press. */
function Task_ItemUseMessageWaitForAThenRebuild(task: DecompTask): void {
  if (JOY_NEW(A_BUTTON) || JOY_NEW(B_BUTTON)) {
    PlaySE(SE_SELECT);
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

/** Helper : message toss = template FR avec {STR_VAR_1}=nom item, {STR_VAR_2}=count. */
function _tossMsg(key: string, fallback: string, itemId: number, count: number): string {
  const name = GetItemName(itemId);
  return (getString(key) ?? fallback)
    .replace('{STR_VAR_1}', name)
    .replace('{STR_VAR_2}', String(count))
    .replace('{PAUSE_UNTIL_PRESS}', '')
    .replace(/\\n/g, '\n').replace(/\\p/g, '\n');
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
    _CtxPrintItemMessage(_tossMsg('gText_TossHowManyVar1s', 'Combien de {STR_VAR_1}\nà jeter?', gSpecialVar.ItemId, 0));
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
  _CtxPrintItemMessage(_tossMsg('gText_ConfirmTossItems', '{STR_VAR_1}:\nen jeter {STR_VAR_2}?', gSpecialVar.ItemId, task.data[T_ITEM_COUNT]));
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
  _CtxPrintItemMessage(_tossMsg('gText_ThrewAwayVar2Var1s', '{STR_VAR_1}:\njeté {STR_VAR_2}.', gSpecialVar.ItemId, task.data[T_ITEM_COUNT]));
  task.func = Task_RemoveItemFromBag;
}

/** Mapping pocketId (gBagPosition.pocket) → clé pocket de UpdatePocketItemList. */
function _pocketKeyForId(pocketId: number): 'items' | 'pokeBalls' | 'tmHm' | 'berries' | 'keyItems' {
  return (['items', 'pokeBalls', 'tmHm', 'berries', 'keyItems'] as const)[pocketId] ?? 'items';
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
    UpdatePocketItemList(_pocketKeyForId(gBagPosition.pocket));
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
function DisplayItemMessage(taskId: number, fontId: number, str: string | Uint8Array, callback: (task: DecompTask) => void): void {
  const wid = AddItemMessageWindow(ITEMWIN_MESSAGE);
  FillWindowPixelBuffer(wid, PIXEL_FILL(1));
  DisplayMessageAndContinueTask(taskId, wid, 10, 13, fontId, GetPlayerTextSpeedDelay(), str, callback);
  ScheduleBgCopyTilemapToVram(1);
}

/** 1:1 décomp `CloseItemMessage(taskId)` (item_menu.c:1175) : retire la fenêtre
 *  message + reconstruit la liste + retour navigation. */
function CloseItemMessage(task: DecompTask): void {
  RemoveItemMessageWindow(ITEMWIN_MESSAGE);
  _CtxReturnToListWithRebuild(task.taskId);
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
  RemoveContextWindow();
  const itemId = gSpecialVar.ItemId;
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
  _returnToList(task);
}

/** 1:1 décomp `ItemMenu_Give(u8 taskId)` (item_menu.c:1933) — dette R3 doc :
 *  cascade CB2_ChooseMonToGiveItem (= party screen state machines U-tier U2). */
function ItemMenu_Give(task: DecompTask): void {
  RemoveContextWindow();
  _returnToList(task);
}

/** 1:1 décomp ItemMenu_Cancel (item_menu.c) — retour liste sans action. */
function ItemMenu_Cancel(task: DecompTask): void {
  RemoveContextWindow();
  _returnToList(task);
}

/** 1:1 décomp `ItemMenu_UseInBattle(u8 taskId)` (item_menu.c:1997) :
 *  `if (GetItemBattleFunc(item)) { RemoveContextWindow(); GetItemBattleFunc(item)(taskId); }`.
 *  Notre combat tourne INLINE (≠ controller CB2), donc le sac n'a pas à dispatcher
 *  l'effet : il ferme simplement (Task_FadeAndCloseBagMenu → exitCallback), et le
 *  combat lit `gSpecialVar.ItemId` (déjà posé à la sélection A de l'item, bag-menu.ts:1964)
 *  pour appliquer l'effet (capture / soin / X-item) côté battle-flow. */
function ItemMenu_UseInBattle(task: DecompTask): void {
  RemoveContextWindow();
  Task_FadeAndCloseBagMenu(task);
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

/** 1:1 décomp `ItemMenu_GiveFavorLady(u8 taskId)` (item_menu.c, ACTION_GIVE_FAVOR_LADY)
 *  — dette R3 doc : cascade Favor Lady give flow (= lilycove_lady gift item +
 *  script special U-tier). */
function ItemMenu_GiveFavorLady(task: DecompTask): void {
  RemoveContextWindow();
  _returnToList(task);
}

/** 1:1 décomp `ItemMenu_ConfirmQuizLady(u8 taskId)` (item_menu.c, ACTION_CONFIRM_QUIZ_LADY)
 *  — dette R3 doc : cascade Quiz Lady confirm flow (= lilycove_lady quiz prize
 *  setup U-tier). */
function ItemMenu_ConfirmQuizLady(task: DecompTask): void {
  RemoveContextWindow();
  _returnToList(task);
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
