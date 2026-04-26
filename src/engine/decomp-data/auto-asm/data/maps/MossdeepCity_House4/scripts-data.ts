// AUTO-GENERATED from data/maps/MossdeepCity_House4/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MossdeepCity_House4/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MossdeepCity_House4_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MossdeepCity_House4_EventScript_Woman', isGlobal: true, instrIndex: 0 },
  { name: 'MossdeepCity_House4_EventScript_CanBattleAtSecretBases', isGlobal: true, instrIndex: 6 },
  { name: 'MossdeepCity_House4_EventScript_NinjaBoy', isGlobal: true, instrIndex: 9 },
  { name: 'MossdeepCity_House4_EventScript_NoSecretBase', isGlobal: true, instrIndex: 17 },
  { name: 'MossdeepCity_House4_EventScript_Skitty', isGlobal: true, instrIndex: 20 },
  { name: 'MossdeepCity_House4_Text_BrotherLikesToFindBases', isGlobal: false, instrIndex: 28 },
  { name: 'MossdeepCity_House4_Text_BrotherLikesToVisitBasesAndBattle', isGlobal: false, instrIndex: 28 },
  { name: 'MossdeepCity_House4_Text_YouMadeSecretBaseNearX', isGlobal: false, instrIndex: 28 },
  { name: 'MossdeepCity_House4_Text_MakeSecretBase', isGlobal: false, instrIndex: 28 },
  { name: 'MossdeepCity_House4_Text_Skitty', isGlobal: false, instrIndex: 28 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=11
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Mon petit frère dit qu'il aime bien\\n\""] },
  { kind: '.string', vals: ["\"chercher les BASES SECRETES\\l\""] },
  { kind: '.string', vals: ["\"des autres.$\""] },
  { kind: '.string', vals: ["\"Mon petit frère dit qu'il aime bien voir\\n\""] },
  { kind: '.string', vals: ["\"les BASES SECRETES des autres\\l\""] },
  { kind: '.string', vals: ["\"et mener des combats de POKéMON.$\""] },
  { kind: '.string', vals: ["\"C'est toi qui as aménagé une BASE\\n\""] },
  { kind: '.string', vals: ["\"SECRETE {STR_VAR_1}?$\""] },
  { kind: '.string', vals: ["\"Tu devrais t'aménager une BASE SECRETE\\n\""] },
  { kind: '.string', vals: ["\"quelque part. J'irai la chercher!$\""] },
  { kind: '.string', vals: ["\"DELCATTY: Delcaaah?$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 28 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_SYS_GAME_CLEAR","MossdeepCity_House4_EventScript_CanBattleAtSecretBases"]},
  {op:"msgbox",args:["MossdeepCity_House4_Text_BrotherLikesToFindBases","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MossdeepCity_House4_Text_BrotherLikesToVisitBasesAndBattle","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"special",args:["CheckPlayerHasSecretBase"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"MossdeepCity_House4_EventScript_NoSecretBase"]},
  {op:"special",args:["GetSecretBaseNearbyMapName"]},
  {op:"msgbox",args:["MossdeepCity_House4_Text_YouMadeSecretBaseNearX","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MossdeepCity_House4_Text_MakeSecretBase","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"waitse",args:[]},
  {op:"playmoncry",args:["SPECIES_SKITTY","CRY_MODE_NORMAL"]},
  {op:"msgbox",args:["MossdeepCity_House4_Text_Skitty","MSGBOX_DEFAULT"]},
  {op:"waitmoncry",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
