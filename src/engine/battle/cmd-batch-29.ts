/**
 * battle/cmd-batch-29.ts — Phase 1 Batch 29 (mirror/sketch/heal bell) — 4 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x7C trymirrormove           (1 byte — Mirror Move pick last hit move)
 *   0xA8 copymovepermanently     (5 bytes — Sketch overwrite move slot)
 *   0xAE healpartystatus         (1 byte — Heal Bell / Aromatherapy)
 *   0xDE assistattackselect      (5 bytes — Assist pick random party move)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readWord, Random, getMoveEffectScriptOffset } from './script-interpreter';
import {
  gBattleMons, gBattlerAttacker, gBattlerTarget, setBattlerTarget,
  gCurrentMove, setCurrentMove, setCalledMove, setChosenMove,
  setActiveBattler,
  gHitMarker, setHitMarker,
  gBattlersCount, gAbsentBattlerFlags,
  gBattleTypeFlags,
  gBattleCommunication, gBattleScripting,
  gSpecialStatuses,
  gLastPrintedMoves,
  gLastTakenMove, gLastTakenMoveFrom,
  gCurrMovePos, setCurrMovePos,
  gBattlerPartyIndexes,
} from './state';
import {
  MAX_MON_MOVES, MOVE_NONE, MOVE_UNAVAILABLE, MOVE_STRUGGLE,
  MOVE_HEAL_BELL, MOVE_SKETCH,
  STATUS2_TRANSFORMED, STATUS2_NIGHTMARE,
  HITMARKER_ATTACKSTRING_PRINTED,
  ABILITY_SOUNDPROOF,
  BATTLE_TYPE_DOUBLE,
  MULTISTRING_CHOOSER,
  B_MSG_BELL, B_MSG_BELL_SOUNDPROOF_ATTACKER, B_MSG_BELL_SOUNDPROOF_PARTNER,
  B_MSG_SOOTHING_AROMA,
  GET_BATTLER_SIDE, BATTLE_PARTNER,
  REQUEST_STATUS_BATTLE, B_COMM_TO_CONTROLLER,
  sMovesForbiddenToCopy,
  B_SIDE_PLAYER,
} from './constants';
import {
  BtlController_EmitSetMonData, MarkBattlerForControllerExec, gBitTable,
} from './battle-controllers';
import { GetBattlerAtPosition, GetBattlerPosition } from './util';
import { getBattleMove } from './data/battle-moves';
import { MAX_BATTLERS_COUNT } from './state';
import {
  gPlayerParty, gEnemyParty, GetMonData, GetAbilityBySpecies, PARTY_SIZE,
  MON_DATA_SPECIES_OR_EGG, MON_DATA_ABILITY_NUM,
} from './party-storage';
import {
  gBattleTextBuff1 as _gBattleTextBuff1_29,
  PREPARE_MOVE_BUFFER,
} from './text-buffers';

// ─── Helpers ────────────────────────────────────────────────────────────────

// 1:1 décomp `RecordAbilityBattle` — wired via util.ts.
import { RecordAbilityBattle as _recordAbilityBattleFullN29 } from './util';
function _recordAbilityBattle(b: number, a: number): void { _recordAbilityBattleFullN29(b, a); }

// 1:1 décomp `GetMoveTarget` — wired via cmd-batch-34 export.
import { _GetMoveTarget as _GetMoveTargetFullN29 } from './cmd-batch-34';
function _getMoveTarget(move: number, override: number): number {
  return _GetMoveTargetFullN29(move, override);
}

/** Suit le décomp Cmd_assistattackselect : itère sMovesForbiddenToCopy
 *  jusqu'à ASSIST_FORBIDDEN_END (= MIMIC_FORBIDDEN_END dans le décomp). */
function _isMoveForbiddenForAssist(move: number): boolean {
  // 1:1 décomp : iterate jusqu'à ASSIST_FORBIDDEN_END (= 0xFFFE).
  // Notre table sMovesForbiddenToCopy contient les move forbidden + sentinels.
  for (let i = 0; i < sMovesForbiddenToCopy.length; i++) {
    if (sMovesForbiddenToCopy[i] === 0xFFFE /* ASSIST_FORBIDDEN_END */) return false;
    if (sMovesForbiddenToCopy[i] === move) return true;
  }
  return false;
}

// ─── 0x7C trymirrormove ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_trymirrormove. 1 byte. */
function Cmd_trymirrormove(ctx: BattleScriptContext): boolean {
  const validMoves: number[] = new Array(MAX_BATTLERS_COUNT - 1).fill(MOVE_NONE);
  let validMovesCount = 0;

  // 1:1 décomp : iter battlers, lookup lastTakenMoveFrom[i*2 + attacker*8].
  // Notre flat array : index = attacker*4 + i (= 16 entries u16).
  for (let i = 0; i < gBattlersCount; i++) {
    if (i === gBattlerAttacker) continue;
    const move = gLastTakenMoveFrom[gBattlerAttacker * 4 + i] ?? 0;
    if (move !== MOVE_NONE && move !== MOVE_UNAVAILABLE) {
      validMoves[validMovesCount++] = move;
    }
  }

  const directMove = gLastTakenMove[gBattlerAttacker] ?? 0;
  if (directMove !== MOVE_NONE && directMove !== MOVE_UNAVAILABLE) {
    setHitMarker(gHitMarker & ~HITMARKER_ATTACKSTRING_PRINTED);
    setCurrentMove(directMove);
    setBattlerTarget(_getMoveTarget(directMove, 0));
    // 1:1 décomp : gBattlescriptCurrInstr = gBattleScriptsForMoveEffects[move.effect].
    const off = getMoveEffectScriptOffset(getBattleMove(directMove).effect);
    if (off >= 0) ctx.scriptPtr = off;
    return false;
  }
  if (validMovesCount !== 0) {
    setHitMarker(gHitMarker & ~HITMARKER_ATTACKSTRING_PRINTED);
    const pick = Random() % validMovesCount;
    setCurrentMove(validMoves[pick]);
    setBattlerTarget(_getMoveTarget(validMoves[pick], 0));
    // 1:1 décomp : gBattlescriptCurrInstr = gBattleScriptsForMoveEffects[move.effect].
    const off = getMoveEffectScriptOffset(getBattleMove(validMoves[pick]).effect);
    if (off >= 0) ctx.scriptPtr = off;
    return false;
  }
  // 1:1 décomp : pas de move valide → ppNotAffectedByPressure + advance.
  gSpecialStatuses[gBattlerAttacker].ppNotAffectedByPressure = 1;
  return false;
}

// ─── 0xA8 copymovepermanently ─────────────────────────────────────────────

/** 1:1 décomp Cmd_copymovepermanently. 5 bytes (u32 fail jump). Sketch. */
function Cmd_copymovepermanently(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  // 1:1 décomp : `gChosenMove = MOVE_UNAVAILABLE` (= mark sketch fail-state).
  setChosenMove(MOVE_UNAVAILABLE);

  const lastMove = gLastPrintedMoves[gBattlerTarget] ?? 0;
  if ((gBattleMons[gBattlerAttacker].status2 & STATUS2_TRANSFORMED)
      || lastMove === MOVE_STRUGGLE
      || lastMove === MOVE_NONE
      || lastMove === MOVE_UNAVAILABLE
      || lastMove === MOVE_SKETCH) {
    ctx.scriptPtr = failJump;
    return false;
  }
  // Cherche si attacker connaît déjà ce move (= ne pas overwrite Sketch lui-même).
  let i = 0;
  for (i = 0; i < MAX_MON_MOVES; i++) {
    if (gBattleMons[gBattlerAttacker].moves[i] === MOVE_SKETCH) continue;
    if (gBattleMons[gBattlerAttacker].moves[i] === lastMove) break;
  }
  if (i !== MAX_MON_MOVES) {
    ctx.scriptPtr = failJump;
    return false;
  }
  // Overwrite gCurrMovePos slot.
  gBattleMons[gBattlerAttacker].moves[gCurrMovePos] = lastMove;
  gBattleMons[gBattlerAttacker].pp[gCurrMovePos] = getBattleMove(lastMove).pp;
  // 1:1 décomp battle_script_commands.c : MovePpInfo emit + PREPARE_MOVE_BUFFER.
  // L'emit MovePpInfo via REQUEST_MOVES_PP_BATTLE est un sync UI-side ; on
  // omet le buffer pack/unpack puisque notre BattleMon.pp[] est déjà la source
  // de truth in-battle (party-side flush au battle end). Le PREPARE_MOVE_BUFFER
  // reste 1:1 strict.
  PREPARE_MOVE_BUFFER(_gBattleTextBuff1_29, lastMove);
  return false;
}

// ─── 0xAE healpartystatus ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_healpartystatus. 1 byte. Heal Bell / Aromatherapy. */
function Cmd_healpartystatus(_ctx: BattleScriptContext): boolean {
  const zero = 0;
  let toHeal = 0;

  if (gCurrentMove === MOVE_HEAL_BELL) {
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_BELL;

    const party = GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER ? gPlayerParty : gEnemyParty;

    if (gBattleMons[gBattlerAttacker].ability !== ABILITY_SOUNDPROOF) {
      gBattleMons[gBattlerAttacker].status1 = 0;
      gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_NIGHTMARE;
    } else {
      _recordAbilityBattle(gBattlerAttacker, gBattleMons[gBattlerAttacker].ability);
      gBattleCommunication[MULTISTRING_CHOOSER] |= B_MSG_BELL_SOUNDPROOF_ATTACKER;
    }
    const partner = GetBattlerAtPosition(BATTLE_PARTNER(GetBattlerPosition(gBattlerAttacker)));
    setActiveBattler(partner);
    gBattleScripting.battler = partner;
    if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE) && !(gAbsentBattlerFlags & gBitTable[partner])) {
      if (gBattleMons[partner].ability !== ABILITY_SOUNDPROOF) {
        gBattleMons[partner].status1 = 0;
        gBattleMons[partner].status2 &= ~STATUS2_NIGHTMARE;
      } else {
        _recordAbilityBattle(partner, gBattleMons[partner].ability);
        gBattleCommunication[MULTISTRING_CHOOSER] |= B_MSG_BELL_SOUNDPROOF_PARTNER;
      }
    }

    // 1:1 décomp : iter party 0..PARTY_SIZE pour set toHeal bits per-mon
    // selon ability check (= SOUNDPROOF skip).
    for (let i = 0; i < PARTY_SIZE; i++) {
      const species = GetMonData(party[i], MON_DATA_SPECIES_OR_EGG) as number;
      const abilityNum = GetMonData(party[i], MON_DATA_ABILITY_NUM) as number;
      if (species !== 0 /* SPECIES_NONE */ && species !== 412 /* SPECIES_EGG */) {
        let ability: number;
        if (gBattlerPartyIndexes[gBattlerAttacker] === i) {
          ability = gBattleMons[gBattlerAttacker].ability;
        } else if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE)
                   && gBattlerPartyIndexes[partner] === i
                   && !(gAbsentBattlerFlags & gBitTable[partner])) {
          ability = gBattleMons[partner].ability;
        } else {
          ability = GetAbilityBySpecies(species, abilityNum);
        }
        if (ability !== ABILITY_SOUNDPROOF) {
          toHeal |= (1 << i);
        }
      }
    }
  } else {
    // 1:1 décomp Aromatherapy : ignore SOUNDPROOF, heal tous.
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_SOOTHING_AROMA;
    toHeal = (1 << PARTY_SIZE) - 1;
    gBattleMons[gBattlerAttacker].status1 = 0;
    gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_NIGHTMARE;
    const partner = GetBattlerAtPosition(BATTLE_PARTNER(GetBattlerPosition(gBattlerAttacker)));
    setActiveBattler(partner);
    if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE) && !(gAbsentBattlerFlags & gBitTable[partner])) {
      gBattleMons[partner].status1 = 0;
      gBattleMons[partner].status2 &= ~STATUS2_NIGHTMARE;
    }
  }

  if (toHeal) {
    setActiveBattler(gBattlerAttacker);
    BtlController_EmitSetMonData(B_COMM_TO_CONTROLLER, REQUEST_STATUS_BATTLE, toHeal, 4, zero);
    MarkBattlerForControllerExec(gBattlerAttacker);
  }
  return false;
}

// ─── 0xDE assistattackselect ──────────────────────────────────────────────

/** 1:1 décomp Cmd_assistattackselect (battle_script_commands.c:9487-9538).
 *  5 bytes (u32 fail jump). Assist : random move depuis party (= autres mons).
 *
 *  Wired vers gPlayerParty / gEnemyParty selon side (= pas plus de stub
 *  gBattleMons iter). */
function Cmd_assistattackselect(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);

  // 1:1 décomp ll.9492 : `validMoves = gBattleStruct->assistPossibleMoves`
  // (= u16[PARTY_SIZE × MAX_MON_MOVES] = 24 slots).
  const validMoves: number[] = [];

  // 1:1 décomp ll.9494-9497 : party selection selon side.
  const party = GET_BATTLER_SIDE(gBattlerAttacker) !== B_SIDE_PLAYER_AAS
    ? _gEnemyPartyAAS
    : _gPlayerPartyAAS;

  // 1:1 décomp ll.9499-9526 : itère party slots (sauf attacker), skip species
  // NONE/EGG, et pour chaque slot itère les 4 moves.
  for (let monId = 0; monId < 6 /* PARTY_SIZE */; monId++) {
    if (monId === _gBattlerPartyIndexesAAS[gBattlerAttacker]) continue;
    const speciesOrEgg = _GetMonDataAAS(party[monId], _MON_DATA_SPECIES_OR_EGG_AAS) as number;
    if (speciesOrEgg === 0 /* SPECIES_NONE */) continue;
    if (speciesOrEgg === 412 /* SPECIES_EGG */) continue;

    for (let moveIndex = 0; moveIndex < MAX_MON_MOVES; moveIndex++) {
      const move = _GetMonDataAAS(party[monId], _MON_DATA_MOVE1_AAS + moveIndex) as number;
      if (move === MOVE_NONE) continue;
      if (_isMoveForbiddenForAssist(move)) continue;
      validMoves.push(move);
    }
  }

  if (validMoves.length > 0) {
    setHitMarker(gHitMarker & ~HITMARKER_ATTACKSTRING_PRINTED);
    // 1:1 décomp l.9530 : `((Random() & 0xFF) * chooseableMovesNo) >> 8`.
    const pick = (Random() & 0xFF) * validMoves.length >>> 8;
    setCalledMove(validMoves[pick]);
    setBattlerTarget(_getMoveTarget(validMoves[pick], 0 /* NO_TARGET_OVERRIDE */));
  } else {
    ctx.scriptPtr = failJump;
  }
  return false;
}

// Imports locaux Cmd_assistattackselect (= éviter dups au top).
import { B_SIDE_PLAYER as B_SIDE_PLAYER_AAS } from './constants';
import {
  gPlayerParty as _gPlayerPartyAAS, gEnemyParty as _gEnemyPartyAAS,
  GetMonData as _GetMonDataAAS,
  MON_DATA_SPECIES_OR_EGG as _MON_DATA_SPECIES_OR_EGG_AAS,
  MON_DATA_MOVE1 as _MON_DATA_MOVE1_AAS,
} from './party-storage';
import { gBattlerPartyIndexes as _gBattlerPartyIndexesAAS } from './state';

// ─── Install handlers ──────────────────────────────────────────────────────

export function installBatch29Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x7C] = Cmd_trymirrormove;
  commands[0xA8] = Cmd_copymovepermanently;
  commands[0xAE] = Cmd_healpartystatus;
  commands[0xDE] = Cmd_assistattackselect;
}
