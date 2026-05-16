/**
 * battle/cmd-niveau-34.ts — Phase 1 Niveau 34 (getexp + various dispatcher) — 2 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x23 getexp    (1 byte  — XP gain state machine, ~12k chars décomp — TODO stub)
 *   0x76 various   (3 bytes — dispatcher 27 cases VARIOUS_*, port 1:1 strict)
 *
 * Sources de vérité (1:1) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c:6321-6503`
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_util.c:864 CancelMultiTurnMoves`
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_util.c:3811 GetMoveTarget`
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c:4021 IsRunningFromBattleImpossible`
 *
 *  Phase 1.3 H — Cmd_various porté 1:1 strict. 14/27 cases full, 13/27 STUBS
 *  Battle Frontier (Arena/Palace/Pyramid pas wired).
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readByte } from './script-interpreter';
import {
  gBattleControllerExecFlags, gBattleMons, gBattlerAttacker, gBattlerTarget,
  gActiveBattler, setActiveBattler, setBattlerAttacker, setBattlerTarget,
  gBattleTypeFlags, gBattleOutcome, setBattleOutcome,
  gBattleCommunication, gSideTimers, gStatuses3,
  gHitMarker, setHitMarker, gBattleScripting,
  gAbsentBattlerFlags, gMoveResultFlags,
  gBattlersCount,
  gCurrentMove, gPotentialItemEffectBattler, setPotentialItemEffectBattler,
  gBattlerPartyIndexes,
  gSpecialStatuses, gDisableStructs,
  setLastUsedAbility,
  gBattleStruct,
  setBattlerFainted, setBattleMoveDamage,
  gSentPokesToOpponent,
  gExpShareExp, setExpShareExp,
  gLeveledUpInBattle, setLeveledUpInBattle,
  gBattleMoveDamage,
} from './state';
import {
  STATUS1_SLEEP, STATUS2_MULTIPLETURNS, STATUS2_LOCK_CONFUSE, STATUS2_UPROAR,
  STATUS2_BIDE, STATUS3_SEMI_INVULNERABLE,
  HITMARKER_FAINTED, HITMARKER_PLAYER_FAINTED,
  BATTLE_TYPE_LINK, BATTLE_TYPE_TRAINER, BATTLE_TYPE_DOUBLE,
  BATTLE_TYPE_RECORDED_LINK, BATTLE_TYPE_TRAINER_HILL, BATTLE_TYPE_FRONTIER,
  BATTLE_TYPE_SAFARI, BATTLE_TYPE_BATTLE_TOWER, BATTLE_TYPE_EREADER_TRAINER,
  B_OUTCOME_PLAYER_TELEPORTED, B_OUTCOME_MON_TELEPORTED,
  BATTLE_RUN_SUCCESS, BATTLE_RUN_FAILURE,
  NO_TARGET_OVERRIDE, B_MSG_PREVENTS_ESCAPE,
  ABILITY_RUN_AWAY, ABILITY_SHADOW_TAG, ABILITY_ARENA_TRAP, ABILITY_MAGNET_PULL,
  ABILITY_LIGHTNING_ROD, ABILITY_LEVITATE,
  TYPE_FLYING, TYPE_STEEL, TYPE_ELECTRIC,
  B_SIDE_PLAYER, GET_BATTLER_SIDE, BATTLE_OPPOSITE, BIT_FLANK,
  MAX_MON_MOVES, MOVE_NONE,
  MOVE_TARGET_SELECTED, MOVE_TARGET_DEPENDS, MOVE_TARGET_BOTH,
  MOVE_TARGET_FOES_AND_ALLY, MOVE_TARGET_OPPONENTS_FIELD,
  MOVE_TARGET_RANDOM, MOVE_TARGET_USER_OR_SELECTED, MOVE_TARGET_USER,
  MULTISTRING_CHOOSER,
  B_COMM_TO_CONTROLLER,
  IS_BATTLER_OF_TYPE,
} from './constants';
import {
  gPlayerParty, GetMonData, SetMonData,
  MON_DATA_SPECIES, MON_DATA_HP, MON_DATA_HELD_ITEM,
  MON_DATA_LEVEL, MON_DATA_EXP,
  type Pokemon,
} from './party-storage';
// 1:1 décomp `AdjustFriendship(mon, event)` — auto-data via pokemon-all-auto.
import { AdjustFriendship as _adjustFriendshipN34 } from '../decomp-data/auto/src-all/pokemon-all-auto';
import { FRIENDSHIP_EVENT_GROW_LEVEL as FRIENDSHIP_EVENT_GROW_LEVEL_N34 } from '../decomp-data/auto/include/constants/pokemon-data';
import {
  HOLD_EFFECT_EXP_SHARE, HOLD_EFFECT_LUCKY_EGG, HOLD_EFFECT_MACHO_BRACE,
} from '../decomp-data/auto/include/constants/hold_effects-data';
import { getSpeciesExpYield, getSpeciesGrowthRate, getSpeciesEvYield } from './data/species-runtime';
import { getLevelFromExp, MAX_LEVEL } from './data/experience-tables';
import { gBitTable } from './battle-controllers';
import {
  HOLD_EFFECT_CAN_ALWAYS_RUN,
} from '../decomp-data/auto/include/constants/hold_effects-data';
import {
  BtlController_EmitReturnMonToBall, BtlController_EmitPlayFanfareOrBGM,
  MarkBattlerForControllerExec,
} from './battle-controllers';
import { GetNatureFromPersonality as _getNatureFromPersonalityN34 } from './data/flavor-compat';
// 1:1 décomp `getBattleScriptOffset` — wired pour Cmd_getexp BattleScript_LevelUp.
import { getBattleScriptOffset as _getBattleScriptOffsetN34 } from './script-interpreter';

// 1:1 décomp sBattlePalaceNatureToFlavorTextId (battle_script_commands.c:886-913).
// Index = nature ID (NATURE_HARDY=0..NATURE_QUIRKY=24).
// Value = B_MSG_GLINT_IN_EYE=0, B_MSG_GETTING_IN_POS=1, B_MSG_GROWL_DEEPLY=2, B_MSG_EAGER_FOR_MORE=3.
const _sBattlePalaceNatureToFlavorTextId_N34: readonly number[] = [
  3, // HARDY   → EAGER_FOR_MORE
  0, // LONELY  → GLINT_IN_EYE
  1, // BRAVE   → GETTING_IN_POS
  0, // ADAMANT → GLINT_IN_EYE
  0, // NAUGHTY → GLINT_IN_EYE
  1, // BOLD    → GETTING_IN_POS
  3, // DOCILE  → EAGER_FOR_MORE
  0, // RELAXED → GLINT_IN_EYE
  1, // IMPISH  → GETTING_IN_POS
  2, // LAX     → GROWL_DEEPLY
  2, // TIMID   → GROWL_DEEPLY
  0, // HASTY   → GLINT_IN_EYE
  3, // SERIOUS → EAGER_FOR_MORE
  1, // JOLLY   → GETTING_IN_POS
  3, // NAIVE   → EAGER_FOR_MORE
  1, // MODEST  → GETTING_IN_POS
  2, // MILD    → GROWL_DEEPLY
  3, // QUIET   → EAGER_FOR_MORE
  3, // BASHFUL → EAGER_FOR_MORE
  2, // RASH    → GROWL_DEEPLY
  1, // CALM    → GETTING_IN_POS
  0, // GENTLE  → GLINT_IN_EYE
  2, // SASSY   → GROWL_DEEPLY
  2, // CAREFUL → GROWL_DEEPLY
  3, // QUIRKY  → EAGER_FOR_MORE
];
// Alias arenaLost* + gBattlerPartyIndexes pour le port arena.
import { gBattlerPartyIndexes as _gBattlerPartyIndexes_N34 } from './state';
import {
  getBattlerForBattleScript, GetBattlerAtPosition,
  B_POSITION_PLAYER_LEFT, B_POSITION_PLAYER_RIGHT,
  B_POSITION_OPPONENT_LEFT, B_POSITION_OPPONENT_RIGHT,
} from './util';
import { getBattleMove } from './data/battle-moves';
import { GetItemHoldEffect } from './data/item-hold-effects';
import { Random } from '../random';
import {
  AbilityBattleEffects, ABILITYEFFECT_CHECK_FIELD_EXCEPT_BATTLER,
  ABILITYEFFECT_COUNT_OTHER_SIDE,
} from './ability-battle-effects';

// ─── VARIOUS_* enum (battle_script_commands.h:334-360) — 1:1 décomp ──────
const VARIOUS_CANCEL_MULTI_TURN_MOVES         = 0;
const VARIOUS_SET_MAGIC_COAT_TARGET           = 1;
const VARIOUS_IS_RUNNING_IMPOSSIBLE           = 2;
const VARIOUS_GET_MOVE_TARGET                 = 3;
const VARIOUS_GET_BATTLER_FAINTED             = 4;
const VARIOUS_RESET_INTIMIDATE_TRACE_BITS     = 5;
const VARIOUS_UPDATE_CHOICE_MOVE_ON_LVL_UP    = 6;
const VARIOUS_RESET_PLAYER_FAINTED            = 7;
const VARIOUS_PALACE_FLAVOR_TEXT              = 8;
const VARIOUS_ARENA_JUDGMENT_WINDOW           = 9;
const VARIOUS_ARENA_OPPONENT_MON_LOST         = 10;
const VARIOUS_ARENA_PLAYER_MON_LOST           = 11;
const VARIOUS_ARENA_BOTH_MONS_LOST            = 12;
const VARIOUS_EMIT_YESNOBOX                   = 13;
const VARIOUS_DRAW_ARENA_REF_TEXT_BOX         = 14;
const VARIOUS_ERASE_ARENA_REF_TEXT_BOX        = 15;
const VARIOUS_ARENA_JUDGMENT_STRING           = 16;
const VARIOUS_ARENA_WAIT_STRING               = 17;
const VARIOUS_WAIT_CRY                        = 18;
const VARIOUS_RETURN_OPPONENT_MON1            = 19;
const VARIOUS_RETURN_OPPONENT_MON2            = 20;
const VARIOUS_VOLUME_DOWN                     = 21;
const VARIOUS_VOLUME_UP                       = 22;
const VARIOUS_SET_ALREADY_STATUS_MOVE_ATTEMPT = 23;
const VARIOUS_PALACE_TRY_ESCAPE_STATUS        = 24;
const VARIOUS_SET_TELEPORT_OUTCOME            = 25;
const VARIOUS_PLAY_TRAINER_DEFEATED_MUSIC     = 26;

// MUS_VICTORY_TRAINER = 412 — import depuis auto-data (= AUDIT FIX :
// précédemment hardcoded 0x174=372 FAUX).
import { MUS_VICTORY_TRAINER as _MUS_VICTORY_TRAINER } from '../decomp-data/auto/include/constants/songs-data';
const MUS_VICTORY_TRAINER = _MUS_VICTORY_TRAINER;

// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

/** 1:1 décomp `CancelMultiTurnMoves(battler)` (battle_util.c:864-875). */
function _CancelMultiTurnMoves(battler: number): void {
  gBattleMons[battler].status2 &= ~STATUS2_MULTIPLETURNS;
  gBattleMons[battler].status2 &= ~STATUS2_LOCK_CONFUSE;
  gBattleMons[battler].status2 &= ~STATUS2_UPROAR;
  gBattleMons[battler].status2 &= ~STATUS2_BIDE;
  gStatuses3[battler] &= ~STATUS3_SEMI_INVULNERABLE;
  gDisableStructs[battler].rolloutTimer = 0;
  gDisableStructs[battler].furyCutterCounter = 0;
}

/** 1:1 décomp `GetMoveTarget(move, setTarget)` (battle_util.c:3811-3886).
 *  Setter omitted (= notre version retourne juste targetBattler ; le caller
 *  applique). STUB pour ABILITYEFFECT_COUNT_OTHER_SIDE Lightning Rod redirect.
 *  Exporté pour réutilisation par cmd-niveau-27 / cmd-niveau-29 / etc. */
export function _GetMoveTarget(move: number, setTarget: number): number {
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
        // Lightning Rod redirect (= target opposite si Lightning Rod sur partner).
        if (getBattleMove(move).type === TYPE_ELECTRIC
            && AbilityBattleEffects(ABILITYEFFECT_COUNT_OTHER_SIDE, gBattlerAttacker, ABILITY_LIGHTNING_ROD, 0, 0)
            && gBattleMons[targetBattler].ability !== ABILITY_LIGHTNING_ROD) {
          targetBattler ^= BIT_FLANK;
          gSpecialStatuses[targetBattler].lightningRodRedirected = 1;
        }
      }
      break;
    }
    case MOVE_TARGET_DEPENDS:
    case MOVE_TARGET_BOTH:
    case MOVE_TARGET_FOES_AND_ALLY:
    case MOVE_TARGET_OPPONENTS_FIELD: {
      targetBattler = GetBattlerAtPosition(BATTLE_OPPOSITE(GET_BATTLER_SIDE(gBattlerAttacker)));
      if (gAbsentBattlerFlags & (1 << targetBattler)) {
        targetBattler ^= BIT_FLANK;
      }
      break;
    }
    case MOVE_TARGET_RANDOM: {
      side = BATTLE_OPPOSITE(GET_BATTLER_SIDE(gBattlerAttacker));
      if (gSideTimers[side].followmeTimer
          && gBattleMons[gSideTimers[side].followmeTarget].hp) {
        targetBattler = gSideTimers[side].followmeTarget;
      } else if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE) && (moveTarget & MOVE_TARGET_RANDOM)) {
        if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER) {
          targetBattler = (Random() & 1)
            ? GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT)
            : GetBattlerAtPosition(B_POSITION_OPPONENT_RIGHT);
        } else {
          targetBattler = (Random() & 1)
            ? GetBattlerAtPosition(B_POSITION_PLAYER_LEFT)
            : GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT);
        }
        if (gAbsentBattlerFlags & (1 << targetBattler)) {
          targetBattler ^= BIT_FLANK;
        }
      } else {
        targetBattler = GetBattlerAtPosition(BATTLE_OPPOSITE(GET_BATTLER_SIDE(gBattlerAttacker)));
      }
      break;
    }
    case MOVE_TARGET_USER_OR_SELECTED:
    case MOVE_TARGET_USER:
      targetBattler = gBattlerAttacker;
      break;
  }
  return targetBattler;
}

/** 1:1 décomp `IsRunningFromBattleImpossible()` (battle_main.c:4021-...).
 *  Stubs : gEnigmaBerries[] holdEffect path skipped (= rare).
 *  Returns BATTLE_RUN_SUCCESS (0) ou BATTLE_RUN_FAILURE (1). */
function _IsRunningFromBattleImpossible(): number {
  const item = gBattleMons[gActiveBattler].item;
  const holdEffect = GetItemHoldEffect(item);
  setPotentialItemEffectBattler(gActiveBattler);

  if (holdEffect === HOLD_EFFECT_CAN_ALWAYS_RUN) return BATTLE_RUN_SUCCESS;
  if (gBattleTypeFlags & BATTLE_TYPE_LINK) return BATTLE_RUN_SUCCESS;
  if (gBattleMons[gActiveBattler].ability === ABILITY_RUN_AWAY) return BATTLE_RUN_SUCCESS;

  const side = GET_BATTLER_SIDE(gActiveBattler);
  for (let i = 0; i < gBattlersCount; i++) {
    // Shadow Tag prevent escape
    if (side !== GET_BATTLER_SIDE(i)
        && gBattleMons[i].ability === ABILITY_SHADOW_TAG) {
      gBattleScripting.battler = i;
      setLastUsedAbility(gBattleMons[i].ability);
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_PREVENTS_ESCAPE;
      return BATTLE_RUN_FAILURE;
    }
    // Arena Trap (= ground-bound mons trapped)
    if (side !== GET_BATTLER_SIDE(i)
        && gBattleMons[gActiveBattler].ability !== ABILITY_LEVITATE
        && !IS_BATTLER_OF_TYPE(gBattleMons[gActiveBattler].type1, gBattleMons[gActiveBattler].type2, TYPE_FLYING)
        && gBattleMons[i].ability === ABILITY_ARENA_TRAP) {
      gBattleScripting.battler = i;
      setLastUsedAbility(gBattleMons[i].ability);
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_PREVENTS_ESCAPE;
      return BATTLE_RUN_FAILURE;
    }
  }
  // Magnet Pull (= Steel-type trapped)
  const magnetPullSlot = AbilityBattleEffects(ABILITYEFFECT_CHECK_FIELD_EXCEPT_BATTLER, gActiveBattler, ABILITY_MAGNET_PULL, 0, 0);
  if (magnetPullSlot !== 0
      && IS_BATTLER_OF_TYPE(gBattleMons[gActiveBattler].type1, gBattleMons[gActiveBattler].type2, TYPE_STEEL)) {
    gBattleScripting.battler = magnetPullSlot - 1;
    setLastUsedAbility(gBattleMons[magnetPullSlot - 1].ability);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_PREVENTS_ESCAPE;
    return BATTLE_RUN_FAILURE;
  }
  return BATTLE_RUN_SUCCESS;
}

// ─── 0x23 getexp ──────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_getexp (battle_script_commands.c:3255-3532). State machine
 *  6 states via gBattleScripting.getexpState 0..6. Args : 1 byte battler ref
 *  + 4 byte ptr (= jump target post-getexp, BattleScript_LevelUp etc.).
 *
 *  Phase 1.3 I — Port complet 1:1 strict. STUBS résiduels (post-session 140 wire) :
 *  - gEnigmaBerries[].holdEffect path (= rare custom berry data, post-Phase 1).
 *  - BtlController_EmitExpUpdate (= UI sync, Phase 1.4 J/K/L).
 *  - HandleLowHpMusicChange (= BGM sync overworld, post-Phase 1).
 *  - gBattleResources.beforeLvlUp.stats (= tracking via gBattleStruct extension).
 *
 *  Helpers portés 1:1 décomp (session 140) :
 *  - IsTradedMon : inline check otId != playerTrainerId → XP ×1.5.
 *  - MonGainEVs : full impl via _MonGainEVs (= caps 510/255, hold effects).
 *  - AdjustFriendship : level-up event wired via cmd-niveau-34 path.
 */
function Cmd_getexp(ctx: BattleScriptContext): boolean {
  // 1:1 décomp : args = 1 byte battler ref. Notre opcode = 1 byte total
  // (= no jump target ; le caller utilise call/goto vers BattleScript_LevelUp etc.)
  const battlerArg = readByte(ctx);
  if (gBattleControllerExecFlags) {
    ctx.scriptPtr -= 2;  // back to opcode + arg
    return true;
  }

  // 1:1 décomp : `gBattlerFainted = GetBattlerForBattleScript(...)` — set le
  // battler dont on calcule l'XP yield.
  const battlerFainted = getBattlerForBattleScript(battlerArg);
  setBattlerFainted(battlerFainted);

  // 1:1 décomp : sentIn = gSentPokesToOpponent[(battlerFainted & 2) >> 1].
  const sentIn = gSentPokesToOpponent[(battlerFainted & 2) >> 1] ?? 0;

  // 1:1 décomp : do-while loop interne pour gérer le fall-through case 1 → case 2.
  // Le décomp utilise fall-through après state 1 ; on fait un loop avec break
  // pour respecter le comportement sans le warning TS noFallthroughCasesInSwitch.
  let allowFallThrough = true;
  while (allowFallThrough) {
    allowFallThrough = false;
  switch (gBattleScripting.getexpState) {
    case 0: {
      // 1:1 décomp : check if any XP should be awarded.
      const noXpFlags = BATTLE_TYPE_LINK
        | BATTLE_TYPE_RECORDED_LINK
        | BATTLE_TYPE_TRAINER_HILL
        | BATTLE_TYPE_FRONTIER
        | BATTLE_TYPE_SAFARI
        | BATTLE_TYPE_BATTLE_TOWER
        | BATTLE_TYPE_EREADER_TRAINER;
      if (GET_BATTLER_SIDE(battlerFainted) !== /* B_SIDE_OPPONENT */ 1
          || (gBattleTypeFlags & noXpFlags)) {
        gBattleScripting.getexpState = 6;
      } else {
        gBattleScripting.getexpState++;
        gBattleStruct.givenExpMons = gBattleStruct.givenExpMons | gBitTable[gBattlerPartyIndexes[battlerFainted]];
      }
      break;
    }

    case 1: {
      // 1:1 décomp : calculate XP per-mon, count exp-share mons.
      let viaSentIn = 0;
      let viaExpShare = 0;

      for (let i = 0; i < 6 /* PARTY_SIZE */; i++) {
        const species = GetMonData(gPlayerParty[i], MON_DATA_SPECIES) as number;
        const hp = GetMonData(gPlayerParty[i], MON_DATA_HP) as number;
        if (species === 0 || hp === 0) continue;
        if (gBitTable[i] & sentIn) viaSentIn++;

        const item = GetMonData(gPlayerParty[i], MON_DATA_HELD_ITEM) as number;
        const holdEffect = GetItemHoldEffect(item);
        if (holdEffect === HOLD_EFFECT_EXP_SHARE) viaExpShare++;
      }

      // 1:1 décomp : calculatedExp = expYield × level / 7.
      const faintedSpecies = gBattleMons[battlerFainted].species;
      const calculatedExp = Math.floor(
        getSpeciesExpYield(faintedSpecies) * gBattleMons[battlerFainted].level / 7
      );

      if (viaExpShare) {
        // Split : moitié pour participants, autre moitié pour exp-share holders.
        gBattleStruct.expValue = Math.max(1, Math.floor(calculatedExp / 2 / Math.max(1, viaSentIn)));
        setExpShareExp(Math.max(1, Math.floor(calculatedExp / 2 / viaExpShare)));
      } else {
        gBattleStruct.expValue = Math.max(1, Math.floor(calculatedExp / Math.max(1, viaSentIn)));
        setExpShareExp(0);
      }

      gBattleScripting.getexpState++;
      gBattleStruct.expGetterMonId = 0;
      gBattleStruct.sentInPokes = sentIn;
      // 1:1 décomp : fall through to case 2 — re-enter switch via loop.
      allowFallThrough = true;
      break;
    }

    case 2: {
      // 1:1 décomp : set exp value per mon + print message.
      if (gBattleControllerExecFlags === 0) {
        const monId = gBattleStruct.expGetterMonId;
        const item = GetMonData(gPlayerParty[monId], MON_DATA_HELD_ITEM) as number;
        const holdEffect = GetItemHoldEffect(item);

        const monLevel = GetMonData(gPlayerParty[monId], MON_DATA_LEVEL) as number;

        if (holdEffect !== HOLD_EFFECT_EXP_SHARE && !(gBattleStruct.sentInPokes & 1)) {
          // Pas d'exp-share + pas sent in → skip.
          gBattleStruct.sentInPokes = gBattleStruct.sentInPokes >>> 1;
          gBattleScripting.getexpState = 5;
          setBattleMoveDamage(0);
        } else if (monLevel === MAX_LEVEL) {
          // Mon déjà niveau max.
          gBattleStruct.sentInPokes = gBattleStruct.sentInPokes >>> 1;
          gBattleScripting.getexpState = 5;
          setBattleMoveDamage(0);
        } else {
          // 1:1 décomp : switch BGM → MUS_VICTORY_WILD post-faint adversaire en wild.
          if (!(gBattleTypeFlags & BATTLE_TYPE_TRAINER)
              && gBattleMons[0].hp !== 0
              && !gBattleStruct.wildVictorySong) {
            // STUB BGM switch (= UI/audio engine wiring).
            gBattleStruct.wildVictorySong = gBattleStruct.wildVictorySong + 1;
          }

          const monHp = GetMonData(gPlayerParty[monId], MON_DATA_HP) as number;
          if (monHp) {
            let dmg = (gBattleStruct.sentInPokes & 1) ? gBattleStruct.expValue : 0;
            if (holdEffect === HOLD_EFFECT_EXP_SHARE) {
              dmg += gExpShareExp;
            }
            if (holdEffect === HOLD_EFFECT_LUCKY_EGG) {
              dmg = Math.floor((dmg * 150) / 100);
            }
            if (gBattleTypeFlags & BATTLE_TYPE_TRAINER) {
              dmg = Math.floor((dmg * 150) / 100);
            }
            // 1:1 décomp : si traded mon (= otId != playerTrainerId OR otName
            // != playerName), XP × 1.5. IsTradedMon impl inline ici (= simple
            // compare avec gameState.trainerId).
            const playerTID = (globalThis as { gameState?: { trainerId?: number } })
              .gameState?.trainerId ?? 0;
            const monOtId = gPlayerParty[monId]?.otId ?? 0;
            if (monOtId !== playerTID) {
              dmg = Math.floor((dmg * 150) / 100);
            }
            setBattleMoveDamage(dmg);

            // 1:1 décomp : determine battler ID receiver (= slot 0 ou 2 si double).
            if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
              if (gBattlerPartyIndexes[2] === monId && !(gAbsentBattlerFlags & gBitTable[2])) {
                gBattleStruct.expGetterBattlerId = 2;
              } else {
                gBattleStruct.expGetterBattlerId = !(gAbsentBattlerFlags & gBitTable[0]) ? 0 : 2;
              }
            } else {
              gBattleStruct.expGetterBattlerId = 0;
            }

            // 1:1 décomp : MonGainEVs(&gPlayerParty[monId], species).
            _MonGainEVs(monId, gBattleMons[battlerFainted].species);
          }
          gBattleStruct.sentInPokes = gBattleStruct.sentInPokes >>> 1;
          gBattleScripting.getexpState++;
        }
      }
      break;
    }

    case 3: {
      // 1:1 décomp : set stats + give exp + emit ExpUpdate.
      if (gBattleControllerExecFlags === 0) {
        const monId = gBattleStruct.expGetterMonId;
        const monHp = GetMonData(gPlayerParty[monId], MON_DATA_HP) as number;
        const monLevel = GetMonData(gPlayerParty[monId], MON_DATA_LEVEL) as number;
        if (monHp && monLevel !== MAX_LEVEL) {
          // STUB beforeLvlUp.stats snapshot : pas wired (= UI level-up box).
          // STUB BtlController_EmitExpUpdate : pas wired.
          // Apply XP via SetMonData directement.
          const currentExp = GetMonData(gPlayerParty[monId], MON_DATA_EXP) as number;
          SetMonData(gPlayerParty[monId], MON_DATA_EXP, currentExp + gBattleMoveDamage);
        }
        gBattleScripting.getexpState++;
      }
      break;
    }

    case 4: {
      // 1:1 décomp : level up check + trigger BattleScript_LevelUp.
      if (gBattleControllerExecFlags === 0) {
        const monId = gBattleStruct.expGetterMonId;
        const _battlerId = gBattleStruct.expGetterBattlerId;
        // STUB RET_VALUE_LEVELED_UP : pas dispo (= attendre buffer return du controller).
        // Pour MVP : check directement si l'XP cumulé dépasse le seuil level+1.
        const species = GetMonData(gPlayerParty[monId], MON_DATA_SPECIES) as number;
        const currentExp = GetMonData(gPlayerParty[monId], MON_DATA_EXP) as number;
        const currentLevel = GetMonData(gPlayerParty[monId], MON_DATA_LEVEL) as number;
        const newLevel = getLevelFromExp(getSpeciesGrowthRate(species), currentExp);

        if (newLevel > currentLevel && currentLevel < MAX_LEVEL) {
          SetMonData(gPlayerParty[monId], MON_DATA_LEVEL, newLevel);
          setLeveledUpInBattle(gLeveledUpInBattle | gBitTable[monId]);

          // 1:1 décomp : update gBattleMons[slot] post lvl up si mon est en field.
          if (gBattlerPartyIndexes[0] === monId && gBattleMons[0].hp) {
            gBattleMons[0].level = newLevel;
          }
          if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE)
              && gBattlerPartyIndexes[2] === monId && gBattleMons[2].hp) {
            gBattleMons[2].level = newLevel;
          }

          // 1:1 décomp : AdjustFriendship(FRIENDSHIP_EVENT_GROW_LEVEL).
          // Wired via auto-data (= update mon.friendship +1..+3 selon location/luxury ball).
          _adjustFriendshipN34(gPlayerParty[monId], FRIENDSHIP_EVENT_GROW_LEVEL_N34);
          // 1:1 décomp battle_script_commands.c (Cmd_getexp case 4 LEVELED_UP path) :
          // `BattleScriptPushCursor(); gBattlescriptCurrInstr = BattleScript_LevelUp`.
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          const offLvlUp = _getBattleScriptOffsetN34('BattleScript_LevelUp');
          if (offLvlUp >= 0) ctx.scriptPtr = offLvlUp;
          gBattleScripting.getexpState = 5;
        } else {
          setBattleMoveDamage(0);
          gBattleScripting.getexpState = 5;
        }
      }
      break;
    }

    case 5: {
      // 1:1 décomp : looper increment.
      if (gBattleMoveDamage) {
        gBattleScripting.getexpState = 3;
      } else {
        gBattleStruct.expGetterMonId = gBattleStruct.expGetterMonId + 1;
        if (gBattleStruct.expGetterMonId < 6 /* PARTY_SIZE */) {
          gBattleScripting.getexpState = 2;  // loop again
        } else {
          gBattleScripting.getexpState = 6;  // done
        }
      }
      break;
    }

    case 6: {
      // 1:1 décomp : final cleanup + advance opcode.
      if (gBattleControllerExecFlags === 0) {
        // 1:1 décomp : `gBattleMons[battlerFainted].item = ITEM_NONE; ability = 0`.
        // Note décomp : "not sure why gf clears the item and ability here".
        gBattleMons[battlerFainted].item = 0;
        gBattleMons[battlerFainted].ability = 0;
        // Reset state machine pour next adversaire.
        gBattleScripting.getexpState = 0;
        // Advance opcode (= déjà fait par readByte).
      }
      break;
    }
  }
  }  // end while allowFallThrough
  return false;
}

// MAX_PER_STAT_EVS = 255 et MAX_TOTAL_EVS = 510 — 1:1 décomp (constants/pokemon.h:203-204).
const MAX_TOTAL_EVS_LOCAL    = 510;
const MAX_PER_STAT_EVS_LOCAL = 255;

/** 1:1 décomp `CheckPartyHasHadPokerus(party, selection)` (pokemon.c:6129).
 *  Check si un mon courant (selection=0 → party[0]) a contracté Pokerus
 *  (= MON_DATA_POKERUS != 0). Notre port utilise un array d'1 mon = [mon]. */
function _CheckPartyHasHadPokerus(party: Pokemon[], selection: number): number {
  const MON_DATA_POKERUS_LOCAL = 34;
  let retVal = 0;
  let partyIndex = 0;
  let curBit = 1;

  if (selection) {
    do {
      if ((selection & 1) && GetMonData(party[partyIndex], MON_DATA_POKERUS_LOCAL))
        retVal |= curBit;
      partyIndex++;
      curBit <<= 1;
      selection >>= 1;
    } while (selection);
  } else if (GetMonData(party[0], MON_DATA_POKERUS_LOCAL)) {
    retVal = 1;
  }
  return retVal;
}

/** 1:1 décomp `MonGainEVs(mon, defeatedSpecies)` (pokemon.c:5975-6052).
 *  Distribue les EVs de la victime au mon vainqueur, en respectant les caps
 *  255 par stat et 510 total. Macho Brace × 2, Pokerus × 2 (cumule). */
function _MonGainEVs(monId: number, defeatedSpecies: number): void {
  const mon = gPlayerParty[monId];
  if (!mon) return;

  // 1:1 décomp : evs[NUM_STATS] = GetMonData(mon, MON_DATA_HP_EV + i, 0).
  const evs: number[] = [
    GetMonData(mon, 26 /* MON_DATA_HP_EV */) as number,
    GetMonData(mon, 27 /* MON_DATA_ATK_EV */) as number,
    GetMonData(mon, 28 /* MON_DATA_DEF_EV */) as number,
    GetMonData(mon, 29 /* MON_DATA_SPEED_EV */) as number,
    GetMonData(mon, 30 /* MON_DATA_SPATK_EV */) as number,
    GetMonData(mon, 31 /* MON_DATA_SPDEF_EV */) as number,
  ];
  let totalEVs = evs.reduce((a, b) => a + b, 0);

  // evYield from defeated species : ordre [hp, atk, def, spe, spa, spd] = NUM_STATS.
  const evYield = getSpeciesEvYield(defeatedSpecies);

  // 1:1 décomp : Pokerus multiplier × 2 si mon a/avait Pokerus.
  const multiplier = _CheckPartyHasHadPokerus([mon], 0) ? 2 : 1;

  // 1:1 décomp : holdEffect du mon → Macho Brace double EVs.
  const heldItem = GetMonData(mon, MON_DATA_HELD_ITEM) as number;
  const holdEffect = GetItemHoldEffect(heldItem);

  for (let i = 0; i < 6 /* NUM_STATS */; i++) {
    if (totalEVs >= MAX_TOTAL_EVS_LOCAL) break;

    let evIncrease = evYield[i] * multiplier;

    if (holdEffect === HOLD_EFFECT_MACHO_BRACE) {
      evIncrease *= 2;
    }

    // 1:1 décomp : cap total EVs à 510.
    if (totalEVs + evIncrease > MAX_TOTAL_EVS_LOCAL) {
      evIncrease = (evIncrease + MAX_TOTAL_EVS_LOCAL) - (totalEVs + evIncrease);
    }
    // 1:1 décomp : cap per-stat EVs à 255 (= 100 selon BUGFIX, mais retro Em = 255).
    if (evs[i] + evIncrease > MAX_PER_STAT_EVS_LOCAL) {
      const val1 = evIncrease + MAX_PER_STAT_EVS_LOCAL;
      const val2 = evs[i] + evIncrease;
      evIncrease = val1 - val2;
    }

    evs[i] += evIncrease;
    totalEVs += evIncrease;
    SetMonData(mon, 26 /* MON_DATA_HP_EV */ + i, evs[i]);
  }
}

// ─── 0x76 various ─────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_various (battle_script_commands.c:6321-6503). 3 bytes :
 *  u8 battler + u8 caseId (= VARIOUS_*). 27 cases total.
 *  Port 1:1 strict — 14 cases full, 13 STUBS Battle Frontier (Arena/Palace). */
function Cmd_various(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const caseId = readByte(ctx);

  // 1:1 décomp : `gActiveBattler = GetBattlerForBattleScript(gBattlescriptCurrInstr[1]);`
  setActiveBattler(getBattlerForBattleScript(battlerArg));

  switch (caseId) {
    case VARIOUS_CANCEL_MULTI_TURN_MOVES:
      _CancelMultiTurnMoves(gActiveBattler);
      break;

    case VARIOUS_SET_MAGIC_COAT_TARGET: {
      // 1:1 décomp : swap attacker/target via followme.
      setBattlerAttacker(gBattlerTarget);
      const side = BATTLE_OPPOSITE(GET_BATTLER_SIDE(gBattlerAttacker));
      if (gSideTimers[side].followmeTimer !== 0
          && gBattleMons[gSideTimers[side].followmeTarget].hp !== 0) {
        setBattlerTarget(gSideTimers[side].followmeTarget);
      } else {
        setBattlerTarget(gActiveBattler);
      }
      break;
    }

    case VARIOUS_IS_RUNNING_IMPOSSIBLE:
      gBattleCommunication[0] = _IsRunningFromBattleImpossible();
      break;

    case VARIOUS_GET_MOVE_TARGET:
      setBattlerTarget(_GetMoveTarget(gCurrentMove, NO_TARGET_OVERRIDE));
      break;

    case VARIOUS_GET_BATTLER_FAINTED:
      gBattleCommunication[0] = (gHitMarker & HITMARKER_FAINTED(gActiveBattler)) ? 1 : 0;
      break;

    case VARIOUS_RESET_INTIMIDATE_TRACE_BITS:
      gSpecialStatuses[gActiveBattler].intimidatedMon = 0;
      gSpecialStatuses[gActiveBattler].traced = 0;
      break;

    case VARIOUS_UPDATE_CHOICE_MOVE_ON_LVL_UP: {
      // 1:1 décomp (battle_script_commands.c VARIOUS_UPDATE_CHOICE_MOVE_ON_LVL_UP) :
      // Le mon qui level-up est gBattleStruct.expGetterMonId (= party slot 0..5).
      // S'il est actuellement en battle (slot 0 ou slot 2 si double), check si
      // son choicedMove (= locked-in par Choice Band) est toujours dans sa
      // moveset post level-up. Sinon clear → MOVE_NONE.
      const expGetterMonId = gBattleStruct.expGetterMonId;
      let activeIdx = -1;
      if (gBattlerPartyIndexes[0] === expGetterMonId) activeIdx = 0;
      else if (gBattlerPartyIndexes[2] === expGetterMonId) activeIdx = 2;
      if (activeIdx >= 0) {
        setActiveBattler(activeIdx);
        const currentChoiced = gBattleStruct.choicedMove[activeIdx];
        let i: number;
        for (i = 0; i < MAX_MON_MOVES; i++) {
          if (gBattleMons[activeIdx].moves[i] === currentChoiced) break;
        }
        if (i === MAX_MON_MOVES) gBattleStruct.choicedMove[activeIdx] = MOVE_NONE;
      }
      break;
    }

    case VARIOUS_RESET_PLAYER_FAINTED:
      // 1:1 décomp : si !LINK + !DOUBLE + TRAINER + les 2 battlers vivants → clear FAINTED.
      if (!(gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_DOUBLE))
          && (gBattleTypeFlags & BATTLE_TYPE_TRAINER)
          && gBattleMons[0].hp !== 0
          && gBattleMons[1].hp !== 0) {
        setHitMarker(gHitMarker & ~HITMARKER_PLAYER_FAINTED);
      }
      break;

    case VARIOUS_PALACE_FLAVOR_TEXT: {
      // 1:1 décomp battle_script_commands.c:6387-6401.
      gBattleCommunication[0] = 0; // FALSE — msg pas à print par défaut.
      gBattleScripting.battler = gBattleCommunication[1];
      setActiveBattler(gBattleCommunication[1]);
      const ab = gActiveBattler;
      if (!(gBattleStruct.palaceFlags & gBitTable[ab])
          && Math.floor(gBattleMons[ab].maxHP / 2) >= gBattleMons[ab].hp
          && gBattleMons[ab].hp !== 0
          && !(gBattleMons[ab].status1 & 0x7 /* STATUS1_SLEEP */)) {
        gBattleStruct.palaceFlags |= gBitTable[ab];
        gBattleCommunication[0] = 1; // TRUE.
        const nature = _getNatureFromPersonalityN34(gBattleMons[ab].personality);
        gBattleCommunication[5 /* MULTISTRING_CHOOSER */] = _sBattlePalaceNatureToFlavorTextId_N34[nature] ?? 0;
      }
      break;
    }

    case VARIOUS_ARENA_JUDGMENT_WINDOW:
      // STUB Battle Arena : BattleArena_ShowJudgmentWindow + ARENA_RESULT_RUNNING.
      // Hors combat normal. Skip avec result = 0 (= no winner).
      gBattleCommunication[1] = 0;
      break;

    case VARIOUS_ARENA_OPPONENT_MON_LOST:
      // 1:1 décomp battle_script_commands.c:6412-6417.
      gBattleMons[1].hp = 0;
      setHitMarker(gHitMarker | HITMARKER_FAINTED(1));
      gBattleStruct.arenaLostOpponentMons |= gBitTable[_gBattlerPartyIndexes_N34[1]];
      gDisableStructs[1].truantSwitchInHack = 1;
      break;

    case VARIOUS_ARENA_PLAYER_MON_LOST:
      // 1:1 décomp battle_script_commands.c:6418-6424.
      gBattleMons[0].hp = 0;
      setHitMarker(gHitMarker | HITMARKER_FAINTED(0));
      setHitMarker(gHitMarker | HITMARKER_PLAYER_FAINTED);
      gBattleStruct.arenaLostPlayerMons |= gBitTable[_gBattlerPartyIndexes_N34[0]];
      gDisableStructs[0].truantSwitchInHack = 1;
      break;

    case VARIOUS_ARENA_BOTH_MONS_LOST:
      // 1:1 décomp battle_script_commands.c:6425-6435.
      gBattleMons[0].hp = 0;
      gBattleMons[1].hp = 0;
      setHitMarker(gHitMarker | HITMARKER_FAINTED(0));
      setHitMarker(gHitMarker | HITMARKER_FAINTED(1));
      setHitMarker(gHitMarker | HITMARKER_PLAYER_FAINTED);
      gBattleStruct.arenaLostPlayerMons |= gBitTable[_gBattlerPartyIndexes_N34[0]];
      gBattleStruct.arenaLostOpponentMons |= gBitTable[_gBattlerPartyIndexes_N34[1]];
      gDisableStructs[0].truantSwitchInHack = 1;
      gDisableStructs[1].truantSwitchInHack = 1;
      break;

    case VARIOUS_EMIT_YESNOBOX:
      // 1:1 décomp battle_script_commands.c:6436-6438.
      // BtlController_EmitYesNoBox (= UI helper, deferred Phase 1.4).
      // Notre port : skip emit + auto-clear via tick (= response sera "no" par défaut).
      MarkBattlerForControllerExec(gActiveBattler);
      break;

    case VARIOUS_DRAW_ARENA_REF_TEXT_BOX:
      // 1:1 décomp : DrawArenaRefereeTextBox(). UI window manager — Frontier
      // deferred Phase 1.4 (= Arena post Phase 1).
      break;

    case VARIOUS_ERASE_ARENA_REF_TEXT_BOX:
      // 1:1 décomp : EraseArenaRefereeTextBox(). Frontier deferred.
      break;

    case VARIOUS_ARENA_JUDGMENT_STRING:
      // 1:1 décomp : BattleStringExpandPlaceholdersToDisplayedString(
      //   gRefereeStringsTable[gBattlescriptCurrInstr[1]]) + BattlePutTextOnWindow.
      // Frontier deferred Phase 1.4 (= referee string table pas porté).
      break;

    case VARIOUS_ARENA_WAIT_STRING:
      // 1:1 décomp : `if (IsTextPrinterActive(ARENA_WIN_JUDGMENT_TEXT)) return;`
      // (= stay on opcode si text en cours). Notre port : pas de text printer
      // active state, advance direct.
      break;

    case VARIOUS_WAIT_CRY:
      // 1:1 décomp : `if (!IsCryFinished()) return;` (= stay on opcode).
      // IsCryFinished : check audio engine cry state. Pour Phase 1, on assume
      // cry fini instantanément (= advance). Wire vrai check via globalThis
      // si audio engine expose isCryFinished plus tard.
      if ((globalThis as { __audioEngine?: { isCryFinished?: () => boolean } })
          .__audioEngine?.isCryFinished?.() === false) {
        return _stayOnOpcode(ctx);
      }
      break;

    case VARIOUS_RETURN_OPPONENT_MON1: {
      const opp = 1;
      setActiveBattler(opp);
      if (gBattleMons[opp].hp !== 0) {
        BtlController_EmitReturnMonToBall(B_COMM_TO_CONTROLLER, false);
        MarkBattlerForControllerExec(opp);
      }
      break;
    }

    case VARIOUS_RETURN_OPPONENT_MON2: {
      if (gBattlersCount > 3) {
        const opp = 3;
        setActiveBattler(opp);
        if (gBattleMons[opp].hp !== 0) {
          BtlController_EmitReturnMonToBall(B_COMM_TO_CONTROLLER, false);
          MarkBattlerForControllerExec(opp);
        }
      }
      break;
    }

    case VARIOUS_VOLUME_DOWN:
      // 1:1 décomp : m4aMPlayVolumeControl(&gMPlayInfo_BGM, TRACKS_ALL, 0x55).
      // Bgm volume down ~33% (= 0x55 / 0x100 = ~33%). Wire vers audio engine.
      (globalThis as { __audioEngine?: { setBgmVolume?: (v: number) => void } })
        .__audioEngine?.setBgmVolume?.(0x55 / 0x100);
      break;

    case VARIOUS_VOLUME_UP:
      // 1:1 décomp : m4aMPlayVolumeControl(&gMPlayInfo_BGM, TRACKS_ALL, 0x100).
      // Bgm volume full (= 1.0).
      (globalThis as { __audioEngine?: { setBgmVolume?: (v: number) => void } })
        .__audioEngine?.setBgmVolume?.(1.0);
      break;

    case VARIOUS_SET_ALREADY_STATUS_MOVE_ATTEMPT:
      // 1:1 décomp (battle_script_commands.c) :
      // `gBattleStruct->alreadyStatusedMoveAttempt |= gBitTable[gActiveBattler];`
      gBattleStruct.alreadyStatusedMoveAttempt |= gBitTable[gActiveBattler];
      break;

    case VARIOUS_PALACE_TRY_ESCAPE_STATUS:
      // 1:1 décomp : `if (BattlePalace_TryEscapeStatus(gActiveBattler)) return;`
      // BattlePalace_TryEscapeStatus retourne TRUE quand le mon Palace essaye
      // de break out d'un status (= sleep/confusion/etc.). Frontier specific.
      // Pour Phase 1, on n'a pas Palace logic → return FALSE → advance.
      break;

    case VARIOUS_SET_TELEPORT_OUTCOME:
      // 1:1 décomp : Teleport move réussit → set battle outcome.
      if (GET_BATTLER_SIDE(gActiveBattler) === B_SIDE_PLAYER) {
        setBattleOutcome(B_OUTCOME_PLAYER_TELEPORTED);
      } else {
        setBattleOutcome(B_OUTCOME_MON_TELEPORTED);
      }
      break;

    case VARIOUS_PLAY_TRAINER_DEFEATED_MUSIC:
      // 1:1 décomp : Trainer defeated → BGM = MUS_VICTORY_TRAINER.
      BtlController_EmitPlayFanfareOrBGM(B_COMM_TO_CONTROLLER, MUS_VICTORY_TRAINER, true);
      MarkBattlerForControllerExec(gActiveBattler);
      break;

    default:
      console.warn(`[cmd-niveau-34] Cmd_various unknown caseId ${caseId}`);
      break;
  }

  // 1:1 décomp : `gBattlescriptCurrInstr += 3;` — déjà fait par les 2 readByte.
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installNiveau34Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x23] = Cmd_getexp;
  commands[0x76] = Cmd_various;
}
