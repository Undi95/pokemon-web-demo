// AUTO-GENERATED from data/maps/AbandonedShip_CaptainsOffice/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/AbandonedShip_CaptainsOffice/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'AbandonedShip_CaptainsOffice_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'AbandonedShip_CaptainsOffice_EventScript_CaptSternAide', isGlobal: true, instrIndex: 0 },
  { name: 'AbandonedShip_CaptainsOffice_EventScript_CanYouDeliverScanner', isGlobal: true, instrIndex: 9 },
  { name: 'AbandonedShip_CaptainsOffice_EventScript_ThisIsSSCactus', isGlobal: true, instrIndex: 12 },
  { name: 'AbandonedShip_CaptainsOffice_Text_NoSuccessFindingScanner', isGlobal: false, instrIndex: 15 },
  { name: 'AbandonedShip_CaptainsOffice_Text_OhCanYouDeliverScanner', isGlobal: false, instrIndex: 15 },
  { name: 'AbandonedShip_CaptainsOffice_Text_ThisIsSSCactus', isGlobal: false, instrIndex: 15 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=11
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"J'examine ce bateau pour le\\n\""] },
  { kind: '.string', vals: ["\"CAPT. POUPE.\\p\""] },
  { kind: '.string', vals: ["\"Il m'a aussi demandé de rapporter un\\n\""] },
  { kind: '.string', vals: ["\"SCANNER, mais je n'en ai pas trouvé…$\""] },
  { kind: '.string', vals: ["\"Oh, c'est un SCANNER!\\p\""] },
  { kind: '.string', vals: ["\"Ecoute, je peux te demander d'apporter\\n\""] },
  { kind: '.string', vals: ["\"ça au CAPT. POUPE?\\p\""] },
  { kind: '.string', vals: ["\"Je voudrais continuer d'examiner ce\\n\""] },
  { kind: '.string', vals: ["\"bateau.$\""] },
  { kind: '.string', vals: ["\"Ce navire s'appelle LE CACTUS.\\n\""] },
  { kind: '.string', vals: ["\"Il semble être d'une autre époque.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 15 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"goto_if_set",args:["FLAG_EXCHANGED_SCANNER","AbandonedShip_CaptainsOffice_EventScript_ThisIsSSCactus"]},
  {op:"checkitem",args:["ITEM_SCANNER"]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"AbandonedShip_CaptainsOffice_EventScript_CanYouDeliverScanner"]},
  {op:"goto_if_set",args:["FLAG_ITEM_ABANDONED_SHIP_HIDDEN_FLOOR_ROOM_2_SCANNER","AbandonedShip_CaptainsOffice_EventScript_ThisIsSSCactus"]},
  {op:"msgbox",args:["AbandonedShip_CaptainsOffice_Text_NoSuccessFindingScanner","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["AbandonedShip_CaptainsOffice_Text_OhCanYouDeliverScanner","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
  {op:"msgbox",args:["AbandonedShip_CaptainsOffice_Text_ThisIsSSCactus","MSGBOX_DEFAULT"]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
