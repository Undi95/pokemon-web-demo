// AUTO-GENERATED from src/contest_painting.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/contest_painting.c
// Generated: 2026-04-26

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplate = { bg: 1, tilemapLeft: 2, tilemapTop: 14, width: 26, height: 4, paletteNum: 15, baseBlock: 1 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = { bg: 1, charBaseIndex: 1, mapBaseIndex: 10, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 } as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sContestPaintingMonOamData = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 1, bpp: "ST_OAM_8BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 0, paletteNum: 0 } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sPictureFramePalettes': { path: 'graphics/picture_frame/bg.pal', ext: '.gbapal', type: 'u16' },
  'sPictureFrameTiles_Cool': { path: 'graphics/picture_frame/cool.png', ext: '.4bpp.rl', type: 'u32' },
  'sPictureFrameTiles_Beauty': { path: 'graphics/picture_frame/beauty.png', ext: '.4bpp.rl', type: 'u32' },
  'sPictureFrameTiles_Cute': { path: 'graphics/picture_frame/cute.png', ext: '.4bpp.rl', type: 'u32' },
  'sPictureFrameTiles_Smart': { path: 'graphics/picture_frame/smart.png', ext: '.4bpp.rl', type: 'u32' },
  'sPictureFrameTiles_Tough': { path: 'graphics/picture_frame/tough.png', ext: '.4bpp.rl', type: 'u32' },
  'sPictureFrameTilemap_Cool': { path: 'graphics/picture_frame/cool_map.bin', ext: '.rl', type: 'u32' },
  'sPictureFrameTilemap_Beauty': { path: 'graphics/picture_frame/beauty_map.bin', ext: '.rl', type: 'u32' },
  'sPictureFrameTilemap_Cute': { path: 'graphics/picture_frame/cute_map.bin', ext: '.rl', type: 'u32' },
  'sPictureFrameTilemap_Smart': { path: 'graphics/picture_frame/smart_map.bin', ext: '.rl', type: 'u32' },
  'sPictureFrameTilemap_Tough': { path: 'graphics/picture_frame/tough_map.bin', ext: '.rl', type: 'u32' },
  'sPictureFrameTilemap_HallLobby': { path: 'graphics/picture_frame/lobby_map.bin', ext: '.rl', type: 'u32' },
};

// ─── Inline palettes (RGB(r,g,b) → RGB888 ×8) ───────────────────────────────
export const sBgPalette_COLORS = [{r:0,g:0,b:0}, {r:0,g:0,b:0}] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'COMMON_DATA', type: "struct ImageProcessingContext", name: 'gImageProcessingContext', isArray: false, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ShowContestPainting', ret: "void", arity: 0, params: "void" },
  { name: 'HoldContestPainting', ret: "void", arity: 0, params: "void" },
  { name: 'InitContestPaintingWindow', ret: "void", arity: 0, params: "void" },
  { name: 'InitContestPaintingBg', ret: "void", arity: 0, params: "void" },
  { name: 'InitContestPaintingVars', ret: "void", arity: 1, params: "bool8" },
  { name: 'CreateContestPaintingPicture', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'PrintContestPaintingCaption', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'VBlankCB_ContestPainting', ret: "void", arity: 0, params: "void" },
  { name: 'SetContestWinnerForPainting', ret: "void", arity: 1, params: "int contestWinnerId" },
  { name: 'CB2_ContestPainting', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_HoldContestPainting', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_QuitContestPainting', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateContestPaintingMosaicEffect', ret: "void", arity: 0, params: "void" },
  { name: 'InitContestMonPixels', ret: "void", arity: 2, params: "u16 species, bool8 backPic" },
  { name: 'LoadContestPaintingFrame', ret: "void", arity: 2, params: "u8 contestWinnerId, bool8 isForArtist" },
  { name: 'InitPaintingMonOamData', ret: "void", arity: 1, params: "u8 contestWinnerId" },
  { name: 'GetImageEffectForContestWinner', ret: "u8", arity: 1, params: "u8 contestWinnerId" },
  { name: 'AllocPaintingResources', ret: "void", arity: 0, params: "void" },
  { name: 'DoContestPaintingImageProcessing', ret: "void", arity: 1, params: "u8 imageEffect" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_ContestPainting',
  'CB2_HoldContestPainting',
  'CB2_QuitContestPainting',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'battle.h',
  'battle_gfx_sfx_util.h',
  'bg.h',
  'contest.h',
  'contest_painting.h',
  'data.h',
  'decompress.h',
  'gpu_regs.h',
  'image_processing_effects.h',
  'international_string_util.h',
  'main.h',
  'lilycove_lady.h',
  'palette.h',
  'random.h',
  'scanline_effect.h',
  'string_util.h',
  'strings.h',
  'text.h',
  'window.h',
  'constants/rgb.h',
] as const;
