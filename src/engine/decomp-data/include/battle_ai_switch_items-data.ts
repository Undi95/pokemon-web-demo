// AUTO-GENERATED from include/battle_ai_switch_items.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/battle_ai_switch_items.h
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_AI_0 = {
  AI_ITEM_FULL_RESTORE: 1,
  AI_ITEM_HEAL_HP: 2,
  AI_ITEM_CURE_CONDITION: 3,
  AI_ITEM_X_STAT: 4,
  AI_ITEM_GUARD_SPEC: 5,
  AI_ITEM_NOT_RECOGNIZABLE: 6,
} as const;
export const ENUM_AI_1 = {
  AI_HEAL_CONFUSION: 0,
  AI_HEAL_PARALYSIS: 1,
  AI_HEAL_FREEZE: 2,
  AI_HEAL_BURN: 3,
  AI_HEAL_POISON: 4,
  AI_HEAL_SLEEP: 5,
} as const;
export const ENUM_AI_2 = {
  AI_X_ATTACK: 0,
  AI_X_DEFEND: 1,
  AI_X_SPEED: 2,
  AI_X_SPATK: 3,
  AI_X_SPDEF: 4,
  AI_X_ACCURACY: 5,
  AI_X_EVASION: 6,
  AI_DIRE_HIT: 7,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AI_TrySwitchOrUseItem', ret: "void", arity: 0, params: "void" },
  { name: 'GetMostSuitableMonToSwitchInto', ret: "u8", arity: 0, params: "void" },
] as const;
