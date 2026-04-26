// AUTO-GENERATED from data/maps/BattleFrontier_BattleTowerMultiBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=318, bytes=1376, labels=58, unknownOps=15, unresolvedSymbols=45

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleTowerMultiBattleRoom_MapScripts": 0,
  "BattleFrontier_BattleTowerMultiBattleRoom_OnTransition": 15,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_SetObjGfx": 36,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_SetPlayerGfxFemale": 59,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_SetLinkPlayerGfx": 63,
  "BattleFrontier_BattleTowerMultiBattleRoom_OnWarp": 67,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_HidePlayerObj": 75,
  "BattleFrontier_BattleTowerMultiBattleRoom_OnFrame": 81,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_EnterRoom": 89,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_OpponentsEnter": 261,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_DoOpponentIntrosLink": 436,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_DoTowerBattle": 530,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_WarpToLobbyLost": 535,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_DefeatedOpponents": 585,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_RetorePartyMsgLink": 757,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_RestoreParty": 767,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskReadyForOpponents": 801,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskReadyForOpponentsNoRecord": 848,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskRecordBattle": 853,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_RecordBattle": 867,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskPauseChallenge": 877,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskRetireChallenge": 885,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ContinueChallenge": 899,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_WarpToLobbyWon": 989,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_PauseChallenge": 1039,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyForNextOpponentSet": 1074,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor2ndOpponentSet": 1089,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor3rdOpponentSet": 1097,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor4thOpponentSet": 1105,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor5thOpponentSet": 1113,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor6thOpponentSet": 1121,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor7thOpponentSet": 1129,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyForNextOpponentSetLink": 1137,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor2ndOpponentSetLink": 1142,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor3rdOpponentSetLink": 1156,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor4thOpponentSetLink": 1170,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor5thOpponentSetLink": 1184,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor6thOpponentSetLink": 1198,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReadyFor7thOpponentSetLink": 1212,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_LinkDelayForMsg": 1226,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskReadyForOpponentsLink": 1231,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskReadyForOpponentsLinkNoRecord": 1246,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ContinueChallengeLink": 1252,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskRecordBattleLink": 1288,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_AskRetireChallengeLink": 1316,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_RetireChallengeLink": 1346,
  "BattleFrontier_BattleTowerMultiBattleRoom_EventScript_ReconnectLink": 1372,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_PlayerEnterRoom": 1376,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_PartnerEnterRoom": 1376,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_FaceAttendant": 1376,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_FaceBattle": 1376,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_Opponent1Enter": 1376,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_Opponent2Enter": 1376,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_Opponent2Exit": 1376,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_Opponent1Exit": 1376,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_AttendantApproachPlayer": 1376,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_AttendantReturnToPos": 1376,
  "BattleFrontier_BattleTowerMultiBattleRoom_Movement_WalkInPlaceLeft": 1376,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,15,0,0,0,4,67,0,0,0,2,81,0,0,0,35,206,64,2,0,34,206,64,2,0,35,206,64,3,0,34,206,64,3,0,90,113,4,14,0,38,0,0,0,161,35,13,128,1,0,34,13,128,1,0,113,31,0,0,113,31,89,0,38,0,0,0,0,0,0,0,75,0,0,0,90,255,0,0,0,90,0,0,0,0,89,0,0,0,113,0,1,0,80,0,0,96,5,0,0,81,0,0,96,5,0,0,0,0,80,0,0,96,5,0,0,81,0,0,96,5,0,0,0,0,82,0,0,83,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,80,0,0,96,5,0,0,81,0,0,96,5,0,0,0,0,80,0,0,96,5,0,0,81,0,0,96,5,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,96,5,0,0,81,0,0,96,5,0,0,0,0,80,0,0,96,5,0,0,81,0,0,96,5,0,0,0,0,82,0,0,83,0,0,0,0,113,4,2,0,113,5,6,0,26,6,128,1,0,113,6,1,0,38,0,0,0,89,33,3,0,0,113,4,3,0,38,0,0,0,86,0,0,87,0,0,0,0,86,0,0,87,0,0,0,0,80,0,0,96,5,0,0,81,0,0,96,5,0,0,0,0,80,0,0,96,5,0,0,81,0,0,96,5,0,0,0,0,82,0,0,83,0,0,0,0,35,206,64,3,0,34,206,64,3,0,113,4,7,0,113,5,0,0,38,0,0,0,4,15,80,0,0,96,5,0,0,81,0,0,96,5,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,0,0,0,113,4,7,0,113,5,1,0,38,0,0,0,80,0,0,96,5,0,0,81,0,0,96,5,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,0,0,0,89,18,2,0,0,113,4,16,0,113,5,0,0,38,0,0,0,4,15,80,0,0,96,5,0,0,81,0,0,96,5,0,0,0,0,82,0,0,83,0,0,0,0,156,0,0,0,0,0,0,0,4,48,113,4,16,0,113,5,1,0,38,0,0,0,80,0,0,96,5,0,0,81,0,0,96,5,0,0,0,0,82,0,0,83,0,0,0,0,156,0,0,0,0,0,0,0,4,48,88,0,0,0,0,113,4,2,0,113,5,0,0,26,6,128,4,0,113,6,4,0,38,0,0,0,113,4,2,0,113,5,3,0,113,6,255,255,38,0,0,0,113,4,3,0,38,0,0,0,89,0,0,0,0,88,0,0,0,0,113,4,4,0,38,0,0,0,80,0,0,96,5,0,0,81,0,0,96,5,0,0,0,0,80,0,0,96,5,0,0,81,0,0,96,5,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,80,0,0,96,5,0,0,81,0,0,96,5,0,0,0,0,80,0,0,96,5,0,0,81,0,0,96,5,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,96,5,0,0,81,0,0,96,5,0,0,0,0,80,0,0,96,5,0,0,81,0,0,96,5,0,0,0,0,82,0,0,83,0,0,0,0,35,206,64,3,0,34,206,64,3,0,16,0,0,0,0,0,10,0,89,255,2,0,0,156,0,0,0,0,0,0,0,4,48,38,0,0,0,113,4,3,0,113,5,2,0,38,0,0,0,35,206,64,3,0,34,206,64,3,0,50,112,1,51,38,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,88,50,4,0,0,35,206,64,3,0,34,206,64,3,0,88,0,0,0,0,35,13,128,1,0,34,13,128,1,0,112,19,4,103,1,112,20,6,104,1,104,0,0,0,0,0,0,0,113,20,8,94,1,0,88,0,0,0,0,89,33,3,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,113,20,8,94,1,0,105,43,0,0,80,0,0,96,5,0,0,81,0,0,96,5,0,0,0,0,80,0,0,96,5,0,0,81,0,0,96,5,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,96,5,0,0,81,0,0,96,5,0,0,0,0,80,0,0,96,5,0,0,81,0,0,96,5,0,0,0,0,82,0,0,83,0,0,0,0,89,5,1,0,0,90,113,4,2,0,113,5,0,0,26,6,128,3,0,113,6,3,0,38,0,0,0,113,4,2,0,113,5,3,0,113,6,255,255,38,0,0,0,113,4,3,0,38,0,0,0,89,0,0,0,0,104,0,0,0,0,0,0,0,113,4,6,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,35,206,64,3,0,34,206,64,3,0,26,0,0,13,128,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,26,0,0,13,128,104,0,0,0,0,0,0,0,89,207,4,0,0,90,104,0,0,0,0,0,0,0,89,207,4,0,0,90,104,0,0,0,0,0,0,0,89,207,4,0,0,90,104,0,0,0,0,0,0,0,89,207,4,0,0,90,104,0,0,0,0,0,0,0,89,207,4,0,0,90,104,0,0,0,0,0,0,0,89,207,4,0,0,90,0,0,0,4,48,44,0,0,7,1,222,4,0,0,112,19,6,105,1,90,112,20,8,106,1,90,113,4,0,0,113,5,0,0,104,0,0,0,0,0,0,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,89,202,4,0,0,90,104,0,0,0,0,0,0,0,113,20,8,94,1,0,88,0,0,0,0,42,0,0,89,33,3,0,0,90,104,0,0,0,0,0,0,0,113,20,8,94,1,0,35,13,128,0,0,34,13,128,0,0,89,33,3,0,0,90,113,4,1,0,113,5,0,0,104,0,0,0,0,0,0,0,38,0,0,0,89,23,2,0,0,90,38,0,0,0] as const;

export const STATS = { ops: 318, bytes: 1376, labels: 58, unknownOps: 15, unresolvedSymbols: 45 } as const;
