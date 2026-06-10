// AUTO-GENERATED from data/maps/PacifidlogTown_House3/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/PacifidlogTown_House3/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'PacifidlogTown_House3_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'PacifidlogTown_House3_EventScript_Trader', isGlobal: true, instrIndex: 0 },
  { name: 'PacifidlogTown_House3_EventScript_DeclineTrade', isGlobal: true, instrIndex: 25 },
  { name: 'PacifidlogTown_House3_EventScript_NotRequestedMon', isGlobal: true, instrIndex: 28 },
  { name: 'PacifidlogTown_House3_EventScript_TradeCompleted', isGlobal: true, instrIndex: 32 },
  { name: 'PacifidlogTown_House3_EventScript_Girl', isGlobal: true, instrIndex: 35 },
  { name: 'PacifidlogTown_House3_Text_WillingToTradeIt', isGlobal: false, instrIndex: 37 },
  { name: 'PacifidlogTown_House3_Text_ItsSubtlyDifferentThankYou', isGlobal: false, instrIndex: 37 },
  { name: 'PacifidlogTown_House3_Text_WontAcceptAnyLessThanRealMon', isGlobal: false, instrIndex: 37 },
  { name: 'PacifidlogTown_House3_Text_NotDesperateOrAnything', isGlobal: false, instrIndex: 37 },
  { name: 'PacifidlogTown_House3_Text_ReallyWantedToGetBagon', isGlobal: false, instrIndex: 37 },
  { name: 'PacifidlogTown_House3_Text_IsThatAPokedex', isGlobal: false, instrIndex: 37 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=23
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Regarde-moi ce {STR_VAR_2}!\\p\""] },
  { kind: '.string', vals: ["\"Je l'ai attrapé hier pour fêter mon\\n\""] },
  { kind: '.string', vals: ["\"anniversaire!\\p\""] },
  { kind: '.string', vals: ["\"Il te plaît, on dirait!\\n\""] },
  { kind: '.string', vals: ["\"Comme je te comprends…\\p\""] },
  { kind: '.string', vals: ["\"Bon… J'accepterais peut-être\\n\""] },
  { kind: '.string', vals: ["\"de l'échanger contre un {STR_VAR_1}.$\""] },
  { kind: '.string', vals: ["\"Oh, c'est un {STR_VAR_1}?\\p\""] },
  { kind: '.string', vals: ["\"Ça ressemble à un {STR_VAR_2}, la\\n\""] },
  { kind: '.string', vals: ["\"différence est subtile.\\p\""] },
  { kind: '.string', vals: ["\"Merci!$\""] },
  { kind: '.string', vals: ["\"Non, non et non! Un {STR_VAR_1}\\n\""] },
  { kind: '.string', vals: ["\"sinon rien!$\""] },
  { kind: '.string', vals: ["\"Oh, pas d'échange alors?\\p\""] },
  { kind: '.string', vals: ["\"Pas de problème. Je n'insiste pas.$\""] },
  { kind: '.string', vals: ["\"Je sais que j'aurais pu m'en trouver un\\n\""] },
  { kind: '.string', vals: ["\"moi-même…\\p\""] },
  { kind: '.string', vals: ["\"Mais je voulais un DRABY attrapé par un\\n\""] },
  { kind: '.string', vals: ["\"autre DRESSEUR…$\""] },
  { kind: '.string', vals: ["\"C'est un POKéDEX?\\p\""] },
  { kind: '.string', vals: ["\"Tu as rencontré beaucoup de POKéMON\\n\""] },
  { kind: '.string', vals: ["\"différents?\\p\""] },
  { kind: '.string', vals: ["\"J'aimerais bien être comme toi.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 37 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_PACIFIDLOG_NPC_TRADE_COMPLETED","PacifidlogTown_House3_EventScript_TradeCompleted"]},
  {op:"setvar",args:["VAR_0x8008","INGAME_TRADE_HORSEA"]},
  {op:"copyvar",args:["VAR_0x8004","VAR_0x8008"]},
  {op:"specialvar",args:["VAR_RESULT","GetInGameTradeSpeciesInfo"]},
  {op:"copyvar",args:["VAR_0x8009","VAR_RESULT"]},
  {op:"msgbox",args:["PacifidlogTown_House3_Text_WillingToTradeIt","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","NO","PacifidlogTown_House3_EventScript_DeclineTrade"]},
  {op:"special",args:["ChoosePartyMon"]},
  {op:"copyvar",args:["VAR_0x800A","VAR_0x8004"]},
  {op:"goto_if_eq",args:["VAR_0x8004","PARTY_NOTHING_CHOSEN","PacifidlogTown_House3_EventScript_DeclineTrade"]},
  {op:"copyvar",args:["VAR_0x8005","VAR_0x800A"]},
  {op:"specialvar",args:["VAR_RESULT","GetTradeSpecies"]},
  {op:"copyvar",args:["VAR_0x800B","VAR_RESULT"]},
  {op:"goto_if_ne",args:["VAR_RESULT","VAR_0x8009","PacifidlogTown_House3_EventScript_NotRequestedMon"]},
  {op:"copyvar",args:["VAR_0x8004","VAR_0x8008"]},
  {op:"copyvar",args:["VAR_0x8005","VAR_0x800A"]},
  {op:"special",args:["CreateInGameTradePokemon"]},
  {op:"special",args:["DoInGameTradeScene"]},
  {op:"bufferspeciesname",args:["STR_VAR_1","VAR_0x8009"]},
  {op:"msgbox",args:["PacifidlogTown_House3_Text_ItsSubtlyDifferentThankYou","MSGBOX_DEFAULT"]},
  {op:"setflag",args:["FLAG_PACIFIDLOG_NPC_TRADE_COMPLETED"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["PacifidlogTown_House3_Text_NotDesperateOrAnything","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"bufferspeciesname",args:["STR_VAR_1","VAR_0x8009"]},
  {op:"msgbox",args:["PacifidlogTown_House3_Text_WontAcceptAnyLessThanRealMon","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["PacifidlogTown_House3_Text_ReallyWantedToGetBagon","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["PacifidlogTown_House3_Text_IsThatAPokedex","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
