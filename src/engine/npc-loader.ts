/**
 * Lit les `object_events` d'une map.json de pokeemeraude et renvoie la liste
 * des NPCs à spawner. Résout chaque `graphics_id` via
 * `object-event-graphics.json` (mapping gfxId → PNG + dimensions).
 */

export interface ObjectEventRaw {
  local_id?: string;
  graphics_id: string;
  x: number;
  y: number;
  elevation: number;
  movement_type: string;
  movement_range_x: number;
  movement_range_y: number;
  trainer_type: string;
  trainer_sight_or_berry_tree_id: string;
  script: string;
  flag: string;
}

export interface MapJson {
  id: string;
  name: string;
  layout: string;
  music?: string;
  region_map_section?: string;
  weather?: string;
  map_type?: string;
  connections?: Array<{ map: string; offset: number; direction: string }>;
  object_events: ObjectEventRaw[];
  warp_events?: Array<{ x: number; y: number; elevation: number; dest_map: string; dest_warp_id: string }>;
  coord_events?: unknown[];
  bg_events?: Array<{ type: string; x: number; y: number; script?: string }>;
}

export interface GraphicsInfo {
  png: string;            // relatif à /decomp/em/
  frameWidth: number;
  frameHeight: number;
  displayWidth: number;
  displayHeight: number;
}

export type GraphicsTable = Record<string, GraphicsInfo>;

export interface ResolvedNpc {
  raw: ObjectEventRaw;
  gfx: GraphicsInfo;
  textureKey: string;     // clé à utiliser dans Phaser (après transparence)
  sourceTextureKey: string; // clé brute du spritesheet chargé
  spriteUrl: string;      // URL absolue pour le loader Phaser
}

/**
 * Résout les object_events d'une map en NPCs prêts à être chargés/affichés.
 * Ne fait AUCUN chargement réseau — renvoie juste les URLs à passer au loader
 * de la scène.
 *
 * @param map  Le contenu JSON de la map (data/maps/<Name>/map.json du décomp).
 * @param table Le mapping gfxId → GraphicsInfo (object-event-graphics.json).
 * @param baseUrl URL de base des assets (typ. "/decomp/em").
 */
export function resolveNpcs(
  map: MapJson,
  table: GraphicsTable,
  baseUrl = '/decomp/em'
): ResolvedNpc[] {
  const out: ResolvedNpc[] = [];
  for (const ev of map.object_events ?? []) {
    // Les FLAG_HIDE_* sont UNSET au début du jeu = NPC visible par défaut.
    // Plus tard, quand on aura un système de flags, on checkera si le flag
    // est set pour masquer. Pour l'instant : tout montrer.
    const gfx = table[ev.graphics_id];
    if (!gfx) continue; // gfx non résolu (item ball, berry tree, etc.) — ignoré

    const sourceKey = `npc-src-${ev.graphics_id}`;
    const textureKey = `npc-${ev.graphics_id}`;
    out.push({
      raw: ev,
      gfx,
      sourceTextureKey: sourceKey,
      textureKey,
      spriteUrl: `${baseUrl}/${gfx.png}`
    });
  }
  return out;
}
