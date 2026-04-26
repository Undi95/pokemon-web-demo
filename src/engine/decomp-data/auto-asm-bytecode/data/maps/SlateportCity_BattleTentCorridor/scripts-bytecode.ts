// AUTO-GENERATED from data/maps/SlateportCity_BattleTentCorridor/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=109, bytes=758, labels=21, unknownOps=2, unresolvedSymbols=31

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "SlateportCity_BattleTentCorridor_MapScripts": 0,
  "SlateportCity_BattleTentCorridor_OnWarp": 10,
  "SlateportCity_BattleTentCorridor_EventScript_SetUpObjects": 18,
  "SlateportCity_BattleTentCorridor_EventScript_TurnPlayerNorth": 43,
  "SlateportCity_BattleTentCorridor_OnFrame": 48,
  "SlateportCity_BattleTentCorridor_EventScript_EnterCorridor": 56,
  "SlateportCity_BattleTentCorridor_EventScript_EnterBattleRoom": 155,
  "SlateportCity_BattleTentCorridor_EventScript_ReturnToRoomFromBattle": 265,
  "SlateportCity_BattleTentCorridor_EventScript_AskReadyForOpponent": 297,
  "SlateportCity_BattleTentCorridor_EventScript_AskPauseChallenge": 399,
  "SlateportCity_BattleTentCorridor_EventScript_AskRetireChallenge": 472,
  "SlateportCity_BattleTentCorridor_EventScript_AskSwapMon": 551,
  "SlateportCity_BattleTentCorridor_EventScript_SwapMons": 632,
  "SlateportCity_BattleTentCorridor_EventScript_ReadyFor2ndOpponent": 666,
  "SlateportCity_BattleTentCorridor_EventScript_ReadyFor3rdOpponent": 675,
  "SlateportCity_BattleTentCorridor_EventScript_PauseChallenge": 684,
  "SlateportCity_BattleTentCorridor_EventScript_ResumeChallenge": 719,
  "SlateportCity_BattleTentCorridor_Movement_PlayerEnter": 740,
  "SlateportCity_BattleTentCorridor_Movement_PlayerExit": 745,
  "SlateportCity_BattleTentCorridor_Movement_AttendantEnter": 749,
  "SlateportCity_BattleTentCorridor_Movement_AttendantExit": 755,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [2,48,0,0,0,4,10,0,0,0,0,0,0,0,18,0,0,0,113,0,1,0,35,6,128,1,0,34,6,128,1,0,88,0,0,2,0,2,0,92,0,0,1,92,255,0,2,90,0,0,0,0,56,0,0,0,35,6,128,1,0,34,6,128,1,0,113,0,1,0,80,0,0,237,2,0,0,81,0,0,237,2,0,0,0,0,80,255,0,228,2,0,0,81,255,0,228,2,0,0,0,0,82,0,0,83,0,0,0,0,35,6,128,2,0,34,6,128,2,0,113,4,9,0,38,0,0,0,113,4,8,0,38,0,0,0,16,0,0,0,0,0,10,0,152,1,113,4,6,0,38,0,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,173,2,0,1,0,175,80,0,0,243,2,0,0,81,0,0,243,2,0,0,0,0,80,255,0,233,2,0,0,81,255,0,233,2,0,0,0,0,82,0,0,83,0,0,0,0,174,2,0,1,0,175,58,0,0,255,255,255,255,255,4,255,255,255,255,255,4,0,4,0,4,4,0,0,0,0,90,113,4,9,0,38,0,0,0,113,4,16,0,38,0,0,0,16,0,0,0,0,0,10,0,50,112,1,51,38,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,2,0,34,13,128,2,0,112,20,6,104,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,39,2,0,0,34,39,2,0,0,35,0,128,1,0,34,0,128,1,0,35,143,1,0,0,34,143,1,0,0,35,0,128,2,0,34,0,128,2,0,35,216,1,0,0,34,216,1,0,0,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,41,1,0,0,34,41,1,0,0,35,0,128,0,0,34,0,128,0,0,35,172,2,0,0,34,172,2,0,0,35,0,128,127,0,34,0,128,127,0,35,41,1,0,0,34,41,1,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,41,1,0,0,34,41,1,0,0,35,0,128,0,0,34,0,128,0,0,35,0,0,0,0,34,0,0,0,0,35,0,128,127,0,34,0,128,127,0,35,41,1,0,0,34,41,1,0,0,113,4,8,0,38,0,0,0,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,155,0,0,0,34,155,0,0,0,35,0,128,0,0,34,0,128,0,0,35,120,2,0,0,34,120,2,0,0,35,0,128,127,0,34,0,128,127,0,35,155,0,0,0,34,155,0,0,0,152,1,113,4,7,0,38,0,0,0,0,35,13,128,1,0,34,13,128,1,0,16,0,0,0,0,0,10,0,89,155,0,0,0,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,113,4,3,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,38,0,0,0,113,4,10,0,113,5,0,0,38,0,0,0,89,41,1,0,0,9,9,9,9,254,9,9,84,254,9,9,9,9,37,254,9,84,254] as const;

export const STATS = { ops: 109, bytes: 758, labels: 21, unknownOps: 2, unresolvedSymbols: 31 } as const;
