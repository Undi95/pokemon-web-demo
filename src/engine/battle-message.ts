/**
 * battle-message.ts — Port 1:1 décomp `src/battle_message.c` (partie texte
 * sur windows). Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/
 * battle_message.c:3035-3108` `BattlePutTextOnWindow`.
 *
 * C'est CE helper que les states battle-flow doivent appeler pour afficher du
 * texte dans les windows battle (MSG / ACTION / MOVE / YESNO / …), PAS un
 * AddTextPrinter générique avec des couleurs overworld. Il applique
 * `sTextOnWindowsInfo_Normal[winId]` (fillValue + fontId + x/y + fg/bg/shadow)
 * → la couleur (rouge dialog, etc.) sort des palettes battle (textbox slot 0,
 * text.pal slot 5) chargées par LoadBattleTextboxAndBackground.
 */

import {
  FillWindowPixelBuffer, PutWindowTilemap, CopyWindowToVram,
} from './gba-window-system';
import { AddTextPrinterParameterized3 } from './gba-text-system';
import {
  sTextOnWindowsInfo_Normal, B_WIN_COPYTOVRAM, B_WIN_MSG,
} from './battle-windows';

/** 1:1 décomp window.h:20-25 enum COPYWIN_* (COPYWIN_FULL = 3). */
const COPYWIN_FULL = 3;

/** Sentinelle vitesse "texte = réglage joueur" pour AddTextPrinterParameterized3
 *  (= 1:1 décomp B_WIN_MSG → speed = GetPlayerTextSpeedDelay()). */
const SPEED_PLAYER_OPTION = -1;

/**
 * 1:1 décomp `void BattlePutTextOnWindow(const u8 *text, u8 windowId)`
 * (battle_message.c:3035-3108).
 *
 * ```c
 * const struct BattleWindowText *textInfo = sBattleTextOnWindowsInfo[gBattleScripting.windowsType];
 * if (windowId & B_WIN_COPYTOVRAM) { windowId &= ~B_WIN_COPYTOVRAM; copyToVram = FALSE; }
 * else { FillWindowPixelBuffer(windowId, textInfo[windowId].fillValue); copyToVram = TRUE; }
 * printerTemplate = { fontId, x, y, currentX=x, currentY=y, letterSpacing,
 *                     lineSpacing, fgColor, bgColor, shadowColor };
 * if (printerTemplate.x == 0xFF) { center-align } // (aucune entrée NORMAL n'a x=0xFF)
 * if (windowId == B_WIN_MSG) speed = GetPlayerTextSpeedDelay(); else speed = textInfo[windowId].speed;
 * AddTextPrinter(&printerTemplate, speed, NULL);
 * if (copyToVram) { PutWindowTilemap(windowId); CopyWindowToVram(windowId, COPYWIN_FULL); }
 * ```
 *
 * Notes 1:1 :
 *  - On ne porte que `B_WIN_TYPE_NORMAL` (combats wild/trainer ; pas ARENA).
 *  - `AddTextPrinterParameterized3` attend `colorArray = [bgColor, fgColor,
 *    shadowColor]` (ordre décomp text.c, vérifié gba-text-system.ts:248-255).
 *  - `fontId` (FONT_NORMAL=1 / FONT_NARROW=7) est résolu tel quel par
 *    `_resolveFont` (FONT_NAMES gba-text-system.ts:42-49 = même enum text.h).
 *  - Le test `x == 0xFF` (center-align) est mort pour la table NORMAL (x ∈
 *    {0,1,2,32}), non porté ; les flags gTextFlags (autoScroll, down-arrow)
 *    sont gérés ailleurs par notre text system (déféré, non bloquant).
 */
export function BattlePutTextOnWindow(text: string, windowId: number): void {
  let winId = windowId;
  let copyToVram: boolean;

  if (winId & B_WIN_COPYTOVRAM) {
    winId &= ~B_WIN_COPYTOVRAM;
    copyToVram = false;
  } else {
    FillWindowPixelBuffer(winId, sTextOnWindowsInfo_Normal[winId].fillValue);
    copyToVram = true;
  }

  const info = sTextOnWindowsInfo_Normal[winId];
  if (!info) {
    console.warn('[battle-message] BattlePutTextOnWindow: no textInfo for window', winId);
    return;
  }

  // 1:1 décomp : B_WIN_MSG → GetPlayerTextSpeedDelay() ; sinon textInfo.speed.
  const speed = winId === B_WIN_MSG ? SPEED_PLAYER_OPTION : info.speed;

  // 1:1 décomp AddTextPrinter(&printerTemplate, speed, NULL).
  AddTextPrinterParameterized3(
    winId,
    info.fontId,
    info.x,
    info.y,
    [info.bgColor, info.fgColor, info.shadowColor],
    speed,
    text,
  );

  if (copyToVram) {
    PutWindowTilemap(winId);
    CopyWindowToVram(winId, COPYWIN_FULL);
  }
}
