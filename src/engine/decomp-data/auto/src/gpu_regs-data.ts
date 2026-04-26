// AUTO-GENERATED from src/gpu_regs.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/gpu_regs.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const GPU_REG_BUF_SIZE = 96;
export const EMPTY_SLOT = 255;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CopyBufferedValueToGpuReg', ret: "void", arity: 1, params: "u8 regOffset" },
  { name: 'SyncRegIE', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateRegDispstatIntrBits', ret: "void", arity: 1, params: "u16 regIE" },
  { name: 'InitGpuRegManager', ret: "void", arity: 0, params: "void" },
  { name: 'CopyBufferedValuesToGpuRegs', ret: "void", arity: 0, params: "void" },
  { name: 'SetGpuReg', ret: "void", arity: 2, params: "u8 regOffset, u16 value" },
  { name: 'SetGpuReg_ForcedBlank', ret: "void", arity: 2, params: "u8 regOffset, u16 value" },
  { name: 'GetGpuReg', ret: "u16", arity: 1, params: "u8 regOffset" },
  { name: 'SetGpuRegBits', ret: "void", arity: 2, params: "u8 regOffset, u16 mask" },
  { name: 'ClearGpuRegBits', ret: "void", arity: 2, params: "u8 regOffset, u16 mask" },
  { name: 'EnableInterrupts', ret: "void", arity: 1, params: "u16 mask" },
  { name: 'DisableInterrupts', ret: "void", arity: 1, params: "u16 mask" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'gpu_regs.h',
] as const;
