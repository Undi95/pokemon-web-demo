/**
 * battle/cmd-niveau-2.ts — implémentation 1:1 décomp des opcodes battle script
 * du **Niveau 2 (stat stages + status)**.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c`
 *
 * Opcodes inclus :
 *   0x16 Cmd_seteffectprimary             stub (= SetMoveEffect énorme TODO)
 *   0x17 Cmd_seteffectsecondary           stub
 *   0x18 Cmd_clearstatusfromeffect        full
 *   0x47 Cmd_setgraphicalstatchangevalues full
 *   0x48 Cmd_playstatchangeanimation      stub UI (= consume args, no anim)
 *   0x89 Cmd_statbuffchange               full (= wraps ChangeStatBuffs)
 *   0x8A Cmd_normalisebuffs               full (= Haze, reset all stat stages)
 *   0x98 Cmd_updatestatusicon             stub UI
 */

import {
  gBattleMons,
  gBattlerAttacker,
  gBattlerTarget,
  gBattleScripting,
  gBattleCommunication,
  gBattlersCount,
  setActiveBattler,
} from './state';
import { readByte, readWord } from './script-interpreter';
import type { BattleScriptContext, BattleOpcodeHandler } from './script-interpreter';
import { ChangeStatBuffs } from './stat-stages';
import {
  GET_STAT_BUFF_ID,
  GET_STAT_BUFF_VALUE,
  SET_STAT_BUFF_VALUE,
  STAT_BUFF_NEGATIVE,
  STAT_CHANGE_WORKED,
  STAT_CHANGE_ALLOW_PTR,
  MOVE_EFFECT_BYTE,
  MULTISTRING_CHOOSER,
  NUM_BATTLE_STATS,
  DEFAULT_STAT_STAGE,
  BS_ATTACKER,
  BS_TARGET,
} from './constants';

// Tables d'animation stat change (= 1:1 décomp `include/constants/battle_anim.h`).
// Les vraies valeurs viendraient de B_ANIM_STAT_* enum. Pour MVP : on n'envoie
// pas d'animation, mais on remplit gBattleScripting.animArg1/2 pour le code suivant.
const STAT_ANIM_PLUS1  = 0x0E;   // placeholder ; à raffiner avec battle_anim.h
const STAT_ANIM_PLUS2  = 0x16;
const STAT_ANIM_MINUS1 = 0x1E;
const STAT_ANIM_MINUS2 = 0x26;

// Stat anim flags (= passed in opcode arg).
const STAT_CHANGE_NEGATIVE        = 1 << 0;
const STAT_CHANGE_BY_TWO          = 1 << 1;
const STAT_CHANGE_CANT_PREVENT    = 1 << 2;
const STAT_CHANGE_MULTIPLE_STATS  = 1 << 3;
void STAT_CHANGE_CANT_PREVENT;
void STAT_CHANGE_MULTIPLE_STATS;

// 1:1 décomp `sStatusFlagsForMoveEffects[NUM_MOVE_EFFECTS]` (battle_script_commands.c:608).
// Pour MVP : table partielle (= status flags les plus communs).
// TODO : extraire la full table 0..MOVE_EFFECT_COUNT du décomp.
const _statusFlagsForMoveEffects: Record<number, number> = {
  // MOVE_EFFECT_SLEEP = 1 → STATUS1_SLEEP = 0x7
  1: 0x7,
  // MOVE_EFFECT_POISON = 2 → STATUS1_POISON = 0x8
  2: 0x8,
  // MOVE_EFFECT_BURN = 3 → STATUS1_BURN = 0x10
  3: 0x10,
  // MOVE_EFFECT_FREEZE = 4 → STATUS1_FREEZE = 0x20
  4: 0x20,
  // MOVE_EFFECT_PARALYSIS = 5 → STATUS1_PARALYSIS = 0x40
  5: 0x40,
  // MOVE_EFFECT_TOXIC = 6 → STATUS1_TOXIC_POISON = 0x80
  6: 0x80,
};

// Primary status threshold (1:1 décomp battle_script_commands.h:328).
const PRIMARY_STATUS_MOVE_EFFECT = 7;

/** 1:1 décomp `GetBattlerForBattleScript(u8 arg)` — subset utilisé Niveau 2. */
function getBattlerForBattleScript(arg: number): number {
  switch (arg) {
    case BS_ATTACKER: return gBattlerAttacker;
    case BS_TARGET: return gBattlerTarget;
    default: return gBattlerTarget;  // fallback
  }
}

// ─── Cmd_statbuffchange (0x89) ──────────────────────────────────────────────

/** 1:1 décomp `Cmd_statbuffchange` (battle_script_commands.c:7103-7108).
 *
 *  Args : 1 byte flags + 4 byte jumpPtr. Total 6 bytes (opcode + 5).
 *
 *  Wraps `ChangeStatBuffs(gBattleScripting.statChanger & 0xF0, statId, flags, jumpPtr)`.
 *  Si SUCCESS → advance via consume args. Si FAIL → ChangeStatBuffs déjà advancé
 *  le scriptPtr (= push BS_ptr), donc on n'advance pas via readByte ici.
 *
 *  Notre version : toujours consume args (= pas de push BS_ptr support encore). */
function Cmd_statbuffchange(ctx: BattleScriptContext): boolean {
  const flags = readByte(ctx);
  const jumpPtr = readWord(ctx);

  const result = ChangeStatBuffs(
    gBattleScripting.statChanger & 0xF0,         // statValue (= magnitude + sign bit)
    GET_STAT_BUFF_ID(gBattleScripting.statChanger),  // statId
    flags,
    jumpPtr,
  );

  // Décomp : `if (result == STAT_CHANGE_WORKED) gBattlescriptCurrInstr += 6`.
  // Si DIDNT_WORK avec ALLOW_PTR : BS_ptr a été push (= ctx.scriptPtr changed).
  // Notre version : on a déjà advancé via readByte+readWord, donc 6 bytes consumés.
  // Si on devait jump à BS_ptr, on le ferait ici (= TODO push/pop stack).
  if (result !== STAT_CHANGE_WORKED && (flags & STAT_CHANGE_ALLOW_PTR)) {
    // 1:1 décomp aurait set gBattlescriptCurrInstr = BS_ptr (= jump).
    ctx.scriptPtr = jumpPtr;
  }
  return false;
}

// ─── Cmd_normalisebuffs (0x8A) — Haze ───────────────────────────────────────

/** 1:1 décomp `Cmd_normalisebuffs` (battle_script_commands.c:7111-7122).
 *  Reset all stat stages of all battlers to DEFAULT_STAT_STAGE (= Haze move). */
function Cmd_normalisebuffs(_ctx: BattleScriptContext): boolean {
  for (let i = 0; i < gBattlersCount; i++) {
    for (let j = 0; j < NUM_BATTLE_STATS; j++) {
      gBattleMons[i].statStages[j] = DEFAULT_STAT_STAGE;
    }
  }
  return false;
}

// ─── Cmd_setgraphicalstatchangevalues (0x47) ────────────────────────────────

/** 1:1 décomp `Cmd_setgraphicalstatchangevalues` (battle_script_commands.c:4091-4112).
 *
 *  Set gBattleScripting.animArg1 (= stat anim id) basé sur statChanger value.
 *  animArg2 = 0. */
function Cmd_setgraphicalstatchangevalues(_ctx: BattleScriptContext): boolean {
  let value = 0;
  const statChanger = gBattleScripting.statChanger;
  // GET_STAT_BUFF_VALUE2(n) = n & 0xF0 (= bits 4-7 = magnitude with sign).
  const valueMag = statChanger & 0xF0;

  if (valueMag === SET_STAT_BUFF_VALUE(1)) value = STAT_ANIM_PLUS1 + 1;
  else if (valueMag === SET_STAT_BUFF_VALUE(2)) value = STAT_ANIM_PLUS2 + 1;
  else if (valueMag === (SET_STAT_BUFF_VALUE(1) | STAT_BUFF_NEGATIVE)) value = STAT_ANIM_MINUS1 + 1;
  else if (valueMag === (SET_STAT_BUFF_VALUE(2) | STAT_BUFF_NEGATIVE)) value = STAT_ANIM_MINUS2 + 1;

  gBattleScripting.animArg1 = GET_STAT_BUFF_ID(statChanger) + value - 1;
  gBattleScripting.animArg2 = 0;
  return false;
}

// ─── Cmd_playstatchangeanimation (0x48) ─────────────────────────────────────

/** 1:1 décomp `Cmd_playstatchangeanimation` (battle_script_commands.c:4114-4210).
 *
 *  Args : 1 byte battler ref + 1 byte statsToCheck mask + 1 byte flags. Total 4 bytes.
 *
 *  Pour MVP : skip animation logic (= BtlController_EmitBattleAnimation), just
 *  consume args. La logique compte le nombre de stats changeable + sélectionne
 *  l'anim id, mais sans UI controllers ça ne fait rien visuellement. */
function Cmd_playstatchangeanimation(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const _statsToCheck = readByte(ctx);
  const _flags = readByte(ctx);
  void _statsToCheck; void _flags; void STAT_CHANGE_NEGATIVE; void STAT_CHANGE_BY_TWO;

  setActiveBattler(getBattlerForBattleScript(battlerArg));
  // TODO : iterate statsToCheck bits, compute statAnimId, emit anim.
  return false;
}

// ─── Cmd_seteffectprimary (0x16) + Cmd_seteffectsecondary (0x17) ────────────

/** 1:1 décomp `Cmd_seteffectprimary` (battle_script_commands.c:2941-2944).
 *  Calls `SetMoveEffect(TRUE, 0)` — TODO porter SetMoveEffect (= ~500 lignes).
 *
 *  Args : aucun (= advance 1 byte opcode seulement). */
function Cmd_seteffectprimary(_ctx: BattleScriptContext): boolean {
  // TODO : SetMoveEffect(primary=true, certainArg=0).
  // Effect from gBattleScripting.moveEffect : burn, freeze, sleep, poison,
  // paralysis, flinch, confuse, infatuate, etc.
  return false;
}

/** 1:1 décomp `Cmd_seteffectsecondary` (battle_script_commands.c:2946-2949).
 *  Calls `SetMoveEffect(FALSE, 0)` — TODO. */
function Cmd_seteffectsecondary(_ctx: BattleScriptContext): boolean {
  // TODO : SetMoveEffect(primary=false, certainArg=0).
  // Secondary effect : roll secondaryEffectChance, apply effect.
  return false;
}

// ─── Cmd_clearstatusfromeffect (0x18) ───────────────────────────────────────

/** 1:1 décomp `Cmd_clearstatusfromeffect` (battle_script_commands.c:2951-2963).
 *
 *  Args : 1 byte battler ref. Total 2 bytes.
 *
 *  Clear le status flag correspondant au current move effect (= MOVE_EFFECT_BYTE)
 *  depuis status1 si <= PRIMARY_STATUS_MOVE_EFFECT, sinon status2.
 *  Reset MOVE_EFFECT_BYTE + multihitMoveEffect. */
function Cmd_clearstatusfromeffect(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const activeBattler = getBattlerForBattleScript(battlerArg);
  setActiveBattler(activeBattler);

  const moveEffect = gBattleCommunication[MOVE_EFFECT_BYTE];
  const statusFlag = _statusFlagsForMoveEffects[moveEffect] ?? 0;

  if (moveEffect <= PRIMARY_STATUS_MOVE_EFFECT) {
    gBattleMons[activeBattler].status1 &= ~statusFlag;
  } else {
    gBattleMons[activeBattler].status2 &= ~statusFlag;
  }

  gBattleCommunication[MOVE_EFFECT_BYTE] = 0;
  gBattleScripting.multihitMoveEffect = 0;
  return false;
}

// ─── Cmd_updatestatusicon (0x98) ────────────────────────────────────────────

/** 1:1 décomp `Cmd_updatestatusicon` (battle_script_commands.c:7702-7733).
 *
 *  Args : 1 byte battler ref. Total 2 bytes.
 *  UI sync via BtlController_EmitStatusIconUpdate — TODO. Pour MVP : skip,
 *  juste consume arg. */
function Cmd_updatestatusicon(ctx: BattleScriptContext): boolean {
  const _battlerArg = readByte(ctx);
  void _battlerArg;
  // TODO : real UI status icon update.
  return false;
}

void MULTISTRING_CHOOSER;
void GET_STAT_BUFF_VALUE;

// ─── Install handlers ───────────────────────────────────────────────────────

export function installNiveau2Handlers(commandsTable: BattleOpcodeHandler[]): void {
  commandsTable[0x16] = Cmd_seteffectprimary;
  commandsTable[0x17] = Cmd_seteffectsecondary;
  commandsTable[0x18] = Cmd_clearstatusfromeffect;
  commandsTable[0x47] = Cmd_setgraphicalstatchangevalues;
  commandsTable[0x48] = Cmd_playstatchangeanimation;
  commandsTable[0x89] = Cmd_statbuffchange;
  commandsTable[0x8A] = Cmd_normalisebuffs;
  commandsTable[0x98] = Cmd_updatestatusicon;
  // TODO Niveau 2 restants :
  //   - SetMoveEffect helper (~500 lignes) pour seteffectprimary/secondary devenir réels
  console.log('[battle/cmd-niveau-2] installed 8/8 Niveau 2 handlers (stat stages + status)');
}
