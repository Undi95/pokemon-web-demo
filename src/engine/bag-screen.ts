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
  CopyWindowToVram, BlitBitmapToWindow, ShowBg, HideBg, InitBgFromTemplate,
  type WindowTemplate,
} from './gba-window-system';
import { LoadUserWindowBorderGfx } from './gba-text-window';
import { AddTextPrinterParameterized3 } from './gba-text-system';
import { gameState } from './game-state';
import { getItem, getItemNameFr, getItemDescriptionFr } from './data-tables';
import { PlaySE, LoadPalette, getRuntime } from './decomp-globals';
import { loadIndexedPngStrict, loadGbaPal, loadTilemapBin, loadTileBin } from './gba/png-loader';
import { setFieldCameraSuspended } from './field-camera';

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
 *  Position : dans le sac, aux coordonnées du décomp item_menu.c (= sur le sprite sac
 *  affichée à env. (8, 64) → tilemapLeft=1, tilemapTop=8). */
const ITEM_ICON_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 0, tilemapLeft: 5, tilemapTop: 11, width: 3, height: 3,
  // baseBlock 0x300 = après sprite (0x250..). Évite collision avec sprite entries.
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

// ─── Module state ────────────────────────────────────────────────────────────

let _isOpen = false;
let _pocketIdx = 0;
let _cursorPos = 0;     // 0..VISIBLE_ROWS-1, position du cursor dans la fenêtre
let _scrollOffset = 0;  // index du 1er item visible
let _spriteWid = -1;
let _headerWid = -1;
let _listWid = -1;
let _descWid = -1;
let _itemIconWid = -1;
let _onClose: (() => void) | null = null;
/** Cache des item icons chargés pour pas re-fetch chaque scroll. */
const _itemIconCache: Record<string, { charData: Uint8Array; palette: Uint16Array }> = {};
/** Item key actuellement loadé dans la window icon (= évite re-load redondant). */
let _loadedIconKey: string | null = null;

/** Hook _syncSubspriteOam saved au open pour restore au close.
 *  Pendant que bag est open, on overrides ce hook pour hide tous les OAM
 *  (= 1:1 effet `CpuFill32(0, OAM, OAM_SIZE)` du décomp ResetVramOamAndBgCntRegs). */
let _savedSyncSubspriteHook: unknown = undefined;

// Save overworld BG2 state pour restore au close.
let _savedBgState: {
  charBase?: number; mapBase?: number;
  priority?: number; screenSize?: number;
  visible?: boolean;
  hofs?: number; vofs?: number;
  vramSnap?: Uint8Array; // snapshot VRAM range bag occupy (= restore au close)
  /** Snapshot des 16 u16 du sub-palette 0 BG_PLTT (= overworld metatile 0
   *  palette). On clobbe sub-palette 0 avec menu_male.pal, donc save pour
   *  restore au close. */
  paletteSnap?: Uint16Array;
} | null = null;

// ─── Assets (lazy-loaded au 1er Open) ────────────────────────────────────────

interface BagAssets {
  bagSprite: { charData: Uint8Array; palette: Uint16Array };
  selectButton: { charData: Uint8Array; palette: Uint16Array };
  rotatingBall: { charData: Uint8Array; palette: Uint16Array };
  /** Background tilemap fond rayé (= rayures rose/mauve du décomp).
   *  menu.png = 64 bytes/tile × N tiles = ~17 tiles 4bpp.
   *  menu.bin = 1024 u16 = 32×32 tilemap (bg screen size 0).
   *  menu_male.pal / menu_female.pal = 16 colors palette du tilemap. */
  bgTiles: Uint8Array;
  bgTilemap: Uint16Array;
  bgPalette: Uint16Array;
}

let _assets: BagAssets | null = null;
let _assetsLoading: Promise<BagAssets> | null = null;

async function _loadAssets(): Promise<BagAssets> {
  if (_assets) return _assets;
  if (_assetsLoading) return _assetsLoading;
  _assetsLoading = (async () => {
    const gender = gameState.gender === 'FEMALE' ? 'female' : 'male';
    const [bag, button, ball, bgTilesRaw, bgTilemap, bgPal] = await Promise.all([
      loadIndexedPngStrict(`/decomp/em/bag/bag_${gender}.png`, 4),
      loadIndexedPngStrict('/decomp/em/bag/select_button.png', 4),
      loadIndexedPngStrict('/decomp/em/bag/rotating_ball.png', 4),
      // menu.4bpp.bin = raw 4bpp tile data (= 1:1 décomp `gBagScreen_Gfx`).
      // Sans remapping canvas → indices BRUTS qui matchent menu_male.pal.
      loadTileBin('/decomp/em/bag/menu.png', 4),
      // menu.bin = tilemap u16 du fond (32×32 = 1024 entries) — 1:1 décomp
      // `gBagScreen_GfxTileMap`. Déjà décompressé.
      loadTilemapBin('/decomp/em/bag/menu.bin'),
      // menu_male.pal / menu_female.pal = palette 32 colors du fond (= 2
      // sub-palettes). 1:1 décomp `LoadCompressedPalette(gBagScreen{Male,Female}_Pal,
      // BG_PLTT_ID(0), 2 * PLTT_SIZE_4BPP)`.
      loadGbaPal(`/decomp/em/bag/menu_${gender}.pal`),
    ]);
    _assets = {
      bagSprite: { charData: bag.charData, palette: bag.palette },
      selectButton: { charData: button.charData, palette: button.palette },
      rotatingBall: { charData: ball.charData, palette: ball.palette },
      bgTiles: bgTilesRaw,  // raw 4bpp bytes, indices bruts du décomp
      bgTilemap: bgTilemap,
      bgPalette: bgPal,
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

function _currentPocketItems(): ItemSlot[] {
  const bag = gameState.bag as unknown as Record<string, ItemSlot[]>;
  const k = POCKETS[_pocketIdx].key;
  const slots = bag[k] ?? [];
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
  if (_spriteWid < 0 || !_assets) return;
  FillWindowPixelBuffer(_spriteWid, 0x00);
  // Bag sprite : 64×64 (= 8×8 tiles, le sac complet rempli sur tout le sprite).
  // Position centrée dans la window 96×96 → x=16, y=16 pour center.
  // src width = 64 px (= 8 tiles × 8 px).
  BlitBitmapToWindow(_spriteWid, _assets.bagSprite.charData, 16, 16, 64, 64, 64);
  PutWindowTilemap(_spriteWid);
  CopyWindowToVram(_spriteWid, 3);
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
  // 1:1 décomp PrintPocketNames : print pocket name centered in 8×2 tiles window
  // (= 64×16 px). Texte centered horizontalement.
  FillWindowPixelBuffer(_headerWid, 0x00);
  // Texte centered : 8 tiles × 8 px = 64 px. Pour center un texte ~50 px, x≈8.
  // Décomp utilise GetStringCenterAlignXOffset, on simplifie par offset fixe.
  AddTextPrinterParameterized3(
    _headerWid, FONT_NORMAL, 0, 1, COLOR_MAIN, TEXT_SKIP_DRAW,
    POCKETS[_pocketIdx].label,
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
    const cursor = (i === _cursorPos) ? '>' : ' ';
    if (slot.itemKey === CLOSE_BAG_KEY) {
      // 1:1 décomp gText_CloseBag = "FERMER LE SAC", sans quantité.
      AddTextPrinterParameterized3(
        _listWid, FONT_NORMAL, 4, 1 + i * 16, COLOR_MAIN, TEXT_SKIP_DRAW,
        `${cursor}FERMER LE SAC`,
      );
      continue;
    }
    const name = getItemNameFr(slot.itemKey);
    const qty = slot.quantity;
    AddTextPrinterParameterized3(
      _listWid, FONT_NORMAL, 4, 1 + i * 16, COLOR_MAIN, TEXT_SKIP_DRAW,
      `${cursor}${name}`,
    );
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
    // 1:1 décomp : sur FERMER LE SAC, description = "Retourner au jeu."
    AddTextPrinterParameterized3(_descWid, FONT_NORMAL, TEXT_LEFT, 1, COLOR_MAIN, TEXT_SKIP_DRAW, 'Retourner au jeu.');
    PutWindowTilemap(_descWid);
    CopyWindowToVram(_descWid, 3);
    return;
  }
  if (itemKey) {
    const def = getItem(itemKey);
    const desc = def?.descriptionLabel ? getItemDescriptionFr(def.descriptionLabel) : '';
    if (desc) {
      const lines = _wrap(desc, 28);
      for (let i = 0; i < Math.min(lines.length, 3); i++) {
        AddTextPrinterParameterized3(
          _descWid, FONT_NORMAL, TEXT_LEFT, 1 + i * 14, COLOR_MAIN, TEXT_SKIP_DRAW, lines[i],
        );
      }
    } else {
      const fallbackParts = [];
      if (def?.price && def.price > 0) fallbackParts.push(`Prix: ${def.price}`);
      const txt = fallbackParts.length > 0 ? fallbackParts.join('  ') : 'Pas de description.';
      AddTextPrinterParameterized3(_descWid, FONT_NORMAL, TEXT_LEFT, 1, COLOR_MAIN, TEXT_SKIP_DRAW, txt);
    }
  } else {
    AddTextPrinterParameterized3(
      _descWid, FONT_NORMAL, TEXT_LEFT, 1, COLOR_MAIN, TEXT_SKIP_DRAW,
      'Aucun objet dans cette poche.',
    );
    AddTextPrinterParameterized3(
      _descWid, FONT_NORMAL, TEXT_LEFT, 17, COLOR_MAIN, TEXT_SKIP_DRAW,
      'B : retour menu',
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
  _drawSprite();
  _drawHeader();
  _drawList();
  _drawDesc();
  _drawItemIcon();
}

/** Convertit ITEM_KEY → filename slug pour /decomp/em/items/icons/.
 *  ITEM_POKE_BALL → poke_ball
 *  ITEM_POTION → potion
 *  ITEM_FULL_HEAL → full_heal */
function _itemIconUrlBase(itemKey: string): string {
  const slug = itemKey.replace(/^ITEM_/, '').toLowerCase();
  return `/decomp/em/items/icons/${slug}`;
}

/** Charge async l'icône de l'item sélectionné dans une cache, puis la draw.
 *  Idempotent : si même item déjà loadé, juste re-blit. */
async function _ensureItemIconLoaded(itemKey: string): Promise<void> {
  if (_itemIconCache[itemKey]) return;
  try {
    const base = _itemIconUrlBase(itemKey);
    const png = await loadIndexedPngStrict(`${base}.png`, 4);
    _itemIconCache[itemKey] = { charData: png.charData, palette: png.palette };
  } catch (e) {
    // Item icon manquant : on ignore (= window restera vide pour cet item).
    console.warn(`[bag-screen] item icon load failed for ${itemKey}`, e);
  }
}

function _drawItemIcon(): void {
  if (_itemIconWid < 0) return;
  FillWindowPixelBuffer(_itemIconWid, 0x00);
  const itemKey = _selectedItemKey();
  // CLOSE_BAG_KEY = pas d'icon item, juste vide (= 1:1 décomp shows BAG_CLOSE icon
  // mais pour l'instant on skip — Phase 2+ load select_button.png ici).
  if (!itemKey || itemKey === CLOSE_BAG_KEY) {
    PutWindowTilemap(_itemIconWid);
    CopyWindowToVram(_itemIconWid, 3);
    return;
  }
  const icon = _itemIconCache[itemKey];
  if (!icon) {
    // Pas encore chargé : fire async load + redraw quand done.
    void _ensureItemIconLoaded(itemKey).then(() => {
      // Ré-appel _drawItemIcon une fois loadé. Idempotent.
      if (_isOpen && _selectedItemKey() === itemKey) {
        _drawItemIcon();
      }
    });
    PutWindowTilemap(_itemIconWid);
    CopyWindowToVram(_itemIconWid, 3);
    return;
  }
  // Charge la palette de l'item dans son slot dédié, puis blit le sprite.
  if (_loadedIconKey !== itemKey) {
    LoadPalette(icon.palette, ITEM_ICON_PAL * 16, icon.palette.length * 2);
    _loadedIconKey = itemKey;
  }
  // Item icons sont 24×24 px (3×3 tiles).
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
 *  Si les assets ne sont pas encore chargés, on les load async puis on draw
 *  le sprite. Les windows text marchent déjà sans assets — UX dégradée OK. */
export function OpenBagScreen(onClose: () => void): void {
  if (_isOpen) return;
  _isOpen = true;
  _pocketIdx = 0;
  _cursorPos = 0;
  _scrollOffset = 0;
  _onClose = onClose;

  // 1:1 décomp pattern start_menu.c — BG 0 + STD frame tiles.
  LoadUserWindowBorderGfx(0, STD_FRAME_TILE, STD_FRAME_PAL * 16);

  // Sprite window pour le sac (= no frame border, juste le pixel buffer).
  _spriteWid = AddWindow(SPRITE_WINDOW_TEMPLATE);
  _headerWid = AddWindow(HEADER_WINDOW_TEMPLATE);
  _listWid = AddWindow(LIST_WINDOW_TEMPLATE);
  _descWid = AddWindow(DESC_WINDOW_TEMPLATE);
  _itemIconWid = AddWindow(ITEM_ICON_WINDOW_TEMPLATE);

  // Frames sur header / list / desc — pas sur sprite ni icon (= sprites doivent
  // être visibles sans frame autour, comme dans le ROM).
  DrawStdFrameWithCustomTileAndPalette(_headerWid, true, STD_FRAME_TILE, STD_FRAME_PAL);
  DrawStdFrameWithCustomTileAndPalette(_listWid, true, STD_FRAME_TILE, STD_FRAME_PAL);
  DrawStdFrameWithCustomTileAndPalette(_descWid, true, STD_FRAME_TILE, STD_FRAME_PAL);

  // Just put + copy les sprite windows (pas de frame).
  PutWindowTilemap(_spriteWid);
  PutWindowTilemap(_itemIconWid);

  // Async : load assets puis setup BG fond + draw sprite. Les autres draw
  // marchent déjà sans assets (text-only).
  _drawHeader();
  _drawList();
  _drawDesc();
  void _loadAssets().then((assets) => {
    _setupBackgroundTilemap(assets);
    // Load la palette du sac dans son slot custom (= 13 × 16 = offset 208).
    LoadPalette(assets.bagSprite.palette, BAG_SPRITE_PAL * 16, 32);
    // Re-render avec les sprites.
    _drawAll();
  }).catch((e) => {
    console.warn('[bag-screen] failed to load bag assets', e);
  });

  PlaySE(6 /* SE_WIN_OPEN */);
}

/** Setup BG2 pour render le tilemap fond menu.bin du décomp.
 *  Save l'état overworld BG2 d'abord pour restore au close.
 *
 *  Layout VRAM 1:1 décomp item_menu.c :
 *    - tile data (menu.png 4bpp) → VRAM offset BAG_BG_CHAR_BASE * 0x4000
 *    - tilemap (menu.bin u16) → VRAM offset BAG_BG_MAP_BASE * 0x800
 *    - palette (menu_male.pal) → BG_PLTT[0] (= sub-palette 0, ce que ref menu.bin)
 *
 *  ⚠️ menu.bin a paletteIdx=0 dans bits 12-15 (= sub-palette 0). On doit donc
 *  charger menu_male.pal à l'offset 0 du BG_PLTT. Ça clobbe la palette
 *  overworld metatile 0, qu'on snapshot pour restore au close. */
function _setupBackgroundTilemap(assets: BagAssets): void {
  const rt = getRuntime();
  if (!rt) return;
  const bg2 = rt.gba.bg(BAG_BG_LAYER);
  const cfg = bg2.config;

  // Save overworld BG2 state pour restore au close.
  // VRAM snap range = char data + tilemap + BG0 tilemap (= overworld map data
  // que le décomp clear via CpuFill16(0, VRAM, VRAM_SIZE) dans
  // ResetVramOamAndBgCntRegs).
  const charOff = BAG_BG_CHAR_BASE * 0x4000;
  const mapOff = BAG_BG_MAP_BASE * 0x800;
  const bg0MapOff = 31 * 0x800;  // BG0 mapBase 31 = overworld map tilemap
  const charLen = 0x4000;
  const mapLen = 0x800;
  const bg0MapLen = 0x800;
  const vramSnap = new Uint8Array(charLen + mapLen + bg0MapLen);
  vramSnap.set(rt.gba.vram.subarray(charOff, charOff + charLen), 0);
  vramSnap.set(rt.gba.vram.subarray(mapOff, mapOff + mapLen), charLen);
  vramSnap.set(rt.gba.vram.subarray(bg0MapOff, bg0MapOff + bg0MapLen), charLen + mapLen);

  // Snapshot sub-palette 0 (= 16 u16 = 32 bytes) avant de la clobber.
  // gPlttBufferUnfaded est un Uint16Array indexé par u16.
  const paletteSnap = new Uint16Array(16);
  for (let i = 0; i < 16; i++) {
    paletteSnap[i] = rt.gPlttBufferUnfaded.get?.(i) ?? 0;
  }

  _savedBgState = {
    charBase: cfg.charBase ?? cfg.charBaseIndex ?? 0,
    mapBase: cfg.mapBase ?? cfg.mapBaseIndex ?? 0,
    priority: cfg.priority ?? 0,
    screenSize: cfg.screenSize ?? 0,
    visible: !!cfg.visible,
    hofs: cfg.hofs ?? 0,
    vofs: cfg.vofs ?? 0,
    vramSnap,
    paletteSnap,
  };

  // 1:1 décomp ResetVramOamAndBgCntRegs : clear BG0 tilemap (= overworld map tiles
  // qu'on voit derrière). Notre runtime continue de tick l'overworld qui re-écrit
  // BG0 chaque frame, mais le menu pixel-perfect doit avoir BG0 vide pour les
  // windows seulement. Faut bloquer l'overworld update de BG0 = soit suspendre
  // le redraw map, soit clear BG0 chaque frame.
  // Pour l'instant : clear initial. Le hook _syncSubspriteOam au tick (ajouté
  // plus tôt) va pas suffire — BG0 est re-écrit par DrawWholeMapView.
  rt.gba.vram.fill(0, bg0MapOff, bg0MapOff + bg0MapLen);

  // 1:1 décomp pattern : write tile data + tilemap to VRAM.
  rt.gba.vram.set(assets.bgTiles, charOff);
  // bgTilemap is Uint16Array → write as bytes.
  const tilemapBytes = new Uint8Array(
    assets.bgTilemap.buffer,
    assets.bgTilemap.byteOffset,
    assets.bgTilemap.byteLength,
  );
  rt.gba.vram.set(tilemapBytes, mapOff);

  // Load palette du fond à BG_PLTT[0] (= sub-palette 0, ce que référence menu.bin).
  // Charge les 32 entries (= 2 sub-palettes) du menu_male.pal pour couvrir tout
  // le tilemap. Le tilemap a paletteIdx=0 partout selon notre hex dump.
  LoadPalette(assets.bgPalette, 0, assets.bgPalette.length * 2);
  // ⚠️ menu.png canvas extraction par loadIndexedPngStrict re-mappe les indices
  // selon SA palette PLTE. Si la palette interne du PNG diffère de menu_male.pal,
  // les colors sortent fausses. Pour matching strict, il faudrait soit charger
  // le PNG sans remapping, soit utiliser la palette du PNG. Test : la palette
  // PLTE du PNG matchera probably bien sub-palette 0 de menu_male.pal car le
  // PNG est exporté avec cette même palette. Si pas le cas, à investiguer.

  // Reset BG scroll registers (= 1:1 décomp ChangeBgX/Y BG_COORD_SET 0).
  rt.SetGpuReg(0x14 /* REG_BG2HOFS */, 0);
  rt.SetGpuReg(0x16 /* REG_BG2VOFS */, 0);
  cfg.hofs = 0;
  cfg.vofs = 0;
  // 1:1 décomp pattern : suspend la field camera pour qu'elle ne re-set pas
  // BG2 vofs/hofs chaque frame (= sinon le tilemap fond scroll avec le player).
  setFieldCameraSuspended(true);

  // 1:1 décomp `InitBgFromTemplate` pour notre BG2 bag (sBgTemplates_ItemMenu[2]) :
  //   .bg = 2, .charBaseIndex = 3, .mapBaseIndex = 29,
  //   .screenSize = 0, .paletteMode = 0, .priority = 2, .baseTile = 0
  InitBgFromTemplate({
    bg: BAG_BG_LAYER,
    charBaseIndex: BAG_BG_CHAR_BASE,
    mapBaseIndex: BAG_BG_MAP_BASE,
    screenSize: 0,
    paletteMode: 0,
    priority: 2,  // 1:1 décomp item_menu.c:228 (= behind windows BG0)
    baseTile: 0,
  });

  // Note : le décomp call FillBgTilemapBufferRect_Palette0(2, 17, 14, 2, 15, 16)
  // pour redessiner la zone list après pocket switch (= reset après transition
  // animation tile 11). Mais menu.bin INITIAL contient DEJA tile 17 (= jaune
  // pâle) à cette zone — donc pas besoin de fill au load. Notre tilemap est
  // déjà correct after rt.gba.vram.set(tilemapBytes, mapOff).
  // Hide BG1 et BG3 de l'overworld (= keep BG0 pour les windows). BG2 = notre fond.
  HideBg(1);
  HideBg(3);
  ShowBg(BAG_BG_LAYER);

  // 1:1 décomp menu_helpers.c:ResetVramOamAndBgCntRegs effect :
  //   SetGpuReg(REG_OFFSET_DISPCNT, 0); CpuFill32(0, OAM, OAM_SIZE);
  // → clear OAM hardware (= cache tous sprites overworld).
  //
  // Notre runtime tick continue normalement même quand bag est open (= on swap
  // pas le CB2). Donc syncSpritesToOam re-écrit oam.visible chaque frame. Pour
  // bloquer ça : installer un hook `_syncSubspriteOam` (= déjà utilisé par
  // naming-screen, summary-screen, etc.) qui s'exécute APRÈS syncSpritesToOam
  // et clear tous les OAM. Au close, on retire le hook.
  _savedSyncSubspriteHook = (globalThis as Record<string, unknown>)._syncSubspriteOam;
  (globalThis as Record<string, unknown>)._syncSubspriteOam = () => {
    if (!_isOpen) return;
    const r = getRuntime();
    if (!r) return;
    for (const o of r.gba.oam) {
      o.visible = false;
    }
  };
}

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

/** Restore overworld BG2 state (= avant le bag screen). */
function _teardownBackgroundTilemap(): void {
  const rt = getRuntime();
  if (!rt || !_savedBgState) return;
  const bg2 = rt.gba.bg(BAG_BG_LAYER);
  const cfg = bg2.config;

  // Restore VRAM bytes that we overwrote.
  if (_savedBgState.vramSnap) {
    const charOff = BAG_BG_CHAR_BASE * 0x4000;
    const mapOff = BAG_BG_MAP_BASE * 0x800;
    const bg0MapOff = 31 * 0x800;
    const charLen = 0x4000;
    const mapLen = 0x800;
    const bg0MapLen = 0x800;
    rt.gba.vram.set(_savedBgState.vramSnap.subarray(0, charLen), charOff);
    rt.gba.vram.set(_savedBgState.vramSnap.subarray(charLen, charLen + mapLen), mapOff);
    rt.gba.vram.set(_savedBgState.vramSnap.subarray(charLen + mapLen, charLen + mapLen + bg0MapLen), bg0MapOff);
  }

  // Restore sub-palette 0 (= overworld metatile 0).
  if (_savedBgState.paletteSnap) {
    LoadPalette(_savedBgState.paletteSnap, 0, _savedBgState.paletteSnap.length * 2);
  }

  // Restore BG2 config.
  if (_savedBgState.charBase !== undefined) cfg.charBaseIndex = _savedBgState.charBase;
  if (_savedBgState.mapBase !== undefined) cfg.mapBaseIndex = _savedBgState.mapBase;
  if (_savedBgState.priority !== undefined) cfg.priority = _savedBgState.priority;
  if (_savedBgState.screenSize !== undefined) cfg.screenSize = _savedBgState.screenSize;
  if (_savedBgState.hofs !== undefined) cfg.hofs = _savedBgState.hofs;
  if (_savedBgState.vofs !== undefined) cfg.vofs = _savedBgState.vofs;

  // Re-show overworld BGs.
  ShowBg(1);
  ShowBg(BAG_BG_LAYER);
  ShowBg(3);

  // Restore _syncSubspriteOam hook (= NPCs/player overworld réapparaissent au
  // prochain frame quand syncSpritesToOam re-set oam.visible = !sprite.invisible).
  (globalThis as Record<string, unknown>)._syncSubspriteOam = _savedSyncSubspriteHook;
  _savedSyncSubspriteHook = undefined;

  // Re-active la field camera (= overworld scroll reprend).
  setFieldCameraSuspended(false);

  _savedBgState = null;
}

export function CloseBagScreen(): void {
  if (!_isOpen) return;
  _isOpen = false;
  // Restore overworld BG2 + VRAM AVANT de remove les windows (= sinon les
  // windows hidden + overworld pas restored = écran noir 1 frame).
  _teardownBackgroundTilemap();
  if (_spriteWid >= 0) {
    // Pas de frame on sprite, juste clear + remove.
    FillWindowPixelBuffer(_spriteWid, 0x00);
    PutWindowTilemap(_spriteWid);
    CopyWindowToVram(_spriteWid, 3);
    RemoveWindow(_spriteWid);
    _spriteWid = -1;
  }
  if (_itemIconWid >= 0) {
    FillWindowPixelBuffer(_itemIconWid, 0x00);
    PutWindowTilemap(_itemIconWid);
    CopyWindowToVram(_itemIconWid, 3);
    RemoveWindow(_itemIconWid);
    _itemIconWid = -1;
  }
  _loadedIconKey = null;
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

  // Note : pas besoin de hide les sprites au tick. Le hook _syncSubspriteOam
  // installé au open s'exécute APRÈS syncSpritesToOam chaque frame et clear
  // tous les OAM. Voir _setupBackgroundTilemap.
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
    _drawItemIcon();
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
    _drawItemIcon();
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
    // Phase 6+ : real use logic (Use/Give/Toss). Pour l'instant : log + flash msg.
    console.log(`[bag-screen] use ${itemKey} — TODO Phase 6+ (use/give/toss menu)`);
    return;
  }
}
