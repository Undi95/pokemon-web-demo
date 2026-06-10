/**
 * SHIM de compat — la section action-selection est CONSOLIDÉE PHYSIQUEMENT dans
 * `src/game/battle_main.ts` (C5, 2026-06-10 — fichier décomp d'origine :
 * battle_main.c:4116-4552). Re-export NOMMÉ. Chargeur unique : battle-flow:233
 * (bare import, side-effect __battleActionSelection posé par la section dans
 * battle_main). À déposer avec la voie V.
 */
export {
  STATE_TURN_START_RECORD, STATE_BEFORE_ACTION_CHOSEN, STATE_WAIT_ACTION_CHOSEN,
  STATE_WAIT_ACTION_CASE_CHOSEN, STATE_WAIT_ACTION_CONFIRMED_STANDBY,
  STATE_WAIT_ACTION_CONFIRMED, STATE_SELECTION_SCRIPT, STATE_WAIT_SET_BEFORE_ACTION,
  STATE_SELECTION_SCRIPT_MAY_RUN,
  HandleTurnActionSelectionState,
} from '../../game/battle_main';
