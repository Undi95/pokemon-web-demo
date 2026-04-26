/**
 * Coordonnées sprites Pokémon en combat (back/front) — extraites du décomp.
 *
 * Utilité critique : les sprites GBA sont dans une frame 64×64 mais le sprite
 * réel n'occupe pas toute la frame. Le `y_offset` indique combien de px entre
 * le bas du sprite réel et le bas de la frame.
 *
 * Exemple :
 *   - Caterpie y_offset=15 → sprite tout en bas (statique au sol)
 *   - Pidgeot front y_offset=1 → sprite tout en haut (volant)
 *   - Bulbasaur back y_offset=16 → sprite plutôt bas
 *
 * Sans ces coords, tous les sprites sont alignés bas → les Pokémon volants
 * apparaissent flottant trop bas (incohérent visuellement).
 *
 * Cf. `src/data/pokemon_graphics/{front,back}_pic_coordinates.h` du décomp.
 */

export interface MonCoord {
  w: number;       // largeur réelle sprite (multiple de 8)
  h: number;       // hauteur réelle sprite
  yOffset: number; // px entre bas du sprite et bas frame 64×64
}

export interface MonCoordPair {
  back: MonCoord | null;   // sprite vu de dos (côté joueur)
  front: MonCoord | null;  // sprite vu de face (côté ennemi)
}

let cache: Record<string, MonCoordPair> | null = null;

/** Init synchrone depuis le cache Phaser (load via `scene.load.json` en preload). */
export function setMonPicCoordsCache(data: Record<string, MonCoordPair> | null): void {
  if (data && !cache) cache = data;
}

/** Variante async (fetch direct) pour cas hors Phaser scene preload. */
export async function loadMonPicCoords(baseUrl = '/decomp/em'): Promise<void> {
  if (cache) return;
  try {
    const r = await fetch(`${baseUrl}/mon-pic-coords.json`);
    cache = await r.json();
  } catch (e) {
    console.warn('[mon-pic-coords] load fail:', e);
    cache = {};
  }
}

/**
 * Récupère les coords pour un species (canonical name OU enum SPECIES_X).
 * Pour le compose lazy, garantit qu'on retourne `{w:64,h:64,yOffset:0}` par
 * défaut si le species n'est pas dans le mapping.
 */
export function getMonCoord(species: string, kind: 'back' | 'front'): MonCoord {
  if (!cache) {
    return { w: 64, h: 64, yOffset: 0 };
  }
  // Accept "Poochyena" → "SPECIES_POOCHYENA"
  const enumName = species.startsWith('SPECIES_')
    ? species
    : 'SPECIES_' + species.toUpperCase().replace(/[\s-]/g, '_');
  const pair = cache[enumName];
  if (!pair) return { w: 64, h: 64, yOffset: 0 };
  return pair[kind] ?? { w: 64, h: 64, yOffset: 0 };
}
