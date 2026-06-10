// AUTO-GENERATED from asm/macros/battle_frontier/battle_dome.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_frontier/battle_dome.inc
// Generated: 2026-04-26

// ─── .macro definitions (asm macro → opcode mapping bodies) ─────────────────
export const MACROS = [
  { name: "dome_init", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_DOME_FUNC_INIT"]}, {op:"special",args:["CallBattleDomeFunction"]}] },
  { name: "dome_get", args: ["data:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_DOME_FUNC_GET_DATA"]}, {op:"setvar",args:["VAR_0x8005","\\data"]}, {op:"special",args:["CallBattleDomeFunction"]}] },
  { name: "dome_set", args: ["data:req", "val=0xFFFF"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_DOME_FUNC_SET_DATA"]}, {op:"setvar",args:["VAR_0x8005","\\data"]}, {op:".if",args:["\\val != 0xFFFF"]}, {op:"setvar",args:["VAR_0x8006","\\val"]}, {op:".endif",args:[]}, {op:"special",args:["CallBattleDomeFunction"]}] },
  { name: "dome_getroundtext", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_DOME_FUNC_GET_ROUND_TEXT"]}, {op:"special",args:["CallBattleDomeFunction"]}] },
  { name: "dome_getopponentname", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_DOME_FUNC_GET_OPPONENT_NAME"]}, {op:"special",args:["CallBattleDomeFunction"]}] },
  { name: "dome_initopponentparty", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_DOME_FUNC_INIT_OPPONENT_PARTY"]}, {op:"special",args:["CallBattleDomeFunction"]}] },
  { name: "dome_showopponentinfo", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_DOME_FUNC_SHOW_OPPONENT_INFO"]}, {op:"special",args:["CallBattleDomeFunction"]}] },
  { name: "dome_showtourneytree", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_DOME_FUNC_SHOW_TOURNEY_TREE"]}, {op:"special",args:["CallBattleDomeFunction"]}] },
  { name: "dome_showprevtourneytree", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_DOME_FUNC_SHOW_PREV_TOURNEY_TREE"]}, {op:"special",args:["CallBattleDomeFunction"]}] },
  { name: "dome_setopponent", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_DOME_FUNC_SET_OPPONENT_ID"]}, {op:"special",args:["CallBattleDomeFunction"]}] },
  { name: "dome_setopponentgfx", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_DOME_FUNC_SET_OPPONENT_GFX"]}, {op:"special",args:["CallBattleDomeFunction"]}] },
  { name: "dome_showstatictourneytree", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_DOME_FUNC_SHOW_STATIC_TOURNEY_TREE"]}, {op:"special",args:["CallBattleDomeFunction"]}] },
  { name: "dome_resolvewinners", args: ["playerStatus:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_DOME_FUNC_RESOLVE_WINNERS"]}, {op:"setvar",args:["VAR_0x8005","\\playerStatus"]}, {op:"special",args:["CallBattleDomeFunction"]}] },
  { name: "dome_save", args: ["challengeStatus:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_DOME_FUNC_SAVE"]}, {op:"setvar",args:["VAR_0x8005","\\challengeStatus"]}, {op:"special",args:["CallBattleDomeFunction"]}] },
  { name: "dome_incrementstreaks", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_DOME_FUNC_INCREMENT_STREAK"]}, {op:"special",args:["CallBattleDomeFunction"]}] },
  { name: "dome_settrainers", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_DOME_FUNC_SET_TRAINERS"]}, {op:"special",args:["CallBattleDomeFunction"]}] },
  { name: "dome_resetsketch", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_DOME_FUNC_RESET_SKETCH"]}, {op:"special",args:["CallBattleDomeFunction"]}] },
  { name: "dome_restorehelditems", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_DOME_FUNC_RESTORE_HELD_ITEMS"]}, {op:"special",args:["CallBattleDomeFunction"]}] },
  { name: "dome_reduceparty", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_DOME_FUNC_REDUCE_PARTY"]}, {op:"special",args:["CallBattleDomeFunction"]}] },
  { name: "dome_compareseeds", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_DOME_FUNC_COMPARE_SEEDS"]}, {op:"special",args:["CallBattleDomeFunction"]}] },
  { name: "dome_getwinnersname", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_DOME_FUNC_GET_WINNER_NAME"]}, {op:"special",args:["CallBattleDomeFunction"]}] },
  { name: "dome_initresultstree", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_DOME_FUNC_INIT_RESULTS_TREE"]}, {op:"special",args:["CallBattleDomeFunction"]}] },
  { name: "dome_inittrainers", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_DOME_FUNC_INIT_TRAINERS"]}, {op:"special",args:["CallBattleDomeFunction"]}] },
] as const;
