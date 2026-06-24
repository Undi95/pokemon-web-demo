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
import { GetPlayerNameString } from '../system/string-buffers';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from '../save/save-block-state';
import {
  speciesEnumToDexId, moveEnumToDexId, makePokemonInstanceView,
  GetGenderFromSpeciesAndPersonality,
} from '../pokemon/pokemon';
import { resolveDecompConstant, reverseDecompConstant } from '../../../harness/runtime/decomp-constants';
import { gMapHeader } from '../../fieldmap';
// Helpers purs nature/stat → miroir 1:1 `src/game/pokemon.ts` (source unique).
import { GetNatureFromPersonality, ModifyStatByNature } from '../../../include/pokemon';
import {
  PLAYER_HAS_TWO_USABLE_MONS, PLAYER_HAS_ONE_MON, PLAYER_HAS_ONE_USABLE_MON,
} from '../../../include/constants/pokemon';
// 1:1 décomp `Random()` (random.c) — pour le gate 50% de friendship-WALKING
// (AdjustFriendship). random.ts = leaf pur (zéro import) → aucun cycle possible.
import { Random } from '../../random';
import { getSpeciesInfo, gBattleMoves } from '../data/game-data';
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

// ─── struct Pokemon ─ 1:1 décomp `include/pokemon.h:219..232` ─────────────

/** 1:1 décomp `struct Pokemon` champs plats accessibles (= notre version
 *  decoded ; le décomp stocke certains champs dans BoxPokemon.secure.substructs
 *  encrypted). */
export interface Pokemon {
  // BoxPokemon fields
  personality: number;   // u32
  otId: number;          // u32
  nickname: string;      // 10 chars max
  language: number;      // u8
  isBadEgg: number;      // bit
  hasSpecies: number;    // bit
  isEgg: number;         // bit
  otName: string;        // 7 chars max
  markings: number;      // u8
  // Substruct0
  species: number;       // u16
  heldItem: number;      // u16
  experience: number;    // u32
  ppBonuses: number;     // u8
  friendship: number;    // u8
  // Substruct1
  moves: number[];       // 4 × u16
  pp: number[];          // 4 × u8
  // Substruct2 — EVs (post-battle gain) + condition stats
  hpEV: number; attackEV: number; defenseEV: number;
  speedEV: number; spAttackEV: number; spDefenseEV: number;
  // Conditions concours (1:1 décomp pokemon.h:123-128 struct PokemonSubstruct2)
  // — u8 0..255, montées par les Pokéblocs. Optionnelles (= 0 par défaut via
  // `?? 0`) pour ne casser aucun constructeur. Avant : GetMonData(MON_DATA_COOL..
  // SHEEN) tombait en `default` → 0 silencieux (= trou 1:1, ex. CheckLeadMon*).
  cool?: number;
  beauty?: number;
  cute?: number;
  smart?: number;
  tough?: number;
  sheen?: number;
  // Substruct3
  pokerus: number;       // u8
  metLocation: number;   // u8
  metLevel: number;      // bit field
  metGame: number;       // bit field
  pokeball: number;      // bit field
  otGender: number;      // bit field
  hpIV: number; attackIV: number; defenseIV: number;
  speedIV: number; spAttackIV: number; spDefenseIV: number;
  abilityNum: number;
  modernFatefulEncounter: number;
  // Substruct3 ribbons — 1:1 décomp pokemon.h:150-167. Optionnels (= 0 par
  // défaut via `?? 0`) pour ne casser aucun autre constructeur de Pokemon.
  // Concours (3 bits, rang 0-4) :
  coolRibbon?: number;
  beautyRibbon?: number;
  cuteRibbon?: number;
  smartRibbon?: number;
  toughRibbon?: number;
  // Award (1 bit chacun, sauf unusedRibbons = 4 bits) :
  championRibbon?: number;
  winningRibbon?: number;
  victoryRibbon?: number;
  artistRibbon?: number;
  effortRibbon?: number;
  marineRibbon?: number;
  landRibbon?: number;
  skyRibbon?: number;
  countryRibbon?: number;
  nationalRibbon?: number;
  earthRibbon?: number;
  worldRibbon?: number;
  unusedRibbons?: number;
  // Pokemon (non-box) fields
  status: number;        // u32 (STATUS1_* flags)
  level: number;         // u8
  mail: number;          // u8
  hp: number;            // u16
  maxHP: number;         // u16
  attack: number;        // u16
  defense: number;       // u16
  speed: number;         // u16
  spAttack: number;      // u16
  spDefense: number;     // u16
}

/** Create un Pokemon vide (= ZeroMonData équivalent). */
export function createEmptyPokemon(): Pokemon {
  return {
    personality: 0, otId: 0, nickname: '', language: 0,
    isBadEgg: 0, hasSpecies: 0, isEgg: 0,
    otName: '', markings: 0,
    species: 0, heldItem: 0, experience: 0,
    ppBonuses: 0, friendship: 0,
    moves: [0, 0, 0, 0], pp: [0, 0, 0, 0],
    hpEV: 0, attackEV: 0, defenseEV: 0,
    speedEV: 0, spAttackEV: 0, spDefenseEV: 0,
    cool: 0, beauty: 0, cute: 0, smart: 0, tough: 0, sheen: 0,
    pokerus: 0, metLocation: 0, metLevel: 0, metGame: 0,
    pokeball: 0, otGender: 0,
    hpIV: 0, attackIV: 0, defenseIV: 0,
    speedIV: 0, spAttackIV: 0, spDefenseIV: 0,
    abilityNum: 0, modernFatefulEncounter: 0,
    coolRibbon: 0, beautyRibbon: 0, cuteRibbon: 0, smartRibbon: 0, toughRibbon: 0,
    championRibbon: 0, winningRibbon: 0, victoryRibbon: 0, artistRibbon: 0, effortRibbon: 0,
    marineRibbon: 0, landRibbon: 0, skyRibbon: 0, countryRibbon: 0, nationalRibbon: 0,
    earthRibbon: 0, worldRibbon: 0, unusedRibbons: 0,
    status: 0, level: 0, mail: 0,
    hp: 0, maxHP: 0,
    attack: 0, defense: 0, speed: 0,
    spAttack: 0, spDefense: 0,
  };
}

// ─── gPlayerParty / gEnemyParty (= 1:1 décomp pokemon.h:374-376) ──────────

export const gPlayerParty: Pokemon[] = Array.from({ length: PARTY_SIZE }, createEmptyPokemon);
export const gEnemyParty: Pokemon[] = Array.from({ length: PARTY_SIZE }, createEmptyPokemon);

// ─── GetMonData / SetMonData (= 1:1 décomp pokemon.c) ─────────────────────

/** 1:1 décomp `GetMonData(mon, field, data)`. Pour les champs string
 *  (NICKNAME/OT_NAME), passe `data` = u8[] buffer destination ; sinon retourne
 *  la valeur. Notre port simplifié : retourne `string | number`. */
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

export function GetMonData(mon: Pokemon, field: number): number | string {
  switch (field) {
    case MON_DATA_PERSONALITY: return mon.personality >>> 0;
    case MON_DATA_OT_ID: return mon.otId >>> 0;
    case MON_DATA_NICKNAME: return mon.nickname;
    case MON_DATA_LANGUAGE: return mon.language;
    case MON_DATA_SANITY_IS_BAD_EGG: return mon.isBadEgg;
    case MON_DATA_SANITY_HAS_SPECIES: return mon.hasSpecies;
    case MON_DATA_SANITY_IS_EGG: return mon.isEgg;
    case MON_DATA_OT_NAME: return mon.otName;
    case MON_DATA_MARKINGS: return mon.markings;
    case MON_DATA_SPECIES: return mon.species;
    case MON_DATA_HELD_ITEM: return mon.heldItem;
    case MON_DATA_MOVE1: return mon.moves[0];
    case MON_DATA_MOVE2: return mon.moves[1];
    case MON_DATA_MOVE3: return mon.moves[2];
    case MON_DATA_MOVE4: return mon.moves[3];
    case MON_DATA_PP1: return mon.pp[0];
    case MON_DATA_PP2: return mon.pp[1];
    case MON_DATA_PP3: return mon.pp[2];
    case MON_DATA_PP4: return mon.pp[3];
    case MON_DATA_PP_BONUSES: return mon.ppBonuses;
    case MON_DATA_EXP: return mon.experience;
    case MON_DATA_HP_EV: return mon.hpEV;
    case MON_DATA_ATK_EV: return mon.attackEV;
    case MON_DATA_DEF_EV: return mon.defenseEV;
    case MON_DATA_SPEED_EV: return mon.speedEV;
    case MON_DATA_SPATK_EV: return mon.spAttackEV;
    case MON_DATA_SPDEF_EV: return mon.spDefenseEV;
    case MON_DATA_FRIENDSHIP: return mon.friendship;
    case MON_DATA_POKERUS: return mon.pokerus;
    case MON_DATA_MET_LOCATION: return mon.metLocation;
    case MON_DATA_MET_LEVEL: return mon.metLevel;
    case MON_DATA_MET_GAME: return mon.metGame;
    case MON_DATA_POKEBALL: return mon.pokeball;
    case MON_DATA_OT_GENDER: return mon.otGender;
    case MON_DATA_HP_IV: return mon.hpIV;
    case MON_DATA_ATK_IV: return mon.attackIV;
    case MON_DATA_DEF_IV: return mon.defenseIV;
    case MON_DATA_SPEED_IV: return mon.speedIV;
    case MON_DATA_SPATK_IV: return mon.spAttackIV;
    case MON_DATA_SPDEF_IV: return mon.spDefenseIV;
    case MON_DATA_IS_EGG: return mon.isEgg;
    case MON_DATA_ABILITY_NUM: return mon.abilityNum;
    case MON_DATA_STATUS: return mon.status >>> 0;
    case MON_DATA_LEVEL: return mon.level;
    case MON_DATA_HP: return mon.hp;
    case MON_DATA_MAX_HP: return mon.maxHP;
    case MON_DATA_ATK: return mon.attack;
    case MON_DATA_DEF: return mon.defense;
    case MON_DATA_SPEED: return mon.speed;
    case MON_DATA_SPATK: return mon.spAttack;
    case MON_DATA_SPDEF: return mon.spDefense;
    case MON_DATA_MAIL: return mon.mail;
    case MON_DATA_SPECIES_OR_EGG:
      // 1:1 décomp : species si pas egg, sinon SPECIES_EGG (= 0).
      return mon.isEgg ? 0 : mon.species;
    case MON_DATA_IVS:
      // 1:1 décomp : packed 30-bit u32 (= hp..spdef × 5 bits chacun).
      return ((mon.hpIV & 0x1F)
            | ((mon.attackIV & 0x1F) << 5)
            | ((mon.defenseIV & 0x1F) << 10)
            | ((mon.speedIV & 0x1F) << 15)
            | ((mon.spAttackIV & 0x1F) << 20)
            | ((mon.spDefenseIV & 0x1F) << 25)) >>> 0;
    // 1:1 décomp pokemon.c GetBoxMonData:3869-3886 : conditions concours (substruct2->X).
    case MON_DATA_COOL: return mon.cool ?? 0;
    case MON_DATA_BEAUTY: return mon.beauty ?? 0;
    case MON_DATA_CUTE: return mon.cute ?? 0;
    case MON_DATA_SMART: return mon.smart ?? 0;
    case MON_DATA_TOUGH: return mon.tough ?? 0;
    case MON_DATA_SHEEN: return mon.sheen ?? 0;
    // 1:1 décomp pokemon.c GetBoxMonData : rubans (champ direct). Concours = rang.
    case MON_DATA_COOL_RIBBON: return mon.coolRibbon ?? 0;
    case MON_DATA_BEAUTY_RIBBON: return mon.beautyRibbon ?? 0;
    case MON_DATA_CUTE_RIBBON: return mon.cuteRibbon ?? 0;
    case MON_DATA_SMART_RIBBON: return mon.smartRibbon ?? 0;
    case MON_DATA_TOUGH_RIBBON: return mon.toughRibbon ?? 0;
    case MON_DATA_CHAMPION_RIBBON: return mon.championRibbon ?? 0;
    case MON_DATA_WINNING_RIBBON: return mon.winningRibbon ?? 0;
    case MON_DATA_VICTORY_RIBBON: return mon.victoryRibbon ?? 0;
    case MON_DATA_ARTIST_RIBBON: return mon.artistRibbon ?? 0;
    case MON_DATA_EFFORT_RIBBON: return mon.effortRibbon ?? 0;
    case MON_DATA_MARINE_RIBBON: return mon.marineRibbon ?? 0;
    case MON_DATA_LAND_RIBBON: return mon.landRibbon ?? 0;
    case MON_DATA_SKY_RIBBON: return mon.skyRibbon ?? 0;
    case MON_DATA_COUNTRY_RIBBON: return mon.countryRibbon ?? 0;
    case MON_DATA_NATIONAL_RIBBON: return mon.nationalRibbon ?? 0;
    case MON_DATA_EARTH_RIBBON: return mon.earthRibbon ?? 0;
    case MON_DATA_WORLD_RIBBON: return mon.worldRibbon ?? 0;
    case MON_DATA_UNUSED_RIBBONS: return mon.unusedRibbons ?? 0;
    case MON_DATA_MODERN_FATEFUL_ENCOUNTER: return mon.modernFatefulEncounter;
    case MON_DATA_KNOWN_MOVES: {
      // 1:1 décomp : bitmask des 4 moves slots qui ont un move défini.
      let mask = 0;
      for (let i = 0; i < MAX_MON_MOVES_PARTY; i++) {
        if (mon.moves[i] !== 0) mask |= (1 << i);
      }
      return mask;
    }
    case MON_DATA_RIBBON_COUNT: {
      // 1:1 décomp pokemon.c GetBoxMonData : somme de tous les rubans (concours
      // = rangs additionnés + award 1 bit), uniquement si species && !egg.
      if (!mon.species || mon.isEgg) return 0;
      return (mon.coolRibbon ?? 0) + (mon.beautyRibbon ?? 0) + (mon.cuteRibbon ?? 0)
           + (mon.smartRibbon ?? 0) + (mon.toughRibbon ?? 0) + (mon.championRibbon ?? 0)
           + (mon.winningRibbon ?? 0) + (mon.victoryRibbon ?? 0) + (mon.artistRibbon ?? 0)
           + (mon.effortRibbon ?? 0) + (mon.marineRibbon ?? 0) + (mon.landRibbon ?? 0)
           + (mon.skyRibbon ?? 0) + (mon.countryRibbon ?? 0) + (mon.nationalRibbon ?? 0)
           + (mon.earthRibbon ?? 0) + (mon.worldRibbon ?? 0);
    }
    case MON_DATA_RIBBONS: {
      // 1:1 décomp pokemon.c GetBoxMonData : rubans packés en u32 (positions de
      // bits exactes), uniquement si species && !egg.
      if (!mon.species || mon.isEgg) return 0;
      return ((mon.championRibbon ?? 0)
            | ((mon.coolRibbon ?? 0) << 1)
            | ((mon.beautyRibbon ?? 0) << 4)
            | ((mon.cuteRibbon ?? 0) << 7)
            | ((mon.smartRibbon ?? 0) << 10)
            | ((mon.toughRibbon ?? 0) << 13)
            | ((mon.winningRibbon ?? 0) << 16)
            | ((mon.victoryRibbon ?? 0) << 17)
            | ((mon.artistRibbon ?? 0) << 18)
            | ((mon.effortRibbon ?? 0) << 19)
            | ((mon.marineRibbon ?? 0) << 20)
            | ((mon.landRibbon ?? 0) << 21)
            | ((mon.skyRibbon ?? 0) << 22)
            | ((mon.countryRibbon ?? 0) << 23)
            | ((mon.nationalRibbon ?? 0) << 24)
            | ((mon.earthRibbon ?? 0) << 25)
            | ((mon.worldRibbon ?? 0) << 26)) >>> 0;
    }
    case MON_DATA_ATK2: return mon.attack;
    case MON_DATA_DEF2: return mon.defense;
    case MON_DATA_SPEED2: return mon.speed;
    case MON_DATA_SPATK2: return mon.spAttack;
    case MON_DATA_SPDEF2: return mon.spDefense;
    default:
      return 0;
  }
}

/** 1:1 décomp `SetMonData(mon, field, dataArg)`. */
export function SetMonData(mon: Pokemon, field: number, value: number | string): void {
  const v = typeof value === 'number' ? value : 0;
  const s = typeof value === 'string' ? value : '';
  switch (field) {
    case MON_DATA_PERSONALITY: mon.personality = v >>> 0; return;
    case MON_DATA_OT_ID: mon.otId = v >>> 0; return;
    case MON_DATA_NICKNAME: mon.nickname = s; return;
    case MON_DATA_LANGUAGE: mon.language = v & 0xFF; return;
    case MON_DATA_SANITY_IS_BAD_EGG: mon.isBadEgg = v ? 1 : 0; return;
    case MON_DATA_SANITY_HAS_SPECIES: mon.hasSpecies = v ? 1 : 0; return;
    case MON_DATA_SANITY_IS_EGG: mon.isEgg = v ? 1 : 0; return;
    case MON_DATA_OT_NAME: mon.otName = s; return;
    case MON_DATA_MARKINGS: mon.markings = v & 0xFF; return;
    case MON_DATA_SPECIES: mon.species = v & 0xFFFF; mon.hasSpecies = mon.species ? 1 : 0; return;
    case MON_DATA_HELD_ITEM: mon.heldItem = v & 0xFFFF; return;
    case MON_DATA_MOVE1: mon.moves[0] = v & 0xFFFF; return;
    case MON_DATA_MOVE2: mon.moves[1] = v & 0xFFFF; return;
    case MON_DATA_MOVE3: mon.moves[2] = v & 0xFFFF; return;
    case MON_DATA_MOVE4: mon.moves[3] = v & 0xFFFF; return;
    case MON_DATA_PP1: mon.pp[0] = v & 0xFF; return;
    case MON_DATA_PP2: mon.pp[1] = v & 0xFF; return;
    case MON_DATA_PP3: mon.pp[2] = v & 0xFF; return;
    case MON_DATA_PP4: mon.pp[3] = v & 0xFF; return;
    case MON_DATA_PP_BONUSES: mon.ppBonuses = v & 0xFF; return;
    case MON_DATA_EXP: mon.experience = v >>> 0; return;
    case MON_DATA_HP_EV: mon.hpEV = v & 0xFF; return;
    case MON_DATA_ATK_EV: mon.attackEV = v & 0xFF; return;
    case MON_DATA_DEF_EV: mon.defenseEV = v & 0xFF; return;
    case MON_DATA_SPEED_EV: mon.speedEV = v & 0xFF; return;
    case MON_DATA_SPATK_EV: mon.spAttackEV = v & 0xFF; return;
    case MON_DATA_SPDEF_EV: mon.spDefenseEV = v & 0xFF; return;
    case MON_DATA_FRIENDSHIP: mon.friendship = v & 0xFF; return;
    case MON_DATA_POKERUS: mon.pokerus = v & 0xFF; return;
    case MON_DATA_MET_LOCATION: mon.metLocation = v & 0xFF; return;
    case MON_DATA_MET_LEVEL: mon.metLevel = v & 0x7F; return;
    case MON_DATA_MET_GAME: mon.metGame = v & 0x0F; return;
    case MON_DATA_POKEBALL: mon.pokeball = v & 0x0F; return;
    case MON_DATA_OT_GENDER: mon.otGender = v & 1; return;
    case MON_DATA_HP_IV: mon.hpIV = v & 0x1F; return;
    case MON_DATA_ATK_IV: mon.attackIV = v & 0x1F; return;
    case MON_DATA_DEF_IV: mon.defenseIV = v & 0x1F; return;
    case MON_DATA_SPEED_IV: mon.speedIV = v & 0x1F; return;
    case MON_DATA_SPATK_IV: mon.spAttackIV = v & 0x1F; return;
    case MON_DATA_SPDEF_IV: mon.spDefenseIV = v & 0x1F; return;
    case MON_DATA_IS_EGG: mon.isEgg = v ? 1 : 0; return;
    case MON_DATA_ABILITY_NUM: mon.abilityNum = v & 1; return;
    case MON_DATA_STATUS: mon.status = v >>> 0; return;
    case MON_DATA_LEVEL: mon.level = v & 0xFF; return;
    case MON_DATA_HP: mon.hp = v & 0xFFFF; return;
    case MON_DATA_MAX_HP: mon.maxHP = v & 0xFFFF; return;
    case MON_DATA_ATK: mon.attack = v & 0xFFFF; return;
    case MON_DATA_DEF: mon.defense = v & 0xFFFF; return;
    case MON_DATA_SPEED: mon.speed = v & 0xFFFF; return;
    case MON_DATA_SPATK: mon.spAttack = v & 0xFFFF; return;
    case MON_DATA_SPDEF: mon.spDefense = v & 0xFFFF; return;
    case MON_DATA_MAIL: mon.mail = v & 0xFF; return;
    case MON_DATA_MODERN_FATEFUL_ENCOUNTER: mon.modernFatefulEncounter = v ? 1 : 0; return;
    // 1:1 décomp pokemon.c SetBoxMonData:4258-4275 : conditions concours (SET8 = u8).
    case MON_DATA_COOL: mon.cool = v & 0xFF; return;
    case MON_DATA_BEAUTY: mon.beauty = v & 0xFF; return;
    case MON_DATA_CUTE: mon.cute = v & 0xFF; return;
    case MON_DATA_SMART: mon.smart = v & 0xFF; return;
    case MON_DATA_TOUGH: mon.tough = v & 0xFF; return;
    case MON_DATA_SHEEN: mon.sheen = v & 0xFF; return;
    // 1:1 décomp pokemon.c SetBoxMonData : rubans (concours 3 bits, award 1 bit,
    // unusedRibbons 4 bits). Avant : tombaient en `default` → écriture silencieusement
    // ignorée (= vrai trou 1:1, ex. GiveGiftRibbonToParty / Champion Ribbon no-op).
    case MON_DATA_COOL_RIBBON: mon.coolRibbon = v & 7; return;
    case MON_DATA_BEAUTY_RIBBON: mon.beautyRibbon = v & 7; return;
    case MON_DATA_CUTE_RIBBON: mon.cuteRibbon = v & 7; return;
    case MON_DATA_SMART_RIBBON: mon.smartRibbon = v & 7; return;
    case MON_DATA_TOUGH_RIBBON: mon.toughRibbon = v & 7; return;
    case MON_DATA_CHAMPION_RIBBON: mon.championRibbon = v & 1; return;
    case MON_DATA_WINNING_RIBBON: mon.winningRibbon = v & 1; return;
    case MON_DATA_VICTORY_RIBBON: mon.victoryRibbon = v & 1; return;
    case MON_DATA_ARTIST_RIBBON: mon.artistRibbon = v & 1; return;
    case MON_DATA_EFFORT_RIBBON: mon.effortRibbon = v & 1; return;
    case MON_DATA_MARINE_RIBBON: mon.marineRibbon = v & 1; return;
    case MON_DATA_LAND_RIBBON: mon.landRibbon = v & 1; return;
    case MON_DATA_SKY_RIBBON: mon.skyRibbon = v & 1; return;
    case MON_DATA_COUNTRY_RIBBON: mon.countryRibbon = v & 1; return;
    case MON_DATA_NATIONAL_RIBBON: mon.nationalRibbon = v & 1; return;
    case MON_DATA_EARTH_RIBBON: mon.earthRibbon = v & 1; return;
    case MON_DATA_WORLD_RIBBON: mon.worldRibbon = v & 1; return;
    case MON_DATA_UNUSED_RIBBONS: mon.unusedRibbons = v & 0xF; return;
    case MON_DATA_IVS:
      // 1:1 décomp : unpack packed 30-bit u32 vers 6 IVs.
      mon.hpIV = (v >>> 0) & 0x1F;
      mon.attackIV = ((v >>> 0) >>> 5) & 0x1F;
      mon.defenseIV = ((v >>> 0) >>> 10) & 0x1F;
      mon.speedIV = ((v >>> 0) >>> 15) & 0x1F;
      mon.spAttackIV = ((v >>> 0) >>> 20) & 0x1F;
      mon.spDefenseIV = ((v >>> 0) >>> 25) & 0x1F;
      return;
    default: return;
  }
}

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

/** 1:1 décomp `CalculatePlayerPartyCount()` (pokemon.c). Return le nombre de
 *  slots dans gPlayerParty avec species != 0. Used pour detect party full. */
export function CalculatePlayerPartyCount(): number {
  let count = 0;
  for (let i = 0; i < PARTY_SIZE; i++) {
    if (gPlayerParty[i]?.species && gPlayerParty[i].species !== 0) count++;
  }
  return count;
}

/** 1:1 décomp `u8 GetMonsStateToDoubles(void)` (pokemon.c:4494-4512) :
 *  ```c
 *  CalculatePlayerPartyCount();
 *  if (gPlayerPartyCount == 1) return gPlayerPartyCount; // PLAYER_HAS_ONE_MON
 *  for (i = 0; i < gPlayerPartyCount; i++)
 *      if (GetMonData(SPECIES_OR_EGG) != SPECIES_EGG && GetMonData(HP) != 0
 *          && GetMonData(SPECIES_OR_EGG) != SPECIES_NONE) aliveCount++;
 *  return (aliveCount > 1) ? PLAYER_HAS_TWO_USABLE_MONS : PLAYER_HAS_ONE_USABLE_MON;
 *  ```
 *  Éligibilité au combat double : ≥2 mons vivants non-œuf → TWO_USABLE. Adaptation
 *  modèle : notre `MON_DATA_SPECIES_OR_EGG` renvoie 0 (NONE) pour un œuf (pas
 *  SPECIES_EGG) → on teste `species != 0 && !IS_EGG` (équivalent strict). */
export function GetMonsStateToDoubles(): number {
  const partyCount = CalculatePlayerPartyCount();
  if (partyCount === 1) return PLAYER_HAS_ONE_MON; // 1:1 : return gPlayerPartyCount (== 1)
  let aliveCount = 0;
  for (let i = 0; i < partyCount; i++) {
    const mon = gPlayerParty[i];
    if (mon.species !== 0 && !(GetMonData(mon, MON_DATA_IS_EGG) as number)
        && (GetMonData(mon, MON_DATA_HP) as number) !== 0) {
      aliveCount++;
    }
  }
  return aliveCount > 1 ? PLAYER_HAS_TWO_USABLE_MONS : PLAYER_HAS_ONE_USABLE_MON;
}

/** 1:1 décomp `CalculateEnemyPartyCount()` (pokemon.c). Idem pour gEnemyParty. */
export function CalculateEnemyPartyCount(): number {
  let count = 0;
  for (let i = 0; i < PARTY_SIZE; i++) {
    if (gEnemyParty[i]?.species && gEnemyParty[i].species !== 0) count++;
  }
  return count;
}

/** 1:1 décomp `u8 GetBoxMonGender(struct BoxPokemon *boxMon)` (pokemon.c:3453) :
 *    species = GetBoxMonData(SPECIES); personality = GetBoxMonData(PERSONALITY);
 *    return GetGenderFromSpeciesAndPersonality(species, personality);
 *  → MON_MALE (0) / MON_FEMALE (254) / MON_GENDERLESS (255). Primitif partagé
 *  (14 appelants décomp : Attract, breeding, affichage symbole genre…).
 *  Adaptation modèle : `mon.species` est un id numérique → converti en enum pour
 *  GetGenderFromSpeciesAndPersonality (notre version prend le speciesEnum string). */
export function GetBoxMonGender(mon: Pokemon): number {
  const speciesEnum = reverseDecompConstant(mon.species, 'SPECIES_') ?? 'SPECIES_NONE';
  return GetGenderFromSpeciesAndPersonality(speciesEnum, mon.personality >>> 0);
}

/** 1:1 décomp `u8 GetMonGender(struct Pokemon *mon)` (pokemon.c:3448) :
 *    `return GetBoxMonGender(&mon->box);`. Notre modèle ne sépare pas
 *  Pokemon/BoxPokemon (champs inline) → GetMonGender == GetBoxMonGender. */
export function GetMonGender(mon: Pokemon): number {
  return GetBoxMonGender(mon);
}

// Exposition dev (sonde déterministe GetMonGender), sans effet sur le jeu.
(globalThis as Record<string, unknown>).__GetMonGender = GetMonGender;

// ─── CheckPartyPokerus (= 1:1 décomp pokemon.c:6101-6127) ────────────────

/** 1:1 décomp `CheckPartyPokerus(party, selection)` (pokemon.c:6101-6127).
 *  selection = bitmask des slots à scanner (= 1<<i). Si selection==0, scan
 *  uniquement slot 0. Retourne bitmask des slots avec pokerus actif (bit
 *  bas 4 bits non zéro), ou 1 si selection==0 et slot 0 a pokerus. */
export function CheckPartyPokerus(party: Pokemon[], selection: number): number {
  let retVal = 0;
  let partyIndex = 0;
  let curBit = 1;
  if (selection) {
    do {
      if ((selection & 1) && ((GetMonData(party[partyIndex], MON_DATA_POKERUS) as number) & 0xF))
        retVal |= curBit;
      partyIndex++;
      curBit <<= 1;
      selection >>= 1;
    } while (selection);
  } else if ((GetMonData(party[0], MON_DATA_POKERUS) as number) & 0xF) {
    retVal = 1;
  }
  return retVal;
}

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
  // 1:1 décomp ll.5941-5950 : LEAGUE_BATTLE — check trainer class. Deferred
  // pour notre wire (= pas de trainer class match dispo dans bridge).

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

/** 1:1 décomp `UpdatePartyPokerusTime(days)` (pokemon.c:6157) : pour chaque mon
 *  encore infecté (compteur de jours = low nibble 0xF non nul), décrémente les jours
 *  de `days` ; si jours restants < days OU days > 4 → guérison (`&= 0xF0` : la souche
 *  high nibble reste, jours = 0) ; si l'octet tombe à 0 → 0x10 (marqueur conservé).
 *  Opère sur gPlayerParty (Pokemon struct numérique). */
export function UpdatePartyPokerusTime(days: number): void {
  for (let i = 0; i < PARTY_SIZE; i++) {
    const mon = gPlayerParty[i];
    if (mon && mon.species) {
      let pokerus = mon.pokerus;
      if (pokerus & 0xF) {
        if ((pokerus & 0xF) < days || days > 4)
          pokerus &= 0xF0;
        else
          pokerus -= days;
        if (pokerus === 0)
          pokerus = 0x10;
        mon.pokerus = pokerus;
      }
    }
  }
}

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

/** 1:1 décomp `GetNature(mon)` — personality % 25. Délègue au miroir
 *  `GetNatureFromPersonality` ; nom privé conservé pour les callers de ce fichier. */
function _getNatureFromPersonality(personality: number): number {
  return GetNatureFromPersonality(personality >>> 0);
}

/** Adaptateur 0-based → miroir `ModifyStatByNature` (1-based décomp : STAT_ATK=1…
 *  STAT_SPDEF=5). Ce fichier passe un statIndex 0-based (0=ATK…4=SPDEF, hérité de
 *  CalculateMonStats/CALC_STAT) → +1 pour la signature 1:1 du miroir. Résultat
 *  identique. */
export function _modifyStatByNature(nature: number, stat: number, statIndex: number): number {
  return ModifyStatByNature(nature, stat, statIndex + 1);
}

/** 1:1 décomp `CalculateMonStats(mon)` (pokemon.c:1932-2017).
 *  Calcule maxHP + attack + defense + speed + spAttack + spDefense
 *  depuis baseStats (= gSpeciesInfo[species]) + IVs + EVs + level + nature.
 *  Met à jour aussi `currentHP` si la diff doit être propagée. */
export function CalculateMonStats(mon: Pokemon): void {
  if (mon.species === 0) return;
  const speciesEnum = reverseDecompConstant(mon.species, 'SPECIES_');
  if (!speciesEnum) return;
  const info = getSpeciesInfo(speciesEnum);
  if (!info?.stats) return;
  const base = info.stats;
  const level = mon.level || 1;
  const nature = _getNatureFromPersonality(mon.personality);

  // 1:1 décomp species.h : SPECIES_SHEDINJA = 303.
  // AUDIT BUG FIX : était 292 (= SPECIES_GIRAFARIG !) → 303.
  const SPECIES_SHEDINJA = 303;
  let newMaxHP: number;
  if (mon.species === SPECIES_SHEDINJA) {
    newMaxHP = 1;
  } else {
    const n = 2 * base.hp + mon.hpIV;
    newMaxHP = Math.floor(((n + Math.floor(mon.hpEV / 4)) * level) / 100) + level + 10;
  }
  const previousMaxHP = mon.maxHP;
  mon.maxHP = newMaxHP & 0xFFFF;

  // CALC_STAT macro inline expand : (((2*base + IV + EV/4) * level) / 100) + 5,
  // then ModifyStatByNature.
  const calc = (baseStat: number, iv: number, ev: number, statIdx: number): number => {
    const n = 2 * baseStat + iv;
    let stat = Math.floor(((n + Math.floor(ev / 4)) * level) / 100) + 5;
    stat = _modifyStatByNature(nature, stat, statIdx) & 0xFFFF;
    return stat;
  };
  mon.attack    = calc(base.atk, mon.attackIV,    mon.attackEV,    0); // STAT_ATK
  mon.defense   = calc(base.def, mon.defenseIV,   mon.defenseEV,   1); // STAT_DEF
  mon.speed     = calc(base.spe, mon.speedIV,     mon.speedEV,     2); // STAT_SPEED
  mon.spAttack  = calc(base.spa, mon.spAttackIV,  mon.spAttackEV,  3); // STAT_SPATK
  mon.spDefense = calc(base.spd, mon.spDefenseIV, mon.spDefenseEV, 4); // STAT_SPDEF

  // 1:1 décomp : adjust currentHP par la diff maxHP - previousMaxHP.
  if (mon.species === SPECIES_SHEDINJA) {
    if (mon.hp !== 0 || previousMaxHP === 0) mon.hp = 1;
  } else if (mon.hp === 0 && previousMaxHP === 0) {
    mon.hp = newMaxHP;
  } else if (mon.hp !== 0) {
    mon.hp += newMaxHP - previousMaxHP;
    if (mon.hp <= 0) mon.hp = 1;
  }
  // else : stay at 0 (= fainted).
}

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
  // (fallbacks `??` = robustesse boot avant init playerName, comportement inchangé).
  SetMonData(mon, MON_DATA_OT_NAME, GetPlayerNameString() || 'UNDI');
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

/** 1:1 décomp `static u8 CopyMonToPC(struct Pokemon *mon)` (pokemon.c:4434) : range
 *  le mon dans la 1ère box PC libre. PC box storage non porté (Phase 5) → renvoie
 *  MON_CANT_GIVE (dette R3 : party pleine → CANT_GIVE au lieu de MON_GIVEN_TO_PC). */
function CopyMonToPC(_mon: Pokemon): number {
  console.warn('[GiveMonToPlayer] party pleine → CopyMonToPC pas porté (Phase 5)');
  return MON_CANT_GIVE;
}

/** 1:1 décomp `bool8 IsOtherTrainer(u32 otId, u8 *otName)` (pokemon.c:6579-6595) :
 *  ```c
 *  if (otId == GET_PLAYER_TRAINER_ID()) {
 *      for (i = 0; otName[i] != EOS; i++)
 *          if (otName[i] != gSaveBlock2Ptr->playerName[i]) return TRUE;
 *      return FALSE;
 *  }
 *  return TRUE;
 *  ```
 *  TRUE si le mon vient d'un AUTRE dresseur : otId différent du joueur, OU même
 *  otId mais nom OT différent (cas rare : 2 dresseurs au même TID). Adaptation
 *  modèle : playerTrainerId est un u32 packé, les noms sont des strings → la
 *  comparaison `otName !== playerName` équivaut 1:1 à la boucle char-par-char. */
export function IsOtherTrainer(otId: number, otName: string): boolean {
  const playerTID = (gSaveBlock2Ptr.playerTrainerId ?? 0) >>> 0;
  if ((otId >>> 0) === playerTID) {
    return otName !== (gSaveBlock2Ptr.playerName ?? '');
  }
  return true;
}

/** 1:1 décomp `bool8 IsTradedMon(struct Pokemon *mon)` (pokemon.c:6570-6577) :
 *  lit OT name + OT id du mon → IsOtherTrainer. Utilisé pour le bonus d'XP ×1.5
 *  des Pokémon échangés (Cmd_getexp, battle_script_commands.c:3381). */
export function IsTradedMon(mon: Pokemon): boolean {
  const otName = GetMonData(mon, MON_DATA_OT_NAME) as string;
  const otId = GetMonData(mon, MON_DATA_OT_ID) as number;
  return IsOtherTrainer(otId, otName);
}

// Exposition dev (sonde déterministe IsTradedMon), sans effet sur le jeu.
(globalThis as Record<string, unknown>).__IsTradedMon = IsTradedMon;

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

/** 1:1 décomp `GetAbilityBySpecies(species, abilityNum)` (pokemon.c).
 *  Lookup `gSpeciesInfo[species].abilities[abilityNum]`. Retourne l'ability id
 *  (= ABILITY_*) ou 0 (ABILITY_NONE) si pas trouvé. */
export function GetAbilityBySpecies(species: number, abilityNum: number): number {
  // Convert species id → SPECIES_X enum string for lookup.
  const speciesEnum = reverseDecompConstant(species, 'SPECIES_');
  if (!speciesEnum) return 0;
  const info = getSpeciesInfo(speciesEnum);
  if (!info) return 0;
  const abilityStr = info.abilities[abilityNum & 1] || info.abilities[0] || '';
  if (!abilityStr || abilityStr === 'ABILITY_NONE') return 0;
  const id = resolveDecompConstant(abilityStr);
  return typeof id === 'number' ? id : 0;
}

/** 1:1 décomp pokemon.c `u8 GetMonAbility(struct Pokemon *mon)` :
 *  GetAbilityBySpecies(MON_DATA_SPECIES, MON_DATA_ABILITY_NUM) du mon. */
export function GetMonAbility(mon: Pokemon): number {
  const species = GetMonData(mon, MON_DATA_SPECIES) as number;
  const abilityNum = GetMonData(mon, MON_DATA_ABILITY_NUM) as number;
  return GetAbilityBySpecies(species, abilityNum);
}

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

// Wire debug : expose gPlayerParty/gEnemyParty (= la party canonique du combat, décodée)
// pour vérif runtime (move-learning party read, EXP/level-up, etc.).
(globalThis as { __gPlayerParty?: typeof gPlayerParty; __gEnemyParty?: typeof gEnemyParty })
  .__gPlayerParty = gPlayerParty;
(globalThis as { __gEnemyParty?: typeof gEnemyParty }).__gEnemyParty = gEnemyParty;

