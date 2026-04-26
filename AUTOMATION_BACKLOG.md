# AUTOMATION BACKLOG — pokemon-web-demo

> Ce qu'on doit automatiser/extraire pour ne plus avoir à coder à la main.
> Source : audit profond 2026-04-25. Trié par ROI (impact / effort).

---

## 1. Refactor "AUCUN PRÉ-RENDU" (règle dure session 11)

| Script | Statut | Action | Effort |
|---|---|---|---|
| `render-layouts.mjs` | ❌ Pré-rendu (65 MB) | **Supprimer** + virer `public/decomp/em/rendered/` | S — `tilemap-loader.ts` fait déjà le job runtime |
| `render-title.mjs` | ❌ Pré-rendu | Refactor → composition runtime dans `TitleScene` | M — charger `.png/.bin/.pal` bruts + canvas compose |
| `render-textbox.mjs` | ❌ Pré-rendu | Refactor → composition runtime dans `dialogue-box.ts` | S — palette swap simple sur 24×24 |
| `render-metatile-atlas.mjs` | ⚠️ Interim acceptable | Garder en build step (renommer `gen-` ?). Long terme : compose en runtime depuis `tiles.png + metatiles.bin + .pal` | L — refactor majeur de `tilemap-loader.ts` |

**Ordre recommandé** : `render-layouts` (gain immédiat 65 MB) → `render-textbox` (trivial) → `render-title` (intro polish).

---

## 2. Nouveaux extracteurs à écrire

### Priorité HAUTE (bloque jouabilité)

#### `extract-trainer-parties.mjs`
- **Input** : `data/trainers.h` + `data/trainer_parties.h` (ou équivalent C dans le décomp)
- **Output** : `public/decomp/em/trainers-parties.json`
  ```json
  {
    "TRAINER_WALLACE": {
      "class": "gym_leader",
      "ai_flags": [...],
      "party": [{ "species": "Sableye", "level": 53, "moves": [...], "item": null, "nature": "Bold" }, ...]
    }
  }
  ```
- **Pourquoi** : `src/data/trainers.ts` mock un Pikachu lvl 12. Bloque tous les vrais combats dresseurs.
- **Effort** : M (parser .h C ou .s asm — vérifier d'abord la forme dans le décomp)

#### `extract-wild-encounters.mjs`
- **Input** : `data/wild_encounters.h` (ou `.json` selon version du décomp)
- **Output** : `public/decomp/em/wild-encounters.json`
  ```json
  {
    "MAP_ROUTE101": {
      "land": [{ "species": "Zigzagoon", "min": 2, "max": 3, "rate": 20 }, ...],
      "water": [...], "rock_smash": [...], "fishing": {...}
    }
  }
  ```
- **Pourquoi** : sans ça, pas de Pokémon sauvage attrapable.
- **Effort** : S-M (le décomp a probablement déjà un JSON natif)

#### `extract-map-connections.mjs`
- **Input** : `data/maps/<Map>/connections.inc` (ou `map.json.connections` déjà extrait ?)
- **Output** : enrichir `public/decomp/em/maps/<Map>.json` avec champ `connections` propre
- **Pourquoi** : transitions entre maps adjacentes (pas seulement warps).
- **Effort** : S (vérifier si `extract-decomp.mjs` les copie déjà)

#### `extract-metatile-behaviors.mjs` ⭐⭐⭐ (audit session 38)
- **Input** : `D:\Projet 1\decomps\pokeemeraude\include\constants\metatile_behaviors.h`
- Parse l'enum MB_* (240 entries, 0x00-0xEF)
- **Output** : `public/decomp/em/metatile-behaviors.json`
  ```json
  {
    "0x00": {"name": "MB_NORMAL", "category": "collision", "passable": true},
    "0x02": {"name": "MB_TALL_GRASS", "category": "terrain", "encounter": true},
    "0x60": {"name": "MB_NON_ANIMATED_DOOR", "category": "warp", "type": "door"},
    "0x61": {"name": "MB_LADDER", "category": "warp", "type": "ladder"}
  }
  ```
- **Util Phaser** : `getBehaviorInfo(byte)` remplace les 17 constants hardcodées de `tilemap-loader.ts`
- **Bénéfice** : élargir progressivement le support des comportements (terrain, jump ledges, surf, interactifs PC/TV) sans hardcode
- **Effort** : S (1h) — c'est juste un parser d'enum C
- **ROI** : ÉNORME — débloque toutes les routes Hoenn (jump ledges obligatoires) + centres Pokémon (PC) + interactions diverses

#### `extract-item-balls.mjs` ⭐⭐ (audit session 38)
- **Input** : tous les `data/maps/<X>/scripts.inc` + `data/scripts/std_*.inc`
- Cherche les patterns `EventScript_ItemBall*` ou macro `giveitem_std`
- **Output** : `public/decomp/em/item-balls.json` `{ scriptLabel: { item, quantity, flag } }`
- **Bénéfice** : runtime sait quel item donner pour chaque pokeball au sol → fix le bloqueur "items invisibles"
- **Effort** : S (2h) — regex sur 519 maps + 57 std scripts
- **ROI** : HAUTE — débloque starter Birch + items routes 101-102

#### `extract-map-scripts.mjs` ⭐⭐ (audit session 38)
- **Input** : `data/maps/<X>/scripts.inc` — chercher tables `MAP_SCRIPT_ON_LOAD`, `MAP_SCRIPT_ON_FRAME_TABLE`, `MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE`, `MAP_SCRIPT_ON_TRANSITION`, `MAP_SCRIPT_ON_RESUME`
- Output : ajouter dans `scripts/<MapName>.json` la clé `mapScripts: { onLoad, onFrame, onWarp, onTransition, onResume }`
- **Bénéfice** : les états maps persistants (ex: porte qui s'ouvre une fois après event, panneau qui change de texte) deviennent disponibles
- **Effort** : S (1h) — extension de l'extracteur scripts existant
- **ROI** : MOYEN — pas bloquant MVP mais polish important pour cohérence narrative

#### `extract-rendered.py` ⭐⭐ (généralisation, session 37)
- **Pattern actuel** : `extract-intro-rendered.py` traite intro + title via 4 fonctions clés
  (read_jasc_pal, apply_palette, compose_tilemap, make_transparent_sprite)
- **Généraliser à TOUT le décomp** : naming + birch_speech + main_menu + battle backgrounds + evolution + interfaces
- **Pattern** : pour chaque scène, déclarer un dict `{ atlas, tilemap, palette, output, options }` puis appliquer la chaîne de transformations
- **Effort** : M (généralisation = ~50 LOC ajouts pour parcourir un manifest YAML/JSON)
- **ROI** : ÉNORME — toutes les scènes futures (~10 écrans) bénéficient automatiquement

#### `extract-oam-sprites.mjs` ⭐ (découvert session 35 — IntroScene)
- **Input** : tables OAM dans le décomp (`sOamData_*`, `sAnim_*`, `sSpriteTemplate_*`)
  - Pattern omniprésent : intro.c, title_screen.c, birch_speech.c, naming_screen.c, battle anims, etc.
- **Output** : `public/decomp/em/oam-sprites.json`
  ```json
  {
    "GameFreakLogo": {
      "atlas": "intro/scene_1/drops_logo.png",
      "shape": [32, 64],
      "tileNum": 128,
      "atlasStrideTiles": 4,   // largeur atlas en tiles (mode 1D_MAP)
      "atlasRect": [0, 256, 32, 64],  // pre-calculé : x,y,w,h dans le PNG
      "palette": "logo.pal"
    },
    "GameFreakLetter_G": { "shape": [16,16], "tileNum": 80, "atlasRect": [0,160,16,16], ... }
  }
  ```
- **Util Phaser associé** : `loadOamSprite(scene, name)` qui :
  - Charge l'atlas si pas déjà chargé
  - Appelle `texture.add(name, 0, x, y, w, h)` avec atlasRect
  - Retourne la frame name pour `add.image(x, y, atlasKey, name)`
- **Bénéfice** : tous les sprites OAM du décomp utilisables en 1 ligne, fini le décodage manuel des tile indices à chaque scène.
- **Scope initial** : intro.c (logo GF, lettres, drops, sparkle, flygon, presents) + title_screen.c (logo Pokemon)
- **Effort** : M — parser regex sur les `.SpriteTemplate`/`OamData`/`AnimCmd` C struct literals
- **ROI** : ÉLEVÉ — débloque toutes les scènes restantes (intro Scenes 2/3, naming, birch speech, evolution anim, etc.)

---

### Priorité MOYENNE

#### Refactor `dialogue-box.ts` + `menu.ts` selon `DIALOGUE_FONT_MENU_REFERENCE.md`
- Positions exactes (textbox 16,120,216,32 ; yesnobox 168,72,40,32)
- Palette appliquée (color 1=fond, 2=texte, 3=ombre depuis text_pal1.pal)
- Codes ctrl inline (0xFC + sub-code) pour color/font/pause
- Animation arrow {0,1,2,1} période 8 frames
- Glyph widths via `gFont<X>LatinGlyphWidths[]` (à extraire depuis fonts.c)

#### `extract-list-menu-items.mjs` (multichoice tables)
- Input : `data/script_menu.h` ou `data/scripts/list_menu_items.inc`
- Output : `multichoice-tables.json` : `{ "MULTI_X": ["label1", "label2", ...] }`
- Permet à l'opcode `multichoice` d'afficher de vrais choix (au lieu de retourner 0)

#### Hardcode résiduel à nettoyer (cf. audit session 25)
- `src/data/trainers.ts:12-19` : supprimer `PLAYER_TEAM` mock (BattleScene utilise déjà `gameState.party`)
- `src/scenes/MenuOverlayScene.ts:30-37` : labels POKéDEX/POKéMON/SAC depuis strings.json
- `script-runner.ts SPECIALS` : ajouter stubs pour specials critiques narrative (`BirchGiveStarterPokemon`, `GiveStarter`, `GivePokedex`) — à wirer quand identifiés via grep des scripts utilisés

#### Sprite flèche au-dessus du joueur sur arrow warp
- **Pourquoi** : Le décomp affiche un petit sprite flèche directionnelle quand le joueur stand sur un MB_*_ARROW_WARP et fait face dans la direction de l'arrow. Aide visuelle pour indiquer "tu peux sortir".
- **Source décomp** : `field_player_avatar.c:HideShowWarpArrow` + `ShowWarpArrowSprite`. Sprite probablement dans `graphics/object_events/special/warp_arrow.png` ou similaire.
- **Effort** : S — un sprite Phaser positionné dynamiquement, mis à jour dans `update()` quand `playerFacing == arrow direction`.
- **Priorité** : cosmétique mais améliore l'UX significativement.

#### Hardcodes critiques (cf. session 17 audit)
- `src/data/trainers.ts` : `PLAYER_TEAM` mocké → bloque combats dresseur. **Dépend** de `extract-trainer-parties.mjs`.
- `src/data/map-names-fr.ts` : 16 zones hardcodées en FR. Le décomp a `region_map_sections.json` complet. **Effort** : S.
- `MenuOverlayScene.ts` : labels "POKéDEX/POKéMON/SAC/RETOUR" hardcodés au lieu de `gText_Menu*` extrait dans strings.json. **Effort** : S.

#### Fix `extract-object-events.mjs` — frameHeight heuristique
- **Symptôme** : `OBJ_EVENT_GFX_MOVING_BOX` et `OBJ_EVENT_GFX_ITEM_BALL` ont `frameHeight: 32` dans `object-event-graphics.json`, mais leur PNG est 16×16. Résultat : `SpriteSheet frame dimensions will result in zero frames` + `no frame "2"` warnings.
- **Action** : lire la vraie taille du PNG (header bytes) au lieu de l'heuristique actuelle, OU lire le `width/height` depuis le ObjectEventGraphicsInfo C struct du décomp.
- **Effort** : S

#### `extract-metatile-labels.mjs`
- **Input** : `data/maps/<Map>/metatile_labels.h` + `include/constants/metatile_labels.h`
- **Output** : `public/decomp/em/metatile-labels.json` { "METATILE_InsideOfTruck_ExitLight_Top": 0x250, ... }
- **Pourquoi** : opcode `setmetatile` est actuellement no-op car les labels ne sont pas résolus en numérique. Bloque les portes statiques, les lumières du truck, les changements de tile via script.
- **Effort** : S (parsing #define dans .h)

#### `extract-tileset-anims.mjs`
- **Input** : `tilesets/<kind>/<name>/anim/` + `src/tileset_anims.c` (callbacks)
- **Output** : `public/decomp/em/tilesets/<name>/anims.json`
  ```json
  { "flower": { "metatile_ids": [508, 509], "frames": ["frame1.png", ...], "interval_ms": 250 } }
  ```
- **Pourquoi** : eau/fleurs/cascades animées (assets déjà copiés mais inutilisés).
- **Effort** : M (parser callbacks C pour mapping tilesetId → anim group)

#### `extract-items.mjs`
- **Input** : `data/items.h` + `include/constants/items.h`
- **Output** : `public/decomp/em/items.json` { "ITEM_POTION": { name, price, description, pocket, effect_id } }
- **Pourquoi** : prérequis pour Bag UI et item use.
- **Effort** : S (parsing .h structuré)

#### `extract-pokedex-entries.mjs`
- **Input** : `data/pokemon/pokedex_entries.h` (FR si dispo, sinon EN)
- **Output** : `public/decomp/em/pokedex-entries.json`
- **Pourquoi** : Pokédex affiche descriptions originales du jeu.
- **Effort** : S

### Priorité BASSE

#### Étendre la table `SPECIALS` dans `script-runner.ts`
- **Pourquoi** : Le décomp a 527 specials. La table `SPECIALS` actuelle en a 3. Au fur et à mesure des dialogues testés, identifier les `special <Name>` qui font du buffer string ou du change-state critique et les implémenter.
- **Méthode** : grep dans `data/specials.inc` pour le mapping ID → fn C, lire la fn dans `src/script_specials.c` ou équivalent, traduire en TS.
- **Effort** : S par special, mais 30-50 candidats potentiels.

#### Implémenter les opcodes `bufferXXX`
- **Pourquoi** : `bufferspeciesname N, SPECIES_X` / `bufferpartymonnick N, INDEX` / `bufferleadmonspeciesname N` / `bufferitemname N, ITEM_X` / `bufferstring N, "text"` / etc. Tous ces opcodes alimentent les STR_VAR_N. Sans eux beaucoup de dialogues affichent vide.
- **Dépendance** : pour `bufferspeciesname` il faut `species-names.json` (FR du décomp). Pour `bufferitemname` il faut `items.json` (cf. extract-items.mjs).
- **Effort** : S une fois les data tables extraites.

#### `extract-battle-ai.mjs`
- **Input** : `data/battle_ai_scripts.s` (91 KB)
- **Output** : `public/decomp/em/battle-ai.json` { "AI_SCRIPT_X": [{cmd, args}, ...] }
- **Pourquoi** : remplacer RandomPlayerAI de `@pkmn/sim` par AI Gen 3 fidèle. **Optionnel**, @pkmn/sim a déjà une AI correcte.
- **Effort** : L (bytecode AI Gen 3 complexe)

#### `extract-fonts.mjs`
- **Input** : `graphics/fonts/` + `charmap.txt`
- **Output** : `public/decomp/em/ui/fonts.json` (charset table par font)
- **Pourquoi** : remplacer fallback CSS monospace par vraie font Émeraude variable-width.
- **Effort** : M (déjà partiellement fait via `bitmap-font.ts` + `latin_normal.png`)

---

## 3. Opcodes script-runner manquants (par fréquence d'usage)

> Couverture actuelle : **58/220 (26%)** mais top opcodes à 100%.
> Liste des prochains à implémenter par ROI :

### Critique (bloque jouabilité Phase 2 = Routes 101-103)
| Opcode | Occurrences | Effort | Notes |
|---|---|---|---|
| `trainerbattle_single` | 910 | M | Câbler vers `BattleScene` avec trainer_id résolu |
| `case` / `switch` | 3064 + 788 | S | Implémenter switch table (déjà des compare_*) |
| `special HealPlayerParty` | 92 | S | Restore tous les Pokémon (Centre Pokémon) |
| `special LoadPlayerParty` | 108 | S | Charger party depuis save |
| `special SavePlayerParty` | 72 | S | Sauvegarder party dans state |
| `special DrawWholeMapView` | 156 | S | Refresh map après `setmetatile` (portes lock/unlock) |

### Important (Phase 3 = Gyms Hoenn)
| Opcode | Occurrences | Effort |
|---|---|---|
| `trainerbattle_doubles` | ~100 | M |
| `trainerbattle_rematch` variants | ~50 | M |
| `dowildbattle` / `setwildbattle` | ~50 | S (après wild_encounters) |
| `giveitem` | 320 | S (après items.json) |
| `finditem` | 332 | S |
| `multichoice` | 288 | M (UI menu) |
| `bufferitemname` / `bufferspeciesname` / etc. | ~100 chaque | S (string buffers) |
| `MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE` callback | 1128 | S (déclencher après warp) |
| `MAP_SCRIPT_ON_RESUME` | — | S (après load save) |
| `MAP_SCRIPT_ON_RETURN_TO_FIELD` | — | S (sortie combat/menu) |

### Nice-to-have (luxe)
- `pokemart` (shop)
- `playslotmachine`
- `setberrytree`
- `choosecontestmon`
- 80% des 527 `special` (mostly UI / cosmetic)

---

## 4. Refactor TS prioritaires

### `OverworldScene.ts` (584L)
- **Symptôme** : Hub central avec 8+ responsabilités
- **Action** : extraire 3 modules
  - `OverworldInput` (gestion clavier, tap/hold, cooldowns)
  - `OverworldWarp` (logique warp + transitions)
  - `OverworldScriptContext` (factory du `ScriptContext` injecté au runner)
- **Effort** : M
- **Bénéfice** : permet d'éditer warps/input sans toucher au reste

### `script-runner.ts` (311L, switch 160L)
- **Symptôme** : 160 lignes de switch case → ajouter un opcode = risque régression
- **Action** : dispatch table `Map<string, (ctx, args) => Promise<NextStep>>`
  - Chaque opcode = fonction dans `engine/script-opcodes/<category>.ts` (flow.ts, dialogue.ts, npc.ts, etc.)
  - Auto-discovery via index
- **Effort** : M
- **Bénéfice** : ajouter le top 10 manquant devient additif et sans risque

### Factory canvas-texture
- **Symptôme** : alpha-process dupliqué 5x
- **Action** : créer `src/engine/canvas-texture.ts` avec
  - `loadIndexedPng(url, paletteUrl?)` → Canvas avec alpha=0 sur color-0
  - `addAsTexture(scene, key, canvas)` → enregistre + retourne Texture
  - Tous les loaders existants migrent vers ça
- **Effort** : S
- **Bénéfice** : ~80 LoC supprimées, comportement uniforme

### Constantes magic numbers
- Créer `src/engine/constants.ts` avec :
  - `WALK_DURATION_MS = 220`, `RUN_DURATION_MS = 120`, `TAP_TURN_THRESHOLD_MS = 80`
  - `MENU_DEPTH = 300000`, `UPPER_LAYER_DEPTH = 100000`
  - `MOVEMENT_DURATIONS = { walk: 220, slow: 320, fast: 130, faster: 90, jump: 240, jump_2: 320 }`
- **Effort** : S
- **Bénéfice** : tweaks de feel game centralisés

---

## 5. Données du décomp jamais consommées (à investiguer)

| Path décomp | Contenu | Action |
|---|---|---|
| `data/battle_scripts_*.s` | Trainer parties | → `extract-trainer-parties.mjs` |
| `data/battle_ai_scripts.s` | Battle AI Gen 3 | → `extract-battle-ai.mjs` (low priority) |
| `data/maps/<Map>/connections.inc` | Connections cardinales | Vérifier `extract-decomp.mjs` |
| `data/items.h` | 376 items | → `extract-items.mjs` |
| `data/wild_encounters.h` | Encounters par map | → `extract-wild-encounters.mjs` |
| `data/specials.inc` | 527 specials → fn C | Inventaire pour roadmap specials |
| `data/text/species_names.h` | Noms FR Pokémon | À croiser avec `@pkmn/dex` FR |
| `graphics/items/`, `graphics/balls/`, `graphics/berries/` | Icônes inventaire | À copier (extract-decomp) si pas déjà |
| `graphics/battle_anims/` | Anims combat | Skip (Phaser anims maison suffisent) |

---

## 6. Validation pipeline (santé extraction)

À ajouter à `scripts/extract-decomp.mjs` ou nouveau `scripts/validate-extraction.mjs` :
- [ ] Compteur d'éléments (X maps extraites / Y attendues, etc.)
- [ ] Détection orphelins (`map-dumps/` est-il consommé ?)
- [ ] Hash check sur les .bin pour détecter corruption
- [ ] Diff vs run précédent (alerte si chute brutale)

---

## 7. Backlog "questions ouvertes" à résoudre par lecture du décomp

- Comment `tileset_anims.c` détecte les metatiles à animer ? (mapping tilesetId → anim_callback)
- Format exact des trainer parties dans le décomp pokeemeraude (struct C ou .s asm ?)
- Liste exhaustive des `special` utilisés dans les scripts du début (Littleroot → Route101 → Oldale)
- Comment `MAP_SCRIPT_ON_WARP_INTO_MAP_TABLE` filtre par warp source (par x/y ? par dest_warp_id ?)
- Y a-t-il un format JSON natif pour wild_encounters dans le décomp moderne ?
