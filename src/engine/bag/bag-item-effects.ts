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

import { type Pokemon, CalculateMonStats, CalculatePPWithBonus } from '../battle/party-storage';
// Pierre d'évolution (case ITEM4_EVO_STONE) : foyer pokemon.ts + scène (P2.1 é4).
import { GetEvolutionTargetSpecies } from '../../pokemon';
import { BeginEvolutionScene } from '../../evolution_scene';
import { gBattleMoves, gSpeciesInfo, getExperienceForLevel } from '../data/game-data';
import { getItemEffectBytes, GetItemEffectParamOffset } from '../battle/data/item-effects';
import {
  ITEM0_X_ATTACK, ITEM0_DIRE_HIT, ITEM0_INFATUATION,
  ITEM1_X_DEFEND, ITEM1_X_SPEED,
  ITEM2_X_ACCURACY, ITEM2_X_SPATK,
  ITEM3_CONFUSION, ITEM3_PARALYSIS, ITEM3_FREEZE, ITEM3_BURN, ITEM3_POISON,
  ITEM3_SLEEP, ITEM3_LEVEL_UP, ITEM3_GUARD_SPEC,
  ITEM4_EV_HP, ITEM4_EV_ATK, ITEM4_HEAL_HP, ITEM4_HEAL_PP, ITEM4_HEAL_PP_ONE,
  ITEM4_PP_UP, ITEM4_REVIVE, ITEM4_EVO_STONE,
  ITEM5_EV_DEF, ITEM5_EV_SPEED, ITEM5_EV_SPDEF, ITEM5_EV_SPATK, ITEM5_PP_MAX,
  ITEM5_FRIENDSHIP_LOW, ITEM5_FRIENDSHIP_MID, ITEM5_FRIENDSHIP_HIGH,
} from '../../../include/constants/item_effects';
// 1:1 décomp battle state (pour branches usedByAI=TRUE / gMain.inBattle=TRUE).
// Notre flag `gMain.inBattle` : on utilise gBattleTypeFlags !== 0 + battler != MAX.
import {
  gBattleMons, gBattlerInMenuId, gActiveBattler,
  gBattleTypeFlags, gSideTimers, gBattleResults,
  gAbsentBattlerFlags, setAbsentBattlerFlags,
  setBattleMoveDamage,
  gBattlersCount, gBattlerPartyIndexes,
  setPotentialItemEffectBattler, setActiveBattler,
  MAX_BATTLERS_COUNT,
} from '../battle/state';
import {
  STAT_ATK, STAT_DEF, STAT_SPEED, STAT_ACC, STAT_SPATK,
  MAX_STAT_STAGE,
  STATUS1_SLEEP, STATUS1_POISON, STATUS1_BURN, STATUS1_FREEZE,
  STATUS1_PARALYSIS, STATUS1_TOXIC_POISON, STATUS1_TOXIC_COUNTER,
  STATUS2_INFATUATION, STATUS2_FOCUS_ENERGY, STATUS2_CONFUSION, STATUS2_NIGHTMARE,
  GET_BATTLER_SIDE,
  B_SIDE_PLAYER,
} from '../battle/constants';
import { gBitTable } from '../../battle_controllers';
import { MOVE_IS_PERMANENT } from '../../../harness/runtime/decomp-bridge';

// 1:1 décomp ITEM3_STATUS_ALL_EXPR
const ITEM3_STATUS_ALL =
  ITEM3_CONFUSION | ITEM3_PARALYSIS | ITEM3_FREEZE | ITEM3_BURN | ITEM3_POISON | ITEM3_SLEEP;

// 1:1 décomp constants/pokemon.h — utilise les imports decomp-data au lieu de
// hardcode (= 1:1 strict pattern A8 audit).
import { MAX_LEVEL, MAX_TOTAL_EVS, EV_ITEM_RAISE_LIMIT } from '../../../include/constants/pokemon';
import { MAX_MON_MOVES } from '../../../include/constants/global';
const _MAX_PP_BONUS = 3;  // 1:1 décomp pokemon.c: PP Up max = 3 (= +60% PP). Pas de constante extraite.

// 1:1 décomp `sGetMonDataEVConstants` (pokemon.c). Ordre des accès EV dans
// la boucle ITEM4 (cases 0-1) puis ITEM5 (cases 0-3 → +2 offset).
// Nous mappons directement aux clés de StatSpread.
// StatSpread uses Showdown-style keys : hp/atk/def/spa/spd/spe.
type EvKey = 'hp' | 'atk' | 'def' | 'spe' | 'spa' | 'spd';
const _EV_KEY_BY_ITEM4_BIT: Record<number, EvKey> = { 0: 'hp', 1: 'atk' };
const _EV_KEY_BY_ITEM5_BIT: Record<number, EvKey> = { 0: 'def', 1: 'spe', 2: 'spd', 3: 'spa' };
/** Mapping EvKey → champ EV natif du struct Pokemon (1:1 MON_DATA_*_EV). */
const _EV_FIELD: Record<EvKey, 'hpEV' | 'attackEV' | 'defenseEV' | 'speedEV' | 'spAttackEV' | 'spDefenseEV'> = {
  hp: 'hpEV', atk: 'attackEV', def: 'defenseEV', spe: 'speedEV', spa: 'spAttackEV', spd: 'spDefenseEV',
};
/** Construit le healMask STATUS1 1:1 décomp HealStatusConditions depuis itemEffect[3]. */
function _item3ToStatus1Mask(b: number): number {
  let mask = 0;
  if (b & ITEM3_SLEEP) mask |= STATUS1_SLEEP;
  if (b & ITEM3_POISON) mask |= STATUS1_POISON | STATUS1_TOXIC_POISON | STATUS1_TOXIC_COUNTER;
  if (b & ITEM3_BURN) mask |= STATUS1_BURN;
  if (b & ITEM3_FREEZE) mask |= STATUS1_FREEZE;
  if (b & ITEM3_PARALYSIS) mask |= STATUS1_PARALYSIS;
  return mask;
}

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
function _getMonEVCount(mon: Pokemon): number {
  return mon.hpEV + mon.attackEV + mon.defenseEV + mon.speedEV + mon.spAttackEV + mon.spDefenseEV;
}

/** `ppBonuses` natif du struct Pokemon (8 bits, 2/slot) = 1:1 MON_DATA_PP_BONUSES. */
function _getPpBonuses(mon: Pokemon): number {
  return mon.ppBonuses & 0xFF;
}
function _setPpBonuses(mon: Pokemon, value: number): void {
  mon.ppBonuses = value & 0xFF;
}

/** 1:1 décomp `gPPUpGetMask` (pokemon.c:1245).
 *  `[0x03, 0x0C, 0x30, 0xC0]`. */
const _PP_UP_GET_MASK = [0x03, 0x0C, 0x30, 0xC0];
const _PP_UP_CLEAR_MASK = [0xFC, 0xF3, 0xCF, 0x3F];
const _PP_UP_ADD_VALUES = [0x01, 0x04, 0x10, 0x40];

/** 1:1 décomp `CalculatePPWithBonus(move, bonus, moveIndex)` (pokemon.c:5005) :
 *  basePP + (basePP * 20 * bonusBits / 100). basePP = `gBattleMoves[move].pp`
 *  (table id F2 — plus de hack `_basePPPerSlot`/ppMax reverse-calc). */
function _calculatePPWithBonus(mon: Pokemon, moveIndex: number, ppBonuses: number): number {
  // Délègue au canonique 1:1 (party-storage) — adaptateur de signature mon-based.
  return CalculatePPWithBonus(mon.moves[moveIndex], ppBonuses, moveIndex);
}

/** EV courant par EvKey (champ natif Pokemon, 1:1 MON_DATA_*_EV). */
function _getEv(mon: Pokemon, key: EvKey): number {
  return mon[_EV_FIELD[key]];
}
function _setEv(mon: Pokemon, key: EvKey, value: number): void {
  mon[_EV_FIELD[key]] = value;
}

/** ITEM6_HEAL_HP_FULL = (u8) -1, _HALF = -2, _LVL_UP = -3 (décomp item_
 *  effects.h:46-50). Comme byte → 0xFF, 0xFE, 0xFD. */
const ITEM6_HEAL_HP_FULL = 0xFF;
const ITEM6_HEAL_HP_HALF = 0xFE;
const ITEM6_HEAL_HP_LVL_UP = 0xFD;

/** Override "en combat" pour l'usage d'item du JOUEUR en combat INLINE. Le proxy
 *  `gBattleTypeFlags !== 0` vaut 0 en combat SAUVAGE (aucun flag) → les effets
 *  battle (X-items, cure statut/infatuation, sync gBattleMons immédiat) seraient
 *  skippés. battle-flow pose ce flag autour de l'appel (= équivalent du
 *  `gMain.inBattle == TRUE` du décomp, qui est notre vraie sémantique). */
let _forceInBattle = false;
export function setForceInBattle(v: boolean): void { _forceInBattle = v; }

/** 1:1 décomp `PokemonUseItemEffects(mon, item, partyIndex, moveIndex, usedByAI)`
 *  (pokemon.c:4742-5291). Applique l'effet d'un item Medicine/PPRecovery/PPUp/
 *  RareCandy/ReduceEV/EvolutionStone/X-Item/Dire Hit + cures status sur un mon.
 *  Mute `mon` en place (= field). En battle (usedByAI=true OU gBattleTypeFlags
 *  !== 0), mute aussi `gBattleMons[battler]` selon le path.
 *
 *  Retour : `result.cannotUse` ≡ retVal décomp (TRUE = rien fait, FALSE = effet).
 *  Note 1:1 : tous les détails (hpHealed, evDelta, etc.) sont des EXTENSIONS
 *  TS pour permettre au caller de construire le message FR correct. Le décomp
 *  ne retourne que retVal — il dérive les détails via re-read GetMonData. */
export function PokemonUseItemEffects(
  mon: Pokemon,
  itemId: number,
  partyIndex: number,
  moveIndex: number,
  usedByAI: boolean = false,
): ItemEffectResult {
  const result = _makeResult();
  const bytes = getItemEffectBytes(itemId);
  if (!bytes) return result;  // cannotUse=true par défaut

  // 1:1 :4775-4795 — battler resolve setup.
  // gMain.inBattle ≡ notre `gBattleTypeFlags !== 0` (= en battle si flags set),
  // OU l'override _forceInBattle (combat SAUVAGE inline : gBattleTypeFlags == 0).
  const inBattle = gBattleTypeFlags !== 0 || _forceInBattle;
  let battler = MAX_BATTLERS_COUNT;
  setPotentialItemEffectBattler(gBattlerInMenuId);
  if (inBattle) {
    setActiveBattler(gBattlerInMenuId);
    let i = (GET_BATTLER_SIDE(gActiveBattler) !== B_SIDE_PLAYER) ? 1 : 0;
    while (i < gBattlersCount) {
      if (gBattlerPartyIndexes[i] === partyIndex) {
        battler = i;
        break;
      }
      i += 2;
    }
  } else {
    setActiveBattler(0);
    battler = MAX_BATTLERS_COUNT;
  }

  // 1:1 :4817 main loop sur les 6 first bytes (ITEM0..ITEM5).
  for (let i = 0; i < 6; i++) {
    const b = bytes[i] ?? 0;
    switch (i) {
      case 0:
        // 1:1 :4823-4849 — battle effects ITEM0 (X Attack, Dire Hit, Infatuation cure).
        if (inBattle) {
          // 1:1 :4825-4830 Cure infatuation
          if ((b & ITEM0_INFATUATION)
              && battler !== MAX_BATTLERS_COUNT
              && (gBattleMons[battler].status2 & STATUS2_INFATUATION)) {
            gBattleMons[battler].status2 &= ~STATUS2_INFATUATION;
            result.cureInfatuation = true;
            result.cannotUse = false;
          }
          // 1:1 :4833-4838 Dire Hit (= FOCUS_ENERGY)
          if ((b & ITEM0_DIRE_HIT)
              && !(gBattleMons[gActiveBattler].status2 & STATUS2_FOCUS_ENERGY)) {
            gBattleMons[gActiveBattler].status2 |= STATUS2_FOCUS_ENERGY;
            result.cannotUse = false;
          }
          // 1:1 :4841-4848 X Attack
          if ((b & ITEM0_X_ATTACK)
              && gBattleMons[gActiveBattler].statStages[STAT_ATK] < MAX_STAT_STAGE) {
            gBattleMons[gActiveBattler].statStages[STAT_ATK] += b & ITEM0_X_ATTACK;
            if (gBattleMons[gActiveBattler].statStages[STAT_ATK] > MAX_STAT_STAGE)
              gBattleMons[gActiveBattler].statStages[STAT_ATK] = MAX_STAT_STAGE;
            result.cannotUse = false;
          }
        }
        // Note : ITEM0_SACRED_ASH (b0 bit 6 = 0x40) handled in party_menu.c.
        break;
      case 1:
        // 1:1 :4851-4872 — battle X_DEFEND / X_SPEED.
        if (inBattle) {
          if ((b & ITEM1_X_DEFEND)
              && gBattleMons[gActiveBattler].statStages[STAT_DEF] < MAX_STAT_STAGE) {
            gBattleMons[gActiveBattler].statStages[STAT_DEF] += (b & ITEM1_X_DEFEND) >> 4;
            if (gBattleMons[gActiveBattler].statStages[STAT_DEF] > MAX_STAT_STAGE)
              gBattleMons[gActiveBattler].statStages[STAT_DEF] = MAX_STAT_STAGE;
            result.cannotUse = false;
          }
          if ((b & ITEM1_X_SPEED)
              && gBattleMons[gActiveBattler].statStages[STAT_SPEED] < MAX_STAT_STAGE) {
            gBattleMons[gActiveBattler].statStages[STAT_SPEED] += b & ITEM1_X_SPEED;
            if (gBattleMons[gActiveBattler].statStages[STAT_SPEED] > MAX_STAT_STAGE)
              gBattleMons[gActiveBattler].statStages[STAT_SPEED] = MAX_STAT_STAGE;
            result.cannotUse = false;
          }
        }
        break;
      case 2:
        // 1:1 :4874-4894 — battle X_ACCURACY / X_SPATK.
        if (inBattle) {
          if ((b & ITEM2_X_ACCURACY)
              && gBattleMons[gActiveBattler].statStages[STAT_ACC] < MAX_STAT_STAGE) {
            gBattleMons[gActiveBattler].statStages[STAT_ACC] += (b & ITEM2_X_ACCURACY) >> 4;
            if (gBattleMons[gActiveBattler].statStages[STAT_ACC] > MAX_STAT_STAGE)
              gBattleMons[gActiveBattler].statStages[STAT_ACC] = MAX_STAT_STAGE;
            result.cannotUse = false;
          }
          if ((b & ITEM2_X_SPATK)
              && gBattleMons[gActiveBattler].statStages[STAT_SPATK] < MAX_STAT_STAGE) {
            gBattleMons[gActiveBattler].statStages[STAT_SPATK] += b & ITEM2_X_SPATK;
            if (gBattleMons[gActiveBattler].statStages[STAT_SPATK] > MAX_STAT_STAGE)
              gBattleMons[gActiveBattler].statStages[STAT_SPATK] = MAX_STAT_STAGE;
            result.cannotUse = false;
          }
        }
        break;
      case 3:
        // 1:1 :4896-4938 ITEM3 effects.
        // 1:1 :4898-4904 Guard Spec (= mistTimer side effect, battle-only).
        if (inBattle && (b & ITEM3_GUARD_SPEC)
            && gSideTimers[GET_BATTLER_SIDE(gActiveBattler)].mistTimer === 0) {
          gSideTimers[GET_BATTLER_SIDE(gActiveBattler)].mistTimer = 5;
          result.cannotUse = false;
        }
        if ((b & ITEM3_LEVEL_UP) && mon.level !== MAX_LEVEL) {
          // 1:1 décomp pokemon.c PokemonUseItemEffects ITEM3_LEVEL_UP (Rare Candy) :
          //   dataUnsigned = gExperienceTables[growthRate][level + 1];
          //   SetMonData(mon, MON_DATA_EXP, &dataUnsigned);
          //   CalculateMonStats(mon);   // recalc level (dérivé) + LES 6 STATS + HP
          //   retVal = FALSE;
          // ⚠️ Avant : on ne recalculait QUE maxHP → atk/def/spatk/spdef/speed
          //   restaient figés → la boîte de stats level-up affichait des deltas
          //   FAUX (uniquement HP changeait). CalculateMonStats recalcule tout.
          const sInfo = gSpeciesInfo[mon.species];
          if (sInfo) {
            const expForNext = getExperienceForLevel(sInfo.growthRate, mon.level + 1);
            mon.experience = expForNext >>> 0;   // 1:1 SetMonData(MON_DATA_EXP)
            // Notre CalculateMonStats lit `mon.level` (≠ décomp qui re-dérive de
            // l'EXP via GetLevelFromMonExp) → on incrémente le niveau AVANT.
            // Résultat observable identique : level+1, 6 stats recalculées, HP
            // courant ajusté du delta maxHP.
            mon.level++;
            CalculateMonStats(mon);              // 1:1 recalc 6 stats + ajuste HP
            result.leveledUp = true;
            result.newLevel = mon.level;
            result.cannotUse = false;
          }
        }
        // 1:1 :4917-4931 cure status (SLEEP/POISON/BURN/FREEZE/PARALYSIS).
        // 1:1 décomp HealStatusConditions (pokemon.c:5293-5309) :
        //   si status1 & healMask : clear bits, set mon, et si en battle aussi
        //   clear gBattleMons[battler].status1.
        if (b & ITEM3_STATUS_ALL) {
          // 1:1 décomp HealStatusConditions : healMask STATUS1 depuis itemEffect[3].
          const healMask = _item3ToStatus1Mask(b);
          if ((mon.status >>> 0) & healMask) {
            const wasSleep = (mon.status & STATUS1_SLEEP) !== 0;
            mon.status = (mon.status >>> 0) & ~healMask;   // clear les bits status1 ciblés
            result.statusCured = true;
            result.cannotUse = false;
            // 1:1 :5301-5302 sync gBattleMons (même healMask).
            if (inBattle && battler !== MAX_BATTLERS_COUNT) {
              gBattleMons[battler].status1 &= ~healMask;
              if (wasSleep && (b & ITEM3_SLEEP)) gBattleMons[battler].status2 &= ~STATUS2_NIGHTMARE;
            }
          }
        }
        // 1:1 :4932-4937 cure confusion (battle-only via STATUS2).
        if ((b & ITEM3_CONFUSION) && inBattle && battler !== MAX_BATTLERS_COUNT
            && (gBattleMons[battler].status2 & STATUS2_CONFUSION)) {
          gBattleMons[battler].status2 &= ~STATUS2_CONFUSION;
          result.statusCured = true;  // CONFUSION counted as a cure for our result
          result.cannotUse = false;
        }
        break;
      case 4: {
        // 1:1 :4940-5180 ITEM4 effects. Loop bits.
        let effectFlags = b;
        let paramOffset = 6;  // ITEM_EFFECT_ARG_START
        // 1:1 :4945-4960 PP_UP first (= cleared from effectFlags).
        if (effectFlags & ITEM4_PP_UP) {
          effectFlags = effectFlags & ~ITEM4_PP_UP & 0xFF;
          if (mon.moves[moveIndex]) {
            const ppBonuses = _getPpBonuses(mon);
            const currentBonus = (ppBonuses & _PP_UP_GET_MASK[moveIndex]) >> (moveIndex * 2);
            const totalPP = _calculatePPWithBonus(mon, moveIndex, ppBonuses);
            if (currentBonus <= 2 && totalPP > 4) {
              // 1:1 :4952-4958 : applique +1 bonus + heal différentiel PP.
              const newBonuses = ppBonuses + _PP_UP_ADD_VALUES[moveIndex];
              _setPpBonuses(mon, newBonuses);
              const newTotalPP = _calculatePPWithBonus(mon, moveIndex, newBonuses);
              const ppDiff = newTotalPP - totalPP;
              mon.pp[moveIndex] = Math.min(mon.pp[moveIndex] + ppDiff, newTotalPP);
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
                // 1:1 :5017-5103.
                const isRevive = (effectFlags & (ITEM4_REVIVE >> 2)) !== 0;
                if (isRevive) {
                  // 1:1 :5019-5042 — Revive uniquement si mon a 0 HP.
                  if (mon.hp !== 0) { paramOffset++; break; }
                  // 1:1 :5026-5042 — in-battle revive : update gAbsentBattlerFlags
                  //   + CopyPlayerPartyMonToBattleData + bump numRevivesUsed.
                  if (inBattle) {
                    if (battler !== MAX_BATTLERS_COUNT) {
                      setAbsentBattlerFlags(gAbsentBattlerFlags & ~gBitTable[battler]);
                      // CopyPlayerPartyMonToBattleData : pas porté ici (= ce serait
                      // recopier les fields gPlayerParty→gBattleMons), notre layer
                      // bridge sync auto. Le call resync se fera via cmd-niveau-28
                      // EmitGetMonData ci-dessous quand !usedByAI.
                      if (GET_BATTLER_SIDE(gActiveBattler) === B_SIDE_PLAYER
                          && gBattleResults.numRevivesUsed < 255) {
                        gBattleResults.numRevivesUsed++;
                      }
                    } else {
                      // gActiveBattler ^ 2 = battler partner side (= autre slot)
                      setAbsentBattlerFlags(gAbsentBattlerFlags & ~gBitTable[gActiveBattler ^ 2]);
                      if (GET_BATTLER_SIDE(gActiveBattler) === B_SIDE_PLAYER
                          && gBattleResults.numRevivesUsed < 255) {
                        gBattleResults.numRevivesUsed++;
                      }
                    }
                  }
                } else {
                  // 1:1 :5045-5049 — heal seulement si mon HP != 0
                  if (mon.hp === 0) { paramOffset++; break; }
                }
                // 1:1 :5053-5067 — compute amount.
                let amount = bytes[paramOffset++] ?? 0;
                if (amount === ITEM6_HEAL_HP_FULL)
                  amount = mon.maxHP - mon.hp;
                else if (amount === ITEM6_HEAL_HP_HALF) {
                  amount = Math.floor(mon.maxHP / 2);
                  if (amount === 0) amount = 1;
                } else if (amount === ITEM6_HEAL_HP_LVL_UP) {
                  // 1:1 :5065 gBattleScripting.levelUpHP — battle-only. Si pas
                  // en battle, fallback 0 (= no effect).
                  amount = inBattle ? 0 : 0;
                  // Note 1:1 strict : gBattleScripting.levelUpHP est computed
                  // par level-up sequence battle. Pas porté ici (= future work
                  // Cmd_drawlvlupbox path).
                }
                // 1:1 :5070-5102 — apply HP heal.
                if (mon.hp !== mon.maxHP) {
                  if (!usedByAI) {
                    // Restore HP direct.
                    const newHp = Math.min(mon.hp + amount, mon.maxHP);
                    result.hpHealed = newHp - mon.hp;
                    mon.hp = newHp;
                    // 1:1 :5081-5095 — battle sync.
                    if (inBattle && battler !== MAX_BATTLERS_COUNT) {
                      gBattleMons[battler].hp = newHp;
                      if (!(effectFlags & (ITEM4_REVIVE >> 2))
                          && GET_BATTLER_SIDE(gActiveBattler) === B_SIDE_PLAYER) {
                        if (gBattleResults.numHealingItemsUsed < 255) {
                          gBattleResults.numHealingItemsUsed++;
                        }
                        // 1:1 :5089-5093 — EmitGetMonData(REQUEST_ALL_BATTLE) +
                        // MarkBattlerForControllerExec(battler). Notre projet
                        // sync gBattleMons direct via batch C bridge, donc cet
                        // emit n'est nécessaire que pour link multi-battles
                        // (= deferred Phase 1.4+). Le mon battler is now synced.
                      }
                    }
                  } else {
                    // 1:1 :5098-5100 — AI : store amount as negative damage.
                    setBattleMoveDamage(-amount);
                  }
                  result.cannotUse = false;
                }
                effectFlags = effectFlags & ~(ITEM4_REVIVE >> 2) & 0xFF;
                break;
              }
              case 3: { // ITEM4_HEAL_PP
                // 1:1 :5106-5159.
                const isPpOne = (effectFlags & (ITEM4_HEAL_PP_ONE >> 3)) !== 0;
                if (!isPpOne) {
                  // 1:1 :5108-5134 Heal PP for all moves
                  const ppBonuses = _getPpBonuses(mon);
                  const healAmount = bytes[paramOffset] ?? 0;
                  for (let m = 0; m < MAX_MON_MOVES; m++) {
                    if (!mon.moves[m]) continue;
                    const totalPP = _calculatePPWithBonus(mon, m, ppBonuses);
                    if (mon.pp[m] !== totalPP) {
                      const newPp = Math.min(mon.pp[m] + healAmount, totalPP);
                      result.ppRecoveredBySlot[m] = newPp - mon.pp[m];
                      mon.pp[m] = newPp;
                      // 1:1 :5127-5128 sync battler PP if applicable.
                      if (inBattle && battler !== MAX_BATTLERS_COUNT
                          && MOVE_IS_PERMANENT(battler, m)) {
                        gBattleMons[battler].pp[m] = newPp;
                      }
                      result.cannotUse = false;
                    }
                  }
                  paramOffset++;
                } else {
                  // 1:1 :5136-5158 Heal PP for one move
                  if (mon.moves[moveIndex]) {
                    const ppBonuses = _getPpBonuses(mon);
                    const totalPP = _calculatePPWithBonus(mon, moveIndex, ppBonuses);
                    if (mon.pp[moveIndex] !== totalPP) {
                      const healAmount = bytes[paramOffset++] ?? 0;
                      const newPp = Math.min(mon.pp[moveIndex] + healAmount, totalPP);
                      result.ppRecoveredBySlot[moveIndex] = newPp - mon.pp[moveIndex];
                      mon.pp[moveIndex] = newPp;
                      // 1:1 :5153-5154 sync battler PP if applicable.
                      if (inBattle && battler !== MAX_BATTLERS_COUNT
                          && MOVE_IS_PERMANENT(battler, moveIndex)) {
                        gBattleMons[battler].pp[moveIndex] = newPp;
                      }
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
                // Scène RÉELLE (evolution_scene.ts, P2.1 é4). `return FALSE` décomp
                // = item efficace → cannotUse=false + evolved=true (le caller
                // ItemUseCB_EvolutionStone : RemoveBagItem + FreePartyPointers,
                // la scène a déjà pris le CB2 via BeginEvolutionScene).
                const targetSpecies = GetEvolutionTargetSpecies(mon, 2 /* EVO_MODE_ITEM_USE */, itemId);
                if (targetSpecies !== 0 /* SPECIES_NONE */) {
                  BeginEvolutionScene(mon, targetSpecies, false, partyIndex);
                  result.evolved = true;
                  result.cannotUse = false;
                  return result;  // 1:1 `return FALSE` (sortie immédiate)
                }
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
                if (mon.moves[moveIndex]) {
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
                    mon.pp[moveIndex] = Math.min(mon.pp[moveIndex] + ppDiff, newTotalPP);
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

export function ApplyMedicineEffect(itemId: number, mon: Pokemon): MedicineResult {
  // Back-compat : assume slot 0 + moveIndex 0 + field (usedByAI=false).
  const r = PokemonUseItemEffects(mon, itemId, 0, 0, false);
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
(globalThis as Record<string, unknown>).setForceInBattle = setForceInBattle;
