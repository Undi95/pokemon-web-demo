/**
 * battle/cmd-niveau-19.ts — Phase 1 Niveau 19 (rest/bide/camouflage/party UI) — 8 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x43 jumpifabilitypresent     (6 bytes — AbilityBattleEffects(CHECK_ON_FIELD))
 *   0x61 drawpartystatussummary   (2 bytes — party HP/status row UI)
 *   0x62 hidepartystatussummary   (2 bytes — hide row)
 *   0x81 trysetrest               (5 bytes — Rest 3-turn sleep + max HP heal)
 *   0x8B setbide                  (1 byte  — Bide 2-turn lock + dmg accumulate)
 *   0x8C confuseifrepeatingattackends (1 byte — Thrash/Petal Dance end → confusion)
 *   0xE2 switchoutabilities       (2 bytes — Natural Cure on switch out)
 *   0xEB settypetoenvironment     (5 bytes — Camouflage type swap)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/src/battle_script_commands.c:826 sEnvironmentToType`
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readByte, readWord } from './script-interpreter';
import {
  gBattleMons, gBattlerAttacker, gBattlerTarget,
  setBattlerTarget, setActiveBattler,
  gBattleMoveDamage, setBattleMoveDamage,
  gBattleCommunication, gHitMarker,
  gBideDmg, gLockedMoves,
  gCurrentMove,
  gBattleControllerExecFlags,
  gBattleEnvironment,
} from './state';
import {
  STATUS1_SLEEP, STATUS2_MULTIPLETURNS, STATUS2_LOCK_CONFUSE,
  STATUS2_BIDE_TURN, STATUS1_SLEEP_TURN,
  MULTISTRING_CHOOSER, MOVE_EFFECT_BYTE,
  MOVE_EFFECT_THRASH, MOVE_EFFECT_AFFECTS_USER,
  REQUEST_STATUS_BATTLE, B_COMM_TO_CONTROLLER,
  ABILITY_NATURAL_CURE,
  sEnvironmentToType,
  IS_BATTLER_OF_TYPE,
} from './constants';
import {
  BtlController_EmitSetMonData,
  BtlController_EmitDrawPartyStatusSummary,
  BtlController_EmitHidePartyStatusSummary,
  MarkBattlerForControllerExec,
} from './battle-controllers';
import { getBattlerForBattleScript, GetBattlerAtPosition, B_POSITION_PLAYER_LEFT } from './util';
import {
  AbilityBattleEffects, ABILITYEFFECT_CHECK_ON_FIELD,
} from './ability-battle-effects';

// ─── B_MSG_* rest (battle_string_ids.h:476-477) — 1:1 décomp ───────────────
const B_MSG_REST          = 0;
const B_MSG_REST_STATUSED = 1;

// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

/** 1:1 décomp `AbilityBattleEffects(ABILITYEFFECT_CHECK_ON_FIELD, ...)`.
 *  Cherche si une ability donnée est présente sur le field (hp != 0).
 *  Wire via AbilityBattleEffects qui implémente la logique 1:1. */
function _abilityCheckOnField(abilityId: number): boolean {
  return AbilityBattleEffects(ABILITYEFFECT_CHECK_ON_FIELD, 0, abilityId, 0, 0) !== 0;
}

// ─── 0x43 jumpifabilitypresent ────────────────────────────────────────────

/** 1:1 décomp Cmd_jumpifabilitypresent. 6 bytes (u8 ability + u32 jump). */
function Cmd_jumpifabilitypresent(ctx: BattleScriptContext): boolean {
  const ability = readByte(ctx);
  const jumpPtr = readWord(ctx);
  if (_abilityCheckOnField(ability)) {
    ctx.scriptPtr = jumpPtr;
  }
  return false;
}

// ─── 0x61 drawpartystatussummary ──────────────────────────────────────────

/** 1:1 décomp Cmd_drawpartystatussummary. 2 bytes. MVP : stub UI call.
 *  Le décomp construit hpStatuses[PARTY_SIZE] from gPlayerParty/gEnemyParty.
 *  Notre port émet juste avec un placeholder (= aucun party donnée n'est
 *  lue/écrite ici sans gPlayerParty wired). */
function Cmd_drawpartystatussummary(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode(ctx);
  const arg = readByte(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  // TODO : build hpStatuses[6] from gPlayerParty / gEnemyParty.
  BtlController_EmitDrawPartyStatusSummary(B_COMM_TO_CONTROLLER, null, 1);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0x62 hidepartystatussummary ──────────────────────────────────────────

/** 1:1 décomp Cmd_hidepartystatussummary. 2 bytes. */
function Cmd_hidepartystatussummary(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  BtlController_EmitHidePartyStatusSummary(B_COMM_TO_CONTROLLER);
  MarkBattlerForControllerExec(active);
  return false;
}

// ─── 0x81 trysetrest ──────────────────────────────────────────────────────

/** 1:1 décomp Cmd_trysetrest. 5 bytes. */
function Cmd_trysetrest(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  // 1:1 décomp : gActiveBattler = gBattlerTarget = gBattlerAttacker
  setActiveBattler(gBattlerAttacker);
  setBattlerTarget(gBattlerAttacker);
  setBattleMoveDamage(gBattleMons[gBattlerAttacker].maxHP * -1);
  if (gBattleMons[gBattlerAttacker].hp === gBattleMons[gBattlerAttacker].maxHP) {
    ctx.scriptPtr = failJump;
    return false;
  }
  if (gBattleMons[gBattlerAttacker].status1 & (~STATUS1_SLEEP & 0xFF)) {
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_REST_STATUSED;
  } else {
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_REST;
  }
  gBattleMons[gBattlerAttacker].status1 = STATUS1_SLEEP_TURN(3);
  BtlController_EmitSetMonData(B_COMM_TO_CONTROLLER, REQUEST_STATUS_BATTLE, 0, 4, gBattleMons[gBattlerAttacker].status1);
  MarkBattlerForControllerExec(gBattlerAttacker);
  return false;
}

// ─── 0x8B setbide ─────────────────────────────────────────────────────────

/** 1:1 décomp Cmd_setbide. 1 byte. */
function Cmd_setbide(_ctx: BattleScriptContext): boolean {
  gBattleMons[gBattlerAttacker].status2 |= STATUS2_MULTIPLETURNS;
  gLockedMoves[gBattlerAttacker] = gCurrentMove;
  gBideDmg[gBattlerAttacker] = 0;
  gBattleMons[gBattlerAttacker].status2 |= STATUS2_BIDE_TURN(2);
  return false;
}

// ─── 0x8C confuseifrepeatingattackends ────────────────────────────────────

/** 1:1 décomp Cmd_confuseifrepeatingattackends. 1 byte.
 *  Si pas déjà LOCK_CONFUSE : queue MOVE_EFFECT_THRASH | AFFECTS_USER. */
function Cmd_confuseifrepeatingattackends(_ctx: BattleScriptContext): boolean {
  if (!(gBattleMons[gBattlerAttacker].status2 & STATUS2_LOCK_CONFUSE)) {
    gBattleCommunication[MOVE_EFFECT_BYTE] = MOVE_EFFECT_THRASH | MOVE_EFFECT_AFFECTS_USER;
  }
  return false;
}

// ─── 0xE2 switchoutabilities ──────────────────────────────────────────────

/** 1:1 décomp Cmd_switchoutabilities. 2 bytes. Natural Cure on switch. */
function Cmd_switchoutabilities(ctx: BattleScriptContext): boolean {
  const arg = readByte(ctx);
  const active = getBattlerForBattleScript(arg);
  setActiveBattler(active);
  switch (gBattleMons[active].ability) {
    case ABILITY_NATURAL_CURE: {
      gBattleMons[active].status1 = 0;
      // 1:1 décomp passe partyBitmask en monToCheck (= gBitTable[partyIdx]).
      // Pour MVP, on passe 0 (= unused dans notre stub).
      BtlController_EmitSetMonData(B_COMM_TO_CONTROLLER, REQUEST_STATUS_BATTLE, 0, 4, gBattleMons[active].status1);
      MarkBattlerForControllerExec(active);
      break;
    }
    default: break;
  }
  return false;
}

// ─── 0xEB settypetoenvironment ────────────────────────────────────────────

/** 1:1 décomp Cmd_settypetoenvironment. 5 bytes. Camouflage. */
function Cmd_settypetoenvironment(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const atk = gBattleMons[gBattlerAttacker];
  const targetType = sEnvironmentToType[gBattleEnvironment] ?? 0;
  if (!IS_BATTLER_OF_TYPE(atk.type1, atk.type2, targetType)) {
    // SET_BATTLER_TYPE = type1 = type2 = newType.
    atk.type1 = targetType;
    atk.type2 = targetType;
    // PREPARE_TYPE_BUFFER : TODO porter.
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installNiveau19Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x43] = Cmd_jumpifabilitypresent;
  commands[0x61] = Cmd_drawpartystatussummary;
  commands[0x62] = Cmd_hidepartystatussummary;
  commands[0x81] = Cmd_trysetrest;
  commands[0x8B] = Cmd_setbide;
  commands[0x8C] = Cmd_confuseifrepeatingattackends;
  commands[0xE2] = Cmd_switchoutabilities;
  commands[0xEB] = Cmd_settypetoenvironment;
}

// Suppress unused warnings (kept for reference / future use).
void GetBattlerAtPosition;
void B_POSITION_PLAYER_LEFT;
