/**
 * battle_tv.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/battle_tv.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/battle_tv.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */

import { gBattleTextBuff1, gBattleTextBuff2 } from '../include/battle_message';
import { gBattleMsgDataPtr } from './battle_message';
import { setBattleMoveDamage, setCurrentMove } from './engine/battle/state';
import { BIT_SIDE, B_SIDE_OPPONENT, B_SIDE_PLAYER } from '../include/constants/battle';
import { B_ANIM_DOOM_DESIRE_HIT, B_ANIM_FUTURE_SIGHT_HIT } from '../include/constants/battle_anim';
import { STRINGID_ATTACKERFAINTED, STRINGID_ATTACKERSSTATFELL, STRINGID_ATTACKERSSTATROSE, STRINGID_CRITICALHIT, STRINGID_DEFENDERSSTATFELL, STRINGID_DEFENDERSSTATROSE, STRINGID_ELECTRICITYWEAKENED, STRINGID_FAINTINTHREE, STRINGID_FIREWEAKENED, STRINGID_ITDOESNTAFFECT, STRINGID_ITHURTCONFUSION, STRINGID_NOTVERYEFFECTIVE, STRINGID_PKMNABSORBEDNUTRIENTS, STRINGID_PKMNAFFLICTEDBYCURSE, STRINGID_PKMNANCHOREDITSELF, STRINGID_PKMNBADLYPOISONED, STRINGID_PKMNBLEWAWAYSPIKES, STRINGID_PKMNCHOSEXASDESTINY, STRINGID_PKMNCLAMPED, STRINGID_PKMNCOVEREDBYVEIL, STRINGID_PKMNCRASHED, STRINGID_PKMNFASTASLEEP, STRINGID_PKMNFELLASLEEP, STRINGID_PKMNFELLINLOVE, STRINGID_PKMNFELLINTONIGHTMARE, STRINGID_PKMNFLINCHED, STRINGID_PKMNFORESAWATTACK, STRINGID_PKMNHITWITHRECOIL, STRINGID_PKMNHURTBY, STRINGID_PKMNHURTBYBURN, STRINGID_PKMNHURTBYPOISON, STRINGID_PKMNHURTBYSPIKES, STRINGID_PKMNIMMOBILIZEDBYLOVE, STRINGID_PKMNISFROZEN, STRINGID_PKMNISPARALYZED, STRINGID_PKMNLAIDCURSE, STRINGID_PKMNLOCKEDINNIGHTMARE, STRINGID_PKMNLOSTPPGRUDGE, STRINGID_PKMNPERISHCOUNTFELL, STRINGID_PKMNPLANTEDROOTS, STRINGID_PKMNPROTECTEDBYMIST, STRINGID_PKMNRAISEDDEF, STRINGID_PKMNRAISEDDEFALITTLE, STRINGID_PKMNRAISEDSPDEF, STRINGID_PKMNRAISEDSPDEFALITTLE, STRINGID_PKMNSAFEGUARDEXPIRED, STRINGID_PKMNSAPPEDBYLEECHSEED, STRINGID_PKMNSEEDED, STRINGID_PKMNSHROUDEDINMIST, STRINGID_PKMNSQUEEZEDBYBIND, STRINGID_PKMNSXWOREOFF, STRINGID_PKMNTOOKFOE, STRINGID_PKMNTRANSFORMEDINTO, STRINGID_PKMNTRAPPEDBYSANDTOMB, STRINGID_PKMNTRAPPEDINVORTEX, STRINGID_PKMNTRYINGTOTAKEFOE, STRINGID_PKMNUSEDSAFEGUARD, STRINGID_PKMNWANTSGRUDGE, STRINGID_PKMNWASBURNED, STRINGID_PKMNWASCONFUSED, STRINGID_PKMNWASFROZEN, STRINGID_PKMNWASPARALYZED, STRINGID_PKMNWASPOISONED, STRINGID_PKMNWISHCAMETRUE, STRINGID_PKMNWRAPPEDBY, STRINGID_RETURNMON, STRINGID_SPIKESSCATTERED, STRINGID_STATHARSHLY, STRINGID_STATSHARPLY, STRINGID_SUPEREFFECTIVE, STRINGID_TARGETFAINTED, STRINGID_THEWALLSHATTERED } from '../include/constants/battle_string_ids';
import { MAX_MON_MOVES, PARTY_SIZE } from '../include/constants/global';
import { MOVE_BIDE, MOVE_BLAST_BURN, MOVE_BLAZE_KICK, MOVE_BUBBLE, MOVE_BUBBLE_BEAM, MOVE_CLAMP, MOVE_COUNTER, MOVE_CRABHAMMER, MOVE_DIVE, MOVE_DREAM_EATER, MOVE_EMBER, MOVE_ENDEAVOR, MOVE_ERUPTION, MOVE_EXPLOSION, MOVE_FIRE_BLAST, MOVE_FIRE_PUNCH, MOVE_FIRE_SPIN, MOVE_FISSURE, MOVE_FLAIL, MOVE_FLAMETHROWER, MOVE_FLAME_WHEEL, MOVE_FOCUS_PUNCH, MOVE_FRUSTRATION, MOVE_GUILLOTINE, MOVE_HEAT_WAVE, MOVE_HIDDEN_POWER, MOVE_HORN_DRILL, MOVE_HYDRO_CANNON, MOVE_HYDRO_PUMP, MOVE_LIGHT_SCREEN, MOVE_MAGNITUDE, MOVE_MIRROR_COAT, MOVE_MIST, MOVE_MOONLIGHT, MOVE_MORNING_SUN, MOVE_MUDDY_WATER, MOVE_NONE, MOVE_OCTAZOOKA, MOVE_OVERHEAT, MOVE_PAIN_SPLIT, MOVE_PRESENT, MOVE_PSYWAVE, MOVE_REFLECT, MOVE_RETURN, MOVE_REVENGE, MOVE_REVERSAL, MOVE_SACRED_FIRE, MOVE_SELF_DESTRUCT, MOVE_SHEER_COLD, MOVE_SHOCK_WAVE, MOVE_SLEEP_TALK, MOVE_SNORE, MOVE_SOLAR_BEAM, MOVE_SPARK, MOVE_SURF, MOVE_SYNTHESIS, MOVE_THUNDER, MOVE_THUNDERBOLT, MOVE_THUNDER_PUNCH, MOVE_THUNDER_SHOCK, MOVE_THUNDER_WAVE, MOVE_VOLT_TACKLE, MOVE_WATERFALL, MOVE_WATER_GUN, MOVE_WATER_PULSE, MOVE_WATER_SPORT, MOVE_WATER_SPOUT, MOVE_WEATHER_BALL, MOVE_WHIRLPOOL, MOVE_WISH, MOVE_WITHDRAW, MOVE_ZAP_CANNON } from '../include/constants/moves';
import { DEFAULT_STAT_STAGE, STAT_ACC, STAT_EVASION, TYPE_ELECTRIC, TYPE_FIRE } from '../include/constants/pokemon';
import { SPECIES_NONE } from '../include/constants/species';
import { MON_DATA_EXP, MON_DATA_HP, MON_DATA_IS_EGG, MON_DATA_MOVE1, MON_DATA_SPECIES } from '../include/pokemon';
import { GetBattlerPosition } from './battle_anim_mons';
import { gBattleScripting } from './battle_controllers';
import { BATTLESTRINGS_TABLE_START } from './battle_message';
import { TypeCalc } from './battle_script_commands';
import { BATTLE_TYPE_DOUBLE, BATTLE_TYPE_LINK, BATTLE_TYPE_MULTI, BATTLE_TYPE_PALACE, BATTLE_TYPE_PIKE, BATTLE_TYPE_PYRAMID, BATTLE_TYPE_RECORDED_LINK, B_WEATHER_HAIL, B_WEATHER_RAIN, B_WEATHER_SANDSTORM, B_WEATHER_SUN, GET_BATTLER_SIDE, IS_TYPE_PHYSICAL, MOVE_RESULT_NO_EFFECT, MULTI_PARTY_SIZE, STATUS3_CHARGED_UP } from './engine/battle/constants';
import { GetMonData } from './engine/battle/party-storage';
import { gBattleMons, gBattleMoveDamage, gBattleStruct, gBattleTypeFlags, gBattlerAttacker, gBattlerPartyIndexes, gBattlerTarget, gCurrentMove, gEffectBattler, gMoveSelectionCursor, gProtectStructs, gSideStatuses, gStatuses3 } from './engine/battle/state';
import { getBattleMove } from './engine/battle/data/battle-moves';
const GetBattlerSide = GET_BATTLER_SIDE; // 1:1 battle_util.c:GetBattlerSide = battler & BIT_SIDE
const SHRT_MAX = 32767; // 1:1 limits.h
// DETTE LINK (exemption hardware) : TryPutLinkBattleTvShowOnAir = link multi only.
const GetLinkTrainerFlankId = (_id: number): number => 0;
const GetOpposingLinkMultiBattlerId = (_flank: number, _id: number): number => 0;
import { CalculateBaseDamage, gEnemyParty, gPlayerParty } from './pokemon';
import { PutBattleUpdateOnTheAir, TryPutBattleSeminarOnAir } from './tv';
import type { Pokemon } from './engine/battle/party-storage';
import type { BattleTv, BattleTvMovePoints, DisableStruct } from './engine/battle/state';

// this file's functions

const TABLE_END = 0xFFFF; // 1:1 battle_tv.c:21 ((u16)-1)

// enum battle_tv.c:23
const PTS_MOVE_EFFECT = 0;
const PTS_EFFECTIVENESS = 1;
const PTS_SET_UP = 2;
// Broadly. Used by Wish, Future Sight, Ingrain, etc.
const PTS_RAIN = 3;
const PTS_SUN = 4;
const PTS_SANDSTORM = 5;
const PTS_HAIL = 6;
const PTS_ELECTRIC = 7;
const PTS_STATUS_DMG = 8;
const PTS_STATUS = 9;
const PTS_SPIKES = 10;
const PTS_WATER_SPORT = 11;
const PTS_MUD_SPORT = 12;
const PTS_REFLECT = 13;
const PTS_LIGHT_SCREEN = 14;
const PTS_SAFEGUARD = 15;
const PTS_MIST = 16;
const PTS_BREAK_WALL = 17;
const PTS_CRITICAL_HIT = 18;
const PTS_FAINT = 19;
const PTS_FAINT_SET_UP = 20;
const PTS_FLINCHED = 21;
const PTS_STAT_INCREASE_1 = 22;
const PTS_STAT_INCREASE_2 = 23;
const PTS_STAT_DECREASE_SELF = 24;
const PTS_STAT_DECREASE_1 = 25;
const PTS_STAT_DECREASE_2 = 26;
const PTS_STAT_INCREASE_NOT_SELF = 27;

// enum battle_tv.c:54
const FNT_NONE = 0;
const FNT_CURSE = 1;
const FNT_LEECH_SEED = 2;
const FNT_POISON = 3;
const FNT_BURN = 4;
const FNT_NIGHTMARE = 5;
const FNT_WRAP = 6;
const FNT_SPIKES = 7;
const FNT_FUTURE_SIGHT = 8;
const FNT_DOOM_DESIRE = 9;
const FNT_PERISH_SONG = 10;
const FNT_DESTINY_BOND = 11;
const FNT_CONFUSION = 12;
const FNT_EXPLOSION = 13;
const FNT_RECOIL = 14;
const FNT_OTHER = 15;

// const rom data

/** 1:1 (battle_tv.c:74) */
const sVariableDmgMoves = Uint16Array.from([
  MOVE_COUNTER,
  MOVE_FISSURE,
  MOVE_BIDE,
  MOVE_MIRROR_COAT,
  MOVE_HORN_DRILL,
  MOVE_FLAIL,
  MOVE_REVERSAL,
  MOVE_HIDDEN_POWER,
  MOVE_SHEER_COLD,
  MOVE_FOCUS_PUNCH,
  MOVE_ERUPTION,
  MOVE_WATER_SPOUT,
  MOVE_DREAM_EATER,
  MOVE_WEATHER_BALL,
  MOVE_SNORE,
  MOVE_PAIN_SPLIT,
  MOVE_GUILLOTINE,
  MOVE_FRUSTRATION,
  MOVE_RETURN,
  MOVE_ENDEAVOR,
  MOVE_PRESENT,
  MOVE_REVENGE,
  TABLE_END,
  // those are handled by the function itself
  MOVE_MAGNITUDE,
  MOVE_PSYWAVE,
  TABLE_END,
]);

/** 1:1 (battle_tv.c:87) */
const sPoints_MoveEffect = Uint16Array.from([
  1, // [EFFECT_HIT]
  1, // [EFFECT_SLEEP]
  1, // [EFFECT_POISON_HIT]
  4, // [EFFECT_ABSORB]
  1, // [EFFECT_BURN_HIT]
  1, // [EFFECT_FREEZE_HIT]
  1, // [EFFECT_PARALYZE_HIT]
  0, // [EFFECT_EXPLOSION]
  5, // [EFFECT_DREAM_EATER]
  1, // [EFFECT_MIRROR_MOVE]
  1, // [EFFECT_ATTACK_UP]
  1, // [EFFECT_DEFENSE_UP]
  1, // [EFFECT_SPEED_UP]
  1, // [EFFECT_SPECIAL_ATTACK_UP]
  1, // [EFFECT_SPECIAL_DEFENSE_UP]
  1, // [EFFECT_ACCURACY_UP]
  1, // [EFFECT_EVASION_UP]
  2, // [EFFECT_ALWAYS_HIT]
  1, // [EFFECT_ATTACK_DOWN]
  1, // [EFFECT_DEFENSE_DOWN]
  1, // [EFFECT_SPEED_DOWN]
  1, // [EFFECT_SPECIAL_ATTACK_DOWN]
  1, // [EFFECT_SPECIAL_DEFENSE_DOWN]
  1, // [EFFECT_ACCURACY_DOWN]
  1, // [EFFECT_EVASION_DOWN]
  5, // [EFFECT_HAZE]
  5, // [EFFECT_BIDE]
  4, // [EFFECT_RAMPAGE]
  5, // [EFFECT_ROAR]
  1, // [EFFECT_MULTI_HIT]
  3, // [EFFECT_CONVERSION]
  1, // [EFFECT_FLINCH_HIT]
  3, // [EFFECT_RESTORE_HP]
  5, // [EFFECT_TOXIC]
  1, // [EFFECT_PAY_DAY]
  7, // [EFFECT_LIGHT_SCREEN]
  1, // [EFFECT_TRI_ATTACK]
  7, // [EFFECT_REST]
  7, // [EFFECT_OHKO]
  1, // [EFFECT_RAZOR_WIND]
  5, // [EFFECT_SUPER_FANG]
  2, // [EFFECT_DRAGON_RAGE]
  4, // [EFFECT_TRAP]
  1, // [EFFECT_HIGH_CRITICAL]
  1, // [EFFECT_DOUBLE_HIT]
  1, // [EFFECT_RECOIL_IF_MISS]
  5, // [EFFECT_MIST]
  1, // [EFFECT_FOCUS_ENERGY]
  2, // [EFFECT_RECOIL]
  4, // [EFFECT_CONFUSE]
  1, // [EFFECT_ATTACK_UP_2]
  1, // [EFFECT_DEFENSE_UP_2]
  1, // [EFFECT_SPEED_UP_2]
  1, // [EFFECT_SPECIAL_ATTACK_UP_2]
  1, // [EFFECT_SPECIAL_DEFENSE_UP_2]
  1, // [EFFECT_ACCURACY_UP_2]
  1, // [EFFECT_EVASION_UP_2]
  0, // [EFFECT_TRANSFORM]
  1, // [EFFECT_ATTACK_DOWN_2]
  1, // [EFFECT_DEFENSE_DOWN_2]
  1, // [EFFECT_SPEED_DOWN_2]
  1, // [EFFECT_SPECIAL_ATTACK_DOWN_2]
  1, // [EFFECT_SPECIAL_DEFENSE_DOWN_2]
  1, // [EFFECT_ACCURACY_DOWN_2]
  1, // [EFFECT_EVASION_DOWN_2]
  7, // [EFFECT_REFLECT]
  4, // [EFFECT_POISON]
  4, // [EFFECT_PARALYZE]
  1, // [EFFECT_ATTACK_DOWN_HIT]
  1, // [EFFECT_DEFENSE_DOWN_HIT]
  1, // [EFFECT_SPEED_DOWN_HIT]
  1, // [EFFECT_SPECIAL_ATTACK_DOWN_HIT]
  1, // [EFFECT_SPECIAL_DEFENSE_DOWN_HIT]
  1, // [EFFECT_ACCURACY_DOWN_HIT]
  1, // [EFFECT_EVASION_DOWN_HIT]
  4, // [EFFECT_SKY_ATTACK]
  1, // [EFFECT_CONFUSE_HIT]
  1, // [EFFECT_TWINEEDLE]
  1, // [EFFECT_VITAL_THROW]
  4, // [EFFECT_SUBSTITUTE]
  5, // [EFFECT_RECHARGE]
  2, // [EFFECT_RAGE]
  4, // [EFFECT_MIMIC]
  1, // [EFFECT_METRONOME]
  4, // [EFFECT_LEECH_SEED]
  1, // [EFFECT_SPLASH]
  7, // [EFFECT_DISABLE]
  2, // [EFFECT_LEVEL_DAMAGE]
  1, // [EFFECT_PSYWAVE]
  5, // [EFFECT_COUNTER]
  7, // [EFFECT_ENCORE]
  3, // [EFFECT_PAIN_SPLIT]
  3, // [EFFECT_SNORE]
  4, // [EFFECT_CONVERSION_2]
  3, // [EFFECT_LOCK_ON]
  3, // [EFFECT_SKETCH]
  3, // [EFFECT_UNUSED_60]
  3, // [EFFECT_SLEEP_TALK]
  3, // [EFFECT_DESTINY_BOND]
  2, // [EFFECT_FLAIL]
  4, // [EFFECT_SPITE]
  1, // [EFFECT_FALSE_SWIPE]
  5, // [EFFECT_HEAL_BELL]
  1, // [EFFECT_QUICK_ATTACK]
  1, // [EFFECT_TRIPLE_KICK]
  4, // [EFFECT_THIEF]
  5, // [EFFECT_MEAN_LOOK]
  3, // [EFFECT_NIGHTMARE]
  1, // [EFFECT_MINIMIZE]
  2, // [EFFECT_CURSE]
  1, // [EFFECT_UNUSED_6E]
  5, // [EFFECT_PROTECT]
  4, // [EFFECT_SPIKES]
  3, // [EFFECT_FORESIGHT]
  6, // [EFFECT_PERISH_SONG]
  4, // [EFFECT_SANDSTORM]
  3, // [EFFECT_ENDURE]
  3, // [EFFECT_ROLLOUT]
  3, // [EFFECT_SWAGGER]
  2, // [EFFECT_FURY_CUTTER]
  4, // [EFFECT_ATTRACT]
  1, // [EFFECT_RETURN]
  1, // [EFFECT_PRESENT]
  1, // [EFFECT_FRUSTRATION]
  5, // [EFFECT_SAFEGUARD]
  1, // [EFFECT_THAW_HIT]
  1, // [EFFECT_MAGNITUDE]
  7, // [EFFECT_BATON_PASS]
  2, // [EFFECT_PURSUIT]
  2, // [EFFECT_RAPID_SPIN]
  1, // [EFFECT_SONICBOOM]
  1, // [EFFECT_UNUSED_83]
  4, // [EFFECT_MORNING_SUN]
  4, // [EFFECT_SYNTHESIS]
  4, // [EFFECT_MOONLIGHT]
  1, // [EFFECT_HIDDEN_POWER]
  4, // [EFFECT_RAIN_DANCE]
  4, // [EFFECT_SUNNY_DAY]
  1, // [EFFECT_DEFENSE_UP_HIT]
  1, // [EFFECT_ATTACK_UP_HIT]
  1, // [EFFECT_ALL_STATS_UP_HIT]
  1, // [EFFECT_UNUSED_8D]
  7, // [EFFECT_BELLY_DRUM]
  7, // [EFFECT_PSYCH_UP]
  6, // [EFFECT_MIRROR_COAT]
  3, // [EFFECT_SKULL_BASH]
  1, // [EFFECT_TWISTER]
  1, // [EFFECT_EARTHQUAKE]
  1, // [EFFECT_FUTURE_SIGHT]
  1, // [EFFECT_GUST]
  1, // [EFFECT_FLINCH_MINIMIZE_HIT]
  1, // [EFFECT_SOLAR_BEAM]
  1, // [EFFECT_THUNDER]
  1, // [EFFECT_TELEPORT]
  2, // [EFFECT_BEAT_UP]
  3, // [EFFECT_SEMI_INVULNERABLE]
  1, // [EFFECT_DEFENSE_CURL]
  1, // [EFFECT_SOFTBOILED]
  4, // [EFFECT_FAKE_OUT]
  4, // [EFFECT_UPROAR]
  3, // [EFFECT_STOCKPILE]
  3, // [EFFECT_SPIT_UP]
  3, // [EFFECT_SWALLOW]
  1, // [EFFECT_UNUSED_A3]
  4, // [EFFECT_HAIL]
  7, // [EFFECT_TORMENT]
  7, // [EFFECT_FLATTER]
  5, // [EFFECT_WILL_O_WISP]
  7, // [EFFECT_MEMENTO]
  1, // [EFFECT_FACADE]
  7, // [EFFECT_FOCUS_PUNCH]
  1, // [EFFECT_SMELLINGSALT]
  5, // [EFFECT_FOLLOW_ME]
  0, // [EFFECT_NATURE_POWER]
  4, // [EFFECT_CHARGE]
  4, // [EFFECT_TAUNT]
  4, // [EFFECT_HELPING_HAND]
  4, // [EFFECT_TRICK]
  4, // [EFFECT_ROLE_PLAY]
  2, // [EFFECT_WISH]
  2, // [EFFECT_ASSIST]
  6, // [EFFECT_INGRAIN]
  3, // [EFFECT_SUPERPOWER]
  6, // [EFFECT_MAGIC_COAT]
  4, // [EFFECT_RECYCLE]
  4, // [EFFECT_REVENGE]
  2, // [EFFECT_BRICK_BREAK]
  5, // [EFFECT_YAWN]
  2, // [EFFECT_KNOCK_OFF]
  1, // [EFFECT_ENDEAVOR]
  1, // [EFFECT_ERUPTION]
  6, // [EFFECT_SKILL_SWAP]
  6, // [EFFECT_IMPRISON]
  6, // [EFFECT_REFRESH]
  1, // [EFFECT_GRUDGE]
  1, // [EFFECT_SNATCH]
  1, // [EFFECT_LOW_KICK]
  1, // [EFFECT_SECRET_POWER]
  2, // [EFFECT_DOUBLE_EDGE]
  6, // [EFFECT_TEETER_DANCE]
  1, // [EFFECT_BLAZE_KICK]
  4, // [EFFECT_MUD_SPORT]
  1, // [EFFECT_POISON_FANG]
  1, // [EFFECT_WEATHER_BALL]
  3, // [EFFECT_OVERHEAT]
  1, // [EFFECT_TICKLE]
  1, // [EFFECT_COSMIC_POWER]
  1, // [EFFECT_SKY_UPPERCUT]
  1, // [EFFECT_BULK_UP]
  1, // [EFFECT_POISON_TAIL]
  4, // [EFFECT_WATER_SPORT]
  1, // [EFFECT_CALM_MIND]
  1, // [EFFECT_DRAGON_DANCE]
  3, // [EFFECT_CAMOUFLAGE]
]);

/** 1:1 (battle_tv.c:305) */
const sPoints_Effectiveness = Uint16Array.from([
  4,
  // Super Effective
  -3,
  // Not Very Effective
  -6,
  // No Effect
]);

/** 1:1 (battle_tv.c:311) */
const sPoints_SetUp = Uint16Array.from([
  4,
  // Future Sight
  4,
  // Doom Desire
  6,
  6,
  // Wish
  7,
  // Grudge
  6,
  2,
  // Ingrain
]);

/** 1:1 (battle_tv.c:321) */
const sPoints_RainMoves = Uint16Array.from([
  MOVE_BUBBLE,
  3,
  MOVE_WHIRLPOOL,
  3,
  MOVE_OCTAZOOKA,
  3,
  MOVE_CLAMP,
  3,
  MOVE_WITHDRAW,
  3,
  MOVE_CRABHAMMER,
  3,
  MOVE_WATER_SPOUT,
  3,
  MOVE_DIVE,
  3,
  MOVE_WATERFALL,
  3,
  MOVE_MUDDY_WATER,
  3,
  MOVE_SURF,
  3,
  MOVE_HYDRO_CANNON,
  3,
  MOVE_HYDRO_PUMP,
  3,
  MOVE_BUBBLE_BEAM,
  3,
  MOVE_WATER_SPORT,
  0,
  // Unnecessary, unlisted moves are already given 0 points
  MOVE_WATER_GUN,
  3,
  MOVE_WATER_PULSE,
  3,
  MOVE_WEATHER_BALL,
  3,
  MOVE_THUNDER,
  3,
  MOVE_SOLAR_BEAM,
  -4,
  MOVE_OVERHEAT,
  -4,
  MOVE_FLAME_WHEEL,
  -4,
  MOVE_FLAMETHROWER,
  -4,
  MOVE_SACRED_FIRE,
  -4,
  MOVE_FIRE_BLAST,
  -4,
  MOVE_HEAT_WAVE,
  -4,
  MOVE_EMBER,
  -4,
  MOVE_BLAST_BURN,
  -4,
  MOVE_BLAZE_KICK,
  -4,
  MOVE_ERUPTION,
  -4,
  MOVE_FIRE_SPIN,
  -4,
  MOVE_FIRE_PUNCH,
  -4,
  MOVE_SOLAR_BEAM,
  -4,
  // Repeated
  TABLE_END,
  0,
]);

/** 1:1 (battle_tv.c:358) */
const sPoints_SunMoves = Uint16Array.from([
  MOVE_OVERHEAT,
  3,
  MOVE_FLAME_WHEEL,
  3,
  MOVE_FLAMETHROWER,
  3,
  MOVE_SACRED_FIRE,
  3,
  MOVE_FIRE_BLAST,
  3,
  MOVE_HEAT_WAVE,
  3,
  MOVE_EMBER,
  3,
  MOVE_BLAST_BURN,
  3,
  MOVE_BLAZE_KICK,
  3,
  MOVE_ERUPTION,
  3,
  MOVE_FIRE_SPIN,
  3,
  MOVE_FIRE_PUNCH,
  3,
  MOVE_SOLAR_BEAM,
  5,
  MOVE_SYNTHESIS,
  3,
  MOVE_MORNING_SUN,
  3,
  MOVE_MOONLIGHT,
  3,
  MOVE_WEATHER_BALL,
  3,
  TABLE_END,
  0,
]);

/** 1:1 (battle_tv.c:379) */
const sPoints_SandstormMoves = Uint16Array.from([
  MOVE_WEATHER_BALL,
  3,
  MOVE_SOLAR_BEAM,
  -3,
  TABLE_END,
  0,
]);

/** 1:1 (battle_tv.c:385) */
const sPoints_HailMoves = Uint16Array.from([
  MOVE_WEATHER_BALL,
  3,
  MOVE_SOLAR_BEAM,
  -3,
  TABLE_END,
  0,
]);

/** 1:1 (battle_tv.c:391) */
const sPoints_ElectricMoves = Uint16Array.from([
  MOVE_THUNDERBOLT,
  3,
  MOVE_THUNDER_PUNCH,
  3,
  MOVE_SPARK,
  3,
  MOVE_THUNDER_SHOCK,
  3,
  MOVE_ZAP_CANNON,
  3,
  MOVE_SHOCK_WAVE,
  3,
  MOVE_THUNDER_WAVE,
  0,
  // Unnecessary, unlisted moves are already given 0 points
  MOVE_THUNDER,
  3,
  MOVE_VOLT_TACKLE,
  3,
  TABLE_END,
  0,
]);

/** 1:1 (battle_tv.c:404) */
const sPoints_StatusDmg = Uint16Array.from([
  5,
  // Curse
  3,
  // Leech Seed
  3,
  // Poison
  3,
  // Toxic
  3,
  // Burn
  3,
  // Nightmare
  3,
  // Wrap (Trapping move)
]);

/** 1:1 (battle_tv.c:414) */
const sPoints_Status = Uint16Array.from([
  5,
  // Attraction
  5,
  // Confusion
  5,
  // Paralysis
  5,
  // Sleep
  5,
  // Freeze
]);

/** 1:1 (battle_tv.c:423) */
const sPoints_Spikes = Uint16Array.from([
  4,
]);

/** 1:1 (battle_tv.c:424) */
const sPoints_WaterSport = Uint16Array.from([
  5,
]);

/** 1:1 (battle_tv.c:425) */
const sPoints_MudSport = Uint16Array.from([
  5,
]);

/** 1:1 (battle_tv.c:426) */
const sPoints_Reflect = Uint16Array.from([
  3,
]);

/** 1:1 (battle_tv.c:427) */
const sPoints_LightScreen = Uint16Array.from([
  3,
]);

/** 1:1 (battle_tv.c:428) */
const sPoints_Safeguard = Uint16Array.from([
  4,
]);

/** 1:1 (battle_tv.c:429) */
const sPoints_Mist = Uint16Array.from([
  3,
]);

/** 1:1 (battle_tv.c:430) */
const sPoints_BreakWall = Uint16Array.from([
  6,
]);

/** 1:1 (battle_tv.c:431) */
const sPoints_CriticalHit = Uint16Array.from([
  6,
]);

/** 1:1 (battle_tv.c:432) */
const sPoints_Faint = Uint16Array.from([
  6,
]);

/** 1:1 (battle_tv.c:433) */
const sPoints_Flinched = Uint16Array.from([
  4,
]);

/** 1:1 (battle_tv.c:435) */
const sPoints_StatIncrease1 = Uint16Array.from([
  2, // [STAT_ATK - 1]
  2, // [STAT_DEF - 1]
  2, // [STAT_SPEED - 1]
  2, // [STAT_SPATK - 1]
  2, // [STAT_SPDEF - 1]
  2, // [STAT_ACC - 1]
  2, // [STAT_EVASION - 1]
]);

/** 1:1 (battle_tv.c:445) */
const sPoints_StatIncrease2 = Uint16Array.from([
  4, // [STAT_ATK - 1]
  4, // [STAT_DEF - 1]
  4, // [STAT_SPEED - 1]
  4, // [STAT_SPATK - 1]
  4, // [STAT_SPDEF - 1]
  4, // [STAT_ACC - 1]
  4, // [STAT_EVASION - 1]
]);

/** 1:1 (battle_tv.c:455) */
const sPoints_StatDecreaseSelf = Uint16Array.from([
  -1, // [STAT_ATK - 1]
  -1, // [STAT_DEF - 1]
  -1, // [STAT_SPEED - 1]
  -1, // [STAT_SPATK - 1]
  -1, // [STAT_SPDEF - 1]
  -1, // [STAT_ACC - 1]
  -1, // [STAT_EVASION - 1]
]);

/** 1:1 (battle_tv.c:465) */
const sPoints_StatDecrease1 = Uint16Array.from([
  2, // [STAT_ATK - 1]
  2, // [STAT_DEF - 1]
  2, // [STAT_SPEED - 1]
  2, // [STAT_SPATK - 1]
  2, // [STAT_SPDEF - 1]
  2, // [STAT_ACC - 1]
  2, // [STAT_EVASION - 1]
]);

/** 1:1 (battle_tv.c:475) */
const sPoints_StatDecrease2 = Uint16Array.from([
  4, // [STAT_ATK - 1]
  4, // [STAT_DEF - 1]
  4, // [STAT_SPEED - 1]
  4, // [STAT_SPATK - 1]
  4, // [STAT_SPDEF - 1]
  4, // [STAT_ACC - 1]
  4, // [STAT_EVASION - 1]
]);

/** 1:1 (battle_tv.c:485) */
const sPoints_StatIncreaseNotSelf = Uint16Array.from([
  -2, // [STAT_ATK - 1]
  -2, // [STAT_DEF - 1]
  -2, // [STAT_SPEED - 1]
  -2, // [STAT_SPATK - 1]
  -2, // [STAT_SPDEF - 1]
  -2, // [STAT_ACC - 1]
  -2, // [STAT_EVASION - 1]
]);

/** 1:1 (battle_tv.c:496) */
const sPointsArray: Uint16Array[] = [
  sPoints_MoveEffect, // [PTS_MOVE_EFFECT]
  sPoints_Effectiveness, // [PTS_EFFECTIVENESS]
  sPoints_SetUp, // [PTS_SET_UP]
  sPoints_RainMoves, // [PTS_RAIN]
  sPoints_SunMoves, // [PTS_SUN]
  sPoints_SandstormMoves, // [PTS_SANDSTORM]
  sPoints_HailMoves, // [PTS_HAIL]
  sPoints_ElectricMoves, // [PTS_ELECTRIC]
  sPoints_StatusDmg, // [PTS_STATUS_DMG]
  sPoints_Status, // [PTS_STATUS]
  sPoints_Spikes, // [PTS_SPIKES]
  sPoints_WaterSport, // [PTS_WATER_SPORT]
  sPoints_MudSport, // [PTS_MUD_SPORT]
  sPoints_Reflect, // [PTS_REFLECT]
  sPoints_LightScreen, // [PTS_LIGHT_SCREEN]
  sPoints_Safeguard, // [PTS_SAFEGUARD]
  sPoints_Mist, // [PTS_MIST]
  sPoints_BreakWall, // [PTS_BREAK_WALL]
  sPoints_CriticalHit, // [PTS_CRITICAL_HIT]
  sPoints_Faint, // [PTS_FAINT]
  sPoints_Faint, // [PTS_FAINT_SET_UP]
  sPoints_Flinched, // [PTS_FLINCHED]
  sPoints_StatIncrease1, // [PTS_STAT_INCREASE_1]
  sPoints_StatIncrease2, // [PTS_STAT_INCREASE_2]
  sPoints_StatDecreaseSelf, // [PTS_STAT_DECREASE_SELF]
  sPoints_StatDecrease1, // [PTS_STAT_DECREASE_1]
  sPoints_StatDecrease2, // [PTS_STAT_DECREASE_2]
  sPoints_StatIncreaseNotSelf, // [PTS_STAT_INCREASE_NOT_SELF]
];

// Points will always be calculated for these messages

// even if current Pokémon does not have corresponding move

/** 1:1 (battle_tv.c:530) */
const sSpecialBattleStrings = Uint16Array.from([
  STRINGID_PKMNPERISHCOUNTFELL,
  STRINGID_PKMNWISHCAMETRUE,
  STRINGID_PKMNLOSTPPGRUDGE,
  STRINGID_PKMNTOOKFOE,
  STRINGID_PKMNABSORBEDNUTRIENTS,
  STRINGID_PKMNANCHOREDITSELF,
  STRINGID_PKMNAFFLICTEDBYCURSE,
  STRINGID_PKMNSAPPEDBYLEECHSEED,
  STRINGID_PKMNLOCKEDINNIGHTMARE,
  STRINGID_PKMNHURTBY,
  STRINGID_PKMNHURTBYBURN,
  STRINGID_PKMNHURTBYPOISON,
  STRINGID_PKMNHURTBYSPIKES,
  STRINGID_ATTACKERFAINTED,
  STRINGID_TARGETFAINTED,
  STRINGID_PKMNHITWITHRECOIL,
  STRINGID_PKMNCRASHED,
  TABLE_END,
]);

// code

/** 1:1 `void BattleTv_SetDataBasedOnString(u16 stringId)` (battle_tv.c:541-952). */
export function BattleTv_SetDataBasedOnString(stringId: number): void {
  let tvPtr: any = null;
  let atkSide = 0;
  let defSide = 0;
  let effSide = 0;
  let scriptingSide = 0;
  let atkMon: any = null;
  let defMon: any = null;
  let moveSlot = 0;
  let atkFlank = 0;
  let defFlank = 0;
  let effFlank = 0;
  let perishCount: any = null;
  let statStringId: any = null;
  let finishedMoveId: any = null;
  if (!(gBattleTypeFlags & BATTLE_TYPE_LINK) && stringId != STRINGID_ITDOESNTAFFECT && stringId != STRINGID_NOTVERYEFFECTIVE)
    return;
  tvPtr = gBattleStruct.tv;
  atkSide = GetBattlerSide(gBattlerAttacker);
  defSide = GetBattlerSide(gBattlerTarget);
  effSide = GetBattlerSide(gEffectBattler);
  scriptingSide = GetBattlerSide(gBattleMsgDataPtr!.scrActive);
  if (atkSide == B_SIDE_PLAYER)
    atkMon = gPlayerParty[gBattlerPartyIndexes[gBattlerAttacker]];
  else
    atkMon = gEnemyParty[gBattlerPartyIndexes[gBattlerAttacker]];
  if (defSide == B_SIDE_PLAYER)
    defMon = gPlayerParty[gBattlerPartyIndexes[gBattlerTarget]];
  else
    defMon = gEnemyParty[gBattlerPartyIndexes[gBattlerTarget]];
  moveSlot = GetBattlerMoveSlotId(gBattlerAttacker, gBattleMsgDataPtr!.currentMove);
  if (moveSlot >= MAX_MON_MOVES && IsNotSpecialBattleString(stringId) && stringId > BATTLESTRINGS_TABLE_START)
  {
    tvPtr.side[atkSide].faintCause = FNT_OTHER;
    return;
  }
  // 1:1 `(u8 *)(gBattleTextBuff1 + 4)` / `(u16 *)(buff + 2)` — vues typées sur les buffers.
  perishCount = gBattleTextBuff1.subarray(4);
  statStringId = new Uint16Array(gBattleTextBuff2.buffer, gBattleTextBuff2.byteOffset + 2, 1);
  finishedMoveId = new Uint16Array(gBattleTextBuff1.buffer, gBattleTextBuff1.byteOffset + 2, 1);
  atkFlank = Math.trunc(GetBattlerPosition(gBattlerAttacker) / 2);
  defFlank = Math.trunc(GetBattlerPosition(gBattlerTarget) / 2);
  effFlank = Math.trunc(GetBattlerPosition(gEffectBattler) / 2);
  switch (stringId) {
    case STRINGID_ITDOESNTAFFECT:
      AddMovePoints(PTS_EFFECTIVENESS, moveSlot, 2, 0);
      if (!(gBattleTypeFlags & BATTLE_TYPE_LINK))
        TrySetBattleSeminarShow();
      break;
    case STRINGID_NOTVERYEFFECTIVE:
      AddMovePoints(PTS_EFFECTIVENESS, moveSlot, 1, 0);
      if (!(gBattleTypeFlags & BATTLE_TYPE_LINK) && GetMonData(defMon, MON_DATA_HP) != 0)
        TrySetBattleSeminarShow();
      break;
    case STRINGID_SUPEREFFECTIVE:
      AddMovePoints(PTS_EFFECTIVENESS, moveSlot, 0, 0);
      break;
    case STRINGID_PKMNFORESAWATTACK:
      tvPtr.side[atkSide].futureSightMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.side[atkSide].futureSightMoveSlot = moveSlot;
      break;
    case STRINGID_PKMNCHOSEXASDESTINY:
      tvPtr.side[atkSide].doomDesireMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.side[atkSide].doomDesireMoveSlot = moveSlot;
      break;
    case STRINGID_FAINTINTHREE:
      tvPtr.side[atkSide].perishSongMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.side[atkSide].perishSongMoveSlot = moveSlot;
      tvPtr.side[atkSide].perishSong = 1;
      break;
    case STRINGID_PKMNPERISHCOUNTFELL:
      if (perishCount[0] /* *ptr */ == 0)
        tvPtr.side[atkSide].faintCause = FNT_PERISH_SONG;
      break;
    case STRINGID_PKMNWISHCAMETRUE:
      if (tvPtr.side[defSide].wishMonId != 0)
      {
        AddMovePoints(PTS_SET_UP, 3, defSide, (tvPtr.side[defSide].wishMonId - 1) * 4 + tvPtr.side[defSide].wishMoveSlot);
      }
      break;
    case STRINGID_PKMNWANTSGRUDGE:
      tvPtr.side[atkSide].grudgeMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.side[atkSide].grudgeMoveSlot = moveSlot;
      break;
    case STRINGID_PKMNLOSTPPGRUDGE:
      if (tvPtr.side[defSide].grudgeMonId != 0)
      {
        AddMovePoints(PTS_SET_UP, 4, defSide, (tvPtr.side[defSide].grudgeMonId - 1) * 4 + tvPtr.side[defSide].grudgeMoveSlot);
      }
      break;
    case STRINGID_PKMNTRYINGTOTAKEFOE:
      tvPtr.side[atkSide].destinyBondMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.side[atkSide].destinyBondMoveSlot = moveSlot;
      break;
    case STRINGID_PKMNTOOKFOE:
      if (tvPtr.side[defSide].destinyBondMonId != 0)
        tvPtr.side[atkSide].faintCause = FNT_DESTINY_BOND;
      break;
    case STRINGID_PKMNPLANTEDROOTS:
      tvPtr.pos[atkSide][atkFlank].ingrainMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.pos[atkSide][atkFlank].ingrainMoveSlot = moveSlot;
      break;
    case STRINGID_PKMNABSORBEDNUTRIENTS:
      if (tvPtr.pos[atkSide][atkFlank].ingrainMonId != 0)
      {
        AddMovePoints(PTS_SET_UP, 6, atkSide, (tvPtr.pos[atkSide][atkFlank].ingrainMonId - 1) * 4 + tvPtr.pos[atkSide][atkFlank].ingrainMoveSlot);
      }
      break;
    case STRINGID_PKMNANCHOREDITSELF:
      if (tvPtr.pos[defSide][defFlank].ingrainMonId != 0)
      {
        AddMovePoints(PTS_SET_UP, 6, defSide, (tvPtr.pos[defSide][defFlank].ingrainMonId - 1) * 4 + tvPtr.pos[defSide][defFlank].ingrainMoveSlot);
      }
      break;
    case STRINGID_PKMNTRANSFORMEDINTO:
      gBattleStruct.anyMonHasTransformed = 1;
      break;
    case STRINGID_CRITICALHIT:
      AddMovePoints(PTS_CRITICAL_HIT, moveSlot, 0, 0);
      break;
    case STRINGID_ATTACKERSSTATROSE:
      if (gBattleTextBuff1[2] != 0)
      {
        if (statStringId[0] /* *ptr */ == STRINGID_STATSHARPLY)
          AddMovePoints(PTS_STAT_INCREASE_2, moveSlot, gBattleTextBuff1[2] - 1, 0);
        else
          AddMovePoints(PTS_STAT_INCREASE_1, moveSlot, gBattleTextBuff1[2] - 1, 0);
      }
      break;
    case STRINGID_DEFENDERSSTATROSE:
      if (gBattleTextBuff1[2] != 0)
      {
        if (gBattlerAttacker == gBattlerTarget)
        {
          if (statStringId[0] /* *ptr */ == STRINGID_STATSHARPLY)
            AddMovePoints(PTS_STAT_INCREASE_2, moveSlot, gBattleTextBuff1[2] - 1, 0);
          else
            AddMovePoints(PTS_STAT_INCREASE_1, moveSlot, gBattleTextBuff1[2] - 1, 0);
        }
        else
        {
          AddMovePoints(PTS_STAT_INCREASE_NOT_SELF, moveSlot, gBattleTextBuff1[2] - 1, 0);
        }
      }
      break;
    case STRINGID_ATTACKERSSTATFELL:
      if (gBattleTextBuff1[2] != 0)
        AddMovePoints(PTS_STAT_DECREASE_SELF, moveSlot, gBattleTextBuff1[2] - 1, 0);
      break;
    case STRINGID_DEFENDERSSTATFELL:
      if (gBattleTextBuff1[2] != 0)
      {
        if (statStringId[0] /* *ptr */ == STRINGID_STATHARSHLY)
          AddMovePoints(PTS_STAT_DECREASE_2, moveSlot, gBattleTextBuff1[2] - 1, 0);
        else
          AddMovePoints(PTS_STAT_DECREASE_1, moveSlot, gBattleTextBuff1[2] - 1, 0);
      }
      break;
    case STRINGID_PKMNLAIDCURSE:
      tvPtr.pos[defSide][defFlank].curseMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.pos[defSide][defFlank].curseMoveSlot = moveSlot;
      break;
    case STRINGID_PKMNAFFLICTEDBYCURSE:
      if (GetMonData(atkMon, MON_DATA_HP) && tvPtr.pos[atkSide][atkFlank].curseMonId != 0)
      {
        AddMovePoints(PTS_STATUS_DMG, 0, tvPtr.pos[atkSide][atkFlank].curseMonId - 1, tvPtr.pos[atkSide][atkFlank].curseMoveSlot);
        tvPtr.side[atkSide].faintCause = FNT_CURSE;
        tvPtr.side[atkSide].faintCauseMonId = atkFlank;
      }
      break;
    case STRINGID_PKMNSEEDED:
      tvPtr.pos[defSide][defFlank].leechSeedMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.pos[defSide][defFlank].leechSeedMoveSlot = moveSlot;
      break;
    case STRINGID_PKMNSAPPEDBYLEECHSEED:
      if (tvPtr.pos[atkSide][atkFlank].leechSeedMonId != 0)
      {
        AddMovePoints(PTS_STATUS_DMG, 1, tvPtr.pos[atkSide][atkFlank].leechSeedMonId - 1, tvPtr.pos[atkSide][atkFlank].leechSeedMoveSlot);
        tvPtr.side[atkSide].faintCause = FNT_LEECH_SEED;
        tvPtr.side[atkSide].faintCauseMonId = atkFlank;
      }
      break;
    case STRINGID_PKMNFELLINTONIGHTMARE:
      tvPtr.pos[defSide][defFlank].nightmareMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.pos[defSide][defFlank].nightmareMoveSlot = moveSlot;
      break;
    case STRINGID_PKMNLOCKEDINNIGHTMARE:
      if (GetMonData(atkMon, MON_DATA_HP) != 0 && tvPtr.pos[atkSide][atkFlank].nightmareMonId != 0)
      {
        AddMovePoints(PTS_STATUS_DMG, 5, tvPtr.pos[atkSide][atkFlank].nightmareMonId - 1, tvPtr.pos[atkSide][atkFlank].nightmareMoveSlot);
        tvPtr.side[atkSide].faintCause = FNT_NIGHTMARE;
        tvPtr.side[atkSide].faintCauseMonId = atkFlank;
      }
      break;
    case STRINGID_PKMNSQUEEZEDBYBIND:
    case STRINGID_PKMNTRAPPEDINVORTEX:
    case STRINGID_PKMNWRAPPEDBY:
    case STRINGID_PKMNCLAMPED:
    case STRINGID_PKMNTRAPPEDBYSANDTOMB:
      tvPtr.pos[defSide][defFlank].wrapMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.pos[defSide][defFlank].wrapMoveSlot = moveSlot;
      break;
    case STRINGID_PKMNHURTBY:
      if (GetMonData(atkMon, MON_DATA_HP) != 0 && tvPtr.pos[atkSide][atkFlank].wrapMonId != 0)
      {
        AddMovePoints(PTS_STATUS_DMG, 6, tvPtr.pos[atkSide][atkFlank].wrapMonId - 1, tvPtr.pos[atkSide][atkFlank].wrapMoveSlot);
        tvPtr.side[atkSide].faintCause = FNT_WRAP;
        tvPtr.side[atkSide].faintCauseMonId = atkFlank;
      }
      break;
    case STRINGID_PKMNWASBURNED:
      tvPtr.mon[effSide][gBattlerPartyIndexes[gEffectBattler]].brnMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.mon[effSide][gBattlerPartyIndexes[gEffectBattler]].brnMoveSlot = moveSlot;
      break;
    case STRINGID_PKMNHURTBYBURN:
      if (GetMonData(atkMon, MON_DATA_HP) != 0)
      {
        if (tvPtr.mon[atkSide][gBattlerPartyIndexes[gBattlerAttacker]].brnMonId != 0)
          AddMovePoints(PTS_STATUS_DMG, 4, tvPtr.mon[atkSide][gBattlerPartyIndexes[gBattlerAttacker]].brnMonId - 1, tvPtr.mon[atkSide][gBattlerPartyIndexes[gBattlerAttacker]].brnMoveSlot);
        tvPtr.side[atkSide].faintCause = FNT_BURN;
        tvPtr.side[atkSide].faintCauseMonId = gBattlerPartyIndexes[gBattlerAttacker];
      }
      break;
    case STRINGID_PKMNWASPOISONED:
      tvPtr.mon[effSide][gBattlerPartyIndexes[gEffectBattler]].psnMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.mon[effSide][gBattlerPartyIndexes[gEffectBattler]].psnMoveSlot = moveSlot;
      break;
    case STRINGID_PKMNBADLYPOISONED:
      tvPtr.mon[effSide][gBattlerPartyIndexes[gEffectBattler]].badPsnMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.mon[effSide][gBattlerPartyIndexes[gEffectBattler]].badPsnMoveSlot = moveSlot;
      break;
    case STRINGID_PKMNHURTBYPOISON:
      if (GetMonData(atkMon, MON_DATA_HP) != 0)
      {
        if (tvPtr.mon[atkSide][gBattlerPartyIndexes[gBattlerAttacker]].psnMonId != 0)
          AddMovePoints(PTS_STATUS_DMG, 2, tvPtr.mon[atkSide][gBattlerPartyIndexes[gBattlerAttacker]].psnMonId - 1, tvPtr.mon[atkSide][gBattlerPartyIndexes[gBattlerAttacker]].psnMoveSlot);
        if (tvPtr.mon[atkSide][gBattlerPartyIndexes[gBattlerAttacker]].badPsnMonId != 0)
          AddMovePoints(PTS_STATUS_DMG, 3, tvPtr.mon[atkSide][gBattlerPartyIndexes[gBattlerAttacker]].badPsnMonId - 1, tvPtr.mon[atkSide][gBattlerPartyIndexes[gBattlerAttacker]].badPsnMoveSlot);
        tvPtr.side[atkSide].faintCause = FNT_POISON;
        tvPtr.side[atkSide].faintCauseMonId = gBattlerPartyIndexes[gBattlerAttacker];
      }
      break;
    case STRINGID_PKMNFELLINLOVE:
      tvPtr.pos[defSide][defFlank].attractMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.pos[defSide][defFlank].attractMoveSlot = moveSlot;
      break;
    case STRINGID_PKMNIMMOBILIZEDBYLOVE:
      if (tvPtr.pos[atkSide][atkFlank].attractMonId != 0)
        AddMovePoints(PTS_STATUS, 0, tvPtr.pos[atkSide][atkFlank].attractMonId - 1, tvPtr.pos[atkSide][atkFlank].attractMoveSlot);
      break;
    case STRINGID_PKMNWASPARALYZED:
      tvPtr.mon[effSide][gBattlerPartyIndexes[gEffectBattler]].prlzMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.mon[effSide][gBattlerPartyIndexes[gEffectBattler]].prlzMoveSlot = moveSlot;
      break;
    case STRINGID_PKMNISPARALYZED:
      if (tvPtr.mon[atkSide][gBattlerPartyIndexes[gBattlerAttacker]].prlzMonId != 0)
        AddMovePoints(PTS_STATUS, 2, tvPtr.mon[atkSide][gBattlerPartyIndexes[gBattlerAttacker]].prlzMonId - 1, tvPtr.mon[atkSide][gBattlerPartyIndexes[gBattlerAttacker]].prlzMoveSlot);
      break;
    case STRINGID_PKMNFELLASLEEP:
      tvPtr.mon[effSide][gBattlerPartyIndexes[gEffectBattler]].slpMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.mon[effSide][gBattlerPartyIndexes[gEffectBattler]].slpMoveSlot = moveSlot;
      break;
    case STRINGID_PKMNFASTASLEEP:
      if (tvPtr.mon[atkSide][gBattlerPartyIndexes[gBattlerAttacker]].slpMonId != 0 && gBattleMsgDataPtr!.currentMove != MOVE_SNORE && gBattleMsgDataPtr!.currentMove != MOVE_SLEEP_TALK)
        AddMovePoints(PTS_STATUS, 3, tvPtr.mon[atkSide][gBattlerPartyIndexes[gBattlerAttacker]].slpMonId - 1, tvPtr.mon[atkSide][gBattlerPartyIndexes[gBattlerAttacker]].slpMoveSlot);
      break;
    case STRINGID_PKMNWASFROZEN:
      tvPtr.mon[effSide][gBattlerPartyIndexes[gEffectBattler]].frzMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.mon[effSide][gBattlerPartyIndexes[gEffectBattler]].frzMoveSlot = moveSlot;
      break;
    case STRINGID_PKMNISFROZEN:
      if (tvPtr.mon[atkSide][gBattlerPartyIndexes[gBattlerAttacker]].frzMonId != 0)
        AddMovePoints(PTS_STATUS, 4, tvPtr.mon[atkSide][gBattlerPartyIndexes[gBattlerAttacker]].frzMonId - 1, tvPtr.mon[atkSide][gBattlerPartyIndexes[gBattlerAttacker]].frzMoveSlot);
      break;
    case STRINGID_PKMNWASCONFUSED:
      tvPtr.pos[effSide][effFlank].confusionMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.pos[effSide][effFlank].confusionMoveSlot = moveSlot;
      break;
    case STRINGID_ITHURTCONFUSION:
      if (tvPtr.pos[atkSide][atkFlank].confusionMonId != 0)
        AddMovePoints(PTS_STATUS, 1, tvPtr.pos[atkSide][atkFlank].confusionMonId - 1, tvPtr.pos[atkSide][atkFlank].confusionMoveSlot);
      tvPtr.side[atkSide].faintCause = FNT_CONFUSION;
      break;
    case STRINGID_SPIKESSCATTERED:
      tvPtr.side[defSide].spikesMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.side[defSide].spikesMoveSlot = moveSlot;
      break;
    case STRINGID_PKMNHURTBYSPIKES:
      if (tvPtr.side[scriptingSide].spikesMonId != 0)
      {
        AddMovePoints(PTS_SPIKES, scriptingSide ^ BIT_SIDE, tvPtr.side[scriptingSide].spikesMonId - 1, tvPtr.side[scriptingSide].spikesMoveSlot);
        tvPtr.side[scriptingSide].faintCause = FNT_SPIKES;
      }
      break;
    case STRINGID_PKMNBLEWAWAYSPIKES:
      tvPtr.side[atkSide].spikesMonId = 0;
      tvPtr.side[atkSide].spikesMoveSlot = 0;
      break;
    case STRINGID_FIREWEAKENED:
      tvPtr.pos[atkSide][atkFlank].waterSportMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.pos[atkSide][atkFlank].waterSportMoveSlot = moveSlot;
      break;
    case STRINGID_ELECTRICITYWEAKENED:
      tvPtr.pos[atkSide][atkFlank].mudSportMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.pos[atkSide][atkFlank].mudSportMoveSlot = moveSlot;
      break;
    case STRINGID_ATTACKERFAINTED:
      AddPointsOnFainting(false);
    case STRINGID_RETURNMON:
      if (tvPtr.pos[atkSide][atkFlank].waterSportMonId != 0)
      {
        tvPtr.pos[atkSide][atkFlank].waterSportMonId = 0;
        tvPtr.pos[atkSide][atkFlank].waterSportMoveSlot = 0;
      }
      if (tvPtr.pos[atkSide][atkFlank].mudSportMonId != 0)
      {
        tvPtr.pos[atkSide][atkFlank].mudSportMonId = 0;
        tvPtr.pos[atkSide][atkFlank].mudSportMoveSlot = 0;
      }
      break;
    case STRINGID_TARGETFAINTED:
      AddPointsOnFainting(true);
      if (tvPtr.pos[atkSide][defFlank].waterSportMonId != 0)
      {
        tvPtr.pos[atkSide][defFlank].waterSportMonId = 0;
        tvPtr.pos[atkSide][defFlank].waterSportMoveSlot = 0;
      }
      if (tvPtr.pos[atkSide][defFlank].mudSportMonId != 0)
      {
        tvPtr.pos[atkSide][defFlank].mudSportMonId = 0;
        tvPtr.pos[atkSide][defFlank].mudSportMoveSlot = 0;
      }
      break;
    case STRINGID_PKMNRAISEDDEF:
    case STRINGID_PKMNRAISEDDEFALITTLE:
      tvPtr.side[atkSide].reflectMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.side[atkSide].reflectMoveSlot = moveSlot;
      break;
    case STRINGID_PKMNRAISEDSPDEF:
    case STRINGID_PKMNRAISEDSPDEFALITTLE:
      tvPtr.side[atkSide].lightScreenMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.side[atkSide].lightScreenMoveSlot = moveSlot;
      break;
    case STRINGID_PKMNSXWOREOFF:
      if (finishedMoveId[0] /* *ptr */ == MOVE_REFLECT)
      {
        tvPtr.side[atkSide].reflectMonId = 0;
        tvPtr.side[atkSide].reflectMoveSlot = 0;
      }
      if (finishedMoveId[0] /* *ptr */ == MOVE_LIGHT_SCREEN)
      {
        tvPtr.side[atkSide].lightScreenMonId = 0;
        tvPtr.side[atkSide].lightScreenMoveSlot = 0;
      }
      if (finishedMoveId[0] /* *ptr */ == MOVE_MIST)
      {
        tvPtr.side[atkSide].mistMonId = 0;
        tvPtr.side[atkSide].mistMoveSlot = 0;
      }
      break;
    case STRINGID_PKMNCOVEREDBYVEIL:
      tvPtr.side[atkSide].safeguardMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.side[atkSide].safeguardMoveSlot = moveSlot;
      break;
    case STRINGID_PKMNUSEDSAFEGUARD:
      if (tvPtr.side[defSide].safeguardMonId != 0)
        AddMovePoints(PTS_SAFEGUARD, 0, tvPtr.side[defSide].safeguardMonId - 1, tvPtr.side[defSide].safeguardMoveSlot);
      break;
    case STRINGID_PKMNSAFEGUARDEXPIRED:
      tvPtr.side[atkSide].safeguardMonId = 0;
      tvPtr.side[atkSide].safeguardMoveSlot = 0;
      break;
    case STRINGID_PKMNSHROUDEDINMIST:
      tvPtr.side[atkSide].mistMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
      tvPtr.side[atkSide].mistMoveSlot = moveSlot;
      break;
    case STRINGID_PKMNPROTECTEDBYMIST:
      if (tvPtr.side[defSide].mistMonId != 0)
        AddMovePoints(PTS_MIST, 0, tvPtr.side[defSide].mistMonId - 1, tvPtr.side[defSide].mistMoveSlot);
      break;
    case STRINGID_THEWALLSHATTERED:
      tvPtr.side[defSide].reflectMonId = 0;
      tvPtr.side[defSide].reflectMoveSlot = 0;
      tvPtr.side[defSide].lightScreenMonId = 0;
      tvPtr.side[defSide].lightScreenMoveSlot = 0;
      AddMovePoints(PTS_BREAK_WALL, 0, gBattlerPartyIndexes[gBattlerAttacker], moveSlot);
      break;
    case STRINGID_PKMNFLINCHED:
      if (tvPtr.pos[atkSide][0].attackedByMonId != 0)
        AddMovePoints(PTS_FLINCHED, 0, tvPtr.pos[atkSide][0].attackedByMonId - 1, tvPtr.pos[atkSide][0].attackedByMoveSlot);
      if (tvPtr.pos[atkSide][1].attackedByMonId != 0)
        AddMovePoints(PTS_FLINCHED, 0, tvPtr.pos[atkSide][1].attackedByMonId - 1, tvPtr.pos[atkSide][1].attackedByMoveSlot);
      break;
    case STRINGID_PKMNCRASHED:
    case STRINGID_PKMNHITWITHRECOIL:
      tvPtr.side[atkSide].faintCause = FNT_RECOIL;
      break;
  }
}

/** 1:1 `static bool8 IsNotSpecialBattleString(u16 stringId)` (battle_tv.c:954-969). */
function IsNotSpecialBattleString(stringId: number): boolean {
  let i = 0;
  do
  {
    if (sSpecialBattleStrings[i] == stringId)
      break;
    i++;
  }
  while (sSpecialBattleStrings[i] != TABLE_END);
  if (sSpecialBattleStrings[i] == TABLE_END)
    return true;
  else
    return false;
}

/** 1:1 `void BattleTv_SetDataBasedOnMove(u16 move, u16 weatherFlags, struct DisableStruct *disableStructPtr)` (battle_tv.c:971-1017). */
export function BattleTv_SetDataBasedOnMove(move: number, weatherFlags: number, disableStructPtr: DisableStruct): void {
  let tvPtr: any = null;
  let atkSide = 0;
  let defSide = 0;
  let moveSlot = 0;
  if (!(gBattleTypeFlags & BATTLE_TYPE_LINK))
    return;
  tvPtr = gBattleStruct.tv;
  atkSide = GetBattlerSide(gBattlerAttacker);
  defSide = GetBattlerSide(gBattlerTarget);
  moveSlot = GetBattlerMoveSlotId(gBattlerAttacker, move);
  if (moveSlot >= MAX_MON_MOVES)
  {
    tvPtr.side[atkSide].faintCause = FNT_OTHER;
    return;
  }
  tvPtr.pos[defSide][Math.trunc(GetBattlerPosition(gBattlerAttacker) / 2)].attackedByMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
  tvPtr.pos[defSide][Math.trunc(GetBattlerPosition(gBattlerAttacker) / 2)].attackedByMoveSlot = moveSlot;
  tvPtr.side[atkSide].usedMoveSlot = moveSlot;
  AddMovePoints(PTS_MOVE_EFFECT, moveSlot, getBattleMove(move).effect, 0);
  AddPointsBasedOnWeather(weatherFlags, move, moveSlot);
  if (disableStructPtr.chargeTimer != 0)
    AddMovePoints(PTS_ELECTRIC, move, moveSlot, 0);
  if (move == MOVE_WISH)
  {
    tvPtr.side[atkSide].wishMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
    tvPtr.side[atkSide].wishMoveSlot = moveSlot;
  }
  if (move == MOVE_SELF_DESTRUCT || move == MOVE_EXPLOSION)
  {
    tvPtr.side[atkSide ^ BIT_SIDE].explosionMonId = gBattlerPartyIndexes[gBattlerAttacker] + 1;
    tvPtr.side[atkSide ^ BIT_SIDE].explosionMoveSlot = moveSlot;
    tvPtr.side[atkSide ^ BIT_SIDE].faintCause = FNT_EXPLOSION;
    tvPtr.side[atkSide ^ BIT_SIDE].explosion = true;
  }
  AddMovePoints(PTS_REFLECT, getBattleMove(move).type, getBattleMove(move).power, 0);
  AddMovePoints(PTS_LIGHT_SCREEN, getBattleMove(move).type, getBattleMove(move).power, 0);
  AddMovePoints(PTS_WATER_SPORT, getBattleMove(move).type, 0, 0);
  AddMovePoints(PTS_MUD_SPORT, getBattleMove(move).type, 0, 0);
}

/** 1:1 `void BattleTv_SetDataBasedOnAnimation(u8 animationId)` (battle_tv.c:1019-1048). */
export function BattleTv_SetDataBasedOnAnimation(animationId: number): void {
  let tvPtr: any = null;
  let atkSide = 0;
  if (!(gBattleTypeFlags & BATTLE_TYPE_LINK))
    return;
  tvPtr = gBattleStruct.tv;
  atkSide = GetBattlerSide(gBattlerAttacker);
  switch (animationId) {
    case B_ANIM_FUTURE_SIGHT_HIT:
      if (tvPtr.side[atkSide].futureSightMonId != 0)
      {
        AddMovePoints(PTS_SET_UP, 0, atkSide, (tvPtr.side[atkSide].futureSightMonId - 1) * 4 + tvPtr.side[atkSide].futureSightMoveSlot);
        tvPtr.side[atkSide].faintCause = FNT_FUTURE_SIGHT;
      }
      break;
    case B_ANIM_DOOM_DESIRE_HIT:
      if (tvPtr.side[atkSide].doomDesireMonId != 0)
      {
        AddMovePoints(PTS_SET_UP, 1, atkSide, (tvPtr.side[atkSide].doomDesireMonId - 1) * 4 + tvPtr.side[atkSide].doomDesireMoveSlot);
        tvPtr.side[atkSide].faintCause = FNT_DOOM_DESIRE;
      }
      break;
  }
}

/** 1:1 `void TryPutLinkBattleTvShowOnAir(void)` (battle_tv.c:1050-1144). */
export function TryPutLinkBattleTvShowOnAir(): void {
  let playerBestSpecies = 0;
  let opponentBestSpecies = 0;
  let playerBestSum = 0;
  let opponentBestSum = SHRT_MAX;
  let playerBestMonId = 0;
  let opponentBestMonId = 0;
  let movePoints: import('./engine/battle/state').BattleTvMovePoints = gBattleStruct.tvMovePoints;
  let countPlayer = 0;
  let countOpponent = 0;
  let sum = 0;
  let species = 0;
  let move = MOVE_NONE;
  let i = 0;
  let j = 0;
  let zero = 0;
  let one = 1;
  //needed for matching
  if (gBattleStruct.anyMonHasTransformed)
    return;
  movePoints = gBattleStruct.tvMovePoints;
  for (i = 0; i < PARTY_SIZE; i++)
  {
    if (GetMonData(gPlayerParty[i], MON_DATA_SPECIES) != SPECIES_NONE)
      countPlayer++;
    if (GetMonData(gEnemyParty[i], MON_DATA_SPECIES) != SPECIES_NONE)
      countOpponent++;
  }
  if (!(gBattleTypeFlags & BATTLE_TYPE_LINK) || countPlayer != countOpponent)
    return;
  for (i = 0; i < PARTY_SIZE; i++)
  {
    species = GetMonData(gPlayerParty[i], MON_DATA_SPECIES) as number;
    if (species != SPECIES_NONE && !GetMonData(gPlayerParty[i], MON_DATA_IS_EGG))
    {
      for ((sum = 0, j = 0); j < MAX_MON_MOVES; j++)
        sum += movePoints.points[zero][i * 4 + j];
      if (playerBestSum < sum)
      {
        playerBestMonId = i;
        playerBestSum = sum;
        playerBestSpecies = species;
      }
    }
    species = GetMonData(gEnemyParty[i], MON_DATA_SPECIES) as number;
    if (species != SPECIES_NONE && !GetMonData(gEnemyParty[i], MON_DATA_IS_EGG))
    {
      for ((sum = 0, j = 0); j < MAX_MON_MOVES; j++)
        sum += movePoints.points[one][i * 4 + j];
      if (opponentBestSum == sum)
      {
        if ((GetMonData(gEnemyParty[i], MON_DATA_EXP) as number) > (GetMonData(gEnemyParty[opponentBestMonId], MON_DATA_EXP) as number))
        {
          opponentBestMonId = i;
          opponentBestSum = sum;
          opponentBestSpecies = species;
        }
      }
      else if (opponentBestSum > sum)
      {
        opponentBestMonId = i;
        opponentBestSum = sum;
        opponentBestSpecies = species;
      }
    }
  }
  for ((sum = 0, (i = 0, j = 0)); j < MAX_MON_MOVES; j++)
  {
    if (sum < movePoints.points[zero][playerBestMonId * 4 + j])
    {
      sum = movePoints.points[zero][playerBestMonId * 4 + j];
      i = j;
    }
  }
  move = GetMonData(gPlayerParty[playerBestMonId], MON_DATA_MOVE1 + i) as number;
  if (playerBestSum == 0 || move == MOVE_NONE)
    return;
  if (gBattleTypeFlags & BATTLE_TYPE_MULTI)
  {
    if ((playerBestMonId < MULTI_PARTY_SIZE && !GetLinkTrainerFlankId(gBattleScripting.multiplayerId)) || (playerBestMonId >= MULTI_PARTY_SIZE && GetLinkTrainerFlankId(gBattleScripting.multiplayerId)))
    {
      j = (opponentBestMonId < MULTI_PARTY_SIZE) ? 0 : 1;
      PutBattleUpdateOnTheAir(GetOpposingLinkMultiBattlerId(j, gBattleScripting.multiplayerId), move, playerBestSpecies, opponentBestSpecies);
    }
  }
  else
  {
    PutBattleUpdateOnTheAir(gBattleScripting.multiplayerId ^ 1, move, playerBestSpecies, opponentBestSpecies);
  }
}

/** 1:1 `static void AddMovePoints(u8 caseId, u16 arg1, u8 arg2, u8 arg3)` (battle_tv.c:1146-1266). */
function AddMovePoints(caseId: number, arg1: number, arg2: number, arg3: number): void {
  let movePoints = gBattleStruct.tvMovePoints;
  let tvPtr = gBattleStruct.tv;
  let atkSide = GetBattlerSide(gBattlerAttacker);
  let defSide = GetBattlerSide(gBattlerTarget);
  let ptr: any = null;
  let i = 0;
  switch (caseId) {
    case PTS_MOVE_EFFECT:
    case PTS_EFFECTIVENESS:
    case PTS_CRITICAL_HIT:
    case PTS_STAT_INCREASE_1:
    case PTS_STAT_INCREASE_2:
    case PTS_STAT_DECREASE_SELF:
    case PTS_STAT_DECREASE_1:
    case PTS_STAT_DECREASE_2:
    case PTS_STAT_INCREASE_NOT_SELF:
      movePoints.points[atkSide][gBattlerPartyIndexes[gBattlerAttacker] * 4 + arg1] = ((movePoints.points[atkSide][gBattlerPartyIndexes[gBattlerAttacker] * 4 + arg1] + (sPointsArray[caseId][arg2])) << 16) >> 16; // s16 wrap (points signes)
      break;
    /* TRANSPILER-TODO preproc_def */
    case PTS_RAIN:
    case PTS_SUN:
    case PTS_SANDSTORM:
    case PTS_HAIL:
    case PTS_ELECTRIC:
      i = 0;
      ptr = sPointsArray[caseId];
      do
      {
        if (arg1 == ptr[i])
        {
          movePoints.points[atkSide][gBattlerPartyIndexes[gBattlerAttacker] * 4 + arg2] = ((movePoints.points[atkSide][gBattlerPartyIndexes[gBattlerAttacker] * 4 + arg2] + (ptr[i + 1])) << 16) >> 16; // s16 wrap (points signes)
          break;
        }
        i += 2;
      }
      while (ptr[i] != TABLE_END);
      break;
    /* TRANSPILER-TODO preproc_call */
    case PTS_FAINT:
      tvPtr.side[arg2 ^ 1].faintCause = FNT_NONE;
      movePoints.points[arg2][0 * 4 + arg3] = ((movePoints.points[arg2][0 * 4 + arg3] + (sPointsArray[caseId][arg1])) << 16) >> 16; // s16 wrap (points signes)
      break;
    case PTS_FAINT_SET_UP:
      tvPtr.side[arg2].faintCause = FNT_NONE;
    // fallthrough
    case PTS_SET_UP:
      movePoints.points[arg2][0 * 4 + arg3] = ((movePoints.points[arg2][0 * 4 + arg3] + (sPointsArray[caseId][arg1])) << 16) >> 16; // s16 wrap (points signes)
      break;
    case PTS_BREAK_WALL:
      movePoints.points[atkSide][arg2 * 4 + arg3] = ((movePoints.points[atkSide][arg2 * 4 + arg3] + (sPointsArray[caseId][arg1])) << 16) >> 16; // s16 wrap (points signes)
      break;
    case PTS_STATUS_DMG:
    case PTS_STATUS:
    case PTS_SAFEGUARD:
    case PTS_MIST:
    case PTS_FLINCHED:
      movePoints.points[atkSide ^ BIT_SIDE][arg2 * 4 + arg3] = ((movePoints.points[atkSide ^ BIT_SIDE][arg2 * 4 + arg3] + (sPointsArray[caseId][arg1])) << 16) >> 16; // s16 wrap (points signes)
      break;
    case PTS_SPIKES:
      movePoints.points[arg1][arg2 * 4 + arg3] = ((movePoints.points[arg1][arg2 * 4 + arg3] + (sPointsArray[caseId][0])) << 16) >> 16; // s16 wrap (points signes)
      break;
    /* TRANSPILER-TODO preproc_def */
    /* TRANSPILER-TODO preproc_def */
    case PTS_WATER_SPORT:
      // If used fire move during Water Sport
      if (tvPtr.pos[defSide][0].waterSportMonId != -(tvPtr.pos[defSide][1].waterSportMonId) && arg1 == TYPE_FIRE)
      {
        if (tvPtr.pos[defSide][0].waterSportMonId != 0)
        {
          let id = (tvPtr.pos[defSide][0].waterSportMonId - 1) * 4;
          movePoints.points[defSide][id + tvPtr.pos[defSide][0].waterSportMoveSlot] = ((movePoints.points[defSide][id + tvPtr.pos[defSide][0].waterSportMoveSlot] + (sPointsArray[caseId][0])) << 16) >> 16; // s16 wrap (points signes)
        }
        if (tvPtr.pos[defSide][1].waterSportMonId != 0)
        {
          let id = (tvPtr.pos[defSide][1].waterSportMonId - 1) * 4;
          movePoints.points[defSide][id + tvPtr.pos[defSide][1].waterSportMoveSlot] = ((movePoints.points[defSide][id + tvPtr.pos[defSide][1].waterSportMoveSlot] + (sPointsArray[caseId][0])) << 16) >> 16; // s16 wrap (points signes)
        }
      }
      break;
    case PTS_MUD_SPORT:
      // If used Electric move during Mud Sport
      if (tvPtr.pos[defSide][0].mudSportMonId != -(tvPtr.pos[defSide][1].mudSportMonId) && arg1 == TYPE_ELECTRIC)
      {
        if (tvPtr.pos[defSide][0].mudSportMonId != 0)
        {
          let id = (tvPtr.pos[defSide][0].mudSportMonId - 1) * 4;
          movePoints.points[defSide][id + tvPtr.pos[defSide][0].mudSportMoveSlot] = ((movePoints.points[defSide][id + tvPtr.pos[defSide][0].mudSportMoveSlot] + (sPointsArray[caseId][0])) << 16) >> 16; // s16 wrap (points signes)
        }
        if (tvPtr.pos[defSide][1].mudSportMonId != 0)
        {
          let id = (tvPtr.pos[defSide][1].mudSportMonId - 1) * 4;
          movePoints.points[defSide][id + tvPtr.pos[defSide][1].mudSportMoveSlot] = ((movePoints.points[defSide][id + tvPtr.pos[defSide][1].mudSportMoveSlot] + (sPointsArray[caseId][0])) << 16) >> 16; // s16 wrap (points signes)
        }
      }
      break;
    case PTS_REFLECT:
      // If hit Reflect with damaging physical move
      if (IS_TYPE_PHYSICAL(arg1) && arg2 != 0 && tvPtr.side[defSide].reflectMonId != 0)
      {
        let id = (tvPtr.side[defSide].reflectMonId - 1) * 4;
        movePoints.points[defSide][id + tvPtr.side[defSide].reflectMoveSlot] = ((movePoints.points[defSide][id + tvPtr.side[defSide].reflectMoveSlot] + (sPointsArray[caseId][0])) << 16) >> 16; // s16 wrap (points signes)
      }
      break;
    case PTS_LIGHT_SCREEN:
      // If hit Light Screen with damaging special move
      if (!IS_TYPE_PHYSICAL(arg1) && arg2 != 0 && tvPtr.side[defSide].lightScreenMonId != 0)
      {
        let id = (tvPtr.side[defSide].lightScreenMonId - 1) * 4;
        movePoints.points[defSide][id + tvPtr.side[defSide].lightScreenMoveSlot] = ((movePoints.points[defSide][id + tvPtr.side[defSide].lightScreenMoveSlot] + (sPointsArray[caseId][0])) << 16) >> 16; // s16 wrap (points signes)
      }
      break;
    /* TRANSPILER-TODO preproc_call */
    /* TRANSPILER-TODO preproc_call */
  }
}

/** 1:1 `static void AddPointsOnFainting(bool8 targetFainted)` (battle_tv.c:1268-1417). */
function AddPointsOnFainting(targetFainted: boolean): void {
  let tvPtr = gBattleStruct.tv;
  let atkSide = GetBattlerSide(gBattlerAttacker);
  let defSide = GetBattlerSide(gBattlerTarget);
  let atkArrId = tvPtr.side[atkSide].faintCauseMonId;
  let i = 0;
  if (tvPtr.side[atkSide].faintCause != FNT_NONE)
  {
    switch (tvPtr.side[atkSide].faintCause) {
      case FNT_CURSE:
        if (tvPtr.pos[atkSide][atkArrId].curseMonId != 0)
        {
          AddMovePoints(PTS_FAINT, 0, atkSide ^ BIT_SIDE, (tvPtr.pos[atkSide][atkArrId].curseMonId - 1) * 4 + tvPtr.pos[atkSide][atkArrId].curseMoveSlot);
        }
        break;
      case FNT_LEECH_SEED:
        if (tvPtr.pos[atkSide][atkArrId].leechSeedMonId != 0)
        {
          AddMovePoints(PTS_FAINT, 0, atkSide ^ BIT_SIDE, (tvPtr.pos[atkSide][atkArrId].leechSeedMonId - 1) * 4 + tvPtr.pos[atkSide][atkArrId].leechSeedMoveSlot);
        }
        break;
      case FNT_POISON:
        if (tvPtr.mon[atkSide][atkArrId].psnMonId != 0)
        {
          AddMovePoints(PTS_FAINT, 0, atkSide ^ BIT_SIDE, (tvPtr.mon[atkSide][atkArrId].psnMonId - 1) * 4 + tvPtr.mon[atkSide][atkArrId].psnMoveSlot);
        }
        if (tvPtr.mon[atkSide][atkArrId].badPsnMonId != 0)
        {
          AddMovePoints(PTS_FAINT, 0, atkSide ^ BIT_SIDE, (tvPtr.mon[atkSide][atkArrId].badPsnMonId - 1) * 4 + tvPtr.mon[atkSide][atkArrId].badPsnMoveSlot);
        }
        break;
      case FNT_BURN:
        if (tvPtr.mon[atkSide][atkArrId].brnMonId != 0)
        {
          AddMovePoints(PTS_FAINT, 0, atkSide ^ BIT_SIDE, (tvPtr.mon[atkSide][atkArrId].brnMonId - 1) * 4 + tvPtr.mon[atkSide][atkArrId].brnMoveSlot);
        }
        break;
      case FNT_NIGHTMARE:
        if (tvPtr.pos[atkSide][atkArrId].nightmareMonId != 0)
        {
          AddMovePoints(PTS_FAINT, 0, atkSide ^ BIT_SIDE, (tvPtr.pos[atkSide][atkArrId].nightmareMonId - 1) * 4 + tvPtr.pos[atkSide][atkArrId].nightmareMoveSlot);
        }
        break;
      case FNT_WRAP:
        if (tvPtr.pos[atkSide][atkArrId].wrapMonId != 0)
        {
          AddMovePoints(PTS_FAINT, 0, atkSide ^ BIT_SIDE, (tvPtr.pos[atkSide][atkArrId].wrapMonId - 1) * 4 + tvPtr.pos[atkSide][atkArrId].wrapMoveSlot);
        }
        break;
      case FNT_SPIKES:
        if (tvPtr.side[atkSide].spikesMonId != 0)
        {
          AddMovePoints(PTS_FAINT, 0, atkSide ^ BIT_SIDE, (tvPtr.side[atkSide].spikesMonId - 1) * 4 + tvPtr.side[atkSide].spikesMoveSlot);
        }
        break;
      case FNT_FUTURE_SIGHT:
        if (tvPtr.side[atkSide].futureSightMonId != 0)
        {
          AddMovePoints(PTS_FAINT_SET_UP, 0, atkSide, (tvPtr.side[atkSide].futureSightMonId - 1) * 4 + tvPtr.side[atkSide].futureSightMoveSlot);
        }
        break;
      case FNT_DOOM_DESIRE:
        if (tvPtr.side[atkSide].doomDesireMonId != 0)
        {
          AddMovePoints(PTS_FAINT_SET_UP, 0, atkSide, (tvPtr.side[atkSide].doomDesireMonId - 1) * 4 + tvPtr.side[atkSide].doomDesireMoveSlot);
        }
        break;
      case FNT_PERISH_SONG:
        if (tvPtr.side[atkSide].perishSong && tvPtr.side[atkSide].perishSongMonId - 1 != gBattlerPartyIndexes[gBattlerAttacker])
        {
          AddMovePoints(PTS_FAINT, 0, atkSide, (tvPtr.side[atkSide].perishSongMonId - 1) * 4 + tvPtr.side[atkSide].perishSongMoveSlot);
        }
        if (tvPtr.side[atkSide ^ BIT_SIDE].perishSong)
        {
          AddMovePoints(PTS_FAINT, 0, atkSide ^ BIT_SIDE, (tvPtr.side[atkSide ^ BIT_SIDE].perishSongMonId - 1) * 4 + tvPtr.side[atkSide ^ BIT_SIDE].perishSongMoveSlot);
        }
        break;
      case FNT_DESTINY_BOND:
        if (tvPtr.side[atkSide ^ BIT_SIDE].destinyBondMonId != 0)
        {
          AddMovePoints(PTS_FAINT, 0, atkSide ^ BIT_SIDE, (tvPtr.side[atkSide ^ BIT_SIDE].destinyBondMonId - 1) * 4 + tvPtr.side[atkSide ^ BIT_SIDE].destinyBondMoveSlot);
        }
        break;
      case FNT_CONFUSION:
        for (i = 0; i < 2; i++)
        {
          if (tvPtr.pos[atkSide][i].confusionMonId != 0)
          {
            AddMovePoints(PTS_FAINT, 0, atkSide ^ BIT_SIDE, (tvPtr.pos[atkSide][i].confusionMonId - 1) * 4 + tvPtr.pos[atkSide][i].confusionMoveSlot);
          }
        }
        break;
      case FNT_EXPLOSION:
        if (tvPtr.side[atkSide].explosion)
        {
          AddMovePoints(PTS_FAINT, 0, atkSide, (tvPtr.side[atkSide].explosionMonId - 1) * 4 + tvPtr.side[atkSide].explosionMoveSlot);
        }
        if (tvPtr.side[atkSide ^ BIT_SIDE].explosion)
        {
          AddMovePoints(PTS_FAINT, 0, atkSide ^ BIT_SIDE, (tvPtr.side[atkSide ^ BIT_SIDE].explosionMonId - 1) * 4 + tvPtr.side[atkSide ^ BIT_SIDE].explosionMoveSlot);
        }
        break;
      case FNT_RECOIL:
        if (targetFainted == true)
        {
          AddMovePoints(PTS_FAINT_SET_UP, 0, atkSide, (gBattlerPartyIndexes[gBattlerAttacker]) * 4 + tvPtr.side[atkSide].usedMoveSlot);
        }
        break;
      case FNT_OTHER:
        break;
    }
  }
  else
  {
    if (tvPtr.side[defSide].faintCause == FNT_SPIKES)
    {
      if (tvPtr.side[defSide].spikesMonId != 0)
      {
        AddMovePoints(PTS_FAINT, 0, defSide ^ BIT_SIDE, (tvPtr.side[defSide].spikesMonId - 1) * 4 + tvPtr.side[defSide].spikesMoveSlot);
      }
    }
    else
    {
      AddMovePoints(PTS_FAINT_SET_UP, 0, atkSide, (gBattlerPartyIndexes[gBattlerAttacker]) * 4 + tvPtr.side[atkSide].usedMoveSlot);
    }
  }
}

/** 1:1 `static void TrySetBattleSeminarShow(void)` (battle_tv.c:1419-1506). */
function TrySetBattleSeminarShow(): void {
  let i = 0;
  const dmgByMove = new Int32Array(MAX_MON_MOVES);
  const powerOverride = { v: 0 }; // TRANSPILER: &powerOverride pris → box
  let currMoveSaved = 0;
  if (gBattleTypeFlags & (BATTLE_TYPE_DOUBLE | BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK))
    return;
  else if (GetBattlerSide(gBattlerAttacker) == B_SIDE_OPPONENT)
    return;
  else if (gBattleMons[gBattlerAttacker].statStages[STAT_ACC] < DEFAULT_STAT_STAGE)
    return;
  else if (gBattleMons[gBattlerTarget].statStages[STAT_EVASION] > DEFAULT_STAT_STAGE)
    return;
  else if (gCurrentMove == MOVE_HIDDEN_POWER || gCurrentMove == MOVE_WEATHER_BALL)
    return;
  else if (gBattleTypeFlags & (BATTLE_TYPE_PALACE | BATTLE_TYPE_PIKE | BATTLE_TYPE_PYRAMID))
    return;
  else if (getBattleMove(gBattleMons[gBattlerAttacker].moves[gMoveSelectionCursor[gBattlerAttacker]]).power == 0)
    return;
  i = 0;
  currMoveSaved = gBattleMons[gBattlerAttacker].moves[gMoveSelectionCursor[gBattlerAttacker]];
  do
  {
    if (currMoveSaved == sVariableDmgMoves[i])
      break;
    i++;
  }
  while (sVariableDmgMoves[i] != TABLE_END);
  if (sVariableDmgMoves[i] != TABLE_END)
    return;
  dmgByMove[gMoveSelectionCursor[gBattlerAttacker]] = gBattleMoveDamage;
  currMoveSaved = gCurrentMove;
  for (i = 0; i < MAX_MON_MOVES; i++)
  {
    setCurrentMove(gBattleMons[gBattlerAttacker].moves[i]);
    powerOverride.v = 0;
    const dmgBox = { v: dmgByMove[i] }; // 1:1 &dmgByMove[i] (out-param)
    const calc = ShouldCalculateDamage(gCurrentMove, dmgBox, powerOverride);
    dmgByMove[i] = dmgBox.v;
    if (calc)
    {
      let moveResultFlags = 0;
      let sideStatus = gSideStatuses[GET_BATTLER_SIDE(gBattlerTarget)];
      setBattleMoveDamage(CalculateBaseDamage(gBattleMons[gBattlerAttacker], gBattleMons[gBattlerTarget], gCurrentMove, sideStatus, powerOverride.v, 0, gBattlerAttacker, gBattlerTarget).damage); // adaptation repo : retour {damage, powerOut}
      if (gStatuses3[gBattlerAttacker] & STATUS3_CHARGED_UP && getBattleMove(gCurrentMove).type == TYPE_ELECTRIC)
        setBattleMoveDamage(gBattleMoveDamage * 2);
      if (gProtectStructs[gBattlerAttacker].helpingHand)
        setBattleMoveDamage(Math.trunc(gBattleMoveDamage * 15 / 10));
      moveResultFlags = TypeCalc(gCurrentMove, gBattlerAttacker, gBattlerTarget);
      dmgByMove[i] = gBattleMoveDamage;
      if (dmgByMove[i] == 0 && !(moveResultFlags & MOVE_RESULT_NO_EFFECT))
        dmgByMove[i] = 1;
    }
  }
  for (i = 0; i < MAX_MON_MOVES; i++)
  {
    if (i != gMoveSelectionCursor[gBattlerAttacker] && dmgByMove[i] > dmgByMove[gMoveSelectionCursor[gBattlerAttacker]])
    {
      let opponentSpecies = 0;
      let playerSpecies = 0;
      let bestMoveId = 0;
      if (gMoveSelectionCursor[gBattlerAttacker] != 0)
        bestMoveId = 0;
      else
        bestMoveId = 1;
      for (i = 0; i < MAX_MON_MOVES; i++)
      {
        if (i != gMoveSelectionCursor[gBattlerAttacker] && dmgByMove[i] > dmgByMove[bestMoveId])
          bestMoveId = i;
      }
      opponentSpecies = GetMonData(gEnemyParty[gBattlerPartyIndexes[gBattlerTarget]], MON_DATA_SPECIES) as number;
      playerSpecies = GetMonData(gPlayerParty[gBattlerPartyIndexes[gBattlerAttacker]], MON_DATA_SPECIES) as number;
      TryPutBattleSeminarOnAir(opponentSpecies, playerSpecies, gMoveSelectionCursor[gBattlerAttacker], gBattleMons[gBattlerAttacker].moves, gBattleMons[gBattlerAttacker].moves[bestMoveId]);
      break;
    }
  }
  setBattleMoveDamage(dmgByMove[gMoveSelectionCursor[gBattlerAttacker]]);
  setCurrentMove(currMoveSaved);
}

/** 1:1 `static bool8 ShouldCalculateDamage(u16 move, s32 *dmg, u16 *powerOverride)` (battle_tv.c:1508-1546). */
function ShouldCalculateDamage(move: number, dmg: { v: number }, powerOverride: { v: number }): boolean {
  if (getBattleMove(move).power == 0)
  {
    dmg.v = 0;
    return false;
  }
  else
  {
    let i = 0;
    do
    {
      if (move == sVariableDmgMoves[i])
        break;
      i++;
    }
    while (sVariableDmgMoves[i] != TABLE_END);
    if (sVariableDmgMoves[i] != TABLE_END)
    {
      dmg.v = 0;
      return false;
    }
    else if (move == MOVE_PSYWAVE)
    {
      dmg.v = gBattleMons[gBattlerAttacker].level;
      dmg.v = Math.trunc(dmg.v / 2);
      return false;
    }
    else if (move == MOVE_MAGNITUDE)
    {
      powerOverride.v = 10;
      return true;
    }
    else
    {
      return true;
    }
  }
}

/** 1:1 `void BattleTv_ClearExplosionFaintCause(void)` (battle_tv.c:1548-1569). */
export function BattleTv_ClearExplosionFaintCause(): void {
  if (gBattleTypeFlags & BATTLE_TYPE_LINK)
  {
    let tvPtr = gBattleStruct.tv;
    tvPtr.side[B_SIDE_PLAYER].faintCause = FNT_NONE;
    tvPtr.side[B_SIDE_OPPONENT].faintCause = FNT_NONE;
    tvPtr.side[B_SIDE_PLAYER].faintCauseMonId = 0;
    tvPtr.side[B_SIDE_OPPONENT].faintCauseMonId = 0;
    tvPtr.side[B_SIDE_PLAYER].explosionMonId = 0;
    tvPtr.side[B_SIDE_OPPONENT].explosionMonId = 0;
    tvPtr.side[B_SIDE_PLAYER].explosionMoveSlot = 0;
    tvPtr.side[B_SIDE_OPPONENT].explosionMoveSlot = 0;
    tvPtr.side[B_SIDE_PLAYER].explosion = false;
    tvPtr.side[B_SIDE_OPPONENT].explosion = false;
  }
}

/** 1:1 `u8 GetBattlerMoveSlotId(u8 battler, u16 move)` (battle_tv.c:1571-1592). */
export function GetBattlerMoveSlotId(battler: number, move: number): number {
  let i = 0;
  let party: any = null;
  if (GetBattlerSide(battler) == B_SIDE_PLAYER)
    party = gPlayerParty;
  else
    party = gEnemyParty;
  i = 0;
  while (1)
  {
    if (i >= MAX_MON_MOVES)
      break;
    if (GetMonData(party[gBattlerPartyIndexes[battler]] /* TRANSPILER-TODO &élément scalaire (out-param ?) */, MON_DATA_MOVE1 + i) == move)
      break;
    i++;
  }
  return i;
}

/** 1:1 `static void AddPointsBasedOnWeather(u16 weatherFlags, u16 move, u8 moveSlot)` (battle_tv.c:1594-1604). */
function AddPointsBasedOnWeather(weatherFlags: number, move: number, moveSlot: number): void {
  if (weatherFlags & B_WEATHER_RAIN)
    AddMovePoints(PTS_RAIN, move, moveSlot, 0);
  else if (weatherFlags & B_WEATHER_SUN)
    AddMovePoints(PTS_SUN, move, moveSlot, 0);
  else if (weatherFlags & B_WEATHER_SANDSTORM)
    AddMovePoints(PTS_SANDSTORM, move, moveSlot, 0);
  else if (weatherFlags & B_WEATHER_HAIL)
    AddMovePoints(PTS_HAIL, move, moveSlot, 0);
}
