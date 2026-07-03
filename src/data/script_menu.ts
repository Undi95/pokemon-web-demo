/**
 * script_menu.ts — miroir data de `decomps/pokeemeraude/src/data/script_menu.h`.
 *
 * `gStdStrings[]` (script_menu.h:903) : STDSTRING_* index → clé gText_* (les
 * textes FR viennent de strings.json via getString, chargé au boot).
 * Foyer partagé scrcmd.ts (ScrCmd_bufferstdstring) + tv.ts (Smart Shopper,
 * Bravo Trainer… — StringCopy(gTVStringVarPtrs[i], gStdStrings[idx])).
 */

export const gStdStrings: Readonly<Record<number, string>> = {
  0: 'gText_Cool', 1: 'gText_Beauty', 2: 'gText_Cute', 3: 'gText_Smart', 4: 'gText_Tough',
  5: 'gText_Normal', 6: 'gText_Super', 7: 'gText_Hyper', 8: 'gText_Master',
  9: 'gText_Cool2', 10: 'gText_Beauty2', 11: 'gText_Cute2', 12: 'gText_Smart2', 13: 'gText_Tough2',
  14: 'gText_Items', 15: 'gText_Key_Items', 16: 'gText_Poke_Balls', 17: 'gText_TMs_Hms', 18: 'gText_Berries2',
  19: 'gText_Single2', 20: 'gText_Double2', 21: 'gText_Multi', 22: 'gText_MultiLink',
  23: 'gText_BattleTower2', 24: 'gText_BattleDome', 25: 'gText_BattleFactory', 26: 'gText_BattlePalace',
  27: 'gText_BattleArena', 28: 'gText_BattlePike', 29: 'gText_BattlePyramid',
};
