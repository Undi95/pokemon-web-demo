// AUTO-GENERATED from data/maps/TrainerHill_Entrance/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-04-26
// Stats: ops=176, bytes=1042, labels=42, unknownOps=2, unresolvedSymbols=43

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
  "TrainerHill_Entrance_OnFrame": 179,
  "TrainerHill_Entrance_EventScript_ExitElevator": 211,
  "TrainerHill_Entrance_EventScript_ExitChallenge": 259,
  "TrainerHill_Entrance_EventScript_ExitChallengeLost": 336,
  "TrainerHill_Entrance_EventScript_ExitChallengeECard": 366,
  "TrainerHill_Entrance_EventScript_PlayerExitChallenge": 391,
  "TrainerHill_Entrance_EventScript_EndExitChallenge": 425,
  "TrainerHill_Entrance_EventScript_Nurse": 426,
  "TrainerHill_Entrance_EventScript_Attendant": 441,
  "TrainerHill_Entrance_EventScript_ThanksForPlaying": 474,
  "TrainerHill_Entrance_EventScript_AttendantEnd": 482,
  "TrainerHill_Entrance_EventScript_EntryTrigger": 484,
  "TrainerHill_Entrance_EventScript_AllFloorsUsed": 567,
  "TrainerHill_Entrance_EventScript_AskChallengeTrainers": 575,
  "TrainerHill_Entrance_EventScript_Info": 674,
  "TrainerHill_Entrance_EventScript_ChooseChallenge": 688,
  "TrainerHill_Entrance_EventScript_CancelEntry": 781,
  "TrainerHill_Entrance_EventScript_SaveGame": 820,
  "TrainerHill_Entrance_EventScript_SaveFailed": 864,
  "TrainerHill_Entrance_EventScript_Closed": 878,
  "TrainerHill_Entrance_Movement_PlayerFaceAttendant": 913,
  "TrainerHill_Entrance_Movement_PushPlayerBackFromCounter": 915,
  "TrainerHill_Entrance_Movement_FaceUp": 917,
  "TrainerHill_Entrance_Movement_PlayerExitElevator": 919,
  "TrainerHill_Entrance_EventScript_Records": 922,
  "TrainerHill_Entrance_EventScript_Man": 931,
  "TrainerHill_Entrance_EventScript_ManTrainerHillClosed": 949,
  "TrainerHill_Entrance_EventScript_Girl": 958,
  "TrainerHill_Entrance_EventScript_GirlTrainerHillClosed": 976,
  "TrainerHill_Entrance_EventScript_Clerk": 985,
  "TrainerHill_Entrance_Pokemart_Basic": 1019,
  "TrainerHill_Entrance_EventScript_ExpandedPokemart": 1023,
  "TrainerHill_Entrance_Pokemart_Expanded": 1038,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [5,35,0,0,0,7,125,0,0,0,3,25,0,0,0,1,158,0,0,0,2,179,0,0,0,42,0,0,67,0,0,13,128,90,90,113,4,4,0,38,0,0,0,113,0,0,0,113,4,9,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,88,255,0,9,0,6,0,80,255,0,145,3,0,0,81,255,0,145,3,0,0,0,0,90,113,4,16,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,80,255,0,145,3,0,0,81,255,0,145,3,0,0,0,0,90,90,86,0,0,87,0,0,0,0,86,0,0,87,0,0,0,0,86,0,0,87,0,0,0,0,86,0,0,87,0,0,0,0,90,35,0,0,17,0,34,0,0,17,0,90,163,17,0,10,0,7,3,0,0,15,0,0,0,0,3,1,0,0,0,0,17,0,211,0,0,0,0,0,1,0,228,1,0,0,0,0,1,0,0,0,0,0,106,80,255,0,151,3,0,0,81,255,0,151,3,0,0,0,0,82,0,0,83,0,0,0,0,163,17,0,10,0,52,3,1,0,38,0,0,0,9,36,0,49,113,0,0,0,108,90,113,0,1,0,113,4,6,0,38,0,0,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,80,1,0,0,34,80,1,0,0,35,0,128,1,0,34,0,128,1,0,35,110,1,0,0,34,110,1,0,0,35,0,128,2,0,34,0,128,2,0,35,169,1,0,0,34,169,1,0,0,106,80,255,0,145,3,0,0,81,255,0,145,3,0,0,0,0,16,0,0,0,0,0,10,0,89,135,1,0,0,106,80,255,0,145,3,0,0,81,255,0,145,3,0,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,147,3,0,0,81,255,0,147,3,0,0,0,0,82,0,0,83,0,0,0,0,113,214,0,0,38,0,0,0,108,90,113,11,0,0,88,0,0,0,0,0,0,0,110,109,90,107,91,113,4,10,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,16,0,0,0,0,0,10,0,89,226,1,0,0,16,0,0,0,0,0,10,0,109,90,106,80,255,0,145,3,0,0,81,255,0,145,3,0,0,0,0,44,0,0,7,0,110,3,0,0,16,0,0,0,0,0,10,0,113,4,13,0,38,0,0,0,35,13,128,0,0,34,13,128,0,0,113,4,8,0,38,0,0,0,35,13,128,1,0,34,13,128,1,0,16,0,0,0,0,0,10,0,89,63,2,0,0,16,0,0,0,0,0,10,0,104,0,0,0,0,0,0,0,112,15,6,17,0,26,0,128,13,128,35,0,128,0,0,34,0,128,0,0,35,176,2,0,0,34,176,2,0,0,35,0,128,1,0,34,0,128,1,0,35,13,3,0,0,34,13,3,0,0,35,0,128,2,0,34,0,128,2,0,35,162,2,0,0,34,162,2,0,0,35,0,128,127,0,34,0,128,127,0,35,13,3,0,0,34,13,3,0,0,90,16,0,0,0,0,0,10,0,89,63,2,0,0,90,112,13,2,113,0,26,0,128,13,128,35,0,128,4,0,34,0,128,4,0,35,13,3,0,0,34,13,3,0,0,35,0,128,127,0,34,0,128,127,0,35,13,3,0,0,34,13,3,0,0,113,4,17,0,26,5,128,13,128,38,0,0,0,113,214,1,0,113,0,0,0,38,0,0,0,16,0,0,0,0,0,10,0,113,4,0,0,38,0,0,0,108,90,113,0,0,0,16,0,0,0,0,0,10,0,105,80,255,0,147,3,0,0,81,255,0,147,3,0,0,0,0,82,0,0,83,0,0,0,0,108,90,16,0,0,0,0,0,10,0,113,4,14,0,38,0,0,0,113,0,1,0,88,0,0,0,0,35,13,128,0,0,34,13,128,0,0,113,4,14,0,38,0,0,0,15,113,4,15,0,38,0,0,0,89,13,3,0,0,90,16,0,0,0,0,0,10,0,105,80,255,0,147,3,0,0,81,255,0,147,3,0,0,0,0,82,0,0,83,0,0,0,0,108,90,3,254,8,254,1,254,8,8,254,106,152,1,38,0,0,0,108,90,44,0,0,7,0,181,3,0,0,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,44,0,0,7,0,208,3,0,0,16,0,0,0,0,0,10,0,90,16,0,0,0,0,0,10,0,90,107,91,104,0,0,0,0,0,0,0,44,0,0,7,1,255,3,0,0,135,251,3,0,0,16,0,0,0,0,0,10,0,109,90,0,0,109,90,135,14,4,0,0,16,0,0,0,0,0,10,0,109,90,0,0,109,90] as const;

export const STATS = { ops: 176, bytes: 1042, labels: 42, unknownOps: 2, unresolvedSymbols: 43 } as const;
