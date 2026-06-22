/**
 * include/global.ts — miroir 1:1 de `decomp/include/global.h` (surface header).
 *
 * PORT INCRÉMENTAL : seules les macros déjà nécessaires sont portées.
 */

/** 1:1 décomp `#define HIHALF(n) (((n) & 0xFFFF0000) >> 16)` (global.h:106). */
export function HIHALF(n: number): number {
  return (n & 0xFFFF0000) >>> 16;
}

/** 1:1 décomp `#define LOHALF(n) ((n) & 0xFFFF)` (global.h:109). */
export function LOHALF(n: number): number {
  return n & 0xFFFF;
}
