/**
 * trainer-card-screen.ts — UI Carte Dresseur quasi-1:1 décomp `src/trainer_card.c`.
 *
 * Affiche les stats du joueur :
 *   - Nom + sexe + ID dresseur
 *   - Money (= gameState.money)
 *   - Play time (= gSaveBlock2Ptr.playTimeHours/Minutes)
 *   - Pokédex count (= seen/caught)
 *   - Badges (= 8 flags FLAG_BADGE0X_GET)
 *   - Nb POKéMON capturés (gSaveBlock2Ptr.gameStats[GAME_STAT_POKEMON_CAUGHT])
 *
 * Inputs : A/B/START → close
 *
 * Polish visuel pixel-perfect (sprite trainer + frame orange + tilemap fond)
 * = étape 2 future. Pour l'instant : windows GBA + texte FR.
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
import { FlagGet } from './script-vars';
import { gSaveBlock2Ptr } from './gba-menu-system';
import { PlaySE } from './decomp-globals';

const FONT_NORMAL = 1;
const TEXT_SKIP_DRAW = 255;
const COLOR_MAIN: [number, number, number] = [1, 2, 3];
const STD_FRAME_TILE = 0x214;
const STD_FRAME_PAL = 14;

const CARD_WINDOW_TEMPLATE: WindowTemplate = {
  bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 28, height: 17,
  paletteNum: STD_FRAME_PAL, baseBlock: 0x1,
};

let _isOpen = false;
let _wid = -1;
let _onClose: (() => void) | null = null;

function _draw(): void {
  if (_wid < 0) return;
  FillWindowPixelBuffer(_wid, 0x11);
  const sb2 = (gSaveBlock2Ptr ?? {}) as {
    playTimeHours?: number; playTimeMinutes?: number;
    playerTrainerId?: number[];
    gameStats?: Record<string, number>;
  };
  const name = gameState.playerName ?? 'PLAYER';
  const gender = gameState.gender === 'FEMALE' ? 'FILLE' : 'GARÇON';
  const money = (gameState as unknown as { money?: number }).money ?? 0;
  const partySize = gameState.party.length;
  const hours = sb2.playTimeHours ?? 0;
  const minutes = sb2.playTimeMinutes ?? 0;

  // Trainer ID : décomp utilise les 2 premiers bytes pour l'affichage public.
  const tidArr = sb2.playerTrainerId ?? [0, 0, 0, 0];
  const tid = ((tidArr[1] ?? 0) << 8) | (tidArr[0] ?? 0);

  // Badges count.
  let badges = 0;
  for (let i = 1; i <= 8; i++) {
    const fname = `FLAG_BADGE0${i}_GET`;
    if (FlagGet(fname)) badges++;
  }

  // Pokédex count via flags FLAG_POKEDEX_*_CAUGHT.
  const allFlags = (gameState as unknown as { getAllFlagNames?: () => string[] })
    .getAllFlagNames?.() ?? [];
  let dexCaught = 0;
  for (const f of allFlags) {
    if (f.endsWith('_CAUGHT')) dexCaught++;
  }

  // Title.
  AddTextPrinterParameterized3(_wid, FONT_NORMAL, 4, 4, COLOR_MAIN, TEXT_SKIP_DRAW, 'CARTE DE DRESSEUR');
  // Lines.
  const lines: Array<[string, string]> = [
    ['Nom', name],
    ['Sexe', gender],
    ['No. ID', String(tid).padStart(5, '0')],
    ['Argent', `${money}P`],
    ['POKéMON', `${partySize}/6`],
    ['POKéDEX', `${dexCaught} captures`],
    ['Badges', `${badges}/8`],
    ['Durée', `${hours}h ${String(minutes).padStart(2, '0')}m`],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [k, v] = lines[i];
    const y = 26 + i * 14;
    AddTextPrinterParameterized3(_wid, FONT_NORMAL, 8, y, COLOR_MAIN, TEXT_SKIP_DRAW, k);
    AddTextPrinterParameterized3(_wid, FONT_NORMAL, 100, y, COLOR_MAIN, TEXT_SKIP_DRAW, v);
  }
  // Footer.
  AddTextPrinterParameterized3(
    _wid, FONT_NORMAL, 8, 26 + lines.length * 14 + 8,
    COLOR_MAIN, TEXT_SKIP_DRAW,
    'A / B : retour menu',
  );
  PutWindowTilemap(_wid);
  CopyWindowToVram(_wid, 3);
}

export function IsTrainerCardScreenOpen(): boolean {
  return _isOpen;
}

export function OpenTrainerCardScreen(onClose: () => void): void {
  if (_isOpen) return;
  _isOpen = true;
  _onClose = onClose;
  LoadUserWindowBorderGfx(0, STD_FRAME_TILE, STD_FRAME_PAL * 16);
  _wid = AddWindow(CARD_WINDOW_TEMPLATE);
  DrawStdFrameWithCustomTileAndPalette(_wid, true, STD_FRAME_TILE, STD_FRAME_PAL);
  _draw();
  PlaySE(6);
}

export function CloseTrainerCardScreen(): void {
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

export function TickTrainerCardScreen(newKeys: number): void {
  if (!_isOpen) return;
  const KEY_A = 0x0001;
  const KEY_B = 0x0002;
  const KEY_START = 0x0008;
  if (newKeys & (KEY_A | KEY_B | KEY_START)) {
    PlaySE(5);
    CloseTrainerCardScreen();
  }
}
