// AUTO-GENERATED from include/pokedex_cry_screen.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/pokedex_cry_screen.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'LoadCryWaveformWindow', ret: "bool8", arity: 2, params: "struct CryScreenWindow *window, u8 windowId" },
  { name: 'UpdateCryWaveformWindow', ret: "void", arity: 1, params: "u8 windowId" },
  { name: 'CryScreenPlayButton', ret: "void", arity: 1, params: "u16 species" },
  { name: 'LoadCryMeter', ret: "bool8", arity: 2, params: "struct CryScreenWindow *window, u8 windowId" },
  { name: 'FreeCryScreen', ret: "void", arity: 0, params: "void" },
] as const;
