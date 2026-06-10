// AUTO-GENERATED from data/maps/Route114_FossilManiacsTunnel/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route114_FossilManiacsTunnel/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route114_FossilManiacsTunnel_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route114_FossilManiacsTunnel_OnTransition', isGlobal: false, instrIndex: 2 },
  { name: 'Route114_FossilManiacsTunnel_EventScript_MoveFossilManiac', isGlobal: true, instrIndex: 4 },
  { name: 'Route114_FossilManiacsTunnel_OnLoad', isGlobal: false, instrIndex: 7 },
  { name: 'Route114_FossilManiacsTunnel_EventScript_CloseDesertUnderpass', isGlobal: true, instrIndex: 9 },
  { name: 'Route114_FossilManiacsTunnel_EventScript_ManiacMentionCaveIn', isGlobal: true, instrIndex: 12 },
  { name: 'Route114_FossilManiacsTunnel_EventScript_FossilManiac', isGlobal: true, instrIndex: 20 },
  { name: 'Route114_FossilManiacsTunnel_EventScript_PlayerHasFossil', isGlobal: true, instrIndex: 30 },
  { name: 'Route114_FossilManiacsTunnel_EventScript_PlayerRevivedFossil', isGlobal: true, instrIndex: 33 },
  { name: 'Route114_FossilManiacsTunnel_Text_LookInDesertForFossils', isGlobal: false, instrIndex: 36 },
  { name: 'Route114_FossilManiacsTunnel_Text_DevonCorpRevivingFossils', isGlobal: false, instrIndex: 36 },
  { name: 'Route114_FossilManiacsTunnel_Text_FossilsAreWonderful', isGlobal: false, instrIndex: 36 },
  { name: 'Route114_FossilManiacsTunnel_Text_NotSafeThatWay', isGlobal: false, instrIndex: 36 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=28
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Je suis le MANIAQUE DES FOSSILES…\\n\""] },
  { kind: '.string', vals: ["\"Je suis un bon garçon, passionné de\\l\""] },
  { kind: '.string', vals: ["\"FOSSILES…\\p\""] },
  { kind: '.string', vals: ["\"Tu veux un FOSSILE?\\p\""] },
  { kind: '.string', vals: ["\"Pas de chance, tous les FOSSILES du\\n\""] },
  { kind: '.string', vals: ["\"coin m'appartiennent. Tu n'en auras pas.\\p\""] },
  { kind: '.string', vals: ["\"Si tu veux absolument un FOSSILE, va\\n\""] },
  { kind: '.string', vals: ["\"dans le désert. Tu risques d'en trouver\\l\""] },
  { kind: '.string', vals: ["\"dans les rochers ou dans le sable…$\""] },
  { kind: '.string', vals: ["\"Tu as trouvé un FOSSILE, n'est-ce pas?\\n\""] },
  { kind: '.string', vals: ["\"C'est génial… Ça laisse rêveur…\\p\""] },
  { kind: '.string', vals: ["\"Qu'est-ce que tu vas faire avec ce\\n\""] },
  { kind: '.string', vals: ["\"FOSSILE?\\p\""] },
  { kind: '.string', vals: ["\"J'ai entendu dire que DEVON faisait\\n\""] },
  { kind: '.string', vals: ["\"des recherches pour ranimer des\\l\""] },
  { kind: '.string', vals: ["\"POKéMON à partir de FOSSILES…\\p\""] },
  { kind: '.string', vals: ["\"J'aime tellement mes FOSSILES que je\\n\""] },
  { kind: '.string', vals: ["\"ne ferai jamais ça…$\""] },
  { kind: '.string', vals: ["\"Les FOSSILES sont si… merveilleux…\\n\""] },
  { kind: '.string', vals: ["\"Ils laissent rêveur…$\""] },
  { kind: '.string', vals: ["\"Oh…\\n\""] },
  { kind: '.string', vals: ["\"C'est dangereux par là…\\p\""] },
  { kind: '.string', vals: ["\"J'étais en train de creuser…\\n\""] },
  { kind: '.string', vals: ["\"Le mur entier s'est effondré…\\p\""] },
  { kind: '.string', vals: ["\"Il doit y avoir une grotte immense\\n\""] },
  { kind: '.string', vals: ["\"là-dessous…\\p\""] },
  { kind: '.string', vals: ["\"Mais ça ne m'intéresse pas, il n'y a\\n\""] },
  { kind: '.string', vals: ["\"sûrement pas de FOSSILES…$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 36 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","Route114_FossilManiacsTunnel_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_LOAD","Route114_FossilManiacsTunnel_OnLoad"]},
  {op:"call_if_set",args:["FLAG_SYS_GAME_CLEAR","Route114_FossilManiacsTunnel_EventScript_MoveFossilManiac"]},
  {op:"end",args:[]},
  {op:"setobjectxyperm",args:["LOCALID_FOSSIL_MANIAC",6,5]},
  {op:"setobjectmovementtype",args:["LOCALID_FOSSIL_MANIAC","MOVEMENT_TYPE_FACE_DOWN"]},
  {op:"return",args:[]},
  {op:"call_if_unset",args:["FLAG_SYS_GAME_CLEAR","Route114_FossilManiacsTunnel_EventScript_CloseDesertUnderpass"]},
  {op:"end",args:[]},
  {op:"setmetatile",args:[6,1,"METATILE_Fallarbor_RedRockWall",1]},
  {op:"setmetatile",args:[6,2,"METATILE_Fallarbor_RedRockWall",1]},
  {op:"return",args:[]},
  {op:"lockall",args:[]},
  {op:"applymovement",args:["LOCALID_FOSSIL_MANIAC","Common_Movement_WalkInPlaceFasterUp"]},
  {op:"applymovement",args:["LOCALID_PLAYER","Common_Movement_WalkInPlaceFasterDown"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["Route114_FossilManiacsTunnel_Text_NotSafeThatWay","MSGBOX_DEFAULT"]},
  {op:"setvar",args:["VAR_FOSSIL_MANIAC_STATE",2]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_RECEIVED_REVIVED_FOSSIL_MON","Route114_FossilManiacsTunnel_EventScript_PlayerRevivedFossil"]},
  {op:"checkitem",args:["ITEM_ROOT_FOSSIL"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"Route114_FossilManiacsTunnel_EventScript_PlayerHasFossil"]},
  {op:"checkitem",args:["ITEM_CLAW_FOSSIL"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"Route114_FossilManiacsTunnel_EventScript_PlayerHasFossil"]},
  {op:"msgbox",args:["Route114_FossilManiacsTunnel_Text_LookInDesertForFossils","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Route114_FossilManiacsTunnel_Text_DevonCorpRevivingFossils","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Route114_FossilManiacsTunnel_Text_FossilsAreWonderful","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
