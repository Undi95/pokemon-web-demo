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
import type { DecompTask } from './decomp-runtime';
import { gBagMenu, gBagPosition, ITEMMENULOCATION_WALLY, _CtxReturnToList } from './bag-menu';
import {
  AddWindow, RemoveWindow, FillWindowPixelBuffer, FillWindowPixelRect,
  PutWindowTilemap, ClearWindowTilemap, CopyWindowToVram, ScheduleBgCopyTilemapToVram,
  FillBgTilemapBufferRect_Palette0, DrawStdFrameWithCustomTileAndPalette,
  type WindowTemplate,
} from './gba-window-system';
import { JOY_NEW, PALETTES_ALL, getRuntime } from './decomp-globals';
import {
  AddTextPrinterParameterized4, FONT_NARROW, FONT_NORMAL, TEXT_SKIP_DRAW,
  setStringVar4,
} from './gba-text-system';
import { GetItemName, StringExpandPlaceholders, BeginNormalPaletteFade } from './decomp-bridge';
import { PIXEL_FILL } from './decomp-globals';
import { ENUM_ITEMWIN_1 } from './decomp-data/auto/include/item_menu-data';
import {
  A_BUTTON, B_BUTTON, DPAD_UP, DPAD_DOWN, DPAD_LEFT, DPAD_RIGHT,
} from './decomp-data/auto/include/gba/io_reg-data';
import { SE_SELECT } from './decomp-data/auto/include/constants/songs-data';
import { PlaySE } from './decomp-globals';

// ─── Constantes 1:1 décomp (item_menu.h + item_menu.c) ───────────────────────

// 1:1 décomp item_menu.h:25-37 — ITEMWIN_*.
const ITEMWIN_1x1: number = ENUM_ITEMWIN_1.ITEMWIN_1x1;       // 0
const ITEMWIN_1x2: number = ENUM_ITEMWIN_1.ITEMWIN_1x2;       // 1
const ITEMWIN_2x2: number = ENUM_ITEMWIN_1.ITEMWIN_2x2;       // 2
const ITEMWIN_2x3: number = ENUM_ITEMWIN_1.ITEMWIN_2x3;       // 3
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

// 1:1 décomp constants/items.h — pockets.
const ITEMS_POCKET = 0;
const BALLS_POCKET = 1;
const TMHM_POCKET = 2;
const BERRIES_POCKET = 3;
const KEYITEMS_POCKET = 4;

// 1:1 décomp item_menu.h — ITEMMENULOCATION_*.
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
  // 1:1 :1662-1666 — affiche "X est sélectionné." dans WIN_DESCRIPTION
  // (TM_HM pocket utilise PrintTMHMMoveData à la place — déféré, on tombe sur
  // le path générique).
  const itemId = _getSelectedItemId();
  const itemName = GetItemName(itemId);
  setStringVar4('');
  const gsv = globalThis as unknown as Record<string, string>;
  gsv['gStringVar1'] = itemName;
  const msg = StringExpandPlaceholders('', 'gText_Var1IsSelected'); // fallback : strings.json key
  void msg; // pour l'instant, message description différé (intégration avec WIN_DESCRIPTION = follow-up)
  // 1:1 :1668-1675 — choisit le window type et imprime.
  _ctxWindowType = _windowTypeFor(_ctxNumItems);
  _ctxGrid2D = _ctxNumItems >= 4;
  _ctxWindowId = BagMenu_AddWindow(_ctxWindowType);
  _printCtxItems();
}

/** Helper : itemId courant (= cursor liste sac). */
function _getSelectedItemId(): number {
  // Importer dynamiquement BagGetItemIdByPocketPosition pour éviter cycle.
  // Stub minimal pour le SetUp : 0 (Cancel safe).
  // (Réel : `BagGetItemIdByPocketPosition(gBagPosition.pocket + 1, listPosition)`
  // ; on fera ce câblage à la 1ère intégration use-handler.)
  return 0;
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

/** STUB ItemMenu_UseOutOfBattle (item_menu.c:1796). Retour Task_BagMenu_HandleInput
 *  (= le cursor liste reste actif). Sera porté par type d'item (Potion = heal
 *  party ; CT/CS = teach move ; Bike = ItemUseOutOfBattle_Bike ; etc.). */
function ItemMenu_UseOutOfBattle(task: DecompTask): void {
  RemoveContextWindow();
  _returnToList(task);
}

/** STUB ItemMenu_Toss (item_menu.c) — ouvrira AskTossItems → quantity → confirm
 *  → RemoveBagItem. Stub : cancel. */
function ItemMenu_Toss(task: DecompTask): void {
  RemoveContextWindow();
  _returnToList(task);
}

/** STUB ItemMenu_Register — toggle gSaveBlock1.registeredItem. */
function ItemMenu_Register(task: DecompTask): void {
  RemoveContextWindow();
  _returnToList(task);
}

/** STUB ItemMenu_Give — fade vers PartyScreen pour assigner item à un mon. */
function ItemMenu_Give(task: DecompTask): void {
  RemoveContextWindow();
  _returnToList(task);
}

/** 1:1 décomp ItemMenu_Cancel (item_menu.c) — retour liste sans action. */
function ItemMenu_Cancel(task: DecompTask): void {
  RemoveContextWindow();
  _returnToList(task);
}

/** STUB ItemMenu_UseInBattle — utilise l'item sur le mon actif en battle. */
function ItemMenu_UseInBattle(task: DecompTask): void {
  RemoveContextWindow();
  _returnToList(task);
}

/** STUB ItemMenu_CheckTag — ouvre Berry Tag screen. */
function ItemMenu_CheckTag(task: DecompTask): void {
  RemoveContextWindow();
  _returnToList(task);
}

/** STUB ItemMenu_Show — Apprentice "présenter" item. */
function ItemMenu_Show(task: DecompTask): void {
  RemoveContextWindow();
  _returnToList(task);
}

/** STUB ItemMenu_GiveFavorLady — donner item à Favor Lady. */
function ItemMenu_GiveFavorLady(task: DecompTask): void {
  RemoveContextWindow();
  _returnToList(task);
}

/** STUB ItemMenu_ConfirmQuizLady — confirmer item pour Quiz Lady. */
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
