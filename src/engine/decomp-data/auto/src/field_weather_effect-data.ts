// AUTO-GENERATED from src/field_weather_effect.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/field_weather_effect.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tBlendY_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tBlendDelay_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tWinRange_EXPR = "data[3]";
/** Raw expr: `data[0]` */
export const tCounter_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tRandom_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tPosX_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tPosY_EXPR = "data[3]";
/** Raw expr: `data[5]` */
export const tActive_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tWaiting_EXPR = "data[6]";
/** Raw expr: `data[1]` */
export const tDeltaY_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tWaveDelta_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tWaveIndex_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tSnowflakeId_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tFallCounter_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tFallDuration_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tDeltaY2_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const tSpriteColumn_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const tOffsetY_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tCounterY_EXPR = "data[1]";
/** Raw expr: `data[3]` */
export const tSpriteRow_EXPR = "data[3]";
export const MIN_SANDSTORM_WAVE_INDEX = 32;
/** Raw expr: `data[0]` */
export const tRadius_EXPR = "data[0]";
/** Raw expr: `data[2]` */
export const tRadiusCounter_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tEntranceDelay_EXPR = "data[3]";
/** Raw expr: `data[0]` */
export const tScrollXCounter_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tScrollXDir_EXPR = "data[1]";
/** Raw expr: `data[1]` */
export const tWeatherA_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tWeatherB_EXPR = "data[2]";
/** Raw expr: `data[15]` */
export const tDelay_EXPR = "data[15]";
export const WEATHER_CYCLE_LENGTH = 4;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_THUNDER_0 = {
  THUNDER_STATE_LOAD_RAIN: 0,
  THUNDER_STATE_CREATE_RAIN: 1,
  THUNDER_STATE_INIT_RAIN: 2,
  THUNDER_STATE_WAIT_CHANGE: 3,
  THUNDER_STATE_NEW_CYCLE: 4,
  THUNDER_STATE_NEW_CYCLE_WAIT: 5,
  THUNDER_STATE_INIT_CYCLE_1: 6,
  THUNDER_STATE_INIT_CYCLE_2: 7,
  THUNDER_STATE_SHORT_BOLT: 8,
  THUNDER_STATE_TRY_NEW_BOLT: 9,
  THUNDER_STATE_WAIT_BOLT_SHORT: 10,
  THUNDER_STATE_INIT_BOLT_LONG: 11,
  THUNDER_STATE_WAIT_BOLT_LONG: 12,
  THUNDER_STATE_FADE_BOLT_LONG: 13,
  THUNDER_STATE_END_BOLT_LONG: 14,
} as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sCloudSpriteOamData = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_BLEND", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 3, paletteNum: 0, affineParam: 0 } as const;
export const sRainSpriteOamData = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x32)", tileNum: 0, priority: 1, paletteNum: 2, affineParam: 0 } as const;
export const sSnowflakeSpriteOamData = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(8x8)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_FogH = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_BLEND", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 } as const;
export const sAshSpriteOamData = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_BLEND", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 1, paletteNum: 15 } as const;
export const sFogDiagonalSpriteOamData = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_BLEND", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 2, paletteNum: 0 } as const;
export const sSandstormSpriteOamData = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_BLEND", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 1, paletteNum: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sCloudSpriteTemplate = { tileTag: "GFXTAG_CLOUD", paletteTag: "PALTAG_WEATHER_2", oam: "&sCloudSpriteOamData", anims: "sCloudSpriteAnimCmds", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "UpdateCloudSprite" } as const;
export const sRainSpriteTemplate = { tileTag: "GFXTAG_RAIN", paletteTag: "PALTAG_WEATHER", oam: "&sRainSpriteOamData", anims: "sRainSpriteAnimCmds", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "UpdateRainSprite" } as const;
export const sSnowflakeSpriteTemplate = { tileTag: "TAG_NONE", paletteTag: "PALTAG_WEATHER", oam: "&sSnowflakeSpriteOamData", anims: "sSnowflakeAnimCmds", images: "sSnowflakeSpriteImages", affineAnims: "gDummySpriteAffineAnimTable", callback: "UpdateSnowflakeSprite" } as const;
export const sFogHorizontalSpriteTemplate = { tileTag: "GFXTAG_FOG_H", paletteTag: "PALTAG_WEATHER", oam: "&sOamData_FogH", anims: "sAnims_FogH", images: 0, affineAnims: "sAffineAnims_FogH", callback: "FogHorizontalSpriteCallback" } as const;
export const sAshSpriteTemplate = { tileTag: "GFXTAG_ASH", paletteTag: "PALTAG_WEATHER", oam: "&sAshSpriteOamData", anims: "sAshSpriteAnimCmds", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "UpdateAshSprite" } as const;
export const sFogDiagonalSpriteTemplate = { tileTag: "GFXTAG_FOG_D", paletteTag: "PALTAG_WEATHER", oam: "&sFogDiagonalSpriteOamData", anims: "sFogDiagonalSpriteAnimCmds", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "UpdateFogDiagonalSprite" } as const;
export const sSandstormSpriteTemplate = { tileTag: "GFXTAG_SANDSTORM", paletteTag: "PALTAG_WEATHER_2", oam: "&sSandstormSpriteOamData", anims: "sSandstormSpriteAnimCmds", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "UpdateSandstormSprite" } as const;
export const sBubbleSpriteTemplate = { tileTag: "GFXTAG_BUBBLE", paletteTag: "PALTAG_WEATHER", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "sBubbleSpriteAnimCmds", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "UpdateBubbleSprite" } as const;

// ─── SpriteSheet ─────────────────────────────────────────────────────────────
export const sCloudSpriteSheet = { data: "gWeatherCloudTiles", size: "sizeof(gWeatherCloudTiles)", tag: "GFXTAG_CLOUD" } as const;
export const sRainSpriteSheet = { data: "gWeatherRainTiles", size: "sizeof(gWeatherRainTiles)", tag: "GFXTAG_RAIN" } as const;
export const fogHorizontalSpriteSheet = { data: "gWeatherFogHorizontalTiles", size: "sizeof(gWeatherFogHorizontalTiles)", tag: "GFXTAG_FOG_H" } as const;
export const sAshSpriteSheet = { data: "gWeatherAshTiles", size: "sizeof(gWeatherAshTiles)", tag: "GFXTAG_ASH" } as const;
export const sFogDiagonalSpriteSheet = { data: "gWeatherFogDiagonalTiles", size: "sizeof(gWeatherFogDiagonalTiles)", tag: "GFXTAG_FOG_D" } as const;
export const sSandstormSpriteSheet = { data: "gWeatherSandstormTiles", size: "sizeof(gWeatherSandstormTiles)", tag: "GFXTAG_SANDSTORM" } as const;
export const sWeatherBubbleSpriteSheet = { data: "gWeatherBubbleTiles", size: "sizeof(gWeatherBubbleTiles)", tag: "GFXTAG_BUBBLE" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'gCloudsWeatherPalette': { path: 'graphics/weather/cloud.png', ext: '.gbapal', type: 'u16' },
  'gSandstormWeatherPalette': { path: 'graphics/weather/sandstorm.png', ext: '.gbapal', type: 'u16' },
  'gWeatherFogDiagonalTiles': { path: 'graphics/weather/fog_diagonal.png', ext: '.4bpp', type: 'u8' },
  'gWeatherFogHorizontalTiles': { path: 'graphics/weather/fog_horizontal.png', ext: '.4bpp', type: 'u8' },
  'gWeatherCloudTiles': { path: 'graphics/weather/cloud.png', ext: '.4bpp', type: 'u8' },
  'gWeatherSnow1Tiles': { path: 'graphics/weather/snow0.png', ext: '.4bpp', type: 'u8' },
  'gWeatherSnow2Tiles': { path: 'graphics/weather/snow1.png', ext: '.4bpp', type: 'u8' },
  'gWeatherBubbleTiles': { path: 'graphics/weather/bubble.png', ext: '.4bpp', type: 'u8' },
  'gWeatherAshTiles': { path: 'graphics/weather/ash.png', ext: '.4bpp', type: 'u8' },
  'gWeatherRainTiles': { path: 'graphics/weather/rain.png', ext: '.4bpp', type: 'u8' },
  'gWeatherSandstormTiles': { path: 'graphics/weather/sandstorm.png', ext: '.4bpp', type: 'u8' },
};

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sUnusedData: readonly number[] = [0,6,6,12,18,42,300,300] as const;
export const sSwirlEntranceDelays: readonly number[] = [0,120,80,160,40,0] as const;
export const sBubbleStartDelays: readonly number[] = [40,90,60,90,2,60,40,30] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sCurrentAbnormalWeather', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sUnusedWeatherRelated', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CreateCloudSprites', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyCloudSprites', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateCloudSprite', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'Clouds_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'Clouds_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'Clouds_Main', ret: "void", arity: 0, params: "void" },
  { name: 'Clouds_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'Sunny_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'Sunny_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'Sunny_Main', ret: "void", arity: 0, params: "void" },
  { name: 'Sunny_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'UpdateDroughtBlend', ret: "void", arity: 1, params: "u8" },
  { name: 'Drought_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'Drought_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'Drought_Main', ret: "void", arity: 0, params: "void" },
  { name: 'Drought_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'StartDroughtWeatherBlend', ret: "void", arity: 0, params: "void" },
  { name: 'LoadRainSpriteSheet', ret: "void", arity: 0, params: "void" },
  { name: 'CreateRainSprite', ret: "bool8", arity: 0, params: "void" },
  { name: 'UpdateRainSprite', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UpdateVisibleRainSprites', ret: "bool8", arity: 0, params: "void" },
  { name: 'DestroyRainSprites', ret: "void", arity: 0, params: "void" },
  { name: 'Rain_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'Rain_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'Rain_Main', ret: "void", arity: 0, params: "void" },
  { name: 'Rain_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'StartRainSpriteFall', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'WaitRainSprite', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'InitRainSpriteMovement', ret: "void", arity: 2, params: "struct Sprite *sprite, u16 val" },
  { name: 'UpdateSnowflakeSprite', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'UpdateVisibleSnowflakeSprites', ret: "bool8", arity: 0, params: "void" },
  { name: 'CreateSnowflakeSprite', ret: "bool8", arity: 0, params: "void" },
  { name: 'DestroySnowflakeSprite', ret: "bool8", arity: 0, params: "void" },
  { name: 'InitSnowflakeSpriteMovement', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'Snow_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'Snow_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'Snow_Main', ret: "void", arity: 0, params: "void" },
  { name: 'Snow_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'WaitSnowflakeSprite', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'Thunderstorm_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'Thunderstorm_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateThunderSound', ret: "void", arity: 0, params: "void" },
  { name: 'EnqueueThunder', ret: "void", arity: 1, params: "u16" },
  { name: 'Downpour_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'Downpour_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'Thunderstorm_Main', ret: "void", arity: 0, params: "void" },
  { name: 'Thunderstorm_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'PlaySE', ret: "else", arity: 1, params: "SE_THUNDER2" },
  { name: 'FogHorizontalSpriteCallback', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'FogHorizontal_Main', ret: "void", arity: 0, params: "void" },
  { name: 'CreateFogHorizontalSprites', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyFogHorizontalSprites', ret: "void", arity: 0, params: "void" },
  { name: 'FogHorizontal_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'FogHorizontal_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'Weather_SetTargetBlendCoeffs', ret: "else", arity: 3, params: "4, 16, 0" },
  { name: 'FogHorizontal_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'LoadAshSpriteSheet', ret: "void", arity: 0, params: "void" },
  { name: 'CreateAshSprites', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyAshSprites', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateAshSprite', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'Ash_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'Ash_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'Ash_Main', ret: "void", arity: 0, params: "void" },
  { name: 'Ash_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'UpdateFogDiagonalMovement', ret: "void", arity: 0, params: "void" },
  { name: 'CreateFogDiagonalSprites', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyFogDiagonalSprites', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateFogDiagonalSprite', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'FogDiagonal_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'FogDiagonal_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'FogDiagonal_Main', ret: "void", arity: 0, params: "void" },
  { name: 'FogDiagonal_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'UpdateSandstormWaveIndex', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateSandstormMovement', ret: "void", arity: 0, params: "void" },
  { name: 'CreateSandstormSprites', ret: "void", arity: 0, params: "void" },
  { name: 'CreateSwirlSandstormSprites', ret: "void", arity: 0, params: "void" },
  { name: 'DestroySandstormSprites', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateSandstormSprite', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'WaitSandSwirlSpriteEntrance', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'UpdateSandstormSwirlSprite', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'Sandstorm_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'Sandstorm_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'Sandstorm_Main', ret: "void", arity: 0, params: "void" },
  { name: 'Sandstorm_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'Shade_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'Shade_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'Shade_Main', ret: "void", arity: 0, params: "void" },
  { name: 'Shade_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'CreateBubbleSprite', ret: "void", arity: 1, params: "u16" },
  { name: 'DestroyBubbleSprites', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateBubbleSprite', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'Bubbles_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'Bubbles_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'Bubbles_Main', ret: "void", arity: 0, params: "void" },
  { name: 'Bubbles_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'UnusedSetCurrentAbnormalWeather', ret: "UNUSED", arity: 2, params: "u32 weather, u32 unknown" },
  { name: 'Task_DoAbnormalWeather', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CreateAbnormalWeatherTask', ret: "void", arity: 0, params: "void" },
  { name: 'TranslateWeatherNum', ret: "u8", arity: 1, params: "u8" },
  { name: 'UpdateRainCounter', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'SetSavedWeather', ret: "void", arity: 1, params: "u32 weather" },
  { name: 'GetSavedWeather', ret: "u8", arity: 0, params: "void" },
  { name: 'SetSavedWeatherFromCurrMapHeader', ret: "void", arity: 0, params: "void" },
  { name: 'SetWeather', ret: "void", arity: 1, params: "u32 weather" },
  { name: 'SetWeather_Unused', ret: "void", arity: 1, params: "u32 weather" },
  { name: 'DoCurrentWeather', ret: "void", arity: 0, params: "void" },
  { name: 'ResumePausedWeather', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateWeatherPerDay', ret: "void", arity: 1, params: "u16 increment" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_DoAbnormalWeather',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_anim.h',
  'event_object_movement.h',
  'fieldmap.h',
  'field_weather.h',
  'overworld.h',
  'random.h',
  'script.h',
  'constants/weather.h',
  'constants/songs.h',
  'sound.h',
  'sprite.h',
  'task.h',
  'trig.h',
  'gpu_regs.h',
] as const;
