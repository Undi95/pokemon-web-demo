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
import {
  TYPE_MYSTERY,
  TYPE_FIRE,
  TYPE_WATER,
  TYPE_BUG,
  TYPE_GRASS,
  TYPE_ICE,
  STAT_ATK,
  STAT_DEF,
  STAT_SPATK,
  STAT_SPDEF,
  DEFAULT_STAT_STAGE,
  STATUS1_BURN,
  SIDE_STATUS_REFLECT,
  SIDE_STATUS_LIGHTSCREEN,
  BATTLE_TYPE_DOUBLE,
  B_WEATHER_RAIN_TEMPORARY,
  B_WEATHER_RAIN,
  B_WEATHER_SANDSTORM,
  B_WEATHER_SUN,
  B_WEATHER_HAIL,
  ABILITY_THICK_FAT,
  ABILITY_HUGE_POWER,
  ABILITY_PURE_POWER,
  ABILITY_HUSTLE,
  ABILITY_GUTS,
  ABILITY_MARVEL_SCALE,
  ABILITY_OVERGROW,
  ABILITY_BLAZE,
  ABILITY_TORRENT,
  ABILITY_SWARM,
  MOVE_SOLAR_BEAM,
  EFFECT_EXPLOSION,
  IS_TYPE_PHYSICAL,
  IS_TYPE_SPECIAL,
} from './constants';

// ─── Local data ────────────────────────────────────────────────────────────

// 1:1 décomp `gStatStageRatios[MAX_STAT_STAGE + 1][2]` (pokemon.c:1869-1884).
const gStatStageRatios: ReadonlyArray<readonly [number, number]> = [
  [10, 40], [10, 35], [10, 30], [10, 25], [10, 20], [10, 15], [10, 10],
  [15, 10], [20, 10], [25, 10], [30, 10], [35, 10], [40, 10],
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const isTypePhysical = IS_TYPE_PHYSICAL;
const isTypeSpecial = IS_TYPE_SPECIAL;

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

/** Wraps `CalculateBaseDamage` 1:1 décomp (= retourne damage BASE pre-crit
 *  multiplier). Le caller (Cmd_damagecalc) applique gCritMultiplier ×
 *  gBattleScripting.dmgMultiplier + STATUS3_CHARGED_UP + helpingHand. */
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
  return damage;
}
