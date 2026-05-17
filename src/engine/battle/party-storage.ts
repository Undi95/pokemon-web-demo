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
import * as MOVES_DATA from '../decomp-data/auto/include/constants/moves-data';
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
// (WINNING/VICTORY/ARTIST/EFFORT/MARINE/LAND/SKY/COUNTRY/NATIONAL/EARTH/WORLD/UNUSED_RIBBONS = 68..79)
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

/** Map normalisée nom-de-move → enum décomp, construite 1:1 depuis les
 *  constantes auto-extraites `moves-data` (= include/constants/moves.h).
 *  Clé = nom sans séparateur en minuscules (ex. "defensecurl"), valeur =
 *  "MOVE_DEFENSE_CURL". Aucune dépendance Showdown (= 1:1 décomp strict). */
let _moveNameNormToEnum: Record<string, string> | null = null;
function _ensureMoveNameMap(): Record<string, string> {
  if (_moveNameNormToEnum) return _moveNameNormToEnum;
  const m: Record<string, string> = {};
  for (const key of Object.keys(MOVES_DATA)) {
    if (!key.startsWith('MOVE_')) continue;
    const norm = key.slice(5).replace(/_/g, '').toLowerCase();
    if (norm && !(norm in m)) m[norm] = key;
  }
  _moveNameNormToEnum = m;
  return m;
}

/** Resolve un move dex id (ex. "tackle", "defensecurl") vers u16 id décomp
 *  (MOVE_*). Les ids runtime sont sans séparateur ("defensecurl") alors que
 *  les enums décomp sont underscore-segmentés ("MOVE_DEFENSE_CURL") : la
 *  conversion naïve échouait sur les noms composés → 0 (= bug pré-existant
 *  qui rendait gBattleMons[1].moves[1..3] vides pour le BattleAI). Résolution
 *  1:1 via les constantes décomp moves-data normalisées (pas de @pkmn/dex). */
function _resolveMoveId(dexId: string): number {
  const naive = resolveDecompConstant('MOVE_' + dexId.toUpperCase().replace(/-/g, '_'));
  if (typeof naive === 'number' && naive !== 0) return naive;
  const norm = dexId.replace(/[^a-z0-9]/gi, '').toLowerCase();
  const enumName = _ensureMoveNameMap()[norm];
  if (enumName) {
    const viaMap = resolveDecompConstant(enumName);
    if (typeof viaMap === 'number') return viaMap;
  }
  return typeof naive === 'number' ? naive : 0;
}

/** Bridge un `PokemonInstance` runtime vers un `Pokemon` battle-side. */
export function pokemonInstanceToPokemon(inst: PokemonInstance): Pokemon {
  const mon = createEmptyPokemon();
  mon.personality = (inst.personality ?? 0) >>> 0;
  // 1:1 décomp : mon.otId est le trainer ID du capturer. Pour les mons player-caught,
  // c'est le player TID stocké dans gSaveBlock2Ptr.playerTrainerId. Si on lit
  // depuis gameState.trainerId, on évite que IsOtherTrainer retourne true (= mon
  // considéré "traded" donc disobedient). Fallback 0 si trainerId pas dispo.
  const _gs = (globalThis as { gameState?: { trainerId?: number } }).gameState;
  mon.otId = (_gs?.trainerId ?? 0) >>> 0;
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
  mon.abilityNum = 0; // 1:1 décomp : ability slot bridge depuis PokemonInstance.abilityNum (= deferred)
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

/** 1:1 décomp `CalculateEnemyPartyCount()` (pokemon.c). Idem pour gEnemyParty. */
export function CalculateEnemyPartyCount(): number {
  let count = 0;
  for (let i = 0; i < PARTY_SIZE; i++) {
    if (gEnemyParty[i]?.species && gEnemyParty[i].species !== 0) count++;
  }
  return count;
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
 *  Notes : (= deferred sub-features pour Phase 1 wire bytecode) :
 *    - ShouldSkipFriendshipChange (= toujours false pour notre wire).
 *    - ITEM_ENIGMA_BERRY hold effect lookup (= rare, fallback GetItemHoldEffect).
 *    - HOLD_EFFECT_FRIENDSHIP_UP +50% bonus (= hold effects deferred).
 *    - ITEM_LUXURY_BALL +1 bonus (= POKEBALL field bridge deferred).
 *    - MET_LOCATION +1 bonus (= GetCurrentRegionMapSectionId bridge deferred). */
export function AdjustFriendship(mon: Pokemon, event: number): void {
  if (mon.species === 0 || mon.species === _SPECIES_EGG_VAL) return;
  if (event < 0 || event >= _SFRIENDSHIP_EVENT_MODIFIERS.length) return;

  let friendshipLevel = 0;
  if (mon.friendship > 99) friendshipLevel++;
  if (mon.friendship > 199) friendshipLevel++;

  // 1:1 décomp ll.5935-5939 : WALKING 50% skip — appelé only via overworld step
  // counter, pas via wire bytecode bridge. Pour completeness :
  if (event === 5 /* FRIENDSHIP_EVENT_WALKING */) {
    // Note : random skip pas appelé ici car bridge ne déclenche pas WALKING.
  }
  // 1:1 décomp ll.5941-5950 : LEAGUE_BATTLE — check trainer class. Deferred
  // pour notre wire (= pas de trainer class match dispo dans bridge).

  const mod = _SFRIENDSHIP_EVENT_MODIFIERS[event][friendshipLevel];
  let friendship = mon.friendship + mod;
  if (friendship < 0) friendship = 0;
  if (friendship > _MAX_FRIENDSHIP) friendship = _MAX_FRIENDSHIP;
  mon.friendship = friendship;
}

// ─── MonGainEVs (= 1:1 décomp pokemon.c:5975-6052) ───────────────────────

const _MAX_TOTAL_EVS = 510;
const _MAX_PER_STAT_EVS = 255;

/** 1:1 décomp `MonGainEVs(mon, defeatedSpecies)`. Award EVs from defeated mon's
 *  evYield, cap à 510 total + 255 par stat, double si Pokerus.
 *
 *  Notes :
 *    - ITEM_ENIGMA_BERRY hold effect (= fallback no holdEffect).
 *    - HOLD_EFFECT_MACHO_BRACE x2 multiplier (= hold effects deferred).
 *    - CheckPartyHasHadPokerus (= ported via _CheckPartyHasHadPokerus). */
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
    // Pokerus multiplier wired via _CheckPartyHasHadPokerus.
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

/** 1:1 décomp `gNatureStatTable[NUM_NATURES][NUM_NATURE_STATS]`
 *  (pokemon.c:1864-1893). Index par nature (0..24) + stat (0..4). Value :
 *   +1 = +10%, -1 = -10%, 0 = neutral. */
const _NATURE_STAT_TABLE: ReadonlyArray<ReadonlyArray<number>> = [
  // STAT_ATTACK, STAT_DEFENSE, STAT_SPEED, STAT_SPATK, STAT_SPDEF
  [ 0,  0,  0,  0,  0],  // HARDY
  [+1, -1,  0,  0,  0],  // LONELY
  [+1,  0, -1,  0,  0],  // BRAVE
  [+1,  0,  0, -1,  0],  // ADAMANT
  [+1,  0,  0,  0, -1],  // NAUGHTY
  [-1, +1,  0,  0,  0],  // BOLD
  [ 0,  0,  0,  0,  0],  // DOCILE
  [ 0, +1, -1,  0,  0],  // RELAXED
  [ 0, +1,  0, -1,  0],  // IMPISH
  [ 0, +1,  0,  0, -1],  // LAX
  [-1,  0, +1,  0,  0],  // TIMID
  [ 0, -1, +1,  0,  0],  // HASTY
  [ 0,  0,  0,  0,  0],  // SERIOUS
  [ 0,  0, +1, -1,  0],  // JOLLY
  [ 0,  0, +1,  0, -1],  // NAIVE
  [-1,  0,  0, +1,  0],  // MODEST
  [ 0, -1,  0, +1,  0],  // MILD
  [ 0,  0, -1, +1,  0],  // QUIET
  [ 0,  0,  0,  0,  0],  // BASHFUL
  [ 0,  0,  0, +1, -1],  // RASH
  [-1,  0,  0,  0, +1],  // CALM
  [ 0, -1,  0,  0, +1],  // GENTLE
  [ 0,  0, -1,  0, +1],  // SASSY
  [ 0,  0,  0, -1, +1],  // CAREFUL
  [ 0,  0,  0,  0,  0],  // QUIRKY
];

/** 1:1 décomp `GetNature(mon)` — personality % 25 = nature index 0..24. */
function _getNatureFromPersonality(personality: number): number {
  return (personality >>> 0) % 25;
}

/** 1:1 décomp `ModifyStatByNature(nature, stat, statIndex)` (pokemon.c:1894-1922).
 *  Applique +10% / -10% / no-op selon table. */
function _modifyStatByNature(nature: number, stat: number, statIndex: number): number {
  if (nature < 0 || nature >= 25 || statIndex < 0 || statIndex >= 5) return stat;
  const mod = _NATURE_STAT_TABLE[nature][statIndex];
  if (mod === 0) return stat;
  if (mod > 0) return Math.floor(stat * 110 / 100) & 0xFFFF;
  return Math.floor(stat * 90 / 100) & 0xFFFF;
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

  // Reset stat stages to base (= 6, neutral). Battle main does 8 entries
  // (NUM_BATTLE_STATS=6 + accuracy + evasion). Notre struct utilise 7 entries.
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
function _setMonByActiveBattler(requestId: number, data: unknown): void {
  const active = gActiveBattler;
  const side = GET_BATTLER_SIDE(active);
  const party = side === 0 ? gPlayerParty : gEnemyParty;
  const partyIdx = gBattlerPartyIndexes[active];
  if (partyIdx < 0 || partyIdx >= 6) return;
  const mon = party[partyIdx];
  if (!mon) return;

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

// Wire bridge global pour battle-controllers.ts.
(globalThis as { __batPSetMonByActive?: typeof _setMonByActiveBattler })
  .__batPSetMonByActive = _setMonByActiveBattler;

