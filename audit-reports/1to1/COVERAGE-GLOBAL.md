# CARTE DE COUVERTURE 1:1 GLOBALE — décomp `src/*.c` ↔ notre port

Généré : 2026-06-13T01:36:40.030Z

> Signal "couvert" = une citation `1:1 décomp file.c:N` pointe dans la fonction.
> ⚠️ Prouve la COUVERTURE/traçabilité, **PAS le comportement** (bugs runtime = ROM-diff séparé).
> Couverture globale (≥1 fonctions/fichier) : **6235/11228 fonctions** (56%) sur **221 fichiers .c**.
> 39 fichiers 100% · 182 partiels · 0 jamais touchés.

## 🟢 Fichiers 100% couverts (39)

- `battle_script_commands.c` (287 fn)
- `battle_ai_script_commands.c` (115 fn)
- `battle_main.c` (107 fn)
- `battle_controller_opponent.c` (88 fn)
- `battle_anim.c` (79 fn)
- `battle_util.c` (52 fn)
- `string_util.c` (44 fn)
- `battle_anim_mon_movement.c` (34 fn)
- `field_camera.c` (28 fn)
- `battle_anim_psychic.c` (27 fn)
- `battle_anim_ground.c` (25 fn)
- `event_data.c` (25 fn)
- `wallclock.c` (25 fn)
- `option_menu.c` (24 fn)
- `rotating_gate.c` (22 fn)
- `starter_choose.c` (18 fn)
- `battle_anim_sound_tasks.c` (15 fn)
- `battle_ai_switch_items.c` (13 fn)
- `battle_anim_bug.c` (13 fn)
- `pokemon_size_record.c` (12 fn)
- `battle_anim_dragon.c` (11 fn)
- `decoration_inventory.c` (11 fn)
- `text_window.c` (11 fn)
- `util.c` (11 fn)
- `mail.c` (10 fn)
- `battle_anim_poison.c` (9 fn)
- `math_util.c` (9 fn)
- `scanline_effect.c` (9 fn)
- `coins.c` (7 fn)
- `map_name_popup.c` (7 fn)
- `reshow_battle_screen.c` (7 fn)
- `battle_util2.c` (5 fn)
- `play_time.c` (5 fn)
- `dynamic_placeholder_text_util.c` (4 fn)
- `random.c` (4 fn)
- `trig.c` (4 fn)
- `battle_anim_smokescreen.c` (3 fn)
- `post_battle_event_funcs.c` (2 fn)
- `give_gift_ribbon_to_party.c` (1 fn)

## 🟡 Partiels — triés par # fonctions manquantes (les "presque finis" en bas)

| Fichier | couvert/total | % | manquantes | citations |
|---|---|---|---|---|
| `event_object_movement.c` | 329/785 | 42% | **456** | 369 |
| `pokemon_storage_system.c` | 21/380 | 6% | **359** | 71 |
| `field_effect.c` | 31/247 | 13% | **216** | 66 |
| `party_menu.c` | 149/354 | 42% | **205** | 277 |
| `battle_transition.c` | 41/210 | 20% | **169** | 59 |
| `tv.c` | 48/207 | 23% | **159** | 55 |
| `overworld.c` | 89/227 | 39% | **138** | 138 |
| `pokedex.c` | 12/140 | 9% | **128** | 78 |
| `field_player_avatar.c` | 56/177 | 32% | **121** | 72 |
| `decoration.c` | 15/135 | 11% | **120** | 28 |
| `field_weather_effect.c` | 7/106 | 7% | **99** | 6 |
| `easy_chat.c` | 173/248 | 70% | **75** | 110 |
| `battle_controller_player_partner.c` | 20/93 | 22% | **73** | 10 |
| `rayquaza_scene.c` | 0/72 | 0% | **72** | 41 |
| `pokemon.c` | 90/160 | 56% | **70** | 195 |
| `field_effect_helpers.c` | 12/81 | 15% | **69** | 18 |
| `battle_controller_wally.c` | 15/82 | 18% | **67** | 5 |
| `battle_controller_safari.c` | 9/73 | 12% | **64** | 2 |
| `fldeff_misc.c` | 5/62 | 8% | **57** | 29 |
| `shop.c` | 3/57 | 5% | **54** | 27 |
| `daycare.c` | 14/67 | 21% | **53** | 5 |
| `m4a.c` | 19/72 | 26% | **53** | 24 |
| `match_call.c` | 4/56 | 7% | **52** | 14 |
| `use_pokeblock.c` | 0/51 | 0% | **51** | 13 |
| `field_specials.c` | 142/191 | 74% | **49** | 134 |
| `trainer_card.c` | 30/79 | 38% | **49** | 40 |
| `bike.c` | 8/56 | 14% | **48** | 5 |
| `menu_specialized.c` | 9/57 | 16% | **48** | 25 |
| `field_weather.c` | 5/49 | 10% | **44** | 16 |
| `hall_of_fame.c` | 1/45 | 2% | **44** | 35 |
| `main_menu.c` | 41/82 | 50% | **41** | 134 |
| `start_menu.c` | 41/80 | 51% | **39** | 59 |
| `credits.c` | 0/38 | 0% | **38** | 32 |
| `field_screen_effect.c` | 39/77 | 51% | **38** | 52 |
| `image_processing_effects.c` | 0/38 | 0% | **38** | 2 |
| `evolution_graphics.c` | 0/37 | 0% | **37** | 28 |
| `region_map.c` | 23/60 | 38% | **37** | 60 |
| `item_use.c` | 39/74 | 53% | **35** | 50 |
| `battle_transition_frontier.c` | 0/34 | 0% | **34** | 14 |
| `AgbRfu_LinkManager.c` | 1/34 | 3% | **33** | 2 |
| `item_menu.c` | 91/122 | 75% | **31** | 222 |
| `menu.c` | 92/123 | 75% | **31** | 158 |
| `battle_records.c` | 3/31 | 10% | **28** | 9 |
| `bg.c` | 24/52 | 46% | **28** | 25 |
| `lilycove_lady.c` | 44/72 | 61% | **28** | 54 |
| `intro.c` | 42/69 | 61% | **27** | 98 |
| `trainer_see.c` | 12/39 | 31% | **27** | 29 |
| `battle_tent.c` | 6/32 | 19% | **26** | 2 |
| `ereader_helpers.c` | 0/26 | 0% | **26** | 2 |
| `field_tasks.c` | 2/28 | 7% | **26** | 11 |
| `recorded_battle.c` | 16/42 | 38% | **26** | 9 |
| `berry_tag_screen.c` | 2/27 | 7% | **25** | 10 |
| `pokemon_summary_screen.c` | 116/140 | 83% | **24** | 38 |
| `evolution_scene.c` | 2/25 | 8% | **23** | 16 |
| `cable_car.c` | 1/22 | 5% | **21** | 17 |
| `naming_screen.c` | 96/117 | 82% | **21** | 71 |
| `save.c` | 14/35 | 40% | **21** | 31 |
| `text.c` | 32/53 | 60% | **21** | 130 |
| `egg_hatch.c` | 5/25 | 20% | **20** | 17 |
| `fldeff_flash.c` | 0/20 | 0% | **20** | 18 |
| `minigame_countdown.c` | 0/20 | 0% | **20** | 12 |
| `palette_util.c` | 0/19 | 0% | **19** | 2 |
| `script_menu.c` | 12/31 | 39% | **19** | 16 |
| `pokedex_area_screen.c` | 1/19 | 5% | **18** | 7 |
| `reset_rtc_screen.c` | 1/19 | 5% | **18** | 14 |
| `sound.c` | 29/47 | 62% | **18** | 33 |
| `battle_anim_mons.c` | 111/128 | 87% | **17** | 223 |
| `move_relearner.c` | 2/19 | 11% | **17** | 8 |
| `libisagbprn.c` | 0/16 | 0% | **16** | 2 |
| `scrcmd.c` | 215/231 | 93% | **16** | 265 |
| `trainer_pokemon_sprites.c` | 7/23 | 30% | **16** | 7 |
| `agb_flash.c` | 0/15 | 0% | **15** | 12 |
| `main.c` | 14/29 | 48% | **15** | 37 |
| `pokeball.c` | 22/37 | 59% | **15** | 136 |
| `window.c` | 15/30 | 50% | **15** | 24 |
| `coord_event_weather.c` | 0/14 | 0% | **14** | 2 |
| `pokedex_cry_screen.c` | 0/14 | 0% | **14** | 6 |
| `safari_zone.c` | 3/17 | 18% | **14** | 6 |
| `siirtc.c` | 2/16 | 13% | **14** | 3 |
| `braille_puzzles.c` | 5/18 | 28% | **13** | 7 |
| `fldeff_cut.c` | 4/17 | 24% | **13** | 7 |
| `mon_markings.c` | 2/15 | 13% | **13** | 10 |
| `wild_encounter.c` | 23/35 | 66% | **12** | 23 |
| `battle_interface.c` | 42/53 | 79% | **11** | 85 |
| `decompress.c` | 10/21 | 48% | **11** | 8 |
| `ereader_screen.c` | 0/11 | 0% | **11** | 5 |
| `palette.c` | 29/40 | 73% | **11** | 95 |
| `pokemon_icon.c` | 12/23 | 52% | **11** | 18 |
| `rtc.c` | 15/26 | 58% | **11** | 30 |
| `save_failed_screen.c` | 1/12 | 8% | **11** | 11 |
| `walda_phrase.c` | 3/14 | 21% | **11** | 6 |
| `wireless_communication_status_screen.c` | 1/12 | 8% | **11** | 9 |
| `dewford_trend.c` | 3/13 | 23% | **10** | 7 |
| `field_control_avatar.c` | 31/41 | 76% | **10** | 52 |
| `fldeff_rocksmash.c` | 0/10 | 0% | **10** | 8 |
| `item.c` | 42/52 | 81% | **10** | 62 |
| `sprite.c` | 92/102 | 90% | **10** | 302 |
| `intro_credits_graphics.c` | 11/20 | 55% | **9** | 30 |
| `malloc.c` | 3/12 | 25% | **9** | 6 |
| `mini_printf.c` | 0/9 | 0% | **9** | 2 |
| `multiboot.c` | 0/9 | 0% | **9** | 2 |
| `roamer.c` | 4/13 | 31% | **9** | 5 |
| `battle_controller_player.c` | 116/124 | 94% | **8** | 96 |
| `clear_save_data_screen.c` | 1/9 | 11% | **8** | 9 |
| `confetti_util.c` | 0/8 | 0% | **8** | 2 |
| `international_string_util.c` | 10/18 | 56% | **8** | 4 |
| `new_game.c` | 5/13 | 38% | **8** | 12 |
| `save_location.c` | 2/10 | 20% | **8** | 5 |
| `wonder_news.c` | 1/9 | 11% | **8** | 3 |
| `diploma.c` | 3/10 | 30% | **7** | 8 |
| `fldeff_softboiled.c` | 1/8 | 13% | **7** | 9 |
| `load_save.c` | 14/21 | 67% | **7** | 27 |
| `title_screen.c` | 13/20 | 65% | **7** | 34 |
| `battle_anim_throw.c` | 72/78 | 92% | **6** | 98 |
| `battle_setup.c` | 96/102 | 94% | **6** | 104 |
| `field_door.c` | 17/23 | 74% | **6** | 90 |
| `fldeff_escalator.c` | 0/6 | 0% | **6** | 5 |
| `fldeff_sweetscent.c` | 0/6 | 0% | **6** | 2 |
| `gpu_regs.c` | 6/12 | 50% | **6** | 5 |
| `item_menu_icons.c` | 15/21 | 71% | **6** | 62 |
| `menu_helpers.c` | 19/25 | 76% | **6** | 34 |
| `agb_flash_mx.c` | 0/5 | 0% | **5** | 2 |
| `battle_anim_effects_1.c` | 149/154 | 97% | **5** | 92 |
| `event_object_lock.c` | 9/14 | 64% | **5** | 9 |
| `fieldmap.c` | 50/55 | 91% | **5** | 99 |
| `field_message_box.c` | 12/17 | 71% | **5** | 17 |
| `field_poison.c` | 2/7 | 29% | **5** | 7 |
| `script.c` | 34/39 | 87% | **5** | 17 |
| `time_events.c` | 5/10 | 50% | **5** | 11 |
| `bard_music.c` | 1/5 | 20% | **4** | 3 |
| `battle_anim_flying.c` | 27/31 | 87% | **4** | 41 |
| `battle_anim_status_effects.c` | 8/12 | 67% | **4** | 13 |
| `battle_anim_water.c` | 44/48 | 92% | **4** | 37 |
| `battle_bg.c` | 8/12 | 67% | **4** | 32 |
| `battle_controllers.c` | 64/68 | 94% | **4** | 96 |
| `berry_powder.c` | 10/14 | 71% | **4** | 8 |
| `blit.c` | 1/5 | 20% | **4** | 4 |
| `clock.c` | 2/6 | 33% | **4** | 3 |
| `dma3_manager.c` | 1/5 | 20% | **4** | 5 |
| `field_special_scene.c` | 9/13 | 69% | **4** | 22 |
| `fldeff_dig.c` | 0/4 | 0% | **4** | 2 |
| `fldeff_strength.c` | 0/4 | 0% | **4** | 2 |
| `fldeff_teleport.c` | 0/4 | 0% | **4** | 2 |
| `metatile_behavior.c` | 140/144 | 97% | **4** | 212 |
| `pokedex_area_region_map.c` | 0/4 | 0% | **4** | 2 |
| `script_movement.c` | 15/19 | 79% | **4** | 23 |
| `battle_anim_effects_2.c` | 118/121 | 98% | **3** | 98 |
| `battle_anim_electric.c` | 34/37 | 92% | **3** | 32 |
| `battle_anim_fire.c` | 32/35 | 91% | **3** | 36 |
| `battle_anim_rock.c` | 19/22 | 86% | **3** | 28 |
| `battle_gfx_sfx_util.c` | 50/53 | 94% | **3** | 39 |
| `berry.c` | 33/36 | 92% | **3** | 96 |
| `gym_leader_rematch.c` | 0/3 | 0% | **3** | 2 |
| `hof_pc.c` | 1/4 | 25% | **3** | 5 |
| `list_menu.c` | 45/48 | 94% | **3** | 99 |
| `agb_flash_1m.c` | 0/2 | 0% | **2** | 2 |
| `battle_anim_dark.c` | 23/25 | 92% | **2** | 33 |
| `battle_anim_fight.c` | 29/31 | 94% | **2** | 34 |
| `battle_anim_ice.c` | 30/32 | 94% | **2** | 39 |
| `braille.c` | 1/3 | 33% | **2** | 3 |
| `heal_location.c` | 1/3 | 33% | **2** | 3 |
| `landmark.c` | 0/2 | 0% | **2** | 2 |
| `money.c` | 13/15 | 87% | **2** | 25 |
| `pokemon_animation.c` | 239/241 | 99% | **2** | 41 |
| `rotating_tile_puzzle.c` | 4/6 | 67% | **2** | 4 |
| `script_pokemon_util.c` | 11/13 | 85% | **2** | 19 |
| `battle_anim_effects_3.c` | 139/140 | 99% | **1** | 92 |
| `battle_anim_ghost.c` | 36/37 | 97% | **1** | 21 |
| `battle_anim_normal.c` | 35/36 | 97% | **1** | 38 |
| `battle_anim_utility_funcs.c` | 41/42 | 98% | **1** | 26 |
| `battle_intro.c` | 10/11 | 91% | **1** | 28 |
| `battle_message.c` | 9/10 | 90% | **1** | 69 |
| `birch_pc.c` | 2/3 | 67% | **1** | 4 |
| `field_region_map.c` | 5/6 | 83% | **1** | 20 |
| `item_icon.c` | 5/6 | 83% | **1** | 13 |
| `lottery_corner.c` | 7/8 | 88% | **1** | 13 |
| `mail_data.c` | 11/12 | 92% | **1** | 16 |
| `player_pc.c` | 84/85 | 99% | **1** | 104 |
| `reload_save.c` | 0/1 | 0% | **1** | 2 |
| `rom_header_gf.c` | 0/1 | 0% | **1** | 2 |
| `task.c` | 13/14 | 93% | **1** | 14 |
| `tileset_anims.c` | 83/84 | 99% | **1** | 81 |

## 🔴 Jamais touchés (0 citation) — triés par taille (0)

| Fichier | fonctions | lignes |
|---|---|---|

## ⭐ "Presque finis" (partiels avec ≤5 fonctions manquantes — candidats clôture rapide)

### `battle_anim_effects_3.c` — 1 manquante(s) (99%)
- `AnimUnusedItemBagSteal` @ L5222-5266

### `battle_anim_ghost.c` — 1 manquante(s) (97%)
- `AnimDestinyBondWhiteShadow` @ L746-782

### `battle_anim_normal.c` — 1 manquante(s) (97%)
- `AnimSimplePaletteBlend_Step` @ L329-343

### `battle_anim_utility_funcs.c` — 1 manquante(s) (98%)
- `AnimTask_HardwarePaletteFade_Step` @ L211-217

### `battle_intro.c` — 1 manquante(s) (91%)
- `DrawBattlerOnBgDMA` @ L605-620

### `battle_message.c` — 1 manquante(s) (90%)
- `ChooseMoveUsedParticle` @ L2959-2998

### `birch_pc.c` — 1 manquante(s) (67%)
- `GetPokedexRatingText` @ L24-84

### `field_region_map.c` — 1 manquante(s) (83%)
- `VBCB_FieldUpdateRegionMap` @ L124-130

### `item_icon.c` — 1 manquante(s) (83%)
- `FreeItemIconTemporaryBuffers` @ L72-77

### `lottery_corner.c` — 1 manquante(s) (88%)
- `SetLotteryNumber16_Unused` @ L165-169

### `mail_data.c` — 1 manquante(s) (92%)
- `DummyMailFunc` @ L132-136

### `player_pc.c` — 1 manquante(s) (99%)
- `ItemStorage_HandleReturnToProcessInput` @ L585-590

### `reload_save.c` — 1 manquante(s) (0%)
- `ReloadSave` @ L13-31

### `rom_header_gf.c` — 1 manquante(s) (0%)
- `__attribute__` @ L98-176

### `task.c` — 1 manquante(s) (93%)
- `GetTaskCount` @ L177-188

### `tileset_anims.c` — 1 manquante(s) (99%)
- `BlendAnimPalette_BattleDome_FloorLightsNoBlend` @ L1179-1189

### `agb_flash_1m.c` — 2 manquante(s) (0%)
- `IdentifyFlash` @ L13-50
- `WaitForFlashWrite_Common` @ L51-87

### `battle_anim_dark.c` — 2 manquante(s) (92%)
- `AnimUnusedBagSteal` @ L276-290
- `AnimUnusedBagSteal_Step` @ L291-319

### `battle_anim_fight.c` — 2 manquante(s) (94%)
- `AnimUnusedHumanoidFoot` @ L412-420
- `AnimFistOrFootRandomPos_Step` @ L512-529

### `battle_anim_ice.c` — 2 manquante(s) (94%)
- `AnimUnusedIceCrystalThrow` @ L532-570
- `AnimUnusedIceCrystalThrow_Step` @ L571-591

### `braille.c` — 2 manquante(s) (33%)
- `FontFunc_Braille` @ L20-197
- `DecompressGlyph_Braille` @ L198-208

### `heal_location.c` — 2 manquante(s) (33%)
- `GetHealLocationIndexByMap` @ L7-18
- `GetHealLocationByMap` @ L19-28

### `landmark.c` — 2 manquante(s) (0%)
- `GetLandmarkName` @ L397-423
- `GetLandmarks` @ L424-447

### `money.c` — 2 manquante(s) (87%)
- `AddMoneyLabelObject` @ L187-193
- `RemoveMoneyLabelObject` @ L194-198

### `pokemon_animation.c` — 2 manquante(s) (99%)
- `LaunchAnimationTaskForBackSprite` @ L956-978
- `SetSpriteCB_MonAnimDummy` @ L979-983

### `rotating_tile_puzzle.c` — 2 manquante(s) (67%)
- `SaveRotatingTileObject` @ L306-313
- `TurnUnsavedRotatingTileObject` @ L314-382

### `script_pokemon_util.c` — 2 manquante(s) (85%)
- `CB2_ReturnFromChooseHalfParty` @ L173-187
- `CB2_ReturnFromChooseBattleFrontierParty` @ L194-208

### `battle_anim_effects_2.c` — 3 manquante(s) (98%)
- `AnimCirclingFinger` @ L1270-1288
- `AnimBouncingMusicNote` @ L1289-1302
- `AnimBouncingMusicNote_Step` @ L1303-1323

### `battle_anim_electric.c` — 3 manquante(s) (92%)
- `AnimUnusedSpinningFist` @ L476-485
- `AnimUnusedSpinningFist_Step` @ L486-491
- `AnimUnusedCirclingShock` @ L492-514

### `battle_anim_fire.c` — 3 manquante(s) (91%)
- `AnimUnusedSmallEmber_Step` @ L577-603
- `AnimTask_EruptionLaunchRocks_Step` @ L815-921
- `AnimTask_MoveHeatWaveTargets_Step` @ L1239-1328

### `battle_anim_rock.c` — 3 manquante(s) (86%)
- `AnimParticleInVortex_Step` @ L378-395
- `AnimTask_LoadSandstormBackground_Step` @ L427-512
- `AnimTask_Rollout_Step` @ L630-694

### `battle_gfx_sfx_util.c` — 3 manquante(s) (94%)
- `BattleGfxSfxDummy1` @ L693-696
- `BattleGfxSfxDummy2` @ L697-700
- `BattleGfxSfxDummy3` @ L728-731

### `berry.c` — 3 manquante(s) (92%)
- `IsPlayerFacingEmptyBerryTreePatch` @ L1021-1029
- `TryToWaterBerryTree` @ L1030-1037
- `GetBerryCountStringByBerryType` @ L1175-1179

### `gym_leader_rematch.c` — 3 manquante(s) (0%)
- `UpdateGymLeaderRematch` @ L32-42
- `UpdateGymLeaderRematchFromArray` @ L43-93
- `GetRematchIndex` @ L94-106

### `hof_pc.c` — 3 manquante(s) (25%)
- `ReturnFromHallOfFamePC` @ L20-25
- `ReshowPCMenuAfterHallOfFamePC` @ L26-35
- `Task_WaitForPaletteFade` @ L36-41

### `list_menu.c` — 3 manquante(s) (94%)
- `ListMenuInitInRect` @ L375-393
- `ChangeListMenuPals` @ L481-490
- `ChangeListMenuCoords` @ L491-499

### `bard_music.c` — 4 manquante(s) (20%)
- `BardSoundTemplate` @ L33-120
- `GetWordPitch` @ L187-191
- `GetWordSoundTemplates` @ L192-222
- `CalcWordSounds` @ L223-248

### `battle_anim_flying.c` — 4 manquante(s) (87%)
- `AnimUnusedBubbleThrow` @ L895-902
- `AnimUnusedFlashingLight` @ L1161-1167
- `AnimUnusedFlashingLight_Step` @ L1168-1186
- `AnimTask_SetAttackerVisibility` @ L1223-1237

### `battle_anim_status_effects.c` — 4 manquante(s) (67%)
- `Task_FlashingCircleImpacts` @ L273-312
- `Task_UpdateFlashingCircleImpacts` @ L313-345
- `AnimFlashingCircleImpact` @ L346-359
- `AnimFlashingCircleImpact_Step` @ L360-380

### `battle_anim_water.c` — 4 manquante(s) (92%)
- `AnimRainDrop` @ L508-512
- `AnimWaterBubbleProjectile_Step1` @ L566-587
- `AnimWaterBubbleProjectile_Step2` @ L588-594
- `AnimWaterBubbleProjectile_Step3` @ L595-601

### `battle_bg.c` — 4 manquante(s) (67%)
- `UnusedBattleInit` @ L697-706
- `CB2_UnusedBattleInit` @ L707-712
- `DrawLinkBattleParticipantPokeballs` @ L869-934
- `DrawLinkBattleVsScreenOutcomeText` @ L935-1015

### `battle_controllers.c` — 4 manquante(s) (94%)
- `CreateTasksForSendRecvLinkBuffers` @ L701-733
- `Task_HandleSendLinkBuffersData` @ L775-870
- `TryReceiveLinkBattleData` @ L871-908
- `Task_HandleCopyReceivedLinkBuffersData` @ L909-967

### `berry_powder.c` — 4 manquante(s) (71%)
- `ApplyNewEncryptionKeyToBerryPowder` @ L138-143
- `TakeBerryPowder_` @ L178-187
- `PrintBerryPowderAmount` @ L204-209
- `DrawPlayerPowderAmount` @ L210-216

### `blit.c` — 4 manquante(s) (20%)
- `BlitBitmapRect4BitWithoutColorKey` @ L4-8
- `FillBitmapRect4Bit` @ L73-105
- `BlitBitmapRect4BitTo8Bit` @ L106-183
- `FillBitmapRect8Bit` @ L184-210

### `clock.c` — 4 manquante(s) (33%)
- `InitTimeBasedEvents` @ L18-25
- `UpdatePerDay` @ L36-58
- `UpdatePerMinute` @ L59-75
- `ReturnFromStartWallClock` @ L76-81

### `dma3_manager.c` — 4 manquante(s) (20%)
- `ClearDma3Requests` @ L25-41
- `ProcessDma3Requests` @ L42-97
- `RequestDma3Copy` @ L98-129
- `CheckForSpaceForDma3Request` @ L163-184

### `field_special_scene.c` — 4 manquante(s) (69%)
- `TrySetPortholeWarpDestination` @ L281-296
- `Task_HandlePorthole` @ L297-355
- `ShowSSTidalWhileSailing` @ L356-367
- `FieldCB_ShowPortholeView` @ L368-376

### `fldeff_dig.c` — 4 manquante(s) (0%)
- `SetUpFieldMove_Dig` @ L17-30
- `FieldCallback_Dig` @ L31-37
- `FldEff_UseDig` @ L38-48
- `StartDigFieldEffect` @ L49-64

### `fldeff_strength.c` — 4 manquante(s) (0%)
- `SetUpFieldMove_Strength` @ L18-29
- `FieldCallback_Strength` @ L30-35
- `FldEff_UseStrength` @ L36-45
- `StartStrengthFieldEffect` @ L46-51

### `fldeff_teleport.c` — 4 manquante(s) (0%)
- `SetUpFieldMove_Teleport` @ L13-23
- `FieldCallback_Teleport` @ L24-30
- `FldEff_UseTeleport` @ L31-39
- `StartTeleportFieldEffect` @ L40-45

### `metatile_behavior.c` — 4 manquante(s) (97%)
- `Unref_MetatileBehavior_IsUnused04` @ L246-253
- `Unref_MetatileBehavior_IsArrowWarp` @ L323-337
- `Unref_MetatileBehavior_IsUnused05` @ L369-376
- `Unref_MetatileBehavior_IsUnusedSootopolisWater` @ L915-923

### `pokedex_area_region_map.c` — 4 manquante(s) (0%)
- `LoadPokedexAreaMapGfx` @ L17-47
- `TryShowPokedexAreaMap` @ L48-60
- `FreePokedexAreaMapBgNum` @ L61-65
- `PokedexAreaMapChangeBgY` @ L66-70

### `script_movement.c` — 4 manquante(s) (79%)
- `GetMoveObjectsTaskId` @ L70-74
- `LoadObjectEventIdPtrFromMovementScript` @ L118-126
- `SetObjectEventIdAtMovementScript` @ L127-134
- `ScriptMovement_UnfreezeActiveObjects` @ L182-194

### `agb_flash_mx.c` — 5 manquante(s) (0%)
- `EraseFlashChip_MX` @ L54-76
- `EraseFlashSector_MX` @ L77-120
- `ProgramFlashByte_MX` @ L121-145
- `ProgramByte` @ L146-155
- `ProgramFlashSector_MX` @ L156-194

### `battle_anim_effects_1.c` — 5 manquante(s) (97%)
- `AnimWhipHit_WaitEnd` @ L3697-3702
- `AnimFlickeringPunch` @ L3734-3753
- `UnusedFlickerAnim` @ L3854-3886
- `AnimTask_HideBattlersHealthbox` @ L4920-4936
- `AnimTask_ShowBattlersHealthbox` @ L4937-4945

### `event_object_lock.c` — 5 manquante(s) (64%)
- `Task_FreezePlayer` @ L20-28
- `Task_FreezeSelectedObjectAndPlayer` @ L54-71
- `ScriptUnfreezeObjectEvents` @ L99-106
- `UnionRoom_UnlockPlayerAndChatPartner` @ L107-118
- `Task_FreezeObjectAndPlayer` @ L130-150

### `fieldmap.c` — 5 manquante(s) (91%)
- `InitBattlePyramidMap` @ L88-93
- `InitTrainerHillMap` @ L94-99
- `ApplyGlobalTintToPaletteSlot` @ L870-874
- `CopyPrimaryTilesetToVram` @ L900-904
- `LoadPrimaryTilesetPalette` @ L915-919

### `field_message_box.c` — 5 manquante(s) (71%)
- `CreateTask_DrawFieldMessage` @ L50-54
- `Task_HidePokenavMessageWhenDone` @ L71-79
- `ForceShowFieldAutoScrollMessage` @ L100-108
- `ExpandStringAndStartDrawFieldMessage` @ L118-124
- `ReplaceFieldMessageWithFrame` @ L150-156

### `field_poison.c` — 5 manquante(s) (29%)
- `IsMonValidSpecies` @ L20-28
- `AllMonsFainted` @ L29-41
- `FaintFromFieldPoison` @ L42-52
- `MonFaintedFromPoison` @ L53-64
- `Task_TryFieldPoisonWhiteOut` @ L65-113

### `script.c` — 5 manquante(s) (87%)
- `CalculateRamScriptChecksum` @ L371-375
- `ClearRamScript` @ L376-380
- `InitRamScript` @ L381-398
- `ValidateSavedRamScript` @ L425-440
- `InitRamScript_NoObjectEvent` @ L465-471

### `time_events.c` — 5 manquante(s) (50%)
- `SetMirageRnd` @ L19-25
- `InitMirageRnd` @ L26-30
- `UpdateMirageRnd` @ L31-41
- `Task_WaitWeather` @ L94-102
- `UpdateBirchState` @ L113-119

## 🧩 Axe SCRIPTS (.s) — bytecode COMPILÉ (pas cité)

> Les scripts décomp (combat/anim/event/field-effect/ai) sont compilés en masse → `decomp-data/auto-asm-bytecode/`. "Présent" = le label décomp existe dans la sortie compilée.
> ⚠️ Que les OPCODES utilisés soient implémentés est un AUTRE axe : `npm run audit:opcodes` / `audit:specials` / `audit:scrcmd` / `audit:move-effect-scripts`.

| Fichier .s | labels présents/total | % |
|---|---|---|
| `battle_scripts_1.s` | 619/619 | 100% |
| `battle_scripts_2.s` | 26/26 | 100% |
| `battle_anim_scripts.s` | 658/658 | 100% |
| `battle_ai_scripts.s` | 555/555 | 100% |
| `event_scripts.s` | 72/72 | 100% |
| `field_effect_scripts.s` | 68/68 | 100% |

_(les events par map = `data/maps/*/scripts.inc`, 519 maps, compilés en masse dans `auto-asm-bytecode/maps`+`/scripts`.)_

## 🗃️ Axe DATA (.h tables + constantes) — EXTRAIT, pas cité

> Les tables de data (`src/data/*.h` : species/moves/items/trainers/learnsets…) et les
> constantes (`include/constants/*.h`) ne sont PAS transcrites : elles sont EXTRAITES en JSON
> (`npm run extract:*` → `public/decomp/em/*.json`) puis vérifiées par :
> `npm run audit:combat` (base stats, moves, type-chart, learnsets, trainer parties, item/hold effects, evolutions, exp, stat-ratios)
> et `npm run audit:overworld` (opcodes, specials, scrcmd, movement, collision). Mesurer leur
> "couverture par citation" serait FAUX (elles ne sont pas censées être citées).

## 📐 Le tableau complet des axes

| Type décomp | Comment porté | Outil de mesure |
|---|---|---|
| `.c` fonctions | transcrit + cité `1:1 décomp` | **ce rapport** (`coverage:1to1`) |
| `.s`/`.inc` scripts | compilé (bytecode) | section SCRIPTS ci-dessus + `audit:opcodes/specials/scrcmd` |
| `.h` data tables | extrait JSON | `audit:combat` / `audit:overworld` / `audit:graphics` |
| `.h` constantes | extrait (constants.json) | `extract:constants` |

