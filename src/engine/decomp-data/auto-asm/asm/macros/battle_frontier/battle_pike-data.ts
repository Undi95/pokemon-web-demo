// AUTO-GENERATED from asm/macros/battle_frontier/battle_pike.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/asm/macros/battle_frontier/battle_pike.inc
// Generated: 2026-06-10

// ─── .macro definitions (asm macro → opcode mapping bodies) ─────────────────
export const MACROS = [
  { name: "pike_setnextroom", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_SET_ROOM_TYPE"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_get", args: ["data:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_GET_DATA"]}, {op:"setvar",args:["VAR_0x8005","\\data"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_set", args: ["data:req", "val:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_SET_DATA"]}, {op:"setvar",args:["VAR_0x8005","\\data"]}, {op:".if",args:["\\val >= VARS_START"]}, {op:"copyvar",args:["VAR_0x8006","\\val"]}, {op:".else",args:[]}, {op:"setvar",args:["VAR_0x8006","\\val"]}, {op:".endif",args:[]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_isfinalroom", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_IS_FINAL_ROOM"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_setroomobjects", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_SET_ROOM_OBJECTS"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_getroomtype", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_GET_ROOM_TYPE"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_inwildmonroom", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_SET_IN_WILD_MON_ROOM"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_exitwildmonroom", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_CLEAR_IN_WILD_MON_ROOM"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_save", args: ["challengeStatus:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_SAVE"]}, {op:"setvar",args:["VAR_0x8005","\\challengeStatus"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_getstatus", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_GET_ROOM_STATUS"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_getstatusmon", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_GET_ROOM_STATUS_MON"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_healonetwomons", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_HEAL_ONE_TWO_MONS"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_getnpcmsg", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_BUFFER_NPC_MSG"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_flashscreen", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_STATUS_SCREEN_FLASH"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_inchallenge", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_IS_IN"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_sethintroom", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_SET_HINT_ROOM"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_gethintroomid", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_GET_HINT_ROOM_ID"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_gethint", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_GET_ROOM_TYPE_HINT"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_cleartrainerids", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_CLEAR_TRAINER_IDS"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_gettrainerintro", args: ["trainer:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_GET_TRAINER_INTRO"]}, {op:"setvar",args:["VAR_0x8005","\\trainer"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_getbrainstatus", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_GET_QUEEN_FIGHT_TYPE"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_prequeenheal", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_HEAL_MONS_BEFORE_QUEEN"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_nohealing", args: ["set:req"], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_SET_HEAL_ROOMS_DISABLED"]}, {op:"setvar",args:["VAR_0x8005","\\set"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_ispartyfullhealth", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_IS_PARTY_FULL_HEALTH"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_savehelditems", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_SAVE_HELD_ITEMS"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_resethelditems", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_RESET_HELD_ITEMS"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
  { name: "pike_init", args: [], body: [{op:"setvar",args:["VAR_0x8004","BATTLE_PIKE_FUNC_INIT"]}, {op:"special",args:["CallBattlePikeFunction"]}] },
] as const;
