// AUTO-GENERATED from asm/macros/trainer_hill.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/asm/macros/trainer_hill.inc
// Generated: 2026-04-26

// ─── .macro definitions (asm macro → opcode mapping bodies) ─────────────────
export const MACROS = [
  { name: "trainerhill_start", args: [], body: [{op:"setvar",args:["VAR_0x8004","TRAINER_HILL_FUNC_START"]}, {op:"special",args:["CallTrainerHillFunction"]}] },
  { name: "trainerhill_getownerstate", args: [], body: [{op:"setvar",args:["VAR_0x8004","TRAINER_HILL_FUNC_GET_OWNER_STATE"]}, {op:"special",args:["CallTrainerHillFunction"]}] },
  { name: "trainerhill_giveprize", args: [], body: [{op:"setvar",args:["VAR_0x8004","TRAINER_HILL_FUNC_GIVE_PRIZE"]}, {op:"special",args:["CallTrainerHillFunction"]}] },
  { name: "trainerhill_finaltime", args: [], body: [{op:"setvar",args:["VAR_0x8004","TRAINER_HILL_FUNC_CHECK_FINAL_TIME"]}, {op:"special",args:["CallTrainerHillFunction"]}] },
  { name: "trainerhill_resumetimer", args: [], body: [{op:"setvar",args:["VAR_0x8004","TRAINER_HILL_FUNC_RESUME_TIMER"]}, {op:"special",args:["CallTrainerHillFunction"]}] },
  { name: "trainerhill_lost", args: [], body: [{op:"setvar",args:["VAR_0x8004","TRAINER_HILL_FUNC_SET_LOST"]}, {op:"special",args:["CallTrainerHillFunction"]}] },
  { name: "trainerhill_getstatus", args: [], body: [{op:"setvar",args:["VAR_0x8004","TRAINER_HILL_FUNC_GET_CHALLENGE_STATUS"]}, {op:"special",args:["CallTrainerHillFunction"]}] },
  { name: "trainerhill_gettime", args: [], body: [{op:"setvar",args:["VAR_0x8004","TRAINER_HILL_FUNC_GET_CHALLENGE_TIME"]}, {op:"special",args:["CallTrainerHillFunction"]}] },
  { name: "trainerhill_allfloorsused", args: [], body: [{op:"setvar",args:["VAR_0x8004","TRAINER_HILL_FUNC_GET_ALL_FLOORS_USED"]}, {op:"special",args:["CallTrainerHillFunction"]}] },
  { name: "trainerhill_getusingereader", args: [], body: [{op:"setvar",args:["VAR_0x8004","TRAINER_HILL_FUNC_GET_IN_EREADER_MODE"]}, {op:"special",args:["CallTrainerHillFunction"]}] },
  { name: "trainerhill_inchallenge", args: [], body: [{op:"setvar",args:["VAR_0x8004","TRAINER_HILL_FUNC_IN_CHALLENGE"]}, {op:"special",args:["CallTrainerHillFunction"]}] },
  { name: "trainerhill_postbattletext", args: [], body: [{op:"setvar",args:["VAR_0x8004","TRAINER_HILL_FUNC_POST_BATTLE_TEXT"]}, {op:"special",args:["CallTrainerHillFunction"]}] },
  { name: "trainerhill_settrainerflags", args: [], body: [{op:"setvar",args:["VAR_0x8004","TRAINER_HILL_FUNC_SET_ALL_TRAINER_FLAGS"]}, {op:"special",args:["CallTrainerHillFunction"]}] },
  { name: "trainerhill_getsaved", args: [], body: [{op:"setvar",args:["VAR_0x8004","TRAINER_HILL_FUNC_GET_GAME_SAVED"]}, {op:"special",args:["CallTrainerHillFunction"]}] },
  { name: "trainerhill_setsaved", args: [], body: [{op:"setvar",args:["VAR_0x8004","TRAINER_HILL_FUNC_SET_GAME_SAVED"]}, {op:"special",args:["CallTrainerHillFunction"]}] },
  { name: "trainerhill_clearsaved", args: [], body: [{op:"setvar",args:["VAR_0x8004","TRAINER_HILL_FUNC_CLEAR_GAME_SAVED"]}, {op:"special",args:["CallTrainerHillFunction"]}] },
  { name: "trainerhill_getwon", args: [], body: [{op:"setvar",args:["VAR_0x8004","TRAINER_HILL_FUNC_GET_WON"]}, {op:"special",args:["CallTrainerHillFunction"]}] },
  { name: "trainerhill_setmode", args: ["mode:req"], body: [{op:"setvar",args:["VAR_0x8004","TRAINER_HILL_FUNC_SET_MODE"]}, {op:"copyvar",args:["VAR_0x8005","\\mode"]}, {op:"special",args:["CallTrainerHillFunction"]}] },
] as const;
