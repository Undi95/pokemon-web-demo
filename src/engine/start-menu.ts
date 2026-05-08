/**
 * start-menu.ts — Menu Start overworld (= 1:1 décomp `src/start_menu.c`).
 *
 * MVP Phase 4.10 (sans Pokedex/Pokemon, user request session 119) :
 *   - SAC (= placeholder dialog "Indisponible")
 *   - {PLAYER} (= placeholder dialog "Indisponible")
 *   - SAUVER (= save manuel via gameState.save())
 *   - OPTIONS (= placeholder dialog "Indisponible")
 *   - RETOUR (= close menu)
 *
 * Triggered par START button (= 0x08, mappé à Enter/Space/B sur clavier).
 * Lock player input pendant que le menu est ouvert (= 1:1 décomp via
 * LockPlayerFieldControls).
 *
 * Source de vérité décomp :
 *   - `src/start_menu.c` (CB2_StartMenu, BuildStartMenuActions, sStartMenuItems)
 *   - `src/menu.c` (CreateStartMenuWindow, GetStartMenuWindowId)
 *   - `src/strings.c` (gText_MenuSave, gText_MenuOption, etc.)
 *
 * Architecture : reuse existing `gba-menu-system` cursor logic + `gba-window-system`
 * draw helpers. Pas de full task system (= simple state machine sync).
 */

import {
  AddWindow, RemoveWindow, DrawStdFrameWithCustomTileAndPalette,
  ClearStdWindowAndFrame,
  type WindowTemplate,
} from './gba-window-system';
import { LoadUserWindowBorderGfx } from './gba-text-window';
import { AddTextPrinterParameterized3 } from './gba-text-system';
import { LockPlayerFieldControls, UnlockPlayerFieldControls, ScriptContext_IsEnabled } from './script-runtime';
import { ShowFieldMessage, IsFieldMessageBoxHidden, HideFieldMessageBox } from './field-message-box';
import { PlaySE } from './decomp-globals';
import * as Songs from './decomp-data/auto/include/constants/songs-data';
import { gameState } from './game-state';
import { getRuntime } from './decomp-globals';

// ─── Types + state ───────────────────────────────────────────────────────────

interface MenuItem {
  /** Texte affiché (= déjà résolu en FR, pas de placeholder à expand). */
  label: string;
  /** Action handler. Return true si le menu doit se fermer après. */
  onSelect: () => boolean;
}

let sIsOpen = false;
let sWindowId = -1;
let sCursorPos = 0;
let sItems: MenuItem[] = [];
/** Sub-state : 0 = menu input, 1 = waiting save dialog, 2 = waiting placeholder dialog */
let sSubState: 'menu' | 'save_confirm' | 'placeholder' = 'menu';

// ─── Constants 1:1 décomp ────────────────────────────────────────────────────

const SE_SELECT = 5;        // 1:1 décomp constants/songs.h SE_SELECT
const SE_WIN_OPEN = 6;      // SE_WIN_OPEN = "menu open" sound
const A_BUTTON = 0x01;
const B_BUTTON = 0x02;
const START_BUTTON = 0x08;
const DPAD_UP = 0x40;
const DPAD_DOWN = 0x80;

/** Window template : top-right corner, 7 tiles wide, hauteur dynamique.
 *  - paletteNum 13 = std user window border (= 1:1 décomp BG_PLTT_ID(13) used
 *    par option_menu, start_menu, etc. = palette du frame style sélectionné).
 *  - baseBlock 0x200 = AVOID overlap avec :
 *    - Dialog box pixel buffer (= 0x194..0x1FF, soit tiles 404..511).
 *    - BG2 tilemap qui démarre à VRAM[0xE000] (= byte offset 0x6000 en BG0
 *      charBase 2 → tile 0x300 INTERDIT, on doit rester < 0x300).
 *  - Le pixel buffer du menu prend ~70 tiles (= 7×10) à partir de 0x200, donc
 *    finit à ~0x246, bien sous 0x300. */
const STD_FRAME_PALETTE_NUM = 13;
/** Base tile pour les 9 tiles du std user window border. Doit être hors de la
 *  zone du dialog box (= DLG_WINDOW_BASE_TILE_NUM 0xFC + 14 tiles = 0x10A). */
const STD_FRAME_BASE_TILE = 0x10A;

function buildWindowTemplate(numItems: number): WindowTemplate {
  return {
    bg: 0,
    tilemapLeft: 22,        // = pixel x 176, leaves 22 tiles for game view
    tilemapTop: 1,
    width: 7,
    height: numItems * 2,   // 2 tiles per item (= 16 px)
    paletteNum: STD_FRAME_PALETTE_NUM,
    baseBlock: 0x200,
  };
}

// ─── Cursor ──────────────────────────────────────────────────────────────────

const CURSOR_CHAR = '▶';
const CURSOR_X = 0;
const CURSOR_Y_PER_ROW = 16;

function drawCursor(): void {
  if (sWindowId < 0) return;
  AddTextPrinterParameterized3(
    sWindowId, 1 /* FONT_NORMAL */,
    CURSOR_X, 1 + sCursorPos * CURSOR_Y_PER_ROW,
    [1, 2, 3], 255 /* TEXT_SKIP_DRAW */, CURSOR_CHAR,
  );
}

// ─── Build items list ────────────────────────────────────────────────────────

function showPlaceholderDialog(featureName: string): boolean {
  ShowFieldMessage(`${featureName} indisponible$`);
  sSubState = 'placeholder';
  return false; // Don't close menu yet — wait for dialog to finish.
}

function buildItems(): MenuItem[] {
  return [
    {
      label: 'SAC',
      onSelect: () => showPlaceholderDialog('SAC'),
    },
    {
      // {PLAYER} = nom du joueur depuis gameState.
      label: gameState.playerName,
      onSelect: () => showPlaceholderDialog('Carte dresseur'),
    },
    {
      label: 'SAUVER',
      onSelect: () => {
        // Save immédiat + show confirmation.
        gameState.save();
        ShowFieldMessage('Partie sauvegardée!$');
        sSubState = 'save_confirm';
        return false; // Don't close yet — wait for confirmation dialog.
      },
    },
    {
      label: 'OPTIONS',
      onSelect: () => showPlaceholderDialog('OPTIONS'),
    },
    {
      label: 'RETOUR',
      onSelect: () => true, // Close menu.
    },
  ];
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function IsStartMenuOpen(): boolean {
  return sIsOpen;
}

/** Ouvre le start menu : create window, draw frame, populate items, lock input. */
export function OpenStartMenu(): void {
  if (sIsOpen) return;
  sItems = buildItems();
  sCursorPos = 0;
  sSubState = 'menu';
  const tmpl = buildWindowTemplate(sItems.length);
  sWindowId = AddWindow(tmpl);
  // 1:1 décomp `LoadUserWindowBorderGfx_(0, baseTile, BG_PLTT_ID(13))`. Charge
  // le std window border (= frame style sélectionné par user dans options) à
  // baseTile dans BG0 VRAM + sa palette à BG palette 13. PAS le dialog frame.
  LoadUserWindowBorderGfx(0, STD_FRAME_BASE_TILE, STD_FRAME_PALETTE_NUM * 16);
  // 1:1 décomp `DrawStdFrameWithCustomTileAndPalette` : 9 tiles autour du window
  // (= TL/T/TR/L/R/BL/B/BR + interior fill).
  DrawStdFrameWithCustomTileAndPalette(sWindowId, true, STD_FRAME_BASE_TILE, STD_FRAME_PALETTE_NUM);

  // Draw items + cursor.
  for (let i = 0; i < sItems.length; i++) {
    AddTextPrinterParameterized3(
      sWindowId, 1 /* FONT_NORMAL */,
      8, 1 + i * CURSOR_Y_PER_ROW,
      [1, 2, 3], 255 /* TEXT_SKIP_DRAW */, sItems[i].label,
    );
  }
  drawCursor();

  // Lock player input (= 1:1 décomp `LockPlayerFieldControls`).
  LockPlayerFieldControls();
  sIsOpen = true;

  // SE_WIN_OPEN — son d'ouverture menu.
  const seOpen = (Songs as unknown as Record<string, number>).SE_WIN_OPEN ?? SE_WIN_OPEN;
  PlaySE(seOpen);
  console.log('[start-menu] opened');
}

/** Ferme le start menu : destroy window, unlock input. */
export function CloseStartMenu(): void {
  if (!sIsOpen) return;
  if (sWindowId >= 0) {
    ClearStdWindowAndFrame(sWindowId, true);
    RemoveWindow(sWindowId);
    sWindowId = -1;
  }
  UnlockPlayerFieldControls();
  sIsOpen = false;
  sSubState = 'menu';
  console.log('[start-menu] closed');
}

/** Tick called per-frame depuis MainCB2_Overworld.
 *  - Si menu fermé : check START button → ouvrir.
 *  - Si menu ouvert : handle navigation/selection input.
 *  - Si sub-state save_confirm/placeholder : attend que le dialog finisse, puis revient au menu. */
export function TickStartMenu(): void {
  const rt = getRuntime();
  if (!rt) return;
  const newKeys = rt.gMain.newKeys;

  if (!sIsOpen) {
    // Menu fermé : check START press pour ouvrir. MAIS skip si :
    //   - Un script est en cours (= cinematic, dialog player-driven).
    //   - Le field message box est visible (= dialog en cours).
    if (newKeys & START_BUTTON) {
      if (ScriptContext_IsEnabled()) return;
      if (!IsFieldMessageBoxHidden()) return;
      OpenStartMenu();
    }
    return;
  }

  // Menu ouvert.
  if (sSubState === 'placeholder' || sSubState === 'save_confirm') {
    // En attente du dialog. Quand le dialog est hidden + A press, revient au menu (ou close).
    if (IsFieldMessageBoxHidden()) {
      // Dialog n'a pas encore été visible (= state pas encore atteint). Skip.
      return;
    }
    // Dialog visible. Si le printer est done + user presses A/B, le hide.
    // Actually la field-message-box transition automatically vers HIDDEN après printer done.
    // On peut juste check si user appuie A/B pour close + revenir au menu.
    if (newKeys & (A_BUTTON | B_BUTTON)) {
      // Hide dialog explicit + revenir au menu.
      HideFieldMessageBox();
      sSubState = 'menu';
      // Si c'était save_confirm, on close le menu après. Sinon on revient au menu.
      if (newKeys & A_BUTTON) {
        // A press post-save_confirm → close menu (= 1:1 décomp save flow).
        // Pour placeholder, A press → revient au menu.
        // On garde le menu open dans tous les cas pour simplicité.
      }
    }
    return;
  }

  // Sub-state 'menu' : handle navigation.
  if (newKeys & B_BUTTON) {
    PlaySE(SE_SELECT);
    CloseStartMenu();
    return;
  }
  if (newKeys & START_BUTTON) {
    PlaySE(SE_SELECT);
    CloseStartMenu();
    return;
  }
  if (newKeys & A_BUTTON) {
    PlaySE(SE_SELECT);
    const item = sItems[sCursorPos];
    if (item) {
      const shouldClose = item.onSelect();
      if (shouldClose) CloseStartMenu();
    }
    return;
  }
  if (newKeys & DPAD_UP) {
    if (sCursorPos > 0) {
      sCursorPos--;
      // Redraw : clear ALL items + redraw with new cursor.
      // Simpler : redraw cursor only (ancien sera effacé par fillWindowPixelBuffer overlap).
      // Pour MVP, redraw the whole menu.
      _redrawMenu();
      PlaySE(SE_SELECT);
    }
  }
  if (newKeys & DPAD_DOWN) {
    if (sCursorPos < sItems.length - 1) {
      sCursorPos++;
      _redrawMenu();
      PlaySE(SE_SELECT);
    }
  }
}

/** Redraw window content après un cursor move. */
function _redrawMenu(): void {
  if (sWindowId < 0) return;
  // Re-draw frame (= clears + redraws).
  // 1:1 décomp `LoadUserWindowBorderGfx_(0, baseTile, BG_PLTT_ID(13))`. Charge
  // le std window border (= frame style sélectionné par user dans options) à
  // baseTile dans BG0 VRAM + sa palette à BG palette 13. PAS le dialog frame.
  LoadUserWindowBorderGfx(0, STD_FRAME_BASE_TILE, STD_FRAME_PALETTE_NUM * 16);
  // 1:1 décomp `DrawStdFrameWithCustomTileAndPalette` : 9 tiles autour du window
  // (= TL/T/TR/L/R/BL/B/BR + interior fill).
  DrawStdFrameWithCustomTileAndPalette(sWindowId, true, STD_FRAME_BASE_TILE, STD_FRAME_PALETTE_NUM);
  for (let i = 0; i < sItems.length; i++) {
    AddTextPrinterParameterized3(
      sWindowId, 1 /* FONT_NORMAL */,
      8, 1 + i * CURSOR_Y_PER_ROW,
      [1, 2, 3], 255 /* TEXT_SKIP_DRAW */, sItems[i].label,
    );
  }
  drawCursor();
}

// ─── Debug exposure ─────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).startMenu = {
    open: OpenStartMenu,
    close: CloseStartMenu,
    isOpen: IsStartMenuOpen,
  };
}
