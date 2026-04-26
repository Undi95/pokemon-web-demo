// AUTO-GENERATED from data/maps/DewfordTown_House1/scripts.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/maps/DewfordTown_House1/scripts.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'DewfordTown_House1_MapScripts', isGlobal: true, instrIndex: 0 },
  { name: 'DewfordTown_House1_EventScript_Man', isGlobal: true, instrIndex: 0 },
  { name: 'DewfordTown_House1_EventScript_Woman', isGlobal: true, instrIndex: 2 },
  { name: 'DewfordTown_House1_EventScript_Zigzagoon', isGlobal: true, instrIndex: 4 },
  { name: 'DewfordTown_House1_Text_LotToBeSaidForLivingOnIsland', isGlobal: false, instrIndex: 12 },
  { name: 'DewfordTown_House1_Text_LifeGoesSlowlyOnIsland', isGlobal: false, instrIndex: 12 },
  { name: 'DewfordTown_House1_Text_Zigzagoon', isGlobal: false, instrIndex: 12 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .byte=1, .string=10
export const DATA_DIRECTIVES = [
  { kind: '.byte', vals: [0] },
  { kind: '.string', vals: ["\"Je pourrais parler pendant des heures\\n\""] },
  { kind: '.string', vals: ["\"de la vie sur une si petite île, \\p\""] },
  { kind: '.string', vals: ["\"en harmonie avec sa famille et ses\\n\""] },
  { kind: '.string', vals: ["\"POKéMON.$\""] },
  { kind: '.string', vals: ["\"J'ai quitté POIVRESSEL pour\\n\""] },
  { kind: '.string', vals: ["\"vivre avec mon mari ici.\\p\""] },
  { kind: '.string', vals: ["\"La vie passe lentement sur cette\\n\""] },
  { kind: '.string', vals: ["\"île. Mais c'est un vrai bonheur d'être\\l\""] },
  { kind: '.string', vals: ["\"entourée de cette mer magnifique.$\""] },
  { kind: '.string', vals: ["\"ZIGZATON: Zaaaton!$\""] },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 12 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"msgbox",args:["DewfordTown_House1_Text_LotToBeSaidForLivingOnIsland","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"msgbox",args:["DewfordTown_House1_Text_LifeGoesSlowlyOnIsland","MSGBOX_NPC"]},
  {op:"end",args:[]},
  {op:"lock",args:[]},
  {op:"faceplayer",args:[]},
  {op:"waitse",args:[]},
  {op:"playmoncry",args:["SPECIES_ZIGZAGOON","CRY_MODE_NORMAL"]},
  {op:"msgbox",args:["DewfordTown_House1_Text_Zigzagoon","MSGBOX_DEFAULT"]},
  {op:"waitmoncry",args:[]},
  {op:"release",args:[]},
  {op:"end",args:[]},
] as const;
