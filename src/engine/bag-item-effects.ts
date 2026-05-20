/**
 * bag-item-effects.ts — Port 1:1 sémantique `PokemonUseItemEffects`
 * (pokemon.c:4742-5291) + `GetItemEffectType` (party_menu.c:5250-5316).
 * ============================================================================
 * Applique l'effet d'un item Medicine/PPRecovery/PPUp/RareCandy/ReduceEV/
 * EvolutionStone sur un mon. Lit `gItemEffectTable` byte format 1:1 décomp
 * via `getItemEffectBytes` + `GetItemEffectParamOffset` (battle/data/item-
 * effects.ts).
 *
 * Branches battle-only ITEM0/ITEM1/ITEM2 (X-Item/Dire Hit) + ITEM3_GUARD_SPEC
 * + ITEM3_CONFUSION + ITEM5_FRIENDSHIP : portées partiellement (gMain.inBattle
 * = FALSE en field → skip silencieux ; friendship in-field = update direct).
 *
 * Pour POLISH 1:1 PERFECT futur (= LASTING_GLORY) : (1) HEAL_PP_ONE move-
 * selection window (le user choisit quel move heal vs "tous"), (2) animation
 * HP bar, (3) message FR par effectType complet (cure spécifique vs all-
 * status), (4) friendship sub-states.
 */

import type { PokemonInstance } from './pokemon';
import { getItemEffectBytes, GetItemEffectParamOffset } from './battle/data/item-effects';
import {
  ITEM3_CONFUSION, ITEM3_PARALYSIS, ITEM3_FREEZE, ITEM3_BURN, ITEM3_POISON,
  ITEM3_SLEEP, ITEM3_LEVEL_UP, ITEM3_GUARD_SPEC,
  ITEM4_EV_HP, ITEM4_EV_ATK, ITEM4_HEAL_HP, ITEM4_HEAL_PP, ITEM4_HEAL_PP_ONE,
  ITEM4_PP_UP, ITEM4_REVIVE, ITEM4_EVO_STONE,
  ITEM5_EV_DEF, ITEM5_EV_SPEED, ITEM5_EV_SPDEF, ITEM5_EV_SPATK, ITEM5_PP_MAX,
  ITEM5_FRIENDSHIP_LOW, ITEM5_FRIENDSHIP_MID, ITEM5_FRIENDSHIP_HIGH,
} from './decomp-data/auto/include/constants/item_effects-data';

// 1:1 décomp ITEM3_STATUS_ALL_EXPR
const ITEM3_STATUS_ALL =
  ITEM3_CONFUSION | ITEM3_PARALYSIS | ITEM3_FREEZE | ITEM3_BURN | ITEM3_POISON | ITEM3_SLEEP;

// 1:1 décomp constants/pokemon.h
const MAX_LEVEL = 100;
const MAX_TOTAL_EVS = 510;
const EV_ITEM_RAISE_LIMIT = 100;
const MAX_MON_MOVES = 4;
const _MAX_PP_BONUS = 3;  // 1:1 décomp pokemon.c: PP Up max = 3 (= +60% PP).

// 1:1 décomp `sGetMonDataEVConstants` (pokemon.c). Ordre des accès EV dans
// la boucle ITEM4 (cases 0-1) puis ITEM5 (cases 0-3 → +2 offset).
// Nous mappons directement aux clés de StatSpread.
// StatSpread uses Showdown-style keys : hp/atk/def/spa/spd/spe.
type EvKey = 'hp' | 'atk' | 'def' | 'spe' | 'spa' | 'spd';
const _EV_KEY_BY_ITEM4_BIT: Record<number, EvKey> = { 0: 'hp', 1: 'atk' };
const _EV_KEY_BY_ITEM5_BIT: Record<number, EvKey> = { 0: 'def', 1: 'spe', 2: 'spd', 3: 'spa' };

/** Mapping mon.status (string FR-canonique) → bit ITEM3_*. */
const _STATUS_TO_ITEM3: Record<string, number> = {
  PSN: ITEM3_POISON,
  TOX: ITEM3_POISON,
  BRN: ITEM3_BURN,
  FRZ: ITEM3_FREEZE,
  PAR: ITEM3_PARALYSIS,
  SLP: ITEM3_SLEEP,
};

/** 1:1 décomp `GetItemEffectType` (party_menu.c:5250). Retourne l'effet
 *  principal d'un item (= utilisé pour choisir le message FR + ItemUseCB_*
 *  approprié). */
export const ITEM_EFFECT_NONE = 0;
export const ITEM_EFFECT_X_ITEM = 1;
export const ITEM_EFFECT_HEAL_HP = 2;
export const ITEM_EFFECT_CURE_POISON = 3;
export const ITEM_EFFECT_CURE_SLEEP = 4;
export const ITEM_EFFECT_CURE_BURN = 5;
export const ITEM_EFFECT_CURE_FREEZE = 6;
export const ITEM_EFFECT_CURE_PARALYSIS = 7;
export const ITEM_EFFECT_CURE_CONFUSION = 8;
export const ITEM_EFFECT_CURE_INFATUATION = 9;
export const ITEM_EFFECT_CURE_ALL_STATUS = 11;
export const ITEM_EFFECT_HEAL_PP = 12;
export const ITEM_EFFECT_HP_EV = 13;
export const ITEM_EFFECT_ATK_EV = 14;
export const ITEM_EFFECT_DEF_EV = 15;
export const ITEM_EFFECT_SPATK_EV = 16;
export const ITEM_EFFECT_SPDEF_EV = 17;
export const ITEM_EFFECT_SPEED_EV = 18;
export const ITEM_EFFECT_PP_UP = 19;
export const ITEM_EFFECT_PP_MAX = 20;
export const ITEM_EFFECT_EVO_STONE = 21;
export const ITEM_EFFECT_RAISE_LEVEL = 22;
export const ITEM_EFFECT_SACRED_ASH = 23;

export function GetItemEffectType(itemId: number): number {
  const bytes = getItemEffectBytes(itemId);
  if (!bytes) return ITEM_EFFECT_NONE;
  const b0 = bytes[0] ?? 0;
  const b1 = bytes[1] ?? 0;
  const b2 = bytes[2] ?? 0;
  const b3 = bytes[3] ?? 0;
  const b4 = bytes[4] ?? 0;
  const b5 = bytes[5] ?? 0;
  // 1:1 :5264-5269
  // X-Item / Dire Hit / Guard Spec (battle-only). ITEM0_DIRE_HIT = 0x10,
  // ITEM0_X_ATTACK = 0x0F.
  const ITEM0_DIRE_HIT_OR_X_ATTACK = 0x10 | 0x0F;
  if ((b0 & ITEM0_DIRE_HIT_OR_X_ATTACK) || b1 || b2 || (b3 & ITEM3_GUARD_SPEC))
    return ITEM_EFFECT_X_ITEM;
  // Note 1:1 décomp `GetItemEffectType` (party_menu.c:5250) ne retourne JAMAIS
  // ITEM_EFFECT_SACRED_ASH (le check :4249 est dead code). ITEM0_SACRED_ASH
  // (b0 bit 6 = 0x40) est dispatché via fieldUseFunc = ItemUseOutOfBattle_
  // SacredAsh, pas via GetItemEffectType. ITEM0_INFATUATION (b0 bit 7 = 0x80)
  // tombe dans la branche statusCure ci-dessous (= CURE_INFATUATION).
  if (b3 & ITEM3_LEVEL_UP) return ITEM_EFFECT_RAISE_LEVEL;
  // 1:1 :5271-5289 cure status
  const statusCure = b3 & ITEM3_STATUS_ALL;
  if (statusCure || (b0 >> 7)) {
    if (statusCure === ITEM3_SLEEP) return ITEM_EFFECT_CURE_SLEEP;
    if (statusCure === ITEM3_POISON) return ITEM_EFFECT_CURE_POISON;
    if (statusCure === ITEM3_BURN) return ITEM_EFFECT_CURE_BURN;
    if (statusCure === ITEM3_FREEZE) return ITEM_EFFECT_CURE_FREEZE;
    if (statusCure === ITEM3_PARALYSIS) return ITEM_EFFECT_CURE_PARALYSIS;
    if (statusCure === ITEM3_CONFUSION) return ITEM_EFFECT_CURE_CONFUSION;
    if ((b0 >> 7) && !statusCure) return ITEM_EFFECT_CURE_INFATUATION;
    return ITEM_EFFECT_CURE_ALL_STATUS;
  }
  // 1:1 :5292-5313 HP/EV/PP
  if (b4 & (ITEM4_REVIVE | ITEM4_HEAL_HP)) return ITEM_EFFECT_HEAL_HP;
  if (b4 & ITEM4_EV_ATK) return ITEM_EFFECT_ATK_EV;
  if (b4 & ITEM4_EV_HP)  return ITEM_EFFECT_HP_EV;
  if (b5 & ITEM5_EV_SPATK) return ITEM_EFFECT_SPATK_EV;
  if (b5 & ITEM5_EV_SPDEF) return ITEM_EFFECT_SPDEF_EV;
  if (b5 & ITEM5_EV_SPEED) return ITEM_EFFECT_SPEED_EV;
  if (b5 & ITEM5_EV_DEF) return ITEM_EFFECT_DEF_EV;
  if (b4 & ITEM4_EVO_STONE) return ITEM_EFFECT_EVO_STONE;
  if (b4 & ITEM4_PP_UP) return ITEM_EFFECT_PP_UP;
  if (b5 & ITEM5_PP_MAX) return ITEM_EFFECT_PP_MAX;
  if (b4 & (ITEM4_HEAL_PP | ITEM4_HEAL_PP_ONE)) return ITEM_EFFECT_HEAL_PP;
  return ITEM_EFFECT_NONE;
}

export interface ItemEffectResult {
  /** 1:1 décomp `retVal` (= bool8 retourné par PokemonUseItemEffects). TRUE
   *  = cannot use (rien ne s'est passé), FALSE = effet appliqué. */
  cannotUse: boolean;
  // Détails pour message FR caller :
  hpHealed: number;
  statusCured: boolean;
  /** PP healed par move slot (= -1 si pas modifié). */
  ppRecoveredBySlot: number[];
  /** PP_Up appliqué sur ce slot move (= true ssi temp1 == case PP_UP réussie). */
  ppUpAppliedSlot: number;  // -1 si pas appliqué, sinon = moveIndex
  /** PP_Max appliqué sur ce slot move. */
  ppMaxAppliedSlot: number;
  evChanged: boolean;
  /** {hp:+10, atk:-5} (ou vide). */
  evDelta: Partial<Record<EvKey, number>>;
  leveledUp: boolean;
  /** Nouveau level si levelup. */
  newLevel: number;
  /** Si EvolutionStone et target existe (= déclencher BeginEvolutionScene).
   *  Pas porté — retourne null (= treated as cannotUse). */
  evolved: boolean;
  /** Sub-cas pour CURE_INFATUATION via b0>>7. */
  cureInfatuation: boolean;
}

function _makeResult(): ItemEffectResult {
  return {
    cannotUse: true,
    hpHealed: 0,
    statusCured: false,
    ppRecoveredBySlot: [-1, -1, -1, -1],
    ppUpAppliedSlot: -1,
    ppMaxAppliedSlot: -1,
    evChanged: false,
    evDelta: {},
    leveledUp: false,
    newLevel: 0,
    evolved: false,
    cureInfatuation: false,
  };
}

/** Compute total EVs sum (1:1 décomp `GetMonEVCount`). */
function _getMonEVCount(mon: PokemonInstance): number {
  return mon.evs.hp + mon.evs.atk + mon.evs.def + mon.evs.spe + mon.evs.spa + mon.evs.spd;
}

/** Get `ppBonuses` stored on mon (= 8-bit field, 2 bits par move slot).
 *  Pas dans PokemonInstance par défaut → utilise `_ppBonuses` extension
 *  (back-compat : 0 si absent). */
function _getPpBonuses(mon: PokemonInstance): number {
  return ((mon as unknown as { _ppBonuses?: number })._ppBonuses ?? 0) & 0xFF;
}
function _setPpBonuses(mon: PokemonInstance, value: number): void {
  (mon as unknown as { _ppBonuses?: number })._ppBonuses = value & 0xFF;
}

/** 1:1 décomp `gPPUpGetMask` (pokemon.c:1245).
 *  `[0x03, 0x0C, 0x30, 0xC0]`. */
const _PP_UP_GET_MASK = [0x03, 0x0C, 0x30, 0xC0];
const _PP_UP_CLEAR_MASK = [0xFC, 0xF3, 0xCF, 0x3F];
const _PP_UP_ADD_VALUES = [0x01, 0x04, 0x10, 0x40];

/** 1:1 décomp `CalculatePPWithBonus(move, bonus, moveIndex)` (pokemon.c:5005)
 *  : basePP + bonusPP, bonusPP = basePP * bonusBits / 5 (= ROUND DOWN).
 *  En l'absence de basePP par-move (= move dict externe), on dérive depuis
 *  ppMax (= deja stocké sur PokemonInstance, set à create) sans PP_Up
 *  appliqué. Donc : basePP = ppMax / (1 + bonus*0.2) reverse-calc. */
function _calculatePPWithBonus(mon: PokemonInstance, moveIndex: number, ppBonuses: number): number {
  const move = mon.moves[moveIndex];
  if (!move) return 0;
  // basePP heuristique : ppMax actuel peut DÉJÀ inclure des bonus. On stocke
  // donc `_basePP` à la création (= immutable basePP), et on dérive le total
  // avec le bonus courant.
  const monExt = mon as unknown as { _basePPPerSlot?: number[] };
  if (!monExt._basePPPerSlot) {
    // Snapshot ppMax → basePP (= au premier appel, on assume aucun bonus).
    monExt._basePPPerSlot = mon.moves.map(m => m?.ppMax ?? 0);
  }
  const basePP = monExt._basePPPerSlot[moveIndex] ?? move.ppMax;
  const currentBonusBits = (ppBonuses & _PP_UP_GET_MASK[moveIndex]) >> (moveIndex * 2);
  // 1:1 formule décomp `bonusPP = (basePP * 20 * bonusBits) / 100`.
  return basePP + Math.floor((basePP * 20 * currentBonusBits) / 100);
}

/** Compute current EV value by EvKey. */
function _getEv(mon: PokemonInstance, key: EvKey): number {
  return (mon.evs as unknown as Record<EvKey, number>)[key];
}
function _setEv(mon: PokemonInstance, key: EvKey, value: number): void {
  (mon.evs as unknown as Record<EvKey, number>)[key] = value;
}

/** ITEM6_HEAL_HP_FULL = (u8) -1, _HALF = -2, _LVL_UP = -3 (décomp item_
 *  effects.h:46-50). Comme byte → 0xFF, 0xFE, 0xFD. */
const ITEM6_HEAL_HP_FULL = 0xFF;
const ITEM6_HEAL_HP_HALF = 0xFE;
const ITEM6_HEAL_HP_LVL_UP = 0xFD;

/** 1:1-sem `PokemonUseItemEffects(mon, item, partyIndex, moveIndex, FALSE)`
 *  (= ExecuteTableBasedItemEffect_ in field). Mute `mon` en place.
 *  Battle stuff skip (gMain.inBattle=FALSE en field). */
export function PokemonUseItemEffects(
  mon: PokemonInstance,
  itemId: number,
  moveIndex: number,
): ItemEffectResult {
  const result = _makeResult();
  const bytes = getItemEffectBytes(itemId);
  if (!bytes) return result;  // cannotUse=true par défaut

  // 1:1 :4817 main loop sur les 6 first bytes (ITEM0..ITEM5).
  for (let i = 0; i < 6; i++) {
    const b = bytes[i] ?? 0;
    switch (i) {
      case 0:
        // 1:1 :4823-4849 — battle-only (Dire Hit, X Attack). Skip silent.
        // Note : ITEM0_SACRED_ASH (= b0 bit 7) traitée en party_menu.c
        // (= notre SacredAsh handler dans item-use-callbacks). Ici aussi.
        // ITEM0_INFATUATION = battle-only (status2 du battler). Skip.
        break;
      case 1:
      case 2:
        // 1:1 :4851-4894 — battle-only X_DEFEND/X_SPEED/X_ACC/X_SPATK. Skip.
        break;
      case 3:
        // 1:1 :4896-4938 ITEM3 effects.
        if ((b & ITEM3_GUARD_SPEC) /* battle-only */) {
          // skip silent
        }
        if ((b & ITEM3_LEVEL_UP) && mon.level !== MAX_LEVEL) {
          // 1:1 :4906-4914 Rare Candy : SetMonData(EXP, exp[level+1]).
          // Plus CalculateMonStats. Notre applyExpAward fait ça naturellement.
          const dataMod = (globalThis as { __game_data?: {
            getExperienceForLevel: (rate: string, lvl: number) => number;
            getSpeciesInfo: (k: string) => { stats?: { hp: number } } | undefined;
          } }).__game_data;
          if (dataMod && mon.growthRate) {
            const expForNext = dataMod.getExperienceForLevel(mon.growthRate, mon.level + 1);
            const expDelta = expForNext - (mon.currentExp ?? 0);
            if (expDelta > 0) {
              mon.currentExp = expForNext;
              // Recalc maxHp + level
              const oldMaxHp = mon.maxHp;
              const oldLevel = mon.level;
              mon.level++;
              // CalculateMonStats : recalc maxHp from new level.
              const baseHp = dataMod.getSpeciesInfo(mon.speciesEnum)?.stats?.hp ?? 50;
              const ivHp = mon.ivs.hp;
              const evHp = mon.evs.hp;
              // Standard Gen 3 HP formula.
              mon.maxHp = baseHp === 1
                ? 1  // SHEDINJA
                : Math.floor(((2 * baseHp + ivHp + Math.floor(evHp / 4)) * mon.level) / 100) + mon.level + 10;
              const hpDelta = mon.maxHp - oldMaxHp;
              if (hpDelta > 0) mon.currentHp += hpDelta;
              result.leveledUp = true;
              result.newLevel = mon.level;
              result.cannotUse = false;
              void oldLevel;
            }
          }
        }
        // 1:1 :4917-4937 cure status (SLEEP/POISON/BURN/FREEZE/PARALYSIS).
        if ((b & ITEM3_STATUS_ALL) && mon.status && _STATUS_TO_ITEM3[mon.status]) {
          const monBit = _STATUS_TO_ITEM3[mon.status];
          if (b & monBit) {
            mon.status = null;
            result.statusCured = true;
            result.cannotUse = false;
          }
        }
        // 1:1 :4932-4937 cure confusion (battle-only via STATUS2). Skip field.
        break;
      case 4: {
        // 1:1 :4940-5180 ITEM4 effects. Loop bits.
        let effectFlags = b;
        let paramOffset = 6;  // ITEM_EFFECT_ARG_START
        // 1:1 :4945-4960 PP_UP first (= cleared from effectFlags).
        if (effectFlags & ITEM4_PP_UP) {
          effectFlags = effectFlags & ~ITEM4_PP_UP & 0xFF;
          const move = mon.moves[moveIndex];
          if (move) {
            const ppBonuses = _getPpBonuses(mon);
            const currentBonus = (ppBonuses & _PP_UP_GET_MASK[moveIndex]) >> (moveIndex * 2);
            const totalPP = _calculatePPWithBonus(mon, moveIndex, ppBonuses);
            if (currentBonus <= 2 && totalPP > 4) {
              // 1:1 :4952-4958 : applique +1 bonus + heal différentiel PP.
              const newBonuses = ppBonuses + _PP_UP_ADD_VALUES[moveIndex];
              _setPpBonuses(mon, newBonuses);
              const newTotalPP = _calculatePPWithBonus(mon, moveIndex, newBonuses);
              const ppDiff = newTotalPP - totalPP;
              move.pp = Math.min(move.pp + ppDiff, newTotalPP);
              move.ppMax = newTotalPP;
              result.ppUpAppliedSlot = moveIndex;
              result.cannotUse = false;
            }
          }
        }
        // 1:1 :4964-5179 loop sur les bits restants.
        let temp1 = 0;
        while (effectFlags !== 0) {
          if (effectFlags & 1) {
            switch (temp1) {
              case 0: // ITEM4_EV_HP
              case 1: { // ITEM4_EV_ATK
                const key = _EV_KEY_BY_ITEM4_BIT[temp1];
                const evCount = _getMonEVCount(mon);
                const param = bytes[paramOffset] ?? 0;
                const ev = _getEv(mon, key);
                const evChange = (param << 24) >> 24;  // signed s8
                let appliedChange = evChange;
                if (evChange > 0) {
                  if (evCount >= MAX_TOTAL_EVS) return result;
                  if (ev >= EV_ITEM_RAISE_LIMIT) { paramOffset++; break; }
                  // Limit the increase
                  if (ev + evChange > EV_ITEM_RAISE_LIMIT)
                    appliedChange = EV_ITEM_RAISE_LIMIT - ev;
                  if (evCount + appliedChange > MAX_TOTAL_EVS)
                    appliedChange += MAX_TOTAL_EVS - (evCount + appliedChange);
                  _setEv(mon, key, ev + appliedChange);
                } else {
                  if (ev === 0) {
                    // No EVs to lose, friendship update only
                    paramOffset++;
                    break;
                  }
                  let newEv = ev + evChange;
                  if (newEv < 0) newEv = 0;
                  _setEv(mon, key, newEv);
                  appliedChange = newEv - ev;  // négatif
                }
                result.evDelta[key] = appliedChange;
                result.evChanged = true;
                result.cannotUse = false;
                paramOffset++;
                // CalculateMonStats : skip (notre maxHp se recalc à la prochaine
                // ouverture summary/party = OK pour 1ère itération).
                break;
              }
              case 2: { // ITEM4_HEAL_HP
                const isRevive = (effectFlags & (ITEM4_REVIVE >> 2)) !== 0;
                if (isRevive) {
                  if (mon.currentHp !== 0) { paramOffset++; break; }
                } else {
                  if (mon.currentHp === 0) { paramOffset++; break; }
                }
                let amount = bytes[paramOffset++] ?? 0;
                if (amount === ITEM6_HEAL_HP_FULL)
                  amount = mon.maxHp - mon.currentHp;
                else if (amount === ITEM6_HEAL_HP_HALF)
                  amount = Math.max(1, Math.floor(mon.maxHp / 2));
                else if (amount === ITEM6_HEAL_HP_LVL_UP)
                  amount = 0;  // gBattleScripting.levelUpHP (= battle-only)
                if (mon.currentHp !== mon.maxHp) {
                  const newHp = Math.min(mon.currentHp + amount, mon.maxHp);
                  result.hpHealed = newHp - mon.currentHp;
                  mon.currentHp = newHp;
                  result.cannotUse = false;
                }
                effectFlags = effectFlags & ~(ITEM4_REVIVE >> 2) & 0xFF;
                break;
              }
              case 3: { // ITEM4_HEAL_PP
                const isPpOne = (effectFlags & (ITEM4_HEAL_PP_ONE >> 3)) !== 0;
                if (!isPpOne) {
                  // Heal PP for all moves
                  const ppBonuses = _getPpBonuses(mon);
                  const healAmount = bytes[paramOffset] ?? 0;
                  for (let m = 0; m < MAX_MON_MOVES; m++) {
                    const move = mon.moves[m];
                    if (!move) continue;
                    const totalPP = _calculatePPWithBonus(mon, m, ppBonuses);
                    if (move.pp !== totalPP) {
                      const newPp = Math.min(move.pp + healAmount, totalPP);
                      result.ppRecoveredBySlot[m] = newPp - move.pp;
                      move.pp = newPp;
                      result.cannotUse = false;
                    }
                  }
                  paramOffset++;
                } else {
                  // Heal PP for one move
                  const move = mon.moves[moveIndex];
                  if (move) {
                    const ppBonuses = _getPpBonuses(mon);
                    const totalPP = _calculatePPWithBonus(mon, moveIndex, ppBonuses);
                    if (move.pp !== totalPP) {
                      const healAmount = bytes[paramOffset++] ?? 0;
                      const newPp = Math.min(move.pp + healAmount, totalPP);
                      result.ppRecoveredBySlot[moveIndex] = newPp - move.pp;
                      move.pp = newPp;
                      result.cannotUse = false;
                    }
                  }
                }
                break;
              }
              case 7: {  // ITEM4_EVO_STONE
                // 1:1 :5164-5174 :
                //     targetSpecies = GetEvolutionTargetSpecies(mon, EVO_MODE_ITEM_USE, item);
                //     if (targetSpecies != SPECIES_NONE) {
                //         BeginEvolutionScene(mon, targetSpecies, FALSE, partyIndex);
                //         return FALSE;
                //     }
                // Pas porté — evolution scene n'existe pas. Pour 1:1 strict :
                // return FALSE (= cannotUse=false) si l'evo serait possible,
                // sans déclencher la scene. Le caller affichera un message
                // honnête (= "Pas porté : BeginEvolutionScene field"). Pour
                // l'instant on traite comme cannotUse=true (= retVal=true).
                result.evolved = false;
                break;
              }
              // cases 4-6 sont HEAL_PP_ONE/PP_UP/REVIVE — déjà traités above.
              default:
                break;
            }
          }
          temp1++;
          effectFlags = (effectFlags >> 1) & 0xFF;
        }
        break;
      }
      case 5: {
        // 1:1 :5182-5286 ITEM5 effects. Loop bits.
        let effectFlags = b;
        let paramOffset = 6;  // ITEM_EFFECT_ARG_START (re-init pour ITEM5 ?)
        // Note décomp : `itemEffectParam` est SHARED entre ITEM4 et ITEM5
        // loops (= continue à incrémenter). Notre TS le re-init parce qu'on
        // a perdu l'état entre cases. À fix si on porte friendship réel.
        let temp1 = 0;
        while (effectFlags !== 0) {
          if (effectFlags & 1) {
            switch (temp1) {
              case 0: // ITEM5_EV_DEF
              case 1: // ITEM5_EV_SPEED
              case 2: // ITEM5_EV_SPDEF
              case 3: { // ITEM5_EV_SPATK
                const key = _EV_KEY_BY_ITEM5_BIT[temp1];
                const evCount = _getMonEVCount(mon);
                const param = bytes[paramOffset] ?? 0;
                const ev = _getEv(mon, key);
                const evChange = (param << 24) >> 24;  // signed s8
                let appliedChange = evChange;
                if (evChange > 0) {
                  if (evCount >= MAX_TOTAL_EVS) return result;
                  if (ev >= EV_ITEM_RAISE_LIMIT) { paramOffset++; break; }
                  if (ev + evChange > EV_ITEM_RAISE_LIMIT)
                    appliedChange = EV_ITEM_RAISE_LIMIT - ev;
                  if (evCount + appliedChange > MAX_TOTAL_EVS)
                    appliedChange += MAX_TOTAL_EVS - (evCount + appliedChange);
                  _setEv(mon, key, ev + appliedChange);
                } else {
                  if (ev === 0) {
                    paramOffset++;
                    break;
                  }
                  let newEv = ev + evChange;
                  if (newEv < 0) newEv = 0;
                  _setEv(mon, key, newEv);
                  appliedChange = newEv - ev;
                }
                result.evDelta[key] = appliedChange;
                result.evChanged = true;
                result.cannotUse = false;
                paramOffset++;
                break;
              }
              case 4: { // ITEM5_PP_MAX
                const move = mon.moves[moveIndex];
                if (move) {
                  const ppBonuses = _getPpBonuses(mon);
                  const currentBonus = (ppBonuses & _PP_UP_GET_MASK[moveIndex]) >> (moveIndex * 2);
                  const totalPP = _calculatePPWithBonus(mon, moveIndex, ppBonuses);
                  // 1:1 :5247 : check 3 bonus pas atteint + totalPP >= 5.
                  if (currentBonus < 3 && totalPP >= 5) {
                    let newBonuses = ppBonuses;
                    newBonuses &= _PP_UP_CLEAR_MASK[moveIndex];
                    newBonuses += _PP_UP_ADD_VALUES[moveIndex] * 3;  // max
                    _setPpBonuses(mon, newBonuses);
                    const newTotalPP = _calculatePPWithBonus(mon, moveIndex, newBonuses);
                    const ppDiff = newTotalPP - totalPP;
                    move.pp = Math.min(move.pp + ppDiff, newTotalPP);
                    move.ppMax = newTotalPP;
                    result.ppMaxAppliedSlot = moveIndex;
                    result.cannotUse = false;
                  }
                }
                break;
              }
              case 5: // ITEM5_FRIENDSHIP_LOW
              case 6: // ITEM5_FRIENDSHIP_MID
              case 7: { // ITEM5_FRIENDSHIP_HIGH
                // 1:1 :5261-5281 — friendship updates par tier. NE CHANGE PAS
                // `retVal` (= cannotUse) — le décomp `UPDATE_FRIENDSHIP_FROM_
                // ITEM` macro met juste à jour friendship sans toucher retVal
                // (cf. pokemon.c:5267 `retVal` n'est PAS set ici). cannotUse
                // ne sera false que si une autre branche réussit.
                const friendship = mon.friendship ?? 70;
                let shouldApply = false;
                if (temp1 === 5 && friendship < 100) shouldApply = true;
                else if (temp1 === 6 && friendship >= 100 && friendship < 200) shouldApply = true;
                else if (temp1 === 7 && friendship >= 200) shouldApply = true;
                if (shouldApply) {
                  const change = (bytes[paramOffset] ?? 0) << 24 >> 24;
                  const newFs = Math.max(0, Math.min(255, friendship + change));
                  mon.friendship = newFs;
                  // NOTE 1:1 : ne PAS set result.cannotUse = false.
                }
                paramOffset++;
                break;
              }
              default:
                break;
            }
          }
          temp1++;
          effectFlags = (effectFlags >> 1) & 0xFF;
        }
        void ITEM5_FRIENDSHIP_LOW; void ITEM5_FRIENDSHIP_MID; void ITEM5_FRIENDSHIP_HIGH;
        break;
      }
    }
  }

  void GetItemEffectParamOffset;  // (utilisé par paths sub-substrate AI ; gardé importé)
  return result;
}

// ─── Back-compat alias pour l'ancien `ApplyMedicineEffect` ───────────────────
//
// Garde l'interface MedicineResult historique (heal HP + status cure + cannot
// Use) pour les callers existants (bag-menu-ctx Medicine quick-path / debug).
// Les nouveaux ItemUseCB_* utilisent directement PokemonUseItemEffects.

export interface MedicineResult {
  hpHealed: number;
  statusCured: boolean;
  cannotUse: boolean;
}

export function ApplyMedicineEffect(itemId: number, mon: PokemonInstance): MedicineResult {
  const r = PokemonUseItemEffects(mon, itemId, 0);
  return {
    hpHealed: r.hpHealed,
    statusCured: r.statusCured,
    cannotUse: r.cannotUse,
  };
}

// Expose globally pour devtools (test e2e sans devoir scroller le sac).
(globalThis as Record<string, unknown>).PokemonUseItemEffects = PokemonUseItemEffects;
(globalThis as Record<string, unknown>).ApplyMedicineEffect = ApplyMedicineEffect;
(globalThis as Record<string, unknown>).GetItemEffectType = GetItemEffectType;
