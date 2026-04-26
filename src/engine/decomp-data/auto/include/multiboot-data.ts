// AUTO-GENERATED from include/multiboot.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/multiboot.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MULTIBOOT_MASTER_INFO = 98;
export const MULTIBOOT_CLIENT_INFO = 114;
export const MULTIBOOT_MASTER_START_PROBE = 97;
export const MULTIBOOT_MASTER_REQUEST_DLREADY = 99;
export const MULTIBOOT_CLIENT_DLREADY = 115;
export const MULTIBOOT_MASTER_START_DL = 100;
export const MULTIBOOT_MASTER_REQUEST_CRC = 101;
export const MULTIBOOT_CLIENT_CALC_CRC = 116;
export const MULTIBOOT_CLIENT_CRCREADY = 117;
export const MULTIBOOT_MASTER_VERIFY_CRC = 102;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'MultiBootInit', ret: "void", arity: 1, params: "struct MultiBootParam *mp" },
  { name: 'MultiBootMain', ret: "int", arity: 1, params: "struct MultiBootParam *mp" },
  { name: 'MultiBootStartProbe', ret: "void", arity: 1, params: "struct MultiBootParam *mp" },
  { name: 'MultiBootStartMaster', ret: "void", arity: 5, params: "struct MultiBootParam *mp, const u8 *srcp, int length, u8 palette_color, s8 palette_speed" },
  { name: 'MultiBootCheckComplete', ret: "int", arity: 1, params: "struct MultiBootParam *mp" },
] as const;
