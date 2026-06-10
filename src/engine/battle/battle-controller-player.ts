/**
 * SHIM de compat — le MIROIR vit dans `src/game/battle_controller_player.ts`
 * (migré 2026-06-10, table 57 commandes certifiée — cf. l'en-tête du miroir).
 * Ce re-export préserve les importeurs existants (battle-bg, battle-controller-tick,
 * battle-controllers-init, battle-decomp-loop, battle-flow, battle-string-decoder,
 * reshow-battle-screen, state, game/*) + les side-effects d'import (install table,
 * __battleControllerPlayer, imports './battle-message' + './battle-healthbox-l').
 * À déposer quand la voie V sera supprimée (imports directs au miroir).
 */
export * from '../../game/battle_controller_player';
