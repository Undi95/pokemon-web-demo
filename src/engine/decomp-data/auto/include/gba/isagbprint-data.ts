// AUTO-GENERATED from include/gba/isagbprint.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/gba/isagbprint.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MGBA_LOG_FATAL = 0;
export const MGBA_LOG_ERROR = 1;
export const MGBA_LOG_WARN = 2;
export const MGBA_LOG_INFO = 3;
export const MGBA_LOG_DEBUG = 4;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'MgbaOpen', ret: "bool32", arity: 0, params: "void" },
  { name: 'MgbaClose', ret: "void", arity: 0, params: "void" },
  { name: 'MgbaPrintf', ret: "void", arity: 3, params: "s32 level, const char *pBuf, ..." },
  { name: 'MgbaAssert', ret: "void", arity: 4, params: "const char *pFile, s32 nLine, const char *pExpression, bool32 nStopProgram" },
  { name: 'NoCashGBAPrintf', ret: "void", arity: 2, params: "const char *pBuf, ..." },
  { name: 'NoCashGBAAssert', ret: "void", arity: 4, params: "const char *pFile, s32 nLine, const char *pExpression, bool32 nStopProgram" },
  { name: 'AGBPrintf', ret: "void", arity: 2, params: "const char *pBuf, ..." },
  { name: 'AGBAssert', ret: "void", arity: 4, params: "const char *pFile, int nLine, const char *pExpression, int nStopProgram" },
  { name: 'AGBPrintInit', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'gba/types.h',
] as const;
