// AUTO-GENERATED from include/text_window.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/text_window.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const WINDOW_FRAMES_COUNT = 20;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'LoadMessageBoxGfx', ret: "void", arity: 3, params: "u8 windowId, u16 destOffset, u8 palOffset" },
  { name: 'LoadWindowGfx', ret: "void", arity: 4, params: "u8 windowId, u8 frameId, u16 destOffset, u8 palOffset" },
  { name: 'LoadUserWindowBorderGfx', ret: "void", arity: 3, params: "u8 windowId, u16 destOffset, u8 palOffset" },
  { name: 'LoadUserWindowBorderGfx_', ret: "void", arity: 3, params: "u8 windowId, u16 destOffset, u8 palOffset" },
  { name: 'LoadUserWindowBorderGfxOnBg', ret: "void", arity: 3, params: "u8 bg, u16 destOffset, u8 palOffset" },
  { name: 'DrawTextBorderOuter', ret: "void", arity: 3, params: "u8 windowId, u16 tileNum, u8 palNum" },
  { name: 'DrawTextBorderInner', ret: "void", arity: 3, params: "u8 windowId, u16 tileNum, u8 palNum" },
  { name: 'rbox_fill_rectangle', ret: "void", arity: 1, params: "u8 windowId" },
] as const;
