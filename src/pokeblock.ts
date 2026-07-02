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
