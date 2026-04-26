// AUTO-GENERATED from data/maps/SootopolisCity_House7/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SootopolisCity_House7/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SootopolisCity_House7_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SootopolisCity_House7_EventScript_OldMan', isGlobal: true, instrIndex: 0 },
  { name: 'SootopolisCity_House7_EventScript_PokefanF', isGlobal: true, instrIndex: 2 },
  { name: 'SootopolisCity_House7_Text_CityFromEruptedVolcano', isGlobal: false, instrIndex: 4 },
  { name: 'SootopolisCity_House7_Text_CaveMadeToKeepSomething', isGlobal: false, instrIndex: 4 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=11
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Un volcan immergé est entré en éruption\\n\""] },
  { kind: '.string', vals: ["\"et remonté des profondeurs marines.\\p\""] },
  { kind: '.string', vals: ["\"Son cratère a émergé de la mer et\\n\""] },
  { kind: '.string', vals: ["\"s'est rempli d'eau de pluie.\\p\""] },
  { kind: '.string', vals: ["\"C'est ainsi que la ville d'ATALANOPOLIS\\n\""] },
  { kind: '.string', vals: ["\"a été créée.$\""] },
  { kind: '.string', vals: ["\"La grotte qui relie ATALANOPOLIS au\\n\""] },
  { kind: '.string', vals: ["\"monde extérieur…\\p\""] },
  { kind: '.string', vals: ["\"C'est comme si elle avait été créée\\n\""] },
  { kind: '.string', vals: ["\"pour empêcher quelque chose de sortir.\\p\""] },
  { kind: '.string', vals: ["\"Ou s'agit-il juste de mon imagination?$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 4 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["SootopolisCity_House7_Text_CityFromEruptedVolcano","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["SootopolisCity_House7_Text_CaveMadeToKeepSomething","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
