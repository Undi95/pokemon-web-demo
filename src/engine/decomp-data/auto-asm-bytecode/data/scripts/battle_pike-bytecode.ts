// AUTO-GENERATED from data/scripts/battle_pike-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=173, bytes=1741, labels=34, unknownOps=0, unresolvedSymbols=25

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattlePikeRoom_MapScripts": 0,
  "BattleFrontier_BattlePikeRoom_OnTransition": 10,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_SetDoubleBattleObjPos": 288,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_SetTwoObjectRoomPos": 303,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_SetOneObjectRoomPos": 318,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_SetNPCRoomObjPos": 333,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_SetBrainRoomObjPos": 348,
  "BattleFrontier_BattlePikeRoom_OnWarp": 363,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_InitRoomObjects": 371,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_InitTwoObjectRoom": 489,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_InitBrainRoomObjects": 498,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_LeftRoomWarp": 512,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_CenterRoomWarp": 522,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_RightRoomWarp": 532,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_RoomWarp": 542,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_WarpNPCRoom": 924,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_WarpWildMonRoom": 978,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_SetEnteredRoom": 1032,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_NoTurningBack": 1041,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_SetEnteredRoom": 1060,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_NoTurningBack": 1069,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_Exit": 1088,
  "BattleFrontier_BattlePikeRoom_EventScript_DisableHealing": 1266,
  "BattleFrontier_BattlePikeRoom_EventScript_EnableHealing": 1279,
  "BattleFrontier_BattlePikeRoom_EventScript_WarpToFinalRoom": 1292,
  "BattleFrontier_BattlePikeRoom_EventScript_WarpToThreePathRoom": 1345,
  "BattleFrontier_BattlePikeRoomWildMons_EventScript_Exit": 1398,
  "BattleFrontier_BattlePikeRoomWildMons_EventScript_SetEnteredRoom": 1584,
  "BattleFrontier_BattlePikeRoomWildMons_EventScript_NoTurningBack": 1593,
  "BattleFrontier_BattlePike_EventScript_Retire": 1612,
  "BattleFrontier_BattlePikeRoom_OnResume": 1658,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_EndOnResume": 1724,
  "BattleFrontier_BattlePikeRoom_EventScript_ResetSketchedMoves": 1730,
  "BattleFrontier_BattlePikeRoom_Movement_HidePlayer": 1739,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,10,0,0,0,4,107,1,0,0,113,4,4,0,38,0,0,0,113,4,5,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,62,1,0,0,34,62,1,0,0,7,1,0,0,0,0,7,1,62,1,0,0,35,0,128,1,0,34,0,128,1,0,35,62,1,0,0,34,62,1,0,0,7,1,0,0,0,0,7,1,62,1,0,0,35,0,128,2,0,34,0,128,2,0,35,77,1,0,0,34,77,1,0,0,7,1,0,0,0,0,7,1,77,1,0,0,35,0,128,3,0,34,0,128,3,0,35,47,1,0,0,34,47,1,0,0,7,1,0,0,0,0,7,1,47,1,0,0,35,0,128,4,0,34,0,128,4,0,35,62,1,0,0,34,62,1,0,0,7,1,0,0,0,0,7,1,62,1,0,0,35,0,128,7,0,34,0,128,7,0,35,32,1,0,0,34,32,1,0,0,7,1,0,0,0,0,7,1,32,1,0,0,35,0,128,6,0,34,0,128,6,0,35,47,1,0,0,34,47,1,0,0,7,1,0,0,0,0,7,1,47,1,0,0,35,0,128,8,0,34,0,128,8,0,35,92,1,0,0,34,92,1,0,0,7,1,0,0,0,0,7,1,92,1,0,0,90,100,0,0,2,0,5,0,100,0,0,6,0,5,0,90,100,0,0,4,0,4,0,100,0,0,3,0,4,0,90,100,0,0,4,0,4,0,100,0,0,0,0,0,0,90,100,0,0,5,0,5,0,100,0,0,0,0,0,0,90,100,0,0,4,0,3,0,100,0,0,4,0,4,0,90,0,0,0,0,115,1,0,0,113,17,28,0,113,16,28,0,113,4,5,0,38,0,0,0,35,13,128,3,0,34,13,128,3,0,7,1,233,1,0,0,7,1,13,128,0,0,35,13,128,6,0,34,13,128,6,0,7,1,233,1,0,0,7,1,13,128,0,0,35,13,128,7,0,34,13,128,7,0,7,1,233,1,0,0,7,1,13,128,0,0,35,13,128,8,0,34,13,128,8,0,7,1,242,1,0,0,7,1,13,128,0,0,90,0,0,0,0,113,0,1,0,92,255,0,2,90,113,0,1,0,92,255,0,2,90,113,0,1,0,92,255,0,2,90,0,0,0,0,90,113,7,0,0,89,30,2,0,0,90,113,7,1,0,89,30,2,0,0,90,113,7,2,0,89,30,2,0,0,90,113,4,1,0,113,5,1,0,38,0,0,0,115,13,1,113,4,2,0,113,5,1,0,26,6,128,13,128,113,6,13,128,38,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,115,13,1,113,4,2,0,113,5,2,0,26,6,128,13,128,113,6,13,128,38,0,0,0,113,4,0,0,38,0,0,0,113,4,5,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,156,3,0,0,34,156,3,0,0,7,1,0,0,0,0,7,1,156,3,0,0,35,0,128,1,0,34,0,128,1,0,35,156,3,0,0,34,156,3,0,0,7,1,0,0,0,0,7,1,156,3,0,0,35,0,128,2,0,34,0,128,2,0,35,156,3,0,0,34,156,3,0,0,7,1,0,0,0,0,7,1,156,3,0,0,35,0,128,3,0,34,0,128,3,0,35,156,3,0,0,34,156,3,0,0,7,1,0,0,0,0,7,1,156,3,0,0,35,0,128,4,0,34,0,128,4,0,35,156,3,0,0,34,156,3,0,0,7,1,0,0,0,0,7,1,156,3,0,0,35,0,128,5,0,34,0,128,5,0,35,210,3,0,0,34,210,3,0,0,7,1,0,0,0,0,7,1,210,3,0,0,35,0,128,6,0,34,0,128,6,0,35,156,3,0,0,34,156,3,0,0,7,1,0,0,0,0,7,1,156,3,0,0,35,0,128,7,0,34,0,128,7,0,35,156,3,0,0,34,156,3,0,0,7,1,0,0,0,0,7,1,156,3,0,0,35,0,128,8,0,34,0,128,8,0,35,156,3,0,0,34,156,3,0,0,7,1,0,0,0,0,7,1,156,3,0,0,90,80,255,0,203,6,0,0,81,255,0,203,6,0,0,0,0,82,0,0,83,0,0,0,0,88,0,0,0,0,59,0,0,255,255,255,255,255,4,255,255,255,255,255,4,0,7,0,4,7,0,0,0,0,90,80,255,0,203,6,0,0,81,255,0,203,6,0,0,0,0,82,0,0,83,0,0,0,0,88,0,0,0,0,59,0,0,255,255,255,255,255,4,255,255,255,255,255,4,0,19,0,4,19,0,0,0,0,90,113,0,1,0,113,0,1,0,90,113,0,0,0,113,0,0,0,106,16,0,0,0,0,0,10,0,105,90,113,0,1,0,113,0,1,0,90,113,0,0,0,113,0,0,0,106,16,0,0,0,0,0,10,0,105,90,113,4,25,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,8,1,242,4,0,0,8,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,8,5,255,4,0,0,8,5,13,128,0,0,113,4,1,0,113,5,1,0,38,0,0,0,115,13,1,113,4,2,0,113,5,1,0,26,6,128,13,128,113,6,13,128,38,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,115,13,1,113,4,2,0,113,5,2,0,26,6,128,13,128,113,6,13,128,38,0,0,0,113,4,3,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,8,1,12,5,0,0,8,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,8,1,65,5,0,0,8,1,13,128,0,0,0,90,113,4,24,0,113,5,1,0,38,0,0,0,15,113,4,24,0,113,5,0,0,38,0,0,0,15,80,255,0,203,6,0,0,81,255,0,203,6,0,0,0,0,82,0,0,83,0,0,0,0,88,0,0,0,0,59,0,0,255,255,255,255,255,2,255,255,255,255,255,2,0,7,0,2,7,0,0,0,15,80,255,0,203,6,0,0,81,255,0,203,6,0,0,0,0,82,0,0,83,0,0,0,0,88,0,0,0,0,59,0,0,255,255,255,255,255,6,255,255,255,255,255,6,0,10,0,6,10,0,0,0,15,113,4,7,0,38,0,0,0,113,4,25,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,8,1,242,4,0,0,8,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,8,5,255,4,0,0,8,5,13,128,0,0,113,4,1,0,113,5,1,0,38,0,0,0,115,13,1,113,4,2,0,113,5,1,0,26,6,128,13,128,113,6,13,128,38,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,115,13,1,113,4,2,0,113,5,2,0,26,6,128,13,128,113,6,13,128,38,0,0,0,113,4,3,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,8,1,12,5,0,0,8,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,8,1,65,5,0,0,8,1,13,128,0,0,0,90,113,0,1,0,113,0,1,0,90,113,0,0,0,113,0,0,0,106,16,0,0,0,0,0,10,0,105,90,113,4,2,0,113,5,0,0,26,6,128,255,255,113,6,255,255,38,0,0,0,58,0,0,255,255,255,255,255,5,255,255,255,255,255,5,0,6,0,5,6,0,0,0,0,90,27,6,128,13,128,113,4,1,0,113,5,0,0,38,0,0,0,35,13,128,2,0,34,13,128,2,0,7,1,188,6,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,188,6,0,0,7,1,13,128,0,0,88,194,6,0,0,27,13,128,6,128,90,113,4,21,0,38,0,0,0,15,84,254] as const;

export const STATS = { ops: 173, bytes: 1741, labels: 34, unknownOps: 0, unresolvedSymbols: 25 } as const;
