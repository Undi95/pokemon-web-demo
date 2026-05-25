/**
 * battle/cmd-batch-30.ts — Phase 1 Batch 30 (conversion2/pursuit/switchupdate/beatup/trick) — 5 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x4D switchindataupdate       (2 bytes — refresh mon data from buffer)
 *   0xA6 settypetorandomresistance (5 bytes — Conversion 2)
 *   0xBA jumpifnopursuitswitchdmg  (5 bytes — Pursuit switch damage check)
 *   0xC4 trydobeatup               (10 bytes — Beat Up state machine)
 *   0xD2 tryswapitems              (5 bytes — Trick item swap)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readByte, readWord, Random } from './script-interpreter';
import {
  gBattleMons, gBattlerAttacker, gBattlerTarget, setBattlerTarget,
  setBattlerAttacker, setActiveBattler,
  gMultiHitCounter,
  gCurrentMove, setCurrentMove,
  gHitMarker, setHitMarker,
  gDisableStructs, gBattleScripting,
  gBattleTypeFlags, gBattlersCount,
  gBattlerByTurnOrder, gActionsByTurnOrder,
  gChosenActionByBattler, gChosenMoveByBattler,
  gLastLandedMoves, gLastHitByType, gLastHitBy,
  gBattleStruct,
  setCurrMovePos,
  gBattleControllerExecFlags,
} from './state';
import {
  STATUS1_SLEEP, STATUS1_FREEZE,
  STATUS2_MULTIPLETURNS,
  HITMARKER_ATTACKSTRING_PRINTED,
  MOVE_NONE, MOVE_UNAVAILABLE, MOVE_PURSUIT,
  B_ACTION_USE_MOVE, B_ACTION_TRY_FINISH,
  GET_BATTLER_SIDE, BATTLE_OPPOSITE,
  B_SIDE_PLAYER, B_SIDE_OPPONENT,
  BATTLE_TYPE_TRAINER_HILL, BATTLE_TYPE_LINK, BATTLE_TYPE_FRONTIER,
  IS_BATTLER_OF_TYPE,
} from './constants';
import { getBattleMove } from './data/battle-moves';
import { gBitTable } from './battle-controllers';
import {
  gTypeEffectiveness, TYPE_ENDTABLE, TYPE_FORESIGHT,
  TYPE_MUL_NOT_EFFECTIVE,
} from './data/type-effectiveness';
import { getBattlerForBattleScript, GetBattlerAtPosition, B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_LEFT, B_POSITION_PLAYER_RIGHT, B_POSITION_OPPONENT_RIGHT } from './util';
import {
  gBattleTextBuff1 as _gBattleTextBuff1_30,
  gBattleTextBuff1, gBattleTextBuff2,
  PREPARE_MON_NICK_BUFFER, PREPARE_TYPE_BUFFER, PREPARE_ITEM_BUFFER,
  PREPARE_MON_NICK_WITH_PREFIX_BUFFER,
} from './text-buffers';
import { gBattlerPartyIndexes, gBattleCommunication } from './state';
import { MULTISTRING_CHOOSER } from './constants';

// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

/** 1:1 décomp `IsTwoTurnsMove(move)` (battle_script_commands.c:8199-8210).
 *  AUDIT FIX : précédemment stub return false → tous moves considérés single-turn.
 *  Wiring via local check (= éviter import circulaire avec cmd-batch-27). */
function _isTwoTurnsMove(move: number): boolean {
  const effect = getBattleMove(move).effect;
  // EFFECT_SKULL_BASH=145, RAZOR_WIND=39, SKY_ATTACK=75, SOLAR_BEAM=151,
  // SEMI_INVULNERABLE=155, BIDE=26. Valeurs auto-data battle_move_effects-data.ts.
  return effect === 145 || effect === 39 || effect === 75
      || effect === 151 || effect === 155 || effect === 26;
}

/** 1:1 décomp `SwitchInClearSetData()` (battle_main.c:3152-3262). Reset effect
 *  tracking + last moves + party flags pour le mon switched in.
 *
 *  Préserve si Baton Pass : substituteHP, statStages, status2 partiel, etc.
 *  Sinon : full reset gDisableStructs + statStages + status2 + status3. */
function _switchInClearSetData(active: number): void {
  // 1:1 décomp : snapshot disableStruct (= sera reset à la fin, sauf Baton Pass).
  const disableCopy = { ...gDisableStructs[active] };

  // EFFECT_BATON_PASS = 127 (= constants/battle_move_effects).
  const isBatonPass = (globalThis as { __getBattleMoveEffect?: (m: number) => number })
    .__getBattleMoveEffect?.(_gCurrentMove30()) === 127;

  // 1:1 décomp 3158-3171 : si non-Baton-Pass, reset statStages + clear
  // ESCAPE_PREVENTION/ALWAYS_HITS qui pointent vers cet active.
  if (!isBatonPass) {
    for (let i = 0; i < 8 /* NUM_BATTLE_STATS */; i++) {
      gBattleMons[active].statStages[i] = 6 /* DEFAULT_STAT_STAGE */;
    }
    // 1:1 décomp battle.h:150 + 160. AUDIT BUG FIX :
    // - STATUS2_ESCAPE_PREVENTION était 0x4000 → 1<<26 = 0x4000000
    // - STATUS3_ALWAYS_HITS était 0x8 → (1<<3)|(1<<4) = 0x18
    for (let i = 0; i < _gBattlersCount30(); i++) {
      if ((gBattleMons[i].status2 & 0x4000000 /* STATUS2_ESCAPE_PREVENTION */)
          && gDisableStructs[i].battlerPreventingEscape === active) {
        gBattleMons[i].status2 &= ~0x4000000;
      }
      if ((_gStatuses30()[i] & 0x18 /* STATUS3_ALWAYS_HITS */)
          && gDisableStructs[i].battlerWithSureHit === active) {
        _gStatuses30()[i] &= ~0x18;
        gDisableStructs[i].battlerWithSureHit = 0;
      }
    }
  }

  // 1:1 décomp 3173-3193 : status2/status3 reset (full ou partial Baton Pass).
  // AUDIT BUG FIX 6 constantes hardcoded fausses vs battle.h:142-174 :
  //   - STATUS2_ESCAPE_PREVENTION 0x4000 → 0x4000000 (= 1<<26)
  //   - STATUS2_CURSED            0x80000 → 0x10000000 (= 1<<28)
  //   - STATUS3_LEECHSEED_BATTLER 0x80 → 0x3 (= 1<<0|1<<1)
  //   - STATUS3_ALWAYS_HITS       0x8 → 0x18 (= 1<<3|1<<4)
  //   - STATUS3_PERISH_SONG       0x10 → 0x20 (= 1<<5)
  //   - STATUS3_MUDSPORT          0x100000 → 0x10000 (= 1<<16)
  //   - STATUS3_WATERSPORT        0x200000 → 0x20000 (= 1<<17)
  if (isBatonPass) {
    // Baton Pass : préserve CONFUSION + FOCUS_ENERGY + SUBSTITUTE + ESCAPE_PREVENTION + CURSED.
    gBattleMons[active].status2 &= (0x7 /* CONFUSION 3 bits */
      | 0x100000 /* FOCUS_ENERGY 1<<20 */ | 0x1000000 /* SUBSTITUTE 1<<24 */
      | 0x4000000 /* ESCAPE_PREVENTION 1<<26 */ | 0x10000000 /* CURSED 1<<28 */);
    _gStatuses30()[active] &= (0x3 /* LEECHSEED_BATTLER 1<<0|1<<1 */
      | 0x4 /* LEECHSEED 1<<2 */ | 0x18 /* ALWAYS_HITS 1<<3|1<<4 */
      | 0x20 /* PERISH_SONG 1<<5 */ | 0x400 /* ROOTED 1<<10 */
      | 0x10000 /* MUDSPORT 1<<16 */ | 0x20000 /* WATERSPORT 1<<17 */);
  } else {
    gBattleMons[active].status2 = 0;
    _gStatuses30()[active] = 0;
  }

  // 1:1 décomp 3195-3201 : clear INFATUATED_WITH(active) + WRAPPED par active.
  for (let i = 0; i < _gBattlersCount30(); i++) {
    const infatuatedBit = 1 << (16 + active); // STATUS2_INFATUATED_WITH(active).
    if (gBattleMons[i].status2 & infatuatedBit) {
      gBattleMons[i].status2 &= ~infatuatedBit;
    }
    if ((gBattleMons[i].status2 & 0xE000 /* STATUS2_WRAPPED 3 bits */)
        && gBattleStruct.wrappedBy?.[i] === active) {
      gBattleMons[i].status2 &= ~0xE000;
    }
  }

  // 1:1 décomp 3203-3208 : reset action/move cursor + full DisableStruct memset.
  const acsCursor = (globalThis as { __battleState?: { gActionSelectionCursor?: number[]; gMoveSelectionCursor?: number[] } }).__battleState;
  if (acsCursor?.gActionSelectionCursor) acsCursor.gActionSelectionCursor[active] = 0;
  if (acsCursor?.gMoveSelectionCursor) acsCursor.gMoveSelectionCursor[active] = 0;

  // Memset disableStruct → 0 (= reset all fields).
  const ds = gDisableStructs[active];
  ds.encoredMove = 0; ds.encoreTimer = 0; ds.encoreTimerStartValue = 0;
  ds.disabledMove = 0; ds.disableTimer = 0; ds.disableTimerStartValue = 0;
  ds.protectUses = 0;
  ds.tauntTimer = 0; ds.tauntTimer2 = 0;
  ds.rolloutTimer = 0; ds.furyCutterCounter = 0;
  ds.chargeTimer = 0;
  ds.encoredMovePos = 0; ds.mimickedMoves = 0;
  ds.substituteHP = 0; ds.perishSongTimer = 0; ds.perishSongTimerStartValue = 0;
  ds.battlerWithSureHit = 0; ds.battlerPreventingEscape = 0;

  // 1:1 décomp 3210-3217 : restore from snapshot si Baton Pass.
  if (isBatonPass) {
    ds.substituteHP = disableCopy.substituteHP;
    ds.battlerWithSureHit = disableCopy.battlerWithSureHit;
    ds.perishSongTimer = disableCopy.perishSongTimer;
    ds.perishSongTimerStartValue = disableCopy.perishSongTimerStartValue;
    ds.battlerPreventingEscape = disableCopy.battlerPreventingEscape;
  }

  ds.isFirstTurn = 2;
  ds.truantSwitchInHack = disableCopy.truantSwitchInHack;

  // 1:1 décomp 3219-3227 : reset gMoveResultFlags + last moves + last hit by.
  _setMoveResultFlags30()(0);
  _gLastMoves30()[active] = 0; // MOVE_NONE
  _gLastLandedMoves30()[active] = 0;
  _gLastHitByType30()[active] = 0;
  _gLastResultingMoves30()[active] = 0;
  _gLastPrintedMoves30()[active] = 0;
  _gLastHitBy30()[active] = 0xFF;

  // 1:1 décomp 3229-3238 : reset gBattleStruct.lastTakenMove + lastTakenMoveFrom.
  if (gBattleStruct.lastTakenMove) {
    gBattleStruct.lastTakenMove[active * 2] = 0;
    gBattleStruct.lastTakenMove[active * 2 + 1] = 0;
  }
  if (gBattleStruct.lastTakenMoveFrom) {
    for (let j = 0; j < 4; j++) {
      gBattleStruct.lastTakenMoveFrom[j * 2 + active * 8 + 0] = 0;
      gBattleStruct.lastTakenMoveFrom[j * 2 + active * 8 + 1] = 0;
    }
  }

  // 1:1 décomp 3240 : palaceFlags clear bit.
  gBattleStruct.palaceFlags = (gBattleStruct.palaceFlags ?? 0) & ~(1 << active);

  // 1:1 décomp 3253-3254 : choicedMove[active] = MOVE_NONE.
  if (gBattleStruct.choicedMove) gBattleStruct.choicedMove[active] = 0;

  // 1:1 décomp 3257-3258 : gCurrentMove + arenaTurnCounter reset.
  _setCurrentMove30()(0);
  gBattleStruct.arenaTurnCounter = 0xFF;
}

// Helpers locaux pour éviter cross-imports circulaires (= state direct).
function _gCurrentMove30(): number {
  return (globalThis as { __battleState?: { gCurrentMove?: number } }).__battleState?.gCurrentMove ?? 0;
}
function _gBattlersCount30(): number {
  return (globalThis as { __battleState?: { gBattlersCount?: number } }).__battleState?.gBattlersCount ?? 2;
}
function _gStatuses30(): number[] {
  return (globalThis as { __battleState?: { gStatuses3?: number[] } }).__battleState?.gStatuses3 ?? [0, 0, 0, 0];
}
function _gLastMoves30(): number[] {
  return (globalThis as { __battleState?: { gLastMoves?: number[] } }).__battleState?.gLastMoves ?? [0, 0, 0, 0];
}
function _gLastLandedMoves30(): number[] {
  return (globalThis as { __battleState?: { gLastLandedMoves?: number[] } }).__battleState?.gLastLandedMoves ?? [0, 0, 0, 0];
}
function _gLastHitByType30(): number[] {
  return (globalThis as { __battleState?: { gLastHitByType?: number[] } }).__battleState?.gLastHitByType ?? [0, 0, 0, 0];
}
function _gLastResultingMoves30(): number[] {
  return (globalThis as { __battleState?: { gLastResultingMoves?: number[] } }).__battleState?.gLastResultingMoves ?? [0, 0, 0, 0];
}
function _gLastPrintedMoves30(): number[] {
  return (globalThis as { __battleState?: { gLastPrintedMoves?: number[] } }).__battleState?.gLastPrintedMoves ?? [0, 0, 0, 0];
}
function _gLastHitBy30(): number[] {
  return (globalThis as { __battleState?: { gLastHitBy?: number[] } }).__battleState?.gLastHitBy ?? [0, 0, 0, 0];
}
function _setMoveResultFlags30(): (v: number) => void {
  return (globalThis as { __battleStateMutators?: { setMoveResultFlags?: (v: number) => void } })
    .__battleStateMutators?.setMoveResultFlags ?? (() => { /* noop */ });
}
function _setCurrentMove30(): (v: number) => void {
  return (globalThis as { __battleStateMutators?: { setCurrentMove?: (v: number) => void } })
    .__battleStateMutators?.setCurrentMove ?? (() => { /* noop */ });
}

// ─── 0x4D switchindataupdate ──────────────────────────────────────────────

/** 1:1 décomp Cmd_switchindataupdate. 2 bytes. Notre port : memcpy depuis
 *  gBattleBufferB pas wired ; on suppose gBattleMons déjà à jour
 *  (= notre setMonData path écrit direct). Reste : Baton Pass copy
 *  statStages/status2 depuis oldData + SwitchInClearSetData. */
function Cmd_switchindataupdate(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode(ctx);
  const arg = readByte(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);

  // 1:1 décomp : oldData = gBattleMons[active] (= snapshot pour Baton Pass).
  const oldStatStages = [...gBattleMons[active].statStages];
  const oldStatus2 = gBattleMons[active].status2;

  // gBattleBufferB copy : skip (= state direct sync).
  // gSpeciesInfo[species].types[0/1] : skip (= type1/type2 déjà à jour).
  // ability recalc via GetAbilityBySpecies : skip.

  // 1:1 décomp : knockedOffMons clear item.
  // (Notre port : gWishFutureKnock.knockedOffMons est u8 unique pas array — skip.)

  // AUDIT FIX : EFFECT_BATON_PASS = 127, pas 95. Valeur depuis auto-data.
  if (getBattleMove(gCurrentMove).effect === 127 /* EFFECT_BATON_PASS */) {
    gBattleMons[active].statStages = oldStatStages;
    gBattleMons[active].status2 = oldStatus2;
  }

  _switchInClearSetData(active);
  gBattleScripting.battler = active;
  // 1:1 décomp battle_script_commands.c:4672.
  PREPARE_MON_NICK_BUFFER(_gBattleTextBuff1_30, active, gBattlerPartyIndexes[active]);
  return false;
}

// ─── 0xA6 settypetorandomresistance ───────────────────────────────────────

/** 1:1 décomp Cmd_settypetorandomresistance. 5 bytes (u32 fail jump). Conv 2. */
function Cmd_settypetorandomresistance(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gLastLandedMoves[gBattlerAttacker] === MOVE_NONE
      || gLastLandedMoves[gBattlerAttacker] === MOVE_UNAVAILABLE) {
    ctx.scriptPtr = failJump;
    return false;
  }
  if (_isTwoTurnsMove(gLastLandedMoves[gBattlerAttacker])
      && (gBattleMons[gLastHitBy[gBattlerAttacker]].status2 & STATUS2_MULTIPLETURNS)) {
    ctx.scriptPtr = failJump;
    return false;
  }

  // 1:1 décomp : 1000 tries random, puis 1 pass séquentiel.
  const atk = gBattleMons[gBattlerAttacker];
  const tableSize = gTypeEffectiveness.length;
  for (let rands = 0; rands < 1000; rands++) {
    let i: number;
    do {
      i = Random() % 128;
    } while (i > Math.floor(tableSize / 3));
    i *= 3;
    if (gTypeEffectiveness[i] === gLastHitByType[gBattlerAttacker]
        && gTypeEffectiveness[i + 2] <= TYPE_MUL_NOT_EFFECTIVE
        && !IS_BATTLER_OF_TYPE(atk.type1, atk.type2, gTypeEffectiveness[i + 1])) {
      atk.type1 = gTypeEffectiveness[i + 1];
      atk.type2 = gTypeEffectiveness[i + 1];
      // 1:1 décomp PREPARE_TYPE_BUFFER (random pick success).
      PREPARE_TYPE_BUFFER(_gBattleTextBuff1_30, gTypeEffectiveness[i + 1]);
      return false;
    }
  }

  // Fallback pass séquentiel — 1:1 décomp utilise `<= 5` (= TYPE_MUL_NOT_EFFECTIVE),
  // PAS `<= TYPE_MUL_NO_EFFECT` (0). Inclut donc NO_EFFECT et NOT_EFFECTIVE.
  for (let j = 0; j < tableSize; j += 3) {
    if (gTypeEffectiveness[j] === TYPE_ENDTABLE || gTypeEffectiveness[j] === TYPE_FORESIGHT) continue;
    if (gTypeEffectiveness[j] === gLastHitByType[gBattlerAttacker]
        && gTypeEffectiveness[j + 2] <= TYPE_MUL_NOT_EFFECTIVE
        && !IS_BATTLER_OF_TYPE(atk.type1, atk.type2, gTypeEffectiveness[j + 1])) {
      atk.type1 = gTypeEffectiveness[j + 1];
      atk.type2 = gTypeEffectiveness[j + 1];
      // 1:1 décomp PREPARE_TYPE_BUFFER pour fallback pass.
      PREPARE_TYPE_BUFFER(_gBattleTextBuff1_30, gTypeEffectiveness[j + 1]);
      return false;
    }
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── 0xBA jumpifnopursuitswitchdmg ────────────────────────────────────────

/** 1:1 décomp Cmd_jumpifnopursuitswitchdmg. 5 bytes (u32 fail jump). */
function Cmd_jumpifnopursuitswitchdmg(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  // 1:1 décomp : set gBattlerTarget selon gMultiHitCounter + side.
  if (gMultiHitCounter === 1) {
    if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER) {
      setBattlerTarget(GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT));
    } else {
      setBattlerTarget(GetBattlerAtPosition(B_POSITION_PLAYER_LEFT));
    }
  } else {
    if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER) {
      setBattlerTarget(GetBattlerAtPosition(B_POSITION_OPPONENT_RIGHT));
    } else {
      setBattlerTarget(GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT));
    }
  }
  const target = gBattlerTarget;

  if (gChosenActionByBattler[target] === B_ACTION_USE_MOVE
      && gBattlerAttacker === gBattleStruct.moveTarget[target]
      && !(gBattleMons[target].status1 & (STATUS1_SLEEP | STATUS1_FREEZE))
      && gBattleMons[gBattlerAttacker].hp
      && !gDisableStructs[target].truantCounter
      && gChosenMoveByBattler[target] === MOVE_PURSUIT) {
    for (let i = 0; i < gBattlersCount; i++) {
      if (gBattlerByTurnOrder[i] === target) {
        gActionsByTurnOrder[i] = B_ACTION_TRY_FINISH;
      }
    }
    setCurrentMove(MOVE_PURSUIT);
    setCurrMovePos(gBattleStruct.chosenMovePositions[target]);
    // gChosenMovePos = ditto.
    gBattleScripting.animTurn = 1;
    setHitMarker(gHitMarker & ~HITMARKER_ATTACKSTRING_PRINTED);
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── 0xC4 trydobeatup ─────────────────────────────────────────────────────

/** 1:1 décomp `Cmd_trydobeatup` (battle_script_commands.c). 10 bytes :
 *  u32 endBeatUpPtr + u32 noValidMonsPtr.
 *  Itère les party slots pour trouver un mon utilisable pour Beat Up.
 *
 *  Logic :
 *    - target.hp == 0 → jump endBeatUpPtr (= early end).
 *    - else loop party slots :
 *        - found valid mon (HP > 0 && species != NONE && status == 0) →
 *          calc dmg + advance + use gBattleCommunication[0] = party slot.
 *        - exhausted && beforeLoop != 0 → jump endBeatUpPtr.
 *        - exhausted && beforeLoop == 0 → jump noValidMonsPtr. */
function Cmd_trydobeatup(ctx: BattleScriptContext): boolean {
  const endBeatUpPtr = readWord(ctx);
  const noValidMonsPtr = readWord(ctx);
  if (gBattleMons[gBattlerTarget].hp === 0) {
    ctx.scriptPtr = endBeatUpPtr;
    return false;
  }

  // 1:1 décomp : itère gPlayerParty depuis gBattleCommunication[0] pour
  // trouver mon HP > 0 && species != NONE && status == 0.
  const beforeLoop = gBattleCommunicationBU[0];
  while (gBattleCommunicationBU[0] < 6 /* PARTY_SIZE */) {
    const slot = gBattleCommunicationBU[0];
    const hp = GetMonData_BU(gPlayerParty_BU[slot], MON_DATA_HP_BU) as number;
    const species2 = GetMonData_BU(gPlayerParty_BU[slot], MON_DATA_SPECIES2_BU) as number;
    const status = GetMonData_BU(gPlayerParty_BU[slot], MON_DATA_STATUS_BU) as number;
    if (hp !== 0 && species2 !== 0 && status === 0) break;
    gBattleCommunicationBU[0]++;
  }

  if (gBattleCommunicationBU[0] < 6) {
    // Found valid party member → calculate damage (= 1:1 décomp formula).
    const slot = gBattleCommunicationBU[0];
    // 1:1 décomp battle_script_commands.c:8987 : PREPARE_MON_NICK_WITH_PREFIX_BUFFER
    // pour le message "Attaque de X!" (= party member name avec préfixe).
    PREPARE_MON_NICK_WITH_PREFIX_BUFFER(gBattleTextBuff1, gBattlerAttacker, slot);
    const baseAttack = _getBaseAttackBU(GetMonData_BU(gPlayerParty_BU[slot], MON_DATA_SPECIES_BU) as number);
    const monLevel = GetMonData_BU(gPlayerParty_BU[slot], MON_DATA_LEVEL_BU) as number;
    const baseDefense = _getBaseDefenseBU(gBattleMons[gBattlerTarget].species);
    let damage = baseAttack;
    damage *= getBattleMoveBU(gCurrentMove).power;
    damage *= Math.floor(monLevel * 2 / 5) + 2;
    damage = Math.floor(damage / baseDefense);
    damage = Math.floor(damage / 50) + 2;
    if (gProtectStructsBU[gBattlerAttacker].helpingHand) {
      damage = Math.floor(damage * 15 / 10);
    }
    setBattleMoveDamageBU(damage);
    // 1:1 décomp : `gBattlescriptCurrInstr += 9` — advance déjà fait par dispatch.
  } else if (beforeLoop !== 0) {
    ctx.scriptPtr = endBeatUpPtr;
  } else {
    ctx.scriptPtr = noValidMonsPtr;
  }
  return false;
}

// Imports locaux Beat Up (= éviter dups au top du file).
import {
  gPlayerParty as gPlayerParty_BU, GetMonData as GetMonData_BU,
  MON_DATA_HP as MON_DATA_HP_BU, MON_DATA_SPECIES as MON_DATA_SPECIES_BU,
  MON_DATA_SPECIES_OR_EGG as MON_DATA_SPECIES2_BU,
  MON_DATA_STATUS as MON_DATA_STATUS_BU, MON_DATA_LEVEL as MON_DATA_LEVEL_BU,
} from './party-storage';
import { getBattleMove as getBattleMoveBU } from './data/battle-moves';
import { setBattleMoveDamage as setBattleMoveDamageBU, gProtectStructs as gProtectStructsBU, gBattleCommunication as gBattleCommunicationBU } from './state';
// _getBaseAttack/_getBaseDefense (= gBaseStats[species].baseAttack/Defense 1:1).
import { getSpeciesInfo as getSpeciesInfoBU } from '../data/game-data';
import { speciesNumberToEnum as speciesNumberToEnumBU } from './data/species-runtime';
function _getBaseAttackBU(species: number): number {
  return getSpeciesInfoBU(speciesNumberToEnumBU(species))?.stats.atk ?? 1;
}
function _getBaseDefenseBU(species: number): number {
  return getSpeciesInfoBU(speciesNumberToEnumBU(species))?.stats.def ?? 1;
}

// ─── 0xD2 tryswapitems ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_tryswapitems. 5 bytes (u32 fail jump). Trick. */
function Cmd_tryswapitems(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  // 1:1 décomp : check TRAINER_HILL / link / frontier — fail.
  if (gBattleTypeFlags & BATTLE_TYPE_TRAINER_HILL) {
    ctx.scriptPtr = failJump;
    return false;
  }
  if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_OPPONENT
      && !(gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_FRONTIER))) {
    ctx.scriptPtr = failJump;
    return false;
  }

  // 1:1 décomp partial : knockedOffMons check skip (= state pas wired complet).
  // Direct swap : items items et items intermédiaire.
  const atkItem = gBattleMons[gBattlerAttacker].item;
  const tgtItem = gBattleMons[gBattlerTarget].item;
  // Trick fail si les deux n'ont pas d'item, ou conditions spéciales.
  if (atkItem === 0 && tgtItem === 0) {
    ctx.scriptPtr = failJump;
    return false;
  }
  // Swap.
  gBattleMons[gBattlerAttacker].item = tgtItem;
  gBattleMons[gBattlerTarget].item = atkItem;

  // 1:1 décomp battle_script_commands.c:9266-9275 : PREPARE_ITEM_BUFFER pour
  // affichage et MULTISTRING_CHOOSER pour variant de message.
  // newItemAtk = tgtItem (= ce que l'attacker a maintenant)
  // oldItemAtk = atkItem (= ce que l'attacker avait)
  PREPARE_ITEM_BUFFER(gBattleTextBuff1, tgtItem);  // new item attacker
  PREPARE_ITEM_BUFFER(gBattleTextBuff2, atkItem);  // old item attacker
  if (atkItem !== 0 && tgtItem !== 0) {
    gBattleCommunication[MULTISTRING_CHOOSER] = 0 /* B_MSG_ITEM_SWAP_BOTH */;
  } else if (atkItem === 0 && tgtItem !== 0) {
    gBattleCommunication[MULTISTRING_CHOOSER] = 1 /* B_MSG_ITEM_SWAP_TAKEN */;
  } else {
    gBattleCommunication[MULTISTRING_CHOOSER] = 2 /* B_MSG_ITEM_SWAP_GIVEN */;
  }
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installBatch30Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x4D] = Cmd_switchindataupdate;
  commands[0xA6] = Cmd_settypetorandomresistance;
  commands[0xBA] = Cmd_jumpifnopursuitswitchdmg;
  commands[0xC4] = Cmd_trydobeatup;
  commands[0xD2] = Cmd_tryswapitems;
}

void B_POSITION_PLAYER_LEFT;
void B_POSITION_OPPONENT_LEFT;
void B_POSITION_PLAYER_RIGHT;
void B_POSITION_OPPONENT_RIGHT;
void setBattlerAttacker;
void gBitTable;
