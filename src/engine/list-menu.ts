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
import {
  getRuntime, PlaySE, JOY_NEW, JOY_REPEAT,
  LoadCompressedSpriteSheet, LoadPalette, LoadSpritePalette, SetSubspriteTables,
} from './decomp-globals';
import { gSineTable } from './decomp-helpers';

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

// Curseurs sprite RED_OUTLINE/RED_ARROW (list_menu.c:662 + :1178-1447) :
// portés 1:1 dans la SECTION INCRÉMENT 3b (bas du module). `ListMenuAdd/
// Update/RemoveCursorObject` = `function` declarations hoistées → utilisables
// ici (ListMenuDrawCursor/DestroyListMenuTask) bien que définies plus bas
// (même pattern que setListMenuRenderHooks au bas du module).

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
        list.taskId = ListMenuAddCursorObject(list, CURSOR_RED_OUTLINE - CURSOR_OBJECT_START);
      ListMenuUpdateCursorObject(list.taskId,
        GetWindowAttribute(list.template.windowId, /* WINDOW_TILEMAP_LEFT */ 1) * 8 - 1,
        GetWindowAttribute(list.template.windowId, /* WINDOW_TILEMAP_TOP */ 2) * 8 + y - 1,
        CURSOR_RED_OUTLINE - CURSOR_OBJECT_START);
      break;
    case CURSOR_RED_ARROW:
      if (list.taskId === TASK_NONE)
        list.taskId = ListMenuAddCursorObject(list, CURSOR_RED_ARROW - CURSOR_OBJECT_START);
      ListMenuUpdateCursorObject(list.taskId,
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
    ListMenuRemoveCursorObject(list.taskId, list.template.cursorKind - CURSOR_OBJECT_START);

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

// ════════════════════════════════════════════════════════════════════════════
// INCRÉMENT 3a — subsprite tables RED_OUTLINE (PUR déterministe)
// ════════════════════════════════════════════════════════════════════════════
// Les curseurs sprite RED_OUTLINE/RED_ARROW (list_menu.c:1178-1447) servent
// PC storage / shop / mystery gift (PAS le sac = CURSOR_BLACK_ARROW, fait en
// 2d). Partie PURE déterministe ici (subsprite OAM table + count) ; la partie
// sprite/asset/rendu (Add/Update/Remove*CursorObject, scroll arrows,
// DoMysteryGiftListMenu) = incrément 3b+ (visuel A/B user, branché à PC/shop).
// Les 3 stubs `_listMenu*CursorObjectDeferred` (2d) restent (jamais atteints
// en BLACK_ARROW). user-vision : TOUT en 1:1, pas de MVP → on porte la
// fondation déterministe maintenant.

/** 1:1 décomp `struct Subsprite` (include/sprite.h:159-167). `x`/`y` = s8
 *  (le décomp y stocke des valeurs hors [-128,127] → wrap s8 VOULU,
 *  positions OAM relatives au centre). shape/size/tileOffset/priority =
 *  bitfields u16 (2/2/10/2). */
export interface Subsprite {
  x: number;          // s8 (wrap via _toS8 à l'assignation, 1:1 décomp)
  y: number;          // s8
  shape: number;      // :2
  size: number;       // :2
  tileOffset: number; // :10
  priority: number;   // :2
}

/** 1:1 décomp `struct SubspriteTable` (include/sprite.h:169-173). */
export interface SubspriteTable {
  subspriteCount: number;
  subsprites: Subsprite[];
}

/** Truncation s8 (= comportement `s8 field = value;` du décomp). JS bitwise
 *  = 32-bit signé : `(v << 24) >> 24` sign-extend le byte bas → s8 exact.
 *  Ex : 136 → -120 ; rowWidth(120)+128=248 → -8 ; -120 → -120. */
function _toS8(v: number): number {
  return (v << 24) >> 24;
}

// 1:1 décomp `sSubsprite_RedOutline1..8` (list_menu.c:170-248). Tous
// SPRITE_SHAPE(8x8)=0 (ST_OAM_SQUARE) + SPRITE_SIZE(8x8)=0 (GBA OAM
// standard square 8x8) ; tileOffset = 0..7 ; priority 0 ; x/y 0 (set au
// runtime par SetUpOamTable). Const figées (copiées par valeur à l'usage).
const sSubsprite_RedOutline1: Readonly<Subsprite> = { x: 0, y: 0, shape: 0, size: 0, tileOffset: 0, priority: 0 };
const sSubsprite_RedOutline2: Readonly<Subsprite> = { x: 0, y: 0, shape: 0, size: 0, tileOffset: 1, priority: 0 };
const sSubsprite_RedOutline3: Readonly<Subsprite> = { x: 0, y: 0, shape: 0, size: 0, tileOffset: 2, priority: 0 };
const sSubsprite_RedOutline4: Readonly<Subsprite> = { x: 0, y: 0, shape: 0, size: 0, tileOffset: 3, priority: 0 };
const sSubsprite_RedOutline5: Readonly<Subsprite> = { x: 0, y: 0, shape: 0, size: 0, tileOffset: 4, priority: 0 };
const sSubsprite_RedOutline6: Readonly<Subsprite> = { x: 0, y: 0, shape: 0, size: 0, tileOffset: 5, priority: 0 };
const sSubsprite_RedOutline7: Readonly<Subsprite> = { x: 0, y: 0, shape: 0, size: 0, tileOffset: 6, priority: 0 };
const sSubsprite_RedOutline8: Readonly<Subsprite> = { x: 0, y: 0, shape: 0, size: 0, tileOffset: 7, priority: 0 };

/** 1:1 décomp `u8 ListMenuGetRedOutlineCursorSpriteCount(u16 rowWidth,
 *  u16 rowHeight)` (list_menu.c:1221-1238). Pure : 4 coins + 2 par tranche
 *  de 8 px au-delà de 16 (largeur ET hauteur). */
export function ListMenuGetRedOutlineCursorSpriteCount(rowWidth: number, rowHeight: number): number {
  let count = 4;
  if (rowWidth > 16) {
    for (let i = 8; i < (rowWidth - 8); i += 8)
      count += 2;
  }
  if (rowHeight > 16) {
    for (let i = 8; i < (rowHeight - 8); i += 8)
      count += 2;
  }
  return count;
}

/** 1:1 décomp `void ListMenuSetUpRedOutlineCursorSpriteOamTable(u16 rowWidth,
 *  u16 rowHeight, struct Subsprite *subsprites)` (list_menu.c:1240-1295).
 *  Pure : remplit `subsprites[]` (alloué `count*4` octets décomp = `count`
 *  entrées). Copie de struct par valeur (`{...}`) + assignation s8 wrappée
 *  (1:1 `subsprites[id].x = rowWidth + 128;` → s8). */
export function ListMenuSetUpRedOutlineCursorSpriteOamTable(rowWidth: number, rowHeight: number, subsprites: Subsprite[]): void {
  let id = 0;

  subsprites[id] = { ...sSubsprite_RedOutline1 };
  subsprites[id].x = _toS8(136);
  subsprites[id].y = _toS8(136);
  id++;

  subsprites[id] = { ...sSubsprite_RedOutline2 };
  subsprites[id].x = _toS8(rowWidth + 128);
  subsprites[id].y = _toS8(136);
  id++;

  subsprites[id] = { ...sSubsprite_RedOutline7 };
  subsprites[id].x = _toS8(136);
  subsprites[id].y = _toS8(rowHeight + 128);
  id++;

  subsprites[id] = { ...sSubsprite_RedOutline8 };
  subsprites[id].x = _toS8(rowWidth + 128);
  subsprites[id].y = _toS8(rowHeight + 128);
  id++;

  if (rowWidth > 16) {
    for (let i = 8; i < rowWidth - 8; i += 8) {
      subsprites[id] = { ...sSubsprite_RedOutline3 };
      subsprites[id].x = _toS8(i - 120);
      subsprites[id].y = _toS8(-120);
      id++;

      subsprites[id] = { ...sSubsprite_RedOutline6 };
      subsprites[id].x = _toS8(i - 120);
      subsprites[id].y = _toS8(rowHeight + 128);
      id++;
    }
  }

  if (rowHeight > 16) {
    for (let j = 8; j < rowHeight - 8; j += 8) {
      subsprites[id] = { ...sSubsprite_RedOutline4 };
      subsprites[id].x = _toS8(136);
      subsprites[id].y = _toS8(j - 120);
      id++;

      subsprites[id] = { ...sSubsprite_RedOutline5 };
      subsprites[id].x = _toS8(rowWidth + 128);
      subsprites[id].y = _toS8(j - 120);
      id++;
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// INCRÉMENT 3b — curseurs sprite RED_OUTLINE / RED_ARROW 1:1 (list_menu.c)
// ════════════════════════════════════════════════════════════════════════════
// Port 1:1 ligne-par-ligne de `ListMenuAddCursorObject` (list_menu.c:662) +
// dispatch `ListMenuAdd/Update/RemoveCursorObjectInternal` (:1178-1214) +
// `ListMenu{Add,Update,Remove}Red{Outline,Arrow}CursorObject` (:1297-1447) +
// `SpriteCallback_RedArrowCursor` (:1371) + tasks vides (:1216/:1377).
// Sert PC storage / shop / mystery gift (le sac = CURSOR_BLACK_ARROW, fait 2d).
// MAPPING struct C → API TS adaptée (corps des helpers LUS avant port,
// méthode obligatoire BAG-PHASE-2-PLAN) :
//   • `CreateSprite(&tpl, x, y, 0)` → `rt.CreateSpriteAtOam({...})` (= pattern
//     summary-screen.ts maîtrisé ; gDummySpriteTemplate = sprite vide sans
//     callback ; sSpriteTemplate_RedArrowCursor = + SpriteCallback_RedArrow).
//   • `(void*)gTasks[taskId].data` → Map `sCursorObjData` (1:1 sémantique du
//     cast brut, MÊME modèle que `sListMenus` en 2d).
//   • `SetSubspriteTables(&gSprites[id], &tbl)` → `SetSubspriteTables(spriteId,
//     subsprites[])` (signature ADAPTÉE décomp-globals, vérifiée 1:1).
//   • `FreeSprite{Tiles,Palette}ByTag` (PAS dans les modules core, juste des
//     stubs auto-gen) → helpers locaux 1:1 SÉMANTIQUE : libèrent le mapping
//     tag du runtime (alloc OBJ VRAM/pal indexée par tag-Map chez nous). PAS
//     un fake : c'est le 1:1 sémantique pour notre modèle d'alloc-par-tag (cf.
//     même esprit que SetSubspriteTables adaptée). Le sous-système bitmap
//     décomp (gSpriteTileAllocBitmap) n'est pas porté → ce free est cohérent
//     avec notre LoadCompressedSpriteSheet (curseur monotone, pas bitmap).
// VÉRIF : plomberie/structs/dispatch/SpriteCallback math = déterministe
// (pattern 3a). Le RENDU PIXEL (tiles/pal réels à l'écran) = A/B user au
// BRANCHEMENT d'un écran consommateur (PC/shop NON portés → pas de consommateur
// runtime actuel ; le préchargement asset `sOutlineCursor_Gfx`/`sArrowCursor_
// Gfx`/`sRedInterface_Pal` dans le cache `getAsset` se fera à ce branchement).
// Report HONNÊTE : 1:1 ligne-par-ligne, 0 demi-port, 0 fake silencieux.

/** 1:1 décomp `include/gba/gba.h #define DISPLAY_HEIGHT 160`. */
const DISPLAY_HEIGHT = 160;

/** 1:1 décomp `include/constants/...`/sprite : `#define TAG_NONE 0xFFFF`. */
const TAG_NONE = 0xFFFF;

/** 1:1 décomp `include/palette.h OBJ_PLTT_ID(n) = 0x100 + (n) * 16` (=
 *  decomp-runtime.ts:188 parité). */
function OBJ_PLTT_ID(n: number): number { return 256 + n * 16; }

/** 1:1 décomp `include/palette.h PLTT_SIZE_4BPP = 16 * sizeof(u16) = 32`
 *  (= decomp-bridge.ts:375 parité). */
const PLTT_SIZE_4BPP = 32;

/** 1:1 décomp symboles assets (list_menu.c:289-292) — `INCGFX` graphics/
 *  interface/{red.pal,outline_cursor.png,arrow_cursor.png}. Passés tels quels
 *  à `getAsset` (1:1 : le décomp passe ces symboles). Assets extraits (plan
 *  BAG : `public/decomp/em/ui/interface/`) ; préchargement cache = branchement
 *  écran consommateur (PC/shop). */
const sRedInterface_Pal = 'sRedInterface_Pal';
const sOutlineCursor_Gfx = 'sOutlineCursor_Gfx';
const sArrowCursor_Gfx = 'sArrowCursor_Gfx';

/** 1:1 décomp `struct RedOutlineCursor` (list_menu.c:36-43). `subspritesPtr`
 *  = `Alloc(count*4)` → array TS (Free = GC). */
interface RedOutlineCursor {
  subspriteTable: SubspriteTable;
  subspritesPtr: Subsprite[];
  spriteId: number;
  tileTag: number;
  palTag: number;
}

/** 1:1 décomp `struct RedArrowCursor` (list_menu.c:45-50). */
interface RedArrowCursor {
  spriteId: number;
  tileTag: number;
  palTag: number;
}

/** Modèle objet→Map (= 1:1 sémantique du cast `(void*)gTasks[taskId].data`
 *  du décomp ; la task `Task_RedOutline/ArrowCursor` ne sert qu'à réserver
 *  le slot/ID, exactement comme `ListMenuDummyTask`/`sListMenus` en 2d). */
const sCursorObjData = new Map<number, RedOutlineCursor | RedArrowCursor>();

/** 1:1 décomp `static void Task_RedOutlineCursor(u8 taskId) {}`
 *  (list_menu.c:1216) — vide (le sprite a son rendu propre / subsprites). */
function Task_RedOutlineCursor(_taskId: number): void { /* noop, 1:1 :1216 */ }

/** 1:1 décomp `static void Task_RedArrowCursor(u8 taskId) {}`
 *  (list_menu.c:1377) — vide (l'idle anim = SpriteCallback_RedArrowCursor). */
function Task_RedArrowCursor(_taskId: number): void { /* noop, 1:1 :1377 */ }

/** 1:1 décomp `static void SpriteCallback_RedArrowCursor(struct Sprite *sprite)`
 *  (list_menu.c:1371-1375). `gSineTable[(u8)data0]/64` : `(u8)` = `& 0xFF`,
 *  `/64` = division entière C (trunc vers 0) → `Math.trunc`. `data[0] += 8` :
 *  `sprite.data` = Int16Array → wrap s16 auto (1:1 `s16 data[0]`). */
function SpriteCallback_RedArrowCursor(sprite: { x2: number; data: number[] }): void {
  sprite.x2 = Math.trunc(gSineTable(sprite.data[0] & 0xFF) / 64);
  sprite.data[0] += 8;
}

/** 1:1 SÉMANTIQUE décomp `FreeSpriteTilesByTag(tag)` (sprite.c) — adapté à
 *  notre alloc OBJ VRAM par tag-Map (`rt.spriteSheetTagToTileStart`). Libérer
 *  = retirer le mapping (tag ré-allouable). Report HONNÊTE : le bitmap décomp
 *  `gSpriteTileAllocBitmap` n'est pas porté ; ce free est cohérent avec notre
 *  `LoadCompressedSpriteSheet` (curseur monotone), PAS un fake. */
function _freeSpriteTilesByTag(tag: number): void {
  const rt = getRuntime() as unknown as { spriteSheetTagToTileStart?: Map<string, number> } | null;
  rt?.spriteSheetTagToTileStart?.delete(String(tag));
}

/** 1:1 SÉMANTIQUE décomp `FreeSpritePaletteByTag(tag)` (sprite.c) — idem,
 *  modèle `rt.paletteTagToSlot`. (Inatteignable en pratique : ListMenuAdd
 *  CursorObject fixe palTag=TAG_NONE list_menu.c:671 ; porté 1:1 pour la
 *  garde `if palTag != TAG_NONE` et un éventuel appelant tiers.) */
function _freeSpritePaletteByTag(tag: number): void {
  const rt = getRuntime() as unknown as { paletteTagToSlot?: Map<string, number> } | null;
  rt?.paletteTagToSlot?.delete(String(tag));
}

/** Accès runtime sprite (1:1 `gSprites[id]`). */
function _getSprite(spriteId: number): { x: number; y: number; x2: number; y2: number; data: number[]; callback: ((s: unknown) => void) | null } | undefined {
  const rt = getRuntime() as unknown as { gSprites?: Map<number, unknown> } | null;
  return rt?.gSprites?.get(spriteId) as { x: number; y: number; x2: number; y2: number; data: number[]; callback: ((s: unknown) => void) | null } | undefined;
}

/** 1:1 décomp `static u8 ListMenuAddRedOutlineCursorObject(struct CursorStruct
 *  *cursor)` (list_menu.c:1297-1346). */
function ListMenuAddRedOutlineCursorObject(cursor: CursorStruct): number {
  // 1:1 :1305-1308 spriteSheet{data=sOutlineCursor_Gfx,size=0x100,tag} ;
  // LoadCompressedSpriteSheet (size ignoré par le wrapper = alloc auto).
  LoadCompressedSpriteSheet({ data: sOutlineCursor_Gfx, size: 0x100, tag: cursor.tileTag });
  // 1:1 :1310-1319 palTag==TAG_NONE → LoadPalette(sRedInterface_Pal,
  // OBJ_PLTT_ID(palNum), PLTT_SIZE_4BPP) ; sinon LoadSpritePalette.
  if (cursor.palTag === TAG_NONE) {
    LoadPalette(sRedInterface_Pal, OBJ_PLTT_ID(cursor.palNum), PLTT_SIZE_4BPP);
  } else {
    LoadSpritePalette({ data: sRedInterface_Pal, tag: cursor.palTag });
  }

  const taskId = _createTask(Task_RedOutlineCursor, 0);          // 1:1 :1321
  const data: RedOutlineCursor = {                               // 1:1 :1322 (void*)gTasks[taskId].data
    subspriteTable: { subspriteCount: 0, subsprites: [] },
    subspritesPtr: [], spriteId: 0, tileTag: 0, palTag: 0,
  };
  sCursorObjData.set(taskId, data);

  data.tileTag = cursor.tileTag;                                 // 1:1 :1324
  data.palTag = cursor.palTag;                                   // 1:1 :1325
  data.subspriteTable.subspriteCount = ListMenuGetRedOutlineCursorSpriteCount(cursor.rowWidth, cursor.rowHeight); // :1326
  // 1:1 :1327 `subspriteTable.subsprites = subspritesPtr = Alloc(count*4)`
  // (Alloc → array TS ; SetUpOamTable le remplit par index).
  data.subspriteTable.subsprites = data.subspritesPtr = [];
  ListMenuSetUpRedOutlineCursorSpriteOamTable(cursor.rowWidth, cursor.rowHeight, data.subspritesPtr); // :1328 (3a)

  // 1:1 :1330-1334 `spriteTemplate = gDummySpriteTemplate` (oam dummy 8x8,
  // callback dummy) avec tileTag/paletteTag custom ; CreateSprite(&tpl,
  // left+120, top+120, 0). Mapping adapté CreateSpriteAtOam : tile = tag→
  // tileStart, pal = palNum, shape/size 8x8 (le rendu = subsprites).
  const rt = getRuntime() as unknown as {
    CreateSpriteAtOam: (c: Record<string, number>) => { spriteId: number };
    spriteSheetTagToTileStart?: Map<string, number>;
  };
  const tileStart = rt.spriteSheetTagToTileStart?.get(String(cursor.tileTag)) ?? 0;
  const { spriteId } = rt.CreateSpriteAtOam({
    tileId: tileStart, paletteBank: cursor.palNum,
    x: cursor.left + 120, y: cursor.top + 120,
    shape: 0, size: 0, priority: 0, subpriority: 0,
  });
  data.spriteId = spriteId;
  // 1:1 :1335 SetSubspriteTables(&gSprites[id], &data->subspriteTable)
  SetSubspriteTables(spriteId, data.subspritesPtr as unknown as Parameters<typeof SetSubspriteTables>[1]);
  // 1:1 :1336-1338 oam.priority=0 ; subpriority=0 (déjà via CreateSpriteAtOam) ;
  // subspriteTableNum=0 (notre SetSubspriteTables = table unique → implicite).
  // 1:1 :1340-1343 palTag==TAG_NONE → oam.paletteNum = palNum (= paletteBank).
  return taskId;
}

/** 1:1 décomp `static void ListMenuUpdateRedOutlineCursorObject(u8 taskId,
 *  u16 x, u16 y)` (list_menu.c:1348-1354). */
function ListMenuUpdateRedOutlineCursorObject(taskId: number, x: number, y: number): void {
  const data = sCursorObjData.get(taskId) as RedOutlineCursor | undefined;
  if (!data) return;
  const spr = _getSprite(data.spriteId);
  if (spr) {
    spr.x = x + 120;   // 1:1 :1352
    spr.y = y + 120;   // 1:1 :1353
  }
}

/** 1:1 décomp `static void ListMenuRemoveRedOutlineCursorObject(u8 taskId)`
 *  (list_menu.c:1356-1369). */
function ListMenuRemoveRedOutlineCursorObject(taskId: number): void {
  const data = sCursorObjData.get(taskId) as RedOutlineCursor | undefined;
  if (!data) return;
  // 1:1 :1360 Free(data->subspritesPtr) — no-op (GC JS).
  if (data.tileTag !== TAG_NONE) _freeSpriteTilesByTag(data.tileTag);   // 1:1 :1362-1363
  if (data.palTag !== TAG_NONE) _freeSpritePaletteByTag(data.palTag);   // 1:1 :1364-1365
  const rt = getRuntime() as unknown as { DestroySprite?: (id: number) => void } | null;
  rt?.DestroySprite?.(data.spriteId);   // 1:1 :1367 DestroySprite(&gSprites[id])
  _destroyTask(taskId);                  // 1:1 :1368 DestroyTask(taskId)
  sCursorObjData.delete(taskId);         // = slot gTasks[].data réclamé
}

/** 1:1 décomp `static u8 ListMenuAddRedArrowCursorObject(struct CursorStruct
 *  *cursor)` (list_menu.c:1382-1426). */
function ListMenuAddRedArrowCursorObject(cursor: CursorStruct): number {
  // 1:1 :1390-1393 spriteSheet{data=sArrowCursor_Gfx,size=0x80,tag}.
  LoadCompressedSpriteSheet({ data: sArrowCursor_Gfx, size: 0x80, tag: cursor.tileTag });
  // 1:1 :1395-1404 palTag==TAG_NONE → LoadPalette ; sinon LoadSpritePalette.
  if (cursor.palTag === TAG_NONE) {
    LoadPalette(sRedInterface_Pal, OBJ_PLTT_ID(cursor.palNum), PLTT_SIZE_4BPP);
  } else {
    LoadSpritePalette({ data: sRedInterface_Pal, tag: cursor.palTag });
  }

  const taskId = _createTask(Task_RedArrowCursor, 0);            // 1:1 :1406
  const data: RedArrowCursor = { spriteId: 0, tileTag: 0, palTag: 0 }; // 1:1 :1407
  sCursorObjData.set(taskId, data);

  data.tileTag = cursor.tileTag;                                 // 1:1 :1409
  data.palTag = cursor.palTag;                                   // 1:1 :1410

  // 1:1 :1412-1416 `spriteTemplate = sSpriteTemplate_RedArrowCursor`
  // (sOamData_RedArrowCursor = SPRITE_SHAPE(16x16)=ST_OAM_SQUARE=0,
  // SPRITE_SIZE(16x16)=1, priority 0 ; callback=SpriteCallback_RedArrowCursor)
  // avec tileTag/paletteTag custom ; CreateSprite(&tpl, left, top, 0).
  const rt = getRuntime() as unknown as {
    CreateSpriteAtOam: (c: Record<string, number>) => { spriteId: number };
    spriteSheetTagToTileStart?: Map<string, number>;
  };
  const tileStart = rt.spriteSheetTagToTileStart?.get(String(cursor.tileTag)) ?? 0;
  const { spriteId } = rt.CreateSpriteAtOam({
    tileId: tileStart, paletteBank: cursor.palNum,
    x: cursor.left, y: cursor.top,
    shape: 0, size: 1, priority: 0, subpriority: 0,
  });
  data.spriteId = spriteId;
  const spr = _getSprite(spriteId);
  if (spr) {
    spr.x2 = 8;   // 1:1 :1417
    spr.y2 = 8;   // 1:1 :1418
    // sSpriteTemplate_RedArrowCursor.callback = SpriteCallback_RedArrowCursor
    spr.callback = SpriteCallback_RedArrowCursor as unknown as (s: unknown) => void;
  }
  // 1:1 :1420-1423 palTag==TAG_NONE → oam.paletteNum = palNum (= paletteBank).
  return taskId;
}

/** 1:1 décomp `static void ListMenuUpdateRedArrowCursorObject(u8 taskId,
 *  u16 x, u16 y)` (list_menu.c:1428-1434). */
function ListMenuUpdateRedArrowCursorObject(taskId: number, x: number, y: number): void {
  const data = sCursorObjData.get(taskId) as RedArrowCursor | undefined;
  if (!data) return;
  const spr = _getSprite(data.spriteId);
  if (spr) {
    spr.x = x;   // 1:1 :1432
    spr.y = y;   // 1:1 :1433
  }
}

/** 1:1 décomp `static void ListMenuRemoveRedArrowCursorObject(u8 taskId)`
 *  (list_menu.c:1436-1447). */
function ListMenuRemoveRedArrowCursorObject(taskId: number): void {
  const data = sCursorObjData.get(taskId) as RedArrowCursor | undefined;
  if (!data) return;
  if (data.tileTag !== TAG_NONE) _freeSpriteTilesByTag(data.tileTag);   // 1:1 :1440-1441
  if (data.palTag !== TAG_NONE) _freeSpritePaletteByTag(data.palTag);   // 1:1 :1442-1443
  const rt = getRuntime() as unknown as { DestroySprite?: (id: number) => void } | null;
  rt?.DestroySprite?.(data.spriteId);   // 1:1 :1445 DestroySprite(&gSprites[id])
  _destroyTask(taskId);                  // 1:1 :1446 DestroyTask(taskId)
  sCursorObjData.delete(taskId);
}

/** 1:1 décomp `static u8 ListMenuAddCursorObjectInternal(struct CursorStruct
 *  *cursor, u32 cursorObjId)` (list_menu.c:1178-1188). */
function ListMenuAddCursorObjectInternal(cursor: CursorStruct, cursorObjId: number): number {
  switch (cursorObjId) {
    case CURSOR_RED_OUTLINE - CURSOR_OBJECT_START:
    default:
      return ListMenuAddRedOutlineCursorObject(cursor);
    case CURSOR_RED_ARROW - CURSOR_OBJECT_START:
      return ListMenuAddRedArrowCursorObject(cursor);
  }
}

/** 1:1 décomp `static u8 ListMenuAddCursorObject(struct ListMenu *list,
 *  u32 cursorObjId)` (list_menu.c:662-675). */
function ListMenuAddCursorObject(list: ListMenu, cursorObjId: number): number {
  const cursor: CursorStruct = {
    left: 0,                                                            // 1:1 :666
    top: DISPLAY_HEIGHT,                                                // 1:1 :667
    rowWidth: GetWindowAttribute(list.template.windowId, WINDOW_WIDTH) * 8 + 2,   // 1:1 :668
    rowHeight: GetFontAttribute(list.template.fontId, FONTATTR_MAX_LETTER_HEIGHT) + 2, // 1:1 :669
    tileTag: 0x4000,                                                    // 1:1 :670
    palTag: TAG_NONE,                                                   // 1:1 :671
    palNum: 15,                                                         // 1:1 :672
  };
  return ListMenuAddCursorObjectInternal(cursor, cursorObjId);          // 1:1 :674
}

/** 1:1 décomp `static void ListMenuUpdateCursorObject(u8 taskId, u16 x,
 *  u16 y, u32 cursorObjId)` (list_menu.c:1190-1201). */
function ListMenuUpdateCursorObject(taskId: number, x: number, y: number, cursorObjId: number): void {
  switch (cursorObjId) {
    case CURSOR_RED_OUTLINE - CURSOR_OBJECT_START:
      ListMenuUpdateRedOutlineCursorObject(taskId, x, y);
      break;
    case CURSOR_RED_ARROW - CURSOR_OBJECT_START:
      ListMenuUpdateRedArrowCursorObject(taskId, x, y);
      break;
  }
}

/** 1:1 décomp `static void ListMenuRemoveCursorObject(u8 taskId,
 *  u32 cursorObjId)` (list_menu.c:1203-1214). */
function ListMenuRemoveCursorObject(taskId: number, cursorObjId: number): void {
  switch (cursorObjId) {
    case CURSOR_RED_OUTLINE - CURSOR_OBJECT_START:
      ListMenuRemoveRedOutlineCursorObject(taskId);
      break;
    case CURSOR_RED_ARROW - CURSOR_OBJECT_START:
      ListMenuRemoveRedArrowCursorObject(taskId);
      break;
  }
}
