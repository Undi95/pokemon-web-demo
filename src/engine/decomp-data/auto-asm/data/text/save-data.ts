// AUTO-GENERATED from data/text/save.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/text/save.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'gText_ConfirmSave', isGlobal: true, instrIndex: 0 },
  { name: 'gText_AlreadySavedFile', isGlobal: true, instrIndex: 0 },
  { name: 'gText_SavingDontTurnOff', isGlobal: true, instrIndex: 0 },
  { name: 'gText_PlayerSavedGame', isGlobal: true, instrIndex: 0 },
  { name: 'gText_DifferentSaveFile', isGlobal: true, instrIndex: 0 },
  { name: 'gText_SaveError', isGlobal: true, instrIndex: 0 },
  { name: 'gText_SavingDontTurnOffPower', isGlobal: true, instrIndex: 0 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .string=13
export const DATA_DIRECTIVES = [
  { kind: '.string', vals: ["\"Voulez-vous sauvegarder la partie?$\""] },
  { kind: '.string', vals: ["\"Il y a déjà une partie sauvegardée.\\n\""] },
  { kind: '.string', vals: ["\"Voulez-vous la remplacer?$\""] },
  { kind: '.string', vals: ["\"SAUVEGARDE EN COURS…\\n\""] },
  { kind: '.string', vals: ["\"N'ETEIGNEZ PAS LA CONSOLE.$\""] },
  { kind: '.string', vals: ["\"{PLAYER} a sauvegardé la partie.$\""] },
  { kind: '.string', vals: ["\"Une partie différente est déjà\\n\""] },
  { kind: '.string', vals: ["\"sauvegardée.\\p\""] },
  { kind: '.string', vals: ["\"Voulez-vous la remplacer?$\""] },
  { kind: '.string', vals: ["\"Erreur de sauvegarde.\\p\""] },
  { kind: '.string', vals: ["\"Changer la mémoire de sauvegarde.$\""] },
  { kind: '.string', vals: ["\"SAUVEGARDE EN COURS…\\n\""] },
  { kind: '.string', vals: ["\"NE PAS ETEINDRE.$\""] },
] as const;
