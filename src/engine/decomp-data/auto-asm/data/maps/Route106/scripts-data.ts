// AUTO-GENERATED from data/maps/Route106/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route106/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route106_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route106_EventScript_TrainerTipsSign', isGlobal: true, instrIndex: 0 },
  { name: 'Route106_EventScript_Douglas', isGlobal: true, instrIndex: 2 },
  { name: 'Route106_EventScript_Kyla', isGlobal: true, instrIndex: 5 },
  { name: 'Route106_EventScript_Elliot', isGlobal: true, instrIndex: 8 },
  { name: 'Route106_EventScript_ElliotRegisterMatchCallAfterBattle', isGlobal: true, instrIndex: 14 },
  { name: 'Route106_EventScript_ElliotRematch', isGlobal: true, instrIndex: 20 },
  { name: 'Route106_EventScript_Ned', isGlobal: true, instrIndex: 23 },
  { name: 'Route106_Text_TrainerTips', isGlobal: false, instrIndex: 26 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=3
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"CONSEILS AUX DRESSEURS\\p\""] },
  { kind: '.string', vals: ["\"Pour attraper un POKéMON avec la CANNE,\\n\""] },
  { kind: '.string', vals: ["\"appuyez sur le bouton A quand ça mord.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 26 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["Route106_Text_TrainerTips","MSGBOX_SIGN"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_DOUGLAS","Route106_Text_DouglasIntro","Route106_Text_DouglasDefeated"]},
  {op:"msgbox",args:["Route106_Text_DouglasPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_KYLA","Route106_Text_KylaIntro","Route106_Text_KylaDefeated"]},
  {op:"msgbox",args:["Route106_Text_KylaPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_ELLIOT_1","Route106_Text_ElliotIntro","Route106_Text_ElliotDefeated","Route106_EventScript_ElliotRegisterMatchCallAfterBattle"]},
  {op:"specialvar",args:["VAR_RESULT","ShouldTryRematchBattle"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"Route106_EventScript_ElliotRematch"]},
  {op:"msgbox",args:["Route106_Text_ElliotPostBattle","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"special",args:["PlayerFaceTrainerAfterBattle"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["Route106_Text_ElliotRegister","MSGBOX_DEFAULT"]},
  {op:"register_matchcall",args:["TRAINER_ELLIOT_1"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"trainerbattle_rematch",args:["TRAINER_ELLIOT_1","Route106_Text_ElliotRematchIntro","Route106_Text_ElliotRematchDefeated"]},
  {op:"msgbox",args:["Route106_Text_ElliotRematchPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_NED","Route106_Text_NedIntro","Route106_Text_NedDefeated"]},
  {op:"msgbox",args:["Route106_Text_NedPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
