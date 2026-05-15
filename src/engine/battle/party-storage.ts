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

import type { PokemonInstance } from '../pokemon';
import {
  speciesEnumToDexId, moveEnumToDexId,
} from '../pokemon';
import { resolveDecompConstant, reverseDecompConstant } from '../decomp-constants';
import { getSpeciesInfo } from '../data/game-data';

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
// Ribbons 50..56 not implemented (= cosmetic).
export const MON_DATA_STATUS = 57;
export const MON_DATA_LEVEL = 58;
export const MON_DATA_HP = 59;
export const MON_DATA_MAX_HP = 60;
export const MON_DATA_ATK = 61;
export const MON_DATA_DEF = 62;
export const MON_DATA_SPEED = 63;
export const MON_DATA_SPATK = 64;
export const MON_DATA_SPDEF = 65;
export const MON_DATA_MAIL = 66;
export const MON_DATA_SPECIES_OR_EGG = 67;
export const MON_DATA_IVS = 68;
// Ribbons 69..80 not implemented.
export const MON_DATA_MODERN_FATEFUL_ENCOUNTER = 81;
export const MON_DATA_KNOWN_MOVES = 82;
export const MON_DATA_RIBBON_COUNT = 83;
export const MON_DATA_RIBBONS = 84;
export const MON_DATA_ATK2 = 85;
export const MON_DATA_DEF2 = 86;
export const MON_DATA_SPEED2 = 87;
export const MON_DATA_SPATK2 = 88;
export const MON_DATA_SPDEF2 = 89;

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
    pokerus: 0, metLocation: 0, metLevel: 0, metGame: 0,
    pokeball: 0, otGender: 0,
    hpIV: 0, attackIV: 0, defenseIV: 0,
    speedIV: 0, spAttackIV: 0, spDefenseIV: 0,
    abilityNum: 0, modernFatefulEncounter: 0,
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
    case MON_DATA_MODERN_FATEFUL_ENCOUNTER: return mon.modernFatefulEncounter;
    case MON_DATA_KNOWN_MOVES: {
      // 1:1 décomp : bitmask des 4 moves slots qui ont un move défini.
      let mask = 0;
      for (let i = 0; i < MAX_MON_MOVES_PARTY; i++) {
        if (mon.moves[i] !== 0) mask |= (1 << i);
      }
      return mask;
    }
    case MON_DATA_RIBBON_COUNT: return 0;
    case MON_DATA_RIBBONS: return 0;
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

/** Resolve un move enum ex. "MOVE_TACKLE" vers u16 id décomp. Le dex id est
 *  kebab-case ; on convertit en MOVE_* puis lookup. */
function _resolveMoveId(dexId: string): number {
  // 1:1 décomp : MOVE_TACKLE etc. Notre dexId est kebab-case ("tackle").
  const enumStr = 'MOVE_' + dexId.toUpperCase().replace(/-/g, '_');
  const id = resolveDecompConstant(enumStr);
  return typeof id === 'number' ? id : 0;
}

/** Bridge un `PokemonInstance` runtime vers un `Pokemon` battle-side. */
export function pokemonInstanceToPokemon(inst: PokemonInstance): Pokemon {
  const mon = createEmptyPokemon();
  mon.personality = (inst.personality ?? 0) >>> 0;
  mon.otId = 0; // TODO bridge playerTrainerId quand disponible
  mon.nickname = inst.nickname || inst.speciesNameFr;
  mon.species = _resolveSpeciesId(inst.speciesEnum) || inst.speciesId || 0;
  mon.hasSpecies = mon.species ? 1 : 0;
  mon.heldItem = inst.heldItem ? (resolveDecompConstant('ITEM_' + inst.heldItem.toUpperCase().replace(/-/g, '_')) as number | undefined ?? 0) : 0;
  mon.experience = inst.currentExp ?? 0;
  mon.friendship = 70;
  mon.level = inst.level;
  mon.hp = inst.currentHp;
  mon.maxHP = inst.maxHp;
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
  // Stats — pas dans PokemonInstance directement, mais on a IVs/EVs/level.
  // 1:1 décomp : CalculateMonStats lit ces fields. Pour bridge, on prend
  // les stats déjà calculées par @pkmn/dex (= dans inst.maxHp pour HP, autres
  // stats absent → defaulter à level-based).
  mon.attack = 0; mon.defense = 0; mon.speed = 0;
  mon.spAttack = 0; mon.spDefense = 0;
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
  mon.abilityNum = 0; // TODO bridge ability slot
  return mon;
}

/** Bridge inverse `Pokemon` → mise à jour de `PokemonInstance` (= persist
 *  HP/status/exp post-combat). */
export function syncPokemonToInstance(mon: Pokemon, inst: PokemonInstance): void {
  inst.currentHp = mon.hp;
  if (mon.experience !== undefined) inst.currentExp = mon.experience;
  // Status decode (= masque sur les bits stables, sleep turns ignored).
  const baseStatus = mon.status & 0xF8;
  inst.status = _STATUS1_TO_STATUS[baseStatus] ?? (mon.status & 0x07 ? 'SLP' : null);
  // Sync PP via moves array.
  for (let i = 0; i < MAX_MON_MOVES_PARTY; i++) {
    if (inst.moves[i]) inst.moves[i].pp = mon.pp[i];
  }
}

// ─── Party bridge (called at battle setup/end) ─────────────────────────────

/** Fill gPlayerParty/gEnemyParty depuis runtime PokemonInstance arrays.
 *  Appelé au début de chaque combat. Les slots vides sont reset via
 *  `createEmptyPokemon`. */
export function setupPartyForBattle(player: PokemonInstance[], enemy: PokemonInstance[]): void {
  for (let i = 0; i < PARTY_SIZE; i++) {
    Object.assign(gPlayerParty[i], createEmptyPokemon());
    Object.assign(gEnemyParty[i], createEmptyPokemon());
  }
  for (let i = 0; i < Math.min(player.length, PARTY_SIZE); i++) {
    Object.assign(gPlayerParty[i], pokemonInstanceToPokemon(player[i]));
  }
  for (let i = 0; i < Math.min(enemy.length, PARTY_SIZE); i++) {
    Object.assign(gEnemyParty[i], pokemonInstanceToPokemon(enemy[i]));
  }
}

/** Sync HP/status/exp post-combat depuis gPlayerParty vers PokemonInstance
 *  arrays. */
export function teardownPartyAfterBattle(player: PokemonInstance[]): void {
  for (let i = 0; i < Math.min(player.length, PARTY_SIZE); i++) {
    syncPokemonToInstance(gPlayerParty[i], player[i]);
  }
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

// Silence unused warnings for helpers exposed for future reverse-conversion.
void speciesEnumToDexId; void moveEnumToDexId;
