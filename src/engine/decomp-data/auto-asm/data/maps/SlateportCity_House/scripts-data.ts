// AUTO-GENERATED from data/maps/SlateportCity_House/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SlateportCity_House/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SlateportCity_House_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SlateportCity_House_EventScript_PokefanM', isGlobal: true, instrIndex: 0 },
  { name: 'SlateportCity_House_EventScript_Girl', isGlobal: true, instrIndex: 2 },
  { name: 'SlateportCity_House_Text_NatureToDoWithStatGains', isGlobal: false, instrIndex: 4 },
  { name: 'SlateportCity_House_Text_MustBeGoingToBattleTent', isGlobal: false, instrIndex: 4 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=9
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Mon POKéMON est PRESSE.\\n\""] },
  { kind: '.string', vals: ["\"C'est sa nature.\\p\""] },
  { kind: '.string', vals: ["\"Sa VITESSE est plus élevée que celle de\\n\""] },
  { kind: '.string', vals: ["\"mes autres POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"La nature des POKéMON a peut-être\\n\""] },
  { kind: '.string', vals: ["\"un rapport avec leurs stats.$\""] },
  { kind: '.string', vals: ["\"Tu es un DRESSEUR, n'est-ce pas?\\p\""] },
  { kind: '.string', vals: ["\"Tu dois vouloir te rendre à la TENTE\\n\""] },
  { kind: '.string', vals: ["\"DE COMBAT de POIVRESSEL, non?$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 4 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["SlateportCity_House_Text_NatureToDoWithStatGains","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["SlateportCity_House_Text_MustBeGoingToBattleTent","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
