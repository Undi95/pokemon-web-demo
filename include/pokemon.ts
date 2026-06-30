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
  IsMonShiny,
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

// ─── MON_DATA_* enum 1:1 décomp `include/pokemon.h:6..97` ─────────────────
// Foyer-header de l'enum mon-data (lu par GetMonData/SetMonData dans src/pokemon.ts).
// Co-localisé ici (= son vrai foyer 1:1) ; party-storage.ts le RE-EXPORTE pour compat
// (39 fichiers l'importent encore de là, inchangés).

export const MON_DATA_PERSONALITY = 0;
export const MON_DATA_OT_ID = 1;
export const MON_DATA_NICKNAME = 2;
export const MON_DATA_LANGUAGE = 3;
export const MON_DATA_SANITY_IS_BAD_EGG = 4;
export const MON_DATA_SANITY_HAS_SPECIES = 5;
export const MON_DATA_SANITY_IS_EGG = 6;
export const MON_DATA_OT_NAME = 7;
export const MON_DATA_MARKINGS = 8;
export const MON_DATA_CHECKSUM = 9;
export const MON_DATA_ENCRYPT_SEPARATOR = 10;
export const MON_DATA_SPECIES = 11;
export const MON_DATA_HELD_ITEM = 12;
export const MON_DATA_MOVE1 = 13;
export const MON_DATA_MOVE2 = 14;
export const MON_DATA_MOVE3 = 15;
export const MON_DATA_MOVE4 = 16;
export const MON_DATA_PP1 = 17;
export const MON_DATA_PP2 = 18;
export const MON_DATA_PP3 = 19;
export const MON_DATA_PP4 = 20;
export const MON_DATA_PP_BONUSES = 21;
export const MON_DATA_COOL = 22;
export const MON_DATA_BEAUTY = 23;
export const MON_DATA_CUTE = 24;
export const MON_DATA_EXP = 25;
export const MON_DATA_HP_EV = 26;
export const MON_DATA_ATK_EV = 27;
export const MON_DATA_DEF_EV = 28;
export const MON_DATA_SPEED_EV = 29;
export const MON_DATA_SPATK_EV = 30;
export const MON_DATA_SPDEF_EV = 31;
export const MON_DATA_FRIENDSHIP = 32;
export const MON_DATA_SMART = 33;
export const MON_DATA_POKERUS = 34;
export const MON_DATA_MET_LOCATION = 35;
export const MON_DATA_MET_LEVEL = 36;
export const MON_DATA_MET_GAME = 37;
export const MON_DATA_POKEBALL = 38;
export const MON_DATA_HP_IV = 39;
export const MON_DATA_ATK_IV = 40;
export const MON_DATA_DEF_IV = 41;
export const MON_DATA_SPEED_IV = 42;
export const MON_DATA_SPATK_IV = 43;
export const MON_DATA_SPDEF_IV = 44;
export const MON_DATA_IS_EGG = 45;
export const MON_DATA_ABILITY_NUM = 46;
export const MON_DATA_TOUGH = 47;
export const MON_DATA_SHEEN = 48;
export const MON_DATA_OT_GENDER = 49;
// 1:1 décomp pokemon.h:58-62 — 5 ribbons (= COOL/BEAUTY/CUTE/SMART/TOUGH) =
// indexes 50..54, pas 50..56 comme avant.
export const MON_DATA_COOL_RIBBON = 50;
export const MON_DATA_BEAUTY_RIBBON = 51;
export const MON_DATA_CUTE_RIBBON = 52;
export const MON_DATA_SMART_RIBBON = 53;
export const MON_DATA_TOUGH_RIBBON = 54;
// AUDIT BUG FIX : décalage de +2 sur tous les indexes après ribbons car on skip
// 2 ribbons en trop (50..56 → 50..54 = 5 ribbons).
export const MON_DATA_STATUS = 55;
export const MON_DATA_LEVEL = 56;
export const MON_DATA_HP = 57;
export const MON_DATA_MAX_HP = 58;
export const MON_DATA_ATK = 59;
export const MON_DATA_DEF = 60;
export const MON_DATA_SPEED = 61;
export const MON_DATA_SPATK = 62;
export const MON_DATA_SPDEF = 63;
export const MON_DATA_MAIL = 64;
export const MON_DATA_SPECIES_OR_EGG = 65;
export const MON_DATA_IVS = 66;
// 1:1 décomp pokemon.h:75-87 — 13 additional ribbons (CHAMPION..UNUSED) = 67..79.
export const MON_DATA_CHAMPION_RIBBON = 67;
export const MON_DATA_WINNING_RIBBON = 68;
export const MON_DATA_VICTORY_RIBBON = 69;
export const MON_DATA_ARTIST_RIBBON = 70;
export const MON_DATA_EFFORT_RIBBON = 71;
export const MON_DATA_MARINE_RIBBON = 72;
export const MON_DATA_LAND_RIBBON = 73;
export const MON_DATA_SKY_RIBBON = 74;
export const MON_DATA_COUNTRY_RIBBON = 75;
export const MON_DATA_NATIONAL_RIBBON = 76;
export const MON_DATA_EARTH_RIBBON = 77;
export const MON_DATA_WORLD_RIBBON = 78;
export const MON_DATA_UNUSED_RIBBONS = 79;
export const MON_DATA_MODERN_FATEFUL_ENCOUNTER = 80;
export const MON_DATA_KNOWN_MOVES = 81;
export const MON_DATA_RIBBON_COUNT = 82;
export const MON_DATA_RIBBONS = 83;
export const MON_DATA_ATK2 = 84;
export const MON_DATA_DEF2 = 85;
export const MON_DATA_SPEED2 = 86;
export const MON_DATA_SPATK2 = 87;
export const MON_DATA_SPDEF2 = 88;
