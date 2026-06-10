// AUTO-GENERATED from data/maps/ShoalCave_LowTideStairsRoom/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/ShoalCave_LowTideStairsRoom/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'ShoalCave_LowTideStairsRoom_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'ShoalCave_LowTideStairsRoom_OnLoad', isGlobal: false, instrIndex: 1 },
  { name: 'ShoalCave_LowTideStairsRoom_EventScript_SetShoalItemMetatiles', isGlobal: true, instrIndex: 3 },
  { name: 'ShoalCave_LowTideStairsRoom_EventScript_SetShoalItemMetatilesEnd', isGlobal: true, instrIndex: 6 },
  { name: 'ShoalCave_LowTideStairsRoom_EventScript_ShoalSalt3', isGlobal: true, instrIndex: 7 },
  { name: 'ShoalCave_LowTideStairsRoom_EventScript_ReceivedShoalSalt', isGlobal: true, instrIndex: 16 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 19 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_LOAD","ShoalCave_LowTideStairsRoom_OnLoad"]},
  {op:"call",args:["ShoalCave_LowTideStairsRoom_EventScript_SetShoalItemMetatiles"]},
  {op:"end",args:[]},
  {op:"goto_if_set",args:["FLAG_RECEIVED_SHOAL_SALT_3","ShoalCave_LowTideStairsRoom_EventScript_SetShoalItemMetatilesEnd"]},
  {op:"setmetatile",args:[11,11,"METATILE_Cave_ShoalCave_DirtPile_Large",1]},
  {op:"return",args:[]},
  {op:"return",args:[]},
  {op:"lockall",args:[]},
  {op:"goto_if_set",args:["FLAG_RECEIVED_SHOAL_SALT_3","ShoalCave_LowTideStairsRoom_EventScript_ReceivedShoalSalt"]},
  {op:"giveitem",args:["ITEM_SHOAL_SALT"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"Common_EventScript_ShowBagIsFull"]},
  {op:"setmetatile",args:[11,11,"METATILE_Cave_ShoalCave_DirtPile_Small",0]},
  {op:"special",args:["DrawWholeMapView"]},
  {op:"setflag",args:["FLAG_RECEIVED_SHOAL_SALT_3"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["ShoalCave_Text_WasShoalSaltNowNothing","MSGBOX_DEFAULT"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
] as const;
