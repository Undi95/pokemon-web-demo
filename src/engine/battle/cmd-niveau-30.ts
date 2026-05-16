/**
 * battle/cmd-niveau-30.ts — Phase 1 Niveau 30 (conversion2/pursuit/switchupdate/beatup/trick) — 5 opcodes
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

// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

/** 1:1 décomp `IsTwoTurnsMove(move)` (battle_script_commands.c:8199-8210).
 *  AUDIT FIX : précédemment stub return false → tous moves considérés single-turn.
 *  Wiring via local check (= éviter import circulaire avec cmd-niveau-27). */
function _isTwoTurnsMove(move: number): boolean {
  const effect = getBattleMove(move).effect;
  // EFFECT_SKULL_BASH=145, RAZOR_WIND=39, SKY_ATTACK=75, SOLAR_BEAM=151,
  // SEMI_INVULNERABLE=155, BIDE=26. Valeurs auto-data battle_move_effects-data.ts.
  return effect === 145 || effect === 39 || effect === 75
      || effect === 151 || effect === 155 || effect === 26;
}

/** 1:1 stub `SwitchInClearSetData()` (battle_main.c). Reset effect tracking
 *  pour le mon switched in. MVP : clear gDisableStructs, statStages reset. */
function _switchInClearSetData(active: number): void {
  // Le décomp fait beaucoup de cleanups. Pour MVP : reset les disable timers.
  const ds = gDisableStructs[active];
  ds.encoredMove = 0; ds.encoreTimer = 0;
  ds.disabledMove = 0; ds.disableTimer = 0;
  ds.protectUses = 0;
  ds.tauntTimer = 0; ds.tauntTimer2 = 0;
  ds.rolloutTimer = 0; ds.furyCutterCounter = 0;
  ds.chargeTimer = 0;
  ds.isFirstTurn = 2;
  // Note : décomp fait aussi gProtectStructs reset + autres — TODO.
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
  // PREPARE_MON_NICK_BUFFER : TODO porter.
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
      // PREPARE_TYPE_BUFFER : TODO porter.
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
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installNiveau30Handlers(commands: BattleOpcodeHandler[]): void {
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
