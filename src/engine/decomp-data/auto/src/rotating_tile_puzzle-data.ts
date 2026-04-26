// AUTO-GENERATED from src/rotating_tile_puzzle.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/rotating_tile_puzzle.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const ROTATE_COUNTERCLOCKWISE = 0;
export const ROTATE_CLOCKWISE = 1;
export const ROTATE_NONE = 2;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SaveRotatingTileObject', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'TurnUnsavedRotatingTileObject', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'InitRotatingTilePuzzle', ret: "void", arity: 1, params: "bool8 isTrickHouse" },
  { name: 'FreeRotatingTilePuzzle', ret: "void", arity: 0, params: "void" },
  { name: 'MoveRotatingTileObjects', ret: "u16", arity: 1, params: "u8 puzzleNumber" },
  { name: 'TurnRotatingTileObjects', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'event_object_movement.h',
  'fieldmap.h',
  'malloc.h',
  'rotating_tile_puzzle.h',
  'script_movement.h',
  'constants/event_object_movement.h',
  'constants/event_objects.h',
  'constants/metatile_labels.h',
] as const;
