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
import { NUM_NATURES, STAT_HP, MON_MALE, MON_FEMALE, MON_GENDERLESS, SHINY_ODDS } from '../include/constants/pokemon';
// Type-only (erasé au runtime → aucun cycle/TDZ) : le foyer pokemon.c lit struct Pokemon.
import type { Pokemon } from './engine/battle/party-storage';
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
