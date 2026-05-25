/**
 * battle/cmd-batch-21.ts — Phase 1 Batch 21 (item/wish/transform/OHKO) — 7 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x6A removeitem                (2 bytes — gUsedHeldItems[batter] = item; item=0)
 *   0x93 tryko                     (5 bytes — OHKO Horn Drill/Guillotine/Fissure)
 *   0x9B transformdataexecution    (1 byte  — Transform copy fields)
 *   0xD4 trywish                   (6 bytes — Wish 1-turn delay heal, case 0/1)
 *   0xE1 trygetintimidatetarget    (5 bytes — pick Intimidate target)
 *   0xED snatchsetbattlers         (1 byte  — Snatch swap battler ids)
 *   0xF8 trainerslideout           (2 bytes — trainer sprite slide back)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readByte, readWord, Random, getBattleScriptOffset } from './script-interpreter';
import {
  gBattleMons, gBattlerAttacker, gBattlerTarget,
  setBattlerAttacker, setBattlerTarget, setEffectBattler,
  setActiveBattler, gActiveBattler,
  gMoveResultFlags, setMoveResultFlags,
  gBattleMoveDamage, setBattleMoveDamage,
  gCurrentMove, setChosenMove,
  gWishFutureKnock,
  gBattleScripting, gBattleCommunication,
  gStatuses3, gDisableStructs,
  gProtectStructs, gSpecialStatuses,
  gBattleStruct, gAbsentBattlerFlags, gBattlersCount,
  gLastUsedAbility, setLastUsedAbility,
  gLastUsedItem, setLastUsedItem,
  gPotentialItemEffectBattler, setPotentialItemEffectBattler,
  gUsedHeldItems,
} from './state';
import {
  STATUS2_SUBSTITUTE, STATUS2_TRANSFORMED,
  STATUS3_SEMI_INVULNERABLE, STATUS3_ALWAYS_HITS,
  MOVE_RESULT_MISSED, MOVE_RESULT_FAILED,
  MOVE_RESULT_ONE_HIT_KO, MOVE_RESULT_FOE_ENDURED, MOVE_RESULT_FOE_HUNG_ON,
  MAX_MON_MOVES, MOVE_NONE, MOVE_UNAVAILABLE,
  ABILITY_STURDY,
  HOLD_EFFECT_FOCUS_BAND,
  MULTISTRING_CHOOSER,
  B_MSG_KO_MISS, B_MSG_KO_UNAFFECTED, B_MSG_TRANSFORM_FAILED, B_MSG_TRANSFORMED,
  REQUEST_HELDITEM_BATTLE, B_COMM_TO_CONTROLLER,
  RESET_MOVE_SELECTION,
  GET_BATTLER_SIDE,
} from './constants';
import {
  BtlController_EmitSetMonData,
  BtlController_EmitBattleAnimation,
  BtlController_EmitTrainerSlideBack,
  BtlController_EmitResetActionMoveSelection,
  MarkBattlerForControllerExec,
  gBitTable,
} from './battle-controllers';
import { getBattlerForBattleScript, GetBattlerAtPosition } from './util';
import { getBattleMove } from './data/battle-moves';
import {
  gBattleTextBuff1 as _gBattleTextBuff1_21,
  gBattleTextBuff1,
  PREPARE_ABILITY_BUFFER,
  PREPARE_SPECIES_BUFFER,
  PREPARE_MON_NICK_WITH_PREFIX_BUFFER,
} from './text-buffers';
import { gBattlerPartyIndexes as _gBattlerPartyIndexes_N21 } from './state';

// ─── Helpers ────────────────────────────────────────────────────────────────

// 1:1 décomp `GetItemHoldEffect/Param` (item.c) — wired vers data/item-hold-effects.
import { GetItemHoldEffect as _ghe21, GetItemHoldEffectParam as _ghep21 } from './data/item-hold-effects';
function _getItemHoldEffect(item: number): number { return _ghe21(item); }
function _getItemHoldEffectParam(item: number): number { return _ghep21(item); }

// 1:1 STRICT décomp `RecordItemEffectBattle` + `RecordAbilityBattle` (battle_util.c)
// — wired via util.ts. PORTÉS 1:1, plus de stub.
import {
  RecordAbilityBattle as _recordAbilityBattleFullN21,
  RecordItemEffectBattle as _recordItemEffectBattleFullN21,
} from './util';
function _recordItemEffectBattle(battler: number, holdEffect: number): void {
  _recordItemEffectBattleFullN21(battler, holdEffect);
}
function _recordAbilityBattle(battler: number, ability: number): void {
  _recordAbilityBattleFullN21(battler, ability);
}

// ─── 0x6A removeitem ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_removeitem. 2 bytes. */
function Cmd_removeitem(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  gUsedHeldItems[active] = gBattleMons[active].item;
  gBattleMons[active].item = 0;  // ITEM_NONE
  BtlController_EmitSetMonData(B_COMM_TO_CONTROLLER, REQUEST_HELDITEM_BATTLE, 0, 2, gBattleMons[active].item);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0x93 tryko ───────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_tryKO. 5 bytes (u32 miss jump). OHKO moves. */
function Cmd_tryko(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);

  // 1:1 décomp : check hold effect (Enigma Berry vs general).
  // Notre port : pas d'Enigma Berry support → just GetItemHoldEffect.
  const holdEffect = _getItemHoldEffect(gBattleMons[gBattlerTarget].item);
  const param = _getItemHoldEffectParam(gBattleMons[gBattlerTarget].item);

  setPotentialItemEffectBattler(gBattlerTarget);

  if (holdEffect === HOLD_EFFECT_FOCUS_BAND && (Random() % 100) < param) {
    _recordItemEffectBattle(gBattlerTarget, holdEffect);
    gSpecialStatuses[gBattlerTarget].focusBanded = 1;
  }

  if (gBattleMons[gBattlerTarget].ability === ABILITY_STURDY) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
    setLastUsedAbility(ABILITY_STURDY);
    const off = getBattleScriptOffset('BattleScript_SturdyPreventsOHKO');
    if (off >= 0) ctx.scriptPtr = off;
    _recordAbilityBattle(gBattlerTarget, ABILITY_STURDY);
    return false;
  }

  let chance: boolean;
  if (!(gStatuses3[gBattlerTarget] & STATUS3_ALWAYS_HITS)) {
    const accuracy = getBattleMove(gCurrentMove).accuracy
      + (gBattleMons[gBattlerAttacker].level - gBattleMons[gBattlerTarget].level);
    chance = ((Random() % 100) + 1 < accuracy)
      && gBattleMons[gBattlerAttacker].level >= gBattleMons[gBattlerTarget].level;
  } else if (gDisableStructs[gBattlerTarget].battlerWithSureHit === gBattlerAttacker
             && gBattleMons[gBattlerAttacker].level >= gBattleMons[gBattlerTarget].level) {
    chance = true;
  } else {
    const accuracy = getBattleMove(gCurrentMove).accuracy
      + (gBattleMons[gBattlerAttacker].level - gBattleMons[gBattlerTarget].level);
    chance = ((Random() % 100) + 1 < accuracy)
      && gBattleMons[gBattlerAttacker].level >= gBattleMons[gBattlerTarget].level;
  }

  if (chance) {
    if (gProtectStructs[gBattlerTarget].endured) {
      setBattleMoveDamage(gBattleMons[gBattlerTarget].hp - 1);
      setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_FOE_ENDURED);
    } else if (gSpecialStatuses[gBattlerTarget].focusBanded) {
      setBattleMoveDamage(gBattleMons[gBattlerTarget].hp - 1);
      setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_FOE_HUNG_ON);
      setLastUsedItem(gBattleMons[gBattlerTarget].item);
    } else {
      setBattleMoveDamage(gBattleMons[gBattlerTarget].hp);
      setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_ONE_HIT_KO);
    }
    return false;
  }
  // Miss path.
  setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
  if (gBattleMons[gBattlerAttacker].level >= gBattleMons[gBattlerTarget].level) {
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_KO_MISS;
  } else {
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_KO_UNAFFECTED;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── 0x9B transformdataexecution ──────────────────────────────────────────

/** 1:1 décomp Cmd_transformdataexecution. 1 byte. */
function Cmd_transformdataexecution(_ctx: BattleScriptContext): boolean {
  setChosenMove(MOVE_UNAVAILABLE);
  if ((gBattleMons[gBattlerTarget].status2 & STATUS2_TRANSFORMED)
      || (gStatuses3[gBattlerTarget] & STATUS3_SEMI_INVULNERABLE)) {
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_FAILED);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_TRANSFORM_FAILED;
    return false;
  }
  const atk = gBattleMons[gBattlerAttacker];
  const tgt = gBattleMons[gBattlerTarget];
  atk.status2 |= STATUS2_TRANSFORMED;
  gDisableStructs[gBattlerAttacker].disabledMove = MOVE_NONE;
  gDisableStructs[gBattlerAttacker].disableTimer = 0;
  gDisableStructs[gBattlerAttacker].transformedMonPersonality = tgt.personality;
  gDisableStructs[gBattlerAttacker].mimickedMoves = 0;

  // 1:1 décomp battle_script_commands.c:7788 : PREPARE_SPECIES_BUFFER pour
  // afficher le nom du species cible dans le message "X se transforme en Y".
  PREPARE_SPECIES_BUFFER(gBattleTextBuff1, tgt.species);

  // 1:1 décomp : memcpy from gBattleMons[target] to gBattleMons[attacker]
  // jusqu'à offsetof(BattlePokemon, pp). En TS, on copie les champs explicites
  // dans l'ordre du struct (= avant pp). Note : species/atk/def/speed/spAtk/
  // spDef + moves + hpIV..spDefenseIV + isEgg/abilityNum/statStages + ability +
  // type1/type2 (pas pp).
  atk.species = tgt.species;
  atk.attack = tgt.attack;
  atk.defense = tgt.defense;
  atk.speed = tgt.speed;
  atk.spAttack = tgt.spAttack;
  atk.spDefense = tgt.spDefense;
  atk.moves = [...tgt.moves];
  atk.hpIV = tgt.hpIV;
  atk.attackIV = tgt.attackIV;
  atk.defenseIV = tgt.defenseIV;
  atk.speedIV = tgt.speedIV;
  atk.spAttackIV = tgt.spAttackIV;
  atk.spDefenseIV = tgt.spDefenseIV;
  atk.isEgg = tgt.isEgg;
  atk.abilityNum = tgt.abilityNum;
  atk.statStages = [...tgt.statStages];
  atk.ability = tgt.ability;
  atk.type1 = tgt.type1;
  atk.type2 = tgt.type2;

  // 1:1 décomp : set pp à min(move.pp, 5) pour chaque move.
  for (let i = 0; i < MAX_MON_MOVES; i++) {
    const movePp = getBattleMove(atk.moves[i]).pp;
    atk.pp[i] = movePp < 5 ? movePp : 5;
  }
  // 1:1 décomp : emit ResetActionMoveSelection + Mark.
  setActiveBattler(gBattlerAttacker);
  BtlController_EmitResetActionMoveSelection(B_COMM_TO_CONTROLLER, RESET_MOVE_SELECTION);
  MarkBattlerForControllerExec(gBattlerAttacker);
  gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_TRANSFORMED;
  return false;
}

// ─── 0xD4 trywish ─────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_trywish. 6 bytes (u8 caseId + u32 fail jump). */
function Cmd_trywish(ctx: BattleScriptContext): boolean {
  const caseId = readByte(ctx);
  const failJump = readWord(ctx);
  switch (caseId) {
    case 0: {
      // 1:1 décomp battle_script_commands.c : Set Wish (turn this is used).
      // `wishMonId[attacker] = gBattlerPartyIndexes[attacker]` (= party slot du mon
      // qui pose Wish, pour vérifier au trigger qu'il est toujours présent).
      if (gWishFutureKnock.wishCounter[gBattlerAttacker] === 0) {
        gWishFutureKnock.wishCounter[gBattlerAttacker] = 2;
        gWishFutureKnock.wishMonId[gBattlerAttacker] = _gBattlerPartyIndexes_N21[gBattlerAttacker];
      } else {
        ctx.scriptPtr = failJump;
      }
      break;
    }
    case 1: {
      // Trigger Wish heal (= 2 turns later).
      // 1:1 décomp battle_script_commands.c:9312 : PREPARE_MON_NICK_WITH_PREFIX_BUFFER
      // pour afficher le nom du mon qui a lancé Wish (= récupéré via wishMonId party slot).
      PREPARE_MON_NICK_WITH_PREFIX_BUFFER(
        _gBattleTextBuff1_21, gBattlerTarget,
        gWishFutureKnock.wishMonId[gBattlerTarget],
      );
      let dmg = Math.floor(gBattleMons[gBattlerTarget].maxHP / 2);
      if (dmg === 0) dmg = 1;
      dmg *= -1;
      setBattleMoveDamage(dmg);
      if (gBattleMons[gBattlerTarget].hp === gBattleMons[gBattlerTarget].maxHP) {
        ctx.scriptPtr = failJump;
      }
      break;
    }
    default: break;
  }
  return false;
}

// ─── 0xE1 trygetintimidatetarget ──────────────────────────────────────────

/** 1:1 décomp Cmd_trygetintimidatetarget (battle_script_commands.c:9570-9591). */
function Cmd_trygetintimidatetarget(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  gBattleScripting.battler = gBattleStruct.intimidateBattler;
  const side = GET_BATTLER_SIDE(gBattleScripting.battler);

  // 1:1 décomp battle_script_commands.c:9577.
  PREPARE_ABILITY_BUFFER(_gBattleTextBuff1_21, gBattleMons[gBattleScripting.battler].ability);

  let target = gBattlerTarget;
  for (; target < gBattlersCount; target++) {
    if (GET_BATTLER_SIDE(target) === side) continue;
    if (!(gAbsentBattlerFlags & gBitTable[target])) break;
  }
  setBattlerTarget(target);
  if (target >= gBattlersCount) {
    ctx.scriptPtr = failJump;
  }
  return false;
}

// ─── 0xED snatchsetbattlers ───────────────────────────────────────────────

/** 1:1 décomp Cmd_snatchsetbattlers. 1 byte. */
function Cmd_snatchsetbattlers(_ctx: BattleScriptContext): boolean {
  // 1:1 décomp :
  //   gEffectBattler = gBattlerAttacker;
  //   if (attacker == target) attacker = target = scripting.battler;
  //   else target = scripting.battler;
  //   scripting.battler = gEffectBattler;
  const origAttacker = gBattlerAttacker;
  setEffectBattler(origAttacker);
  if (gBattlerAttacker === gBattlerTarget) {
    setBattlerAttacker(gBattleScripting.battler);
    setBattlerTarget(gBattleScripting.battler);
  } else {
    setBattlerTarget(gBattleScripting.battler);
  }
  gBattleScripting.battler = origAttacker;
  return false;
}

// ─── 0xF8 trainerslideout ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_trainerslideout. 2 bytes (u8 position). */
function Cmd_trainerslideout(ctx: BattleScriptContext): boolean {
  const position = readByte(ctx);
  const active = GetBattlerAtPosition(position);
  setActiveBattler(active);
  BtlController_EmitTrainerSlideBack(B_COMM_TO_CONTROLLER);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installBatch21Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x6A] = Cmd_removeitem;
  commands[0x93] = Cmd_tryko;
  commands[0x9B] = Cmd_transformdataexecution;
  commands[0xD4] = Cmd_trywish;
  commands[0xE1] = Cmd_trygetintimidatetarget;
  commands[0xED] = Cmd_snatchsetbattlers;
  commands[0xF8] = Cmd_trainerslideout;
}

// Suppress unused warnings.
void BtlController_EmitBattleAnimation;
void STATUS2_SUBSTITUTE;
void gActiveBattler;
void gLastUsedAbility;
void gLastUsedItem;
void gBattleMoveDamage;
void gPotentialItemEffectBattler;
