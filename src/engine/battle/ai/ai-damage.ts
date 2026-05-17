/**
 * battle/ai/ai-damage.ts — helpers damage/type partagés requis par l'AI,
 * portés 1:1 décomp.
 *
 * Source de vérité :
 *   - `TypeCalc(move, attacker, defender)` : battle_script_commands.c:1536-1592
 *   - `ModulateDmgByType2(multiplier, move, *flags)` : battle_script_commands.c:1502-1534
 *   - `AI_CalcDmg(attacker, defender)` : battle_script_commands.c:1306-1319
 *
 * NOTE 1:1 importante : `TypeCalc` (forme fonction) N'ASSIGNE PAS
 * `gMoveResultFlags` (contrairement à `Cmd_typecalc`). Le décomp commente
 * explicitement que ça rend le test `gMoveResultFlags & MOVE_RESULT_DOESNT_AFFECT_FOE`
 * de l'AI toujours faux (= "dual non-immunity glitch", comportement vanilla
 * Émeraude conservé, branche non-BUGFIX). On reproduit ça à l'identique :
 * `TypeCalc` retourne `flags` localement et ne touche aucun état global hors
 * `gBattleMoveDamage` (muté par STAB + ModulateDmgByType2).
 */

import {
  gBattleMons,
  gCurrentMove,
  gBattleMoveDamage,
  setBattleMoveDamage,
  gCritMultiplier,
  gDynamicBasePower,
  setDynamicBasePower,
  gBattleScripting,
  gStatuses3,
  gProtectStructs,
  gSideStatuses,
  gBattleStruct,
} from '../state';
import { getBattleMove } from '../data/battle-moves';
import {
  gTypeEffectiveness,
  TYPE_FORESIGHT,
  TYPE_ENDTABLE,
  TYPE_MUL_NO_EFFECT,
  TYPE_MUL_NOT_EFFECTIVE,
  TYPE_MUL_SUPER_EFFECTIVE,
} from '../data/type-effectiveness';
import {
  MOVE_STRUGGLE,
  MOVE_RESULT_MISSED,
  MOVE_RESULT_SUPER_EFFECTIVE,
  MOVE_RESULT_NOT_VERY_EFFECTIVE,
  MOVE_RESULT_DOESNT_AFFECT_FOE,
  MOVE_RESULT_NO_EFFECT,
  STATUS2_FORESIGHT,
  STATUS3_CHARGED_UP,
  ABILITY_LEVITATE,
  ABILITY_WONDER_GUARD,
  TYPE_GROUND,
  TYPE_ELECTRIC,
  GET_BATTLER_SIDE,
} from '../constants';
import { CalculateBaseDamage } from '../damage-calc';

/** 1:1 décomp `IS_BATTLER_OF_TYPE(battler, type)` (battle.h:472). */
function isBattlerOfType(battlerIdx: number, type: number): boolean {
  const mon = gBattleMons[battlerIdx];
  return mon.type1 === type || mon.type2 === type;
}

/** Stub 1:1 : `AttacksThisTurn(attacker, move)` retourne 1 si charging turn,
 *  sinon 2. Notre port retourne 2 (= identique à type-calc.ts/battle-flow). */
function attacksThisTurn(_attacker: number, _move: number): number {
  return 2;
}

/** 1:1 décomp `ModulateDmgByType2(u8 multiplier, u16 move, u8 *flags)`
 *  (battle_script_commands.c:1502-1534). `flags` = ref-objet pour émuler `u8*`. */
function ModulateDmgByType2(multiplier: number, move: number, ref: { flags: number }): void {
  let dmg = Math.floor(gBattleMoveDamage * multiplier / 10);
  if (dmg === 0 && multiplier !== 0) dmg = 1;
  setBattleMoveDamage(dmg);

  switch (multiplier) {
    case TYPE_MUL_NO_EFFECT:
      ref.flags |= MOVE_RESULT_DOESNT_AFFECT_FOE;
      ref.flags &= ~MOVE_RESULT_NOT_VERY_EFFECTIVE;
      ref.flags &= ~MOVE_RESULT_SUPER_EFFECTIVE;
      break;
    case TYPE_MUL_NOT_EFFECTIVE:
      if (getBattleMove(move).power && !(ref.flags & MOVE_RESULT_NO_EFFECT)) {
        if (ref.flags & MOVE_RESULT_SUPER_EFFECTIVE) {
          ref.flags &= ~MOVE_RESULT_SUPER_EFFECTIVE;
        } else {
          ref.flags |= MOVE_RESULT_NOT_VERY_EFFECTIVE;
        }
      }
      break;
    case TYPE_MUL_SUPER_EFFECTIVE:
      if (getBattleMove(move).power && !(ref.flags & MOVE_RESULT_NO_EFFECT)) {
        if (ref.flags & MOVE_RESULT_NOT_VERY_EFFECTIVE) {
          ref.flags &= ~MOVE_RESULT_NOT_VERY_EFFECTIVE;
        } else {
          ref.flags |= MOVE_RESULT_SUPER_EFFECTIVE;
        }
      }
      break;
  }
}

/** 1:1 décomp `u8 TypeCalc(u16 move, u8 attacker, u8 defender)`
 *  (battle_script_commands.c:1536-1592).
 *
 *  Mute `gBattleMoveDamage` (STAB ×1.5 + ModulateDmgByType2 par type).
 *  Retourne `flags` (MOVE_RESULT_*) SANS écrire gMoveResultFlags
 *  (= 1:1 vanilla, cf. en-tête de fichier). */
export function TypeCalc(move: number, attacker: number, defender: number): number {
  let i = 0;
  const ref = { flags: 0 };
  let moveType: number;

  if (move === MOVE_STRUGGLE) return 0;

  moveType = getBattleMove(move).type;

  // check stab
  if (isBattlerOfType(attacker, moveType)) {
    let dmg = gBattleMoveDamage * 15;
    dmg = Math.floor(dmg / 10);
    setBattleMoveDamage(dmg);
  }

  const def = gBattleMons[defender];
  if (def.ability === ABILITY_LEVITATE && moveType === TYPE_GROUND) {
    ref.flags |= (MOVE_RESULT_MISSED | MOVE_RESULT_DOESNT_AFFECT_FOE);
  } else {
    while (gTypeEffectiveness[i] !== TYPE_ENDTABLE) {
      if (gTypeEffectiveness[i] === TYPE_FORESIGHT) {
        if (def.status2 & STATUS2_FORESIGHT) break;
        i += 3;
        continue;
      } else if (gTypeEffectiveness[i] === moveType) {
        // check type1
        if (gTypeEffectiveness[i + 1] === def.type1) {
          ModulateDmgByType2(gTypeEffectiveness[i + 2], move, ref);
        }
        // check type2
        if (gTypeEffectiveness[i + 1] === def.type2 && def.type1 !== def.type2) {
          ModulateDmgByType2(gTypeEffectiveness[i + 2], move, ref);
        }
      }
      i += 3;
    }
  }

  if (
    def.ability === ABILITY_WONDER_GUARD && !(ref.flags & MOVE_RESULT_MISSED)
    && attacksThisTurn(attacker, move) === 2
    && (!(ref.flags & MOVE_RESULT_SUPER_EFFECTIVE)
       || ((ref.flags & (MOVE_RESULT_SUPER_EFFECTIVE | MOVE_RESULT_NOT_VERY_EFFECTIVE))
           === (MOVE_RESULT_SUPER_EFFECTIVE | MOVE_RESULT_NOT_VERY_EFFECTIVE)))
    && getBattleMove(move).power
  ) {
    ref.flags |= MOVE_RESULT_MISSED;
  }
  return ref.flags;
}

/** 1:1 décomp `void AI_CalcDmg(u8 attacker, u8 defender)`
 *  (battle_script_commands.c:1306-1319). Renseigne `gBattleMoveDamage`. */
export function AI_CalcDmg(attacker: number, defender: number): void {
  const sideStatus = gSideStatuses[GET_BATTLER_SIDE(defender)];
  const { damage } = CalculateBaseDamage(
    gBattleMons[attacker],
    gBattleMons[defender],
    gCurrentMove,
    sideStatus,
    gDynamicBasePower,
    gBattleStruct.dynamicMoveType,
    attacker,
    defender,
  );
  let dmg = damage;
  setDynamicBasePower(0);
  dmg = dmg * gCritMultiplier * gBattleScripting.dmgMultiplier;

  if ((gStatuses3[attacker] & STATUS3_CHARGED_UP) && getBattleMove(gCurrentMove).type === TYPE_ELECTRIC) {
    dmg *= 2;
  }
  if (gProtectStructs[attacker].helpingHand) {
    dmg = Math.floor(dmg * 15 / 10);
  }
  setBattleMoveDamage(dmg);
}
