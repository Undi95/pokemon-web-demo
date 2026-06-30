/**
 * engine/pokemon/pokemon.ts — helpers PURS dérivés de l'espèce / du PID (genre).
 *
 * ⚠️ Ce fichier N'EST PLUS un modèle Pokémon. Le 2e modèle `PokemonInstance`
 * (interface string-enum + `createPokemonInstance` + ponts `pokemonToPokemonInstance`/
 * `makePokemonInstanceView` + logique dupliquée exp/EV/évolution) a été SUPPRIMÉ
 * (unification du 2e modèle, 2026-07-02) : le jeu utilise désormais UNIQUEMENT le
 * modèle NUMÉRIQUE décomp (`struct Pokemon`, src/pokemon.ts = pokemon.c).
 *
 * Ne subsistent ici que des helpers de dérivation de GENRE (string-keyés) +
 * 2 conversions string encore consommés par battle_util / pokemon_summary_screen /
 * wild_encounter / party_menu / party-storage. À terme : réconcilier vers le foyer
 * numérique (`GetMonGender`/`GetGenderFromSpeciesAndPersonality` à species id).
 */
import { getSpeciesInfo as gameDataGetSpeciesInfo } from '../data/game-data';

/** Convertit `SPECIES_TREECKO` → `treecko` (id runtime sans séparateur). */
export function speciesEnumToDexId(speciesEnum: string): string {
  return speciesEnum.replace(/^SPECIES_/, '').toLowerCase().replace(/_/g, '');
}
export function moveEnumToDexId(moveEnum: string): string {
  return moveEnum.replace(/^MOVE_/, '').toLowerCase().replace(/_/g, '');
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

/** 1:1 décomp `GetGenderFromSpeciesAndPersonality` (pokemon.c:6080), variante
 *  string-keyée (speciesEnum). Returns MON_MALE / MON_FEMALE / MON_GENDERLESS. */
export function GetGenderFromSpeciesAndPersonality(speciesEnum: string, personality: number): number {
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

/** Helper UI : retourne 'M' | 'F' | null pour le symbole de genre. */
export function getMonGenderSymbol(mon: { monGender?: number; personality?: number; speciesEnum?: string }): 'M' | 'F' | null {
  const g = mon.monGender ?? (mon.personality !== undefined && mon.speciesEnum
    ? GetGenderFromSpeciesAndPersonality(mon.speciesEnum, mon.personality)
    : MON_GENDERLESS);
  if (g === MON_MALE) return 'M';
  if (g === MON_FEMALE) return 'F';
  return null;
}
