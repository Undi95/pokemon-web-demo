// AUTO-GENERATED from src/coord_event_weather.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/coord_event_weather.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CoordEventWeather_Clouds', ret: "void", arity: 0, params: "void" },
  { name: 'CoordEventWeather_Sunny', ret: "void", arity: 0, params: "void" },
  { name: 'CoordEventWeather_Rain', ret: "void", arity: 0, params: "void" },
  { name: 'CoordEventWeather_Snow', ret: "void", arity: 0, params: "void" },
  { name: 'CoordEventWeather_Thunderstorm', ret: "void", arity: 0, params: "void" },
  { name: 'CoordEventWeather_HorizontalFog', ret: "void", arity: 0, params: "void" },
  { name: 'CoordEventWeather_DiagonalFog', ret: "void", arity: 0, params: "void" },
  { name: 'CoordEventWeather_Ash', ret: "void", arity: 0, params: "void" },
  { name: 'CoordEventWeather_Sandstorm', ret: "void", arity: 0, params: "void" },
  { name: 'CoordEventWeather_Shade', ret: "void", arity: 0, params: "void" },
  { name: 'CoordEventWeather_Drought', ret: "void", arity: 0, params: "void" },
  { name: 'CoordEventWeather_Route119Cycle', ret: "void", arity: 0, params: "void" },
  { name: 'CoordEventWeather_Route123Cycle', ret: "void", arity: 0, params: "void" },
  { name: 'DoCoordEventWeather', ret: "void", arity: 1, params: "u8 coordEventWeather" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'constants/weather.h',
  'coord_event_weather.h',
  'field_weather.h',
] as const;
