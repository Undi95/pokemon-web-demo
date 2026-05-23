// AUTO-GENERATED from include/item_use.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/item_use.h
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_ItemTMHMOrEvolutionStone = {
  ITEM_IS_OTHER: 0,
  ITEM_IS_TM_HM: 1,
  ITEM_IS_EVOLUTION_STONE: 2,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ItemUseOutOfBattle_Mail', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_Bike', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_Rod', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_Itemfinder', ret: "void", arity: 1, params: "u8 var" },
  { name: 'ItemUseOutOfBattle_PokeblockCase', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_CoinCase', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_PowderJar', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_WailmerPail', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_Medicine', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_ReduceEV', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_SacredAsh', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_PPRecovery', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_PPUp', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_RareCandy', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_TMHM', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_Repel', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_EscapeRope', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_BlackWhiteFlute', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_EvolutionStone', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_Berry', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_EnigmaBerry', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseOutOfBattle_CannotUse', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseInBattle_PokeBall', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseInBattle_StatIncrease', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseInBattle_Medicine', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseInBattle_PPRecovery', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseInBattle_Escape', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemUseInBattle_EnigmaBerry', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_UseDigEscapeRopeOnField', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CanUseDigOrEscapeRopeOnCurMap', ret: "bool8", arity: 0, params: "void" },
  { name: 'CheckIfItemIsTMHMOrEvolutionStone', ret: "u8", arity: 1, params: "u16 itemId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_UseDigEscapeRopeOnField',
] as const;
