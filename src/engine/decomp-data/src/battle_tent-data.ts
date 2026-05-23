// AUTO-GENERATED from src/battle_tent.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_tent.c
// Generated: 2026-04-26

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sVerdanturfTentFuncs = ['InitVerdanturfTentChallenge', 'GetVerdanturfTentPrize', 'SetVerdanturfTentPrize', 'SetVerdanturfTentTrainerGfx', 'BufferVerdanturfTentTrainerIntro', 'SaveVerdanturfTentChallenge', 'SetRandomVerdanturfTentPrize', 'GiveVerdanturfTentPrize'] as const;
export const sFallarborTentFuncs = ['InitFallarborTentChallenge', 'GetFallarborTentPrize', 'SetFallarborTentPrize', 'SaveFallarborTentChallenge', 'SetRandomFallarborTentPrize', 'GiveFallarborTentPrize', 'BufferFallarborTentTrainerName'] as const;
export const sSlateportTentFuncs = ['InitSlateportTentChallenge', 'GetSlateportTentPrize', 'SetSlateportTentPrize', 'SaveSlateportTentChallenge', 'SetRandomSlateportTentPrize', 'GiveSlateportTentPrize', 'SelectInitialRentalMons', 'SwapRentalMons', 'GenerateOpponentMons', 'GenerateInitialRentalMons'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitVerdanturfTentChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'GetVerdanturfTentPrize', ret: "void", arity: 0, params: "void" },
  { name: 'SetVerdanturfTentPrize', ret: "void", arity: 0, params: "void" },
  { name: 'SetVerdanturfTentTrainerGfx', ret: "void", arity: 0, params: "void" },
  { name: 'BufferVerdanturfTentTrainerIntro', ret: "void", arity: 0, params: "void" },
  { name: 'SaveVerdanturfTentChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'SetRandomVerdanturfTentPrize', ret: "void", arity: 0, params: "void" },
  { name: 'GiveVerdanturfTentPrize', ret: "void", arity: 0, params: "void" },
  { name: 'InitFallarborTentChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'GetFallarborTentPrize', ret: "void", arity: 0, params: "void" },
  { name: 'SetFallarborTentPrize', ret: "void", arity: 0, params: "void" },
  { name: 'SaveFallarborTentChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'SetRandomFallarborTentPrize', ret: "void", arity: 0, params: "void" },
  { name: 'GiveFallarborTentPrize', ret: "void", arity: 0, params: "void" },
  { name: 'BufferFallarborTentTrainerName', ret: "void", arity: 0, params: "void" },
  { name: 'InitSlateportTentChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'GetSlateportTentPrize', ret: "void", arity: 0, params: "void" },
  { name: 'SetSlateportTentPrize', ret: "void", arity: 0, params: "void" },
  { name: 'SaveSlateportTentChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'SetRandomSlateportTentPrize', ret: "void", arity: 0, params: "void" },
  { name: 'GiveSlateportTentPrize', ret: "void", arity: 0, params: "void" },
  { name: 'SelectInitialRentalMons', ret: "void", arity: 0, params: "void" },
  { name: 'SwapRentalMons', ret: "void", arity: 0, params: "void" },
  { name: 'GenerateOpponentMons', ret: "void", arity: 0, params: "void" },
  { name: 'GenerateInitialRentalMons', ret: "void", arity: 0, params: "void" },
  { name: 'CallVerdanturfTentFunction', ret: "void", arity: 0, params: "void" },
  { name: 'CallFallarborTentFunction', ret: "void", arity: 0, params: "void" },
  { name: 'CallSlateportTentFunction', ret: "void", arity: 0, params: "void" },
  { name: 'InSlateportBattleTent', ret: "bool8", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_tent.h',
  'overworld.h',
  'event_data.h',
  'region_map.h',
  'battle.h',
  'battle_setup.h',
  'battle_tower.h',
  'random.h',
  'item.h',
  'battle_factory_screen.h',
  'frontier_util.h',
  'string_util.h',
  'constants/battle_tent.h',
  'constants/battle_tent_trainers.h',
  'constants/battle_tent_mons.h',
  'constants/items.h',
  'constants/layouts.h',
  'constants/region_map_sections.h',
  'constants/trainers.h',
] as const;
