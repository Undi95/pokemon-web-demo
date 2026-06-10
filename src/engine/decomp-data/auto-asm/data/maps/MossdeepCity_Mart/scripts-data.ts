// AUTO-GENERATED from data/maps/MossdeepCity_Mart/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/MossdeepCity_Mart/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'MossdeepCity_Mart_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'MossdeepCity_Mart_EventScript_Clerk', isGlobal: true, instrIndex: 0 },
  { name: 'MossdeepCity_Mart_Pokemart', isGlobal: false, instrIndex: 8 },
  { name: 'MossdeepCity_Mart_EventScript_Woman', isGlobal: true, instrIndex: 9 },
  { name: 'MossdeepCity_Mart_EventScript_Boy', isGlobal: true, instrIndex: 11 },
  { name: 'MossdeepCity_Mart_EventScript_Sailor', isGlobal: true, instrIndex: 13 },
  { name: 'MossdeepCity_Mart_Text_ReviveIsFantastic', isGlobal: false, instrIndex: 15 },
  { name: 'MossdeepCity_Mart_Text_MaxRepelLastsLongest', isGlobal: false, instrIndex: 15 },
  { name: 'MossdeepCity_Mart_Text_NetAndDiveBallsRare', isGlobal: false, instrIndex: 15 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .2byte=9, .string=17
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.2byte', vals: ["ITEM_ULTRA_BALL"] },
  { kind: '.2byte', vals: ["ITEM_NET_BALL"] },
  { kind: '.2byte', vals: ["ITEM_DIVE_BALL"] },
  { kind: '.2byte', vals: ["ITEM_HYPER_POTION"] },
  { kind: '.2byte', vals: ["ITEM_FULL_HEAL"] },
  { kind: '.2byte', vals: ["ITEM_REVIVE"] },
  { kind: '.2byte', vals: ["ITEM_MAX_REPEL"] },
  { kind: '.2byte', vals: ["ITEM_X_ATTACK"] },
  { kind: '.2byte', vals: ["ITEM_X_DEFEND"] },
  { kind: '.string', vals: ["\"RAPPEL est fabuleux!\\p\""] },
  { kind: '.string', vals: ["\"Si tu en donnes à un POKéMON K.O.,\\n\""] },
  { kind: '.string', vals: ["\"il reprend connaissance.\\p\""] },
  { kind: '.string', vals: ["\"Mais attention, RAPPEL ne restitue\\n\""] },
  { kind: '.string', vals: ["\"pas les PP des capacités déjà utilisés.$\""] },
  { kind: '.string', vals: ["\"MAX REPOUSSE maintient les POKéMON\\n\""] },
  { kind: '.string', vals: ["\"faibles à l'écart.\\p\""] },
  { kind: '.string', vals: ["\"Parmi tous les REPOUSSES, c'est celui\\n\""] },
  { kind: '.string', vals: ["\"qui dure le plus longtemps.$\""] },
  { kind: '.string', vals: ["\"Les FILET BALLS et les SCUBA BALLS\\n\""] },
  { kind: '.string', vals: ["\"sont des POKé BALLS rares, qui ne\\l\""] },
  { kind: '.string', vals: ["\"sont fabriquées qu'à ALGATIA.\\p\""] },
  { kind: '.string', vals: ["\"La FILET BALL est efficace contre les\\n\""] },
  { kind: '.string', vals: ["\"POKéMON des types INSECTE et EAU.\\p\""] },
  { kind: '.string', vals: ["\"La SCUBA BALL est plus efficace\\n\""] },
  { kind: '.string', vals: ["\"contre les POKéMON qui vivent\\l\""] },
  { kind: '.string', vals: ["\"au fond de la mer.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 15 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"message",args:["gText_HowMayIServeYou"]},
  {op:"waitmessage",args:[]},
  {op:"pokemart",args:["MossdeepCity_Mart_Pokemart"]},
  {op:"msgbox",args:["gText_PleaseComeAgain","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"pokemartlistend",args:[]},
  {op:"msgbox",args:["MossdeepCity_Mart_Text_ReviveIsFantastic","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MossdeepCity_Mart_Text_MaxRepelLastsLongest","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["MossdeepCity_Mart_Text_NetAndDiveBallsRare","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
