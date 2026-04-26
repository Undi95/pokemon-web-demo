// AUTO-GENERATED from data/scripts/pc_transfer.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/pc_transfer.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Common_EventScript_GetGiftMonPartySlot', isGlobal: true, instrIndex: 0 },
  { name: 'Common_EventScript_NameReceivedBoxMon', isGlobal: true, instrIndex: 4 },
  { name: 'Common_EventScript_TransferredToPC', isGlobal: true, instrIndex: 9 },
  { name: 'EventScript_TransferredSomeonesPC', isGlobal: true, instrIndex: 14 },
  { name: 'EventScript_SomeonesPCBoxFull', isGlobal: true, instrIndex: 18 },
  { name: 'EventScript_TransferredLanettesPC', isGlobal: true, instrIndex: 22 },
  { name: 'EventScript_LanettesPCBoxFull', isGlobal: true, instrIndex: 26 },
  { name: 'Common_EventScript_NoMoreRoomForPokemon', isGlobal: true, instrIndex: 30 },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 33 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"getpartysize",args:[]},
  {op:"subvar",args:["VAR_RESULT",1]},
  {op:"copyvar",args:["VAR_0x8004","VAR_RESULT"]},
  {op:"return",args:[]},
  {op:"fadescreen",args:["FADE_TO_BLACK"]},
  {op:"special",args:["ChangeBoxPokemonNickname"]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"return",args:[]},
  {op:"bufferboxname",args:["STR_VAR_1","VAR_PC_BOX_TO_SEND_MON"]},
  {op:"bufferspeciesname",args:["STR_VAR_2","VAR_TEMP_TRANSFERRED_SPECIES"]},
  {op:"call_if_unset",args:["FLAG_SYS_PC_LANETTE","EventScript_TransferredSomeonesPC"]},
  {op:"call_if_set",args:["FLAG_SYS_PC_LANETTE","EventScript_TransferredLanettesPC"]},
  {op:"return",args:[]},
  {op:"specialvar",args:["VAR_RESULT","ShouldShowBoxWasFullMessage"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"EventScript_SomeonesPCBoxFull"]},
  {op:"msgbox",args:["gText_PkmnTransferredSomeonesPC","MSGBOX_DEFAULT"]},
  {op:"return",args:[]},
  {op:"specialvar",args:["VAR_RESULT","GetPCBoxToSendMon"]},
  {op:"bufferboxname",args:["STR_VAR_3","VAR_RESULT"]},
  {op:"msgbox",args:["gText_PkmnTransferredSomeonesPCBoxFull","MSGBOX_DEFAULT"]},
  {op:"return",args:[]},
  {op:"specialvar",args:["VAR_RESULT","ShouldShowBoxWasFullMessage"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"EventScript_LanettesPCBoxFull"]},
  {op:"msgbox",args:["gText_PkmnTransferredLanettesPC","MSGBOX_DEFAULT"]},
  {op:"return",args:[]},
  {op:"specialvar",args:["VAR_RESULT","GetPCBoxToSendMon"]},
  {op:"bufferboxname",args:["STR_VAR_3","VAR_RESULT"]},
  {op:"msgbox",args:["gText_PkmnTransferredLanettesPCBoxFull","MSGBOX_DEFAULT"]},
  {op:"return",args:[]},
  {op:"msgbox",args:["gText_NoMoreRoomForPokemon","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
