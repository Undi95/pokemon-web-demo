# CARTE DE COUVERTURE 1:1 GLOBALE — décomp `src/*.c` ↔ notre port

Généré : 2026-06-01T19:02:53.284Z

> Signal "couvert" = une citation `1:1 décomp file.c:N` pointe dans la fonction.
> ⚠️ Prouve la COUVERTURE/traçabilité, **PAS le comportement** (bugs runtime = ROM-diff séparé).
> Couverture globale (≥1 fonctions/fichier) : **2778/11228 fonctions** (25%) sur **221 fichiers .c**.
> 7 fichiers 100% · 214 partiels · 0 jamais touchés.

## 🟢 Fichiers 100% couverts (7)

- `battle_anim.c` (79 fn)
- `field_camera.c` (28 fn)
- `pokemon_size_record.c` (12 fn)
- `decoration_inventory.c` (11 fn)
- `mail.c` (10 fn)
- `map_name_popup.c` (7 fn)
- `random.c` (4 fn)

## 🟡 Partiels — triés par # fonctions manquantes (les "presque finis" en bas)

| Fichier | couvert/total | % | manquantes | citations |
|---|---|---|---|---|
| `event_object_movement.c` | 208/785 | 26% | **577** | 373 |
| `pokemon_storage_system.c` | 2/380 | 1% | **378** | 73 |
| `party_menu.c` | 83/354 | 23% | **271** | 245 |
| `field_effect.c` | 8/247 | 3% | **239** | 66 |
| `battle_transition.c` | 14/210 | 7% | **196** | 58 |
| `overworld.c` | 36/227 | 16% | **191** | 133 |
| `battle_script_commands.c` | 98/287 | 34% | **189** | 246 |
| `tv.c` | 22/207 | 11% | **185** | 54 |
| `battle_anim_effects_1.c` | 0/154 | 0% | **154** | 2 |
| `field_player_avatar.c` | 30/177 | 17% | **147** | 72 |
| `battle_anim_effects_3.c` | 0/140 | 0% | **140** | 2 |
| `pokemon_summary_screen.c` | 7/140 | 5% | **133** | 36 |
| `pokedex.c` | 9/140 | 6% | **131** | 75 |
| `field_specials.c` | 61/191 | 32% | **130** | 132 |
| `decoration.c` | 8/135 | 6% | **127** | 28 |
| `battle_anim_effects_2.c` | 0/121 | 0% | **121** | 2 |
| `battle_anim_mons.c` | 7/128 | 5% | **121** | 20 |
| `pokemon.c` | 40/160 | 25% | **120** | 168 |
| `field_weather_effect.c` | 1/106 | 1% | **105** | 6 |
| `menu.c` | 21/123 | 17% | **102** | 76 |
| `battle_ai_script_commands.c` | 15/115 | 13% | **100** | 26 |
| `easy_chat.c` | 148/248 | 60% | **100** | 110 |
| `naming_screen.c` | 17/117 | 15% | **100** | 72 |
| `battle_controller_player_partner.c` | 0/93 | 0% | **93** | 10 |
| `battle_setup.c` | 9/102 | 9% | **93** | 39 |
| `battle_controller_player.c` | 32/124 | 26% | **92** | 68 |
| `battle_controller_wally.c` | 0/82 | 0% | **82** | 5 |
| `scrcmd.c` | 149/231 | 65% | **82** | 253 |
| `battle_controller_opponent.c` | 10/88 | 11% | **78** | 24 |
| `metatile_behavior.c` | 68/144 | 47% | **76** | 230 |
| `field_effect_helpers.c` | 6/81 | 7% | **75** | 18 |
| `battle_controller_safari.c` | 0/73 | 0% | **73** | 2 |
| `rayquaza_scene.c` | 0/72 | 0% | **72** | 41 |
| `daycare.c` | 0/67 | 0% | **67** | 5 |
| `trainer_card.c` | 13/79 | 16% | **66** | 40 |
| `m4a.c` | 7/72 | 10% | **65** | 24 |
| `field_screen_effect.c` | 13/77 | 17% | **64** | 50 |
| `fldeff_misc.c` | 1/62 | 2% | **61** | 29 |
| `main_menu.c` | 23/82 | 28% | **59** | 135 |
| `intro.c` | 12/69 | 17% | **57** | 98 |
| `shop.c` | 0/57 | 0% | **57** | 27 |
| `match_call.c` | 0/56 | 0% | **56** | 13 |
| `bike.c` | 2/56 | 4% | **54** | 5 |
| `battle_gfx_sfx_util.c` | 1/53 | 2% | **52** | 14 |
| `menu_specialized.c` | 5/57 | 9% | **52** | 14 |
| `battle_anim_throw.c` | 27/78 | 35% | **51** | 87 |
| `use_pokeblock.c` | 0/51 | 0% | **51** | 13 |
| `bg.c` | 2/52 | 4% | **50** | 24 |
| `start_menu.c` | 31/80 | 39% | **49** | 55 |
| `battle_anim_water.c` | 0/48 | 0% | **48** | 2 |
| `field_weather.c` | 1/49 | 2% | **48** | 16 |
| `lilycove_lady.c` | 26/72 | 36% | **46** | 54 |
| `hall_of_fame.c` | 0/45 | 0% | **45** | 35 |
| `region_map.c` | 15/60 | 25% | **45** | 60 |
| `item_menu.c` | 79/122 | 65% | **43** | 222 |
| `sprite.c` | 59/102 | 58% | **43** | 255 |
| `battle_anim_utility_funcs.c` | 0/42 | 0% | **42** | 2 |
| `item_use.c` | 32/74 | 43% | **42** | 52 |
| `recorded_battle.c` | 0/42 | 0% | **42** | 9 |
| `sound.c` | 7/47 | 15% | **40** | 30 |
| `text.c` | 13/53 | 25% | **40** | 90 |
| `credits.c` | 0/38 | 0% | **38** | 32 |
| `image_processing_effects.c` | 0/38 | 0% | **38** | 2 |
| `battle_anim_electric.c` | 0/37 | 0% | **37** | 2 |
| `battle_anim_ghost.c` | 0/37 | 0% | **37** | 2 |
| `evolution_graphics.c` | 0/37 | 0% | **37** | 28 |
| `battle_anim_fire.c` | 0/35 | 0% | **35** | 2 |
| `AgbRfu_LinkManager.c` | 0/34 | 0% | **34** | 2 |
| `battle_anim_mon_movement.c` | 0/34 | 0% | **34** | 2 |
| `battle_transition_frontier.c` | 0/34 | 0% | **34** | 14 |
| `trainer_see.c` | 5/39 | 13% | **34** | 24 |
| `string_util.c` | 11/44 | 25% | **33** | 40 |
| `battle_anim_ice.c` | 0/32 | 0% | **32** | 2 |
| `battle_tent.c` | 0/32 | 0% | **32** | 2 |
| `script.c` | 7/39 | 18% | **32** | 17 |
| `battle_anim_fight.c` | 0/31 | 0% | **31** | 2 |
| `battle_anim_flying.c` | 0/31 | 0% | **31** | 2 |
| `battle_records.c` | 0/31 | 0% | **31** | 9 |
| `script_menu.c` | 0/31 | 0% | **31** | 15 |
| `battle_anim_normal.c` | 7/36 | 19% | **29** | 11 |
| `battle_interface.c` | 25/53 | 47% | **28** | 67 |
| `field_tasks.c` | 0/28 | 0% | **28** | 11 |
| `battle_anim_psychic.c` | 0/27 | 0% | **27** | 2 |
| `berry_tag_screen.c` | 0/27 | 0% | **27** | 10 |
| `window.c` | 3/30 | 10% | **27** | 21 |
| `ereader_helpers.c` | 0/26 | 0% | **26** | 2 |
| `battle_anim_dark.c` | 0/25 | 0% | **25** | 2 |
| `battle_anim_ground.c` | 0/25 | 0% | **25** | 2 |
| `battle_controllers.c` | 43/68 | 63% | **25** | 47 |
| `evolution_scene.c` | 0/25 | 0% | **25** | 16 |
| `egg_hatch.c` | 1/25 | 4% | **24** | 17 |
| `save.c` | 11/35 | 31% | **24** | 31 |
| `item.c` | 29/52 | 56% | **23** | 61 |
| `wild_encounter.c` | 12/35 | 34% | **23** | 22 |
| `battle_anim_rock.c` | 0/22 | 0% | **22** | 2 |
| `cable_car.c` | 0/22 | 0% | **22** | 17 |
| `main.c` | 7/29 | 24% | **22** | 36 |
| `trainer_pokemon_sprites.c` | 1/23 | 4% | **22** | 7 |
| `decompress.c` | 0/21 | 0% | **21** | 8 |
| `pokemon_icon.c` | 2/23 | 9% | **21** | 17 |
| `fldeff_flash.c` | 0/20 | 0% | **20** | 18 |
| `minigame_countdown.c` | 0/20 | 0% | **20** | 12 |
| `move_relearner.c` | 0/19 | 0% | **19** | 8 |
| `palette_util.c` | 0/19 | 0% | **19** | 2 |
| `pokedex_area_screen.c` | 0/19 | 0% | **19** | 7 |
| `reset_rtc_screen.c` | 0/19 | 0% | **19** | 14 |
| `field_control_avatar.c` | 23/41 | 56% | **18** | 54 |
| `international_string_util.c` | 0/18 | 0% | **18** | 4 |
| `starter_choose.c` | 0/18 | 0% | **18** | 25 |
| `battle_util.c` | 35/52 | 67% | **17** | 165 |
| `braille_puzzles.c` | 1/18 | 6% | **17** | 7 |
| `menu_helpers.c` | 8/25 | 32% | **17** | 29 |
| `safari_zone.c` | 0/17 | 0% | **17** | 6 |
| `libisagbprn.c` | 0/16 | 0% | **16** | 2 |
| `pokeball.c` | 21/37 | 57% | **16** | 93 |
| `siirtc.c` | 0/16 | 0% | **16** | 3 |
| `agb_flash.c` | 0/15 | 0% | **15** | 12 |
| `battle_anim_sound_tasks.c` | 0/15 | 0% | **15** | 2 |
| `coord_event_weather.c` | 0/14 | 0% | **14** | 2 |
| `event_data.c` | 11/25 | 44% | **14** | 33 |
| `event_object_lock.c` | 0/14 | 0% | **14** | 9 |
| `field_message_box.c` | 3/17 | 18% | **14** | 18 |
| `fldeff_cut.c` | 3/17 | 18% | **14** | 7 |
| `mon_markings.c` | 1/15 | 7% | **14** | 10 |
| `pokedex_cry_screen.c` | 0/14 | 0% | **14** | 6 |
| `title_screen.c` | 6/20 | 30% | **14** | 34 |
| `walda_phrase.c` | 0/14 | 0% | **14** | 6 |
| `battle_anim_bug.c` | 0/13 | 0% | **13** | 2 |
| `intro_credits_graphics.c` | 7/20 | 35% | **13** | 30 |
| `roamer.c` | 0/13 | 0% | **13** | 5 |
| `battle_anim_status_effects.c` | 0/12 | 0% | **12** | 6 |
| `battle_main.c` | 95/107 | 89% | **12** | 263 |
| `gpu_regs.c` | 0/12 | 0% | **12** | 5 |
| `load_save.c` | 9/21 | 43% | **12** | 26 |
| `malloc.c` | 0/12 | 0% | **12** | 6 |
| `palette.c` | 28/40 | 70% | **12** | 89 |
| `rtc.c` | 14/26 | 54% | **12** | 30 |
| `save_failed_screen.c` | 0/12 | 0% | **12** | 11 |
| `task.c` | 2/14 | 14% | **12** | 12 |
| `wireless_communication_status_screen.c` | 0/12 | 0% | **12** | 9 |
| `battle_anim_dragon.c` | 0/11 | 0% | **11** | 2 |
| `ereader_screen.c` | 0/11 | 0% | **11** | 5 |
| `fieldmap.c` | 44/55 | 80% | **11** | 99 |
| `berry_powder.c` | 4/14 | 29% | **10** | 8 |
| `dewford_trend.c` | 3/13 | 23% | **10** | 7 |
| `diploma.c` | 0/10 | 0% | **10** | 8 |
| `fldeff_rocksmash.c` | 0/10 | 0% | **10** | 8 |
| `new_game.c` | 3/13 | 23% | **10** | 12 |
| `util.c` | 1/11 | 9% | **10** | 13 |
| `battle_anim_poison.c` | 0/9 | 0% | **9** | 2 |
| `battle_intro.c` | 2/11 | 18% | **9** | 8 |
| `clear_save_data_screen.c` | 0/9 | 0% | **9** | 9 |
| `math_util.c` | 0/9 | 0% | **9** | 3 |
| `mini_printf.c` | 0/9 | 0% | **9** | 2 |
| `multiboot.c` | 0/9 | 0% | **9** | 2 |
| `wonder_news.c` | 0/9 | 0% | **9** | 3 |
| `battle_bg.c` | 4/12 | 33% | **8** | 27 |
| `confetti_util.c` | 0/8 | 0% | **8** | 2 |
| `fldeff_softboiled.c` | 0/8 | 0% | **8** | 9 |
| `money.c` | 7/15 | 47% | **8** | 25 |
| `save_location.c` | 2/10 | 20% | **8** | 5 |
| `scanline_effect.c` | 1/9 | 11% | **8** | 5 |
| `script_pokemon_util.c` | 5/13 | 38% | **8** | 20 |
| `field_door.c` | 16/23 | 70% | **7** | 90 |
| `player_pc.c` | 78/85 | 92% | **7** | 104 |
| `reshow_battle_screen.c` | 0/7 | 0% | **7** | 6 |
| `script_movement.c` | 12/19 | 63% | **7** | 23 |
| `tileset_anims.c` | 77/84 | 92% | **7** | 81 |
| `battle_ai_switch_items.c` | 7/13 | 54% | **6** | 10 |
| `clock.c` | 0/6 | 0% | **6** | 3 |
| `field_poison.c` | 1/7 | 14% | **6** | 7 |
| `fldeff_escalator.c` | 0/6 | 0% | **6** | 5 |
| `fldeff_sweetscent.c` | 0/6 | 0% | **6** | 2 |
| `item_menu_icons.c` | 15/21 | 71% | **6** | 62 |
| `rotating_gate.c` | 16/22 | 73% | **6** | 43 |
| `rotating_tile_puzzle.c` | 0/6 | 0% | **6** | 4 |
| `time_events.c` | 4/10 | 40% | **6** | 11 |
| `agb_flash_mx.c` | 0/5 | 0% | **5** | 2 |
| `bard_music.c` | 0/5 | 0% | **5** | 3 |
| `dma3_manager.c` | 0/5 | 0% | **5** | 4 |
| `option_menu.c` | 19/24 | 79% | **5** | 45 |
| `battle_util2.c` | 1/5 | 20% | **4** | 3 |
| `berry.c` | 32/36 | 89% | **4** | 96 |
| `blit.c` | 1/5 | 20% | **4** | 4 |
| `coins.c` | 3/7 | 43% | **4** | 10 |
| `dynamic_placeholder_text_util.c` | 0/4 | 0% | **4** | 6 |
| `field_special_scene.c` | 9/13 | 69% | **4** | 22 |
| `fldeff_dig.c` | 0/4 | 0% | **4** | 2 |
| `fldeff_strength.c` | 0/4 | 0% | **4** | 2 |
| `fldeff_teleport.c` | 0/4 | 0% | **4** | 2 |
| `hof_pc.c` | 0/4 | 0% | **4** | 5 |
| `pokedex_area_region_map.c` | 0/4 | 0% | **4** | 2 |
| `pokemon_animation.c` | 237/241 | 98% | **4** | 32 |
| `text_window.c` | 7/11 | 64% | **4** | 26 |
| `battle_anim_smokescreen.c` | 0/3 | 0% | **3** | 6 |
| `braille.c` | 0/3 | 0% | **3** | 2 |
| `field_region_map.c` | 3/6 | 50% | **3** | 20 |
| `gym_leader_rematch.c` | 0/3 | 0% | **3** | 2 |
| `heal_location.c` | 0/3 | 0% | **3** | 3 |
| `list_menu.c` | 45/48 | 94% | **3** | 100 |
| `trig.c` | 1/4 | 25% | **3** | 8 |
| `agb_flash_1m.c` | 0/2 | 0% | **2** | 2 |
| `battle_message.c` | 8/10 | 80% | **2** | 63 |
| `birch_pc.c` | 1/3 | 33% | **2** | 4 |
| `item_icon.c` | 4/6 | 67% | **2** | 13 |
| `landmark.c` | 0/2 | 0% | **2** | 2 |
| `lottery_corner.c` | 6/8 | 75% | **2** | 13 |
| `post_battle_event_funcs.c` | 0/2 | 0% | **2** | 2 |
| `give_gift_ribbon_to_party.c` | 0/1 | 0% | **1** | 2 |
| `mail_data.c` | 11/12 | 92% | **1** | 16 |
| `play_time.c` | 4/5 | 80% | **1** | 10 |
| `reload_save.c` | 0/1 | 0% | **1** | 2 |
| `rom_header_gf.c` | 0/1 | 0% | **1** | 2 |
| `wallclock.c` | 24/25 | 96% | **1** | 61 |

## 🔴 Jamais touchés (0 citation) — triés par taille (0)

| Fichier | fonctions | lignes |
|---|---|---|

## ⭐ "Presque finis" (partiels avec ≤5 fonctions manquantes — candidats clôture rapide)

### `give_gift_ribbon_to_party.c` — 1 manquante(s) (0%)
- `GiveGiftRibbonToParty` @ L14-39

### `mail_data.c` — 1 manquante(s) (92%)
- `DummyMailFunc` @ L132-136

### `play_time.c` — 1 manquante(s) (80%)
- `PlayTimeCounter_Update` @ L36-64

### `reload_save.c` — 1 manquante(s) (0%)
- `ReloadSave` @ L13-31

### `rom_header_gf.c` — 1 manquante(s) (0%)
- `__attribute__` @ L98-176

### `wallclock.c` — 1 manquante(s) (96%)
- `VBlankCB_WallClock` @ L621-627

### `agb_flash_1m.c` — 2 manquante(s) (0%)
- `IdentifyFlash` @ L13-50
- `WaitForFlashWrite_Common` @ L51-87

### `battle_message.c` — 2 manquante(s) (80%)
- `ChooseMoveUsedParticle` @ L2959-2998
- `ChooseTypeOfMoveUsedString` @ L2999-3034

### `birch_pc.c` — 2 manquante(s) (33%)
- `GetPokedexRatingText` @ L24-84
- `ShowPokedexRatingMessage` @ L85-89

### `item_icon.c` — 2 manquante(s) (67%)
- `FreeItemIconTemporaryBuffers` @ L72-77
- `GetItemIconPicOrPalette` @ L160-169

### `landmark.c` — 2 manquante(s) (0%)
- `GetLandmarkName` @ L397-423
- `GetLandmarks` @ L424-447

### `lottery_corner.c` — 2 manquante(s) (75%)
- `GetLotteryNumber` @ L156-164
- `SetLotteryNumber16_Unused` @ L165-169

### `post_battle_event_funcs.c` — 2 manquante(s) (0%)
- `GameClear` @ L12-87
- `SetCB2WhiteOut` @ L88-93

### `battle_anim_smokescreen.c` — 3 manquante(s) (0%)
- `SmokescreenImpact` @ L165-210
- `SpriteCB_SmokescreenImpactMain` @ L211-223
- `SpriteCB_SmokescreenImpact` @ L224-232

### `braille.c` — 3 manquante(s) (0%)
- `FontFunc_Braille` @ L20-197
- `DecompressGlyph_Braille` @ L198-208
- `GetGlyphWidth_Braille` @ L209-213

### `field_region_map.c` — 3 manquante(s) (50%)
- `MCB2_InitRegionMapRegisters` @ L101-123
- `VBCB_FieldUpdateRegionMap` @ L124-130
- `MCB2_FieldUpdateRegionMap` @ L131-139

### `gym_leader_rematch.c` — 3 manquante(s) (0%)
- `UpdateGymLeaderRematch` @ L32-42
- `UpdateGymLeaderRematchFromArray` @ L43-93
- `GetRematchIndex` @ L94-106

### `heal_location.c` — 3 manquante(s) (0%)
- `GetHealLocationIndexByMap` @ L7-18
- `GetHealLocationByMap` @ L19-28
- `GetHealLocation` @ L29-38

### `list_menu.c` — 3 manquante(s) (94%)
- `ListMenuInitInRect` @ L375-393
- `ChangeListMenuPals` @ L481-490
- `ChangeListMenuCoords` @ L491-499

### `trig.c` — 3 manquante(s) (25%)
- `Sin` @ L515-520
- `Cos` @ L521-526
- `Cos2` @ L540-544

### `battle_util2.c` — 4 manquante(s) (20%)
- `AllocateBattleResources` @ L15-49
- `FreeBattleResources` @ L50-76
- `SwitchPartyOrderInGameMulti` @ L109-125
- `BattlePalace_TryEscapeStatus` @ L126-216

### `berry.c` — 4 manquante(s) (89%)
- `ObjectEventInteractionWaterBerryTree` @ L997-1020
- `IsPlayerFacingEmptyBerryTreePatch` @ L1021-1029
- `TryToWaterBerryTree` @ L1030-1037
- `GetBerryCountStringByBerryType` @ L1175-1179

### `blit.c` — 4 manquante(s) (20%)
- `BlitBitmapRect4BitWithoutColorKey` @ L4-8
- `FillBitmapRect4Bit` @ L73-105
- `BlitBitmapRect4BitTo8Bit` @ L106-183
- `FillBitmapRect8Bit` @ L184-210

### `coins.c` — 4 manquante(s) (43%)
- `GetCoins` @ L47-51
- `SetCoins` @ L52-56
- `AddCoins` @ L57-78
- `RemoveCoins` @ L79-89

### `dynamic_placeholder_text_util.c` — 4 manquante(s) (0%)
- `DynamicPlaceholderTextUtil_Reset` @ L8-14
- `DynamicPlaceholderTextUtil_SetPlaceholderPtr` @ L15-22
- `DynamicPlaceholderTextUtil_ExpandPlaceholders` @ L23-44
- `DynamicPlaceholderTextUtil_GetPlaceholderPtr` @ L45-49

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

### `hof_pc.c` — 4 manquante(s) (0%)
- `AccessHallOfFamePC` @ L14-19
- `ReturnFromHallOfFamePC` @ L20-25
- `ReshowPCMenuAfterHallOfFamePC` @ L26-35
- `Task_WaitForPaletteFade` @ L36-41

### `pokedex_area_region_map.c` — 4 manquante(s) (0%)
- `LoadPokedexAreaMapGfx` @ L17-47
- `TryShowPokedexAreaMap` @ L48-60
- `FreePokedexAreaMapBgNum` @ L61-65
- `PokedexAreaMapChangeBgY` @ L66-70

### `pokemon_animation.c` — 4 manquante(s) (98%)
- `MonAnimDummySpriteCallback` @ L864-867
- `SetPosForRotation` @ L868-884
- `LaunchAnimationTaskForBackSprite` @ L956-978
- `SetSpriteCB_MonAnimDummy` @ L979-983

### `text_window.c` — 4 manquante(s) (64%)
- `LoadWindowGfx` @ L104-109
- `DrawTextBorderInner` @ L133-150
- `rbox_fill_rectangle` @ L151-161
- `LoadUserWindowBorderGfxOnBg` @ L193-198

### `agb_flash_mx.c` — 5 manquante(s) (0%)
- `EraseFlashChip_MX` @ L54-76
- `EraseFlashSector_MX` @ L77-120
- `ProgramFlashByte_MX` @ L121-145
- `ProgramByte` @ L146-155
- `ProgramFlashSector_MX` @ L156-194

### `bard_music.c` — 5 manquante(s) (0%)
- `BardSoundTemplate` @ L33-120
- `STATIC_ASSERT` @ L121-186
- `GetWordPitch` @ L187-191
- `GetWordSoundTemplates` @ L192-222
- `CalcWordSounds` @ L223-248

### `dma3_manager.c` — 5 manquante(s) (0%)
- `ClearDma3Requests` @ L25-41
- `ProcessDma3Requests` @ L42-97
- `RequestDma3Copy` @ L98-129
- `RequestDma3Fill` @ L130-162
- `CheckForSpaceForDma3Request` @ L163-184

### `option_menu.c` — 5 manquante(s) (79%)
- `VBlankCB` @ L145-151
- `Task_OptionMenuFadeIn` @ L258-263
- `Task_OptionMenuProcessInput` @ L264-350
- `Task_OptionMenuSave` @ L351-363
- `Task_OptionMenuFadeOut` @ L364-373

