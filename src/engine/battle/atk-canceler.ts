/**
 * battle/atk-canceler.ts — Port 1:1 décomp `AtkCanceler_UnableToUseMove`
 * (battle_util.c:1985-2270).
 *
 * Status checks au début de chaque move (= sleep counter decrement, freeze
 * thaw chance, paralysis 25% fail, confusion damage self, flinch, attract,
 * truant, disable, taunt, imprison, bide, etc.).
 *
 * State machine : `gBattleStruct->atkCancelerTracker` 0..14. CANCELER_END = 14.
 *
 * Retours :
 *   0 = move proceeds normally (= advance opcode).
 *   1 = move cancelled, BattleScript jump set (= effect "1" décomp).
 *   2 = move cancelled + status1 needs Emit SetMonData sync (= effect "2").
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_util.c:1985-2270`.
 */

import {
  gBattleMons, gBattlerAttacker, gBattlerTarget, setBattlerTarget,
  gCurrentMove, setCurrentMove,
  gHitMarker, setHitMarker, gStatuses3,
  gBattleMoveDamage, setBattleMoveDamage,
  gBattleCommunication, gBattleScripting,
  gProtectStructs, gDisableStructs,
  gBideDmg, gBideTarget, gAbsentBattlerFlags,
  gMoveResultFlags, setMoveResultFlags,
  gBattleStructAtkCancelerTracker, setBattleStructAtkCancelerTracker,
} from './state';
import {
  STATUS1_SLEEP, STATUS1_FREEZE, STATUS1_PARALYSIS,
  STATUS2_DESTINY_BOND, STATUS2_NIGHTMARE,
  STATUS2_RECHARGE, STATUS2_FLINCHED,
  STATUS2_INFATUATION, STATUS2_CONFUSION, STATUS2_CONFUSION_TURN,
  STATUS2_BIDE, STATUS2_BIDE_TURN,
  STATUS3_GRUDGE,
  HITMARKER_UNABLE_TO_USE_MOVE, HITMARKER_NO_ATTACKSTRING,
  MULTISTRING_CHOOSER,
  B_MSG_WOKE_UP, B_MSG_WOKE_UP_UPROAR,
  B_MSG_LOAFING, B_MSG_DEFROSTED, B_MSG_DEFROSTED_BY_MOVE,
  MOVE_RESULT_MISSED,
  ABILITY_EARLY_BIRD, ABILITY_TRUANT,
  EFFECT_THAW_HIT,
  MOVE_POUND, MOVE_BIDE, MOVE_SNORE, MOVE_SLEEP_TALK,
  MOVE_TARGET_SELECTED,
} from './constants';
import type { BattleScriptContext } from './script-interpreter';
import { getBattleScriptOffset } from './script-interpreter';
import { Random } from '../random';
import { getBattleMove } from './data/battle-moves';

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

// ─── Helpers internes ───────────────────────────────────────────────────────

/** 1:1 stub `UproarWakeUpCheck(battler)` (battle_util.c).
 *  Check si un battler en STATUS2_UPROAR est dans le combat → wake up autres.
 *  STUB MVP : retourne false (= rare condition). TODO porter quand STATUS2_UPROAR
 *  tracking complet wired. */
function _UproarWakeUpCheck(_battler: number): boolean { return false; }

/** 1:1 stub `GetImprisonedMovesCount(battler, move)` (battle_util.c).
 *  Compte combien d'opponents ont utilisé Imprison sur ce move.
 *  STUB MVP : 0 (= rare hors trainer battles). */
function _GetImprisonedMovesCount(_battler: number, _move: number): number { return 0; }

/** 1:1 décomp `CountTrailingZeroBits(value)` (util.c).
 *  Retourne le nombre de bits à 0 trailing (= position du LSB set).
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

/** Simplified `CalculateBaseDamage` pour confusion self-hit.
 *  1:1 décomp utilise CalculateBaseDamage(attacker, attacker, MOVE_POUND, 0, 40, 0, attacker, attacker).
 *  Formule de base GBA : `((2*level/5+2) * attack * power / defense / 50) + 2`.
 *  Pour confusion self-hit = damage on confused mon's own stats. */
function _calculateConfusionDamage(battler: number): number {
  const mon = gBattleMons[battler];
  const level = mon.level;
  const attack = mon.attack;
  const defense = mon.defense;
  const power = 40;  // confusion self-hit power
  const baseDmg = Math.floor((Math.floor(2 * level / 5 + 2) * attack * power) / defense / 50) + 2;
  return Math.max(1, baseDmg);
}

// ─── Main API ───────────────────────────────────────────────────────────────

export interface AtkCancelerResult {
  /** 0=move proceeds, 1=cancelled BS jump set, 2=cancelled + status1 sync needed. */
  effect: number;
  /** BattleScript label vers lequel sauter (= si effect != 0). */
  jumpLabel: string | null;
  /** Si true, le caller doit `ctx.scriptPtrStack.push(opcodeStartPtr)` avant jump
   *  (= BattleScriptPushCursor dans décomp). */
  pushCursor: boolean;
}

/** 1:1 décomp `AtkCanceler_UnableToUseMove()` (battle_util.c:1985-2270).
 *
 *  Do-while loop sur 14 sub-states ; chaque state qui trigger set effect != 0
 *  et break la loop. Le caller (Cmd_attackcanceler) reçoit le résultat pour
 *  jumper au bon BattleScript label.
 *
 *  Note : le décomp utilise `gBattleScripting.bideDmg` (= alias sur
 *  &gBattleScripting). Notre port utilise un local var. */
export function AtkCanceler_UnableToUseMove(_ctx: BattleScriptContext): AtkCancelerResult {
  let effect = 0;
  let jumpLabel: string | null = null;
  let pushCursor = false;
  let bideDmgLocal = 0;

  let iterations = 0;
  const MAX_ITER = 64;

  while (iterations++ < MAX_ITER && gBattleStructAtkCancelerTracker !== CANCELER_END && effect === 0) {
    switch (gBattleStructAtkCancelerTracker) {
      case CANCELER_FLAGS:
        // 1:1 décomp : clear DESTINY_BOND + STATUS3_GRUDGE.
        gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_DESTINY_BOND;
        gStatuses3[gBattlerAttacker] &= ~STATUS3_GRUDGE;
        setBattleStructAtkCancelerTracker(gBattleStructAtkCancelerTracker + 1);
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
        setBattleStructAtkCancelerTracker(gBattleStructAtkCancelerTracker + 1);
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
              setBattleStructAtkCancelerTracker(gBattleStructAtkCancelerTracker + 1);
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
        setBattleStructAtkCancelerTracker(gBattleStructAtkCancelerTracker + 1);
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
        setBattleStructAtkCancelerTracker(gBattleStructAtkCancelerTracker + 1);
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
        setBattleStructAtkCancelerTracker(gBattleStructAtkCancelerTracker + 1);
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
        setBattleStructAtkCancelerTracker(gBattleStructAtkCancelerTracker + 1);
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
        setBattleStructAtkCancelerTracker(gBattleStructAtkCancelerTracker + 1);
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
        setBattleStructAtkCancelerTracker(gBattleStructAtkCancelerTracker + 1);
        break;

      case CANCELER_IMPRISONED:
        if (_GetImprisonedMovesCount(gBattlerAttacker, gCurrentMove)) {
          gProtectStructs[gBattlerAttacker].usedImprisonedMove = 1;
          _CancelMultiTurnMoves(gBattlerAttacker);
          jumpLabel = 'BattleScript_MoveUsedIsImprisoned';
          setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
          effect = 1;
        }
        setBattleStructAtkCancelerTracker(gBattleStructAtkCancelerTracker + 1);
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
        setBattleStructAtkCancelerTracker(gBattleStructAtkCancelerTracker + 1);
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
        setBattleStructAtkCancelerTracker(gBattleStructAtkCancelerTracker + 1);
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
        setBattleStructAtkCancelerTracker(gBattleStructAtkCancelerTracker + 1);
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
                // STUB : GetMoveTarget(MOVE_BIDE, MOVE_TARGET_SELECTED + 1) — pour MVP utilise BIDE_TARGET inchangé.
                void MOVE_TARGET_SELECTED;
              }
              jumpLabel = 'BattleScript_BideAttack';
            } else {
              jumpLabel = 'BattleScript_BideNoEnergyToAttack';
            }
          }
          effect = 1;
        }
        setBattleStructAtkCancelerTracker(gBattleStructAtkCancelerTracker + 1);
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
        setBattleStructAtkCancelerTracker(gBattleStructAtkCancelerTracker + 1);
        break;

      case CANCELER_END:
        break;
    }
  }

  // 1:1 décomp : `if (effect == 2)` → emit SetMonData REQUEST_STATUS_BATTLE.
  // Notre port : signal au caller via `effect=2`.
  // TODO porter EmitSetMonData status1 sync ici quand BtlController wired.

  return { effect, jumpLabel, pushCursor };
}

/** 1:1 décomp `CancelMultiTurnMoves(battler)` (battle_util.c:864-875).
 *  Privé pour éviter dépendance cyclique avec cmd-niveau-34. */
function _CancelMultiTurnMoves(battler: number): void {
  // Imports inline pour éviter circular dep — re-use de constants déjà loaded.
  const STATUS2_MULTIPLETURNS = 1 << 9;
  const STATUS2_LOCK_CONFUSE  = 0x3 << 19;
  const STATUS2_UPROAR        = 1 << 13;
  const STATUS3_SEMI_INVULNERABLE = 1 << 6;
  gBattleMons[battler].status2 &= ~STATUS2_MULTIPLETURNS;
  gBattleMons[battler].status2 &= ~STATUS2_LOCK_CONFUSE;
  gBattleMons[battler].status2 &= ~STATUS2_UPROAR;
  gBattleMons[battler].status2 &= ~STATUS2_BIDE;
  gStatuses3[battler] &= ~STATUS3_SEMI_INVULNERABLE;
  gDisableStructs[battler].rolloutTimer = 0;
  gDisableStructs[battler].furyCutterCounter = 0;
}

/** Helper utility pour Cmd_attackcanceler : wire AtkCanceler dans le script flow.
 *  Le caller appelle ça après les checks pré-AtkCanceler (= attacker.hp == 0,
 *  AbilityBattleEffects MOVES_BLOCK, etc.). Retourne true si le caller doit
 *  return immédiat (= AtkCanceler a set le jump). */
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
  setBattleStructAtkCancelerTracker(0);
}
