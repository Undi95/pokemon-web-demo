// AUTO-GENERATED from data/maps/MeteorFalls_StevensCave/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MeteorFalls_StevensCave/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MeteorFalls_StevensCave_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MeteorFalls_StevensCave_EventScript_Steven', isGlobal: true, instrIndex: 0 },
  { name: 'MeteorFalls_StevensCave_EventScript_Defeated', isGlobal: true, instrIndex: 16 },
  { name: 'MeteorFalls_StevensCave_Text_ShouldKnowHowGoodIAmExpectWorst', isGlobal: false, instrIndex: 21 },
  { name: 'MeteorFalls_StevensCave_Text_StevenDefeat', isGlobal: false, instrIndex: 21 },
  { name: 'MeteorFalls_StevensCave_Text_MyPredictionCameTrue', isGlobal: false, instrIndex: 21 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=24
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"PIERRE: Oh, waouh, {PLAYER}{KUN}. Je suis\\n\""] },
  { kind: '.string', vals: ["\"surpris que tu aies su où me trouver.\\p\""] },
  { kind: '.string', vals: ["\"Est-ce que… tu me considères juste\\n\""] },
  { kind: '.string', vals: ["\"comme un maniaque du type ROCHE?\\p\""] },
  { kind: '.string', vals: ["\"Non, je ne pense pas…\\p\""] },
  { kind: '.string', vals: ["\"Nous nous sommes battus côte à côte\\n\""] },
  { kind: '.string', vals: ["\"au CENTRE SPATIAL d'ALGATIA.\\p\""] },
  { kind: '.string', vals: ["\"Tu dois savoir mieux que quiconque de\\n\""] },
  { kind: '.string', vals: ["\"quelle façon je me bats.\\p\""] },
  { kind: '.string', vals: ["\"OK, {PLAYER}{KUN}, si tu cherches un vrai défi,\\n\""] },
  { kind: '.string', vals: ["\"je suis ton homme!$\""] },
  { kind: '.string', vals: ["\"Toi… Je ne pensais pas que tu\\n\""] },
  { kind: '.string', vals: ["\"avais progressé à ce point…$\""] },
  { kind: '.string', vals: ["\"PIERRE: En y repensant, j'en avais eu la\\n\""] },
  { kind: '.string', vals: ["\"certitude lors de notre première\\p\""] },
  { kind: '.string', vals: ["\"rencontre à la GROTTE GRANITE\\n\""] },
  { kind: '.string', vals: ["\"du VILLAGE MYOKARA.\\p\""] },
  { kind: '.string', vals: ["\"Ma première impression est souvent la\\n\""] },
  { kind: '.string', vals: ["\"bonne.\\p\""] },
  { kind: '.string', vals: ["\"Et où veux-tu te rendre?\\p\""] },
  { kind: '.string', vals: ["\"… … … … … …\\n\""] },
  { kind: '.string', vals: ["\"… … … … … …\\p\""] },
  { kind: '.string', vals: ["\"Pfiuu, même moi, je n'aurais pas\\n\""] },
  { kind: '.string', vals: ["\"pu deviner ça.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 21 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"goto_if_set",args:["FLAG_DEFEATED_METEOR_FALLS_STEVEN","MeteorFalls_StevensCave_EventScript_Defeated"]},
  {op:"waitse",args:[]},
  {op:"playse",args:["SE_PIN"]},
  {op:"applymovement",args:["LOCALID_METEOR_FALLS_STEVEN","Common_Movement_ExclamationMark"]},
  {op:"waitmovement",args:[0]},
  {op:"applymovement",args:["LOCALID_METEOR_FALLS_STEVEN","Common_Movement_Delay48"]},
  {op:"waitmovement",args:[0]},
  {op:"applymovement",args:["LOCALID_METEOR_FALLS_STEVEN","Common_Movement_FacePlayer"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["MeteorFalls_StevensCave_Text_ShouldKnowHowGoodIAmExpectWorst","MSGBOX_DEFAULT"]},
  {op:"trainerbattle_no_intro",args:["TRAINER_STEVEN","MeteorFalls_StevensCave_Text_StevenDefeat"]},
  {op:"msgbox",args:["MeteorFalls_StevensCave_Text_MyPredictionCameTrue","MSGBOX_DEFAULT"]},
  {op:"setflag",args:["FLAG_DEFEATED_METEOR_FALLS_STEVEN"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"applymovement",args:["LOCALID_METEOR_FALLS_STEVEN","Common_Movement_FacePlayer"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["MeteorFalls_StevensCave_Text_MyPredictionCameTrue","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
