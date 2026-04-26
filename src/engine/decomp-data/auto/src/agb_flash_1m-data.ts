// AUTO-GENERATED from src/agb_flash_1m.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/agb_flash_1m.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'IdentifyFlash', ret: "u16", arity: 0, params: "void" },
  { name: 'WaitForFlashWrite_Common', ret: "u16", arity: 3, params: "u8 phase, u8 *addr, u8 lastData" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'gba/gba.h',
  'gba/flash_internal.h',
] as const;
