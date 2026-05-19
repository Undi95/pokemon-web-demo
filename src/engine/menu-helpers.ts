/**
 * menu-helpers.ts — 1:1 décomp `src/menu_helpers.c`
 * ============================================================================
 * Chaînon MAILLON (méthode user "remonte la chaîne") : le SAC (bag-menu.ts
 * étape 5 InitPocketListPositions/InitPocketScrollPositions) dépend de
 * `SetCursorWithinListBounds`/`SetCursorScrollWithinListBounds` (menu_helpers
 * .c) — non portés. Sous-système PARTAGÉ (bag, PC, shop, list menus) → leur
 * MAISON = ici (↔ menu_helpers.c), pas un local bag.
 *
 * Sémantique pointeur 1:1 : la décomp prend `u16 *scrollOffset, u16
 * *cursorPos` (mutés en place). JS n'a pas de pointeur → on prend un objet
 * `ListPos { scroll, cursor }` muté en place (= pattern 1:1-sémantique
 * déjà établi list-menu.ts pour `u16 *`). Le caller copie depuis/vers
 * gBagPosition.scrollPosition[i]/cursorPosition[i].
 */

/** Réf mutable 1:1-sémantique de `(u16 *scrollOffset, u16 *cursorPos)`. */
export interface ListPos {
  scroll: number;
  cursor: number;
}

/** 1:1 décomp `SetCursorWithinListBounds` (menu_helpers.c:343).
 *  Clampe scroll+curseur dans [0, totalItems). */
export function SetCursorWithinListBounds(pos: ListPos, maxShownItems: number, totalItems: number): void {
  if (pos.scroll !== 0 && pos.scroll + maxShownItems > totalItems)
    pos.scroll = totalItems - maxShownItems;

  if (pos.scroll + pos.cursor >= totalItems) {
    if (totalItems === 0)
      pos.cursor = 0;
    else
      pos.cursor = totalItems - 1;
  }
}

/** 1:1 décomp `SetCursorScrollWithinListBounds` (menu_helpers.c:357).
 *  Recentre le curseur ~milieu de la fenêtre visible (parité de
 *  maxShownItems = 2 branches strictement 1:1). */
export function SetCursorScrollWithinListBounds(
  pos: ListPos, shownItems: number, totalItems: number, maxShownItems: number,
): void {
  let i: number;
  if (maxShownItems % 2 !== 0) {
    // Is cursor at least halfway down visible list
    if (pos.cursor >= Math.floor(maxShownItems / 2)) {
      for (i = 0; i < pos.cursor - Math.floor(maxShownItems / 2); i++) {
        // Stop if reached end of list
        if (pos.scroll + shownItems === totalItems)
          break;
        pos.cursor--;
        pos.scroll++;
      }
    }
  } else {
    // Is cursor at least halfway down visible list
    if (pos.cursor >= Math.floor(maxShownItems / 2) + 1) {
      for (i = 0; i <= pos.cursor - Math.floor(maxShownItems / 2); i++) {
        // Stop if reached end of list
        if (pos.scroll + shownItems === totalItems)
          break;
        pos.cursor--;
        pos.scroll++;
      }
    }
  }
}
