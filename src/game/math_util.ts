/**
 * math_util.ts — miroir 1:1 de `decomp/src/math_util.c` (+ include/math_util.h).
 *
 * Helpers fixed-point. Détails 1:1 STRICT reproduits :
 *  - Division ENTIÈRE C (`/` sur s32/s64) = troncature VERS ZÉRO → `Math.trunc`
 *    (PAS `Math.floor`, qui arrondirait vers -∞ pour les négatifs).
 *  - Retours `s16` = troncature 16-bit signée → `(v << 16) >> 16`.
 *  - Variantes 32-bit : intermédiaire `s64` dans la décomp → BigInt en JS (sinon
 *    `x*y` > 2^53 perd de la précision) ; retour `s32` via `BigInt.asIntN(32, …)`.
 *  - Inv* n'ont PAS de garde y==0 dans la décomp (UB) → on ne l'ajoute pas (1:1).
 */

// 1:1 décomp math_util.c:3 — s16 MathUtil_Mul16(s16 x, s16 y).
export function MathUtil_Mul16(x: number, y: number): number {
  let result = x;
  result *= y;
  result = Math.trunc(result / 256);
  return (result << 16) >> 16;
}

// 1:1 décomp math_util.c:13 — s16 MathUtil_Mul16Shift(u8 s, s16 x, s16 y).
export function MathUtil_Mul16Shift(s: number, x: number, y: number): number {
  let result = x;
  result *= y;
  result = Math.trunc(result / (1 << s));
  return (result << 16) >> 16;
}

// 1:1 décomp math_util.c:23 — s32 MathUtil_Mul32(s32 x, s32 y). s64 intermédiaire.
export function MathUtil_Mul32(x: number, y: number): number {
  const result = (BigInt(x) * BigInt(y)) / 256n;
  return Number(BigInt.asIntN(32, result));
}

// 1:1 décomp math_util.c:33 — s16 MathUtil_Div16(s16 x, s16 y).
export function MathUtil_Div16(x: number, y: number): number {
  if (y === 0) return 0;
  return (Math.trunc((x << 8) / y) << 16) >> 16;
}

// 1:1 décomp math_util.c:42 — s16 MathUtil_Div16Shift(u8 s, s16 x, s16 y).
export function MathUtil_Div16Shift(s: number, x: number, y: number): number {
  if (y === 0) return 0;
  return (Math.trunc((x << s) / y) << 16) >> 16;
}

// 1:1 décomp math_util.c:51 — s32 MathUtil_Div32(s32 x, s32 y). s64 intermédiaire.
export function MathUtil_Div32(x: number, y: number): number {
  if (y === 0) return 0;
  const _x = BigInt(x) * 256n;
  return Number(BigInt.asIntN(32, _x / BigInt(y)));
}

// 1:1 décomp math_util.c:64 — s16 MathUtil_Inv16(s16 y). (pas de garde y==0, 1:1.)
export function MathUtil_Inv16(y: number): number {
  const x = 0x10000;
  return (Math.trunc(x / y) << 16) >> 16;
}

// 1:1 décomp math_util.c:72 — s16 MathUtil_Inv16Shift(u8 s, s16 y).
export function MathUtil_Inv16Shift(s: number, y: number): number {
  const x = 0x100 << s;
  return (Math.trunc(x / y) << 16) >> 16;
}

// 1:1 décomp math_util.c:80 — s32 MathUtil_Inv32(s32 y). s64 intermédiaire.
export function MathUtil_Inv32(y: number): number {
  const x = 0x10000n;
  return Number(BigInt.asIntN(32, x / BigInt(y)));
}
