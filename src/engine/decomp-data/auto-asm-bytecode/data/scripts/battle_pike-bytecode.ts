// AUTO-GENERATED from data/scripts/battle_pike-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-12
// Stats: ops=173, bytes=1823, labels=34, unknownOps=0, unresolvedSymbols=16

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattlePikeRoom_MapScripts": 0,
  "BattleFrontier_BattlePikeRoom_OnTransition": 10,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_SetDoubleBattleObjPos": 290,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_SetTwoObjectRoomPos": 305,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_SetOneObjectRoomPos": 320,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_SetNPCRoomObjPos": 335,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_SetBrainRoomObjPos": 350,
  "BattleFrontier_BattlePikeRoom_OnWarp": 365,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_InitRoomObjects": 373,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_InitTwoObjectRoom": 495,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_InitBrainRoomObjects": 505,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_LeftRoomWarp": 520,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_CenterRoomWarp": 531,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_RightRoomWarp": 542,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_RoomWarp": 553,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_WarpNPCRoom": 951,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_WarpWildMonRoom": 1005,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_SetEnteredRoom": 1059,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_NoTurningBack": 1070,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_SetEnteredRoom": 1091,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_NoTurningBack": 1102,
  "BattleFrontier_BattlePikeRoomNormal_EventScript_Exit": 1123,
  "BattleFrontier_BattlePikeRoom_EventScript_DisableHealing": 1317,
  "BattleFrontier_BattlePikeRoom_EventScript_EnableHealing": 1332,
  "BattleFrontier_BattlePikeRoom_EventScript_WarpToFinalRoom": 1347,
  "BattleFrontier_BattlePikeRoom_EventScript_WarpToThreePathRoom": 1400,
  "BattleFrontier_BattlePikeRoomWildMons_EventScript_Exit": 1453,
  "BattleFrontier_BattlePikeRoomWildMons_EventScript_SetEnteredRoom": 1656,
  "BattleFrontier_BattlePikeRoomWildMons_EventScript_NoTurningBack": 1667,
  "BattleFrontier_BattlePike_EventScript_Retire": 1688,
  "BattleFrontier_BattlePikeRoom_OnResume": 1737,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_EndOnResume": 1805,
  "BattleFrontier_BattlePikeRoom_EventScript_ResetSketchedMoves": 1811,
  "BattleFrontier_BattlePikeRoom_Movement_HidePlayer": 1821,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,10,0,0,0,4,109,1,0,0,23,4,128,4,0,38,0,0,58,23,4,128,5,0,38,0,0,58,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,64,1,0,0,34,64,1,0,0,7,1,0,0,0,0,7,1,64,1,0,0,35,0,128,1,0,34,0,128,1,0,35,64,1,0,0,34,64,1,0,0,7,1,0,0,0,0,7,1,64,1,0,0,35,0,128,2,0,34,0,128,2,0,35,79,1,0,0,34,79,1,0,0,7,1,0,0,0,0,7,1,79,1,0,0,35,0,128,3,0,34,0,128,3,0,35,49,1,0,0,34,49,1,0,0,7,1,0,0,0,0,7,1,49,1,0,0,35,0,128,4,0,34,0,128,4,0,35,64,1,0,0,34,64,1,0,0,7,1,0,0,0,0,7,1,64,1,0,0,35,0,128,7,0,34,0,128,7,0,35,34,1,0,0,34,34,1,0,0,7,1,0,0,0,0,7,1,34,1,0,0,35,0,128,6,0,34,0,128,6,0,35,49,1,0,0,34,49,1,0,0,7,1,0,0,0,0,7,1,49,1,0,0,35,0,128,8,0,34,0,128,8,0,35,94,1,0,0,34,94,1,0,0,7,1,0,0,0,0,7,1,94,1,0,0,3,100,0,0,2,0,5,0,100,0,0,6,0,5,0,3,100,0,0,4,0,4,0,100,0,0,3,0,4,0,3,100,0,0,4,0,4,0,100,0,0,0,0,0,0,3,100,0,0,5,0,5,0,100,0,0,0,0,0,0,3,100,0,0,4,0,3,0,100,0,0,4,0,4,0,3,0,0,0,0,117,1,0,0,23,17,64,28,0,23,16,64,28,0,23,4,128,5,0,38,0,0,58,35,13,128,3,0,34,13,128,3,0,7,1,239,1,0,0,7,1,13,128,0,0,35,13,128,6,0,34,13,128,6,0,7,1,239,1,0,0,7,1,13,128,0,0,35,13,128,7,0,34,13,128,7,0,7,1,239,1,0,0,7,1,13,128,0,0,35,13,128,8,0,34,13,128,8,0,7,1,249,1,0,0,7,1,13,128,0,0,90,0,0,0,0,23,0,0,1,0,92,255,0,2,3,23,0,0,1,0,92,255,0,2,3,23,0,0,1,0,92,255,0,2,90,0,0,0,0,3,23,7,128,0,0,6,41,2,0,0,3,23,7,128,1,0,6,41,2,0,0,3,23,7,128,2,0,6,41,2,0,0,3,23,4,128,1,0,23,5,128,1,0,38,0,0,58,24,13,128,1,0,23,4,128,2,0,23,5,128,1,0,26,6,128,13,128,23,6,128,13,128,38,0,0,58,23,4,128,1,0,23,5,128,2,0,38,0,0,58,24,13,128,1,0,23,4,128,2,0,23,5,128,2,0,26,6,128,13,128,23,6,128,13,128,38,0,0,58,23,4,128,0,0,38,0,0,58,23,4,128,5,0,38,0,0,58,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,183,3,0,0,34,183,3,0,0,7,1,0,0,0,0,7,1,183,3,0,0,35,0,128,1,0,34,0,128,1,0,35,183,3,0,0,34,183,3,0,0,7,1,0,0,0,0,7,1,183,3,0,0,35,0,128,2,0,34,0,128,2,0,35,183,3,0,0,34,183,3,0,0,7,1,0,0,0,0,7,1,183,3,0,0,35,0,128,3,0,34,0,128,3,0,35,183,3,0,0,34,183,3,0,0,7,1,0,0,0,0,7,1,183,3,0,0,35,0,128,4,0,34,0,128,4,0,35,183,3,0,0,34,183,3,0,0,7,1,0,0,0,0,7,1,183,3,0,0,35,0,128,5,0,34,0,128,5,0,35,237,3,0,0,34,237,3,0,0,7,1,0,0,0,0,7,1,237,3,0,0,35,0,128,6,0,34,0,128,6,0,35,183,3,0,0,34,183,3,0,0,7,1,0,0,0,0,7,1,183,3,0,0,35,0,128,7,0,34,0,128,7,0,35,183,3,0,0,34,183,3,0,0,7,1,0,0,0,0,7,1,183,3,0,0,35,0,128,8,0,34,0,128,8,0,35,183,3,0,0,34,183,3,0,0,7,1,0,0,0,0,7,1,183,3,0,0,3,80,255,0,29,7,0,0,81,255,0,29,7,0,0,0,0,82,0,0,83,0,0,0,0,5,0,0,0,0,59,0,0,255,255,255,255,255,4,255,255,255,255,255,4,0,7,0,4,7,0,0,0,58,3,80,255,0,29,7,0,0,81,255,0,29,7,0,0,0,0,82,0,0,83,0,0,0,0,5,0,0,0,0,59,0,0,255,255,255,255,255,4,255,255,255,255,255,4,0,19,0,4,19,0,0,0,58,3,23,0,0,1,0,23,0,0,1,0,3,23,0,0,0,0,23,0,0,0,0,106,16,0,0,0,0,0,10,4,105,3,23,0,0,1,0,23,0,0,1,0,3,23,0,0,0,0,23,0,0,0,0,106,16,0,0,0,0,0,10,4,105,3,23,4,128,25,0,38,0,0,58,35,13,128,1,0,34,13,128,1,0,8,1,37,5,0,0,8,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,8,5,52,5,0,0,8,5,13,128,0,0,23,4,128,1,0,23,5,128,1,0,38,0,0,58,24,13,128,1,0,23,4,128,2,0,23,5,128,1,0,26,6,128,13,128,23,6,128,13,128,38,0,0,58,23,4,128,1,0,23,5,128,2,0,38,0,0,58,24,13,128,1,0,23,4,128,2,0,23,5,128,2,0,26,6,128,13,128,23,6,128,13,128,38,0,0,58,23,4,128,3,0,38,0,0,58,35,13,128,1,0,34,13,128,1,0,8,1,67,5,0,0,8,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,8,1,120,5,0,0,8,1,13,128,0,0,58,3,23,4,128,24,0,23,5,128,1,0,38,0,0,58,4,23,4,128,24,0,23,5,128,0,0,38,0,0,58,4,80,255,0,29,7,0,0,81,255,0,29,7,0,0,0,0,82,0,0,83,0,0,0,0,5,0,0,0,0,59,0,0,255,255,255,255,255,2,255,255,255,255,255,2,0,7,0,2,7,0,0,0,4,80,255,0,29,7,0,0,81,255,0,29,7,0,0,0,0,82,0,0,83,0,0,0,0,5,0,0,0,0,59,0,0,255,255,255,255,255,6,255,255,255,255,255,6,0,10,0,6,10,0,0,0,4,23,4,128,7,0,38,0,0,58,23,4,128,25,0,38,0,0,58,35,13,128,1,0,34,13,128,1,0,8,1,37,5,0,0,8,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,8,5,52,5,0,0,8,5,13,128,0,0,23,4,128,1,0,23,5,128,1,0,38,0,0,58,24,13,128,1,0,23,4,128,2,0,23,5,128,1,0,26,6,128,13,128,23,6,128,13,128,38,0,0,58,23,4,128,1,0,23,5,128,2,0,38,0,0,58,24,13,128,1,0,23,4,128,2,0,23,5,128,2,0,26,6,128,13,128,23,6,128,13,128,38,0,0,58,23,4,128,3,0,38,0,0,58,35,13,128,1,0,34,13,128,1,0,8,1,67,5,0,0,8,1,13,128,0,0,35,13,128,0,0,34,13,128,0,0,8,1,120,5,0,0,8,1,13,128,0,0,58,3,23,0,0,1,0,23,0,0,1,0,3,23,0,0,0,0,23,0,0,0,0,106,16,0,0,0,0,0,10,4,105,3,23,4,128,2,0,23,5,128,0,0,26,6,128,255,255,23,6,128,255,255,38,0,0,58,58,0,0,255,255,255,255,255,5,255,255,255,255,255,5,0,6,0,5,6,0,0,0,58,3,27,6,128,13,128,23,4,128,1,0,23,5,128,0,0,38,0,0,58,35,13,128,2,0,34,13,128,2,0,7,1,13,7,0,0,7,1,13,128,0,0,35,13,128,1,0,34,13,128,1,0,7,1,13,7,0,0,7,1,13,128,0,0,5,19,7,0,0,27,13,128,6,128,3,23,4,128,21,0,38,0,0,58,4,84,254] as const;

export const STATS = { ops: 173, bytes: 1823, labels: 34, unknownOps: 0, unresolvedSymbols: 16 } as const;
