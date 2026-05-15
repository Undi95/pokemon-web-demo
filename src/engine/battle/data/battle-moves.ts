/**
 * battle/data/battle-moves.ts — 1:1 décomp `data/battle_moves.h` (= `gBattleMoves[]`).
 *
 * Source : `public/decomp/em/moves-data.json` (= extracted by extract-decomp-all.mjs
 * from `data/battle_moves.h`). 354 moves (MOVE_NONE..MOVE_PSYCHO_BOOST), keyed
 * par symbolic name "MOVE_X".
 *
 * Notre port reconstruit l'array indexé par u16 id (= 1:1 décomp `gBattleMoves[MOVE_X]`).
 *
 * Charged au boot via `loadBattleMoves()` (async fetch). Avant load : retourne
 * default empty entry (= power 0, type 0, accuracy 0).
 */

import { resolveDecompConstant } from '../../decomp-constants';

/** 1:1 décomp `struct BattleMove` (include/pokemon.h). */
export interface BattleMove {
  effect: number;
  power: number;
  type: number;
  accuracy: number;
  pp: number;
  secondaryEffectChance: number;
  target: number;
  priority: number;
  flags: number;
}

const EMPTY_MOVE: BattleMove = {
  effect: 0, power: 0, type: 0, accuracy: 0, pp: 0,
  secondaryEffectChance: 0, target: 0, priority: 0, flags: 0,
};

let _moves: BattleMove[] = [];
let _loaded = false;

interface RawMove {
  effect?: string | number;
  power?: number;
  type?: string | number;
  accuracy?: number;
  pp?: number;
  secondaryEffectChance?: number;
  target?: string | number;
  priority?: number;
  flags?: string | number;
}

/** Resolve "EFFECT_HIT" / 4 etc. via decomp-constants table. */
function _resolve(v: string | number | undefined, fallback = 0): number {
  if (v === undefined || v === null) return fallback;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    // OR pipe-separated flags : "FLAG_MAKES_CONTACT | FLAG_PROTECT_AFFECTED"
    if (v.includes('|')) {
      let out = 0;
      for (const tok of v.split('|')) {
        const t = tok.trim();
        const n = resolveDecompConstant(t);
        if (typeof n === 'number') out |= n;
      }
      return out;
    }
    // Symbolic name : lookup
    const resolved = resolveDecompConstant(v);
    if (typeof resolved === 'number') return resolved;
    // Numeric string fallback
    const n = parseInt(v, 10);
    if (!isNaN(n)) return n;
  }
  return fallback;
}

/** 1:1 décomp `gBattleMoves[move]` access. Returns EMPTY_MOVE si pas loaded
 *  ou move id out of bounds. */
export function getBattleMove(moveId: number): BattleMove {
  return _moves[moveId] ?? EMPTY_MOVE;
}

/** Load moves data from public/decomp/em/moves-data.json. */
export async function loadBattleMoves(): Promise<void> {
  if (_loaded) return;
  try {
    const resp = await fetch('/decomp/em/moves-data.json');
    if (!resp.ok) {
      console.warn(`[battle-moves] fetch failed : ${resp.status}`);
      return;
    }
    const raw = await resp.json() as Record<string, RawMove>;
    // Build array indexed by MOVE_X id.
    const maxId = 355;  // = MOVE_PSYCHO_BOOST + 1
    _moves = new Array(maxId).fill(null).map(() => ({ ...EMPTY_MOVE }));
    for (const [moveName, data] of Object.entries(raw)) {
      const id = resolveDecompConstant(moveName);
      if (typeof id !== 'number' || id < 0 || id >= maxId) {
        if (moveName !== 'MOVE_NONE') {
          console.warn(`[battle-moves] unknown move id for ${moveName}`);
        }
        continue;
      }
      _moves[id] = {
        effect: _resolve(data.effect),
        power: data.power ?? 0,
        type: _resolve(data.type),
        accuracy: data.accuracy ?? 0,
        pp: data.pp ?? 0,
        secondaryEffectChance: data.secondaryEffectChance ?? 0,
        target: _resolve(data.target),
        priority: data.priority ?? 0,
        flags: _resolve(data.flags),
      };
    }
    _loaded = true;
    console.log(`[battle-moves] loaded ${_moves.length} moves (= 1:1 décomp gBattleMoves)`);
  } catch (e) {
    console.error('[battle-moves] load failed', e);
  }
}

/** Expose pour devtools / debug. */
(globalThis as Record<string, unknown>).__battleMovesData = {
  get: (moveId: number) => getBattleMove(moveId),
  isLoaded: () => _loaded,
  count: () => _moves.length,
};
