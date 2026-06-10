// AUTO-GENERATED from data/maps/PacifidlogTown_House1/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/PacifidlogTown_House1/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'PacifidlogTown_House1_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'PacifidlogTown_House1_EventScript_Man', isGlobal: true, instrIndex: 0 },
  { name: 'PacifidlogTown_House1_EventScript_Woman', isGlobal: true, instrIndex: 2 },
  { name: 'PacifidlogTown_House1_Text_RegiStory', isGlobal: false, instrIndex: 4 },
  { name: 'PacifidlogTown_House1_Text_SixDotsOpenThreeDoors', isGlobal: false, instrIndex: 4 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=10
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Dans la région de HOENN, il existe trois\\n\""] },
  { kind: '.string', vals: ["\"POKéMON qui symbolisent la puissance\\l\""] },
  { kind: '.string', vals: ["\"de la pierre, de la glace et de l'acier.\\p\""] },
  { kind: '.string', vals: ["\"On raconte qu'ils se cachent dans\\n\""] },
  { kind: '.string', vals: ["\"des grottes obscures.\\p\""] },
  { kind: '.string', vals: ["\"C'est une histoire que j'ai entendue\\n\""] },
  { kind: '.string', vals: ["\"quand j'étais petit.$\""] },
  { kind: '.string', vals: ["\"“Six points ouvrent trois portes.”\\p\""] },
  { kind: '.string', vals: ["\"Pépé disait souvent ça, mais je ne sais\\n\""] },
  { kind: '.string', vals: ["\"pas ce que ça veut dire.$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 4 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["PacifidlogTown_House1_Text_RegiStory","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["PacifidlogTown_House1_Text_SixDotsOpenThreeDoors","MSGBOX_NPC"]},
  {op:"end",args:[]},
] as const;
