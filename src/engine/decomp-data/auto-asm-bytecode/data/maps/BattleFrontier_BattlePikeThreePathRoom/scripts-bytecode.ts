// AUTO-GENERATED from data/maps/BattleFrontier_BattlePikeThreePathRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=188, bytes=1170, labels=36, unknownOps=2, unresolvedSymbols=45

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
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom1": 370,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom3": 386,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom5": 402,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom7": 418,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom9": 434,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom11": 450,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom13": 466,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AskContinueChallenge": 482,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_PauseChallenge": 537,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AskSaveChallenge": 584,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AskRetireChallenge": 659,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_SetHintRoom": 700,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_SetPikeQueenHint": 723,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GivePikeQueenHint": 728,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_HintGiver": 791,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_DeclineHint": 886,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AcceptHint": 896,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GiveLeftRoomHint": 970,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GiveCenterRoomHint": 983,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GiveRightRoomHint": 996,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GiveHint": 1009,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_HintNostalgia": 1103,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_HintWhispering": 1113,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_HintPokemon": 1123,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_HintPeople": 1133,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GiveBrainHint": 1143,
  "BattleFrontier_BattlePikeThreePathRoom_Movement_HintGiverApproachPlayer": 1155,
  "BattleFrontier_BattlePikeThreePathRoom_Movement_HintGiverReturnToPos": 1162,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [5,0,0,0,0,2,15,0,0,0,4,55,0,0,0,0,0,0,0,72,0,0,0,0,0,1,0,81,0,0,0,0,0,2,0,106,0,0,0,0,0,0,0,188,2,0,0,0,0,1,0,216,2,0,0,0,0,0,0,63,0,0,0,113,0,1,0,92,255,0,2,90,113,4,0,0,38,0,0,0,90,58,0,0,255,255,255,255,255,5,255,255,255,255,255,5,0,6,0,5,6,0,0,0,0,90,106,104,0,0,0,0,0,0,0,113,4,8,0,113,5,1,0,38,0,0,0,9,55,0,49,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,16,0,0,0,0,0,10,0,105,108,113,4,5,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,99,0,113,6,99,0,38,0,0,0,90,113,4,1,0,113,5,2,0,38,0,0,0,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,114,1,0,0,34,114,1,0,0,35,0,128,3,0,34,0,128,3,0,35,130,1,0,0,34,130,1,0,0,35,0,128,5,0,34,0,128,5,0,35,146,1,0,0,34,146,1,0,0,35,0,128,7,0,34,0,128,7,0,35,162,1,0,0,34,162,1,0,0,35,0,128,9,0,34,0,128,9,0,35,178,1,0,0,34,178,1,0,0,35,0,128,11,0,34,0,128,11,0,35,194,1,0,0,34,194,1,0,0,35,0,128,13,0,34,0,128,13,0,35,210,1,0,0,34,210,1,0,0,90,107,91,16,0,0,0,0,0,10,0,89,226,1,0,0,90,107,91,16,0,0,0,0,0,10,0,89,226,1,0,0,90,107,91,16,0,0,0,0,0,10,0,89,226,1,0,0,90,107,91,16,0,0,0,0,0,10,0,89,226,1,0,0,90,107,91,16,0,0,0,0,0,10,0,89,226,1,0,0,90,107,91,16,0,0,0,0,0,10,0,89,226,1,0,0,90,107,91,16,0,0,0,0,0,10,0,89,226,1,0,0,90,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,72,2,0,0,34,72,2,0,0,35,0,128,127,0,34,0,128,127,0,35,72,2,0,0,34,72,2,0,0,109,90,113,4,6,0,38,0,0,0,104,0,0,0,0,0,0,0,38,0,0,0,113,4,8,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,25,2,0,0,34,25,2,0,0,35,0,128,0,0,34,0,128,0,0,35,147,2,0,0,34,147,2,0,0,35,0,128,127,0,34,0,128,127,0,35,147,2,0,0,34,147,2,0,0,109,90,104,0,0,0,0,0,0,0,113,20,8,94,1,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,0,0,0,0,34,0,0,0,0,109,90,113,4,17,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,113,0,255,0,90,113,0,1,0,90,80,0,0,131,4,0,0,81,0,0,131,4,0,0,0,0,82,0,0,83,0,0,0,0,106,16,0,0,0,0,0,10,0,108,80,0,0,138,4,0,0,81,0,0,138,4,0,0,0,0,82,0,0,83,0,0,0,0,113,0,255,0,90,113,4,19,0,38,0,0,0,35,13,128,4,0,34,13,128,4,0,107,91,16,0,0,0,0,0,10,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,128,3,0,0,34,128,3,0,0,35,0,128,0,0,34,0,128,0,0,35,118,3,0,0,34,118,3,0,0,35,0,128,127,0,34,0,128,127,0,35,118,3,0,0,34,118,3,0,0,109,90,16,0,0,0,0,0,10,0,109,90,113,4,18,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,202,3,0,0,34,202,3,0,0,35,0,128,1,0,34,0,128,1,0,35,215,3,0,0,34,215,3,0,0,35,0,128,2,0,34,0,128,2,0,35,228,3,0,0,34,228,3,0,0,90,16,0,0,0,0,0,10,0,89,241,3,0,0,16,0,0,0,0,0,10,0,89,241,3,0,0,16,0,0,0,0,0,10,0,89,241,3,0,0,113,4,19,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,79,4,0,0,34,79,4,0,0,35,0,128,1,0,34,0,128,1,0,35,89,4,0,0,34,89,4,0,0,35,0,128,2,0,34,0,128,2,0,35,99,4,0,0,34,99,4,0,0,35,0,128,3,0,34,0,128,3,0,35,109,4,0,0,34,109,4,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,16,0,0,0,0,0,10,0,109,90,10,10,8,8,8,8,254,9,9,9,9,11,11,0,254] as const;

export const STATS = { ops: 188, bytes: 1170, labels: 36, unknownOps: 2, unresolvedSymbols: 45 } as const;
