// AUTO-GENERATED from data/maps/FallarborTown_BattleTentBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=169, bytes=1132, labels=31, unknownOps=2, unresolvedSymbols=37

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "FallarborTown_BattleTentBattleRoom_MapScripts": 0,
  "FallarborTown_BattleTentBattleRoom_OnTransition": 15,
  "FallarborTown_BattleTentBattleRoom_EventScript_SetPlayerGfx": 21,
  "FallarborTown_BattleTentBattleRoom_EventScript_SetPlayerGfxMale": 43,
  "FallarborTown_BattleTentBattleRoom_EventScript_SetPlayerGfxFemale": 52,
  "FallarborTown_BattleTentBattleRoom_OnFrame": 61,
  "FallarborTown_BattleTentBattleRoom_EventScript_EnterRoom": 69,
  "FallarborTown_BattleTentBattleRoom_EventScript_NextOpponentEnter": 121,
  "FallarborTown_BattleTentBattleRoom_EventScript_WarpToLobbyLost": 290,
  "FallarborTown_BattleTentBattleRoom_EventScript_DefeatedOpponent": 339,
  "FallarborTown_BattleTentBattleRoom_EventScript_IncrementBattleNum": 376,
  "FallarborTown_BattleTentBattleRoom_EventScript_AskContinueChallenge": 553,
  "FallarborTown_BattleTentBattleRoom_EventScript_AskPauseChallenge": 655,
  "FallarborTown_BattleTentBattleRoom_EventScript_AskRetireChallenge": 728,
  "FallarborTown_BattleTentBattleRoom_EventScript_ContinueChallenge": 807,
  "FallarborTown_BattleTentBattleRoom_EventScript_WarpToLobbyWon": 862,
  "FallarborTown_BattleTentBattleRoom_EventScript_ReadyFor2ndOpponent": 959,
  "FallarborTown_BattleTentBattleRoom_EventScript_ReadyFor3rdOpponent": 968,
  "FallarborTown_BattleTentBattleRoom_EventScript_PauseChallenge": 977,
  "FallarborTown_BattleTentBattleRoom_EventScript_ResumeChallenge": 1012,
  "FallarborTown_BattleTentBattleRoom_Movement_PlayerEnter": 1066,
  "FallarborTown_BattleTentBattleRoom_Movement_PlayerFaceBattle": 1071,
  "FallarborTown_BattleTentBattleRoom_Movement_PlayerFaceAttendant": 1073,
  "FallarborTown_BattleTentBattleRoom_Movement_OpponentEnter": 1075,
  "FallarborTown_BattleTentBattleRoom_Movement_OpponentStepForward": 1081,
  "FallarborTown_BattleTentBattleRoom_Movement_OpponentExit": 1083,
  "FallarborTown_BattleTentBattleRoom_Movement_AttendantJump": 1088,
  "FallarborTown_BattleTentBattleRoom_Movement_AttendantApproachPlayer": 1091,
  "FallarborTown_BattleTentBattleRoom_Movement_AttendantReturnToPos": 1096,
  "FallarborTown_BattleTentBattleRoom_OnWarp": 1101,
  "FallarborTown_BattleTentBattleRoom_EventScript_SetUpObjects": 1109,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,15,0,0,0,2,61,0,0,0,4,77,4,0,0,88,21,0,0,0,90,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,15,113,17,100,0,113,16,100,0,15,113,17,105,0,113,16,105,0,15,0,0,0,0,69,0,0,0,106,89,0,0,0,0,80,0,0,42,4,0,0,81,0,0,42,4,0,0,0,0,82,0,0,83,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,113,4,3,0,38,0,0,0,86,0,0,87,0,0,0,0,80,0,0,51,4,0,0,81,0,0,51,4,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,64,4,0,0,81,0,0,64,4,0,0,0,0,9,185,0,49,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,113,4,4,0,38,0,0,0,16,0,0,0,0,0,10,0,0,0,0,88,0,0,0,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,83,1,0,0,34,83,1,0,0,80,0,0,64,4,0,0,81,0,0,64,4,0,0,0,0,9,197,0,49,82,0,0,83,0,0,0,0,113,4,6,0,38,0,0,0,16,0,0,0,0,0,10,0,113,4,2,0,113,5,0,0,26,6,128,4,0,113,6,4,0,38,0,0,0,38,0,0,0,58,0,0,255,255,255,255,255,6,255,255,255,255,255,6,0,6,0,6,6,0,0,0,0,80,0,0,64,4,0,0,81,0,0,64,4,0,0,0,0,9,20,0,49,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,113,4,1,0,113,5,2,0,38,0,0,0,115,13,1,113,4,2,0,113,5,2,0,26,6,128,13,128,113,6,13,128,38,0,0,0,26,0,128,13,128,35,0,128,3,0,34,0,128,3,0,35,94,3,0,0,34,94,3,0,0,80,0,0,59,4,0,0,81,0,0,59,4,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,67,4,0,0,81,0,0,67,4,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,49,4,0,0,81,0,0,49,4,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,38,0,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,50,112,1,51,38,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,2,0,34,13,128,2,0,112,20,6,104,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,39,3,0,0,34,39,3,0,0,35,0,128,1,0,34,0,128,1,0,35,143,2,0,0,34,143,2,0,0,35,0,128,2,0,34,0,128,2,0,35,216,2,0,0,34,216,2,0,0,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,41,2,0,0,34,41,2,0,0,35,0,128,0,0,34,0,128,0,0,35,209,3,0,0,34,209,3,0,0,35,0,128,127,0,34,0,128,127,0,35,41,2,0,0,34,41,2,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,41,2,0,0,34,41,2,0,0,35,0,128,0,0,34,0,128,0,0,35,34,1,0,0,34,34,1,0,0,35,0,128,127,0,34,0,128,127,0,35,41,2,0,0,34,41,2,0,0,105,80,0,0,72,4,0,0,81,0,0,72,4,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,47,4,0,0,81,0,0,47,4,0,0,0,0,82,0,0,83,0,0,0,0,89,121,0,0,0,0,4,60,113,4,2,0,113,5,0,0,26,6,128,3,0,113,6,3,0,38,0,0,0,38,0,0,0,58,0,0,255,255,255,255,255,6,255,255,255,255,255,6,0,6,0,6,6,0,0,0,0,113,4,1,0,113,5,1,0,38,0,0,0,35,13,128,15,39,34,13,128,15,39,115,13,1,113,4,2,0,113,5,1,0,26,6,128,13,128,113,6,13,128,38,0,0,0,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,113,4,3,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,80,0,0,67,4,0,0,81,0,0,67,4,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,49,4,0,0,81,0,0,49,4,0,0,0,0,82,0,0,83,0,0,0,0,89,41,2,0,0,90,9,9,9,40,254,40,254,39,254,8,8,8,8,39,254,10,254,9,9,9,9,254,81,70,254,8,8,8,40,254,9,9,9,37,254,0,0,0,0,85,4,0,0,90,255,0,0,0,90,0,0,0,0,84,0,0,85,0,0,0,0,113,0,1,0,90] as const;

export const STATS = { ops: 169, bytes: 1132, labels: 31, unknownOps: 2, unresolvedSymbols: 37 } as const;
