/**
 * Singleton de tables de données chargées depuis le décomp.
 *
 * Chaque scène qui consomme ces tables (typiquement OverworldScene) les
 * charge dans son `preload`, puis appelle les `loadXxx()` depuis son `create`
 * ou `afterMapLoad`. Une fois loaded, les `getXxx()` sont synchrones.
 *
 * Source des JSON : `public/decomp/em/` produits par les `extract-*.mjs`.
 */

// ----- Text tables (text-tables.json) -----
export interface TextTables {
  species: Record<string, string>;
  moves: Record<string, string>;
  trainer_classes: Record<string, string>;
  natures: Record<string, string>;
  item_descriptions: Record<string, string>;
  move_descriptions: Record<string, string>;
  ability_descriptions: Record<string, string>;
}
let textTables: TextTables | null = null;
export function loadTextTables(t: TextTables): void { textTables = t; }
export function getSpeciesNameFr(species: string): string {
  return textTables?.species[species] ?? species.replace(/^SPECIES_/, '');
}
export function getMoveNameFr(move: string): string {
  return textTables?.moves[move] ?? move.replace(/^MOVE_/, '');
}
export function getTrainerClassNameFr(cls: string): string {
  return textTables?.trainer_classes[cls] ?? cls.replace(/^TRAINER_CLASS_/, '');
}
export function getNatureNameFr(nature: string): string {
  return textTables?.natures[nature] ?? nature.replace(/^NATURE_/, '');
}
export function getItemDescriptionFr(label: string): string {
  if (!textTables) return '';
  // 1ère tentative : direct hit (= label déjà en clean form "PokeBall").
  const direct = textTables.item_descriptions[label];
  if (direct) return direct;
  // 2ème tentative : strip prefix `s` + suffix `Desc` du symbol décomp
  // (= "sPokeBallDesc" → "PokeBall"). Convention 1:1 décomp src/data/items.h.
  if (label.startsWith('s') && label.endsWith('Desc')) {
    const cleaned = label.slice(1, -4);
    const stripped = textTables.item_descriptions[cleaned];
    if (stripped) return stripped;
  }
  return '';
}

// ----- Items (items.json) -----
export interface ItemDef {
  name: string;
  price: number;
  pocket: string;
  type?: string;
  descriptionLabel?: string;
  battleUsage?: string;
  holdEffect?: string;
  holdEffectParam?: number;
}
let itemsTable: Record<string, ItemDef> | null = null;
export function loadItemsTable(t: Record<string, ItemDef>): void {
  itemsTable = t;
  // Phase 1.4 J : expose via globalThis pour battle-string-decoder reverse cache.
  (globalThis as Record<string, unknown>).gameDataItems = t;
}
export function getItem(itemId: string): ItemDef | undefined {
  return itemsTable?.[itemId];
}
/** Retourne tous les itemKeys connus du jeu (= clés de items.json).
 *  Skip ITEM_NONE (= placeholder décomp) et ITEM_B_USE_* (= virtual items
 *  battle-only, pas inventory). Utile pour `?nointro` testing visuel. */
export function getAllItemKeys(): string[] {
  if (!itemsTable) return [];
  return Object.keys(itemsTable).filter(k =>
    k !== 'ITEM_NONE' && !k.startsWith('ITEM_B_USE'));
}
export function getItemNameFr(itemId: string): string {
  return itemsTable?.[itemId]?.name ?? itemId.replace(/^ITEM_/, '');
}

// ----- Trainers (trainer-parties.json) -----
export interface TrainerDef {
  trainerClass: string;
  trainerPic: string;
  name: string;             // nom propre du dresseur (ex. "EMILIEN")
  doubleBattle: boolean;
  encounterMusic: string;
  aiFlags: string[];
  items: string[];
  partyType: string | null; // "NoItemDefaultMoves" | etc.
  party: Array<{
    iv: number;
    level: number;
    species: string;
    heldItem?: string;
    moves?: string[];
  }>;
}
let trainersTable: Record<string, TrainerDef> | null = null;
export function loadTrainersTable(t: Record<string, TrainerDef>): void { trainersTable = t; }
export function getTrainer(trainerId: string): TrainerDef | undefined {
  return trainersTable?.[trainerId];
}
export function getTrainerNameFr(trainerId: string): string {
  return trainersTable?.[trainerId]?.name ?? trainerId.replace(/^TRAINER_/, '');
}

// ----- Wild encounters (wild-encounters.json) -----
export interface WildEncounterMon {
  min_level: number;
  max_level: number;
  species: string;
}
export interface MapWildEncounters {
  land?: { encounter_rate: number; mons: WildEncounterMon[] };
  water?: { encounter_rate: number; mons: WildEncounterMon[] };
  rock_smash?: { encounter_rate: number; mons: WildEncounterMon[] };
  fishing?: { encounter_rate: number; mons: WildEncounterMon[] };
}
let wildEncountersTable: { byMap: Record<string, MapWildEncounters>; encounter_rates: Record<string, number[]> } | null = null;
export function loadWildEncountersTable(t: typeof wildEncountersTable): void { wildEncountersTable = t; }
export function getWildEncounters(mapId: string): MapWildEncounters | undefined {
  return wildEncountersTable?.byMap[mapId];
}
export function getEncounterRates(type: 'land' | 'water' | 'rock_smash' | 'fishing'): number[] {
  return wildEncountersTable?.encounter_rates[`${type}_mons`] ?? [];
}

// ----- Metatile labels (metatile-labels.json) -----
let metatileLabels: Record<string, number> | null = null;
export function loadMetatileLabels(t: Record<string, number>): void { metatileLabels = t; }
export function getMetatileId(label: string): number | undefined {
  return metatileLabels?.[label];
}

// ----- Constants (constants.json) -----
export interface ConstantsTable {
  species: Record<string, number>;
  moves: Record<string, number>;
  items: Record<string, number>;
  abilities: Record<string, number>;
  natures: Record<string, number>;
}
let constants: ConstantsTable | null = null;
export function loadConstantsTable(t: ConstantsTable): void { constants = t; }
export function getSpeciesId(enumName: string): number { return constants?.species[enumName] ?? 0; }
export function getMoveId(enumName: string): number { return constants?.moves[enumName] ?? 0; }
export function getItemId(enumName: string): number { return constants?.items[enumName] ?? 0; }
// Pont 1:1-sémantique de l'indexation décomp `gItems[itemId]` (numérique) vers
// notre modèle itemKey-string : inverse de `constants.items` (itemKey→id).
// Map reverse lazy, invalidée si `constants` est rechargé (chargé 1× en
// pratique). Collision d'id → 1re clé gagne (ITEM_NONE=0 inclus). Sert
// CopyItemName/GetItemNameFromPocket/PrintItemDescription (sac, shop, PC…).
let _itemKeyById: Map<number, string> | null = null;
let _itemKeyByIdSrc: ConstantsTable | null = null;
export function getItemKeyById(id: number): string {
  if (!constants) return `ITEM_${id}`;
  if (_itemKeyById === null || _itemKeyByIdSrc !== constants) {
    _itemKeyById = new Map<number, string>();
    for (const k of Object.keys(constants.items)) {
      const v = constants.items[k];
      if (!_itemKeyById.has(v)) _itemKeyById.set(v, k);
    }
    _itemKeyByIdSrc = constants;
  }
  return _itemKeyById.get(id) ?? `ITEM_${id}`;
}
export function getAbilityId(enumName: string): number { return constants?.abilities[enumName] ?? 0; }
export function getNatureId(enumName: string): number { return constants?.natures[enumName] ?? 0; }
