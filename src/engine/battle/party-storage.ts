/**
 * battle/party-storage.ts — 1:1 décomp `gPlayerParty[]` / `gEnemyParty[]`
 * battle-side storage + GetMonData/SetMonData helpers.
 *
 * Sources de vérité (1:1) :
 *   - `D:/Projet 1/decomps/pokeemeraude/include/pokemon.h:196..232`
 *     (struct BoxPokemon + struct Pokemon)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/pokemon.h:6..97`
 *     (enum MON_DATA_*)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/pokemon.c:GetMonData/SetMonData`
 *
 * Architecture :
 *   - On stocke gPlayerParty[6] + gEnemyParty[6] comme structs *décodés*
 *     (= pas les BoxPokemon encrypted, on garde des champs plats accessibles
 *     direct).
 *   - GetMonData/SetMonData lisent/écrivent ces champs par tag MON_DATA_*.
 *   - Bridge `PokemonInstance` (runtime) → `Pokemon` (battle struct) au début
 *     de combat, et inverse à la fin pour persist HP/status/exp.
 */

import type { PokemonInstance } from '../pokemon/pokemon';
import { GetPlayerNameString } from '../../../include/text';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from '../save/save-block-state';
import {
  speciesEnumToDexId, moveEnumToDexId, makePokemonInstanceView,
  pokemonToPokemonInstance,
} from '../pokemon/pokemon';
import { TOTAL_BOXES_COUNT, IN_BOX_COUNT } from '../save/save-blocks';
import type { PokemonStorage } from '../save/save-blocks';
import { VarGet, VarSet, FlagClear } from '../script/script-vars';
import { SetPCBoxToSendMon, GetPCBoxToSendMon } from '../pokemon/pc-box';
import { resolveDecompConstant, reverseDecompConstant } from '../../../harness/runtime/decomp-constants';
import { gMapHeader } from '../../fieldmap';
// Helpers purs nature/stat → miroir 1:1 `src/game/pokemon.ts` (source unique).
import {
  MON_ALREADY_KNOWS_MOVE, MON_HAS_MAX_MOVES,
} from '../../../include/constants/pokemon';
import { SPECIES_EGG } from '../../../include/constants/species';
import { MOVE_NONE } from '../../../include/constants/moves';
// TM/HM learn-legality (CanMonLearnTMHM, pokemon.c) : data layer apprenable (game-data,
// prouvée 1:1 par audit-tmhm-learnsets.cjs) + ordre sTMHMMoves + PP via gBattleMoves.
// Tous DOWNSTREAM (data leaves) → aucun n'importe party-storage = acyclique.
import { getTmhmLearnset } from '../data/game-data';
import { speciesNumberToEnum } from './data/species-runtime';
import { sTMHMMoves } from '../pokemon/tmhm-moves';
import { getBattleMove } from './data/battle-moves';
// 1:1 décomp `Random()` (random.c) — pour le gate 50% de friendship-WALKING
// (AdjustFriendship). random.ts = leaf pur (zéro import) → aucun cycle possible.
import { Random } from '../../random';
import { getSpeciesInfo, gBattleMoves, gSpeciesInfo } from '../data/game-data';
import { GetItemHoldEffect } from './data/item-hold-effects';
// Résolution nom-de-move 1:1 décomp (leaf partagé, zéro @pkmn/dex). Re-export
// pour les call-sites existants (wire-bytecode-bridge).
import { moveDexIdToEnum, resolveMoveDexId } from './data/move-name-resolve';
export { moveDexIdToEnum, resolveMoveDexId } from './data/move-name-resolve';
// AUDIT BUG FIX : import direct gBattleMons depuis state.ts (= même instance
// singleton que bytecode runtime). Avant : globalThis.__battleState lookup
// retournait une instance ESM différente → battle mons setup invisible aux
// opcodes. Static import = canonical instance.
import { gBattleMons as _gBattleMonsRuntime } from './state';

// ─── MON_DATA_* enum 1:1 décomp `include/pokemon.h:6..97` ─────────────────

export const MON_DATA_PERSONALITY = 0;
export const MON_DATA_OT_ID = 1;
export const MON_DATA_NICKNAME = 2;
export const MON_DATA_LANGUAGE = 3;
export const MON_DATA_SANITY_IS_BAD_EGG = 4;
export const MON_DATA_SANITY_HAS_SPECIES = 5;
export const MON_DATA_SANITY_IS_EGG = 6;
export const MON_DATA_OT_NAME = 7;
export const MON_DATA_MARKINGS = 8;
export const MON_DATA_CHECKSUM = 9;
export const MON_DATA_ENCRYPT_SEPARATOR = 10;
export const MON_DATA_SPECIES = 11;
export const MON_DATA_HELD_ITEM = 12;
export const MON_DATA_MOVE1 = 13;
export const MON_DATA_MOVE2 = 14;
export const MON_DATA_MOVE3 = 15;
export const MON_DATA_MOVE4 = 16;
export const MON_DATA_PP1 = 17;
export const MON_DATA_PP2 = 18;
export const MON_DATA_PP3 = 19;
export const MON_DATA_PP4 = 20;
export const MON_DATA_PP_BONUSES = 21;
export const MON_DATA_COOL = 22;
export const MON_DATA_BEAUTY = 23;
export const MON_DATA_CUTE = 24;
export const MON_DATA_EXP = 25;
export const MON_DATA_HP_EV = 26;
export const MON_DATA_ATK_EV = 27;
export const MON_DATA_DEF_EV = 28;
export const MON_DATA_SPEED_EV = 29;
export const MON_DATA_SPATK_EV = 30;
export const MON_DATA_SPDEF_EV = 31;
export const MON_DATA_FRIENDSHIP = 32;
export const MON_DATA_SMART = 33;
export const MON_DATA_POKERUS = 34;
export const MON_DATA_MET_LOCATION = 35;
export const MON_DATA_MET_LEVEL = 36;
export const MON_DATA_MET_GAME = 37;
export const MON_DATA_POKEBALL = 38;
export const MON_DATA_HP_IV = 39;
export const MON_DATA_ATK_IV = 40;
export const MON_DATA_DEF_IV = 41;
export const MON_DATA_SPEED_IV = 42;
export const MON_DATA_SPATK_IV = 43;
export const MON_DATA_SPDEF_IV = 44;
export const MON_DATA_IS_EGG = 45;
export const MON_DATA_ABILITY_NUM = 46;
export const MON_DATA_TOUGH = 47;
export const MON_DATA_SHEEN = 48;
export const MON_DATA_OT_GENDER = 49;
// 1:1 décomp pokemon.h:58-62 — 5 ribbons (= COOL/BEAUTY/CUTE/SMART/TOUGH) =
// indexes 50..54, pas 50..56 comme avant.
export const MON_DATA_COOL_RIBBON = 50;
export const MON_DATA_BEAUTY_RIBBON = 51;
export const MON_DATA_CUTE_RIBBON = 52;
export const MON_DATA_SMART_RIBBON = 53;
export const MON_DATA_TOUGH_RIBBON = 54;
// AUDIT BUG FIX : décalage de +2 sur tous les indexes après ribbons car on skip
// 2 ribbons en trop (50..56 → 50..54 = 5 ribbons).
export const MON_DATA_STATUS = 55;
export const MON_DATA_LEVEL = 56;
export const MON_DATA_HP = 57;
export const MON_DATA_MAX_HP = 58;
export const MON_DATA_ATK = 59;
export const MON_DATA_DEF = 60;
export const MON_DATA_SPEED = 61;
export const MON_DATA_SPATK = 62;
export const MON_DATA_SPDEF = 63;
export const MON_DATA_MAIL = 64;
export const MON_DATA_SPECIES_OR_EGG = 65;
export const MON_DATA_IVS = 66;
// 1:1 décomp pokemon.h:75-87 — 13 additional ribbons (CHAMPION..UNUSED) = 67..79.
export const MON_DATA_CHAMPION_RIBBON = 67;
export const MON_DATA_WINNING_RIBBON = 68;
export const MON_DATA_VICTORY_RIBBON = 69;
export const MON_DATA_ARTIST_RIBBON = 70;
export const MON_DATA_EFFORT_RIBBON = 71;
export const MON_DATA_MARINE_RIBBON = 72;
export const MON_DATA_LAND_RIBBON = 73;
export const MON_DATA_SKY_RIBBON = 74;
export const MON_DATA_COUNTRY_RIBBON = 75;
export const MON_DATA_NATIONAL_RIBBON = 76;
export const MON_DATA_EARTH_RIBBON = 77;
export const MON_DATA_WORLD_RIBBON = 78;
export const MON_DATA_UNUSED_RIBBONS = 79;
export const MON_DATA_MODERN_FATEFUL_ENCOUNTER = 80;
export const MON_DATA_KNOWN_MOVES = 81;
export const MON_DATA_RIBBON_COUNT = 82;
export const MON_DATA_RIBBONS = 83;
export const MON_DATA_ATK2 = 84;
export const MON_DATA_DEF2 = 85;
export const MON_DATA_SPEED2 = 86;
export const MON_DATA_SPATK2 = 87;
export const MON_DATA_SPDEF2 = 88;

/** 1:1 décomp `PARTY_SIZE` (include/constants/global.h). */
export const PARTY_SIZE = 6;

/** 1:1 décomp `MAX_MON_MOVES`. */
const MAX_MON_MOVES_PARTY = 4;

// Cœur mon-data CONSOLIDÉ vers le foyer pokemon.c (src/pokemon.ts = où struct Pokemon /
// gPlayerParty / GetMonData sont définis dans la décomp). Import pour usage local + RE-EXPORT
// pour compat : les fichiers qui importent ces symboles depuis party-storage continuent SANS
// changement (struct/createEmptyPokemon/GetMonData/SetMonData/gPlayerParty/gEnemyParty).
import { createEmptyPokemon, GetMonData, SetMonData, gPlayerParty, gEnemyParty,
  GetMonAbility, GetAbilityBySpecies, CalculateMonStats } from '../../pokemon';
import type { Pokemon } from '../../pokemon';
export { createEmptyPokemon, GetMonData, SetMonData, gPlayerParty, gEnemyParty,
  GetMonAbility, GetAbilityBySpecies, CalculateMonStats };
export type { Pokemon };

/** 1:1 STRICT décomp `MonKnowsMove(struct Pokemon *mon, u16 move)` (pokemon.c) :
 *    for (i = 0; i < MAX_MON_MOVES; i++)
 *        if (GetMonData(mon, MON_DATA_MOVE1 + i, NULL) == move) return TRUE;
 *    return FALSE;
 *  Les moves natifs sont stockés en IDs numériques (cf. setmonmove/battle-trainer-party). */
export function MonKnowsMove(mon: Pokemon, move: number): boolean {
  for (let i = 0; i < 4; i++) {  // MAX_MON_MOVES = 4
    if (GetMonData(mon, MON_DATA_MOVE1 + i) === move) return true;
  }
  return false;
}

// ─── Légalité d'apprentissage CT/CS (1:1 décomp pokemon.c) ──────────────────

/** 1:1 STRICT décomp `u32 CanSpeciesLearnTMHM(u16 species, u8 tm)` (pokemon.c:6252) :
 *    if (species == SPECIES_EGG) return 0;
 *    else if (tm < 32) return gTMHMLearnsets[species].as_u32s[0] & (1 << tm);
 *    else             return gTMHMLearnsets[species].as_u32s[1] & (1 << (tm - 32));
 *  Le bitfield `gTMHMLearnsets[species]` est matérialisé par notre data layer comme la
 *  LISTE des CT/CS apprenables (getTmhmLearnset, short-names) — prouvée 1:1 par
 *  audit-tmhm-learnsets.cjs. Le bit `tm` (ordre FOREACH_TMHM = ordre sTMHMMoves) est set
 *  ⟺ `sTMHMMoves[tm]` ∈ liste, donc l'`includes` est strictement équivalent au mask. */
export function CanSpeciesLearnTMHM(species: number, tm: number): boolean {
  if (species === SPECIES_EGG) return false;
  const moveKey = sTMHMMoves[tm];               // 'MOVE_TOXIC' (tm-ième champ FOREACH_TMHM)
  if (moveKey === undefined) return false;       // tm hors [0, 57]
  const shortName = moveKey.slice(5);            // retire 'MOVE_' → 'TOXIC'
  return getTmhmLearnset(speciesNumberToEnum(species)).includes(shortName);
}

/** 1:1 STRICT décomp `u32 CanMonLearnTMHM(struct Pokemon *mon, u8 tm)` (pokemon.c:6232).
 *  `species = MON_DATA_SPECIES_OR_EGG` (= 0 pour un œuf chez nous → liste vide → false,
 *  résultat 1:1 du guard SPECIES_EGG décomp). */
export function CanMonLearnTMHM(mon: Pokemon, tm: number): boolean {
  return CanSpeciesLearnTMHM(GetMonData(mon, MON_DATA_SPECIES_OR_EGG) as number, tm);
}

/** 1:1 STRICT décomp `u16 GiveMoveToMon(struct Pokemon *mon, u16 move)` → `GiveMoveToBoxMon`
 *  (pokemon.c) : remplit le 1er slot vide (move + PP = gBattleMoves[move].pp).
 *    return move (appris) · MON_ALREADY_KNOWS_MOVE · MON_HAS_MAX_MOVES (4 capacités). */
export function GiveMoveToMon(mon: Pokemon, move: number): number {
  for (let i = 0; i < 4; i++) {  // MAX_MON_MOVES
    const existingMove = GetMonData(mon, MON_DATA_MOVE1 + i) as number;
    if (existingMove === MOVE_NONE) {
      SetMonData(mon, MON_DATA_MOVE1 + i, move);
      SetMonData(mon, MON_DATA_PP1 + i, getBattleMove(move).pp);
      return move;
    }
    if (existingMove === move) return MON_ALREADY_KNOWS_MOVE;
  }
  return MON_HAS_MAX_MOVES;
}

// GetMonData / SetMonData : CONSOLIDÉS vers le foyer pokemon.c (src/pokemon.ts).
// Import pour usage local + re-export pour compat (40 fichiers les importent de party-storage).


// ─── Bridge PokemonInstance ↔ Pokemon ─────────────────────────────────────

const _STATUS_TO_STATUS1: Record<string, number> = {
  'PSN': 1 << 3,    // STATUS1_POISON
  'BRN': 1 << 4,    // STATUS1_BURN
  'FRZ': 1 << 5,    // STATUS1_FREEZE
  'PAR': 1 << 6,    // STATUS1_PARALYSIS
  'TOX': (1 << 7) | (1 << 3), // STATUS1_TOXIC_POISON | STATUS1_POISON
  'SLP': 0,         // STATUS1_SLEEP_TURN bits are dynamic
};

const _STATUS1_TO_STATUS: Record<number, 'PSN' | 'PAR' | 'BRN' | 'SLP' | 'FRZ' | 'TOX' | null> = {
  0x08: 'PSN',
  0x10: 'BRN',
  0x20: 'FRZ',
  0x40: 'PAR',
  0x88: 'TOX',
};

/** Resolve un species enum ex. "SPECIES_TREECKO" vers un u16 id décomp. */
function _resolveSpeciesId(enumStr: string): number {
  const id = resolveDecompConstant(enumStr);
  return typeof id === 'number' ? id : 0;
}

function _resolveMoveId(dexId: string): number {
  return resolveMoveDexId(dexId);
}

/** Bridge un `PokemonInstance` runtime vers un `Pokemon` battle-side. */
export function pokemonInstanceToPokemon(inst: PokemonInstance): Pokemon {
  const mon = createEmptyPokemon();
  mon.personality = (inst.personality ?? 0) >>> 0;
  // 1:1 décomp : mon.otId est le trainer ID du capturer. Pour les mons player-
  // caught, c'est `gSaveBlock2Ptr->playerTrainerId` direct (= 1:1 strict).
  mon.otId = (gSaveBlock2Ptr.playerTrainerId ?? 0) >>> 0;
  mon.nickname = inst.nickname || inst.speciesNameFr;
  mon.species = _resolveSpeciesId(inst.speciesEnum) || inst.speciesId || 0;
  mon.hasSpecies = mon.species ? 1 : 0;
  mon.heldItem = inst.heldItem ? (resolveDecompConstant('ITEM_' + inst.heldItem.toUpperCase().replace(/-/g, '_')) as number | undefined ?? 0) : 0;
  mon.experience = inst.currentExp ?? 0;
  mon.friendship = inst.friendship ?? 70;   // 1:1 : bonheur de base de l'espèce (createPokemonInstance)
  mon.level = inst.level;
  mon.hp = inst.currentHp;
  mon.maxHP = inst.maxHp;
  // Champs meta/flags lus par la VUE (pokemonToPokemonInstance) : sans eux, le
  // round-trip PokemonInstance→Pokemon→vue les PERDRAIT (bug A/B révélé par le
  // pivot : l'œuf devenait un mon normal car isEgg n'était pas reporté).
  // 1:1 MON_DATA_IS_EGG / MARKINGS / MET_LEVEL / MET_LOCATION / POKEBALL / OT.
  mon.isEgg = inst.isEgg ? 1 : 0;
  mon.markings = inst.markings ?? 0;
  mon.metLevel = inst.metLevel ?? 0;
  mon.metLocation = inst.metLocation ? (resolveDecompConstant(inst.metLocation) as number | undefined ?? 0) : 0;
  mon.pokeball = inst.pokeball ? (resolveDecompConstant(inst.pokeball) as number | undefined ?? 0) : 0;
  mon.otName = inst.otName ?? '';
  mon.otGender = inst.otGender ?? 0;
  // Moves + PP
  for (let i = 0; i < MAX_MON_MOVES_PARTY; i++) {
    const m = inst.moves[i];
    if (m) {
      mon.moves[i] = _resolveMoveId(m.id);
      mon.pp[i] = m.pp;
    } else {
      mon.moves[i] = 0;
      mon.pp[i] = 0;
    }
  }
  // Stats — calculated via CalculateMonStats (= 1:1 décomp pokemon.c).
  // Maintenant on calcule depuis IVs/EVs/level/nature/baseStats au lieu de
  // les laisser à 0. C'est requis pour que le bytecode interpreter ait des
  // stats réelles à damage-calc.
  mon.attack = 0; mon.defense = 0; mon.speed = 0;
  mon.spAttack = 0; mon.spDefense = 0;
  // Délégué à CalculateMonStats ci-dessous.
  // IVs
  mon.hpIV = inst.ivs.hp & 0x1F;
  mon.attackIV = inst.ivs.atk & 0x1F;
  mon.defenseIV = inst.ivs.def & 0x1F;
  mon.speedIV = inst.ivs.spe & 0x1F;
  mon.spAttackIV = inst.ivs.spa & 0x1F;
  mon.spDefenseIV = inst.ivs.spd & 0x1F;
  // EVs
  mon.hpEV = inst.evs.hp & 0xFF;
  mon.attackEV = inst.evs.atk & 0xFF;
  mon.defenseEV = inst.evs.def & 0xFF;
  mon.speedEV = inst.evs.spe & 0xFF;
  mon.spAttackEV = inst.evs.spa & 0xFF;
  mon.spDefenseEV = inst.evs.spd & 0xFF;
  // Status
  if (inst.status) {
    const mapped = _STATUS_TO_STATUS1[inst.status] ?? 0;
    mon.status = mapped >>> 0;
  }
  // 1:1 décomp `CreateBoxMon` (pokemon.c:2297-2300) : abilityNum = personality & 1
  // UNIQUEMENT si l'espèce a une 2e ability (abilities[1] != ABILITY_NONE) ; sinon 0.
  // `GetAbilityBySpecies` (pokemon.c:4533) ne fait PAS de fallback → poser slot 1 sur
  // une espèce mono-ability donnerait ABILITY_NONE. AVANT : codé en dur 0.
  {
    const speciesEnum = reverseDecompConstant(mon.species, 'SPECIES_');
    const sinfo = speciesEnum ? getSpeciesInfo(speciesEnum) : null;
    const has2ndAbility = !!(sinfo && sinfo.abilities[1] && sinfo.abilities[1] !== 'ABILITY_NONE');
    mon.abilityNum = has2ndAbility ? ((mon.personality & 1) >>> 0) : 0;
  }
  // 1:1 décomp `CalculateMonStats(mon)` — calculate atk/def/spe/spa/spd/maxHP
  // depuis baseStats + IVs + EVs + level + nature.
  CalculateMonStats(mon);
  return mon;
}

// ─── CalculatePlayerPartyCount (= 1:1 décomp pokemon.c:7011) ─────────────

// CalculatePlayerPartyCount / GetMonsStateToDoubles / CalculateEnemyPartyCount :
// consolidés vers le foyer pokemon.c (src/pokemon.ts, = lisent gPlayerParty/gEnemyParty/GetMonData,
// tous au foyer désormais). Re-export pour compat (~12 importateurs inchangés).
export { CalculatePlayerPartyCount, GetMonsStateToDoubles, CalculateEnemyPartyCount } from '../../pokemon';

// GetBoxMonGender / GetMonGender : consolidés vers le foyer pokemon.c (src/pokemon.ts,
// à côté de GetGenderFromSpeciesAndPersonality). Réécrits 1:1 en numérique (sans le
// détour reverseDecompConstant). La sonde dev __GetMonGender suit l'impl dans pokemon.ts.

// ─── CheckPartyPokerus (= 1:1 décomp pokemon.c:6101-6127) ────────────────

// GetMonEVCount / CheckPartyPokerus / UpdatePartyPokerusTime : consolidés vers le foyer
// pokemon.c (src/pokemon.ts, = lisent GetMonData/gPlayerParty au foyer). Re-export pour compat.
export { GetMonEVCount, CheckPartyPokerus, UpdatePartyPokerusTime } from '../../pokemon';

// ─── AdjustFriendship (= 1:1 décomp pokemon.c:5901-5973) ─────────────────

/** 1:1 décomp `sFriendshipEventModifiers[][3]` (pokemon.c:2094-2105).
 *  Indexed by event id (0..8) × friendshipLevel (0=low, 1=med, 2=high).
 *  Value : signed mod to apply to mon.friendship. */
const _SFRIENDSHIP_EVENT_MODIFIERS: ReadonlyArray<ReadonlyArray<number>> = [
  [ 5,  3,  2],  // FRIENDSHIP_EVENT_GROW_LEVEL = 0
  [ 5,  3,  2],  // FRIENDSHIP_EVENT_VITAMIN = 1
  [ 1,  1,  0],  // FRIENDSHIP_EVENT_BATTLE_ITEM = 2
  [ 3,  2,  1],  // FRIENDSHIP_EVENT_LEAGUE_BATTLE = 3
  [ 1,  1,  0],  // FRIENDSHIP_EVENT_LEARN_TMHM = 4
  [ 1,  1,  1],  // FRIENDSHIP_EVENT_WALKING = 5
  [-1, -1, -1],  // FRIENDSHIP_EVENT_FAINT_SMALL = 6
  [-5, -5, -10], // FRIENDSHIP_EVENT_FAINT_FIELD_PSN = 7
  [-5, -5, -10], // FRIENDSHIP_EVENT_FAINT_LARGE = 8
];

const _MAX_FRIENDSHIP = 255;
const _SPECIES_EGG_VAL = 412;  // 1:1 décomp constants/species.h SPECIES_EGG.

/** 1:1 décomp `AdjustFriendship(mon, event)` (pokemon.c:5901-5973).
 *  Adjust mon.friendship selon l'event + friendshipLevel + hold effect bonuses.
 *
 *  Implémenté 1:1 : friendshipLevel (>99/>199), table sFriendshipEventModifiers,
 *  gate WALKING 50% (Random()&1), clamp 0..255.
 *
 *  Équivalents 1:1 (omis sans perte) :
 *    - ShouldSkipFriendshipChange = TRUE seulement en Frontier/Pike/Pyramid (sous-
 *      systèmes non portés) → toujours FALSE chez nous = même comportement.
 *
 *  Déférés (modifiers — bloqués par la fragilité du cast V/L et le risque de cycle) :
 *    - HOLD_EFFECT_FRIENDSHIP_UP +50% (Soothe Bell) + ITEM_LUXURY_BALL +1 : nécessitent
 *      heldItem/pokeball en NUMBER, mais le LIVE passe un PokemonInstance (string) →
 *      câblage V/L-aware requis (cf. bug #4). N'affecte que mod>0 sur events ≠ WALKING.
 *    - MET_LOCATION +1 : nécessite GetCurrentRegionMapSectionId (gMapHeader, field/) →
 *      importer field dans battle/ = risque de cycle d'init ESM (cf. deadlock rtc).
 *    - ITEM_ENIGMA_BERRY hold effect (rare) + LEAGUE_BATTLE trainer-class gate (niche). */
export function AdjustFriendship(mon: Pokemon, event: number): void {
  if (mon.species === 0 || mon.species === _SPECIES_EGG_VAL) return;
  if (event < 0 || event >= _SFRIENDSHIP_EVENT_MODIFIERS.length) return;

  let friendshipLevel = 0;
  if (mon.friendship > 99) friendshipLevel++;
  if (mon.friendship > 199) friendshipLevel++;

  // 1:1 décomp pokemon.c:5935-5939 : WALKING a 50% de chance de skip (le compteur
  // de pas overworld appelle ceci tous les 128 pas → ~1 gain tous les 256 pas).
  // ⚠️ État réel (audit 2026-06-05) : `UpdateFriendshipStepCounter` (field-control-
  // avatar) qui passerait WALKING ici est elle-même DORMANTE — son dispatch
  // `TryStartStepCountScript` n'est PAS porté → friendship-à-la-marche = 0 en LIVE
  // pour l'instant. Ce gate est donc 1:1-correct mais SANS effet live tant que le
  // dispatch de compteurs de pas n'est pas câblé (cf. tâches #13/#15 + rematch).
  if (event === 5 /* FRIENDSHIP_EVENT_WALKING */) {
    if (Random() & 1) return;
  }
  // 1:1 décomp pokemon.c:5941-5950 : LEAGUE_BATTLE — le gain n'est appliqué qu'en
  // combat DRESSEUR (BATTLE_TYPE_TRAINER) contre une classe Champion d'Arène / Conseil 4
  // / Maître. Globals battle lus via globalThis (cycle-safe : party-storage ne doit pas
  // importer l'état de combat ; pattern de GetTrainerBattleTransition). Constantes de
  // classe via resolveDecompConstant (pas de hardcode).
  if (event === 3 /* FRIENDSHIP_EVENT_LEAGUE_BATTLE */) {
    const _g = globalThis as {
      __battleState?: { gBattleTypeFlags?: number };
      __battleSetup?: { opponentA?: number };
      __gTrainers?: Record<number, { trainerClass?: number }>;
    };
    const _BATTLE_TYPE_TRAINER = 1 << 3;  // 1:1 décomp include/constants/battle.h.
    if (!((_g.__battleState?.gBattleTypeFlags ?? 0) & _BATTLE_TYPE_TRAINER)) return;
    const _cls = _g.__gTrainers?.[_g.__battleSetup?.opponentA ?? 0]?.trainerClass ?? -1;
    const _C = (n: string): number => (resolveDecompConstant(n) as number | undefined) ?? -2;
    if (_cls !== _C('TRAINER_CLASS_LEADER') && _cls !== _C('TRAINER_CLASS_ELITE_FOUR') && _cls !== _C('TRAINER_CLASS_CHAMPION')) {
      return;
    }
  }

  // 1:1 décomp pokemon.c:5952-5965 : Soothe Bell (HOLD_EFFECT_FRIENDSHIP_UP) → mod
  // +50% (arrondi bas) ; puis si mod > 0 : Luxury Ball → +1 ET met-location → +1.
  const _HOLD_EFFECT_FRIENDSHIP_UP = 27;  // 1:1 décomp include/constants/hold_effects.h:31.
  const _ITEM_LUXURY_BALL = 11;           // 1:1 décomp include/constants/items.h:17.
  const holdEffect = GetItemHoldEffect(mon.heldItem);
  let mod = _SFRIENDSHIP_EVENT_MODIFIERS[event][friendshipLevel];
  if (mod > 0 && holdEffect === _HOLD_EFFECT_FRIENDSHIP_UP) mod = Math.floor((150 * mod) / 100);
  let friendship = mon.friendship + mod;
  if (mod > 0) {
    if (mon.pokeball === _ITEM_LUXURY_BALL) friendship++;
    // met-location : mon.metLocation = MAPSEC numérique (pokemonInstanceToPokemon:551
    // convertit le string MAPSEC) ; GetCurrentRegionMapSectionId() = gMapHeader.region
    // MapSectionId (string → numérique via resolveDecompConstant).
    if (mon.metLocation === resolveDecompConstant(gMapHeader?.regionMapSectionId ?? '')) friendship++;
  }
  if (friendship < 0) friendship = 0;
  if (friendship > _MAX_FRIENDSHIP) friendship = _MAX_FRIENDSHIP;
  mon.friendship = friendship;
}

/** 1:1 décomp `void SetWildMonHeldItem(void)` (pokemon.c) : donne (ou non) un objet
 *  tenu au Pokémon sauvage (gEnemyParty[0]) selon les chances itemCommon/itemRare de
 *  son espèce. Sauté en combat légendaire / dresseur / Frontier Pyramid/Pike.
 *  ```c
 *  rnd = Random() % 100 ; species = gEnemyParty[0].species ;
 *  chanceNoItem = 45, chanceNotRare = 95 ; lead non-œuf + Compound Eyes → 20/80 ;
 *  if (itemCommon == itemRare && itemCommon != NONE)  → 100 % itemCommon
 *  else  rnd<noItem → rien ; rnd<notRare → itemCommon ; sinon → itemRare.
 *  ```
 *  Altering Cave (LAYOUT_ALTERING_CAVE) DÉFÉRÉ : la cave est inactive dans le jeu de
 *  base (VAR_ALTERING_CAVE_WILD_SET jamais posé → table normale), cf. wild_encounter.ts:265 ;
 *  on applique donc le chemin normal (1:1 du sous-cas « cave inactive »). Adaptations
 *  modèle : `gSpeciesInfo[species]` id-indexé (1:1) ; itemCommon/itemRare = string `ITEM_X`
 *  → number via resolveDecompConstant ; gBattleTypeFlags + bit-flags via globalThis/literaux
 *  (cycle-safe, pattern AdjustFriendship). */
export function SetWildMonHeldItem(): void {
  const _BATTLE_TYPE_TRAINER = 1 << 3;     // 1:1 décomp include/constants/battle.h
  const _BATTLE_TYPE_LEGENDARY = 1 << 13;
  const _BATTLE_TYPE_PIKE = 1 << 20;
  const _BATTLE_TYPE_PYRAMID = 1 << 21;
  const gBattleTypeFlags = (globalThis as { __battleState?: { gBattleTypeFlags?: number } }).__battleState?.gBattleTypeFlags ?? 0;
  if (gBattleTypeFlags & (_BATTLE_TYPE_LEGENDARY | _BATTLE_TYPE_TRAINER | _BATTLE_TYPE_PYRAMID | _BATTLE_TYPE_PIKE)) return;
  const rnd = Random() % 100;
  const species = GetMonData(gEnemyParty[0], MON_DATA_SPECIES) as number;
  let chanceNoItem = 45;
  let chanceNotRare = 95;
  if (!(GetMonData(gPlayerParty[0], MON_DATA_SANITY_IS_EGG) as number)
      && GetMonAbility(gPlayerParty[0]) === 14 /* ABILITY_COMPOUND_EYES (constants.ts:250) */) {
    chanceNoItem = 20;
    chanceNotRare = 80;
  }
  // ⚠️ 1:1 GAP (Dette R3, cohérent avec wild_encounter.ts:265 « ALTERING_CAVE ») : la décomp
  // (pokemon.c SetWildMonHeldItem) branche ici sur `gMapHeader.mapLayoutId == LAYOUT_ALTERING_CAVE`
  // → table spéciale `sAlteringCaveWildMonHeldItems` (Mareep→Ganlon Berry, etc.). NON porté : en
  // vanilla Altering Cave est INERTE (seul Zubat y apparaît, absent de la table → branche
  // « inactive » = objets normaux = ci-dessous), et le côté rencontre (espèces spéciales via
  // VAR_ALTERING_CAVE_WILD_SET) est lui aussi R3 debt. La voie NORMALE ci-dessous est 1:1.
  const info = gSpeciesInfo[species];
  const itemCommon = info ? ((resolveDecompConstant(info.itemCommon) as number | undefined) ?? 0) : 0;
  const itemRare = info ? ((resolveDecompConstant(info.itemRare) as number | undefined) ?? 0) : 0;
  if (itemCommon === itemRare && itemCommon !== 0 /* ITEM_NONE */) {
    // 1:1 décomp : les deux objets identiques (≠ NONE) → 100 % de chance.
    SetMonData(gEnemyParty[0], MON_DATA_HELD_ITEM, itemCommon);
  } else {
    if (rnd < chanceNoItem) return;
    if (rnd < chanceNotRare) SetMonData(gEnemyParty[0], MON_DATA_HELD_ITEM, itemCommon);
    else SetMonData(gEnemyParty[0], MON_DATA_HELD_ITEM, itemRare);
  }
}
// Sonde déterministe : SetWildMonHeldItem. Sans effet jeu.
(globalThis as Record<string, unknown>).__SetWildMonHeldItem = SetWildMonHeldItem;

// ─── MonGainEVs (= 1:1 décomp pokemon.c:5975-6052) ───────────────────────

const _MAX_TOTAL_EVS = 510;
const _MAX_PER_STAT_EVS = 255;

/** 1:1 décomp `MonGainEVs(mon, defeatedSpecies)`. Award EVs from defeated mon's
 *  evYield, cap à 510 total + 255 par stat.
 *
 *  ⚠️ DOUBLON MORT (audit 2026-06-05) : cette fonction n'est appelée NULLE PART.
 *  Le gain d'EV LIVE passe par `pokemon.ts:monGainEVs` (PokemonInstance) ; la voie-L
 *  bytecode passe par `battle-script-commands.ts:_MonGainEVs` (qui, LUI, câble bien
 *  Pokerus + Macho Brace). Cette copie-ci = candidate suppression (consolidation B1
 *  des 3 implémentations en une seule canonique).
 *
 *  Différés ici (NON câblés — contrairement à ce que prétendait l'ancien commentaire) :
 *    - Pokerus ×2 : `multiplier=1` en dur (PAS « wired via _CheckPartyHasHadPokerus »).
 *    - HOLD_EFFECT_MACHO_BRACE ×2 + ITEM_ENIGMA_BERRY hold effect : non câblés. */
export function MonGainEVs(mon: Pokemon, defeatedSpeciesEnum: string): void {
  if (mon.species === 0) return;
  const info = getSpeciesInfo(defeatedSpeciesEnum);
  if (!info?.evYield) return;
  const evYield = info.evYield;
  const evs = [mon.hpEV, mon.attackEV, mon.defenseEV, mon.speedEV, mon.spAttackEV, mon.spDefenseEV];
  let totalEVs = evs.reduce((s, v) => s + v, 0);
  const yields = [evYield.hp, evYield.atk, evYield.def, evYield.spe, evYield.spa, evYield.spd];

  for (let i = 0; i < 6; i++) {
    if (totalEVs >= _MAX_TOTAL_EVS) break;
    // ⚠️ Pokerus ×2 NON câblé ici (multiplier en dur = 1). Cf. JSDoc (doublon mort).
    const multiplier = 1;
    let evIncrease = yields[i] * multiplier;
    // MACHO_BRACE x2 hold effects deferred.

    // 1:1 décomp ll.6038-6046 : cap à MAX_TOTAL_EVS et MAX_PER_STAT_EVS.
    if (totalEVs + evIncrease > _MAX_TOTAL_EVS) {
      evIncrease = (evIncrease + _MAX_TOTAL_EVS) - (totalEVs + evIncrease);
    }
    if (evs[i] + evIncrease > _MAX_PER_STAT_EVS) {
      const val1 = evIncrease + _MAX_PER_STAT_EVS;
      const val2 = evs[i] + evIncrease;
      evIncrease = val1 - val2;
    }
    if (evIncrease < 0) evIncrease = 0;

    evs[i] += evIncrease;
    totalEVs += evIncrease;
  }
  mon.hpEV       = evs[0];
  mon.attackEV   = evs[1];
  mon.defenseEV  = evs[2];
  mon.speedEV    = evs[3];
  mon.spAttackEV = evs[4];
  mon.spDefenseEV = evs[5];
}

// ─── CalculateMonStats (= 1:1 décomp pokemon.c:1932-2017) ─────────────────

// `gNatureStatTable` + `ModifyStatByNature` + `GetNatureFromPersonality` = consolidés
// sur le miroir `src/game/pokemon.ts` (source unique 1:1, cf. import en tête).

// GetNature / CalculateMonStats (+ helpers _getNatureFromPersonality / _modifyStatByNature) :
// consolidés vers le foyer pokemon.c (src/pokemon.ts) — les helpers inlinés là-bas
// (GetNatureFromPersonality + ModifyStatByNature, same-file). CalculateMonStats : import-back
// + re-export via le bloc d'import en tête (user interne l.~339).

/** 1:1 décomp `gPPUpGetMask` (pokemon.c) — masque 2 bits par slot de move. */
export const gPPUpGetMask: readonly number[] = [0x03, 0x0c, 0x30, 0xc0];

/** 1:1 décomp `CalculatePPWithBonus(move, ppBonuses, moveIndex)` (pokemon.c:5005) :
 *  `basePP + (basePP * 20 * nbPPUp) / 100`, nbPPUp = `(gPPUpGetMask[moveIndex] &
 *  ppBonuses) >> (2*moveIndex)` (0..3), basePP = `gBattleMoves[move].pp`. Retourne u8.
 *  Fonction CANONIQUE (= source unique 1:1) ; battle-action/summary/bag délèguent ici. */
export function CalculatePPWithBonus(move: number, ppBonuses: number, moveIndex: number): number {
  const basePP = gBattleMoves[move]?.pp ?? 0;
  const ppUps = (gPPUpGetMask[moveIndex] & ppBonuses) >> (2 * moveIndex);
  return (basePP + Math.floor((basePP * 20 * ppUps) / 100)) & 0xff;
}

/** 1:1 décomp `void SetMonMoveSlot(struct Pokemon *mon, u16 move, u8 slot)` (pokemon.c:6600-6604) :
 *  ```c
 *  SetMonData(mon, MON_DATA_MOVE1 + slot, &move);
 *  SetMonData(mon, MON_DATA_PP1 + slot, &gBattleMoves[move].pp);
 *  ```
 *  Pose le move dans le slot + son PP de BASE (= sans PP Up). Primitif partagé
 *  par 10 fichiers décomp (Mimic, frontier, move_relearner, party_menu,
 *  evolution_scene…). NB : le décomp prend le PP brut `gBattleMoves[move].pp`,
 *  PAS `CalculatePPWithBonus` (ppBonuses ignorés à la pose d'un slot). */
export function SetMonMoveSlot(mon: Pokemon, move: number, slot: number): void {
  SetMonData(mon, MON_DATA_MOVE1 + slot, move);
  SetMonData(mon, MON_DATA_PP1 + slot, gBattleMoves[move]?.pp ?? 0);
}

/** Bridge inverse `Pokemon` → mise à jour de `PokemonInstance` (= persist
 *  HP/status/exp post-combat). */
export function syncPokemonToInstance(mon: Pokemon, inst: PokemonInstance): void {
  inst.currentHp = mon.hp;
  if (mon.experience !== undefined) inst.currentExp = mon.experience;
  // Status decode (= masque sur les bits stables, sleep turns ignored).
  const baseStatus = mon.status & 0xF8;
  inst.status = _STATUS1_TO_STATUS[baseStatus] ?? (mon.status & 0x07 ? 'SLP' : null);
  // Sync PP via moves array. GUARD `mon.moves[i] !== 0` : ne synchronise le PP QUE pour
  // les moves que la copie de combat possédait. Un move APPRIS pendant le combat (slot vide
  // en début de combat → mon.moves[i]===0) garde son PP plein (posé par makeMoveSlot) au lieu
  // d'être écrasé à 0 par la copie périmée. Corrige l'apprentissage on-field ET off-field.
  for (let i = 0; i < MAX_MON_MOVES_PARTY; i++) {
    if (inst.moves[i] && mon.moves[i] !== 0) inst.moves[i].pp = mon.pp[i];
  }
}

// ─── Party bridge (called at battle setup/end) ─────────────────────────────

/** 1:1 décomp `LoadPlayerParty` (load_save.c:170) — copie save→runtime côté
 *  joueur (`gPlayerParty[i] = block1.playerParty[i]`), à travers le pont
 *  PokemonInstance→Pokemon. Slots vides reset via `createEmptyPokemon`. Partagé
 *  par `setupPartyForBattle` (boot combat) et `LoadPlayerParty` (boot/load OW). */
export function loadPlayerPartyFromInstances(player: PokemonInstance[]): void {
  // ⚠️ Snapshot AVANT le reset : depuis le pivot (palier B), `player` peut être
  // `block1.playerParty` = des VUES LIVE sur gPlayerParty (combat sauvage via
  // wild-encounter, battle-flow). Reset gPlayerParty PUIS lire les vues les
  // viderait (elles pointent vers les slots qu'on vient de reset) → party de
  // combat vide. On convertit donc d'abord en Pokemon natifs (snapshot lu sur
  // gPlayerParty intact), ensuite on reset + ré-écrit. Pour les appelants qui
  // passent des natifs (harness/devtools) le résultat est identique.
  const n = Math.min(player.length, PARTY_SIZE);
  const snapshot: Pokemon[] = [];
  for (let i = 0; i < n; i++) snapshot.push(pokemonInstanceToPokemon(player[i]));
  for (let i = 0; i < PARTY_SIZE; i++) Object.assign(gPlayerParty[i], createEmptyPokemon());
  for (let i = 0; i < n; i++) Object.assign(gPlayerParty[i], snapshot[i]);
}

/** Fill gPlayerParty/gEnemyParty depuis runtime PokemonInstance arrays.
 *  Appelé au début de chaque combat. Les slots vides sont reset via
 *  `createEmptyPokemon`. */
export function setupEnemyPartyForBattle(enemy: PokemonInstance[]): void {
  for (let i = 0; i < PARTY_SIZE; i++) Object.assign(gEnemyParty[i], createEmptyPokemon());
  for (let i = 0; i < Math.min(enemy.length, PARTY_SIZE); i++) {
    Object.assign(gEnemyParty[i], pokemonInstanceToPokemon(enemy[i]));
  }
}

/** Setup gPlayerParty ET gEnemyParty. ⚠️ Migration Pokémon (étape 5) : depuis
 *  le pivot, `gPlayerParty` est la SOURCE de vérité (= la party joueur OW). Les
 *  combats RÉELS (wild/trainer) ne doivent donc PAS la remplacer — ils appellent
 *  `setupEnemyPartyForBattle` (ennemi seul) et lisent gPlayerParty direct. Cette
 *  fonction (qui REMPLACE gPlayerParty) reste pour les COMBATS DE TEST (devtools)
 *  qui veulent une party artificielle ; ⚠️ elle écrase la party joueur courante
 *  (à entourer d'un backup/restore côté appelant — cf. push/popTestPlayerParty). */
export function setupPartyForBattle(player: PokemonInstance[], enemy: PokemonInstance[]): void {
  backupOwPartyForTest();      // sauve la party OW (ce combat de TEST va écraser gPlayerParty)
  loadPlayerPartyFromInstances(player);
  setupEnemyPartyForBattle(enemy);
  RefreshPlayerPartyViews();   // block1.playerParty reflète la party de test (pas de vues fantômes)
}

// ─── Backup/restore party OW pour les COMBATS DE TEST (devtools) — échafaudage ──
// Depuis le pivot, gPlayerParty est la SOURCE (= party OW). `setupPartyForBattle`
// (test-only) la remplace par une party artificielle → écraserait la party OW.
// On sauvegarde la party OW au 1er setup et on la restaure au retour OW
// (FreeResetData_ReturnToOvOrDoEvolutions). Conditionnel : un combat RÉEL
// (setupEnemyPartyForBattle) ne backup PAS → restore = no-op (la party de combat
// EST la party OW, ses HP/XP post-combat persistent). 1:1 N/A (la décomp n'a pas
// de combat de test ; gPlayerParty y est l'unique party).
let sBackupOwParty: Pokemon[] | null = null;

export function backupOwPartyForTest(): void {
  if (sBackupOwParty) return;  // déjà sauvegardé (combat de test multi-setup)
  sBackupOwParty = gPlayerParty.map(m => {
    const c = createEmptyPokemon();
    Object.assign(c, m);
    c.moves = [...m.moves];
    c.pp = [...m.pp];
    return c;
  });
}

export function restoreOwPartyAfterTest(): void {
  if (!sBackupOwParty) return;
  for (let i = 0; i < PARTY_SIZE; i++) Object.assign(gPlayerParty[i], sBackupOwParty[i]);
  sBackupOwParty = null;
  RefreshPlayerPartyViews();
}

// ─── Migration Pokémon (palier B) : gPlayerParty = SOURCE, block1.playerParty = vues ──

/** Reconstruit la FAÇADE transitoire `gSaveBlock1Ptr.playerParty` = tableau de
 *  vues LIVE (`makePokemonInstanceView`) sur les slots PEUPLÉS de `gPlayerParty`
 *  (= la source de vérité). Les ~129 lecteurs OW (PokemonInstance) lisent ET
 *  mutent gPlayerParty À TRAVERS ces vues, sans churn. Appelé après chaque
 *  mutation STRUCTURELLE de gPlayerParty (ajout via GiveMonToPlayer, LoadPlayerParty).
 *  Transitoire : disparaîtra quand les lecteurs passeront à GetMonData(gPlayerParty)
 *  (P3) puis que PokemonInstance sera retiré (P4). */
export function RefreshPlayerPartyViews(): void {
  const views: PokemonInstance[] = [];
  for (let i = 0; i < PARTY_SIZE; i++) {
    if (gPlayerParty[i].species !== 0) views.push(makePokemonInstanceView(gPlayerParty[i]));
  }
  gSaveBlock1Ptr.playerParty = views;
  gSaveBlock1Ptr.playerPartyCount = views.length;
}

/** 1:1 décomp `u8 MON_GIVEN_TO_PARTY/PC/CANT_GIVE` (include/pokemon.h). Co-localisés
 *  avec gPlayerParty + GetMonData/SetMonData (= fragment de pokemon.c côté stockage) ;
 *  `pokemon.ts` les re-exporte pour les call-sites OW existants. */
export const MON_GIVEN_TO_PARTY = 0;
export const MON_GIVEN_TO_PC = 1;
export const MON_CANT_GIVE = 2;

/** 1:1 décomp `u8 GiveMonToPlayer(struct Pokemon *mon)` (pokemon.c:4412) :
 *    SetMonData(mon, MON_DATA_OT_NAME, gSaveBlock2Ptr->playerName);
 *    SetMonData(mon, MON_DATA_OT_GENDER, &gSaveBlock2Ptr->playerGender);
 *    SetMonData(mon, MON_DATA_OT_ID, gSaveBlock2Ptr->playerTrainerId);
 *    for (i = 0; i < PARTY_SIZE; i++)
 *        if (GetMonData(&gPlayerParty[i], MON_DATA_SPECIES) == SPECIES_NONE) break;
 *    if (i >= PARTY_SIZE) return CopyMonToPC(mon);
 *    CopyMon(&gPlayerParty[i], mon, sizeof(*mon));
 *    gPlayerPartyCount = i + 1;
 *    return MON_GIVEN_TO_PARTY;
 *
 *  Prend un `struct Pokemon` natif (P4a-suite : produit par `CreateMon`, ou par le
 *  pont `pokemonInstanceToPokemon` aux call-sites legacy/DEBUG/voie-V). Écrit dans
 *  `gPlayerParty` (la SOURCE de vérité) + rafraîchit la façade de vues. */
export function GiveMonToPlayer(mon: Pokemon): number {
  // 1:1 décomp pokemon.c:4416-4418 : le mon donné/capturé prend l'OT du joueur
  // (= nom joueur tel quel, VIDE si pas de nom ; pas de fallback 'UNDI').
  SetMonData(mon, MON_DATA_OT_NAME, GetPlayerNameString());
  SetMonData(mon, MON_DATA_OT_GENDER, gSaveBlock2Ptr.playerGender ?? 0);
  SetMonData(mon, MON_DATA_OT_ID, (gSaveBlock2Ptr.playerTrainerId ?? 0) >>> 0);
  // 1:1 décomp : premier slot SPECIES_NONE de gPlayerParty.
  let i = 0;
  for (; i < PARTY_SIZE; i++) if (gPlayerParty[i].species === 0 /* SPECIES_NONE */) break;
  if (i >= PARTY_SIZE) return CopyMonToPC(mon);
  Object.assign(gPlayerParty[i], mon);  // 1:1 CopyMon(&gPlayerParty[i], mon, sizeof(*mon))
  // 1:1 décomp : gPlayerPartyCount = i + 1 (notre décompte = playerPartyCount, posé
  // par RefreshPlayerPartyViews = views.length, == i+1 pour une party compacte).
  RefreshPlayerPartyViews();
  return MON_GIVEN_TO_PARTY;
}

/** 1:1 décomp `static u8 CopyMonToPC(struct Pokemon *mon)` (pokemon.c:4434-4465) :
 *  ```c
 *  SetPCBoxToSendMon(VarGet(VAR_PC_BOX_TO_SEND_MON));
 *  boxNo = StorageGetCurrentBox();
 *  do { for (boxPos…) if (boxes[boxNo][boxPos].species == NONE) {
 *      MonRestorePP(mon); CopyMon(checkingMon, &mon->box, …);
 *      gSpecialVar_MonBoxId/Pos = …;
 *      if (GetPCBoxToSendMon() != boxNo) FlagClear(FLAG_SHOWN_BOX_WAS_FULL_MESSAGE);
 *      VarSet(VAR_PC_BOX_TO_SEND_MON, boxNo); return MON_GIVEN_TO_PC; }
 *    boxNo = (boxNo+1) % TOTAL_BOXES_COUNT; } while (boxNo != StorageGetCurrentBox());
 *  return MON_CANT_GIVE;
 *  ```
 *  Range le mon dans le 1er slot PC libre (depuis la box courante, en bouclant).
 *  Dette R3 SOLDÉE : party pleine → mon au PC (au lieu d'être perdu). Adaptations
 *  modèle : box slot = PokemonInstance → conversion via pokemonToPokemonInstance ;
 *  storage via le hook `__getPokemonStorage` (cycle-safe : éviter d'importer save.ts
 *  lourd dans party-storage). MonRestorePP (PP au max) + gSpecialVar_MonBoxId/Pos
 *  (numéro pour le message « envoyé à la Boîte X ») = refinements différés. */
function CopyMonToPC(mon: Pokemon): number {
  const getStorage = (globalThis as { __getPokemonStorage?: () => PokemonStorage }).__getPokemonStorage;
  const storage = getStorage?.();
  if (!storage) {
    console.warn('[CopyMonToPC] storage PC pas prêt → CANT_GIVE');
    return MON_CANT_GIVE;
  }
  SetPCBoxToSendMon(VarGet('VAR_PC_BOX_TO_SEND_MON'));
  const startBox = storage.currentBox;  // 1:1 StorageGetCurrentBox()
  let boxNo = startBox;
  do {
    for (let boxPos = 0; boxPos < IN_BOX_COUNT; boxPos++) {
      const slot = storage.boxes[boxNo]?.[boxPos];
      if (!slot || !slot.speciesId) {  // 1:1 : GetBoxMonData(SPECIES) == SPECIES_NONE
        storage.boxes[boxNo][boxPos] = pokemonToPokemonInstance(mon);  // 1:1 CopyMon
        if (GetPCBoxToSendMon() !== boxNo) FlagClear('FLAG_SHOWN_BOX_WAS_FULL_MESSAGE');
        VarSet('VAR_PC_BOX_TO_SEND_MON', boxNo);
        return MON_GIVEN_TO_PC;
      }
    }
    boxNo = (boxNo + 1) % TOTAL_BOXES_COUNT;
  } while (boxNo !== startBox);
  return MON_CANT_GIVE;  // toutes les boîtes pleines
}

// IsOtherTrainer / IsTradedMon : consolidés vers le foyer pokemon.c (src/pokemon.ts,
// à côté de IsShinyOtIdPersonality). IsTradedMon lit mon.otName/otId en direct (modèle plat).
// La sonde dev __IsTradedMon suit l'impl dans pokemon.ts.

/** 1:1 décomp `SwitchPartyMon` (party_menu.c:3016-3030) côté STOCKAGE : swap le
 *  CONTENU des 2 slots `gPlayerParty` (la source) via un buffer temporaire. Les
 *  vues de la façade pointent vers les objets-slots → reflètent le swap
 *  automatiquement (aucun refresh nécessaire). */
export function SwitchPartyMonSlots(i: number, j: number): void {
  const tmp = createEmptyPokemon();
  Object.assign(tmp, gPlayerParty[i]);
  Object.assign(gPlayerParty[i], gPlayerParty[j]);
  Object.assign(gPlayerParty[j], tmp);
}

/** Sync HP/status/exp post-combat depuis gPlayerParty vers PokemonInstance
 *  arrays. */
export function teardownPartyAfterBattle(player: PokemonInstance[]): void {
  for (let i = 0; i < Math.min(player.length, PARTY_SIZE); i++) {
    // Skip les slots de combat VIDES (species 0) : un mon ajouté à l'équipe APRÈS le setup
    // (= mon capturé via GiveMonToPlayer) n'a pas de copie de combat dans gPlayerParty →
    // sans ce guard, syncPokemonToInstance écraserait son HP/exp avec une struct vide (0/0).
    if (gPlayerParty[i].species === 0) continue;
    syncPokemonToInstance(gPlayerParty[i], player[i]);
  }
}

/** 1:1 décomp `OpponentHandleGetMonData` + `BattleIntroDrawTrainersOrMonsSprites`
 *  fields setup (battle_controller_opponent.c:543-616 + battle_main.c:2742-2790).
 *
 *  Fill un `gBattleMons[battlerId]` slot depuis un Pokemon party slot. C'est
 *  l'équivalent simplifié du REQUEST_ALL_BATTLE + post-process décomp :
 *    1. Copie tous les fields plats (species/hp/maxHP/stats/IVs/moves/pp/etc.)
 *    2. Set types[0]/types[1] depuis gSpeciesInfo (= battle_main.c:2766-2767)
 *    3. Set ability via GetAbilityBySpecies (= battle_main.c:2768)
 *    4. Reset statStages[i] = 6 (= base stage, battle_main.c:2771-2772)
 *    5. Reset status2 = 0 (= battle_main.c:2773)
 *
 *  Source `partySource = 'player' | 'enemy'` picks gPlayerParty vs gEnemyParty.
 *  Source `partyIdx` = index dans la party (= 0..5).
 *
 *  Note : ce helper est appelé au début de chaque combat ET à chaque switch-in.
 *  Pour les switch-in mid-battle, le décomp utilise des controllers async; on
 *  fait sync direct ici (= simplification 1:1 fonctionnel). */
export function fillBattleMonFromParty(
  battlerId: number,
  partySource: 'player' | 'enemy',
  partyIdx: number,
): void {
  // AUDIT BUG FIX : import direct depuis state.ts (= même instance que bytecode
  // runtime). Avant : lazy via globalThis.__battleState.gBattleMons écrivait
  // dans une instance ESM différente du runtime → battle mons setup invisible
  // aux opcodes. Maintenant : import statique = même instance singleton.
  const mons = _gBattleMonsRuntime;
  if (!mons) {
    console.warn('[party-storage] gBattleMons not exposed yet — call fillBattleMonFromParty after state.ts init');
    return;
  }
  if (battlerId < 0 || battlerId >= mons.length) return;

  const party = partySource === 'player' ? gPlayerParty : gEnemyParty;
  if (partyIdx < 0 || partyIdx >= party.length) return;
  const src = party[partyIdx];
  const dst = mons[battlerId];

  // 1:1 décomp REQUEST_ALL_BATTLE field copy.
  dst.species = src.species;
  dst.item = src.heldItem;
  for (let i = 0; i < 4; i++) {
    dst.moves[i] = src.moves[i];
    dst.pp[i] = src.pp[i];
  }
  dst.ppBonuses = src.ppBonuses;
  dst.friendship = src.friendship;
  dst.experience = src.experience;
  dst.hpIV = src.hpIV;
  dst.attackIV = src.attackIV;
  dst.defenseIV = src.defenseIV;
  dst.speedIV = src.speedIV;
  dst.spAttackIV = src.spAttackIV;
  dst.spDefenseIV = src.spDefenseIV;
  dst.personality = src.personality;
  dst.status1 = src.status;
  dst.level = src.level;
  dst.hp = src.hp;
  dst.maxHP = src.maxHP;
  dst.attack = src.attack;
  dst.defense = src.defense;
  dst.speed = src.speed;
  dst.spAttack = src.spAttack;
  dst.spDefense = src.spDefense;
  dst.isEgg = src.isEgg !== 0;
  dst.abilityNum = src.abilityNum;
  dst.otId = src.otId;
  dst.nickname = src.nickname;
  dst.otName = src.otName;

  // 1:1 décomp battle_main.c:2766-2773 post-DataTransfer processing.
  const speciesEnum = reverseDecompConstant(src.species, 'SPECIES_');
  if (speciesEnum) {
    const info = getSpeciesInfo(speciesEnum);
    if (info?.types) {
      const t1 = resolveDecompConstant(info.types[0] ?? '');
      const t2 = resolveDecompConstant(info.types[1] ?? info.types[0] ?? '');
      dst.type1 = typeof t1 === 'number' ? t1 : 0;
      dst.type2 = typeof t2 === 'number' ? t2 : 0;
    }
  }
  dst.ability = GetAbilityBySpecies(src.species, src.abilityNum);

  // Reset stat stages à 6 (neutre). 1:1 décomp NUM_BATTLE_STATS = 8 (HP, ATK, DEF,
  // SPEED, SPATK, SPDEF, ACC, EVASION) → 8 slots (STAT_EVASION=7 inclus, sinon NaN).
  for (let i = 0; i < dst.statStages.length; i++) {
    dst.statStages[i] = 6;
  }
  dst.status2 = 0;
}

/** Setup le combat depuis le party joueur + le mon adverse. Appelé une fois
 *  au début du combat. Fill gBattleMons[0] (player active) et gBattleMons[1]
 *  (enemy active). Set gBattleStruct.battlerPartyIndexes[0/1] = 0.
 *
 *  Pour wire bytecode, ce helper doit être appelé APRÈS setupPartyForBattle. */
export function fillActiveBattleMonsForBattleStart(): void {
  fillBattleMonFromParty(0, 'player', 0);
  fillBattleMonFromParty(1, 'enemy', 0);
}

interface BattleMonLike {
  species: number; item: number;
  moves: number[]; pp: number[];
  ppBonuses: number; friendship: number; experience: number;
  hpIV: number; attackIV: number; defenseIV: number;
  speedIV: number; spAttackIV: number; spDefenseIV: number;
  personality: number; status1: number; level: number;
  hp: number; maxHP: number;
  attack: number; defense: number; speed: number;
  spAttack: number; spDefense: number;
  isEgg: boolean; abilityNum: number; otId: number;
  nickname: string; otName: string;
  type1: number; type2: number;
  ability: number;
  statStages: number[];
  status2: number;
}

// ─── GetAbilityBySpecies (= 1:1 décomp pokemon.c) ─────────────────────────

// GetAbilityBySpecies / GetMonAbility : consolidés vers le foyer pokemon.c (src/pokemon.ts).
// Import-back (users internes l.~480/960) + re-export = via le bloc d'import en tête du fichier.

// Silence unused warnings for helpers exposed for future reverse-conversion.
void speciesEnumToDexId; void moveEnumToDexId;

// ─── EmitSetMonData persistance bridge (Phase 1.4 wire) ────────────────────

import {
  gActiveBattler, gBattlerPartyIndexes,
} from './state';
import { GET_BATTLER_SIDE } from './constants';

// REQUEST_* constants (battle_controllers.h) — 1:1 décomp.
const REQUEST_HELDITEM_BATTLE_PSC   = 2;
const REQUEST_MOVES_PP_BATTLE_PSC   = 3;
const REQUEST_MOVE1_BATTLE_PSC      = 4;
// REQUEST_MOVE2..4 = 5..7
const REQUEST_PP_DATA_BATTLE_PSC    = 8;
const REQUEST_PPMOVE1_BATTLE_PSC    = 9;
// REQUEST_PPMOVE2..4 = 10..12
const REQUEST_OTID_BATTLE_PSC       = 17;
const REQUEST_EXP_BATTLE_PSC        = 18;
const REQUEST_HP_EV_BATTLE_PSC      = 19;
const REQUEST_ATK_EV_BATTLE_PSC     = 20;
const REQUEST_DEF_EV_BATTLE_PSC     = 21;
const REQUEST_SPEED_EV_BATTLE_PSC   = 22;
const REQUEST_SPATK_EV_BATTLE_PSC   = 23;
const REQUEST_SPDEF_EV_BATTLE_PSC   = 24;
const REQUEST_FRIENDSHIP_BATTLE_PSC = 25;
const REQUEST_POKERUS_BATTLE_PSC    = 26;
const REQUEST_STATUS_BATTLE_PSC     = 40;
const REQUEST_LEVEL_BATTLE_PSC      = 41;
const REQUEST_HP_BATTLE_PSC         = 42;
const REQUEST_MAX_HP_BATTLE_PSC     = 43;

/** Sync gActiveBattler's data au party-side Pokemon via SetMonData.
 *  1:1 décomp : le caller (= Cmd_*) a déjà write gBattleMons[gActiveBattler].X,
 *  cet emit persist au party-side pour le save block.
 *
 *  Cette fn est appelée par BtlController_EmitSetMonData via globalThis bridge
 *  (= éviter circular deps). */
// 1:1 décomp SetPlayerMonData (battle_controller_player.c:1949) : applique UNE requête
// SetMonData à UN mon donné. Extrait pour permettre l'itération multi-mon (Heal Bell).
function _applySetMonData(mon: Parameters<typeof SetMonData>[0], requestId: number, data: unknown, active: number): void {
  // Decode data : peut être un nombre direct, ou un Uint8Array/array.
  const value = typeof data === 'number' ? data : 0;

  switch (requestId) {
    // PP per move slot (PPMOVE1..4 = 9..12).
    case REQUEST_PPMOVE1_BATTLE_PSC:
      SetMonData(mon, MON_DATA_PP1, value); return;
    case REQUEST_PPMOVE1_BATTLE_PSC + 1:
      SetMonData(mon, MON_DATA_PP2, value); return;
    case REQUEST_PPMOVE1_BATTLE_PSC + 2:
      SetMonData(mon, MON_DATA_PP3, value); return;
    case REQUEST_PPMOVE1_BATTLE_PSC + 3:
      SetMonData(mon, MON_DATA_PP4, value); return;
    case REQUEST_HP_BATTLE_PSC:
      SetMonData(mon, MON_DATA_HP, value); return;
    case REQUEST_MAX_HP_BATTLE_PSC:
      SetMonData(mon, MON_DATA_MAX_HP, value); return;
    case REQUEST_STATUS_BATTLE_PSC:
      SetMonData(mon, MON_DATA_STATUS, value); return;
    case REQUEST_HELDITEM_BATTLE_PSC:
      SetMonData(mon, MON_DATA_HELD_ITEM, value); return;
    case REQUEST_LEVEL_BATTLE_PSC:
      SetMonData(mon, MON_DATA_LEVEL, value); return;
    case REQUEST_EXP_BATTLE_PSC:
      SetMonData(mon, MON_DATA_EXP, value); return;
    case REQUEST_HP_EV_BATTLE_PSC:
      SetMonData(mon, MON_DATA_HP_EV, value); return;
    case REQUEST_ATK_EV_BATTLE_PSC:
      SetMonData(mon, MON_DATA_ATK_EV, value); return;
    case REQUEST_DEF_EV_BATTLE_PSC:
      SetMonData(mon, MON_DATA_DEF_EV, value); return;
    case REQUEST_SPEED_EV_BATTLE_PSC:
      SetMonData(mon, MON_DATA_SPEED_EV, value); return;
    case REQUEST_SPATK_EV_BATTLE_PSC:
      SetMonData(mon, MON_DATA_SPATK_EV, value); return;
    case REQUEST_SPDEF_EV_BATTLE_PSC:
      SetMonData(mon, MON_DATA_SPDEF_EV, value); return;
    case REQUEST_FRIENDSHIP_BATTLE_PSC:
      SetMonData(mon, MON_DATA_FRIENDSHIP, value); return;
    case REQUEST_POKERUS_BATTLE_PSC:
      SetMonData(mon, MON_DATA_POKERUS, value); return;
    case REQUEST_OTID_BATTLE_PSC:
      SetMonData(mon, MON_DATA_OT_ID, value); return;
    case REQUEST_MOVE1_BATTLE_PSC:
      SetMonData(mon, MON_DATA_MOVE1, value); return;
    case REQUEST_MOVE1_BATTLE_PSC + 1:
      SetMonData(mon, MON_DATA_MOVE2, value); return;
    case REQUEST_MOVE1_BATTLE_PSC + 2:
      SetMonData(mon, MON_DATA_MOVE3, value); return;
    case REQUEST_MOVE1_BATTLE_PSC + 3:
      SetMonData(mon, MON_DATA_MOVE4, value); return;
    case REQUEST_MOVES_PP_BATTLE_PSC:
    case REQUEST_PP_DATA_BATTLE_PSC:
      // Sync all 4 moves+pp à partir des battle mons (déjà write).
      if (_gBattleMonsRuntime[active]) {
        const bm = _gBattleMonsRuntime[active];
        for (let i = 0; i < 4; i++) {
          SetMonData(mon, MON_DATA_MOVE1 + i, bm.moves[i]);
          SetMonData(mon, MON_DATA_PP1 + i, bm.pp[i]);
        }
        SetMonData(mon, MON_DATA_PP_BONUSES, bm.ppBonuses);
      }
      return;
    default:
      // Other requests (cool, charm, etc.) — deferred Phase 1.4+.
      return;
  }
}

/** 1:1 décomp `SetPlayerMonData(monId)` / `SetOpponentMonData(monId)`
 *  (battle_controller_player.c:116) : le handler désérialise `gBattleBufferA[active]` =
 *  `[SETMONDATA, requestId, monToCheck, bytes, ...dataLE]` puis `SetMonData(&party[monId],
 *  requestId, &bufferA[4])`. Ici : reconstruit l'entier LE depuis bufferA[4..4+bytes] et
 *  applique au mon `monId` de la party du côté du battler actif (via `_applySetMonData`).
 *  Remplace l'ancien side-channel `__batPSetMonByActive` : la donnée passe MAINTENANT par le
 *  round-trip bufferA comme la décomp (1:1), l'apply n'est plus court-circuité dans l'Emit.
 *  `bufferA` est PASSÉ en arg (= pas d'import de gBattleBufferA ici → pas de cycle). */
export function SetBattleMonDataFromBuffer(monId: number, bufferA: ArrayLike<number>, active: number): void {
  const requestId = bufferA[1];
  const bytes = bufferA[3];
  let value = 0;
  for (let i = 0; i < bytes; i++) value |= (bufferA[4 + i] & 0xFF) << (8 * i);
  value = value >>> 0;  // entier non-signé (status1 = 4 octets, bit de poids fort possible)
  const side = GET_BATTLER_SIDE(active);
  const party = side === 0 ? gPlayerParty : gEnemyParty;
  if (monId < 0 || monId >= 6) return;
  const mon = party[monId];
  if (mon) _applySetMonData(mon, requestId, value, active);
}

// (__gPlayerParty/__gEnemyParty exposés depuis le foyer pokemon.ts désormais — évite tout
//  accès top-level à gPlayerParty ici, donc zéro TDZ sur l'import depuis pokemon.ts.)
// Sonde déterministe : GiveMonToPlayer (party plein → CopyMonToPC). Sans effet jeu.
(globalThis as Record<string, unknown>).__GiveMonToPlayer = GiveMonToPlayer;
// Sonde déterministe : AdjustFriendship (gate LEAGUE_BATTLE). Sans effet jeu.
(globalThis as Record<string, unknown>).__AdjustFriendship = AdjustFriendship;

