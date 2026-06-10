// AUTO-GENERATED from data/maps/BattleFrontier_Lounge6/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/BattleFrontier_Lounge6/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'BattleFrontier_Lounge6_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'BattleFrontier_Lounge6_EventScript_Trader', isGlobal: true, instrIndex: 0 },
  { name: 'BattleFrontier_Lounge6_EventScript_DeclineTrade', isGlobal: true, instrIndex: 24 },
  { name: 'BattleFrontier_Lounge6_EventScript_NotRequestedMon', isGlobal: true, instrIndex: 27 },
  { name: 'BattleFrontier_Lounge6_EventScript_TradeCompleted', isGlobal: true, instrIndex: 31 },
  { name: 'BattleFrontier_Lounge6_Text_WouldYouLikeToTrade', isGlobal: false, instrIndex: 34 },
  { name: 'BattleFrontier_Lounge6_Text_PromiseIllBeGoodToIt', isGlobal: false, instrIndex: 34 },
  { name: 'BattleFrontier_Lounge6_Text_DontTradeForAnythingButMon', isGlobal: false, instrIndex: 34 },
  { name: 'BattleFrontier_Lounge6_Text_WellThatsFineToo', isGlobal: false, instrIndex: 34 },
  { name: 'BattleFrontier_Lounge6_Text_SkittySoMuchCuterThanImagined', isGlobal: false, instrIndex: 34 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=20
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Mon POKéMON est un {STR_VAR_2}.\\n\""] },
  { kind: '.string', vals: ["\"Tu connais?\\l\""] },
  { kind: '.string', vals: ["\"C'est assez mignon et plutôt joli.\\p\""] },
  { kind: '.string', vals: ["\"Celui-là, je serais fière de l'échanger!\\p\""] },
  { kind: '.string', vals: ["\"Tu veux échanger un {STR_VAR_1} contre\\n\""] },
  { kind: '.string', vals: ["\"mon {STR_VAR_2}?$\""] },
  { kind: '.string', vals: ["\"Oh, c'est adorable!\\n\""] },
  { kind: '.string', vals: ["\"Merci!\\l\""] },
  { kind: '.string', vals: ["\"Je vais bien m'en occuper!\\p\""] },
  { kind: '.string', vals: ["\"Dis, j'espère que tu prendras bien soin\\n\""] },
  { kind: '.string', vals: ["\"de mon {STR_VAR_2}!$\""] },
  { kind: '.string', vals: ["\"Oh, je suis désolée!\\n\""] },
  { kind: '.string', vals: ["\"Je ferai l'échange uniquement contre un\\l\""] },
  { kind: '.string', vals: ["\"{STR_VAR_1}.$\""] },
  { kind: '.string', vals: ["\"Oh, tu ne veux pas?\\n\""] },
  { kind: '.string', vals: ["\"Bon, pas de problème.\\l\""] },
  { kind: '.string', vals: ["\"Reviens quand tu veux.$\""] },
  { kind: '.string', vals: ["\"Hi, hi!\\n\""] },
  { kind: '.string', vals: ["\"Un SKITTY, c'est encore plus mignon\\l\""] },
  { kind: '.string', vals: ["\"que je ne le pensais!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 34 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_BATTLE_FRONTIER_TRADE_DONE","BattleFrontier_Lounge6_EventScript_TradeCompleted"]},
  {op:"setvar",args:["VAR_0x8008","INGAME_TRADE_MEOWTH"]},
  {op:"copyvar",args:["VAR_0x8004","VAR_0x8008"]},
  {op:"specialvar",args:["VAR_RESULT","GetInGameTradeSpeciesInfo"]},
  {op:"copyvar",args:["VAR_0x8009","VAR_RESULT"]},
  {op:"msgbox",args:["BattleFrontier_Lounge6_Text_WouldYouLikeToTrade","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","NO","BattleFrontier_Lounge6_EventScript_DeclineTrade"]},
  {op:"special",args:["ChoosePartyMon"]},
  {op:"copyvar",args:["VAR_0x800A","VAR_0x8004"]},
  {op:"goto_if_eq",args:["VAR_0x8004","PARTY_NOTHING_CHOSEN","BattleFrontier_Lounge6_EventScript_DeclineTrade"]},
  {op:"copyvar",args:["VAR_0x8005","VAR_0x800A"]},
  {op:"specialvar",args:["VAR_RESULT","GetTradeSpecies"]},
  {op:"copyvar",args:["VAR_0x800B","VAR_RESULT"]},
  {op:"goto_if_ne",args:["VAR_RESULT","VAR_0x8009","BattleFrontier_Lounge6_EventScript_NotRequestedMon"]},
  {op:"copyvar",args:["VAR_0x8004","VAR_0x8008"]},
  {op:"copyvar",args:["VAR_0x8005","VAR_0x800A"]},
  {op:"special",args:["CreateInGameTradePokemon"]},
  {op:"special",args:["DoInGameTradeScene"]},
  {op:"msgbox",args:["BattleFrontier_Lounge6_Text_PromiseIllBeGoodToIt","MSGBOX_DEFAULT"]},
  {op:"setflag",args:["FLAG_BATTLE_FRONTIER_TRADE_DONE"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["BattleFrontier_Lounge6_Text_WellThatsFineToo","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"bufferspeciesname",args:["STR_VAR_1","VAR_0x8009"]},
  {op:"msgbox",args:["BattleFrontier_Lounge6_Text_DontTradeForAnythingButMon","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["BattleFrontier_Lounge6_Text_SkittySoMuchCuterThanImagined","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
