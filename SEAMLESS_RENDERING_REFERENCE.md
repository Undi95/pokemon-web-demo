# SEAMLESS RENDERING REFERENCE — fieldmap.c → OverworldScene multi-tilemap

> Spec issue de l'audit Agent Explore (very thorough) du 2026-04-25.
> Source : `D:\Projet 1\decomps\pokeemeraude\src\fieldmap.c` + `field_camera.c` + `overworld.c` + `event_object_movement.c`.
> But : remplacer `scene.restart()` à chaque traversée par un **monde continu** comme le décomp.

---

## 1. Vue d'ensemble

Le décomp implémente un monde continu via un **seul buffer 2D global** (`gBackupMapLayout`) qui contient :
- La current map au centre (à partir de l'offset `(MAP_OFFSET=7, MAP_OFFSET=7)`)
- Les bordures de 7 tiles (`MAP_OFFSET`) des 4 maps connectées tout autour

À la traversée d'une bordure : **PAS de restart**. La fonction `LoadMapFromCameraTransition` SWITCH `gMapHeader` + ré-initialise le buffer, MAIS le joueur continue de bouger sans interruption visuelle. Les NPCs sont spawn/destroy silencieusement par `TrySpawnObjectEvents` / `RemoveObjectEventsOutsideView`.

---

## 2. Structures clés (fieldmap.h)

```c
struct MapConnection {
    u8 direction;     // CONNECTION_SOUTH=1, NORTH=2, WEST=3, EAST=4, DIVE=5
    s32 offset;       // Décalage horizontal (N/S) ou vertical (E/W)
    u8 mapGroup;
    u8 mapNum;
};

struct MapLayout {
    s32 width;
    s32 height;
    const u16 *border;            // 2×2 metatiles répétés hors-map
    const u16 *map;               // width × height metatiles
    const struct Tileset *primaryTileset;
    const struct Tileset *secondaryTileset;
};

struct BackupMapLayout {
    s32 width;        // = original_width + 15 (MAP_OFFSET_W)
    s32 height;       // = original_height + 14 (MAP_OFFSET_H)
    u16 *map;         // Buffer global unifié
};
```

**Constantes :**
- `MAP_OFFSET = 7` — distance écran visible
- `MAP_OFFSET_W = 15`, `MAP_OFFSET_H = 14` — padding du buffer

---

## 3. Layout du buffer global

```
+---+-----+---+
| 7 |  w  | 7 |  width = w + 15
+---+-----+---+
| 7 |     | 7 |
|   |     |   |
|   | Map |   |  height = h + 14
|   |     |   |
| 7 |     | 7 |
+---+-----+---+
```

À l'init (`InitMapLayoutData` fieldmap.c:100) :
1. Buffer cleared avec `MAPGRID_UNDEFINED` (~0x3FF)
2. Map data copiée à offset (7, 7) dans le buffer
3. `InitBackupMapLayoutConnections` (fieldmap.c:133) remplit les 7 tiles de bordure pour chaque connection :
   - `FillSouthConnection` (fieldmap.c:190) : copie 7 premières lignes de la south map à `(offset+7, height+7)`
   - `FillNorthConnection` (fieldmap.c:229) : copie 7 dernières lignes de la north map à `(offset+7, 0)`
   - `FillWestConnection` (fieldmap.c:270) : copie 7 dernières colonnes de la west map à `(0, offset+7)`
   - `FillEastConnection` (fieldmap.c:308) : copie 7 premières colonnes de la east map à `(width+7, offset+7)`

Tous avec clipping si offset négatif ou map adjacente trop large.

---

## 4. Flow de traversée (sans restart)

### `CameraMove(deltaX, deltaY)` — fieldmap.c:649

```c
direction = GetPostCameraMoveMapBorderId(x, y);
if (direction == CONNECTION_NONE/INVALID) {
  gSaveBlock1Ptr->pos.x += x;
  gSaveBlock1Ptr->pos.y += y;
  return FALSE;  // pas de traversée
}

// Traversée détectée :
SaveMapView();
connection = GetIncomingConnection(direction, ...);
SetPositionFromConnection(connection, direction, x, y);  // recalcule pos.x/y dans new map coords
LoadMapFromCameraTransition(connection->mapGroup, connection->mapNum);  // switch silencieux
gCamera.active = TRUE;
gSaveBlock1Ptr->pos.x += x;
gSaveBlock1Ptr->pos.y += y;
MoveMapViewToBackup(direction);
return TRUE;
```

### `LoadMapFromCameraTransition` — overworld.c:784

```c
SetWarpDestination(mapGroup, mapNum, WARP_ID_NONE, -1, -1);
TransitionMapMusic();
ApplyCurrentWarp();
LoadCurrentMapData();           // maj gMapHeader
LoadObjEventTemplatesFromHeader();  // copy NPC templates de new map
InitMap();                      // ré-init gBackupMapLayout + connections
CopySecondaryTilesetToVramUsingHeap();
LoadSecondaryTilesetPalette();
```

**Aucun fade, aucun stop du player.** Tout se passe en RAM, prend ~quelques ms.

### Détection bordure (`GetMapBorderIdAt` fieldmap.c:568)

Zones de bordure dans le buffer (size width × height) :
- **EAST** : `x >= width - 8`
- **WEST** : `x < 7`
- **SOUTH** : `y >= height - 7`
- **NORTH** : `y < 7`

Utilise `sMapConnectionFlags` (set lors de `InitBackupMapLayoutConnections`) pour vérifier qu'une connection existe.

---

## 5. Object events cross-map

### `TrySpawnObjectEvents` (event_object_movement.c:1645)

À chaque tick après traversée, spawn les NPCs dans la rectangle :
```
left = pos.x - 2
right = pos.x + 17        (MAP_OFFSET_W + 2)
top = pos.y
bottom = pos.y + 16       (MAP_OFFSET_H + 2)
```

Si NPC dans cette rect ET son flag pas set → `TrySpawnObjectEventTemplate`.

### `RemoveObjectEventsOutsideView` (event_object_movement.c:1677)

Détruit chaque NPC actif dont currentCoords sortent de la même rect. **Pas de "cross-map walking"** — les NPCs sont silencieusement spawn/destroy.

Templates de la new map copiés dans `gSaveBlock1Ptr->objectEventTemplates` lors de `LoadObjEventTemplatesFromHeader`.

---

## 6. Plan refactor TS recommandé : Multi-Tilemap Rendering

### Concept
Au lieu de `scene.restart()`, garder 4-5 `Phaser.Tilemaps.Tilemap` actives simultanément (current + connections), avec leurs offsets en world coords. Le joueur se meut dans ce monde virtuel.

### Architecture proposée

**Nouveau module : `WorldRenderer`** (`src/engine/world-renderer.ts`)

```typescript
interface LoadedMapInfo {
  mapId: string;
  mapJson: MapJson;
  layout: LayoutDef;
  tilemap: { lower: Phaser.Tilemaps.TilemapLayer; upper: Phaser.Tilemaps.TilemapLayer };
  worldOffsetX: number;  // en tiles, pas pixels
  worldOffsetY: number;
  parsedScripts: ParsedScripts;
  npcs: ResolvedNpc[];
}

class WorldRenderer {
  scene: Phaser.Scene;
  currentMapId: string;
  loaded: Map<string, LoadedMapInfo> = new Map();

  /** Charge la current + connections autour. */
  async init(initialMapId: string): Promise<void>;

  /** Charge async une map adjacente, place ses tilemap layers à l'offset adapté. */
  async loadAdjacent(mapId: string, fromCurrent: ConnectionInfo): Promise<void>;

  /** Détecte si player a traversé une bordure ; si oui retourne {newMapId, newWorldOffset}. */
  checkTraversal(playerWorldX: number, playerWorldY: number): { newMapId?: string };

  /** Promotes une adjacent map à current. Recalcule offsets de toutes les loaded.
   *  Charge les nouvelles connections de la new current. Unload les old hors portée. */
  promoteToCurrent(mapId: string): Promise<void>;

  /** Lookup metatile/collision/behavior à un point monde. */
  getTileAt(worldX: number, worldY: number): { metatile?: number; behavior?: number; collision?: number };
}
```

**Refactor `OverworldScene`** :

- Remplacer `this.tilemap` (LoadedTilemap unique) par `this.worldRenderer`
- `playerTile` → `playerWorld` (coords absolues monde, pas relatives current map)
- `tryMove` :
  - Calcule new world position
  - Test collision via `worldRenderer.getTileAt(newWorld)` (au lieu de `tilemap.collisions[y][x]`)
  - Test traversal via `worldRenderer.checkTraversal(newWorld)`
  - Si traversé → `worldRenderer.promoteToCurrent(newMapId)` SANS scene.restart, SANS fade
- `scene.restart()` retiré de `tryConnectionWarp`
- NPCs : maintenir une rect "view" (centerWorld ± MAP_OFFSET_W/H tiles) ; spawn/despawn à chaque step
- Map scripts (ON_TRANSITION/ON_RESUME/ON_FRAME) : tournent quand `currentMapId` change (= équivalent de `LoadMapFromCameraTransition` + map_script callbacks)

**Camera** : `camera.startFollow(playerSprite)` continue à marcher (Phaser gère scrollX/Y automatiquement)

---

## 7. Edge cases à gérer

### Tilesets différents entre maps connectées
Chaque map a sa propre paire `{primary_tileset, secondary_tileset}`. Si 2 maps connectées utilisent des tilesets différents → on ne peut pas réutiliser le même atlas Phaser.

**Solution** : chaque LoadedMapInfo a ses propres TilemapLayer avec ses propres atlas. Coût mémoire = N × atlas chargés simultanément. Acceptable (4-5 maps max en mémoire).

### Maps de tailles très différentes
Le décomp clipper automatiquement (`Fill*Connection` truncate si dépasse). Notre version : juste positionner le tilemap à l'offset, et le joueur ne peut traverser que dans la zone valide (test via `checkTraversal`).

### NPCs qui marchent à travers une bordure
Rare. Le décomp garde le NPC actif si initialCoords ou currentCoords sont dans la view rect. À répliquer : tester les deux.

### Connections diagonales
Pas existantes en Gen 3 (juste N/S/E/W). Ignorer.

### Fades / cuts spéciaux
Certains warps (truck → Littleroot via `MAP_DYNAMIC`) gardent leur fade. La distinction : un `warp_event` reste un `warp_event` (avec ou sans fade selon type). Seules les `connections` deviennent seamless.

---

## 8. Ampleur du chantier — Phasing

Vu la taille du refacto, **diviser en 3 sous-vagues** :

### Vague 6.1 — WorldRenderer skeleton (sans seamless complet)
- Créer `src/engine/world-renderer.ts` avec API ci-dessus
- Migrer `OverworldScene` : utiliser `worldRenderer.getTileAt()` au lieu de `tilemap.collisions/behaviors`
- Pour l'instant `worldRenderer` ne charge QUE current map (adjacents = vide)
- Comportement identique à avant, juste l'abstraction prête
- Effort : M (refacto isolé sans changement visible)

### Vague 6.2 — Charger + render connections en parallèle
- `loadAdjacent()` : charge async les 4 connections au load de current
- Chaque adjacent map → ses TilemapLayer placés à offset relatif
- Joueur peut VOIR les maps adjacentes aux bords avant de traverser
- Mais traversée = toujours `scene.restart` (pas encore seamless)
- Effort : L (load async + multi-tilemap layout + tilesets différents)

### Vague 6.3 — Traversée seamless (le vrai refacto)
- `promoteToCurrent()` : switch silencieux, recalcule offsets, charge new connections, unload old
- Retirer `scene.restart` dans `tryConnectionWarp`
- NPCs spawn/despawn dynamique selon view rect
- Map scripts re-déclenchés au switch (ON_TRANSITION callback)
- Effort : L (gestion d'état complexe, edge cases)

**Total : ~2-3 sessions dédiées.**

---

## 9. Checklist de tests post-refacto

- [ ] Traversée Bourg-en-Vol ↔ Route 101 sans flicker, sans fade, sans loading
- [ ] Caméra suit le joueur naturellement à travers la bordure
- [ ] NPCs de la nouvelle map apparaissent à mesure qu'on s'approche
- [ ] NPCs de l'ancienne map disparaissent quand hors écran
- [ ] Tiles de la map adjacente visibles à 7 tiles du bord (avant traversée)
- [ ] Map scripts ON_TRANSITION fire à chaque switch
- [ ] Save state correct (gameState.map.name = current map après traversée)
- [ ] Pas de regression sur warps explicites (portes, escaliers, MAP_DYNAMIC)
