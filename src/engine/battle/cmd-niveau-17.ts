/**
 * battle/cmd-niveau-17.ts — Phase 1 Niveau 17 (status field / type conversion) — 8 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x90 tryconversiontypechange   (5 bytes — Conversion type swap)
 *   0xA5 painsplitdmgcalc          (5 bytes — Pain Split HP avg)
 *   0xB0 trysetspikes              (5 bytes — Spikes side layer)
 *   0xB2 trysetperishsong          (5 bytes — Perish Song 3-turn)
 *   0xB4 jumpifconfusedandstatmaxed (6 bytes — Swagger/Flatter fail check)
 *   0xC9 trymemento                (5 bytes — Memento set damage = self.hp)
 *   0xDC trysetgrudge              (5 bytes — Grudge flag)
 *   0xEE removelightscreenreflect  (1 byte  — Brick Break)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readWord, readByte, Random } from './script-interpreter';
import {
  gBattleMons, gBattlerAttacker, gBattlerTarget,
  gBattleMoveDamage, setBattleMoveDamage,
  gMoveResultFlags, setMoveResultFlags,
  gStatuses3, gSideStatuses, gSideTimers,
  gBattlersCount, gDisableStructs,
  gSpecialStatuses, gBattleScripting,
  gBattleCommunication,
  setActiveBattler,
} from './state';
import {
  STATUS2_SUBSTITUTE, STATUS2_CONFUSION,
  STATUS3_GRUDGE, STATUS3_PERISH_SONG,
  SIDE_STATUS_SPIKES, SIDE_STATUS_REFLECT, SIDE_STATUS_LIGHTSCREEN,
  MOVE_RESULT_MISSED, MOVE_RESULT_FAILED,
  MAX_STAT_STAGE, MIN_STAT_STAGE,
  MAX_MON_MOVES, MOVE_NONE,
  TYPE_MYSTERY, TYPE_GHOST, TYPE_NORMAL,
  ABILITY_SOUNDPROOF,
  STAT_ATK, STAT_SPATK,
  GET_BATTLER_SIDE, BATTLE_OPPOSITE,
  IGNORE_SHELL_BELL, INSTANT_HP_BAR_DROP,
  MISS_TYPE, B_MSG_PROTECTED,
  IS_BATTLER_OF_TYPE,
  B_COMM_TO_CONTROLLER,
} from './constants';
import {
  BtlController_EmitHealthBarUpdate, MarkBattlerForControllerExec,
} from './battle-controllers';
import { getBattleMove } from './data/battle-moves';
import {
  gBattleTextBuff1,
  PREPARE_TYPE_BUFFER,
} from './text-buffers';

// ─── 0x90 tryconversiontypechange ─────────────────────────────────────────

/** 1:1 décomp Cmd_tryconversiontypechange. 5 bytes. */
function Cmd_tryconversiontypechange(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const atk = gBattleMons[gBattlerAttacker];

  let validMoves = 0;
  while (validMoves < MAX_MON_MOVES) {
    if (atk.moves[validMoves] === MOVE_NONE) break;
    validMoves++;
  }

  // 1:1 décomp : itère pour trouver premier move dont type ≠ types[0..1].
  let moveChecked = 0;
  let moveType = 0;
  for (moveChecked = 0; moveChecked < validMoves; moveChecked++) {
    moveType = getBattleMove(atk.moves[moveChecked]).type;
    if (moveType === TYPE_MYSTERY) {
      moveType = IS_BATTLER_OF_TYPE(atk.type1, atk.type2, TYPE_GHOST) ? TYPE_GHOST : TYPE_NORMAL;
    }
    if (moveType !== atk.type1 && moveType !== atk.type2) break;
  }

  if (moveChecked === validMoves) {
    ctx.scriptPtr = failJump;
    return false;
  }

  // Random pick d'un move dont type ≠ types[0..1].
  do {
    do {
      moveChecked = Random() % MAX_MON_MOVES;
    } while (moveChecked >= validMoves);
    moveType = getBattleMove(atk.moves[moveChecked]).type;
    if (moveType === TYPE_MYSTERY) {
      moveType = IS_BATTLER_OF_TYPE(atk.type1, atk.type2, TYPE_GHOST) ? TYPE_GHOST : TYPE_NORMAL;
    }
  } while (moveType === atk.type1 || moveType === atk.type2);

  // SET_BATTLER_TYPE = type1 = type2 = newType (battle.h macro 1:1).
  atk.type1 = moveType;
  atk.type2 = moveType;
  // 1:1 décomp battle_script_commands.c:7447.
  PREPARE_TYPE_BUFFER(gBattleTextBuff1, moveType);
  return false;
}

// ─── 0xA5 painsplitdmgcalc ────────────────────────────────────────────────

/** 1:1 décomp Cmd_painsplitdmgcalc. 5 bytes. */
function Cmd_painsplitdmgcalc(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gBattleMons[gBattlerTarget].status2 & STATUS2_SUBSTITUTE) {
    ctx.scriptPtr = failJump;
    return false;
  }
  const hpDiff = Math.floor((gBattleMons[gBattlerAttacker].hp + gBattleMons[gBattlerTarget].hp) / 2);
  const painSplitHp = gBattleMons[gBattlerTarget].hp - hpDiff;
  // 1:1 décomp store storeLoc[0..3] = u8 splits of u32 painSplitHp.
  // En TS on stocke directement le s32 dans painSplitHp (= équivalent
  // little-endian u8[4]).
  gBattleScripting.painSplitHp = painSplitHp;
  setBattleMoveDamage(gBattleMons[gBattlerAttacker].hp - hpDiff);
  gSpecialStatuses[gBattlerTarget].shellBellDmg = IGNORE_SHELL_BELL;
  return false;
}

// ─── 0xB0 trysetspikes ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_trysetspikes. 5 bytes. */
function Cmd_trysetspikes(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const targetSide = BATTLE_OPPOSITE(GET_BATTLER_SIDE(gBattlerAttacker));
  if (gSideTimers[targetSide].spikesAmount === 3) {
    gSpecialStatuses[gBattlerAttacker].ppNotAffectedByPressure = 1;
    ctx.scriptPtr = failJump;
    return false;
  }
  gSideStatuses[targetSide] |= SIDE_STATUS_SPIKES;
  gSideTimers[targetSide].spikesAmount++;
  return false;
}

// ─── 0xB2 trysetperishsong ────────────────────────────────────────────────

/** 1:1 décomp Cmd_trysetperishsong. 5 bytes. */
function Cmd_trysetperishsong(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  let notAffectedCount = 0;
  for (let i = 0; i < gBattlersCount; i++) {
    if ((gStatuses3[i] & STATUS3_PERISH_SONG)
        || gBattleMons[i].ability === ABILITY_SOUNDPROOF) {
      notAffectedCount++;
    } else {
      gStatuses3[i] |= STATUS3_PERISH_SONG;
      gDisableStructs[i].perishSongTimer = 3;
      gDisableStructs[i].perishSongTimerStartValue = 3;
    }
  }
  // 1:1 décomp PressurePPLoseOnUsingPerishSong (battle_util.c:799-828).
  // Inlined ici pour éviter circular import. Loop opponents avec Pressure +
  // deduit 1 PP supplémentaire du Perish Song du caster.
  const ABILITY_PRESSURE_LOCAL_N17 = 46;
  const MOVE_PERISH_SONG_LOCAL = 195;  // auto-data moves-data.ts
  const MAX_MON_MOVES_LOCAL_N17 = 4;
  for (let i = 0; i < gBattlersCount; i++) {
    if (gBattleMons[i].ability === ABILITY_PRESSURE_LOCAL_N17 && i !== gBattlerAttacker) {
      for (let j = 0; j < MAX_MON_MOVES_LOCAL_N17; j++) {
        if (gBattleMons[gBattlerAttacker].moves[j] === MOVE_PERISH_SONG_LOCAL) {
          if (gBattleMons[gBattlerAttacker].pp[j] !== 0) {
            gBattleMons[gBattlerAttacker].pp[j]--;
          }
          break;
        }
      }
    }
  }
  if (notAffectedCount === gBattlersCount) {
    ctx.scriptPtr = failJump;
    return false;
  }
  return false;
}

// ─── 0xB4 jumpifconfusedandstatmaxed ──────────────────────────────────────

/** 1:1 décomp Cmd_jumpifconfusedandstatmaxed. 6 bytes (u8 stat + u32 jump). */
function Cmd_jumpifconfusedandstatmaxed(ctx: BattleScriptContext): boolean {
  const stat = readByte(ctx);
  const jumpPtr = readWord(ctx);
  if ((gBattleMons[gBattlerTarget].status2 & STATUS2_CONFUSION)
      && gBattleMons[gBattlerTarget].statStages[stat] === MAX_STAT_STAGE) {
    ctx.scriptPtr = jumpPtr;
  }
  return false;
}

// ─── 0xC9 trymemento ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_trymemento. 5 bytes. */
function Cmd_trymemento(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gBattleMons[gBattlerTarget].statStages[STAT_ATK] === MIN_STAT_STAGE
      && gBattleMons[gBattlerTarget].statStages[STAT_SPATK] === MIN_STAT_STAGE
      && gBattleCommunication[MISS_TYPE] !== B_MSG_PROTECTED) {
    ctx.scriptPtr = failJump;
    return false;
  }
  setActiveBattler(gBattlerAttacker);
  setBattleMoveDamage(gBattleMons[gBattlerAttacker].hp);
  BtlController_EmitHealthBarUpdate(B_COMM_TO_CONTROLLER, INSTANT_HP_BAR_DROP);
  MarkBattlerForControllerExec(gBattlerAttacker);
  return false;
}

// ─── 0xDC trysetgrudge ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_trysetgrudge. 5 bytes. */
function Cmd_trysetgrudge(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (gStatuses3[gBattlerAttacker] & STATUS3_GRUDGE) {
    ctx.scriptPtr = failJump;
    return false;
  }
  gStatuses3[gBattlerAttacker] |= STATUS3_GRUDGE;
  return false;
}

// ─── 0xEE removelightscreenreflect ────────────────────────────────────────

/** 1:1 décomp Cmd_removelightscreenreflect. 1 byte. Brick Break. */
function Cmd_removelightscreenreflect(_ctx: BattleScriptContext): boolean {
  const opposingSide = BATTLE_OPPOSITE(GET_BATTLER_SIDE(gBattlerAttacker));
  if (gSideTimers[opposingSide].reflectTimer || gSideTimers[opposingSide].lightscreenTimer) {
    gSideStatuses[opposingSide] &= ~SIDE_STATUS_REFLECT;
    gSideStatuses[opposingSide] &= ~SIDE_STATUS_LIGHTSCREEN;
    gSideTimers[opposingSide].reflectTimer = 0;
    gSideTimers[opposingSide].lightscreenTimer = 0;
    gBattleScripting.animTurn = 1;
    gBattleScripting.animTargetsHit = 1;
  } else {
    gBattleScripting.animTurn = 0;
    gBattleScripting.animTargetsHit = 0;
  }
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installNiveau17Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x90] = Cmd_tryconversiontypechange;
  commands[0xA5] = Cmd_painsplitdmgcalc;
  commands[0xB0] = Cmd_trysetspikes;
  commands[0xB2] = Cmd_trysetperishsong;
  commands[0xB4] = Cmd_jumpifconfusedandstatmaxed;
  commands[0xC9] = Cmd_trymemento;
  commands[0xDC] = Cmd_trysetgrudge;
  commands[0xEE] = Cmd_removelightscreenreflect;
}
