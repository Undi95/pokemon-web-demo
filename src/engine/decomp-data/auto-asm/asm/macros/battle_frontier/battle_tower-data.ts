// AUTO-GENERATED from asm/macros/battle_frontier/battle_tower.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_frontier/battle_tower.inc
// Generated: 2026-06-10

// ─── .macro definitions (asm macro → opcode mapping bodies) ─────────────────
export const MACROS = [
  { name: "tower_init", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_TOWER_FUNC_INIT"]}, {op:"special",args:["CallBattleTowerFunc"]}] },
  { name: "tower_get", args: ["data:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_TOWER_FUNC_GET_DATA"]}, {op:"setvar",args:["VAR_0x8005","\\data"]}, {op:"special",args:["CallBattleTowerFunc"]}] },
  { name: "tower_set", args: ["data:req", "val=0xFFFF"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_TOWER_FUNC_SET_DATA"]}, {op:"setvar",args:["VAR_0x8005","\\data"]}, {op:".if",args:["\\val != 0xFFFF"]}, {op:"setvar",args:["VAR_0x8006","\\val"]}, {op:".endif",args:[]}, {op:"special",args:["CallBattleTowerFunc"]}] },
  { name: "tower_setopponent", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_TOWER_FUNC_SET_OPPONENT"]}, {op:"special",args:["CallBattleTowerFunc"]}] },
  { name: "tower_setbattlewon", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_TOWER_FUNC_SET_BATTLE_WON"]}, {op:"special",args:["CallBattleTowerFunc"]}] },
  { name: "tower_giveribbons", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_TOWER_FUNC_GIVE_RIBBONS"]}, {op:"special",args:["CallBattleTowerFunc"]}] },
  { name: "tower_save", args: ["challengeStatus:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_TOWER_FUNC_SAVE"]}, {op:"setvar",args:["VAR_0x8005","\\challengeStatus"]}, {op:"special",args:["CallBattleTowerFunc"]}] },
  { name: "tower_getopponentintro", args: ["opponent:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_TOWER_FUNC_GET_OPPONENT_INTRO"]}, {op:"setvar",args:["VAR_0x8005","\\opponent"]}, {op:"special",args:["CallBattleTowerFunc"]}] },
  { name: "tower_getopponentintro2", args: ["opponent:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_TOWER_FUNC_GET_OPPONENT_INTRO2"]}, {op:"setvar",args:["VAR_0x8005","\\opponent"]}, {op:"special",args:["CallBattleTowerFunc"]}] },
  { name: "tower_loadpartners", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_TOWER_FUNC_LOAD_PARTNERS"]}, {op:"special",args:["CallBattleTowerFunc"]}] },
  { name: "tower_dopartnermsg", args: ["msgId:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_TOWER_FUNC_PARTNER_MSG"]}, {op:"setvar",args:["VAR_0x8005","\\msgId"]}, {op:"special",args:["CallBattleTowerFunc"]}] },
  { name: "tower_loadlinkopponents", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_TOWER_FUNC_LOAD_LINK_OPPONENTS"]}, {op:"special",args:["CallBattleTowerFunc"]}] },
  { name: "tower_closelink", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_TOWER_FUNC_TRY_CLOSE_LINK"]}, {op:"special",args:["CallBattleTowerFunc"]}] },
  { name: "tower_setpartnergfx", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_TOWER_FUNC_SET_PARTNER_GFX"]}, {op:"special",args:["CallBattleTowerFunc"]}] },
  { name: "tower_setinterviewdata", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_TOWER_FUNC_SET_INTERVIEW_DATA"]}, {op:"special",args:["CallBattleTowerFunc"]}] },
] as const;
