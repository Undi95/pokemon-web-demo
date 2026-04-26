// AUTO-GENERATED from include/battle_factory.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/battle_factory.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CallBattleFactoryFunction', ret: "void", arity: 0, params: "void" },
  { name: 'InBattleFactory', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetFactoryMonFixedIV', ret: "u8", arity: 2, params: "u8 challengeNum, bool8 isLastBattle" },
  { name: 'FillFactoryBrainParty', ret: "void", arity: 0, params: "void" },
  { name: 'GetNumPastRentalsRank', ret: "u8", arity: 2, params: "u8 battleMode, u8 lvlMode" },
  { name: 'GetAiScriptsInBattleFactory', ret: "u32", arity: 0, params: "void" },
  { name: 'SetMonMoveAvoidReturn', ret: "void", arity: 3, params: "struct Pokemon *mon, u16 moveArg, u8 moveSlot" },
] as const;
