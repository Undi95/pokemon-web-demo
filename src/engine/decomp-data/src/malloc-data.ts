// AUTO-GENERATED from src/malloc.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/malloc.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MALLOC_SYSTEM_ID = 41891;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'gHeap', isArray: true, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'PutMemBlockHeader', ret: "void", arity: 4, params: "void *block, struct MemBlock *prev, struct MemBlock *next, u32 size" },
  { name: 'PutFirstMemBlockHeader', ret: "void", arity: 2, params: "void *block, u32 size" },
  { name: 'FreeInternal', ret: "void", arity: 2, params: "void *heapStart, void *pointer" },
  { name: 'CheckMemBlockInternal', ret: "bool32", arity: 2, params: "void *heapStart, void *pointer" },
  { name: 'InitHeap', ret: "void", arity: 2, params: "void *heapStart, u32 heapSize" },
  { name: 'Free', ret: "void", arity: 1, params: "void *pointer" },
  { name: 'CheckMemBlock', ret: "bool32", arity: 1, params: "void *pointer" },
  { name: 'CheckHeap', ret: "bool32", arity: 0, params: "" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
] as const;
