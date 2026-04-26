// AUTO-GENERATED from src/text_window.c by extract-decomp-scenes.mjs
// Do not edit manually — re-run `npm run extract:decomp-scenes` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/text_window.c
// Generated: 2026-04-26

// ─── GFX/PAL source paths (INCGFX references) ───────────────────────────────
// Use these paths at runtime to load assets from the decomp graphics directory.
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

// ─── FillBgTilemapBufferRect calls (frame layout, top-level constants only) ─
export const FILL_BG_CALLS = [
  { bg: "bgLayer", tile: "tileNum + 0", x: "tilemapLeft - 1", y: "tilemapTop - 1", w: 1, h: 1, palNum: "palNum" },
  { bg: "bgLayer", tile: "tileNum + 1", x: "tilemapLeft", y: "tilemapTop - 1", w: "width", h: 1, palNum: "palNum" },
  { bg: "bgLayer", tile: "tileNum + 2", x: "tilemapLeft + width", y: "tilemapTop - 1", w: 1, h: 1, palNum: "palNum" },
  { bg: "bgLayer", tile: "tileNum + 3", x: "tilemapLeft - 1", y: "tilemapTop", w: 1, h: "height", palNum: "palNum" },
  { bg: "bgLayer", tile: "tileNum + 5", x: "tilemapLeft + width", y: "tilemapTop", w: 1, h: "height", palNum: "palNum" },
  { bg: "bgLayer", tile: "tileNum + 6", x: "tilemapLeft - 1", y: "tilemapTop + height", w: 1, h: 1, palNum: "palNum" },
  { bg: "bgLayer", tile: "tileNum + 7", x: "tilemapLeft", y: "tilemapTop + height", w: "width", h: 1, palNum: "palNum" },
  { bg: "bgLayer", tile: "tileNum + 8", x: "tilemapLeft + width", y: "tilemapTop + height", w: 1, h: 1, palNum: "palNum" },
  { bg: "bgLayer", tile: "tileNum + 0", x: "tilemapLeft", y: "tilemapTop", w: 1, h: 1, palNum: "palNum" },
  { bg: "bgLayer", tile: "tileNum + 1", x: "tilemapLeft + 1", y: "tilemapTop", w: "width - 2", h: 1, palNum: "palNum" },
  { bg: "bgLayer", tile: "tileNum + 2", x: "tilemapLeft + width - 1", y: "tilemapTop", w: 1, h: 1, palNum: "palNum" },
  { bg: "bgLayer", tile: "tileNum + 3", x: "tilemapLeft", y: "tilemapTop + 1", w: 1, h: "height - 2", palNum: "palNum" },
  { bg: "bgLayer", tile: "tileNum + 5", x: "tilemapLeft + width - 1", y: "tilemapTop + 1", w: 1, h: "height - 2", palNum: "palNum" },
  { bg: "bgLayer", tile: "tileNum + 6", x: "tilemapLeft", y: "tilemapTop + height - 1", w: 1, h: 1, palNum: "palNum" },
  { bg: "bgLayer", tile: "tileNum + 7", x: "tilemapLeft + 1", y: "tilemapTop + height - 1", w: "width -     2", h: 1, palNum: "palNum" },
  { bg: "bgLayer", tile: "tileNum + 8", x: "tilemapLeft + width - 1", y: "tilemapTop + height - 1", w: 1, h: 1, palNum: "palNum" },
  { bg: "bgLayer", tile: 0, x: "tilemapLeft - 1", y: "tilemapTop - 1", w: "width + 2", h: "height + 2", palNum: 17 },
] as const;
