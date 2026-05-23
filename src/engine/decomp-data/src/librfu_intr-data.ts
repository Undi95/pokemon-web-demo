// AUTO-GENERATED from src/librfu_intr.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/librfu_intr.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'sio32intr_clock_master', ret: "void", arity: 0, params: "void" },
  { name: 'sio32intr_clock_slave', ret: "void", arity: 0, params: "void" },
  { name: 'handshake_wait', ret: "u16", arity: 1, params: "u16 slot" },
  { name: 'STWI_set_timer_in_RAM', ret: "void", arity: 1, params: "u8 count" },
  { name: 'STWI_stop_timer_in_RAM', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_init_slave', ret: "void", arity: 0, params: "void" },
  { name: 'IntrSIO32', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'librfu.h',
] as const;
