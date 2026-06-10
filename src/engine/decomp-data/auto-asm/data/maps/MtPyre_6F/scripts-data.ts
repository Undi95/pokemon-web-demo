// AUTO-GENERATED from data/maps/MtPyre_6F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MtPyre_6F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MtPyre_6F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MtPyre_6F_EventScript_Valerie', isGlobal: true, instrIndex: 0 },
  { name: 'MtPyre_6F_EventScript_RegisterValerie', isGlobal: true, instrIndex: 6 },
  { name: 'MtPyre_6F_EventScript_RematchValerie', isGlobal: true, instrIndex: 12 },
  { name: 'MtPyre_6F_EventScript_Cedric', isGlobal: true, instrIndex: 15 },
  { name: 'MtPyre_6F_Text_ValerieIntro', isGlobal: false, instrIndex: 18 },
  { name: 'MtPyre_6F_Text_ValerieDefeat', isGlobal: false, instrIndex: 18 },
  { name: 'MtPyre_6F_Text_ValeriePostBattle', isGlobal: false, instrIndex: 18 },
  { name: 'MtPyre_6F_Text_ValerieRegister', isGlobal: false, instrIndex: 18 },
  { name: 'MtPyre_6F_Text_ValerieRematchIntro', isGlobal: false, instrIndex: 18 },
  { name: 'MtPyre_6F_Text_ValerieRematchDefeat', isGlobal: false, instrIndex: 18 },
  { name: 'MtPyre_6F_Text_ValeriePostRematch', isGlobal: false, instrIndex: 18 },
  { name: 'MtPyre_6F_Text_CedricIntro', isGlobal: false, instrIndex: 18 },
  { name: 'MtPyre_6F_Text_CedricDefeat', isGlobal: false, instrIndex: 18 },
  { name: 'MtPyre_6F_Text_CedricPostBattle', isGlobal: false, instrIndex: 18 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=21
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Quand je suis ici…\\n\""] },
  { kind: '.string', vals: ["\"Un étrange pouvoir s'empare de moi…$\""] },
  { kind: '.string', vals: ["\"Le pouvoir s'affaiblit…$\""] },
  { kind: '.string', vals: ["\"Ce pouvoir vient peut-être des esprits\\n\""] },
  { kind: '.string', vals: ["\"errants des POKéMON qui reposent ici…$\""] },
  { kind: '.string', vals: ["\"… J'ai perdu ce match, mais…\\n\""] },
  { kind: '.string', vals: ["\"J'ai ce petit don en moi…\\p\""] },
  { kind: '.string', vals: ["\"Et sans même poser les mains\\n\""] },
  { kind: '.string', vals: ["\"sur ton POKéNAV…$\""] },
  { kind: '.string', vals: ["\"Derrière toi…\\n\""] },
  { kind: '.string', vals: ["\"Qu'est-ce que c'est…$\""] },
  { kind: '.string', vals: ["\"Quelque chose a disparu…$\""] },
  { kind: '.string', vals: ["\"Les POKéMON qui reposent ici…\\n\""] },
  { kind: '.string', vals: ["\"Parfois, ils s'amusent…$\""] },
  { kind: '.string', vals: ["\"Est-ce que tu as perdu ton chemin?\\n\""] },
  { kind: '.string', vals: ["\"Ne t'inquiète pas, je suis là!$\""] },
  { kind: '.string', vals: ["\"Tu n'avais pas perdu ton chemin?$\""] },
  { kind: '.string', vals: ["\"Je pensais qu'un DRESSEUR perdu\\n\""] },
  { kind: '.string', vals: ["\"serait plus facile à battre.\\p\""] },
  { kind: '.string', vals: ["\"Je m'étais trompé et je ne\\n\""] },
  { kind: '.string', vals: ["\"recommencerai plus…$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 18 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"trainerbattle_single",args:["TRAINER_VALERIE_1","MtPyre_6F_Text_ValerieIntro","MtPyre_6F_Text_ValerieDefeat","MtPyre_6F_EventScript_RegisterValerie"]},
  {op:"specialvar",args:["VAR_RESULT","ShouldTryRematchBattle"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"MtPyre_6F_EventScript_RematchValerie"]},
  {op:"msgbox",args:["MtPyre_6F_Text_ValeriePostBattle","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"special",args:["PlayerFaceTrainerAfterBattle"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["MtPyre_6F_Text_ValerieRegister","MSGBOX_DEFAULT"]},
  {op:"register_matchcall",args:["TRAINER_VALERIE_1"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"trainerbattle_rematch",args:["TRAINER_VALERIE_1","MtPyre_6F_Text_ValerieRematchIntro","MtPyre_6F_Text_ValerieRematchDefeat"]},
  {op:"msgbox",args:["MtPyre_6F_Text_ValeriePostRematch","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_CEDRIC","MtPyre_6F_Text_CedricIntro","MtPyre_6F_Text_CedricDefeat"]},
  {op:"msgbox",args:["MtPyre_6F_Text_CedricPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
