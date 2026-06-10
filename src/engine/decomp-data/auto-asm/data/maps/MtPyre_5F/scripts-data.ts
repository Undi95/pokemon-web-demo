// AUTO-GENERATED from data/maps/MtPyre_5F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MtPyre_5F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MtPyre_5F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MtPyre_4F_EventScript_Tasha', isGlobal: true, instrIndex: 0 },
  { name: 'MtPyre_4F_Text_TashaIntro', isGlobal: false, instrIndex: 3 },
  { name: 'MtPyre_4F_Text_TashaDefeat', isGlobal: false, instrIndex: 3 },
  { name: 'MtPyre_4F_Text_TashaPostBattle', isGlobal: false, instrIndex: 3 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=9
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"J'aime tout ce qui fait peur…\\n\""] },
  { kind: '.string', vals: ["\"C'est comme une maladie…\\p\""] },
  { kind: '.string', vals: ["\"Quand je suis ici…\\n\""] },
  { kind: '.string', vals: ["\"Je tremble de peur…$\""] },
  { kind: '.string', vals: ["\"Perdre, je déteste ça…$\""] },
  { kind: '.string', vals: ["\"Je veux voir des choses atroces…\\n\""] },
  { kind: '.string', vals: ["\"Je ne peux pas partir…\\p\""] },
  { kind: '.string', vals: ["\"Reste…\\n\""] },
  { kind: '.string', vals: ["\"Tu ne vas pas rester avec moi?$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 3 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"trainerbattle_single",args:["TRAINER_TASHA","MtPyre_4F_Text_TashaIntro","MtPyre_4F_Text_TashaDefeat"]},
  {op:"msgbox",args:["MtPyre_4F_Text_TashaPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
