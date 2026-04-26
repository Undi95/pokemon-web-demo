// AUTO-GENERATED from include/dma3.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/dma3.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MAX_DMA_BLOCK_SIZE = 4096;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ClearDma3Requests', ret: "void", arity: 0, params: "void" },
  { name: 'ProcessDma3Requests', ret: "void", arity: 0, params: "void" },
  { name: 'RequestDma3Copy', ret: "s16", arity: 4, params: "const void *src, void *dest, u16 size, u8 mode" },
  { name: 'RequestDma3Fill', ret: "s16", arity: 4, params: "s32 value, void *dest, u16 size, u8 mode" },
  { name: 'CheckForSpaceForDma3Request', ret: "s16", arity: 1, params: "s16 index" },
] as const;
