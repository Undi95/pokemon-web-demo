// AUTO-GENERATED from data/maps/Route114_FossilManiacsHouse/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/Route114_FossilManiacsHouse/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'Route114_FossilManiacsHouse_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'Route114_FossilManiacsHouse_OnTransition', isGlobal: false, instrIndex: 1 },
  { name: 'Route114_FossilManiacsHouse_EventScript_FossilManiacsBrother', isGlobal: true, instrIndex: 3 },
  { name: 'Route114_FossilManiacsHouse_EventScript_ReceivedDig', isGlobal: true, instrIndex: 12 },
  { name: 'Route114_FossilManiacsHouse_EventScript_RockDisplay', isGlobal: true, instrIndex: 15 },
  { name: 'Route114_FossilManiacsHouse_EventScript_Bookshelf', isGlobal: true, instrIndex: 17 },
  { name: 'Route114_FossilManiacsHouse_Text_HaveThisToDigLikeMyBrother', isGlobal: false, instrIndex: 19 },
  { name: 'Route114_FossilManiacsHouse_Text_DigReturnsYouToEntrance', isGlobal: false, instrIndex: 19 },
  { name: 'Route114_FossilManiacsHouse_Text_RocksFillDisplayCase', isGlobal: false, instrIndex: 19 },
  { name: 'Route114_FossilManiacsHouse_Text_CrammedWithBooks', isGlobal: false, instrIndex: 19 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=15
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Mon grand frère est le MANIAQUE\\n\""] },
  { kind: '.string', vals: ["\"DES FOSSILES… C'est un gentil\\l\""] },
  { kind: '.string', vals: ["\"garçon passionné de FOSSILES…\\p\""] },
  { kind: '.string', vals: ["\"Il adore creuser des trous, aussi…\\n\""] },
  { kind: '.string', vals: ["\"Il a creusé ce trou tout seul…\\p\""] },
  { kind: '.string', vals: ["\"Tiens, prends ça, tu pourras utiliser\\n\""] },
  { kind: '.string', vals: ["\"TUNNEL, comme mon grand frère…$\""] },
  { kind: '.string', vals: ["\"Si ton POKéMON utilise TUNNEL dans une\\n\""] },
  { kind: '.string', vals: ["\"caverne, tu retournes à l'entrée…$\""] },
  { kind: '.string', vals: ["\"Des roches aux formes étranges\\n\""] },
  { kind: '.string', vals: ["\"sont disposées dans la vitrine.$\""] },
  { kind: '.string', vals: ["\"LA COMPOSITION DES STRATES…\\n\""] },
  { kind: '.string', vals: ["\"LA PLUIE, L'EROSION ET LA TERRE…\\l\""] },
  { kind: '.string', vals: ["\"PIERRES, TERRE ET AUTRES ROCHERS…\\p\""] },
  { kind: '.string', vals: ["\"C'est rempli de livres.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 19 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"map_script",args:["MAP_SCRIPT_ON_TRANSITION","Route114_FossilManiacsHouse_OnTransition"]},
  {op:"setflag",args:["FLAG_LANDMARK_FOSSIL_MANIACS_HOUSE"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_RECEIVED_TM_DIG","Route114_FossilManiacsHouse_EventScript_ReceivedDig"]},
  {op:"msgbox",args:["Route114_FossilManiacsHouse_Text_HaveThisToDigLikeMyBrother","MSGBOX_DEFAULT"]},
  {op:"giveitem",args:["ITEM_TM_DIG"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"Common_EventScript_ShowBagIsFull"]},
  {op:"setflag",args:["FLAG_RECEIVED_TM_DIG"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Route114_FossilManiacsHouse_Text_DigReturnsYouToEntrance","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Route114_FossilManiacsHouse_Text_RocksFillDisplayCase","MSGBOX_SIGN"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["Route114_FossilManiacsHouse_Text_CrammedWithBooks","MSGBOX_SIGN"]},
  {op:"end",args:[]},
] as const;
