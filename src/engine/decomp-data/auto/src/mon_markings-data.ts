// AUTO-GENERATED from src/mon_markings.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/mon_markings.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `(NUM_MON_MARKINGS * 2)` */
export const ANIM_CURSOR_EXPR = "(NUM_MON_MARKINGS * 2)";
/** Raw expr: `(ANIM_CURSOR + 1)` */
export const ANIM_TEXT_EXPR = "(ANIM_CURSOR + 1)";
/** Raw expr: `NUM_MON_MARKINGS` */
export const SELECTION_OK_EXPR = "NUM_MON_MARKINGS";
/** Raw expr: `(SELECTION_OK + 1)` */
export const SELECTION_CANCEL_EXPR = "(SELECTION_OK + 1)";
/** Raw expr: `data[0]` */
export const sMarkingId_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const sCursorYOffset_EXPR = "data[0]";

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_MenuWindow = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_8x8 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(8x8)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_MarkingCombo = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x8)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const template = { tileTag: "baseTileTag", paletteTag: "basePaletteTag", oam: "&sOamData_MenuWindow", anims: "sAnims_MenuWindow", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Dummy" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sMonMarkings_Pal': { path: 'graphics/interface/mon_markings.png', ext: '.gbapal', type: 'u16' },
  'sMonMarkings_Gfx': { path: 'graphics/interface/mon_markings.png', ext: '.4bpp', type: 'u8' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CreateMonMarkingsMenuSprites', ret: "void", arity: 4, params: "s16, s16, u16, u16" },
  { name: 'SpriteCB_Dummy', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Marking', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Cursor', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'InitMonMarkingsMenu', ret: "void", arity: 1, params: "struct MonMarkingsMenu *ptr" },
  { name: 'BufferMenuWindowTiles', ret: "void", arity: 0, params: "void" },
  { name: 'BufferMenuFrameTiles', ret: "bool8", arity: 0, params: "void" },
  { name: 'BufferMonMarkingsMenuTiles', ret: "void", arity: 0, params: "void" },
  { name: 'OpenMonMarkingsMenu', ret: "void", arity: 3, params: "u8 markings, s16 x, s16 y" },
  { name: 'FreeMonMarkingsMenu', ret: "void", arity: 0, params: "void" },
  { name: 'HandleMonMarkingsMenuInput', ret: "bool8", arity: 0, params: "void" },
  { name: 'StartSpriteAnim', ret: "else", arity: 2, params: "sprite, 2 * sprite->sMarkingId" },
  { name: 'UpdateMonMarkingTiles', ret: "void", arity: 2, params: "u8 markings, void *dest" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'dma3.h',
  'graphics.h',
  'main.h',
  'window.h',
  'list_menu.h',
  'mon_markings.h',
  'constants/songs.h',
  'sound.h',
  'sprite.h',
  'text_window.h',
] as const;
