/**
 * battle/type-calc.ts — 1:1 décomp `Cmd_typecalc` + helpers
 * (`D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c:1321-1499`).
 *
 * - `ModulateDmgByType(multiplier)` (1321) : multiplie gBattleMoveDamage par
 *   multiplier/10 + set MOVE_RESULT_* flags selon SE/NVE/no effect.
 * - `Cmd_typecalc` (1355) : iterate gTypeEffectiveness chart, check STAB +1.5,
 *   Levitate immunity, Wonder Guard immunity. Skip si gCurrentMove == STRUGGLE.
 */

import {
  gBattleMons,
  gBattlerAttacker,
  gBattlerTarget,
  gCurrentMove,
  gMoveResultFlags,
  gBattleMoveDamage,
  gLastLandedMoves,
  gLastHitByType,
  gBattleCommunication,
  setMoveResultFlags,
  setBattleMoveDamage,
  setLastUsedAbility,
} from './state';
import { getBattleMove } from './data/battle-moves';
import {
  gTypeEffectiveness,
  TYPE_FORESIGHT,
  TYPE_ENDTABLE,
  TYPE_MUL_NO_EFFECT,
  TYPE_MUL_NOT_EFFECTIVE,
  TYPE_MUL_SUPER_EFFECTIVE,
} from './data/type-effectiveness';
import {
  MOVE_STRUGGLE,
  MOVE_RESULT_MISSED,
  MOVE_RESULT_SUPER_EFFECTIVE,
  MOVE_RESULT_NOT_VERY_EFFECTIVE,
  MOVE_RESULT_DOESNT_AFFECT_FOE,
  MOVE_RESULT_NO_EFFECT,
  STATUS2_FORESIGHT,
  ABILITY_LEVITATE,
  ABILITY_WONDER_GUARD,
  TYPE_GROUND,
  MISS_TYPE,
  B_MSG_GROUND_MISS,
  B_MSG_AVOIDED_DMG,
} from './constants';

// ─── ModulateDmgByType ──────────────────────────────────────────────────────

/** 1:1 décomp `ModulateDmgByType(u8 multiplier)` (battle_script_commands.c:1321). */
function ModulateDmgByType(multiplier: number): void {
  let dmg = Math.floor(gBattleMoveDamage * multiplier / 10);
  if (dmg === 0 && multiplier !== 0) dmg = 1;
  setBattleMoveDamage(dmg);

  let flags = gMoveResultFlags;
  switch (multiplier) {
    case TYPE_MUL_NO_EFFECT:
      flags |= MOVE_RESULT_DOESNT_AFFECT_FOE;
      flags &= ~MOVE_RESULT_NOT_VERY_EFFECTIVE;
      flags &= ~MOVE_RESULT_SUPER_EFFECTIVE;
      break;
    case TYPE_MUL_NOT_EFFECTIVE:
      if (getBattleMove(gCurrentMove).power && !(flags & MOVE_RESULT_NO_EFFECT)) {
        if (flags & MOVE_RESULT_SUPER_EFFECTIVE) {
          flags &= ~MOVE_RESULT_SUPER_EFFECTIVE;
        } else {
          flags |= MOVE_RESULT_NOT_VERY_EFFECTIVE;
        }
      }
      break;
    case TYPE_MUL_SUPER_EFFECTIVE:
      if (getBattleMove(gCurrentMove).power && !(flags & MOVE_RESULT_NO_EFFECT)) {
        if (flags & MOVE_RESULT_NOT_VERY_EFFECTIVE) {
          flags &= ~MOVE_RESULT_NOT_VERY_EFFECTIVE;
        } else {
          flags |= MOVE_RESULT_SUPER_EFFECTIVE;
        }
      }
      break;
  }
  setMoveResultFlags(flags);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** 1:1 décomp `IS_BATTLER_OF_TYPE(battler, type)` (include/battle.h:472). */
function isBattlerOfType(battlerIdx: number, type: number): boolean {
  const mon = gBattleMons[battlerIdx];
  // `BattleMon.type1` + `type2` (= notre struct correspond aux types[0]/types[1]).
  return mon.type1 === type || mon.type2 === type;
}

/** 1:1 décomp `GET_MOVE_TYPE(move, typeArg)` (include/battle.h:458). Pour
 *  l'instant, pas de dynamicMoveType state, donc retourne move.type direct. */
function getMoveType(move: number): number {
  return getBattleMove(move).type;
}

/** Stub : 1:1 décomp `AttacksThisTurn(attacker, move)` retourne 2 si
 *  un move multi-hit a hit son target déjà ce tour, sinon le hit principal.
 *  Pour MVP : retourne 2 (= treat all moves comme "first hit"). */
function attacksThisTurn(_attacker: number, _move: number): number { return 2; }

// ─── Cmd_typecalc ───────────────────────────────────────────────────────────

/** 1:1 décomp `Cmd_typecalc` (battle_script_commands.c:1355-1424).
 *
 *  Logic :
 *  1. Si move == STRUGGLE → advance, skip type effectiveness.
 *  2. Calcul moveType.
 *  3. Si attacker.types include moveType → STAB ×1.5.
 *  4. Si target.ability == LEVITATE && moveType == GROUND → immunité, MISS_TYPE.
 *  5. Iterate gTypeEffectiveness table :
 *     - skip FORESIGHT bloc si target n'a pas STATUS2_FORESIGHT
 *     - match (atkType, defType[0]) → ModulateDmgByType
 *     - match (atkType, defType[1]) → ModulateDmgByType
 *  6. Si target.ability == WONDER_GUARD && pas super-effective et move power > 0 →
 *     immunité.
 *  7. Si MOVE_RESULT_DOESNT_AFFECT_FOE → set protectStruct.targetNotAffected. */
export function Cmd_typecalc(): boolean {
  if (gCurrentMove === MOVE_STRUGGLE) {
    return false;
  }

  const moveType = getMoveType(gCurrentMove);

  // STAB ×1.5.
  if (isBattlerOfType(gBattlerAttacker, moveType)) {
    let dmg = gBattleMoveDamage * 15;
    dmg = Math.floor(dmg / 10);
    setBattleMoveDamage(dmg);
  }

  const targetMon = gBattleMons[gBattlerTarget];

  // Levitate immunity vs Ground.
  if (targetMon.ability === ABILITY_LEVITATE && moveType === TYPE_GROUND) {
    setLastUsedAbility(targetMon.ability);
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED | MOVE_RESULT_DOESNT_AFFECT_FOE);
    gLastLandedMoves[gBattlerTarget] = 0;
    gLastHitByType[gBattlerTarget] = 0;
    gBattleCommunication[MISS_TYPE] = B_MSG_GROUND_MISS;
    // RecordAbilityBattle — skip (= TODO when ability AI hook implemented)
  } else {
    // Iterate type chart.
    let i = 0;
    while (gTypeEffectiveness[i] !== TYPE_ENDTABLE) {
      if (gTypeEffectiveness[i] === TYPE_FORESIGHT) {
        if (targetMon.status2 & STATUS2_FORESIGHT) break;
        i += 3;
        continue;
      }
      if (gTypeEffectiveness[i] === moveType) {
        // Check type1.
        if (gTypeEffectiveness[i + 1] === targetMon.type1) {
          ModulateDmgByType(gTypeEffectiveness[i + 2]);
        }
        // Check type2 (= si différent de type1).
        if (gTypeEffectiveness[i + 1] === targetMon.type2 && targetMon.type1 !== targetMon.type2) {
          ModulateDmgByType(gTypeEffectiveness[i + 2]);
        }
      }
      i += 3;
    }
  }

  // Wonder Guard immunity (= pas super-effective et move power > 0).
  if (
    targetMon.ability === ABILITY_WONDER_GUARD
    && attacksThisTurn(gBattlerAttacker, gCurrentMove) === 2
    && (!(gMoveResultFlags & MOVE_RESULT_SUPER_EFFECTIVE)
       || ((gMoveResultFlags & (MOVE_RESULT_SUPER_EFFECTIVE | MOVE_RESULT_NOT_VERY_EFFECTIVE))
           === (MOVE_RESULT_SUPER_EFFECTIVE | MOVE_RESULT_NOT_VERY_EFFECTIVE)))
    && getBattleMove(gCurrentMove).power
  ) {
    setLastUsedAbility(ABILITY_WONDER_GUARD);
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    gLastLandedMoves[gBattlerTarget] = 0;
    gLastHitByType[gBattlerTarget] = 0;
    gBattleCommunication[MISS_TYPE] = B_MSG_AVOIDED_DMG;
    // RecordAbilityBattle — skip
  }

  // gProtectStructs[attacker].targetNotAffected = 1 si DOESNT_AFFECT_FOE.
  // TODO porter gProtectStructs.

  return false;
}
