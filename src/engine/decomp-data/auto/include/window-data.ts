// AUTO-GENERATED from include/window.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/window.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const WINDOWS_MAX = 32;
/** Raw expr: `\` */
export const DUMMY_WIN_TEMPLATE_EXPR = "\\";
export const WINDOW_NONE = 255;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_WINDOW_0 = {
  WINDOW_BG: 0,
  WINDOW_TILEMAP_LEFT: 1,
  WINDOW_TILEMAP_TOP: 2,
  WINDOW_WIDTH: 3,
  WINDOW_HEIGHT: 4,
  WINDOW_PALETTE_NUM: 5,
  WINDOW_BASE_BLOCK: 6,
  WINDOW_TILE_DATA: 7,
} as const;
export const ENUM_COPYWIN_1 = {
  COPYWIN_NONE: 0,
  COPYWIN_MAP: 1,
  COPYWIN_GFX: 2,
  COPYWIN_FULL: 3,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitWindows', ret: "bool16", arity: 1, params: "const struct WindowTemplate *templates" },
  { name: 'AddWindow', ret: "u16", arity: 1, params: "const struct WindowTemplate *template" },
  { name: 'AddWindowWithoutTileMap', ret: "int", arity: 1, params: "const struct WindowTemplate *template" },
  { name: 'RemoveWindow', ret: "void", arity: 1, params: "u8 windowId" },
  { name: 'FreeAllWindowBuffers', ret: "void", arity: 0, params: "void" },
  { name: 'CopyWindowToVram', ret: "void", arity: 2, params: "u8 windowId, u8 mode" },
  { name: 'CopyWindowRectToVram', ret: "void", arity: 6, params: "u32 windowId, u32 mode, u32 x, u32 y, u32 w, u32 h" },
  { name: 'PutWindowTilemap', ret: "void", arity: 1, params: "u8 windowId" },
  { name: 'PutWindowRectTilemapOverridePalette', ret: "void", arity: 6, params: "u8 windowId, u8 x, u8 y, u8 width, u8 height, u8 palette" },
  { name: 'ClearWindowTilemap', ret: "void", arity: 1, params: "u8 windowId" },
  { name: 'PutWindowRectTilemap', ret: "void", arity: 5, params: "u8 windowId, u8 x, u8 y, u8 width, u8 height" },
  { name: 'BlitBitmapToWindow', ret: "void", arity: 6, params: "u8 windowId, const u8 *pixels, u16 x, u16 y, u16 width, u16 height" },
  { name: 'BlitBitmapRectToWindow', ret: "void", arity: 10, params: "u8 windowId, const u8 *pixels, u16 srcX, u16 srcY, u16 srcWidth, int srcHeight, u16 destX, u16 destY, u16 rectWidth, u16 rectHeight" },
  { name: 'FillWindowPixelRect', ret: "void", arity: 6, params: "u8 windowId, u8 fillValue, u16 x, u16 y, u16 width, u16 height" },
  { name: 'CopyToWindowPixelBuffer', ret: "void", arity: 4, params: "u8 windowId, const void *src, u16 size, u16 tileOffset" },
  { name: 'FillWindowPixelBuffer', ret: "void", arity: 2, params: "u8 windowId, u8 fillValue" },
  { name: 'ScrollWindow', ret: "void", arity: 4, params: "u8 windowId, u8 direction, u8 distance, u8 fillValue" },
  { name: 'SetWindowAttribute', ret: "bool8", arity: 3, params: "u8 windowId, u8 attributeId, u32 value" },
  { name: 'GetWindowAttribute', ret: "u32", arity: 2, params: "u8 windowId, u8 attributeId" },
  { name: 'AddWindow8Bit', ret: "u16", arity: 1, params: "const struct WindowTemplate *template" },
  { name: 'FillWindowPixelBuffer8Bit', ret: "void", arity: 2, params: "u8 windowId, u8 fillValue" },
  { name: 'FillWindowPixelRect8Bit', ret: "void", arity: 6, params: "u8 windowId, u8 fillValue, u16 x, u16 y, u16 width, u16 height" },
  { name: 'BlitBitmapRectToWindow4BitTo8Bit', ret: "void", arity: 11, params: "u8 windowId, const u8 *pixels, u16 srcX, u16 srcY, u16 srcWidth, int srcHeight, u16 destX, u16 destY, u16 rectWidth, u16 rectHeight, u8 paletteNum" },
  { name: 'CopyWindowToVram8Bit', ret: "void", arity: 2, params: "u8 windowId, u8 mode" },
] as const;
