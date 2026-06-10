// AUTO-GENERATED from asm/macros/battle_frontier/frontier_util.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_frontier/frontier_util.inc
// Generated: 2026-06-10

// ─── .macro definitions (asm macro → opcode mapping bodies) ─────────────────
export const MACROS = [
  { name: "frontier_getstatus", args: [], body: [{op:"setvar",args:["VAR_0x8004","FRONTIER_UTIL_FUNC_GET_STATUS"]}, {op:"special",args:["CallFrontierUtilFunc"]}] },
  { name: "frontier_get", args: ["data:req"], body: [{op:"setvar",args:["VAR_0x8004","FRONTIER_UTIL_FUNC_GET_DATA"]}, {op:"setvar",args:["VAR_0x8005","\\data"]}, {op:"special",args:["CallFrontierUtilFunc"]}] },
  { name: "frontier_set", args: ["data:req", "val=0xFFFF"], body: [{op:"setvar",args:["VAR_0x8004","FRONTIER_UTIL_FUNC_SET_DATA"]}, {op:"setvar",args:["VAR_0x8005","\\data"]}, {op:".if",args:["\\val == 0xFFFF"]}, {op:".elseif",args:["\\val >= VARS_START"]}, {op:"copyvar",args:["VAR_0x8006","\\val"]}, {op:".else",args:[]}, {op:"setvar",args:["VAR_0x8006","\\val"]}, {op:".endif",args:[]}, {op:"special",args:["CallFrontierUtilFunc"]}] },
  { name: "frontier_setpartyorder", args: ["partySize:req"], body: [{op:"setvar",args:["VAR_0x8004","FRONTIER_UTIL_FUNC_SET_PARTY_ORDER"]}, {op:"setvar",args:["VAR_0x8005","\\partySize"]}, {op:"special",args:["CallFrontierUtilFunc"]}] },
  { name: "frontier_reset", args: [], body: [{op:"setvar",args:["VAR_0x8004","FRONTIER_UTIL_FUNC_SOFT_RESET"]}, {op:"special",args:["CallFrontierUtilFunc"]}] },
  { name: "frontier_settrainers", args: [], body: [{op:"setvar",args:["VAR_0x8004","FRONTIER_UTIL_FUNC_SET_TRAINERS"]}, {op:"special",args:["CallFrontierUtilFunc"]}] },
  { name: "frontier_saveparty", args: [], body: [{op:"setvar",args:["VAR_0x8004","FRONTIER_UTIL_FUNC_SAVE_PARTY"]}, {op:"special",args:["CallFrontierUtilFunc"]}] },
  { name: "frontier_results", args: ["facility:req", "mode=0xFF"], body: [{op:"setvar",args:["VAR_0x8004","FRONTIER_UTIL_FUNC_RESULTS_WINDOW"]}, {op:"setvar",args:["VAR_0x8005","\\facility"]}, {op:".if",args:["\\mode != 0xFF"]}, {op:"setvar",args:["VAR_0x8006","\\mode"]}, {op:".endif",args:[]}, {op:"special",args:["CallFrontierUtilFunc"]}] },
  { name: "frontier_checkairshow", args: [], body: [{op:"setvar",args:["VAR_0x8004","FRONTIER_UTIL_FUNC_CHECK_AIR_TV_SHOW"]}, {op:"special",args:["CallFrontierUtilFunc"]}] },
  { name: "frontier_getbrainstatus", args: [], body: [{op:"setvar",args:["VAR_0x8004","FRONTIER_UTIL_FUNC_GET_BRAIN_STATUS"]}, {op:"special",args:["CallFrontierUtilFunc"]}] },
  { name: "frontier_isbrain", args: [], body: [{op:"setvar",args:["VAR_0x8004","FRONTIER_UTIL_FUNC_IS_BRAIN"]}, {op:"special",args:["CallFrontierUtilFunc"]}] },
  { name: "frontier_givepoints", args: [], body: [{op:"setvar",args:["VAR_0x8004","FRONTIER_UTIL_FUNC_GIVE_BATTLE_POINTS"]}, {op:"special",args:["CallFrontierUtilFunc"]}] },
  { name: "frontier_getsymbols", args: [], body: [{op:"setvar",args:["VAR_0x8004","FRONTIER_UTIL_FUNC_GET_FACILITY_SYMBOLS"]}, {op:"special",args:["CallFrontierUtilFunc"]}] },
  { name: "frontier_givesymbol", args: [], body: [{op:"setvar",args:["VAR_0x8004","FRONTIER_UTIL_FUNC_GIVE_FACILITY_SYMBOL"]}, {op:"special",args:["CallFrontierUtilFunc"]}] },
  { name: "frontier_isbattletype", args: ["battleType:req"], body: [{op:"setvar",args:["VAR_0x8004","FRONTIER_UTIL_FUNC_CHECK_BATTLE_TYPE"]}, {op:"setvar",args:["VAR_0x8005","\\battleType"]}, {op:"special",args:["CallFrontierUtilFunc"]}] },
  { name: "frontier_checkineligible", args: [], body: [{op:"setvar",args:["VAR_0x8004","FRONTIER_UTIL_FUNC_CHECK_INELIGIBLE"]}, {op:"special",args:["CallFrontierUtilFunc"]}] },
  { name: "frontier_checkvisittrainer", args: [], body: [{op:"setvar",args:["VAR_0x8004","FRONTIER_UTIL_FUNC_CHECK_VISIT_TRAINER"]}, {op:"special",args:["CallFrontierUtilFunc"]}] },
  { name: "frontier_incrementstreak", args: [], body: [{op:"setvar",args:["VAR_0x8004","FRONTIER_UTIL_FUNC_INCREMENT_STREAK"]}, {op:"special",args:["CallFrontierUtilFunc"]}] },
  { name: "frontier_restorehelditems", args: [], body: [{op:"setvar",args:["VAR_0x8004","FRONTIER_UTIL_FUNC_RESTORE_HELD_ITEMS"]}, {op:"special",args:["CallFrontierUtilFunc"]}] },
  { name: "frontier_savebattle", args: [], body: [{op:"setvar",args:["VAR_0x8004","FRONTIER_UTIL_FUNC_SAVE_BATTLE"]}, {op:"special",args:["CallFrontierUtilFunc"]}] },
  { name: "frontier_gettrainername", args: ["stringVar:req"], body: [{op:"setvar",args:["VAR_0x8004","FRONTIER_UTIL_FUNC_BUFFER_TRAINER_NAME"]}, {op:".if",args:["\\stringVar == STR_VAR_1"]}, {op:"setvar",args:["VAR_0x8005","0"]}, {op:".elseif",args:["\\stringVar == STR_VAR_2"]}, {op:"setvar",args:["VAR_0x8005","1"]}, {op:".else",args:[]}, {op:"setvar",args:["VAR_0x8005","\\stringVar"]}, {op:".endif",args:[]}, {op:"special",args:["CallFrontierUtilFunc"]}] },
  { name: "frontier_resetsketch", args: [], body: [{op:"setvar",args:["VAR_0x8004","FRONTIER_UTIL_FUNC_RESET_SKETCH_MOVES"]}, {op:"special",args:["CallFrontierUtilFunc"]}] },
  { name: "frontier_setbrainobj", args: [], body: [{op:"setvar",args:["VAR_0x8004","FRONTIER_UTIL_FUNC_SET_BRAIN_OBJECT"]}, {op:"special",args:["CallFrontierUtilFunc"]}] },
] as const;
