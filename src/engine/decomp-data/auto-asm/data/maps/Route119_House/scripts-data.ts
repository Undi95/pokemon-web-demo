// AUTO-GENERATED from data/maps/Route119_House/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route119_House/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route119_House_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route119_House_EventScript_Woman', isGlobal: true, instrIndex: 0 },
  { name: 'Route119_House_EventScript_Wingull', isGlobal: true, instrIndex: 2 },
  { name: 'Route119_House_Text_RumorAboutCaveOfOrigin', isGlobal: false, instrIndex: 10 },
  { name: 'Route119_House_Text_Wingull', isGlobal: false, instrIndex: 10 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=6
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"J'ai entendu parler d'une grotte\\n\""] },
  { kind: '.string', vals: ["\"appelée la GROTTE ORIGINE.\\p\""] },
  { kind: '.string', vals: ["\"Les gens racontent que les esprits des\\n\""] },
  { kind: '.string', vals: ["\"POKéMON y sont ranimés.\\p\""] },
  { kind: '.string', vals: ["\"C'est possible, une chose pareille?$\""] },
  { kind: '.string', vals: ["\"GOELISE: Liiise?$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 10 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["Route119_House_Text_RumorAboutCaveOfOrigin","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"waitse",args:[]},
  {op:"playmoncry",args:["SPECIES_WINGULL","CRY_MODE_NORMAL"]},
  {op:"msgbox",args:["Route119_House_Text_Wingull","MSGBOX_DEFAULT"]},
  {op:"waitmoncry",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
