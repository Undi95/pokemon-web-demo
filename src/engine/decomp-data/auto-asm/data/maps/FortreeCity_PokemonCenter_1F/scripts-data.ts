// AUTO-GENERATED from data/maps/FortreeCity_PokemonCenter_1F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/FortreeCity_PokemonCenter_1F/scripts.inc
// Generated: 2026-04-26

// ─── .equ / .set constants ──────────────────────────────────────────────────
export const LOCALID_NURSE = 1;

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'FortreeCity_PokemonCenter_1F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'FortreeCity_PokemonCenter_1F_OnTransition', isGlobal: false, instrIndex: 2 },
  { name: 'FortreeCity_PokemonCenter_1F_EventScript_Nurse', isGlobal: true, instrIndex: 4 },
  { name: 'FortreeCity_PokemonCenter_1F_EventScript_Gentleman', isGlobal: true, instrIndex: 10 },
  { name: 'FortreeCity_PokemonCenter_1F_EventScript_Man', isGlobal: true, instrIndex: 12 },
  { name: 'FortreeCity_PokemonCenter_1F_EventScript_Boy', isGlobal: true, instrIndex: 14 },
  { name: 'FortreeCity_PokemonCenter_1F_Text_GoToSafariZone', isGlobal: false, instrIndex: 16 },
  { name: 'FortreeCity_PokemonCenter_1F_Text_RecordCornerIsNeat', isGlobal: false, instrIndex: 16 },
  { name: 'FortreeCity_PokemonCenter_1F_Text_DoYouKnowAboutPokenav', isGlobal: false, instrIndex: 16 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=19
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Ecoute, mon petit, est-ce que tu\\n\""] },
  { kind: '.string', vals: ["\"travailles sur un POKéDEX?\\p\""] },
  { kind: '.string', vals: ["\"Hum… Va au PARC SAFARI, sur la\\n\""] },
  { kind: '.string', vals: ["\"ROUTE 121! C'est mon conseil.$\""] },
  { kind: '.string', vals: ["\"Tu as déjà fait quelque chose au\\n\""] },
  { kind: '.string', vals: ["\"CENTRE DE DONNEES?\\p\""] },
  { kind: '.string', vals: ["\"C'est ingénieux. Ça permet d'échanger\\n\""] },
  { kind: '.string', vals: ["\"des données entre DRESSEURS.\\p\""] },
  { kind: '.string', vals: ["\"Je sais pas trop comment ça marche,\\n\""] },
  { kind: '.string', vals: ["\"mais c'est cool. C'est même génial!$\""] },
  { kind: '.string', vals: ["\"Hé, tu as un POKéNAV!\\n\""] },
  { kind: '.string', vals: ["\"C'est le même que le mien!\\p\""] },
  { kind: '.string', vals: ["\"Tu connais la fonction MATCH PHONE?\\p\""] },
  { kind: '.string', vals: ["\"Utilise-la pour tchater avec les\\n\""] },
  { kind: '.string', vals: ["\"DRESSEURS que tu auras enregistrés.\\p\""] },
  { kind: '.string', vals: ["\"Cette option t'indique aussi les\\n\""] },
  { kind: '.string', vals: ["\"DRESSEURS souhaitant une revanche.\\p\""] },
  { kind: '.string', vals: ["\"C'est pas génial?\\n\""] },
  { kind: '.string', vals: ["\"Y a pas mieux que DEVON!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 16 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","FortreeCity_PokemonCenter_1F_OnTransition"]},
  {op:"map_script",args:["MAP_SCRIPT_ON_RESUME","CableClub_OnResume"]},
  {op:"setrespawn",args:["HEAL_LOCATION_FORTREE_CITY"]},
  {op:"end",args:[]},
  {op:"setvar",args:["VAR_0x800B","LOCALID_NURSE"]},
  {op:"call",args:["Common_EventScript_PkmnCenterNurse"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FortreeCity_PokemonCenter_1F_Text_GoToSafariZone","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FortreeCity_PokemonCenter_1F_Text_RecordCornerIsNeat","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FortreeCity_PokemonCenter_1F_Text_DoYouKnowAboutPokenav","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
