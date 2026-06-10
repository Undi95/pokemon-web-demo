// AUTO-GENERATED from data/maps/LilycoveCity_House2/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/LilycoveCity_House2/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'LilycoveCity_House2_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'LilycoveCity_House2_EventScript_FatMan', isGlobal: true, instrIndex: 0 },
  { name: 'LilycoveCity_House2_EventScript_ReceivedRest', isGlobal: true, instrIndex: 10 },
  { name: 'LilycoveCity_House2_Text_NotAwakeYetHaveThis', isGlobal: false, instrIndex: 13 },
  { name: 'LilycoveCity_House2_Text_SleepIsEssential', isGlobal: false, instrIndex: 13 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=6
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Hum? Quoi? Qu'est-ce que c'est?\\p\""] },
  { kind: '.string', vals: ["\"J'suis pas encore bien réveillé…\\n\""] },
  { kind: '.string', vals: ["\"Tu peux prendre ça…$\""] },
  { kind: '.string', vals: ["\"Ouaaaah…\\p\""] },
  { kind: '.string', vals: ["\"Dormir est essentiel à la santé…\\n\""] },
  { kind: '.string', vals: ["\"Dormir et reprendre des forces…$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 13 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_RECEIVED_TM_REST","LilycoveCity_House2_EventScript_ReceivedRest"]},
  {op:"msgbox",args:["LilycoveCity_House2_Text_NotAwakeYetHaveThis","MSGBOX_DEFAULT"]},
  {op:"giveitem",args:["ITEM_TM_REST"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"Common_EventScript_ShowBagIsFull"]},
  {op:"setflag",args:["FLAG_RECEIVED_TM_REST"]},
  {op:"msgbox",args:["LilycoveCity_House2_Text_SleepIsEssential","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["LilycoveCity_House2_Text_SleepIsEssential","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
