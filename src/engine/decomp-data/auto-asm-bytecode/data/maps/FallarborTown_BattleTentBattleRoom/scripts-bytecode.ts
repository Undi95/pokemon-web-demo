// AUTO-GENERATED from data/maps/FallarborTown_BattleTentBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=169, bytes=847, labels=31, unknownOps=14, unresolvedSymbols=35

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "FallarborTown_BattleTentBattleRoom_MapScripts": 0,
  "FallarborTown_BattleTentBattleRoom_OnTransition": 15,
  "FallarborTown_BattleTentBattleRoom_EventScript_SetPlayerGfx": 21,
  "FallarborTown_BattleTentBattleRoom_EventScript_SetPlayerGfxMale": 42,
  "FallarborTown_BattleTentBattleRoom_EventScript_SetPlayerGfxFemale": 50,
  "FallarborTown_BattleTentBattleRoom_OnFrame": 58,
  "FallarborTown_BattleTentBattleRoom_EventScript_EnterRoom": 66,
  "FallarborTown_BattleTentBattleRoom_EventScript_NextOpponentEnter": 118,
  "FallarborTown_BattleTentBattleRoom_EventScript_WarpToLobbyLost": 262,
  "FallarborTown_BattleTentBattleRoom_EventScript_DefeatedOpponent": 311,
  "FallarborTown_BattleTentBattleRoom_EventScript_IncrementBattleNum": 348,
  "FallarborTown_BattleTentBattleRoom_EventScript_AskContinueChallenge": 500,
  "FallarborTown_BattleTentBattleRoom_EventScript_AskPauseChallenge": 537,
  "FallarborTown_BattleTentBattleRoom_EventScript_AskRetireChallenge": 545,
  "FallarborTown_BattleTentBattleRoom_EventScript_ContinueChallenge": 559,
  "FallarborTown_BattleTentBattleRoom_EventScript_WarpToLobbyWon": 614,
  "FallarborTown_BattleTentBattleRoom_EventScript_ReadyFor2ndOpponent": 711,
  "FallarborTown_BattleTentBattleRoom_EventScript_ReadyFor3rdOpponent": 719,
  "FallarborTown_BattleTentBattleRoom_EventScript_PauseChallenge": 727,
  "FallarborTown_BattleTentBattleRoom_EventScript_ResumeChallenge": 762,
  "FallarborTown_BattleTentBattleRoom_Movement_PlayerEnter": 816,
  "FallarborTown_BattleTentBattleRoom_Movement_PlayerFaceBattle": 816,
  "FallarborTown_BattleTentBattleRoom_Movement_PlayerFaceAttendant": 816,
  "FallarborTown_BattleTentBattleRoom_Movement_OpponentEnter": 816,
  "FallarborTown_BattleTentBattleRoom_Movement_OpponentStepForward": 816,
  "FallarborTown_BattleTentBattleRoom_Movement_OpponentExit": 816,
  "FallarborTown_BattleTentBattleRoom_Movement_AttendantJump": 816,
  "FallarborTown_BattleTentBattleRoom_Movement_AttendantApproachPlayer": 816,
  "FallarborTown_BattleTentBattleRoom_Movement_AttendantReturnToPos": 816,
  "FallarborTown_BattleTentBattleRoom_OnWarp": 816,
  "FallarborTown_BattleTentBattleRoom_EventScript_SetUpObjects": 824,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,15,0,0,0,2,58,0,0,0,4,48,3,0,0,88,21,0,0,0,90,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,113,17,100,0,113,16,100,0,113,17,105,0,113,16,105,0,0,0,0,0,66,0,0,0,106,89,0,0,0,0,80,0,0,48,3,0,0,81,0,0,48,3,0,0,0,0,82,0,0,83,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,113,4,3,0,38,0,0,0,86,0,0,87,0,0,0,0,80,0,0,48,3,0,0,81,0,0,48,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,48,3,0,0,81,0,0,48,3,0,0,0,0,9,185,0,49,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,113,4,4,0,38,0,0,0,16,0,0,0,0,0,10,0,0,0,0,88,0,0,0,0,80,0,0,48,3,0,0,81,0,0,48,3,0,0,0,0,9,197,0,49,82,0,0,83,0,0,0,0,113,4,6,0,38,0,0,0,16,0,0,0,0,0,10,0,113,4,2,0,113,5,0,0,26,6,128,4,0,113,6,4,0,38,0,0,0,38,0,0,0,58,0,0,255,255,255,255,255,6,255,255,255,255,255,6,0,6,0,6,6,0,0,0,0,80,0,0,48,3,0,0,81,0,0,48,3,0,0,0,0,9,20,0,49,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,105,113,4,1,0,113,5,2,0,38,0,0,0,115,13,1,113,4,2,0,113,5,2,0,26,6,128,13,128,113,6,13,128,38,0,0,0,80,0,0,48,3,0,0,81,0,0,48,3,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,48,3,0,0,81,0,0,48,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,48,3,0,0,81,0,0,48,3,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,38,0,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,50,112,1,51,38,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,2,0,34,13,128,2,0,112,20,6,104,1,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,105,80,0,0,48,3,0,0,81,0,0,48,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,48,3,0,0,81,0,0,48,3,0,0,0,0,82,0,0,83,0,0,0,0,89,118,0,0,0,0,4,60,113,4,2,0,113,5,0,0,26,6,128,3,0,113,6,3,0,38,0,0,0,38,0,0,0,58,0,0,255,255,255,255,255,6,255,255,255,255,255,6,0,6,0,6,6,0,0,0,0,113,4,1,0,113,5,1,0,38,0,0,0,35,13,128,15,39,34,13,128,15,39,115,13,1,113,4,2,0,113,5,1,0,26,6,128,13,128,113,6,13,128,38,0,0,0,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,113,4,3,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,80,0,0,48,3,0,0,81,0,0,48,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,48,3,0,0,81,0,0,48,3,0,0,0,0,82,0,0,83,0,0,0,0,89,244,1,0,0,90,0,0,0,0,56,3,0,0,90,255,0,0,0,90,0,0,0,0,84,0,0,85,0,0,0,0,113,0,1,0,90] as const;

export const STATS = { ops: 169, bytes: 847, labels: 31, unknownOps: 14, unresolvedSymbols: 35 } as const;
