/**
 * game/battle_ai_script_commands.ts — MIROIR 1:1 de `src/battle_ai_script_commands.c`
 * (~2297 lignes ; ex-src/engine/battle/ai/ai-script-commands.ts, relocalisé dans le
 * miroir game/ le 2026-06-13). Interpréteur des scripts AI + framework de scoring.
 *
 * Source de vérité :
 *   - D:/Projet 1/decomps/pokeemeraude/src/battle_ai_script_commands.c
 *   - D:/Projet 1/decomps/pokeemeraude/src/battle_main.c (GetWhoStrikesFirst)
 *   - D:/Projet 1/decomps/pokeemeraude/include/battle.h (structs)
 *
 * Le bytecode AI est exécuté via `gAIScriptPtr` (offset dans BYTECODE).
 * `sBattleAICmdTable[*gAIScriptPtr]()` dispatch ; chaque Cmd_* lit ses args
 * RELATIVEMENT à gAIScriptPtr (aiByteAt/aiRead16/aiRead32/aiReadPtr) et
 * avance manuellement (setAiScriptPtr). T1_READ_PTR = u32 LE = offset absolu.
 */

import { Random } from './random';
import { resolveDecompConstant } from '../harness/runtime/decomp-constants';
import {
  gBattleMons,
  gBattlerTarget,
  setBattlerTarget,
  gActiveBattler,
  gAbsentBattlerFlags,
  gBattleTypeFlags,
  gCurrentMove,
  setCurrentMove,
  gLastMoves,
  gStatuses3,
  gSideStatuses,
  gDisableStructs,
  gBattleWeather,
  gBattleStruct,
  gBattleScripting,
  setMoveResultFlags,
  setCritMultiplier,
  setDynamicBasePower,
  gBattleMoveDamage,
  setBattleMoveDamage,
  gProtectStructs,
  gBattleResults,
  gChosenActionByBattler,
  gTrainerBattleOpponent_A,
  gTrainerBattleOpponent_B,
  gBattleResourcesFlags,
  gRandomTurnNumber,
  gBattlerPartyIndexes,
  MAX_BATTLERS_COUNT,
} from './engine/battle/state';
// Constantes numériques AI auto-extraites 1:1 (constants/battle_ai.h) — source des
// re-exports AI_TARGET/etc. définis en bas de fichier (SPLIT ai-state, 2026-06-13).
import {
  AI_TARGET as _AI_TARGET,
  AI_USER as _AI_USER,
  AI_TARGET_PARTNER as _AI_TARGET_PARTNER,
  AI_USER_PARTNER as _AI_USER_PARTNER,
  AI_TYPE1_TARGET as _AI_TYPE1_TARGET,
  AI_TYPE1_USER as _AI_TYPE1_USER,
  AI_TYPE2_TARGET as _AI_TYPE2_TARGET,
  AI_TYPE2_USER as _AI_TYPE2_USER,
  AI_TYPE_MOVE as _AI_TYPE_MOVE,
  AI_EFFECTIVENESS_x4 as _AI_EFF_x4,
  AI_EFFECTIVENESS_x2 as _AI_EFF_x2,
  AI_EFFECTIVENESS_x1 as _AI_EFF_x1,
  AI_EFFECTIVENESS_x0_5 as _AI_EFF_x0_5,
  AI_EFFECTIVENESS_x0_25 as _AI_EFF_x0_25,
  AI_EFFECTIVENESS_x0 as _AI_EFF_x0,
  AI_WEATHER_SUN as _AI_WEATHER_SUN,
  AI_WEATHER_RAIN as _AI_WEATHER_RAIN,
  AI_WEATHER_SANDSTORM as _AI_WEATHER_SANDSTORM,
  AI_WEATHER_HAIL as _AI_WEATHER_HAIL,
  MOVE_POWER_OTHER as _MOVE_POWER_OTHER,
  MOVE_NOT_MOST_POWERFUL as _MOVE_NOT_MOST_POWERFUL,
  MOVE_MOST_POWERFUL as _MOVE_MOST_POWERFUL,
} from '../include/constants/battle_ai';
import {
  gAIScriptPtr,
  setAiScriptPtr,
  getAiScriptsTableEntry,
  aiByteAt,
  aiByteAtAddr,
  aiRead16,
  aiRead16AtAddr,
  aiRead32,
  aiReadPtr,
} from './engine/battle/ai/ai-state';
import { TypeCalc, AI_CalcDmg } from './battle_script_commands';
import { getBattleMove } from './data/battle_moves';
import { GetItemHoldEffect, GetItemHoldEffectParam } from './item';
import {
  HOLD_EFFECT_MACHO_BRACE,
  HOLD_EFFECT_QUICK_CLAW,
} from '../include/constants/hold_effects';
import {
  gPlayerParty,
  gEnemyParty,
  GetMonData,
  GetAbilityBySpecies,
  MON_DATA_HP,
  MON_DATA_SPECIES,
  MON_DATA_SPECIES_OR_EGG,
  MON_DATA_STATUS,
  PARTY_SIZE,
} from './engine/battle/party-storage';
import {
  SPECIES_NONE,
  SPECIES_EGG,
} from '../include/constants/species';
import {
  EFFECT_EXPLOSION,
  EFFECT_DREAM_EATER,
  EFFECT_RAZOR_WIND,
  EFFECT_SKY_ATTACK,
  EFFECT_RECHARGE,
  EFFECT_SKULL_BASH,
  EFFECT_SOLAR_BEAM,
  EFFECT_SPIT_UP,
  EFFECT_FOCUS_PUNCH,
  EFFECT_SUPERPOWER,
  EFFECT_ERUPTION,
  EFFECT_OVERHEAT,
} from '../include/constants/battle_move_effects';
import { gBitTable } from './battle_controllers';
import { GetBattlerPosition, GetBattlerAtPosition } from './engine/battle/util';
import { FlagGet } from './engine/script/script-vars';
import { GetGenderFromSpeciesAndPersonality } from '../include/pokemon';
import { gStatStageRatios } from '../include/pokemon';
import { CheckMoveLimitations } from './battle_util';
import {
  MAX_MON_MOVES,
  MOVE_NONE,
  MOVE_STRUGGLE,
  B_SIDE_PLAYER,
  BIT_SIDE,
  BIT_FLANK,
  GET_BATTLER_SIDE,
  BATTLE_OPPOSITE,
  BATTLE_PARTNER,
  STAT_SPEED,
  STATUS1_PARALYSIS,
  ABILITY_NONE,
  ABILITY_SHADOW_TAG,
  ABILITY_MAGNET_PULL,
  ABILITY_ARENA_TRAP,
  ABILITY_SWIFT_SWIM,
  ABILITY_CHLOROPHYLL,
  B_WEATHER_RAIN,
  B_WEATHER_SANDSTORM,
  B_WEATHER_SUN,
  B_WEATHER_HAIL,
  MOVE_RESULT_DOESNT_AFFECT_FOE,
  B_ACTION_USE_MOVE,
  MOVE_LIMITATIONS_ALL,
  ALL_MOVES_MASK,
  BATTLE_TYPE_DOUBLE,
  BATTLE_TYPE_TRAINER,
  BATTLE_TYPE_SAFARI,
  BATTLE_TYPE_ROAMER,
  BATTLE_TYPE_FIRST_BATTLE,
  BATTLE_TYPE_RECORDED,
  BATTLE_TYPE_LINK,
  BATTLE_TYPE_RECORDED_LINK,
  BATTLE_TYPE_FRONTIER,
  BATTLE_TYPE_BATTLE_TOWER,
  BATTLE_TYPE_EREADER_TRAINER,
  BATTLE_TYPE_SECRET_BASE,
  BATTLE_TYPE_INGAME_PARTNER,
  BATTLE_TYPE_TWO_OPPONENTS,
  BATTLE_TYPE_PALACE,
  BATTLE_TYPE_FACTORY,
  BATTLE_TYPE_TRAINER_HILL,
} from './engine/battle/constants';
import { getTrainer, type TrainerData } from './engine/data/game-data';
// Static import (= module constants leaf, aucun risque circulaire) : évite
// la race + fragilité de chemin du dynamic import async (bug Commit 4 :
// _trainerIdToKey restait vide → aiFlags 0 sur tous les dresseurs).
import * as OPPONENTS_DATA from '../include/constants/opponents';

// ═══ Constantes AI (battle_ai_script_commands.c / battle_ai.h) — SPLIT depuis
//     ai-state.ts (2026-06-13) : ai-state.ts devient runtime bytecode PUR. ═══
// ─── Constantes AI (1:1 décomp) ─────────────────────────────────────────────

// battle_ai_script_commands.c:19-22
export const AI_ACTION_DONE = 1 << 0;
export const AI_ACTION_FLEE = 1 << 1;
export const AI_ACTION_WATCH = 1 << 2;
export const AI_ACTION_DO_NOT_ATTACK = 1 << 3;

// battle_ai_script_commands.c:28-34 (enum AIState)
export const AIState_SettingUp = 0;
export const AIState_Processing = 1;
export const AIState_FinishedProcessing = 2;
export const AIState_DoNotProcess = 3;

// include/battle_ai_script_commands.h:6-7
export const AI_CHOICE_FLEE = 4;
export const AI_CHOICE_WATCH = 5;

// constants/battle_ai.h — re-export numériques auto-extraits 1:1
export const AI_TARGET = _AI_TARGET;
export const AI_USER = _AI_USER;
export const AI_TARGET_PARTNER = _AI_TARGET_PARTNER;
export const AI_USER_PARTNER = _AI_USER_PARTNER;
export const AI_TYPE1_TARGET = _AI_TYPE1_TARGET;
export const AI_TYPE1_USER = _AI_TYPE1_USER;
export const AI_TYPE2_TARGET = _AI_TYPE2_TARGET;
export const AI_TYPE2_USER = _AI_TYPE2_USER;
export const AI_TYPE_MOVE = _AI_TYPE_MOVE;
export const AI_EFFECTIVENESS_x4 = _AI_EFF_x4;
export const AI_EFFECTIVENESS_x2 = _AI_EFF_x2;
export const AI_EFFECTIVENESS_x1 = _AI_EFF_x1;
export const AI_EFFECTIVENESS_x0_5 = _AI_EFF_x0_5;
export const AI_EFFECTIVENESS_x0_25 = _AI_EFF_x0_25;
export const AI_EFFECTIVENESS_x0 = _AI_EFF_x0;
export const AI_WEATHER_SUN = _AI_WEATHER_SUN;
export const AI_WEATHER_RAIN = _AI_WEATHER_RAIN;
export const AI_WEATHER_SANDSTORM = _AI_WEATHER_SANDSTORM;
export const AI_WEATHER_HAIL = _AI_WEATHER_HAIL;
/** BUGFIX path : UINT32_MAX. Vanilla laisse funcResult stale (cf. Cmd_get_weather). */
export const AI_WEATHER_NONE = 0xFFFFFFFF;
export const MOVE_POWER_OTHER = _MOVE_POWER_OTHER;
export const MOVE_NOT_MOST_POWERFUL = _MOVE_NOT_MOST_POWERFUL;
export const MOVE_MOST_POWERFUL = _MOVE_MOST_POWERFUL;

// constants/battle_ai.h — AI script flag bits (gTrainers[].aiFlags).
// Capturés `_EXPR` par l'extracteur ; définis ici 1:1 (battle_ai.h:35-52).
export const AI_SCRIPT_CHECK_BAD_MOVE = 1 << 0;
export const AI_SCRIPT_TRY_TO_FAINT = 1 << 1;
export const AI_SCRIPT_CHECK_VIABILITY = 1 << 2;
export const AI_SCRIPT_SETUP_FIRST_TURN = 1 << 3;
export const AI_SCRIPT_RISKY = 1 << 4;
export const AI_SCRIPT_PREFER_POWER_EXTREMES = 1 << 5;
export const AI_SCRIPT_PREFER_BATON_PASS = 1 << 6;
export const AI_SCRIPT_DOUBLE_BATTLE = 1 << 7;
export const AI_SCRIPT_HP_AWARE = 1 << 8;
export const AI_SCRIPT_TRY_SUNNY_DAY_START = 1 << 9;
export const AI_SCRIPT_ROAMING = (1 << 29) >>> 0;
export const AI_SCRIPT_SAFARI = (1 << 30) >>> 0;
export const AI_SCRIPT_FIRST_BATTLE = (1 << 31) >>> 0;

// battle_ai_script_commands.c:265 — sIgnoredPowerfulMoveEffects terminator.
export const IGNORED_MOVES_END = 0xFFFF;


// ─── s8 helper (= score[] est s8 dans le décomp) ───────────────────────────

/** Émule la troncature/sign-extension s8 (= comportement décomp `s8 score[]`). */
function _s8(x: number): number {
  return (x << 24) >> 24;
}

// ─── sIgnoredPowerfulMoveEffects (battle_ai_script_commands.c:266-281) ──────

const sIgnoredPowerfulMoveEffects: readonly number[] = [
  EFFECT_EXPLOSION,
  EFFECT_DREAM_EATER,
  EFFECT_RAZOR_WIND,
  EFFECT_SKY_ATTACK,
  EFFECT_RECHARGE,
  EFFECT_SKULL_BASH,
  EFFECT_SOLAR_BEAM,
  EFFECT_SPIT_UP,
  EFFECT_FOCUS_PUNCH,
  EFFECT_SUPERPOWER,
  EFFECT_ERUPTION,
  EFFECT_OVERHEAT,
  IGNORED_MOVES_END,
];

// ─── Trainer data resolution (gTrainers[id].aiFlags / .items) ───────────────
//
// 1:1 décomp `gTrainers[gTrainerBattleOpponent_A].aiFlags`. Notre data
// trainer est keyée par "TRAINER_X" (game-data.ts). Reverse cache id→key
// (= même pattern que battle-string-decoder.ts).

let _trainerIdToKey: Map<number, string> | null = null;
/** Build (lazy, synchrone) le reverse map id→'TRAINER_X' depuis le module
 *  constants importé statiquement. Pas d'async = pas de race. */
function _ensureTrainerIdMap(): Map<number, string> {
  if (_trainerIdToKey) return _trainerIdToKey;
  const m = new Map<number, string>();
  for (const [key, val] of Object.entries(OPPONENTS_DATA)) {
    if (key.startsWith('TRAINER_') && typeof val === 'number') {
      if (!m.has(val)) m.set(val, key);
    }
  }
  _trainerIdToKey = m;
  return m;
}

function _trainerKey(trainerId: number): string {
  return _ensureTrainerIdMap().get(trainerId) ?? `TRAINER_${trainerId}`;
}

function _getTrainerData(trainerId: number): TrainerData | undefined {
  const key = _trainerKey(trainerId);
  // 1:1 robuste : lit le bridge globalThis.gameDataTrainers (= instance-
  // indépendant, exposé par game-data.ts au load — même pattern que
  // battle-string-decoder.ts). Évite le bug ESM dual-instance (session 145)
  // où le `getTrainer` importé statiquement pointe une instance non chargée.
  const bridge = (globalThis as { gameDataTrainers?: Record<string, TrainerData> }).gameDataTrainers;
  const fromBridge = bridge?.[key];
  if (fromBridge) return fromBridge;
  try {
    return getTrainer(key);
  } catch {
    return undefined;
  }
}

/** Parse `aiFlags` string expr ("AI_SCRIPT_X | AI_SCRIPT_Y") → masque numérique
 *  1:1 (OR des bits AI_SCRIPT_*). */
const _AI_SCRIPT_NAME_TO_BIT: Record<string, number> = {
  AI_SCRIPT_CHECK_BAD_MOVE: 1 << 0,
  AI_SCRIPT_TRY_TO_FAINT: 1 << 1,
  AI_SCRIPT_CHECK_VIABILITY: 1 << 2,
  AI_SCRIPT_SETUP_FIRST_TURN: 1 << 3,
  AI_SCRIPT_RISKY: 1 << 4,
  AI_SCRIPT_PREFER_POWER_EXTREMES: 1 << 5,
  AI_SCRIPT_PREFER_BATON_PASS: 1 << 6,
  AI_SCRIPT_DOUBLE_BATTLE: 1 << 7,
  AI_SCRIPT_HP_AWARE: 1 << 8,
  AI_SCRIPT_TRY_SUNNY_DAY_START: 1 << 9,
  AI_SCRIPT_ROAMING: (1 << 29) >>> 0,
  AI_SCRIPT_SAFARI: (1 << 30) >>> 0,
  AI_SCRIPT_FIRST_BATTLE: (1 << 31) >>> 0,
};

function _parseAiFlags(expr: string | undefined): number {
  if (!expr) return 0;
  let mask = 0;
  for (const tok of expr.split('|')) {
    const t = tok.trim();
    if (t === '' || t === '0') continue;
    mask = (mask | (_AI_SCRIPT_NAME_TO_BIT[t] ?? 0)) >>> 0;
  }
  return mask >>> 0;
}

function _trainerAiFlags(trainerId: number): number {
  return _parseAiFlags(_getTrainerData(trainerId)?.aiFlags);
}

// ─── GetWhoStrikesFirst (battle_main.c:4595-4754) ───────────────────────────
//
// `gStatStageRatios` consolidé sur le miroir `src/game/pokemon.ts` (cf. import en tête).

const UINT_MAX = 0xFFFFFFFF;

/** 1:1 décomp `u8 GetWhoStrikesFirst(u8 battler1, u8 battler2, bool8 ignoreChosenMoves)`.
 *  Retourne 0 si battler1 frappe en premier, 1 si battler2, 2 si égalité. */
export function GetWhoStrikesFirst(battler1: number, battler2: number, ignoreChosenMoves: boolean): number {
  let strikesFirst = 0;
  let speedMultiplierBattler1 = 0;
  let speedMultiplierBattler2 = 0;
  let speedBattler1 = 0;
  let speedBattler2 = 0;
  let holdEffect = 0;
  let holdEffectParam = 0;
  let moveBattler1 = 0;
  let moveBattler2 = 0;

  // WEATHER_HAS_EFFECT : Cloud Nine / Air Lock désactivent la météo. On
  // n'évalue pas ABILITY_ON_FIELD ici (= les abilities AI guess) ; 1:1 avec
  // le reste du port, on considère la météo active.
  const weatherHasEffect = true;
  if (weatherHasEffect) {
    if ((gBattleMons[battler1].ability === ABILITY_SWIFT_SWIM && (gBattleWeather & B_WEATHER_RAIN))
      || (gBattleMons[battler1].ability === ABILITY_CHLOROPHYLL && (gBattleWeather & B_WEATHER_SUN))) {
      speedMultiplierBattler1 = 2;
    } else {
      speedMultiplierBattler1 = 1;
    }
    if ((gBattleMons[battler2].ability === ABILITY_SWIFT_SWIM && (gBattleWeather & B_WEATHER_RAIN))
      || (gBattleMons[battler2].ability === ABILITY_CHLOROPHYLL && (gBattleWeather & B_WEATHER_SUN))) {
      speedMultiplierBattler2 = 2;
    } else {
      speedMultiplierBattler2 = 1;
    }
  } else {
    speedMultiplierBattler1 = 1;
    speedMultiplierBattler2 = 1;
  }

  const ratio1 = gStatStageRatios[gBattleMons[battler1].statStages[STAT_SPEED]] ?? [10, 10];
  speedBattler1 = Math.floor((gBattleMons[battler1].speed * speedMultiplierBattler1) * ratio1[0] / ratio1[1]);

  // ITEM_ENIGMA_BERRY path (= berry custom rare, Frontier deferred — 1:1 avec
  // le reste du port).
  holdEffect = GetItemHoldEffect(gBattleMons[battler1].item);
  holdEffectParam = GetItemHoldEffectParam(gBattleMons[battler1].item);

  // badge boost (= 1:1 décomp : LINK | RECORDED_LINK | FRONTIER, PAS EREADER).
  if (!(gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK | BATTLE_TYPE_FRONTIER))
    && FlagGet('FLAG_BADGE03_GET')
    && GET_BATTLER_SIDE(battler1) === B_SIDE_PLAYER) {
    speedBattler1 = Math.floor((speedBattler1 * 110) / 100);
  }

  if (holdEffect === HOLD_EFFECT_MACHO_BRACE) speedBattler1 = Math.floor(speedBattler1 / 2);
  if (gBattleMons[battler1].status1 & STATUS1_PARALYSIS) speedBattler1 = Math.floor(speedBattler1 / 4);
  if (holdEffect === HOLD_EFFECT_QUICK_CLAW && gRandomTurnNumber < Math.floor((0xFFFF * holdEffectParam) / 100)) {
    speedBattler1 = UINT_MAX;
  }

  const ratio2 = gStatStageRatios[gBattleMons[battler2].statStages[STAT_SPEED]] ?? [10, 10];
  speedBattler2 = Math.floor((gBattleMons[battler2].speed * speedMultiplierBattler2) * ratio2[0] / ratio2[1]);

  holdEffect = GetItemHoldEffect(gBattleMons[battler2].item);
  holdEffectParam = GetItemHoldEffectParam(gBattleMons[battler2].item);

  if (!(gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK | BATTLE_TYPE_FRONTIER))
    && FlagGet('FLAG_BADGE03_GET')
    && GET_BATTLER_SIDE(battler2) === B_SIDE_PLAYER) {
    speedBattler2 = Math.floor((speedBattler2 * 110) / 100);
  }

  if (holdEffect === HOLD_EFFECT_MACHO_BRACE) speedBattler2 = Math.floor(speedBattler2 / 2);
  if (gBattleMons[battler2].status1 & STATUS1_PARALYSIS) speedBattler2 = Math.floor(speedBattler2 / 4);
  if (holdEffect === HOLD_EFFECT_QUICK_CLAW && gRandomTurnNumber < Math.floor((0xFFFF * holdEffectParam) / 100)) {
    speedBattler2 = UINT_MAX;
  }

  if (ignoreChosenMoves) {
    moveBattler1 = MOVE_NONE;
    moveBattler2 = MOVE_NONE;
  } else {
    if (gChosenActionByBattler[battler1] === B_ACTION_USE_MOVE) {
      moveBattler1 = gProtectStructs[battler1].noValidMoves
        ? MOVE_STRUGGLE
        : gBattleMons[battler1].moves[gBattleStruct.chosenMovePositions[battler1]];
    } else {
      moveBattler1 = MOVE_NONE;
    }
    if (gChosenActionByBattler[battler2] === B_ACTION_USE_MOVE) {
      moveBattler2 = gProtectStructs[battler2].noValidMoves
        ? MOVE_STRUGGLE
        : gBattleMons[battler2].moves[gBattleStruct.chosenMovePositions[battler2]];
    } else {
      moveBattler2 = MOVE_NONE;
    }
  }

  const prio1 = getBattleMove(moveBattler1).priority;
  const prio2 = getBattleMove(moveBattler2).priority;
  if (prio1 !== 0 || prio2 !== 0) {
    if (prio1 === prio2) {
      if (speedBattler1 === speedBattler2 && (Random() & 1)) strikesFirst = 2;
      else if (speedBattler1 < speedBattler2) strikesFirst = 1;
    } else if (prio1 < prio2) {
      strikesFirst = 1;
    }
  } else {
    if (speedBattler1 === speedBattler2 && (Random() & 1)) strikesFirst = 2;
    else if (speedBattler1 < speedBattler2) strikesFirst = 1;
  }
  return strikesFirst;
}

/** Ordre du tour pour un combat 1v1 inline (battler 0 = player, 1 = opponent).
 *  Pose les chosen moves + actions (= ce que lit `GetWhoStrikesFirst` pour la
 *  priorité) puis renvoie `true` si le JOUEUR frappe en premier (GetWhoStrikesFirst
 *  === 0), `false` sinon (opponent premier ; inclut l'égalité de vitesse tranchée
 *  au hasard, codée par le retour 1/2 du décomp). 1:1 décomp : priorité du move
 *  > vitesse (× stage, météo, badge, paralysie ÷4, Quick Claw). */
export function ComputeSingleBattleTurnOrder(playerMoveIdx: number, opponentMoveIdx: number): boolean {
  gBattleStruct.chosenMovePositions[0] = playerMoveIdx & 0xFF;
  gBattleStruct.chosenMovePositions[1] = opponentMoveIdx & 0xFF;
  gChosenActionByBattler[0] = B_ACTION_USE_MOVE;
  gChosenActionByBattler[1] = B_ACTION_USE_MOVE;
  return GetWhoStrikesFirst(0, 1, false) === 0;
}

// ─── Helpers décomp ─────────────────────────────────────────────────────────

/** 1:1 décomp `BattleAI_GetWantedBattler(u8 wantedBattler)` (1140-1154). */
function BattleAI_GetWantedBattler(wantedBattler: number): number {
  switch (wantedBattler) {
    case AI_USER:
      return sBattler_AI;
    case AI_USER_PARTNER:
      return BATTLE_PARTNER(sBattler_AI);
    case AI_TARGET_PARTNER:
      return BATTLE_PARTNER(gBattlerTarget);
    case AI_TARGET:
    default:
      return gBattlerTarget;
  }
}

/** 1:1 décomp `IS_BATTLER_OF_TYPE(battler, type)`. */
function IS_BATTLER_OF_TYPE(battler: number, type: number): boolean {
  return gBattleMons[battler].type1 === type || gBattleMons[battler].type2 === type;
}

// ─── Cmd table types ────────────────────────────────────────────────────────

type BattleAICmdFunc = () => void;

// ─── Cmd_* 1:1 décomp (battle_ai_script_commands.c) ─────────────────────────

function Cmd_if_random_less_than(): void { // 0x0
  const random = Random();
  if (random % 256 < aiByteAt(1)) setAiScriptPtr(aiReadPtr(2));
  else setAiScriptPtr(gAIScriptPtr + 6);
}

function Cmd_if_random_greater_than(): void { // 0x1
  const random = Random();
  if (random % 256 > aiByteAt(1)) setAiScriptPtr(aiReadPtr(2));
  else setAiScriptPtr(gAIScriptPtr + 6);
}

function Cmd_if_random_equal(): void { // 0x2
  const random = Random();
  if (random % 256 === aiByteAt(1)) setAiScriptPtr(aiReadPtr(2));
  else setAiScriptPtr(gAIScriptPtr + 6);
}

function Cmd_if_random_not_equal(): void { // 0x3
  const random = Random();
  if (random % 256 !== aiByteAt(1)) setAiScriptPtr(aiReadPtr(2));
  else setAiScriptPtr(gAIScriptPtr + 6);
}

function Cmd_score(): void { // 0x4
  const idx = gAiThinkingStruct.movesetIndex;
  gAiThinkingStruct.score[idx] = _s8(gAiThinkingStruct.score[idx] + aiByteAt(1));
  if (gAiThinkingStruct.score[idx] < 0) gAiThinkingStruct.score[idx] = 0;
  setAiScriptPtr(gAIScriptPtr + 2);
}

function _hpBattler(): number {
  return aiByteAt(1) === AI_USER ? sBattler_AI : gBattlerTarget;
}

function Cmd_if_hp_less_than(): void { // 0x5
  const b = _hpBattler();
  if (Math.floor(100 * gBattleMons[b].hp / gBattleMons[b].maxHP) < aiByteAt(2)) setAiScriptPtr(aiReadPtr(3));
  else setAiScriptPtr(gAIScriptPtr + 7);
}

function Cmd_if_hp_more_than(): void { // 0x6
  const b = _hpBattler();
  if (Math.floor(100 * gBattleMons[b].hp / gBattleMons[b].maxHP) > aiByteAt(2)) setAiScriptPtr(aiReadPtr(3));
  else setAiScriptPtr(gAIScriptPtr + 7);
}

function Cmd_if_hp_equal(): void { // 0x7
  const b = _hpBattler();
  if (Math.floor(100 * gBattleMons[b].hp / gBattleMons[b].maxHP) === aiByteAt(2)) setAiScriptPtr(aiReadPtr(3));
  else setAiScriptPtr(gAIScriptPtr + 7);
}

function Cmd_if_hp_not_equal(): void { // 0x8
  const b = _hpBattler();
  if (Math.floor(100 * gBattleMons[b].hp / gBattleMons[b].maxHP) !== aiByteAt(2)) setAiScriptPtr(aiReadPtr(3));
  else setAiScriptPtr(gAIScriptPtr + 7);
}

function Cmd_if_status(): void { // 0x9
  const b = aiByteAt(1) === AI_USER ? sBattler_AI : gBattlerTarget;
  const status = aiRead32(2);
  if (gBattleMons[b].status1 & status) setAiScriptPtr(aiReadPtr(6));
  else setAiScriptPtr(gAIScriptPtr + 10);
}

function Cmd_if_not_status(): void { // 0xA
  const b = aiByteAt(1) === AI_USER ? sBattler_AI : gBattlerTarget;
  const status = aiRead32(2);
  if (!(gBattleMons[b].status1 & status)) setAiScriptPtr(aiReadPtr(6));
  else setAiScriptPtr(gAIScriptPtr + 10);
}

function Cmd_if_status2(): void { // 0xB
  const b = aiByteAt(1) === AI_USER ? sBattler_AI : gBattlerTarget;
  const status = aiRead32(2);
  if (gBattleMons[b].status2 & status) setAiScriptPtr(aiReadPtr(6));
  else setAiScriptPtr(gAIScriptPtr + 10);
}

function Cmd_if_not_status2(): void { // 0xC
  const b = aiByteAt(1) === AI_USER ? sBattler_AI : gBattlerTarget;
  const status = aiRead32(2);
  if (!(gBattleMons[b].status2 & status)) setAiScriptPtr(aiReadPtr(6));
  else setAiScriptPtr(gAIScriptPtr + 10);
}

function Cmd_if_status3(): void { // 0xD
  const b = aiByteAt(1) === AI_USER ? sBattler_AI : gBattlerTarget;
  const status = aiRead32(2);
  if (gStatuses3[b] & status) setAiScriptPtr(aiReadPtr(6));
  else setAiScriptPtr(gAIScriptPtr + 10);
}

function Cmd_if_not_status3(): void { // 0xE
  const b = aiByteAt(1) === AI_USER ? sBattler_AI : gBattlerTarget;
  const status = aiRead32(2);
  if (!(gStatuses3[b] & status)) setAiScriptPtr(aiReadPtr(6));
  else setAiScriptPtr(gAIScriptPtr + 10);
}

function Cmd_if_side_affecting(): void { // 0xF
  const b = aiByteAt(1) === AI_USER ? sBattler_AI : gBattlerTarget;
  const side = GET_BATTLER_SIDE(b);
  const status = aiRead32(2);
  if (gSideStatuses[side] & status) setAiScriptPtr(aiReadPtr(6));
  else setAiScriptPtr(gAIScriptPtr + 10);
}

function Cmd_if_not_side_affecting(): void { // 0x10
  const b = aiByteAt(1) === AI_USER ? sBattler_AI : gBattlerTarget;
  const side = GET_BATTLER_SIDE(b);
  const status = aiRead32(2);
  if (!(gSideStatuses[side] & status)) setAiScriptPtr(aiReadPtr(6));
  else setAiScriptPtr(gAIScriptPtr + 10);
}

function Cmd_if_less_than(): void { // 0x11
  if (gAiThinkingStruct.funcResult < aiByteAt(1)) setAiScriptPtr(aiReadPtr(2));
  else setAiScriptPtr(gAIScriptPtr + 6);
}

function Cmd_if_more_than(): void { // 0x12
  if (gAiThinkingStruct.funcResult > aiByteAt(1)) setAiScriptPtr(aiReadPtr(2));
  else setAiScriptPtr(gAIScriptPtr + 6);
}

function Cmd_if_equal(): void { // 0x13
  if (gAiThinkingStruct.funcResult === aiByteAt(1)) setAiScriptPtr(aiReadPtr(2));
  else setAiScriptPtr(gAIScriptPtr + 6);
}

function Cmd_if_not_equal(): void { // 0x14
  if (gAiThinkingStruct.funcResult !== aiByteAt(1)) setAiScriptPtr(aiReadPtr(2));
  else setAiScriptPtr(gAIScriptPtr + 6);
}

function Cmd_if_less_than_ptr(): void { // 0x15
  const value = aiByteAtAddr(aiReadPtr(1));
  if (gAiThinkingStruct.funcResult < value) setAiScriptPtr(aiReadPtr(5));
  else setAiScriptPtr(gAIScriptPtr + 9);
}

function Cmd_if_more_than_ptr(): void { // 0x16
  const value = aiByteAtAddr(aiReadPtr(1));
  if (gAiThinkingStruct.funcResult > value) setAiScriptPtr(aiReadPtr(5));
  else setAiScriptPtr(gAIScriptPtr + 9);
}

function Cmd_if_equal_ptr(): void { // 0x17
  const value = aiByteAtAddr(aiReadPtr(1));
  if (gAiThinkingStruct.funcResult === value) setAiScriptPtr(aiReadPtr(5));
  else setAiScriptPtr(gAIScriptPtr + 9);
}

function Cmd_if_not_equal_ptr(): void { // 0x18
  const value = aiByteAtAddr(aiReadPtr(1));
  if (gAiThinkingStruct.funcResult !== value) setAiScriptPtr(aiReadPtr(5));
  else setAiScriptPtr(gAIScriptPtr + 9);
}

function Cmd_if_move(): void { // 0x19
  const move = aiRead16(1);
  if (gAiThinkingStruct.moveConsidered === move) setAiScriptPtr(aiReadPtr(3));
  else setAiScriptPtr(gAIScriptPtr + 7);
}

function Cmd_if_not_move(): void { // 0x1A
  const move = aiRead16(1);
  if (gAiThinkingStruct.moveConsidered !== move) setAiScriptPtr(aiReadPtr(3));
  else setAiScriptPtr(gAIScriptPtr + 7);
}

function Cmd_if_in_bytes(): void { // 0x1B
  let ptr = aiReadPtr(1);
  while (aiByteAtAddr(ptr) !== 0xFF) {
    if (gAiThinkingStruct.funcResult === aiByteAtAddr(ptr)) {
      setAiScriptPtr(aiReadPtr(5));
      return;
    }
    ptr++;
  }
  setAiScriptPtr(gAIScriptPtr + 9);
}

function Cmd_if_not_in_bytes(): void { // 0x1C
  let ptr = aiReadPtr(1);
  while (aiByteAtAddr(ptr) !== 0xFF) {
    if (gAiThinkingStruct.funcResult === aiByteAtAddr(ptr)) {
      setAiScriptPtr(gAIScriptPtr + 9);
      return;
    }
    ptr++;
  }
  setAiScriptPtr(aiReadPtr(5));
}

function Cmd_if_in_hwords(): void { // 0x1D
  let ptr = aiReadPtr(1);
  while (aiRead16AtAddr(ptr) !== 0xFFFF) {
    if (gAiThinkingStruct.funcResult === aiRead16AtAddr(ptr)) {
      setAiScriptPtr(aiReadPtr(5));
      return;
    }
    ptr += 2;
  }
  setAiScriptPtr(gAIScriptPtr + 9);
}

function Cmd_if_not_in_hwords(): void { // 0x1E
  let ptr = aiReadPtr(1);
  while (aiRead16AtAddr(ptr) !== 0xFFFF) {
    if (gAiThinkingStruct.funcResult === aiRead16AtAddr(ptr)) {
      setAiScriptPtr(gAIScriptPtr + 9);
      return;
    }
    ptr += 2;
  }
  setAiScriptPtr(aiReadPtr(5));
}

function Cmd_if_user_has_attacking_move(): void { // 0x1F
  let i: number;
  for (i = 0; i < MAX_MON_MOVES; i++) {
    if (gBattleMons[sBattler_AI].moves[i] !== 0
      && getBattleMove(gBattleMons[sBattler_AI].moves[i]).power !== 0) break;
  }
  if (i === MAX_MON_MOVES) setAiScriptPtr(gAIScriptPtr + 5);
  else setAiScriptPtr(aiReadPtr(1));
}

function Cmd_if_user_has_no_attacking_moves(): void { // 0x20
  let i: number;
  for (i = 0; i < MAX_MON_MOVES; i++) {
    if (gBattleMons[sBattler_AI].moves[i] !== 0
      && getBattleMove(gBattleMons[sBattler_AI].moves[i]).power !== 0) break;
  }
  if (i !== MAX_MON_MOVES) setAiScriptPtr(gAIScriptPtr + 5);
  else setAiScriptPtr(aiReadPtr(1));
}

function Cmd_get_turn_count(): void { // 0x21
  gAiThinkingStruct.funcResult = gBattleResults.battleTurnCounter;
  setAiScriptPtr(gAIScriptPtr + 1);
}

function Cmd_get_type(): void { // 0x22
  const typeVar = aiByteAt(1);
  switch (typeVar) {
    case AI_TYPE1_USER:
      gAiThinkingStruct.funcResult = gBattleMons[sBattler_AI].type1;
      break;
    case AI_TYPE1_TARGET:
      gAiThinkingStruct.funcResult = gBattleMons[gBattlerTarget].type1;
      break;
    case AI_TYPE2_USER:
      gAiThinkingStruct.funcResult = gBattleMons[sBattler_AI].type2;
      break;
    case AI_TYPE2_TARGET:
      gAiThinkingStruct.funcResult = gBattleMons[gBattlerTarget].type2;
      break;
    case AI_TYPE_MOVE:
      gAiThinkingStruct.funcResult = getBattleMove(gAiThinkingStruct.moveConsidered).type;
      break;
  }
  setAiScriptPtr(gAIScriptPtr + 2);
}

function Cmd_is_of_type(): void { // 0x5F
  const battler = BattleAI_GetWantedBattler(aiByteAt(1));
  gAiThinkingStruct.funcResult = IS_BATTLER_OF_TYPE(battler, aiByteAt(2)) ? 1 : 0;
  setAiScriptPtr(gAIScriptPtr + 3);
}

function Cmd_get_considered_move_power(): void { // 0x23
  gAiThinkingStruct.funcResult = getBattleMove(gAiThinkingStruct.moveConsidered).power;
  setAiScriptPtr(gAIScriptPtr + 1);
}

function Cmd_get_how_powerful_move_is(): void { // 0x24
  let i: number;
  let checkedMove: number;
  const moveDmgs = new Array(MAX_MON_MOVES).fill(0);

  for (i = 0; sIgnoredPowerfulMoveEffects[i] !== IGNORED_MOVES_END; i++) {
    if (getBattleMove(gAiThinkingStruct.moveConsidered).effect === sIgnoredPowerfulMoveEffects[i]) break;
  }

  if (getBattleMove(gAiThinkingStruct.moveConsidered).power > 1
    && sIgnoredPowerfulMoveEffects[i] === IGNORED_MOVES_END) {
    setDynamicBasePower(0);
    gBattleStruct.dynamicMoveType = 0;
    gBattleScripting.dmgMultiplier = 1;
    setMoveResultFlags(0);
    setCritMultiplier(1);

    for (checkedMove = 0; checkedMove < MAX_MON_MOVES; checkedMove++) {
      for (i = 0; sIgnoredPowerfulMoveEffects[i] !== IGNORED_MOVES_END; i++) {
        if (getBattleMove(gBattleMons[sBattler_AI].moves[checkedMove]).effect === sIgnoredPowerfulMoveEffects[i]) break;
      }
      if (gBattleMons[sBattler_AI].moves[checkedMove] !== MOVE_NONE
        && sIgnoredPowerfulMoveEffects[i] === IGNORED_MOVES_END
        && getBattleMove(gBattleMons[sBattler_AI].moves[checkedMove]).power > 1) {
        setCurrentMove(gBattleMons[sBattler_AI].moves[checkedMove]);
        AI_CalcDmg(sBattler_AI, gBattlerTarget);
        TypeCalc(gCurrentMove, sBattler_AI, gBattlerTarget);
        moveDmgs[checkedMove] = Math.floor(gBattleMoveDamage * gAiThinkingStruct.simulatedRNG[checkedMove] / 100);
        if (moveDmgs[checkedMove] === 0) moveDmgs[checkedMove] = 1;
      } else {
        moveDmgs[checkedMove] = 0;
      }
    }

    for (checkedMove = 0; checkedMove < MAX_MON_MOVES; checkedMove++) {
      if (moveDmgs[checkedMove] > moveDmgs[gAiThinkingStruct.movesetIndex]) break;
    }

    gAiThinkingStruct.funcResult = (checkedMove === MAX_MON_MOVES) ? MOVE_MOST_POWERFUL : MOVE_NOT_MOST_POWERFUL;
  } else {
    gAiThinkingStruct.funcResult = MOVE_POWER_OTHER;
  }
  setAiScriptPtr(gAIScriptPtr + 1);
}

function Cmd_get_last_used_battler_move(): void { // 0x25
  gAiThinkingStruct.funcResult = (aiByteAt(1) === AI_USER) ? gLastMoves[sBattler_AI] : gLastMoves[gBattlerTarget];
  setAiScriptPtr(gAIScriptPtr + 2);
}

function Cmd_if_equal_(): void { // 0x26
  if (aiByteAt(1) === gAiThinkingStruct.funcResult) setAiScriptPtr(aiReadPtr(2));
  else setAiScriptPtr(gAIScriptPtr + 6);
}

function Cmd_if_not_equal_(): void { // 0x27
  if (aiByteAt(1) !== gAiThinkingStruct.funcResult) setAiScriptPtr(aiReadPtr(2));
  else setAiScriptPtr(gAIScriptPtr + 6);
}

function Cmd_if_user_goes(): void { // 0x28
  if (GetWhoStrikesFirst(sBattler_AI, gBattlerTarget, true) === aiByteAt(1)) setAiScriptPtr(aiReadPtr(2));
  else setAiScriptPtr(gAIScriptPtr + 6);
}

function Cmd_if_user_doesnt_go(): void { // 0x29
  if (GetWhoStrikesFirst(sBattler_AI, gBattlerTarget, true) !== aiByteAt(1)) setAiScriptPtr(aiReadPtr(2));
  else setAiScriptPtr(gAIScriptPtr + 6);
}

function Cmd_nop_2A(): void { /* 0x2A */ }
function Cmd_nop_2B(): void { /* 0x2B */ }

function Cmd_count_usable_party_mons(): void { // 0x2C
  let battler: number;
  let battlerOnField1: number;
  let battlerOnField2: number;
  let i: number;

  gAiThinkingStruct.funcResult = 0;
  battler = aiByteAt(1) === AI_USER ? sBattler_AI : gBattlerTarget;

  const party = GET_BATTLER_SIDE(battler) === B_SIDE_PLAYER ? gPlayerParty : gEnemyParty;

  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
    battlerOnField1 = gBattlerPartyIndexes[battler];
    const position = BATTLE_PARTNER(GetBattlerPosition(battler));
    battlerOnField2 = gBattlerPartyIndexes[GetBattlerAtPosition(position)];
  } else {
    battlerOnField1 = gBattlerPartyIndexes[battler];
    battlerOnField2 = gBattlerPartyIndexes[battler];
  }

  for (i = 0; i < PARTY_SIZE; i++) {
    if (i !== battlerOnField1 && i !== battlerOnField2
      && GetMonData(party[i], MON_DATA_HP) !== 0
      && GetMonData(party[i], MON_DATA_SPECIES_OR_EGG) !== SPECIES_NONE
      && GetMonData(party[i], MON_DATA_SPECIES_OR_EGG) !== SPECIES_EGG) {
      gAiThinkingStruct.funcResult++;
    }
  }
  setAiScriptPtr(gAIScriptPtr + 2);
}

function Cmd_get_considered_move(): void { // 0x2D
  gAiThinkingStruct.funcResult = gAiThinkingStruct.moveConsidered;
  setAiScriptPtr(gAIScriptPtr + 1);
}

function Cmd_get_considered_move_effect(): void { // 0x2E
  gAiThinkingStruct.funcResult = getBattleMove(gAiThinkingStruct.moveConsidered).effect;
  setAiScriptPtr(gAIScriptPtr + 1);
}

function Cmd_get_ability(): void { // 0x2F
  const battler = aiByteAt(1) === AI_USER ? sBattler_AI : gBattlerTarget;

  if (gActiveBattler !== battler) {
    if (gBattleHistory.abilities[battler] !== 0) {
      gAiThinkingStruct.funcResult = gBattleHistory.abilities[battler];
      setAiScriptPtr(gAIScriptPtr + 2);
      return;
    }
    if (gBattleMons[battler].ability === ABILITY_SHADOW_TAG
      || gBattleMons[battler].ability === ABILITY_MAGNET_PULL
      || gBattleMons[battler].ability === ABILITY_ARENA_TRAP) {
      gAiThinkingStruct.funcResult = gBattleMons[battler].ability;
      setAiScriptPtr(gAIScriptPtr + 2);
      return;
    }
    const a0 = GetAbilityBySpecies(gBattleMons[battler].species, 0);
    const a1 = GetAbilityBySpecies(gBattleMons[battler].species, 1);
    if (a0 !== ABILITY_NONE) {
      if (a1 !== ABILITY_NONE) {
        gAiThinkingStruct.funcResult = (Random() & 1) ? a0 : a1;
      } else {
        gAiThinkingStruct.funcResult = a0;
      }
    } else {
      gAiThinkingStruct.funcResult = a1;
    }
  } else {
    gAiThinkingStruct.funcResult = gBattleMons[battler].ability;
  }
  setAiScriptPtr(gAIScriptPtr + 2);
}

function Cmd_check_ability(): void { // 0x60
  const battler = BattleAI_GetWantedBattler(aiByteAt(1));
  let ability = aiByteAt(2);

  if (aiByteAt(1) === AI_TARGET || aiByteAt(1) === AI_TARGET_PARTNER) {
    if (gBattleHistory.abilities[battler] !== ABILITY_NONE) {
      ability = gBattleHistory.abilities[battler];
      gAiThinkingStruct.funcResult = ability;
    } else if (gBattleMons[battler].ability === ABILITY_SHADOW_TAG
      || gBattleMons[battler].ability === ABILITY_MAGNET_PULL
      || gBattleMons[battler].ability === ABILITY_ARENA_TRAP) {
      ability = gBattleMons[battler].ability;
    } else {
      const a0 = GetAbilityBySpecies(gBattleMons[battler].species, 0);
      const a1 = GetAbilityBySpecies(gBattleMons[battler].species, 1);
      if (a0 !== ABILITY_NONE) {
        if (a1 !== ABILITY_NONE) {
          const abilityDummyVariable = ability;
          if (a0 !== abilityDummyVariable && a1 !== abilityDummyVariable) ability = a0;
          else ability = ABILITY_NONE;
        } else {
          ability = a0;
        }
      } else {
        ability = a1;
      }
    }
  } else {
    ability = gBattleMons[battler].ability;
  }

  if (ability === 0) gAiThinkingStruct.funcResult = 2;
  else if (ability === aiByteAt(2)) gAiThinkingStruct.funcResult = 1;
  else gAiThinkingStruct.funcResult = 0;

  setAiScriptPtr(gAIScriptPtr + 3);
}

function Cmd_get_highest_type_effectiveness(): void { // 0x30
  let i: number;
  setDynamicBasePower(0);
  gBattleStruct.dynamicMoveType = 0;
  gBattleScripting.dmgMultiplier = 1;
  setMoveResultFlags(0);
  setCritMultiplier(1);
  gAiThinkingStruct.funcResult = 0;

  for (i = 0; i < MAX_MON_MOVES; i++) {
    setBattleMoveDamage(40);
    setCurrentMove(gBattleMons[sBattler_AI].moves[i]);
    if (gCurrentMove !== MOVE_NONE) {
      // 1:1 vanilla : TypeCalc n'assigne pas gMoveResultFlags (non-BUGFIX).
      TypeCalc(gCurrentMove, sBattler_AI, gBattlerTarget);
      let dmg = gBattleMoveDamage;
      if (dmg === 120) dmg = AI_EFFECTIVENESS_x2;
      if (dmg === 240) dmg = AI_EFFECTIVENESS_x4;
      if (dmg === 30) dmg = AI_EFFECTIVENESS_x0_5;
      if (dmg === 15) dmg = AI_EFFECTIVENESS_x0_25;
      setBattleMoveDamage(dmg);
      // gMoveResultFlags & MOVE_RESULT_DOESNT_AFFECT_FOE → toujours faux 1:1.
      if (gAiThinkingStruct.funcResult < dmg) gAiThinkingStruct.funcResult = dmg;
    }
  }
  setAiScriptPtr(gAIScriptPtr + 1);
}

function Cmd_if_type_effectiveness(): void { // 0x31
  setDynamicBasePower(0);
  gBattleStruct.dynamicMoveType = 0;
  gBattleScripting.dmgMultiplier = 1;
  setMoveResultFlags(0);
  setCritMultiplier(1);

  setBattleMoveDamage(AI_EFFECTIVENESS_x0 + 40); // AI_EFFECTIVENESS_x1
  setCurrentMove(gAiThinkingStruct.moveConsidered);

  TypeCalc(gCurrentMove, sBattler_AI, gBattlerTarget);

  let dmg = gBattleMoveDamage;
  if (dmg === 120) dmg = AI_EFFECTIVENESS_x2;
  if (dmg === 240) dmg = AI_EFFECTIVENESS_x4;
  if (dmg === 30) dmg = AI_EFFECTIVENESS_x0_5;
  if (dmg === 15) dmg = AI_EFFECTIVENESS_x0_25;
  // gMoveResultFlags & MOVE_RESULT_DOESNT_AFFECT_FOE → toujours faux 1:1.
  setBattleMoveDamage(dmg);

  const damageVar = dmg & 0xFF;
  if (damageVar === aiByteAt(1)) setAiScriptPtr(aiReadPtr(2));
  else setAiScriptPtr(gAIScriptPtr + 6);
}

function Cmd_nop_32(): void { /* 0x32 */ }
function Cmd_nop_33(): void { /* 0x33 */ }

function Cmd_if_status_in_party(): void { // 0x34
  let battler: number;
  switch (aiByteAt(1)) {
    case AI_USER:
      battler = sBattler_AI;
      break;
    default:
      battler = gBattlerTarget;
      break;
  }
  const party = GET_BATTLER_SIDE(battler) === B_SIDE_PLAYER ? gPlayerParty : gEnemyParty;
  const statusToCompareTo = aiRead32(2);
  for (let i = 0; i < PARTY_SIZE; i++) {
    const species = GetMonData(party[i], MON_DATA_SPECIES);
    const hp = GetMonData(party[i], MON_DATA_HP);
    const status = GetMonData(party[i], MON_DATA_STATUS);
    if (species !== SPECIES_NONE && species !== SPECIES_EGG && hp !== 0 && status === statusToCompareTo) {
      setAiScriptPtr(aiReadPtr(6));
      return;
    }
  }
  setAiScriptPtr(gAIScriptPtr + 10);
}

function Cmd_if_status_not_in_party(): void { // 0x35
  let battler: number;
  switch (aiByteAt(1)) {
    case 1:
      battler = sBattler_AI;
      break;
    default:
      battler = gBattlerTarget;
      break;
  }
  const party = GET_BATTLER_SIDE(battler) === B_SIDE_PLAYER ? gPlayerParty : gEnemyParty;
  const statusToCompareTo = aiRead32(2);
  for (let i = 0; i < PARTY_SIZE; i++) {
    const species = GetMonData(party[i], MON_DATA_SPECIES);
    const hp = GetMonData(party[i], MON_DATA_HP);
    const status = GetMonData(party[i], MON_DATA_STATUS);
    if (species !== SPECIES_NONE && species !== SPECIES_EGG && hp !== 0 && status === statusToCompareTo) {
      setAiScriptPtr(gAIScriptPtr + 10);
      // 1:1 décomp : pas de return ici hors UBFIX (continue la boucle).
    }
  }
  setAiScriptPtr(aiReadPtr(6));
}

function Cmd_get_weather(): void { // 0x36
  // BUGFIX path 1:1 (cf. ai-state AI_WEATHER_NONE).
  gAiThinkingStruct.funcResult = AI_WEATHER_NONE;
  if (gBattleWeather & B_WEATHER_RAIN) gAiThinkingStruct.funcResult = AI_WEATHER_RAIN;
  if (gBattleWeather & B_WEATHER_SANDSTORM) gAiThinkingStruct.funcResult = AI_WEATHER_SANDSTORM;
  if (gBattleWeather & B_WEATHER_SUN) gAiThinkingStruct.funcResult = AI_WEATHER_SUN;
  if (gBattleWeather & B_WEATHER_HAIL) gAiThinkingStruct.funcResult = AI_WEATHER_HAIL;
  setAiScriptPtr(gAIScriptPtr + 1);
}

function Cmd_if_effect(): void { // 0x37
  if (getBattleMove(gAiThinkingStruct.moveConsidered).effect === aiByteAt(1)) setAiScriptPtr(aiReadPtr(2));
  else setAiScriptPtr(gAIScriptPtr + 6);
}

function Cmd_if_not_effect(): void { // 0x38
  if (getBattleMove(gAiThinkingStruct.moveConsidered).effect !== aiByteAt(1)) setAiScriptPtr(aiReadPtr(2));
  else setAiScriptPtr(gAIScriptPtr + 6);
}

function _statLevelBattler(): number {
  return aiByteAt(1) === AI_USER ? sBattler_AI : gBattlerTarget;
}

function Cmd_if_stat_level_less_than(): void { // 0x39
  const b = _statLevelBattler();
  if (gBattleMons[b].statStages[aiByteAt(2)] < aiByteAt(3)) setAiScriptPtr(aiReadPtr(4));
  else setAiScriptPtr(gAIScriptPtr + 8);
}

function Cmd_if_stat_level_more_than(): void { // 0x3A
  const b = _statLevelBattler();
  if (gBattleMons[b].statStages[aiByteAt(2)] > aiByteAt(3)) setAiScriptPtr(aiReadPtr(4));
  else setAiScriptPtr(gAIScriptPtr + 8);
}

function Cmd_if_stat_level_equal(): void { // 0x3B
  const b = _statLevelBattler();
  if (gBattleMons[b].statStages[aiByteAt(2)] === aiByteAt(3)) setAiScriptPtr(aiReadPtr(4));
  else setAiScriptPtr(gAIScriptPtr + 8);
}

function Cmd_if_stat_level_not_equal(): void { // 0x3C
  const b = _statLevelBattler();
  if (gBattleMons[b].statStages[aiByteAt(2)] !== aiByteAt(3)) setAiScriptPtr(aiReadPtr(4));
  else setAiScriptPtr(gAIScriptPtr + 8);
}

function Cmd_if_can_faint(): void { // 0x3D
  if (getBattleMove(gAiThinkingStruct.moveConsidered).power < 2) {
    setAiScriptPtr(gAIScriptPtr + 5);
    return;
  }
  setDynamicBasePower(0);
  gBattleStruct.dynamicMoveType = 0;
  gBattleScripting.dmgMultiplier = 1;
  setMoveResultFlags(0);
  setCritMultiplier(1);
  setCurrentMove(gAiThinkingStruct.moveConsidered);
  AI_CalcDmg(sBattler_AI, gBattlerTarget);
  TypeCalc(gCurrentMove, sBattler_AI, gBattlerTarget);

  let dmg = Math.floor(gBattleMoveDamage * gAiThinkingStruct.simulatedRNG[gAiThinkingStruct.movesetIndex] / 100);
  if (dmg === 0) dmg = 1;
  setBattleMoveDamage(dmg);

  if (gBattleMons[gBattlerTarget].hp <= dmg) setAiScriptPtr(aiReadPtr(1));
  else setAiScriptPtr(gAIScriptPtr + 5);
}

function Cmd_if_cant_faint(): void { // 0x3E
  if (getBattleMove(gAiThinkingStruct.moveConsidered).power < 2) {
    setAiScriptPtr(gAIScriptPtr + 5);
    return;
  }
  setDynamicBasePower(0);
  gBattleStruct.dynamicMoveType = 0;
  gBattleScripting.dmgMultiplier = 1;
  setMoveResultFlags(0);
  setCritMultiplier(1);
  setCurrentMove(gAiThinkingStruct.moveConsidered);
  AI_CalcDmg(sBattler_AI, gBattlerTarget);
  TypeCalc(gCurrentMove, sBattler_AI, gBattlerTarget);

  // 1:1 non-BUGFIX : pas de clamp à 1 ici.
  const dmg = Math.floor(gBattleMoveDamage * gAiThinkingStruct.simulatedRNG[gAiThinkingStruct.movesetIndex] / 100);
  setBattleMoveDamage(dmg);

  if (gBattleMons[gBattlerTarget].hp > dmg) setAiScriptPtr(aiReadPtr(1));
  else setAiScriptPtr(gAIScriptPtr + 5);
}

function Cmd_if_has_move(): void { // 0x3F
  let i: number;
  const move = aiRead16(2);
  switch (aiByteAt(1)) {
    case AI_USER:
      for (i = 0; i < MAX_MON_MOVES; i++) {
        if (gBattleMons[sBattler_AI].moves[i] === move) break;
      }
      if (i === MAX_MON_MOVES) setAiScriptPtr(gAIScriptPtr + 8);
      else setAiScriptPtr(aiReadPtr(4));
      break;
    case AI_USER_PARTNER:
      if (gBattleMons[BATTLE_PARTNER(sBattler_AI)].hp === 0) {
        setAiScriptPtr(gAIScriptPtr + 8);
        break;
      } else {
        for (i = 0; i < MAX_MON_MOVES; i++) {
          if (gBattleMons[BATTLE_PARTNER(sBattler_AI)].moves[i] === move) break;
        }
      }
      if (i === MAX_MON_MOVES) setAiScriptPtr(gAIScriptPtr + 8);
      else setAiScriptPtr(aiReadPtr(4));
      break;
    case AI_TARGET:
    case AI_TARGET_PARTNER:
      for (i = 0; i < MAX_MON_MOVES; i++) {
        if (gBattleHistory.usedMoves[gBattlerTarget].moves[i] === move) break;
      }
      if (i === MAX_MON_MOVES) setAiScriptPtr(gAIScriptPtr + 8);
      else setAiScriptPtr(aiReadPtr(4));
      break;
  }
}

function Cmd_if_doesnt_have_move(): void { // 0x40
  let i: number;
  const move = aiRead16(2);
  switch (aiByteAt(1)) {
    case AI_USER:
    case AI_USER_PARTNER: // UB 1:1 : pas de check séparé partner.
      for (i = 0; i < MAX_MON_MOVES; i++) {
        if (gBattleMons[sBattler_AI].moves[i] === move) break;
      }
      if (i !== MAX_MON_MOVES) setAiScriptPtr(gAIScriptPtr + 8);
      else setAiScriptPtr(aiReadPtr(4));
      break;
    case AI_TARGET:
    case AI_TARGET_PARTNER:
      for (i = 0; i < MAX_MON_MOVES; i++) {
        if (gBattleHistory.usedMoves[gBattlerTarget].moves[i] === move) break;
      }
      if (i !== MAX_MON_MOVES) setAiScriptPtr(gAIScriptPtr + 8);
      else setAiScriptPtr(aiReadPtr(4));
      break;
  }
}

function Cmd_if_has_move_with_effect(): void { // 0x41
  let i: number;
  switch (aiByteAt(1)) {
    case AI_USER:
    case AI_USER_PARTNER:
      for (i = 0; i < MAX_MON_MOVES; i++) {
        if (gBattleMons[sBattler_AI].moves[i] !== 0
          && getBattleMove(gBattleMons[sBattler_AI].moves[i]).effect === aiByteAt(2)) break;
      }
      if (i === MAX_MON_MOVES) setAiScriptPtr(gAIScriptPtr + 7);
      else setAiScriptPtr(aiReadPtr(3));
      break;
    case AI_TARGET:
    case AI_TARGET_PARTNER:
      for (i = 0; i < MAX_MON_MOVES; i++) {
        // BUG 1:1 non-BUGFIX : check sBattler_AI au lieu de gBattlerTarget.
        if (gBattleMons[sBattler_AI].moves[i] !== 0
          && getBattleMove(gBattleHistory.usedMoves[gBattlerTarget].moves[i]).effect === aiByteAt(2)) break;
      }
      if (i === MAX_MON_MOVES) setAiScriptPtr(gAIScriptPtr + 7);
      else setAiScriptPtr(aiReadPtr(3));
      break;
  }
}

function Cmd_if_doesnt_have_move_with_effect(): void { // 0x42
  let i: number;
  switch (aiByteAt(1)) {
    case AI_USER:
    case AI_USER_PARTNER:
      for (i = 0; i < MAX_MON_MOVES; i++) {
        if (gBattleMons[sBattler_AI].moves[i] !== 0
          && getBattleMove(gBattleMons[sBattler_AI].moves[i]).effect === aiByteAt(2)) break;
      }
      if (i !== MAX_MON_MOVES) setAiScriptPtr(gAIScriptPtr + 7);
      else setAiScriptPtr(aiReadPtr(3));
      break;
    case AI_TARGET:
    case AI_TARGET_PARTNER:
      for (i = 0; i < MAX_MON_MOVES; i++) {
        if (gBattleHistory.usedMoves[gBattlerTarget].moves[i]
          && getBattleMove(gBattleHistory.usedMoves[gBattlerTarget].moves[i]).effect === aiByteAt(2)) break;
      }
      if (i !== MAX_MON_MOVES) setAiScriptPtr(gAIScriptPtr + 7);
      else setAiScriptPtr(aiReadPtr(3));
      break;
  }
}

function Cmd_if_any_move_disabled_or_encored(): void { // 0x43
  const battler = aiByteAt(1) === AI_USER ? sBattler_AI : gBattlerTarget;
  if (aiByteAt(2) === 0) {
    if (gDisableStructs[battler].disabledMove === MOVE_NONE) setAiScriptPtr(gAIScriptPtr + 7);
    else setAiScriptPtr(aiReadPtr(3));
  } else if (aiByteAt(2) !== 1) {
    setAiScriptPtr(gAIScriptPtr + 7);
  } else {
    if (gDisableStructs[battler].encoredMove !== MOVE_NONE) setAiScriptPtr(aiReadPtr(3));
    else setAiScriptPtr(gAIScriptPtr + 7);
  }
}

function Cmd_if_curr_move_disabled_or_encored(): void { // 0x44
  switch (aiByteAt(1)) {
    case 0:
      if (gDisableStructs[gActiveBattler].disabledMove === gAiThinkingStruct.moveConsidered) setAiScriptPtr(aiReadPtr(2));
      else setAiScriptPtr(gAIScriptPtr + 6);
      break;
    case 1:
      if (gDisableStructs[gActiveBattler].encoredMove === gAiThinkingStruct.moveConsidered) setAiScriptPtr(aiReadPtr(2));
      else setAiScriptPtr(gAIScriptPtr + 6);
      break;
    default:
      setAiScriptPtr(gAIScriptPtr + 6);
      break;
  }
}

function Cmd_flee(): void { // 0x45
  gAiThinkingStruct.aiAction |= (AI_ACTION_DONE | AI_ACTION_FLEE | AI_ACTION_DO_NOT_ATTACK);
}

function Cmd_if_random_safari_flee(): void { // 0x46
  const safariFleeRate = gBattleStruct.safariEscapeFactor * 5;
  if ((Random() % 100) < safariFleeRate) setAiScriptPtr(aiReadPtr(1));
  else setAiScriptPtr(gAIScriptPtr + 5);
}

function Cmd_watch(): void { // 0x47
  gAiThinkingStruct.aiAction |= (AI_ACTION_DONE | AI_ACTION_WATCH | AI_ACTION_DO_NOT_ATTACK);
}

function Cmd_get_hold_effect(): void { // 0x48
  const battler = aiByteAt(1) === AI_USER ? sBattler_AI : gBattlerTarget;
  if (gActiveBattler !== battler) {
    gAiThinkingStruct.funcResult = GetItemHoldEffect(gBattleHistory.itemEffects[battler]);
  } else {
    gAiThinkingStruct.funcResult = GetItemHoldEffect(gBattleMons[battler].item);
  }
  setAiScriptPtr(gAIScriptPtr + 2);
}

function Cmd_if_holds_item(): void { // 0x62
  const battler = BattleAI_GetWantedBattler(aiByteAt(1));
  let item: number;
  if ((battler & BIT_SIDE) === (sBattler_AI & BIT_SIDE)) item = gBattleMons[battler].item;
  else item = gBattleHistory.itemEffects[battler];

  const itemHi = aiByteAt(2);
  const itemLo = aiByteAt(3);
  // 1:1 non-BUGFIX : (itemLo | itemHi) == item (bug vanilla, OK car seul
  // ITEM_PERSIM_BERRY testé, high byte = 0).
  if ((itemLo | itemHi) === item) setAiScriptPtr(aiReadPtr(4));
  else setAiScriptPtr(gAIScriptPtr + 8);
}

function Cmd_get_gender(): void { // 0x49
  const battler = aiByteAt(1) === AI_USER ? sBattler_AI : gBattlerTarget;
  gAiThinkingStruct.funcResult = GetGenderFromSpeciesAndPersonality(
    gBattleMons[battler].species, gBattleMons[battler].personality);
  setAiScriptPtr(gAIScriptPtr + 2);
}

function Cmd_is_first_turn_for(): void { // 0x4A
  const battler = aiByteAt(1) === AI_USER ? sBattler_AI : gBattlerTarget;
  gAiThinkingStruct.funcResult = gDisableStructs[battler].isFirstTurn;
  setAiScriptPtr(gAIScriptPtr + 2);
}

function Cmd_get_stockpile_count(): void { // 0x4B
  const battler = aiByteAt(1) === AI_USER ? sBattler_AI : gBattlerTarget;
  gAiThinkingStruct.funcResult = gDisableStructs[battler].stockpileCounter;
  setAiScriptPtr(gAIScriptPtr + 2);
}

function Cmd_is_double_battle(): void { // 0x4C
  gAiThinkingStruct.funcResult = gBattleTypeFlags & BATTLE_TYPE_DOUBLE;
  setAiScriptPtr(gAIScriptPtr + 1);
}

function Cmd_get_used_held_item(): void { // 0x4D
  const battler = aiByteAt(1) === AI_USER ? sBattler_AI : gBattlerTarget;
  gAiThinkingStruct.funcResult = gBattleStruct.usedHeldItems[battler] & 0xFF;
  setAiScriptPtr(gAIScriptPtr + 2);
}

function Cmd_get_move_type_from_result(): void { // 0x4E
  gAiThinkingStruct.funcResult = getBattleMove(gAiThinkingStruct.funcResult).type;
  setAiScriptPtr(gAIScriptPtr + 1);
}

function Cmd_get_move_power_from_result(): void { // 0x4F
  gAiThinkingStruct.funcResult = getBattleMove(gAiThinkingStruct.funcResult).power;
  setAiScriptPtr(gAIScriptPtr + 1);
}

function Cmd_get_move_effect_from_result(): void { // 0x50
  gAiThinkingStruct.funcResult = getBattleMove(gAiThinkingStruct.funcResult).effect;
  setAiScriptPtr(gAIScriptPtr + 1);
}

function Cmd_get_protect_count(): void { // 0x51
  const battler = aiByteAt(1) === AI_USER ? sBattler_AI : gBattlerTarget;
  gAiThinkingStruct.funcResult = gDisableStructs[battler].protectUses;
  setAiScriptPtr(gAIScriptPtr + 2);
}

function Cmd_nop_52(): void { /* 0x52 */ }
function Cmd_nop_53(): void { /* 0x53 */ }
function Cmd_nop_54(): void { /* 0x54 */ }
function Cmd_nop_55(): void { /* 0x55 */ }
function Cmd_nop_56(): void { /* 0x56 */ }
function Cmd_nop_57(): void { /* 0x57 */ }

function Cmd_call(): void { // 0x58
  AIStackPushVar(gAIScriptPtr + 5);
  setAiScriptPtr(aiReadPtr(1));
}

function Cmd_goto(): void { // 0x59
  setAiScriptPtr(aiReadPtr(1));
}

function Cmd_end(): void { // 0x5A
  if (AIStackPop() === false) gAiThinkingStruct.aiAction |= AI_ACTION_DONE;
}

function Cmd_if_level_cond(): void { // 0x5B
  switch (aiByteAt(1)) {
    case 0: // greater than
      if (gBattleMons[sBattler_AI].level > gBattleMons[gBattlerTarget].level) setAiScriptPtr(aiReadPtr(2));
      else setAiScriptPtr(gAIScriptPtr + 6);
      break;
    case 1: // less than
      if (gBattleMons[sBattler_AI].level < gBattleMons[gBattlerTarget].level) setAiScriptPtr(aiReadPtr(2));
      else setAiScriptPtr(gAIScriptPtr + 6);
      break;
    case 2: // equal
      if (gBattleMons[sBattler_AI].level === gBattleMons[gBattlerTarget].level) setAiScriptPtr(aiReadPtr(2));
      else setAiScriptPtr(gAIScriptPtr + 6);
      break;
  }
}

function Cmd_if_target_taunted(): void { // 0x5C
  if (gDisableStructs[gBattlerTarget].tauntTimer !== 0) setAiScriptPtr(aiReadPtr(1));
  else setAiScriptPtr(gAIScriptPtr + 5);
}

function Cmd_if_target_not_taunted(): void { // 0x5D
  if (gDisableStructs[gBattlerTarget].tauntTimer === 0) setAiScriptPtr(aiReadPtr(1));
  else setAiScriptPtr(gAIScriptPtr + 5);
}

function Cmd_if_target_is_ally(): void { // 0x5E
  if ((sBattler_AI & BIT_SIDE) === (gBattlerTarget & BIT_SIDE)) setAiScriptPtr(aiReadPtr(1));
  else setAiScriptPtr(gAIScriptPtr + 5);
}

const RESOURCE_FLAG_FLASH_FIRE = 1 << 0; // 1:1 décomp battle.h:68

function Cmd_if_flash_fired(): void { // 0x61
  const battler = BattleAI_GetWantedBattler(aiByteAt(1));
  if (gBattleResourcesFlags[battler] & RESOURCE_FLAG_FLASH_FIRE) setAiScriptPtr(aiReadPtr(2));
  else setAiScriptPtr(gAIScriptPtr + 6);
}

// ─── AI stack (battle_ai_script_commands.c:2274-2296) ───────────────────────

function AIStackPushVar(varOffset: number): void {
  gAI_ScriptsStack.ptr[gAI_ScriptsStack.size++] = varOffset;
}

/** 1:1 décomp `AIStackPushVar_cursor` (battle_ai_script_commands.c:2279-2282).
 *  `static UNUSED` — dead-code non référencé ; porté pour le miroir intégral. Pousse
 *  le curseur courant `gAIScriptPtr` (et non un offset d'arg) sur la pile AI. */
function AIStackPushVar_cursor(): void {
  gAI_ScriptsStack.ptr[gAI_ScriptsStack.size++] = gAIScriptPtr;
}

function AIStackPop(): boolean {
  if (gAI_ScriptsStack.size !== 0) {
    --gAI_ScriptsStack.size;
    setAiScriptPtr(gAI_ScriptsStack.ptr[gAI_ScriptsStack.size]);
    return true;
  }
  return false;
}

// ─── sBattleAICmdTable[] (battle_ai_script_commands.c:160-261) ──────────────

const sBattleAICmdTable: readonly BattleAICmdFunc[] = [
  Cmd_if_random_less_than,            // 0x0
  Cmd_if_random_greater_than,         // 0x1
  Cmd_if_random_equal,                // 0x2
  Cmd_if_random_not_equal,            // 0x3
  Cmd_score,                          // 0x4
  Cmd_if_hp_less_than,                // 0x5
  Cmd_if_hp_more_than,                // 0x6
  Cmd_if_hp_equal,                    // 0x7
  Cmd_if_hp_not_equal,                // 0x8
  Cmd_if_status,                      // 0x9
  Cmd_if_not_status,                  // 0xA
  Cmd_if_status2,                     // 0xB
  Cmd_if_not_status2,                 // 0xC
  Cmd_if_status3,                     // 0xD
  Cmd_if_not_status3,                 // 0xE
  Cmd_if_side_affecting,              // 0xF
  Cmd_if_not_side_affecting,          // 0x10
  Cmd_if_less_than,                   // 0x11
  Cmd_if_more_than,                   // 0x12
  Cmd_if_equal,                       // 0x13
  Cmd_if_not_equal,                   // 0x14
  Cmd_if_less_than_ptr,               // 0x15
  Cmd_if_more_than_ptr,               // 0x16
  Cmd_if_equal_ptr,                   // 0x17
  Cmd_if_not_equal_ptr,               // 0x18
  Cmd_if_move,                        // 0x19
  Cmd_if_not_move,                    // 0x1A
  Cmd_if_in_bytes,                    // 0x1B
  Cmd_if_not_in_bytes,                // 0x1C
  Cmd_if_in_hwords,                   // 0x1D
  Cmd_if_not_in_hwords,               // 0x1E
  Cmd_if_user_has_attacking_move,     // 0x1F
  Cmd_if_user_has_no_attacking_moves, // 0x20
  Cmd_get_turn_count,                 // 0x21
  Cmd_get_type,                       // 0x22
  Cmd_get_considered_move_power,      // 0x23
  Cmd_get_how_powerful_move_is,       // 0x24
  Cmd_get_last_used_battler_move,     // 0x25
  Cmd_if_equal_,                      // 0x26
  Cmd_if_not_equal_,                  // 0x27
  Cmd_if_user_goes,                   // 0x28
  Cmd_if_user_doesnt_go,              // 0x29
  Cmd_nop_2A,                         // 0x2A
  Cmd_nop_2B,                         // 0x2B
  Cmd_count_usable_party_mons,        // 0x2C
  Cmd_get_considered_move,            // 0x2D
  Cmd_get_considered_move_effect,     // 0x2E
  Cmd_get_ability,                    // 0x2F
  Cmd_get_highest_type_effectiveness, // 0x30
  Cmd_if_type_effectiveness,          // 0x31
  Cmd_nop_32,                         // 0x32
  Cmd_nop_33,                         // 0x33
  Cmd_if_status_in_party,             // 0x34
  Cmd_if_status_not_in_party,         // 0x35
  Cmd_get_weather,                    // 0x36
  Cmd_if_effect,                      // 0x37
  Cmd_if_not_effect,                  // 0x38
  Cmd_if_stat_level_less_than,        // 0x39
  Cmd_if_stat_level_more_than,        // 0x3A
  Cmd_if_stat_level_equal,            // 0x3B
  Cmd_if_stat_level_not_equal,        // 0x3C
  Cmd_if_can_faint,                   // 0x3D
  Cmd_if_cant_faint,                  // 0x3E
  Cmd_if_has_move,                    // 0x3F
  Cmd_if_doesnt_have_move,            // 0x40
  Cmd_if_has_move_with_effect,        // 0x41
  Cmd_if_doesnt_have_move_with_effect,// 0x42
  Cmd_if_any_move_disabled_or_encored,// 0x43
  Cmd_if_curr_move_disabled_or_encored,//0x44
  Cmd_flee,                           // 0x45
  Cmd_if_random_safari_flee,          // 0x46
  Cmd_watch,                          // 0x47
  Cmd_get_hold_effect,                // 0x48
  Cmd_get_gender,                     // 0x49
  Cmd_is_first_turn_for,              // 0x4A
  Cmd_get_stockpile_count,            // 0x4B
  Cmd_is_double_battle,               // 0x4C
  Cmd_get_used_held_item,             // 0x4D
  Cmd_get_move_type_from_result,      // 0x4E
  Cmd_get_move_power_from_result,     // 0x4F
  Cmd_get_move_effect_from_result,    // 0x50
  Cmd_get_protect_count,              // 0x51
  Cmd_nop_52,                         // 0x52
  Cmd_nop_53,                         // 0x53
  Cmd_nop_54,                         // 0x54
  Cmd_nop_55,                         // 0x55
  Cmd_nop_56,                         // 0x56
  Cmd_nop_57,                         // 0x57
  Cmd_call,                           // 0x58
  Cmd_goto,                           // 0x59
  Cmd_end,                            // 0x5A
  Cmd_if_level_cond,                  // 0x5B
  Cmd_if_target_taunted,              // 0x5C
  Cmd_if_target_not_taunted,          // 0x5D
  Cmd_if_target_is_ally,              // 0x5E
  Cmd_is_of_type,                     // 0x5F
  Cmd_check_ability,                  // 0x60
  Cmd_if_flash_fired,                 // 0x61
  Cmd_if_holds_item,                  // 0x62
];

// ─── BattleAI_DoAIProcessing (battle_ai_script_commands.c:572-616) ──────────

function BattleAI_DoAIProcessing(): void {
  while (gAiThinkingStruct.aiState !== AIState_FinishedProcessing) {
    switch (gAiThinkingStruct.aiState) {
      case AIState_DoNotProcess:
        break;
      case AIState_SettingUp: {
        const off = getAiScriptsTableEntry(gAiThinkingStruct.aiLogicId);
        setAiScriptPtr(off < 0 ? getAiScriptsTableEntry(0) : off);
        if (gBattleMons[sBattler_AI].pp[gAiThinkingStruct.movesetIndex] === 0) {
          gAiThinkingStruct.moveConsidered = 0;
        } else {
          gAiThinkingStruct.moveConsidered = gBattleMons[sBattler_AI].moves[gAiThinkingStruct.movesetIndex];
        }
        gAiThinkingStruct.aiState++;
        break;
      }
      case AIState_Processing:
        if (gAiThinkingStruct.moveConsidered !== 0) {
          sBattleAICmdTable[aiByteAt(0)]();
        } else {
          gAiThinkingStruct.score[gAiThinkingStruct.movesetIndex] = 0;
          gAiThinkingStruct.aiAction |= AI_ACTION_DONE;
        }
        if (gAiThinkingStruct.aiAction & AI_ACTION_DONE) {
          gAiThinkingStruct.movesetIndex++;
          if (gAiThinkingStruct.movesetIndex < MAX_MON_MOVES
            && !(gAiThinkingStruct.aiAction & AI_ACTION_DO_NOT_ATTACK)) {
            gAiThinkingStruct.aiState = AIState_SettingUp;
          } else {
            gAiThinkingStruct.aiState++;
          }
          gAiThinkingStruct.aiAction &= ~(AI_ACTION_DONE);
        }
        break;
    }
  }
}

// ─── Move/ability/item history (battle_ai_script_commands.c:618-661) ────────

/** 1:1 décomp `RecordLastUsedMoveByTarget` (618-633). */
function RecordLastUsedMoveByTarget(): void {
  for (let i = 0; i < MAX_MON_MOVES; i++) {
    if (gBattleHistory.usedMoves[gBattlerTarget].moves[i] === gLastMoves[gBattlerTarget]) break;
    if (gBattleHistory.usedMoves[gBattlerTarget].moves[i] === MOVE_NONE) {
      gBattleHistory.usedMoves[gBattlerTarget].moves[i] = gLastMoves[gBattlerTarget];
      break;
    }
  }
}

/** 1:1 décomp `ClearBattlerMoveHistory(u8 battler)` (635-641). */
export function ClearBattlerMoveHistory(battler: number): void {
  for (let i = 0; i < MAX_MON_MOVES; i++) {
    gBattleHistory.usedMoves[battler].moves[i] = MOVE_NONE;
  }
}

/** 1:1 décomp `RecordAbilityBattle(u8 battler, u8 abilityId)` (643-646). */
export function RecordAbilityBattle(battler: number, abilityId: number): void {
  gBattleHistory.abilities[battler] = abilityId;
}

/** 1:1 décomp `ClearBattlerAbilityHistory(u8 battler)` (648-651). */
export function ClearBattlerAbilityHistory(battler: number): void {
  gBattleHistory.abilities[battler] = ABILITY_NONE;
}

/** 1:1 décomp `RecordItemEffectBattle(u8 battler, u8 itemEffect)` (653-656). */
export function RecordItemEffectBattle(battler: number, itemEffect: number): void {
  gBattleHistory.itemEffects[battler] = itemEffect;
}

/** 1:1 décomp `ClearBattlerItemEffectHistory(u8 battler)` (658-661). */
export function ClearBattlerItemEffectHistory(battler: number): void {
  gBattleHistory.itemEffects[battler] = 0;
}

// ─── BattleAI_SetupAIData (battle_ai_script_commands.c:312-380) ─────────────

const MAX_TRAINER_ITEMS = 4; // 1:1 décomp constants/battle.h
// ALL_MOVES_MASK importé de ./constants (1:1 décomp).

/** 1:1 décomp `void BattleAI_SetupAIData(u8 defaultScoreMoves)`. */
export function BattleAI_SetupAIData(defaultScoreMoves: number): void {
  clearAiThinkingStruct();

  let dsm = defaultScoreMoves;
  for (let i = 0; i < MAX_MON_MOVES; i++) {
    gAiThinkingStruct.score[i] = (dsm & 1) ? 100 : 0;
    dsm >>= 1;
  }

  const moveLimitations = CheckMoveLimitations(gActiveBattler, 0, MOVE_LIMITATIONS_ALL);
  for (let i = 0; i < MAX_MON_MOVES; i++) {
    if (gBitTable[i] & moveLimitations) gAiThinkingStruct.score[i] = 0;
    gAiThinkingStruct.simulatedRNG[i] = 100 - (Random() % 16);
  }

  gAI_ScriptsStack.size = 0;
  setBattlerAI(gActiveBattler);

  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
    let tgt = (Random() & BIT_FLANK) + BATTLE_OPPOSITE(GET_BATTLER_SIDE(gActiveBattler));
    if (gAbsentBattlerFlags & gBitTable[tgt]) tgt ^= BIT_FLANK;
    setBattlerTarget(tgt);
  } else {
    setBattlerTarget(BATTLE_OPPOSITE(sBattler_AI));
  }

  // Choose proper trainer ai scripts (1:1 décomp 360-379).
  // RECORDED → décomp GetAiScriptsInRecordedBattle() ; FACTORY → décomp
  // GetAiScriptsInBattleFactory(). Recorded battles + Battle Factory sont
  // deferred (= cohérent avec le reste du port Frontier) : on substitue le
  // trio standard CHECK_BAD_MOVE|CHECK_VIABILITY|TRY_TO_FAINT, identique au
  // path FRONTIER vanilla.
  if (gBattleTypeFlags & BATTLE_TYPE_RECORDED) {
    gAiThinkingStruct.aiFlags = AI_SCRIPT_CHECK_BAD_MOVE | AI_SCRIPT_CHECK_VIABILITY | AI_SCRIPT_TRY_TO_FAINT;
  } else if (gBattleTypeFlags & BATTLE_TYPE_SAFARI) {
    gAiThinkingStruct.aiFlags = AI_SCRIPT_SAFARI;
  } else if (gBattleTypeFlags & BATTLE_TYPE_ROAMER) {
    gAiThinkingStruct.aiFlags = AI_SCRIPT_ROAMING;
  } else if (gBattleTypeFlags & BATTLE_TYPE_FIRST_BATTLE) {
    gAiThinkingStruct.aiFlags = AI_SCRIPT_FIRST_BATTLE;
  } else if (gBattleTypeFlags & BATTLE_TYPE_FACTORY) {
    gAiThinkingStruct.aiFlags = AI_SCRIPT_CHECK_BAD_MOVE | AI_SCRIPT_CHECK_VIABILITY | AI_SCRIPT_TRY_TO_FAINT;
  } else if (gBattleTypeFlags & (BATTLE_TYPE_FRONTIER | BATTLE_TYPE_EREADER_TRAINER | BATTLE_TYPE_TRAINER_HILL | BATTLE_TYPE_SECRET_BASE)) {
    gAiThinkingStruct.aiFlags = AI_SCRIPT_CHECK_BAD_MOVE | AI_SCRIPT_CHECK_VIABILITY | AI_SCRIPT_TRY_TO_FAINT;
  } else if (gBattleTypeFlags & BATTLE_TYPE_TWO_OPPONENTS) {
    gAiThinkingStruct.aiFlags = (_trainerAiFlags(gTrainerBattleOpponent_A) | _trainerAiFlags(gTrainerBattleOpponent_B)) >>> 0;
  } else {
    gAiThinkingStruct.aiFlags = _trainerAiFlags(gTrainerBattleOpponent_A);
  }

  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
    gAiThinkingStruct.aiFlags = (gAiThinkingStruct.aiFlags | AI_SCRIPT_DOUBLE_BATTLE) >>> 0;
  }
}

/** 1:1 décomp `void BattleAI_HandleItemUseBeforeAISetup(u8 defaultScoreMoves)`
 *  (battle_ai_script_commands.c:283-310). */
export function BattleAI_HandleItemUseBeforeAISetup(defaultScoreMoves: number): void {
  clearBattleHistory();

  if ((gBattleTypeFlags & BATTLE_TYPE_TRAINER)
    && !(gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_SAFARI | BATTLE_TYPE_BATTLE_TOWER
      | BATTLE_TYPE_EREADER_TRAINER | BATTLE_TYPE_SECRET_BASE | BATTLE_TYPE_FRONTIER
      | BATTLE_TYPE_INGAME_PARTNER | BATTLE_TYPE_RECORDED_LINK))) {
    const td = _getTrainerData(gTrainerBattleOpponent_A);
    const items = td?.items ?? [];
    for (let i = 0; i < MAX_TRAINER_ITEMS; i++) {
      const itemName = items[i];
      if (itemName && itemName !== 'ITEM_NONE') {
        const itemId = _resolveItemId(itemName);
        if (itemId !== 0) {
          gBattleHistory.trainerItems[gBattleHistory.itemsNo] = itemId;
          gBattleHistory.itemsNo++;
        }
      }
    }
  }

  BattleAI_SetupAIData(defaultScoreMoves);
}

// Item name → id (1:1 : gTrainers[].items[] sont des u16 ITEM_X ; notre JSON les
// stocke en enum-strings). resolveDecompConstant = LE canal items du repo (même
// résolveur que le bridge trainer pour les held items). ⚠️ L'ancienne voie
// `globalThis.__itemsEnum` n'était ÉCRITE NULLE PART → itemId 0 systématique →
// gBattleHistory.trainerItems restait vide → ShouldUseItem ne trouvait JAMAIS
// d'item → l'IA dresseur n'utilisait aucune potion (trou mandat dresseurs).
function _resolveItemId(name: string): number {
  return resolveDecompConstant(name) ?? 0;
}

// ─── ChooseMoveOrAction (battle_ai_script_commands.c:382-570) ───────────────

/** 1:1 décomp `static u8 ChooseMoveOrAction_Singles(void)` (396-446). */
function ChooseMoveOrAction_Singles(): number {
  const currentMoveArray = new Array(MAX_MON_MOVES).fill(0);
  const consideredMoveArray = new Array(MAX_MON_MOVES).fill(0);
  let numOfBestMoves: number;
  let i: number;

  RecordLastUsedMoveByTarget();

  while (gAiThinkingStruct.aiFlags !== 0) {
    if (gAiThinkingStruct.aiFlags & 1) {
      gAiThinkingStruct.aiState = AIState_SettingUp;
      BattleAI_DoAIProcessing();
    }
    gAiThinkingStruct.aiFlags = gAiThinkingStruct.aiFlags >>> 1;
    gAiThinkingStruct.aiLogicId++;
    gAiThinkingStruct.movesetIndex = 0;
  }

  if (gAiThinkingStruct.aiAction & AI_ACTION_FLEE) return AI_CHOICE_FLEE;
  if (gAiThinkingStruct.aiAction & AI_ACTION_WATCH) return AI_CHOICE_WATCH;

  numOfBestMoves = 1;
  currentMoveArray[0] = gAiThinkingStruct.score[0];
  consideredMoveArray[0] = 0;

  for (i = 1; i < MAX_MON_MOVES; i++) {
    if (gBattleMons[sBattler_AI].moves[i] !== MOVE_NONE) {
      if (currentMoveArray[0] === gAiThinkingStruct.score[i]) {
        currentMoveArray[numOfBestMoves] = gAiThinkingStruct.score[i];
        consideredMoveArray[numOfBestMoves++] = i;
      }
      if (currentMoveArray[0] < gAiThinkingStruct.score[i]) {
        numOfBestMoves = 1;
        currentMoveArray[0] = gAiThinkingStruct.score[i];
        consideredMoveArray[0] = i;
      }
    }
  }
  return consideredMoveArray[Random() % numOfBestMoves];
}

/** 1:1 décomp `static u8 ChooseMoveOrAction_Doubles(void)` (448-570). */
function ChooseMoveOrAction_Doubles(): number {
  const bestMovePointsForTarget = new Array(MAX_BATTLERS_COUNT).fill(0);
  const mostViableTargetsArray = new Array(MAX_BATTLERS_COUNT).fill(0);
  const actionOrMoveIndex = new Array(MAX_BATTLERS_COUNT).fill(0);
  const mostViableMovesScores = new Array(MAX_MON_MOVES).fill(0);
  const mostViableMovesIndices = new Array(MAX_MON_MOVES).fill(0);
  let mostViableTargetsNo: number;
  let mostViableMovesNo: number;
  let mostMovePoints: number;
  let i: number;
  let j: number;

  for (i = 0; i < MAX_BATTLERS_COUNT; i++) {
    if (i === sBattler_AI || gBattleMons[i].hp === 0) {
      actionOrMoveIndex[i] = 0xFF;
      bestMovePointsForTarget[i] = -1;
    } else {
      if (gBattleTypeFlags & BATTLE_TYPE_PALACE) {
        BattleAI_SetupAIData(gBattleStruct.palaceFlags >> MAX_BATTLERS_COUNT);
      } else {
        BattleAI_SetupAIData(ALL_MOVES_MASK);
      }
      setBattlerTarget(i);

      if ((i & BIT_SIDE) !== (sBattler_AI & BIT_SIDE)) RecordLastUsedMoveByTarget();

      gAiThinkingStruct.aiLogicId = 0;
      gAiThinkingStruct.movesetIndex = 0;
      let scriptsToRun = gAiThinkingStruct.aiFlags >>> 0;
      while (scriptsToRun !== 0) {
        if (scriptsToRun & 1) {
          gAiThinkingStruct.aiState = AIState_SettingUp;
          BattleAI_DoAIProcessing();
        }
        scriptsToRun = scriptsToRun >>> 1;
        gAiThinkingStruct.aiLogicId++;
        gAiThinkingStruct.movesetIndex = 0;
      }

      if (gAiThinkingStruct.aiAction & AI_ACTION_FLEE) {
        actionOrMoveIndex[i] = AI_CHOICE_FLEE;
      } else if (gAiThinkingStruct.aiAction & AI_ACTION_WATCH) {
        actionOrMoveIndex[i] = AI_CHOICE_WATCH;
      } else {
        mostViableMovesScores[0] = gAiThinkingStruct.score[0];
        mostViableMovesIndices[0] = 0;
        mostViableMovesNo = 1;
        for (j = 1; j < MAX_MON_MOVES; j++) {
          if (gBattleMons[sBattler_AI].moves[j] !== 0) {
            if (mostViableMovesScores[0] === gAiThinkingStruct.score[j]) {
              mostViableMovesScores[mostViableMovesNo] = gAiThinkingStruct.score[j];
              mostViableMovesIndices[mostViableMovesNo] = j;
              mostViableMovesNo++;
            }
            if (mostViableMovesScores[0] < gAiThinkingStruct.score[j]) {
              mostViableMovesScores[0] = gAiThinkingStruct.score[j];
              mostViableMovesIndices[0] = j;
              mostViableMovesNo = 1;
            }
          }
        }
        actionOrMoveIndex[i] = mostViableMovesIndices[Random() % mostViableMovesNo];
        bestMovePointsForTarget[i] = mostViableMovesScores[0];

        if (i === BATTLE_PARTNER(sBattler_AI) && bestMovePointsForTarget[i] < 100) {
          bestMovePointsForTarget[i] = -1;
        }
      }
    }
  }

  mostMovePoints = bestMovePointsForTarget[0];
  mostViableTargetsArray[0] = 0;
  mostViableTargetsNo = 1;

  for (i = 1; i < MAX_BATTLERS_COUNT; i++) {
    if (mostMovePoints === bestMovePointsForTarget[i]) {
      mostViableTargetsArray[mostViableTargetsNo] = i;
      mostViableTargetsNo++;
    }
    if (mostMovePoints < bestMovePointsForTarget[i]) {
      mostMovePoints = bestMovePointsForTarget[i];
      mostViableTargetsArray[0] = i;
      mostViableTargetsNo = 1;
    }
  }

  setBattlerTarget(mostViableTargetsArray[Random() % mostViableTargetsNo]);
  return actionOrMoveIndex[gBattlerTarget];
}

/** 1:1 décomp `u8 BattleAI_ChooseMoveOrAction(void)` (382-394). */
export function BattleAI_ChooseMoveOrAction(): number {
  const savedCurrentMove = gCurrentMove;
  let ret: number;
  if (!(gBattleTypeFlags & BATTLE_TYPE_DOUBLE)) ret = ChooseMoveOrAction_Singles();
  else ret = ChooseMoveOrAction_Doubles();
  setCurrentMove(savedCurrentMove);
  return ret;
}

// Expose pour battle-controller-opponent lazy lookup (= éviter cycle ESM).
// AI_TrySwitchOrUseItem est dans ai-switch-items.ts, set par celui-ci.
// + BattleAI_HandleItemUseBeforeAISetup : appelé par SetUpBattleVarsAndBirchZigzagoon
// (battle-setup-helpers, = battle_controllers.c:66) — l'import direct crée un cycle
// TDZ (boot mort vérifié 2026-07-04) → même pont que le reste de la surface AI.
(globalThis as { __battleAi?: Record<string, unknown> }).__battleAi = {
  ...(globalThis as { __battleAi?: Record<string, unknown> }).__battleAi,
  BattleAI_SetupAIData,
  BattleAI_ChooseMoveOrAction,
  BattleAI_HandleItemUseBeforeAISetup,
  // lecture devtools/sondes (getter : gBattleHistory est déclaré plus BAS → TDZ à l'éval)
  get gBattleHistory() { return gBattleHistory; },
};


// ═══ État AI + structs (battle.h / battle_ai_script_commands.c) — SPLIT depuis
//     engine/battle/ai/ai-state.ts (2026-06-13) : la logique décomp (état mutable +
//     structs) vit dans le miroir ; le runtime bytecode (loader/readers/gAIScriptPtr)
//     reste plateforme dans ai-state.ts. ═══
// ─── Structs 1:1 décomp (include/battle.h) ──────────────────────────────────

/** 1:1 décomp `struct AI_ThinkingStruct` (battle.h:176-188). */
export interface AI_ThinkingStruct {
  aiState: number;          // u8
  movesetIndex: number;     // u8
  moveConsidered: number;   // u16
  score: number[];          // s8[MAX_MON_MOVES]
  funcResult: number;       // u32
  aiFlags: number;          // u32
  aiAction: number;         // u8
  aiLogicId: number;        // u8
  // filler12[6] — padding décomp, non modélisé
  simulatedRNG: number[];   // u8[MAX_MON_MOVES]
}

/** 1:1 décomp `struct UsedMoves` (battle.h:190-194). */
export interface UsedMoves {
  moves: number[];          // u16[MAX_MON_MOVES]
  unknown: number[];        // u16[MAX_MON_MOVES]
}

/** 1:1 décomp `struct BattleHistory` (battle.h:196-203). */
export interface BattleHistory {
  usedMoves: UsedMoves[];   // [MAX_BATTLERS_COUNT]
  abilities: number[];      // u8[MAX_BATTLERS_COUNT]
  itemEffects: number[];    // u8[MAX_BATTLERS_COUNT]
  trainerItems: number[];   // u16[MAX_BATTLERS_COUNT]
  itemsNo: number;          // u8
}

/** 1:1 décomp `struct BattleScriptsStack` (battle.h:205-209).
 *  `const u8 *ptr[8]` → offsets numériques dans BYTECODE dans notre port. */
export interface BattleScriptsStack {
  ptr: number[];            // [8]
  size: number;             // u8
}

function _blankAiThinking(): AI_ThinkingStruct {
  return {
    aiState: 0,
    movesetIndex: 0,
    moveConsidered: 0,
    score: new Array(MAX_MON_MOVES).fill(0),
    funcResult: 0,
    aiFlags: 0,
    aiAction: 0,
    aiLogicId: 0,
    simulatedRNG: new Array(MAX_MON_MOVES).fill(0),
  };
}

function _blankUsedMoves(): UsedMoves {
  return {
    moves: new Array(MAX_MON_MOVES).fill(0),
    unknown: new Array(MAX_MON_MOVES).fill(0),
  };
}

function _blankBattleHistory(): BattleHistory {
  return {
    usedMoves: Array.from({ length: MAX_BATTLERS_COUNT }, () => _blankUsedMoves()),
    abilities: new Array(MAX_BATTLERS_COUNT).fill(0),
    itemEffects: new Array(MAX_BATTLERS_COUNT).fill(0),
    trainerItems: new Array(MAX_BATTLERS_COUNT).fill(0),
    itemsNo: 0,
  };
}

/** 1:1 décomp `AI_THINKING_STRUCT` (= gBattleResources->ai). */
export const gAiThinkingStruct: AI_ThinkingStruct = _blankAiThinking();

/** 1:1 décomp `BATTLE_HISTORY` (= gBattleResources->battleHistory). */
export const gBattleHistory: BattleHistory = _blankBattleHistory();

/** 1:1 décomp `gBattleResources->AI_ScriptsStack`. */
export const gAI_ScriptsStack: BattleScriptsStack = { ptr: new Array(8).fill(0), size: 0 };

/** `for (i=0; i<sizeof(struct AI_ThinkingStruct); i++) data[i] = 0;`
 *  (battle_ai_script_commands.c:319-320). */
export function clearAiThinkingStruct(): void {
  Object.assign(gAiThinkingStruct, _blankAiThinking());
}

/** `for (i=0; i<sizeof(struct BattleHistory); i++) data[i] = 0;`
 *  (battle_ai_script_commands.c:288-289). */
export function clearBattleHistory(): void {
  Object.assign(gBattleHistory, _blankBattleHistory());
}

/** 1:1 décomp `EWRAM_DATA static u8 sBattler_AI`. */
export let sBattler_AI = 0;
export function setBattlerAI(v: number): void { sBattler_AI = v; }