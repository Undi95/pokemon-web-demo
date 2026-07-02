/**
 * roamer.ts — Port 1:1 STRICT (MIROIR partiel) de `src/roamer.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/roamer.c`.
 *
 * Périmètre porté : le SEEDING new-game (`ClearRoamerData` +
 * `ClearRoamerLocationData`). Le système de déplacement du roamer
 * (CreateInitialRoamerMon, UpdateLocationHistoryForRoamer, TryStartRoamer…)
 * = post-Ligue (activé par GameClear), chantier ultérieur.
 *
 * `#define ROAMER (&gSaveBlock1Ptr->roamer)` (roamer.c:17).
 */

import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { SPECIES_LATIAS } from '../include/constants/species';

// 1:1 décomp roamer.c:14-15 (indices dans les paires [groupe, num]).
const MAP_GRP = 0;
const MAP_NUM = 1;

// 1:1 décomp roamer.c:18-19 — EWRAM statics (historique de position, non sauvé).
const sLocationHistory: number[][] = [[0, 0], [0, 0], [0, 0]];
const sRoamerLocation: number[] = [0, 0];

/** 1:1 décomp `void ClearRoamerData(void)` (roamer.c:64-68) :
 *  memset(ROAMER, 0, sizeof(*ROAMER)); ROAMER->species = SPECIES_LATIAS. */
export function ClearRoamerData(): void {
  const roamer = gSaveBlock1Ptr.roamer;
  roamer.ivs = 0;
  roamer.personality = 0;
  roamer.species = 0;
  roamer.hp = 0;
  roamer.level = 0;
  roamer.status = 0;
  roamer.cool = 0;
  roamer.beauty = 0;
  roamer.cute = 0;
  roamer.smart = 0;
  roamer.tough = 0;
  roamer.active = 0;
  roamer.species = SPECIES_LATIAS;
}

/** 1:1 décomp `void ClearRoamerLocationData(void)` (roamer.c:70-82). */
export function ClearRoamerLocationData(): void {
  for (let i = 0; i < sLocationHistory.length; i++) {
    sLocationHistory[i][MAP_GRP] = 0;
    sLocationHistory[i][MAP_NUM] = 0;
  }
  sRoamerLocation[MAP_GRP] = 0;
  sRoamerLocation[MAP_NUM] = 0;
}
