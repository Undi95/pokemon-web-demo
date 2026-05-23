// AUTO-GENERATED from src/battle_factory.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_factory.c
// Generated: 2026-04-26

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sBattleFactoryFunctions = ['InitFactoryChallenge', 'GetBattleFactoryData', 'SetBattleFactoryData', 'SaveFactoryChallenge', 'FactoryDummy1', 'FactoryDummy2', 'SelectInitialRentalMons', 'SwapRentalMons', 'SetPerformedRentalSwap', 'SetRentalsToOpponentParty', 'SetPlayerAndOpponentParties', 'SetOpponentGfxVar', 'GenerateOpponentMons', 'GenerateInitialRentalMons', 'GetOpponentMostCommonMonType', 'GetOpponentBattleStyle', 'RestorePlayerPartyHeldItems'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitFactoryChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'GetBattleFactoryData', ret: "void", arity: 0, params: "void" },
  { name: 'SetBattleFactoryData', ret: "void", arity: 0, params: "void" },
  { name: 'SaveFactoryChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'FactoryDummy1', ret: "void", arity: 0, params: "void" },
  { name: 'FactoryDummy2', ret: "void", arity: 0, params: "void" },
  { name: 'SelectInitialRentalMons', ret: "void", arity: 0, params: "void" },
  { name: 'SwapRentalMons', ret: "void", arity: 0, params: "void" },
  { name: 'SetPerformedRentalSwap', ret: "void", arity: 0, params: "void" },
  { name: 'SetRentalsToOpponentParty', ret: "void", arity: 0, params: "void" },
  { name: 'SetPlayerAndOpponentParties', ret: "void", arity: 0, params: "void" },
  { name: 'SetOpponentGfxVar', ret: "void", arity: 0, params: "void" },
  { name: 'GenerateOpponentMons', ret: "void", arity: 0, params: "void" },
  { name: 'GenerateInitialRentalMons', ret: "void", arity: 0, params: "void" },
  { name: 'GetOpponentMostCommonMonType', ret: "void", arity: 0, params: "void" },
  { name: 'GetOpponentBattleStyle', ret: "void", arity: 0, params: "void" },
  { name: 'RestorePlayerPartyHeldItems', ret: "void", arity: 0, params: "void" },
  { name: 'GetFactoryMonId', ret: "u16", arity: 3, params: "u8 lvlMode, u8 challengeNum, bool8 useBetterRange" },
  { name: 'GetMoveBattleStyle', ret: "u8", arity: 1, params: "u16 move" },
  { name: 'CallBattleFactoryFunction', ret: "void", arity: 0, params: "void" },
  { name: 'InBattleFactory', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetFactoryMonFixedIV', ret: "u8", arity: 2, params: "u8 challengeNum, bool8 isLastBattle" },
  { name: 'FillFactoryBrainParty', ret: "void", arity: 0, params: "void" },
  { name: 'GetNumPastRentalsRank', ret: "u8", arity: 2, params: "u8 battleMode, u8 lvlMode" },
  { name: 'GetAiScriptsInBattleFactory', ret: "u32", arity: 0, params: "void" },
  { name: 'SetMonMoveAvoidReturn', ret: "void", arity: 3, params: "struct Pokemon *mon, u16 moveArg, u8 moveSlot" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_factory.h',
  'battle_factory_screen.h',
  'event_data.h',
  'battle_setup.h',
  'overworld.h',
  'frontier_util.h',
  'battle_tower.h',
  'random.h',
  'constants/battle_ai.h',
  'constants/battle_factory.h',
  'constants/battle_frontier.h',
  'constants/battle_frontier_mons.h',
  'constants/battle_tent.h',
  'constants/frontier_util.h',
  'constants/layouts.h',
  'constants/trainers.h',
  'constants/moves.h',
  'constants/items.h',
] as const;
