/**
 * battle/disobedience.ts — Port 1:1 décomp `IsMonDisobedient`
 * (battle_util.c:3900-4015).
 *
 * Check disobedience pour les Pokémon traded/outsider qui dépassent le niveau
 * d'obéissance correspondant aux badges du player. Appelée par Cmd_attackcanceler
 * après AtkCanceler_UnableToUseMove.
 *
 * Levels d'obéissance (= max level dont les outsiders obéissent) :
 *   - 0 badges  : 10
 *   - 2 badges  : 30
 *   - 4 badges  : 50
 *   - 6 badges  : 70
 *   - 8 badges  : ∞ (= toujours obéissant)
 *
 * Si pas obéissant, le mon peut :
 *   - IGNORED : ne rien faire (= loaf, sleep, etc.)
 *   - OTHER : faire un truc inattendu (= random move, self-hit, etc.)
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_util.c:3900-4015`.
 */

import {
  gBattleMons, gBattlerAttacker, gBattlerTarget, setBattlerTarget,
  gCurrentMove, setCalledMove,
  gCurrMovePos, setCurrMovePos, gChosenMovePos, setChosenMovePos,
  gHitMarker, setHitMarker,
  gBattleCommunication, gBattleScripting,
  gBattleMoveDamage, setBattleMoveDamage,
  gBattleTypeFlags, gBattlersCount,
} from './state';
import { SPECIES_MEW, SPECIES_DEOXYS } from '../decomp-data/include/constants/species-data';
import {
  BATTLE_TYPE_LINK, BATTLE_TYPE_RECORDED_LINK,
  GET_BATTLER_SIDE, B_SIDE_OPPONENT,
  DISOBEDIENCE_OBEDIENT, DISOBEDIENCE_IGNORED, DISOBEDIENCE_OTHER,
  STATUS1_ANY, STATUS1_SLEEP,
  STATUS2_RAGE, STATUS2_UPROAR,
  MOVE_RAGE, MOVE_SNORE, MOVE_SLEEP_TALK,
  MULTISTRING_CHOOSER, NUM_LOAF_STRINGS,
  HITMARKER_DISOBEDIENT_MOVE, HITMARKER_UNABLE_TO_USE_MOVE,
  ABILITY_VITAL_SPIRIT, ABILITY_INSOMNIA,
  ALL_MOVES_MASK, MAX_MON_MOVES, MOVE_LIMITATIONS_ALL,
  NO_TARGET_OVERRIDE,
} from './constants';
import type { BattleScriptContext } from './script-interpreter';
import { getBattleScriptOffset } from './script-interpreter';
import { Random } from '../system/random';
import { CheckMoveLimitations as _CheckMoveLimitations } from './move-limitations';

/** 1:1 décomp `IsBattlerModernFatefulEncounter(battler)` (battle_util.c:3890-3898).
 *
 *  - Si battler côté opponent : return true (= always legal opponent).
 *  - Si species != DEOXYS && != MEW : return true (= n'importe quel autre mon est ok).
 *  - Sinon : return MON_DATA_MODERN_FATEFUL_ENCOUNTER (= flag set sur les
 *    Mew/Deoxys distribués officiellement). Assume true (= pas de cheat device — web port n.implémente pas le anti-cheat).
 */
function _IsBattlerModernFatefulEncounter(battler: number): boolean {
  if (_GET_BATTLER_SIDE(battler) === B_SIDE_OPPONENT_LOCAL) return true;
  const partyIdx = gBattlerPartyIndexes_DSO[battler];
  if (!gPlayerParty_DSO[partyIdx]) return true;
  const species = GetMonData_DSO(gPlayerParty_DSO[partyIdx], MON_DATA_SPECIES_DSO) as number;
  if (species !== SPECIES_MEW && species !== SPECIES_DEOXYS) return true;
  // MON_DATA_MODERN_FATEFUL_ENCOUNTER deferred (= pas pertinent web port).
  return true;
}

// Imports locaux pour éviter import dupliqué.
import { gBattlerPartyIndexes as gBattlerPartyIndexes_DSO } from './state';
import { gPlayerParty as gPlayerParty_DSO, GetMonData as GetMonData_DSO, MON_DATA_SPECIES as MON_DATA_SPECIES_DSO } from './party-storage';
import { GET_BATTLER_SIDE as _GET_BATTLER_SIDE, B_SIDE_OPPONENT as B_SIDE_OPPONENT_LOCAL } from './constants';

/** 1:1 décomp `IsOtherTrainer(u32 otId, u8 *otName)` (pokemon.c). Compare le
 *  trainerId du mon avec `gSaveBlock2Ptr->playerTrainerId` ET le name (= 7
 *  chars). Si different → other trainer (= traded/event mon). */
import { gSaveBlock2Ptr } from '../save/save-block-state';
function _IsOtherTrainer(otId: number, _otName: string): boolean {
  // 1:1 décomp : retourne 1 si TID OU OT name diffèrent, 0 si match.
  const playerTID = (gSaveBlock2Ptr.playerTrainerId ?? 0) >>> 0;
  if (playerTID !== (otId >>> 0)) return true;
  // OT name comparison : 7 chars truncated. Phase 1 single-tutorial assume
  // name match si TID match.
  return false;
}

// 1:1 décomp `FlagGet(flag)` — wired via script-vars.ts (gameState.hasFlag).
import { FlagGet as _FlagGetFull } from '../script/script-vars';
function _FlagGet(flagId: string): boolean {
  return _FlagGetFull(flagId);
}

const FLAG_BADGE02_GET = 'FLAG_BADGE02_GET';
const FLAG_BADGE04_GET = 'FLAG_BADGE04_GET';
const FLAG_BADGE06_GET = 'FLAG_BADGE06_GET';
const FLAG_BADGE08_GET = 'FLAG_BADGE08_GET';

// 1:1 décomp `CheckMoveLimitations` — importé depuis move-limitations.ts.

const MOD = (a: number, b: number): number => ((a % b) + b) % b;

/** Simplified `CalculateBaseDamage` pour confusion self-hit (= 1:1 décomp).
 *  Le décomp utilise CalculateBaseDamage(attacker, attacker, MOVE_POUND, 0, 40, 0, attacker, attacker).
 *  Notre port : formule de base GBA. */
function _calculateConfusionDamage(battler: number): number {
  const mon = gBattleMons[battler];
  const level = mon.level;
  const attack = mon.attack;
  const defense = mon.defense;
  const power = 40;
  const baseDmg = Math.floor((Math.floor(2 * level / 5 + 2) * attack * power) / defense / 50) + 2;
  return Math.max(1, baseDmg);
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
    // Multiple skip conditions.
    // Frontier paths deferred : INGAME_PARTNER / FRONTIER / RECORDED / IsOtherTrainer.
    const mon = gBattleMons[gBattlerAttacker];
    if (!_IsOtherTrainer(mon.otId ?? 0, mon.otName ?? '')) {
      return { retval: DISOBEDIENCE_OBEDIENT, jumpLabel: null };
    }
    if (_FlagGet(FLAG_BADGE08_GET)) {
      return { retval: DISOBEDIENCE_OBEDIENT, jumpLabel: null };
    }

    obedienceLevel = 10;
    if (_FlagGet(FLAG_BADGE02_GET)) obedienceLevel = 30;
    if (_FlagGet(FLAG_BADGE04_GET)) obedienceLevel = 50;
    if (_FlagGet(FLAG_BADGE06_GET)) obedienceLevel = 70;
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
    const limitations = _CheckMoveLimitations(gBattlerAttacker, 1 << gCurrMovePos, MOVE_LIMITATIONS_ALL);
    if (limitations === ALL_MOVES_MASK) {
      gBattleCommunication[MULTISTRING_CHOOSER] = MOD(Random(), NUM_LOAF_STRINGS);
      return {
        retval: DISOBEDIENCE_IGNORED,
        jumpLabel: 'BattleScript_MoveUsedLoafingAround',
      };
    } else {
      // Random pick un autre move
      let safety = 0;
      do {
        const idx = MOD(Random(), MAX_MON_MOVES);
        setCurrMovePos(idx);
        setChosenMovePos(idx);
        safety++;
      } while ((1 << gCurrMovePos) & limitations && safety < 50);

      const calledMove = gBattleMons[gBattlerAttacker].moves[gCurrMovePos];
      setCalledMove(calledMove);
      // 1:1 décomp : gBattlerTarget = GetMoveTarget(calledMove, NO_TARGET_OVERRIDE).
      // Notre port : keep current target.
      void NO_TARGET_OVERRIDE;
      void setBattlerTarget;
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
      gBattleCommunication[MULTISTRING_CHOOSER] = MOD(Random(), NUM_LOAF_STRINGS);
      return {
        retval: DISOBEDIENCE_IGNORED,
        jumpLabel: 'BattleScript_MoveUsedLoafingAround',
      };
    }
  }
}

/** Helper utility pour Cmd_attackcanceler. */
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
