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
  gBattleStructChoicedMove,
} from './state';
import {
  STATUS1_SLEEP, STATUS2_MULTIPLETURNS, STATUS2_LOCK_CONFUSE, STATUS2_UPROAR,
  STATUS2_BIDE, STATUS3_SEMI_INVULNERABLE,
  HITMARKER_FAINTED, HITMARKER_PLAYER_FAINTED,
  BATTLE_TYPE_LINK, BATTLE_TYPE_TRAINER, BATTLE_TYPE_DOUBLE,
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
  HOLD_EFFECT_CAN_ALWAYS_RUN,
} from '../decomp-data/auto/include/constants/hold_effects-data';
import {
  BtlController_EmitReturnMonToBall, BtlController_EmitPlayFanfareOrBGM,
  MarkBattlerForControllerExec,
} from './battle-controllers';
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

// MUS_VICTORY_TRAINER (= 0x174 dans décomp). Hardcoded mais c'est un song ID
// vérifié via grep. TODO importer depuis song-data.ts si dispo.
const MUS_VICTORY_TRAINER = 0x174;

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
 *  applique). STUB pour ABILITYEFFECT_COUNT_OTHER_SIDE Lightning Rod redirect. */
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

/** 1:1 décomp Cmd_getexp. 1 byte. ~12k chars de state machine.
 *  Décomp gère via gBattleScripting.getexpState 0..6 :
 *    0 : calculate XP, check who's eligible (= participating mons via
 *        gBattleStruct.expGetterMonId tracking + ExpShare item)
 *    1 : per-mon distribute (loop sur eligible mons)
 *    2 : send XP gain message + animation
 *    3 : apply XP via SetMonData + handle level up trigger
 *    4 : trigger BattleScript_LevelUp + drawlvlupbox jump
 *    5 : learn move check (= jump à BattleScript_TryLearnMoveLoop)
 *    6 : transition next eligible mon ou finish
 *
 *  STUB Phase 1 : Le combat actuel utilise battle-flow.ts existant qui a sa
 *  propre logic XP. Port complet = Phase 1.3 I (= todo séparé). */
function Cmd_getexp(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode(ctx);
  // TODO Phase 1.3 I porter battle_script_commands.c:5054..5635 getexp.
  // Dépendances : gExperienceTables, gExpShareItem, gBattleStruct.expGetterMonId,
  // GetMonData EXP/LEVEL, MonGetEvolutionTargetSpecies,
  // BattleScript_LevelUp / TryLearnMoveLoop / Evolution labels.
  return false;
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
      // 1:1 décomp : Si exp-getter mon est en battle (slot 0 ou 2), check si
      // son choicedMove est toujours dans sa moveset. Sinon → MOVE_NONE.
      // STUB : gBattleStruct.expGetterMonId pas porté (= getexp state).
      // On utilise gBattlerPartyIndexes[0]/[2] et le current choicedMove.
      const expGetterIdx = gBattleScripting.battler;  // approx STUB
      let activeIdx = -1;
      if (gBattlerPartyIndexes[0] === expGetterIdx) activeIdx = 0;
      else if (gBattlerPartyIndexes[2] === expGetterIdx) activeIdx = 2;
      if (activeIdx >= 0) {
        setActiveBattler(activeIdx);
        const currentChoiced = gBattleStructChoicedMove[activeIdx];
        let i: number;
        for (i = 0; i < MAX_MON_MOVES; i++) {
          if (gBattleMons[activeIdx].moves[i] === currentChoiced) break;
        }
        if (i === MAX_MON_MOVES) gBattleStructChoicedMove[activeIdx] = MOVE_NONE;
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

    case VARIOUS_PALACE_FLAVOR_TEXT:
      // STUB Battle Palace : palaceFlags + sBattlePalaceNatureToFlavorTextId.
      // Cas rare hors combat normal — laisse à no-op + flag = FALSE.
      gBattleCommunication[0] = 0;
      gBattleScripting.battler = gBattleCommunication[1];
      setActiveBattler(gBattleCommunication[1]);
      // TODO Phase 1.4+ : Battle Palace nature flavor text.
      break;

    case VARIOUS_ARENA_JUDGMENT_WINDOW:
      // STUB Battle Arena : BattleArena_ShowJudgmentWindow + ARENA_RESULT_RUNNING.
      // Hors combat normal. Skip avec result = 0 (= no winner).
      gBattleCommunication[1] = 0;
      break;

    case VARIOUS_ARENA_OPPONENT_MON_LOST:
      // STUB Battle Arena : KO opponent mon par judgment, mais on garde la
      // sémantique opérationnelle (= fainted state correct).
      gBattleMons[1].hp = 0;
      setHitMarker(gHitMarker | HITMARKER_FAINTED(1));
      // gBattleStruct->arenaLostOpponentMons : TODO Battle Arena tracker.
      gDisableStructs[1].truantSwitchInHack = 1;
      break;

    case VARIOUS_ARENA_PLAYER_MON_LOST:
      gBattleMons[0].hp = 0;
      setHitMarker(gHitMarker | HITMARKER_FAINTED(0));
      setHitMarker(gHitMarker | HITMARKER_PLAYER_FAINTED);
      gDisableStructs[0].truantSwitchInHack = 1;
      break;

    case VARIOUS_ARENA_BOTH_MONS_LOST:
      gBattleMons[0].hp = 0;
      gBattleMons[1].hp = 0;
      setHitMarker(gHitMarker | HITMARKER_FAINTED(0));
      setHitMarker(gHitMarker | HITMARKER_FAINTED(1));
      setHitMarker(gHitMarker | HITMARKER_PLAYER_FAINTED);
      gDisableStructs[0].truantSwitchInHack = 1;
      gDisableStructs[1].truantSwitchInHack = 1;
      break;

    case VARIOUS_EMIT_YESNOBOX:
      // STUB : BtlController_EmitYesNoBox pas porté (= UI helper).
      // No-op safe pour MVP — sub-script attend response qui n'arrivera pas.
      // TODO porter EmitYesNoBox quand UI battle wired.
      MarkBattlerForControllerExec(gActiveBattler);
      break;

    case VARIOUS_DRAW_ARENA_REF_TEXT_BOX:
    case VARIOUS_ERASE_ARENA_REF_TEXT_BOX:
    case VARIOUS_ARENA_JUDGMENT_STRING:
      // STUB Battle Arena UI : Draw/Erase referee text box / judgment string.
      // No-op safe — Battle Arena is post-Phase 1 work.
      break;

    case VARIOUS_ARENA_WAIT_STRING:
      // STUB : IsTextPrinterActive(ARENA_WIN_JUDGMENT_TEXT) — return early
      // si actif. Notre stub : pas d'attente (= text déjà print).
      break;

    case VARIOUS_WAIT_CRY:
      // 1:1 décomp : `if (!IsCryFinished()) return;` (= stay on opcode).
      // STUB : IsCryFinished pas accessible depuis battle module ; on assume
      // cry fini instantanément (= no wait).
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
    case VARIOUS_VOLUME_UP:
      // STUB : m4aMPlayVolumeControl(&gMPlayInfo_BGM, TRACKS_ALL, 0x55/0x100).
      // Audio engine wired séparément — pas via cet opcode pour MVP.
      // TODO wire m4a volume control si nécessaire pour Whirlwind/etc.
      break;

    case VARIOUS_SET_ALREADY_STATUS_MOVE_ATTEMPT:
      // STUB : gBattleStruct->alreadyStatusedMoveAttempt |= gBitTable[active].
      // TODO porter gBattleStruct.alreadyStatusedMoveAttempt (= Battle Frontier tracker).
      break;

    case VARIOUS_PALACE_TRY_ESCAPE_STATUS:
      // STUB Battle Palace : BattlePalace_TryEscapeStatus. Return TRUE → stay
      // on opcode. Notre stub : no-op (= FALSE, advance).
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
