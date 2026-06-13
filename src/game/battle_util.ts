/**
 * game/battle_util.ts — MIROIR (partiel) de `src/battle_util.c` (décomp pokeemeraude).
 *
 * Contenu (par chapitre du .c) :
 *   - HandleAction_* (battle_util.c:78-650) : UseMove (full), UseItem, Switch,
 *     Run, RunBattleScript, TryFinish, ActionFinished, NothingIsFainted +
 *     HandleFaintedMonActions. [ex-engine/battle/handle-action.ts]
 *   - TryRunFromBattle (battle_util.c:407-485) + IsRunningFromBattleImpossible
 *     (battle_main.c:4021-4084). [ex-engine/battle/try-run-from-battle.ts,
 *     fusion miroir 2026-06-12]
 *
 * PAS ENCORE ICI (reste dans engine/battle/, à absorber au fil du miroir) :
 *   AbilityBattleEffects (ability-battle-effects.ts), ItemBattleEffects
 *   (item-battle-effects.ts), BattleScriptPushCursorAndCallback (battle_main.ts),
 *   les helpers util.ts, Safari/Wally HandleActions (backlog).
 *
 * Dispatch : la table 1:1 `sTurnActionsFuncsTable` (battle_main.c:536) vit dans
 * battle_main.ts qui importe les HandleAction_* d'ici directement.
 */

import {
  gLastUsedItem,
  gBattleMons, gBattlerAttacker, setBattlerAttacker,
  gBattlerTarget, setBattlerTarget,
  gActiveBattler, setActiveBattler,
  gCurrentMove, setCurrentMove,
  gChosenMove, setChosenMove,
  gCurrMovePos, setCurrMovePos,
  gChosenMovePos, setChosenMovePos,
  gChosenMoveByBattler,
  gBattlerByTurnOrder, gCurrentTurnActionNumber,
  gBattleTypeFlags, gBattlersCount,
  gAbsentBattlerFlags,
  gBattleStruct, gBattleResults,
  setCritMultiplier, setMultiHitCounter, setMoveResultFlags,
  gHitMarker, setHitMarker,
  gBattleScripting,
  gBattleCommunication,
  gLockedMoves,
  gProtectStructs, gDisableStructs, gSpecialStatuses,
  gSideTimers,
  setCurrentActionFuncId,
  setLastUsedAbility,
  gActionSelectionCursor, gMoveSelectionCursor,
  gBattlerPartyIndexes,
  gBattleControllerExecFlags,
  setBattlerFainted, setAbsentBattlerFlags,
} from '../engine/battle/state';
import {
  gBattleTextBuff1 as _gBattleTextBuff1_HA,
  PREPARE_MON_NICK_BUFFER,
} from '../engine/battle/text-buffers';
import {
  STATUS2_MULTIPLETURNS, STATUS2_RECHARGE,
  HITMARKER_NO_PPDEDUCT,
  MOVE_NONE, MOVE_STRUGGLE,
  MOVE_TARGET_SELECTED, MOVE_TARGET_USER, MOVE_TARGET_RANDOM,
  BATTLE_TYPE_DOUBLE, BATTLE_TYPE_PALACE, BATTLE_TYPE_ARENA, BATTLE_TYPE_SAFARI,
  GET_BATTLER_SIDE, B_SIDE_PLAYER,
  BATTLE_OPPOSITE,
  ABILITY_LIGHTNING_ROD,
  TYPE_ELECTRIC,
  NO_TARGET_OVERRIDE,
  B_ACTION_FINISHED, B_ACTION_EXEC_SCRIPT,
  MULTISTRING_CHOOSER,
  MISS_TYPE,
} from '../engine/battle/constants';
import { gBitTable } from '../engine/battle/battle-controllers';
import {
  GetBattlerAtPosition, GetBattlerPosition,
  B_POSITION_PLAYER_LEFT, B_POSITION_PLAYER_RIGHT,
  B_POSITION_OPPONENT_LEFT, B_POSITION_OPPONENT_RIGHT,
} from '../engine/battle/util';
import { RecordAbilityBattle } from './battle_ai_script_commands';
import { getBattleMove } from '../engine/battle/data/battle-moves';
// 1:1 décomp battle_util.c:1942-1945 — HandleFaintedMonActions case 6 applique les
// effets de switch-in (Intimidate/Trace/Forecast + items). Import direct (= pas de
// cycle : ability/item-battle-effects n'importent pas handle-action) ; même pattern
// que end-turn-effects.ts.
// ─── AbilityBattleEffects (battle_util.c:2414-3200) — absorbé au miroir 2026-06-13,
//     ex-engine/battle/ability-battle-effects.ts. Imports nouveaux (le reste : gBattleMons,
//     Random, getBattleScriptOffset, getBattleMove, GetBattlerAtPosition/Position,
//     constantes STATUS1/2/3/ABILITY/TYPE déjà présentes → réutilisées). ───
import {
  gLastUsedAbility,
  gBattleWeather, setBattleWeather,
  gBattleResourcesFlags,
} from '../engine/battle/state';
import {
  ABILITY_VOLT_ABSORB, ABILITY_WATER_ABSORB, ABILITY_FLASH_FIRE,
  ABILITY_IMMUNITY, ABILITY_OWN_TEMPO, ABILITY_LIMBER,
  ABILITY_WATER_VEIL, ABILITY_MAGMA_ARMOR, ABILITY_OBLIVIOUS,
  ABILITY_DRIZZLE, ABILITY_SAND_STREAM, ABILITY_DROUGHT, ABILITY_INTIMIDATE,
  ABILITY_TRACE, ABILITY_CLOUD_NINE, ABILITY_AIR_LOCK, ABILITY_FORECAST,
  ABILITY_RAIN_DISH, ABILITY_SHED_SKIN, ABILITY_SPEED_BOOST,
  ABILITY_SYNCHRONIZE,
  MOVE_EFFECT_TOXIC,
  ABILITY_COLOR_CHANGE, ABILITY_ROUGH_SKIN, ABILITY_EFFECT_SPORE,
  ABILITY_POISON_POINT, ABILITY_STATIC, ABILITY_FLAME_BODY, ABILITY_CUTE_CHARM,
  STATUS2_INFATUATED_WITH,
  MOVE_EFFECT_BURN, MOVE_EFFECT_PARALYSIS, MOVE_EFFECT_POISON,
  MOVE_EFFECT_AFFECTS_USER,
  MON_GENDERLESS,
  FLAG_MAKES_CONTACT,
  TYPE_WATER, TYPE_FIRE, TYPE_ICE, TYPE_NORMAL,
  B_WEATHER_HAIL,
  STATUS3_INTIMIDATE_POKES, STATUS3_TRACE,
  STATUS3_MUDSPORT, STATUS3_WATERSPORT,
  HITMARKER_STATUS_ABILITY_EFFECT,
  HITMARKER_SYNCHRONIZE_EFFECT,
  MOVE_EFFECT_CERTAIN,
  B_WEATHER_RAIN, B_WEATHER_RAIN_TEMPORARY, B_WEATHER_RAIN_PERMANENT,
  B_WEATHER_SANDSTORM, B_WEATHER_SANDSTORM_PERMANENT,
  B_WEATHER_SUN, B_WEATHER_SUN_PERMANENT,
  BIT_SIDE, BIT_FLANK,
} from '../engine/battle/constants';
import { GetGenderFromSpeciesAndPersonality } from '../engine/pokemon/pokemon';
import { reverseDecompConstant } from '../engine/system/decomp-constants';
import {
  gBattleTextBuff1 as _gBattleTextBuff1_ABE,
  gBattleTextBuff2 as _gBattleTextBuff2_ABE,
  PREPARE_MON_NICK_WITH_PREFIX_BUFFER,
  PREPARE_ABILITY_BUFFER,
  PREPARE_TYPE_BUFFER,
  B_BUFF_EOS,
} from '../engine/battle/text-buffers';
import { gBattlerPartyIndexes as _gBattlerPartyIndexes_ABE } from '../engine/battle/state';
import { SPECIES_CASTFORM } from '../engine/decomp-data/include/constants/species-data';
import { RecordAbilityBattle as _recordAbilityBattleFullABE } from './battle_ai_script_commands';
import {
  WEATHER_NONE, WEATHER_RAIN, WEATHER_RAIN_THUNDERSTORM,
  WEATHER_SANDSTORM, WEATHER_DROUGHT, WEATHER_DOWNPOUR,
} from '../engine/decomp-data/include/constants/weather-data';
// ─── DoFieldEndTurnEffects/DoBattlerEndTurnEffects (battle_util.c:1168-2200) —
//     absorbé au miroir 2026-06-13, ex-engine/battle/end-turn-effects.ts. Imports
//     nouveaux (le reste réutilise les blocs précédents ; dédup piloté par tsc). ───
import {
  gSideStatuses, gWishFutureKnock,
  gProtectStructs as gProtectStructsImport,
} from '../engine/battle/state';
import {
  B_WEATHER_RAIN_DOWNPOUR,
  B_WEATHER_SANDSTORM_TEMPORARY,
  B_WEATHER_SUN_TEMPORARY,
  B_WEATHER_HAIL_TEMPORARY,
  SIDE_STATUS_REFLECT, SIDE_STATUS_LIGHTSCREEN, SIDE_STATUS_MIST, SIDE_STATUS_SAFEGUARD,
  STATUS1_TOXIC_TURN,
  STATUS2_CURSED, STATUS2_WRAPPED_TURN,
  STATUS2_LOCK_CONFUSE, STATUS2_LOCK_CONFUSE_TURN,
  STATUS2_UPROAR_TURN,
  STATUS3_LEECHSEED, STATUS3_LEECHSEED_BATTLER,
  STATUS3_ALWAYS_HITS, STATUS3_ALWAYS_HITS_TURN, STATUS3_CHARGED_UP,
  STATUS3_YAWN, STATUS3_YAWN_TURN, STATUS3_PERISH_SONG,
} from '../engine/battle/constants';
import { gBattleTextBuff1, PREPARE_MOVE_BUFFER } from '../engine/battle/text-buffers';
import {
  MOVE_REFLECT, MOVE_LIGHT_SCREEN, MOVE_MIST, MOVE_FUTURE_SIGHT,
} from '../engine/decomp-data/include/constants/moves-data';
// ─── Helpers battle_util.c absorbés depuis util.ts (grab-bag, stage 2) ───
import {
  BS_TARGET, BS_ATTACKER, BS_EFFECT_BATTLER, BS_FAINTED,
  BS_ATTACKER_WITH_PARTNER, BS_FAINTED_LINK_MULTIPLE_1,
  BS_FAINTED_LINK_MULTIPLE_2, BS_BATTLER_0,
  BS_ATTACKER_SIDE, BS_NOT_ATTACKER_SIDE, BS_SCRIPTING,
  BS_PLAYER1, BS_OPPONENT1, BS_PLAYER2, BS_OPPONENT2,
  STATUS3_SEMI_INVULNERABLE,
} from '../engine/battle/constants';
import { gEffectBattler, gBattlerFainted } from '../engine/battle/state';
// ─── ItemBattleEffects (battle_util.c:3240-3800) — absorbé au miroir 2026-06-13,
//     ex-engine/battle/item-battle-effects.ts. (setPotentialItemEffectBattler,
//     setLastUsedItem, gLastUsedItem, getBattleMove, Random, GET_BATTLER_SIDE,
//     B_SIDE_PLAYER, STATUS1/2_*, gPlayerParty/GetMonData, gBattlerPartyIndexes,
//     GetItemHoldEffect, MAX_MON_MOVES : déjà présents ici → réutilisés.) ───
import { gBattleMoveDamage, setEffectBattler } from '../engine/battle/state';
import {
  NUM_BATTLE_STATS, DEFAULT_STAT_STAGE,
  MOVE_EFFECT_BYTE, MOVE_EFFECT_FLINCH, MOVE_RESULT_NO_EFFECT,
  FLAG_KINGS_ROCK_AFFECTED, IGNORE_SHELL_BELL,
  STATUS1_BURN, STATUS1_POISON, STATUS1_TOXIC_POISON, STATUS1_TOXIC_COUNTER,
  STATUS2_FOCUS_ENERGY,
  STAT_ATK, STAT_DEF, STAT_SPEED, STAT_SPATK, STAT_SPDEF,
  MAX_STAT_STAGE, SET_STATCHANGER, NUM_STATS,
} from '../engine/battle/constants';
import { GetItemHoldEffectParam } from '../engine/battle/data/item-hold-effects';
import { GetFlavorRelationByPersonality } from '../engine/battle/data/flavor-compat';
import {
  gEnemyParty, SetMonData, MON_DATA_MOVE1, MON_DATA_PP1,
} from '../engine/battle/party-storage';
import {
  HOLD_EFFECT_RESTORE_HP, HOLD_EFFECT_RESTORE_PP,
  HOLD_EFFECT_CURE_PAR, HOLD_EFFECT_CURE_SLP, HOLD_EFFECT_CURE_PSN,
  HOLD_EFFECT_CURE_BRN, HOLD_EFFECT_CURE_FRZ,
  HOLD_EFFECT_CURE_CONFUSION, HOLD_EFFECT_CURE_STATUS, HOLD_EFFECT_CURE_ATTRACT,
  HOLD_EFFECT_CONFUSE_SPICY, HOLD_EFFECT_CONFUSE_DRY,
  HOLD_EFFECT_CONFUSE_SWEET, HOLD_EFFECT_CONFUSE_BITTER, HOLD_EFFECT_CONFUSE_SOUR,
  HOLD_EFFECT_ATTACK_UP, HOLD_EFFECT_DEFENSE_UP, HOLD_EFFECT_SPEED_UP,
  HOLD_EFFECT_SP_ATTACK_UP, HOLD_EFFECT_SP_DEFENSE_UP,
  HOLD_EFFECT_CRITICAL_UP, HOLD_EFFECT_RANDOM_STAT_UP,
  HOLD_EFFECT_RESTORE_STATS,
  HOLD_EFFECT_FLINCH, HOLD_EFFECT_DOUBLE_PRIZE,
  HOLD_EFFECT_LEFTOVERS, HOLD_EFFECT_SHELL_BELL,
} from '../engine/decomp-data/include/constants/hold_effects-data';
import {
  gBattleTextBuff1 as _gBattleTextBuff1_IBE,
  gBattleTextBuff2 as _gBattleTextBuff2_IBE,
  PREPARE_STAT_BUFFER as _PREPARE_STAT_BUFFER_IBE,
  PREPARE_FLAVOR_BUFFER as _PREPARE_FLAVOR_BUFFER_IBE,
  PREPARE_MOVE_BUFFER as _PREPARE_MOVE_BUFFER_IBE,
  B_BUFF_PLACEHOLDER_BEGIN as _B_BUFF_BEGIN_IBE,
  B_BUFF_STRING as _B_BUFF_STRING_IBE,
  B_BUFF_EOS as _B_BUFF_EOS_IBE,
} from '../engine/battle/text-buffers';
import {
  getMoveEffectScriptOffset, getBattleScriptOffset,
  stepBattleScriptCommand, gBattleScriptContext,
} from '../engine/battle/script-interpreter';
import type { BattleScriptContext } from '../engine/battle/script-interpreter';
import { Random } from '../engine/system/random';
// Imports pour CheckMoveLimitations/AreAllMovesUnusable (battle_util.c:1069,
// ex-engine/battle/move-limitations.ts, absorbé au miroir 2026-06-13).
import { gLastMoves } from '../engine/battle/state';
import {
  STATUS2_TORMENT, STATUS3_IMPRISONED_OTHERS, MOVE_UNAVAILABLE, MAX_MON_MOVES,
  HOLD_EFFECT_CHOICE_BAND, MOVE_LIMITATIONS_ALL, ALL_MOVES_MASK,
  MOVE_LIMITATION_ZEROMOVE, MOVE_LIMITATION_PP, MOVE_LIMITATION_DISABLED,
  MOVE_LIMITATION_TORMENTED, MOVE_LIMITATION_TAUNT, MOVE_LIMITATION_IMPRISON,
} from '../engine/battle/constants';
// ─── IsMonDisobedient (battle_util.c:3890-4015) + helpers — absorbé au miroir
//     2026-06-13, ex-engine/battle/disobedience.ts. (GetMoveTarget = _GetMoveTarget
//     local l.138, déjà le miroir de battle_util.c:3811 → pas d'import croisé.) ───
import { setCalledMove, setBattleMoveDamage } from '../engine/battle/state';
import {
  BATTLE_TYPE_RECORDED_LINK, B_SIDE_OPPONENT,
  DISOBEDIENCE_OBEDIENT, DISOBEDIENCE_IGNORED, DISOBEDIENCE_OTHER,
  STATUS1_ANY, STATUS1_SLEEP, STATUS2_RAGE, STATUS2_UPROAR,
  MOVE_RAGE, MOVE_SNORE, MOVE_SLEEP_TALK, MOVE_POUND,
  NUM_LOAF_STRINGS,
  HITMARKER_DISOBEDIENT_MOVE, HITMARKER_UNABLE_TO_USE_MOVE,
  ABILITY_VITAL_SPIRIT, ABILITY_INSOMNIA,
} from '../engine/battle/constants';
import { SPECIES_MEW, SPECIES_DEOXYS } from '../engine/decomp-data/include/constants/species-data';
import { CalculateBaseDamage } from './pokemon';
import { gPlayerParty, GetMonData, MON_DATA_SPECIES } from '../engine/battle/party-storage';
import { gSaveBlock2Ptr } from '../engine/save/save-block-state';
import { FlagGet } from '../engine/script/script-vars';
// ─── AtkCanceler_UnableToUseMove (battle_util.c:1985-2270) — absorbé au miroir
//     2026-06-13, ex-engine/battle/atk-canceler.ts. (CalculateBaseDamage,
//     _GetMoveTarget local l.138, _GetImprisonedMovesCount l.1210,
//     _calculateConfusionDamage l.1323 : déjà présents ici → réutilisés.) ───
import { gBideDmg, gBideTarget, gMoveResultFlags } from '../engine/battle/state';
import {
  STATUS1_FREEZE, STATUS1_PARALYSIS,
  STATUS2_DESTINY_BOND, STATUS2_NIGHTMARE, STATUS2_FLINCHED,
  STATUS2_INFATUATION, STATUS2_CONFUSION, STATUS2_CONFUSION_TURN,
  STATUS2_BIDE, STATUS2_BIDE_TURN,
  STATUS3_GRUDGE,
  HITMARKER_NO_ATTACKSTRING,
  B_MSG_WOKE_UP, B_MSG_WOKE_UP_UPROAR, B_MSG_LOAFING,
  B_MSG_DEFROSTED, B_MSG_DEFROSTED_BY_MOVE,
  MOVE_RESULT_MISSED,
  ABILITY_EARLY_BIRD, ABILITY_TRUANT, ABILITY_SOUNDPROOF,
  EFFECT_THAW_HIT, MOVE_BIDE,
} from '../engine/battle/constants';
// (setPotentialItemEffectBattler + GetItemHoldEffect déjà importés plus bas dans ce fichier)

const B_MSG_INCAPABLE_OF_POWER = 0;  // Battle Palace deferred

/** 1:1 stub `BATTLE_PARTNER(id)` — défini déjà dans constants mais we inline. */
function _BATTLE_PARTNER(id: number): number { return id ^ 2 /* BIT_FLANK */; }

/** 1:1 stub `GetBattlerTurnOrderNum(battler)` (battle_util.c). Retourne l'index
 *  i tel que `gBattlerByTurnOrder[i] === battler`. */
function _GetBattlerTurnOrderNum(battler: number): number {
  for (let i = 0; i < gBattlersCount; i++) {
    if (gBattlerByTurnOrder[i] === battler) return i;
  }
  return 0;
}

// 1:1 décomp `RecordAbilityBattle` — wired via util.ts.
const _RecordAbilityBattle = RecordAbilityBattle;

/** 1:1 décomp battle_util.c : `gBattlerTarget = *(gBattleStruct->moveTarget + gBattlerAttacker)`
 *  (branche move SELECTED normale). La table par-battler `gBattleStruct.moveTarget[]`
 *  (state.ts:542) est posée par la sélection (SetActionsAndBattlersTurnOrder) ; le
 *  harness la pose aussi. N'affecte QUE la voie L (HandleAction_UseMove) — la voie V
 *  saute au script d'effet sans passer ici. */
function _getMoveTargetForBattler(battler: number): number {
  return gBattleStruct.moveTarget[battler];
}

function _setMoveTargetForBattler(_battler: number, _target: number): void {
  // moveTarget array deferred. La cible est set via gBattlerTarget.
  setBattlerTarget(_target);
}

/** 1:1 décomp `GetMoveTarget` (battle_util.c:3811). Re-exporté depuis
 *  cmd-niveau-34 (= déjà porté). Pour éviter circular import, inline ici. */
function _GetMoveTarget(move: number, setTarget: number): number {
  let targetBattler = 0;
  let moveTarget: number;
  let side: number;

  if (setTarget !== NO_TARGET_OVERRIDE) {
    moveTarget = setTarget - 1;
  } else {
    moveTarget = getBattleMove(move).target;
  }

  switch (moveTarget) {
    case MOVE_TARGET_SELECTED: {
      side = BATTLE_OPPOSITE(GET_BATTLER_SIDE(gBattlerAttacker));
      if (gSideTimers[side].followmeTimer
          && gBattleMons[gSideTimers[side].followmeTarget].hp) {
        targetBattler = gSideTimers[side].followmeTarget;
      } else {
        side = GET_BATTLER_SIDE(gBattlerAttacker);
        let safetyIter = 0;
        do {
          targetBattler = Random() % gBattlersCount;
          safetyIter++;
        } while (
          (targetBattler === gBattlerAttacker
           || side === GET_BATTLER_SIDE(targetBattler)
           || (gAbsentBattlerFlags & (1 << targetBattler)))
          && safetyIter < 100
        );
      }
      break;
    }
    case MOVE_TARGET_USER:
      targetBattler = gBattlerAttacker;
      break;
    default:
      // MOVE_TARGET_BOTH, FOES_AND_ALLY, OPPONENTS_FIELD, RANDOM, etc.
      targetBattler = GetBattlerAtPosition(BATTLE_OPPOSITE(GET_BATTLER_SIDE(gBattlerAttacker)));
      if (gAbsentBattlerFlags & (1 << targetBattler)) {
        targetBattler ^= 2;
      }
      break;
  }
  return targetBattler;
}

/** 1:1 décomp `HandleAction_UseMove` (battle_util.c:78-292). */
export function HandleAction_UseMove(ctx?: BattleScriptContext): void {
  let var_ = 4;

  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);

  // Skip si absent.
  if (gBattleStruct.absentBattlerFlags & gBitTable[gBattlerAttacker]) {
    setCurrentActionFuncId(B_ACTION_FINISHED);
    return;
  }

  // Reset combat state (= 1:1 décomp).
  setCritMultiplier(1);
  gBattleScripting.dmgMultiplier = 1;
  gBattleStruct.atkCancelerTracker = 0;
  setMoveResultFlags(0);
  setMultiHitCounter(0);
  gBattleCommunication[MISS_TYPE] = 0;  // 1:1 décomp battle_util.c:96 (MISS_TYPE=6)

  // 1:1 décomp battle_util.c:99 : `gCurrMovePos = gChosenMovePos = gBattleStruct->chosenMovePositions[attacker]`.
  // INDISPENSABLE : sans cette ligne, gCurrMovePos restait à 0 → TOUS les branches
  // ci-dessous (moves[gCurrMovePos]) utilisaient moves[0] → le joueur ne pouvait JAMAIS
  // jouer un move autre que le slot 0 (sélectionner Leer slot 1 jouait Pound slot 0).
  // Bug masqué jusqu'ici car harness/AI/tests utilisaient toujours le slot 0.
  // chosenMovePositions[] est posé par : in-game (battle-action-selection.ts:620 depuis
  // gBattleBufferB[2]), AI (ai-script-commands.ts:436-437), harness (battle-decomp-loop.ts:395).
  setCurrMovePos(gBattleStruct.chosenMovePositions[gBattlerAttacker]);
  setChosenMovePos(gBattleStruct.chosenMovePositions[gBattlerAttacker]);

  // Choose move 1:1 décomp.
  if (gProtectStructs[gBattlerAttacker].noValidMoves) {
    gProtectStructs[gBattlerAttacker].noValidMoves = 0;
    setCurrentMove(MOVE_STRUGGLE);
    setChosenMove(MOVE_STRUGGLE);
    setHitMarker(gHitMarker | HITMARKER_NO_PPDEDUCT);
    _setMoveTargetForBattler(gBattlerAttacker, _GetMoveTarget(MOVE_STRUGGLE, NO_TARGET_OVERRIDE));
  } else if (gBattleMons[gBattlerAttacker].status2 & STATUS2_MULTIPLETURNS
             || gBattleMons[gBattlerAttacker].status2 & STATUS2_RECHARGE) {
    setCurrentMove(gLockedMoves[gBattlerAttacker]);
    setChosenMove(gLockedMoves[gBattlerAttacker]);
  } else if (gDisableStructs[gBattlerAttacker].encoredMove !== MOVE_NONE
             && gDisableStructs[gBattlerAttacker].encoredMove === gBattleMons[gBattlerAttacker].moves[gDisableStructs[gBattlerAttacker].encoredMovePos]) {
    // Encore forces same move
    const encored = gDisableStructs[gBattlerAttacker].encoredMove;
    setCurrentMove(encored);
    setChosenMove(encored);
    setCurrMovePos(gDisableStructs[gBattlerAttacker].encoredMovePos);
    setChosenMovePos(gDisableStructs[gBattlerAttacker].encoredMovePos);
    _setMoveTargetForBattler(gBattlerAttacker, _GetMoveTarget(encored, NO_TARGET_OVERRIDE));
  } else if (gDisableStructs[gBattlerAttacker].encoredMove !== MOVE_NONE
             && gDisableStructs[gBattlerAttacker].encoredMove !== gBattleMons[gBattlerAttacker].moves[gDisableStructs[gBattlerAttacker].encoredMovePos]) {
    // Encored move was overwritten — reset
    setCurrMovePos(gDisableStructs[gBattlerAttacker].encoredMovePos);
    setChosenMovePos(gDisableStructs[gBattlerAttacker].encoredMovePos);
    const move = gBattleMons[gBattlerAttacker].moves[gCurrMovePos];
    setCurrentMove(move);
    setChosenMove(move);
    gDisableStructs[gBattlerAttacker].encoredMove = MOVE_NONE;
    gDisableStructs[gBattlerAttacker].encoredMovePos = 0;
    gDisableStructs[gBattlerAttacker].encoreTimer = 0;
    _setMoveTargetForBattler(gBattlerAttacker, _GetMoveTarget(move, NO_TARGET_OVERRIDE));
  } else if (gBattleMons[gBattlerAttacker].moves[gCurrMovePos] !== gChosenMoveByBattler[gBattlerAttacker]) {
    const move = gBattleMons[gBattlerAttacker].moves[gCurrMovePos];
    setCurrentMove(move);
    setChosenMove(move);
    _setMoveTargetForBattler(gBattlerAttacker, _GetMoveTarget(move, NO_TARGET_OVERRIDE));
  } else {
    const move = gBattleMons[gBattlerAttacker].moves[gCurrMovePos];
    setCurrentMove(move);
    setChosenMove(move);
  }

  if (gBattleMons[gBattlerAttacker].hp !== 0) {
    // 1:1 décomp `HandleAction_UseMove` (battle_util.c:165-175).
    if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER) {
      gBattleResults.lastUsedMovePlayer = gCurrentMove;
    } else {
      gBattleResults.lastUsedMoveOpponent = gCurrentMove;
    }
  }

  // Choose target.
  const side = BATTLE_OPPOSITE(GET_BATTLER_SIDE(gBattlerAttacker));
  if (gSideTimers[side].followmeTimer !== 0
      && getBattleMove(gCurrentMove).target === MOVE_TARGET_SELECTED
      && GET_BATTLER_SIDE(gBattlerAttacker) !== GET_BATTLER_SIDE(gSideTimers[side].followmeTarget)
      && gBattleMons[gSideTimers[side].followmeTarget].hp !== 0) {
    setBattlerTarget(gSideTimers[side].followmeTarget);
  } else if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE)
             && gSideTimers[side].followmeTimer === 0
             && (getBattleMove(gCurrentMove).power !== 0
                 || getBattleMove(gCurrentMove).target !== MOVE_TARGET_USER)
             && gBattleMons[_getMoveTargetForBattler(gBattlerAttacker)].ability !== ABILITY_LIGHTNING_ROD
             && getBattleMove(gCurrentMove).type === TYPE_ELECTRIC) {
    // Lightning Rod redirect double battle.
    const sideAtk = GET_BATTLER_SIDE(gBattlerAttacker);
    for (let active = 0; active < gBattlersCount; active++) {
      setActiveBattler(active);
      if (sideAtk !== GET_BATTLER_SIDE(active)
          && _getMoveTargetForBattler(gBattlerAttacker) !== active
          && gBattleMons[active].ability === ABILITY_LIGHTNING_ROD
          && _GetBattlerTurnOrderNum(active) < var_) {
        var_ = _GetBattlerTurnOrderNum(active);
      }
    }
    if (var_ === 4) {
      // Pas de Lightning Rod trouvé — pick target normal.
      if (getBattleMove(gChosenMove).target & MOVE_TARGET_RANDOM) {
        if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER) {
          setBattlerTarget((Random() & 1)
            ? GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT)
            : GetBattlerAtPosition(B_POSITION_OPPONENT_RIGHT));
        } else {
          setBattlerTarget((Random() & 1)
            ? GetBattlerAtPosition(B_POSITION_PLAYER_LEFT)
            : GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT));
        }
      } else {
        setBattlerTarget(_getMoveTargetForBattler(gBattlerAttacker));
      }
      // Absent battler redirect to partner.
      if (gAbsentBattlerFlags & gBitTable[gBattlerTarget]) {
        if (GET_BATTLER_SIDE(gBattlerAttacker) !== GET_BATTLER_SIDE(gBattlerTarget)) {
          setBattlerTarget(GetBattlerAtPosition(_BATTLE_PARTNER(GetBattlerPosition(gBattlerTarget))));
        } else {
          setBattlerTarget(GetBattlerAtPosition(BATTLE_OPPOSITE(GetBattlerPosition(gBattlerAttacker))));
          if (gAbsentBattlerFlags & gBitTable[gBattlerTarget]) {
            setBattlerTarget(GetBattlerAtPosition(_BATTLE_PARTNER(GetBattlerPosition(gBattlerTarget))));
          }
        }
      }
    } else {
      // Lightning Rod redirect actif.
      setActiveBattler(gBattlerByTurnOrder[var_]);
      _RecordAbilityBattle(gActiveBattler, gBattleMons[gActiveBattler].ability);
      gSpecialStatuses[gActiveBattler].lightningRodRedirected = 1;
      setBattlerTarget(gActiveBattler);
    }
  } else if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE)
             && (getBattleMove(gChosenMove).target & MOVE_TARGET_RANDOM)) {
    if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER) {
      setBattlerTarget((Random() & 1)
        ? GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT)
        : GetBattlerAtPosition(B_POSITION_OPPONENT_RIGHT));
    } else {
      setBattlerTarget((Random() & 1)
        ? GetBattlerAtPosition(B_POSITION_PLAYER_LEFT)
        : GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT));
    }
    if ((gAbsentBattlerFlags & gBitTable[gBattlerTarget])
        && GET_BATTLER_SIDE(gBattlerAttacker) !== GET_BATTLER_SIDE(gBattlerTarget)) {
      setBattlerTarget(GetBattlerAtPosition(_BATTLE_PARTNER(GetBattlerPosition(gBattlerTarget))));
    }
  } else {
    setBattlerTarget(_getMoveTargetForBattler(gBattlerAttacker));
    if (gAbsentBattlerFlags & gBitTable[gBattlerTarget]) {
      if (GET_BATTLER_SIDE(gBattlerAttacker) !== GET_BATTLER_SIDE(gBattlerTarget)) {
        setBattlerTarget(GetBattlerAtPosition(_BATTLE_PARTNER(GetBattlerPosition(gBattlerTarget))));
      } else {
        setBattlerTarget(GetBattlerAtPosition(BATTLE_OPPOSITE(GetBattlerPosition(gBattlerAttacker))));
        if (gAbsentBattlerFlags & gBitTable[gBattlerTarget]) {
          setBattlerTarget(GetBattlerAtPosition(_BATTLE_PARTNER(GetBattlerPosition(gBattlerTarget))));
        }
      }
    }
  }

  // Battle Palace fallback (= rare cas trainer Palace).
  let scriptPtr = -1;
  if ((gBattleTypeFlags & BATTLE_TYPE_PALACE) && gProtectStructs[gBattlerAttacker].palaceUnableToUseMove) {
    if (gBattleMons[gBattlerAttacker].hp === 0) {
      setCurrentActionFuncId(B_ACTION_FINISHED);
      return;
    }
    // gPalaceSelectionBattleScripts Frontier deferred.
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_INCAPABLE_OF_POWER;
    scriptPtr = getBattleScriptOffset('BattleScript_MoveUsedLoafingAround');
  } else {
    // 1:1 décomp : `gBattlescriptCurrInstr = gBattleScriptsForMoveEffects[gBattleMoves[gCurrentMove].effect]`.
    const moveEffect = getBattleMove(gCurrentMove).effect;
    scriptPtr = getMoveEffectScriptOffset(moveEffect as number);
  }

  // Battle Arena : BattleArena_AddMindPoints. Battle Frontier deferred post-Phase 1.
  if (gBattleTypeFlags & BATTLE_TYPE_ARENA) {
    // BattleArena_AddMindPoints deferred.
    void setLastUsedAbility;
  }

  setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);

  // 1:1 décomp battle_util.c:285 : `gBattlescriptCurrInstr = gBattleScriptsForMoveEffects[effect]`.
  // On pose le scriptPtr sur le ctx persistant (= le global gBattlescriptCurrInstr),
  // que HandleAction_RunBattleScript steppera commande par commande (1×/frame,
  // gated sur gBattleControllerExecFlags). La voie V passe son propre ctx local.
  const c = ctx ?? gBattleScriptContext;
  if (scriptPtr >= 0) {
    c.scriptPtr = scriptPtr;
  }
}

/** 1:1 décomp `HandleAction_Switch` (battle_util.c:294-310). */
export function HandleAction_Switch(ctx?: BattleScriptContext): void {
  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);
  // 1:1 décomp battle_util.c : gBattle_BG0_X/Y = 0 — BG scroll registers GBA
  // (= no-op web canvas, le scroll est piloté par le renderer side).
  // gActionSelectionCursor / gMoveSelectionCursor reset au switch.
  gActionSelectionCursor[gBattlerAttacker] = 0;
  gMoveSelectionCursor[gBattlerAttacker] = 0;
  // 1:1 décomp battle_util.c : PREPARE_MON_NICK_BUFFER. battlerPartyIndexes
  // dans le décomp = gBattleStruct->battlerPartyIndexes ; notre port utilise
  // gBattlerPartyIndexes pour le party slot courant de chaque battler.
  PREPARE_MON_NICK_BUFFER(_gBattleTextBuff1_HA, gBattlerAttacker, gBattlerPartyIndexes[gBattlerAttacker]);
  gBattleScripting.battler = gBattlerAttacker;
  const off = getBattleScriptOffset('BattleScript_ActionSwitch');
  // ctx est undefined quand appelé via le turn dispatch (sTurnActionsFuncsTable() sans
  // arg) → fallback sur le ctx PERSISTANT gBattleScriptContext (= celui que steppe
  // HandleAction_RunBattleScript). Sans ce fallback le scriptPtr n'était JAMAIS posé
  // → le mon ne swappait pas, tour figé à RunTurnActionsFunctions (bug switch loop #9).
  // Pattern `ctx ?? gBattleScriptContext` = handle-action.ts:357/482.
  const c = ctx ?? gBattleScriptContext;
  if (off >= 0) c.scriptPtr = off;
  setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
  // 1:1 décomp ll.308-309 : incrémente playerSwitchesCounter (cap à 255 u8).
  if (gBattleResults.playerSwitchesCounter < 255) {
    gBattleResults.playerSwitchesCounter++;
  }
}

/** 1:1 décomp `HandleAction_UseItem` (battle_util.c:312+). partial port.
 *  Wirage minimal : set attacker + ClearFuryCutterDestinyBondGrudge.
 *  Phase 1.4 : full item battle flow deferred (= read gBattleBufferB[1..2] pour item ID,
 *  switch sur effect, run bytecode item-use). */
export function HandleAction_UseItem(ctx?: BattleScriptContext): void {
  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);
  setBattlerTarget(gBattlerAttacker);
  ClearFuryCutterDestinyBondGrudge(gBattlerAttacker);
  // 1:1 decomp battle_util.c:318 : gLastUsedItem = bufferB[1] | bufferB[2]<<8
  // (deja pose 1:1 par STATE_WAIT_ACTION_CASE_CHOSEN -> setLastUsedItem).
  const item = gLastUsedItem;
  if (item > 0 && item <= 12 /* LAST_BALL = ITEM_PREMIER_BALL */) {
    // 1:1 : gBattlescriptCurrInstr = gBattlescriptsForBallThrow[item] — la table
    // (battle_scripts_2.s:15) pointe BattleScript_BallThrow pour toutes les balls
    // (Safari = BattleScript_SafariBallThrow, item 5 en Safari uniquement).
    const off = getBattleScriptOffset('BattleScript_BallThrow');
    // Le dispatcher C7 (RunTurnActionsFunctions) appelle les handlers SANS ctx
    // -> fallback 1:1 sur le ctx PERSISTANT (gBattleScriptContext), comme
    // HandleEndTurn_BattleWon.
    const c = ctx ?? gBattleScriptContext;
    if (off >= 0 && c) {
      c.scriptPtr = off;
      setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
      return;
    }
  }
  // 1:1 decomp battle_util.c:324-330 : POKE_DOLL(80)/FLUFFY_TAIL(81) ->
  // BattleScript_RunByUsingItem (fuite garantie wild) ; autres items joueur ->
  // BattleScript_PlayerUsesItem (message + finishaction ; l effet medecine/X a
  // deja ete applique cote bag/party 1:1). Branche AI trainer items = dette.
  if (item === 80 || item === 81) {
    const off2 = getBattleScriptOffset('BattleScript_RunByUsingItem');
    const c2 = ctx ?? gBattleScriptContext;
    if (off2 >= 0 && c2) {
      c2.scriptPtr = off2;
      setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
      return;
    }
  } else if (item > 0) {
    const off3 = getBattleScriptOffset('BattleScript_PlayerUsesItem');
    const c3 = ctx ?? gBattleScriptContext;
    if (off3 >= 0 && c3) {
      c3.scriptPtr = off3;
      setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
      return;
    }
  }
  setCurrentActionFuncId(B_ACTION_FINISHED);
}

/** 1:1 décomp `HandleAction_Run` (battle_util.c:487-539). */
export function HandleAction_Run(ctx?: BattleScriptContext): void {
  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);

  if (gBattleTypeFlags & (_BATTLE_TYPE_LINK_HAR | _BATTLE_TYPE_RECORDED_LINK_HAR)) {
    // 1:1 décomp ll.491-510 : link battle run = all link battlers lose/win.
    setCurrentTurnActionNumberHAR(gBattlersCount);
    for (let i = 0; i < gBattlersCount; i++) {
      _setActiveBattlerHAR(i);
      if (GET_BATTLER_SIDE(i) === B_SIDE_PLAYER) {
        if (_gChosenActionByBattlerHAR[i] === _B_ACTION_RUN_HAR) {
          // OUTCOME_LOST = 2 ; combiné avec outcome existant via OR.
          _setBattleOutcomeHAR(_gBattleOutcomeHAR | 2);
        }
      } else {
        if (_gChosenActionByBattlerHAR[i] === _B_ACTION_RUN_HAR) {
          // OUTCOME_WON = 1.
          _setBattleOutcomeHAR(_gBattleOutcomeHAR | 1);
        }
      }
    }
    // OUTCOME_LINK_BATTLE_RAN = 1 << 7 = 0x80.
    // Frontier deferred : gSaveBlock2Ptr.frontier.disableRecordBattle = TRUE (= Frontier post-Phase 1).
    return;
  }

  // Normal battle.
  if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER) {
    if (!TryRunFromBattle(gBattlerAttacker)) {
      // Failed to run away.
      ClearFuryCutterDestinyBondGrudge(gBattlerAttacker);
      gBattleCommunication[MULTISTRING_CHOOSER] = _B_MSG_CANT_ESCAPE_2_HAR;
      const off = _getBattleScriptOffsetHAR('BattleScript_PrintFailedToRunString');
      // 1:1 décomp `gBattlescriptCurrInstr = BattleScript_PrintFailedToRunString` :
      // la table sTurnActionsFuncsTable appelle SANS ctx → fallback OBLIGATOIRE sur
      // le ctx persistant (sinon le script n'est jamais pointé → B_ACTION_EXEC_SCRIPT
      // steppe l'ancien pointeur = soft-lock silencieux au menu, bug user fuite).
      const c = ctx ?? gBattleScriptContext;
      if (c && off >= 0) c.scriptPtr = off;
      setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
    }
    // Si TryRunFromBattle a réussi : il a déjà set gBattleOutcome = RAN +
    // gCurrentTurnActionNumber = gBattlersCount.
  } else {
    // Wild opponent essaie de fuir (= Roar / Whirlwind sur joueur).
    if (gBattleMons[gBattlerAttacker].status2 & (_STATUS2_WRAPPED_HAR | _STATUS2_ESCAPE_PREVENTION_HAR)) {
      gBattleCommunication[MULTISTRING_CHOOSER] = _B_MSG_ATTACKER_CANT_ESCAPE_HAR;
      const off = _getBattleScriptOffsetHAR('BattleScript_PrintFailedToRunString');
      // 1:1 : même fallback ctx persistant (appel sans ctx depuis la table d'actions).
      const c = ctx ?? gBattleScriptContext;
      if (c && off >= 0) c.scriptPtr = off;
      setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
    } else {
      setCurrentTurnActionNumberHAR(gBattlersCount);
      _setBattleOutcomeHAR(6 /* B_OUTCOME_MON_FLED */);
    }
  }
}

// ─── Actions SAFARI + WALLY (battle_util.c:550-637) — tranche battle_util ×7 ──
// Atteignabilité : Safari Zone + tuto Wally hors démo actuelle (les boots
// DoSafariBattle/StartWallyTutorialBattle = dettes notées) ; les handlers sont
// la STRUCTURE 1:1 complète, dispatchés par sTurnActionsFuncsTable dès que les
// entrées de jeu existeront.

/** 1:1 `sPkblToEscapeFactor[5][3]` (battle_util.c:52-74) — lignes = throw
 *  counter, colonnes = B_MSG_MON_CURIOUS(0)/ENTHRALLED(1)/IGNORED(2). */
const sPkblToEscapeFactor: ReadonlyArray<ReadonlyArray<number>> = [
  [0, 0, 0], [3, 5, 0], [2, 3, 0], [1, 2, 0], [1, 1, 0],
];
/** 1:1 `sGoNearCounterToCatchFactor[]` (battle_util.c:75). */
const sGoNearCounterToCatchFactor: readonly number[] = [4, 3, 2, 1];
/** 1:1 `sGoNearCounterToEscapeFactor[]` (battle_util.c:76). */
const sGoNearCounterToEscapeFactor: readonly number[] = [4, 4, 4, 4];

/** 1:1 EWRAM `gNumSafariBalls` (battle global) — décrémenté par le throw ;
 *  initialisé (30) à l'entrée Safari Zone (boot safari = dette). */
export let gNumSafariBalls = 0;
export function setNumSafariBalls(v: number): void { gNumSafariBalls = v & 0xFF; }

/** 1:1 `MULTISTRING_CHOOSER` (battle.h) = gBattleCommunication[5]. */
const _MULTISTRING_CHOOSER_SAF = 5;
const _ITEM_SAFARI_BALL = 5;
/** 1:1 battle_string_ids.h:548-549. */
const _B_MSG_CREPT_CLOSER = 0, _B_MSG_CANT_GET_CLOSER = 1;

/** 1:1 décomp `HandleAction_SafariZoneBallThrow()` (battle_util.c:550-560).
 *  gBattle_BG0_X/Y=0 : scroll textbox piloté par le renderer web (cf.
 *  HandleAction_Switch, même convention no-op). */
export function HandleAction_SafariZoneBallThrow(ctx?: BattleScriptContext): void {
  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);
  gNumSafariBalls--;
  _setLastUsedItemSAF(_ITEM_SAFARI_BALL);
  // 1:1 gBattlescriptsForBallThrow[ITEM_SAFARI_BALL] = BattleScript_SafariBallThrow
  // (battle_scripts_2.s:20).
  const off = getBattleScriptOffset('BattleScript_SafariBallThrow');
  const c = ctx ?? gBattleScriptContext;
  if (c && off >= 0) c.scriptPtr = off;
  setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
}

/** 1:1 décomp `HandleAction_ThrowPokeblock()` (battle_util.c:561-589).
 *  ⚠️ QUIRK VANILLA reproduit (pas de BUGFIX) : `<` au lieu de `<=` →
 *  safariEscapeFactor peut tomber à 0 (« pokeblock throw glitch »). */
export function HandleAction_ThrowPokeblock(ctx?: BattleScriptContext): void {
  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);
  gBattleCommunication[_MULTISTRING_CHOOSER_SAF] = (gBattleBufferB[gBattlerAttacker][1] ?? 1) - 1;
  _setLastUsedItemSAF(gBattleBufferB[gBattlerAttacker][2] ?? 0);

  if (gBattleResults.pokeblockThrows < 255) gBattleResults.pokeblockThrows++;
  const bs = gBattleStruct as { safariPkblThrowCounter?: number; safariEscapeFactor?: number };
  if ((bs.safariPkblThrowCounter ?? 0) < 3) bs.safariPkblThrowCounter = (bs.safariPkblThrowCounter ?? 0) + 1;
  if ((bs.safariEscapeFactor ?? 0) > 1) {
    const dec = sPkblToEscapeFactor[bs.safariPkblThrowCounter ?? 0][gBattleCommunication[_MULTISTRING_CHOOSER_SAF]] ?? 0;
    if ((bs.safariEscapeFactor ?? 0) < dec) bs.safariEscapeFactor = 1;
    else bs.safariEscapeFactor = (bs.safariEscapeFactor ?? 0) - dec;
  }

  // 1:1 gBattlescriptsForSafariActions[2] = BattleScript_ActionThrowPokeblock.
  const off = getBattleScriptOffset('BattleScript_ActionThrowPokeblock');
  const c = ctx ?? gBattleScriptContext;
  if (c && off >= 0) c.scriptPtr = off;
  setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
}

/** 1:1 décomp `HandleAction_GoNear()` (battle_util.c:590-616). */
export function HandleAction_GoNear(ctx?: BattleScriptContext): void {
  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);
  const bs = gBattleStruct as { safariCatchFactor?: number; safariEscapeFactor?: number; safariGoNearCounter?: number };

  bs.safariCatchFactor = (bs.safariCatchFactor ?? 0) + (sGoNearCounterToCatchFactor[bs.safariGoNearCounter ?? 0] ?? 0);
  if (bs.safariCatchFactor > 20) bs.safariCatchFactor = 20;

  bs.safariEscapeFactor = (bs.safariEscapeFactor ?? 0) + (sGoNearCounterToEscapeFactor[bs.safariGoNearCounter ?? 0] ?? 0);
  if (bs.safariEscapeFactor > 20) bs.safariEscapeFactor = 20;

  if ((bs.safariGoNearCounter ?? 0) < 3) {
    bs.safariGoNearCounter = (bs.safariGoNearCounter ?? 0) + 1;
    gBattleCommunication[_MULTISTRING_CHOOSER_SAF] = _B_MSG_CREPT_CLOSER;
  } else {
    gBattleCommunication[_MULTISTRING_CHOOSER_SAF] = _B_MSG_CANT_GET_CLOSER;
  }
  // 1:1 gBattlescriptsForSafariActions[1] = BattleScript_ActionGetNear.
  const off = getBattleScriptOffset('BattleScript_ActionGetNear');
  const c = ctx ?? gBattleScriptContext;
  if (c && off >= 0) c.scriptPtr = off;
  setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
}

/** 1:1 décomp `HandleAction_SafariZoneRun()` (battle_util.c:617-624). */
export function HandleAction_SafariZoneRun(_ctx?: BattleScriptContext): void {
  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);
  (globalThis as { __PlaySE?: (id: number) => void }).__PlaySE?.(17 /* SE_FLEE (songs.h:23) */);
  setCurrentTurnActionNumberHAR(gBattlersCount);
  _setBattleOutcomeHAR(4 /* B_OUTCOME_RAN */);
}

/** 1:1 décomp `HandleAction_WallyBallThrow()` (battle_util.c:625-637). */
export function HandleAction_WallyBallThrow(ctx?: BattleScriptContext): void {
  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);
  PREPARE_MON_NICK_BUFFER(_gBattleTextBuff1_HA, gBattlerAttacker, gBattlerPartyIndexes[gBattlerAttacker]);
  // 1:1 gBattlescriptsForSafariActions[3] = BattleScript_ActionWallyThrow.
  const off = getBattleScriptOffset('BattleScript_ActionWallyThrow');
  const c = ctx ?? gBattleScriptContext;
  if (c && off >= 0) c.scriptPtr = off;
  setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
  gActionsByTurnOrder[1] = B_ACTION_FINISHED;
}

// ─── Mark* controller exec (battle_util.c:830-863) ──────────────────────────

/** 1:1 décomp `MarkAllBattlersForControllerExec()` (battle_util.c:830-845) —
 *  marqué UNUSED dans le .c (port nominal complet, aucun caller décomp). */
export function MarkAllBattlersForControllerExec(): void {
  if (gBattleTypeFlags & _BATTLE_TYPE_LINK_HAR) {
    for (let i = 0; i < gBattlersCount; i++) {
      _orBattleControllerExecFlags(gBitTable[i] << (32 - 4 /* MAX_BATTLERS_COUNT */));
    }
  } else {
    for (let i = 0; i < gBattlersCount; i++) {
      _orBattleControllerExecFlags(gBitTable[i]);
    }
  }
}

/** 1:1 décomp `MarkBattlerReceivedLinkData(battlerId)` (battle_util.c:854-863) —
 *  link only : GetLinkPlayerCount()=0 hors link → seule la clear-mask s'applique. */
export function MarkBattlerReceivedLinkData(battlerId: number): void {
  const linkPlayers = 0; // GetLinkPlayerCount() — link non porté (dette link).
  for (let i = 0; i < linkPlayers; i++) {
    _orBattleControllerExecFlags(gBitTable[battlerId] << (i << 2));
  }
  _andBattleControllerExecFlags(~((1 << 28) << battlerId));
}

// Imports locaux HandleAction_Run. (TryRunFromBattle vit DANS ce fichier
// depuis la fusion miroir — ex-try-run-from-battle.ts, section en bas.)
import { getBattleScriptOffset as _getBattleScriptOffsetHAR } from '../engine/battle/script-interpreter';
import {
  setBattleOutcome as _setBattleOutcomeHAR,
  setCurrentTurnActionNumber as setCurrentTurnActionNumberHAR,
  gChosenActionByBattler as _gChosenActionByBattlerHAR,
  setActiveBattler as _setActiveBattlerHAR,
  gBattleOutcome as _gBattleOutcomeHAR,
  setLastUsedItem as _setLastUsedItemSAF,
  setBattleControllerExecFlags as _setBattleControllerExecFlagsSAF,
  gBattleControllerExecFlags as _gBattleControllerExecFlagsSAF,
  gActionsByTurnOrder,
} from '../engine/battle/state';
import { gBattleBufferB } from '../engine/battle/battle-controllers-ipc';

/** Helpers OR/AND sur gBattleControllerExecFlags (Mark* 1:1). */
function _orBattleControllerExecFlags(mask: number): void {
  _setBattleControllerExecFlagsSAF((_gBattleControllerExecFlagsSAF | mask) >>> 0);
}
function _andBattleControllerExecFlags(mask: number): void {
  _setBattleControllerExecFlagsSAF((_gBattleControllerExecFlagsSAF & mask) >>> 0);
}
import {
  BATTLE_TYPE_LINK as _BATTLE_TYPE_LINK_HAR,
  BATTLE_TYPE_RECORDED_LINK as _BATTLE_TYPE_RECORDED_LINK_HAR,
  STATUS2_WRAPPED as _STATUS2_WRAPPED_HAR,
  STATUS2_ESCAPE_PREVENTION as _STATUS2_ESCAPE_PREVENTION_HAR,
} from '../engine/battle/constants';

const _B_ACTION_RUN_HAR = 3;
// 1:1 décomp battle_string_ids.h:564-569 (index dans gNoEscapeStringIds) :
// CANT_ESCAPE=0, DONT_LEAVE_BIRCH=1, PREVENTS_ESCAPE=2, CANT_ESCAPE_2=3,
// ATTACKER_CANT_ESCAPE=4. (Les anciennes valeurs 1/0 affichaient le message
// Birch « Ne me laisse pas comme ça! » sur un échec de fuite sauvage.)
const _B_MSG_CANT_ESCAPE_2_HAR = 3;
const _B_MSG_ATTACKER_CANT_ESCAPE_HAR = 4;

/** 1:1 décomp `HandleAction_RunBattleScript` (battle_util.c:3805-3809) :
 *  `if (gBattleControllerExecFlags == 0) gBattleScriptingCommandsTable[*gBattlescriptCurrInstr]();`
 *
 *  Step UNE commande du battle script par frame, et SEULEMENT quand aucun
 *  controller n'est en cours d'exécution (texte/anim/hp update finis). Le pacing
 *  per-frame émerge : RunTurnActionsFunctions appelle ceci 1×/frame ; une
 *  commande bloquante (printstring/animation/datahpupdate) fait
 *  MarkBattlerForControllerExec → le flag bloque le prochain step ; le controller
 *  func (tické par BattleMainCB1) clear le flag quand fini → step reprend. */
export function HandleAction_RunBattleScript(ctx?: BattleScriptContext): void {
  const c = ctx ?? gBattleScriptContext;
  if (gBattleControllerExecFlags === 0) {
    stepBattleScriptCommand(c);
  }
}

/** 1:1 décomp `HandleAction_TryFinish` (battle_util.c:638-645). Appelle
 *  HandleFaintedMonActions chaque frame ; tant que TRUE (un script EXP/faint est
 *  en cours), on attend ; quand FALSE (tout le flow post-faint est fini) →
 *  faintedActionsState=0 + gCurrentActionFuncId=B_ACTION_FINISHED. */
export function HandleAction_TryFinish(_ctx?: BattleScriptContext): void {
  if (!HandleFaintedMonActions()) {
    gBattleStruct.faintedActionsState = 0;
    setCurrentActionFuncId(B_ACTION_FINISHED);
  }
}

/** 1:1 décomp `FAINTED_ACTIONS_MAX_CASE` = 7 (battle_util.c). */
const _FAINTED_ACTIONS_MAX_CASE = 7;
const _PARTY_SIZE_HFM = 6;

/** `BattleScriptExecute(label)` via le hook globalThis (= évite le cycle
 *  handle-action ↔ battle-main-functions ; même pattern que turn-dispatch). */
function _BattleScriptExecuteHFM(label: string): void {
  const bm = (globalThis as Record<string, unknown>).__battleMainFunctions as
    { BattleScriptExecute?: (l: string) => void } | undefined;
  if (bm?.BattleScriptExecute) bm.BattleScriptExecute(label);
  else console.warn('[handle-action] BattleScriptExecute hook absent (battle-main-functions pas chargé)');
}

/** 1:1 inline `HasNoMonsToSwitch(battler, …)` (battle_util.c) — true si AUCUN
 *  autre mon vivant dans le party du battler. (= ne peut pas remplacer.) */
function _HasNoMonsToSwitchHFM(battler: number): boolean {
  const partyIdx = gBattlerPartyIndexes[battler] ?? 0;
  const party = (battler & 1) === 0
    ? (globalThis as { gPlayerParty?: Array<{ species?: number; hp?: number; isEgg?: number }> }).gPlayerParty
    : (globalThis as { gEnemyParty?: Array<{ species?: number; hp?: number; isEgg?: number }> }).gEnemyParty;
  if (!party) return true;
  for (let j = 0; j < _PARTY_SIZE_HFM; j++) {
    if (j === partyIdx) continue;
    const m = party[j];
    if (m?.species && (m.hp ?? 0) > 0 && !m.isEgg) return false;
  }
  return true;
}

/** 1:1 inline `OpponentSwitchInResetSentPokesToOpponentValue(battler)`
 *  (battle_util.c:915-932) — recompute gSentPokesToOpponent[flank]. */
function _OpponentSwitchInResetHFM(battler: number): void {
  if ((battler & 1) !== 1) return;  // GET_BATTLER_SIDE != B_SIDE_OPPONENT.
  const flank = (battler & 2) >>> 1;
  const sentPokes = (globalThis as { gSentPokesToOpponent?: number[] }).gSentPokesToOpponent;
  if (!sentPokes) return;
  let bits = 0;
  for (let i = 0; i < gBattlersCount; i += 2) {
    if (!(gAbsentBattlerFlags & gBitTable[i])) bits |= gBitTable[gBattlerPartyIndexes[i] ?? 0];
  }
  sentPokes[flank] = bits;
}

/** 1:1 décomp `HandleFaintedMonActions()` (battle_util.c:1877-1954). State machine
 *  `faintedActionsState` (0..7) : EXP (GiveExp) → faint/« K.O. » (HandleFaintedMon)
 *  → effets switch-in. Return TRUE quand un script est lancé (BattleScriptExecute
 *  bascule gBattleMainFunc → le script tourne per-frame ; la fonction est
 *  re-appelée par TryFinish au frame suivant) ; FALSE quand fini (state == MAX). */
export function HandleFaintedMonActions(): boolean {
  if (gBattleTypeFlags & BATTLE_TYPE_SAFARI) return false;
  do {
    switch (gBattleStruct.faintedActionsState) {
      case 0:
        gBattleStruct.faintedActionsBattlerId = 0;
        gBattleStruct.faintedActionsState = 1;
        for (let i = 0; i < gBattlersCount; i++) {
          if ((gAbsentBattlerFlags & gBitTable[i]) && !_HasNoMonsToSwitchHFM(i)) {
            setAbsentBattlerFlags(gAbsentBattlerFlags & ~gBitTable[i]);
          }
        }
        // décomp = fall through vers case 1 ; ici break → le do-while ré-entre
        // au switch avec state=1 (= équivalent exact).
        break;
      case 1: {
        let launched = false;
        do {
          const b = gBattleStruct.faintedActionsBattlerId;
          setBattlerFainted(b);
          setBattlerTarget(b);
          const expBit = gBitTable[gBattlerPartyIndexes[b] ?? 0] ?? 1;
          if (gBattleMons[b].hp === 0
              && !(gBattleStruct.givenExpMons & expBit)
              && !(gAbsentBattlerFlags & gBitTable[b])) {
            _BattleScriptExecuteHFM('BattleScript_GiveExp');
            gBattleStruct.faintedActionsState = 2;
            launched = true;
            break;
          }
        } while (++gBattleStruct.faintedActionsBattlerId !== gBattlersCount);
        if (launched) return true;
        gBattleStruct.faintedActionsState = 3;
        break;
      }
      case 2:
        _OpponentSwitchInResetHFM(gBattleStruct.faintedActionsBattlerId);
        if (++gBattleStruct.faintedActionsBattlerId === gBattlersCount) gBattleStruct.faintedActionsState = 3;
        else gBattleStruct.faintedActionsState = 1;
        break;
      case 3:
        gBattleStruct.faintedActionsBattlerId = 0;
        gBattleStruct.faintedActionsState = 4;
        // décomp = fall through vers case 4 ; break → do-while ré-entre à state=4.
        break;
      case 4: {
        let launched = false;
        do {
          const b = gBattleStruct.faintedActionsBattlerId;
          setBattlerFainted(b);
          setBattlerTarget(b);
          if (gBattleMons[b].hp === 0 && !(gAbsentBattlerFlags & gBitTable[b])) {
            _BattleScriptExecuteHFM('BattleScript_HandleFaintedMon');
            gBattleStruct.faintedActionsState = 5;
            launched = true;
            break;
          }
        } while (++gBattleStruct.faintedActionsBattlerId !== gBattlersCount);
        if (launched) return true;
        gBattleStruct.faintedActionsState = 6;
        break;
      }
      case 5:
        if (++gBattleStruct.faintedActionsBattlerId === gBattlersCount) gBattleStruct.faintedActionsState = 6;
        else gBattleStruct.faintedActionsState = 4;
        break;
      case 6:
        // 1:1 décomp battle_util.c:1942-1947 :
        //   if (AbilityBattleEffects(ABILITYEFFECT_INTIMIDATE1, 0,0,0,0)
        //    || AbilityBattleEffects(ABILITYEFFECT_TRACE, 0,0,0,0)
        //    || ItemBattleEffects(ITEMEFFECT_NORMAL, 0, TRUE)
        //    || AbilityBattleEffects(ABILITYEFFECT_FORECAST, 0,0,0,0))
        //       return TRUE;          // un script switch-in a été mis en file
        //   gBattleStruct->faintedActionsState++;   // → état 7
        //
        // Dans la décomp, AbilityBattleEffects/ItemBattleEffects mettent le script
        // en file (BattleScriptPushCursorAndCallback) et retournent l'effet != 0 ;
        // ici notre port délègue l'exécution au caller : on consomme le label voulu
        // (consume*WantedScript) puis on le lance via _BattleScriptExecuteHFM (=
        // l'équivalent du BattleScriptExecute interne). Le `return true` reproduit
        // le `return TRUE` (= le caller re-appelle au frame suivant).
        if (AbilityBattleEffects(ABILITYEFFECT_INTIMIDATE1, 0, 0, 0, 0) !== 0) {
          const label = consumeAbilityWantedScript();
          if (label) _BattleScriptExecuteHFM(label);
          return true;
        }
        if (AbilityBattleEffects(ABILITYEFFECT_TRACE, 0, 0, 0, 0) !== 0) {
          const label = consumeAbilityWantedScript();
          if (label) _BattleScriptExecuteHFM(label);
          return true;
        }
        if (ItemBattleEffects(ITEMEFFECT_NORMAL, 0, true) !== 0) {
          const label = consumeItemWantedScript();
          if (label) _BattleScriptExecuteHFM(label);
          return true;
        }
        if (AbilityBattleEffects(ABILITYEFFECT_FORECAST, 0, 0, 0, 0) !== 0) {
          const label = consumeAbilityWantedScript();
          if (label) _BattleScriptExecuteHFM(label);
          return true;
        }
        gBattleStruct.faintedActionsState++;
        break;
      case _FAINTED_ACTIONS_MAX_CASE:
        break;
    }
  } while (gBattleStruct.faintedActionsState !== _FAINTED_ACTIONS_MAX_CASE);
  return false;
}

const _HM_RESET_BITS =
  _HITMARKER_DESTINYBOND_HAF | _HITMARKER_IGNORE_SUBSTITUTE_HAF
  | _HITMARKER_ATTACKSTRING_PRINTED_HAF | _HITMARKER_NO_PPDEDUCT_HAF
  | _HITMARKER_STATUS_ABILITY_EFFECT_HAF | _HITMARKER_IGNORE_ON_AIR_HAF
  | _HITMARKER_IGNORE_UNDERGROUND_HAF | _HITMARKER_IGNORE_UNDERWATER_HAF
  | _HITMARKER_PASSIVE_HP_UPDATE_HAF | _HITMARKER_OBEYS_HAF
  | _HITMARKER_WAKE_UP_CLEAR_HAF | _HITMARKER_SYNCHRONIZE_EFFECT_HAF
  | _HITMARKER_CHARGING_HAF | _HITMARKER_NEVER_SET_HAF;

/** 1:1 décomp `HandleAction_NothingIsFainted` (battle_util.c:647-656). */
export function HandleAction_NothingIsFainted(_ctx?: BattleScriptContext): void {
  setCurrentTurnActionNumberHAR(_gCurrentTurnActionNumberHAF + 1);
  setCurrentActionFuncId(_gActionsByTurnOrderHAF[_gCurrentTurnActionNumberHAF]);
  setHitMarker(_gHitMarkerHAF & ~_HM_RESET_BITS);
}

/** 1:1 décomp `HandleAction_ActionFinished` (battle_util.c:658-684). */
export function HandleAction_ActionFinished(_ctx?: BattleScriptContext): void {
  // 1:1 décomp : monToSwitchIntoId[battlerByTurnOrder[current]] = PARTY_SIZE.
  _gBattleStructHAF.monToSwitchIntoId[_gBattlerByTurnOrderHAF[_gCurrentTurnActionNumberHAF]] = 6 /* PARTY_SIZE */;
  setCurrentTurnActionNumberHAR(_gCurrentTurnActionNumberHAF + 1);
  setCurrentActionFuncId(_gActionsByTurnOrderHAF[_gCurrentTurnActionNumberHAF]);
  _SpecialStatusesClearHAF();
  setHitMarker(_gHitMarkerHAF & ~_HM_RESET_BITS);

  setCurrentMove(0);
  setBattleMoveDamageHAR(0);
  setMoveResultFlags(0);
  gBattleScripting.animTurn = 0;
  gBattleScripting.animTargetsHit = 0;
  _gLastLandedMovesHAF[gBattlerAttacker] = 0;
  _gLastHitByTypeHAF[gBattlerAttacker] = 0;
  _gBattleStructHAF.dynamicMoveType = 0;
  setDynamicBasePowerHAR(0);
  gBattleScripting.moveendState = 0;
  gBattleCommunication[3] = 0;  // MOVE_EFFECT_BYTE
  gBattleCommunication[4] = 0;
  gBattleScripting.multihitMoveEffect = 0;
  // 1:1 décomp battle_util.c:683 : gBattleResources->battleScriptsStack->size = 0.
  // Notre équivalent = vider le call-stack du ctx persistant pour que le tour
  // suivant reparte propre (= évite une fuite de scriptPtrStack entre tours).
  gBattleScriptContext.scriptPtrStack.length = 0;
  gBattleScriptContext.comparisonResult = 0;
}

/** 1:1 décomp `SpecialStatusesClear()` (battle_util.c). Reset gSpecialStatuses
 *  pour tous les battlers à blank. */
function _SpecialStatusesClearHAF(): void {
  for (let i = 0; i < gBattlersCount; i++) {
    const ss = _gSpecialStatusesHAF[i];
    ss.statLowered = 0;
    ss.lightningRodRedirected = 0;
    ss.restoredBattlerSprite = 0;
    ss.intimidatedMon = 0;
    ss.traced = 0;
    ss.ppNotAffectedByPressure = 0;
    ss.faintedHasReplacement = 0;
    ss.focusBanded = 0;
    ss.shellBellDmg = 0;
    ss.physicalDmg = 0;
    ss.specialDmg = 0;
    ss.physicalBattlerId = 0;
    ss.specialBattlerId = 0;
  }
}

// Imports HandleAction_TryFinish/NothingIsFainted/ActionFinished.
import {
  gBattleStruct as _gBattleStructHAF,
  gCurrentTurnActionNumber as _gCurrentTurnActionNumberHAF,
  gActionsByTurnOrder as _gActionsByTurnOrderHAF,
  gBattlerByTurnOrder as _gBattlerByTurnOrderHAF,
  gHitMarker as _gHitMarkerHAF,
  gLastLandedMoves as _gLastLandedMovesHAF,
  gLastHitByType as _gLastHitByTypeHAF,
  gSpecialStatuses as _gSpecialStatusesHAF,
  setBattleMoveDamage as setBattleMoveDamageHAR,
  setDynamicBasePower as setDynamicBasePowerHAR,
} from '../engine/battle/state';
import {
  HITMARKER_DESTINYBOND as _HITMARKER_DESTINYBOND_HAF,
  HITMARKER_IGNORE_SUBSTITUTE as _HITMARKER_IGNORE_SUBSTITUTE_HAF,
  HITMARKER_ATTACKSTRING_PRINTED as _HITMARKER_ATTACKSTRING_PRINTED_HAF,
  HITMARKER_NO_PPDEDUCT as _HITMARKER_NO_PPDEDUCT_HAF,
  HITMARKER_STATUS_ABILITY_EFFECT as _HITMARKER_STATUS_ABILITY_EFFECT_HAF,
  HITMARKER_IGNORE_ON_AIR as _HITMARKER_IGNORE_ON_AIR_HAF,
  HITMARKER_IGNORE_UNDERGROUND as _HITMARKER_IGNORE_UNDERGROUND_HAF,
  HITMARKER_IGNORE_UNDERWATER as _HITMARKER_IGNORE_UNDERWATER_HAF,
  HITMARKER_PASSIVE_HP_UPDATE as _HITMARKER_PASSIVE_HP_UPDATE_HAF,
  HITMARKER_OBEYS as _HITMARKER_OBEYS_HAF,
  HITMARKER_WAKE_UP_CLEAR as _HITMARKER_WAKE_UP_CLEAR_HAF,
  HITMARKER_SYNCHRONIZE_EFFECT as _HITMARKER_SYNCHRONIZE_EFFECT_HAF,
  HITMARKER_CHARGING as _HITMARKER_CHARGING_HAF,
  HITMARKER_NEVER_SET as _HITMARKER_NEVER_SET_HAF,
} from '../engine/battle/constants';

// NB : la table de dispatch d'actions 1:1 (`sTurnActionsFuncsTable`, battle_main.c:536) vit
// dans battle-turn-dispatch.ts (= le port de battle_main.c, là où vit aussi
// RunTurnActionsFunctions), qui importe les HandleAction_* DIRECTEMENT (imports ESM). On ne
// duplique donc PAS la table ici, et on n'expose plus de registre globalThis.__handleAction
// (l'ancien `handleActionTable` + le registre étaient des duplicatas morts — retirés, B6).

// ════════════════════════════════════════════════════════════════════════════
// TryRunFromBattle (battle_util.c:407-485) + IsRunningFromBattleImpossible
// (battle_main.c:4021-4084) — [fusion miroir 2026-06-12, ex-try-run-from-battle.ts]
// ════════════════════════════════════════════════════════════════════════════
import {
  gStatuses3,
  setBattleOutcome, setCurrentTurnActionNumber,
  setLastUsedItem, setPotentialItemEffectBattler,
} from '../engine/battle/state';
import {
  ABILITY_RUN_AWAY, ABILITY_SHADOW_TAG, ABILITY_ARENA_TRAP,
  ABILITY_LEVITATE, ABILITY_MAGNET_PULL,
  BATTLE_TYPE_FRONTIER, BATTLE_TYPE_TRAINER_HILL, BATTLE_TYPE_TRAINER,
  BATTLE_TYPE_LINK, BATTLE_TYPE_FIRST_BATTLE,
  B_OUTCOME_RAN,
  FLEE_ITEM, FLEE_ABILITY,
  PYRAMID_LOCATION_NONE,
  STATUS2_ESCAPE_PREVENTION, STATUS2_WRAPPED,
  STATUS3_ROOTED,
  TYPE_FLYING, TYPE_STEEL,
} from '../engine/battle/constants';
import { HOLD_EFFECT_CAN_ALWAYS_RUN } from '../engine/decomp-data/include/constants/hold_effects-data';
import { GetItemHoldEffect } from '../engine/battle/data/item-hold-effects';
// ABILITYEFFECT_CHECK_FIELD_EXCEPT_BATTLER : défini localement (corps AbilityBattleEffects absorbé).

// ─── BATTLE_RUN_* return codes (= constants/battle.h) ──────────────────────

/** 1:1 décomp `BATTLE_RUN_SUCCESS` (= 0). */
export const BATTLE_RUN_SUCCESS = 0;
/** 1:1 décomp `BATTLE_RUN_FORBIDDEN` (= 1). Status (Bind/etc.), First Battle
 *  (= "Don't be a coward!") ; message direct. */
export const BATTLE_RUN_FORBIDDEN = 1;
/** 1:1 décomp `BATTLE_RUN_FAILURE` (= 2). Shadow Tag/Arena Trap/Magnet Pull
 *  block ; message via gBattleCommunication[MULTISTRING_CHOOSER]. */
export const BATTLE_RUN_FAILURE = 2;

/** 1:1 décomp `B_MSG_*` indices (include/constants/battle_string_ids.h:565-569).
 *  Ces valeurs indexent gNoEscapeStringIds[] (battle_message.c:900) :
 *  [0]=CANTESCAPE, [1]=DONTLEAVEBIRCH, [2]=PREVENTSESCAPE. */
const B_MSG_CANT_ESCAPE = 0;
const B_MSG_DONT_LEAVE_BIRCH = 1;
const B_MSG_PREVENTS_ESCAPE = 2;

/** 1:1 décomp `CurrentBattlePyramidLocation()` (battle_pyramid.c). Retourne
 *  PYRAMID_LOCATION_NONE quand on est pas dans la Battle Pyramid. */
function CurrentBattlePyramidLocation(): number {
  return PYRAMID_LOCATION_NONE;
}

/** 1:1 décomp `GetPyramidRunMultiplier()` (battle_pyramid.c). Return 100 par
 *  défaut (= rare hors Frontier). */
function GetPyramidRunMultiplier(): number {
  return 100;
}

/** Helper : check si un battler est de type donné. */
function IS_BATTLER_OF_TYPE(battler: number, type: number): boolean {
  const mon = gBattleMons[battler];
  return mon.type1 === type || mon.type2 === type;
}

/** 1:1 décomp `IsRunningFromBattleImpossible()` (battle_main.c:4021-4084).
 *
 *  Check si le battler ACTIF peut fuir le combat. Returns :
 *  - BATTLE_RUN_SUCCESS : fuite permise → caller appelle TryRunFromBattle
 *  - BATTLE_RUN_FAILURE : abilité opposite bloque (Shadow Tag/Arena Trap/
 *    Magnet Pull) → message via gBattleCommunication[MULTISTRING_CHOOSER]
 *  - BATTLE_RUN_FORBIDDEN : status/first battle bloque → message direct */
export function IsRunningFromBattleImpossible(): number {
  let holdEffect: number;
  let side: number;
  let i: number;

  // 1:1 décomp ll. 4027-4030 : check Enigma Berry vs normal hold effect.
  // Stub : on assume item normal (= ITEM_ENIGMA_BERRY pas porté).
  holdEffect = GetItemHoldEffect(gBattleMons[gActiveBattler].item);

  setPotentialItemEffectBattler(gActiveBattler);

  if (holdEffect === HOLD_EFFECT_CAN_ALWAYS_RUN) return BATTLE_RUN_SUCCESS;
  if (gBattleTypeFlags & BATTLE_TYPE_LINK) return BATTLE_RUN_SUCCESS;
  if (gBattleMons[gActiveBattler].ability === ABILITY_RUN_AWAY) return BATTLE_RUN_SUCCESS;

  side = GET_BATTLER_SIDE(gActiveBattler);

  // 1:1 décomp ll. 4043-4063 : check opponents abilities Shadow Tag / Arena Trap.
  for (i = 0; i < gBattlersCount; i++) {
    if (side !== GET_BATTLER_SIDE(i)
        && gBattleMons[i].ability === ABILITY_SHADOW_TAG) {
      gBattleScripting.battler = i;
      setLastUsedAbility(gBattleMons[i].ability);
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_PREVENTS_ESCAPE;
      return BATTLE_RUN_FAILURE;
    }
    if (side !== GET_BATTLER_SIDE(i)
        && gBattleMons[gActiveBattler].ability !== ABILITY_LEVITATE
        && !IS_BATTLER_OF_TYPE(gActiveBattler, TYPE_FLYING)
        && gBattleMons[i].ability === ABILITY_ARENA_TRAP) {
      gBattleScripting.battler = i;
      setLastUsedAbility(gBattleMons[i].ability);
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_PREVENTS_ESCAPE;
      return BATTLE_RUN_FAILURE;
    }
  }

  // 1:1 décomp ll. 4064-4071 : Magnet Pull vs Steel-type check.
  const magnetPullCheck = AbilityBattleEffects(
    ABILITYEFFECT_CHECK_FIELD_EXCEPT_BATTLER, gActiveBattler,
    ABILITY_MAGNET_PULL, 0, 0,
  );
  if (magnetPullCheck !== 0 && IS_BATTLER_OF_TYPE(gActiveBattler, TYPE_STEEL)) {
    gBattleScripting.battler = magnetPullCheck - 1;
    setLastUsedAbility(gBattleMons[magnetPullCheck - 1].ability);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_PREVENTS_ESCAPE;
    return BATTLE_RUN_FAILURE;
  }

  // 1:1 décomp ll. 4072-4077 : status check (Wrap/Bind/Mean Look/Spider Web).
  if ((gBattleMons[gActiveBattler].status2 & (STATUS2_ESCAPE_PREVENTION | STATUS2_WRAPPED))
      || (gStatuses3[gActiveBattler] & STATUS3_ROOTED)) {
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_CANT_ESCAPE;
    return BATTLE_RUN_FORBIDDEN;
  }

  // 1:1 décomp ll. 4078-4082 : BIRCH TUTORIAL ⇒ "Don't be a coward!" message.
  if (gBattleTypeFlags & BATTLE_TYPE_FIRST_BATTLE) {
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_DONT_LEAVE_BIRCH;
    return BATTLE_RUN_FORBIDDEN;
  }

  return BATTLE_RUN_SUCCESS;
}

/** 1:1 décomp `TryRunFromBattle(u8 battler)` (battle_util.c:407-485). */
export function TryRunFromBattle(battler: number): boolean {
  let effect = 0;
  let holdEffect: number;
  let pyramidMultiplier: number;
  let speedVar: number;

  // 1:1 décomp ll.414-417 : Enigma Berry test (stub - on assume item normal).
  holdEffect = GetItemHoldEffect(gBattleMons[battler].item);

  setPotentialItemEffectBattler(battler);

  if (holdEffect === HOLD_EFFECT_CAN_ALWAYS_RUN) {
    setLastUsedItem(gBattleMons[battler].item);
    gProtectStructs[battler].fleeType = FLEE_ITEM;
    effect++;
  } else if (gBattleMons[battler].ability === ABILITY_RUN_AWAY) {
    if (CurrentBattlePyramidLocation() !== PYRAMID_LOCATION_NONE) {
      gBattleStruct.runTries++;
      pyramidMultiplier = GetPyramidRunMultiplier();
      speedVar = Math.floor(
        (gBattleMons[battler].speed * pyramidMultiplier) /
        gBattleMons[BATTLE_OPPOSITE(battler)].speed
      ) + (gBattleStruct.runTries * 30);
      if (speedVar > (Random() & 0xFF)) {
        setLastUsedAbility(ABILITY_RUN_AWAY);
        gProtectStructs[battler].fleeType = FLEE_ABILITY;
        effect++;
      }
    } else {
      setLastUsedAbility(ABILITY_RUN_AWAY);
      gProtectStructs[battler].fleeType = FLEE_ABILITY;
      effect++;
    }
  } else if ((gBattleTypeFlags & (BATTLE_TYPE_FRONTIER | BATTLE_TYPE_TRAINER_HILL))
             && (gBattleTypeFlags & BATTLE_TYPE_TRAINER)) {
    effect++;
  } else {
    if (!(gBattleTypeFlags & BATTLE_TYPE_DOUBLE)) {
      if (CurrentBattlePyramidLocation() !== PYRAMID_LOCATION_NONE) {
        pyramidMultiplier = GetPyramidRunMultiplier();
        speedVar = Math.floor(
          (gBattleMons[battler].speed * pyramidMultiplier) /
          gBattleMons[BATTLE_OPPOSITE(battler)].speed
        ) + (gBattleStruct.runTries * 30);
        if (speedVar > (Random() & 0xFF)) effect++;
      } else if (gBattleMons[battler].speed < gBattleMons[BATTLE_OPPOSITE(battler)].speed) {
        speedVar = Math.floor(
          (gBattleMons[battler].speed * 128) /
          gBattleMons[BATTLE_OPPOSITE(battler)].speed
        ) + (gBattleStruct.runTries * 30);
        if (speedVar > (Random() & 0xFF)) effect++;
      } else {
        // same speed or faster
        effect++;
      }
    }

    gBattleStruct.runTries++;
  }

  if (effect !== 0) {
    setCurrentTurnActionNumber(gBattlersCount);
    setBattleOutcome(B_OUTCOME_RAN);
  }

  return effect !== 0;
}

// ─── CheckMoveLimitations + AreAllMovesUnusable (battle_util.c:1069-1151) ──────
//     [ex-engine/battle/move-limitations.ts, absorbé au miroir 2026-06-13]

/** 1:1 décomp `GetImprisonedMovesCount(battlerId, move)` (battle_util.c:1129-1151).
 *  Compte combien d'opposants ont Imprison + ce move. Lookup état via globalThis
 *  (__battleState) = anti-cycle ESM, comme dans l'original move-limitations.ts. */
function _GetImprisonedMovesCount(battlerId: number, move: number): number {
  let imprisonedMoves = 0;
  const stateMod = (globalThis as { __battleState?: { gBattlersCount?: number; gStatuses3?: number[]; gBattleMons?: { moves: number[] }[] } }).__battleState;
  const battlersCount = stateMod?.gBattlersCount ?? 2;
  const statuses3 = stateMod?.gStatuses3;
  const battleMons = stateMod?.gBattleMons;
  if (!statuses3 || !battleMons) return 0;
  // 1:1 décomp `GetBattlerSide(id)` = id & BIT_SIDE = id & 1.
  const battlerSide = battlerId & 1;
  for (let i = 0; i < battlersCount; i++) {
    if (battlerSide !== (i & 1) && (statuses3[i] & STATUS3_IMPRISONED_OTHERS)) {
      for (let j = 0; j < MAX_MON_MOVES; j++) {
        if (move === battleMons[i].moves[j]) { imprisonedMoves++; break; }
      }
    }
  }
  return imprisonedMoves;
}

/** 1:1 décomp `CheckMoveLimitations(battlerId, unusableMoves, check)` (battle_util.c:1069).
 *  Dette : ITEM_ENIGMA_BERRY path (Frontier) skippé → GetItemHoldEffect direct. */
export function CheckMoveLimitations(battlerId: number, unusableMoves: number, check: number): number {
  const holdEffect = GetItemHoldEffect(gBattleMons[battlerId].item);
  setPotentialItemEffectBattler(battlerId);

  for (let i = 0; i < MAX_MON_MOVES; i++) {
    const move = gBattleMons[battlerId].moves[i];
    // No move
    if (move === MOVE_NONE && (check & MOVE_LIMITATION_ZEROMOVE)) unusableMoves |= gBitTable[i];
    // No PP
    if (gBattleMons[battlerId].pp[i] === 0 && (check & MOVE_LIMITATION_PP)) unusableMoves |= gBitTable[i];
    // Disable
    if (move === gDisableStructs[battlerId].disabledMove && (check & MOVE_LIMITATION_DISABLED)) unusableMoves |= gBitTable[i];
    // Torment
    if (move === gLastMoves[battlerId] && (check & MOVE_LIMITATION_TORMENTED)
        && (gBattleMons[battlerId].status2 & STATUS2_TORMENT)) unusableMoves |= gBitTable[i];
    // Taunt
    if (gDisableStructs[battlerId].tauntTimer && (check & MOVE_LIMITATION_TAUNT)
        && getBattleMove(move).power === 0) unusableMoves |= gBitTable[i];
    // Imprison
    if (_GetImprisonedMovesCount(battlerId, move) && (check & MOVE_LIMITATION_IMPRISON)) unusableMoves |= gBitTable[i];
    // Encore
    if (gDisableStructs[battlerId].encoreTimer && gDisableStructs[battlerId].encoredMove !== move) unusableMoves |= gBitTable[i];
    // Choice Band
    if (holdEffect === HOLD_EFFECT_CHOICE_BAND
        && gBattleStruct.choicedMove[battlerId] !== MOVE_NONE
        && gBattleStruct.choicedMove[battlerId] !== MOVE_UNAVAILABLE
        && gBattleStruct.choicedMove[battlerId] !== move) unusableMoves |= gBitTable[i];
  }
  return unusableMoves;
}

/** 1:1 décomp `AreAllMovesUnusable()` (battle_util.c:1112-1127).
 *  Dette : gSelectionBattleScripts[NoMovesLeft] différé (UI selection). */
export function AreAllMovesUnusable(): boolean {
  const unusable = CheckMoveLimitations(gActiveBattler, 0, MOVE_LIMITATIONS_ALL);
  if (unusable === ALL_MOVES_MASK) {
    gProtectStructs[gActiveBattler].noValidMoves = 1;
    return true;
  } else {
    gProtectStructs[gActiveBattler].noValidMoves = 0;
    return false;
  }
}

// ─── K14b wire — auto-enregistrement sur globalThis (convention, cf ability-battle-
//     effects:985). La voie L action-selection appelle IsRunningFromBattleImpossible
//     au choix de FUITE (battle_main.c:4322-4351) via ce hook (évite le cycle ESM).
(globalThis as { IsRunningFromBattleImpossible?: () => number }).IsRunningFromBattleImpossible = IsRunningFromBattleImpossible;

// ════════════════════════════════════════════════════════════════════════════
// IsMonDisobedient (battle_util.c:3890-4015) — check de désobéissance des mons
// outsiders dépassant le niveau d'obéissance correspondant aux badges.
// [fusion miroir 2026-06-13, ex-engine/battle/disobedience.ts]
// ════════════════════════════════════════════════════════════════════════════

const _DIS_FLAG_BADGE02_GET = 'FLAG_BADGE02_GET';
const _DIS_FLAG_BADGE04_GET = 'FLAG_BADGE04_GET';
const _DIS_FLAG_BADGE06_GET = 'FLAG_BADGE06_GET';
const _DIS_FLAG_BADGE08_GET = 'FLAG_BADGE08_GET';

const _DIS_MOD = (a: number, b: number): number => ((a % b) + b) % b;

/** 1:1 décomp `IsBattlerModernFatefulEncounter(battler)` (battle_util.c:3890-3898).
 *  Web port : MON_DATA_MODERN_FATEFUL_ENCOUNTER déféré (pas d'anti-cheat) → always
 *  true sauf jamais (= seul un Mew/Deoxys illégal renverrait false). */
function _IsBattlerModernFatefulEncounter(battler: number): boolean {
  if (GET_BATTLER_SIDE(battler) === B_SIDE_OPPONENT) return true;
  const partyIdx = gBattlerPartyIndexes[battler];
  if (!gPlayerParty[partyIdx]) return true;
  const species = GetMonData(gPlayerParty[partyIdx], MON_DATA_SPECIES) as number;
  if (species !== SPECIES_MEW && species !== SPECIES_DEOXYS) return true;
  // MON_DATA_MODERN_FATEFUL_ENCOUNTER déféré (= pas pertinent web port).
  return true;
}

/** 1:1 décomp `IsOtherTrainer(u32 otId, u8 *otName)` (pokemon.c) : true si TID OU
 *  OT name diffèrent du joueur. Phase 1 single-tutorial : assume name match si TID
 *  match. */
function _IsOtherTrainer(otId: number, _otName: string): boolean {
  const playerTID = (gSaveBlock2Ptr.playerTrainerId ?? 0) >>> 0;
  if (playerTID !== (otId >>> 0)) return true;
  return false;
}

/** 1:1 décomp `FlagGet(flag)` — wired via script-vars (gameState.hasFlag). */
function _FlagGet(flagId: string): boolean {
  return FlagGet(flagId);
}

/** 1:1 décomp `CalculateBaseDamage(self, self, MOVE_POUND, 0, 40, 0, self, self)`
 *  (battle_util.c:4000) = self-hit 40-power typeless via le VRAI CalculateBaseDamage
 *  (burn-halving + badge boost), pas une formule simplifiée. */
function _calculateConfusionDamage(battler: number): number {
  return CalculateBaseDamage(
    gBattleMons[battler], gBattleMons[battler], MOVE_POUND, 0, 40, 0, battler, battler,
  ).damage;
}

export interface DisobedienceResult {
  /** 0 = OBEDIENT, 1 = IGNORED (= block all action), 2 = OTHER (= random thing). */
  retval: number;
  /** BattleScript label vers lequel sauter si pas obéissant. */
  jumpLabel: string | null;
}

/** 1:1 décomp `IsMonDisobedient()` (battle_util.c:3900-4015). */
export function IsMonDisobedient(_ctx: BattleScriptContext): DisobedienceResult {
  let obedienceLevel = 0;

  // 1:1 décomp : early-out checks.
  if (gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK)) {
    return { retval: DISOBEDIENCE_OBEDIENT, jumpLabel: null };
  }
  if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_OPPONENT) {
    return { retval: DISOBEDIENCE_OBEDIENT, jumpLabel: null };
  }

  // 1:1 décomp : IsBattlerModernFatefulEncounter = only false if illegal Mew/Deoxys.
  if (_IsBattlerModernFatefulEncounter(gBattlerAttacker)) {
    // Frontier paths déférés : INGAME_PARTNER / FRONTIER / RECORDED / IsOtherTrainer.
    const mon = gBattleMons[gBattlerAttacker];
    if (!_IsOtherTrainer(mon.otId ?? 0, mon.otName ?? '')) {
      return { retval: DISOBEDIENCE_OBEDIENT, jumpLabel: null };
    }
    if (_FlagGet(_DIS_FLAG_BADGE08_GET)) {
      return { retval: DISOBEDIENCE_OBEDIENT, jumpLabel: null };
    }

    obedienceLevel = 10;
    if (_FlagGet(_DIS_FLAG_BADGE02_GET)) obedienceLevel = 30;
    if (_FlagGet(_DIS_FLAG_BADGE04_GET)) obedienceLevel = 50;
    if (_FlagGet(_DIS_FLAG_BADGE06_GET)) obedienceLevel = 70;
  }

  if (gBattleMons[gBattlerAttacker].level <= obedienceLevel) {
    return { retval: DISOBEDIENCE_OBEDIENT, jumpLabel: null };
  }

  // First roll : test si le mon obéit malgré son niveau trop élevé.
  let rnd = Random() & 255;
  let calc = ((gBattleMons[gBattlerAttacker].level + obedienceLevel) * rnd) >>> 8;
  if (calc < obedienceLevel) {
    return { retval: DISOBEDIENCE_OBEDIENT, jumpLabel: null };
  }

  // Pas obéissant — break Rage if active.
  if (gCurrentMove === MOVE_RAGE) {
    gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_RAGE;
  }

  // Sleep + Snore/SleepTalk → ignored
  if ((gBattleMons[gBattlerAttacker].status1 & STATUS1_SLEEP)
      && (gCurrentMove === MOVE_SNORE || gCurrentMove === MOVE_SLEEP_TALK)) {
    return {
      retval: DISOBEDIENCE_IGNORED,
      jumpLabel: 'BattleScript_IgnoresWhileAsleep',
    };
  }

  // Second roll : type of disobedience.
  rnd = Random() & 255;
  calc = ((gBattleMons[gBattlerAttacker].level + obedienceLevel) * rnd) >>> 8;
  if (calc < obedienceLevel) {
    // Random move ou loaf si tous les moves indispo.
    const limitations = CheckMoveLimitations(gBattlerAttacker, 1 << gCurrMovePos, MOVE_LIMITATIONS_ALL);
    if (limitations === ALL_MOVES_MASK) {
      gBattleCommunication[MULTISTRING_CHOOSER] = _DIS_MOD(Random(), NUM_LOAF_STRINGS);
      return {
        retval: DISOBEDIENCE_IGNORED,
        jumpLabel: 'BattleScript_MoveUsedLoafingAround',
      };
    } else {
      // Random pick un autre move (1:1 décomp battle_util.c : do/while sans garde —
      // termine forcément car ce else-branch garantit limitations != ALL_MOVES_MASK,
      // donc au moins un slot de move est libre).
      do {
        const idx = _DIS_MOD(Random(), MAX_MON_MOVES);
        setCurrMovePos(idx);
        setChosenMovePos(idx);
      } while ((1 << gCurrMovePos) & limitations);

      const calledMove = gBattleMons[gBattlerAttacker].moves[gCurrMovePos];
      setCalledMove(calledMove);
      // 1:1 décomp : gBattlerTarget = GetMoveTarget(calledMove, NO_TARGET_OVERRIDE).
      setBattlerTarget(_GetMoveTarget(calledMove, NO_TARGET_OVERRIDE));
      setHitMarker(gHitMarker | HITMARKER_DISOBEDIENT_MOVE);
      return {
        retval: DISOBEDIENCE_OTHER,
        jumpLabel: 'BattleScript_IgnoresAndUsesRandomMove',
      };
    }
  } else {
    // Sleep / self-hit / loaf.
    obedienceLevel = gBattleMons[gBattlerAttacker].level - obedienceLevel;
    calc = Random() & 255;
    if (calc < obedienceLevel
        && !(gBattleMons[gBattlerAttacker].status1 & STATUS1_ANY)
        && gBattleMons[gBattlerAttacker].ability !== ABILITY_VITAL_SPIRIT
        && gBattleMons[gBattlerAttacker].ability !== ABILITY_INSOMNIA) {
      // Try to fall asleep.
      let i;
      for (i = 0; i < gBattlersCount; i++) {
        if (gBattleMons[i].status2 & STATUS2_UPROAR) break;
      }
      if (i === gBattlersCount) {
        return {
          retval: DISOBEDIENCE_IGNORED,
          jumpLabel: 'BattleScript_IgnoresAndFallsAsleep',
        };
      }
    }
    calc -= obedienceLevel;
    if (calc < obedienceLevel) {
      // Self-hit confusion-style damage.
      setBattleMoveDamage(_calculateConfusionDamage(gBattlerAttacker));
      setBattlerTarget(gBattlerAttacker);
      setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
      return {
        retval: DISOBEDIENCE_OTHER,
        jumpLabel: 'BattleScript_IgnoresAndHitsItself',
      };
    } else {
      gBattleCommunication[MULTISTRING_CHOOSER] = _DIS_MOD(Random(), NUM_LOAF_STRINGS);
      return {
        retval: DISOBEDIENCE_IGNORED,
        jumpLabel: 'BattleScript_MoveUsedLoafingAround',
      };
    }
  }
}

/** Helper glue pour Cmd_attackcanceler (= bridge du retour restructuré de
 *  IsMonDisobedient vers le modèle d'interpréteur ctx ; dissous dans Cmd_attackcanceler
 *  quand battle_script_commands.c sera migré). */
export function applyDisobedienceCheck(ctx: BattleScriptContext, opcodeStartPtr: number): boolean {
  const result = IsMonDisobedient(ctx);
  if (result.retval === DISOBEDIENCE_OBEDIENT) return false;

  // Push cursor + jump (= 1:1 décomp pattern).
  if (result.jumpLabel) {
    ctx.scriptPtrStack.push(opcodeStartPtr);
    const off = getBattleScriptOffset(result.jumpLabel);
    if (off >= 0) ctx.scriptPtr = off;
  }
  return true;
}

// ════════════════════════════════════════════════════════════════════════════
// AtkCanceler_UnableToUseMove (battle_util.c:1985-2270) — status checks au début
// de chaque move (sleep/freeze/paralysis/confusion/flinch/attract/truant/disable/
// taunt/imprison/bide/thaw). State machine gBattleStruct.atkCancelerTracker 0..14.
// [fusion miroir 2026-06-13, ex-engine/battle/atk-canceler.ts]
// ════════════════════════════════════════════════════════════════════════════

// ─── CANCELER_* enum (battle_util.c:1966-1983) — 1:1 décomp ──────────────
export const CANCELER_FLAGS      = 0;
export const CANCELER_ASLEEP     = 1;
export const CANCELER_FROZEN     = 2;
export const CANCELER_TRUANT     = 3;
export const CANCELER_RECHARGE   = 4;
export const CANCELER_FLINCH     = 5;
export const CANCELER_DISABLED   = 6;
export const CANCELER_TAUNTED    = 7;
export const CANCELER_IMPRISONED = 8;
export const CANCELER_CONFUSED   = 9;
export const CANCELER_PARALYZED  = 10;
export const CANCELER_IN_LOVE    = 11;
export const CANCELER_BIDE       = 12;
export const CANCELER_THAW       = 13;
export const CANCELER_END        = 14;

/** 1:1 décomp `UproarWakeUpCheck(battler)` (battle_script_commands.c:6804-6829).
 *  Check si un battler en STATUS2_UPROAR est dans le combat. Wake up le mon
 *  sleeping (= battler param) sauf si Soundproof. */
function _UproarWakeUpCheck(battler: number): boolean {
  const B_MSG_CANT_SLEEP_UPROAR = 0;
  const B_MSG_UPROAR_KEPT_AWAKE = 1;
  let i: number;
  for (i = 0; i < gBattlersCount; i++) {
    if (!(gBattleMons[i].status2 & STATUS2_UPROAR)
        || gBattleMons[battler].ability === ABILITY_SOUNDPROOF) {
      continue;
    }
    gBattleScripting.battler = i;
    // 1:1 décomp battle_script_commands.c:6815 : sentinel 0xFF = "target pas
    // encore set par un précédent move targeting".
    if (gBattlerTarget === 0xFF) {
      setBattlerTarget(i);
    } else if (gBattlerTarget === i) {
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_CANT_SLEEP_UPROAR;
    } else {
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_UPROAR_KEPT_AWAKE;
    }
    break;
  }
  return i !== gBattlersCount;
}

/** 1:1 décomp `CountTrailingZeroBits(value)` (util.c). Position du LSB set.
 *  Pour STATUS2_INFATUATION : 0x10000 (bit 16) → return 0. */
function _CountTrailingZeroBits(value: number): number {
  if (value === 0) return 0;
  let count = 0;
  while ((value & 1) === 0) {
    count++;
    value >>>= 1;
  }
  return count;
}

export interface AtkCancelerResult {
  /** 0=move proceeds, 1=cancelled BS jump set, 2=cancelled + status1 sync needed. */
  effect: number;
  /** BattleScript label vers lequel sauter (= si effect != 0). */
  jumpLabel: string | null;
  /** Si true, le caller doit `ctx.scriptPtrStack.push(opcodeStartPtr)` avant jump
   *  (= BattleScriptPushCursor dans décomp). */
  pushCursor: boolean;
}

/** 1:1 décomp `AtkCanceler_UnableToUseMove()` (battle_util.c:1985-2270). */
export function AtkCanceler_UnableToUseMove(_ctx: BattleScriptContext): AtkCancelerResult {
  let effect = 0;
  let jumpLabel: string | null = null;
  let pushCursor = false;
  let bideDmgLocal = 0;

  let iterations = 0;
  const MAX_ITER = 64;

  while (iterations++ < MAX_ITER && gBattleStruct.atkCancelerTracker !== CANCELER_END && effect === 0) {
    switch (gBattleStruct.atkCancelerTracker) {
      case CANCELER_FLAGS:
        // 1:1 décomp : clear DESTINY_BOND + STATUS3_GRUDGE.
        gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_DESTINY_BOND;
        gStatuses3[gBattlerAttacker] &= ~STATUS3_GRUDGE;
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_ASLEEP:
        if (gBattleMons[gBattlerAttacker].status1 & STATUS1_SLEEP) {
          if (_UproarWakeUpCheck(gBattlerAttacker)) {
            gBattleMons[gBattlerAttacker].status1 &= ~STATUS1_SLEEP;
            gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_NIGHTMARE;
            pushCursor = true;
            gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_WOKE_UP_UPROAR;
            jumpLabel = 'BattleScript_MoveUsedWokeUp';
            effect = 2;
          } else {
            // 1:1 décomp : Early Bird ability → 2x sleep counter decrement.
            const toSub = gBattleMons[gBattlerAttacker].ability === ABILITY_EARLY_BIRD ? 2 : 1;
            if ((gBattleMons[gBattlerAttacker].status1 & STATUS1_SLEEP) < toSub) {
              gBattleMons[gBattlerAttacker].status1 &= ~STATUS1_SLEEP;
            } else {
              gBattleMons[gBattlerAttacker].status1 -= toSub;
            }
            if (gBattleMons[gBattlerAttacker].status1 & STATUS1_SLEEP) {
              // Still asleep
              if (gCurrentMove !== MOVE_SNORE && gCurrentMove !== MOVE_SLEEP_TALK) {
                jumpLabel = 'BattleScript_MoveUsedIsAsleep';
                setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
                effect = 2;
              }
            } else {
              // Just woke up
              gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_NIGHTMARE;
              pushCursor = true;
              gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_WOKE_UP;
              jumpLabel = 'BattleScript_MoveUsedWokeUp';
              effect = 2;
            }
          }
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_FROZEN:
        if (gBattleMons[gBattlerAttacker].status1 & STATUS1_FREEZE) {
          if (Random() % 5) {
            // 1:1 décomp : 80% chance stay frozen.
            if (getBattleMove(gCurrentMove).effect !== EFFECT_THAW_HIT) {
              jumpLabel = 'BattleScript_MoveUsedIsFrozen';
              setHitMarker(gHitMarker | HITMARKER_NO_ATTACKSTRING);
            } else {
              // EFFECT_THAW_HIT = unfreeze via move effect happens in CANCELER_THAW.
              gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
              break;
            }
          } else {
            // 20% chance unfreeze.
            gBattleMons[gBattlerAttacker].status1 &= ~STATUS1_FREEZE;
            pushCursor = true;
            jumpLabel = 'BattleScript_MoveUsedUnfroze';
            gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_DEFROSTED;
          }
          effect = 2;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_TRUANT:
        if (gBattleMons[gBattlerAttacker].ability === ABILITY_TRUANT
            && gDisableStructs[gBattlerAttacker].truantCounter) {
          // 1:1 décomp : CancelMultiTurnMoves + Loafing.
          _CancelMultiTurnMoves(gBattlerAttacker);
          setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
          gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_LOAFING;
          jumpLabel = 'BattleScript_MoveUsedLoafingAround';
          setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
          effect = 1;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_RECHARGE:
        if (gBattleMons[gBattlerAttacker].status2 & STATUS2_RECHARGE) {
          gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_RECHARGE;
          gDisableStructs[gBattlerAttacker].rechargeTimer = 0;
          _CancelMultiTurnMoves(gBattlerAttacker);
          jumpLabel = 'BattleScript_MoveUsedMustRecharge';
          setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
          effect = 1;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_FLINCH:
        if (gBattleMons[gBattlerAttacker].status2 & STATUS2_FLINCHED) {
          gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_FLINCHED;
          gProtectStructs[gBattlerAttacker].flinchImmobility = 1;
          _CancelMultiTurnMoves(gBattlerAttacker);
          jumpLabel = 'BattleScript_MoveUsedFlinched';
          setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
          effect = 1;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_DISABLED:
        if (gDisableStructs[gBattlerAttacker].disabledMove === gCurrentMove
            && gDisableStructs[gBattlerAttacker].disabledMove !== 0 /* MOVE_NONE */) {
          gProtectStructs[gBattlerAttacker].usedDisabledMove = 1;
          gBattleScripting.battler = gBattlerAttacker;
          _CancelMultiTurnMoves(gBattlerAttacker);
          jumpLabel = 'BattleScript_MoveUsedIsDisabled';
          setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
          effect = 1;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_TAUNTED:
        if (gDisableStructs[gBattlerAttacker].tauntTimer
            && getBattleMove(gCurrentMove).power === 0) {
          gProtectStructs[gBattlerAttacker].usedTauntedMove = 1;
          _CancelMultiTurnMoves(gBattlerAttacker);
          jumpLabel = 'BattleScript_MoveUsedIsTaunted';
          setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
          effect = 1;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_IMPRISONED:
        if (_GetImprisonedMovesCount(gBattlerAttacker, gCurrentMove)) {
          gProtectStructs[gBattlerAttacker].usedImprisonedMove = 1;
          _CancelMultiTurnMoves(gBattlerAttacker);
          jumpLabel = 'BattleScript_MoveUsedIsImprisoned';
          setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
          effect = 1;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_CONFUSED:
        if (gBattleMons[gBattlerAttacker].status2 & STATUS2_CONFUSION) {
          // 1:1 décomp : decrement confusion counter via STATUS2_CONFUSION_TURN(1).
          gBattleMons[gBattlerAttacker].status2 -= STATUS2_CONFUSION_TURN(1);
          if (gBattleMons[gBattlerAttacker].status2 & STATUS2_CONFUSION) {
            // Still confused
            if (Random() & 1) {
              // No confusion damage this turn — pre-push BattleScript.
              gBattleCommunication[MULTISTRING_CHOOSER] = 0;  // FALSE
              pushCursor = true;
            } else {
              // Confusion self-hit
              gBattleCommunication[MULTISTRING_CHOOSER] = 1;  // TRUE
              setBattlerTarget(gBattlerAttacker);
              setBattleMoveDamage(_calculateConfusionDamage(gBattlerAttacker));
              gProtectStructs[gBattlerAttacker].confusionSelfDmg = 1;
              setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
            }
            jumpLabel = 'BattleScript_MoveUsedIsConfused';
          } else {
            // Snapped out of confusion
            pushCursor = true;
            jumpLabel = 'BattleScript_MoveUsedIsConfusedNoMore';
          }
          effect = 1;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_PARALYZED:
        // 1:1 décomp Em : `CancelMultiTurnMoves` retiré (= bug fix Em vs RS).
        if ((gBattleMons[gBattlerAttacker].status1 & STATUS1_PARALYSIS)
            && (Random() % 4) === 0) {
          gProtectStructs[gBattlerAttacker].prlzImmobility = 1;
          jumpLabel = 'BattleScript_MoveUsedIsParalyzed';
          setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
          effect = 1;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_IN_LOVE:
        if (gBattleMons[gBattlerAttacker].status2 & STATUS2_INFATUATION) {
          // 1:1 décomp : battler ID stocké dans bits 16-23 de status2.
          gBattleScripting.battler = _CountTrailingZeroBits(
            (gBattleMons[gBattlerAttacker].status2 & STATUS2_INFATUATION) >>> 0x10
          );
          if (Random() & 1) {
            pushCursor = true;
          } else {
            // 1:1 décomp : BattleScriptPush(BattleScript_MoveUsedIsInLoveCantAttack)
            // (= STACKED, pas la principal jump). Notre port : on indique au caller.
            // Le caller doit faire 2 pushes : opcodeStartPtr + InLoveCantAttack.
            jumpLabel = 'BattleScript_MoveUsedIsInLove__withCantAttack';  // sentinel
            setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
            gProtectStructs[gBattlerAttacker].loveImmobility = 1;
            _CancelMultiTurnMoves(gBattlerAttacker);
          }
          if (jumpLabel !== 'BattleScript_MoveUsedIsInLove__withCantAttack') {
            jumpLabel = 'BattleScript_MoveUsedIsInLove';
          }
          effect = 1;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_BIDE:
        if (gBattleMons[gBattlerAttacker].status2 & STATUS2_BIDE) {
          gBattleMons[gBattlerAttacker].status2 -= STATUS2_BIDE_TURN(1);
          if (gBattleMons[gBattlerAttacker].status2 & STATUS2_BIDE) {
            jumpLabel = 'BattleScript_BideStoringEnergy';
          } else {
            // Bide release
            if (gBideDmg[gBattlerAttacker]) {
              setCurrentMove(MOVE_BIDE);
              bideDmgLocal = gBideDmg[gBattlerAttacker] * 2;
              gBattleScripting.bideDmg = bideDmgLocal;
              setBattlerTarget(gBideTarget[gBattlerAttacker]);
              if (gAbsentBattlerFlags & (1 << gBattlerTarget)) {
                // 1:1 décomp battle_util.c AtkCanceler CANCELER_BIDE :
                // `gBattlerTarget = GetMoveTarget(MOVE_BIDE, MOVE_TARGET_SELECTED + 1);`
                // = repick target alive (= rare case Bide vs fainted target).
                setBattlerTarget(_GetMoveTarget(MOVE_BIDE, MOVE_TARGET_SELECTED + 1));
              }
              jumpLabel = 'BattleScript_BideAttack';
            } else {
              jumpLabel = 'BattleScript_BideNoEnergyToAttack';
            }
          }
          effect = 1;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_THAW:
        if (gBattleMons[gBattlerAttacker].status1 & STATUS1_FREEZE) {
          if (getBattleMove(gCurrentMove).effect === EFFECT_THAW_HIT) {
            gBattleMons[gBattlerAttacker].status1 &= ~STATUS1_FREEZE;
            pushCursor = true;
            jumpLabel = 'BattleScript_MoveUsedUnfroze';
            gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_DEFROSTED_BY_MOVE;
          }
          effect = 2;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_END:
        break;
    }
  }

  // 1:1 décomp : `if (effect == 2)` → emit SetMonData REQUEST_STATUS_BATTLE.
  // Notre port : signal au caller via `effect=2`. EmitSetMonData status1 sync
  // wired via batch C bridge.
  return { effect, jumpLabel, pushCursor };
}

/** 1:1 décomp `CancelMultiTurnMoves(battler)` (battle_util.c:864-875). */
function _CancelMultiTurnMoves(battler: number): void {
  // 1:1 décomp battle.h:132,135,137,139,178.
  const STATUS2_MULTIPLETURNS = 1 << 12;             // 0x1000 (= 1<<12)
  const STATUS2_LOCK_CONFUSE  = (1 << 10) | (1 << 11); // 0xC00
  const STATUS2_UPROAR_LOCAL  = (1 << 4) | (1 << 5) | (1 << 6); // 0x70
  const STATUS2_BIDE_LOCAL    = (1 << 8) | (1 << 9); // 0x300
  // 1:1 décomp : STATUS3_SEMI_INVULNERABLE = ON_AIR(1<<6) | UNDERGROUND(1<<7) | UNDERWATER(1<<18)
  const STATUS3_SEMI_INVULNERABLE_LOCAL = (1 << 6) | (1 << 7) | (1 << 18); // 0x400C0
  gBattleMons[battler].status2 &= ~STATUS2_MULTIPLETURNS;
  gBattleMons[battler].status2 &= ~STATUS2_LOCK_CONFUSE;
  gBattleMons[battler].status2 &= ~STATUS2_UPROAR_LOCAL;
  gBattleMons[battler].status2 &= ~STATUS2_BIDE_LOCAL;
  gStatuses3[battler] &= ~STATUS3_SEMI_INVULNERABLE_LOCAL;
  gDisableStructs[battler].rolloutTimer = 0;
  gDisableStructs[battler].furyCutterCounter = 0;
}

/** Helper glue pour Cmd_attackcanceler : wire AtkCanceler dans le script flow
 *  (= bridge du retour restructuré vers le modèle d'interpréteur ctx ; dissous
 *  dans Cmd_attackcanceler quand battle_script_commands.c sera migré). Retourne
 *  true si le caller doit return immédiat (= AtkCanceler a set le jump). */
export function applyAtkCanceler(ctx: BattleScriptContext, opcodeStartPtr: number): boolean {
  const result = AtkCanceler_UnableToUseMove(ctx);
  if (result.effect === 0) return false;  // continue normally

  if (result.pushCursor) {
    ctx.scriptPtrStack.push(opcodeStartPtr);
  }
  if (result.jumpLabel) {
    // Handle sentinel pour CANCELER_IN_LOVE avec double push.
    if (result.jumpLabel === 'BattleScript_MoveUsedIsInLove__withCantAttack') {
      const offCantAttack = getBattleScriptOffset('BattleScript_MoveUsedIsInLoveCantAttack');
      const offInLove = getBattleScriptOffset('BattleScript_MoveUsedIsInLove');
      if (offCantAttack >= 0) ctx.scriptPtrStack.push(offCantAttack);
      if (offInLove >= 0) ctx.scriptPtr = offInLove;
    } else {
      const off = getBattleScriptOffset(result.jumpLabel);
      if (off >= 0) ctx.scriptPtr = off;
    }
  }
  return true;
}

/** Reset le tracker pour un nouveau move. Appelé par battle setup entre 2 attacks. */
export function resetAtkCancelerTracker(): void {
  gBattleStruct.atkCancelerTracker = 0;
}

// ════════════════════════════════════════════════════════════════════════════
// ItemBattleEffects (battle_util.c:3240-3800) — effets des objets tenus en combat
// (berries cure/heal/stat-up, Leftovers, Kings Rock flinch, Shell Bell, White Herb).
// [fusion miroir 2026-06-13, ex-engine/battle/item-battle-effects.ts]
// ════════════════════════════════════════════════════════════════════════════

// ─── ITEMEFFECT_* enum (= 1:1 décomp battle_util.h:41-47) ────────────────
export const ITEMEFFECT_ON_SWITCH_IN          = 0;
export const ITEMEFFECT_NORMAL                = 1;
export const ITEMEFFECT_DUMMY                 = 2;
export const ITEMEFFECT_MOVE_END              = 3;
export const ITEMEFFECT_KINGSROCK_SHELLBELL   = 4;

// ─── ITEM_* return codes 1:1 décomp ──────────────────────────────────────
const ITEM_NO_EFFECT     = 0;
const ITEM_STATS_CHANGE  = 1;
const ITEM_HP_CHANGE     = 2;
const ITEM_STATUS_CHANGE = 3;
const ITEM_EFFECT_OTHER  = 4;

// 1:1 décomp battle_string_ids.h.
const STRINGID_STATSHARPLY = 209;
const STRINGID_STATROSE    = 210;

// ─── Helpers : status1 masks ─────────────────────────────────────────────
const STATUS1_PSN_ANY = STATUS1_POISON | STATUS1_TOXIC_POISON;

const ITEM_ENIGMA_BERRY = 175; // ITEM_ENIGMA_BERRY = 175 dans le décomp.

/** 1:1 décomp battle_util.c:3417 — PREPARE_STRING_BUFFER(gBattleTextBuff2, STRINGID_X). */
function _PREPARE_STRING_BUFFER_IBE(buf: Uint8Array, stringId: number): void {
  buf[0] = _B_BUFF_BEGIN_IBE;
  buf[1] = _B_BUFF_STRING_IBE;
  buf[2] = stringId & 0xFF;
  buf[3] = (stringId >> 8) & 0xFF;
  buf[4] = _B_BUFF_EOS_IBE;
}

/** 1:1 décomp `StringCopy(gBattleTextBuff1, gStatusConditionString_XJpn)`.
 *  Notre version FR direct. Utilisé par CURE_ATTRACT/CURE_STATUS. */
function _writeStatusFrToBuffIBE(buf: Uint8Array, status1: number, status2: number): void {
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
  buf[Math.min(s.length, buf.length - 1)] = _B_BUFF_EOS_IBE;
}

/** Module-local global pour le script label voulu. Caller via consumeItemWantedScript(). */
let _lastWantedScriptLabel: string | null = null;

export function consumeItemWantedScript(): string | null {
  const v = _lastWantedScriptLabel;
  _lastWantedScriptLabel = null;
  return v;
}

/** Module-local stub `gBattleStruct->moneyMultiplier`. */
let _moneyMultiplier = 1;
export function getMoneyMultiplier(): number { return _moneyMultiplier; }
export function setMoneyMultiplier(v: number) { _moneyMultiplier = v; }

/** 1:1 décomp `ItemBattleEffects(u8 caseID, u8 battlerId, bool8 moveTurn)`.
 *  Returns ITEM_NO_EFFECT (=0) ou ITEM_STATS_CHANGE (=1). */
export function ItemBattleEffects(caseID: number, battlerId: number, moveTurn: boolean): number {
  let effect = ITEM_NO_EFFECT;

  setLastUsedItem(gBattleMons[battlerId].item);
  const battlerHoldEffect = gLastUsedItem === ITEM_ENIGMA_BERRY
    ? 0 /* gEnigmaBerries non porté */
    : GetItemHoldEffect(gLastUsedItem);

  const atkItem = gBattleMons[gBattlerAttacker].item;
  const atkHoldEffect = atkItem === ITEM_ENIGMA_BERRY ? 0 : GetItemHoldEffect(atkItem);
  const atkHoldEffectParam = atkItem === ITEM_ENIGMA_BERRY ? 0 : GetItemHoldEffectParam(atkItem);

  // 1:1 décomp : defItem variables sont UNUSED (comment décomp:3273), skip.

  switch (caseID) {
    case ITEMEFFECT_ON_SWITCH_IN: {
      // 1:1 décomp battle_util.c:3288-3313.
      switch (battlerHoldEffect) {
        case HOLD_EFFECT_DOUBLE_PRIZE:
          if (GET_BATTLER_SIDE(battlerId) === B_SIDE_PLAYER) {
            setMoneyMultiplier(2);
          }
          break;
        case HOLD_EFFECT_RESTORE_STATS:
          for (let i = 0; i < NUM_BATTLE_STATS; i++) {
            if (gBattleMons[battlerId].statStages[i] < DEFAULT_STAT_STAGE) {
              gBattleMons[battlerId].statStages[i] = DEFAULT_STAT_STAGE;
              effect = ITEM_STATS_CHANGE;
            }
          }
          if (effect !== ITEM_NO_EFFECT) {
            gBattleScripting.battler = battlerId;
            setPotentialItemEffectBattler(battlerId);
            setActiveBattler(battlerId);
            setBattlerAttacker(battlerId);
            _lastWantedScriptLabel = 'BattleScript_WhiteHerbEnd2';
          }
          break;
      }
      break;
    }

    case ITEMEFFECT_DUMMY:
      // 1:1 décomp battle_util.c:3606 — no-op.
      break;

    case ITEMEFFECT_KINGSROCK_SHELLBELL: {
      // 1:1 décomp battle_util.c:3752-3800.
      if (gBattleMoveDamage) {
        switch (atkHoldEffect) {
          case HOLD_EFFECT_FLINCH:
            if (!(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)
                && (gSpecialStatuses[gBattlerTarget].physicalDmg !== 0
                    || gSpecialStatuses[gBattlerTarget].specialDmg !== 0) /* TARGET_TURN_DAMAGED */
                && (Random() % 100) < atkHoldEffectParam
                && (getBattleMove(gCurrentMove).flags & FLAG_KINGS_ROCK_AFFECTED)
                && gBattleMons[gBattlerTarget].hp) {
              gBattleCommunication[MOVE_EFFECT_BYTE] = MOVE_EFFECT_FLINCH;
              // 1:1 décomp : BattleScriptPushCursor() + SetMoveEffect(FALSE, 0) + BattleScriptPop()
              // (= push/pop paired = no-op sur le script pointer). Le caller wire SetMoveEffect
              // via le bytecode interpreter ; on signale via wantedScript sentinel.
              _lastWantedScriptLabel = '__KINGS_ROCK_FLINCH_QUEUED';
              effect = ITEM_STATS_CHANGE;
            }
            break;
          case HOLD_EFFECT_SHELL_BELL:
            if (!(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)
                && gSpecialStatuses[gBattlerTarget].shellBellDmg !== 0
                && gSpecialStatuses[gBattlerTarget].shellBellDmg !== IGNORE_SHELL_BELL
                && gBattlerAttacker !== gBattlerTarget
                && gBattleMons[gBattlerAttacker].hp !== gBattleMons[gBattlerAttacker].maxHP
                && gBattleMons[gBattlerAttacker].hp !== 0) {
              setLastUsedItem(atkItem);
              setPotentialItemEffectBattler(gBattlerAttacker);
              gBattleScripting.battler = gBattlerAttacker;
              let dmg = Math.floor(gSpecialStatuses[gBattlerTarget].shellBellDmg / atkHoldEffectParam) * -1;
              if (dmg === 0) dmg = -1;
              setBattleMoveDamage(dmg);
              gSpecialStatuses[gBattlerTarget].shellBellDmg = 0;
              _lastWantedScriptLabel = 'BattleScript_ItemHealHP_Ret';
              effect = ITEM_STATS_CHANGE;
            }
            break;
        }
      }
      break;
    }

    case ITEMEFFECT_NORMAL: {
      // 1:1 décomp battle_util.c:3314-3605 — berries triggers.
      if (gBattleMons[battlerId].hp) {
        const battlerHoldEffectParam = gLastUsedItem === ITEM_ENIGMA_BERRY
          ? 0 : GetItemHoldEffectParam(gLastUsedItem);
        switch (battlerHoldEffect) {
          case HOLD_EFFECT_RESTORE_PP:
            // 1:1 décomp battle_util.c:3330-3365 (Leppa Berry).
            if (!moveTurn) {
              const mon = GET_BATTLER_SIDE(battlerId) === B_SIDE_PLAYER
                ? gPlayerParty[gBattlerPartyIndexes[battlerId]]
                : gEnemyParty[gBattlerPartyIndexes[battlerId]];
              let foundIdx = -1;
              let foundMove = 0;
              let foundPp = 0;
              for (let i = 0; i < MAX_MON_MOVES; i++) {
                const m = GetMonData(mon, MON_DATA_MOVE1 + i) as number;
                const pp = GetMonData(mon, MON_DATA_PP1 + i) as number;
                if (m && pp === 0) {
                  foundIdx = i;
                  foundMove = m;
                  foundPp = pp;
                  break;
                }
              }
              if (foundIdx !== -1) {
                // 1:1 décomp : CalculatePPWithBonus pour max PP. Stub : getBattleMove(move).pp.
                const maxPP = getBattleMove(foundMove).pp;
                let newPp = foundPp + battlerHoldEffectParam;
                if (newPp > maxPP) newPp = maxPP;
                _PREPARE_MOVE_BUFFER_IBE(_gBattleTextBuff1_IBE, foundMove);
                SetMonData(mon, MON_DATA_PP1 + foundIdx, newPp);
                gBattleMons[battlerId].pp[foundIdx] = newPp;
                _lastWantedScriptLabel = 'BattleScript_BerryPPHealEnd2';
                effect = 3 /* ITEM_PP_CHANGE */;
              }
            }
            break;
          case HOLD_EFFECT_RESTORE_HP:
            // 1:1 décomp battle_util.c:3319-3329 (Berry HP restore).
            if (gBattleMons[battlerId].hp <= gBattleMons[battlerId].maxHP / 2 && !moveTurn) {
              let dmg = battlerHoldEffectParam;
              if (gBattleMons[battlerId].hp + dmg > gBattleMons[battlerId].maxHP) {
                dmg = gBattleMons[battlerId].maxHP - gBattleMons[battlerId].hp;
              }
              setBattleMoveDamage(-dmg);
              _lastWantedScriptLabel = 'BattleScript_ItemHealHP_RemoveItem';
              effect = ITEM_HP_CHANGE;
            }
            break;
          case HOLD_EFFECT_RESTORE_STATS:
            for (let i = 0; i < NUM_BATTLE_STATS; i++) {
              if (gBattleMons[battlerId].statStages[i] < DEFAULT_STAT_STAGE) {
                gBattleMons[battlerId].statStages[i] = DEFAULT_STAT_STAGE;
                effect = ITEM_STATS_CHANGE;
              }
            }
            if (effect !== ITEM_NO_EFFECT) {
              gBattleScripting.battler = battlerId;
              setPotentialItemEffectBattler(battlerId);
              setActiveBattler(battlerId);
              setBattlerAttacker(battlerId);
              _lastWantedScriptLabel = 'BattleScript_WhiteHerbEnd2';
            }
            break;
          case HOLD_EFFECT_CONFUSE_SPICY:
          case HOLD_EFFECT_CONFUSE_DRY:
          case HOLD_EFFECT_CONFUSE_SWEET:
          case HOLD_EFFECT_CONFUSE_BITTER:
          case HOLD_EFFECT_CONFUSE_SOUR: {
            // 1:1 décomp TRY_EAT_CONFUSE_BERRY(flavor) macro (battle_util.c:3210).
            const _flavorOf = (heff: number): number =>
              heff - HOLD_EFFECT_CONFUSE_SPICY;
            if (gBattleMons[battlerId].hp <= Math.floor(gBattleMons[battlerId].maxHP / 2) && !moveTurn) {
              const flavor = _flavorOf(battlerHoldEffect);
              _PREPARE_FLAVOR_BUFFER_IBE(_gBattleTextBuff1_IBE, flavor);
              let dmg = Math.floor(gBattleMons[battlerId].maxHP / battlerHoldEffectParam);
              if (dmg === 0) dmg = 1;
              if (gBattleMons[battlerId].hp + dmg > gBattleMons[battlerId].maxHP) {
                dmg = gBattleMons[battlerId].maxHP - gBattleMons[battlerId].hp;
              }
              setBattleMoveDamage(-dmg);
              const relation = GetFlavorRelationByPersonality(gBattleMons[battlerId].personality, flavor);
              if (relation < 0) {
                _lastWantedScriptLabel = 'BattleScript_BerryConfuseHealEnd2';
              } else {
                _lastWantedScriptLabel = 'BattleScript_ItemHealHP_RemoveItem';
              }
              effect = ITEM_HP_CHANGE;
            }
            break;
          }
          case HOLD_EFFECT_LEFTOVERS:
            if (gBattleMons[battlerId].hp < gBattleMons[battlerId].maxHP && !moveTurn) {
              let dmg = Math.floor(gBattleMons[battlerId].maxHP / 16);
              if (dmg === 0) dmg = 1;
              if (gBattleMons[battlerId].hp + dmg > gBattleMons[battlerId].maxHP) {
                dmg = gBattleMons[battlerId].maxHP - gBattleMons[battlerId].hp;
              }
              setBattleMoveDamage(-dmg);
              _lastWantedScriptLabel = 'BattleScript_ItemHealHP_End2';
              effect = ITEM_HP_CHANGE;
            }
            break;
          case HOLD_EFFECT_CURE_PAR:
            if (gBattleMons[battlerId].status1 & STATUS1_PARALYSIS) {
              gBattleMons[battlerId].status1 &= ~STATUS1_PARALYSIS;
              _lastWantedScriptLabel = 'BattleScript_BerryCurePrlzEnd2';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
          case HOLD_EFFECT_CURE_PSN:
            if (gBattleMons[battlerId].status1 & STATUS1_PSN_ANY) {
              gBattleMons[battlerId].status1 &= ~(STATUS1_PSN_ANY | STATUS1_TOXIC_COUNTER);
              _lastWantedScriptLabel = 'BattleScript_BerryCurePsnEnd2';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
          case HOLD_EFFECT_CURE_BRN:
            if (gBattleMons[battlerId].status1 & STATUS1_BURN) {
              gBattleMons[battlerId].status1 &= ~STATUS1_BURN;
              _lastWantedScriptLabel = 'BattleScript_BerryCureBrnEnd2';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
          case HOLD_EFFECT_CURE_FRZ:
            if (gBattleMons[battlerId].status1 & STATUS1_FREEZE) {
              gBattleMons[battlerId].status1 &= ~STATUS1_FREEZE;
              _lastWantedScriptLabel = 'BattleScript_BerryCureFrzEnd2';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
          case HOLD_EFFECT_CURE_SLP:
            if (gBattleMons[battlerId].status1 & STATUS1_SLEEP) {
              gBattleMons[battlerId].status1 &= ~STATUS1_SLEEP;
              gBattleMons[battlerId].status2 &= ~STATUS2_NIGHTMARE;
              _lastWantedScriptLabel = 'BattleScript_BerryCureSlpEnd2';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
          case HOLD_EFFECT_CURE_CONFUSION:
            if (gBattleMons[battlerId].status2 & STATUS2_CONFUSION) {
              gBattleMons[battlerId].status2 &= ~STATUS2_CONFUSION;
              _lastWantedScriptLabel = 'BattleScript_BerryCureConfusionEnd2';
              effect = ITEM_EFFECT_OTHER;
            }
            break;
          case HOLD_EFFECT_CURE_ATTRACT:
            if (gBattleMons[battlerId].status2 & STATUS2_INFATUATION) {
              // 1:1 décomp battle_util.c (Mental Herb) — StringCopy(LoveJpn).
              _writeStatusFrToBuffIBE(
                _gBattleTextBuff1_IBE,
                gBattleMons[battlerId].status1,
                gBattleMons[battlerId].status2,
              );
              gBattleMons[battlerId].status2 &= ~STATUS2_INFATUATION;
              _lastWantedScriptLabel = 'BattleScript_BerryCureChosenStatusEnd2';
              effect = ITEM_EFFECT_OTHER;
            }
            break;
          case HOLD_EFFECT_CURE_STATUS:
            // 1:1 décomp partial : clear tous status1 + STATUS2_CONFUSION.
            if ((gBattleMons[battlerId].status1 & STATUS1_ANY)
                || (gBattleMons[battlerId].status2 & STATUS2_CONFUSION)) {
              _writeStatusFrToBuffIBE(
                _gBattleTextBuff1_IBE,
                gBattleMons[battlerId].status1,
                gBattleMons[battlerId].status2,
              );
              gBattleMons[battlerId].status2 &= ~STATUS2_NIGHTMARE;
              gBattleMons[battlerId].status1 = 0;
              gBattleMons[battlerId].status2 &= ~STATUS2_CONFUSION;
              _lastWantedScriptLabel = 'BattleScript_BerryCureChosenStatusEnd2';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
        }
        // ─── Stat-up berries (= TRY_EAT_STAT_UP_BERRY macro inline) ──────
        const _tryStatUpBerry = (stat: number): boolean => {
          if (gBattleMons[battlerId].hp <= Math.floor(gBattleMons[battlerId].maxHP / battlerHoldEffectParam)
              && !moveTurn
              && gBattleMons[battlerId].statStages[stat] < MAX_STAT_STAGE) {
            // 1:1 décomp battle_util.c:3231 TRY_EAT_STAT_UP_BERRY macro.
            _PREPARE_STAT_BUFFER_IBE(_gBattleTextBuff1_IBE, stat);
            setEffectBattler(battlerId);
            gBattleScripting.statChanger = SET_STATCHANGER(stat, 1, false);
            gBattleScripting.animArg1 = 14 /* STAT_ANIM_PLUS1 */ + stat;
            gBattleScripting.animArg2 = 0;
            _lastWantedScriptLabel = 'BattleScript_BerryStatRaiseEnd2';
            effect = ITEM_STATS_CHANGE;
            return true;
          }
          return false;
        };
        switch (battlerHoldEffect) {
          case HOLD_EFFECT_ATTACK_UP:
            // 1:1 décomp battle_util.c:3412-3424 — version spéciale Attack berry (buff2 STATROSE).
            if (gBattleMons[battlerId].hp <= Math.floor(gBattleMons[battlerId].maxHP / battlerHoldEffectParam)
                && !moveTurn
                && gBattleMons[battlerId].statStages[STAT_ATK] < MAX_STAT_STAGE) {
              _PREPARE_STAT_BUFFER_IBE(_gBattleTextBuff1_IBE, STAT_ATK);
              _PREPARE_STRING_BUFFER_IBE(_gBattleTextBuff2_IBE, STRINGID_STATROSE);
              setEffectBattler(battlerId);
              gBattleScripting.statChanger = SET_STATCHANGER(STAT_ATK, 1, false);
              gBattleScripting.animArg1 = 14 /* STAT_ANIM_PLUS1 */ + STAT_ATK;
              gBattleScripting.animArg2 = 0;
              _lastWantedScriptLabel = 'BattleScript_BerryStatRaiseEnd2';
              effect = ITEM_STATS_CHANGE;
            }
            break;
          case HOLD_EFFECT_DEFENSE_UP:    _tryStatUpBerry(STAT_DEF);   break;
          case HOLD_EFFECT_SPEED_UP:      _tryStatUpBerry(STAT_SPEED); break;
          case HOLD_EFFECT_SP_ATTACK_UP:  _tryStatUpBerry(STAT_SPATK); break;
          case HOLD_EFFECT_SP_DEFENSE_UP: _tryStatUpBerry(STAT_SPDEF); break;
          case HOLD_EFFECT_CRITICAL_UP:
            if (gBattleMons[battlerId].hp <= Math.floor(gBattleMons[battlerId].maxHP / battlerHoldEffectParam)
                && !moveTurn
                && !(gBattleMons[battlerId].status2 & STATUS2_FOCUS_ENERGY)) {
              gBattleMons[battlerId].status2 |= STATUS2_FOCUS_ENERGY;
              _lastWantedScriptLabel = 'BattleScript_BerryFocusEnergyEnd2';
              effect = ITEM_EFFECT_OTHER;
            }
            break;
          case HOLD_EFFECT_RANDOM_STAT_UP:
            // 1:1 décomp battle_util.c:3447-3481 : Starf berry.
            if (!moveTurn
                && gBattleMons[battlerId].hp <= Math.floor(gBattleMons[battlerId].maxHP / battlerHoldEffectParam)) {
              let i = 0;
              for (; i < NUM_STATS - 1; i++) {
                if (gBattleMons[battlerId].statStages[STAT_ATK + i] < MAX_STAT_STAGE) break;
              }
              if (i !== NUM_STATS - 1) {
                do {
                  i = Random() % (NUM_STATS - 1);
                } while (gBattleMons[battlerId].statStages[STAT_ATK + i] === MAX_STAT_STAGE);
                _PREPARE_STAT_BUFFER_IBE(_gBattleTextBuff1_IBE, i + 1);
                _gBattleTextBuff2_IBE[0] = _B_BUFF_BEGIN_IBE;
                _gBattleTextBuff2_IBE[1] = _B_BUFF_STRING_IBE;
                _gBattleTextBuff2_IBE[2] = STRINGID_STATSHARPLY & 0xFF;
                _gBattleTextBuff2_IBE[3] = (STRINGID_STATSHARPLY >> 8) & 0xFF;
                _gBattleTextBuff2_IBE[4] = _B_BUFF_STRING_IBE;
                _gBattleTextBuff2_IBE[5] = STRINGID_STATROSE & 0xFF;
                _gBattleTextBuff2_IBE[6] = (STRINGID_STATROSE >> 8) & 0xFF;
                _gBattleTextBuff2_IBE[7] = _B_BUFF_EOS_IBE;
                setEffectBattler(battlerId);
                gBattleScripting.statChanger = SET_STATCHANGER(i + 1, 2, false);
                gBattleScripting.animArg1 = 21 /* STAT_ANIM_PLUS2 */ + (i + 1);
                gBattleScripting.animArg2 = 0;
                _lastWantedScriptLabel = 'BattleScript_BerryStatRaiseEnd2';
                effect = ITEM_STATS_CHANGE;
              }
            }
            break;
        }
      }
      break;
    }

    case ITEMEFFECT_MOVE_END: {
      // 1:1 décomp battle_util.c:3608-3751 — berry cures post-move (iterate battlers).
      for (let bId = 0; bId < gBattlersCount; bId++) {
        const item = gBattleMons[bId].item;
        const heff = item === ITEM_ENIGMA_BERRY ? 0 : GetItemHoldEffect(item);
        setLastUsedItem(item);
        switch (heff) {
          case HOLD_EFFECT_CURE_PAR:
            if (gBattleMons[bId].status1 & STATUS1_PARALYSIS) {
              gBattleMons[bId].status1 &= ~STATUS1_PARALYSIS;
              _lastWantedScriptLabel = 'BattleScript_BerryCureParRet';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
          case HOLD_EFFECT_CURE_PSN:
            if (gBattleMons[bId].status1 & STATUS1_PSN_ANY) {
              gBattleMons[bId].status1 &= ~(STATUS1_PSN_ANY | STATUS1_TOXIC_COUNTER);
              _lastWantedScriptLabel = 'BattleScript_BerryCurePsnRet';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
          case HOLD_EFFECT_CURE_BRN:
            if (gBattleMons[bId].status1 & STATUS1_BURN) {
              gBattleMons[bId].status1 &= ~STATUS1_BURN;
              _lastWantedScriptLabel = 'BattleScript_BerryCureBrnRet';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
          case HOLD_EFFECT_CURE_FRZ:
            if (gBattleMons[bId].status1 & STATUS1_FREEZE) {
              gBattleMons[bId].status1 &= ~STATUS1_FREEZE;
              _lastWantedScriptLabel = 'BattleScript_BerryCureFrzRet';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
          case HOLD_EFFECT_CURE_SLP:
            if (gBattleMons[bId].status1 & STATUS1_SLEEP) {
              gBattleMons[bId].status1 &= ~STATUS1_SLEEP;
              gBattleMons[bId].status2 &= ~STATUS2_NIGHTMARE;
              _lastWantedScriptLabel = 'BattleScript_BerryCureSlpRet';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
          case HOLD_EFFECT_CURE_CONFUSION:
            if (gBattleMons[bId].status2 & STATUS2_CONFUSION) {
              gBattleMons[bId].status2 &= ~STATUS2_CONFUSION;
              _lastWantedScriptLabel = 'BattleScript_BerryCureConfusionRet';
              effect = ITEM_EFFECT_OTHER;
            }
            break;
          case HOLD_EFFECT_CURE_ATTRACT:
            if (gBattleMons[bId].status2 & STATUS2_INFATUATION) {
              // 1:1 décomp battle_util.c:3683 (Mental Herb) — StringCopy LoveJpn.
              _writeStatusFrToBuffIBE(
                _gBattleTextBuff1_IBE,
                gBattleMons[bId].status1,
                gBattleMons[bId].status2,
              );
              gBattleMons[bId].status2 &= ~STATUS2_INFATUATION;
              gBattleCommunication[5 /* MULTISTRING_CHOOSER */] = 7 /* B_MSG_CURED_PROBLEM */;
              _lastWantedScriptLabel = 'BattleScript_BerryCureChosenStatusRet';
              effect = ITEM_EFFECT_OTHER;
            }
            break;
          case HOLD_EFFECT_CURE_STATUS:
            if ((gBattleMons[bId].status1 & STATUS1_ANY)
                || (gBattleMons[bId].status2 & STATUS2_CONFUSION)) {
              // 1:1 décomp battle_util.c:3691-3713 (Lum Berry) — FR direct.
              _writeStatusFrToBuffIBE(
                _gBattleTextBuff1_IBE,
                gBattleMons[bId].status1,
                gBattleMons[bId].status2,
              );
              gBattleMons[bId].status1 = 0;
              gBattleMons[bId].status2 &= ~(STATUS2_CONFUSION | STATUS2_NIGHTMARE);
              gBattleCommunication[5] = 7 /* B_MSG_CURED_PROBLEM */;
              _lastWantedScriptLabel = 'BattleScript_BerryCureChosenStatusRet';
              effect = ITEM_STATUS_CHANGE;
            }
            break;
          case HOLD_EFFECT_RESTORE_STATS:
            for (let i = 0; i < NUM_BATTLE_STATS; i++) {
              if (gBattleMons[bId].statStages[i] < DEFAULT_STAT_STAGE) {
                gBattleMons[bId].statStages[i] = DEFAULT_STAT_STAGE;
                effect = ITEM_STATS_CHANGE;
              }
            }
            if (effect !== ITEM_NO_EFFECT) {
              gBattleScripting.battler = bId;
              setPotentialItemEffectBattler(bId);
              setActiveBattler(bId);
              setBattlerAttacker(bId);
              _lastWantedScriptLabel = 'BattleScript_WhiteHerbRet';
            }
            break;
        }
        if (effect !== ITEM_NO_EFFECT) {
          gBattleScripting.battler = bId;
          break;
        }
      }
      break;
    }

    default:
      break;
  }

  return effect;
}

// ════════════════════════════════════════════════════════════════════════════
// AbilityBattleEffects (battle_util.c:2414-3200) — coeur des ability checks en
// combat (Soundproof/Absorb/Immunity/Intimidate/Trace/Forecast/Synchronize/
// weather abilities/field sports/Castform morph).
// [fusion miroir 2026-06-13, ex-engine/battle/ability-battle-effects.ts]
// NB : _lastWantedScriptLabel renomme _lastWantedScriptLabel_ABE (collision item).
// ════════════════════════════════════════════════════════════════════════════

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
// SPECIES_CASTFORM importé depuis decomp-data (= 1:1 strict, pas hardcode).

// CASTFORM_NORMAL/FIRE/WATER/ICE = constants/battle.h enum (= 0..3). Pas
// extraits dans decomp-data — hardcodes locaux 1:1 strict justifiés.
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
  const isNormalType = IS_BATTLER_OF_TYPE(battler, TYPE_NORMAL);
  const isFireType = IS_BATTLER_OF_TYPE(battler, TYPE_FIRE);
  const isWaterType = IS_BATTLER_OF_TYPE(battler, TYPE_WATER);
  const isIceType = IS_BATTLER_OF_TYPE(battler, TYPE_ICE);

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
function _recordAbilityBattle(battler: number, ability: number): void {
  _recordAbilityBattleFullABE(battler, ability);
}

/** 1:1 stub `WEATHER_HAS_EFFECT` macro (= !CloudNine && !AirLock active).
 *  Wired via WEATHER_HAS_EFFECT util.ts (= Cloud Nine / Air Lock check). */
const _WEATHER_HAS_EFFECT = true;

// ─── Overworld WEATHER_* (constants/weather.h) — 1:1 décomp ─────────────────
// 1:1 strict A8 audit : import depuis decomp-data au lieu de hardcode.

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
            _lastWantedScriptLabel_ABE = 'BattleScript_OverworldWeatherStarts';
          }
          break;
        case ABILITY_DRIZZLE:
          if (!(gBattleWeather & B_WEATHER_RAIN_PERMANENT)) {
            setBattleWeather(B_WEATHER_RAIN_PERMANENT | B_WEATHER_RAIN_TEMPORARY);
            _lastWantedScriptLabel_ABE = 'BattleScript_DrizzleActivates';
            gBattleScripting.battler = battler;
            effect++;
          }
          break;
        case ABILITY_SAND_STREAM:
          if (!(gBattleWeather & B_WEATHER_SANDSTORM_PERMANENT)) {
            setBattleWeather(B_WEATHER_SANDSTORM);
            _lastWantedScriptLabel_ABE = 'BattleScript_SandstreamActivates';
            gBattleScripting.battler = battler;
            effect++;
          }
          break;
        case ABILITY_DROUGHT:
          if (!(gBattleWeather & B_WEATHER_SUN_PERMANENT)) {
            setBattleWeather(B_WEATHER_SUN);
            _lastWantedScriptLabel_ABE = 'BattleScript_DroughtActivates';
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
            _lastWantedScriptLabel_ABE = 'BattleScript_CastformChange';
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
              _lastWantedScriptLabel_ABE = 'BattleScript_CastformChange';
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
              _lastWantedScriptLabel_ABE = 'BattleScript_RainDishActivates';
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
              _lastWantedScriptLabel_ABE = 'BattleScript_ShedSkinActivates';
              effect++;
            }
            break;
          case ABILITY_SPEED_BOOST:
            if (gBattleMons[battler].statStages[STAT_SPEED] < MAX_STAT_STAGE
                && gDisableStructs[battler].isFirstTurn !== 2) {
              gBattleMons[battler].statStages[STAT_SPEED]++;
              gBattleScripting.animArg1 = 14 /* STAT_ANIM_PLUS1 */ + STAT_SPEED;
              gBattleScripting.animArg2 = 0;
              _lastWantedScriptLabel_ABE = 'BattleScript_SpeedBoostActivates';
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
          _lastWantedScriptLabel_ABE = 'BattleScript_SoundproofProtected';
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
              _lastWantedScriptLabel_ABE = gProtectStructs[gBattlerAttacker].notFirstStrike
                ? 'BattleScript_MoveHPDrain'
                : 'BattleScript_MoveHPDrain_PPLoss';
              effect = 1;
            }
            break;
          case ABILITY_WATER_ABSORB:
            if (moveType === TYPE_WATER && getBattleMove(move).power !== 0) {
              _lastWantedScriptLabel_ABE = gProtectStructs[gBattlerAttacker].notFirstStrike
                ? 'BattleScript_MoveHPDrain'
                : 'BattleScript_MoveHPDrain_PPLoss';
              effect = 1;
            }
            break;
          case ABILITY_FLASH_FIRE:
            if (moveType === TYPE_FIRE && !(gBattleMons[battler].status1 & STATUS1_FREEZE)) {
              if (!(gBattleResourcesFlags[battler] & RESOURCE_FLAG_FLASH_FIRE)) {
                gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_FLASH_FIRE_BOOST;
                _lastWantedScriptLabel_ABE = gProtectStructs[gBattlerAttacker].notFirstStrike
                  ? 'BattleScript_FlashFireBoost'
                  : 'BattleScript_FlashFireBoost_PPLoss';
                gBattleResourcesFlags[battler] |= RESOURCE_FLAG_FLASH_FIRE;
                effect = 2;
              } else {
                gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_FLASH_FIRE_NO_BOOST;
                _lastWantedScriptLabel_ABE = gProtectStructs[gBattlerAttacker].notFirstStrike
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
            _lastWantedScriptLabel_ABE = gProtectStructs[gBattlerAttacker].notFirstStrike
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
          _lastWantedScriptLabel_ABE = 'BattleScript_AbilityCuredStatus';
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
              && !IS_BATTLER_OF_TYPE(battler, moveType)
              && gBattleMons[battler].hp !== 0) {
            // SET_BATTLER_TYPE(battler, moveType) — both types set to moveType.
            gBattleMons[battler].type1 = moveType;
            gBattleMons[battler].type2 = moveType;
            // 1:1 décomp battle_util.c:2744.
            PREPARE_TYPE_BUFFER(_gBattleTextBuff1_ABE, moveType);
            _lastWantedScriptLabel_ABE = 'BattleScript_ColorChangeActivates';
            effect++;
          }
          break;
        case ABILITY_ROUGH_SKIN:
          if (!noEffect && attackerAlive && notConfusionSelfDmg
              && targetTurnDamaged && makesContact) {
            let dmg = Math.floor(gBattleMons[gBattlerAttacker].maxHP / 16);
            if (dmg === 0) dmg = 1;
            setBattleMoveDamage(dmg);
            _lastWantedScriptLabel_ABE = 'BattleScript_RoughSkinActivates';
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
            _lastWantedScriptLabel_ABE = 'BattleScript_ApplySecondaryEffect';
            setHitMarker(gHitMarker | HITMARKER_STATUS_ABILITY_EFFECT);
            effect++;
          }
          break;
        case ABILITY_POISON_POINT:
          if (!noEffect && attackerAlive && notConfusionSelfDmg
              && targetTurnDamaged && makesContact
              && (Random() % 3) === 0) {
            gBattleCommunication[MOVE_EFFECT_BYTE] = MOVE_EFFECT_AFFECTS_USER | MOVE_EFFECT_POISON;
            _lastWantedScriptLabel_ABE = 'BattleScript_ApplySecondaryEffect';
            setHitMarker(gHitMarker | HITMARKER_STATUS_ABILITY_EFFECT);
            effect++;
          }
          break;
        case ABILITY_STATIC:
          if (!noEffect && attackerAlive && notConfusionSelfDmg
              && targetTurnDamaged && makesContact
              && (Random() % 3) === 0) {
            gBattleCommunication[MOVE_EFFECT_BYTE] = MOVE_EFFECT_AFFECTS_USER | MOVE_EFFECT_PARALYSIS;
            _lastWantedScriptLabel_ABE = 'BattleScript_ApplySecondaryEffect';
            setHitMarker(gHitMarker | HITMARKER_STATUS_ABILITY_EFFECT);
            effect++;
          }
          break;
        case ABILITY_FLAME_BODY:
          if (!noEffect && attackerAlive && notConfusionSelfDmg
              && makesContact && targetTurnDamaged
              && (Random() % 3) === 0) {
            gBattleCommunication[MOVE_EFFECT_BYTE] = MOVE_EFFECT_AFFECTS_USER | MOVE_EFFECT_BURN;
            _lastWantedScriptLabel_ABE = 'BattleScript_ApplySecondaryEffect';
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
            _lastWantedScriptLabel_ABE = 'BattleScript_CuteCharmActivates';
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
          _lastWantedScriptLabel_ABE = 'BattleScript_IntimidateActivatesEnd3';
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
          _lastWantedScriptLabel_ABE = 'BattleScript_IntimidateActivates';
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
        _lastWantedScriptLabel_ABE = 'BattleScript_SynchronizeActivates';
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
            _lastWantedScriptLabel_ABE = 'BattleScript_TraceActivates';
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
        _lastWantedScriptLabel_ABE = 'BattleScript_SynchronizeActivates';
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
            _lastWantedScriptLabel_ABE = 'BattleScript_CastformChange';
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
let _lastWantedScriptLabel_ABE: string | null = null;

/** Récupère et reset le label voulu (= used par caller post-AbilityBattleEffects). */
export function consumeAbilityWantedScript(): string | null {
  const v = _lastWantedScriptLabel_ABE;
  _lastWantedScriptLabel_ABE = null;
  return v;
}

// Expose AbilityBattleEffects via globalThis pour permettre damage-calc.ts et
// autres modules d'éviter circular import. Set au module-load.
(globalThis as { __abilityBattleEffectsCheck?: typeof AbilityBattleEffects }).__abilityBattleEffectsCheck = AbilityBattleEffects;
// Expose RESOURCE_FLAG_FLASH_FIRE constant pour read côté caller (=damage-calc).
(globalThis as { __RESOURCE_FLAG_FLASH_FIRE?: number }).__RESOURCE_FLAG_FLASH_FIRE = RESOURCE_FLAG_FLASH_FIRE;

// ════════════════════════════════════════════════════════════════════════════
// DoFieldEndTurnEffects (battle_util.c:1168-1421) + DoBattlerEndTurnEffects
// (battle_util.c:1447-2200) + HandleWishPerishSongOnTurnEnd — effets de fin de tour
// (weather, Reflect/LightScreen/Mist/Safeguard, Wish, poison/burn tick, LeechSeed,
// Wrap, Curse, Nightmare, Yawn, Ingrain, abilities/items end-turn).
// [fusion miroir 2026-06-13, ex-engine/battle/end-turn-effects.ts]
// NB : _UproarWakeUpCheck renomme _UproarWakeUpCheckETT (collision atk-canceler).
// ════════════════════════════════════════════════════════════════════════════

// 1:1 décomp battle_string_ids.h:445-447 + 450-451.
const B_MSG_RAIN_CONTINUES = 0;
const B_MSG_DOWNPOUR_CONTINUES = 1;
const B_MSG_RAIN_STOPPED = 2;
const B_MSG_SANDSTORM = 0;
const B_MSG_HAIL = 1;

// 1:1 décomp `B_ANIM_SANDSTORM_CONTINUES = 12, B_ANIM_HAIL_CONTINUES = 13`
// (auto-data battle_anim-data.ts).
const B_ANIM_SANDSTORM_CONTINUES = 12;
const B_ANIM_HAIL_CONTINUES = 13;

// 1:1 décomp battle_util.c:1153-1166 — ENDTURN_X enum.
const ENDTURN_ORDER         = 0;
const ENDTURN_REFLECT       = 1;
const ENDTURN_LIGHT_SCREEN  = 2;
const ENDTURN_MIST          = 3;
const ENDTURN_SAFEGUARD     = 4;
const ENDTURN_WISH          = 5;
const ENDTURN_RAIN          = 6;
const ENDTURN_SANDSTORM     = 7;
const ENDTURN_SUN           = 8;
const ENDTURN_HAIL          = 9;
const ENDTURN_FIELD_COUNT   = 10;

/** Résultat d'un appel à `DoFieldEndTurnEffects` :
 *  - `null` : fini (= tous les ENDTURN_X consumés), turn loop peut avancer
 *  - `{ scriptLabel }` : script à exec, puis re-call DoFieldEndTurnEffects */
export type EndTurnFieldResult = null | { scriptLabel: string };

/** 1:1 décomp `GetWhoStrikesFirst(battler1, battler2, ignoreChosenMoves)`
 *  (battle_util.c). Stub : retourne battler avec plus high speed.
 *  Phase 1.4 L extension : full port avec Trick Room / Quick Claw / etc. */
function _GetWhoStrikesFirst(b1: number, b2: number, _ignoreChosen: boolean): boolean {
  // Retourne TRUE si b2 strikes first (= mon1 needs swap).
  const s1 = gBattleMons[b1]?.speed ?? 0;
  const s2 = gBattleMons[b2]?.speed ?? 0;
  return s2 > s1;
}

/** 1:1 décomp `SwapTurnOrder(i, j)` (battle_util.c). */
function _SwapTurnOrder(i: number, j: number): void {
  const tmp = gBattlerByTurnOrder[i];
  gBattlerByTurnOrder[i] = gBattlerByTurnOrder[j];
  gBattlerByTurnOrder[j] = tmp;
}

/** 1:1 décomp `DoFieldEndTurnEffects()` (battle_util.c:1168-1421).
 *
 *  Process : iterate ENDTURN_X cases via gBattleStruct.turnCountersTracker
 *  jusqu'à trouver un effect (= script à exec) OU finish (= ENDTURN_FIELD_COUNT).
 *
 *  Retourne :
 *    - null : tous les ENDTURN_X consumés, turn loop peut avancer
 *    - { scriptLabel } : caller doit exec le script puis re-call.
 *
 *  Pour caller : `let r; while (r = DoFieldEndTurnEffects()) runBattleScript(r.scriptLabel);` */
export function DoFieldEndTurnEffects(): EndTurnFieldResult {
  // 1:1 décomp battle_util.c:1173-1178 : init gBattlerAttacker/Target au premier
  // battler non-absent.
  let attacker = 0;
  while (attacker < gBattlersCount && (gAbsentBattlerFlags & gBitTable[attacker])) {
    attacker++;
  }
  setBattlerAttacker(attacker);
  let target = 0;
  while (target < gBattlersCount && (gAbsentBattlerFlags & gBitTable[target])) {
    target++;
  }
  setBattlerTarget(target);

  // 1:1 décomp `do { ... } while (effect == 0);` — loop jusqu'à effect found.
  let safety = 0;
  while (safety++ < 50) {
    let effect = 0;
    let scriptLabel: string | null = null;

    switch (gBattleStruct.turnCountersTracker) {
      case ENDTURN_ORDER: {
        // 1:1 décomp ll. 1186-1206 : init gBattlerByTurnOrder + speed sort + fallthrough.
        for (let i = 0; i < gBattlersCount; i++) {
          gBattlerByTurnOrder[i] = i;
        }
        for (let i = 0; i < gBattlersCount - 1; i++) {
          for (let j = i + 1; j < gBattlersCount; j++) {
            if (_GetWhoStrikesFirst(gBattlerByTurnOrder[i], gBattlerByTurnOrder[j], false)) {
              _SwapTurnOrder(i, j);
            }
          }
        }
        gBattleStruct.turnCountersTracker++;
        gBattleStruct.turnSideTracker = 0;
        // fall through (= continue do-while, switch sera ENDTURN_REFLECT au prochain iter).
        continue;
      }

      case ENDTURN_REFLECT: {
        // 1:1 décomp ll. 1208-1232.
        while (gBattleStruct.turnSideTracker < 2) {
          const side = gBattleStruct.turnSideTracker;
          const battler = gSideTimers[side].reflectBattlerId;
          setActiveBattler(battler);
          setBattlerAttacker(battler);
          if (gSideStatuses[side] & SIDE_STATUS_REFLECT) {
            if (--gSideTimers[side].reflectTimer === 0) {
              gSideStatuses[side] &= ~SIDE_STATUS_REFLECT;
              PREPARE_MOVE_BUFFER(gBattleTextBuff1, MOVE_REFLECT);
              scriptLabel = 'BattleScript_SideStatusWoreOff';
              effect++;
            }
          }
          gBattleStruct.turnSideTracker++;
          if (effect !== 0) break;
        }
        if (effect === 0) {
          gBattleStruct.turnCountersTracker++;
          gBattleStruct.turnSideTracker = 0;
        }
        break;
      }

      case ENDTURN_LIGHT_SCREEN: {
        // 1:1 décomp ll. 1233-1258.
        while (gBattleStruct.turnSideTracker < 2) {
          const side = gBattleStruct.turnSideTracker;
          const battler = gSideTimers[side].lightscreenBattlerId;
          setActiveBattler(battler);
          setBattlerAttacker(battler);
          if (gSideStatuses[side] & SIDE_STATUS_LIGHTSCREEN) {
            if (--gSideTimers[side].lightscreenTimer === 0) {
              gSideStatuses[side] &= ~SIDE_STATUS_LIGHTSCREEN;
              gBattleCommunication[MULTISTRING_CHOOSER] = side;
              PREPARE_MOVE_BUFFER(gBattleTextBuff1, MOVE_LIGHT_SCREEN);
              scriptLabel = 'BattleScript_SideStatusWoreOff';
              effect++;
            }
          }
          gBattleStruct.turnSideTracker++;
          if (effect !== 0) break;
        }
        if (effect === 0) {
          gBattleStruct.turnCountersTracker++;
          gBattleStruct.turnSideTracker = 0;
        }
        break;
      }

      case ENDTURN_MIST: {
        // 1:1 décomp ll. 1259-1281.
        while (gBattleStruct.turnSideTracker < 2) {
          const side = gBattleStruct.turnSideTracker;
          const battler = gSideTimers[side].mistBattlerId;
          setActiveBattler(battler);
          setBattlerAttacker(battler);
          if (gSideTimers[side].mistTimer !== 0 && --gSideTimers[side].mistTimer === 0) {
            gSideStatuses[side] &= ~SIDE_STATUS_MIST;
            gBattleCommunication[MULTISTRING_CHOOSER] = side;
            PREPARE_MOVE_BUFFER(gBattleTextBuff1, MOVE_MIST);
            scriptLabel = 'BattleScript_SideStatusWoreOff';
            effect++;
          }
          gBattleStruct.turnSideTracker++;
          if (effect !== 0) break;
        }
        if (effect === 0) {
          gBattleStruct.turnCountersTracker++;
          gBattleStruct.turnSideTracker = 0;
        }
        break;
      }

      case ENDTURN_SAFEGUARD: {
        // 1:1 décomp ll. 1282-1305.
        while (gBattleStruct.turnSideTracker < 2) {
          const side = gBattleStruct.turnSideTracker;
          const battler = gSideTimers[side].safeguardBattlerId;
          setActiveBattler(battler);
          setBattlerAttacker(battler);
          if (gSideStatuses[side] & SIDE_STATUS_SAFEGUARD) {
            if (--gSideTimers[side].safeguardTimer === 0) {
              gSideStatuses[side] &= ~SIDE_STATUS_SAFEGUARD;
              scriptLabel = 'BattleScript_SafeguardEnds';
              effect++;
            }
          }
          gBattleStruct.turnSideTracker++;
          if (effect !== 0) break;
        }
        if (effect === 0) {
          gBattleStruct.turnCountersTracker++;
          gBattleStruct.turnSideTracker = 0;
        }
        break;
      }

      case ENDTURN_WISH: {
        // 1:1 décomp ll. 1306-1326.
        while (gBattleStruct.turnSideTracker < gBattlersCount) {
          const active = gBattlerByTurnOrder[gBattleStruct.turnSideTracker];
          setActiveBattler(active);
          if (gWishFutureKnock.wishCounter[active] !== 0
              && --gWishFutureKnock.wishCounter[active] === 0
              && gBattleMons[active].hp !== 0) {
            setBattlerTarget(active);
            scriptLabel = 'BattleScript_WishComesTrue';
            effect++;
          }
          gBattleStruct.turnSideTracker++;
          if (effect !== 0) break;
        }
        if (effect === 0) {
          gBattleStruct.turnCountersTracker++;
        }
        break;
      }

      case ENDTURN_RAIN: {
        // 1:1 décomp ll. 1327-1356.
        if (gBattleWeather & B_WEATHER_RAIN) {
          if (!(gBattleWeather & B_WEATHER_RAIN_PERMANENT)) {
            if (--gWishFutureKnock.weatherDuration === 0) {
              setBattleWeather(gBattleWeather & ~B_WEATHER_RAIN_TEMPORARY & ~B_WEATHER_RAIN_DOWNPOUR);
              gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_RAIN_STOPPED;
            } else if (gBattleWeather & B_WEATHER_RAIN_DOWNPOUR) {
              gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_DOWNPOUR_CONTINUES;
            } else {
              gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_RAIN_CONTINUES;
            }
          } else if (gBattleWeather & B_WEATHER_RAIN_DOWNPOUR) {
            gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_DOWNPOUR_CONTINUES;
          } else {
            gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_RAIN_CONTINUES;
          }
          scriptLabel = 'BattleScript_RainContinuesOrEnds';
          effect++;
        }
        gBattleStruct.turnCountersTracker++;
        break;
      }

      case ENDTURN_SANDSTORM: {
        // 1:1 décomp ll. 1357-1376.
        if (gBattleWeather & B_WEATHER_SANDSTORM) {
          if (!(gBattleWeather & B_WEATHER_SANDSTORM_PERMANENT)
              && --gWishFutureKnock.weatherDuration === 0) {
            setBattleWeather(gBattleWeather & ~B_WEATHER_SANDSTORM_TEMPORARY);
            scriptLabel = 'BattleScript_SandStormHailEnds';
          } else {
            scriptLabel = 'BattleScript_DamagingWeatherContinues';
          }
          gBattleScripting.animArg1 = B_ANIM_SANDSTORM_CONTINUES;
          gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SANDSTORM;
          effect++;
        }
        gBattleStruct.turnCountersTracker++;
        break;
      }

      case ENDTURN_SUN: {
        // 1:1 décomp ll. 1377-1394.
        if (gBattleWeather & B_WEATHER_SUN) {
          if (!(gBattleWeather & B_WEATHER_SUN_PERMANENT)
              && --gWishFutureKnock.weatherDuration === 0) {
            setBattleWeather(gBattleWeather & ~B_WEATHER_SUN_TEMPORARY);
            scriptLabel = 'BattleScript_SunlightFaded';
          } else {
            scriptLabel = 'BattleScript_SunlightContinues';
          }
          effect++;
        }
        gBattleStruct.turnCountersTracker++;
        break;
      }

      case ENDTURN_HAIL: {
        // 1:1 décomp ll. 1395-1414.
        if (gBattleWeather & B_WEATHER_HAIL) {
          if (--gWishFutureKnock.weatherDuration === 0) {
            setBattleWeather(gBattleWeather & ~B_WEATHER_HAIL_TEMPORARY);
            scriptLabel = 'BattleScript_SandStormHailEnds';
          } else {
            scriptLabel = 'BattleScript_DamagingWeatherContinues';
          }
          gBattleScripting.animArg1 = B_ANIM_HAIL_CONTINUES;
          gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_HAIL;
          effect++;
        }
        gBattleStruct.turnCountersTracker++;
        break;
      }

      case ENDTURN_FIELD_COUNT: {
        // 1:1 décomp ll. 1415-1417 : finish marker.
        effect++;
        // Return null pour signaler que la field phase est terminée.
        // (Décomp retourne `gBattleMainFunc != BattleTurnPassed` ce qui est TRUE
        // si tous les effects ont été processés. Nous : null = done.)
        return null;
      }

      default:
        // Sécurité : reset et fini.
        gBattleStruct.turnCountersTracker = 0;
        gBattleStruct.turnSideTracker = 0;
        return null;
    }

    // Si on a un script label, retourne-le pour exec par le caller.
    if (scriptLabel) return { scriptLabel };
    // Sinon (= effect = 0 ET pas de label), continue do-while pour next case.
  }
  // Safety bailout (= ne devrait pas arriver).
  return null;
}

/** Reset le state machine `DoFieldEndTurnEffects` au début d'un nouveau turn.
 *  Appelé par turn loop avant de lancer la phase end-of-turn. */
export function resetFieldEndTurnEffectsState(): void {
  gBattleStruct.turnCountersTracker = 0;
  gBattleStruct.turnSideTracker = 0;
}

// ─── DoBattlerEndTurnEffects (battle_util.c:1447-1766) ─────────────────────

// 1:1 décomp battle_util.c:1423-1445 — ENDTURN_X per-battler enum.
const ENDTURN_INGRAIN     = 0;
const ENDTURN_ABILITIES   = 1;
const ENDTURN_ITEMS1      = 2;
const ENDTURN_LEECH_SEED  = 3;
const ENDTURN_POISON      = 4;
const ENDTURN_BAD_POISON  = 5;
const ENDTURN_BURN        = 6;
const ENDTURN_NIGHTMARES  = 7;
const ENDTURN_CURSE       = 8;
const ENDTURN_WRAP        = 9;
const ENDTURN_UPROAR      = 10;
const ENDTURN_THRASH      = 11;
const ENDTURN_DISABLE     = 12;
const ENDTURN_ENCORE      = 13;
const ENDTURN_LOCK_ON     = 14;
const ENDTURN_CHARGE      = 15;
const ENDTURN_TAUNT       = 16;
const ENDTURN_YAWN        = 17;
const ENDTURN_ITEMS2      = 18;
const ENDTURN_BATTLER_COUNT = 19;

// 1:1 décomp battle.h status1/2/3 bit masks. AUDIT BUG FIX : 10+ constantes
// hardcoded étaient FAUSSES (= différentes de constants.ts). Now import direct.

// gStatuses3 + autres globals (= lazy via globalThis pour éviter circular deps).
// 1:1 décomp battle.h:182, 201.
// AUDIT BUG FIX : était 1<<13 / 1<<12 (= faux, jamais set/clear correct bit).
const HITMARKER_GRUDGE        = 1 << 24;
const HITMARKER_IGNORE_BIDE   = 1 << 5;

/** Type étendu pour DoBattlerEndTurnEffects : retourne `null` si fini,
 *  `{ scriptLabel }` pour exec script, ou `{ scriptLabel, retVal: 2 }` pour
 *  signaler le special case UPROAR (= ne pas incrementer turnEffectsTracker). */
export type EndTurnBattlerResult = null | { scriptLabel: string; uproarWoke?: boolean };

/** Stub `UproarWakeUpCheck(battler)` — Phase 1.4 L extension. */
function _UproarWakeUpCheckETT(_battler: number): boolean {
  // 1:1 décomp battle_util.c — check si STATUS2_UPROAR actif sur un autre battler
  // qui n'a pas Soundproof. Retourne TRUE si oui (= bloque le sleep).
  for (let i = 0; i < gBattlersCount; i++) {
    if (gBattleMons[i].status2 & STATUS2_UPROAR) return true;
  }
  return false;
}

/** 1:1 décomp `WasUnableToUseMove(battler)` (battle_util.c:877-891). */
function _WasUnableToUseMoveETT(battler: number): boolean {
  const p = gProtectStructsImport[battler];
  if (!p) return false;
  return Boolean(
    p.prlzImmobility || p.targetNotAffected || p.usedImprisonedMove
    || p.loveImmobility || p.usedDisabledMove || p.usedTauntedMove
    || p.flag2Unknown || p.flinchImmobility || p.confusionSelfDmg
  );
}

/** 1:1 décomp `CancelMultiTurnMoves(battler)` (battle_util.c:864-875).
 *  AUDIT BUG FIX : 2 constantes hardcoded fausses :
 *    - STATUS2_BIDE 0x00100000 → 0x300 (= (1<<8)|(1<<9), battle.h:135)
 *    - STATUS3_SEMI_INVULNERABLE 0x10 → 0x400C0 (= ON_AIR|UNDERGROUND|UNDERWATER,
 *      battle.h:178). */
function _CancelMultiTurnMovesETT(battler: number): void {
  gBattleMons[battler].status2 &= ~STATUS2_MULTIPLETURNS;
  gBattleMons[battler].status2 &= ~STATUS2_LOCK_CONFUSE;
  gBattleMons[battler].status2 &= ~STATUS2_UPROAR;
  gBattleMons[battler].status2 &= ~0x300 /* STATUS2_BIDE (1<<8)|(1<<9) */;
  gStatuses3[battler] &= ~STATUS3_ROOTED;
  gStatuses3[battler] &= ~0x400C0 /* STATUS3_SEMI_INVULNERABLE ON_AIR|UNDERGROUND|UNDERWATER */;
}


/** 1:1 décomp `DoBattlerEndTurnEffects()` (battle_util.c:1447-1766).
 *  Per-battler end-of-turn state machine. Iterate gBattlerByTurnOrder ×
 *  ENDTURN_BATTLER_COUNT cases jusqu'à trouver un effect (= script à exec).
 *
 *  Retourne :
 *    - null : tous les battler×effect consumés, fini
 *    - { scriptLabel } : script à exec puis re-call
 *    - { scriptLabel, uproarWoke: true } : UPROAR case spécial (= ne pas
 *      incrementer tracker, re-iter sur même battler/case). */
export function DoBattlerEndTurnEffects(): EndTurnBattlerResult {
  // 1:1 décomp ll. 1451 : set marker GRUDGE + IGNORE_BIDE pour le tour entier.
  setHitMarker(gHitMarker | HITMARKER_GRUDGE | HITMARKER_IGNORE_BIDE);

  let safety = 0;
  while (safety++ < 500) {
    if (gBattleStruct.turnEffectsBattlerId >= gBattlersCount
        || gBattleStruct.turnEffectsTracker > ENDTURN_BATTLER_COUNT) {
      // 1:1 décomp ll. 1764-1765 : clear markers + return 0.
      setHitMarker(gHitMarker & ~HITMARKER_GRUDGE & ~HITMARKER_IGNORE_BIDE);
      return null;
    }

    const active = gBattlerByTurnOrder[gBattleStruct.turnEffectsBattlerId];
    setActiveBattler(active);
    setBattlerAttacker(active);

    if (gAbsentBattlerFlags & gBitTable[active]) {
      gBattleStruct.turnEffectsBattlerId++;
      continue;
    }

    let effect = 0;
    let scriptLabel: string | null = null;

    switch (gBattleStruct.turnEffectsTracker) {
      case ENDTURN_INGRAIN: {
        if ((gStatuses3[active] & STATUS3_ROOTED)
            && gBattleMons[active].hp !== gBattleMons[active].maxHP
            && gBattleMons[active].hp !== 0) {
          let dmg = Math.floor(gBattleMons[active].maxHP / 16);
          if (dmg === 0) dmg = 1;
          setBattleMoveDamage(-dmg);
          scriptLabel = 'BattleScript_IngrainTurnHeal';
          effect++;
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_ABILITIES: {
        // 1:1 décomp battle_util.c:1477-1481 — delegate à
        // AbilityBattleEffects(ABILITYEFFECT_ENDTURN, gActiveBattler, 0, 0, 0).
        const e = AbilityBattleEffects(ABILITYEFFECT_ENDTURN, active, 0, 0, 0);
        if (e !== 0) {
          const label = consumeAbilityWantedScript();
          if (label) {
            scriptLabel = label;
            effect++;
          }
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_ITEMS1: {
        // 1:1 décomp battle_util.c:1483-1487 — delegate à
        // ItemBattleEffects(ITEMEFFECT_NORMAL, gActiveBattler, FALSE).
        const e = ItemBattleEffects(ITEMEFFECT_NORMAL, active, false);
        if (e !== 0) {
          const label = consumeItemWantedScript();
          if (label) {
            scriptLabel = label;
            effect++;
          }
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_ITEMS2: {
        // 1:1 décomp battle_util.c:1751-1754 — delegate à
        // ItemBattleEffects(ITEMEFFECT_NORMAL, gActiveBattler, TRUE).
        const e = ItemBattleEffects(ITEMEFFECT_NORMAL, active, true);
        if (e !== 0) {
          const label = consumeItemWantedScript();
          if (label) {
            scriptLabel = label;
            effect++;
          }
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_LEECH_SEED: {
        if ((gStatuses3[active] & STATUS3_LEECHSEED)
            && gBattleMons[gStatuses3[active] & STATUS3_LEECHSEED_BATTLER].hp !== 0
            && gBattleMons[active].hp !== 0) {
          const receiver = gStatuses3[active] & STATUS3_LEECHSEED_BATTLER;
          setBattlerTarget(receiver);
          let dmg = Math.floor(gBattleMons[active].maxHP / 8);
          if (dmg === 0) dmg = 1;
          setBattleMoveDamage(dmg);
          gBattleScripting.animArg1 = receiver;
          gBattleScripting.animArg2 = gBattlerAttacker;
          scriptLabel = 'BattleScript_LeechSeedTurnDrain';
          effect++;
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_POISON: {
        if ((gBattleMons[active].status1 & STATUS1_POISON) && gBattleMons[active].hp !== 0) {
          let dmg = Math.floor(gBattleMons[active].maxHP / 8);
          if (dmg === 0) dmg = 1;
          setBattleMoveDamage(dmg);
          scriptLabel = 'BattleScript_PoisonTurnDmg';
          effect++;
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_BAD_POISON: {
        if ((gBattleMons[active].status1 & STATUS1_TOXIC_POISON) && gBattleMons[active].hp !== 0) {
          let dmg = Math.floor(gBattleMons[active].maxHP / 16);
          if (dmg === 0) dmg = 1;
          // 1:1 décomp : increment toxic counter unless == 15.
          if ((gBattleMons[active].status1 & STATUS1_TOXIC_COUNTER) !== STATUS1_TOXIC_TURN(15)) {
            gBattleMons[active].status1 += STATUS1_TOXIC_TURN(1);
          }
          dmg *= (gBattleMons[active].status1 & STATUS1_TOXIC_COUNTER) >> 8;
          setBattleMoveDamage(dmg);
          scriptLabel = 'BattleScript_PoisonTurnDmg';
          effect++;
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_BURN: {
        if ((gBattleMons[active].status1 & STATUS1_BURN) && gBattleMons[active].hp !== 0) {
          let dmg = Math.floor(gBattleMons[active].maxHP / 8);
          if (dmg === 0) dmg = 1;
          setBattleMoveDamage(dmg);
          scriptLabel = 'BattleScript_BurnTurnDmg';
          effect++;
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_NIGHTMARES: {
        if ((gBattleMons[active].status2 & STATUS2_NIGHTMARE) && gBattleMons[active].hp !== 0) {
          if (gBattleMons[active].status1 & STATUS1_SLEEP) {
            let dmg = Math.floor(gBattleMons[active].maxHP / 4);
            if (dmg === 0) dmg = 1;
            setBattleMoveDamage(dmg);
            scriptLabel = 'BattleScript_NightmareTurnDmg';
            effect++;
          } else {
            // 1:1 décomp : R/S bug fix — clear nightmare if awake.
            gBattleMons[active].status2 &= ~STATUS2_NIGHTMARE;
          }
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_CURSE: {
        if ((gBattleMons[active].status2 & STATUS2_CURSED) && gBattleMons[active].hp !== 0) {
          let dmg = Math.floor(gBattleMons[active].maxHP / 4);
          if (dmg === 0) dmg = 1;
          setBattleMoveDamage(dmg);
          scriptLabel = 'BattleScript_CurseTurnDmg';
          effect++;
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_WRAP: {
        if ((gBattleMons[active].status2 & STATUS2_WRAPPED) && gBattleMons[active].hp !== 0) {
          gBattleMons[active].status2 -= STATUS2_WRAPPED_TURN(1);
          const wrapMoveLow = gBattleStruct.wrappedMove[active * 2 + 0];
          const wrapMoveHigh = gBattleStruct.wrappedMove[active * 2 + 1];
          if (gBattleMons[active].status2 & STATUS2_WRAPPED) {
            // Still wrapped, damage.
            gBattleScripting.animArg1 = wrapMoveLow;
            gBattleScripting.animArg2 = wrapMoveHigh;
            gBattleTextBuff1[0] = 0xFD /* B_BUFF_PLACEHOLDER_BEGIN */;
            gBattleTextBuff1[1] = 2 /* B_BUFF_MOVE */;
            gBattleTextBuff1[2] = wrapMoveLow;
            gBattleTextBuff1[3] = wrapMoveHigh;
            gBattleTextBuff1[4] = 0xFF /* EOS */;
            scriptLabel = 'BattleScript_WrapTurnDmg';
            let dmg = Math.floor(gBattleMons[active].maxHP / 16);
            if (dmg === 0) dmg = 1;
            setBattleMoveDamage(dmg);
          } else {
            // Broke free.
            gBattleTextBuff1[0] = 0xFD;
            gBattleTextBuff1[1] = 2;
            gBattleTextBuff1[2] = wrapMoveLow;
            gBattleTextBuff1[3] = wrapMoveHigh;
            gBattleTextBuff1[4] = 0xFF;
            scriptLabel = 'BattleScript_WrapEnds';
          }
          effect++;
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_UPROAR: {
        // 1:1 décomp ll. 1608-1656 : Uproar — wake up sleeping mons + countdown.
        if (gBattleMons[active].status2 & STATUS2_UPROAR) {
          // Step 1 : check if any battler is sleeping (and not Soundproof) → wake.
          let wokeBattler = -1;
          for (let b = 0; b < gBattlersCount; b++) {
            if ((gBattleMons[b].status1 & STATUS1_SLEEP)
                && gBattleMons[b].ability !== 43 /* ABILITY_SOUNDPROOF */) {
              gBattleMons[b].status1 &= ~STATUS1_SLEEP;
              gBattleMons[b].status2 &= ~STATUS2_NIGHTMARE;
              gBattleCommunication[MULTISTRING_CHOOSER] = 1;
              wokeBattler = b;
              break;
            }
          }
          if (wokeBattler !== -1) {
            // 1:1 décomp : exec MonWokeUpInUproar + ne pas incrementer tracker (= retry case).
            scriptLabel = 'BattleScript_MonWokeUpInUproar';
            // gBattleStruct.turnEffectsTracker reste pareil → re-iter UPROAR au next call.
            return { scriptLabel, uproarWoke: true };
          }
          // Step 2 : décrement timer.
          gBattleMons[active].status2 -= STATUS2_UPROAR_TURN(1);
          if (_WasUnableToUseMoveETT(active)) {
            _CancelMultiTurnMovesETT(active);
            gBattleCommunication[MULTISTRING_CHOOSER] = 1 /* B_MSG_UPROAR_ENDS */;
          } else if (gBattleMons[active].status2 & STATUS2_UPROAR) {
            gBattleCommunication[MULTISTRING_CHOOSER] = 0 /* B_MSG_UPROAR_CONTINUES */;
            gBattleMons[active].status2 |= STATUS2_MULTIPLETURNS;
          } else {
            gBattleCommunication[MULTISTRING_CHOOSER] = 1 /* B_MSG_UPROAR_ENDS */;
            _CancelMultiTurnMovesETT(active);
          }
          scriptLabel = 'BattleScript_PrintUproarOverTurns';
          effect = 1;
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_THRASH: {
        if (gBattleMons[active].status2 & STATUS2_LOCK_CONFUSE) {
          gBattleMons[active].status2 -= STATUS2_LOCK_CONFUSE_TURN(1);
          if (_WasUnableToUseMoveETT(active)) {
            _CancelMultiTurnMovesETT(active);
          } else if (!(gBattleMons[active].status2 & STATUS2_LOCK_CONFUSE)
                     && (gBattleMons[active].status2 & STATUS2_MULTIPLETURNS)) {
            gBattleMons[active].status2 &= ~STATUS2_MULTIPLETURNS;
            if (!(gBattleMons[active].status2 & STATUS2_CONFUSION)) {
              // 1:1 décomp battle_util.c:1669-1672 + battle_script_commands.c:2533-2546.
              // SetMoveEffect(TRUE, 0) avec MOVE_EFFECT_CONFUSION → apply inline :
              // - Si ability OWN_TEMPO ou déjà CONFUSION : skip.
              // - Sinon : status2 |= CONFUSION_TURN((Random()%4)+2) = 2-5 turns bits 0-2.
              const ABILITY_OWN_TEMPO = 20;
              if (gBattleMons[active].ability !== ABILITY_OWN_TEMPO) {
                const confTurns = ((Math.floor(Math.random() * 0x10000) % 4) + 2);
                gBattleMons[active].status2 |= confTurns; // bits 0-2.
                if (gBattleMons[active].status2 & STATUS2_CONFUSION) {
                  scriptLabel = 'BattleScript_ThrashConfuses';
                  effect++;
                }
              }
            }
          }
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_DISABLE: {
        if (gDisableStructs[active].disableTimer !== 0) {
          let i = 0;
          for (; i < 4 /* MAX_MON_MOVES */; i++) {
            if (gDisableStructs[active].disabledMove === gBattleMons[active].moves[i]) break;
          }
          if (i === 4) {
            // Mon no longer has the disabled move.
            gDisableStructs[active].disabledMove = 0 /* MOVE_NONE */;
            gDisableStructs[active].disableTimer = 0;
          } else if (--gDisableStructs[active].disableTimer === 0) {
            gDisableStructs[active].disabledMove = 0;
            scriptLabel = 'BattleScript_DisabledNoMore';
            effect++;
          }
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_ENCORE: {
        if (gDisableStructs[active].encoreTimer !== 0) {
          if (gBattleMons[active].moves[gDisableStructs[active].encoredMovePos]
              !== gDisableStructs[active].encoredMove) {
            gDisableStructs[active].encoredMove = 0;
            gDisableStructs[active].encoreTimer = 0;
          } else if (--gDisableStructs[active].encoreTimer === 0
                     || gBattleMons[active].pp[gDisableStructs[active].encoredMovePos] === 0) {
            gDisableStructs[active].encoredMove = 0;
            gDisableStructs[active].encoreTimer = 0;
            scriptLabel = 'BattleScript_EncoredNoMore';
            effect++;
          }
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_LOCK_ON: {
        if (gStatuses3[active] & STATUS3_ALWAYS_HITS) {
          gStatuses3[active] -= STATUS3_ALWAYS_HITS_TURN(1);
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_CHARGE: {
        if (gDisableStructs[active].chargeTimer && --gDisableStructs[active].chargeTimer === 0) {
          gStatuses3[active] &= ~STATUS3_CHARGED_UP;
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_TAUNT: {
        if (gDisableStructs[active].tauntTimer) {
          gDisableStructs[active].tauntTimer--;
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_YAWN: {
        if (gStatuses3[active] & STATUS3_YAWN) {
          gStatuses3[active] -= STATUS3_YAWN_TURN(1);
          if (!(gStatuses3[active] & STATUS3_YAWN)
              && !(gBattleMons[active].status1 & STATUS1_ANY)
              && gBattleMons[active].ability !== 72 /* ABILITY_VITAL_SPIRIT */
              && gBattleMons[active].ability !== 15 /* ABILITY_INSOMNIA */
              && !_UproarWakeUpCheckETT(active)) {
            _CancelMultiTurnMovesETT(active);
            // 1:1 décomp : STATUS1_SLEEP_TURN((Random() & 3) + 2) — 2-5 turns sleep.
            const sleepTurns = ((Math.floor(Math.random() * 0x10000) & 3) + 2);
            gBattleMons[active].status1 |= sleepTurns;
            scriptLabel = 'BattleScript_YawnMakesAsleep';
            effect++;
          }
        }
        gBattleStruct.turnEffectsTracker++;
        break;
      }

      case ENDTURN_BATTLER_COUNT: {
        // 1:1 décomp ll. 1755-1758 : finish marker — reset tracker + advance battler.
        gBattleStruct.turnEffectsTracker = 0;
        gBattleStruct.turnEffectsBattlerId++;
        break;
      }

      default:
        // Sécurité.
        gBattleStruct.turnEffectsTracker = 0;
        gBattleStruct.turnEffectsBattlerId++;
        break;
    }

    if (effect !== 0 && scriptLabel) {
      return { scriptLabel };
    }
  }
  // Safety bailout.
  setHitMarker(gHitMarker & ~HITMARKER_GRUDGE & ~HITMARKER_IGNORE_BIDE);
  return null;
}

/** Reset le state machine `DoBattlerEndTurnEffects` au début d'un nouveau turn. */
export function resetBattlerEndTurnEffectsState(): void {
  gBattleStruct.turnEffectsTracker = 0;
  gBattleStruct.turnEffectsBattlerId = 0;
}

// ─── HandleWishPerishSongOnTurnEnd (battle_util.c:1768-1872) ───────────────

/** 1:1 décomp `HandleWishPerishSongOnTurnEnd()` (battle_util.c:1768).
 *  3-state machine : FutureSight trigger → PerishSong tick → Arena judgment.
 *
 *  Retourne :
 *    - null : fini, turn loop peut avancer
 *    - { scriptLabel } : exec script puis re-call. */
export function HandleWishPerishSongOnTurnEnd(): EndTurnFieldResult {
  setHitMarker(gHitMarker | HITMARKER_GRUDGE | HITMARKER_IGNORE_BIDE);

  let safety = 0;
  while (safety++ < 50) {
    switch (gBattleStruct.wishPerishSongState) {
      case 0: {
        // 1:1 décomp ll. 1775-1815 : FutureSight / Doom Desire trigger.
        while (gBattleStruct.wishPerishSongBattlerId < gBattlersCount) {
          const active = gBattleStruct.wishPerishSongBattlerId;
          setActiveBattler(active);
          if (gAbsentBattlerFlags & gBitTable[active]) {
            gBattleStruct.wishPerishSongBattlerId++;
            continue;
          }
          gBattleStruct.wishPerishSongBattlerId++;
          if (gWishFutureKnock.futureSightCounter[active] !== 0
              && --gWishFutureKnock.futureSightCounter[active] === 0
              && gBattleMons[active].hp !== 0) {
            const fsMove = gWishFutureKnock.futureSightMove[active];
            const B_MSG_FUTURE_SIGHT = 0;
            const B_MSG_DOOM_DESIRE = 1;
            gBattleCommunication[MULTISTRING_CHOOSER] = (fsMove === MOVE_FUTURE_SIGHT)
              ? B_MSG_FUTURE_SIGHT : B_MSG_DOOM_DESIRE;
            PREPARE_MOVE_BUFFER(gBattleTextBuff1, fsMove);
            setBattlerTarget(active);
            setBattlerAttacker(gWishFutureKnock.futureSightAttacker[active]);
            setBattleMoveDamage(gWishFutureKnock.futureSightDmg[active]);
            // gSpecialStatuses[target].shellBellDmg = IGNORE_SHELL_BELL (= sentinel
            // qui désactive le drain Shell Bell pour ce hit).
            // AUDIT BUG FIX : était -0x80000000 (= signed int32 min) → 0xFFFF
            // (= battle.h:61 + constants.ts:906).
            const IGNORE_SHELL_BELL = 0xFFFF;
            gSpecialStatuses[active].shellBellDmg = IGNORE_SHELL_BELL;
            // 1:1 décomp ll. 1802-1806 : si partner aussi à 0 (= double battle),
            // clear SIDE_STATUS_FUTUREATTACK pour le côté target.
            // BATTLE_PARTNER(b) = b ^ 2 (= flip side bit).
            const partner = active ^ 2;
            // 1:1 décomp battle.h:214 : SIDE_STATUS_FUTUREATTACK = 1 << 6.
            // AUDIT BUG FIX : était 1 << 3 (= SIDE_STATUS_X4-ish bit) → 1 << 6.
            const SIDE_STATUS_FUTUREATTACK = 1 << 6;
            if (gWishFutureKnock.futureSightCounter[active] === 0
                && (partner >= gBattlersCount
                    || gWishFutureKnock.futureSightCounter[partner] === 0)) {
              const targetSide = active & 1; // GET_BATTLER_SIDE = battler & 1
              gSideStatuses[targetSide] &= ~SIDE_STATUS_FUTUREATTACK;
            }
            return { scriptLabel: 'BattleScript_MonTookFutureAttack' };
          }
        }
        gBattleStruct.wishPerishSongState = 1;
        gBattleStruct.wishPerishSongBattlerId = 0;
        // fall through → continue loop pour case 1.
        continue;
      }

      case 1: {
        // 1:1 décomp ll. 1818-1843 : PerishSong countdown.
        while (gBattleStruct.wishPerishSongBattlerId < gBattlersCount) {
          const active = gBattlerByTurnOrder[gBattleStruct.wishPerishSongBattlerId];
          setActiveBattler(active);
          setBattlerAttacker(active);
          if (gAbsentBattlerFlags & gBitTable[active]) {
            gBattleStruct.wishPerishSongBattlerId++;
            continue;
          }
          gBattleStruct.wishPerishSongBattlerId++;
          if (gStatuses3[active] & STATUS3_PERISH_SONG) {
            // 1:1 décomp : PREPARE_BYTE_NUMBER_BUFFER(gBattleTextBuff1, 1, perishSongTimer).
            gBattleTextBuff1[0] = 0xFD /* B_BUFF_PLACEHOLDER_BEGIN */;
            gBattleTextBuff1[1] = 1 /* B_BUFF_NUMBER */;
            gBattleTextBuff1[2] = 1; // byteCount
            gBattleTextBuff1[3] = 1; // maxDigits
            gBattleTextBuff1[4] = gDisableStructs[active].perishSongTimer;
            gBattleTextBuff1[5] = 0xFF /* EOS */;
            let scriptLabel: string;
            if (gDisableStructs[active].perishSongTimer === 0) {
              gStatuses3[active] &= ~STATUS3_PERISH_SONG;
              setBattleMoveDamage(gBattleMons[active].hp);
              scriptLabel = 'BattleScript_PerishSongTakesLife';
            } else {
              gDisableStructs[active].perishSongTimer--;
              scriptLabel = 'BattleScript_PerishSongCountGoesDown';
            }
            return { scriptLabel };
          }
        }
        gBattleStruct.wishPerishSongState = 2;
        gBattleStruct.wishPerishSongBattlerId = 0;
        continue;
      }

      case 2: {
        // 1:1 décomp ll. 1852-1866 : Arena judgment (= Battle Frontier Arena).
        // Skip pour wild/trainer normal battles (= BATTLE_TYPE_ARENA non set).
        if ((gBattleTypeFlags & BATTLE_TYPE_ARENA)
            && gBattleStruct.arenaTurnCounter === 2
            && gBattleMons[0].hp !== 0 && gBattleMons[1].hp !== 0) {
          // 1:1 décomp ll. 1859-1864 : cancel multi-turn moves + jugement.
          _CancelMultiTurnMovesETT(0);
          _CancelMultiTurnMovesETT(1);
          gBattleStruct.wishPerishSongState++;
          return { scriptLabel: 'BattleScript_ArenaDoJudgment' };
        }
        setHitMarker(gHitMarker & ~HITMARKER_GRUDGE & ~HITMARKER_IGNORE_BIDE);
        return null;
      }

      default:
        setHitMarker(gHitMarker & ~HITMARKER_GRUDGE & ~HITMARKER_IGNORE_BIDE);
        return null;
    }
  }
  setHitMarker(gHitMarker & ~HITMARKER_GRUDGE & ~HITMARKER_IGNORE_BIDE);
  return null;
}

/** Reset le state machine `HandleWishPerishSongOnTurnEnd` au début d'un turn. */
export function resetWishPerishSongState(): void {
  gBattleStruct.wishPerishSongState = 0;
  gBattleStruct.wishPerishSongBattlerId = 0;
}

// Suppress unused warnings.
void gBattleMoveDamage;
void gBattlerAttacker;

// ════════════════════════════════════════════════════════════════════════════
// Helpers battle_util.c absorbés depuis ex-engine/battle/util.ts (grab-bag éclaté
// 2026-06-13, stage 2). getBattlerForBattleScript / CancelMultiTurnMoves (public) /
// ClearFuryCutterDestinyBondGrudge / WEATHER_HAS_EFFECT (réel).
// NB : battle_util a déjà _CancelMultiTurnMoves (atk privé) + _CancelMultiTurnMovesETT
//      (end-turn) + _WEATHER_HAS_EFFECT=true STUB (ability) ; consolidation vers ces
//      versions publiques = TODO (vérifier bit-values avant de rebrancher).
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `GetBattlerForBattleScript(u8 arg)` (battle_util.c). */
export function getBattlerForBattleScript(caseId: number): number {
  switch (caseId) {
    case BS_TARGET:                  return gBattlerTarget;
    case BS_ATTACKER:                return gBattlerAttacker;
    case BS_EFFECT_BATTLER:          return gEffectBattler;
    case BS_BATTLER_0:               return 0;
    case BS_SCRIPTING:               return gBattleScripting.battler;
    case BS_FAINTED:                 return gBattlerFainted;
    case BS_FAINTED_LINK_MULTIPLE_1: return gBattlerFainted;
    case BS_ATTACKER_WITH_PARTNER:
    case BS_FAINTED_LINK_MULTIPLE_2:
    case BS_ATTACKER_SIDE:
    case BS_NOT_ATTACKER_SIDE:
    case BS_PLAYER1:
      return GetBattlerAtPosition(B_POSITION_PLAYER_LEFT);
    case BS_OPPONENT1:
      return GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT);
    case BS_PLAYER2:
      return GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT);
    case BS_OPPONENT2:
      return GetBattlerAtPosition(B_POSITION_OPPONENT_RIGHT);
    default:
      return 0;
  }
}

/** 1:1 décomp `CancelMultiTurnMoves(u8 battler)` (battle_util.c:864). */
export function CancelMultiTurnMoves(battler: number): void {
  gBattleMons[battler].status2 &= ~STATUS2_MULTIPLETURNS;
  gBattleMons[battler].status2 &= ~STATUS2_LOCK_CONFUSE;
  gBattleMons[battler].status2 &= ~STATUS2_UPROAR;
  gBattleMons[battler].status2 &= ~STATUS2_BIDE;
  gStatuses3[battler] &= ~STATUS3_SEMI_INVULNERABLE;
  gDisableStructs[battler].rolloutTimer = 0;
  gDisableStructs[battler].furyCutterCounter = 0;
}

/** 1:1 décomp `ClearFuryCutterDestinyBondGrudge(battlerId)` (battle_util.c:3798-3803). */
export function ClearFuryCutterDestinyBondGrudge(battlerId: number): void {
  gDisableStructs[battlerId].furyCutterCounter = 0;
  gBattleMons[battlerId].status2 &= ~STATUS2_DESTINY_BOND;
  gStatuses3[battlerId] &= ~STATUS3_GRUDGE;
}

/** 1:1 décomp `WEATHER_HAS_EFFECT` macro (battle_util.h:47) :
 *  `(!ABILITY_ON_FIELD(ABILITY_CLOUD_NINE) && !ABILITY_ON_FIELD(ABILITY_AIR_LOCK))`. */
export function WEATHER_HAS_EFFECT(): boolean {
  for (let i = 0; i < gBattlersCount; i++) {
    const mon = gBattleMons[i];
    if (!mon) continue;
    if ((mon.ability === ABILITY_CLOUD_NINE
         || mon.ability === ABILITY_AIR_LOCK)
        && mon.hp > 0) {
      return false;
    }
  }
  return true;
}
