// AUTO-GENERATED from data/maps/MossdeepCity_House1/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MossdeepCity_House1/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MossdeepCity_House1_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MossdeepCity_House1_EventScript_BlackBelt', isGlobal: true, instrIndex: 0 },
  { name: 'MossdeepCity_House1_EventScript_NeutralNature', isGlobal: true, instrIndex: 9 },
  { name: 'MossdeepCity_House1_EventScript_Woman', isGlobal: true, instrIndex: 12 },
  { name: 'MossdeepCity_House1_Text_HmmYourPokemon', isGlobal: false, instrIndex: 14 },
  { name: 'MossdeepCity_House1_Text_ItLikesXPokeblocks', isGlobal: false, instrIndex: 14 },
  { name: 'MossdeepCity_House1_Text_DoesntLikeOrDislikePokeblocks', isGlobal: false, instrIndex: 14 },
  { name: 'MossdeepCity_House1_Text_HusbandCanTellPokeblockMonLikes', isGlobal: false, instrIndex: 14 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=10
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Hum!\\n\""] },
  { kind: '.string', vals: ["\"Ton {STR_VAR_1}…$\""] },
  { kind: '.string', vals: ["\"Un {STR_VAR_1}, il aime bien ça,\\n\""] },
  { kind: '.string', vals: ["\"n'est-ce pas?\\p\""] },
  { kind: '.string', vals: ["\"Je suis catégorique là-dessus! Il aime\\n\""] },
  { kind: '.string', vals: ["\"beaucoup le {STR_VAR_1}.$\""] },
  { kind: '.string', vals: ["\"Il semble insensible aux différents\\n\""] },
  { kind: '.string', vals: ["\"goûts des {POKEBLOCK}S.$\""] },
  { kind: '.string', vals: ["\"En un clin d'œil, mon mari peut dire\\n\""] },
  { kind: '.string', vals: ["\"quels {POKEBLOCK}S un POKéMON aime.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 14 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"bufferleadmonspeciesname",args:["STR_VAR_1"]},
  {op:"msgbox",args:["MossdeepCity_House1_Text_HmmYourPokemon","MSGBOX_DEFAULT"]},
  {op:"specialvar",args:["VAR_RESULT","GetPokeblockNameByMonNature"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"MossdeepCity_House1_EventScript_NeutralNature"]},
  {op:"msgbox",args:["MossdeepCity_House1_Text_ItLikesXPokeblocks","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MossdeepCity_House1_Text_DoesntLikeOrDislikePokeblocks","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MossdeepCity_House1_Text_HusbandCanTellPokeblockMonLikes","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
