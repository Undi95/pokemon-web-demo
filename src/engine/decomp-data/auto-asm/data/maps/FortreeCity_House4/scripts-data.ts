// AUTO-GENERATED from data/maps/FortreeCity_House4/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/FortreeCity_House4/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'FortreeCity_House4_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'FortreeCity_House4_EventScript_Woman', isGlobal: true, instrIndex: 0 },
  { name: 'FortreeCity_House4_EventScript_Boy', isGlobal: true, instrIndex: 2 },
  { name: 'FortreeCity_House4_EventScript_WingullOnErrand', isGlobal: true, instrIndex: 15 },
  { name: 'FortreeCity_House4_EventScript_WingullReturned', isGlobal: true, instrIndex: 20 },
  { name: 'FortreeCity_House4_EventScript_ReceivedMentalHerb', isGlobal: true, instrIndex: 28 },
  { name: 'FortreeCity_House4_Movement_WingullExit', isGlobal: false, instrIndex: 33 },
  { name: 'FortreeCity_House4_EventScript_Wingull', isGlobal: true, instrIndex: 39 },
  { name: 'FortreeCity_House4_Text_BringsWorldCloserTogether', isGlobal: false, instrIndex: 47 },
  { name: 'FortreeCity_House4_Text_GoBirdPokemon', isGlobal: false, instrIndex: 47 },
  { name: 'FortreeCity_House4_Text_AskedWingullToRunErrand', isGlobal: false, instrIndex: 47 },
  { name: 'FortreeCity_House4_Text_WelcomeWingullTakeMentalHerb', isGlobal: false, instrIndex: 47 },
  { name: 'FortreeCity_House4_Text_FriendsFarAwayThanksToWingull', isGlobal: false, instrIndex: 47 },
  { name: 'FortreeCity_House4_Text_Wingull', isGlobal: false, instrIndex: 47 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=19
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"En vivant avec les POKéMON, les\\n\""] },
  { kind: '.string', vals: ["\"humains se font de plus en plus d'amis.\\p\""] },
  { kind: '.string', vals: ["\"Et ça unit le monde!\\n\""] },
  { kind: '.string', vals: ["\"Je trouve ça merveilleux.$\""] },
  { kind: '.string', vals: ["\"Là-bas!\\n\""] },
  { kind: '.string', vals: ["\"Vas-y, POKéMON OISEAU!$\""] },
  { kind: '.string', vals: ["\"Hé, j'ai chargé GOELISE de faire\\n\""] },
  { kind: '.string', vals: ["\"une course pour moi.$\""] },
  { kind: '.string', vals: ["\"Bien!\\n\""] },
  { kind: '.string', vals: ["\"Heureux de te revoir, GOELISE!\\p\""] },
  { kind: '.string', vals: ["\"Hum? Qu'est-ce que c'est?\\n\""] },
  { kind: '.string', vals: ["\"Qu'est-ce qu'il rapporte là?\\p\""] },
  { kind: '.string', vals: ["\"Une HERBE MENTAL?\\n\""] },
  { kind: '.string', vals: ["\"Il a dû ramasser ça quelque part.\\p\""] },
  { kind: '.string', vals: ["\"Mais je ne suis pas DRESSEUR,\\n\""] },
  { kind: '.string', vals: ["\"alors tu peux la garder.$\""] },
  { kind: '.string', vals: ["\"Grâce à GOELISE, je peux avoir\\n\""] },
  { kind: '.string', vals: ["\"des amis qui vivent loin d'ici.$\""] },
  { kind: '.string', vals: ["\"GOELISE: Goéééliiise!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 47 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["FortreeCity_House4_Text_BringsWorldCloserTogether","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lockall",args:[]},
  {op:"goto_if_set",args:["FLAG_RECEIVED_MENTAL_HERB","FortreeCity_House4_EventScript_ReceivedMentalHerb"]},
  {op:"goto_if_set",args:["FLAG_WINGULL_DELIVERED_MAIL","FortreeCity_House4_EventScript_WingullReturned"]},
  {op:"goto_if_set",args:["FLAG_WINGULL_SENT_ON_ERRAND","FortreeCity_House4_EventScript_WingullOnErrand"]},
  {op:"msgbox",args:["FortreeCity_House4_Text_GoBirdPokemon","MSGBOX_DEFAULT"]},
  {op:"closemessage",args:[]},
  {op:"setflag",args:["FLAG_WINGULL_SENT_ON_ERRAND"]},
  {op:"clearflag",args:["FLAG_HIDE_MOSSDEEP_CITY_HOUSE_2_WINGULL"]},
  {op:"applymovement",args:["LOCALID_FORTREE_HOUSE_WINGULL","FortreeCity_House4_Movement_WingullExit"]},
  {op:"waitmovement",args:[0]},
  {op:"removeobject",args:["LOCALID_FORTREE_HOUSE_WINGULL"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"applymovement",args:["VAR_LAST_TALKED","Common_Movement_FacePlayer"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["FortreeCity_House4_Text_AskedWingullToRunErrand","MSGBOX_DEFAULT"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"applymovement",args:["VAR_LAST_TALKED","Common_Movement_FacePlayer"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["FortreeCity_House4_Text_WelcomeWingullTakeMentalHerb","MSGBOX_DEFAULT"]},
  {op:"giveitem",args:["ITEM_MENTAL_HERB"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"Common_EventScript_ShowBagIsFull"]},
  {op:"setflag",args:["FLAG_RECEIVED_MENTAL_HERB"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"applymovement",args:["VAR_LAST_TALKED","Common_Movement_FacePlayer"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["FortreeCity_House4_Text_FriendsFarAwayThanksToWingull","MSGBOX_DEFAULT"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"walk_fast_down",args:[]},
  {op:"walk_fast_down",args:[]},
  {op:"walk_fast_right",args:[]},
  {op:"walk_in_place_faster_down",args:[]},
  {op:"delay_8",args:[]},
  {op:"step_end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"waitse",args:[]},
  {op:"playmoncry",args:["SPECIES_WINGULL","CRY_MODE_NORMAL"]},
  {op:"msgbox",args:["FortreeCity_House4_Text_Wingull","MSGBOX_DEFAULT"]},
  {op:"waitmoncry",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
