// AUTO-GENERATED from data/maps/FallarborTown/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/FallarborTown/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'FallarborTown_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'FallarborTown_OnTransition', isGlobal: false, instrIndex: 1 },
  { name: 'FallarborTown_EventScript_ExpertM', isGlobal: true, instrIndex: 5 },
  { name: 'FallarborTown_EventScript_ExpertMNormal', isGlobal: true, instrIndex: 11 },
  { name: 'FallarborTown_EventScript_Girl', isGlobal: true, instrIndex: 14 },
  { name: 'FallarborTown_EventScript_Gentleman', isGlobal: true, instrIndex: 16 },
  { name: 'FallarborTown_EventScript_Azurill', isGlobal: true, instrIndex: 18 },
  { name: 'FallarborTown_EventScript_BattleTentSign', isGlobal: true, instrIndex: 26 },
  { name: 'FallarborTown_EventScript_TownSign', isGlobal: true, instrIndex: 28 },
  { name: 'FallarborTown_EventScript_MoveTutorSign', isGlobal: true, instrIndex: 30 },
  { name: 'FallarborTown_Text_ShadyCharactersCozmosHome', isGlobal: false, instrIndex: 32 },
  { name: 'FallarborTown_Text_RegionKnownForMeteors', isGlobal: false, instrIndex: 32 },
  { name: 'FallarborTown_Text_MyPreciousAzurill', isGlobal: false, instrIndex: 32 },
  { name: 'FallarborTown_Text_Azurill', isGlobal: false, instrIndex: 32 },
  { name: 'FallarborTown_Text_HaveYouChallengedFlannery', isGlobal: false, instrIndex: 32 },
  { name: 'FallarborTown_Text_BattleTentSign', isGlobal: false, instrIndex: 32 },
  { name: 'FallarborTown_Text_TownSign', isGlobal: false, instrIndex: 32 },
  { name: 'FallarborTown_Text_MoveTutorSign', isGlobal: false, instrIndex: 32 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=29
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Il se passe quelque chose d'étrange,\\n\""] },
  { kind: '.string', vals: ["\"je n'aime pas trop ça!\\p\""] },
  { kind: '.string', vals: ["\"J'ai aperçu quelqu'un entrer et sortir\\n\""] },
  { kind: '.string', vals: ["\"du LABO du PROF. KOSMO.$\""] },
  { kind: '.string', vals: ["\"Cela fait très longtemps que cette\\n\""] },
  { kind: '.string', vals: ["\"région est connue pour ses météorites.\\p\""] },
  { kind: '.string', vals: ["\"Un météorite se serait jadis écrasé,\\n\""] },
  { kind: '.string', vals: ["\"creusant le SITE METEORE.$\""] },
  { kind: '.string', vals: ["\"Tu vois! Regarde!\\n\""] },
  { kind: '.string', vals: ["\"C'est mon cher AZURILL!\\p\""] },
  { kind: '.string', vals: ["\"Il est adroit, et en plus il est doux!$\""] },
  { kind: '.string', vals: ["\"AZURILL: Azuzuuu.$\""] },
  { kind: '.string', vals: ["\"As-tu déjà affronté ADRIANE, le\\n\""] },
  { kind: '.string', vals: ["\"CHAMPION de l'ARENE de VERMILAVA?\\p\""] },
  { kind: '.string', vals: ["\"Son grand-père était célèbre.\\n\""] },
  { kind: '.string', vals: ["\"Il a fait partie du CONSEIL 4\\l\""] },
  { kind: '.string', vals: ["\"de la LIGUE POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Ça ne me surprendrait pas de voir\\n\""] },
  { kind: '.string', vals: ["\"ADRIANE devenir un grand DRESSEUR\\l\""] },
  { kind: '.string', vals: ["\"à son tour.$\""] },
  { kind: '.string', vals: ["\"TENTE DE COMBAT d'AUTEQUIA\\n\""] },
  { kind: '.string', vals: ["\"“Que les meilleures équipes\\l\""] },
  { kind: '.string', vals: ["\"se rencontrent!”$\""] },
  { kind: '.string', vals: ["\"AUTEQUIA\\n\""] },
  { kind: '.string', vals: ["\"“Une communauté agricole et ses\\l\""] },
  { kind: '.string', vals: ["\"petits jardins.”$\""] },
  { kind: '.string', vals: ["\"MAISON DU MAITRE DES CAPACITES\\n\""] },
  { kind: '.string', vals: ["\"“Venez apprendre de nouvelles\\l\""] },
  { kind: '.string', vals: ["\"capacités à vos POKéMON!”$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 32 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","FallarborTown_OnTransition"]},
  {op:"setflag",args:["FLAG_VISITED_FALLARBOR_TOWN"]},
  {op:"setvar",args:["VAR_CONTEST_HALL_STATE",0]},
  {op:"clearflag",args:["FLAG_CONTEST_SKETCH_CREATED"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY","FallarborTown_EventScript_ExpertMNormal"]},
  {op:"msgbox",args:["FallarborTown_Text_ShadyCharactersCozmosHome","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FallarborTown_Text_RegionKnownForMeteors","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FallarborTown_Text_MyPreciousAzurill","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FallarborTown_Text_HaveYouChallengedFlannery","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"waitse",args:[]},
  {op:"playmoncry",args:["SPECIES_AZURILL","CRY_MODE_NORMAL"]},
  {op:"msgbox",args:["FallarborTown_Text_Azurill","MSGBOX_DEFAULT"]},
  {op:"waitmoncry",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FallarborTown_Text_BattleTentSign","MSGBOX_SIGN"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FallarborTown_Text_TownSign","MSGBOX_SIGN"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FallarborTown_Text_MoveTutorSign","MSGBOX_SIGN"]},
  {op:"end",args:[]},
] as const;
