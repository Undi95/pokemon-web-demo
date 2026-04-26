// AUTO-GENERATED from src/menu.c by extract-decomp-scenes.mjs
// Do not edit manually — re-run `npm run extract:decomp-scenes` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/menu.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const DLG_WINDOW_PALETTE_NUM = 15;
export const DLG_WINDOW_BASE_TILE_NUM = 512;
export const STD_WINDOW_PALETTE_NUM = 14;
/** Raw expr from .c (can't be evaluated): `PLTT_SIZEOF(10)` */
export const STD_WINDOW_PALETTE_SIZE_EXPR = "PLTT_SIZEOF(10)";
export const STD_WINDOW_BASE_TILE_NUM = 532;

// ─── WindowTemplates ─────────────────────────────────────────────────────────
export const sStandardTextBox_WindowTemplates = { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4, paletteNum: 15, baseBlock: 404 } as const;

// ─── GFX/PAL source paths (INCGFX references) ───────────────────────────────
// Use these paths at runtime to load assets from the decomp graphics directory.
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'gStandardMenuPalette': { path: 'graphics/interface/std_menu.pal', ext: '.gbapal', type: 'u16' },
  'sHofPC_TopBar_Pal': { path: 'graphics/interface/hof_pc_topbar.pal', ext: '.gbapal', type: 'u16' },
};

// ─── FillBgTilemapBufferRect calls (frame layout, top-level constants only) ─
export const FILL_BG_CALLS = [
  { bg: "bg", tile: "STD_WINDOW_BASE_TILE_NUM + 0", x: "tilemapLeft - 1", y: "tilemapTop - 1", w: 1, h: 1, palNum: "STD_WINDOW_PALETTE_NUM" },
  { bg: "bg", tile: "STD_WINDOW_BASE_TILE_NUM + 1", x: "tilemapLeft", y: "tilemapTop - 1", w: "width", h: 1, palNum: "STD_WINDOW_PALETTE_NUM" },
  { bg: "bg", tile: "STD_WINDOW_BASE_TILE_NUM + 2", x: "tilemapLeft + width", y: "tilemapTop - 1", w: 1, h: 1, palNum: "STD_WINDOW_PALETTE_NUM" },
  { bg: "bg", tile: "STD_WINDOW_BASE_TILE_NUM + 3", x: "tilemapLeft - 1", y: "i", w: 1, h: 1, palNum: "STD_WINDOW_PALETTE_NUM" },
  { bg: "bg", tile: "STD_WINDOW_BASE_TILE_NUM + 5", x: "tilemapLeft + width", y: "i", w: 1, h: 1, palNum: "STD_WINDOW_PALETTE_NUM" },
  { bg: "bg", tile: "STD_WINDOW_BASE_TILE_NUM + 6", x: "tilemapLeft - 1", y: "tilemapTop + height", w: 1, h: 1, palNum: "STD_WINDOW_PALETTE_NUM" },
  { bg: "bg", tile: "STD_WINDOW_BASE_TILE_NUM + 7", x: "tilemapLeft", y: "tilemapTop + height", w: "width", h: 1, palNum: "STD_WINDOW_PALETTE_NUM" },
  { bg: "bg", tile: "STD_WINDOW_BASE_TILE_NUM + 8", x: "tilemapLeft + width", y: "tilemapTop + height", w: 1, h: 1, palNum: "STD_WINDOW_PALETTE_NUM" },
  { bg: "bg", tile: "DLG_WINDOW_BASE_TILE_NUM + 1", x: "tilemapLeft - 2", y: "tilemapTop - 1", w: 1, h: 1, palNum: "DLG_WINDOW_PALETTE_NUM" },
  { bg: "bg", tile: "DLG_WINDOW_BASE_TILE_NUM + 3", x: "tilemapLeft - 1", y: "tilemapTop - 1", w: 1, h: 1, palNum: "DLG_WINDOW_PALETTE_NUM" },
  { bg: "bg", tile: "DLG_WINDOW_BASE_TILE_NUM + 4", x: "tilemapLeft", y: "tilemapTop - 1", w: "width - 1", h: 1, palNum: "DLG_WINDOW_PALETTE_NUM" },
  { bg: "bg", tile: "DLG_WINDOW_BASE_TILE_NUM + 5", x: "tilemapLeft + width - 1", y: "tilemapTop - 1", w: 1, h: 1, palNum: "DLG_WINDOW_PALETTE_NUM" },
  { bg: "bg", tile: "DLG_WINDOW_BASE_TILE_NUM + 6", x: "tilemapLeft + width", y: "tilemapTop - 1", w: 1, h: 1, palNum: "DLG_WINDOW_PALETTE_NUM" },
  { bg: "bg", tile: "DLG_WINDOW_BASE_TILE_NUM + 7", x: "tilemapLeft - 2", y: "tilemapTop", w: 1, h: 5, palNum: "DLG_WINDOW_PALETTE_NUM" },
  { bg: "bg", tile: "DLG_WINDOW_BASE_TILE_NUM + 9", x: "tilemapLeft - 1", y: "tilemapTop", w: "width + 1", h: 5, palNum: "DLG_WINDOW_PALETTE_NUM" },
  { bg: "bg", tile: "DLG_WINDOW_BASE_TILE_NUM + 10", x: "tilemapLeft + width", y: "tilemapTop", w: 1, h: 5, palNum: "DLG_WINDOW_PALETTE_NUM" },
  { bg: "bg", tile: 0, x: "tilemapLeft - 1", y: "tilemapTop - 1", w: "width + 2", h: "height + 2", palNum: "STD_WINDOW_PALETTE_NUM" },
  { bg: "bg", tile: 0, x: "tilemapLeft - 3", y: "tilemapTop - 1", w: "width + 6", h: "height + 2", palNum: "STD_WINDOW_PALETTE_NUM" },
  { bg: 0, tile: 0, x: 0, y: 0, w: 32, h: 32, palNum: 17 },
  { bg: "bg", tile: "sTileNum + 1", x: "tilemapLeft - 2", y: "tilemapTop - 1", w: 1, h: 1, palNum: "sPaletteNum" },
  { bg: "bg", tile: "sTileNum + 3", x: "tilemapLeft - 1", y: "tilemapTop - 1", w: 1, h: 1, palNum: "sPaletteNum" },
  { bg: "bg", tile: "sTileNum + 4", x: "tilemapLeft", y: "tilemapTop - 1", w: "width - 1", h: 1, palNum: "sPaletteNum" },
  { bg: "bg", tile: "sTileNum + 5", x: "tilemapLeft + width - 1", y: "tilemapTop - 1", w: 1, h: 1, palNum: "sPaletteNum" },
  { bg: "bg", tile: "sTileNum + 6", x: "tilemapLeft + width", y: "tilemapTop - 1", w: 1, h: 1, palNum: "sPaletteNum" },
  { bg: "bg", tile: "sTileNum + 7", x: "tilemapLeft - 2", y: "tilemapTop", w: 1, h: 5, palNum: "sPaletteNum" },
  { bg: "bg", tile: "sTileNum + 9", x: "tilemapLeft - 1", y: "tilemapTop", w: "width + 1", h: 5, palNum: "sPaletteNum" },
  { bg: "bg", tile: "sTileNum + 10", x: "tilemapLeft + width", y: "tilemapTop", w: 1, h: 5, palNum: "sPaletteNum" },
  { bg: "bg", tile: 0, x: "tilemapLeft - 3", y: "tilemapTop - 1", w: "width + 6", h: "height + 2", palNum: 0 },
  { bg: "bg", tile: "sTileNum + 0", x: "tilemapLeft - 1", y: "tilemapTop - 1", w: 1, h: 1, palNum: "sPaletteNum" },
  { bg: "bg", tile: "sTileNum + 1", x: "tilemapLeft", y: "tilemapTop - 1", w: "width", h: 1, palNum: "sPaletteNum" },
  { bg: "bg", tile: "sTileNum + 2", x: "tilemapLeft + width", y: "tilemapTop - 1", w: 1, h: 1, palNum: "sPaletteNum" },
  { bg: "bg", tile: "sTileNum + 3", x: "tilemapLeft - 1", y: "tilemapTop", w: 1, h: "height", palNum: "sPaletteNum" },
  { bg: "bg", tile: "sTileNum + 5", x: "tilemapLeft + width", y: "tilemapTop", w: 1, h: "height", palNum: "sPaletteNum" },
  { bg: "bg", tile: "sTileNum + 6", x: "tilemapLeft - 1", y: "tilemapTop + height", w: 1, h: 1, palNum: "sPaletteNum" },
  { bg: "bg", tile: "sTileNum + 7", x: "tilemapLeft", y: "tilemapTop + height", w: "width", h: 1, palNum: "sPaletteNum" },
  { bg: "bg", tile: "sTileNum + 8", x: "tilemapLeft + width", y: "tilemapTop + height", w: 1, h: 1, palNum: "sPaletteNum" },
  { bg: "bg", tile: 0, x: "tilemapLeft - 1", y: "tilemapTop - 1", w: "width + 2", h: "height + 2", palNum: 0 },
] as const;
