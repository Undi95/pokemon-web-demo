// AUTO-GENERATED from data/maps/SlateportCity_BattleTentCorridor/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=109, bytes=974, labels=21, unknownOps=0, unresolvedSymbols=27

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SlateportCity_BattleTentCorridor_MapScripts": 0,
  "SlateportCity_BattleTentCorridor_OnWarp": 10,
  "SlateportCity_BattleTentCorridor_EventScript_SetUpObjects": 18,
  "SlateportCity_BattleTentCorridor_EventScript_TurnPlayerNorth": 55,
  "SlateportCity_BattleTentCorridor_OnFrame": 60,
  "SlateportCity_BattleTentCorridor_EventScript_EnterCorridor": 68,
  "SlateportCity_BattleTentCorridor_EventScript_EnterBattleRoom": 191,
  "SlateportCity_BattleTentCorridor_EventScript_ReturnToRoomFromBattle": 301,
  "SlateportCity_BattleTentCorridor_EventScript_AskReadyForOpponent": 333,
  "SlateportCity_BattleTentCorridor_EventScript_AskPauseChallenge": 495,
  "SlateportCity_BattleTentCorridor_EventScript_AskRetireChallenge": 604,
  "SlateportCity_BattleTentCorridor_EventScript_AskSwapMon": 719,
  "SlateportCity_BattleTentCorridor_EventScript_SwapMons": 836,
  "SlateportCity_BattleTentCorridor_EventScript_ReadyFor2ndOpponent": 882,
  "SlateportCity_BattleTentCorridor_EventScript_ReadyFor3rdOpponent": 891,
  "SlateportCity_BattleTentCorridor_EventScript_PauseChallenge": 900,
  "SlateportCity_BattleTentCorridor_EventScript_ResumeChallenge": 935,
  "SlateportCity_BattleTentCorridor_Movement_PlayerEnter": 956,
  "SlateportCity_BattleTentCorridor_Movement_PlayerExit": 961,
  "SlateportCity_BattleTentCorridor_Movement_AttendantEnter": 965,
  "SlateportCity_BattleTentCorridor_Movement_AttendantExit": 971,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,60,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,35,6,128,1,0,34,6,128,1,0,7,5,55,0,0,0,7,5,6,128,0,0,88,0,0,2,0,2,0,92,0,0,1,92,255,0,2,90,0,0,0,0,68,0,0,0,35,6,128,1,0,34,6,128,1,0,7,1,45,1,0,0,7,1,6,128,0,0,113,0,1,0,80,0,0,197,3,0,0,81,0,0,197,3,0,0,0,0,80,255,0,188,3,0,0,81,255,0,188,3,0,0,0,0,82,0,0,83,0,0,0,0,35,6,128,2,0,34,6,128,2,0,7,1,167,3,0,0,7,1,6,128,0,0,113,4,9,0,38,0,0,0,113,4,8,0,38,0,0,0,16,0,0,0,0,0,10,4,152,1,113,4,6,0,38,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,173,2,0,1,0,175,80,0,0,203,3,0,0,81,0,0,203,3,0,0,0,0,80,255,0,193,3,0,0,81,255,0,193,3,0,0,0,0,82,0,0,83,0,0,0,0,174,2,0,1,0,175,58,0,0,255,255,255,255,255,4,255,255,255,255,255,4,0,4,0,4,4,0,0,0,0,90,113,4,9,0,38,0,0,0,113,4,16,0,38,0,0,0,16,0,0,0,0,0,10,4,50,112,1,51,38,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,8,1,114,3,0,0,8,1,13,128,0,0,35,13,128,2,0,34,13,128,2,0,8,1,123,3,0,0,8,1,13,128,0,0,112,20,6,104,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,207,2,0,0,34,207,2,0,0,7,1,0,0,0,0,7,1,207,2,0,0,35,0,128,1,0,34,0,128,1,0,35,239,1,0,0,34,239,1,0,0,7,1,0,0,0,0,7,1,239,1,0,0,35,0,128,2,0,34,0,128,2,0,35,92,2,0,0,34,92,2,0,0,7,1,0,0,0,0,7,1,92,2,0,0,16,0,0,0,0,0,10,5,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,77,1,0,0,34,77,1,0,0,7,1,0,0,0,0,7,1,77,1,0,0,35,0,128,1,0,34,0,128,1,0,35,132,3,0,0,34,132,3,0,0,7,1,0,0,0,0,7,1,132,3,0,0,35,0,128,127,0,34,0,128,127,0,35,77,1,0,0,34,77,1,0,0,7,1,0,0,0,0,7,1,77,1,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,77,1,0,0,34,77,1,0,0,7,1,0,0,0,0,7,1,77,1,0,0,35,0,128,0,0,34,0,128,0,0,35,0,0,0,0,34,0,0,0,0,7,1,0,0,0,0,7,1,0,0,0,0,35,0,128,127,0,34,0,128,127,0,35,77,1,0,0,34,77,1,0,0,7,1,0,0,0,0,7,1,77,1,0,0,113,4,8,0,38,0,0,0,16,0,0,0,0,0,10,5,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,191,0,0,0,34,191,0,0,0,7,1,0,0,0,0,7,1,191,0,0,0,35,0,128,1,0,34,0,128,1,0,35,68,3,0,0,34,68,3,0,0,7,1,0,0,0,0,7,1,68,3,0,0,35,0,128,127,0,34,0,128,127,0,35,191,0,0,0,34,191,0,0,0,7,1,0,0,0,0,7,1,191,0,0,0,152,1,113,4,7,0,38,0,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,191,0,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,89,191,0,0,0,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,113,4,3,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,38,0,0,0,113,4,10,0,113,5,0,0,38,0,0,0,89,77,1,0,0,9,9,9,9,254,9,9,84,254,9,9,9,9,37,254,9,84,254] as const;

export const STATS = { ops: 109, bytes: 974, labels: 21, unknownOps: 0, unresolvedSymbols: 27 } as const;
