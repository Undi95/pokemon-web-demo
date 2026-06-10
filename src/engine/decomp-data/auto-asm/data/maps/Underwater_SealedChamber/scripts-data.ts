// AUTO-GENERATED from data/maps/Underwater_SealedChamber/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Underwater_SealedChamber/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Underwater_SealedChamber_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Underwater_SealedChamber_OnDive', isGlobal: false, instrIndex: 1 },
  { name: 'Underwater_SealedChamber_EventScript_SurfaceRoute134', isGlobal: true, instrIndex: 5 },
  { name: 'Underwater_SealedChamber_EventScript_SurfaceSealedChamber', isGlobal: true, instrIndex: 7 },
  { name: 'Underwater_SealedChamber_EventScript_Braille', isGlobal: true, instrIndex: 9 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 13 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_DIVE_WARP","Underwater_SealedChamber_OnDive"]},
  {op:"getplayerxy",args:["VAR_0x8004","VAR_0x8005"]},
  {op:"goto_if_ne",args:["VAR_0x8004",12,"Underwater_SealedChamber_EventScript_SurfaceRoute134"]},
  {op:"goto_if_ne",args:["VAR_0x8005",44,"Underwater_SealedChamber_EventScript_SurfaceRoute134"]},
  {op:"goto",args:["Underwater_SealedChamber_EventScript_SurfaceSealedChamber"]},
  {op:"setdivewarp",args:["MAP_ROUTE134",60,31]},
  {op:"end",args:[]},
  {op:"setdivewarp",args:["MAP_SEALED_CHAMBER_OUTER_ROOM",10,19]},
  {op:"end",args:[]},
  {op:"lockall",args:[]},
  {op:"braillemsgbox",args:["Underwater_SealedChamber_Braille_GoUpHere"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
] as const;
