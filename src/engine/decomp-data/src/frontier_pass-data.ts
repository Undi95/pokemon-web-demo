// AUTO-GENERATED from src/frontier_pass.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/frontier_pass.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const NUM_BG_PAL_SLOTS = 8;
/** Raw expr: `CURSOR_AREA_SYMBOL_TOWER` */
export const CURSOR_AREA_SYMBOL_EXPR = "CURSOR_AREA_SYMBOL_TOWER";
/** Raw expr: `data[0]` */
export const tZoomOut_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tScaleX_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tScaleY_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tScaleSpeedX_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tScaleSpeedY_EXPR = "data[4]";
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tMoveSteps_EXPR = "data[1]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_WINDOW_0 = {
  WINDOW_EARNED_SYMBOLS: 0,
  WINDOW_BATTLE_RECORD: 1,
  WINDOW_BATTLE_POINTS: 2,
  WINDOW_DESCRIPTION: 3,
  WINDOW_DUMMY: 4,
  WINDOW_COUNT: 5,
} as const;
export const ENUM_MAP_1 = {
  MAP_WINDOW_UNUSED: 0,
  MAP_WINDOW_NAME: 1,
  MAP_WINDOW_DESCRIPTION: 2,
  MAP_WINDOW_COUNT: 3,
} as const;
export const ENUM_CURSOR_2 = {
  CURSOR_AREA_NOTHING: 0,
  CURSOR_AREA_MAP: 1,
  CURSOR_AREA_CARD: 2,
  CURSOR_AREA_RECORD: 3,
  CURSOR_AREA_CANCEL: 4,
  CURSOR_AREA_POINTS: 5,
  CURSOR_AREA_EARNED_SYMBOLS: 6,
  CURSOR_AREA_SYMBOL_TOWER: 7,
  CURSOR_AREA_SYMBOL_DOME: 8,
  CURSOR_AREA_SYMBOL_PALACE: 9,
  CURSOR_AREA_SYMBOL_ARENA: 10,
  CURSOR_AREA_SYMBOL_FACTORY: 11,
  CURSOR_AREA_SYMBOL_PIKE: 12,
  CURSOR_AREA_SYMBOL_PYRAMID: 13,
  CURSOR_AREA_COUNT: 14,
} as const;
export const ENUM_MAP_3 = {
  MAP_INDICATOR_RECTANGLE: 0,
  MAP_INDICATOR_SQUARE: 1,
} as const;
export const ENUM_TAG_4 = {
  TAG_CURSOR: 0,
  TAG_MAP_INDICATOR: 1,
  TAG_MEDAL_SILVER: 2,
  TAG_MEDAL_GOLD: 3,
  TAG_HEAD_MALE: 4,
  TAG_HEAD_FEMALE: 5,
} as const;
export const ENUM_SUCCESS_5 = {
  SUCCESS: 0,
  ERR_ALREADY_DONE: 1,
  ERR_ALLOC_FAILED: 2,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sPassWindowTemplates = [
  { bg: 0, tilemapLeft: 2, tilemapTop: 3, width: 12, height: 3, paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 10, width: 12, height: 3, paletteNum: 15, baseBlock: 38 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 13, width: 12, height: 4, paletteNum: 15, baseBlock: 75 },
  { bg: 0, tilemapLeft: 0, tilemapTop: 18, width: 30, height: 3, paletteNum: 15, baseBlock: 124 },
] as const;
export const sMapWindowTemplates = [
  { bg: 0, tilemapLeft: 0, tilemapTop: 1, width: 15, height: 5, paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: 20, tilemapTop: 1, width: 10, height: 14, paletteNum: 15, baseBlock: 77 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 16, width: 26, height: 4, paletteNum: 15, baseBlock: 218 },
] as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sPassBgTemplates = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 2, charBaseIndex: 1, mapBaseIndex: 29, screenSize: 1, paletteMode: 1, priority: 0, baseTile: 0 },
] as const;
export const sMapBgTemplates = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
] as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplates_Cursors = [
  { tileTag: "TAG_CURSOR", paletteTag: "TAG_CURSOR", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "sAnims_TwoFrame", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
  { tileTag: "TAG_MAP_INDICATOR", paletteTag: "TAG_MAP_INDICATOR", oam: "&gOamData_AffineOff_ObjNormal_32x16", anims: "sAnims_MapIndicatorCursor", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
] as const;
export const sSpriteTemplate_Medal = { tileTag: "TAG_MEDAL_SILVER", paletteTag: "TAG_MEDAL_SILVER", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "sAnims_Medal", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_PlayerHead = { tileTag: "TAG_HEAD_MALE", paletteTag: "TAG_HEAD_MALE", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "sAnims_TwoFrame", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_PlayerHead" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sMaleHead_Pal': { path: 'graphics/frontier_pass/map_heads.png', ext: '.gbapal', type: 'u16' },
  'sFemaleHead_Pal': { path: 'graphics/frontier_pass/map_heads_female.pal', ext: '.gbapal', type: 'u16' },
  'sCursor_Gfx': { path: 'graphics/frontier_pass/cursor.png', ext: '.4bpp.lz', type: 'u32' },
  'sHeads_Gfx': { path: 'graphics/frontier_pass/map_heads.png', ext: '.4bpp.lz', type: 'u32' },
  'sMapCursor_Gfx': { path: 'graphics/frontier_pass/map_cursor.png', ext: '.4bpp.lz', type: 'u32' },
  'sMapScreen_Tilemap': { path: 'graphics/frontier_pass/map_screen.bin', ext: '.lz', type: 'u32' },
  'sMapAndCard_ZoomedOut_Tilemap': { path: 'graphics/frontier_pass/small_map_and_card.bin', ext: '.lz', type: 'u32' },
  'sBattleRecord_Tilemap': { path: 'graphics/frontier_pass/record_frame.bin', ext: '.lz', type: 'u32' },
  'sMapAndCard_Zooming_Tilemap': { path: 'graphics/frontier_pass/small_map_and_card_affine.bin', ext: '.lz', type: 'u32' },
};

// ─── INCBIN paths (raw binary includes) ─────────────────────────────────────
export const INCBIN_SOURCES: Record<string, { path: string; type: string }> = {
  'sCardBall_Filled_Tilemap': { path: 'graphics/frontier_pass/card_ball_filled.bin', type: 'u32' },
};

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sPassAreaDescriptions = ['gText_ThereIsNoBattleRecord', 'gText_CheckFrontierMap', 'gText_CheckTrainerCard', 'gText_ViewRecordedBattle', 'gText_PutAwayFrontierPass', 'gText_CurrentBattlePoints', 'gText_CollectedSymbols', 'gText_BattleTowerAbilitySymbol', 'gText_BattleDomeTacticsSymbol', 'gText_BattlePalaceSpiritsSymbol', 'gText_BattleArenaGutsSymbol', 'gText_BattleFactoryKnowledgeSymbol', 'gText_BattlePikeLuckSymbol', 'gText_BattlePyramidBraveSymbol', 'gText_EmptyString7'] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "struct FrontierPassSaved", name: 'sSavedPassData', isArray: false, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AllocateFrontierPassData', ret: "u32", arity: 1, params: "MainCallback callback" },
  { name: 'ShowFrontierMap', ret: "void", arity: 1, params: "MainCallback callback" },
  { name: 'CB2_InitFrontierPass', ret: "void", arity: 0, params: "void" },
  { name: 'DrawFrontierPassBg', ret: "void", arity: 0, params: "void" },
  { name: 'FreeCursorAndSymbolSprites', ret: "void", arity: 0, params: "void" },
  { name: 'LoadCursorAndSymbolSprites', ret: "void", arity: 0, params: "void" },
  { name: 'FreeFrontierPassData', ret: "u32", arity: 0, params: "void" },
  { name: 'InitFrontierPass', ret: "bool32", arity: 0, params: "void" },
  { name: 'HideFrontierPass', ret: "bool32", arity: 0, params: "void" },
  { name: 'Task_HandleFrontierPassInput', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_PassAreaZoom', ret: "void", arity: 1, params: "u8" },
  { name: 'UpdateAreaHighlight', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'PrintAreaDescription', ret: "void", arity: 1, params: "u8" },
  { name: 'ShowHideZoomingArea', ret: "void", arity: 2, params: "bool8, bool8" },
  { name: 'SpriteCB_PlayerHead', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'ResetGpuRegsAndBgs', ret: "void", arity: 0, params: "void" },
  { name: 'LeaveFrontierPass', ret: "void", arity: 0, params: "void" },
  { name: 'AllocateFrontierPassGfx', ret: "u32", arity: 0, params: "void" },
  { name: 'FreeFrontierPassGfx', ret: "u32", arity: 0, params: "void" },
  { name: 'VBlankCB_FrontierPass', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_FrontierPass', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_HideFrontierPass', ret: "void", arity: 0, params: "void" },
  { name: 'GetCursorAreaFromCoords', ret: "u8", arity: 2, params: "s16 x, s16 y" },
  { name: 'CB2_ReshowFrontierPass', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ReturnFromRecord', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ShowFrontierPassFeature', ret: "void", arity: 0, params: "void" },
  { name: 'TryCallPassAreaFunction', ret: "bool32", arity: 2, params: "u8 taskId, u8 cursorArea" },
  { name: 'ShowAndPrintWindows', ret: "void", arity: 0, params: "void" },
  { name: 'FillBgTilemapBufferRect', ret: "else", arity: 7, params: "2, 0, 16, 3, 12, 7, 16" },
  { name: 'Task_HandleFrontierMap', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'PrintOnFrontierMap', ret: "void", arity: 0, params: "void" },
  { name: 'InitFrontierMapSprites', ret: "void", arity: 0, params: "void" },
  { name: 'HandleFrontierMapCursorMove', ret: "void", arity: 1, params: "u8 direction" },
  { name: 'FreeFrontierMap', ret: "void", arity: 0, params: "void" },
  { name: 'InitFrontierMap', ret: "bool32", arity: 0, params: "void" },
  { name: 'ExitFrontierMap', ret: "bool32", arity: 0, params: "void" },
  { name: 'MapNumToFrontierFacilityId', ret: "u8", arity: 1, params: "u16 mapNum" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_HandleFrontierMap',
  'Task_HandleFrontierPassInput',
  'Task_PassAreaZoom',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_FrontierPass',
  'CB2_HideFrontierPass',
  'CB2_InitFrontierPass',
  'CB2_ReshowFrontierPass',
  'CB2_ReturnFromRecord',
  'CB2_ShowFrontierPassFeature',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'gpu_regs.h',
  'main.h',
  'trainer_card.h',
  'battle_anim.h',
  'event_data.h',
  'recorded_battle.h',
  'malloc.h',
  'sprite.h',
  'scanline_effect.h',
  'text_window.h',
  'task.h',
  'graphics.h',
  'strings.h',
  'frontier_pass.h',
  'international_string_util.h',
  'palette.h',
  'window.h',
  'decompress.h',
  'menu_helpers.h',
  'menu.h',
  'bg.h',
  'sound.h',
  'string_util.h',
  'battle_pyramid.h',
  'overworld.h',
  'math_util.h',
  'constants/battle_frontier.h',
  'constants/rgb.h',
  'constants/region_map_sections.h',
  'constants/songs.h',
] as const;
