// AUTO-GENERATED from data/maps/TrainerHill_Entrance/scripts-data.ts by compile-decomp-bytecode.mjs
// Do not edit manually — re-run `npm run extract:bytecode` to refresh.
//
// Generated: 2026-06-10
// Stats: ops=176, bytes=1249, labels=42, unknownOps=0, unresolvedSymbols=75

/** Label name → byte offset within BYTECODE. */
export const LABELS: Record<string, number> = {
  "TrainerHill_Entrance_MapScripts": 0,
  "TrainerHill_Entrance_OnTransition": 25,
  "TrainerHill_Entrance_OnWarp": 34,
  "TrainerHill_Entrance_OnResume": 35,
  "TrainerHill_Entrance_EventScript_TryFaceAttendant": 104,
  "TrainerHill_Entrance_EventScript_PlayerDontFaceAttendant": 152,
  "TrainerHill_Entrance_OnReturn": 153,
  "TrainerHill_Entrance_OnLoad": 186,
  "TrainerHill_Entrance_EventScript_OpenCounterDoor": 209,
  "TrainerHill_Entrance_OnFrame": 219,
  "TrainerHill_Entrance_EventScript_ExitElevator": 251,
  "TrainerHill_Entrance_EventScript_ExitChallenge": 300,
  "TrainerHill_Entrance_EventScript_ExitChallengeLost": 415,
  "TrainerHill_Entrance_EventScript_ExitChallengeECard": 445,
  "TrainerHill_Entrance_EventScript_PlayerExitChallenge": 470,
  "TrainerHill_Entrance_EventScript_EndExitChallenge": 505,
  "TrainerHill_Entrance_EventScript_Nurse": 506,
  "TrainerHill_Entrance_EventScript_Attendant": 520,
  "TrainerHill_Entrance_EventScript_ThanksForPlaying": 566,
  "TrainerHill_Entrance_EventScript_AttendantEnd": 574,
  "TrainerHill_Entrance_EventScript_EntryTrigger": 576,
  "TrainerHill_Entrance_EventScript_AllFloorsUsed": 685,
  "TrainerHill_Entrance_EventScript_AskChallengeTrainers": 693,
  "TrainerHill_Entrance_EventScript_Info": 838,
  "TrainerHill_Entrance_EventScript_ChooseChallenge": 852,
  "TrainerHill_Entrance_EventScript_CancelEntry": 973,
  "TrainerHill_Entrance_EventScript_SaveGame": 1013,
  "TrainerHill_Entrance_EventScript_SaveFailed": 1072,
  "TrainerHill_Entrance_EventScript_Closed": 1087,
  "TrainerHill_Entrance_Movement_PlayerFaceAttendant": 1122,
  "TrainerHill_Entrance_Movement_PushPlayerBackFromCounter": 1124,
  "TrainerHill_Entrance_Movement_FaceUp": 1126,
  "TrainerHill_Entrance_Movement_PlayerExitElevator": 1128,
  "TrainerHill_Entrance_EventScript_Records": 1131,
  "TrainerHill_Entrance_EventScript_Man": 1140,
  "TrainerHill_Entrance_EventScript_ManTrainerHillClosed": 1158,
  "TrainerHill_Entrance_EventScript_Girl": 1167,
  "TrainerHill_Entrance_EventScript_GirlTrainerHillClosed": 1185,
  "TrainerHill_Entrance_EventScript_Clerk": 1194,
  "TrainerHill_Entrance_Pokemart_Basic": 1226,
  "TrainerHill_Entrance_EventScript_ExpandedPokemart": 1230,
  "TrainerHill_Entrance_Pokemart_Expanded": 1245,
};

/** Compiled bytecode — pass to a VM along with LABELS for jump resolution. */
export const BYTECODE: readonly number[] = [0,35,0,0,0,0,153,0,0,0,0,25,0,0,0,0,186,0,0,0,0,219,0,0,0,42,0,0,67,0,0,0,0,3,3,23,0,0,0,0,38,0,0,0,23,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,104,0,0,0,7,1,0,0,0,0,88,0,0,9,0,6,0,80,0,0,98,4,0,0,81,0,0,98,4,0,0,0,0,3,23,0,0,0,0,38,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,152,0,0,0,7,1,0,0,0,0,80,0,0,98,4,0,0,81,0,0,98,4,0,0,0,0,3,3,86,0,0,87,0,0,0,0,86,0,0,87,0,0,0,0,86,0,0,87,0,0,0,0,86,0,0,87,0,0,0,0,3,35,0,0,17,0,34,0,0,17,0,8,1,209,0,0,0,8,1,0,0,0,0,3,163,17,0,10,0,0,0,0,0,4,0,0,0,0,44,1,0,0,0,0,17,0,251,0,0,0,0,0,1,0,64,2,0,0,0,0,1,0,0,0,0,0,106,80,0,0,104,4,0,0,81,0,0,104,4,0,0,0,0,82,0,0,83,0,0,0,0,163,17,0,10,0,0,0,1,0,38,0,0,0,48,36,0,49,23,0,0,0,0,108,3,23,0,0,1,0,23,0,0,0,0,38,0,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,159,1,0,0,34,159,1,0,0,7,1,0,0,0,0,7,1,159,1,0,0,35,0,0,0,0,34,0,0,0,0,35,189,1,0,0,34,189,1,0,0,7,1,0,0,0,0,7,1,189,1,0,0,35,0,0,0,0,34,0,0,0,0,35,249,1,0,0,34,249,1,0,0,7,1,0,0,0,0,7,1,249,1,0,0,106,80,0,0,98,4,0,0,81,0,0,98,4,0,0,0,0,16,0,0,0,0,0,10,4,6,214,1,0,0,106,80,0,0,98,4,0,0,81,0,0,98,4,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,100,4,0,0,81,0,0,100,4,0,0,0,0,82,0,0,83,0,0,0,0,23,0,0,0,0,38,0,0,0,108,3,23,0,0,0,0,5,0,0,0,0,103,110,109,3,107,91,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,54,2,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,6,62,2,0,0,16,0,0,0,0,0,10,4,109,3,106,80,0,0,98,4,0,0,81,0,0,98,4,0,0,0,0,44,0,0,7,0,63,4,0,0,16,0,0,0,0,0,10,4,23,0,0,0,0,38,0,0,0,35,0,0,0,0,34,0,0,0,0,8,1,245,3,0,0,8,1,0,0,0,0,23,0,0,0,0,38,0,0,0,35,0,0,1,0,34,0,0,1,0,7,1,173,2,0,0,7,1,0,0,0,0,16,0,0,0,0,0,10,4,6,181,2,0,0,16,0,0,0,0,0,10,4,104,0,0,0,0,103,112,15,6,0,0,26,0,0,0,0,35,0,0,0,0,34,0,0,0,0,35,84,3,0,0,34,84,3,0,0,7,1,0,0,0,0,7,1,84,3,0,0,35,0,0,1,0,34,0,0,1,0,35,205,3,0,0,34,205,3,0,0,7,1,0,0,0,0,7,1,205,3,0,0,35,0,0,2,0,34,0,0,2,0,35,70,3,0,0,34,70,3,0,0,7,1,0,0,0,0,7,1,70,3,0,0,35,0,0,0,0,34,0,0,0,0,35,205,3,0,0,34,205,3,0,0,7,1,0,0,0,0,7,1,205,3,0,0,3,16,0,0,0,0,0,10,4,6,181,2,0,0,3,112,13,2,0,0,26,0,0,0,0,35,0,0,4,0,34,0,0,4,0,35,205,3,0,0,34,205,3,0,0,7,1,0,0,0,0,7,1,205,3,0,0,35,0,0,0,0,34,0,0,0,0,35,205,3,0,0,34,205,3,0,0,7,1,0,0,0,0,7,1,205,3,0,0,23,0,0,0,0,26,0,0,0,0,38,0,0,0,23,0,0,1,0,23,0,0,0,0,38,0,0,0,16,0,0,0,0,0,10,4,23,0,0,0,0,38,0,0,0,108,3,23,0,0,0,0,16,0,0,0,0,0,10,4,105,80,0,0,100,4,0,0,81,0,0,100,4,0,0,0,0,82,0,0,83,0,0,0,0,108,3,16,0,0,0,0,0,10,4,23,0,0,0,0,38,0,0,0,23,0,0,1,0,5,0,0,0,0,35,0,0,0,0,34,0,0,0,0,7,1,48,4,0,0,7,1,0,0,0,0,23,0,0,0,0,38,0,0,0,4,23,0,0,0,0,38,0,0,0,6,205,3,0,0,3,16,0,0,0,0,0,10,4,105,80,0,0,100,4,0,0,81,0,0,100,4,0,0,0,0,82,0,0,83,0,0,0,0,108,3,0,0,0,0,0,0,0,0,0,106,152,0,38,0,0,0,108,3,44,0,0,7,0,134,4,0,0,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,44,0,0,7,0,161,4,0,0,16,0,0,0,0,0,10,2,3,16,0,0,0,0,0,10,2,3,107,91,104,0,0,0,0,103,44,0,0,7,1,206,4,0,0,135,202,4,0,0,16,0,0,0,0,0,10,4,109,3,0,0,109,3,135,221,4,0,0,16,0,0,0,0,0,10,4,109,3,0,0,109,3] as const;

export const STATS = { ops: 176, bytes: 1249, labels: 42, unknownOps: 0, unresolvedSymbols: 75 } as const;
