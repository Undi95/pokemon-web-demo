// AUTO-GENERATED from data/maps/SlateportCity_SternsShipyard_2F/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/SlateportCity_SternsShipyard_2F/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'SlateportCity_SternsShipyard_2F_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'SlateportCity_SternsShipyard_2F_EventScript_Scientist1', isGlobal: true, instrIndex: 0 },
  { name: 'SlateportCity_SternsShipyard_2F_EventScript_Scientist2', isGlobal: true, instrIndex: 2 },
  { name: 'SlateportCity_SternsShipyard_2F_Text_ShipDesignMoreLikeBuilding', isGlobal: false, instrIndex: 4 },
  { name: 'SlateportCity_SternsShipyard_2F_Text_FloatsBecauseBuoyancy', isGlobal: false, instrIndex: 4 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=7
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Concevoir un grand bateau relève plus\\n\""] },
  { kind: '.string', vals: ["\"de la construction d'un vaste bâtiment\\l\""] },
  { kind: '.string', vals: ["\"que de l'assemblage d'un véhicule.$\""] },
  { kind: '.string', vals: ["\"C'est étrange qu'un bateau fait d'acier\\n\""] },
  { kind: '.string', vals: ["\"puisse flotter, non?\\p\""] },
  { kind: '.string', vals: ["\"S'il flotte, c'est dû à ce que l'on\\n\""] },
  { kind: '.string', vals: ["\"appelle le principe de flottabilité.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 4 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["SlateportCity_SternsShipyard_2F_Text_ShipDesignMoreLikeBuilding","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["SlateportCity_SternsShipyard_2F_Text_FloatsBecauseBuoyancy","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
