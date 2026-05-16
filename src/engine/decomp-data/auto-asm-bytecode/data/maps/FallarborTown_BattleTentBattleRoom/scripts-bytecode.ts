// AUTO-GENERATED from data/maps/FallarborTown_BattleTentBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=169, bytes=1336, labels=31, unknownOps=0, unresolvedSymbols=33

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "FallarborTown_BattleTentBattleRoom_MapScripts": 0,
  "FallarborTown_BattleTentBattleRoom_OnTransition": 15,
  "FallarborTown_BattleTentBattleRoom_EventScript_SetPlayerGfx": 21,
  "FallarborTown_BattleTentBattleRoom_EventScript_SetPlayerGfxMale": 67,
  "FallarborTown_BattleTentBattleRoom_EventScript_SetPlayerGfxFemale": 76,
  "FallarborTown_BattleTentBattleRoom_OnFrame": 85,
  "FallarborTown_BattleTentBattleRoom_EventScript_EnterRoom": 93,
  "FallarborTown_BattleTentBattleRoom_EventScript_NextOpponentEnter": 157,
  "FallarborTown_BattleTentBattleRoom_EventScript_WarpToLobbyLost": 338,
  "FallarborTown_BattleTentBattleRoom_EventScript_DefeatedOpponent": 387,
  "FallarborTown_BattleTentBattleRoom_EventScript_IncrementBattleNum": 424,
  "FallarborTown_BattleTentBattleRoom_EventScript_AskContinueChallenge": 613,
  "FallarborTown_BattleTentBattleRoom_EventScript_AskPauseChallenge": 775,
  "FallarborTown_BattleTentBattleRoom_EventScript_AskRetireChallenge": 884,
  "FallarborTown_BattleTentBattleRoom_EventScript_ContinueChallenge": 999,
  "FallarborTown_BattleTentBattleRoom_EventScript_WarpToLobbyWon": 1054,
  "FallarborTown_BattleTentBattleRoom_EventScript_ReadyFor2ndOpponent": 1163,
  "FallarborTown_BattleTentBattleRoom_EventScript_ReadyFor3rdOpponent": 1172,
  "FallarborTown_BattleTentBattleRoom_EventScript_PauseChallenge": 1181,
  "FallarborTown_BattleTentBattleRoom_EventScript_ResumeChallenge": 1216,
  "FallarborTown_BattleTentBattleRoom_Movement_PlayerEnter": 1270,
  "FallarborTown_BattleTentBattleRoom_Movement_PlayerFaceBattle": 1275,
  "FallarborTown_BattleTentBattleRoom_Movement_PlayerFaceAttendant": 1277,
  "FallarborTown_BattleTentBattleRoom_Movement_OpponentEnter": 1279,
  "FallarborTown_BattleTentBattleRoom_Movement_OpponentStepForward": 1285,
  "FallarborTown_BattleTentBattleRoom_Movement_OpponentExit": 1287,
  "FallarborTown_BattleTentBattleRoom_Movement_AttendantJump": 1292,
  "FallarborTown_BattleTentBattleRoom_Movement_AttendantApproachPlayer": 1295,
  "FallarborTown_BattleTentBattleRoom_Movement_AttendantReturnToPos": 1300,
  "FallarborTown_BattleTentBattleRoom_OnWarp": 1305,
  "FallarborTown_BattleTentBattleRoom_EventScript_SetUpObjects": 1313,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,15,0,0,0,2,85,0,0,0,4,25,5,0,0,88,21,0,0,0,90,161,35,13,128,0,0,34,13,128,0,0,7,1,67,0,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,76,0,0,0,7,1,13,128,0,0,15,113,17,100,0,113,16,100,0,15,113,17,105,0,113,16,105,0,15,0,0,0,0,93,0,0,0,106,89,0,0,0,0,80,0,0,246,4,0,0,81,0,0,246,4,0,0,0,0,82,0,0,83,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,5,192,4,0,0,7,5,13,128,0,0,113,4,3,0,38,0,0,0,86,0,0,87,0,0,0,0,80,0,0,255,4,0,0,81,0,0,255,4,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,12,5,0,0,81,0,0,12,5,0,0,0,0,9,185,0,49,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,113,4,4,0,38,0,0,0,16,0,0,0,0,0,10,4,0,0,0,88,0,0,0,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,131,1,0,0,34,131,1,0,0,7,1,0,0,0,0,7,1,131,1,0,0,80,0,0,12,5,0,0,81,0,0,12,5,0,0,0,0,9,197,0,49,82,0,0,83,0,0,0,0,113,4,6,0,38,0,0,0,16,0,0,0,0,0,10,4,113,4,2,0,113,5,0,0,26,6,128,4,0,113,6,4,0,38,0,0,0,38,0,0,0,58,0,0,255,255,255,255,255,6,255,255,255,255,255,6,0,6,0,6,6,0,0,0,0,80,0,0,12,5,0,0,81,0,0,12,5,0,0,0,0,9,20,0,49,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,105,113,4,1,0,113,5,2,0,38,0,0,0,115,13,1,113,4,2,0,113,5,2,0,26,6,128,13,128,113,6,13,128,38,0,0,0,26,0,128,13,128,35,0,128,3,0,34,0,128,3,0,35,30,4,0,0,34,30,4,0,0,7,1,0,0,0,0,7,1,30,4,0,0,80,0,0,7,5,0,0,81,0,0,7,5,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,15,5,0,0,81,0,0,15,5,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,253,4,0,0,81,0,0,253,4,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,38,0,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,50,112,1,51,38,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,8,1,139,4,0,0,8,1,13,128,0,0,35,13,128,2,0,34,13,128,2,0,8,1,148,4,0,0,8,1,13,128,0,0,112,20,6,104,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,231,3,0,0,34,231,3,0,0,7,1,0,0,0,0,7,1,231,3,0,0,35,0,128,1,0,34,0,128,1,0,35,7,3,0,0,34,7,3,0,0,7,1,0,0,0,0,7,1,7,3,0,0,35,0,128,2,0,34,0,128,2,0,35,116,3,0,0,34,116,3,0,0,7,1,0,0,0,0,7,1,116,3,0,0,16,0,0,0,0,0,10,5,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,101,2,0,0,34,101,2,0,0,7,1,0,0,0,0,7,1,101,2,0,0,35,0,128,1,0,34,0,128,1,0,35,157,4,0,0,34,157,4,0,0,7,1,0,0,0,0,7,1,157,4,0,0,35,0,128,127,0,34,0,128,127,0,35,101,2,0,0,34,101,2,0,0,7,1,0,0,0,0,7,1,101,2,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,101,2,0,0,34,101,2,0,0,7,1,0,0,0,0,7,1,101,2,0,0,35,0,128,0,0,34,0,128,0,0,35,82,1,0,0,34,82,1,0,0,7,1,0,0,0,0,7,1,82,1,0,0,35,0,128,127,0,34,0,128,127,0,35,101,2,0,0,34,101,2,0,0,7,1,0,0,0,0,7,1,101,2,0,0,105,80,0,0,20,5,0,0,81,0,0,20,5,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,251,4,0,0,81,0,0,251,4,0,0,0,0,82,0,0,83,0,0,0,0,89,157,0,0,0,0,4,60,113,4,2,0,113,5,0,0,26,6,128,3,0,113,6,3,0,38,0,0,0,38,0,0,0,58,0,0,255,255,255,255,255,6,255,255,255,255,255,6,0,6,0,6,6,0,0,0,0,113,4,1,0,113,5,1,0,38,0,0,0,35,13,128,15,39,34,13,128,15,39,7,1,168,1,0,0,7,1,13,128,0,0,115,13,1,113,4,2,0,113,5,1,0,26,6,128,13,128,113,6,13,128,38,0,0,0,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,113,4,3,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,80,0,0,15,5,0,0,81,0,0,15,5,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,253,4,0,0,81,0,0,253,4,0,0,0,0,82,0,0,83,0,0,0,0,89,101,2,0,0,90,9,9,9,40,254,40,254,39,254,8,8,8,8,39,254,10,254,9,9,9,9,254,81,70,254,8,8,8,40,254,9,9,9,37,254,0,0,0,0,33,5,0,0,90,255,0,0,0,90,0,0,0,0,84,0,0,85,0,0,0,0,113,0,1,0,90] as const;

export const STATS = { ops: 169, bytes: 1336, labels: 31, unknownOps: 0, unresolvedSymbols: 33 } as const;
