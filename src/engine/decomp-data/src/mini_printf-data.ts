// AUTO-GENERATED from src/mini_printf.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/mini_printf.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'mini_pchar_decode', ret: "char", arity: 1, params: "char encoded" },
  { name: '_putsAscii', ret: "s32", arity: 3, params: "char *s, s32 len, void *buf" },
  { name: '_putsEncoded', ret: "s32", arity: 3, params: "char *s, s32 len, void *buf" },
  { name: 'mini_strlen', ret: "s32", arity: 1, params: "const char *s" },
  { name: 'mini_itoa', ret: "s32", arity: 5, params: "s32 value, u32 radix, s32 uppercase, bool32 unsig, char *buffer" },
  { name: 'mini_itoa_bin', ret: "s32", arity: 2, params: "u32 value, char *buffer" },
  { name: 'mini_pad', ret: "s32", arity: 5, params: "char *ptr, s32 len, char pad_char, s32 pad_to, char *buffer" },
  { name: 'mini_vsnprintf', ret: "s32", arity: 4, params: "char *buffer, u32 buffer_len, const char *fmt, va_list va" },
  { name: 'mini_vpprintf', ret: "s32", arity: 3, params: "void *buf, const char *fmt, va_list va" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'mini_printf.h',
  'gba/types.h',
  'gba/defines.h',
  'config.h',
  'constants/characters.h',
  'string_util.h',
] as const;
