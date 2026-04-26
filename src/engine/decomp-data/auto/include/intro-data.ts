// AUTO-GENERATED from include/intro.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/intro.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_InitCopyrightScreenAfterBootup', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_InitCopyrightScreenAfterTitleScreen', ret: "void", arity: 0, params: "void" },
  { name: 'PanFadeAndZoomScreen', ret: "void", arity: 4, params: "u16 screenX, u16 screenY, u16 zoom, u16 alpha" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_InitCopyrightScreenAfterBootup',
  'CB2_InitCopyrightScreenAfterTitleScreen',
] as const;
