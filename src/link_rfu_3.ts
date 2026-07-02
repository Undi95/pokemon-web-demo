/**
 * link_rfu_3.ts — Port 1:1 STRICT (MIROIR partiel) de `src/link_rfu_3.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/link_rfu_3.c`.
 *
 * Périmètre porté : `WipeTrainerNameRecords` (seeding new-game). Le reste du
 * fichier = pile RFU (wireless adapter GBA) — hardware link, exempt
 * ([[hardware-non-1to1-exemptions]]).
 */

import { gSaveBlock1Ptr } from './engine/save/save-block-state';

/** 1:1 décomp `void WipeTrainerNameRecords(void)` (link_rfu_3.c:976-985). */
export function WipeTrainerNameRecords(): void {
  for (let i = 0; i < gSaveBlock1Ptr.trainerNameRecords.length; i++) {
    gSaveBlock1Ptr.trainerNameRecords[i].trainerId = 0;
    gSaveBlock1Ptr.trainerNameRecords[i].trainerName = '';  // 1:1 CpuFill16(0, …)
  }
}
