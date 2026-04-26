// AUTO-GENERATED from src/battle_palace.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_palace.c
// Generated: 2026-04-26

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sBattlePalaceFunctions = ['InitPalaceChallenge', 'GetPalaceData', 'SetPalaceData', 'GetPalaceCommentId', 'SetPalaceOpponent', 'BufferOpponentIntroSpeech', 'IncrementPalaceStreak', 'SavePalaceChallenge', 'SetRandomPalacePrize', 'GivePalacePrize'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitPalaceChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'GetPalaceData', ret: "void", arity: 0, params: "void" },
  { name: 'SetPalaceData', ret: "void", arity: 0, params: "void" },
  { name: 'GetPalaceCommentId', ret: "void", arity: 0, params: "void" },
  { name: 'SetPalaceOpponent', ret: "void", arity: 0, params: "void" },
  { name: 'BufferOpponentIntroSpeech', ret: "void", arity: 0, params: "void" },
  { name: 'IncrementPalaceStreak', ret: "void", arity: 0, params: "void" },
  { name: 'SavePalaceChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'SetRandomPalacePrize', ret: "void", arity: 0, params: "void" },
  { name: 'GivePalacePrize', ret: "void", arity: 0, params: "void" },
  { name: 'CallBattlePalaceFunction', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'event_data.h',
  'battle_setup.h',
  'overworld.h',
  'random.h',
  'battle_tower.h',
  'frontier_util.h',
  'item.h',
  'string_util.h',
  'constants/items.h',
  'constants/battle_frontier.h',
  'constants/battle_palace.h',
  'constants/frontier_util.h',
  'constants/trainers.h',
] as const;
