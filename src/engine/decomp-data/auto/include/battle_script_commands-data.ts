// AUTO-GENERATED from include/battle_script_commands.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/battle_script_commands.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `(1 << 0)` */
export const WINDOW_CLEAR_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 7)` */
export const WINDOW_BG1_EXPR = "(1 << 7)";
/** Raw expr: `23, 8, 29, 13` */
export const YESNOBOX_X_Y_EXPR = "23, 8, 29, 13";

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AI_CalcDmg', ret: "void", arity: 2, params: "u8 attacker, u8 defender" },
  { name: 'TypeCalc', ret: "u8", arity: 3, params: "u16 move, u8 attacker, u8 defender" },
  { name: 'AI_TypeCalc', ret: "u8", arity: 3, params: "u16 move, u16 targetSpecies, u8 targetAbility" },
  { name: 'GetBattlerTurnOrderNum', ret: "u8", arity: 1, params: "u8 battler" },
  { name: 'SetMoveEffect', ret: "void", arity: 2, params: "bool8 primary, u8 certain" },
  { name: 'BattleDestroyYesNoCursorAt', ret: "void", arity: 1, params: "u8 cursorPosition" },
  { name: 'BattleCreateYesNoCursorAt', ret: "void", arity: 1, params: "u8 cursorPosition" },
  { name: 'BufferMoveToLearnIntoBattleTextBuff2', ret: "void", arity: 0, params: "void" },
  { name: 'HandleBattleWindow', ret: "void", arity: 5, params: "u8 xStart, u8 yStart, u8 xEnd, u8 yEnd, u8 flags" },
  { name: 'UproarWakeUpCheck', ret: "bool8", arity: 1, params: "u8 battler" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'constants/battle_script_commands.h',
] as const;
