// AUTO-GENERATED from asm/macros/battle_frontier/battle_pyramid.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_frontier/battle_pyramid.inc
// Generated: 2026-06-10

// ─── .macro definitions (asm macro → opcode mapping bodies) ─────────────────
export const MACROS = [
  { name: "pyramid_init", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PYRAMID_FUNC_INIT"]}, {op:"special",args:["CallBattlePyramidFunction"]}] },
  { name: "pyramid_get", args: ["data:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PYRAMID_FUNC_GET_DATA"]}, {op:"setvar",args:["VAR_0x8005","\\data"]}, {op:"special",args:["CallBattlePyramidFunction"]}] },
  { name: "pyramid_set", args: ["data:req", "val:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PYRAMID_FUNC_SET_DATA"]}, {op:"setvar",args:["VAR_0x8005","\\data"]}, {op:"setvar",args:["VAR_0x8006","\\val"]}, {op:"special",args:["CallBattlePyramidFunction"]}] },
  { name: "pyramid_save", args: ["challengeStatus:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PYRAMID_FUNC_SAVE"]}, {op:"setvar",args:["VAR_0x8005","\\challengeStatus"]}, {op:"special",args:["CallBattlePyramidFunction"]}] },
  { name: "pyramid_setprize", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PYRAMID_FUNC_SET_PRIZE"]}, {op:"special",args:["CallBattlePyramidFunction"]}] },
  { name: "pyramid_giveprize", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PYRAMID_FUNC_GIVE_PRIZE"]}, {op:"special",args:["CallBattlePyramidFunction"]}] },
  { name: "pyramid_seedfloor", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PYRAMID_FUNC_SEED_FLOOR"]}, {op:"special",args:["CallBattlePyramidFunction"]}] },
  { name: "pyramid_setitem", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PYRAMID_FUNC_SET_ITEM"]}, {op:"special",args:["CallBattlePyramidFunction"]}] },
  { name: "pyramid_hideitem", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PYRAMID_FUNC_HIDE_ITEM"]}, {op:"special",args:["CallBattlePyramidFunction"]}] },
  { name: "pyramid_settrainers", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PYRAMID_FUNC_SET_TRAINERS"]}, {op:"special",args:["CallBattlePyramidFunction"]}] },
  { name: "pyramid_showhint", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PYRAMID_FUNC_SHOW_HINT_TEXT"]}, {op:"special",args:["CallBattlePyramidFunction"]}] },
  { name: "pyramid_getlocation", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PYRAMID_FUNC_CURRENT_LOCATION"]}, {op:"special",args:["CallBattlePyramidFunction"]}] },
  { name: "pyramid_updatelight", args: ["radius:req", "mode:req", "sound=0xFFFF"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PYRAMID_FUNC_UPDATE_LIGHT"]}, {op:"setvar",args:["VAR_0x8005","\\radius"]}, {op:"setvar",args:["VAR_0x8006","\\mode"]}, {op:".if",args:["\\sound != 0xFFFF"]}, {op:"setvar",args:["VAR_0x8007","\\sound"]}, {op:".endif",args:[]}, {op:"special",args:["CallBattlePyramidFunction"]}] },
  { name: "pyramid_clearhelditems", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PYRAMID_FUNC_CLEAR_HELD_ITEMS"]}, {op:"special",args:["CallBattlePyramidFunction"]}] },
  { name: "pyramid_setfloorpal", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PYRAMID_FUNC_SET_FLOOR_PALETTE"]}, {op:"special",args:["CallBattlePyramidFunction"]}] },
  { name: "pyramid_resetparty", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PYRAMID_FUNC_RESTORE_PARTY"]}, {op:"special",args:["CallBattlePyramidFunction"]}] },
] as const;
