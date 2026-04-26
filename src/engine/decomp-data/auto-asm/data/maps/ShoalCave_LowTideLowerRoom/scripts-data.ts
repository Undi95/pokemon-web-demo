// AUTO-GENERATED from data/maps/ShoalCave_LowTideLowerRoom/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/ShoalCave_LowTideLowerRoom/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'ShoalCave_LowTideLowerRoom_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'ShoalCave_LowTideLowerRoom_OnLoad', isGlobal: false, instrIndex: 1 },
  { name: 'ShoalCave_LowTideLowerRoom_EventScript_SetShoalItemMetatiles', isGlobal: true, instrIndex: 3 },
  { name: 'ShoalCave_LowTideLowerRoom_EventScript_SetShoalItemMetatilesEnd', isGlobal: true, instrIndex: 6 },
  { name: 'ShoalCave_LowTideLowerRoom_EventScript_ShoalSalt4', isGlobal: true, instrIndex: 7 },
  { name: 'ShoalCave_LowTideLowerRoom_EventScript_ReceivedShoalSalt', isGlobal: true, instrIndex: 16 },
  { name: 'ShoalCave_LowTideLowerRoom_EventScript_BlackBelt', isGlobal: true, instrIndex: 19 },
  { name: 'ShoalCave_LowTideLowerRoom_EventScript_ReceivedFocusBand', isGlobal: true, instrIndex: 28 },
  { name: 'ShoalCave_LowTideLowerRoom_Text_CanOvercomeColdWithFocus', isGlobal: false, instrIndex: 31 },
  { name: 'ShoalCave_LowTideLowerRoom_Text_EverythingStartsWithFocus', isGlobal: false, instrIndex: 31 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=7
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Ce froid pénétrant dans les alentours\\n\""] },
  { kind: '.string', vals: ["\"est un obstacle à l'entraînement.\\p\""] },
  { kind: '.string', vals: ["\"Mais avec un peu de concentration,\\n\""] },
  { kind: '.string', vals: ["\"on peut le vaincre!\\p\""] },
  { kind: '.string', vals: ["\"Avec ce BANDEAU, tu t'y mets\\n\""] },
  { kind: '.string', vals: ["\"et tu résistes au froid!$\""] },
  { kind: '.string', vals: ["\"Tout vient de la concentration!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 31 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_LOAD","ShoalCave_LowTideLowerRoom_OnLoad"]},
  {op:"call",args:["ShoalCave_LowTideLowerRoom_EventScript_SetShoalItemMetatiles"]},
  {op:"end",args:[]},
  {op:"goto_if_set",args:["FLAG_RECEIVED_SHOAL_SALT_4","ShoalCave_LowTideLowerRoom_EventScript_SetShoalItemMetatilesEnd"]},
  {op:"setmetatile",args:[18,2,"METATILE_Cave_ShoalCave_DirtPile_Large",1]},
  {op:"return",args:[]},
  {op:"return",args:[]},
  {op:"lockall",args:[]},
  {op:"goto_if_set",args:["FLAG_RECEIVED_SHOAL_SALT_4","ShoalCave_LowTideLowerRoom_EventScript_ReceivedShoalSalt"]},
  {op:"giveitem",args:["ITEM_SHOAL_SALT"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"Common_EventScript_ShowBagIsFull"]},
  {op:"setmetatile",args:[18,2,"METATILE_Cave_ShoalCave_DirtPile_Small",0]},
  {op:"special",args:["DrawWholeMapView"]},
  {op:"setflag",args:["FLAG_RECEIVED_SHOAL_SALT_4"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["ShoalCave_Text_WasShoalSaltNowNothing","MSGBOX_DEFAULT"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_RECEIVED_FOCUS_BAND","ShoalCave_LowTideLowerRoom_EventScript_ReceivedFocusBand"]},
  {op:"msgbox",args:["ShoalCave_LowTideLowerRoom_Text_CanOvercomeColdWithFocus","MSGBOX_DEFAULT"]},
  {op:"giveitem",args:["ITEM_FOCUS_BAND"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"Common_EventScript_ShowBagIsFull"]},
  {op:"setflag",args:["FLAG_RECEIVED_FOCUS_BAND"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["ShoalCave_LowTideLowerRoom_Text_EverythingStartsWithFocus","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
