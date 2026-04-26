// AUTO-GENERATED from data/maps/BattleFrontier_BattleTowerMultiBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=318, bytes=2950, labels=58, unknownOps=0, unresolvedSymbols=43

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleTowerMultiBattleRoom_MapScripts": 0,
  "BattleFrontier_BattleTowerMultiBattleRoom_OnTransition": 15,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_SetObjGfx": 60,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_SetPlayerGfxFemale": 96,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_SetLinkPlayerGfx": 101,
  "BattleFrontier_BattleTowerMultiBattleRoom_OnWarp": 106,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_HidePlayerObj": 114,
  "BattleFrontier_BattleTowerMultiBattleRoom_OnFrame": 120,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_EnterRoom": 128,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_OpponentsEnter": 312,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_DoOpponentIntrosLink": 499,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_DoTowerBattle": 593,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_WarpToLobbyLost": 635,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_DefeatedOpponents": 685,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_RetorePartyMsgLink": 906,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_RestoreParty": 916,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskReadyForOpponents": 962,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskReadyForOpponentsNoRecord": 1198,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskRecordBattle": 1336,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_RecordBattle": 1451,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskPauseChallenge": 1461,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskRetireChallenge": 1570,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ContinueChallenge": 1685,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_WarpToLobbyWon": 1775,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_PauseChallenge": 1825,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyForNextOpponentSet": 1860,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor2ndOpponentSet": 2084,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor3rdOpponentSet": 2093,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor4thOpponentSet": 2102,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor5thOpponentSet": 2111,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor6thOpponentSet": 2120,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor7thOpponentSet": 2129,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyForNextOpponentSetLink": 2138,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor2ndOpponentSetLink": 2340,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor3rdOpponentSetLink": 2354,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor4thOpponentSetLink": 2368,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor5thOpponentSetLink": 2382,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor6thOpponentSetLink": 2396,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor7thOpponentSetLink": 2410,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_LinkDelayForMsg": 2424,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskReadyForOpponentsLink": 2430,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskReadyForOpponentsLinkNoRecord": 2578,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ContinueChallengeLink": 2685,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskRecordBattleLink": 2733,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskRetireChallengeLink": 2830,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_RetireChallengeLink": 2872,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReconnectLink": 2898,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_PlayerEnterRoom": 2903,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_PartnerEnterRoom": 2909,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_FaceAttendant": 2915,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_FaceBattle": 2917,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_Opponent1Enter": 2919,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_Opponent2Enter": 2925,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_Opponent2Exit": 2931,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_Opponent1Exit": 2936,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_AttendantApproachPlayer": 2941,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_AttendantReturnToPos": 2944,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_WalkInPlaceLeft": 2948,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,15,0,0,0,4,106,0,0,0,2,120,0,0,0,35,206,64,2,0,34,206,64,2,0,8,1,60,0,0,0,8,1,206,64,0,0,35,206,64,3,0,34,206,64,3,0,8,1,101,0,0,0,8,1,206,64,0,0,90,113,4,14,0,38,0,0,0,161,35,13,128,1,0,34,13,128,1,0,7,1,96,0,0,0,7,1,13,128,0,0,113,31,0,0,15,113,31,89,0,15,38,0,0,0,15,0,0,0,0,114,0,0,0,90,255,0,0,0,90,0,0,0,0,128,0,0,0,113,0,1,0,80,0,0,87,11,0,0,81,0,0,87,11,0,0,0,0,80,0,0,93,11,0,0,81,0,0,93,11,0,0,0,0,82,0,0,83,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,56,1,0,0,7,1,13,128,0,0,80,0,0,125,11,0,0,81,0,0,125,11,0,0,0,0,80,0,0,125,11,0,0,81,0,0,125,11,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,99,11,0,0,81,0,0,99,11,0,0,0,0,80,0,0,99,11,0,0,81,0,0,99,11,0,0,0,0,82,0,0,83,0,0,0,0,113,4,2,0,113,5,6,0,26,6,128,1,0,113,6,1,0,38,0,0,0,89,194,3,0,0,113,4,3,0,38,0,0,0,86,0,0,87,0,0,0,0,86,0,0,87,0,0,0,0,80,0,0,103,11,0,0,81,0,0,103,11,0,0,0,0,80,0,0,109,11,0,0,81,0,0,109,11,0,0,0,0,82,0,0,83,0,0,0,0,35,206,64,3,0,34,206,64,3,0,7,1,243,1,0,0,7,1,206,64,0,0,113,4,7,0,113,5,0,0,38,0,0,0,4,15,80,0,0,132,11,0,0,81,0,0,132,11,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,0,0,0,113,4,7,0,113,5,1,0,38,0,0,0,80,0,0,132,11,0,0,81,0,0,132,11,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,0,0,0,89,81,2,0,0,113,4,16,0,113,5,0,0,38,0,0,0,4,15,80,0,0,132,11,0,0,81,0,0,132,11,0,0,0,0,82,0,0,83,0,0,0,0,156,0,0,0,0,0,0,0,4,48,113,4,16,0,113,5,1,0,38,0,0,0,80,0,0,132,11,0,0,81,0,0,132,11,0,0,0,0,82,0,0,83,0,0,0,0,156,0,0,0,0,0,0,0,4,48,88,0,0,0,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,173,2,0,0,34,173,2,0,0,7,1,0,0,0,0,7,1,173,2,0,0,113,4,2,0,113,5,0,0,26,6,128,4,0,113,6,4,0,38,0,0,0,113,4,2,0,113,5,3,0,113,6,255,255,38,0,0,0,113,4,3,0,38,0,0,0,89,0,0,0,0,88,0,0,0,0,113,4,4,0,38,0,0,0,26,0,128,13,128,35,0,128,7,0,34,0,128,7,0,35,239,6,0,0,34,239,6,0,0,7,1,0,0,0,0,7,1,239,6,0,0,80,0,0,115,11,0,0,81,0,0,115,11,0,0,0,0,80,0,0,120,11,0,0,81,0,0,120,11,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,125,11,0,0,81,0,0,125,11,0,0,0,0,80,0,0,125,11,0,0,81,0,0,125,11,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,99,11,0,0,81,0,0,99,11,0,0,0,0,80,0,0,99,11,0,0,81,0,0,99,11,0,0,0,0,82,0,0,83,0,0,0,0,35,206,64,3,0,34,206,64,3,0,7,1,138,3,0,0,7,1,206,64,0,0,16,0,0,0,0,0,10,4,89,148,3,0,0,156,0,0,0,0,0,0,0,4,48,38,0,0,0,113,4,3,0,113,5,2,0,38,0,0,0,35,206,64,3,0,34,206,64,3,0,8,1,82,11,0,0,8,1,206,64,0,0,50,112,1,51,38,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,88,68,7,0,0,35,206,64,3,0,34,206,64,3,0,7,1,149,6,0,0,7,1,206,64,0,0,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,174,4,0,0,7,1,13,128,0,0,112,19,4,103,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,149,6,0,0,34,149,6,0,0,7,1,0,0,0,0,7,1,149,6,0,0,35,0,128,1,0,34,0,128,1,0,35,56,5,0,0,34,56,5,0,0,7,1,0,0,0,0,7,1,56,5,0,0,35,0,128,2,0,34,0,128,2,0,35,181,5,0,0,34,181,5,0,0,7,1,0,0,0,0,7,1,181,5,0,0,35,0,128,3,0,34,0,128,3,0,35,34,6,0,0,34,34,6,0,0,7,1,0,0,0,0,7,1,34,6,0,0,35,0,128,127,0,34,0,128,127,0,35,194,3,0,0,34,194,3,0,0,7,1,0,0,0,0,7,1,194,3,0,0,112,20,6,104,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,149,6,0,0,34,149,6,0,0,7,1,0,0,0,0,7,1,149,6,0,0,35,0,128,1,0,34,0,128,1,0,35,181,5,0,0,34,181,5,0,0,7,1,0,0,0,0,7,1,181,5,0,0,35,0,128,2,0,34,0,128,2,0,35,34,6,0,0,34,34,6,0,0,7,1,0,0,0,0,7,1,34,6,0,0,35,0,128,127,0,34,0,128,127,0,35,194,3,0,0,34,194,3,0,0,7,1,0,0,0,0,7,1,194,3,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,194,3,0,0,34,194,3,0,0,7,1,0,0,0,0,7,1,194,3,0,0,35,0,128,0,0,34,0,128,0,0,35,171,5,0,0,34,171,5,0,0,7,1,0,0,0,0,7,1,171,5,0,0,35,0,128,127,0,34,0,128,127,0,35,194,3,0,0,34,194,3,0,0,7,1,0,0,0,0,7,1,194,3,0,0,88,0,0,0,0,89,194,3,0,0,16,0,0,0,0,0,10,5,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,194,3,0,0,34,194,3,0,0,7,1,0,0,0,0,7,1,194,3,0,0,35,0,128,1,0,34,0,128,1,0,35,33,7,0,0,34,33,7,0,0,7,1,0,0,0,0,7,1,33,7,0,0,35,0,128,127,0,34,0,128,127,0,35,194,3,0,0,34,194,3,0,0,7,1,0,0,0,0,7,1,194,3,0,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,194,3,0,0,34,194,3,0,0,7,1,0,0,0,0,7,1,194,3,0,0,35,0,128,0,0,34,0,128,0,0,35,123,2,0,0,34,123,2,0,0,7,1,0,0,0,0,7,1,123,2,0,0,35,0,128,127,0,34,0,128,127,0,35,194,3,0,0,34,194,3,0,0,7,1,0,0,0,0,7,1,194,3,0,0,105,43,0,0,80,0,0,101,11,0,0,81,0,0,101,11,0,0,0,0,80,0,0,101,11,0,0,81,0,0,101,11,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,128,11,0,0,81,0,0,128,11,0,0,0,0,80,0,0,128,11,0,0,81,0,0,128,11,0,0,0,0,82,0,0,83,0,0,0,0,89,56,1,0,0,90,113,4,2,0,113,5,0,0,26,6,128,3,0,113,6,3,0,38,0,0,0,113,4,2,0,113,5,3,0,113,6,255,255,38,0,0,0,113,4,3,0,38,0,0,0,89,0,0,0,0,104,0,0,0,0,0,0,0,113,4,6,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,35,206,64,3,0,34,206,64,3,0,7,1,90,8,0,0,7,1,206,64,0,0,26,0,0,13,128,26,0,128,0,0,35,0,128,1,0,34,0,128,1,0,35,36,8,0,0,34,36,8,0,0,7,1,0,0,0,0,7,1,36,8,0,0,35,0,128,2,0,34,0,128,2,0,35,45,8,0,0,34,45,8,0,0,7,1,0,0,0,0,7,1,45,8,0,0,35,0,128,3,0,34,0,128,3,0,35,54,8,0,0,34,54,8,0,0,7,1,0,0,0,0,7,1,54,8,0,0,35,0,128,4,0,34,0,128,4,0,35,63,8,0,0,34,63,8,0,0,7,1,0,0,0,0,7,1,63,8,0,0,35,0,128,5,0,34,0,128,5,0,35,72,8,0,0,34,72,8,0,0,7,1,0,0,0,0,7,1,72,8,0,0,35,0,128,6,0,34,0,128,6,0,35,81,8,0,0,34,81,8,0,0,7,1,0,0,0,0,7,1,81,8,0,0,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,104,0,0,0,0,0,0,0,15,26,0,0,13,128,26,0,128,0,0,35,0,128,1,0,34,0,128,1,0,35,36,9,0,0,34,36,9,0,0,7,1,0,0,0,0,7,1,36,9,0,0,35,0,128,2,0,34,0,128,2,0,35,50,9,0,0,34,50,9,0,0,7,1,0,0,0,0,7,1,50,9,0,0,35,0,128,3,0,34,0,128,3,0,35,64,9,0,0,34,64,9,0,0,7,1,0,0,0,0,7,1,64,9,0,0,35,0,128,4,0,34,0,128,4,0,35,78,9,0,0,34,78,9,0,0,7,1,0,0,0,0,7,1,78,9,0,0,35,0,128,5,0,34,0,128,5,0,35,92,9,0,0,34,92,9,0,0,7,1,0,0,0,0,7,1,92,9,0,0,35,0,128,6,0,34,0,128,6,0,35,106,9,0,0,34,106,9,0,0,7,1,0,0,0,0,7,1,106,9,0,0,104,0,0,0,0,0,0,0,89,126,9,0,0,90,104,0,0,0,0,0,0,0,89,126,9,0,0,90,104,0,0,0,0,0,0,0,89,126,9,0,0,90,104,0,0,0,0,0,0,0,89,126,9,0,0,90,104,0,0,0,0,0,0,0,89,126,9,0,0,90,104,0,0,0,0,0,0,0,89,126,9,0,0,90,0,0,0,4,48,15,44,0,0,7,1,18,10,0,0,112,19,6,105,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,125,10,0,0,34,125,10,0,0,7,1,0,0,0,0,7,1,125,10,0,0,35,0,128,1,0,34,0,128,1,0,35,173,10,0,0,34,173,10,0,0,7,1,0,0,0,0,7,1,173,10,0,0,35,0,128,2,0,34,0,128,2,0,35,14,11,0,0,34,14,11,0,0,7,1,0,0,0,0,7,1,14,11,0,0,35,0,128,127,0,34,0,128,127,0,35,14,11,0,0,34,14,11,0,0,7,1,0,0,0,0,7,1,14,11,0,0,90,112,20,8,106,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,125,10,0,0,34,125,10,0,0,7,1,0,0,0,0,7,1,125,10,0,0,35,0,128,1,0,34,0,128,1,0,35,14,11,0,0,34,14,11,0,0,7,1,0,0,0,0,7,1,14,11,0,0,35,0,128,127,0,34,0,128,127,0,35,14,11,0,0,34,14,11,0,0,7,1,0,0,0,0,7,1,14,11,0,0,90,113,4,0,0,113,5,0,0,104,0,0,0,0,0,0,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,5,123,2,0,0,7,5,13,128,0,0,89,120,9,0,0,90,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,194,3,0,0,34,194,3,0,0,7,1,0,0,0,0,7,1,194,3,0,0,35,0,128,127,0,34,0,128,127,0,35,194,3,0,0,34,194,3,0,0,7,1,0,0,0,0,7,1,194,3,0,0,88,0,0,0,0,42,0,0,89,194,3,0,0,90,104,0,0,0,0,0,0,0,113,20,8,94,1,0,35,13,128,0,0,34,13,128,0,0,7,1,56,11,0,0,7,1,13,128,0,0,89,194,3,0,0,90,113,4,1,0,113,5,0,0,104,0,0,0,0,0,0,0,38,0,0,0,89,123,2,0,0,90,38,0,0,0,15,9,9,9,9,3,254,10,9,9,9,3,254,2,254,40,254,8,8,8,8,2,254,11,8,8,8,2,254,9,9,9,84,254,9,9,9,9,254,11,11,254,10,10,40,254,31,254] as const;

export const STATS = { ops: 318, bytes: 2950, labels: 58, unknownOps: 0, unresolvedSymbols: 43 } as const;
