// AUTO-GENERATED from data/scripts/pc.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/pc.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'EventScript_PC', isGlobal: true, instrIndex: 0 },
  { name: 'EventScript_PCMainMenu', isGlobal: true, instrIndex: 7 },
  { name: 'EventScript_AccessPC', isGlobal: true, instrIndex: 12 },
  { name: 'EventScript_AccessPlayersPC', isGlobal: true, instrIndex: 19 },
  { name: 'EventScript_AccessPokemonStorage', isGlobal: true, instrIndex: 24 },
  { name: 'EventScript_AccessSomeonesPC', isGlobal: true, instrIndex: 31 },
  { name: 'EventScript_AccessLanettesPC', isGlobal: true, instrIndex: 33 },
  { name: 'EventScript_TurnOffPC', isGlobal: true, instrIndex: 35 },
  { name: 'EventScript_AccessHallOfFame', isGlobal: true, instrIndex: 40 },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 45 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lockall",args:[]},
  {op:"setvar",args:["VAR_0x8004","PC_LOCATION_OTHER"]},
  {op:"special",args:["DoPCTurnOnEffect"]},
  {op:"playse",args:["SE_PC_ON"]},
  {op:"msgbox",args:["Text_BootUpPC","MSGBOX_DEFAULT"]},
  {op:"goto",args:["EventScript_PCMainMenu"]},
  {op:"end",args:[]},
  {op:"message",args:["gText_WhichPCShouldBeAccessed"]},
  {op:"waitmessage",args:[]},
  {op:"special",args:["ScriptMenu_CreatePCMultichoice"]},
  {op:"goto",args:["EventScript_AccessPC"]},
  {op:"end",args:[]},
  {op:"switch",args:["VAR_RESULT"]},
  {op:"case",args:[0,"EventScript_AccessPokemonStorage"]},
  {op:"case",args:[1,"EventScript_AccessPlayersPC"]},
  {op:"case",args:[2,"EventScript_AccessHallOfFame"]},
  {op:"case",args:[3,"EventScript_TurnOffPC"]},
  {op:"case",args:["MULTI_B_PRESSED","EventScript_TurnOffPC"]},
  {op:"end",args:[]},
  {op:"playse",args:["SE_PC_LOGIN"]},
  {op:"msgbox",args:["gText_AccessedPlayersPC","MSGBOX_DEFAULT"]},
  {op:"special",args:["PlayerPC"]},
  {op:"goto",args:["EventScript_PCMainMenu"]},
  {op:"end",args:[]},
  {op:"playse",args:["SE_PC_LOGIN"]},
  {op:"call_if_unset",args:["FLAG_SYS_PC_LANETTE","EventScript_AccessSomeonesPC"]},
  {op:"call_if_set",args:["FLAG_SYS_PC_LANETTE","EventScript_AccessLanettesPC"]},
  {op:"msgbox",args:["gText_StorageSystemOpened","MSGBOX_DEFAULT"]},
  {op:"special",args:["ShowPokemonStorageSystemPC"]},
  {op:"goto",args:["EventScript_PCMainMenu"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["gText_AccessedSomeonesPC","MSGBOX_DEFAULT"]},
  {op:"return",args:[]},
  {op:"msgbox",args:["gText_AccessedLanettesPC","MSGBOX_DEFAULT"]},
  {op:"return",args:[]},
  {op:"setvar",args:["VAR_0x8004","PC_LOCATION_OTHER"]},
  {op:"playse",args:["SE_PC_OFF"]},
  {op:"special",args:["DoPCTurnOffEffect"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"goto_if_unset",args:["FLAG_SYS_GAME_CLEAR","EventScript_TurnOffPC"]},
  {op:"playse",args:["SE_PC_LOGIN"]},
  {op:"special",args:["AccessHallOfFamePC"]},
  {op:"goto",args:["EventScript_AccessPC"]},
  {op:"end",args:[]},
] as const;
