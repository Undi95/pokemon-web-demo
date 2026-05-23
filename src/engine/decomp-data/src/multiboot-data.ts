// AUTO-GENERATED from src/multiboot.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/multiboot.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `(mp->system_work[0])` */
export const send_data_EXPR = "(mp->system_work[0])";
/** Raw expr: `(mp->system_work[1])` */
export const must_data_EXPR = "(mp->system_work[1])";

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'MultiBootSend', ret: "int", arity: 2, params: "struct MultiBootParam *mp, u16 data" },
  { name: 'MultiBootHandShake', ret: "int", arity: 1, params: "struct MultiBootParam *mp" },
  { name: 'MultiBootWaitCycles', ret: "void", arity: 1, params: "u32 cycles" },
  { name: 'MultiBootWaitSendDone', ret: "void", arity: 0, params: "void" },
  { name: 'MultiBootInit', ret: "void", arity: 1, params: "struct MultiBootParam *mp" },
  { name: 'MultiBootMain', ret: "int", arity: 1, params: "struct MultiBootParam *mp" },
  { name: 'MultiBootStartProbe', ret: "void", arity: 1, params: "struct MultiBootParam *mp" },
  { name: 'MultiBootStartMaster', ret: "void", arity: 5, params: "struct MultiBootParam *mp, const u8 *srcp, int length, u8 palette_color, s8 palette_speed" },
  { name: 'MultiBootCheckComplete', ret: "int", arity: 1, params: "struct MultiBootParam *mp" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'gba/gba.h',
  'multiboot.h',
] as const;
