/**
 * include/pokemon.ts — miroir 1:1 de `decomp/include/pokemon.h` (surface header).
 *
 * Re-export des fonctions publiques de `pokemon.ts` + macros/constantes du header.
 * PORT INCRÉMENTAL : seules les surfaces déjà portées apparaissent (cf. pokemon.ts).
 */
import { HIHALF, LOHALF } from './global';

export {
  GetNatureFromPersonality,
  GetGenderFromSpeciesAndPersonality,
  IsShinyOtIdPersonality,
  ModifyStatByNature,
  gNatureStatTable,
  gStatStageRatios,
  NUM_NATURE_STATS,
} from '../src/pokemon';

/** 1:1 décomp `#define NUM_UNOWN_FORMS 28` (pokemon.h:362). */
export const NUM_UNOWN_FORMS = 28;

/** 1:1 décomp macro `GET_UNOWN_LETTER(personality)` (pokemon.h:364-369) :
 *  recompose 4 paires de bits du PID (bits 0-1, 8-9, 16-17, 24-25) en index 0..27. */
export function GET_UNOWN_LETTER(personality: number): number {
  return ((((personality & 0x03000000) >>> 18)
         | ((personality & 0x00030000) >>> 12)
         | ((personality & 0x00000300) >>> 6)
         | ((personality & 0x00000003) >>> 0)) >>> 0) % NUM_UNOWN_FORMS;
}

/** 1:1 décomp macro `GET_SHINY_VALUE(otId, personality)` (pokemon.h:371) :
 *  `HIHALF(otId) ^ LOHALF(otId) ^ HIHALF(personality) ^ LOHALF(personality)`. */
export function GET_SHINY_VALUE(otId: number, personality: number): number {
  return HIHALF(otId) ^ LOHALF(otId) ^ HIHALF(personality) ^ LOHALF(personality);
}
