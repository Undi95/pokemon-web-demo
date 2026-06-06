/**
 * game-data.ts — Helpers typed pour accéder aux 21 tables Pokémon extraites
 * (= 1:1 décomp Pokémon Émeraude FR).
 *
 * Architecture :
 *   - `loadGameData()` à call au boot (= async, charge tous les JSON en parallèle).
 *   - Helpers `getXxx(id)` synchrones après load (= no await).
 *   - Tout est lazy/cached : pas de re-fetch.
 *
 * Source de vérité : extracts dans `public/decomp/em/*.json` générés par
 * `scripts/extract-pokemon-data.mjs`.
 *
 * Usage :
 *   await loadGameData();
 *   const stats = getSpeciesInfo('SPECIES_PIKACHU').stats;  // { hp, atk, ... }
 *   const move = getMove('MOVE_THUNDERBOLT');                // power, type, etc.
 *   const name = getMoveName('MOVE_THUNDERBOLT');            // "TONNERRE"
 *   const ability = getAbility('ABILITY_STATIC');            // { name, description }
 */

const BASE = '/decomp/em';

// ─── Types 1:1 décomp ───────────────────────────────────────────────────────

export interface SpeciesStats {
  hp: number; atk: number; def: number; spe: number; spa: number; spd: number;
}

export interface SpeciesInfo {
  stats: SpeciesStats;
  types: [string, string];
  abilities: [string, string];
  eggGroups: [string, string];
  catchRate: number;
  expYield: number;
  genderRatio: string;       // "PERCENT_FEMALE(N)" / "MON_MALE" / "MON_FEMALE" / "MON_GENDERLESS"
  eggCycles: number;
  friendship: number;
  growthRate: string;         // GROWTH_FAST / MEDIUM_FAST / etc.
  itemCommon: string;
  itemRare: string;
  bodyColor: string;
  safariFlee: number;
  /** 1:1 décomp `gSpeciesInfo[].noFlip` — IsMonSpriteNotFlipped (pokemon.c
   *  :6553). Summary CreateMonSprite : `hFlip = !noFlip`. */
  noFlip: boolean;
  evYield: SpeciesStats;
}

export interface MoveData {
  effect: string;             // EFFECT_HIT / EFFECT_BURN_HIT / etc.
  power: number;
  type: string;               // TYPE_NORMAL / etc.
  accuracy: number;
  pp: number;
  secondaryEffectChance: number;
  target: string;
  priority: number;
  flags: string;              // bitwise expr "FLAG_X | FLAG_Y" (= raw décomp string)
}

export interface ContestMove {
  effect: string;
  contestCategory: string;    // CONTEST_CATEGORY_TOUGH / SMART / CUTE / etc.
  comboStarterId: string;
  comboMoves: string[];
}

export interface LevelUpMove { level: number; move: string; }

export interface Evolution { method: string; param: number; target: string; }

export interface AbilityFR { description: string; }

export interface ItemEffect { size: number; fields: Record<string, string>; }

/** 1:1 décomp `gItems[]` (src/data/items.h) — extract-items.mjs →
 *  items.json keyé par ITEM_* enum. `.name` = nom FR (décomp pokeemeraude
 *  FR : "GRAIN MIRACL", "POTION", "HYPER BALL"…). Champs utiles Phase 2 sac. */
export interface ItemData {
  name: string;
  price: number;
  pocket: string;
  type: string;
  descriptionLabel?: string;
  holdEffect?: string;
  holdEffectParam?: number;
  battleUsage?: string;
}

export interface TrainerData {
  partyFlags: string;
  trainerClass: string;
  encounterMusic: string;
  trainerPic: string;
  trainerName: string;
  items: string[];
  doubleBattle: boolean;
  aiFlags: string;
  partySize: number;
}

/** Type effectiveness entry : [attackerType, defenderType, multiplier].
 *  multiplier = "TYPE_MUL_NOT_EFFECTIVE" / "_NO_EFFECT" / "_SUPER_EFFECTIVE". */
export type TypeChartEntry = readonly [string, string, string];

// ─── Module state — lazy-loaded JSONs ───────────────────────────────────────

interface GameData {
  species: Record<string, SpeciesInfo>;
  moves: Record<string, MoveData>;
  moveNamesFr: Record<string, string>;
  moveDescriptionsFr: Record<string, string>;
  levelUpLearnsets: Record<string, LevelUpMove[]>;
  eggMoves: Record<string, string[]>;
  tmhmLearnsets: Record<string, string[]>;
  tutorLearnsets: Record<string, string[]>;
  abilitiesFr: Record<string, AbilityFR>;
  abilityNamesFr: Record<string, string>;
  natureNamesFr: Record<string, string>;
  trainerClassNamesFr: Record<string, string>;
  itemDescriptionsFr: Record<string, string>;
  experienceTables: Record<string, number[]>;
  trainers: Record<string, TrainerData>;
  contestMoves: Record<string, ContestMove>;
  /** 1:1 décomp `gContestEffects[]` (contest_moves.h:2837) keyé par
   *  CONTEST_EFFECT_* — appeal/jam pour les cœurs CHARME/BLOCAGE résumé. */
  contestEffects: Record<string, { appeal: number; jam: number }>;
  /** 1:1 décomp `gContestEffectDescriptionPointers[]` (contest_text_tables
   *  .h:220) keyé CONTEST_EFFECT_* — description d'effet concours affichée
   *  page CAPACITÉS CONCOURS du résumé (PrintMoveDetails branche != BATTLE). */
  contestEffectDescriptionsFr: Record<string, string>;
  /** 1:1 décomp `gItems[]` keyé ITEM_* (items.json, 377 items, noms FR). */
  itemsData: Record<string, ItemData>;
  evolutions: Record<string, Evolution[]>;
  itemEffects: Record<string, ItemEffect>;
  pokedexOrders: Record<string, string[]>;
  trainerClassLookups: { facilityClassToPic: Record<string, string>; facilityClassToTrainerClass: Record<string, string> };
  typeChart: TypeChartEntry[];
}

let _data: GameData | null = null;
let _loadPromise: Promise<void> | null = null;

// ─── Tables id-indexées 1:1 décomp (gSpeciesInfo[] / gSpeciesNames[] / …) ────
// Construites au boot (loadGameData) depuis les Records keyés enum + les modules
// de constantes id (`species-data`). Accès O(1) `gSpeciesInfo[species]` = 1:1
// décomp (`pokemon_summary_screen.c` : `gSpeciesInfo[summary->species]`,
// `gMoveNames[move]`…). PHASE ADDITIVE : les getters enum (`getSpeciesInfo(enum)`
// …) restent intacts → zéro régression sur les call sites non encore migrés.
export const gSpeciesInfo: SpeciesInfo[] = [];
export const gSpeciesNames: string[] = [];
export const sSpeciesToHoennPokedexNum: number[] = [];
export const sSpeciesToNationalPokedexNum: number[] = [];
export const gBattleMoves: MoveData[] = [];
export const gMoveNames: string[] = [];
export const gMoveDescriptions: string[] = [];
export const gContestMoves: ContestMove[] = [];
export const gItems: ItemData[] = [];

async function fetchJson<T>(name: string): Promise<T> {
  const r = await fetch(`${BASE}/${name}`);
  if (!r.ok) throw new Error(`game-data: failed to fetch ${name}: ${r.status}`);
  return r.json() as Promise<T>;
}

/** À call une fois au boot. Idempotent + cache. */
export function loadGameData(): Promise<void> {
  if (_loadPromise) return _loadPromise;
  _loadPromise = (async () => {
    const [
      species, moves, moveNamesFr, moveDescriptionsFr, levelUpLearnsets, eggMoves,
      tmhmLearnsets, tutorLearnsets, abilitiesFr, abilityNamesFr, natureNamesFr,
      trainerClassNamesFr, itemDescriptionsFr, experienceTables, trainers,
      contestMoves, contestEffects, contestEffectDescriptionsFr, itemsData, evolutions, itemEffects, pokedexOrders, trainerClassLookups,
      typeChart,
    ] = await Promise.all([
      fetchJson<GameData['species']>('species-info.json'),
      fetchJson<GameData['moves']>('moves-data.json'),
      fetchJson<GameData['moveNamesFr']>('move-names-fr.json'),
      fetchJson<GameData['moveDescriptionsFr']>('move-descriptions-fr.json'),
      fetchJson<GameData['levelUpLearnsets']>('level-up-learnsets.json'),
      fetchJson<GameData['eggMoves']>('egg-moves.json'),
      fetchJson<GameData['tmhmLearnsets']>('tmhm-learnsets.json'),
      fetchJson<GameData['tutorLearnsets']>('tutor-learnsets.json'),
      fetchJson<GameData['abilitiesFr']>('abilities-fr.json'),
      fetchJson<GameData['abilityNamesFr']>('ability-names-fr.json'),
      fetchJson<GameData['natureNamesFr']>('nature-names-fr.json'),
      fetchJson<GameData['trainerClassNamesFr']>('trainer-class-names-fr.json'),
      fetchJson<GameData['itemDescriptionsFr']>('item-descriptions-fr.json'),
      fetchJson<GameData['experienceTables']>('experience-tables.json'),
      fetchJson<GameData['trainers']>('trainers.json'),
      fetchJson<GameData['contestMoves']>('contest-moves.json'),
      fetchJson<GameData['contestEffects']>('contest-effects.json'),
      fetchJson<GameData['contestEffectDescriptionsFr']>('contest-effect-descriptions-fr.json'),
      fetchJson<GameData['itemsData']>('items.json'),
      fetchJson<GameData['evolutions']>('evolutions.json'),
      fetchJson<GameData['itemEffects']>('item-effects.json'),
      fetchJson<GameData['pokedexOrders']>('pokedex-orders.json'),
      fetchJson<GameData['trainerClassLookups']>('trainer-class-lookups.json'),
      fetchJson<GameData['typeChart']>('type-chart.json'),
    ]);
    _data = {
      species, moves, moveNamesFr, moveDescriptionsFr, levelUpLearnsets, eggMoves,
      tmhmLearnsets, tutorLearnsets, abilitiesFr, abilityNamesFr, natureNamesFr,
      trainerClassNamesFr, itemDescriptionsFr, experienceTables, trainers,
      contestMoves, contestEffects, contestEffectDescriptionsFr, itemsData, evolutions, itemEffects, pokedexOrders, trainerClassLookups,
      typeChart,
    };
    // 1:1 décomp bridge : expose moves/species pour reverse-id lookups (= cache
    // utilisé par battle-string-decoder pour numeric move id → MOVE_X enum).
    (globalThis as Record<string, unknown>).gameDataMoves = moves;
    (globalThis as Record<string, unknown>).gameDataSpecies = species;
    (globalThis as Record<string, unknown>).gameDataAbilityNamesFr = abilityNamesFr;
    (globalThis as Record<string, unknown>).gameDataItemDescriptionsFr = itemDescriptionsFr;
    // 1:1 décomp bridge : expose trainers + trainer class names FR pour
    // battle-string-decoder placeholder {B_TRAINER1_CLASS}/{B_TRAINER1_NAME}.
    (globalThis as Record<string, unknown>).gameDataTrainers = trainers;
    (globalThis as Record<string, unknown>).gameDataTrainerClassesFr = trainerClassNamesFr;
    // 1:1 décomp bridge : expose levelUpLearnsets pour MonTryLearningNewMove
    // (= cmd-niveau-32.ts Cmd_handlelearnnewmove) + reverse cache species
    // number → enum string pour lookup.
    (globalThis as Record<string, unknown>).gameDataLevelUpLearnsets = levelUpLearnsets;
    // Build species number → enum reverse cache via species-data constants.
    const speciesMod = await import('../decomp-data/include/constants/species-data');
    const speciesNumToEnum: Record<number, string> = {};
    for (const [key, val] of Object.entries(speciesMod)) {
      if (key.startsWith('SPECIES_') && typeof val === 'number') {
        if (!(val in speciesNumToEnum)) speciesNumToEnum[val] = key;
      }
    }
    (globalThis as Record<string, unknown>).gameDataSpeciesNumToEnum = speciesNumToEnum;
    // Build moves number → enum reverse cache via moves-data constants
    // (= utile pour MonTryLearningNewMove + battle-string-decoder).
    const movesMod = await import('../decomp-data/include/constants/moves-data');
    const movesNumToEnum: Record<number, string> = {};
    for (const [key, val] of Object.entries(movesMod)) {
      if (key.startsWith('MOVE_') && typeof val === 'number') {
        if (!(val in movesNumToEnum)) movesNumToEnum[val] = key;
      }
    }
    (globalThis as Record<string, unknown>).gameDataMovesNumToEnum = movesNumToEnum;
    // ─── F1 — tables id-indexées species (1:1 décomp gSpeciesInfo[] /
    //     gSpeciesNames[] / sSpeciesToHoennPokedexNum[]). ADDITIF. ───────────
    {
      let textSpeciesNames: Record<string, string> = {};
      let dexNums: Record<string, { national: number; hoenn: number } | number> = {};
      try {
        const [textJson, dexJson] = await Promise.all([
          fetchJson<{ species?: Record<string, string> }>('text-tables.json'),
          fetchJson<Record<string, { national: number; hoenn: number } | number>>('species-dex-numbers.json'),
        ]);
        textSpeciesNames = textJson?.species ?? {};
        dexNums = dexJson ?? {};
      } catch (e) {
        console.error('[game-data] F1 species id-tables: aux fetch failed', e);
      }
      gSpeciesInfo.length = 0; gSpeciesNames.length = 0;
      sSpeciesToHoennPokedexNum.length = 0; sSpeciesToNationalPokedexNum.length = 0;
      const speciesIds = speciesMod as unknown as Record<string, unknown>;
      for (const [enumKey, info] of Object.entries(species)) {
        const id = speciesIds[enumKey];
        if (typeof id !== 'number') continue;
        gSpeciesInfo[id] = info;
        gSpeciesNames[id] = textSpeciesNames[enumKey] ?? enumKey.replace(/^SPECIES_/, '');
      }
      for (const [enumKey, e] of Object.entries(dexNums)) {
        if (enumKey === '__HOENN_DEX_COUNT' || !e || typeof e !== 'object') continue;
        const id = speciesIds[enumKey];
        if (typeof id !== 'number') continue;
        sSpeciesToHoennPokedexNum[id] = e.hoenn;
        sSpeciesToNationalPokedexNum[id] = e.national;
      }
      (globalThis as Record<string, unknown>).gSpeciesInfo = gSpeciesInfo;
      (globalThis as Record<string, unknown>).gSpeciesNames = gSpeciesNames;
      (globalThis as Record<string, unknown>).sSpeciesToHoennPokedexNum = sSpeciesToHoennPokedexNum;
      (globalThis as Record<string, unknown>).sSpeciesToNationalPokedexNum = sSpeciesToNationalPokedexNum;
      console.log(`[game-data] F1 id-tables built — gSpeciesInfo[${gSpeciesInfo.filter(Boolean).length}], ` +
        `dex hoenn[${sSpeciesToHoennPokedexNum.filter((n) => n).length}]`);
    }
    // ─── F2 — tables id-indexées moves (1:1 décomp gBattleMoves[] /
    //     gMoveNames[] / descriptions / contest). ADDITIF. ──────────────────
    {
      gBattleMoves.length = 0; gMoveNames.length = 0;
      gMoveDescriptions.length = 0; gContestMoves.length = 0;
      const moveIds = movesMod as unknown as Record<string, unknown>;
      for (const [enumKey, data] of Object.entries(moves)) {
        const id = moveIds[enumKey];
        if (typeof id !== 'number') continue;
        gBattleMoves[id] = data;
        gMoveNames[id] = moveNamesFr[enumKey] ?? enumKey.replace(/^MOVE_/, '');
        gMoveDescriptions[id] = moveDescriptionsFr[enumKey] ?? '';
        const cm = contestMoves[enumKey];
        if (cm) gContestMoves[id] = cm;
      }
      (globalThis as Record<string, unknown>).gBattleMoves = gBattleMoves;
      (globalThis as Record<string, unknown>).gMoveNames = gMoveNames;
      (globalThis as Record<string, unknown>).gContestMoves = gContestMoves;
      console.log(`[game-data] F2 id-tables built — gBattleMoves[${gBattleMoves.filter(Boolean).length}], ` +
        `gMoveNames, contest[${gContestMoves.filter(Boolean).length}]`);
    }
    // ─── F3 — tables id-indexées items (1:1 décomp gItems[] / ItemId_GetName).
    //     Ids items via resolveDecompConstant (pas de module items-data). ADDITIF.
    {
      const { resolveDecompConstant } = await import('../system/decomp-constants');
      gItems.length = 0;
      for (const [enumKey, data] of Object.entries(itemsData)) {
        const id = resolveDecompConstant(enumKey);
        if (typeof id !== 'number') continue;
        gItems[id] = data;
      }
      (globalThis as Record<string, unknown>).gItems = gItems;
      console.log(`[game-data] F3 id-tables built — gItems[${gItems.filter(Boolean).length}]`);
    }
    console.log(`[game-data] loaded — ${Object.keys(species).length} species, ` +
      `${Object.keys(moves).length} moves, ${Object.keys(trainers).length} trainers, ` +
      `${typeChart.length} type-chart entries`);
  })();
  return _loadPromise;
}

function ensureLoaded(): GameData {
  if (!_data) throw new Error('game-data: call loadGameData() first');
  return _data;
}

// ─── Public getters ─────────────────────────────────────────────────────────

export function getSpeciesInfo(speciesId: string): SpeciesInfo | undefined {
  return ensureLoaded().species[speciesId];
}

// ─── Accès id-keyés 1:1 décomp (species) ────────────────────────────────────
/** 1:1 décomp `SpeciesToNationalPokedexNum(species)` (pokedex.c) via la table
 *  `sSpeciesToNationalPokedexNum[species]`. 0 si hors table. */
export function SpeciesToNationalPokedexNum(species: number): number {
  return sSpeciesToNationalPokedexNum[species] ?? 0;
}
/** 1:1 décomp `SpeciesToHoennPokedexNum(species)` (pokedex.c) via la table
 *  `sSpeciesToHoennPokedexNum[species]`. 0 si hors Hoenn dex. */
export function SpeciesToHoennPokedexNum(species: number): number {
  return sSpeciesToHoennPokedexNum[species] ?? 0;
}
/** 1:1 décomp `ItemId_GetName(itemId)` = `gItems[itemId].name` (nom FR). */
export function ItemId_GetName(itemId: number): string {
  return gItems[itemId]?.name ?? '';
}

export function getMove(moveId: string): MoveData | undefined {
  return ensureLoaded().moves[moveId];
}

/** Returns FR localized move name (= e.g. "TONNERRE"). */
export function getMoveName(moveId: string): string {
  return ensureLoaded().moveNamesFr[moveId] ?? moveId;
}

/** Returns FR localized move description. */
export function getMoveDescription(moveId: string): string {
  return ensureLoaded().moveDescriptionsFr[moveId] ?? '';
}

/** Returns level-up movepool [{level, move}, ...] sorted by level. */
export function getLevelUpLearnset(speciesId: string): LevelUpMove[] {
  return ensureLoaded().levelUpLearnsets[speciesId] ?? [];
}

/** Returns liste des moves apprenables via egg breeding. */
export function getEggMoves(speciesId: string): string[] {
  return ensureLoaded().eggMoves[speciesId] ?? [];
}

/** Returns liste des TM/HM (= e.g. "TOXIC", "BULLET_SEED") apprenables. */
export function getTmhmLearnset(speciesId: string): string[] {
  return ensureLoaded().tmhmLearnsets[speciesId] ?? [];
}

/** Returns liste des MOVE_X apprenables via tutor. */
export function getTutorLearnset(speciesId: string): string[] {
  return ensureLoaded().tutorLearnsets[speciesId] ?? [];
}

export function getAbility(abilityId: string): { name: string; description: string } {
  const d = ensureLoaded();
  return {
    name: d.abilityNamesFr[abilityId] ?? abilityId,
    description: d.abilitiesFr[abilityId]?.description ?? '',
  };
}

export function getNatureName(natureId: string): string {
  return ensureLoaded().natureNamesFr[natureId] ?? natureId;
}

/** 1:1 décomp `gNatureNamePointers[nature]` — nature indexée 0..24 (= ordre
 *  enum NATURE_HARDY=0 … NATURE_QUIRKY=24). `nature-names-fr.json` est extrait
 *  dans cet ordre exact (clés `NATURE_*` en ordre enum), donc `Object.values`
 *  [idx] = le nom FR 1:1 (zéro hardcode de l'enum). Utilisé par
 *  BufferNatureString (pokemon_summary_screen.c:3176). */
export function getNatureNameByIndex(natureIndex: number): string {
  const vals = Object.values(ensureLoaded().natureNamesFr);
  return vals[natureIndex] ?? '';
}

export function getTrainerClassName(classId: string): string {
  return ensureLoaded().trainerClassNamesFr[classId] ?? classId;
}

export function getItemDescription(itemKey: string): string {
  return ensureLoaded().itemDescriptionsFr[itemKey] ?? '';
}

/** Returns total XP required to reach `level` for a given growth rate. */
export function getExperienceForLevel(growthRate: string, level: number): number {
  const table = ensureLoaded().experienceTables[growthRate];
  if (!table) return 0;
  return table[Math.max(0, Math.min(level, table.length - 1))] ?? 0;
}

export function getTrainer(trainerId: string): TrainerData | undefined {
  return ensureLoaded().trainers[trainerId];
}

export function getContestMove(moveId: string): ContestMove | undefined {
  return ensureLoaded().contestMoves[moveId];
}

/** 1:1 décomp `gContestEffects[effect]` — appeal/jam (cœurs résumé). */
export function getContestEffect(effectName: string): { appeal: number; jam: number } | undefined {
  return ensureLoaded().contestEffects[effectName];
}

/** 1:1 décomp `gContestEffectDescriptionPointers[effect]` — description
 *  d'effet concours (page CAPACITÉS CONCOURS, PrintMoveDetails branche
 *  != PSS_PAGE_BATTLE_MOVES). `effectName` = CONTEST_EFFECT_* (=
 *  getContestMove(move).effect). '' si absent (report honnête). */
export function getContestEffectDescription(effectName: string): string {
  return ensureLoaded().contestEffectDescriptionsFr[effectName] ?? '';
}

/** 1:1 décomp `gItems[item]` — items.json keyé ITEM_*. */
export function getItemData(itemEnum: string): ItemData | undefined {
  return ensureLoaded().itemsData[itemEnum];
}

let _itemDexIdToEnum: Record<string, string> | null = null;
/** 1:1 décomp `CopyItemName(item)` = `gItems[item].name` (nom FR). Accepte
 *  l'enum ITEM_X OU le dexId ("miracleseed", = itemEnumToDexId, format
 *  PokemonInstance.heldItem). "" → "" (l'appelant gère gText_None). */
export function getItemNameFr(itemEnumOrDexId: string): string {
  if (!itemEnumOrDexId) return '';
  const d = ensureLoaded();
  if (itemEnumOrDexId.startsWith('ITEM_')) return d.itemsData[itemEnumOrDexId]?.name ?? itemEnumOrDexId;
  if (!_itemDexIdToEnum) {
    _itemDexIdToEnum = {};
    for (const k of Object.keys(d.itemsData)) {
      // = itemEnumToDexId (pokemon.ts) : ITEM_ retiré, lowercase, _ retirés.
      _itemDexIdToEnum[k.replace(/^ITEM_/, '').toLowerCase().replace(/_/g, '')] = k;
    }
  }
  const en = _itemDexIdToEnum[itemEnumOrDexId];
  return en ? (d.itemsData[en]?.name ?? en) : itemEnumOrDexId;
}

export function getEvolutions(speciesId: string): Evolution[] {
  return ensureLoaded().evolutions[speciesId] ?? [];
}

export function getItemEffect(itemKey: string): ItemEffect | undefined {
  return ensureLoaded().itemEffects[itemKey];
}

/** Returns NATIONAL_DEX_X array for a given order (= "Alphabetical", "Weight",
 *  "Height", "NationalDexNumber", "AlphabeticalRSE", etc.). */
export function getPokedexOrder(orderName: string): string[] {
  return ensureLoaded().pokedexOrders[orderName] ?? [];
}

/** Returns the type-chart entries (= [att, def, mul] tuples). */
export function getTypeChart(): readonly TypeChartEntry[] {
  return ensureLoaded().typeChart;
}

/** Compute type effectiveness multiplier (= 0/0.5/1/2) du single type vs
 *  attacker. Returns 1 si pas de match (= neutral). */
export function getTypeMultiplier(attackerType: string, defenderType: string): number {
  const chart = ensureLoaded().typeChart;
  for (const [att, def, mul] of chart) {
    if (att === attackerType && def === defenderType) {
      if (mul === 'TYPE_MUL_NO_EFFECT') return 0;
      if (mul === 'TYPE_MUL_NOT_EFFECTIVE') return 0.5;
      if (mul === 'TYPE_MUL_SUPER_EFFECTIVE') return 2;
    }
  }
  return 1;  // neutral / no entry = 1× damage
}

// ─── Combined helpers (= QoL) ───────────────────────────────────────────────

/** Returns "VENUSAUR" (= EN species id without prefix). FR name should be
 *  fetched via text-tables.json. */
export function getSpeciesIdShort(speciesId: string): string {
  return speciesId.replace(/^SPECIES_/, '');
}

/** Returns le combo name+desc d'un move (= utile pour Pokédex / battle UI). */
export function getMoveFullInfo(moveId: string): { id: string; name: string; description: string; data: MoveData | undefined } {
  return {
    id: moveId,
    name: getMoveName(moveId),
    description: getMoveDescription(moveId),
    data: getMove(moveId),
  };
}

// ─── Devtools ───────────────────────────────────────────────────────────────

/** Install `dev.dex` helper sur globalThis pour debug. */
export function installDexDevtools(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dev = (globalThis as any).dev = (globalThis as any).dev ?? {};
  dev.dex = {
    species: getSpeciesInfo,
    move: getMove,
    moveName: getMoveName,
    learnset: getLevelUpLearnset,
    egg: getEggMoves,
    tmhm: getTmhmLearnset,
    tutor: getTutorLearnset,
    ability: getAbility,
    nature: getNatureName,
    trainer: getTrainer,
    trainerClass: getTrainerClassName,
    item: getItemDescription,
    itemEffect: getItemEffect,
    contest: getContestMove,
    evolutions: getEvolutions,
    expFor: getExperienceForLevel,
    typeMul: getTypeMultiplier,
    order: getPokedexOrder,
    /** Helper combiné : print summary d'une species. */
    info: (speciesId: string) => {
      const s = getSpeciesInfo(speciesId);
      if (!s) return `unknown ${speciesId}`;
      const evos = getEvolutions(speciesId);
      const learn = getLevelUpLearnset(speciesId).slice(0, 5);
      return {
        types: s.types, abilities: s.abilities,
        stats: s.stats, growthRate: s.growthRate,
        first5Moves: learn.map(m => `Lv${m.level} ${getMoveName(m.move)}`),
        evolutions: evos.map(e => `${e.method} → ${e.target}`),
      };
    },
  };
  console.log('[game-data] dev.dex installed (try: dev.dex.info("SPECIES_PIKACHU"))');
}
