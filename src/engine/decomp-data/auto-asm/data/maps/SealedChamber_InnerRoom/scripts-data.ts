// AUTO-GENERATED from data/maps/SealedChamber_InnerRoom/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SealedChamber_InnerRoom/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SealedChamber_InnerRoom_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SealedChamber_InnerRoom_EventScript_BrailleBackWall', isGlobal: true, instrIndex: 0 },
  { name: 'SealedChamber_InnerRoom_EventScript_NoEffect', isGlobal: true, instrIndex: 24 },
  { name: 'SealedChamber_InnerRoom_EventScript_BrailleStoryPart1', isGlobal: true, instrIndex: 26 },
  { name: 'SealedChamber_InnerRoom_EventScript_BrailleStoryPart2', isGlobal: true, instrIndex: 30 },
  { name: 'SealedChamber_InnerRoom_EventScript_BrailleStoryPart3', isGlobal: true, instrIndex: 34 },
  { name: 'SealedChamber_InnerRoom_EventScript_BrailleStoryPart4', isGlobal: true, instrIndex: 38 },
  { name: 'SealedChamber_InnerRoom_EventScript_BrailleStoryPart5', isGlobal: true, instrIndex: 42 },
  { name: 'SealedChamber_InnerRoom_EventScript_BrailleStoryPart6', isGlobal: true, instrIndex: 46 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 50 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lockall",args:[]},
  {op:"braillemsgbox",args:["SealedChamber_InnerRoom_Braille_FirstWailordLastRelicanth"]},
  {op:"goto_if_set",args:["FLAG_REGI_DOORS_OPENED","SealedChamber_InnerRoom_EventScript_NoEffect"]},
  {op:"specialvar",args:["VAR_RESULT","CheckRelicanthWailord"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"SealedChamber_InnerRoom_EventScript_NoEffect"]},
  {op:"fadeoutbgm",args:[0]},
  {op:"playse",args:["SE_TRUCK_MOVE"]},
  {op:"special",args:["DoSealedChamberShakingEffect_Long"]},
  {op:"delay",args:[40]},
  {op:"special",args:["DoSealedChamberShakingEffect_Short"]},
  {op:"playse",args:["SE_DOOR"]},
  {op:"delay",args:[40]},
  {op:"special",args:["DoSealedChamberShakingEffect_Short"]},
  {op:"playse",args:["SE_DOOR"]},
  {op:"delay",args:[40]},
  {op:"special",args:["DoSealedChamberShakingEffect_Short"]},
  {op:"playse",args:["SE_DOOR"]},
  {op:"delay",args:[40]},
  {op:"msgbox",args:["gText_DoorOpenedFarAway","MSGBOX_DEFAULT"]},
  {op:"closemessage",args:[]},
  {op:"fadeinbgm",args:[0]},
  {op:"setflag",args:["FLAG_REGI_DOORS_OPENED"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"lockall",args:[]},
  {op:"braillemsgbox",args:["SealedChamber_InnerRoom_Braille_InThisCaveWeHaveLived"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"lockall",args:[]},
  {op:"braillemsgbox",args:["SealedChamber_InnerRoom_Braille_WeOweAllToThePokemon"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"lockall",args:[]},
  {op:"braillemsgbox",args:["SealedChamber_InnerRoom_Braille_ButWeSealedThePokemonAway"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"lockall",args:[]},
  {op:"braillemsgbox",args:["SealedChamber_InnerRoom_Braille_WeFearedIt"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"lockall",args:[]},
  {op:"braillemsgbox",args:["SealedChamber_InnerRoom_Braille_ThoseWithCourageHope"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"lockall",args:[]},
  {op:"braillemsgbox",args:["SealedChamber_InnerRoom_Braille_OpenDoorEternalPokemonWaits"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
] as const;
