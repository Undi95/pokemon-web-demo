// AUTO-GENERATED from data/maps/AbandonedShip_Corridors_B1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/AbandonedShip_Corridors_B1F/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'AbandonedShip_Corridors_B1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'AbandonedShip_Corridors_B1F_OnResume', isGlobal: false, instrIndex: 2 },
  { name: 'AbandonedShip_Corridors_B1F_OnLoad', isGlobal: false, instrIndex: 4 },
  { name: 'AbandonedShip_Corridors_B1F_EventScript_LockStorageRoom', isGlobal: true, instrIndex: 7 },
  { name: 'AbandonedShip_Corridors_B1F_EventScript_UnlockStorageRoom', isGlobal: true, instrIndex: 9 },
  { name: 'AbandonedShip_Corridors_B1F_EventScript_TuberM', isGlobal: true, instrIndex: 11 },
  { name: 'AbandonedShip_Corridors_B1F_EventScript_StorageRoomDoor', isGlobal: true, instrIndex: 13 },
  { name: 'AbandonedShip_Corridors_B1F_EventScript_DoorIsLocked', isGlobal: true, instrIndex: 25 },
  { name: 'AbandonedShip_Corridors_B1F_EventScript_DoorIsUnlocked', isGlobal: true, instrIndex: 28 },
  { name: 'AbandonedShip_Corridors_B1F_EventScript_Duncan', isGlobal: true, instrIndex: 31 },
  { name: 'AbandonedShip_Corridors_B1F_Text_DuncanIntro', isGlobal: false, instrIndex: 34 },
  { name: 'AbandonedShip_Corridors_B1F_Text_DuncanDefeat', isGlobal: false, instrIndex: 34 },
  { name: 'AbandonedShip_Corridors_B1F_Text_DuncanPostBattle', isGlobal: false, instrIndex: 34 },
  { name: 'AbandonedShip_Corridors_B1F_Text_YayItsAShip', isGlobal: false, instrIndex: 34 },
  { name: 'AbandonedShip_Corridors_B1F_Text_DoorIsLocked', isGlobal: false, instrIndex: 34 },
  { name: 'AbandonedShip_Corridors_B1F_Text_InsertedStorageKey', isGlobal: false, instrIndex: 34 },
  { name: 'AbandonedShip_Text_TheDoorIsOpen', isGlobal: false, instrIndex: 34 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=18
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Nous, les MARINS, quand on sort en mer,\\n\""] },
  { kind: '.string', vals: ["\"on emmène toujours nos POKéMON.\\l\""] },
  { kind: '.string', vals: ["\"Que dirais-tu d'un petit combat?$\""] },
  { kind: '.string', vals: ["\"Oups, je sombre!$\""] },
  { kind: '.string', vals: ["\"L'arrière du bateau a sombré dans\\n\""] },
  { kind: '.string', vals: ["\"les profondeurs.\\p\""] },
  { kind: '.string', vals: ["\"Si un POKéMON savait aller sous l'eau,\\n\""] },
  { kind: '.string', vals: ["\"on pourrait peut-être progresser…$\""] },
  { kind: '.string', vals: ["\"Yé!\\n\""] },
  { kind: '.string', vals: ["\"C'est un bateau!$\""] },
  { kind: '.string', vals: ["\"La porte est fermée.\\p\""] },
  { kind: '.string', vals: ["\"Il est inscrit sur la porte:\\n\""] },
  { kind: '.string', vals: ["\"“STOCKAGE”.$\""] },
  { kind: '.string', vals: ["\"{PLAYER} insère et tourne la \\n\""] },
  { kind: '.string', vals: ["\"CLE STOCKAGE.\\p\""] },
  { kind: '.string', vals: ["\"La CLE insérée se coince un peu,\\n\""] },
  { kind: '.string', vals: ["\"mais la porte s'ouvre.$\""] },
  { kind: '.string', vals: ["\"La porte est ouverte.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 34 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","AbandonedShip_Corridors_B1F_OnResume"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_LOAD","AbandonedShip_Corridors_B1F_OnLoad"]},
  {op:"setdivewarp",args:["MAP_ABANDONED_SHIP_UNDERWATER1",5,4]},
  {op:"end",args:[]},
  {op:"call_if_unset",args:["FLAG_USED_STORAGE_KEY","AbandonedShip_Corridors_B1F_EventScript_LockStorageRoom"]},
  {op:"call_if_set",args:["FLAG_USED_STORAGE_KEY","AbandonedShip_Corridors_B1F_EventScript_UnlockStorageRoom"]},
  {op:"end",args:[]},
  {op:"setmetatile",args:[11,4,"METATILE_InsideShip_IntactDoor_Bottom_Locked",1]},
  {op:"return",args:[]},
  {op:"setmetatile",args:[11,4,"METATILE_InsideShip_IntactDoor_Bottom_Unlocked",1]},
  {op:"return",args:[]},
  {op:"msgbox",args:["AbandonedShip_Corridors_B1F_Text_YayItsAShip","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lockall",args:[]},
  {op:"goto_if_set",args:["FLAG_USED_STORAGE_KEY","AbandonedShip_Corridors_B1F_EventScript_DoorIsUnlocked"]},
  {op:"checkitem",args:["ITEM_STORAGE_KEY"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"AbandonedShip_Corridors_B1F_EventScript_DoorIsLocked"]},
  {op:"msgbox",args:["AbandonedShip_Corridors_B1F_Text_InsertedStorageKey","MSGBOX_DEFAULT"]},
  {op:"playse",args:["SE_PIN"]},
  {op:"removeitem",args:["ITEM_STORAGE_KEY"]},
  {op:"setflag",args:["FLAG_USED_STORAGE_KEY"]},
  {op:"call",args:["AbandonedShip_Corridors_B1F_EventScript_UnlockStorageRoom"]},
  {op:"special",args:["DrawWholeMapView"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["AbandonedShip_Corridors_B1F_Text_DoorIsLocked","MSGBOX_DEFAULT"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["AbandonedShip_Text_TheDoorIsOpen","MSGBOX_DEFAULT"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"trainerbattle_single",args:["TRAINER_DUNCAN","AbandonedShip_Corridors_B1F_Text_DuncanIntro","AbandonedShip_Corridors_B1F_Text_DuncanDefeat"]},
  {op:"msgbox",args:["AbandonedShip_Corridors_B1F_Text_DuncanPostBattle","MSGBOX_AUTOCLOSE"]},
  {op:"end",args:[]},
] as const;
