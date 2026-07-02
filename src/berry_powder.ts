/**
 * berry_powder.ts — Port 1:1 STRICT (MIROIR partiel) de `src/berry_powder.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/berry_powder.c`.
 *
 * Périmètre porté : `SetBerryPowder` + `DecryptBerryPowder` (consommés par le
 * seeding new-game ResetMiniGamesRecords + les specials Berry Powder du
 * registry). Le mini-jeu Berry Crush = feature link, chantier ultérieur.
 *
 * NB : la « poudre » est XOR-ée avec SB2.encryptionKey (anti-cheat GBA).
 * NewGameInitData pose encryptionKey = 0 et notre port ne re-chiffre jamais
 * (ApplyNewEncryptionKey* non porté) → XOR 0 = identité en pratique, mais le
 * corps reste le vrai.
 */

import { gSaveBlock2Ptr } from './engine/save/save-block-state';

/** 1:1 décomp `u32 DecryptBerryPowder(u32 *powder)` (berry_powder.c:128-131). */
export function DecryptBerryPowder(powder: number): number {
  return (powder ^ (gSaveBlock2Ptr.encryptionKey ?? 0)) >>> 0;
}

/** 1:1 décomp `void SetBerryPowder(u32 *powder, u32 amount)` (berry_powder.c:133-136) :
 *  *powder = amount ^ encryptionKey. Le « pointeur » du décomp vise toujours
 *  `gSaveBlock2Ptr->berryCrush.berryPowderAmount` (seul site) → écrit ce champ. */
export function SetBerryPowder(amount: number): void {
  gSaveBlock2Ptr.berryCrush.berryPowderAmount = (amount ^ (gSaveBlock2Ptr.encryptionKey ?? 0)) >>> 0;
}
