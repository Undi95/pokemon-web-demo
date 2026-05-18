/**
 * list-menu.ts — port 1:1 décomp `src/list_menu.c` (1447 l, sous-système
 * PARTAGÉ : sac, PC, shop, mystery gift, naming…).
 *
 * Source de vérité (= ne JAMAIS diverger) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/list_menu.c`
 *   - `D:/Projet 1/decomps/pokeemeraude/include/list_menu.h`
 *
 * ⚠️ INCRÉMENT 1 (BLOQUANT #1 du plan BAG-PHASE-2-PLAN-1TO1.md) =
 * **le CŒUR état déterministe**, ISOLÉ (zéro dépendance window/task/
 * sprite → zéro risque d'import cyclique, contrairement à l'étape 5).
 * Porté ici 1:1, testable headless :
 *   - data model (ListMenuItem/Template/ListMenu/…) 1:1 list_menu.h
 *   - `ListMenuUpdateSelectedRowIndexAndScrollOffset` (:694-777)
 *   - `ListMenuChangeSelection` (:819-864) — chemin ÉTAT exact ; le
 *     dispatch RENDU (switch selectionChange :841-860) appelle des hooks
 *     de rendu (Erase/Draw/Scroll/Copy) injectés à l'étape suivante
 *     (déférés EXPLICITES, list_menu.c:846-859 — pas un fake : le chemin
 *     `updateCursorAndCallCallback=FALSE` (= ListMenuTestInput) ne les
 *     touche pas, donc l'état est 1:1 strict et vérifiable maintenant).
 *   - `ListMenuCallSelectionChangedCallback` (:866-870)
 *   - `ListMenuTestInput` (:500-521) — entrée déterministe pure (= la
 *     fonction de test du décomp lui-même)
 *   - `ListMenu_ProcessInput` (:394-453) — décision input pure (opère
 *     sur un `ListMenu` ; l'indirection gTasks/CreateTask = étape
 *     suivante, déférée explicite list_menu.c:396).
 *
 * INCRÉMENT 2+ (étapes suivantes, intégration sac = visuel A/B user) :
 * ListMenuInit/Internal (CreateTask+window), ListMenuPrint/PrintEntries/
 * DrawCursor/ErasePrintedCursor/ListMenuScroll (rendu window),
 * RedrawListMenu/DestroyListMenuTask/getters/Get-SetTemplateField
 * (gTasks), curseurs sprite RED_OUTLINE/RED_ARROW (:1178-1447),
 * AddScrollIndicatorArrowPair (:1052-1177), DoMysteryGiftListMenu
 * (:300-364). Tous list_menu.c:ligne cités quand portés.
 *
 * INCRÉMENT 2 (ce fichier, sections + bas) = le RENDU window 1:1 :
 * ListMenuInit/Internal/Print/PrintEntries/DrawCursor(BLACK_ARROW)/
 * ErasePrintedCursor/ListMenuScroll/RedrawListMenu/DestroyListMenuTask/
 * getters/Get-SetTemplateField + modèle task objet→Map (= 1:1 sémantique
 * du cast `(void*)gTasks[id].data`) + auto-wire setListMenuRenderHooks.
 * Imports ajoutés (gba-window/text-system + decomp-globals) : list-menu
 * reste une FEUILLE (n'est importé par aucun module au top-level pour un
 * set*Hook) → PAS le pattern hub-fan-in TDZ de map-loader (cf.
 * feedback-map-loader-var-tdz). Curseurs sprite RED_* + scroll arrows +
 * DoMysteryGift = incrément 3 (déférés explicites, jamais des fakes).
 */
import {
  FillWindowPixelBuffer, FillWindowPixelRect,
  CopyWindowToVram, PutWindowTilemap, GetWindowAttribute, ScrollWindow,
  WINDOW_WIDTH, WINDOW_HEIGHT,
} from './gba-window-system';
import {
  AddTextPrinterParameterized4, GetFontAttribute, GetMenuCursorDimensionByFont,
  FONTATTR_MAX_LETTER_HEIGHT, TEXT_SKIP_DRAW,
} from './gba-text-system';
import { getRuntime, PlaySE, JOY_NEW, JOY_REPEAT } from './decomp-globals';

// ─── Constantes 1:1 list_menu.h:6-28 ────────────────────────────────────────

export const LIST_NOTHING_CHOSEN = -1; // list_menu.h:6
export const LIST_CANCEL = -2;          // list_menu.h:7
export const LIST_HEADER = -3;          // list_menu.h:8

/** 1:1 `enum { LIST_NO_MULTIPLE_SCROLL, … }` (list_menu.h:10-14). */
export const LIST_NO_MULTIPLE_SCROLL = 0;
export const LIST_MULTIPLE_SCROLL_DPAD = 1;
export const LIST_MULTIPLE_SCROLL_L_R = 2;

/** 1:1 `enum { CURSOR_BLACK_ARROW, … }` (list_menu.h:16-21). */
export const CURSOR_BLACK_ARROW = 0;
export const CURSOR_INVISIBLE = 1;
export const CURSOR_RED_OUTLINE = 2;
export const CURSOR_RED_ARROW = 3;

/** 1:1 `enum { SCROLL_ARROW_LEFT, … }` (list_menu.h:23-28). */
export const SCROLL_ARROW_LEFT = 0;
export const SCROLL_ARROW_RIGHT = 1;
export const SCROLL_ARROW_UP = 2;
export const SCROLL_ARROW_DOWN = 3;

/** 1:1 `enum ListMenuFields` (list_menu.h:31-50) — pour Get/SetTemplateField. */
export const LISTFIELD_MOVECURSORFUNC = 0;
export const LISTFIELD_MOVECURSORFUNC2 = 1;
export const LISTFIELD_TOTALITEMS = 2;
export const LISTFIELD_MAXSHOWED = 3;
export const LISTFIELD_WINDOWID = 4;
export const LISTFIELD_HEADERX = 5;
export const LISTFIELD_ITEMX = 6;
export const LISTFIELD_CURSORX = 7;
export const LISTFIELD_UPTEXTY = 8;
export const LISTFIELD_CURSORPAL = 9;
export const LISTFIELD_FILLVALUE = 10;
export const LISTFIELD_CURSORSHADOWPAL = 11;
export const LISTFIELD_LETTERSPACING = 12;
export const LISTFIELD_ITEMVERTICALPADDING = 13;
export const LISTFIELD_SCROLLMULTIPLE = 14;
export const LISTFIELD_FONTID = 15;
export const LISTFIELD_CURSORKIND = 16;

// ─── Types 1:1 list_menu.h:54-126 ───────────────────────────────────────────

/** 1:1 `struct ListMenuItem` (list_menu.h:54-58). */
export interface ListMenuItem {
  /** `const u8 *name` (string FR côté port). */
  name: string;
  /** `s32 id` — ou LIST_HEADER/LIST_CANCEL/… */
  id: number;
}

export interface ListMenu {
  template: ListMenuTemplate;
  scrollOffset: number;
  selectedRow: number;
  unk_1C: number;
  unk_1D: number;
  taskId: number;
  unk_1F: number;
}

/** 1:1 `struct ListMenuTemplate` (list_menu.h:60-80). Les bitfields C sont
 *  des champs number en TS (mêmes plages de valeurs). */
export interface ListMenuTemplate {
  items: ListMenuItem[];
  moveCursorFunc: ((itemIndex: number, onInit: boolean, list: ListMenu) => void) | null;
  itemPrintFunc: ((windowId: number, itemId: number, y: number) => void) | null;
  totalItems: number;
  maxShowed: number;
  windowId: number;
  header_X: number;
  item_X: number;
  cursor_X: number;
  upText_Y: number;          // :4
  cursorPal: number;         // :4
  fillValue: number;         // :4
  cursorShadowPal: number;   // :4
  lettersSpacing: number;    // :3
  itemVerticalPadding: number; // :3
  scrollMultiple: number;    // :2
  fontId: number;            // :6
  cursorKind: number;        // :2
}

/** 1:1 `struct ListMenuWindowRect` (list_menu.h:93-100). */
export interface ListMenuWindowRect {
  x: number; y: number; width: number; height: number; palNum: number;
}

/** 1:1 `struct ScrollArrowsTemplate` (list_menu.h:102-115). */
export interface ScrollArrowsTemplate {
  firstArrowType: number; firstX: number; firstY: number;
  secondArrowType: number; secondX: number; secondY: number;
  fullyUpThreshold: number; fullyDownThreshold: number;
  tileTag: number; palTag: number; palNum: number;
}

/** 1:1 `struct CursorStruct` (list_menu.h:117-126). */
export interface CursorStruct {
  left: number; top: number;
  rowWidth: number; rowHeight: number;
  tileTag: number; palTag: number; palNum: number;
}

// ─── Cœur état déterministe 1:1 ─────────────────────────────────────────────

/** 1:1 décomp `ListMenuUpdateSelectedRowIndexAndScrollOffset(list, movingDown)`
 *  (list_menu.c:694-777). Retourne 0 (= bloqué, bord de liste), 1 (= ligne
 *  bougée, pas de scroll) ou 2 (= scroll d'une position). Saute les
 *  LIST_HEADER. Logique de centrage : newRow = milieu fenêtre. */
export function ListMenuUpdateSelectedRowIndexAndScrollOffset(list: ListMenu, movingDown: boolean): number {
  let selectedRow = list.selectedRow;
  const scrollOffset = list.scrollOffset;
  let newRow: number;
  let newScroll = 0;

  if (!movingDown) {
    if (list.template.maxShowed === 1)
      newRow = 0;
    else
      newRow = list.template.maxShowed - (Math.floor(list.template.maxShowed / 2) + (list.template.maxShowed % 2)) - 1;

    if (scrollOffset === 0) {
      while (selectedRow !== 0) {
        selectedRow--;
        if (list.template.items[scrollOffset + selectedRow].id !== LIST_HEADER) {
          list.selectedRow = selectedRow;
          return 1;
        }
      }
      return 0;
    } else {
      while (selectedRow > newRow) {
        selectedRow--;
        if (list.template.items[scrollOffset + selectedRow].id !== LIST_HEADER) {
          list.selectedRow = selectedRow;
          return 1;
        }
      }
      newScroll = scrollOffset - 1;
    }
  } else {
    if (list.template.maxShowed === 1)
      newRow = 0;
    else
      newRow = (Math.floor(list.template.maxShowed / 2) + (list.template.maxShowed % 2));

    if (scrollOffset === list.template.totalItems - list.template.maxShowed) {
      while (selectedRow < list.template.maxShowed - 1) {
        selectedRow++;
        if (list.template.items[scrollOffset + selectedRow].id !== LIST_HEADER) {
          list.selectedRow = selectedRow;
          return 1;
        }
      }
      return 0;
    } else {
      while (selectedRow < newRow) {
        selectedRow++;
        if (list.template.items[scrollOffset + selectedRow].id !== LIST_HEADER) {
          list.selectedRow = selectedRow;
          return 1;
        }
      }
      newScroll = scrollOffset + 1;
    }
  }

  list.selectedRow = newRow;
  list.scrollOffset = newScroll;
  return 2;
}

/** Hooks de RENDU (déférés étape suivante = intégration sac, visuel A/B).
 *  1:1 décomp `ListMenuChangeSelection` switch (list_menu.c:841-860) :
 *  ListMenuErasePrintedCursor/ListMenuScroll/ListMenuDrawCursor/
 *  CopyWindowToVram. No-op tant que le rendu window n'est pas porté
 *  (chemin `updateCursorAndCallCallback=FALSE` (ListMenuTestInput) ne les
 *  appelle JAMAIS → état 1:1 strict + testable dès maintenant). */
export interface ListMenuRenderHooks {
  erasePrintedCursor: (list: ListMenu, oldSelectedRow: number) => void;
  drawCursor: (list: ListMenu) => void;
  scroll: (list: ListMenu, count: number, movingDown: boolean) => void;
  copyWindowToVram: (windowId: number) => void;
}
let _renderHooks: ListMenuRenderHooks | null = null;
/** Wiré à l'étape 2 (rendu window 1:1). Tant que null → no-op (déféré
 *  explicite, list_menu.c:846-859). */
export function setListMenuRenderHooks(h: ListMenuRenderHooks): void {
  _renderHooks = h;
}

/** 1:1 décomp `ListMenuCallSelectionChangedCallback(list, onInit)`
 *  (list_menu.c:866-870). */
export function ListMenuCallSelectionChangedCallback(list: ListMenu, onInit: boolean): void {
  if (list.template.moveCursorFunc != null)
    list.template.moveCursorFunc(list.template.items[list.scrollOffset + list.selectedRow].id, onInit, list);
}

/** 1:1 décomp `ListMenuChangeSelection(list, updateCursorAndCallCallback,
 *  count, movingDown)` (list_menu.c:819-864). Le chemin ÉTAT (boucle
 *  for/do-while + selectionChange/cursorCount) est 1:1 STRICT. Le dispatch
 *  RENDU (switch :841-860) appelle les hooks (déférés étape 2) ; le
 *  callback moveCursorFunc (:849/857) EST appelé (1:1, c'est un callback
 *  user, pas du rendu window). Retourne bool8 (TRUE = aucun changement). */
export function ListMenuChangeSelection(
  list: ListMenu, updateCursorAndCallCallback: boolean, count: number, movingDown: boolean,
): boolean {
  const oldSelectedRow = list.selectedRow;
  let cursorCount = 0;
  let selectionChange = 0;
  for (let i = 0; i < count; i++) {
    do {
      const ret = ListMenuUpdateSelectedRowIndexAndScrollOffset(list, movingDown);
      selectionChange |= ret;
      if (ret !== 2)
        break;
      cursorCount++;
    } while (list.template.items[list.scrollOffset + list.selectedRow].id === LIST_HEADER);
  }

  if (updateCursorAndCallCallback) {
    switch (selectionChange) {
      case 0:
      default:
        return true;
      case 1:
        _renderHooks?.erasePrintedCursor(list, oldSelectedRow);
        _renderHooks?.drawCursor(list);
        ListMenuCallSelectionChangedCallback(list, false);
        _renderHooks?.copyWindowToVram(list.template.windowId);
        break;
      case 2:
      case 3:
        _renderHooks?.erasePrintedCursor(list, oldSelectedRow);
        _renderHooks?.scroll(list, cursorCount, movingDown);
        _renderHooks?.drawCursor(list);
        ListMenuCallSelectionChangedCallback(list, false);
        _renderHooks?.copyWindowToVram(list.template.windowId);
        break;
    }
  }

  return false;
}

// ─── Bitmasks input 1:1 (gba/keys) — sous-ensemble utilisé ──────────────────
// 1:1 `include/gba/io_reg.h` / global : DPAD_UP/DOWN/LEFT/RIGHT, A/B/L/R.
export const A_BUTTON = 0x0001;
export const B_BUTTON = 0x0002;
export const L_BUTTON = 0x0200;
export const R_BUTTON = 0x0100;
export const DPAD_RIGHT = 0x0010;
export const DPAD_LEFT = 0x0020;
export const DPAD_UP = 0x0040;
export const DPAD_DOWN = 0x0080;

/** Cœur 1:1 décomp `ListMenu_ProcessInput` (list_menu.c:398-452, corps
 *  après résolution `list = (void*)gTasks[listTaskId].data`). Décision
 *  input PURE testable : `joyNew` = JOY_NEW(), `joyRepeat` = JOY_REPEAT()
 *  (masques boutons). Le wrapper public `ListMenu_ProcessInput(listTaskId)`
 *  (incrément 2, plus bas) résout la Map + lit gMain puis délègue ici
 *  (= même factorisation interne que P3/P4 core 2b). Retourne items[…].id /
 *  LIST_CANCEL / LIST_NOTHING_CHOSEN ; mute list.scrollOffset/selectedRow
 *  via ListMenuChangeSelection (1:1). */
export function _listMenuProcessInputOnObject(list: ListMenu, joyNew: number, joyRepeat: number): number {
  if (joyNew & A_BUTTON) {
    return list.template.items[list.scrollOffset + list.selectedRow].id;
  } else if (joyNew & B_BUTTON) {
    return LIST_CANCEL;
  } else if (joyRepeat & DPAD_UP) {
    ListMenuChangeSelection(list, true, 1, false);
    return LIST_NOTHING_CHOSEN;
  } else if (joyRepeat & DPAD_DOWN) {
    ListMenuChangeSelection(list, true, 1, true);
    return LIST_NOTHING_CHOSEN;
  } else { // try to move by one window scroll
    let rightButton: boolean;
    let leftButton: boolean;
    switch (list.template.scrollMultiple) {
      case LIST_NO_MULTIPLE_SCROLL:
      default:
        leftButton = false;
        rightButton = false;
        break;
      case LIST_MULTIPLE_SCROLL_DPAD:
        leftButton = (joyRepeat & DPAD_LEFT) !== 0;
        rightButton = (joyRepeat & DPAD_RIGHT) !== 0;
        break;
      case LIST_MULTIPLE_SCROLL_L_R:
        leftButton = (joyRepeat & L_BUTTON) !== 0;
        rightButton = (joyRepeat & R_BUTTON) !== 0;
        break;
    }

    if (leftButton) {
      ListMenuChangeSelection(list, true, list.template.maxShowed, false);
      return LIST_NOTHING_CHOSEN;
    } else if (rightButton) {
      ListMenuChangeSelection(list, true, list.template.maxShowed, true);
      return LIST_NOTHING_CHOSEN;
    } else {
      return LIST_NOTHING_CHOSEN;
    }
  }
}

/** 1:1 décomp `ListMenuTestInput(template, scrollOffset, selectedRow, keys,
 *  newScrollOffset, newSelectedRow)` (list_menu.c:500-521). Pur : construit
 *  un `ListMenu` local, applique 1 step (DPAD_UP/DOWN) via
 *  ListMenuChangeSelection(FALSE = pas de rendu) → état pur. Retourne
 *  LIST_NOTHING_CHOSEN. C'est LA fonction de vérif déterministe du décomp. */
export function ListMenuTestInput(
  template: ListMenuTemplate, scrollOffset: number, selectedRow: number, keys: number,
): { ret: number; newScrollOffset: number; newSelectedRow: number } {
  const list: ListMenu = {
    template: { ...template },
    scrollOffset,
    selectedRow,
    unk_1C: 0,
    unk_1D: 0,
    taskId: 0,
    unk_1F: 0,
  };

  if (keys === DPAD_UP)
    ListMenuChangeSelection(list, false, 1, false);
  if (keys === DPAD_DOWN)
    ListMenuChangeSelection(list, false, 1, true);

  return { ret: LIST_NOTHING_CHOSEN, newScrollOffset: list.scrollOffset, newSelectedRow: list.selectedRow };
}

// ════════════════════════════════════════════════════════════════════════════
// INCRÉMENT 2 — RENDU WINDOW 1:1 (list_menu.c)
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `include/window.h #define PIXEL_FILL(num) (((num)<<4)|(num))`.
 *  Nos Fill* (gba-window-system) masquent &0x0F (buffer 1 byte/pixel) donc
 *  passer 0xVV ≡ idx V (cohérent gba-window-system:474 fill idx 1 = 0x11). */
function PIXEL_FILL(n: number): number { return ((n << 4) | n); }

/** 1:1 décomp `include/constants/...` TASK_NONE = 0xFF (slot task vide). */
const TASK_NONE = 0xFF;

/** 1:1 décomp `list_menu.c:22 #define CURSOR_OBJECT_START CURSOR_RED_OUTLINE`. */
const CURSOR_OBJECT_START = CURSOR_RED_OUTLINE;

/** 1:1 décomp `include/window.h` enum : COPYWIN_GFX = 2 (notre
 *  CopyWindowToVram ignore le mode mais on passe la valeur 1:1). */
const COPYWIN_GFX = 2;

/** 1:1 décomp `include/constants/songs.h SE_SELECT` = 5. */
const SE_SELECT = 5;

/** 1:1 décomp `src/strings.c:215 const u8 gText_SelectorArrow2[] = _("▶")`
 *  (curseur CURSOR_BLACK_ARROW = texte, pas un sprite). */
export const gText_SelectorArrow2 = '▶';

/** 1:1 décomp `list_menu.c:83-91 COMMON_DATA struct gListMenuOverride`
 *  (bitfields → number). `enabled` = un seul ListMenuPrint utilisera ces
 *  couleurs override puis se remet à FALSE. */
const gListMenuOverride = {
  cursorPal: 0,
  fillValue: 0,
  cursorShadowPal: 0,
  lettersSpacing: 0,
  fontId: 0,
  enabled: false,
};

/** 1:1 décomp `list_menu.c:93 COMMON_DATA struct ListMenuTemplate
 *  gMultiuseListMenuTemplate = {0}`. Template partagé : le sac (item_menu)
 *  / shop / mystery gift y copient leur template avant ListMenuInit. */
export const gMultiuseListMenuTemplate: ListMenuTemplate = {
  items: [],
  moveCursorFunc: null,
  itemPrintFunc: null,
  totalItems: 0,
  maxShowed: 0,
  windowId: 0,
  header_X: 0,
  item_X: 0,
  cursor_X: 0,
  upText_Y: 0,
  cursorPal: 0,
  fillValue: 0,
  cursorShadowPal: 0,
  lettersSpacing: 0,
  itemVerticalPadding: 0,
  scrollMultiple: 0,
  fontId: 0,
  cursorKind: 0,
};

// ─── Modèle task objet→Map (= 1:1 sémantique du cast `(void*)gTasks[id].data`)
// Le décomp fait `struct ListMenu *list = (void*)gTasks[listTaskId].data`
// (cast brut de 32 bytes ; STATIC_ASSERT sizeof(ListMenu)<=sizeof(data)).
// NON traduisible (notre gTasks[].data = number[16]). Pattern 1:1
// sémantique : le `struct ListMenu` vit dans une Map indexée par le taskId
// (la task elle-même = ListMenuDummyTask, un slot vide list_menu.c:295).
const sListMenus = new Map<number, ListMenu>();

/** 1:1 décomp `static void ListMenuDummyTask(u8 taskId) {}` (list_menu.c:295)
 *  — task vide : ne sert qu'à réserver un slot/ID (le `data` y stockerait
 *  le struct ListMenu en décomp ; chez nous c'est sListMenus). */
function ListMenuDummyTask(_taskId: number): void { /* noop, 1:1 décomp */ }

/** Accès 1:1 au `(void*)gTasks[listTaskId].data` (= le ListMenu du slot). */
function _getListMenu(listTaskId: number): ListMenu | undefined {
  return sListMenus.get(listTaskId);
}

function _createTask(func: (taskId: number) => void, priority: number): number {
  const rt = getRuntime() as unknown as { CreateTask?: (f: unknown, p: number) => number } | null;
  if (!rt?.CreateTask) {
    // Report HONNÊTE (pas un fake) : 1:1 décomp gTasks est toujours présent
    // au runtime ; si absent = bug d'intégration → fail-fast explicite.
    throw new Error('[list-menu] runtime.CreateTask indisponible (1:1 décomp : gTasks présent au runtime)');
  }
  return rt.CreateTask(func, priority);
}

function _destroyTask(listTaskId: number): void {
  const rt = getRuntime() as unknown as { DestroyTask?: (id: number) => void } | null;
  rt?.DestroyTask?.(listTaskId);
}

/** Curseur sprite RED_OUTLINE/RED_ARROW = DÉFÉRÉ incrément 3 (sprites +
 *  subsprite tables list_menu.c:1178-1447). En CURSOR_BLACK_ARROW/INVISIBLE
 *  (2d) `list.taskId` reste TASK_NONE → ces helpers ne sont JAMAIS appelés
 *  (déféré explicite documenté, exactement comme les render hooks de
 *  l'incrément 1 — PAS un fake silencieux). */
function _listMenuAddCursorObjectDeferred(_list: ListMenu, _cursorObjId: number): number {
  throw new Error('[list-menu] curseur sprite RED_* = incrément 3 (non atteint en CURSOR_BLACK_ARROW)');
}
function _listMenuUpdateCursorObjectDeferred(_taskId: number, _x: number, _y: number, _cursorObjId: number): void {
  throw new Error('[list-menu] curseur sprite RED_* = incrément 3 (non atteint en CURSOR_BLACK_ARROW)');
}
function _listMenuRemoveCursorObjectDeferred(_taskId: number, _cursorObjId: number): void {
  throw new Error('[list-menu] curseur sprite RED_* = incrément 3 (non atteint en CURSOR_BLACK_ARROW)');
}

/** 1:1 décomp `static void ListMenuPrint(struct ListMenu *list,
 *  const u8 *str, u8 x, u8 y)` (list_menu.c:580-607). colors[3] =
 *  [fillValue, cursorPal, cursorShadowPal] (= [bg, fg, shadow] pour
 *  AddTextPrinterParameterized4, cf. menu.c:1952-1954). */
function ListMenuPrint(list: ListMenu, str: string, x: number, y: number): void {
  const colors = [0, 0, 0];
  if (gListMenuOverride.enabled) {
    colors[0] = gListMenuOverride.fillValue;
    colors[1] = gListMenuOverride.cursorPal;
    colors[2] = gListMenuOverride.cursorShadowPal;
    AddTextPrinterParameterized4(list.template.windowId,
      gListMenuOverride.fontId,
      x, y,
      gListMenuOverride.lettersSpacing,
      0, colors, TEXT_SKIP_DRAW, str);
    gListMenuOverride.enabled = false;
  } else {
    colors[0] = list.template.fillValue;
    colors[1] = list.template.cursorPal;
    colors[2] = list.template.cursorShadowPal;
    AddTextPrinterParameterized4(list.template.windowId,
      list.template.fontId,
      x, y,
      list.template.lettersSpacing,
      0, colors, TEXT_SKIP_DRAW, str);
  }
}

/** 1:1 décomp `static void ListMenuPrintEntries(struct ListMenu *list,
 *  u16 startIndex, u16 yOffset, u16 count)` (list_menu.c:609-629). */
function ListMenuPrintEntries(list: ListMenu, startIndex: number, yOffset: number, count: number): void {
  let x: number;
  let y: number;
  const yMultiplier = GetFontAttribute(list.template.fontId, FONTATTR_MAX_LETTER_HEIGHT) + list.template.itemVerticalPadding;

  for (let i = 0; i < count; i++) {
    if (list.template.items[startIndex].id !== LIST_HEADER)
      x = list.template.item_X;
    else
      x = list.template.header_X;

    y = (yOffset + i) * yMultiplier + list.template.upText_Y;
    if (list.template.itemPrintFunc != null)
      list.template.itemPrintFunc(list.template.windowId, list.template.items[startIndex].id, y);

    ListMenuPrint(list, list.template.items[startIndex].name, x, y);
    startIndex++;
  }
}

/** 1:1 décomp `static void ListMenuDrawCursor(struct ListMenu *list)`
 *  (list_menu.c:631-660). CURSOR_BLACK_ARROW (= gText_SelectorArrow2 via
 *  ListMenuPrint) + CURSOR_INVISIBLE complets 1:1 ; CURSOR_RED_OUTLINE/
 *  CURSOR_RED_ARROW = sprites → incrément 3 (déféré explicite). */
function ListMenuDrawCursor(list: ListMenu): void {
  const yMultiplier = GetFontAttribute(list.template.fontId, FONTATTR_MAX_LETTER_HEIGHT) + list.template.itemVerticalPadding;
  const x = list.template.cursor_X;
  const y = list.selectedRow * yMultiplier + list.template.upText_Y;
  switch (list.template.cursorKind) {
    case CURSOR_BLACK_ARROW:
      ListMenuPrint(list, gText_SelectorArrow2, x, y);
      break;
    case CURSOR_INVISIBLE:
      break;
    case CURSOR_RED_OUTLINE:
      if (list.taskId === TASK_NONE)
        list.taskId = _listMenuAddCursorObjectDeferred(list, CURSOR_RED_OUTLINE - CURSOR_OBJECT_START);
      _listMenuUpdateCursorObjectDeferred(list.taskId,
        GetWindowAttribute(list.template.windowId, /* WINDOW_TILEMAP_LEFT */ 1) * 8 - 1,
        GetWindowAttribute(list.template.windowId, /* WINDOW_TILEMAP_TOP */ 2) * 8 + y - 1,
        CURSOR_RED_OUTLINE - CURSOR_OBJECT_START);
      break;
    case CURSOR_RED_ARROW:
      if (list.taskId === TASK_NONE)
        list.taskId = _listMenuAddCursorObjectDeferred(list, CURSOR_RED_ARROW - CURSOR_OBJECT_START);
      _listMenuUpdateCursorObjectDeferred(list.taskId,
        GetWindowAttribute(list.template.windowId, /* WINDOW_TILEMAP_LEFT */ 1) * 8 + x,
        GetWindowAttribute(list.template.windowId, /* WINDOW_TILEMAP_TOP */ 2) * 8 + y,
        CURSOR_RED_ARROW - CURSOR_OBJECT_START);
      break;
  }
}

/** 1:1 décomp `static void ListMenuErasePrintedCursor(struct ListMenu *list,
 *  u16 selectedRow)` (list_menu.c:677-692). BLACK_ARROW seulement (les
 *  autres cursorKind n'impriment pas de texte → rien à effacer). */
function ListMenuErasePrintedCursor(list: ListMenu, selectedRow: number): void {
  const cursorKind = list.template.cursorKind;
  if (cursorKind === CURSOR_BLACK_ARROW) {
    const yMultiplier = GetFontAttribute(list.template.fontId, FONTATTR_MAX_LETTER_HEIGHT) + list.template.itemVerticalPadding;
    const width = GetMenuCursorDimensionByFont(list.template.fontId, 0);
    const height = GetMenuCursorDimensionByFont(list.template.fontId, 1);
    FillWindowPixelRect(list.template.windowId,
      PIXEL_FILL(list.template.fillValue),
      list.template.cursor_X,
      selectedRow * yMultiplier + list.template.upText_Y,
      width,
      height);
  }
}

/** 1:1 décomp `static void ListMenuScroll(struct ListMenu *list, u8 count,
 *  bool8 movingDown)` (list_menu.c:779-817). Utilise ScrollWindow (2c) +
 *  PrintEntries + FillWindowPixelRect + GetWindowAttribute. */
function ListMenuScroll(list: ListMenu, count: number, movingDown: boolean): void {
  if (count >= list.template.maxShowed) {
    FillWindowPixelBuffer(list.template.windowId, PIXEL_FILL(list.template.fillValue));
    ListMenuPrintEntries(list, list.scrollOffset, 0, list.template.maxShowed);
  } else {
    const yMultiplier = GetFontAttribute(list.template.fontId, FONTATTR_MAX_LETTER_HEIGHT) + list.template.itemVerticalPadding;

    if (!movingDown) {
      ScrollWindow(list.template.windowId, 1, count * yMultiplier, PIXEL_FILL(list.template.fillValue));
      ListMenuPrintEntries(list, list.scrollOffset, 0, count);

      const y = (list.template.maxShowed * yMultiplier) + list.template.upText_Y;
      const width = GetWindowAttribute(list.template.windowId, WINDOW_WIDTH) * 8;
      const height = (GetWindowAttribute(list.template.windowId, WINDOW_HEIGHT) * 8) - y;
      FillWindowPixelRect(list.template.windowId,
        PIXEL_FILL(list.template.fillValue),
        0, y, width, height);
    } else {
      ScrollWindow(list.template.windowId, 0, count * yMultiplier, PIXEL_FILL(list.template.fillValue));
      ListMenuPrintEntries(list, list.scrollOffset + (list.template.maxShowed - count), list.template.maxShowed - count, count);

      const width = GetWindowAttribute(list.template.windowId, WINDOW_WIDTH) * 8;
      FillWindowPixelRect(list.template.windowId,
        PIXEL_FILL(list.template.fillValue),
        0, 0, width, list.template.upText_Y);
    }
  }
}

/** 1:1 décomp `static u8 ListMenuInitInternal(struct ListMenuTemplate
 *  *listMenuTemplate, u16 scrollOffset, u16 selectedRow)`
 *  (list_menu.c:549-578). CreateTask(ListMenuDummyTask,0) → slot ;
 *  `list->template = *listMenuTemplate` = copie struct (shallow : items/
 *  funcs = mêmes refs, 1:1 du copy-by-value des pointeurs C). */
function ListMenuInitInternal(listMenuTemplate: ListMenuTemplate, scrollOffset: number, selectedRow: number): number {
  const listTaskId = _createTask(ListMenuDummyTask, 0);
  const list: ListMenu = {
    template: { ...listMenuTemplate },
    scrollOffset,
    selectedRow,
    unk_1C: 0,
    unk_1D: 0,
    taskId: TASK_NONE,
    unk_1F: 0,
  };
  sListMenus.set(listTaskId, list);

  gListMenuOverride.cursorPal = list.template.cursorPal;
  gListMenuOverride.fillValue = list.template.fillValue;
  gListMenuOverride.cursorShadowPal = list.template.cursorShadowPal;
  gListMenuOverride.lettersSpacing = list.template.lettersSpacing;
  gListMenuOverride.fontId = list.template.fontId;
  gListMenuOverride.enabled = false;

  if (list.template.totalItems < list.template.maxShowed)
    list.template.maxShowed = list.template.totalItems;

  FillWindowPixelBuffer(list.template.windowId, PIXEL_FILL(list.template.fillValue));
  ListMenuPrintEntries(list, list.scrollOffset, 0, list.template.maxShowed);
  ListMenuDrawCursor(list);
  ListMenuCallSelectionChangedCallback(list, true);

  return listTaskId;
}

/** 1:1 décomp `u8 ListMenuInit(struct ListMenuTemplate *listMenuTemplate,
 *  u16 scrollOffset, u16 selectedRow)` (list_menu.c:365-372). */
export function ListMenuInit(listMenuTemplate: ListMenuTemplate, scrollOffset: number, selectedRow: number): number {
  const taskId = ListMenuInitInternal(listMenuTemplate, scrollOffset, selectedRow);
  PutWindowTilemap(listMenuTemplate.windowId);
  CopyWindowToVram(listMenuTemplate.windowId, COPYWIN_GFX);
  return taskId;
}

/** 1:1 décomp `s32 ListMenu_ProcessInput(u8 listTaskId)`
 *  (list_menu.c:394-396). Résout `list = (void*)gTasks[listTaskId].data`
 *  (= Map) puis applique le corps 1:1 via _listMenuProcessInputOnObject.
 *  JOY_NEW/JOY_REPEAT lus inline (1:1 décomp) ; mask 0x3FF = tous boutons
 *  GBA (A|B|SEL|START|→|←|↑|↓|R|L), `(keys&0x3FF)&BTN` ≡ `keys&BTN`. */
export function ListMenu_ProcessInput(listTaskId: number): number {
  const list = _getListMenu(listTaskId);
  if (!list) return LIST_NOTHING_CHOSEN;
  return _listMenuProcessInputOnObject(list, JOY_NEW(0x3FF), JOY_REPEAT(0x3FF));
}

/** 1:1 décomp `void DestroyListMenuTask(u8 listTaskId, u16 *scrollOffset,
 *  u16 *selectedRow)` (list_menu.c:455-468). Out-params → objet retourné
 *  (= convention port, cf. ListMenuTestInput). */
export function DestroyListMenuTask(listTaskId: number): { scrollOffset: number; selectedRow: number } {
  const list = _getListMenu(listTaskId);
  if (!list) return { scrollOffset: 0, selectedRow: 0 };
  const result = { scrollOffset: list.scrollOffset, selectedRow: list.selectedRow };

  if (list.taskId !== TASK_NONE)
    _listMenuRemoveCursorObjectDeferred(list.taskId, list.template.cursorKind - CURSOR_OBJECT_START);

  _destroyTask(listTaskId);
  sListMenus.delete(listTaskId);
  return result;
}

/** 1:1 décomp `void RedrawListMenu(u8 listTaskId)` (list_menu.c:470-478). */
export function RedrawListMenu(listTaskId: number): void {
  const list = _getListMenu(listTaskId);
  if (!list) return;
  FillWindowPixelBuffer(list.template.windowId, PIXEL_FILL(list.template.fillValue));
  ListMenuPrintEntries(list, list.scrollOffset, 0, list.template.maxShowed);
  ListMenuDrawCursor(list);
  CopyWindowToVram(list.template.windowId, COPYWIN_GFX);
}

/** 1:1 décomp `void ListMenuGetCurrentItemArrayId(u8 listTaskId,
 *  u16 *arrayId)` (list_menu.c:523-529). */
export function ListMenuGetCurrentItemArrayId(listTaskId: number): number {
  const list = _getListMenu(listTaskId);
  if (!list) return 0;
  return list.scrollOffset + list.selectedRow;
}

/** 1:1 décomp `void ListMenuGetScrollAndRow(u8 listTaskId,
 *  u16 *scrollOffset, u16 *selectedRow)` (list_menu.c:531-539). */
export function ListMenuGetScrollAndRow(listTaskId: number): { scrollOffset: number; selectedRow: number } {
  const list = _getListMenu(listTaskId);
  if (!list) return { scrollOffset: 0, selectedRow: 0 };
  return { scrollOffset: list.scrollOffset, selectedRow: list.selectedRow };
}

/** 1:1 décomp `u16 ListMenuGetYCoordForPrintingArrowCursor(u8 listTaskId)`
 *  (list_menu.c:541-547). */
export function ListMenuGetYCoordForPrintingArrowCursor(listTaskId: number): number {
  const list = _getListMenu(listTaskId);
  if (!list) return 0;
  const yMultiplier = GetFontAttribute(list.template.fontId, FONTATTR_MAX_LETTER_HEIGHT) + list.template.itemVerticalPadding;
  return list.selectedRow * yMultiplier + list.template.upText_Y;
}

/** 1:1 décomp `void ListMenuDefaultCursorMoveFunc(s32 itemIndex,
 *  bool8 onInit, struct ListMenu *list)` (list_menu.c:881-885). */
export function ListMenuDefaultCursorMoveFunc(_itemIndex: number, onInit: boolean, _list: ListMenu): void {
  if (!onInit)
    PlaySE(SE_SELECT);
}

/** 1:1 décomp `void ListMenuOverrideSetColors(u8 cursorPal, u8 fillValue,
 *  u8 cursorShadowPal)` (list_menu.c:873-879). */
export function ListMenuOverrideSetColors(cursorPal: number, fillValue: number, cursorShadowPal: number): void {
  gListMenuOverride.cursorPal = cursorPal;
  gListMenuOverride.fillValue = fillValue;
  gListMenuOverride.cursorShadowPal = cursorShadowPal;
  gListMenuOverride.enabled = true;
}

/** 1:1 décomp `s32 ListMenuGetTemplateField(u8 taskId, u8 field)`
 *  (list_menu.c:888-930). MOVECURSORFUNC/2 = ptr fn (s32 en C) :
 *  non représentable en number TS → 0 + report HONNÊTE (aucun caller
 *  actuel ne lit ce field ; déféré si besoin réel, PAS un fake). */
export function ListMenuGetTemplateField(taskId: number, field: number): number {
  const data = _getListMenu(taskId);
  if (!data) return -1;
  switch (field) {
    case LISTFIELD_MOVECURSORFUNC:
    case LISTFIELD_MOVECURSORFUNC2:
      return 0; // ptr fn non représentable s32 (report honnête, déféré)
    case LISTFIELD_TOTALITEMS:
      return data.template.totalItems;
    case LISTFIELD_MAXSHOWED:
      return data.template.maxShowed;
    case LISTFIELD_WINDOWID:
      return data.template.windowId;
    case LISTFIELD_HEADERX:
      return data.template.header_X;
    case LISTFIELD_ITEMX:
      return data.template.item_X;
    case LISTFIELD_CURSORX:
      return data.template.cursor_X;
    case LISTFIELD_UPTEXTY:
      return data.template.upText_Y;
    case LISTFIELD_CURSORPAL:
      return data.template.cursorPal;
    case LISTFIELD_FILLVALUE:
      return data.template.fillValue;
    case LISTFIELD_CURSORSHADOWPAL:
      return data.template.cursorShadowPal;
    case LISTFIELD_LETTERSPACING:
      return data.template.lettersSpacing;
    case LISTFIELD_ITEMVERTICALPADDING:
      return data.template.itemVerticalPadding;
    case LISTFIELD_SCROLLMULTIPLE:
      return data.template.scrollMultiple;
    case LISTFIELD_FONTID:
      return data.template.fontId;
    case LISTFIELD_CURSORKIND:
      return data.template.cursorKind;
    default:
      return -1;
  }
}

/** 1:1 décomp `void ListMenuSetTemplateField(u8 taskId, u8 field,
 *  s32 value)` (list_menu.c:932-988). MOVECURSORFUNC/2 : le décomp
 *  `data->template.moveCursorFunc = (void*)value` — en TS on assigne si
 *  `value` est une fonction (1:1 sémantique pour un futur caller TS),
 *  sinon ignoré (report honnête ; les callers connus passent des
 *  scalaires : TOTALITEMS/MAXSHOWED/etc., 1:1 exact). */
export function ListMenuSetTemplateField(taskId: number, field: number, value: number | ((itemIndex: number, onInit: boolean, list: ListMenu) => void)): void {
  const data = _getListMenu(taskId);
  if (!data) return;
  switch (field) {
    case LISTFIELD_MOVECURSORFUNC:
    case LISTFIELD_MOVECURSORFUNC2:
      if (typeof value === 'function') data.template.moveCursorFunc = value;
      break;
    case LISTFIELD_TOTALITEMS:
      data.template.totalItems = value as number;
      break;
    case LISTFIELD_MAXSHOWED:
      data.template.maxShowed = value as number;
      break;
    case LISTFIELD_WINDOWID:
      data.template.windowId = value as number;
      break;
    case LISTFIELD_HEADERX:
      data.template.header_X = value as number;
      break;
    case LISTFIELD_ITEMX:
      data.template.item_X = value as number;
      break;
    case LISTFIELD_CURSORX:
      data.template.cursor_X = value as number;
      break;
    case LISTFIELD_UPTEXTY:
      data.template.upText_Y = value as number;
      break;
    case LISTFIELD_CURSORPAL:
      data.template.cursorPal = value as number;
      break;
    case LISTFIELD_FILLVALUE:
      data.template.fillValue = value as number;
      break;
    case LISTFIELD_CURSORSHADOWPAL:
      data.template.cursorShadowPal = value as number;
      break;
    case LISTFIELD_LETTERSPACING:
      data.template.lettersSpacing = value as number;
      break;
    case LISTFIELD_ITEMVERTICALPADDING:
      data.template.itemVerticalPadding = value as number;
      break;
    case LISTFIELD_SCROLLMULTIPLE:
      data.template.scrollMultiple = value as number;
      break;
    case LISTFIELD_FONTID:
      data.template.fontId = value as number;
      break;
    case LISTFIELD_CURSORKIND:
      data.template.cursorKind = value as number;
      break;
  }
}

// ─── Auto-wire des render hooks de l'incrément 1 (list_menu.c:846-859) ───────
// L'incrément 1 `ListMenuChangeSelection` appelle `_renderHooks?.X` (déférés
// EXPLICITES). Ici (incrément 2) on les câble aux vraies fns rendu window.
// Auto-wire INTERNE au module (pas un set*Hook appelé par un module externe
// au top-level) → PAS le pattern hub-fan-in TDZ de map-loader. Les fns sont
// des `function` declarations (hoistées) ; `_renderHooks` (let, ligne ~223)
// est déjà initialisé quand cette ligne (bas du module) s'exécute.
setListMenuRenderHooks({
  erasePrintedCursor: (list, oldSelectedRow) => ListMenuErasePrintedCursor(list, oldSelectedRow),
  drawCursor: (list) => ListMenuDrawCursor(list),
  scroll: (list, count, movingDown) => ListMenuScroll(list, count, movingDown),
  copyWindowToVram: (windowId) => CopyWindowToVram(windowId, COPYWIN_GFX),
});
