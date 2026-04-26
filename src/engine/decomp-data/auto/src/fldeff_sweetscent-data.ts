// AUTO-GENERATED from src/fldeff_sweetscent.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/fldeff_sweetscent.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'FieldCallback_SweetScent', ret: "void", arity: 0, params: "void" },
  { name: 'StartSweetScentFieldEffect', ret: "void", arity: 0, params: "void" },
  { name: 'TrySweetScentEncounter', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'FailSweetScentEncounter', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetUpFieldMove_SweetScent', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_SweetScent', ret: "bool8", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'event_data.h',
  'event_scripts.h',
  'field_effect.h',
  'field_player_avatar.h',
  'field_screen_effect.h',
  'field_weather.h',
  'fldeff.h',
  'mirage_tower.h',
  'palette.h',
  'party_menu.h',
  'script.h',
  'sound.h',
  'sprite.h',
  'task.h',
  'wild_encounter.h',
  'constants/field_effects.h',
  'constants/rgb.h',
  'constants/songs.h',
] as const;
