/**
 * SHIM de compat — le MIROIR vit dans `src/game/battle_controller_opponent.ts`
 * (migré 2026-06-10, table 57 handlers certifiée 1:1 — cf. l'en-tête du miroir).
 * Ce re-export préserve les importeurs existants (ai/*, battle-controllers-init,
 * battle-decomp-loop, battle-flow, battle-sprite-callbacks, game/battle_main, …)
 * + les side-effects d'import (install table, __battleControllerOpponent,
 * import './battle-faint-anim'). À déposer quand la voie V sera supprimée
 * (imports directs au miroir).
 */
export * from '../../game/battle_controller_opponent';
