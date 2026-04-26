# ARCHITECTURE — pokemon-web-demo

> Carte du code et des assets. Source : audit profond du 2026-04-25 (4 agents Explore en parallèle).
> À mettre à jour au fur et à mesure que le code évolue significativement.

---

## 1. Vue d'ensemble

- Stack : Vite + TypeScript + Phaser 3 + @pkmn/sim + Tone.js
- Source unique de vérité : décomp `pokeemeraude` à `D:\Projet 1\decomps\pokeemeraude`
- Consommé via : scripts `extract-*.mjs` → `public/decomp/em/` (servi statiquement par Vite)
- ~2000 LoC TS, 27 fichiers, 0 dépendance circulaire

---

## 2. Carte des modules (27 fichiers .ts)

### Entry & data
| Fichier | LoC | Rôle |
|---|---|---|
| `src/main.ts` | 32 | Init Phaser, constantes globales (TILE_SIZE, GAME_W/H), enregistre 7 scenes |
| `src/data/trainers.ts` | 30 | Mock équipes (Pikachu lvl 12) — **à remplacer par extract trainer parties** |
| `src/data/map-names-fr.ts` | 29 | Table FR noms zones — **incomplet, à étendre depuis region_map_sections.json** |

### Engine (`src/engine/`, 13 fichiers)
| Fichier | LoC | Rôle | Stabilité |
|---|---|---|---|
| `tilemap-loader.ts` | 221 | Parse map.bin + behaviors → 2 TilemapLayer (lower/upper) + border TileSprite | ✅ Stable |
| `script-runner.ts` | 311 | Interpréteur opcodes décomp (58/220 implémentés) | ⚠️ Switch 160L à refactor en dispatch table |
| `dialogue-box.ts` | 250 | Textbox 9-slice + canvas + flèche + multi-pages | ✅ Stable |
| `music.ts` | 254 | Tone.js MIDI player + voicegroups | ⚠️ Couplé Tone.js, à abstraire |
| `movement.ts` | 157 | Opcodes walk/face/jump/delay (~40 actions) | ✅ Stable |
| `bitmap-font.ts` | 138 | Texte variable-width (latin_normal.png) | ✅ Stable |
| `game-state.ts` | 105 | Singleton flags/vars/save localStorage | ⚠️ `party: unknown[]` — pas de struct Pokémon |
| `npc-loader.ts` | 97 | object_events JSON → ResolvedNpc[] | ✅ Stable |
| `menu.ts` | 88 | Composant menu (curseur + keyboard) | ✅ Stable |
| `map-scripts.ts` | 82 | Helpers MAP_SCRIPT_* (4/7 callbacks utilisés) | ⚠️ ON_WARP_INTO, ON_RETURN, ON_DIVE manquants |
| `character-anims.ts` | 79 | Frames idle/step NPC + flip horizontal | ✅ Stable |
| `door-anim.ts` | 71 | Animation porte au warp | ✅ Stable |
| `new-game-init.ts` | 45 | Lance scripts d'init du décomp via script-runner | ✅ Stable |
| `string-buffers.ts` | 28 | Singleton STR_VAR_1..4 partagé runner ↔ dialogue-box | ✅ Stable |
| `data-tables.ts` | ~120 | Singleton tables décomp (text/items/trainers/wild/metatiles/constants) | ✅ Stable |
| `pokemon.ts` | ~150 | PokemonInstance + factory (calc HP Gen 3 + moves via @pkmn/dex) | ✅ Stable |

### Scenes (`src/scenes/`, 7 fichiers)
| Fichier | LoC | Rôle |
|---|---|---|
| `OverworldScene.ts` | **584** | Hub central : tiles + NPCs + scripts + warps + input — **trop gros, à découper** |
| `NamingScene.ts` | 201 | Saisie nom (clavier virtuel via `keyboard.json`) |
| `BattleScene.ts` | 151 | Arena + log texte (combat via `battle/runner.ts`) |
| `TitleScene.ts` | 70 | Rayquaza + press start + cri |
| `MenuOverlayScene.ts` | 71 | Menu Start (POKéDEX/SAUVER/etc.) — Pokédex/Bag/Party = TODO |
| `BirchSpeechScene.ts` | 62 | Intro Birch + choix genre |
| `MainMenuScene.ts` | 50 | Continue / Nouvelle Partie / Option (Option = TODO) |

### Battle, util, editor
| Fichier | LoC | Rôle |
|---|---|---|
| `src/battle/runner.ts` | 94 | Wrapper @pkmn/sim streaming → events FR |
| `src/util/sprite-transparency.ts` | 58 | Pixel (0,0) → alpha 0 pour spritesheets |
| `src/util/image-alpha.ts` | 28 | Idem pour images simples (DOUBLON — voir §5) |
| `src/editor/editor.ts` | 167 | Éditeur de map placeholder (POC, pas modulaire) |

---

## 3. Graphe d'appel (chemins critiques)

```
TitleScene → music + sprite-transparency → MainMenuScene
MainMenuScene → game-state.load() → BirchSpeech | OverworldScene (continue)
BirchSpeech → dialogue-box + menu → NamingScene
NamingScene → game-state.resetForNewGame() → new-game-init.runNewGameInit() → OverworldScene

OverworldScene (HUB)
├─ tilemap-loader.buildTilemap()         → parse map.bin + atlas pair
├─ npc-loader.resolveNpcs()              → spawn NPCs depuis map.json
├─ script-runner.runScript()             → interpréteur (W/interaction/warps)
│   ├─ game-state (flags/vars r/w)
│   ├─ dialogue-box.show() (msgbox)
│   ├─ movement.runMovement() (applymovement)
│   └─ warp callback → scene.restart()
├─ map-scripts.runMapScript() (ON_TRANSITION + ON_FRAME_TABLE)
├─ music.playMidiLoop()
├─ door-anim.playDoorOpen()
└─ input → tryMove() / interactFront()

BattleScene ← OverworldScene → battle/runner.runBattle() (@pkmn/sim) → back
```

**Points névralgiques** :
- `OverworldScene.tryMove()` + `triggerWarp()` : tout le mouvement joueur
- `script-runner.runScript()` : 160L de switch (à refactor en dispatch table)
- `OverworldScene.buildScriptContext()` : ~100L (10+ callbacks injectés au runner)
- `OverworldScene.afterNpcsLoad()` : 103L (spawn + map scripts)

---

## 4. Inventaire assets extraits (`public/decomp/em/`, ~110 MB)

| Dossier | Taille | Contenu | Consommé par |
|---|---|---|---|
| `boot/` | 221K | intro/title/birch/naming PNG + .pal | TitleScene, BirchSpeech, NamingScene |
| `cries/` | 3.9M | 388 WAV cris Pokémon | BattleScene, TitleScene (Rayquaza) |
| `layouts/` | 1.8M | 441 map.bin + border.bin | tilemap-loader |
| `maps/` | 3.0M | 518 map.json (events, warps, signs) | OverworldScene, npc-loader |
| `map-dumps/` | 5.0M | ⚠️ contenu inconnu, **probablement orphelin** | personne ? |
| `music/` | 4.4M | 530 MIDI + voicegroups JSON | music.ts |
| `object_events/` | 547K | sprites NPC overworld | npc-loader |
| `pokemon/` | 6.1M | 388 front/back/icon/footprint/.pal | BattleScene |
| `rendered/` | **65M** | 441 PNG pré-rendus par layout | ❌ **violation règle no-prerender, à virer** |
| `scripts/` | 7.0M | 518 scripts.json (parsé) | script-runner |
| `sfx/` | 888K | 105 WAV samples | (pas encore consommé) |
| `tileset-pairs/` | 7.3M | atlases lower/upper par paire (interim acceptable) | tilemap-loader |
| `tilesets/` | 2.5M | tiles.png + metatiles.bin + attributes.bin bruts | render-metatile-atlas (input) |
| `trainers/` | 299K | front_pics + back_pics | BattleScene |
| `ui/` | 190K | text_window, fonts, doors, charmap | dialogue-box, bitmap-font |

JSON racine : `_summary`, `flags-vars` (775+185), `keyboard`, `layouts-index`, `map-ids`, `object-event-graphics`, `placeholders`, `strings` (5658 textes FR).

---

## 5. Dette technique cataloguée

### TODO/FIXME en code (4 occurrences)
| Path:Line | Item |
|---|---|
| `TitleScene.ts:12` | Logo Pokémon 8bpp non décodé (tile IDs débordent char block) |
| `MainMenuScene.ts:46` | OPTION menu non implémenté |
| `dialogue-box.ts:18` | Opcodes bufferplayername (STR_VAR_N) |
| `game-state.ts:31` | Structure Pokémon dans SaveData.party |

### Code smells
- **Duplication alpha-process en 5 endroits** (`bitmap-font`, `dialogue-box`, `door-anim`, `sprite-transparency`, `image-alpha`) → factoriser en `engine/canvas-texture.ts`
- **Fonctions > 80L** : `script-runner.runScript` (160L), `OverworldScene.buildScriptContext` (~100L), `OverworldScene.afterNpcsLoad` (103L), `music.playMidiLoop` (~70L)
- **Magic numbers** : `300000` (menu depth), `220/120` (walk/run cooldown), `80` (TAP_TURN_THRESHOLD_MS), `240/320/90` (movement durations)
- **Données mockées** : `PLAYER_TEAM` dans `trainers.ts` (1 Pikachu — vrai trainer party manque)

### Manques systémiques (non-TODO mais évidents)
- `game-state.party = unknown[]` → pas de struct Pokémon (SaveBlock1 du décomp non porté)
- Pas d'inventaire (sac, items, ball, berries, CT/CS)
- Pas de Pokédex
- Pas de wild encounters
- Pas de party menu (équipe)
- Pas d'input joueur en combat (RandomPlayerAI des deux côtés)
- Pas de HP bar visuel
- Pas de tileset animations runtime (assets OK)
- Fonts en CSS monospace (vraie font Émeraude pas câblée)

---

## 6. Conventions et patterns à conserver

### Bons patterns (déjà appliqués)
1. **Lazy-load assets par scène** (`scene.load.binary/json/image` dans `preload`)
2. **Cache via `scene.cache.json/binary`** (pas de re-fetch)
3. **Types stricts** : `TilesetPairInfo`, `MapJson`, `ResolvedNpc`, etc.
4. **Constantes hex avec commentaires** : `MB_NON_ANIMATED_DOOR = 0x60` (référence directe au décomp)
5. **Séparation logique/présentation** : `script-runner` indépendant de Phaser via `ScriptContext`

### Patterns à généraliser
1. `ScriptContext` (interface de callbacks) → modèle pour futurs sous-systèmes (AI, quests)
2. Resolver pattern (`resolveNpcs` retourne descripteurs, pas des sprites) → utile pour party loader, item loader
3. Factory de canvas-texture (à créer pour mutualiser les 5 alpha-process)

---

## 7. Ce qu'il NE faut PAS porter (du décomp)

| Catégorie | Raison |
|---|---|
| `src/battle_*.c` (engine combat) | Remplacé par `@pkmn/sim` |
| `src/battle_anim_*.c` (35 fichiers) | Bas niveau GBA, Phaser anims suffisent |
| `src/bg.c`, `gpu_regs.c`, `palette.c`, `blit.c`, `sprite.c` | GBA-spécifique, Canvas/WebGL remplace |
| `src/agb_flash*.c`, secteurs save | EEPROM GBA → localStorage JSON |
| `src/link.c`, mystery_gift, union_room | Hors scope mono-joueur |
| `src/rtc.c`, wallclock | Date JS native suffit |
| Slot machine, berry blender, roulette | Minigames optionnels |
| Braille puzzles | Hardcore post-game |

---

## 8. Métriques

| Métrique | Valeur | Cible |
|---|---|---|
| Total LoC TS | ~2000 | — |
| Fichiers > 300L | 2 (OverworldScene, script-runner) | < 2 |
| Fonctions > 80L | 5 | < 3 |
| TODO/FIXME | 4 | 0 |
| Duplication alpha-process | 5x | 1x |
| Test coverage | 0% | — |
| Opcodes script-runner | 63/220 (29%) | — (couvre top usage, special wiré via SPECIALS table) |
| Map scripts callbacks | 4/7 | 5/7 (skip Dive + ReturnToField pour MVP) |
| Pré-rendu sur disque | 65 MB | 0 |
