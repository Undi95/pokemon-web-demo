// AUTO-GENERATED from include/battle_arena.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/battle_arena.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CallBattleArenaFunction', ret: "void", arity: 0, params: "void" },
  { name: 'BattleArena_ShowJudgmentWindow', ret: "u8", arity: 1, params: "u8 *state" },
  { name: 'BattleArena_InitPoints', ret: "void", arity: 0, params: "void" },
  { name: 'BattleArena_AddMindPoints', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'BattleArena_AddSkillPoints', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'BattleArena_DeductSkillPoints', ret: "void", arity: 2, params: "u8 battler, u16 stringId" },
  { name: 'DrawArenaRefereeTextBox', ret: "void", arity: 0, params: "void" },
  { name: 'EraseArenaRefereeTextBox', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'constants/battle_arena.h',
] as const;
