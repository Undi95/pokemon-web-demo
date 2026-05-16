// AUTO-GENERATED from data/maps/RusturfTunnel/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=321, bytes=2013, labels=48, unknownOps=0, unresolvedSymbols=34

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "RusturfTunnel_MapScripts": 0,
  "RusturfTunnel_OnFrame": 10,
  "RusturfTunnel_OnTransition": 26,
  "RusturfTunnel_EventScript_SetAquaGruntAndPeekoPos": 49,
  "RusturfTunnel_EventScript_Wanda": 64,
  "RusturfTunnel_EventScript_WandasBoyfriend": 101,
  "RusturfTunnel_EventScript_AlreadySpokenTo": 150,
  "RusturfTunnel_EventScript_ClearTunnelScene": 185,
  "RusturfTunnel_EventScript_BoyfriendApproachWanda1": 481,
  "RusturfTunnel_EventScript_BoyfriendApproachWanda2": 522,
  "RusturfTunnel_EventScript_BoyfriendApproachWanda3": 587,
  "RusturfTunnel_EventScript_FaceWandasBoyfriend1": 652,
  "RusturfTunnel_EventScript_FaceWandasBoyfriend2": 701,
  "RusturfTunnel_EventScript_FaceWandasBoyfriend3": 726,
  "RusturfTunnel_EventScript_WandasBoyfriendApproachPlayer": 727,
  "RusturfTunnel_EventScript_WandaAndBoyfriendExit1": 753,
  "RusturfTunnel_EventScript_WandaAndBoyfriendExit": 794,
  "RusturfTunnel_EventScript_WandasBoyfriendNotice": 851,
  "RusturfTunnel_Movement_WandaExit1": 903,
  "RusturfTunnel_Movement_WandaExit": 915,
  "RusturfTunnel_Movement_PlayerWatchWandaExit": 927,
  "RusturfTunnel_Movement_Unused1": 933,
  "RusturfTunnel_Movement_Unused2": 936,
  "RusturfTunnel_Movement_Unused3": 941,
  "RusturfTunnel_Movement_PlayerWatchBoyfriend1": 946,
  "RusturfTunnel_Movement_PlayerWatchBoyfriend": 949,
  "RusturfTunnel_Movement_BoyfriendFaceRight": 952,
  "RusturfTunnel_Movement_WandasBoyfriendExit1": 955,
  "RusturfTunnel_Movement_WandasBoyfriendExit": 968,
  "RusturfTunnel_Movement_WandasBoyfriendApproachPlayer": 981,
  "RusturfTunnel_Movement_BoyfriendApproachWanda1": 983,
  "RusturfTunnel_Movement_BoyfriendApproachWanda": 988,
  "RusturfTunnel_EventScript_TunnelBlockagePos1": 993,
  "RusturfTunnel_EventScript_TunnelBlockagePos2": 999,
  "RusturfTunnel_EventScript_TunnelBlockagePos3": 1005,
  "RusturfTunnel_EventScript_AquaGruntBackUp": 1011,
  "RusturfTunnel_Movement_GruntAndPeekoBackUp": 1074,
  "RusturfTunnel_EventScript_Peeko": 1078,
  "RusturfTunnel_EventScript_Grunt": 1097,
  "RusturfTunnel_Movement_PushPlayerAsideForGrunt": 1533,
  "RusturfTunnel_Movement_PlayerMoveAsideForBriney": 1539,
  "RusturfTunnel_Movement_GruntEscape": 1542,
  "RusturfTunnel_Movement_BrineyApproachPeeko1": 1552,
  "RusturfTunnel_Movement_BrineyExit": 1560,
  "RusturfTunnel_Movement_PlayerWatchBrineyExit": 1572,
  "RusturfTunnel_Movement_BrineyApproachPeeko2": 1577,
  "RusturfTunnel_Movement_PeekoExit": 1580,
  "RusturfTunnel_EventScript_Mike": 1590,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,26,0,0,0,2,10,0,0,0,154,64,4,0,185,0,0,0,154,64,5,0,185,0,0,0,35,154,64,2,0,34,154,64,2,0,8,1,49,0,0,0,8,1,154,64,0,0,3,100,0,0,13,0,4,0,100,0,0,13,0,5,0,4,107,91,16,0,0,0,0,0,10,4,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,3,107,91,44,0,0,7,1,150,0,0,0,42,0,0,16,0,0,0,0,0,10,4,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,3,16,0,0,0,0,0,10,4,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,3,106,35,0,0,1,0,34,0,0,1,0,8,1,140,2,0,0,8,1,0,0,0,0,35,0,0,2,0,34,0,0,2,0,8,1,189,2,0,0,8,1,0,0,0,0,35,0,0,3,0,34,0,0,3,0,8,1,214,2,0,0,8,1,0,0,0,0,5,83,3,0,0,16,0,0,0,0,0,10,4,35,0,0,2,0,34,0,0,2,0,8,1,215,2,0,0,8,1,0,0,0,0,35,0,0,3,0,34,0,0,3,0,8,1,215,2,0,0,8,1,0,0,0,0,27,0,128,0,0,27,1,128,1,0,10,0,42,106,0,16,0,0,0,0,0,10,4,105,35,0,0,1,0,34,0,0,1,0,8,1,225,1,0,0,8,1,0,0,0,0,35,0,0,2,0,34,0,0,2,0,8,1,10,2,0,0,8,1,0,0,0,0,35,0,0,3,0,34,0,0,3,0,8,1,75,2,0,0,8,1,0,0,0,0,16,0,0,0,0,0,10,4,105,35,0,0,1,0,34,0,0,1,0,8,1,241,2,0,0,8,1,0,0,0,0,35,0,0,2,0,34,0,0,2,0,8,1,26,3,0,0,8,1,0,0,0,0,35,0,0,3,0,34,0,0,3,0,8,1,26,3,0,0,8,1,0,0,0,0,5,0,0,0,0,108,3,80,255,0,178,3,0,0,81,255,0,178,3,0,0,0,0,80,0,0,215,3,0,0,81,0,0,215,3,0,0,0,0,82,0,0,83,0,0,0,0,4,80,255,0,181,3,0,0,81,255,0,181,3,0,0,0,0,80,0,0,220,3,0,0,81,0,0,220,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,80,255,0,181,3,0,0,81,255,0,181,3,0,0,0,0,80,0,0,220,3,0,0,81,0,0,220,3,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,184,3,0,0,81,0,0,184,3,0,0,0,0,82,0,0,83,0,0,0,0,4,4,105,80,0,0,213,3,0,0,81,0,0,213,3,0,0,0,0,82,0,0,83,0,0,0,0,4,80,0,0,135,3,0,0,81,0,0,135,3,0,0,0,0,80,0,0,187,3,0,0,81,0,0,187,3,0,0,0,0,82,0,0,83,0,0,0,0,4,80,255,0,159,3,0,0,81,255,0,159,3,0,0,0,0,80,0,0,147,3,0,0,81,0,0,147,3,0,0,0,0,80,0,0,200,3,0,0,81,0,0,200,3,0,0,0,0,82,0,0,83,0,0,0,0,4,48,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,4,11,11,11,11,8,8,8,8,8,8,8,254,11,11,11,11,8,8,8,8,8,8,8,254,19,38,20,20,40,254,10,40,254,8,38,19,40,254,9,37,19,40,254,10,40,254,11,39,254,9,40,254,11,11,11,11,11,8,8,8,8,8,8,8,254,9,11,11,11,11,8,8,8,8,8,8,8,254,11,254,34,34,22,24,254,36,36,24,38,254,23,0,0,1,0,3,23,0,0,2,0,3,23,0,0,3,0,3,106,16,0,0,0,0,0,10,4,105,80,0,0,50,4,0,0,81,0,0,50,4,0,0,0,0,80,0,0,50,4,0,0,81,0,0,50,4,0,0,0,0,82,0,0,83,0,0,0,0,101,0,0,101,0,0,23,154,64,3,0,108,3,64,11,65,254,107,91,49,162,53,1,0,0,16,0,0,0,0,0,10,4,198,109,3,107,91,52,163,1,0,16,0,0,0,0,0,10,4,93,3,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,10,4,27,0,128,13,1,27,1,128,1,0,10,0,105,80,255,0,253,5,0,0,81,255,0,253,5,0,0,0,0,80,0,0,6,6,0,0,81,0,0,6,6,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,41,50,0,86,0,0,87,0,0,0,0,80,0,0,16,6,0,0,81,0,0,16,6,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,3,6,0,0,81,255,0,3,6,0,0,0,0,80,0,0,41,6,0,0,81,0,0,41,6,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,4,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,104,0,0,0,0,103,49,162,53,1,0,0,110,198,105,80,255,0,36,6,0,0,81,255,0,36,6,0,0,0,0,80,0,0,24,6,0,0,81,0,0,24,6,0,0,0,0,80,0,0,44,6,0,0,81,0,0,44,6,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,43,142,0,42,143,0,23,90,64,4,0,23,144,64,1,0,42,123,3,109,3,0,64,9,65,39,254,8,38,254,23,23,23,23,23,23,23,23,23,254,11,11,11,11,11,11,11,254,10,10,10,10,10,10,10,10,10,10,10,254,20,19,18,39,254,20,11,254,10,10,10,10,10,10,10,10,10,254,93,0,123,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,93,2,123,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,93,1,123,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,10,6,3] as const;

export const STATS = { ops: 321, bytes: 2013, labels: 48, unknownOps: 0, unresolvedSymbols: 34 } as const;
