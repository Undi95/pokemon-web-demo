// AUTO-GENERATED from include/sprite.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/sprite.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const OAM_MATRIX_COUNT = 32;
export const MAX_SPRITES = 64;
export const SPRITE_NONE = 255;
export const TAG_NONE = 65535;
export const NO_ANCHOR = 2048;
// ST_OAM_AFFINE (sprite.h enum) — affineMode OAM. Ajouté ici (feuille) car l'extracteur
// ne prend que les #define ; sourcer ces consts ici évite le TDZ via decomp-helpers (cyclique).
export const ST_OAM_AFFINE_OFF = 0;
export const ST_OAM_AFFINE_NORMAL = 1;
export const ST_OAM_AFFINE_ERASE = 2;
export const ST_OAM_AFFINE_DOUBLE = 3;
/** Raw expr: `\` */
export const ANIMCMD_END_EXPR = "\\";
export const AFFINEANIMCMDTYPE_LOOP = 32765;
export const AFFINEANIMCMDTYPE_JUMP = 32766;
export const AFFINEANIMCMDTYPE_END = 32767;
/** Raw expr: `\` */
export const AFFINEANIMCMD_END_EXPR = "\\";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_SUBSPRITES_0 = {
  SUBSPRITES_OFF: 0,
  SUBSPRITES_ON: 1,
  SUBSPRITES_IGNORE_PRIORITY: 2,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'obj_frame_tiles', ret: "define", arity: 1, params: "ptr" },
  { name: 'overworld_frame', ret: "define", arity: 4, params: "ptr, width, height, frame" },
  { name: 'ResetSpriteData', ret: "void", arity: 0, params: "void" },
  { name: 'AnimateSprites', ret: "void", arity: 0, params: "void" },
  { name: 'BuildOamBuffer', ret: "void", arity: 0, params: "void" },
  { name: 'CreateSprite', ret: "u8", arity: 4, params: "const struct SpriteTemplate *template, s16 x, s16 y, u8 subpriority" },
  { name: 'CreateSpriteAtEnd', ret: "u8", arity: 4, params: "const struct SpriteTemplate *template, s16 x, s16 y, u8 subpriority" },
  { name: 'CreateSpriteAndAnimate', ret: "u8", arity: 4, params: "const struct SpriteTemplate *template, s16 x, s16 y, u8 subpriority" },
  { name: 'DestroySprite', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'ResetOamRange', ret: "void", arity: 2, params: "u8 start, u8 end" },
  { name: 'LoadOam', ret: "void", arity: 0, params: "void" },
  { name: 'SetOamMatrix', ret: "void", arity: 5, params: "u8 matrixNum, u16 a, u16 b, u16 c, u16 d" },
  { name: 'CalcCenterToCornerVec', ret: "void", arity: 4, params: "struct Sprite *sprite, u8 shape, u8 size, u8 affineMode" },
  { name: 'SpriteCallbackDummy', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'ProcessSpriteCopyRequests', ret: "void", arity: 0, params: "void" },
  { name: 'RequestSpriteCopy', ret: "void", arity: 3, params: "const u8 *src, u8 *dest, u16 size" },
  { name: 'FreeSpriteTiles', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'FreeSpritePalette', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'FreeSpriteOamMatrix', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'DestroySpriteAndFreeResources', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimateSprite', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SetSpriteMatrixAnchor', ret: "void", arity: 3, params: "struct Sprite *sprite, s16 x, s16 y" },
  { name: 'StartSpriteAnim', ret: "void", arity: 2, params: "struct Sprite *sprite, u8 animNum" },
  { name: 'StartSpriteAnimIfDifferent', ret: "void", arity: 2, params: "struct Sprite *sprite, u8 animNum" },
  { name: 'SeekSpriteAnim', ret: "void", arity: 2, params: "struct Sprite *sprite, u8 animCmdIndex" },
  { name: 'StartSpriteAffineAnim', ret: "void", arity: 2, params: "struct Sprite *sprite, u8 animNum" },
  { name: 'StartSpriteAffineAnimIfDifferent', ret: "void", arity: 2, params: "struct Sprite *sprite, u8 animNum" },
  { name: 'ChangeSpriteAffineAnim', ret: "void", arity: 2, params: "struct Sprite *sprite, u8 animNum" },
  { name: 'ChangeSpriteAffineAnimIfDifferent', ret: "void", arity: 2, params: "struct Sprite *sprite, u8 animNum" },
  { name: 'SetSpriteSheetFrameTileNum', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AllocOamMatrix', ret: "u8", arity: 0, params: "void" },
  { name: 'FreeOamMatrix', ret: "void", arity: 1, params: "u8 matrixNum" },
  { name: 'InitSpriteAffineAnim', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SetOamMatrixRotationScaling', ret: "void", arity: 4, params: "u8 matrixNum, s16 xScale, s16 yScale, u16 rotation" },
  { name: 'LoadSpriteSheet', ret: "u16", arity: 1, params: "const struct SpriteSheet *sheet" },
  { name: 'LoadSpriteSheets', ret: "void", arity: 1, params: "const struct SpriteSheet *sheets" },
  { name: 'AllocTilesForSpriteSheet', ret: "u16", arity: 1, params: "struct SpriteSheet *sheet" },
  { name: 'AllocTilesForSpriteSheets', ret: "void", arity: 1, params: "struct SpriteSheet *sheets" },
  { name: 'LoadTilesForSpriteSheet', ret: "void", arity: 1, params: "const struct SpriteSheet *sheet" },
  { name: 'LoadTilesForSpriteSheets', ret: "void", arity: 1, params: "struct SpriteSheet *sheets" },
  { name: 'FreeSpriteTilesByTag', ret: "void", arity: 1, params: "u16 tag" },
  { name: 'FreeSpriteTileRanges', ret: "void", arity: 0, params: "void" },
  { name: 'GetSpriteTileStartByTag', ret: "u16", arity: 1, params: "u16 tag" },
  { name: 'GetSpriteTileTagByTileStart', ret: "u16", arity: 1, params: "u16 start" },
  { name: 'RequestSpriteSheetCopy', ret: "void", arity: 1, params: "const struct SpriteSheet *sheet" },
  { name: 'LoadSpriteSheetDeferred', ret: "u16", arity: 1, params: "const struct SpriteSheet *sheet" },
  { name: 'FreeAllSpritePalettes', ret: "void", arity: 0, params: "void" },
  { name: 'LoadSpritePalette', ret: "u8", arity: 1, params: "const struct SpritePalette *palette" },
  { name: 'LoadSpritePalettes', ret: "void", arity: 1, params: "const struct SpritePalette *palettes" },
  { name: 'AllocSpritePalette', ret: "u8", arity: 1, params: "u16 tag" },
  { name: 'IndexOfSpritePaletteTag', ret: "u8", arity: 1, params: "u16 tag" },
  { name: 'GetSpritePaletteTagByPaletteNum', ret: "u16", arity: 1, params: "u8 paletteNum" },
  { name: 'FreeSpritePaletteByTag', ret: "void", arity: 1, params: "u16 tag" },
  { name: 'SetSubspriteTables', ret: "void", arity: 2, params: "struct Sprite *sprite, const struct SubspriteTable *subspriteTables" },
  { name: 'AddSpriteToOamBuffer', ret: "bool8", arity: 2, params: "struct Sprite *sprite, u8 *oamIndex" },
  { name: 'AddSubspritesToOamBuffer', ret: "bool8", arity: 3, params: "struct Sprite *sprite, struct OamData *destOam, u8 *oamIndex" },
  { name: 'CopyToSprites', ret: "void", arity: 1, params: "u8 *src" },
  { name: 'CopyFromSprites', ret: "void", arity: 1, params: "u8 *dest" },
  { name: 'SpriteTileAllocBitmapOp', ret: "u8", arity: 2, params: "u16 bit, u8 op" },
  { name: 'ClearSpriteCopyRequests', ret: "void", arity: 0, params: "void" },
  { name: 'ResetAffineAnimData', ret: "void", arity: 0, params: "void" },
] as const;
