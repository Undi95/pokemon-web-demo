// AUTO-GENERATED from data/maps/VerdanturfTown_BattleTentBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=122, bytes=1106, labels=24, unknownOps=0, unresolvedSymbols=66

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "VerdanturfTown_BattleTentBattleRoom_MapScripts": 0,
  "VerdanturfTown_BattleTentBattleRoom_OnTransition": 15,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_SetPlayerGfx": 21,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_SetPlayerGfxMale": 67,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_SetPlayerGfxFemale": 78,
  "VerdanturfTown_BattleTentBattleRoom_OnFrame": 89,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_EnterRoom": 97,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_NextOpponentEnter": 162,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_WarpToLobbyLost": 263,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_DefeatedOpponent": 315,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_AskContinueChallenge": 505,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_AskPauseChallenge": 669,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_AskRetireChallenge": 778,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_ContinueChallenge": 891,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_WarpToLobbyWon": 937,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_PauseChallenge": 989,
  "VerdanturfTown_BattleTentBattleRoom_OnWarp": 1025,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_SetUpObjects": 1033,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_ReadyFor2ndOpponent": 1073,
  "VerdanturfTown_BattleTentBattleRoom_EventScript_ReadyFor3rdOpponent": 1080,
  "VerdanturfTown_BattleTentBattleRoom_Movement_SetInvisible": 1087,
  "VerdanturfTown_BattleTentBattleRoom_Movement_PlayerEnter": 1089,
  "VerdanturfTown_BattleTentBattleRoom_Movement_OpponentEnter": 1095,
  "VerdanturfTown_BattleTentBattleRoom_Movement_OpponentExit": 1101,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,15,0,0,0,0,89,0,0,0,0,1,4,0,0,5,21,0,0,0,3,161,35,0,0,0,0,34,0,0,0,0,7,1,67,0,0,0,7,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,78,0,0,0,7,1,0,0,0,0,4,23,0,0,0,0,23,0,0,0,0,4,23,0,0,0,0,23,0,0,0,0,4,0,0,0,0,97,0,0,0,89,0,0,0,0,80,0,0,65,4,0,0,81,0,0,65,4,0,0,0,0,82,0,0,83,0,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,5,249,1,0,0,7,5,0,0,0,0,23,0,0,0,0,38,0,0,0,86,0,0,87,0,0,0,0,80,0,0,71,4,0,0,81,0,0,71,4,0,0,0,0,82,0,0,83,0,0,0,0,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,103,5,0,0,0,0,26,0,0,0,0,35,0,0,1,0,34,0,0,1,0,35,59,1,0,0,34,59,1,0,0,7,1,0,0,0,0,7,1,59,1,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,38,0,0,0,58,0,0,0,255,255,255,255,6,255,255,255,255,0,6,0,6,0,6,6,0,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,24,0,0,1,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,26,0,0,0,0,35,0,0,3,0,34,0,0,3,0,35,169,3,0,0,34,169,3,0,0,7,1,0,0,0,0,7,1,169,3,0,0,80,0,0,77,4,0,0,81,0,0,77,4,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,38,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,50,112,1,51,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,1,0,34,0,0,1,0,8,1,49,4,0,0,8,1,0,0,0,0,35,0,0,2,0,34,0,0,2,0,8,1,56,4,0,0,8,1,0,0,0,0,112,20,6,0,1,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,123,3,0,0,34,123,3,0,0,7,1,0,0,0,0,7,1,123,3,0,0,35,0,0,1,0,34,0,0,1,0,35,157,2,0,0,34,157,2,0,0,7,1,0,0,0,0,7,1,157,2,0,0,35,0,0,2,0,34,0,0,2,0,35,10,3,0,0,34,10,3,0,0,7,1,0,0,0,0,7,1,10,3,0,0,16,0,0,0,0,0,10,5,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,249,1,0,0,34,249,1,0,0,7,1,0,0,0,0,7,1,249,1,0,0,35,0,0,1,0,34,0,0,1,0,35,221,3,0,0,34,221,3,0,0,7,1,0,0,0,0,7,1,221,3,0,0,35,0,0,0,0,34,0,0,0,0,35,249,1,0,0,34,249,1,0,0,7,1,0,0,0,0,7,1,249,1,0,0,104,0,0,0,0,103,113,20,8,0,1,0,26,0,0,0,0,35,0,0,1,0,34,0,0,1,0,35,249,1,0,0,34,249,1,0,0,7,1,0,0,0,0,7,1,249,1,0,0,35,0,0,0,0,34,0,0,0,0,35,7,1,0,0,34,7,1,0,0,7,1,0,0,0,0,7,1,7,1,0,0,35,0,0,0,0,34,0,0,0,0,35,249,1,0,0,34,249,1,0,0,7,1,0,0,0,0,7,1,249,1,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,105,6,162,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,38,0,0,0,58,0,0,0,255,255,255,255,6,255,255,255,255,0,6,0,6,0,6,6,0,0,0,0,104,0,0,0,0,103,23,0,0,0,0,23,0,0,0,0,38,0,0,0,48,55,0,49,152,0,23,0,0,0,0,38,0,0,0,3,0,0,0,0,9,4,0,0,90,0,0,0,0,5,21,0,0,0,23,0,0,1,0,80,0,0,63,4,0,0,81,0,0,63,4,0,0,0,0,84,0,0,85,0,0,0,0,3,104,0,0,0,0,103,4,104,0,0,0,0,103,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] as const;

export const STATS = { ops: 122, bytes: 1106, labels: 24, unknownOps: 0, unresolvedSymbols: 66 } as const;
