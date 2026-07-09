# AUDIT BALAYEUR 1:1 — le RESTE (agent de couverture finale)

> Mission : garantir que **TOUS** les `.c` de la décomp sont couverts (par un domaine de la flotte, par moi, ou exempts).
> Décomp = source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/**` (le `gflib` est fusionné dans `src/` : bg.c, blit.c, io_reg.c, malloc.c, sprite.c, string_util.c, text.c, window.c).
> **Énumération : 310 `.c` au total, correspondance EXACTE avec `cartograph.json` (310).** Aucun `.c` dans `src/data/`. Pas de `gflib/*.c` séparé.
> READ-ONLY. Aucun fichier de code modifié.

## RÉPARTITION
- **Couverts par la flotte (12 domaines)** : 202 `.c` (dont tous les `battle_*.c` et `fldeff_*.c`).
- **[BALAYEUR] (mon lot)** : 109 `.c`.

---

## ÉNUMÉRATION COMPLÈTE (310 .c)

### Couverts par la flotte — 202 (NON ré-audités)
`pokemon-core` pokemon, pokemon_animation, trainer_pokemon_sprites, pokemon_icon, pokemon_size_record, daycare, evolution_scene, evolution_graphics, mon_markings, pokedex, pokedex_area_screen, pokedex_cry_screen
`party-summary` party_menu, pokemon_summary_screen, pokemon_storage_system
`field-movement` event_object_movement, field_player_avatar, field_effect, field_effect_helpers, **tous fldeff_*** (cut, dig, escalator, flash, misc, rocksmash, softboiled, strength, sweetscent, teleport), bike, metatile_behavior, trainer_see, faraway_island, event_object_lock
`overworld-map` overworld, fieldmap, field_camera, field_tasks, field_screen_effect, field_control_avatar, field_door, field_weather, field_weather_effect, map_name_popup, heal_location, tileset_anims, cable_club, region_map
`script-vm` script, scrcmd, field_specials, event_data, script_movement, script_menu, script_pokemon_util, coord_event_weather, mystery_event_script
`ui-menus` window, text, string_util, dynamic_placeholder_text_util, menu, menu_helpers, menu_specialized, text_window, list_menu, item_menu, item_menu_icons, shop, mail, easy_chat, naming_screen, option_menu, money, coins, start_menu
`battle-inventaire` **tous battle_*** (~60 fichiers), pokeball, reshow_battle_screen, recorded_battle, safari_zone
`gfx-substrat` sprite, bg, gpu_regs, dma3_manager, malloc, blit, io_reg, palette, decompress, scanline_effect
`save-data` load_save, new_game, play_time, save, clear_save_data_screen, save_failed_screen, reset_save_heap, main, save_location, reload_save, reset_rtc_screen
`items-berry-smallc` item, item_use, item_icon, berry_powder, berry, berry_tag_screen, pokeblock, use_pokeblock, pokeblock_feed, tv, mauville_old_man, lilycove_lady, dewford_trend, lottery_corner, field_poison, diploma, trainer_card, decoration, decoration_inventory, secret_base, player_pc, roulette, slot_machine, contest, contest_util, contest_effect, contest_painting, contest_ai
`intro-title-menu` intro, title_screen, main_menu, intro_credits_graphics, starter_choose, credits, hall_of_fame, mystery_gift_menu, berry_fix_program, multiboot, wallclock

### [BALAYEUR] — 109 (mon lot, ci-dessous)
AgbRfu_LinkManager, agb_flash, agb_flash_1m, agb_flash_le, agb_flash_mx, anim_mon_front_pics, apprentice, bard_music, berry_blender, berry_crush, berry_fix_graphics, birch_pc, braille, braille_puzzles, cable_car, clock, confetti_util, contest_link, contest_link_util, data, digit_obj_util, dodrio_berry_picking, egg_hatch, ereader_helpers, ereader_screen, field_message_box, field_region_map, field_special_scene, fonts, frontier_pass, frontier_util, give_gift_ribbon_to_party, graphics, gym_leader_rematch, hof_pc, image_processing_effects, international_string_util, landmark, libisagbprn, librfu_intr, librfu_rfu, librfu_sio32id, librfu_stwi, link, link_rfu_2, link_rfu_3, m4a, m4a_tables, mail_data, match_call, math_util, mini_printf, minigame_countdown, mirage_tower, move_relearner, mystery_event_menu, mystery_event_msg, mystery_gift, mystery_gift_client, mystery_gift_link, mystery_gift_scripts, mystery_gift_server, mystery_gift_view, palette_util, pokedex_area_region_map, pokemon_jump, pokenav(×14), post_battle_event_funcs, random, rayquaza_scene, record_mixing, roamer, rom_header_gf, rotating_gate, rotating_tile_puzzle, rtc, siirtc, sound, strings, task, text_input_strings, tilesets, time_events, trade, trader, trainer_hill, trig, union_room(×4), util, walda_phrase, wild_encounter, wireless_communication_status_screen, wonder_news

---

## AUDIT — profondeur A (cœur solo, corps comparé)

### random.c → src/random.ts  [A]
Statut : ✅ MIROIR
Fonctions : 4/4 (Random, SeedRng, SeedRng2, Random2) + globals gRngValue/gRng2Value/sUnknown/sRandCount.
Notes : Bug RNG Émeraude reproduit 1:1 (pas de SeedRngWithRtc → seed=0 au boot). Masquages u16/u32 explicites. Parfait.

### trig.c → src/trig.ts  [A]
Statut : ✅ MIROIR
Fonctions : 4/4 (Sin, Cos, Sin2, Cos2) + tables gSineTable (320 entrées Q8.8) / atan.
Notes : rien à porter de plus, tables + 4 helpers.

### math_util.c → src/math_util.ts  [A]
Statut : ✅ MIROIR
Fonctions : 9/9 (Mul16/Mul16Shift/Mul32, Div16/Div16Shift/Div32, Inv16/Inv16Shift/Inv32). Signatures et ordre identiques.

### task.c → src/task.ts + substrat runtime  [A]
Statut : ✅ MIROIR (via substrat)
Fonctions : 14/14. src/task.ts = API 1:1-nommée publique (CreateTask, DestroyTask, SetTaskFuncWithFollowupFunc, SwitchTaskToFollowupFunc). L'ORDONNANCEUR lui-même (ResetTasks, RunTasks, InsertTask, FindFirstActiveTask, FuncIsActiveTask, FindTaskIdByFunc, GetTaskCount, SetWordTaskArg, GetWordTaskArg, TaskDummy) vit sur le substrat `harness/runtime/decomp-globals.ts` + `decomp-runtime.ts` (gTasks = Map runtime). Pattern substrat assumé et documenté dans l'en-tête. Aucun no-op silencieux.

### util.c → src/util.ts (+ substrats)  [A]
Statut : 🟡 PARTIEL (par design de substrat)
Fonctions : 7/11 dans util.ts (gBitTable, StoreWordInTwoHalfwords, LoadWordFromTwoHalfwords, CountTrailingZeroBits, CalcCRC16, CalcCRC16WithTable, CalcByteArraySum).
Ailleurs (leafs graphiques, consolidation documentée en tête de util.ts) : `CreateInvisibleSpriteWithCallback` → sprite.ts · `SetBgAffineStruct`/`DoBgAffineSet` → BgAffineSet (bg) · `CopySpriteTiles` → CpuCopy32/tiles · `BlendPalette` → palette.ts (gPlttBuffer). Rien de silencieusement absent : la localisation de chaque leaf est écrite dans util.ts:108-109. ✅ acceptable.

### clock.c → src/clock.ts (+ wallclock.ts)  [A]
Statut : ✅ MIROIR (consolidation)
Fonctions : 6/6. `DoTimeBasedEvents` porté avec `UpdatePerDay`/`UpdatePerMinute` inlinés (clock.ts:48-68, ordre 1:1). `StartWallClock`/`ReturnFromStartWallClock` → src/wallclock.ts (couvert intro-title-menu). `InitTimeBasedEvents` (static, un seul appel) fondu dans le flux new-game. Aucun stub.

### time_events.c → src/time_events.ts  [A]
Statut : ✅ MIROIR (auto-documenté #100% 10/10)
Fonctions : 10/10 (GetMirageRnd, SetMirageRnd, InitMirageRnd, UpdateMirageRnd, IsMirageIslandPresent, UpdateShoalTideFlag, Task_WaitWeather, WaitWeather, InitBirchState, UpdateBirchState). LCG ISO_RANDOMIZE2, masquages u16 corrects. Excellent.

### rtc.c → src/rtc.ts  [A]
Statut : ✅ MIROIR (impl GPIO hardware-exemptée)
Fonctions : ~25/27 (les 2 "manquantes" au grep sont en fait présentes : ConvertBcdToBinary/RtcGetInfo/RtcGetRawInfo/RtcCheckInfo/RtcCalcTimeDifference/RtcInitLocalTimeOffset toutes dans rtc.ts). RtcDisableInterrupts/RtcRestoreInterrupts = no-op explicite (REG_IME absent navigateur, commenté). Format*Time UNUSED décomp → non nécessaires. API 1:1 complète, source du temps = Date navigateur (adaptation hardware assumée).

### mail_data.c → src/mail_data.ts  [A]
Statut : ✅ MIROIR
Fonctions : 11/11 (ClearAllMail, ClearMail, MonHasMail, GiveMailToMonByItemId, SpeciesToMailSpecies, MailSpeciesToSpecies, GiveMailToMon, TakeMailFromMon, ClearMailItemId, TakeMailFromMonAndSave, ItemIsMail). DummyMailFunc UNUSED omis. Constantes mail 1:1. Excellent.

### wild_encounter.c → src/wild_encounter.ts  [A]
Statut : 🟡 PARTIEL
Fonctions : 18/35. Cœur encounter porté (RollWildMonSpecies, StandardWildEncounter, DoWildBattle…). Manquantes : le système **roamer** (TryStartRoamerEncounter) explicitement noté "Dette R3 : roamer non porté" (wild_encounter.ts:816,918). Voir roamer.c ci-dessous.

### sound.c → src/sound.ts (+ substrat decomp-globals)  [A]
Statut : 🟡 PARTIEL — 🩸 API DISPERSÉE + src/sound.ts quasi-vide
Fonctions : ~32/47 présentes MAIS **pas dans src/sound.ts** (qui n'a que 3 exports : PlayBGM, IsStereoSound, SetPokemonCryStereo). Le vrai foyer de l'API son est `harness/runtime/decomp-globals.ts` (PlaySE, PlayFanfare, PlayBGM, WaitFanfare, IsFanfareTaskInactive, IsCryFinished, FadeInBGM, PlayNewMapMusic, GetCurrentMapMusic, FadeOutMapMusic, PlayCry_*, IsSEPlaying, IsBGMPlaying, IsSpecialSEPlaying, etc.).
Manquantes (~15) : InitMapMusic, MapMusicMain, FadeOutAndFadeInNewMapMusic, IsNotWaitingForBGMStop, StopFanfareByFanfareNum, FadeInNewBGM, FadeOutBGMTemporarily, IsBGMPausedOrStopped, IsBGMStopped, PlayCry_DuckNoRestore, PlayCry_Script, StopCry, PlaySE2WithPanning.
Divergence doctrine : le son est hardware-exempté (impl m4a exemptée, OK), MAIS le miroir 1:1-nommé de l'API devrait être `src/sound.ts` — il est éclaté dans le substrat harness et `src/sound.ts` est un shim trompeusement mince. À consolider (levier moyen : c'est du renommage/déplacement, pas du portage).

### international_string_util.c → src/international_string_util.ts  [A]
Statut : 🟡 PARTIEL (fort trou)
Fonctions : 4/18. Présentes : PadNameString (intl_string_util.ts) · GetStringCenterAlignXOffset, GetStringRightAlignXOffset (→ text.ts) · ConvertInternationalPlayerName (→ mail.ts).
Manquantes (14) : GetStringCenterAlignXOffsetWithLetterSpacing, GetStringWidthDifference, **GetMaxWidthInMenuTable**, **GetMaxWidthInSubsetOfMenuTable**, Intl_GetListMenuWidth, CopyMonCategoryText, **GetStringClearToWidth**, ConvertInternationalPlayerNameStripChar, ConvertInternationalContestantName, TVShowConvertInternationalString, GetNicknameLanguage, **FillWindowTilesByRow**, **StringAppendWithPlaceholder**, GetTrainerClassNameGenderSpecific.
Impact solo : GetMaxWidthInMenuTable / GetStringClearToWidth / FillWindowTilesByRow sont utilisés par les systèmes menu/list — probablement contournés par des équivalents ad-hoc dans menu.ts/list_menu.ts. Levier moyen.

### field_message_box.c → src/field_message_box.ts  [A]
Statut : ✅ MIROIR (API publique)
Fonctions : 9 publiques présentes (InitFieldMessageBox, ShowFieldMessage, IsFieldMessageBoxHidden, HideFieldMessageBox, GetFieldMessageBoxMode, StopFieldMessage, ShowFieldMessageFromBuffer, + TickFieldMessageBox/GetCurrentFieldMessageText adaptations). Les internes tasks/printer (17 total décomp) sont sur le substrat. Bon.

### field_special_scene.c → src/field_special_scene.ts  [A]
Statut : 🟡 PARTIEL
Fonctions : ~2/13 publiques (ExecuteTruckSequence, EndTruckSequence — séquence camion d'intro). Task_HandleTruckSequence/porthole (SS Tidal), etc. — reste = scènes spéciales secondaires. La scène camion (intro new-game) est le morceau solo-critique et il est porté.

### give_gift_ribbon_to_party.c → src/give_gift_ribbon_to_party.ts  [A]
Statut : ✅ MIROIR — 1/1 (GiveGiftRibbonToParty).

---

## AUDIT — profondeur A (ABSENT / STUB solo-vivant — à porter)

### braille.c → 🔴 STUB (scrcmd.ts)  [A]
Statut : 🔴 DIVERGENT (no-op honnête)
Fonctions : 0/3 (FontFunc_Braille, DecompressGlyph_Braille, GetGlyphWidth_Braille).
Preuve : `scrcmd.ts:498 ScrCmd_braillemessage = (ctx) => { ScriptReadWord(ctx); return false; }` — parse le pointeur, n'affiche RIEN. `text.ts:406` : "GetGlyphWidth_Braille non porté ; FONT_BRAILLE jamais mesuré". Font braille non extraite.
Impact solo : Cavernes Regi / Chambre Scellée affichent du braille → puzzles Regirock/Regice/Registeel + Relicanth/Wailord illisibles. Levier moyen-élevé (font + 3 fns).

### braille_puzzles.c → 🔴 majoritairement STUB (specials-registry)  [A]
Statut : 🔴 DIVERGENT
Fonctions : ~1/18. Porté 1:1 : `CheckRelicanthWailord` (specials-registry.ts:2391, braille_puzzles.c:92). Stub `()=>0` : ShouldDoBrailleRegicePuzzle. Absents : ShouldDoBrailleDigEffect, DoBrailleDigEffect, DoSealedChamberShakingEffect_Long/Short, ShouldDoBrailleRegirock/Registeel Effect, SetUpPuzzleEffectRegirock/Registeel, UseRegirockHm/RegisteelHm_Callback, FldEff_UsePuzzleEffect…
Impact solo : ouverture des cavernes légendaires Regi + Île Antique (Dig). Dépend de braille.c. Levier élevé (contenu légendaire majeur).

### roamer.c → 🔴 ABSENT  [A]
Statut : ⬜ ABSENT
Fonctions : 0/13 (ClearRoamerData, InitRoamer, CreateInitialRoamerMon, RoamerMove, IsRoamerAt, CreateRoamerMonInstance, TryStartRoamerEncounter, UpdateRoamerHPStatus, GetRoamerLocation…).
Preuve : wild_encounter.ts:816/918 "Dette R3 : TryStartRoamerEncounter (roamer non porté)".
Impact solo : Latios/Latias errant après le post-game (rencontre roamer). Levier moyen (fonctionnalité isolée, 13 fns bornées, pas d'UI).

### match_call.c → 🔴 ABSENT  [A→B]
Statut : ⬜ ABSENT (0 fragment dans le repo)
Fonctions : 0/56. Système d'appels Pokénav (rematchs dresseurs, ratings Pokédex, streaks). Gros (2112 l).
Impact solo : dépend du Pokénav (lui-même absent, voir §B). Bloc complet à porter avec pokenav. Levier faible tant que Pokénav absent.

### mirage_tower.c → 🟡 PARTIEL (specials-registry, dette graphique)  [A]
Statut : 🟡 PARTIEL
Fonctions : ~1/29. `SetMirageTowerVisibility` porté partiellement (specials-registry.ts:1766) avec "Dette R3 : TryStartMirageTowerPulseBlendEffect". Start*/Do* (disintegration, shake, fossil fall, ceiling crumble) = stubs `()=>0` (liste 2157-2158). IsMirageTowerVisible via visibilité.
Impact solo : Tour Mirage (Route 111 → fossile Racine/Griffe). Visibilité OK, effets d'effondrement absents. Levier moyen.

### birch_pc.c → 🟡 PARTIEL (specials-registry)  [A]
Statut : 🟡 PARTIEL
Fonctions : 1/3. `ScriptGetPokedexInfo` porté 1:1 (specials-registry.ts:1724). GetPokedexRatingText / ShowPokedexRatingMessage stubbés (`()=>0`, liste 2149).
Impact solo : évaluation Pokédex par le Prof. Birch (PC). Faible-moyen.

### rotating_gate.c → src/rotating_gate.ts  [A]
Statut : 🟡 PARTIEL (logique portée, sprites Phaser = dette assumée)
Fonctions : logique de puzzle portée (GetCurrentMapRotatingGatePuzzleType, RotatingGate_LoadPuzzleConfig, ResetAllGateOrientations, CheckForRotatingGatePuzzleCollision[WithoutAnimation], RotatingGate_InitPuzzle, InitPuzzleAndGraphics). Dette R4 documentée : CreateGatesWithinViewport / DestroyGatesOutsideViewport / SpriteCallback (= sprites Phaser) non portés → gates invisibles mais collision/rotation fonctionnelle.
🩸 Note clobber : RotatingGate_InitPuzzle/InitPuzzleAndGraphics sont AUSSI dans le stub-loop `()=>0` (specials-registry.ts:1416). Les vrais exports rotating_gate.ts doivent gagner — à vérifier via l'ordre de registration (cf. pitfall-special-stub-loop-clobber). Levier moyen (puzzle Fortree/Ile).

### post_battle_event_funcs.c → 🔴 STUB (specials-registry)  [A]
Statut : 🔴 DIVERGENT
Fonctions : 0/2 (GameClear, SetCB2WhiteOut) — tous deux dans stub-loop `()=>0` (1415, 2112).
Impact solo : `GameClear` = séquence Hall of Fame / crédits / sauvegarde post-Ligue (special appelé à la victoire finale). C'est le point d'entrée du Hall of Fame après la Ligue — potentiellement bloquant pour le end-game. Levier ÉLEVÉ (petite fn, effet majeur : end-game).

### gym_leader_rematch.c → 🔴 ABSENT  [A]
Statut : ⬜ ABSENT
Fonctions : 0/3 (UpdateGymLeaderRematch…). Noté "TryUpdateGymLeaderRematchFromWild/Trainer non portés" (battle-setup-helpers.ts:251,274).
Impact solo : rematchs des Champions d'Arène via Pokénav (post-game). Dépend Pokénav. Faible.

### egg_hatch.c → 🔴 STUB (specials-registry)  [A]
Statut : 🔴 DIVERGENT
Fonctions : 0/25. EggHatch / ScriptHatchMon dans stub-loop `()=>0` (1974, 2099).
Impact solo : éclosion des œufs (Pension). L'œuf peut être obtenu (daycare porté) mais **l'éclosion — scène + création du mon — est un no-op**. Levier ÉLEVÉ (mécanique d'élevage cœur, scène dédiée).

### move_relearner.c → 🔴 STUB (specials-registry)  [A]
Statut : 🔴 DIVERGENT
Fonctions : 0/19. ChooseMonForMoveRelearner / TeachMoveRelearnerMove dans stub-loop (1947, 2165).
Impact solo : Maître des Capacités (Fallarbor). Levier moyen (écran dédié).

### cable_car.c → 🔴 STUB (specials-registry)  [A]
Statut : 🔴 DIVERGENT
Fonctions : 0/22. CableCar / CableCarWarp dans stub-loop `()=>0` (1421). (Le fichier `harness/m4a/voicegroups-data/cable_car.ts` est de la DATA audio homonyme — sans rapport.)
Impact solo : téléphérique Mt. Chimney (accès aux deux versants). Levier moyen (scène animée + warp).

### hof_pc.c → 🔴 STUB (specials-registry)  [A]
Statut : 🔴 DIVERGENT
Fonctions : 0/4. AccessHallOfFamePC dans stub-loop `()=>0` (1909).
Impact solo : revoir son Hall of Fame depuis le PC. Faible.

### confetti_util.c → ⬜ ABSENT  [A]
Statut : ⬜ ABSENT — 0/8. Seul appelant = hall_of_fame.c (SOLO). Confettis de la scène Hall of Fame non portés. Faible (cosmétique).

### bard_music.c → ⬜ ABSENT  [A]
Statut : ⬜ ABSENT — 0/5. Appelé par easy_chat.c (chanson du Barde / Mauville old man). Génère la mélodie à partir des mots Easy Chat. Faible (cosmétique audio, son exempté de toute façon).

### palette_util.c → ⬜ ABSENT  [A]
Statut : ⬜ ABSENT — 0/19 (PaletteStruct fade API). Appelants : battle_anim (PAUSE), mirage_tower (pulse-blend = dette déjà notée), roulette (minigame). Solo-pertinent uniquement via mirage_tower pulse-blend. Faible.

---

## INVENTAIRE LÉGER — profondeur B (gros systèmes solo/mixtes, non portés)

### Pokénav (14 fichiers, ~583 fns) → ⬜ ABSENT (0 fragment)
`pokenav.c(28)` core state-machine · `pokenav_main_menu.c(46)` + `pokenav_menu_handler.c(27)` + `pokenav_menu_handler_gfx.c(56)` menu principal · `pokenav_list.c(47)` widget liste générique · `pokenav_match_call_data.c(59)` + `pokenav_match_call_gfx.c(65)` + `pokenav_match_call_list.c(29)` (+ `match_call.c` 56) cluster Match Call · `pokenav_conditions.c(32)` + `pokenav_conditions_gfx.c(29)` + `pokenav_conditions_search_results.c(36)` cluster Condition/Concours · `pokenav_region_map.c(37)` carte régionale Pokénav · `pokenav_ribbons_list.c(37)` + `pokenav_ribbons_summary.c(56)` cluster Rubans.
Statut : **système entier absent** (~639 fns avec match_call). Solo-pertinent (Pokénav = objet clé solo : carte, rubans, condition, appels). Chantier XL — porter comme un domaine dédié, pas en balayage. Clusters bien découpés.

### Berry Blender (berry_blender.c, 81 fns) → ⬜ ABSENT
Statut : ABSENT. Note user : le mode SOLO avec PNJ existe (mélangeur à baies de Slateport avec 3 PNJ). Solo-jouable en principe → à porter pour la complétude Pokéblocks. Levier moyen, effort L.

### frontier_util.c (93) + frontier_pass.c (~40) → 🔴 quasi-STUB (specials-registry)
Statut : ABSENT/stub. Frontier BP/streaks/brain via specials stubbés. Battle Frontier = post-game massif, dépend des installations (battle_dome/factory/pike/etc. = PAUSE combat). Faible priorité solo.

### apprentice.c (53) → ⬜ ABSENT
Statut : ABSENT. Apprenti du Battle Tower (mixte link/solo record-mixing). Faible priorité.

### trainer_hill.c (60) → src/trainer_hill.ts (existe)
Statut : 🟡 à vérifier — homonyme présent. Battle Frontier annexe. Faible priorité solo.

### trade.c (134) → ⬜ ABSENT
Statut : ABSENT. Écran d'échange. Le trade in-game (PNJ) est solo-pertinent (échanges scénarisés) ; le trade link est exempt. Gros fichier mixte. Effort L.

### record_mixing.c (43) → ⬜ ABSENT
Statut : ABSENT — link (mélange d'enregistrements). Solo-irrelevant. Proche-exempt.

### Mystery Gift (mystery_gift.c 45 + client 18 + server 15 + link 10 + view 19) → ⬜ ABSENT
Statut : ABSENT. Distribution de cadeaux — nécessite link/wireless. Quasi-exempt (mystery_gift_menu.c est couvert intro-title-menu ; le reste = transport link). Faible.

### Link minigames → ⬜ ABSENT (proche-exempt)
`dodrio_berry_picking.c(169)`, `pokemon_jump.c(178→ homonyme pokemon_jump.ts existe)`, `berry_crush.c(76)` : cueillette Dodrio / saut Pokémon / concassage baies = **minijeux link uniquement** (wireless club). Solo-irrelevant → proche-exempt. (pokemon_jump.ts est un shim.)

### digit_obj_util.c(14) / minigame_countdown.c(20) → ⬜ ABSENT (proche-exempt)
Appelants exclusifs = link minigames (berry_crush, dodrio, pokemon_jump). Solo-irrelevant.

### image_processing_effects.c(38) → ⬜ ABSENT
Appelant exclusif = contest_painting (peinture concours). Solo-pertinent uniquement pour la peinture de concours. Faible.

### rotating_tile_puzzle.c(6) → ⬜ ABSENT
Puzzle des dalles rotatives (Trick House / Mossdeep gym annexe). Solo-pertinent, petit (6 fns). Levier faible, effort S.

### field_region_map.c(6) → ⬜ ABSENT
Carte régionale de terrain (mur des salles). Petit. Faible.

### trader.c(13) → ⬜ ABSENT
Échangeur de décorations (secret base decorations). Solo-pertinent (lié secret_base, couvert). Petit. Faible.

### pokedex_area_region_map.c(4) → ⬜ ABSENT
Sous-carte du Pokédex "zone". Lié pokedex_area_screen (couvert pokemon-core). Petit.

### wireless_communication_status_screen.c(12) / wonder_news.c(9) / contest_link.c(17) / contest_link_util.c(12) → ⬜ ABSENT
Tous link/wireless. Proche-exempt (le contest SOLO est couvert par contest.c/contest_util.c).

---

## EXEMPT — profondeur C (🚫, justification, pas d'audit)

- 🚫 **link.c** → src/link.ts (shim 1 fn IsWirelessAdapterConnected=false). Le link multi réel = exempt (moteur web solo). Correct.
- 🚫 **link_rfu_2.c, link_rfu_3.c, AgbRfu_LinkManager.c** — pilote wireless RFU. Hardware réseau, exempt.
- 🚫 **librfu_intr.c, librfu_rfu.c, librfu_sio32id.c, librfu_stwi.c** — lib RFU bas niveau (SIO/interruptions). Hardware, exempt.
- 🚫 **union_room.c(111), union_room_chat.c(124), union_room_battle.c(5), union_room_player_avatar.c(38)** — salle de l'union (wireless club). Exempt (link).
- 🚫 **m4a.c(1781), m4a_tables.c** — moteur audio GBA. Son hardware-exempté (version propre). Exempt.
- 🚫 **agb_flash.c, agb_flash_1m.c, agb_flash_le.c, agb_flash_mx.c** — pilote FLASH (save). Hardware save-exempté. Exempt.
- 🚫 **siirtc.c(15 fns GPIO)** — pilote RTC S-3511A (GPIO bit-banging). Hardware RTC-exempté ; l'API rtc.c au-dessus est portée (voir §A rtc). Exempt.
- 🚫 **libisagbprn.c, mini_printf.c(9)** — debug print AGB (no$gba/mgba console). Hardware debug, exempt.
- 🚫 **ereader_helpers.c, ereader_screen.c** — e-Reader (accessoire card scan). Hardware exempt.
- 🚫 **mystery_event_menu.c(9), mystery_event_msg.c(0)** — Mystery Event (link/e-reader transport). Exempt (le script mystery_event_script.c est couvert script-vm).
- 🚫 **berry_fix_graphics.c(0)** — assets du programme Berry Fix (berry_fix_program.c couvert). Data, exempt.

## DATA (pas des .c logiques — marqués pour complétude, hors portage logique)

- **data.c** — tables SpriteFrameImage battler + graphics. DATA.
- **graphics.c(1043 INCGFX)** — déclarations d'assets graphiques. DATA / glue harness.
- **strings.c(~1771 tables)** → src/strings.ts = sous-ensemble curaté (6 exports) ; le reste des chaînes est distribué (contest_strings.ts, battle_message, etc.). DATA.
- **tilesets.c** — pur `#include data/tilesets/*`. DATA.
- **anim_mon_front_pics.c(0)** — INCGFX sprites front. DATA.
- **text_input_strings.c(0)** — tables clavier Easy Chat / naming. DATA.
- **mystery_gift_scripts.c(0)** — tables de chaînes Mystery Gift. DATA.
- **fonts.c(8)** — tables de glyphes de fonte (données de fonte + accès). DATA (les fontes rendues vivent dans text.ts/window.ts). ⚠ FontFunc entries potentiellement pertinentes mais rendu de texte = couvert ui-menus.
- **landmark.c(45→2 pub)** — GetLandmarkName + tables de landmarks (noms de lieux carte). Majoritairement DATA ; GetLandmarkName utilisé par region_map (couvert). À vérifier côté region_map.
- **rom_header_gf.c** — struct GFRomHeader (API externe PKHex/Colosseum). ROM-layout, 0 effet gameplay. 🚫 exempt.
- **rayquaza_scene.c(3190/~120 fns)** — cinématique Rayquaza (Grotte Céleste, réveil). ⚠ **PAS de la data** : vraie cinématique solo (scène scriptée légendaire). Classée ici par erreur de taille — en réalité ⬜ ABSENT, solo-pertinent (Épisode Delta / réveil Rayquaza). Levier moyen, effort L. À porter comme scène dédiée.
- **landmark.c** — GetLandmarkName ABSENT du repo (0 fragment). Tables de landmarks + noms de lieux affichés sur la carte régionale (region_map couvert mais sans les landmark names). 🟡 gap léger : les libellés de lieux sous la carte. Petit, effort S.

---

## TOP 5 (levier × effort — les plus rentables à porter)

1. **egg_hatch.c** — 🔴 STUB. `EggHatch`/`ScriptHatchMon` = `()=>0`. La Pension donne l'œuf (daycare porté) mais l'éclosion (scène + création du mon éclos) ne fait RIEN → boucle d'élevage cassée. **Effort M**, levier ÉLEVÉ. Oracle : Pension Route 117 → récupérer œuf → marcher → éclosion doit jouer la scène et ajouter le mon.
2. **post_battle_event_funcs.c `GameClear`** — 🔴 STUB. Special appelé à la victoire finale de la Ligue → déclenche Hall of Fame + sauvegarde + crédits. **Effort S** (2 fns), levier ÉLEVÉ (débloque tout le end-game). Oracle : battre le Maître → GameClear → Hall of Fame + retour titre.
3. **braille.c + braille_puzzles.c** — 🔴 STUB. Font braille no-op + puzzles Regi/Sealed Chamber absents. **Effort M** (font + ~18 fns bornées), levier ÉLEVÉ (accès aux 3 Regis + Île Antique = contenu légendaire). Oracle : Chambre Scellée → braille lisible ; grotte Regirock → Dig au bon endroit ouvre la porte.
4. **roamer.c** — ⬜ ABSENT. 13 fns bornées, zéro UI, isolé (Latios/Latias errant). **Effort S-M**, levier moyen. Oracle : post-game, TryStartRoamerEncounter déclenche la rencontre du légendaire volant sur la carte.
5. **sound.c → src/sound.ts (consolidation)** — 🟡 API son 1:1 éclatée dans `harness/runtime/decomp-globals.ts` ; `src/sound.ts` est un shim mensongèrement mince. **Effort S-M** (déplacement/renommage, pas du portage — le son reste hardware-exempté), levier moyen (fidélité doctrine miroir + rend le fichier honnête). Oracle : audit `grep` — les fns de sound.c doivent vivre dans src/sound.ts.

**Mentions** : cable_car (Mt. Chimney, scène+warp, M), move_relearner (Fallarbor, écran, M), rayquaza_scene (réveil Rayquaza, L), berry_blender (mode solo PNJ, L), Pokénav+match_call (domaine XL dédié — hors balayage).

---

## COUVERTURE FLOTTE : 310/310 .c — ✅ AUCUN TROU

- **201** `.c` réels couverts par les 12 domaines (la liste flotte cite 202 noms mais `reset_save_heap.c` **n'existe pas** dans cette décomp — entrée fantôme de la liste save-data ; sans impact).
- **109** [BALAYEUR] audités/classés ci-dessus.
- **Total : 201 + 109 = 310 = 100% des .c de la décomp.** Chaque `.c` est couvert par un domaine, par moi, ou exempt. Aucun fichier orphelin.

**Bilan qualité du lot balayeur** :
- ✅ MIROIR (10) : random, trig, math_util, task, clock, time_events, rtc, mail_data, field_message_box, give_gift_ribbon_to_party.
- 🟡 PARTIEL (7) : util, wild_encounter (roamer manquant), sound (API éparse), international_string_util, field_special_scene, mirage_tower, birch_pc, rotating_gate.
- 🔴 STUB/DIVERGENT honnête (9) : braille, braille_puzzles, post_battle(GameClear), egg_hatch, move_relearner, cable_car, hof_pc + specials stubbés.
- ⬜ ABSENT solo-pertinent (8) : roamer, match_call, gym_leader_rematch, confetti_util, bard_music, rotating_tile_puzzle, trader, rayquaza_scene, landmark, berry_blender.
- ⬜ ABSENT/proche-exempt (link minigames, mystery_gift, record_mixing, contest_link, wireless, pokenav×14).
- 🚫 EXEMPT (link/rfu/m4a/agb_flash/siirtc/ereader/mystery_event/debug-print) + DATA (data, graphics, strings, tilesets, anim_mon_front_pics, text_input_strings, mystery_gift_scripts, fonts, rom_header_gf).

**Aucun stub silencieux ou commentaire mensonger détecté** : les no-ops sont tracés (dette R3/R4 documentée, commentaires "non porté", stub-loop `()=>0` explicite). Le seul écart de doctrine notable = `src/sound.ts` mince alors que l'API son vit dans le substrat harness (à consolider, pas un mensonge).
