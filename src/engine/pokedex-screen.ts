/**
 * pokedex-screen.ts — UI Pokédex quasi-1:1 décomp `src/pokedex.c`.
 *
 * Affiche un compteur Vus / Capturés des 386 Pokémon de la régionale Hoenn.
 * Pas de list des mons individuels pour la 1ère passe (= étape 2 future avec
 * scrollable list + sprites + descriptions FR).
 *
 * Inputs : A/B/START → close
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
import { PlaySE } from './decomp-globals';

const FONT_NORMAL = 1;
const TEXT_SKIP_DRAW = 255;
const COLOR_MAIN: [number, number, number] = [1, 2, 3];
const STD_FRAME_TILE = 0x214;
const STD_FRAME_PAL = 14;

const DEX_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 28, height: 17,
  paletteNum: STD_FRAME_PAL, baseBlock: 0x1,
};

let _isOpen = false;
let _wid = -1;
let _onClose: (() => void) | null = null;

function _draw(): void {
  if (_wid < 0) return;
  FillWindowPixelBuffer(_wid, 0x11);

  // Compteurs via flags FLAG_DEX_FLAG_X_SEEN/CAUGHT.
  const allFlags = (gameState as unknown as { getAllFlagNames?: () => string[] })
    .getAllFlagNames?.() ?? [];
  let seen = 0;
  let caught = 0;
  for (const f of allFlags) {
    if (f.endsWith('_SEEN')) seen++;
    if (f.endsWith('_CAUGHT')) caught++;
  }

  AddTextPrinterParameterized3(_wid, FONT_NORMAL, 4, 4, COLOR_MAIN, TEXT_SKIP_DRAW, 'POKéDEX');
  AddTextPrinterParameterized3(_wid, FONT_NORMAL, 8, 32, COLOR_MAIN, TEXT_SKIP_DRAW, 'POKéMON Hoenn :');
  AddTextPrinterParameterized3(_wid, FONT_NORMAL, 16, 50, COLOR_MAIN, TEXT_SKIP_DRAW, `Vus      : ${seen}`);
  AddTextPrinterParameterized3(_wid, FONT_NORMAL, 16, 64, COLOR_MAIN, TEXT_SKIP_DRAW, `Capturés : ${caught}`);
  AddTextPrinterParameterized3(_wid, FONT_NORMAL, 8, 96, COLOR_MAIN, TEXT_SKIP_DRAW,
    'Statistiques :');
  AddTextPrinterParameterized3(_wid, FONT_NORMAL, 16, 114, COLOR_MAIN, TEXT_SKIP_DRAW,
    `${gameState.party.length} dans ton équipe`);
  AddTextPrinterParameterized3(_wid, FONT_NORMAL, 16, 128, COLOR_MAIN, TEXT_SKIP_DRAW,
    `${seen} en cours d'exploration`);

  // Phase 6+ : list scrollable + sprites + descriptions FR pour chaque mon.
  AddTextPrinterParameterized3(
    _wid, FONT_NORMAL, 8, 160, COLOR_MAIN, TEXT_SKIP_DRAW,
    '(UI complète à venir)',
  );
  AddTextPrinterParameterized3(
    _wid, FONT_NORMAL, 8, 180, COLOR_MAIN, TEXT_SKIP_DRAW,
    'A / B : retour menu',
  );
  PutWindowTilemap(_wid);
  CopyWindowToVram(_wid, 3);
}

export function IsPokedexScreenOpen(): boolean {
  return _isOpen;
}

export function OpenPokedexScreen(onClose: () => void): void {
  if (_isOpen) return;
  _isOpen = true;
  _onClose = onClose;
  LoadUserWindowBorderGfx(0, STD_FRAME_TILE, STD_FRAME_PAL * 16);
  _wid = AddWindow(DEX_WINDOW_TEMPLATE);
  DrawStdFrameWithCustomTileAndPalette(_wid, true, STD_FRAME_TILE, STD_FRAME_PAL);
  _draw();
  PlaySE(6);
}

export function ClosePokedexScreen(): void {
  if (!_isOpen) return;
  _isOpen = false;
  if (_wid >= 0) {
    ClearStdWindowAndFrame(_wid, true);
    RemoveWindow(_wid);
    _wid = -1;
  }
  const cb = _onClose;
  _onClose = null;
  cb?.();
}

export function TickPokedexScreen(newKeys: number): void {
  if (!_isOpen) return;
  const KEY_A = 0x0001;
  const KEY_B = 0x0002;
  const KEY_START = 0x0008;
  if (newKeys & (KEY_A | KEY_B | KEY_START)) {
    PlaySE(5);
    ClosePokedexScreen();
  }
}
