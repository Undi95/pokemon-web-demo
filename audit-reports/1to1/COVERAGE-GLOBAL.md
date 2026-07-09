# CARTE DE COUVERTURE 1:1 GLOBALE — décomp `src/*.c` ↔ notre port

Généré : 2026-06-25T22:50:39.283Z

> Signal "couvert" = une citation `1:1 décomp file.c:N` pointe dans la fonction.
> ⚠️ Prouve la COUVERTURE/traçabilité, **PAS le comportement** (bugs runtime = ROM-diff séparé).
> Couverture globale (≥1 fonctions/fichier) : **6785/11228 fonctions** (60%) sur **221 fichiers .c**.
> 49 fichiers 100% · 125 partiels · 48 jamais touchés.

## 🟢 Fichiers 100% couverts (49)

- `battle_script_commands.c` (287 fn)
- `metatile_behavior.c` (144 fn)
- `battle_ai_script_commands.c` (115 fn)
- `battle_main.c` (107 fn)
- `battle_controller_opponent.c` (88 fn)
- `battle_anim.c` (79 fn)
- `battle_util.c` (52 fn)
- `string_util.c` (44 fn)
- `battle_anim_mon_movement.c` (34 fn)
- `field_camera.c` (28 fn)
- `field_tasks.c` (28 fn)
- `battle_anim_psychic.c` (27 fn)
- `battle_anim_ground.c` (25 fn)
- `event_data.c` (25 fn)
- `wallclock.c` (25 fn)
- `option_menu.c` (24 fn)
- `rotating_gate.c` (22 fn)
- `starter_choose.c` (18 fn)
- `battle_anim_sound_tasks.c` (15 fn)
- `money.c` (15 fn)
- `coord_event_weather.c` (14 fn)
- `battle_ai_switch_items.c` (13 fn)
- `battle_anim_bug.c` (13 fn)
- `mail_data.c` (12 fn)
- `pokemon_size_record.c` (12 fn)
- `battle_anim_dragon.c` (11 fn)
- `decoration_inventory.c` (11 fn)
- `text_window.c` (11 fn)
- `util.c` (11 fn)
- `mail.c` (10 fn)
- `battle_anim_poison.c` (9 fn)
- `math_util.c` (9 fn)
- `scanline_effect.c` (9 fn)
- `fldeff_softboiled.c` (8 fn)
- `coins.c` (7 fn)
- `field_poison.c` (7 fn)
- `map_name_popup.c` (7 fn)
- `reshow_battle_screen.c` (7 fn)
- `fldeff_sweetscent.c` (6 fn)
- `battle_util2.c` (5 fn)
- `play_time.c` (5 fn)
- `dynamic_placeholder_text_util.c` (4 fn)
- `fldeff_dig.c` (4 fn)
- `fldeff_teleport.c` (4 fn)
- `random.c` (4 fn)
- `trig.c` (4 fn)
- `battle_anim_smokescreen.c` (3 fn)
- `post_battle_event_funcs.c` (2 fn)
- `give_gift_ribbon_to_party.c` (1 fn)

## 🟡 Partiels — triés par # fonctions manquantes (les "presque finis" en bas)

| Fichier | couvert/total | % | manquantes | citations |
|---|---|---|---|---|
| `event_object_movement.c` | 382/785 | 49% | **403** | 389 |
| `pokemon_storage_system.c` | 19/380 | 5% | **361** | 11 |
| `party_menu.c` | 168/354 | 47% | **186** | 197 |
| `battle_transition.c` | 41/210 | 20% | **169** | 12 |
| `tv.c` | 50/207 | 24% | **157** | 49 |
| `overworld.c` | 96/227 | 42% | **131** | 120 |
| `pokedex.c` | 12/140 | 9% | **128** | 15 |
| `decoration.c` | 15/135 | 11% | **120** | 16 |
| `field_effect.c` | 132/247 | 53% | **115** | 136 |
| `easy_chat.c` | 173/248 | 70% | **75** | 98 |
| `pokemon.c` | 91/160 | 57% | **69** | 192 |
| `intro.c` | 3/69 | 4% | **66** | 85 |
| `m4a.c` | 7/72 | 10% | **65** | 1 |
| `field_weather_effect.c` | 45/106 | 42% | **61** | 62 |
| `match_call.c` | 2/56 | 4% | **54** | 4 |
| `daycare.c` | 14/67 | 21% | **53** | 4 |
| `field_specials.c` | 141/191 | 74% | **50** | 121 |
| `fldeff_misc.c` | 12/62 | 19% | **50** | 13 |
| `menu_specialized.c` | 9/57 | 16% | **48** | 17 |
| `trainer_card.c` | 31/79 | 39% | **48** | 34 |
| `main_menu.c` | 36/82 | 44% | **46** | 122 |
| `scrcmd.c` | 189/231 | 82% | **42** | 253 |
| `field_screen_effect.c` | 38/77 | 49% | **39** | 20 |
| `start_menu.c` | 41/80 | 51% | **39** | 47 |
| `credits.c` | 0/38 | 0% | **38** | 1 |
| `region_map.c` | 23/60 | 38% | **37** | 51 |
| `menu.c` | 92/123 | 75% | **31** | 155 |
| `bg.c` | 23/52 | 44% | **29** | 20 |
| `lilycove_lady.c` | 43/72 | 60% | **29** | 50 |
| `item_use.c` | 46/74 | 62% | **28** | 44 |
| `trainer_see.c` | 12/39 | 31% | **27** | 19 |
| `recorded_battle.c` | 16/42 | 38% | **26** | 2 |
| `berry_tag_screen.c` | 2/27 | 7% | **25** | 1 |
| `pokemon_summary_screen.c` | 118/140 | 84% | **22** | 19 |
| `evolution_scene.c` | 4/25 | 16% | **21** | 2 |
| `naming_screen.c` | 96/117 | 82% | **21** | 48 |
| `save.c` | 14/35 | 40% | **21** | 20 |
| `text.c` | 32/53 | 60% | **21** | 118 |
| `egg_hatch.c` | 5/25 | 20% | **20** | 2 |
| `intro_credits_graphics.c` | 1/20 | 5% | **19** | 18 |
| `script_menu.c` | 12/31 | 39% | **19** | 6 |
| `main.c` | 11/29 | 38% | **18** | 11 |
| `sound.c` | 29/47 | 62% | **18** | 18 |
| `battle_anim_mons.c` | 111/128 | 87% | **17** | 222 |
| `pokeball.c` | 20/37 | 54% | **17** | 81 |
| `field_player_avatar.c` | 162/177 | 92% | **15** | 166 |
| `fldeff_flash.c` | 5/20 | 25% | **15** | 9 |
| `item_menu.c` | 107/122 | 88% | **15** | 227 |
| `trainer_pokemon_sprites.c` | 8/23 | 35% | **15** | 4 |
| `window.c` | 15/30 | 50% | **15** | 15 |
| `title_screen.c` | 6/20 | 30% | **14** | 28 |
| `mon_markings.c` | 2/15 | 13% | **13** | 2 |
| `pokemon_icon.c` | 10/23 | 43% | **13** | 17 |
| `shop.c` | 44/57 | 77% | **13** | 72 |
| `braille_puzzles.c` | 6/18 | 33% | **12** | 2 |
| `battle_interface.c` | 42/53 | 79% | **11** | 67 |
| `international_string_util.c` | 7/18 | 39% | **11** | 4 |
| `palette.c` | 29/40 | 73% | **11** | 67 |
| `rtc.c` | 15/26 | 58% | **11** | 26 |
| `save_failed_screen.c` | 1/12 | 8% | **11** | 1 |
| `new_game.c` | 3/13 | 23% | **10** | 6 |
| `battle_anim_normal.c` | 27/36 | 75% | **9** | 28 |
| `item.c` | 43/52 | 83% | **9** | 61 |
| `roamer.c` | 4/13 | 31% | **9** | 3 |
| `battle_controller_player.c` | 116/124 | 94% | **8** | 83 |
| `fldeff_cut.c` | 9/17 | 53% | **8** | 9 |
| `load_save.c` | 13/21 | 62% | **8** | 23 |
| `save_location.c` | 2/10 | 20% | **8** | 3 |
| `battle_anim_throw.c` | 71/78 | 91% | **7** | 62 |
| `battle_setup.c` | 95/102 | 93% | **7** | 86 |
| `gpu_regs.c` | 5/12 | 42% | **7** | 3 |
| `sprite.c` | 95/102 | 93% | **7** | 236 |
| `dewford_trend.c` | 7/13 | 54% | **6** | 13 |
| `fieldmap.c` | 49/55 | 89% | **6** | 93 |
| `field_control_avatar.c` | 35/41 | 85% | **6** | 54 |
| `field_door.c` | 17/23 | 74% | **6** | 83 |
| `item_menu_icons.c` | 15/21 | 71% | **6** | 54 |
| `script.c` | 33/39 | 85% | **6** | 11 |
| `battle_anim_effects_1.c` | 149/154 | 97% | **5** | 90 |
| `field_message_box.c` | 12/17 | 71% | **5** | 10 |
| `battle_anim_flying.c` | 27/31 | 87% | **4** | 39 |
| `battle_anim_status_effects.c` | 8/12 | 67% | **4** | 7 |
| `battle_anim_water.c` | 44/48 | 92% | **4** | 35 |
| `battle_bg.c` | 8/12 | 67% | **4** | 32 |
| `battle_controllers.c` | 64/68 | 94% | **4** | 89 |
| `berry_powder.c` | 10/14 | 71% | **4** | 6 |
| `blit.c` | 1/5 | 20% | **4** | 1 |
| `dma3_manager.c` | 1/5 | 20% | **4** | 2 |
| `event_object_lock.c` | 10/14 | 71% | **4** | 4 |
| `field_special_scene.c` | 9/13 | 69% | **4** | 15 |
| `script_movement.c` | 15/19 | 79% | **4** | 20 |
| `battle_anim_effects_2.c` | 118/121 | 98% | **3** | 96 |
| `battle_anim_electric.c` | 34/37 | 92% | **3** | 30 |
| `battle_anim_fire.c` | 32/35 | 91% | **3** | 34 |
| `battle_anim_rock.c` | 19/22 | 86% | **3** | 26 |
| `battle_gfx_sfx_util.c` | 50/53 | 94% | **3** | 28 |
| `clock.c` | 3/6 | 50% | **3** | 13 |
| `list_menu.c` | 45/48 | 94% | **3** | 90 |
| `pokemon_animation.c` | 238/241 | 99% | **3** | 17 |
| `task.c` | 11/14 | 79% | **3** | 9 |
| `wild_encounter.c` | 32/35 | 91% | **3** | 39 |
| `battle_anim_dark.c` | 23/25 | 92% | **2** | 31 |
| `battle_anim_fight.c` | 29/31 | 94% | **2** | 32 |
| `battle_anim_ice.c` | 30/32 | 94% | **2** | 37 |
| `berry.c` | 34/36 | 94% | **2** | 101 |
| `braille.c` | 1/3 | 33% | **2** | 1 |
| `field_effect_helpers.c` | 79/81 | 98% | **2** | 111 |
| `fldeff_rocksmash.c` | 8/10 | 80% | **2** | 11 |
| `heal_location.c` | 1/3 | 33% | **2** | 2 |
| `script_pokemon_util.c` | 11/13 | 85% | **2** | 13 |
| `battle_anim_effects_3.c` | 139/140 | 99% | **1** | 90 |
| `battle_anim_ghost.c` | 36/37 | 97% | **1** | 19 |
| `battle_anim_utility_funcs.c` | 41/42 | 98% | **1** | 24 |
| `battle_intro.c` | 10/11 | 91% | **1** | 14 |
| `battle_message.c` | 9/10 | 90% | **1** | 67 |
| `bike.c` | 55/56 | 98% | **1** | 5 |
| `birch_pc.c` | 2/3 | 67% | **1** | 2 |
| `field_region_map.c` | 5/6 | 83% | **1** | 17 |
| `field_weather.c` | 48/49 | 98% | **1** | 75 |
| `item_icon.c` | 5/6 | 83% | **1** | 9 |
| `lottery_corner.c` | 7/8 | 88% | **1** | 13 |
| `menu_helpers.c` | 24/25 | 96% | **1** | 42 |
| `player_pc.c` | 84/85 | 99% | **1** | 100 |
| `tileset_anims.c` | 83/84 | 99% | **1** | 76 |
| `time_events.c` | 9/10 | 90% | **1** | 13 |

## 🔴 Jamais touchés (0 citation) — triés par taille (48)

| Fichier | fonctions | lignes |
|---|---|---|
| `battle_controller_player_partner.c` | 93 | 1936 |
| `battle_controller_wally.c` | 82 | 1571 |
| `battle_controller_safari.c` | 73 | 692 |
| `rayquaza_scene.c` | 72 | 3191 |
| `use_pokeblock.c` | 51 | 1678 |
| `hall_of_fame.c` | 45 | 1535 |
| `image_processing_effects.c` | 38 | 1229 |
| `evolution_graphics.c` | 37 | 694 |
| `AgbRfu_LinkManager.c` | 34 | 1401 |
| `battle_transition_frontier.c` | 34 | 675 |
| `battle_tent.c` | 32 | 429 |
| `battle_records.c` | 31 | 525 |
| `ereader_helpers.c` | 26 | 876 |
| `cable_car.c` | 22 | 1066 |
| `decompress.c` | 21 | 412 |
| `minigame_countdown.c` | 20 | 760 |
| `move_relearner.c` | 19 | 960 |
| `palette_util.c` | 19 | 504 |
| `pokedex_area_screen.c` | 19 | 798 |
| `reset_rtc_screen.c` | 19 | 741 |
| `safari_zone.c` | 17 | 258 |
| `libisagbprn.c` | 16 | 258 |
| `siirtc.c` | 16 | 464 |
| `agb_flash.c` | 15 | 297 |
| `pokedex_cry_screen.c` | 14 | 581 |
| `walda_phrase.c` | 14 | 279 |
| `malloc.c` | 12 | 225 |
| `wireless_communication_status_screen.c` | 12 | 472 |
| `ereader_screen.c` | 11 | 537 |
| `diploma.c` | 10 | 210 |
| `clear_save_data_screen.c` | 9 | 210 |
| `mini_printf.c` | 9 | 420 |
| `multiboot.c` | 9 | 472 |
| `wonder_news.c` | 9 | 157 |
| `confetti_util.c` | 8 | 182 |
| `fldeff_escalator.c` | 6 | 194 |
| `rotating_tile_puzzle.c` | 6 | 382 |
| `agb_flash_mx.c` | 5 | 194 |
| `bard_music.c` | 5 | 248 |
| `fldeff_strength.c` | 4 | 51 |
| `hof_pc.c` | 4 | 41 |
| `pokedex_area_region_map.c` | 4 | 70 |
| `gym_leader_rematch.c` | 3 | 106 |
| `agb_flash_1m.c` | 2 | 87 |
| `landmark.c` | 2 | 447 |
| `post_battle_event_funcs.c` | 2 | 93 |
| `reload_save.c` | 1 | 31 |
| `rom_header_gf.c` | 1 | 176 |

## ⭐ "Presque finis" (partiels avec ≤5 fonctions manquantes — candidats clôture rapide)

### `battle_anim_effects_3.c` — 1 manquante(s) (99%)
- `AnimUnusedItemBagSteal` @ L5222-5266

### `battle_anim_ghost.c` — 1 manquante(s) (97%)
- `AnimDestinyBondWhiteShadow` @ L746-782

### `battle_anim_utility_funcs.c` — 1 manquante(s) (98%)
- `AnimTask_HardwarePaletteFade_Step` @ L211-217

### `battle_intro.c` — 1 manquante(s) (91%)
- `DrawBattlerOnBgDMA` @ L605-620

### `battle_message.c` — 1 manquante(s) (90%)
- `ChooseMoveUsedParticle` @ L2959-2998

### `bike.c` — 1 manquante(s) (98%)
- `u8` @ L99-126

### `birch_pc.c` — 1 manquante(s) (67%)
- `GetPokedexRatingText` @ L24-84

### `field_region_map.c` — 1 manquante(s) (83%)
- `VBCB_FieldUpdateRegionMap` @ L124-130

### `field_weather.c` — 1 manquante(s) (98%)
- `SetFieldWeather` @ L995-1031

### `item_icon.c` — 1 manquante(s) (83%)
- `FreeItemIconTemporaryBuffers` @ L72-77

### `lottery_corner.c` — 1 manquante(s) (88%)
- `SetLotteryNumber16_Unused` @ L165-169

### `menu_helpers.c` — 1 manquante(s) (96%)
- `IsActiveOverworldLinkBusy` @ L306-313

### `player_pc.c` — 1 manquante(s) (99%)
- `ItemStorage_HandleReturnToProcessInput` @ L585-590

### `tileset_anims.c` — 1 manquante(s) (99%)
- `BlendAnimPalette_BattleDome_FloorLightsNoBlend` @ L1179-1189

### `time_events.c` — 1 manquante(s) (90%)
- `Task_WaitWeather` @ L94-102

### `battle_anim_dark.c` — 2 manquante(s) (92%)
- `AnimUnusedBagSteal` @ L276-290
- `AnimUnusedBagSteal_Step` @ L291-319

### `battle_anim_fight.c` — 2 manquante(s) (94%)
- `AnimUnusedHumanoidFoot` @ L412-420
- `AnimFistOrFootRandomPos_Step` @ L512-529

### `battle_anim_ice.c` — 2 manquante(s) (94%)
- `AnimUnusedIceCrystalThrow` @ L532-570
- `AnimUnusedIceCrystalThrow_Step` @ L571-591

### `berry.c` — 2 manquante(s) (94%)
- `IsPlayerFacingEmptyBerryTreePatch` @ L1021-1029
- `TryToWaterBerryTree` @ L1030-1037

### `braille.c` — 2 manquante(s) (33%)
- `FontFunc_Braille` @ L20-197
- `DecompressGlyph_Braille` @ L198-208

### `field_effect_helpers.c` — 2 manquante(s) (98%)
- `InitRayquazaForFigure8Anim` @ L1461-1467
- `AnimateRayquazaInFigure8` @ L1468-1509

### `fldeff_rocksmash.c` — 2 manquante(s) (80%)
- `CheckObjectGraphicsInFrontOfPlayer` @ L30-47
- `FieldCallback_RockSmash` @ L144-149

### `heal_location.c` — 2 manquante(s) (33%)
- `GetHealLocationIndexByMap` @ L7-18
- `GetHealLocationByMap` @ L19-28

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

### `clock.c` — 3 manquante(s) (50%)
- `InitTimeBasedEvents` @ L18-25
- `UpdatePerMinute` @ L59-75
- `ReturnFromStartWallClock` @ L76-81

### `list_menu.c` — 3 manquante(s) (94%)
- `ListMenuInitInRect` @ L375-393
- `ChangeListMenuPals` @ L481-490
- `ChangeListMenuCoords` @ L491-499

### `pokemon_animation.c` — 3 manquante(s) (99%)
- `GetSpeciesBackAnimSet` @ L885-910
- `LaunchAnimationTaskForBackSprite` @ L956-978
- `SetSpriteCB_MonAnimDummy` @ L979-983

### `task.c` — 3 manquante(s) (79%)
- `InsertTask` @ L47-83
- `FindFirstActiveTask` @ L124-134
- `GetTaskCount` @ L177-188

### `wild_encounter.c` — 3 manquante(s) (91%)
- `GetFeebasFishingSpotId` @ L90-112
- `FeebasRandom` @ L170-175
- `FeebasSeedRng` @ L176-181

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

### `dma3_manager.c` — 4 manquante(s) (20%)
- `ClearDma3Requests` @ L25-41
- `ProcessDma3Requests` @ L42-97
- `RequestDma3Copy` @ L98-129
- `CheckForSpaceForDma3Request` @ L163-184

### `event_object_lock.c` — 4 manquante(s) (71%)
- `Task_FreezeSelectedObjectAndPlayer` @ L54-71
- `ScriptUnfreezeObjectEvents` @ L99-106
- `UnionRoom_UnlockPlayerAndChatPartner` @ L107-118
- `Task_FreezeObjectAndPlayer` @ L130-150

### `field_special_scene.c` — 4 manquante(s) (69%)
- `TrySetPortholeWarpDestination` @ L281-296
- `Task_HandlePorthole` @ L297-355
- `ShowSSTidalWhileSailing` @ L356-367
- `FieldCB_ShowPortholeView` @ L368-376

### `script_movement.c` — 4 manquante(s) (79%)
- `GetMoveObjectsTaskId` @ L70-74
- `LoadObjectEventIdPtrFromMovementScript` @ L118-126
- `SetObjectEventIdAtMovementScript` @ L127-134
- `ScriptMovement_UnfreezeActiveObjects` @ L182-194

### `battle_anim_effects_1.c` — 5 manquante(s) (97%)
- `AnimWhipHit_WaitEnd` @ L3697-3702
- `AnimFlickeringPunch` @ L3734-3753
- `UnusedFlickerAnim` @ L3854-3886
- `AnimTask_HideBattlersHealthbox` @ L4920-4936
- `AnimTask_ShowBattlersHealthbox` @ L4937-4945

### `field_message_box.c` — 5 manquante(s) (71%)
- `CreateTask_DrawFieldMessage` @ L50-54
- `Task_HidePokenavMessageWhenDone` @ L71-79
- `ForceShowFieldAutoScrollMessage` @ L100-108
- `ExpandStringAndStartDrawFieldMessage` @ L118-124
- `ReplaceFieldMessageWithFrame` @ L150-156

## 🧩 Axe SCRIPTS (.s) — bytecode COMPILÉ (pas cité)

> Les scripts décomp (combat/anim/event/field-effect/ai) sont compilés en masse → `decomp-data/auto-asm-bytecode/`. "Présent" = le label décomp existe dans la sortie compilée.
> ⚠️ Que les OPCODES utilisés soient implémentés est un AUTRE axe : `npm run audit:opcodes` / `audit:specials` / `audit:scrcmd` / `audit:move-effect-scripts`.

| Fichier .s | labels présents/total | % |
|---|---|---|
| `battle_scripts_1.s` | 191/619 | 31% |
| `battle_scripts_2.s` | 0/26 | 0% |
| `battle_anim_scripts.s` | 216/658 | 33% |
| `battle_ai_scripts.s` | 0/555 | 0% |
| `event_scripts.s` | 0/72 | 0% |
| `field_effect_scripts.s` | 0/68 | 0% |

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

