// AUTO-GENERATED from data/maps/BattleFrontier_BattlePikeThreePathRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=188, bytes=660, labels=36, unknownOps=10, unresolvedSymbols=42

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
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom1": 225,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom3": 241,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom5": 257,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom7": 273,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom9": 289,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom11": 305,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom13": 321,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AskContinueChallenge": 337,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_PauseChallenge": 347,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AskSaveChallenge": 394,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AskRetireChallenge": 404,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_SetHintRoom": 420,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_SetPikeQueenHint": 443,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GivePikeQueenHint": 448,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_HintGiver": 511,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_DeclineHint": 541,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AcceptHint": 551,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GiveLeftRoomHint": 560,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GiveCenterRoomHint": 573,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GiveRightRoomHint": 586,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GiveHint": 599,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_HintNostalgia": 608,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_HintWhispering": 618,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_HintPokemon": 628,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_HintPeople": 638,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GiveBrainHint": 648,
  "BattleFrontier_BattlePikeThreePathRoom_Movement_HintGiverApproachPlayer": 660,
  "BattleFrontier_BattlePikeThreePathRoom_Movement_HintGiverReturnToPos": 660,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [5,0,0,0,0,2,15,0,0,0,4,55,0,0,0,0,0,0,0,72,0,0,0,0,0,1,0,81,0,0,0,0,0,2,0,106,0,0,0,0,0,0,0,164,1,0,0,0,0,1,0,192,1,0,0,0,0,0,0,63,0,0,0,113,0,1,0,92,255,0,2,90,113,4,0,0,38,0,0,0,90,58,0,0,255,255,255,255,255,5,255,255,255,255,255,5,0,6,0,5,6,0,0,0,0,90,106,104,0,0,0,0,0,0,0,113,4,8,0,113,5,1,0,38,0,0,0,9,55,0,49,113,4,2,0,113,5,3,0,26,6,128,0,0,113,6,0,0,38,0,0,0,113,0,255,0,38,0,0,0,113,4,3,0,113,5,3,0,38,0,0,0,16,0,0,0,0,0,10,0,105,108,113,4,5,0,38,0,0,0,113,4,2,0,113,5,0,0,26,6,128,99,0,113,6,99,0,38,0,0,0,90,113,4,1,0,113,5,2,0,38,0,0,0,90,107,91,16,0,0,0,0,0,10,0,89,81,1,0,0,90,107,91,16,0,0,0,0,0,10,0,89,81,1,0,0,90,107,91,16,0,0,0,0,0,10,0,89,81,1,0,0,90,107,91,16,0,0,0,0,0,10,0,89,81,1,0,0,90,107,91,16,0,0,0,0,0,10,0,89,81,1,0,0,90,107,91,16,0,0,0,0,0,10,0,89,81,1,0,0,90,107,91,16,0,0,0,0,0,10,0,89,81,1,0,0,90,16,0,0,0,0,0,10,0,109,90,113,4,6,0,38,0,0,0,104,0,0,0,0,0,0,0,38,0,0,0,113,4,8,0,113,5,2,0,38,0,0,0,9,55,0,49,152,1,113,4,4,0,38,0,0,0,90,16,0,0,0,0,0,10,0,109,90,104,0,0,0,0,0,0,0,113,20,8,94,1,0,109,90,113,4,17,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,113,0,255,0,90,113,0,1,0,90,80,0,0,148,2,0,0,81,0,0,148,2,0,0,0,0,82,0,0,83,0,0,0,0,106,16,0,0,0,0,0,10,0,108,80,0,0,148,2,0,0,81,0,0,148,2,0,0,0,0,82,0,0,83,0,0,0,0,113,0,255,0,90,113,4,19,0,38,0,0,0,35,13,128,4,0,34,13,128,4,0,107,91,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,113,4,18,0,38,0,0,0,90,16,0,0,0,0,0,10,0,89,87,2,0,0,16,0,0,0,0,0,10,0,89,87,2,0,0,16,0,0,0,0,0,10,0,89,87,2,0,0,113,4,19,0,38,0,0,0,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,16,0,0,0,0,0,10,0,109,90,107,91,16,0,0,0,0,0,10,0,109,90] as const;

export const STATS = { ops: 188, bytes: 660, labels: 36, unknownOps: 10, unresolvedSymbols: 42 } as const;
