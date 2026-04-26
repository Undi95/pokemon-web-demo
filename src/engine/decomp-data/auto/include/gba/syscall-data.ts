// AUTO-GENERATED from include/gba/syscall.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/gba/syscall.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const RESET_EWRAM = 1;
export const RESET_IWRAM = 2;
export const RESET_PALETTE = 4;
export const RESET_VRAM = 8;
export const RESET_OAM = 16;
export const RESET_SIO_REGS = 32;
export const RESET_SOUND_REGS = 64;
export const RESET_REGS = 128;
export const RESET_ALL = 255;
export const CPU_SET_SRC_FIXED = 16777216;
export const CPU_SET_16BIT = 0;
export const CPU_SET_32BIT = 67108864;
export const CPU_FAST_SET_SRC_FIXED = 16777216;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SoftReset', ret: "void", arity: 1, params: "u32 resetFlags" },
  { name: 'RegisterRamReset', ret: "void", arity: 1, params: "u32 resetFlags" },
  { name: 'VBlankIntrWait', ret: "void", arity: 0, params: "void" },
  { name: 'Sqrt', ret: "u16", arity: 1, params: "u32 num" },
  { name: 'ArcTan2', ret: "u16", arity: 2, params: "s16 x, s16 y" },
  { name: 'CpuSet', ret: "void", arity: 3, params: "const void *src, void *dest, u32 control" },
  { name: 'CpuFastSet', ret: "void", arity: 3, params: "const void *src, void *dest, u32 control" },
  { name: 'BgAffineSet', ret: "void", arity: 3, params: "struct BgAffineSrcData *src, struct BgAffineDstData *dest, s32 count" },
  { name: 'ObjAffineSet', ret: "void", arity: 4, params: "struct ObjAffineSrcData *src, void *dest, s32 count, s32 offset" },
  { name: 'LZ77UnCompWram', ret: "void", arity: 2, params: "const u32 *src, void *dest" },
  { name: 'LZ77UnCompVram', ret: "void", arity: 2, params: "const u32 *src, void *dest" },
  { name: 'RLUnCompWram', ret: "void", arity: 2, params: "const u32 *src, void *dest" },
  { name: 'RLUnCompVram', ret: "void", arity: 2, params: "const u32 *src, void *dest" },
  { name: 'MultiBoot', ret: "int", arity: 1, params: "struct MultiBootParam *mp" },
  { name: 'Div', ret: "s32", arity: 2, params: "s32 num, s32 denom" },
] as const;
