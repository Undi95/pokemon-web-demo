// AUTO-GENERATED from data/maps/RustboroCity_CuttersHouse/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/RustboroCity_CuttersHouse/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'RustboroCity_CuttersHouse_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'RustboroCity_CuttersHouse_EventScript_Cutter', isGlobal: true, instrIndex: 0 },
  { name: 'RustboroCity_CuttersHouse_EventScript_ExplainCut', isGlobal: true, instrIndex: 9 },
  { name: 'RustboroCity_CuttersHouse_EventScript_Lass', isGlobal: true, instrIndex: 12 },
  { name: 'RustboroCity_CuttersHouse_Text_YouCanPutThisHMToGoodUse', isGlobal: false, instrIndex: 14 },
  { name: 'RustboroCity_CuttersHouse_Text_ExplainCut', isGlobal: false, instrIndex: 14 },
  { name: 'RustboroCity_CuttersHouse_Text_DadHelpedClearLandOfTrees', isGlobal: false, instrIndex: 14 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=22
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Ton air déterminé…\\n\""] },
  { kind: '.string', vals: ["\"La souplesse de tes mouvements…\\p\""] },
  { kind: '.string', vals: ["\"Tes POKéMON bien entraînés…\\n\""] },
  { kind: '.string', vals: ["\"Tu es à l'évidence un DRESSEUR averti!\\p\""] },
  { kind: '.string', vals: ["\"Non, attends, ne dis rien!\\n\""] },
  { kind: '.string', vals: ["\"Je devine tout rien qu'à te voir.\\p\""] },
  { kind: '.string', vals: ["\"Je suis sûr que tu seras capable\\n\""] },
  { kind: '.string', vals: ["\"de faire bon usage de cette CS.\\p\""] },
  { kind: '.string', vals: ["\"Ne sois pas modeste ni timide!\\n\""] },
  { kind: '.string', vals: ["\"Allez, prends-la!$\""] },
  { kind: '.string', vals: ["\"Cette CS, c'est COUPE.\\p\""] },
  { kind: '.string', vals: ["\"Une CS, c'est une capacité qui peut être\\n\""] },
  { kind: '.string', vals: ["\"utilisée en dehors d'un combat.\\p\""] },
  { kind: '.string', vals: ["\"Tout POKéMON ayant appris COUPE peut\\n\""] },
  { kind: '.string', vals: ["\"abattre les petits arbres si son\\l\""] },
  { kind: '.string', vals: ["\"DRESSEUR possède le BADGE ROCHE.\\p\""] },
  { kind: '.string', vals: ["\"Et contrairement à une CT, une CS peut\\n\""] },
  { kind: '.string', vals: ["\"s'utiliser plusieurs fois.$\""] },
  { kind: '.string', vals: ["\"Quand ils ont agrandi MEROUVILLE,\\n\""] },
  { kind: '.string', vals: ["\"mon papa les a aidés.\\p\""] },
  { kind: '.string', vals: ["\"Il a fait utiliser COUPE à son POKéMON\\n\""] },
  { kind: '.string', vals: ["\"pour qu'il déboise le terrain.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 14 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_RECEIVED_HM_CUT","RustboroCity_CuttersHouse_EventScript_ExplainCut"]},
  {op:"msgbox",args:["RustboroCity_CuttersHouse_Text_YouCanPutThisHMToGoodUse","MSGBOX_DEFAULT"]},
  {op:"giveitem",args:["ITEM_HM_CUT"]},
  {op:"setflag",args:["FLAG_RECEIVED_HM_CUT"]},
  {op:"msgbox",args:["RustboroCity_CuttersHouse_Text_ExplainCut","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["RustboroCity_CuttersHouse_Text_ExplainCut","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["RustboroCity_CuttersHouse_Text_DadHelpedClearLandOfTrees","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
