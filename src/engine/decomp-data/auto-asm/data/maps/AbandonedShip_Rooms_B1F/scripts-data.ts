// AUTO-GENERATED from data/maps/AbandonedShip_Rooms_B1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/AbandonedShip_Rooms_B1F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'AbandonedShip_Rooms_B1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'AbandonedShip_Rooms_B1F_OnResume', isGlobal: false, instrIndex: 1 },
  { name: 'AbandonedShip_Rooms_B1F_EventScript_FatMan', isGlobal: true, instrIndex: 3 },
  { name: 'AbandonedShip_Rooms_B1F_Text_GettingQueasy', isGlobal: false, instrIndex: 5 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=4
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Hoooou…\\p\""] },
  { kind: '.string', vals: ["\"J'ai mal au cœur rien que d'être à bord\\n\""] },
  { kind: '.string', vals: ["\"de ce bateau…\\p\""] },
  { kind: '.string', vals: ["\"Ça ne bouge même pas, mais…$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 5 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","AbandonedShip_Rooms_B1F_OnResume"]},
  {op:"setdivewarp",args:["MAP_ABANDONED_SHIP_UNDERWATER2",17,4]},
  {op:"end",args:[]},
  {op:"msgbox",args:["AbandonedShip_Rooms_B1F_Text_GettingQueasy","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
