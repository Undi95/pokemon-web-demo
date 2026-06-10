// AUTO-GENERATED from data/text/pc_transfer.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/text/pc_transfer.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'gText_PkmnTransferredSomeonesPC', isGlobal: true, instrIndex: 0 },
  { name: 'gText_PkmnTransferredLanettesPC', isGlobal: true, instrIndex: 0 },
  { name: 'gText_PkmnTransferredSomeonesPCBoxFull', isGlobal: true, instrIndex: 0 },
  { name: 'gText_PkmnTransferredLanettesPCBoxFull', isGlobal: true, instrIndex: 0 },
  { name: 'gText_NoMoreRoomForPokemon', isGlobal: true, instrIndex: 0 },
  { name: 'gText_NicknameThisPokemon', isGlobal: true, instrIndex: 0 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .string=22
export const DATA_DIRECTIVES = [
  { kind: '.string', vals: ["\"{STR_VAR_2} a été transféré sur le\\n\""] },
  { kind: '.string', vals: ["\"PC de ???.\\p\""] },
  { kind: '.string', vals: ["\"Il a été placé dans la BOITE\\n\""] },
  { kind: '.string', vals: ["\"appelée “{STR_VAR_1}”.$\""] },
  { kind: '.string', vals: ["\"{STR_VAR_2} a été transféré sur le\\n\""] },
  { kind: '.string', vals: ["\"PC d'ANNETTE.\\p\""] },
  { kind: '.string', vals: ["\"Il a été placé dans la BOITE\\n\""] },
  { kind: '.string', vals: ["\"appelée “{STR_VAR_1}”.$\""] },
  { kind: '.string', vals: ["\"La BOITE {STR_VAR_3} sur le PC\\n\""] },
  { kind: '.string', vals: ["\"de ??? est pleine.\\p\""] },
  { kind: '.string', vals: ["\"{STR_VAR_2} a été placé dans la\\n\""] },
  { kind: '.string', vals: ["\"BOITE appelée “{STR_VAR_1}”.$\""] },
  { kind: '.string', vals: ["\"La BOITE “{STR_VAR_3}” sur le PC\\n\""] },
  { kind: '.string', vals: ["\"d'ANNETTE est pleine.\\p\""] },
  { kind: '.string', vals: ["\"{STR_VAR_2} a été placé dans la\\n\""] },
  { kind: '.string', vals: ["\"BOITE appelée “{STR_VAR_1}”.$\""] },
  { kind: '.string', vals: ["\"Il n'y a plus de place pour\\n\""] },
  { kind: '.string', vals: ["\"les POKéMON.\\p\""] },
  { kind: '.string', vals: ["\"Les BOITES sont pleines et\\n\""] },
  { kind: '.string', vals: ["\"ne peuvent plus rien recevoir.$\""] },
  { kind: '.string', vals: ["\"Voulez-vous donner un surnom\\n\""] },
  { kind: '.string', vals: ["\"à {STR_VAR_1}?$\""] },
] as const;
