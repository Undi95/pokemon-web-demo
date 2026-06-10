// AUTO-GENERATED from data/maps/PacifidlogTown_House4/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/PacifidlogTown_House4/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'PacifidlogTown_House4_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'PacifidlogTown_House4_EventScript_LittleGirl', isGlobal: true, instrIndex: 0 },
  { name: 'PacifidlogTown_House4_EventScript_Woman', isGlobal: true, instrIndex: 2 },
  { name: 'PacifidlogTown_House4_EventScript_Boy', isGlobal: true, instrIndex: 4 },
  { name: 'PacifidlogTown_House4_EventScript_Yes', isGlobal: true, instrIndex: 10 },
  { name: 'PacifidlogTown_House4_EventScript_No', isGlobal: true, instrIndex: 13 },
  { name: 'PacifidlogTown_House4_Text_PeopleSawHighFlyingPokemon', isGlobal: false, instrIndex: 16 },
  { name: 'PacifidlogTown_House4_Text_SkyPokemon', isGlobal: false, instrIndex: 16 },
  { name: 'PacifidlogTown_House4_Text_WhereDidYouComeFrom', isGlobal: false, instrIndex: 16 },
  { name: 'PacifidlogTown_House4_Text_YesTown', isGlobal: false, instrIndex: 16 },
  { name: 'PacifidlogTown_House4_Text_YouHaveToComeFromSomewhere', isGlobal: false, instrIndex: 16 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=16
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Les gens racontent qu'ils ont vu un\\n\""] },
  { kind: '.string', vals: ["\"POKéMON VOLANT au-dessus de\\l\""] },
  { kind: '.string', vals: ["\"la région de HOENN.\\p\""] },
  { kind: '.string', vals: ["\"Est-ce qu'il vole tout le temps?\\n\""] },
  { kind: '.string', vals: ["\"Il doit bien se reposer, non?$\""] },
  { kind: '.string', vals: ["\"Un POKéMON ciel!\\n\""] },
  { kind: '.string', vals: ["\"Un POKéMON ciel!$\""] },
  { kind: '.string', vals: ["\"D'où viens-tu?$\""] },
  { kind: '.string', vals: ["\"Oui?\\n\""] },
  { kind: '.string', vals: ["\"OUI VILLE?\\p\""] },
  { kind: '.string', vals: ["\"Je n'ai jamais entendu parler de\\n\""] },
  { kind: '.string', vals: ["\"cet endroit.$\""] },
  { kind: '.string', vals: ["\"Non? Mais c'est n'importe quoi.\\n\""] },
  { kind: '.string', vals: ["\"Tu dois bien venir de quelque part.\\p\""] },
  { kind: '.string', vals: ["\"Oh! Attends! Tu ne vas pas me dire que\\n\""] },
  { kind: '.string', vals: ["\"tu viens du fond de l'océan?$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 16 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["PacifidlogTown_House4_Text_SkyPokemon","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["PacifidlogTown_House4_Text_PeopleSawHighFlyingPokemon","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"msgbox",args:["PacifidlogTown_House4_Text_WhereDidYouComeFrom","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","YES","PacifidlogTown_House4_EventScript_Yes"]},
  {op:"goto_if_eq",args:["VAR_RESULT","NO","PacifidlogTown_House4_EventScript_No"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["PacifidlogTown_House4_Text_YesTown","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["PacifidlogTown_House4_Text_YouHaveToComeFromSomewhere","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
