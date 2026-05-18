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
 */

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

/** 1:1 décomp `ListMenu_ProcessInput(u8 listTaskId)` (list_menu.c:394-453).
 *  Décision input PURE : opère sur un `ListMenu` (l'indirection
 *  `gTasks[listTaskId].data` = étape 2 wrapper, déférée explicite
 *  list_menu.c:396). `joyNew` = JOY_NEW(), `joyRepeat` = JOY_REPEAT()
 *  (masques boutons). Retourne items[…].id / LIST_CANCEL /
 *  LIST_NOTHING_CHOSEN ; mute list.scrollOffset/selectedRow via
 *  ListMenuChangeSelection (1:1). */
export function ListMenu_ProcessInput(list: ListMenu, joyNew: number, joyRepeat: number): number {
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
