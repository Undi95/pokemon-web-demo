// AUTO-GENERATED from asm/macros/battle_frontier/battle_factory.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_frontier/battle_factory.inc
// Generated: 2026-04-26

// ─── .macro definitions (asm macro → opcode mapping bodies) ─────────────────
export const MACROS = [
  { name: "factory_init", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_FACTORY_FUNC_INIT"]}, {op:"special",args:["CallBattleFactoryFunction"]}] },
  { name: "factory_get", args: ["data:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_FACTORY_FUNC_GET_DATA"]}, {op:"setvar",args:["VAR_0x8005","\\data"]}, {op:"special",args:["CallBattleFactoryFunction"]}] },
  { name: "factory_set", args: ["data:req", "val=0xFFFF"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_FACTORY_FUNC_SET_DATA"]}, {op:"setvar",args:["VAR_0x8005","\\data"]}, {op:".if",args:["\\val == 0xFFFF"]}, {op:".elseif",args:["\\val >= VARS_START"]}, {op:"copyvar",args:["VAR_0x8006","\\val"]}, {op:".else",args:[]}, {op:"setvar",args:["VAR_0x8006","\\val"]}, {op:".endif",args:[]}, {op:"special",args:["CallBattleFactoryFunction"]}] },
  { name: "factory_save", args: ["challengeStatus:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_FACTORY_FUNC_SAVE"]}, {op:"setvar",args:["VAR_0x8005","\\challengeStatus"]}, {op:"special",args:["CallBattleFactoryFunction"]}] },
  { name: "factory_rentmons", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_FACTORY_FUNC_SELECT_RENT_MONS"]}, {op:"special",args:["CallBattleFactoryFunction"]}] },
  { name: "factory_swapmons", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_FACTORY_FUNC_SWAP_RENT_MONS"]}, {op:"special",args:["CallBattleFactoryFunction"]}] },
  { name: "factory_setswapped", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_FACTORY_FUNC_SET_SWAPPED"]}, {op:"special",args:["CallBattleFactoryFunction"]}] },
  { name: "factory_setopponentmons", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_FACTORY_FUNC_SET_OPPONENT_MONS"]}, {op:"special",args:["CallBattleFactoryFunction"]}] },
  { name: "factory_setparties", args: ["arg:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_FACTORY_FUNC_SET_PARTIES"]}, {op:"setvar",args:["VAR_0x8005","\\arg"]}, {op:"special",args:["CallBattleFactoryFunction"]}] },
  { name: "factory_setopponentgfx", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_FACTORY_FUNC_SET_OPPONENT_GFX"]}, {op:"special",args:["CallBattleFactoryFunction"]}] },
  { name: "factory_generateopponentmons", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_FACTORY_FUNC_GENERATE_OPPONENT_MONS"]}, {op:"special",args:["CallBattleFactoryFunction"]}] },
  { name: "factory_generaterentalmons", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_FACTORY_FUNC_GENERATE_RENTAL_MONS"]}, {op:"special",args:["CallBattleFactoryFunction"]}] },
  { name: "factory_getopponentmontype", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_FACTORY_FUNC_GET_OPPONENT_MON_TYPE"]}, {op:"special",args:["CallBattleFactoryFunction"]}] },
  { name: "factory_getopponentstyle", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_FACTORY_FUNC_GET_OPPONENT_STYLE"]}, {op:"special",args:["CallBattleFactoryFunction"]}] },
  { name: "factory_resethelditems", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_FACTORY_FUNC_RESET_HELD_ITEMS"]}, {op:"special",args:["CallBattleFactoryFunction"]}] },
] as const;
