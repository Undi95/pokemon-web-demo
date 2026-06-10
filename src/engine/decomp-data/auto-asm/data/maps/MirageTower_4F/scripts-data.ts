// AUTO-GENERATED from data/maps/MirageTower_4F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MirageTower_4F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MirageTower_4F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MirageTower_4F_EventScript_RootFossil', isGlobal: true, instrIndex: 0 },
  { name: 'MirageTower_4F_EventScript_LeaveRootFossil', isGlobal: true, instrIndex: 13 },
  { name: 'MirageTower_4F_EventScript_ClawFossil', isGlobal: true, instrIndex: 16 },
  { name: 'MirageTower_4F_EventScript_LeaveClawFossil', isGlobal: true, instrIndex: 29 },
  { name: 'MirageTower_4F_EventScript_CollapseMirageTower', isGlobal: true, instrIndex: 32 },
  { name: 'MirageTower_4F_Text_TakeRootFossil', isGlobal: false, instrIndex: 45 },
  { name: 'MirageTower_4F_Text_LeftRootFossilAlone', isGlobal: false, instrIndex: 45 },
  { name: 'MirageTower_4F_Text_TakeClawFossil', isGlobal: false, instrIndex: 45 },
  { name: 'MirageTower_4F_Text_LeaveClawFossilAlone', isGlobal: false, instrIndex: 45 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=10
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Tu as trouvé le FOSS. RACINE.\\p\""] },
  { kind: '.string', vals: ["\"Si ce FOSSILE est retiré, le sol autour\\n\""] },
  { kind: '.string', vals: ["\"s'enfoncera sûrement…\\p\""] },
  { kind: '.string', vals: ["\"Prendre le FOSS. RACINE quand même?$\""] },
  { kind: '.string', vals: ["\"{PLAYER} laisse le FOSS. RACINE en place.$\""] },
  { kind: '.string', vals: ["\"Tu as trouvé le FOSS. GRIFFE.\\p\""] },
  { kind: '.string', vals: ["\"Si ce FOSSILE est retiré, le sol autour\\n\""] },
  { kind: '.string', vals: ["\"s'enfoncera sûrement…\\p\""] },
  { kind: '.string', vals: ["\"Prendre le FOSS. GRIFFE quand même?$\""] },
  { kind: '.string', vals: ["\"{PLAYER} laisse le FOSS. GRIFFE en place.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 45 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"msgbox",args:["MirageTower_4F_Text_TakeRootFossil","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","NO","MirageTower_4F_EventScript_LeaveRootFossil"]},
  {op:"giveitem",args:["ITEM_ROOT_FOSSIL"]},
  {op:"closemessage",args:[]},
  {op:"setflag",args:["FLAG_HIDE_MIRAGE_TOWER_ROOT_FOSSIL"]},
  {op:"setflag",args:["FLAG_HIDE_MIRAGE_TOWER_CLAW_FOSSIL"]},
  {op:"removeobject",args:["LOCALID_MIRAGE_ROOT_FOSSIL"]},
  {op:"delay",args:[30]},
  {op:"setflag",args:["FLAG_CHOSE_ROOT_FOSSIL"]},
  {op:"goto",args:["MirageTower_4F_EventScript_CollapseMirageTower"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MirageTower_4F_Text_LeftRootFossilAlone","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"msgbox",args:["MirageTower_4F_Text_TakeClawFossil","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","NO","MirageTower_4F_EventScript_LeaveClawFossil"]},
  {op:"giveitem",args:["ITEM_CLAW_FOSSIL"]},
  {op:"closemessage",args:[]},
  {op:"setflag",args:["FLAG_HIDE_MIRAGE_TOWER_CLAW_FOSSIL"]},
  {op:"setflag",args:["FLAG_HIDE_MIRAGE_TOWER_ROOT_FOSSIL"]},
  {op:"removeobject",args:["LOCALID_MIRAGE_CLAW_FOSSIL"]},
  {op:"delay",args:[30]},
  {op:"setflag",args:["FLAG_CHOSE_CLAW_FOSSIL"]},
  {op:"goto",args:["MirageTower_4F_EventScript_CollapseMirageTower"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MirageTower_4F_Text_LeaveClawFossilAlone","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_0x8004",1]},
  {op:"setvar",args:["VAR_0x8005",1]},
  {op:"setvar",args:["VAR_0x8006",32]},
  {op:"setvar",args:["VAR_0x8007",2]},
  {op:"special",args:["ShakeCamera"]},
  {op:"waitstate",args:[]},
  {op:"special",args:["DoMirageTowerCeilingCrumble"]},
  {op:"setvar",args:["VAR_MIRAGE_TOWER_STATE",1]},
  {op:"clearflag",args:["FLAG_LANDMARK_MIRAGE_TOWER"]},
  {op:"warp",args:["MAP_ROUTE111",19,59]},
  {op:"waitstate",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
