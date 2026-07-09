/**
 * pokedex.ts — miroir 1:1 décomp `include/pokedex.h` (partiel : enums publics).
 *
 * Rapatrié de `engine/ui/pokedex-flags.ts` (unification miroir) : ces enums
 * vivent dans le HEADER décomp. Les *_DEX_COUNT sont les macros de
 * `include/constants/pokedex.h`, résolues 1:1 depuis l'enum auto-extrait
 * (AUCUN hardcode, cf. mémoire no-hardcoded-decomp-values).
 */

import {
  ENUM_NATIONAL_0, ENUM_HOENN_1,
  NATIONAL_DEX_COUNT_EXPR, KANTO_DEX_COUNT_EXPR, HOENN_DEX_COUNT_EXPR,
} from './constants/pokedex';

// ─── enum DexMode 1:1 (pokedex.h:9-11) ──────────────────────────────────────
export const DEX_MODE_HOENN = 0;
export const DEX_MODE_NATIONAL = 1;

// ─── enum FlagCase 1:1 (pokedex.h:13-19) ────────────────────────────────────
export const FLAG_GET_SEEN = 0;
export const FLAG_GET_CAUGHT = 1;
export const FLAG_SET_SEEN = 2;
export const FLAG_SET_CAUGHT = 3;

// ─── *_DEX_COUNT (include/constants/pokedex.h, macros résolues) ─────────────
const _NAT = ENUM_NATIONAL_0 as Record<string, number>;
const _HOE = ENUM_HOENN_1 as Record<string, number>;

/** 1:1 décomp `NATIONAL_DEX_COUNT` (= NATIONAL_DEX_DEOXYS = 386). */
export const NATIONAL_DEX_COUNT = _NAT[NATIONAL_DEX_COUNT_EXPR];
/** 1:1 décomp `KANTO_DEX_COUNT` (= NATIONAL_DEX_MEW = 151). */
export const KANTO_DEX_COUNT = _NAT[KANTO_DEX_COUNT_EXPR];
/** 1:1 décomp `HOENN_DEX_COUNT` (= HOENN_DEX_DEOXYS = 202). */
export const HOENN_DEX_COUNT = _HOE[HOENN_DEX_COUNT_EXPR];
