// AUTO-GENERATED from data/maps/MtPyre_4F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MtPyre_4F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MtPyre_4F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MtPyre_5F_EventScript_Atsushi', isGlobal: true, instrIndex: 0 },
  { name: 'MtPyre_5F_Text_AtsushiIntro', isGlobal: false, instrIndex: 3 },
  { name: 'MtPyre_5F_Text_AtsushiDefeat', isGlobal: false, instrIndex: 3 },
  { name: 'MtPyre_5F_Text_AtsushiPostBattle', isGlobal: false, instrIndex: 3 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=6
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Professeur…\\n\""] },
  { kind: '.string', vals: ["\"Regardez les progrès que j'ai faits!$\""] },
  { kind: '.string', vals: ["\"Professeur…\\n\""] },
  { kind: '.string', vals: ["\"Pardonnez-moi!$\""] },
  { kind: '.string', vals: ["\"Mon prof, qui repose ici, ne trouvera\\n\""] },
  { kind: '.string', vals: ["\"la paix que lorsque j'aurai progressé…$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 3 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"trainerbattle_single",args:["TRAINER_ATSUSHI","MtPyre_5F_Text_AtsushiIntro","MtPyre_5F_Text_AtsushiDefeat"]},
  {op:"msgbox",args:["MtPyre_5F_Text_AtsushiPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
