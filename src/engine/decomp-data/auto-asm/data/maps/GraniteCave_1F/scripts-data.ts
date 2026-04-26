// AUTO-GENERATED from data/maps/GraniteCave_1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/GraniteCave_1F/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'GraniteCave_1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'GraniteCave_1F_EventScript_Hiker', isGlobal: true, instrIndex: 0 },
  { name: 'GraniteCave_1F_EventScript_ReceivedFlash', isGlobal: true, instrIndex: 9 },
  { name: 'GraniteCave_1F_Text_GetsDarkAheadHereYouGo', isGlobal: false, instrIndex: 12 },
  { name: 'GraniteCave_1F_Text_ExplainFlash', isGlobal: false, instrIndex: 12 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=16
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Hé, toi!\\n\""] },
  { kind: '.string', vals: ["\"Il fait terriblement sombre là-dedans.\\l\""] },
  { kind: '.string', vals: ["\"Ça va être difficile à explorer.\\p\""] },
  { kind: '.string', vals: ["\"Ce type qui est passé tout à l'heure…\\n\""] },
  { kind: '.string', vals: ["\"PIERRE, je crois que c'était ça.\\p\""] },
  { kind: '.string', vals: ["\"Il savait utiliser FLASH, alors il n'a pas\\n\""] },
  { kind: '.string', vals: ["\"dû avoir de problème, mais…\\p\""] },
  { kind: '.string', vals: ["\"Pour nous, les MONTAGNARDS, la devise\\n\""] },
  { kind: '.string', vals: ["\"est d'aider ceux que l'on rencontre.\\p\""] },
  { kind: '.string', vals: ["\"Vas-y et bon courage!$\""] },
  { kind: '.string', vals: ["\"Apprends cette CS FLASH\\n\""] },
  { kind: '.string', vals: ["\"à un POKéMON et utilise-la.\\p\""] },
  { kind: '.string', vals: ["\"Ça permet d'éclairer même les cavernes\\n\""] },
  { kind: '.string', vals: ["\"les plus sombres.\\p\""] },
  { kind: '.string', vals: ["\"Mais pour l'utiliser, il faut le BADGE\\n\""] },
  { kind: '.string', vals: ["\"de l'ARENE POKéMON de MYOKARA.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 12 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_RECEIVED_HM_FLASH","GraniteCave_1F_EventScript_ReceivedFlash"]},
  {op:"msgbox",args:["GraniteCave_1F_Text_GetsDarkAheadHereYouGo","MSGBOX_DEFAULT"]},
  {op:"giveitem",args:["ITEM_HM_FLASH"]},
  {op:"setflag",args:["FLAG_RECEIVED_HM_FLASH"]},
  {op:"msgbox",args:["GraniteCave_1F_Text_ExplainFlash","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["GraniteCave_1F_Text_ExplainFlash","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
