/**
 * battle/battle-cb2.ts — RÉ-EXPORT depuis le port miroir.
 *
 * Le contenu (BattleMainCB1/CB2 + FreeRestoreBattleData + CB2_QuitRecordedBattle +
 * SpriteCB_UnusedBattleInit*) a été migré 1:1 vers `src/game/battle_main.ts`
 * (port miroir battle_main.c, tranche 2, 2026-06-07).
 *
 * Ce module reste comme façade pour les importeurs existants (reshow-battle-screen.ts)
 * et l'expose globalThis __battleCB2 (déclenché par l'import de battle_main).
 */

export {
  BattleMainCB1,
  BattleMainCB2,
  FreeRestoreBattleData,
  CB2_QuitRecordedBattle,
  SpriteCB_UnusedBattleInit,
  SpriteCB_UnusedBattleInit_Main,
} from '../../game/battle_main';
