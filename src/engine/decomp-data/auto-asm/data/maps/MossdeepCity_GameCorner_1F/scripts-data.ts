// AUTO-GENERATED from data/maps/MossdeepCity_GameCorner_1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MossdeepCity_GameCorner_1F/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MossdeepCity_GameCorner_1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MossdeepCity_GameCorner_1F_OnWarp', isGlobal: false, instrIndex: 3 },
  { name: 'MossdeepCity_GameCorner_1F_OnFrame', isGlobal: false, instrIndex: 4 },
  { name: 'MossdeepCity_GameCorner_1F_EventScript_InfoMan', isGlobal: true, instrIndex: 5 },
  { name: 'MossdeepCity_GameCorner_1F_EventScript_OldMan', isGlobal: true, instrIndex: 10 },
  { name: 'RS_MysteryEventsHouse_EventScript_Door', isGlobal: true, instrIndex: 15 },
  { name: 'RS_MysteryEventsHouse_Text_OldManGreeting', isGlobal: false, instrIndex: 17 },
  { name: 'RS_MysteryEventsHouse_Text_DoorIsLocked', isGlobal: false, instrIndex: 17 },
  { name: 'RS_MysteryEventsHouse_Text_ChallengeVisitingTrainer', isGlobal: false, instrIndex: 17 },
  { name: 'RS_MysteryEventsHouse_Text_YouWontBattle', isGlobal: false, instrIndex: 17 },
  { name: 'RS_MysteryEventsHouse_Text_KeepItToA3On3', isGlobal: false, instrIndex: 17 },
  { name: 'RS_MysteryEventsHouse_Text_SaveYourProgress', isGlobal: false, instrIndex: 17 },
  { name: 'RS_MysteryEventsHouse_Text_HopeToSeeAGoodMatch', isGlobal: false, instrIndex: 17 },
  { name: 'RS_MysteryEventsHouse_Text_BattleTie', isGlobal: false, instrIndex: 17 },
  { name: 'RS_MysteryEventsHouse_Text_BattleWon', isGlobal: false, instrIndex: 17 },
  { name: 'RS_MysteryEventsHouse_Text_BattleLost', isGlobal: false, instrIndex: 17 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=2, .string=28
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.2byte', vals: [0] },
  { kind: '.string', vals: ["\"When I was young, I traveled the world\\n\""] },
  { kind: '.string', vals: ["\"as a POKéMON TRAINER.\\p\""] },
  { kind: '.string', vals: ["\"Now that I've become an old buzzard,\\n\""] },
  { kind: '.string', vals: ["\"my only amusement is watching young\\l\""] },
  { kind: '.string', vals: ["\"TRAINERS battle.$\""] },
  { kind: '.string', vals: ["\"La porte semble être verrouillée.$\""] },
  { kind: '.string', vals: ["\"A TRAINER named {STR_VAR_1} is\\n\""] },
  { kind: '.string', vals: ["\"visiting my home.\\p\""] },
  { kind: '.string', vals: ["\"Would you like to challenge\\n\""] },
  { kind: '.string', vals: ["\"{STR_VAR_1}?$\""] },
  { kind: '.string', vals: ["\"You won't battle? I'm disappointed\\n\""] },
  { kind: '.string', vals: ["\"that I can't see you battle…$\""] },
  { kind: '.string', vals: ["\"Oh, good, good!\\p\""] },
  { kind: '.string', vals: ["\"But my house isn't all that sturdy.\\p\""] },
  { kind: '.string', vals: ["\"Could I ask you to keep it down to\\n\""] },
  { kind: '.string', vals: ["\"a 3-on-3 match?$\""] },
  { kind: '.string', vals: ["\"Before you two battle, you should\\n\""] },
  { kind: '.string', vals: ["\"save your progress.$\""] },
  { kind: '.string', vals: ["\"I hope to see a good match!$\""] },
  { kind: '.string', vals: ["\"So, it became a standoff.\\p\""] },
  { kind: '.string', vals: ["\"It was a brilliant match in which\\n\""] },
  { kind: '.string', vals: ["\"neither side conceded a step!$\""] },
  { kind: '.string', vals: ["\"That was superlative!\\p\""] },
  { kind: '.string', vals: ["\"Why, it was like seeing myself in\\n\""] },
  { kind: '.string', vals: ["\"my youth again!$\""] },
  { kind: '.string', vals: ["\"Ah, too bad for you!\\p\""] },
  { kind: '.string', vals: ["\"But it was a good match.\\n\""] },
  { kind: '.string', vals: ["\"I hope you can win next time.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 17 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_FRAME_TABLE","MossdeepCity_GameCorner_1F_OnFrame"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE","MossdeepCity_GameCorner_1F_OnWarp"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_LOAD","CableClub_OnLoad"]},
  {op:"map_script_2",args:["VAR_CABLE_CLUB_STATE","USING_MINIGAME","CableClub_EventScript_CheckTurnAttendant"]},
  {op:"map_script_2",args:["VAR_CABLE_CLUB_STATE","USING_MINIGAME","CableClub_EventScript_ExitMinigameRoom"]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto",args:["MossdeepCity_GameCorner_1F_EventScript_InfoMan2"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto",args:["MossdeepCity_GameCorner_1F_EventScript_OldMan2"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["RS_MysteryEventsHouse_Text_DoorIsLocked","MSGBOX_SIGN"]},
  {op:"end",args:[]},
] as const;
