// AUTO-GENERATED from data/maps/BattleFrontier_BattleTowerMultiBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=318, bytes=2314, labels=58, unknownOps=2, unresolvedSymbols=47

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleTowerMultiBattleRoom_MapScripts": 0,
  "BattleFrontier_BattleTowerMultiBattleRoom_OnTransition": 15,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_SetObjGfx": 36,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_SetPlayerGfxFemale": 60,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_SetLinkPlayerGfx": 65,
  "BattleFrontier_BattleTowerMultiBattleRoom_OnWarp": 70,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_HidePlayerObj": 78,
  "BattleFrontier_BattleTowerMultiBattleRoom_OnFrame": 84,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_EnterRoom": 92,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_OpponentsEnter": 264,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_DoOpponentIntrosLink": 439,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_DoTowerBattle": 533,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_WarpToLobbyLost": 563,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_DefeatedOpponents": 613,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_RetorePartyMsgLink": 810,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_RestoreParty": 820,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskReadyForOpponents": 854,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskReadyForOpponentsNoRecord": 1006,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskRecordBattle": 1096,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_RecordBattle": 1175,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskPauseChallenge": 1185,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskRetireChallenge": 1258,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ContinueChallenge": 1337,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_WarpToLobbyWon": 1427,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_PauseChallenge": 1477,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyForNextOpponentSet": 1512,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor2ndOpponentSet": 1652,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor3rdOpponentSet": 1661,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor4thOpponentSet": 1670,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor5thOpponentSet": 1679,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor6thOpponentSet": 1688,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor7thOpponentSet": 1697,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyForNextOpponentSetLink": 1706,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor2ndOpponentSetLink": 1836,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor3rdOpponentSetLink": 1850,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor4thOpponentSetLink": 1864,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor5thOpponentSetLink": 1878,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor6thOpponentSetLink": 1892,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor7thOpponentSetLink": 1906,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_LinkDelayForMsg": 1920,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskReadyForOpponentsLink": 1926,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskReadyForOpponentsLinkNoRecord": 2026,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ContinueChallengeLink": 2097,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskRecordBattleLink": 2133,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskRetireChallengeLink": 2206,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_RetireChallengeLink": 2236,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReconnectLink": 2262,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_PlayerEnterRoom": 2267,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_PartnerEnterRoom": 2273,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_FaceAttendant": 2279,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_FaceBattle": 2281,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_Opponent1Enter": 2283,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_Opponent2Enter": 2289,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_Opponent2Exit": 2295,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_Opponent1Exit": 2300,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_AttendantApproachPlayer": 2305,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_AttendantReturnToPos": 2308,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_WalkInPlaceLeft": 2312,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,15,0,0,0,4,70,0,0,0,2,84,0,0,0,35,206,64,2,0,34,206,64,2,0,35,206,64,3,0,34,206,64,3,0,90,113,4,14,0,38,0,0,0,161,35,13,128,1,0,34,13,128,1,0,113,31,0,0,15,113,31,89,0,15,38,0,0,0,15,0,0,0,0,78,0,0,0,90,255,0,0,0,90,0,0,0,0,92,0,0,0,113,0,1,0,80,0,0,219,8,0,0,81,0,0,219,8,0,0,0,0,80,0,0,225,8,0,0,81,0,0,225,8,0,0,0,0,82,0,0,83,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,80,0,0,1,9,0,0,81,0,0,1,9,0,0,0,0,80,0,0,1,9,0,0,81,0,0,1,9,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,231,8,0,0,81,0,0,231,8,0,0,0,0,80,0,0,231,8,0,0,81,0,0,231,8,0,0,0,0,82,0,0,83,0,0,0,0,113,4,2,0,113,5,6,0,26,6,128,1,0,113,6,1,0,38,0,0,0,89,86,3,0,0,113,4,3,0,38,0,0,0,86,0,0,87,0,0,0,0,86,0,0,87,0,0,0,0,80,0,0,235,8,0,0,81,0,0,235,8,0,0,0,0,80,0,0,241,8,0,0,81,0,0,241,8,0,0,0,0,82,0,0,83,0,0,0,0,35,206,64,3,0,34,206,64,3,0,113,4,7,0,113,5,0,0,38,0,0,0,4,15,80,0,0,8,9,0,0,81,0,0,8,9,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,0,0,0,113,4,7,0,113,5,1,0,38,0,0,0,80,0,0,8,9,0,0,81,0,0,8,9,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,0,0,0,89,21,2,0,0,113,4,16,0,113,5,0,0,38,0,0,0,4,15,80,0,0,8,9,0,0,81,0,0,8,9,0,0,0,0,82,0,0,83,0,0,0,0,156,0,0,0,0,0,0,0,4,48,113,4,16,0,113,5,1,0,38,0,0,0,80,0,0,8,9,0,0,81,0,0,8,9,0,0,0,0,82,0,0,83,0,0,0,0,156,0,0,0,0,0,0,0,4,48,88,0,0,0,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,101,2,0,0,34,101,2,0,0,113,4,2,0,113,5,0,0,26,6,128,4,0,113,6,4,0,38,0,0,0,113,4,2,0,113,5,3,0,113,6,255,255,38,0,0,0,113,4,3,0,38,0,0,0,89,0,0,0,0,88,0,0,0,0,113,4,4,0,38,0,0,0,26,0,128,13,128,35,0,128,7,0,34,0,128,7,0,35,147,5,0,0,34,147,5,0,0,80,0,0,247,8,0,0,81,0,0,247,8,0,0,0,0,80,0,0,252,8,0,0,81,0,0,252,8,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,1,9,0,0,81,0,0,1,9,0,0,0,0,80,0,0,1,9,0,0,81,0,0,1,9,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,231,8,0,0,81,0,0,231,8,0,0,0,0,80,0,0,231,8,0,0,81,0,0,231,8,0,0,0,0,82,0,0,83,0,0,0,0,35,206,64,3,0,34,206,64,3,0,16,0,0,0,0,0,10,0,89,52,3,0,0,156,0,0,0,0,0,0,0,4,48,38,0,0,0,113,4,3,0,113,5,2,0,38,0,0,0,35,206,64,3,0,34,206,64,3,0,50,112,1,51,38,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,88,232,5,0,0,35,206,64,3,0,34,206,64,3,0,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,112,19,4,103,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,57,5,0,0,34,57,5,0,0,35,0,128,1,0,34,0,128,1,0,35,72,4,0,0,34,72,4,0,0,35,0,128,2,0,34,0,128,2,0,35,161,4,0,0,34,161,4,0,0,35,0,128,3,0,34,0,128,3,0,35,234,4,0,0,34,234,4,0,0,35,0,128,127,0,34,0,128,127,0,35,86,3,0,0,34,86,3,0,0,112,20,6,104,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,57,5,0,0,34,57,5,0,0,35,0,128,1,0,34,0,128,1,0,35,161,4,0,0,34,161,4,0,0,35,0,128,2,0,34,0,128,2,0,35,234,4,0,0,34,234,4,0,0,35,0,128,127,0,34,0,128,127,0,35,86,3,0,0,34,86,3,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,86,3,0,0,34,86,3,0,0,35,0,128,0,0,34,0,128,0,0,35,151,4,0,0,34,151,4,0,0,35,0,128,127,0,34,0,128,127,0,35,86,3,0,0,34,86,3,0,0,88,0,0,0,0,89,86,3,0,0,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,86,3,0,0,34,86,3,0,0,35,0,128,0,0,34,0,128,0,0,35,197,5,0,0,34,197,5,0,0,35,0,128,127,0,34,0,128,127,0,35,86,3,0,0,34,86,3,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,86,3,0,0,34,86,3,0,0,35,0,128,0,0,34,0,128,0,0,35,51,2,0,0,34,51,2,0,0,35,0,128,127,0,34,0,128,127,0,35,86,3,0,0,34,86,3,0,0,105,43,0,0,80,0,0,233,8,0,0,81,0,0,233,8,0,0,0,0,80,0,0,233,8,0,0,81,0,0,233,8,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,4,9,0,0,81,0,0,4,9,0,0,0,0,80,0,0,4,9,0,0,81,0,0,4,9,0,0,0,0,82,0,0,83,0,0,0,0,89,8,1,0,0,90,113,4,2,0,113,5,0,0,26,6,128,3,0,113,6,3,0,38,0,0,0,113,4,2,0,113,5,3,0,113,6,255,255,38,0,0,0,113,4,3,0,38,0,0,0,89,0,0,0,0,104,0,0,0,0,0,0,0,113,4,6,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,35,206,64,3,0,34,206,64,3,0,26,0,0,13,128,26,0,128,0,0,35,0,128,1,0,34,0,128,1,0,35,116,6,0,0,34,116,6,0,0,35,0,128,2,0,34,0,128,2,0,35,125,6,0,0,34,125,6,0,0,35,0,128,3,0,34,0,128,3,0,35,134,6,0,0,34,134,6,0,0,35,0,128,4,0,34,0,128,4,0,35,143,6,0,0,34,143,6,0,0,35,0,128,5,0,34,0,128,5,0,35,152,6,0,0,34,152,6,0,0,35,0,128,6,0,34,0,128,6,0,35,161,6,0,0,34,161,6,0,0,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,26,0,0,13,128,26,0,128,0,0,35,0,128,1,0,34,0,128,1,0,35,44,7,0,0,34,44,7,0,0,35,0,128,2,0,34,0,128,2,0,35,58,7,0,0,34,58,7,0,0,35,0,128,3,0,34,0,128,3,0,35,72,7,0,0,34,72,7,0,0,35,0,128,4,0,34,0,128,4,0,35,86,7,0,0,34,86,7,0,0,35,0,128,5,0,34,0,128,5,0,35,100,7,0,0,34,100,7,0,0,35,0,128,6,0,34,0,128,6,0,35,114,7,0,0,34,114,7,0,0,104,0,0,0,0,0,0,0,89,134,7,0,0,90,104,0,0,0,0,0,0,0,89,134,7,0,0,90,104,0,0,0,0,0,0,0,89,134,7,0,0,90,104,0,0,0,0,0,0,0,89,134,7,0,0,90,104,0,0,0,0,0,0,0,89,134,7,0,0,90,104,0,0,0,0,0,0,0,89,134,7,0,0,90,0,0,0,4,48,15,44,0,0,7,1,234,7,0,0,112,19,6,105,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,49,8,0,0,34,49,8,0,0,35,0,128,1,0,34,0,128,1,0,35,85,8,0,0,34,85,8,0,0,35,0,128,2,0,34,0,128,2,0,35,158,8,0,0,34,158,8,0,0,35,0,128,127,0,34,0,128,127,0,35,158,8,0,0,34,158,8,0,0,90,112,20,8,106,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,49,8,0,0,34,49,8,0,0,35,0,128,1,0,34,0,128,1,0,35,158,8,0,0,34,158,8,0,0,35,0,128,127,0,34,0,128,127,0,35,158,8,0,0,34,158,8,0,0,90,113,4,0,0,113,5,0,0,104,0,0,0,0,0,0,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,89,128,7,0,0,90,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,86,3,0,0,34,86,3,0,0,35,0,128,127,0,34,0,128,127,0,35,86,3,0,0,34,86,3,0,0,88,0,0,0,0,42,0,0,89,86,3,0,0,90,104,0,0,0,0,0,0,0,113,20,8,94,1,0,35,13,128,0,0,34,13,128,0,0,89,86,3,0,0,90,113,4,1,0,113,5,0,0,104,0,0,0,0,0,0,0,38,0,0,0,89,51,2,0,0,90,38,0,0,0,15,9,9,9,9,3,254,10,9,9,9,3,254,2,254,40,254,8,8,8,8,2,254,11,8,8,8,2,254,9,9,9,84,254,9,9,9,9,254,11,11,254,10,10,40,254,31,254] as const;

export const STATS = { ops: 318, bytes: 2314, labels: 58, unknownOps: 2, unresolvedSymbols: 47 } as const;
