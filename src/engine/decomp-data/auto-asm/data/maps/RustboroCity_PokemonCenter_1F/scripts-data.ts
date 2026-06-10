// AUTO-GENERATED from data/maps/RustboroCity_PokemonCenter_1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/RustboroCity_PokemonCenter_1F/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'RustboroCity_PokemonCenter_1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'RustboroCity_PokemonCenter_1F_OnTransition', isGlobal: false, instrIndex: 2 },
  { name: 'RustboroCity_PokemonCenter_1F_EventScript_Nurse', isGlobal: true, instrIndex: 5 },
  { name: 'RustboroCity_PokemonCenter_1F_EventScript_Man', isGlobal: true, instrIndex: 11 },
  { name: 'RustboroCity_PokemonCenter_1F_EventScript_Boy', isGlobal: true, instrIndex: 13 },
  { name: 'RustboroCity_PokemonCenter_1F_EventScript_Girl', isGlobal: true, instrIndex: 15 },
  { name: 'RustboroCity_PokemonCenter_1F_Text_PokemonHavePersonalities', isGlobal: false, instrIndex: 17 },
  { name: 'RustboroCity_PokemonCenter_1F_Text_MaleAndFemalePokemon', isGlobal: false, instrIndex: 17 },
  { name: 'RustboroCity_PokemonCenter_1F_Text_HMCutNextDoor', isGlobal: false, instrIndex: 17 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=12
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Mon POKéMON est NAIF et celui de mon\\n\""] },
  { kind: '.string', vals: ["\"ami est JOVIAL. C'est leur nature.\\p\""] },
  { kind: '.string', vals: ["\"C'est fascinant de voir comme les\\n\""] },
  { kind: '.string', vals: ["\"POKéMON ont leur caractère!$\""] },
  { kind: '.string', vals: ["\"Tout comme chez les hommes, il existe\\n\""] },
  { kind: '.string', vals: ["\"des POKéMON mâles et femelles.\\p\""] },
  { kind: '.string', vals: ["\"Mais la différence entre les deux sexes\\n\""] },
  { kind: '.string', vals: ["\"ne saute pas aux yeux.$\""] },
  { kind: '.string', vals: ["\"L'homme de la maison voisine m'a donné\\n\""] },
  { kind: '.string', vals: ["\"une CS!\\p\""] },
  { kind: '.string', vals: ["\"Je l'ai apprise à mon POKéMON pour\\n\""] },
  { kind: '.string', vals: ["\"qu'il COUPE les petits arbres.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 17 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","RustboroCity_PokemonCenter_1F_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","CableClub_OnResume"]},
  {op:"setrespawn",args:["HEAL_LOCATION_RUSTBORO_CITY"]},
  {op:"call",args:["Common_EventScript_UpdateBrineyLocation"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_0x800B","LOCALID_RUSTBORO_NURSE"]},
  {op:"call",args:["Common_EventScript_PkmnCenterNurse"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["RustboroCity_PokemonCenter_1F_Text_PokemonHavePersonalities","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["RustboroCity_PokemonCenter_1F_Text_MaleAndFemalePokemon","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["RustboroCity_PokemonCenter_1F_Text_HMCutNextDoor","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
