// AUTO-GENERATED from data/scripts/battle_pike-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=173, bytes=1012, labels=34, unknownOps=7, unresolvedSymbols=25

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattlePikeRoom_MapScripts": 0,
  "BattleFrontier_BattlePikeRoom_OnTransition": 10,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_SetDoubleBattleObjPos": 27,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_SetTwoObjectRoomPos": 42,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_SetOneObjectRoomPos": 57,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_SetNPCRoomObjPos": 72,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_SetBrainRoomObjPos": 87,
  "BattleFrontier_BattlePikeRoom_OnWarp": 102,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_InitRoomObjects": 110,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_InitTwoObjectRoom": 180,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_InitBrainRoomObjects": 189,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_LeftRoomWarp": 203,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_CenterRoomWarp": 213,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_RightRoomWarp": 223,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_RoomWarp": 233,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_WarpNPCRoom": 322,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_WarpWildMonRoom": 376,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_SetEnteredRoom": 430,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_NoTurningBack": 439,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_SetEnteredRoom": 458,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_NoTurningBack": 467,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_Exit": 486,
  "BattleFrontier_BattlePikeRoom_EventScript_DisableHealing": 616,
  "BattleFrontier_BattlePikeRoom_EventScript_EnableHealing": 628,
  "BattleFrontier_BattlePikeRoom_EventScript_WarpToFinalRoom": 640,
  "BattleFrontier_BattlePikeRoom_EventScript_WarpToThreePathRoom": 692,
  "BattleFrontier_BattlePikeRoomWildMons_EventScript_Exit": 744,
  "BattleFrontier_BattlePikeRoomWildMons_EventScript_SetEnteredRoom": 882,
  "BattleFrontier_BattlePikeRoomWildMons_EventScript_NoTurningBack": 891,
  "BattleFrontier_BattlePike_EventScript_Retire": 910,
  "BattleFrontier_BattlePikeRoom_OnResume": 956,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_EndOnResume": 998,
  "BattleFrontier_BattlePikeRoom_EventScript_ResetSketchedMoves": 1004,
  "BattleFrontier_BattlePikeRoom_Movement_HidePlayer": 1012,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,10,0,0,0,4,102,0,0,0,113,4,4,0,38,0,0,0,113,4,5,0,38,0,0,0,90,100,0,0,2,0,5,0,100,0,0,6,0,5,0,90,100,0,0,4,0,4,0,100,0,0,3,0,4,0,90,100,0,0,4,0,4,0,100,0,0,0,0,0,0,90,100,0,0,5,0,5,0,100,0,0,0,0,0,0,90,100,0,0,4,0,3,0,100,0,0,4,0,4,0,90,0,0,0,0,110,0,0,0,113,17,28,0,113,16,28,0,113,4,5,0,38,0,0,0,35,13,128,3,0,34,13,128,3,0,35,13,128,6,0,34,13,128,6,0,35,13,128,7,0,34,13,128,7,0,35,13,128,8,0,34,13,128,8,0,90,0,0,0,0,113,0,1,0,92,255,0,2,90,113,0,1,0,92,255,0,2,90,113,0,1,0,92,255,0,2,90,0,0,0,0,90,113,7,0,0,89,233,0,0,0,90,113,7,1,0,89,233,0,0,0,90,113,7,2,0,89,233,0,0,0,90,113,4,1,0,113,5,1,0,38,0,0,0,115,13,1,113,4,2,0,113,5,1,0,26,6,128,13,128,113,6,13,128,38,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,115,13,1,113,4,2,0,113,5,2,0,26,6,128,13,128,113,6,13,128,38,0,0,0,113,4,0,0,38,0,0,0,113,4,5,0,38,0,0,0,90,80,255,0,244,3,0,0,81,255,0,244,3,0,0,0,0,82,0,0,83,0,0,0,0,88,0,0,0,0,59,0,0,255,255,255,255,255,4,255,255,255,255,255,4,0,7,0,4,7,0,0,0,0,90,80,255,0,244,3,0,0,81,255,0,244,3,0,0,0,0,82,0,0,83,0,0,0,0,88,0,0,0,0,59,0,0,255,255,255,255,255,4,255,255,255,255,255,4,0,19,0,4,19,0,0,0,0,90,113,0,1,0,113,0,1,0,90,113,0,0,0,113,0,0,0,106,16,0,0,0,0,0,10,0,105,90,113,0,1,0,113,0,1,0,90,113,0,0,0,113,0,0,0,106,16,0,0,0,0,0,10,0,105,90,113,4,25,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,1,0,34,13,128,1,0,113,4,1,0,113,5,1,0,38,0,0,0,115,13,1,113,4,2,0,113,5,1,0,26,6,128,13,128,113,6,13,128,38,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,115,13,1,113,4,2,0,113,5,2,0,26,6,128,13,128,113,6,13,128,38,0,0,0,113,4,3,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,0,0,34,13,128,0,0,0,90,113,4,24,0,113,5,1,0,38,0,0,0,113,4,24,0,113,5,0,0,38,0,0,0,80,255,0,244,3,0,0,81,255,0,244,3,0,0,0,0,82,0,0,83,0,0,0,0,88,0,0,0,0,59,0,0,255,255,255,255,255,2,255,255,255,255,255,2,0,7,0,2,7,0,0,0,80,255,0,244,3,0,0,81,255,0,244,3,0,0,0,0,82,0,0,83,0,0,0,0,88,0,0,0,0,59,0,0,255,255,255,255,255,6,255,255,255,255,255,6,0,10,0,6,10,0,0,0,113,4,7,0,38,0,0,0,113,4,25,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,1,0,34,13,128,1,0,113,4,1,0,113,5,1,0,38,0,0,0,115,13,1,113,4,2,0,113,5,1,0,26,6,128,13,128,113,6,13,128,38,0,0,0,113,4,1,0,113,5,2,0,38,0,0,0,115,13,1,113,4,2,0,113,5,2,0,26,6,128,13,128,113,6,13,128,38,0,0,0,113,4,3,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,35,13,128,0,0,34,13,128,0,0,0,90,113,0,1,0,113,0,1,0,90,113,0,0,0,113,0,0,0,106,16,0,0,0,0,0,10,0,105,90,113,4,2,0,113,5,0,0,26,6,128,255,255,113,6,255,255,38,0,0,0,58,0,0,255,255,255,255,255,5,255,255,255,255,255,5,0,6,0,5,6,0,0,0,0,90,27,6,128,13,128,113,4,1,0,113,5,0,0,38,0,0,0,35,13,128,2,0,34,13,128,2,0,35,13,128,1,0,34,13,128,1,0,88,236,3,0,0,27,13,128,6,128,90,113,4,21,0,38,0,0,0] as const;

export const STATS = { ops: 173, bytes: 1012, labels: 34, unknownOps: 7, unresolvedSymbols: 25 } as const;
