// AUTO-GENERATED from data/maps/MauvilleCity_House2/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MauvilleCity_House2/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MauvilleCity_House2_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MauvilleCity_House2_EventScript_Woman', isGlobal: true, instrIndex: 0 },
  { name: 'MauvilleCity_House2_EventScript_AskToTradeForHarborMail', isGlobal: true, instrIndex: 8 },
  { name: 'MauvilleCity_House2_EventScript_AcceptTrade', isGlobal: true, instrIndex: 17 },
  { name: 'MauvilleCity_House2_EventScript_ReceivedCoinCase', isGlobal: true, instrIndex: 23 },
  { name: 'MauvilleCity_House2_EventScript_DeclineTrade', isGlobal: true, instrIndex: 26 },
  { name: 'MauvilleCity_House2_Text_BuyHarborMailAtSlateport', isGlobal: false, instrIndex: 29 },
  { name: 'MauvilleCity_House2_Text_TradeHarborMailForCoinCase', isGlobal: false, instrIndex: 29 },
  { name: 'MauvilleCity_House2_Text_IllTradeYouCoinCase', isGlobal: false, instrIndex: 29 },
  { name: 'MauvilleCity_House2_Text_UseCoinCaseAtGameCorner', isGlobal: false, instrIndex: 29 },
  { name: 'MauvilleCity_House2_Text_ThatsDisappointing', isGlobal: false, instrIndex: 29 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=14
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Avec un VELO, ce serait facile d'aller\\n\""] },
  { kind: '.string', vals: ["\"faire des courses à POIVRESSEL.\\p\""] },
  { kind: '.string', vals: ["\"Je pourrais acheter une LETTRE PORT à\\n\""] },
  { kind: '.string', vals: ["\"la BOUTIQUE POKéMON de POIVRESSEL…$\""] },
  { kind: '.string', vals: ["\"Oh! Tu as une LETTRE PORT?\\p\""] },
  { kind: '.string', vals: ["\"Tu me l'échanges contre une\\n\""] },
  { kind: '.string', vals: ["\"BOITE JETONS?$\""] },
  { kind: '.string', vals: ["\"Oh, ça me fait tellement plaisir!\\n\""] },
  { kind: '.string', vals: ["\"OK, je t'échange une BOITE JETONS!$\""] },
  { kind: '.string', vals: ["\"Cette BOITE JETONS peut être utilisée\\n\""] },
  { kind: '.string', vals: ["\"au CASINO.$\""] },
  { kind: '.string', vals: ["\"Oh, désolée…\\p\""] },
  { kind: '.string', vals: ["\"Mais il faut une BOITE JETONS\\n\""] },
  { kind: '.string', vals: ["\"pour jouer au CASINO.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 29 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_RECEIVED_COIN_CASE","MauvilleCity_House2_EventScript_ReceivedCoinCase"]},
  {op:"msgbox",args:["MauvilleCity_House2_Text_BuyHarborMailAtSlateport","MSGBOX_DEFAULT"]},
  {op:"checkitem",args:["ITEM_HARBOR_MAIL"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"MauvilleCity_House2_EventScript_AskToTradeForHarborMail"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"playse",args:["SE_PIN"]},
  {op:"applymovement",args:["VAR_LAST_TALKED","Common_Movement_ExclamationMark"]},
  {op:"waitmovement",args:[0]},
  {op:"applymovement",args:["VAR_LAST_TALKED","Common_Movement_Delay48"]},
  {op:"waitmovement",args:[0]},
  {op:"msgbox",args:["MauvilleCity_House2_Text_TradeHarborMailForCoinCase","MSGBOX_YESNO"]},
  {op:"goto_if_eq",args:["VAR_RESULT","YES","MauvilleCity_House2_EventScript_AcceptTrade"]},
  {op:"goto_if_eq",args:["VAR_RESULT","NO","MauvilleCity_House2_EventScript_DeclineTrade"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MauvilleCity_House2_Text_IllTradeYouCoinCase","MSGBOX_DEFAULT"]},
  {op:"removeitem",args:["ITEM_HARBOR_MAIL"]},
  {op:"giveitem",args:["ITEM_COIN_CASE"]},
  {op:"setflag",args:["FLAG_RECEIVED_COIN_CASE"]},
  {op:"goto",args:["MauvilleCity_House2_EventScript_ReceivedCoinCase"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MauvilleCity_House2_Text_UseCoinCaseAtGameCorner","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MauvilleCity_House2_Text_ThatsDisappointing","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
