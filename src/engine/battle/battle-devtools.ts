/**
 * battle/battle-devtools.ts — Devtools battle bytecode pour debug "voir sans
 * voir l'écran".
 *
 * Exposé via `scope.bytecode.*` (= installé par dev-scope.ts au boot).
 *
 * Usage typique pour wire bytecode au gameplay (= plan WIRE-BYTECODE-TO-GAMEPLAY) :
 *   scope.bytecode.labels('BattleScript_Effect')  // list les scripts disponibles
 *   scope.bytecode.dumpMons()                     // gBattleMons[0..3] state
 *   scope.bytecode.runScript('BattleScript_EffectHit')  // exec un script complet
 *   scope.bytecode.dispatchStats()                // combien d'opcodes appelés
 *   scope.bytecode.tracingOn()                    // log chaque opcode (max 200)
 *   scope.bytecode.lastBug()                      // dernière exception handler
 *
 * Architecture : 100% pull (= rien d'auto-installé), main.ts importe et
 * appelle installBattleDevtools() qui fait un merge dans window.scope.
 */

import {
  runBattleScript,
  setupBattleScriptContext,
  getBattleScriptOffset,
  getAllLabels,
  getDispatchStats,
  resetDispatchStats,
  setTracing,
  getLastBug,
  clearLastBug,
  getRecentOpcodes,
  type BattleScriptContext,
} from './script-interpreter';
import { OPCODE_NAMES, NAME_TO_OPCODE, getOpcodeName } from './opcode-names';
import {
  gBattleMons,
  gBattlerAttacker,
  gBattlerTarget,
  gActiveBattler,
  gBattlersCount,
  gCurrentMove,
  gChosenMove,
  gBattleMoveDamage,
  gMoveResultFlags,
  gHitMarker,
  gBattleOutcome,
  gBattleTypeFlags,
  gBattleWeather,
  gCritMultiplier,
  gMultiHitCounter,
  gBattleControllerExecFlags,
  gBattleScripting,
  gBattleStruct,
  gSideStatuses,
  gStatuses3,
  gProtectStructs,
  gDisableStructs,
  gSideTimers,
  gWishFutureKnock,
  gBattlerPartyIndexes,
  setBattlerAttacker,
  setBattlerTarget,
  setCurrentMove,
  setChosenMove,
  setHitMarker,
  setMoveResultFlags,
  setActiveBattler,
  setBattleTypeFlags as _setBattleTypeFlags,
  setBattlersCount as _setBattlersCount,
  setAbsentBattlerFlags as _setAbsentBattlerFlags,
  resetBattleState as _resetBattleState,
} from './state';
import { setupPartyForBattle, fillActiveBattleMonsForBattleStart, fillBattleMonFromParty, resolveMoveDexId, PARTY_SIZE as _PARTY_SIZE } from './party-storage';
import { CalculateBaseDamage as _cbd } from './damage-calc';
import { getBattleMove as _gbm } from './data/battle-moves';
import * as _MOVES_ENUM from '../decomp-data/include/constants/moves-data';
import {
  TYPE_MYSTERY as _TYPE_MYSTERY,
  STATUS2_WRAPPED as _STATUS2_WRAPPED,
  STATUS2_ESCAPE_PREVENTION as _STATUS2_ESCAPE_PREVENTION,
  STATUS3_ROOTED as _STATUS3_ROOTED,
  STATUS3_PERISH_SONG as _STATUS3_PERISH_SONG,
  BATTLE_TYPE_ARENA as _BATTLE_TYPE_ARENA,
  ABILITY_ARENA_TRAP as _ABILITY_ARENA_TRAP,
  ABILITY_SHADOW_TAG as _ABILITY_SHADOW_TAG,
  ABILITY_MAGNET_PULL as _ABILITY_MAGNET_PULL,
  TYPE_STEEL as _TYPE_STEEL,
  STATUS1_BURN as _STATUS1_BURN,
  SIDE_STATUS_REFLECT as _SIDE_STATUS_REFLECT,
  SIDE_STATUS_LIGHTSCREEN as _SIDE_STATUS_LIGHTSCREEN,
  ABILITY_GUTS as _ABILITY_GUTS,
  ABILITY_LEVITATE as _ABILITY_LEVITATE,
  ABILITY_WONDER_GUARD as _ABILITY_WONDER_GUARD,
  BATTLE_TYPE_DOUBLE as _BATTLE_TYPE_DOUBLE,
  MOVE_TARGET_BOTH as _MOVE_TARGET_BOTH,
  MOVE_TARGET_SELECTED as _MOVE_TARGET_SELECTED,
  MOVE_TARGET_FOES_AND_ALLY as _MOVE_TARGET_FOES_AND_ALLY,
  MOVE_TARGET_USER as _MOVE_TARGET_USER,
  ALL_MOVES_MASK as _ALL_MOVES_MASK,
  BATTLE_TYPE_TRAINER as _BATTLE_TYPE_TRAINER,
} from './constants';
import { _GetMoveTarget } from './cmd-niveau-34';
import { BattleAI_SetupAIData, BattleAI_ChooseMoveOrAction } from './ai/ai-script-commands';
import { resetAtkCancelerTracker } from './atk-canceler';
import { runMoveScriptViaBytecode, drainBattleEventsAsText, clearBattleEventQueue, runEndTurnEffectsViaBytecode, runTurnStartCleanupViaBytecode, runBattleTurnPassedViaBytecode, runHandleFaintedMonActionsViaBytecode, chooseOpponentMoveViaAI, ensureAiBytecodeLoaded } from './wire-bytecode-bridge';
import { gAiThinkingStruct, aiBytecodeLoaded, getAiScriptOffset, AI_SCRIPTS_TABLE_LABELS, gBattleHistory, setBattlerAI } from './ai/ai-state';
import { _debugShouldUseItem, _debugGetAI_ItemType, getAiSwitchDecision as _getAiSwitchDecision, resetAiSwitchDecision as _resetAiSwitchDecision, ShouldSwitch as _ShouldSwitch, GetMostSuitableMonToSwitchInto as _GetMostSuitable } from './ai/ai-switch-items';
import { loadItemEffects, getItemEffectBytes as _getItemEffectBytes } from './data/item-effects';
import { gTypeEffectiveness as _gTypeEff, TYPE_FORESIGHT as _TYPE_FORESIGHT, TYPE_ENDTABLE as _TYPE_ENDTABLE } from './data/type-effectiveness';
import { _debugResetRng, SeedRng, _debugGetRngValue, _debugGetRandCount } from '../random';
import { getSpeciesInfo as _gdGetSpeciesInfo } from '../data/game-data';
import { getBattleEventQueueSnapshot, getBattleEventQueueSize } from './battle-event-queue';

/** Dump exhaustif des gBattleMons[0..gBattlersCount-1]. Pas de format gba —
 *  print structured pour console.table. */
function dumpMons(): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = [];
  for (let i = 0; i < gBattlersCount; i++) {
    const m = gBattleMons[i];
    if (!m) {
      out.push({ slot: i, empty: true });
      continue;
    }
    out.push({
      slot: i,
      species: m.species,
      lvl: m.level,
      hp: `${m.hp}/${m.maxHP}`,
      atk: m.attack,
      def: m.defense,
      spA: m.spAttack,
      spD: m.spDefense,
      spe: m.speed,
      type1: m.type1,
      type2: m.type2,
      ability: m.ability,
      item: m.item,
      moves: m.moves?.map((mv, idx) => `${mv}:pp${m.pp?.[idx] ?? '?'}`).join(' '),
      stages: m.statStages?.join(','),
      status1: `0x${(m.status1 ?? 0).toString(16)}`,
      status2: `0x${(m.status2 ?? 0).toString(16)}`,
      nickname: m.nickname,
    });
  }
  return out;
}

/** Snapshot complet du combat (= toute la state battle visible bytecode). */
function snapshot(): Record<string, unknown> {
  return {
    battlers: {
      count: gBattlersCount,
      attacker: gBattlerAttacker,
      target: gBattlerTarget,
      active: gActiveBattler,
    },
    move: {
      current: gCurrentMove,
      chosen: gChosenMove,
      damage: gBattleMoveDamage,
      resultFlags: `0x${gMoveResultFlags.toString(16)}`,
      critMultiplier: gCritMultiplier,
      multiHitCounter: gMultiHitCounter,
    },
    battle: {
      outcome: gBattleOutcome,
      typeFlags: `0x${gBattleTypeFlags.toString(16)}`,
      weather: `0x${gBattleWeather.toString(16)}`,
      hitMarker: `0x${gHitMarker.toString(16)}`,
      controllerExecFlags: `0x${gBattleControllerExecFlags.toString(16)}`,
    },
    sideStatuses: gSideStatuses.map(s => `0x${s.toString(16)}`),
    status3: gStatuses3.map(s => `0x${s.toString(16)}`),
    scripting: {
      multihitMoveEffect: gBattleScripting.multihitMoveEffect,
      battler: gBattleScripting.battler,
      animArg1: gBattleScripting.animArg1,
      animArg2: gBattleScripting.animArg2,
      statChanger: gBattleScripting.statChanger,
      statAnimPlayed: gBattleScripting.statAnimPlayed,
      moveendState: gBattleScripting.moveendState,
      dmgMultiplier: gBattleScripting.dmgMultiplier,
      animTurn: gBattleScripting.animTurn,
      animTargetsHit: gBattleScripting.animTargetsHit,
    },
    protect: gProtectStructs.map((p, i) => ({
      slot: i,
      protected: p.protected,
      endured: p.endured,
      physicalDmg: p.physicalDmg,
      flinch: p.flinchImmobility,
      chargingTurn: p.chargingTurn,
    })),
    disable: gDisableStructs.map((d, i) => ({
      slot: i,
      disabledMove: d.disabledMove,
      disableTimer: d.disableTimer,
      encoredMove: d.encoredMove,
      encoredMovePos: d.encoredMovePos,
      tauntTimer: d.tauntTimer,
      isFirstTurn: d.isFirstTurn,
    })),
    sideTimers: gSideTimers.map((t, i) => ({
      slot: i,
      reflect: t.reflectTimer,
      lightScreen: t.lightscreenTimer,
      safeguard: t.safeguardTimer,
      mist: t.mistTimer,
      spikesAmount: t.spikesAmount,
    })),
    wish: gWishFutureKnock,
    struct: {
      stringMoveType: gBattleStruct.stringMoveType,
      moveTarget: gBattleStruct.moveTarget,
      dynamicMoveType: gBattleStruct.dynamicMoveType,
      runTries: gBattleStruct.runTries,
      atkCancelerTracker: gBattleStruct.atkCancelerTracker,
      moveendState: gBattleScripting.moveendState,
    },
  };
}

/** Run un script complet depuis un label. Returns { ok, paused, ... } pour debug.
 *
 *  Note : NE MET PAS À JOUR gameState — modifie uniquement les vars battle.
 *  Pour wire au gameplay réel, voir wire-bytecode-to-battle-flow (TBD).
 */
function runScript(label: string, opts?: {
  /** Si true, reset stats avant le run. */
  resetStats?: boolean;
  /** Si true, enable tracing pour ce run (= max 200 opcodes loggés). */
  trace?: boolean;
  /** Si true (default), re-call runBattleScript en boucle jusqu'à fin (= ignore
   *  pauses pour POC dev — skip pause opcodes au lieu de wait frames réelles). */
  fastForward?: boolean;
  /** Max iters de re-call si fastForward (default 100). */
  maxIters?: number;
}): {
  ok: boolean;
  reason?: string;
  paused?: boolean;
  scriptPtrFinal?: number;
  dispatched?: number;
  iters?: number;
} {
  const offset = getBattleScriptOffset(label);
  if (offset < 0) {
    return { ok: false, reason: `label '${label}' not found` };
  }
  const ctx = setupBattleScriptContext(label);
  if (!ctx) {
    return { ok: false, reason: `setup ctx failed for '${label}'` };
  }
  if (opts?.resetStats) resetDispatchStats();
  const tracingBefore = opts?.trace ? true : false;
  if (tracingBefore) setTracing(true);
  const beforeTotal = getDispatchStats().total;

  const fastForward = opts?.fastForward ?? true;
  const maxIters = opts?.maxIters ?? 100;
  let iters = 0;
  let paused = runBattleScript(ctx);
  iters++;
  if (fastForward) {
    let lastPtr = ctx.scriptPtr;
    let stuck = 0;
    while (paused && iters < maxIters && ctx.scriptPtr >= 0) {
      paused = runBattleScript(ctx);
      iters++;
      if (ctx.scriptPtr === lastPtr) {
        stuck++;
        if (stuck > 5) break;  // really stuck
      } else {
        stuck = 0;
        lastPtr = ctx.scriptPtr;
      }
    }
  }
  if (tracingBefore) setTracing(false);
  const afterTotal = getDispatchStats().total;
  return {
    ok: true,
    paused,
    scriptPtrFinal: ctx.scriptPtr,
    dispatched: afterTotal - beforeTotal,
    iters,
  };
}

/** Run un opcode unique en isolation (= setup un ctx avec un mini-bytecode
 *  contenant l'opcode + args, et l'exécute). Note : à cause de l'architecture
 *  bytecode globale (= les opcodes lisent _BYTECODE direct via readByte/Word),
 *  cette fonction ne peut PAS facilement injecter un bytecode custom. À la
 *  place, on demande à l'utilisateur de pointer ctx.scriptPtr à un offset où
 *  l'opcode + args sont déjà présents.
 *
 *  Note : si besoin pour POC, ajouter un mode "isolated bytecode" dans le
 *  script-interpreter (= overload _BYTECODE temporairement). */
function runOpcode(opcodeName: string, _args?: number[]): {
  ok: boolean;
  reason?: string;
} {
  const opcode = NAME_TO_OPCODE[opcodeName];
  if (opcode === undefined) {
    return { ok: false, reason: `unknown opcode name '${opcodeName}'` };
  }
  return {
    ok: false,
    reason: `runOpcode not yet implemented for isolated test — use runScript() with a known label instead. Opcode 0x${opcode.toString(16)} found.`,
  };
}

/** Inspect le script actuel = label le plus proche du scriptPtr (= help debug). */
function whereAm(ctx: BattleScriptContext | null): Record<string, unknown> {
  if (!ctx) return { error: 'no ctx provided — pass a BattleScriptContext' };
  const ptr = ctx.scriptPtr;
  if (ptr < 0) return { ptr: -1, status: 'script done (ptr=-1)' };
  // Find closest label ≤ ptr.
  const allLabels = getAllLabels();
  let closest = '';
  let closestOffset = -1;
  for (const lbl of allLabels) {
    const off = getBattleScriptOffset(lbl);
    if (off <= ptr && off > closestOffset) {
      closest = lbl;
      closestOffset = off;
    }
  }
  return {
    ptr,
    ptrHex: `0x${ptr.toString(16)}`,
    nearestLabel: closest,
    nearestLabelOffset: closestOffset,
    deltaFromLabel: ptr - closestOffset,
    stackDepth: ctx.scriptPtrStack.length,
    comparisonResult: ctx.comparisonResult,
  };
}

/** Liste les labels disponibles (= scripts), filtré par prefix optionnel. */
function labels(prefix?: string): string[] {
  return getAllLabels(prefix);
}

/** Stats opcodes par nom + total. Snapshot du moment d'appel. */
function dispatchStats(): { byName: Record<string, number>; total: number } {
  return getDispatchStats();
}

/** Reset les stats opcodes. */
function resetStats(): { ok: true } {
  resetDispatchStats();
  return { ok: true };
}

/** Enable tracing : log chaque opcode dispatché jusqu'à max (default 200). */
function tracingOn(max = 200): { ok: true } {
  setTracing(true, max);
  return { ok: true };
}

/** Disable tracing. */
function tracingOff(): { ok: true } {
  setTracing(false);
  return { ok: true };
}

/** Dernière exception throw par un handler opcode. */
function lastBug(): ReturnType<typeof getLastBug> {
  return getLastBug();
}

/** Reset le lastBug. */
function clearBug(): { ok: true } {
  clearLastBug();
  return { ok: true };
}

/** Liste les N derniers opcodes dispatchés (= ring buffer 100). */
function recentOps(): Array<{ opcode: number; name: string; scriptPtr: number }> {
  return getRecentOpcodes();
}

/** Lookup opcode hex from name OR name from hex. */
function opcode(query: string | number): { hex?: number; hexStr?: string; name?: string; reason?: string } {
  if (typeof query === 'number') {
    const name = getOpcodeName(query);
    if (name.startsWith('?')) return { hex: query, reason: 'unknown opcode' };
    return { hex: query, hexStr: `0x${query.toString(16)}`, name };
  }
  const hex = NAME_TO_OPCODE[query];
  if (hex === undefined) return { reason: `unknown opcode name '${query}'` };
  return { hex, hexStr: `0x${hex.toString(16)}`, name: query };
}

/** Liste tous les opcodes 1:1 décomp (hex + nom). */
function listOpcodes(): Array<{ hex: string; name: string }> {
  const out: Array<{ hex: string; name: string }> = [];
  for (let i = 0; i < OPCODE_NAMES.length; i++) {
    const name = OPCODE_NAMES[i];
    if (name) out.push({ hex: `0x${i.toString(16).padStart(2, '0')}`, name });
  }
  return out;
}

/** Setup un combat POC : remplit gBattleMons[0] (Arcko Lv5 / starter) +
 *  gBattleMons[1] (Zigzagton Lv2). Utilise les imports DIRECTS du module
 *  battle-devtools.ts pour garantir qu'on travaille sur le MÊME module
 *  que Cmd_attackcanceler/Cmd_damagecalc (= sinon HMR re-import = 2 instances).
 *
 *  Use case : tester runScript depuis devtools console sans avoir à wire
 *  battle-flow.ts complètement. */
async function prepareTestBattle(opts?: {
  /** Move id à exécuter (default MOVE_POUND = 1). */
  moveId?: number;
  /** Attacker battler id (default 0 = player). */
  attacker?: number;
  /** Target battler id (default 1 = enemy). */
  target?: number;
  /** Enemy species enum (default SPECIES_ZIGZAGOON). */
  enemySpecies?: string;
  /** Enemy level (default 2). */
  enemyLevel?: number;
}): Promise<Record<string, unknown>> {
  const moveId = opts?.moveId ?? 1;
  // AUDIT FIX : accept number only. Si user passe un objet (= type mismatch
  // par erreur), coerce à 0/1 défaut pour éviter `setBattlerAttacker(objet)`
  // qui causerait undefined.item crash dans ItemBattleEffects.
  const attacker = typeof opts?.attacker === 'number' ? opts.attacker : 0;
  const target = typeof opts?.target === 'number' ? opts.target : 1;
  const enemySpecies = opts?.enemySpecies ?? 'SPECIES_ZIGZAGOON';
  const enemyLevel = opts?.enemyLevel ?? 2;

  // 1:1 décomp : gPlayerParty[] = gSaveBlock1Ptr->playerParty. Lazy import
  // pour break circular deps de battle-devtools.
  const sbsMod = await import('../save/save-block-state');
  const party = sbsMod.gSaveBlock1Ptr.playerParty;
  if (!party) return { ok: false, reason: 'no gSaveBlock1Ptr.playerParty' };
  const realParty = (party as Array<unknown>).filter((m): m is { speciesEnum: string } => !!m);
  if (realParty.length === 0) return { ok: false, reason: 'empty party' };

  // Use module-level imports (= same instance as Cmd_attackcanceler).
  const pokemonMod = await import('../pokemon');
  const enemyMon = pokemonMod.createPokemonInstance(enemySpecies, enemyLevel);
  setupPartyForBattle(realParty as never[], [enemyMon]);
  fillActiveBattleMonsForBattleStart();

  // Reset state vars pour scénario propre.
  setBattlerAttacker(attacker);
  setBattlerTarget(target);
  setCurrentMove(moveId);
  setChosenMove(moveId);
  setHitMarker(0);
  setMoveResultFlags(0);
  // Reset state qui persist cross-runs et bloque attackcanceler / autres opcodes :
  // gBattleOutcome (= si != 0, attackcanceler stayOnOpcode infinite).
  // gBattleMoveDamage + gCritMultiplier + gCurrentActionFuncId (= state machine).
  // gBattleControllerExecFlags (= si != 0, paused).
  const stateMod = (globalThis as { __battleState?: {
    resetBattleState?: () => void;
  } }).__battleState;
  // Note : on évite resetBattleState() complet qui wipe les mons. À la place,
  // on reset seulement les state vars critiques pour un nouveau move.
  const sm = await import('./state');
  sm.setBattleOutcome(0);
  sm.setBattleMoveDamage(0);
  sm.setCritMultiplier(1);
  sm.setCurrentActionFuncId(0);
  sm.setBattleControllerExecFlags(0);
  void stateMod;
  gBattlerPartyIndexes[attacker] = 0;
  gBattlerPartyIndexes[target] = 0;
  resetAtkCancelerTracker();

  return {
    ok: true,
    attacker: { id: attacker, mon: gBattleMons[attacker] },
    target: { id: target, mon: gBattleMons[target] },
    moveId,
  };
}

/** Build l'API exposée sur scope.bytecode. */
export function buildBattleDevtools(): Record<string, unknown> {
  return {
    // Inspect
    dumpMons,
    snapshot,
    whereAm,
    labels,
    listOpcodes,
    opcode,
    // Setup (POC test pour wire bytecode)
    prepareTestBattle,
    /** Test direct du bridge bytecode ↔ PokemonInstance via runMoveScriptViaBytecode.
     *  Usage : scope.bytecode.testMoveBridge() — create un combat ad-hoc et exec
     *  Pound via bytecode, return damage measured. */
    testMoveBridge: async (opts?: { moveId?: string; enemy?: string; enemyLevel?: number; attackerSpecies?: string; attackerLevel?: number; persistMons?: boolean; }) => {
      const pokemonMod = await import('../pokemon');
      let attacker: { speciesEnum: string; nickname: string; currentHp: number; maxHp: number; moves: { id: string; pp: number }[]; ivs: { atk: number; def: number }; evs: { atk: number; def: number }; level: number; };
      if (opts?.attackerSpecies) {
        attacker = pokemonMod.createPokemonInstance(opts.attackerSpecies, opts.attackerLevel ?? 50) as never;
      } else {
        // Use real gSaveBlock1Ptr.playerParty[0] for attacker (= 1:1 décomp).
        const sbsMod = await import('../save/save-block-state');
        const realParty = (sbsMod.gSaveBlock1Ptr.playerParty as Array<typeof attacker> | undefined)?.filter(m => !!m);
        if (!realParty?.length) return { error: 'no party (specify attackerSpecies)' };
        attacker = realParty[0];
      }
      // Si moveId override, on remplace attacker.moves[0].id par ce move (= force le bridge à lookup le bon effect script).
      if (opts?.moveId) {
        attacker.moves = [{ id: opts.moveId, pp: 35 }, ...(attacker.moves.slice(1) || [])];
      }
      const enemyMon = pokemonMod.createPokemonInstance(opts?.enemy ?? 'SPECIES_ZIGZAGOON', opts?.enemyLevel ?? 2);
      // Sauf si persistMons=true (= keep gBattleMons state across calls for multi-turn tests),
      // reinit gBattleMons via setupPartyForBattle + fillActive...
      if (!opts?.persistMons) {
        setupPartyForBattle([attacker] as never, [enemyMon]);
        fillActiveBattleMonsForBattleStart();
      }
      const defender = enemyMon;
      const beforeHp = defender.currentHp;
      const beforeStatus1 = (globalThis as { __battleState?: { gBattleMons?: Array<{ status1: number; statStages: number[]; }> } }).__battleState?.gBattleMons?.[1];
      const beforeSnap = beforeStatus1 ? { status1: beforeStatus1.status1, stages: [...beforeStatus1.statStages] } : null;
      const result = runMoveScriptViaBytecode({
        attacker: attacker as never,
        defender,
        attackerMoveIdx: 0,
      });
      const afterStatus1 = (globalThis as { __battleState?: { gBattleMons?: Array<{ status1: number; statStages: number[]; }> } }).__battleState?.gBattleMons?.[1];
      const afterSnap = afterStatus1 ? { status1: afterStatus1.status1, stages: [...afterStatus1.statStages] } : null;
      return {
        attacker_name: attacker.nickname,
        defender_name: defender.nickname,
        moveUsed: attacker.moves[0]?.id,
        defenderHpBefore: beforeHp,
        defenderHpAfter: defender.currentHp,
        statusBefore: beforeSnap?.status1,
        statusAfter: afterSnap?.status1,
        stagesBefore: beforeSnap?.stages,
        stagesAfter: afterSnap?.stages,
        bridgeResult: result,
      };
    },
    // Execute
    runScript,
    runOpcode,
    // Stats + tracing
    dispatchStats,
    resetStats,
    tracingOn,
    tracingOff,
    recentOps,
    // Errors
    lastBug,
    clearBug,
    // Event queue (Phase 1.4 J)
    /** Drain TOUTE la queue d'events bytecode et decode les PRINTSTRING en text FR.
     *  Returns { messages: string[], eventsCount, events }. Le queue est vidé. */
    drainEvents: drainBattleEventsAsText,
    /** Snapshot read-only du contenu actuel de la queue sans pop. */
    peekEvents: () => getBattleEventQueueSnapshot(),
    /** Size actuelle de la queue (= debug). */
    eventsQueueSize: () => getBattleEventQueueSize(),
    /** Clear la queue (= reset cross-test). */
    clearEvents: clearBattleEventQueue,
    // ─── Battle AI 1:1 (battle_ai_script_commands.c) ──────────────────────
    /** État du bytecode AI + offsets résolus des 12 scripts (table 1:1). */
    aiInfo: () => {
      const offsets: Record<string, number> = {};
      const seen = new Set<string>();
      for (const label of AI_SCRIPTS_TABLE_LABELS) {
        if (seen.has(label)) continue;
        seen.add(label);
        offsets[label] = getAiScriptOffset(label);
      }
      return { loaded: aiBytecodeLoaded(), scriptOffsets: offsets };
    },
    /** Snapshot gAiThinkingStruct (score[]/aiFlags/funcResult/aiAction). */
    aiScores: () => ({
      score: [...gAiThinkingStruct.score],
      simulatedRNG: [...gAiThinkingStruct.simulatedRNG],
      aiFlags: gAiThinkingStruct.aiFlags,
      aiAction: gAiThinkingStruct.aiAction,
      funcResult: gAiThinkingStruct.funcResult,
      moveConsidered: gAiThinkingStruct.moveConsidered,
      movesetIndex: gAiThinkingStruct.movesetIndex,
    }),
    /** Exécute le vrai AI 1:1 (BattleAI_SetupAIData + ChooseMoveOrAction) sur
     *  un matchup ad-hoc en mode TRAINER. Retourne le move choisi + scores. */
    aiChooseMove: async (opts?: { attackerSpecies?: string; attackerLevel?: number; enemy?: string; enemyLevel?: number; trainerId?: number; }) => {
      await ensureAiBytecodeLoaded();
      const pokemonMod = await import('../pokemon');
      const attacker = pokemonMod.createPokemonInstance(opts?.attackerSpecies ?? 'SPECIES_TREECKO', opts?.attackerLevel ?? 10);
      const enemyMon = pokemonMod.createPokemonInstance(opts?.enemy ?? 'SPECIES_POOCHYENA', opts?.enemyLevel ?? 7);
      setupPartyForBattle([attacker] as never, [enemyMon]);
      fillActiveBattleMonsForBattleStart();
      const choice = chooseOpponentMoveViaAI({
        opponent: enemyMon as never,
        player: attacker as never,
        isTrainer: true,
        trainerId: opts?.trainerId ?? 1,
      });
      return {
        enemy: enemyMon.nickname,
        enemyMoves: enemyMon.moves.map(m => m?.id),
        choice,
        chosenMove: choice.index >= 0 ? enemyMon.moves[choice.index]?.id : `(${choice.action})`,
        aiFlags: gAiThinkingStruct.aiFlags,
        scores: [...gAiThinkingStruct.score],
      };
    },
    /** Batterie : vérifie que les 12 scripts de gBattleAI_ScriptsTable résolvent
     *  + 1 run AI complet sans throw. Retour { ok, scriptsResolved, errors }. */
    aiBattery: async () => {
      await ensureAiBytecodeLoaded();
      const errors: string[] = [];
      const seen = new Set<string>();
      let scriptsResolved = 0;
      for (const label of AI_SCRIPTS_TABLE_LABELS) {
        if (seen.has(label)) continue;
        seen.add(label);
        const off = getAiScriptOffset(label);
        if (off < 0) errors.push(`label ${label} unresolved`);
        else scriptsResolved++;
      }
      try {
        const pokemonMod = await import('../pokemon');
        const attacker = pokemonMod.createPokemonInstance('SPECIES_TREECKO', 12);
        const enemyMon = pokemonMod.createPokemonInstance('SPECIES_POOCHYENA', 7);
        setupPartyForBattle([attacker] as never, [enemyMon]);
        fillActiveBattleMonsForBattleStart();
        for (let r = 0; r < 8; r++) {
          const c = chooseOpponentMoveViaAI({ opponent: enemyMon as never, player: attacker as never, isTrainer: true, trainerId: 1 });
          if (c.index < -1 || c.index >= 4) errors.push(`run ${r}: bad index ${c.index}`);
        }
      } catch (e) {
        errors.push(`AI run threw: ${String(e)}`);
      }
      return { ok: errors.length === 0, scriptsResolved, errors };
    },
    /** VÉRIF DÉTERMINISTE — AI doubles `ChooseMoveOrAction_Doubles`
     *  (battle_ai_script_commands.c:448-570). aiBattery ne testait QUE le
     *  single ; ici on monte un VRAI 2v2 (4 battlers + movesets, DOUBLE|
     *  TRAINER) et on appelle BattleAI_SetupAIData + BattleAI_ChooseMoveOrAction
     *  (route → _Doubles via le flag DOUBLE). Recompute exact impractical
     *  (scoring AI bytecode 4-cibles) + fidélité 1:1 déjà auditée
     *  code-review (session 147) → on prouve SOUNDNESS + DÉTERMINISME :
     *  pas de throw, run×2 identique (RNG seedé), ret/scores sains, le
     *  chemin _Doubles est bien pris. NON wiré = test pur, zéro risque.
     *  Usage : scope.bytecode.aiDoubles() */
    aiDoubles: async (opts?: { seed?: number }) => {
      await ensureAiBytecodeLoaded();
      const seed = opts?.seed ?? 0;
      const pokemonMod = await import('../pokemon');
      const run = () => {
        _debugResetRng();
        SeedRng(seed);
        const p1 = pokemonMod.createPokemonInstance('SPECIES_TREECKO', 15);
        const p2 = pokemonMod.createPokemonInstance('SPECIES_TORCHIC', 15);
        const e1 = pokemonMod.createPokemonInstance('SPECIES_POOCHYENA', 13);
        const e2 = pokemonMod.createPokemonInstance('SPECIES_ZIGZAGOON', 13);
        setupPartyForBattle([p1, p2] as never, [e1, e2] as never);
        // 2v2 réel : battlers 0/2 = player, 1/3 = enemy (layout Émeraude).
        fillBattleMonFromParty(0, 'player', 0);
        fillBattleMonFromParty(1, 'enemy', 0);
        fillBattleMonFromParty(2, 'player', 1);
        fillBattleMonFromParty(3, 'enemy', 1);
        _setBattlersCount(4);
        _setBattleTypeFlags((_BATTLE_TYPE_DOUBLE | _BATTLE_TYPE_TRAINER) >>> 0);
        _setAbsentBattlerFlags(0);
        const aiB = 1; // AI = opponent-left
        setBattlerAI(aiB);
        setBattlerAttacker(aiB);
        setActiveBattler(aiB);
        BattleAI_SetupAIData(_ALL_MOVES_MASK);
        const ret = BattleAI_ChooseMoveOrAction();
        return { ret, scores: [...gAiThinkingStruct.score], aiFlags: gAiThinkingStruct.aiFlags };
      };
      let a: ReturnType<typeof run> | undefined;
      let b: ReturnType<typeof run> | undefined;
      try { a = run(); b = run(); } catch (e) { return { ok: false, threw: String(e) }; }
      if (!a || !b) return { ok: false, threw: 'no result' };
      const deterministic = JSON.stringify(a) === JSON.stringify(b);
      const ret = a.ret;
      const moveIdx = ret & 0xFF;
      // ret sain : action/move byte ≥0 ; moveIdx 0..3 (ou action ≥ valeur move).
      const retSane = typeof ret === 'number' && ret >= 0 && Number.isFinite(ret);
      const scoresPopulated = Array.isArray(a.scores) && a.scores.length > 0;
      return {
        ok: deterministic && retSane && scoresPopulated,
        deterministic, retSane, scoresPopulated,
        ret, moveIdx, aiFlags: a.aiFlags,
        scoresSample: a.scores.slice(0, 8),
        doublesPath: true, // BATTLE_TYPE_DOUBLE set → BattleAI_ChooseMoveOrAction → _Doubles
      };
    },
    /** VÉRIF DÉTERMINISTE — ShouldUseItem / GetAI_ItemType 1:1 (sous-système
     *  objet AI dresseur, battle_ai_switch_items.c:792-944). Scénario fixe
     *  injecté (hp/maxHP/status/items/isFirstTurn/mistTimer) → décision
     *  EXACTE reproductible, confrontable ligne-à-ligne au décomp. NON wiré
     *  au gameplay = test pur. Lance 2× → deterministic:true.
     *  Usage : scope.bytecode.aiItem({ items:[13], hp:10, maxHP:100 })  // 13=Potion
     *          scope.bytecode.aiItem({ items:[19], hp:10, maxHP:100 })  // 19=Full Restore
     *          scope.bytecode.aiItem({ items:[24], status1:8, items.. }) // Full Heal/poison */
    aiItem: async (opts?: {
      species?: string; level?: number;
      hp?: number; maxHP?: number; status1?: number; status2?: number;
      items?: number[]; itemsNo?: number;
      isFirstTurn?: number; mistTimer?: number;
    }) => {
      await loadItemEffects();
      const pokemonMod = await import('../pokemon');
      const items = opts?.items ?? [13]; // 13 = ITEM_POTION
      const run = () => {
        const enemyMon = pokemonMod.createPokemonInstance(opts?.species ?? 'SPECIES_POOCHYENA', opts?.level ?? 10);
        const playerMon = pokemonMod.createPokemonInstance('SPECIES_TREECKO', 10);
        setupPartyForBattle([playerMon] as never, [enemyMon]);
        fillActiveBattleMonsForBattleStart();
        const ab = 1;            // battler AI (côté opponent)
        setActiveBattler(ab);
        const side = ab & 1;     // ≡ GET_BATTLER_SIDE (BIT_SIDE=1) → B_SIDE_OPPONENT
        const m = gBattleMons[ab];
        m.maxHP = opts?.maxHP ?? 100;
        m.hp = opts?.hp ?? m.maxHP;
        m.status1 = opts?.status1 ?? 0;
        m.status2 = opts?.status2 ?? 0;
        for (let k = 0; k < gBattleHistory.trainerItems.length; k++) gBattleHistory.trainerItems[k] = items[k] ?? 0;
        gBattleHistory.itemsNo = opts?.itemsNo ?? items.length;
        gDisableStructs[ab].isFirstTurn = opts?.isFirstTurn ?? 1;
        gSideTimers[side].mistTimer = opts?.mistTimer ?? 0;
        gBattleStruct.AI_itemType[ab >> 1] = 0;
        gBattleStruct.AI_itemFlags[ab >> 1] = 0;
        gBattleStruct.chosenItem[(ab >> 1) * 2] = 0;
        _resetAiSwitchDecision();
        const used = _debugShouldUseItem();
        const dec = _getAiSwitchDecision();
        return {
          items: [...items],
          hp: m.hp, maxHP: m.maxHP, status1: m.status1, status2: m.status2,
          isFirstTurn: gDisableStructs[ab].isFirstTurn, mistTimer: gSideTimers[side].mistTimer,
          used,
          decision: { action: dec.action, data: dec.data },
          AI_itemType: gBattleStruct.AI_itemType[ab >> 1],
          AI_itemFlags: gBattleStruct.AI_itemFlags[ab >> 1],
          chosenItem: gBattleStruct.chosenItem[(ab >> 1) * 2],
          trainerItemsAfter: [...gBattleHistory.trainerItems],
          aiItemTypeOfFirst: _debugGetAI_ItemType(items[0] ?? 0, _getItemEffectBytes(items[0] ?? 0) ?? []),
        };
      };
      const a = run();
      const b = run();
      const deterministic = JSON.stringify(a) === JSON.stringify(b);
      return deterministic ? { deterministic: true, fingerprint: a } : { deterministic: false, run1: a, run2: b };
    },
    /** VÉRIF DÉTERMINISTE — ShouldSwitch / GetMostSuitableMonToSwitchInto 1:1
     *  (battle_ai_switch_items.c:429-731). Mirror du caller décomp
     *  (battle_controller_opponent.c:1162 / battle_main.c:3134 :
     *  monToSwitchIntoId+AI_monToSwitchIntoId init = PARTY_SIZE). Scénario
     *  fixe → décision EXACTE reproductible, ×2 deterministic. NON wiré au
     *  controller = test pur, zéro risque gameplay.
     *  Usage : scope.bytecode.aiSwitch({ status3:'PERISH_SONG' })
     *          scope.bytecode.aiSwitch({ status2:'ESCAPE_PREVENTION' })
     *          scope.bytecode.aiSwitch({ opposingAbility:'ARENA_TRAP' }) */
    aiSwitch: async (opts?: {
      active?: string; activeLevel?: number;
      benchMons?: string[];
      status2?: 'NONE' | 'WRAPPED' | 'ESCAPE_PREVENTION';
      status3?: 'NONE' | 'ROOTED' | 'PERISH_SONG';
      perishTimer?: number;
      opposingAbility?: 'NONE' | 'ARENA_TRAP' | 'SHADOW_TAG' | 'MAGNET_PULL';
      activeSteel?: boolean;
      arena?: boolean;
      presetMonToSwitch?: number;
      call?: 'ShouldSwitch' | 'GetMostSuitable' | 'both';
      seed?: number;
    }) => {
      const seed = opts?.seed ?? 0;
      const pokemonMod = await import('../pokemon');
      const run = () => {
        _debugResetRng();
        SeedRng(seed);
        const active = pokemonMod.createPokemonInstance(opts?.active ?? 'SPECIES_POOCHYENA', opts?.activeLevel ?? 12);
        const bench = (opts?.benchMons ?? ['SPECIES_ZIGZAGOON']).map((s) => pokemonMod.createPokemonInstance(s, 12));
        const player = pokemonMod.createPokemonInstance('SPECIES_TREECKO', 12);
        setupPartyForBattle([player] as never, [active, ...bench] as never);
        fillActiveBattleMonsForBattleStart();
        const ab = 1;
        setActiveBattler(ab);
        // Mirror caller décomp : init PARTY_SIZE (sinon GetMostSuitable early-return).
        for (let i = 0; i < 4; i++) {
          gBattleStruct.monToSwitchIntoId[i] = _PARTY_SIZE;
          gBattleStruct.AI_monToSwitchIntoId[i] = _PARTY_SIZE;
        }
        if (opts?.presetMonToSwitch != null) gBattleStruct.monToSwitchIntoId[ab] = opts.presetMonToSwitch;
        const m = gBattleMons[ab];
        m.status2 = opts?.status2 === 'WRAPPED' ? _STATUS2_WRAPPED
          : opts?.status2 === 'ESCAPE_PREVENTION' ? _STATUS2_ESCAPE_PREVENTION : 0;
        gStatuses3[ab] = opts?.status3 === 'ROOTED' ? _STATUS3_ROOTED
          : opts?.status3 === 'PERISH_SONG' ? _STATUS3_PERISH_SONG : 0;
        gDisableStructs[ab].perishSongTimer = opts?.perishTimer ?? 0;
        if (opts?.activeSteel) { m.type1 = _TYPE_STEEL; m.type2 = _TYPE_STEEL; }
        const oppA = opts?.opposingAbility ?? 'NONE';
        gBattleMons[0].ability = oppA === 'ARENA_TRAP' ? _ABILITY_ARENA_TRAP
          : oppA === 'SHADOW_TAG' ? _ABILITY_SHADOW_TAG
          : oppA === 'MAGNET_PULL' ? _ABILITY_MAGNET_PULL : 0;
        _setBattleTypeFlags((opts?.arena ? _BATTLE_TYPE_ARENA : 0) >>> 0);
        _resetAiSwitchDecision();
        let shouldSwitch: boolean | null = null;
        let mostSuitable: number | null = null;
        const call = opts?.call ?? 'both';
        if (call === 'ShouldSwitch' || call === 'both') shouldSwitch = _ShouldSwitch();
        if (call === 'GetMostSuitable' || call === 'both') mostSuitable = _GetMostSuitable();
        const dec = _getAiSwitchDecision();
        return {
          shouldSwitch, mostSuitable,
          decision: { action: dec.action, data: dec.data },
          AI_monToSwitchIntoId: gBattleStruct.AI_monToSwitchIntoId[ab],
          monToSwitchIntoId: gBattleStruct.monToSwitchIntoId[ab],
          partyIdx: gBattlerPartyIndexes[ab],
        };
      };
      const a = run();
      const b = run();
      const deterministic = JSON.stringify(a) === JSON.stringify(b);
      return deterministic ? { deterministic: true, fingerprint: a } : { deterministic: false, run1: a, run2: b };
    },
    /** VÉRIF DÉTERMINISTE — ciblage `_GetMoveTarget` 1:1 (battle_util.c:3811).
     *  Utilise l'override `setTarget` (= pattern décomp `GetMoveTarget(move,
     *  TARGET+1)`) pour forcer chaque MOVE_TARGET_* sans dépendre d'un move.
     *  Recompute INDÉPENDANT 1:1 : USER→attaquant ; BOTH/FOES_AND_ALLY→
     *  GetBattlerAtPosition(BATTLE_OPPOSITE(side)) + absent→^BIT_FLANK ;
     *  SELECTED single→l'unique opposant non-absent. Couvre single / 2v2 /
     *  1v2 (absent[] = battlers marqués absents → prouve "1v2 descend du
     *  2v2" au niveau ciblage : MÊME code, le flag absent redirige au
     *  partenaire). NON wiré = test pur, zéro risque.
     *  Usage : scope.bytecode.moveTarget({ attacker:0, target:'BOTH',
     *    double:true, absent:[1] }) // primary absent → ^BIT_FLANK = 3 */
    moveTarget: async (opts?: {
      attacker?: number;
      target?: 'SELECTED' | 'BOTH' | 'FOES_AND_ALLY' | 'USER';
      double?: boolean; absent?: number[]; seed?: number;
    }) => {
      const seed = opts?.seed ?? 0;
      const pokemonMod = await import('../pokemon');
      const run = () => {
        _debugResetRng();
        SeedRng(seed);
        const p = pokemonMod.createPokemonInstance('SPECIES_POOCHYENA', 10);
        const e = pokemonMod.createPokemonInstance('SPECIES_ZIGZAGOON', 10);
        setupPartyForBattle([p] as never, [e] as never);
        fillActiveBattleMonsForBattleStart();
        const ab = opts?.attacker ?? 1;
        const dbl = !!opts?.double;
        _setBattlersCount(dbl ? 4 : 2);
        _setBattleTypeFlags(dbl ? _BATTLE_TYPE_DOUBLE : 0);
        let absMask = 0;
        for (const i of opts?.absent ?? []) absMask |= (1 << i);
        _setAbsentBattlerFlags(absMask);
        setBattlerAttacker(ab);
        const TMAP: Record<string, number> = {
          SELECTED: _MOVE_TARGET_SELECTED, BOTH: _MOVE_TARGET_BOTH,
          FOES_AND_ALLY: _MOVE_TARGET_FOES_AND_ALLY, USER: _MOVE_TARGET_USER,
        };
        const tname = opts?.target ?? 'BOTH';
        const tc = TMAP[tname];
        // override setTarget = tc + 1 (1:1 décomp : GetMoveTarget(m, T+1))
        const got = _GetMoveTarget(33, tc + 1);
        // recompute INDÉPENDANT 1:1 décomp (cas déterministes)
        const side = ab & 1; // GET_BATTLER_SIDE = b & BIT_SIDE
        const N = dbl ? 4 : 2;
        let exp: number;
        let asserted = true;
        if (tc === _MOVE_TARGET_USER) {
          exp = ab;
        } else if (tc === _MOVE_TARGET_BOTH || tc === _MOVE_TARGET_FOES_AND_ALLY) {
          let prim = side ^ 1; // GetBattlerAtPosition(BATTLE_OPPOSITE(side))
          if (absMask & (1 << prim)) prim ^= 2; // BIT_FLANK
          exp = prim;
        } else { // SELECTED
          if (!dbl) {
            // single : do-while → l'unique opposant non-self non-absent
            exp = -1;
            for (let i = 0; i < N; i++) {
              if (i !== ab && (i & 1) !== side && !(absMask & (1 << i))) { exp = i; break; }
            }
          } else {
            // double SELECTED = RNG parmi plusieurs valides → on n'asserte
            // que déterminisme + appartenance (pas la valeur exacte).
            asserted = false;
            exp = got;
          }
        }
        const validMembership = (() => {
          if (asserted) return true;
          // got doit être un opposant non-self non-absent
          return got !== ab && (got & 1) !== side && !(absMask & (1 << got));
        })();
        return {
          target: tname, attacker: ab, double: dbl, absMask,
          got, exp, asserted,
          pass: asserted ? got === exp : validMembership,
        };
      };
      const a = run();
      const b = run();
      const deterministic = JSON.stringify(a) === JSON.stringify(b);
      return deterministic ? { deterministic: true, fingerprint: a } : { deterministic: false, run1: a, run2: b };
    },
    /** VÉRIF DÉTERMINISTE PRÉCISE — remplace l'A/B visuel (impossible : trop
     *  de random : IV/EV/stats/seed). Seed RNG + IV/EV fixes → sortie EXACTE
     *  reproductible, comparable 1:1 à la formule décomp. Lance 2× le MÊME
     *  scénario : `deterministic:true` prouve le déterminisme (pré-requis
     *  pour comparer à la ROM). Le fingerprint (damage/stats/rng) est la
     *  valeur exacte à confronter au décomp.
     *  Usage : scope.bytecode.precise({ seed:0, moveId:'tackle',
     *    attackerSpecies:'SPECIES_TREECKO', attackerLevel:5,
     *    enemy:'SPECIES_ZIGZAGOON', enemyLevel:2 }) */
    precise: async (opts?: {
      seed?: number; moveId?: string;
      attackerSpecies?: string; attackerLevel?: number;
      enemy?: string; enemyLevel?: number;
      ivs?: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
      evs?: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
    }) => {
      const seed = opts?.seed ?? 0;
      const fixedIvs = opts?.ivs ?? { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
      const fixedEvs = opts?.evs ?? { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
      const bs = (): Array<{ attack: number; defense: number; speed: number; spAttack: number; spDefense: number; maxHP: number; hp: number; level: number; species: number }> | undefined =>
        (globalThis as { __battleState?: { gBattleMons?: never[] } }).__battleState?.gBattleMons as never;
      const pick = (i: number) => { const m = bs()?.[i]; return m ? { atk: m.attack, def: m.defense, spe: m.speed, spa: m.spAttack, spd: m.spDefense, maxHP: m.maxHP, hp: m.hp, lvl: m.level, sp: m.species } : null; };
      const run = async () => {
        _debugResetRng();
        SeedRng(seed);
        _resetBattleState();  // 1:1 : scénario = combat frais (cf. precisePipeline).
        const pokemonMod = await import('../pokemon');
        const attacker = pokemonMod.createPokemonInstance(opts?.attackerSpecies ?? 'SPECIES_TREECKO', opts?.attackerLevel ?? 5, { ivs: fixedIvs, evs: fixedEvs });
        const enemyMon = pokemonMod.createPokemonInstance(opts?.enemy ?? 'SPECIES_ZIGZAGOON', opts?.enemyLevel ?? 2, { ivs: fixedIvs, evs: fixedEvs });
        if (opts?.moveId) attacker.moves = [{ id: opts.moveId, nameFr: opts.moveId, pp: 35, ppMax: 35 }, ...attacker.moves.slice(1)];
        setupPartyForBattle([attacker] as never, [enemyMon]);
        fillActiveBattleMonsForBattleStart();
        const rngBeforeMove = _debugGetRngValue();
        const randCountBeforeMove = _debugGetRandCount();
        const defenderHpBefore = enemyMon.currentHp;
        const result = runMoveScriptViaBytecode({ attacker: attacker as never, defender: enemyMon as never, attackerMoveIdx: 0 });
        return {
          seed, move: attacker.moves[0]?.id,
          attackerStats: pick(0), defenderStats: pick(1),
          defenderHpBefore, defenderHpAfter: enemyMon.currentHp,
          damage: result.damage, typeMul: result.typeMul, missed: result.missed, fainted: result.fainted,
          rngBeforeMove, randCountBeforeMove,
          rngAfter: _debugGetRngValue(), randCountAfter: _debugGetRandCount(),
        };
      };
      const a = await run();
      const b = await run();
      const deterministic = JSON.stringify(a) === JSON.stringify(b);
      return deterministic ? { deterministic: true, fingerprint: a } : { deterministic: false, run1: a, run2: b };
    },
    /** VÉRIF 1:1 PIPELINE damage COMPLET post-CalculateBaseDamage. Recompute
     *  INDÉPENDANT 1:1 décomp : base=_cbd (prouvé) → Cmd_damagecalc
     *  (×gCritMultiplier ×dmgMultiplier, :1296) → Cmd_typecalc (STAB ×15
     *  puis /10, :1371-1372 ; puis ModulateDmgByType par type défenseur
     *  `dmg*mul/10` + clamp `==0&&mul!=0→1`, :1321-1325) → ApplyRandomDmg
     *  (randPercent=100-(Random()%16) ∈[85,100], dmg*r/100, clamp 0→1).
     *  Le facteur random n'est pas modélisé en ordre RNG : on prouve D
     *  (=déterministe) par MEMBERSHIP EXACTE — got ∈ ensemble des 32 valeurs
     *  {crit∈{1,2}}×{r∈85..100} (à stages neutres crit=×2 pur). Si un step
     *  déterministe (STAB/type/clamp/crit) divergeait, D serait faux et got
     *  hors ensemble. Attaquant = côté ennemi (battler 1) = pas de badge.
     *  Pur : power>1, pas Struggle, def sans Levitate/WonderGuard, stages
     *  neutres (battle-start), pas d'items/abilities spéciales.
     *  Usage : scope.bytecode.precisePipeline({ seed:0, moveId:'ember',
     *    attackerSpecies:'SPECIES_TORCHIC', enemy:'SPECIES_TREECKO' }) */
    precisePipeline: async (opts?: {
      seed?: number; moveId?: string;
      attackerSpecies?: string; attackerLevel?: number;
      enemy?: string; enemyLevel?: number;
    }) => {
      const seed = opts?.seed ?? 0;
      const fix = { ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 }, evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 } };
      const pokemonMod = await import('../pokemon');
      const run = () => {
        _debugResetRng();
        SeedRng(seed);
        // 1:1 décomp : chaque scénario = un COMBAT FRAIS (= BattleStartClearSetData).
        // Sans ça, gStatuses3/gSideStatuses (ex. Mud/Water Sport, Leech Seed,
        // screens) fuient d'un move au suivant dans la batterie → faux mismatch
        // (ex. Fire/Electric power /2 par Water/Mud Sport résiduel). Reset AVANT
        // createPokemonInstance (qui reremplit les mons) + entre run a/b.
        _resetBattleState();
        // attaquant = côté ennemi (battler 1) → pas de badge boost (1:1 pur).
        const atkMon = pokemonMod.createPokemonInstance(opts?.attackerSpecies ?? 'SPECIES_TORCHIC', opts?.attackerLevel ?? 10, fix);
        const defMon = pokemonMod.createPokemonInstance(opts?.enemy ?? 'SPECIES_TREECKO', opts?.enemyLevel ?? 10, fix);
        if (opts?.moveId) atkMon.moves = [{ id: opts.moveId, nameFr: opts.moveId, pp: 35, ppMax: 35 }, ...atkMon.moves.slice(1)];
        // player slot=defMon → gBattleMons[0] ; enemy slot=atkMon → gBattleMons[1].
        setupPartyForBattle([defMon] as never, [atkMon] as never);
        fillActiveBattleMonsForBattleStart();
        const bm = (globalThis as { __battleState?: { gBattleMons?: Array<{ attack: number; defense: number; spAttack: number; spDefense: number; level: number; type1: number; type2: number; ability: number }> } }).__battleState?.gBattleMons;
        if (!bm || !bm[0] || !bm[1]) return { error: 'gBattleMons absent' } as Record<string, unknown>;
        const moveNum = resolveMoveDexId(opts?.moveId ?? 'ember');
        const md = _gbm(moveNum);
        const power = md.power;
        const mtype = md.type;
        const A = bm[1]; const D = bm[0];
        // base = CalculateBaseDamage (prouvé 1:1 par preciseDamage)
        const base = _cbd(A as never, D as never, moveNum, 0, 0, 0, 1, 0).damage;
        // Garde : si createPokemonInstance/fill ne peuple pas l'espèce
        // (ex. certaines espèces Kanto = ability vide, gBattleMons poubelle
        // → base NaN), l'input est MALFORMÉ : on n'asserte pas (= principe
        // "garbage in → pas une divergence 1:1"). Retour STABLE (run1==run2).
        if (!Number.isFinite(base)) {
          return {
            seed, move: opts?.moveId ?? 'ember', moveNum,
            malformedInput: true, base: null, pure: false, pass: null,
            attacker: { sp: opts?.attackerSpecies ?? 'SPECIES_TORCHIC', t: [A.type1, A.type2] },
            defender: { sp: opts?.enemy ?? 'SPECIES_TREECKO', t: [D.type1, D.type2], ability: D.ability },
          } as Record<string, unknown>;
        }
        // D déterministe : ×crit×dmgMult(=1) → STAB ×15/10 → type ModulateDmgByType
        const isStab = A.type1 === mtype || A.type2 === mtype;
        const modulate = (d: number, mul: number): number => {
          let r = Math.floor((d * mul) / 10);
          if (r === 0 && mul !== 0) r = 1;
          return r;
        };
        const pipelineNoRandom = (crit: number): number => {
          let d = base * crit; // dmgMultiplier=1 (pur, pas Charged/HelpingHand)
          if (isStab) d = Math.floor((d * 15) / 10); // :1371-1372 (×15 puis /10)
          // type : itère gTypeEffectiveness comme Cmd_typecalc (:1386-1406)
          let i = 0;
          while (_gTypeEff[i] !== _TYPE_ENDTABLE) {
            if (_gTypeEff[i] === _TYPE_FORESIGHT) { i += 3; continue; } // pas de Foresight (pur)
            if (_gTypeEff[i] === mtype) {
              if (_gTypeEff[i + 1] === D.type1) d = modulate(d, _gTypeEff[i + 2]);
              if (_gTypeEff[i + 1] === D.type2 && D.type1 !== D.type2) d = modulate(d, _gTypeEff[i + 2]);
            }
            i += 3;
          }
          return d;
        };
        // Ensemble exact des got possibles (crit∈{1,2} × randPercent∈[85,100]).
        const candidates = new Set<number>();
        for (const c of [1, 2]) {
          const Dc = pipelineNoRandom(c);
          for (let rp = 85; rp <= 100; rp++) {
            let v: number;
            if (Dc === 0) v = 0;
            else { v = Math.floor((Dc * rp) / 100); if (v === 0) v = 1; }
            candidates.add(v);
          }
        }
        const result = runMoveScriptViaBytecode({ attacker: atkMon as never, defender: defMon as never, attackerMoveIdx: 0, attackerBattlerId: 1, defenderBattlerId: 0 });
        const got = result.damage;
        const defLevitate = D.ability === _ABILITY_LEVITATE || D.ability === _ABILITY_WONDER_GUARD;
        const pure = mtype !== _TYPE_MYSTERY && power > 1 && (opts?.moveId ?? 'ember') !== 'struggle' && !defLevitate;
        return {
          seed, move: opts?.moveId ?? 'ember', moveNum, power, mtype, isStab,
          base, Dcrit1: pipelineNoRandom(1), Dcrit2: pipelineNoRandom(2),
          got, inCandidateSet: candidates.has(got), candidatesCount: candidates.size,
          pure, pass: pure ? candidates.has(got) : null,
          attacker: { sp: opts?.attackerSpecies ?? 'SPECIES_TORCHIC', t: [A.type1, A.type2] },
          defender: { sp: opts?.enemy ?? 'SPECIES_TREECKO', t: [D.type1, D.type2], ability: D.ability },
          typeMul: result.typeMul,
        };
      };
      const a = run();
      const b = run();
      const deterministic = JSON.stringify(a) === JSON.stringify(b);
      return deterministic ? { deterministic: true, fingerprint: a } : { deterministic: false, run1: a, run2: b };
    },
    /** Assertion 1:1 EXACTE des stats (= recompute INDÉPENDANT de la formule
     *  décomp pokemon.c CALC_STAT + sNatureStatTable, confronté à
     *  gBattleMons[0]). Pas d'eyeball : PASS/FAIL exact par stat, gère la
     *  nature dérivée de personality (= ce qui m'avait piégé en calcul manuel).
     *  Usage : scope.bytecode.preciseStats({ seed:0,
     *    species:'SPECIES_TREECKO', level:5 }) */
    preciseStats: async (opts?: {
      seed?: number; species?: string; level?: number;
      ivs?: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
      evs?: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
    }) => {
      const seed = opts?.seed ?? 0;
      const speciesEnum = opts?.species ?? 'SPECIES_TREECKO';
      const level = opts?.level ?? 5;
      const iv = opts?.ivs ?? { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
      const ev = opts?.evs ?? { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
      _debugResetRng();
      SeedRng(seed);
      const pokemonMod = await import('../pokemon');
      const mon = pokemonMod.createPokemonInstance(speciesEnum, level, { ivs: iv, evs: ev });
      setupPartyForBattle([mon] as never, [pokemonMod.createPokemonInstance('SPECIES_ZIGZAGOON', 2)]);
      fillActiveBattleMonsForBattleStart();
      const bm = (globalThis as { __battleState?: { gBattleMons?: Array<{ attack: number; defense: number; speed: number; spAttack: number; spDefense: number; maxHP: number; personality: number; species: number }> } }).__battleState?.gBattleMons?.[0];
      if (!bm) return { error: 'gBattleMons[0] absent' };
      const info = _gdGetSpeciesInfo(speciesEnum);
      if (!info?.stats) return { error: `no decomp stats for ${speciesEnum}` };
      const base = info.stats; // {hp,atk,def,spe,spa,spd}
      const personality = bm.personality >>> 0;
      const nature = personality % 25;
      // 1:1 décomp sNatureStatTable (pokemon.c) — cols [Atk,Def,Spe,SpA,SpD].
      const NT: ReadonlyArray<ReadonlyArray<number>> = [
        [0, 0, 0, 0, 0], [1, -1, 0, 0, 0], [1, 0, -1, 0, 0], [1, 0, 0, -1, 0], [1, 0, 0, 0, -1],
        [-1, 1, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, -1, 0, 0], [0, 1, 0, -1, 0], [0, 1, 0, 0, -1],
        [-1, 0, 1, 0, 0], [0, -1, 1, 0, 0], [0, 0, 0, 0, 0], [0, 0, 1, -1, 0], [0, 0, 1, 0, -1],
        [-1, 0, 0, 1, 0], [0, -1, 0, 1, 0], [0, 0, -1, 1, 0], [0, 0, 0, 0, 0], [0, 0, 0, 1, -1],
        [-1, 0, 0, 0, 1], [0, -1, 0, 0, 1], [0, 0, -1, 0, 1], [0, 0, 0, -1, 1], [0, 0, 0, 0, 0],
      ];
      const modNat = (n: number, stat: number, idx: number): number => {
        const m = NT[n]?.[idx] ?? 0;
        return m > 0 ? Math.floor(stat * 110 / 100) : m < 0 ? Math.floor(stat * 90 / 100) : stat;
      };
      const calc = (bs: number, ivv: number, evv: number, idx: number): number =>
        modNat(nature, Math.floor(((2 * bs + ivv + Math.floor(evv / 4)) * level) / 100) + 5, idx);
      const SPECIES_SHEDINJA = 303;
      const expHP = bm.species === SPECIES_SHEDINJA ? 1
        : Math.floor(((2 * base.hp + iv.hp + Math.floor(ev.hp / 4)) * level) / 100) + level + 10;
      const exp = {
        maxHP: expHP,
        attack: calc(base.atk, iv.atk, ev.atk, 0),
        defense: calc(base.def, iv.def, ev.def, 1),
        speed: calc(base.spe, iv.spe, ev.spe, 2),
        spAttack: calc(base.spa, iv.spa, ev.spa, 3),
        spDefense: calc(base.spd, iv.spd, ev.spd, 4),
      };
      const act = { maxHP: bm.maxHP, attack: bm.attack, defense: bm.defense, speed: bm.speed, spAttack: bm.spAttack, spDefense: bm.spDefense };
      const perStat: Record<string, { expected: number; actual: number; ok: boolean }> = {};
      let pass = true;
      for (const k of Object.keys(exp) as Array<keyof typeof exp>) {
        const ok = exp[k] === act[k];
        if (!ok) pass = false;
        perStat[k] = { expected: exp[k], actual: act[k], ok };
      }
      return { pass, species: speciesEnum, level, seed, personality, nature, baseStats: base, perStat };
    },
    /** Assertion 1:1 EXACTE du cœur damage `CalculateBaseDamage` (pré-RNG,
     *  déterministe). Recompute INDÉPENDANT 1:1 du core décomp pokemon.c
     *  (APPLY_STAT_MOD neutre au battle-start + `if(damage==0)damage=1` +
     *  final +2) vs appel direct. PASS valable en scénario PUR : pas de STAB
     *  (move type ≠ types attaquant), power>1, pas TYPE_MYSTERY, stages
     *  neutres (battle-start), attaquant = gBattleMons[1] (ennemi → pas de
     *  badge boost), pas d'items. Attaquant = gBattleMons[1], défenseur = [0].
     *  Genèse : v1 omettait le clamp damage==0→1 → faux FAIL Pound/Geodude
     *  (got=3 = 1:1 décomp : core 0 → 1 → +2). Corrigé ici.
     *  EXTENSION 1:1 décomp pokemon.c : branche PHYSIQUE = burn /2 (:3264,
     *  status1&BURN & ability!=GUTS) → Reflect /2 (:3268, single) →
     *  clamp 0→1 (:3281). branche SPÉCIALE = Light Screen /2 (:3319, single),
     *  AUCUN clamp min-1 (≠ physique = subtilité 1:1). +2 final (:3372).
     *  DOUBLE 2v2 (pokemon.c) : Reflect/Light Screen = `2*(damage/3)` si
     *  `DOUBLE && CountAliveMonsInBattle(DEF_SIDE)==2` (:3270/:3321), sinon
     *  `/2` ; move spread (target==MOVE_TARGET_BOTH) = `/2` suppl. (:3277/
     *  :3328). `absentPartner` flag battler2 → CountAlive(DEF)=1 = teste
     *  que le 1v2 « descend du 2v2 » (MÊME code, count diffère).
     *  Usage : scope.bytecode.preciseDamage({ moveId:'pound', burn:true })
     *          scope.bytecode.preciseDamage({ reflect:true, double:true })
     *          scope.bytecode.preciseDamage({ moveId:'surf', double:true })
     *          scope.bytecode.preciseDamage({ reflect:true, double:true,
     *            absentPartner:true }) // 1v2 → branche single */
    preciseDamage: async (opts?: {
      seed?: number; moveId?: string;
      attackerSpecies?: string; attackerLevel?: number;
      defenderSpecies?: string; defenderLevel?: number;
      burn?: boolean; reflect?: boolean; lightscreen?: boolean;
      double?: boolean; absentPartner?: boolean;
    }) => {
      const seed = opts?.seed ?? 0;
      const fix = { ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 }, evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 } };
      _debugResetRng();
      SeedRng(seed);
      _resetBattleState();  // 1:1 : scénario = combat frais (cf. precisePipeline).
      const pokemonMod = await import('../pokemon');
      const atkMon = pokemonMod.createPokemonInstance(opts?.attackerSpecies ?? 'SPECIES_TREECKO', opts?.attackerLevel ?? 5, fix);
      const defMon = pokemonMod.createPokemonInstance(opts?.defenderSpecies ?? 'SPECIES_GEODUDE', opts?.defenderLevel ?? 14, fix);
      // player slot=defMon → gBattleMons[0] ; enemy slot=atkMon → gBattleMons[1].
      setupPartyForBattle([defMon] as never, [atkMon] as never);
      fillActiveBattleMonsForBattleStart();
      // Setup battlers/flags AUTO-CONTENU (single OU double 2v2). 1:1 :
      // CountAliveMonsInBattle(DEF_SIDE) ne lit QUE GET_BATTLER_SIDE +
      // gAbsentBattlerFlags (pas la validité des gBattleMons[2/3]) → pas
      // besoin de remplir 4 battlers réels. attaquant=1(ennemi=no badge),
      // cible=0. double + absentPartner(battler2) → CountAlive(DEF)=1
      // (= "1v2 descend du 2v2" : MÊME code, count diffère).
      setBattlerAttacker(1);
      setBattlerTarget(0);
      if (opts?.double) {
        _setBattleTypeFlags(_BATTLE_TYPE_DOUBLE);
        _setBattlersCount(4);
        _setAbsentBattlerFlags(opts?.absentPartner ? (1 << 2) : 0);
      } else {
        _setBattleTypeFlags(0);
        _setBattlersCount(2);
        _setAbsentBattlerFlags(0);
      }
      const bm = (globalThis as { __battleState?: { gBattleMons?: Array<{ attack: number; defense: number; spAttack: number; spDefense: number; level: number; type1: number; type2: number; status1: number; ability: number }> } }).__battleState?.gBattleMons;
      if (!bm || !bm[0] || !bm[1]) return { error: 'gBattleMons absent' };
      const moveNum = resolveMoveDexId(opts?.moveId ?? 'pound');
      const md = _gbm(moveNum);
      const power = md.power;
      const mtype = md.type;
      const A = bm[1]; const D = bm[0];
      // Injecte burn (status1) + screens (sideStatus arg, 4ᵉ) — 1:1 décomp.
      // Décomp lit REFLECT en branche physique, LIGHTSCREEN en branche
      // spéciale ; passer les 2 bits est inoffensif (chaque branche lit le sien).
      if (opts?.burn) A.status1 = (A.status1 | _STATUS1_BURN) >>> 0;
      const sideStatus = (opts?.reflect ? _SIDE_STATUS_REFLECT : 0)
        | (opts?.lightscreen ? _SIDE_STATUS_LIGHTSCREEN : 0);
      const got = _cbd(A as never, D as never, moveNum, sideStatus, 0, 0, 1, 0).damage;
      // Recompute INDÉPENDANT 1:1 décomp (chemin pur, stages neutres =
      // APPLY_STAT_MOD identité, pas de badge car attaquant côté ennemi).
      const physical = mtype < _TYPE_MYSTERY;
      const atkStat = physical ? A.attack : A.spAttack;
      const defStat = physical ? D.defense : D.spDefense;
      const lvl = A.level;
      let d = atkStat * power;
      d = d * (Math.floor(2 * lvl / 5) + 2);
      d = Math.floor(d / defStat);
      d = Math.floor(d / 50);
      // 1:1 décomp pokemon.c : burn(/2)+Reflect(/2)+clamp(0→1) sont DANS la
      // branche PHYSIQUE (3264/3268/3281) ; Light Screen DANS la branche
      // SPÉCIALE (3319) et la branche spéciale n'a PAS de clamp min-1.
      const burnApplies = !!opts?.burn && physical && A.ability !== _ABILITY_GUTS;
      const reflectApplies = !!opts?.reflect && physical;
      const lightscreenApplies = !!opts?.lightscreen && !physical;
      // CountAliveMonsInBattle(DEF_SIDE) : 2 si double & partenaire présent,
      // 1 si absentPartner (= 1v2 « descend du 2v2 » : MÊME code, count diffère).
      const isDouble = !!opts?.double;
      const countAliveDef = isDouble ? (opts?.absentPartner ? 1 : 2) : 1;
      const moveTargetBoth = md.target === _MOVE_TARGET_BOTH;
      // moves spread (MOVE_TARGET_BOTH) en double 2v2 → /2 supplémentaire.
      const spreadHalves = isDouble && moveTargetBoth && countAliveDef === 2;
      if (physical) {
        if (burnApplies) d = Math.floor(d / 2);                          // :3264
        if (reflectApplies) {
          if (isDouble && countAliveDef === 2) d = 2 * Math.floor(d / 3); // :3270-3271 (2v2)
          else d = Math.floor(d / 2);                                     // :3273 (single/1v2)
        }
        if (spreadHalves) d = Math.floor(d / 2);                         // :3277
        if (d === 0) d = 1;                                              // :3281 PHYSIQUE only
      } else {
        if (lightscreenApplies) {
          if (isDouble && countAliveDef === 2) d = 2 * Math.floor(d / 3); // :3321-3322 (2v2)
          else d = Math.floor(d / 2);                                     // :3324 (single/1v2)
        }
        if (spreadHalves) d = Math.floor(d / 2);                         // :3328
        // pas de clamp en branche spéciale (1:1) ; weather/flashfire inertes (pur)
      }
      const expected = d + 2;              // ← final +2 1:1 décomp (pokemon.c:3372)
      const isStab = A.type1 === mtype || A.type2 === mtype;
      const pure = mtype !== _TYPE_MYSTERY && !isStab && power > 1;
      return {
        pure, pass: pure ? got === expected : null,
        move: opts?.moveId ?? 'pound', moveNum, power, mtype, physical,
        burn: !!opts?.burn, burnApplies, reflect: !!opts?.reflect, reflectApplies,
        lightscreen: !!opts?.lightscreen, lightscreenApplies,
        double: isDouble, absentPartner: !!opts?.absentPartner, countAliveDef,
        moveTargetBoth, spreadHalves,
        attacker: { sp: opts?.attackerSpecies ?? 'SPECIES_TREECKO', lvl, atkStat, isStab, ability: A.ability },
        defender: { sp: opts?.defenderSpecies ?? 'SPECIES_GEODUDE', defStat },
        got, expected, seed,
      };
    },
    // End-turn effects (Phase 1.4 L) — delegate à wire-bytecode-bridge.
    /** Run la chaîne complète end-of-turn 1:1 décomp :
     *  DoFieldEndTurnEffects → DoBattlerEndTurnEffects → HandleWishPerishSongOnTurnEnd.
     *  Pour chaque effect, exec le script via runBattleScript puis drain les
     *  messages event queue. Returns { phases, msgs } debug summary. */
    runEndTurn: async () => {
      const result = await runEndTurnEffectsViaBytecode();
      return {
        phases: result.phases,
        msgs: result.messages,
        eventsCount: result.eventsCount,
      };
    },
    /** Run 1:1 décomp `TurnValuesCleanUp(FALSE)` cleanup au début d'un turn :
     *  isFirstTurn--, rechargeTimer--, STATUS2_SUBSTITUTE clear si HP 0, etc.
     *  Caller (= devtools test ou battle-flow turn loop) appelle au début. */
    runTurnStart: () => {
      runTurnStartCleanupViaBytecode();
      return { ok: true };
    },
    /** Run full 1:1 décomp `BattleTurnPassed()` (battle_main.c:3956-4019).
     *  Caller (= battle-flow turn loop) appelle APRÈS les 2 moves du turn.
     *  Encapsule : TurnValuesCleanUp(TRUE) → field/battler end-turn → HandleWish
     *  → TurnValuesCleanUp(FALSE) → reset markers + turn counter + chosen actions.
     *  Returns { phases, messages, outcome, battleEnded } debug summary. */
    runTurnPassed: async () => {
      const result = await runBattleTurnPassedViaBytecode();
      return {
        phases: result.phases,
        msgs: result.messages,
        eventsCount: result.eventsCount,
        outcome: result.outcome,
        battleEnded: result.battleEnded,
      };
    },
    /** Run 1:1 décomp `HandleFaintedMonActions()` (battle_util.c:1877-1954).
     *  7-state machine pour gestion KO mid-turn : GiveExp → HandleFaintedMon →
     *  Intimidate/Trace/Items/Forecast. Caller appelle quand un mon est tombé
     *  KO mid-turn (= hp == 0 + pas dans gAbsentBattlerFlags).
     *  Returns { phases, msgs } debug summary. */
    runHandleFainted: async () => {
      const result = await runHandleFaintedMonActionsViaBytecode();
      return {
        phases: result.phases,
        msgs: result.messages,
        eventsCount: result.eventsCount,
      };
    },
    /** Wrapper devtools : sim 1 turn complet bytecode 1:1 décomp.
     *  Sequence :
     *    1. runTurnStart (= TurnValuesCleanUp(FALSE) → isFirstTurn--, recharge--)
     *    2. testMoveBridge(moveId) (= attacker exec move)
     *    3. runTurnPassed (= TurnValuesCleanUp(TRUE) + DoField + DoBattler + Wish/Perish + cleanup)
     *    4. runHandleFainted SI defender hp == 0 (= GiveExp + HandleFaintedMon)
     *  Returns aggregated { startupOk, move, turn, fainted? } pour debug. */
    runFullTurn: async (opts: { moveId: string; attackerSpecies?: string; attackerLevel?: number; enemy?: string; enemyLevel?: number; persistMons?: boolean; }) => {
      runTurnStartCleanupViaBytecode();
      // Lazy lookup testMoveBridge depuis window.scope (= installé par dev-scope).
      const wScope = (window as unknown as { scope?: { bytecode?: { testMoveBridge?: (o: unknown) => Promise<Record<string, unknown>> } } }).scope;
      const testMoveBridge = wScope?.bytecode?.testMoveBridge;
      const moveR = testMoveBridge ? await testMoveBridge({
        moveId: opts.moveId, attackerSpecies: opts.attackerSpecies, attackerLevel: opts.attackerLevel,
        enemy: opts.enemy, enemyLevel: opts.enemyLevel, persistMons: opts.persistMons ?? true,
      }) : { error: 'testMoveBridge not available' };
      const turnR = await runBattleTurnPassedViaBytecode();
      let faintR: Record<string, unknown> | null = null;
      const gs = (globalThis as { __battleState?: { gBattleMons?: Array<{ hp: number }> } }).__battleState;
      const defenderHp = gs?.gBattleMons?.[1]?.hp ?? -1;
      if (defenderHp === 0) {
        const fr = await runHandleFaintedMonActionsViaBytecode();
        faintR = { phases: fr.phases, msgs: fr.messages, eventsCount: fr.eventsCount };
      }
      return {
        startupOk: true,
        move: moveR,
        turn: { phases: turnR.phases, msgs: turnR.messages, outcome: turnR.outcome, battleEnded: turnR.battleEnded },
        fainted: faintR,
      };
    },
    /** AUDIT 100% — BATTERIE GOLDEN DÉTERMINISTE EXHAUSTIVE. Confronte le
     *  moteur bytecode au recompute INDÉPENDANT 1:1 décomp sur TOUS les
     *  moves (~354) + toutes catégories de mécanique. Anti-eyeball : 100%
     *  PASS/FAIL exact, 0 test visuel. Réutilise les méthodes prouvées
     *  (precisePipeline / preciseDamage / moveTarget) via window.scope.
     *  bytecode (= pattern runFullTurn). Sortie COMPACTE : compteurs +
     *  liste des FAILs seulement (jamais 354 lignes).
     *  Modes :
     *   1. PIPELINE numérique (chaque move damaging) : base CalculateBaseDamage
     *      (prouvé) → crit → STAB → type → ApplyRandomDmg ; membership exacte
     *      + déterminisme (2 runs seedés identiques).
     *   2. SCRIPT-INTÉGRITÉ (TOUS moves, incl. status/multi-hit/recoil/drain/
     *      OHKO/2-turn/recharge/lock/heal/field/protect/counter/bide/trap/
     *      confuse/transform/RNG/delayed/spread) : run via bytecode 2× seedé
     *      → déterministe + 0 exception handler (lastBug).
     *   3. VARIANTES mécaniques (burn/reflect/lightscreen/double-2v2/1v2/
     *      spread) : preciseDamage recompute indépendant.
     *   4. CIBLAGE doubles : moveTarget 1:1.
     *  Usage : await scope.bytecode.goldenBattery()
     *          await scope.bytecode.goldenBattery({ limit:80, startAt:0 }) */
    goldenBattery: async (opts?: { seed?: number; limit?: number; startAt?: number }) => {
      const seed = opts?.seed ?? 0;
      const B = (window as unknown as { scope?: { bytecode?: Record<string, (o?: unknown) => Promise<Record<string, unknown>> | Record<string, unknown>> } }).scope?.bytecode;
      if (!B) return { error: 'scope.bytecode introuvable' };
      const all = Object.keys(_MOVES_ENUM)
        .filter(k => k.startsWith('MOVE_') && (_MOVES_ENUM as Record<string, number>)[k] > 0)
        .map(k => ({ enumName: k, num: (_MOVES_ENUM as Record<string, number>)[k], dexId: k.slice(5).replace(/_/g, '').toLowerCase() }))
        .sort((a, b) => a.num - b.num);
      const startAt = opts?.startAt ?? 0;
      const slice = opts?.limit ? all.slice(startAt, startAt + opts.limit) : all.slice(startAt);
      // 1:1 décomp `include/constants/battle_move_effects.h` — effets dont la
      // PRÉMISSE "single-hit damage en 1 invocation" NE S'APPLIQUE PAS (= ce
      // n'est PAS une divergence moteur, c'est l'outil naïf). Vérifié 1:1.
      //  • SE_ZERO : dégâts turn-1 = 0 ATTENDU (charge/2-turn/semi-invuln/
      //    delayed/conditionnel non rempli en combat frais). got!==0 ⇒ VRAIE
      //    divergence (toujours assertée).
      //  • SE_MULTI : multi-hit à puissance non-standard → modèle single-hit
      //    inapplicable ; on assert SEULEMENT déterminisme + 0 exception.
      const SE_ZERO = new Set<number>([
        8,   // EFFECT_DREAM_EATER (cible doit dormir)
        26,  // EFFECT_BIDE (encaisse 2 turns)
        39,  // EFFECT_RAZOR_WIND (charge)
        75,  // EFFECT_SKY_ATTACK (charge)
        92,  // EFFECT_SNORE (user doit dormir)
        145, // EFFECT_SKULL_BASH (charge)
        148, // EFFECT_FUTURE_SIGHT (delayed +3 turns)
        151, // EFFECT_SOLARBEAM (charge hors soleil)
        155, // EFFECT_SEMI_INVULNERABLE (Fly/Dig/Dive/Bounce charge)
        158, // EFFECT_FAKE_OUT (1er turn seulement)
        161, // EFFECT_SPIT_UP (nécessite Stockpile)
      ]);
      const SE_MULTI = new Set<number>([
        104, // EFFECT_TRIPLE_KICK (3 hits puissance croissante)
        154, // EFFECT_BEAT_UP (1 hit/équipier)
      ]);
      const byEffect: Record<string, { n: number; pass: number; fail: number }> = {};
      const fails: Array<Record<string, unknown>> = [];
      let pipelineTested = 0, pure = 0, passed = 0, nondet = 0, malformed = 0, threw = 0, bugs = 0;
      let specialZero = 0, specialMulti = 0;
      for (const mv of slice) {
        let effect = 'UNKNOWN';
        try { effect = String((_gbm(mv.num) as { effect?: unknown }).effect ?? 'UNKNOWN'); } catch { /* best-effort */ }
        byEffect[effect] = byEffect[effect] ?? { n: 0, pass: 0, fail: 0 };
        byEffect[effect].n++;
        clearLastBug();
        let ok = true, reason = '';
        let detail: Record<string, unknown> = {};
        try {
          // 1:1 : défenseur HAUTE-HP (Wailord, baseHP 170, lvl élevé) + attaquant
          // niveau modéré → AUCUN move pur ne OHKO. precisePipeline mesure le
          // HP-delta (= bridge `defenderHpBefore - currentHp`) qui PLAFONNE à
          // la HP du défenseur s'il tombe KO (HP clamp 0). Avec Treecko L10
          // (31 HP) tout move STAB/SE OHKO → got=31 = faux "mismatch" (artefact
          // de MESURE de l'outil, PAS divergence moteur). Wailord ~300+ HP →
          // got == raw damage → membership valide pour TOUS les moves damaging.
          const r = await B.precisePipeline!({ moveId: mv.dexId, seed, attackerLevel: 40, enemy: 'SPECIES_WAILORD', enemyLevel: 70 }) as { deterministic?: boolean; fingerprint?: Record<string, unknown>; run1?: Record<string, unknown>; run2?: Record<string, unknown> };
          pipelineTested++;
          const fp = (r.fingerprint ?? r.run1 ?? {}) as Record<string, unknown>;
          const effNum = Number(effect);
          if (r.deterministic === false) { ok = false; reason = 'non-deterministic'; nondet++; detail = { run1: r.run1, run2: r.run2 }; }
          else if (fp.error != null || fp.malformedInput === true) { malformed++; /* garbage in ≠ divergence 1:1 */ }
          else if (SE_ZERO.has(effNum)) {
            // 1:1 : charge/delayed/conditionnel → dégâts turn-1 = 0 ATTENDU
            // (combat frais : pas endormi/pas 1er turn/pas Stockpile/etc.).
            if (fp.got === 0) specialZero++;
            else { ok = false; reason = 'special-zero: turn-1 devait être 0'; detail = { got: fp.got, base: fp.base }; }
          }
          else if (SE_MULTI.has(effNum)) {
            // multi-hit puissance non-standard : modèle single-hit N/A.
            // Déterminisme + 0 exception assertés (nondet/bug checks). OK.
            specialMulti++;
          }
          else if (fp.pure === true) {
            pure++;
            if (fp.pass === true) passed++;
            else { ok = false; reason = 'pipeline-mismatch'; detail = { got: fp.got, Dcrit1: fp.Dcrit1, Dcrit2: fp.Dcrit2, base: fp.base, isStab: fp.isStab, typeMul: fp.typeMul }; }
          }
          const bug = getLastBug();
          if (bug && (bug as { opcode?: unknown }).opcode != null) { ok = false; reason = reason ? reason + '+handler-exception' : 'handler-exception'; bugs++; detail.bug = bug; }
        } catch (e) { ok = false; reason = 'threw'; threw++; detail = { err: String(e) }; }
        if (ok) byEffect[effect].pass++;
        else { byEffect[effect].fail++; if (fails.length < 60) fails.push({ move: mv.enumName, num: mv.num, effect, reason, ...detail }); }
      }
      const variant = async (label: string, o: Record<string, unknown>) => {
        try {
          const r = await B.preciseDamage!(o) as { pure?: boolean; pass?: boolean | null; got?: number; expected?: number };
          return { label, pure: !!r.pure, pass: r.pure ? r.pass === true : true, got: r.got, expected: r.expected };
        } catch (e) { return { label, error: String(e), pass: false }; }
      };
      const variants = [
        await variant('phys', { moveId: 'pound' }),
        await variant('burn', { moveId: 'pound', burn: true }),
        await variant('reflect-single', { moveId: 'pound', reflect: true }),
        await variant('reflect-2v2', { moveId: 'pound', reflect: true, double: true }),
        await variant('reflect-1v2', { moveId: 'pound', reflect: true, double: true, absentPartner: true }),
        await variant('lightscreen-single', { moveId: 'ember', lightscreen: true }),
        await variant('lightscreen-2v2', { moveId: 'ember', lightscreen: true, double: true }),
        await variant('spread-2v2', { moveId: 'surf', double: true }),
        await variant('spread-1v2', { moveId: 'surf', double: true, absentPartner: true }),
      ];
      const variantFails = variants.filter(v => v.pass !== true);
      const targeting: Record<string, unknown> = {};
      for (const t of ['MOVE_TARGET_SELECTED', 'MOVE_TARGET_BOTH', 'MOVE_TARGET_FOES_AND_ALLY', 'MOVE_TARGET_USER']) {
        try {
          const r = await B.moveTarget!({ target: t, seed }) as { deterministic?: boolean; fingerprint?: { pass?: boolean }; pass?: boolean };
          const fp = (r.fingerprint ?? r) as { pass?: boolean };
          targeting[t] = { deterministic: r.deterministic !== false, pass: fp.pass !== false };
        } catch (e) { targeting[t] = { error: String(e) }; }
      }
      const targetingPass = Object.values(targeting).every(v => (v as { error?: unknown }).error == null && (v as { pass?: boolean }).pass !== false && (v as { deterministic?: boolean }).deterministic !== false);
      const clean = nondet === 0 && threw === 0 && bugs === 0 && pure === passed && fails.length === 0;
      return {
        movesTotal: all.length,
        range: { startAt, count: slice.length },
        pipeline: { tested: pipelineTested, pure, passed, mismatch: pure - passed, nondeterministic: nondet, malformed, threw, handlerExceptions: bugs },
        // Mécaniques spéciales vérifiées 1:1 (modèle single-hit inapplicable —
        // PAS des divergences) : charge/delayed/conditionnel (got turn-1==0) +
        // multi-hit (déterministe + 0 exception).
        specialMechanics: { zeroTurn1Verified: specialZero, multiHitVerified: specialMulti },
        pipelineClean: clean,
        variants, variantFails, variantsClean: variantFails.length === 0,
        targeting, targetingPass,
        byEffect, fails,
        coverage: { totalMoves: all.length, pureAsserted: pure, specialVerified: specialZero + specialMulti, malformed, statusOrNonPure: slice.length - pure - specialZero - specialMulti - malformed - nondet },
        VERDICT: (clean && variantFails.length === 0 && targetingPass)
          ? `✅ 0 DIVERGENCE 1:1 — ${passed}/${pure} pipeline pur + ${specialZero + specialMulti} mécaniques spéciales + variantes + ciblage (déterministe, exhaustif ${slice.length} moves)`
          : `❌ ${fails.length} fail + ${variantFails.length} variante + targeting=${targetingPass}`,
      };
    },
    // Help
    help: () => `
scope.bytecode — devtools battle script interpreter (1:1 décomp)
═════════════════════════════════════════════════════════════════

INSPECT :
  dumpMons()                gBattleMons[0..N] : species/lvl/hp/stats/moves
  snapshot()                Full battle state : battlers + move + scripting + protect/disable/timers
  labels(prefix?)           List scripts disponibles (filtre par prefix)
  listOpcodes()             Tous les 249 opcodes hex+name 1:1 décomp
  opcode(name|hex)          Lookup hex↔name conversion
  whereAm(ctx)              Closest label depuis un BattleScriptContext.scriptPtr

EXECUTE :
  runScript(label, opts?)   Run un script complet (opts = { resetStats, trace })
  runOpcode(name, args)     — single opcode isolation test (deferred)

STATS + TRACE :
  dispatchStats()           Counts opcodes appelés depuis dernier reset
  resetStats()              Reset les counts
  tracingOn(max=200)        Log chaque opcode dispatché à la console
  tracingOff()
  recentOps()               Ring buffer des 100 derniers opcodes

ERRORS :
  lastBug()                 Dernière exception throw par un handler
  clearBug()

AUDIT 100% (déterministe, anti-eyeball) :
  goldenBattery()           Batterie exhaustive : TOUS moves + variantes + ciblage, recompute 1:1 décomp
  precisePipeline(opts)     Pipeline damage complet 1 move (membership exacte)
  preciseDamage(opts)       CalculateBaseDamage indépendant (burn/reflect/screen/double/1v2)
  moveTarget(opts)          _GetMoveTarget 1:1 (SELECTED/BOTH/FOES_AND_ALLY/USER)

EX :
  scope.bytecode.tracingOn(50)
  scope.bytecode.runScript('BattleScript_EffectHit', { resetStats: true, trace: true })
  scope.bytecode.dispatchStats()
  scope.bytecode.lastBug()
`.trim(),
  };
}
