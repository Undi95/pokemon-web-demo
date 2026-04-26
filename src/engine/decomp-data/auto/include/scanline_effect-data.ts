// AUTO-GENERATED from include/scanline_effect.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/scanline_effect.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `(((DMA_ENABLE | DMA_START_HBLANK | DMA_REPEAT | DMA_SRC_INC | DMA_DEST_INC | DMA_16BIT | DMA_DEST_RELOAD) << 16) | 1)` */
export const SCANLINE_EFFECT_DMACNT_16BIT_EXPR = "(((DMA_ENABLE | DMA_START_HBLANK | DMA_REPEAT | DMA_SRC_INC | DMA_DEST_INC | DMA_16BIT | DMA_DEST_RELOAD) << 16) | 1)";
/** Raw expr: `(((DMA_ENABLE | DMA_START_HBLANK | DMA_REPEAT | DMA_SRC_INC | DMA_DEST_INC | DMA_32BIT | DMA_DEST_RELOAD) << 16) | 1)` */
export const SCANLINE_EFFECT_DMACNT_32BIT_EXPR = "(((DMA_ENABLE | DMA_START_HBLANK | DMA_REPEAT | DMA_SRC_INC | DMA_DEST_INC | DMA_32BIT | DMA_DEST_RELOAD) << 16) | 1)";
/** Raw expr: `(REG_ADDR_BG0HOFS - REG_ADDR_BG0HOFS)` */
export const SCANLINE_EFFECT_REG_BG0HOFS_EXPR = "(REG_ADDR_BG0HOFS - REG_ADDR_BG0HOFS)";
/** Raw expr: `(REG_ADDR_BG0VOFS - REG_ADDR_BG0HOFS)` */
export const SCANLINE_EFFECT_REG_BG0VOFS_EXPR = "(REG_ADDR_BG0VOFS - REG_ADDR_BG0HOFS)";
/** Raw expr: `(REG_ADDR_BG1HOFS - REG_ADDR_BG0HOFS)` */
export const SCANLINE_EFFECT_REG_BG1HOFS_EXPR = "(REG_ADDR_BG1HOFS - REG_ADDR_BG0HOFS)";
/** Raw expr: `(REG_ADDR_BG1VOFS - REG_ADDR_BG0HOFS)` */
export const SCANLINE_EFFECT_REG_BG1VOFS_EXPR = "(REG_ADDR_BG1VOFS - REG_ADDR_BG0HOFS)";
/** Raw expr: `(REG_ADDR_BG2HOFS - REG_ADDR_BG0HOFS)` */
export const SCANLINE_EFFECT_REG_BG2HOFS_EXPR = "(REG_ADDR_BG2HOFS - REG_ADDR_BG0HOFS)";
/** Raw expr: `(REG_ADDR_BG2VOFS - REG_ADDR_BG0HOFS)` */
export const SCANLINE_EFFECT_REG_BG2VOFS_EXPR = "(REG_ADDR_BG2VOFS - REG_ADDR_BG0HOFS)";
/** Raw expr: `(REG_ADDR_BG3HOFS - REG_ADDR_BG0HOFS)` */
export const SCANLINE_EFFECT_REG_BG3HOFS_EXPR = "(REG_ADDR_BG3HOFS - REG_ADDR_BG0HOFS)";
/** Raw expr: `(REG_ADDR_BG3VOFS - REG_ADDR_BG0HOFS)` */
export const SCANLINE_EFFECT_REG_BG3VOFS_EXPR = "(REG_ADDR_BG3VOFS - REG_ADDR_BG0HOFS)";

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ScanlineEffect_Stop', ret: "void", arity: 0, params: "void" },
  { name: 'ScanlineEffect_Clear', ret: "void", arity: 0, params: "void" },
  { name: 'ScanlineEffect_SetParams', ret: "void", arity: 1, params: "struct ScanlineEffectParams params" },
  { name: 'ScanlineEffect_InitHBlankDmaTransfer', ret: "void", arity: 0, params: "void" },
  { name: 'ScanlineEffect_InitWave', ret: "u8", arity: 7, params: "u8 startLine, u8 endLine, u8 frequency, u8 amplitude, u8 delayInterval, u8 regOffset, bool8 applyBattleBgOffsets" },
] as const;
