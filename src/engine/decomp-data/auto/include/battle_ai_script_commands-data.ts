// AUTO-GENERATED from include/battle_ai_script_commands.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/battle_ai_script_commands.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const AI_CHOICE_FLEE = 4;
export const AI_CHOICE_WATCH = 5;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'BattleAI_HandleItemUseBeforeAISetup', ret: "void", arity: 1, params: "u8 defaultScoreMoves" },
  { name: 'BattleAI_SetupAIData', ret: "void", arity: 1, params: "u8 defaultScoreMoves" },
  { name: 'BattleAI_ChooseMoveOrAction', ret: "u8", arity: 0, params: "void" },
  { name: 'ClearBattlerMoveHistory', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'RecordAbilityBattle', ret: "void", arity: 2, params: "u8 battler, u8 abilityId" },
  { name: 'ClearBattlerAbilityHistory', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'RecordItemEffectBattle', ret: "void", arity: 2, params: "u8 battler, u8 itemEffect" },
  { name: 'ClearBattlerItemEffectHistory', ret: "void", arity: 1, params: "u8 battler" },
] as const;
