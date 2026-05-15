/**
 * battle/cmd-niveau-29.ts — Phase 1 Niveau 29 (mirror/sketch/heal bell) — 4 opcodes
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

// ─── Helpers ────────────────────────────────────────────────────────────────

// 1:1 décomp `RecordAbilityBattle` — wired via util.ts.
import { RecordAbilityBattle as _recordAbilityBattleFullN29 } from './util';
function _recordAbilityBattle(b: number, a: number): void { _recordAbilityBattleFullN29(b, a); }

/** 1:1 stub `GetMoveTarget(move, override)` — pour MVP retourne gBattlerTarget. */
function _getMoveTarget(_move: number, _override: number): number {
  return gBattlerTarget;
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
  // PREPARE_MOVE_BUFFER : TODO porter text placeholder.
  // 1:1 décomp : send MovePpInfo via emit — TODO porter.
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

/** 1:1 décomp Cmd_assistattackselect. 5 bytes (u32 fail jump). Assist.
 *
 *  Note 1:1 partial : gPlayerParty/gEnemyParty iteration skip (= party storage
 *  pas wired battle-side). On utilise gBattleMons[] disponibles comme source
 *  des moves. */
function Cmd_assistattackselect(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const validMoves: number[] = [];

  // 1:1 décomp partial : itère gBattleMons même side au lieu de party.
  const attackerSide = GET_BATTLER_SIDE(gBattlerAttacker);
  for (let i = 0; i < gBattlersCount; i++) {
    if (i === gBattlerAttacker) continue;
    if (GET_BATTLER_SIDE(i) !== attackerSide) continue;
    for (let mi = 0; mi < MAX_MON_MOVES; mi++) {
      const move = gBattleMons[i].moves[mi];
      if (move === MOVE_NONE) continue;
      if (_isMoveForbiddenForAssist(move)) continue;
      validMoves.push(move);
    }
  }

  if (validMoves.length === 0) {
    ctx.scriptPtr = failJump;
    return false;
  }

  const pick = Random() % validMoves.length;
  setCalledMove(validMoves[pick]);
  setCurrMovePos(0);  // décomp utilise gBattleStruct.assistChosenMove ; on simpli.
  setHitMarker(gHitMarker & ~HITMARKER_ATTACKSTRING_PRINTED);
  setBattlerTarget(_getMoveTarget(validMoves[pick], 0));
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installNiveau29Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x7C] = Cmd_trymirrormove;
  commands[0xA8] = Cmd_copymovepermanently;
  commands[0xAE] = Cmd_healpartystatus;
  commands[0xDE] = Cmd_assistattackselect;
}
