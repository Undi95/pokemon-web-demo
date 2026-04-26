// AUTO-GENERATED from data/maps/RusturfTunnel/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=321, bytes=1702, labels=48, unknownOps=23, unresolvedSymbols=38

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "RusturfTunnel_MapScripts": 0,
  "RusturfTunnel_OnFrame": 10,
  "RusturfTunnel_OnTransition": 26,
  "RusturfTunnel_EventScript_SetAquaGruntAndPeekoPos": 37,
  "RusturfTunnel_EventScript_Wanda": 51,
  "RusturfTunnel_EventScript_WandasBoyfriend": 88,
  "RusturfTunnel_EventScript_AlreadySpokenTo": 137,
  "RusturfTunnel_EventScript_ClearTunnelScene": 172,
  "RusturfTunnel_EventScript_BoyfriendApproachWanda1": 336,
  "RusturfTunnel_EventScript_BoyfriendApproachWanda2": 376,
  "RusturfTunnel_EventScript_BoyfriendApproachWanda3": 440,
  "RusturfTunnel_EventScript_FaceWandasBoyfriend1": 504,
  "RusturfTunnel_EventScript_FaceWandasBoyfriend2": 552,
  "RusturfTunnel_EventScript_FaceWandasBoyfriend3": 576,
  "RusturfTunnel_EventScript_WandasBoyfriendApproachPlayer": 576,
  "RusturfTunnel_EventScript_WandaAndBoyfriendExit1": 601,
  "RusturfTunnel_EventScript_WandaAndBoyfriendExit": 641,
  "RusturfTunnel_EventScript_WandasBoyfriendNotice": 697,
  "RusturfTunnel_Movement_WandaExit1": 748,
  "RusturfTunnel_Movement_WandaExit": 748,
  "RusturfTunnel_Movement_PlayerWatchWandaExit": 748,
  "RusturfTunnel_Movement_Unused1": 748,
  "RusturfTunnel_Movement_Unused2": 748,
  "RusturfTunnel_Movement_Unused3": 748,
  "RusturfTunnel_Movement_PlayerWatchBoyfriend1": 748,
  "RusturfTunnel_Movement_PlayerWatchBoyfriend": 748,
  "RusturfTunnel_Movement_BoyfriendFaceRight": 748,
  "RusturfTunnel_Movement_WandasBoyfriendExit1": 748,
  "RusturfTunnel_Movement_WandasBoyfriendExit": 748,
  "RusturfTunnel_Movement_WandasBoyfriendApproachPlayer": 748,
  "RusturfTunnel_Movement_BoyfriendApproachWanda1": 748,
  "RusturfTunnel_Movement_BoyfriendApproachWanda": 748,
  "RusturfTunnel_EventScript_TunnelBlockagePos1": 748,
  "RusturfTunnel_EventScript_TunnelBlockagePos2": 753,
  "RusturfTunnel_EventScript_TunnelBlockagePos3": 758,
  "RusturfTunnel_EventScript_AquaGruntBackUp": 763,
  "RusturfTunnel_Movement_GruntAndPeekoBackUp": 825,
  "RusturfTunnel_EventScript_Peeko": 825,
  "RusturfTunnel_EventScript_Grunt": 844,
  "RusturfTunnel_Movement_PushPlayerAsideForGrunt": 1279,
  "RusturfTunnel_Movement_PlayerMoveAsideForBriney": 1279,
  "RusturfTunnel_Movement_GruntEscape": 1279,
  "RusturfTunnel_Movement_BrineyApproachPeeko1": 1279,
  "RusturfTunnel_Movement_BrineyExit": 1279,
  "RusturfTunnel_Movement_PlayerWatchBrineyExit": 1279,
  "RusturfTunnel_Movement_BrineyApproachPeeko2": 1279,
  "RusturfTunnel_Movement_PeekoExit": 1279,
  "RusturfTunnel_EventScript_Mike": 1279,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [3,26,0,0,0,2,10,0,0,0,154,64,4,0,172,0,0,0,154,64,5,0,172,0,0,0,35,154,64,2,0,34,154,64,2,0,90,100,0,0,13,0,4,0,100,0,0,13,0,5,0,107,91,16,0,0,0,0,0,10,0,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,107,91,44,0,0,7,1,137,0,0,0,42,0,0,16,0,0,0,0,0,10,0,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,16,0,0,0,0,0,10,0,105,80,15,128,0,0,0,0,81,15,128,0,0,0,0,0,0,82,0,0,83,0,0,0,0,109,90,106,35,0,0,1,0,34,0,0,1,0,35,0,0,2,0,34,0,0,2,0,35,0,0,3,0,34,0,0,3,0,88,185,2,0,0,16,0,0,0,0,0,10,0,35,0,0,2,0,34,0,0,2,0,35,0,0,3,0,34,0,0,3,0,27,0,128,0,0,27,1,128,1,0,10,0,42,106,0,16,0,0,0,0,0,10,0,105,35,0,0,1,0,34,0,0,1,0,35,0,0,2,0,34,0,0,2,0,35,0,0,3,0,34,0,0,3,0,16,0,0,0,0,0,10,0,105,35,0,0,1,0,34,0,0,1,0,35,0,0,2,0,34,0,0,2,0,35,0,0,3,0,34,0,0,3,0,88,0,0,0,0,108,90,80,255,0,236,2,0,0,81,255,0,236,2,0,0,0,0,80,0,0,236,2,0,0,81,0,0,236,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,236,2,0,0,81,255,0,236,2,0,0,0,0,80,0,0,236,2,0,0,81,0,0,236,2,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,236,2,0,0,81,255,0,236,2,0,0,0,0,80,0,0,236,2,0,0,81,0,0,236,2,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,0,0,0,0,81,255,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,236,2,0,0,81,0,0,236,2,0,0,0,0,82,0,0,83,0,0,0,0,105,80,0,0,236,2,0,0,81,0,0,236,2,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,236,2,0,0,81,0,0,236,2,0,0,0,0,80,0,0,236,2,0,0,81,0,0,236,2,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,236,2,0,0,81,255,0,236,2,0,0,0,0,80,0,0,236,2,0,0,81,0,0,236,2,0,0,0,0,80,0,0,236,2,0,0,81,0,0,236,2,0,0,0,0,82,0,0,83,0,0,0,0,9,21,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,113,0,1,0,90,113,0,2,0,90,113,0,3,0,90,106,16,0,0,0,0,0,10,0,105,80,0,0,57,3,0,0,81,0,0,57,3,0,0,0,0,80,0,0,57,3,0,0,81,0,0,57,3,0,0,0,0,82,0,0,83,0,0,0,0,101,0,0,101,0,0,113,154,3,0,108,90,107,91,49,162,53,1,0,0,16,0,0,0,0,0,10,0,198,109,90,107,91,52,163,1,0,16,0,0,0,0,0,10,0,93,3,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,10,0,27,0,128,13,1,27,1,128,1,0,10,0,105,80,255,0,255,4,0,0,81,255,0,255,4,0,0,0,0,80,0,0,255,4,0,0,81,0,0,255,4,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,4,50,86,0,0,87,0,0,0,0,80,0,0,255,4,0,0,81,0,0,255,4,0,0,0,0,82,0,0,83,0,0,0,0,80,255,0,255,4,0,0,81,255,0,255,4,0,0,0,0,80,0,0,255,4,0,0,81,0,0,255,4,0,0,0,0,82,0,0,83,0,0,0,0,16,0,0,0,0,0,10,0,80,0,0,0,0,0,0,81,0,0,0,0,0,0,0,0,82,0,0,83,0,0,0,0,104,0,0,0,0,0,0,0,49,162,53,1,0,0,110,198,105,80,255,0,255,4,0,0,81,255,0,255,4,0,0,0,0,80,0,0,255,4,0,0,81,0,0,255,4,0,0,0,0,80,0,0,255,4,0,0,81,0,0,255,4,0,0,0,0,82,0,0,83,0,0,0,0,84,0,0,85,0,0,0,0,84,0,0,85,0,0,0,0,43,142,0,42,143,0,113,90,4,0,113,144,1,0,42,123,3,109,90,93,0,123,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,93,2,123,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,93,1,123,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,10,0,90] as const;

export const STATS = { ops: 321, bytes: 1702, labels: 48, unknownOps: 23, unresolvedSymbols: 38 } as const;
