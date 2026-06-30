/**
 * engine/pokemon/pokemon.ts — convertisseurs d'id runtime string (espèce / move).
 *
 * ⚠️ Ce fichier N'EST PLUS un modèle Pokémon, ni un foyer de genre. Le 2e modèle
 * `PokemonInstance` PUIS les helpers de GENRE string-keyés ont été dissous
 * (unification du 2e modèle, 2026-07-02) : le jeu utilise UNIQUEMENT le modèle
 * NUMÉRIQUE décomp (`struct Pokemon`, src/pokemon.ts = pokemon.c). Le genre passe
 * désormais par le foyer numérique 1:1
 * `GetGenderFromSpeciesAndPersonality(species:number, personality)` (src/pokemon.ts),
 * re-exporté par `engine/battle/data/species-runtime` (chemin battle-safe).
 *
 * Ne subsistent ici que 2 convertisseurs d'id runtime (enum string → dexId sans
 * séparateur), consommés par `engine/battle/party-storage` (pont assets/runtime web).
 */

/** Convertit `SPECIES_TREECKO` → `treecko` (id runtime sans séparateur). */
export function speciesEnumToDexId(speciesEnum: string): string {
  return speciesEnum.replace(/^SPECIES_/, '').toLowerCase().replace(/_/g, '');
}
export function moveEnumToDexId(moveEnum: string): string {
  return moveEnum.replace(/^MOVE_/, '').toLowerCase().replace(/_/g, '');
}
