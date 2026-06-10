// AUTO-GENERATED from data/maps/InsideOfTruck/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/InsideOfTruck/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'InsideOfTruck_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'InsideOfTruck_OnLoad', isGlobal: false, instrIndex: 2 },
  { name: 'InsideOfTruck_OnResume', isGlobal: false, instrIndex: 6 },
  { name: 'InsideOfTruck_EventScript_SetIntroFlags', isGlobal: true, instrIndex: 8 },
  { name: 'InsideOfTruck_EventScript_SetIntroFlagsMale', isGlobal: true, instrIndex: 14 },
  { name: 'InsideOfTruck_EventScript_SetIntroFlagsFemale', isGlobal: true, instrIndex: 25 },
  { name: 'InsideOfTruck_EventScript_MovingBox', isGlobal: true, instrIndex: 36 },
  { name: 'InsideOfTruck_Text_BoxPrintedWithMonLogo', isGlobal: false, instrIndex: 38 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=4
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Un logo POKéMON se trouve sur le\\n\""] },
  { kind: '.string', vals: ["\"carton.\\p\""] },
  { kind: '.string', vals: ["\"Il vient d'une société de déménagement\\n\""] },
  { kind: '.string', vals: ["\"et de livraison POKéMON.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 38 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_LOAD","InsideOfTruck_OnLoad"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","InsideOfTruck_OnResume"]},
  {op:"setmetatile",args:[4,1,"METATILE_InsideOfTruck_ExitLight_Top",0]},
  {op:"setmetatile",args:[4,2,"METATILE_InsideOfTruck_ExitLight_Mid",0]},
  {op:"setmetatile",args:[4,3,"METATILE_InsideOfTruck_ExitLight_Bottom",0]},
  {op:"end",args:[]},
  {op:"setstepcallback",args:["STEP_CB_TRUCK"]},
  {op:"end",args:[]},
  {op:"lockall",args:[]},
  {op:"setflag",args:["FLAG_HIDE_MAP_NAME_POPUP"]},
  {op:"checkplayergender",args:[]},
  {op:"goto_if_eq",args:["VAR_RESULT","MALE","InsideOfTruck_EventScript_SetIntroFlagsMale"]},
  {op:"goto_if_eq",args:["VAR_RESULT","FEMALE","InsideOfTruck_EventScript_SetIntroFlagsFemale"]},
  {op:"end",args:[]},
  {op:"setrespawn",args:["HEAL_LOCATION_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F"]},
  {op:"setvar",args:["VAR_LITTLEROOT_INTRO_STATE",1]},
  {op:"setflag",args:["FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_MOM"]},
  {op:"setflag",args:["FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_TRUCK"]},
  {op:"setflag",args:["FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_MOM"]},
  {op:"setflag",args:["FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_RIVAL_SIBLING"]},
  {op:"setflag",args:["FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_2F_POKE_BALL"]},
  {op:"setvar",args:["VAR_LITTLEROOT_HOUSES_STATE_BRENDAN",1]},
  {op:"setdynamicwarp",args:["MAP_LITTLEROOT_TOWN",3,10]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"setrespawn",args:["HEAL_LOCATION_LITTLEROOT_TOWN_MAYS_HOUSE_2F"]},
  {op:"setvar",args:["VAR_LITTLEROOT_INTRO_STATE",2]},
  {op:"setflag",args:["FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_MOM"]},
  {op:"setflag",args:["FLAG_HIDE_LITTLEROOT_TOWN_BRENDANS_HOUSE_TRUCK"]},
  {op:"setflag",args:["FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_RIVAL_MOM"]},
  {op:"setflag",args:["FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_RIVAL_SIBLING"]},
  {op:"setflag",args:["FLAG_HIDE_LITTLEROOT_TOWN_MAYS_HOUSE_2F_POKE_BALL"]},
  {op:"setvar",args:["VAR_LITTLEROOT_HOUSES_STATE_MAY",1]},
  {op:"setdynamicwarp",args:["MAP_LITTLEROOT_TOWN",12,10]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["InsideOfTruck_Text_BoxPrintedWithMonLogo","MSGBOX_SIGN"]},
  {op:"end",args:[]},
] as const;
