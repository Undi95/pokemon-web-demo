// AUTO-GENERATED from data/maps/SootopolisCity_House6/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SootopolisCity_House6/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SootopolisCity_House6_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SootopolisCity_House6_EventScript_Woman', isGlobal: true, instrIndex: 0 },
  { name: 'SootopolisCity_House6_EventScript_DeclineWailmerDoll', isGlobal: true, instrIndex: 11 },
  { name: 'SootopolisCity_House6_EventScript_ReceivedWailmerDoll', isGlobal: true, instrIndex: 14 },
  { name: 'SootopolisCity_House6_EventScript_NoRoomForWailmerDoll', isGlobal: true, instrIndex: 17 },
  { name: 'SootopolisCity_House6_Text_FirstGuestInWhileTakeDoll', isGlobal: false, instrIndex: 22 },
  { name: 'SootopolisCity_House6_Text_TakeGoodCareOfIt', isGlobal: false, instrIndex: 22 },
  { name: 'SootopolisCity_House6_Text_IllHoldItForYou', isGlobal: false, instrIndex: 22 },
  { name: 'SootopolisCity_House6_Text_DontWantThisDoll', isGlobal: false, instrIndex: 22 },
  { name: 'SootopolisCity_House6_Text_LovePlushDolls', isGlobal: false, instrIndex: 22 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=10
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Bonjour! Vous êtes la première personne\\n\""] },
  { kind: '.string', vals: ["\"à venir chez nous depuis longtemps.\\p\""] },
  { kind: '.string', vals: ["\"Comme vous illuminez ma journée, je\\n\""] },
  { kind: '.string', vals: ["\"vous offre une grande POUPEE WAILMER.$\""] },
  { kind: '.string', vals: ["\"Prenez-en soin!$\""] },
  { kind: '.string', vals: ["\"Oh, vous la voulez, mais pas maintenant?\\n\""] },
  { kind: '.string', vals: ["\"D'accord. Je vous la mets de côté.$\""] },
  { kind: '.string', vals: ["\"C'est sûr?\\n\""] },
  { kind: '.string', vals: ["\"Vous ne voulez pas de cette POUPEE?$\""] },
  { kind: '.string', vals: ["\"J'adore les POUPEE en peluche!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 22 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_RECEIVED_WAILMER_DOLL","SootopolisCity_House6_EventScript_ReceivedWailmerDoll"]},
  {op:"msgbox",args:["SootopolisCity_House6_Text_FirstGuestInWhileTakeDoll","MSGBOX_YESNO"]},
  {op:"call_if_eq",args:["VAR_RESULT","NO","SootopolisCity_House6_EventScript_DeclineWailmerDoll"]},
  {op:"msgbox",args:["SootopolisCity_House6_Text_TakeGoodCareOfIt","MSGBOX_DEFAULT"]},
  {op:"givedecoration",args:["DECOR_WAILMER_DOLL"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"SootopolisCity_House6_EventScript_NoRoomForWailmerDoll"]},
  {op:"setflag",args:["FLAG_RECEIVED_WAILMER_DOLL"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["SootopolisCity_House6_Text_DontWantThisDoll","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["SootopolisCity_House6_Text_LovePlushDolls","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"bufferdecorationname",args:["STR_VAR_2","DECOR_WAILMER_DOLL"]},
  {op:"msgbox",args:["gText_NoRoomLeftForAnother","MSGBOX_DEFAULT"]},
  {op:"msgbox",args:["SootopolisCity_House6_Text_IllHoldItForYou","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
