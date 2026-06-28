/**
 * battle/battle-window-frame.ts — Port 1:1 des primitives de cadre/curseur combat.
 *
 * Sources de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c:10155-10223`
 *     (HandleBattleWindow, BattleCreateYesNoCursorAt, BattleDestroyYesNoCursorAt)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/battle_script_commands.h:7-11`
 *     (WINDOW_CLEAR, WINDOW_BG1, YESNOBOX_X_Y)
 *
 * Ces primitives écrivent directement dans le tilemap d'une BG (lu en direct par le
 * compositeur — cf. gba-window-system.CopyBgTilemapBufferToVram = no-op). Le cadre
 * battle (tuiles 0x022-0x02A) et les tuiles curseur (1,2) / intérieur (0x016) sont
 * chargés par `LoadBattleMenuWindowGfx` dans le tileset des BG combat.
 *
 * Module SANS import battle (uniquement gba-window-system) → cycle-safe : peut être
 * importé par battle-levelup-box, battle-yesno-box, battle-controllers.
 */

import { FillBgTilemapBufferRect, CopyBgTilemapBufferToVram } from '../../window';

// ─── Flags 1:1 décomp (include/battle_script_commands.h:7-8) ────────────────
/** 1:1 décomp `WINDOW_CLEAR` = 1 << 0 (efface = tuile 0). */
export const WINDOW_CLEAR = 1 << 0;
/** 1:1 décomp `WINDOW_BG1` = 1 << 7 (sinon BG0). */
export const WINDOW_BG1 = 1 << 7;

/** 1:1 décomp `YESNOBOX_X_Y` (include/battle_script_commands.h:11) = `23, 8, 29, 13`
 *  (xStart, yStart, xEnd, yEnd). À spread dans HandleBattleWindow. */
export const YESNOBOX_X_Y: readonly [number, number, number, number] = [23, 8, 29, 13];

/** Écrit une entrée de tilemap décomp-style (`var` = tuile | palette<<12, ex 0x1022)
 *  dans la BG `bgIdx`. FillBgTilemapBufferRect re-sépare tuile/palette en interne
 *  (= 1:1 `CopyToBgTilemapBufferRect_ChangePalette(bg, &var, x, y, 1, 1, 0x11)` —
 *  mode 0x11 > 15 = garder la palette embarquée). */
function _writeTilemapVar(bgIdx: number, varEntry: number, x: number, y: number): void {
  FillBgTilemapBufferRect(bgIdx, varEntry & 0x3ff, x, y, 1, 1, (varEntry >> 12) & 0xf);
}

/** 1:1 décomp `HandleBattleWindow(u8 xStart, u8 yStart, u8 xEnd, u8 yEnd, u8 flags)`
 *  (battle_script_commands.c:10155). Dessine un cadre tuilé (coins/bords) dans le
 *  tilemap BG (BG1 si WINDOW_BG1, sinon BG0). WINDOW_CLEAR → efface (tuile 0). */
export function HandleBattleWindow(
  xStart: number, yStart: number, xEnd: number, yEnd: number, flags: number,
): void {
  const bgIdx = (flags & WINDOW_BG1) ? 1 : 0;
  for (let destY = yStart; destY <= yEnd; destY++) {
    for (let destX = xStart; destX <= xEnd; destX++) {
      let varEntry: number;
      if (destY === yStart) {
        varEntry = destX === xStart ? 0x1022 : destX === xEnd ? 0x1024 : 0x1023; // haut : ╔ ═ ╗
      } else if (destY === yEnd) {
        varEntry = destX === xStart ? 0x1028 : destX === xEnd ? 0x102a : 0x1029; // bas : ╚ ═ ╝
      } else {
        varEntry = destX === xStart ? 0x1025 : destX === xEnd ? 0x1027 : 0x1026; // milieu : ║ · ║
      }
      if (flags & WINDOW_CLEAR) varEntry = 0;
      _writeTilemapVar(bgIdx, varEntry, destX, destY);
    }
  }
}

/** 1:1 décomp `BattleCreateYesNoCursorAt(u8 cursorPosition)` (battle_script_commands.c:10203).
 *  Curseur (tuiles 1 puis 2, palette 0) sur BG0, colonne 0x18=24, lignes 9+2*pos / +1.
 *  (//!< French Difference : pos curseur en colonne 24, juste à gauche du texte OUI/NON.) */
export function BattleCreateYesNoCursorAt(cursorPosition: number): void {
  const y = 9 + 2 * cursorPosition;
  _writeTilemapVar(0, 0x0001, 0x18, y);      // src[0] = 1
  _writeTilemapVar(0, 0x0002, 0x18, y + 1);  // src[1] = 2
  CopyBgTilemapBufferToVram(0);
}

/** 1:1 décomp `BattleDestroyYesNoCursorAt(u8 cursorPosition)` (battle_script_commands.c:10214).
 *  Réécrit la tuile intérieure 0x016 (palette 1) à l'emplacement du curseur. */
export function BattleDestroyYesNoCursorAt(cursorPosition: number): void {
  const y = 9 + 2 * cursorPosition;
  _writeTilemapVar(0, 0x1016, 0x18, y);      // src[0] = 0x1016
  _writeTilemapVar(0, 0x1016, 0x18, y + 1);  // src[1] = 0x1016
  CopyBgTilemapBufferToVram(0);
}
