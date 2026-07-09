/**
 * battle_script_commands.ts — miroir 1:1 décomp `include/battle_script_commands.h`
 * (partiel : flags de HandleBattleWindow + YESNOBOX_X_Y).
 *
 * Rapatrié de `engine/battle/battle-window-frame.ts` + `engine/battle/constants.ts`
 * (unification miroir) : dans le décomp ces constantes vivent dans le HEADER.
 */

// ─── Arguments for 'flags' in HandleBattleWindow (battle_script_commands.h:7-8) ──
export const WINDOW_CLEAR = 1 << 0;
export const WINDOW_BG1   = 1 << 7;

// ─── YESNOBOX_X_Y (battle_script_commands.h:11) ─────────────────────────────
// La macro décomp expand en `23, 8, 29, 13` (4 args xStart, yStart, xEnd, yEnd
// de HandleBattleWindow). Tuple 1:1 à spread ; les 4 noms séparés = adaptation
// TS (pas de spread de macro C) pour les call sites qui préfèrent les nommer.
export const YESNOBOX_X_Y: readonly [number, number, number, number] = [23, 8, 29, 13];
export const YESNOBOX_X_START = 23;
export const YESNOBOX_Y_START = 8;
export const YESNOBOX_X_END   = 29;
export const YESNOBOX_Y_END   = 13;
