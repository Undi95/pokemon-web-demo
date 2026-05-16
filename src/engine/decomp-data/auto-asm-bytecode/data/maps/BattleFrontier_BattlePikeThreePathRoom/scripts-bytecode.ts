// AUTO-GENERATED from data/maps/BattleFrontier_BattlePikeThreePathRoom/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=188, bytes=1491, labels=36, unknownOps=0, unresolvedSymbols=39

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "BattleFrontier_BattlePikeThreePathRoom_MapScripts": 0,
  "BattleFrontier_BattlePikeThreePathRoom_OnFrame": 15,
  "BattleFrontier_BattlePikeThreePathRoom_OnWarp": 55,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_TurnPlayerNorth": 63,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GetChallengeStatus": 73,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_WarpToLobby": 83,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_ResumeChallenge": 108,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_Attendant": 224,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom1": 468,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom3": 484,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom5": 500,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom7": 516,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom9": 532,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom11": 548,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AttendantRoom13": 564,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AskContinueChallenge": 580,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_PauseChallenge": 659,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AskSaveChallenge": 708,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AskRetireChallenge": 819,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_SetHintRoom": 870,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_SetPikeQueenHint": 907,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GivePikeQueenHint": 913,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_HintGiver": 977,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_DeclineHint": 1121,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_AcceptHint": 1131,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GiveLeftRoomHint": 1242,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GiveCenterRoomHint": 1255,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GiveRightRoomHint": 1268,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GiveHint": 1281,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_HintNostalgia": 1424,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_HintWhispering": 1434,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_HintPokemon": 1444,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_HintPeople": 1454,
  "BattleFrontier_BattlePikeThreePathRoom_EventScript_GiveBrainHint": 1464,
  "BattleFrontier_BattlePikeThreePathRoom_Movement_HintGiverApproachPlayer": 1476,
  "BattleFrontier_BattlePikeThreePathRoom_Movement_HintGiverReturnToPos": 1483,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [5,0,0,0,0,2,15,0,0,0,4,55,0,0,0,0,0,0,0,73,0,0,0,0,0,1,0,83,0,0,0,0,0,2,0,108,0,0,0,0,0,0,0,102,3,0,0,0,0,1,0,145,3,0,0,0,0,0,0,63,0,0,0,23,0,0,1,0,92,255,0,2,3,23,4,128,0,0,38,0,0,58,3,58,0,0,255,255,255,255,255,5,255,255,255,255,255,5,0,6,0,5,6,0,0,0,58,3,106,104,0,0,0,0,103,23,4,128,8,0,23,5,128,1,0,38,0,0,58,48,55,0,49,23,4,128,2,0,23,5,128,3,0,26,6,128,0,0,23,6,128,0,0,38,0,0,58,23,0,0,255,0,38,0,0,58,23,4,128,3,0,23,5,128,3,0,38,0,0,58,16,0,0,0,0,0,10,4,105,108,23,4,128,5,0,38,0,0,58,23,4,128,2,0,23,5,128,0,0,26,6,128,99,0,23,6,128,99,0,38,0,0,58,3,23,4,128,1,0,23,5,128,2,0,38,0,0,58,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,212,1,0,0,34,212,1,0,0,7,1,0,0,0,0,7,1,212,1,0,0,35,0,128,3,0,34,0,128,3,0,35,228,1,0,0,34,228,1,0,0,7,1,0,0,0,0,7,1,228,1,0,0,35,0,128,5,0,34,0,128,5,0,35,244,1,0,0,34,244,1,0,0,7,1,0,0,0,0,7,1,244,1,0,0,35,0,128,7,0,34,0,128,7,0,35,4,2,0,0,34,4,2,0,0,7,1,0,0,0,0,7,1,4,2,0,0,35,0,128,9,0,34,0,128,9,0,35,20,2,0,0,34,20,2,0,0,7,1,0,0,0,0,7,1,20,2,0,0,35,0,128,11,0,34,0,128,11,0,35,36,2,0,0,34,36,2,0,0,7,1,0,0,0,0,7,1,36,2,0,0,35,0,128,13,0,34,0,128,13,0,35,52,2,0,0,34,52,2,0,0,7,1,0,0,0,0,7,1,52,2,0,0,3,107,91,16,0,0,0,0,0,10,4,6,68,2,0,0,3,107,91,16,0,0,0,0,0,10,4,6,68,2,0,0,3,107,91,16,0,0,0,0,0,10,4,6,68,2,0,0,3,107,91,16,0,0,0,0,0,10,4,6,68,2,0,0,3,107,91,16,0,0,0,0,0,10,4,6,68,2,0,0,3,107,91,16,0,0,0,0,0,10,4,6,68,2,0,0,3,107,91,16,0,0,0,0,0,10,4,6,68,2,0,0,3,16,0,0,0,0,0,10,5,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,196,2,0,0,34,196,2,0,0,7,1,0,0,0,0,7,1,196,2,0,0,35,0,128,127,0,34,0,128,127,0,35,196,2,0,0,34,196,2,0,0,7,1,0,0,0,0,7,1,196,2,0,0,109,3,23,4,128,6,0,38,0,0,58,104,0,0,0,0,103,38,0,0,58,23,4,128,8,0,23,5,128,2,0,38,0,0,58,48,55,0,49,152,1,23,4,128,4,0,38,0,0,58,3,16,0,0,0,0,0,10,5,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,147,2,0,0,34,147,2,0,0,7,1,0,0,0,0,7,1,147,2,0,0,35,0,128,0,0,34,0,128,0,0,35,51,3,0,0,34,51,3,0,0,7,1,0,0,0,0,7,1,51,3,0,0,35,0,128,127,0,34,0,128,127,0,35,51,3,0,0,34,51,3,0,0,7,1,0,0,0,0,7,1,51,3,0,0,109,3,104,0,0,0,0,103,113,20,8,94,1,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,0,0,0,0,34,0,0,0,0,7,1,0,0,0,0,7,1,0,0,0,0,109,3,23,4,128,17,0,38,0,0,58,35,13,128,1,0,34,13,128,1,0,7,1,139,3,0,0,7,1,13,128,0,0,23,0,0,255,0,3,23,0,0,1,0,3,80,0,0,196,5,0,0,81,0,0,196,5,0,0,0,0,82,0,0,83,0,0,0,0,106,16,0,0,0,0,0,10,4,108,80,0,0,203,5,0,0,81,0,0,203,5,0,0,0,0,82,0,0,83,0,0,0,0,23,0,0,255,0,3,23,4,128,19,0,38,0,0,58,35,13,128,4,0,34,13,128,4,0,7,1,184,5,0,0,7,1,13,128,0,0,107,91,16,0,0,0,0,0,10,5,26,0,128,13,128,35,0,128,1,0,34,0,128,1,0,35,107,4,0,0,34,107,4,0,0,7,1,0,0,0,0,7,1,107,4,0,0,35,0,128,0,0,34,0,128,0,0,35,97,4,0,0,34,97,4,0,0,7,1,0,0,0,0,7,1,97,4,0,0,35,0,128,127,0,34,0,128,127,0,35,97,4,0,0,34,97,4,0,0,7,1,0,0,0,0,7,1,97,4,0,0,109,3,16,0,0,0,0,0,10,4,109,3,23,4,128,18,0,38,0,0,58,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,218,4,0,0,34,218,4,0,0,7,1,0,0,0,0,7,1,218,4,0,0,35,0,128,1,0,34,0,128,1,0,35,231,4,0,0,34,231,4,0,0,7,1,0,0,0,0,7,1,231,4,0,0,35,0,128,2,0,34,0,128,2,0,35,244,4,0,0,34,244,4,0,0,7,1,0,0,0,0,7,1,244,4,0,0,3,16,0,0,0,0,0,10,4,6,1,5,0,0,16,0,0,0,0,0,10,4,6,1,5,0,0,16,0,0,0,0,0,10,4,6,1,5,0,0,23,4,128,19,0,38,0,0,58,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,144,5,0,0,34,144,5,0,0,7,1,0,0,0,0,7,1,144,5,0,0,35,0,128,1,0,34,0,128,1,0,35,154,5,0,0,34,154,5,0,0,7,1,0,0,0,0,7,1,154,5,0,0,35,0,128,2,0,34,0,128,2,0,35,164,5,0,0,34,164,5,0,0,7,1,0,0,0,0,7,1,164,5,0,0,35,0,128,3,0,34,0,128,3,0,35,174,5,0,0,34,174,5,0,0,7,1,0,0,0,0,7,1,174,5,0,0,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,16,0,0,0,0,0,10,4,109,3,107,91,16,0,0,0,0,0,10,4,109,3,10,10,8,8,8,8,254,9,9,9,9,11,11,0,254] as const;

export const STATS = { ops: 188, bytes: 1491, labels: 36, unknownOps: 0, unresolvedSymbols: 39 } as const;
