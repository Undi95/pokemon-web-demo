/**
 * pokemon.ts — miroir 1:1 de `decomp/src/pokemon.c` (+ include/pokemon.h).
 *
 * ⚠️ PORT INCRÉMENTAL : pokemon.c est ÉNORME (~6600 lignes). On le construit par
 * couches. CETTE PASSE (2026-06-05) = les helpers PURS (valeur→valeur, sans état
 * `struct Pokemon` mutable), portés AVANT la migration du stockage
 * (PokemonInstance→BoxMon, qui se fera AVEC l'A/B user). Les fns qui touchent
 * `struct Pokemon`/`gPlayerParty` (GetMonData/SetMonData/CalculateMonStats/GetNature/
 * GetGenderFromSpeciesAndPersonality…) restent dans `engine/battle/party-storage` /
 * `engine/battle/data/species-runtime` en attendant (elles délèguent ici pour la
 * logique pure ; cf. ledger).
 *
 * Constantes data (NUM_NATURES, STAT_*) = réutilisées depuis `decomp-data` (extraction
 * vérifiée) tant que `data.c` / `constants/pokemon.h` ne sont pas portés en miroir.
 */
import { NUM_NATURES, STAT_HP, MON_MALE, MON_FEMALE, MON_GENDERLESS, SHINY_ODDS,
  PLAYER_HAS_TWO_USABLE_MONS, PLAYER_HAS_ONE_MON, PLAYER_HAS_ONE_USABLE_MON } from '../include/constants/pokemon';
// PARTY_SIZE depuis le header global (leaf, zéro cycle) — pour gPlayerParty/gEnemyParty.
import { PARTY_SIZE } from '../include/constants/global';
// gSaveBlock2Ptr : IsOtherTrainer compare otId/otName au joueur. save-block-state est leaf
// (n'importe ni pokemon.ts ni party-storage) → edge one-way, zéro cycle.
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import {
  MOVE_CUT, MOVE_FLY, MOVE_SURF, MOVE_STRENGTH, MOVE_FLASH,
  MOVE_ROCK_SMASH, MOVE_WATERFALL, MOVE_DIVE,
} from '../include/constants/moves';
// `gSpeciesInfo[species].genderRatio` via le pont data number→info (en attendant le
// port de `data.c`/species_info.h ; dans le décomp gSpeciesInfo est inclus DANS pokemon.c).
import { getSpeciesGenderRatio } from './engine/battle/data/species-runtime';
// Macro `GET_SHINY_VALUE` du header miroir (cycle impl↔header fonction-seulement = bénin).
import { GET_SHINY_VALUE } from '../include/pokemon';
// ─── CalculateBaseDamage (pokemon.c:3107-3373) — imports absorbés depuis
//     ex-engine/battle/damage-calc.ts (2026-06-13). gStatStageRatios = local. ───
import {
  gBattleMons, gBattlerAttacker, gBattlerTarget, gBattleTypeFlags,
  gBattleWeather, gCritMultiplier, gBattleScripting, gCurrentMove,
  gActiveBattler, gAbsentBattlerFlags,
  gBattleResourcesFlags as gBattleResourcesFlagsDC,
} from './engine/battle/state';
import { getBattleMove } from './engine/battle/data/battle-moves';
import { GetItemHoldEffect, GetItemHoldEffectParam } from './engine/battle/data/item-hold-effects';
import {
  HOLD_EFFECT_CHOICE_BAND as _HOLD_EFFECT_CHOICE_BAND,
  HOLD_EFFECT_SOUL_DEW as _HOLD_EFFECT_SOUL_DEW,
  HOLD_EFFECT_DEEP_SEA_TOOTH as _HOLD_EFFECT_DEEP_SEA_TOOTH,
  HOLD_EFFECT_DEEP_SEA_SCALE as _HOLD_EFFECT_DEEP_SEA_SCALE,
  HOLD_EFFECT_LIGHT_BALL as _HOLD_EFFECT_LIGHT_BALL,
  HOLD_EFFECT_METAL_POWDER as _HOLD_EFFECT_METAL_POWDER,
  HOLD_EFFECT_THICK_CLUB as _HOLD_EFFECT_THICK_CLUB,
} from '../include/constants/hold_effects';
import {
  SPECIES_LATIAS as SPECIES_LATIAS_LOCAL,
  SPECIES_LATIOS as SPECIES_LATIOS_LOCAL,
  SPECIES_CLAMPERL as SPECIES_CLAMPERL_LOCAL,
  SPECIES_PIKACHU as SPECIES_PIKACHU_LOCAL,
  SPECIES_DITTO as SPECIES_DITTO_LOCAL,
  SPECIES_CUBONE as SPECIES_CUBONE_LOCAL,
  SPECIES_MAROWAK as SPECIES_MAROWAK_LOCAL,
} from '../include/constants/species';
import {
  ABILITY_CLOUD_NINE, ABILITY_AIR_LOCK,
} from '../include/constants/abilities';
import type { BattleMon } from './engine/battle/script-interpreter';
import {
  TYPE_MYSTERY, TYPE_FIRE, TYPE_WATER, TYPE_BUG, TYPE_GRASS, TYPE_ELECTRIC, TYPE_ICE,
  STAT_ATK, STAT_DEF, STAT_SPATK, STAT_SPDEF, DEFAULT_STAT_STAGE,
  STATUS1_BURN, SIDE_STATUS_REFLECT, SIDE_STATUS_LIGHTSCREEN, BATTLE_TYPE_DOUBLE,
  B_WEATHER_RAIN_TEMPORARY, B_WEATHER_RAIN, B_WEATHER_SANDSTORM, B_WEATHER_SUN, B_WEATHER_HAIL,
  GET_BATTLER_SIDE,
  ABILITY_THICK_FAT, ABILITY_HUGE_POWER, ABILITY_PURE_POWER, ABILITY_HUSTLE, ABILITY_GUTS,
  ABILITY_MARVEL_SCALE, ABILITY_OVERGROW, ABILITY_BLAZE, ABILITY_TORRENT, ABILITY_SWARM,
  MOVE_SOLAR_BEAM, MOVE_TARGET_BOTH, EFFECT_EXPLOSION,
  IS_TYPE_PHYSICAL, IS_TYPE_SPECIAL,
} from './engine/battle/constants';
import { FlagGet as _FlagGetN0 } from './engine/script/script-vars';
import { GetBattlerAtPosition } from './battle_anim_mons';
// Constantes MON_DATA_* (enum include/pokemon.h) lues par GetMonData/SetMonData.
// Restent définies dans party-storage (39 fichiers les importent de là) → import ici.
// Lien 2-sens runtime-only avec party-storage : SÛR (lues seulement dans les fns, jamais
// à l'init ; createEmptyPokemon/GetMonData sont des `function` hoistées). Vérifié au restart.
import {
  MON_DATA_PERSONALITY, MON_DATA_OT_ID, MON_DATA_NICKNAME, MON_DATA_LANGUAGE,
  MON_DATA_SANITY_IS_BAD_EGG, MON_DATA_SANITY_HAS_SPECIES, MON_DATA_SANITY_IS_EGG,
  MON_DATA_OT_NAME, MON_DATA_MARKINGS, MON_DATA_CHECKSUM, MON_DATA_ENCRYPT_SEPARATOR,
  MON_DATA_SPECIES, MON_DATA_HELD_ITEM, MON_DATA_MOVE1, MON_DATA_MOVE2, MON_DATA_MOVE3,
  MON_DATA_MOVE4, MON_DATA_PP1, MON_DATA_PP2, MON_DATA_PP3, MON_DATA_PP4,
  MON_DATA_PP_BONUSES, MON_DATA_COOL, MON_DATA_BEAUTY, MON_DATA_CUTE, MON_DATA_EXP,
  MON_DATA_HP_EV, MON_DATA_ATK_EV, MON_DATA_DEF_EV, MON_DATA_SPEED_EV, MON_DATA_SPATK_EV,
  MON_DATA_SPDEF_EV, MON_DATA_FRIENDSHIP, MON_DATA_SMART, MON_DATA_POKERUS,
  MON_DATA_MET_LOCATION, MON_DATA_MET_LEVEL, MON_DATA_MET_GAME, MON_DATA_POKEBALL,
  MON_DATA_HP_IV, MON_DATA_ATK_IV, MON_DATA_DEF_IV, MON_DATA_SPEED_IV, MON_DATA_SPATK_IV,
  MON_DATA_SPDEF_IV, MON_DATA_IS_EGG, MON_DATA_ABILITY_NUM, MON_DATA_TOUGH, MON_DATA_SHEEN,
  MON_DATA_OT_GENDER, MON_DATA_COOL_RIBBON, MON_DATA_BEAUTY_RIBBON, MON_DATA_CUTE_RIBBON,
  MON_DATA_SMART_RIBBON, MON_DATA_TOUGH_RIBBON, MON_DATA_STATUS, MON_DATA_LEVEL, MON_DATA_HP,
  MON_DATA_MAX_HP, MON_DATA_ATK, MON_DATA_DEF, MON_DATA_SPEED, MON_DATA_SPATK,
  MON_DATA_SPDEF, MON_DATA_MAIL, MON_DATA_SPECIES_OR_EGG, MON_DATA_IVS,
  MON_DATA_CHAMPION_RIBBON, MON_DATA_WINNING_RIBBON, MON_DATA_VICTORY_RIBBON,
  MON_DATA_ARTIST_RIBBON, MON_DATA_EFFORT_RIBBON, MON_DATA_MARINE_RIBBON,
  MON_DATA_LAND_RIBBON, MON_DATA_SKY_RIBBON, MON_DATA_COUNTRY_RIBBON,
  MON_DATA_NATIONAL_RIBBON, MON_DATA_EARTH_RIBBON, MON_DATA_WORLD_RIBBON,
  MON_DATA_UNUSED_RIBBONS, MON_DATA_MODERN_FATEFUL_ENCOUNTER, MON_DATA_KNOWN_MOVES,
  MON_DATA_RIBBON_COUNT, MON_DATA_RIBBONS, MON_DATA_ATK2, MON_DATA_DEF2, MON_DATA_SPEED2,
  MON_DATA_SPATK2, MON_DATA_SPDEF2,
} from './engine/battle/party-storage';

// ─── struct Pokemon ─ 1:1 décomp `include/pokemon.h:219..232` ─────────────
// Consolidé depuis party-storage.ts vers le foyer pokemon.c (= où gPlayerParty/
// GetMonData sont définis dans la décomp). party-storage.ts re-exporte pour compat.

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

// ─── gPlayerParty / gEnemyParty (= 1:1 décomp pokemon.c:EWRAM, pokemon.h:374-376) ──
// Les parties joueur/ennemie. Consolidées depuis party-storage.ts vers le foyer pokemon.c.
// Init à l'évaluation du module : createEmptyPokemon (function hoistée, même fichier) +
// PARTY_SIZE (header global, leaf) → aucune dépendance au cycle party-storage. party-storage.ts
// re-exporte (41/26 fichiers les importent de là, inchangés).

export const gPlayerParty: Pokemon[] = Array.from({ length: PARTY_SIZE }, createEmptyPokemon);
export const gEnemyParty: Pokemon[] = Array.from({ length: PARTY_SIZE }, createEmptyPokemon);

// Wire debug : expose gPlayerParty/gEnemyParty (= la party canonique, décodée).
(globalThis as { __gPlayerParty?: typeof gPlayerParty; __gEnemyParty?: typeof gEnemyParty })
  .__gPlayerParty = gPlayerParty;
(globalThis as { __gEnemyParty?: typeof gEnemyParty }).__gEnemyParty = gEnemyParty;

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

// ─── GetMonData / SetMonData (= 1:1 décomp pokemon.c) ─────────────────────
// Accesseurs universels mon-data. Consolidés depuis party-storage.ts vers le foyer
// pokemon.c (= où ils sont définis dans la décomp). party-storage.ts re-exporte pour
// compat (40 fichiers les importent de là, inchangés).

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
      for (let i = 0; i < 4 /* MAX_MON_MOVES */; i++) {
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

/** 1:1 décomp `#define NUM_NATURE_STATS (NUM_STATS - 1)` (constants/pokemon.h) = 5
 *  (ATK, DEF, SPEED, SPATK, SPDEF ; HP exclu). decomp-data ne le résout pas
 *  (garde `NUM_NATURE_STATS_EXPR`) → transcrit ici. */
export const NUM_NATURE_STATS = 5;

/** 1:1 décomp `const s8 gNatureStatTable[NUM_NATURES][NUM_NATURE_STATS]`
 *  (pokemon.c:1366-1393). Colonnes = Attack, Defense, Speed, Sp.Atk, Sp.Def.
 *  +1 = +10 %, -1 = -10 %, 0 = neutre. TRANSCRIT du décomp (jamais recalculé). */
export const gNatureStatTable: ReadonlyArray<ReadonlyArray<number>> = [
  //  Atk  Def  Spe  SpA  SpD
  [    0,   0,   0,   0,   0 ],  // NATURE_HARDY
  [   +1,  -1,   0,   0,   0 ],  // NATURE_LONELY
  [   +1,   0,  -1,   0,   0 ],  // NATURE_BRAVE
  [   +1,   0,   0,  -1,   0 ],  // NATURE_ADAMANT
  [   +1,   0,   0,   0,  -1 ],  // NATURE_NAUGHTY
  [   -1,  +1,   0,   0,   0 ],  // NATURE_BOLD
  [    0,   0,   0,   0,   0 ],  // NATURE_DOCILE
  [    0,  +1,  -1,   0,   0 ],  // NATURE_RELAXED
  [    0,  +1,   0,  -1,   0 ],  // NATURE_IMPISH
  [    0,  +1,   0,   0,  -1 ],  // NATURE_LAX
  [   -1,   0,  +1,   0,   0 ],  // NATURE_TIMID
  [    0,  -1,  +1,   0,   0 ],  // NATURE_HASTY
  [    0,   0,   0,   0,   0 ],  // NATURE_SERIOUS
  [    0,   0,  +1,  -1,   0 ],  // NATURE_JOLLY
  [    0,   0,  +1,   0,  -1 ],  // NATURE_NAIVE
  [   -1,   0,   0,  +1,   0 ],  // NATURE_MODEST
  [    0,  -1,   0,  +1,   0 ],  // NATURE_MILD
  [    0,   0,  -1,  +1,   0 ],  // NATURE_QUIET
  [    0,   0,   0,   0,   0 ],  // NATURE_BASHFUL
  [    0,   0,   0,  +1,  -1 ],  // NATURE_RASH
  [   -1,   0,   0,   0,  +1 ],  // NATURE_CALM
  [    0,  -1,   0,   0,  +1 ],  // NATURE_GENTLE
  [    0,   0,  -1,   0,  +1 ],  // NATURE_SASSY
  [    0,   0,   0,  -1,  +1 ],  // NATURE_CAREFUL
  [    0,   0,   0,   0,   0 ],  // NATURE_QUIRKY
];

/** 1:1 décomp `const u8 gStatStageRatios[MAX_STAT_STAGE + 1][2]` (pokemon.c:1869-1884).
 *  Indexé par statStage (0 = -6 … 12 = +6) ; `[numérateur, dénominateur]` → `stat × N / D`.
 *  TRANSCRIT du décomp. */
export const gStatStageRatios: ReadonlyArray<readonly [number, number]> = [
  [10, 40], // -6 (MIN_STAT_STAGE)
  [10, 35], // -5
  [10, 30], // -4
  [10, 25], // -3
  [10, 20], // -2
  [10, 15], // -1
  [10, 10], //  0 (DEFAULT_STAT_STAGE)
  [15, 10], // +1
  [20, 10], // +2
  [25, 10], // +3
  [30, 10], // +4
  [35, 10], // +5
  [40, 10], // +6 (MAX_STAT_STAGE)
];

/** 1:1 décomp `u8 GetNatureFromPersonality(u32 personality)` (pokemon.c:5485). */
export function GetNatureFromPersonality(personality: number): number {
  return (personality >>> 0) % NUM_NATURES;
}

/** 1:1 décomp `u8 GetNature(struct Pokemon *mon)` (pokemon.c:5480) :
 *    `return GetMonData(mon, MON_DATA_PERSONALITY) % NUM_NATURES;`. Délègue à
 *  GetNatureFromPersonality (même fichier, DRY). Primitif partagé (8 appelants décomp :
 *  pokemon_summary_screen, field_specials [Nature Girl], pokeblock/contest/animation…).
 *  Adaptation modèle : lecture directe `mon.personality` (= GetMonData(PERSONALITY) sur
 *  notre struct plat). Renvoie l'index de nature 0..24. Consolidé depuis party-storage.ts. */
export function GetNature(mon: Pokemon): number {
  return GetNatureFromPersonality(mon.personality >>> 0);
}

// Exposition dev (sonde déterministe GetNature), sans effet sur le jeu.
(globalThis as Record<string, unknown>).__GetNature = GetNature;

/** 1:1 décomp `u16 ModifyStatByNature(u8 nature, u16 stat, u8 statIndex)`
 *  (pokemon.c:5865-5899). statIndex est 1-based (STAT_ATK=1 … STAT_SPDEF=5) ; HP
 *  (0), Accuracy, Evasion ne sont pas modifiés. */
export function ModifyStatByNature(nature: number, stat: number, statIndex: number): number {
  if (statIndex <= STAT_HP || statIndex > NUM_NATURE_STATS)
    return stat;

  let retVal: number;
  // 1:1 décomp VANILLA (sans BUGFIX) : `retVal` est u16 → `stat * N` est tronqué à
  // 16 bits AVANT la division /100. (BUGFIX utiliserait u32 ; sans effet pour
  // stat ≤ 595, jamais atteint en jeu de base — cf. commentaire pokemon.c:5867-5872.)
  switch (gNatureStatTable[nature][statIndex - 1]) {
    case 1:
      retVal = (stat * 110) & 0xFFFF;
      retVal = Math.trunc(retVal / 100);
      break;
    case -1:
      retVal = (stat * 90) & 0xFFFF;
      retVal = Math.trunc(retVal / 100);
      break;
    default:
      retVal = stat;
      break;
  }
  return retVal & 0xFFFF;
}

/** 1:1 décomp `u8 GetGenderFromSpeciesAndPersonality(u16 species, u32 personality)`
 *  (pokemon.c:3472-3486). `gSpeciesInfo[species].genderRatio` :
 *   - sentinelle MON_MALE/FEMALE/GENDERLESS → retournée telle quelle ;
 *   - sinon (= PERCENT_FEMALE) : ratio > (personality & 0xFF) ? FEMALE : MALE. */
export function GetGenderFromSpeciesAndPersonality(species: number, personality: number): number {
  const genderRatio = getSpeciesGenderRatio(species);
  switch (genderRatio) {
    case MON_MALE:
    case MON_FEMALE:
    case MON_GENDERLESS:
      return genderRatio;
  }

  if (genderRatio > (personality & 0xFF))
    return MON_FEMALE;
  else
    return MON_MALE;
}

/** 1:1 décomp `u8 GetBoxMonGender(struct BoxPokemon *boxMon)` (pokemon.c:3453) :
 *    species = GetBoxMonData(SPECIES); personality = GetBoxMonData(PERSONALITY);
 *    return GetGenderFromSpeciesAndPersonality(species, personality);
 *  Primitif partagé (14 appelants décomp : Attract, breeding, symbole genre…).
 *  Adaptation modèle : notre struct Pokemon ne sépare pas Pokemon/BoxPokemon
 *  (champs inline) → lecture directe `mon.species`/`mon.personality` (= GetBoxMonData).
 *  Consolidé depuis party-storage.ts vers le foyer pokemon.c (numérique, sans le
 *  détour reverseDecompConstant→version string : appelle la version numérique same-file). */
export function GetBoxMonGender(mon: Pokemon): number {
  return GetGenderFromSpeciesAndPersonality(mon.species, mon.personality >>> 0);
}

/** 1:1 décomp `u8 GetMonGender(struct Pokemon *mon)` (pokemon.c:3448) :
 *    `return GetBoxMonGender(&mon->box);`. Modèle inline → GetMonGender == GetBoxMonGender. */
export function GetMonGender(mon: Pokemon): number {
  return GetBoxMonGender(mon);
}

// Exposition dev (sonde déterministe GetMonGender), sans effet sur le jeu.
(globalThis as Record<string, unknown>).__GetMonGender = GetMonGender;

/** 1:1 décomp `bool8 IsShinyOtIdPersonality(u32 otId, u32 personality)` (pokemon.c:6708) :
 *  shiny si `GET_SHINY_VALUE(otId, personality) < SHINY_ODDS` (= 8). */
export function IsShinyOtIdPersonality(otId: number, personality: number): boolean {
  const shinyValue = GET_SHINY_VALUE(otId, personality);
  return shinyValue < SHINY_ODDS;
}

/** 1:1 décomp `bool32 IsMonShiny(struct Pokemon *mon)` (pokemon.c:6702-6706) :
 *    otId = GetMonData(OT_ID); personality = GetMonData(PERSONALITY);
 *    return IsShinyOtIdPersonality(otId, personality);
 *  Adaptation modèle : lecture directe mon.otId/personality. Retourne un number (0/1)
 *  pour gBattleResults.shinyWildMon (bitfield). Consolidé depuis battle_main.ts. */
export function IsMonShiny(mon: Pokemon): number {
  return IsShinyOtIdPersonality(mon.otId >>> 0, mon.personality >>> 0) ? 1 : 0;
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
 *  TRUE si le mon vient d'un AUTRE dresseur : otId différent du joueur, OU même otId
 *  mais nom OT différent. Adaptation modèle : playerTrainerId u32 packé, noms = strings
 *  → `otName !== playerName` équivaut 1:1 à la boucle char-par-char. Consolidé depuis
 *  party-storage.ts vers le foyer pokemon.c. */
export function IsOtherTrainer(otId: number, otName: string): boolean {
  const playerTID = (gSaveBlock2Ptr.playerTrainerId ?? 0) >>> 0;
  if ((otId >>> 0) === playerTID) {
    return otName !== (gSaveBlock2Ptr.playerName ?? '');
  }
  return true;
}

/** 1:1 décomp `bool8 IsTradedMon(struct Pokemon *mon)` (pokemon.c:6570-6577) :
 *  lit OT name + OT id du mon → IsOtherTrainer. Utilisé pour le bonus d'XP ×1.5 des
 *  Pokémon échangés (Cmd_getexp, battle_script_commands.c:3381). Adaptation modèle :
 *  lecture directe `mon.otName`/`mon.otId` (= GetMonData(OT_NAME/OT_ID) sur struct plat). */
export function IsTradedMon(mon: Pokemon): boolean {
  return IsOtherTrainer(mon.otId >>> 0, mon.otName);
}

// Exposition dev (sonde déterministe IsTradedMon), sans effet sur le jeu.
(globalThis as Record<string, unknown>).__IsTradedMon = IsTradedMon;

// ════════════════════════════════════════════════════════════════════════════
// CalculateBaseDamage (pokemon.c:3107-3373) — formule de dégâts complète
// (ability/hold/badge boosts, burn, screens, weather, APPLY_STAT_MOD).
// [fusion miroir 2026-06-13, ex-engine/battle/damage-calc.ts]
// gStatStageRatios = const local ci-dessus (l.63).
// ════════════════════════════════════════════════════════════════════════════

// 1:1 décomp `BATTLE_TYPE_FRONTIER` mask — utilisé pour ignore Soul Dew boost.
// Valeurs vraies de constants.ts : TOWER 1<<8, DOME 1<<16, PALACE 1<<17,
// ARENA 1<<18, FACTORY 1<<19, PIKE 1<<20, PYRAMID 1<<21.
const BATTLE_TYPE_FRONTIER_LOCAL = (1 << 8) | (1 << 16) | (1 << 17) | (1 << 18) | (1 << 19) | (1 << 20) | (1 << 21);

// 1:1 décomp `sHoldEffectToType[][2]` (pokemon.c:1920-1939). 17 entries.
// [HOLD_EFFECT_<TYPE>_POWER, TYPE_<TYPE>] — pairs pour type-bonus hold items
// comme Charcoal (Fire +10%) / Mystic Water (Water +10%) / Sharp Beak (Flying +10%) / etc.
const _sHoldEffectToType: ReadonlyArray<readonly [number, number]> = [
  [31, 6],  // BUG_POWER → TYPE_BUG
  [42, 8],  // STEEL_POWER → TYPE_STEEL
  [46, 4],  // GROUND_POWER → TYPE_GROUND
  [47, 5],  // ROCK_POWER → TYPE_ROCK
  [48, 12], // GRASS_POWER → TYPE_GRASS
  [49, 17], // DARK_POWER → TYPE_DARK
  [50, 1],  // FIGHTING_POWER → TYPE_FIGHTING
  [51, 13], // ELECTRIC_POWER → TYPE_ELECTRIC
  [52, 11], // WATER_POWER → TYPE_WATER
  [53, 2],  // FLYING_POWER → TYPE_FLYING
  [54, 3],  // POISON_POWER → TYPE_POISON
  [55, 15], // ICE_POWER → TYPE_ICE
  [56, 7],  // GHOST_POWER → TYPE_GHOST
  [57, 14], // PSYCHIC_POWER → TYPE_PSYCHIC
  [58, 10], // FIRE_POWER → TYPE_FIRE
  [59, 16], // DRAGON_POWER → TYPE_DRAGON
  [60, 0],  // NORMAL_POWER → TYPE_NORMAL
];

// ─── Local data ────────────────────────────────────────────────────────────

// `gStatStageRatios` consolidé sur le miroir `src/game/pokemon.ts` (cf. import en tête).

// ─── Helpers ────────────────────────────────────────────────────────────────

const isTypePhysical = IS_TYPE_PHYSICAL;
const isTypeSpecial = IS_TYPE_SPECIAL;

/** APPLY_STAT_MOD inline (= pokemon.c:3101 macro). */
function applyStatMod(mon: BattleMon, stat: number, statIndex: number): number {
  const stage = mon.statStages[statIndex] ?? DEFAULT_STAT_STAGE;
  const ratio = gStatStageRatios[stage] ?? [10, 10];
  return Math.floor((stat * ratio[0]) / ratio[1]);
}

/** 1:1 décomp `WEATHER_HAS_EFFECT` (battle_util.h:47).
 *  `!ABILITY_ON_FIELD(ABILITY_CLOUD_NINE) && !ABILITY_ON_FIELD(ABILITY_AIR_LOCK)`.
 *  Lazy lookup via globalThis pour éviter circular import avec ability-battle-effects. */
function weatherHasEffect(): boolean {
  const checkFn = (globalThis as { __abilityBattleEffectsCheck?: (caseID: number, b: number, ab: number, s: number, m: number) => number }).__abilityBattleEffectsCheck;
  if (!checkFn) return true;  // pas wired = no field block
  // 1:1 décomp battle_util.h:36 ABILITYEFFECT_CHECK_ON_FIELD = 19.
  const ABILITYEFFECT_CHECK_ON_FIELD = 19;
  const cloudNine = checkFn(ABILITYEFFECT_CHECK_ON_FIELD, 0, ABILITY_CLOUD_NINE, 0, 0);
  const airLock = checkFn(ABILITYEFFECT_CHECK_ON_FIELD, 0, ABILITY_AIR_LOCK, 0, 0);
  return !cloudNine && !airLock;
}

/** 1:1 décomp `ShouldGetStatBadgeBoost(badgeFlag, battler)` (pokemon.c:3408-3420).
 *
 *  Check :
 *  - BATTLE_TYPE_LINK / EREADER_TRAINER / RECORDED_LINK → false
 *  - side != B_SIDE_PLAYER → false
 *  - TRAINER + opponent == TRAINER_SECRET_BASE → false (rare, Frontier deferred)
 *  - FlagGet(badgeFlag) → return state du flag */
function shouldGetStatBadgeBoost(badgeFlag: number, battler: number): boolean {
  // 1:1 décomp early-outs.
  const linkFlags = (1 << 1)  /* BATTLE_TYPE_LINK */
                  | (1 << 11) /* BATTLE_TYPE_EREADER_TRAINER */
                  | (1 << 25) /* BATTLE_TYPE_RECORDED_LINK */;
  if (gBattleTypeFlags & linkFlags) return false;
  if (GET_BATTLER_SIDE(battler) !== 0 /* B_SIDE_PLAYER */) return false;
  // Secret Base : TRAINER_SECRET_BASE check (= très rare, Frontier deferred).
  // 1:1 décomp `FlagGet(badgeFlag)` via gameState. Mapping number → enum string :
  const flagName = _badgeFlagNumberToEnum(badgeFlag);
  if (!flagName) return false;
  return _flagGetN0(flagName);
}

// Import direct (= disobedience.ts utilise le même pattern).
// Flash Fire flags (= gBattleResources->flags->flags 1:1 décomp).
function _flagGetN0(flagName: string): boolean {
  return _FlagGetN0(flagName);
}

function _badgeFlagNumberToEnum(badgeFlag: number): string | null {
  // 1:1 décomp constants/flags.h (FLAG_BADGE0X_GET).
  // SYSTEM_FLAGS base = 0x860.
  switch (badgeFlag) {
    case 0x867: return 'FLAG_BADGE01_GET';
    case 0x868: return 'FLAG_BADGE02_GET';
    case 0x869: return 'FLAG_BADGE03_GET';
    case 0x86A: return 'FLAG_BADGE04_GET';
    case 0x86B: return 'FLAG_BADGE05_GET';
    case 0x86C: return 'FLAG_BADGE06_GET';
    case 0x86D: return 'FLAG_BADGE07_GET';
    case 0x86E: return 'FLAG_BADGE08_GET';
    default:    return null;
  }
}

/** 1:1 décomp `CountAliveMonsInBattle(caseId)` (pokemon.c:3375-3406).
 *  Compte les battlers vivants selon le caseId (= EXCEPT_ACTIVE/ATK_SIDE/DEF_SIDE). */
function countAliveMonsInBattle(caseId: number): number {
  let retVal = 0;
  const MAX_BATTLERS = 4;  // MAX_BATTLERS_COUNT
  switch (caseId) {
    case 0 /* BATTLE_ALIVE_EXCEPT_ACTIVE */:
      for (let i = 0; i < MAX_BATTLERS; i++) {
        if (i !== gActiveBattler && !(gAbsentBattlerFlags & (1 << i))) retVal++;
      }
      break;
    case 1 /* BATTLE_ALIVE_ATK_SIDE */:
      for (let i = 0; i < MAX_BATTLERS; i++) {
        if (GET_BATTLER_SIDE(i) === GET_BATTLER_SIDE(gBattlerAttacker)
            && !(gAbsentBattlerFlags & (1 << i))) retVal++;
      }
      break;
    case 2 /* BATTLE_ALIVE_DEF_SIDE */:
      for (let i = 0; i < MAX_BATTLERS; i++) {
        if (GET_BATTLER_SIDE(i) === GET_BATTLER_SIDE(gBattlerTarget)
            && !(gAbsentBattlerFlags & (1 << i))) retVal++;
      }
      break;
  }
  return retVal;
}

// 1:1 décomp `BATTLE_ALIVE_*` (include/constants/battle.h).
const BATTLE_ALIVE_DEF_SIDE = 2;

// ─── CalculateBaseDamage ────────────────────────────────────────────────────

/** 1:1 décomp `s32 CalculateBaseDamage(struct BattlePokemon *attacker,
 *  struct BattlePokemon *defender, u32 move, u16 sideStatus, u16 powerOverride,
 *  u8 typeOverride, u8 battlerIdAtk, u8 battlerIdDef)` (pokemon.c:3107-3373).
 *
 *  Returns damage en s32 (= peut être ~0 si type immune, peut être > 32k pour
 *  hits very strong avec crit).
 *
 *  Side effect : modifie `gBattleMovePower` (= power post-ability/weather boosts).
 *  Notre port : retourne aussi {damage, gBattleMovePower} pour caller. */
export function CalculateBaseDamage(
  attacker: BattleMon,
  defender: BattleMon,
  move: number,
  sideStatus: number,
  powerOverride: number,
  typeOverride: number,
  battlerIdAtk: number,
  battlerIdDef: number,
): { damage: number; powerOut: number } {
  let damage = 0;
  let damageHelper: number;
  let type: number;
  let attack = attacker.attack;
  let defense = defender.defense;
  let spAttack = attacker.spAttack;
  let spDefense = defender.spDefense;

  const moveData = getBattleMove(move);
  let gBattleMovePower = powerOverride || moveData.power;
  type = typeOverride ? (typeOverride & 0x3F) : moveData.type;

  // 1:1 décomp : hold effect lookup via GetItemHoldEffect.
  // ITEM_ENIGMA_BERRY path (= rare custom berry, Frontier deferred).
  const attackerHoldEffect = GetItemHoldEffect(attacker.item);
  const defenderHoldEffect = GetItemHoldEffect(defender.item);
  const attackerHoldEffectParam = GetItemHoldEffectParam(attacker.item);
  void attackerHoldEffectParam;

  // Huge Power / Pure Power : attack × 2.
  if (attacker.ability === ABILITY_HUGE_POWER || attacker.ability === ABILITY_PURE_POWER) {
    attack *= 2;
  }

  // Badge boosts (+10% per stat). Wired session 139 via shouldGetStatBadgeBoost.
  // 1:1 décomp : SYSTEM_FLAGS = TRAINER_FLAGS_END + 1 = 0x860.
  // FLAG_BADGE01_GET = 0x867, FLAG_BADGE05_GET = 0x86B, FLAG_BADGE07_GET = 0x86D.
  // AUDIT FIX : précédemment hardcoded 0x844/0x848/0x84A FAUX (= ancienne SYSTEM_FLAGS).
  if (shouldGetStatBadgeBoost(0x867 /* FLAG_BADGE01_GET */, battlerIdAtk))
    attack = Math.floor((110 * attack) / 100);
  if (shouldGetStatBadgeBoost(0x86B /* FLAG_BADGE05_GET */, battlerIdDef))
    defense = Math.floor((110 * defense) / 100);
  if (shouldGetStatBadgeBoost(0x86D /* FLAG_BADGE07_GET */, battlerIdAtk))
    spAttack = Math.floor((110 * spAttack) / 100);
  if (shouldGetStatBadgeBoost(0x86D /* FLAG_BADGE07_GET */, battlerIdDef))
    spDefense = Math.floor((110 * spDefense) / 100);

  // 1:1 décomp pokemon.c:3171-3183 — sHoldEffectToType table iterate.
  // 17 entries : [HOLD_EFFECT_<TYPE>_POWER, TYPE_<TYPE>]. Si match attacker
  // holdEffect + move type → multiplier `(param + 100) / 100` sur attack
  // (si physical) ou spAttack (si special).
  const isPhysical = type < /* TYPE_MYSTERY */ 9;
  for (const [eff, t] of _sHoldEffectToType) {
    if (attackerHoldEffect === eff && type === t) {
      if (isPhysical) {
        attack = Math.floor((attack * (attackerHoldEffectParam + 100)) / 100);
      } else {
        spAttack = Math.floor((spAttack * (attackerHoldEffectParam + 100)) / 100);
      }
      break;
    }
  }
  void defenderHoldEffect;

  // 1:1 décomp pokemon.c:3185-3201 hold-item boosts.
  if (attackerHoldEffect === _HOLD_EFFECT_CHOICE_BAND) {
    attack = Math.floor((150 * attack) / 100);
  }
  if (attackerHoldEffect === _HOLD_EFFECT_SOUL_DEW
      && !(gBattleTypeFlags & BATTLE_TYPE_FRONTIER_LOCAL)
      && (attacker.species === SPECIES_LATIAS_LOCAL || attacker.species === SPECIES_LATIOS_LOCAL)) {
    spAttack = Math.floor((150 * spAttack) / 100);
  }
  if (defenderHoldEffect === _HOLD_EFFECT_SOUL_DEW
      && !(gBattleTypeFlags & BATTLE_TYPE_FRONTIER_LOCAL)
      && (defender.species === SPECIES_LATIAS_LOCAL || defender.species === SPECIES_LATIOS_LOCAL)) {
    spDefense = Math.floor((150 * spDefense) / 100);
  }
  if (attackerHoldEffect === _HOLD_EFFECT_DEEP_SEA_TOOTH
      && attacker.species === SPECIES_CLAMPERL_LOCAL) {
    spAttack *= 2;
  }
  if (defenderHoldEffect === _HOLD_EFFECT_DEEP_SEA_SCALE
      && defender.species === SPECIES_CLAMPERL_LOCAL) {
    spDefense *= 2;
  }
  if (attackerHoldEffect === _HOLD_EFFECT_LIGHT_BALL
      && attacker.species === SPECIES_PIKACHU_LOCAL) {
    spAttack *= 2;
  }
  if (defenderHoldEffect === _HOLD_EFFECT_METAL_POWDER
      && defender.species === SPECIES_DITTO_LOCAL) {
    defense *= 2;
  }
  if (attackerHoldEffect === _HOLD_EFFECT_THICK_CLUB
      && (attacker.species === SPECIES_CUBONE_LOCAL || attacker.species === SPECIES_MAROWAK_LOCAL)) {
    attack *= 2;
  }

  // Apply abilities / field sports.
  if (defender.ability === ABILITY_THICK_FAT && (type === TYPE_FIRE || type === TYPE_ICE)) {
    spAttack = Math.floor(spAttack / 2);
  }
  if (attacker.ability === ABILITY_HUSTLE) {
    attack = Math.floor((150 * attack) / 100);
  }
  // ABILITY_PLUS/MINUS : skip (= cross-mon partner check, rare in singles).
  if (attacker.ability === ABILITY_GUTS && attacker.status1) {
    attack = Math.floor((150 * attack) / 100);
  }
  if (defender.ability === ABILITY_MARVEL_SCALE && defender.status1) {
    defense = Math.floor((150 * defense) / 100);
  }
  // 1:1 décomp : Mud Sport / Water Sport halve Electric / Fire power.
  // Via lazy lookup AbilityBattleEffects(ABILITYEFFECT_FIELD_SPORT).
  const checkFn = (globalThis as { __abilityBattleEffectsCheck?: (caseID: number, b: number, ab: number, s: number, m: number) => number }).__abilityBattleEffectsCheck;
  if (checkFn) {
    const FIELD_SPORT = 14, MUD_SPORT = 253, WATER_SPORT = 254;
    if (type === TYPE_ELECTRIC && checkFn(FIELD_SPORT, 0, 0, MUD_SPORT, 0)) {
      gBattleMovePower = Math.floor(gBattleMovePower / 2);
    }
    if (type === TYPE_FIRE && checkFn(FIELD_SPORT, 0, 0, WATER_SPORT, 0)) {
      gBattleMovePower = Math.floor(gBattleMovePower / 2);
    }
  }

  // Pinch boosters (Overgrow/Blaze/Torrent/Swarm at <= 1/3 HP).
  if (type === TYPE_GRASS && attacker.ability === ABILITY_OVERGROW && attacker.hp <= Math.floor(attacker.maxHP / 3)) {
    gBattleMovePower = Math.floor((150 * gBattleMovePower) / 100);
  }
  if (type === TYPE_FIRE && attacker.ability === ABILITY_BLAZE && attacker.hp <= Math.floor(attacker.maxHP / 3)) {
    gBattleMovePower = Math.floor((150 * gBattleMovePower) / 100);
  }
  if (type === TYPE_WATER && attacker.ability === ABILITY_TORRENT && attacker.hp <= Math.floor(attacker.maxHP / 3)) {
    gBattleMovePower = Math.floor((150 * gBattleMovePower) / 100);
  }
  if (type === TYPE_BUG && attacker.ability === ABILITY_SWARM && attacker.hp <= Math.floor(attacker.maxHP / 3)) {
    gBattleMovePower = Math.floor((150 * gBattleMovePower) / 100);
  }

  // Self-destruct / Explosion cut defense in half.
  if (getBattleMove(gCurrentMove).effect === EFFECT_EXPLOSION) {
    defense = Math.floor(defense / 2);
  }

  // ─── Physical formula ─────────────────────────────────────────────────
  if (isTypePhysical(type)) {
    // Attack stage : ignore drop si crit.
    if (gCritMultiplier === 2) {
      if (attacker.statStages[STAT_ATK] > DEFAULT_STAT_STAGE) {
        damage = applyStatMod(attacker, attack, STAT_ATK);
      } else {
        damage = attack;
      }
    } else {
      damage = applyStatMod(attacker, attack, STAT_ATK);
    }

    damage = damage * gBattleMovePower;
    damage *= (Math.floor(2 * attacker.level / 5) + 2);

    // Defense stage : ignore boost si crit.
    if (gCritMultiplier === 2) {
      if (defender.statStages[STAT_DEF] < DEFAULT_STAT_STAGE) {
        damageHelper = applyStatMod(defender, defense, STAT_DEF);
      } else {
        damageHelper = defense;
      }
    } else {
      damageHelper = applyStatMod(defender, defense, STAT_DEF);
    }

    damage = Math.floor(damage / damageHelper);
    damage = Math.floor(damage / 50);

    // Burn ÷2 (sans Guts).
    if ((attacker.status1 & STATUS1_BURN) && attacker.ability !== ABILITY_GUTS) {
      damage = Math.floor(damage / 2);
    }

    // Reflect ÷2 (non-crit).
    if ((sideStatus & SIDE_STATUS_REFLECT) && gCritMultiplier === 1) {
      if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE) && countAliveMonsInBattle(BATTLE_ALIVE_DEF_SIDE) === 2) {
        damage = 2 * Math.floor(damage / 3);
      } else {
        damage = Math.floor(damage / 2);
      }
    }

    // Moves hitting both ÷2 in doubles.
    if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE) && getBattleMove(move).target === MOVE_TARGET_BOTH && countAliveMonsInBattle(BATTLE_ALIVE_DEF_SIDE) === 2) {
      damage = Math.floor(damage / 2);
    }

    // Min 1 damage.
    if (damage === 0) damage = 1;
  }

  // Mystery type → 0 damage.
  if (type === TYPE_MYSTERY) damage = 0;

  // ─── Special formula ─────────────────────────────────────────────────
  if (isTypeSpecial(type)) {
    if (gCritMultiplier === 2) {
      if (attacker.statStages[STAT_SPATK] > DEFAULT_STAT_STAGE) {
        damage = applyStatMod(attacker, spAttack, STAT_SPATK);
      } else {
        damage = spAttack;
      }
    } else {
      damage = applyStatMod(attacker, spAttack, STAT_SPATK);
    }

    damage = damage * gBattleMovePower;
    damage *= (Math.floor(2 * attacker.level / 5) + 2);

    if (gCritMultiplier === 2) {
      if (defender.statStages[STAT_SPDEF] < DEFAULT_STAT_STAGE) {
        damageHelper = applyStatMod(defender, spDefense, STAT_SPDEF);
      } else {
        damageHelper = spDefense;
      }
    } else {
      damageHelper = applyStatMod(defender, spDefense, STAT_SPDEF);
    }

    damage = Math.floor(damage / damageHelper);
    damage = Math.floor(damage / 50);

    // Light Screen ÷2 (non-crit).
    if ((sideStatus & SIDE_STATUS_LIGHTSCREEN) && gCritMultiplier === 1) {
      if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE) && countAliveMonsInBattle(BATTLE_ALIVE_DEF_SIDE) === 2) {
        damage = 2 * Math.floor(damage / 3);
      } else {
        damage = Math.floor(damage / 2);
      }
    }

    // Both targets ÷2 in doubles.
    const MOVE_TARGET_BOTH = 0x08;
    if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE) && getBattleMove(move).target === MOVE_TARGET_BOTH && countAliveMonsInBattle(BATTLE_ALIVE_DEF_SIDE) === 2) {
      damage = Math.floor(damage / 2);
    }

    // Weather modifiers (= seulement si pas Air Lock / Cloud Nine).
    // AUDIT BUG FIX : `import { gBattleWeather }` était snapshot stale via Vite
    // ESM modulisation. On force fresh read via __battleStateMutators.
    if (weatherHasEffect()) {
      const weather = (globalThis as { __battleStateMutators?: { getBattleWeather?: () => number } })
        .__battleStateMutators?.getBattleWeather?.() ?? gBattleWeather;
      // Rain weakens Fire, boosts Water.
      if (weather & B_WEATHER_RAIN_TEMPORARY) {
        if (type === TYPE_FIRE) damage = Math.floor(damage / 2);
        else if (type === TYPE_WATER) damage = Math.floor((15 * damage) / 10);
      }
      // Any weather except sun weakens Solar Beam.
      if ((weather & (B_WEATHER_RAIN | B_WEATHER_SANDSTORM | B_WEATHER_HAIL)) && gCurrentMove === MOVE_SOLAR_BEAM) {
        damage = Math.floor(damage / 2);
      }
      // Sun boosts Fire, weakens Water.
      if (weather & B_WEATHER_SUN) {
        if (type === TYPE_FIRE) damage = Math.floor((15 * damage) / 10);
        else if (type === TYPE_WATER) damage = Math.floor(damage / 2);
      }
    }

    // 1:1 décomp pokemon.c:3367-3369 : Flash Fire triggered → ×1.5 sur Fire move.
    const flashFireBit = (globalThis as { __RESOURCE_FLAG_FLASH_FIRE?: number }).__RESOURCE_FLAG_FLASH_FIRE ?? 0;
    if (flashFireBit
        && (gBattleResourcesFlagsDC[battlerIdAtk] & flashFireBit)
        && type === TYPE_FIRE) {
      damage = Math.floor((15 * damage) / 10);
    }
  }

  // Final + 2.
  return { damage: damage + 2, powerOut: gBattleMovePower };
}

/** Wraps `CalculateBaseDamage` 1:1 décomp (= retourne damage BASE pre-crit
 *  multiplier). Le caller (Cmd_damagecalc) applique gCritMultiplier ×
 *  gBattleScripting.dmgMultiplier + STATUS3_CHARGED_UP + helpingHand. */
export function runDamagecalc(
  sideStatus: number,
  dynamicBasePower: number,
  dynamicMoveType: number,
): number {
  const attacker = gBattleMons[gBattlerAttacker];
  const defender = gBattleMons[gBattlerTarget];
  const { damage } = CalculateBaseDamage(
    attacker, defender, gCurrentMove,
    sideStatus, dynamicBasePower, dynamicMoveType,
    gBattlerAttacker, gBattlerTarget,
  );
  return damage;
}

// ─── GetDefaultMoveTarget (pokemon.c:3422-3446) — absorbé depuis ex-engine/battle/util.ts
//     (éclatement grab-bag util, 2026-06-13). ──
/** 1:1 décomp `GetDefaultMoveTarget(battler)`. Retourne le default target pour
 *  un battler (= utilisé quand le UI demande qui attaque par défaut sans
 *  override). Logique single vs double battle. */
export function GetDefaultMoveTarget(battler: number): number {
  // Lazy lookup gBattleTypeFlags + gAbsentBattlerFlags from globalThis (= évite circular).
  const BIT_SIDE = 1;
  const BIT_FLANK = 2;
  const BATTLE_TYPE_DOUBLE = 1;  // 1 << 0
  const stateMod = (globalThis as { __battleState?: { gBattleTypeFlags?: number; gAbsentBattlerFlags?: number } }).__battleState;
  const gBattleTypeFlags = stateMod?.gBattleTypeFlags ?? 0;
  const gAbsentBattlerFlags = stateMod?.gAbsentBattlerFlags ?? 0;

  const battlerSide = battler & BIT_SIDE;
  const opposing = battlerSide ^ BIT_SIDE;

  if (!(gBattleTypeFlags & BATTLE_TYPE_DOUBLE)) {
    return GetBattlerAtPosition(opposing);
  }
  const aliveExceptActive = 2;
  if (aliveExceptActive > 1) {
    const position = (Math.random() < 0.5) ? (opposing ^ BIT_FLANK) : opposing;
    return GetBattlerAtPosition(position);
  }
  if (gAbsentBattlerFlags & (1 << opposing)) {
    return GetBattlerAtPosition(opposing ^ BIT_FLANK);
  }
  return GetBattlerAtPosition(opposing);
}

/** 1:1 décomp `static const u16 sHMMoves[]` (pokemon.c:2109-2113) — les 8 CS
 *  (HM01-HM08 : Coupe, Vol, Surf, Force, Flash, Éclate-Roc, Cascade, Plongée).
 *  Le décomp termine par `HM_MOVES_END` (sentinelle) ; en TS la longueur du
 *  tableau joue ce rôle. */
const sHMMoves: readonly number[] = [
  MOVE_CUT, MOVE_FLY, MOVE_SURF, MOVE_STRENGTH, MOVE_FLASH,
  MOVE_ROCK_SMASH, MOVE_WATERFALL, MOVE_DIVE,
];

/** 1:1 décomp `bool32 IsHMMove2(u16 move)` (pokemon.c:6542-6551) :
 *  ```c
 *  while (sHMMoves[i] != HM_MOVES_END)
 *      if (sHMMoves[i++] == move) return TRUE;
 *  return FALSE;
 *  ```
 *  TRUE si `move` est une CS. Primitif partagé : apprentissage de move qui ne
 *  peut écraser une CS (battle_script_commands.c:5471 Cmd_yesnoboxlearnmove,
 *  evolution_scene.c:977/1359). Distinct de `IsMoveHm` (party_menu.c, via
 *  sTMHMMoves) utilisé par l'écran de résumé. */
export function IsHMMove2(move: number): boolean {
  return sHMMoves.includes(move);
}

// Exposition dev (sonde déterministe IsHMMove2), sans effet sur le jeu.
(globalThis as Record<string, unknown>).__IsHMMove2 = IsHMMove2;
