// AUTO-GENERATED from include/malloc.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/malloc.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const HEAP_SIZE = 114688;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Free', ret: "void", arity: 1, params: "void *pointer" },
  { name: 'InitHeap', ret: "void", arity: 2, params: "void *heapStart, u32 heapSize" },
] as const;
