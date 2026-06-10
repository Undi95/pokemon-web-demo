/**
 * SHIM de compat — la section turn-helpers est CONSOLIDÉE PHYSIQUEMENT dans
 * `src/game/battle_main.ts` (C3, 2026-06-10 — fichier décomp d'origine :
 * battle_main.c:4086-4855). Re-export NOMMÉ (pas export *). Importeurs
 * préservés : battle-action-selection, battle-flow, battle-script-commands.
 * À déposer quand la voie V sera supprimée.
 */
export {
  SwitchPartyOrder, AllAtActionConfirmed, UpdateBattlerPartyOrdersOnSwitch,
  SwapTurnOrder, SetActionsAndBattlersTurnOrder,
} from '../../game/battle_main';
