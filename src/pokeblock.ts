/**
 * pokeblock.ts — Port 1:1 STRICT (MIROIR partiel) de `src/pokeblock.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/pokeblock.c`.
 *
 * Périmètre porté : le SEEDING new-game (`ClearPokeblocks` + `ClearPokeblock`).
 * L'écran PokéblockCase (CB2_OpenPokeblockCase et sa chaîne UI) = item use
 * restant du chantier sac (tâche #15), gros écran à part.
 */

import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { POKEBLOCKS_COUNT } from '../include/constants/global';

/** 1:1 décomp `const s8 gPokeblockFlavorCompatibilityTable[NUM_NATURES * FLAVOR_COUNT]`
 *  (pokeblock.c:136-164). Indexé nature × FLAVOR_COUNT + flavor ; s8 : -1 (dislike),
 *  0 (neutre), +1 (like). Non-static dans le .c (extern lu par pokemon.c
 *  GetMonFlavorRelation/GetFlavorRelationByPersonality — cf. src/pokemon.ts).
 *  Oracle de fidélité : `scripts/audit-pokeblock-flavor.cjs`. */
export const gPokeblockFlavorCompatibilityTable: number[] = [
  // Spicy, Dry, Sweet, Bitter, Sour
   0,  0,  0,  0,  0, // 0 Hardy
   1,  0,  0,  0, -1, // 1 Lonely
   1,  0, -1,  0,  0, // 2 Brave
   1, -1,  0,  0,  0, // 3 Adamant
   1,  0,  0, -1,  0, // 4 Naughty
  -1,  0,  0,  0,  1, // 5 Bold
   0,  0,  0,  0,  0, // 6 Docile
   0,  0, -1,  0,  1, // 7 Relaxed
   0, -1,  0,  0,  1, // 8 Impish
   0,  0,  0, -1,  1, // 9 Lax
  -1,  0,  1,  0,  0, // 10 Timid
   0,  0,  1,  0, -1, // 11 Hasty
   0,  0,  0,  0,  0, // 12 Serious
   0, -1,  1,  0,  0, // 13 Jolly
   0,  0,  1, -1,  0, // 14 Naive
  -1,  1,  0,  0,  0, // 15 Modest
   0,  1,  0,  0, -1, // 16 Mild
   0,  1, -1,  0,  0, // 17 Quiet
   0,  0,  0,  0,  0, // 18 Bashful
   0,  1,  0, -1,  0, // 19 Rash
  -1,  0,  0,  1,  0, // 20 Calm
   0,  0,  0,  1, -1, // 21 Gentle
   0,  0, -1,  1,  0, // 22 Sassy
   0, -1,  0,  1,  0, // 23 Careful
   0,  0,  0,  0,  0, // 24 Quirky
];

/** 1:1 décomp `static void ClearPokeblock(u8 pkblId)` (pokeblock.c:1303-1312). */
function ClearPokeblock(pkblId: number): void {
  const pb = gSaveBlock1Ptr.pokeblocks[pkblId];
  pb.color = 0;
  pb.spicy = 0;
  pb.dry = 0;
  pb.sweet = 0;
  pb.bitter = 0;
  pb.sour = 0;
  pb.feel = 0;
}

/** 1:1 décomp `void ClearPokeblocks(void)` (pokeblock.c:1314-1320). */
export function ClearPokeblocks(): void {
  for (let i = 0; i < POKEBLOCKS_COUNT; i++) ClearPokeblock(i);
}

// 1:1 décomp `static EWRAM_DATA struct { u16 selectedRow; u16 scrollOffset; }
// sSavedPokeblockData` (pokeblock.c — position mémorisée du menu PokéblockCase).
const sSavedPokeblockData = { selectedRow: 0, scrollOffset: 0 };

/** 1:1 décomp `void ResetPokeblockScrollPositions(void)` (pokeblock.c:864-868).
 *  Appelé par ResetMenuAndMonGlobals (new_game.c:146). */
export function ResetPokeblockScrollPositions(): void {
  sSavedPokeblockData.selectedRow = 0;
  sSavedPokeblockData.scrollOffset = 0;
}
