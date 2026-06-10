// AUTO-GENERATED from data/maps/RustboroCity_House1/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/RustboroCity_House1/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'RustboroCity_House1_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'RustboroCity_House1_EventScript_Trader', isGlobal: true, instrIndex: 0 },
  { name: 'RustboroCity_House1_EventScript_DeclineTrade', isGlobal: true, instrIndex: 24 },
  { name: 'RustboroCity_House1_EventScript_NotRequestedMon', isGlobal: true, instrIndex: 27 },
  { name: 'RustboroCity_House1_EventScript_TradeCompleted', isGlobal: true, instrIndex: 31 },
  { name: 'RustboroCity_House1_EventScript_Hiker', isGlobal: true, instrIndex: 34 },
  { name: 'RustboroCity_House1_Text_IllTradeIfYouWant', isGlobal: false, instrIndex: 36 },
  { name: 'RustboroCity_House1_Text_PleaseBeGoodToMyPokemon', isGlobal: false, instrIndex: 36 },
  { name: 'RustboroCity_House1_Text_DoesntLookLikeMonToMe', isGlobal: false, instrIndex: 36 },
  { name: 'RustboroCity_House1_Text_YouDontWantToThatsOkay', isGlobal: false, instrIndex: 36 },
  { name: 'RustboroCity_House1_Text_AnyPokemonCanBeCute', isGlobal: false, instrIndex: 36 },
  { name: 'RustboroCity_House1_Text_AllSortsOfPlaces', isGlobal: false, instrIndex: 36 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=18
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Hein? Mon POKéMON est mignon?\\n\""] },
  { kind: '.string', vals: ["\"Bien sûr que je le sais.\\p\""] },
  { kind: '.string', vals: ["\"Mais si tu veux, je suis d'accord pour\\n\""] },
  { kind: '.string', vals: ["\"te l'échanger.\\p\""] },
  { kind: '.string', vals: ["\"Je t'échange mon {STR_VAR_2} contre\\n\""] },
  { kind: '.string', vals: ["\"un {STR_VAR_1} si tu veux.$\""] },
  { kind: '.string', vals: ["\"Hé hé…\\n\""] },
  { kind: '.string', vals: ["\"Sois sympa avec mon POKéMON.$\""] },
  { kind: '.string', vals: ["\"Hein? Il ressemble pas vraiment à\\n\""] },
  { kind: '.string', vals: ["\"un {STR_VAR_1}!$\""] },
  { kind: '.string', vals: ["\"Oh, si tu ne veux pas, c'est d'accord.\\n\""] },
  { kind: '.string', vals: ["\"Mais il est vraiment mignon, tu sais?$\""] },
  { kind: '.string', vals: ["\"Tous les POKéMON peuvent être mignons\\n\""] },
  { kind: '.string', vals: ["\"s'ils sont élevés avec gentillesse.$\""] },
  { kind: '.string', vals: ["\"Chaque endroit a ses types précis de\\n\""] },
  { kind: '.string', vals: ["\"POKéMON et de personnes.\\p\""] },
  { kind: '.string', vals: ["\"Je trouve ça si fascinant que je me\\n\""] },
  { kind: '.string', vals: ["\"balade un peu partout.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 36 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_RUSTBORO_NPC_TRADE_COMPLETED","RustboroCity_House1_EventScript_TradeCompleted"]},
  {op:"setvar",args:["VAR_0x8008","INGAME_TRADE_SEEDOT"]},
  {op:"copyvar",args:["VAR_0x8004","VAR_0x8008"]},
  {op:"specialvar",args:["VAR_RESULT","GetInGameTradeSpeciesInfo"]},
  {op:"copyvar",args:["VAR_0x8009","VAR_RESULT"]},
  {op:"msgbox",args:["RustboroCity_House1_Text_IllTradeIfYouWant","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","NO","RustboroCity_House1_EventScript_DeclineTrade"]},
  {op:"special",args:["ChoosePartyMon"]},
  {op:"copyvar",args:["VAR_0x800A","VAR_0x8004"]},
  {op:"goto_if_eq",args:["VAR_0x8004","PARTY_NOTHING_CHOSEN","RustboroCity_House1_EventScript_DeclineTrade"]},
  {op:"copyvar",args:["VAR_0x8005","VAR_0x800A"]},
  {op:"specialvar",args:["VAR_RESULT","GetTradeSpecies"]},
  {op:"copyvar",args:["VAR_0x800B","VAR_RESULT"]},
  {op:"goto_if_ne",args:["VAR_RESULT","VAR_0x8009","RustboroCity_House1_EventScript_NotRequestedMon"]},
  {op:"copyvar",args:["VAR_0x8004","VAR_0x8008"]},
  {op:"copyvar",args:["VAR_0x8005","VAR_0x800A"]},
  {op:"special",args:["CreateInGameTradePokemon"]},
  {op:"special",args:["DoInGameTradeScene"]},
  {op:"msgbox",args:["RustboroCity_House1_Text_PleaseBeGoodToMyPokemon","MSGBOX_DEFAULT"]},
  {op:"setflag",args:["FLAG_RUSTBORO_NPC_TRADE_COMPLETED"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["RustboroCity_House1_Text_YouDontWantToThatsOkay","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"bufferspeciesname",args:["STR_VAR_1","VAR_0x8009"]},
  {op:"msgbox",args:["RustboroCity_House1_Text_DoesntLookLikeMonToMe","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["RustboroCity_House1_Text_AnyPokemonCanBeCute","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["RustboroCity_House1_Text_AllSortsOfPlaces","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
