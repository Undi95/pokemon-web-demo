// AUTO-GENERATED from src/agb_flash_mx.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/agb_flash_mx.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'EraseFlashChip_MX', ret: "u16", arity: 0, params: "void" },
  { name: 'EraseFlashSector_MX', ret: "u16", arity: 1, params: "u16 sectorNum" },
  { name: 'ProgramFlashByte_MX', ret: "u16", arity: 3, params: "u16 sectorNum, u32 offset, u8 data" },
  { name: 'ProgramByte', ret: "u16", arity: 2, params: "u8 *src, u8 *dest" },
  { name: 'ProgramFlashSector_MX', ret: "u16", arity: 2, params: "u16 sectorNum, u8 *src" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'gba/gba.h',
  'gba/flash_internal.h',
] as const;
