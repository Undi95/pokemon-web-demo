// AUTO-GENERATED from data/maps/SlateportCity_BattleTentCorridor/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=109, bytes=982, labels=21, unknownOps=0, unresolvedSymbols=54

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SlateportCity_BattleTentCorridor_MapScripts": 0,
  "SlateportCity_BattleTentCorridor_OnWarp": 10,
  "SlateportCity_BattleTentCorridor_EventScript_SetUpObjects": 18,
  "SlateportCity_BattleTentCorridor_EventScript_TurnPlayerNorth": 56,
  "SlateportCity_BattleTentCorridor_OnFrame": 61,
  "SlateportCity_BattleTentCorridor_EventScript_EnterCorridor": 69,
  "SlateportCity_BattleTentCorridor_EventScript_EnterBattleRoom": 196,
  "SlateportCity_BattleTentCorridor_EventScript_ReturnToRoomFromBattle": 306,
  "SlateportCity_BattleTentCorridor_EventScript_AskReadyForOpponent": 340,
  "SlateportCity_BattleTentCorridor_EventScript_AskPauseChallenge": 504,
  "SlateportCity_BattleTentCorridor_EventScript_AskRetireChallenge": 613,
  "SlateportCity_BattleTentCorridor_EventScript_AskSwapMon": 726,
  "SlateportCity_BattleTentCorridor_EventScript_SwapMons": 844,
  "SlateportCity_BattleTentCorridor_EventScript_ReadyFor2ndOpponent": 891,
  "SlateportCity_BattleTentCorridor_EventScript_ReadyFor3rdOpponent": 898,
  "SlateportCity_BattleTentCorridor_EventScript_PauseChallenge": 905,
  "SlateportCity_BattleTentCorridor_EventScript_ResumeChallenge": 941,
  "SlateportCity_BattleTentCorridor_Movement_PlayerEnter": 964,
  "SlateportCity_BattleTentCorridor_Movement_PlayerExit": 969,
  "SlateportCity_BattleTentCorridor_Movement_AttendantEnter": 973,
  "SlateportCity_BattleTentCorridor_Movement_AttendantExit": 979,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,61,0,0,0,0,10,0,0,0,0,0,0,0,18,0,0,0,23,0,0,1,0,35,0,0,1,0,34,0,0,1,0,7,5,56,0,0,0,7,5,0,0,0,0,88,0,0,2,0,2,0,92,0,0,0,92,0,0,0,3,0,0,0,0,69,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,50,1,0,0,7,1,0,0,0,0,23,0,0,1,0,80,0,0,205,3,0,0,81,0,0,205,3,0,0,0,0,80,0,0,196,3,0,0,81,0,0,196,3,0,0,0,0,82,0,0,83,0,0,0,0,35,0,0,2,0,34,0,0,2,0,7,1,173,3,0,0,7,1,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,152,0,23,0,0,0,0,38,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,173,2,0,1,0,175,80,0,0,211,3,0,0,81,0,0,211,3,0,0,0,0,80,0,0,201,3,0,0,81,0,0,201,3,0,0,0,0,82,0,0,83,0,0,0,0,174,2,0,1,0,175,58,0,0,0,255,255,255,255,4,255,255,255,255,0,4,0,4,0,4,4,0,0,0,0,3,23,0,0,0,0,38,0,0,0,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,50,112,1,51,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,1,0,34,0,0,1,0,8,1,123,3,0,0,8,1,0,0,0,0,35,0,0,2,0,34,0,0,2,0,8,1,130,3,0,0,8,1,0,0,0,0,112,20,6,0,1,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,214,2,0,0,34,214,2,0,0,7,1,0,0,0,0,7,1,214,2,0,0,35,0,0,1,0,34,0,0,1,0,35,248,1,0,0,34,248,1,0,0,7,1,0,0,0,0,7,1,248,1,0,0,35,0,0,2,0,34,0,0,2,0,35,101,2,0,0,34,101,2,0,0,7,1,0,0,0,0,7,1,101,2,0,0,16,0,0,0,0,0,10,5,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,84,1,0,0,34,84,1,0,0,7,1,0,0,0,0,7,1,84,1,0,0,35,0,0,1,0,34,0,0,1,0,35,137,3,0,0,34,137,3,0,0,7,1,0,0,0,0,7,1,137,3,0,0,35,0,0,0,0,34,0,0,0,0,35,84,1,0,0,34,84,1,0,0,7,1,0,0,0,0,7,1,84,1,0,0,104,0,0,0,0,103,113,20,8,0,1,0,26,0,0,0,0,35,0,0,1,0,34,0,0,1,0,35,84,1,0,0,34,84,1,0,0,7,1,0,0,0,0,7,1,84,1,0,0,35,0,0,0,0,34,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,0,0,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,84,1,0,0,34,84,1,0,0,7,1,0,0,0,0,7,1,84,1,0,0,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,5,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,196,0,0,0,34,196,0,0,0,7,1,0,0,0,0,7,1,196,0,0,0,35,0,0,1,0,34,0,0,1,0,35,76,3,0,0,34,76,3,0,0,7,1,0,0,0,0,7,1,76,3,0,0,35,0,0,0,0,34,0,0,0,0,35,196,0,0,0,34,196,0,0,0,7,1,0,0,0,0,7,1,196,0,0,0,152,0,23,0,0,0,0,38,0,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,196,0,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,6,196,0,0,0,104,0,0,0,0,103,4,104,0,0,0,0,103,4,104,0,0,0,0,103,23,0,0,0,0,23,0,0,0,0,38,0,0,0,48,55,0,49,152,0,23,0,0,0,0,38,0,0,0,3,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,6,84,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] as const;

export const STATS = { ops: 109, bytes: 982, labels: 21, unknownOps: 0, unresolvedSymbols: 54 } as const;
