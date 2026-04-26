// AUTO-GENERATED from data/maps/BattleFrontier_BattleFactoryBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=179, bytes=1601, labels=32, unknownOps=0, unresolvedSymbols=44

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleFactoryBattleRoom_MapScripts": 0,
  "BattleFrontier_BattleFactoryBattleRoom_OnTransition": 15,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_SetUpFactoryHeadObj": 104,
  "BattleFrontier_BattleFactoryBattleRoom_OnWarp": 117,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_HideObjects": 125,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_EndHideObjects": 161,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_SetPlayerGfxMale": 162,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_SetPlayerGfxFemale": 167,
  "BattleFrontier_BattleFactoryBattleRoom_OnFrame": 172,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_EnterRoomFactoryHeadBattle": 180,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_EnterRoom": 256,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_BattleOpponent": 378,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_WarpToLobbyLost": 495,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_DefeatedOpponent": 521,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_IncrementWinStreak": 584,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_IncrementBattleNum": 589,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_WarpToLobbyWon": 690,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_BattleNoland": 716,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_BattleNolandSilver": 880,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_DefeatedNolandSilver": 920,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_IntroNolandGold": 1016,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_BattleNolandGold": 1079,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_DefeatedNolandGold": 1119,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_DoNolandBattle": 1217,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_DefeatedNoland": 1256,
  "BattleFrontier_BattleFactoryBattleRoom_Movement_PlayerEnterRoom": 1398,
  "BattleFrontier_BattleFactoryBattleRoom_Movement_PlayerApproachNoland": 1405,
  "BattleFrontier_BattleFactoryBattleRoom_Movement_OpponentEnter": 1407,
  "BattleFrontier_BattleFactoryBattleRoom_Movement_NolandMoveToBattle": 1414,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_WarpToLobby": 1419,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_WarpToLobbyDoubles": 1471,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_ScientistsFaceBattle": 1496,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,15,0,0,0,4,117,0,0,0,2,172,0,0,0,113,4,5,0,38,0,0,0,161,35,13,128,0,0,34,13,128,0,0,8,1,162,0,0,0,8,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,8,1,167,0,0,0,8,1,13,128,0,0,113,4,9,0,38,0,0,0,26,0,0,13,128,35,13,128,0,0,34,13,128,0,0,7,5,104,0,0,0,7,5,13,128,0,0,90,88,0,0,0,0,100,0,0,7,0,9,0,90,0,0,0,0,125,0,0,0,113,0,1,0,90,255,0,0,0,35,0,0,0,0,34,0,0,0,0,7,5,161,0,0,0,7,5,0,0,0,0,90,0,0,0,0,90,113,31,100,0,15,113,31,105,0,15,0,0,0,0,0,1,0,0,16,0,0,0,0,0,10,0,105,80,0,0,134,5,0,0,81,0,0,134,5,0,0,0,0,80,0,0,118,5,0,0,81,0,0,118,5,0,0,0,0,80,255,0,118,5,0,0,81,255,0,118,5,0,0,0,0,82,0,0,83,0,0,0,0,88,216,5,0,0,89,122,1,0,0,90,35,0,0,0,0,34,0,0,0,0,7,5,180,0,0,0,7,5,0,0,0,0,80,0,0,118,5,0,0,81,0,0,118,5,0,0,0,0,80,255,0,118,5,0,0,81,255,0,118,5,0,0,0,0,82,0,0,83,0,0,0,0,88,216,5,0,0,113,4,11,0,38,0,0,0,84,0,0,85,0,0,0,0,100,0,0,7,0,1,0,86,0,0,87,0,0,0,0,80,0,0,127,5,0,0,81,0,0,127,5,0,0,0,0,82,0,0,83,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,5,204,2,0,0,7,5,0,0,0,0,113,4,5,0,38,0,0,0,106,16,0,0,0,0,0,10,0,0,0,0,105,113,4,2,0,113,5,6,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,113,4,6,0,113,5,0,0,38,0,0,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,9,2,0,0,34,9,2,0,0,7,1,0,0,0,0,7,1,9,2,0,0,113,4,2,0,113,5,0,0,26,6,128,4,0,113,6,4,0,38,0,0,0,89,139,5,0,0,113,4,1,0,113,5,3,0,38,0,0,0,35,13,128,15,39,34,13,128,15,39,7,1,72,2,0,0,7,1,13,128,0,0,115,13,1,27,6,128,13,128,113,4,2,0,113,5,3,0,26,6,128,255,255,113,6,255,255,38,0,0,0,88,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,115,13,1,113,4,2,0,113,5,2,0,26,6,128,13,128,113,6,13,128,38,0,0,0,26,0,128,13,128,35,0,128,7,0,34,0,128,7,0,35,178,2,0,0,34,178,2,0,0,7,1,0,0,0,0,7,1,178,2,0,0,113,6,1,0,58,0,0,255,255,255,255,255,8,255,255,255,255,255,8,0,8,0,8,8,0,0,0,0,113,4,2,0,113,5,0,0,26,6,128,3,0,113,6,3,0,38,0,0,0,89,139,5,0,0,26,0,128,0,0,35,0,128,2,0,34,0,128,2,0,35,248,3,0,0,34,248,3,0,0,7,1,0,0,0,0,7,1,248,3,0,0,35,0,128,3,0,34,0,128,3,0,35,112,3,0,0,34,112,3,0,0,7,1,0,0,0,0,7,1,112,3,0,0,35,0,128,4,0,34,0,128,4,0,35,55,4,0,0,34,55,4,0,0,7,1,0,0,0,0,7,1,55,4,0,0,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,5,112,3,0,0,7,5,13,128,0,0,16,0,0,0,0,0,10,0,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,16,0,0,0,0,0,10,0,88,193,4,0,0,35,13,128,1,0,34,13,128,1,0,7,1,152,3,0,0,7,1,13,128,0,0,89,239,1,0,0,113,4,12,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,5,232,4,0,0,7,5,13,128,0,0,16,0,0,0,0,0,10,0,105,80,0,0,125,5,0,0,81,0,0,125,5,0,0,0,0,82,0,0,83,0,0,0,0,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,16,0,0,0,0,0,10,0,89,232,4,0,0,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,5,55,4,0,0,7,5,13,128,0,0,16,0,0,0,0,0,10,0,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,16,0,0,0,0,0,10,0,88,193,4,0,0,35,13,128,1,0,34,13,128,1,0,7,1,95,4,0,0,7,1,13,128,0,0,89,239,1,0,0,113,4,12,0,38,0,0,0,35,13,128,2,0,34,13,128,2,0,7,1,232,4,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,0,0,0,0,80,0,0,125,5,0,0,81,0,0,125,5,0,0,0,0,82,0,0,83,0,0,0,0,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,16,0,0,0,0,0,10,0,89,232,4,0,0,105,113,4,2,0,113,5,6,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,113,4,6,0,113,5,0,0,38,0,0,0,15,113,4,1,0,113,5,3,0,38,0,0,0,35,13,128,15,39,34,13,128,15,39,7,1,72,2,0,0,7,1,13,128,0,0,115,13,1,27,6,128,13,128,113,4,2,0,113,5,3,0,26,6,128,255,255,113,6,255,255,38,0,0,0,113,4,1,0,113,5,1,0,38,0,0,0,35,13,128,15,39,34,13,128,15,39,7,1,77,2,0,0,7,1,13,128,0,0,115,13,1,113,4,2,0,113,5,1,0,26,6,128,13,128,113,6,13,128,38,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,115,13,1,89,178,2,0,0,90,9,9,9,9,9,3,254,11,254,8,8,8,8,8,2,254,9,9,9,2,254,26,13,128,206,64,35,13,128,1,0,34,13,128,1,0,7,1,191,5,0,0,7,1,13,128,0,0,58,0,0,255,255,255,255,255,4,255,255,255,255,255,4,0,8,0,4,8,0,0,0,0,90,58,0,0,255,255,255,255,255,14,255,255,255,255,255,14,0,8,0,14,8,0,0,0,0,90,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15] as const;

export const STATS = { ops: 179, bytes: 1601, labels: 32, unknownOps: 0, unresolvedSymbols: 44 } as const;
