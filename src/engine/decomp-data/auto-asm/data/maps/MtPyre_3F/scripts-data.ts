// AUTO-GENERATED from data/maps/MtPyre_3F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MtPyre_3F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MtPyre_3F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MtPyre_3F_EventScript_William', isGlobal: true, instrIndex: 0 },
  { name: 'MtPyre_3F_EventScript_Kayla', isGlobal: true, instrIndex: 3 },
  { name: 'MtPyre_3F_EventScript_Gabrielle', isGlobal: true, instrIndex: 6 },
  { name: 'MtPyre_3F_EventScript_RegisterGabrielle', isGlobal: true, instrIndex: 12 },
  { name: 'MtPyre_3F_EventScript_RematchGabrielle', isGlobal: true, instrIndex: 18 },
  { name: 'MtPyre_3F_Text_WilliamIntro', isGlobal: false, instrIndex: 21 },
  { name: 'MtPyre_3F_Text_WilliamDefeat', isGlobal: false, instrIndex: 21 },
  { name: 'MtPyre_3F_Text_WilliamPostBattle', isGlobal: false, instrIndex: 21 },
  { name: 'MtPyre_3F_Text_KaylaIntro', isGlobal: false, instrIndex: 21 },
  { name: 'MtPyre_3F_Text_KaylaDefeat', isGlobal: false, instrIndex: 21 },
  { name: 'MtPyre_3F_Text_KaylaPostBattle', isGlobal: false, instrIndex: 21 },
  { name: 'MtPyre_3F_Text_GabrielleIntro', isGlobal: false, instrIndex: 21 },
  { name: 'MtPyre_3F_Text_GabrielleDefeat', isGlobal: false, instrIndex: 21 },
  { name: 'MtPyre_3F_Text_GabriellePostBattle', isGlobal: false, instrIndex: 21 },
  { name: 'MtPyre_3F_Text_GabrielleRegister', isGlobal: false, instrIndex: 21 },
  { name: 'MtPyre_3F_Text_GabrielleRematchIntro', isGlobal: false, instrIndex: 21 },
  { name: 'MtPyre_3F_Text_GabrielleRematchDefeat', isGlobal: false, instrIndex: 21 },
  { name: 'MtPyre_3F_Text_GabriellePostRematch', isGlobal: false, instrIndex: 21 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=42
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"L'air pur de la montagne a augmenté\\n\""] },
  { kind: '.string', vals: ["\"mon pouvoir psychique!\\p\""] },
  { kind: '.string', vals: ["\"Un p'tit mioche comme toi…\\n\""] },
  { kind: '.string', vals: ["\"Tu rêves de gagner?$\""] },
  { kind: '.string', vals: ["\"J'ai honte de moi…$\""] },
  { kind: '.string', vals: ["\"Mes pouvoirs psychiques se sont sans\\n\""] },
  { kind: '.string', vals: ["\"aucun doute accrus, mais…$\""] },
  { kind: '.string', vals: ["\"Ah ah ah ah!\\p\""] },
  { kind: '.string', vals: ["\"C'est pas un endroit pour les mômes,\\n\""] },
  { kind: '.string', vals: ["\"encore moins pour toi!$\""] },
  { kind: '.string', vals: ["\"Il est clair que j'ai perdu…$\""] },
  { kind: '.string', vals: ["\"Ça veut dire que mon entraînement\\n\""] },
  { kind: '.string', vals: ["\"n'est pas encore suffisant…\\p\""] },
  { kind: '.string', vals: ["\"Il faut que je continue à travailler\\n\""] },
  { kind: '.string', vals: ["\"pour arriver au plus haut niveau…\\p\""] },
  { kind: '.string', vals: ["\"Allez! Je suis motivée!$\""] },
  { kind: '.string', vals: ["\"Qu'est-ce que tu viens faire ici?$\""] },
  { kind: '.string', vals: ["\"C'était époustouflant!\\n\""] },
  { kind: '.string', vals: ["\"Tu es un DRESSEUR d'exception!$\""] },
  { kind: '.string', vals: ["\"Les POKéMON qui ne sont plus de\\n\""] },
  { kind: '.string', vals: ["\"ce monde…\\l\""] },
  { kind: '.string', vals: ["\"Les POKéMON à tes côtés maintenant…\\p\""] },
  { kind: '.string', vals: ["\"Et les POKéMON que tu rencontreras\\n\""] },
  { kind: '.string', vals: ["\"dans le futur…\\p\""] },
  { kind: '.string', vals: ["\"Ils méritent tous d'être aimés de la\\n\""] },
  { kind: '.string', vals: ["\"même façon. Ne l'oublie pas!$\""] },
  { kind: '.string', vals: ["\"J'aimerais revoir tes POKéMON quand\\n\""] },
  { kind: '.string', vals: ["\"ils auront plus d'expérience…\\p\""] },
  { kind: '.string', vals: ["\"Laisse-moi voir ton POKéNAV.$\""] },
  { kind: '.string', vals: ["\"Oh, c'est toi…\\p\""] },
  { kind: '.string', vals: ["\"Tu es là pour me montrer comme tes\\n\""] },
  { kind: '.string', vals: ["\"POKéMON ont progressé?$\""] },
  { kind: '.string', vals: ["\"Incroyable! Je suis vraiment heureuse\\n\""] },
  { kind: '.string', vals: ["\"de connaître quelqu'un comme toi!$\""] },
  { kind: '.string', vals: ["\"Les POKéMON qui ne sont plus de\\n\""] },
  { kind: '.string', vals: ["\"ce monde…\\l\""] },
  { kind: '.string', vals: ["\"Les POKéMON à tes côtés maintenant…\\p\""] },
  { kind: '.string', vals: ["\"Et les POKéMON que tu rencontreras\\n\""] },
  { kind: '.string', vals: ["\"dans le futur…\\p\""] },
  { kind: '.string', vals: ["\"Ils méritent tous d'être aimés de la\\n\""] },
  { kind: '.string', vals: ["\"même façon. Je vois que tu n'as\\l\""] },
  { kind: '.string', vals: ["\"pas oublié!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 21 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"trainerbattle_single",args:["TRAINER_WILLIAM","MtPyre_3F_Text_WilliamIntro","MtPyre_3F_Text_WilliamDefeat"]},
  {op:"msgbox",args:["MtPyre_3F_Text_WilliamPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_KAYLA","MtPyre_3F_Text_KaylaIntro","MtPyre_3F_Text_KaylaDefeat"]},
  {op:"msgbox",args:["MtPyre_3F_Text_KaylaPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_GABRIELLE_1","MtPyre_3F_Text_GabrielleIntro","MtPyre_3F_Text_GabrielleDefeat","MtPyre_3F_EventScript_RegisterGabrielle"]},
  {op:"specialvar",args:["VAR_RESULT","ShouldTryRematchBattle"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"MtPyre_3F_EventScript_RematchGabrielle"]},
  {op:"msgbox",args:["MtPyre_3F_Text_GabriellePostBattle","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"special",args:["PlayerFaceTrainerAfterBattle"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["MtPyre_3F_Text_GabrielleRegister","MSGBOX_DEFAULT"]},
  {op:"register_matchcall",args:["TRAINER_GABRIELLE_1"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"trainerbattle_rematch",args:["TRAINER_GABRIELLE_1","MtPyre_3F_Text_GabrielleRematchIntro","MtPyre_3F_Text_GabrielleRematchDefeat"]},
  {op:"msgbox",args:["MtPyre_3F_Text_GabriellePostRematch","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
