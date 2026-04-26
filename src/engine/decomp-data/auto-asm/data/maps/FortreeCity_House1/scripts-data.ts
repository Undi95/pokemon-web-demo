// AUTO-GENERATED from data/maps/FortreeCity_House1/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/FortreeCity_House1/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'FortreeCity_House1_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'FortreeCity_House1_EventScript_Trader', isGlobal: true, instrIndex: 0 },
  { name: 'FortreeCity_House1_EventScript_DeclineTrade', isGlobal: true, instrIndex: 25 },
  { name: 'FortreeCity_House1_EventScript_NotRequestedMon', isGlobal: true, instrIndex: 28 },
  { name: 'FortreeCity_House1_EventScript_TradeCompleted', isGlobal: true, instrIndex: 32 },
  { name: 'FortreeCity_House1_EventScript_ExpertF', isGlobal: true, instrIndex: 35 },
  { name: 'FortreeCity_House1_EventScript_Zigzagoon', isGlobal: true, instrIndex: 37 },
  { name: 'FortreeCity_House1_Text_YouWillTradeWontYou', isGlobal: false, instrIndex: 45 },
  { name: 'FortreeCity_House1_Text_MonYouTakeCare', isGlobal: false, instrIndex: 45 },
  { name: 'FortreeCity_House1_Text_ThisIsntAMon', isGlobal: false, instrIndex: 45 },
  { name: 'FortreeCity_House1_Text_YouWontTradeMe', isGlobal: false, instrIndex: 45 },
  { name: 'FortreeCity_House1_Text_GoingToMakeVolbeatStrong', isGlobal: false, instrIndex: 45 },
  { name: 'FortreeCity_House1_Text_TradingMemoriesWithOthers', isGlobal: false, instrIndex: 45 },
  { name: 'FortreeCity_House1_Text_Zigzagoon', isGlobal: false, instrIndex: 45 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=22
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Aaaah, j'en veux un!\\n\""] },
  { kind: '.string', vals: ["\"Il me faut un {STR_VAR_1}!\\p\""] },
  { kind: '.string', vals: ["\"Je ferais n'importe quoi pour en\\n\""] },
  { kind: '.string', vals: ["\"avoir un! C'est un vrai cri du cœur!\\p\""] },
  { kind: '.string', vals: ["\"Maintenant que tu es au courant,\\n\""] },
  { kind: '.string', vals: ["\"tu vas échanger ton {STR_VAR_1} \\l\""] },
  { kind: '.string', vals: ["\"contre un {STR_VAR_2}, n'est-ce pas?$\""] },
  { kind: '.string', vals: ["\"Ouais, super!\\p\""] },
  { kind: '.string', vals: ["\"{STR_VAR_1}, bienvenue!\\n\""] },
  { kind: '.string', vals: ["\"{STR_VAR_2}, fais attention à toi!$\""] },
  { kind: '.string', vals: ["\"Ah non, je ne pense pas!\\n\""] },
  { kind: '.string', vals: ["\"Ce n'est pas un {STR_VAR_1}.$\""] },
  { kind: '.string', vals: ["\"Non? Tu ne veux pas faire d'échange?\\n\""] },
  { kind: '.string', vals: ["\"Même après que je t'ai ouvert mon cœur?$\""] },
  { kind: '.string', vals: ["\"A partir de maintenant, je vais rendre\\n\""] },
  { kind: '.string', vals: ["\"ce MUCIOLE très fort!\\p\""] },
  { kind: '.string', vals: ["\"J'espère que tu feras la même chose\\n\""] },
  { kind: '.string', vals: ["\"avec POSIPI!$\""] },
  { kind: '.string', vals: ["\"Echanger des POKéMON avec d'autres…\\p\""] },
  { kind: '.string', vals: ["\"C'est comme échanger ses propres\\n\""] },
  { kind: '.string', vals: ["\"souvenirs avec quelqu'un d'autre.$\""] },
  { kind: '.string', vals: ["\"ZIGZATON: Zigzaaa?$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 45 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_FORTREE_NPC_TRADE_COMPLETED","FortreeCity_House1_EventScript_TradeCompleted"]},
  {op:"setvar",args:["VAR_0x8008","INGAME_TRADE_PLUSLE"]},
  {op:"copyvar",args:["VAR_0x8004","VAR_0x8008"]},
  {op:"specialvar",args:["VAR_RESULT","GetInGameTradeSpeciesInfo"]},
  {op:"copyvar",args:["VAR_0x8009","VAR_RESULT"]},
  {op:"msgbox",args:["FortreeCity_House1_Text_YouWillTradeWontYou","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","NO","FortreeCity_House1_EventScript_DeclineTrade"]},
  {op:"special",args:["ChoosePartyMon"]},
  {op:"copyvar",args:["VAR_0x800A","VAR_0x8004"]},
  {op:"goto_if_eq",args:["VAR_0x8004","PARTY_NOTHING_CHOSEN","FortreeCity_House1_EventScript_DeclineTrade"]},
  {op:"copyvar",args:["VAR_0x8005","VAR_0x800A"]},
  {op:"specialvar",args:["VAR_RESULT","GetTradeSpecies"]},
  {op:"copyvar",args:["VAR_0x800B","VAR_RESULT"]},
  {op:"goto_if_ne",args:["VAR_RESULT","VAR_0x8009","FortreeCity_House1_EventScript_NotRequestedMon"]},
  {op:"copyvar",args:["VAR_0x8004","VAR_0x8008"]},
  {op:"copyvar",args:["VAR_0x8005","VAR_0x800A"]},
  {op:"special",args:["CreateInGameTradePokemon"]},
  {op:"special",args:["DoInGameTradeScene"]},
  {op:"bufferspeciesname",args:["STR_VAR_1","VAR_0x8009"]},
  {op:"msgbox",args:["FortreeCity_House1_Text_MonYouTakeCare","MSGBOX_DEFAULT"]},
  {op:"setflag",args:["FLAG_FORTREE_NPC_TRADE_COMPLETED"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FortreeCity_House1_Text_YouWontTradeMe","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"bufferspeciesname",args:["STR_VAR_1","VAR_0x8009"]},
  {op:"msgbox",args:["FortreeCity_House1_Text_ThisIsntAMon","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FortreeCity_House1_Text_GoingToMakeVolbeatStrong","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["FortreeCity_House1_Text_TradingMemoriesWithOthers","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"waitse",args:[]},
  {op:"playmoncry",args:["SPECIES_ZIGZAGOON","CRY_MODE_NORMAL"]},
  {op:"msgbox",args:["FortreeCity_House1_Text_Zigzagoon","MSGBOX_DEFAULT"]},
  {op:"waitmoncry",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
