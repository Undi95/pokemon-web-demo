// AUTO-GENERATED from data/text/contest_link.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/text/contest_link.inc
// Generated: 2026-04-26

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'gTest_MissedTurn', isGlobal: true, instrIndex: 0 },
  { name: 'gText_LinkStandby4', isGlobal: true, instrIndex: 0 },
  { name: 'gText_WinnerIsPlayersMonCongrats', isGlobal: true, instrIndex: 0 },
  { name: 'gText_WinnerIsPlayersMon', isGlobal: true, instrIndex: 0 },
  { name: 'gText_PrimaryJudgingNumX', isGlobal: true, instrIndex: 0 },
  { name: 'gText_SecondaryJudgingNumX', isGlobal: true, instrIndex: 0 },
  { name: 'gText_SetEventNumX', isGlobal: true, instrIndex: 0 },
  { name: 'gText_MoveUsedMostOften', isGlobal: true, instrIndex: 0 },
  { name: 'gText_MostImpressiveMon', isGlobal: true, instrIndex: 0 },
  { name: 'gText_SetEventNumX2', isGlobal: true, instrIndex: 0 },
  { name: 'gText_LinkTVProgramWillNotBeMadeTrainerLost', isGlobal: true, instrIndex: 0 },
] as const;

// ─── Data directives (.byte/.2byte/.4byte/.string raw bytes) ───────────────
// Counts: .string=16
export const DATA_DIRECTIVES = [
  { kind: '.string', vals: ["\"Missed turn$\""] },
  { kind: '.string', vals: ["\"Connexion…$\""] },
  { kind: '.string', vals: ["\"The winner is {STR_VAR_1}'s {STR_VAR_2}!\\n\""] },
  { kind: '.string', vals: ["\"Congratulations!$\""] },
  { kind: '.string', vals: ["\"Le vainqueur est\\n\""] },
  { kind: '.string', vals: ["\"{STR_VAR_2} de {STR_VAR_1}!{PAUSE_UNTIL_PRESS}$\""] },
  { kind: '.string', vals: ["\"Jugement préliminaire: Nº {STR_VAR_1}{PAUSE_UNTIL_PRESS}$\""] },
  { kind: '.string', vals: ["\"Jugement secondaire: Nº {STR_VAR_1}{PAUSE_UNTIL_PRESS}$\""] },
  { kind: '.string', vals: ["\"Set event: No. {STR_VAR_1}{PAUSE_UNTIL_PRESS}$\""] },
  { kind: '.string', vals: ["\"Capacité utilisée le plus souvent:\\n\""] },
  { kind: '.string', vals: ["\"{STR_VAR_1}{PAUSE_UNTIL_PRESS}$\""] },
  { kind: '.string', vals: ["\"POKéMON le plus impressionnant:\\n\""] },
  { kind: '.string', vals: ["\"{STR_VAR_2} de {STR_VAR_1}{PAUSE_UNTIL_PRESS}$\""] },
  { kind: '.string', vals: ["\"Set event: No. {STR_VAR_1}{PAUSE_UNTIL_PRESS}$\""] },
  { kind: '.string', vals: ["\"Le DRESSEUR a perdu. Aucun\\n\""] },
  { kind: '.string', vals: ["\"programme télé ne sera donc diffusé.{PAUSE_UNTIL_PRESS}$\""] },
] as const;
