/**
 * battle/cmd-niveau-24.ts — Phase 1 Niveau 24 (switch UI emit) — 5 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x4C getswitchedmondata    (2 bytes — read incoming mon data via controller)
 *   0x4E switchinanim          (3 bytes — switch-in sprite anim + pokedex flag)
 *   0x53 trainerslidein        (2 bytes — trainer sprite slide-in)
 *   0x58 returntoball          (2 bytes — return mon to ball + fade out)
 *   0x24 checkteamslost        (5 bytes — check win/loss outcome)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readByte, readWord } from './script-interpreter';
import {
  gBattleMons, gBattlersCount,
  setActiveBattler,
  gBattleControllerExecFlags,
  gAbsentBattlerFlags, setAbsentBattlerFlags,
  gBattleOutcome, setBattleOutcome,
} from './state';
import {
  REQUEST_ALL_BATTLE, B_COMM_TO_CONTROLLER,
  B_OUTCOME_WON, B_OUTCOME_LOST,
} from './constants';
import {
  BtlController_EmitTrainerSlide,
  BtlController_EmitReturnMonToBall,
  BtlController_EmitSwitchInAnim,
  BtlController_EmitGetMonData,
  MarkBattlerForControllerExec,
  gBitTable,
} from './battle-controllers';
import { getBattlerForBattleScript, GetBattlerAtPosition } from './util';

// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

// ─── 0x4C getswitchedmondata ──────────────────────────────────────────────

/** 1:1 décomp Cmd_getswitchedmondata. 2 bytes.
 *  Décomp utilise gBattleStruct.monToSwitchIntoId + gBattlerPartyIndexes —
 *  pas portés. Pour MVP : juste emit. */
function Cmd_getswitchedmondata(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode(ctx);
  const arg = readByte(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  // 1:1 décomp : gBattlerPartyIndexes[active] = gBattleStruct.monToSwitchIntoId[active].
  // gBattleStruct.monToSwitchIntoId pas porté → no-op.
  BtlController_EmitGetMonData(B_COMM_TO_CONTROLLER, REQUEST_ALL_BATTLE, gBitTable[active]);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0x4E switchinanim ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_switchinanim. 3 bytes (u8 battler + u8 dontClear). */
function Cmd_switchinanim(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode(ctx);
  const arg = readByte(ctx);
  const dontClear = readByte(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  // 1:1 décomp set Pokedex SEEN flag pour Opponent — non porté.
  setAbsentBattlerFlags(gAbsentBattlerFlags & ~gBitTable[active]);
  // 1:1 décomp passe gBattlerPartyIndexes[active] mais non porté → 0.
  BtlController_EmitSwitchInAnim(B_COMM_TO_CONTROLLER, 0, dontClear);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0x53 trainerslidein ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_trainerslidein. 2 bytes (u8 position). */
function Cmd_trainerslidein(ctx: BattleScriptContext): boolean {
  const position = readByte(ctx);
  const active = GetBattlerAtPosition(position);
  setActiveBattler(active);
  BtlController_EmitTrainerSlide(B_COMM_TO_CONTROLLER);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0x58 returntoball ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_returntoball. 2 bytes (u8 battler). */
function Cmd_returntoball(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  BtlController_EmitReturnMonToBall(B_COMM_TO_CONTROLLER, true);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0x24 checkteamslost ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_checkteamslost (battle_script_commands.c:3537-3618).
 *  5 bytes (u32 jump). Check les parties complètes (gPlayerParty + gEnemyParty)
 *  pour déterminer LOST/WON outcome.
 *
 *  AUDIT BUG FIX (post session 141) : était check actifs only, ce qui causait
 *  LOST mark trop tôt si player active mon KO mais reserves alive. Maintenant
 *  full party iteration 1:1 décomp.
 *
 *  LINK/MULTI branches différés (= jumpPtr non utilisé pour single battle). */
function Cmd_checkteamslost(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode(ctx);
  const _jumpPtr = readWord(ctx); void _jumpPtr;

  // 1:1 décomp 3556-3565 : iterate gPlayerParty for HP_count.
  let playerHpSum = 0;
  for (let i = 0; i < 6 /* PARTY_SIZE */; i++) {
    const species = _GetMonDataCTL(_gPlayerPartyCTL[i], _MON_DATA_SPECIES_CTL) as number;
    const isEgg = _GetMonDataCTL(_gPlayerPartyCTL[i], _MON_DATA_IS_EGG_CTL) as number;
    if (species !== 0 && !isEgg) {
      playerHpSum += _GetMonDataCTL(_gPlayerPartyCTL[i], _MON_DATA_HP_CTL) as number;
    }
  }
  if (playerHpSum === 0) setBattleOutcome(gBattleOutcome | B_OUTCOME_LOST);

  // 1:1 décomp 3571-3580 : iterate gEnemyParty for HP_count.
  let oppHpSum = 0;
  for (let i = 0; i < 6 /* PARTY_SIZE */; i++) {
    const species = _GetMonDataCTL(_gEnemyPartyCTL[i], _MON_DATA_SPECIES_CTL) as number;
    const isEgg = _GetMonDataCTL(_gEnemyPartyCTL[i], _MON_DATA_IS_EGG_CTL) as number;
    if (species !== 0 && !isEgg) {
      oppHpSum += _GetMonDataCTL(_gEnemyPartyCTL[i], _MON_DATA_HP_CTL) as number;
    }
  }
  if (oppHpSum === 0) setBattleOutcome(gBattleOutcome | B_OUTCOME_WON);

  // LINK/MULTI branches (= empty spots check + jump si needed) — différé.
  return false;
}

// Imports locaux Cmd_checkteamslost — éviter dups au top du file.
import {
  gPlayerParty as _gPlayerPartyCTL,
  gEnemyParty as _gEnemyPartyCTL,
  GetMonData as _GetMonDataCTL,
  MON_DATA_SPECIES as _MON_DATA_SPECIES_CTL,
  MON_DATA_HP as _MON_DATA_HP_CTL,
  MON_DATA_IS_EGG as _MON_DATA_IS_EGG_CTL,
} from './party-storage';

// ─── Install handlers ──────────────────────────────────────────────────────

export function installNiveau24Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x24] = Cmd_checkteamslost;
  commands[0x4C] = Cmd_getswitchedmondata;
  commands[0x4E] = Cmd_switchinanim;
  commands[0x53] = Cmd_trainerslidein;
  commands[0x58] = Cmd_returntoball;
}
