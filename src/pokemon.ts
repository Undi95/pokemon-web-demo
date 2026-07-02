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
  PLAYER_HAS_TWO_USABLE_MONS, PLAYER_HAS_ONE_MON, PLAYER_HAS_ONE_USABLE_MON,
  MON_ALREADY_KNOWS_MOVE, MON_HAS_MAX_MOVES,
  EVO_MODE_NORMAL, EVO_MODE_TRADE, EVO_MODE_ITEM_USE, EVO_MODE_ITEM_CHECK, MAX_LEVEL,
  MAX_LEVEL_UP_MOVES,
  OT_ID_PRESET, OT_ID_RANDOM_NO_SHINY, MAX_IV_MASK } from '../include/constants/pokemon';
// ⚠️ PAS d'import statique de rtc.ts ici : pokemon.ts est FONDATIONNEL (tiré par
// party-storage très tôt) et rtc.ts importe save.ts + string_util → cycle ESM
// (TDZ gStringVar1 à text.ts:1253, vu au boot 2026-07-02). Pattern établi :
// `globalThis.__rtc` (rtc.ts:332 — lazy, pour les consommateurs profonds).
type RtcBridge = { RtcCalcLocalTime: () => void; gLocalTime: { hours: number } };
const _rtc = (): RtcBridge | undefined => (globalThis as { __rtc?: RtcBridge }).__rtc;
// PARTY_SIZE + VERSION_EMERALD (gGameVersion) + LANGUAGE_FRENCH (gGameLanguage) depuis le
// header global (leaf, zéro cycle) — pour gPlayerParty/gEnemyParty + CreateBoxMon.
import { PARTY_SIZE, VERSION_EMERALD, LANGUAGE_FRENCH } from '../include/constants/global';
// Random32 (PRNG 32-bit) ← include/random (leaf) — pour CreateBoxMon (personality + OT id).
import { Random32 } from '../include/random';
// gSaveBlock2Ptr : IsOtherTrainer compare otId/otName au joueur. save-block-state est leaf
// (n'importe ni pokemon.ts ni party-storage) → edge one-way, zéro cycle.
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import {
  MOVE_NONE,
  MOVE_CUT, MOVE_FLY, MOVE_SURF, MOVE_STRENGTH, MOVE_FLASH,
  MOVE_ROCK_SMASH, MOVE_WATERFALL, MOVE_DIVE,
} from '../include/constants/moves';
// `gSpeciesInfo[species].genderRatio` via le pont data number→info (en attendant le
// port de `data.c`/species_info.h ; dans le décomp gSpeciesInfo est inclus DANS pokemon.c).
import { getSpeciesGenderRatio, speciesNumberToEnum } from './engine/battle/data/species-runtime';
// Macro `GET_SHINY_VALUE` du header miroir (cycle impl↔header fonction-seulement = bénin).
import { GET_SHINY_VALUE } from '../include/pokemon';
// ─── CalculateBaseDamage (pokemon.c:3107-3373) — imports absorbés depuis
//     ex-engine/battle/damage-calc.ts (2026-06-13). gStatStageRatios = local. ───
import {
  gBattleMons, gBattlerAttacker, gBattlerTarget, gBattleTypeFlags,
  gBattleWeather, gCritMultiplier, gBattleScripting, gCurrentMove,
  gActiveBattler, gAbsentBattlerFlags,
  gBattleResourcesFlags as gBattleResourcesFlagsDC,
  setMoveToLearn,
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
  HOLD_EFFECT_MACHO_BRACE,
  HOLD_EFFECT_PREVENT_EVOLVE,
} from '../include/constants/hold_effects';
import { ITEM_ENIGMA_BERRY } from '../include/constants/items';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import {
  SPECIES_LATIAS as SPECIES_LATIAS_LOCAL,
  SPECIES_LATIOS as SPECIES_LATIOS_LOCAL,
  SPECIES_CLAMPERL as SPECIES_CLAMPERL_LOCAL,
  SPECIES_PIKACHU as SPECIES_PIKACHU_LOCAL,
  SPECIES_DITTO as SPECIES_DITTO_LOCAL,
  SPECIES_CUBONE as SPECIES_CUBONE_LOCAL,
  SPECIES_MAROWAK as SPECIES_MAROWAK_LOCAL,
  SPECIES_EGG,
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
// getSpeciesInfo (table espèces) + reverse/resolveDecompConstant : pour GetAbilityBySpecies.
// game-data + decomp-constants sont leaf (n'importent pas le foyer) → edges one-way, zéro cycle.
import { getSpeciesInfo, gBattleMoves, gSpeciesInfo, getTmhmLearnset, getLevelUpLearnset,
  getExperienceForLevel, gSpeciesNames, getEvolutions } from './engine/data/game-data';
// sTMHMMoves : table FOREACH_TMHM (leaf, n'importe que constants/items) — pour CanSpeciesLearnTMHM.
import { sTMHMMoves } from './engine/pokemon/tmhm-moves';
import { reverseDecompConstant, resolveDecompConstant } from '../harness/runtime/decomp-constants';
import { Random } from './random';  // leaf (PRNG) — pour AdjustFriendship (gate WALKING).
// Constantes MON_DATA_* : enum 1:1 de son foyer-header include/pokemon.ts (= include/pokemon.h).
// Importées DEPUIS le header (leaf), plus depuis party-storage → supprime le back-edge
// src/pokemon→party-storage (le cycle runtime documenté est éliminé : l'edge
// include/pokemon↔src/pokemon préexistait déjà, fonction-only bénin).
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
} from '../include/pokemon';

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

/** 1:1 décomp `u8 GetMonsStateToDoubles_2(void)` (pokemon.c:4514-4531).
 *  ```c
 *  for (i = 0; i < PARTY_SIZE; i++) {
 *      u32 species = GetMonData(&gPlayerParty[i], MON_DATA_SPECIES_OR_EGG, NULL);
 *      if (species != SPECIES_EGG && species != SPECIES_NONE
 *       && GetMonData(&gPlayerParty[i], MON_DATA_HP, NULL) != 0)
 *          aliveCount++;
 *  }
 *  if (aliveCount == 1) return PLAYER_HAS_ONE_MON;
 *  return (aliveCount > 1) ? PLAYER_HAS_TWO_USABLE_MONS : PLAYER_HAS_ONE_USABLE_MON;
 *  ```
 *  Variante bornée PARTY_SIZE (≠ gPlayerPartyCount) utilisée par trainer_see.c
 *  (CheckForTrainersWantingBattle / CheckTrainer) pour décider si un dresseur
 *  double peut engager. Adaptation modèle identique à GetMonsStateToDoubles :
 *  MON_DATA_SPECIES_OR_EGG renvoie 0 (NONE) pour un œuf chez nous → on teste
 *  `species != 0 && !IS_EGG` (équivalent strict aux 2 gardes SPECIES_EGG/NONE). */
export function GetMonsStateToDoubles_2(): number {
  let aliveCount = 0;
  for (let i = 0; i < PARTY_SIZE; i++) {
    const mon = gPlayerParty[i];
    if (mon && mon.species !== 0 && !(GetMonData(mon, MON_DATA_IS_EGG) as number)
        && (GetMonData(mon, MON_DATA_HP) as number) !== 0) {
      aliveCount++;
    }
  }
  if (aliveCount === 1) return PLAYER_HAS_ONE_MON; // may have more than one, but only one is alive
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

/** 1:1 décomp `u16 GetMonEVCount(struct Pokemon *mon)` (pokemon.c:6054-6062) :
 *  somme des 6 EVs (HP..SPDEF). Consolidé depuis party-storage.ts. */
export function GetMonEVCount(mon: Pokemon): number {
  let count = 0;
  for (let i = 0; i < 6 /* NUM_STATS */; i++) {
    count += GetMonData(mon, MON_DATA_HP_EV + i) as number;
  }
  return count;
}
// Exposition dev (sonde déterministe GetMonEVCount), sans effet sur le jeu.
(globalThis as Record<string, unknown>).__GetMonEVCount = GetMonEVCount;

// ─── MonGainEVs (= 1:1 décomp pokemon.c:5975-6052) ───────────────────────

const _MAX_TOTAL_EVS = 510;
const _MAX_PER_STAT_EVS = 255;

/** 1:1 décomp `MonGainEVs(mon, defeatedSpecies)` (pokemon.c:5975-6052) — FOYER canonique.
 *  Award EVs from defeated mon's evYield : Pokérus ×2 (CheckPartyHasHadPokerus) +
 *  HOLD_EFFECT_MACHO_BRACE ×2 (Enigma Berry → holdEffect de la save 1:1 ; la branche
 *  `gMain.inBattle → gEnigmaBerries[0]` = link/combat, N/A solo), caps 510 total /
 *  255 par stat.
 *  ⚠️ CONSOLIDATION DIFFÉRÉE (reprise combat) : la voie combat vivante =
 *  `battle_script_commands.ts:_MonGainEVs` (même logique 1:1, monId+species
 *  numérique) — à re-router vers CE foyer quand le combat sera dé-pausé. */
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
    // 1:1 pokemon.c:5996-5999 : Pokérus (actif OU guéri) → ×2.
    const multiplier = CheckPartyHasHadPokerus([mon], 0) ? 2 : 1;
    let evIncrease = yields[i] * multiplier;

    // 1:1 pokemon.c:6023-6036 : hold effect — Enigma Berry lit la save (solo).
    const holdEffect = mon.heldItem === ITEM_ENIGMA_BERRY
      ? ((gSaveBlock1Ptr as { enigmaBerry?: { holdEffect?: number } }).enigmaBerry?.holdEffect ?? 0)
      : GetItemHoldEffect(mon.heldItem);
    if (holdEffect === HOLD_EFFECT_MACHO_BRACE) evIncrease *= 2;

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

// ─── GetEvolutionTargetSpecies (= 1:1 décomp pokemon.c:5490-5608) ──────────

// 1:1 décomp pokemon.c:52-58 (defines locaux au fichier).
const DAY_EVO_HOUR_BEGIN = 12;
const DAY_EVO_HOUR_END = 24;        // HOURS_PER_DAY
const NIGHT_EVO_HOUR_BEGIN = 0;
const NIGHT_EVO_HOUR_END = 12;
const FRIENDSHIP_EVO_THRESHOLD = 220;

/** 1:1 décomp `u16 GetEvolutionTargetSpecies(struct Pokemon *mon, u8 mode, u16 evolutionItem)`
 *  (pokemon.c:5490-5608). Table : `gEvolutionTable[species][EVOS_PER_MON]` =
 *  notre `getEvolutions(SPECIES_key)` (evolutions.json, diff 1:1 vérifié 172/172 ;
 *  les slots EVO_NONE du C sont absents du JSON → itérer les entrées présentes est
 *  identique, EVO_NONE ne matche aucun case). `method` = noms EVO_* string (mêmes
 *  noms décomp) ; `target` clé SPECIES_* → id via resolveDecompConstant ; `param`
 *  déjà numérique (niveaux/items/beauté). Everstone bloque sauf EVO_MODE_ITEM_CHECK. */
export function GetEvolutionTargetSpecies(mon: Pokemon, mode: number, evolutionItem: number): number {
  let targetSpecies = 0;
  const species = GetMonData(mon, MON_DATA_SPECIES) as number;
  let heldItem = GetMonData(mon, MON_DATA_HELD_ITEM) as number;
  const personality = (GetMonData(mon, MON_DATA_PERSONALITY) as number) >>> 0;
  const beauty = GetMonData(mon, MON_DATA_BEAUTY) as number;
  const upperPersonality = (personality >>> 16) & 0xFFFF;

  // 1:1 :5503-5506 : Enigma Berry lit la save (solo), sinon table hold effects.
  const holdEffect = heldItem === ITEM_ENIGMA_BERRY
    ? ((gSaveBlock1Ptr as { enigmaBerry?: { holdEffect?: number } }).enigmaBerry?.holdEffect ?? 0)
    : GetItemHoldEffect(heldItem);

  // Prevent evolution with Everstone, unless we're just viewing the party menu with an evolution item
  if (holdEffect === HOLD_EFFECT_PREVENT_EVOLVE && mode !== EVO_MODE_ITEM_CHECK)
    return 0; // SPECIES_NONE

  const speciesKey = reverseDecompConstant(species, 'SPECIES_');
  const evolutions = speciesKey ? getEvolutions(speciesKey) : [];
  const targetIdOf = (key: string): number => (resolveDecompConstant(key) as number | undefined) ?? 0;

  switch (mode) {
    case EVO_MODE_NORMAL: {
      const level = GetMonData(mon, MON_DATA_LEVEL) as number;
      const friendship = GetMonData(mon, MON_DATA_FRIENDSHIP) as number;
      for (const evo of evolutions) {
        switch (evo.method) {
          case 'EVO_FRIENDSHIP':
            if (friendship >= FRIENDSHIP_EVO_THRESHOLD) targetSpecies = targetIdOf(evo.target);
            break;
          case 'EVO_FRIENDSHIP_DAY': {
            const rtc = _rtc();               // 1:1 RtcCalcLocalTime() + gLocalTime.hours
            rtc?.RtcCalcLocalTime();
            const hours = rtc?.gLocalTime.hours ?? 0;
            if (hours >= DAY_EVO_HOUR_BEGIN && hours < DAY_EVO_HOUR_END
              && friendship >= FRIENDSHIP_EVO_THRESHOLD) targetSpecies = targetIdOf(evo.target);
            break;
          }
          case 'EVO_FRIENDSHIP_NIGHT': {
            const rtc = _rtc();
            rtc?.RtcCalcLocalTime();
            const hours = rtc?.gLocalTime.hours ?? 0;
            if (hours >= NIGHT_EVO_HOUR_BEGIN && hours < NIGHT_EVO_HOUR_END
              && friendship >= FRIENDSHIP_EVO_THRESHOLD) targetSpecies = targetIdOf(evo.target);
            break;
          }
          case 'EVO_LEVEL':
            if (evo.param <= level) targetSpecies = targetIdOf(evo.target);
            break;
          case 'EVO_LEVEL_ATK_GT_DEF':
            if (evo.param <= level)
              if ((GetMonData(mon, MON_DATA_ATK) as number) > (GetMonData(mon, MON_DATA_DEF) as number))
                targetSpecies = targetIdOf(evo.target);
            break;
          case 'EVO_LEVEL_ATK_EQ_DEF':
            if (evo.param <= level)
              if ((GetMonData(mon, MON_DATA_ATK) as number) === (GetMonData(mon, MON_DATA_DEF) as number))
                targetSpecies = targetIdOf(evo.target);
            break;
          case 'EVO_LEVEL_ATK_LT_DEF':
            if (evo.param <= level)
              if ((GetMonData(mon, MON_DATA_ATK) as number) < (GetMonData(mon, MON_DATA_DEF) as number))
                targetSpecies = targetIdOf(evo.target);
            break;
          case 'EVO_LEVEL_SILCOON':
            if (evo.param <= level && (upperPersonality % 10) <= 4) targetSpecies = targetIdOf(evo.target);
            break;
          case 'EVO_LEVEL_CASCOON':
            if (evo.param <= level && (upperPersonality % 10) > 4) targetSpecies = targetIdOf(evo.target);
            break;
          case 'EVO_LEVEL_NINJASK':
            // (EVO_LEVEL_SHEDINJA n'est PAS géré ici — cf. CreateShedinja, appelé par la scène d'évolution.)
            if (evo.param <= level) targetSpecies = targetIdOf(evo.target);
            break;
          case 'EVO_BEAUTY':
            if (evo.param <= beauty) targetSpecies = targetIdOf(evo.target);
            break;
        }
      }
      break;
    }
    case EVO_MODE_TRADE: {
      for (const evo of evolutions) {
        switch (evo.method) {
          case 'EVO_TRADE':
            targetSpecies = targetIdOf(evo.target);
            break;
          case 'EVO_TRADE_ITEM':
            if (evo.param === heldItem) {
              heldItem = 0; // ITEM_NONE — l'objet est consommé par l'échange (1:1 :5586)
              SetMonData(mon, MON_DATA_HELD_ITEM, heldItem);
              targetSpecies = targetIdOf(evo.target);
            }
            break;
        }
      }
      break;
    }
    case EVO_MODE_ITEM_USE:
    case EVO_MODE_ITEM_CHECK: {
      for (const evo of evolutions) {
        if (evo.method === 'EVO_ITEM' && evo.param === evolutionItem) {
          targetSpecies = targetIdOf(evo.target);
          break;
        }
      }
      break;
    }
  }

  return targetSpecies;
}

// ─── SetWildMonHeldItem (= 1:1 décomp pokemon.c) ──────────────────────────

/** 1:1 décomp `SetWildMonHeldItem(void)`. Donne (ou non) un objet tenu au mon
 *  sauvage `gEnemyParty[0]` selon le tirage `Random()%100` et l'evYield d'objets
 *  de l'espèce.
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

/** 1:1 décomp `void EvolutionRenameMon(struct Pokemon *mon, u16 oldSpecies, u16 newSpecies)`
 *  (pokemon.c:5801-5808) : si le mon n'a pas de surnom custom (nickname == nom d'espèce,
 *  même langue que le jeu), le « surnom » suit l'évolution (TREECKO → GROVYLE).
 *  Adaptation modèle : nicknames = strings JS (gSpeciesNames data layer) → le
 *  StringCompare décomp (bytes) ⟺ `!==` strict sur strings. GAME_LANGUAGE = FRENCH. */
export function EvolutionRenameMon(mon: Pokemon, oldSpecies: number, newSpecies: number): void {
  const nickname = GetMonData(mon, MON_DATA_NICKNAME) as string;
  const language = GetMonData(mon, MON_DATA_LANGUAGE) as number;
  if (language === LANGUAGE_FRENCH /* GAME_LANGUAGE */ && nickname === (gSpeciesNames[oldSpecies] ?? ''))
    SetMonData(mon, MON_DATA_NICKNAME, gSpeciesNames[newSpecies] ?? '');
}

// ─── Légalité d'apprentissage CT/CS (1:1 décomp pokemon.c) ────────────────

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

/** 1:1 décomp `u8 CheckPartyHasHadPokerus(party, selection)` (pokemon.c:6129) : pour
 *  les slots sélectionnés (bitmask), set le bit retVal si le mon a un octet Pokérus
 *  != 0 (l'a / l'a eu). selection==0 → check slot 0. Consolidé depuis battle_main.ts. */
export function CheckPartyHasHadPokerus(party: Array<{ pokerus: number }>, selection: number): number {
  let retVal = 0;
  let partyIndex = 0;
  let curBit = 1;
  if (selection) {
    do {
      if ((selection & 1) && party[partyIndex].pokerus) retVal |= curBit;
      partyIndex++;
      curBit <<= 1;
      selection >>= 1;
    } while (selection);
  } else if (party[0].pokerus) {
    retVal = 1;
  }
  return retVal;
}

/** 1:1 décomp `void RandomlyGivePartyPokerus(party)` (pokemon.c:6072) : ~3/65536 par
 *  combat (Random ∈ {0x4000,0x8000,0xC000}) → tire un slot non-œuf au hasard ; s'il
 *  n'a jamais eu le Pokérus, lui assigne un octet souche (low 3 bits non nuls,
 *  dupliqué high nibble, masqué 0xF3, +1). `party` = gPlayerParty (Pokemon numérique).
 *  Consolidé depuis battle_main.ts. */
export function RandomlyGivePartyPokerus(party: unknown): void {
  const p = party as Array<{ species: number; isEgg: number; pokerus: number }>;
  const rnd = Random();
  if (rnd === 0x4000 || rnd === 0x8000 || rnd === 0xC000) {
    let slot: number;
    do {
      slot = Random() % PARTY_SIZE;
    } while (!p[slot].species || p[slot].isEgg);
    // 1:1 : gBitTable[slot] === (1 << slot).
    if (!CheckPartyHasHadPokerus(p, 1 << slot)) {
      let rnd2: number;
      do {
        rnd2 = Random() & 0xFF;
      } while ((rnd2 & 0x7) === 0);
      if (rnd2 & 0xF0) rnd2 &= 0x7;
      rnd2 |= (rnd2 << 4);
      rnd2 &= 0xF3;
      rnd2++;
      p[slot].pokerus = rnd2 & 0xFF;
    }
  }
}

/** 1:1 décomp `PartySpreadPokerus(party)` (pokemon.c:6181). 1/3 de chance après
 *  combat : chaque mon infecté (souche = low nibble 0xF set) propage son octet
 *  Pokérus complet aux mons adjacents JAMAIS infectés (high nibble 0xF0 == 0).
 *  `party` = gPlayerParty (Pokemon struct numérique) → champs `species`/`pokerus`
 *  lus/écrits direct (équivalent GetMonData/SetMonData(MON_DATA_POKERUS)).
 *  Consolidé depuis battle_main.ts. */
export function PartySpreadPokerus(party: unknown): void {
  const p = party as Array<{ species: number; pokerus: number }>;
  if ((Random() % 3) === 0) {
    for (let i = 0; i < PARTY_SIZE; i++) {
      const mon = p[i];
      if (mon && mon.species) {
        const pokerus = mon.pokerus;
        const curPokerus = pokerus;
        if (pokerus) {
          if (pokerus & 0xF) {
            if (i !== 0 && !(p[i - 1].pokerus & 0xF0))
              p[i - 1].pokerus = curPokerus;
            if (i !== (PARTY_SIZE - 1) && !(p[i + 1].pokerus & 0xF0)) {
              p[i + 1].pokerus = curPokerus;
              i++;
            }
          }
        }
      }
    }
  }
}

/** 1:1 décomp `GetAbilityBySpecies(species, abilityNum)` (pokemon.c).
 *  Lookup `gSpeciesInfo[species].abilities[abilityNum]`. Retourne l'ability id
 *  (= ABILITY_*) ou 0 (ABILITY_NONE) si pas trouvé. Consolidé depuis party-storage.ts. */
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

/** 1:1 décomp `CalculateMonStats(mon)` (pokemon.c:2824-2899).
 *  Calcule maxHP + attack + defense + speed + spAttack + spDefense depuis baseStats
 *  (= gSpeciesInfo[species]) + IVs + EVs + level + nature. Met à jour aussi `currentHP`
 *  si la diff doit être propagée. Consolidé depuis party-storage.ts (nature +
 *  ModifyStatByNature appelés same-file ; l'ex-adapter _modifyStatByNature inliné `+1`). */
export function CalculateMonStats(mon: Pokemon): void {
  if (mon.species === 0) return;
  const speciesEnum = reverseDecompConstant(mon.species, 'SPECIES_');
  if (!speciesEnum) return;
  const info = getSpeciesInfo(speciesEnum);
  if (!info?.stats) return;
  const base = info.stats;
  // 1:1 :2841-2845 : le NIVEAU est RE-DÉRIVÉ de l'EXP puis re-posé (c'est CE mécanisme
  // qui fait monter le niveau après un gain d'EXP — Cmd_getexp/Rare Candy appellent
  // CalculateMonStats après avoir crédité l'EXP). Avant : `mon.level || 1` figé.
  const level = GetLevelFromMonExp(mon);
  SetMonData(mon, MON_DATA_LEVEL, level);
  const nature = GetNatureFromPersonality(mon.personality >>> 0);

  // 1:1 décomp species.h : SPECIES_SHEDINJA = 303.
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

  // 1:1 :2856-2858 : gBattleScripting.levelUpHP = diff (min 1) — consommé par
  // l'affichage « +N PV » du level-up en combat (Cmd_getexp / boîte stats).
  gBattleScripting.levelUpHP = (newMaxHP - previousMaxHP) & 0xFF;
  if (gBattleScripting.levelUpHP === 0) gBattleScripting.levelUpHP = 1;

  // CALC_STAT macro inline expand : (((2*base + IV + EV/4) * level) / 100) + 5,
  // then ModifyStatByNature (statIdx 0-based ici → +1 pour la signature 1-based 1:1).
  const calc = (baseStat: number, iv: number, ev: number, statIdx: number): number => {
    const n = 2 * baseStat + iv;
    let stat = Math.floor(((n + Math.floor(ev / 4)) * level) / 100) + 5;
    stat = ModifyStatByNature(nature, stat, statIdx + 1) & 0xFFFF;
    return stat;
  };
  mon.attack    = calc(base.atk, mon.attackIV,    mon.attackEV,    0); // STAT_ATK
  mon.defense   = calc(base.def, mon.defenseIV,   mon.defenseEV,   1); // STAT_DEF
  mon.speed     = calc(base.spe, mon.speedIV,     mon.speedEV,     2); // STAT_SPEED
  mon.spAttack  = calc(base.spa, mon.spAttackIV,  mon.spAttackEV,  3); // STAT_SPATK
  mon.spDefense = calc(base.spd, mon.spDefenseIV, mon.spDefenseEV, 4); // STAT_SPDEF

  // 1:1 décomp :2870-2896 : adjust currentHP par la diff maxHP - previousMaxHP.
  if (mon.species === SPECIES_SHEDINJA) {
    if (mon.hp !== 0 || previousMaxHP === 0) mon.hp = 1;
    else return;
  } else if (mon.hp === 0 && previousMaxHP === 0) {
    mon.hp = newMaxHP;
  } else if (mon.hp !== 0) {
    // BUG décomp CONSERVÉ (pokemon.c:2886) : « currentHP is unintentionally able to
    // become <= 0 » = le Pomeg berry glitch. Le clamp `hp = 1` est sous #ifdef BUGFIX
    // (non défini sur la ROM) → PAS de clamp chez nous non plus (1:1 structurel).
    mon.hp += newMaxHP - previousMaxHP;
  } else {
    return; // stay at 0 (= fainted)
  }

  // 1:1 :2898 SetMonData(MON_DATA_HP, &currentHP) — mon.hp déjà écrit ci-dessus (modèle plat).
}

/** 1:1 décomp `gPPUpGetMask` (pokemon.c) — masque 2 bits par slot de move. */
export const gPPUpGetMask: readonly number[] = [0x03, 0x0c, 0x30, 0xc0];

/** 1:1 décomp `gPPUpClearMask` (pokemon.c, juste sous gPPUpGetMask) — masque
 *  inverse (efface les 2 bits PP-Up du slot). Consommé par RemoveMonPPBonus. */
export const gPPUpClearMask: readonly number[] = [0xfc, 0xf3, 0xcf, 0x3f];

/** 1:1 décomp `void RemoveMonPPBonus(struct Pokemon *mon, u8 moveIndex)`
 *  (pokemon.c:4643-4648) : ppBonuses &= gPPUpClearMask[moveIndex]. Consommé par
 *  l'oubli de capacité (evolution_scene / battle Cmd_setmovepp / party_menu). */
export function RemoveMonPPBonus(mon: Pokemon, moveIndex: number): void {
  let ppBonuses = GetMonData(mon, MON_DATA_PP_BONUSES) as number;
  ppBonuses &= gPPUpClearMask[moveIndex];
  SetMonData(mon, MON_DATA_PP_BONUSES, ppBonuses);
}

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

/** 1:1 STRICT décomp `MonKnowsMove(struct Pokemon *mon, u16 move)` (pokemon.c) :
 *    for (i = 0; i < MAX_MON_MOVES; i++) if (GetMonData(MOVE1+i) == move) return TRUE; */
export function MonKnowsMove(mon: Pokemon, move: number): boolean {
  for (let i = 0; i < 4; i++) {  // MAX_MON_MOVES = 4
    if (GetMonData(mon, MON_DATA_MOVE1 + i) === move) return true;
  }
  return false;
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

/** 1:1 décomp `void DeleteFirstMoveAndGiveMoveToMon(struct Pokemon *mon, u16 move)`
 *  (pokemon.c) : décale les capacités slots 2..4 → 1..3, met `move` au dernier slot
 *  (PP de base `gBattleMoves[move].pp`), décale `ppBonuses` de 2 bits (jette le bonus
 *  de la capacité supprimée). = remplace la capacité la PLUS ANCIENNE quand les 4 slots
 *  sont pleins. Building-block de GiveBoxMonInitialMoveset. */
export function DeleteFirstMoveAndGiveMoveToMon(mon: Pokemon, move: number): void {
  const moves: number[] = [];
  const pp: number[] = [];
  for (let i = 0; i < 4 - 1; i++) {  // MAX_MON_MOVES - 1
    moves[i] = GetMonData(mon, MON_DATA_MOVE2 + i) as number;
    pp[i] = GetMonData(mon, MON_DATA_PP2 + i) as number;
  }
  let ppBonuses = GetMonData(mon, MON_DATA_PP_BONUSES) as number;
  ppBonuses >>= 2;
  moves[4 - 1] = move;
  pp[4 - 1] = gBattleMoves[move]?.pp ?? 0;
  for (let i = 0; i < 4; i++) {  // MAX_MON_MOVES
    SetMonData(mon, MON_DATA_MOVE1 + i, moves[i]);
    SetMonData(mon, MON_DATA_PP1 + i, pp[i]);
  }
  SetMonData(mon, MON_DATA_PP_BONUSES, ppBonuses);
}

/** 1:1 décomp `s32 GetLevelFromBoxMonExp(struct BoxPokemon *boxMon)` (pokemon.c) :
 *  dérive le niveau depuis l'EXP courante via la table d'exp de la growthRate de l'espèce
 *  (plus haut niveau dont le seuil d'exp ≤ exp du mon). Adaptation : seuils via
 *  getExperienceForLevel (= gExperienceTables[growthRate][level]). */
export function GetLevelFromBoxMonExp(mon: Pokemon): number {
  const species = GetMonData(mon, MON_DATA_SPECIES) as number;
  const exp = GetMonData(mon, MON_DATA_EXP) as number;
  const speciesEnum = reverseDecompConstant(species, 'SPECIES_') ?? '';
  const growthRate = (getSpeciesInfo(speciesEnum) as { growthRate?: string } | undefined)?.growthRate ?? 'GROWTH_MEDIUM_FAST';
  let level = 1;
  while (level <= MAX_LEVEL && getExperienceForLevel(growthRate, level) <= exp)
    level++;
  return level - 1;
}

/** 1:1 décomp `u8 GetLevelFromMonExp(struct Pokemon *mon)` (pokemon.c:2911-2921) —
 *  même corps que GetLevelFromBoxMonExp (le décomp duplique ; notre modèle plat
 *  Pokemon == BoxPokemon → délégation). Consommé par CalculateMonStats (1:1 :2841). */
export function GetLevelFromMonExp(mon: Pokemon): number {
  return GetLevelFromBoxMonExp(mon);
}

/** 1:1 décomp `bool8 TryIncrementMonLevel(struct Pokemon *mon)` (pokemon.c:6211-6230) :
 *  clamp l'EXP au max de la growth table, puis passe au niveau suivant si le seuil
 *  est atteint (FALSE si déjà MAX_LEVEL ou seuil non atteint). Consommé par
 *  Cmd_getexp (combat) + Rare Candy (party_menu). */
export function TryIncrementMonLevel(mon: Pokemon): boolean {
  const species = GetMonData(mon, MON_DATA_SPECIES) as number;
  const nextLevel = (GetMonData(mon, MON_DATA_LEVEL) as number) + 1;
  let expPoints = GetMonData(mon, MON_DATA_EXP) as number;
  const speciesEnum = reverseDecompConstant(species, 'SPECIES_') ?? '';
  const growthRate = (getSpeciesInfo(speciesEnum) as { growthRate?: string } | undefined)?.growthRate ?? 'GROWTH_MEDIUM_FAST';
  if (expPoints > getExperienceForLevel(growthRate, MAX_LEVEL)) {
    expPoints = getExperienceForLevel(growthRate, MAX_LEVEL);
    SetMonData(mon, MON_DATA_EXP, expPoints);
  }
  if (nextLevel > MAX_LEVEL || expPoints < getExperienceForLevel(growthRate, nextLevel)) {
    return false;
  } else {
    SetMonData(mon, MON_DATA_LEVEL, nextLevel);
    return true;
  }
}

/** 1:1 décomp `void GiveBoxMonInitialMoveset(struct BoxPokemon *boxMon)` (pokemon.c:2992) :
 *  parcourt le level-up learnset de l'espèce, donne chaque capacité apprenable à
 *  `level` (≤). Si les 4 slots sont pleins → DeleteFirstMove (remplace la + ancienne).
 *  Adaptation modèle plat : `level` lu direct (MON_DATA_LEVEL ; à la création
 *  level == GetLevelFromBoxMonExp) ; le learnset DÉCODÉ {level, MOVE_X} via
 *  getLevelUpLearnset (= gLevelUpLearnsets[species], `moveLevel > level<<9` ⟺
 *  `entry.level > level`). */
export function GiveBoxMonInitialMoveset(mon: Pokemon): void {
  const species = GetMonData(mon, MON_DATA_SPECIES) as number;
  // 1:1 décomp : level = GetLevelFromBoxMonExp (= dérivé de l'EXP, PAS MON_DATA_LEVEL —
  // crucial : dans CreateBoxMon le moveset est posé AVANT que CreateMon ne set MON_DATA_LEVEL,
  // mais l'EXP est déjà posée → le niveau effectif vient de là).
  const level = GetLevelFromBoxMonExp(mon);
  const speciesEnum = reverseDecompConstant(species, 'SPECIES_') ?? '';
  const learnset = getLevelUpLearnset(speciesEnum);
  for (let i = 0; i < learnset.length; i++) {
    if (learnset[i].level > level) break;
    const move = (resolveDecompConstant(learnset[i].move) as number | undefined) ?? 0;
    if (move === MOVE_NONE) continue;
    if (GiveMoveToMon(mon, move) === MON_HAS_MAX_MOVES)
      DeleteFirstMoveAndGiveMoveToMon(mon, move);
  }
}

/** 1:1 décomp `void GiveMonInitialMoveset(struct Pokemon *mon)` (pokemon.c:2987). */
export function GiveMonInitialMoveset(mon: Pokemon): void {
  GiveBoxMonInitialMoveset(mon);
}
// Sonde dev (vérif équivalence vs pickLevelUpMoves), sans effet sur le jeu.
(globalThis as Record<string, unknown>).__GiveMonInitialMoveset = GiveMonInitialMoveset;

/** 1:1 décomp `EWRAM_DATA static u8 sLearningMoveTableID` (pokemon.c:76) — index
 *  persistant dans le learnset entre appels successifs de MonTryLearningNewMove
 *  (« since you can learn more than one move per level »). */
let sLearningMoveTableID = 0;

/** 1:1 décomp `u16 MonTryLearningNewMove(struct Pokemon *mon, bool8 firstMove)`
 *  (pokemon.c:3015-3045) : si firstMove, rembobine sLearningMoveTableID sur la
 *  1re entrée du learnset à `level` (MOVE_NONE si aucune) ; puis si l'entrée
 *  courante est à `level` → gMoveToLearn = move ; sLearningMoveTableID++ ;
 *  return GiveMoveToMon(mon, move) (= move appris · MON_ALREADY_KNOWS_MOVE ·
 *  MON_HAS_MAX_MOVES). Sinon MOVE_NONE. Adaptation modèle : learnset DÉCODÉ
 *  {level, 'MOVE_X'} via getLevelUpLearnset (⟺ `gLevelUpLearnsets[species]`,
 *  `& LEVEL_UP_MOVE_LV == level<<9` ⟺ `entry.level === level`) ; gMoveToLearn
 *  posé via setMoveToLearn (foyer engine/battle/state = battle_main.c EWRAM).
 *  Callers : evolution_scene, party_menu (Rare Candy), Cmd_handlelearnnewmove. */
export function MonTryLearningNewMove(mon: Pokemon, firstMove: boolean): number {
  let retVal = MOVE_NONE;
  const species = GetMonData(mon, MON_DATA_SPECIES) as number;
  const level = GetMonData(mon, MON_DATA_LEVEL) as number;
  const speciesEnum = reverseDecompConstant(species, 'SPECIES_') ?? '';
  const learnset = getLevelUpLearnset(speciesEnum);

  if (firstMove) {
    sLearningMoveTableID = 0;
    while (learnset[sLearningMoveTableID]?.level !== level) {
      sLearningMoveTableID++;
      if (sLearningMoveTableID >= learnset.length)  // ⟺ LEVEL_UP_END
        return MOVE_NONE;
    }
  }

  if (sLearningMoveTableID < learnset.length
      && learnset[sLearningMoveTableID].level === level) {
    const move = (resolveDecompConstant(learnset[sLearningMoveTableID].move) as number | undefined) ?? 0;
    setMoveToLearn(move);  // 1:1 `gMoveToLearn = ...`
    sLearningMoveTableID++;
    retVal = GiveMoveToMon(mon, move);
  }

  return retVal;
}

/** 1:1 décomp `u8 GetLevelUpMovesBySpecies(u16 species, u16 *moves)` (pokemon.c:6310-6318) :
 *  ```c
 *  for (i = 0; i < MAX_LEVEL_UP_MOVES && gLevelUpLearnsets[species][i] != LEVEL_UP_END; i++)
 *      moves[numMoves++] = gLevelUpLearnsets[species][i] & LEVEL_UP_MOVE_ID;
 *  return numMoves;
 *  ```
 *  Remplit `moves` avec TOUS les moves du level-up learnset (sans filtre de niveau),
 *  retourne le compte. Adaptation modèle : learnset DÉCODÉ {level, 'MOVE_X'} via
 *  getLevelUpLearnset (⟺ gLevelUpLearnsets[species] ; fin de liste ⟺ LEVEL_UP_END).
 *  Consommé par BuildEggMoveset (daycare.c:651). */
export function GetLevelUpMovesBySpecies(species: number, moves: number[]): number {
  let numMoves = 0;
  const speciesEnum = reverseDecompConstant(species, 'SPECIES_') ?? '';
  const learnset = getLevelUpLearnset(speciesEnum);
  for (let i = 0; i < MAX_LEVEL_UP_MOVES && i < learnset.length; i++)
    moves[numMoves++] = (resolveDecompConstant(learnset[i].move) as number | undefined) ?? 0;
  return numMoves;
}

/** 1:1 décomp `void CreateBoxMon(struct BoxPokemon*, species, level, fixedIV,
 *  hasFixedPersonality, fixedPersonality, otIdType, fixedOtId)` (pokemon.c:2208).
 *  Génère un Pokemon NUMÉRIQUE directement (PID → OT id → données espèce → IVs →
 *  ability → moveset initial), remplaçant l'indirection PokemonInstance.
 *
 *  Adaptations modèle plat (assumées) : `ZeroBoxMonData` = Object.assign(createEmptyPokemon)
 *  (notre struct DECODED, pas de substructs chiffrés) ; `CalculateBoxMonChecksum`/`EncryptBoxMon`
 *  = SKIP (pas de chiffrement) ; `GetCurrentRegionMapSectionId` = gMapHeader.regionMapSectionId
 *  (string MAPSEC) → id via resolveDecompConstant (lu en globalThis, pattern AdjustFriendship) ;
 *  nickname = gSpeciesNames[species] (data layer) ; gGameLanguage/gGameVersion = LANGUAGE_FRENCH/
 *  VERSION_EMERALD ; otName = gSaveBlock2Ptr.playerName (= 1:1 décomp). ORDRE RNG = personality
 *  (Random32) puis IVs (2×Random) = IDENTIQUE à createPokemonInstance → save-compatible. */
export function CreateBoxMon(
  mon: Pokemon, species: number, level: number, fixedIV: number,
  hasFixedPersonality: boolean, fixedPersonality: number,
  otIdType: number, fixedOtId: number,
): void {
  Object.assign(mon, createEmptyPokemon());  // 1:1 ZeroBoxMonData

  const personality = hasFixedPersonality ? (fixedPersonality >>> 0) : Random32();
  SetMonData(mon, MON_DATA_PERSONALITY, personality);

  // 1:1 décomp : OT id selon le type.
  let value: number;
  if (otIdType === OT_ID_RANDOM_NO_SHINY) {
    let shinyValue: number;
    do {
      value = Random32();
      shinyValue = GET_SHINY_VALUE(value, personality);
    } while (shinyValue < SHINY_ODDS);
  } else if (otIdType === OT_ID_PRESET) {
    value = fixedOtId >>> 0;
  } else {  // OT_ID_PLAYER_ID : le joueur est l'OT.
    value = (gSaveBlock2Ptr.playerTrainerId ?? 0) >>> 0;
  }
  SetMonData(mon, MON_DATA_OT_ID, value);

  // checksum + EncryptBoxMon : SKIP (modèle plat non-chiffré, adaptation assumée).
  const speciesEnum = reverseDecompConstant(species, 'SPECIES_') ?? '';
  const sInfo = getSpeciesInfo(speciesEnum) as { growthRate?: string; friendship?: number; abilities?: string[] } | undefined;
  SetMonData(mon, MON_DATA_NICKNAME, gSpeciesNames[species] ?? speciesEnum.replace(/^SPECIES_/, ''));
  SetMonData(mon, MON_DATA_LANGUAGE, LANGUAGE_FRENCH);
  SetMonData(mon, MON_DATA_OT_NAME, gSaveBlock2Ptr.playerName ?? '');
  SetMonData(mon, MON_DATA_SPECIES, species);
  SetMonData(mon, MON_DATA_EXP, getExperienceForLevel(sInfo?.growthRate ?? 'GROWTH_MEDIUM_FAST', level));
  SetMonData(mon, MON_DATA_FRIENDSHIP, sInfo?.friendship ?? 70);
  const mapHeader = (globalThis as { gMapHeader?: { regionMapSectionId?: string } }).gMapHeader;
  value = (resolveDecompConstant(mapHeader?.regionMapSectionId ?? '') as number | undefined) ?? 0;
  SetMonData(mon, MON_DATA_MET_LOCATION, value);
  SetMonData(mon, MON_DATA_MET_LEVEL, level);
  SetMonData(mon, MON_DATA_MET_GAME, VERSION_EMERALD);
  SetMonData(mon, MON_DATA_POKEBALL, 4 /* ITEM_POKE_BALL */);
  SetMonData(mon, MON_DATA_OT_GENDER, gSaveBlock2Ptr.playerGender ?? 0);

  // 1:1 décomp pokemon.c:2270-2295 : IVs fixes ou 2× Random() (layout 3×5 bits).
  if (fixedIV < 32 /* USE_RANDOM_IVS = MAX_PER_STAT_IVS + 1 */) {
    SetMonData(mon, MON_DATA_HP_IV, fixedIV);
    SetMonData(mon, MON_DATA_ATK_IV, fixedIV);
    SetMonData(mon, MON_DATA_DEF_IV, fixedIV);
    SetMonData(mon, MON_DATA_SPEED_IV, fixedIV);
    SetMonData(mon, MON_DATA_SPATK_IV, fixedIV);
    SetMonData(mon, MON_DATA_SPDEF_IV, fixedIV);
  } else {
    let iv: number;
    value = Random();
    iv = value & MAX_IV_MASK;                  SetMonData(mon, MON_DATA_HP_IV, iv);
    iv = (value & (MAX_IV_MASK << 5)) >> 5;    SetMonData(mon, MON_DATA_ATK_IV, iv);
    iv = (value & (MAX_IV_MASK << 10)) >> 10;  SetMonData(mon, MON_DATA_DEF_IV, iv);
    value = Random();
    iv = value & MAX_IV_MASK;                  SetMonData(mon, MON_DATA_SPEED_IV, iv);
    iv = (value & (MAX_IV_MASK << 5)) >> 5;    SetMonData(mon, MON_DATA_SPATK_IV, iv);
    iv = (value & (MAX_IV_MASK << 10)) >> 10;  SetMonData(mon, MON_DATA_SPDEF_IV, iv);
  }

  // 1:1 décomp : slot d'ability = personality & 1 SI l'espèce a une 2e ability réelle.
  if (sInfo?.abilities?.[1] && sInfo.abilities[1] !== 'ABILITY_NONE') {
    SetMonData(mon, MON_DATA_ABILITY_NUM, personality & 1);
  }

  GiveBoxMonInitialMoveset(mon);
}

/** 1:1 décomp `void CreateMon(struct Pokemon*, species, level, fixedIV,
 *  hasFixedPersonality, fixedPersonality, otIdType, fixedOtId)` (pokemon.c:2196) :
 *  ZeroMonData → CreateBoxMon → SetLevel → SetMail(NONE) → CalculateMonStats.
 *  ⚠️ NB : `CreateMon` (signature décomp numérique) ≠ l'ancienne convenience
 *  `engine/pokemon/pokemon.ts:CreateMon(speciesEnum, level, opts)` (legacy PokemonInstance,
 *  à retirer une fois les callers migrés). */
export function CreateMon(
  mon: Pokemon, species: number, level: number, fixedIV: number,
  hasFixedPersonality: boolean, fixedPersonality: number,
  otIdType: number, fixedOtId: number,
): void {
  ZeroMonData(mon);  // 1:1 décomp CreateMon : ZeroMonData(mon)
  CreateBoxMon(mon, species, level, fixedIV, hasFixedPersonality, fixedPersonality, otIdType, fixedOtId);
  SetMonData(mon, MON_DATA_LEVEL, level);
  SetMonData(mon, MON_DATA_MAIL, 0xFF /* MAIL_NONE */);
  CalculateMonStats(mon);
}
// Sonde dev (vérif équivalence vs createPokemonInstance), sans effet sur le jeu.
(globalThis as Record<string, unknown>).__CreateMon = CreateMon;

// ─── Primitives mon-data (= 1:1 décomp pokemon.c) ────────────────────────────

/** 1:1 décomp `ZeroBoxMonData(boxMon)` (pokemon.c) : memset la struct BoxPokemon à 0.
 *  Modèle PLAT (struct décodée, pas de substruct chiffré) → reset via createEmptyPokemon. */
export function ZeroBoxMonData(boxMon: Pokemon): void {
  Object.assign(boxMon, createEmptyPokemon());
}

/** 1:1 décomp `ZeroMonData(mon)` (pokemon.c) : zéro la box PUIS status/level/hp/maxhp/
 *  stats/mail via SetMonData. */
export function ZeroMonData(mon: Pokemon): void {
  ZeroBoxMonData(mon);
  SetMonData(mon, MON_DATA_STATUS, 0);
  SetMonData(mon, MON_DATA_LEVEL, 0);
  SetMonData(mon, MON_DATA_HP, 0);
  SetMonData(mon, MON_DATA_MAX_HP, 0);
  SetMonData(mon, MON_DATA_ATK, 0);
  SetMonData(mon, MON_DATA_DEF, 0);
  SetMonData(mon, MON_DATA_SPEED, 0);
  SetMonData(mon, MON_DATA_SPATK, 0);
  SetMonData(mon, MON_DATA_SPDEF, 0);
  SetMonData(mon, MON_DATA_MAIL, 0xFF /* MAIL_NONE */);
}

/** 1:1 décomp `ZeroPlayerPartyMons(void)` (pokemon.c) : reset les 6 slots gPlayerParty. */
export function ZeroPlayerPartyMons(): void {
  for (let i = 0; i < PARTY_SIZE; i++) ZeroMonData(gPlayerParty[i]);
}

/** 1:1 décomp `ZeroEnemyPartyMons(void)` (pokemon.c) : reset les 6 slots gEnemyParty. */
export function ZeroEnemyPartyMons(): void {
  for (let i = 0; i < PARTY_SIZE; i++) ZeroMonData(gEnemyParty[i]);
}

/** 1:1 décomp `CopyMon(dest, src, size)` (pokemon.c) : memcpy(dest, src, size). Modèle plat →
 *  copie tous les champs + arrays moves/pp INDÉPENDANTS (le slot source peut être réutilisé). */
export function CopyMon(dest: Pokemon, src: Pokemon): void {
  Object.assign(dest, src);
  dest.moves = [...src.moves];
  dest.pp = [...src.pp];
}

/** 1:1 décomp `BoxMonToMon(src, dest)` (pokemon.c) : dest->box = *src ; reset status/hp/maxhp/
 *  mail ; CalculateMonStats. Conversion box slot → Pokémon de party. */
export function BoxMonToMon(src: Pokemon, dest: Pokemon): void {
  CopyMon(dest, src);            // 1:1 dest->box = *src (modèle plat → copie struct)
  SetMonData(dest, MON_DATA_STATUS, 0);
  SetMonData(dest, MON_DATA_HP, 0);
  SetMonData(dest, MON_DATA_MAX_HP, 0);
  SetMonData(dest, MON_DATA_MAIL, 0xFF /* MAIL_NONE */);
  CalculateMonStats(dest);
}
(globalThis as Record<string, unknown>).__ZeroMonData = ZeroMonData;
(globalThis as Record<string, unknown>).__BoxMonToMon = BoxMonToMon;

/** 1:1 décomp `BoxMonRestorePP(boxMon)` (pokemon.c) : restaure chaque move au PP MAX
 *  (CalculatePPWithBonus(move, ppBonuses, slot)). Slots vides (move 0) ignorés. */
export function BoxMonRestorePP(boxMon: Pokemon): void {
  for (let i = 0; i < 4; i++) {  // MAX_MON_MOVES = 4
    const move = GetMonData(boxMon, MON_DATA_MOVE1 + i) as number;
    if (move) {
      const bonus = GetMonData(boxMon, MON_DATA_PP_BONUSES) as number;
      const pp = CalculatePPWithBonus(move, bonus, i);
      SetMonData(boxMon, MON_DATA_PP1 + i, pp);
    }
  }
}

/** 1:1 décomp `MonRestorePP(mon)` (pokemon.c) : `BoxMonRestorePP(&mon->box)`. Modèle plat. */
export function MonRestorePP(mon: Pokemon): void {
  BoxMonRestorePP(mon);
}
(globalThis as Record<string, unknown>).__MonRestorePP = MonRestorePP;

/** 1:1 décomp `IsPokemonStorageFull(void)` (pokemon.c) : TRUE si AUCUN slot PC libre.
 *  Storage PC via le hook `__getPokemonStorage` (cycle-safe : le foyer n'importe pas save.ts ;
 *  exposé par pokemon_storage_system.ts). Si storage pas prêt → false (= il reste de la place). */
export function IsPokemonStorageFull(): boolean {
  const storage = (globalThis as { __getPokemonStorage?: () => { boxes: Array<Array<{ species: number } | null>> } }).__getPokemonStorage?.();
  if (!storage) return false;
  const TOTAL_BOXES_COUNT = 14, IN_BOX_COUNT = 30;  // 1:1 décomp constants (save-blocks)
  for (let i = 0; i < TOTAL_BOXES_COUNT; i++) {
    for (let j = 0; j < IN_BOX_COUNT; j++) {
      const slot = storage.boxes[i]?.[j];
      if (!slot || !slot.species) return false;  // SPECIES_NONE → slot libre
    }
  }
  return true;
}

/** 1:1 décomp `IsPlayerPartyAndPokemonStorageFull(void)` (pokemon.c) : TRUE si la party
 *  EST PLEINE (6 espèces) ET le storage PC plein. */
export function IsPlayerPartyAndPokemonStorageFull(): boolean {
  for (let i = 0; i < PARTY_SIZE; i++) {
    if ((GetMonData(gPlayerParty[i], MON_DATA_SPECIES) as number) === 0 /* SPECIES_NONE */) return false;
  }
  return IsPokemonStorageFull();
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
 *  Consolidé depuis party-storage.ts. gMapHeader lu via globalThis (= pattern de l'état
 *  combat ci-dessous) → le foyer pokemon.c n'importe PAS field/fieldmap (zéro cycle). */
export function AdjustFriendship(mon: Pokemon, event: number): void {
  if (mon.species === 0 || mon.species === _SPECIES_EGG_VAL) return;
  if (event < 0 || event >= _SFRIENDSHIP_EVENT_MODIFIERS.length) return;

  let friendshipLevel = 0;
  if (mon.friendship > 99) friendshipLevel++;
  if (mon.friendship > 199) friendshipLevel++;

  // 1:1 décomp pokemon.c:5935-5939 : WALKING a 50% de chance de skip.
  if (event === 5 /* FRIENDSHIP_EVENT_WALKING */) {
    if (Random() & 1) return;
  }
  // 1:1 décomp pokemon.c:5941-5950 : LEAGUE_BATTLE — gain seulement en combat DRESSEUR
  // contre Champion d'Arène / Conseil 4 / Maître. Globals battle via globalThis (cycle-safe).
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
    // met-location : mon.metLocation (MAPSEC numérique) === regionMapSectionId courant.
    // gMapHeader lu via globalThis (fieldmap l'expose) → pas d'import field/ dans le foyer.
    const _mapHeader = (globalThis as { gMapHeader?: { regionMapSectionId?: string } }).gMapHeader;
    if (mon.metLocation === resolveDecompConstant(_mapHeader?.regionMapSectionId ?? '')) friendship++;
  }
  if (friendship < 0) friendship = 0;
  if (friendship > _MAX_FRIENDSHIP) friendship = _MAX_FRIENDSHIP;
  mon.friendship = friendship;
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
    // bitfield :1 décomp (v & 1, PAS truthy) : AddHatchedMonToParty passe 0x46 (LSB 0)
    // pour dé-œuffer le mon (egg_hatch.c:360 `u8 isEgg = 0x46; // ?`).
    case MON_DATA_SANITY_IS_EGG: mon.isEgg = v & 1; return;
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
    case MON_DATA_IS_EGG: mon.isEgg = v & 1; return; // bitfield :1 (cf. SANITY_IS_EGG)
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
