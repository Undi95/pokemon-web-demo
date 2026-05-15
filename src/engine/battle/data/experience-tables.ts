/**
 * battle/data/experience-tables.ts — `gExperienceTables[]` 1:1 décomp.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/data/pokemon/experience_tables.h`.
 *
 * 6 growth groups × 101 levels (MAX_LEVEL = 100, indexed 0..100) = 606 entries.
 *
 * Computé à la volée à partir des formules décomp pour 1:1 strict (= pas de
 * risque de drift vs valeurs hardcoded).
 */

// ─── GROWTH_* enum (constants/pokemon.h:216-221) — 1:1 décomp ─────────────
export const GROWTH_MEDIUM_FAST = 0;
export const GROWTH_ERRATIC     = 1;
export const GROWTH_FLUCTUATING = 2;
export const GROWTH_MEDIUM_SLOW = 3;
export const GROWTH_FAST        = 4;
export const GROWTH_SLOW        = 5;

export const NUM_GROWTH_TABLES = 6;
export const MAX_LEVEL = 100;

// ─── Helpers macros 1:1 décomp ─────────────────────────────────────────────
function _CUBE(n: number): number { return n * n * n; }
function _SQUARE(n: number): number { return n * n; }

// EXP_SLOW(n) = (5 * n^3) / 4
function _EXP_SLOW(n: number): number { return Math.floor((5 * _CUBE(n)) / 4); }

// EXP_FAST(n) = (4 * n^3) / 5
function _EXP_FAST(n: number): number { return Math.floor((4 * _CUBE(n)) / 5); }

// EXP_MEDIUM_FAST(n) = n^3
function _EXP_MEDIUM_FAST(n: number): number { return _CUBE(n); }

// EXP_MEDIUM_SLOW(n) = (6*n^3)/5 - 15*n^2 + 100*n - 140
function _EXP_MEDIUM_SLOW(n: number): number {
  return Math.floor((6 * _CUBE(n)) / 5) - (15 * _SQUARE(n)) + (100 * n) - 140;
}

// EXP_ERRATIC(n) — 4 segments selon n
function _EXP_ERRATIC(n: number): number {
  if (n <= 50)  return Math.floor((100 - n) * _CUBE(n) / 50);
  if (n <= 68)  return Math.floor((150 - n) * _CUBE(n) / 100);
  if (n <= 98)  return Math.floor(Math.floor((1911 - 10 * n) / 3) * _CUBE(n) / 500);
  return Math.floor((160 - n) * _CUBE(n) / 100);
}

// EXP_FLUCTUATING(n) — 3 segments selon n
function _EXP_FLUCTUATING(n: number): number {
  if (n <= 15) return Math.floor((Math.floor((n + 1) / 3) + 24) * _CUBE(n) / 50);
  if (n <= 36) return Math.floor((n + 14) * _CUBE(n) / 50);
  return Math.floor((Math.floor(n / 2) + 32) * _CUBE(n) / 50);
}

// ─── Build des tables 1:1 décomp ───────────────────────────────────────────
function _buildTable(formula: (n: number) => number): Uint32Array {
  // Décomp : index 0 = 0, index 1 = 1 (hardcoded), index 2+ = formula(n).
  const table = new Uint32Array(MAX_LEVEL + 1);
  table[0] = 0;
  table[1] = 1;
  for (let n = 2; n <= MAX_LEVEL; n++) {
    table[n] = formula(n);
  }
  return table;
}

/** 1:1 décomp `gExperienceTables[NUM_GROWTH_TABLES][MAX_LEVEL + 1]`.
 *  Ordre : MEDIUM_FAST, ERRATIC, FLUCTUATING, MEDIUM_SLOW, FAST, SLOW. */
export const gExperienceTables: ReadonlyArray<Uint32Array> = [
  _buildTable(_EXP_MEDIUM_FAST),   // 0 GROWTH_MEDIUM_FAST
  _buildTable(_EXP_ERRATIC),       // 1 GROWTH_ERRATIC
  _buildTable(_EXP_FLUCTUATING),   // 2 GROWTH_FLUCTUATING
  _buildTable(_EXP_MEDIUM_SLOW),   // 3 GROWTH_MEDIUM_SLOW
  _buildTable(_EXP_FAST),          // 4 GROWTH_FAST
  _buildTable(_EXP_SLOW),          // 5 GROWTH_SLOW
];

/** Helper utility : pour un growth rate + level, retourne l'XP cumulé requis.
 *  Le mon doit avoir cumulé `gExperienceTables[growthRate][level]` XP pour
 *  atteindre `level`. */
export function getExpForLevel(growthRate: number, level: number): number {
  if (growthRate < 0 || growthRate >= NUM_GROWTH_TABLES) return 0;
  if (level < 0 || level > MAX_LEVEL) return 0;
  return gExperienceTables[growthRate][level];
}

/** Helper utility : retourne le niveau d'un mon pour un XP donné. Le décomp
 *  fait ce calcul plus haut dans la stack — voir `GetLevelFromBoxMonExp`. */
export function getLevelFromExp(growthRate: number, exp: number): number {
  if (growthRate < 0 || growthRate >= NUM_GROWTH_TABLES) return 1;
  const table = gExperienceTables[growthRate];
  // 1:1 décomp : level = highest level where table[level] <= exp.
  let level = MAX_LEVEL;
  while (level > 1 && table[level] > exp) level--;
  return level;
}
