/**
 * bag-item-effects.ts — 1:1-sémantique `PokemonUseItemEffects` (pokemon.c:4742)
 * ============================================================================
 * Applique l'effet d'un item Medicine (POTION/ANTIDOTE/REVIVE/FULL RESTORE/...)
 * sur un mon. Utilise `gItemEffectTable` byte format 1:1 décomp via
 * `getItemEffectBytes` + `GetItemEffectParamOffset` (battle/data/item-effects.ts).
 *
 * Couverture actuelle (= ce dont les Medicine ont besoin) :
 *  - byte[3] : cure status flags (ITEM3_CONFUSION/PARALYSIS/FREEZE/BURN/POISON/
 *    SLEEP) — clear `mon.status` si le bit correspondant est set ET le mon a
 *    le status.
 *  - byte[4] flag ITEM4_HEAL_HP (0x04) : heal HP de `bytes[GetItemEffect
 *    ParamOffset(itemId, 4, ITEM4_HEAL_HP)]` PV. Valeurs spéciales : 0xFF =
 *    full heal, 0xFE = half max, 0xFD = quarter max.
 *  - byte[4] flag ITEM4_REVIVE (0x40, combiné avec HEAL_HP) : revive mon KO.
 *
 *  Non couvert (à étendre quand on porte PPRecovery/PPUp/EV/RareCandy) :
 *  - byte[4] HEAL_PP / HEAL_PP_ONE / PP_UP / EV_HP/ATK/etc.
 *  - byte[5] EV stat / friendship boost / SACRED_ASH
 */

import type { PokemonInstance } from './pokemon';
import { getItemEffectBytes, GetItemEffectParamOffset } from './battle/data/item-effects';

// 1:1 décomp constants/item_effects.h
const ITEM3_CONFUSION = 1;
const ITEM3_PARALYSIS = 2;
const ITEM3_FREEZE = 4;
const ITEM3_BURN = 8;
const ITEM3_POISON = 16;
const ITEM3_SLEEP = 32;
const ITEM3_STATUS_ALL =
  ITEM3_CONFUSION | ITEM3_PARALYSIS | ITEM3_FREEZE | ITEM3_BURN | ITEM3_POISON | ITEM3_SLEEP;
const ITEM4_HEAL_HP = 4;
const ITEM4_REVIVE = 64;

/** Mapping mon.status (string FR-canonique) → bit ITEM3_*. */
const _STATUS_TO_ITEM3: Record<string, number> = {
  PSN: ITEM3_POISON,
  TOX: ITEM3_POISON,
  BRN: ITEM3_BURN,
  FRZ: ITEM3_FREEZE,
  PAR: ITEM3_PARALYSIS,
  SLP: ITEM3_SLEEP,
};

export interface MedicineResult {
  /** Quantité de PV restaurés (0 si aucun heal appliqué). */
  hpHealed: number;
  /** Vrai si un status a été retiré. */
  statusCured: boolean;
  /** Vrai si l'item n'aura aucun effet sur ce mon (= "X n'aura aucun effet."). */
  cannotUse: boolean;
}

/** 1:1-sémantique sous-ensemble `PokemonUseItemEffects` (pokemon.c:4742).
 *  Applique heal HP + cure status sur `mon` selon `itemId`. Le décomp passe
 *  par une struct Pokemon partyIndex/moveIndex — ici on prend directement
 *  un PokemonInstance et on mute en place (= writeback gameState.party). */
export function ApplyMedicineEffect(itemId: number, mon: PokemonInstance): MedicineResult {
  const bytes = getItemEffectBytes(itemId);
  if (!bytes) return { hpHealed: 0, statusCured: false, cannotUse: true };

  const byte3 = bytes[3] ?? 0;
  const byte4 = bytes[4] ?? 0;

  let hpHealed = 0;
  let statusCured = false;
  let cannotUse = true;

  // Cure status (byte[3] bits matching mon.status)
  if (byte3 & ITEM3_STATUS_ALL) {
    if (mon.status && _STATUS_TO_ITEM3[mon.status]) {
      const monStatusBit = _STATUS_TO_ITEM3[mon.status];
      if (byte3 & monStatusBit) {
        mon.status = null;
        statusCured = true;
        cannotUse = false;
      }
    }
  }

  // Heal HP / Revive (byte[4] flags)
  if (byte4 & ITEM4_HEAL_HP) {
    const isReviveItem = (byte4 & ITEM4_REVIVE) !== 0;
    const isKO = mon.currentHp === 0;

    if (isReviveItem) {
      // Revive : ne s'applique QUE sur mon KO.
      if (isKO) {
        const offset = GetItemEffectParamOffset(itemId, 4, ITEM4_HEAL_HP);
        let amount = bytes[offset] ?? 0;
        if (amount === 0xFF) amount = mon.maxHp;
        else if (amount === 0xFE) amount = Math.floor(mon.maxHp / 2);
        else if (amount === 0xFD) amount = Math.floor(mon.maxHp / 4);
        mon.currentHp = Math.min(amount, mon.maxHp);
        hpHealed = mon.currentHp;
        cannotUse = false;
      }
    } else {
      // HEAL_HP normal : ne s'applique PAS sur mon KO, ni si full HP.
      if (!isKO && mon.currentHp < mon.maxHp) {
        const offset = GetItemEffectParamOffset(itemId, 4, ITEM4_HEAL_HP);
        let amount = bytes[offset] ?? 0;
        if (amount === 0xFF) amount = mon.maxHp - mon.currentHp;
        else if (amount === 0xFE) amount = Math.floor(mon.maxHp / 2);
        else if (amount === 0xFD) amount = Math.floor(mon.maxHp / 4);
        const oldHp = mon.currentHp;
        mon.currentHp = Math.min(mon.currentHp + amount, mon.maxHp);
        hpHealed = mon.currentHp - oldHp;
        if (hpHealed > 0) cannotUse = false;
      }
    }
  }

  return { hpHealed, statusCured, cannotUse };
}
