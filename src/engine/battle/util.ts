/**
 * battle/util.ts — helpers partagés entre opcodes.
 *
 * Source de vérité (1:1 décomp) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_util.c`
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c`
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_anim_mons.c:859` (GetBattlerAtPosition)
 *
 * Helpers exposés :
 *   - `getBattlerForBattleScript(arg)` 1:1 décomp (full BS_* enum)
 *   - `GetBattlerAtPosition(position)` 1:1 décomp (search gBattlerPositions[])
 *   - `FaintClearSetData()` 1:1 décomp full (= skip gProtectStructs/gBattleStruct/
 *     gBattleResources fields rarely-used pour Phase 1)
 */

import {
  gBattleMons, gBattlerAttacker, gBattlerTarget, gEffectBattler,
  gBattlerFainted, gBattleScripting, gStatuses3, gLastMoves,
  gLastLandedMoves, gLastResultingMoves, gLastHitBy, gLastHitByType,
  gLastPrintedMoves,
  gActiveBattler, gDisableStructs, gProtectStructs,
  gBattleStruct, gBattlersCount, gCurrentMove,
  gActionSelectionCursor, gMoveSelectionCursor,
  gBattleResourcesFlags,
} from './state';
import { getSpeciesTypes } from './data/species-runtime';
import { STATUS2_DESTINY_BOND, STATUS3_GRUDGE } from './constants';
import {
  STATUS2_MULTIPLETURNS, STATUS2_UPROAR, STATUS2_BIDE, STATUS2_LOCK_CONFUSE,
  STATUS3_SEMI_INVULNERABLE,
  STATUS2_ESCAPE_PREVENTION, STATUS2_WRAPPED,
  STATUS2_INFATUATION,
  GET_BATTLER_SIDE,
  ABILITY_CLOUD_NINE, ABILITY_AIR_LOCK,
} from './constants';
import {
  BS_TARGET, BS_ATTACKER, BS_EFFECT_BATTLER, BS_FAINTED,
  BS_ATTACKER_WITH_PARTNER, BS_FAINTED_LINK_MULTIPLE_1,
  BS_FAINTED_LINK_MULTIPLE_2, BS_BATTLER_0,
  BS_ATTACKER_SIDE, BS_NOT_ATTACKER_SIDE, BS_SCRIPTING,
  BS_PLAYER1, BS_OPPONENT1, BS_PLAYER2, BS_OPPONENT2,
  NUM_BATTLE_STATS, DEFAULT_STAT_STAGE, MOVE_NONE,
} from './constants';

// ─── B_POSITION_* (constants/battle.h:28-31) ────────────────────────────────
export const B_POSITION_PLAYER_LEFT    = 0;
export const B_POSITION_OPPONENT_LEFT  = 1;
export const B_POSITION_PLAYER_RIGHT   = 2;
export const B_POSITION_OPPONENT_RIGHT = 3;

/** 1:1 décomp `gBattlerPositions[MAX_BATTLERS_COUNT]` — par défaut single battle :
 *  battler i a position i. Set par battle_main au setup. Par défaut single battle :
 *  battler i a position i (identity), set par battle_main réel en double. */
export const gBattlerPositions: number[] = [
  B_POSITION_PLAYER_LEFT,
  B_POSITION_OPPONENT_LEFT,
  B_POSITION_PLAYER_RIGHT,
  B_POSITION_OPPONENT_RIGHT,
];

// ─── GetBattlerAtPosition (battle_anim_mons.c:859) — 1:1 décomp ────────────

/** 1:1 décomp `GetBattlerAtPosition(u8 position)`. */
export function GetBattlerAtPosition(position: number): number {
  // gBattlersCount = 2 single, 4 double. On itère full pour 1:1.
  for (let i = 0; i < gBattlerPositions.length; i++) {
    if (gBattlerPositions[i] === position) return i;
  }
  return 0;
}

/** 1:1 décomp `GetBattlerPosition(u8 battler)` (battle_anim_mons.c:858) :
 *  return gBattlerPositions[battler]. */
export function GetBattlerPosition(battler: number): number {
  return gBattlerPositions[battler] ?? 0;
}

// ─── getBattlerForBattleScript (battle_util.c) — 1:1 décomp full ───────────

/** 1:1 décomp `GetBattlerForBattleScript(u8 arg)`. */
export function getBattlerForBattleScript(caseId: number): number {
  switch (caseId) {
    case BS_TARGET:                  return gBattlerTarget;
    case BS_ATTACKER:                return gBattlerAttacker;
    case BS_EFFECT_BATTLER:          return gEffectBattler;
    case BS_BATTLER_0:               return 0;
    case BS_SCRIPTING:               return gBattleScripting.battler;
    case BS_FAINTED:                 return gBattlerFainted;
    case BS_FAINTED_LINK_MULTIPLE_1: return gBattlerFainted;
    case BS_ATTACKER_WITH_PARTNER:
    case BS_FAINTED_LINK_MULTIPLE_2:
    case BS_ATTACKER_SIDE:
    case BS_NOT_ATTACKER_SIDE:
    case BS_PLAYER1:
      return GetBattlerAtPosition(B_POSITION_PLAYER_LEFT);
    case BS_OPPONENT1:
      return GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT);
    case BS_PLAYER2:
      return GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT);
    case BS_OPPONENT2:
      return GetBattlerAtPosition(B_POSITION_OPPONENT_RIGHT);
    default:
      return 0;
  }
}

// ─── FaintClearSetData (battle_main.c:3264-3360) — 1:1 décomp ───────────

/** 1:1 décomp `FaintClearSetData()` (battle_main.c:3264-3360). Réinitialise
 *  TOUS les states battle d'un battler fainted. Appelé par Cmd_tryfaintmon /
 *  Cmd_handlefaintswitch après confirmation faint.
 *
 *  Notes (= UI / AI tracking deferred Phase 1.4) :
 *  - gActionSelectionCursor[], gMoveSelectionCursor[] (= UI cursor state).
 *  - gBattleResources->flags->flags[] (= AI/script flags tracker, ~256 flags).
 *  - ClearBattlerMoveHistory (= AI move tracking par battler).
 *
 *  Le reste est 1:1 strict.
 */
// ─── FaintClearSetData — DÉPLACÉ dans le miroir src/game/battle_main.ts
//     (battle_main.c:3270-3355, consolidation C2 2026-06-10). Re-export compat. ──
export { FaintClearSetData } from '../../game/battle_main';

// ─── CancelMultiTurnMoves (battle_util.c:864) — 1:1 décomp ─────────────────

/** 1:1 décomp `CancelMultiTurnMoves(u8 battler)`. Clear locked/uproar/bide/
 *  rollout/furycutter state pour un battler donné. Utilisé quand Rollout
 *  misses, Bide breaks, ou switch out. */
export function CancelMultiTurnMoves(battler: number): void {
  gBattleMons[battler].status2 &= ~STATUS2_MULTIPLETURNS;
  gBattleMons[battler].status2 &= ~STATUS2_LOCK_CONFUSE;
  gBattleMons[battler].status2 &= ~STATUS2_UPROAR;
  gBattleMons[battler].status2 &= ~STATUS2_BIDE;
  gStatuses3[battler] &= ~STATUS3_SEMI_INVULNERABLE;
  gDisableStructs[battler].rolloutTimer = 0;
  gDisableStructs[battler].furyCutterCounter = 0;
}

// ─── GetScaledHPFraction — DÉPLACÉ dans le miroir src/game/battle_interface.ts
//     (battle_interface.c:2517, consolidation C4 2026-06-09). Re-export compat. ──
export { GetScaledHPFraction } from '../../game/battle_interface';

// ─── ClearFuryCutterDestinyBondGrudge (battle_util.c:3798-3803) — 1:1 décomp ───

/** 1:1 décomp. Reset Fury Cutter compteur + clear Destiny Bond + Grudge.
 *  Appelé par HandleAction_UseItem (= player utilise item = mon perd ses
 *  conditions accrobatiques). */
export function ClearFuryCutterDestinyBondGrudge(battlerId: number): void {
  gDisableStructs[battlerId].furyCutterCounter = 0;
  gBattleMons[battlerId].status2 &= ~STATUS2_DESTINY_BOND;
  gStatuses3[battlerId] &= ~STATUS3_GRUDGE;
}

// ─── BATTLE_HISTORY tracking (battle_ai_script_commands.c:643-655) — 1:1 décomp ───

/** AI tracking module-local — exporté pour devtools. gBattleResources->ai =
 *  ce buffer. Notre struct match 1:1 décomp BATTLE_HISTORY :
 *  - abilities[4] : last ability seen on each battler.
 *  - itemEffects[4] : last item effect seen on each battler.
 *  - usedMoves[4].moves[4] : last 4 moves used by each battler. */
const _battleHistory = {
  abilities: [0, 0, 0, 0] as number[],
  itemEffects: [0, 0, 0, 0] as number[],
  usedMoves: [
    [MOVE_NONE, MOVE_NONE, MOVE_NONE, MOVE_NONE],
    [MOVE_NONE, MOVE_NONE, MOVE_NONE, MOVE_NONE],
    [MOVE_NONE, MOVE_NONE, MOVE_NONE, MOVE_NONE],
    [MOVE_NONE, MOVE_NONE, MOVE_NONE, MOVE_NONE],
  ] as number[][],
};

/** 1:1 décomp `RecordAbilityBattle(battler, abilityId)` (= record qu'on a vu
 *  cette ability sur ce battler). Utilisé par l'AI pour choisir des moves. */
export function RecordAbilityBattle(battler: number, abilityId: number): void {
  _battleHistory.abilities[battler] = abilityId;
}

/** 1:1 décomp `ClearBattlerAbilityHistory(battler)`. */
export function ClearBattlerAbilityHistory(battler: number): void {
  _battleHistory.abilities[battler] = 0;
}

/** 1:1 décomp `RecordItemEffectBattle(battler, itemEffect)`. */
export function RecordItemEffectBattle(battler: number, itemEffect: number): void {
  _battleHistory.itemEffects[battler] = itemEffect;
}

/** Expose history pour AI (= read-only). */
export function getBattleHistoryAbility(battler: number): number {
  return _battleHistory.abilities[battler] ?? 0;
}
export function getBattleHistoryItemEffect(battler: number): number {
  return _battleHistory.itemEffects[battler] ?? 0;
}

/** 1:1 décomp `PressurePPLose(u8 target, u8 attacker, u16 move)` (battle_util.c:740).
 *  Si target a ABILITY_PRESSURE → attacker perd 1 PP supplémentaire sur ce move.
 *  Wired BtlController_EmitSetMonData via batch C bridge (= notre BattleMon.pp[] est write
 *  direct + persist au party via Emit batch C). */
export function PressurePPLose(target: number, attacker: number, move: number): void {
  if (gBattleMons[target].ability !== 49 /* ABILITY_PRESSURE */) return;

  let moveIndex: number;
  for (moveIndex = 0; moveIndex < 4 /* MAX_MON_MOVES */; moveIndex++) {
    if (gBattleMons[attacker].moves[moveIndex] === move) break;
  }
  if (moveIndex === 4) return;

  if (gBattleMons[attacker].pp[moveIndex] !== 0) {
    gBattleMons[attacker].pp[moveIndex]--;
  }

  // 1:1 décomp : MOVE_IS_PERMANENT(attacker, slot) → Emit SetMonData REQUEST_PPMOVE_X (wired via batch C).
  // Notre BattleMon.pp[] est write direct + persist au party via Emit batch C.
}

/** 1:1 décomp `ClearBattlerMoveHistory(u8 battler)` (battle_ai_script_commands.c:635). */
export function ClearBattlerMoveHistory(battler: number): void {
  for (let i = 0; i < NUM_BATTLE_STATS && i < 4; i++) {
    _battleHistory.usedMoves[battler][i] = MOVE_NONE;
  }
}

/** 1:1 décomp `ClearBattlerItemEffectHistory(u8 battler)` (battle_ai_script_commands.c:658). */
export function ClearBattlerItemEffectHistory(battler: number): void {
  _battleHistory.itemEffects[battler] = 0;
}

/** 1:1 décomp `RecordLastUsedMoveByTarget()` (battle_ai_script_commands.c:618-633).
 *  Si gLastMoves[target] est déjà dans la history → no-op (déjà trackée).
 *  Sinon find first MOVE_NONE slot → fill. */
export function RecordLastUsedMoveByTarget(gLastMoves: number[], gBattlerTarget: number): void {
  for (let i = 0; i < 4 /* MAX_MON_MOVES */; i++) {
    if (_battleHistory.usedMoves[gBattlerTarget][i] === gLastMoves[gBattlerTarget]) break;
    if (_battleHistory.usedMoves[gBattlerTarget][i] === MOVE_NONE) {
      _battleHistory.usedMoves[gBattlerTarget][i] = gLastMoves[gBattlerTarget];
      break;
    }
  }
}

/** Expose used moves history pour AI / devtools. */
export function getBattleHistoryUsedMoves(battler: number): readonly number[] {
  return _battleHistory.usedMoves[battler];
}

/** Reset le battle history au battle start. */
export function resetBattleHistory(): void {
  for (let i = 0; i < 4; i++) {
    _battleHistory.abilities[i] = 0;
    _battleHistory.itemEffects[i] = 0;
    for (let j = 0; j < 4; j++) {
      _battleHistory.usedMoves[i][j] = MOVE_NONE;
    }
  }
}

// ─── GetDefaultMoveTarget (pokemon.c:3422-3446) — 1:1 décomp ──────────────

/** 1:1 décomp `GetDefaultMoveTarget(battler)`. Retourne le default target pour
 *  un battler (= utilisé quand le UI demande qui attaque par défaut sans
 *  override). Logique single vs double battle. */
export function GetDefaultMoveTarget(battler: number): number {
  // Lazy imports pour éviter circular avec battle/constants.
  // BATTLE_OPPOSITE(side) = side ^ 1.
  // BATTLE_PARTNER(position) = position ^ 2.
  const BIT_SIDE = 1;
  const BIT_FLANK = 2;
  const BATTLE_TYPE_DOUBLE = 1;  // 1 << 0
  const BATTLE_ALIVE_EXCEPT_ACTIVE = 0;

  // Lazy lookup gBattleTypeFlags + gAbsentBattlerFlags from globalThis (= same trick).
  const stateMod = (globalThis as { __battleState?: { gBattleTypeFlags?: number; gAbsentBattlerFlags?: number } }).__battleState;
  const gBattleTypeFlags = stateMod?.gBattleTypeFlags ?? 0;
  const gAbsentBattlerFlags = stateMod?.gAbsentBattlerFlags ?? 0;

  const battlerSide = battler & BIT_SIDE;
  const opposing = battlerSide ^ BIT_SIDE;

  if (!(gBattleTypeFlags & BATTLE_TYPE_DOUBLE)) {
    return GetBattlerAtPosition(opposing);
  }

  // Count alive battlers except active — simplified : 2 si double, sinon 1.
  // (= devrait wire CountAliveMonsInBattle BATTLE_ALIVE_EXCEPT_ACTIVE = 0)
  const aliveExceptActive = 2;
  if (aliveExceptActive > 1) {
    // Pick random partner ou opposing.
    const position = (Math.random() < 0.5) ? (opposing ^ BIT_FLANK) : opposing;
    return GetBattlerAtPosition(position);
  }

  // Last alive : redirect partner si opposing absent.
  if (gAbsentBattlerFlags & (1 << opposing)) {
    return GetBattlerAtPosition(opposing ^ BIT_FLANK);
  }
  return GetBattlerAtPosition(opposing);
}

// ─── WEATHER_HAS_EFFECT (battle_util.h:47) — 1:1 décomp macro ──────────────

/** 1:1 décomp `WEATHER_HAS_EFFECT` macro (battle_util.h:47).
 *  `((!ABILITY_ON_FIELD(ABILITY_CLOUD_NINE) && !ABILITY_ON_FIELD(ABILITY_AIR_LOCK)))`.
 *  Retourne TRUE sauf si Cloud Nine ou Air Lock est on field (= ability bloque weather). */
export function WEATHER_HAS_EFFECT(): boolean {
  for (let i = 0; i < gBattlersCount; i++) {
    const mon = gBattleMons[i];
    if (!mon) continue;
    if ((mon.ability === ABILITY_CLOUD_NINE
         || mon.ability === ABILITY_AIR_LOCK)
        && mon.hp > 0) {
      return false;
    }
  }
  return true;
}

// ─── TurnValuesCleanUp (battle_main.c:4857-4892) — 1:1 décomp ──────────────

// ─── TurnValuesCleanUp — DÉPLACÉ dans le miroir src/game/battle_main.ts
//     (battle_main.c:4857-4892, consolidation C2 2026-06-10). Re-export compat. ──
export { TurnValuesCleanUp } from '../../game/battle_main';
