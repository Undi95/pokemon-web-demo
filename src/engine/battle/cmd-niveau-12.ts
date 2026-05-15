/**
 * battle/cmd-niveau-12.ts — Phase 1 Niveau 12 (semi-invul + buffers + misc) — 8 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x6B atknameinbuff1       (1 byte — PREPARE_MON_NICK_BUFFER stub)
 *   0x6D resetsentmonsvalue   (1 byte — ResetSentPokesToOpponentValue stub)
 *   0x6E setatktoplayer0      (1 byte — gBattlerAttacker = position PLAYER_LEFT)
 *   0x71 buffermovetolearn    (1 byte — BufferMoveToLearnIntoBattleTextBuff2 stub)
 *   0xA3 disablelastusedattack (5 bytes — set disabledMove + 2-5 turn timer)
 *   0xA4 trysetencore         (5 bytes — set encoredMove + 3-6 turn timer)
 *   0xC5 setsemiinvulnerablebit (1 byte — switch sur gCurrentMove
 *                                FLY/BOUNCE→ON_AIR, DIG→UNDERGROUND, DIVE→UNDERWATER)
 *   0xC6 clearsemiinvulnerablebit (1 byte — mirror, clear)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/include/constants/moves.h:19,91,119,166,227,291,340`
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readWord, Random } from './script-interpreter';
import {
  gBattlerAttacker, gBattlerTarget, setBattlerAttacker,
  gBattleMons, gCurrentMove, gStatuses3, gDisableStructs,
  gLastMoves,
} from './state';
import {
  STATUS3_ON_AIR, STATUS3_UNDERGROUND, STATUS3_UNDERWATER,
  MOVE_FLY, MOVE_BOUNCE, MOVE_DIG, MOVE_DIVE,
  MOVE_STRUGGLE, MOVE_ENCORE, MOVE_MIRROR_MOVE, MOVE_NONE,
  MAX_MON_MOVES,
} from './constants';
import { GetBattlerAtPosition, B_POSITION_PLAYER_LEFT } from './util';

// ─── 0x6B atknameinbuff1 ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_atknameinbuff1. 1 byte.
 *  Décomp utilise PREPARE_MON_NICK_BUFFER macro qui setup placeholder
 *  buffer pour le nom du Pokémon attaquant. MVP : stub. */
function Cmd_atknameinbuff1(_ctx: BattleScriptContext): boolean {
  // TODO porter PREPARE_MON_NICK_BUFFER (= text placeholder system).
  return false;
}

// ─── 0x6D resetsentmonsvalue ───────────────────────────────────────────────

/** 1:1 décomp Cmd_resetsentmonsvalue. 1 byte.
 *  Décomp appelle ResetSentPokesToOpponentValue() — tracking pour exp share. */
function Cmd_resetsentmonsvalue(_ctx: BattleScriptContext): boolean {
  // TODO porter ResetSentPokesToOpponentValue (exp share tracking).
  return false;
}

// ─── 0x6E setatktoplayer0 ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_setatktoplayer0. 1 byte. */
function Cmd_setatktoplayer0(_ctx: BattleScriptContext): boolean {
  setBattlerAttacker(GetBattlerAtPosition(B_POSITION_PLAYER_LEFT));
  return false;
}

// ─── 0x71 buffermovetolearn ────────────────────────────────────────────────

/** 1:1 décomp Cmd_buffermovetolearn. 1 byte.
 *  Décomp appelle BufferMoveToLearnIntoBattleTextBuff2() — text placeholder. */
function Cmd_buffermovetolearn(_ctx: BattleScriptContext): boolean {
  // TODO porter BufferMoveToLearnIntoBattleTextBuff2 (text placeholder).
  return false;
}

// ─── 0xA3 disablelastusedattack ────────────────────────────────────────────

/** 1:1 décomp Cmd_disablelastusedattack. 5 bytes (u32 fail jump). */
function Cmd_disablelastusedattack(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const target = gBattlerTarget;
  let i;
  for (i = 0; i < MAX_MON_MOVES; i++) {
    if (gBattleMons[target].moves[i] === gLastMoves[target]) break;
  }
  if (gDisableStructs[target].disabledMove === MOVE_NONE
      && i !== MAX_MON_MOVES && gBattleMons[target].pp[i] !== 0) {
    gDisableStructs[target].disabledMove = gBattleMons[target].moves[i];
    const timer = (Random() & 3) + 2;
    gDisableStructs[target].disableTimer = timer;
    gDisableStructs[target].disableTimerStartValue = timer;
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── 0xA4 trysetencore ─────────────────────────────────────────────────────

/** 1:1 décomp Cmd_trysetencore. 5 bytes (u32 fail jump). */
function Cmd_trysetencore(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const target = gBattlerTarget;
  let i;
  for (i = 0; i < MAX_MON_MOVES; i++) {
    if (gBattleMons[target].moves[i] === gLastMoves[target]) break;
  }

  if (gLastMoves[target] === MOVE_STRUGGLE
      || gLastMoves[target] === MOVE_ENCORE
      || gLastMoves[target] === MOVE_MIRROR_MOVE) {
    i = MAX_MON_MOVES;
  }

  if (gDisableStructs[target].encoredMove === MOVE_NONE
      && i !== MAX_MON_MOVES && gBattleMons[target].pp[i] !== 0) {
    gDisableStructs[target].encoredMove = gBattleMons[target].moves[i];
    gDisableStructs[target].encoredMovePos = i;
    const timer = (Random() & 3) + 3;
    gDisableStructs[target].encoreTimer = timer;
    gDisableStructs[target].encoreTimerStartValue = timer;
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── 0xC5 setsemiinvulnerablebit ───────────────────────────────────────────

/** 1:1 décomp Cmd_setsemiinvulnerablebit. 1 byte. */
function Cmd_setsemiinvulnerablebit(_ctx: BattleScriptContext): boolean {
  switch (gCurrentMove) {
    case MOVE_FLY:
    case MOVE_BOUNCE:
      gStatuses3[gBattlerAttacker] |= STATUS3_ON_AIR;
      break;
    case MOVE_DIG:
      gStatuses3[gBattlerAttacker] |= STATUS3_UNDERGROUND;
      break;
    case MOVE_DIVE:
      gStatuses3[gBattlerAttacker] |= STATUS3_UNDERWATER;
      break;
  }
  return false;
}

// ─── 0xC6 clearsemiinvulnerablebit ─────────────────────────────────────────

/** 1:1 décomp Cmd_clearsemiinvulnerablebit. 1 byte. */
function Cmd_clearsemiinvulnerablebit(_ctx: BattleScriptContext): boolean {
  switch (gCurrentMove) {
    case MOVE_FLY:
    case MOVE_BOUNCE:
      gStatuses3[gBattlerAttacker] &= ~STATUS3_ON_AIR;
      break;
    case MOVE_DIG:
      gStatuses3[gBattlerAttacker] &= ~STATUS3_UNDERGROUND;
      break;
    case MOVE_DIVE:
      gStatuses3[gBattlerAttacker] &= ~STATUS3_UNDERWATER;
      break;
  }
  return false;
}

// ─── Install dispatch table ─────────────────────────────────────────────────

export function installNiveau12Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x6B] = Cmd_atknameinbuff1;
  commands[0x6D] = Cmd_resetsentmonsvalue;
  commands[0x6E] = Cmd_setatktoplayer0;
  commands[0x71] = Cmd_buffermovetolearn;
  commands[0xA3] = Cmd_disablelastusedattack;
  commands[0xA4] = Cmd_trysetencore;
  commands[0xC5] = Cmd_setsemiinvulnerablebit;
  commands[0xC6] = Cmd_clearsemiinvulnerablebit;
}
