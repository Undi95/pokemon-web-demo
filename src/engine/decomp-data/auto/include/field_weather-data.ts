// AUTO-GENERATED from include/field_weather.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/field_weather.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_WEATHER_START = 4608;
export const NUM_WEATHER_COLOR_MAPS = 19;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_GFXTAG_0 = {
  GFXTAG_CLOUD: 0,
  GFXTAG_FOG_H: 1,
  GFXTAG_ASH: 2,
  GFXTAG_FOG_D: 3,
  GFXTAG_SANDSTORM: 4,
  GFXTAG_BUBBLE: 5,
  GFXTAG_RAIN: 6,
} as const;
export const ENUM_PALTAG_1 = {
  PALTAG_WEATHER: 0,
  PALTAG_WEATHER_2: 1,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'StartWeather', ret: "void", arity: 0, params: "void" },
  { name: 'SetNextWeather', ret: "void", arity: 1, params: "u8 weather" },
  { name: 'SetCurrentAndNextWeather', ret: "void", arity: 1, params: "u8 weather" },
  { name: 'SetCurrentAndNextWeatherNoDelay', ret: "void", arity: 1, params: "u8 weather" },
  { name: 'ApplyWeatherColorMapIfIdle', ret: "void", arity: 1, params: "s8 colorMapIndex" },
  { name: 'ApplyWeatherColorMapIfIdle_Gradual', ret: "void", arity: 3, params: "u8 colorMapIndex, u8 targetColorMapIndex, u8 colorMapStepDelay" },
  { name: 'FadeScreen', ret: "void", arity: 2, params: "u8 mode, s8 delay" },
  { name: 'IsWeatherNotFadingIn', ret: "bool8", arity: 0, params: "void" },
  { name: 'UpdateSpritePaletteWithWeather', ret: "void", arity: 1, params: "u8 spritePaletteIndex" },
  { name: 'ApplyWeatherColorMapToPal', ret: "void", arity: 1, params: "u8 paletteIndex" },
  { name: 'LoadCustomWeatherSpritePalette', ret: "void", arity: 1, params: "const u16 *palette" },
  { name: 'ResetDroughtWeatherPaletteLoading', ret: "void", arity: 0, params: "void" },
  { name: 'LoadDroughtWeatherPalettes', ret: "bool8", arity: 0, params: "void" },
  { name: 'DroughtStateInit', ret: "void", arity: 0, params: "void" },
  { name: 'DroughtStateRun', ret: "void", arity: 0, params: "void" },
  { name: 'Weather_SetBlendCoeffs', ret: "void", arity: 2, params: "u8 eva, u8 evb" },
  { name: 'Weather_SetTargetBlendCoeffs', ret: "void", arity: 3, params: "u8 eva, u8 evb, int delay" },
  { name: 'Weather_UpdateBlend', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetCurrentWeather', ret: "u8", arity: 0, params: "void" },
  { name: 'SetRainStrengthFromSoundEffect', ret: "void", arity: 1, params: "u16 soundEffect" },
  { name: 'PlayRainStoppingSoundEffect', ret: "void", arity: 0, params: "void" },
  { name: 'IsWeatherChangeComplete', ret: "u8", arity: 0, params: "void" },
  { name: 'SetWeatherScreenFadeOut', ret: "void", arity: 0, params: "void" },
  { name: 'SetWeatherPalStateIdle', ret: "void", arity: 0, params: "void" },
  { name: 'PreservePaletteInWeather', ret: "void", arity: 1, params: "u8 preservedPalIndex" },
  { name: 'ResetPreservedPalettesInWeather', ret: "void", arity: 0, params: "void" },
  { name: 'Clouds_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'Clouds_Main', ret: "void", arity: 0, params: "void" },
  { name: 'Clouds_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'Clouds_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'Sunny_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'Sunny_Main', ret: "void", arity: 0, params: "void" },
  { name: 'Sunny_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'Sunny_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'Rain_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'Rain_Main', ret: "void", arity: 0, params: "void" },
  { name: 'Rain_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'Rain_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'Snow_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'Snow_Main', ret: "void", arity: 0, params: "void" },
  { name: 'Snow_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'Snow_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'Thunderstorm_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'Thunderstorm_Main', ret: "void", arity: 0, params: "void" },
  { name: 'Thunderstorm_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'Thunderstorm_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'FogHorizontal_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'FogHorizontal_Main', ret: "void", arity: 0, params: "void" },
  { name: 'FogHorizontal_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'FogHorizontal_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'Ash_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'Ash_Main', ret: "void", arity: 0, params: "void" },
  { name: 'Ash_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'Ash_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'Sandstorm_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'Sandstorm_Main', ret: "void", arity: 0, params: "void" },
  { name: 'Sandstorm_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'Sandstorm_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'FogDiagonal_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'FogDiagonal_Main', ret: "void", arity: 0, params: "void" },
  { name: 'FogDiagonal_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'FogDiagonal_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'Shade_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'Shade_Main', ret: "void", arity: 0, params: "void" },
  { name: 'Shade_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'Shade_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'Drought_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'Drought_Main', ret: "void", arity: 0, params: "void" },
  { name: 'Drought_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'Drought_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'Downpour_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'Downpour_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'Bubbles_InitVars', ret: "void", arity: 0, params: "void" },
  { name: 'Bubbles_Main', ret: "void", arity: 0, params: "void" },
  { name: 'Bubbles_InitAll', ret: "void", arity: 0, params: "void" },
  { name: 'Bubbles_Finish', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetSavedWeather', ret: "u8", arity: 0, params: "void" },
  { name: 'SetSavedWeather', ret: "void", arity: 1, params: "u32 weather" },
  { name: 'SetSavedWeatherFromCurrMapHeader', ret: "void", arity: 0, params: "void" },
  { name: 'SetWeather', ret: "void", arity: 1, params: "u32 weather" },
  { name: 'DoCurrentWeather', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateWeatherPerDay', ret: "void", arity: 1, params: "u16 increment" },
  { name: 'ResumePausedWeather', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'sprite.h',
  'constants/field_weather.h',
] as const;
