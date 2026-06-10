// AUTO-GENERATED from data/maps/VerdanturfTown_BattleTentLobby/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=236, bytes=1858, labels=45, unknownOps=0, unresolvedSymbols=97

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "VerdanturfTown_BattleTentLobby_MapScripts": 0,
  "VerdanturfTown_BattleTentLobby_OnWarp": 10,
  "VerdanturfTown_BattleTentLobby_EventScript_TurnPlayerNorth": 18,
  "VerdanturfTown_BattleTentLobby_OnFrame": 28,
  "VerdanturfTown_BattleTentLobby_EventScript_GetChallengeStatus": 68,
  "VerdanturfTown_BattleTentLobby_EventScript_QuitWithoutSaving": 78,
  "VerdanturfTown_BattleTentLobby_EventScript_WonChallenge": 143,
  "VerdanturfTown_BattleTentLobby_EventScript_GivePrize": 209,
  "VerdanturfTown_BattleTentLobby_EventScript_NoRoomForPrize": 313,
  "VerdanturfTown_BattleTentLobby_EventScript_PrizeWaiting": 330,
  "VerdanturfTown_BattleTentLobby_EventScript_LostChallenge": 345,
  "VerdanturfTown_BattleTentLobby_EventScript_ResumeChallenge": 410,
  "VerdanturfTown_BattleTentLobby_EventScript_Attendant": 477,
  "VerdanturfTown_BattleTentLobby_EventScript_AskEnterChallenge": 522,
  "VerdanturfTown_BattleTentLobby_EventScript_TryEnterChallenge": 666,
  "VerdanturfTown_BattleTentLobby_EventScript_SaveBeforeChallenge": 891,
  "VerdanturfTown_BattleTentLobby_EventScript_EnterChallenge": 1017,
  "VerdanturfTown_BattleTentLobby_EventScript_ExplainChallenge": 1079,
  "VerdanturfTown_BattleTentLobby_EventScript_NotEnoughValidMons": 1092,
  "VerdanturfTown_BattleTentLobby_EventScript_NotEnoughValidMonsLv50": 1161,
  "VerdanturfTown_BattleTentLobby_EventScript_NotEnoughValidMonsLvOpen": 1174,
  "VerdanturfTown_BattleTentLobby_EventScript_CancelChallengeSaveFailed": 1187,
  "VerdanturfTown_BattleTentLobby_EventScript_LoadPartyCancelChallenge": 1216,
  "VerdanturfTown_BattleTentLobby_EventScript_CancelChallenge": 1220,
  "VerdanturfTown_BattleTentLobby_EventScript_EndCancelChallenge": 1228,
  "VerdanturfTown_BattleTentLobby_EventScript_WalkToDoor": 1230,
  "VerdanturfTown_BattleTentLobby_Movement_WalkToDoor": 1323,
  "VerdanturfTown_BattleTentLobby_Movement_AttendantEnterDoor": 1327,
  "VerdanturfTown_BattleTentLobby_Movement_PlayerEnterDoor": 1330,
  "VerdanturfTown_BattleTentLobby_EventScript_AttractGiver": 1334,
  "VerdanturfTown_BattleTentLobby_EventScript_ReceivedAttract": 1400,
  "VerdanturfTown_BattleTentLobby_EventScript_Boy1": 1410,
  "VerdanturfTown_BattleTentLobby_EventScript_Boy2": 1419,
  "VerdanturfTown_BattleTentLobby_EventScript_Scott": 1430,
  "VerdanturfTown_BattleTentLobby_EventScript_ScottAlreadySpokenTo": 1459,
  "VerdanturfTown_BattleTentLobby_EventScript_LittleBoy": 1469,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesBoard": 1480,
  "VerdanturfTown_BattleTentLobby_EventScript_ReadRulesBoard": 1495,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesLevel": 1772,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesBasics": 1786,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesNature": 1800,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesMoves": 1814,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesUnderpowered": 1828,
  "VerdanturfTown_BattleTentLobby_EventScript_RulesWhenInDanger": 1842,
  "VerdanturfTown_BattleTentLobby_EventScript_ExitRules": 1856,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,28,0,0,0,0,10,0,0,0,0,0,0,0,18,0,0,0,23,0,0,1,0,92,0,0,0,3,0,0,0,0,68,0,0,0,0,0,0,0,78,0,0,0,0,0,0,0,154,1,0,0,0,0,0,0,143,0,0,0,0,0,0,0,89,1,0,0,23,0,0,0,0,38,0,0,0,3,106,16,0,0,0,0,0,10,4,105,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,255,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,108,3,106,16,0,0,0,0,0,10,4,104,0,0,0,0,103,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,48,0,0,49,16,0,0,0,0,0,10,4,23,0,0,0,0,38,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,57,1,0,0,34,57,1,0,0,7,1,0,0,0,0,7,1,57,1,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,104,0,0,0,0,103,50,0,0,51,16,0,0,0,0,0,10,4,105,23,0,0,255,0,108,3,16,0,0,0,0,0,10,4,103,105,23,0,0,255,0,108,3,106,16,0,0,0,0,0,10,4,6,209,0,0,0,3,106,104,0,0,0,0,103,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,48,0,0,49,16,0,0,0,0,0,10,4,105,23,0,0,255,0,108,3,106,16,0,0,0,0,0,10,4,104,0,0,0,0,103,23,0,0,0,0,23,0,0,0,0,38,0,0,0,48,0,0,49,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,255,0,6,249,3,0,0,107,91,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,5,74,1,0,0,7,5,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,104,0,0,0,0,103,112,17,6,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,154,2,0,0,34,154,2,0,0,7,1,0,0,0,0,7,1,154,2,0,0,35,0,0,1,0,34,0,0,1,0,35,55,4,0,0,34,55,4,0,0,7,1,0,0,0,0,7,1,55,4,0,0,35,0,0,2,0,34,0,0,2,0,35,196,4,0,0,34,196,4,0,0,7,1,0,0,0,0,7,1,196,4,0,0,35,0,0,0,0,34,0,0,0,0,35,196,4,0,0,34,196,4,0,0,7,1,0,0,0,0,7,1,196,4,0,0,23,0,0,0,0,23,0,0,0,0,23,0,0,2,0,23,0,0,0,0,38,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,68,4,0,0,7,1,0,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,152,0,23,0,0,1,0,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,192,4,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,5,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,192,4,0,0,34,192,4,0,0,7,1,0,0,0,0,7,1,192,4,0,0,35,0,0,1,0,34,0,0,1,0,35,123,3,0,0,34,123,3,0,0,7,1,0,0,0,0,7,1,123,3,0,0,35,0,0,0,0,34,0,0,0,0,35,192,4,0,0,34,192,4,0,0,7,1,0,0,0,0,7,1,192,4,0,0,23,0,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,255,255,23,0,0,255,255,38,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,38,0,0,0,105,41,2,0,5,0,0,0,0,23,0,0,255,0,35,0,0,0,0,34,0,0,0,0,7,1,163,4,0,0,7,1,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,105,5,206,4,0,0,58,0,0,0,255,255,255,255,2,255,255,255,255,0,2,0,7,0,2,7,0,0,0,23,0,0,0,0,0,3,16,0,0,0,0,0,10,4,6,10,2,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,137,4,0,0,34,137,4,0,0,7,1,0,0,0,0,7,1,137,4,0,0,35,0,0,0,0,34,0,0,0,0,35,150,4,0,0,34,150,4,0,0,7,1,0,0,0,0,7,1,150,4,0,0,16,0,0,0,0,0,10,4,6,204,4,0,0,16,0,0,0,0,0,10,4,6,204,4,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,6,196,4,0,0,38,0,0,0,16,0,0,0,0,0,10,4,109,3,80,0,0,43,5,0,0,81,0,0,43,5,0,0,0,0,80,0,0,43,5,0,0,81,0,0,43,5,0,0,0,0,82,0,0,83,0,0,0,0,173,6,0,1,0,175,80,0,0,47,5,0,0,81,0,0,47,5,0,0,0,0,80,0,0,50,5,0,0,81,0,0,50,5,0,0,0,0,82,0,0,83,0,0,0,0,174,6,0,1,0,175,4,0,0,0,0,0,0,0,0,0,0,0,107,91,44,0,0,7,1,120,5,0,0,16,0,0,0,0,0,10,4,27,0,0,0,0,27,0,0,1,0,10,0,35,0,0,0,0,34,0,0,0,0,7,1,0,0,0,0,7,1,0,0,0,0,42,0,0,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,2,3,107,16,0,0,0,0,0,10,4,109,3,107,91,44,0,0,7,1,179,5,0,0,16,0,0,0,0,0,10,4,24,0,0,1,0,42,0,0,109,3,16,0,0,0,0,0,10,4,109,3,107,16,0,0,0,0,0,10,4,109,3,106,16,0,0,0,0,0,10,4,6,215,5,0,0,3,104,0,0,0,0,103,23,0,0,0,0,38,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,236,6,0,0,34,236,6,0,0,7,1,0,0,0,0,7,1,236,6,0,0,35,0,0,1,0,34,0,0,1,0,35,250,6,0,0,34,250,6,0,0,7,1,0,0,0,0,7,1,250,6,0,0,35,0,0,2,0,34,0,0,2,0,35,8,7,0,0,34,8,7,0,0,7,1,0,0,0,0,7,1,8,7,0,0,35,0,0,3,0,34,0,0,3,0,35,22,7,0,0,34,22,7,0,0,7,1,0,0,0,0,7,1,22,7,0,0,35,0,0,4,0,34,0,0,4,0,35,36,7,0,0,34,36,7,0,0,7,1,0,0,0,0,7,1,36,7,0,0,35,0,0,5,0,34,0,0,5,0,35,50,7,0,0,34,50,7,0,0,7,1,0,0,0,0,7,1,50,7,0,0,35,0,0,6,0,34,0,0,6,0,35,64,7,0,0,34,64,7,0,0,7,1,0,0,0,0,7,1,64,7,0,0,35,0,0,0,0,34,0,0,0,0,35,64,7,0,0,34,64,7,0,0,7,1,0,0,0,0,7,1,64,7,0,0,3,16,0,0,0,0,0,10,4,6,215,5,0,0,3,16,0,0,0,0,0,10,4,6,215,5,0,0,3,16,0,0,0,0,0,10,4,6,215,5,0,0,3,16,0,0,0,0,0,10,4,6,215,5,0,0,3,16,0,0,0,0,0,10,4,6,215,5,0,0,3,16,0,0,0,0,0,10,4,6,215,5,0,0,3,108,3] as const;

export const STATS = { ops: 236, bytes: 1858, labels: 45, unknownOps: 0, unresolvedSymbols: 97 } as const;
