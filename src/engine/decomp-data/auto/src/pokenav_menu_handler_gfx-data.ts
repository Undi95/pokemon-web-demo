// AUTO-GENERATED from src/pokenav_menu_handler_gfx.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokenav_menu_handler_gfx.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const GFXTAG_BLUE_LIGHT = 1;
export const GFXTAG_OPTIONS = 3;
export const PALTAG_BLUE_LIGHT = 3;
export const PALTAG_OPTIONS_DEFAULT = 4;
export const PALTAG_OPTIONS_BLUE = 5;
export const PALTAG_OPTIONS_PINK = 6;
export const PALTAG_OPTIONS_BEIGE = 7;
export const PALTAG_OPTIONS_RED = 8;
/** Raw expr: `PALTAG_OPTIONS_DEFAULT` */
export const PALTAG_OPTIONS_START_EXPR = "PALTAG_OPTIONS_DEFAULT";
export const NUM_OPTION_SUBSPRITES = 4;
export const OPTION_DEFAULT_X = 140;
export const OPTION_SELECTED_X = 130;
/** Raw expr: `(DISPLAY_WIDTH + 16)` */
export const OPTION_EXIT_X_EXPR = "(DISPLAY_WIDTH + 16)";
/** Raw expr: `data[0]` */
export const sSlideTime_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sSlideAccel_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sSlideSpeed_EXPR = "data[2]";
/** Raw expr: `data[7]` */
export const sSlideEndX_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const sZoomDelay_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sZoomSetAffine_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sZoomSpeed_EXPR = "data[2]";
/** Raw expr: `data[7]` */
export const sZoomSubspriteId_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const tBlendDelay_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tBlendState_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tBlendTarget1_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tBlendTarget2_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tBlendCounter_EXPR = "data[4]";

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sOptionDescWindowTemplate = { bg: 1, tilemapLeft: 3, tilemapTop: 17, width: 24, height: 2, paletteNum: 1, baseBlock: 8 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sPokenavMainMenuBgTemplates = [
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 15, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 23, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 3, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_MenuOption = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x16)", x: 0, size: "SPRITE_SIZE(32x16)", tileNum: 0, priority: 2, paletteNum: 0 } as const;
export const sBlueLightOamData = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x16)", x: 0, size: "SPRITE_SIZE(32x16)", tileNum: 0, priority: 2, paletteNum: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sMenuOptionSpriteTemplate = { tileTag: "GFXTAG_OPTIONS", paletteTag: "PALTAG_OPTIONS_START", oam: "&sOamData_MenuOption", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_MenuOption", callback: "SpriteCallbackDummy" } as const;
export const sMatchCallBlueLightSpriteTemplate = { tileTag: "GFXTAG_BLUE_LIGHT", paletteTag: "PALTAG_BLUE_LIGHT", oam: "&sBlueLightOamData", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── CompressedSpriteSheet ─────────────────────────────────────────────────────────────
export const sPokenavOptionsSpriteSheets = [
  { data: "gPokenavOptions_Gfx", size: 13312, tag: "GFXTAG_OPTIONS" },
  { data: "sMatchCallBlueLightTiles", size: 256, tag: "GFXTAG_BLUE_LIGHT" },
] as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sPokenavBgDotsPal': { path: 'graphics/pokenav/bg_dots.png', ext: '.gbapal', type: 'u16' },
  'sPokenavBgDotsTiles': { path: 'graphics/pokenav/bg_dots.png', ext: '.4bpp.lz', type: 'u32' },
  'sPokenavBgDotsTilemap': { path: 'graphics/pokenav/bg_dots.bin', ext: '.lz', type: 'u32' },
  'sPokenavDeviceBgPal': { path: 'graphics/pokenav/device_outline.png', ext: '.gbapal', type: 'u16' },
  'sPokenavDeviceBgTilemap': { path: 'graphics/pokenav/device_outline_map.bin', ext: '.lz', type: 'u32' },
  'sMatchCallBlueLightPal': { path: 'graphics/pokenav/blue_light.png', ext: '.gbapal', type: 'u16' },
  'sMatchCallBlueLightTiles': { path: 'graphics/pokenav/blue_light.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sPageDescriptions = ['gText_CheckMapOfHoenn', 'gText_CheckPokemonInDetail', 'gText_CallRegisteredTrainer', 'gText_CheckObtainedRibbons', 'gText_PutAwayPokenav', 'gText_CheckPartyPokemonInDetail', 'gText_CheckAllPokemonInDetail', 'gText_ReturnToPokenavMenu', 'gText_FindCoolPokemon', 'gText_FindBeautifulPokemon', 'gText_FindCutePokemon', 'gText_FindSmartPokemon', 'gText_FindToughPokemon', 'gText_ReturnToConditionMenu'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'OpenPokenavMenu', ret: "Pokenav_MenuGfx *", arity: 0, params: "void" },
  { name: 'GetCurrentLoopedTaskActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'LoopedTask_OpenMenu', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_MoveMenuCursor', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_OpenConditionMenu', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_ReturnToMainMenu', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_OpenConditionSearchMenu', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_ReturnToConditionMenu', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_SelectRibbonsNoWinners', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_ReShowDescription', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_OpenPokenavFeature', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoadPokenavOptionPalettes', ret: "void", arity: 0, params: "void" },
  { name: 'FreeAndDestroyMainMenuSprites', ret: "void", arity: 0, params: "void" },
  { name: 'CreateMenuOptionSprites', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyMenuOptionSprites', ret: "void", arity: 0, params: "void" },
  { name: 'DrawCurrentMenuOptionLabels', ret: "void", arity: 0, params: "void" },
  { name: 'DrawOptionLabelGfx', ret: "void", arity: 3, params: "const u16 *const *, s32, s32" },
  { name: 'StartOptionAnimations_Enter', ret: "void", arity: 0, params: "void" },
  { name: 'StartOptionAnimations_CursorMoved', ret: "void", arity: 0, params: "void" },
  { name: 'StartOptionAnimations_Exit', ret: "void", arity: 0, params: "void" },
  { name: 'StartOptionSlide', ret: "void", arity: 4, params: "struct Sprite **, s32, s32, s32" },
  { name: 'StartOptionZoom', ret: "void", arity: 1, params: "struct Sprite **" },
  { name: 'AreMenuOptionSpritesMoving', ret: "bool32", arity: 0, params: "void" },
  { name: 'SetOptionInvisibility', ret: "void", arity: 2, params: "struct Sprite **, bool32" },
  { name: 'SpriteCB_OptionSlide', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_OptionZoom', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'Task_OptionBlend', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateMatchCallBlueLightSprite', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_BlinkingBlueLight', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'DestroyRematchBlueLightSprite', ret: "void", arity: 0, params: "void" },
  { name: 'AddOptionDescriptionWindow', ret: "void", arity: 0, params: "void" },
  { name: 'PrintCurrentOptionDescription', ret: "void", arity: 0, params: "void" },
  { name: 'PrintNoRibbonWinners', ret: "void", arity: 0, params: "void" },
  { name: 'IsDma3ManagerBusyWithBgCopy_', ret: "bool32", arity: 0, params: "void" },
  { name: 'CreateMovingBgDotsTask', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyMovingDotsBgTask', ret: "void", arity: 0, params: "void" },
  { name: 'Task_MoveBgDots', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateBgDotPurplePalTask', ret: "void", arity: 0, params: "void" },
  { name: 'ChangeBgDotsColorToPurple', ret: "void", arity: 0, params: "void" },
  { name: 'CreateBgDotLightBluePalTask', ret: "void", arity: 0, params: "void" },
  { name: 'IsTaskActive_UpdateBgDotsPalette', ret: "bool32", arity: 0, params: "void" },
  { name: 'Task_UpdateBgDotsPalette', ret: "void", arity: 1, params: "u8" },
  { name: 'SetupPokenavMenuScanlineEffects', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyMenuOptionGlowTask', ret: "void", arity: 0, params: "void" },
  { name: 'ResetBldCnt', ret: "void", arity: 0, params: "void" },
  { name: 'InitMenuOptionGlow', ret: "void", arity: 0, params: "void" },
  { name: 'Task_CurrentMenuOptionGlow', ret: "void", arity: 1, params: "u8" },
  { name: 'SetMenuOptionGlow', ret: "void", arity: 0, params: "void" },
  { name: 'AreAnyTrainerRematchesNearby', ret: "bool32", arity: 0, params: "void" },
  { name: 'OpenPokenavMenuInitial', ret: "bool32", arity: 0, params: "void" },
  { name: 'OpenPokenavMenuNotInitial', ret: "bool32", arity: 0, params: "void" },
  { name: 'CreateMenuHandlerLoopedTask', ret: "void", arity: 1, params: "s32 ltIdx" },
  { name: 'IsMenuHandlerLoopedTaskActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'FreeMenuHandlerSubstruct2', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_PokenavMainMenu', ret: "void", arity: 0, params: "void" },
  { name: 'ResetBldCnt_', ret: "void", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_CurrentMenuOptionGlow',
  'Task_MoveBgDots',
  'Task_OptionBlend',
  'Task_UpdateBgDotsPalette',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'decompress.h',
  'bg.h',
  'palette.h',
  'trig.h',
  'gpu_regs.h',
  'menu.h',
  'window.h',
  'pokenav.h',
  'graphics.h',
  'sound.h',
  'gym_leader_rematch.h',
  'window.h',
  'strings.h',
  'scanline_effect.h',
  'constants/songs.h',
  'constants/rgb.h',
] as const;
