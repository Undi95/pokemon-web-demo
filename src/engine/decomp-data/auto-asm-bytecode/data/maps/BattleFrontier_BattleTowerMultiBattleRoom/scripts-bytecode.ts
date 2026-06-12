// AUTO-GENERATED from data/maps/BattleFrontier_BattleTowerMultiBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-12
// Stats: ops=318, bytes=2950, labels=58, unknownOps=0, unresolvedSymbols=38

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleTowerMultiBattleRoom_MapScripts": 0,
  "BattleFrontier_BattleTowerMultiBattleRoom_OnTransition": 15,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_SetObjGfx": 60,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_SetPlayerGfxFemale": 98,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_SetLinkPlayerGfx": 104,
  "BattleFrontier_BattleTowerMultiBattleRoom_OnWarp": 109,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_HidePlayerObj": 117,
  "BattleFrontier_BattleTowerMultiBattleRoom_OnFrame": 123,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_EnterRoom": 131,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_OpponentsEnter": 321,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_DoOpponentIntrosLink": 510,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_DoTowerBattle": 607,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_WarpToLobbyLost": 649,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_DefeatedOpponents": 706,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_RetorePartyMsgLink": 928,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_RestoreParty": 937,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskReadyForOpponents": 985,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskReadyForOpponentsNoRecord": 1223,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskRecordBattle": 1361,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_RecordBattle": 1474,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskPauseChallenge": 1484,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskRetireChallenge": 1593,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ContinueChallenge": 1706,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_WarpToLobbyWon": 1796,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_PauseChallenge": 1853,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyForNextOpponentSet": 1889,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor2ndOpponentSet": 2113,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor3rdOpponentSet": 2120,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor4thOpponentSet": 2127,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor5thOpponentSet": 2134,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor6thOpponentSet": 2141,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor7thOpponentSet": 2148,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyForNextOpponentSetLink": 2155,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor2ndOpponentSetLink": 2357,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor3rdOpponentSetLink": 2369,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor4thOpponentSetLink": 2381,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor5thOpponentSetLink": 2393,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor6thOpponentSetLink": 2405,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor7thOpponentSetLink": 2417,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_LinkDelayForMsg": 2429,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskReadyForOpponentsLink": 2434,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskReadyForOpponentsLinkNoRecord": 2582,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ContinueChallengeLink": 2689,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskRecordBattleLink": 2737,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskRetireChallengeLink": 2832,
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
export const BYTECODE: readonly number[] = [3,15,0,0,0,4,109,0,0,0,2,123,0,0,0,35,206,64,2,0,34,206,64,2,0,8,1,60,0,0,0,8,1,206,64,0,0,35,206,64,3,0,34,206,64,3,0,8,1,104,0,0,0,8,1,206,64,0,0,3,23,4,128,14,0,38,0,0,58,161,35,13,128,1,0,34,13,128,1,0,7,1,98,0,0,0,7,1,13,128,0,0,23,31,64,0,0,4,23,31,64,89,0,4,38,0,0,58,4,0,0,0,0,117,0,0,0,90,255,0,0,0,3,0,0,0,0,131,0,0,0,23,0,0,1,0,80,0,0,87,11,0,0,81,0,0,87,11,0,0,0,0,80,0,0,93,11,0,0,81,0,0,93,11,0,0,0,0,82,0,0,83,0,0,0,0,23,4,128,1,0,23,5,128,2,0,38,0,0,58,35,13,128,0,0,34,13,128,0,0,7,1,65,1,0,0,7,1,13,128,0,0,80,0,0,125,11,0,0,81,0,0,125,11,0,0,0,0,80,0,0,125,11,0,0,81,0,0,125,11,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,99,11,0,0,81,0,0,99,11,0,0,0,0,80,0,0,99,11,0,0,81,0,0,99,11,0,0,0,0,82,0,0,83,0,0,0,0,23,4,128,2,0,23,5,128,6,0,26,6,128,1,0,23,6,128,1,0,38,0,0,58,6,217,3,0,0,23,4,128,3,0,38,0,0,58,86,0,0,87,0,0,0,0,86,0,0,87,0,0,0,0,80,0,0,103,11,0,0,81,0,0,103,11,0,0,0,0,80,0,0,109,11,0,0,81,0,0,109,11,0,0,0,0,82,0,0,83,0,0,0,0,35,206,64,3,0,34,206,64,3,0,7,1,254,1,0,0,7,1,206,64,0,0,23,4,128,7,0,23,5,128,0,0,38,0,0,58,41,15,0,80,0,0,132,11,0,0,81,0,0,132,11,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,103,23,4,128,7,0,23,5,128,1,0,38,0,0,58,80,0,0,132,11,0,0,81,0,0,132,11,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,103,6,95,2,0,0,23,4,128,16,0,23,5,128,0,0,38,0,0,58,41,15,0,80,0,0,132,11,0,0,81,0,0,132,11,0,0,0,0,82,0,0,83,0,0,0,0,156,0,0,0,0,103,41,48,0,23,4,128,16,0,23,5,128,1,0,38,0,0,58,80,0,0,132,11,0,0,81,0,0,132,11,0,0,0,0,82,0,0,83,0,0,0,0,156,0,0,0,0,103,41,48,0,5,0,0,0,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,194,2,0,0,34,194,2,0,0,7,1,0,0,0,0,7,1,194,2,0,0,23,4,128,2,0,23,5,128,0,0,26,6,128,4,0,23,6,128,4,0,38,0,0,58,23,4,128,2,0,23,5,128,3,0,23,6,128,255,255,38,0,0,58,23,4,128,3,0,38,0,0,58,6,0,0,0,0,5,0,0,0,0,23,4,128,4,0,38,0,0,58,26,0,128,13,128,35,0,128,7,0,34,0,128,7,0,35,4,7,0,0,34,4,7,0,0,7,1,0,0,0,0,7,1,4,7,0,0,80,0,0,115,11,0,0,81,0,0,115,11,0,0,0,0,80,0,0,120,11,0,0,81,0,0,120,11,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,125,11,0,0,81,0,0,125,11,0,0,0,0,80,0,0,125,11,0,0,81,0,0,125,11,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,99,11,0,0,81,0,0,99,11,0,0,0,0,80,0,0,99,11,0,0,81,0,0,99,11,0,0,0,0,82,0,0,83,0,0,0,0,35,206,64,3,0,34,206,64,3,0,7,1,160,3,0,0,7,1,206,64,0,0,16,0,0,0,0,0,10,4,6,169,3,0,0,156,0,0,0,0,103,41,48,0,38,0,0,58,23,4,128,3,0,23,5,128,2,0,38,0,0,58,35,206,64,3,0,34,206,64,3,0,8,1,82,11,0,0,8,1,206,64,0,0,50,112,1,51,38,0,0,58,23,4,128,1,0,23,5,128,2,0,38,0,0,58,5,97,7,0,0,35,206,64,3,0,34,206,64,3,0,7,1,170,6,0,0,7,1,206,64,0,0,5,0,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,199,4,0,0,7,1,13,128,0,0,112,19,4,103,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,170,6,0,0,34,170,6,0,0,7,1,0,0,0,0,7,1,170,6,0,0,35,0,128,1,0,34,0,128,1,0,35,81,5,0,0,34,81,5,0,0,7,1,0,0,0,0,7,1,81,5,0,0,35,0,128,2,0,34,0,128,2,0,35,204,5,0,0,34,204,5,0,0,7,1,0,0,0,0,7,1,204,5,0,0,35,0,128,3,0,34,0,128,3,0,35,57,6,0,0,34,57,6,0,0,7,1,0,0,0,0,7,1,57,6,0,0,35,0,128,127,0,34,0,128,127,0,35,217,3,0,0,34,217,3,0,0,7,1,0,0,0,0,7,1,217,3,0,0,112,20,6,104,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,170,6,0,0,34,170,6,0,0,7,1,0,0,0,0,7,1,170,6,0,0,35,0,128,1,0,34,0,128,1,0,35,204,5,0,0,34,204,5,0,0,7,1,0,0,0,0,7,1,204,5,0,0,35,0,128,2,0,34,0,128,2,0,35,57,6,0,0,34,57,6,0,0,7,1,0,0,0,0,7,1,57,6,0,0,35,0,128,127,0,34,0,128,127,0,35,217,3,0,0,34,217,3,0,0,7,1,0,0,0,0,7,1,217,3,0,0,104,0,0,0,0,103,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,217,3,0,0,34,217,3,0,0,7,1,0,0,0,0,7,1,217,3,0,0,35,0,128,0,0,34,0,128,0,0,35,194,5,0,0,34,194,5,0,0,7,1,0,0,0,0,7,1,194,5,0,0,35,0,128,127,0,34,0,128,127,0,35,217,3,0,0,34,217,3,0,0,7,1,0,0,0,0,7,1,217,3,0,0,5,0,0,0,0,6,217,3,0,0,16,0,0,0,0,0,10,5,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,217,3,0,0,34,217,3,0,0,7,1,0,0,0,0,7,1,217,3,0,0,35,0,128,1,0,34,0,128,1,0,35,61,7,0,0,34,61,7,0,0,7,1,0,0,0,0,7,1,61,7,0,0,35,0,128,127,0,34,0,128,127,0,35,217,3,0,0,34,217,3,0,0,7,1,0,0,0,0,7,1,217,3,0,0,104,0,0,0,0,103,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,217,3,0,0,34,217,3,0,0,7,1,0,0,0,0,7,1,217,3,0,0,35,0,128,0,0,34,0,128,0,0,35,137,2,0,0,34,137,2,0,0,7,1,0,0,0,0,7,1,137,2,0,0,35,0,128,127,0,34,0,128,127,0,35,217,3,0,0,34,217,3,0,0,7,1,0,0,0,0,7,1,217,3,0,0,105,43,0,0,80,0,0,101,11,0,0,81,0,0,101,11,0,0,0,0,80,0,0,101,11,0,0,81,0,0,101,11,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,128,11,0,0,81,0,0,128,11,0,0,0,0,80,0,0,128,11,0,0,81,0,0,128,11,0,0,0,0,82,0,0,83,0,0,0,0,6,65,1,0,0,3,23,4,128,2,0,23,5,128,0,0,26,6,128,3,0,23,6,128,3,0,38,0,0,58,23,4,128,2,0,23,5,128,3,0,23,6,128,255,255,38,0,0,58,23,4,128,3,0,38,0,0,58,6,0,0,0,0,104,0,0,0,0,103,23,4,128,6,0,23,5,128,2,0,38,0,0,58,48,55,0,49,152,1,23,4,128,4,0,38,0,0,58,3,35,206,64,3,0,34,206,64,3,0,7,1,107,8,0,0,7,1,206,64,0,0,26,0,0,13,128,26,0,128,0,0,35,0,128,1,0,34,0,128,1,0,35,65,8,0,0,34,65,8,0,0,7,1,0,0,0,0,7,1,65,8,0,0,35,0,128,2,0,34,0,128,2,0,35,72,8,0,0,34,72,8,0,0,7,1,0,0,0,0,7,1,72,8,0,0,35,0,128,3,0,34,0,128,3,0,35,79,8,0,0,34,79,8,0,0,7,1,0,0,0,0,7,1,79,8,0,0,35,0,128,4,0,34,0,128,4,0,35,86,8,0,0,34,86,8,0,0,7,1,0,0,0,0,7,1,86,8,0,0,35,0,128,5,0,34,0,128,5,0,35,93,8,0,0,34,93,8,0,0,7,1,0,0,0,0,7,1,93,8,0,0,35,0,128,6,0,34,0,128,6,0,35,100,8,0,0,34,100,8,0,0,7,1,0,0,0,0,7,1,100,8,0,0,104,0,0,0,0,103,4,104,0,0,0,0,103,4,104,0,0,0,0,103,4,104,0,0,0,0,103,4,104,0,0,0,0,103,4,104,0,0,0,0,103,4,26,0,0,13,128,26,0,128,0,0,35,0,128,1,0,34,0,128,1,0,35,53,9,0,0,34,53,9,0,0,7,1,0,0,0,0,7,1,53,9,0,0,35,0,128,2,0,34,0,128,2,0,35,65,9,0,0,34,65,9,0,0,7,1,0,0,0,0,7,1,65,9,0,0,35,0,128,3,0,34,0,128,3,0,35,77,9,0,0,34,77,9,0,0,7,1,0,0,0,0,7,1,77,9,0,0,35,0,128,4,0,34,0,128,4,0,35,89,9,0,0,34,89,9,0,0,7,1,0,0,0,0,7,1,89,9,0,0,35,0,128,5,0,34,0,128,5,0,35,101,9,0,0,34,101,9,0,0,7,1,0,0,0,0,7,1,101,9,0,0,35,0,128,6,0,34,0,128,6,0,35,113,9,0,0,34,113,9,0,0,7,1,0,0,0,0,7,1,113,9,0,0,104,0,0,0,0,103,6,130,9,0,0,3,104,0,0,0,0,103,6,130,9,0,0,3,104,0,0,0,0,103,6,130,9,0,0,3,104,0,0,0,0,103,6,130,9,0,0,3,104,0,0,0,0,103,6,130,9,0,0,3,104,0,0,0,0,103,6,130,9,0,0,3,103,41,48,0,4,44,0,0,7,1,22,10,0,0,112,19,6,105,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,129,10,0,0,34,129,10,0,0,7,1,0,0,0,0,7,1,129,10,0,0,35,0,128,1,0,34,0,128,1,0,35,177,10,0,0,34,177,10,0,0,7,1,0,0,0,0,7,1,177,10,0,0,35,0,128,2,0,34,0,128,2,0,35,16,11,0,0,34,16,11,0,0,7,1,0,0,0,0,7,1,16,11,0,0,35,0,128,127,0,34,0,128,127,0,35,16,11,0,0,34,16,11,0,0,7,1,0,0,0,0,7,1,16,11,0,0,3,112,20,8,106,1,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,129,10,0,0,34,129,10,0,0,7,1,0,0,0,0,7,1,129,10,0,0,35,0,128,1,0,34,0,128,1,0,35,16,11,0,0,34,16,11,0,0,7,1,0,0,0,0,7,1,16,11,0,0,35,0,128,127,0,34,0,128,127,0,35,16,11,0,0,34,16,11,0,0,7,1,0,0,0,0,7,1,16,11,0,0,3,23,4,128,0,0,23,5,128,0,0,104,0,0,0,0,103,38,0,0,58,35,13,128,0,0,34,13,128,0,0,7,5,137,2,0,0,7,5,13,128,0,0,6,125,9,0,0,3,104,0,0,0,0,103,113,20,8,94,1,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,217,3,0,0,34,217,3,0,0,7,1,0,0,0,0,7,1,217,3,0,0,35,0,128,127,0,34,0,128,127,0,35,217,3,0,0,34,217,3,0,0,7,1,0,0,0,0,7,1,217,3,0,0,5,0,0,0,0,42,0,0,6,217,3,0,0,3,104,0,0,0,0,103,113,20,8,94,1,0,35,13,128,0,0,34,13,128,0,0,7,1,56,11,0,0,7,1,13,128,0,0,6,217,3,0,0,3,23,4,128,1,0,23,5,128,0,0,104,0,0,0,0,103,38,0,0,58,6,137,2,0,0,3,38,0,0,58,4,9,9,9,9,3,254,10,9,9,9,3,254,2,254,40,254,8,8,8,8,2,254,11,8,8,8,2,254,9,9,9,84,254,9,9,9,9,254,11,11,254,10,10,40,254,31,254] as const;

export const STATS = { ops: 318, bytes: 2950, labels: 58, unknownOps: 0, unresolvedSymbols: 38 } as const;
