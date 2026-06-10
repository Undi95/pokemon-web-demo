// AUTO-GENERATED from data/maps/VerdanturfTown_PokemonCenter_1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/VerdanturfTown_PokemonCenter_1F/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'VerdanturfTown_PokemonCenter_1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'VerdanturfTown_PokemonCenter_1F_OnTransition', isGlobal: false, instrIndex: 2 },
  { name: 'VerdanturfTown_PokemonCenter_1F_EventScript_Nurse', isGlobal: true, instrIndex: 5 },
  { name: 'VerdanturfTown_PokemonCenter_1F_EventScript_Gentleman', isGlobal: true, instrIndex: 11 },
  { name: 'VerdanturfTown_PokemonCenter_1F_EventScript_ExpertM', isGlobal: true, instrIndex: 13 },
  { name: 'VerdanturfTown_PokemonCenter_1F_Text_FaithInYourPokemon', isGlobal: false, instrIndex: 15 },
  { name: 'VerdanturfTown_PokemonCenter_1F_Text_VisitForBattleTent', isGlobal: false, instrIndex: 15 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=8
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Tu n'es pas un vrai DRESSEUR\\n\""] },
  { kind: '.string', vals: ["\"si tu ne crois pas en tes POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Pour réussir, il faut avoir une entière\\n\""] },
  { kind: '.string', vals: ["\"confiance en ses POKéMON.$\""] },
  { kind: '.string', vals: ["\"Si les gens viennent à VERGAZON…\\p\""] },
  { kind: '.string', vals: ["\"c'est pour la TENTE DE COMBAT, bien sûr.\\p\""] },
  { kind: '.string', vals: ["\"Tiens, toi par exemple. Que viens-tu\\n\""] },
  { kind: '.string', vals: ["\"faire ici?$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 15 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","VerdanturfTown_PokemonCenter_1F_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","CableClub_OnResume"]},
  {op:"setrespawn",args:["HEAL_LOCATION_VERDANTURF_TOWN"]},
  {op:"call",args:["Common_EventScript_UpdateBrineyLocation"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_0x800B","LOCALID_VERDANTURF_NURSE"]},
  {op:"call",args:["Common_EventScript_PkmnCenterNurse"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["VerdanturfTown_PokemonCenter_1F_Text_FaithInYourPokemon","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["VerdanturfTown_PokemonCenter_1F_Text_VisitForBattleTent","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
