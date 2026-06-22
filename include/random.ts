/**
 * include/random.ts — miroir 1:1 de `decomp/include/random.h`.
 *
 * Surface « header » du module random : les macros définies dans le .h
 * (ISO_RANDOMIZE1/2, Random32) + re-export des fonctions publiques de l'impl
 * (`../random.ts` = random.c). Un `#include "random.h"` côté décomp =
 * `import { … } from '@game/include/random'` côté miroir.
 *
 * Note convention : le petit cycle include/random ↔ random (l'impl importe la
 * macro ISO_RANDOMIZE1 d'ici ; ici on re-exporte Random pour Random32) est
 * BÉNIN — il n'échange que des fonctions, aucun code top-level → pas de deadlock
 * d'init ESM (≠ le cas rtc). C'est le pattern .h/.c standard du miroir.
 */

import { Random, Random2, SeedRng, SeedRng2 } from '../src/random';

// 1:1 décomp random.h:16 — `#define ISO_RANDOMIZE1(val) (1103515245 * (val) + 24691)`.
// Math.imul = multiplication u32 exacte ; `>>> 0` = cast unsigned 32-bit.
export function ISO_RANDOMIZE1(val: number): number {
  return (Math.imul(1103515245, val) + 24691) >>> 0;
}

// 1:1 décomp random.h:17 — `#define ISO_RANDOMIZE2(val) (1103515245 * (val) + 12345)`.
export function ISO_RANDOMIZE2(val: number): number {
  return (Math.imul(1103515245, val) + 12345) >>> 0;
}

// 1:1 décomp random.h:12 — `#define Random32() (Random() | (Random() << 16))`.
// L'ordre compte : low 16 bits = 1er Random(), high 16 = 2ème.
export function Random32(): number {
  return (Random() | (Random() << 16)) >>> 0;
}

export { Random, Random2, SeedRng, SeedRng2 };
