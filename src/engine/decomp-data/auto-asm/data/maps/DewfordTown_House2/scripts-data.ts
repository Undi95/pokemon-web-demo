// AUTO-GENERATED from data/maps/DewfordTown_House2/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/DewfordTown_House2/scripts.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'DewfordTown_House2_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'DewfordTown_House2_EventScript_Man', isGlobal: true, instrIndex: 0 },
  { name: 'DewfordTown_House2_EventScript_NoRoomForScarf', isGlobal: true, instrIndex: 9 },
  { name: 'DewfordTown_House2_EventScript_ExplainSilkScarf', isGlobal: true, instrIndex: 12 },
  { name: 'DewfordTown_House2_EventScript_Boy', isGlobal: true, instrIndex: 15 },
  { name: 'DewfordTown_House2_Text_WantYouToHaveSilkScarf', isGlobal: false, instrIndex: 17 },
  { name: 'DewfordTown_House2_Text_NoRoom', isGlobal: false, instrIndex: 17 },
  { name: 'DewfordTown_House2_Text_ExplainSilkScarf', isGlobal: false, instrIndex: 17 },
  { name: 'DewfordTown_House2_Text_BrawlySoCool', isGlobal: false, instrIndex: 17 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=21
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Regarde-moi cette merveille!\\p\""] },
  { kind: '.string', vals: ["\"C'est un MOUCH. SOIE. C'est à la pointe\\n\""] },
  { kind: '.string', vals: ["\"de la mode!\\p\""] },
  { kind: '.string', vals: ["\"Oh, je vois une lueur dans tes yeux!\\n\""] },
  { kind: '.string', vals: ["\"Mon style éblouissant te plaît!\\p\""] },
  { kind: '.string', vals: ["\"Oh, tu me fais plaisir!\\n\""] },
  { kind: '.string', vals: ["\"Tiens, voilà. Je te le donne!$\""] },
  { kind: '.string', vals: ["\"Oh, tu n'as plus de place?\\p\""] },
  { kind: '.string', vals: ["\"Bon, écoute-moi bien, cet objet est\\n\""] },
  { kind: '.string', vals: ["\"indispensable! Il vaut bien tous les\\l\""] },
  { kind: '.string', vals: ["\"objets que j'ai sur moi.$\""] },
  { kind: '.string', vals: ["\"Le MOUCH. SOIE augmente la puissance\\n\""] },
  { kind: '.string', vals: ["\"des attaques de type NORMAL.\\p\""] },
  { kind: '.string', vals: ["\"C'est un MOUCHOIR merveilleux assorti à\\n\""] },
  { kind: '.string', vals: ["\"presque tous les POKéMON!$\""] },
  { kind: '.string', vals: ["\"Ouah, tu as franchi la mer pour\\n\""] },
  { kind: '.string', vals: ["\"venir visiter MYOKARA?\\p\""] },
  { kind: '.string', vals: ["\"Tu es peut-être ici parce que tu\\n\""] },
  { kind: '.string', vals: ["\"as entendu parler de BASTIEN?\\p\""] },
  { kind: '.string', vals: ["\"Il est super cool…\\n\""] },
  { kind: '.string', vals: ["\"Tout le monde l'adore.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 17 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_RECEIVED_SILK_SCARF","DewfordTown_House2_EventScript_ExplainSilkScarf"]},
  {op:"msgbox",args:["DewfordTown_House2_Text_WantYouToHaveSilkScarf","MSGBOX_DEFAULT"]},
  {op:"giveitem",args:["ITEM_SILK_SCARF"]},
  {op:"goto_if_eq",args:["VAR_RESULT",0,"DewfordTown_House2_EventScript_NoRoomForScarf"]},
  {op:"setflag",args:["FLAG_RECEIVED_SILK_SCARF"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["DewfordTown_House2_Text_NoRoom","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["DewfordTown_House2_Text_ExplainSilkScarf","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["DewfordTown_House2_Text_BrawlySoCool","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
