// AUTO-GENERATED from data/maps/SSTidalLowerDeck/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SSTidalLowerDeck/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SSTidalLowerDeck_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SSTidalLowerDeck_EventScript_Phillip', isGlobal: true, instrIndex: 0 },
  { name: 'SSTidalLowerDeck_EventScript_Leonard', isGlobal: true, instrIndex: 3 },
  { name: 'SSTidalLowerDeck_Text_PhillipIntro', isGlobal: false, instrIndex: 6 },
  { name: 'SSTidalLowerDeck_Text_PhillipDefeat', isGlobal: false, instrIndex: 6 },
  { name: 'SSTidalLowerDeck_Text_PhillipPostBattle', isGlobal: false, instrIndex: 6 },
  { name: 'SSTidalLowerDeck_Text_LeonardIntro', isGlobal: false, instrIndex: 6 },
  { name: 'SSTidalLowerDeck_Text_LeonardDefeat', isGlobal: false, instrIndex: 6 },
  { name: 'SSTidalLowerDeck_Text_LeonardPostBattle', isGlobal: false, instrIndex: 6 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=16
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Arrrg! J'en ai plein le dos de nettoyer\\n\""] },
  { kind: '.string', vals: ["\"cet endroit gigantesque!\\p\""] },
  { kind: '.string', vals: ["\"C'est l'heure de la pause,\\n\""] },
  { kind: '.string', vals: ["\"battons-nous!$\""] },
  { kind: '.string', vals: ["\"Hé, p'tit frère, j'ai perdu!$\""] },
  { kind: '.string', vals: ["\"Nous sommes les FRERES PROPRETE!\\p\""] },
  { kind: '.string', vals: ["\"L'aîné répand le détergent et le\\n\""] },
  { kind: '.string', vals: ["\"benjamin frotte!$\""] },
  { kind: '.string', vals: ["\"Nous sommes dans la cale du navire.\\n\""] },
  { kind: '.string', vals: ["\"Il y a beaucoup de place.\\l\""] },
  { kind: '.string', vals: ["\"Profitons-en pour faire un combat\\l\""] },
  { kind: '.string', vals: ["\"de POKéMON.$\""] },
  { kind: '.string', vals: ["\"Hé, grand frère, j'ai perdu!$\""] },
  { kind: '.string', vals: ["\"Nous sommes les FRERES PROPRETE!\\p\""] },
  { kind: '.string', vals: ["\"L'aîné répand le détergent et le\\n\""] },
  { kind: '.string', vals: ["\"benjamin frotte!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 6 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"trainerbattle_single",args:["TRAINER_PHILLIP","SSTidalLowerDeck_Text_PhillipIntro","SSTidalLowerDeck_Text_PhillipDefeat"]},
  {op:"msgbox",args:["SSTidalLowerDeck_Text_PhillipPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_LEONARD","SSTidalLowerDeck_Text_LeonardIntro","SSTidalLowerDeck_Text_LeonardDefeat"]},
  {op:"msgbox",args:["SSTidalLowerDeck_Text_LeonardPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
