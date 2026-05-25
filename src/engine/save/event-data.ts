/**
 * event-data.ts — Port 1:1 STRICT de `D:/Projet 1/decomps/pokeemeraude/src/event_data.c`.
 *
 * Source de vérité : `decomps/pokeemeraude/src/event_data.c`
 *
 * Fonctions portées : `IsNationalPokedexEnabled` (subset minimal — autres
 * fonctions ajoutées au besoin).
 */

import { gSaveBlock2Ptr } from '../gba-menu-system';
import { FlagGet, VarGet } from '../script/script-vars';

/** 1:1 décomp `bool32 IsNationalPokedexEnabled(void)` (event_data.c:74-80) :
 *  ```c
 *  if (gSaveBlock2Ptr->pokedex.nationalMagic == 0xDA
 *      && VarGet(VAR_NATIONAL_DEX) == 0x302
 *      && FlagGet(FLAG_SYS_NATIONAL_DEX))
 *      return TRUE;
 *  else
 *      return FALSE;
 *  ```
 */
export function IsNationalPokedexEnabled(): boolean {
  // 1:1 :76 trois conditions toutes vraies → TRUE.
  if (gSaveBlock2Ptr.pokedex.nationalMagic === 0xDA
    && VarGet('VAR_NATIONAL_DEX') === 0x302
    && FlagGet('FLAG_SYS_NATIONAL_DEX')) {
    return true;
  }
  return false;
}
