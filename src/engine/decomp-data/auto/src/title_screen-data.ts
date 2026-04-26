// AUTO-GENERATED from src/title_screen.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/title_screen.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const VERSION_BANNER_RIGHT_TILEOFFSET = 64;
export const VERSION_BANNER_LEFT_X = 98;
export const VERSION_BANNER_RIGHT_X = 162;
export const VERSION_BANNER_Y = 4;
export const VERSION_BANNER_Y_GOAL = 68;
export const START_BANNER_X = 128;
/** Raw expr: `(B_BUTTON | SELECT_BUTTON | DPAD_UP)` */
export const CLEAR_SAVE_BUTTON_COMBO_EXPR = "(B_BUTTON | SELECT_BUTTON | DPAD_UP)";
/** Raw expr: `(B_BUTTON | SELECT_BUTTON | DPAD_LEFT)` */
export const RESET_RTC_BUTTON_COMBO_EXPR = "(B_BUTTON | SELECT_BUTTON | DPAD_LEFT)";
/** Raw expr: `(B_BUTTON | SELECT_BUTTON)` */
export const BERRY_UPDATE_BUTTON_COMBO_EXPR = "(B_BUTTON | SELECT_BUTTON)";
/** Raw expr: `(A_BUTTON | B_BUTTON | START_BUTTON | SELECT_BUTTON)` */
export const A_B_START_SELECT_EXPR = "(A_BUTTON | B_BUTTON | START_BUTTON | SELECT_BUTTON)";
export const NUM_PRESS_START_FRAMES = 5;
export const NUM_COPYRIGHT_FRAMES = 5;
/** Raw expr: `data[0]` */
export const tCounter_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tSkipToNext_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tPointless_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tBg2Y_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tBg1Y_EXPR = "data[4]";
/** Raw expr: `data[0]` */
export const sAlphaBlendIdx_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sParentTaskId_EXPR = "data[1]";
/** Raw expr: `data[0]` */
export const sAnimate_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sTimer_EXPR = "data[1]";
export const SHINE_SPEED = 4;
/** Raw expr: `data[0]` */
export const sMode_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sBgColor_EXPR = "data[1]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_TAG_0 = {
  TAG_VERSION: 1000,
  TAG_PRESS_START_COPYRIGHT: 1001,
  TAG_LOGO_SHINE: 1002,
} as const;
export const ENUM_SHINE_1 = {
  SHINE_MODE_SINGLE_NO_BG_COLOR: 0,
  SHINE_MODE_DOUBLE: 1,
  SHINE_MODE_SINGLE: 2,
} as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sVersionBannerLeftOamData = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_8BPP", shape: "SPRITE_SHAPE(64x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x32)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sVersionBannerRightOamData = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_8BPP", shape: "SPRITE_SHAPE(64x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x32)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_CopyrightBanner = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x8)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sPokemonLogoShineOamData = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sVersionBannerLeftSpriteTemplate = { tileTag: "TAG_VERSION", paletteTag: "TAG_VERSION", oam: "&sVersionBannerLeftOamData", anims: "sVersionBannerLeftAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_VersionBannerLeft" } as const;
export const sVersionBannerRightSpriteTemplate = { tileTag: "TAG_VERSION", paletteTag: "TAG_VERSION", oam: "&sVersionBannerRightOamData", anims: "sVersionBannerRightAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_VersionBannerRight" } as const;
export const sStartCopyrightBannerSpriteTemplate = { tileTag: "TAG_PRESS_START_COPYRIGHT", paletteTag: "TAG_PRESS_START_COPYRIGHT", oam: "&sOamData_CopyrightBanner", anims: "sStartCopyrightBannerAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_PressStartCopyrightBanner" } as const;
export const sPokemonLogoShineSpriteTemplate = { tileTag: "TAG_LOGO_SHINE", paletteTag: "TAG_PRESS_START_COPYRIGHT", oam: "&sPokemonLogoShineOamData", anims: "sPokemonLogoShineAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_PokemonLogoShine" } as const;

// ─── CompressedSpriteSheet ─────────────────────────────────────────────────────────────
export const sSpriteSheet_EmeraldVersion = { data: "gTitleScreenEmeraldVersionGfx", size: 4096, tag: "TAG_VERSION" } as const;
export const sSpriteSheet_PressStart = { data: "gTitleScreenPressStartGfx", size: 1312, tag: "TAG_PRESS_START_COPYRIGHT" } as const;
export const sPokemonLogoShineSpriteSheet = { data: "sTitleScreenLogoShineGfx", size: 2048, tag: "TAG_LOGO_SHINE" } as const;

// ─── SpritePalette ─────────────────────────────────────────────────────────────
export const sSpritePalette_PressStart = { data: "gTitleScreenPressStartPal", tag: "TAG_PRESS_START_COPYRIGHT" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sUnusedUnknownPal': { path: 'graphics/title_screen/unused.pal', ext: '.gbapal', type: 'u16' },
  'sTitleScreenRayquazaGfx': { path: 'graphics/title_screen/rayquaza.png', ext: '.4bpp.lz', type: 'u32' },
  'sTitleScreenRayquazaTilemap': { path: 'graphics/title_screen/rayquaza.bin', ext: '.lz', type: 'u32' },
  'sTitleScreenLogoShineGfx': { path: 'graphics/title_screen/logo_shine.png', ext: '.4bpp.lz', type: 'u32' },
  'sTitleScreenCloudsGfx': { path: 'graphics/title_screen/clouds.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'MainCB2', ret: "void", arity: 0, params: "void" },
  { name: 'Task_TitleScreenPhase1', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_TitleScreenPhase2', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_TitleScreenPhase3', ret: "void", arity: 1, params: "u8" },
  { name: 'CB2_GoToMainMenu', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_GoToClearSaveDataScreen', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_GoToResetRtcScreen', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_GoToBerryFixScreen', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_GoToCopyrightScreen', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateLegendaryMarkingColor', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_VersionBannerLeft', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_VersionBannerRight', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_PressStartCopyrightBanner', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_PokemonLogoShine', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'CreatePressStartBanner', ret: "void", arity: 2, params: "s16 x, s16 y" },
  { name: 'CreateCopyrightBanner', ret: "void", arity: 2, params: "s16 x, s16 y" },
  { name: 'SpriteCB_PokemonLogoShine_Fast', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'DestroySprite', ret: "else", arity: 1, params: "sprite" },
  { name: 'StartPokemonLogoShine', ret: "void", arity: 1, params: "u8 mode" },
  { name: 'VBlankCB', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_InitTitleScreen', ret: "void", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_TitleScreenPhase1',
  'Task_TitleScreenPhase2',
  'Task_TitleScreenPhase3',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_GoToBerryFixScreen',
  'CB2_GoToClearSaveDataScreen',
  'CB2_GoToCopyrightScreen',
  'CB2_GoToMainMenu',
  'CB2_GoToResetRtcScreen',
  'CB2_InitTitleScreen',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'title_screen.h',
  'sprite.h',
  'gba/m4a_internal.h',
  'clear_save_data_menu.h',
  'decompress.h',
  'event_data.h',
  'intro.h',
  'm4a.h',
  'main.h',
  'main_menu.h',
  'palette.h',
  'reset_rtc_screen.h',
  'berry_fix_program.h',
  'sound.h',
  'sprite.h',
  'task.h',
  'scanline_effect.h',
  'gpu_regs.h',
  'trig.h',
  'graphics.h',
  'constants/rgb.h',
  'constants/songs.h',
] as const;
