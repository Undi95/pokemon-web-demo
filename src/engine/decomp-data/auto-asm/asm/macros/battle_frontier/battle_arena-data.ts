// AUTO-GENERATED from asm/macros/battle_frontier/battle_arena.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_frontier/battle_arena.inc
// Generated: 2026-06-10

// ─── .macro definitions (asm macro → opcode mapping bodies) ─────────────────
export const MACROS = [
  { name: "arena_init", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_ARENA_FUNC_INIT"]}, {op:"special",args:["CallBattleArenaFunction"]}] },
  { name: "arena_get", args: ["data:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_ARENA_FUNC_GET_DATA"]}, {op:"setvar",args:["VAR_0x8005","\\data"]}, {op:"special",args:["CallBattleArenaFunction"]}] },
  { name: "arena_set", args: ["data:req", "val:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_ARENA_FUNC_SET_DATA"]}, {op:"setvar",args:["VAR_0x8005","\\data"]}, {op:".if",args:["\\val >= VARS_START"]}, {op:"copyvar",args:["VAR_0x8006","\\val"]}, {op:".else",args:[]}, {op:"setvar",args:["VAR_0x8006","\\val"]}, {op:".endif",args:[]}, {op:"special",args:["CallBattleArenaFunction"]}] },
  { name: "arena_save", args: ["challengeStatus:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_ARENA_FUNC_SAVE"]}, {op:"setvar",args:["VAR_0x8005","\\challengeStatus"]}, {op:"special",args:["CallBattleArenaFunction"]}] },
  { name: "arena_setprize", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_ARENA_FUNC_SET_PRIZE"]}, {op:"special",args:["CallBattleArenaFunction"]}] },
  { name: "arena_giveprize", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_ARENA_FUNC_GIVE_PRIZE"]}, {op:"special",args:["CallBattleArenaFunction"]}] },
  { name: "arena_gettrainername", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_ARENA_FUNC_GET_TRAINER_NAME"]}, {op:"special",args:["CallBattleArenaFunction"]}] },
] as const;
