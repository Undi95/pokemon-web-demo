// AUTO-GENERATED from src/bg.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/bg.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `(DISPCNT_BG_ALL_ON | 0x7)` */
export const DISPCNT_ALL_BG_AND_MODE_BITS_EXPR = "(DISPCNT_BG_ALL_ON | 0x7)";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_BG_0 = {
  BG_CTRL_ATTR_VISIBLE: 1,
  BG_CTRL_ATTR_CHARBASEINDEX: 2,
  BG_CTRL_ATTR_MAPBASEINDEX: 3,
  BG_CTRL_ATTR_SCREENSIZE: 4,
  BG_CTRL_ATTR_PALETTEMODE: 5,
  BG_CTRL_ATTR_PRIORITY: 6,
  BG_CTRL_ATTR_MOSAIC: 7,
  BG_CTRL_ATTR_WRAPAROUND: 8,
} as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'COMMON_DATA', type: "u32", name: 'gWindowTileAutoAllocEnabled', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetBgType', ret: "u32", arity: 1, params: "u8 bg" },
  { name: 'ResetBgs', ret: "void", arity: 0, params: "void" },
  { name: 'SetBgModeInternal', ret: "void", arity: 1, params: "u8 bgMode" },
  { name: 'GetBgMode', ret: "u8", arity: 0, params: "void" },
  { name: 'ResetBgControlStructs', ret: "void", arity: 0, params: "void" },
  { name: 'Unused_ResetBgControlStruct', ret: "void", arity: 1, params: "u8 bg" },
  { name: 'SetBgControlAttributes', ret: "void", arity: 8, params: "u8 bg, u8 charBaseIndex, u8 mapBaseIndex, u8 screenSize, u8 paletteMode, u8 priority, u8 mosaic, u8 wraparound" },
  { name: 'GetBgControlAttribute', ret: "u16", arity: 2, params: "u8 bg, u8 attributeId" },
  { name: 'LoadBgVram', ret: "u8", arity: 5, params: "u8 bg, const void *src, u16 size, u16 destOffset, u8 mode" },
  { name: 'ShowBgInternal', ret: "void", arity: 1, params: "u8 bg" },
  { name: 'HideBgInternal', ret: "void", arity: 1, params: "u8 bg" },
  { name: 'SyncBgVisibilityAndMode', ret: "void", arity: 0, params: "void" },
  { name: 'SetTextModeAndHideBgs', ret: "void", arity: 0, params: "void" },
  { name: 'SetBgAffineInternal', ret: "void", arity: 8, params: "u8 bg, s32 srcCenterX, s32 srcCenterY, s16 dispCenterX, s16 dispCenterY, s16 scaleX, s16 scaleY, u16 rotationAngle" },
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

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'limits.h',
  'global.h',
  'bg.h',
  'dma3.h',
  'gpu_regs.h',
] as const;
