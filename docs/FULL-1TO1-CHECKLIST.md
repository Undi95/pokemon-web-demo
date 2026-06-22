# Checklist maître — Réplique 1:1 INTÉGRALE (marathon, Phase 0 cartographie)

> Généré par `scripts/cartograph-1to1.cjs` (vivant, re-run quand on avance). Vue INVERSE : on part de
> la décomp et on demande « où vit ce fichier chez nous + complétude 1:1 ». STRUCTUREL (noms de fn),
> pas comportemental. Voir [FULL-1TO1-REPLICA-PLAN.md](FULL-1TO1-REPLICA-PLAN.md) pour la méthode.

## Résumé exécutif

**Axe A — cœur logique (`src/*.c`)** : 310 fichiers décomp, 422120 lignes C.

| statut | nb fichiers |
|---|---|
| ✅ miroir | 38 |
| 🟡 partiel | 50 |
| 🟠 dispersé | 13 |
| 🟡 amorce | 38 |
| 🔴 manquant | 159 |
| ⚪ vide/data | 12 |

**Complétude pondérée par lignes de C** (effort réel) :
- **STRICT** (fn présente dans NOTRE fichier homonyme propre) : **~27 %** ← la vraie jauge miroir.
- LARGE (fn implémentée n'importe où, même dispersée/mal nommée) : ~34 %.
- L'écart STRICT↔LARGE = le travail de **consolidation** (logique présente mais pas encore dans le bon fichier 1:1).

**Autres axes** :
- Axe B — `include` (.h types/constantes) : 100/329 avec un miroir homonyme chez nous (229 manquants).
- Axe C — `data/` : maps 988 · scripts 57 · layouts 884 fichiers (couverture détaillée à part).
- Axe D — `graphics/` : 3850 png (5748 fichiers) côté décomp · 4392 png sous `public/decomp/` chez nous (structures différentes → proxy, pas une couverture 1:1) → **import systématique en masse (Phase 2)**.
- Axe E — `sound/` : 1303 fichiers décomp → **moteur m4a maison (harness, hors 1:1)**.

## Axe A par catégorie (priorisation marathon)

| catégorie | fichiers | ✅ | 🟡/🟠 | 🔴 | lignes C |
|---|---|---|---|---|---|
| Overworld/Field | 84 | 10 | 29 | 44 | 117446 |
| Combat | 75 | 16 | 34 | 24 | 147341 |
| Pokémon/Party | 32 | 0 | 3 | 29 | 61271 |
| UI/Menu/Gfx | 34 | 6 | 13 | 11 | 36036 |
| Item/Bag | 10 | 1 | 6 | 3 | 8806 |
| Save/RTC | 17 | 1 | 5 | 10 | 5676 |
| Système/GBA | 17 | 3 | 8 | 5 | 8645 |
| Son (harness) | 5 | 0 | 1 | 3 | 3551 |
| Link/IO (N-A) | 29 | 0 | 2 | 25 | 30115 |
| Autre | 7 | 1 | 0 | 5 | 3233 |

## Axe A détail — les 310 `.c` (le backlog)

> complét(fichier) = fn décomp présentes dans NOTRE fichier ciblé / total · complét(partout) = fn
> implémentée n'importe où chez nous / total. Trié par catégorie puis complétude croissante (= à faire en premier en haut).

### Overworld/Field (84)

| .c décomp | lignes | fn | chez nous | compl(fichier) | compl(partout) | statut |
|---|---|---|---|---|---|---|
| `slot_machine.c` | 7956 | 270 | — **manquant** | 0/270 (0%) | 0/270 (0%) | 🔴 manquant |
| `roulette.c` | 4761 | 104 | `engine/m4a/voicegroups-data/roulette.ts` | 0/104 (0%) | 0/104 (0%) | 🔴 manquant |
| `berry_blender.c` | 3923 | 81 | — **manquant** | 0/81 (0%) | 0/81 (0%) | 🔴 manquant |
| `frontier_util.c` | 2639 | 93 | — **manquant** | 0/93 (0%) | 0/93 (0%) | 🔴 manquant |
| `trainer_hill.c` | 1091 | 60 | — **manquant** | 0/60 (0%) | 0/60 (0%) | 🔴 manquant |
| `mirage_tower.c` | 797 | 27 | — **manquant** | 0/27 (0%) | 0/27 (0%) | 🔴 manquant |
| `lilycove_lady.c` | 786 | 72 | — **manquant** | 0/72 (0%) | 0/72 (0%) | 🔴 manquant |
| `faraway_island.c` | 465 | 15 | — **manquant** | 0/15 (0%) | 0/15 (0%) | 🔴 manquant |
| `landmark.c` | 447 | 2 | — **manquant** | 0/2 (0%) | 0/2 (0%) | 🔴 manquant |
| `dewford_trend.c` | 420 | 13 | — **manquant** | 0/13 (0%) | 0/13 (0%) | 🔴 manquant |
| `berry_fix_program.c` | 396 | 6 | — **manquant** | 0/6 (0%) | 0/6 (0%) | 🔴 manquant |
| `rotating_tile_puzzle.c` | 382 | 6 | — **manquant** | 0/6 (0%) | 0/6 (0%) | 🔴 manquant |
| `braille_puzzles.c` | 344 | 18 | — **manquant** | 0/18 (0%) | 0/18 (0%) | 🔴 manquant |
| `walda_phrase.c` | 279 | 14 | — **manquant** | 0/14 (0%) | 0/14 (0%) | 🔴 manquant |
| `safari_zone.c` | 258 | 17 | `engine/m4a/voicegroups-data/safari_zone.ts` | 0/17 (0%) | 0/17 (0%) | 🔴 manquant |
| `berry_powder.c` | 240 | 14 | — **manquant** | 0/14 (0%) | 0/14 (0%) | 🔴 manquant |
| `field_region_map.c` | 216 | 6 | — **manquant** | 0/6 (0%) | 0/6 (0%) | 🔴 manquant |
| `new_game.c` | 216 | 13 | — **manquant** | 0/13 (0%) | 0/13 (0%) | 🔴 manquant |
| `braille.c` | 213 | 3 | — **manquant** | 0/3 (0%) | 0/3 (0%) | 🔴 manquant |
| `event_object_lock.c` | 209 | 14 | — **manquant** | 0/14 (0%) | 0/14 (0%) | 🔴 manquant |
| `fldeff_escalator.c` | 194 | 6 | — **manquant** | 0/6 (0%) | 0/6 (0%) | 🔴 manquant |
| `lottery_corner.c` | 169 | 8 | — **manquant** | 0/8 (0%) | 0/8 (0%) | 🔴 manquant |
| `field_poison.c` | 155 | 7 | — **manquant** | 0/7 (0%) | 0/7 (0%) | 🔴 manquant |
| `gym_leader_rematch.c` | 106 | 3 | — **manquant** | 0/3 (0%) | 0/3 (0%) | 🔴 manquant |
| `birch_pc.c` | 89 | 3 | — **manquant** | 0/3 (0%) | 0/3 (0%) | 🔴 manquant |
| `fldeff_strength.c` | 51 | 4 | — **manquant** | 0/4 (0%) | 0/4 (0%) | 🔴 manquant |
| `berry_fix_graphics.c` | 50 | 1 | — **manquant** | 0/1 (0%) | 0/1 (0%) | 🔴 manquant |
| `trade.c` | 5101 | 134 | `game/battle_main.ts` _(nom≠)_ | 2/134 (1%) | 2/134 (1%) | 🔴 manquant |
| `decoration.c` | 2749 | 135 | — **manquant** | 0/135 (0%) | 1/135 (1%) | 🔴 manquant |
| `field_specials.c` | 4281 | 191 | `game/field_specials.ts` | 0/191 (0%) | 4/191 (2%) | 🔴 manquant |
| `scrcmd.c` | 2308 | 231 | `game/battle_setup.ts` _(nom≠)_ | 4/231 (2%) | 5/231 (2%) | 🔴 manquant |
| `mauville_old_man.c` | 1483 | 59 | — **manquant** | 0/59 (0%) | 1/59 (2%) | 🔴 manquant |
| `apprentice.c` | 1312 | 53 | — **manquant** | 0/53 (0%) | 1/53 (2%) | 🔴 manquant |
| `tv.c` | 6829 | 207 | `engine/ui/tv-screen.ts` _(nom≠)_ | 5/207 (2%) | 7/207 (3%) | 🔴 manquant |
| `dodrio_berry_picking.c` | 5225 | 159 | `engine/battle/battle-link-end.ts` _(nom≠)_ | 2/159 (1%) | 4/159 (3%) | 🔴 manquant |
| `berry_crush.c` | 3508 | 74 | `engine/decomp-data/src/intro-callbacks-auto.ts` _(nom≠)_ | 2/74 (3%) | 2/74 (3%) | 🔴 manquant |
| `secret_base.c` | 2076 | 99 | `game/secret_base.ts` | 1/99 (1%) | 3/99 (3%) | 🔴 manquant |
| `match_call.c` | 2113 | 56 | `engine/system/decomp-bridge.ts` _(nom≠)_ | 2/56 (4%) | 2/56 (4%) | 🔴 manquant |
| `berry_tag_screen.c` | 692 | 27 | — **manquant** | 0/27 (0%) | 1/27 (4%) | 🔴 manquant |
| `field_screen_effect.c` | 1267 | 77 | `engine/system/decomp-globals.ts` _(nom≠)_ | 2/77 (3%) | 5/77 (6%) | 🔴 manquant |
| `trainer_pokemon_sprites.c` | 396 | 23 | `engine/ui/main-menu-impl.ts` _(nom≠)_ | 2/23 (9%) | 2/23 (9%) | 🔴 manquant |
| `fldeff_misc.c` | 1327 | 62 | `game/fldeff_misc.ts` | 5/62 (8%) | 6/62 (10%) | 🔴 manquant |
| `region_map.c` | 2028 | 60 | `engine/field/region-map-data.ts` _(nom≠)_ | 5/60 (8%) | 8/60 (13%) | 🔴 manquant |
| `trainer_see.c` | 815 | 39 | `game/trainer_see.ts` | 5/39 (13%) | 5/39 (13%) | 🔴 manquant |
| `fldeff_flash.c` | 369 | 20 | `game/fldeff_flash.ts` | 2/20 (10%) | 3/20 (15%) | 🟡 amorce |
| `roamer.c` | 247 | 13 | `game/battle_main.ts` _(nom≠)_ | 2/13 (15%) | 2/13 (15%) | 🟡 amorce |
| `script_pokemon_util.c` | 229 | 13 | — **manquant** | 0/13 (0%) | 2/13 (15%) | 🟡 amorce |
| `overworld.c` | 3227 | 227 | `game/overworld.ts` | 14/227 (6%) | 57/227 (25%) | 🟡 amorce |
| `event_object_movement.c` | 8984 | 733 | `game/event_object_movement.ts` | 180/733 (25%) | 199/733 (27%) | 🟡 amorce |
| `fldeff_cut.c` | 648 | 17 | `game/fldeff_cut.ts` | 2/17 (12%) | 5/17 (29%) | 🟡 amorce |
| `heal_location.c` | 38 | 3 | `game/heal_location.ts` | 0/3 (0%) | 1/3 (33%) | 🟡 amorce |
| `field_effect.c` | 3919 | 247 | `game/field_effect.ts` | 4/247 (2%) | 83/247 (34%) | 🟡 amorce |
| `field_weather_effect.c` | 2637 | 106 | `game/field_weather_effect.ts` | 43/106 (41%) | 43/106 (41%) | 🟡 partiel |
| `player_pc.c` | 1511 | 85 | `engine/ui/bedroom-pc.ts` _(nom≠)_ | 39/85 (46%) | 40/85 (47%) | 🟡 amorce |
| `field_message_box.c` | 162 | 17 | `game/field_message_box.ts` | 7/17 (41%) | 8/17 (47%) | 🟡 partiel |
| `wild_encounter.c` | 968 | 34 | `game/wild_encounter.ts` | 17/34 (50%) | 17/34 (50%) | 🟡 partiel |
| `easy_chat.c` | 5876 | 248 | `game/easy_chat.ts` | 4/248 (2%) | 132/248 (53%) | 🟡 amorce |
| `script_movement.c` | 232 | 19 | `game/script_movement.ts` | 11/19 (58%) | 11/19 (58%) | 🟡 partiel |
| `tileset_anims.c` | 1189 | 84 | `game/tileset_anims.ts` | 50/84 (60%) | 50/84 (60%) | 🟡 partiel |
| `field_door.c` | 573 | 23 | `game/field_door.ts` | 13/23 (57%) | 14/23 (61%) | 🟡 partiel |
| `field_special_scene.c` | 386 | 13 | `game/field_special_scene.ts` | 8/13 (62%) | 8/13 (62%) | 🟡 partiel |
| `berry.c` | 1348 | 36 | `game/berry.ts` | 23/36 (64%) | 23/36 (64%) | 🟡 partiel |
| `rotating_gate.c` | 1033 | 22 | `game/rotating_gate.ts` | 15/22 (68%) | 15/22 (68%) | 🟡 partiel |
| `fldeff_rocksmash.c` | 167 | 10 | `game/fldeff_rocksmash.ts` | 2/10 (20%) | 7/10 (70%) | 🟠 dispersé |
| `script.c` | 471 | 39 | `engine/script/script-runtime.ts` _(nom≠)_ | 26/39 (67%) | 28/39 (72%) | 🟠 dispersé |
| `field_control_avatar.c` | 1005 | 41 | `game/field_control_avatar.ts` | 25/41 (61%) | 30/41 (73%) | 🟡 partiel |
| `fldeff_dig.c` | 64 | 4 | `game/fldeff_dig.ts` | 2/4 (50%) | 3/4 (75%) | 🟡 partiel |
| `fldeff_teleport.c` | 45 | 4 | `game/fldeff_teleport.ts` | 2/4 (50%) | 3/4 (75%) | 🟡 partiel |
| `fieldmap.c` | 942 | 55 | `game/fieldmap.ts` | 43/55 (78%) | 45/55 (82%) | 🟡 partiel |
| `field_player_avatar.c` | 2227 | 177 | `game/field_player_avatar.ts` | 148/177 (84%) | 151/177 (85%) | 🟡 partiel |
| `map_name_popup.c` | 427 | 7 | `game/map_name_popup.ts` | 6/7 (86%) | 6/7 (86%) | ✅ miroir |
| `fldeff_softboiled.c` | 112 | 8 | `engine/ui/party-screen.ts` _(nom≠)_ | 7/8 (88%) | 7/8 (88%) | 🟠 dispersé |
| `event_data.c` | 234 | 25 | `game/event_data.ts` | 21/25 (84%) | 23/25 (92%) | 🟡 partiel |
| `field_effect_helpers.c` | 1718 | 81 | `game/field_effect_helpers.ts` | 76/81 (94%) | 76/81 (94%) | ✅ miroir |
| `starter_choose.c` | 670 | 18 | `game/starter_choose.ts` | 17/18 (94%) | 17/18 (94%) | ✅ miroir |
| `field_weather.c` | 1106 | 49 | `game/field_weather.ts` | 48/49 (98%) | 48/49 (98%) | ✅ miroir |
| `metatile_behavior.c` | 1403 | 144 | `game/metatile_behavior.ts` | 144/144 (100%) | 144/144 (100%) | ✅ miroir |
| `bike.c` | 1063 | 56 | `game/bike.ts` | 56/56 (100%) | 56/56 (100%) | ✅ miroir |
| `field_tasks.c` | 958 | 28 | `game/field_tasks.ts` | 28/28 (100%) | 28/28 (100%) | ✅ miroir |
| `field_camera.c` | 508 | 28 | `game/field_camera.ts` | 28/28 (100%) | 28/28 (100%) | ✅ miroir |
| `decoration_inventory.c` | 160 | 11 | `game/decoration_inventory.ts` | 11/11 (100%) | 11/11 (100%) | ✅ miroir |
| `coord_event_weather.c` | 120 | 14 | `game/coord_event_weather.ts` | 14/14 (100%) | 14/14 (100%) | ✅ miroir |
| `fldeff_sweetscent.c` | 100 | 6 | `game/fldeff_sweetscent.ts` | 4/6 (67%) | 6/6 (100%) | 🟡 partiel |
| `tilesets.c` | 8 | 0 | — **manquant** | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |

### Combat (75)

| .c décomp | lignes | fn | chez nous | compl(fichier) | compl(partout) | statut |
|---|---|---|---|---|---|---|
| `battle_dome.c` | 6182 | 72 | — **manquant** | 0/72 (0%) | 0/72 (0%) | 🔴 manquant |
| `contest.c` | 6126 | 205 | `engine/m4a/voicegroups-data/contest.ts` | 0/205 (0%) | 1/205 (0%) | 🔴 manquant |
| `battle_tower.c` | 3598 | 84 | — **manquant** | 0/84 (0%) | 0/84 (0%) | 🔴 manquant |
| `rayquaza_scene.c` | 3191 | 72 | — **manquant** | 0/72 (0%) | 0/72 (0%) | 🔴 manquant |
| `contest_util.c` | 2782 | 111 | — **manquant** | 0/111 (0%) | 0/111 (0%) | 🔴 manquant |
| `battle_pike.c` | 1657 | 56 | — **manquant** | 0/56 (0%) | 0/56 (0%) | 🔴 manquant |
| `contest_effect.c` | 1094 | 51 | — **manquant** | 0/51 (0%) | 0/51 (0%) | 🔴 manquant |
| `battle_factory.c` | 920 | 27 | — **manquant** | 0/27 (0%) | 0/27 (0%) | 🔴 manquant |
| `battle_transition_frontier.c` | 675 | 34 | — **manquant** | 0/34 (0%) | 0/34 (0%) | 🔴 manquant |
| `contest_painting.c` | 601 | 20 | — **manquant** | 0/20 (0%) | 0/20 (0%) | 🔴 manquant |
| `contest_link.c` | 564 | 17 | — **manquant** | 0/17 (0%) | 0/17 (0%) | 🔴 manquant |
| `battle_records.c` | 525 | 31 | — **manquant** | 0/31 (0%) | 0/31 (0%) | 🔴 manquant |
| `battle_tent.c` | 429 | 32 | — **manquant** | 0/32 (0%) | 0/32 (0%) | 🔴 manquant |
| `contest_link_util.c` | 345 | 12 | — **manquant** | 0/12 (0%) | 0/12 (0%) | 🔴 manquant |
| `battle_palace.c` | 213 | 12 | — **manquant** | 0/12 (0%) | 0/12 (0%) | 🔴 manquant |
| `post_battle_event_funcs.c` | 93 | 2 | — **manquant** | 0/2 (0%) | 0/2 (0%) | 🔴 manquant |
| `battle_transition.c` | 4777 | 210 | `game/battle_transition.ts` | 3/210 (1%) | 3/210 (1%) | 🔴 manquant |
| `battle_factory_screen.c` | 4316 | 119 | — **manquant** | 0/119 (0%) | 1/119 (1%) | 🔴 manquant |
| `contest_ai.c` | 1786 | 142 | `game/battle_ai_script_commands.ts` _(nom≠)_ | 2/142 (1%) | 2/142 (1%) | 🔴 manquant |
| `battle_pyramid.c` | 1985 | 52 | `game/battle_util.ts` _(nom≠)_ | 2/52 (4%) | 2/52 (4%) | 🔴 manquant |
| `battle_pyramid_bag.c` | 1609 | 81 | `engine/bag/bag-menu.ts` _(nom≠)_ | 2/81 (2%) | 3/81 (4%) | 🔴 manquant |
| `battle_controller_safari.c` | 692 | 73 | `game/battle_controller_player.ts` _(nom≠)_ | 5/73 (7%) | 5/73 (7%) | 🔴 manquant |
| `battle_controller_wally.c` | 1571 | 82 | `game/battle_controller_player.ts` _(nom≠)_ | 8/82 (10%) | 8/82 (10%) | 🔴 manquant |
| `battle_arena.c` | 821 | 19 | — **manquant** | 0/19 (0%) | 2/19 (11%) | 🔴 manquant |
| `battle_controller_player_partner.c` | 1936 | 93 | `game/battle_controller_player.ts` _(nom≠)_ | 11/93 (12%) | 14/93 (15%) | 🟡 amorce |
| `battle_controller_recorded_player.c` | 1813 | 87 | `game/battle_controller_player.ts` _(nom≠)_ | 10/87 (11%) | 13/87 (15%) | 🟡 amorce |
| `battle_controller_link_partner.c` | 1698 | 86 | `game/battle_controller_player.ts` _(nom≠)_ | 10/86 (12%) | 13/86 (15%) | 🟡 amorce |
| `battle_controller_link_opponent.c` | 1856 | 88 | `game/battle_controller_player.ts` _(nom≠)_ | 10/88 (11%) | 15/88 (17%) | 🟡 amorce |
| `battle_controller_recorded_opponent.c` | 1789 | 88 | `game/battle_controller_player.ts` _(nom≠)_ | 10/88 (11%) | 15/88 (17%) | 🟡 amorce |
| `battle_tv.c` | 1605 | 12 | `game/battle_controller_player.ts` _(nom≠)_ | 2/12 (17%) | 2/12 (17%) | 🟡 amorce |
| `recorded_battle.c` | 867 | 42 | `game/battle_main.ts` _(nom≠)_ | 10/42 (24%) | 13/42 (31%) | 🟡 amorce |
| `battle_anim_smokescreen.c` | 232 | 3 | `game/battle_anim_smokescreen.ts` | 1/3 (33%) | 1/3 (33%) | 🟡 amorce |
| `pokeball.c` | 1345 | 37 | `game/pokeball.ts` | 14/37 (38%) | 18/37 (49%) | 🟡 amorce |
| `battle_bg.c` | 1418 | 12 | `engine/battle/battle-link-end.ts` _(nom≠)_ | 5/12 (42%) | 7/12 (58%) | 🟡 amorce |
| `battle_util2.c` | 216 | 5 | `game/battle_main.ts` _(nom≠)_ | 3/5 (60%) | 3/5 (60%) | 🟠 dispersé |
| `battle_interface.c` | 2605 | 53 | `game/battle_interface.ts` | 30/53 (57%) | 33/53 (62%) | 🟡 partiel |
| `battle_anim_normal.c` | 1116 | 36 | `game/battle_anim_normal.ts` | 21/36 (58%) | 24/36 (67%) | 🟡 partiel |
| `battle_anim_status_effects.c` | 563 | 12 | `game/battle_anim_status_effects.ts` | 8/12 (67%) | 8/12 (67%) | 🟡 partiel |
| `battle_setup.c` | 1890 | 102 | `game/battle_setup.ts` | 59/102 (58%) | 69/102 (68%) | 🟡 partiel |
| `battle_controllers.c` | 1585 | 68 | `engine/battle/battle-controllers.ts` _(nom≠)_ | 33/68 (49%) | 48/68 (71%) | 🟠 dispersé |
| `battle_anim_dark.c` | 1002 | 25 | `game/battle_anim_dark.ts` | 17/25 (68%) | 19/25 (76%) | 🟡 partiel |
| `battle_gfx_sfx_util.c` | 1349 | 53 | `game/battle_gfx_sfx_util.ts` | 35/53 (66%) | 42/53 (79%) | 🟡 partiel |
| `battle_message.c` | 3156 | 10 | `game/battle_message.ts` | 3/10 (30%) | 8/10 (80%) | 🟠 dispersé |
| `battle_anim_mons.c` | 2555 | 128 | `game/battle_anim_mons.ts` | 70/128 (55%) | 102/128 (80%) | 🟡 partiel |
| `battle_anim_fire.c` | 1377 | 35 | `game/battle_anim_fire.ts` | 28/35 (80%) | 28/35 (80%) | 🟡 partiel |
| `battle_util.c` | 4016 | 52 | `game/battle_util.ts` | 36/52 (69%) | 42/52 (81%) | 🟡 partiel |
| `battle_anim_water.c` | 1600 | 48 | `game/battle_anim_water.ts` | 40/48 (83%) | 40/48 (83%) | 🟡 partiel |
| `battle_anim_flying.c` | 1237 | 31 | `game/battle_anim_flying.ts` | 20/31 (65%) | 26/31 (84%) | 🟡 partiel |
| `battle_controller_player.c` | 3148 | 124 | `game/battle_controller_player.ts` | 103/124 (83%) | 105/124 (85%) | 🟡 partiel |
| `battle_anim_throw.c` | 2508 | 78 | `game/battle_anim_throw.ts` | 66/78 (85%) | 67/78 (86%) | ✅ miroir |
| `battle_anim_rock.c` | 888 | 22 | `game/battle_anim_rock.ts` | 17/22 (77%) | 19/22 (86%) | 🟡 partiel |
| `battle_anim_psychic.c` | 1167 | 27 | `game/battle_anim_psychic.ts` | 22/27 (81%) | 24/27 (89%) | 🟡 partiel |
| `battle_controller_opponent.c` | 2028 | 88 | `game/battle_controller_opponent.ts` | 72/88 (82%) | 79/88 (90%) | 🟡 partiel |
| `battle_intro.c` | 620 | 11 | `game/battle_intro.ts` | 10/11 (91%) | 10/11 (91%) | ✅ miroir |
| `battle_anim_dragon.c` | 452 | 11 | `game/battle_anim_dragon.ts` | 8/11 (73%) | 10/11 (91%) | 🟡 partiel |
| `battle_anim_ghost.c` | 1341 | 37 | `game/battle_anim_ghost.ts` | 34/37 (92%) | 34/37 (92%) | ✅ miroir |
| `battle_anim_electric.c` | 1337 | 37 | `game/battle_anim_electric.ts` | 34/37 (92%) | 34/37 (92%) | ✅ miroir |
| `battle_anim_effects_1.c` | 5647 | 154 | `game/battle_anim_effects_1.ts` | 112/154 (73%) | 143/154 (93%) | 🟡 partiel |
| `battle_anim_utility_funcs.c` | 1102 | 42 | `game/battle_anim_utility_funcs.ts` | 39/42 (93%) | 39/42 (93%) | ✅ miroir |
| `battle_script_commands.c` | 10332 | 287 | `game/battle_script_commands.ts` | 257/287 (90%) | 270/287 (94%) | ✅ miroir |
| `battle_main.c` | 5271 | 108 | `game/battle_main.ts` | 95/108 (88%) | 101/108 (94%) | ✅ miroir |
| `battle_anim_ice.c` | 1616 | 32 | `game/battle_anim_ice.ts` | 28/32 (88%) | 30/32 (94%) | ✅ miroir |
| `battle_anim_fight.c` | 1036 | 31 | `game/battle_anim_fight.ts` | 29/31 (94%) | 29/31 (94%) | ✅ miroir |
| `battle_anim_effects_3.c` | 5548 | 140 | `game/battle_anim_effects_3.ts` | 131/140 (94%) | 133/140 (95%) | ✅ miroir |
| `battle_anim.c` | 1842 | 79 | `engine/battle/battle-anim-interpreter.ts` _(nom≠)_ | 75/79 (95%) | 75/79 (95%) | 🟠 dispersé |
| `battle_anim_effects_2.c` | 3832 | 121 | `game/battle_anim_effects_2.ts` | 101/121 (83%) | 116/121 (96%) | 🟡 partiel |
| `pokemon_animation.c` | 5545 | 241 | `game/pokemon_animation.ts` | 104/241 (43%) | 237/241 (98%) | 🟡 partiel |
| `battle_ai_script_commands.c` | 2297 | 115 | `game/battle_ai_script_commands.ts` | 115/115 (100%) | 115/115 (100%) | ✅ miroir |
| `battle_anim_mon_movement.c` | 1053 | 34 | `game/battle_anim_mon_movement.ts` | 34/34 (100%) | 34/34 (100%) | ✅ miroir |
| `battle_ai_switch_items.c` | 945 | 13 | `game/battle_ai_switch_items.ts` | 13/13 (100%) | 13/13 (100%) | ✅ miroir |
| `battle_anim_ground.c` | 775 | 25 | `game/battle_anim_ground.ts` | 25/25 (100%) | 25/25 (100%) | ✅ miroir |
| `battle_anim_bug.c` | 488 | 13 | `game/battle_anim_bug.ts` | 13/13 (100%) | 13/13 (100%) | ✅ miroir |
| `anim_mon_front_pics.c` | 425 | 0 | — **manquant** | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |
| `battle_anim_sound_tasks.c` | 408 | 15 | `game/battle_anim_sound_tasks.ts` | 15/15 (100%) | 15/15 (100%) | ✅ miroir |
| `battle_anim_poison.c` | 312 | 9 | `game/battle_anim_poison.ts` | 7/9 (78%) | 9/9 (100%) | 🟡 partiel |

### Pokémon/Party (32)

| .c décomp | lignes | fn | chez nous | compl(fichier) | compl(partout) | statut |
|---|---|---|---|---|---|---|
| `pokeblock.c` | 1457 | 58 | — **manquant** | 0/58 (0%) | 0/58 (0%) | 🔴 manquant |
| `pokenav_match_call_gfx.c` | 1301 | 65 | — **manquant** | 0/65 (0%) | 0/65 (0%) | 🔴 manquant |
| `pokenav_ribbons_summary.c` | 1272 | 55 | — **manquant** | 0/55 (0%) | 0/55 (0%) | 🔴 manquant |
| `pokeblock_feed.c` | 1194 | 28 | — **manquant** | 0/28 (0%) | 0/28 (0%) | 🔴 manquant |
| `pokenav_match_call_data.c` | 1166 | 59 | — **manquant** | 0/59 (0%) | 0/59 (0%) | 🔴 manquant |
| `move_relearner.c` | 960 | 19 | — **manquant** | 0/19 (0%) | 0/19 (0%) | 🔴 manquant |
| `egg_hatch.c` | 947 | 25 | — **manquant** | 0/25 (0%) | 0/25 (0%) | 🔴 manquant |
| `pokenav_conditions_gfx.c` | 895 | 28 | — **manquant** | 0/28 (0%) | 0/28 (0%) | 🔴 manquant |
| `pokenav_main_menu.c` | 850 | 45 | — **manquant** | 0/45 (0%) | 0/45 (0%) | 🔴 manquant |
| `pokenav_conditions_search_results.c` | 745 | 36 | — **manquant** | 0/36 (0%) | 0/36 (0%) | 🔴 manquant |
| `pokenav_ribbons_list.c` | 745 | 37 | — **manquant** | 0/37 (0%) | 0/37 (0%) | 🔴 manquant |
| `evolution_graphics.c` | 694 | 37 | — **manquant** | 0/37 (0%) | 0/37 (0%) | 🔴 manquant |
| `pokedex_area_region_map.c` | 70 | 4 | — **manquant** | 0/4 (0%) | 0/4 (0%) | 🔴 manquant |
| `pokemon_jump.c` | 4241 | 178 | — **manquant** | 0/178 (0%) | 1/178 (1%) | 🔴 manquant |
| `pokemon_storage_system.c` | 10060 | 380 | `engine/system/decomp-bridge.ts` _(nom≠)_ | 6/380 (2%) | 8/380 (2%) | 🔴 manquant |
| `pokenav_menu_handler_gfx.c` | 1381 | 56 | — **manquant** | 0/56 (0%) | 1/56 (2%) | 🔴 manquant |
| `pokenav_list.c` | 1018 | 47 | — **manquant** | 0/47 (0%) | 1/47 (2%) | 🔴 manquant |
| `daycare.c` | 1299 | 67 | `engine/system/decomp-bridge.ts` _(nom≠)_ | 2/67 (3%) | 2/67 (3%) | 🔴 manquant |
| `pokenav_region_map.c` | 743 | 37 | — **manquant** | 0/37 (0%) | 1/37 (3%) | 🔴 manquant |
| `pokenav_conditions.c` | 631 | 32 | — **manquant** | 0/32 (0%) | 1/32 (3%) | 🔴 manquant |
| `pokedex.c` | 5606 | 140 | `engine/ui/pokedex-flags.ts` _(nom≠)_ | 5/140 (4%) | 5/140 (4%) | 🔴 manquant |
| `evolution_scene.c` | 1686 | 25 | — **manquant** | 0/25 (0%) | 1/25 (4%) | 🔴 manquant |
| `pokenav_menu_handler.c` | 514 | 27 | — **manquant** | 0/27 (0%) | 1/27 (4%) | 🔴 manquant |
| `pokedex_area_screen.c` | 798 | 19 | — **manquant** | 0/19 (0%) | 1/19 (5%) | 🔴 manquant |
| `pokenav_match_call_list.c` | 521 | 29 | `engine/system/decomp-bridge.ts` _(nom≠)_ | 2/29 (7%) | 2/29 (7%) | 🔴 manquant |
| `pokemon_summary_screen.c` | 4184 | 140 | `engine/ui/summary-screen.ts` _(nom≠)_ | 9/140 (6%) | 12/140 (9%) | 🔴 manquant |
| `party_menu.c` | 6431 | 354 | `engine/ui/party-screen.ts` _(nom≠)_ | 17/354 (5%) | 40/354 (11%) | 🔴 manquant |
| `mon_markings.c` | 617 | 15 | — **manquant** | 0/15 (0%) | 2/15 (13%) | 🔴 manquant |
| `pokenav.c` | 591 | 28 | `engine/system/decomp-bridge.ts` _(nom≠)_ | 3/28 (11%) | 4/28 (14%) | 🔴 manquant |
| `pokemon.c` | 7157 | 160 | `game/pokemon.ts` | 6/160 (4%) | 49/160 (31%) | 🟡 amorce |
| `pokemon_icon.c` | 1308 | 23 | `game/pokemon_icon.ts` | 7/23 (30%) | 11/23 (48%) | 🟡 amorce |
| `pokemon_size_record.c` | 189 | 12 | `game/pokemon_size_record.ts` | 6/12 (50%) | 6/12 (50%) | 🟡 partiel |

### UI/Menu/Gfx (34)

| .c décomp | lignes | fn | chez nous | compl(fichier) | compl(partout) | statut |
|---|---|---|---|---|---|---|
| `frontier_pass.c` | 1777 | 37 | — **manquant** | 0/37 (0%) | 0/37 (0%) | 🔴 manquant |
| `hall_of_fame.c` | 1535 | 45 | `engine/m4a/voicegroups-data/hall_of_fame.ts` | 0/45 (0%) | 0/45 (0%) | 🔴 manquant |
| `image_processing_effects.c` | 1229 | 38 | — **manquant** | 0/38 (0%) | 0/38 (0%) | 🔴 manquant |
| `script_menu.c` | 766 | 31 | — **manquant** | 0/31 (0%) | 0/31 (0%) | 🔴 manquant |
| `palette_util.c` | 504 | 19 | — **manquant** | 0/19 (0%) | 0/19 (0%) | 🔴 manquant |
| `blit.c` | 210 | 5 | — **manquant** | 0/5 (0%) | 0/5 (0%) | 🔴 manquant |
| `hof_pc.c` | 41 | 4 | — **manquant** | 0/4 (0%) | 0/4 (0%) | 🔴 manquant |
| `trainer_card.c` | 1870 | 79 | — **manquant** | 0/79 (0%) | 1/79 (1%) | 🔴 manquant |
| `credits.c` | 1588 | 38 | `engine/m4a/voicegroups-data/credits.ts` | 0/38 (0%) | 1/38 (3%) | 🔴 manquant |
| `start_menu.c` | 1440 | 80 | — **manquant** | 0/80 (0%) | 2/80 (3%) | 🔴 manquant |
| `menu_specialized.c` | 1637 | 57 | `game/menu_specialized.ts` | 3/57 (5%) | 3/57 (5%) | 🔴 manquant |
| `diploma.c` | 210 | 10 | `engine/decomp-data/src/option_menu-callbacks-auto.ts` _(nom≠)_ | 2/10 (20%) | 2/10 (20%) | 🟡 amorce |
| `bg.c` | 1248 | 52 | `engine/ui/gba-window-system.ts` _(nom≠)_ | 13/52 (25%) | 21/52 (40%) | 🟡 amorce |
| `window.c` | 715 | 30 | `engine/ui/gba-window-system.ts` _(nom≠)_ | 15/30 (50%) | 15/30 (50%) | 🟡 amorce |
| `gpu_regs.c` | 196 | 12 | `engine/system/decomp-helpers.ts` _(nom≠)_ | 5/12 (42%) | 6/12 (50%) | 🟡 amorce |
| `text.c` | 1905 | 53 | `game/text.ts` | 26/53 (49%) | 27/53 (51%) | 🟡 partiel |
| `menu_helpers.c` | 454 | 25 | `game/menu_helpers.ts` | 10/25 (40%) | 15/25 (60%) | 🟡 partiel |
| `sprite.c` | 1760 | 102 | `game/sprite.ts` | 47/102 (46%) | 62/102 (61%) | 🟡 partiel |
| `palette.c` | 1043 | 40 | `engine/system/palette.ts` | 17/40 (43%) | 25/40 (63%) | 🟡 partiel |
| `menu.c` | 2148 | 123 | `game/menu.ts` | 72/123 (59%) | 82/123 (67%) | 🟡 partiel |
| `naming_screen.c` | 2595 | 117 | `game/naming_screen.ts` | 85/117 (73%) | 85/117 (73%) | 🟡 partiel |
| `main_menu.c` | 2308 | 82 | `engine/decomp-data/src/main_menu-callbacks-auto.ts` _(nom≠)_ | 53/82 (65%) | 77/82 (94%) | 🟠 dispersé |
| `list_menu.c` | 1448 | 48 | `game/list_menu.ts` | 45/48 (94%) | 45/48 (94%) | ✅ miroir |
| `strings.c` | 1830 | 0 | `game/include/strings.ts` | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |
| `graphics.c` | 1639 | 0 | — **manquant** | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |
| `title_screen.c` | 872 | 20 | `engine/decomp-data/src/title_screen-callbacks-auto.ts` _(nom≠)_ | 18/20 (90%) | 20/20 (100%) | 🟠 dispersé |
| `string_util.c` | 782 | 44 | `game/string_util.ts` | 44/44 (100%) | 44/44 (100%) | ✅ miroir |
| `mail.c` | 754 | 10 | `engine/ui/mail.ts` | 10/10 (100%) | 10/10 (100%) | ✅ miroir |
| `option_menu.c` | 672 | 24 | `engine/ui/option-menu-impl.ts` _(nom≠)_ | 17/24 (71%) | 24/24 (100%) | 🟠 dispersé |
| `fonts.c` | 293 | 0 | — **manquant** | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |
| `scanline_effect.c` | 255 | 9 | `game/scanline_effect.ts` | 9/9 (100%) | 9/9 (100%) | ✅ miroir |
| `text_window.c` | 198 | 11 | `game/text_window.ts` | 11/11 (100%) | 11/11 (100%) | ✅ miroir |
| `text_input_strings.c` | 65 | 0 | — **manquant** | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |
| `dynamic_placeholder_text_util.c` | 49 | 4 | `game/dynamic_placeholder_text_util.ts` | 4/4 (100%) | 4/4 (100%) | ✅ miroir |

### Item/Bag (10)

| .c décomp | lignes | fn | chez nous | compl(fichier) | compl(partout) | statut |
|---|---|---|---|---|---|---|
| `use_pokeblock.c` | 1678 | 51 | — **manquant** | 0/51 (0%) | 0/51 (0%) | 🔴 manquant |
| `shop.c` | 1270 | 57 | — **manquant** | 0/57 (0%) | 0/57 (0%) | 🔴 manquant |
| `item_use.c` | 1140 | 74 | `engine/ui/item-use-callbacks.ts` _(nom≠)_ | 4/74 (5%) | 5/74 (7%) | 🔴 manquant |
| `item_icon.c` | 169 | 6 | `engine/ui/item-icon.ts` _(nom≠)_ | 2/6 (33%) | 3/6 (50%) | 🟡 amorce |
| `item.c` | 950 | 52 | `engine/bag/bag.ts` _(nom≠)_ | 7/52 (13%) | 27/52 (52%) | 🟡 amorce |
| `money.c` | 198 | 15 | `game/money.ts` | 5/15 (33%) | 8/15 (53%) | 🟡 amorce |
| `item_menu.c` | 2610 | 122 | `engine/bag/bag-menu.ts` _(nom≠)_ | 51/122 (42%) | 68/122 (56%) | 🟡 amorce |
| `item_menu_icons.c` | 663 | 21 | `game/item_menu_icons.ts` | 12/21 (57%) | 15/21 (71%) | 🟡 partiel |
| `coins.c` | 89 | 7 | `game/coins.ts` | 4/7 (57%) | 7/7 (100%) | 🟡 partiel |
| `give_gift_ribbon_to_party.c` | 39 | 1 | `game/give_gift_ribbon_to_party.ts` | 1/1 (100%) | 1/1 (100%) | ✅ miroir |

### Save/RTC (17)

| .c décomp | lignes | fn | chez nous | compl(fichier) | compl(partout) | statut |
|---|---|---|---|---|---|---|
| `siirtc.c` | 464 | 16 | — **manquant** | 0/16 (0%) | 0/16 (0%) | 🔴 manquant |
| `agb_flash.c` | 297 | 15 | — **manquant** | 0/15 (0%) | 0/15 (0%) | 🔴 manquant |
| `agb_flash_mx.c` | 194 | 5 | — **manquant** | 0/5 (0%) | 0/5 (0%) | 🔴 manquant |
| `save_location.c` | 140 | 10 | — **manquant** | 0/10 (0%) | 0/10 (0%) | 🔴 manquant |
| `time_events.c` | 119 | 10 | — **manquant** | 0/10 (0%) | 0/10 (0%) | 🔴 manquant |
| `agb_flash_1m.c` | 87 | 2 | — **manquant** | 0/2 (0%) | 0/2 (0%) | 🔴 manquant |
| `reload_save.c` | 31 | 1 | — **manquant** | 0/1 (0%) | 0/1 (0%) | 🔴 manquant |
| `reset_rtc_screen.c` | 741 | 19 | — **manquant** | 0/19 (0%) | 1/19 (5%) | 🔴 manquant |
| `save_failed_screen.c` | 404 | 12 | — **manquant** | 0/12 (0%) | 1/12 (8%) | 🔴 manquant |
| `clear_save_data_screen.c` | 210 | 9 | — **manquant** | 0/9 (0%) | 1/9 (11%) | 🔴 manquant |
| `clock.c` | 87 | 6 | — **manquant** | 0/6 (0%) | 1/6 (17%) | 🟡 amorce |
| `save.c` | 1053 | 35 | `engine/save/save-sectors.ts` _(nom≠)_ | 5/35 (14%) | 7/35 (20%) | 🟡 amorce |
| `load_save.c` | 294 | 21 | `engine/save/load_save.ts` | 9/21 (43%) | 10/21 (48%) | 🟡 partiel |
| `rtc.c` | 347 | 26 | `engine/system/rtc.ts` | 14/26 (54%) | 15/26 (58%) | 🟡 partiel |
| `wallclock.c` | 1102 | 25 | `engine/ui/wallclock.ts` | 16/25 (64%) | 16/25 (64%) | 🟡 partiel |
| `play_time.c` | 74 | 5 | `game/play_time.ts` | 5/5 (100%) | 5/5 (100%) | ✅ miroir |
| `agb_flash_le.c` | 32 | 0 | — **manquant** | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |

### Système/GBA (17)

| .c décomp | lignes | fn | chez nous | compl(fichier) | compl(partout) | statut |
|---|---|---|---|---|---|---|
| `digit_obj_util.c` | 451 | 14 | — **manquant** | 0/14 (0%) | 0/14 (0%) | 🔴 manquant |
| `mini_printf.c` | 420 | 9 | — **manquant** | 0/9 (0%) | 0/9 (0%) | 🔴 manquant |
| `libisagbprn.c` | 258 | 16 | — **manquant** | 0/16 (0%) | 0/16 (0%) | 🔴 manquant |
| `confetti_util.c` | 182 | 8 | — **manquant** | 0/8 (0%) | 0/8 (0%) | 🔴 manquant |
| `rom_header_gf.c` | 176 | 1 | — **manquant** | 0/1 (0%) | 0/1 (0%) | 🔴 manquant |
| `decompress.c` | 412 | 21 | `engine/system/decomp-globals.ts` _(nom≠)_ | 4/21 (19%) | 4/21 (19%) | 🟡 amorce |
| `main.c` | 437 | 29 | `main.ts` | 0/29 (0%) | 6/29 (21%) | 🟡 amorce |
| `malloc.c` | 225 | 12 | `engine/system/decomp-bridge.ts` _(nom≠)_ | 3/12 (25%) | 3/12 (25%) | 🟡 amorce |
| `international_string_util.c` | 288 | 18 | `engine/system/decomp-bridge.ts` _(nom≠)_ | 3/18 (17%) | 7/18 (39%) | 🟡 amorce |
| `task.c` | 205 | 14 | `engine/system/decomp-bridge.ts` _(nom≠)_ | 4/14 (29%) | 9/14 (64%) | 🟠 dispersé |
| `util.c` | 280 | 11 | `game/util.ts` | 6/11 (55%) | 8/11 (73%) | 🟡 partiel |
| `intro_credits_graphics.c` | 1173 | 20 | `engine/decomp-data/src/intro_credits_graphics-callbacks-auto.ts` _(nom≠)_ | 14/20 (70%) | 17/20 (85%) | 🟠 dispersé |
| `intro.c` | 3436 | 69 | `engine/m4a/voicegroups-data/intro.ts` | 0/69 (0%) | 66/69 (96%) | 🟠 dispersé |
| `trig.c` | 544 | 4 | `game/trig.ts` | 4/4 (100%) | 4/4 (100%) | ✅ miroir |
| `math_util.c` | 87 | 9 | `game/math_util.ts` | 9/9 (100%) | 9/9 (100%) | ✅ miroir |
| `io_reg.c` | 37 | 0 | — **manquant** | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |
| `random.c` | 34 | 4 | `game/random.ts` | 4/4 (100%) | 4/4 (100%) | ✅ miroir |

### Son (harness) (5)

| .c décomp | lignes | fn | chez nous | compl(fichier) | compl(partout) | statut |
|---|---|---|---|---|---|---|
| `pokedex_cry_screen.c` | 581 | 14 | — **manquant** | 0/14 (0%) | 0/14 (0%) | 🔴 manquant |
| `bard_music.c` | 248 | 5 | — **manquant** | 0/5 (0%) | 0/5 (0%) | 🔴 manquant |
| `m4a.c` | 1782 | 72 | `engine/system/decomp-globals.ts` _(nom≠)_ | 2/72 (3%) | 5/72 (7%) | 🔴 manquant |
| `sound.c` | 632 | 47 | `engine/system/decomp-globals.ts` _(nom≠)_ | 12/47 (26%) | 16/47 (34%) | 🟡 amorce |
| `m4a_tables.c` | 308 | 0 | — **manquant** | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |

### Link/IO (N-A) (29)

| .c décomp | lignes | fn | chez nous | compl(fichier) | compl(partout) | statut |
|---|---|---|---|---|---|---|
| `union_room.c` | 4512 | 111 | — **manquant** | 0/111 (0%) | 0/111 (0%) | 🔴 manquant |
| `librfu_rfu.c` | 2324 | 86 | — **manquant** | 0/86 (0%) | 0/86 (0%) | 🔴 manquant |
| `mystery_gift_menu.c` | 1627 | 35 | — **manquant** | 0/35 (0%) | 0/35 (0%) | 🔴 manquant |
| `AgbRfu_LinkManager.c` | 1401 | 34 | — **manquant** | 0/34 (0%) | 0/34 (0%) | 🔴 manquant |
| `mystery_gift_view.c` | 936 | 18 | — **manquant** | 0/18 (0%) | 0/18 (0%) | 🔴 manquant |
| `ereader_helpers.c` | 876 | 26 | — **manquant** | 0/26 (0%) | 0/26 (0%) | 🔴 manquant |
| `librfu_stwi.c` | 651 | 48 | — **manquant** | 0/48 (0%) | 0/48 (0%) | 🔴 manquant |
| `union_room_player_avatar.c` | 609 | 38 | — **manquant** | 0/38 (0%) | 0/38 (0%) | 🔴 manquant |
| `ereader_screen.c` | 537 | 11 | — **manquant** | 0/11 (0%) | 0/11 (0%) | 🔴 manquant |
| `multiboot.c` | 472 | 9 | — **manquant** | 0/9 (0%) | 0/9 (0%) | 🔴 manquant |
| `librfu_intr.c` | 419 | 10 | — **manquant** | 0/10 (0%) | 0/10 (0%) | 🔴 manquant |
| `mystery_event_script.c` | 401 | 30 | — **manquant** | 0/30 (0%) | 0/30 (0%) | 🔴 manquant |
| `mystery_gift_client.c` | 303 | 18 | — **manquant** | 0/18 (0%) | 0/18 (0%) | 🔴 manquant |
| `mystery_gift_server.c` | 291 | 15 | — **manquant** | 0/15 (0%) | 0/15 (0%) | 🔴 manquant |
| `union_room_battle.c` | 234 | 5 | — **manquant** | 0/5 (0%) | 0/5 (0%) | 🔴 manquant |
| `mystery_gift_link.c` | 223 | 10 | — **manquant** | 0/10 (0%) | 0/10 (0%) | 🔴 manquant |
| `librfu_sio32id.c` | 172 | 4 | — **manquant** | 0/4 (0%) | 0/4 (0%) | 🔴 manquant |
| `wonder_news.c` | 157 | 9 | — **manquant** | 0/9 (0%) | 0/9 (0%) | 🔴 manquant |
| `link_rfu_2.c` | 3013 | 150 | `engine/system/decomp-bridge.ts` _(nom≠)_ | 2/150 (1%) | 2/150 (1%) | 🔴 manquant |
| `cable_club.c` | 1331 | 62 | — **manquant** | 0/62 (0%) | 1/62 (2%) | 🔴 manquant |
| `union_room_chat.c` | 3322 | 123 | `engine/system/decomp-bridge.ts` _(nom≠)_ | 3/123 (2%) | 4/123 (3%) | 🔴 manquant |
| `record_mixing.c` | 1409 | 43 | — **manquant** | 0/43 (0%) | 2/43 (5%) | 🔴 manquant |
| `link.c` | 2370 | 125 | `game/battle_main.ts` _(nom≠)_ | 6/125 (5%) | 9/125 (7%) | 🔴 manquant |
| `link_rfu_3.c` | 986 | 30 | `game/battle_main.ts` _(nom≠)_ | 2/30 (7%) | 2/30 (7%) | 🔴 manquant |
| `mystery_gift.c` | 667 | 45 | `engine/system/decomp-bridge.ts` _(nom≠)_ | 5/45 (11%) | 5/45 (11%) | 🔴 manquant |
| `mystery_event_menu.c` | 322 | 6 | — **manquant** | 0/6 (0%) | 1/6 (17%) | 🟡 amorce |
| `reshow_battle_screen.c` | 317 | 7 | `game/reshow_battle_screen.ts` | 5/7 (71%) | 5/7 (71%) | 🟡 partiel |
| `mystery_gift_scripts.c` | 218 | 0 | — **manquant** | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |
| `mystery_event_msg.c` | 15 | 0 | — **manquant** | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |

### Autre (7)

| .c décomp | lignes | fn | chez nous | compl(fichier) | compl(partout) | statut |
|---|---|---|---|---|---|---|
| `minigame_countdown.c` | 760 | 20 | — **manquant** | 0/20 (0%) | 0/20 (0%) | 🔴 manquant |
| `wireless_communication_status_screen.c` | 472 | 12 | — **manquant** | 0/12 (0%) | 0/12 (0%) | 🔴 manquant |
| `trader.c` | 216 | 13 | — **manquant** | 0/13 (0%) | 0/13 (0%) | 🔴 manquant |
| `dma3_manager.c` | 184 | 5 | — **manquant** | 0/5 (0%) | 0/5 (0%) | 🔴 manquant |
| `cable_car.c` | 1066 | 22 | `engine/m4a/voicegroups-data/cable_car.ts` | 0/22 (0%) | 1/22 (5%) | 🔴 manquant |
| `data.c` | 329 | 0 | — **manquant** | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |
| `mail_data.c` | 206 | 12 | `game/mail_data.ts` | 12/12 (100%) | 12/12 (100%) | ✅ miroir |

