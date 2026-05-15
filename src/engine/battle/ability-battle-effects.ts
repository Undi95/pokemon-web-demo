/**
 * battle/ability-battle-effects.ts — 1:1 décomp `AbilityBattleEffects(caseID,
 * battler, ability, special, moveArg)` (battle_util.c:2414..3200, ~769 lignes).
 *
 * Cette fonction est le coeur des ability checks en battle. Switch sur caseID
 * (= ABILITYEFFECT_*) qui détermine quel ability check on fait.
 *
 * Sources de vérité (1:1) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_util.c:2414..3200`
 *   - `D:/Projet 1/decomps/pokeemeraude/include/battle_util.h:12..34`
 *     ABILITYEFFECT_*
 *
 * État porté (session 136) :
 *   - ABILITYEFFECT_MOVES_BLOCK (Soundproof)
 *   - ABILITYEFFECT_ABSORBING (Volt Absorb, Water Absorb, Flash Fire)
 *   - ABILITYEFFECT_IMMUNITY (Limber, Insomnia, Vital Spirit, Water Veil,
 *     Magma Armor, Own Tempo, Oblivious, Immunity)
 *   - ABILITYEFFECT_CHECK_ON_FIELD / CHECK_BATTLER_SIDE / CHECK_OTHER_SIDE /
 *     CHECK_FIELD_EXCEPT_BATTLER / COUNT_*
 *
 * État stubbé (TODO sessions futures) :
 *   - ABILITYEFFECT_ON_SWITCHIN (= Intimidate, Drought, Drizzle, Sand Stream,
 *     Trace, Forecast, Cloud Nine — gros pavé ~120 lignes décomp)
 *   - ABILITYEFFECT_ENDTURN (= Speed Boost, Shed Skin, etc.)
 *   - ABILITYEFFECT_ON_DAMAGE (= Rough Skin, Static, Effect Spore, Color Change)
 *   - ABILITYEFFECT_FORECAST / SYNCHRONIZE / ATK_SYNCHRONIZE
 *   - ABILITYEFFECT_INTIMIDATE1/2 / TRACE / FIELD_SPORT
 */

import {
  gBattleMons, gBattlerAttacker, setBattlerAttacker, gBattlerTarget, gActiveBattler,
  gBattlersCount, gBattleTypeFlags, gCurrentMove, gBattleCommunication,
  gBattleMoveDamage, setBattleMoveDamage,
  gHitMarker, setHitMarker,
  gLastUsedAbility, setLastUsedAbility,
  gBattleScripting,
  gProtectStructs,
  gBattleWeather, setBattleWeather,
  gStatuses3,
  gSpecialStatuses,
  setFormToChangeInto,
  gDisableStructs,
  setIntimidateBattler,
} from './state';
import { Random, getBattleScriptOffset } from './script-interpreter';
import {
  ABILITY_SOUNDPROOF, ABILITY_VOLT_ABSORB, ABILITY_WATER_ABSORB, ABILITY_FLASH_FIRE,
  ABILITY_IMMUNITY, ABILITY_OWN_TEMPO, ABILITY_LIMBER, ABILITY_INSOMNIA,
  ABILITY_VITAL_SPIRIT, ABILITY_WATER_VEIL, ABILITY_MAGMA_ARMOR, ABILITY_OBLIVIOUS,
  ABILITY_DRIZZLE, ABILITY_SAND_STREAM, ABILITY_DROUGHT, ABILITY_INTIMIDATE,
  ABILITY_TRACE, ABILITY_CLOUD_NINE, ABILITY_AIR_LOCK, ABILITY_FORECAST,
  ABILITY_RAIN_DISH, ABILITY_SHED_SKIN, ABILITY_SPEED_BOOST, ABILITY_TRUANT,
  STAT_SPEED, MAX_STAT_STAGE, STATUS1_ANY,
  TYPE_ELECTRIC, TYPE_WATER, TYPE_FIRE,
  STATUS1_POISON, STATUS1_TOXIC_POISON, STATUS1_BURN, STATUS1_FREEZE,
  STATUS1_PARALYSIS, STATUS1_SLEEP,
  STATUS2_NIGHTMARE, STATUS2_CONFUSION, STATUS2_INFATUATION, STATUS2_MULTIPLETURNS,
  STATUS3_INTIMIDATE_POKES, STATUS3_TRACE,
  STATUS3_MUDSPORT, STATUS3_WATERSPORT,
  HITMARKER_NO_PPDEDUCT,
  BATTLE_TYPE_SAFARI,
  B_WEATHER_RAIN, B_WEATHER_RAIN_TEMPORARY, B_WEATHER_RAIN_PERMANENT,
  B_WEATHER_SANDSTORM, B_WEATHER_SANDSTORM_PERMANENT,
  B_WEATHER_SUN, B_WEATHER_SUN_PERMANENT,
  GET_BATTLER_SIDE,
} from './constants';
import { getBattleMove } from './data/battle-moves';

// ─── ABILITYEFFECT_* enum (= 1:1 décomp battle_util.h:12-34) ──────────────

export const ABILITYEFFECT_ON_SWITCHIN = 0;
export const ABILITYEFFECT_ENDTURN = 1;
export const ABILITYEFFECT_MOVES_BLOCK = 2;
export const ABILITYEFFECT_ABSORBING = 3;
export const ABILITYEFFECT_ON_DAMAGE = 4;
export const ABILITYEFFECT_IMMUNITY = 5;
export const ABILITYEFFECT_FORECAST = 6;
export const ABILITYEFFECT_SYNCHRONIZE = 7;
export const ABILITYEFFECT_ATK_SYNCHRONIZE = 8;
export const ABILITYEFFECT_INTIMIDATE1 = 9;
export const ABILITYEFFECT_INTIMIDATE2 = 10;
export const ABILITYEFFECT_TRACE = 11;
export const ABILITYEFFECT_CHECK_OTHER_SIDE = 12;
export const ABILITYEFFECT_CHECK_BATTLER_SIDE = 13;
export const ABILITYEFFECT_FIELD_SPORT = 14;
export const ABILITYEFFECT_CHECK_FIELD_EXCEPT_BATTLER = 15;
export const ABILITYEFFECT_COUNT_OTHER_SIDE = 16;
export const ABILITYEFFECT_COUNT_BATTLER_SIDE = 17;
export const ABILITYEFFECT_COUNT_ON_FIELD = 18;
export const ABILITYEFFECT_CHECK_ON_FIELD = 19;
export const ABILITYEFFECT_MUD_SPORT = 253;
export const ABILITYEFFECT_WATER_SPORT = 254;
export const ABILITYEFFECT_SWITCH_IN_WEATHER = 255;

// ─── sSoundMovesTable (battle_util.c:688) ────────────────────────────────

/** 1:1 décomp `sSoundMovesTable[]`. Liste des moves "sound" bloqués par
 *  Soundproof. Terminé par SOUND_MOVES_END (= 0xFFFF). */
const SOUND_MOVES_END = 0xFFFF;
const sSoundMovesTable: number[] = [
  44  /* MOVE_GROWL */,
  46  /* MOVE_ROAR */,
  47  /* MOVE_SING */,
  48  /* MOVE_SUPERSONIC */,
  103 /* MOVE_SCREECH */,
  173 /* MOVE_SNORE */,
  253 /* MOVE_UPROAR */,
  319 /* MOVE_METAL_SOUND */,
  320 /* MOVE_GRASS_WHISTLE */,
  304 /* MOVE_HYPER_VOICE */,
  SOUND_MOVES_END,
];

// ─── Helpers ────────────────────────────────────────────────────────────────

/** 1:1 décomp `GET_MOVE_TYPE(move, moveType)` macro. */
function _getMoveType(move: number): number {
  return getBattleMove(move).type;
}

/** 1:1 stub `RecordAbilityBattle(battler, ability)`. */
function _recordAbilityBattle(_battler: number, _ability: number): void {}

/** 1:1 stub `WEATHER_HAS_EFFECT` macro (= !CloudNine && !AirLock active).
 *  Pour MVP : true. TODO check Cloud Nine / Air Lock présence. */
const _WEATHER_HAS_EFFECT = true;

/** 1:1 décomp `gBattleResources->flags->flags[battler] & RESOURCE_FLAG_FLASH_FIRE`.
 *  Notre port : map battler → bit set. */
const _flashFireFlags: number[] = [0, 0, 0, 0];
const RESOURCE_FLAG_FLASH_FIRE = 1 << 0;

// B_MSG_* indices.
const B_MSG_FLASH_FIRE_BOOST = 0;
const B_MSG_FLASH_FIRE_NO_BOOST = 1;
const MULTISTRING_CHOOSER_IDX = 5;

// ─── Main fn ────────────────────────────────────────────────────────────────

/** 1:1 décomp `AbilityBattleEffects(u8 caseID, u8 battler, u8 ability,
 *  u8 special, u16 moveArg)`. Returns effect (0 = nothing, >0 = effect happened). */
export function AbilityBattleEffects(
  caseID: number,
  battlerArg: number,
  ability: number,
  special: number,
  moveArg: number,
): number {
  let effect = 0;
  let battler = battlerArg;

  if (gBattleTypeFlags & BATTLE_TYPE_SAFARI) return 0;

  if (special) {
    setLastUsedAbility(special);
  } else {
    setLastUsedAbility(gBattleMons[battler].ability);
  }

  const move = moveArg !== 0 ? moveArg : gCurrentMove;
  const moveType = _getMoveType(move);

  switch (caseID) {
    case ABILITYEFFECT_ON_SWITCHIN: {
      // 1:1 décomp battle_util.c:2468-2583.
      if (gBattlerAttacker >= gBattlersCount) {
        setBattlerAttacker(battler);
      }
      switch (gLastUsedAbility) {
        case ABILITYEFFECT_SWITCH_IN_WEATHER:
          // 1:1 partial : overworld weather influence (= GetCurrentWeather pas
          // wired battle-side). Skip pour MVP. TODO porter quand gameStateWeather
          // wired.
          break;
        case ABILITY_DRIZZLE:
          if (!(gBattleWeather & B_WEATHER_RAIN_PERMANENT)) {
            setBattleWeather(B_WEATHER_RAIN_PERMANENT | B_WEATHER_RAIN_TEMPORARY);
            _lastWantedScriptLabel = 'BattleScript_DrizzleActivates';
            gBattleScripting.battler = battler;
            effect++;
          }
          break;
        case ABILITY_SAND_STREAM:
          if (!(gBattleWeather & B_WEATHER_SANDSTORM_PERMANENT)) {
            setBattleWeather(B_WEATHER_SANDSTORM);
            _lastWantedScriptLabel = 'BattleScript_SandstreamActivates';
            gBattleScripting.battler = battler;
            effect++;
          }
          break;
        case ABILITY_DROUGHT:
          if (!(gBattleWeather & B_WEATHER_SUN_PERMANENT)) {
            setBattleWeather(B_WEATHER_SUN);
            _lastWantedScriptLabel = 'BattleScript_DroughtActivates';
            gBattleScripting.battler = battler;
            effect++;
          }
          break;
        case ABILITY_INTIMIDATE:
          if (!gSpecialStatuses[battler].intimidatedMon) {
            gStatuses3[battler] |= STATUS3_INTIMIDATE_POKES;
            gSpecialStatuses[battler].intimidatedMon = 1;
          }
          break;
        case ABILITY_FORECAST: {
          // 1:1 partial : CastformDataTypeChange non porté. Skip — return 0.
          // TODO porter CastformDataTypeChange quand on a Castform forms.
          void setFormToChangeInto;
          break;
        }
        case ABILITY_TRACE:
          if (!gSpecialStatuses[battler].traced) {
            gStatuses3[battler] |= STATUS3_TRACE;
            gSpecialStatuses[battler].traced = 1;
          }
          break;
        case ABILITY_CLOUD_NINE:
        case ABILITY_AIR_LOCK: {
          // 1:1 partial : Cloud Nine / Air Lock cancel weather sur Castform.
          // Notre Castform pas implémenté → no-op.
          // TODO porter CastformDataTypeChange.
          for (let target1 = 0; target1 < gBattlersCount; target1++) {
            void target1;
          }
          break;
        }
      }
      break;
    }

    case ABILITYEFFECT_ENDTURN: {
      // 1:1 décomp battle_util.c:2584-2641.
      if (gBattleMons[battler].hp !== 0) {
        setBattlerAttacker(battler);
        switch (gLastUsedAbility) {
          case ABILITY_RAIN_DISH:
            if (_WEATHER_HAS_EFFECT && (gBattleWeather & B_WEATHER_RAIN)
                && gBattleMons[battler].maxHP > gBattleMons[battler].hp) {
              _lastWantedScriptLabel = 'BattleScript_RainDishActivates';
              let dmg = Math.floor(gBattleMons[battler].maxHP / 16);
              if (dmg === 0) dmg = 1;
              setBattleMoveDamage(-dmg);
              effect++;
            }
            break;
          case ABILITY_SHED_SKIN:
            if ((gBattleMons[battler].status1 & STATUS1_ANY) && (Random() % 3) === 0) {
              gBattleMons[battler].status1 = 0;
              gBattleMons[battler].status2 &= ~STATUS2_NIGHTMARE;
              gBattleScripting.battler = battler;
              // gActiveBattler = battler (= côté caller).
              _lastWantedScriptLabel = 'BattleScript_ShedSkinActivates';
              effect++;
            }
            break;
          case ABILITY_SPEED_BOOST:
            if (gBattleMons[battler].statStages[STAT_SPEED] < MAX_STAT_STAGE
                && gDisableStructs[battler].isFirstTurn !== 2) {
              gBattleMons[battler].statStages[STAT_SPEED]++;
              gBattleScripting.animArg1 = 14 /* STAT_ANIM_PLUS1 */ + STAT_SPEED;
              gBattleScripting.animArg2 = 0;
              _lastWantedScriptLabel = 'BattleScript_SpeedBoostActivates';
              gBattleScripting.battler = battler;
              effect++;
            }
            break;
          case ABILITY_TRUANT:
            gDisableStructs[gBattlerAttacker].truantCounter ^= 1;
            break;
        }
      }
      break;
    }

    case ABILITYEFFECT_MOVES_BLOCK: {
      // 1:1 décomp Soundproof block (battle_util.c:2642-2658).
      if (gLastUsedAbility === ABILITY_SOUNDPROOF) {
        let i = 0;
        for (; sSoundMovesTable[i] !== SOUND_MOVES_END; i++) {
          if (sSoundMovesTable[i] === move) break;
        }
        if (sSoundMovesTable[i] !== SOUND_MOVES_END) {
          if (gBattleMons[gBattlerAttacker].status2 & STATUS2_MULTIPLETURNS) {
            setHitMarker(gHitMarker | HITMARKER_NO_PPDEDUCT);
          }
          // 1:1 : gBattlescriptCurrInstr = BattleScript_SoundproofProtected.
          // L'appelant ré-utilisera gLastUsedAbility / effect pour appliquer.
          // Notre return : effect = 1. Le caller fera setPtr.
          const _off = getBattleScriptOffset('BattleScript_SoundproofProtected');
          // L'appelant doit consumer le return effect=1 et set scriptPtr.
          // Pour compat avec d'autres call-sites qui directement set scriptPtr
          // ici, on stocke le label voulu dans une var partagée.
          _lastWantedScriptLabel = 'BattleScript_SoundproofProtected';
          void _off;
          effect = 1;
        }
      }
      break;
    }

    case ABILITYEFFECT_ABSORBING: {
      // 1:1 décomp Volt/Water Absorb + Flash Fire (battle_util.c:2659-2731).
      if (move) {
        switch (gLastUsedAbility) {
          case ABILITY_VOLT_ABSORB:
            if (moveType === TYPE_ELECTRIC && getBattleMove(move).power !== 0) {
              _lastWantedScriptLabel = gProtectStructs[gBattlerAttacker].notFirstStrike
                ? 'BattleScript_MoveHPDrain'
                : 'BattleScript_MoveHPDrain_PPLoss';
              effect = 1;
            }
            break;
          case ABILITY_WATER_ABSORB:
            if (moveType === TYPE_WATER && getBattleMove(move).power !== 0) {
              _lastWantedScriptLabel = gProtectStructs[gBattlerAttacker].notFirstStrike
                ? 'BattleScript_MoveHPDrain'
                : 'BattleScript_MoveHPDrain_PPLoss';
              effect = 1;
            }
            break;
          case ABILITY_FLASH_FIRE:
            if (moveType === TYPE_FIRE && !(gBattleMons[battler].status1 & STATUS1_FREEZE)) {
              if (!(_flashFireFlags[battler] & RESOURCE_FLAG_FLASH_FIRE)) {
                gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_FLASH_FIRE_BOOST;
                _lastWantedScriptLabel = gProtectStructs[gBattlerAttacker].notFirstStrike
                  ? 'BattleScript_FlashFireBoost'
                  : 'BattleScript_FlashFireBoost_PPLoss';
                _flashFireFlags[battler] |= RESOURCE_FLAG_FLASH_FIRE;
                effect = 2;
              } else {
                gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_FLASH_FIRE_NO_BOOST;
                _lastWantedScriptLabel = gProtectStructs[gBattlerAttacker].notFirstStrike
                  ? 'BattleScript_FlashFireBoost'
                  : 'BattleScript_FlashFireBoost_PPLoss';
                effect = 2;
              }
            }
            break;
        }
        // 1:1 : effect = 1 (= absorb) → HP heal MaxHP/4, except maxHP == hp.
        if (effect === 1) {
          if (gBattleMons[battler].maxHP === gBattleMons[battler].hp) {
            _lastWantedScriptLabel = gProtectStructs[gBattlerAttacker].notFirstStrike
              ? 'BattleScript_MonMadeMoveUseless'
              : 'BattleScript_MonMadeMoveUseless_PPLoss';
          } else {
            let dmg = Math.floor(gBattleMons[battler].maxHP / 4);
            if (dmg === 0) dmg = 1;
            setBattleMoveDamage(-dmg);
          }
        }
      }
      break;
    }

    case ABILITYEFFECT_IMMUNITY: {
      // 1:1 décomp battle_util.c:2856-2937.
      for (battler = 0; battler < gBattlersCount; battler++) {
        let localEffect = 0;
        switch (gBattleMons[battler].ability) {
          case ABILITY_IMMUNITY:
            if (gBattleMons[battler].status1 & (STATUS1_POISON | STATUS1_TOXIC_POISON)) {
              localEffect = 1;
            }
            break;
          case ABILITY_OWN_TEMPO:
            if (gBattleMons[battler].status2 & STATUS2_CONFUSION) {
              localEffect = 2;
            }
            break;
          case ABILITY_LIMBER:
            if (gBattleMons[battler].status1 & STATUS1_PARALYSIS) {
              localEffect = 1;
            }
            break;
          case ABILITY_INSOMNIA:
          case ABILITY_VITAL_SPIRIT:
            if (gBattleMons[battler].status1 & STATUS1_SLEEP) {
              gBattleMons[battler].status2 &= ~STATUS2_NIGHTMARE;
              localEffect = 1;
            }
            break;
          case ABILITY_WATER_VEIL:
            if (gBattleMons[battler].status1 & STATUS1_BURN) {
              localEffect = 1;
            }
            break;
          case ABILITY_MAGMA_ARMOR:
            if (gBattleMons[battler].status1 & STATUS1_FREEZE) {
              localEffect = 1;
            }
            break;
          case ABILITY_OBLIVIOUS:
            if (gBattleMons[battler].status2 & STATUS2_INFATUATION) {
              localEffect = 3;
            }
            break;
        }
        if (localEffect !== 0) {
          switch (localEffect) {
            case 1:
              gBattleMons[battler].status1 = 0;
              break;
            case 2:
              gBattleMons[battler].status2 &= ~STATUS2_CONFUSION;
              break;
            case 3:
              gBattleMons[battler].status2 &= ~STATUS2_INFATUATION;
              break;
          }
          _lastWantedScriptLabel = 'BattleScript_AbilityCuredStatus';
          gBattleScripting.battler = battler;
          // gActiveBattler = battler; (= côté caller)
          void gActiveBattler;
          return localEffect;
        }
      }
      break;
    }

    case ABILITYEFFECT_CHECK_ON_FIELD: {
      // 1:1 décomp battle_util.c:3123-3132.
      for (let i = 0; i < gBattlersCount; i++) {
        if (gBattleMons[i].ability === ability && gBattleMons[i].hp !== 0) {
          setLastUsedAbility(ability);
          effect = i + 1;
        }
      }
      break;
    }

    case ABILITYEFFECT_CHECK_FIELD_EXCEPT_BATTLER: {
      // 1:1 décomp battle_util.c:3133-3142.
      for (let i = 0; i < gBattlersCount; i++) {
        if (gBattleMons[i].ability === ability && i !== battler) {
          setLastUsedAbility(ability);
          effect = i + 1;
        }
      }
      break;
    }

    case ABILITYEFFECT_CHECK_BATTLER_SIDE: {
      const side = GET_BATTLER_SIDE(battler);
      for (let i = 0; i < gBattlersCount; i++) {
        if (GET_BATTLER_SIDE(i) === side && gBattleMons[i].ability === ability) {
          setLastUsedAbility(ability);
          effect = i + 1;
        }
      }
      break;
    }

    case ABILITYEFFECT_CHECK_OTHER_SIDE: {
      const side = GET_BATTLER_SIDE(battler);
      for (let i = 0; i < gBattlersCount; i++) {
        if (GET_BATTLER_SIDE(i) !== side && gBattleMons[i].ability === ability) {
          setLastUsedAbility(ability);
          effect = i + 1;
        }
      }
      break;
    }

    case ABILITYEFFECT_COUNT_OTHER_SIDE: {
      const side = GET_BATTLER_SIDE(battler);
      for (let i = 0; i < gBattlersCount; i++) {
        if (GET_BATTLER_SIDE(i) !== side && gBattleMons[i].ability === ability) {
          effect++;
        }
      }
      break;
    }

    case ABILITYEFFECT_COUNT_BATTLER_SIDE: {
      const side = GET_BATTLER_SIDE(battler);
      for (let i = 0; i < gBattlersCount; i++) {
        if (GET_BATTLER_SIDE(i) === side && gBattleMons[i].ability === ability) {
          effect++;
        }
      }
      break;
    }

    case ABILITYEFFECT_COUNT_ON_FIELD: {
      for (let i = 0; i < gBattlersCount; i++) {
        if (gBattleMons[i].ability === ability && i !== battler) {
          effect++;
        }
      }
      break;
    }

    case ABILITYEFFECT_INTIMIDATE1: {
      // 1:1 décomp battle_util.c:2986-2999.
      for (let i = 0; i < gBattlersCount; i++) {
        if (gBattleMons[i].ability === ABILITY_INTIMIDATE
            && (gStatuses3[i] & STATUS3_INTIMIDATE_POKES)) {
          setLastUsedAbility(ABILITY_INTIMIDATE);
          gStatuses3[i] &= ~STATUS3_INTIMIDATE_POKES;
          _lastWantedScriptLabel = 'BattleScript_IntimidateActivatesEnd3';
          setIntimidateBattler(i);
          effect++;
          break;
        }
      }
      break;
    }

    case ABILITYEFFECT_INTIMIDATE2: {
      // 1:1 décomp battle_util.c:3057-3070.
      for (let i = 0; i < gBattlersCount; i++) {
        if (gBattleMons[i].ability === ABILITY_INTIMIDATE
            && (gStatuses3[i] & STATUS3_INTIMIDATE_POKES)) {
          setLastUsedAbility(ABILITY_INTIMIDATE);
          gStatuses3[i] &= ~STATUS3_INTIMIDATE_POKES;
          _lastWantedScriptLabel = 'BattleScript_IntimidateActivates';
          setIntimidateBattler(i);
          effect++;
        }
      }
      break;
    }

    case ABILITYEFFECT_FIELD_SPORT: {
      // 1:1 décomp battle_util.c:3094-3122.
      switch (gLastUsedAbility) {
        case ABILITYEFFECT_MUD_SPORT:
          for (let i = 0; i < gBattlersCount; i++) {
            if (gStatuses3[i] & STATUS3_MUDSPORT) effect = i + 1;
          }
          break;
        case ABILITYEFFECT_WATER_SPORT:
          for (let i = 0; i < gBattlersCount; i++) {
            if (gStatuses3[i] & STATUS3_WATERSPORT) effect = i + 1;
          }
          break;
        default:
          for (let i = 0; i < gBattlersCount; i++) {
            if (gBattleMons[i].ability === ability) {
              setLastUsedAbility(ability);
              effect = i + 1;
            }
          }
          break;
      }
      break;
    }

    // ─── Stubs TODO Phase 1.2 E continuation ──────────────────────────────
    case ABILITYEFFECT_ON_DAMAGE:
    case ABILITYEFFECT_FORECAST:
    case ABILITYEFFECT_SYNCHRONIZE:
    case ABILITYEFFECT_ATK_SYNCHRONIZE:
    case ABILITYEFFECT_TRACE:
      // TODO porter ces cases — ~380 lignes décomp restantes.
      break;

    default:
      break;
  }

  // Silence unused warnings.
  void gBattlerAttacker; void gBattlerTarget; void gBattleMoveDamage;

  return effect;
}

/** Le label de script que AbilityBattleEffects veut jumper. Le caller doit
 *  le lire et set ctx.scriptPtr. Reset à null au début de chaque call.
 *
 *  Note : pas idéal vs le décomp qui mutate gBattlescriptCurrInstr direct ;
 *  ici on délègue au caller pour rester compatible avec notre dispatch
 *  loop. */
let _lastWantedScriptLabel: string | null = null;

/** Récupère et reset le label voulu (= used par caller post-AbilityBattleEffects). */
export function consumeAbilityWantedScript(): string | null {
  const v = _lastWantedScriptLabel;
  _lastWantedScriptLabel = null;
  return v;
}
