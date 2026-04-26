// AUTO-GENERATED from data/maps/VerdanturfTown_BattleTentBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=122, bytes=895, labels=24, unknownOps=2, unresolvedSymbols=35

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "VerdanturfTown_BattleTentBattleRoom_MapScripts": 0,
  "VerdanturfTown_BattleTentBattleRoom_OnTransition": 15,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_SetPlayerGfx": 21,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_SetPlayerGfxMale": 43,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_SetPlayerGfxFemale": 52,
  "VerdanturfTown_BattleTentBattleRoom_OnFrame": 61,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_EnterRoom": 69,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_NextOpponentEnter": 120,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_WarpToLobbyLost": 209,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_DefeatedOpponent": 258,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_AskContinueChallenge": 427,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_AskPauseChallenge": 529,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_AskRetireChallenge": 602,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_ContinueChallenge": 681,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_WarpToLobbyWon": 727,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_PauseChallenge": 776,
  "VerdanturfTown_BattleTentBattleRoom_OnWarp": 811,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_SetUpObjects": 819,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_ReadyFor2ndOpponent": 858,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_ReadyFor3rdOpponent": 867,
  "VerdanturfTown_BattleTentBattleRoom_Movement_SetInvisible": 876,
  "VerdanturfTown_BattleTentBattleRoom_Movement_PlayerEnter": 878,
  "VerdanturfTown_BattleTentBattleRoom_Movement_OpponentEnter": 884,
  "VerdanturfTown_BattleTentBattleRoom_Movement_OpponentExit": 890,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,15,0,0,0,2,61,0,0,0,4,43,3,0,0,88,21,0,0,0,90,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,15,113,17,100,0,113,16,100,0,15,113,17,105,0,113,16,105,0,15,0,0,0,0,69,0,0,0,89,0,0,0,0,80,0,0,110,3,0,0,81,0,0,110,3,0,0,0,0,82,0,0,83,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,113,4,3,0,38,0,0,0,86,0,0,87,0,0,0,0,80,0,0,116,3,0,0,81,0,0,116,3,0,0,0,0,82,0,0,83,0,0,0,0,113,4,4,0,38,0,0,0,16,0,0,0,0,0,10,0,0,0,0,88,0,0,0,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,2,1,0,0,34,2,1,0,0,113,4,2,0,113,5,0,0,26,6,128,4,0,113,6,4,0,38,0,0,0,38,0,0,0,58,0,0,255,255,255,255,255,6,255,255,255,255,255,6,0,6,0,6,6,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,115,13,1,113,4,2,0,113,5,2,0,26,6,128,13,128,113,6,13,128,38,0,0,0,26,0,128,13,128,35,0,128,3,0,34,0,128,3,0,35,215,2,0,0,34,215,2,0,0,80,0,0,122,3,0,0,81,0,0,122,3,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,38,0,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,50,112,1,51,38,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,2,0,34,13,128,2,0,112,20,6,104,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,169,2,0,0,34,169,2,0,0,35,0,128,1,0,34,0,128,1,0,35,17,2,0,0,34,17,2,0,0,35,0,128,2,0,34,0,128,2,0,35,90,2,0,0,34,90,2,0,0,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,171,1,0,0,34,171,1,0,0,35,0,128,0,0,34,0,128,0,0,35,8,3,0,0,34,8,3,0,0,35,0,128,127,0,34,0,128,127,0,35,171,1,0,0,34,171,1,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,171,1,0,0,34,171,1,0,0,35,0,128,0,0,34,0,128,0,0,35,209,0,0,0,34,209,0,0,0,35,0,128,127,0,34,0,128,127,0,35,171,1,0,0,34,171,1,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,105,89,120,0,0,0,113,4,2,0,113,5,0,0,26,6,128,3,0,113,6,3,0,38,0,0,0,38,0,0,0,58,0,0,255,255,255,255,255,6,255,255,255,255,255,6,0,6,0,6,6,0,0,0,0,104,0,0,0,0,0,0,0,113,4,5,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,0,0,0,0,51,3,0,0,90,0,0,0,0,88,21,0,0,0,113,0,1,0,80,255,0,108,3,0,0,81,255,0,108,3,0,0,0,0,84,0,0,85,0,0,0,0,90,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,84,254,85,9,9,9,3,254,8,8,8,8,2,254,9,9,9,9,254] as const;

export const STATS = { ops: 122, bytes: 895, labels: 24, unknownOps: 2, unresolvedSymbols: 35 } as const;
