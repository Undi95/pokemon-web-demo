/**
 * battle/damage-calc.ts — 1:1 décomp `CalculateBaseDamage`
 * (`D:/Projet 1/decomps/pokeemeraude/src/pokemon.c:3107-3373`).
 *
 * Formule complète :
 *   - power = move.power (ou powerOverride si set)
 *   - type = move.type (ou typeOverride si set)
 *   - attack/spAttack avec ability boosts (Huge Power, Hustle, Overgrow/Blaze/
 *     Torrent/Swarm pinch, Guts on status)
 *   - defense/spDefense avec ability boosts (Thick Fat, Marvel Scale)
 *   - hold effect boosts (Choice Band, Soul Dew, Deep Sea Tooth/Scale, Light Ball,
 *     Metal Powder, Thick Club) — TODO
 *   - badge boosts +10% (= post-gym, skip pour first battle) — TODO
 *   - APPLY_STAT_MOD (= stage ratios)
 *   - core formula : damage = stat × power × (2L/5 + 2) / defStat / 50
 *   - burn ÷2 (physical, attacker w/o Guts)
 *   - Reflect/Light Screen ÷2 (non-crit)
 *   - Double battle hitting both targets ÷2
 *   - Weather boost/weaken (Rain Fire/Water, Sun Fire/Water, SolarBeam weather)
 *   - Flash Fire boost — TODO
 *   - Final + 2
 *
 * Note : APPLY_STAT_MOD inline (= macro C qui set var = stat × ratio[stage][0] / ratio[stage][1]).
 */

import {
  gBattleMons,
  gBattlerAttacker,
  gBattlerTarget,
  gBattleTypeFlags,
  gBattleWeather,
  gCritMultiplier,
  gBattleScripting,
  gCurrentMove,
} from './state';
import { getBattleMove } from './data/battle-moves';
import type { BattleMon } from './script-interpreter';

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

// Type constants (= include/constants/pokemon.h).
const TYPE_MYSTERY  = 9;
const TYPE_FIRE     = 10;
const TYPE_WATER    = 11;
const TYPE_BUG      = 6;
const TYPE_GRASS    = 12;
const TYPE_ELECTRIC = 13;
const TYPE_ICE      = 15;
const TYPE_FLYING   = 2;
const TYPE_PSYCHIC  = 14;
const TYPE_GROUND   = 4;
const TYPE_FIGHTING = 1;
const TYPE_POISON   = 3;
const TYPE_ROCK     = 5;
const TYPE_GHOST    = 7;
const TYPE_DARK     = 17;
const TYPE_STEEL    = 8;
const TYPE_DRAGON   = 16;
const TYPE_NORMAL   = 0;
void TYPE_BUG; void TYPE_ELECTRIC; void TYPE_ICE; void TYPE_FLYING;
void TYPE_PSYCHIC; void TYPE_GROUND; void TYPE_FIGHTING; void TYPE_POISON;
void TYPE_ROCK; void TYPE_GHOST; void TYPE_DARK; void TYPE_STEEL;
void TYPE_DRAGON; void TYPE_NORMAL;

// Stat indices (= include/constants/pokemon.h).
const STAT_ATK   = 1;
const STAT_DEF   = 2;
const STAT_SPATK = 4;
const STAT_SPDEF = 5;
const DEFAULT_STAT_STAGE = 6;

// Status1 / Status2 (= include/constants/battle.h).
const STATUS1_BURN = 0x10;

// Side statuses.
const SIDE_STATUS_REFLECT    = 0x0001;
const SIDE_STATUS_LIGHTSCREEN = 0x0004;
void SIDE_STATUS_LIGHTSCREEN;

// Battle type flags.
const BATTLE_TYPE_DOUBLE   = 0x0001;

// Weather bits.
const B_WEATHER_RAIN_TEMPORARY = 0x01;
const B_WEATHER_RAIN_DOWNPOUR  = 0x02;
const B_WEATHER_RAIN_PERMANENT = 0x04;
const B_WEATHER_RAIN = B_WEATHER_RAIN_TEMPORARY | B_WEATHER_RAIN_DOWNPOUR | B_WEATHER_RAIN_PERMANENT;
const B_WEATHER_SANDSTORM = 0x18;
const B_WEATHER_SUN       = 0x60;
const B_WEATHER_HAIL      = 0x80;

// Abilities (= include/constants/pokemon.h).
const ABILITY_THICK_FAT    = 47;
const ABILITY_HUGE_POWER   = 37;
const ABILITY_PURE_POWER   = 74;
const ABILITY_HUSTLE       = 55;
const ABILITY_GUTS         = 62;
const ABILITY_MARVEL_SCALE = 63;
const ABILITY_OVERGROW     = 65;
const ABILITY_BLAZE        = 66;
const ABILITY_TORRENT      = 67;
const ABILITY_SWARM        = 68;

// 1:1 décomp `gStatStageRatios[MAX_STAT_STAGE + 1][2]` (pokemon.c:1869-1884).
const gStatStageRatios: ReadonlyArray<readonly [number, number]> = [
  [10, 40], [10, 35], [10, 30], [10, 25], [10, 20], [10, 15], [10, 10],
  [15, 10], [20, 10], [25, 10], [30, 10], [35, 10], [40, 10],
];

// MOVE_SOLAR_BEAM (= 76).
const MOVE_SOLAR_BEAM = 76;

// EFFECT_EXPLOSION (= 7).
const EFFECT_EXPLOSION = 7;

// ─── Helpers ────────────────────────────────────────────────────────────────

/** IS_TYPE_PHYSICAL (= include/battle.h:466). */
function isTypePhysical(t: number): boolean { return t < TYPE_MYSTERY; }
/** IS_TYPE_SPECIAL (= include/battle.h:467). */
function isTypeSpecial(t: number): boolean { return t > TYPE_MYSTERY; }

/** APPLY_STAT_MOD inline (= pokemon.c:3101 macro). */
function applyStatMod(mon: BattleMon, stat: number, statIndex: number): number {
  const stage = mon.statStages[statIndex] ?? DEFAULT_STAT_STAGE;
  const ratio = gStatStageRatios[stage] ?? [10, 10];
  return Math.floor((stat * ratio[0]) / ratio[1]);
}

/** WEATHER_HAS_EFFECT2 helper — true si weather a un effet (= aucune ability
 *  Air Lock / Cloud Nine sur le field). Pour MVP : retourne true tant que
 *  weather est set. TODO : check abilities pour Air Lock / Cloud Nine. */
function weatherHasEffect(): boolean { return true; }

/** Stub : badge boost (post-gym +10%). TODO quand badge persistence wired. */
function shouldGetStatBadgeBoost(_badgeFlag: number, _battler: number): boolean {
  return false;
}

/** Stub : CountAliveMonsInBattle. Pour singles → 1. TODO double battle. */
function countAliveMonsInBattle(_caseId: number): number { return 1; }

// 1:1 décomp `BATTLE_ALIVE_*` (include/constants/battle.h).
const BATTLE_ALIVE_DEF_SIDE = 2;

// ─── CalculateBaseDamage ────────────────────────────────────────────────────

/** 1:1 décomp `s32 CalculateBaseDamage(struct BattlePokemon *attacker,
 *  struct BattlePokemon *defender, u32 move, u16 sideStatus, u16 powerOverride,
 *  u8 typeOverride, u8 battlerIdAtk, u8 battlerIdDef)` (pokemon.c:3107-3373).
 *
 *  Returns damage en s32 (= peut être ~0 si type immune, peut être > 32k pour
 *  hits very strong avec crit).
 *
 *  Side effect : modifie `gBattleMovePower` (= power post-ability/weather boosts).
 *  Notre port : retourne aussi {damage, gBattleMovePower} pour caller. */
export function CalculateBaseDamage(
  attacker: BattleMon,
  defender: BattleMon,
  move: number,
  sideStatus: number,
  powerOverride: number,
  typeOverride: number,
  battlerIdAtk: number,
  battlerIdDef: number,
): { damage: number; powerOut: number } {
  let damage = 0;
  let damageHelper: number;
  let type: number;
  let attack = attacker.attack;
  let defense = defender.defense;
  let spAttack = attacker.spAttack;
  let spDefense = defender.spDefense;

  const moveData = getBattleMove(move);
  let gBattleMovePower = powerOverride || moveData.power;
  type = typeOverride ? (typeOverride & 0x3F) : moveData.type;

  // Hold effect lookup (= stub pour now, retourne 0).
  // TODO porter sHoldEffectToType + GetItemHoldEffect.
  const attackerHoldEffect = 0;
  const defenderHoldEffect = 0;

  // Huge Power / Pure Power : attack × 2.
  if (attacker.ability === ABILITY_HUGE_POWER || attacker.ability === ABILITY_PURE_POWER) {
    attack *= 2;
  }

  // Badge boosts (+10% per stat). TODO post-gym.
  if (shouldGetStatBadgeBoost(0x844 /* FLAG_BADGE01_GET */, battlerIdAtk))
    attack = Math.floor((110 * attack) / 100);
  if (shouldGetStatBadgeBoost(0x848 /* FLAG_BADGE05_GET */, battlerIdDef))
    defense = Math.floor((110 * defense) / 100);
  if (shouldGetStatBadgeBoost(0x84A /* FLAG_BADGE07_GET */, battlerIdAtk))
    spAttack = Math.floor((110 * spAttack) / 100);
  if (shouldGetStatBadgeBoost(0x84A /* FLAG_BADGE07_GET */, battlerIdDef))
    spDefense = Math.floor((110 * spDefense) / 100);

  // Type-bonus hold items (sHoldEffectToType iterate). TODO porter table.
  void attackerHoldEffect;
  void defenderHoldEffect;

  // Apply abilities / field sports.
  if (defender.ability === ABILITY_THICK_FAT && (type === TYPE_FIRE || type === TYPE_ICE)) {
    spAttack = Math.floor(spAttack / 2);
  }
  if (attacker.ability === ABILITY_HUSTLE) {
    attack = Math.floor((150 * attack) / 100);
  }
  // ABILITY_PLUS/MINUS : skip (= cross-mon partner check, rare in singles).
  if (attacker.ability === ABILITY_GUTS && attacker.status1) {
    attack = Math.floor((150 * attack) / 100);
  }
  if (defender.ability === ABILITY_MARVEL_SCALE && defender.status1) {
    defense = Math.floor((150 * defense) / 100);
  }
  // Mud Sport / Water Sport : skip (= AbilityBattleEffects helper TODO).

  // Pinch boosters (Overgrow/Blaze/Torrent/Swarm at <= 1/3 HP).
  if (type === TYPE_GRASS && attacker.ability === ABILITY_OVERGROW && attacker.hp <= Math.floor(attacker.maxHP / 3)) {
    gBattleMovePower = Math.floor((150 * gBattleMovePower) / 100);
  }
  if (type === TYPE_FIRE && attacker.ability === ABILITY_BLAZE && attacker.hp <= Math.floor(attacker.maxHP / 3)) {
    gBattleMovePower = Math.floor((150 * gBattleMovePower) / 100);
  }
  if (type === TYPE_WATER && attacker.ability === ABILITY_TORRENT && attacker.hp <= Math.floor(attacker.maxHP / 3)) {
    gBattleMovePower = Math.floor((150 * gBattleMovePower) / 100);
  }
  if (type === TYPE_BUG && attacker.ability === ABILITY_SWARM && attacker.hp <= Math.floor(attacker.maxHP / 3)) {
    gBattleMovePower = Math.floor((150 * gBattleMovePower) / 100);
  }

  // Self-destruct / Explosion cut defense in half.
  if (getBattleMove(gCurrentMove).effect === EFFECT_EXPLOSION) {
    defense = Math.floor(defense / 2);
  }

  // ─── Physical formula ─────────────────────────────────────────────────
  if (isTypePhysical(type)) {
    // Attack stage : ignore drop si crit.
    if (gCritMultiplier === 2) {
      if (attacker.statStages[STAT_ATK] > DEFAULT_STAT_STAGE) {
        damage = applyStatMod(attacker, attack, STAT_ATK);
      } else {
        damage = attack;
      }
    } else {
      damage = applyStatMod(attacker, attack, STAT_ATK);
    }

    damage = damage * gBattleMovePower;
    damage *= (Math.floor(2 * attacker.level / 5) + 2);

    // Defense stage : ignore boost si crit.
    if (gCritMultiplier === 2) {
      if (defender.statStages[STAT_DEF] < DEFAULT_STAT_STAGE) {
        damageHelper = applyStatMod(defender, defense, STAT_DEF);
      } else {
        damageHelper = defense;
      }
    } else {
      damageHelper = applyStatMod(defender, defense, STAT_DEF);
    }

    damage = Math.floor(damage / damageHelper);
    damage = Math.floor(damage / 50);

    // Burn ÷2 (sans Guts).
    if ((attacker.status1 & STATUS1_BURN) && attacker.ability !== ABILITY_GUTS) {
      damage = Math.floor(damage / 2);
    }

    // Reflect ÷2 (non-crit).
    if ((sideStatus & SIDE_STATUS_REFLECT) && gCritMultiplier === 1) {
      if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE) && countAliveMonsInBattle(BATTLE_ALIVE_DEF_SIDE) === 2) {
        damage = 2 * Math.floor(damage / 3);
      } else {
        damage = Math.floor(damage / 2);
      }
    }

    // Moves hitting both ÷2 in doubles.
    const MOVE_TARGET_BOTH = 0x08;
    if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE) && getBattleMove(move).target === MOVE_TARGET_BOTH && countAliveMonsInBattle(BATTLE_ALIVE_DEF_SIDE) === 2) {
      damage = Math.floor(damage / 2);
    }

    // Min 1 damage.
    if (damage === 0) damage = 1;
  }

  // Mystery type → 0 damage.
  if (type === TYPE_MYSTERY) damage = 0;

  // ─── Special formula ─────────────────────────────────────────────────
  if (isTypeSpecial(type)) {
    if (gCritMultiplier === 2) {
      if (attacker.statStages[STAT_SPATK] > DEFAULT_STAT_STAGE) {
        damage = applyStatMod(attacker, spAttack, STAT_SPATK);
      } else {
        damage = spAttack;
      }
    } else {
      damage = applyStatMod(attacker, spAttack, STAT_SPATK);
    }

    damage = damage * gBattleMovePower;
    damage *= (Math.floor(2 * attacker.level / 5) + 2);

    if (gCritMultiplier === 2) {
      if (defender.statStages[STAT_SPDEF] < DEFAULT_STAT_STAGE) {
        damageHelper = applyStatMod(defender, spDefense, STAT_SPDEF);
      } else {
        damageHelper = spDefense;
      }
    } else {
      damageHelper = applyStatMod(defender, spDefense, STAT_SPDEF);
    }

    damage = Math.floor(damage / damageHelper);
    damage = Math.floor(damage / 50);

    // Light Screen ÷2 (non-crit).
    if ((sideStatus & SIDE_STATUS_LIGHTSCREEN) && gCritMultiplier === 1) {
      if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE) && countAliveMonsInBattle(BATTLE_ALIVE_DEF_SIDE) === 2) {
        damage = 2 * Math.floor(damage / 3);
      } else {
        damage = Math.floor(damage / 2);
      }
    }

    // Both targets ÷2 in doubles.
    const MOVE_TARGET_BOTH = 0x08;
    if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE) && getBattleMove(move).target === MOVE_TARGET_BOTH && countAliveMonsInBattle(BATTLE_ALIVE_DEF_SIDE) === 2) {
      damage = Math.floor(damage / 2);
    }

    // Weather modifiers (= seulement si pas Air Lock / Cloud Nine).
    if (weatherHasEffect()) {
      // Rain weakens Fire, boosts Water.
      if (gBattleWeather & B_WEATHER_RAIN_TEMPORARY) {
        if (type === TYPE_FIRE) damage = Math.floor(damage / 2);
        else if (type === TYPE_WATER) damage = Math.floor((15 * damage) / 10);
      }
      // Any weather except sun weakens Solar Beam.
      if ((gBattleWeather & (B_WEATHER_RAIN | B_WEATHER_SANDSTORM | B_WEATHER_HAIL)) && gCurrentMove === MOVE_SOLAR_BEAM) {
        damage = Math.floor(damage / 2);
      }
      // Sun boosts Fire, weakens Water.
      if (gBattleWeather & B_WEATHER_SUN) {
        if (type === TYPE_FIRE) damage = Math.floor((15 * damage) / 10);
        else if (type === TYPE_WATER) damage = Math.floor(damage / 2);
      }
    }

    // Flash Fire boost — TODO porter gBattleResources flags.
  }

  // Final + 2.
  return { damage: damage + 2, powerOut: gBattleMovePower };
}

/** 1:1 décomp `Cmd_damagecalc` (battle_script_commands.c:1290-1313).
 *
 *  Wraps CalculateBaseDamage avec :
 *    × gCritMultiplier
 *    × gBattleScripting.dmgMultiplier
 *    + STATUS3_CHARGED_UP electric × 2 — TODO
 *    + gProtectStructs[attacker].helpingHand ×1.5 — TODO
 *
 *  Set gBattleMoveDamage. */
export function runDamagecalc(
  sideStatus: number,
  dynamicBasePower: number,
  dynamicMoveType: number,
): number {
  const attacker = gBattleMons[gBattlerAttacker];
  const defender = gBattleMons[gBattlerTarget];
  const { damage } = CalculateBaseDamage(
    attacker, defender, gCurrentMove,
    sideStatus, dynamicBasePower, dynamicMoveType,
    gBattlerAttacker, gBattlerTarget,
  );
  let dmg = damage * gCritMultiplier * gBattleScripting.dmgMultiplier;

  // STATUS3_CHARGED_UP electric : × 2. TODO porter gStatuses3.
  // gProtectStructs[attacker].helpingHand : × 1.5. TODO.
  void dmg;

  return damage * gCritMultiplier * gBattleScripting.dmgMultiplier;
}
