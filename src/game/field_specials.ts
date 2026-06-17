// 1:1 mirror partiel de `src/field_specials.c` (pokeemerald) — état EWRAM partagé.
//
// Feuille volontairement SANS import lourd (évite les cycles ESM : `bike.ts` et
// `specials-registry.ts` y accèdent tous deux ; importer specials-registry depuis
// bike.ts tirait tout le graphe script-opcodes → TDZ `DIR_SOUTH` au boot).
//
// 1:1 décomp EWRAM_DATA (field_specials.c:78-80) :
//   `gBikeCyclingChallenge` (bool8), `gBikeCollisions` (u8), `sBikeCyclingTimer` (u32).
export const gBikeCycling = { challenge: 0, collisions: 0, timer: 0 };
