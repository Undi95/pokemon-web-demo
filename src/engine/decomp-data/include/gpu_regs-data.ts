// AUTO-GENERATED from include/gpu_regs.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/gpu_regs.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
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
