// AUTO-GENERATED from data/maps/AbandonedShip_Rooms2_B1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/AbandonedShip_Rooms2_B1F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'AbandonedShip_Rooms2_B1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'AbandonedShip_Rooms2_B1F_EventScript_Camper', isGlobal: true, instrIndex: 0 },
  { name: 'AbandonedShip_Rooms2_B1F_Text_PerfectPlaceToGoExploring', isGlobal: false, instrIndex: 2 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=4
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"C'est l'endroit idéal pour une petite\\n\""] },
  { kind: '.string', vals: ["\"exploration! C'est passionnant ici!\\p\""] },
  { kind: '.string', vals: ["\"Je parie qu'il y a de stupéfiants\\n\""] },
  { kind: '.string', vals: ["\"trésors à bord.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 2 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["AbandonedShip_Rooms2_B1F_Text_PerfectPlaceToGoExploring","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
