// AUTO-GENERATED from data/maps/VerdanturfTown_BattleTentBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=122, bytes=1087, labels=24, unknownOps=0, unresolvedSymbols=31

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "VerdanturfTown_BattleTentBattleRoom_MapScripts": 0,
  "VerdanturfTown_BattleTentBattleRoom_OnTransition": 15,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_SetPlayerGfx": 21,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_SetPlayerGfxMale": 67,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_SetPlayerGfxFemale": 76,
  "VerdanturfTown_BattleTentBattleRoom_OnFrame": 85,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_EnterRoom": 93,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_NextOpponentEnter": 156,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_WarpToLobbyLost": 257,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_DefeatedOpponent": 306,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_AskContinueChallenge": 487,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_AskPauseChallenge": 649,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_AskRetireChallenge": 758,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_ContinueChallenge": 873,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_WarpToLobbyWon": 919,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_PauseChallenge": 968,
  "VerdanturfTown_BattleTentBattleRoom_OnWarp": 1003,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_SetUpObjects": 1011,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_ReadyFor2ndOpponent": 1050,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_ReadyFor3rdOpponent": 1059,
  "VerdanturfTown_BattleTentBattleRoom_Movement_SetInvisible": 1068,
  "VerdanturfTown_BattleTentBattleRoom_Movement_PlayerEnter": 1070,
  "VerdanturfTown_BattleTentBattleRoom_Movement_OpponentEnter": 1076,
  "VerdanturfTown_BattleTentBattleRoom_Movement_OpponentExit": 1082,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,15,0,0,0,2,85,0,0,0,4,235,3,0,0,88,21,0,0,0,90,161,35,13,128,0,0,34,13,128,0,0,7,1,67,0,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,76,0,0,0,7,1,13,128,0,0,15,113,17,100,0,113,16,100,0,15,113,17,105,0,113,16,105,0,15,0,0,0,0,93,0,0,0,89,0,0,0,0,80,0,0,46,4,0,0,81,0,0,46,4,0,0,0,0,82,0,0,83,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,5,231,1,0,0,7,5,13,128,0,0,113,4,3,0,38,0,0,0,86,0,0,87,0,0,0,0,80,0,0,52,4,0,0,81,0,0,52,4,0,0,0,0,82,0,0,83,0,0,0,0,113,4,4,0,38,0,0,0,16,0,0,0,0,0,10,4,0,0,0,88,0,0,0,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,50,1,0,0,34,50,1,0,0,7,1,0,0,0,0,7,1,50,1,0,0,113,4,2,0,113,5,0,0,26,6,128,4,0,113,6,4,0,38,0,0,0,38,0,0,0,58,0,0,255,255,255,255,255,6,255,255,255,255,255,6,0,6,0,6,6,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,115,13,1,113,4,2,0,113,5,2,0,26,6,128,13,128,113,6,13,128,38,0,0,0,26,0,128,13,128,35,0,128,3,0,34,0,128,3,0,35,151,3,0,0,34,151,3,0,0,7,1,0,0,0,0,7,1,151,3,0,0,80,0,0,58,4,0,0,81,0,0,58,4,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,38,0,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,50,112,1,51,38,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,8,1,26,4,0,0,8,1,13,128,0,0,35,13,128,2,0,34,13,128,2,0,8,1,35,4,0,0,8,1,13,128,0,0,112,20,6,104,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,105,3,0,0,34,105,3,0,0,7,1,0,0,0,0,7,1,105,3,0,0,35,0,128,1,0,34,0,128,1,0,35,137,2,0,0,34,137,2,0,0,7,1,0,0,0,0,7,1,137,2,0,0,35,0,128,2,0,34,0,128,2,0,35,246,2,0,0,34,246,2,0,0,7,1,0,0,0,0,7,1,246,2,0,0,16,0,0,0,0,0,10,5,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,231,1,0,0,34,231,1,0,0,7,1,0,0,0,0,7,1,231,1,0,0,35,0,128,1,0,34,0,128,1,0,35,200,3,0,0,34,200,3,0,0,7,1,0,0,0,0,7,1,200,3,0,0,35,0,128,127,0,34,0,128,127,0,35,231,1,0,0,34,231,1,0,0,7,1,0,0,0,0,7,1,231,1,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,231,1,0,0,34,231,1,0,0,7,1,0,0,0,0,7,1,231,1,0,0,35,0,128,0,0,34,0,128,0,0,35,1,1,0,0,34,1,1,0,0,7,1,0,0,0,0,7,1,1,1,0,0,35,0,128,127,0,34,0,128,127,0,35,231,1,0,0,34,231,1,0,0,7,1,0,0,0,0,7,1,231,1,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,105,89,156,0,0,0,113,4,2,0,113,5,0,0,26,6,128,3,0,113,6,3,0,38,0,0,0,38,0,0,0,58,0,0,255,255,255,255,255,6,255,255,255,255,255,6,0,6,0,6,6,0,0,0,0,104,0,0,0,0,0,0,0,113,4,5,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,0,0,0,0,243,3,0,0,90,0,0,0,0,88,21,0,0,0,113,0,1,0,80,255,0,44,4,0,0,81,255,0,44,4,0,0,0,0,84,0,0,85,0,0,0,0,90,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,84,254,85,9,9,9,3,254,8,8,8,8,2,254,9,9,9,9,254] as const;

export const STATS = { ops: 122, bytes: 1087, labels: 24, unknownOps: 0, unresolvedSymbols: 31 } as const;
