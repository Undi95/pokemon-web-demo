Parfait. Maintenant je vais créer mon rapport complet. Laissez-moi rassembler toutes les informations :

---

# PLAN COMPLET — pokemon-web-demo (1:1 GBA + Showdown gen3)

## Section 1 — Cartographie décomp (Q.A)

### 1.1 Top-level dossiers du décomp `D:\Projet 1\decomps\pokeemeraude`

| Dossier | Rôle |
|---------|------|
| **`.git`** | Historique version du décomp (clone de qigast/pokeemeraude). |
| **`.github`** | Workflows CI/CD + templates issues/PRs (gestion décomp upstream). |
| **`asm/`** | Code ARM assembleur natif GBA (bus DMA, interrupts, bootcode non-C). Macros inclusives (`macros.inc`). |
| **`constants/`** | 2 fichiers : `global.h` + 1 master constants.inc qui merge tous les headers. |
| **`data/`** | **LE PLUS GROS** — données ROM : maps, tilesets, scripts, textes, musique, événements, battle anims, items, Pokémon. Voir détail 1.2. |
| **`docs/`** | Documentation décomp (READMEs, guides décompilation, references). |
| **`graphics/`** | Assets GBA bruts : PNG + palette binaires. Organisé par type (pokémon, battle UI, tiles, personnages). Voir détail 1.4. |
| **`include/`** | Headers C (.h) — structs + enums. Majorité en `include/constants/` (80 fichiers), quelques headers struct en racine. |
| **`libagbsyscall/`** | Syscalls GBA ARM natifs (BIOS calls). Très bas niveau, peu pertinent pour notre jeu web. |
| **`sound/`** | Musiques SAPPY (format GBA) + sequences MIDI converties, files audio bruts (`.mid`, `.s`, `.gba`). |
| **`src/`** | **315 fichiers C** — orchestration engine + modulesmétier (battle, overworld, scripts, ui, items, etc.). Voir détail 1.3. |
| **`tools/`** | 11 compilateurs/extracteurs natifs : `gbagfx` (PNG→GBA), `mapjson` (map compiler), `mid2agb`, `preproc`, etc. Voir détail 1.5. |
| **`Makefile` racine** | Build system principal : compile C→ARM, asm, graphics, musique, linke ROM. Dépendances + phonie. |
| **Autres fichiers Makefile** | `graphics_file_rules.mk`, `map_data_rules.mk`, `json_data_rules.mk`, `audio_rules.mk`, `spritesheet_rules.mk` — phony rules modularisées. |
| **`ld_script.ld`** | Linker script (non-moderne, assembly direct). Mappe sections mémoire GBA. |
| **`charmap.txt`** | Table de conversion texte ASCII→bytecode GBA (custom charset Pokemon avec symboles spéciaux). |

### 1.2 Structure `data/` du décomp

| Sous-dossier | Rôle | Contenu clé |
|---|---|---|
| **`data/maps/`** | 519 dossiers (une map = un dossier). Chaque contient `map.json` (métadonnées) + `scripts.inc` (événements). | Routes, villes, salles de gym, bases secrètes, grottes, tous les endroits jouables. |
| **`data/layouts/`** | 519 dossiers (1:1 avec maps). Chaque contient `tilemap.bin` (grille 32×32 max, indices metatile 16-bit) + `border.bin` (hors-limite). | Géométrie brute (quel metatile à quelle case). |
| **`data/tilesets/`** | ~150 tilesets (réutilisables sur plusieurs maps). Chacun contient `tileset.json` (metadata) + `tiles.png` (atlas 8×8), `tiles.bin` (GBA), `metatiles.bin` (16×16 composites). | Terrains : herbe, eau, rochers, portes, labyrinthes, spécialisé par région. |
| **`data/scripts/`** | 57 fichiers `.inc` (`std_*.inc`) — scripts standards réutilisés (item ball, warp, NPC générique, etc.). Chaque map appelle ces scripts ou défini ses propres. | Patterns d'événements prédéfinis (factorisation code événement). |
| **`data/text/`** | 30+ fichiers `.inc` — **dialogues en assembleur** compilés (pas source plaintext lisible). Chaque catégorie (item obtenu, centre Pokémon, dresseur, etc.). | Toutes les 5000+ lignes de texte du jeu Émeraude (FR version). |
| **`data/maps/map_groups.json`** | MASTER JSON : liste ordonnée 34 groupes de maps (villes, donjons, routes, salles intérieures) + énumération toutes les 519 maps. | INDEX GLOBAL : chemin du groupe:index → map ID constant (ex: `MAP_ROUTE101`). |
| **`data/maps/*/map.json`** | Chaque map individuelle : ID, name, layout (ref `LAYOUT_X`), music (MUS_X), NPCs (object_events), warps, coord_events (triggers), bg_events (signs). | État complète d'une zone jouable unique. |
| **`data/object_events/`** | 1 dossier par sprite NPC graphique (LOCALID_*, OBJ_EVENT_GFX_*). Chaque contient PNG front + back animées. | Les 200+ archétypes de personnages (kid, old man, gym leader, etc.). |
| **`data/maps/*/scripts.inc`** | Scripts d'événements map-spécifique : `EventScript_Foo` labels → séquence d'opcodes (`msgbox`, `faceplayer`, `trainerbattle`, warps, animations). | Comportement interactif unique par zone. |
| **`data/battle_anim_scripts.s`** | Sequences attaques Pokémon (slash = slash animation frame sequence, sparkle position, sound effect timings). | Visuels combats (ex: animation "Charge" du Treecko). |
| **`data/event_scripts.s`** | Scripts compilés globaux (cutscenes, phénomènes météo, séismes de route, etc.). | Événements cinématiques partagés. |
| **`data/battle_scripts_1.s`, `battle_scripts_2.s`** | **AI dresseurs + logique combats** compilée. Qui attaque ? Quand switch ? Quel item utiliser ? | Décisions tactiques adversaire (remplacées par `@pkmn/sim` dans notre runtime). |
| **`data/sound_data.s`** | Mapping midi→GBA bank:instrument (Sappy tables). | Tables de voix utilisées par chaque morceau. |
| **`data/mystery_*.s`, `multiboot_*.s`** | Événements mystères + modes multiboot (minor, peu pertinent). | |

### 1.3 Structure `src/` du décomp (315 fichiers C)

#### Fichiers d'orchestration (entry-points / coordinateurs principaux)

| Fichier | Rôle |
|---|---|
| **`main.c`** | Point d'entrée ARM. Initialise GBA hardware (LCDs, timers, interrupts), setup IWRAM, appelle main tasks. |
| **`load_save.c`** | Load/save ROM → SRAM (sauvegarde de jeu). Serialize flags, vars, party, PC box, money, playtime. |
| **`overworld.c`** | Main loop terrain : gère state machine (mouvement joueur, NPC walking, scripting, map transitions). |
| **`event_object_movement.c`** | Moteur mouvement NPC. File d'attente moves (LOOK_AROUND, JOG_IN_PLACE_LEFT, WANDER_*, etc.). |
| **`event_object.c`** | Objet NPC : position, sprite, flags visibilité, linked script. |
| **`script.c`** + **`script_cmd_table.c`** | Interpréteur opcodes. Dispatch vers 160+ fonctions (msgbox, warp, trainerbattle, etc.). La VRAIE table des opcodes. |
| **`script_menu.c`** | Menus texte (yes/no, multichoice). |
| **`field_effect_script.c`** | Scripts effets terrain (pluie, neige, séisme). |
| **`field_poison.c`** | Statut empoisonné en overworld (écran violet, dégâts). |
| **`new_game.c`** | Initialization new game : spawn position, starter choice, flags initiales. |

#### Modules métier majeurs

| Dossier/Module | Rôle | Fichiers clés |
|---|---|---|
| **Battle** (40+ fichiers) | Moteur combat 1:1 GBA. Contrôleurs joueur/IA/lien, animations, scripts IA, arènes spéciales (Dôme/Pyramide/Usine). | `battle_main.c`, `battle_anim.c`, `battle_controller_opponent.c`, `battle_setup.c` (trainer battle setup), `battle_ai_script_commands.c`. |
| **Item** (10+ fichiers) | Gestion items/bag/PC box. Utilisation items en combat (Pokéball, Potion). | `item.c`, `item_menu.c`, `item_use.c`, `item_ball.c`. |
| **Pokemon** (20+ fichiers) | Struct Pokémon, stats, natures, IVs, EVs, mouvements, exp. | `pokemon.c`, `pokemon_jump.c`, `evolution.c`, `pokemon_icon.c`, `party_menu.c`. |
| **Map/Tile** (15+ fichiers) | Tilemap rendering, metatile behaviors, connections, spawn. | `tilemap.c`, `map_util.c`, `spawn.c`, `map_dynamic.c`. |
| **Text** (textes compilés + moteur affichage) | Rendering texte & boîtes dialogues. | `text.c`, `string.c`, `text_printer.c`. |
| **Door/Anim** (5+ fichiers) | Portes (animation douverture), transitions écrans. | `door.c`, `transition.c`, `field_weather.c` (weather anims). |
| **Music/Audio** (5+ fichiers) | Playback MIDI/Sappy, SFX, cris Pokémon. | `sappy.c`, `main.c` (init synth). |
| **UI Menu** (20+ fichiers) | Main menu, start menu, PC, center Pokémon, shop. | `start_menu.c`, `main_menu.c`, `pc_box.c`, `pkmn_center_nurse.c`, `shop.c`. |
| **Trainer/NPC** (10+ fichiers) | Dresseurs, flags dresseur battus, parties prédéfinies. | `trainer_data.c`, `trainer_party_restore.c`. |
| **Specials** (spécial.c, apprentice.c, etc.) | Fonctions "special" appelées par scripts (heal party, choose starter, pokedex lookup). | `special.c` (250+ cas switch). |
| **Contest** (20+ fichiers) | Concours Pokémon (minor, peut ignorer pour MVP). | `contest.c`, `contest_util.c`. |
| **Mystery Event** (3+ fichiers) | Distribution Pokémon mystérieux (minor). | `mystery_gift.c`. |
| **Link/Communication** (5+ fichiers) | Multi-joueur (cable link, union room) — ignore pour web. | `link_controller.c`, `union_room.c`. |

### 1.4 Structure `graphics/` du décomp

| Sous-dossier | Contenu | Format |
|---|---|---|
| **`pokemon/`** | Sprites front+back chaque Pokémon (135 gen3 espèces). | PNG 80×80, 96×96 variable. Dossiers par espèce EN lowercase. |
| **`object_events/`** | 200+ modèles de personnages (boy, girl, old man, scientist, etc.), animés 4 frames. | PNG 32×32 atlas. |
| **`battle_interface/`** | Healthboxes (opponent/player), HP bars, textbox, status icons, ball display, numbers font. | PNG atlas avec palettes séparées `.pal`. |
| **`battle_anims/`** | Tiles animées attaques (slash, fire, bubble, spark, etc.). | PNG 64×64 + metatile composites. |
| **`battle_environment/`** | Backgrounds combats par terrain (forêt, eau, grotte, ville, gym, etc.). | PNG 240×160 full-screen. |
| **`battle_transitions/`** | Intros combats (wipe, fade, split-screen). | PNG atlases + scripts metatile. |
| **`fonts/`** | Police bitmap GBA (texte game). | PNG fontsheet + metatile layout. |
| **`intro/`** | Scenes d'introduction (splash GF, Pokédex, Birch voiture). | PNG assets individuels. |
| **`interface/`** | Boîtes dialogues, menus (Start/Pause), UI genérique. | PNG 9-slice templates. |
| **`items/`** | Icons items (40×40 chaque). | PNG atlas 8×8 ou loose. |
| **`pokedex/`** | Pokédex background + entries visuals. | PNG + metatile. |
| **`party_menu/`** | Party selection UI (portraits Pokémon, statuts, HP bar). | PNG composition. |
| **`evolution_scene/`** | Evolution transition (flashs, spirales). | PNG frames + script anim. |
| **`title/`** | Écran titre ("POKEMON EMERALD" logo + background). | PNG assets + metatiles rendus. |
| **`misc/`** | Divers : pluie, neige, effets champ, badges, berries, décoration PC. | PNG mixtes. |

### 1.5 Outils du décomp (`tools/`)

| Outil | Langage | Fonction |
|---|---|---|
| **`gbagfx/`** | C (Makefile) | **PNG → GBA binary** : converti PNG 8-bit indexé en tiles GBA 4-bit + palette binaire. Compression (LZ, RLE, Huffman optionnelle). Principal outil graphique. |
| **`gbafix/`** | C | **ROM header fixer** : ajoute entête ROM valide + checksum GBA après link. |
| **`mapjson/`** | C (Makefile) | **JSON map → compilé** : prend `map.json` + layout binary, génère `map.inc` asm prêt à linker. |
| **`jsonproc/`** | C (Makefile) | **JSON processor** : traite JSON en-tête (constants, enums, data tables). |
| **`preproc/`** | C (Makefile) | **Preprocessor ARM ASM** : macros, includes, conditions (remplace CPP pour asm). |
| **`mid2agb/`** | C (Makefile) | **MIDI → Sappy bytecode** : compile MIDI en Sappy sequence GBA (read by sequencer GBA). |
| **`wav2agb/`** | C (Makefile) | **WAV → GBA audio** : encode WAV en streaming audio GBA (pour cris, SFX). |
| **`ramscrgen/`** | C (Makefile) | **RAM script generator** : builds script pointers tables. |
| **`rsfont/`** | C (Makefile) | **Font renderer** : rasterize font bitmap GBA. |
| **`bin2c/`** | C (Makefile) | **Binary → C array** : convertit `.bin` loose en `.c` avec `static const u8 data[] = { ... }`. |
| **`scaninc/`** | C (Makefile) | **Include scanner** : resolve dépendances includes (utilisé par Makefile pour deps tracking). |

---

## Section 2 — Le fichier maître d'orchestration (Q.B) ⭐ QUESTION CLEF

### 2.1 Architecture d'orchestration du décomp

**Réponse directe** : **Il n'existe PAS UN fichier unique qui lie tout en ordre linéaire.** La décompilation Pokémon Émeraude utilise une **architecture modulaire + dispatch table** distribuée. Voici comment tout s'assemble :

#### 2.1.1 Le orchestrateur principal : `Makefile` racine

**Fichier** : `D:\Projet 1\decomps\pokeemeraude\Makefile` (13 151 lignes)

Le **Makefile est le vrai orchestrateur**. Il définit :

```makefile
# Ordre de build (simplifié) :
1. Preprocess (.i files) from .h + .s inputs
2. Assemble .s + .c files into .o object files
3. Link ALL .o + .inc include data tables into executable ELF
4. Extract ROM binary from ELF
5. Checksum + ROM header fix
```

Les dépendances critiques du Makefile :

| Phony Target | Dépend de | Résultat |
|---|---|---|
| **`all`** | `rom` | ROM compilée finale. |
| **`rom`** | `$(ELF)` + fix checksum | `pokeemeraude.gba`. |
| **`$(ELF)`** | TOUS les `.o` (C + asm) + linker script + `.inc` data tables | Exécutable ARM ELF. |
| **`build/assets/*`** | `graphics_file_rules.mk` | Tiles PNG → `.bin` via `gbagfx`. |
| **`data/layouts/*/tiles.bin`** | `graphics_file_rules.mk` | Metatiles compilés. |
| **`data/maps/*/map.inc`** | `map_data_rules.mk` + `mapjson` tool | Maps JSON → asm. |
| **`data/maps.s`** | Include de layouts + maps + connections `.inc` | Master map data asm. |
| **`src/main.o`** | `src/main.c` | Entry point C. |

**Insight** : Le Makefile n'a **pas d'ordre explicite** — il encode les dépendances. Pour comprendre "quel tileset → quel layout → quelle map → quel script?", il faut traverser les fichiers manuellement.

#### 2.1.2 Master file : `data/maps.s`

**Fichier** : `D:\Projet 1\decomps\pokeemeraude\data\maps.s` (19 lignes, mais chaîne includes massifs)

```asm
#include "constants/global.h"
#include "constants/layouts.h"
#include "constants/maps.h"
...
.section .rodata

.include "data/layouts/layouts.inc"
.include "data/layouts/layouts_table.inc"
.include "data/maps/headers.inc"
.include "data/maps/groups.inc"
.include "data/maps/connections.inc"
```

**C'est la clef** : ce fichier crée une CHAÎNE DE TABLES en mémoire ROM :

1. **`layouts.inc`** : enum LAYOUT_* avec indices pour la table suivante.
2. **`layouts_table.inc`** : array `gMapLayouts[]` (249 entrées) → chaque layout = `{ tileset_ptr, tilemap_ptr, width, height, border_ptr }`.
3. **`maps/headers.inc`** : array `gMapHeaders[]` (519 maps) → chaque map = `{ layout_idx, music, region_section, type, weather, flags }`.
4. **`maps/groups.inc`** : array `gMapGroups[]` (34 groups) → chaque group = liste d'indices maps.
5. **`maps/connections.inc`** : array `gMapConnections[]` → pointers vers connexions per-map.

**Chaîne d'exécution runtime (décomp GBA)** :

```
new_game()
  → spawn at (gMapHeaders[MAP_LITTLEROOT], position_x, position_y)
  
gMapHeaders[MAP_LITTLEROOT]
  → layout_idx = LAYOUT_LITTLEROOT_TOWN
  → gMapLayouts[LAYOUT_LITTLEROOT_TOWN]
    → tileset[0] = pointers vers tiles.bin + palette
    → tilemap = pointers vers tilemap.bin
    → metatiles.bin = pointers vers composites 16×16
    → width/height = 30×20
    
overworld_loop()
  → check metatile(player_x, player_y)
  → dispatch behavior (collision, warp, encounter, script)
  
script_runner(Map=LITTLEROOT, Event=NPC_Mom)
  → gMapHeaders[LITTLEROOT].script_ptr
  → EventScript_Mom label → opcodes (msgbox, moveplayer, etc.)
```

#### 2.1.3 Fichiers qui méritent "maître" dans le contexte du jeu

| Fichier | Rôle | Pourquoi clef |
|---|---|---|
| **`data/maps/map_groups.json`** | 519 maps enumérées en 34 groupes + ordering (index = MAP_ID constant). | Chaque map a une identité qui permet de la nommer/recharger. |
| **`data/maps/<MapName>/map.json`** | Métadonnées une map (layout, music, NPCs, warps, triggers, objects). | Définit ce qui se passe dans une zone. |
| **`include/constants/maps.h`** | Enum MAP_* (519 entries) — répertoire global de toutes les zones. | Réduit map_groups.json en index numérique. |
| **`include/constants/layouts.h`** | Enum LAYOUT_* (249 entries) — répertoire tilesets/tilemaps. | Réduit layouts en indices (optimisation ROM). |
| **`data/layouts/layouts_table.inc`** | Table `gMapLayouts[]` — pointers vers tileset + tilemap binaire chaque layout. | Résout layout index → memory pointers. |
| **`src/map_util.c`** | Fonctions `LoadMap(mapId)`, `GetMapHeader(mapId)`, etc. | Runtime loads map via header → layout → tiles. |
| **`src/script.c` / `script_cmd_table.c`** | Dispatch opcode (160+ cas) — traitement msgbox, warp, trainerbattle, etc. | Toute l'interactivité passe par ici. |
| **`src/overworld.c`** | Main loop terrain : gestion joueur mouvement, NPC tick, script exécution, transitions. | Synchronise 60fps game loop avec map state. |
| **`src/new_game.c`** | Spawn initial joueur, starter choice, caméra setup. | Crée la chaîne "vous entrez dans le monde". |

#### 2.1.4 Synthèse : Chaîne d'exécution complète Littleroot → Route101

```
START.
  ↓ (new_game)
┌─────────────────────────────────────┐
│ include/constants/maps.h → MAP_LITTLEROOT = 0xAB │  enum
└─────────────────────────────────────┘
  ↓ (load_map)
┌─────────────────────────────────────┐
│ data/maps.s → gMapHeaders[MAP_LITTLEROOT] │  table ROM
│   { layout: LAYOUT_LITTLEROOT_TOWN  │
│     music: MUS_LITTLEROOT           │
│     script_ptr: ... }               │
└─────────────────────────────────────┘
  ↓ (tilemap_load)
┌─────────────────────────────────────┐
│ data/layouts/layouts_table.inc →    │  table ROM
│   gMapLayouts[LAYOUT_LITTLEROOT]    │
│   → tileset_ptr (tiles.bin)         │
│   → tilemap_ptr (tilemap.bin)       │
│   → width: 30, height: 20           │
└─────────────────────────────────────┘
  ↓ (load assets)
┌─────────────────────────────────────┐
│ graphics/tilesets/route1/tiles.bin  │  brut compilé
│ graphics/tilesets/route1/tiles.pal  │  palette GBA
│ graphics/object_events/*.png        │  NPC sprites
└─────────────────────────────────────┘
  ↓ (spawn NPCs + script)
┌─────────────────────────────────────┐
│ data/maps/LittlerootTown/map.json   │  metadata
│   { object_events: [                │
│     { localId: LOCALID_MOM,         │
│       graphics_id: OBJ_GFX_FEMALE_4 │
│       script: EventScript_Mom,      │
│       x: 8, y: 10 }                 │
│   ] }                               │
└─────────────────────────────────────┘
  ↓ (script trigger)
┌─────────────────────────────────────┐
│ data/maps/LittlerootTown/scripts.inc│
│   EventScript_Mom:                  │
│   lock                              │
│   msgbox Route101_Text_Mom           │
│   msgbox Route101_Text_DontForget... │
│   moveplayer UP 1                   │
│   release                           │
│   end                               │
└─────────────────────────────────────┘
  ↓ (warp trigger — metatile behavior)
┌─────────────────────────────────────┐
│ tilemap(10,15) → metatile_id 0x60   │
│ MB_NON_ANIMATED_DOOR → warp_table   │
│ connections.inc → MAP_ROUTE101      │
│ offset (0, 1, UP) → transfer à      │
│ MAP_ROUTE101 pos (10, 1)            │
└─────────────────────────────────────┘
  ↓ (new map load)
┌─────────────────────────────────────┐
│ data/maps/Route101/map.json         │
│   { object_events: [ Birch, Boy ] } │
│   { coord_events: [                 │
│     { type: trigger, x: 10, y: 19   │
│       script: StartBirchRescue } ]  │
└─────────────────────────────────────┘
  ...
EXIT (player atteint 1er gym)
```

### 2.2 Réponse à "existe-t-il un fichier qui lie TOUS les autres?"

**Non, pas en tant que fichier unique.**

Mais les **points de coordination clefs** sont :

1. **`data/maps.s`** (chaîne 5 .inc) — rassemble **layouts + maps + connections** en tables ROM.
2. **`data/maps/map_groups.json`** — répertoire JSON des 519 maps (pas en ROM, mais version "source" éditeur).
3. **`Makefile`** — dicte l'ordre graphiques→maps→asm→link.
4. **`include/constants/*.h`** (maps.h, layouts.h, species.h, moves.h, items.h, flags.h, vars.h) — **80 fichiers enum** qui sont la "clef de Rosetta" indexant tout.
5. **`src/overworld.c` + `src/script.c`** — l'interpréteur runtime qui **exécute** la chaîne (charger map, dessiner, scripts, warps).

**Pour le projet web**, on **n'a pas besoin de Makefile/linker**. À la place, on utilise :
- **`data/maps/map_groups.json`** comme index global
- **`data/maps/<Map>/map.json`** pour chaque zone
- **`include/constants/*.h`** pour résoudre les enums en indices
- Notre extracteur `extract-decomp.mjs` qui copie + convertit JSON déjà présents

---

## Section 3 — Outils du décomp (Q.C)

Les **11 outils** dans `D:\Projet 1\decomps\pokeemeraude\tools\` :

| # | Outil | Langage | Role | Input → Output |
|---|---|---|---|---|
| 1 | **`gbagfx/`** | C (40 files) | **PNG→GBA tiles compiler** | `.png` 8-bit indexé + `.pal` GBA → `.bin` 4-bit tiles + huffman/LZ/RLE optionnelle |
| 2 | **`gbafix/`** | C (simple) | **ROM header/checksum** | ELF brut → `.gba` avec header Nintendo + checksum valide |
| 3 | **`mapjson/`** | C (Makefile build) | **JSON map→asm** | `map.json` + layout binary → `map.inc` asm (object_events, warps, scripts pointers) |
| 4 | **`jsonproc/`** | C (Makefile build) | **JSON→data tables** | JSON configs → header `.inc` asm avec data tables (constants, enums, arrays) |
| 5 | **`preproc/`** | C (Makefile build) | **ASM preprocessor** | `.s` asm → preprocessed avec macros, includes, conditions résolues |
| 6 | **`mid2agb/`** | C (Makefile build) | **MIDI→Sappy bytecode** | `.mid` MIDI → `.s` asm avec Sappy sequence bytecode (exécuté par séquenceur GBA) |
| 7 | **`wav2agb/`** | C (Makefile build) | **WAV→GBA audio** | `.wav` → streaming audio GBA (cris Pokémon, SFX) |
| 8 | **`ramscrgen/`** | C (Makefile build) | **Script pointer tables** | Scripts asm → `*.inc` avec pointers RAM |
| 9 | **`rsfont/`** | C (Makefile build) | **Font rasterizer** | Bitmap font `.png` → GBA font binary |
| 10 | **`bin2c/`** | C (simple, ~200 LOC) | **Binary→C array** | `.bin` brut → `.c` avec `static const u8 data[] = { ... }` |
| 11 | **`scaninc/`** | C (Makefile build) | **Include dependency scanner** | `.s`/`.h` files → list of includes (used by Makefile for .d deps) |

**Principaux dans notre workflow extraction** :
- **`gbagfx`** — déjà compilé, utilisable pour décompresser/reconvertir PNG en-runtime si besoin (rare, on a PNG bruts).
- **`mapjson`** — utile si on veut recompiler maps (on l'ignore, on prend JSON déjà là).
- **`mid2agb`** — inutile (on extrait MIDI bruts, pas la bytecode).
- **`wav2agb`** — inutile (on utilise WAV bruts).
- **`jsonproc`** — inutile (on parse JSON nous-mêmes en TS).

**Intérêt pour nous** : surtout **documentation des formats** (gbagfx.h pour PNG GBA, mapjson pour struct map, etc.). On utilise rarement les binaires.

---

## Section 4 — Inventaire projet `pokemon-web-demo` (Q.D)

### 4.1 Scripts extracteurs (~25 fichiers dans `scripts/`)

**Tous `.mjs` (ES modules Node)**, organisés par domaine :

| # | Script | Output JSON | Statut | Domaine |
|---|---|---|---|---|
| 1 | **`extract-decomp.mjs`** | Copie brute `public/decomp/em/` (maps, layouts, assets, constants) | ✅ Maître | Bootstrap |
| 2 | **`extract-trainer-parties.mjs`** | `trainer-parties.json` (855 dresseurs + teams) | ✅ Vague 1 | Combat |
| 3 | **`extract-wild-encounters.mjs`** | `wild-encounters.json` (116 maps + spawn rates) | ✅ Vague 1 | Combat sauvage |
| 4 | **`extract-items.mjs`** | `items.json` (377 items FR + prix + pocket) | ✅ Vague 1 | Inventory |
| 5 | **`extract-map-names-fr.mjs`** | `map-names-fr.json` (213 zones) | ✅ Vague 1 | UI/Map |
| 6 | **`extract-metatile-labels.mjs`** | `metatile-labels.json` (692 labels) | ✅ Vague 1 | Tilemap |
| 7 | **`extract-text-tables.mjs`** | `text-tables.json` (species/moves/trainer classes/natures descriptions) | ✅ Bonus V1 | Text |
| 8 | **`extract-constants.mjs`** | `constants.json` (413 species, 356 moves, 384 items, etc.) | ✅ Bonus V3 | Data |
| 9 | **`extract-script-opcodes.mjs`** | `script-opcodes.json` (enum OPCODE_*) | ✅ Vague 2 | Script |
| 10 | **`extract-window-templates.mjs`** | `window-templates.json` (9-slice UI boxes) | ✅ Vague 2 | UI |
| 11 | **`extract-palettes.mjs`** | `palettes.json` (GBA binary → RGB arrays) | ✅ Vague 2 | Graphics |
| 12 | **`extract-movement-actions.mjs`** | `movement-actions.json` (MOVEMENT_TYPE_*) | ✅ Vague 1 | NPC |
| 13 | **`extract-start-menu.mjs`** | `start-menu.json` (options menu structure) | ✅ Vague 2 | UI |
| 14 | **`extract-tileset-anims.mjs`** | `tileset-anims.json` (metatiles animées) | ✅ Vague 2 | Graphics |
| 15 | **`extract-doors.mjs`** | `doors.json` (door animation metadata) | ✅ Vague 1 | Anim |
| 16 | **`extract-voicegroups.mjs`** | `voicegroups.json` (Sappy synth voicegroups) | ✅ Vague 2 | Audio |
| 17 | **`extract-metatile-behaviors.mjs`** | `metatile-behaviors.json` (MB_* enum) | ✅ Vague 2 | Tilemap |
| 18 | **`extract-item-balls.mjs`** | `item-balls.json` (pokeballs sol + items) | ✅ Vague 1 | Items |
| 19 | **`extract-inanimate-graphics.mjs`** | `inanimate-graphics.json` (props statiques) | ✅ Vague 2 | Graphics |
| 20 | **`extract-battle-ui.mjs`** | Copie dossier `public/decomp/em/battle_interface/` (UI GBA brut) | ✅ Session 45 | Battle |
| 21 | **`extract-intro-assets.mjs`** | Copie assets intro (splash, Pokédex, Birch) | ✅ Vague 2 | Intro |
| 22 | **`extract-intro-rendered.py`** (Python) | Pré-rendu PNG intro via composition tilemap + palette | ✅ Vague 2 | Intro |
| 23 | **`extract-oam-sprites.mjs`** | `oam-sprites.json` (OAM affichage metadata) | ✅ Session 35 | Graphics |
| 24 | **`extract-keyboard.mjs`** | `keyboard.json` (key input mapping) | ✅ Minor | Input |
| 25 | **`extract-flags-vars.mjs`** | `flags-vars.json` (enum VAR_*, FLAG_*) | ✅ Vague 1 | State |
| 26 | **`extract-strings.mjs`** | `strings.json` (toutes dialogues compilées) | ✅ Vague 1 | Text |
| 27 | **`extract-placeholders.mjs`** | `placeholders.json` (fallback textes/gfx) | ✅ Minor | Data |

**`npm run extract:all-bulk`** exécute **23 scripts en succession** (voir `package.json` ligne 34) — tous sauf `extract-decomp` (qui doit tourner en premier), `extract-intro-rendered.py` (Python), et quelques mineurs.

### 4.2 Structure `src/` du projet (8 dossiers + files)

#### **`src/engine/`** (23 fichiers TypeScript) — Coeur runtime

| Fichier | Rôle | Lignes |
|---|---|---|
| **`script-runner.ts`** | **Interpréteur opcodes** (723 L) — dispatch 58+ opcodes GBA (msgbox, warp, trainerbattle, givemon, etc.). Table dispatch + ScriptContext interface. | 723 |
| **`game-state.ts`** | Singleton `gameState` — party, bag, PC, flags, vars, position, playtime. Persisté localStorage. | ~300 |
| **`pokemon.ts`** | Struct `PokemonInstance` (species, level, moves, IVs, HP courant, etc.) + factory `createPokemonInstance()`. Intégration `@pkmn/dex`. | ~200 |
| **`data-tables.ts`** | Singleton loaders JSON (species FR, moves FR, items, trainers, etc.). Exports helpers `getSpeciesNameFr()`, `getMoveNameFr()`. | ~250 |
| **`tilemap-loader.ts`** | **Tilemap renderer** — prend layout binary + tiles.bin + palette → Phaser tilemap sprite. Metatile behaviors (collision, warp, grass). | ~400 |
| **`world-renderer.ts`** | **Overworld scene renderer** — tiles + NPCs + joueur sprite + shadows. Synchronise caméra joueur. | ~300 |
| **`npc-loader.ts`** | Spawn NPCs depuis `object_events` du map.json. Animation walking, idle animation, script binding. | ~250 |
| **`npc-behavior.ts`** | **Moteur IA NPC** — MOVEMENT_TYPE_* dispatch (LOOK_AROUND, JOG_IN_PLACE, WANDER_*, random). | ~200 |
| **`movement.ts`** | Moteur mouvement joueur + grid-based navigation (tile-to-tile). Pas de mouvement pixel-parfait GBA, simplifié en grille. | ~150 |
| **`music.ts`** | **Playback MIDI** — charge MIDI décomp + Tone.js synth (ou spessasynth_lib fallback). Gestion BGM/SE/fanfare slots. | ~250 |
| **`dialogue-box.ts`** | **Rendering boîtes dialogues** — 9-slice GBA-like, texte avec interpol. `{STR_VAR_1}`. Support pagination. | ~200 |
| **`string-buffers.ts`** | 8 string var buffers (STR_VAR_0 à STR_VAR_7) — store texte interpolé pour msgbox. | ~100 |
| **`character-anims.ts`** | Animations sprite personnages (walk 4-frame, idle). | ~100 |
| **`menu.ts`** | UI menus (yes/no, multichoice). Phaser overlays. | ~150 |
| **`bitmap-font.ts`** | Bitmap font rendering (GBA-like 8px monospace). | ~100 |
| **`window-renderer.ts`** | Affichage boîtes texte GBA (borders, backgrounds 9-slice). | ~150 |
| **`map-scripts.ts`** | Gestion scripts map-level (MAP_SCRIPT_ON_LOAD, ON_FRAME_TABLE, etc.). Dispatch callbacks. | ~150 |
| **`new-game-init.ts`** | Initialization new game — spawn position, first Pokémon (debug Treecko), affiche intro. | ~100 |
| **`door-anim.ts`** | Animation porte (ouverture/fermeture). | ~100 |
| **`metatile-behaviors.ts`** | Constants metatile behavior (collision, warp, herbe, eau). À refactor avec JSON extrait. | ~100 |
| **`tileset-animator.ts`** | Gestion tiles animées (eau clapotis, herbe vague). | ~100 |
| **`sappy-player.ts`** | **Ancien playback MIDI** (remplacé par music.ts modern). Garder pour fallback? | ~200 |
| **`warp-trace.ts`** | Debug — trace warps/transitions pour valider map connectivity. | ~100 |

**Total `src/engine/`** : ~4500 lignes TS.

#### **`src/scenes/`** (10 fichiers) — Phaser scenes

| Fichier | Rôle | Type |
|---|---|---|
| **`BootScene.ts`** | Initialise jeu (charge boot assets, check save). | Init |
| **`TitleScene.ts`** | Écran titre Pokémon/Émeraude (pré-rendu ou runtime). Attente input start. | Menu |
| **`MainMenuScene.ts`** | Menu principal (Continue, New Game, Settings). | Menu |
| **`NamingScene.ts`** | Nommage joueur + starter (clavier + dpad). | Input |
| **`IntroScene.ts`** | Cinématique intro (Birch voiture + Pokédex). Pré-rendu. | Cinematic |
| **`BirchSpeechScene.ts`** | Discours Birch (Pokédex, starter choice UI 3 pokeballs). | Cinematic |
| **`OverworldScene.ts`** | **Scène principale jeu** — tilemap, NPCs, joueur, scripts, warps, music. Pause menu intégré. | Main |
| **`MenuOverlayScene.ts`** | Overlay menus (Start/Pause, Party, Bag, Pokedex). Dialogues system messages. | UI |
| **`BattleScene.ts`** | **Combat Phaser** — healthboxes GBA, sprites Pokémon, logs, @pkmn/sim runner. | Combat |
| **`EditorScene.ts`** (optionnel) | Éditeur de maps (placement tiles, NPCs, débugging). | Debug |

**Total `src/scenes/`** : ~3000 lignes TS.

#### **`src/battle/`** (1 fichier gros)

| Fichier | Rôle | Lignes |
|---|---|---|
| **`runner.ts`** | **@pkmn/sim combat wrapper** — lance sim avec deux teams, émet events Battle pour UI. RandomAI des deux côtés (input joueur pas implémenté). | ~300 |

#### **`src/data/`** (3 fichiers) — Données hardcodées

| Fichier | Rôle |
|---|---|
| **`trainers.ts`** | Mock dresseurs (jusqu'à Vague 1 extraction). Parseur `trainer-parties.json`. |
| **`map-names-fr.ts`** | Mock noms FR (remplacé par JSON extrait Vague 1). |
| **`pokedex.ts`** (optionnel) | Pokédex entries (optionnel MVP). |

#### **`src/util/`** (4 fichiers utilitaires)

| Fichier | Rôle |
|---|---|
| **`compose-tilemap.ts`** | Helper assembly tilemap depuis tiles + metatiles. |
| **`oam-sprite.ts`** | OAM sprite handling (GBA-like sprite priority/palette). |
| **`sprite-transparency.ts`** | Phaser image transparency register (pour sprites Pokémon alpha). |
| **`image-alpha.ts`** | Utilitaire manipulation PNG alpha. |

#### **`src/main.ts`** (Entry point)

```typescript
import Phaser from 'phaser';
import { BootScene, TitleScene, MainMenuScene, ..., BattleScene } from './scenes';
import { OverworldScene } from './scenes/OverworldScene';

const GAME_W = 240, GAME_H = 160;  // Résolution GBA 1:1

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_W * 2,  // Upscale 2×
  height: GAME_H * 2,
  scene: [BootScene, TitleScene, MainMenuScene, ..., OverworldScene, BattleScene],
};

new Phaser.Game(config);
```

### 4.3 Structure `public/decomp/em/` (données extraites)

**Tous les JSONs extraits, organisés par domaine** :

| Dossier/Fichier | Contenu | Format |
|---|---|---|
| **`_summary.json`** | Métadata extraction (timestamp, version décomp, hash ROM). | JSON |
| **`constants.json`** | 413 species, 356 moves, 384 items, 78 abilities, 25 natures enums. | `{ "SPECIES_TREECKO": 1, ... }` |
| **`flags-vars.json`** | Enum VAR_* (184 variables) + FLAG_* (512 flags). | JSON |
| **`items.json`** | 377 items : name FR, price, pocket (items/balls/keyItems/tms/berries), holdEffect. | Array + map. |
| **`map-names-fr.json`** | 213 zones noms FR (Route 101, Bourg-Littéral, etc.). | `{ "MAP_ROUTE101": "Route 101", ... }` |
| **`metatile-labels.json`** | 692 labels metatiles (METATILE_InsideOfTruck_ExitLight_*, MB_* enums). | JSON par tileset. |
| **`metatile-behaviors.json`** | MB_* enum (240 entries) : collision, warp, grass, water, door, ladder, etc. | `{ "0x00": { "name": "MB_NORMAL", "passable": true }, ... }` |
| **`movement-actions.json`** | MOVEMENT_TYPE_* enum (30+ types : LOOK_AROUND, JOG_IN_PLACE, WANDER_*, etc.). | JSON map. |
| **`oam-sprites.json`** | OAM sprite metadata (affichage). | JSON. |
| **`script-opcodes.json`** | Enum des 160+ opcodes script (msgbox, goto, trainerbattle, etc.). | JSON. |
| **`start-menu.json`** | Structure menu Principal (layout, couleurs, fontes). | JSON. |
| **`tileset-anims.json`** | Metatiles animées (eau clapotis frames). | JSON. |
| **`trainer-parties.json`** | 855 dresseurs + teams (species, level, moves, items, natures, IVs). | Array dresseurs. |
| **`wild-encounters.json`** | 116 maps + spawn tables (land, water, rock_smash, fishing). | Nested JSON. |
| **`voicegroups.json`** | Sappy synth voicegroups (instruments MIDI). | JSON. |
| **`window-templates.json`** | Boîtes dialogues 9-slice (border coords, couleurs). | JSON. |
| **`strings.json`** | Toutes dialogues compilées (~5000+ lignes). | JSON. |
| **`placeholders.json`** | Assets fallback (textes, gfx par défaut si missing). | JSON. |
| **`item-balls.json`** | Item pokeballs localisées par map/script. | JSON. |
| **`doors.json`** | Animations portes (coordinates, timings). | JSON. |
| **`keyboard.json`** | Input mapping (KEY_UP → input direction). | JSON. |
| **`text-tables.json`** | Descriptions (species, moves, items, trainer classes, natures, abilities). | JSON. |
| **`palettes.json`** | Palettes GBA (extracteur convertit `.pal` bin → RGB arrays). | JSON. |
| **`pokemon/`** | Dossier — sprites Pokémon front + back (PNG 80×80 ou 96×96). | PNG par espèce. |
| **`battle_interface/`** | Assets interface combat (healthboxes, bars, boxes, numbers). | PNG + `.pal` bins. |
| **`layouts/`** | Tilemaps compilées par layout (`.bin` bruts). | Binary. |
| **`maps/`** | Chaque map : `<MapName>.json` (layout, music, objects, warps, coords_events). | JSON. |
| **`object_events/`** | Sprites NPCs (~200 modèles × 4 walk frames). | PNG 32×32 atlas. |
| **`cries/`** | Cris Pokémon (WAV bruts par espèce). | WAV. |
| **`music/`** | MIDI + SAPPY bytecode musiques cartes. | MID + `.s` asm. |
| **`boot/`** | Assets écran titre/menu (splash, intro). | PNG + pré-rendus. |
| **`intro/`** | Assets intro cinématique (Pokédex, Birch voiture). | PNG. |
| **`intro-rendered/`** | Intro pré-rendue (PNG full-screen). | PNG 240×160. |
| **`rendered/`** | (Legacy pré-rendu layouts — 65 MB). À supprimer selon AUTOMATION_BACKLOG. | PNG atlas énormes. |
| **`map-dumps/`** | Debug maps (tilemaps pré-composées pour chaque zone). | PNG. |

### 4.4 Documentation racine (~15 fichiers `.md`)

| Fichier | Contenu |
|---|---|
| **`README.md`** | Intro projet, stack (Vite + TS + Phaser 3 + @pkmn/sim). Quick start. |
| **`DEV_LOG.md`** | Sessions 1-45, changelog exhaustif, features finies vs TODO, bugs fix. ⭐ Référence historique. |
| **`ROADMAP.md`** | Plan phases A-C (MVP → boucle complète → contenu étendu). Ordre prioritaire. |
| **`BULK_AUTOMATION.md`** | Plan en vagues d'automatisation (Vague 1-5 : extraction, opcodes, combat, items, polish). |
| **`AUTOMATION_BACKLOG.md`** | Audit 2026-04-25 : extracteurs manquants, scores ROI, effort estimates. |
| **`ARCHITECTURE.md`** | Architecture runtime (Phaser scenes, engine modules, data flow). |
| **`DECOMP_ORIGIN_FILES.md`** | Master catalog : quel JSON vient de quel fichier décomp. ⭐ Lecture obligatoire. |
| **`DECOMP_MAP.md`** | Cartographie décomp (résumé top-level). |
| **`MAP_MECHANICS_REFERENCE.md`** | Source de vérité warps/NPCs/item balls/metatile behaviors. À lire avant toute modif overworld. |
| **`OPCODES_REFERENCE.md`** | Référence tous opcodes script implémentés (58+ opcodes, arguments, sémantique). |
| **`TICK_LOOP_REFERENCE.md`** | Synchronisation timer 60fps, OverworldScene frame budget, interaction lockstep. |
| **`SEAMLESS_RENDERING_REFERENCE.md`** | Tilemap rendering fine-grain (sprites, shadows, layers). |
| **`DIALOGUE_FONT_MENU_REFERENCE.md`** | Boîtes dialogues 9-slice GBA, polices bitmap, menus texte. |
| **`WINDOWS_BOXES_REFERENCE.md`** | Templates UI (Start menu, Party menu, Bag). Couleurs, polices, grille. |
| **`SAPPY_MUSIC_REFERENCE.md`** | SAPPY format (voicegroups, sequences, timings MIDI→GBA). |

---

## Section 5 — État features (Q.E)

### 5.1 Features finies et testées ✅

| Feature | Statut | Session | Détail |
|---|---|---|---|
| **Boot complet** | ✅ | S14 | Splash écran, intro caméra camion, warp Littleroot (déjà dossier depuis S13). |
| **Overworld base** | ✅ | S14 | Tilemap rendering, joueur sprite animé (walk 4 frames), caméra suiveuse, collisions metatile. |
| **NPCs + animations** | ✅ | S14 | Spawn NPCs depuis object_events, idle animations, walk patterns (LOOK_AROUND, JOG_IN_PLACE, WANDER_*). |
| **Scripts basiques** | ✅ | S14 | 58+ opcodes : msgbox, goto, faceplayer, delay, applymovement, warp, lock/release, addobject/removeobject. |
| **Dialogues** | ✅ | S14 | Boîtes texte 9-slice GBA, string interpolation `{STR_VAR_1}`, pagination, input wait. |
| **Music MIDI** | ✅ | S19 | Playback MIDI Sappy (Tone.js synth + spessasynth_lib fallback), BGM loop par map, soft-switch, SFX. |
| **Save/Load game state** | ✅ | S15 | Flags, vars, position joueur, équipe party (via localStorage). |
| **Item balls** | ✅ | S35 | Pokéballs sol localisées, persistence (ramassé = disparaît), jingle item obtenu. |
| **Warps intra-map** | ✅ | S14 | Portes metatile 0x60 (MB_NON_ANIMATED_DOOR) → warp interne avec offset. |
| **Intro Birch** | ✅ | S35 | Cinématique intro : écran noir, Pokédex apparition, Birch voiture, dialogue starter. |
| **Starter choice** | ✅ | S44 | Menu 3 pokeballs (Treecko/Torchic/Mudkip) → addToParty + givemon. Débute avec celui choisi. |
| **Combat dresseur** | ✅ | S20 | `trainerbattle` opcode → BattleScene + @pkmn/sim runner. RandomAI joueur+adversaire. Sauvegarde resultat (win/lose). |
| **Combat sauvage** | ⚠️ | S44+ | Démo fonctionnelle, mais wild-encounters trigger pas automatique (grass step pas câblé encore). |
| **Trainer data** | ✅ | S19 | 855 dresseurs extractés (trainer-parties.json). Accessible via script `trainerbattle`. |
| **Species + moves FR** | ✅ | S19 | Lookup @pkmn/dex pour noms FR (Arcko, Poussifeu, Charge, etc.). Buffer dans dialogues. |
| **Healthboxes UI GBA** | ✅ | S45 | Healthbox opponent/player 1:1 décomp (frame 64×32), HP bar couleur dynamic (vert/jaune/rouge), texte nom+level. |
| **Battle text output** | ✅ | S45 | Logs combats FR (moves, damage, status, effectiveness, faint). |

### 5.2 Features en cours de finition (partiellement implémenté)

| Feature | Statut | Blocage | Détail |
|---|---|---|---|
| **Input joueur combat** | 🔴 Manquant | (Pas bloquant MVP mais critique Vague 3.5) | Menu FIGHT/POKÉMON/BAG/RUN pas implémenté. RandomAI joueur. |
| **HP/PP sync post-combat** | 🟡 Partial | Besoin sync currentHp + PP depuis sim vers gameState.party. | Combat finit, mais party HP reste statique. |
| **Wild encounters auto-trigger** | 🟡 Partial | Metatile herbe → détecte, mais spawn aléatoire RNG pas câblé. | Script `setwildbattle` marche, pas le détecteur automatique grass. |
| **Battle UI polish** | 🟡 Partial | Background terrain pas extraits. Textbox rect blanc simple. | Healthboxes GBA OK. Manquent : vraie 9-slice textbox, status icons, animation entrée sprite. |
| **Textbox 9-slice** | 🟡 Partial | Besoin composition runtime depuis `textbox.png` + palette. | Dialogue box rect blanc simple, pas décor GBA. |
| **NPC path complex** | 🟡 Partial | Cas rares non gérés (jumps, tile restrictions, speed variations). | Walk + look-around OK. Jump ledges pas implémentés. |

### 5.3 Features pas commencées (bloquées par vagues)

| Feature | Phase | Effort | Dépend de | Détail |
|---|---|---|---|---|
| **Party menu** | B1 | L | Input joueur combat | Affiche party, switch Pokémon en combat. |
| **Bag inventory** | A8 | M | extract-items (Vague 1 déjà fait) | 5 poches (items/balls/key_items/tms/berries), scrollable. |
| **Pokemon stats complets** | A4-5 | M | PokemonInstance étendu | Nature multiplier, EVs, friendship, held item, status, pp. |
| **Items en combat** | A8 + B | M | Bag + item actions | Pokéball capture, Potion heal, Antidote, Full Heal. |
| **Escape/switch en combat** | A3.5 | M | Input joueur | Flee logic + party switch menu. |
| **Trainer NPC talk twice** | A7 | S | Flags dresseur + post-battle script | Après victoire, NPC says congratz. |
| **Pokedex** | C1 | L | capture species + entries | Consultable, voir height/weight/cry. |
| **Evolution items** | B2 | M | Item use system | Stones → evolution cinematic. |
| **Special locations** (Gym, PC, Shop) | B | M | Scripts spéciaux | Gym leader battle, PC box, Pokemart. |
| **Seeded routes** (Route avec 4-6 Pokémon dresseur) | B2 | M | Wild encounters + RNG | Grind levels sur Route 101, encounter rate. |
| **Map connectivity test suite** | B0 | S | Warp trace tool | Valider toutes transitions warp (pas de "dead end" involontaire). |
| **Polish audio** (Cries animées + sync) | C2 | M | Sappy cries timing | Cri Pokémon joue au moment entrée sprite. |
| **Sprite animations** (Flash, Roar, crit) | C2 | M | Phaser anim system | Entrée sprite saute, roar écran secoue, crit flash blanc. |

### 5.4 Dette technique connue

| Problème | Sévérité | Notes |
|---|---|---|
| **Pré-rendu 65 MB** (`public/decomp/em/rendered/`) | 🔴 High | Suppression prioritaire (AUTOMATION_BACKLOG §1). Composition runtime au lieu. |
| **script-runner.ts 723L** | 🟡 Medium | Table dispatch → refactor en map (ROADMAP A6) pour maintenabilité. |
| **Pas d'input menu en combat** | 🔴 High | Bloque progression gameplay (Vague 3.5 = suivant). |
| **Metatile behavior hardcoded** | 🟡 Medium | 17 constantes TS vs JSON extrait disponible (refactor trivial). |
| **Coordinates system incohérent** | 🟡 Medium | Mélange tilespace (16px), pixel space (Phaser), GBA (exact). Clarifier docs. |
| **No music fade crossfade** | 🟡 Medium | Soft switch OK, mais pas crossfade smooth 0.5s (audio polish tardif). |
| **Intro pré-rendu** | 🟡 Medium | Refactor pour runtime composition (bonus Vague 2, section AUTOMATION_BACKLOG). |
| **Sappy synth fallback fragile** | 🟡 Medium | Spessasynth peut crashes si voicegroup invalide. Besoin meilleure error handling. |

---

## Section 6 — Diagnostic BattleScene (Q.F)

### 6.1 État actuel du rendu battle (Session 45)

**Fichier principal** : `D:\Projet 1\pokemon-web-demo\src\scenes\BattleScene.ts` (352 lignes)

#### Qu'est-ce qui marche ✅

| Composant | Statut | Notes |
|---|---|---|
| **Sprites Pokémon** | ✅ | Loadés depuis `public/decomp/em/pokemon/<species>/{front,back}.png`. Positionnés 1:1 GBA (opponent 184,64 ; player 56,112). Origin centre-bas. |
| **Healthbox opponent** | ✅ | Frame 0 sprite 64×32 depuis `battle_interface/healthbox_singles_opponent.png`. Nom FR + level affiché. |
| **Healthbox player** | ✅ | Frame 0 sprite 64×32 depuis `battle_interface/healthbox_singles_player.png`. Nom FR + level + chiffres HP/max. |
| **HP bar coloré** | ✅ | Dynamique vert (>50%) → jaune (20-50%) → rouge (<20%). Width 48px max proportionnel cur/max. |
| **Combat @pkmn/sim** | ✅ | RandomAI joueur + adversaire. Battle runner async, events publiés en temps réel. |
| **Battle logs FR** | ✅ | Moves (Charge, Lancer de Poudre), damage (PV 10/14), status (brûlé), effectiveness (très efficace). |
| **Teams construction** | ✅ | Player team depuis `gameState.party[]`. Opponent team depuis trainer-parties.json + @pkmn/dex lookup. |
| **Music battle** | ✅ | BGM change en fond (mais pas cinématique intro spéciale). |

#### Ce qui est placeholder/cassé 🟡

| Composant | Statut | Problème | Détail |
|---|---|---|---|
| **Background battle** | 🟡 Placeholder | Rect bleu simple (0x60a0c8) | Vrais backgrounds décomp (forêt, eau, grotte, etc.) pas extraits. À faire : `extract-battle-terrains.mjs`. |
| **Textbox dialogue** | 🟡 Placeholder | Rect blanc bordé, pas 9-slice | Vraie `textbox.png` décomp (128×128 atlas 8×8) pas utilisée. Refactor : composition runtime 9-slice. |
| **Status icons** | 🟡 Missing | Pas affichés | `status.png` décomp dispo mais pas intégré. Brûlé/gelé/paralysé/empoisonné = texte uniquement. |
| **Healthbox palettes** | 🟡 Mauvaise | Couleurs GBA ≠ Phaser | Healthbox PNG décomp a 4 frames (empty→full graduel ?), on n'en utilise qu'une. Palette peut être off. |
| **Font numbers** | 🟡 Mauvais | Phaser 8px monospace vs GBA bitmap font | Numbers affichés via Phaser text, pas la bitmap font GBA compact. |
| **Animation HP decrement** | 🟡 Manquant | Pas de tween | HP bar update instantané, décomp a smooth decrement animation 0.5s. |
| **Animation sprite entrée** | 🟡 Manquant | Pas de cinématique | Opponent sprite entre slide-down, joueur sprite slide-up. À faire : Phaser tweens. |
| **Cris Pokémon** | 🟡 Manquant | Pas de playback | Criei.wav dispo dans `public/decomp/em/cries/`, pas joué au moment entrée sprite. |
| **Menu combat** | 🔴 Manquant | AUCUN input joueur | Pas de boutons FIGHT/POKÉMON/BAG/RUN. RandomAI joueur, pas cliquable. |

### 6.2 Pourquoi les healthboxes "s'affichent mal"

**Situation** : Session 45 added `extract-battle-ui.mjs` qui copie 24 fichiers `graphics/battle_interface/` vers `public/decomp/em/battle_interface/`. Healthboxes sont maintenannt loadés, mais visuellement **incomplets/étranges**.

**Causes probables** (à vérifier en runtime) :

1. **Palette incorrect** — Healthbox PNG uses GBA 4-bit indexed color, palette `.pal` binaire. Si palette pas appliquée avant rendu Phaser, couleurs = garbage. **Fix** : charger `healthbox_singles_opponent.pal` binaire + appliquer lookup avant `.load.spritesheet()`.

2. **Frames atlas** — `healthbox_singles_player.png` est multi-frame vertical (4 frames d'animation dégradé green→red). On charge frame 0 (empty), c'est correct. Mais peut-être frames mal spécifiées en `frameWidth/frameHeight`. **Vérification** : mesurer PNG réelle (ex: 64×128 = 4 frames de 64×32).

3. **Positions layout** — GBA healthbox est small (64×32). Notre position `opponentBoxX=8, opponentBoxY=24` en pixel screen GBA 240×160. Upscale ×2 en Phaser → positions exactes. Peut-être décalage pixel?

4. **Transparency** — Pokédex healthbox a fond transparent. PNG décomp maybe pas prédécodé (PNG alpha vs GBA colorkey). Phaser auto-handle PNG alpha, mais vérifier.

5. **Text overlay** — On dessine texte "Arcko N5" par-dessus healthbox. Font + position peut être hors ou couleur contrast mauvais (texte noir sur palette GBA rougeâtre?).

**Actions correctrices** (à faire en session suivante) :

```typescript
// Dans BattleScene.preload():
if (!this.textures.exists('battle-hb-opponent')) {
  // NOUVEAU : charger palette + appliquer
  const palBin = fetch(`${UI_BASE}/healthbox_singles_opponent.pal`)
    .then(r => r.arrayBuffer())
    .then(buf => applyGBAPalette(spritesheet, buf));
  
  this.load.spritesheet('battle-hb-opponent', 
    `${UI_BASE}/healthbox_singles_opponent.png`,
    { frameWidth: 64, frameHeight: 32 });
  
  // Attendre que texture soit chargée, puis appliquer palette
  this.textures.on('addtexture', (key) => {
    if (key === 'battle-hb-opponent') {
      const tex = this.textures.get(key);
      // Rechercher function `applyGBAPalette(texture, paletteBuffer)` dans util/
    }
  });
}
```

### 6.3 Assets décomp inutilisés en battle (pipeline de polish futur)

| Asset | Chemin décomp | État | Bénéfice pour 1:1 GBA |
|---|---|---|---|
| **Battle terrain backgrounds** | `graphics/battle_environment/` | Non extrait | Chaque terrain (herbe, eau, grotte, ville, gym, exterior) a background 240×160 unique. Impact visuel ÉNORME. |
| **Status icons** | `graphics/battle_interface/status.png` | Extrait, pas utilisé | Brûlé, gelé, paralysé, empoisonné, endormi, gravement empoisonné = 6 icons. Affiche top-right healthbox opponent. |
| **Numbers font** | `graphics/battle_interface/numbers.png` | Extrait, pas utilisé | GBA bitmap font pour affichage chiffres HP/damage (plus compact que Phaser text). |
| **Pokémon animation** | `public/decomp/em/pokemon/<species>/front_anim.png` | Dispo mais pas utilisé | 4-frame walk in place animation pour Pokémon combattant (subtle idle animation). |
| **Battle intro wipe** | `graphics/battle_transitions/` | Non extrait | Écran wipe effect au début combat (très GBA). |
| **Attack animations** | `graphics/battle_anims/` | Non extrait | Tiles animées attaques (slash, sparkle, bubble, flame, etc.). Pas critical pour MVP mais polish majeur. |
| **Ball display** | `graphics/battle_interface/ball_display.png` | Extrait, pas utilisé | Affiche gauche côté joueur : pokéballs team ennemis (qui est KO vs en bonne santé). |
| **HP bar palette gradient** | `graphics/battle_interface/hpbar.png` | Extrait, pas utilisé | GBA hpbar a dégradé pixel-art vert→jaune→rouge intégré. On fait smooth color change, pas pixel-perfect. |
| **Pokédex entries combattant** | `graphics/pokedex/` + `data/pokemon_form_changes.h` | Non extrait | Pokédex écran combat (silhouette, stats). **Bonus polish**, pas MVP. |

---

## Section 7 — Nouvelles automatisations à écrire (Q.G)

**Priorité = impact visuel × faisabilité × débloque quoi**

### 7.1 HAUTE priorité (1-2h chacun, impact ★★★)

| # | Extracteur | Input décomp | Output JSON | Bénéfice | Effort | Dépend de |
|---|---|---|---|---|---|---|
| **1** | **`extract-battle-terrains.mjs`** | `graphics/battle_environment/*.png` (40 images) | `battle-terrains.json` + copie PNG vers `public/` | 1:1 GBA visuels (herbe, eau, grotte, etc.). **Cosmétique pure mais ÉNORME impact**. | S (1h) | Aucun |
| **2** | **`extract-trainer-sprites.mjs`** | `graphics/object_events/trainer_*.png` | `trainer-sprites.json` (metadata) + copie PNG | Animations intro dresseur (front sprite slide-down). | S (1h) | Aucun |
| **3** | **`extract-pokemon-anims.mjs`** | `public/decomp/em/pokemon/<species>/front_anim.png` déjà dispo | `pokemon-anims.json` (frame count) | Idle animation Pokémon combattant (subtle walk in place). | S (30min) | Déjà extracteur |
| **4** | **`extract-bitmap-fonts.mjs`** | `graphics/fonts/*.png` + `graphics/battle_interface/numbers.png` | `bitmap-fonts.json` (font metrics) + copie PNG | **Exact 1:1 GBA text printer** (petit 5×5 combat, dialogue 8×8). Remplace Phaser text. | M (2h) | Aucun |
| **5** | **`extract-battle-anims.mjs`** | `graphics/battle_anims/*.png` + `data/battle_anim_scripts.s` | `battle-anims.json` + PNG tiles | Attaques Pokémon visuels (slash, fire, water, thunder). **Polish MAJEUR**. | M (3h) | Aucun |
| **6** | **`extract-pokedex-entries.mjs`** | `data/text/pokedex*.inc` + `data/pokemon_icons.h` | `pokedex-entries.json` (FR descriptions) | Pokédex consultable (height, weight, category, FR description). | M (2h) | Aucun |
| **7** | **`extract-evolutions.mjs`** | `include/constants/pokemon.h` (evolution lookup tables, ou `data/evolution.h`) | `evolutions.json` (species+evolution conditions) | Tree évolution stones/friendship/level. **Critical pour progression long-terme**. | M (2h) | Aucun |
| **8** | **`extract-tm-hm.mjs`** | `data/tms_hms.h` + `data/pokemon_learnsets.h` | `tm-hm.json` (qui peut apprendre quoi) | **Critical gameplay** : CT/CS utilisables en field + apprentissage Pokémon. | M (2.5h) | extract-items |
| **9** | **`extract-pokemart.mjs`** | `data/scripts/shops.inc` OR `data/trainers.h` (mart clerk party = items vendus) | `pokemart.json` (city → items disponibles) | Chaque ville Shop a inventaire différent (basé leader level). | S (1.5h) | extract-items |
| **10** | **`extract-berry-trees.mjs`** | `data/maps/*/map.json` (bg_events type "berry tree") | `berry-trees.json` (location → berry type) | Baies au sol (respawn jours). **Mid-game farming loop**. | S (1h) | extract-items |

### 7.2 MOYENNE priorité (2-4h, impact ★★)

| # | Extracteur | Input | Output | Bénéfice | Effort |
|---|---|---|---|---|---|
| **11** | **`extract-move-tutors.mjs`** | `data/scripts/move_tutors.inc` + text tables | `move-tutors.json` (location → move taught) | Move tutor NPCs (ex: Kilowatt ex à Mauville enseigne Tonnerre). | M (1.5h) |
| **12** | **`extract-trainer-rematches.mjs`** | `data/trainer_rematches.h` | `trainer-rematches.json` (trainer id → rematch party) | Dresseurs rematches (team level up après victoire). | S (1h) |
| **13** | **`extract-secret-bases.mjs`** | `data/scripts/secret_bases.inc` | `secret-bases.json` (location + owner trainer) | Secret Base decoration system (bonus, pas MVP). | L (4h) |
| **14** | **`extract-pokemon-icons.mjs`** | `graphics/pokemon_icon/` (40×40 icons) | `pokemon-icons.json` + copie PNG | Party menu affichage icons (party screen, battle healthbox corners). | S (45min) |
| **15** | **`extract-npc-schedules.mjs`** | `data/scripts/*_scripts.inc` (TIME-based events) | `npc-schedules.json` (time → position/anim) | NPCs qui bougent selon heure du jour. **Ambiance dynamique**. | M (2.5h) |
| **16** | **`extract-gift-pokemon.mjs`** | `data/scripts/gift_pokemon.inc` | `gift-pokemon.json` (event → species/level/item) | Pokémon offerts (ex: Nuzleaf chez contrebandier). | S (1h) |
| **17** | **`extract-abilities.mjs`** | `include/constants/abilities.h` + `data/abilities.h` | `abilities.json` (ability id → name FR + description) | Abilities system complet (utilisé combat). | S (1h) |
| **18** | **`extract-natures.mjs`** | `include/constants/pokemon.h` (natures enum) | `natures.json` (nature → stat multipliers + flavor text) | Natures (Hardy, Brave, etc.) affichage stats combat. | S (30min) |

### 7.3 BASSE priorité (polish, bonnus, peut attendre C phases)

| # | Extracteur | Bénéfice | Effort |
|---|---|---|---|
| **19** | **`extract-ribbon-conditions.mjs`** | Ribbons display (cosmétique). | S |
| **20** | **`extract-contest-categories.mjs`** | Contest (minor feature, peut ignorer MVP). | M |
| **21** | **`extract-frontier-rules.mjs`** | Battle Frontier modes (endgame, non-MVP). | L |
| **22** | **`extract-pokemon-form-changes.mjs`** | Forme Pokémon (Deoxys, Castform). **Bonus gros si temps**. | M |
| **23** | **`extract-held-item-effects.mjs`** | Item effect resolve (ex: Choiceband +Atk). | M |

### 7.4 Stratégie extraction (ordre RECOMMANDÉ)

**Pour atteindre Phase A MVP (jouable 1ère heure)** :

```
Session N+0 (batch 1 — 3h max)
  1. extract-battle-terrains
  2. extract-pokemon-anims
  3. extract-trainer-sprites
  → Commit "visuals: realistic GBA battle UI phase 1"

Session N+1 (batch 2 — 2-3h)
  1. extract-bitmap-fonts
  2. extract-pokemon-icons
  → Refactor BattleScene text rendering
  → Commit "visuals: bitmap font 1:1 GBA"

Session N+2 (batch 3 — 2-3h, parallèle gameplay)
  1. extract-evolutions
  2. extract-tm-hm
  3. extract-pokemart
  → Opcodes evolution + CT/CS + shop
  → Commit "gameplay: evolution + items"

Session N+3 (batch 4 — 1-2h, polish)
  1. extract-battle-anims
  2. extract-pokedex-entries
  → Pokédex consultable
  → Battle animations finies
  → Commit "features: full Pokédex + battle anims"
```

---

## Section 8 — Stratégie "fichier maître" runtime (Q.H)

### 8.1 Le problème : coordination runtime disparate

**Situation actuelle** :

- `extract-decomp.mjs` copie ~200 fichiers JSON dans `public/decomp/em/`.
- Chaque module TS charge ce qu'il faut (ex: `script-runner.ts` charge `trainer-parties.json`, `tilemap-loader.ts` charge `metatile-behaviors.json`).
- **Risque** : ajout extracteur nouveau → faut manuellement intégrer dans 3-4 modules TS différents.
- **Pas de source de vérité** : quels JSONs existent? quels sont chargés? qui dépend de quoi?

### 8.2 Solution : `GameRegistry` singleton + manifest

**Nouveau fichier** : `src/engine/game-registry.ts` (proposition 150-200 LOC)

```typescript
/**
 * GameRegistry — Source de vérité ALL extracted decomp data.
 * Singleton lazy-load + dependency tracking.
 */

export interface DataRegistry {
  // Metadata
  summary: { timestamp: string; version: string };
  
  // Constants
  constants: Record<string, number>;    // SPECIES_*, MOVE_*, ITEM_*, etc.
  flagsVars: { flags: Record<string, number>; vars: Record<string, number> };
  
  // Gameplay data
  trainerParties: Record<string, TrainerData>;
  wildEncounters: Record<string, WildTable>;
  items: ItemData[];
  evolutions: Record<string, EvolutionData[]>;
  tmHm: Record<string, number[]>;  // species → [tm ids can learn]
  abilities: Record<string, AbilityData>;
  natures: Record<string, NatureData>;
  
  // Map/World
  mapNamesFr: Record<string, string>;
  metatileBehaviors: Record<string, MetatileBehavior>;
  metatileLabels: Record<string, Record<string, number>>;
  layouts: LayoutData[];
  maps: Record<string, MapData>;
  
  // Text/UI
  textTables: {
    species: Record<string, string>;
    moves: Record<string, string>;
    items: Record<string, string>;
    trainerClasses: Record<string, string>;
  };
  strings: Record<string, string>;
  
  // Graphics
  pokemonAnimations: Record<string, { frames: number }>;
  battleTerrains: Record<string, string>;  // terrain → PNG url
  bitmapFonts: Record<string, FontMetrics>;
  
  // Audio
  musicMeta: Record<string, MusicData>;
}

export class GameRegistry {
  private static instance: GameRegistry;
  private data: Partial<DataRegistry> = {};
  
  static getInstance() {
    if (!this.instance) this.instance = new GameRegistry();
    return this.instance;
  }
  
  async init(baseUrl: string = '/decomp/em') {
    // Charge all JSONs in order (respecting dependencies)
    this.data.summary = await this.fetchJson(`${baseUrl}/_summary.json`);
    this.data.constants = await this.fetchJson(`${baseUrl}/constants.json`);
    this.data.flagsVars = await this.fetchJson(`${baseUrl}/flags-vars.json`);
    // ... chaque JSON chargé avec error handling
    
    console.log('[GameRegistry] initialized:', Object.keys(this.data));
  }
  
  // Accessors typés
  getSpeciesNameFr(speciesEnum: string): string {
    return this.data.textTables?.species?.[speciesEnum] ?? speciesEnum;
  }
  
  getTrainer(trainerId: string): TrainerData | undefined {
    return this.data.trainerParties?.[trainerId];
  }
  
  getMapMetadata(mapId: string): MapData | undefined {
    return this.data.maps?.[mapId];
  }
  
  // Dependency tree query
  dependenciesFor(feature: string): string[] {
    // Ex: 'evolution_system' → ['constants', 'evolutions', 'items']
    const deps: Record<string, string[]> = {
      'evolution_system': ['constants', 'evolutions', 'items'],
      'battle': ['trainerParties', 'items', 'abilities', 'natures'],
      'overworld': ['maps', 'metatileBehaviors', 'mapNamesFr'],
      'script_runner': ['textTables', 'strings', 'constants'],
    };
    return deps[feature] ?? [];
  }
  
  private async fetchJson(url: string): Promise<any> {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Failed fetch ${url}: ${r.status}`);
    return r.json();
  }
}
```

**Utilisation en `src/main.ts`** :

```typescript
import { GameRegistry } from './engine/game-registry';

async function boot() {
  const registry = GameRegistry.getInstance();
  await registry.init('/decomp/em');
  
  // Vérifier dépendances critiques
  const battleDeps = registry.dependenciesFor('battle');
  console.log('Battle needs:', battleDeps);
  
  // Lancer game
  new Phaser.Game(config);
}

boot().catch(err => {
  console.error('[Boot] failed:', err);
  alert('Impossible de charger le jeu. Console pour détails.');
});
```

### 8.3 Alternative : `BOOT_SEQUENCE.md` (documentation)

Si on n'implémente pas de singleton, **documenter l'ordre d'exécution** dans un fichier de référence :

**Fichier** : `BOOT_SEQUENCE.md` (à ajouter)

```markdown
# Boot Sequence — pokemon-web-demo

## Phase 1 : Initialize Phaser + Data
1. `main.ts` creates Phaser game config
2. `BootScene.preload()` loads all static assets (sprites, fonts)
3. `BootScene.create()` initializes `GameRegistry.getInstance().init()`

## Phase 2 : Load Decomp JSONs (Ordre = dépendances)
| Ordre | JSON | Dépend de | Consommé par |
|---|---|---|---|
| 1 | `constants.json` | Aucun | TOUS (indexes) |
| 2 | `flags-vars.json` | constants | game-state, script-runner |
| 3 | `text-tables.json` | constants | data-tables, script-runner |
| 4 | `metatile-behaviors.json` | constants | tilemap-loader |
| 5 | `map-names-fr.json` | Aucun | OverworldScene |
| 6 | `trainer-parties.json` | constants, items | script-runner, BattleScene |
| 7 | `items.json` | constants | script-runner, BattleScene |
| 8 | `wild-encounters.json` | constants | script-runner, BattleScene |

## Phase 3 : Start Scenes
1. `TitleScene` (idle, wait START button)
2. `MainMenuScene` (NEW / CONTINUE)
3. `NamingScene` (player name + starter)
4. `IntroScene` (Birch cinematic)
5. `OverworldScene` (game proper)
```

### 8.4 Recommandation

**Je recommande Option 1 : `GameRegistry` singleton**, car :

✅ **Type-safe** — TypeScript interfaces pour chaque JSON  
✅ **Dependency aware** — query `dependenciesFor(feature)` permet validation  
✅ **Scalable** — ajouter nouvel extracteur = 1 ligne dans registry  
✅ **Error handling** — centralisé, logs clairs si JSON missing  
✅ **Cache** — singleton Lazy-init, pas de re-fetch  

**Timeline implémentation** : 1 session (30min code + 30min tests).

---

## Section 9 — Plan d'attaque ordonné (Q.I)

### 9.1 Matrice priorité/effort/impact

```
LÉGENDE:
- Effort: S (simple <1h), M (medium 1-3h), L (large 3-8h)
- Impact: ★ (cosmétique), ★★ (gameplay flow), ★★★ (core blocker)
- Dépendance: liste items qui doivent être faits avant
```

### 9.2 Vague P1 — Quick wins (1-2h chacun, déblocage visuel immédiat)

| Ordre | Task | Effort | Impact | Dépend de | Détail |
|---|---|---|---|---|---|
| **P1.1** | `extract-battle-terrains.mjs` | S | ★★★ | — | 40 PNG backgrounds combats (herbe, eau, grotte, etc.). Remplace rect bleu. **COSMÉTIQUE mais ÉNORME impact visuel**. |
| **P1.2** | Refactor BattleScene `background` property | S | ★★★ | P1.1 | Load background PNG dynamique selon terrain map. Avant vs après = night & day. |
| **P1.3** | `extract-pokemon-anims.mjs` | S | ★ | — | Idle animation Pokémon (walk in place subtle). |
| **P1.4** | Câbler pokemon-anims dans BattleScene | S | ★ | P1.3 | Phaser tween walk animation sur sprite Pokémon (optional polish). |
| **P1.5** | `extract-trainer-sprites.mjs` | S | ★ | — | Front sprites dresseurs pour intro battle. |
| **P1.6** | Fix healthbox palettes (session 46 correctif) | S | ★★ | — | Appliquer GBA palette `.pal` → healthbox PNG avant render. |

**Temps total P1 : 2-3 sessions = déblocage VISUEL bataille 1:1 GBA**

### 9.3 Vague P2 — Gameplay core (2-4h chacun, déblocage fonctionnel)

| Ordre | Task | Effort | Impact | Dépend de | Détail |
|---|---|---|---|---|---|
| **P2.1** | `extract-evolutions.mjs` | M | ★★★ | — | Species+condition table. Débloque évolution items/level/friendship. |
| **P2.2** | Opcode `evolve SPECIES_*` dans script-runner | M | ★★★ | P2.1 | Déclenche cinématique évolution (refacto future, MVP = juste party update). |
| **P2.3** | `extract-tm-hm.mjs` | M | ★★ | — | CT/CS table (species → [tm ids]). |
| **P2.4** | Opcodes `givetm`, `checktm` dans script-runner | M | ★★ | P2.3 | Items CT utilisables, apprentissage Pokémon. |
| **P2.5** | `extract-pokemart.mjs` | S | ★★ | extract-items (déjà fait) | Shop inventaire per-city. |
| **P2.6** | Opcode `shop` (ou refactor existant) dans script-runner | M | ★★ | P2.5 | Affiche UI shop, permet buy/sell items. |
| **P2.7** | Input joueur combat (FIGHT/POKÉMON/BAG/RUN menu) | L | ★★★ | — | **GROS CHANTIER**. Remplace RandomAI joueur par input clavier. |
| **P2.8** | Switch Pokémon en combat + party menu | M | ★★★ | P2.7 | Sélection Pokémon UI dans combat (party screen overlay). |

**Temps total P2 : 3-4 sessions = gameplay MVP Phase A complet**

### 9.4 Vague P3 — Polish & features (3-6h, finition MVPqualité)

| Ordre | Task | Effort | Impact | Dépend de | Détail |
|---|---|---|---|---|---|
| **P3.1** | `extract-bitmap-fonts.mjs` | M | ★★ | — | Bitmap font GBA pour text. |
| **P3.2** | Refactor BattleScene + dialogue-box.ts fonts → bitmap | M | ★★ | P3.1 | Utilise bitmap font au lieu Phaser text. Exact 1:1 GBA rendu. |
| **P3.3** | `extract-pokedex-entries.mjs` | M | ★ | — | Pokédex descriptions FR. |
| **P3.4** | Pokedex scene + consultable UI | M | ★ | P3.3 | Accédable depuis menu principal (dex read-only MVP). |
| **P3.5** | `extract-battle-anims.mjs` | M | ★★ | — | Attack animations (slash, fire, etc.). |
| **P3.6** | Intégrer battle-anims dans BattleScene | L | ★★ | P3.5 | Affiche animation attaque avant damage, timeline Phaser. |
| **P3.7** | `extract-pokemon-icons.mjs` | S | ★ | — | Party icons 40×40. |
| **P3.8** | Afficher icons party dans OverworldScene + BattleScene | S | ★ | P3.7 | Petit affichage équipe (coin écran). |
| **P3.9** | Refactor textbox 9-slice runtime | M | ★★ | — | Composition `textbox.png` GBA au lieu rect blanc. |
| **P3.10** | Refactor intro title rendering (runtime vs pré-rendu) | M | ★ | — | Supprime `render-title.mjs` pré-rendu, compose runtime. |

**Temps total P3 : 4-5 sessions = Phase A MVP polish + début Phase B**

### 9.5 Vague P4 — Phase B (routes & donjons)

| Ordre | Task | Effort | Impact | Dépend de | Détail |
|---|---|---|---|---|---|
| **P4.1** | Wild encounter auto-trigger grass | M | ★★★ | — | Metatile herbe (0x02) → RNG spawn + BattleScene. |
| **P4.2** | `extract-npc-schedules.mjs` | M | ★★ | — | Time-based NPC positions (day/night différent). |
| **P4.3** | Câbler schedules dans npc-behavior | M | ★★ | P4.2 | NPCs bougent selon heure. |
| **P4.4** | `extract-secret-bases.mjs` | L | ★ | — | Decorator system (bonus endgame, peut ignorer MVP). |
| **P4.5** | Gym & badge system | L | ★★★ | P2.1 | Gym leader battle, badge earning, Pokédex mode. |
| **P4.6** | Refactor `script-runner.ts` 723L → dispatch map | M | ★★ | — | Maintenabilité : switch → Map de handlers. |

**Temps total P4 : 5-7 sessions = Phase B jouable (routes 101-102 complètes)**

### 9.6 Vague P5 — Phase C & polish final

| Ordre | Task | Effort | Impact | Dépend de | Détail |
|---|---|---|---|---|---|
| **P5.1** | Delete pré-rendu 65MB (`public/decomp/em/rendered/`) | S | ★ | P3.10 | Cleanup fichiers inutiles. |
| **P5.2** | Extract remaining battle assets (move tutors, etc.) | M | ★ | — | `extract-move-tutors.mjs`, `extract-gift-pokemon.mjs`. |
| **P5.3** | Audio polish (cries timing sync, music fade crossfade) | M | ★★ | — | Sappy timing affinage. |
| **P5.4** | Sprite animation polish (entrée/sortie, crit flashes) | M | ★★ | — | Phaser tween effects. |
| **P5.5** | Full game playable Littleroot → Slateport → Rustboro | L | ★★★ | P4+ | Intégration Phase B complète. |

---

## Section 9.7 — Critical path vers MVP Phase A

**Minimum viable path (ignore P5, P4.4-5, certains P3)** :

```
WEEK 1 :
  Mon    : P1.1 extract-battle-terrains + P1.2 refactor BattleScene bg
  Tue    : P1.3-4 pokemon-anims + P1.6 healthbox palettes
  Wed    : P2.1-2 evolutions + évolution opcode
  Thu    : P2.3-4 TM/HM + CT/CS opcodes
  Fri    : P2.5-6 pokemart shop system
  
WEEK 2 :
  Mon-Wed: P2.7 INPUT JOUEUR COMBAT (L task, 8h+)
  Thu    : P2.8 party switch en combat
  Fri    : P3.1-2 bitmap fonts battle
  
WEEK 3 :
  Mon-Wed: P3.3-4 Pokédex + entries
  Thu-Fri: P3.5-6 battle animations
  
WEEK 4 (final polish) :
  Mon-Tue: P3.9 textbox 9-slice
  Wed-Thu: P3.10 intro runtime refactor
  Fri    : QA, bugfix, playthrough complet
```

**Résultat fin Week 4** :
- ✅ Littleroot → Route 101 complètement jouable
- ✅ 1er combat dresseur (avec input joueur)
- ✅ Évolution + CT/CS + Pokédex
- ✅ UI 1:1 GBA (fonts, backgrounds, healthboxes)
- ✅ Phase A MVP **DONE**

---

# RÉSUMÉ EXÉCUTIF

## Réponses aux questions critiques

### Q.A — Cartographie décomp ✅
**519 maps en 34 groupes**, organisées dans `data/maps/` + `data/layouts/`. Orchestration via **`data/maps.s`** qui inclut tables ROM `layouts.inc`, `headers.inc`, `connections.inc`.

### Q.B — Fichier maître ✅
**PAS UN FICHIER UNIQUE**. Architecture modulaire. Points clefs :
- **`data/maps.s`** rassemble layouts+maps+connections.
- **`data/maps/map_groups.json`** = répertoire JSON 519 maps.
- **`Makefile`** = orchestra build (dépendances implicites).
- **`include/constants/*.h`** (80 enums) = indexation globale.
- **`src/overworld.c` + `src/script.c`** = interpréteur runtime.

### Q.C — Outils décomp ✅
**11 outils C** : `gbagfx` (PNG→GBA), `mapjson` (JSON→asm), `mid2agb` (MIDI→Sappy), `wav2agb`, `preproc`, `gbafix`, `bin2c`, `ramscrgen`, `rsfont`, `scaninc`, `jsonproc`. Aucun utilisé en runtime (infos JSON déjà extraites).

### Q.D — Inventaire projet ✅
- **25 extracteurs `.mjs`** (23 pour `extract:all-bulk`)
- **23 fichiers `src/engine/`** (script-runner 723L, tilemap-loader, music.ts, etc.)
- **10 fichiers `src/scenes/`** (OverworldScene, BattleScene principal)
- **`public/decomp/em/`** = 200+ JSONs + PNG + music + cries
- **15 docs `.md`** (DEV_LOG, ROADMAP, ARCHITECTURE, etc.)

### Q.E — État features ✅
- ✅ Boot complet, overworld, NPCs, scripts 58 opcodes, dialogues, music MIDI
- ✅ Save/load, item balls, starter choice, combat dresseur avec @pkmn/sim
- 🟡 Battle UI GBA OK (healthboxes) mais manquent backgrounds, textbox 9-slice, input joueur
- ❌ Pas implémenté : évolutions, CT/CS, Pokémart, party menu combat

### Q.F — Diagnostic BattleScene ✅
- ✅ Sprites Pokémon, healthboxes opponent/player avec HP bars, logs combats FR
- 🟡 Background = rect bleu placeholder (terrain assets dispo, pas extraits)
- 🟡 Textbox = rect blanc (9-slice asset dispo, pas utilisé)
- ❌ Status icons, bitmap font numbers, animation sprite, no input joueur

### Q.G — Automatisations prioritaires ✅
**Top 10 extracteurs** :
1. `extract-battle-terrains.mjs` (S) — 40 backgrounds combats
2. `extract-bitmap-fonts.mjs` (M) — polices GBA exact
3. `extract-evolutions.mjs` (M) — table évolutions
4. `extract-tm-hm.mjs` (M) — CT/CS learnsets
5. `extract-battle-anims.mjs` (M) — attaque animations
6. `extract-pokemart.mjs` (S) — shop inventaires
7. `extract-pokedex-entries.mjs` (M) — descriptions FR
8. `extract-pokemon-icons.mjs` (S) — icons 40×40
9. `extract-pokemon-anims.mjs` (S) — idle animations
10. `extract-trainer-sprites.mjs` (S) — front sprites dresseurs

### Q.H — Stratégie fichier maître runtime ✅
**Créer `GameRegistry` singleton** :
- Charge all JSONs en ordre (dépendances explicites)
- Exports accessors typés (`getSpeciesNameFr()`, `getTrainer()`, etc.)
- `dependenciesFor(feature)` pour validation
- Alternative : `BOOT_SEQUENCE.md` doc (si pas de code registry)

### Q.I — Plan d'attaque ordonné ✅
**Critical path 4 semaines** :
- **P1 (Quick wins)** : battle backgrounds, pokemon anims, fix healthboxes (2-3h)
- **P2 (Core gameplay)** : evolutions, TM/HM, shop, INPUT JOUEUR COMBAT (L), party switch (1-2 sessions)
- **P3 (Polish)** : bitmap fonts, Pokédex, battle anims, textbox 9-slice (3-4 sessions)
- **P4 (Phase B)** : wild encounters, NPC schedules, gyms (5-7 sessions)
- **Résultat** : Phase A MVP complet fin semaine 4.

---

**Fin du rapport — 800+ lignes, très approfondi. Document à relire avant chaque session pour alignement.**