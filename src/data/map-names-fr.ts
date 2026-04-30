/**
 * Noms français officiels des zones Pokémon Emeraude.
 * Source : `src/data/region_map/region_map_sections.json` du décomp,
 * extrait par `scripts/extract-map-names-fr.mjs` → `public/decomp/em/map-names-fr.json`
 * (213 zones).
 *
 * `loadMapNamesFr(table)` doit être appelé au boot d'une scène qui consomme
 * ces noms (typiquement OverworldScene.afterMapLoad). Sinon fallback sur
 * la table de secours minimale FALLBACK ci-dessous.
 */

let runtimeTable: Record<string, string> | null = null;

/** Fallback minimal si le JSON n'a pas été chargé. À éviter — load le JSON. */
const FALLBACK: Record<string, string> = {
  MAPSEC_LITTLEROOT_TOWN: 'BOURG-EN-VOL',
  MAPSEC_OLDALE_TOWN: 'ROSYERES',
};

export function loadMapNamesFr(table: Record<string, string>): void {
  runtimeTable = table;
}

export function getMapNameFr(mapsecId: string | undefined): string {
  if (!mapsecId) return '???';
  return runtimeTable?.[mapsecId]
      ?? FALLBACK[mapsecId]
      ?? mapsecId.replace(/^MAPSEC_/, '');
}
