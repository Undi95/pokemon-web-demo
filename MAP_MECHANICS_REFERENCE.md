# MAP MECHANICS REFERENCE

> Source de vérité : audit Agents Explore session 38 (2026-04-25).
> Croise décomp pokeemeraude + état actuel pokemon-web-demo.
> **À lire avant** de toucher OverworldScene, script-runner, npc-loader, tilemap-loader.

---

## 0. ARCHITECTURE Seamless map crossing (web-only, optimisation)

**Différence vs décomp GBA** :
- **Décomp** : routes ↔ routes/zones = transitions SEAMLESS hardware (pas de fade, vraiment fluide). Pokemon GBA charge la map adjacente côté hardware en utilisant des borders & VRAM streaming.
- **Bâtiments entre 2 routes** : ce sont des **maps intermédiaires** avec warps door + fade noir. Pas seamless.
- **Notre projet** : `softSwitchToMap` reproduit le seamless en pré-chargeant les maps adjacentes en mémoire (`loadAdjacentsAsync`) puis en faisant un swap de références sans restart.

**Pipeline `softSwitchToMap`** :
1. `tryMove` détecte position out-of-bounds + adjacent map loaded
2. Tween player vers position pixel absolue de la map adjacente (déjà rendue côte à côte via WorldRenderer)
3. Au tween `onComplete` : `softSwitchToMap` →
   - `promoteToCurrent` shift world layers + camera pour que target = (0,0)
   - destroy NPCs ancienne current + spawn NPCs new current
   - `playMidiLoop(target.music)` (skip si même URL)

**Bug connu (session 41)** : course en continu déclenche 2 crossings consécutifs (race condition `inputLockUntil` vs cooldown du tween). Fix `crossingInProgress` flag à implémenter session 42.

**Système prélecture** :
- `loadAdjacentsAsync()` (OverworldScene) charge les maps adjacentes via `WorldRenderer.loadAdjacent(direction, conn)`
- Stockage en `MapInstance` avec `worldOffsetX/Y` calculé pour positionnement worldspace
- Quand on cross : `softSwitch` shift les offsets pour que target devienne (0,0)

---

## 1. DATA — Où est quoi dans le décomp

### 1.1 Maps (519 dossiers dans `data/maps/`)

| Fichier | Contenu | Format |
|---|---|---|
| `data/maps/<MapName>/map.json` | events (objects/warps/coords/bg) + layout id | JSON |
| `data/maps/<MapName>/scripts.inc` | scripts NPCs + textes inline | poryscript / asm |
| `data/maps/map_groups.json` | index 519 maps en 35 groupes | JSON |
| `data/scripts/*.inc` (57 fichiers) | scripts communs (battles, items, std interactions) | asm |
| `data/text/*.inc` (36 fichiers) | textes maps centralisés | asm |
| `src/data/text/*.h` (10 fichiers) | textes UI globaux (species_names, item_descs, abilities) | C struct |

### 1.2 Format `map.json` type
```json
{
  "id": "MAP_LITTLEROOT_TOWN",
  "layout": "LAYOUT_LITTLEROOT_TOWN",
  "object_events": [
    {"graphics_id": "OBJ_EVENT_GFX_LITTLEROOT_BOY", "x": 5, "y": 8,
     "elevation": 3, "movement_type": "MOVEMENT_TYPE_LOOK_AROUND",
     "script": "Littleroot_EventScript_Boy", "flag": "0"}
  ],
  "warp_events": [
    {"x": 4, "y": 4, "elevation": 0, "dest_map": "MAP_LITTLEROOT_TOWN_BRENDANS_HOUSE_1F", "dest_warp_id": "0"}
  ],
  "coord_events": [
    {"type": "trigger", "x": 7, "y": 5, "elevation": 3,
     "var": "VAR_LITTLEROOT_INTRO_STATE", "var_value": "1",
     "script": "LittlerootTown_EventScript_RivalEntry"}
  ],
  "bg_events": [
    {"type": "sign", "x": 6, "y": 7, "elevation": 0,
     "player_facing_dir": "BG_EVENT_PLAYER_FACING_NORTH",
     "script": "LittlerootTown_EventScript_TownSign"}
  ]
}
```

### 1.3 Couverture extracteurs actuels

| Extracteur | Output | Couverture |
|---|---|---|
| `extract-scripts.mjs` | `scripts/<MapName>.json` | 470/519 maps (90.6%) |
| `extract-strings.mjs` | `strings.json` | ~8k textes globaux ✅ |
| `extract-object-events.mjs` | `object-event-graphics.json` | gfxId → PNG ✅ |
| `extract-trainer-parties.mjs` | `trainer-parties.json` | ✅ |
| `extract-script-opcodes.mjs` | `script-opcodes.json` | ✅ |
| `extract-constants.mjs` | `constants.json` (FLAG_*, VAR_*) | ✅ |
| `extract-movement-actions.mjs` | `movement-actions.json` (159 actions) | ✅ |

**Manques** :
- 49 maps sans scripts.inc (probablement vides ou special)
- `data/text/*.inc` (36 fichiers) pas séparément extraits → centralisés dans `_common.json` non consommé runtime
- `MAP_SCRIPT` tables (ON_LOAD/ON_FRAME/ON_WARP) extraites mais pas exposées au runtime

---

## 2. RUNTIME — Mécaniques map et leur état

### 2.1 Warps (changement de map)

**Décomp** : 9 metatile behaviors warp distincts dans `include/global.fieldmap.h` :

| MB_* | Hex | Type | Auto-step après warp |
|---|---|---|---|
| MB_NON_ANIMATED_DOOR | 0x60 | Porte instant | DOWN |
| MB_ANIMATED_DOOR | 0x69 | Porte avec anim frames | DOWN |
| MB_WATER_DOOR | 0x6C | Porte aquatique | DOWN |
| MB_LADDER | 0x61 | Échelle (intérieur étages) | **DOWN** |
| MB_UP_ESCALATOR | 0x6A | Escalator montant | **UP** |
| MB_DOWN_ESCALATOR | 0x6B | Escalator descendant | **DOWN** |
| MB_*_ARROW_WARP (4) | 0x62-65 | Warp directionnel | None (besoin push direction) |
| MB_WATER_SOUTH_ARROW_WARP | 0x6D | Variante eau | None |

**Pokemon-web-demo** :
- Implémentés : portes (3), arrow warps (4), ladder (1), escalator (2)
- 🐛 **BUG CRITIQUE** : Auto-step DOWN ne se fait QUE pour `isDoorWarp()`. Escaliers/ladders → joueur reste bloqué sur la tile. Fix triv : élargir condition à `isInstantStepWarp()` (cf. OverworldScene.ts:388).

### 2.2 NPC (object_events)

**Structure ObjectEventTemplate** (`include/global.fieldmap.h:92-110`) :
```c
{ localId, graphicsId, x, y, elevation, movementType, movementRangeX/Y, trainerType, script, flagId }
```

**Système de spawn** :
- Au load : check `flagId` — si flag set → NPC masqué
- Opcodes scripts : `addobject` / `removeobject` / `setobjectxy` / `setobjectmovementtype`
- 81 movement types dans `include/constants/event_object_movement.h`

**Pokemon-web-demo** :
- Implémentation : `src/engine/npc-loader.ts` (parsing) + `src/engine/npc-behavior.ts` (idle behaviors)
- ~35/81 movement types implémentés (43%)
- ✅ FACE_*, LOOK_AROUND, ROTATE_*, WANDER_*, WALK_IN_PLACE, JOG_IN_PLACE, RUN_IN_PLACE
- ❌ WALK_SEQUENCE (16 patterns), COPY_PLAYER (4 variants), TREE_DISGUISE, MOUNTAIN_DISGUISE, BERRY_TREE_GROWTH, *_IN_GRASS variants
- ✅ Flag masquage (`hasFlag(ev.flag)`)
- ✅ addobject/removeobject opcodes wirés

### 2.3 Item Balls (Pokéballs au sol)

**Décomp** :
- Item ball = ObjectEvent avec `graphics_id: OBJ_EVENT_GFX_ITEM_BALL`
- Script type `EventScript_ItemBall` → itemId lookup → FLAG_ITEM_* set au pickup
- Hidden items : dans `bg_events` avec `type: "hidden_item"` (different sprite, dowsing machine pour découvrir)

**Pokemon-web-demo** :
- 🐛 **BLOQUANT** : `npc-loader.ts:89` skip silencieusement les NPCs sans gfx résolu (`OBJ_EVENT_GFX_ITEM_BALL` n'a pas de sprite mappé) → item balls **invisibles** et **non-interactives**.
- Aucune logique `EventScript_ItemBall` runtime.
- Hidden items / dowsing machine : pas implémentés du tout.

### 2.4 Events de map (4 types)

| Type | Structure | Status web-demo |
|---|---|---|
| **object_events** | NPCs + item balls | ✅ NPCs OK / ❌ item balls ignored |
| **warp_events** | (x, y, dest_map, dest_warp_id) | ✅ Trigger OK |
| **coord_events** | (x, y, var, var_value, script) | ✅ Exécution OK / ⚠️ couverture faible |
| **bg_events** | type=sign / hidden_item / secret_base | ⚠️ signs OK / ❌ hidden items + secret base |

### 2.5 Metatile attributes (propriétés tiles)

**Décomp** : **240 behaviors MB_*** dans `include/constants/metatile_behaviors.h` (enum 0x00-0xEF).

Catégories principales :
| Catégorie | Exemples MB_* | Count approx |
|---|---|---|
| **Collision** | NORMAL, IMPASSABLE_EAST/WEST/NORTH/SOUTH/NE/NW/SE/SW | 9 |
| **Terrain encounters** | TALL_GRASS, LONG_GRASS, ASHGRASS, SAND, DEEP_SAND, ICE, CAVE | ~15 |
| **Eau** | POND_WATER, OCEAN_WATER, DEEP_WATER, SHALLOW_WATER, PUDDLE, WATERFALL, SOOTOPOLIS_DEEP_WATER | ~12 |
| **Surf/Dive** | SURFABLE_*, MB_DIVE | ~5 |
| **Warps** | (cf. 2.1) | 9 |
| **Jump/Slide ledges** | JUMP_EAST/WEST/NORTH/SOUTH (+ NE/NW/SE/SW), WALK_*, SLIDE_* | ~16 |
| **Bridges** | BRIDGE_OVER_OCEAN/POND_*, PACIFIDLOG_LOG_*, FORTREE_BRIDGE | ~10 |
| **Interactions** | PC, TELEVISION, BOOKSHELF, COUNTER, POKEBLOCK_FEEDER, SLOT_MACHINE | ~15 |
| **Secret bases** | SECRET_BASE_*, IMPASSABLE_*, BLOCK_DECORATION, etc. | ~30 |
| **Special** | RUNNING_SHOES_INSTRUCTION, TRICK_HOUSE_*, BERRY_TREE_SOIL | ~20 |

**Pokemon-web-demo** (`tilemap-loader.ts`) : **17 MB_*** implémentés.
- ✅ Warp behaviors (9)
- ✅ Door, Ladder, Escalator
- ❌ Terrain dynamics (eau/herbe/sable)
- ❌ Jump/slide ledges (impossible sauter par-dessus rebord)
- ❌ Interactifs (PC, TV, bookshelf)
- ❌ Surf/dive
- ❌ Bridges spéciaux

Collision actuelle = `collisions[][]` générique bit 0 (passable/non), pas de MB_IMPASSABLE_* directionnel.

---

## 3. TOP 5 BUGS / MANQUES — par criticité

| # | Bug | Impact | Effort | Fix |
|---|---|---|---|---|
| 1 | **Auto-step après warp** seulement portes (pas escalier/ladder) | Joueur bloqué après warp intérieur | 30 min | Élargir `isDoorWarp` → `isInstantStepWarp` dans OverworldScene.ts:388 |
| 2 | **Item balls invisibles** (gfx OBJ_EVENT_GFX_ITEM_BALL non mappé + script `EventScript_ItemBall` non exécuté) | Impossible ramasser items au sol → starter Birch impossible | 2-4h | Patcher `npc-loader.ts` pour reconnaître item ball + sprite générique + EventScript handler |
| 3 | **Terrain behaviors manquants** (herbe haute, eau, sable) | Pas d'encounters sauvages générés correctement, surf impossible | 6-10h | Mapper 20-30 MB_* critiques vers logique encounter/walkable |
| 4 | **Jump ledges manquants** (MB_JUMP_*) | Routes Hoenn ont des rebords obligatoires pour progression | 2h | Détecter MB_JUMP_* → forcer 2-tile move + animation saut |
| 5 | **Hidden items + bg_events spécialisés** | Centres Pokémon (PC), TVs, bookshelves non-interactifs | 4-6h | Étendre bg_events parser + opcodes interactifs |

---

## 4. CHANTIERS D'EXTRACTION recommandés (pour appliquer en masse)

### 4.1 Centraliser dialogues maps
- Extraire `data/text/*.inc` (36 fichiers) → `dialogues-maps.json` global
- Resoudre les 49 maps "vides" (probablement sans dialogues, à confirmer)

### 4.2 Exposer MAP_SCRIPT tables runtime
- Parser `data/maps/*/scripts.inc` pour `.byte MAP_SCRIPT_ON_*` directives
- Stocker dans `scripts/<MapName>.json` : `{mapScripts: {ON_LOAD, ON_FRAME, ON_WARP}}`
- Déclencher au bon moment dans OverworldScene

### 4.3 Extraire metatile_behaviors.h
- Parser enum MB_* (240 entries) → `metatile-behaviors.json`
- Mapper vers categories (collision/terrain/warp/jump/interactive)
- Permet de faire évoluer `tilemap-loader.ts` proprement

### 4.4 Extraire item ball scripts
- Parser `data/scripts/items.inc` (s'il existe) ou regex `EventScript_ItemBall.*` dans tous les scripts.inc
- Output : `item-balls.json` `{scriptName: itemId}` → utilisé runtime

### 4.5 Extraire flags PIC pour items
- `include/constants/flags.h` : FLAG_ITEM_*, FLAG_HIDDEN_ITEM_*
- Output : `flags-items.json` permettant de savoir quel flag set au pickup

---

## 5. Pattern d'extraction "tout d'un coup"

**Tous les extracteurs maps actuels** suivent le même pattern :
```js
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
const decompMaps = `${decompPath}/data/maps`;
for (const mapName of readdirSync(decompMaps)) {
  const file = readFileSync(`${decompMaps}/${mapName}/scripts.inc`, 'utf8');
  const parsed = parseFunction(file);
  writeFileSync(`${out}/${mapName}.json`, JSON.stringify(parsed));
}
```

C'est trivial à itérer pour ajouter d'autres extractions (MAP_SCRIPT tables, item balls scan, etc.).

**Performance** : 519 maps traitées en <1 sec, aucun bottleneck.

---

## 6. Refs décomp

- Warps : `src/field_door.c`, `src/field_warp.c`, `src/overworld.c:WarpIntoMap`
- NPCs : `src/event_object_movement.c`, `include/constants/event_object_movement.h`
- Item balls : `src/data/event_scripts.s` (EventScript_ItemBall + std macros)
- Metatile behaviors : `include/constants/metatile_behaviors.h`, `src/metatile_behavior.c`
- Map control : `src/field_control_avatar.c` (TryStartWarpEventScript, TryRunCoordEvent)
- Map header : `include/global.fieldmap.h` (MapEvents, ObjectEventTemplate, WarpEvent, CoordEvent, BgEvent)
