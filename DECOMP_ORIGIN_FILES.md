# DECOMP ORIGIN FILES — Master Catalog

> Audit méta du décomp `D:\Projet 1\decomps\pokeemeraude` du 2026-04-25.
> **But** : avoir UNE référence unique des fichiers "origine" (registries / catalogs / lookup tables / info structs) qui centralisent les données par domaine. Plus de cherche-trouve manuel à chaque feature.
>
> **Pattern** : chaque entrée = `(fichier, ligne, ce qu'il catalog, lien vers)`. Pour chaque domaine, une stratégie d'extraction.

---

## A. MOVEMENT (Player + NPC)

| Fichier | Ligne | Catalog | Lien vers |
|---|---|---|---|
| `src/data/object_events/movement_type_func_tables.h` | full | 50+ `gMovementTypeFuncs_*` arrays pour chaque pattern (Wander, Face, Walk, Rotate, Copy, etc.) | chaîné avec `event_object_movement.c` |
| `src/data/object_events/movement_action_func_tables.h` | full | Table mapping `MOVEMENT_ACTION_*` opcodes vers fonctions callback (m_walk_left, m_jump, m_delay, etc.) | parsing des scripts applymovement |
| `include/constants/event_object_movement.h` | full | Enums `MOVEMENT_TYPE_*`, `MOVEMENT_ACTION_*`, directions DIR_NORTH/SOUTH/EAST/WEST | utilisation dans events + scripts |
| `src/event_object_movement.c` | ~3000 | Implémentation des comportements; `gLockPlayerFieldControls` registry pour mouvements restreints | gère animations + collision |
| `include/event_object_movement.h` | ~80 | Direction palettes (`gStandardDirections[]`, `gUpAndDownDirections[]`, etc.) pour mouvement limité | définit patterns secondaires |

**Stratégie port** : Extract `movement_type_func_tables.h` en JSON. Chaque pattern (Wander, Face, etc.) devient une classe `MovePattern`. Les enums `MOVEMENT_TYPE_*` et `MOVEMENT_ACTION_*` essentiels pour parser les script opcodes applymovement. Mapper directions (0-3) vers pixels x/y.

---

## B. MENU SYSTEM

| Fichier | Ligne | Catalog | Lien vers |
|---|---|---|---|
| `src/menu.c` | ~200-500 | Menu templates (sStandardTextBox, sYesNoMenu, positions/dimensions) + callbacks | `window.c` pour rendu |
| `src/main_menu.c` | full | MenuAction[] principal; title screen → main menu → bag/dex/party/save/settings flow | `intro.c` → `title_screen.c` |
| `include/menu.h` | 34-41 | struct MenuAction definition: text ptr + callback union | tous les menus |
| `include/start_menu.h` | full | Start menu registry avec 5+ actions (Pokédex, Pokémon, Bag, PokéNav, Options, Save, Quit) | `main_menu.c::gStartMenuActions[]` |
| `include/party_menu.h` | full | Party screen layout + item selection cursor logic | `pokemon_summary_screen.c` |
| `include/script_menu.h` + `src/data/script_menu.h` | full | Script-invoked menus (msgbox, yesno, menu) via opcodes | `event_scripts.c` parser |
| `src/text_window.c:51-82` | 51-82 | `sTextWindowPalettes[5]` + `sWindowFrames[20]` TilesPal mapping (graphics + palettes pour 20 frames) | `GetWindowFrameTilesPal()` |
| `src/menu.c:84+` | 84+ | sStandardTextBox (position 2,13,28,4) + sYesNo template | utilise `InitMenuNormal()` |

**Stratégie port** : Start menu est le point d'entrée. Extract `MenuAction[]` et build un menu router (label → callback). Chaque action (POKÉDEX, POKÉMON, SAC) mappe vers une submenu ou screen. Window frames + palettes statiques — exporter en assets. Palette slots (`PALSLOT_PLAYER`, `PALSLOT_NPC_1`, etc.) gèrent la sélection.

---

## C. INTRO / TITLE SCREEN / NEW GAME

| Fichier | Ligne | Catalog | Lien vers |
|---|---|---|---|
| `src/intro.c` | full | Séquence intro : Rayquaza fade → copyright → title → main menu flow | `CB2_InitCopyrightScreenAfterBootup()` |
| `include/intro.h` | 9-11 | Callback entry points `CB2_InitCopyrightScreenAfterBootup()`, `CB2_InitCopyrightScreenAfterTitleScreen()` | `start.c` main loop |
| `src/title_screen.c` | full | Title screen graphics + input handler; transitions to main menu après A/B press | `intro.c` → `main_menu.c` |
| `src/data/graphics/intro_scene.h` | full | Rayquaza intro sequence graphics + animation tables | `intro.c` renderer |
| `data/scripts/new_game.inc` | full | New game script: birch speech → naming → select gender → truck spawn → route 101 | event engine |
| `data/scripts/intro.inc` + map script data | full | Intro map events (Birch, Truck driver, initial NPC interactions) | map system load |

**Stratégie port** : Intro est une state machine : `[Rayquaza video] → [Copyright] → [Title + input] → [Main Menu]`. Track transitions via callback ptrs. New game script est pure eventscript opcode — parser ce pour exécuter (msgbox, applymovement, etc.). Rayquaza graphics compilés via INCGFX → convertir à web assets (PNG/JSON).

---

## D. DIALOGUE / TEXT

| Fichier | Ligne | Catalog | Lien vers |
|---|---|---|---|
| `src/text.c:119-180` | 119-180 | `sFontInfos[]` : 10 font definitions (FONT_SMALL/NORMAL/SHORT/BRAILLE/NARROW, etc.) avec defaults `{maxLetterWidth, maxLetterHeight, letterSpacing, lineSpacing, {fgColor, bgColor, shadowColor}}` | `FontFunc_Small/Normal/Short/etc.` |
| `src/text_window.c:51-82` | 51-82 | `sTextWindowPalettes[5]` : message_box, text_pal1-4 palettes (u16[16] chacun) | `GetTextWindowPalette()` |
| `src/text_window.c:60-82` | 60-82 | `sWindowFrames[20]` : TilesPal (tiles + pal) pour 20 window designs | `GetWindowFrameTilesPal()` |
| `src/text.c:82-93` | 82-93 | `sGlyphWidthFuncs[]` : mapping `{fontId, GetGlyphWidth_*}` pour text layout par font | `RenderText()` |
| `src/text.c:100-115` | 100-115 | `sKeypadIcons[]` : button icons (A, B, L, R, START, SELECT, D-pad variants) avec `{tileOffset, width, height}` | msgbox rendering |
| `include/text.h:11-21` | 11-21 | Enum FONT_SMALL/NORMAL/SHORT/COPY_1/COPY_2/COPY_3/BRAILLE/NARROW/SMALL_NARROW/BOLD | utilisation partout |
| `src/text_window.c:9-28` | 9-28 | 20 window frame graphics (`gTextWindowFrame1_Gfx...gTextWindowFrame20_Gfx`) + palettes | `sWindowFrames` indexing |
| `src/text.c:363` | 363 | `GenerateFontHalfRowLookupTable(fg, bg, shadow)` : encoding font tile **2-bit per pixel** valeurs 0=bg/1=fg/2=shadow | `DecompressGlyphTile` |

**Stratégie port** : Fonts sont metadata tables — convert to TypeScript interfaces. Window frames juste tile/palette pointers, exporter comme assets. Font colors (fg/bg/shadow) sont palette indices 1-4. Text printer state dans `TextPrinter` struct — implémenter une simple state machine. Keypad icons spéciaux (embedded dans text via escape codes).

---

## E. BATTLE

| Fichier | Ligne | Catalog | Lien vers |
|---|---|---|---|
| `src/data/battle_moves.h` | 1-end | `gBattleMoves[MOVES_COUNT]` : move defs `{effect, power, type, accuracy, pp, secondaryChance, target, priority, flags}` | move executor |
| `src/data/items.h` | 1-end | `gItems[]` : item definitions `{name, id, price, description, pocket, type, fieldUseFunc, battleUsage, battleUseFunc}` | item handler |
| `src/data/trainers.h` | full | `gTrainers[]` : trainer registry `{partySize, party[], class, name, sprites, etc.}` | trainer AI + rendering |
| `src/data/trainer_parties.h` | full | `gTrainerMons[]` : individual pokémon in trainer teams `{species, level, moves, heldItem, etc.}` | team loader |
| `src/data/pokemon/species_info.h` | 35+ | `gSpeciesInfo[]` : base stats `{hp, attack, defense, spAtk, spDef, speed}`, types, catch rate, exp yield, gender ratio, growth rate, abilities, egg groups | `pokemon.c` |
| `src/data/pokemon/evolution.h` | full | Evolution chains : `{preEvolution, method, param, postEvolution}` tables | pokemon evolution logic |
| `src/data/pokemon_graphics/front_pic_table.h` | full | Front sprite pointers per pokémon species | battle UI renderer |
| `src/data/pokemon_graphics/back_pic_table.h` | full | Back sprite pointers per pokémon species | own pokémon render |
| `src/data/pokemon_graphics/front_pic_coordinates.h` | full | Position offsets `{x, y}` pour chaque front sprite | battle layout positioning |
| `src/data/battle_anim.h` | full | Battle animation definitions : move animations, sprite effects, particles | anim executor |
| `src/data/pokemon/level_up_learnsets.h` | full | Pokémon move learn tables (pointer array per species) | moveset builder |
| `src/battle_controllers.c` | ~2000+ | Battle state machine : player vs opponent vs double vs safari modes | main battle loop |
| `include/constants/battle_move_effects.h` | full | EFFECT_HIT, EFFECT_BURN, EFFECT_PARALYZE, etc. enum pour move effects | effect application |

**Stratégie port** : `gBattleMoves` et `gItems` sont des registries — exporter comme JSON de lookup tables. Trainer parties référencent `gTrainerMons` — join logic. Species info statique — build une classe TypeScript Pokemon avec defaults. Front/back pics + coordinates dans tables séparées — merge au frontend. Battle anims complexes (GBA sprite format) — soit exporter comme video, soit build animation player.

---

## F. WORLD / MAP

| Fichier | Ligne | Catalog | Lien vers |
|---|---|---|---|
| `src/data/tilesets/headers.h` | full | `gTileset_*` : struct Tileset avec `{isCompressed, isSecondary, tiles ptr, palettes ptr, metatiles ptr, metatileAttributes ptr, callback InitTilesetAnim_*}` | map renderer load |
| `src/data/tilesets/graphics.h` | full | Tileset graphics pointers (`gTilesetTiles_General`, `gTilesetTiles_Petalburg`, etc.) | `headers.h` ref |
| `src/data/tilesets/metatiles.h` | full | Metatile definitions : 8x8 tile blocks → 16x16 screen units | layout decoder |
| `data/maps/*` | 519 dirs | Map layouts (map.bin binary), connections, warps, object events, scripts | engine loads per map |
| `data/maps/*/map.json` | full | Modern decomp format : `{width, height, border_width, border_height, layers[tileset_id]}` + connections | Pokedex map viewer |
| `data/maps/*/scripts.inc` | full | Per-map script engine commands (msgbox, applymovement, setflag, etc.) | ScriptContext interpreter |
| `include/constants/map_groups.h` | full | `MAP_GROUP_LITTLEROOT`, `MAP_PETALBURG_CITY`, etc. enums (map ID registry) | global map addressing |
| `src/data/region_map/region_map_layout.h` | full | Region map graphics + city positions pour pokedex | map view screen |
| `src/data/region_map/city_map_entries.h` | full | City names, regions, coordinates pour region map | region_map renderer |

**Stratégie port** : Maps au cœur du monde. Chaque map a un layout (tileset + metatiles + events) + script. Tilesets statiques (General, Petalburg, etc.), exporter une fois. Connections chainent maps — build a map graph. Scripts sont opcodes — interpreter loop pour msgbox, applymovement, etc. Region map est une 2D visualization.

---

## G. NPC / OBJECT EVENTS

| Fichier | Ligne | Catalog | Lien vers |
|---|---|---|---|
| `src/data/object_events/object_event_graphics_info.h` | full | `gObjectEventGraphicsInfo_*` : NPC/player sprite definitions `{tileTag, paletteTag, size {w,h}, shadowSize, tracks {foot/bike/etc}, oam, subspriteTable, anims, images, affineAnims}` | sprite loader |
| `src/data/object_events/object_event_graphics_info_pointers.h` | full | Pointer array indexant tous les graphics_info (player, NPCs, etc.) | ID → graphics lookup |
| `src/data/object_events/object_event_anims.h` | full | Animation frame sequences per graphics type (standard, acro bike, surfing, etc.) | anim player |
| `src/data/object_events/object_event_subsprites.h` | full | Subsprite OAM tables (4x4, 8x8, 8x16, 16x16, 16x32, 32x32) pour sprite composition | oam builder |
| `include/constants/event_objects.h` | full | NPC IDs : `LOCALID_BRENDAN`, `LOCALID_MAY`, `LOCALID_BIRCH`, etc. per-map + global (`TRAINER_*`, `ITEMBALL_*`) | event reference |
| `src/data/object_events/object_event_pic_tables.h` | full | Front/back pic pointers per species (mirrors pokemon graphics) | NPC sprite select |

**Stratégie port** : Object events sont "instances" de sprite definitions. graphics_info centralize sprite metadata (size, anim tables, OAM). Chaque map référence events par LOCALID. Sprite composition est OAM-based (GBA hardware) → converter à web sprite sheets. Tracks (FOOT vs BIKE) affectent le son lors du mouvement (footsteps).

---

## H. SCRIPTS & EVENT ENGINE

| Fichier | Ligne | Catalog | Lien vers |
|---|---|---|---|
| `include/event_scripts.h` | full | Event script extern declarations (`EventScript_TestSignpostMsg[]`, `EventScript_TryGetTrainerScript[]`, etc.) | `script.c` parser |
| `src/script.c` | ~3000+ | Script interpreter : opcode parser + execution loop; `gScriptCmdTable` mapping opcodes → callbacks | `data/scripts/*.inc` |
| `asm/macros/event.inc` | full | Macros msgbox, applymovement, setflag, waitfanfare, etc. (assembler-time script builders) | user-facing script DSL |
| `include/constants/event_objects.h` | full | Script command IDs (if present) ; mostly opcodes in `data/scripts` | script bytecode enums |
| `data/scripts/*.inc` | ~100+ | Map-specific scripts + global scripts (trainer battle, berry tree, gift) en bytecode | `script.c` executed |
| `include/event_object_movement.h` | ~80 | Movement opcodes (m_walk_left, m_jump, m_delay, m_face, etc.) ; used in applymovement macros | `movement_action_func_tables.h` |

**Stratégie port** : Script engine est une bytecode VM. Opcodes (msgbox, applymovement, setflag, etc.) compilés via macros. Build un interpreter dans TypeScript : `next opcode → switch(opcode) → call handler → yield if async (wait, animation)`. Applymovement compile à une sequence de movement actions — pack as minimal bytecode.

---

## I. SAVE / FLAGS / VARS

| Fichier | Ligne | Catalog | Lien vers |
|---|---|---|---|
| `include/save.h` | full | `SaveBlock*` definitions (SaveBlock1 = permanent data, SaveBlock2 = temp, SaveBlock3 = hoenn data) | `save.c` serialization |
| `include/event_data.h` | 21-48 | Flag registry : `FlagGet/FlagSet/FlagClear` API + special vars (`gSpecialVar_0x8000-0x800B`, `gSpecialVar_Result`, `gSpecialVar_LastTalked`, etc.) | event interpreter |
| `src/event_data.c` | ~500 | Flag/Var storage : `gSaveBlock1Ptr→flags[]`, `gSaveBlock1Ptr→vars[]` (256 vars, 600+ flags) | runtime access |
| `src/save.c` | ~2000+ | Save file format + CRC calculation; gSaveblock sizes; `ClearSaveData()` | save serialization |
| `include/constants/event_flags.h` | full | Named flags (`FLAG_NURSERY_FEMALE`, `FLAG_TRAINER_BATTLE_CLEARED`, etc.) enum | flag ID mapping |
| `include/constants/event_vars.h` | full | Named vars (`VAR_RESULT`, `VAR_TEMP_*`, `VAR_ROAMER_*`) enum | var ID mapping |

**Stratégie port** : Flags et vars sont bitmasks + array. Extract `FLAG_*` et `VAR_*` enums → JSON config. SaveBlock structure : reconstruct en TypeScript (class SaveData). On save/load, serialize `flags[]` (bitfield) + `vars[]` (u16[]) + party (6×mon struct) + pokedex + itemBag. CRC pour integrity.

---

## J. AUDIO / SOUND

| Fichier | Ligne | Catalog | Lien vers |
|---|---|---|---|
| `sound/song_table.inc` | full | M4A song table : `songs[]` array mapping song IDs → MIDIs + voicegroups | m4a audio engine |
| `include/constants/songs.h` | full | Song ID enums (`BGM_TITLE`, `BGM_PETALBURG_CITY`, `SE_SELECT`, `SE_CONFIRM`, etc.) | `PlayBGM()/PlaySE()` |
| `include/sound.h` | 6-48 | Sound API : `PlayBGM(), PlaySE(), PlayFanfare(), PlayCry(), FadeOutBGM(), etc.` | audio manager |
| `src/sound.c` | ~1500 | Audio state machine : map music stack, fanfare queue, cry playback; calls m4a runtime | m4a driver integration |
| `src/bard_music.c` + `src/data/bard_music/*.h` | full | Contest bard music : 20 word categories (actions, adjectives, feelings, etc.) × speech patterns | bard music composer |

**Stratégie port** : Mapping song IDs → audio files simpliste. `song_table.inc` mappe ID → MIDI+voicegroup → exporter comme JSON `{id, name, path}`. Sound API asynchrone (BGM queue, fanfare priority). Port simpliste : Web Audio API, load .ogg/mp3 indexed by ID. Cries sont per-species → map species ID → cry audio. Bard music est procedural (word combos) → peut être généralisé.

---

## K. TYPES & ABILITIES & NATURES

| Fichier | Ligne | Catalog | Lien vers |
|---|---|---|---|
| `include/constants/pokemon.h` | full | TYPE_NORMAL, TYPE_FIRE, ..., TYPE_DARK enum (18 types) | move type matching |
| `include/constants/abilities.h` | full | ABILITY_OVERGROW, ABILITY_BLAZE, ... enum (~77 abilities) | ability resolution |
| `include/constants/pokemon_species.h` | full | SPECIES_BULBASAUR, SPECIES_CHARMANDER, ... enum (~386 species Emerald) | mon type coercion |
| `src/data/text/abilities.h` | full | Ability name strings + descriptions | UI display |
| `src/data/text/nature_names.h` | full | 25 nature names (Hardy, Lonely, Brave, ..., Quirky) | stat modifier lookup |
| `src/data/text/species_names.h` | full | Pokémon name strings indexed by SPECIES_* enum | mon display |
| `include/constants/item.h` | full | ITEM_NONE, ITEM_MASTER_BALL, ITEM_ANTIDOTE, ... enum | item ID lookups |

**Stratégie port** : Types, abilities, natures sont enums → convert to TypeScript. Names/descriptions come from text files → compile as JSON. Pokemon → Type lookup table. Ability → Stat mods (Nature → stat multipliers). Build enum registries + lookup functions.

---

## L. ITEM SYSTEM

| Fichier | Ligne | Catalog | Lien vers |
|---|---|---|---|
| `src/data/items.h` | 1-end | `gItems[ITEMS_COUNT]` : `{name, id, price, description, pocket (POCKET_ITEMS/BALLS/KEY/TMHM/BERRIES/DECORATIONS), type, battleUsage, fieldUseFunc, battleUseFunc, secondaryId}` | item behavior |
| `src/data/item_icon_table.h` | full | Item icon graphics + palette pointers per item ID | bag UI |
| `include/constants/items.h` | full | ITEM_* enums (balls, potions, berries, key items, etc.) | item ID mapping |
| `src/data/text/item_descriptions.h` | full | Item description strings | item details |
| `src/data/pokemon/item_effects.h` | full | Wild pokémon held item chances (species → item[] arrays) | wild encounter generator |

**Stratégie port** : Items sont statiques registries. Build a class Item avec metadata. Pockets organize bag view (ITEMS / POKEBALLS / KEY ITEMS / etc.). Use + field/battle effects sont callbacks → map to TypeScript methods. Icon table pour inventory rendering.

---

## M. ENCOUNTERS & WILD POKÉMON

| Fichier | Ligne | Catalog | Lien vers |
|---|---|---|---|
| `src/data/wild_encounters.json` | full | JSON export : map → encounter tables (grass/water/cave/etc) with `{species, minLevel, maxLevel, probability}` | encounter engine |
| `src/data/pokemon/level_up_learnsets.h` | full | Level-up moveset tables (pointer per species) | move learning |
| `src/data/pokemon/tmhm_learnsets.h` | full | TM/HM compatibility bitfield per species | move expansion |
| `src/data/pokemon/tutor_learnsets.h` | full | Move tutor compatibility per species | special tutor nodes |
| `src/data/pokemon/egg_moves.h` | full | Egg move pools per species | breeding moves |

**Stratégie port** : `wild_encounters.json` is already modernized — use directly. Movesets (level-up, TM/HM, tutor, egg) sont bitfields/arrays — denormalize to JSON per species. Build moveset builder logic.

---

## N. TRAINER AI & BATTLE FRONTIER

| Fichier | Ligne | Catalog | Lien vers |
|---|---|---|---|
| `src/data/trainers.h` | full | `gTrainers[]` : `{partySize, party[], trainerClass, trainerName, double, aiFlags, items[], customMoveFlags}` | trainer resolver |
| `src/data/trainer_parties.h` | full | `gTrainerMons[]` : trainer pokémon avec species, level, moves, heldItem, friendship, nature, ivs, evs | team loader |
| `src/data/battle_frontier/battle_frontier_trainers.h` | full | Battle Frontier opponent registry (pre-built teams) | BF opponent select |
| `src/battle_ai_script_commands.c` | ~2000 | Battle AI : script interpreter for trainer move selection logic | move choice during battle |
| `include/constants/battle_ai.h` | full | AI command enums (if_, and_, or_, setbattlevars, etc.) | AI bytecode |

**Stratégie port** : Trainers sont metadata-rich → build a class. AI bytecode is complex → simplify for MVP (always pick STAB, switch if advantageous). Battle Frontier optional for MVP.

---

## O. POKEDEX

| Fichier | Ligne | Catalog | Lien vers |
|---|---|---|---|
| `src/data/pokemon/pokedex_entries.h` | full | Pokédex entry text per species + height, weight, description categories | pokedex display |
| `src/data/pokemon/pokedex_text.h` | full | Pokédex category enum (HEIGHT, WEIGHT, DESCRIPTION, etc.) + localization | entry parser |
| `src/data/pokemon/pokedex_orders.h` | full | National dex ordering (Kanto, Johto, Hoenn) | dex sort options |
| `src/data/region_map/city_map_entries.h` | full | City names + map area glow regions pour region map | world geography |

**Stratégie port** : Pokédex est un UI overlay. Load entries from JSON per species. Categories (height, weight, description) localizables → support i18n. Seen/caught flags tracked in SaveBlock.

---

## P. GRAPHICS DATA STRUCTURES

| Fichier | Ligne | Catalog | Lien vers |
|---|---|---|---|
| `src/data/pokemon_graphics/palette_table.h` | full | Normal palette pointers per pokémon species | sprite coloring |
| `src/data/pokemon_graphics/shiny_palette_table.h` | full | Shiny palette pointers per species | shiny variant |
| `src/data/trainer_graphics/front_pic_tables.h` | full | Trainer front sprite pointers (male/female variants) | trainer battle UI |
| `src/data/trainer_graphics/back_pic_tables.h` | full | Trainer back sprite pointers | trainer sprite render |
| `src/data/graphics/pokemon.h` | full | Pokémon sprite metadata (compressed status) | sprite decompression |
| `src/data/graphics/trainers.h` | full | Trainer sprite metadata | trainer load |

**Stratégie port** : Palette tables sont statiques → build a lookup. Sprites GBA format (4bpp tile-based) → convert to PNG sheets. Metadata (compressed bit) guides decompression if applicable.

---

## Q. CONSTANTS & CONFIGURATION

| Fichier | Ligne | Catalog | Lien vers |
|---|---|---|---|
| `include/constants/pokemon.h` + `.inc` | full | TYPE_*, GENDER_*, ABILITY_*, GROWTH_RATE_*, EGG_GROUP_* enums | type safety |
| `include/constants/items.h` | full | ITEM_* enums (all 377+ items) | item reference |
| `include/constants/abilities.h` | full | ABILITY_* enums | ability reference |
| `include/constants/moves.h` | full | MOVE_* enums (all 355+ moves) | move reference |
| `include/constants/songs.h` | full | BGM_*, SE_*, CRY_* enums (100+ songs) | audio reference |
| `include/constants/map_groups.h` | full | MAP_GROUP_* + per-group MAP_*_CITY enums | map ID addressing |

**Stratégie port** : Enums essentiels → convert tous à TypeScript (readonly enums ou const objects). Garder consistency d'ID entre decomp et port.

---

## ORDRE D'EXTRACTION RECOMMANDÉ POUR MVP

1. **Constants** (types, items, moves, species, abilities) → JSON enums ✅ partiellement fait
2. **Pokemon Data** (species_info, moves, abilities, natures) → TypeScript classes ✅ via @pkmn/dex
3. **Map System** (tilesets, map layouts, wild_encounters.json) → web viewer ✅
4. **Battle System** (moves, items, abilities, type chart) → move executor + type matching ✅ via @pkmn/sim
5. **Script Engine** (opcodes, msgbox, applymovement) → bytecode VM ✅ partiel
6. **UI** (text, fonts, window frames, menus) → screen layouts + asset management ✅ partiel (Vague 7)
7. **Audio** (song_table, cry registry) → Web Audio player ⏳ Vague 8
8. **Trainers & NPCs** (trainers.h, trainer_parties.h, object_event_graphics_info.h) → NPC spawning + battle setup ✅
9. **Intro / Title Screen** → state machine navigation ✅
10. **Movement** (movement_type/action_func_tables.h) → ⏳ NEXT (debloquera A/B/D des bugs)
11. **Advanced** (contest, battle frontier, mystery events) → post-MVP

---

## PROCHAINES SESSIONS — PLAN D'ATTAQUE

Maintenant qu'on a cette carte, chaque feature manquante = lookup direct :

| Bug observé | Domaine catalog | Fichier origine | Action |
|---|---|---|---|
| Mouvement "step" raté | A. MOVEMENT | `movement_action_func_tables.h` | Extract → matcher avec applymovement |
| Boutons menu mal placés | B. MENU | `start_menu.h` + `script_menu.h` | Extract MenuAction[] → router |
| Intro skip mauvais frame | C. INTRO | `intro.c` callbacks chain | Mapper state machine |
| Halo texte | D. DIALOG | `text.c sFontInfos[]` | DEJA fait ✅ |
| Sons MIDI cassés | J. AUDIO | `song_table.inc` | Vague 8 |

**Règle d'or** : avant toute fix manuelle, **lookup ce MD**. Si un fichier origine couvre le domaine, l'extraire en JSON puis driver le runtime depuis cette donnée. Plus jamais de hardcode TS.
