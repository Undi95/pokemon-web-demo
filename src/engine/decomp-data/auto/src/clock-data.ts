// AUTO-GENERATED from src/clock.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/clock.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'UpdatePerDay', ret: "void", arity: 1, params: "struct Time *localTime" },
  { name: 'UpdatePerMinute', ret: "void", arity: 1, params: "struct Time *localTime" },
  { name: 'InitTimeBasedEvents', ret: "void", arity: 0, params: "void" },
  { name: 'DoTimeBasedEvents', ret: "void", arity: 0, params: "void" },
  { name: 'ReturnFromStartWallClock', ret: "void", arity: 0, params: "void" },
  { name: 'StartWallClock', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'berry.h',
  'dewford_trend.h',
  'event_data.h',
  'field_specials.h',
  'field_weather.h',
  'main.h',
  'lottery_corner.h',
  'overworld.h',
  'rtc.h',
  'time_events.h',
  'tv.h',
  'wallclock.h',
] as const;
