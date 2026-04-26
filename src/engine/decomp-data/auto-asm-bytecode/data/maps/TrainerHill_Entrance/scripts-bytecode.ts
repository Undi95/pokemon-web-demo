// AUTO-GENERATED from data/maps/TrainerHill_Entrance/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=176, bytes=836, labels=42, unknownOps=9, unresolvedSymbols=43

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "TrainerHill_Entrance_MapScripts": 0,
  "TrainerHill_Entrance_OnTransition": 25,
  "TrainerHill_Entrance_OnWarp": 34,
  "TrainerHill_Entrance_OnResume": 35,
  "TrainerHill_Entrance_EventScript_TryFaceAttendant": 89,
  "TrainerHill_Entrance_EventScript_PlayerDontFaceAttendant": 124,
  "TrainerHill_Entrance_OnReturn": 125,
  "TrainerHill_Entrance_OnLoad": 158,
  "TrainerHill_Entrance_EventScript_OpenCounterDoor": 169,
  "TrainerHill_Entrance_OnFrame": 178,
  "TrainerHill_Entrance_EventScript_ExitElevator": 210,
  "TrainerHill_Entrance_EventScript_ExitChallenge": 258,
  "TrainerHill_Entrance_EventScript_ExitChallengeLost": 270,
  "TrainerHill_Entrance_EventScript_ExitChallengeECard": 300,
  "TrainerHill_Entrance_EventScript_PlayerExitChallenge": 325,
  "TrainerHill_Entrance_EventScript_EndExitChallenge": 359,
  "TrainerHill_Entrance_EventScript_Nurse": 360,
  "TrainerHill_Entrance_EventScript_Attendant": 375,
  "TrainerHill_Entrance_EventScript_ThanksForPlaying": 408,
  "TrainerHill_Entrance_EventScript_AttendantEnd": 416,
  "TrainerHill_Entrance_EventScript_EntryTrigger": 418,
  "TrainerHill_Entrance_EventScript_AllFloorsUsed": 501,
  "TrainerHill_Entrance_EventScript_AskChallengeTrainers": 509,
  "TrainerHill_Entrance_EventScript_Info": 523,
  "TrainerHill_Entrance_EventScript_ChooseChallenge": 537,
  "TrainerHill_Entrance_EventScript_CancelEntry": 585,
  "TrainerHill_Entrance_EventScript_SaveGame": 624,
  "TrainerHill_Entrance_EventScript_SaveFailed": 667,
  "TrainerHill_Entrance_EventScript_Closed": 681,
  "TrainerHill_Entrance_Movement_PlayerFaceAttendant": 716,
  "TrainerHill_Entrance_Movement_PushPlayerBackFromCounter": 716,
  "TrainerHill_Entrance_Movement_FaceUp": 716,
  "TrainerHill_Entrance_Movement_PlayerExitElevator": 716,
  "TrainerHill_Entrance_EventScript_Records": 716,
  "TrainerHill_Entrance_EventScript_Man": 725,
  "TrainerHill_Entrance_EventScript_ManTrainerHillClosed": 743,
  "TrainerHill_Entrance_EventScript_Girl": 752,
  "TrainerHill_Entrance_EventScript_GirlTrainerHillClosed": 770,
  "TrainerHill_Entrance_EventScript_Clerk": 779,
  "TrainerHill_Entrance_Pokemart_Basic": 813,
  "TrainerHill_Entrance_EventScript_ExpandedPokemart": 817,
  "TrainerHill_Entrance_Pokemart_Expanded": 832,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [5,35,0,0,0,7,125,0,0,0,3,25,0,0,0,1,158,0,0,0,2,178,0,0,0,42,0,0,67,0,0,13,128,90,90,113,4,4,0,38,0,0,0,113,0,0,0,113,4,9,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,88,255,0,9,0,6,0,80,255,0,204,2,0,0,81,255,0,204,2,0,0,0,0,90,113,4,16,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,80,255,0,204,2,0,0,81,255,0,204,2,0,0,0,0,90,90,86,0,0,87,0,0,0,0,86,0,0,87,0,0,0,0,86,0,0,87,0,0,0,0,86,0,0,87,0,0,0,0,90,35,0,0,17,0,34,0,0,17,0,90,163,17,0,10,0,7,3,0,0,0,0,0,0,2,1,0,0,0,0,17,0,210,0,0,0,0,0,1,0,162,1,0,0,0,0,1,0,0,0,0,0,106,80,255,0,204,2,0,0,81,255,0,204,2,0,0,0,0,82,0,0,83,0,0,0,0,163,17,0,10,0,52,3,1,0,38,0,0,0,9,36,0,49,113,0,0,0,108,90,113,0,1,0,113,4,6,0,38,0,0,0,106,80,255,0,204,2,0,0,81,255,0,204,2,0,0,0,0,16,0,0,0,0,0,10,0,89,69,1,0,0,106,80,255,0,204,2,0,0,81,255,0,204,2,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,204,2,0,0,81,255,0,204,2,0,0,0,0,82,0,0,83,0,0,0,0,113,214,0,0,38,0,0,0,108,90,113,11,0,0,88,0,0,0,0,0,0,0,110,109,90,107,91,113,4,10,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,89,160,1,0,0,16,0,0,0,0,0,10,0,109,90,106,80,255,0,204,2,0,0,81,255,0,204,2,0,0,0,0,44,0,0,7,0,169,2,0,0,16,0,0,0,0,0,10,0,113,4,13,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,113,4,8,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,16,0,0,0,0,0,10,0,89,253,1,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,112,15,6,17,0,90,16,0,0,0,0,0,10,0,89,253,1,0,0,90,112,13,2,113,0,113,4,17,0,26,5,128,13,128,38,0,0,0,113,214,1,0,113,0,0,0,38,0,0,0,16,0,0,0,0,0,10,0,113,4,0,0,38,0,0,0,108,90,113,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,204,2,0,0,81,255,0,204,2,0,0,0,0,82,0,0,83,0,0,0,0,108,90,16,0,0,0,0,0,10,0,113,4,14,0,38,0,0,0,113,0,1,0,88,0,0,0,0,35,13,128,0,0,34,13,128,0,0,113,4,14,0,38,0,0,0,113,4,15,0,38,0,0,0,89,73,2,0,0,90,16,0,0,0,0,0,10,0,105,80,255,0,204,2,0,0,81,255,0,204,2,0,0,0,0,82,0,0,83,0,0,0,0,108,90,106,152,1,38,0,0,0,108,90,44,0,0,7,0,231,2,0,0,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,44,0,0,7,0,2,3,0,0,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,104,0,0,0,0,0,0,0,44,0,0,7,1,49,3,0,0,135,45,3,0,0,16,0,0,0,0,0,10,0,109,90,0,0,109,90,135,64,3,0,0,16,0,0,0,0,0,10,0,109,90,0,0,109,90] as const;

export const STATS = { ops: 176, bytes: 836, labels: 42, unknownOps: 9, unresolvedSymbols: 43 } as const;
