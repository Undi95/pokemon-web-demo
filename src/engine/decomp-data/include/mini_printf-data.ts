// AUTO-GENERATED from include/mini_printf.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/mini_printf.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'mini_vsnprintf', ret: "s32", arity: 4, params: "char *buffer, u32 buffer_len, const char *fmt, va_list va" },
  { name: 'mini_vpprintf', ret: "s32", arity: 3, params: "void *buf, const char *fmt, va_list va" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'stdarg.h',
  'gba/types.h',
] as const;
