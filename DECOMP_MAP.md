# Carte du décomp pokeemeraude

**But de ce fichier** : avant de porter du code, on sait exactement OÙ est
chaque chose dans le décomp. Chaque session de port commence par retrouver
la source C + les assets correspondants ici.

**Racine du décomp** : `D:\Projet 1\decomps\pokeemeraude\`

---

## Layout racine

```
src/                — sources C (21 Mo, ~700 fichiers .c)
src/data/           — tables data en .h (incluses via #include, pas compilées)
include/            — headers (.h) 239 fichiers
data/               — assets structurés (maps/layouts/tilesets/scripts/text)
graphics/           — PNGs (12 Mo) et .pal
sound/              — MIDI + voicegroups + samples (9.2 Mo)
asm/                — asm GBA bas-niveau (on l'ignore)
constants/          — .inc (constantes asm, on lit `constants/` via include)
```

## 1. Séquence de boot (ce que l'utilisateur veut porter)

**Ordre chronologique au démarrage du jeu** :

| Étape | C source | Graphiques | Notes |
|---|---|---|---|
| Intro anim Rayquaza | `src/intro.c` + `src/intro_credits_graphics.c` | `graphics/intro/` | Cinématique démarrage, skippable |
| Title screen | `src/title_screen.c` | `graphics/title_screen/` | Logo Emerald + "PRESS START" |
| Main menu (CONTINUER / NOUVELLE / OPTIONS) | `src/main_menu.c` | `graphics/interface/main_menu_*` | Après PRESS START |
| Birch speech / new game intro | `src/birch_speech.c`? (check) | `graphics/birch_speech/` | "Bienvenue dans le monde des Pokémon" |
| Choix du sexe | Inclus dans birch speech | `graphics/birch_speech/` | BRENDAN vs MAY |
| Choix du nom | `src/naming_screen.c` | `graphics/naming_screen/` | Clavier virtuel |
| Nouvelle partie init | `src/new_game.c` | — | Set flags + vars initiaux, save |
| Intro camion | Script map + event | `data/maps/InsideOfTruck/` | Map spéciale, chargement scripts |
| Spawn Bourg-en-Vol | `data/maps/LittlerootTown/scripts.inc` | — | Script `OnTransition` + `OnFrame` |

### Fichiers critiques identifiés

- `src/title_screen.c` — logique titre
- `src/main_menu.c` — menu principal
- `src/naming_screen.c` — saisie nom
- `src/new_game.c` — init save state
- `src/save.c` + `src/load_save.c` + `src/reload_save.c` — sauvegarde
- `src/intro.c` + `src/intro_credits_graphics.c` — cinématique
- `src/option_menu.c` — menu options (vitesse texte, etc.)
- `src/trainer_card.c` — carte dresseur (option menu Start "UNDI")
- `graphics/intro/` — assets cinématique Rayquaza
- `graphics/title_screen/` — logo + press start
- `graphics/birch_speech/` — sprites Pr. Seko + Brendan/May
- `graphics/naming_screen/` — clavier virtuel
- `data/maps/InsideOfTruck/` — carte intérieur camion (intro)

## 2. Map scripting (comprendre Littleroot)

- `data/maps/LittlerootTown/map.json` — events (NPCs, warps, signs)
- `data/maps/LittlerootTown/scripts.inc` — scripts poryscript
- `src/field_message_box.c` — affichage dialogues en map
- `src/event_scripts.s` — commandes scripting globales (GLOSSAIRE des opcodes)
- `src/scripting_*.c` — implémentation des commandes de script

### Opcodes de scripts (à implémenter pour runtime)

Voir `src/event_scripts.s` pour la liste complète. Les plus courants :
`lock`, `release`, `faceplayer`, `msgbox`, `applymovement`, `waitmovement`,
`setflag`, `clearflag`, `setvar`, `goto`, `goto_if_*`, `call`, `call_if_*`,
`playse`, `playbgm`, `fadedefaultbgm`, `special`, `specialvar`,
`trainerbattle`, `checkplayergender`, `giveitem`, `givepokemon`,
`checkitem`, `countpokemon`, `warp`, `warpspin`, `warpwalk`, `setweather`.

## 3. Data Pokémon / moves / items (BONS pour direct consumption)

**Déjà couvert par `@pkmn/dex` côté JS**, mais disponible côté décomp aussi :

- `src/data/pokemon/base_stats.h` — stats de base
- `src/data/pokemon/evolution.h` — évolutions
- `src/data/pokemon/level_up_learnsets.h` — apprentissage par niveau
- `src/data/pokemon/tmhm_learnsets.h` — CT/CS
- `src/data/pokemon/tutor_learnsets.h` — maîtres capacités
- `src/data/pokemon/pokedex_entries.h` — descriptions Pokédex
- `src/data/pokemon/cry_ids.h` — mapping cri → sample
- `src/data/battle_moves.h` — stats des capacités
- `src/data/items.h` — items (nom, prix, effet)
- `src/data/abilities.h` — talents
- `src/data/trainers.h` + `src/data/trainer_parties.h` — dresseurs du jeu
- `src/data/text/species_names.h` — noms FR des Pokémon
- `src/data/text/abilities.h` — descriptions talents

**Recommandation** : pour les stats/move sets, consommer `@pkmn/dex` (plus
clean en JS, même données). Pour les **dialogues FR spécifiques** (Pokédex,
descriptions), parser les .h du décomp.

## 4. Maps + layouts + tilesets (déjà extrait)

- `data/maps/<Name>/` — 468 maps, chacune contient :
  - `map.json` (events)
  - `scripts.inc` (scripts poryscript)
- `data/layouts/<Name>/` — 441 layouts :
  - `map.bin` (données binaires tiles + collision + elevation)
  - `border.bin` (2×2 bordure)
- `data/tilesets/primary/<name>/` + `data/tilesets/secondary/<name>/` :
  - `tiles.png` + `metatiles.bin` + `metatile_attributes.bin` + `palettes/`
  - `anim/` (fleur, eau, cascade — à brancher)
- `data/layouts/layouts.json` — index des layouts

**État actuel** : toutes les maps extraites + atlas rendus. OK.

## 5. NPC / object events (graphics_id → sprite)

- `src/data/object_events/object_event_graphics_info_pointers.h` — [gfxId] → InfoStruct
- `src/data/object_events/object_event_graphics_info.h` — struct par NPC
- `src/data/object_events/object_event_pic_tables.h` — frames
- `src/data/object_events/object_event_graphics.h` — PNG paths (incbin)
- `graphics/object_events/pics/` — sprites eux-mêmes
- `graphics/object_events/palettes/` — palettes NPC (npc_1..npc_4 + reflections)

**État** : résolution gfxId → PNG OK dans `object-event-graphics.json`.

## 6. Sound

- `sound/songs/midi/*.mid` — 530 MIDI (copies)
- `sound/songs/midi.cfg` — mapping song → voicegroup
- `sound/voicegroups/*.inc` — définitions par song (square, directsound, noise, keysplit)
- `sound/voicegroups/drumsets/*.inc` — drumsets
- `sound/voicegroups/keysplits/*.inc` — keysplits (piano, strings, etc.)
- `sound/keysplit_tables.inc` — tables note → slot
- `sound/direct_sound_data.inc` — symbol → sample wav path
- `sound/direct_sound_samples/*.wav` — 105 samples
- `sound/programmable_wave_samples/*.bin` — ondes custom GBA
- `sound/song_table.inc` — mapping song → MIDI player type

**État** : voicegroups parsés + playback avec Samplers OK.

## 7. Font / UI

- `graphics/fonts/latin_normal.png` + autres variantes
- `charmap.txt` — mapping char → byte
- `graphics/text_window/1.png..20.png` + `message_box.png` + `text_pal1..4.pal` — frames
- `graphics/interface/` — curseurs, std_menu.pal, etc.
- `graphics/field_effects/` — indicateurs, arrow, etc.

## 8. Système flags/vars (saves)

- `include/global.h` — struct SaveBlock1 / SaveBlock2
- `src/data/field_effect_scripts.s` + `constants/flags.h` + `constants/vars.h`
- Variables typiques : `VAR_LITTLEROOT_TOWN_STATE`, `VAR_RESULT`,
  `VAR_LITTLEROOT_INTRO_STATE`, etc.
- Flags : `FLAG_HIDE_LITTLEROOT_TOWN_MOM_OUTSIDE`, `FLAG_ADVENTURE_STARTED`, etc.

**À écrire** : un système de vars/flags en TS avec default values depuis
`include/constants/*.h` parsés.

---

## Plan de port (ordre d'exécution)

### Phase A — extracteurs à écrire

1. **extract-flags-vars** : `include/constants/flags.h` + `vars.h` → JSON de tous les
   flag/var names + valeurs par défaut.
2. **extract-intro-assets** : copier `graphics/intro/`, `graphics/title_screen/`,
   `graphics/birch_speech/`, `graphics/naming_screen/`, `graphics/interface/main_menu_*`.
3. **extract-main-menu-text** : parser `src/data/text/` pour tous les textes
   du main menu / naming / birch speech (FR).
4. **extract-trainer-card** : sprites + data pour carte dresseur.

### Phase B — scènes Phaser à créer (une par étape)

Chaque scène charge UNIQUEMENT des assets décomp (aucun placeholder) :

1. `IntroScene` — rejouer `intro.c` (séquences → tweens Phaser)
2. `TitleScene` — title_screen.c → logo + "PRESS START" clignotant
3. `MainMenuScene` — main_menu.c → CONTINUER / NOUVELLE PARTIE / OPTIONS
4. `BirchSpeechScene` — birch_speech.c → dialogue + choix sexe
5. `NamingScene` — naming_screen.c → clavier virtuel
6. `NewGameInitScene` — new_game.c → init flags/vars/savedata
7. `TruckIntroScene` — map `InsideOfTruck` + script
8. `LittlerootStart` — spawn joueur via script `OnTransition` de LittlerootTown

### Phase C — runtime systèmes

- **Flag/var store** (Zustand ou Map simple)
- **Script runner étendu** (gérer tous les opcodes nécessaires)
- **Save system** (localStorage → sérialise flags/vars/position/party)
- **Transition manager** (fade + load next scene)

---

## Règle absolue (décision utilisateur session 10)

> **AUCUN code "maison" qui duplique ce qui existe dans le décomp.**
> Si une donnée / dialogue / sprite est dans le décomp, on l'utilise. On
> écrit UNIQUEMENT le code de "traduction" (interpréteur de scripts, loader
> d'assets, moteur d'affichage Phaser). Jamais de données en dur dans le TS.

Exception : `@pkmn/sim` pour le combat (moteur Showdown), parce que
réimplémenter le moteur de combat Gen 3 est hors scope.
