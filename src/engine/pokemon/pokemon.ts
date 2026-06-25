/**
 * Représentation runtime d'un Pokémon dans la party / les combats.
 *
 * Données 1:1 décomp Émeraude (ZÉRO @pkmn/dex) : base stats / abilities /
 * growthRate / expYield via `getSpeciesInfo` (auto-extrait ROM), learnsets
 * via `getLevelUpLearnset`, PP via `getMove` (moves-data), noms FR via
 * `text-tables.json` (data-tables.ts), enums via le résolveur leaf décomp.
 *
 * Pour MVP Vague 3 : struct simple, calc HP via formule Gen 3, moves choisis
 * "manuellement" depuis le learnset jusqu'au level. Évolutions / EXP / EVs /
 * IVs randomisés = TODO Vague suivante.
 */
import {
  getSpeciesId, getSpeciesNameFr, getMoveNameFr,
} from '../../../harness/runtime/data-tables';
import { Random } from '../../random';
import { GetPlayerNameString } from '../system/string-buffers';
import { Random32 } from '../../../include/random';
import { gSaveBlock1Ptr, gSaveBlock2Ptr } from '../save/save-block-state';
import { getSpeciesInfo as gameDataGetSpeciesInfo, getMove as gameDataGetMove } from '../data/game-data';
import { IsShinyOtIdPersonality } from '../../../include/pokemon';
// Résolution move 1:1 décomp (leaf partagé, zéro @pkmn/dex).
import { moveDexIdToEnum } from '../battle/data/move-name-resolve';
// 1:1 décomp `GetItemHoldEffect` (item.c) — pour le blocage d'évolution par
// Pierre Stase (HOLD_EFFECT_PREVENT_EVOLVE). Leaf data (battle/data) déjà
// dépendance de ce module (cf. move-name-resolve) → pas de cycle.
import { GetItemHoldEffect } from '../battle/data/item-hold-effects';
import { resolveDecompConstant, reverseDecompConstant } from '../../../harness/runtime/decomp-constants';
// Migration modèle Pokémon (Phase 1) : adaptateur INVERSE `Pokemon → PokemonInstance`.
// Import TYPE-ONLY (zéro edge runtime → zéro risque de cycle ; party-storage
// type-importe déjà PokemonInstance de ce module). On lit les champs `mon.*`
// directement (pas besoin de GetMonData ici).
import type { Pokemon } from '../battle/party-storage';
// Migration modèle Pokémon (palier B) : `GiveMonToPlayer` écrit dans gPlayerParty
// (la SOURCE 1:1). Import RUNTIME de party-storage = cycle FONCTION-SEULEMENT
// (party-storage importe déjà speciesEnumToDexId/makePokemonInstanceView d'ici ;
// aucun usage croisé au top-level → bénin, cf. ledger).
import { pokemonInstanceToPokemon } from '../battle/party-storage';
// 1:1 décomp `gMapHeader->regionMapSectionId` (= struct MapHeader,
// global.fieldmap.h). Import direct au lieu de pattern globalThis non-1:1.
import { gMapHeader } from '../../fieldmap';

/** Convertit `SPECIES_TREECKO` → `treecko` (id runtime sans séparateur). */
export function speciesEnumToDexId(speciesEnum: string): string {
  return speciesEnum.replace(/^SPECIES_/, '').toLowerCase().replace(/_/g, '');
}
export function moveEnumToDexId(moveEnum: string): string {
  return moveEnum.replace(/^MOVE_/, '').toLowerCase().replace(/_/g, '');
}
export function itemEnumToDexId(itemEnum: string): string {
  return itemEnum.replace(/^ITEM_/, '').toLowerCase().replace(/_/g, '');
}

export interface StatSpread {
  hp: number; atk: number; def: number; spa: number; spd: number; spe: number;
}

export interface PokemonInstance {
  /** Enum décomp ex. "SPECIES_TREECKO" */
  speciesEnum: string;
  /** Pokédex ID (1..386 pour Gen 3) */
  speciesId: number;
  /** Nom EN dérivé de l'enum décomp ex. "Treecko" (affichage/debug). */
  speciesName: string;
  /** Nom FR ex. "ARCKO" */
  speciesNameFr: string;
  /** Nickname (par défaut = speciesNameFr) */
  nickname: string;
  level: number;
  currentHp: number;
  maxHp: number;
  /** 4 moves max — chaque move : id runtime (ex. "tackle") + nom FR + PP */
  moves: Array<{ id: string; nameFr: string; pp: number; ppMax: number }>;
  ability: string;        // EN canonique
  heldItem: string;       // EN canonique ou "" si rien
  nature: string;         // EN canonique ex. "Hardy"
  ivs: StatSpread;
  evs: StatSpread;
  status?: 'PSN' | 'PAR' | 'BRN' | 'SLP' | 'FRZ' | 'TOX' | null;
  /** Session 124 : EXP cumul (= 1:1 décomp `MON_DATA_EXP`).
   *  Total XP accumulated since lvl 1. Initialized via `getExperienceForLevel`
   *  pour ce growthRate × level au create. Optional pour back-compat saves. */
  currentExp?: number;
  /** Growth rate (= 1:1 décomp `gSpeciesInfo[species].growthRate`).
   *  GROWTH_MEDIUM_FAST / FAST / MEDIUM_SLOW / SLOW / ERRATIC / FLUCTUATING.
   *  Cached at create pour éviter lookup species à chaque check level-up. */
  growthRate?: string;
  /** Session 124 : personality value u32 (= 1:1 décomp `MON_DATA_PERSONALITY`).
   *  Generated via `Random32()` at create. Used pour shiny check + gender
   *  determination + nature + abilitySlot. */
  personality?: number;
  /** Session 124 : shiny flag (= 1:1 décomp `IsShinyOtIdPersonality`).
   *  Computed at create depuis personality + playerTrainerId. */
  isShiny?: boolean;
  /** Session 130 : gender dérivé 1:1 décomp `GetGenderFromSpeciesAndPersonality`.
   *  MON_MALE=0, MON_FEMALE=254, MON_GENDERLESS=255. */
  monGender?: 0 | 254 | 255;
  /** 1:1 décomp `MON_DATA_MET_LEVEL` / `MON_DATA_MET_LOCATION` — set par
   *  `CreateBoxMon` (pokemon.c:2258-2260) : `value = GetCurrentRegionMap
   *  SectionId(); SetBoxMonData(MON_DATA_MET_LOCATION,&value); SetBoxMonData
   *  (MON_DATA_MET_LEVEL,&level)`. metLevel = niveau au create (0 = œuf, rendu
   *  EGG_HATCH_LEVEL=5). metLocation = MAPSEC string courant. Optional pour
   *  back-compat des saves créées avant ce champ (rendu "Somewhere" 1:1). */
  metLevel?: number;
  metLocation?: string;
  /** 1:1 décomp `MON_DATA_POKEBALL` — `CreateBoxMon` (pokemon.c:2262) :
   *  `value = ITEM_POKE_BALL; SetBoxMonData(MON_DATA_POKEBALL,&value)`. TOUS
   *  les mons créés (starter/cadeau/sauvage avant override capture) =
   *  ITEM_POKE_BALL par défaut. Optional = back-compat saves (rendu BALL_POKE
   *  1:1 via ItemIdToBallId default). */
  pokeball?: string;
  /** 1:1 décomp `MON_DATA_MARKINGS` — bitfield 0..15 (rond/carré/triangle/
   *  cœur, toggles boîte PC). 0 = aucun (combo AllOff = formes vides). */
  markings?: number;
  /** 1:1 décomp `MON_DATA_IS_EGG` — œuf non éclos. createEggInstance le set.
   *  Optional = mons normaux (false). */
  isEgg?: boolean;
  /** 1:1 décomp `MON_DATA_FRIENDSHIP` — pour œuf = compteur d'éclosion
   *  (frais = élevé → "mettre du temps"). Optional (résumé non-œuf l'ignore). */
  friendship?: number;
  /** 1:1 décomp `MON_DATA_BEAUTY` — stat beauté CONCOURS (0..255), montée par les
   *  Pokéblocs. Utilisée par EVO_BEAUTY (Feebas→Milobellus : param <= beauty). Optional :
   *  défaut 0 = la VRAIE valeur tant que Pokéblocs/concours ne sont pas implémentés (Feebas
   *  n'évolue donc pas par cette voie — 1:1 correct pour un mon jamais nourri). */
  beauty?: number;
  /** 1:1 décomp `MON_DATA_OT_NAME` (pokemon.h) — nom du trainer original (=
   *  joueur pour starter / NPC giver pour cadeau / wild capture = joueur).
   *  Set par GiveMonToPlayer / CreateBoxMon (pokemon.c:2228-2253). */
  otName?: string;
  /** 1:1 décomp `MON_DATA_OT_GENDER` — gender du trainer original (0=M, 1=F). */
  otGender?: number;
  /** 1:1 décomp `MON_DATA_OT_ID` — TrainerID 32-bit du joueur original
   *  (= playerTrainerId). Used pour shiny check + traded mon detection. */
  otId?: number;
}

/** 1:1 décomp `MON_MALE` / `MON_FEMALE` / `MON_GENDERLESS` (include/pokemon.h). */
export const MON_MALE = 0;
export const MON_FEMALE = 254;
export const MON_GENDERLESS = 255;

/** 1:1 décomp `PERCENT_FEMALE(x)` macro : (u8)((x * 255) / 100). */
function PERCENT_FEMALE_VALUE(x: number): number {
  return Math.floor((x * 255) / 100) & 0xFF;
}

/** Parse le string `genderRatio` du species-info.json (= "PERCENT_FEMALE(12.5)",
 *  "MON_MALE", "MON_FEMALE", "MON_GENDERLESS", ou un u8 raw e.g. "31"). */
function parseGenderRatio(raw: string | number | undefined): number {
  if (raw === undefined || raw === null) return MON_GENDERLESS;
  if (typeof raw === 'number') return raw & 0xFF;
  const trimmed = raw.trim();
  if (trimmed === 'MON_MALE')       return MON_MALE;
  if (trimmed === 'MON_FEMALE')     return MON_FEMALE;
  if (trimmed === 'MON_GENDERLESS') return MON_GENDERLESS;
  const pf = trimmed.match(/^PERCENT_FEMALE\(([^)]+)\)$/);
  if (pf) return PERCENT_FEMALE_VALUE(parseFloat(pf[1]));
  const n = parseInt(trimmed, 10);
  return Number.isFinite(n) ? (n & 0xFF) : MON_GENDERLESS;
}

/** 1:1 décomp `GetGenderFromSpeciesAndPersonality` (pokemon.c:6080).
 *  Returns MON_MALE / MON_FEMALE / MON_GENDERLESS. */
export function GetGenderFromSpeciesAndPersonality(speciesEnum: string, personality: number): number {
  // Import statique de game-data — pas de circular dep (game-data n'importe
  // pas pokemon.ts). Le globalThis.__game_data n'est set qu'au battle start
  // donc trop tard pour gender derivation au createPokemonInstance.
  let ratio: number = MON_GENDERLESS;
  try {
    const info = gameDataGetSpeciesInfo(speciesEnum);
    ratio = parseGenderRatio(info?.genderRatio);
  } catch { /* fallback genderless */ }
  if (ratio === MON_MALE)       return MON_MALE;
  if (ratio === MON_FEMALE)     return MON_FEMALE;
  if (ratio === MON_GENDERLESS) return MON_GENDERLESS;
  if (ratio > (personality & 0xFF)) return MON_FEMALE;
  return MON_MALE;
}

/** Helper UI : retourne 'M' | 'F' | null pour symbol display. */
export function getMonGenderSymbol(mon: { monGender?: number; personality?: number; speciesEnum?: string }): 'M' | 'F' | null {
  const g = mon.monGender ?? (mon.personality !== undefined && mon.speciesEnum
    ? GetGenderFromSpeciesAndPersonality(mon.speciesEnum, mon.personality)
    : MON_GENDERLESS);
  if (g === MON_MALE) return 'M';
  if (g === MON_FEMALE) return 'F';
  return null;
}

/**
 * 1:1 décomp `GET_SHINY_VALUE(otId, personality)` (pokemon.h:371) :
 *   shinyValue = HIHALF(otId) ^ LOHALF(otId) ^ HIHALF(personality) ^ LOHALF(personality)
 * Pokemon est shiny si shinyValue < SHINY_ODDS (= 8).
 * Probability = 8/65536 = 1/8192 (= classic Gen 3 odds).
 */
function isShinyFromOtIdPersonality(otId: number, personality: number): boolean {
  // Calcul shiny consolidé sur le miroir `IsShinyOtIdPersonality` (pokemon.c:6708).
  return IsShinyOtIdPersonality(otId, personality);
}

const ZERO_STATS: StatSpread = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

/** 1:1 décomp `CreateBoxMon` (pokemon.c) : IVs computed from 2 Random() calls.
 *  Chaque Random() = u16 → 3 slices de 5-bit = 3 IVs. Total 2 Random()s = 6 IVs.
 *
 *  Décomp pseudocode :
 *    value = Random();
 *    iv = value & 0x1F;            (HP_IV)
 *    iv = (value >> 5) & 0x1F;     (ATK_IV)
 *    iv = (value >> 10) & 0x1F;    (DEF_IV)
 *    value = Random();
 *    iv = value & 0x1F;            (SPEED_IV)
 *    iv = (value >> 5) & 0x1F;     (SPATK_IV)
 *    iv = (value >> 10) & 0x1F;    (SPDEF_IV)
 *
 *  Notre struct StatSpread = hp/atk/def/spa/spd/spe (= notation Smogon).
 *  Mapping decomp -> notre struct :
 *    decomp HP    -> our hp
 *    decomp ATK   -> our atk
 *    decomp DEF   -> our def
 *    decomp SPEED -> our spe   (4eme decomp, 6eme notre struct)
 *    decomp SPATK -> our spa   (5eme decomp, 4eme notre struct)
 *    decomp SPDEF -> our spd   (6eme decomp, 5eme notre struct) */
function randomIVs(): StatSpread {
  const v1 = Random();
  const hp  =  v1        & 0x1F;
  const atk = (v1 >>  5) & 0x1F;
  const def = (v1 >> 10) & 0x1F;
  const v2 = Random();
  const spe =  v2        & 0x1F;  // decomp SPEED
  const spa = (v2 >>  5) & 0x1F;  // decomp SPATK
  const spd = (v2 >> 10) & 0x1F;  // decomp SPDEF
  return { hp, atk, def, spa, spd, spe };
}

/** Formule HP Gen 3 : ((2*base + iv + ev/4) * level / 100) + level + 10 */
function calcHp(base: number, iv: number, ev: number, level: number): number {
  return Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100) + level + 10;
}

/**
 * Sélectionne les 4 derniers moves de level-up pour ce species jusqu'au level.
 * Source 1:1 décomp : `getLevelUpLearnset(SPECIES_X)` (auto-extrait ROM
 * gLevelUpLearnsets) → entrées `{ level, move: 'MOVE_X' }`.
 */
function pickLevelUpMoves(speciesDexId: string, level: number): string[] {
  // 1:1 décomp `gLevelUpLearnsets[species]` — try via auto-extracted game-data
  // first (= 1:1 ROM auto-extrait). Pas de fallback Showdown (1:1 strict).
  try {
    // Convert dexId (lowercase) to SPECIES_X enum.
    const enumKey = 'SPECIES_' + speciesDexId.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_');
    // Use getLevelUpLearnset getter (= 1:1 décomp).
    const dataMod = (globalThis as { __game_data?: {
      getLevelUpLearnset?: (k: string) => Array<{ level: number; move: string }> | undefined;
    } }).__game_data;
    const learnset = dataMod?.getLevelUpLearnset?.(enumKey);
    if (learnset && learnset.length > 0) {
      // 1:1 décomp : on prend les moves learn à level ≤ current level. Si > 4, on
      // garde les 4 derniers (= overwrite oldest, comme le décomp).
      const acquired: Array<{ id: string; lvl: number }> = [];
      for (const entry of learnset) {
        if (entry.level <= level && entry.level > 0) {
          // Convert MOVE_X → "x" kebab-case (= dexId).
          const moveDex = entry.move.replace(/^MOVE_/, '').toLowerCase().replace(/_/g, '');
          acquired.push({ id: moveDex, lvl: entry.level });
        }
      }
      // Garder les 4 derniers (= 1:1 décomp behavior).
      const last4 = acquired.slice(-4);
      if (last4.length > 0) return last4.map(x => x.id);
    }
  } catch { /* fallthrough */ }
  // 1:1 décomp strict : pas de fallback Showdown. Si pas de learnset décomp
  // (= species data pas chargée), fallback universel minimal.
  return ['tackle', 'growl'];
}

/** 1:1 décomp : moves appris à EXACTEMENT `level` (gLevelUpLearnsets[species] filtré).
 *  Renvoie les enums MOVE_X. Utilisé par le flow d'apprentissage au level-up. */
export function getLevelUpMovesAtLevel(speciesEnum: string, level: number): string[] {
  const dataMod = (globalThis as { __game_data?: {
    getLevelUpLearnset?: (k: string) => Array<{ level: number; move: string }> | undefined;
  } }).__game_data;
  const learnset = dataMod?.getLevelUpLearnset?.(speciesEnum);
  if (!learnset) return [];
  return learnset.filter(e => e.level === level && e.level > 0).map(e => e.move);
}

/** Construit un slot de move (id dexId + nom FR + PP) depuis un enum MOVE_X. */
export function makeMoveSlot(moveEnum: string): { id: string; nameFr: string; pp: number; ppMax: number } {
  const id = moveEnumToDexId(moveEnum);
  const pp = (gameDataGetMove(moveEnum)?.pp ?? 0) || 30;
  return { id, nameFr: getMoveNameFr(moveEnum) || id, pp, ppMax: pp };
}

/** 1:1 décomp `GetEvolutionTargetSpecies(mon, EVO_MODE_NORMAL)` (cas level-up,
 *  pokemon.c:5512-5566). Renvoie l'espèce cible (enum SPECIES_X) si le mon remplit
 *  une méthode d'évolution AU LEVEL-UP, sinon null. Le décomp itère TOUTES les entrées
 *  de gEvolutionTable[species] et garde la DERNIÈRE qui matche → on reproduit ça.
 *
 *  Méthodes gérées (1:1) :
 *    - EVO_LEVEL (level >= param)
 *    - EVO_FRIENDSHIP (friendship >= 220) — Crobat/Blissey/Pikachu/Clefable/Mélo/Granivol…
 *    - EVO_FRIENDSHIP_DAY/NIGHT (Eevee→Mentali/Noctali) : friendship>=220 + plage RTC
 *      (jour [12,24) / nuit [0,12), pokemon.c:5524/5529). RTC lu via `globalThis.__rtc`
 *      (cycle-break ESM : import statique rtc.ts deadlocke le boot — exposé par rtc.ts).
 *    - EVO_LEVEL_SILCOON / _CASCOON (Wurmple : (upperPersonality % 10) <=4 / >4)
 *    - EVO_LEVEL_NINJASK (Nincada → Ninjask, level >= param)
 *    - EVO_LEVEL_ATK_GT/EQ/LT_DEF (Tyrogue→Kicklee/Tygnon/Kapoera : level>=param ET
 *      atk >/==/< def). atk/def = stats calculées 1:1 par CalculateMonStats (via la
 *      conversion `pokemonInstanceToPokemon`, dérivée à la demande = zéro dup de formule).
 *    - EVO_BEAUTY (Feebas→Milobellus : param <= beauté). Beauté lue sur `mon.beauty`
 *      (défaut 0 = jamais nourri aux Pokéblocs → pas d'évo par cette voie, 1:1 correct).
 *  Pierre Stase (HOLD_EFFECT_PREVENT_EVOLVE) bloque tout (1:1 pokemon.c:5503-5510). */
export function getEvolutionTargetForLevelUp(mon: PokemonInstance): string | null {
  const heldItem = mon.heldItem;
  // 1:1 décomp pokemon.c:5503-5510 : Pierre Stase (HOLD_EFFECT_PREVENT_EVOLVE) bloque.
  if (heldItem) {
    const itemKey = 'ITEM_' + heldItem.replace(/([A-Z])/g, '_$1').toUpperCase().replace(/^_/, '');
    const itemId = resolveDecompConstant(itemKey);
    const preventEvolve = resolveDecompConstant('HOLD_EFFECT_PREVENT_EVOLVE');
    if (typeof itemId === 'number' && itemId > 0 && typeof preventEvolve === 'number'
        && GetItemHoldEffect(itemId) === preventEvolve) {
      return null;
    }
  }
  const dataMod = (globalThis as { __game_data?: {
    getEvolutions?: (k: string) => Array<{ method: string; param: number; target: string }> | undefined;
  } }).__game_data;
  const evos = dataMod?.getEvolutions?.(mon.speciesEnum) ?? [];
  const level = mon.level;
  const friendship = mon.friendship ?? 0;
  const FRIENDSHIP_EVO_THRESHOLD = 220;                          // 1:1 décomp pokemon.c:58
  const upperPersonality = ((mon.personality ?? 0) >>> 16) & 0xFFFF;  // 1:1 HIHALF(personality)
  const beauty = mon.beauty ?? 0;                                // 1:1 GetMonData(MON_DATA_BEAUTY)
  // 1:1 GetMonData(MON_DATA_ATK/DEF) = la stat calculée par CalculateMonStats. On la dérive
  // à la demande via la conversion en struct Pokemon (qui appelle CalculateMonStats 1:1) —
  // calcul LAZY (uniquement si une méthode ATK/DEF est rencontrée) + caché (une seule conversion).
  let _atkDef: { atk: number; def: number } | null = null;
  const atkDef = (): { atk: number; def: number } => {
    if (_atkDef === null) {
      const p = pokemonInstanceToPokemon(mon);
      _atkDef = { atk: p.attack, def: p.defense };
    }
    return _atkDef;
  };
  // 1:1 décomp : itère toutes les entrées, garde la dernière qui matche.
  let target: string | null = null;
  for (const e of evos) {
    switch (e.method) {
      case 'EVO_LEVEL':
        if (level >= e.param) target = e.target;
        break;
      case 'EVO_FRIENDSHIP':
        if (friendship >= FRIENDSHIP_EVO_THRESHOLD) target = e.target;
        break;
      case 'EVO_FRIENDSHIP_DAY': {
        // 1:1 décomp pokemon.c:5524-5527 : RtcCalcLocalTime() ;
        //   gLocalTime.hours >= DAY_EVO_HOUR_BEGIN(12) && < DAY_EVO_HOUR_END(24) && friendship>=220.
        // RTC via globalThis.__rtc (cycle-break ESM : import statique rtc.ts deadlocke le boot).
        const rtc = (globalThis as { __rtc?: { RtcCalcLocalTime: () => void; gLocalTime: { hours: number } } }).__rtc;
        if (rtc) {
          rtc.RtcCalcLocalTime();
          const h = rtc.gLocalTime.hours;
          if (h >= 12 && h < 24 && friendship >= FRIENDSHIP_EVO_THRESHOLD) target = e.target;
        }
        break;
      }
      case 'EVO_FRIENDSHIP_NIGHT': {
        // 1:1 décomp pokemon.c:5529-5532 : RtcCalcLocalTime() ;
        //   gLocalTime.hours >= NIGHT_EVO_HOUR_BEGIN(0) && < NIGHT_EVO_HOUR_END(12) && friendship>=220.
        const rtc = (globalThis as { __rtc?: { RtcCalcLocalTime: () => void; gLocalTime: { hours: number } } }).__rtc;
        if (rtc) {
          rtc.RtcCalcLocalTime();
          const h = rtc.gLocalTime.hours;
          if (h >= 0 && h < 12 && friendship >= FRIENDSHIP_EVO_THRESHOLD) target = e.target;
        }
        break;
      }
      case 'EVO_LEVEL_SILCOON':
        if (level >= e.param && (upperPersonality % 10) <= 4) target = e.target;
        break;
      case 'EVO_LEVEL_CASCOON':
        if (level >= e.param && (upperPersonality % 10) > 4) target = e.target;
        break;
      case 'EVO_LEVEL_NINJASK':
        if (level >= e.param) target = e.target;
        break;
      case 'EVO_LEVEL_ATK_GT_DEF': {
        // 1:1 décomp pokemon.c:5540-5543 : param<=level ET ATK > DEF (Tyrogue→Kicklee).
        const ad = atkDef();
        if (e.param <= level && ad.atk > ad.def) target = e.target;
        break;
      }
      case 'EVO_LEVEL_ATK_EQ_DEF': {
        // 1:1 décomp pokemon.c:5545-5548 : param<=level ET ATK == DEF (Tyrogue→Kapoera).
        const ad = atkDef();
        if (e.param <= level && ad.atk === ad.def) target = e.target;
        break;
      }
      case 'EVO_LEVEL_ATK_LT_DEF': {
        // 1:1 décomp pokemon.c:5550-5553 : param<=level ET ATK < DEF (Tyrogue→Tygnon).
        const ad = atkDef();
        if (e.param <= level && ad.atk < ad.def) target = e.target;
        break;
      }
      case 'EVO_BEAUTY':
        // 1:1 décomp pokemon.c:5567-5570 : param <= beauté (Feebas→Milobellus).
        if (e.param <= beauty) target = e.target;
        break;
    }
  }
  return target;
}

// Hook dev/test : la logique d'évolution au level-up n'est PAS encore câblée au flux de jeu
// (aucun appelant de getEvolutionTargetForLevelUp/evolveInstance — câblage = chantier à part qui
// touche le flux combat + la scène d'évolution). Exposé pour vérification déterministe de la table
// de méthodes (test : monter un mon dans les conditions → l'espèce cible attendue).
(globalThis as Record<string, unknown>).__getEvolutionTargetForLevelUp = getEvolutionTargetForLevelUp;

/** 1:1 décomp évolution : change l'espèce d'une instance (garde PID/IVs/EVs/exp/moves/
 *  niveau), recalcule maxHP (currentHp += diff, comme Gen3) + nom + ability + growthRate. */
export function evolveInstance(inst: PokemonInstance, newSpeciesEnum: string): void {
  const oldMaxHp = inst.maxHp;
  const oldNameFr = inst.speciesNameFr;
  const sInfo = gameDataGetSpeciesInfo(newSpeciesEnum);
  const dexId = speciesEnumToDexId(newSpeciesEnum) || inst.speciesName.toLowerCase();
  inst.speciesEnum = newSpeciesEnum;
  inst.speciesId = getSpeciesId(newSpeciesEnum) || inst.speciesId;
  inst.speciesName = dexId.charAt(0).toUpperCase() + dexId.slice(1);
  inst.speciesNameFr = getSpeciesNameFr(newSpeciesEnum) || inst.speciesNameFr;
  // Recalcul maxHP (base de la nouvelle espèce) ; currentHp augmente de la diff (1:1 Gen3).
  const baseHp = sInfo?.stats?.hp ?? 50;
  inst.maxHp = calcHp(baseHp, inst.ivs.hp, inst.evs.hp, inst.level);
  inst.currentHp = Math.min(inst.maxHp, inst.currentHp + (inst.maxHp - oldMaxHp));
  // Ability au même slot (personality&1 si 2 abilities) pour la nouvelle espèce.
  const has2nd = !!(sInfo?.abilities?.[1] && sInfo.abilities[1] !== 'ABILITY_NONE');
  const slot = has2nd ? ((inst.personality ?? 0) & 1) : 0;
  inst.ability = sInfo?.abilities?.[slot] || inst.ability;
  if (sInfo?.growthRate) inst.growthRate = sInfo.growthRate;
  // Surnom : si pas de surnom custom (= ancien nom d'espèce), suivre la nouvelle espèce.
  if (inst.nickname === oldNameFr) inst.nickname = inst.speciesNameFr;
}

/** 1:1 décomp ordre enum NATURE_HARDY=0 … NATURE_QUIRKY=24 (constants/pokemon.h).
 *  `GetNatureFromPersonality(pid) = pid % NUM_NATURES`. Noms EN title-case (= format
 *  du champ `nature` de l'instance, cohérent avec les fixtures 'Modest' etc.). */
const NATURE_NAMES: readonly string[] = [
  'Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty', 'Bold', 'Docile', 'Relaxed',
  'Impish', 'Lax', 'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive', 'Modest',
  'Mild', 'Quiet', 'Bashful', 'Rash', 'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky',
];
/** 1:1 décomp `GetNatureFromPersonality` (pokemon.c) : nature dérivée du PID. */
export function getNatureFromPersonality(personality: number): string {
  return NATURE_NAMES[(personality >>> 0) % 25];
}

/** Crée une instance Pokémon prête à être ajoutée à la party. */
export function createPokemonInstance(speciesEnum: string, level: number, opts?: {
  moves?: string[]; nickname?: string; nature?: string; ivs?: StatSpread; evs?: StatSpread;
  ability?: string; heldItem?: string; pokeball?: string; personality?: number;
}): PokemonInstance {
  const speciesId = getSpeciesId(speciesEnum) || 1; // fallback bulbasaur
  const dexId = speciesEnumToDexId(speciesEnum) || 'bulbasaur';
  // 1:1 décomp : données species depuis l'auto-extrait ROM (getSpeciesInfo),
  // PAS @pkmn/dex. stats/abilities/growthRate/expYield = 1:1 Émeraude.
  const sInfo = gameDataGetSpeciesInfo(speciesEnum);
  const speciesName = dexId.charAt(0).toUpperCase() + dexId.slice(1);
  const speciesNameFr = getSpeciesNameFr(speciesEnum);
  // Session 124 : 1:1 décomp `CreateBoxMon` ordering — personality FIRST,
  // PUIS IVs (= mêmes Random() calls dans le même order qu'en ROM, donc
  // RNG-perfect compat).
  // Décomp pokemon.c:2207 :
  //   personality = Random32();   ← 2× Random() calls
  //   value = playerTrainerId;    (= no RNG)
  //   ... ivs = randomIVs();      ← 2× Random() calls
  // 1:1 : PID = Random32() (généré par le jeu). opts.personality permet un PID IMPOSÉ
  // (cadeaux/events scriptés à PID fixe) sans casser l'ordre RNG du chemin standard.
  const personality = (opts?.personality !== undefined) ? (opts.personality >>> 0) : Random32();
  const otId = (gSaveBlock2Ptr.playerTrainerId ?? 0) >>> 0;
  const isShiny = isShinyFromOtIdPersonality(otId, personality);
  // 1:1 décomp `GetGenderFromSpeciesAndPersonality` (pokemon.c:6080) :
  // gender dérivé de species genderRatio + (personality & 0xFF).
  const monGender = GetGenderFromSpeciesAndPersonality(speciesEnum, personality) as 0 | 254 | 255;
  const ivs = opts?.ivs ?? randomIVs();
  const evs = opts?.evs ?? ZERO_STATS;
  const baseHp = sInfo?.stats?.hp ?? 50;
  const maxHp = calcHp(baseHp, ivs.hp, evs.hp, level);
  const moveIds = opts?.moves ?? pickLevelUpMoves(dexId, level);
  const moves = moveIds.slice(0, 4).map(id => {
    // opts.moves = enums décomp ("MOVE_DIG", ex. moveset custom dresseur) → makeMoveSlot
    // (moveEnumToDexId → id runtime "dig" + PP 1:1). pickLevelUpMoves = ids runtime
    // ("quickattack") → moveDexIdToEnum pour le PP/nom. SANS ce split, un moveset enum
    // restait stocké brut ("MOVE_DIG") + PP 30 fallback → le battle ne reconnaît pas
    // les capacités → l'adversaire dresseur ne peut pas attaquer (bug 2026-06-01).
    if (typeof id === 'string' && id.startsWith('MOVE_')) {
      return makeMoveSlot(id);
    }
    // 1:1 décomp : id runtime ("quickattack") → enum ("MOVE_QUICK_ATTACK")
    // via le résolveur leaf décomp (zéro @pkmn/dex). PP depuis moves-data
    // (= include/constants/moves.h gBattleMoves[].pp), nom FR via text-tables.
    const enumKey = moveDexIdToEnum(id);
    const pp = (gameDataGetMove(enumKey)?.pp ?? 0) || 30;
    return {
      id,
      nameFr: getMoveNameFr(enumKey) || id,
      pp,
      ppMax: pp,
    };
  });
  // 1:1 décomp `CreateBoxMon` (pokemon.c:2297) : slot d'ability = personality & 1
  // SEULEMENT si l'espèce a une 2e ability réelle (abilities[1] != NONE) ; sinon slot 0.
  const _has2ndAbility = !!(sInfo?.abilities?.[1] && sInfo.abilities[1] !== 'ABILITY_NONE');
  const _abilitySlot = _has2ndAbility ? (personality & 1) : 0;
  const ability = opts?.ability ?? (sInfo?.abilities?.[_abilitySlot] || '');
  // Session 124 : EXP/growth init via species data + experienceTables.
  const speciesInfo = (() => {
    try {
      const dataMod = (globalThis as { __game_data?: { getSpeciesInfo: (k: string) => { growthRate?: string } | undefined } }).__game_data;
      return dataMod?.getSpeciesInfo(speciesEnum);
    } catch { return undefined; }
  })();
  const growthRate = speciesInfo?.growthRate ?? 'GROWTH_MEDIUM_FAST';
  const currentExp = (() => {
    try {
      const dataMod = (globalThis as { __game_data?: { getExperienceForLevel: (rate: string, lvl: number) => number } }).__game_data;
      return dataMod?.getExperienceForLevel(growthRate, level) ?? 0;
    } catch { return 0; }
  })();
  return {
    speciesEnum, speciesId, speciesName, speciesNameFr,
    nickname: opts?.nickname ?? speciesNameFr,
    level, currentHp: maxHp, maxHp,
    moves, ability,
    heldItem: opts?.heldItem ?? '',
    nature: opts?.nature ?? getNatureFromPersonality(personality),   // 1:1 : nature dérivée du PID
    ivs, evs,
    status: null,
    currentExp,
    growthRate,
    // 1:1 décomp CreateBoxMon : SetBoxMonData(MON_DATA_FRIENDSHIP, &gSpeciesInfo[species].friendship).
    // species-info.json porte désormais la valeur EXACTE (extract-pokemon-data.mjs résout
    // STANDARD_FRIENDSHIP→70) : 326× 70, 43× 35 (bébés/RALTS), 5× 140, 3× 100, 2× 90, et
    // 7× 0 pour les légendaires de boîte RÉELLEMENT capturables (Mewtwo, Lugia, Ho-Oh,
    // Kyogre, Groudon, Rayquaza, Deoxys). `?? 70` passe le 0 tel quel (Frustration max à la
    // capture = 1:1) et ne défaute qu'à 70 si l'espèce n'est pas modélisée. (Un `|| 70`
    // corromprait ces 7 légendaires en 0→70.)
    friendship: (sInfo as { friendship?: number } | undefined)?.friendship ?? 70,
    personality,
    isShiny,
    monGender,
    // 1:1 décomp `CreateBoxMon` (pokemon.c:2258-2260) :
    //   value = GetCurrentRegionMapSectionId();
    //   SetBoxMonData(boxMon, MON_DATA_MET_LOCATION, &value);
    //   SetBoxMonData(boxMon, MON_DATA_MET_LEVEL, &level);
    // GetCurrentRegionMapSectionId() = gMapHeader.regionMapSectionId (string
    // MAPSEC_*). metLevel = `level` passé au create.
    metLevel: level,
    metLocation: gMapHeader?.regionMapSectionId,
    // 1:1 décomp CreateBoxMon (pokemon.c:2262) : value = ITEM_POKE_BALL.
    pokeball: opts?.pokeball ?? 'ITEM_POKE_BALL',
    // 1:1 décomp CreateBoxMon (pokemon.c:2246/2254/2264) : OT id/name/gender posés
    // À LA SOURCE (l'ancien chemin les patchait dans GiveMonToPlayer → manque 1:1).
    otId,
    otName: GetPlayerNameString(),
    otGender: gSaveBlock2Ptr.playerGender,
    isEgg: false,
  };
}

/**
 * Migration modèle Pokémon — PHASE 1 : adaptateur INVERSE `Pokemon → PokemonInstance`.
 *
 * Construit une VUE `PokemonInstance` (legacy, à champs string) au-dessus d'un
 * `Pokemon` (struct décomp à ids). C'est l'inverse de `pokemonInstanceToPokemon`
 * (party-storage:515) : il permet de rendre `Pokemon` (BoxMon) le stockage
 * CANONIQUE tout en laissant les ~219 appelants `PokemonInstance` (OW/party/
 * summary/items) lire sans churn (= le pont du pivot Phase 2, façon event_data).
 *
 * Dérivations 1:1 réutilisées : species/move/item id→enum (`reverseDecompConstant`)
 * → nom FR (`getSpeciesNameFr`/`getMoveNameFr`) ; ability via `gSpeciesInfo`
 * [abilityNum] ; nature/gender/shiny (helpers purs déjà portés) ; status bitfield
 * STATUS1_* → enum. ⚠️ Champs « edge » approximés (à affiner Phase 2/3 sous A/B) :
 * `pokeball` (index balle→enum item ; défaut POKE_BALL), `metLocation` (MAPSEC).
 */
/** 1:1 décomp `CreateMon` (pokemon.c:2196) : crée un Pokemon NATIF (destiné à
 *  gPlayerParty/gEnemyParty). Génération 1:1 `CreateBoxMon` via createPokemonInstance
 *  (ordre RNG préservé : personality puis IVs) + conversion native pokemonInstanceToPokemon.
 *  C'est l'API de création « un seul modèle » — les callers OW passent par ici au
 *  lieu de manipuler PokemonInstance. (PokemonInstance reste l'intermédiaire de
 *  génération + le format save jusqu'à P4b.) */
export function CreateMon(
  speciesEnum: string, level: number,
  opts?: Parameters<typeof createPokemonInstance>[2],
): Pokemon {
  return pokemonInstanceToPokemon(createPokemonInstance(speciesEnum, level, opts));
}

export function pokemonToPokemonInstance(mon: Pokemon): PokemonInstance {
  const speciesEnum = reverseDecompConstant(mon.species, 'SPECIES_') ?? 'SPECIES_NONE';
  const dexId = speciesEnumToDexId(speciesEnum);
  const speciesNameFr = getSpeciesNameFr(speciesEnum);
  const sInfo = gameDataGetSpeciesInfo(speciesEnum);

  // Moves : slots non-vides → {id runtime, nom FR, pp courant, pp max}.
  const moves: PokemonInstance['moves'] = [];
  for (let i = 0; i < 4; i++) {
    const moveId = mon.moves[i];
    if (!moveId) continue;
    const moveEnum = reverseDecompConstant(moveId, 'MOVE_') ?? '';
    const runtimeId = moveEnumToDexId(moveEnum);
    const basePp = (gameDataGetMove(moveEnum)?.pp ?? 0) || mon.pp[i];
    moves.push({ id: runtimeId, nameFr: getMoveNameFr(moveEnum) || runtimeId, pp: mon.pp[i], ppMax: basePp });
  }

  // Status bitfield (STATUS1_*) → enum legacy. Une seule altération à la fois.
  const st = mon.status >>> 0;
  let status: PokemonInstance['status'] = null;
  if (st & 0x07) status = 'SLP';            // STATUS1_SLEEP (turns mask)
  else if (st & 0x80) status = 'TOX';       // STATUS1_TOXIC_POISON
  else if (st & 0x08) status = 'PSN';       // STATUS1_POISON
  else if (st & 0x10) status = 'BRN';       // STATUS1_BURN
  else if (st & 0x20) status = 'FRZ';       // STATUS1_FREEZE
  else if (st & 0x40) status = 'PAR';       // STATUS1_PARALYSIS

  const heldItemEnum = mon.heldItem ? (reverseDecompConstant(mon.heldItem, 'ITEM_') ?? '') : '';

  return {
    speciesEnum,
    speciesId: mon.species,
    speciesName: dexId ? dexId.charAt(0).toUpperCase() + dexId.slice(1) : '',
    speciesNameFr,
    nickname: mon.nickname || speciesNameFr,
    level: mon.level,
    currentHp: mon.hp,
    maxHp: mon.maxHP,
    moves,
    ability: sInfo?.abilities?.[mon.abilityNum] || sInfo?.abilities?.[0] || '',
    heldItem: heldItemEnum ? itemEnumToDexId(heldItemEnum) : '',
    nature: getNatureFromPersonality(mon.personality),
    ivs: { hp: mon.hpIV, atk: mon.attackIV, def: mon.defenseIV, spa: mon.spAttackIV, spd: mon.spDefenseIV, spe: mon.speedIV },
    evs: { hp: mon.hpEV, atk: mon.attackEV, def: mon.defenseEV, spa: mon.spAttackEV, spd: mon.spDefenseEV, spe: mon.speedEV },
    status,
    currentExp: mon.experience,
    growthRate: sInfo?.growthRate ?? 'GROWTH_MEDIUM_FAST',
    personality: mon.personality >>> 0,
    isShiny: isShinyFromOtIdPersonality(mon.otId >>> 0, mon.personality >>> 0),
    monGender: GetGenderFromSpeciesAndPersonality(speciesEnum, mon.personality) as 0 | 254 | 255,
    metLevel: mon.metLevel,
    metLocation: reverseDecompConstant(mon.metLocation, 'MAPSEC_') ?? undefined,
    pokeball: mon.pokeball ? (reverseDecompConstant(mon.pokeball, 'ITEM_') ?? 'ITEM_POKE_BALL') : 'ITEM_POKE_BALL',
    markings: mon.markings,
    isEgg: !!mon.isEgg,
    friendship: mon.friendship,
    otName: mon.otName || undefined,
    otGender: mon.otGender,
    otId: mon.otId >>> 0,
  };
}

/** Status enum legacy → bitfield STATUS1_* (pour le set-trap de la vue live). */
const _STATUS_TO_STATUS1_VIEW: Record<string, number> = {
  PSN: 0x08, BRN: 0x10, FRZ: 0x20, PAR: 0x40, TOX: 0x88, SLP: 0x03,
};

/**
 * Migration modèle Pokémon — PHASE 2 (enabler) : VUE LIVE `Pokemon → PokemonInstance`.
 *
 * Retourne un `Proxy` qui se LIT comme un `PokemonInstance` (get = dérivation via
 * `pokemonToPokemonInstance`) et dont les ÉCRITURES de champs top-level (currentHp,
 * status, level, currentExp, nickname, friendship, heldItem, evs/ivs, moves, …)
 * sont RÉPERCUTÉES sur le `Pokemon` backing. → permet de rendre `gPlayerParty`
 * (Pokemon) canonique tout en laissant les ~219 appelants `PokemonInstance` lire
 * ET muter sans churn (= le pont du pivot Phase 2, façon event_data, mais mutable).
 *
 * ⚠️ Frontières (à affiner sous A/B Phase 2/3) :
 *  - get re-dérive à chaque accès (party = 6 mons → coût négligeable ; `view.moves`
 *    n'a pas d'identité stable → ne pas s'y fier).
 *  - mutation NESTED `view.moves[i].pp = x` NE propage PAS (objet dérivé jetable) ;
 *    le décrément PP en combat = voie V (retirée Phase 4) ; en OW les moves se
 *    remplacent en bloc (`view.moves = [...]`, géré par le set-trap).
 *  - champs dérivés (speciesNameFr/nature/isShiny/monGender/ability/growthRate) =
 *    set ignoré (no-op) : ce sont des projections, pas du stockage.
 */
export function makePokemonInstanceView(mon: Pokemon): PokemonInstance {
  return new Proxy({} as PokemonInstance, {
    get(_t, prop: string | symbol): unknown {
      // Migration Pokémon (étape 4 save) : le save sérialise block1.playerParty
      // via JSON.stringify (save-sectors.ts:encodeSaveBlock). Sans `toJSON`, ce
      // Proxy (target {}) se sérialiserait en `{}` → corruption save. `toJSON`
      // retourne le snapshot PokemonInstance natif (format legacy = compatible
      // saves existantes ; LoadPlayerParty le reconvertit + repose les vues au load).
      if (prop === 'toJSON') return () => pokemonToPokemonInstance(mon);
      return (pokemonToPokemonInstance(mon) as unknown as Record<string | symbol, unknown>)[prop];
    },
    set(_t, prop: string | symbol, value: unknown): boolean {
      switch (prop) {
        case 'currentHp': mon.hp = (value as number) & 0xFFFF; return true;
        case 'maxHp': mon.maxHP = (value as number) & 0xFFFF; return true;
        case 'level': mon.level = (value as number) & 0xFF; return true;
        case 'currentExp': mon.experience = (value as number) >>> 0; return true;
        case 'nickname': mon.nickname = String(value); return true;
        case 'friendship': mon.friendship = (value as number) & 0xFF; return true;
        case 'markings': mon.markings = (value as number) & 0xFF; return true;
        case 'isEgg': mon.isEgg = value ? 1 : 0; return true;
        case 'personality': mon.personality = (value as number) >>> 0; return true;
        case 'otId': mon.otId = (value as number) >>> 0; return true;
        case 'otName': mon.otName = String(value ?? ''); return true;
        case 'otGender': mon.otGender = (value as number) & 1; return true;
        case 'status': {
          mon.status = value ? (_STATUS_TO_STATUS1_VIEW[String(value)] ?? 0) >>> 0 : 0;
          return true;
        }
        case 'heldItem': {
          const it = String(value ?? '');
          mon.heldItem = it ? (resolveDecompConstant('ITEM_' + it.toUpperCase().replace(/-/g, '_')) as number | undefined ?? 0) : 0;
          return true;
        }
        case 'ivs': {
          const iv = value as StatSpread;
          mon.hpIV = iv.hp & 0x1F; mon.attackIV = iv.atk & 0x1F; mon.defenseIV = iv.def & 0x1F;
          mon.speedIV = iv.spe & 0x1F; mon.spAttackIV = iv.spa & 0x1F; mon.spDefenseIV = iv.spd & 0x1F;
          return true;
        }
        case 'evs': {
          const ev = value as StatSpread;
          mon.hpEV = ev.hp & 0xFF; mon.attackEV = ev.atk & 0xFF; mon.defenseEV = ev.def & 0xFF;
          mon.speedEV = ev.spe & 0xFF; mon.spAttackEV = ev.spa & 0xFF; mon.spDefenseEV = ev.spd & 0xFF;
          return true;
        }
        case 'moves': {
          const arr = (value as PokemonInstance['moves']) ?? [];
          for (let i = 0; i < 4; i++) {
            const m = arr[i];
            if (m) {
              const en = moveDexIdToEnum(m.id);
              mon.moves[i] = (resolveDecompConstant(en) as number | undefined ?? 0) & 0xFFFF;
              mon.pp[i] = m.pp & 0xFF;
            } else { mon.moves[i] = 0; mon.pp[i] = 0; }
          }
          return true;
        }
        // Champs dérivés / création — set ignoré (projection, pas de stockage).
        default: return true;
      }
    },
  });
}

/**
 * 1:1 décomp Gen 3 EXP gain formula (= pokemon.c:GiveMonExperience).
 *
 *   exp = (baseExp × defeatedLevel) / 7
 *
 * Plus boosts (= traded mon ×1.5, lucky egg ×1.5, etc.) — pour MVP : pas de
 * boost, formule de base.
 *
 * Returns le total exp gain.
 */
export function calculateExpGain(defeatedSpeciesEnum: string, defeatedLevel: number): number {
  try {
    const dataMod = (globalThis as { __game_data?: { getSpeciesInfo: (k: string) => { expYield?: number } | undefined } }).__game_data;
    const baseExp = dataMod?.getSpeciesInfo(defeatedSpeciesEnum)?.expYield ?? 0;
    return Math.floor((baseExp * defeatedLevel) / 7);
  } catch { return 0; }
}

/**
 * Award exp à un mon + recalc level/stats si nécessaire.
 *
 * Returns un object avec :
 *   - gained: number (= XP add)
 *   - leveledUp: boolean (= true si level changed)
 *   - newLevel: number (= level final, peut être > old)
 *   - newMaxHp: number (= maxHp recalculé si level changed)
 */
export function applyExpAward(mon: PokemonInstance, gained: number): {
  gained: number; leveledUp: boolean; newLevel: number; newMaxHp: number;
} {
  if (!mon.growthRate || mon.currentExp === undefined) {
    return { gained: 0, leveledUp: false, newLevel: mon.level, newMaxHp: mon.maxHp };
  }
  let dataMod;
  try {
    dataMod = (globalThis as { __game_data?: { getExperienceForLevel: (rate: string, lvl: number) => number; getSpeciesInfo: (k: string) => { stats?: { hp: number } } | undefined } }).__game_data;
  } catch { return { gained: 0, leveledUp: false, newLevel: mon.level, newMaxHp: mon.maxHp }; }
  if (!dataMod) return { gained: 0, leveledUp: false, newLevel: mon.level, newMaxHp: mon.maxHp };

  mon.currentExp = (mon.currentExp ?? 0) + gained;
  let leveledUp = false;
  // Loop : tant que le level peut monter (= max 100).
  while (mon.level < 100) {
    const expForNext = dataMod.getExperienceForLevel(mon.growthRate, mon.level + 1);
    if (mon.currentExp < expForNext) break;
    mon.level++;
    leveledUp = true;
  }
  if (leveledUp) {
    // Recalc maxHp via formule Gen 3 standard (= 1:1 calcHp helper).
    const baseHp = dataMod.getSpeciesInfo(mon.speciesEnum)?.stats?.hp ?? 50;
    const oldMaxHp = mon.maxHp;
    mon.maxHp = calcHp(baseHp, mon.ivs.hp, mon.evs.hp, mon.level);
    // Heal proportionally (= 1:1 décomp behavior : current_HP += (newMax - oldMax)).
    const hpDelta = mon.maxHp - oldMaxHp;
    if (hpDelta > 0) mon.currentHp += hpDelta;
  }
  return { gained, leveledUp, newLevel: mon.level, newMaxHp: mon.maxHp };
}

/** 1:1 décomp `MonGainEVs(mon, defeatedSpecies)` (pokemon.c:5975-6052) sur PokemonInstance.
 *  Award des EVs depuis l'evYield de l'espèce vaincue ; cap 510 total + 255/stat.
 *  ORDRE d'itération 1:1 STRICT : [hp, atk, def, SPEED, SPATK, spdef] (= STAT_HP..STAT_SPDEF
 *  décomp → vitesse AVANT atq.spé ; cf. party-storage.ts:586). Pokérus ×2 + Macho Brace ×2
 *  = différés (champ pokérus absent de l'instance + objet hors tutorial). */
export function monGainEVs(mon: PokemonInstance, defeatedSpeciesEnum: string): void {
  const dataMod = (globalThis as { __game_data?: {
    getSpeciesInfo: (k: string) => { evYield?: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number } } | undefined;
  } }).__game_data;
  const evYield = dataMod?.getSpeciesInfo(defeatedSpeciesEnum)?.evYield;
  if (!evYield) return;
  const MAX_TOTAL_EVS = 510, MAX_PER_STAT_EVS = 255;
  // Ordre décomp : hp, atk, def, speed, spAtk, spDef.
  const evs = [mon.evs.hp, mon.evs.atk, mon.evs.def, mon.evs.spe, mon.evs.spa, mon.evs.spd];
  const yields = [evYield.hp, evYield.atk, evYield.def, evYield.spe, evYield.spa, evYield.spd];
  let totalEVs = evs.reduce((s, v) => s + v, 0);
  for (let i = 0; i < 6; i++) {
    if (totalEVs >= MAX_TOTAL_EVS) break;
    const multiplier = 1;   // Pokérus/Macho Brace ×2 différés
    let evIncrease = yields[i] * multiplier;
    // 1:1 décomp ll.6038-6046 : cap à MAX_TOTAL_EVS puis MAX_PER_STAT_EVS.
    if (totalEVs + evIncrease > MAX_TOTAL_EVS) {
      evIncrease = (evIncrease + MAX_TOTAL_EVS) - (totalEVs + evIncrease);
    }
    if (evs[i] + evIncrease > MAX_PER_STAT_EVS) {
      evIncrease = (evIncrease + MAX_PER_STAT_EVS) - (evs[i] + evIncrease);
    }
    if (evIncrease < 0) evIncrease = 0;
    evs[i] += evIncrease;
    totalEVs += evIncrease;
  }
  mon.evs.hp = evs[0]; mon.evs.atk = evs[1]; mon.evs.def = evs[2];
  mon.evs.spe = evs[3]; mon.evs.spa = evs[4]; mon.evs.spd = evs[5];
}

// (Retiré : `pokemonToShowdownSet` — packeur set Showdown pour @pkmn/sim,
//  code mort depuis le moteur de combat bytecode 1:1. Showdown éliminé.)

// ─── 1:1 décomp pokemon.c:4412 GiveMonToPlayer ───────────────────────────────

// P4a-suite : GiveMonToPlayer(struct Pokemon *) + MON_GIVEN_TO_* vivent désormais
// dans party-storage.ts (co-localisés avec gPlayerParty/GetMonData/SetMonData =
// fragment de pokemon.c côté stockage). Re-exportés ici (+ le pont
// pokemonInstanceToPokemon) pour les call-sites OW qui importent `../pokemon/pokemon`.
export {
  GiveMonToPlayer, MON_GIVEN_TO_PARTY, MON_GIVEN_TO_PC, MON_CANT_GIVE,
  pokemonInstanceToPokemon,
} from '../battle/party-storage';
