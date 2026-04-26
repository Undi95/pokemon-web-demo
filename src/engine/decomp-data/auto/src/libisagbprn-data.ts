// AUTO-GENERATED from src/libisagbprn.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/libisagbprn.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const AGB_PRINT_FLUSH_ADDR = 167649437;
export const AGB_PRINT_STRUCT_ADDR = 167649528;
export const AGB_PRINT_PROTECT_ADDR = 167653374;
/** Raw expr: `(WAITCNT_PHI_OUT_16MHZ | WAITCNT_WS0_S_2 | WAITCNT_WS0_N_4)` */
export const WSCNT_DATA_EXPR = "(WAITCNT_PHI_OUT_16MHZ | WAITCNT_WS0_S_2 | WAITCNT_WS0_N_4)";
export const NOCASHGBAIDADDR = 83884544;
export const NOCASHGBAPRINTADDR1 = 83884560;
export const NOCASHGBAPRINTADDR2 = 83884564;
/** Raw expr: `((vu16*) (0x4FFF780))` */
export const REG_DEBUG_ENABLE_EXPR = "((vu16*) (0x4FFF780))";
/** Raw expr: `((vu16*) (0x4FFF700))` */
export const REG_DEBUG_FLAGS_EXPR = "((vu16*) (0x4FFF700))";
/** Raw expr: `((char*) (0x4FFF600))` */
export const REG_DEBUG_STRING_EXPR = "((char*) (0x4FFF600))";
export const MGBA_REG_DEBUG_MAX = 256;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AGBPrintFlush1Block', ret: "void", arity: 0, params: "void" },
  { name: 'AGBPrintInit', ret: "void", arity: 0, params: "void" },
  { name: 'AGBPutcInternal', ret: "void", arity: 1, params: "const char cChr" },
  { name: 'AGBPutc', ret: "void", arity: 1, params: "const char cChr" },
  { name: 'AGBPrint', ret: "void", arity: 1, params: "const char *pBuf" },
  { name: 'AGBPrintf', ret: "void", arity: 2, params: "const char *pBuf, ..." },
  { name: 'AGBPrintTransferDataInternal', ret: "void", arity: 1, params: "u32 bAllData" },
  { name: 'AGBPrintFlush', ret: "void", arity: 0, params: "void" },
  { name: 'AGBAssert', ret: "void", arity: 4, params: "const char *pFile, int nLine, const char *pExpression, int nStopProgram" },
  { name: 'NoCashGBAPrint', ret: "void", arity: 1, params: "const char *pBuf" },
  { name: 'NoCashGBAPrintf', ret: "void", arity: 2, params: "const char *pBuf, ..." },
  { name: 'NoCashGBAAssert', ret: "void", arity: 4, params: "const char *pFile, s32 nLine, const char *pExpression, bool32 nStopProgram" },
  { name: 'MgbaOpen', ret: "bool32", arity: 0, params: "void" },
  { name: 'MgbaClose', ret: "void", arity: 0, params: "void" },
  { name: 'MgbaPrintf', ret: "void", arity: 3, params: "s32 level, const char *ptr, ..." },
  { name: 'MgbaAssert', ret: "void", arity: 4, params: "const char *pFile, s32 nLine, const char *pExpression, bool32 nStopProgram" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'stdarg.h',
  'stdio.h',
  'gba/gba.h',
  'config.h',
  'malloc.h',
  'mini_printf.h',
] as const;
