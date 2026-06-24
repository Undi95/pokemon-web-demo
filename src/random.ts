/**
 * random.ts — miroir 1:1 de `decomp/src/random.c`.
 *
 * RNG Gen-3 Émeraude. Source de vérité (NE JAMAIS diverger) :
 *   D:/Projet 1/decomps/pokeemeraude/src/random.c (+ include/random.h)
 *
 * Bug RNG Émeraude reproduit 1:1 : la ROM n'appelle PAS SeedRngWithRtc
 * (wrappé `#ifdef BUGFIX`) → gRngValue démarre à 0 (COMMON_DATA). Tous les
 * tirages (shiny/IV/EV/encounters/lottery) partent du même seed à chaque boot.
 * (User : « je la veux 1:1, glitch compris. »)
 *
 * gRngValue/gRng2Value sont `COMMON_DATA u32` (globals) dans la décomp ; ici
 * module-privés (tout l'accès passe par Random/SeedRng — fidèle au comportement).
 * Exposition globale (extern) à ajouter si un consommateur lit gRngValue direct.
 */

import { ISO_RANDOMIZE1 } from '../include/random';

// 1:1 décomp random.c:8-9 — COMMON_DATA u32 gRngValue/gRng2Value = 0.
let gRngValue = 0;
let gRng2Value = 0;
// 1:1 décomp random.c:4-5 — EWRAM_DATA static u8 sUnknown / u32 sRandCount = 0.
let sUnknown = 0;
let sRandCount = 0;

// 1:1 décomp random.c:11 — u16 Random(void).
export function Random(): number {
  gRngValue = ISO_RANDOMIZE1(gRngValue);
  sRandCount++;
  return (gRngValue >>> 16) & 0xFFFF;
}

// 1:1 décomp random.c:18 — void SeedRng(u16 seed).
export function SeedRng(seed: number): void {
  gRngValue = seed & 0xFFFF;
  sUnknown = 0;
}

// 1:1 décomp random.c:24 — void SeedRng2(u16 seed).
export function SeedRng2(seed: number): void {
  gRng2Value = seed & 0xFFFF;
}

// 1:1 décomp random.c:29 — u16 Random2(void). Utilise ISO_RANDOMIZE1 (pas _2 — 1:1).
export function Random2(): number {
  gRng2Value = ISO_RANDOMIZE1(gRng2Value);
  return (gRng2Value >>> 16) & 0xFFFF;
}

// ─── Debug (non-décomp ; lecture seule de l'état pour la console/tests) ──────
export function _rngDebug(): { gRngValue: number; gRng2Value: number; sRandCount: number } {
  return { gRngValue, gRng2Value, sRandCount };
}
export function _rngReset(): void {
  gRngValue = 0; gRng2Value = 0; sUnknown = 0; sRandCount = 0;
}

// Exposition dev (lecture seule de l'état RNG pour console/sondes déterministes).
(globalThis as Record<string, unknown>).__rngDebug = _rngDebug;
