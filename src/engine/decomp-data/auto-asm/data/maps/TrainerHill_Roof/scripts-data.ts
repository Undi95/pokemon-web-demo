// AUTO-GENERATED from data/maps/TrainerHill_Roof/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/TrainerHill_Roof/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'TrainerHill_Roof_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'TrainerHill_Roof_EventScript_Owner', isGlobal: true, instrIndex: 2 },
  { name: 'TrainerHill_Roof_EventScript_Arrived', isGlobal: true, instrIndex: 10 },
  { name: 'TrainerHill_Roof_EventScript_GivePrize', isGlobal: true, instrIndex: 11 },
  { name: 'TrainerHill_Roof_EventScript_ReceivePrize', isGlobal: true, instrIndex: 16 },
  { name: 'TrainerHill_Roof_EventScript_NoRoomForPrize', isGlobal: true, instrIndex: 22 },
  { name: 'TrainerHill_Roof_EventScript_CheckFinalTime', isGlobal: true, instrIndex: 26 },
  { name: 'TrainerHill_Roof_EventScript_NewRecord', isGlobal: true, instrIndex: 31 },
  { name: 'TrainerHill_Roof_EventScript_NoNewRecord', isGlobal: true, instrIndex: 34 },
  { name: 'TrainerHill_Roof_EventScript_EndSpeakToOwner', isGlobal: true, instrIndex: 37 },
  { name: 'TrainerHill_Roof_EventScript_AlreadyReceivedPrize', isGlobal: true, instrIndex: 40 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 43 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","TrainerHill_OnResume"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","TrainerHill_OnFrame"]},
  {op:"trainerhill_settrainerflags",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"trainerhill_getownerstate",args:[]},
  {op:"switch",args:["VAR_RESULT"]},
  {op:"case",args:[0,"TrainerHill_Roof_EventScript_Arrived"]},
  {op:"case",args:[1,"TrainerHill_Roof_EventScript_GivePrize"]},
  {op:"case",args:[2,"TrainerHill_Roof_EventScript_AlreadyReceivedPrize"]},
  {op:"msgbox",args:["TrainerHill_Roof_Text_YouFinallyCameBravo","MSGBOX_DEFAULT"]},
  {op:"trainerhill_giveprize",args:[]},
  {op:"switch",args:["VAR_RESULT"]},
  {op:"case",args:[0,"TrainerHill_Roof_EventScript_ReceivePrize"]},
  {op:"case",args:[1,"TrainerHill_Roof_EventScript_NoRoomForPrize"]},
  {op:"case",args:[2,"TrainerHill_Roof_EventScript_CheckFinalTime"]},
  {op:"msgbox",args:["TrainerHill_Roof_Text_HaveTheMostMarvelousGift","MSGBOX_DEFAULT"]},
  {op:"playfanfare",args:["MUS_LEVEL_UP"]},
  {op:"message",args:["gText_ObtainedTheItem"]},
  {op:"waitfanfare",args:[]},
  {op:"waitmessage",args:[]},
  {op:"goto",args:["TrainerHill_Roof_EventScript_CheckFinalTime"]},
  {op:"msgbox",args:["TrainerHill_Roof_Text_HaveTheMostMarvelousGift","MSGBOX_DEFAULT"]},
  {op:"msgbox",args:["gText_TheBagIsFull","MSGBOX_DEFAULT"]},
  {op:"msgbox",args:["TrainerHill_Roof_Text_FullUpBeBackLaterForThis","MSGBOX_DEFAULT"]},
  {op:"goto",args:["TrainerHill_Roof_EventScript_CheckFinalTime"]},
  {op:"trainerhill_finaltime",args:[]},
  {op:"switch",args:["VAR_RESULT"]},
  {op:"case",args:[0,"TrainerHill_Roof_EventScript_NewRecord"]},
  {op:"case",args:[1,"TrainerHill_Roof_EventScript_NoNewRecord"]},
  {op:"case",args:[2,"TrainerHill_Roof_EventScript_EndSpeakToOwner"]},
  {op:"msgbox",args:["TrainerHill_Roof_Text_GotHereMarvelouslyQuickly","MSGBOX_DEFAULT"]},
  {op:"goto",args:["TrainerHill_Roof_EventScript_EndSpeakToOwner"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["TrainerHill_Roof_Text_YouWerentVeryQuick","MSGBOX_DEFAULT"]},
  {op:"goto",args:["TrainerHill_Roof_EventScript_EndSpeakToOwner"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["TrainerHill_Roof_Text_ArriveZippierNextTime","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["TrainerHill_Roof_Text_ArriveZippierNextTime","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
