// AUTO-GENERATED from data/maps/PacifidlogTown_House5/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/PacifidlogTown_House5/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'PacifidlogTown_House5_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'PacifidlogTown_House5_EventScript_MirageIslandWatcher', isGlobal: true, instrIndex: 0 },
  { name: 'PacifidlogTown_House5_EventScript_MirageIslandPresent', isGlobal: true, instrIndex: 7 },
  { name: 'PacifidlogTown_House5_EventScript_Gentleman', isGlobal: true, instrIndex: 10 },
  { name: 'PacifidlogTown_House5_Text_CantSeeMirageIslandToday', isGlobal: false, instrIndex: 12 },
  { name: 'PacifidlogTown_House5_Text_CanSeeMirageIslandToday', isGlobal: false, instrIndex: 12 },
  { name: 'PacifidlogTown_House5_Text_MirageIslandAppearDependingOnWeather', isGlobal: false, instrIndex: 12 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=9
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Je n'vois pas l'ILE MIRAGE aujourd'hui…$\""] },
  { kind: '.string', vals: ["\"Oh! Oh mon Dieu! On peut voir\\n\""] },
  { kind: '.string', vals: ["\"l'ILE MIRAGE aujourd'hui!$\""] },
  { kind: '.string', vals: ["\"ILE MIRAGE…\\p\""] },
  { kind: '.string', vals: ["\"Elle devient probablement visible ou\\n\""] },
  { kind: '.string', vals: ["\"invisible en fonction du climat…\\l\""] },
  { kind: '.string', vals: ["\"Parfois, on peut voir le mirage.\\p\""] },
  { kind: '.string', vals: ["\"Ou peut-être apparaît-elle ou\\n\""] },
  { kind: '.string', vals: ["\"disparaît-elle pour de bon?$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 12 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"specialvar",args:["VAR_RESULT","IsMirageIslandPresent"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"PacifidlogTown_House5_EventScript_MirageIslandPresent"]},
  {op:"msgbox",args:["PacifidlogTown_House5_Text_CantSeeMirageIslandToday","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["PacifidlogTown_House5_Text_CanSeeMirageIslandToday","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["PacifidlogTown_House5_Text_MirageIslandAppearDependingOnWeather","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
