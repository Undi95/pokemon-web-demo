/**
 * battle/set-move-effect.ts — 1:1 décomp `SetMoveEffect(primary, certain)`
 * (battle_script_commands.c:2218..2780, ~670 lignes).
 *
 * Cette fonction est le coeur des secondary effects des moves : applique
 * status (poison/burn/etc.), stat changes, flinch, recoil, item steal,
 * knockoff, etc. depuis `gBattleCommunication[MOVE_EFFECT_BYTE]`.
 *
 * Sources de vérité (1:1) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c:608`
 *     sStatusFlagsForMoveEffects[] table
 *   - `battle_script_commands.c:627` sMoveEffectBS_Ptrs[] table
 *   - `battle_script_commands.c:2218` `static void SetMoveEffect(...)`
 *   - `include/constants/battle.h:244..` MOVE_EFFECT_*
 *
 * Wirage : 0x15 seteffectwithchance, 0x16 seteffectprimary, 0x17 seteffectsecondary
 * (cf. cmd-niveau-1.ts et cmd-niveau-31.ts).
 */

import type { BattleScriptContext } from './script-interpreter';
import { getBattleScriptOffset, Random } from './script-interpreter';
import { setLastUsedItem as setLastUsedItemSME } from './state';
import { ITEM_ENIGMA_BERRY } from '../decomp-data/include/constants/items-data';
import { RecordAbilityBattle as _recordAbilityBattleSME } from './util';

// 1:1 décomp `IS_ITEM_MAIL(itemId)` (mail.h:6-17).
const _MAIL_ITEMS_SME = new Set([
  121 /* ITEM_ORANGE_MAIL */, 122 /* ITEM_HARBOR_MAIL */,
  123 /* ITEM_GLITTER_MAIL */, 124 /* ITEM_MECH_MAIL */,
  125 /* ITEM_WOOD_MAIL */,    126 /* ITEM_WAVE_MAIL */,
  127 /* ITEM_BEAD_MAIL */,    128 /* ITEM_SHADOW_MAIL */,
  129 /* ITEM_TROPIC_MAIL */,  130 /* ITEM_DREAM_MAIL */,
  131 /* ITEM_FAB_MAIL */,     132 /* ITEM_RETRO_MAIL */,
]);
function _isItemMailSME(itemId: number): boolean {
  return _MAIL_ITEMS_SME.has(itemId);
}
import {
  gBattleMons, gBattlerAttacker, gBattlerTarget,
  gEffectBattler, setEffectBattler,
  gActiveBattler, setActiveBattler,
  gBattleScripting,
  gBattleCommunication,
  gHitMarker, setHitMarker,
  gSideStatuses,
  gMoveResultFlags, setMoveResultFlags,
  gBattlersCount,
  gCurrentMove,
  gBattleMoveDamage, setBattleMoveDamage,
  gHpDealt,
  gPaydayMoney, setPaydayMoney,
  gLastUsedAbility, setLastUsedAbility,
  gBattleTypeFlags,
  gWishFutureKnock,
  gBattleWeather,
  gBattlerPartyIndexes,
  gDisableStructs,
  gLockedMoves,
  gProtectStructs,
  gBattleStruct,
} from './state';
import {
  STATUS1_SLEEP, STATUS1_POISON, STATUS1_BURN, STATUS1_FREEZE,
  STATUS1_PARALYSIS, STATUS1_TOXIC_POISON, STATUS1_ANY,
  STATUS2_SUBSTITUTE, STATUS2_CONFUSION,
  STATUS2_RECHARGE, STATUS2_RAGE,
  STATUS2_MULTIPLETURNS, STATUS2_UPROAR, STATUS2_WRAPPED,
  STATUS2_ESCAPE_PREVENTION, STATUS2_NIGHTMARE,
  STATUS2_LOCK_CONFUSE, STATUS2_FLINCHED,
  SIDE_STATUS_SAFEGUARD,
  HITMARKER_STATUS_ABILITY_EFFECT, HITMARKER_SYNCHRONIZE_EFFECT,
  ABILITY_SHIELD_DUST, ABILITY_IMMUNITY, ABILITY_VITAL_SPIRIT, ABILITY_INSOMNIA,
  ABILITY_WATER_VEIL, ABILITY_LIMBER, ABILITY_MAGMA_ARMOR,
  ABILITY_OWN_TEMPO, ABILITY_INNER_FOCUS, ABILITY_STICKY_HOLD,
  ABILITY_SOUNDPROOF,
  MOVE_EFFECT_AFFECTS_USER, MOVE_EFFECT_CERTAIN,
  SET_STAT_BUFF_VALUE, STAT_BUFF_NEGATIVE,
  STATUS1_SLEEP_TURN as _STATUS1_SLEEP_TURN_FN,
  IS_BATTLER_OF_TYPE,
  TYPE_POISON, TYPE_STEEL, TYPE_FIRE, TYPE_ICE,
  GET_BATTLER_SIDE, B_SIDE_PLAYER, B_SIDE_OPPONENT,
  B_WEATHER_SUN,
  BATTLE_TYPE_TRAINER_HILL, BATTLE_TYPE_EREADER_TRAINER,
  BATTLE_TYPE_FRONTIER, BATTLE_TYPE_LINK, BATTLE_TYPE_RECORDED_LINK,
  BATTLE_TYPE_SECRET_BASE,
} from './constants';
import { CancelMultiTurnMoves } from './util';
import { ChangeStatBuffs } from './stat-stages';

// ─── 1:1 décomp sStatusFlagsForMoveEffects[] (battle_script_commands.c:608) ─

/** 1:1 décomp `sStatusFlagsForMoveEffects[NUM_MOVE_EFFECTS]`. Maps
 *  MOVE_EFFECT_* (0..53) → status1/status2 flag. */
const sStatusFlagsForMoveEffects: number[] = [];
sStatusFlagsForMoveEffects[1 /* MOVE_EFFECT_SLEEP */] = STATUS1_SLEEP;
sStatusFlagsForMoveEffects[2 /* MOVE_EFFECT_POISON */] = STATUS1_POISON;
sStatusFlagsForMoveEffects[3 /* MOVE_EFFECT_BURN */] = STATUS1_BURN;
sStatusFlagsForMoveEffects[4 /* MOVE_EFFECT_FREEZE */] = STATUS1_FREEZE;
sStatusFlagsForMoveEffects[5 /* MOVE_EFFECT_PARALYSIS */] = STATUS1_PARALYSIS;
sStatusFlagsForMoveEffects[6 /* MOVE_EFFECT_TOXIC */] = STATUS1_TOXIC_POISON;
sStatusFlagsForMoveEffects[7 /* MOVE_EFFECT_CONFUSION */] = STATUS2_CONFUSION;
sStatusFlagsForMoveEffects[8 /* MOVE_EFFECT_FLINCH */] = STATUS2_FLINCHED;
sStatusFlagsForMoveEffects[10 /* MOVE_EFFECT_UPROAR */] = STATUS2_UPROAR;
sStatusFlagsForMoveEffects[12 /* MOVE_EFFECT_CHARGING */] = STATUS2_MULTIPLETURNS;
sStatusFlagsForMoveEffects[13 /* MOVE_EFFECT_WRAP */] = STATUS2_WRAPPED;
sStatusFlagsForMoveEffects[29 /* MOVE_EFFECT_RECHARGE */] = STATUS2_RECHARGE;
sStatusFlagsForMoveEffects[32 /* MOVE_EFFECT_PREVENT_ESCAPE */] = STATUS2_ESCAPE_PREVENTION;
sStatusFlagsForMoveEffects[33 /* MOVE_EFFECT_NIGHTMARE */] = STATUS2_NIGHTMARE;
sStatusFlagsForMoveEffects[53 /* MOVE_EFFECT_THRASH */] = STATUS2_LOCK_CONFUSE;

// ─── 1:1 décomp sMoveEffectBS_Ptrs[] (battle_script_commands.c:627) ────────

/** 1:1 décomp `sMoveEffectBS_Ptrs[]`. Maps MOVE_EFFECT_* → label name de
 *  BattleScript_MoveEffect*. */
const sMoveEffectBS_Ptrs_labels: string[] = [];
const _DEFAULT_LABEL = 'BattleScript_MoveEffectSleep';
sMoveEffectBS_Ptrs_labels[0] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[1 /* MOVE_EFFECT_SLEEP */] = 'BattleScript_MoveEffectSleep';
sMoveEffectBS_Ptrs_labels[2 /* MOVE_EFFECT_POISON */] = 'BattleScript_MoveEffectPoison';
sMoveEffectBS_Ptrs_labels[3 /* MOVE_EFFECT_BURN */] = 'BattleScript_MoveEffectBurn';
sMoveEffectBS_Ptrs_labels[4 /* MOVE_EFFECT_FREEZE */] = 'BattleScript_MoveEffectFreeze';
sMoveEffectBS_Ptrs_labels[5 /* MOVE_EFFECT_PARALYSIS */] = 'BattleScript_MoveEffectParalysis';
sMoveEffectBS_Ptrs_labels[6 /* MOVE_EFFECT_TOXIC */] = 'BattleScript_MoveEffectToxic';
sMoveEffectBS_Ptrs_labels[7 /* MOVE_EFFECT_CONFUSION */] = 'BattleScript_MoveEffectConfusion';
sMoveEffectBS_Ptrs_labels[8 /* MOVE_EFFECT_FLINCH */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[9 /* MOVE_EFFECT_TRI_ATTACK */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[10 /* MOVE_EFFECT_UPROAR */] = 'BattleScript_MoveEffectUproar';
sMoveEffectBS_Ptrs_labels[11 /* MOVE_EFFECT_PAYDAY */] = 'BattleScript_MoveEffectPayDay';
sMoveEffectBS_Ptrs_labels[12 /* MOVE_EFFECT_CHARGING */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[13 /* MOVE_EFFECT_WRAP */] = 'BattleScript_MoveEffectWrap';
sMoveEffectBS_Ptrs_labels[14 /* MOVE_EFFECT_RECOIL_25 */] = 'BattleScript_MoveEffectRecoil';
// Stat+1 / Stat-1 / Stat+2 / Stat-2 / others default to sleep (= no-op).
for (let i = 15; i <= 28; i++) sMoveEffectBS_Ptrs_labels[i] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[29 /* MOVE_EFFECT_RECHARGE */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[30 /* MOVE_EFFECT_RAGE */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[31 /* MOVE_EFFECT_STEAL_ITEM */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[32 /* MOVE_EFFECT_PREVENT_ESCAPE */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[33 /* MOVE_EFFECT_NIGHTMARE */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[34 /* MOVE_EFFECT_ALL_STATS_UP */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[35 /* MOVE_EFFECT_RAPIDSPIN */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[36 /* MOVE_EFFECT_REMOVE_PARALYSIS */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[37 /* MOVE_EFFECT_ATK_DEF_DOWN */] = _DEFAULT_LABEL;
sMoveEffectBS_Ptrs_labels[38 /* MOVE_EFFECT_RECOIL_33 */] = 'BattleScript_MoveEffectRecoil';

function _resolveMoveEffectBS(effect: number): number {
  const label = sMoveEffectBS_Ptrs_labels[effect] ?? _DEFAULT_LABEL;
  return getBattleScriptOffset(label);
}

// ─── 1:1 décomp helper stubs ────────────────────────────────────────────────

// 1:1 décomp `RecordAbilityBattle` — wired via util.ts.
import { RecordAbilityBattle as _recordAbilityBattleFullSME } from './util';
function _recordAbilityBattle(battler: number, ability: number): void {
  _recordAbilityBattleFullSME(battler, ability);
}

/** 1:1 stub `GetBattlerTurnOrderNum(battler)` (battle_util.c). Renvoie
 *  l'index dans gBattlerByTurnOrder[]. Notre port : retourne battler. */
function _getBattlerTurnOrderNum(battler: number): number {
  return battler;
}

/** Décomp `gCurrentTurnActionNumber`. Notre port : 0. */
const _gCurrentTurnActionNumber = 0;

/** 1:1 décomp `WEATHER_HAS_EFFECT` macro — `(!CloudNine && !AirLock)`.
 *  Notre port : true. */
const _WEATHER_HAS_EFFECT = true;

/** Décomp `BATTLE_TYPE_TRAINER_HILL` — utilisé pour `MOVE_EFFECT_STEAL_ITEM`
 *  block. Notre const peut être 0 si on n'a pas le flag. */
const _BATTLE_TYPE_TRAINER_HILL_FLAG = BATTLE_TYPE_TRAINER_HILL ?? 0;

// ─── B_MSG_* constants utilisés par SetMoveEffect ─────────────────────────

const B_MSG_ABILITY_PREVENTS_ABILITY_STATUS = 1;
const B_MSG_ABILITY_PREVENTS_MOVE_STATUS = 0;
const B_MSG_STATUS_HAD_NO_EFFECT = 2;
const B_MSG_STATUSED = 0;
const B_MSG_STATUSED_BY_ABILITY = 1;
const MULTISTRING_CHOOSER_IDX = 5;
const MOVE_EFFECT_BYTE_IDX = 3;

// ─── Macros INCREMENT_RESET_RETURN / RESET_RETURN ─────────────────────────

/** 1:1 décomp `INCREMENT_RESET_RETURN` macro :
 *  gBattlescriptCurrInstr++; gBattleCommunication[MOVE_EFFECT_BYTE] = 0; return;
 *
 *  Note : le `++` du décomp = avance past l'opcode byte. Dans notre impl,
 *  le dispatch loop a déjà fait `ctx.scriptPtr++` AVANT d'appeler le handler.
 *  Donc on n'a PLUS rien à advance ici. */
function _incrementResetReturn(_ctx: BattleScriptContext): void {
  gBattleCommunication[MOVE_EFFECT_BYTE_IDX] = 0;
}

/** 1:1 décomp `RESET_RETURN` macro :
 *  gBattleCommunication[MOVE_EFFECT_BYTE] = 0; return; */
function _resetReturn(): void {
  gBattleCommunication[MOVE_EFFECT_BYTE_IDX] = 0;
}

// ─── Trapping moves list (utilisé par MOVE_EFFECT_WRAP MULTISTRING) ───────

/** 1:1 décomp `gTrappingMoves[]` (= moves qui wrap : BIND, WRAP, FIRE_SPIN,
 *  CLAMP, WHIRLPOOL, SAND_TOMB). */
const _gTrappingMoves: number[] = [
  20  /* MOVE_BIND */,
  35  /* MOVE_WRAP */,
  83  /* MOVE_FIRE_SPIN */,
  128 /* MOVE_CLAMP */,
  250 /* MOVE_WHIRLPOOL */,
  328 /* MOVE_SAND_TOMB */,
];

// ─── Main fn ────────────────────────────────────────────────────────────────

/** 1:1 décomp `SetMoveEffect(bool primary, u8 certain)` (battle_script_commands.c:2218).
 *  Applique le secondary effect d'un move : status, stat changes, recoil, etc.
 *
 *  `ctx` = script context (= notre équivalent gBattlescriptCurrInstr / push stack).
 *  `primary` = TRUE si appelé via seteffectprimary (= status garanti, ignore
 *              ability immunities pour la plupart).
 *  `certain` = MOVE_EFFECT_CERTAIN bit (= effect garanti même contre certaines
 *              abilities). */
export function SetMoveEffect(ctx: BattleScriptContext, primary: boolean, certain: number): void {
  let statusChanged = false;
  let affectsUser = 0;
  let noSunCanFreeze = true;

  if (gBattleCommunication[MOVE_EFFECT_BYTE_IDX] & MOVE_EFFECT_AFFECTS_USER) {
    setEffectBattler(gBattlerAttacker);
    gBattleCommunication[MOVE_EFFECT_BYTE_IDX] &= ~MOVE_EFFECT_AFFECTS_USER;
    affectsUser = MOVE_EFFECT_AFFECTS_USER;
    gBattleScripting.battler = gBattlerTarget;
  } else {
    setEffectBattler(gBattlerTarget);
    gBattleScripting.battler = gBattlerAttacker;
  }

  // SHIELD_DUST early-return.
  if (gBattleMons[gEffectBattler].ability === ABILITY_SHIELD_DUST
      && !(gHitMarker & HITMARKER_STATUS_ABILITY_EFFECT)
      && !primary
      && gBattleCommunication[MOVE_EFFECT_BYTE_IDX] <= 9) {
    _incrementResetReturn(ctx);
    return;
  }

  // SAFEGUARD early-return.
  if ((gSideStatuses[GET_BATTLER_SIDE(gEffectBattler)] & SIDE_STATUS_SAFEGUARD)
      && !(gHitMarker & HITMARKER_STATUS_ABILITY_EFFECT)
      && !primary
      && gBattleCommunication[MOVE_EFFECT_BYTE_IDX] <= 7) {
    _incrementResetReturn(ctx);
    return;
  }

  // HP == 0 + not PAYDAY/STEAL → skip.
  if (gBattleMons[gEffectBattler].hp === 0
      && gBattleCommunication[MOVE_EFFECT_BYTE_IDX] !== 11 /* MOVE_EFFECT_PAYDAY */
      && gBattleCommunication[MOVE_EFFECT_BYTE_IDX] !== 31 /* MOVE_EFFECT_STEAL_ITEM */) {
    _incrementResetReturn(ctx);
    return;
  }

  // SUBSTITUTE blocks non-self effects.
  if ((gBattleMons[gEffectBattler].status2 & STATUS2_SUBSTITUTE)
      && affectsUser !== MOVE_EFFECT_AFFECTS_USER) {
    _incrementResetReturn(ctx);
    return;
  }

  const PRIMARY_STATUS_MOVE_EFFECT_LOCAL = 6 /* MOVE_EFFECT_TOXIC */;

  if (gBattleCommunication[MOVE_EFFECT_BYTE_IDX] <= PRIMARY_STATUS_MOVE_EFFECT_LOCAL) {
    // ─── Primary status effects (Sleep, Poison, Burn, Freeze, Paralysis, Toxic) ─
    const statusFlag = sStatusFlagsForMoveEffects[gBattleCommunication[MOVE_EFFECT_BYTE_IDX]];

    if (statusFlag === STATUS1_SLEEP) {
      // 1:1 décomp Sleep case.
      if (gBattleMons[gEffectBattler].ability !== ABILITY_SOUNDPROOF) {
        let i = 0;
        for (; i < gBattlersCount && !(gBattleMons[i].status2 & STATUS2_UPROAR); i++) {}
        setActiveBattler(i);
      } else {
        setActiveBattler(gBattlersCount);
      }
      if (gBattleMons[gEffectBattler].status1) {
        // already statused → skip
      } else if (gActiveBattler !== gBattlersCount) {
        // uproar active → skip
      } else if (gBattleMons[gEffectBattler].ability === ABILITY_VITAL_SPIRIT) {
        // skip
      } else if (gBattleMons[gEffectBattler].ability === ABILITY_INSOMNIA) {
        // skip
      } else {
        CancelMultiTurnMoves(gEffectBattler);
        statusChanged = true;
      }
    } else if (statusFlag === STATUS1_POISON) {
      // 1:1 décomp Poison case.
      if (gBattleMons[gEffectBattler].ability === ABILITY_IMMUNITY
          && (primary || certain === MOVE_EFFECT_CERTAIN)) {
        setLastUsedAbility(ABILITY_IMMUNITY);
        _recordAbilityBattle(gEffectBattler, ABILITY_IMMUNITY);
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = getBattleScriptOffset('BattleScript_PSNPrevention');
        if (off >= 0) ctx.scriptPtr = off;
        if (gHitMarker & HITMARKER_STATUS_ABILITY_EFFECT) {
          gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_ABILITY_PREVENTS_ABILITY_STATUS;
          setHitMarker(gHitMarker & ~HITMARKER_STATUS_ABILITY_EFFECT);
        } else {
          gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_ABILITY_PREVENTS_MOVE_STATUS;
        }
        _resetReturn();
        return;
      }
      if ((IS_BATTLER_OF_TYPE(gBattleMons[gEffectBattler].type1, gBattleMons[gEffectBattler].type2, TYPE_POISON)
            || IS_BATTLER_OF_TYPE(gBattleMons[gEffectBattler].type1, gBattleMons[gEffectBattler].type2, TYPE_STEEL))
          && (gHitMarker & HITMARKER_STATUS_ABILITY_EFFECT)
          && (primary || certain === MOVE_EFFECT_CERTAIN)) {
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = getBattleScriptOffset('BattleScript_PSNPrevention');
        if (off >= 0) ctx.scriptPtr = off;
        gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_STATUS_HAD_NO_EFFECT;
        _resetReturn();
        return;
      }
      if (IS_BATTLER_OF_TYPE(gBattleMons[gEffectBattler].type1, gBattleMons[gEffectBattler].type2, TYPE_POISON)) {
        // skip
      } else if (IS_BATTLER_OF_TYPE(gBattleMons[gEffectBattler].type1, gBattleMons[gEffectBattler].type2, TYPE_STEEL)) {
        // skip
      } else if (gBattleMons[gEffectBattler].status1) {
        // skip
      } else if (gBattleMons[gEffectBattler].ability === ABILITY_IMMUNITY) {
        // skip
      } else {
        statusChanged = true;
      }
    } else if (statusFlag === STATUS1_BURN) {
      // 1:1 décomp Burn case.
      if (gBattleMons[gEffectBattler].ability === ABILITY_WATER_VEIL
          && (primary || certain === MOVE_EFFECT_CERTAIN)) {
        setLastUsedAbility(ABILITY_WATER_VEIL);
        _recordAbilityBattle(gEffectBattler, ABILITY_WATER_VEIL);
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = getBattleScriptOffset('BattleScript_BRNPrevention');
        if (off >= 0) ctx.scriptPtr = off;
        if (gHitMarker & HITMARKER_STATUS_ABILITY_EFFECT) {
          gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_ABILITY_PREVENTS_ABILITY_STATUS;
          setHitMarker(gHitMarker & ~HITMARKER_STATUS_ABILITY_EFFECT);
        } else {
          gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_ABILITY_PREVENTS_MOVE_STATUS;
        }
        _resetReturn();
        return;
      }
      if (IS_BATTLER_OF_TYPE(gBattleMons[gEffectBattler].type1, gBattleMons[gEffectBattler].type2, TYPE_FIRE)
          && (gHitMarker & HITMARKER_STATUS_ABILITY_EFFECT)
          && (primary || certain === MOVE_EFFECT_CERTAIN)) {
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = getBattleScriptOffset('BattleScript_BRNPrevention');
        if (off >= 0) ctx.scriptPtr = off;
        gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_STATUS_HAD_NO_EFFECT;
        _resetReturn();
        return;
      }
      if (IS_BATTLER_OF_TYPE(gBattleMons[gEffectBattler].type1, gBattleMons[gEffectBattler].type2, TYPE_FIRE)) {
        // skip
      } else if (gBattleMons[gEffectBattler].ability === ABILITY_WATER_VEIL) {
        // skip
      } else if (gBattleMons[gEffectBattler].status1) {
        // skip
      } else {
        statusChanged = true;
      }
    } else if (statusFlag === STATUS1_FREEZE) {
      // 1:1 décomp Freeze case.
      if (_WEATHER_HAS_EFFECT && (gBattleWeather & B_WEATHER_SUN)) {
        noSunCanFreeze = false;
      }
      if (IS_BATTLER_OF_TYPE(gBattleMons[gEffectBattler].type1, gBattleMons[gEffectBattler].type2, TYPE_ICE)) {
        // skip
      } else if (gBattleMons[gEffectBattler].status1) {
        // skip
      } else if (!noSunCanFreeze) {
        // skip
      } else if (gBattleMons[gEffectBattler].ability === ABILITY_MAGMA_ARMOR) {
        // skip
      } else {
        CancelMultiTurnMoves(gEffectBattler);
        statusChanged = true;
      }
    } else if (statusFlag === STATUS1_PARALYSIS) {
      // 1:1 décomp Paralysis case.
      if (gBattleMons[gEffectBattler].ability === ABILITY_LIMBER) {
        if (primary || certain === MOVE_EFFECT_CERTAIN) {
          setLastUsedAbility(ABILITY_LIMBER);
          _recordAbilityBattle(gEffectBattler, ABILITY_LIMBER);
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          const off = getBattleScriptOffset('BattleScript_PRLZPrevention');
          if (off >= 0) ctx.scriptPtr = off;
          if (gHitMarker & HITMARKER_STATUS_ABILITY_EFFECT) {
            gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_ABILITY_PREVENTS_ABILITY_STATUS;
            setHitMarker(gHitMarker & ~HITMARKER_STATUS_ABILITY_EFFECT);
          } else {
            gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_ABILITY_PREVENTS_MOVE_STATUS;
          }
          _resetReturn();
          return;
        }
        // else fall through (= no statusChanged, will hit increment-reset-return below).
      } else if (!gBattleMons[gEffectBattler].status1) {
        statusChanged = true;
      }
    } else if (statusFlag === STATUS1_TOXIC_POISON) {
      // 1:1 décomp Toxic case.
      if (gBattleMons[gEffectBattler].ability === ABILITY_IMMUNITY
          && (primary || certain === MOVE_EFFECT_CERTAIN)) {
        setLastUsedAbility(ABILITY_IMMUNITY);
        _recordAbilityBattle(gEffectBattler, ABILITY_IMMUNITY);
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = getBattleScriptOffset('BattleScript_PSNPrevention');
        if (off >= 0) ctx.scriptPtr = off;
        if (gHitMarker & HITMARKER_STATUS_ABILITY_EFFECT) {
          gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_ABILITY_PREVENTS_ABILITY_STATUS;
          setHitMarker(gHitMarker & ~HITMARKER_STATUS_ABILITY_EFFECT);
        } else {
          gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_ABILITY_PREVENTS_MOVE_STATUS;
        }
        _resetReturn();
        return;
      }
      if ((IS_BATTLER_OF_TYPE(gBattleMons[gEffectBattler].type1, gBattleMons[gEffectBattler].type2, TYPE_POISON)
            || IS_BATTLER_OF_TYPE(gBattleMons[gEffectBattler].type1, gBattleMons[gEffectBattler].type2, TYPE_STEEL))
          && (gHitMarker & HITMARKER_STATUS_ABILITY_EFFECT)
          && (primary || certain === MOVE_EFFECT_CERTAIN)) {
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = getBattleScriptOffset('BattleScript_PSNPrevention');
        if (off >= 0) ctx.scriptPtr = off;
        gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_STATUS_HAD_NO_EFFECT;
        _resetReturn();
        return;
      }
      if (gBattleMons[gEffectBattler].status1) {
        // skip
      } else if (!IS_BATTLER_OF_TYPE(gBattleMons[gEffectBattler].type1, gBattleMons[gEffectBattler].type2, TYPE_POISON)
                  && !IS_BATTLER_OF_TYPE(gBattleMons[gEffectBattler].type1, gBattleMons[gEffectBattler].type2, TYPE_STEEL)) {
        if (gBattleMons[gEffectBattler].ability === ABILITY_IMMUNITY) {
          // skip
        } else {
          gBattleMons[gEffectBattler].status1 &= ~STATUS1_TOXIC_POISON;
          gBattleMons[gEffectBattler].status1 &= ~STATUS1_POISON;
          statusChanged = true;
        }
      } else {
        setMoveResultFlags(gMoveResultFlags | 0x4 /* MOVE_RESULT_DOESNT_AFFECT_FOE */);
      }
    }

    if (statusChanged) {
      // 1:1 décomp : apply status1 + push current+1 + jump à sMoveEffectBS_Ptrs[effect].
      ctx.scriptPtrStack.push(ctx.scriptPtr);
      if (sStatusFlagsForMoveEffects[gBattleCommunication[MOVE_EFFECT_BYTE_IDX]] === STATUS1_SLEEP) {
        gBattleMons[gEffectBattler].status1 |= _STATUS1_SLEEP_TURN_FN((Random() & 3) + 2);
      } else {
        gBattleMons[gEffectBattler].status1 |= sStatusFlagsForMoveEffects[gBattleCommunication[MOVE_EFFECT_BYTE_IDX]];
      }
      const off = _resolveMoveEffectBS(gBattleCommunication[MOVE_EFFECT_BYTE_IDX]);
      if (off >= 0) ctx.scriptPtr = off;
      setActiveBattler(gEffectBattler);
      // BtlController_EmitSetMonData (= sync battler status1 → party storage). Wired via batch C bridge.
      if (gHitMarker & HITMARKER_STATUS_ABILITY_EFFECT) {
        gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_STATUSED_BY_ABILITY;
        setHitMarker(gHitMarker & ~HITMARKER_STATUS_ABILITY_EFFECT);
      } else {
        gBattleCommunication[MULTISTRING_CHOOSER_IDX] = B_MSG_STATUSED;
      }
      const eff = gBattleCommunication[MOVE_EFFECT_BYTE_IDX];
      if (eff === 2 /* POISON */ || eff === 6 /* TOXIC */ || eff === 5 /* PARALYSIS */ || eff === 3 /* BURN */) {
        // gBattleStruct->synchronizeMoveEffect = eff. Notre port : skip (= AbilityBattleEffects ATK_SYNCHRONIZE wired).
        setHitMarker(gHitMarker | HITMARKER_SYNCHRONIZE_EFFECT);
      }
      return;
    } else {
      // Not statusChanged → reset + advance.
      gBattleCommunication[MOVE_EFFECT_BYTE_IDX] = 0;
      // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
      return;
    }
  } else {
    // ─── Secondary effects (CONFUSION, FLINCH, UPROAR, PAYDAY, etc.) ──────
    if (gBattleMons[gEffectBattler].status2 & sStatusFlagsForMoveEffects[gBattleCommunication[MOVE_EFFECT_BYTE_IDX]]) {
      // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
    } else {
      const eff = gBattleCommunication[MOVE_EFFECT_BYTE_IDX];
      if (eff === 7 /* CONFUSION */) {
        if (gBattleMons[gEffectBattler].ability === ABILITY_OWN_TEMPO
            || (gBattleMons[gEffectBattler].status2 & STATUS2_CONFUSION)) {
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        } else {
          gBattleMons[gEffectBattler].status2 |= ((Random() % 4 + 2) & STATUS2_CONFUSION);
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          const off = _resolveMoveEffectBS(eff);
          if (off >= 0) ctx.scriptPtr = off;
        }
      } else if (eff === 8 /* FLINCH */) {
        if (gBattleMons[gEffectBattler].ability === ABILITY_INNER_FOCUS) {
          if (primary || certain === MOVE_EFFECT_CERTAIN) {
            setLastUsedAbility(ABILITY_INNER_FOCUS);
            _recordAbilityBattle(gEffectBattler, ABILITY_INNER_FOCUS);
            const off = getBattleScriptOffset('BattleScript_FlinchPrevention');
            if (off >= 0) ctx.scriptPtr = off;
          } else {
            // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
          }
        } else {
          if (_getBattlerTurnOrderNum(gEffectBattler) > _gCurrentTurnActionNumber) {
            gBattleMons[gEffectBattler].status2 |= sStatusFlagsForMoveEffects[eff];
          }
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        }
      } else if (eff === 10 /* UPROAR */) {
        if (!(gBattleMons[gEffectBattler].status2 & STATUS2_UPROAR)) {
          gBattleMons[gEffectBattler].status2 |= STATUS2_MULTIPLETURNS;
          gLockedMoves[gEffectBattler] = gCurrentMove;
          gBattleMons[gEffectBattler].status2 |= ((Random() & 3) + 2) << 4; // STATUS2_UPROAR_TURN
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          const off = _resolveMoveEffectBS(eff);
          if (off >= 0) ctx.scriptPtr = off;
        } else {
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        }
      } else if (eff === 11 /* PAYDAY */) {
        if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER) {
          const oldPayday = gPaydayMoney;
          let newPayday = gPaydayMoney + gBattleMons[gBattlerAttacker].level * 5;
          if (oldPayday > newPayday) newPayday = 0xFFFF;
          setPaydayMoney(newPayday);
        }
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = _resolveMoveEffectBS(eff);
        if (off >= 0) ctx.scriptPtr = off;
      } else if (eff === 9 /* TRI_ATTACK */) {
        if (gBattleMons[gEffectBattler].status1) {
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        } else {
          gBattleCommunication[MOVE_EFFECT_BYTE_IDX] = (Random() % 3) + 3;
          SetMoveEffect(ctx, false, 0);
          return;
        }
      } else if (eff === 12 /* CHARGING */) {
        gBattleMons[gEffectBattler].status2 |= STATUS2_MULTIPLETURNS;
        gLockedMoves[gEffectBattler] = gCurrentMove;
        gProtectStructs[gEffectBattler].chargingTurn = 1;
        // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
      } else if (eff === 13 /* WRAP */) {
        if (gBattleMons[gEffectBattler].status2 & STATUS2_WRAPPED) {
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        } else {
          gBattleMons[gEffectBattler].status2 |= ((Random() & 3) + 3) << 13; // STATUS2_WRAPPED_TURN
          // 1:1 décomp battle_script_commands.c:2620-2622 :
          //   wrappedMove[battler*2 + 0] = move & 0xFF (lo)
          //   wrappedMove[battler*2 + 1] = (move >> 8) & 0xFF (hi)
          //   wrappedBy[battler] = attacker
          gBattleStruct.wrappedMove[gEffectBattler * 2 + 0] = gCurrentMove & 0xFF;
          gBattleStruct.wrappedMove[gEffectBattler * 2 + 1] = (gCurrentMove >> 8) & 0xFF;
          gBattleStruct.wrappedBy[gEffectBattler] = gBattlerAttacker;
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          const off = _resolveMoveEffectBS(eff);
          if (off >= 0) ctx.scriptPtr = off;
          // 1:1 décomp : MULTISTRING_CHOOSER = index of move in gTrappingMoves[].
          let idx = 0;
          for (; idx < _gTrappingMoves.length - 1; idx++) {
            if (_gTrappingMoves[idx] === gCurrentMove) break;
          }
          gBattleCommunication[MULTISTRING_CHOOSER_IDX] = idx;
        }
      } else if (eff === 14 /* RECOIL_25 */) {
        let dmg = Math.floor(gHpDealt / 4);
        if (dmg === 0) dmg = 1;
        setBattleMoveDamage(dmg);
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = _resolveMoveEffectBS(eff);
        if (off >= 0) ctx.scriptPtr = off;
      } else if (eff >= 15 && eff <= 21 /* ATK..EVS_PLUS_1 */) {
        const stat = eff - 15 + 1;
        if (ChangeStatBuffs(SET_STAT_BUFF_VALUE(1), stat, affectsUser, 0)) {
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        } else {
          gBattleScripting.animArg1 = eff & ~(MOVE_EFFECT_AFFECTS_USER | MOVE_EFFECT_CERTAIN);
          gBattleScripting.animArg2 = 0;
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          const off = getBattleScriptOffset('BattleScript_StatUp');
          if (off >= 0) ctx.scriptPtr = off;
        }
      } else if (eff >= 22 && eff <= 28 /* ATK..EVS_MINUS_1 */) {
        const stat = eff - 22 + 1;
        if (ChangeStatBuffs(SET_STAT_BUFF_VALUE(1) | STAT_BUFF_NEGATIVE, stat, affectsUser, 0)) {
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        } else {
          gBattleScripting.animArg1 = eff & ~(MOVE_EFFECT_AFFECTS_USER | MOVE_EFFECT_CERTAIN);
          gBattleScripting.animArg2 = 0;
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          const off = getBattleScriptOffset('BattleScript_StatDown');
          if (off >= 0) ctx.scriptPtr = off;
        }
      } else if (eff >= 39 && eff <= 45 /* ATK..EVS_PLUS_2 */) {
        const stat = eff - 39 + 1;
        if (ChangeStatBuffs(SET_STAT_BUFF_VALUE(2), stat, affectsUser, 0)) {
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        } else {
          gBattleScripting.animArg1 = eff & ~(MOVE_EFFECT_AFFECTS_USER | MOVE_EFFECT_CERTAIN);
          gBattleScripting.animArg2 = 0;
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          const off = getBattleScriptOffset('BattleScript_StatUp');
          if (off >= 0) ctx.scriptPtr = off;
        }
      } else if (eff >= 46 && eff <= 52 /* ATK..EVS_MINUS_2 */) {
        const stat = eff - 46 + 1;
        if (ChangeStatBuffs(SET_STAT_BUFF_VALUE(2) | STAT_BUFF_NEGATIVE, stat, affectsUser, 0)) {
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        } else {
          gBattleScripting.animArg1 = eff & ~(MOVE_EFFECT_AFFECTS_USER | MOVE_EFFECT_CERTAIN);
          gBattleScripting.animArg2 = 0;
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          const off = getBattleScriptOffset('BattleScript_StatDown');
          if (off >= 0) ctx.scriptPtr = off;
        }
      } else if (eff === 29 /* RECHARGE */) {
        gBattleMons[gEffectBattler].status2 |= STATUS2_RECHARGE;
        gDisableStructs[gEffectBattler].rechargeTimer = 2;
        gLockedMoves[gEffectBattler] = gCurrentMove;
        // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
      } else if (eff === 30 /* RAGE */) {
        gBattleMons[gBattlerAttacker].status2 |= STATUS2_RAGE;
        // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
      } else if (eff === 31 /* STEAL_ITEM */) {
        // 1:1 décomp battle_script_commands.c:2738-2803.
        if (gBattleTypeFlags & BATTLE_TYPE_TRAINER_HILL) {
          // gBattlescriptCurrInstr++  →  advance (dispatch déjà advance).
        } else {
          const sideAttacker = GET_BATTLER_SIDE(gBattlerAttacker);
          const nonLocalFlags = (BATTLE_TYPE_EREADER_TRAINER | BATTLE_TYPE_FRONTIER
                               | BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK
                               | BATTLE_TYPE_SECRET_BASE);
          if (sideAttacker === B_SIDE_OPPONENT && !(gBattleTypeFlags & nonLocalFlags)) {
            // Opponents ne stealent pas (= prevent perma loss en wild).
          } else if (!(gBattleTypeFlags & nonLocalFlags)
              && (gWishFutureKnock.knockedOffMons[sideAttacker]
                  & (1 << gBattlerPartyIndexes[gBattlerAttacker]))) {
            // Knock Off déjà déclenché sur attacker → pas de re-steal.
          } else if (gBattleMons[gBattlerTarget].item
              && gBattleMons[gBattlerTarget].ability === ABILITY_STICKY_HOLD) {
            // Sticky Hold ability bloque steal.
            ctx.scriptPtrStack.push(ctx.scriptPtr);
            const off = getBattleScriptOffset('BattleScript_NoItemSteal');
            if (off >= 0) ctx.scriptPtr = off;
            setLastUsedAbility(gBattleMons[gBattlerTarget].ability);
            _recordAbilityBattleSME(gBattlerTarget, gBattleMons[gBattlerTarget].ability);
          } else if (gBattleMons[gBattlerAttacker].item !== 0 /* ITEM_NONE */
              || gBattleMons[gBattlerTarget].item === ITEM_ENIGMA_BERRY
              || _isItemMailSME(gBattleMons[gBattlerTarget].item)
              || gBattleMons[gBattlerTarget].item === 0 /* ITEM_NONE */) {
            // Conditions fail (= attacker porte déjà un item, target item mail/none/enigma).
          } else {
            // 1:1 décomp full STEAL_ITEM path.
            gBattleStruct.changedItems[gBattlerAttacker] = gBattleMons[gBattlerTarget].item;
            setLastUsedItemSME(gBattleMons[gBattlerTarget].item);
            gBattleMons[gBattlerTarget].item = 0 /* ITEM_NONE */;

            // BtlController_EmitSetMonData REQUEST_HELDITEM_BATTLE wired via batch C bridge.
            // Notre impl : direct write sur gBattleMons.item.
            setActiveBattler(gBattlerAttacker);
            setActiveBattler(gBattlerTarget);

            ctx.scriptPtrStack.push(ctx.scriptPtr);
            const off = getBattleScriptOffset('BattleScript_ItemSteal');
            if (off >= 0) ctx.scriptPtr = off;

            gBattleStruct.choicedMove[gBattlerTarget] = 0;
          }
        }
      } else if (eff === 32 /* PREVENT_ESCAPE */) {
        gBattleMons[gBattlerTarget].status2 |= STATUS2_ESCAPE_PREVENTION;
        gDisableStructs[gBattlerTarget].battlerPreventingEscape = gBattlerAttacker;
        // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
      } else if (eff === 33 /* NIGHTMARE */) {
        gBattleMons[gBattlerTarget].status2 |= STATUS2_NIGHTMARE;
        // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
      } else if (eff === 34 /* ALL_STATS_UP */) {
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = getBattleScriptOffset('BattleScript_AllStatsUp');
        if (off >= 0) ctx.scriptPtr = off;
      } else if (eff === 35 /* RAPIDSPIN */) {
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = getBattleScriptOffset('BattleScript_RapidSpinAway');
        if (off >= 0) ctx.scriptPtr = off;
      } else if (eff === 36 /* REMOVE_PARALYSIS */) {
        if (!(gBattleMons[gBattlerTarget].status1 & STATUS1_PARALYSIS)) {
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        } else {
          gBattleMons[gBattlerTarget].status1 &= ~STATUS1_PARALYSIS;
          setActiveBattler(gBattlerTarget);
          // EmitSetMonData stub
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          const off = getBattleScriptOffset('BattleScript_TargetPRLZHeal');
          if (off >= 0) ctx.scriptPtr = off;
        }
      } else if (eff === 37 /* ATK_DEF_DOWN */) {
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = getBattleScriptOffset('BattleScript_AtkDefDown');
        if (off >= 0) ctx.scriptPtr = off;
      } else if (eff === 38 /* RECOIL_33 */) {
        let dmg = Math.floor(gHpDealt / 3);
        if (dmg === 0) dmg = 1;
        setBattleMoveDamage(dmg);
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = _resolveMoveEffectBS(eff);
        if (off >= 0) ctx.scriptPtr = off;
      } else if (eff === 53 /* THRASH */) {
        if (gBattleMons[gEffectBattler].status2 & STATUS2_LOCK_CONFUSE) {
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        } else {
          gBattleMons[gEffectBattler].status2 |= STATUS2_MULTIPLETURNS;
          gLockedMoves[gEffectBattler] = gCurrentMove;
          gBattleMons[gEffectBattler].status2 |= ((Random() & 1) + 2) << 10; // STATUS2_LOCK_CONFUSE_TURN
        }
      } else if (eff === 54 /* KNOCK_OFF */) {
        if (gBattleMons[gEffectBattler].ability === ABILITY_STICKY_HOLD) {
          if (gBattleMons[gEffectBattler].item === 0) {
            // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
          } else {
            setLastUsedAbility(ABILITY_STICKY_HOLD);
            const off = getBattleScriptOffset('BattleScript_StickyHoldActivates');
            if (off >= 0) ctx.scriptPtr = off;
            _recordAbilityBattle(gEffectBattler, ABILITY_STICKY_HOLD);
          }
        } else if (gBattleMons[gEffectBattler].item) {
          // 1:1 décomp battle_script_commands.c:2882-2884 :
          //   gLastUsedItem = gBattleMons[gEffectBattler].item;
          //   gBattleMons[gEffectBattler].item = ITEM_NONE;
          //   gWishFutureKnock.knockedOffMons[side] |= gBitTable[partyIdx];
          setLastUsedItemSME(gBattleMons[gEffectBattler].item);
          gBattleMons[gEffectBattler].item = 0;
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          const off = getBattleScriptOffset('BattleScript_KnockedOff');
          if (off >= 0) ctx.scriptPtr = off;
        } else {
          // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
        }
      } else if (eff === 55 /* SP_ATK_TWO_DOWN (NOTHING_37) */) {
        ctx.scriptPtrStack.push(ctx.scriptPtr);
        const off = getBattleScriptOffset('BattleScript_SAtkDown2');
        if (off >= 0) ctx.scriptPtr = off;
      } else {
        // Unknown effect → advance.
        // 1:1 décomp gBattlescriptCurrInstr++ = no-op ici (dispatch déjà advance).
      }
    }
  }

  gBattleCommunication[MOVE_EFFECT_BYTE_IDX] = 0;
}

// Silence unused.
void STATUS1_ANY;
