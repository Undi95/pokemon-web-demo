/**
 * game/battle_ai_switch_items.ts — MIROIR 1:1 de `src/battle_ai_switch_items.c`
 * (sous-système AI : décision de changement de Pokémon ; ex-src/engine/battle/ai/
 * ai-switch-items.ts, relocalisé dans le miroir game/ le 2026-06-13).
 *
 * Source de vérité : D:/Projet 1/decomps/pokeemeraude/src/battle_ai_switch_items.c
 *
 * Comble le dernier MVP de l'AI dresseur : actuellement les dresseurs
 * n'échangent jamais intelligemment leur Pokémon. Ce module porte 1:1 :
 *   ShouldSwitchIfPerishSong / ShouldSwitchIfWonderGuard /
 *   FindMonThatAbsorbsOpponentsMove / ShouldSwitchIfNaturalCure /
 *   HasSuperEffectiveMoveAgainstOpponents / AreStatsRaised /
 *   FindMonWithFlagsAndSuperEffective / ShouldSwitch (core) /
 *   ModulateByTypeEffectiveness / GetMostSuitableMonToSwitchInto /
 *   AI_TrySwitchOrUseItem (entry).
 *
 * `BtlController_EmitTwoReturnValues` → recorder local `_aiEmit` (l'action
 * choisie est lisible via getAiSwitchDecision() ; le wirage controller
 * action-choice = étape future). `ShouldUseItem` + `GetAI_ItemType` =
 * PORTÉS 1:1 (sous-système item-effect-table via data/item-effects.ts :
 * getItemEffectBytes + GetItemEffectParamOffset, gBattleHistory.trainerItems).
 * Module NON wiré au controller action-choice = zéro risque gameplay.
 */

import { Random } from '../engine/system/random';
import {
  gActiveBattler,
  gBattleMons,
  gBattleTypeFlags,
  gAbsentBattlerFlags,
  gStatuses3,
  gDisableStructs,
  gBattlerPartyIndexes,
  gBattleStruct,
  gLastLandedMoves,
  gLastHitBy,
  setDynamicBasePower,
  gBattleScripting,
  setMoveResultFlags,
  setCritMultiplier,
  gBattleMoveDamage,
  setBattleMoveDamage,
  gSideTimers,
} from '../engine/battle/state';
import {
  MAX_MON_MOVES,
  MOVE_NONE,
  MOVE_UNAVAILABLE,
  BIT_FLANK,
  B_SIDE_PLAYER,
  BATTLE_OPPOSITE,
  BATTLE_PARTNER,
  GET_BATTLER_SIDE,
  STATUS2_WRAPPED,
  STATUS2_ESCAPE_PREVENTION,
  STATUS2_CONFUSION,
  STATUS3_ROOTED,
  STATUS3_PERISH_SONG,
  STATUS1_SLEEP,
  ABILITY_SHADOW_TAG,
  ABILITY_ARENA_TRAP,
  ABILITY_MAGNET_PULL,
  ABILITY_WONDER_GUARD,
  ABILITY_NATURAL_CURE,
  ABILITY_FLASH_FIRE,
  ABILITY_WATER_ABSORB,
  ABILITY_VOLT_ABSORB,
  TYPE_STEEL,
  TYPE_FIRE,
  TYPE_WATER,
  TYPE_ELECTRIC,
  NUM_BATTLE_STATS,
  DEFAULT_STAT_STAGE,
  MOVE_RESULT_SUPER_EFFECTIVE,
  MOVE_RESULT_DOESNT_AFFECT_FOE,
  MOVE_RESULT_NOT_VERY_EFFECTIVE,
  B_ACTION_SWITCH,
  B_ACTION_USE_MOVE,
  B_ACTION_USE_ITEM,
  BATTLE_TYPE_DOUBLE,
  BATTLE_TYPE_TRAINER,
  BATTLE_TYPE_TWO_OPPONENTS,
  BATTLE_TYPE_TOWER_LINK_MULTI,
  BATTLE_TYPE_ARENA,
  BATTLE_TYPE_INGAME_PARTNER,
  STATUS1_POISON,
  STATUS1_TOXIC_POISON,
  STATUS1_BURN,
  STATUS1_FREEZE,
  STATUS1_PARALYSIS,
} from '../engine/battle/constants';
import {
  gTypeEffectiveness,
  TYPE_FORESIGHT,
  TYPE_ENDTABLE,
  TYPE_MUL_NORMAL,
  TYPE_MUL_NO_EFFECT,
} from '../engine/battle/data/type-effectiveness';
import { AI_TypeCalc, AI_CalcDmg, TypeCalc, speciesTypes } from './battle_script_commands';
import {
  gPlayerParty,
  gEnemyParty,
  GetMonData,
  GetAbilityBySpecies,
  MON_DATA_HP,
  MON_DATA_SPECIES,
  MON_DATA_SPECIES_OR_EGG,
  MON_DATA_ABILITY_NUM,
  MON_DATA_MOVE1,
  PARTY_SIZE,
} from '../engine/battle/party-storage';
import {
  SPECIES_NONE,
  SPECIES_EGG,
} from '../engine/decomp-data/include/constants/species-data';
import { gBitTable } from '../engine/battle/battle-controllers';
import { GetBattlerPosition, GetBattlerAtPosition, B_POSITION_PLAYER_RIGHT } from '../engine/battle/util';
import {
  AbilityBattleEffects,
  ABILITYEFFECT_CHECK_OTHER_SIDE,
  ABILITYEFFECT_FIELD_SPORT,
} from './battle_util';
import { getBattleMove } from '../engine/battle/data/battle-moves';
import { getItemEffectBytes, GetItemEffectParamOffset } from '../engine/battle/data/item-effects';
import { gBattleHistory } from './battle_ai_script_commands';
import {
  ITEM_NONE,
  ITEM_FULL_RESTORE,
  ITEM_ENIGMA_BERRY,
} from '../engine/decomp-data/include/constants/items-data';
import {
  ITEM0_X_ATTACK,
  ITEM0_DIRE_HIT,
  ITEM1_X_DEFEND,
  ITEM1_X_SPEED,
  ITEM2_X_SPATK,
  ITEM2_X_ACCURACY,
  ITEM3_CONFUSION,
  ITEM3_PARALYSIS,
  ITEM3_FREEZE,
  ITEM3_BURN,
  ITEM3_POISON,
  ITEM3_SLEEP,
  ITEM3_GUARD_SPEC,
  ITEM4_HEAL_HP,
} from '../engine/decomp-data/include/constants/item_effects-data';

// ─── Constantes locales 1:1 ────────────────────────────────────────────────

/** 1:1 décomp `#define B_FLANK_LEFT 0` (constants/battle.h:52). Import
 *  depuis decomp-data au lieu de hardcode (= A8 audit). */
import { B_FLANK_LEFT } from '../engine/decomp-data/include/constants/battle-data';
/** 1:1 décomp `enum` battle_ai_switch_items.h:4-32 — AI_ITEM_* / AI_HEAL_* / AI_X_*. */
import {
  ENUM_AI_0, ENUM_AI_1, ENUM_AI_2,
} from '../engine/decomp-data/include/battle_ai_switch_items-data';

/** 1:1 décomp `IS_BATTLER_OF_TYPE(battler, type)` (battle.h:471). */
function IS_BATTLER_OF_TYPE(battler: number, type: number): boolean {
  return gBattleMons[battler].type1 === type || gBattleMons[battler].type2 === type;
}

/** 1:1 décomp macros battle_util.h:36-38 :
 *  ABILITY_ON_OPPOSING_FIELD = AbilityBattleEffects(CHECK_OTHER_SIDE,...)
 *  ABILITY_ON_FIELD2         = AbilityBattleEffects(FIELD_SPORT,...) */
function ABILITY_ON_OPPOSING_FIELD(battler: number, abilityId: number): number {
  return AbilityBattleEffects(ABILITYEFFECT_CHECK_OTHER_SIDE, battler, abilityId, 0, 0);
}
function ABILITY_ON_FIELD2(abilityId: number): number {
  return AbilityBattleEffects(ABILITYEFFECT_FIELD_SPORT, 0, abilityId, 0, 0);
}

// ─── Recorder `BtlController_EmitTwoReturnValues` (non wiré) ────────────────

export interface AiSwitchDecision {
  /** B_ACTION_* (SWITCH / USE_MOVE / USE_ITEM). -1 = aucune décision émise. */
  action: number;
  data: number;
}
let _aiDecision: AiSwitchDecision = { action: -1, data: 0 };

function _aiEmit(action: number, data: number): void {
  _aiDecision = { action, data };
  // Voie L (décomp 1:1) : AI_TrySwitchOrUseItem se termine TOUJOURS par
  // BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, action, data) → écrit
  // gBattleBufferB[gActiveBattler] (l'action choisie de l'IA). SANS ça,
  // gChosenActionByBattler[opponent] garde une valeur résiduelle ≠ B_ACTION_USE_MOVE
  // → HandleTurnActionSelectionState reste bloqué à STATE_WAIT_ACTION_CASE_CHOSEN
  // (le tour ne démarre jamais). Le recorder _aiDecision reste pour la voie V.
  _emitTwoReturnValues(B_COMM_TO_ENGINE, action, data);
}

/** Lazy lookup anti-cycle vers BtlController_EmitTwoReturnValues (battle-controllers-ipc).
 *  Importé via globalThis pour ne pas créer de dépendance top-level ai/ → ipc. */
function _emitTwoReturnValues(buf: number, ret8: number, ret16: number): void {
  const m = (globalThis as { __battleControllersIpc?: { BtlController_EmitTwoReturnValues?: (b: number, r8: number, r16: number) => void } }).__battleControllersIpc;
  m?.BtlController_EmitTwoReturnValues?.(buf, ret8, ret16);
}

/** 1:1 décomp `B_COMM_TO_ENGINE` (= bufferB, résultat controller→engine). */
const B_COMM_TO_ENGINE = 1;

/** Lit la dernière décision émise par AI_TrySwitchOrUseItem (devtools/wirage). */
export function getAiSwitchDecision(): AiSwitchDecision {
  return { ..._aiDecision };
}
export function resetAiSwitchDecision(): void {
  _aiDecision = { action: -1, data: 0 };
}

/** Debug-only (devtools `scope.bytecode.aiItem`) : exécute ShouldUseItem /
 *  GetAI_ItemType 1:1 sur l'état courant. NON appelés par le moteur
 *  (zéro impact gameplay) — vérif déterministe du sous-système objet AI. */
export function _debugShouldUseItem(): boolean {
  return ShouldUseItem();
}
export function _debugGetAI_ItemType(itemId: number, itemEffect: number[]): number {
  return GetAI_ItemType(itemId, itemEffect);
}

// ─── Helpers d'accès gBattleStruct (1:1 *(ptr + battler)) ──────────────────

function _AI_monToSwitchIntoId(b: number): number {
  return gBattleStruct.AI_monToSwitchIntoId[b];
}
function _set_AI_monToSwitchIntoId(b: number, v: number): void {
  gBattleStruct.AI_monToSwitchIntoId[b] = v;
}
function _monToSwitchIntoId(b: number): number {
  return gBattleStruct.monToSwitchIntoId[b];
}

// ─── ShouldSwitchIfPerishSong (battle_ai_switch_items.c:20-33) ──────────────

function ShouldSwitchIfPerishSong(): boolean {
  if ((gStatuses3[gActiveBattler] & STATUS3_PERISH_SONG)
    && gDisableStructs[gActiveBattler].perishSongTimer === 0) {
    _set_AI_monToSwitchIntoId(gActiveBattler, PARTY_SIZE);
    _aiEmit(B_ACTION_SWITCH, 0);
    return true;
  }
  return false;
}

// ─── ShouldSwitchIfWonderGuard (35-117) ────────────────────────────────────

function ShouldSwitchIfWonderGuard(): boolean {
  let opposingBattler: number;
  let i: number;
  let j: number;
  let firstId: number;
  let lastId: number;
  let move: number;

  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) return false;

  const opposingPosition = BATTLE_OPPOSITE(GetBattlerPosition(gActiveBattler));

  if (gBattleMons[GetBattlerAtPosition(opposingPosition)].ability !== ABILITY_WONDER_GUARD) {
    return false;
  }

  // Check if Pokémon has a super effective move.
  opposingBattler = GetBattlerAtPosition(opposingPosition);
  for (i = 0; i < MAX_MON_MOVES; i++) {
    move = gBattleMons[gActiveBattler].moves[i];
    if (move === MOVE_NONE) continue;
    const moveFlags = AI_TypeCalc(move, gBattleMons[opposingBattler].species, gBattleMons[opposingBattler].ability);
    if (moveFlags & MOVE_RESULT_SUPER_EFFECTIVE) return false;
  }

  if (gBattleTypeFlags & (BATTLE_TYPE_TWO_OPPONENTS | BATTLE_TYPE_TOWER_LINK_MULTI)) {
    if ((gActiveBattler & BIT_FLANK) === B_FLANK_LEFT) { firstId = 0; lastId = PARTY_SIZE / 2; }
    else { firstId = PARTY_SIZE / 2; lastId = PARTY_SIZE; }
  } else {
    firstId = 0; lastId = PARTY_SIZE;
  }

  const party = GET_BATTLER_SIDE(gActiveBattler) === B_SIDE_PLAYER ? gPlayerParty : gEnemyParty;

  for (i = firstId; i < lastId; i++) {
    if (GetMonData(party[i], MON_DATA_HP) === 0) continue;
    if (GetMonData(party[i], MON_DATA_SPECIES_OR_EGG) === SPECIES_NONE) continue;
    if (GetMonData(party[i], MON_DATA_SPECIES_OR_EGG) === SPECIES_EGG) continue;
    if (i === gBattlerPartyIndexes[gActiveBattler]) continue;

    GetMonData(party[i], MON_DATA_SPECIES); // 1:1 : unused return.
    GetMonData(party[i], MON_DATA_ABILITY_NUM); // 1:1 : unused return.

    opposingBattler = GetBattlerAtPosition(opposingPosition);
    for (j = 0; j < MAX_MON_MOVES; j++) {
      move = GetMonData(party[i], MON_DATA_MOVE1 + j) as number;
      if (move === MOVE_NONE) continue;
      const moveFlags = AI_TypeCalc(move, gBattleMons[opposingBattler].species, gBattleMons[opposingBattler].ability);
      if ((moveFlags & MOVE_RESULT_SUPER_EFFECTIVE) && Random() % 3 < 2) {
        _set_AI_monToSwitchIntoId(gActiveBattler, i);
        _aiEmit(B_ACTION_SWITCH, 0);
        return true;
      }
    }
  }
  return false;
}

// ─── FindMonThatAbsorbsOpponentsMove (119-216) ─────────────────────────────

function FindMonThatAbsorbsOpponentsMove(): boolean {
  let battlerIn1: number;
  let battlerIn2: number;
  let absorbingTypeAbility: number;
  let firstId: number;
  let lastId: number;
  let i: number;

  if (HasSuperEffectiveMoveAgainstOpponents(true) && Random() % 3 !== 0) return false;
  if (gLastLandedMoves[gActiveBattler] === MOVE_NONE) return false;
  if (gLastLandedMoves[gActiveBattler] === MOVE_UNAVAILABLE) return false;
  if (getBattleMove(gLastLandedMoves[gActiveBattler]).power === 0) return false;

  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
    battlerIn1 = gActiveBattler;
    if (gAbsentBattlerFlags & gBitTable[GetBattlerAtPosition(BATTLE_PARTNER(GetBattlerPosition(gActiveBattler)))]) {
      battlerIn2 = gActiveBattler;
    } else {
      battlerIn2 = GetBattlerAtPosition(BATTLE_PARTNER(GetBattlerPosition(gActiveBattler)));
    }
  } else {
    battlerIn1 = gActiveBattler;
    battlerIn2 = gActiveBattler;
  }

  if (getBattleMove(gLastLandedMoves[gActiveBattler]).type === TYPE_FIRE) absorbingTypeAbility = ABILITY_FLASH_FIRE;
  else if (getBattleMove(gLastLandedMoves[gActiveBattler]).type === TYPE_WATER) absorbingTypeAbility = ABILITY_WATER_ABSORB;
  else if (getBattleMove(gLastLandedMoves[gActiveBattler]).type === TYPE_ELECTRIC) absorbingTypeAbility = ABILITY_VOLT_ABSORB;
  else return false;

  if (gBattleMons[gActiveBattler].ability === absorbingTypeAbility) return false;

  if (gBattleTypeFlags & (BATTLE_TYPE_TWO_OPPONENTS | BATTLE_TYPE_TOWER_LINK_MULTI)) {
    if ((gActiveBattler & BIT_FLANK) === B_FLANK_LEFT) { firstId = 0; lastId = PARTY_SIZE / 2; }
    else { firstId = PARTY_SIZE / 2; lastId = PARTY_SIZE; }
  } else {
    firstId = 0; lastId = PARTY_SIZE;
  }

  const party = GET_BATTLER_SIDE(gActiveBattler) === B_SIDE_PLAYER ? gPlayerParty : gEnemyParty;

  for (i = firstId; i < lastId; i++) {
    if (GetMonData(party[i], MON_DATA_HP) === 0) continue;
    if (GetMonData(party[i], MON_DATA_SPECIES_OR_EGG) === SPECIES_NONE) continue;
    if (GetMonData(party[i], MON_DATA_SPECIES_OR_EGG) === SPECIES_EGG) continue;
    if (i === gBattlerPartyIndexes[battlerIn1]) continue;
    if (i === gBattlerPartyIndexes[battlerIn2]) continue;
    if (i === _monToSwitchIntoId(battlerIn1)) continue;
    if (i === _monToSwitchIntoId(battlerIn2)) continue;

    const species = GetMonData(party[i], MON_DATA_SPECIES) as number;
    const abilityNum = GetMonData(party[i], MON_DATA_ABILITY_NUM) as number;
    const monAbility = abilityNum !== 0
      ? GetAbilityBySpecies(species, 1)
      : GetAbilityBySpecies(species, 0);

    if (absorbingTypeAbility === monAbility && (Random() & 1)) {
      _set_AI_monToSwitchIntoId(gActiveBattler, i);
      _aiEmit(B_ACTION_SWITCH, 0);
      return true;
    }
  }
  return false;
}

// ─── ShouldSwitchIfNaturalCure (218-256) ───────────────────────────────────

function ShouldSwitchIfNaturalCure(): boolean {
  if (!(gBattleMons[gActiveBattler].status1 & STATUS1_SLEEP)) return false;
  if (gBattleMons[gActiveBattler].ability !== ABILITY_NATURAL_CURE) return false;
  if (gBattleMons[gActiveBattler].hp < Math.floor(gBattleMons[gActiveBattler].maxHP / 2)) return false;

  if ((gLastLandedMoves[gActiveBattler] === MOVE_NONE
    || gLastLandedMoves[gActiveBattler] === MOVE_UNAVAILABLE)
    && (Random() & 1)) {
    _set_AI_monToSwitchIntoId(gActiveBattler, PARTY_SIZE);
    _aiEmit(B_ACTION_SWITCH, 0);
    return true;
  } else if (getBattleMove(gLastLandedMoves[gActiveBattler]).power === 0 && (Random() & 1)) {
    _set_AI_monToSwitchIntoId(gActiveBattler, PARTY_SIZE);
    _aiEmit(B_ACTION_SWITCH, 0);
    return true;
  }

  if (FindMonWithFlagsAndSuperEffective(MOVE_RESULT_DOESNT_AFFECT_FOE, 1)) return true;
  if (FindMonWithFlagsAndSuperEffective(MOVE_RESULT_NOT_VERY_EFFECTIVE, 1)) return true;

  if (Random() & 1) {
    _set_AI_monToSwitchIntoId(gActiveBattler, PARTY_SIZE);
    _aiEmit(B_ACTION_SWITCH, 0);
    return true;
  }
  return false;
}

// ─── HasSuperEffectiveMoveAgainstOpponents (258-312) ───────────────────────

function HasSuperEffectiveMoveAgainstOpponents(noRng: boolean): boolean {
  let opposingBattler: number;
  let i: number;
  let move: number;

  const opposingPosition = BATTLE_OPPOSITE(GetBattlerPosition(gActiveBattler));
  opposingBattler = GetBattlerAtPosition(opposingPosition);

  if (!(gAbsentBattlerFlags & gBitTable[opposingBattler])) {
    for (i = 0; i < MAX_MON_MOVES; i++) {
      move = gBattleMons[gActiveBattler].moves[i];
      if (move === MOVE_NONE) continue;
      const moveFlags = AI_TypeCalc(move, gBattleMons[opposingBattler].species, gBattleMons[opposingBattler].ability);
      if (moveFlags & MOVE_RESULT_SUPER_EFFECTIVE) {
        if (noRng) return true;
        if (Random() % 10 !== 0) return true;
      }
    }
  }
  if (!(gBattleTypeFlags & BATTLE_TYPE_DOUBLE)) return false;

  opposingBattler = GetBattlerAtPosition(BATTLE_PARTNER(opposingPosition));

  if (!(gAbsentBattlerFlags & gBitTable[opposingBattler])) {
    for (i = 0; i < MAX_MON_MOVES; i++) {
      move = gBattleMons[gActiveBattler].moves[i];
      if (move === MOVE_NONE) continue;
      const moveFlags = AI_TypeCalc(move, gBattleMons[opposingBattler].species, gBattleMons[opposingBattler].ability);
      if (moveFlags & MOVE_RESULT_SUPER_EFFECTIVE) {
        if (noRng) return true;
        if (Random() % 10 !== 0) return true;
      }
    }
  }
  return false;
}

// ─── AreStatsRaised (314-326) ──────────────────────────────────────────────

function AreStatsRaised(): boolean {
  let buffedStatsValue = 0;
  for (let i = 0; i < NUM_BATTLE_STATS; i++) {
    if (gBattleMons[gActiveBattler].statStages[i] > DEFAULT_STAT_STAGE) {
      buffedStatsValue += gBattleMons[gActiveBattler].statStages[i] - DEFAULT_STAT_STAGE;
    }
  }
  return buffedStatsValue > 3;
}

// ─── FindMonWithFlagsAndSuperEffective (328-427) ───────────────────────────

function FindMonWithFlagsAndSuperEffective(flags: number, moduloPercent: number): boolean {
  let battlerIn1: number;
  let battlerIn2: number;
  let firstId: number;
  let lastId: number;
  let i: number;
  let j: number;
  let move: number;

  if (gLastLandedMoves[gActiveBattler] === MOVE_NONE) return false;
  if (gLastLandedMoves[gActiveBattler] === MOVE_UNAVAILABLE) return false;
  if (gLastHitBy[gActiveBattler] === 0xFF) return false;
  if (getBattleMove(gLastLandedMoves[gActiveBattler]).power === 0) return false;

  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
    battlerIn1 = gActiveBattler;
    if (gAbsentBattlerFlags & gBitTable[GetBattlerAtPosition(BATTLE_PARTNER(GetBattlerPosition(gActiveBattler)))]) {
      battlerIn2 = gActiveBattler;
    } else {
      battlerIn2 = GetBattlerAtPosition(BATTLE_PARTNER(GetBattlerPosition(gActiveBattler)));
    }
  } else {
    battlerIn1 = gActiveBattler;
    battlerIn2 = gActiveBattler;
  }

  if (gBattleTypeFlags & (BATTLE_TYPE_TWO_OPPONENTS | BATTLE_TYPE_TOWER_LINK_MULTI)) {
    if ((gActiveBattler & BIT_FLANK) === 0) { firstId = 0; lastId = PARTY_SIZE / 2; }
    else { firstId = PARTY_SIZE / 2; lastId = PARTY_SIZE; }
  } else {
    firstId = 0; lastId = PARTY_SIZE;
  }

  const party = GET_BATTLER_SIDE(gActiveBattler) === B_SIDE_PLAYER ? gPlayerParty : gEnemyParty;

  for (i = firstId; i < lastId; i++) {
    if (GetMonData(party[i], MON_DATA_HP) === 0) continue;
    if (GetMonData(party[i], MON_DATA_SPECIES_OR_EGG) === SPECIES_NONE) continue;
    if (GetMonData(party[i], MON_DATA_SPECIES_OR_EGG) === SPECIES_EGG) continue;
    if (i === gBattlerPartyIndexes[battlerIn1]) continue;
    if (i === gBattlerPartyIndexes[battlerIn2]) continue;
    if (i === _monToSwitchIntoId(battlerIn1)) continue;
    if (i === _monToSwitchIntoId(battlerIn2)) continue;

    const species = GetMonData(party[i], MON_DATA_SPECIES) as number;
    const abilityNum = GetMonData(party[i], MON_DATA_ABILITY_NUM) as number;
    const monAbility = abilityNum !== 0
      ? GetAbilityBySpecies(species, 1)
      : GetAbilityBySpecies(species, 0);

    let moveFlags = AI_TypeCalc(gLastLandedMoves[gActiveBattler], species, monAbility);
    if (moveFlags & flags) {
      battlerIn1 = gLastHitBy[gActiveBattler];

      for (j = 0; j < MAX_MON_MOVES; j++) {
        move = GetMonData(party[i], MON_DATA_MOVE1 + j) as number;
        if (move === 0) continue;

        moveFlags = AI_TypeCalc(move, gBattleMons[battlerIn1].species, gBattleMons[battlerIn1].ability);
        if ((moveFlags & MOVE_RESULT_SUPER_EFFECTIVE) && Random() % moduloPercent === 0) {
          _set_AI_monToSwitchIntoId(gActiveBattler, i);
          _aiEmit(B_ACTION_SWITCH, 0);
          return true;
        }
      }
    }
  }
  return false;
}

// ─── ShouldSwitch (429-526) ────────────────────────────────────────────────

export function ShouldSwitch(): boolean {
  let battlerIn1: number;
  let battlerIn2: number;
  let firstId: number;
  let lastId: number;
  let i: number;
  let availableToSwitch: number;

  if (gBattleMons[gActiveBattler].status2 & (STATUS2_WRAPPED | STATUS2_ESCAPE_PREVENTION)) return false;
  if (gStatuses3[gActiveBattler] & STATUS3_ROOTED) return false;
  if (ABILITY_ON_OPPOSING_FIELD(gActiveBattler, ABILITY_SHADOW_TAG)) return false;
  if (ABILITY_ON_OPPOSING_FIELD(gActiveBattler, ABILITY_ARENA_TRAP)) return false; // Misses flying/Levitate (1:1).
  if (ABILITY_ON_FIELD2(ABILITY_MAGNET_PULL)) {
    if (IS_BATTLER_OF_TYPE(gActiveBattler, TYPE_STEEL)) return false;
  }
  if (gBattleTypeFlags & BATTLE_TYPE_ARENA) return false;

  availableToSwitch = 0;
  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
    battlerIn1 = gActiveBattler;
    if (gAbsentBattlerFlags & gBitTable[GetBattlerAtPosition(BATTLE_PARTNER(GetBattlerPosition(gActiveBattler)))]) {
      battlerIn2 = gActiveBattler;
    } else {
      battlerIn2 = GetBattlerAtPosition(BATTLE_PARTNER(GetBattlerPosition(gActiveBattler)));
    }
  } else {
    battlerIn1 = gActiveBattler;
    battlerIn2 = gActiveBattler;
  }

  if (gBattleTypeFlags & (BATTLE_TYPE_TWO_OPPONENTS | BATTLE_TYPE_TOWER_LINK_MULTI)) {
    if ((gActiveBattler & BIT_FLANK) === B_FLANK_LEFT) { firstId = 0; lastId = PARTY_SIZE / 2; }
    else { firstId = PARTY_SIZE / 2; lastId = PARTY_SIZE; }
  } else {
    firstId = 0; lastId = PARTY_SIZE;
  }

  const party = GET_BATTLER_SIDE(gActiveBattler) === B_SIDE_PLAYER ? gPlayerParty : gEnemyParty;

  for (i = firstId; i < lastId; i++) {
    if (GetMonData(party[i], MON_DATA_HP) === 0) continue;
    if (GetMonData(party[i], MON_DATA_SPECIES_OR_EGG) === SPECIES_NONE) continue;
    if (GetMonData(party[i], MON_DATA_SPECIES_OR_EGG) === SPECIES_EGG) continue;
    if (i === gBattlerPartyIndexes[battlerIn1]) continue;
    if (i === gBattlerPartyIndexes[battlerIn2]) continue;
    if (i === _monToSwitchIntoId(battlerIn1)) continue;
    if (i === _monToSwitchIntoId(battlerIn2)) continue;
    availableToSwitch++;
  }

  if (availableToSwitch === 0) return false;
  if (ShouldSwitchIfPerishSong()) return true;
  if (ShouldSwitchIfWonderGuard()) return true;
  if (FindMonThatAbsorbsOpponentsMove()) return true;
  if (ShouldSwitchIfNaturalCure()) return true;
  if (HasSuperEffectiveMoveAgainstOpponents(false)) return false;
  if (AreStatsRaised()) return false;
  if (FindMonWithFlagsAndSuperEffective(MOVE_RESULT_DOESNT_AFFECT_FOE, 2)
    || FindMonWithFlagsAndSuperEffective(MOVE_RESULT_NOT_VERY_EFFECTIVE, 3)) {
    return true;
  }
  return false;
}

// ─── ShouldUseItem / GetAI_ItemType — port 1:1 (792-944) ───────────────────

/** 1:1 décomp `enum` battle_ai_switch_items.h:4-12 — importé depuis decomp-data. */
const {
  AI_ITEM_FULL_RESTORE, AI_ITEM_HEAL_HP, AI_ITEM_CURE_CONDITION,
  AI_ITEM_X_STAT, AI_ITEM_GUARD_SPEC, AI_ITEM_NOT_RECOGNIZABLE,
} = ENUM_AI_0;

/** 1:1 décomp `enum` battle_ai_switch_items.h:14-21 — importé depuis decomp-data. */
const {
  AI_HEAL_CONFUSION, AI_HEAL_PARALYSIS, AI_HEAL_FREEZE,
  AI_HEAL_BURN, AI_HEAL_POISON, AI_HEAL_SLEEP,
} = ENUM_AI_1;

/** 1:1 décomp `enum` battle_ai_switch_items.h:23-32 — importé depuis decomp-data
 *  (SPDEF/EVASION inutilisés ici). */
const {
  AI_X_ATTACK, AI_X_DEFEND, AI_X_SPEED, AI_X_SPATK,
  AI_X_ACCURACY, AI_DIRE_HIT,
} = ENUM_AI_2;

/** 1:1 décomp `#define MAX_TRAINER_ITEMS 4` (include/data.h:8). */
const MAX_TRAINER_ITEMS = 4;

/** 1:1 décomp `#define ITEM3_STATUS_ALL (ITEM3_CONFUSION | ITEM3_PARALYSIS |
 *  ITEM3_FREEZE | ITEM3_BURN | ITEM3_POISON | ITEM3_SLEEP)`
 *  (constants/item_effects.h:28). item_effects-data n'exporte que la string
 *  *_EXPR → reconstruit 1:1 ici depuis les bits numériques importés. */
const ITEM3_STATUS_ALL =
  ITEM3_CONFUSION | ITEM3_PARALYSIS | ITEM3_FREEZE | ITEM3_BURN | ITEM3_POISON | ITEM3_SLEEP;

/** 1:1 décomp `gSaveBlock1Ptr->enigmaBerry.itemEffect`. Baie Mystère =
 *  feature câble/event jamais configurée (SaveBlock vierge = tout-à-zéro).
 *  Inatteignable ici : ITEM_ENIGMA_BERRY → gItemEffectTable NULL → continue
 *  AVANT cette branche (= 1:1 décomp, on reproduit la source quand même). */
const _ENIGMA_BERRY_ITEM_EFFECT: number[] = new Array(18).fill(0);

/** 1:1 décomp `static u8 GetAI_ItemType(u8 itemId, const u8 *itemEffect)`
 *  (battle_ai_switch_items.c:792-806). */
function GetAI_ItemType(itemId: number, itemEffect: number[]): number {
  if (itemId === ITEM_FULL_RESTORE) return AI_ITEM_FULL_RESTORE;
  else if (itemEffect[4] & ITEM4_HEAL_HP) return AI_ITEM_HEAL_HP;
  else if (itemEffect[3] & ITEM3_STATUS_ALL) return AI_ITEM_CURE_CONDITION;
  else if ((itemEffect[0] & (ITEM0_DIRE_HIT | ITEM0_X_ATTACK)) || itemEffect[1] !== 0 || itemEffect[2] !== 0)
    return AI_ITEM_X_STAT;
  else if (itemEffect[3] & ITEM3_GUARD_SPEC) return AI_ITEM_GUARD_SPEC;
  else return AI_ITEM_NOT_RECOGNIZABLE;
}

/** 1:1 décomp `static bool8 ShouldUseItem(void)`
 *  (battle_ai_switch_items.c:808-944). Décide si le dresseur utilise un
 *  objet (Full Restore / Potion / soin statut / X-stat / Guard Spec).
 *  `BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, B_ACTION_USE_ITEM, 0)`
 *  → recorder `_aiEmit` (cf. en-tête fichier). Lit gBattleHistory
 *  (= gBattleResources->battleHistory). */
function ShouldUseItem(): boolean {
  let i: number;
  let validMons = 0;
  let shouldUse = false;

  if ((gBattleTypeFlags & BATTLE_TYPE_INGAME_PARTNER)
    && GetBattlerPosition(gActiveBattler) === B_POSITION_PLAYER_RIGHT) {
    return false;
  }

  const party = GET_BATTLER_SIDE(gActiveBattler) === B_SIDE_PLAYER ? gPlayerParty : gEnemyParty;

  for (i = 0; i < PARTY_SIZE; i++) {
    if (GetMonData(party[i], MON_DATA_HP) !== 0
      && GetMonData(party[i], MON_DATA_SPECIES_OR_EGG) !== SPECIES_NONE
      && GetMonData(party[i], MON_DATA_SPECIES_OR_EGG) !== SPECIES_EGG) {
      validMons++;
    }
  }

  for (i = 0; i < MAX_TRAINER_ITEMS; i++) {
    let itemEffects: number[];
    let paramOffset: number;
    let battlerSide: number;

    if (i !== 0 && validMons > (gBattleHistory.itemsNo - i) + 1) continue;
    const item = gBattleHistory.trainerItems[i];
    if (item === ITEM_NONE) continue;
    const tableBytes = getItemEffectBytes(item);
    // ≡ gItemEffectTable[item - ITEM_POTION] == NULL (inclut ITEM_ENIGMA_BERRY).
    if (tableBytes === null) continue;

    if (item === ITEM_ENIGMA_BERRY) itemEffects = _ENIGMA_BERRY_ITEM_EFFECT;
    else itemEffects = tableBytes;

    gBattleStruct.AI_itemType[gActiveBattler >> 1] = GetAI_ItemType(item, itemEffects);

    switch (gBattleStruct.AI_itemType[gActiveBattler >> 1]) {
      case AI_ITEM_FULL_RESTORE:
        if (gBattleMons[gActiveBattler].hp >= Math.floor(gBattleMons[gActiveBattler].maxHP / 4)) break;
        if (gBattleMons[gActiveBattler].hp === 0) break;
        shouldUse = true;
        break;
      case AI_ITEM_HEAL_HP:
        paramOffset = GetItemEffectParamOffset(item, 4, ITEM4_HEAL_HP);
        if (paramOffset === 0) break;
        if (gBattleMons[gActiveBattler].hp === 0) break;
        if (gBattleMons[gActiveBattler].hp < Math.floor(gBattleMons[gActiveBattler].maxHP / 4)
          || gBattleMons[gActiveBattler].maxHP - gBattleMons[gActiveBattler].hp > itemEffects[paramOffset]) {
          shouldUse = true;
        }
        break;
      case AI_ITEM_CURE_CONDITION:
        gBattleStruct.AI_itemFlags[gActiveBattler >> 1] = 0;
        if ((itemEffects[3] & ITEM3_SLEEP) && (gBattleMons[gActiveBattler].status1 & STATUS1_SLEEP)) {
          gBattleStruct.AI_itemFlags[gActiveBattler >> 1] |= (1 << AI_HEAL_SLEEP);
          shouldUse = true;
        }
        if ((itemEffects[3] & ITEM3_POISON)
          && ((gBattleMons[gActiveBattler].status1 & STATUS1_POISON)
            || (gBattleMons[gActiveBattler].status1 & STATUS1_TOXIC_POISON))) {
          gBattleStruct.AI_itemFlags[gActiveBattler >> 1] |= (1 << AI_HEAL_POISON);
          shouldUse = true;
        }
        if ((itemEffects[3] & ITEM3_BURN) && (gBattleMons[gActiveBattler].status1 & STATUS1_BURN)) {
          gBattleStruct.AI_itemFlags[gActiveBattler >> 1] |= (1 << AI_HEAL_BURN);
          shouldUse = true;
        }
        if ((itemEffects[3] & ITEM3_FREEZE) && (gBattleMons[gActiveBattler].status1 & STATUS1_FREEZE)) {
          gBattleStruct.AI_itemFlags[gActiveBattler >> 1] |= (1 << AI_HEAL_FREEZE);
          shouldUse = true;
        }
        if ((itemEffects[3] & ITEM3_PARALYSIS) && (gBattleMons[gActiveBattler].status1 & STATUS1_PARALYSIS)) {
          gBattleStruct.AI_itemFlags[gActiveBattler >> 1] |= (1 << AI_HEAL_PARALYSIS);
          shouldUse = true;
        }
        if ((itemEffects[3] & ITEM3_CONFUSION) && (gBattleMons[gActiveBattler].status2 & STATUS2_CONFUSION)) {
          gBattleStruct.AI_itemFlags[gActiveBattler >> 1] |= (1 << AI_HEAL_CONFUSION);
          shouldUse = true;
        }
        break;
      case AI_ITEM_X_STAT:
        gBattleStruct.AI_itemFlags[gActiveBattler >> 1] = 0;
        if (gDisableStructs[gActiveBattler].isFirstTurn === 0) break;
        if (itemEffects[0] & ITEM0_X_ATTACK) gBattleStruct.AI_itemFlags[gActiveBattler >> 1] |= (1 << AI_X_ATTACK);
        if (itemEffects[1] & ITEM1_X_DEFEND) gBattleStruct.AI_itemFlags[gActiveBattler >> 1] |= (1 << AI_X_DEFEND);
        if (itemEffects[1] & ITEM1_X_SPEED) gBattleStruct.AI_itemFlags[gActiveBattler >> 1] |= (1 << AI_X_SPEED);
        if (itemEffects[2] & ITEM2_X_SPATK) gBattleStruct.AI_itemFlags[gActiveBattler >> 1] |= (1 << AI_X_SPATK);
        if (itemEffects[2] & ITEM2_X_ACCURACY) gBattleStruct.AI_itemFlags[gActiveBattler >> 1] |= (1 << AI_X_ACCURACY);
        if (itemEffects[0] & ITEM0_DIRE_HIT) gBattleStruct.AI_itemFlags[gActiveBattler >> 1] |= (1 << AI_DIRE_HIT);
        shouldUse = true;
        break;
      case AI_ITEM_GUARD_SPEC:
        battlerSide = GET_BATTLER_SIDE(gActiveBattler);
        if (gDisableStructs[gActiveBattler].isFirstTurn !== 0 && gSideTimers[battlerSide].mistTimer === 0) {
          shouldUse = true;
        }
        break;
      case AI_ITEM_NOT_RECOGNIZABLE:
        return false;
    }

    if (shouldUse) {
      _aiEmit(B_ACTION_USE_ITEM, 0);
      gBattleStruct.chosenItem[(gActiveBattler >> 1) * 2] = item;
      gBattleHistory.trainerItems[i] = ITEM_NONE;
      return shouldUse;
    }
  }

  return false;
}

// ─── AI_TrySwitchOrUseItem (528-603) ───────────────────────────────────────

/** 1:1 décomp entry point. Décide : switch / item / move-action.
 *  Émet la décision via `_aiEmit` (lisible getAiSwitchDecision()). */
export function AI_TrySwitchOrUseItem(): void {
  let battlerIn1: number;
  let battlerIn2: number;
  let firstId: number;
  let lastId: number;
  const battlerIdentity = GetBattlerPosition(gActiveBattler);

  const party = GET_BATTLER_SIDE(gActiveBattler) === B_SIDE_PLAYER ? gPlayerParty : gEnemyParty;

  if (gBattleTypeFlags & BATTLE_TYPE_TRAINER) {
    if (ShouldSwitch()) {
      if (_AI_monToSwitchIntoId(gActiveBattler) === PARTY_SIZE) {
        let monToSwitchId = GetMostSuitableMonToSwitchInto();
        if (monToSwitchId === PARTY_SIZE) {
          if (!(gBattleTypeFlags & BATTLE_TYPE_DOUBLE)) {
            battlerIn1 = GetBattlerAtPosition(battlerIdentity);
            battlerIn2 = battlerIn1;
          } else {
            battlerIn1 = GetBattlerAtPosition(battlerIdentity);
            battlerIn2 = GetBattlerAtPosition(BATTLE_PARTNER(battlerIdentity));
          }

          if (gBattleTypeFlags & (BATTLE_TYPE_TWO_OPPONENTS | BATTLE_TYPE_TOWER_LINK_MULTI)) {
            if ((gActiveBattler & BIT_FLANK) === B_FLANK_LEFT) { firstId = 0; lastId = PARTY_SIZE / 2; }
            else { firstId = PARTY_SIZE / 2; lastId = PARTY_SIZE; }
          } else {
            firstId = 0; lastId = PARTY_SIZE;
          }

          for (monToSwitchId = firstId; monToSwitchId < lastId; monToSwitchId++) {
            if (GetMonData(party[monToSwitchId], MON_DATA_HP) === 0) continue;
            if (monToSwitchId === gBattlerPartyIndexes[battlerIn1]) continue;
            if (monToSwitchId === gBattlerPartyIndexes[battlerIn2]) continue;
            if (monToSwitchId === _monToSwitchIntoId(battlerIn1)) continue;
            if (monToSwitchId === _monToSwitchIntoId(battlerIn2)) continue;
            break;
          }
        }
        _set_AI_monToSwitchIntoId(gActiveBattler, monToSwitchId);
      }
      gBattleStruct.monToSwitchIntoId[gActiveBattler] = _AI_monToSwitchIntoId(gActiveBattler);
      return;
    } else if (ShouldUseItem()) {
      return;
    }
  }

  _aiEmit(B_ACTION_USE_MOVE, BATTLE_OPPOSITE(gActiveBattler) << 8);
}

// ─── ModulateByTypeEffectiveness (605-627) ─────────────────────────────────

function ModulateByTypeEffectiveness(atkType: number, defType1: number, defType2: number, ref: { v: number }): void {
  let i = 0;
  while (gTypeEffectiveness[i] !== TYPE_ENDTABLE) {
    if (gTypeEffectiveness[i] === TYPE_FORESIGHT) {
      i += 3;
      continue;
    } else if (gTypeEffectiveness[i] === atkType) {
      if (gTypeEffectiveness[i + 1] === defType1) {
        ref.v = Math.floor((ref.v * gTypeEffectiveness[i + 2]) / TYPE_MUL_NORMAL);
      }
      if (gTypeEffectiveness[i + 1] === defType2 && defType1 !== defType2) {
        ref.v = Math.floor((ref.v * gTypeEffectiveness[i + 2]) / TYPE_MUL_NORMAL);
      }
    }
    i += 3;
  }
}

// ─── GetMostSuitableMonToSwitchInto (629-790) ──────────────────────────────

export function GetMostSuitableMonToSwitchInto(): number {
  let opposingBattler: number;
  let bestDmg: number;
  let bestMonId: number;
  let battlerIn1: number;
  let battlerIn2: number;
  let firstId: number;
  let lastId: number;
  let i: number;
  let j: number;
  let invalidMons: number;
  let move: number;

  if (_monToSwitchIntoId(gActiveBattler) !== PARTY_SIZE) return _monToSwitchIntoId(gActiveBattler);
  if (gBattleTypeFlags & BATTLE_TYPE_ARENA) return gBattlerPartyIndexes[gActiveBattler] + 1;

  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
    battlerIn1 = gActiveBattler;
    if (gAbsentBattlerFlags & gBitTable[GetBattlerAtPosition(BATTLE_PARTNER(GetBattlerPosition(gActiveBattler)))]) {
      battlerIn2 = gActiveBattler;
    } else {
      battlerIn2 = GetBattlerAtPosition(BATTLE_PARTNER(GetBattlerPosition(gActiveBattler)));
    }
    // UB 1:1 : considère le côté joueur uniquement.
    opposingBattler = Random() & BIT_FLANK;
    if (gAbsentBattlerFlags & gBitTable[opposingBattler]) opposingBattler ^= BIT_FLANK;
  } else {
    opposingBattler = GetBattlerAtPosition(BATTLE_OPPOSITE(GetBattlerPosition(gActiveBattler)));
    battlerIn1 = gActiveBattler;
    battlerIn2 = gActiveBattler;
  }

  if (gBattleTypeFlags & (BATTLE_TYPE_TWO_OPPONENTS | BATTLE_TYPE_TOWER_LINK_MULTI)) {
    if ((gActiveBattler & BIT_FLANK) === B_FLANK_LEFT) { firstId = 0; lastId = PARTY_SIZE / 2; }
    else { firstId = PARTY_SIZE / 2; lastId = PARTY_SIZE; }
  } else {
    firstId = 0; lastId = PARTY_SIZE;
  }

  const party = GET_BATTLER_SIDE(gActiveBattler) === B_SIDE_PLAYER ? gPlayerParty : gEnemyParty;

  invalidMons = 0;

  while (invalidMons !== (1 << PARTY_SIZE) - 1) {
    bestDmg = TYPE_MUL_NO_EFFECT;
    bestMonId = PARTY_SIZE;
    // Find the mon whose type is the most suitable offensively.
    for (i = firstId; i < lastId; i++) {
      const species = GetMonData(party[i], MON_DATA_SPECIES) as number;
      if (species !== SPECIES_NONE
        && GetMonData(party[i], MON_DATA_HP) !== 0
        && !(gBitTable[i] & invalidMons)
        && gBattlerPartyIndexes[battlerIn1] !== i
        && gBattlerPartyIndexes[battlerIn2] !== i
        && i !== _monToSwitchIntoId(battlerIn1)
        && i !== _monToSwitchIntoId(battlerIn2)) {
        const [type1, type2] = speciesTypes(species);
        const ref = { v: TYPE_MUL_NORMAL };
        ModulateByTypeEffectiveness(gBattleMons[opposingBattler].type1, type1, type2, ref);
        ModulateByTypeEffectiveness(gBattleMons[opposingBattler].type2, type1, type2, ref);
        // Bug 1:1 : prend le type qui prend le PLUS de dégâts (conservé).
        if (bestDmg < ref.v) {
          bestDmg = ref.v;
          bestMonId = i;
        }
      } else {
        invalidMons |= gBitTable[i];
      }
    }

    if (bestMonId !== PARTY_SIZE) {
      for (i = 0; i < MAX_MON_MOVES; i++) {
        move = GetMonData(party[bestMonId], MON_DATA_MOVE1 + i) as number;
        if (move !== MOVE_NONE && (TypeCalc(move, gActiveBattler, opposingBattler) & MOVE_RESULT_SUPER_EFFECTIVE)) break;
      }
      if (i !== MAX_MON_MOVES) return bestMonId; // typing + ≥1 super effective move.
      invalidMons |= gBitTable[bestMonId];
    } else {
      invalidMons = (1 << PARTY_SIZE) - 1; // no viable mon.
    }
  }

  setDynamicBasePower(0);
  gBattleStruct.dynamicMoveType = 0;
  gBattleScripting.dmgMultiplier = 1;
  setMoveResultFlags(0);
  setCritMultiplier(1);
  bestDmg = 0;
  bestMonId = PARTY_SIZE;

  // Couldn't find by typing → the one that deals most damage.
  for (i = firstId; i < lastId; i++) {
    if ((GetMonData(party[i], MON_DATA_SPECIES) as number) === SPECIES_NONE) continue;
    if (GetMonData(party[i], MON_DATA_HP) === 0) continue;
    if (gBattlerPartyIndexes[battlerIn1] === i) continue;
    if (gBattlerPartyIndexes[battlerIn2] === i) continue;
    if (i === _monToSwitchIntoId(battlerIn1)) continue;
    if (i === _monToSwitchIntoId(battlerIn2)) continue;

    for (j = 0; j < MAX_MON_MOVES; j++) {
      move = GetMonData(party[i], MON_DATA_MOVE1 + j) as number;
      setBattleMoveDamage(0);
      if (move !== MOVE_NONE && getBattleMove(move).power !== 1) {
        AI_CalcDmg(gActiveBattler, opposingBattler);
        TypeCalc(move, gActiveBattler, opposingBattler);
      }
      if (bestDmg < gBattleMoveDamage) {
        bestDmg = gBattleMoveDamage;
        bestMonId = i;
      }
    }
  }
  return bestMonId;
}

// Expose pour battle-controller-opponent lazy lookup (= L11 wire).
(globalThis as { __battleAi?: Record<string, unknown> }).__battleAi = {
  ...(globalThis as { __battleAi?: Record<string, unknown> }).__battleAi,
  AI_TrySwitchOrUseItem,
  GetMostSuitableMonToSwitchInto,
};
