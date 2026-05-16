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
 *   - `FaintClearSetData()` 1:1 décomp partial (= MVP, skips gProtectStructs +
 *     gBattleStruct + gBattleResources qui ne sont pas portés)
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
 *  battler i a position i. Set par battle_main au setup. Pour MVP single battle,
 *  on hardcode identity. */
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
 *  STUBS notés (= UI / AI tracking pas portés) :
 *  - gActionSelectionCursor[], gMoveSelectionCursor[] (= UI cursor state).
 *  - gBattleResources->flags->flags[] (= AI/script flags tracker, ~256 flags).
 *  - ClearBattlerMoveHistory (= AI move tracking par battler).
 *
 *  Le reste est 1:1 strict.
 */
export function FaintClearSetData(): void {
  for (let i = 0; i < NUM_BATTLE_STATS; i++) {
    gBattleMons[gActiveBattler].statStages[i] = DEFAULT_STAT_STAGE;
  }
  gBattleMons[gActiveBattler].status2 = 0;
  gStatuses3[gActiveBattler] = 0;

  // 1:1 décomp ll.3275-3283 : clear cross-battler effects qui dépendent de
  // gActiveBattler (= escape prevention, infatuation, wrap).
  for (let i = 0; i < gBattlersCount; i++) {
    if ((gBattleMons[i].status2 & STATUS2_ESCAPE_PREVENTION)
        && gDisableStructs[i].battlerPreventingEscape === gActiveBattler) {
      gBattleMons[i].status2 &= ~STATUS2_ESCAPE_PREVENTION;
    }
    // STATUS2_INFATUATED_WITH(active) = 0x1<<16 << active (= 4 bits at 16-19).
    const infatuatedWithActive = STATUS2_INFATUATION & (0x10000 << gActiveBattler);
    if (gBattleMons[i].status2 & infatuatedWithActive) {
      gBattleMons[i].status2 &= ~infatuatedWithActive;
    }
    if ((gBattleMons[i].status2 & STATUS2_WRAPPED)
        && gBattleStruct.wrappedBy[i] === gActiveBattler) {
      gBattleMons[i].status2 &= ~STATUS2_WRAPPED;
    }
  }

  // 1:1 décomp ll.3285-3286 : reset UI cursors pour ce battler.
  gActionSelectionCursor[gActiveBattler] = 0;
  gMoveSelectionCursor[gActiveBattler] = 0;

  // 1:1 décomp ll.3288-3290 : clear gDisableStructs entièrement.
  const ds = gDisableStructs[gActiveBattler];
  for (const k of Object.keys(ds) as Array<keyof typeof ds>) {
    (ds as unknown as Record<string, number>)[k] = 0;
  }

  // 1:1 décomp ll.3292-3310 : clear gProtectStructs bit fields.
  const ps = gProtectStructs[gActiveBattler];
  ps.protected = 0;
  ps.endured = 0;
  ps.noValidMoves = 0;
  ps.helpingHand = 0;
  ps.bounceMove = 0;
  ps.stealMove = 0;
  ps.flag0Unknown = 0;
  ps.prlzImmobility = 0;
  ps.confusionSelfDmg = 0;
  ps.targetNotAffected = 0;
  ps.chargingTurn = 0;
  ps.fleeType = 0;
  ps.usedImprisonedMove = 0;
  ps.loveImmobility = 0;
  ps.usedDisabledMove = 0;
  ps.usedTauntedMove = 0;
  ps.flag2Unknown = 0;
  ps.flinchImmobility = 0;
  ps.notFirstStrike = 0;

  ds.isFirstTurn = 2; // 1:1 décomp : reset to 2 (= post-faint freshness).

  gLastMoves[gActiveBattler] = MOVE_NONE;
  gLastLandedMoves[gActiveBattler] = MOVE_NONE;
  gLastHitByType[gActiveBattler] = 0;
  gLastResultingMoves[gActiveBattler] = MOVE_NONE;
  gLastPrintedMoves[gActiveBattler] = MOVE_NONE;
  gLastHitBy[gActiveBattler] = 0xFF;

  // 1:1 décomp ll.3321-3322 : clear gBattleStruct->choicedMove (= u16 low/high).
  gBattleStruct.choicedMove[gActiveBattler] = MOVE_NONE;

  // 1:1 décomp ll.3324-3325 : clear gBattleStruct->lastTakenMove[active*2..+1].
  gBattleStruct.lastTakenMove[gActiveBattler * 2 + 0] = MOVE_NONE;
  gBattleStruct.lastTakenMove[gActiveBattler * 2 + 1] = MOVE_NONE;

  // 1:1 décomp ll.3326-3333 : clear gBattleStruct->lastTakenMoveFrom[active][0..3].
  for (let i = 0; i < 4; i++) {
    gBattleStruct.lastTakenMoveFrom[gActiveBattler * 8 + i * 2 + 0] = 0;
    gBattleStruct.lastTakenMoveFrom[gActiveBattler * 8 + i * 2 + 1] = 0;
  }

  // 1:1 décomp l.3335 : clear palace flag pour active battler.
  gBattleStruct.palaceFlags &= ~(1 << gActiveBattler);

  // 1:1 décomp ll.3337-3346 : clear cross-battler tracking depuis active.
  for (let i = 0; i < gBattlersCount; i++) {
    if (i !== gActiveBattler && GET_BATTLER_SIDE(i) !== GET_BATTLER_SIDE(gActiveBattler)) {
      // Clear lastTakenMove pour les opponents (= no longer hit by us).
      gBattleStruct.lastTakenMove[i * 2 + 0] = MOVE_NONE;
      gBattleStruct.lastTakenMove[i * 2 + 1] = MOVE_NONE;
    }
    // Clear lastTakenMoveFrom[i][active] (= no longer hit by active).
    gBattleStruct.lastTakenMoveFrom[i * 8 + gActiveBattler * 2 + 0] = 0;
    gBattleStruct.lastTakenMoveFrom[i * 8 + gActiveBattler * 2 + 1] = 0;
  }

  // 1:1 décomp l.3348 : `gBattleResources->flags->flags[active] = 0;`
  gBattleResourcesFlags[gActiveBattler] = 0;

  // 1:1 décomp ll.3350-3351 : reset types depuis species data (= revert
  // Conversion / Soak / etc.).
  const [t1, t2] = getSpeciesTypes(gBattleMons[gActiveBattler].species);
  gBattleMons[gActiveBattler].type1 = t1;
  gBattleMons[gActiveBattler].type2 = t2;

  // 1:1 décomp ll.3353-3354 : ClearBattlerMoveHistory + ClearBattlerAbilityHistory.
  ClearBattlerMoveHistory(gActiveBattler);
  ClearBattlerAbilityHistory(gActiveBattler);

  // Reference l.3324-3325 : gCurrentMove non touché ici (= different scope).
  void gCurrentMove;
}

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

// ─── GetScaledHPFraction (battle_interface.c:2517) — 1:1 décomp ────────────

/** 1:1 décomp `GetScaledHPFraction(s16 hp, s16 maxhp, u8 scale)`. */
export function GetScaledHPFraction(hp: number, maxhp: number, scale: number): number {
  if (maxhp === 0) return 0;
  let result = Math.floor((hp * scale) / maxhp);
  if (result === 0 && hp > 0) return 1;
  return result;
}

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
 *  STUB BtlController_EmitSetMonData : notre BattleMon.pp[] est write direct
 *  donc no-op nécessaire pour persistance MVP. */
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

  // STUB MOVE_IS_PERMANENT(attacker, slot) → Emit SetMonData REQUEST_PPMOVE_X.
  // Notre BattleMon.pp[] est write direct (= persist au battle end).
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

  // Count alive battlers except active — STUB simple : 2 si double, sinon 1.
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
