// AUTO-GENERATED from src/wild_encounter.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/wild_encounter.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MAX_ENCOUNTER_RATE = 2880;
export const NUM_FEEBAS_SPOTS = 6;
export const NUM_FISHING_SPOTS_1 = 131;
export const NUM_FISHING_SPOTS_2 = 167;
export const NUM_FISHING_SPOTS_3 = 149;
/** Raw expr: `(NUM_FISHING_SPOTS_1 + NUM_FISHING_SPOTS_2 + NUM_FISHING_SPOTS_3)` */
export const NUM_FISHING_SPOTS_EXPR = "(NUM_FISHING_SPOTS_1 + NUM_FISHING_SPOTS_2 + NUM_FISHING_SPOTS_3)";
/** Raw expr: `(1 << 0)` */
export const WILD_CHECK_REPEL_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 1)` */
export const WILD_CHECK_KEEN_EYE_EXPR = "(1 << 1)";
export const HEADER_NONE = 65535;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_WILD_0 = {
  WILD_AREA_LAND: 0,
  WILD_AREA_WATER: 1,
  WILD_AREA_ROCKS: 2,
  WILD_AREA_FISHING: 3,
} as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sWildEncountersDisabled', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u32", name: 'sFeebasRngValue', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'FeebasRandom', ret: "u16", arity: 0, params: "void" },
  { name: 'FeebasSeedRng', ret: "void", arity: 1, params: "u16 seed" },
  { name: 'IsWildLevelAllowedByRepel', ret: "bool8", arity: 1, params: "u8 level" },
  { name: 'ApplyFluteEncounterRateMod', ret: "void", arity: 1, params: "u32 *encRate" },
  { name: 'ApplyCleanseTagEncounterRateMod', ret: "void", arity: 1, params: "u32 *encRate" },
  { name: 'TryGetAbilityInfluencedWildMonIndex', ret: "bool8", arity: 5, params: "const struct WildPokemon *wildMon, u8 type, u8 ability, u8 *monIndex, u32 size" },
  { name: 'IsAbilityAllowingEncounter', ret: "bool8", arity: 1, params: "u8 level" },
  { name: 'DisableWildEncounters', ret: "void", arity: 1, params: "bool8 disabled" },
  { name: 'GetFeebasFishingSpotId', ret: "u16", arity: 3, params: "s16 targetX, s16 targetY, u8 section" },
  { name: 'CheckFeebas', ret: "bool8", arity: 0, params: "void" },
  { name: 'ChooseWildMonIndex_Land', ret: "u8", arity: 0, params: "void" },
  { name: 'ChooseWildMonIndex_WaterRock', ret: "u8", arity: 0, params: "void" },
  { name: 'ChooseWildMonIndex_Fishing', ret: "u8", arity: 1, params: "u8 rod" },
  { name: 'ChooseWildMonLevel', ret: "u8", arity: 1, params: "const struct WildPokemon *wildPokemon" },
  { name: 'GetCurrentMapWildMonHeaderId', ret: "u16", arity: 0, params: "void" },
  { name: 'PickWildMonNature', ret: "u8", arity: 0, params: "void" },
  { name: 'CreateWildMon', ret: "void", arity: 2, params: "u16 species, u8 level" },
  { name: 'TryGenerateWildMon', ret: "bool8", arity: 3, params: "const struct WildPokemonInfo *wildMonInfo, u8 area, u8 flags" },
  { name: 'GenerateFishingWildMon', ret: "u16", arity: 2, params: "const struct WildPokemonInfo *wildMonInfo, u8 rod" },
  { name: 'SetUpMassOutbreakEncounter', ret: "bool8", arity: 1, params: "u8 flags" },
  { name: 'DoMassOutbreakEncounterTest', ret: "bool8", arity: 0, params: "void" },
  { name: 'EncounterOddsCheck', ret: "bool8", arity: 1, params: "u16 encounterRate" },
  { name: 'WildEncounterCheck', ret: "bool8", arity: 2, params: "u32 encounterRate, bool8 ignoreAbility" },
  { name: 'AllowWildCheckOnNewMetatile', ret: "bool8", arity: 0, params: "void" },
  { name: 'AreLegendariesInSootopolisPreventingEncounters', ret: "bool8", arity: 0, params: "void" },
  { name: 'StandardWildEncounter', ret: "bool8", arity: 2, params: "u16 curMetatileBehavior, u16 prevMetatileBehavior" },
  { name: 'RockSmashWildEncounter', ret: "void", arity: 0, params: "void" },
  { name: 'SweetScentWildEncounter', ret: "bool8", arity: 0, params: "void" },
  { name: 'DoesCurrentMapHaveFishingMons', ret: "bool8", arity: 0, params: "void" },
  { name: 'FishingWildEncounter', ret: "void", arity: 1, params: "u8 rod" },
  { name: 'GetLocalWildMon', ret: "u16", arity: 1, params: "bool8 *isWaterMon" },
  { name: 'GetLocalWaterMon', ret: "u16", arity: 0, params: "void" },
  { name: 'UpdateRepelCounter', ret: "bool8", arity: 0, params: "void" },
  { name: 'TryGetRandomWildMonIndexByType', ret: "bool8", arity: 4, params: "const struct WildPokemon *wildMon, u8 type, u8 numMon, u8 *monIndex" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_setup.h',
  'battle_pike.h',
  'battle_pyramid.h',
  'event_data.h',
  'fieldmap.h',
  'field_player_avatar.h',
  'link.h',
  'metatile_behavior.h',
  'overworld.h',
  'pokeblock.h',
  'pokemon.h',
  'random.h',
  'roamer.h',
  'safari_zone.h',
  'script.h',
  'tv.h',
  'wild_encounter.h',
  'constants/abilities.h',
  'constants/game_stat.h',
  'constants/items.h',
  'constants/layouts.h',
  'constants/weather.h',
  'data/wild_encounters.h',
] as const;
