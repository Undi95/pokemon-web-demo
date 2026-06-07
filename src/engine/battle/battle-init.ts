/**
 * battle/battle-init.ts — RÉ-EXPORT depuis le port miroir.
 *
 * Le contenu (CB2_InitBattle + CB2_InitBattleInternal + tous leurs helpers) a été
 * migré 1:1 vers `src/game/battle_main.ts` (port miroir battle_main.c, tranche 3,
 * 2026-06-07).
 *
 * Ce module reste comme façade : l'`import './battle-init'` (effet de bord) de
 * battle-flow.ts charge battle_main → expose globalThis __battleInit (lu par
 * battle-decomp-loop.ts pour booter CB2_InitBattle).
 */

export { CB2_InitBattle, CB2_InitBattleInternal } from '../../game/battle_main';
