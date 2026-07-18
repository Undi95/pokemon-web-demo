// ─────────────────────────────────────────────────────────────────────────────
//  DEVTOOLS — 3 cartes de test artisanales (MAP_DEBUG_1/2/3) pour exercer TOUTES
//  les CS / field moves sans traverser Hoenn.  NON 1:1 (couche harness isolée).
//
//  Contrat respecté :
//   • AUCUNE écriture dans public/decomp/em (données du jeu intactes) : les maps
//     sont fabriquées EN MÉMOIRE à partir des tilesets EXISTANTS (loadTileset) ;
//     Debug_2 réutilise carrément le layout officiel du Centre Pokémon.
//   • Le SEUL point d'accroche moteur = `setDebugMapProvider` (fieldmap.ts,
//     marqué DEVTOOLS) qui, si armé, sert un MapHeader quand mapId commence par
//     'MAP_DEBUG_'.  Non armé en prod → no-op total.
//   • Les rencontres de Debug_1 sont injectées via `InitWildEncountersFromJson`
//     (on RE-lit le JSON réel + on AJOUTE la clé byMap['MAP_DEBUG_1'] en mémoire).
//
//  Accès : `dev.debugMap(1|2|3)` en console, ou `scope.gotoMap('MAP_DEBUG_1', x, y)`
//  (marche tout seul une fois le provider armé — __devGotoMap → executeWarp →
//  loadMapByName → provider).
//
//  Les IDs de metatiles/behaviors sont DÉRIVÉS des tables du jeu (vérifiés contre
//  les maps qui utilisent gTileset_General/gTileset_Cave/gTileset_Underwater — cf.
//  commentaires par tuile) ; pas de valeur magique sans provenance.
// ─────────────────────────────────────────────────────────────────────────────

import {
  loadTileset, loadLayout, setDebugMapProvider,
  type MapHeader, type MapLayout, type ObjectEventTemplate,
  type WarpEvent, type CoordEvent, type BgEvent, type MapConnection,
} from '../../src/fieldmap';
import { InitWildEncountersFromJson } from '../../src/wild_encounter';
import { gPlayerAvatar } from '../../src/field_player_avatar';
import { PLAYER_AVATAR_FLAG_UNDERWATER, PLAYER_AVATAR_FLAG_SURFING } from '../../include/global.fieldmap';

// ─── Packing MAPGRID (1:1 fieldmap.c : metatileId 10b | collision 2b | elevation 4b) ──
const MAPGRID_METATILE = 0x03FF;
function block(metatileId: number, collision: number, elevation: number): number {
  return (metatileId & MAPGRID_METATILE) | ((collision & 0x3) << 10) | ((elevation & 0xF) << 12);
}

// ─── Palette de tuiles — grotte (primary gTileset_General 0-511 + secondary gTileset_Cave 512-925) ──
// Behaviors vérifiés via les .bin d'attributs (metatile_behaviors.json) + usage réel
// (GraniteCave/AlteringCave = gTileset_Cave ; Route126/EverGrande = general water/waterfall).
type Cell = { id: number; coll: number; elev: number };
const T = {
  // gTileset_Cave (secondary) :
  FLOOR:   { id: 513, coll: 0, elev: 3 } as Cell,  // MB_CAVE 0x08 — sol de grotte (GraniteCave) ; encounters ON
  WALL:    { id: 537, coll: 1, elev: 0 } as Cell,  // mur de grotte (GraniteCave, coll1)
  BORDER:  { id: 529, coll: 0, elev: 0 } as Cell,  // bordure hors-map (AlteringCave/GraniteCave = 529)
  LADDER:  { id: 517, coll: 0, elev: 3 } as Cell,  // MB_LADDER 0x61 — échelle (warp → Debug_2)
  // gTileset_General (primary) :
  GRASS:   { id: 13,  coll: 0, elev: 3 } as Cell,  // MB_TALL_GRASS 0x02 — rencontres terrestres
  WATER:   { id: 0x170, coll: 0, elev: 1 } as Cell,  // METATILE_General_CalmWater (metatile_labels.h:210) — 152 rendait une FALAISE (glitch user)
  DIVE:    { id: 0x14F, coll: 0, elev: 1 } as Cell,  // METATILE_General_RoughDeepWater (:233) — 334=RoughWater (pas deep → plongée KO)
  WF_TOP:  { id: 187, coll: 0, elev: 1 } as Cell,  // MB_WATERFALL 0x13 — haut de cascade (EverGrande)
  WF_BODY: { id: 185, coll: 0, elev: 1 } as Cell,  // MB_WATERFALL 0x13 — corps de cascade
  SBSPOT:  { id: 416, coll: 1, elev: 0 } as Cell,  // MB_SECRET_BASE_SPOT_RED_CAVE 0x90 — renfoncement Force Cachée
};
// ─── Palette sous-marine (primary gTileset_General + secondary gTileset_Underwater) ──
const U = {
  SEAWEED:    { id: 513, coll: 0, elev: 3 } as Cell,  // MB_SEAWEED 0x22 — émersion OK (le « trou »)
  SEAWEED_NS: { id: 641, coll: 0, elev: 3 } as Cell,  // MB_SEAWEED_NO_SURFACING 0x2A — nage OK, PAS d'émersion
  WALL:       { id: 512, coll: 1, elev: 0 } as Cell,  // terrain sous-marin impassable
  BORDER:     { id: 512, coll: 0, elev: 0 } as Cell,
};

// ─── Construction d'un MapLayout depuis une grille ASCII + une légende ──────────
async function buildLayout(
  layoutId: string, rows: string[], legend: Record<string, Cell>,
  primaryGName: string, secondaryGName: string, border: Cell,
): Promise<MapLayout> {
  const height = rows.length;
  const width = rows[0].length;
  for (const r of rows) if (r.length !== width) {
    throw new Error(`[debug-maps] ${layoutId}: ligne largeur ${r.length} ≠ ${width} ('${r}')`);
  }
  const map = new Uint16Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ch = rows[y][x];
      const cell = legend[ch];
      if (!cell) throw new Error(`[debug-maps] ${layoutId}: char '${ch}' hors légende @(${x},${y})`);
      map[y * width + x] = block(cell.id, cell.coll, cell.elev);
    }
  }
  const [primary, secondary] = await Promise.all([
    loadTileset(primaryGName), loadTileset(secondaryGName),
  ]);
  const borderData = new Uint16Array([
    block(border.id, border.coll, border.elev), block(border.id, border.coll, border.elev),
    block(border.id, border.coll, border.elev), block(border.id, border.coll, border.elev),
  ]);
  return { id: layoutId, width, height, border: borderData, map, primaryTileset: primary, secondaryTileset: secondary };
}

// ─── Helper : ObjectEventTemplate (réplique le shape produit par loadMapHeader) ──
let _oeCounter = 0;
function oe(
  graphicsIdRaw: string, x: number, y: number, script: string, flagId: string,
  movementTypeRaw = 'MOVEMENT_TYPE_FACE_DOWN',
): ObjectEventTemplate {
  _oeCounter++;
  return {
    localId: _oeCounter, localIdRaw: `__LOCALID_${_oeCounter}`,
    graphicsId: 0, graphicsIdRaw, kind: 0,
    x, y, elevation: 3,
    movementType: 0, movementTypeRaw,
    movementRangeX: 0, movementRangeY: 0,
    trainerType: 0, trainerRange_berryTreeId: 0,
    script, flagId,
  };
}
function warp(x: number, y: number, destMap: string, warpId: number): WarpEvent {
  return { x, y, elevation: 3, warpId, destMap };
}
function conn(directionRaw: string, direction: number, destMap: string): MapConnection {
  return { direction, directionRaw, offset: 0, destMap };
}

// ══════════════════════════════════════════════════════════════════════════════
//  DEBUG_1 — grotte sombre (Flash) : grass/surf/pêche/cascade/plongée/coupe/force/
//  éclate-roc/base secrète/objet caché/échelle→Debug_2/plongée→Debug_3/escape warp.
// ══════════════════════════════════════════════════════════════════════════════
// Légende : # mur · . sol · g herbe · ~ eau surf · D eau profonde(plongée) · ^ haut
// cascade · w cascade · L échelle(→Debug_2) · S base secrète(Force Cachée)
// 22 large × 18 haut. Objets (arbre/roc/rocher/PNJ) + objet caché placés par coord.
const DEBUG1_ROWS = [
  '######################', // 0
  '#....................#', // 1
  '#.gggg......~~~~~~~~.#', // 2   herbe (2-5) · eau (12-19)
  '#.gggg......~~~^^~~~.#', // 3   haut de cascade (15-16)
  '#.gggg......~~~ww~~~.#', // 4   cascade
  '#...........~~~ww~~~.#', // 5   cascade
  '#...........~~~~~~~~.#', // 6   bas de cascade / bassin
  '#...........~~~~~~~~.#', // 7
  '#...........~~~~~~~~.#', // 8
  '#...........~~~DD~~~.#', // 9   bassin de plongée (15-16)
  '#...........~~~DD~~~.#', // 10
  '#...........~~~~~~~~.#', // 11
  '#...........~~~~~~~~.#', // 12
  '#....................#', // 13
  '#..L.................#', // 14  échelle (3,14) → Debug_2
  '#....................#', // 15  départ (10,15) · objet caché (6,15)
  '#S...................#', // 16  base secrète (1,16) contre mur gauche
  '######################', // 17
];
const DEBUG1_LEGEND: Record<string, Cell> = {
  '#': T.WALL, '.': T.FLOOR, 'g': T.GRASS, '~': T.WATER, 'D': T.DIVE,
  '^': T.WF_TOP, 'w': T.WF_BODY, 'L': T.LADDER, 'S': T.SBSPOT,
};
export const DEBUG1_START = { x: 10, y: 15 };

async function buildDebug1(): Promise<MapHeader> {
  _oeCounter = 0;
  const layout = await buildLayout(
    'LAYOUT_DEBUG_1', DEBUG1_ROWS, DEBUG1_LEGEND,
    'gTileset_General', 'gTileset_Cave', T.BORDER,
  );
  // Objets officiels réutilisés (scripts _common : EventScript_CutTree / EventScript_RockSmash).
  const objectEvents: ObjectEventTemplate[] = [
    oe('OBJ_EVENT_GFX_CUTTABLE_TREE', 8, 3, 'EventScript_CutTree', 'FLAG_TEMP_11', 'MOVEMENT_TYPE_LOOK_AROUND'),
    oe('OBJ_EVENT_GFX_BREAKABLE_ROCK', 8, 6, 'EventScript_RockSmash', 'FLAG_TEMP_12', 'MOVEMENT_TYPE_LOOK_AROUND'),
    // Rocher Force : poussé par collision (TryPushBoulder + FLAG_SYS_USE_STRENGTH), pas de script.
    oe('OBJ_EVENT_GFX_PUSHABLE_BOULDER', 8, 10, '0x0', 'FLAG_TEMP_13', 'MOVEMENT_TYPE_NONE'),
    // PNJ « guide » près de l'échelle (spawn NPC + statique ; l'échelle fait le warp).
    oe('OBJ_EVENT_GFX_MAN_1', 5, 14, '0x0', '0'),
  ];
  const warps: WarpEvent[] = [
    warp(4, 15, 'MAP_DEBUG_2', 0),   // [0] point d'arrivée depuis Debug_2 (sol nu, pas de re-trigger)
    warp(3, 14, 'MAP_DEBUG_2', 0),   // [1] tuile ÉCHELLE (MB_LADDER) → Debug_2
  ];
  const bgEvents: BgEvent[] = [
    { x: 6, y: 15, elevation: 3, kind: 'hidden_item', playerFacingDir: 'BG_EVENT_PLAYER_FACING_ANY', script: '' },
    { x: 1, y: 16, elevation: 0, kind: 'secret_base', playerFacingDir: 'BG_EVENT_PLAYER_FACING_ANY', script: '' },
  ];
  const connections: MapConnection[] = [ conn('dive', 5, 'MAP_DEBUG_3') ];  // eau profonde → plongée
  return {
    id: 'MAP_DEBUG_1', mapLayout: layout,
    events: { objectEvents, warps, coordEvents: [] as CoordEvent[], bgEvents },
    mapScripts: 'Debug1_MapScripts', connections,
    music: 'MUS_PETALBURG_WOODS', mapLayoutId: 'LAYOUT_DEBUG_1',
    regionMapSectionId: 'MAPSEC_GRANITE_CAVE',
    cave: true,                      // requires_flash → pénombre + Flash testable
    weather: 'WEATHER_NONE', mapType: 'MAP_TYPE_UNDERGROUND',
    allowCycling: false, allowEscaping: true,  // allowEscaping → Corde Sortie / Dig utilisables
    allowRunning: true, showMapName: false, battleType: 'MAP_BATTLE_SCENE_NORMAL',
  };
}

// ══════════════════════════════════════════════════════════════════════════════
//  DEBUG_2 — « base secrète avec un PC » : on RÉUTILISE le layout officiel du Centre
//  Pokémon (LAYOUT_POKEMON_CENTER_1F), qui contient un VRAI PC fonctionnel (metatile
//  4 = MB_PC 0x83 → EventScript_PC → système de stockage porté). Les PC de base
//  secrète (MB_SECRET_BASE_PC 0xB0) ne déclenchent PAS EventScript_PC (sous-système
//  base secrète non porté) → ce choix garantit un PC qui MARCHE (cf. rapport).
// ══════════════════════════════════════════════════════════════════════════════
export const DEBUG2_START = { x: 7, y: 4 };
async function buildDebug2(): Promise<MapHeader> {
  _oeCounter = 0;
  const layout = await loadLayout('LAYOUT_POKEMON_CENTER_1F');  // 14×9, PC @(10,1), portes @(6-7,8)
  // Warp de sortie = tuiles de la porte (6-7, 8) → Debug_1 (arrive au warp[0] de Debug_1).
  const warps: WarpEvent[] = [
    warp(7, 8, 'MAP_DEBUG_1', 0),
    warp(6, 8, 'MAP_DEBUG_1', 0),
  ];
  return {
    id: 'MAP_DEBUG_2', mapLayout: layout,
    events: { objectEvents: [], warps, coordEvents: [] as CoordEvent[], bgEvents: [] as BgEvent[] },
    mapScripts: 'Debug2_MapScripts', connections: [] as MapConnection[],
    music: 'MUS_POKE_CENTER', mapLayoutId: 'LAYOUT_POKEMON_CENTER_1F',
    regionMapSectionId: 'MAPSEC_GRANITE_CAVE',
    cave: false, weather: 'WEATHER_NONE', mapType: 'MAP_TYPE_INDOOR',
    allowCycling: false, allowEscaping: false, allowRunning: false,
    showMapName: false, battleType: 'MAP_BATTLE_SCENE_NORMAL',
  };
}

// ══════════════════════════════════════════════════════════════════════════════
//  DEBUG_3 — mini-map sous-marine (MAP_TYPE_UNDERWATER, requis pour l'émersion).
//  Mêmes dimensions que Debug_1 : la plongée/émersion PRÉSERVENT (x,y) → l'aire
//  d'algues chevauche le bassin de plongée de Debug_1 (cols 14-17, rows 8-11), donc
//  on plonge à (15,9)→(15,9) et on émerge → eau de Debug_1 (on reste en surf).
//  « trou central » : les 4 tuiles centrales (15-16, 9-10) = MB_SEAWEED (émersion OK),
//  l'anneau autour = MB_SEAWEED_NO_SURFACING (nage OK, pas d'émersion). Reste = murs.
// ══════════════════════════════════════════════════════════════════════════════
// Légende : # mur · o algue-no-surf (nage) · O algue (trou, émersion) · reste mur.
const DEBUG3_ROWS = [
  '######################', // 0
  '######################', // 1
  '######################', // 2
  '######################', // 3
  '######################', // 4
  '######################', // 5
  '######################', // 6
  '######################', // 7
  '##############oooo####', // 8   anneau algue-no-surf (14-17)
  '##############oOOo####', // 9   trou central (15-16)
  '##############oOOo####', // 10  trou central
  '##############oooo####', // 11
  '######################', // 12
  '######################', // 13
  '######################', // 14
  '######################', // 15
  '######################', // 16
  '######################', // 17
];
const DEBUG3_LEGEND: Record<string, Cell> = {
  '#': U.WALL, 'o': U.SEAWEED_NS, 'O': U.SEAWEED,
};
export const DEBUG3_START = { x: 15, y: 9 };  // = trou central (aligné sur le bassin de Debug_1)

async function buildDebug3(): Promise<MapHeader> {
  _oeCounter = 0;
  const layout = await buildLayout(
    'LAYOUT_DEBUG_3', DEBUG3_ROWS, DEBUG3_LEGEND,
    'gTileset_General', 'gTileset_Underwater', U.BORDER,
  );
  const connections: MapConnection[] = [ conn('emerge', 6, 'MAP_DEBUG_1') ];  // B → émersion → Debug_1
  return {
    id: 'MAP_DEBUG_3', mapLayout: layout,
    events: { objectEvents: [] as ObjectEventTemplate[], warps: [] as WarpEvent[], coordEvents: [] as CoordEvent[], bgEvents: [] as BgEvent[] },
    mapScripts: 'Debug3_MapScripts', connections,
    music: 'MUS_UNDERWATER', mapLayoutId: 'LAYOUT_DEBUG_3',
    regionMapSectionId: 'MAPSEC_UNDERWATER_126',
    cave: false, weather: 'WEATHER_UNDERWATER_BUBBLES', mapType: 'MAP_TYPE_UNDERWATER',
    allowCycling: false, allowEscaping: false, allowRunning: false,
    showMapName: false, battleType: 'MAP_BATTLE_SCENE_NORMAL',
  };
}

// ─── Registre + cache (le provider est appelé une fois par map, puis mis en cache
//      par loadMapHeader). ────────────────────────────────────────────────────────
const _cache = new Map<string, MapHeader>();
async function provideDebugMap(mapId: string): Promise<MapHeader | null> {
  const hit = _cache.get(mapId);
  if (hit) return hit;
  let h: MapHeader | null = null;
  try {
    if (mapId === 'MAP_DEBUG_1') {
      // Rencontres + escape warp posés ICI (pas seulement dans dev.debugMap) → toute
      // entrée (scope.gotoMap, retour d'émersion depuis Debug_3…) les a de toute façon.
      await ensureDebugEncounters();
      setEscapeWarpTo('MAP_DEBUG_1', DEBUG1_START.x, DEBUG1_START.y);
      h = await buildDebug1();
    } else if (mapId === 'MAP_DEBUG_2') h = await buildDebug2();
    else if (mapId === 'MAP_DEBUG_3') h = await buildDebug3();
  } catch (e) {
    console.error(`[debug-maps] échec construction ${mapId}:`, e);
    return null;
  }
  if (h) _cache.set(mapId, h);
  return h;
}

// ─── Rencontres Debug_1 : injectées dans le moteur (RE-init depuis le JSON réel +
//      ajout de la clé, sans toucher au fichier). 12/5/5/10 slots (land/water/rock/fish). ──
function mons(species: string, min: number, max: number, count: number): Array<{ min_level: number; max_level: number; species: string }> {
  return Array.from({ length: count }, () => ({ min_level: min, max_level: max, species }));
}
const DEBUG1_ENCOUNTERS = {
  land:       { encounter_rate: 20, mons: [
    ...mons('SPECIES_ZUBAT', 6, 10, 6), ...mons('SPECIES_GEODUDE', 6, 10, 4), ...mons('SPECIES_MAKUHITA', 7, 9, 2),
  ] },
  water:      { encounter_rate: 20, mons: mons('SPECIES_TENTACOOL', 10, 20, 5) },
  rock_smash: { encounter_rate: 20, mons: mons('SPECIES_GEODUDE', 8, 12, 5) },
  fishing:    { encounter_rate: 30, mons: [
    ...mons('SPECIES_MAGIKARP', 5, 10, 4), ...mons('SPECIES_TENTACOOL', 5, 15, 4), ...mons('SPECIES_WAILMER', 10, 20, 2),
  ] },
};
let _encountersInjected = false;
async function ensureDebugEncounters(): Promise<void> {
  if (_encountersInjected) return;
  try {
    const res = await fetch('/decomp/em/wild-encounters.json');
    const data = await res.json() as { byMap?: Record<string, unknown>; alteringCave?: unknown[] };
    data.byMap = data.byMap ?? {};
    data.byMap['MAP_DEBUG_1'] = DEBUG1_ENCOUNTERS;
    InitWildEncountersFromJson(data);
    _encountersInjected = true;
    console.log('[debug-maps] rencontres MAP_DEBUG_1 injectées (land/water/rock_smash/fishing)');
  } catch (e) {
    console.error('[debug-maps] injection rencontres KO:', e);
  }
}

// ─── Escape warp (Corde Sortie / Dig) : Dig/EscapeRope lisent globalThis.__escapeWarp. ──
function setEscapeWarpTo(mapName: string, x: number, y: number): void {
  (globalThis as Record<string, unknown>).__escapeWarp = { mapName, x, y };
}

// ─── Attente (poll rAF) d'un prédicat, borné. ────────────────────────────────────
function waitFor(pred: () => boolean, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const start = performance.now();
    const tick = (): void => {
      let ok = false; try { ok = pred(); } catch { ok = false; }
      if (ok) return resolve(true);
      if (performance.now() - start > timeoutMs) return resolve(false);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

let _installed = false;
/** Arme le provider debug-maps + expose `dev.debugMap(1|2|3)`. Idempotent. */
export function installDebugMaps(): void {
  if (_installed) return;
  _installed = true;
  setDebugMapProvider(provideDebugMap);

  const dev = (globalThis as Record<string, unknown>).dev as Record<string, unknown> | undefined;
  const debugMap = async (n: number): Promise<string> => {
    await ensureDebugEncounters();
    const goto = (globalThis as Record<string, unknown>).__devGotoMap as
      ((mapId: string, x: number, y: number) => void) | undefined;
    if (!goto) return '[debug-maps] overworld pas booté (__devGotoMap absent)';
    if (n === 1) {
      setEscapeWarpTo('MAP_DEBUG_1', DEBUG1_START.x, DEBUG1_START.y);  // Dig/Corde → retour Debug_1
      goto('MAP_DEBUG_1', DEBUG1_START.x, DEBUG1_START.y);
      return `[debug-maps] → MAP_DEBUG_1 (${DEBUG1_START.x},${DEBUG1_START.y}). Flash/Coupe/Force/Éclate-Roc/Surf/Pêche/Cascade/Plongée/base secrète/objet caché/échelle→2.`;
    }
    if (n === 2) {
      goto('MAP_DEBUG_2', DEBUG2_START.x, DEBUG2_START.y);
      return `[debug-maps] → MAP_DEBUG_2 (Centre : PC fonctionnel @(10,1) ; portes (6-7,8)→Debug_1).`;
    }
    if (n === 3) {
      goto('MAP_DEBUG_3', DEBUG3_START.x, DEBUG3_START.y);
      // Direct goto : force l'état plongée pour que le rendu/déplacement soient cohérents
      // (le VRAI test = plonger depuis l'eau profonde de Debug_1 ; ici best-effort).
      void waitFor(() => (globalThis as { gMapHeader?: { id?: string } }).gMapHeader?.id === 'MAP_DEBUG_3', 5000)
        .then((ok) => {
          if (ok) {
            gPlayerAvatar.flags &= ~PLAYER_AVATAR_FLAG_SURFING;
            gPlayerAvatar.flags |= PLAYER_AVATAR_FLAG_UNDERWATER;
          }
        });
      return `[debug-maps] → MAP_DEBUG_3 (sous-marin : nage sur algues, B au trou central (15-16,9-10) = émersion → Debug_1). Idéalement : PLONGER depuis Debug_1.`;
    }
    return '[debug-maps] usage : dev.debugMap(1|2|3)';
  };
  if (dev) dev.debugMap = debugMap;
  (globalThis as Record<string, unknown>).__debugMap = debugMap;  // fallback si dev pas encore prêt
  console.log('[debug-maps] provider armé — dev.debugMap(1|2|3) ou scope.gotoMap(\'MAP_DEBUG_1\', x, y)');
}
