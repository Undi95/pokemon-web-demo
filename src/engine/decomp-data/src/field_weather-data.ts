// AUTO-GENERATED from src/field_weather.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/field_weather.c
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_COLOR_0 = {
  COLOR_MAP_NONE: 0,
  COLOR_MAP_DARK_CONTRAST: 1,
  COLOR_MAP_CONTRAST: 2,
} as const;

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const gWeatherPalStateFuncs = ['UpdateWeatherColorMap', 'FadeInScreenWithWeather', 'DoNothing', 'DoNothing'] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "struct Weather", name: 'gWeather', isArray: false, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'LightenSpritePaletteInFog', ret: "bool8", arity: 1, params: "u8" },
  { name: 'BuildColorMaps', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateWeatherColorMap', ret: "void", arity: 0, params: "void" },
  { name: 'ApplyColorMap', ret: "void", arity: 3, params: "u8 startPalIndex, u8 numPalettes, s8 colorMapIndex" },
  { name: 'ApplyColorMapWithBlend', ret: "void", arity: 5, params: "u8 startPalIndex, u8 numPalettes, s8 colorMapIndex, u8 blendCoeff, u16 blendColor" },
  { name: 'ApplyDroughtColorMapWithBlend', ret: "void", arity: 3, params: "s8 colorMapIndex, u8 blendCoeff, u16 blendColor" },
  { name: 'ApplyFogBlend', ret: "void", arity: 2, params: "u8 blendCoeff, u16 blendColor" },
  { name: 'FadeInScreen_RainShowShade', ret: "bool8", arity: 0, params: "void" },
  { name: 'FadeInScreen_Drought', ret: "bool8", arity: 0, params: "void" },
  { name: 'FadeInScreen_FogHorizontal', ret: "bool8", arity: 0, params: "void" },
  { name: 'FadeInScreenWithWeather', ret: "void", arity: 0, params: "void" },
  { name: 'DoNothing', ret: "void", arity: 0, params: "void" },
  { name: 'Task_WeatherInit', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_WeatherMain', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'None_Init', ret: "void", arity: 0, params: "void" },
  { name: 'None_Main', ret: "void", arity: 0, params: "void" },
  { name: 'None_Finish', ret: "u8", arity: 0, params: "void" },
  { name: 'StartWeather', ret: "void", arity: 0, params: "void" },
  { name: 'SetNextWeather', ret: "void", arity: 1, params: "u8 weather" },
  { name: 'SetCurrentAndNextWeather', ret: "void", arity: 1, params: "u8 weather" },
  { name: 'SetCurrentAndNextWeatherNoDelay', ret: "void", arity: 1, params: "u8 weather" },
  { name: 'MarkFogSpritePalToLighten', ret: "void", arity: 1, params: "u8 paletteIndex" },
  { name: 'ApplyWeatherColorMapIfIdle', ret: "void", arity: 1, params: "s8 colorMapIndex" },
  { name: 'ApplyWeatherColorMapIfIdle_Gradual', ret: "void", arity: 3, params: "u8 colorMapIndex, u8 targetColorMapIndex, u8 colorMapStepDelay" },
  { name: 'FadeScreen', ret: "void", arity: 2, params: "u8 mode, s8 delay" },
  { name: 'BeginNormalPaletteFade', ret: "else", arity: 5, params: "PALETTES_ALL, delay, 16, 0, fadeColor" },
  { name: 'IsWeatherNotFadingIn', ret: "bool8", arity: 0, params: "void" },
  { name: 'UpdateSpritePaletteWithWeather', ret: "void", arity: 1, params: "u8 spritePaletteIndex" },
  { name: 'ApplyWeatherColorMapToPal', ret: "void", arity: 1, params: "u8 paletteIndex" },
  { name: 'IsFirstFrameOfWeatherFadeIn', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'LoadCustomWeatherSpritePalette', ret: "void", arity: 1, params: "const u16 *palette" },
  { name: 'LoadDroughtWeatherPalette', ret: "void", arity: 2, params: "u8 *palsIndex, u8 *palsOffset" },
  { name: 'ResetDroughtWeatherPaletteLoading', ret: "void", arity: 0, params: "void" },
  { name: 'LoadDroughtWeatherPalettes', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetDroughtColorMap', ret: "void", arity: 1, params: "s8 colorMapIndex" },
  { name: 'DroughtStateInit', ret: "void", arity: 0, params: "void" },
  { name: 'DroughtStateRun', ret: "void", arity: 0, params: "void" },
  { name: 'Weather_SetBlendCoeffs', ret: "void", arity: 2, params: "u8 eva, u8 evb" },
  { name: 'Weather_SetTargetBlendCoeffs', ret: "void", arity: 3, params: "u8 eva, u8 evb, int delay" },
  { name: 'Weather_UpdateBlend', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetFieldWeather', ret: "UNUSED", arity: 1, params: "u8 weather" },
  { name: 'GetCurrentWeather', ret: "u8", arity: 0, params: "void" },
  { name: 'SetRainStrengthFromSoundEffect', ret: "void", arity: 1, params: "u16 soundEffect" },
  { name: 'PlayRainStoppingSoundEffect', ret: "void", arity: 0, params: "void" },
  { name: 'IsWeatherChangeComplete', ret: "u8", arity: 0, params: "void" },
  { name: 'SetWeatherScreenFadeOut', ret: "void", arity: 0, params: "void" },
  { name: 'SetWeatherPalStateIdle', ret: "void", arity: 0, params: "void" },
  { name: 'PreservePaletteInWeather', ret: "void", arity: 1, params: "u8 preservedPalIndex" },
  { name: 'ResetPreservedPalettesInWeather', ret: "void", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_WeatherInit',
  'Task_WeatherMain',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'constants/songs.h',
  'constants/weather.h',
  'constants/rgb.h',
  'util.h',
  'event_object_movement.h',
  'field_weather.h',
  'main.h',
  'menu.h',
  'palette.h',
  'random.h',
  'script.h',
  'start_menu.h',
  'sound.h',
  'sprite.h',
  'task.h',
  'trig.h',
  'gpu_regs.h',
] as const;
