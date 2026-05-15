/**
 * battle/cmd-niveau-31.ts — Phase 1 Niveau 31 (seteffectwithchance + catching) — 6 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x15 seteffectwithchance     (1 byte — SetMoveEffect avec %chance)
 *   0x8F forcerandomswitch       (5 bytes — Roar/Whirlwind forced switch)
 *   0xE5 pickup                  (1 byte — Pickup ability post-battle)
 *   0xF0 givecaughtmon           (1 byte — add caught mon to party / PC)
 *   0xF2 displaydexinfo          (1 byte — show Pokedex page state machine)
 *   0xF3 trygivecaughtmonnick    (1 byte — yes/no nickname state machine)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readWord, Random } from './script-interpreter';
import {
  gBattleMons, gBattlerAttacker,
  gBattleScripting, gBattleCommunication,
  gCurrentMove, gMoveResultFlags,
} from './state';
import {
  MOVE_EFFECT_BYTE, MOVE_EFFECT_CERTAIN,
  MOVE_RESULT_NO_EFFECT,
} from './constants';
import { getBattleMove } from './data/battle-moves';

// ─── ABILITY_SERENE_GRACE (abilities.h:31) ─────────────────────────────────
const ABILITY_SERENE_GRACE = 32;

// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

/** 1:1 stub `SetMoveEffect(primary, certain)` (battle_script_commands.c).
 *  ~500 lignes décomp qui applique l'effet status/stat/etc. selon
 *  gBattleCommunication[MOVE_EFFECT_BYTE]. Pour MVP : no-op, mais conserve
 *  la signature 1:1.
 *
 *  TODO porter le full SetMoveEffect quand on a tous les status/stat helpers
 *  câblés (= AbilityBattleEffects, gBattleScripts effects mapping, etc.). */
function _setMoveEffect(_primary: boolean, _certain: number): void {
  // TODO porter battle_script_commands.c:2218..2780 (~500 lignes).
}

// ─── 0x15 seteffectwithchance ─────────────────────────────────────────────

/** 1:1 décomp Cmd_seteffectwithchance. 1 byte. */
function Cmd_seteffectwithchance(_ctx: BattleScriptContext): boolean {
  const secondaryChance = getBattleMove(gCurrentMove).secondaryEffectChance;
  let percentChance: number;
  if (gBattleMons[gBattlerAttacker].ability === ABILITY_SERENE_GRACE) {
    percentChance = secondaryChance * 2;
  } else {
    percentChance = secondaryChance;
  }

  if ((gBattleCommunication[MOVE_EFFECT_BYTE] & MOVE_EFFECT_CERTAIN)
      && !(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)) {
    gBattleCommunication[MOVE_EFFECT_BYTE] &= ~MOVE_EFFECT_CERTAIN;
    _setMoveEffect(false, MOVE_EFFECT_CERTAIN);
  } else if ((Random() % 100) < percentChance
             && gBattleCommunication[MOVE_EFFECT_BYTE]
             && !(gMoveResultFlags & MOVE_RESULT_NO_EFFECT)) {
    if (percentChance >= 100) {
      _setMoveEffect(false, MOVE_EFFECT_CERTAIN);
    } else {
      _setMoveEffect(false, 0);
    }
  }
  // 1:1 décomp : sinon advance via fall-through.

  gBattleCommunication[MOVE_EFFECT_BYTE] = 0;
  gBattleScripting.multihitMoveEffect = 0;
  return false;
}

// ─── 0x8F forcerandomswitch ───────────────────────────────────────────────

/** 1:1 décomp Cmd_forcerandomswitch. 5 bytes (u32 fail jump). Roar/Whirlwind.
 *
 *  Note 1:1 partial : décomp itère party slots pour choisir random alive
 *  non-current mon, puis trigger switch via gBattleStruct.monToSwitchIntoId.
 *  Notre port : skip party iteration (= gPlayerParty/gEnemyParty pas wired).
 *  Pour MVP : fail jump si pas de target valide (= force pas wired). */
function Cmd_forcerandomswitch(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  // TODO porter battle_script_commands.c Cmd_forcerandomswitch full impl
  // quand party storage wired battle-side.
  ctx.scriptPtr = failJump;
  return false;
}

// ─── 0xE5 pickup ──────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_pickup. 1 byte. Post-battle Pickup ability.
 *
 *  Note 1:1 partial : itère gPlayerParty pour les mons avec ABILITY_PICKUP
 *  sans item, roll Random()%10==0, donne un item de sPickupItems.
 *  Notre port : skip (= gPlayerParty pas wired battle-side). */
function Cmd_pickup(_ctx: BattleScriptContext): boolean {
  // TODO porter quand gPlayerParty wired battle-side.
  return false;
}

// ─── 0xF0 givecaughtmon ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_givecaughtmon. 1 byte. Add caught Pokémon to party / PC.
 *
 *  Note 1:1 partial : décomp call GiveMonToPlayer + handle box full + log
 *  caughtMonSpecies/Nick/Ball dans gBattleResults. Notre port : stub no-op
 *  (= party storage pas wired). */
function Cmd_givecaughtmon(_ctx: BattleScriptContext): boolean {
  // TODO porter GiveMonToPlayer + gBattleResults quand wired.
  return false;
}

// ─── 0xF2 displaydexinfo ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_displaydexinfo. 1 byte. State machine via
 *  gBattleCommunication[0] qui fade out, show dex page, fade back in.
 *
 *  Note 1:1 partial : les helpers UI (BeginNormalPaletteFade, DisplayCaughtMonDexPage,
 *  ShowBg, etc.) ne sont pas wired ici. State machine reduce à advance
 *  immédiat (= simulate completed). */
function Cmd_displaydexinfo(ctx: BattleScriptContext): boolean {
  // 1:1 décomp state machine : skip cases 0..4 (= UI rendering), case 5 advance.
  // Pour MVP : advance direct (= simulate machine completion en un opcode tick).
  // TODO porter quand le pipeline rendering est branché au battle UI.
  void ctx;
  gBattleCommunication[0] = 0;  // reset state pour next usage.
  return false;
}

// ─── 0xF3 trygivecaughtmonnick ────────────────────────────────────────────

/** 1:1 décomp Cmd_trygivecaughtmonnick. 1 byte. Yes/No nickname state machine.
 *
 *  Note 1:1 partial : state machine via gBattleCommunication[MULTIUSE_STATE]
 *  qui draw yes/no box, handle DPAD, branche vers naming screen ou skip.
 *  Notre port : MVP advance direct (= simulate "skip nickname"). */
function Cmd_trygivecaughtmonnick(_ctx: BattleScriptContext): boolean {
  // TODO porter yesno state machine + naming screen scene.
  // MULTIUSE_STATE = 7 dans constants — reset.
  gBattleCommunication[7] = 0;
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installNiveau31Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x15] = Cmd_seteffectwithchance;
  commands[0x8F] = Cmd_forcerandomswitch;
  commands[0xE5] = Cmd_pickup;
  commands[0xF0] = Cmd_givecaughtmon;
  commands[0xF2] = Cmd_displaydexinfo;
  commands[0xF3] = Cmd_trygivecaughtmonnick;
}

void _stayOnOpcode;
