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

import {
  AddWindow, RemoveWindow, DrawStdFrameWithCustomTileAndPalette,
  ClearStdWindowAndFrame, FillWindowPixelBuffer, PutWindowTilemap,
  CopyWindowToVram,
  type WindowTemplate,
} from './gba-window-system';
import { LoadUserWindowBorderGfx } from './gba-text-window';
import { AddTextPrinterParameterized3 } from './gba-text-system';
import { gameState } from './game-state';
import { getItem, getItemNameFr, getItemDescriptionFr } from './data-tables';
import { PlaySE } from './decomp-globals';

// ─── Constants ───────────────────────────────────────────────────────────────

const FONT_NORMAL = 1;
const TEXT_SKIP_DRAW = 255;
const COLOR_MAIN: [number, number, number] = [1, 2, 3];
/** Standard menu frame tile + palette (= même que start menu = cohérent). */
const STD_FRAME_TILE = 0x214;
const STD_FRAME_PAL = 14;

/** Pocket display order — 1:1 décomp items_pocket.c sBagPockets. */
const POCKETS: ReadonlyArray<{
  key: 'items' | 'pokeBalls' | 'tmHm' | 'berries' | 'keyItems';
  label: string;
}> = [
  { key: 'items',     label: 'OBJETS' },
  { key: 'pokeBalls', label: 'POKé BALLS' },
  { key: 'tmHm',      label: 'CT/CS' },
  { key: 'berries',   label: 'BAIES' },
  { key: 'keyItems',  label: 'OBJETS RARES' },
];

const VISIBLE_ROWS = 5;

/** Window templates — résolution GBA = 30 tiles wide × 20 tiles high (240×160 px).
 *  Layout :
 *    Header (top-right)  : tilemapTop 0, height 2  → y 0-15 px
 *    List   (right side) : tilemapTop 2, height 11 → y 16-103 px (5 items × 16px + frame)
 *    Desc   (bottom)     : tilemapTop 14, height 4 → y 112-143 px (textbox standard)
 *  Player still visible derrière les windows transparents. */
const HEADER_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 0, tilemapLeft: 16, tilemapTop: 0, width: 13, height: 2,
  paletteNum: STD_FRAME_PAL, baseBlock: 0x1,
};

const LIST_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 0, tilemapLeft: 16, tilemapTop: 2, width: 13, height: 11,
  paletteNum: STD_FRAME_PAL, baseBlock: 0x40,
};

const DESC_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 0, tilemapLeft: 1, tilemapTop: 14, width: 27, height: 4,
  paletteNum: STD_FRAME_PAL, baseBlock: 0x100,
};

// ─── Module state ────────────────────────────────────────────────────────────

let _isOpen = false;
let _pocketIdx = 0;
let _cursorPos = 0;     // 0..VISIBLE_ROWS-1, position du cursor dans la fenêtre
let _scrollOffset = 0;  // index du 1er item visible
let _headerWid = -1;
let _listWid = -1;
let _descWid = -1;
let _onClose: (() => void) | null = null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface ItemSlot { itemKey: string; quantity: number }

function _currentPocketItems(): ItemSlot[] {
  const bag = gameState.bag as unknown as Record<string, ItemSlot[]>;
  const k = POCKETS[_pocketIdx].key;
  const slots = bag[k] ?? [];
  // Filter out empty slots.
  return slots.filter(s => s?.itemKey && (s.quantity ?? 0) > 0);
}

function _selectedItemKey(): string | null {
  const items = _currentPocketItems();
  const idx = _scrollOffset + _cursorPos;
  return items[idx]?.itemKey ?? null;
}

function _drawHeader(): void {
  if (_headerWid < 0) return;
  FillWindowPixelBuffer(_headerWid, 0x11);
  AddTextPrinterParameterized3(
    _headerWid, FONT_NORMAL, 4, 1, COLOR_MAIN, TEXT_SKIP_DRAW,
    POCKETS[_pocketIdx].label,
  );
  // Indicator pocket nav : "◀ 1/5 ▶"
  const indicator = `${_pocketIdx + 1}/${POCKETS.length}`;
  AddTextPrinterParameterized3(
    _headerWid, FONT_NORMAL, 70, 1, COLOR_MAIN, TEXT_SKIP_DRAW, indicator,
  );
  PutWindowTilemap(_headerWid);
  CopyWindowToVram(_headerWid, 3);
}

function _drawList(): void {
  if (_listWid < 0) return;
  FillWindowPixelBuffer(_listWid, 0x11);
  const items = _currentPocketItems();
  if (items.length === 0) {
    AddTextPrinterParameterized3(
      _listWid, FONT_NORMAL, 8, 4, COLOR_MAIN, TEXT_SKIP_DRAW, '(vide)',
    );
  } else {
    for (let i = 0; i < VISIBLE_ROWS; i++) {
      const idx = _scrollOffset + i;
      if (idx >= items.length) break;
      const slot = items[idx];
      const name = getItemNameFr(slot.itemKey);
      const qty = slot.quantity;
      const cursor = (i === _cursorPos) ? '>' : ' ';
      const line = `${cursor}${name}`;
      AddTextPrinterParameterized3(
        _listWid, FONT_NORMAL, 4, 1 + i * 16, COLOR_MAIN, TEXT_SKIP_DRAW, line,
      );
      // Right-align quantity.
      const qtyStr = `x${qty}`;
      AddTextPrinterParameterized3(
        _listWid, FONT_NORMAL, 78, 1 + i * 16, COLOR_MAIN, TEXT_SKIP_DRAW, qtyStr,
      );
    }
    // Scroll indicators.
    if (_scrollOffset > 0) {
      AddTextPrinterParameterized3(_listWid, FONT_NORMAL, 95, 1, COLOR_MAIN, TEXT_SKIP_DRAW, '^');
    }
    if (_scrollOffset + VISIBLE_ROWS < items.length) {
      AddTextPrinterParameterized3(_listWid, FONT_NORMAL, 95, 1 + (VISIBLE_ROWS - 1) * 16, COLOR_MAIN, TEXT_SKIP_DRAW, 'v');
    }
  }
  PutWindowTilemap(_listWid);
  CopyWindowToVram(_listWid, 3);
}

function _drawDesc(): void {
  if (_descWid < 0) return;
  FillWindowPixelBuffer(_descWid, 0x11);
  const itemKey = _selectedItemKey();
  if (itemKey) {
    const def = getItem(itemKey);
    const desc = def?.descriptionLabel ? getItemDescriptionFr(def.descriptionLabel) : '';
    if (desc) {
      // Wrap à ~26 chars per line. Décomp fait pareil via newlines auto.
      const lines = _wrap(desc, 26);
      for (let i = 0; i < Math.min(lines.length, 3); i++) {
        AddTextPrinterParameterized3(
          _descWid, FONT_NORMAL, 0, 1 + i * 14, COLOR_MAIN, TEXT_SKIP_DRAW, lines[i],
        );
      }
    } else {
      // Pas de description française extraite. Affiche au moins prix + pocket type.
      const fallbackParts = [];
      if (def?.price && def.price > 0) fallbackParts.push(`Prix: ${def.price}`);
      const txt = fallbackParts.length > 0 ? fallbackParts.join('  ') : '';
      AddTextPrinterParameterized3(_descWid, FONT_NORMAL, 0, 1, COLOR_MAIN, TEXT_SKIP_DRAW, txt);
    }
  } else {
    AddTextPrinterParameterized3(
      _descWid, FONT_NORMAL, 0, 1, COLOR_MAIN, TEXT_SKIP_DRAW,
      'HAUT/BAS scroll - DROITE/GAUCHE pocket',
    );
    AddTextPrinterParameterized3(
      _descWid, FONT_NORMAL, 0, 17, COLOR_MAIN, TEXT_SKIP_DRAW,
      'A utiliser - B retour',
    );
  }
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
  _drawHeader();
  _drawList();
  _drawDesc();
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function IsBagScreenOpen(): boolean {
  return _isOpen;
}

/** Open le bag screen. Le caller passe un onClose callback (= start-menu doit
 *  ré-afficher son main menu après que l'user appuie B ici). */
export function OpenBagScreen(onClose: () => void): void {
  if (_isOpen) return;
  _isOpen = true;
  _pocketIdx = 0;
  _cursorPos = 0;
  _scrollOffset = 0;
  _onClose = onClose;

  // 1:1 décomp pattern start_menu.c — BG 0 + STD frame tiles. Le start-menu
  // a déjà loadé ces gfx ; on re-load pour être idempotent (= si user ouvre
  // bag depuis trainer card screen plus tard).
  LoadUserWindowBorderGfx(0, STD_FRAME_TILE, STD_FRAME_PAL * 16);

  _headerWid = AddWindow(HEADER_WINDOW_TEMPLATE);
  _listWid = AddWindow(LIST_WINDOW_TEMPLATE);
  _descWid = AddWindow(DESC_WINDOW_TEMPLATE);

  DrawStdFrameWithCustomTileAndPalette(_headerWid, true, STD_FRAME_TILE, STD_FRAME_PAL);
  DrawStdFrameWithCustomTileAndPalette(_listWid, true, STD_FRAME_TILE, STD_FRAME_PAL);
  DrawStdFrameWithCustomTileAndPalette(_descWid, true, STD_FRAME_TILE, STD_FRAME_PAL);

  _drawAll();
  PlaySE(6 /* SE_WIN_OPEN */);
}

export function CloseBagScreen(): void {
  if (!_isOpen) return;
  _isOpen = false;
  if (_headerWid >= 0) {
    ClearStdWindowAndFrame(_headerWid, true);
    RemoveWindow(_headerWid);
    _headerWid = -1;
  }
  if (_listWid >= 0) {
    ClearStdWindowAndFrame(_listWid, true);
    RemoveWindow(_listWid);
    _listWid = -1;
  }
  if (_descWid >= 0) {
    ClearStdWindowAndFrame(_descWid, true);
    RemoveWindow(_descWid);
    _descWid = -1;
  }
  const cb = _onClose;
  _onClose = null;
  cb?.();
}

/** Drive depuis le tick start-menu. Lit gMain.newKeys et navigue.
 *  Caller doit consume les keys après cet appel. */
export function TickBagScreen(newKeys: number): void {
  if (!_isOpen) return;
  // Constants 1:1 décomp gba/io_reg.h.
  const KEY_A = 0x0001;
  const KEY_B = 0x0002;
  const KEY_RIGHT = 0x0010;
  const KEY_LEFT = 0x0020;
  const KEY_UP = 0x0040;
  const KEY_DOWN = 0x0080;
  const KEY_START = 0x0008;

  const items = _currentPocketItems();

  if (newKeys & (KEY_B | KEY_START)) {
    PlaySE(5 /* SE_SELECT */);
    CloseBagScreen();
    return;
  }
  if (newKeys & KEY_RIGHT) {
    _pocketIdx = (_pocketIdx + 1) % POCKETS.length;
    _cursorPos = 0;
    _scrollOffset = 0;
    PlaySE(5);
    _drawAll();
    return;
  }
  if (newKeys & KEY_LEFT) {
    _pocketIdx = (_pocketIdx - 1 + POCKETS.length) % POCKETS.length;
    _cursorPos = 0;
    _scrollOffset = 0;
    PlaySE(5);
    _drawAll();
    return;
  }
  if (newKeys & KEY_DOWN) {
    if (items.length === 0) return;
    const totalIdx = _scrollOffset + _cursorPos;
    if (totalIdx >= items.length - 1) return;
    if (_cursorPos < VISIBLE_ROWS - 1) {
      _cursorPos++;
    } else {
      _scrollOffset++;
    }
    PlaySE(5);
    _drawList();
    _drawDesc();
    return;
  }
  if (newKeys & KEY_UP) {
    if (items.length === 0) return;
    if (_cursorPos > 0) {
      _cursorPos--;
    } else if (_scrollOffset > 0) {
      _scrollOffset--;
    } else {
      return;
    }
    PlaySE(5);
    _drawList();
    _drawDesc();
    return;
  }
  if (newKeys & KEY_A) {
    const itemKey = _selectedItemKey();
    if (!itemKey) return;
    PlaySE(5);
    // Phase 6+ : real use logic (Use/Give/Toss). Pour l'instant : log + flash msg.
    console.log(`[bag-screen] use ${itemKey} — TODO Phase 6+ (use/give/toss menu)`);
    // Pas de feedback visuel pour le moment, juste consume le key.
    return;
  }
}
