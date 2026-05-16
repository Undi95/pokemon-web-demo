/**
 * battle/wire-bytecode-bridge.ts — Bridge entre battle-flow.ts (= PokemonInstance
 * state machine ad-hoc) et le bytecode interpreter 1:1 décomp.
 *
 * Permet d'exécuter un move script bytecode 1:1 décomp à la place de la formule
 * damage simplifiée. Wire derrière le flag `__USE_BYTECODE_FOR_DAMAGE__`
 * (= localStorage / window var) pour A/B testing.
 *
 * Architecture :
 *   - Sync HP/status des PokemonInstance vers gBattleMons avant le run.
 *   - Setup gBattlerAttacker / gBattlerTarget / gCurrentMove.
 *   - Lookup script offset depuis BATTLE_SCRIPTS_FOR_MOVE_EFFECTS[move.effect].
 *   - Run le bytecode jusqu'à fin (= fastForward, no pause).
 *   - Sync gBattleMons HP back vers PokemonInstance.
 *   - Return { damage, typeMul, resultFlags } pour la state machine externe.
 *
 * Note : ce helper ne gère PAS l'UI (= text, animations). Le caller doit
 * afficher les messages via `ShowFieldMessage` après l'exécution. Phase 1.4 J/K/L
 * wired les controllers UI à des callbacks réels.
 */

import type { PokemonInstance } from '../pokemon';
import {
  gBattleMons,
  gBattleMoveDamage,
  gMoveResultFlags,
  gBattlerPartyIndexes,
  setBattlerAttacker,
  setBattlerTarget,
  setCurrentMove,
  setChosenMove,
  setHitMarker,
  setMoveResultFlags,
  setBattleOutcome,
  setBattleMoveDamage,
  setCritMultiplier,
  setCurrentActionFuncId,
} from './state';
import { runBattleScript, setupBattleScriptContext, getMoveEffectScriptOffset } from './script-interpreter';
import { resetAtkCancelerTracker } from './atk-canceler';
import { resolveDecompConstant } from '../decomp-constants';
import { getMove } from '../data/game-data';
import { Dex } from '@pkmn/dex';
import {
  dequeueBattleEvent,
  clearBattleEventQueue,
  getBattleEventQueueSize,
  CONTROLLER_PRINTSTRING,
  CONTROLLER_PRINTSTRINGPLAYERONLY,
  type BattleEvent,
} from './battle-event-queue';
import { decodeBattleString, stripGbaControlCodes } from './battle-string-decoder';

// ─── Move result decoding (= 1:1 décomp battle.h MOVE_RESULT_*) ──────────

/** 1:1 décomp `MOVE_RESULT_*` masks (battle.h). */
const MOVE_RESULT_MISSED                = 1 << 0;
const MOVE_RESULT_SUPER_EFFECTIVE       = 1 << 1;
const MOVE_RESULT_NOT_VERY_EFFECTIVE    = 1 << 2;
const MOVE_RESULT_DOESNT_AFFECT_FOE     = 1 << 3;
const MOVE_RESULT_ONE_HIT_KO            = 1 << 4;
const MOVE_RESULT_FAILED                = 1 << 5;
const MOVE_RESULT_FOE_ENDURED           = 1 << 6;
const MOVE_RESULT_FOE_HUNG_ON           = 1 << 7;

/** Decode gMoveResultFlags → typeMul équivalent simple (0/0.5/1/2). */
function _decodeTypeMulFromResultFlags(flags: number): number {
  if (flags & MOVE_RESULT_DOESNT_AFFECT_FOE) return 0;
  if (flags & MOVE_RESULT_SUPER_EFFECTIVE)   return 2;
  if (flags & MOVE_RESULT_NOT_VERY_EFFECTIVE) return 0.5;
  return 1;
}

// ─── Move id resolution from PokemonInstance.moves[i].id (dex string) ──

/** 1:1 décomp resolveMoveId : dexId ("blazekick") → cherche dans @pkmn/dex
 *  pour récup le name ("Blaze Kick") → reconstruct "MOVE_BLAZE_KICK" → numeric.
 *
 *  Avant : 'blazekick' → 'MOVE_BLAZEKICK' (= manqué l'underscore) → id 0.
 *  Maintenant : utilise Dex.moves.get(dexId).name pour split correctement. */
function _resolveMoveId(dexId: string): number {
  // Try direct first (= short single-word moves like "tackle" → MOVE_TACKLE).
  let enumStr = 'MOVE_' + dexId.toUpperCase().replace(/-/g, '_');
  let id = resolveDecompConstant(enumStr);
  if (typeof id === 'number' && id !== 0) return id;
  // Fall back : split via @pkmn/dex display name (= "blazekick" → "Blaze Kick"
  // → "MOVE_BLAZE_KICK"). Direct import = always available.
  try {
    const mv = Dex.moves.get(dexId);
    if (mv?.name) {
      enumStr = 'MOVE_' + mv.name.toUpperCase().replace(/[ '-]/g, '_').replace(/_+/g, '_');
      id = resolveDecompConstant(enumStr);
      if (typeof id === 'number' && id !== 0) return id;
    }
  } catch { /* fallthrough */ }
  return 0;
}

// ─── Effect resolution (= move's gBattleMoves[].effect → script label) ──

/** 1:1 décomp gBattleMoves[move].effect (EFFECT_HIT, EFFECT_SLEEP, etc.). */
function _resolveMoveEffect(moveId: number): number {
  // game-data uses MOVE_X enum keys; we have id, need to reverse lookup.
  // For most moves, getBattleMove(moveId).effect is the right path.
  // Try direct via game-data first.
  try {
    // Resolve numeric move id to enum name.
    const dataMod = (globalThis as { __game_data?: {
      moves?: Record<string, { effect?: string }>;
    } }).__game_data;
    if (!dataMod?.moves) return 0;
    // Scan moves for matching id (= slow but only at battle start).
    for (const [enumKey, mv] of Object.entries(dataMod.moves)) {
      const id = resolveDecompConstant(enumKey);
      if (id === moveId) {
        const effect = mv.effect ? resolveDecompConstant(mv.effect) : 0;
        return typeof effect === 'number' ? effect : 0;
      }
    }
  } catch { /* fallthrough */ }
  return 0;
}

/** Get move effect via faster path : direct dex id → getMove → effect.
 *  AUDIT BUG FIX : 'tailwhip' → 'MOVE_TAILWHIP' (= missing underscore) → no
 *  move data. Now : utilise Dex.moves.get(dexId).name pour split multi-word. */
function _resolveMoveEffectFromDexId(dexId: string): number {
  // Try direct first (single-word like "tackle" → MOVE_TACKLE).
  let moveData = getMove('MOVE_' + dexId.toUpperCase().replace(/-/g, '_'));
  if (!moveData) {
    // Fall back : split via @pkmn/dex display name.
    try {
      const mv = Dex.moves.get(dexId);
      if (mv?.name) {
        const enumStr = 'MOVE_' + mv.name.toUpperCase().replace(/[ '-]/g, '_').replace(/_+/g, '_');
        moveData = getMove(enumStr);
      }
    } catch { /* fallthrough */ }
  }
  if (!moveData) return 0;
  const effect = resolveDecompConstant(moveData.effect);
  return typeof effect === 'number' ? effect : 0;
}

// ─── Public API ─────────────────────────────────────────────────────────

/** Exécute un move via bytecode 1:1 décomp et retourne les outcomes mesurables.
 *
 *  Sync HP/status des PokemonInstance arguments vers gBattleMons avant + restore
 *  après. Sets gBattlerAttacker = attackerBattlerId (default 0 pour player).
 *
 *  Returns :
 *   - damage : HP perdus par defender (= défini par bytecode datahpupdate).
 *   - typeMul : 0 / 0.5 / 1 / 2 selon gMoveResultFlags après run.
 *   - missed : true si MOVE_RESULT_MISSED set (= miss/failed).
 *   - fainted : true si defender hp tombé à 0.
 *   - bytecodeOpsCount : nombre d'opcodes exécutés (debug).
 *
 *  Si script introuvable / move data manquante : retourne damage=0 missed=true.
 */
export function runMoveScriptViaBytecode(opts: {
  attacker: PokemonInstance;
  defender: PokemonInstance;
  attackerMoveIdx: number;
  attackerBattlerId?: number;  // 0 ou 2 (player). Default 0.
  defenderBattlerId?: number;  // 1 ou 3 (enemy). Default 1.
}): {
  ok: boolean;
  reason?: string;
  damage: number;
  typeMul: number;
  missed: boolean;
  fainted: boolean;
  bytecodeOpsCount: number;
  /** Messages décodés depuis les PRINTSTRING events. 1 entry par
   *  BtlController_EmitPrintString appelé pendant le bytecode. À show via
   *  ShowFieldMessage côté caller (= 1:1 décomp `BufferStringBattle`). */
  messages?: string[];
  /** Nombre total d'events bytecode enqueued (= debug). */
  eventsCount?: number;
} {
  const attBId = opts.attackerBattlerId ?? 0;
  const defBId = opts.defenderBattlerId ?? 1;
  // Clear queue avant chaque run pour éviter de mixer events cross-turn.
  clearBattleEventQueue();
  const mv = opts.attacker.moves[opts.attackerMoveIdx];
  if (!mv) {
    return { ok: false, reason: 'no move at index', damage: 0, typeMul: 1, missed: true, fainted: false, bytecodeOpsCount: 0, messages: [], eventsCount: 0 };
  }
  const moveId = _resolveMoveId(mv.id);
  if (!moveId) {
    return { ok: false, reason: `move '${mv.id}' resolves to id 0`, damage: 0, typeMul: 1, missed: true, fainted: false, bytecodeOpsCount: 0, messages: [], eventsCount: 0 };
  }
  const effectId = _resolveMoveEffectFromDexId(mv.id);
  const scriptOffset = getMoveEffectScriptOffset(effectId);
  if (scriptOffset < 0) {
    return { ok: false, reason: `no script for effect ${effectId}`, damage: 0, typeMul: 1, missed: true, fainted: false, bytecodeOpsCount: 0, messages: [], eventsCount: 0 };
  }

  // Sync state HP from PokemonInstance into gBattleMons.
  // Note : gBattleMons is assumed already filled with species/stats/etc. via
  // fillActiveBattleMonsForBattleStart at battle setup. This just refreshes HP
  // pour syncer entre les turns (= damage propagé par turn précédent).
  gBattleMons[attBId].hp = opts.attacker.currentHp;
  gBattleMons[defBId].hp = opts.defender.currentHp;
  const defenderHpBefore = opts.defender.currentHp;

  // Setup battle state vars for bytecode.
  setBattlerAttacker(attBId);
  setBattlerTarget(defBId);
  setCurrentMove(moveId);
  setChosenMove(moveId);
  setHitMarker(0);
  setMoveResultFlags(0);
  setBattleMoveDamage(0);
  setCritMultiplier(1);
  setCurrentActionFuncId(0);  // = B_ACTION_USE_MOVE (= continue current move).
  // 1:1 décomp : si gBattleOutcome != 0, attackcanceler retourne stayOnOpcode
  // infiniment. Reset à chaque turn (= simulate fresh battle context).
  setBattleOutcome(0);
  gBattlerPartyIndexes[attBId] = 0;
  gBattlerPartyIndexes[defBId] = 0;
  resetAtkCancelerTracker();

  // Sync PP : attacker move PP from PokemonInstance.
  for (let i = 0; i < 4; i++) {
    const m = opts.attacker.moves[i];
    if (m) {
      gBattleMons[attBId].pp[i] = m.pp;
    }
  }

  // Run bytecode (fastForward = re-call jusqu'à fin).
  const ctx = setupBattleScriptContext('BattleScript_EffectHit');
  if (!ctx) {
    return { ok: false, reason: 'setup ctx failed', damage: 0, typeMul: 1, missed: true, fainted: false, bytecodeOpsCount: 0, messages: [], eventsCount: 0 };
  }
  // Override scriptPtr to the actual move's effect script.
  ctx.scriptPtr = scriptOffset;

  let iters = 0;
  let opsCount = 0;
  let paused = runBattleScript(ctx);
  iters++;
  let lastPtr = ctx.scriptPtr;
  let stuck = 0;
  while (paused && iters < 200 && ctx.scriptPtr >= 0) {
    paused = runBattleScript(ctx);
    iters++;
    if (ctx.scriptPtr === lastPtr) {
      stuck++;
      if (stuck > 5) break;
    } else {
      stuck = 0;
      lastPtr = ctx.scriptPtr;
    }
  }
  void opsCount;

  // Sync gBattleMons HP back to PokemonInstance.
  opts.attacker.currentHp = gBattleMons[attBId].hp;
  opts.defender.currentHp = gBattleMons[defBId].hp;

  // Sync PP back.
  for (let i = 0; i < 4; i++) {
    const m = opts.attacker.moves[i];
    if (m && gBattleMons[attBId].pp[i] !== undefined) {
      m.pp = gBattleMons[attBId].pp[i];
    }
  }

  // Sync status1 back to PokemonInstance (= persist BURN/PSN/PAR/etc. au-delà
  // du combat). 1:1 décomp inverse mapping STATUS1_* → PSN/BRN/etc.
  _syncStatus1ToInstance(opts.attacker, gBattleMons[attBId].status1);
  _syncStatus1ToInstance(opts.defender, gBattleMons[defBId].status1);

  const damage = defenderHpBefore - opts.defender.currentHp;
  const typeMul = _decodeTypeMulFromResultFlags(gMoveResultFlags);
  const missed = (gMoveResultFlags & (MOVE_RESULT_MISSED | MOVE_RESULT_FAILED)) !== 0;
  const fainted = opts.defender.currentHp <= 0;

  // Drain le queue d'events bytecode produits par les BtlController_Emit*
  // appelés pendant runBattleScript. Decode les PRINTSTRING events en text
  // FR pour ShowFieldMessage côté caller.
  const messages: string[] = [];
  const allEvents: BattleEvent[] = [];
  while (getBattleEventQueueSize() > 0) {
    const ev = dequeueBattleEvent();
    if (!ev) break;
    allEvents.push(ev);
    if (ev.type === CONTROLLER_PRINTSTRING || ev.type === CONTROLLER_PRINTSTRINGPLAYERONLY) {
      const decoded = decodeBattleString(ev.stringId, ev.msgData);
      const clean = stripGbaControlCodes(decoded);
      if (clean.length > 0) messages.push(clean.trim());
    }
  }

  return {
    ok: true,
    damage,
    typeMul,
    missed,
    fainted,
    bytecodeOpsCount: iters,
    messages,
    eventsCount: allEvents.length,
  };
}

/** Drain TOUTE la queue d'events bytecode et decode les PRINTSTRING en text.
 *  Utile pour devtools (= scope.bytecode.drainEvents()) ou pour state machines
 *  qui veulent inspecter post-exec sans relancer le bytecode. */
export function drainBattleEventsAsText(): { messages: string[]; eventsCount: number; events: BattleEvent[] } {
  const messages: string[] = [];
  const events: BattleEvent[] = [];
  while (getBattleEventQueueSize() > 0) {
    const ev = dequeueBattleEvent();
    if (!ev) break;
    events.push(ev);
    if (ev.type === CONTROLLER_PRINTSTRING || ev.type === CONTROLLER_PRINTSTRINGPLAYERONLY) {
      const decoded = decodeBattleString(ev.stringId, ev.msgData);
      const clean = stripGbaControlCodes(decoded);
      if (clean.length > 0) messages.push(clean.trim());
    }
  }
  return { messages, eventsCount: events.length, events };
}

/** Re-export clear pour devtools et pour battle-flow.ts (= reset queue au début
 *  d'un nouveau turn pour éviter de mixer les events). */
export { clearBattleEventQueue };

// ─── Status1 sync helpers ──────────────────────────────────────────────

/** 1:1 décomp STATUS1_* bits → PokemonInstance.status string. Inverse de
 *  `_STATUS_TO_STATUS1` dans party-storage.ts. */
function _decodeStatus1(status1: number): 'PSN' | 'PAR' | 'BRN' | 'SLP' | 'FRZ' | 'TOX' | null {
  if (status1 === 0) return null;
  // SLEEP : bits 0-2 are the sleep counter, set if > 0.
  if (status1 & 0x07) return 'SLP';
  // TOXIC : bit 7 + bit 3 (= TOXIC_POISON | POISON). Check TOX first.
  if ((status1 & 0x80) && (status1 & 0x08)) return 'TOX';
  if (status1 & 0x08) return 'PSN';
  if (status1 & 0x10) return 'BRN';
  if (status1 & 0x20) return 'FRZ';
  if (status1 & 0x40) return 'PAR';
  return null;
}

/** Sync gBattleMons[X].status1 back to PokemonInstance.status. */
function _syncStatus1ToInstance(inst: PokemonInstance, status1: number): void {
  inst.status = _decodeStatus1(status1);
}

// Used to avoid unused-import warning.
void MOVE_RESULT_ONE_HIT_KO;
void MOVE_RESULT_FOE_ENDURED;
void MOVE_RESULT_FOE_HUNG_ON;
void _resolveMoveEffect;
void gBattleMoveDamage;
