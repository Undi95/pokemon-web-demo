/**
 * battle/cmd-niveau-28.ts — Phase 1 Niveau 28 (switchineffects + rapidspin + item) — 4 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x52 switchineffects        (2 bytes — Spikes damage on switch-in)
 *   0x5E updatebattlermoves     (2 bytes — emit GetMonData + copy moves/pp)
 *   0x75 useitemonopponent      (1 byte  — PokemonUseItemEffects)
 *   0xBE rapidspinfree          (1 byte  — clear wrap/leech/spikes)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readByte } from './script-interpreter';
import {
  gBattleMons, gBattlerAttacker, gBattlerTarget, setBattlerTarget,
  setActiveBattler,
  gHitMarker, setHitMarker,
  gBattleMoveDamage, setBattleMoveDamage,
  gSideStatuses, gSideTimers, gStatuses3,
  gBattleScripting, gSpecialStatuses,
  gBattleControllerExecFlags, gBattleCommunication,
  gWrappedBy, gWrappedMove,
} from './state';
import {
  SIDE_STATUS_SPIKES, SIDE_STATUS_SPIKES_DAMAGED,
  STATUS2_WRAPPED, STATUS2_DESTINY_BOND,
  STATUS3_LEECHSEED, STATUS3_LEECHSEED_BATTLER,
  HITMARKER_FAINTED, HITMARKER_DESTINYBOND,
  ABILITY_LEVITATE, TYPE_FLYING,
  REQUEST_ALL_BATTLE, B_COMM_TO_CONTROLLER,
  IS_BATTLER_OF_TYPE,
  GET_BATTLER_SIDE,
  BS_TARGET, BS_ATTACKER,
  MAX_MON_MOVES,
} from './constants';
import {
  BtlController_EmitGetMonData,
  MarkBattlerForControllerExec,
} from './battle-controllers';
import { getBattlerForBattleScript } from './util';
import { getBattleScriptOffset } from './script-interpreter';

// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

/** 1:1 stub `UpdateSentPokesToOpponentValue(battler)` (battle_main.c).
 *  Tracking pour exp share — no-op MVP. */
function _updateSentPokesToOpponentValue(_battler: number): void {}

/** 1:1 stub `PokemonUseItemEffects(mon, item, partyIdx, ?, isInBattle)`
 *  (item.c) — applique l'effet d'un item (= Potion, etc.) sur un mon.
 *  Notre stub : no-op. */
function _pokemonUseItemEffects(_battlerIdx: number, _item: number): void {
  // TODO porter item_use.c logic.
}

// ─── 0x52 switchineffects ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_switchineffects. 2 bytes (u8 battler arg).
 *  Décomp gère aussi : ability switch-in triggers, weather messages,
 *  status1 sleep/poison ticks — partial port ici (Spikes seulement). */
function Cmd_switchineffects(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  _updateSentPokesToOpponentValue(active);

  setHitMarker(gHitMarker & ~HITMARKER_FAINTED(active));
  gSpecialStatuses[active].faintedHasReplacement = 0;

  const side = GET_BATTLER_SIDE(active);
  if (!(gSideStatuses[side] & SIDE_STATUS_SPIKES_DAMAGED)
      && (gSideStatuses[side] & SIDE_STATUS_SPIKES)
      && !IS_BATTLER_OF_TYPE(gBattleMons[active].type1, gBattleMons[active].type2, TYPE_FLYING)
      && gBattleMons[active].ability !== ABILITY_LEVITATE) {
    gSideStatuses[side] |= SIDE_STATUS_SPIKES_DAMAGED;
    gBattleMons[active].status2 &= ~STATUS2_DESTINY_BOND;
    setHitMarker(gHitMarker & ~HITMARKER_DESTINYBOND);
    const spikesDmg = (5 - gSideTimers[side].spikesAmount) * 2;
    let dmg = Math.floor(gBattleMons[active].maxHP / spikesDmg);
    if (dmg === 0) dmg = 1;
    setBattleMoveDamage(dmg);
    gBattleScripting.battler = active;
    // 1:1 décomp : BattleScriptPushCursor + jump à BattleScript_SpikesOnTarget/Attacker.
    ctx.scriptPtrStack.push(ctx.scriptPtr);
    const labelName = arg === BS_TARGET ? 'BattleScript_SpikesOnTarget'
      : arg === BS_ATTACKER ? 'BattleScript_SpikesOnAttacker'
      : 'BattleScript_SpikesOnFaintedBattler';
    const off = getBattleScriptOffset(labelName);
    if (off >= 0) ctx.scriptPtr = off;
  }
  // 1:1 décomp partial : ability switch-in (Intimidate, Drought, Drizzle, etc.)
  // pas porté ici (= AbilityBattleEffects pas wired).
  // TODO porter le reste de switchineffects (cf. battle_script_commands.c).
  return false;
}

// ─── 0x5E updatebattlermoves ──────────────────────────────────────────────

/** 1:1 décomp Cmd_updatebattlermoves. 2 bytes. State machine via
 *  gBattleCommunication[0] : case 0 emit GetMonData, case 1 copy from buffer.
 *  Notre port : MVP juste skip à case 1 directly (= utilise gBattleMons
 *  state, pas le buffer décomp). */
function Cmd_updatebattlermoves(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  switch (gBattleCommunication[0]) {
    case 0:
      BtlController_EmitGetMonData(B_COMM_TO_CONTROLLER, REQUEST_ALL_BATTLE, 0);
      MarkBattlerForControllerExec(active);
      gBattleCommunication[0]++;
      // 1:1 décomp : ne pas advance — re-enter case 1 next frame.
      ctx.scriptPtr -= 2;  // back to opcode + arg
      return true;  // pause
    case 1:
      if (gBattleControllerExecFlags === 0) {
        // 1:1 décomp : copy moves/pp depuis gBattleBufferB[active]+4.
        // Notre port : gBattleBufferB pas wired. On considère que gBattleMons
        // est déjà sync (= our SetMonData direct path). No-op.
        // TODO : si on porte gBattleBufferB un jour, copier ici.
        void MAX_MON_MOVES;
        return false;
      }
      return _stayOnOpcode(ctx);
    default:
      return false;
  }
}

// ─── 0x75 useitemonopponent ───────────────────────────────────────────────

/** 1:1 décomp Cmd_useitemonopponent. 1 byte. */
function Cmd_useitemonopponent(_ctx: BattleScriptContext): boolean {
  // 1:1 décomp : PokemonUseItemEffects(gEnemyParty[partyIdx], gLastUsedItem,
  //   partyIdx, 0, TRUE). Notre stub : no-op.
  _pokemonUseItemEffects(gBattlerAttacker, 0);
  return false;
}

// ─── 0xBE rapidspinfree ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_rapidspinfree. 1 byte. Rapid Spin clear effects. */
function Cmd_rapidspinfree(ctx: BattleScriptContext): boolean {
  if (gBattleMons[gBattlerAttacker].status2 & STATUS2_WRAPPED) {
    gBattleScripting.battler = gBattlerTarget;
    gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_WRAPPED;
    setBattlerTarget(gWrappedBy[gBattlerAttacker]);
    // PREPARE_BUFF text placeholder : TODO porter.
    // 1:1 décomp : BattleScriptPushCursor + jump BattleScript_WrapFree.
    ctx.scriptPtrStack.push(ctx.scriptPtr);
    const off = getBattleScriptOffset('BattleScript_WrapFree');
    if (off >= 0) ctx.scriptPtr = off;
    return false;
  }
  if (gStatuses3[gBattlerAttacker] & STATUS3_LEECHSEED) {
    gStatuses3[gBattlerAttacker] &= ~STATUS3_LEECHSEED;
    gStatuses3[gBattlerAttacker] &= ~STATUS3_LEECHSEED_BATTLER;
    ctx.scriptPtrStack.push(ctx.scriptPtr);
    const off = getBattleScriptOffset('BattleScript_LeechSeedFree');
    if (off >= 0) ctx.scriptPtr = off;
    return false;
  }
  const side = GET_BATTLER_SIDE(gBattlerAttacker);
  if (gSideStatuses[side] & SIDE_STATUS_SPIKES) {
    gSideStatuses[side] &= ~SIDE_STATUS_SPIKES;
    gSideTimers[side].spikesAmount = 0;
    ctx.scriptPtrStack.push(ctx.scriptPtr);
    const off = getBattleScriptOffset('BattleScript_SpikesFree');
    if (off >= 0) ctx.scriptPtr = off;
    return false;
  }
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installNiveau28Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x52] = Cmd_switchineffects;
  commands[0x5E] = Cmd_updatebattlermoves;
  commands[0x75] = Cmd_useitemonopponent;
  commands[0xBE] = Cmd_rapidspinfree;
}

// Suppress unused warnings (kept for future port).
void gBattleMoveDamage;
