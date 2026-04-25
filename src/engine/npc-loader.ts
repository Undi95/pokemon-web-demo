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
  show_map_name?: boolean;
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
  /** true si le NPC doit être hidden au spawn (flag de masquage set).
   *  On le spawn quand même pour que `addobject` puisse le show plus tard. */
  hiddenAtSpawn: boolean;
}

/**
 * Résout les object_events d'une map en NPCs prêts à être chargés/affichés.
 * Filtre les NPCs dont le flag de masquage (FLAG_HIDE_*) est set dans le
 * gameState (correspond au comportement décomp).
 *
 * @param map  Le contenu JSON de la map.
 * @param table Le mapping gfxId → GraphicsInfo.
 * @param hasFlag Callback pour checker si un flag est set (typiquement gameState.hasFlag).
 * @param baseUrl URL de base des assets.
 */
export function resolveNpcs(
  map: MapJson,
  table: GraphicsTable,
  hasFlag: (flagName: string) => boolean = () => false,
  getObjectOverride: (localId: string) => { x: number; y: number } | undefined = () => undefined,
  baseUrl = '/decomp/em'
): ResolvedNpc[] {
  const out: ResolvedNpc[] = [];
  for (const ev of map.object_events ?? []) {
    const hidden = !!(ev.flag && ev.flag !== '0' && hasFlag(ev.flag));
    // Override de position via setobjectxyperm (state persistent)
    const ovr = ev.local_id ? getObjectOverride(ev.local_id) : undefined;
    if (ovr) { ev.x = ovr.x; ev.y = ovr.y; }
    const gfx = table[ev.graphics_id];
    if (!gfx) continue; // gfx non résolu (item ball, berry tree, etc.) — ignoré

    const sourceKey = `npc-src-${ev.graphics_id}`;
    const textureKey = `npc-${ev.graphics_id}`;
    out.push({
      raw: ev,
      gfx,
      sourceTextureKey: sourceKey,
      textureKey,
      spriteUrl: `${baseUrl}/${gfx.png}`,
      hiddenAtSpawn: hidden
    });
  }
  return out;
}
