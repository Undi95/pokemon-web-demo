// AUTO-GENERATED from asm/macros/battle_frontier/battle_palace.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_frontier/battle_palace.inc
// Generated: 2026-06-10

// ─── .macro definitions (asm macro → opcode mapping bodies) ─────────────────
export const MACROS = [
  { name: "palace_init", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PALACE_FUNC_INIT"]}, {op:"special",args:["CallBattlePalaceFunction"]}] },
  { name: "palace_get", args: ["data:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PALACE_FUNC_GET_DATA"]}, {op:"setvar",args:["VAR_0x8005","\\data"]}, {op:"special",args:["CallBattlePalaceFunction"]}] },
  { name: "palace_set", args: ["data:req", "val:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PALACE_FUNC_SET_DATA"]}, {op:"setvar",args:["VAR_0x8005","\\data"]}, {op:"setvar",args:["VAR_0x8006","\\val"]}, {op:"special",args:["CallBattlePalaceFunction"]}] },
  { name: "palace_getcomment", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PALACE_FUNC_GET_COMMENT_ID"]}, {op:"special",args:["CallBattlePalaceFunction"]}] },
  { name: "palace_setopponent", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PALACE_FUNC_SET_OPPONENT"]}, {op:"special",args:["CallBattlePalaceFunction"]}] },
  { name: "palace_getopponentintro", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PALACE_FUNC_GET_OPPONENT_INTRO"]}, {op:"special",args:["CallBattlePalaceFunction"]}] },
  { name: "palace_incrementstreak", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PALACE_FUNC_INCREMENT_STREAK"]}, {op:"special",args:["CallBattlePalaceFunction"]}] },
  { name: "palace_save", args: ["challengeStatus:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PALACE_FUNC_SAVE"]}, {op:"setvar",args:["VAR_0x8005","\\challengeStatus"]}, {op:"special",args:["CallBattlePalaceFunction"]}] },
  { name: "palace_setprize", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PALACE_FUNC_SET_PRIZE"]}, {op:"special",args:["CallBattleArenaFunction"]}] },
  { name: "palace_giveprize", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PALACE_FUNC_GIVE_PRIZE"]}, {op:"special",args:["CallBattleArenaFunction"]}] },
] as const;
