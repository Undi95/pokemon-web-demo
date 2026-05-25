/**
 * battle/cmd-batch-20.ts — Phase 1 Batch 20 (protect/explosion/weather dmg) — 7 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x72 jumpifplayerran          (5 bytes — TryRunFromBattle check)
 *   0x77 setprotectlike           (1 byte  — Protect/Detect/Endure)
 *   0x78 tryexplosion             (1 byte  — Self-destruct + Damp check)
 *   0x96 weatherdamage            (1 byte  — Sandstorm/Hail residual dmg)
 *   0xBD copyfoestats             (5 bytes — Psych Up)
 *   0xD9 scaledamagebyhealthratio (1 byte  — Eruption/Water Spout)
 *   0xEA tryrecycleitem           (5 bytes — Recycle used held item)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/src/battle_script_commands.c:719 sProtectSuccessRates`
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readWord, Random, getBattleScriptOffset } from './script-interpreter';
import {
  gBattleMons, gBattlerAttacker, gBattlerTarget, setBattlerTarget,
  gBattleMoveDamage, setBattleMoveDamage,
  gDynamicBasePower, setDynamicBasePower,
  gMoveResultFlags, setMoveResultFlags,
  gBattleWeather, gStatuses3,
  gCurrentMove, gCurrentTurnActionNumber, gBattlersCount,
  gProtectStructs, gDisableStructs,
  gLastResultingMoves, gLastUsedAbility, setLastUsedAbility,
  gLastUsedItem, setLastUsedItem,
  gBattleCommunication,
  gAbsentBattlerFlags, gBattlerFainted,
  gBattleControllerExecFlags,
  gUsedHeldItems,
  setActiveBattler,
} from './state';
import {
  STATUS3_UNDERGROUND, STATUS3_UNDERWATER,
  TYPE_ROCK, TYPE_STEEL, TYPE_GROUND, TYPE_ICE,
  ABILITY_SAND_VEIL, ABILITY_DAMP,
  B_WEATHER_SANDSTORM, B_WEATHER_HAIL,
  MULTISTRING_CHOOSER,
  MOVE_RESULT_MISSED,
  NUM_BATTLE_STATS,
  MOVE_PROTECT, MOVE_DETECT, MOVE_ENDURE,
  EFFECT_PROTECT, EFFECT_ENDURE,
  B_MSG_PROTECTED_ITSELF, B_MSG_BRACED_ITSELF, B_MSG_PROTECT_FAILED,
  sProtectSuccessRates,
  IS_BATTLER_OF_TYPE,
  INSTANT_HP_BAR_DROP,
  B_COMM_TO_CONTROLLER,
  REQUEST_HELDITEM_BATTLE,
} from './constants';
import {
  BtlController_EmitSetMonData,
  BtlController_EmitHealthBarUpdate,
  MarkBattlerForControllerExec,
  gBitTable,
} from './battle-controllers';
import { getBattleMove } from './data/battle-moves';

// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

// 1:1 décomp `WEATHER_HAS_EFFECT` macro — wired via util.ts.
import { WEATHER_HAS_EFFECT as _weatherHasEffect } from './util';

// 1:1 décomp `TryRunFromBattle(battler)` (battle_util.c:407-485).
import { TryRunFromBattle as _tryRunFromBattleFull } from './try-run-from-battle';
function _tryRunFromBattle(battler: number): boolean {
  return _tryRunFromBattleFull(battler);
}

// 1:1 décomp `RecordAbilityBattle` — wired via util.ts.
import { RecordAbilityBattle as _recordAbilityBattleFullN20 } from './util';
function _recordAbilityBattle(battler: number, ability: number): void {
  _recordAbilityBattleFullN20(battler, ability);
}

// ─── 0x72 jumpifplayerran ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_jumpifplayerran. 5 bytes. */
function Cmd_jumpifplayerran(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  if (_tryRunFromBattle(gBattlerFainted)) {
    ctx.scriptPtr = failJump;
  }
  return false;
}

// ─── 0x77 setprotectlike ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_setprotectlike. 1 byte. */
function Cmd_setprotectlike(_ctx: BattleScriptContext): boolean {
  let notLastTurn = true;
  const lastMove = gLastResultingMoves[gBattlerAttacker];

  if (lastMove !== MOVE_PROTECT && lastMove !== MOVE_DETECT && lastMove !== MOVE_ENDURE) {
    gDisableStructs[gBattlerAttacker].protectUses = 0;
  }
  if (gCurrentTurnActionNumber === gBattlersCount - 1) {
    notLastTurn = false;
  }

  const successRate = sProtectSuccessRates[gDisableStructs[gBattlerAttacker].protectUses] ?? 0;
  if (successRate >= Random() && notLastTurn) {
    const effect = getBattleMove(gCurrentMove).effect;
    if (effect === EFFECT_PROTECT) {
      gProtectStructs[gBattlerAttacker].protected = 1;
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_PROTECTED_ITSELF;
    }
    if (effect === EFFECT_ENDURE) {
      gProtectStructs[gBattlerAttacker].endured = 1;
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_BRACED_ITSELF;
    }
    gDisableStructs[gBattlerAttacker].protectUses++;
  } else {
    gDisableStructs[gBattlerAttacker].protectUses = 0;
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_PROTECT_FAILED;
    setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
  }
  return false;
}

// ─── 0x78 tryexplosion ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_tryexplosion. 1 byte. Self-destruct/Explosion + Damp check. */
function Cmd_tryexplosion(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode(ctx);

  // 1:1 décomp : search field for Damp.
  let dampBattler = 0;
  for (dampBattler = 0; dampBattler < gBattlersCount; dampBattler++) {
    if (gBattleMons[dampBattler].ability === ABILITY_DAMP) break;
  }

  if (dampBattler === gBattlersCount) {
    // Pas de Damp : se faint + pick target.
    setActiveBattler(gBattlerAttacker);
    setBattleMoveDamage(gBattleMons[gBattlerAttacker].hp);
    BtlController_EmitHealthBarUpdate(B_COMM_TO_CONTROLLER, INSTANT_HP_BAR_DROP);
    MarkBattlerForControllerExec(gBattlerAttacker);

    // 1:1 décomp : pick first non-self non-absent battler comme nouveau target.
    let target = 0;
    for (target = 0; target < gBattlersCount; target++) {
      if (target === gBattlerAttacker) continue;
      if (!(gAbsentBattlerFlags & gBitTable[target])) break;
    }
    setBattlerTarget(target);
    return false;
  }

  // Damp présent : explosion bloquée.
  setLastUsedAbility(ABILITY_DAMP);
  _recordAbilityBattle(dampBattler, gBattleMons[dampBattler].ability);
  setBattlerTarget(dampBattler);  // 1:1 décomp : gBattlerTarget est utilisé par le script.
  const off = getBattleScriptOffset('BattleScript_DampStopsExplosion');
  if (off >= 0) ctx.scriptPtr = off;
  return false;
}

// ─── 0x96 weatherdamage ───────────────────────────────────────────────────

/** 1:1 décomp Cmd_weatherdamage. 1 byte. End-of-turn weather damage. */
function Cmd_weatherdamage(_ctx: BattleScriptContext): boolean {
  const atk = gBattleMons[gBattlerAttacker];

  if (_weatherHasEffect()) {
    if (gBattleWeather & B_WEATHER_SANDSTORM) {
      if (atk.type1 !== TYPE_ROCK && atk.type1 !== TYPE_STEEL && atk.type1 !== TYPE_GROUND
          && atk.type2 !== TYPE_ROCK && atk.type2 !== TYPE_STEEL && atk.type2 !== TYPE_GROUND
          && atk.ability !== ABILITY_SAND_VEIL
          && !(gStatuses3[gBattlerAttacker] & STATUS3_UNDERGROUND)
          && !(gStatuses3[gBattlerAttacker] & STATUS3_UNDERWATER)) {
        let dmg = Math.floor(atk.maxHP / 16);
        if (dmg === 0) dmg = 1;
        setBattleMoveDamage(dmg);
      } else {
        setBattleMoveDamage(0);
      }
    }
    if (gBattleWeather & B_WEATHER_HAIL) {
      if (!IS_BATTLER_OF_TYPE(atk.type1, atk.type2, TYPE_ICE)
          && !(gStatuses3[gBattlerAttacker] & STATUS3_UNDERGROUND)
          && !(gStatuses3[gBattlerAttacker] & STATUS3_UNDERWATER)) {
        let dmg = Math.floor(atk.maxHP / 16);
        if (dmg === 0) dmg = 1;
        setBattleMoveDamage(dmg);
      } else {
        setBattleMoveDamage(0);
      }
    }
  } else {
    setBattleMoveDamage(0);
  }
  // 1:1 décomp : safety check si attacker est absent.
  if (gAbsentBattlerFlags & gBitTable[gBattlerAttacker]) {
    setBattleMoveDamage(0);
  }
  return false;
}

// ─── 0xBD copyfoestats ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_copyfoestats. 5 bytes (jump arg pas utilisé). Psych Up. */
function Cmd_copyfoestats(ctx: BattleScriptContext): boolean {
  readWord(ctx);  // 1:1 décomp avance de 5 mais ne jump pas (= jump arg ignoré).
  for (let i = 0; i < NUM_BATTLE_STATS; i++) {
    gBattleMons[gBattlerAttacker].statStages[i] = gBattleMons[gBattlerTarget].statStages[i];
  }
  return false;
}

// ─── 0xD9 scaledamagebyhealthratio ────────────────────────────────────────

/** 1:1 décomp Cmd_scaledamagebyhealthratio. 1 byte. Eruption/Water Spout. */
function Cmd_scaledamagebyhealthratio(_ctx: BattleScriptContext): boolean {
  if (gDynamicBasePower === 0) {
    const power = getBattleMove(gCurrentMove).power;
    let scaled = Math.floor((gBattleMons[gBattlerAttacker].hp * power) / gBattleMons[gBattlerAttacker].maxHP);
    if (scaled === 0) scaled = 1;
    setDynamicBasePower(scaled);
  }
  return false;
}

// ─── 0xEA tryrecycleitem ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_tryrecycleitem. 5 bytes. */
function Cmd_tryrecycleitem(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  setActiveBattler(gBattlerAttacker);
  const used = gUsedHeldItems[gBattlerAttacker];
  if (used !== 0 && gBattleMons[gBattlerAttacker].item === 0) {
    setLastUsedItem(used);
    gUsedHeldItems[gBattlerAttacker] = 0;
    gBattleMons[gBattlerAttacker].item = used;
    BtlController_EmitSetMonData(B_COMM_TO_CONTROLLER, REQUEST_HELDITEM_BATTLE, 0, 2, gBattleMons[gBattlerAttacker].item);
    MarkBattlerForControllerExec(gBattlerAttacker);
    return false;
  }
  ctx.scriptPtr = failJump;
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installBatch20Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x72] = Cmd_jumpifplayerran;
  commands[0x77] = Cmd_setprotectlike;
  commands[0x78] = Cmd_tryexplosion;
  commands[0x96] = Cmd_weatherdamage;
  commands[0xBD] = Cmd_copyfoestats;
  commands[0xD9] = Cmd_scaledamagebyhealthratio;
  commands[0xEA] = Cmd_tryrecycleitem;
}

// Suppress unused warnings.
void gLastUsedItem;
void gLastUsedAbility;
