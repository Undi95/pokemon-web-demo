// AUTO-GENERATED from data/maps/BattleFrontier_Lounge4/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/BattleFrontier_Lounge4/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'BattleFrontier_Lounge4_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'BattleFrontier_Lounge4_EventScript_Woman', isGlobal: true, instrIndex: 0 },
  { name: 'BattleFrontier_Lounge4_EventScript_Cook', isGlobal: true, instrIndex: 2 },
  { name: 'BattleFrontier_Lounge4_EventScript_Man', isGlobal: true, instrIndex: 4 },
  { name: 'BattleFrontier_Lounge4_Text_WonderIfInterviewsAiring', isGlobal: false, instrIndex: 6 },
  { name: 'BattleFrontier_Lounge4_Text_IfIOpenedRestaurantHere', isGlobal: false, instrIndex: 6 },
  { name: 'BattleFrontier_Lounge4_Text_NeedBreatherAfterBattles', isGlobal: false, instrIndex: 6 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=9
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Je me demande s'il y aura des interviews\\n\""] },
  { kind: '.string', vals: ["\"de bons DRESSEURS aujourd'hui.$\""] },
  { kind: '.string', vals: ["\"Si j'ouvrais un restaurant ici, je\\n\""] },
  { kind: '.string', vals: ["\"ferais fortune!$\""] },
  { kind: '.string', vals: ["\"Pfiou…\\p\""] },
  { kind: '.string', vals: ["\"J'aurais besoin de faire le vide dans\\n\""] },
  { kind: '.string', vals: ["\"ma tête entre deux combats…\\p\""] },
  { kind: '.string', vals: ["\"Mais je n'arrête jamais de penser à\\n\""] },
  { kind: '.string', vals: ["\"ma stratégie.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 6 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["BattleFrontier_Lounge4_Text_WonderIfInterviewsAiring","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["BattleFrontier_Lounge4_Text_IfIOpenedRestaurantHere","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["BattleFrontier_Lounge4_Text_NeedBreatherAfterBattles","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
