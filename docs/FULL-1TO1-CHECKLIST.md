# Checklist maître — Réplique 1:1 INTÉGRALE (marathon, Phase 0 cartographie)

> Généré par `scripts/cartograph-1to1.cjs` (vivant, re-run quand on avance). Vue INVERSE : on part de
> la décomp et on demande « où vit ce fichier chez nous + complétude 1:1 ». STRUCTUREL (noms de fn),
> pas comportemental. Voir [FULL-1TO1-REPLICA-PLAN.md](FULL-1TO1-REPLICA-PLAN.md) pour la méthode.

> ⚠️ **BYTE-VM (flagship `Byte-VM`, voir [BYTE-VM-PLAN.md](BYTE-VM-PLAN.md)) — FAIT : byte-VM = SEUL moteur.**
> Le moteur de script est une VM bytecode 1:1 STRICT, désormais AUX NOMS 1:1 (swap mirror fait) :
> `script.c` → **`src/script.ts`** (vraie VM : ScriptReadByte/Halfword/Word + gScriptCmdTable + ScriptContext_* +
> loader image + data-loader/triggers map-script) ; `scrcmd.c` → **`src/scrcmd.ts`** (227 handlers `ScrCmd_*`,
> **100 % de l'usage opcode overworld** + gSpecials/waitstate) + voie A partagée (`scrcmd_object/door/fieldeffect/
> flash/trainer`, `script_menu/shop/decoration/heal_location/special_flows`). Fichiers `*_bytevm.ts` fusionnés/supprimés.

## Résumé exécutif

**Axe A — cœur logique (`src/*.c`)** : 310 fichiers décomp, 422120 lignes C.

| statut | nb fichiers |
|---|---|
| ✅ miroir | 101 |
| 🟡 partiel | 51 |
| 🟠 dispersé | 5 |
| 🟡 amorce | 40 |
| 🔴 manquant | 101 |
| ⚪ vide/data | 12 |

**Complétude pondérée par lignes de C** (effort réel) :
- **STRICT** (fn présente dans NOTRE fichier homonyme propre) : **~45 %** ← la vraie jauge miroir.
- LARGE (fn implémentée n'importe où, même dispersée/mal nommée) : ~49 %.
- L'écart STRICT↔LARGE = le travail de **consolidation** (logique présente mais pas encore dans le bon fichier 1:1).

**Autres axes** :
- Axe B — `include` (.h types/constantes) : 1/329 avec un miroir homonyme chez nous (328 manquants).
- Axe C — `data/` : maps 988 · scripts 57 · layouts 884 fichiers (couverture détaillée à part).
- Axe D — `graphics/` : 3850 png (5748 fichiers) côté décomp · 4392 png sous `public/decomp/` chez nous (structures différentes → proxy, pas une couverture 1:1) → **import systématique en masse (Phase 2)**.
- Axe E — `sound/` : 1303 fichiers décomp → **moteur m4a maison (harness, hors 1:1)**.

## Axe A par catégorie (priorisation marathon)

| catégorie | fichiers | ✅ | 🟡/🟠 | 🔴 | lignes C |
|---|---|---|---|---|---|
| Overworld/Field | 84 | 31 | 31 | 21 | 117446 |
| Combat | 75 | 22 | 29 | 23 | 147341 |
| Pokémon/Party | 32 | 21 | 6 | 5 | 61271 |
| UI/Menu/Gfx | 34 | 11 | 12 | 7 | 36036 |
| Item/Bag | 10 | 3 | 5 | 2 | 8806 |
| Save/RTC | 17 | 5 | 3 | 8 | 5676 |
| Système/GBA | 17 | 6 | 5 | 5 | 8645 |
| Son (harness) | 5 | 1 | 1 | 2 | 3551 |
| Link/IO (N-A) | 29 | 0 | 2 | 25 | 30115 |
| Autre | 7 | 1 | 2 | 3 | 3233 |

## Axe A détail — les 310 `.c` (le backlog)

> complét(fichier) = fn décomp présentes dans NOTRE fichier ciblé / total · complét(partout) = fn
> implémentée n'importe où chez nous / total. Trié par catégorie puis complétude croissante (= à faire en premier en haut).

### Overworld/Field (84)

| .c décomp | lignes | fn | chez nous | compl(fichier) | compl(partout) | statut |
|---|---|---|---|---|---|---|
| `slot_machine.c` | 7956 | 270 | — **manquant** | 0/270 (0%) | 0/270 (0%) | 🔴 manquant |
| `mirage_tower.c` | 797 | 27 | — **manquant** | 0/27 (0%) | 0/27 (0%) | 🔴 manquant |
| `berry_fix_program.c` | 396 | 6 | — **manquant** | 0/6 (0%) | 0/6 (0%) | 🔴 manquant |
| `walda_phrase.c` | 279 | 14 | — **manquant** | 0/14 (0%) | 0/14 (0%) | 🔴 manquant |
| `field_region_map.c` | 216 | 6 | — **manquant** | 0/6 (0%) | 0/6 (0%) | 🔴 manquant |
| `braille.c` | 213 | 3 | — **manquant** | 0/3 (0%) | 0/3 (0%) | 🔴 manquant |
| `berry_fix_graphics.c` | 50 | 1 | — **manquant** | 0/1 (0%) | 0/1 (0%) | 🔴 manquant |
| `roulette.c` | 4761 | 104 | — **manquant** | 0/104 (0%) | 1/104 (1%) | 🔴 manquant |
| `berry_blender.c` | 3923 | 81 | — **manquant** | 0/81 (0%) | 1/81 (1%) | 🔴 manquant |
| `decoration.c` | 2749 | 135 | `decoration.ts` | 0/135 (0%) | 1/135 (1%) | 🔴 manquant |
| `frontier_util.c` | 2639 | 93 | `frontier_util.ts` | 1/93 (1%) | 1/93 (1%) | 🔴 manquant |
| `dodrio_berry_picking.c` | 5225 | 159 | `battle_main.ts` _(nom≠)_ | 2/159 (1%) | 4/159 (3%) | 🔴 manquant |
| `berry_crush.c` | 3508 | 74 | `intro.ts` _(nom≠)_ | 2/74 (3%) | 2/74 (3%) | 🔴 manquant |
| `trade.c` | 5101 | 134 | `evolution_scene.ts` _(nom≠)_ | 4/134 (3%) | 6/134 (4%) | 🔴 manquant |
| `berry_tag_screen.c` | 692 | 27 | — **manquant** | 0/27 (0%) | 1/27 (4%) | 🔴 manquant |
| `secret_base.c` | 2076 | 99 | `secret_base.ts` | 3/99 (3%) | 5/99 (5%) | 🔴 manquant |
| `apprentice.c` | 1312 | 53 | `apprentice.ts` | 3/53 (6%) | 3/53 (6%) | 🔴 manquant |
| `field_screen_effect.c` | 1267 | 77 | `field_screen_effect.ts` | 4/77 (5%) | 7/77 (9%) | 🔴 manquant |
| `match_call.c` | 2113 | 56 | `match_call.ts` | 2/56 (4%) | 6/56 (11%) | 🔴 manquant |
| `trainer_hill.c` | 1091 | 60 | `trainer_hill.ts` | 8/60 (13%) | 8/60 (13%) | 🔴 manquant |
| `berry_powder.c` | 240 | 14 | `berry_powder.ts` | 2/14 (14%) | 2/14 (14%) | 🔴 manquant |
| `mauville_old_man.c` | 1483 | 59 | `mauville_old_man.ts` | 9/59 (15%) | 9/59 (15%) | 🟡 amorce |
| `fldeff_flash.c` | 369 | 20 | `fldeff_flash.ts` | 2/20 (10%) | 3/20 (15%) | 🟡 amorce |
| `fldeff_misc.c` | 1327 | 62 | `fldeff_misc.ts` | 12/62 (19%) | 13/62 (21%) | 🟡 amorce |
| `event_object_movement.c` | 8984 | 733 | `event_object_movement.ts` | 192/733 (26%) | 207/733 (28%) | 🟡 amorce |
| `overworld.c` | 3227 | 227 | `overworld.ts` | 40/227 (18%) | 64/227 (28%) | 🟡 amorce |
| `fldeff_cut.c` | 648 | 17 | `fldeff_cut.ts` | 2/17 (12%) | 5/17 (29%) | 🟡 amorce |
| `trainer_pokemon_sprites.c` | 396 | 23 | `trainer_pokemon_sprites.ts` | 5/23 (22%) | 7/23 (30%) | 🟡 amorce |
| `roamer.c` | 247 | 13 | `roamer.ts` | 2/13 (15%) | 4/13 (31%) | 🟡 amorce |
| `heal_location.c` | 38 | 3 | `heal_location.ts` | 1/3 (33%) | 1/3 (33%) | 🟡 amorce |
| `field_specials.c` | 4281 | 191 | `field_specials.ts` | 61/191 (32%) | 64/191 (34%) | 🟡 amorce |
| `region_map.c` | 2028 | 60 | `region_map.ts` | 3/60 (5%) | 22/60 (37%) | 🟡 amorce |
| `field_weather_effect.c` | 2637 | 106 | `field_weather_effect.ts` | 43/106 (41%) | 43/106 (41%) | 🟡 partiel |
| `field_message_box.c` | 162 | 17 | `field_message_box.ts` | 7/17 (41%) | 7/17 (41%) | 🟡 partiel |
| `script_pokemon_util.c` | 229 | 13 | `script_pokemon_util.ts` | 5/13 (38%) | 6/13 (46%) | 🟡 amorce |
| `field_effect.c` | 3919 | 247 | `field_effect.ts` | 4/247 (2%) | 117/247 (47%) | 🟡 amorce |
| `player_pc.c` | 1511 | 85 | `player_pc.ts` | 39/85 (46%) | 40/85 (47%) | 🟡 partiel |
| `field_door.c` | 573 | 23 | `field_door.ts` | 13/23 (57%) | 13/23 (57%) | 🟡 partiel |
| `script_movement.c` | 232 | 19 | `script_movement.ts` | 11/19 (58%) | 11/19 (58%) | 🟡 partiel |
| `tileset_anims.c` | 1189 | 84 | `tileset_anims.ts` | 50/84 (60%) | 50/84 (60%) | 🟡 partiel |
| `field_special_scene.c` | 386 | 13 | `field_special_scene.ts` | 8/13 (62%) | 8/13 (62%) | 🟡 partiel |
| `berry.c` | 1348 | 36 | `berry.ts` | 23/36 (64%) | 23/36 (64%) | 🟡 partiel |
| `rotating_gate.c` | 1033 | 22 | `rotating_gate.ts` | 15/22 (68%) | 15/22 (68%) | 🟡 partiel |
| `field_control_avatar.c` | 1005 | 41 | `field_control_avatar.ts` | 26/41 (63%) | 30/41 (73%) | 🟡 partiel |
| `fldeff_dig.c` | 64 | 4 | `fldeff_dig.ts` | 2/4 (50%) | 3/4 (75%) | 🟡 partiel |
| `fldeff_teleport.c` | 45 | 4 | `fldeff_teleport.ts` | 2/4 (50%) | 3/4 (75%) | 🟡 partiel |
| `script.c` | 471 | 39 | `script.ts` | 30/39 (77%) | 30/39 (77%) | 🟡 partiel |
| `fldeff_rocksmash.c` | 167 | 10 | `fldeff_rocksmash.ts` | 3/10 (30%) | 8/10 (80%) | 🟠 dispersé |
| `dewford_trend.c` | 420 | 13 | `dewford_trend.ts` | 11/13 (85%) | 11/13 (85%) | ✅ miroir |
| `field_player_avatar.c` | 2227 | 177 | `field_player_avatar.ts` | 151/177 (85%) | 152/177 (86%) | ✅ miroir |
| `map_name_popup.c` | 427 | 7 | `map_name_popup.ts` | 6/7 (86%) | 6/7 (86%) | ✅ miroir |
| `fldeff_softboiled.c` | 112 | 8 | `party_menu.ts` _(nom≠)_ | 7/8 (88%) | 7/8 (88%) | 🟠 dispersé |
| `easy_chat.c` | 5876 | 248 | `easy_chat.ts` | 222/248 (90%) | 222/248 (90%) | ✅ miroir |
| `event_object_lock.c` | 209 | 14 | `event_object_lock.ts` | 10/14 (71%) | 13/14 (93%) | 🟡 partiel |
| `field_effect_helpers.c` | 1718 | 81 | `field_effect_helpers.ts` | 76/81 (94%) | 76/81 (94%) | ✅ miroir |
| `starter_choose.c` | 670 | 18 | `starter_choose.ts` | 17/18 (94%) | 17/18 (94%) | ✅ miroir |
| `scrcmd.c` | 2308 | 231 | `scrcmd.ts` | 222/231 (96%) | 222/231 (96%) | ✅ miroir |
| `wild_encounter.c` | 968 | 34 | `wild_encounter.ts` | 33/34 (97%) | 33/34 (97%) | ✅ miroir |
| `field_weather.c` | 1106 | 49 | `field_weather.ts` | 48/49 (98%) | 48/49 (98%) | ✅ miroir |
| `tv.c` | 6829 | 207 | `tv.ts` | 207/207 (100%) | 207/207 (100%) | ✅ miroir |
| `metatile_behavior.c` | 1403 | 144 | `metatile_behavior.ts` | 144/144 (100%) | 144/144 (100%) | ✅ miroir |
| `bike.c` | 1063 | 56 | `bike.ts` | 56/56 (100%) | 56/56 (100%) | ✅ miroir |
| `field_tasks.c` | 958 | 28 | `field_tasks.ts` | 28/28 (100%) | 28/28 (100%) | ✅ miroir |
| `fieldmap.c` | 942 | 55 | `fieldmap.ts` | 54/55 (98%) | 55/55 (100%) | ✅ miroir |
| `trainer_see.c` | 815 | 39 | `trainer_see.ts` | 39/39 (100%) | 39/39 (100%) | ✅ miroir |
| `lilycove_lady.c` | 786 | 72 | `lilycove_lady.ts` | 72/72 (100%) | 72/72 (100%) | ✅ miroir |
| `field_camera.c` | 508 | 28 | `field_camera.ts` | 28/28 (100%) | 28/28 (100%) | ✅ miroir |
| `faraway_island.c` | 465 | 15 | `faraway_island.ts` | 15/15 (100%) | 15/15 (100%) | ✅ miroir |
| `landmark.c` | 447 | 2 | `landmark.ts` | 2/2 (100%) | 2/2 (100%) | ✅ miroir |
| `rotating_tile_puzzle.c` | 382 | 6 | `rotating_tile_puzzle.ts` | 6/6 (100%) | 6/6 (100%) | ✅ miroir |
| `braille_puzzles.c` | 344 | 18 | `braille_puzzles.ts` | 18/18 (100%) | 18/18 (100%) | ✅ miroir |
| `safari_zone.c` | 258 | 17 | `safari_zone.ts` | 17/17 (100%) | 17/17 (100%) | ✅ miroir |
| `event_data.c` | 234 | 25 | `event_data.ts` | 25/25 (100%) | 25/25 (100%) | ✅ miroir |
| `new_game.c` | 216 | 13 | `new_game.ts` | 13/13 (100%) | 13/13 (100%) | ✅ miroir |
| `fldeff_escalator.c` | 194 | 6 | `fldeff_escalator.ts` | 6/6 (100%) | 6/6 (100%) | ✅ miroir |
| `lottery_corner.c` | 169 | 8 | `lottery_corner.ts` | 8/8 (100%) | 8/8 (100%) | ✅ miroir |
| `decoration_inventory.c` | 160 | 11 | `decoration_inventory.ts` | 11/11 (100%) | 11/11 (100%) | ✅ miroir |
| `field_poison.c` | 155 | 7 | `field_poison.ts` | 7/7 (100%) | 7/7 (100%) | ✅ miroir |
| `coord_event_weather.c` | 120 | 14 | `coord_event_weather.ts` | 14/14 (100%) | 14/14 (100%) | ✅ miroir |
| `gym_leader_rematch.c` | 106 | 3 | `gym_leader_rematch.ts` | 3/3 (100%) | 3/3 (100%) | ✅ miroir |
| `fldeff_sweetscent.c` | 100 | 6 | `fldeff_sweetscent.ts` | 4/6 (67%) | 6/6 (100%) | 🟡 partiel |
| `birch_pc.c` | 89 | 3 | `birch_pc.ts` | 3/3 (100%) | 3/3 (100%) | ✅ miroir |
| `fldeff_strength.c` | 51 | 4 | `fldeff_strength.ts` | 3/4 (75%) | 4/4 (100%) | 🟡 partiel |
| `tilesets.c` | 8 | 0 | — **manquant** | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |

### Combat (75)

| .c décomp | lignes | fn | chez nous | compl(fichier) | compl(partout) | statut |
|---|---|---|---|---|---|---|
| `battle_dome.c` | 6182 | 72 | — **manquant** | 0/72 (0%) | 0/72 (0%) | 🔴 manquant |
| `rayquaza_scene.c` | 3191 | 72 | — **manquant** | 0/72 (0%) | 0/72 (0%) | 🔴 manquant |
| `contest_util.c` | 2782 | 111 | — **manquant** | 0/111 (0%) | 0/111 (0%) | 🔴 manquant |
| `battle_pike.c` | 1657 | 56 | — **manquant** | 0/56 (0%) | 0/56 (0%) | 🔴 manquant |
| `contest_effect.c` | 1094 | 51 | — **manquant** | 0/51 (0%) | 0/51 (0%) | 🔴 manquant |
| `battle_factory.c` | 920 | 27 | — **manquant** | 0/27 (0%) | 0/27 (0%) | 🔴 manquant |
| `battle_transition_frontier.c` | 675 | 34 | — **manquant** | 0/34 (0%) | 0/34 (0%) | 🔴 manquant |
| `contest_painting.c` | 601 | 20 | — **manquant** | 0/20 (0%) | 0/20 (0%) | 🔴 manquant |
| `contest_link.c` | 564 | 17 | — **manquant** | 0/17 (0%) | 0/17 (0%) | 🔴 manquant |
| `battle_tent.c` | 429 | 32 | — **manquant** | 0/32 (0%) | 0/32 (0%) | 🔴 manquant |
| `contest_link_util.c` | 345 | 12 | — **manquant** | 0/12 (0%) | 0/12 (0%) | 🔴 manquant |
| `battle_palace.c` | 213 | 12 | — **manquant** | 0/12 (0%) | 0/12 (0%) | 🔴 manquant |
| `contest.c` | 6126 | 205 | `contest.ts` | 3/205 (1%) | 3/205 (1%) | 🔴 manquant |
| `battle_transition.c` | 4777 | 210 | `battle_transition.ts` | 3/210 (1%) | 3/210 (1%) | 🔴 manquant |
| `battle_factory_screen.c` | 4316 | 119 | — **manquant** | 0/119 (0%) | 1/119 (1%) | 🔴 manquant |
| `battle_tower.c` | 3598 | 84 | `battle_tower.ts` | 1/84 (1%) | 1/84 (1%) | 🔴 manquant |
| `contest_ai.c` | 1786 | 142 | `battle_ai_script_commands.ts` _(nom≠)_ | 2/142 (1%) | 2/142 (1%) | 🔴 manquant |
| `battle_pyramid_bag.c` | 1609 | 81 | `item_menu.ts` _(nom≠)_ | 4/81 (5%) | 5/81 (6%) | 🔴 manquant |
| `battle_controller_safari.c` | 692 | 73 | `battle_controller_player.ts` _(nom≠)_ | 5/73 (7%) | 5/73 (7%) | 🔴 manquant |
| `battle_controller_wally.c` | 1571 | 82 | `battle_controller_player.ts` _(nom≠)_ | 8/82 (10%) | 8/82 (10%) | 🔴 manquant |
| `battle_records.c` | 525 | 31 | `battle_records.ts` | 3/31 (10%) | 3/31 (10%) | 🔴 manquant |
| `battle_arena.c` | 821 | 19 | — **manquant** | 0/19 (0%) | 2/19 (11%) | 🔴 manquant |
| `battle_pyramid.c` | 1985 | 52 | `battle_pyramid.ts` | 4/52 (8%) | 6/52 (12%) | 🔴 manquant |
| `battle_controller_player_partner.c` | 1936 | 93 | `battle_controller_player.ts` _(nom≠)_ | 11/93 (12%) | 14/93 (15%) | 🟡 amorce |
| `battle_controller_recorded_player.c` | 1813 | 87 | `battle_controller_player.ts` _(nom≠)_ | 10/87 (11%) | 13/87 (15%) | 🟡 amorce |
| `battle_controller_link_partner.c` | 1698 | 86 | `battle_controller_player.ts` _(nom≠)_ | 10/86 (12%) | 13/86 (15%) | 🟡 amorce |
| `battle_controller_link_opponent.c` | 1856 | 88 | `battle_controller_player.ts` _(nom≠)_ | 10/88 (11%) | 16/88 (18%) | 🟡 amorce |
| `battle_controller_recorded_opponent.c` | 1789 | 88 | `battle_controller_player.ts` _(nom≠)_ | 10/88 (11%) | 16/88 (18%) | 🟡 amorce |
| `recorded_battle.c` | 867 | 42 | `battle_main.ts` _(nom≠)_ | 10/42 (24%) | 13/42 (31%) | 🟡 amorce |
| `battle_anim_smokescreen.c` | 232 | 3 | `battle_anim_smokescreen.ts` | 1/3 (33%) | 1/3 (33%) | 🟡 amorce |
| `pokeball.c` | 1345 | 37 | `pokeball.ts` | 15/37 (41%) | 19/37 (51%) | 🟡 partiel |
| `battle_interface.c` | 2605 | 53 | `battle_interface.ts` | 30/53 (57%) | 31/53 (58%) | 🟡 partiel |
| `battle_bg.c` | 1418 | 12 | `battle_bg.ts` | 2/12 (17%) | 7/12 (58%) | 🟡 amorce |
| `battle_util2.c` | 216 | 5 | `battle_main.ts` _(nom≠)_ | 3/5 (60%) | 3/5 (60%) | 🟠 dispersé |
| `battle_anim_normal.c` | 1116 | 36 | `battle_anim_normal.ts` | 21/36 (58%) | 24/36 (67%) | 🟡 partiel |
| `battle_anim_status_effects.c` | 563 | 12 | `battle_anim_status_effects.ts` | 8/12 (67%) | 8/12 (67%) | 🟡 partiel |
| `battle_message.c` | 3156 | 10 | `battle_message.ts` | 3/10 (30%) | 7/10 (70%) | 🟠 dispersé |
| `battle_controllers.c` | 1585 | 68 | `battle_controllers.ts` | 41/68 (60%) | 48/68 (71%) | 🟡 partiel |
| `battle_setup.c` | 1890 | 102 | `battle_setup.ts` | 63/102 (62%) | 73/102 (72%) | 🟡 partiel |
| `battle_anim_dark.c` | 1002 | 25 | `battle_anim_dark.ts` | 17/25 (68%) | 19/25 (76%) | 🟡 partiel |
| `battle_anim_mons.c` | 2555 | 128 | `battle_anim_mons.ts` | 71/128 (55%) | 101/128 (79%) | 🟡 partiel |
| `battle_gfx_sfx_util.c` | 1349 | 53 | `battle_gfx_sfx_util.ts` | 35/53 (66%) | 42/53 (79%) | 🟡 partiel |
| `battle_util.c` | 4016 | 52 | `battle_util.ts` | 36/52 (69%) | 42/52 (81%) | 🟡 partiel |
| `battle_controller_player.c` | 3148 | 124 | `battle_controller_player.ts` | 103/124 (83%) | 105/124 (85%) | 🟡 partiel |
| `battle_anim_throw.c` | 2508 | 78 | `battle_anim_throw.ts` | 67/78 (86%) | 67/78 (86%) | ✅ miroir |
| `battle_anim_fire.c` | 1377 | 35 | `battle_anim_fire.ts` | 30/35 (86%) | 30/35 (86%) | ✅ miroir |
| `battle_anim_rock.c` | 888 | 22 | `battle_anim_rock.ts` | 17/22 (77%) | 19/22 (86%) | 🟡 partiel |
| `battle_anim_flying.c` | 1237 | 31 | `battle_anim_flying.ts` | 21/31 (68%) | 27/31 (87%) | 🟡 partiel |
| `battle_anim_psychic.c` | 1167 | 27 | `battle_anim_psychic.ts` | 22/27 (81%) | 24/27 (89%) | 🟡 partiel |
| `battle_controller_opponent.c` | 2028 | 88 | `battle_controller_opponent.ts` | 73/88 (83%) | 80/88 (91%) | 🟡 partiel |
| `battle_intro.c` | 620 | 11 | `battle_intro.ts` | 10/11 (91%) | 10/11 (91%) | ✅ miroir |
| `battle_anim_dragon.c` | 452 | 11 | `battle_anim_dragon.ts` | 8/11 (73%) | 10/11 (91%) | 🟡 partiel |
| `battle_anim_water.c` | 1600 | 48 | `battle_anim_water.ts` | 44/48 (92%) | 44/48 (92%) | ✅ miroir |
| `battle_anim_ghost.c` | 1341 | 37 | `battle_anim_ghost.ts` | 34/37 (92%) | 34/37 (92%) | ✅ miroir |
| `battle_anim_electric.c` | 1337 | 37 | `battle_anim_electric.ts` | 34/37 (92%) | 34/37 (92%) | ✅ miroir |
| `battle_anim_effects_1.c` | 5647 | 154 | `battle_anim_effects_1.ts` | 112/154 (73%) | 143/154 (93%) | 🟡 partiel |
| `battle_anim_utility_funcs.c` | 1102 | 42 | `battle_anim_utility_funcs.ts` | 39/42 (93%) | 39/42 (93%) | ✅ miroir |
| `battle_script_commands.c` | 10332 | 287 | `battle_script_commands.ts` | 257/287 (90%) | 271/287 (94%) | ✅ miroir |
| `battle_main.c` | 5271 | 108 | `battle_main.ts` | 95/108 (88%) | 101/108 (94%) | ✅ miroir |
| `battle_anim_ice.c` | 1616 | 32 | `battle_anim_ice.ts` | 30/32 (94%) | 30/32 (94%) | ✅ miroir |
| `battle_anim_fight.c` | 1036 | 31 | `battle_anim_fight.ts` | 29/31 (94%) | 29/31 (94%) | ✅ miroir |
| `battle_anim_effects_3.c` | 5548 | 140 | `battle_anim_effects_3.ts` | 131/140 (94%) | 133/140 (95%) | ✅ miroir |
| `battle_anim.c` | 1842 | 79 | `battle_anim.ts` | 75/79 (95%) | 75/79 (95%) | ✅ miroir |
| `battle_anim_effects_2.c` | 3832 | 121 | `battle_anim_effects_2.ts` | 101/121 (83%) | 116/121 (96%) | 🟡 partiel |
| `pokemon_animation.c` | 5545 | 241 | `pokemon_animation.ts` | 237/241 (98%) | 237/241 (98%) | ✅ miroir |
| `battle_ai_script_commands.c` | 2297 | 115 | `battle_ai_script_commands.ts` | 115/115 (100%) | 115/115 (100%) | ✅ miroir |
| `battle_tv.c` | 1605 | 12 | `battle_tv.ts` | 12/12 (100%) | 12/12 (100%) | ✅ miroir |
| `battle_anim_mon_movement.c` | 1053 | 34 | `battle_anim_mon_movement.ts` | 34/34 (100%) | 34/34 (100%) | ✅ miroir |
| `battle_ai_switch_items.c` | 945 | 13 | `battle_ai_switch_items.ts` | 13/13 (100%) | 13/13 (100%) | ✅ miroir |
| `battle_anim_ground.c` | 775 | 25 | `battle_anim_ground.ts` | 25/25 (100%) | 25/25 (100%) | ✅ miroir |
| `battle_anim_bug.c` | 488 | 13 | `battle_anim_bug.ts` | 13/13 (100%) | 13/13 (100%) | ✅ miroir |
| `anim_mon_front_pics.c` | 425 | 0 | — **manquant** | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |
| `battle_anim_sound_tasks.c` | 408 | 15 | `battle_anim_sound_tasks.ts` | 15/15 (100%) | 15/15 (100%) | ✅ miroir |
| `battle_anim_poison.c` | 312 | 9 | `battle_anim_poison.ts` | 7/9 (78%) | 9/9 (100%) | 🟡 partiel |
| `post_battle_event_funcs.c` | 93 | 2 | `post_battle_event_funcs.ts` | 2/2 (100%) | 2/2 (100%) | ✅ miroir |

### Pokémon/Party (32)

| .c décomp | lignes | fn | chez nous | compl(fichier) | compl(partout) | statut |
|---|---|---|---|---|---|---|
| `pokeblock_feed.c` | 1194 | 28 | — **manquant** | 0/28 (0%) | 0/28 (0%) | 🔴 manquant |
| `pokemon_jump.c` | 4241 | 178 | `pokemon_jump.ts` | 5/178 (3%) | 5/178 (3%) | 🔴 manquant |
| `pokeblock.c` | 1457 | 58 | `pokeblock.ts` | 3/58 (5%) | 3/58 (5%) | 🔴 manquant |
| `move_relearner.c` | 960 | 19 | — **manquant** | 0/19 (0%) | 1/19 (5%) | 🔴 manquant |
| `pokemon_summary_screen.c` | 4184 | 140 | `pokemon_summary_screen.ts` | 9/140 (6%) | 13/140 (9%) | 🔴 manquant |
| `party_menu.c` | 6431 | 354 | `party_menu.ts` | 40/354 (11%) | 60/354 (17%) | 🟡 amorce |
| `pokemon.c` | 7157 | 160 | `pokemon.ts` | 58/160 (36%) | 81/160 (51%) | 🟡 amorce |
| `pokenav.c` | 591 | 28 | `pokenav.ts` | 2/28 (7%) | 16/28 (57%) | 🟡 amorce |
| `pokemon_icon.c` | 1308 | 23 | `pokemon_icon.ts` | 14/23 (61%) | 14/23 (61%) | 🟡 partiel |
| `pokemon_size_record.c` | 189 | 12 | `pokemon_size_record.ts` | 8/12 (67%) | 8/12 (67%) | 🟡 partiel |
| `pokedex_area_screen.c` | 798 | 19 | `pokedex_area_screen.ts` | 15/19 (79%) | 15/19 (79%) | 🟡 partiel |
| `pokedex.c` | 5606 | 140 | `pokedex.ts` | 126/140 (90%) | 131/140 (94%) | ✅ miroir |
| `pokenav_menu_handler.c` | 514 | 27 | `pokenav_menu_handler.ts` | 26/27 (96%) | 26/27 (96%) | ✅ miroir |
| `pokemon_storage_system.c` | 10060 | 380 | `pokemon_storage_system.ts` | 378/380 (99%) | 380/380 (100%) | ✅ miroir |
| `evolution_scene.c` | 1686 | 25 | `evolution_scene.ts` | 25/25 (100%) | 25/25 (100%) | ✅ miroir |
| `pokenav_menu_handler_gfx.c` | 1381 | 56 | `pokenav_menu_handler_gfx.ts` | 56/56 (100%) | 56/56 (100%) | ✅ miroir |
| `pokenav_match_call_gfx.c` | 1301 | 65 | `pokenav_match_call_gfx.ts` | 65/65 (100%) | 65/65 (100%) | ✅ miroir |
| `daycare.c` | 1299 | 67 | `daycare.ts` | 67/67 (100%) | 67/67 (100%) | ✅ miroir |
| `pokenav_ribbons_summary.c` | 1272 | 55 | `pokenav_ribbons_summary.ts` | 55/55 (100%) | 55/55 (100%) | ✅ miroir |
| `pokenav_match_call_data.c` | 1166 | 59 | `pokenav_match_call_data.ts` | 59/59 (100%) | 59/59 (100%) | ✅ miroir |
| `pokenav_list.c` | 1018 | 47 | `pokenav_list.ts` | 47/47 (100%) | 47/47 (100%) | ✅ miroir |
| `egg_hatch.c` | 947 | 25 | `egg_hatch.ts` | 25/25 (100%) | 25/25 (100%) | ✅ miroir |
| `pokenav_conditions_gfx.c` | 895 | 28 | `pokenav_conditions_gfx.ts` | 28/28 (100%) | 28/28 (100%) | ✅ miroir |
| `pokenav_main_menu.c` | 850 | 45 | `pokenav_main_menu.ts` | 45/45 (100%) | 45/45 (100%) | ✅ miroir |
| `pokenav_conditions_search_results.c` | 745 | 36 | `pokenav_conditions_search_results.ts` | 36/36 (100%) | 36/36 (100%) | ✅ miroir |
| `pokenav_ribbons_list.c` | 745 | 37 | `pokenav_ribbons_list.ts` | 37/37 (100%) | 37/37 (100%) | ✅ miroir |
| `pokenav_region_map.c` | 743 | 37 | `pokenav_region_map.ts` | 37/37 (100%) | 37/37 (100%) | ✅ miroir |
| `evolution_graphics.c` | 694 | 37 | `evolution_graphics.ts` | 37/37 (100%) | 37/37 (100%) | ✅ miroir |
| `pokenav_conditions.c` | 631 | 32 | `pokenav_conditions.ts` | 32/32 (100%) | 32/32 (100%) | ✅ miroir |
| `mon_markings.c` | 617 | 15 | `mon_markings.ts` | 14/15 (93%) | 15/15 (100%) | ✅ miroir |
| `pokenav_match_call_list.c` | 521 | 29 | `pokenav_match_call_list.ts` | 29/29 (100%) | 29/29 (100%) | ✅ miroir |
| `pokedex_area_region_map.c` | 70 | 4 | `pokedex_area_region_map.ts` | 4/4 (100%) | 4/4 (100%) | ✅ miroir |

### UI/Menu/Gfx (34)

| .c décomp | lignes | fn | chez nous | compl(fichier) | compl(partout) | statut |
|---|---|---|---|---|---|---|
| `frontier_pass.c` | 1777 | 37 | — **manquant** | 0/37 (0%) | 0/37 (0%) | 🔴 manquant |
| `image_processing_effects.c` | 1229 | 38 | — **manquant** | 0/38 (0%) | 0/38 (0%) | 🔴 manquant |
| `blit.c` | 210 | 5 | — **manquant** | 0/5 (0%) | 0/5 (0%) | 🔴 manquant |
| `hof_pc.c` | 41 | 4 | — **manquant** | 0/4 (0%) | 0/4 (0%) | 🔴 manquant |
| `trainer_card.c` | 1870 | 79 | `trainer_card.ts` | 1/79 (1%) | 1/79 (1%) | 🔴 manquant |
| `hall_of_fame.c` | 1535 | 45 | `hall_of_fame.ts` | 1/45 (2%) | 1/45 (2%) | 🔴 manquant |
| `start_menu.c` | 1440 | 80 | `start_menu.ts` | 0/80 (0%) | 2/80 (3%) | 🔴 manquant |
| `gpu_regs.c` | 196 | 12 | `gpu_regs.ts` | 2/12 (17%) | 2/12 (17%) | 🟡 amorce |
| `script_menu.c` | 766 | 31 | `script_menu.ts` | 6/31 (19%) | 6/31 (19%) | 🟡 amorce |
| `diploma.c` | 210 | 10 | `option_menu.ts` _(nom≠)_ | 2/10 (20%) | 2/10 (20%) | 🟡 amorce |
| `menu_specialized.c` | 1637 | 57 | `menu_specialized.ts` | 3/57 (5%) | 22/57 (39%) | 🟡 amorce |
| `bg.c` | 1248 | 52 | `window.ts` _(nom≠)_ | 16/52 (31%) | 25/52 (48%) | 🟡 amorce |
| `text.c` | 1905 | 53 | `text.ts` | 27/53 (51%) | 27/53 (51%) | 🟡 partiel |
| `palette.c` | 1043 | 40 | `palette.ts` | 19/40 (48%) | 22/40 (55%) | 🟡 partiel |
| `sprite.c` | 1760 | 102 | `sprite.ts` | 48/102 (47%) | 59/102 (58%) | 🟡 partiel |
| `menu.c` | 2148 | 123 | `menu.ts` | 73/123 (59%) | 85/123 (69%) | 🟡 partiel |
| `window.c` | 715 | 30 | `window.ts` | 20/30 (67%) | 22/30 (73%) | 🟡 partiel |
| `naming_screen.c` | 2595 | 117 | `naming_screen.ts` | 86/117 (74%) | 86/117 (74%) | 🟡 partiel |
| `title_screen.c` | 872 | 20 | `title_screen.ts` | 18/20 (90%) | 18/20 (90%) | ✅ miroir |
| `menu_helpers.c` | 454 | 25 | `menu_helpers.ts` | 21/25 (84%) | 23/25 (92%) | 🟡 partiel |
| `main_menu.c` | 2308 | 82 | `main_menu.ts` | 77/82 (94%) | 77/82 (94%) | ✅ miroir |
| `list_menu.c` | 1448 | 48 | `list_menu.ts` | 45/48 (94%) | 45/48 (94%) | ✅ miroir |
| `credits.c` | 1588 | 38 | `credits.ts` | 36/38 (95%) | 36/38 (95%) | ✅ miroir |
| `strings.c` | 1830 | 0 | `strings.ts` | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |
| `graphics.c` | 1639 | 0 | — **manquant** | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |
| `string_util.c` | 782 | 44 | `string_util.ts` | 44/44 (100%) | 44/44 (100%) | ✅ miroir |
| `mail.c` | 754 | 10 | `mail.ts` | 10/10 (100%) | 10/10 (100%) | ✅ miroir |
| `option_menu.c` | 672 | 24 | `option_menu.ts` | 24/24 (100%) | 24/24 (100%) | ✅ miroir |
| `palette_util.c` | 504 | 19 | `palette_util.ts` | 19/19 (100%) | 19/19 (100%) | ✅ miroir |
| `fonts.c` | 293 | 0 | — **manquant** | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |
| `scanline_effect.c` | 255 | 9 | `scanline_effect.ts` | 9/9 (100%) | 9/9 (100%) | ✅ miroir |
| `text_window.c` | 198 | 11 | `text_window.ts` | 11/11 (100%) | 11/11 (100%) | ✅ miroir |
| `text_input_strings.c` | 65 | 0 | — **manquant** | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |
| `dynamic_placeholder_text_util.c` | 49 | 4 | `dynamic_placeholder_text_util.ts` | 4/4 (100%) | 4/4 (100%) | ✅ miroir |

### Item/Bag (10)

| .c décomp | lignes | fn | chez nous | compl(fichier) | compl(partout) | statut |
|---|---|---|---|---|---|---|
| `use_pokeblock.c` | 1678 | 51 | — **manquant** | 0/51 (0%) | 0/51 (0%) | 🔴 manquant |
| `shop.c` | 1270 | 57 | `shop.ts` | 7/57 (12%) | 7/57 (12%) | 🔴 manquant |
| `item_use.c` | 1140 | 74 | `item_use.ts` | 4/74 (5%) | 12/74 (16%) | 🟡 amorce |
| `item_icon.c` | 169 | 6 | `item_icon.ts` | 2/6 (33%) | 2/6 (33%) | 🟡 amorce |
| `item.c` | 950 | 52 | `item.ts` | 8/52 (15%) | 29/52 (56%) | 🟡 amorce |
| `item_menu_icons.c` | 663 | 21 | `item_menu_icons.ts` | 12/21 (57%) | 15/21 (71%) | 🟡 partiel |
| `item_menu.c` | 2610 | 122 | `item_menu.ts` | 97/122 (80%) | 97/122 (80%) | 🟡 partiel |
| `money.c` | 198 | 15 | `money.ts` | 13/15 (87%) | 13/15 (87%) | ✅ miroir |
| `coins.c` | 89 | 7 | `coins.ts` | 7/7 (100%) | 7/7 (100%) | ✅ miroir |
| `give_gift_ribbon_to_party.c` | 39 | 1 | `give_gift_ribbon_to_party.ts` | 1/1 (100%) | 1/1 (100%) | ✅ miroir |

### Save/RTC (17)

| .c décomp | lignes | fn | chez nous | compl(fichier) | compl(partout) | statut |
|---|---|---|---|---|---|---|
| `siirtc.c` | 464 | 16 | — **manquant** | 0/16 (0%) | 0/16 (0%) | 🔴 manquant |
| `agb_flash.c` | 297 | 15 | — **manquant** | 0/15 (0%) | 0/15 (0%) | 🔴 manquant |
| `agb_flash_mx.c` | 194 | 5 | — **manquant** | 0/5 (0%) | 0/5 (0%) | 🔴 manquant |
| `agb_flash_1m.c` | 87 | 2 | — **manquant** | 0/2 (0%) | 0/2 (0%) | 🔴 manquant |
| `reload_save.c` | 31 | 1 | — **manquant** | 0/1 (0%) | 0/1 (0%) | 🔴 manquant |
| `reset_rtc_screen.c` | 741 | 19 | — **manquant** | 0/19 (0%) | 1/19 (5%) | 🔴 manquant |
| `save_failed_screen.c` | 404 | 12 | — **manquant** | 0/12 (0%) | 1/12 (8%) | 🔴 manquant |
| `clear_save_data_screen.c` | 210 | 9 | — **manquant** | 0/9 (0%) | 1/9 (11%) | 🔴 manquant |
| `clock.c` | 87 | 6 | `clock.ts` | 1/6 (17%) | 1/6 (17%) | 🟡 amorce |
| `save.c` | 1053 | 35 | `save.ts` | 7/35 (20%) | 8/35 (23%) | 🟡 amorce |
| `load_save.c` | 294 | 21 | `load_save.ts` | 12/21 (57%) | 14/21 (67%) | 🟡 partiel |
| `wallclock.c` | 1102 | 25 | `wallclock.ts` | 25/25 (100%) | 25/25 (100%) | ✅ miroir |
| `rtc.c` | 347 | 26 | `rtc.ts` | 26/26 (100%) | 26/26 (100%) | ✅ miroir |
| `save_location.c` | 140 | 10 | `save_location.ts` | 10/10 (100%) | 10/10 (100%) | ✅ miroir |
| `time_events.c` | 119 | 10 | `time_events.ts` | 10/10 (100%) | 10/10 (100%) | ✅ miroir |
| `play_time.c` | 74 | 5 | `play_time.ts` | 5/5 (100%) | 5/5 (100%) | ✅ miroir |
| `agb_flash_le.c` | 32 | 0 | — **manquant** | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |

### Système/GBA (17)

| .c décomp | lignes | fn | chez nous | compl(fichier) | compl(partout) | statut |
|---|---|---|---|---|---|---|
| `mini_printf.c` | 420 | 9 | — **manquant** | 0/9 (0%) | 0/9 (0%) | 🔴 manquant |
| `libisagbprn.c` | 258 | 16 | — **manquant** | 0/16 (0%) | 0/16 (0%) | 🔴 manquant |
| `confetti_util.c` | 182 | 8 | — **manquant** | 0/8 (0%) | 0/8 (0%) | 🔴 manquant |
| `rom_header_gf.c` | 176 | 1 | — **manquant** | 0/1 (0%) | 0/1 (0%) | 🔴 manquant |
| `decompress.c` | 412 | 21 | — **manquant** | 0/21 (0%) | 2/21 (10%) | 🔴 manquant |
| `main.c` | 437 | 29 | `main.ts` | 4/29 (14%) | 5/29 (17%) | 🟡 amorce |
| `malloc.c` | 225 | 12 | — **manquant** | 0/12 (0%) | 2/12 (17%) | 🟡 amorce |
| `util.c` | 280 | 11 | `util.ts` | 6/11 (55%) | 7/11 (64%) | 🟡 partiel |
| `task.c` | 205 | 14 | `task.ts` | 4/14 (29%) | 10/14 (71%) | 🟠 dispersé |
| `intro_credits_graphics.c` | 1173 | 20 | `intro_credits_graphics.ts` | 14/20 (70%) | 16/20 (80%) | 🟡 partiel |
| `intro.c` | 3436 | 69 | `intro.ts` | 63/69 (91%) | 63/69 (91%) | ✅ miroir |
| `trig.c` | 544 | 4 | `trig.ts` | 4/4 (100%) | 4/4 (100%) | ✅ miroir |
| `digit_obj_util.c` | 451 | 14 | `digit_obj_util.ts` | 14/14 (100%) | 14/14 (100%) | ✅ miroir |
| `international_string_util.c` | 288 | 18 | `international_string_util.ts` | 18/18 (100%) | 18/18 (100%) | ✅ miroir |
| `math_util.c` | 87 | 9 | `math_util.ts` | 9/9 (100%) | 9/9 (100%) | ✅ miroir |
| `io_reg.c` | 37 | 0 | — **manquant** | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |
| `random.c` | 34 | 4 | `random.ts` | 4/4 (100%) | 4/4 (100%) | ✅ miroir |

### Son (harness) (5)

| .c décomp | lignes | fn | chez nous | compl(fichier) | compl(partout) | statut |
|---|---|---|---|---|---|---|
| `bard_music.c` | 248 | 5 | — **manquant** | 0/5 (0%) | 0/5 (0%) | 🔴 manquant |
| `m4a.c` | 1782 | 72 | `battle_main.ts` _(nom≠)_ | 2/72 (3%) | 3/72 (4%) | 🔴 manquant |
| `sound.c` | 632 | 47 | `sound.ts` | 18/47 (38%) | 24/47 (51%) | 🟡 amorce |
| `pokedex_cry_screen.c` | 581 | 14 | `pokedex_cry_screen.ts` | 14/14 (100%) | 14/14 (100%) | ✅ miroir |
| `m4a_tables.c` | 308 | 0 | — **manquant** | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |

### Link/IO (N-A) (29)

| .c décomp | lignes | fn | chez nous | compl(fichier) | compl(partout) | statut |
|---|---|---|---|---|---|---|
| `union_room.c` | 4512 | 111 | — **manquant** | 0/111 (0%) | 0/111 (0%) | 🔴 manquant |
| `link_rfu_2.c` | 3013 | 150 | — **manquant** | 0/150 (0%) | 0/150 (0%) | 🔴 manquant |
| `librfu_rfu.c` | 2324 | 86 | — **manquant** | 0/86 (0%) | 0/86 (0%) | 🔴 manquant |
| `mystery_gift_menu.c` | 1627 | 35 | — **manquant** | 0/35 (0%) | 0/35 (0%) | 🔴 manquant |
| `AgbRfu_LinkManager.c` | 1401 | 34 | — **manquant** | 0/34 (0%) | 0/34 (0%) | 🔴 manquant |
| `mystery_gift_view.c` | 936 | 18 | — **manquant** | 0/18 (0%) | 0/18 (0%) | 🔴 manquant |
| `ereader_helpers.c` | 876 | 26 | — **manquant** | 0/26 (0%) | 0/26 (0%) | 🔴 manquant |
| `librfu_stwi.c` | 651 | 48 | — **manquant** | 0/48 (0%) | 0/48 (0%) | 🔴 manquant |
| `ereader_screen.c` | 537 | 11 | — **manquant** | 0/11 (0%) | 0/11 (0%) | 🔴 manquant |
| `multiboot.c` | 472 | 9 | — **manquant** | 0/9 (0%) | 0/9 (0%) | 🔴 manquant |
| `librfu_intr.c` | 419 | 10 | — **manquant** | 0/10 (0%) | 0/10 (0%) | 🔴 manquant |
| `mystery_event_script.c` | 401 | 30 | — **manquant** | 0/30 (0%) | 0/30 (0%) | 🔴 manquant |
| `mystery_gift_client.c` | 303 | 18 | — **manquant** | 0/18 (0%) | 0/18 (0%) | 🔴 manquant |
| `mystery_gift_server.c` | 291 | 15 | — **manquant** | 0/15 (0%) | 0/15 (0%) | 🔴 manquant |
| `union_room_battle.c` | 234 | 5 | — **manquant** | 0/5 (0%) | 0/5 (0%) | 🔴 manquant |
| `mystery_gift_link.c` | 223 | 10 | — **manquant** | 0/10 (0%) | 0/10 (0%) | 🔴 manquant |
| `librfu_sio32id.c` | 172 | 4 | — **manquant** | 0/4 (0%) | 0/4 (0%) | 🔴 manquant |
| `union_room_chat.c` | 3322 | 123 | `union_room_chat.ts` | 1/123 (1%) | 3/123 (2%) | 🔴 manquant |
| `record_mixing.c` | 1409 | 43 | — **manquant** | 0/43 (0%) | 1/43 (2%) | 🔴 manquant |
| `cable_club.c` | 1331 | 62 | — **manquant** | 0/62 (0%) | 1/62 (2%) | 🔴 manquant |
| `union_room_player_avatar.c` | 609 | 38 | — **manquant** | 0/38 (0%) | 1/38 (3%) | 🔴 manquant |
| `link.c` | 2370 | 125 | `link.ts` | 1/125 (1%) | 11/125 (9%) | 🔴 manquant |
| `mystery_gift.c` | 667 | 45 | `mystery_gift.ts` | 3/45 (7%) | 4/45 (9%) | 🔴 manquant |
| `wonder_news.c` | 157 | 9 | `wonder_news.ts` | 1/9 (11%) | 1/9 (11%) | 🔴 manquant |
| `link_rfu_3.c` | 986 | 30 | `link_rfu_3.ts` | 1/30 (3%) | 4/30 (13%) | 🔴 manquant |
| `mystery_event_menu.c` | 322 | 6 | — **manquant** | 0/6 (0%) | 1/6 (17%) | 🟡 amorce |
| `reshow_battle_screen.c` | 317 | 7 | `reshow_battle_screen.ts` | 5/7 (71%) | 5/7 (71%) | 🟡 partiel |
| `mystery_gift_scripts.c` | 218 | 0 | — **manquant** | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |
| `mystery_event_msg.c` | 15 | 0 | — **manquant** | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |

### Autre (7)

| .c décomp | lignes | fn | chez nous | compl(fichier) | compl(partout) | statut |
|---|---|---|---|---|---|---|
| `minigame_countdown.c` | 760 | 20 | — **manquant** | 0/20 (0%) | 0/20 (0%) | 🔴 manquant |
| `wireless_communication_status_screen.c` | 472 | 12 | — **manquant** | 0/12 (0%) | 0/12 (0%) | 🔴 manquant |
| `cable_car.c` | 1066 | 22 | — **manquant** | 0/22 (0%) | 1/22 (5%) | 🔴 manquant |
| `trader.c` | 216 | 13 | `trader.ts` | 2/13 (15%) | 2/13 (15%) | 🟡 amorce |
| `dma3_manager.c` | 184 | 5 | `pokenav_match_call_gfx.ts` _(nom≠)_ | 2/5 (40%) | 2/5 (40%) | 🟡 amorce |
| `data.c` | 329 | 0 | — **manquant** | 0/0 (100%) | 0/0 (100%) | ⚪ vide/data |
| `mail_data.c` | 206 | 12 | `mail_data.ts` | 12/12 (100%) | 12/12 (100%) | ✅ miroir |

