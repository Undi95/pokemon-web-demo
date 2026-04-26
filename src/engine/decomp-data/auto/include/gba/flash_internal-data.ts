// AUTO-GENERATED from include/gba/flash_internal.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/gba/flash_internal.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `((u8 *)0xE000000)` */
export const FLASH_BASE_EXPR = "((u8 *)0xE000000)";
export const FLASH_ROM_SIZE_1M = 131072;
export const SECTORS_PER_BANK = 16;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SwitchFlashBank', ret: "void", arity: 1, params: "u8 bankNum" },
  { name: 'ReadFlashId', ret: "u16", arity: 0, params: "void" },
  { name: 'StartFlashTimer', ret: "void", arity: 1, params: "u8 phase" },
  { name: 'SetReadFlash1', ret: "void", arity: 1, params: "u16 *dest" },
  { name: 'StopFlashTimer', ret: "void", arity: 0, params: "void" },
  { name: 'ReadFlash', ret: "void", arity: 4, params: "u16 sectorNum, u32 offset, u8 *dest, u32 size" },
  { name: 'WaitForFlashWrite_Common', ret: "u16", arity: 3, params: "u8 phase, u8 *addr, u8 lastData" },
  { name: 'EraseFlashChip_MX', ret: "u16", arity: 0, params: "void" },
  { name: 'EraseFlashSector_MX', ret: "u16", arity: 1, params: "u16 sectorNum" },
  { name: 'ProgramFlashByte_MX', ret: "u16", arity: 3, params: "u16 sectorNum, u32 offset, u8 data" },
  { name: 'ProgramFlashSector_MX', ret: "u16", arity: 2, params: "u16 sectorNum, u8 *src" },
] as const;
