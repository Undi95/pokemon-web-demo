// AUTO-GENERATED from data/maps/VerdanturfTown_Mart/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/VerdanturfTown_Mart/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'VerdanturfTown_Mart_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'VerdanturfTown_Mart_EventScript_Clerk', isGlobal: true, instrIndex: 0 },
  { name: 'VerdanturfTown_Mart_Pokemart', isGlobal: false, instrIndex: 8 },
  { name: 'VerdanturfTown_Mart_EventScript_Boy', isGlobal: true, instrIndex: 9 },
  { name: 'VerdanturfTown_Mart_EventScript_ExpertF', isGlobal: true, instrIndex: 11 },
  { name: 'VerdanturfTown_Mart_EventScript_Lass', isGlobal: true, instrIndex: 13 },
  { name: 'VerdanturfTown_Mart_Text_XSpecialIsCrucial', isGlobal: false, instrIndex: 15 },
  { name: 'VerdanturfTown_Mart_Text_NoStrategyGuidesForBattleTent', isGlobal: false, instrIndex: 15 },
  { name: 'VerdanturfTown_Mart_Text_NestBallOnWeakenedPokemon', isGlobal: false, instrIndex: 15 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=11, .string=11
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: ["ITEM_GREAT_BALL"] },
  { kind: '.2byte', vals: ["ITEM_NEST_BALL"] },
  { kind: '.2byte', vals: ["ITEM_SUPER_POTION"] },
  { kind: '.2byte', vals: ["ITEM_ANTIDOTE"] },
  { kind: '.2byte', vals: ["ITEM_PARALYZE_HEAL"] },
  { kind: '.2byte', vals: ["ITEM_AWAKENING"] },
  { kind: '.2byte', vals: ["ITEM_BURN_HEAL"] },
  { kind: '.2byte', vals: ["ITEM_ICE_HEAL"] },
  { kind: '.2byte', vals: ["ITEM_REPEL"] },
  { kind: '.2byte', vals: ["ITEM_X_SPECIAL"] },
  { kind: '.2byte', vals: ["ITEM_FLUFFY_TAIL"] },
  { kind: '.string', vals: ["\"Pour les combats de POKéMON, SPECIAL +\\n\""] },
  { kind: '.string', vals: ["\"est crucial.\\p\""] },
  { kind: '.string', vals: ["\"Cela permet d'augmenter la puissance de\\n\""] },
  { kind: '.string', vals: ["\"certaines attaques pendant un combat.$\""] },
  { kind: '.string', vals: ["\"Je ne trouve aucun livre de stratégie\\n\""] },
  { kind: '.string', vals: ["\"sur les TENTES DE COMBAT…\\p\""] },
  { kind: '.string', vals: ["\"Peut-être qu'il faut simplement suivre\\n\""] },
  { kind: '.string', vals: ["\"son instinct, après tout…$\""] },
  { kind: '.string', vals: ["\"La FAIBLO BALL fonctionne mieux\\n\""] },
  { kind: '.string', vals: ["\"sur les POKéMON faibles.\\p\""] },
  { kind: '.string', vals: ["\"On ne peut en acheter qu'à VERGAZON.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 15 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"message",args:["gText_HowMayIServeYou"]},
  {op:"waitmessage",args:[]},
  {op:"pokemart",args:["VerdanturfTown_Mart_Pokemart"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
  {op:"msgbox",args:["VerdanturfTown_Mart_Text_XSpecialIsCrucial","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["VerdanturfTown_Mart_Text_NoStrategyGuidesForBattleTent","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["VerdanturfTown_Mart_Text_NestBallOnWeakenedPokemon","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
