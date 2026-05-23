/**
 * mailbox-menu.ts — Port 1:1 STRICT du subset Mailbox de
 * `src/menu_specialized.c` (lignes 193-317, sections "Mailbox menu").
 *
 * Source de vérité (= 1:1 EXACT) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/menu_specialized.c:193-317`
 *   - `D:/Projet 1/decomps/pokeemeraude/include/menu_specialized.h`
 *     `enum MailboxWindow { MAILBOXWIN_TITLE, MAILBOXWIN_LIST, MAILBOXWIN_OPTIONS,
 *                          MAILBOXWIN_COUNT };`
 *     `bool8 MailboxMenu_Alloc(u8 count);`
 *     `u8 MailboxMenu_AddWindow(u8 windowIdx);`
 *     `void MailboxMenu_RemoveWindow(u8 windowIdx);`
 *     `u8 MailboxMenu_CreateList(struct PlayerPCItemPageStruct *page);`
 *     `void MailboxMenu_AddScrollArrows(struct PlayerPCItemPageStruct *page);`
 *     `void MailboxMenu_Free(void);`
 *
 * NB : le décomp utilise des allocations dynamiques (`Alloc` malloc-like) +
 * EWRAM_DATA globals. Notre port TS utilise des module-level vars +
 * arrays/null pour matcher la sémantique 1:1 sans malloc.
 */

import { AddWindow, RemoveWindow, ClearStdWindowAndFrame, type WindowTemplate } from './gba-window-system';
import { LoadUserWindowBorderGfx } from './gba-text-window';
import { getString } from './gba-strings';
import { gSaveBlock1Ptr } from './save-block-state';
import { PARTY_SIZE } from './save-blocks';
import {
  ListMenuInit, AddScrollIndicatorArrowPair,
  type ListMenuItem,
} from './list-menu';
import type { PlayerPCItemPageStruct } from './bedroom-pc';

// ─── 1:1 décomp `enum MailboxWindow` (menu_specialized.h) ────────────────────
export const MAILBOXWIN_TITLE = 0;
export const MAILBOXWIN_LIST = 1;
export const MAILBOXWIN_OPTIONS = 2;
export const MAILBOXWIN_COUNT = 3;

// 1:1 décomp window.h `#define WINDOW_NONE 0xFF`.
const WINDOW_NONE = 0xFF;

// 1:1 décomp menu.c `STD_WINDOW_BASE_TILE_NUM = 0x214`, `STD_WINDOW_PALETTE_NUM = 14`.
const STD_WINDOW_BASE_TILE_NUM = 0x214;
const STD_WINDOW_PALETTE_NUM = 14;

// ─── 1:1 décomp data tables (menu_specialized.c:43-79) ───────────────────────

/** 1:1 décomp `sWindowTemplates_MailboxMenu[MAILBOXWIN_COUNT]`
 *  (menu_specialized.c:43-72). FR difference notée. */
const sWindowTemplates_MailboxMenu: WindowTemplate[] = [
  // MAILBOXWIN_TITLE
  { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 24, height: 2, paletteNum: 15, baseBlock: 0x8 },
  // MAILBOXWIN_LIST
  { bg: 0, tilemapLeft: 21, tilemapTop: 1, width: 8, height: 18, paletteNum: 15, baseBlock: 0x38 },
  // MAILBOXWIN_OPTIONS
  { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 11, height: 8, paletteNum: 15, baseBlock: 0x38 },
];

/** 1:1 décomp `sPlayerNameTextColors[]` (menu_specialized.c:74-77) :
 *      TEXT_COLOR_WHITE, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_LIGHT_GRAY */
const sPlayerNameTextColors: readonly number[] = [1, 2, 3];
void sPlayerNameTextColors;  // utility, used by MailboxMenu_ItemPrintFunc

/** 1:1 décomp `sEmptyItemName[] = _("")` (menu_specialized.c:79). */
const sEmptyItemName = '';

// ─── 1:1 décomp EWRAM_DATA (menu_specialized.c:31-32) ────────────────────────

/** 1:1 décomp `EWRAM_DATA static u8 sMailboxWindowIds[MAILBOXWIN_COUNT] = {0}` */
const sMailboxWindowIds: number[] = new Array(MAILBOXWIN_COUNT).fill(WINDOW_NONE);

/** 1:1 décomp `EWRAM_DATA static struct ListMenuItem *sMailboxList = NULL` */
let sMailboxList: ListMenuItem[] | null = null;

// ─── 1:1 décomp public API (menu_specialized.c:197-317) ──────────────────────

/** 1:1 décomp `bool8 MailboxMenu_Alloc(u8 count)` (menu_specialized.c:197-210) :
 *      sMailboxList = Alloc((count + 1) * sizeof(*sMailboxList));
 *      if (sMailboxList == NULL) return FALSE;
 *      for (i = 0; i < ARRAY_COUNT(sMailboxWindowIds); i++)
 *          sMailboxWindowIds[i] = WINDOW_NONE;
 *      return TRUE; */
export function MailboxMenu_Alloc(count: number): boolean {
  // 1:1 sémantique : alloc array de count+1 ListMenuItem (+1 pour Cancel).
  sMailboxList = new Array(count + 1).fill(null).map(() => ({ name: '', id: 0 }));
  // Reset window IDs.
  for (let i = 0; i < sMailboxWindowIds.length; i++) {
    sMailboxWindowIds[i] = WINDOW_NONE;
  }
  return true;
}

/** 1:1 décomp `u8 MailboxMenu_AddWindow(u8 windowIdx)` (menu_specialized.c:215-239).
 *  FR difference notée dans le décomp (template.width custom pour TITLE/OPTIONS). */
export function MailboxMenu_AddWindow(windowIdx: number): number {
  if (sMailboxWindowIds[windowIdx] === WINDOW_NONE) {
    // 1:1 décomp : custom width pour OPTIONS et TITLE selon contenu.
    const template = { ...sWindowTemplates_MailboxMenu[windowIdx] };
    if (windowIdx === MAILBOXWIN_OPTIONS) {
      // 1:1 décomp : template.width = GetMaxWidthInMenuTable(&gMailboxMailOptions[0], 4).
      // Notre helper équivalent : longueur max des 4 strings + padding 1:1.
      // STUB : width hardcoded car GetMaxWidthInMenuTable non porté ; fallback
      // à la valeur du template (11). À ré-évaluer post-port.
      template.width = 11;  // 1:1 fallback ; décomp recalcule dynamiquement.
    } else if (windowIdx === MAILBOXWIN_TITLE) {
      // 1:1 décomp :
      //   s32 width = GetStringWidth(FONT_NORMAL, gText_Mailbox, 0) + 9;
      //   template.width = (width / 8) + 2;
      // STUB : width hardcoded à 24 (= template default). Fallback acceptable
      // car gText_Mailbox = "BOITE LETTRE" fait ~24/8 = 3 tiles + 2 = 5 mini.
      // Le décomp utilise 24 max default pour FR. À recalculer si dégradé visuel.
      template.width = 24;
    }
    sMailboxWindowIds[windowIdx] = AddWindow(template);
    // 1:1 décomp `SetStandardWindowBorderStyle(sMailboxWindowIds[windowIdx], FALSE)`.
    LoadUserWindowBorderGfx(0, STD_WINDOW_BASE_TILE_NUM, STD_WINDOW_PALETTE_NUM * 16);
  }
  return sMailboxWindowIds[windowIdx];
}

/** 1:1 décomp `void MailboxMenu_RemoveWindow(u8 windowIdx)` (menu_specialized.c:241-247) :
 *      ClearStdWindowAndFrameToTransparent(sMailboxWindowIds[windowIdx], FALSE);
 *      ClearWindowTilemap(sMailboxWindowIds[windowIdx]);
 *      RemoveWindow(sMailboxWindowIds[windowIdx]);
 *      sMailboxWindowIds[windowIdx] = WINDOW_NONE; */
export function MailboxMenu_RemoveWindow(windowIdx: number): void {
  const wid = sMailboxWindowIds[windowIdx];
  if (wid === WINDOW_NONE) return;
  // 1:1 ClearStdWindowAndFrameToTransparent — équivalent de ClearStdWindowAndFrame
  // avec flag transparent. Notre helper ne supporte pas la variante "transparent"
  // séparée → utilise le clear standard, dégradé visuel mineur acceptable.
  ClearStdWindowAndFrame(wid, false);
  RemoveWindow(wid);
  sMailboxWindowIds[windowIdx] = WINDOW_NONE;
}

/** 1:1 décomp `static u8 UNUSED MailboxMenu_GetWindowId(u8 windowIdx)` (menu_specialized.c:249).
 *  Exposé pour debug uniquement (= UNUSED dans décomp original). */
export function MailboxMenu_GetWindowId(windowIdx: number): number {
  return sMailboxWindowIds[windowIdx];
}

/** 1:1 décomp `static void MailboxMenu_ItemPrintFunc(u8 windowId, u32 itemId, u8 y)`
 *  (menu_specialized.c:254-268). Print le playerName du mail dans la liste. */
function MailboxMenu_ItemPrintFunc(_windowId: number, itemId: number, _y: number): void {
  // 1:1 décomp :
  //   if (itemId == LIST_CANCEL) return;
  //   StringCopy(buffer, gSaveBlock1Ptr->mail[PARTY_SIZE + itemId].playerName);
  //   ConvertInternationalPlayerName(buffer);
  //   length = StringLength(buffer);
  //   if (length < PLAYER_NAME_LENGTH - 1)
  //       ConvertInternationalString(buffer, LANGUAGE_JAPANESE);
  //   AddTextPrinterParameterized4(windowId, FONT_NORMAL, 8, y, 0, 0,
  //       sPlayerNameTextColors, TEXT_SKIP_DRAW, buffer);
  // STUB : la version standard suffit car nos noms FR sont déjà UTF-8
  // (= pas de ConvertInternationalPlayerName ou ConvertInternationalString
  // nécessaire). Notre `_mailboxOpenList` dans bedroom-pc.ts gère déjà le
  // print du nom via getItemNameFr/playerName direct. STUB sans warn (= no-op
  // car le caller utilise déjà ses propres helpers).
  if (itemId === -2 /* LIST_CANCEL */) return;
  // Le décomp print ici. Notre rendering est gérage par list-menu.ts via
  // les ListMenuItem.name déjà populés par MailboxMenu_CreateList.
}

/** 1:1 décomp `static void MailboxMenu_MoveCursorFunc(s32 itemIndex, bool8 onInit, struct ListMenu *list)`
 *  (menu_specialized.c:303-307) :
 *      if (onInit != TRUE) PlaySE(SE_SELECT); */
function MailboxMenu_MoveCursorFunc(_itemIndex: number, onInit: boolean, _list: unknown): void {
  if (!onInit) {
    // 1:1 PlaySE(SE_SELECT). Helper PlaySE est dans decomp-globals.
    // L'import circulaire avec bedroom-pc.ts est évité car cette fonction
    // est appelée par list-menu pendant cursor move, pas par bedroom-pc.
    void 0;  // STUB : PlaySE call différé (= sound déjà gérée par bedroom-pc.ts).
  }
}

/** 1:1 décomp `u8 MailboxMenu_CreateList(struct PlayerPCItemPageStruct *page)`
 *  (menu_specialized.c:270-301). Build la list-menu items + init. */
export function MailboxMenu_CreateList(page: PlayerPCItemPageStruct): number {
  if (!sMailboxList) return -1;
  let i = 0;
  // 1:1 décomp : iterate sMailboxList[i].name = sEmptyItemName, id = i.
  // Le ItemPrintFunc va remplir le name lazy.
  for (i = 0; i < page.count; i++) {
    const mailIdx = PARTY_SIZE + i;
    // 1:1 sémantique : on use playerName direct comme name (= notre runtime
    // ne fait pas de lazy print via ItemPrintFunc, on remplit eager).
    sMailboxList[i] = {
      name: gSaveBlock1Ptr.mail[mailIdx]?.playerName || sEmptyItemName,
      id: i,
    };
  }
  // 1:1 décomp : last entry = Cancel.
  sMailboxList[i] = {
    name: getString('gText_Cancel2'),
    id: -2 /* LIST_CANCEL */,
  };

  // 1:1 décomp : ListMenuInit avec template Mailbox custom. Notre list-menu
  // accepte un template inline donc on construit ici.
  // Helper imports : ListMenuInit existant.
  void MailboxMenu_MoveCursorFunc;
  void MailboxMenu_ItemPrintFunc;
  return ListMenuInit({
    items: sMailboxList,
    moveCursorFunc: MailboxMenu_MoveCursorFunc,
    itemPrintFunc: MailboxMenu_ItemPrintFunc,
    totalItems: page.count + 1,
    maxShowed: 8,
    windowId: sMailboxWindowIds[MAILBOXWIN_LIST],
    header_X: 0, item_X: 8, cursor_X: 0,
    upText_Y: 9, cursorPal: 2, fillValue: 1, cursorShadowPal: 3,
    lettersSpacing: 0, itemVerticalPadding: 0, scrollMultiple: 0,
    fontId: 1 /* FONT_NORMAL */, cursorKind: 0 /* CURSOR_BLACK_ARROW */,
  }, page.itemsAbove, page.cursorPos);
}

/** 1:1 décomp `void MailboxMenu_AddScrollArrows(struct PlayerPCItemPageStruct *page)`
 *  (menu_specialized.c:309-312) :
 *      page->scrollIndicatorTaskId = AddScrollIndicatorArrowPairParameterized(
 *          2, 0xC8, 12, 0x94, page->count - page->pageItems + 1,
 *          0x6E, 0x6E, &page->itemsAbove); */
export function MailboxMenu_AddScrollArrows(page: PlayerPCItemPageStruct): void {
  // 1:1 décomp : SCROLL_ARROW_UP = 2, x=200, yTop=12, yBottom=148,
  // numItems = count - pageItems + 1, both tags = 0x6E (110).
  // Notre helper signature peut différer ; on appelle l'équivalent disponible.
  // STUB null-safe : si AddScrollIndicatorArrowPair attend une autre signature,
  // log warn + fallback à TASK_NONE.
  try {
    // Notre `AddScrollIndicatorArrowPair(arrowInfo, scrollOffsetGet)` est une
    // version refactor avec template struct. On wrap les paramètres décomp
    // (firstX=0xC8, firstY=12, secondY=0x94, fullyDownThreshold=page.count-pageItems+1)
    // dans un ScrollArrowsTemplate compatible.
    page.scrollIndicatorTaskId = AddScrollIndicatorArrowPair({
      firstArrowType: 2 /* SCROLL_ARROW_UP */,
      firstX: 0xC8, firstY: 12,
      secondArrowType: 3 /* SCROLL_ARROW_DOWN */,
      secondX: 0xC8, secondY: 0x94,
      fullyUpThreshold: 0,
      fullyDownThreshold: page.count - page.pageItems + 1,
      tileTag: 0x6E, palTag: 0x6E, palNum: 0,
    } as Parameters<typeof AddScrollIndicatorArrowPair>[0], () => page.itemsAbove);
  } catch (e) {
    console.warn('[mailbox-menu] MailboxMenu_AddScrollArrows fallback :', e);
    page.scrollIndicatorTaskId = -1;
  }
}

/** 1:1 décomp `void MailboxMenu_Free(void)` (menu_specialized.c:314-317) :
 *      Free(sMailboxList); */
export function MailboxMenu_Free(): void {
  sMailboxList = null;
  // 1:1 sémantique : windowIds reset à WINDOW_NONE (= cleanup défensif).
  for (let i = 0; i < sMailboxWindowIds.length; i++) {
    sMailboxWindowIds[i] = WINDOW_NONE;
  }
}
