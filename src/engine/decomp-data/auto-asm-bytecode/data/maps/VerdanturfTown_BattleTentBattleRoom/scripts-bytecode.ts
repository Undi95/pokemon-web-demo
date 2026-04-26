// AUTO-GENERATED from data/maps/VerdanturfTown_BattleTentBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=122, bytes=626, labels=24, unknownOps=12, unresolvedSymbols=33

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "VerdanturfTown_BattleTentBattleRoom_MapScripts": 0,
  "VerdanturfTown_BattleTentBattleRoom_OnTransition": 15,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_SetPlayerGfx": 21,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_SetPlayerGfxMale": 42,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_SetPlayerGfxFemale": 50,
  "VerdanturfTown_BattleTentBattleRoom_OnFrame": 58,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_EnterRoom": 66,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_NextOpponentEnter": 117,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_WarpToLobbyLost": 181,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_DefeatedOpponent": 230,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_AskContinueChallenge": 374,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_AskPauseChallenge": 411,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_AskRetireChallenge": 419,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_ContinueChallenge": 433,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_WarpToLobbyWon": 479,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_PauseChallenge": 528,
  "VerdanturfTown_BattleTentBattleRoom_OnWarp": 563,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_SetUpObjects": 571,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_ReadyFor2ndOpponent": 610,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_ReadyFor3rdOpponent": 618,
  "VerdanturfTown_BattleTentBattleRoom_Movement_SetInvisible": 626,
  "VerdanturfTown_BattleTentBattleRoom_Movement_PlayerEnter": 626,
  "VerdanturfTown_BattleTentBattleRoom_Movement_OpponentEnter": 626,
  "VerdanturfTown_BattleTentBattleRoom_Movement_OpponentExit": 626,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,15,0,0,0,2,58,0,0,0,4,51,2,0,0,88,21,0,0,0,90,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,113,17,100,0,113,16,100,0,113,17,105,0,113,16,105,0,0,0,0,0,66,0,0,0,89,0,0,0,0,80,0,0,114,2,0,0,81,0,0,114,2,0,0,0,0,82,0,0,83,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,113,4,3,0,38,0,0,0,86,0,0,87,0,0,0,0,80,0,0,114,2,0,0,81,0,0,114,2,0,0,0,0,82,0,0,83,0,0,0,0,113,4,4,0,38,0,0,0,16,0,0,0,0,0,10,0,0,0,0,88,0,0,0,0,113,4,2,0,113,5,0,0,26,6,128,4,0,113,6,4,0,38,0,0,0,38,0,0,0,58,0,0,255,255,255,255,255,6,255,255,255,255,255,6,0,6,0,6,6,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,115,13,1,113,4,2,0,113,5,2,0,26,6,128,13,128,113,6,13,128,38,0,0,0,80,0,0,114,2,0,0,81,0,0,114,2,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,38,0,0,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,50,112,1,51,38,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,2,0,34,13,128,2,0,112,20,6,104,1,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,105,89,117,0,0,0,113,4,2,0,113,5,0,0,26,6,128,3,0,113,6,3,0,38,0,0,0,38,0,0,0,58,0,0,255,255,255,255,255,6,255,255,255,255,255,6,0,6,0,6,6,0,0,0,0,104,0,0,0,0,0,0,0,113,4,5,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,0,0,0,0,59,2,0,0,90,0,0,0,0,88,21,0,0,0,113,0,1,0,80,255,0,114,2,0,0,81,255,0,114,2,0,0,0,0,84,0,0,85,0,0,0,0,90,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0] as const;

export const STATS = { ops: 122, bytes: 626, labels: 24, unknownOps: 12, unresolvedSymbols: 33 } as const;
