/**
 * battle/battle-yesno-box.ts — Port 1:1 de la boîte OUI/NON de combat (inline).
 *
 * Sources de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c:5398-5511`
 *     (Cmd_yesnoboxlearnmove case 0/1 — ouverture box + navigation curseur + input)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_message.c:1283`
 *     (gText_BattleYesNoChoice = "{PALETTE 5}{COLOR_HIGHLIGHT_SHADOW DYN4 DYN5 DYN6}OUI\nNON")
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_bg.c` (template B_WIN_YESNO :
 *     bg=0, left=25, top=9, width=4, height=4, paletteNum=5, baseBlock=256)
 *
 * Combat INLINE (battle-flow.ts) → c'est battle-flow qui pilote le flux (open →
 * lire input chaque frame → close). On expose `battleYesNoBoxOpen/Input/Close`,
 * modelé sur battle-levelup-box.ts. Le cadre + curseur sont sur BG0 (toujours
 * visible en combat — pas de ShowBg comme la box level-up sur BG1).
 *
 * DETTE : pas de PlaySE(SE_SELECT) sur déplacement/sélection du curseur (contrainte
 * projet « ne pas toucher BGM/SE » + canal audio fragile). 1:1 visuel sinon.
 */

import {
  AddWindow,
  FillWindowPixelBuffer,
  CopyWindowToVram,
  PutWindowTilemap,
  ClearWindowTilemap,
  RemoveWindow,
} from '../ui/gba-window-system';
import { AddTextPrinterParameterized3 } from '../ui/gba-text-system';
import { sStandardBattleWindowTemplates, B_WIN_YESNO } from './battle-windows';
import {
  HandleBattleWindow,
  BattleCreateYesNoCursorAt,
  BattleDestroyYesNoCursorAt,
  WINDOW_CLEAR,
  YESNOBOX_X_Y,
} from './battle-window-frame';
import { getRuntime } from '../../../harness/runtime/decomp-globals';
import { A_BUTTON, B_BUTTON, DPAD_UP, DPAD_DOWN } from './battle-controllers';

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────
const FONT_NORMAL = 1;
const TEXT_SKIP_DRAW = 0xff;

/** 1:1 décomp couleurs gText_BattleYesNoChoice (COLOR_HIGHLIGHT_SHADOW DYN4 DYN5 DYN6) :
 *  fg=DYNAMIC_COLOR4 (0xD), highlight/bg=DYNAMIC_COLOR5 (0xE), shadow=DYNAMIC_COLOR6 (0xF).
 *  AddTextPrinterParameterized3 attend color[] = {bg, fg, shadow}. */
const YESNO_BG_CLR = 0xe;
const YESNO_COLOR: readonly number[] = [YESNO_BG_CLR, 0xd, 0xf];

function PIXEL_FILL(n: number): number {
  return ((n << 4) | n) & 0xff;
}

/** Résultat du choix (curseur 0 = OUI, 1 = NON). */
export type YesNoResult = 'yes' | 'no';

let _yesNoWinId = -1;
/** 1:1 décomp gBattleCommunication[CURSOR_POSITION] : 0 = OUI, 1 = NON. */
let _cursorPos = 0;

/** Position courante du curseur (0 = OUI / 1 = NON). Exposé pour le flux qui veut
 *  ouvrir avec le curseur pré-positionné (ex. yesnoboxstoplearningmove ouvre sur NON). */
export function battleYesNoBoxCursor(): number {
  return _cursorPos;
}

/** 1:1 décomp Cmd_yesnoboxlearnmove case 0 : HandleBattleWindow(YESNOBOX, 0) +
 *  BattlePutTextOnWindow(gText_BattleYesNoChoice, B_WIN_YESNO) + curseur à `initialPos`.
 *  `initialPos` = 0 (learnmove ; décomp BattleCreateYesNoCursorAt(0)). */
export function battleYesNoBoxOpen(initialPos = 0): void {
  if (_yesNoWinId >= 0) battleYesNoBoxClose();

  // 1:1 décomp : cadre de la box sur BG0 (flags=0).
  HandleBattleWindow(...YESNOBOX_X_Y, 0);

  // Fenêtre de texte B_WIN_YESNO (12) : "OUI" / "NON".
  const tpl = sStandardBattleWindowTemplates[B_WIN_YESNO];
  _yesNoWinId = AddWindow(tpl);
  PutWindowTilemap(_yesNoWinId);
  // 1:1 décomp sTextOnWindowsInfo_Normal[B_WIN_YESNO] : fillValue=PIXEL_FILL(0xE).
  FillWindowPixelBuffer(_yesNoWinId, PIXEL_FILL(YESNO_BG_CLR));
  // 1:1 décomp : texte x=0, y=1 ; 2 lignes ("OUI\nNON") → 2 appels (line height 16).
  AddTextPrinterParameterized3(_yesNoWinId, FONT_NORMAL, 0, 1, YESNO_COLOR, TEXT_SKIP_DRAW, 'OUI');
  AddTextPrinterParameterized3(_yesNoWinId, FONT_NORMAL, 0, 17, YESNO_COLOR, TEXT_SKIP_DRAW, 'NON');
  CopyWindowToVram(_yesNoWinId, 3 /* COPYWIN_FULL */);

  _cursorPos = initialPos;
  BattleCreateYesNoCursorAt(initialPos);
}

/** 1:1 décomp Cmd_yesnoboxlearnmove case 1 : navigation DPAD_UP/DOWN + input A/B.
 *  Appelé chaque frame par battle-flow. Retourne 'yes'/'no' une fois choisi, sinon null.
 *  - DPAD_UP & pos!=0 → pos 0 ; DPAD_DOWN & pos==0 → pos 1.
 *  - A_BUTTON → pos==0 ? 'yes' : 'no'. B_BUTTON → 'no'. */
export function battleYesNoBoxInput(): YesNoResult | null {
  const rt = getRuntime();
  if (!rt) return null;
  const newKeys = rt.gMain.newKeys;

  if ((newKeys & DPAD_UP) && _cursorPos !== 0) {
    BattleDestroyYesNoCursorAt(_cursorPos);
    _cursorPos = 0;
    BattleCreateYesNoCursorAt(0);
  }
  if ((newKeys & DPAD_DOWN) && _cursorPos === 0) {
    BattleDestroyYesNoCursorAt(_cursorPos);
    _cursorPos = 1;
    BattleCreateYesNoCursorAt(1);
  }
  if (newKeys & A_BUTTON) {
    return _cursorPos === 0 ? 'yes' : 'no';
  }
  if (newKeys & B_BUTTON) {
    return 'no';
  }
  return null;
}

/** 1:1 décomp case 5 / case 1 (A sur sélection) : HandleBattleWindow(YESNOBOX, WINDOW_CLEAR)
 *  + retrait de la fenêtre de texte. (Le curseur est effacé par le clear du cadre BG0.) */
export function battleYesNoBoxClose(): void {
  if (_yesNoWinId < 0) {
    HandleBattleWindow(...YESNOBOX_X_Y, WINDOW_CLEAR);
    return;
  }
  FillWindowPixelBuffer(_yesNoWinId, 0);
  ClearWindowTilemap(_yesNoWinId);
  CopyWindowToVram(_yesNoWinId, 3 /* COPYWIN_FULL */);
  HandleBattleWindow(...YESNOBOX_X_Y, WINDOW_CLEAR);
  RemoveWindow(_yesNoWinId);
  _yesNoWinId = -1;
}

/** True si la box est ouverte. */
export function battleYesNoBoxIsOpen(): boolean {
  return _yesNoWinId >= 0;
}

// ─── Devtools expose ───────────────────────────────────────────────────────
(globalThis as Record<string, unknown>).__battleYesNoBox = {
  battleYesNoBoxOpen, battleYesNoBoxInput, battleYesNoBoxClose,
  battleYesNoBoxCursor, battleYesNoBoxIsOpen,
};
