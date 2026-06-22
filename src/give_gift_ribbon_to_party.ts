/**
 * give_gift_ribbon_to_party.ts — miroir 1:1 STRICT de
 * `D:/Projet 1/decomps/pokeemeraude/src/give_gift_ribbon_to_party.c`.
 *
 * Donne un gift ribbon (MARINE..WORLD) à tous les Pokémon non-œuf de l'équipe,
 * stocke l'id du ruban dans `gSaveBlock1Ptr->giftRibbons[index]`, et lève
 * `FLAG_SYS_RIBBON_GET` si au moins un mon l'a reçu.
 *
 * Dépend de l'infra rubans portée dans party-storage.ts (SetMonData cases 72-78).
 * NB : non encore appelé (le script appelant n'est pas porté) — dette explicite,
 *      le fichier vit dans son miroir 1:1 comme dans la décomp.
 */

import {
  gPlayerParty, GetMonData, SetMonData, PARTY_SIZE,
  MON_DATA_SPECIES, MON_DATA_SANITY_IS_EGG,
  MON_DATA_MARINE_RIBBON, MON_DATA_LAND_RIBBON, MON_DATA_SKY_RIBBON,
  MON_DATA_COUNTRY_RIBBON, MON_DATA_NATIONAL_RIBBON, MON_DATA_EARTH_RIBBON,
  MON_DATA_WORLD_RIBBON,
} from './engine/battle/party-storage';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { FlagSet } from './engine/script/script-vars';

/** 1:1 décomp `GIFT_RIBBONS_COUNT` (include/constants/global.h). */
const GIFT_RIBBONS_COUNT = 11;
/** 1:1 décomp `MAX_GIFT_RIBBON` (include/constants/pokemon.h). */
const MAX_GIFT_RIBBON = 64;

/** 1:1 décomp `sGiftRibbonsMonDataIds[GIFT_RIBBONS_COUNT - 4]`
 *  (give_gift_ribbon_to_party.c:7-12) = les 7 MON_DATA des gift ribbons. */
const sGiftRibbonsMonDataIds: number[] = [
  MON_DATA_MARINE_RIBBON, MON_DATA_LAND_RIBBON, MON_DATA_SKY_RIBBON,
  MON_DATA_COUNTRY_RIBBON, MON_DATA_NATIONAL_RIBBON, MON_DATA_EARTH_RIBBON,
  MON_DATA_WORLD_RIBBON,
];

/** 1:1 décomp `GiveGiftRibbonToParty(u8 index, u8 ribbonId)`
 *  (give_gift_ribbon_to_party.c:14-38). */
export function GiveGiftRibbonToParty(index: number, ribbonId: number): void {
  let gotRibbon = false;

  if (index < GIFT_RIBBONS_COUNT && ribbonId <= MAX_GIFT_RIBBON) {
    if (gSaveBlock1Ptr.giftRibbons) gSaveBlock1Ptr.giftRibbons[index] = ribbonId;
    for (let i = 0; i < PARTY_SIZE; i++) {
      const mon = gPlayerParty[i];
      // 1:1 décomp : species != 0 && pas un œuf.
      if (GetMonData(mon, MON_DATA_SPECIES) !== 0 && GetMonData(mon, MON_DATA_SANITY_IS_EGG) === 0) {
        // 1:1 décomp `SetMonData(mon, array[index], &data=1)`. (index >= 7 = over-read
        // côté décomp ; chez nous undefined → no-op sûr ; les callers passent 0-6.)
        const dataId = sGiftRibbonsMonDataIds[index];
        if (dataId !== undefined) SetMonData(mon, dataId, 1);
        gotRibbon = true;
      }
    }
    if (gotRibbon) FlagSet('FLAG_SYS_RIBBON_GET');
  }
}
