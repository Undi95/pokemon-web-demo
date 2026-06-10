// AUTO-GENERATED from data/maps/RustboroCity_Flat2_2F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/RustboroCity_Flat2_2F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'RustboroCity_Flat2_2F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'RustboroCity_Flat2_2F_EventScript_OldMan', isGlobal: true, instrIndex: 0 },
  { name: 'RustboroCity_Flat2_2F_EventScript_NinjaBoy', isGlobal: true, instrIndex: 2 },
  { name: 'RustboroCity_Flat2_2F_EventScript_GavePremierBall', isGlobal: true, instrIndex: 11 },
  { name: 'RustboroCity_Flat2_2F_Text_DevonWasTinyInOldDays', isGlobal: false, instrIndex: 14 },
  { name: 'RustboroCity_Flat2_2F_Text_MyDaddyMadeThisYouCanHaveIt', isGlobal: false, instrIndex: 14 },
  { name: 'RustboroCity_Flat2_2F_Text_GoingToWorkAtDevonToo', isGlobal: false, instrIndex: 14 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=8
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"A l'époque, DEVON n'était qu'une toute\\n\""] },
  { kind: '.string', vals: ["\"petite, une minuscule entreprise.$\""] },
  { kind: '.string', vals: ["\"Mon papa travaille chez DEVON.\\p\""] },
  { kind: '.string', vals: ["\"C'est mon papa qu'a fait ça!\\n\""] },
  { kind: '.string', vals: ["\"Mais ça m'sert pas. Tu peux l'prendre.$\""] },
  { kind: '.string', vals: ["\"Mon papa travaille chez DEVON.\\p\""] },
  { kind: '.string', vals: ["\"Quand j'serai grand, moi aussi\\n\""] },
  { kind: '.string', vals: ["\"j'travaillerai pour DEVON.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 14 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["RustboroCity_Flat2_2F_Text_DevonWasTinyInOldDays","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_RECEIVED_PREMIER_BALL_RUSTBORO","RustboroCity_Flat2_2F_EventScript_GavePremierBall"]},
  {op:"msgbox",args:["RustboroCity_Flat2_2F_Text_MyDaddyMadeThisYouCanHaveIt","MSGBOX_DEFAULT"]},
  {op:"giveitem",args:["ITEM_PREMIER_BALL"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"Common_EventScript_ShowBagIsFull"]},
  {op:"setflag",args:["FLAG_RECEIVED_PREMIER_BALL_RUSTBORO"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["RustboroCity_Flat2_2F_Text_GoingToWorkAtDevonToo","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
