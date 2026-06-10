// AUTO-GENERATED from data/maps/Route104_PrettyPetalFlowerShop/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route104_PrettyPetalFlowerShop/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route104_PrettyPetalFlowerShop_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route104_PrettyPetalFlowerShop_OnTransition', isGlobal: false, instrIndex: 1 },
  { name: 'Route104_PrettyPetalFlowerShop_EventScript_MoveShopOwner', isGlobal: true, instrIndex: 6 },
  { name: 'Route104_PrettyPetalFlowerShop_EventScript_ShopOwner', isGlobal: true, instrIndex: 8 },
  { name: 'Route104_PrettyPetalFlowerShop_EventScript_AlreadyMet', isGlobal: true, instrIndex: 19 },
  { name: 'Route104_PrettyPetalFlowerShop_EventScript_ExplainBerries', isGlobal: true, instrIndex: 24 },
  { name: 'Route104_PrettyPetalFlowerShop_EventScript_DontExplainBerries', isGlobal: true, instrIndex: 26 },
  { name: 'Route104_PrettyPetalFlowerShop_EventScript_SellDecorations', isGlobal: true, instrIndex: 28 },
  { name: 'Route104_PrettyPetalFlowerShop_Pokemart_Plants', isGlobal: false, instrIndex: 34 },
  { name: 'Route104_PrettyPetalFlowerShop_EventScript_WailmerPailGirl', isGlobal: true, instrIndex: 35 },
  { name: 'Route104_PrettyPetalFlowerShop_EventScript_GiveWailmerPail', isGlobal: true, instrIndex: 41 },
  { name: 'Route104_PrettyPetalFlowerShop_EventScript_RandomBerryGirl', isGlobal: true, instrIndex: 47 },
  { name: 'Route104_PrettyPetalFlowerShop_EventScript_AlreadyReceivedBerry', isGlobal: true, instrIndex: 60 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=6
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: ["DECOR_RED_PLANT"] },
  { kind: '.2byte', vals: ["DECOR_TROPICAL_PLANT"] },
  { kind: '.2byte', vals: ["DECOR_PRETTY_FLOWERS"] },
  { kind: '.2byte', vals: ["DECOR_COLORFUL_PLANT"] },
  { kind: '.2byte', vals: ["DECOR_BIG_PLANT"] },
  { kind: '.2byte', vals: ["DECOR_GORGEOUS_PLANT"] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 63 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","Route104_PrettyPetalFlowerShop_OnTransition"]},
  {op:"setflag",args:["FLAG_LANDMARK_FLOWER_SHOP"]},
  {op:"goto_if_unset",args:["FLAG_MET_PRETTY_PETAL_SHOP_OWNER","Route104_PrettyPetalFlowerShop_EventScript_MoveShopOwner"]},
  {op:"goto_if_unset",args:["FLAG_BADGE03_GET","Route104_PrettyPetalFlowerShop_EventScript_MoveShopOwner"]},
  {op:"setflag",args:["FLAG_TEMP_1"]},
  {op:"end",args:[]},
  {op:"setobjectxyperm",args:["LOCALID_FLOWER_SHOP_OWNER",4,6]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_TEMP_1","Route104_PrettyPetalFlowerShop_EventScript_SellDecorations"]},
  {op:"msgbox",args:["Route104_PrettyPetalFlowerShop_Text_ThisIsPrettyPetalFlowerShop","MSGBOX_DEFAULT"]},
  {op:"goto_if_set",args:["FLAG_MET_PRETTY_PETAL_SHOP_OWNER","Route104_PrettyPetalFlowerShop_EventScript_AlreadyMet"]},
  {op:"setflag",args:["FLAG_MET_PRETTY_PETAL_SHOP_OWNER"]},
  {op:"msgbox",args:["Route104_PrettyPetalFlowerShop_Text_IntroLearnAboutBerries","MSGBOX_YESNO"]},
  {op:"call_if_eq",args:["VAR_RESULT","YES","Route104_PrettyPetalFlowerShop_EventScript_ExplainBerries"]},
  {op:"call_if_eq",args:["VAR_RESULT","NO","Route104_PrettyPetalFlowerShop_EventScript_DontExplainBerries"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Route104_PrettyPetalFlowerShop_Text_LearnAboutBerries","MSGBOX_YESNO"]},
  {op:"call_if_eq",args:["VAR_RESULT","YES","Route104_PrettyPetalFlowerShop_EventScript_ExplainBerries"]},
  {op:"call_if_eq",args:["VAR_RESULT","NO","Route104_PrettyPetalFlowerShop_EventScript_DontExplainBerries"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Route104_PrettyPetalFlowerShop_Text_BerriesExplanation","MSGBOX_DEFAULT"]},
  {op:"return",args:[]},
  {op:"msgbox",args:["Route104_PrettyPetalFlowerShop_Text_FlowersBringHappiness","MSGBOX_DEFAULT"]},
  {op:"return",args:[]},
  {op:"message",args:["gText_PlayerWhatCanIDoForYou"]},
  {op:"waitmessage",args:[]},
  {op:"pokemartdecoration2",args:["Route104_PrettyPetalFlowerShop_Pokemart_Plants"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_unset",args:["FLAG_RECEIVED_WAILMER_PAIL","Route104_PrettyPetalFlowerShop_EventScript_GiveWailmerPail"]},
  {op:"msgbox",args:["Route104_PrettyPetalFlowerShop_Text_WailmerPailExplanation","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Route104_PrettyPetalFlowerShop_Text_YouCanHaveThis","MSGBOX_DEFAULT"]},
  {op:"giveitem",args:["ITEM_WAILMER_PAIL"]},
  {op:"msgbox",args:["Route104_PrettyPetalFlowerShop_Text_WailmerPailExplanation","MSGBOX_DEFAULT"]},
  {op:"setflag",args:["FLAG_RECEIVED_WAILMER_PAIL"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"dotimebasedevents",args:[]},
  {op:"goto_if_set",args:["FLAG_DAILY_FLOWER_SHOP_RECEIVED_BERRY","Route104_PrettyPetalFlowerShop_EventScript_AlreadyReceivedBerry"]},
  {op:"msgbox",args:["Route104_PrettyPetalFlowerShop_Text_ImGrowingFlowers","MSGBOX_DEFAULT"]},
  {op:"random",args:[8]},
  {op:"addvar",args:["VAR_RESULT","FIRST_BERRY_INDEX"]},
  {op:"giveitem",args:["VAR_RESULT"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"Common_EventScript_ShowBagIsFull"]},
  {op:"setflag",args:["FLAG_DAILY_FLOWER_SHOP_RECEIVED_BERRY"]},
  {op:"msgbox",args:["Route104_PrettyPetalFlowerShop_Text_MachineMixesBerries","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Route104_PrettyPetalFlowerShop_Text_MachineMixesBerries","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
