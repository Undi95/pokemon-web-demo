// AUTO-GENERATED from src/agb_flash.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/agb_flash.c
// Generated: 2026-04-26

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'COMMON_DATA', type: "u8", name: 'gFlashTimeoutFlag', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u16", name: 'gFlashNumRemainingBytes', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SetReadFlash1', ret: "void", arity: 1, params: "u16 *dest" },
  { name: 'SwitchFlashBank', ret: "void", arity: 1, params: "u8 bankNum" },
  { name: 'ReadFlashId', ret: "u16", arity: 0, params: "void" },
  { name: 'FlashTimerIntr', ret: "void", arity: 0, params: "void" },
  { name: 'StartFlashTimer', ret: "void", arity: 1, params: "u8 phase" },
  { name: 'StopFlashTimer', ret: "void", arity: 0, params: "void" },
  { name: 'ReadFlash1', ret: "u8", arity: 1, params: "u8 *addr" },
  { name: 'ReadFlash_Core', ret: "void", arity: 3, params: "vu8 *src, u8 *dest, u32 size" },
  { name: 'ReadFlash', ret: "void", arity: 4, params: "u16 sectorNum, u32 offset, u8 *dest, u32 size" },
  { name: 'VerifyFlashSector_Core', ret: "u32", arity: 3, params: "u8 *src, u8 *tgt, u32 size" },
  { name: 'VerifyFlashSector', ret: "u32", arity: 2, params: "u16 sectorNum, u8 *src" },
  { name: 'VerifyFlashSectorNBytes', ret: "u32", arity: 3, params: "u16 sectorNum, u8 *src, u32 n" },
  { name: 'ProgramFlashSectorAndVerify', ret: "u32", arity: 2, params: "u16 sectorNum, u8 *src" },
  { name: 'ProgramFlashSectorAndVerifyNBytes', ret: "u32", arity: 3, params: "u16 sectorNum, u8 *src, u32 n" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'gba/gba.h',
  'gba/flash_internal.h',
] as const;
