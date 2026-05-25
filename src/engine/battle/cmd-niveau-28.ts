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
  setActiveBattler, setBattlerInMenuId,
  gHitMarker, setHitMarker,
  gBattleMoveDamage, setBattleMoveDamage,
  gSideStatuses, gSideTimers, gStatuses3,
  gBattleScripting, gSpecialStatuses,
  gBattleControllerExecFlags, gBattleCommunication,
  gBattleStruct,
  gDisableStructs,
  gBattlersCount, gBattlerByTurnOrder, gActionsByTurnOrder,
  gSentPokesToOpponent, gAbsentBattlerFlags, gBattlerPartyIndexes,
  gLastUsedItem,
} from './state';
import { gEnemyParty } from './party-storage';
import { PokemonUseItemEffects } from '../bag/bag-item-effects';
import type { PokemonInstance } from '../pokemon';
import {
  SIDE_STATUS_SPIKES, SIDE_STATUS_SPIKES_DAMAGED,
  STATUS2_WRAPPED, STATUS2_DESTINY_BOND,
  STATUS3_LEECHSEED, STATUS3_LEECHSEED_BATTLER,
  HITMARKER_FAINTED, HITMARKER_DESTINYBOND,
  ABILITY_LEVITATE, ABILITY_TRUANT, TYPE_FLYING,
  REQUEST_ALL_BATTLE, B_COMM_TO_CONTROLLER,
  IS_BATTLER_OF_TYPE,
  GET_BATTLER_SIDE,
  B_SIDE_OPPONENT,
  BS_TARGET, BS_ATTACKER,
  MAX_MON_MOVES,
  B_ACTION_CANCEL_PARTNER,
} from './constants';
import {
  BtlController_EmitGetMonData,
  MarkBattlerForControllerExec,
  gBitTable,
} from './battle-controllers';
import { getBattlerForBattleScript } from './util';
import { getBattleScriptOffset } from './script-interpreter';
import { gBattleTextBuff1 as _gBattleTextBuff1_N28 } from './text-buffers';
import {
  AbilityBattleEffects, ABILITYEFFECT_ON_SWITCHIN, consumeAbilityWantedScript,
} from './ability-battle-effects';
import {
  ItemBattleEffects, ITEMEFFECT_ON_SWITCH_IN, consumeItemWantedScript,
} from './item-battle-effects';

// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

/** 1:1 décomp `UpdateSentPokesToOpponentValue(battler)` (battle_util.c:934-939).
 *  Si battler est côté opponent, call OpponentSwitchInResetSentPokesToOpponentValue. */
function _updateSentPokesToOpponentValue(battler: number): void {
  if (GET_BATTLER_SIDE(battler) !== B_SIDE_OPPONENT) return;
  // 1:1 décomp battle_util.c:915-932 OpponentSwitchInResetSentPokesToOpponentValue :
  const flank = (battler & 2 /* BIT_FLANK */) >>> 1;
  gSentPokesToOpponent[flank] = 0;
  let bits = 0;
  for (let i = 0; i < gBattlersCount; i += 2) {
    if (!(gAbsentBattlerFlags & gBitTable[i])) {
      bits |= gBitTable[gBattlerPartyIndexes[i]];
    }
  }
  gSentPokesToOpponent[flank] = bits;
}

// PokemonUseItemEffects 1:1 décomp (pokemon.c:4742-5291) maintenant porté dans
// bag-item-effects.ts. Cmd_useitemonopponent appelle directement la fonction.

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
  // 1:1 décomp else-branch (= pas de Spikes damage) : TRUANT init +
  // hpOnSwitchout update + B_ACTION_CANCEL_PARTNER pour actionsByTurnOrder.
  else {
    if (gBattleMons[active].ability === ABILITY_TRUANT
        && !gDisableStructs[active].truantSwitchInHack) {
      gDisableStructs[active].truantCounter = 1;
    }
    gDisableStructs[active].truantSwitchInHack = 0;

    // 1:1 décomp battle_script_commands.c:Cmd_switchineffects :
    //   if (!AbilityBattleEffects(...) && !ItemBattleEffects(...))
    //     do cleanup + advance
    //   else { jump to script set par les helpers }
    const abilityEff = AbilityBattleEffects(ABILITYEFFECT_ON_SWITCHIN, active, 0, 0, 0);
    if (abilityEff !== 0) {
      const label = consumeAbilityWantedScript();
      if (label) {
        const off = getBattleScriptOffset(label);
        if (off >= 0) {
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          ctx.scriptPtr = off;
        }
      }
      return false;
    }
    const itemEff = ItemBattleEffects(ITEMEFFECT_ON_SWITCH_IN, active, false);
    if (itemEff !== 0) {
      const label = consumeItemWantedScript();
      if (label) {
        const off = getBattleScriptOffset(label);
        if (off >= 0) {
          ctx.scriptPtrStack.push(ctx.scriptPtr);
          ctx.scriptPtr = off;
        }
      }
      return false;
    }

    // Neither effect triggered → cleanup state + advance.
    gSideStatuses[side] &= ~SIDE_STATUS_SPIKES_DAMAGED;
    for (let i = 0; i < gBattlersCount; i++) {
      if (gBattlerByTurnOrder[i] === active) {
        gActionsByTurnOrder[i] = B_ACTION_CANCEL_PARTNER;
      }
    }
    // 1:1 décomp : update hpOnSwitchout pour tous les battlers (= 0x74
    // hpthresholds2 le lit ensuite).
    for (let i = 0; i < gBattlersCount; i++) {
      gBattleStruct.hpOnSwitchout[GET_BATTLER_SIDE(i)] = gBattleMons[i].hp;
    }
    // 1:1 décomp : BS_FAINTED_LINK_MULTIPLE_1 increment gBattlerFainted —
    // Link multi battles deferred Phase 1.4+.
  }
  return false;
}

// ─── 0x5E updatebattlermoves ──────────────────────────────────────────────

/** 1:1 décomp Cmd_updatebattlermoves (battle_script_commands.c:5651-5676).
 *  2 bytes. State machine via gBattleCommunication[0] :
 *   - case 0 : EmitGetMonData REQUEST_ALL_BATTLE + Mark + state++.
 *   - case 1 : si controllerExecFlags == 0 → copy moves/pp depuis
 *     gBattleBufferB[active]+4 vers gBattleMons[active] + advance 2.
 *
 *  Notre port : case 0 + case 1 wait-loop fonctionne 1:1 ; le copy from buffer
 *  est no-op car notre flush via batch C bridge garde gBattleMons sync direct. */
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
        // Notre port : gBattleBufferB pas wired (= deferred Phase 1.4 link battles).
        // gBattleMons reste sync via batch C bridge SetMonData direct path.
        void MAX_MON_MOVES;
        return false;
      }
      return _stayOnOpcode(ctx);
    default:
      return false;
  }
}

// ─── 0x75 useitemonopponent ───────────────────────────────────────────────

/** 1:1 décomp Cmd_useitemonopponent (battle_script_commands.c:6314-6319). 1 byte.
 *  Flow décomp :
 *    gBattlerInMenuId = gBattlerAttacker;
 *    PokemonUseItemEffects(&gEnemyParty[gBattlerPartyIndexes[gBattlerAttacker]],
 *                          gLastUsedItem,
 *                          gBattlerPartyIndexes[gBattlerAttacker],
 *                          0,
 *                          TRUE);
 *    gBattlescriptCurrInstr++;  // 1 byte opcode, déjà advance par readByte. */
function Cmd_useitemonopponent(_ctx: BattleScriptContext): boolean {
  setBattlerInMenuId(gBattlerAttacker);
  const partyIdx = gBattlerPartyIndexes[gBattlerAttacker];
  const mon = gEnemyParty[partyIdx] as unknown as PokemonInstance;
  if (mon) {
    PokemonUseItemEffects(mon, gLastUsedItem, partyIdx, 0, true);
  }
  return false;
}

// ─── 0xBE rapidspinfree ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_rapidspinfree. 1 byte. Rapid Spin clear effects. */
function Cmd_rapidspinfree(ctx: BattleScriptContext): boolean {
  if (gBattleMons[gBattlerAttacker].status2 & STATUS2_WRAPPED) {
    gBattleScripting.battler = gBattlerTarget;
    gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_WRAPPED;
    setBattlerTarget(gBattleStruct.wrappedBy[gBattlerAttacker]);
    // 1:1 décomp battle_script_commands.c:8832-8836 : build gBattleTextBuff1
    // = MOVE buffer du wrappedMove (= move qui a causé Wrap/Bind/Fire Spin/etc.).
    // wrappedMove est stocké u8[MAX_BATTLERS_COUNT * 2] = u16 per battler.
    const slot = gBattlerAttacker * 2;
    _gBattleTextBuff1_N28[0] = 0xFD; // B_BUFF_PLACEHOLDER_BEGIN
    _gBattleTextBuff1_N28[1] = 2;    // B_BUFF_MOVE
    _gBattleTextBuff1_N28[2] = gBattleStruct.wrappedMove[slot] ?? 0;
    _gBattleTextBuff1_N28[3] = gBattleStruct.wrappedMove[slot + 1] ?? 0;
    _gBattleTextBuff1_N28[4] = 0xFF; // B_BUFF_EOS
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
