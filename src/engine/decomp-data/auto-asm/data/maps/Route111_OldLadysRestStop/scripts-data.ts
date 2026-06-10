// AUTO-GENERATED from data/maps/Route111_OldLadysRestStop/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route111_OldLadysRestStop/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route111_OldLadysRestStop_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route111_OldLadysRestStop_OnTransition', isGlobal: false, instrIndex: 1 },
  { name: 'Route111_OldLadysRestStop_EventScript_OldLady', isGlobal: true, instrIndex: 3 },
  { name: 'Route111_OldLadysRestStop_EventScript_Rest', isGlobal: true, instrIndex: 9 },
  { name: 'Route111_OldLadysRestStop_EventScript_DeclineRest', isGlobal: true, instrIndex: 16 },
  { name: 'Route111_OldLadysRestStop_Text_RestUpHere', isGlobal: false, instrIndex: 19 },
  { name: 'Route111_OldLadysRestStop_Text_TakeYourTimeRestUp', isGlobal: false, instrIndex: 19 },
  { name: 'Route111_OldLadysRestStop_Text_StillTiredTakeAnotherRest', isGlobal: false, instrIndex: 19 },
  { name: 'Route111_OldLadysRestStop_Text_DontNeedToBeShy', isGlobal: false, instrIndex: 19 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=12
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Oh, mon Dieu!\\n\""] },
  { kind: '.string', vals: ["\"Tes POKéMON doivent être épuisés!\\p\""] },
  { kind: '.string', vals: ["\"Si tu veux, tu peux les laisser se\\n\""] },
  { kind: '.string', vals: ["\"reposer ici. Bonne idée, non?$\""] },
  { kind: '.string', vals: ["\"Tu as raison.\\n\""] },
  { kind: '.string', vals: ["\"Prends ton temps et repose-toi aussi!$\""] },
  { kind: '.string', vals: ["\"Oh, mon Dieu!\\n\""] },
  { kind: '.string', vals: ["\"Tes POKéMON sont toujours fatigués?\\p\""] },
  { kind: '.string', vals: ["\"Tu devrais rester te reposer ici.\\n\""] },
  { kind: '.string', vals: ["\"Bonne idée, n'est-ce pas?$\""] },
  { kind: '.string', vals: ["\"Vraiment?\\n\""] },
  { kind: '.string', vals: ["\"Ne sois pas timide.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 19 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","Route111_OldLadysRestStop_OnTransition"]},
  {op:"setflag",args:["FLAG_LANDMARK_OLD_LADY_REST_SHOP"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"msgbox",args:["Route111_OldLadysRestStop_Text_RestUpHere","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","YES","Route111_OldLadysRestStop_EventScript_Rest"]},
  {op:"goto_if_eq",args:["VAR_RESULT","NO","Route111_OldLadysRestStop_EventScript_DeclineRest"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Route111_OldLadysRestStop_Text_TakeYourTimeRestUp","MSGBOX_DEFAULT"]},
  {op:"closemessage",args:[]},
  {op:"call",args:["Common_EventScript_OutOfCenterPartyHeal"]},
  {op:"msgbox",args:["Route111_OldLadysRestStop_Text_StillTiredTakeAnotherRest","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","YES","Route111_OldLadysRestStop_EventScript_Rest"]},
  {op:"goto_if_eq",args:["VAR_RESULT","NO","Route111_OldLadysRestStop_EventScript_DeclineRest"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Route111_OldLadysRestStop_Text_DontNeedToBeShy","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
