// AUTO-GENERATED from data/maps/FortreeCity_House2/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/FortreeCity_House2/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'FortreeCity_House2_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'FortreeCity_House2_EventScript_HiddenPowerGiver', isGlobal: true, instrIndex: 0 },
  { name: 'FortreeCity_House2_EventScript_Greeting', isGlobal: true, instrIndex: 23 },
  { name: 'FortreeCity_House2_EventScript_ExplainHiddenPower', isGlobal: true, instrIndex: 26 },
  { name: 'FortreeCity_House2_EventScript_WrongGuess', isGlobal: true, instrIndex: 29 },
  { name: 'FortreeCity_House2_Text_HiddenPowersArousedByNature', isGlobal: false, instrIndex: 32 },
  { name: 'FortreeCity_House2_Text_CoinInWhichHand', isGlobal: false, instrIndex: 32 },
  { name: 'FortreeCity_House2_Text_CorrectTryAgainWhichHand', isGlobal: false, instrIndex: 32 },
  { name: 'FortreeCity_House2_Text_CorrectTryAgainWhichHand2', isGlobal: false, instrIndex: 32 },
  { name: 'FortreeCity_House2_Text_YourHiddenPowerHasAwoken', isGlobal: false, instrIndex: 32 },
  { name: 'FortreeCity_House2_Text_ExplainHiddenPower', isGlobal: false, instrIndex: 32 },
  { name: 'FortreeCity_House2_Text_YouGuessedWrong', isGlobal: false, instrIndex: 32 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=24
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Les humains… Les POKéMON…\\p\""] },
  { kind: '.string', vals: ["\"Leurs pouvoirs cachés se développent\\n\""] },
  { kind: '.string', vals: ["\"lorsqu'ils vivent en milieu naturel…$\""] },
  { kind: '.string', vals: ["\"Laisse la vieille dame que je suis voir si\\n\""] },
  { kind: '.string', vals: ["\"ton pouvoir caché s'est éveillé…\\p\""] },
  { kind: '.string', vals: ["\"J'ai une pièce dans une main.\\p\""] },
  { kind: '.string', vals: ["\"Dans quelle main l'ai-je cachée?\\n\""] },
  { kind: '.string', vals: ["\"La droite ou la gauche?$\""] },
  { kind: '.string', vals: ["\"Oh! Oui, c'est juste!\\p\""] },
  { kind: '.string', vals: ["\"On va réessayer.\\p\""] },
  { kind: '.string', vals: ["\"Dans quelle main est la pièce?\\n\""] },
  { kind: '.string', vals: ["\"La droite ou la gauche?$\""] },
  { kind: '.string', vals: ["\"Oh! Oui, c'est juste!\\p\""] },
  { kind: '.string', vals: ["\"On va réessayer.\\p\""] },
  { kind: '.string', vals: ["\"Dans quelle main est la pièce?\\n\""] },
  { kind: '.string', vals: ["\"La droite ou la gauche?$\""] },
  { kind: '.string', vals: ["\"Oh! Superbe!\\n\""] },
  { kind: '.string', vals: ["\"Ton pouvoir caché s'est réveillé!\\p\""] },
  { kind: '.string', vals: ["\"Tiens, prends ça et révèle le pouvoir\\n\""] },
  { kind: '.string', vals: ["\"caché de tes POKéMON.$\""] },
  { kind: '.string', vals: ["\"PUISSANCE CACHEE est une capacité\\n\""] },
  { kind: '.string', vals: ["\"qui diffère selon les POKéMON.$\""] },
  { kind: '.string', vals: ["\"Non, dommage.\\n\""] },
  { kind: '.string', vals: ["\"Tu n'as pas fait le bon choix.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 32 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_RECEIVED_TM_HIDDEN_POWER","FortreeCity_House2_EventScript_ExplainHiddenPower"]},
  {op:"call_if_unset",args:["FLAG_MET_HIDDEN_POWER_GIVER","FortreeCity_House2_EventScript_Greeting"]},
  {op:"msgbox",args:["FortreeCity_House2_Text_CoinInWhichHand","MSGBOX_DEFAULT"]},
  {op:"multichoice",args:[21,8,"MULTI_RIGHTLEFT",1]},
  {op:"switch",args:["VAR_RESULT"]},
  {op:"case",args:[1,"FortreeCity_House2_EventScript_WrongGuess"]},
  {op:"msgbox",args:["FortreeCity_House2_Text_CorrectTryAgainWhichHand","MSGBOX_DEFAULT"]},
  {op:"multichoice",args:[21,8,"MULTI_RIGHTLEFT",1]},
  {op:"switch",args:["VAR_RESULT"]},
  {op:"case",args:[1,"FortreeCity_House2_EventScript_WrongGuess"]},
  {op:"msgbox",args:["FortreeCity_House2_Text_CorrectTryAgainWhichHand2","MSGBOX_DEFAULT"]},
  {op:"multichoice",args:[21,8,"MULTI_RIGHTLEFT",1]},
  {op:"switch",args:["VAR_RESULT"]},
  {op:"case",args:[0,"FortreeCity_House2_EventScript_WrongGuess"]},
  {op:"msgbox",args:["FortreeCity_House2_Text_YourHiddenPowerHasAwoken","MSGBOX_DEFAULT"]},
  {op:"giveitem",args:["ITEM_TM_HIDDEN_POWER"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"Common_EventScript_ShowBagIsFull"]},
  {op:"setflag",args:["FLAG_RECEIVED_TM_HIDDEN_POWER"]},
  {op:"msgbox",args:["FortreeCity_House2_Text_ExplainHiddenPower","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FortreeCity_House2_Text_HiddenPowersArousedByNature","MSGBOX_DEFAULT"]},
  {op:"setflag",args:["FLAG_MET_HIDDEN_POWER_GIVER"]},
  {op:"return",args:[]},
  {op:"msgbox",args:["FortreeCity_House2_Text_ExplainHiddenPower","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FortreeCity_House2_Text_YouGuessedWrong","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
