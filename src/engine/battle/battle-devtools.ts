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
} from './state';
import { setupPartyForBattle, fillActiveBattleMonsForBattleStart } from './party-storage';
import { resetAtkCancelerTracker } from './atk-canceler';
import { runMoveScriptViaBytecode, drainBattleEventsAsText, clearBattleEventQueue, runEndTurnEffectsViaBytecode, runTurnStartCleanupViaBytecode, runBattleTurnPassedViaBytecode, runHandleFaintedMonActionsViaBytecode } from './wire-bytecode-bridge';
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
  const attacker = opts?.attacker ?? 0;
  const target = opts?.target ?? 1;
  const enemySpecies = opts?.enemySpecies ?? 'SPECIES_ZIGZAGOON';
  const enemyLevel = opts?.enemyLevel ?? 2;

  // Lazy imports pour break circular deps.
  const gs = (globalThis as { gameState?: { party?: unknown[] } }).gameState;
  if (!gs?.party) return { ok: false, reason: 'no gameState.party' };
  const realParty = (gs.party as Array<unknown>).filter((m): m is { speciesEnum: string } => !!m);
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
        // Use scope.party real one for attacker.
        const gs = (globalThis as { gameState?: { party?: unknown[] } }).gameState;
        const realParty = (gs?.party as Array<typeof attacker> | undefined)?.filter(m => !!m);
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

EX :
  scope.bytecode.tracingOn(50)
  scope.bytecode.runScript('BattleScript_EffectHit', { resetStats: true, trace: true })
  scope.bytecode.dispatchStats()
  scope.bytecode.lastBug()
`.trim(),
  };
}
