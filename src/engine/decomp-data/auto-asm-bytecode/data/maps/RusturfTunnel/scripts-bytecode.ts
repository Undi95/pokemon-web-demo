// AUTO-GENERATED from data/maps/RusturfTunnel/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=321, bytes=1864, labels=48, unknownOps=2, unresolvedSymbols=38

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "RusturfTunnel_MapScripts": 0,
  "RusturfTunnel_OnFrame": 10,
  "RusturfTunnel_OnTransition": 26,
  "RusturfTunnel_EventScript_SetAquaGruntAndPeekoPos": 37,
  "RusturfTunnel_EventScript_Wanda": 52,
  "RusturfTunnel_EventScript_WandasBoyfriend": 89,
  "RusturfTunnel_EventScript_AlreadySpokenTo": 138,
  "RusturfTunnel_EventScript_ClearTunnelScene": 173,
  "RusturfTunnel_EventScript_BoyfriendApproachWanda1": 337,
  "RusturfTunnel_EventScript_BoyfriendApproachWanda2": 378,
  "RusturfTunnel_EventScript_BoyfriendApproachWanda3": 443,
  "RusturfTunnel_EventScript_FaceWandasBoyfriend1": 508,
  "RusturfTunnel_EventScript_FaceWandasBoyfriend2": 557,
  "RusturfTunnel_EventScript_FaceWandasBoyfriend3": 582,
  "RusturfTunnel_EventScript_WandasBoyfriendApproachPlayer": 583,
  "RusturfTunnel_EventScript_WandaAndBoyfriendExit1": 609,
  "RusturfTunnel_EventScript_WandaAndBoyfriendExit": 650,
  "RusturfTunnel_EventScript_WandasBoyfriendNotice": 707,
  "RusturfTunnel_Movement_WandaExit1": 759,
  "RusturfTunnel_Movement_WandaExit": 771,
  "RusturfTunnel_Movement_PlayerWatchWandaExit": 783,
  "RusturfTunnel_Movement_Unused1": 789,
  "RusturfTunnel_Movement_Unused2": 792,
  "RusturfTunnel_Movement_Unused3": 797,
  "RusturfTunnel_Movement_PlayerWatchBoyfriend1": 802,
  "RusturfTunnel_Movement_PlayerWatchBoyfriend": 805,
  "RusturfTunnel_Movement_BoyfriendFaceRight": 808,
  "RusturfTunnel_Movement_WandasBoyfriendExit1": 811,
  "RusturfTunnel_Movement_WandasBoyfriendExit": 824,
  "RusturfTunnel_Movement_WandasBoyfriendApproachPlayer": 837,
  "RusturfTunnel_Movement_BoyfriendApproachWanda1": 839,
  "RusturfTunnel_Movement_BoyfriendApproachWanda": 844,
  "RusturfTunnel_EventScript_TunnelBlockagePos1": 849,
  "RusturfTunnel_EventScript_TunnelBlockagePos2": 854,
  "RusturfTunnel_EventScript_TunnelBlockagePos3": 859,
  "RusturfTunnel_EventScript_AquaGruntBackUp": 864,
  "RusturfTunnel_Movement_GruntAndPeekoBackUp": 926,
  "RusturfTunnel_EventScript_Peeko": 930,
  "RusturfTunnel_EventScript_Grunt": 949,
  "RusturfTunnel_Movement_PushPlayerAsideForGrunt": 1384,
  "RusturfTunnel_Movement_PlayerMoveAsideForBriney": 1390,
  "RusturfTunnel_Movement_GruntEscape": 1393,
  "RusturfTunnel_Movement_BrineyApproachPeeko1": 1403,
  "RusturfTunnel_Movement_BrineyExit": 1411,
  "RusturfTunnel_Movement_PlayerWatchBrineyExit": 1423,
  "RusturfTunnel_Movement_BrineyApproachPeeko2": 1428,
  "RusturfTunnel_Movement_PeekoExit": 1431,
  "RusturfTunnel_EventScript_Mike": 1441,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,26,0,0,0,2,10,0,0,0,154,64,4,0,173,0,0,0,154,64,5,0,173,0,0,0,35,154,64,2,0,34,154,64,2,0,90,100,0,0,13,0,4,0,100,0,0,13,0,5,0,15,107,91,16,0,0,0,0,0,10,0,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,107,91,44,0,0,7,1,138,0,0,0,42,0,0,16,0,0,0,0,0,10,0,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,16,0,0,0,0,0,10,0,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,106,35,0,0,1,0,34,0,0,1,0,35,0,0,2,0,34,0,0,2,0,35,0,0,3,0,34,0,0,3,0,88,195,2,0,0,16,0,0,0,0,0,10,0,35,0,0,2,0,34,0,0,2,0,35,0,0,3,0,34,0,0,3,0,27,0,128,0,0,27,1,128,1,0,10,0,42,106,0,16,0,0,0,0,0,10,0,105,35,0,0,1,0,34,0,0,1,0,35,0,0,2,0,34,0,0,2,0,35,0,0,3,0,34,0,0,3,0,16,0,0,0,0,0,10,0,105,35,0,0,1,0,34,0,0,1,0,35,0,0,2,0,34,0,0,2,0,35,0,0,3,0,34,0,0,3,0,88,0,0,0,0,108,90,80,255,0,34,3,0,0,81,255,0,34,3,0,0,0,0,80,0,0,71,3,0,0,81,0,0,71,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,37,3,0,0,81,255,0,37,3,0,0,0,0,80,0,0,76,3,0,0,81,0,0,76,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,37,3,0,0,81,255,0,37,3,0,0,0,0,80,0,0,76,3,0,0,81,0,0,76,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,40,3,0,0,81,0,0,40,3,0,0,0,0,82,0,0,83,0,0,0,0,15,15,105,80,0,0,69,3,0,0,81,0,0,69,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,0,0,247,2,0,0,81,0,0,247,2,0,0,0,0,80,0,0,43,3,0,0,81,0,0,43,3,0,0,0,0,82,0,0,83,0,0,0,0,15,80,255,0,15,3,0,0,81,255,0,15,3,0,0,0,0,80,0,0,3,3,0,0,81,0,0,3,3,0,0,0,0,80,0,0,56,3,0,0,81,0,0,56,3,0,0,0,0,82,0,0,83,0,0,0,0,15,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,15,11,11,11,11,8,8,8,8,8,8,8,254,11,11,11,11,8,8,8,8,8,8,8,254,19,38,20,20,40,254,10,40,254,8,38,19,40,254,9,37,19,40,254,10,40,254,11,39,254,9,40,254,11,11,11,11,11,8,8,8,8,8,8,8,254,9,11,11,11,11,8,8,8,8,8,8,8,254,11,254,34,34,22,24,254,36,36,24,38,254,113,0,1,0,90,113,0,2,0,90,113,0,3,0,90,106,16,0,0,0,0,0,10,0,105,80,0,0,158,3,0,0,81,0,0,158,3,0,0,0,0,80,0,0,158,3,0,0,81,0,0,158,3,0,0,0,0,82,0,0,83,0,0,0,0,101,0,0,101,0,0,113,154,3,0,108,90,64,11,65,254,107,91,49,162,53,1,0,0,16,0,0,0,0,0,10,0,198,109,90,107,91,52,163,1,0,16,0,0,0,0,0,10,0,93,3,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,10,0,27,0,128,13,1,27,1,128,1,0,10,0,105,80,255,0,104,5,0,0,81,255,0,104,5,0,0,0,0,80,0,0,113,5,0,0,81,0,0,113,5,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,4,50,86,0,0,87,0,0,0,0,80,0,0,123,5,0,0,81,0,0,123,5,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,110,5,0,0,81,255,0,110,5,0,0,0,0,80,0,0,148,5,0,0,81,0,0,148,5,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,104,0,0,0,0,0,0,0,49,162,53,1,0,0,110,198,105,80,255,0,143,5,0,0,81,255,0,143,5,0,0,0,0,80,0,0,131,5,0,0,81,0,0,131,5,0,0,0,0,80,0,0,151,5,0,0,81,0,0,151,5,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,43,142,0,42,143,0,113,90,4,0,113,144,1,0,42,123,3,109,90,0,64,9,65,39,254,8,38,254,23,23,23,23,23,23,23,23,23,254,11,11,11,11,11,11,11,254,10,10,10,10,10,10,10,10,10,10,10,254,20,19,18,39,254,20,11,254,10,10,10,10,10,10,10,10,10,254,93,0,123,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,93,2,123,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,93,1,123,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,10,0,90] as const;

export const STATS = { ops: 321, bytes: 1864, labels: 48, unknownOps: 2, unresolvedSymbols: 38 } as const;
