// AUTO-GENERATED from data/maps/MtPyre_1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MtPyre_1F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MtPyre_1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MtPyre_1F_EventScript_CleanseTagWoman', isGlobal: true, instrIndex: 0 },
  { name: 'MtPyre_1F_EventScript_ReceivedCleanseTag', isGlobal: true, instrIndex: 9 },
  { name: 'MtPyre_1F_EventScript_PokefanF', isGlobal: true, instrIndex: 12 },
  { name: 'MtPyre_1F_EventScript_Man', isGlobal: true, instrIndex: 14 },
  { name: 'MtPyre_1F_Text_TakeThisForYourOwnGood', isGlobal: false, instrIndex: 16 },
  { name: 'MtPyre_1F_Text_ExplainCleanseTag', isGlobal: false, instrIndex: 16 },
  { name: 'MtPyre_1F_Text_ComeToPayRespects', isGlobal: false, instrIndex: 16 },
  { name: 'MtPyre_1F_Text_RestingPlaceOfZigzagoon', isGlobal: false, instrIndex: 16 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=13
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Toutes sortes d'êtres se promènent sur\\n\""] },
  { kind: '.string', vals: ["\"les versants du MONT MEMORIA…\\p\""] },
  { kind: '.string', vals: ["\"On ne sait jamais ce qui peut arriver.\\n\""] },
  { kind: '.string', vals: ["\"Prends ça. C'est pour ton bien.$\""] },
  { kind: '.string', vals: ["\"Fais tenir cette RUNE PURIF. à l'un\\n\""] },
  { kind: '.string', vals: ["\"de tes POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Ça éloignera les POKéMON sauvages.$\""] },
  { kind: '.string', vals: ["\"Es-tu là pour présenter tes respects\\n\""] },
  { kind: '.string', vals: ["\"aux esprits des défunts POKéMON?\\p\""] },
  { kind: '.string', vals: ["\"Tu dois prendre grand soin de tes\\n\""] },
  { kind: '.string', vals: ["\"POKéMON.$\""] },
  { kind: '.string', vals: ["\"C'est ici que repose mon ZIGZATON.\\n\""] },
  { kind: '.string', vals: ["\"C'est un endroit que je chéris…$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 16 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_RECEIVED_CLEANSE_TAG","MtPyre_1F_EventScript_ReceivedCleanseTag"]},
  {op:"msgbox",args:["MtPyre_1F_Text_TakeThisForYourOwnGood","MSGBOX_DEFAULT"]},
  {op:"giveitem",args:["ITEM_CLEANSE_TAG"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"Common_EventScript_ShowBagIsFull"]},
  {op:"setflag",args:["FLAG_RECEIVED_CLEANSE_TAG"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MtPyre_1F_Text_ExplainCleanseTag","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MtPyre_1F_Text_ComeToPayRespects","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MtPyre_1F_Text_RestingPlaceOfZigzagoon","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
