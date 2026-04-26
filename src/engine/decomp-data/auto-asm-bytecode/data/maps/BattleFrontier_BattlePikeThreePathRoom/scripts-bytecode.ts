// AUTO-GENERATED from data/maps/BattleFrontier_BattlePikeThreePathRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=188, bytes=1470, labels=36, unknownOps=0, unresolvedSymbols=45

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattlePikeThreePathRoom_MapScripts": 0,
  "BattleFrontier_BattlePikeThreePathRoom_OnFrame": 15,
  "BattleFrontier_BattlePikeThreePathRoom_OnWarp": 55,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_TurnPlayerNorth": 63,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GetChallengeStatus": 72,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_WarpToLobby": 81,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_ResumeChallenge": 106,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_Attendant": 212,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom1": 454,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom3": 470,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom5": 486,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom7": 502,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom9": 518,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom11": 534,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom13": 550,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AskContinueChallenge": 566,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_PauseChallenge": 645,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AskSaveChallenge": 692,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AskRetireChallenge": 803,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_SetHintRoom": 856,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_SetPikeQueenHint": 891,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GivePikeQueenHint": 896,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_HintGiver": 959,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_DeclineHint": 1102,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AcceptHint": 1112,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GiveLeftRoomHint": 1222,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GiveCenterRoomHint": 1235,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GiveRightRoomHint": 1248,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GiveHint": 1261,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_HintNostalgia": 1403,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_HintWhispering": 1413,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_HintPokemon": 1423,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_HintPeople": 1433,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GiveBrainHint": 1443,
  "BattleFrontier_BattlePikeThreePathRoom_Movement_HintGiverApproachPlayer": 1455,
  "BattleFrontier_BattlePikeThreePathRoom_Movement_HintGiverReturnToPos": 1462,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [5,0,0,0,0,2,15,0,0,0,4,55,0,0,0,0,0,0,0,72,0,0,0,0,0,1,0,81,0,0,0,0,0,2,0,106,0,0,0,0,0,0,0,88,3,0,0,0,0,1,0,128,3,0,0,0,0,0,0,63,0,0,0,113,0,1,0,92,255,0,2,90,113,4,0,0,38,0,0,0,90,58,0,0,255,255,255,255,255,5,255,255,255,255,255,5,0,6,0,5,6,0,0,0,0,90,106,104,0,0,0,0,0,0,0,113,4,8,0,113,5,1,0,38,0,0,0,9,55,0,49,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,16,0,0,0,0,0,10,0,105,108,113,4,5,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,99,0,113,6,99,0,38,0,0,0,90,113,4,1,0,113,5,2,0,38,0,0,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,198,1,0,0,34,198,1,0,0,7,1,0,0,0,0,7,1,198,1,0,0,35,0,128,3,0,34,0,128,3,0,35,214,1,0,0,34,214,1,0,0,7,1,0,0,0,0,7,1,214,1,0,0,35,0,128,5,0,34,0,128,5,0,35,230,1,0,0,34,230,1,0,0,7,1,0,0,0,0,7,1,230,1,0,0,35,0,128,7,0,34,0,128,7,0,35,246,1,0,0,34,246,1,0,0,7,1,0,0,0,0,7,1,246,1,0,0,35,0,128,9,0,34,0,128,9,0,35,6,2,0,0,34,6,2,0,0,7,1,0,0,0,0,7,1,6,2,0,0,35,0,128,11,0,34,0,128,11,0,35,22,2,0,0,34,22,2,0,0,7,1,0,0,0,0,7,1,22,2,0,0,35,0,128,13,0,34,0,128,13,0,35,38,2,0,0,34,38,2,0,0,7,1,0,0,0,0,7,1,38,2,0,0,90,107,91,16,0,0,0,0,0,10,0,89,54,2,0,0,90,107,91,16,0,0,0,0,0,10,0,89,54,2,0,0,90,107,91,16,0,0,0,0,0,10,0,89,54,2,0,0,90,107,91,16,0,0,0,0,0,10,0,89,54,2,0,0,90,107,91,16,0,0,0,0,0,10,0,89,54,2,0,0,90,107,91,16,0,0,0,0,0,10,0,89,54,2,0,0,90,107,91,16,0,0,0,0,0,10,0,89,54,2,0,0,90,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,180,2,0,0,34,180,2,0,0,7,1,0,0,0,0,7,1,180,2,0,0,35,0,128,127,0,34,0,128,127,0,35,180,2,0,0,34,180,2,0,0,7,1,0,0,0,0,7,1,180,2,0,0,109,90,113,4,6,0,38,0,0,0,104,0,0,0,0,0,0,0,38,0,0,0,113,4,8,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,133,2,0,0,34,133,2,0,0,7,1,0,0,0,0,7,1,133,2,0,0,35,0,128,0,0,34,0,128,0,0,35,35,3,0,0,34,35,3,0,0,7,1,0,0,0,0,7,1,35,3,0,0,35,0,128,127,0,34,0,128,127,0,35,35,3,0,0,34,35,3,0,0,7,1,0,0,0,0,7,1,35,3,0,0,109,90,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,0,0,0,0,34,0,0,0,0,7,1,0,0,0,0,7,1,0,0,0,0,109,90,113,4,17,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,123,3,0,0,7,1,13,128,0,0,113,0,255,0,90,113,0,1,0,90,80,0,0,175,5,0,0,81,0,0,175,5,0,0,0,0,82,0,0,83,0,0,0,0,106,16,0,0,0,0,0,10,0,108,80,0,0,182,5,0,0,81,0,0,182,5,0,0,0,0,82,0,0,83,0,0,0,0,113,0,255,0,90,113,4,19,0,38,0,0,0,35,13,128,4,0,34,13,128,4,0,7,1,163,5,0,0,7,1,13,128,0,0,107,91,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,88,4,0,0,34,88,4,0,0,7,1,0,0,0,0,7,1,88,4,0,0,35,0,128,0,0,34,0,128,0,0,35,78,4,0,0,34,78,4,0,0,7,1,0,0,0,0,7,1,78,4,0,0,35,0,128,127,0,34,0,128,127,0,35,78,4,0,0,34,78,4,0,0,7,1,0,0,0,0,7,1,78,4,0,0,109,90,16,0,0,0,0,0,10,0,109,90,113,4,18,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,198,4,0,0,34,198,4,0,0,7,1,0,0,0,0,7,1,198,4,0,0,35,0,128,1,0,34,0,128,1,0,35,211,4,0,0,34,211,4,0,0,7,1,0,0,0,0,7,1,211,4,0,0,35,0,128,2,0,34,0,128,2,0,35,224,4,0,0,34,224,4,0,0,7,1,0,0,0,0,7,1,224,4,0,0,90,16,0,0,0,0,0,10,0,89,237,4,0,0,16,0,0,0,0,0,10,0,89,237,4,0,0,16,0,0,0,0,0,10,0,89,237,4,0,0,113,4,19,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,123,5,0,0,34,123,5,0,0,7,1,0,0,0,0,7,1,123,5,0,0,35,0,128,1,0,34,0,128,1,0,35,133,5,0,0,34,133,5,0,0,7,1,0,0,0,0,7,1,133,5,0,0,35,0,128,2,0,34,0,128,2,0,35,143,5,0,0,34,143,5,0,0,7,1,0,0,0,0,7,1,143,5,0,0,35,0,128,3,0,34,0,128,3,0,35,153,5,0,0,34,153,5,0,0,7,1,0,0,0,0,7,1,153,5,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,16,0,0,0,0,0,10,0,109,90,10,10,8,8,8,8,254,9,9,9,9,11,11,0,254] as const;

export const STATS = { ops: 188, bytes: 1470, labels: 36, unknownOps: 0, unresolvedSymbols: 45 } as const;
