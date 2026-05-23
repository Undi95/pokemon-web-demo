// AUTO-GENERATED from src/dma3_manager.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/dma3_manager.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MAX_DMA_REQUESTS = 128;
export const DMA_REQUEST_COPY32 = 1;
export const DMA_REQUEST_FILL32 = 2;
export const DMA_REQUEST_COPY16 = 3;
export const DMA_REQUEST_FILL16 = 4;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ClearDma3Requests', ret: "void", arity: 0, params: "void" },
  { name: 'ProcessDma3Requests', ret: "void", arity: 0, params: "void" },
  { name: 'RequestDma3Copy', ret: "s16", arity: 4, params: "const void *src, void *dest, u16 size, u8 mode" },
  { name: 'RequestDma3Fill', ret: "s16", arity: 4, params: "s32 value, void *dest, u16 size, u8 mode" },
  { name: 'CheckForSpaceForDma3Request', ret: "s16", arity: 1, params: "s16 index" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'dma3.h',
] as const;
