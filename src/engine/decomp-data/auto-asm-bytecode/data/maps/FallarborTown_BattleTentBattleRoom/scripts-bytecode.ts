// AUTO-GENERATED from data/maps/FallarborTown_BattleTentBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=169, bytes=1364, labels=31, unknownOps=0, unresolvedSymbols=31

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "FallarborTown_BattleTentBattleRoom_MapScripts": 0,
  "FallarborTown_BattleTentBattleRoom_OnTransition": 15,
  "FallarborTown_BattleTentBattleRoom_EventScript_SetPlayerGfx": 21,
  "FallarborTown_BattleTentBattleRoom_EventScript_SetPlayerGfxMale": 67,
  "FallarborTown_BattleTentBattleRoom_EventScript_SetPlayerGfxFemale": 78,
  "FallarborTown_BattleTentBattleRoom_OnFrame": 89,
  "FallarborTown_BattleTentBattleRoom_EventScript_EnterRoom": 97,
  "FallarborTown_BattleTentBattleRoom_EventScript_NextOpponentEnter": 163,
  "FallarborTown_BattleTentBattleRoom_EventScript_WarpToLobbyLost": 345,
  "FallarborTown_BattleTentBattleRoom_EventScript_DefeatedOpponent": 397,
  "FallarborTown_BattleTentBattleRoom_EventScript_IncrementBattleNum": 434,
  "FallarborTown_BattleTentBattleRoom_EventScript_AskContinueChallenge": 632,
  "FallarborTown_BattleTentBattleRoom_EventScript_AskPauseChallenge": 796,
  "FallarborTown_BattleTentBattleRoom_EventScript_AskRetireChallenge": 905,
  "FallarborTown_BattleTentBattleRoom_EventScript_ContinueChallenge": 1018,
  "FallarborTown_BattleTentBattleRoom_EventScript_WarpToLobbyWon": 1073,
  "FallarborTown_BattleTentBattleRoom_EventScript_ReadyFor2ndOpponent": 1193,
  "FallarborTown_BattleTentBattleRoom_EventScript_ReadyFor3rdOpponent": 1200,
  "FallarborTown_BattleTentBattleRoom_EventScript_PauseChallenge": 1207,
  "FallarborTown_BattleTentBattleRoom_EventScript_ResumeChallenge": 1243,
  "FallarborTown_BattleTentBattleRoom_Movement_PlayerEnter": 1297,
  "FallarborTown_BattleTentBattleRoom_Movement_PlayerFaceBattle": 1302,
  "FallarborTown_BattleTentBattleRoom_Movement_PlayerFaceAttendant": 1304,
  "FallarborTown_BattleTentBattleRoom_Movement_OpponentEnter": 1306,
  "FallarborTown_BattleTentBattleRoom_Movement_OpponentStepForward": 1312,
  "FallarborTown_BattleTentBattleRoom_Movement_OpponentExit": 1314,
  "FallarborTown_BattleTentBattleRoom_Movement_AttendantJump": 1319,
  "FallarborTown_BattleTentBattleRoom_Movement_AttendantApproachPlayer": 1322,
  "FallarborTown_BattleTentBattleRoom_Movement_AttendantReturnToPos": 1327,
  "FallarborTown_BattleTentBattleRoom_OnWarp": 1332,
  "FallarborTown_BattleTentBattleRoom_EventScript_SetUpObjects": 1340,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,15,0,0,0,2,89,0,0,0,4,52,5,0,0,5,21,0,0,0,3,161,35,13,128,0,0,34,13,128,0,0,7,1,67,0,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,78,0,0,0,7,1,13,128,0,0,4,23,17,64,100,0,23,16,64,100,0,4,23,17,64,105,0,23,16,64,105,0,4,0,0,0,0,97,0,0,0,106,89,0,0,0,0,80,0,0,17,5,0,0,81,0,0,17,5,0,0,0,0,82,0,0,83,0,0,0,0,23,4,128,1,0,23,5,128,2,0,38,0,0,58,35,13,128,0,0,34,13,128,0,0,7,5,219,4,0,0,7,5,13,128,0,0,23,4,128,3,0,38,0,0,58,86,0,0,87,0,0,0,0,80,0,0,26,5,0,0,81,0,0,26,5,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,39,5,0,0,81,0,0,39,5,0,0,0,0,48,185,0,49,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,23,4,128,4,0,38,0,0,58,16,0,0,0,0,0,10,4,103,5,0,0,0,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,141,1,0,0,34,141,1,0,0,7,1,0,0,0,0,7,1,141,1,0,0,80,0,0,39,5,0,0,81,0,0,39,5,0,0,0,0,48,197,0,49,82,0,0,83,0,0,0,0,23,4,128,6,0,38,0,0,58,16,0,0,0,0,0,10,4,23,4,128,2,0,23,5,128,0,0,26,6,128,4,0,23,6,128,4,0,38,0,0,58,38,0,0,58,58,0,0,255,255,255,255,255,6,255,255,255,255,255,6,0,6,0,6,6,0,0,0,58,80,0,0,39,5,0,0,81,0,0,39,5,0,0,0,0,48,20,0,49,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,23,4,128,1,0,23,5,128,2,0,38,0,0,58,24,13,128,1,0,23,4,128,2,0,23,5,128,2,0,26,6,128,13,128,23,6,128,13,128,38,0,0,58,26,0,128,13,128,35,0,128,3,0,34,0,128,3,0,35,49,4,0,0,34,49,4,0,0,7,1,0,0,0,0,7,1,49,4,0,0,80,0,0,34,5,0,0,81,0,0,34,5,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,42,5,0,0,81,0,0,42,5,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,24,5,0,0,81,0,0,24,5,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,38,0,0,58,38,0,0,58,23,4,128,3,0,23,5,128,3,0,38,0,0,58,50,112,1,51,38,0,0,58,23,4,128,1,0,23,5,128,2,0,38,0,0,58,35,13,128,1,0,34,13,128,1,0,8,1,169,4,0,0,8,1,13,128,0,0,35,13,128,2,0,34,13,128,2,0,8,1,176,4,0,0,8,1,13,128,0,0,112,20,6,104,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,250,3,0,0,34,250,3,0,0,7,1,0,0,0,0,7,1,250,3,0,0,35,0,128,1,0,34,0,128,1,0,35,28,3,0,0,34,28,3,0,0,7,1,0,0,0,0,7,1,28,3,0,0,35,0,128,2,0,34,0,128,2,0,35,137,3,0,0,34,137,3,0,0,7,1,0,0,0,0,7,1,137,3,0,0,16,0,0,0,0,0,10,5,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,120,2,0,0,34,120,2,0,0,7,1,0,0,0,0,7,1,120,2,0,0,35,0,128,1,0,34,0,128,1,0,35,183,4,0,0,34,183,4,0,0,7,1,0,0,0,0,7,1,183,4,0,0,35,0,128,127,0,34,0,128,127,0,35,120,2,0,0,34,120,2,0,0,7,1,0,0,0,0,7,1,120,2,0,0,104,0,0,0,0,103,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,120,2,0,0,34,120,2,0,0,7,1,0,0,0,0,7,1,120,2,0,0,35,0,128,0,0,34,0,128,0,0,35,89,1,0,0,34,89,1,0,0,7,1,0,0,0,0,7,1,89,1,0,0,35,0,128,127,0,34,0,128,127,0,35,120,2,0,0,34,120,2,0,0,7,1,0,0,0,0,7,1,120,2,0,0,105,80,0,0,47,5,0,0,81,0,0,47,5,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,22,5,0,0,81,0,0,22,5,0,0,0,0,82,0,0,83,0,0,0,0,6,163,0,0,0,58,41,60,0,23,4,128,2,0,23,5,128,0,0,26,6,128,3,0,23,6,128,3,0,38,0,0,58,38,0,0,58,58,0,0,255,255,255,255,255,6,255,255,255,255,255,6,0,6,0,6,6,0,0,0,58,23,4,128,1,0,23,5,128,1,0,38,0,0,58,35,13,128,15,39,34,13,128,15,39,7,1,178,1,0,0,7,1,13,128,0,0,24,13,128,1,0,23,4,128,2,0,23,5,128,1,0,26,6,128,13,128,23,6,128,13,128,38,0,0,58,104,0,0,0,0,103,4,104,0,0,0,0,103,4,104,0,0,0,0,103,23,4,128,3,0,23,5,128,2,0,38,0,0,58,48,55,0,49,152,1,23,4,128,4,0,38,0,0,58,3,80,0,0,42,5,0,0,81,0,0,42,5,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,24,5,0,0,81,0,0,24,5,0,0,0,0,82,0,0,83,0,0,0,0,6,120,2,0,0,3,9,9,9,40,254,40,254,39,254,8,8,8,8,39,254,10,254,9,9,9,9,254,81,70,254,8,8,8,40,254,9,9,9,37,254,0,0,0,0,60,5,0,0,90,255,0,0,0,90,0,0,0,0,84,0,0,85,0,0,0,0,23,0,0,1,0,3] as const;

export const STATS = { ops: 169, bytes: 1364, labels: 31, unknownOps: 0, unresolvedSymbols: 31 } as const;
