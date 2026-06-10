// AUTO-GENERATED from data/text/obtain_item.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/text/obtain_item.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'gText_ObtainedTheItem', isGlobal: true, instrIndex: 0 },
  { name: 'gText_TheBagIsFull', isGlobal: true, instrIndex: 0 },
  { name: 'gText_PutItemInPocket', isGlobal: true, instrIndex: 0 },
  { name: 'gText_PlayerFoundOneItem', isGlobal: true, instrIndex: 0 },
  { name: 'gText_TooBadBagIsFull', isGlobal: true, instrIndex: 0 },
  { name: 'gText_PlayerPutItemInBag', isGlobal: true, instrIndex: 0 },
  { name: 'gText_ObtainedTheDecor', isGlobal: true, instrIndex: 0 },
  { name: 'gText_NoRoomLeftForAnother', isGlobal: true, instrIndex: 0 },
  { name: 'gText_TheDecorWasTransferredToThePC', isGlobal: true, instrIndex: 0 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .string=13
export const DATA_DIRECTIVES = [
  { kind: '.string', vals: ["\"Obtenu: {STR_VAR_2}!$\""] },
  { kind: '.string', vals: ["\"Le SAC est plein…$\""] },
  { kind: '.string', vals: ["\"{PLAYER} met {STR_VAR_2} dans\\n\""] },
  { kind: '.string', vals: ["\"POCHE {STR_VAR_3}.$\""] },
  { kind: '.string', vals: ["\"{PLAYER} trouve {STR_VAR_2}!$\""] },
  { kind: '.string', vals: ["\"Dommage!\\n\""] },
  { kind: '.string', vals: ["\"Le SAC est plein.$\""] },
  { kind: '.string', vals: ["\"{PLAYER} met {STR_VAR_2} dans\\n\""] },
  { kind: '.string', vals: ["\"le SAC.$\""] },
  { kind: '.string', vals: ["\"Obtenu: {STR_VAR_2}!$\""] },
  { kind: '.string', vals: ["\"Dommage! Il n'y a plus assez de place\\n\""] },
  { kind: '.string', vals: ["\"pour {STR_VAR_2}…$\""] },
  { kind: '.string', vals: ["\"Transfert de {STR_VAR_2} sur le PC.$\""] },
] as const;
