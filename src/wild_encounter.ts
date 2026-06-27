/**
 * game/wild_encounter.ts — MIROIR 1:1 strict de `src/wild_encounter.c` (= ~700l C).
 * (Migré depuis engine/field/wild-encounter.ts vers le tree miroir game/ — but : 2 fichiers
 *  identiques ligne-à-ligne en langage différent, src décomp ↔ game/ jeu propre.)
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/wild_encounter.c`.
 *
 * SCOPE PASS 1 (= ce port) :
 *   - `ChooseWildMonIndex_Land` (l. 182) — 12 slots cumulative encounter rates.
 *   - `ChooseWildMonIndex_WaterRock` (l. 213) — 5 slots cumulative.
 *   - `ChooseWildMonLevel` (l. 268) — min/max swap + Random range.
 *   - `GetCurrentMapWildMonHeaderId` (l. 305) — lookup byMap[currentMapId].
 *   - `EncounterOddsCheck` (l. 493) — Random % MAX_ENCOUNTER_RATE < rate.
 *   - `WildEncounterCheck` (l. 502) minimal — encounter_rate * 16 (= sans
 *     flute/cleanse/ability mods, voir dettes R3 ci-dessous).
 *   - `AllowWildCheckOnNewMetatile` (l. 533) — 40% skip sur tile change.
 *   - `AreLegendariesInSootopolisPreventingEncounters` (l. 541).
 *   - `StandardWildEncounter` (l. 552) — entry point, branch LAND/WATER.
 *   - `CreateWildMon` (l. 379) — ZeroEnemyPartyMons + CreateMonWithNature.
 *   - `TryGenerateWildMon` (l. 422) — wraps ChooseWildMonIndex + ChooseWildMonLevel + CreateWildMon.
 *   - `DisableWildEncounters` (l. 77).
 *
 * RATES PAR SLOT (= data/wild_encounters.json) :
 *   - land:  [20, 20, 10, 10, 10, 10, 5, 5, 4, 4, 1, 1] (12 slots, total 100)
 *   - water: [60, 30, 5, 4, 1]                          (5 slots,  total 100)
 *   - rock:  [60, 30, 5, 4, 1]                          (5 slots,  total 100)
 *   - fish:  [70, 30, 60, 20, 20, 40, 40, 15, 4, 1]     (10 slots, dette R3 Fishing)
 *
 *   Slot 0 = encounter le plus COMMUN, slot N = le plus RARE (= 1:1 strict).
 *
 * DETTES R3 (= cascade subsystem hors-démo) :
 *   - PickWildMonNature (l. 335) — Safari Zone Pokeblock cascade + Synchronize.
 *   - ApplyFluteEncounterRateMod (l. ???) — White/Black flute item effects.
 *   - ApplyCleanseTagEncounterRateMod — Cleanse Tag held item effect.
 *   - IsWildLevelAllowedByRepel — Repel item check.
 *   - IsAbilityAllowingEncounter (= KeenEye) — ability check.
 *   - TryGetAbilityInfluencedWildMonIndex — Magnet Pull / Static / Lightning Rod.
 *   - Cute Charm gender bias in CreateWildMon.
 *   - TryStartRoamerEncounter — Latios/Latias roamer system.
 *   - DoMassOutbreakEncounterTest + SetUpMassOutbreakEncounter — TV news outbreaks.
 *   - Battle Pike / Pyramid wild headers.
 *   - Fishing system (= ChooseWildMonIndex_Fishing + Feebas spots).
 *   - LayoutId checks LAYOUT_BATTLE_FRONTIER_BATTLE_PIKE_ROOM_WILD_MONS etc.
 */

import { Random } from './random';
import { Random32, ISO_RANDOMIZE2 } from '../include/random';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { gMapHeader, MAP_OFFSET } from './fieldmap';
// Combat SAUVAGE = VOIE L (décomp) inconditionnelle — cf. CreateWildMon. La voie V
// (battle-flow) n'est plus dans le chemin wild (destruction voie V, étape 1).
import { bootDecompBattleLoop } from './engine/battle/battle-decomp-loop';
import { setupEnemyPartyForBattle, GetMonData, GetMonAbility, gPlayerParty, gEnemyParty, SetMonMoveSlot, MON_DATA_SANITY_IS_EGG, MON_DATA_HP, MON_DATA_LEVEL, MON_DATA_IS_EGG, MON_DATA_HELD_ITEM, MON_DATA_PERSONALITY, MON_DATA_SPECIES } from './engine/battle/party-storage';
import { createPokemonInstance, GetGenderFromSpeciesAndPersonality, type PokemonInstance } from './engine/pokemon/pokemon';
import { setBattleTypeFlags, gBattleTypeFlags } from './engine/battle/state';
import { BATTLE_TYPE_TRAINER, ABILITY_HUSTLE, ABILITY_VITAL_SPIRIT, ABILITY_PRESSURE, ABILITY_MAGNET_PULL, ABILITY_STATIC, ABILITY_KEEN_EYE, ABILITY_INTIMIDATE, ABILITY_STENCH, ABILITY_ILLUMINATE, ABILITY_WHITE_SMOKE, ABILITY_ARENA_TRAP, ABILITY_SAND_VEIL, ABILITY_SYNCHRONIZE, ABILITY_CUTE_CHARM, MON_MALE, MON_FEMALE, TYPE_STEEL, TYPE_ELECTRIC, MAX_MON_MOVES } from './engine/battle/constants';
import { WEATHER_SANDSTORM } from '../include/constants/weather';
import { resolveDecompConstant, reverseDecompConstant } from '../harness/runtime/decomp-constants';
import { getSpeciesInfo } from './engine/data/game-data';
import { VarGet, VarSet, FlagGet } from './engine/script/script-vars';
import { ScriptContext_SetupScript } from './script';
import { PARTY_SIZE } from './engine/save/save-blocks';
import {
  MetatileBehavior_IsLandWildEncounter,
  MetatileBehavior_IsWaterWildEncounter,
  MetatileBehavior_IsSurfableAndNotWaterfall,
} from './metatile_behavior';
import { IncrementGameStat, PlayerGetDestCoords, TestPlayerAvatarFlags, PLAYER_AVATAR_FLAG_MACH_BIKE, PLAYER_AVATAR_FLAG_ACRO_BIKE, GetXYCoordsOneStepInFrontOfPlayer } from './field_player_avatar';
import { MapGridGetMetatileBehaviorAt } from './fieldmap';
import { GAME_STAT_FISHING_ENCOUNTERS } from '../include/constants/game_stat';

// ─── Feebas (Route 119) — 1:1 décomp wild_encounter.c:29-176 ────────────────
// Système des spots Feebas : 6 spots tirés d'un RNG seedé par dewfordTrends[0].rand
// (fixe par save), parmi les ~447 spots de pêche valides de la Route 119.
/** 1:1 `static const struct WildPokemon sWildFeebas` (wild_encounter.c:67). */
const sWildFeebas = { minLevel: 20, maxLevel: 25, species: 'SPECIES_FEEBAS' } as const;
const NUM_FEEBAS_SPOTS = 6;                                                     // c:29
const NUM_FISHING_SPOTS_1 = 131, NUM_FISHING_SPOTS_2 = 167, NUM_FISHING_SPOTS_3 = 149; // c:33-35
const NUM_FISHING_SPOTS = NUM_FISHING_SPOTS_1 + NUM_FISHING_SPOTS_2 + NUM_FISHING_SPOTS_3; // c:36
/** 1:1 `sRoute119WaterTileData[]` (wild_encounter.c:69) : {yMin, yMax, numSpotsAvant} ×3. */
const sRoute119WaterTileData: readonly number[] = [
  0, 45, 0,
  46, 91, NUM_FISHING_SPOTS_1,
  92, 139, NUM_FISHING_SPOTS_1 + NUM_FISHING_SPOTS_2,
];
/** 1:1 `EWRAM_DATA static u32 sFeebasRngValue` (wild_encounter.c:63). */
let sFeebasRngValue = 0;

/** 1:1 décomp `static u16 FeebasRandom(void)` (wild_encounter.c:170). */
function FeebasRandom(): number {
  sFeebasRngValue = ISO_RANDOMIZE2(sFeebasRngValue) >>> 0;
  return (sFeebasRngValue >>> 16) & 0xFFFF;
}

/** 1:1 décomp `static void FeebasSeedRng(u16 seed)` (wild_encounter.c:176). */
function FeebasSeedRng(seed: number): void {
  sFeebasRngValue = seed >>> 0;
}

/** 1:1 décomp `static u16 GetFeebasFishingSpotId(s16 targetX, s16 targetY, u8 section)`
 *  (wild_encounter.c:90) : numérote les spots de pêche valides (surfables non-cascade)
 *  gauche→droite, haut→bas, dans la section donnée. */
function GetFeebasFishingSpotId(targetX: number, targetY: number, section: number): number {
  const yMin = sRoute119WaterTileData[section * 3 + 0];
  const yMax = sRoute119WaterTileData[section * 3 + 1];
  let spotId = sRoute119WaterTileData[section * 3 + 2];
  const width = gMapHeader?.mapLayout?.width ?? 0;
  for (let y = yMin; y <= yMax; y++) {
    for (let x = 0; x < width; x++) {
      const behavior = MapGridGetMetatileBehaviorAt(x + MAP_OFFSET, y + MAP_OFFSET);
      if (MetatileBehavior_IsSurfableAndNotWaterfall(behavior) === true) {
        spotId++;
        if (targetX === x && targetY === y) return spotId;
      }
    }
  }
  return spotId + 1;
}

/** 1:1 décomp `static bool8 CheckFeebas(void)` (wild_encounter.c:113) : sur Route 119,
 *  50% de chance + le spot de pêche du joueur ∈ les 6 spots Feebas (RNG fixe par save).
 *  NB port : location == ROUTE119 testée via `gMapHeader.id` (convention port). */
function CheckFeebas(): boolean {
  if (gMapHeader?.id !== 'MAP_ROUTE119') return false;
  const c = GetXYCoordsOneStepInFrontOfPlayer();
  const x = c.x - MAP_OFFSET;
  const y = c.y - MAP_OFFSET;
  let route119Section = 0;
  if (y >= sRoute119WaterTileData[3 * 0 + 0] && y <= sRoute119WaterTileData[3 * 0 + 1]) route119Section = 0;
  if (y >= sRoute119WaterTileData[3 * 1 + 0] && y <= sRoute119WaterTileData[3 * 1 + 1]) route119Section = 1;
  if (y >= sRoute119WaterTileData[3 * 2 + 0] && y <= sRoute119WaterTileData[3 * 2 + 1]) route119Section = 2;
  if (Random() % 100 > 49) return false;   // 50% de chance (sur un spot Feebas)
  FeebasSeedRng(gSaveBlock1Ptr.dewfordTrends?.[0]?.rand ?? 0);
  const feebasSpots: number[] = new Array(NUM_FEEBAS_SPOTS);
  for (let i = 0; i !== NUM_FEEBAS_SPOTS;) {
    feebasSpots[i] = FeebasRandom() % NUM_FISHING_SPOTS;
    if (feebasSpots[i] === 0) feebasSpots[i] = NUM_FISHING_SPOTS;
    // >= 4 : saute les spots 1-3 inaccessibles (haut de la map) ; < 1 jamais vrai (1:1 quirk).
    if (feebasSpots[i] < 1 || feebasSpots[i] >= 4) i++;
  }
  const spotId = GetFeebasFishingSpotId(x, y, route119Section);
  for (let i = 0; i < NUM_FEEBAS_SPOTS; i++) {
    if (spotId === feebasSpots[i]) return true;
  }
  return false;
}
// CheckFeebas est câblé dans FishingWildEncounter (voie pêche Route 119).
// (Les outils devtool — TP case Feebas / Altering Cave — vivent dans
//  harness/devtools/dev-encounter-tools.ts, hors de ce fichier 1:1.)

/** 1:1 décomp `LAND_WILD_COUNT` (include/constants/wild_encounter.h:4). */
const LAND_WILD_COUNT = 12;
/** 1:1 décomp `WATER_WILD_COUNT` (include/constants/wild_encounter.h:5). */
const WATER_WILD_COUNT = 5;
/** 1:1 décomp `ROCK_WILD_COUNT` (include/constants/wild_encounter.h:6). */
const ROCK_WILD_COUNT = 5;

/** 1:1 décomp `MAX_ENCOUNTER_RATE` (wild_encounter.c:27). */
const MAX_ENCOUNTER_RATE = 2880;

/** 1:1 décomp enum `WILD_AREA_*` (wild_encounter.c:38). */
const WILD_AREA_LAND   = 0;
const WILD_AREA_WATER  = 1;
const WILD_AREA_ROCKS  = 2;
// const WILD_AREA_FISHING = 3;  // Dette R3 : Fishing system

/** 1:1 décomp `WILD_CHECK_*` (wild_encounter.c:45). */
const WILD_CHECK_REPEL    = 1 << 0;
const WILD_CHECK_KEEN_EYE = 1 << 1;  // (honoré par IsAbilityAllowingEncounter — Keen Eye, dette R3 séparée)

/** 1:1 décomp constants ENCOUNTER_CHANCE_LAND_MONS_SLOT_X (= cumulative).
 *  Dérivé du template `src/data/wild_encounters.json.txt` :
 *    `#define ENCOUNTER_CHANCE_LAND_MONS_SLOT_0 20`
 *    `#define ENCOUNTER_CHANCE_LAND_MONS_SLOT_1 SLOT_0 + 20 = 40`
 *    ... etc.
 *  Rates per slot [20,20,10,10,10,10,5,5,4,4,1,1] → cumulative thresholds. */
const ENCOUNTER_CHANCE_LAND_MONS_SLOT_0  = 20;
const ENCOUNTER_CHANCE_LAND_MONS_SLOT_1  = ENCOUNTER_CHANCE_LAND_MONS_SLOT_0 + 20;   // 40
const ENCOUNTER_CHANCE_LAND_MONS_SLOT_2  = ENCOUNTER_CHANCE_LAND_MONS_SLOT_1 + 10;   // 50
const ENCOUNTER_CHANCE_LAND_MONS_SLOT_3  = ENCOUNTER_CHANCE_LAND_MONS_SLOT_2 + 10;   // 60
const ENCOUNTER_CHANCE_LAND_MONS_SLOT_4  = ENCOUNTER_CHANCE_LAND_MONS_SLOT_3 + 10;   // 70
const ENCOUNTER_CHANCE_LAND_MONS_SLOT_5  = ENCOUNTER_CHANCE_LAND_MONS_SLOT_4 + 10;   // 80
const ENCOUNTER_CHANCE_LAND_MONS_SLOT_6  = ENCOUNTER_CHANCE_LAND_MONS_SLOT_5 + 5;    // 85
const ENCOUNTER_CHANCE_LAND_MONS_SLOT_7  = ENCOUNTER_CHANCE_LAND_MONS_SLOT_6 + 5;    // 90
const ENCOUNTER_CHANCE_LAND_MONS_SLOT_8  = ENCOUNTER_CHANCE_LAND_MONS_SLOT_7 + 4;    // 94
const ENCOUNTER_CHANCE_LAND_MONS_SLOT_9  = ENCOUNTER_CHANCE_LAND_MONS_SLOT_8 + 4;    // 98
const ENCOUNTER_CHANCE_LAND_MONS_SLOT_10 = ENCOUNTER_CHANCE_LAND_MONS_SLOT_9 + 1;    // 99
const ENCOUNTER_CHANCE_LAND_MONS_TOTAL   = ENCOUNTER_CHANCE_LAND_MONS_SLOT_10 + 1;   // 100

/** Rates water/rock [60, 30, 5, 4, 1] cumulative. */
const ENCOUNTER_CHANCE_WATER_MONS_SLOT_0  = 60;
const ENCOUNTER_CHANCE_WATER_MONS_SLOT_1  = ENCOUNTER_CHANCE_WATER_MONS_SLOT_0 + 30;  // 90
const ENCOUNTER_CHANCE_WATER_MONS_SLOT_2  = ENCOUNTER_CHANCE_WATER_MONS_SLOT_1 + 5;   // 95
const ENCOUNTER_CHANCE_WATER_MONS_SLOT_3  = ENCOUNTER_CHANCE_WATER_MONS_SLOT_2 + 4;   // 99
const ENCOUNTER_CHANCE_WATER_MONS_TOTAL   = ENCOUNTER_CHANCE_WATER_MONS_SLOT_3 + 1;   // 100

// ─── Data types (= 1:1 décomp `struct WildPokemon` / `WildPokemonInfo`) ────

/** 1:1 décomp `struct WildPokemon` (include/wild_encounter.h). */
interface WildPokemon {
  minLevel: number;
  maxLevel: number;
  species: string;  // 1:1 décomp: u16 species ID. Notre TS utilise string ID.
}

/** 1:1 décomp `struct WildPokemonInfo` (include/wild_encounter.h). */
interface WildPokemonInfo {
  encounterRate: number;
  wildPokemon: WildPokemon[];
}

/** 1:1 décomp `struct WildPokemonHeader` (include/wild_encounter.h).
 *  Notre web port : keyed by `mapId` (string) au lieu de mapGroup+mapNum. */
interface WildPokemonHeader {
  mapId: string;
  landMonsInfo: WildPokemonInfo | null;
  waterMonsInfo: WildPokemonInfo | null;
  rockSmashMonsInfo: WildPokemonInfo | null;
  fishingMonsInfo: WildPokemonInfo | null;
}

// ─── gWildMonHeaders data (= chargé au boot depuis wild-encounters.json) ───

let _gWildMonHeaders: Map<string, WildPokemonHeader> | null = null;

/** 1:1 décomp `NUM_ALTERING_CAVE_TABLES` (include/constants/wild_encounter.h:9). */
const NUM_ALTERING_CAVE_TABLES = 9;

/** 1:1 décomp `MAP_ALTERING_CAVE` (include/constants/map_groups.h) — clé byMap. */
const MAP_ALTERING_CAVE_ID = 'MAP_ALTERING_CAVE';

/** 1:1 décomp : les 9 WildPokemonHeader consécutifs de l'Altering Cave (gAlteringCave1..9
 *  dans gWildMonHeaders[]), sélectionnés par `VAR_ALTERING_CAVE_WILD_SET` dans
 *  `GetCurrentMapWildMonHeaderId` (`i += alteringCaveId`). Chargés depuis wild-encounters.json.
 *  Table 0 = Nosferapti (défaut), 1 = Wattouat, … 8 = Queulorior. */
let _sAlteringCaveWildMonHeaders: WildPokemonHeader[] = [];

type RawWildMonInfo = { encounter_rate: number; mons: Array<{ min_level: number; max_level: number; species: string }> };
type RawWildEntry = { land?: RawWildMonInfo; water?: RawWildMonInfo; rock_smash?: RawWildMonInfo; fishing?: RawWildMonInfo };

/** 1:1 décomp `struct WildPokemonInfo` (encounterRate + wildPokemon[]). */
function _convertWildMonInfo(e: RawWildMonInfo | undefined): WildPokemonInfo | null {
  if (!e) return null;
  return {
    encounterRate: e.encounter_rate,
    wildPokemon: e.mons.map(m => ({ minLevel: m.min_level, maxLevel: m.max_level, species: m.species })),
  };
}

/** 1:1 décomp : convertit une entrée brute en WildPokemonHeader (land/water/rock_smash/fishing). */
function _toWildPokemonHeader(mapId: string, entry: RawWildEntry): WildPokemonHeader {
  return {
    mapId,
    landMonsInfo:       _convertWildMonInfo(entry.land),
    waterMonsInfo:      _convertWildMonInfo(entry.water),
    rockSmashMonsInfo:  _convertWildMonInfo(entry.rock_smash),
    fishingMonsInfo:    _convertWildMonInfo(entry.fishing),
  };
}

/** Init data depuis fetched JSON. À call au boot AVANT premier StandardWildEncounter. */
export function InitWildEncountersFromJson(jsonData: unknown): void {
  _gWildMonHeaders = new Map();
  _sAlteringCaveWildMonHeaders = [];
  const data = jsonData as { byMap?: Record<string, RawWildEntry>; alteringCave?: RawWildEntry[] };
  if (data.alteringCave) {
    _sAlteringCaveWildMonHeaders = data.alteringCave.map(t => _toWildPokemonHeader(MAP_ALTERING_CAVE_ID, t));
  }
  if (!data.byMap) return;
  for (const [mapId, entry] of Object.entries(data.byMap)) {
    _gWildMonHeaders.set(mapId, _toWildPokemonHeader(mapId, entry));
  }
  console.log(`[wild-encounter] loaded ${_gWildMonHeaders.size} map encounters, ${_sAlteringCaveWildMonHeaders.length} altering-cave tables`);
}

// ─── State ─────────────────────────────────────────────────────────────────

/** 1:1 décomp `EWRAM_DATA static u8 sWildEncountersDisabled` (wild_encounter.c:62). */
let sWildEncountersDisabled = false;

/** 1:1 décomp `DisableWildEncounters` (wild_encounter.c:77). */
export function DisableWildEncounters(disabled: boolean): void {
  sWildEncountersDisabled = disabled;
}

// ─── Public callback : appelée par PlayerStep au step-end ──────────────────
// 1:1 décomp `field_player_avatar.c:CheckForFieldEncounter` (= flow path qui
// appelle `StandardWildEncounter(curMetatileBehavior, prevMetatileBehavior)`
// au tile step end). On set callback ici pour wire ↔ PlayerStep.

let _onBattleStartCallback: (() => void) | null = null;

/** Set au boot par la scene pour brancher l'init combat sauvage (= fade out
 *  overworld + scene swap → battle scene). */
export function SetWildBattleStartCallback(cb: () => void): void {
  _onBattleStartCallback = cb;
}

// ─── Helpers internes 1:1 décomp ───────────────────────────────────────────

/** 1:1 décomp `ChooseWildMonIndex_Land` (wild_encounter.c:182-210).
 *  12 slots cumulative thresholds. */
export function ChooseWildMonIndex_Land(): number {
  const rand = Random() % ENCOUNTER_CHANCE_LAND_MONS_TOTAL;
  if (rand < ENCOUNTER_CHANCE_LAND_MONS_SLOT_0) return 0;
  else if (rand >= ENCOUNTER_CHANCE_LAND_MONS_SLOT_0 && rand < ENCOUNTER_CHANCE_LAND_MONS_SLOT_1) return 1;
  else if (rand >= ENCOUNTER_CHANCE_LAND_MONS_SLOT_1 && rand < ENCOUNTER_CHANCE_LAND_MONS_SLOT_2) return 2;
  else if (rand >= ENCOUNTER_CHANCE_LAND_MONS_SLOT_2 && rand < ENCOUNTER_CHANCE_LAND_MONS_SLOT_3) return 3;
  else if (rand >= ENCOUNTER_CHANCE_LAND_MONS_SLOT_3 && rand < ENCOUNTER_CHANCE_LAND_MONS_SLOT_4) return 4;
  else if (rand >= ENCOUNTER_CHANCE_LAND_MONS_SLOT_4 && rand < ENCOUNTER_CHANCE_LAND_MONS_SLOT_5) return 5;
  else if (rand >= ENCOUNTER_CHANCE_LAND_MONS_SLOT_5 && rand < ENCOUNTER_CHANCE_LAND_MONS_SLOT_6) return 6;
  else if (rand >= ENCOUNTER_CHANCE_LAND_MONS_SLOT_6 && rand < ENCOUNTER_CHANCE_LAND_MONS_SLOT_7) return 7;
  else if (rand >= ENCOUNTER_CHANCE_LAND_MONS_SLOT_7 && rand < ENCOUNTER_CHANCE_LAND_MONS_SLOT_8) return 8;
  else if (rand >= ENCOUNTER_CHANCE_LAND_MONS_SLOT_8 && rand < ENCOUNTER_CHANCE_LAND_MONS_SLOT_9) return 9;
  else if (rand >= ENCOUNTER_CHANCE_LAND_MONS_SLOT_9 && rand < ENCOUNTER_CHANCE_LAND_MONS_SLOT_10) return 10;
  else return 11;
}

/** 1:1 décomp `ChooseWildMonIndex_WaterRock` (wild_encounter.c:213-227).
 *  5 slots cumulative. Used pour water ET rock_smash (= mêmes rates). */
export function ChooseWildMonIndex_WaterRock(): number {
  const rand = Random() % ENCOUNTER_CHANCE_WATER_MONS_TOTAL;
  if (rand < ENCOUNTER_CHANCE_WATER_MONS_SLOT_0) return 0;
  else if (rand >= ENCOUNTER_CHANCE_WATER_MONS_SLOT_0 && rand < ENCOUNTER_CHANCE_WATER_MONS_SLOT_1) return 1;
  else if (rand >= ENCOUNTER_CHANCE_WATER_MONS_SLOT_1 && rand < ENCOUNTER_CHANCE_WATER_MONS_SLOT_2) return 2;
  else if (rand >= ENCOUNTER_CHANCE_WATER_MONS_SLOT_2 && rand < ENCOUNTER_CHANCE_WATER_MONS_SLOT_3) return 3;
  else return 4;
}

/** 1:1 décomp `ChooseWildMonLevel` (wild_encounter.c:268-303).
 *  Min/max swap si inversés + Random range. Si le lead mon (non-œuf) a
 *  HUSTLE/VITAL_SPIRIT/PRESSURE → 50% niveau max, sinon décale `rand` d'un cran. */
export function ChooseWildMonLevel(wildPokemon: WildPokemon): number {
  let min: number, max: number;
  if (wildPokemon.maxLevel >= wildPokemon.minLevel) {
    min = wildPokemon.minLevel;
    max = wildPokemon.maxLevel;
  } else {
    min = wildPokemon.maxLevel;
    max = wildPokemon.minLevel;
  }
  const range = max - min + 1;
  let rand = Random() % range;
  // 1:1 décomp wild_encounter.c:289-301 : check ability pour max level mon.
  if (!GetMonData(gPlayerParty[0], MON_DATA_SANITY_IS_EGG)) {
    const ability = GetMonAbility(gPlayerParty[0]);
    if (ability === ABILITY_HUSTLE || ability === ABILITY_VITAL_SPIRIT || ability === ABILITY_PRESSURE) {
      if (Random() % 2 === 0)
        return max;
      if (rand !== 0)
        rand--;
    }
  }
  return min + rand;
}

/** 1:1 décomp `GetCurrentMapWildMonHeaderId` (wild_encounter.c:305-333).
 *  Notre web port : lookup direct par mapId au lieu d'itérer un array de
 *  WildPokemonHeader (mapGroup+mapNum) renvoyant un index ; on renvoie l'objet header.
 *
 *  Cas spécial Altering Cave 1:1 (wild_encounter.c:318-326) : sur MAP_ALTERING_CAVE, on
 *  lit `VAR_ALTERING_CAVE_WILD_SET` (clampé à 0 si >= NUM_ALTERING_CAVE_TABLES) et on
 *  sélectionne la table correspondante parmi les 9 (= `i += alteringCaveId`). La var est
 *  pilotable via la barre de devtools (harness/devtools/dev-encounter-tools.ts). */
function GetCurrentMapWildMonHeader(): WildPokemonHeader | null {
  if (!_gWildMonHeaders) return null;
  const mapId = gMapHeader?.id ?? '';
  if (mapId === MAP_ALTERING_CAVE_ID && _sAlteringCaveWildMonHeaders.length > 0) {
    let alteringCaveId = VarGet('VAR_ALTERING_CAVE_WILD_SET');
    if (alteringCaveId >= NUM_ALTERING_CAVE_TABLES)
      alteringCaveId = 0;
    return _sAlteringCaveWildMonHeaders[alteringCaveId] ?? null;
  }
  return _gWildMonHeaders.get(mapId) ?? null;
}

/** 1:1 décomp `u16 GetLocalWildMon(bool8 *isWaterMon)` (wild_encounter.c:1041) :
 *  espèce d'un mon sauvage local — terre seule / eau seule / 80%-terre·20%-eau si
 *  les deux. Utilisé pour le cri ambiant de l'overworld (overworld.c:1330).
 *  Adaptations modèle : species = string ('SPECIES_X', WildPokemon.species) ;
 *  out-param `isWaterMon` = objet `{ value }` (≈ pointeur bool8 *). */
export function GetLocalWildMon(isWaterMon: { value: boolean }): string {
  isWaterMon.value = false;
  const header = GetCurrentMapWildMonHeader();
  if (!header) return 'SPECIES_NONE';  // 1:1 : headerId == HEADER_NONE
  const landMonsInfo = header.landMonsInfo;
  const waterMonsInfo = header.waterMonsInfo;
  if (!landMonsInfo && !waterMonsInfo) return 'SPECIES_NONE';
  if (landMonsInfo && !waterMonsInfo) {
    return landMonsInfo.wildPokemon[ChooseWildMonIndex_Land()].species;
  }
  if (!landMonsInfo && waterMonsInfo) {
    isWaterMon.value = true;
    return waterMonsInfo.wildPokemon[ChooseWildMonIndex_WaterRock()].species;
  }
  // 1:1 : les deux → 80% terre, 20% eau.
  if ((Random() % 100) < 80) {
    return landMonsInfo!.wildPokemon[ChooseWildMonIndex_Land()].species;
  }
  isWaterMon.value = true;
  return waterMonsInfo!.wildPokemon[ChooseWildMonIndex_WaterRock()].species;
}

/** 1:1 décomp `u16 GetLocalWaterMon(void)` (wild_encounter.c:1075) : espèce d'un mon
 *  d'eau local (ou SPECIES_NONE). Cri ambiant si l'Île Mirage est absente
 *  (overworld.c:1326). */
export function GetLocalWaterMon(): string {
  const header = GetCurrentMapWildMonHeader();
  if (header && header.waterMonsInfo) {
    return header.waterMonsInfo.wildPokemon[ChooseWildMonIndex_WaterRock()].species;
  }
  return 'SPECIES_NONE';
}

// Exposition dev (sonde déterministe), sans effet sur le jeu.
(globalThis as Record<string, unknown>).__GetLocalWildMon = GetLocalWildMon;
(globalThis as Record<string, unknown>).__GetLocalWaterMon = GetLocalWaterMon;

/** 1:1 décomp `EncounterOddsCheck` (wild_encounter.c:493-499). */
export function EncounterOddsCheck(encounterRate: number): boolean {
  return (Random() % MAX_ENCOUNTER_RATE) < encounterRate;
}

/** 1:1 décomp `include/constants/items.h` `#define ITEM_CLEANSE_TAG 190`. */
const ITEM_CLEANSE_TAG = 190;

/** 1:1 décomp `ApplyFluteEncounterRateMod` (wild_encounter.c:955) : Flûte Blanche
 *  (FLAG_SYS_ENC_UP_ITEM) → +50% du taux ; Flûte Noire (FLAG_SYS_ENC_DOWN_ITEM) → −50%. */
function ApplyFluteEncounterRateMod(encRate: number): number {
  if (FlagGet('FLAG_SYS_ENC_UP_ITEM')) return encRate + Math.floor(encRate / 2);
  if (FlagGet('FLAG_SYS_ENC_DOWN_ITEM')) return Math.floor(encRate / 2);
  return encRate;
}

/** 1:1 décomp `ApplyCleanseTagEncounterRateMod` (wild_encounter.c:962) : Rune Protect
 *  (Cleanse Tag) tenu par le lead → taux ×2/3. */
function ApplyCleanseTagEncounterRateMod(encRate: number): number {
  if (GetMonData(gPlayerParty[0], MON_DATA_HELD_ITEM) === ITEM_CLEANSE_TAG)
    return Math.floor(encRate * 2 / 3);
  return encRate;
}

/** 1:1 décomp `WildEncounterCheck` (wild_encounter.c:502-529).
 *  Returns true si l'encounter doit trigger. */
function WildEncounterCheck(encounterRate: number, ignoreAbility: boolean): boolean {
  let er = encounterRate * 16;
  // 1:1 décomp : vélo (Mach/Acro Bike) → taux ×80%.
  if (TestPlayerAvatarFlags(PLAYER_AVATAR_FLAG_MACH_BIKE | PLAYER_AVATAR_FLAG_ACRO_BIKE))
    er = Math.floor(er * 80 / 100);
  er = ApplyFluteEncounterRateMod(er);
  er = ApplyCleanseTagEncounterRateMod(er);
  // 1:1 décomp : mods d'ability du lead (non-œuf) sur le taux de rencontre.
  // (Cas STENCH ×3/4 Battle Pyramid omis : Frontier non porté.)
  if (!ignoreAbility && !GetMonData(gPlayerParty[0], MON_DATA_SANITY_IS_EGG)) {
    const ability = GetMonAbility(gPlayerParty[0]);
    if (ability === ABILITY_STENCH) er = Math.floor(er / 2);
    else if (ability === ABILITY_ILLUMINATE) er *= 2;
    else if (ability === ABILITY_WHITE_SMOKE) er = Math.floor(er / 2);
    else if (ability === ABILITY_ARENA_TRAP) er *= 2;
    else if (ability === ABILITY_SAND_VEIL && gSaveBlock1Ptr.weather === WEATHER_SANDSTORM) er = Math.floor(er / 2);
  }
  if (er > MAX_ENCOUNTER_RATE) er = MAX_ENCOUNTER_RATE;
  return EncounterOddsCheck(er);
}

/** 1:1 décomp `AllowWildCheckOnNewMetatile` (wild_encounter.c:533-538) :
 *    if (Random() % 100 >= 60) return FALSE; else return TRUE;
 *  → 40% skip sur tile change (= step sur tile type différent). */
export function AllowWildCheckOnNewMetatile(): boolean {
  return (Random() % 100) < 60;
}

/** 1:1 décomp `AreLegendariesInSootopolisPreventingEncounters` (wild_encounter.c:541-550).
 *  Sootopolis pre-Wallace event : encounters disabled si legendaries présents. */
function AreLegendariesInSootopolisPreventingEncounters(): boolean {
  // Dette R3 : FLAG_LEGENDARIES_IN_SOOTOPOLIS + Sootopolis check. Hors-démo.
  // Always returns false → encounters allowed by default.
  return false;
}

/** 1:1 décomp `PickWildMonNature` (wild_encounter.c) : si le lead mon (non-œuf) a
 *  Synchronize, 50% → la nature du wild = celle du lead (`personality % NUM_NATURES`) ;
 *  sinon nature aléatoire. (Biais Pokéblock Safari Zone non porté → skip.) Retourne
 *  un index de nature 0..24. */
function PickWildMonNature(): number {
  const NUM_NATURES = 25;  // 1:1 décomp include/constants/pokemon.h.
  if (!GetMonData(gPlayerParty[0], MON_DATA_SANITY_IS_EGG)
      && GetMonAbility(gPlayerParty[0]) === ABILITY_SYNCHRONIZE
      && Random() % 2 === 0) {
    return ((GetMonData(gPlayerParty[0], MON_DATA_PERSONALITY) as number) >>> 0) % NUM_NATURES;
  }
  return Random() % NUM_NATURES;
}

/** 1:1 décomp `CreateWildMon` (wild_encounter.c:379-415) + boot du combat.
 *  Le combat SAUVAGE passe par la VRAIE boucle décomp (voie L) — la voie V
 *  (battle-flow.ts) a été retirée du chemin wild (destruction voie V, étape 1). */
function CreateWildMon(species: string, level: number): void {
  // ── 1:1 décomp `BattleSetup_StartWildBattle` (battle_setup.c:389) → `SetMainCallback2(
  //    CB2_InitBattle)`. Peuple gEnemyParty (le mon sauvage) ; gPlayerParty EST déjà la
  //    party joueur (source, migration Pokémon étape 5) → lue direct. Pose le type SAUVAGE.
  //    `bootDecompBattleLoop(true)` = CreateBattleStartTask(GetWildBattleTransition) (transition
  //    d'entrée) + PlayBattleBGM + swap CB2_InitBattle + savedCallback de retour OW
  //    (CB2_EndWildBattle). Dette R3 : Cute Charm gender bias (wild_encounter.c:394-412),
  //    PickWildMonNature : nature via Synchronize ci-dessous (Cute Charm gender bias
  //    déféré = génération du gender via PID).
  // 1:1 décomp CreateMonWithNature : on re-roll le personality jusqu'à ce que sa
  // nature (personality % 25) corresponde à PickWildMonNature. INDISPENSABLE : nos
  // CalculateMonStats (party-storage) dérivent la nature du PERSONALITY, pas du champ
  // `nature` → forcer via personality garde le champ nature ET les stats cohérents
  // (sinon Synchronize poserait une nature d'affichage ≠ stats).
  // 1:1 décomp : Cute Charm → si l'espèce wild a un genderRatio VARIABLE et que le
  // lead (non-œuf) a Cute Charm, 2/3 (Random%3 != 0) → genre wild = opposé du lead.
  let targetGender = -1;  // -1 = pas de contrainte de genre
  const grStr = getSpeciesInfo(species)?.genderRatio;
  const fixedGender = grStr === 'MON_MALE' || grStr === 'MON_FEMALE' || grStr === 'MON_GENDERLESS';
  if (!fixedGender && !GetMonData(gPlayerParty[0], MON_DATA_SANITY_IS_EGG)
      && GetMonAbility(gPlayerParty[0]) === ABILITY_CUTE_CHARM && Random() % 3 !== 0) {
    const leadSpecies = GetMonData(gPlayerParty[0], MON_DATA_SPECIES) as number;
    const leadPersonality = GetMonData(gPlayerParty[0], MON_DATA_PERSONALITY) as number;
    const leadEnum = reverseDecompConstant(leadSpecies, 'SPECIES_') ?? '';
    const leadGender = GetGenderFromSpeciesAndPersonality(leadEnum, leadPersonality);
    targetGender = (leadGender === MON_FEMALE) ? MON_MALE : MON_FEMALE;  // 1:1 : opposé
  }
  const natureIdx = PickWildMonNature();
  let personality = Random32() >>> 0;
  while ((personality % 25) !== natureIdx
         || (targetGender >= 0 && GetGenderFromSpeciesAndPersonality(species, personality) !== targetGender)) {
    personality = Random32() >>> 0;
  }
  setupEnemyPartyForBattle([createPokemonInstance(species, level, { personality })]);
  // 1:1 décomp `DoStandardWildBattle` (battle_setup.c:408) : `gBattleTypeFlags = 0` (OVERWRITE).
  // ⚠️ FIX régression : l'ancien `& ~BATTLE_TYPE_TRAINER` PRÉSERVAIT BATTLE_TYPE_FIRST_BATTLE posé
  // par le tuto Birch (StartFirstBattle) → chaque combat sauvage APRÈS le tuto restait un Zigzagoon
  // Lv2 infuyable. Le reset complet à 0 (= la décomp) efface FIRST_BATTLE/TRAINER/etc.
  setBattleTypeFlags(0);
  bootDecompBattleLoop(true);
}

/** 1:1 décomp `TryGetRandomWildMonIndexByType` (wild_encounter.c:915-934) : parmi
 *  les `numMon` slots, sélectionne au hasard un index dont l'espèce est du type
 *  `type` (types[0] ou [1]). Retourne -1 si aucun OU si tous le sont (= pas de
 *  biais utile). Nos `types` sont des strings → résolus en numérique. */
function TryGetRandomWildMonIndexByType(wildMon: WildPokemon[], type: number, numMon: number): number {
  const validIndexes: number[] = [];
  for (let i = 0; i < numMon; i++) {
    const t = getSpeciesInfo(wildMon[i].species)?.types;
    if (t && (resolveDecompConstant(t[0]) === type || resolveDecompConstant(t[1]) === type))
      validIndexes.push(i);
  }
  if (validIndexes.length === 0 || validIndexes.length === numMon) return -1;
  return validIndexes[Random() % validIndexes.length];
}

/** 1:1 décomp `TryGetAbilityInfluencedWildMonIndex` (wild_encounter.c:936-952) :
 *  si le lead mon (non-œuf) a `ability`, 50% → biais vers une espèce de type
 *  `type`. Retourne l'index choisi ou -1. */
function TryGetAbilityInfluencedWildMonIndex(wildMon: WildPokemon[], type: number, ability: number, numMon: number): number {
  if (GetMonData(gPlayerParty[0], MON_DATA_SANITY_IS_EGG)) return -1;
  if (GetMonAbility(gPlayerParty[0]) !== ability) return -1;
  if (Random() % 2 !== 0) return -1;
  return TryGetRandomWildMonIndexByType(wildMon, type, numMon);
}

/** 1:1 décomp `IsWildLevelAllowedByRepel` (wild_encounter.c:874) : si un Repel est
 *  actif (VAR_REPEL_STEP_COUNT != 0), autorise la rencontre seulement si son niveau
 *  est >= celui du premier mon non-KO et non-œuf de l'équipe. */
function IsWildLevelAllowedByRepel(wildLevel: number): boolean {
  if (!VarGet('VAR_REPEL_STEP_COUNT')) return true;
  for (let i = 0; i < PARTY_SIZE; i++) {
    if (GetMonData(gPlayerParty[i], MON_DATA_HP) && !GetMonData(gPlayerParty[i], MON_DATA_IS_EGG)) {
      const ourLevel = GetMonData(gPlayerParty[i], MON_DATA_LEVEL) as number;
      return wildLevel >= ourLevel;
    }
  }
  return false;
}
// Sonde déterministe (sans effet jeu) : confirme la suppression Repel des rencontres.
(globalThis as Record<string, unknown>).__IsWildLevelAllowedByRepel = IsWildLevelAllowedByRepel;

/** 1:1 décomp `UpdateRepelCounter` (wild_encounter.c:850) : décrémente
 *  VAR_REPEL_STEP_COUNT à chaque pas ; à 0 → EventScript_RepelWoreOff (message).
 *  Retourne TRUE si le Repel vient d'expirer (= un script a démarré).
 *  (Guards InBattlePike/Pyramid/UnionRoom omis : Frontier/link non portés = toujours false.) */
export function UpdateRepelCounter(): boolean {
  let steps = VarGet('VAR_REPEL_STEP_COUNT');
  if (steps !== 0) {
    steps--;
    VarSet('VAR_REPEL_STEP_COUNT', steps);
    if (steps === 0) {
      ScriptContext_SetupScript('EventScript_RepelWoreOff');
      return true;
    }
  }
  return false;
}

/** 1:1 décomp `IsAbilityAllowingEncounter` (wild_encounter.c:836) : si le lead mon
 *  (non-œuf) a Keen Eye ou Intimidate et que le niveau sauvage est <= (niveau du
 *  lead − 5), 50% → empêche la rencontre. */
function IsAbilityAllowingEncounter(level: number): boolean {
  if (GetMonData(gPlayerParty[0], MON_DATA_SANITY_IS_EGG)) return true;
  const ability = GetMonAbility(gPlayerParty[0]);
  if (ability === ABILITY_KEEN_EYE || ability === ABILITY_INTIMIDATE) {
    const playerMonLevel = GetMonData(gPlayerParty[0], MON_DATA_LEVEL) as number;
    if (playerMonLevel > 5 && level <= playerMonLevel - 5 && !(Random() % 2))
      return false;
  }
  return true;
}

/** 1:1 décomp `TryGenerateWildMon` (wild_encounter.c:422-456) minimal.
 *  Returns TRUE si encounter setup (= CreateWildMon appelé). */
function TryGenerateWildMon(wildMonInfo: WildPokemonInfo, area: number, flags: number): boolean {
  let wildMonIndex = 0;
  switch (area) {
    case WILD_AREA_LAND: {
      // 1:1 décomp : Magnet Pull → Acier, puis Static → Électrik (50% chacun).
      let idx = TryGetAbilityInfluencedWildMonIndex(wildMonInfo.wildPokemon, TYPE_STEEL, ABILITY_MAGNET_PULL, LAND_WILD_COUNT);
      if (idx < 0) idx = TryGetAbilityInfluencedWildMonIndex(wildMonInfo.wildPokemon, TYPE_ELECTRIC, ABILITY_STATIC, LAND_WILD_COUNT);
      wildMonIndex = idx >= 0 ? idx : ChooseWildMonIndex_Land();
      break;
    }
    case WILD_AREA_WATER: {
      // 1:1 décomp : Static → Électrik (50%).
      const idx = TryGetAbilityInfluencedWildMonIndex(wildMonInfo.wildPokemon, TYPE_ELECTRIC, ABILITY_STATIC, WATER_WILD_COUNT);
      wildMonIndex = idx >= 0 ? idx : ChooseWildMonIndex_WaterRock();
      break;
    }
    case WILD_AREA_ROCKS:
      wildMonIndex = ChooseWildMonIndex_WaterRock();
      break;
  }
  const level = ChooseWildMonLevel(wildMonInfo.wildPokemon[wildMonIndex]);
  // 1:1 décomp : WILD_CHECK_REPEL → bloque si un Repel actif interdit ce niveau.
  if ((flags & WILD_CHECK_REPEL) && !IsWildLevelAllowedByRepel(level)) return false;
  // 1:1 décomp : WILD_CHECK_KEEN_EYE → Keen Eye/Intimidate peut empêcher une
  // rencontre de bas niveau (check Pike Room Frontier omis, non porté).
  if ((flags & WILD_CHECK_KEEN_EYE) && !IsAbilityAllowingEncounter(level)) return false;
  CreateWildMon(wildMonInfo.wildPokemon[wildMonIndex].species, level);
  return true;
}

// ─── Fishing wild encounter (= 1:1 décomp wild_encounter.c) ───────────────────
// 1:1 décomp `include/constants/items.h` rod secondary ids (= GetItemSecondaryId).
const OLD_ROD = 0, GOOD_ROD = 1, SUPER_ROD = 2;

/** 1:1 STRICT décomp `ChooseWildMonIndex_Fishing(u8 rod)` (wild_encounter.c:229) : choisit le slot
 *  (0..9) selon la canne, via des chances cumulatives `ENCOUNTER_CHANCE_FISHING_MONS_*` (total 100,
 *  `rand = Random() % max(...,100)`). OLD `[70,30]` slots 0-1 · GOOD `[60,20,20]` slots 2-4 ·
 *  SUPER `[40,40,15,4,1]` slots 5-9. (Seuils cumulatifs : OLD 70 · GOOD 60/80/100 · SUPER 40/80/95/99/100.) */
function ChooseWildMonIndex_Fishing(rod: number): number {
  let wildMonIndex = 0;
  const rand = Random() % 100;  // max(OLD_TOTAL, GOOD_TOTAL, SUPER_TOTAL) = 100
  switch (rod) {
    case OLD_ROD:
      wildMonIndex = rand < 70 ? 0 : 1;
      break;
    case GOOD_ROD:
      if (rand < 60) wildMonIndex = 2;
      else if (rand < 80) wildMonIndex = 3;
      else wildMonIndex = 4;
      break;
    case SUPER_ROD:
      if (rand < 40) wildMonIndex = 5;
      else if (rand < 80) wildMonIndex = 6;
      else if (rand < 95) wildMonIndex = 7;
      else if (rand < 99) wildMonIndex = 8;
      else wildMonIndex = 9;
      break;
  }
  return wildMonIndex;
}

/** 1:1 STRICT décomp `GenerateFishingWildMon(const struct WildPokemonInfo *, u8 rod)` (wild_encounter.c:267) :
 *    idx = ChooseWildMonIndex_Fishing(rod); level = ChooseWildMonLevel(&wildMonInfo->wildPokemon[idx]);
 *    CreateWildMon(wildMonInfo->wildPokemon[idx].species, level); return species; */
function GenerateFishingWildMon(wildMonInfo: WildPokemonInfo, rod: number): string {
  const wildMonIndex = ChooseWildMonIndex_Fishing(rod);
  const mon = wildMonInfo.wildPokemon[wildMonIndex];
  if (!mon) return '';  // garde : table de pêche < 10 slots (la décomp suppose toujours 10)
  const level = ChooseWildMonLevel(mon);
  CreateWildMon(mon.species, level);  // → boot du combat (bootDecompBattleLoop), comme TryGenerateWildMon
  return mon.species;
}

/** 1:1 STRICT décomp `static bool8 SetUpMassOutbreakEncounter(u8 flags)` (wild_encounter.c:467) :
 *    if (flags & WILD_CHECK_REPEL && !IsWildLevelAllowedByRepel(outbreakPokemonLevel)) return FALSE;
 *    CreateWildMon(outbreakPokemonSpecies, outbreakPokemonLevel);
 *    for (i = 0..MAX_MON_MOVES) SetMonMoveSlot(&gEnemyParty[0], outbreakPokemonMoves[i], i);
 *    return TRUE;
 *  Adaptation modèle : `outbreakPokemonSpecies` est un id numérique dans la save (1:1 u16) →
 *  reconverti en nom 'SPECIES_X' pour notre CreateWildMon. CreateWildMon peuple `gEnemyParty[0]`
 *  de façon SYNCHRONE (puis swap callback2 à la frame suivante) → les SetMonMoveSlot qui suivent
 *  écrasent bien les slots avant que CB2_InitBattle ne lise la party. */
function SetUpMassOutbreakEncounter(flags: number): boolean {
  if ((flags & WILD_CHECK_REPEL) && !IsWildLevelAllowedByRepel(gSaveBlock1Ptr.outbreakPokemonLevel))
    return false;

  const species = reverseDecompConstant(gSaveBlock1Ptr.outbreakPokemonSpecies, 'SPECIES_') ?? 'SPECIES_NONE';
  CreateWildMon(species, gSaveBlock1Ptr.outbreakPokemonLevel);
  for (let i = 0; i < MAX_MON_MOVES; i++)
    SetMonMoveSlot(gEnemyParty[0], gSaveBlock1Ptr.outbreakPokemonMoves[i], i);

  return true;
}

/** 1:1 STRICT décomp `static bool8 DoMassOutbreakEncounterTest(void)` (wild_encounter.c:481) :
 *    if (outbreakPokemonSpecies != SPECIES_NONE
 *     && location.mapNum == outbreakLocationMapNum && location.mapGroup == outbreakLocationMapGroup)
 *      if (Random() % 100 < outbreakPokemonProbability) return TRUE;
 *    return FALSE;
 *  L'outbreak (espèce/lieu/proba) est posé par la TV / Pokémon News (match_call/tv, non encore portés)
 *  → tant que `outbreakPokemonSpecies == SPECIES_NONE (0)`, ceci renvoie toujours FALSE. Le mécanisme
 *  reste câblé 1:1, prêt dès que la source d'event posera la save (cf. hooks custom dex/multi). */
function DoMassOutbreakEncounterTest(): boolean {
  if (gSaveBlock1Ptr.outbreakPokemonSpecies !== 0  // SPECIES_NONE
      && gSaveBlock1Ptr.location.mapNum === gSaveBlock1Ptr.outbreakLocationMapNum
      && gSaveBlock1Ptr.location.mapGroup === gSaveBlock1Ptr.outbreakLocationMapGroup) {
    if ((Random() % 100) < gSaveBlock1Ptr.outbreakPokemonProbability)
      return true;
  }
  return false;
}

/** 1:1 STRICT décomp `DoesCurrentMapHaveFishingMons` (wild_encounter.c:584) :
 *    headerId != HEADER_NONE && gWildMonHeaders[headerId].fishingMonsInfo != NULL. */
export function DoesCurrentMapHaveFishingMons(): boolean {
  const header = GetCurrentMapWildMonHeader();
  return !!(header && header.fishingMonsInfo);
}

/** 1:1 STRICT décomp `FishingWildEncounter(u8 rod)` (wild_encounter.c:780) :
 *    if (CheckFeebas()) { level = ChooseWildMonLevel(&sWildFeebas); species = sWildFeebas.species;
 *                         CreateWildMon(species, level); }
 *    else species = GenerateFishingWildMon(fishingMonsInfo, rod);
 *    IncrementGameStat(GAME_STAT_FISHING_ENCOUNTERS); SetPokemonAnglerSpecies(species);
 *    BattleSetup_StartWildBattle();
 *  CheckFeebas (spots Feebas Route 119) câblé. SetPokemonAnglerSpecies (TV/Pokénav) = dette R3 (skip).
 *  Le boot du combat (`BattleSetup_StartWildBattle`) est replié dans `CreateWildMon` chez nous (voie L). */
export function FishingWildEncounter(rod: number): void {
  if (CheckFeebas()) {
    const level = ChooseWildMonLevel(sWildFeebas);
    CreateWildMon(sWildFeebas.species, level);
  } else {
    const header = GetCurrentMapWildMonHeader();
    if (!header || !header.fishingMonsInfo) return;  // 1:1 gWildMonHeaders[id].fishingMonsInfo
    GenerateFishingWildMon(header.fishingMonsInfo, rod);
  }
  IncrementGameStat(GAME_STAT_FISHING_ENCOUNTERS);
}

// Dev hook (A/B encounter pêche : force-déclenche un combat de pêche par canne 0=OLD/1=GOOD/2=SUPER).
(globalThis as Record<string, unknown>).__FishingWildEncounter = FishingWildEncounter;
(globalThis as Record<string, unknown>).__DoesCurrentMapHaveFishingMons = DoesCurrentMapHaveFishingMons;

/** 1:1 STRICT décomp `RockSmashWildEncounter` (wild_encounter.c) :
 *    headerId = GetCurrentMapWildMonHeaderId();
 *    if (headerId != HEADER_NONE) {
 *        info = gWildMonHeaders[headerId].rockSmashMonsInfo;
 *        if (info == NULL) Result = FALSE;
 *        else if (WildEncounterCheck(info->encounterRate, TRUE)
 *              && TryGenerateWildMon(info, WILD_AREA_ROCKS, WILD_CHECK_REPEL|WILD_CHECK_KEEN_EYE))
 *            { BattleSetup_StartWildBattle(); Result = TRUE; }
 *        else Result = FALSE;
 *    } else Result = FALSE;
 *  Le combat (BattleSetup_StartWildBattle) est déclenché via `_onBattleStartCallback`, comme
 *  StandardWildEncounter. Returns TRUE si un combat démarre (le special handler le pose dans VAR_RESULT).
 *  WILD_CHECK_REPEL|WILD_CHECK_KEEN_EYE sont HONORÉS par TryGenerateWildMon (l.526/529 :
 *  IsWildLevelAllowedByRepel + IsAbilityAllowingEncounter, tous deux 1:1) — l'ancienne note
 *  « dette R3 / flags ignorés » était périmée (Repel + Keen Eye câblés et vérifiés). */
export function RockSmashWildEncounter(): boolean {
  const header = GetCurrentMapWildMonHeader();
  if (!header || header.rockSmashMonsInfo === null) return false;
  const info = header.rockSmashMonsInfo;
  if (WildEncounterCheck(info.encounterRate, true) && TryGenerateWildMon(info, WILD_AREA_ROCKS, WILD_CHECK_REPEL | WILD_CHECK_KEEN_EYE)) {
    _onBattleStartCallback?.();
    return true;
  }
  return false;
}
(globalThis as Record<string, unknown>).__RockSmashWildEncounter = RockSmashWildEncounter;

/** 1:1 STRICT décomp `SweetScentWildEncounter` (wild_encounter.c:697) :
 *    PlayerGetDestCoords(&x, &y);
 *    headerId = GetCurrentMapWildMonHeaderId();
 *    if (headerId == HEADER_NONE) { ...Battle Pike/Pyramid... }     ← dette R3 (Frontier)
 *    else {
 *        if (IsLandWildEncounter(MapGridGetMetatileBehaviorAt(x,y))) {
 *            if (landMonsInfo == NULL) return FALSE;
 *            ...roamer/outbreak...                                   ← dette R3
 *            TryGenerateWildMon(landMonsInfo, WILD_AREA_LAND, 0);
 *            BattleSetup_StartWildBattle(); return TRUE;
 *        } else if (IsWaterWildEncounter(...)) { ...water... }
 *    }
 *    return FALSE;
 *
 *  Doux Parfum = encounter FORCÉ (PAS de WildEncounterCheck / encounterRate roll,
 *  contrairement à StandardWildEncounter). Le combat (BattleSetup_StartWildBattle)
 *  démarre via `_onBattleStartCallback`. Returns TRUE si un combat démarre. */
export function SweetScentWildEncounter(): boolean {
  const { x, y } = PlayerGetDestCoords();
  const header = GetCurrentMapWildMonHeader();
  // headerId == HEADER_NONE → branches Battle Pike/Pyramid (dette R3, Frontier non porté).
  if (!header) return false;
  const behavior = MapGridGetMetatileBehaviorAt(x, y);
  if (MetatileBehavior_IsLandWildEncounter(behavior)) {
    if (header.landMonsInfo === null) return false;
    // Dette R3 : TryStartRoamerEncounter (roamer non porté).
    // 1:1 décomp (wild_encounter.c:740-743) : outbreak prioritaire, sinon rencontre normale.
    if (DoMassOutbreakEncounterTest())
      SetUpMassOutbreakEncounter(0);
    else
      TryGenerateWildMon(header.landMonsInfo, WILD_AREA_LAND, 0);
    _onBattleStartCallback?.();
    return true;
  } else if (MetatileBehavior_IsWaterWildEncounter(behavior)) {
    if (AreLegendariesInSootopolisPreventingEncounters()) return false;
    if (header.waterMonsInfo === null) return false;
    // Dette R3 : TryStartRoamerEncounter.
    TryGenerateWildMon(header.waterMonsInfo, WILD_AREA_WATER, 0);
    _onBattleStartCallback?.();
    return true;
  }
  return false;
}
(globalThis as Record<string, unknown>).__SweetScentWildEncounter = SweetScentWildEncounter;

// ─── Immunity counter (= 1:1 décomp field_control_avatar.c:668-686) ───────

/** 1:1 décomp `static u8 sWildEncounterImmunitySteps` (field_control_avatar.c).
 *  Le décomp grant 4 steps d'immunité au début de chaque map / post-encounter
 *  pour éviter encounter trop immédiat. Reset à 0 quand encounter triggers. */
let sWildEncounterImmunitySteps = 0;

/** 1:1 décomp `static u16 sPrevMetatileBehavior` (field_control_avatar.c).
 *  Stocke le metatileBehavior du step précédent. Passé à StandardWildEncounter
 *  pour le check `AllowWildCheckOnNewMetatile` (= 40% skip si tile change). */
let sPrevMetatileBehavior = 0;

/** 1:1 décomp `CheckStandardWildEncounter` (field_control_avatar.c:668-686).
 *
 *  ```c
 *  if (sWildEncounterImmunitySteps < 4) {
 *      sWildEncounterImmunitySteps++;
 *      sPrevMetatileBehavior = metatileBehavior;
 *      return FALSE;
 *  }
 *  if (StandardWildEncounter(metatileBehavior, sPrevMetatileBehavior) == TRUE) {
 *      sWildEncounterImmunitySteps = 0;
 *      sPrevMetatileBehavior = metatileBehavior;
 *      return TRUE;
 *  }
 *  sPrevMetatileBehavior = metatileBehavior;
 *  return FALSE;
 *  ```
 *
 *  Used par `ProcessPlayerFieldInput` (= notre PlayerStep step-end). */
export function CheckStandardWildEncounter(metatileBehavior: number): boolean {
  if (sWildEncounterImmunitySteps < 4) {
    sWildEncounterImmunitySteps++;
    sPrevMetatileBehavior = metatileBehavior;
    return false;
  }
  if (StandardWildEncounter(metatileBehavior, sPrevMetatileBehavior)) {
    sWildEncounterImmunitySteps = 0;
    sPrevMetatileBehavior = metatileBehavior;
    return true;
  }
  sPrevMetatileBehavior = metatileBehavior;
  return false;
}

/** Reset l'immunity counter (= called au map switch / new game pour grant les
 *  4 steps initiaux d'immunité). */
export function ResetWildEncounterImmunity(): void {
  sWildEncounterImmunitySteps = 0;
  sPrevMetatileBehavior = 0;
}

// ─── Public API ────────────────────────────────────────────────────────────

/** 1:1 décomp `StandardWildEncounter` (wild_encounter.c:552-666) minimal.
 *
 *  Called by `field_player_avatar.c:CheckForFieldEncounter` au step-end sur
 *  une tile où metatileBehavior est un encounter tile.
 *
 *  Returns true si l'encounter a été triggered (= battle scene start) ;
 *  false sinon (= player continue à walker normalement).
 *
 *  Dettes R3 (= cascade non-portée) :
 *   - Battle Pyramid / Pike wild encounters (lignes 563-591).
 *   - TryStartRoamerEncounter (lignes 604-612).
 *   - DoMassOutbreakEncounterTest + SetUpMassOutbreakEncounter (lignes 615-619).
 *   - Bridge over water = surf encounters (line 632).
 *   - Sweet Scent (= forced encounter via item).
 */
export function StandardWildEncounter(curMetatileBehavior: number, prevMetatileBehavior: number): boolean {
  if (sWildEncountersDisabled) return false;

  const header = GetCurrentMapWildMonHeader();
  if (!header) {
    // Dette R3 : Battle Pyramid / Pike layouts (= LAYOUT_BATTLE_FRONTIER_*).
    return false;
  }

  if (MetatileBehavior_IsLandWildEncounter(curMetatileBehavior)) {
    if (header.landMonsInfo === null) return false;
    if (prevMetatileBehavior !== curMetatileBehavior && !AllowWildCheckOnNewMetatile()) return false;
    if (!WildEncounterCheck(header.landMonsInfo.encounterRate, false)) return false;
    // Dette R3 : TryStartRoamerEncounter (roamer non porté).
    // 1:1 décomp (wild_encounter.c:615-626) : mass outbreak prioritaire, sinon rencontre normale.
    if (DoMassOutbreakEncounterTest() && SetUpMassOutbreakEncounter(WILD_CHECK_REPEL | WILD_CHECK_KEEN_EYE)) {
      _onBattleStartCallback?.();
      return true;
    }
    if (TryGenerateWildMon(header.landMonsInfo, WILD_AREA_LAND, WILD_CHECK_REPEL | WILD_CHECK_KEEN_EYE)) {
      _onBattleStartCallback?.();
      return true;
    }
    return false;
  }

  if (MetatileBehavior_IsWaterWildEncounter(curMetatileBehavior)) {
    if (AreLegendariesInSootopolisPreventingEncounters()) return false;
    if (header.waterMonsInfo === null) return false;
    if (prevMetatileBehavior !== curMetatileBehavior && !AllowWildCheckOnNewMetatile()) return false;
    if (!WildEncounterCheck(header.waterMonsInfo.encounterRate, false)) return false;
    // Dette R3 : TryStartRoamerEncounter.
    if (TryGenerateWildMon(header.waterMonsInfo, WILD_AREA_WATER, WILD_CHECK_REPEL | WILD_CHECK_KEEN_EYE)) {
      _onBattleStartCallback?.();
      return true;
    }
    return false;
  }

  return false;
}

/** Force unused-warning suppression. */
void LAND_WILD_COUNT; void WATER_WILD_COUNT; void ROCK_WILD_COUNT;
