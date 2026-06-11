// AUTO-GENERATED from data/maps/BattleFrontier_BattleFactoryBattleRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-11
// Stats: ops=179, bytes=1663, labels=32, unknownOps=0, unresolvedSymbols=84

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattleFactoryBattleRoom_MapScripts": 0,
  "BattleFrontier_BattleFactoryBattleRoom_OnTransition": 15,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_SetUpFactoryHeadObj": 106,
  "BattleFrontier_BattleFactoryBattleRoom_OnWarp": 119,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_HideObjects": 127,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_EndHideObjects": 164,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_SetPlayerGfxMale": 165,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_SetPlayerGfxFemale": 171,
  "BattleFrontier_BattleFactoryBattleRoom_OnFrame": 177,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_EnterRoomFactoryHeadBattle": 185,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_EnterRoom": 261,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_BattleOpponent": 384,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_WarpToLobbyLost": 505,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_DefeatedOpponent": 534,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_IncrementWinStreak": 604,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_IncrementBattleNum": 609,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_WarpToLobbyWon": 718,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_BattleNoland": 747,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_BattleNolandSilver": 916,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_DefeatedNolandSilver": 956,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_IntroNolandGold": 1052,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_BattleNolandGold": 1120,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_DefeatedNolandGold": 1160,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_DoNolandBattle": 1256,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_DefeatedNoland": 1300,
  "BattleFrontier_BattleFactoryBattleRoom_Movement_PlayerEnterRoom": 1460,
  "BattleFrontier_BattleFactoryBattleRoom_Movement_PlayerApproachNoland": 1467,
  "BattleFrontier_BattleFactoryBattleRoom_Movement_OpponentEnter": 1469,
  "BattleFrontier_BattleFactoryBattleRoom_Movement_NolandMoveToBattle": 1476,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_WarpToLobby": 1481,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_WarpToLobbyDoubles": 1533,
  "BattleFrontier_BattleFactoryBattleRoom_EventScript_ScientistsFaceBattle": 1558,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,15,0,0,0,0,119,0,0,0,0,177,0,0,0,23,0,0,0,0,38,0,0,0,161,35,0,0,0,0,34,0,0,0,0,8,1,165,0,0,0,8,1,0,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,171,0,0,0,8,1,0,0,0,0,23,0,0,0,0,38,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,5,106,0,0,0,7,5,0,0,0,0,3,5,0,0,0,0,100,0,0,7,0,9,0,3,0,0,0,0,127,0,0,0,23,0,0,1,0,90,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,5,164,0,0,0,7,5,0,0,0,0,90,0,0,0,0,3,23,0,0,0,0,4,23,0,0,0,0,4,0,0,0,0,5,1,0,0,16,0,0,0,0,0,10,4,105,80,0,0,196,5,0,0,81,0,0,196,5,0,0,0,0,80,0,0,180,5,0,0,81,0,0,180,5,0,0,0,0,80,0,0,180,5,0,0,81,0,0,180,5,0,0,0,0,82,0,0,83,0,0,0,0,5,22,6,0,0,6,128,1,0,0,3,35,0,0,0,0,34,0,0,0,0,7,5,185,0,0,0,7,5,0,0,0,0,80,0,0,180,5,0,0,81,0,0,180,5,0,0,0,0,80,0,0,180,5,0,0,81,0,0,180,5,0,0,0,0,82,0,0,83,0,0,0,0,5,22,6,0,0,23,0,0,0,0,38,0,0,0,84,0,0,85,0,0,0,0,100,0,0,7,0,1,0,86,0,0,87,0,0,0,0,80,0,0,189,5,0,0,81,0,0,189,5,0,0,0,0,82,0,0,83,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,5,235,2,0,0,7,5,0,0,0,0,23,0,0,0,0,38,0,0,0,106,16,0,0,0,0,0,10,4,103,105,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,26,0,0,0,0,35,0,0,1,0,34,0,0,1,0,35,22,2,0,0,34,22,2,0,0,7,1,0,0,0,0,7,1,22,2,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,6,201,5,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,92,2,0,0,7,1,0,0,0,0,24,0,0,1,0,27,0,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,255,255,23,0,0,255,255,38,0,0,0,5,0,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,24,0,0,1,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,26,0,0,0,0,35,0,0,7,0,34,0,0,7,0,35,206,2,0,0,34,206,2,0,0,7,1,0,0,0,0,7,1,206,2,0,0,23,0,0,1,0,58,0,0,0,255,255,255,255,8,255,255,255,255,0,8,0,8,0,8,8,0,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,6,201,5,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,28,4,0,0,34,28,4,0,0,7,1,0,0,0,0,7,1,28,4,0,0,35,0,0,0,0,34,0,0,0,0,35,148,3,0,0,34,148,3,0,0,7,1,0,0,0,0,7,1,148,3,0,0,35,0,0,0,0,34,0,0,0,0,35,96,4,0,0,34,96,4,0,0,7,1,0,0,0,0,7,1,96,4,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,5,148,3,0,0,7,5,0,0,0,0,16,0,0,0,0,0,10,4,23,0,0,0,0,23,0,0,0,0,26,0,0,255,255,23,0,0,255,255,38,0,0,0,16,0,0,0,0,0,10,4,5,232,4,0,0,35,0,0,1,0,34,0,0,1,0,7,1,188,3,0,0,7,1,0,0,0,0,6,249,1,0,0,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,5,20,5,0,0,7,5,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,187,5,0,0,81,0,0,187,5,0,0,0,0,82,0,0,83,0,0,0,0,50,210,1,104,0,0,0,0,103,51,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,6,20,5,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,5,96,4,0,0,7,5,0,0,0,0,16,0,0,0,0,0,10,4,23,0,0,0,0,23,0,0,0,0,26,0,0,255,255,23,0,0,255,255,38,0,0,0,16,0,0,0,0,0,10,4,5,232,4,0,0,35,0,0,1,0,34,0,0,1,0,7,1,136,4,0,0,7,1,0,0,0,0,6,249,1,0,0,23,0,0,0,0,38,0,0,0,35,0,0,2,0,34,0,0,2,0,7,1,20,5,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,103,80,0,0,187,5,0,0,81,0,0,187,5,0,0,0,0,82,0,0,83,0,0,0,0,50,210,1,104,0,0,0,0,103,51,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,6,20,5,0,0,105,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,4,23,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,92,2,0,0,7,1,0,0,0,0,24,0,0,1,0,27,0,0,0,0,23,0,0,0,0,23,0,0,0,0,26,0,0,255,255,23,0,0,255,255,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,97,2,0,0,7,1,0,0,0,0,24,0,0,1,0,23,0,0,0,0,23,0,0,0,0,26,0,0,0,0,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,24,0,0,1,0,6,206,2,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,253,5,0,0,7,1,0,0,0,0,58,0,0,0,255,255,255,255,4,255,255,255,255,0,4,0,8,0,4,8,0,0,0,0,3,58,0,0,0,255,255,255,255,14,255,255,255,255,0,14,0,8,0,14,8,0,0,0,0,3,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4] as const;

export const STATS = { ops: 179, bytes: 1663, labels: 32, unknownOps: 0, unresolvedSymbols: 84 } as const;
