// AUTO-GENERATED from include/bg.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/bg.h
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_BG_0 = {
  BG_ATTR_CHARBASEINDEX: 1,
  BG_ATTR_MAPBASEINDEX: 2,
  BG_ATTR_SCREENSIZE: 3,
  BG_ATTR_PALETTEMODE: 4,
  BG_ATTR_MOSAIC: 5,
  BG_ATTR_WRAPAROUND: 6,
  BG_ATTR_PRIORITY: 7,
  BG_ATTR_METRIC: 8,
  BG_ATTR_TYPE: 9,
  BG_ATTR_BASETILE: 10,
} as const;
export const ENUM_BG_1 = {
  BG_TYPE_NORMAL: 0,
  BG_TYPE_AFFINE: 1,
  BG_TYPE_NONE: 65535,
} as const;
export const ENUM_BG_2 = {
  BG_COORD_SET: 0,
  BG_COORD_ADD: 1,
  BG_COORD_SUB: 2,
} as const;
export const ENUM_BG_3 = {
  BG_MOSAIC_SET_HV: 0,
  BG_MOSAIC_SET_H: 1,
  BG_MOSAIC_ADD_H: 2,
  BG_MOSAIC_SUB_H: 3,
  BG_MOSAIC_SET_V: 4,
  BG_MOSAIC_ADD_V: 5,
  BG_MOSAIC_SUB_V: 6,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ResetBgs', ret: "void", arity: 0, params: "void" },
  { name: 'GetBgMode', ret: "u8", arity: 0, params: "void" },
  { name: 'ResetBgControlStructs', ret: "void", arity: 0, params: "void" },
  { name: 'Unused_ResetBgControlStruct', ret: "void", arity: 1, params: "u8 bg" },
  { name: 'LoadBgVram', ret: "u8", arity: 5, params: "u8 bg, const void *src, u16 size, u16 destOffset, u8 mode" },
  { name: 'SetTextModeAndHideBgs', ret: "void", arity: 0, params: "void" },
  { name: 'IsInvalidBg', ret: "bool8", arity: 1, params: "u8 bg" },
  { name: 'BgTileAllocOp', ret: "int", arity: 4, params: "int bg, int offset, int count, int mode" },
  { name: 'ResetBgsAndClearDma3BusyFlags', ret: "void", arity: 1, params: "u32 leftoverFireRedLeafGreenVariable" },
  { name: 'InitBgsFromTemplates', ret: "void", arity: 3, params: "u8 bgMode, const struct BgTemplate *templates, u8 numTemplates" },
  { name: 'InitBgFromTemplate', ret: "void", arity: 1, params: "const struct BgTemplate *template" },
  { name: 'SetBgMode', ret: "void", arity: 1, params: "u8 bgMode" },
  { name: 'LoadBgTiles', ret: "u16", arity: 4, params: "u8 bg, const void *src, u16 size, u16 destOffset" },
  { name: 'LoadBgTilemap', ret: "u16", arity: 4, params: "u8 bg, const void *src, u16 size, u16 destOffset" },
  { name: 'Unused_LoadBgPalette', ret: "u16", arity: 4, params: "u8 bg, const void *src, u16 size, u16 destOffset" },
  { name: 'IsDma3ManagerBusyWithBgCopy', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShowBg', ret: "void", arity: 1, params: "u8 bg" },
  { name: 'HideBg', ret: "void", arity: 1, params: "u8 bg" },
  { name: 'SetBgAttribute', ret: "void", arity: 3, params: "u8 bg, u8 attributeId, u8 value" },
  { name: 'GetBgAttribute', ret: "u16", arity: 2, params: "u8 bg, u8 attributeId" },
  { name: 'ChangeBgX', ret: "s32", arity: 3, params: "u8 bg, s32 value, u8 op" },
  { name: 'GetBgX', ret: "s32", arity: 1, params: "u8 bg" },
  { name: 'ChangeBgY', ret: "s32", arity: 3, params: "u8 bg, s32 value, u8 op" },
  { name: 'ChangeBgY_ScreenOff', ret: "s32", arity: 3, params: "u8 bg, s32 value, u8 op" },
  { name: 'GetBgY', ret: "s32", arity: 1, params: "u8 bg" },
  { name: 'SetBgAffine', ret: "void", arity: 8, params: "u8 bg, s32 srcCenterX, s32 srcCenterY, s16 dispCenterX, s16 dispCenterY, s16 scaleX, s16 scaleY, u16 rotationAngle" },
  { name: 'Unused_AdjustBgMosaic', ret: "u8", arity: 2, params: "u8 val, u8 mode" },
  { name: 'SetBgTilemapBuffer', ret: "void", arity: 2, params: "u8 bg, void *tilemap" },
  { name: 'UnsetBgTilemapBuffer', ret: "void", arity: 1, params: "u8 bg" },
  { name: 'CopyToBgTilemapBuffer', ret: "void", arity: 4, params: "u8 bg, const void *src, u16 mode, u16 destOffset" },
  { name: 'CopyBgTilemapBufferToVram', ret: "void", arity: 1, params: "u8 bg" },
  { name: 'CopyToBgTilemapBufferRect', ret: "void", arity: 6, params: "u8 bg, const void *src, u8 destX, u8 destY, u8 width, u8 height" },
  { name: 'CopyToBgTilemapBufferRect_ChangePalette', ret: "void", arity: 7, params: "u8 bg, const void *src, u8 destX, u8 destY, u8 rectWidth, u8 rectHeight, u8 palette" },
  { name: 'CopyRectToBgTilemapBufferRect', ret: "void", arity: 13, params: "u8 bg, const void *src, u8 srcX, u8 srcY, u8 srcWidth, u8 srcHeight, u8 destX, u8 destY, u8 rectWidth, u8 rectHeight, u8 palette1, s16 tileOffset, s16 palette2" },
  { name: 'FillBgTilemapBufferRect_Palette0', ret: "void", arity: 6, params: "u8 bg, u16 tileNum, u8 x, u8 y, u8 width, u8 height" },
  { name: 'FillBgTilemapBufferRect', ret: "void", arity: 7, params: "u8 bg, u16 tileNum, u8 x, u8 y, u8 width, u8 height, u8 palette" },
  { name: 'WriteSequenceToBgTilemapBuffer', ret: "void", arity: 8, params: "u8 bg, u16 firstTileNum, u8 x, u8 y, u8 width, u8 height, u8 paletteSlot, s16 tileNumDelta" },
  { name: 'GetBgMetricTextMode', ret: "u16", arity: 2, params: "u8 bg, u8 whichMetric" },
  { name: 'GetBgMetricAffineMode', ret: "u32", arity: 2, params: "u8 bg, u8 whichMetric" },
  { name: 'GetTileMapIndexFromCoords', ret: "u32", arity: 5, params: "s32 x, s32 y, s32 screenSize, u32 screenWidth, u32 screenHeight" },
  { name: 'CopyTileMapEntry', ret: "void", arity: 5, params: "const u16 *src, u16 *dest, s32 palette1, s32 tileOffset, s32 palette2" },
  { name: 'IsInvalidBg32', ret: "bool32", arity: 1, params: "u8 bg" },
  { name: 'IsTileMapOutsideWram', ret: "bool32", arity: 1, params: "u8 bg" },
] as const;
