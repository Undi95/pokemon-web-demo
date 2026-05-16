// AUTO-GENERATED from data/maps/TrainerHill_Entrance/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-05-16
// Stats: ops=176, bytes=1234, labels=42, unknownOps=0, unresolvedSymbols=41

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "TrainerHill_Entrance_MapScripts": 0,
  "TrainerHill_Entrance_OnTransition": 25,
  "TrainerHill_Entrance_OnWarp": 34,
  "TrainerHill_Entrance_OnResume": 35,
  "TrainerHill_Entrance_EventScript_TryFaceAttendant": 101,
  "TrainerHill_Entrance_EventScript_PlayerDontFaceAttendant": 148,
  "TrainerHill_Entrance_OnReturn": 149,
  "TrainerHill_Entrance_OnLoad": 182,
  "TrainerHill_Entrance_EventScript_OpenCounterDoor": 205,
  "TrainerHill_Entrance_OnFrame": 215,
  "TrainerHill_Entrance_EventScript_ExitElevator": 247,
  "TrainerHill_Entrance_EventScript_ExitChallenge": 295,
  "TrainerHill_Entrance_EventScript_ExitChallengeLost": 408,
  "TrainerHill_Entrance_EventScript_ExitChallengeECard": 438,
  "TrainerHill_Entrance_EventScript_PlayerExitChallenge": 463,
  "TrainerHill_Entrance_EventScript_EndExitChallenge": 497,
  "TrainerHill_Entrance_EventScript_Nurse": 498,
  "TrainerHill_Entrance_EventScript_Attendant": 513,
  "TrainerHill_Entrance_EventScript_ThanksForPlaying": 558,
  "TrainerHill_Entrance_EventScript_AttendantEnd": 566,
  "TrainerHill_Entrance_EventScript_EntryTrigger": 568,
  "TrainerHill_Entrance_EventScript_AllFloorsUsed": 675,
  "TrainerHill_Entrance_EventScript_AskChallengeTrainers": 683,
  "TrainerHill_Entrance_EventScript_Info": 830,
  "TrainerHill_Entrance_EventScript_ChooseChallenge": 844,
  "TrainerHill_Entrance_EventScript_CancelEntry": 961,
  "TrainerHill_Entrance_EventScript_SaveGame": 1000,
  "TrainerHill_Entrance_EventScript_SaveFailed": 1056,
  "TrainerHill_Entrance_EventScript_Closed": 1070,
  "TrainerHill_Entrance_Movement_PlayerFaceAttendant": 1105,
  "TrainerHill_Entrance_Movement_PushPlayerBackFromCounter": 1107,
  "TrainerHill_Entrance_Movement_FaceUp": 1109,
  "TrainerHill_Entrance_Movement_PlayerExitElevator": 1111,
  "TrainerHill_Entrance_EventScript_Records": 1114,
  "TrainerHill_Entrance_EventScript_Man": 1123,
  "TrainerHill_Entrance_EventScript_ManTrainerHillClosed": 1141,
  "TrainerHill_Entrance_EventScript_Girl": 1150,
  "TrainerHill_Entrance_EventScript_GirlTrainerHillClosed": 1168,
  "TrainerHill_Entrance_EventScript_Clerk": 1177,
  "TrainerHill_Entrance_Pokemart_Basic": 1211,
  "TrainerHill_Entrance_EventScript_ExpandedPokemart": 1215,
  "TrainerHill_Entrance_Pokemart_Expanded": 1230,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [5,35,0,0,0,7,149,0,0,0,3,25,0,0,0,1,182,0,0,0,2,215,0,0,0,42,0,0,67,0,0,13,128,90,90,113,4,4,0,38,0,0,0,113,0,0,0,113,4,9,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,101,0,0,0,7,1,13,128,0,0,88,255,0,9,0,6,0,80,255,0,81,4,0,0,81,255,0,81,4,0,0,0,0,90,113,4,16,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,148,0,0,0,7,1,13,128,0,0,80,255,0,81,4,0,0,81,255,0,81,4,0,0,0,0,90,90,86,0,0,87,0,0,0,0,86,0,0,87,0,0,0,0,86,0,0,87,0,0,0,0,86,0,0,87,0,0,0,0,90,35,0,0,17,0,34,0,0,17,0,8,1,205,0,0,0,8,1,0,0,0,0,90,163,17,0,10,0,7,3,0,0,15,0,0,0,0,39,1,0,0,0,0,17,0,247,0,0,0,0,0,1,0,56,2,0,0,0,0,1,0,0,0,0,0,106,80,255,0,87,4,0,0,81,255,0,87,4,0,0,0,0,82,0,0,83,0,0,0,0,163,17,0,10,0,52,3,1,0,38,0,0,0,9,36,0,49,113,0,0,0,108,90,113,0,1,0,113,4,6,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,152,1,0,0,34,152,1,0,0,7,1,0,0,0,0,7,1,152,1,0,0,35,0,128,1,0,34,0,128,1,0,35,182,1,0,0,34,182,1,0,0,7,1,0,0,0,0,7,1,182,1,0,0,35,0,128,2,0,34,0,128,2,0,35,241,1,0,0,34,241,1,0,0,7,1,0,0,0,0,7,1,241,1,0,0,106,80,255,0,81,4,0,0,81,255,0,81,4,0,0,0,0,16,0,0,0,0,0,10,4,89,207,1,0,0,106,80,255,0,81,4,0,0,81,255,0,81,4,0,0,0,0,16,0,0,0,0,0,10,4,105,80,255,0,83,4,0,0,81,255,0,83,4,0,0,0,0,82,0,0,83,0,0,0,0,113,214,0,0,38,0,0,0,108,90,113,11,0,0,88,0,0,0,0,0,0,0,110,109,90,107,91,113,4,10,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,46,2,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,89,54,2,0,0,16,0,0,0,0,0,10,4,109,90,106,80,255,0,81,4,0,0,81,255,0,81,4,0,0,0,0,44,0,0,7,0,46,4,0,0,16,0,0,0,0,0,10,4,113,4,13,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,8,1,232,3,0,0,8,1,13,128,0,0,113,4,8,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,7,1,163,2,0,0,7,1,13,128,0,0,16,0,0,0,0,0,10,4,89,171,2,0,0,16,0,0,0,0,0,10,4,104,0,0,0,0,0,0,0,112,15,6,17,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,76,3,0,0,34,76,3,0,0,7,1,0,0,0,0,7,1,76,3,0,0,35,0,128,1,0,34,0,128,1,0,35,193,3,0,0,34,193,3,0,0,7,1,0,0,0,0,7,1,193,3,0,0,35,0,128,2,0,34,0,128,2,0,35,62,3,0,0,34,62,3,0,0,7,1,0,0,0,0,7,1,62,3,0,0,35,0,128,127,0,34,0,128,127,0,35,193,3,0,0,34,193,3,0,0,7,1,0,0,0,0,7,1,193,3,0,0,90,16,0,0,0,0,0,10,4,89,171,2,0,0,90,112,13,2,113,0,26,0,128,13,128,35,0,128,4,0,34,0,128,4,0,35,193,3,0,0,34,193,3,0,0,7,1,0,0,0,0,7,1,193,3,0,0,35,0,128,127,0,34,0,128,127,0,35,193,3,0,0,34,193,3,0,0,7,1,0,0,0,0,7,1,193,3,0,0,113,4,17,0,26,5,128,13,128,38,0,0,0,113,214,1,0,113,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,113,4,0,0,38,0,0,0,108,90,113,0,0,0,16,0,0,0,0,0,10,4,105,80,255,0,83,4,0,0,81,255,0,83,4,0,0,0,0,82,0,0,83,0,0,0,0,108,90,16,0,0,0,0,0,10,4,113,4,14,0,38,0,0,0,113,0,1,0,88,0,0,0,0,35,13,128,0,0,34,13,128,0,0,7,1,32,4,0,0,7,1,13,128,0,0,113,4,14,0,38,0,0,0,15,113,4,15,0,38,0,0,0,89,193,3,0,0,90,16,0,0,0,0,0,10,4,105,80,255,0,83,4,0,0,81,255,0,83,4,0,0,0,0,82,0,0,83,0,0,0,0,108,90,3,254,8,254,1,254,8,8,254,106,152,1,38,0,0,0,108,90,44,0,0,7,0,117,4,0,0,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,44,0,0,7,0,144,4,0,0,16,0,0,0,0,0,10,2,90,16,0,0,0,0,0,10,2,90,107,91,104,0,0,0,0,0,0,0,44,0,0,7,1,191,4,0,0,135,187,4,0,0,16,0,0,0,0,0,10,4,109,90,0,0,109,90,135,206,4,0,0,16,0,0,0,0,0,10,4,109,90,0,0,109,90] as const;

export const STATS = { ops: 176, bytes: 1234, labels: 42, unknownOps: 0, unresolvedSymbols: 41 } as const;
