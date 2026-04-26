// AUTO-GENERATED from src/sprite.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/sprite.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MAX_SPRITE_COPY_REQUESTS = 64;
/** Raw expr: `data[6]` */
export const sAnchorX_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const sAnchorY_EXPR = "data[7]";
/** Raw expr: `\` */
export const DUMMY_OAM_DATA_EXPR = "\\";
export const ANIM_END = 65535;
export const AFFINE_ANIM_END = 32767;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const gDummySpriteTemplate = { tileTag: 0, paletteTag: "TAG_NONE", oam: "&gDummyOamData", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'COMMON_DATA', type: "u32", name: 'gOamMatrixAllocBitmap', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u8", name: 'gReservedSpritePaletteCount', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "struct Sprite", name: 'gSprites', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sSpritePriorities', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sSpriteOrder', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "bool8", name: 'sShouldProcessSpriteCopyRequests', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sSpriteCopyRequestCount', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "struct SpriteCopyRequest", name: 'sSpriteCopyRequests', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gOamLimit', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gReservedSpriteTileCount', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sSpriteTileAllocBitmap', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "s16", name: 'gSpriteCoordOffsetX', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "s16", name: 'gSpriteCoordOffsetY', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "struct OamMatrix", name: 'gOamMatrices', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "bool8", name: 'gAffineAnimsDisabled', isArray: false, init: "FALSE" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'UpdateOamCoords', ret: "void", arity: 0, params: "void" },
  { name: 'BuildSpritePriorities', ret: "void", arity: 0, params: "void" },
  { name: 'SortSprites', ret: "void", arity: 0, params: "void" },
  { name: 'CopyMatricesToOamBuffer', ret: "void", arity: 0, params: "void" },
  { name: 'AddSpritesToOamBuffer', ret: "void", arity: 0, params: "void" },
  { name: 'CreateSpriteAt', ret: "u8", arity: 5, params: "u8 index, const struct SpriteTemplate *template, s16 x, s16 y, u8 subpriority" },
  { name: 'ResetOamMatrices', ret: "void", arity: 0, params: "void" },
  { name: 'ResetSprite', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AllocSpriteTiles', ret: "s16", arity: 1, params: "u16 tileCount" },
  { name: 'RequestSpriteFrameImageCopy', ret: "void", arity: 3, params: "u16 index, u16 tileNum, const struct SpriteFrameImage *images" },
  { name: 'ResetAllSprites', ret: "void", arity: 0, params: "void" },
  { name: 'BeginAnim', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'ContinueAnim', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimCmd_frame', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimCmd_end', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimCmd_jump', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimCmd_loop', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'BeginAnimLoop', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'ContinueAnimLoop', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'JumpToTopOfAnimLoop', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'BeginAffineAnim', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'ContinueAffineAnim', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AffineAnimDelay', ret: "void", arity: 2, params: "u8 matrixNum, struct Sprite *sprite" },
  { name: 'AffineAnimCmd_loop', ret: "void", arity: 2, params: "u8 matrixNum, struct Sprite *sprite" },
  { name: 'BeginAffineAnimLoop', ret: "void", arity: 2, params: "u8 matrixNum, struct Sprite *sprite" },
  { name: 'ContinueAffineAnimLoop', ret: "void", arity: 2, params: "u8 matrixNum, struct Sprite *sprite" },
  { name: 'JumpToTopOfAffineAnimLoop', ret: "void", arity: 2, params: "u8 matrixNum, struct Sprite *sprite" },
  { name: 'AffineAnimCmd_jump', ret: "void", arity: 2, params: "u8 matrixNum, struct Sprite *sprite" },
  { name: 'AffineAnimCmd_end', ret: "void", arity: 2, params: "u8 matrixNum, struct Sprite *sprite" },
  { name: 'AffineAnimCmd_frame', ret: "void", arity: 2, params: "u8 matrixNum, struct Sprite *sprite" },
  { name: 'CopyOamMatrix', ret: "void", arity: 2, params: "u8 destMatrixIndex, struct OamMatrix *srcMatrix" },
  { name: 'GetSpriteMatrixNum', ret: "u8", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SetSpriteOamFlipBits', ret: "void", arity: 3, params: "struct Sprite *sprite, u8 hFlip, u8 vFlip" },
  { name: 'AffineAnimStateRestartAnim', ret: "void", arity: 1, params: "u8 matrixNum" },
  { name: 'AffineAnimStateStartAnim', ret: "void", arity: 2, params: "u8 matrixNum, u8 animNum" },
  { name: 'AffineAnimStateReset', ret: "void", arity: 1, params: "u8 matrixNum" },
  { name: 'ApplyAffineAnimFrameAbsolute', ret: "void", arity: 2, params: "u8 matrixNum, struct AffineAnimFrameCmd *frameCmd" },
  { name: 'DecrementAnimDelayCounter', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'DecrementAffineAnimDelayCounter', ret: "bool8", arity: 2, params: "struct Sprite *sprite, u8 matrixNum" },
  { name: 'ApplyAffineAnimFrameRelativeAndUpdateMatrix', ret: "void", arity: 2, params: "u8 matrixNum, struct AffineAnimFrameCmd *frameCmd" },
  { name: 'ConvertScaleParam', ret: "s16", arity: 1, params: "s16 scale" },
  { name: 'GetAffineAnimFrame', ret: "void", arity: 3, params: "u8 matrixNum, struct Sprite *sprite, struct AffineAnimFrameCmd *frameCmd" },
  { name: 'ApplyAffineAnimFrame', ret: "void", arity: 2, params: "u8 matrixNum, struct AffineAnimFrameCmd *frameCmd" },
  { name: 'IndexOfSpriteTileTag', ret: "u8", arity: 1, params: "u16 tag" },
  { name: 'AllocSpriteTileRange', ret: "void", arity: 3, params: "u16 tag, u16 start, u16 count" },
  { name: 'DoLoadSpritePalette', ret: "void", arity: 2, params: "const u16 *src, u16 paletteOffset" },
  { name: 'UpdateSpriteMatrixAnchorPos', ret: "void", arity: 3, params: "struct Sprite *, s32, s32" },
  { name: 'ResetSpriteData', ret: "void", arity: 0, params: "void" },
  { name: 'AnimateSprites', ret: "void", arity: 0, params: "void" },
  { name: 'BuildOamBuffer', ret: "void", arity: 0, params: "void" },
  { name: 'CreateSprite', ret: "u8", arity: 4, params: "const struct SpriteTemplate *template, s16 x, s16 y, u8 subpriority" },
  { name: 'CreateSpriteAtEnd', ret: "u8", arity: 4, params: "const struct SpriteTemplate *template, s16 x, s16 y, u8 subpriority" },
  { name: 'CreateSpriteAndAnimate', ret: "u8", arity: 4, params: "const struct SpriteTemplate *template, s16 x, s16 y, u8 subpriority" },
  { name: 'DestroySprite', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'ResetOamRange', ret: "void", arity: 2, params: "u8 start, u8 end" },
  { name: 'LoadOam', ret: "void", arity: 0, params: "void" },
  { name: 'ClearSpriteCopyRequests', ret: "void", arity: 0, params: "void" },
  { name: 'SetOamMatrix', ret: "void", arity: 5, params: "u8 matrixNum, u16 a, u16 b, u16 c, u16 d" },
  { name: 'CalcCenterToCornerVec', ret: "void", arity: 4, params: "struct Sprite *sprite, u8 shape, u8 size, u8 affineMode" },
  { name: 'SpriteTileAllocBitmapOp', ret: "u8", arity: 2, params: "u16 bit, u8 op" },
  { name: 'SpriteCallbackDummy', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'ProcessSpriteCopyRequests', ret: "void", arity: 0, params: "void" },
  { name: 'RequestSpriteCopy', ret: "void", arity: 3, params: "const u8 *src, u8 *dest, u16 size" },
  { name: 'CopyFromSprites', ret: "void", arity: 1, params: "u8 *dest" },
  { name: 'CopyToSprites', ret: "void", arity: 1, params: "u8 *src" },
  { name: 'FreeSpriteTiles', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'FreeSpritePalette', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'FreeSpriteOamMatrix', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'DestroySpriteAndFreeResources', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimateSprite', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SetSpriteMatrixAnchor', ret: "void", arity: 3, params: "struct Sprite *sprite, s16 x, s16 y" },
  { name: 'GetAnchorCoord', ret: "s32", arity: 3, params: "s32 a0, s32 a1, s32 coord" },
  { name: 'StartSpriteAnim', ret: "void", arity: 2, params: "struct Sprite *sprite, u8 animNum" },
  { name: 'StartSpriteAnimIfDifferent', ret: "void", arity: 2, params: "struct Sprite *sprite, u8 animNum" },
  { name: 'SeekSpriteAnim', ret: "void", arity: 2, params: "struct Sprite *sprite, u8 animCmdIndex" },
  { name: 'StartSpriteAffineAnim', ret: "void", arity: 2, params: "struct Sprite *sprite, u8 animNum" },
  { name: 'StartSpriteAffineAnimIfDifferent', ret: "void", arity: 2, params: "struct Sprite *sprite, u8 animNum" },
  { name: 'ChangeSpriteAffineAnim', ret: "void", arity: 2, params: "struct Sprite *sprite, u8 animNum" },
  { name: 'ChangeSpriteAffineAnimIfDifferent', ret: "void", arity: 2, params: "struct Sprite *sprite, u8 animNum" },
  { name: 'SetSpriteSheetFrameTileNum', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'ResetAffineAnimData', ret: "void", arity: 0, params: "void" },
  { name: 'AllocOamMatrix', ret: "u8", arity: 0, params: "void" },
  { name: 'FreeOamMatrix', ret: "void", arity: 1, params: "u8 matrixNum" },
  { name: 'InitSpriteAffineAnim', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SetOamMatrixRotationScaling', ret: "void", arity: 4, params: "u8 matrixNum, s16 xScale, s16 yScale, u16 rotation" },
  { name: 'LoadSpriteSheet', ret: "u16", arity: 1, params: "const struct SpriteSheet *sheet" },
  { name: 'LoadSpriteSheets', ret: "void", arity: 1, params: "const struct SpriteSheet *sheets" },
  { name: 'FreeSpriteTilesByTag', ret: "void", arity: 1, params: "u16 tag" },
  { name: 'FreeSpriteTileRanges', ret: "void", arity: 0, params: "void" },
  { name: 'GetSpriteTileStartByTag', ret: "u16", arity: 1, params: "u16 tag" },
  { name: 'GetSpriteTileTagByTileStart', ret: "u16", arity: 1, params: "u16 start" },
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
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'sprite.h',
  'main.h',
  'palette.h',
] as const;
