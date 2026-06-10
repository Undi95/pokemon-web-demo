// AUTO-GENERATED from data/maps/SeafloorCavern_Entrance/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SeafloorCavern_Entrance/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SeafloorCavern_Entrance_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SeafloorCavern_Entrance_OnResume', isGlobal: false, instrIndex: 1 },
  { name: 'SeafloorCavern_Entrance_EventScript_Grunt', isGlobal: true, instrIndex: 4 },
  { name: 'SeafloorCavern_Entrance_EventScript_GruntSpeechShort', isGlobal: true, instrIndex: 25 },
  { name: 'SeafloorCavern_Entrance_EventScript_GruntFacePlayerEast', isGlobal: true, instrIndex: 34 },
  { name: 'SeafloorCavern_Entrance_EventScript_GruntFacePlayerWest', isGlobal: true, instrIndex: 37 },
  { name: 'SeafloorCavern_Entrance_EventScript_GruntFacePlayerNorth', isGlobal: true, instrIndex: 40 },
  { name: 'SeafloorCavern_Entrance_Text_HearMagmaNearMossdeep', isGlobal: false, instrIndex: 43 },
  { name: 'SeafloorCavern_Entrance_Text_HearMagmaNearMossdeepShort', isGlobal: false, instrIndex: 43 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=22
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Hé!\\n\""] },
  { kind: '.string', vals: ["\"Je me souviens de toi!\\p\""] },
  { kind: '.string', vals: ["\"Si tu es là, ça veut dire que tu veux\\n\""] },
  { kind: '.string', vals: ["\"encore te mêler de nos affaires!\\p\""] },
  { kind: '.string', vals: ["\"Tu penses vraiment qu'une demi-portion\\n\""] },
  { kind: '.string', vals: ["\"comme toi peut gêner la TEAM AQUA?\\p\""] },
  { kind: '.string', vals: ["\"Mais tu rêves complètement, ma parole.\\p\""] },
  { kind: '.string', vals: ["\"Tu arriverais à peine à entrer dans\\n\""] },
  { kind: '.string', vals: ["\"la TEAM MAGMA, c'est dire!\\p\""] },
  { kind: '.string', vals: ["\"En parlant d'eux, il paraît qu'on les a\\n\""] },
  { kind: '.string', vals: ["\"repérés près d'ALGATIA.\\p\""] },
  { kind: '.string', vals: ["\"Ils ne doivent pas faire les fiers\\n\""] },
  { kind: '.string', vals: ["\"si près de la mer!$\""] },
  { kind: '.string', vals: ["\"Tu penses vraiment qu'une demi-portion\\n\""] },
  { kind: '.string', vals: ["\"comme toi peut gêner la TEAM AQUA?\\p\""] },
  { kind: '.string', vals: ["\"Mais tu rêves complètement, ma parole.\\p\""] },
  { kind: '.string', vals: ["\"Tu arriverais à peine à entrer dans\\n\""] },
  { kind: '.string', vals: ["\"la TEAM MAGMA, c'est dire!\\p\""] },
  { kind: '.string', vals: ["\"En parlant d'eux, il paraît qu'on les a\\n\""] },
  { kind: '.string', vals: ["\"repérés près d'ALGATIA.\\p\""] },
  { kind: '.string', vals: ["\"Ils ne doivent pas faire les fiers\\n\""] },
  { kind: '.string', vals: ["\"si près de la mer!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 43 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","SeafloorCavern_Entrance_OnResume"]},
  {op:"setdivewarp",args:["MAP_UNDERWATER_SEAFLOOR_CAVERN",6,5]},
  {op:"setescapewarp",args:["MAP_UNDERWATER_SEAFLOOR_CAVERN",6,5]},
  {op:"end",args:[]},
  {op:"lockall",args:[]},
  {op:"goto_if_eq",args:["VAR_HAS_TALKED_TO_SEAFLOOR_CAVERN_ENTRANCE_GRUNT",1,"SeafloorCavern_Entrance_EventScript_GruntSpeechShort"]},
  {op:"waitse",args:[]},
  {op:"playse",args:["SE_PIN"]},
  {op:"applymovement",args:["LOCALID_SEAFLOOR_CAVERN_ENTRANCE_GRUNT","Common_Movement_ExclamationMark"]},
  {op:"waitmovement",args:[0]},
  {op:"applymovement",args:["LOCALID_SEAFLOOR_CAVERN_ENTRANCE_GRUNT","Common_Movement_Delay48"]},
  {op:"waitmovement",args:[0]},
  {op:"delay",args:[20]},
  {op:"call_if_eq",args:["VAR_FACING","DIR_WEST","SeafloorCavern_Entrance_EventScript_GruntFacePlayerWest"]},
  {op:"call_if_eq",args:["VAR_FACING","DIR_EAST","SeafloorCavern_Entrance_EventScript_GruntFacePlayerEast"]},
  {op:"call_if_eq",args:["VAR_FACING","DIR_NORTH","SeafloorCavern_Entrance_EventScript_GruntFacePlayerNorth"]},
  {op:"delay",args:[30]},
  {op:"setvar",args:["VAR_HAS_TALKED_TO_SEAFLOOR_CAVERN_ENTRANCE_GRUNT",1]},
  {op:"copyobjectxytoperm",args:["LOCALID_SEAFLOOR_CAVERN_ENTRANCE_GRUNT"]},
  {op:"msgbox",args:["SeafloorCavern_Entrance_Text_HearMagmaNearMossdeep","MSGBOX_DEFAULT"]},
  {op:"closemessage",args:[]},
  {op:"applymovement",args:["LOCALID_SEAFLOOR_CAVERN_ENTRANCE_GRUNT","Common_Movement_WalkInPlaceFasterUp"]},
  {op:"waitmovement",args:[0]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"call_if_eq",args:["VAR_FACING","DIR_WEST","SeafloorCavern_Entrance_EventScript_GruntFacePlayerWest"]},
  {op:"call_if_eq",args:["VAR_FACING","DIR_EAST","SeafloorCavern_Entrance_EventScript_GruntFacePlayerEast"]},
  {op:"call_if_eq",args:["VAR_FACING","DIR_NORTH","SeafloorCavern_Entrance_EventScript_GruntFacePlayerNorth"]},
  {op:"msgbox",args:["SeafloorCavern_Entrance_Text_HearMagmaNearMossdeepShort","MSGBOX_DEFAULT"]},
  {op:"closemessage",args:[]},
  {op:"applymovement",args:["LOCALID_SEAFLOOR_CAVERN_ENTRANCE_GRUNT","Common_Movement_WalkInPlaceFasterUp"]},
  {op:"waitmovement",args:[0]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"applymovement",args:["LOCALID_SEAFLOOR_CAVERN_ENTRANCE_GRUNT","Common_Movement_WalkInPlaceFasterLeft"]},
  {op:"waitmovement",args:[0]},
  {op:"return",args:[]},
  {op:"applymovement",args:["LOCALID_SEAFLOOR_CAVERN_ENTRANCE_GRUNT","Common_Movement_WalkInPlaceFasterRight"]},
  {op:"waitmovement",args:[0]},
  {op:"return",args:[]},
  {op:"applymovement",args:["LOCALID_SEAFLOOR_CAVERN_ENTRANCE_GRUNT","Common_Movement_WalkInPlaceFasterDown"]},
  {op:"waitmovement",args:[0]},
  {op:"return",args:[]},
] as const;
