// AUTO-GENERATED from src/text_window.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/text_window.c
// Generated: 2026-04-26

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'gTextWindowFrame1_Gfx': { path: 'graphics/text_window/1.png', ext: '.4bpp', type: 'u8' },
  'sTextWindowFrame2_Gfx': { path: 'graphics/text_window/2.png', ext: '.4bpp', type: 'u8' },
  'sTextWindowFrame3_Gfx': { path: 'graphics/text_window/3.png', ext: '.4bpp', type: 'u8' },
  'sTextWindowFrame4_Gfx': { path: 'graphics/text_window/4.png', ext: '.4bpp', type: 'u8' },
  'sTextWindowFrame5_Gfx': { path: 'graphics/text_window/5.png', ext: '.4bpp', type: 'u8' },
  'sTextWindowFrame6_Gfx': { path: 'graphics/text_window/6.png', ext: '.4bpp', type: 'u8' },
  'sTextWindowFrame7_Gfx': { path: 'graphics/text_window/7.png', ext: '.4bpp', type: 'u8' },
  'sTextWindowFrame8_Gfx': { path: 'graphics/text_window/8.png', ext: '.4bpp', type: 'u8' },
  'sTextWindowFrame9_Gfx': { path: 'graphics/text_window/9.png', ext: '.4bpp', type: 'u8' },
  'sTextWindowFrame10_Gfx': { path: 'graphics/text_window/10.png', ext: '.4bpp', type: 'u8' },
  'sTextWindowFrame11_Gfx': { path: 'graphics/text_window/11.png', ext: '.4bpp', type: 'u8' },
  'sTextWindowFrame12_Gfx': { path: 'graphics/text_window/12.png', ext: '.4bpp', type: 'u8' },
  'sTextWindowFrame13_Gfx': { path: 'graphics/text_window/13.png', ext: '.4bpp', type: 'u8' },
  'sTextWindowFrame14_Gfx': { path: 'graphics/text_window/14.png', ext: '.4bpp', type: 'u8' },
  'sTextWindowFrame15_Gfx': { path: 'graphics/text_window/15.png', ext: '.4bpp', type: 'u8' },
  'sTextWindowFrame16_Gfx': { path: 'graphics/text_window/16.png', ext: '.4bpp', type: 'u8' },
  'sTextWindowFrame17_Gfx': { path: 'graphics/text_window/17.png', ext: '.4bpp', type: 'u8' },
  'sTextWindowFrame18_Gfx': { path: 'graphics/text_window/18.png', ext: '.4bpp', type: 'u8' },
  'sTextWindowFrame19_Gfx': { path: 'graphics/text_window/19.png', ext: '.4bpp', type: 'u8' },
  'sTextWindowFrame20_Gfx': { path: 'graphics/text_window/20.png', ext: '.4bpp', type: 'u8' },
  'gTextWindowFrame1_Pal': { path: 'graphics/text_window/1.png', ext: '.gbapal', type: 'u16' },
  'sTextWindowFrame2_Pal': { path: 'graphics/text_window/2.png', ext: '.gbapal', type: 'u16' },
  'sTextWindowFrame3_Pal': { path: 'graphics/text_window/3.png', ext: '.gbapal', type: 'u16' },
  'sTextWindowFrame4_Pal': { path: 'graphics/text_window/4.png', ext: '.gbapal', type: 'u16' },
  'sTextWindowFrame5_Pal': { path: 'graphics/text_window/5.png', ext: '.gbapal', type: 'u16' },
  'sTextWindowFrame6_Pal': { path: 'graphics/text_window/6.png', ext: '.gbapal', type: 'u16' },
  'sTextWindowFrame7_Pal': { path: 'graphics/text_window/7.png', ext: '.gbapal', type: 'u16' },
  'sTextWindowFrame8_Pal': { path: 'graphics/text_window/8.png', ext: '.gbapal', type: 'u16' },
  'sTextWindowFrame9_Pal': { path: 'graphics/text_window/9.png', ext: '.gbapal', type: 'u16' },
  'sTextWindowFrame10_Pal': { path: 'graphics/text_window/10.png', ext: '.gbapal', type: 'u16' },
  'sTextWindowFrame11_Pal': { path: 'graphics/text_window/11.png', ext: '.gbapal', type: 'u16' },
  'sTextWindowFrame12_Pal': { path: 'graphics/text_window/12.png', ext: '.gbapal', type: 'u16' },
  'sTextWindowFrame13_Pal': { path: 'graphics/text_window/13.png', ext: '.gbapal', type: 'u16' },
  'sTextWindowFrame14_Pal': { path: 'graphics/text_window/14.png', ext: '.gbapal', type: 'u16' },
  'sTextWindowFrame15_Pal': { path: 'graphics/text_window/15.png', ext: '.gbapal', type: 'u16' },
  'sTextWindowFrame16_Pal': { path: 'graphics/text_window/16.png', ext: '.gbapal', type: 'u16' },
  'sTextWindowFrame17_Pal': { path: 'graphics/text_window/17.png', ext: '.gbapal', type: 'u16' },
  'sTextWindowFrame18_Pal': { path: 'graphics/text_window/18.png', ext: '.gbapal', type: 'u16' },
  'sTextWindowFrame19_Pal': { path: 'graphics/text_window/19.png', ext: '.gbapal', type: 'u16' },
  'sTextWindowFrame20_Pal': { path: 'graphics/text_window/20.png', ext: '.gbapal', type: 'u16' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'LoadMessageBoxGfx', ret: "void", arity: 3, params: "u8 windowId, u16 destOffset, u8 palOffset" },
  { name: 'LoadUserWindowBorderGfx_', ret: "void", arity: 3, params: "u8 windowId, u16 destOffset, u8 palOffset" },
  { name: 'LoadWindowGfx', ret: "void", arity: 4, params: "u8 windowId, u8 frameId, u16 destOffset, u8 palOffset" },
  { name: 'LoadUserWindowBorderGfx', ret: "void", arity: 3, params: "u8 windowId, u16 destOffset, u8 palOffset" },
  { name: 'DrawTextBorderOuter', ret: "void", arity: 3, params: "u8 windowId, u16 tileNum, u8 palNum" },
  { name: 'DrawTextBorderInner', ret: "void", arity: 3, params: "u8 windowId, u16 tileNum, u8 palNum" },
  { name: 'rbox_fill_rectangle', ret: "void", arity: 1, params: "u8 windowId" },
  { name: 'LoadUserWindowBorderGfxOnBg', ret: "void", arity: 3, params: "u8 bg, u16 destOffset, u8 palOffset" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'text.h',
  'text_window.h',
  'window.h',
  'palette.h',
  'bg.h',
  'graphics.h',
] as const;
