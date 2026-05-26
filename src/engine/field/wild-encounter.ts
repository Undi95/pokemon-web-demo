/**
 * wild-encounter.ts — Port 1:1 strict `src/wild_encounter.c` (= ~700l C).
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

import { Random } from '../system/random';
import { gSaveBlock1Ptr } from '../save/save-block-state';
import { gMapHeader } from './map-loader';
import { startWildBattle } from '../battle/battle-flow';
import {
  MetatileBehavior_IsLandWildEncounter,
  MetatileBehavior_IsWaterWildEncounter,
} from './metatile-behavior';

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
// const WILD_CHECK_REPEL    = 1 << 0;  // Dette R3 : Repel system
// const WILD_CHECK_KEEN_EYE = 1 << 1;  // Dette R3 : KeenEye ability

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

/** Init data depuis fetched JSON. À call au boot AVANT premier StandardWildEncounter. */
export function InitWildEncountersFromJson(jsonData: unknown): void {
  _gWildMonHeaders = new Map();
  const data = jsonData as {
    byMap?: Record<string, {
      land?: { encounter_rate: number; mons: Array<{ min_level: number; max_level: number; species: string }> };
      water?: { encounter_rate: number; mons: Array<{ min_level: number; max_level: number; species: string }> };
      rock_smash?: { encounter_rate: number; mons: Array<{ min_level: number; max_level: number; species: string }> };
      fishing?: { encounter_rate: number; mons: Array<{ min_level: number; max_level: number; species: string }> };
    }>;
  };
  if (!data.byMap) return;
  for (const [mapId, entry] of Object.entries(data.byMap)) {
    const convertMons = (e: { encounter_rate: number; mons: Array<{ min_level: number; max_level: number; species: string }> } | undefined): WildPokemonInfo | null => {
      if (!e) return null;
      return {
        encounterRate: e.encounter_rate,
        wildPokemon: e.mons.map(m => ({ minLevel: m.min_level, maxLevel: m.max_level, species: m.species })),
      };
    };
    _gWildMonHeaders.set(mapId, {
      mapId,
      landMonsInfo:       convertMons(entry.land),
      waterMonsInfo:      convertMons(entry.water),
      rockSmashMonsInfo:  convertMons(entry.rock_smash),
      fishingMonsInfo:    convertMons(entry.fishing),
    });
  }
  console.log(`[wild-encounter] loaded ${_gWildMonHeaders.size} map encounters`);
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
function ChooseWildMonIndex_Land(): number {
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
function ChooseWildMonIndex_WaterRock(): number {
  const rand = Random() % ENCOUNTER_CHANCE_WATER_MONS_TOTAL;
  if (rand < ENCOUNTER_CHANCE_WATER_MONS_SLOT_0) return 0;
  else if (rand >= ENCOUNTER_CHANCE_WATER_MONS_SLOT_0 && rand < ENCOUNTER_CHANCE_WATER_MONS_SLOT_1) return 1;
  else if (rand >= ENCOUNTER_CHANCE_WATER_MONS_SLOT_1 && rand < ENCOUNTER_CHANCE_WATER_MONS_SLOT_2) return 2;
  else if (rand >= ENCOUNTER_CHANCE_WATER_MONS_SLOT_2 && rand < ENCOUNTER_CHANCE_WATER_MONS_SLOT_3) return 3;
  else return 4;
}

/** 1:1 décomp `ChooseWildMonLevel` (wild_encounter.c:268-303).
 *  Min/max swap si inversés + Random range. Dette R3 : check ability
 *  HUSTLE/VITAL_SPIRIT/PRESSURE (= max level boost) non porté. */
function ChooseWildMonLevel(wildPokemon: WildPokemon): number {
  let min: number, max: number;
  if (wildPokemon.maxLevel >= wildPokemon.minLevel) {
    min = wildPokemon.minLevel;
    max = wildPokemon.maxLevel;
  } else {
    min = wildPokemon.maxLevel;
    max = wildPokemon.minLevel;
  }
  const range = max - min + 1;
  const rand = Random() % range;
  // Dette R3 : ability check (HUSTLE/VITAL_SPIRIT/PRESSURE) max level boost
  // non portée. Le check requiert GetMonAbility(gPlayerParty[0]) + MON_DATA_*
  // cascade. Cf. wild_encounter.c:289-301.
  return min + rand;
}

/** 1:1 décomp `GetCurrentMapWildMonHeaderId` (wild_encounter.c:305-333).
 *  Notre web port : lookup direct par mapId au lieu d'itérer un array de
 *  WildPokemonHeader avec mapGroup+mapNum. Comportement équivalent. */
function GetCurrentMapWildMonHeader(): WildPokemonHeader | null {
  if (!_gWildMonHeaders) return null;
  const mapId = gMapHeader?.id ?? '';
  return _gWildMonHeaders.get(mapId) ?? null;
  // Dette R3 : ALTERING_CAVE alteringCaveId += VAR_ALTERING_CAVE_WILD_SET
  // (= 9 tables alternative, hors-démo).
}

/** 1:1 décomp `EncounterOddsCheck` (wild_encounter.c:493-499). */
function EncounterOddsCheck(encounterRate: number): boolean {
  return (Random() % MAX_ENCOUNTER_RATE) < encounterRate;
}

/** 1:1 décomp `WildEncounterCheck` (wild_encounter.c:502-529) minimal.
 *  Returns true si l'encounter doit trigger. */
function WildEncounterCheck(encounterRate: number, _ignoreAbility: boolean): boolean {
  let er = encounterRate * 16;
  // Dette R3 : Bike (PLAYER_AVATAR_FLAG_MACH_BIKE/ACRO_BIKE) → er *= 0.8.
  // Dette R3 : ApplyFluteEncounterRateMod + ApplyCleanseTagEncounterRateMod.
  // Dette R3 : Ability mods STENCH/ILLUMINATE/WHITE_SMOKE/ARENA_TRAP/SAND_VEIL.
  if (er > MAX_ENCOUNTER_RATE) er = MAX_ENCOUNTER_RATE;
  return EncounterOddsCheck(er);
}

/** 1:1 décomp `AllowWildCheckOnNewMetatile` (wild_encounter.c:533-538) :
 *    if (Random() % 100 >= 60) return FALSE; else return TRUE;
 *  → 40% skip sur tile change (= step sur tile type différent). */
function AllowWildCheckOnNewMetatile(): boolean {
  return (Random() % 100) < 60;
}

/** 1:1 décomp `AreLegendariesInSootopolisPreventingEncounters` (wild_encounter.c:541-550).
 *  Sootopolis pre-Wallace event : encounters disabled si legendaries présents. */
function AreLegendariesInSootopolisPreventingEncounters(): boolean {
  // Dette R3 : FLAG_LEGENDARIES_IN_SOOTOPOLIS + Sootopolis check. Hors-démo.
  // Always returns false → encounters allowed by default.
  return false;
}

/** 1:1 décomp `CreateWildMon` (wild_encounter.c:379-415).
 *  Notre TS : `startWildBattle` (battle-flow.ts) gère ZeroEnemyPartyMons +
 *  CreateMonWithNature internally. Donc on passe juste species + level. */
function CreateWildMon(species: string, level: number): void {
  // Dette R3 : Cute Charm gender bias check (lignes 394-412).
  // Notre TS : startWildBattle accepte (opponentSpecies, opponentLevel).
  // PickWildMonNature (= dette R3) est aussi géré internally par startWildBattle.
  startWildBattle({ opponentSpecies: species, opponentLevel: level });
}

/** 1:1 décomp `TryGenerateWildMon` (wild_encounter.c:422-456) minimal.
 *  Returns TRUE si encounter setup (= CreateWildMon appelé). */
function TryGenerateWildMon(wildMonInfo: WildPokemonInfo, area: number, _flags: number): boolean {
  let wildMonIndex = 0;
  switch (area) {
    case WILD_AREA_LAND:
      // Dette R3 : TryGetAbilityInfluencedWildMonIndex (= Magnet Pull/Static).
      wildMonIndex = ChooseWildMonIndex_Land();
      break;
    case WILD_AREA_WATER:
      // Dette R3 : TryGetAbilityInfluencedWildMonIndex (= Static).
      wildMonIndex = ChooseWildMonIndex_WaterRock();
      break;
    case WILD_AREA_ROCKS:
      wildMonIndex = ChooseWildMonIndex_WaterRock();
      break;
  }
  const level = ChooseWildMonLevel(wildMonInfo.wildPokemon[wildMonIndex]);
  // Dette R3 : WILD_CHECK_REPEL → IsWildLevelAllowedByRepel(level).
  // Dette R3 : WILD_CHECK_KEEN_EYE → IsAbilityAllowingEncounter(level).
  CreateWildMon(wildMonInfo.wildPokemon[wildMonIndex].species, level);
  return true;
}

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
  void prevMetatileBehavior; void gSaveBlock1Ptr;  // Reserved for future dettes (Sootopolis check, etc.)
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
    // Dette R3 : TryStartRoamerEncounter + DoMassOutbreakEncounterTest.
    if (TryGenerateWildMon(header.landMonsInfo, WILD_AREA_LAND, 0)) {
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
    if (TryGenerateWildMon(header.waterMonsInfo, WILD_AREA_WATER, 0)) {
      _onBattleStartCallback?.();
      return true;
    }
    return false;
  }

  return false;
}

/** Force unused-warning suppression. */
void LAND_WILD_COUNT; void WATER_WILD_COUNT; void ROCK_WILD_COUNT;
