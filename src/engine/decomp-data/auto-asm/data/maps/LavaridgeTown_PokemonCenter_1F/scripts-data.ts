// AUTO-GENERATED from data/maps/LavaridgeTown_PokemonCenter_1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/LavaridgeTown_PokemonCenter_1F/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'LavaridgeTown_PokemonCenter_1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'LavaridgeTown_PokemonCenter_1F_OnTransition', isGlobal: false, instrIndex: 2 },
  { name: 'LavaridgeTown_PokemonCenter_1F_EventScript_Nurse', isGlobal: true, instrIndex: 5 },
  { name: 'LavaridgeTown_PokemonCenter_1F_EventScript_Youngster', isGlobal: true, instrIndex: 11 },
  { name: 'LavaridgeTown_PokemonCenter_1F_EventScript_Woman', isGlobal: true, instrIndex: 13 },
  { name: 'LavaridgeTown_PokemonCenter_1F_EventScript_Gentleman', isGlobal: true, instrIndex: 15 },
  { name: 'LavaridgeTown_PokemonCenter_1F_Text_TrainersPokemonSpendTimeTogether', isGlobal: false, instrIndex: 17 },
  { name: 'LavaridgeTown_PokemonCenter_1F_Text_HotSpringCanInvigorate', isGlobal: false, instrIndex: 17 },
  { name: 'LavaridgeTown_PokemonCenter_1F_Text_TrainersShouldRestToo', isGlobal: false, instrIndex: 17 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=13
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Je crois que les POKéMON deviennent\\n\""] },
  { kind: '.string', vals: ["\"plus proches de leurs DRESSEURS s'ils\\l\""] },
  { kind: '.string', vals: ["\"passent du temps ensemble.\\p\""] },
  { kind: '.string', vals: ["\"Plus ils passent de temps ensemble,\\n\""] },
  { kind: '.string', vals: ["\"plus ils sont proches. J'en suis sûre.$\""] },
  { kind: '.string', vals: ["\"Les sources chaudes me font un bien\\n\""] },
  { kind: '.string', vals: ["\"fou.\\p\""] },
  { kind: '.string', vals: ["\"J'aimerais que mes POKéMON puissent\\n\""] },
  { kind: '.string', vals: ["\"en profiter aussi.$\""] },
  { kind: '.string', vals: ["\"Ho ho! Hé, tu sais que tu peux accéder\\n\""] },
  { kind: '.string', vals: ["\"aux sources chaudes par ici?\\p\""] },
  { kind: '.string', vals: ["\"Puisque les POKéMON se reposent, les\\n\""] },
  { kind: '.string', vals: ["\"DRESSEURS devraient aussi se reposer.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 17 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","LavaridgeTown_PokemonCenter_1F_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","CableClub_OnResume"]},
  {op:"setrespawn",args:["HEAL_LOCATION_LAVARIDGE_TOWN"]},
  {op:"call",args:["Common_EventScript_UpdateBrineyLocation"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_0x800B","LOCALID_LAVARIDGE_NURSE"]},
  {op:"call",args:["Common_EventScript_PkmnCenterNurse"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["LavaridgeTown_PokemonCenter_1F_Text_HotSpringCanInvigorate","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["LavaridgeTown_PokemonCenter_1F_Text_TrainersPokemonSpendTimeTogether","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["LavaridgeTown_PokemonCenter_1F_Text_TrainersShouldRestToo","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
