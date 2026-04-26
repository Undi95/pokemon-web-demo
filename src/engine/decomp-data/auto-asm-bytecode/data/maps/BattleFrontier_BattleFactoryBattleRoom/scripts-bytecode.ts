// AUTO-GENERATED from data/maps/BattleFrontier_BattleFactoryBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=179, bytes=1209, labels=32, unknownOps=11, unresolvedSymbols=44

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleFactoryBattleRoom_MapScripts": 0,
  "BattleFrontier_BattleFactoryBattleRoom_OnTransition": 15,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_SetUpFactoryHeadObj": 68,
  "BattleFrontier_BattleFactoryBattleRoom_OnWarp": 81,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_HideObjects": 89,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_EndHideObjects": 113,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_SetPlayerGfxMale": 114,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_SetPlayerGfxFemale": 118,
  "BattleFrontier_BattleFactoryBattleRoom_OnFrame": 122,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_EnterRoomFactoryHeadBattle": 130,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_EnterRoom": 206,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_BattleOpponent": 316,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_WarpToLobbyLost": 384,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_DefeatedOpponent": 410,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_IncrementWinStreak": 461,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_IncrementBattleNum": 466,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_WarpToLobbyWon": 530,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_BattleNoland": 556,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_BattleNolandSilver": 607,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_DefeatedNolandSilver": 635,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_IntroNolandGold": 719,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_BattleNolandGold": 770,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_DefeatedNolandGold": 798,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_DoNolandBattle": 884,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_DefeatedNoland": 922,
  "BattleFrontier_BattleFactoryBattleRoom_Movement_PlayerEnterRoom": 1040,
  "BattleFrontier_BattleFactoryBattleRoom_Movement_PlayerApproachNoland": 1040,
  "BattleFrontier_BattleFactoryBattleRoom_Movement_OpponentEnter": 1040,
  "BattleFrontier_BattleFactoryBattleRoom_Movement_NolandMoveToBattle": 1040,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_WarpToLobby": 1040,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_WarpToLobbyDoubles": 1080,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_ScientistsFaceBattle": 1105,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,15,0,0,0,4,81,0,0,0,2,122,0,0,0,113,4,5,0,38,0,0,0,161,35,13,128,0,0,34,13,128,0,0,35,13,128,1,0,34,13,128,1,0,113,4,9,0,38,0,0,0,26,0,0,13,128,35,13,128,0,0,34,13,128,0,0,90,88,0,0,0,0,100,0,0,7,0,9,0,90,0,0,0,0,89,0,0,0,113,0,1,0,90,255,0,0,0,35,0,0,0,0,34,0,0,0,0,90,0,0,0,0,90,113,31,100,0,113,31,105,0,0,0,0,0,206,0,0,0,16,0,0,0,0,0,10,0,105,80,0,0,16,4,0,0,81,0,0,16,4,0,0,0,0,80,0,0,16,4,0,0,81,0,0,16,4,0,0,0,0,80,255,0,16,4,0,0,81,255,0,16,4,0,0,0,0,82,0,0,83,0,0,0,0,88,81,4,0,0,89,60,1,0,0,90,35,0,0,0,0,34,0,0,0,0,80,0,0,16,4,0,0,81,0,0,16,4,0,0,0,0,80,255,0,16,4,0,0,81,255,0,16,4,0,0,0,0,82,0,0,83,0,0,0,0,88,81,4,0,0,113,4,11,0,38,0,0,0,84,0,0,85,0,0,0,0,100,0,0,7,0,1,0,86,0,0,87,0,0,0,0,80,0,0,16,4,0,0,81,0,0,16,4,0,0,0,0,82,0,0,83,0,0,0,0,35,0,0,0,0,34,0,0,0,0,113,4,5,0,38,0,0,0,106,16,0,0,0,0,0,10,0,0,0,0,105,113,4,2,0,113,5,6,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,113,4,6,0,113,5,0,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,4,0,113,6,4,0,38,0,0,0,89,16,4,0,0,113,4,1,0,113,5,3,0,38,0,0,0,35,13,128,15,39,34,13,128,15,39,115,13,1,27,6,128,13,128,113,4,2,0,113,5,3,0,26,6,128,255,255,113,6,255,255,38,0,0,0,88,0,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,115,13,1,113,4,2,0,113,5,2,0,26,6,128,13,128,113,6,13,128,38,0,0,0,113,6,1,0,58,0,0,255,255,255,255,255,8,255,255,255,255,255,8,0,8,0,8,8,0,0,0,0,113,4,2,0,113,5,0,0,26,6,128,3,0,113,6,3,0,38,0,0,0,89,16,4,0,0,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,16,0,0,0,0,0,10,0,88,116,3,0,0,35,13,128,1,0,34,13,128,1,0,89,128,1,0,0,113,4,12,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,105,80,0,0,16,4,0,0,81,0,0,16,4,0,0,0,0,82,0,0,83,0,0,0,0,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,16,0,0,0,0,0,10,0,89,154,3,0,0,113,4,1,0,113,5,7,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,113,4,2,0,113,5,7,0,26,6,128,255,255,113,6,255,255,38,0,0,0,16,0,0,0,0,0,10,0,88,116,3,0,0,35,13,128,1,0,34,13,128,1,0,89,128,1,0,0,113,4,12,0,38,0,0,0,35,13,128,2,0,34,13,128,2,0,16,0,0,0,0,0,10,0,0,0,0,80,0,0,16,4,0,0,81,0,0,16,4,0,0,0,0,82,0,0,83,0,0,0,0,50,210,1,104,0,0,0,0,0,0,0,51,113,4,13,0,38,0,0,0,16,0,0,0,0,0,10,0,89,154,3,0,0,105,113,4,2,0,113,5,6,0,26,6,128,0,0,113,6,0,0,38,0,0,0,38,0,0,0,113,4,6,0,113,5,0,0,38,0,0,0,113,4,1,0,113,5,3,0,38,0,0,0,35,13,128,15,39,34,13,128,15,39,115,13,1,27,6,128,13,128,113,4,2,0,113,5,3,0,26,6,128,255,255,113,6,255,255,38,0,0,0,113,4,1,0,113,5,1,0,38,0,0,0,35,13,128,15,39,34,13,128,15,39,115,13,1,113,4,2,0,113,5,1,0,26,6,128,13,128,113,6,13,128,38,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,115,13,1,89,18,2,0,0,90,26,13,128,206,64,35,13,128,1,0,34,13,128,1,0,58,0,0,255,255,255,255,255,4,255,255,255,255,255,4,0,8,0,4,8,0,0,0,0,90,58,0,0,255,255,255,255,255,14,255,255,255,255,255,14,0,8,0,14,8,0,0,0,0,90,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0] as const;

export const STATS = { ops: 179, bytes: 1209, labels: 32, unknownOps: 11, unresolvedSymbols: 44 } as const;
