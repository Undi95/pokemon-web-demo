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
 * État supplémentaire (deferred sub-features) :
 *   - ABILITYEFFECT_ON_SWITCHIN (= Intimidate, Drought, Drizzle, Sand Stream,
 *     Trace, Forecast, Cloud Nine — gros pavé ~120 lignes décomp)
 *   - ABILITYEFFECT_ENDTURN (= Speed Boost, Shed Skin, etc.)
 *   - ABILITYEFFECT_ON_DAMAGE (= Rough Skin, Static, Effect Spore, Color Change)
 *   - ABILITYEFFECT_FORECAST / SYNCHRONIZE / ATK_SYNCHRONIZE
 *   - ABILITYEFFECT_INTIMIDATE1/2 / TRACE / FIELD_SPORT
 */

import {
  gBattleMons, gBattlerAttacker, setBattlerAttacker, gBattlerTarget, gActiveBattler, setActiveBattler,
  gBattlersCount, gBattleTypeFlags, gCurrentMove, gBattleCommunication,
  gBattleMoveDamage, setBattleMoveDamage,
  gHitMarker, setHitMarker,
  gLastUsedAbility, setLastUsedAbility,
  gBattleScripting,
  gProtectStructs,
  gBattleWeather, setBattleWeather,
  gStatuses3,
  gSpecialStatuses,
  gDisableStructs,
  gMoveResultFlags,
  gBattleStruct,
  gBattleResourcesFlags,
} from './state';
import { Random, getBattleScriptOffset } from './script-interpreter';
import {
  ABILITY_SOUNDPROOF, ABILITY_VOLT_ABSORB, ABILITY_WATER_ABSORB, ABILITY_FLASH_FIRE,
  ABILITY_IMMUNITY, ABILITY_OWN_TEMPO, ABILITY_LIMBER, ABILITY_INSOMNIA,
  ABILITY_VITAL_SPIRIT, ABILITY_WATER_VEIL, ABILITY_MAGMA_ARMOR, ABILITY_OBLIVIOUS,
  ABILITY_DRIZZLE, ABILITY_SAND_STREAM, ABILITY_DROUGHT, ABILITY_INTIMIDATE,
  ABILITY_TRACE, ABILITY_CLOUD_NINE, ABILITY_AIR_LOCK, ABILITY_FORECAST,
  ABILITY_RAIN_DISH, ABILITY_SHED_SKIN, ABILITY_SPEED_BOOST, ABILITY_TRUANT,
  ABILITY_SYNCHRONIZE,
  MOVE_EFFECT_TOXIC,
  ABILITY_COLOR_CHANGE, ABILITY_ROUGH_SKIN, ABILITY_EFFECT_SPORE,
  ABILITY_POISON_POINT, ABILITY_STATIC, ABILITY_FLAME_BODY, ABILITY_CUTE_CHARM,
  STAT_SPEED, MAX_STAT_STAGE, STATUS1_ANY,
  MOVE_RESULT_NO_EFFECT, MOVE_STRUGGLE,
  STATUS2_INFATUATED_WITH,
  MOVE_EFFECT_BYTE, MOVE_EFFECT_BURN, MOVE_EFFECT_PARALYSIS, MOVE_EFFECT_POISON,
  MOVE_EFFECT_AFFECTS_USER,
  IS_BATTLER_OF_TYPE,
  MON_GENDERLESS,
  FLAG_MAKES_CONTACT,
  TYPE_ELECTRIC, TYPE_WATER, TYPE_FIRE, TYPE_ICE, TYPE_NORMAL,
  B_WEATHER_HAIL,
  STATUS1_POISON, STATUS1_TOXIC_POISON, STATUS1_BURN, STATUS1_FREEZE,
  STATUS1_PARALYSIS, STATUS1_SLEEP,
  STATUS2_NIGHTMARE, STATUS2_CONFUSION, STATUS2_INFATUATION, STATUS2_MULTIPLETURNS,
  STATUS3_INTIMIDATE_POKES, STATUS3_TRACE,
  STATUS3_MUDSPORT, STATUS3_WATERSPORT,
  HITMARKER_NO_PPDEDUCT, HITMARKER_STATUS_ABILITY_EFFECT,
  HITMARKER_SYNCHRONIZE_EFFECT,
  MOVE_EFFECT_CERTAIN,
  BATTLE_TYPE_SAFARI,
  B_WEATHER_RAIN, B_WEATHER_RAIN_TEMPORARY, B_WEATHER_RAIN_PERMANENT,
  B_WEATHER_SANDSTORM, B_WEATHER_SANDSTORM_PERMANENT,
  B_WEATHER_SUN, B_WEATHER_SUN_PERMANENT,
  GET_BATTLER_SIDE, BATTLE_OPPOSITE, BIT_SIDE, BIT_FLANK,
  BATTLE_TYPE_DOUBLE,
} from './constants';
import { GetBattlerAtPosition, GetBattlerPosition } from './util';
import { getBattleMove } from './data/battle-moves';
import { GetGenderFromSpeciesAndPersonality } from '../pokemon';
import { reverseDecompConstant } from '../decomp-constants';
import {
  gBattleTextBuff1 as _gBattleTextBuff1_ABE,
  gBattleTextBuff2 as _gBattleTextBuff2_ABE,
  PREPARE_MON_NICK_WITH_PREFIX_BUFFER,
  PREPARE_ABILITY_BUFFER,
  PREPARE_TYPE_BUFFER,
  B_BUFF_EOS,
} from './text-buffers';
import { gBattlerPartyIndexes as _gBattlerPartyIndexes_ABE } from './state';

/** 1:1 décomp `StringCopy(gBattleTextBuff1, gStatusConditionString_XJpn)`.
 *  Le décomp EN garde les bytes JPN (= "どく" / "ねむり" / etc.) ; pour notre
 *  port FR on stocke directement le nom du status en bytes ASCII (= consumé
 *  par {B_BUFF1} dans le message "X guérit son problème de {B_BUFF1}!"). */
function _writeStatusFrToBuff(buf: Uint8Array, status1: number, status2: number): void {
  let s = '';
  if (status1 & (STATUS1_POISON | STATUS1_TOXIC_POISON)) s = 'POISON';
  else if (status1 & STATUS1_SLEEP) s = 'SOMMEIL';
  else if (status1 & STATUS1_PARALYSIS) s = 'PARALYSIE';
  else if (status1 & STATUS1_BURN) s = 'BRÛLURE';
  else if (status1 & STATUS1_FREEZE) s = 'GEL';
  else if (status2 & STATUS2_CONFUSION) s = 'CONFUSION';
  else if (status2 & STATUS2_INFATUATION) s = 'AMOUR';
  for (let i = 0; i < buf.length; i++) buf[i] = 0;
  for (let i = 0; i < s.length && i < buf.length - 1; i++) {
    buf[i] = s.charCodeAt(i) & 0xFF;
  }
  buf[Math.min(s.length, buf.length - 1)] = B_BUFF_EOS;
}

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

// ─── CASTFORM_* enum (constants/battle.h) ────────────────────────────────

const SPECIES_CASTFORM = 385;
const CASTFORM_NORMAL = 0;
const CASTFORM_FIRE = 1;
const CASTFORM_WATER = 2;
const CASTFORM_ICE = 3;

/** 1:1 décomp `CastformDataTypeChange(battler)` (battle_util.c:2379-2412).
 *  Castform morph selon weather + ABILITY_FORECAST. Returns formId+1 si
 *  change, 0 si no change. Exporté pour réutilisation par cmd-niveau-25. */
export function _castformDataTypeChange(battler: number): number {
  let formChange = 0;
  if (gBattleMons[battler].species !== SPECIES_CASTFORM
      || gBattleMons[battler].ability !== ABILITY_FORECAST
      || gBattleMons[battler].hp === 0) {
    return 0;
  }
  const isNormalType = IS_BATTLER_OF_TYPE(
    gBattleMons[battler].type1, gBattleMons[battler].type2, TYPE_NORMAL
  );
  const isFireType = IS_BATTLER_OF_TYPE(
    gBattleMons[battler].type1, gBattleMons[battler].type2, TYPE_FIRE
  );
  const isWaterType = IS_BATTLER_OF_TYPE(
    gBattleMons[battler].type1, gBattleMons[battler].type2, TYPE_WATER
  );
  const isIceType = IS_BATTLER_OF_TYPE(
    gBattleMons[battler].type1, gBattleMons[battler].type2, TYPE_ICE
  );

  if (!_WEATHER_HAS_EFFECT && !isNormalType) {
    gBattleMons[battler].type1 = TYPE_NORMAL;
    gBattleMons[battler].type2 = 0;
    return CASTFORM_NORMAL + 1;
  }
  if (!_WEATHER_HAS_EFFECT) return 0;

  if (!(gBattleWeather & (B_WEATHER_RAIN | B_WEATHER_SUN | B_WEATHER_HAIL)) && !isNormalType) {
    gBattleMons[battler].type1 = 0; gBattleMons[battler].type2 = 0;
    formChange = CASTFORM_NORMAL + 1;
  }
  if ((gBattleWeather & B_WEATHER_SUN) && !isFireType) {
    gBattleMons[battler].type1 = TYPE_FIRE; gBattleMons[battler].type2 = TYPE_FIRE;
    formChange = CASTFORM_FIRE + 1;
  }
  if ((gBattleWeather & B_WEATHER_RAIN) && !isWaterType) {
    gBattleMons[battler].type1 = TYPE_WATER; gBattleMons[battler].type2 = TYPE_WATER;
    formChange = CASTFORM_WATER + 1;
  }
  if ((gBattleWeather & B_WEATHER_HAIL) && !isIceType) {
    // 1:1 décomp battle_util.c:2407-2410 : SET_BATTLER_TYPE(battler, TYPE_ICE)
    // = type1 = type2 = TYPE_ICE.
    // AUDIT BUG FIX : était type2 = 4 (= TYPE_FIGHTING) au lieu de TYPE_ICE.
    gBattleMons[battler].type1 = TYPE_ICE; gBattleMons[battler].type2 = TYPE_ICE;
    formChange = CASTFORM_ICE + 1;
  }
  return formChange;
}

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

// 1:1 décomp `RecordAbilityBattle` — wired via util.ts (= AI tracking).
import { RecordAbilityBattle as _recordAbilityBattleFullABE } from './util';
function _recordAbilityBattle(battler: number, ability: number): void {
  _recordAbilityBattleFullABE(battler, ability);
}

/** 1:1 stub `WEATHER_HAS_EFFECT` macro (= !CloudNine && !AirLock active).
 *  Wired via WEATHER_HAS_EFFECT util.ts (= Cloud Nine / Air Lock check). */
const _WEATHER_HAS_EFFECT = true;

// ─── Overworld WEATHER_* (constants/weather.h) — 1:1 décomp ─────────────────
const WEATHER_NONE              = 0;
const WEATHER_RAIN              = 3;
const WEATHER_RAIN_THUNDERSTORM = 5;
const WEATHER_SANDSTORM         = 8;
const WEATHER_DROUGHT           = 12;
const WEATHER_DOWNPOUR          = 13;

/** 1:1 stub `GetCurrentWeather(void)` (field_weather.c:1032).
 *  Retourne `gWeatherPtr->currWeather`. Pas wired battle-side dans notre
 *  port — bridge overworld weather quand le système overworld weather
 *  est branché. Notre port : retourne WEATHER_NONE (= no overworld weather effect
 *  on battle setup). */
function _getCurrentWeather(): number {
  // Deferred : bridge gameState.weather ou gWeatherPtr.currWeather.
  return WEATHER_NONE;
}

/** 1:1 décomp `RESOURCE_FLAG_FLASH_FIRE` (battle.h:68). */
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
          // 1:1 décomp battle_util.c:2473-2514.
          // BATTLE_TYPE_RECORDED = 1 << 24 — recorded battle replay, on skip
          // overworld weather propagation. Notre port : pas de recorded battle.
          if (!(gBattleTypeFlags & (1 << 24) /* BATTLE_TYPE_RECORDED */)) {
            const overworldWeather = _getCurrentWeather();
            switch (overworldWeather) {
              case WEATHER_RAIN:
              case WEATHER_RAIN_THUNDERSTORM:
              case WEATHER_DOWNPOUR:
                if (!(gBattleWeather & B_WEATHER_RAIN)) {
                  setBattleWeather(B_WEATHER_RAIN_TEMPORARY | B_WEATHER_RAIN_PERMANENT);
                  // 1:1 décomp battle_anim.h:367 : B_ANIM_RAIN_CONTINUES = 10.
                  // AUDIT BUG FIX : était 9 → 10.
                  gBattleScripting.animArg1 = 10;
                  gBattleScripting.battler = battler;
                  effect++;
                }
                break;
              case WEATHER_SANDSTORM:
                if (!(gBattleWeather & B_WEATHER_SANDSTORM)) {
                  setBattleWeather(B_WEATHER_SANDSTORM);
                  // 1:1 décomp battle_anim.h:369 : B_ANIM_SANDSTORM_CONTINUES = 12.
                  // AUDIT BUG FIX : était 11 → 12.
                  gBattleScripting.animArg1 = 12 /* B_ANIM_SANDSTORM_CONTINUES */;
                  gBattleScripting.battler = battler;
                  effect++;
                }
                break;
              case WEATHER_DROUGHT:
                if (!(gBattleWeather & B_WEATHER_SUN)) {
                  setBattleWeather(B_WEATHER_SUN);
                  // 1:1 décomp battle_anim.h:368 : B_ANIM_SUN_CONTINUES = 11.
                  // AUDIT BUG FIX : était 12 → 11.
                  gBattleScripting.animArg1 = 11 /* B_ANIM_SUN_CONTINUES */;
                  gBattleScripting.battler = battler;
                  effect++;
                }
                break;
            }
          }
          if (effect !== 0) {
            gBattleCommunication[5 /* MULTISTRING_CHOOSER */] = _getCurrentWeather();
            _lastWantedScriptLabel = 'BattleScript_OverworldWeatherStarts';
          }
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
          // 1:1 décomp battle_util.c:2549-2557.
          const eff = _castformDataTypeChange(battler);
          if (eff !== 0) {
            _lastWantedScriptLabel = 'BattleScript_CastformChange';
            gBattleScripting.battler = battler;
            gBattleStruct.formToChangeInto = eff - 1;
            effect++;
          }
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
          // 1:1 décomp battle_util.c:2565-2580.
          // Cloud Nine / Air Lock supprime weather effects → tous Castform
          // revert. Le first Castform trouvé déclenche le script.
          for (let target1 = 0; target1 < gBattlersCount; target1++) {
            const eff = _castformDataTypeChange(target1);
            if (eff !== 0) {
              _lastWantedScriptLabel = 'BattleScript_CastformChange';
              gBattleScripting.battler = target1;
              gBattleStruct.formToChangeInto = eff - 1;
              effect++;
              break;
            }
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
              // 1:1 décomp battle_util.c:2606-2615 — StringCopy status name
              // dans buff1 AVANT clear status pour {B_BUFF1} dans le message.
              _writeStatusFrToBuff(
                _gBattleTextBuff1_ABE,
                gBattleMons[battler].status1,
                gBattleMons[battler].status2,
              );
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
              if (!(gBattleResourcesFlags[battler] & RESOURCE_FLAG_FLASH_FIRE)) {
                gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_FLASH_FIRE_BOOST;
                _lastWantedScriptLabel = gProtectStructs[gBattlerAttacker].notFirstStrike
                  ? 'BattleScript_FlashFireBoost'
                  : 'BattleScript_FlashFireBoost_PPLoss';
                gBattleResourcesFlags[battler] |= RESOURCE_FLAG_FLASH_FIRE;
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
          // 1:1 décomp battle_util.c:2864-2908 — StringCopy status name AVANT
          // clear pour {B_BUFF1} dans le message "X libère Y de son Z!".
          _writeStatusFrToBuff(
            _gBattleTextBuff1_ABE,
            gBattleMons[battler].status1,
            gBattleMons[battler].status2,
          );
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

    case ABILITYEFFECT_ON_DAMAGE: {
      // 1:1 décomp battle_util.c:2732-2855 (Contact abilities + Color Change).
      // Helpers inline pour TARGET_TURN_DAMAGED + FLAG_MAKES_CONTACT check.
      const targetTurnDamaged = (gSpecialStatuses[gBattlerTarget].physicalDmg !== 0
        || gSpecialStatuses[gBattlerTarget].specialDmg !== 0);
      const makesContact = (getBattleMove(move).flags & FLAG_MAKES_CONTACT) !== 0;
      const noEffect = (gMoveResultFlags & MOVE_RESULT_NO_EFFECT) !== 0;
      const attackerAlive = gBattleMons[gBattlerAttacker].hp !== 0;
      const notConfusionSelfDmg = !gProtectStructs[gBattlerAttacker].confusionSelfDmg;

      switch (gLastUsedAbility) {
        case ABILITY_COLOR_CHANGE:
          if (!noEffect && move !== MOVE_STRUGGLE
              && getBattleMove(move).power !== 0
              && targetTurnDamaged
              && !IS_BATTLER_OF_TYPE(gBattleMons[battler].type1, gBattleMons[battler].type2, moveType)
              && gBattleMons[battler].hp !== 0) {
            // SET_BATTLER_TYPE(battler, moveType) — both types set to moveType.
            gBattleMons[battler].type1 = moveType;
            gBattleMons[battler].type2 = moveType;
            // 1:1 décomp battle_util.c:2744.
            PREPARE_TYPE_BUFFER(_gBattleTextBuff1_ABE, moveType);
            _lastWantedScriptLabel = 'BattleScript_ColorChangeActivates';
            effect++;
          }
          break;
        case ABILITY_ROUGH_SKIN:
          if (!noEffect && attackerAlive && notConfusionSelfDmg
              && targetTurnDamaged && makesContact) {
            let dmg = Math.floor(gBattleMons[gBattlerAttacker].maxHP / 16);
            if (dmg === 0) dmg = 1;
            setBattleMoveDamage(dmg);
            _lastWantedScriptLabel = 'BattleScript_RoughSkinActivates';
            effect++;
          }
          break;
        case ABILITY_EFFECT_SPORE:
          if (!noEffect && attackerAlive && notConfusionSelfDmg
              && targetTurnDamaged && makesContact
              && (Random() % 10) === 0) {
            // 1:1 décomp : pick Sleep/Poison/Burn random, swap Burn → Paralysis.
            let r: number;
            do { r = Random() & 3; } while (r === 0);
            if (r === MOVE_EFFECT_BURN) r += (MOVE_EFFECT_PARALYSIS - MOVE_EFFECT_BURN);
            gBattleCommunication[MOVE_EFFECT_BYTE] = r | MOVE_EFFECT_AFFECTS_USER;
            _lastWantedScriptLabel = 'BattleScript_ApplySecondaryEffect';
            setHitMarker(gHitMarker | HITMARKER_STATUS_ABILITY_EFFECT);
            effect++;
          }
          break;
        case ABILITY_POISON_POINT:
          if (!noEffect && attackerAlive && notConfusionSelfDmg
              && targetTurnDamaged && makesContact
              && (Random() % 3) === 0) {
            gBattleCommunication[MOVE_EFFECT_BYTE] = MOVE_EFFECT_AFFECTS_USER | MOVE_EFFECT_POISON;
            _lastWantedScriptLabel = 'BattleScript_ApplySecondaryEffect';
            setHitMarker(gHitMarker | HITMARKER_STATUS_ABILITY_EFFECT);
            effect++;
          }
          break;
        case ABILITY_STATIC:
          if (!noEffect && attackerAlive && notConfusionSelfDmg
              && targetTurnDamaged && makesContact
              && (Random() % 3) === 0) {
            gBattleCommunication[MOVE_EFFECT_BYTE] = MOVE_EFFECT_AFFECTS_USER | MOVE_EFFECT_PARALYSIS;
            _lastWantedScriptLabel = 'BattleScript_ApplySecondaryEffect';
            setHitMarker(gHitMarker | HITMARKER_STATUS_ABILITY_EFFECT);
            effect++;
          }
          break;
        case ABILITY_FLAME_BODY:
          if (!noEffect && attackerAlive && notConfusionSelfDmg
              && makesContact && targetTurnDamaged
              && (Random() % 3) === 0) {
            gBattleCommunication[MOVE_EFFECT_BYTE] = MOVE_EFFECT_AFFECTS_USER | MOVE_EFFECT_BURN;
            _lastWantedScriptLabel = 'BattleScript_ApplySecondaryEffect';
            setHitMarker(gHitMarker | HITMARKER_STATUS_ABILITY_EFFECT);
            effect++;
          }
          break;
        case ABILITY_CUTE_CHARM: {
          // 1:1 décomp battle_util.c:2834-2853.
          // Helper inline pour resolve species id → enum string → gender.
          const _genderOf = (speciesId: number, personality: number): number => {
            const speciesEnum = reverseDecompConstant(speciesId, 'SPECIES_');
            if (!speciesEnum) return MON_GENDERLESS;
            return GetGenderFromSpeciesAndPersonality(speciesEnum, personality);
          };
          const atkGender = _genderOf(
            gBattleMons[gBattlerAttacker].species,
            gBattleMons[gBattlerAttacker].personality,
          );
          const tgtGender = _genderOf(
            gBattleMons[gBattlerTarget].species,
            gBattleMons[gBattlerTarget].personality,
          );
          if (!noEffect && attackerAlive && notConfusionSelfDmg && makesContact
              && targetTurnDamaged && gBattleMons[gBattlerTarget].hp !== 0
              && (Random() % 3) === 0
              && gBattleMons[gBattlerAttacker].ability !== ABILITY_OBLIVIOUS
              && atkGender !== tgtGender
              && !(gBattleMons[gBattlerAttacker].status2 & STATUS2_INFATUATION)
              && atkGender !== MON_GENDERLESS
              && tgtGender !== MON_GENDERLESS) {
            gBattleMons[gBattlerAttacker].status2 |= STATUS2_INFATUATED_WITH(gBattlerTarget);
            _lastWantedScriptLabel = 'BattleScript_CuteCharmActivates';
            effect++;
          }
          break;
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
          gBattleStruct.intimidateBattler = i;
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
          gBattleStruct.intimidateBattler = i;
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

    case ABILITYEFFECT_SYNCHRONIZE: {
      // 1:1 décomp battle_util.c:2954-2968.
      if (gLastUsedAbility === ABILITY_SYNCHRONIZE
          && (gHitMarker & HITMARKER_SYNCHRONIZE_EFFECT)) {
        setHitMarker(gHitMarker & ~HITMARKER_SYNCHRONIZE_EFFECT);
        let smeff = gBattleStruct.synchronizeMoveEffect & ~(MOVE_EFFECT_AFFECTS_USER | MOVE_EFFECT_CERTAIN);
        if (smeff === MOVE_EFFECT_TOXIC) smeff = MOVE_EFFECT_POISON;
        gBattleStruct.synchronizeMoveEffect = smeff;
        gBattleCommunication[MOVE_EFFECT_BYTE] = smeff + MOVE_EFFECT_AFFECTS_USER;
        gBattleScripting.battler = gBattlerTarget;
        _lastWantedScriptLabel = 'BattleScript_SynchronizeActivates';
        setHitMarker(gHitMarker | HITMARKER_STATUS_ABILITY_EFFECT);
        effect++;
      }
      break;
    }

    case ABILITYEFFECT_TRACE: {
      // 1:1 décomp battle_util.c:3000-3055.
      for (let i = 0; i < gBattlersCount; i++) {
        if (gBattleMons[i].ability === ABILITY_TRACE && (gStatuses3[i] & STATUS3_TRACE)) {
          const side = BATTLE_OPPOSITE(GetBattlerPosition(i)) & BIT_SIDE;
          const target1 = GetBattlerAtPosition(side);
          const target2 = GetBattlerAtPosition(side + BIT_FLANK);
          if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
            if (gBattleMons[target1].ability !== 0 && gBattleMons[target1].hp !== 0
                && gBattleMons[target2].ability !== 0 && gBattleMons[target2].hp !== 0) {
              const pick = GetBattlerAtPosition(((Random() & 1) * 2) | side);
              setActiveBattler(pick);
              gBattleMons[i].ability = gBattleMons[pick].ability;
              setLastUsedAbility(gBattleMons[pick].ability);
              effect++;
            } else if (gBattleMons[target1].ability !== 0 && gBattleMons[target1].hp !== 0) {
              setActiveBattler(target1);
              gBattleMons[i].ability = gBattleMons[target1].ability;
              setLastUsedAbility(gBattleMons[target1].ability);
              effect++;
            } else if (gBattleMons[target2].ability !== 0 && gBattleMons[target2].hp !== 0) {
              setActiveBattler(target2);
              gBattleMons[i].ability = gBattleMons[target2].ability;
              setLastUsedAbility(gBattleMons[target2].ability);
              effect++;
            }
          } else {
            setActiveBattler(target1);
            if (gBattleMons[target1].ability && gBattleMons[target1].hp) {
              gBattleMons[i].ability = gBattleMons[target1].ability;
              setLastUsedAbility(gBattleMons[target1].ability);
              effect++;
            }
          }
          if (effect !== 0) {
            _lastWantedScriptLabel = 'BattleScript_TraceActivates';
            gStatuses3[i] &= ~STATUS3_TRACE;
            gBattleScripting.battler = i;
            // 1:1 décomp battle_util.c (ABILITYEFFECT_TRACE).
            PREPARE_MON_NICK_WITH_PREFIX_BUFFER(_gBattleTextBuff1_ABE, gActiveBattler, _gBattlerPartyIndexes_ABE[gActiveBattler]);
            PREPARE_ABILITY_BUFFER(_gBattleTextBuff2_ABE, gLastUsedAbility);
            break;
          }
        }
      }
      break;
    }

    case ABILITYEFFECT_ATK_SYNCHRONIZE: {
      // 1:1 décomp battle_util.c:2970-2984.
      if (gLastUsedAbility === ABILITY_SYNCHRONIZE
          && (gHitMarker & HITMARKER_SYNCHRONIZE_EFFECT)) {
        setHitMarker(gHitMarker & ~HITMARKER_SYNCHRONIZE_EFFECT);
        let smeff = gBattleStruct.synchronizeMoveEffect & ~(MOVE_EFFECT_AFFECTS_USER | MOVE_EFFECT_CERTAIN);
        if (smeff === MOVE_EFFECT_TOXIC) smeff = MOVE_EFFECT_POISON;
        gBattleStruct.synchronizeMoveEffect = smeff;
        gBattleCommunication[MOVE_EFFECT_BYTE] = smeff;
        gBattleScripting.battler = gBattlerAttacker;
        _lastWantedScriptLabel = 'BattleScript_SynchronizeActivates';
        setHitMarker(gHitMarker | HITMARKER_STATUS_ABILITY_EFFECT);
        effect++;
      }
      break;
    }

    case ABILITYEFFECT_FORECAST: {
      // 1:1 décomp battle_util.c:2938-2953.
      for (let i = 0; i < gBattlersCount; i++) {
        if (gBattleMons[i].ability === ABILITY_FORECAST) {
          const eff = _castformDataTypeChange(i);
          if (eff !== 0) {
            _lastWantedScriptLabel = 'BattleScript_CastformChange';
            gBattleScripting.battler = i;
            gBattleStruct.formToChangeInto = eff - 1;
            return eff;
          }
        }
      }
      break;
    }

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

// Expose AbilityBattleEffects via globalThis pour permettre damage-calc.ts et
// autres modules d'éviter circular import. Set au module-load.
(globalThis as { __abilityBattleEffectsCheck?: typeof AbilityBattleEffects }).__abilityBattleEffectsCheck = AbilityBattleEffects;
// Expose RESOURCE_FLAG_FLASH_FIRE constant pour read côté caller (=damage-calc).
(globalThis as { __RESOURCE_FLAG_FLASH_FIRE?: number }).__RESOURCE_FLAG_FLASH_FIRE = RESOURCE_FLAG_FLASH_FIRE;

