// AUTO-GENERATED from src/battle_tv.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_tv.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `((u16)-1)` */
export const TABLE_END_EXPR = "((u16)-1)";
/** Raw expr: `arg1` */
export const move_EXPR = "arg1";
/** Raw expr: `arg1` */
export const type_EXPR = "arg1";
/** Raw expr: `arg2` */
export const power_EXPR = "arg2";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_PTS_0 = {
  PTS_MOVE_EFFECT: 0,
  PTS_EFFECTIVENESS: 1,
  PTS_SET_UP: 2,
  PTS_RAIN: 3,
  PTS_SUN: 4,
  PTS_SANDSTORM: 5,
  PTS_HAIL: 6,
  PTS_ELECTRIC: 7,
  PTS_STATUS_DMG: 8,
  PTS_STATUS: 9,
  PTS_SPIKES: 10,
  PTS_WATER_SPORT: 11,
  PTS_MUD_SPORT: 12,
  PTS_REFLECT: 13,
  PTS_LIGHT_SCREEN: 14,
  PTS_SAFEGUARD: 15,
  PTS_MIST: 16,
  PTS_BREAK_WALL: 17,
  PTS_CRITICAL_HIT: 18,
  PTS_FAINT: 19,
  PTS_FAINT_SET_UP: 20,
  PTS_FLINCHED: 21,
  PTS_STAT_INCREASE_1: 22,
  PTS_STAT_INCREASE_2: 23,
  PTS_STAT_DECREASE_SELF: 24,
  PTS_STAT_DECREASE_1: 25,
  PTS_STAT_DECREASE_2: 26,
  PTS_STAT_INCREASE_NOT_SELF: 27,
} as const;
export const ENUM_FNT_1 = {
  FNT_NONE: 0,
  FNT_CURSE: 1,
  FNT_LEECH_SEED: 2,
  FNT_POISON: 3,
  FNT_BURN: 4,
  FNT_NIGHTMARE: 5,
  FNT_WRAP: 6,
  FNT_SPIKES: 7,
  FNT_FUTURE_SIGHT: 8,
  FNT_DOOM_DESIRE: 9,
  FNT_PERISH_SONG: 10,
  FNT_DESTINY_BOND: 11,
  FNT_CONFUSION: 12,
  FNT_EXPLOSION: 13,
  FNT_RECOIL: 14,
  FNT_OTHER: 15,
} as const;

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sPoints_Effectiveness: readonly number[] = [4,-3,-6] as const;
export const sPoints_SetUp: readonly number[] = [4,4,6,6,7,6,2] as const;
export const sPoints_StatusDmg: readonly number[] = [5,3,3,3,3,3,3] as const;
export const sPoints_Status: readonly number[] = [5,5,5,5,5] as const;
export const sPoints_Spikes: readonly number[] = [4] as const;
export const sPoints_WaterSport: readonly number[] = [5] as const;
export const sPoints_MudSport: readonly number[] = [5] as const;
export const sPoints_Reflect: readonly number[] = [3] as const;
export const sPoints_LightScreen: readonly number[] = [3] as const;
export const sPoints_Safeguard: readonly number[] = [4] as const;
export const sPoints_Mist: readonly number[] = [3] as const;
export const sPoints_BreakWall: readonly number[] = [6] as const;
export const sPoints_CriticalHit: readonly number[] = [6] as const;
export const sPoints_Faint: readonly number[] = [6] as const;
export const sPoints_Flinched: readonly number[] = [4] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'IsNotSpecialBattleString', ret: "bool8", arity: 1, params: "u16 stringId" },
  { name: 'AddMovePoints', ret: "void", arity: 4, params: "u8 caseId, u16 arg1, u8 arg2, u8 arg3" },
  { name: 'TrySetBattleSeminarShow', ret: "void", arity: 0, params: "void" },
  { name: 'AddPointsOnFainting', ret: "void", arity: 1, params: "bool8 targetFainted" },
  { name: 'AddPointsBasedOnWeather', ret: "void", arity: 3, params: "u16 weatherFlags, u16 move, u8 moveSlot" },
  { name: 'ShouldCalculateDamage', ret: "bool8", arity: 3, params: "u16 move, s32 *dmg, u16 *powerOverride" },
  { name: 'BattleTv_SetDataBasedOnString', ret: "void", arity: 1, params: "u16 stringId" },
  { name: 'BattleTv_SetDataBasedOnMove', ret: "void", arity: 3, params: "u16 move, u16 weatherFlags, struct DisableStruct *disableStructPtr" },
  { name: 'BattleTv_SetDataBasedOnAnimation', ret: "void", arity: 1, params: "u8 animationId" },
  { name: 'TryPutLinkBattleTvShowOnAir', ret: "void", arity: 0, params: "void" },
  { name: 'BattleTv_ClearExplosionFaintCause', ret: "void", arity: 0, params: "void" },
  { name: 'GetBattlerMoveSlotId', ret: "u8", arity: 2, params: "u8 battler, u16 move" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'pokemon.h',
  'battle.h',
  'battle_anim.h',
  'battle_tv.h',
  'constants/battle_string_ids.h',
  'constants/battle_anim.h',
  'constants/moves.h',
  'battle_message.h',
  'tv.h',
  'constants/battle_move_effects.h',
] as const;
