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
} from './state';
import { runBattleScript, setupBattleScriptContext, getMoveEffectScriptOffset } from './script-interpreter';
import { resetAtkCancelerTracker } from './atk-canceler';
import { resolveDecompConstant } from '../decomp-constants';
import { getMove } from '../data/game-data';

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

/** 1:1 décomp resolveMoveId : dexId ("tackle") → "MOVE_TACKLE" → numeric. */
function _resolveMoveId(dexId: string): number {
  const enumStr = 'MOVE_' + dexId.toUpperCase().replace(/-/g, '_');
  const id = resolveDecompConstant(enumStr);
  return typeof id === 'number' ? id : 0;
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

/** Get move effect via faster path : direct dex id → getMove → effect. */
function _resolveMoveEffectFromDexId(dexId: string): number {
  const moveData = getMove('MOVE_' + dexId.toUpperCase().replace(/-/g, '_'));
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
} {
  const attBId = opts.attackerBattlerId ?? 0;
  const defBId = opts.defenderBattlerId ?? 1;
  const mv = opts.attacker.moves[opts.attackerMoveIdx];
  if (!mv) {
    return { ok: false, reason: 'no move at index', damage: 0, typeMul: 1, missed: true, fainted: false, bytecodeOpsCount: 0 };
  }
  const moveId = _resolveMoveId(mv.id);
  if (!moveId) {
    return { ok: false, reason: `move '${mv.id}' resolves to id 0`, damage: 0, typeMul: 1, missed: true, fainted: false, bytecodeOpsCount: 0 };
  }
  const effectId = _resolveMoveEffectFromDexId(mv.id);
  const scriptOffset = getMoveEffectScriptOffset(effectId);
  if (scriptOffset < 0) {
    return { ok: false, reason: `no script for effect ${effectId}`, damage: 0, typeMul: 1, missed: true, fainted: false, bytecodeOpsCount: 0 };
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
    return { ok: false, reason: 'setup ctx failed', damage: 0, typeMul: 1, missed: true, fainted: false, bytecodeOpsCount: 0 };
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

  const damage = defenderHpBefore - opts.defender.currentHp;
  const typeMul = _decodeTypeMulFromResultFlags(gMoveResultFlags);
  const missed = (gMoveResultFlags & (MOVE_RESULT_MISSED | MOVE_RESULT_FAILED)) !== 0;
  const fainted = opts.defender.currentHp <= 0;

  return {
    ok: true,
    damage,
    typeMul,
    missed,
    fainted,
    bytecodeOpsCount: iters,
  };
}

// Used to avoid unused-import warning.
void MOVE_RESULT_ONE_HIT_KO;
void MOVE_RESULT_FOE_ENDURED;
void MOVE_RESULT_FOE_HUNG_ON;
void _resolveMoveEffect;
void gBattleMoveDamage;
