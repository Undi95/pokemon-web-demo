# Doublons de déclaration TS — symboles décomp déclarés dans 2+ fichiers du port

> Généré par `node scripts/decomp-index.cjs` (écrasé à chaque run, déterministe).
> Un « doublon » = un symbole de la DÉCOMP qui possède une déclaration forte
> (`function`/`const`/`let`/`var`/`class`/`interface`/`type`/`enum`) dans **2 fichiers TS ou plus**
> du port (`src/`, `include/`, `harness/`). Les stubs `const X = __wireTodo('X')` ne comptent pas.
> C'est la matière première de la **dédup Phase C** : chaque ligne est un candidat
> « quelle implémentation garde-t-on, laquelle devient re-export/meurt ».

**1393 symboles en doublon** — vraies dupes (2+ déclarations dans le MIRROIR 
`src/`+`include/`) : **1249** · miroir + harness (adaptation moteur, moins grave) : 
**143** · harness uniquement : **1**.

## 1. VRAIES DUPES — 2+ déclarations dans des fichiers MIROIR (`src/` + `include/`) — 1249

Deux implémentations concurrentes dans l'arbre 1:1 : la classe de bugs « quelle version tourne ? ».

### Fonctions / globals / labels (239) — l'or de la dédup

| symbole | kind décomp | décomp | déclarations TS |
|---|---|---|---|
| `AnimItemSteal` | function | `src/battle_anim_effects_1.c:3105` | `src/battle_anim_effects_1.ts:948` · `src/battle_anim_effects_1b.ts:313` |
| `AnimPresent` | function | `src/battle_anim_effects_1.c:3016` | `src/battle_anim_effects_1.ts:893` · `src/battle_anim_effects_1b.ts:289` |
| `AnimTravelDiagonally` | function | `src/battle_anim_mons.c:1591` | `src/battle_anim_fight.ts:690` · `src/battle_anim_mons.ts:1030` |
| `BattleAI_HandleItemUseBeforeAISetup` | function | `src/battle_ai_script_commands.c:283` | `src/battle_ai_script_commands.ts:1715` · `src/battle_controllers.ts:1516` |
| `BlitMenuInfoIcon` | function | `src/menu.c:2098` | `src/decoration.ts:1050` · `src/item_menu.ts:1403` |
| `BufferContestLadyLanguage` | function | `src/lilycove_lady.c:715` | `src/lilycove_lady.ts:854` · `src/tv.ts:137` |
| `BufferContestLadyMonName` | function | `src/lilycove_lady.c:702` | `src/lilycove_lady.ts:841` · `src/tv.ts:139` |
| `BufferContestLadyPlayerName` | function | `src/lilycove_lady.c:709` | `src/lilycove_lady.ts:848` · `src/tv.ts:138` |
| `BufferContestName` | function | `src/lilycove_lady.c:721` | `src/lilycove_lady.ts:861` · `src/tv.ts:141` |
| `CB2_InitOptionMenu` | function | `src/option_menu.c:152` | `src/option_menu.ts:697` · `src/start_menu.ts:84` |
| `CB2_ReturnToBagMenu` | function | `src/party_menu.c:4276` | `src/item_use.ts:122` · `src/party_menu.ts:2962` |
| `CB2_ReturnToField` | function | `src/overworld.c:1625` | `src/safari_zone.ts:27` · `src/walda_phrase.ts:30` |
| `CheckHasDecoration` | function | `src/decoration_inventory.c:52` | `src/decoration.ts:2780` · `src/decoration_inventory.ts:155` |
| `ClearBattleAnimationVars` | function | `src/battle_anim.c:170` | `src/battle_anim.ts:397` · `src/battle_controllers.ts:1498` |
| `Cmd_call` | function | `src/battle_ai_script_commands.c:2198` · `src/battle_anim.c:1043` · `src/battle_script_commands.c:3978` | `src/battle_ai_script_commands.ts:1393` · `src/battle_anim.ts:1778` |
| `Cmd_end` | function | `src/battle_ai_script_commands.c:2209` · `src/battle_anim.c:476` · `src/battle_script_commands.c:3953` | `src/battle_ai_script_commands.ts:1402` · `src/battle_anim.ts:1544` |
| `Cmd_goto` | function | `src/battle_ai_script_commands.c:2204` · `src/battle_anim.c:1094` · `src/battle_script_commands.c:3655` | `src/battle_ai_script_commands.ts:1398` · `src/battle_anim.ts:1818` |
| `Cmd_nop` | function | `src/battle_anim.c:468` · `src/battle_script_commands.c:6799` | `src/battle_anim.ts:1537` · `src/battle_script_commands.ts:7192` |
| `Cmd_playse` | function | `src/battle_anim.c:530` · `src/battle_script_commands.c:5313` | `src/battle_anim.ts:1602` · `src/battle_script_commands.ts:3739` |
| `CompleteOnFinishedBattleAnimation` | function | `src/battle_controller_link_opponent.c:512` · `src/battle_controller_link_partner.c:418` · `src/battle_controller_opponent.c:521` · `src/battle_controller_player.c:1566` · `…` | `src/battle_controller_opponent.ts:754` · `src/battle_controller_player.ts:1422` · `src/battle_controller_player_partner.ts:418` |
| `CompleteOnFinishedStatusAnimation` | function | `src/battle_controller_link_opponent.c:506` · `src/battle_controller_link_partner.c:412` · `src/battle_controller_opponent.c:515` · `src/battle_controller_player.c:1560` · `…` | `src/battle_controller_player.ts:2448` · `src/battle_controller_player_partner.ts:413` |
| `CompleteOnHealthbarDone` | function | `src/battle_controller_link_opponent.c:386` · `src/battle_controller_link_partner.c:271` · `src/battle_controller_opponent.c:403` · `src/battle_controller_player.c:1126` · `…` | `src/battle_controller_player.ts:2317` · `src/battle_controller_player_partner.ts:390` |
| `CompleteOnInactiveTextPrinter2` | function | `src/battle_controller_player.c:1339` · `src/battle_controller_player_partner.c:497` | `src/battle_controller_player.ts:1733` · `src/battle_controller_player_partner.ts:402` |
| `ConfigureAndSetUpOneTrainerBattle` | function | `src/battle_setup.c:1193` | `src/battle_setup.ts:658` · `src/trainer_see.ts:89` |
| `ConfigureTwoTrainersBattle` | function | `src/battle_setup.c:1202` | `src/battle_setup.ts:668` · `src/trainer_see.ts:92` |
| `ConvertInternationalPlayerName` | function | `src/international_string_util.c:152` | `src/international_string_util.ts:172` · `src/mail.ts:1130` |
| `CopyCurSecretBaseOwnerName_StrVar1` | function | `src/secret_base.c:741` | `src/secret_base.ts:956` · `src/tv.ts:143` |
| `CopyItemName` | function | `src/item.c:79` | `src/battle_palace.ts:57` · `src/battle_tent.ts:81` · `src/item_menu.ts:1001` |
| `CopyToBgTilemapBufferRect` | function | `src/bg.c:907` | `src/easy_chat.ts:816` · `src/pokemon_storage_system.ts:832` · `src/window.ts:1440` |
| `CorrectSpecialMapSecId` | function | `src/region_map.c:1289` | `src/engine/field/region-map-data.ts:200` · `src/region_map.ts:1535` |
| `CreateCloudSprites` | function | `src/dodrio_berry_picking.c:4299` · `src/field_weather_effect.c:173` · `src/intro_credits_graphics.c:1088` | `src/credits.ts:1761` · `src/field_weather_effect.ts:377` · `src/intro_credits_graphics.ts:276` |
| `CreateHouseSprites` | function | `src/intro_credits_graphics.c:1098` | `src/credits.ts:1769` · `src/intro_credits_graphics.ts:292` |
| `CreateInvisibleSprite` | function | `src/sprite.c:524` | `src/battle_transition.ts:1732` · `src/field_effect_helpers.ts:2136` |
| `CreateMarkingComboSprite` | function | `src/mon_markings.c:585` · `src/pokemon_storage_system.c:3865` | `src/mon_markings.ts:151` · `src/pokemon_storage_system.ts:2233` |
| `CreateMovingScenerySprites` | function | `src/intro_credits_graphics.c:1064` | `src/credits.ts:1740` · `src/intro_credits_graphics.ts:253` |
| `CreateTreeSprites` | function | `src/intro_credits_graphics.c:1093` | `src/credits.ts:1765` · `src/intro_credits_graphics.ts:284` |
| `CreateWarpArrowSprite` | function | `src/field_effect_helpers.c:175` | `src/field_effect_helpers.ts:275` · `src/field_player_avatar.ts:3217` |
| `CurMapIsSecretBase` | function | `src/secret_base.c:510` | `src/fieldmap.ts:1551` · `src/secret_base.ts:737` |
| `DecompressAndCopyTileDataToVram` | function | `src/menu.c:1780` | `src/mail.ts:1060` · `src/pokenav_main_menu.ts:41` · `src/region_map.ts:2335` |
| `DecorationAdd` | function | `src/decoration_inventory.c:67` | `src/decoration.ts:2760` · `src/decoration_inventory.ts:169` |
| `DecorationCheckSpace` | function | `src/decoration_inventory.c:82` | `src/decoration.ts:2775` · `src/decoration_inventory.ts:185` |
| `DecorationRemove` | function | `src/decoration_inventory.c:91` | `src/decoration.ts:2767` · `src/decoration_inventory.ts:196` |
| `DestroyAnimSprite` | function | `src/battle_anim.c:266` | `src/battle_anim.ts:545` · `src/battle_anim_mon_movement.ts:35` |
| `DestroyAnimVisualTask` | function | `src/battle_anim.c:273` | `src/battle_anim.ts:576` · `src/battle_anim_mon_movement.ts:34` · `src/battle_anim_throw.ts:167` |
| `DestroySprite` | function | `src/sprite.c:618` | `src/battle_main.ts:1625` · `src/sprite.ts:1452` |
| `DestroyTask` | function | `src/task.c:84` | `src/battle_anim.ts:158` · `src/task.ts:22` |
| `DoBattleFactorySelectScreen` | function | `src/battle_factory_screen.c:1108` | `src/battle_factory.ts:117` · `src/battle_tent.ts:73` |
| `DoBattleFactorySwapScreen` | function | `src/battle_factory_screen.c:3268` | `src/battle_factory.ts:120` · `src/battle_tent.ts:76` |
| `DoNamingScreen` | function | `src/naming_screen.c:396` | `src/main_menu.ts:1022` · `src/naming_screen.ts:732` |
| `DoSwitchOutAnimation` | function | `src/battle_controller_link_opponent.c:1197` · `src/battle_controller_link_partner.c:1086` · `src/battle_controller_opponent.c:1217` · `src/battle_controller_player.c:2244` · `…` | `src/battle_controller_player.ts:1236` · `src/battle_controller_player_partner.ts:618` |
| `EndDrawPartyStatusSummary` | function | `src/battle_controller_link_opponent.c:1779` · `src/battle_controller_link_partner.c:1626` · `src/battle_controller_opponent.c:1959` · `src/battle_controller_player.c:3048` · `…` | `src/battle_controller_player.ts:2831` · `src/battle_controller_player_partner.ts:1188` |
| `EvolutionScene` | function | `src/evolution_scene.c:209` | `src/battle_main.ts:4517` · `src/evolution_scene.ts:414` |
| `FadeOutMapMusic` | function | `src/sound.c:134` | `src/battle_main.ts:4290` · `src/sound.ts:191` |
| `FlagClear` | function | `src/event_data.c:214` | `src/engine/script/script-vars.ts:42` · `src/event_data.ts:104` |
| `FlagGet` | function | `src/event_data.c:222` | `src/engine/script/script-vars.ts:49` · `src/event_data.ts:110` |
| `FlagSet` | function | `src/event_data.c:206` | `src/engine/script/script-vars.ts:35` · `src/event_data.ts:98` |
| `FreeAllWindowBuffers` | function | `src/window.c:243` | `src/battle_main.ts:4262` · `src/window.ts:385` |
| `FreeAndDestroyMonPicSprite` | function | `src/trainer_pokemon_sprites.c:349` | `src/main_menu.ts:1048` · `src/trainer_pokemon_sprites.ts:244` |
| `FreeBallGfx` | function | `src/pokeball.c:1332` | `src/battle_anim_throw.ts:214` · `src/pokeball.ts:218` |
| `FreeBattleSpritesData` | function | `src/battle_gfx_sfx_util.c:96` | `src/battle_gfx_sfx_util.ts:86` · `src/battle_main.ts:4275` |
| `FreeMonSpriteAfterSwitchOutAnim` | function | `src/battle_controller_link_opponent.c:407` · `src/battle_controller_link_partner.c:302` · `src/battle_controller_opponent.c:422` · `src/battle_controller_player.c:1328` · `…` | `src/battle_controller_player.ts:1256` · `src/battle_controller_player_partner.ts:447` |
| `FreeSpriteOamMatrix` | function | `src/sprite.c:884` | `src/battle_main.ts:1619` · `src/sprite.ts:562` |
| `FreeSpritePaletteByTag` | function | `src/sprite.c:1652` | `src/item_menu_icons.ts:68` · `src/sprite.ts:377` |
| `FreeSpriteTilesByTag` | function | `src/sprite.c:1509` | `harness/runtime/decomp-globals.ts:1812` · `src/item_menu_icons.ts:58` · `src/sprite.ts:881` |
| `FreeTempTileDataBuffersIfPossible` | function | `src/menu.c:1760` | `src/mail.ts:1050` · `src/pokenav_main_menu.ts:67` · `src/region_map.ts:2356` |
| `FrontierSpeechToString` | function | `src/battle_tower.c:1924` | `src/battle_palace.ts:48` · `src/battle_pike.ts:238` · `src/battle_tent.ts:61` |
| `GenerateInitialRentalMons` | function | `src/battle_factory.c:509` · `src/battle_tent.c:289` | `src/battle_factory.ts:796` · `src/battle_tent.ts:345` |
| `GenerateOpponentMons` | function | `src/battle_factory.c:303` · `src/battle_tent.c:352` | `src/battle_factory.ts:616` · `src/battle_tent.ts:406` |
| `GetBattlePalettesMask` | function | `src/battle_anim_mons.c:1402` | `src/battle_anim_mons.ts:1302` · `src/battle_anim_utility_funcs.ts:26` |
| `GetBattlerSide` | function | `src/battle_anim_mons.c:849` | `src/battle_anim.ts:128` · `src/battle_anim_mon_movement.ts:38` · `src/battle_anim_mons.ts:273` · `src/battle_tv.ts:28` · `src/pokeball.ts:254` |
| `GetBgY` | function | `src/bg.c:762` | `src/pokenav_main_menu.ts:73` · `src/window.ts:982` |
| `GetChosenApproachingTrainerObjectEventId` | function | `src/trainer_see.c:784` | `src/scrcmd_trainer.ts:44` · `src/trainer_see.ts:842` |
| `GetContestLadyPokeblockState` | function | `src/lilycove_lady.c:727` | `src/lilycove_lady.ts:867` · `src/tv.ts:140` |
| `GetCurrentApproachingTrainerObjectEventId` | function | `src/trainer_see.c:776` | `src/scrcmd_trainer.ts:37` · `src/trainer_see.ts:836` |
| `GetCurrentLoopedTaskActive` | function | `src/pokenav_match_call_gfx.c:315` · `src/pokenav_menu_handler_gfx.c:441` · `src/pokenav_region_map.c:289` · `src/pokenav_ribbons_summary.c:560` | `src/pokenav_match_call_gfx.ts:390` · `src/pokenav_menu_handler_gfx.ts:568` · `src/pokenav_region_map.ts:427` · `src/pokenav_ribbons_summary.ts:772` |
| `GetEvolutionTargetSpecies` | function | `src/pokemon.c:5490` | `src/battle_main.ts:4511` · `src/pokemon.ts:432` |
| `GetGpuReg` | function | `src/gpu_regs.c:131` | `harness/runtime/decomp-helpers.ts:244` · `src/battle_intro.ts:90` · `src/gpu_regs.ts:13` |
| `GetLRKeysPressed` | function | `src/menu_helpers.c:252` | `src/item_menu.ts:1666` · `src/menu_helpers.ts:119` |
| `GetLeadMonIndex` | function | `src/field_specials.c:1531` | `src/field_specials.ts:60` · `src/scrcmd.ts:1037` |
| `GetLinkPlayerCount` | function | `src/link.c:752` | `src/secret_base.ts:376` · `src/tv.ts:146` |
| `GetMapName` | function | `src/region_map.c:1568` | `src/engine/field/region-map-data.ts:97` · `src/region_map.ts:1784` |
| `GetMapSecIdAt` | function | `src/region_map.c:957` | `src/engine/field/region-map-data.ts:77` · `src/region_map.ts:1166` |
| `GetMapTypeByGroupAndId` | function | `src/overworld.c:1334` | `src/overworld.ts:729` · `src/region_map.ts:128` |
| `GetMapsecType` | function | `src/region_map.c:1175` | `src/engine/field/region-map-data.ts:144` · `src/region_map.ts:1434` |
| `GetPositionOfCursorWithinMapSec` | function | `src/region_map.c:1294` | `src/engine/field/region-map-data.ts:213` · `src/region_map.ts:1540` |
| `GetRandomScaledFrontierTrainerId` | function | `src/battle_tower.c:1106` | `src/battle_factory.ts:97` · `src/battle_pike.ts:230` |
| `GetRegionMapSecIdAt` | function | `src/region_map.c:1222` | `src/pokedex_area_screen.ts:272` · `src/region_map.ts:1480` |
| `GetStringCenterAlignXOffset` | function | `src/international_string_util.c:15` | `src/international_string_util.ts:77` · `src/text.ts:607` |
| `GetStringRightAlignXOffset` | function | `src/international_string_util.c:20` | `src/international_string_util.ts:82` · `src/text.ts:601` |
| `GetUnownLetterByPersonality` | function | `src/pokemon_icon.c:1096` | `src/mail_data.ts:403` · `src/pokemon_icon.ts:218` |
| `GetWaldaPhrasePtr` | function | `src/pokemon_storage_system.c:9714` | `src/pokemon_storage_system.ts:5366` · `src/walda_phrase.ts:348` |
| `GetWhoStrikesFirst` | function | `src/battle_main.c:4595` | `src/battle_ai_script_commands.ts:352` · `src/battle_main.ts:4576` |
| `GiveItemToMon` | function | `src/party_menu.c:1799` · `src/pokemon_storage_system.c:8878` | `src/party_menu.ts:2871` · `src/pokemon_storage_system.ts:1879` |
| `HandleConditionMenuInput` | function | `src/pokenav_conditions.c:85` · `src/pokenav_menu_handler.c:341` | `src/pokenav_conditions.ts:148` · `src/pokenav_menu_handler.ts:371` |
| `HandleMainMenuInput` | function | `src/main_menu.c:885` · `src/pokenav_menu_handler.c:214` | `src/main_menu.ts:298` · `src/pokenav_menu_handler.ts:250` |
| `HandleSetPokedexFlag` | function | `src/pokemon.c:6929` | `src/battle_main.ts:4458` · `src/pokemon.ts:2478` |
| `InBattlePike` | function | `src/battle_pike.c:1326` | `src/battle_pike.ts:1961` · `src/party_menu.ts:2548` |
| `InitDecorationContextItems` | function | `src/decoration.c:515` | `src/decoration.ts:314` · `src/decoration_inventory.ts:105` |
| `InitHeap` | function | `src/malloc.c:186` | `src/credits.ts:75` · `src/intro.ts:156` |
| `InitMenu` | function | `src/menu.c:902` · `src/pokemon_storage_system.c:7924` | `src/menu.ts:572` · `src/pokemon_storage_system.ts:4447` |
| `InitPoisonGasCloudAnim` | function | `src/battle_anim_ice.c:1194` | `src/battle_anim_ice.ts:1163` · `src/battle_anim_poison.ts:239` |
| `InsertMonListItem` | function | `src/pokenav_conditions_search_results.c:363` · `src/pokenav_ribbons_list.c:323` | `src/pokenav_conditions_search_results.ts:453` · `src/pokenav_ribbons_list.ts:362` |
| `IsContest` | function | `src/battle_anim.c:1102` | `src/battle_anim.ts:134` · `src/battle_anim_mons.ts:278` |
| `IsDma3ManagerBusyWithBgCopy` | function | `src/bg.c:440` | `src/dma3_manager.ts:261` · `src/easy_chat.ts:812` · `src/pokemon_storage_system.ts:5374` |
| `IsDma3ManagerBusyWithBgCopy_` | function | `src/pokenav_menu_handler_gfx.c:1244` · `src/pokenav_region_map.c:571` | `src/pokenav_menu_handler_gfx.ts:1434` · `src/pokenav_region_map.ts:695` |
| `IsDoubleBattle` | function | `src/battle_anim_mons.c:902` | `src/battle_anim.ts:123` · `src/battle_anim_mons.ts:269` · `src/battle_interface.ts:924` · `src/pokeball.ts:252` |
| `IsSEPlaying` | function | `src/sound.c:606` | `harness/runtime/decomp-globals.ts:1086` · `src/battle_anim.ts:654` · `src/sound.ts:623` |
| `IsTextPrinterActive` | function | `src/text.c:347` | `src/evolution_scene.ts:210` · `src/text.ts:1244` |
| `IsWaldaPhraseEmpty` | function | `src/pokemon_storage_system.c:9724` | `src/pokemon_storage_system.ts:5370` · `src/walda_phrase.ts:358` |
| `LoadBallGfx` | function | `src/pokeball.c:1309` | `src/battle_anim_throw.ts:206` · `src/pokeball.ts:185` |
| `LoadMatchCallWindowGfx` | function | `src/match_call.c:2102` | `src/match_call.ts:2765` · `src/pokenav_match_call_gfx.ts:66` |
| `LoadOam` | function | `src/sprite.c:640` | `harness/runtime/decomp-globals.ts:1455` · `src/battle_main.ts:307` · `src/mail.ts:1085` · `src/sprite.ts:747` |
| `MainCB2` | function | `src/diploma.c:94` · `src/option_menu.c:137` · `src/pokemon_summary_screen.c:1154` · `src/title_screen.c:677` | `src/option_menu.ts:806` · `src/title_screen.ts:423` |
| `MovePoisonGasCloud` | function | `src/battle_anim_ice.c:1241` | `src/battle_anim_ice.ts:1195` · `src/battle_anim_poison.ts:281` |
| `Overworld_GetMapHeaderByGroupAndId` | function | `src/overworld.c:579` | `src/overworld.ts:176` · `src/region_map.ts:132` |
| `Overworld_IsRecvQueueAtMax` | function | `src/overworld.c:2845` | `src/mail.ts:1141` · `src/pokenav_looped_task.ts:51` |
| `Overworld_PlaySpecialMapMusic` | function | `src/overworld.c:1142` | `src/field_screen_effect.ts:61` · `src/overworld.ts:945` |
| `PlayBGM` | function | `src/sound.c:563` | `harness/runtime/decomp-globals.ts:953` · `src/battle_main.ts:4560` · `src/sound.ts:582` |
| `PlayCry_Normal` | function | `src/sound.c:302` | `src/evolution_scene.ts:234` · `src/sound.ts:348` |
| `PlaySE` | function | `src/sound.c:572` | `harness/runtime/decomp-globals.ts:998` · `src/battle_controller_player.ts:75` · `src/battle_controller_player_partner.ts:183` · `src/battle_controllers.ts:1398` · `src/sound.ts:589` |
| `PlaySE12WithPanning` | function | `src/sound.c:577` | `src/battle_anim.ts:643` · `src/sound.ts:594` |
| `PrintItemDescription` | function | `src/battle_pyramid_bag.c:678` · `src/item_menu.c:998` · `src/pokemon_storage_system.c:9179` | `src/item_menu.ts:946` · `src/pokemon_storage_system.ts:1922` |
| `ProcessSpriteCopyRequests` | function | `src/sprite.c:785` | `harness/runtime/decomp-globals.ts:1468` · `src/battle_main.ts:312` · `src/mail.ts:1095` · `src/sprite.ts:1165` |
| `ResetAllPicSprites` | function | `src/trainer_pokemon_sprites.c:50` | `src/main_menu.ts:1066` · `src/trainer_pokemon_sprites.ts:91` |
| `ResetMenuAndMonGlobals` | function | `src/new_game.c:139` | `src/intro.ts:160` · `src/new_game.ts:161` |
| `ResetSpriteData` | function | `src/sprite.c:294` | `src/battle_main.ts:4247` · `src/sprite.ts:1537` |
| `ResetTempTileDataBuffers` | function | `src/menu.c:1752` | `src/mail.ts:1040` · `src/window.ts:1519` |
| `ResetTrainerOpponentIds` | function | `src/battle_setup.c:1012` | `src/battle_setup.ts:347` · `src/trainer_see.ts:88` |
| `SE12PanpotControl` | function | `src/sound.c:600` | `src/battle_anim.ts:649` · `src/sound.ts:617` |
| `Sav2_ClearSetDefault` | function | `src/new_game.c:133` | `src/intro.ts:159` · `src/new_game.ts:155` |
| `SaveGameFrontier` | function | `src/frontier_util.c:2426` | `src/battle_factory.ts:113` · `src/battle_palace.ts:52` · `src/battle_tent.ts:69` |
| `ScanlineEffect_InitHBlankDmaTransfer` | function | `src/scanline_effect.c:72` | `src/battle_main.ts:322` · `src/scanline_effect.ts:172` |
| `SelectInitialRentalMons` | function | `src/battle_factory.c:287` · `src/battle_tent.c:272` | `src/battle_factory.ts:600` · `src/battle_tent.ts:329` |
| `SetBattleFacilityTrainerGfxId` | function | `src/battle_tower.c:1163` | `src/battle_factory.ts:93` · `src/battle_palace.ts:44` · `src/battle_pike.ts:226` · `src/battle_tent.ts:57` |
| `SetBgTilemapBuffer` | function | `src/bg.c:848` | `src/easy_chat.ts:796` · `src/mail.ts:1018` · `src/pokenav_conditions_gfx.ts:83` · `src/pokenav_main_menu.ts:91` · `src/window.ts:1482` |
| `SetCallbackToStoredInData6` | function | `src/battle_anim_mons.c:423` | `src/battle_anim_mon_movement.ts:88` · `src/battle_anim_mons.ts:174` |
| `SetDynamicWarp` | function | `src/overworld.c:643` | `src/battle_factory.ts:127` · `src/battle_palace.ts:64` · `src/battle_tent.ts:88` · `src/overworld.ts:625` · `src/secret_base.ts:342` |
| `SetFlyMapCallback` | function | `src/region_map.c:1754` | `src/engine/field/region-map.ts:320` · `src/region_map.ts:2100` |
| `SetGpuReg` | function | `src/gpu_regs.c:66` | `src/battle_intro.ts:89` · `src/gpu_regs.ts:8` |
| `SetMainCallback2` | function | `src/main.c:190` | `src/battle_main.ts:4540` · `src/easy_chat.ts:4395` · `src/mail.ts:999` · `src/main.ts:22` |
| `SetPokemonCryStereo` | function | `src/m4a.c:1758` | `src/m4a.ts:1462` · `src/sound.ts:653` |
| `SetSpriteRotScale` | function | `src/battle_anim_mons.c:1260` | `src/battle_anim_mons.ts:428` · `src/battle_transition.ts:73` |
| `SetUpTwoTrainersBattle` | function | `src/battle_setup.c:1209` | `src/battle_setup.ts:676` · `src/trainer_see.ts:95` |
| `SetVBlankCallback_` | function | `src/pokenav.c:537` | `src/pokenav.ts:165` · `src/pokenav_menu_handler_gfx.ts:69` · `src/pokenav_region_map.ts:63` |
| `SetWaldaPhrase` | function | `src/pokemon_storage_system.c:9719` | `src/pokemon_storage_system.ts:5368` · `src/walda_phrase.ts:353` |
| `SetWaldaWallpaperColors` | function | `src/pokemon_storage_system.c:9708` | `src/pokemon_storage_system.ts:5364` · `src/walda_phrase.ts:342` |
| `SetWaldaWallpaperIconId` | function | `src/pokemon_storage_system.c:9697` | `src/pokemon_storage_system.ts:5360` · `src/walda_phrase.ts:336` |
| `SetWaldaWallpaperLockedOrUnlocked` | function | `src/pokemon_storage_system.c:9671` | `src/pokemon_storage_system.ts:5350` · `src/walda_phrase.ts:325` |
| `SetWaldaWallpaperPatternId` | function | `src/pokemon_storage_system.c:9686` | `src/pokemon_storage_system.ts:5356` · `src/walda_phrase.ts:330` |
| `SetWarpDestinationToMapWarp` | function | `src/overworld.c:638` | `src/region_map.ts:1893` · `src/secret_base.ts:333` |
| `SpeciesToHoennPokedexNum` | function | `src/pokemon.c:5672` | `src/engine/data/game-data.ts:341` · `src/pokemon.ts:2428` |
| `SpeciesToNationalPokedexNum` | function | `src/pokemon.c:5664` | `src/battle_main.ts:4452` · `src/engine/data/game-data.ts:336` · `src/pokemon.ts:2421` |
| `SpriteCB_Cursor` | function | `src/easy_chat.c:4647` · `src/mon_markings.c:562` · `src/naming_screen.c:1022` | `src/easy_chat.ts:859` · `src/mon_markings.ts:404` · `src/naming_screen.ts:1418` |
| `SpriteCB_MovingScenery` | function | `src/intro_credits_graphics.c:1037` | `src/credits.ts:1650` · `src/intro_credits_graphics.ts:88` |
| `SpriteCB_Player` | function | `src/cable_car.c:604` · `src/credits.c:1301` · `src/intro_credits_graphics.c:1103` | `src/credits.ts:1342` · `src/intro_credits_graphics.ts:132` |
| `SpriteCB_TrainerSlideIn` | function | `src/battle_gfx_sfx_util.c:396` | `src/battle_controller_opponent.ts:854` · `src/battle_controller_player.ts:1274` |
| `SpriteCB_TrainerSlideVertical` | function | `src/battle_gfx_sfx_util.c:412` | `src/battle_controller_opponent.ts:867` · `src/battle_controller_player.ts:1264` |
| `SpriteCallbackDummy` | function | `src/sprite.c:781` | `harness/runtime/decomp-globals.ts:189` · `src/battle_interface.ts:1125` · `src/mail.ts:1119` |
| `StartSpriteAnim` | function | `src/sprite.c:1346` | `src/battle_main.ts:1663` · `src/sprite.ts:1409` |
| `StopCryAndClearCrySongs` | function | `src/sound.c:510` | `src/battle_main.ts:4336` · `src/sound.ts:531` |
| `StoreSpriteCallbackInData6` | function | `src/battle_anim_mons.c:417` | `src/battle_anim_mon_movement.ts:85` · `src/battle_anim_mons.ts:168` |
| `StringAppend` | function | `src/string_util.c:88` | `src/easy_chat.ts:721` · `src/string_util.ts:140` |
| `StringCopy` | function | `src/string_util.c:75` | `src/easy_chat.ts:703` · `src/string_util.ts:121` |
| `StringLength` | function | `src/string_util.c:114` | `src/easy_chat.ts:728` · `src/string_util.ts:164` |
| `SwapRentalMons` | function | `src/battle_factory.c:293` · `src/battle_tent.c:278` | `src/battle_factory.ts:606` · `src/battle_tent.ts:335` |
| `SwitchIn_HandleSoundAndEnd` | function | `src/battle_controller_link_opponent.c:455` · `src/battle_controller_opponent.c:469` · `src/battle_controller_player.c:1087` · `src/battle_controller_recorded_opponent.c:438` | `src/battle_controller_opponent.ts:744` · `src/battle_controller_player.ts:1400` |
| `SwitchIn_ShowHealthbox` | function | `src/battle_controller_link_opponent.c:468` · `src/battle_controller_link_partner.c:359` · `src/battle_controller_opponent.c:482` · `src/battle_controller_player_partner.c:543` · `…` | `src/battle_controller_opponent.ts:687` · `src/battle_controller_player_partner.ts:571` |
| `SwitchIn_ShowSubstitute` | function | `src/battle_controller_link_opponent.c:444` · `src/battle_controller_link_partner.c:338` · `src/battle_controller_opponent.c:459` · `src/battle_controller_player_partner.c:522` · `…` | `src/battle_controller_opponent.ts:734` · `src/battle_controller_player_partner.ts:581` |
| `SwitchIn_TryShinyAnim` | function | `src/battle_controller_link_opponent.c:489` · `src/battle_controller_link_partner.c:380` · `src/battle_controller_opponent.c:500` · `src/battle_controller_player_partner.c:564` · `…` | `src/battle_controller_opponent.ts:671` · `src/battle_controller_player_partner.ts:560` |
| `Task_StartSendOutAnim` | function | `src/battle_controller_link_opponent.c:1715` · `src/battle_controller_link_partner.c:1575` · `src/battle_controller_opponent.c:1897` · `src/battle_controller_player.c:2993` · `…` | `src/battle_controller_opponent.ts:1657` · `src/battle_controller_player.ts:2693` · `src/battle_controller_player_partner.ts:1105` |
| `TestPlayerAvatarFlags` | function | `src/field_player_avatar.c:1186` | `src/field_player_avatar.ts:2390` · `src/overworld.ts:780` |
| `TransferPlttBuffer` | function | `src/palette.c:103` | `harness/runtime/decomp-globals.ts:1444` · `src/battle_main.ts:317` · `src/mail.ts:1103` |
| `TryPutBreakingNewsOnAir` | function | `src/tv.c:2121` | `src/battle_main.ts:4325` · `src/tv.ts:2230` |
| `TryPutPokemonTodayOnAir` | function | `src/tv.c:1105` | `src/battle_main.ts:4321` · `src/tv.ts:1230` |
| `TrySpawnObjectEvent` | function | `src/event_object_movement.c:1530` | `src/event_object_movement.ts:8437` · `src/secret_base.ts:367` |
| `UnsetBgTilemapBuffer` | function | `src/bg.c:856` | `src/mail.ts:1028` · `src/window.ts:1491` |
| `UpdatePocketItemList` | function | `src/item_menu.c:1105` | `src/engine/bag/bag.ts:408` · `src/item_menu.ts:797` |
| `VBlankCB` | function | `src/berry_crush.c:1126` · `src/clear_save_data_screen.c:118` · `src/diploma.c:34` · `src/mystery_event_menu.c:70` · `…` | `src/intro.ts:2338` · `src/main_menu.ts:2549` · `src/option_menu.ts:813` · `src/title_screen.ts:431` |
| `VarGet` | function | `src/event_data.c:174` | `src/engine/script/script-vars.ts:71` · `src/event_data.ts:68` |
| `VarSet` | function | `src/event_data.c:182` | `src/engine/script/script-vars.ts:62` · `src/event_data.ts:75` |
| `WriteSequenceToBgTilemapBuffer` | function | `src/bg.c:1033` | `src/pokemon_storage_system.ts:123` · `src/window.ts:1411` |
| `gBattleFrontierHeldItems` | global | `include/battle_tower.h:40` · `src/battle_tower.c:83` | `src/battle_factory.ts:86` · `src/battle_tent.ts:53` |
| `gBattleFrontierTrainers` | global | `include/battle_tower.h:42` · `src/data/battle_frontier/battle_frontier_trainers.h:1` | `src/battle_factory.ts:84` · `src/battle_pike.ts:224` |
| `gBattleTypeFlags` | global | `include/battle.h:631` · `src/battle_main.c:146` | `src/battle_intro.ts:111` · `src/engine/battle/state.ts:184` |
| `gContestMoves` | global | `include/contest_effect.h:19` · `src/data/contest_moves.h:1` | `src/contest_effect.ts:297` · `src/engine/data/game-data.ts:158` |
| `gFacilityTrainerMons` | global | `include/battle_tower.h:51` · `src/battle_tower.c:45` | `src/battle_factory.ts:80` · `src/battle_tent.ts:49` |
| `gFacilityTrainers` | global | `include/battle_tower.h:50` · `src/battle_tower.c:44` | `src/battle_factory.ts:79` · `src/battle_palace.ts:42` · `src/battle_pike.ts:222` · `src/battle_tent.ts:48` |
| `gFrontierTempParty` | global | `include/battle_tower.h:48` · `src/battle_tower.c:48` | `src/battle_factory.ts:82` · `src/battle_tent.ts:51` |
| `gHasHallOfFameRecords` | global | `include/credits.h:4` · `src/credits.c:85` | `src/credits.ts:195` · `src/post_battle_event_funcs.ts:28` |
| `gHeap` | global | `include/malloc.h:14` · `src/malloc.c:7` | `src/credits.ts:74` · `src/intro.ts:162` |
| `gLinkPlayers` | global | `include/link.h:247` · `src/link.c:116` | `src/secret_base.ts:381` · `src/tv.ts:145` |
| `gMaxFlashLevel` | global | `include/field_screen_effect.h:4` · `src/field_screen_effect.c:54` | `src/field_screen_effect.ts:141` · `src/overworld.ts:148` · `src/scrcmd_flash.ts:15` |
| `gNoOfApproachingTrainers` | global | `include/trainer_see.h:15` · `src/trainer_see.c:55` | `src/scrcmd_trainer.ts:48` · `src/trainer_see.ts:295` |
| `gNumSafariBalls` | global | `include/safari_zone.h:4` · `src/safari_zone.c:31` | `src/battle_util.ts:796` · `src/safari_zone.ts:58` |
| `gPlttBufferFaded` | global | `include/palette.h:59` · `src/palette.c:62` | `src/field_weather.ts:113` · `src/palette.ts:114` |
| `gPlttBufferUnfaded` | global | `include/palette.h:58` · `src/palette.c:61` | `harness/runtime/decomp-globals.ts:1661` · `src/field_weather.ts:110` · `src/palette.ts:112` |
| `gSaveBlock1Ptr` | global | `include/global.h:1087` · `include/load_save.h:33` · `src/load_save.c:41` | `src/engine/save/save-block-state.ts:72` · `src/save.ts:709` |
| `gSaveBlock2Ptr` | global | `include/global.h:550` · `include/load_save.h:34` · `src/load_save.c:42` | `src/engine/save/save-block-state.ts:89` · `src/save.ts:712` |
| `gSlateportBattleTentMons` | global | `include/battle_tower.h:43` · `src/data/battle_frontier/battle_tent.h:754` | `src/battle_factory.ts:87` · `src/battle_tent.ts:55` |
| `gTrainers` | global | `include/data.h:137` · `src/data/trainers.h:1` | `src/pokemon.ts:2534` · `src/pokenav_match_call_data.ts:59` |
| `gUnusedBikeCameraAheadPanback` | global | `include/bike.h:67` · `src/field_camera.c:15` | `src/bike.ts:888` · `src/field_camera.ts:197` |
| `sAnim_Player_Fast` | global | `src/credits.c:163` | `src/credits.ts:262` · `src/intro_credits_graphics.ts:150` |
| `sAnim_Player_LookBack` | global | `src/credits.c:172` | `src/credits.ts:271` · `src/intro_credits_graphics.ts:151` |
| `sAnim_Player_LookForward` | global | `src/credits.c:180` | `src/credits.ts:279` · `src/intro_credits_graphics.ts:152` |
| `sAnim_Player_Slow` | global | `src/credits.c:154` | `src/credits.ts:253` · `src/intro_credits_graphics.ts:149` |
| `sAnims_Arrow` | global | `src/pokemon_storage_system.c:1301` · `src/reset_rtc_screen.c:218` | `src/field_effect_helpers.ts:229` · `src/pokemon_storage_system.ts:723` |
| `sAnims_Bubbles` | global | `src/intro.c:548` | `src/field_effect_helpers.ts:3252` · `src/intro.ts:2404` |
| `sAnims_Clouds` | global | `src/intro_credits_graphics.c:124` | `src/credits.ts:1692` · `src/intro_credits_graphics.ts:38` |
| `sAnims_HouseSilhouette` | global | `src/intro_credits_graphics.c:380` | `src/credits.ts:1700` · `src/intro_credits_graphics.ts:40` |
| `sAnims_Player` | global | `src/credits.c:189` · `src/intro_credits_graphics.c:460` | `harness/runtime/decomp-globals.ts:661` · `src/credits.ts:288` · `src/intro_credits_graphics.ts:157` |
| `sAnims_Sparkle` | global | `src/berry_crush.c:789` · `src/intro.c:245` | `src/field_effect_helpers.ts:3363` · `src/intro.ts:2355` |
| `sAnims_Trees` | global | `src/intro_credits_graphics.c:245` | `src/credits.ts:1696` · `src/intro_credits_graphics.ts:39` |
| `sBadgeFlags` | global | `src/battle_setup.c:342` · `src/match_call.c:1850` | `src/battle_setup.ts:776` · `src/match_call.ts:2524` |
| `sBgTemplates` | global | `src/battle_pyramid_bag.c:112` · `src/berry_blender.c:308` · `src/berry_crush.c:418` · `src/cable_car.c:95` · `…` | `src/mail.ts:198` · `src/pokemon_storage_system.ts:699` · `src/pokenav_ribbons_summary.ts:372` · `src/starter_choose.ts:123` |
| `sDefaultBattleLostWords` | global | `src/easy_chat.c:1265` | `src/data/easy-chat-data.ts:88` · `src/easy_chat.ts:3433` |
| `sDefaultBattleStartWords` | global | `src/easy_chat.c:1247` | `src/data/easy-chat-data.ts:86` · `src/easy_chat.ts:3413` |
| `sDefaultBattleWonWords` | global | `src/easy_chat.c:1256` | `src/data/easy-chat-data.ts:87` · `src/easy_chat.ts:3423` |
| `sDefaultProfileWords` | global | `src/easy_chat.c:1240` | `src/data/easy-chat-data.ts:85` · `src/easy_chat.ts:3405` |
| `sMatchCallWindow_Gfx` | global | `src/match_call.c:1198` | `src/match_call.ts:1879` · `src/pokenav_match_call_gfx.ts:64` |
| `sMatchCallWindow_Pal` | global | `src/match_call.c:1197` | `src/match_call.ts:1876` · `src/pokenav_match_call_gfx.ts:65` |
| `sMenu` | global | `src/menu.c:65` · `src/mon_markings.c:288` · `src/use_pokeblock.c:172` | `src/menu.ts:564` · `src/mon_markings.ts:43` |
| `sMessageWindowId` | global | `src/menu_helpers.c:26` | `src/menu_helpers.ts:293` · `src/shop.ts:209` |
| `sOamTable_16x16_2` | global | `src/data/object_events/object_event_subsprites.h:23` | `src/data/object_events/object_event_subsprites.ts:53` · `src/event_object_movement.ts:1602` |
| `sOamTable_48x48` | global | `src/data/object_events/object_event_subsprites.h:281` | `src/data/object_events/object_event_subsprites.ts:171` · `src/event_object_movement.ts:1607` |
| `sPrevMetatileBehavior` | global | `src/field_control_avatar.c:39` | `src/field_control_avatar.ts:143` · `src/wild_encounter.ts:849` |
| `sSpeciesToHoennPokedexNum` | global | `src/pokemon.c:109` | `src/data/pokemon/pokedex_order_tables.ts:36` · `src/engine/data/game-data.ts:153` |
| `sSpeciesToNationalPokedexNum` | global | `src/pokemon.c:525` | `src/data/pokemon/pokedex_order_tables.ts:10` · `src/engine/data/game-data.ts:154` |
| `sSpriteMetadata_Clouds` | global | `src/intro_credits_graphics.c:132` | `src/credits.ts:1705` · `src/intro_credits_graphics.ts:41` |
| `sSpriteMetadata_HouseSilhouette` | global | `src/intro_credits_graphics.c:385` | `src/credits.ts:1730` · `src/intro_credits_graphics.ts:43` |
| `sSpriteMetadata_Trees` | global | `src/intro_credits_graphics.c:252` | `src/credits.ts:1716` · `src/intro_credits_graphics.ts:42` |
| `sSpriteTemplate_MovingScenery` | global | `src/intro_credits_graphics.c:79` | `src/credits.ts:1676` · `src/intro_credits_graphics.ts:247` |
| `sTextColors` | global | `src/battle_pyramid_bag.c:201` · `src/berry_tag_screen.c:97` · `src/frontier_pass.c:332` · `src/link.c:234` · `…` | `src/mail.ts:214` · `src/pokemon_summary_screen.ts:184` · `src/starter_choose.ts:162` |
| `sText_FemaleSymbol` | global | `src/pokenav_conditions_search_results.c:127` · `src/pokenav_ribbons_list.c:122` | `src/pokenav_conditions_search_results.ts:210` · `src/pokenav_ribbons_list.ts:160` |
| `sText_MaleSymbol` | global | `src/pokenav_conditions_search_results.c:126` · `src/pokenav_ribbons_list.c:121` | `src/pokenav_conditions_search_results.ts:207` · `src/pokenav_ribbons_list.ts:157` |
| `sText_NoGenderSymbol` | global | `src/pokenav_conditions_search_results.c:128` · `src/pokenav_ribbons_list.c:123` | `src/pokenav_conditions_search_results.ts:213` · `src/pokenav_ribbons_list.ts:163` |
| `sWildEncounterImmunitySteps` | global | `src/field_control_avatar.c:38` | `src/field_control_avatar.ts:136` · `src/wild_encounter.ts:844` |
| `sWinStreakFlags` | global | `src/battle_dome.c:1164` · `src/battle_factory.c:145` · `src/battle_palace.c:66` · `src/battle_pike.c:539` · `…` | `src/battle_factory.ts:367` · `src/battle_palace.ts:110` · `src/battle_pike.ts:1222` |
| `sWinStreakMasks` | global | `src/battle_dome.c:1170` · `src/battle_factory.c:151` · `src/battle_palace.c:72` · `src/battle_tower.c:832` | `src/battle_factory.ts:379` · `src/battle_palace.ts:122` |
| `sWindowTemplates` | global | `src/battle_pyramid_bag.c:208` · `src/berry_blender.c:339` · `src/berry_tag_screen.c:103` · `src/contest_util.c:323` · `…` | `src/credits.ts:225` · `src/mail.ts:207` · `src/pokemon_storage_system.ts:691` · `src/starter_choose.ts:130` |

### Constantes (defines / enums / types) (1010)

Constantes redéclarées localement au lieu d'être importées du miroir de header —
dédup moins urgente mais source de désynchronisation de valeurs.

| symbole | kind décomp | décomp | déclarations TS |
|---|---|---|---|
| `ACTIONS_CONFIRMED_COUNT` | define | `include/constants/battle_script_commands.h:293` | `include/constants/battle_script_commands.ts:68` · `src/battle_main.ts:2591` |
| `AFFINEANIMCMD_END` | define | `include/sprite.h:136` | `src/pokenav_menu_handler_gfx.ts:54` · `src/pokenav_ribbons_summary.ts:50` |
| `AFFINEANIMCMD_FRAME` | func_macro | `include/sprite.h:130` | `src/pokenav_menu_handler_gfx.ts:55` · `src/pokenav_ribbons_summary.ts:51` |
| `AI_EFFECTIVENESS_x0` | define | `include/constants/battle_ai.h:23` | `include/constants/battle_ai.ts:22` · `src/battle_ai_script_commands.ts:214` |
| `AI_EFFECTIVENESS_x0_25` | define | `include/constants/battle_ai.h:22` | `include/constants/battle_ai.ts:21` · `src/battle_ai_script_commands.ts:213` |
| `AI_EFFECTIVENESS_x0_5` | define | `include/constants/battle_ai.h:21` | `include/constants/battle_ai.ts:20` · `src/battle_ai_script_commands.ts:212` |
| `AI_EFFECTIVENESS_x1` | define | `include/constants/battle_ai.h:20` | `include/constants/battle_ai.ts:19` · `src/battle_ai_script_commands.ts:211` |
| `AI_EFFECTIVENESS_x2` | define | `include/constants/battle_ai.h:19` | `include/constants/battle_ai.ts:18` · `src/battle_ai_script_commands.ts:210` |
| `AI_EFFECTIVENESS_x4` | define | `include/constants/battle_ai.h:18` | `include/constants/battle_ai.ts:17` · `src/battle_ai_script_commands.ts:209` |
| `AI_TARGET` | define | `include/constants/battle_ai.h:5` | `include/constants/battle_ai.ts:8` · `src/battle_ai_script_commands.ts:200` |
| `AI_TARGET_PARTNER` | define | `include/constants/battle_ai.h:7` | `include/constants/battle_ai.ts:10` · `src/battle_ai_script_commands.ts:202` |
| `AI_TYPE1_TARGET` | define | `include/constants/battle_ai.h:11` | `include/constants/battle_ai.ts:12` · `src/battle_ai_script_commands.ts:204` |
| `AI_TYPE1_USER` | define | `include/constants/battle_ai.h:12` | `include/constants/battle_ai.ts:13` · `src/battle_ai_script_commands.ts:205` |
| `AI_TYPE2_TARGET` | define | `include/constants/battle_ai.h:13` | `include/constants/battle_ai.ts:14` · `src/battle_ai_script_commands.ts:206` |
| `AI_TYPE2_USER` | define | `include/constants/battle_ai.h:14` | `include/constants/battle_ai.ts:15` · `src/battle_ai_script_commands.ts:207` |
| `AI_TYPE_MOVE` | define | `include/constants/battle_ai.h:15` | `include/constants/battle_ai.ts:16` · `src/battle_ai_script_commands.ts:208` |
| `AI_USER` | define | `include/constants/battle_ai.h:6` | `include/constants/battle_ai.ts:9` · `src/battle_ai_script_commands.ts:201` |
| `AI_USER_PARTNER` | define | `include/constants/battle_ai.h:8` | `include/constants/battle_ai.ts:11` · `src/battle_ai_script_commands.ts:203` |
| `AI_WEATHER_HAIL` | define | `include/constants/battle_ai.h:30` | `include/constants/battle_ai.ts:28` · `src/battle_ai_script_commands.ts:218` |
| `AI_WEATHER_RAIN` | define | `include/constants/battle_ai.h:28` | `include/constants/battle_ai.ts:26` · `src/battle_ai_script_commands.ts:216` |
| `AI_WEATHER_SANDSTORM` | define | `include/constants/battle_ai.h:29` | `include/constants/battle_ai.ts:27` · `src/battle_ai_script_commands.ts:217` |
| `AI_WEATHER_SUN` | define | `include/constants/battle_ai.h:27` | `include/constants/battle_ai.ts:25` · `src/battle_ai_script_commands.ts:215` |
| `ANIM_ARGS_COUNT` | define | `include/battle_anim.h:36` | `include/battle_anim.ts:8` · `src/battle_anim.ts:102` |
| `ANIM_ATK_PARTNER` | define | `include/constants/battle_anim.h:303` | `include/constants/battle_anim.ts:589` · `src/battle_anim.ts:107` |
| `ANIM_ATTACKER` | define | `include/constants/battle_anim.h:301` | `include/constants/battle_anim.ts:587` · `src/battle_anim.ts:105` · `src/battle_anim_flying.ts:70` · `src/battle_anim_psychic.ts:76` |
| `ANIM_DEF_PARTNER` | define | `include/constants/battle_anim.h:304` | `include/constants/battle_anim.ts:590` · `src/battle_anim.ts:108` |
| `ANIM_REMOVE_OBSTACLE` | define | `include/constants/event_object_movement.h:307` | `include/constants/event_object_movement.ts:331` · `src/event_object_movement.ts:5049` |
| `ANIM_STD_COUNT` | define | `include/constants/event_object_movement.h:269` | `include/constants/event_object_movement.ts:270` · `src/event_object_movement.ts:5052` |
| `ANIM_STD_FACE_EAST` | define | `include/constants/event_object_movement.h:252` | `include/constants/event_object_movement.ts:253` · `src/event_object_movement.ts:230` |
| `ANIM_STD_FACE_NORTH` | define | `include/constants/event_object_movement.h:250` | `include/constants/event_object_movement.ts:251` · `src/event_object_movement.ts:228` |
| `ANIM_STD_FACE_SOUTH` | define | `include/constants/event_object_movement.h:249` | `include/constants/event_object_movement.ts:250` · `src/event_object_movement.ts:227` |
| `ANIM_STD_FACE_WEST` | define | `include/constants/event_object_movement.h:251` | `include/constants/event_object_movement.ts:252` · `src/event_object_movement.ts:229` |
| `ANIM_STD_GO_EAST` | define | `include/constants/event_object_movement.h:256` | `include/constants/event_object_movement.ts:257` · `src/event_object_movement.ts:234` |
| `ANIM_STD_GO_FASTER_EAST` | define | `include/constants/event_object_movement.h:264` | `include/constants/event_object_movement.ts:265` · `src/event_object_movement.ts:242` |
| `ANIM_STD_GO_FASTER_NORTH` | define | `include/constants/event_object_movement.h:262` | `include/constants/event_object_movement.ts:263` · `src/event_object_movement.ts:240` |
| `ANIM_STD_GO_FASTER_SOUTH` | define | `include/constants/event_object_movement.h:261` | `include/constants/event_object_movement.ts:262` · `src/event_object_movement.ts:239` |
| `ANIM_STD_GO_FASTER_WEST` | define | `include/constants/event_object_movement.h:263` | `include/constants/event_object_movement.ts:264` · `src/event_object_movement.ts:241` |
| `ANIM_STD_GO_FASTEST_EAST` | define | `include/constants/event_object_movement.h:268` | `include/constants/event_object_movement.ts:269` · `src/event_object_movement.ts:246` |
| `ANIM_STD_GO_FASTEST_NORTH` | define | `include/constants/event_object_movement.h:266` | `include/constants/event_object_movement.ts:267` · `src/event_object_movement.ts:244` |
| `ANIM_STD_GO_FASTEST_SOUTH` | define | `include/constants/event_object_movement.h:265` | `include/constants/event_object_movement.ts:266` · `src/event_object_movement.ts:243` |
| `ANIM_STD_GO_FASTEST_WEST` | define | `include/constants/event_object_movement.h:267` | `include/constants/event_object_movement.ts:268` · `src/event_object_movement.ts:245` |
| `ANIM_STD_GO_FAST_EAST` | define | `include/constants/event_object_movement.h:260` | `include/constants/event_object_movement.ts:261` · `src/event_object_movement.ts:238` |
| `ANIM_STD_GO_FAST_NORTH` | define | `include/constants/event_object_movement.h:258` | `include/constants/event_object_movement.ts:259` · `src/event_object_movement.ts:236` |
| `ANIM_STD_GO_FAST_SOUTH` | define | `include/constants/event_object_movement.h:257` | `include/constants/event_object_movement.ts:258` · `src/event_object_movement.ts:235` |
| `ANIM_STD_GO_FAST_WEST` | define | `include/constants/event_object_movement.h:259` | `include/constants/event_object_movement.ts:260` · `src/event_object_movement.ts:237` |
| `ANIM_STD_GO_NORTH` | define | `include/constants/event_object_movement.h:254` | `include/constants/event_object_movement.ts:255` · `src/event_object_movement.ts:232` |
| `ANIM_STD_GO_SOUTH` | define | `include/constants/event_object_movement.h:253` | `include/constants/event_object_movement.ts:254` · `src/event_object_movement.ts:231` |
| `ANIM_STD_GO_WEST` | define | `include/constants/event_object_movement.h:255` | `include/constants/event_object_movement.ts:256` · `src/event_object_movement.ts:233` |
| `ANIM_TARGET` | define | `include/constants/battle_anim.h:302` | `include/constants/battle_anim.ts:588` · `src/battle_anim.ts:106` · `src/battle_anim_flying.ts:71` |
| `APPRENTICE_COUNT` | define | `include/constants/global.h:59` | `include/constants/global.ts:56` · `src/engine/save/save-blocks.ts:75` |
| `APPRENTICE_MAX_QUESTIONS` | define | `include/constants/global.h:60` | `include/constants/global.ts:57` · `src/engine/save/save-blocks.ts:76` |
| `ARG_RET_ID` | define | `include/constants/battle_anim.h:403` | `include/constants/battle_anim.ts:670` · `src/battle_anim_throw.ts:125` |
| `A_BUTTON` | define | `include/gba/io_reg.h:699` | `include/gba/io_reg.ts:957` · `src/battle_controllers.ts:1444` · `src/easy_chat.ts:527` · `src/evolution_scene.ts:809` · `src/list_menu.ts:316` · `src/party_menu.ts:1913` · `src/title_screen.ts:73` |
| `AffineAnimFrameCmd` | struct | `include/sprite.h:91` | `src/engine/decomp-impls/sprite-affine-extras.ts:21` · `src/engine/decomp-impls/sprite-engine-impl.ts:29` |
| `BAG_BERRIES_COUNT` | define | `include/constants/global.h:55` | `include/constants/global.ts:52` · `src/engine/bag/bag-types.ts:34` · `src/engine/save/save-blocks.ts:46` |
| `BAG_ITEMS_COUNT` | define | `include/constants/global.h:51` | `include/constants/global.ts:48` · `src/engine/bag/bag-types.ts:31` · `src/engine/save/save-blocks.ts:42` |
| `BAG_KEYITEMS_COUNT` | define | `include/constants/global.h:52` | `include/constants/global.ts:49` · `src/engine/bag/bag-types.ts:35` · `src/engine/save/save-blocks.ts:43` |
| `BAG_POKEBALLS_COUNT` | define | `include/constants/global.h:53` | `include/constants/global.ts:50` · `src/engine/bag/bag-types.ts:32` · `src/engine/save/save-blocks.ts:44` |
| `BAG_TMHM_COUNT` | define | `include/constants/global.h:54` | `include/constants/global.ts:51` · `src/engine/bag/bag-types.ts:33` · `src/engine/save/save-blocks.ts:45` |
| `BALLS_POCKET` | define | `include/constants/item.h:13` | `include/constants/item.ts:15` · `src/engine/bag/bag-types.ts:39` |
| `BATTLER_AFFINE_EMERGE` | enum_member | `include/data.h:19` | `src/battle_anim_throw.ts:805` · `src/engine/battle/battle-sendout-anim.ts:67` · `src/pokeball.ts:232` |
| `BATTLER_AFFINE_NORMAL` | enum_member | `include/data.h:18` | `src/battle_anim_throw.ts:804` · `src/engine/battle/battle-sendout-anim.ts:66` · `src/pokeball.ts:231` |
| `BATTLER_COORD_ATTR_HEIGHT` | enum_member | `include/battle_anim.h:172` | `src/battle_anim_effects_1b.ts:124` · `src/battle_anim_effects_3.ts:475` |
| `BATTLER_COORD_ATTR_LEFT` | enum_member | `include/battle_anim.h:176` | `src/battle_anim_effects_1b.ts:128` · `src/battle_anim_effects_3.ts:479` |
| `BATTLER_COORD_ATTR_RIGHT` | enum_member | `include/battle_anim.h:177` | `src/battle_anim_effects_1b.ts:127` · `src/battle_anim_effects_3.ts:478` |
| `BATTLER_COORD_ATTR_TOP` | enum_member | `include/battle_anim.h:174` | `src/battle_anim_effects_1b.ts:126` · `src/battle_anim_effects_3.ts:476` |
| `BATTLER_COORD_X` | enum_member | `include/battle_anim.h:163` | `src/battle_anim_mons.ts:204` · `src/battle_gfx_sfx_util.ts:510` · `src/pokeball.ts:239` |
| `BATTLER_COORD_X_2` | enum_member | `include/battle_anim.h:165` | `src/battle_anim_mons.ts:206` · `src/pokeball.ts:241` |
| `BATTLER_COORD_Y` | enum_member | `include/battle_anim.h:164` | `src/battle_anim_mons.ts:205` · `src/battle_gfx_sfx_util.ts:511` · `src/pokeball.ts:240` |
| `BATTLER_COORD_Y_PIC_OFFSET` | enum_member | `include/battle_anim.h:166` | `src/battle_anim_mons.ts:207` · `src/pokeball.ts:242` |
| `BATTLESTRINGS_COUNT` | define | `include/constants/battle_string_ids.h:382` | `include/constants/battle_string_ids.ts:383` · `src/battle_message.ts:1422` |
| `BATTLE_ALIVE_DEF_SIDE` | define | `include/constants/pokemon.h:279` | `include/constants/pokemon.ts:234` · `src/pokemon.ts:2041` |
| `BATTLE_COMMUNICATION_ENTRIES_COUNT` | define | `include/constants/battle_script_commands.h:297` | `include/constants/battle_script_commands.ts:72` · `src/battle_main.ts:4145` |
| `BATTLE_ENVIRONMENT_BUILDING` | define | `include/constants/battle.h:319` | `include/constants/battle.ts:378` · `src/battle_bg.ts:149` · `src/battle_main.ts:787` · `src/battle_setup.ts:1277` |
| `BATTLE_ENVIRONMENT_CAVE` | define | `include/constants/battle.h:318` | `include/constants/battle.ts:377` · `src/battle_bg.ts:148` · `src/battle_setup.ts:1276` |
| `BATTLE_ENVIRONMENT_GRASS` | define | `include/constants/battle.h:311` | `include/constants/battle.ts:370` · `src/battle_bg.ts:141` · `src/battle_intro.ts:71` · `src/battle_setup.ts:1269` |
| `BATTLE_ENVIRONMENT_LONG_GRASS` | define | `include/constants/battle.h:312` | `include/constants/battle.ts:371` · `src/battle_bg.ts:142` · `src/battle_setup.ts:1270` |
| `BATTLE_ENVIRONMENT_MOUNTAIN` | define | `include/constants/battle.h:317` | `include/constants/battle.ts:376` · `src/battle_bg.ts:147` · `src/battle_intro.ts:73` · `src/battle_setup.ts:1275` |
| `BATTLE_ENVIRONMENT_PLAIN` | define | `include/constants/battle.h:320` | `include/constants/battle.ts:379` · `src/battle_bg.ts:150` · `src/battle_intro.ts:74` · `src/battle_setup.ts:1278` |
| `BATTLE_ENVIRONMENT_POND` | define | `include/constants/battle.h:316` | `include/constants/battle.ts:375` · `src/battle_bg.ts:146` · `src/battle_setup.ts:1274` |
| `BATTLE_ENVIRONMENT_SAND` | define | `include/constants/battle.h:313` | `include/constants/battle.ts:372` · `src/battle_bg.ts:143` · `src/battle_setup.ts:1271` |
| `BATTLE_ENVIRONMENT_UNDERWATER` | define | `include/constants/battle.h:314` | `include/constants/battle.ts:373` · `src/battle_bg.ts:144` · `src/battle_intro.ts:72` · `src/battle_setup.ts:1272` |
| `BATTLE_ENVIRONMENT_WATER` | define | `include/constants/battle.h:315` | `include/constants/battle.ts:374` · `src/battle_bg.ts:145` · `src/battle_setup.ts:1273` |
| `BATTLE_PARTNER` | func_macro | `include/constants/battle.h:46` | `src/battle_anim.ts:118` · `src/engine/battle/constants.ts:1403` |
| `BATTLE_RUN_FAILURE` | define | `include/constants/battle.h:339` | `include/constants/battle.ts:394` · `src/battle_util.ts:1351` |
| `BATTLE_RUN_FORBIDDEN` | define | `include/constants/battle.h:338` | `include/constants/battle.ts:393` · `src/battle_util.ts:1348` |
| `BATTLE_RUN_SUCCESS` | define | `include/constants/battle.h:337` | `include/constants/battle.ts:392` · `src/battle_main.ts:2932` · `src/battle_util.ts:1345` |
| `BATTLE_TYPE_BATTLE_TOWER` | define | `include/constants/battle.h:67` | `include/battle.ts:80` · `src/battle_main.ts:779` |
| `BATTLE_TYPE_DOUBLE` | define | `include/constants/battle.h:59` | `harness/e2e/scenarios.ts:138` · `include/battle.ts:72` · `src/battle_tower.ts:39` |
| `BATTLE_TYPE_FRONTIER` | define | `include/constants/battle.h:91` | `include/battle.ts:105` · `src/battle_intro.ts:83` |
| `BATTLE_TYPE_FRONTIER_NO_PYRAMID` | define | `include/constants/battle.h:92` | `include/battle.ts:106` · `src/battle_main.ts:2611` |
| `BATTLE_TYPE_INGAME_PARTNER` | define | `include/constants/battle.h:81` | `include/battle.ts:94` · `src/battle_intro.ts:82` · `src/battle_main.ts:777` · `src/battle_tower.ts:43` |
| `BATTLE_TYPE_KYOGRE_GROUDON` | define | `include/constants/battle.h:71` | `include/battle.ts:84` · `src/battle_intro.ts:84` |
| `BATTLE_TYPE_LINK` | define | `include/constants/battle.h:60` | `include/battle.ts:73` · `src/battle_intro.ts:77` |
| `BATTLE_TYPE_LINK_IN_BATTLE` | define | `include/constants/battle.h:64` | `include/battle.ts:77` · `src/battle_main.ts:5954` |
| `BATTLE_TYPE_MULTI` | define | `include/constants/battle.h:65` | `include/battle.ts:78` · `src/battle_tower.ts:41` |
| `BATTLE_TYPE_RECORDED_LINK` | define | `include/constants/battle.h:84` | `include/battle.ts:97` · `src/battle_intro.ts:78` |
| `BATTLE_TYPE_TRAINER` | define | `include/constants/battle.h:62` | `include/battle.ts:75` · `src/battle_tower.ts:40` |
| `BATTLE_TYPE_TWO_OPPONENTS` | define | `include/constants/battle.h:74` | `include/battle.ts:87` · `src/battle_tower.ts:42` |
| `BERRIES_POCKET` | define | `include/constants/item.h:15` | `include/constants/item.ts:17` · `src/engine/bag/bag-types.ts:41` |
| `BERRY_NAME_LENGTH` | define | `include/global.berry.h:4` | `src/berry.ts:51` · `src/engine/save/save-blocks.ts:102` |
| `BERRY_STAGE_BERRIES` | define | `include/constants/berry.h:25` | `include/constants/berry.ts:12` · `src/berry.ts:44` |
| `BERRY_STAGE_FLOWERING` | define | `include/constants/berry.h:24` | `include/constants/berry.ts:11` · `src/berry.ts:43` |
| `BERRY_STAGE_NO_BERRY` | define | `include/constants/berry.h:20` | `include/constants/berry.ts:7` · `src/berry.ts:39` |
| `BERRY_STAGE_PLANTED` | define | `include/constants/berry.h:21` | `include/constants/berry.ts:8` · `src/berry.ts:40` |
| `BERRY_STAGE_SPARKLING` | define | `include/constants/berry.h:26` | `include/constants/berry.ts:13` · `src/berry.ts:45` |
| `BERRY_STAGE_SPROUTED` | define | `include/constants/berry.h:22` | `include/constants/berry.ts:9` · `src/berry.ts:41` |
| `BERRY_STAGE_TALLER` | define | `include/constants/berry.h:23` | `include/constants/berry.ts:10` · `src/berry.ts:42` |
| `BERRY_TREES_COUNT` | define | `include/constants/berry.h:130` | `include/constants/berry.ts:24` · `src/engine/save/save-blocks.ts:58` |
| `BGCNT_16COLOR` | define | `include/gba/io_reg.h:536` | `harness/runtime/decomp-runtime.ts:106` · `include/gba/io_reg.ts:775` · `src/battle_intro.ts:62` |
| `BGCNT_TXT256x512` | define | `include/gba/io_reg.h:542` | `harness/runtime/decomp-runtime.ts:110` · `include/gba/io_reg.ts:780` · `src/battle_intro.ts:63` |
| `BGCNT_TXT512x256` | define | `include/gba/io_reg.h:541` | `harness/runtime/decomp-runtime.ts:109` · `include/gba/io_reg.ts:779` · `src/battle_intro.ts:64` |
| `BGCNT_WRAP` | define | `include/gba/io_reg.h:539` | `harness/runtime/decomp-runtime.ts:116` · `include/gba/io_reg.ts:777` · `src/intro.ts:173` |
| `BG_ATTR_CHARBASEINDEX` | enum_member | `include/bg.h:6` | `src/battle_intro.ts:67` · `src/window.ts:856` |
| `BG_COORD_ADD` | enum_member | `include/bg.h:27` | `src/easy_chat.ts:324` · `src/main_menu.ts:143` · `src/match_call.ts:96` · `src/pokemon_summary_screen.ts:395` · `src/pokenav_list.ts:59` · `src/pokenav_main_menu.ts:200` · `src/pokenav_menu_handler_gfx.ts:94` · `src/pokenav_region_map.ts:171` |
| `BG_COORD_SET` | enum_member | `include/bg.h:26` | `src/easy_chat.ts:323` · `src/main_menu.ts:142` · `src/match_call.ts:95` · `src/menu.ts:217` · `src/option_menu.ts:539` · `src/overworld.ts:144` · `src/pokemon_storage_system.ts:5472` · `src/pokemon_summary_screen.ts:394` · `src/pokenav_conditions_gfx.ts:160` · `src/pokenav_conditions_search_results.ts:102` · `src/pokenav_list.ts:56` · `src/pokenav_main_menu.ts:201` · `src/pokenav_match_call_gfx.ts:130` · `src/pokenav_menu_handler_gfx.ts:79` · `src/pokenav_region_map.ts:170` · `src/pokenav_ribbons_list.ts:66` · `src/pokenav_ribbons_summary.ts:81` |
| `BG_COORD_SUB` | enum_member | `include/bg.h:28` | `src/main_menu.ts:144` · `src/match_call.ts:97` · `src/pokemon_summary_screen.ts:396` · `src/pokenav_list.ts:57` · `src/pokenav_main_menu.ts:202` · `src/pokenav_region_map.ts:172` |
| `BG_SCREEN_SIZE` | define | `include/gba/defines.h:44` | `include/gba/defines.ts:47` · `src/battle_intro.ts:44` |
| `BIT_SIDE` | define | `include/constants/battle.h:55` | `include/constants/battle.ts:13` · `src/battle_main.ts:5956` |
| `BLDALPHA_BLEND` | func_macro | `include/gba/io_reg.h:613` | `harness/runtime/decomp-globals.ts:2237` · `harness/runtime/decomp-helpers.ts:219` · `src/battle_intro.ts:94` · `src/battle_transition.ts:1202` · `src/field_screen_effect.ts:102` |
| `BLDCNT_EFFECT_BLEND` | define | `include/gba/io_reg.h:599` | `harness/runtime/decomp-runtime.ts:141` · `src/battle_anim_effects_2.ts:190` · `src/battle_transition.ts:1195` |
| `BLDCNT_EFFECT_DARKEN` | define | `include/gba/io_reg.h:601` | `harness/runtime/decomp-runtime.ts:143` · `src/main_menu.ts:1228` · `src/option_menu.ts:544` |
| `BLDCNT_EFFECT_LIGHTEN` | define | `include/gba/io_reg.h:600` | `harness/runtime/decomp-runtime.ts:142` · `src/battle_transition.ts:1198` · `src/intro.ts:174` · `src/title_screen.ts:75` |
| `BLDCNT_TGT2_ALL` | define | `include/gba/io_reg.h:610` | `src/battle_anim_effects_2.ts:189` · `src/battle_anim_psychic.ts:68` · `src/battle_transition.ts:1196` · `src/pokenav_menu_handler_gfx.ts:93` · `src/title_screen.ts:76` |
| `B_ACTION_NONE` | define | `include/battle.h:44` | `include/battle.ts:25` · `src/battle_main.ts:4108` |
| `B_ANIM_HAIL_CONTINUES` | define | `include/constants/battle_anim.h:370` | `include/constants/battle_anim.ts:643` · `src/battle_util.ts:3621` |
| `B_ANIM_SANDSTORM_CONTINUES` | define | `include/constants/battle_anim.h:369` | `include/constants/battle_anim.ts:642` · `src/battle_util.ts:3620` |
| `B_ANIM_STATUS_PSN` | define | `include/constants/battle_anim.h:391` | `include/constants/battle_anim.ts:660` · `src/battle_gfx_sfx_util.ts:835` |
| `B_BUTTON` | define | `include/gba/io_reg.h:700` | `include/gba/io_reg.ts:958` · `src/battle_controllers.ts:1445` · `src/battle_main.ts:525` · `src/easy_chat.ts:528` · `src/list_menu.ts:317` |
| `B_COMM_TO_CONTROLLER` | enum_member | `include/battle_controllers.h:115` | `src/battle_controllers.ts:78` · `src/battle_main.ts:2596` · `src/engine/battle/constants.ts:1295` |
| `B_COMM_TO_ENGINE` | enum_member | `include/battle_controllers.h:118` | `src/battle_ai_switch_items.ts:199` · `src/battle_controllers.ts:80` |
| `B_FLANK_LEFT` | define | `include/constants/battle.h:52` | `include/constants/battle.ts:11` · `src/battle_main.ts:2595` |
| `B_MSG_ABILITY_PREVENTS_ABILITY_STATUS` | define | `include/constants/battle_string_ids.h:578` | `include/constants/battle_string_ids.ts:498` · `src/battle_script_commands.ts:13186` |
| `B_MSG_ABILITY_PREVENTS_MOVE_STATUS` | define | `include/constants/battle_string_ids.h:577` | `include/constants/battle_string_ids.ts:497` · `src/battle_script_commands.ts:13187` |
| `B_MSG_CANT_ESCAPE` | define | `include/constants/battle_string_ids.h:565` | `include/constants/battle_string_ids.ts:490` · `src/battle_util.ts:1356` |
| `B_MSG_DONT_LEAVE_BIRCH` | define | `include/constants/battle_string_ids.h:566` | `include/constants/battle_string_ids.ts:491` · `src/battle_util.ts:1357` |
| `B_MSG_DOWNPOUR_CONTINUES` | define | `include/constants/battle_string_ids.h:446` | `include/constants/battle_string_ids.ts:423` · `src/battle_util.ts:3613` |
| `B_MSG_FLASH_FIRE_BOOST` | define | `include/constants/battle_string_ids.h:557` | `include/constants/battle_string_ids.ts:486` · `src/battle_util.ts:2881` |
| `B_MSG_FLASH_FIRE_NO_BOOST` | define | `include/constants/battle_string_ids.h:558` | `include/constants/battle_string_ids.ts:487` · `src/battle_util.ts:2882` |
| `B_MSG_HAIL` | define | `include/constants/battle_string_ids.h:451` | `include/constants/battle_string_ids.ts:426` · `src/battle_util.ts:3616` |
| `B_MSG_INCAPABLE_OF_POWER` | define | `include/constants/battle_string_ids.h:542` | `include/constants/battle_string_ids.ts:479` · `src/battle_util.ts:282` |
| `B_MSG_PREVENTS_ESCAPE` | define | `include/constants/battle_string_ids.h:567` | `include/constants/battle_string_ids.ts:492` · `src/battle_util.ts:1358` |
| `B_MSG_RAIN_CONTINUES` | define | `include/constants/battle_string_ids.h:445` | `include/constants/battle_string_ids.ts:422` · `src/battle_util.ts:3612` |
| `B_MSG_RAIN_STOPPED` | define | `include/constants/battle_string_ids.h:447` | `include/constants/battle_string_ids.ts:424` · `src/battle_util.ts:3614` |
| `B_MSG_REST` | define | `include/constants/battle_string_ids.h:467` | `include/constants/battle_string_ids.ts:436` · `src/battle_script_commands.ts:6092` |
| `B_MSG_REST_STATUSED` | define | `include/constants/battle_string_ids.h:468` | `include/constants/battle_string_ids.ts:437` · `src/battle_script_commands.ts:6093` |
| `B_MSG_SANDSTORM` | define | `include/constants/battle_string_ids.h:450` | `include/constants/battle_string_ids.ts:425` · `src/battle_util.ts:3615` |
| `B_MSG_STATUSED` | define | `include/constants/battle_string_ids.h:573` | `include/constants/battle_string_ids.ts:495` · `src/battle_script_commands.ts:13189` |
| `B_MSG_STATUSED_BY_ABILITY` | define | `include/constants/battle_string_ids.h:574` | `include/constants/battle_string_ids.ts:496` · `src/battle_script_commands.ts:13190` |
| `B_MSG_STATUS_HAD_NO_EFFECT` | define | `include/constants/battle_string_ids.h:579` | `include/constants/battle_string_ids.ts:499` · `src/battle_script_commands.ts:13188` |
| `B_OUTCOME_FORFEITED` | define | `include/constants/battle.h:108` | `include/constants/battle.ts:93` · `src/battle_main.ts:4112` |
| `B_OUTCOME_MON_FLED` | define | `include/constants/battle.h:105` | `include/constants/battle.ts:90` · `src/battle_main.ts:2357` |
| `B_OUTCOME_NO_SAFARI_BALLS` | define | `include/constants/battle.h:107` | `include/constants/battle.ts:92` · `src/battle_main.ts:2359` |
| `B_POSITION_OPPONENT_LEFT` | enum_member | `include/constants/battle.h:29` | `include/constants/battle.ts:449` · `src/battle_controller_player.ts:999` · `src/pokeball.ts:235` |
| `B_POSITION_OPPONENT_RIGHT` | enum_member | `include/constants/battle.h:31` | `include/constants/battle.ts:451` · `src/battle_controller_player.ts:1000` · `src/battle_controllers.ts:367` · `src/pokeball.ts:237` |
| `B_POSITION_PLAYER_LEFT` | enum_member | `include/constants/battle.h:28` | `include/constants/battle.ts:448` · `src/pokeball.ts:234` |
| `B_POSITION_PLAYER_RIGHT` | enum_member | `include/constants/battle.h:30` | `include/constants/battle.ts:450` · `src/battle_controllers.ts:366` · `src/battle_interface.ts:1122` · `src/pokeball.ts:236` |
| `B_SIDE_OPPONENT` | define | `include/constants/battle.h:49` | `include/constants/battle.ts:9` · `src/battle_anim_effects_2.ts:186` |
| `B_SIDE_PLAYER` | define | `include/constants/battle.h:48` | `include/constants/battle.ts:8` · `src/battle_anim_effects_2.ts:185` · `src/battle_anim_psychic.ts:78` · `src/battle_controllers.ts:82` |
| `B_WIN_MSG` | define | `include/constants/battle.h:345` | `include/constants/battle.ts:397` · `src/battle_main.ts:4171` |
| `CASTFORM_FIRE` | define | `include/constants/battle.h:327` | `include/constants/battle.ts:384` · `src/battle_util.ts:2783` |
| `CASTFORM_ICE` | define | `include/constants/battle.h:329` | `include/constants/battle.ts:386` · `src/battle_util.ts:2785` |
| `CASTFORM_NORMAL` | define | `include/constants/battle.h:326` | `include/constants/battle.ts:383` · `src/battle_util.ts:2782` |
| `CASTFORM_WATER` | define | `include/constants/battle.h:328` | `include/constants/battle.ts:385` · `src/battle_util.ts:2784` |
| `CHAR_SPACE` | define | `include/constants/characters.h:4` | `include/constants/characters.ts:8` · `src/mail_data.ts:96` · `src/pokemon_storage_system.ts:263` |
| `COLLISION_ELEVATION_MISMATCH` | enum_member | `include/global.fieldmap.h:313` | `src/event_object_movement.ts:1775` · `src/field_player_avatar.ts:959` |
| `COLLISION_HORIZONTAL_RAIL` | enum_member | `include/global.fieldmap.h:323` | `src/event_object_movement.ts:1785` · `src/field_player_avatar.ts:969` |
| `COLLISION_IMPASSABLE` | enum_member | `include/global.fieldmap.h:312` | `src/event_object_movement.ts:1774` · `src/field_player_avatar.ts:958` |
| `COLLISION_ISOLATED_HORIZONTAL_RAIL` | enum_member | `include/global.fieldmap.h:321` | `src/event_object_movement.ts:1783` · `src/field_player_avatar.ts:967` |
| `COLLISION_ISOLATED_VERTICAL_RAIL` | enum_member | `include/global.fieldmap.h:320` | `src/event_object_movement.ts:1782` · `src/field_player_avatar.ts:966` |
| `COLLISION_LEDGE_JUMP` | enum_member | `include/global.fieldmap.h:316` | `src/event_object_movement.ts:1778` · `src/field_player_avatar.ts:962` |
| `COLLISION_NONE` | enum_member | `include/global.fieldmap.h:310` | `src/event_object_movement.ts:1772` · `src/field_player_avatar.ts:957` |
| `COLLISION_OBJECT_EVENT` | enum_member | `include/global.fieldmap.h:314` | `src/event_object_movement.ts:1776` · `src/field_player_avatar.ts:960` |
| `COLLISION_PUSHED_BOULDER` | enum_member | `include/global.fieldmap.h:317` | `src/event_object_movement.ts:1779` · `src/field_player_avatar.ts:963` |
| `COLLISION_ROTATING_GATE` | enum_member | `include/global.fieldmap.h:318` | `src/event_object_movement.ts:1780` · `src/field_player_avatar.ts:964` |
| `COLLISION_STOP_SURFING` | enum_member | `include/global.fieldmap.h:315` | `src/event_object_movement.ts:1777` · `src/field_player_avatar.ts:961` |
| `COLLISION_VERTICAL_RAIL` | enum_member | `include/global.fieldmap.h:322` | `src/event_object_movement.ts:1784` · `src/field_player_avatar.ts:968` |
| `COLLISION_WHEELIE_HOP` | enum_member | `include/global.fieldmap.h:319` | `src/event_object_movement.ts:1781` · `src/field_player_avatar.ts:965` |
| `CONDITION_GRAPH_LOAD_MAX` | define | `include/menu_specialized.h:55` | `src/menu_specialized.ts:225` · `src/pokenav_conditions_gfx.ts:180` |
| `CONDITION_LOAD_GRAPH` | enum_member | `include/pokenav.h:265` | `src/pokenav_conditions.ts:66` · `src/pokenav_conditions_gfx.ts:169` |
| `CONDITION_LOAD_MON_INFO` | enum_member | `include/pokenav.h:264` | `src/pokenav_conditions.ts:65` · `src/pokenav_conditions_gfx.ts:168` |
| `CONDITION_LOAD_MON_PIC` | enum_member | `include/pokenav.h:266` | `src/pokenav_conditions.ts:67` · `src/pokenav_conditions_gfx.ts:170` |
| `CONNECTION_EAST` | define | `include/constants/global.h:152` | `include/constants/global.ts:134` · `src/fieldmap.ts:944` |
| `CONNECTION_NORTH` | define | `include/constants/global.h:150` | `include/constants/global.ts:132` · `src/fieldmap.ts:942` |
| `CONNECTION_SOUTH` | define | `include/constants/global.h:149` | `include/constants/global.ts:131` · `src/fieldmap.ts:941` |
| `CONNECTION_WEST` | define | `include/constants/global.h:151` | `include/constants/global.ts:133` · `src/fieldmap.ts:943` |
| `CONTESTANT_COUNT` | define | `include/constants/global.h:85` | `include/constants/global.ts:75` · `src/engine/save/save-blocks.ts:71` |
| `CONTEST_CATEGORIES_COUNT` | define | `include/constants/global.h:91` | `include/constants/global.ts:81` · `src/engine/save/save-blocks.ts:70` |
| `CONTEST_CATEGORY_BEAUTY` | define | `include/constants/global.h:87` | `include/constants/global.ts:77` · `src/contest.ts:31` |
| `CONTEST_CATEGORY_COOL` | define | `include/constants/global.h:86` | `include/constants/global.ts:76` · `src/contest.ts:30` |
| `CONTEST_CATEGORY_CUTE` | define | `include/constants/global.h:88` | `include/constants/global.ts:78` · `src/contest.ts:32` |
| `CONTEST_CATEGORY_SMART` | define | `include/constants/global.h:89` | `include/constants/global.ts:79` · `src/contest.ts:33` |
| `CONTEST_CATEGORY_TOUGH` | define | `include/constants/global.h:90` | `include/constants/global.ts:80` · `src/contest.ts:34` |
| `CONTEST_LADY_GOOD` | define | `include/constants/lilycove_lady.h:27` | `src/lilycove_lady.ts:289` · `src/tv.ts:110` |
| `CONTEST_LADY_NORMAL` | define | `include/constants/lilycove_lady.h:26` | `src/lilycove_lady.ts:288` · `src/tv.ts:111` |
| `CONTEST_RANK_HYPER` | define | `include/constants/contest.h:17` | `src/contest.ts:23` · `src/tv.ts:89` |
| `CONTEST_RANK_MASTER` | define | `include/constants/contest.h:18` | `src/contest.ts:24` · `src/tv.ts:90` |
| `CONTEST_RANK_NORMAL` | define | `include/constants/contest.h:15` | `src/contest.ts:21` · `src/tv.ts:87` |
| `CONTEST_RANK_SUPER` | define | `include/constants/contest.h:16` | `src/contest.ts:22` · `src/tv.ts:88` |
| `CONTROLLER_23` | enum_member | `include/battle_controllers.h:209` | `src/battle_controller_opponent.ts:150` · `src/battle_controller_player.ts:204` · `src/battle_controller_player_partner.ts:123` · `src/engine/battle/battle-event-queue.ts:73` |
| `CONTROLLER_32` | enum_member | `include/battle_controllers.h:218` | `src/battle_controller_opponent.ts:159` · `src/battle_controller_player.ts:213` · `src/battle_controller_player_partner.ts:132` · `src/engine/battle/battle-event-queue.ts:82` |
| `CONTROLLER_BALLTHROWANIM` | enum_member | `include/battle_controllers.h:199` | `src/battle_controller_opponent.ts:140` · `src/battle_controller_player.ts:194` · `src/battle_controller_player_partner.ts:113` · `src/engine/battle/battle-event-queue.ts:63` |
| `CONTROLLER_BATTLEANIMATION` | enum_member | `include/battle_controllers.h:238` | `src/battle_controller_opponent.ts:179` · `src/battle_controller_player.ts:233` · `src/battle_controller_player_partner.ts:152` · `src/engine/battle/battle-event-queue.ts:102` |
| `CONTROLLER_CANTSWITCH` | enum_member | `include/battle_controllers.h:228` | `src/battle_controller_opponent.ts:169` · `src/battle_controller_player.ts:223` · `src/battle_controller_player_partner.ts:142` · `src/engine/battle/battle-event-queue.ts:92` |
| `CONTROLLER_CHOOSEACTION` | enum_member | `include/battle_controllers.h:204` | `src/battle_controller_opponent.ts:145` · `src/battle_controller_player.ts:199` · `src/battle_controller_player_partner.ts:118` · `src/battle_main.ts:2617` · `src/engine/battle/battle-event-queue.ts:68` |
| `CONTROLLER_CHOOSEMOVE` | enum_member | `include/battle_controllers.h:206` | `src/battle_controller_opponent.ts:147` · `src/battle_controller_player.ts:201` · `src/battle_controller_player_partner.ts:120` · `src/battle_main.ts:2618` · `src/engine/battle/battle-event-queue.ts:70` |
| `CONTROLLER_CHOOSEPOKEMON` | enum_member | `include/battle_controllers.h:208` | `src/battle_controller_opponent.ts:149` · `src/battle_controller_player.ts:203` · `src/battle_controller_player_partner.ts:122` · `src/battle_main.ts:2620` · `src/engine/battle/battle-event-queue.ts:72` |
| `CONTROLLER_CHOSENMONRETURNVALUE` | enum_member | `include/battle_controllers.h:220` | `src/battle_controller_opponent.ts:161` · `src/battle_controller_player.ts:215` · `src/battle_controller_player_partner.ts:134` · `src/engine/battle/battle-event-queue.ts:84` |
| `CONTROLLER_CLEARUNKFLAG` | enum_member | `include/battle_controllers.h:225` | `src/battle_controller_opponent.ts:166` · `src/battle_controller_player.ts:220` · `src/battle_controller_player_partner.ts:139` · `src/engine/battle/battle-event-queue.ts:89` |
| `CONTROLLER_CLEARUNKVAR` | enum_member | `include/battle_controllers.h:223` | `src/battle_controller_opponent.ts:164` · `src/battle_controller_player.ts:218` · `src/battle_controller_player_partner.ts:137` · `src/engine/battle/battle-event-queue.ts:87` |
| `CONTROLLER_CMDS_COUNT` | enum_member | `include/battle_controllers.h:244` | `src/battle_controller_opponent.ts:123` · `src/battle_controller_player.ts:172` · `src/battle_controller_player_partner.ts:95` |
| `CONTROLLER_DATATRANSFER` | enum_member | `include/battle_controllers.h:215` | `src/battle_controller_opponent.ts:156` · `src/battle_controller_player.ts:210` · `src/battle_controller_player_partner.ts:129` · `src/engine/battle/battle-event-queue.ts:79` |
| `CONTROLLER_DMA3TRANSFER` | enum_member | `include/battle_controllers.h:216` | `src/battle_controller_opponent.ts:157` · `src/battle_controller_player.ts:211` · `src/battle_controller_player_partner.ts:130` · `src/engine/battle/battle-event-queue.ts:80` |
| `CONTROLLER_DRAWPARTYSTATUSSUMMARY` | enum_member | `include/battle_controllers.h:234` | `src/battle_controller_opponent.ts:175` · `src/battle_controller_player.ts:229` · `src/battle_controller_player_partner.ts:148` · `src/engine/battle/battle-event-queue.ts:98` |
| `CONTROLLER_DRAWTRAINERPIC` | enum_member | `include/battle_controllers.h:193` | `src/battle_controller_opponent.ts:134` · `src/battle_controller_player.ts:188` · `src/battle_controller_player_partner.ts:107` · `src/engine/battle/battle-event-queue.ts:57` |
| `CONTROLLER_ENDBOUNCE` | enum_member | `include/battle_controllers.h:236` | `src/battle_controller_opponent.ts:177` · `src/battle_controller_player.ts:231` · `src/battle_controller_player_partner.ts:150` · `src/engine/battle/battle-event-queue.ts:100` |
| `CONTROLLER_ENDLINKBATTLE` | enum_member | `include/battle_controllers.h:241` | `src/battle_controller_opponent.ts:182` · `src/battle_controller_player.ts:236` · `src/battle_controller_player_partner.ts:155` · `src/engine/battle/battle-event-queue.ts:105` |
| `CONTROLLER_EXPUPDATE` | enum_member | `include/battle_controllers.h:211` | `src/battle_controller_opponent.ts:152` · `src/battle_controller_player.ts:206` · `src/battle_controller_player_partner.ts:125` · `src/engine/battle/battle-event-queue.ts:75` |
| `CONTROLLER_FAINTANIMATION` | enum_member | `include/battle_controllers.h:196` | `src/battle_controller_opponent.ts:137` · `src/battle_controller_player.ts:191` · `src/battle_controller_player_partner.ts:110` · `src/engine/battle/battle-event-queue.ts:60` |
| `CONTROLLER_FAINTINGCRY` | enum_member | `include/battle_controllers.h:231` | `src/battle_controller_opponent.ts:172` · `src/battle_controller_player.ts:226` · `src/battle_controller_player_partner.ts:145` · `src/engine/battle/battle-event-queue.ts:95` |
| `CONTROLLER_GETMONDATA` | enum_member | `include/battle_controllers.h:186` | `src/battle_controller_opponent.ts:127` · `src/battle_controller_player.ts:181` · `src/battle_controller_player_partner.ts:100` · `src/engine/battle/battle-event-queue.ts:50` |
| `CONTROLLER_GETRAWMONDATA` | enum_member | `include/battle_controllers.h:187` | `src/battle_controller_opponent.ts:128` · `src/battle_controller_player.ts:182` · `src/battle_controller_player_partner.ts:101` · `src/engine/battle/battle-event-queue.ts:51` |
| `CONTROLLER_HEALTHBARUPDATE` | enum_member | `include/battle_controllers.h:210` | `src/battle_controller_opponent.ts:151` · `src/battle_controller_player.ts:205` · `src/battle_controller_player_partner.ts:124` · `src/engine/battle/battle-event-queue.ts:74` |
| `CONTROLLER_HIDEPARTYSTATUSSUMMARY` | enum_member | `include/battle_controllers.h:235` | `src/battle_controller_opponent.ts:176` · `src/battle_controller_player.ts:230` · `src/battle_controller_player_partner.ts:149` · `src/engine/battle/battle-event-queue.ts:99` |
| `CONTROLLER_HITANIMATION` | enum_member | `include/battle_controllers.h:227` | `src/battle_controller_opponent.ts:168` · `src/battle_controller_player.ts:222` · `src/battle_controller_player_partner.ts:141` · `src/engine/battle/battle-event-queue.ts:91` |
| `CONTROLLER_INTROSLIDE` | enum_member | `include/battle_controllers.h:232` | `src/battle_controller_opponent.ts:173` · `src/battle_controller_player.ts:227` · `src/battle_controller_player_partner.ts:146` · `src/engine/battle/battle-event-queue.ts:96` |
| `CONTROLLER_INTROTRAINERBALLTHROW` | enum_member | `include/battle_controllers.h:233` | `src/battle_controller_opponent.ts:174` · `src/battle_controller_player.ts:228` · `src/battle_controller_player_partner.ts:147` · `src/engine/battle/battle-event-queue.ts:97` |
| `CONTROLLER_LINKSTANDBYMSG` | enum_member | `include/battle_controllers.h:239` | `src/battle_controller_opponent.ts:180` · `src/battle_controller_player.ts:234` · `src/battle_controller_player_partner.ts:153` · `src/battle_main.ts:2621` · `src/engine/battle/battle-event-queue.ts:103` |
| `CONTROLLER_LOADMONSPRITE` | enum_member | `include/battle_controllers.h:190` | `src/battle_controller_opponent.ts:131` · `src/battle_controller_player.ts:185` · `src/battle_controller_player_partner.ts:104` · `src/engine/battle/battle-event-queue.ts:54` |
| `CONTROLLER_MOVEANIMATION` | enum_member | `include/battle_controllers.h:201` | `src/battle_controller_opponent.ts:142` · `src/battle_controller_player.ts:196` · `src/battle_controller_player_partner.ts:115` · `src/engine/battle/battle-event-queue.ts:65` |
| `CONTROLLER_ONERETURNVALUE` | enum_member | `include/battle_controllers.h:221` | `src/battle_controller_opponent.ts:162` · `src/battle_controller_player.ts:216` · `src/battle_controller_player_partner.ts:135` · `src/battle_controllers.ts:268` · `src/engine/battle/battle-event-queue.ts:85` |
| `CONTROLLER_ONERETURNVALUE_DUPLICATE` | enum_member | `include/battle_controllers.h:222` | `src/battle_controller_opponent.ts:163` · `src/battle_controller_player.ts:217` · `src/battle_controller_player_partner.ts:136` · `src/engine/battle/battle-event-queue.ts:86` |
| `CONTROLLER_OPENBAG` | enum_member | `include/battle_controllers.h:207` | `src/battle_controller_opponent.ts:148` · `src/battle_controller_player.ts:202` · `src/battle_controller_player_partner.ts:121` · `src/battle_main.ts:2619` · `src/engine/battle/battle-event-queue.ts:71` |
| `CONTROLLER_PALETTEFADE` | enum_member | `include/battle_controllers.h:197` | `src/battle_controller_opponent.ts:138` · `src/battle_controller_player.ts:192` · `src/battle_controller_player_partner.ts:111` · `src/engine/battle/battle-event-queue.ts:61` |
| `CONTROLLER_PAUSE` | enum_member | `include/battle_controllers.h:200` | `src/battle_controller_opponent.ts:141` · `src/battle_controller_player.ts:195` · `src/battle_controller_player_partner.ts:114` · `src/engine/battle/battle-event-queue.ts:64` |
| `CONTROLLER_PLAYBGM` | enum_member | `include/battle_controllers.h:217` | `src/battle_controller_opponent.ts:158` · `src/battle_controller_player.ts:212` · `src/battle_controller_player_partner.ts:131` · `src/engine/battle/battle-event-queue.ts:81` |
| `CONTROLLER_PLAYFANFAREORBGM` | enum_member | `include/battle_controllers.h:230` | `src/battle_controller_opponent.ts:171` · `src/battle_controller_player.ts:225` · `src/battle_controller_player_partner.ts:144` · `src/engine/battle/battle-event-queue.ts:94` |
| `CONTROLLER_PLAYSE` | enum_member | `include/battle_controllers.h:229` | `src/battle_controller_opponent.ts:170` · `src/battle_controller_player.ts:224` · `src/battle_controller_player_partner.ts:143` · `src/engine/battle/battle-event-queue.ts:93` |
| `CONTROLLER_PRINTSTRING` | enum_member | `include/battle_controllers.h:202` | `src/battle_controller_opponent.ts:143` · `src/battle_controller_player.ts:197` · `src/battle_controller_player_partner.ts:116` · `src/engine/battle/battle-event-queue.ts:66` |
| `CONTROLLER_PRINTSTRINGPLAYERONLY` | enum_member | `include/battle_controllers.h:203` | `src/battle_controller_opponent.ts:144` · `src/battle_controller_player.ts:198` · `src/battle_controller_player_partner.ts:117` · `src/engine/battle/battle-event-queue.ts:67` |
| `CONTROLLER_RESETACTIONMOVESELECTION` | enum_member | `include/battle_controllers.h:240` | `src/battle_controller_opponent.ts:181` · `src/battle_controller_player.ts:235` · `src/battle_controller_player_partner.ts:154` · `src/engine/battle/battle-event-queue.ts:104` |
| `CONTROLLER_RETURNMONTOBALL` | enum_member | `include/battle_controllers.h:192` | `src/battle_controller_opponent.ts:133` · `src/battle_controller_player.ts:187` · `src/battle_controller_player_partner.ts:106` · `src/engine/battle/battle-event-queue.ts:56` |
| `CONTROLLER_SETMONDATA` | enum_member | `include/battle_controllers.h:188` | `src/battle_controller_opponent.ts:129` · `src/battle_controller_player.ts:183` · `src/battle_controller_player_partner.ts:102` · `src/engine/battle/battle-event-queue.ts:52` |
| `CONTROLLER_SETRAWMONDATA` | enum_member | `include/battle_controllers.h:189` | `src/battle_controller_opponent.ts:130` · `src/battle_controller_player.ts:184` · `src/battle_controller_player_partner.ts:103` · `src/engine/battle/battle-event-queue.ts:53` |
| `CONTROLLER_SETUNKVAR` | enum_member | `include/battle_controllers.h:224` | `src/battle_controller_opponent.ts:165` · `src/battle_controller_player.ts:219` · `src/battle_controller_player_partner.ts:138` · `src/engine/battle/battle-event-queue.ts:88` |
| `CONTROLLER_SPRITEINVISIBILITY` | enum_member | `include/battle_controllers.h:237` | `src/battle_controller_opponent.ts:178` · `src/battle_controller_player.ts:232` · `src/battle_controller_player_partner.ts:151` · `src/engine/battle/battle-event-queue.ts:101` |
| `CONTROLLER_STATUSANIMATION` | enum_member | `include/battle_controllers.h:213` | `src/battle_controller_opponent.ts:154` · `src/battle_controller_player.ts:208` · `src/battle_controller_player_partner.ts:127` · `src/engine/battle/battle-event-queue.ts:77` |
| `CONTROLLER_STATUSICONUPDATE` | enum_member | `include/battle_controllers.h:212` | `src/battle_controller_opponent.ts:153` · `src/battle_controller_player.ts:207` · `src/battle_controller_player_partner.ts:126` · `src/engine/battle/battle-event-queue.ts:76` |
| `CONTROLLER_STATUSXOR` | enum_member | `include/battle_controllers.h:214` | `src/battle_controller_opponent.ts:155` · `src/battle_controller_player.ts:209` · `src/battle_controller_player_partner.ts:128` · `src/engine/battle/battle-event-queue.ts:78` |
| `CONTROLLER_SUCCESSBALLTHROWANIM` | enum_member | `include/battle_controllers.h:198` | `src/battle_controller_opponent.ts:139` · `src/battle_controller_player.ts:193` · `src/battle_controller_player_partner.ts:112` · `src/engine/battle/battle-event-queue.ts:62` |
| `CONTROLLER_SWITCHINANIM` | enum_member | `include/battle_controllers.h:191` | `src/battle_controller_opponent.ts:132` · `src/battle_controller_player.ts:186` · `src/battle_controller_player_partner.ts:105` · `src/engine/battle/battle-event-queue.ts:55` |
| `CONTROLLER_TERMINATOR_NOP` | enum_member | `include/battle_controllers.h:243` | `src/battle_controller_opponent.ts:124` · `src/battle_controller_player.ts:175` · `src/battle_controller_player_partner.ts:97` |
| `CONTROLLER_TOGGLEUNKFLAG` | enum_member | `include/battle_controllers.h:226` | `src/battle_controller_opponent.ts:167` · `src/battle_controller_player.ts:221` · `src/battle_controller_player_partner.ts:140` · `src/engine/battle/battle-event-queue.ts:90` |
| `CONTROLLER_TRAINERSLIDE` | enum_member | `include/battle_controllers.h:194` | `src/battle_controller_opponent.ts:135` · `src/battle_controller_player.ts:189` · `src/battle_controller_player_partner.ts:108` · `src/engine/battle/battle-event-queue.ts:58` |
| `CONTROLLER_TRAINERSLIDEBACK` | enum_member | `include/battle_controllers.h:195` | `src/battle_controller_opponent.ts:136` · `src/battle_controller_player.ts:190` · `src/battle_controller_player_partner.ts:109` · `src/engine/battle/battle-event-queue.ts:59` |
| `CONTROLLER_TWORETURNVALUES` | enum_member | `include/battle_controllers.h:219` | `src/battle_controller_opponent.ts:160` · `src/battle_controller_player.ts:214` · `src/battle_controller_player_partner.ts:133` · `src/battle_controllers.ts:247` · `src/engine/battle/battle-event-queue.ts:83` |
| `CONTROLLER_YESNOBOX` | enum_member | `include/battle_controllers.h:205` | `src/battle_controller_opponent.ts:146` · `src/battle_controller_player.ts:200` · `src/battle_controller_player_partner.ts:119` |
| `COPYWIN_FULL` | enum_member | `include/window.h:24` | `src/battle_controllers.ts:1242` · `src/easy_chat.ts:319` · `src/mail.ts:115` · `src/main_menu.ts:1229` · `src/option_menu.ts:541` · `src/pokemon_storage_system.ts:3740` · `src/window.ts:553` |
| `COPYWIN_GFX` | enum_member | `include/window.h:23` | `src/easy_chat.ts:320` · `src/list_menu.ts:419` · `src/main_menu.ts:1230` · `src/option_menu.ts:540` · `src/window.ts:552` |
| `COPYWIN_MAP` | enum_member | `include/window.h:22` | `src/list_menu.ts:420` · `src/window.ts:551` |
| `COPY_MOVE_WALK` | define | `include/constants/event_object_movement.h:326` | `include/constants/event_object_movement.ts:346` · `src/bike.ts:92` |
| `CRY_MODE_NORMAL` | define | `include/constants/sound.h:23` | `include/constants/sound.ts:24` · `src/intro.ts:175` |
| `CRY_PRIORITY_NORMAL` | define | `include/constants/sound.h:41` | `include/constants/sound.ts:42` · `src/intro.ts:176` |
| `CityMapEntry` | struct | `src/pokenav_region_map.c:42` | `src/data/region_map/city_map_entries.ts:28` · `src/pokenav_region_map.ts:198` |
| `ContestMove` | struct | `include/contest_effect.h:4` | `src/contest_effect.ts:101` · `src/engine/data/game-data.ts:62` |
| `Coords8` | struct | `include/global.h:168` | `src/engine/save/save-blocks.ts:111` · `src/rotating_gate.ts:155` |
| `CreditsEntry` | struct | `src/credits.c:76` | `src/credits.ts:180` · `src/data/credits.ts:14` |
| `DAYCARE_MON_COUNT` | define | `include/constants/global.h:44` | `include/constants/global.ts:40` · `src/daycare.ts:133` · `src/engine/save/save-blocks.ts:85` |
| `DECORCAT_CHAIR` | enum_member | `include/decoration.h:33` | `src/data/decoration/header.ts:198` · `src/decoration_inventory.ts:53` |
| `DECORCAT_CUSHION` | enum_member | `include/decoration.h:39` | `src/data/decoration/header.ts:204` · `src/decoration_inventory.ts:59` |
| `DECORCAT_DESK` | enum_member | `include/decoration.h:32` | `src/data/decoration/header.ts:197` · `src/decoration_inventory.ts:52` |
| `DECORCAT_DOLL` | enum_member | `include/decoration.h:38` | `src/data/decoration/header.ts:203` · `src/decoration_inventory.ts:58` |
| `DECORCAT_MAT` | enum_member | `include/decoration.h:36` | `src/data/decoration/header.ts:201` · `src/decoration_inventory.ts:56` |
| `DECORCAT_ORNAMENT` | enum_member | `include/decoration.h:35` | `src/data/decoration/header.ts:200` · `src/decoration_inventory.ts:55` |
| `DECORCAT_PLANT` | enum_member | `include/decoration.h:34` | `src/data/decoration/header.ts:199` · `src/decoration_inventory.ts:54` |
| `DECORCAT_POSTER` | enum_member | `include/decoration.h:37` | `src/data/decoration/header.ts:202` · `src/decoration_inventory.ts:57` |
| `DECORPERM_BEHIND_FLOOR` | enum_member | `include/decoration.h:11` | `src/data/decoration/header.ts:180` · `src/decoration.ts:1076` |
| `DECORPERM_NA_WALL` | enum_member | `include/decoration.h:12` | `src/data/decoration/header.ts:181` · `src/decoration.ts:1077` |
| `DECORPERM_PASS_FLOOR` | enum_member | `include/decoration.h:10` | `src/data/decoration/header.ts:179` · `src/decoration.ts:1075` |
| `DECORPERM_SOLID_FLOOR` | enum_member | `include/decoration.h:9` | `src/data/decoration/header.ts:178` · `src/decoration.ts:1074` |
| `DECORPERM_SPRITE` | enum_member | `include/decoration.h:13` | `src/data/decoration/header.ts:182` · `src/decoration.ts:1078` · `src/secret_base.ts:278` |
| `DECORSHAPE_1x1` | enum_member | `include/decoration.h:18` | `src/data/decoration/header.ts:185` · `src/decoration.ts:1079` |
| `DECORSHAPE_1x2` | enum_member | `include/decoration.h:23` | `src/data/decoration/header.ts:190` · `src/decoration.ts:1084` |
| `DECORSHAPE_2x1` | enum_member | `include/decoration.h:19` | `src/data/decoration/header.ts:186` · `src/decoration.ts:1080` |
| `DECORSHAPE_2x2` | enum_member | `include/decoration.h:22` | `src/data/decoration/header.ts:189` · `src/decoration.ts:1083` |
| `DECORSHAPE_2x4` | enum_member | `include/decoration.h:25` | `src/data/decoration/header.ts:192` · `src/decoration.ts:1086` |
| `DECORSHAPE_3x2` | enum_member | `include/decoration.h:27` | `src/data/decoration/header.ts:194` · `src/decoration.ts:1088` |
| `DECORSHAPE_3x3` | enum_member | `include/decoration.h:26` | `src/data/decoration/header.ts:193` · `src/decoration.ts:1087` |
| `DECORSHAPE_4x2` | enum_member | `include/decoration.h:21` | `src/data/decoration/header.ts:188` · `src/decoration.ts:1082` |
| `DECOR_MAX_PLAYERS_HOUSE` | define | `include/constants/global.h:58` | `include/constants/global.ts:55` · `src/engine/save/save-blocks.ts:60` |
| `DECOR_MAX_SECRET_BASE` | define | `include/constants/global.h:57` | `include/constants/global.ts:54` · `src/engine/save/save-blocks.ts:61` |
| `DEX_MODE_NATIONAL` | enum_member | `include/pokedex.h:10` | `include/pokedex.ts:17` · `src/event_data.ts:229` |
| `DIR_EAST` | define | `include/constants/global.h:141` | `include/constants/global.ts:124` · `include/global.fieldmap.ts:16` · `src/field_player_avatar.ts:254` |
| `DIR_NONE` | define | `include/constants/global.h:137` | `include/constants/global.ts:120` · `include/global.fieldmap.ts:12` · `src/field_player_avatar.ts:250` |
| `DIR_NORTH` | define | `include/constants/global.h:139` | `include/constants/global.ts:122` · `include/global.fieldmap.ts:14` · `src/field_player_avatar.ts:252` |
| `DIR_NORTHEAST` | define | `include/constants/global.h:145` | `include/constants/global.ts:128` · `include/global.fieldmap.ts:20` |
| `DIR_NORTHWEST` | define | `include/constants/global.h:144` | `include/constants/global.ts:127` · `include/global.fieldmap.ts:19` |
| `DIR_SOUTH` | define | `include/constants/global.h:138` | `include/constants/global.ts:121` · `include/global.fieldmap.ts:13` · `src/field_player_avatar.ts:251` |
| `DIR_SOUTHEAST` | define | `include/constants/global.h:143` | `include/constants/global.ts:126` · `include/global.fieldmap.ts:18` |
| `DIR_SOUTHWEST` | define | `include/constants/global.h:142` | `include/constants/global.ts:125` · `include/global.fieldmap.ts:17` |
| `DIR_WEST` | define | `include/constants/global.h:140` | `include/constants/global.ts:123` · `include/global.fieldmap.ts:15` · `src/field_player_avatar.ts:253` |
| `DISPCNT_BG0_ON` | define | `include/gba/io_reg.h:514` | `harness/runtime/decomp-runtime.ts:122` · `harness/scenes/TestOverworldScene.ts:268` · `include/gba/io_reg.ts:759` · `src/pokedex.ts:130` |
| `DISPCNT_OBJWIN_ON` | define | `include/gba/io_reg.h:522` | `include/gba/io_reg.ts:767` · `src/battle_anim_effects_3.ts:383` · `src/battle_intro.ts:32` · `src/title_screen.ts:78` |
| `DISPCNT_WIN0_ON` | define | `include/gba/io_reg.h:520` | `harness/runtime/decomp-runtime.ts:129` · `include/gba/io_reg.ts:765` · `src/fldeff_misc.ts:120` |
| `DISPCNT_WIN1_ON` | define | `include/gba/io_reg.h:521` | `harness/runtime/decomp-runtime.ts:127` · `include/gba/io_reg.ts:766` · `src/field_screen_effect.ts:91` |
| `DISPLAY_HEIGHT` | define | `include/gba/defines.h:72` | `harness/runtime/decomp-runtime.ts:177` · `include/gba/defines.ts:61` · `src/battle_anim_effects_1b.ts:64` · `src/battle_anim_effects_2.ts:184` · `src/battle_anim_flying.ts:68` · `src/battle_controller_player.ts:1803` · `src/battle_intro.ts:43` · `src/battle_main.ts:797` · `src/event_object_movement.ts:5981` · `src/field_effect_helpers.ts:165` · `src/field_screen_effect.ts:106` · `src/pokedex.ts:959` · `src/pokemon_storage_system.ts:2456` · `src/scanline_effect.ts:34` |
| `DISPLAY_TILE_HEIGHT` | define | `include/gba/defines.h:76` | `src/field_screen_effect.ts:108` · `src/mail.ts:112` · `src/main_menu.ts:1231` |
| `DISPLAY_TILE_WIDTH` | define | `include/gba/defines.h:75` | `src/credits.ts:104` · `src/field_screen_effect.ts:107` · `src/mail.ts:111` · `src/main_menu.ts:1232` |
| `DISPLAY_WIDTH` | define | `include/gba/defines.h:71` | `harness/runtime/decomp-runtime.ts:176` · `include/gba/defines.ts:60` · `src/battle_anim_effects_1b.ts:63` · `src/battle_anim_effects_2.ts:183` · `src/battle_anim_effects_3.ts:374` · `src/battle_anim_flying.ts:67` · `src/battle_anim_poison.ts:45` · `src/battle_anim_throw.ts:92` · `src/battle_intro.ts:42` · `src/battle_main.ts:796` · `src/battle_transition.ts:66` · `src/engine/battle/battle-sendout-anim.ts:703` · `src/field_effect_helpers.ts:164` · `src/field_screen_effect.ts:105` · `src/fldeff_misc.ts:123` |
| `DLG_WINDOW_PALETTE_NUM` | define | `src/menu.c:23` | `include/menu.ts:24` · `src/start_menu.ts:161` |
| `DMG_CHANGE_SIGN` | define | `include/constants/battle_script_commands.h:363` | `include/constants/battle_script_commands.ts:130` · `src/battle_script_commands.ts:3824` |
| `DMG_DOUBLED` | define | `include/constants/battle_script_commands.h:365` | `include/constants/battle_script_commands.ts:132` · `src/battle_script_commands.ts:3826` |
| `DMG_RECOIL_FROM_MISS` | define | `include/constants/battle_script_commands.h:364` | `include/constants/battle_script_commands.ts:131` · `src/battle_script_commands.ts:3825` |
| `DPAD_ANY` | define | `include/gba/io_reg.h:713` | `src/battle_controllers.ts:1456` · `src/decoration.ts:1101` · `src/menu.ts:542` · `src/menu_helpers.ts:57` · `src/pokemon_storage_system.ts:1993` |
| `DPAD_DOWN` | define | `include/gba/io_reg.h:706` | `include/gba/io_reg.ts:964` · `src/battle_controllers.ts:1451` · `src/easy_chat.ts:534` · `src/list_menu.ts:323` · `src/menu_helpers.ts:56` |
| `DPAD_LEFT` | define | `include/gba/io_reg.h:704` | `include/gba/io_reg.ts:962` · `src/battle_controllers.ts:1449` · `src/easy_chat.ts:532` · `src/list_menu.ts:321` · `src/menu_helpers.ts:54` |
| `DPAD_RIGHT` | define | `include/gba/io_reg.h:703` | `include/gba/io_reg.ts:961` · `src/battle_controllers.ts:1448` · `src/easy_chat.ts:531` · `src/list_menu.ts:320` · `src/menu_helpers.ts:53` · `src/pokemon_storage_system.ts:3738` |
| `DPAD_UP` | define | `include/gba/io_reg.h:705` | `include/gba/io_reg.ts:963` · `src/battle_controllers.ts:1450` · `src/easy_chat.ts:533` · `src/list_menu.ts:322` · `src/menu_helpers.ts:55` · `src/pokedex.ts:796` · `src/pokemon_storage_system.ts:3737` |
| `DUMMY_WIN_TEMPLATE` | define | `include/window.h:38` | `include/window.ts:36` · `src/menu.ts:221` |
| `EASY_CHAT_BATTLE_WORDS_COUNT` | define | `include/constants/global.h:99` | `include/constants/global.ts:88` · `src/easy_chat.ts:353` · `src/engine/save/save-blocks.ts:64` |
| `EASY_CHAT_PERSON_DISPLAY_NONE` | define | `include/constants/easy_chat.h:29` | `src/easy_chat.ts:574` · `src/party_menu.ts:57` |
| `EASY_CHAT_TYPE_MAIL` | define | `include/constants/easy_chat.h:8` | `src/easy_chat.ts:564` · `src/party_menu.ts:56` |
| `EASY_CHAT_TYPE_QUIZ_SET_QUESTION` | define | `include/constants/easy_chat.h:21` | `src/easy_chat.ts:570` · `src/lilycove_lady.ts:291` |
| `EC_EMPTY_WORD` | define | `include/constants/easy_chat.h:1129` | `src/apprentice.ts:24` · `src/easy_chat.ts:333` · `src/mail_data.ts:88` |
| `EC_GROUP_HOBBIES` | define | `include/constants/easy_chat.h:44` | `src/dewford_trend.ts:45` · `src/easy_chat.ts:340` |
| `EC_GROUP_LIFESTYLE` | define | `include/constants/easy_chat.h:43` | `src/dewford_trend.ts:44` · `src/easy_chat.ts:339` |
| `EC_GROUP_MOVE_1` | define | `include/constants/easy_chat.h:49` | `src/battle_pike.ts:203` · `src/easy_chat.ts:343` |
| `EC_GROUP_MOVE_2` | define | `include/constants/easy_chat.h:50` | `src/battle_pike.ts:204` · `src/easy_chat.ts:344` |
| `EC_MASK_BITS` | define | `include/constants/easy_chat.h:1116` | `harness/runtime/decomp-bridge.ts:148` · `src/battle_pike.ts:202` · `src/easy_chat.ts:331` |
| `ELEVATION_DEFAULT` | enum_member | `include/global.fieldmap.h:18` | `src/event_object_movement.ts:1789` · `src/trainer_hill.ts:33` |
| `ENTRIES_PER_PAGE` | define | `src/data/credits.h:64` | `src/credits.ts:110` · `src/data/credits.ts:10` |
| `FANCOUNTER_BATTLED_AT_BASE` | define | `include/constants/field_specials.h:79` | `include/constants/field_specials.ts:69` · `src/secret_base.ts:374` |
| `FEMALE` | define | `include/constants/global.h:114` | `harness/runtime/decomp-globals.ts:1691` · `include/constants/global.ts:101` · `src/easy_chat.ts:372` · `src/field_specials.ts:48` |
| `FLAG_GET_SEEN` | enum_member | `include/pokedex.h:15` | `include/pokedex.ts:20` · `src/easy_chat.ts:375` |
| `FLAG_SYS_CHAT_USED` | define | `include/constants/flags.h:1355` | `include/constants/flags.ts:1218` · `src/easy_chat.ts:577` |
| `FLAG_SYS_FRONTIER_PASS` | define | `include/constants/flags.h:1482` | `include/constants/flags.ts:1328` · `src/battle_main.ts:6468` |
| `FLAG_SYS_GAME_CLEAR` | define | `include/constants/flags.h:1354` | `include/constants/flags.ts:1217` · `src/easy_chat.ts:380` · `src/script_menu.ts:252` |
| `FLAG_SYS_PC_LANETTE` | define | `include/constants/flags.h:1437` | `include/constants/flags.ts:1289` · `src/script_menu.ts:253` |
| `FLAG_SYS_USE_FLASH` | define | `include/constants/flags.h:1398` | `include/constants/flags.ts:1254` · `src/fldeff_flash.ts:23` |
| `FLAG_UNLOCKED_TRENDY_SAYINGS` | define | `include/constants/flags.h:1356` | `include/constants/flags.ts:1219` · `src/easy_chat.ts:381` |
| `FLDEFF_ASH` | define | `include/constants/field_effects.h:11` | `include/constants/field_effects.ts:15` · `src/field_effect.ts:85` · `src/field_effect_helpers.ts:125` |
| `FLDEFF_BERRY_TREE_GROWTH_SPARKLE` | define | `include/constants/field_effects.h:27` | `include/constants/field_effects.ts:31` · `src/field_effect.ts:100` · `src/field_effect_helpers.ts:141` |
| `FLDEFF_BIKE_TIRE_TRACKS` | define | `include/constants/field_effects.h:39` | `include/constants/field_effects.ts:43` · `src/field_effect.ts:107` · `src/field_effect_helpers.ts:135` |
| `FLDEFF_BUBBLES` | define | `include/constants/field_effects.h:57` | `include/constants/field_effects.ts:61` · `src/field_effect.ts:119` · `src/field_effect_helpers.ts:140` |
| `FLDEFF_DEEP_SAND_FOOTPRINTS` | define | `include/constants/field_effects.h:28` | `include/constants/field_effects.ts:32` · `src/field_effect.ts:101` · `src/field_effect_helpers.ts:134` |
| `FLDEFF_DUST` | define | `include/constants/field_effects.h:14` | `include/constants/field_effects.ts:18` · `src/field_effect.ts:88` · `src/field_effect_helpers.ts:132` |
| `FLDEFF_EXCLAMATION_MARK_ICON` | define | `include/constants/field_effects.h:4` | `include/constants/field_effects.ts:8` · `src/field_effect.ts:80` · `src/trainer_see.ts:102` |
| `FLDEFF_FEET_IN_FLOWING_WATER` | define | `include/constants/field_effects.h:38` | `include/constants/field_effects.ts:42` · `src/field_effect.ts:106` · `src/field_effect_helpers.ts:127` |
| `FLDEFF_FIELD_MOVE_SHOW_MON` | define | `include/constants/field_effects.h:10` | `include/constants/field_effects.ts:14` · `src/field_effect.ts:122` · `src/field_effect_helpers.ts:154` |
| `FLDEFF_FIELD_MOVE_SHOW_MON_INIT` | define | `include/constants/field_effects.h:63` | `include/constants/field_effects.ts:67` · `src/field_effect.ts:123` · `src/field_effect_helpers.ts:155` |
| `FLDEFF_FLY_IN` | define | `include/constants/field_effects.h:36` | `include/constants/field_effects.ts:40` · `src/field_effect.ts:126` · `src/field_effect_helpers.ts:4231` |
| `FLDEFF_HEART_ICON` | define | `include/constants/field_effects.h:50` | `include/constants/field_effects.ts:54` · `src/field_effect.ts:118` · `src/trainer_see.ts:104` |
| `FLDEFF_HOT_SPRINGS_WATER` | define | `include/constants/field_effects.h:46` | `include/constants/field_effects.ts:50` · `src/field_effect.ts:114` · `src/field_effect_helpers.ts:138` |
| `FLDEFF_JUMP_BIG_SPLASH` | define | `include/constants/field_effects.h:18` | `include/constants/field_effects.ts:22` · `src/field_effect.ts:91` · `src/field_effect_helpers.ts:129` |
| `FLDEFF_JUMP_LONG_GRASS` | define | `include/constants/field_effects.h:22` | `include/constants/field_effects.ts:26` · `src/field_effect.ts:95` · `src/field_effect_helpers.ts:131` |
| `FLDEFF_JUMP_SMALL_SPLASH` | define | `include/constants/field_effects.h:20` | `include/constants/field_effects.ts:24` · `src/field_effect.ts:93` · `src/field_effect_helpers.ts:130` |
| `FLDEFF_JUMP_TALL_GRASS` | define | `include/constants/field_effects.h:16` | `include/constants/field_effects.ts:20` · `src/field_effect.ts:89` · `src/field_effect_helpers.ts:128` |
| `FLDEFF_LONG_GRASS` | define | `include/constants/field_effects.h:21` | `include/constants/field_effects.ts:25` · `src/field_effect.ts:94` · `src/field_effect_helpers.ts:147` |
| `FLDEFF_MOUNTAIN_DISGUISE` | define | `include/constants/field_effects.h:33` | `include/constants/field_effects.ts:37` · `src/field_effect.ts:103` · `src/field_effect_helpers.ts:144` |
| `FLDEFF_NPCFLY_OUT` | define | `include/constants/field_effects.h:34` | `include/constants/field_effects.ts:38` · `src/field_effect.ts:124` · `src/field_effect_helpers.ts:4230` |
| `FLDEFF_POKECENTER_HEAL` | define | `include/constants/field_effects.h:29` | `include/constants/field_effects.ts:33` · `src/field_effect.ts:121` · `src/field_effect_helpers.ts:2072` |
| `FLDEFF_QUESTION_MARK_ICON` | define | `include/constants/field_effects.h:37` | `include/constants/field_effects.ts:41` · `src/field_effect.ts:105` · `src/trainer_see.ts:103` |
| `FLDEFF_RIPPLE` | define | `include/constants/field_effects.h:9` | `include/constants/field_effects.ts:13` · `src/field_effect.ts:84` · `src/field_effect_helpers.ts:137` |
| `FLDEFF_SAND_DISGUISE` | define | `include/constants/field_effects.h:40` | `include/constants/field_effects.ts:44` · `src/field_effect.ts:104` · `src/field_effect_helpers.ts:145` |
| `FLDEFF_SAND_FOOTPRINTS` | define | `include/constants/field_effects.h:17` | `include/constants/field_effects.ts:21` · `src/field_effect.ts:90` · `src/field_effect_helpers.ts:133` |
| `FLDEFF_SAND_PILE` | define | `include/constants/field_effects.h:43` | `include/constants/field_effects.ts:47` · `src/field_effect.ts:108` · `src/field_effect_helpers.ts:139` |
| `FLDEFF_SHADOW` | define | `include/constants/field_effects.h:7` | `include/constants/field_effects.ts:11` · `src/field_effect.ts:82` · `src/field_effect_helpers.ts:3943` |
| `FLDEFF_SHORT_GRASS` | define | `include/constants/field_effects.h:45` | `include/constants/field_effects.ts:49` · `src/field_effect.ts:109` · `src/field_effect_helpers.ts:136` |
| `FLDEFF_SPARKLE` | define | `include/constants/field_effects.h:58` | `include/constants/field_effects.ts:62` · `src/field_effect.ts:120` · `src/field_effect_helpers.ts:142` |
| `FLDEFF_SPLASH` | define | `include/constants/field_effects.h:19` | `include/constants/field_effects.ts:23` · `src/field_effect.ts:92` · `src/field_effect_helpers.ts:126` |
| `FLDEFF_SURF_BLOB` | define | `include/constants/field_effects.h:12` | `include/constants/field_effects.ts:16` · `src/field_effect.ts:86` · `src/field_effect_helpers.ts:152` |
| `FLDEFF_SWEET_SCENT` | define | `include/constants/field_effects.h:55` | `include/constants/field_effects.ts:59` · `src/field_effect.ts:111` · `src/fldeff_sweetscent.ts:29` · `src/party_menu.ts:3433` |
| `FLDEFF_TALL_GRASS` | define | `include/constants/field_effects.h:8` | `include/constants/field_effects.ts:12` · `src/field_effect.ts:83` · `src/field_effect_helpers.ts:146` |
| `FLDEFF_TREE_DISGUISE` | define | `include/constants/field_effects.h:32` | `include/constants/field_effects.ts:36` · `src/field_effect.ts:102` · `src/field_effect_helpers.ts:143` |
| `FLDEFF_UNUSED_GRASS` | define | `include/constants/field_effects.h:23` | `include/constants/field_effects.ts:27` · `src/field_effect.ts:96` · `src/field_effect_helpers.ts:148` |
| `FLDEFF_UNUSED_GRASS_2` | define | `include/constants/field_effects.h:24` | `include/constants/field_effects.ts:28` · `src/field_effect.ts:97` · `src/field_effect_helpers.ts:149` |
| `FLDEFF_UNUSED_SAND` | define | `include/constants/field_effects.h:25` | `include/constants/field_effects.ts:29` · `src/field_effect.ts:98` · `src/field_effect_helpers.ts:150` |
| `FLDEFF_USE_CUT_ON_TREE` | define | `include/constants/field_effects.h:6` | `include/constants/field_effects.ts:10` · `src/field_effect.ts:81` · `src/fldeff_cut.ts:24` |
| `FLDEFF_USE_DIG` | define | `include/constants/field_effects.h:42` | `include/constants/field_effects.ts:46` · `src/field_effect.ts:113` · `src/fldeff_dig.ts:24` |
| `FLDEFF_USE_DIVE` | define | `include/constants/field_effects.h:48` | `include/constants/field_effects.ts:52` · `src/field_effect.ts:117` · `src/field_effect_helpers.ts:157` |
| `FLDEFF_USE_FLY` | define | `include/constants/field_effects.h:35` | `include/constants/field_effects.ts:39` · `src/field_effect.ts:125` · `src/field_effect_helpers.ts:4229` |
| `FLDEFF_USE_ROCK_SMASH` | define | `include/constants/field_effects.h:41` | `include/constants/field_effects.ts:45` · `src/field_effect.ts:110` · `src/fldeff_rocksmash.ts:27` |
| `FLDEFF_USE_STRENGTH` | define | `include/constants/field_effects.h:44` | `include/constants/field_effects.ts:48` · `src/field_effect.ts:116` · `src/fldeff_strength.ts:23` |
| `FLDEFF_USE_SURF` | define | `include/constants/field_effects.h:13` | `include/constants/field_effects.ts:17` · `src/field_effect.ts:87` · `src/field_effect_helpers.ts:153` · `src/party_menu.ts:3432` |
| `FLDEFF_USE_TELEPORT` | define | `include/constants/field_effects.h:67` | `include/constants/field_effects.ts:71` · `src/field_effect.ts:112` · `src/fldeff_teleport.ts:29` |
| `FLDEFF_USE_WATERFALL` | define | `include/constants/field_effects.h:47` | `include/constants/field_effects.ts:51` · `src/field_effect.ts:115` · `src/field_effect_helpers.ts:156` |
| `FLDEFF_WATER_SURFACING` | define | `include/constants/field_effects.h:26` | `include/constants/field_effects.ts:30` · `src/field_effect.ts:99` · `src/field_effect_helpers.ts:151` |
| `FONTATTR_COLOR_BACKGROUND` | enum_member | `include/text.h:49` | `include/text.ts:48` · `src/text.ts:307` |
| `FONTATTR_COLOR_FOREGROUND` | enum_member | `include/text.h:48` | `include/text.ts:47` · `src/text.ts:306` |
| `FONTATTR_COLOR_SHADOW` | enum_member | `include/text.h:50` | `include/text.ts:49` · `src/text.ts:308` |
| `FONTATTR_LETTER_SPACING` | enum_member | `include/text.h:45` | `include/text.ts:44` · `src/text.ts:303` |
| `FONTATTR_LINE_SPACING` | enum_member | `include/text.h:46` | `include/text.ts:45` · `src/text.ts:304` |
| `FONTATTR_MAX_LETTER_HEIGHT` | enum_member | `include/text.h:44` | `include/text.ts:43` · `src/text.ts:302` |
| `FONTATTR_MAX_LETTER_WIDTH` | enum_member | `include/text.h:43` | `include/text.ts:42` · `src/text.ts:301` |
| `FONTATTR_UNKNOWN` | enum_member | `include/text.h:47` | `include/text.ts:46` · `src/text.ts:305` |
| `FONT_BOLD` | enum_member | `include/text.h:20` | `include/text.ts:38` · `src/text.ts:294` |
| `FONT_BRAILLE` | enum_member | `include/text.h:17` | `include/text.ts:35` · `src/text.ts:291` |
| `FONT_NARROW` | enum_member | `include/text.h:18` | `include/text.ts:36` · `src/shop.ts:112` · `src/text.ts:292` |
| `FONT_NORMAL` | enum_member | `include/text.h:12` | `include/text.ts:30` · `src/main_menu.ts:1233` · `src/menu_specialized.ts:78` · `src/money.ts:103` · `src/party_menu.ts:107` · `src/player_pc.ts:92` · `src/pokemon_storage_system.ts:3739` · `src/shop.ts:111` · `src/text.ts:286` · `src/trainer_card.ts:60` · `src/wallclock.ts:90` |
| `FONT_SHORT` | enum_member | `include/text.h:13` | `include/text.ts:31` · `src/text.ts:287` |
| `FONT_SHORT_COPY_1` | enum_member | `include/text.h:14` | `include/text.ts:32` · `src/text.ts:288` |
| `FONT_SHORT_COPY_2` | enum_member | `include/text.h:15` | `include/text.ts:33` · `src/text.ts:289` |
| `FONT_SHORT_COPY_3` | enum_member | `include/text.h:16` | `include/text.ts:34` · `src/text.ts:290` |
| `FONT_SMALL` | enum_member | `include/text.h:11` | `include/text.ts:29` · `src/coins.ts:92` · `src/party_menu.ts:108` · `src/pokemon_storage_system.ts:1332` · `src/text.ts:285` |
| `FONT_SMALL_NARROW` | enum_member | `include/text.h:19` | `include/text.ts:37` · `src/text.ts:293` |
| `FRIENDSHIP_EVENT_FAINT_FIELD_PSN` | define | `include/constants/pokemon.h:181` | `include/constants/pokemon.ts:154` · `src/field_poison.ts:51` |
| `FRIENDSHIP_EVENT_LEAGUE_BATTLE` | define | `include/constants/pokemon.h:177` | `include/constants/pokemon.ts:150` · `src/battle_main.ts:794` |
| `FRONTIER_LVL_MODE_COUNT` | define | `include/constants/global.h:78` | `include/constants/global.ts:68` · `src/engine/save/save-blocks.ts:77` · `src/frontier_util.ts:21` |
| `FRONTIER_LVL_TENT` | define | `include/constants/global.h:79` | `src/battle_factory.ts:55` · `src/frontier_util.ts:26` |
| `FRONTIER_MAX_LEVEL_OPEN` | define | `include/constants/battle_frontier.h:53` | `src/battle_factory.ts:57` · `src/tv.ts:84` |
| `FRONTIER_PARTY_SIZE` | define | `include/constants/global.h:35` | `include/constants/global.ts:34` · `src/engine/save/save-blocks.ts:78` |
| `FRONTIER_STAGES_PER_CHALLENGE` | define | `include/constants/battle_frontier.h:57` | `include/constants/battle_frontier.ts:45` · `src/battle_pyramid.ts:37` |
| `FRONTIER_TRAINERS_COUNT` | define | `include/constants/battle_frontier_trainers.h:305` | `src/battle_palace.ts:28` · `src/battle_pike.ts:185` · `src/battle_tent.ts:24` |
| `F_TRAINER_PARTY_CUSTOM_MOVESET` | define | `include/constants/trainers.h:375` | `src/battle_script_commands.ts:7745` · `src/match_call.ts:99` |
| `F_TRAINER_PARTY_HELD_ITEM` | define | `include/constants/trainers.h:376` | `src/battle_script_commands.ts:7746` · `src/match_call.ts:100` |
| `GAME_LANGUAGE` | define | `include/constants/global.h:30` | `src/mail.ts:128` · `src/tv.ts:85` |
| `GENDER_COUNT` | define | `include/constants/global.h:115` | `include/constants/global.ts:102` · `src/intro.ts:184` |
| `GFXTAG_CURSOR` | define, enum_member | `src/data/trade.h:2` · `src/pokenav_match_call_gfx.c:28` · `src/roulette.c:145` · `src/naming_screen.c:57` · `…` | `src/naming_screen.ts:197` · `src/pokemon_storage_system.ts:232` · `src/pokenav_match_call_gfx.ts:144` |
| `GIDDY_MAX_QUESTIONS` | define | `include/constants/global.h:121` | `include/constants/global.ts:107` · `src/engine/save/save-blocks.ts:96` |
| `GIDDY_MAX_TALES` | define | `include/constants/global.h:120` | `include/constants/global.ts:106` · `src/engine/save/save-blocks.ts:95` |
| `GIFT_RIBBONS_COUNT` | define | `include/constants/global.h:64` | `include/constants/global.ts:61` · `src/engine/save/save-blocks.ts:72` · `src/give_gift_ribbon_to_party.ts:25` |
| `GetBoxMonData` | func_macro | `include/pokemon.h:445` | `src/battle_factory.ts:101` · `src/mail_data.ts:43` · `src/pokemon_storage_system.ts:1015` · `src/pokenav_ribbons_list.ts:45` · `src/pokenav_ribbons_summary.ts:62` |
| `HALL_FACILITIES_COUNT` | define | `include/constants/global.h:71` | `include/constants/global.ts:64` · `src/engine/save/save-blocks.ts:80` |
| `HALL_RECORDS_COUNT` | define | `include/constants/global.h:73` | `include/constants/global.ts:65` · `src/engine/save/save-blocks.ts:81` · `src/frontier_util.ts:20` |
| `HEALTHBOX_ALL` | enum_member | `include/battle_interface.h:52` | `src/battle_gfx_sfx_util.ts:711` · `src/battle_interface.ts:908` · `src/reshow_battle_screen.ts:49` |
| `HEAP_SIZE` | define | `include/malloc.h:13` | `src/credits.ts:105` · `src/intro.ts:185` |
| `HELPBAR_CONDITION_MON_LIST` | enum_member | `include/pokenav.h:174` | `src/pokenav_conditions_search_results.ts:101` · `src/pokenav_menu_handler.ts:69` |
| `HELPBAR_MAP_ZOOMED_IN` | enum_member | `include/pokenav.h:173` | `src/pokenav_menu_handler.ts:52` · `src/pokenav_region_map.ts:168` |
| `HELPBAR_MAP_ZOOMED_OUT` | enum_member | `include/pokenav.h:172` | `src/pokenav_menu_handler.ts:53` · `src/pokenav_region_map.ts:167` |
| `HELPBAR_MC_TRAINER_LIST` | enum_member | `include/pokenav.h:177` | `src/pokenav_match_call_gfx.ts:137` · `src/pokenav_menu_handler.ts:57` |
| `HELPBAR_RIBBONS_MON_LIST` | enum_member | `include/pokenav.h:180` | `src/pokenav_menu_handler.ts:59` · `src/pokenav_ribbons_list.ts:67` |
| `HITMARKER_GRUDGE` | define | `include/constants/battle.h:201` | `include/constants/battle.ts:483` · `src/battle_util.ts:3963` |
| `HITMARKER_IGNORE_BIDE` | define | `include/constants/battle.h:182` | `include/constants/battle.ts:464` · `src/battle_util.ts:3964` |
| `HP_EMPTY_SLOT` | define | `include/constants/battle.h:384` | `include/constants/battle.ts:433` · `src/battle_interface.ts:426` · `src/battle_main.ts:4104` |
| `INPUT_NONE` | enum_member | `src/naming_screen.c:34` · `src/pokemon_storage_system.c:157` | `src/naming_screen.ts:132` · `src/pokemon_storage_system.ts:186` |
| `INPUT_SELECT` | enum_member | `src/easy_chat.c:370` · `src/naming_screen.c:42` | `src/easy_chat.ts:261` · `src/naming_screen.ts:140` |
| `INPUT_START` | enum_member | `src/easy_chat.c:369` · `src/naming_screen.c:43` | `src/easy_chat.ts:260` · `src/naming_screen.ts:141` |
| `INSTANT_HP_BAR_DROP` | define | `include/battle_controllers.h:149` | `src/battle_controller_opponent.ts:1431` · `src/battle_controller_player.ts:2269` · `src/engine/battle/constants.ts:1523` |
| `INTROCRED_SCENERY_FROZEN` | enum_member | `include/intro_credits_graphics.h:8` | `src/credits.ts:64` · `src/intro.ts:186` · `src/intro_credits_graphics.ts:45` |
| `INTROCRED_SCENERY_NORMAL` | enum_member | `include/intro_credits_graphics.h:6` | `src/credits.ts:107` · `src/intro_credits_graphics.ts:46` |
| `IS_BATTLER_OF_TYPE` | func_macro | `include/battle.h:471` | `src/battle_ai_script_commands.ts:492` · `src/battle_ai_switch_items.ts:157` · `src/battle_util.ts:1373` · `src/engine/battle/constants.ts:1372` |
| `ITEM3_STATUS_ALL` | define | `include/constants/item_effects.h:28` | `src/battle_ai_switch_items.ts:617` · `src/engine/bag/bag-item-effects.ts:62` |
| `ITEMMENUSPRITE_BAG` | enum_member | `include/item_menu.h:41` | `src/item_menu.ts:147` · `src/item_menu_icons.ts:39` |
| `ITEMMENUSPRITE_BALL` | enum_member | `include/item_menu.h:42` | `src/item_menu.ts:148` · `src/item_menu_icons.ts:40` |
| `ITEMMENUSPRITE_ITEM` | enum_member | `include/item_menu.h:43` | `src/item_menu.ts:149` · `src/item_menu_icons.ts:41` |
| `ITEMS_POCKET` | define | `include/constants/item.h:12` | `include/constants/item.ts:14` · `src/engine/bag/bag-types.ts:38` |
| `ITEM_BEAD_MAIL` | define | `include/constants/items.h:145` | `include/constants/items.ts:139` · `src/mail_data.ts:61` |
| `ITEM_CLEANSE_TAG` | define | `include/constants/items.h:220` | `include/constants/items.ts:210` · `src/wild_encounter.ts:427` |
| `ITEM_DIVE_BALL` | define | `include/constants/items.h:13` | `include/constants/items.ts:15` · `src/battle_anim_throw.ts:116` |
| `ITEM_DREAM_MAIL` | define | `include/constants/items.h:148` | `include/constants/items.ts:142` · `src/mail_data.ts:64` |
| `ITEM_EFFECT_ATK_EV` | define | `include/constants/item_effects.h:80` | `include/constants/item_effects.ts:66` · `src/engine/bag/bag-item-effects.ts:109` |
| `ITEM_EFFECT_CURE_ALL_STATUS` | define | `include/constants/item_effects.h:79` | `include/constants/item_effects.ts:65` · `src/engine/bag/bag-item-effects.ts:106` |
| `ITEM_EFFECT_CURE_BURN` | define | `include/constants/item_effects.h:73` | `include/constants/item_effects.ts:59` · `src/engine/bag/bag-item-effects.ts:101` |
| `ITEM_EFFECT_CURE_CONFUSION` | define | `include/constants/item_effects.h:76` | `include/constants/item_effects.ts:62` · `src/engine/bag/bag-item-effects.ts:104` |
| `ITEM_EFFECT_CURE_FREEZE` | define | `include/constants/item_effects.h:74` | `include/constants/item_effects.ts:60` · `src/engine/bag/bag-item-effects.ts:102` |
| `ITEM_EFFECT_CURE_INFATUATION` | define | `include/constants/item_effects.h:77` | `include/constants/item_effects.ts:63` · `src/engine/bag/bag-item-effects.ts:105` |
| `ITEM_EFFECT_CURE_PARALYSIS` | define | `include/constants/item_effects.h:75` | `include/constants/item_effects.ts:61` · `src/engine/bag/bag-item-effects.ts:103` |
| `ITEM_EFFECT_CURE_POISON` | define | `include/constants/item_effects.h:71` | `include/constants/item_effects.ts:57` · `src/engine/bag/bag-item-effects.ts:99` |
| `ITEM_EFFECT_CURE_SLEEP` | define | `include/constants/item_effects.h:72` | `include/constants/item_effects.ts:58` · `src/engine/bag/bag-item-effects.ts:100` |
| `ITEM_EFFECT_DEF_EV` | define | `include/constants/item_effects.h:85` | `include/constants/item_effects.ts:71` · `src/engine/bag/bag-item-effects.ts:110` |
| `ITEM_EFFECT_EVO_STONE` | define | `include/constants/item_effects.h:86` | `include/constants/item_effects.ts:72` · `src/engine/bag/bag-item-effects.ts:116` |
| `ITEM_EFFECT_HEAL_HP` | define | `include/constants/item_effects.h:70` | `include/constants/item_effects.ts:56` · `src/engine/bag/bag-item-effects.ts:98` |
| `ITEM_EFFECT_HEAL_PP` | define | `include/constants/item_effects.h:89` | `include/constants/item_effects.ts:75` · `src/engine/bag/bag-item-effects.ts:107` |
| `ITEM_EFFECT_HP_EV` | define | `include/constants/item_effects.h:81` | `include/constants/item_effects.ts:67` · `src/engine/bag/bag-item-effects.ts:108` |
| `ITEM_EFFECT_NONE` | define | `include/constants/item_effects.h:90` | `include/constants/item_effects.ts:76` · `src/engine/bag/bag-item-effects.ts:96` |
| `ITEM_EFFECT_PP_MAX` | define | `include/constants/item_effects.h:88` | `include/constants/item_effects.ts:74` · `src/engine/bag/bag-item-effects.ts:115` |
| `ITEM_EFFECT_PP_UP` | define | `include/constants/item_effects.h:87` | `include/constants/item_effects.ts:73` · `src/engine/bag/bag-item-effects.ts:114` |
| `ITEM_EFFECT_RAISE_LEVEL` | define | `include/constants/item_effects.h:69` | `include/constants/item_effects.ts:55` · `src/engine/bag/bag-item-effects.ts:117` |
| `ITEM_EFFECT_SACRED_ASH` | define | `include/constants/item_effects.h:78` | `include/constants/item_effects.ts:64` · `src/engine/bag/bag-item-effects.ts:118` |
| `ITEM_EFFECT_SPATK_EV` | define | `include/constants/item_effects.h:82` | `include/constants/item_effects.ts:68` · `src/engine/bag/bag-item-effects.ts:111` |
| `ITEM_EFFECT_SPDEF_EV` | define | `include/constants/item_effects.h:83` | `include/constants/item_effects.ts:69` · `src/engine/bag/bag-item-effects.ts:112` |
| `ITEM_EFFECT_SPEED_EV` | define | `include/constants/item_effects.h:84` | `include/constants/item_effects.ts:70` · `src/engine/bag/bag-item-effects.ts:113` |
| `ITEM_EFFECT_X_ITEM` | define | `include/constants/item_effects.h:68` | `include/constants/item_effects.ts:54` · `src/engine/bag/bag-item-effects.ts:97` |
| `ITEM_ENIGMA_BERRY` | define | `include/constants/items.h:197` | `include/constants/items.ts:189` · `src/battle_util.ts:2221` |
| `ITEM_FAB_MAIL` | define | `include/constants/items.h:149` | `include/constants/items.ts:143` · `src/mail_data.ts:65` |
| `ITEM_GLITTER_MAIL` | define | `include/constants/items.h:141` | `include/constants/items.ts:135` · `src/mail_data.ts:57` |
| `ITEM_GREAT_BALL` | define | `include/constants/items.h:9` | `include/constants/items.ts:11` · `src/battle_anim_throw.ts:112` |
| `ITEM_HARBOR_MAIL` | define | `include/constants/items.h:140` | `include/constants/items.ts:134` · `src/mail_data.ts:56` |
| `ITEM_LUXURY_BALL` | define | `include/constants/items.h:17` | `include/constants/items.ts:19` · `src/battle_anim_throw.ts:120` |
| `ITEM_MASTER_BALL` | define | `include/constants/items.h:7` | `include/constants/items.ts:9` · `src/battle_anim_throw.ts:110` |
| `ITEM_MECH_MAIL` | define | `include/constants/items.h:142` | `include/constants/items.ts:136` · `src/mail_data.ts:58` |
| `ITEM_NEST_BALL` | define | `include/constants/items.h:14` | `include/constants/items.ts:16` · `src/battle_anim_throw.ts:117` |
| `ITEM_NET_BALL` | define | `include/constants/items.h:12` | `include/constants/items.ts:14` · `src/battle_anim_throw.ts:115` |
| `ITEM_NONE` | define | `include/constants/items.h:4` | `include/constants/items.ts:8` · `src/battle_main.ts:4102` · `src/mail_data.ts:54` · `src/menu_helpers.ts:62` |
| `ITEM_ORANGE_MAIL` | define | `include/constants/items.h:139` | `include/constants/items.ts:133` · `src/mail_data.ts:55` |
| `ITEM_POKE_BALL` | define | `include/constants/items.h:10` | `include/constants/items.ts:12` · `src/battle_anim_throw.ts:113` |
| `ITEM_PREMIER_BALL` | define | `include/constants/items.h:18` | `include/constants/items.ts:20` · `src/battle_anim_throw.ts:121` |
| `ITEM_REPEAT_BALL` | define | `include/constants/items.h:15` | `include/constants/items.ts:17` · `src/battle_anim_throw.ts:118` |
| `ITEM_RETRO_MAIL` | define | `include/constants/items.h:150` | `include/constants/items.ts:144` · `src/mail_data.ts:66` |
| `ITEM_SAFARI_BALL` | define | `include/constants/items.h:11` | `include/constants/items.ts:13` · `src/battle_anim_throw.ts:114` |
| `ITEM_SHADOW_MAIL` | define | `include/constants/items.h:146` | `include/constants/items.ts:140` · `src/mail_data.ts:62` |
| `ITEM_TIMER_BALL` | define | `include/constants/items.h:16` | `include/constants/items.ts:18` · `src/battle_anim_throw.ts:119` |
| `ITEM_TROPIC_MAIL` | define | `include/constants/items.h:147` | `include/constants/items.ts:141` · `src/mail_data.ts:63` |
| `ITEM_ULTRA_BALL` | define | `include/constants/items.h:8` | `include/constants/items.ts:10` · `src/battle_anim_throw.ts:111` |
| `ITEM_WAVE_MAIL` | define | `include/constants/items.h:144` | `include/constants/items.ts:138` · `src/mail_data.ts:60` |
| `ITEM_WOOD_MAIL` | define | `include/constants/items.h:143` | `include/constants/items.ts:137` · `src/mail_data.ts:59` |
| `JOY_HELD` | func_macro | `include/global.h:135` | `harness/runtime/decomp-globals.ts:1502` · `src/battle_controllers.ts:1420` · `src/pokemon_storage_system.ts:4797` |
| `JOY_NEW` | func_macro | `include/global.h:134` | `harness/runtime/decomp-globals.ts:1497` · `src/battle_controllers.ts:1406` · `src/pokemon_storage_system.ts:4798` |
| `JOY_REPEAT` | func_macro | `include/global.h:137` | `harness/runtime/decomp-globals.ts:1509` · `src/battle_controllers.ts:1413` · `src/pokemon_storage_system.ts:4796` |
| `JUMP_TYPE_NORMAL` | enum_member | `src/event_object_movement.c:5424` · `src/pokemon_jump.c:62` | `src/event_object_movement.ts:5187` · `src/pokemon_jump.ts:31` |
| `KEYITEMS_POCKET` | define | `include/constants/item.h:16` | `include/constants/item.ts:18` · `src/engine/bag/bag-types.ts:42` |
| `LAND_WILD_COUNT` | define | `include/constants/wild_encounter.h:4` | `src/pokedex_area_screen.ts:170` · `src/wild_encounter.ts:154` |
| `LIST_CANCEL` | define | `include/list_menu.h:7` | `src/list_menu.ts:69` · `src/shop.ts:145` |
| `LIST_NOTHING_CHOSEN` | define | `include/list_menu.h:6` | `src/list_menu.ts:68` · `src/shop.ts:144` |
| `LOCALID_NONE` | define | `include/constants/event_objects.h:302` | `include/constants/event_objects.ts:297` · `src/script_movement.ts:287` |
| `LOCALID_PLAYER` | define | `include/constants/event_objects.h:305` | `include/constants/event_objects.ts:300` · `src/field_effect_helpers.ts:160` · `src/script_movement.ts:290` · `src/trainer_see.ts:854` |
| `LT_CONTINUE` | define | `include/pokenav.h:61` | `src/pokenav_conditions_search_results.ts:96` · `src/pokenav_list.ts:58` · `src/pokenav_looped_task.ts:30` · `src/pokenav_match_call_list.ts:61` · `src/pokenav_ribbons_list.ts:61` |
| `LT_FINISH` | define | `include/pokenav.h:62` | `src/pokenav_conditions_gfx.ts:165` · `src/pokenav_conditions_search_results.ts:97` · `src/pokenav_list.ts:55` · `src/pokenav_looped_task.ts:31` · `src/pokenav_main_menu.ts:199` · `src/pokenav_match_call_gfx.ts:135` · `src/pokenav_match_call_list.ts:63` · `src/pokenav_menu_handler_gfx.ts:87` · `src/pokenav_region_map.ts:166` · `src/pokenav_ribbons_list.ts:62` · `src/pokenav_ribbons_summary.ts:83` |
| `LT_INC_AND_CONTINUE` | define | `include/pokenav.h:59` | `src/pokenav_conditions_gfx.ts:166` · `src/pokenav_conditions_search_results.ts:95` · `src/pokenav_list.ts:54` · `src/pokenav_looped_task.ts:28` · `src/pokenav_main_menu.ts:196` · `src/pokenav_match_call_gfx.ts:138` · `src/pokenav_match_call_list.ts:59` · `src/pokenav_menu_handler_gfx.ts:84` · `src/pokenav_region_map.ts:162` · `src/pokenav_ribbons_list.ts:60` · `src/pokenav_ribbons_summary.ts:79` |
| `LT_INC_AND_PAUSE` | define | `include/pokenav.h:58` | `src/pokenav_conditions_gfx.ts:159` · `src/pokenav_conditions_search_results.ts:99` · `src/pokenav_list.ts:53` · `src/pokenav_looped_task.ts:27` · `src/pokenav_main_menu.ts:197` · `src/pokenav_match_call_gfx.ts:131` · `src/pokenav_menu_handler_gfx.ts:80` · `src/pokenav_region_map.ts:160` · `src/pokenav_ribbons_list.ts:64` · `src/pokenav_ribbons_summary.ts:77` |
| `LT_PAUSE` | define | `include/pokenav.h:60` | `src/pokenav_conditions_gfx.ts:158` · `src/pokenav_conditions_search_results.ts:100` · `src/pokenav_list.ts:52` · `src/pokenav_looped_task.ts:29` · `src/pokenav_main_menu.ts:198` · `src/pokenav_match_call_gfx.ts:132` · `src/pokenav_match_call_list.ts:64` · `src/pokenav_menu_handler_gfx.ts:81` · `src/pokenav_region_map.ts:161` · `src/pokenav_ribbons_list.ts:65` · `src/pokenav_ribbons_summary.ts:78` |
| `L_BUTTON` | define | `include/gba/io_reg.h:708` | `include/gba/io_reg.ts:966` · `src/battle_controllers.ts:1453` · `src/list_menu.ts:318` · `src/menu_helpers.ts:59` |
| `MAIL_COUNT` | define | `include/constants/global.h:47` | `src/easy_chat.ts:354` · `src/engine/save/save-blocks.ts:65` |
| `MAIL_NONE` | define | `include/constants/items.h:447` | `include/constants/items.ts:431` · `src/mail_data.ts:69` |
| `MAIL_WORDS_COUNT` | define | `include/constants/global.h:98` | `include/constants/global.ts:87` · `src/easy_chat.ts:355` · `src/engine/save/save-blocks.ts:84` |
| `MALE` | define | `include/constants/global.h:113` | `harness/runtime/decomp-globals.ts:1690` · `include/constants/global.ts:100` · `src/easy_chat.ts:371` · `src/field_specials.ts:47` |
| `MAPCURSOR_X_MAX` | define | `src/region_map.c:45` | `src/engine/field/region-map.ts:68` · `src/region_map.ts:183` |
| `MAPCURSOR_X_MIN` | define | `src/region_map.c:43` | `src/engine/field/region-map.ts:66` · `src/region_map.ts:181` |
| `MAPCURSOR_Y_MAX` | define | `src/region_map.c:46` | `src/engine/field/region-map.ts:69` · `src/region_map.ts:184` |
| `MAPCURSOR_Y_MIN` | define | `src/region_map.c:44` | `src/engine/field/region-map.ts:67` · `src/region_map.ts:182` |
| `MAPGRID_COLLISION_MASK` | define | `include/global.fieldmap.h:8` | `src/fieldmap.ts:145` · `src/window.ts:21` |
| `MAPGRID_COLLISION_SHIFT` | define | `include/global.fieldmap.h:11` | `src/fieldmap.ts:148` · `src/trainer_hill.ts:35` |
| `MAPGRID_ELEVATION_MASK` | define | `include/global.fieldmap.h:9` | `src/fieldmap.ts:146` · `src/window.ts:22` |
| `MAPGRID_ELEVATION_SHIFT` | define | `include/global.fieldmap.h:12` | `src/fieldmap.ts:149` · `src/trainer_hill.ts:36` |
| `MAPGRID_IMPASSABLE` | define | `include/global.fieldmap.h:34` | `src/field_specials.ts:685` · `src/fieldmap.ts:151` |
| `MAPGRID_METATILE_ID_MASK` | define | `include/global.fieldmap.h:7` | `src/fieldmap.ts:144` · `src/window.ts:20` |
| `MAPSECTYPE_BATTLE_FRONTIER` | enum_member | `include/region_map.h:24` | `src/engine/field/region-map-data.ts:115` · `src/region_map.ts:175` |
| `MAPSECTYPE_CITY_CANFLY` | enum_member | `include/region_map.h:22` | `src/engine/field/region-map-data.ts:113` · `src/region_map.ts:173` |
| `MAPSECTYPE_CITY_CANTFLY` | enum_member | `include/region_map.h:23` | `src/engine/field/region-map-data.ts:114` · `src/region_map.ts:174` |
| `MAPSECTYPE_NONE` | enum_member | `include/region_map.h:20` | `src/engine/field/region-map-data.ts:111` · `src/region_map.ts:171` |
| `MAPSECTYPE_ROUTE` | enum_member | `include/region_map.h:21` | `src/engine/field/region-map-data.ts:112` · `src/region_map.ts:172` |
| `MAP_GROUP` | func_macro | `include/constants/maps.h:15` | `include/constants/map_groups.ts:1054` · `src/overworld.ts:770` |
| `MAP_HEIGHT` | define | `src/region_map.c:42` | `src/engine/field/region-map.ts:65` · `src/region_map.ts:180` |
| `MAP_INPUT_A_BUTTON` | enum_member | `include/region_map.h:15` | `src/pokenav_region_map.ts:152` · `src/region_map.ts:167` |
| `MAP_INPUT_B_BUTTON` | enum_member | `include/region_map.h:16` | `src/pokenav_region_map.ts:155` · `src/region_map.ts:168` |
| `MAP_INPUT_MOVE_END` | enum_member | `include/region_map.h:14` | `src/pokenav_region_map.ts:150` · `src/region_map.ts:166` |
| `MAP_NUM` | enum_member, func_macro | `include/constants/maps.h:16` · `src/roamer.c:14` | `include/constants/map_groups.ts:1055` · `src/overworld.ts:771` · `src/roamer.ts:19` |
| `MAP_OFFSET` | define | `include/fieldmap.h:18` | `include/fieldmap.ts:16` · `src/fieldmap.ts:138` |
| `MAP_TYPE_CITY` | define | `include/constants/map_types.h:6` | `include/constants/map_types.ts:10` · `src/battle_setup.ts:1282` |
| `MAP_TYPE_INDOOR` | define | `include/constants/map_types.h:12` | `include/constants/map_types.ts:16` · `src/battle_setup.ts:1288` |
| `MAP_TYPE_OCEAN_ROUTE` | define | `include/constants/map_types.h:10` | `include/constants/map_types.ts:14` · `src/battle_setup.ts:1286` |
| `MAP_TYPE_ROUTE` | define | `include/constants/map_types.h:7` | `include/constants/map_types.ts:11` · `src/battle_setup.ts:1283` |
| `MAP_TYPE_SECRET_BASE` | define | `include/constants/map_types.h:13` | `include/constants/map_types.ts:17` · `src/battle_setup.ts:1289` |
| `MAP_TYPE_TOWN` | define | `include/constants/map_types.h:5` | `include/constants/map_types.ts:9` · `src/battle_setup.ts:1281` |
| `MAP_TYPE_UNDERGROUND` | define | `include/constants/map_types.h:8` | `include/constants/map_types.ts:12` · `src/battle_setup.ts:1284` |
| `MAP_TYPE_UNDERWATER` | define | `include/constants/map_types.h:9` | `include/constants/map_types.ts:13` · `src/battle_setup.ts:1285` |
| `MAP_TYPE_UNKNOWN` | define | `include/constants/map_types.h:11` | `include/constants/map_types.ts:15` · `src/battle_setup.ts:1287` |
| `MAP_WIDTH` | define | `src/region_map.c:41` | `src/engine/field/region-map.ts:64` · `src/region_map.ts:179` |
| `MATCH_CALL_OPTION_COUNT` | enum_member | `include/pokenav.h:217` | `src/pokenav_match_call_gfx.ts:141` · `src/pokenav_match_call_list.ts:65` |
| `MAUVILLE_MAN_TRADER` | define | `include/constants/mauville_old_man.h:6` | `src/mauville_old_man.ts:28` · `src/trader.ts:39` |
| `MAX_BAG_ITEM_CAPACITY` | define | `include/constants/items.h:452` | `include/constants/items.ts:434` · `src/engine/bag/bag.ts:166` · `src/shop.ts:149` |
| `MAX_BATTLERS_COUNT` | enum_member | `include/constants/battle.h:41` | `src/battle_controller_player.ts:1003` · `src/battle_gfx_sfx_util.ts:508` · `src/battle_main.ts:783` · `src/engine/battle/state.ts:20` · `src/pokeball.ts:245` · `src/pokemon_animation.ts:112` |
| `MAX_BERRY_CAPACITY` | define | `include/constants/items.h:454` | `include/constants/items.ts:436` · `src/engine/bag/bag.ts:168` |
| `MAX_GIFT_RIBBON` | define | `include/constants/pokemon.h:143` | `include/constants/pokemon.ts:126` · `src/give_gift_ribbon_to_party.ts:27` |
| `MAX_ITEMS_SHOWN` | define | `src/item_menu.c:68` · `src/shop.c:45` | `src/item_menu.ts:717` · `src/shop.ts:147` |
| `MAX_MAP_DATA_SIZE` | define | `include/fieldmap.h:10` | `include/fieldmap.ts:14` · `src/fieldmap.ts:136` |
| `MAX_MON_MOVES` | define | `include/constants/global.h:82` | `include/constants/global.ts:72` · `src/battle_main.ts:2594` · `src/engine/save/save-blocks.ts:40` · `src/evolution_scene.ts:807` · `src/party_menu.ts:2516` |
| `MAX_MON_PIC_FRAMES` | define | `include/constants/pokemon.h:275` | `include/constants/pokemon.ts:231` · `src/trainer_pokemon_sprites.ts:40` |
| `MAX_PC_ITEM_CAPACITY` | define | `include/constants/items.h:453` | `include/constants/items.ts:435` · `src/item.ts:334` |
| `MAX_POKENAV_MENUITEMS` | define | `include/pokenav.h:167` | `src/pokenav_menu_handler.ts:21` · `src/pokenav_menu_handler_gfx.ts:92` |
| `MAX_REMATCH_ENTRIES` | define | `include/constants/global.h:61` | `include/constants/global.ts:58` · `src/engine/save/save-blocks.ts:49` |
| `MAX_SHEEN` | define | `include/constants/pokemon.h:197` | `include/constants/pokemon.ts:165` · `src/menu_specialized.ts:214` |
| `MAX_SPRITES` | define | `include/sprite.h:5` | `harness/runtime/decomp-runtime.ts:606` · `include/sprite.ts:9` · `src/decoration.ts:2206` · `src/event_object_movement.ts:837` · `src/field_effect_helpers.ts:161` · `src/field_player_avatar.ts:3192` · `src/field_weather_effect.ts:88` · `src/intro.ts:187` · `src/item_icon.ts:36` · `src/mon_markings.ts:184` · `src/sprite.ts:83` · `src/trainer_see.ts:98` |
| `MAX_STAMP_CARD_STAMPS` | define | `include/constants/global.h:111` | `include/constants/global.ts:99` · `src/engine/save/save-blocks.ts:87` |
| `MAX_TRAINER_ITEMS` | define | `include/data.h:8` | `src/battle_ai_script_commands.ts:1654` · `src/battle_ai_switch_items.ts:611` |
| `MB_ANIMATED_DOOR` | enum_member | `include/constants/metatile_behaviors.h:110` | `include/constants/metatile_behaviors.ts:131` · `src/engine/field/tilemap-loader.ts:87` |
| `MB_AQUA_HIDEOUT_WARP` | enum_member | `include/constants/metatile_behaviors.h:108` | `include/constants/metatile_behaviors.ts:129` · `src/engine/field/tilemap-loader.ts:85` |
| `MB_BATTLE_PYRAMID_WARP` | enum_member | `include/constants/metatile_behaviors.h:18` | `include/constants/metatile_behaviors.ts:39` · `src/engine/field/tilemap-loader.ts:51` |
| `MB_CRACKED_FLOOR_HOLE` | enum_member | `include/constants/metatile_behaviors.h:107` | `include/constants/metatile_behaviors.ts:128` · `src/engine/field/tilemap-loader.ts:84` |
| `MB_DEEP_SOUTH_WARP` | enum_member | `include/constants/metatile_behaviors.h:115` | `include/constants/metatile_behaviors.ts:136` · `src/engine/field/tilemap-loader.ts:92` |
| `MB_DOWN_ESCALATOR` | enum_member | `include/constants/metatile_behaviors.h:112` | `include/constants/metatile_behaviors.ts:133` · `src/engine/field/tilemap-loader.ts:89` |
| `MB_EAST_ARROW_WARP` | enum_member | `include/constants/metatile_behaviors.h:103` | `include/constants/metatile_behaviors.ts:124` · `src/engine/field/tilemap-loader.ts:80` |
| `MB_IMPASSABLE_EAST` | enum_member | `include/constants/metatile_behaviors.h:53` | `include/constants/metatile_behaviors.ts:74` · `src/engine/field/tilemap-loader.ts:59` |
| `MB_IMPASSABLE_NORTH` | enum_member | `include/constants/metatile_behaviors.h:55` | `include/constants/metatile_behaviors.ts:76` · `src/engine/field/tilemap-loader.ts:61` |
| `MB_IMPASSABLE_NORTHEAST` | enum_member | `include/constants/metatile_behaviors.h:57` | `include/constants/metatile_behaviors.ts:78` · `src/engine/field/tilemap-loader.ts:63` |
| `MB_IMPASSABLE_NORTHWEST` | enum_member | `include/constants/metatile_behaviors.h:58` | `include/constants/metatile_behaviors.ts:79` · `src/engine/field/tilemap-loader.ts:64` |
| `MB_IMPASSABLE_SOUTH` | enum_member | `include/constants/metatile_behaviors.h:56` | `include/constants/metatile_behaviors.ts:77` · `src/engine/field/tilemap-loader.ts:62` |
| `MB_IMPASSABLE_SOUTHEAST` | enum_member | `include/constants/metatile_behaviors.h:59` | `include/constants/metatile_behaviors.ts:80` · `src/engine/field/tilemap-loader.ts:65` |
| `MB_IMPASSABLE_SOUTHWEST` | enum_member | `include/constants/metatile_behaviors.h:60` | `include/constants/metatile_behaviors.ts:81` · `src/engine/field/tilemap-loader.ts:66` |
| `MB_IMPASSABLE_SOUTH_AND_NORTH` | enum_member | `include/constants/metatile_behaviors.h:197` | `include/constants/metatile_behaviors.ts:218` · `src/engine/field/tilemap-loader.ts:94` |
| `MB_IMPASSABLE_WEST` | enum_member | `include/constants/metatile_behaviors.h:54` | `include/constants/metatile_behaviors.ts:75` · `src/engine/field/tilemap-loader.ts:60` |
| `MB_IMPASSABLE_WEST_AND_EAST` | enum_member | `include/constants/metatile_behaviors.h:198` | `include/constants/metatile_behaviors.ts:219` · `src/engine/field/tilemap-loader.ts:95` |
| `MB_INVALID` | define | `include/constants/metatile_behaviors.h:248` | `include/constants/metatile_behaviors.ts:268` · `src/fieldmap.ts:162` |
| `MB_JUMP_EAST` | enum_member | `include/constants/metatile_behaviors.h:61` | `include/constants/metatile_behaviors.ts:82` · `src/engine/field/tilemap-loader.ts:70` |
| `MB_JUMP_NORTH` | enum_member | `include/constants/metatile_behaviors.h:63` | `include/constants/metatile_behaviors.ts:84` · `src/engine/field/tilemap-loader.ts:72` |
| `MB_JUMP_NORTHEAST` | enum_member | `include/constants/metatile_behaviors.h:65` | `include/constants/metatile_behaviors.ts:86` · `src/engine/field/tilemap-loader.ts:74` |
| `MB_JUMP_NORTHWEST` | enum_member | `include/constants/metatile_behaviors.h:66` | `include/constants/metatile_behaviors.ts:87` · `src/engine/field/tilemap-loader.ts:75` |
| `MB_JUMP_SOUTH` | enum_member | `include/constants/metatile_behaviors.h:64` | `include/constants/metatile_behaviors.ts:85` · `src/engine/field/tilemap-loader.ts:73` |
| `MB_JUMP_SOUTHEAST` | enum_member | `include/constants/metatile_behaviors.h:67` | `include/constants/metatile_behaviors.ts:88` · `src/engine/field/tilemap-loader.ts:76` |
| `MB_JUMP_SOUTHWEST` | enum_member | `include/constants/metatile_behaviors.h:68` | `include/constants/metatile_behaviors.ts:89` · `src/engine/field/tilemap-loader.ts:77` |
| `MB_JUMP_WEST` | enum_member | `include/constants/metatile_behaviors.h:62` | `include/constants/metatile_behaviors.ts:83` · `src/engine/field/tilemap-loader.ts:71` |
| `MB_LADDER` | enum_member | `include/constants/metatile_behaviors.h:102` | `include/constants/metatile_behaviors.ts:123` · `src/engine/field/tilemap-loader.ts:79` |
| `MB_LAVARIDGE_GYM_1F_WARP` | enum_member | `include/constants/metatile_behaviors.h:109` | `include/constants/metatile_behaviors.ts:130` · `src/engine/field/tilemap-loader.ts:86` |
| `MB_LAVARIDGE_GYM_B1F_WARP` | enum_member | `include/constants/metatile_behaviors.h:46` | `include/constants/metatile_behaviors.ts:67` · `src/engine/field/tilemap-loader.ts:54` |
| `MB_LONG_GRASS` | enum_member | `include/constants/metatile_behaviors.h:8` | `include/constants/metatile_behaviors.ts:29` · `src/engine/field/tilemap-loader.ts:50` |
| `MB_MOSSDEEP_GYM_WARP` | enum_member | `include/constants/metatile_behaviors.h:19` | `include/constants/metatile_behaviors.ts:40` · `src/engine/field/tilemap-loader.ts:52` |
| `MB_MT_PYRE_HOLE` | enum_member | `include/constants/metatile_behaviors.h:20` | `include/constants/metatile_behaviors.ts:41` · `src/engine/field/tilemap-loader.ts:53` |
| `MB_NON_ANIMATED_DOOR` | enum_member | `include/constants/metatile_behaviors.h:101` | `include/constants/metatile_behaviors.ts:122` · `src/engine/field/tilemap-loader.ts:78` |
| `MB_NORMAL` | enum_member | `include/constants/metatile_behaviors.h:5` | `include/constants/metatile_behaviors.ts:26` · `src/engine/field/tilemap-loader.ts:48` |
| `MB_NORTH_ARROW_WARP` | enum_member | `include/constants/metatile_behaviors.h:105` | `include/constants/metatile_behaviors.ts:126` · `src/engine/field/tilemap-loader.ts:82` |
| `MB_SECRET_BASE_BREAKABLE_DOOR` | enum_member | `include/constants/metatile_behaviors.h:195` | `include/constants/metatile_behaviors.ts:216` · `src/engine/field/tilemap-loader.ts:93` |
| `MB_SECRET_BASE_DECORATION_BASE` | enum_member | `include/constants/metatile_behaviors.h:203` | `include/constants/metatile_behaviors.ts:224` · `src/metatile_behavior.ts:930` |
| `MB_SECRET_BASE_GLITTER_MAT` | enum_member | `include/constants/metatile_behaviors.h:191` | `include/constants/metatile_behaviors.ts:212` · `src/metatile_behavior.ts:924` |
| `MB_SECRET_BASE_IMPASSABLE` | enum_member | `include/constants/metatile_behaviors.h:190` | `include/constants/metatile_behaviors.ts:211` · `src/metatile_behavior.ts:923` |
| `MB_SECRET_BASE_JUMP_MAT` | enum_member | `include/constants/metatile_behaviors.h:192` | `include/constants/metatile_behaviors.ts:213` · `src/metatile_behavior.ts:925` |
| `MB_SECRET_BASE_POSTER` | enum_member | `include/constants/metatile_behaviors.h:204` | `include/constants/metatile_behaviors.ts:225` · `src/metatile_behavior.ts:931` |
| `MB_SECRET_BASE_SAND_ORNAMENT` | enum_member | `include/constants/metatile_behaviors.h:196` | `include/constants/metatile_behaviors.ts:217` · `src/metatile_behavior.ts:928` |
| `MB_SECRET_BASE_SCENERY` | enum_member | `include/constants/metatile_behaviors.h:183` | `include/constants/metatile_behaviors.ts:204` · `src/metatile_behavior.ts:921` |
| `MB_SECRET_BASE_SOUND_MAT` | enum_member | `include/constants/metatile_behaviors.h:194` | `include/constants/metatile_behaviors.ts:215` · `src/metatile_behavior.ts:927` |
| `MB_SECRET_BASE_SPIN_MAT` | enum_member | `include/constants/metatile_behaviors.h:193` | `include/constants/metatile_behaviors.ts:214` · `src/metatile_behavior.ts:926` |
| `MB_SECRET_BASE_SPOT_BLUE_CAVE` | enum_member | `include/constants/metatile_behaviors.h:159` | `include/constants/metatile_behaviors.ts:180` · `src/metatile_behavior.ts:919` |
| `MB_SECRET_BASE_SPOT_BROWN_CAVE` | enum_member | `include/constants/metatile_behaviors.h:151` | `include/constants/metatile_behaviors.ts:172` · `src/metatile_behavior.ts:915` |
| `MB_SECRET_BASE_SPOT_RED_CAVE` | enum_member | `include/constants/metatile_behaviors.h:149` | `include/constants/metatile_behaviors.ts:170` · `src/metatile_behavior.ts:914` |
| `MB_SECRET_BASE_SPOT_SHRUB` | enum_member | `include/constants/metatile_behaviors.h:157` | `include/constants/metatile_behaviors.ts:178` · `src/metatile_behavior.ts:918` |
| `MB_SECRET_BASE_SPOT_TREE_LEFT` | enum_member | `include/constants/metatile_behaviors.h:155` | `include/constants/metatile_behaviors.ts:176` · `src/metatile_behavior.ts:917` |
| `MB_SECRET_BASE_SPOT_TREE_RIGHT` | enum_member | `include/constants/metatile_behaviors.h:161` | `include/constants/metatile_behaviors.ts:182` · `src/metatile_behavior.ts:920` |
| `MB_SECRET_BASE_SPOT_YELLOW_CAVE` | enum_member | `include/constants/metatile_behaviors.h:153` | `include/constants/metatile_behaviors.ts:174` · `src/metatile_behavior.ts:916` |
| `MB_SECRET_BASE_TRAINER_SPOT` | enum_member | `include/constants/metatile_behaviors.h:184` | `include/constants/metatile_behaviors.ts:205` · `src/metatile_behavior.ts:922` |
| `MB_SECRET_BASE_TV_SHIELD` | enum_member | `include/constants/metatile_behaviors.h:201` | `include/constants/metatile_behaviors.ts:222` · `src/metatile_behavior.ts:929` |
| `MB_SOUTH_ARROW_WARP` | enum_member | `include/constants/metatile_behaviors.h:106` | `include/constants/metatile_behaviors.ts:127` · `src/engine/field/tilemap-loader.ts:83` |
| `MB_TALL_GRASS` | enum_member | `include/constants/metatile_behaviors.h:7` | `include/constants/metatile_behaviors.ts:28` · `src/engine/field/tilemap-loader.ts:49` |
| `MB_UP_ESCALATOR` | enum_member | `include/constants/metatile_behaviors.h:111` | `include/constants/metatile_behaviors.ts:132` · `src/engine/field/tilemap-loader.ts:88` |
| `MB_WATER_DOOR` | enum_member | `include/constants/metatile_behaviors.h:113` | `include/constants/metatile_behaviors.ts:134` · `src/engine/field/tilemap-loader.ts:90` |
| `MB_WATER_SOUTH_ARROW_WARP` | enum_member | `include/constants/metatile_behaviors.h:114` | `include/constants/metatile_behaviors.ts:135` · `src/engine/field/tilemap-loader.ts:91` |
| `MB_WEST_ARROW_WARP` | enum_member | `include/constants/metatile_behaviors.h:104` | `include/constants/metatile_behaviors.ts:125` · `src/engine/field/tilemap-loader.ts:81` |
| `MENU_B_PRESSED` | define | `include/menu.h:9` | `include/menu.ts:14` · `src/easy_chat.ts:537` · `src/evolution_scene.ts:810` · `src/main_menu.ts:1237` · `src/player_pc.ts:100` · `src/shop.ts:142` |
| `MENU_L_PRESSED` | define | `include/menu_helpers.h:7` | `include/menu_helpers.ts:12` · `src/menu_helpers.ts:48` |
| `MENU_NOTHING_CHOSEN` | define | `include/menu.h:8` | `include/menu.ts:12` · `src/player_pc.ts:99` · `src/pokemon_storage_system.ts:3736` · `src/shop.ts:141` |
| `MENU_R_PRESSED` | define | `include/menu_helpers.h:8` | `include/menu_helpers.ts:14` · `src/menu_helpers.ts:49` |
| `MENU_TOSS` | enum_member | `src/party_menu.c:95` · `src/player_pc.c:45` | `src/party_menu.ts:2306` · `src/player_pc.ts:105` |
| `METATILE_BattlePyramid_Exit` | define | `include/constants/metatile_labels.h:74` | `include/constants/metatile_labels.ts:63` · `src/battle_pyramid.ts:34` |
| `METATILE_BattlePyramid_Floor` | define | `include/constants/metatile_labels.h:75` | `include/constants/metatile_labels.ts:64` · `src/battle_pyramid.ts:35` |
| `MOD` | define, func_macro | `include/global.h:103` · `src/m4a_tables.c:246` | `src/battle_pyramid.ts:40` · `src/m4a_tables.ts:321` |
| `MON_ALREADY_KNOWS_MOVE` | define | `include/constants/pokemon.h:160` | `include/constants/pokemon.ts:138` · `src/evolution_scene.ts:806` |
| `MON_CANT_GIVE` | define | `include/constants/pokemon.h:154` | `include/constants/pokemon.ts:134` · `src/engine/battle/party-storage.ts:344` |
| `MON_DATA_HELD_ITEM` | enum_member | `include/pokemon.h:20` | `include/pokemon.ts:55` · `src/battle_setup.ts:1292` · `src/pokemon_storage_system.ts:1340` |
| `MON_DATA_HP` | enum_member | `include/pokemon.h:65` | `include/pokemon.ts:104` · `src/battle_controllers.ts:86` · `src/battle_setup.ts:1481` |
| `MON_DATA_IS_EGG` | enum_member | `include/pokemon.h:53` | `include/pokemon.ts:88` · `src/battle_controllers.ts:89` |
| `MON_DATA_LEVEL` | enum_member | `include/pokemon.h:64` | `include/pokemon.ts:103` · `src/battle_setup.ts:1483` |
| `MON_DATA_SPECIES` | enum_member | `include/pokemon.h:19` | `include/pokemon.ts:54` · `src/battle_controllers.ts:87` |
| `MON_DATA_SPECIES_OR_EGG` | enum_member | `include/pokemon.h:73` | `include/pokemon.ts:112` · `src/battle_controllers.ts:88` · `src/battle_setup.ts:1479` |
| `MON_FEMALE` | define | `include/constants/pokemon.h:170` | `include/constants/pokemon.ts:145` · `src/naming_screen.ts:167` |
| `MON_GENDERLESS` | define | `include/constants/pokemon.h:171` | `include/constants/pokemon.ts:146` · `src/naming_screen.ts:168` |
| `MON_GIVEN_TO_PARTY` | define | `include/constants/pokemon.h:152` | `include/constants/pokemon.ts:132` · `src/engine/battle/party-storage.ts:342` |
| `MON_GIVEN_TO_PC` | define | `include/constants/pokemon.h:153` | `include/constants/pokemon.ts:133` · `src/engine/battle/party-storage.ts:343` |
| `MON_HAS_MAX_MOVES` | define | `include/constants/pokemon.h:161` | `include/constants/pokemon.ts:139` · `src/battle_script_commands.ts:10056` · `src/evolution_scene.ts:805` |
| `MON_PIC_SIZE` | define | `include/constants/pokemon.h:267` | `src/battle_gfx_sfx_util.ts:93` · `src/pokemon_storage_system.ts:1333` · `src/trainer_pokemon_sprites.ts:42` |
| `MOVEEND_ATTACKER_INVISIBLE` | define | `include/constants/battle_script_commands.h:401` | `include/constants/battle_script_commands.ts:175` · `src/battle_script_commands.ts:1782` |
| `MOVEEND_ATTACKER_VISIBLE` | define | `include/constants/battle_script_commands.h:402` | `include/constants/battle_script_commands.ts:176` · `src/battle_script_commands.ts:1783` |
| `MOVEEND_CHANGED_ITEMS` | define | `include/constants/battle_script_commands.h:400` | `include/constants/battle_script_commands.ts:174` · `src/battle_script_commands.ts:1781` |
| `MOVEEND_CHOICE_MOVE` | define | `include/constants/battle_script_commands.h:399` | `include/constants/battle_script_commands.ts:173` · `src/battle_script_commands.ts:1780` |
| `MOVEEND_COUNT` | define | `include/constants/battle_script_commands.h:410` | `include/constants/battle_script_commands.ts:184` · `src/battle_script_commands.ts:1791` |
| `MOVEEND_DEFROST` | define | `include/constants/battle_script_commands.h:394` | `include/constants/battle_script_commands.ts:168` · `src/battle_script_commands.ts:1775` |
| `MOVEEND_IMMUNITY_ABILITIES` | define | `include/constants/battle_script_commands.h:397` | `include/constants/battle_script_commands.ts:171` · `src/battle_script_commands.ts:1778` |
| `MOVEEND_ITEM_EFFECTS_ALL` | define | `include/constants/battle_script_commands.h:404` | `include/constants/battle_script_commands.ts:178` · `src/battle_script_commands.ts:1785` |
| `MOVEEND_KINGSROCK_SHELLBELL` | define | `include/constants/battle_script_commands.h:405` | `include/constants/battle_script_commands.ts:179` · `src/battle_script_commands.ts:1786` |
| `MOVEEND_MIRROR_MOVE` | define | `include/constants/battle_script_commands.h:408` | `include/constants/battle_script_commands.ts:182` · `src/battle_script_commands.ts:1789` |
| `MOVEEND_NEXT_TARGET` | define | `include/constants/battle_script_commands.h:409` | `include/constants/battle_script_commands.ts:183` · `src/battle_script_commands.ts:1790` |
| `MOVEEND_ON_DAMAGE_ABILITIES` | define | `include/constants/battle_script_commands.h:396` | `include/constants/battle_script_commands.ts:170` · `src/battle_script_commands.ts:1777` |
| `MOVEEND_RAGE` | define | `include/constants/battle_script_commands.h:393` | `include/constants/battle_script_commands.ts:167` · `src/battle_script_commands.ts:1774` |
| `MOVEEND_SUBSTITUTE` | define | `include/constants/battle_script_commands.h:406` | `include/constants/battle_script_commands.ts:180` · `src/battle_script_commands.ts:1787` |
| `MOVEEND_SYNCHRONIZE_ATTACKER` | define | `include/constants/battle_script_commands.h:398` | `include/constants/battle_script_commands.ts:172` · `src/battle_script_commands.ts:1779` |
| `MOVEEND_SYNCHRONIZE_TARGET` | define | `include/constants/battle_script_commands.h:395` | `include/constants/battle_script_commands.ts:169` · `src/battle_script_commands.ts:1776` |
| `MOVEEND_TARGET_VISIBLE` | define | `include/constants/battle_script_commands.h:403` | `include/constants/battle_script_commands.ts:177` · `src/battle_script_commands.ts:1784` |
| `MOVEEND_UPDATE_LAST_MOVES` | define | `include/constants/battle_script_commands.h:407` | `include/constants/battle_script_commands.ts:181` · `src/battle_script_commands.ts:1788` |
| `MOVEMENT_ACTION_FACE_LEFT` | define | `include/constants/event_object_movement.h:89` | `include/constants/event_object_movement.ts:92` · `src/field_effect_helpers.ts:4232` |
| `MOVEMENT_ACTION_JUMP_IN_PLACE_LEFT` | define | `include/constants/event_object_movement.h:159` | `include/constants/event_object_movement.ts:162` · `src/field_effect_helpers.ts:4233` |
| `MOVEMENT_ACTION_NONE` | define | `include/constants/event_object_movement.h:247` | `include/constants/event_object_movement.ts:249` · `src/event_object_movement.ts:993` |
| `MOVEMENT_ACTION_START_ANIM_IN_DIRECTION` | define | `include/constants/event_object_movement.h:144` | `include/constants/event_object_movement.ts:147` · `src/field_effect_helpers.ts:1163` |
| `MOVE_MOST_POWERFUL` | define | `include/constants/battle_ai.h:35` | `include/constants/battle_ai.ts:31` · `src/battle_ai_script_commands.ts:223` |
| `MOVE_NONE` | define, enum_member | `include/constants/moves.h:4` · `src/wallclock.c:64` | `include/constants/moves.ts:8` · `src/evolution_scene.ts:804` · `src/wallclock.ts:79` |
| `MOVE_NOT_MOST_POWERFUL` | define | `include/constants/battle_ai.h:34` | `include/constants/battle_ai.ts:30` · `src/battle_ai_script_commands.ts:222` |
| `MOVE_POWER_OTHER` | define | `include/constants/battle_ai.h:33` | `include/constants/battle_ai.ts:29` · `src/battle_ai_script_commands.ts:221` |
| `MOVE_RESULT_DOESNT_AFFECT_FOE` | define | `include/constants/battle.h:222` | `include/battle.ts:155` · `src/engine/battle/wire-bytecode-bridge.ts:125` |
| `MOVE_RESULT_FAILED` | define | `include/constants/battle.h:224` | `include/battle.ts:157` · `src/engine/battle/wire-bytecode-bridge.ts:127` |
| `MOVE_RESULT_FOE_ENDURED` | define | `include/constants/battle.h:225` | `include/battle.ts:158` · `src/engine/battle/wire-bytecode-bridge.ts:128` |
| `MOVE_RESULT_FOE_HUNG_ON` | define | `include/constants/battle.h:226` | `include/battle.ts:159` · `src/engine/battle/wire-bytecode-bridge.ts:129` |
| `MOVE_RESULT_MISSED` | define | `include/constants/battle.h:219` | `include/battle.ts:152` · `src/engine/battle/wire-bytecode-bridge.ts:122` |
| `MOVE_RESULT_NOT_VERY_EFFECTIVE` | define | `include/constants/battle.h:221` | `include/battle.ts:154` · `src/engine/battle/wire-bytecode-bridge.ts:124` |
| `MOVE_RESULT_ONE_HIT_KO` | define | `include/constants/battle.h:223` | `include/battle.ts:156` · `src/engine/battle/wire-bytecode-bridge.ts:126` |
| `MOVE_RESULT_SUPER_EFFECTIVE` | define | `include/constants/battle.h:220` | `include/battle.ts:153` · `src/engine/battle/wire-bytecode-bridge.ts:123` |
| `MULTIUSE_STATE` | define | `include/constants/battle_script_commands.h:287` | `include/constants/battle_script_commands.ts:62` · `src/battle_main.ts:785` |
| `MULTI_PARTY_SIZE` | define | `include/constants/global.h:34` | `include/constants/global.ts:140` · `src/apprentice.ts:23` · `src/engine/save/save-blocks.ts:39` |
| `MUS_ROUTE122` | define | `include/constants/songs.h:305` | `include/constants/songs.ts:302` · `src/main_menu.ts:1238` |
| `MUS_TITLE` | define | `include/constants/songs.h:344` | `harness/runtime/decomp-globals.ts:849` · `include/constants/songs.ts:341` · `src/title_screen.ts:79` |
| `MUS_VICTORY_TRAINER` | define | `include/constants/songs.h:343` | `include/constants/songs.ts:340` · `src/battle_script_commands.ts:11577` |
| `MainCallback` | typedef | `include/main.h:4` | `src/easy_chat.ts:503` · `src/item_menu.ts:184` · `src/mail.ts:106` |
| `NAMING_SCREEN_PLAYER` | enum_member | `include/naming_screen.h:7` | `src/main_menu.ts:1239` · `src/naming_screen.ts:160` |
| `NOT_SWAPPING` | define | `src/item_menu.c:104` · `src/player_pc.c:86` | `src/item_menu.ts:182` · `src/player_pc.ts:236` |
| `NO_ANCHOR` | define | `include/sprite.h:10` | `include/sprite.ts:12` · `src/engine/decomp-impls/sprite-engine-impl.ts:164` |
| `NUMBER_OF_MON_TYPES` | define | `include/constants/pokemon.h:24` | `include/constants/pokemon.ts:27` · `src/pokemon_summary_screen.ts:197` |
| `NUM_BARD_SONG_WORDS` | define | `include/constants/global.h:117` | `include/constants/global.ts:103` · `src/easy_chat.ts:3369` · `src/engine/save/save-blocks.ts:92` |
| `NUM_CONTEST_WINNERS` | define | `include/constants/global.h:62` | `include/constants/global.ts:59` · `src/engine/save/save-blocks.ts:69` |
| `NUM_DECORATIONS` | define | `include/constants/decorations.h:125` | `src/decoration.ts:1089` · `src/secret_base.ts:275` |
| `NUM_GAME_STATS` | define | `include/constants/game_stat.h:58` | `include/constants/game_stat.ts:61` · `src/engine/save/save-blocks.ts:48` |
| `NUM_METATILES_IN_PRIMARY` | define | `include/fieldmap.h:6` | `include/fieldmap.ts:10` · `src/fieldmap.ts:132` |
| `NUM_METATILES_TOTAL` | define | `include/fieldmap.h:7` | `include/fieldmap.ts:11` · `src/fieldmap.ts:133` |
| `NUM_PALS_IN_PRIMARY` | define | `include/fieldmap.h:8` | `include/fieldmap.ts:12` · `src/fieldmap.ts:134` |
| `NUM_PALS_TOTAL` | define | `include/fieldmap.h:9` | `include/fieldmap.ts:13` · `src/fieldmap.ts:135` |
| `NUM_QUESTIONNAIRE_WORDS` | define | `include/constants/global.h:101` | `include/constants/global.ts:90` · `src/easy_chat.ts:352` · `src/engine/save/save-blocks.ts:86` |
| `NUM_SPECIAL_FLAGS` | define | `include/constants/flags.h:1652` | `include/constants/flags.ts:1481` · `src/event_data.ts:44` |
| `NUM_STATS` | define | `include/constants/pokemon.h:81` | `include/constants/pokemon.ts:77` · `src/engine/save/save-blocks.ts:104` · `src/menu_specialized.ts:76` |
| `NUM_STORYTELLER_TALES` | define | `include/constants/global.h:118` | `include/constants/global.ts:104` · `src/engine/save/save-blocks.ts:93` |
| `NUM_TASKS` | define | `include/task.h:8` | `harness/runtime/decomp-runtime.ts:559` · `include/task.ts:10` · `src/pokenav_looped_task.ts:42` |
| `NUM_TASK_DATA` | define | `include/task.h:9` | `harness/runtime/decomp-runtime.ts:560` · `src/field_tasks.ts:119` · `src/task.ts:41` |
| `NUM_TILES_IN_PRIMARY` | define | `include/fieldmap.h:4` | `include/fieldmap.ts:8` · `src/fieldmap.ts:130` · `src/tileset_anims.ts:77` |
| `NUM_TILES_PER_METATILE` | define | `include/fieldmap.h:12` | `include/fieldmap.ts:15` · `src/fieldmap.ts:137` |
| `NUM_TILES_TOTAL` | define | `include/fieldmap.h:5` | `include/fieldmap.ts:9` · `src/fieldmap.ts:131` |
| `NUM_TRADER_ITEMS` | define | `include/constants/global.h:119` | `include/constants/global.ts:105` · `src/engine/save/save-blocks.ts:94` |
| `NUM_TRAINER_HILL_FLOORS` | define | `include/constants/trainer_hill.h:17` | `src/ereader_helpers.ts:23` · `src/trainer_hill.ts:28` |
| `NUM_TRENDY_SAYINGS` | define | `include/constants/easy_chat.h:1098` | `src/easy_chat.ts:351` · `src/engine/save/save-blocks.ts:66` |
| `NUM_UNOWN_FORMS` | define | `include/pokemon.h:362` | `include/pokemon.ts:21` · `src/mail_data.ts:82` |
| `OAM_MATRIX_COUNT` | define | `include/sprite.h:4` | `include/sprite.ts:8` · `src/sprite.ts:84` |
| `OBJECT_EVENTS_COUNT` | define | `include/constants/global.h:46` | `include/constants/global.ts:42` · `src/engine/save/save-blocks.ts:50` · `src/event_object_movement.ts:156` · `src/field_effect_helpers.ts:163` · `src/script_movement.ts:284` |
| `OBJECT_EVENT_TEMPLATES_COUNT` | define | `include/constants/global.h:56` | `include/constants/global.ts:53` · `src/engine/save/save-blocks.ts:51` |
| `OBJ_PLTT_ID` | func_macro | `include/palette.h:24` | `src/list_menu.ts:1047` · `src/palette.ts:58` |
| `OBJ_VRAM0` | define | `include/gba/defines.h:54` | `src/credits.ts:63` · `src/pokenav_main_menu.ts:209` · `src/pokenav_match_call_gfx.ts:142` |
| `OLD_ROD` | define | `include/constants/items.h:461` | `include/constants/items.ts:441` · `src/wild_encounter.ts:656` |
| `OPTIONS_BUTTON_MODE_L_EQUALS_A` | define | `include/constants/global.h:125` | `include/constants/global.ts:110` · `src/battle_controller_player.ts:294` |
| `OPTIONS_TEXT_SPEED_FAST` | define | `include/constants/global.h:129` | `include/constants/global.ts:113` · `src/menu.ts:50` |
| `OPTIONS_TEXT_SPEED_MID` | define | `include/constants/global.h:128` | `include/constants/global.ts:112` · `src/menu.ts:49` |
| `OPTIONS_TEXT_SPEED_SLOW` | define | `include/constants/global.h:127` | `include/constants/global.ts:111` · `src/menu.ts:48` |
| `OT_ID_PLAYER_ID` | define | `include/constants/pokemon.h:148` | `include/constants/pokemon.ts:129` · `src/battle_setup.ts:1263` |
| `ObjectEventTemplate` | struct | `include/global.fieldmap.h:92` | `src/engine/save/save-blocks.ts:840` · `src/fieldmap.ts:205` |
| `PAGE_COUNT` | enum_member | `src/data/credits.h:61` | `src/credits.ts:109` · `src/data/credits.ts:11` |
| `PALETTES_ALL` | define | `include/palette.h:18` | `harness/runtime/decomp-globals.ts:179` · `src/easy_chat.ts:538` · `src/palette.ts:51` · `src/pokedex.ts:151` · `src/pokemon_storage_system.ts:1341` |
| `PALETTES_OBJECTS` | define | `include/palette.h:17` | `src/main_menu.ts:1241` · `src/palette.ts:50` |
| `PALTAG_CURSOR` | define, enum_member | `src/data/trade.h:9` · `src/pokenav_match_call_gfx.c:30` · `src/roulette.c:127` · `src/naming_screen.c:70` | `src/naming_screen.ts:186` · `src/pokenav_match_call_gfx.ts:148` |
| `PARTY_ACTION_ABILITY_PREVENTS` | define | `include/constants/party_menu.h:72` | `include/constants/party_menu.ts:71` · `src/battle_main.ts:2603` |
| `PARTY_ACTION_CANT_SWITCH` | define | `include/constants/party_menu.h:70` | `include/constants/party_menu.ts:69` · `src/battle_main.ts:2602` |
| `PARTY_ACTION_CHOOSE_MON` | define | `include/constants/party_menu.h:68` | `include/constants/party_menu.ts:67` · `src/battle_main.ts:2599` |
| `PARTY_SIZE` | define | `include/constants/global.h:33` | `include/constants/global.ts:31` · `src/battle_controllers.ts:76` · `src/battle_interface.ts:424` · `src/battle_main.ts:781` · `src/engine/battle/party-storage.ts:95` · `src/engine/save/save-blocks.ts:38` |
| `PC_ITEMS_COUNT` | define | `include/constants/global.h:50` | `include/constants/global.ts:47` · `src/engine/save/save-blocks.ts:41` · `src/item.ts:331` |
| `PIXEL_FILL` | func_macro | `include/window.h:6` | `include/window.ts:20` · `src/field_screen_effect.ts:104` · `src/list_menu.ts:408` · `src/menu_specialized.ts:92` |
| `PLACEHOLDER_BEGIN` | define | `include/constants/characters.h:178` | `include/constants/characters.ts:172` · `src/battle_message.ts:90` |
| `PLAYER_AVATAR_FLAG_ACRO_BIKE` | define | `include/global.fieldmap.h:290` | `include/global.fieldmap.ts:29` · `src/overworld.ts:778` |
| `PLAYER_AVATAR_FLAG_CONTROLLABLE` | define | `include/global.fieldmap.h:293` | `include/global.fieldmap.ts:32` · `src/field_effect_helpers.ts:1167` |
| `PLAYER_AVATAR_FLAG_MACH_BIKE` | define | `include/global.fieldmap.h:289` | `include/global.fieldmap.ts:28` · `src/overworld.ts:777` |
| `PLAYER_AVATAR_FLAG_SURFING` | define | `include/global.fieldmap.h:291` | `include/global.fieldmap.ts:30` · `src/overworld.ts:779` |
| `PLAYER_AVATAR_STATE_FIELD_MOVE` | enum_member | `include/global.fieldmap.h:283` | `src/field_effect_helpers.ts:1165` · `src/field_player_avatar.ts:1873` |
| `PLAYER_HAS_TWO_USABLE_MONS` | define | `include/constants/pokemon.h:156` | `include/constants/pokemon.ts:135` · `src/trainer_see.ts:273` |
| `PLAYER_SPEED_FASTEST` | enum_member | `include/bike.h:24` | `src/field_control_avatar.ts:201` · `src/field_player_avatar.ts:991` |
| `PLTT_SIZE_4BPP` | define | `include/gba/defines.h:90` | `harness/runtime/decomp-bridge.ts:78` · `include/gba/defines.ts:95` · `src/sprite.ts:87` · `src/text_window.ts:53` |
| `POCKETS_COUNT` | define | `include/constants/item.h:17` | `include/constants/item.ts:19` · `src/engine/bag/bag-types.ts:43` |
| `POCKET_NONE` | define | `include/constants/item.h:5` | `include/constants/item.ts:8` · `src/item_menu_icons.ts:51` |
| `POKEBALL_COUNT` | enum_member | `include/pokeball.h:18` | `include/pokeball.ts:22` · `src/pokeball.ts:244` |
| `POKEBLOCKS_COUNT` | define | `include/constants/global.h:45` | `include/constants/global.ts:41` · `src/engine/save/save-blocks.ts:47` |
| `POKEMON_NAME_LENGTH` | define | `include/constants/global.h:95` | `include/constants/global.ts:83` · `src/engine/save/save-blocks.ts:36` · `src/naming_screen.ts:169` |
| `POKENAV_FADE_FROM_BLACK` | enum_member | `include/pokenav.h:303` | `src/pokenav_conditions_gfx.ts:162` · `src/pokenav_conditions_search_results.ts:105` · `src/pokenav_main_menu.ts:204` · `src/pokenav_match_call_gfx.ts:134` · `src/pokenav_menu_handler_gfx.ts:85` · `src/pokenav_region_map.ts:165` · `src/pokenav_ribbons_list.ts:68` · `src/pokenav_ribbons_summary.ts:82` |
| `POKENAV_FADE_FROM_BLACK_ALL` | enum_member | `include/pokenav.h:305` | `src/pokenav_main_menu.ts:206` · `src/pokenav_menu_handler_gfx.ts:86` |
| `POKENAV_FADE_TO_BLACK` | enum_member | `include/pokenav.h:302` | `src/pokenav_conditions_gfx.ts:167` · `src/pokenav_conditions_search_results.ts:106` · `src/pokenav_main_menu.ts:203` · `src/pokenav_match_call_gfx.ts:140` · `src/pokenav_menu_handler_gfx.ts:91` · `src/pokenav_region_map.ts:169` · `src/pokenav_ribbons_list.ts:70` · `src/pokenav_ribbons_summary.ts:84` |
| `POKENAV_GFX_CONDITION_MENU` | enum_member | `include/pokenav.h:99` | `src/pokenav_conditions_gfx.ts:164` · `src/pokenav_conditions_search_results.ts:104` · `src/pokenav_menu_handler_gfx.ts:89` |
| `POKENAV_GFX_MAP_MENU_ZOOMED_OUT` | enum_member | `include/pokenav.h:102` | `src/pokenav_main_menu.ts:208` · `src/pokenav_region_map.ts:163` |
| `POKENAV_GFX_PARTY_MENU` | enum_member | `include/pokenav.h:104` | `src/pokenav_conditions_gfx.ts:163` · `src/pokenav_main_menu.ts:211` |
| `POKENAV_MENUITEM_CONDITION_SEARCH_COOL` | enum_member | `include/pokenav.h:158` | `src/pokenav_conditions_search_results.ts:103` · `src/pokenav_menu_handler.ts:35` · `src/pokenav_resources.ts:67` |
| `POKENAV_MENUITEM_CONDITION_SEARCH_TOUGH` | enum_member | `include/pokenav.h:162` | `src/pokenav_menu_handler.ts:39` · `src/pokenav_resources.ts:68` |
| `POKENAV_MENU_FUNC_EXIT` | define | `include/pokenav.h:269` | `src/pokenav.ts:256` · `src/pokenav_menu_handler.ts:25` |
| `POKENAV_MENU_TYPE_CONDITION` | enum_member | `include/pokenav.h:141` | `src/pokenav_menu_handler.ts:46` · `src/pokenav_menu_handler_gfx.ts:82` |
| `POKENAV_MENU_TYPE_CONDITION_SEARCH` | enum_member | `include/pokenav.h:142` | `src/pokenav_menu_handler.ts:47` · `src/pokenav_menu_handler_gfx.ts:83` |
| `POKENAV_MODE_FORCE_CALL_EXIT` | enum_member | `include/pokenav.h:69` | `src/pokenav_match_call_list.ts:51` · `src/pokenav_menu_handler.ts:50` |
| `POKENAV_MODE_FORCE_CALL_READY` | enum_member | `include/pokenav.h:68` | `src/pokenav_match_call_list.ts:45` · `src/pokenav_menu_handler.ts:49` |
| `POKENAV_MODE_NORMAL` | enum_member | `include/pokenav.h:67` | `src/pokenav.ts:186` · `src/pokenav_menu_handler.ts:48` |
| `POKENAV_SUBSTRUCT_MON_LIST` | enum_member | `include/pokenav.h:92` | `src/pokenav_conditions.ts:55` · `src/pokenav_conditions_search_results.ts:92` · `src/pokenav_ribbons_list.ts:57` · `src/pokenav_ribbons_summary.ts:72` |
| `POKE_ICON_BASE_PAL_TAG` | define | `include/constants/pokemon_icon.h:4` | `src/pokemon_icon.ts:140` · `src/pokemon_storage_system.ts:215` |
| `POKE_NEWS_COUNT` | define | `include/constants/global.h:49` | `include/constants/global.ts:46` · `src/engine/save/save-blocks.ts:63` |
| `PREPARE_MON_NICK_BUFFER` | func_macro | `include/battle_message.h:193` | `include/battle_message.ts:225` · `src/battle_main.ts:4565` |
| `PYRAMID_BAG_ITEMS_COUNT` | define | `include/constants/global.h:66` | `include/constants/global.ts:63` · `src/engine/save/save-blocks.ts:82` |
| `QUIZ_QUESTION_LEN` | define | `include/constants/global.h:102` | `include/constants/global.ts:91` · `src/engine/save/save-blocks.ts:97` |
| `Q_8_8` | func_macro | `include/global.h:67` | `src/egg_hatch.ts:212` · `src/image_processing_effects.ts:56` · `src/palette.ts:128` · `src/pokemon_storage_system.ts:5473` · `src/trig.ts:23` |
| `REG_OFFSET_BG0CNT` | define | `include/gba/io_reg.h:11` | `harness/runtime/decomp-runtime.ts:63` · `include/gba/io_reg.ts:12` · `src/battle_main.ts:302` · `src/pokemon_storage_system.ts:1336` |
| `REG_OFFSET_BG0HOFS` | define | `include/gba/io_reg.h:15` | `harness/runtime/decomp-runtime.ts:67` · `include/gba/io_reg.ts:16` · `src/battle_main.ts:290` · `src/pokedex.ts:120` · `src/pokemon_storage_system.ts:1338` · `src/scanline_effect.ts:33` |
| `REG_OFFSET_BG0VOFS` | define | `include/gba/io_reg.h:16` | `harness/runtime/decomp-runtime.ts:68` · `include/gba/io_reg.ts:17` · `src/battle_main.ts:291` · `src/pokedex.ts:121` |
| `REG_OFFSET_BG1HOFS` | define | `include/gba/io_reg.h:17` | `harness/runtime/decomp-runtime.ts:69` · `include/gba/io_reg.ts:18` · `src/battle_main.ts:292` · `src/pokedex.ts:122` |
| `REG_OFFSET_BG1VOFS` | define | `include/gba/io_reg.h:18` | `harness/runtime/decomp-runtime.ts:70` · `include/gba/io_reg.ts:19` · `src/battle_main.ts:293` · `src/pokedex.ts:123` |
| `REG_OFFSET_BG2HOFS` | define | `include/gba/io_reg.h:19` | `harness/runtime/decomp-runtime.ts:71` · `include/gba/io_reg.ts:20` · `src/battle_main.ts:294` · `src/pokedex.ts:124` · `src/pokemon_storage_system.ts:1337` |
| `REG_OFFSET_BG2VOFS` | define | `include/gba/io_reg.h:20` | `harness/runtime/decomp-runtime.ts:72` · `include/gba/io_reg.ts:21` · `src/battle_main.ts:295` · `src/pokedex.ts:134` |
| `REG_OFFSET_BG3HOFS` | define | `include/gba/io_reg.h:21` | `harness/runtime/decomp-runtime.ts:73` · `include/gba/io_reg.ts:22` · `src/battle_main.ts:296` · `src/pokedex.ts:125` |
| `REG_OFFSET_BG3VOFS` | define | `include/gba/io_reg.h:22` | `harness/runtime/decomp-runtime.ts:74` · `include/gba/io_reg.ts:23` · `src/battle_main.ts:297` · `src/pokedex.ts:126` |
| `REG_OFFSET_BLDALPHA` | define | `include/gba/io_reg.h:51` | `harness/runtime/decomp-runtime.ts:99` · `include/gba/io_reg.ts:52` · `src/battle_anim_effects_2.ts:188` · `src/battle_anim_effects_3.ts:381` · `src/battle_anim_ghost.ts:65` · `src/field_screen_effect.ts:86` · `src/pokedex.ts:142` |
| `REG_OFFSET_BLDCNT` | define | `include/gba/io_reg.h:50` | `harness/runtime/decomp-runtime.ts:98` · `include/gba/io_reg.ts:51` · `src/battle_anim_effects_2.ts:187` · `src/battle_anim_effects_3.ts:380` · `src/battle_anim_ghost.ts:64` · `src/field_screen_effect.ts:85` · `src/pokedex.ts:141` · `src/pokemon_storage_system.ts:1339` |
| `REG_OFFSET_BLDY` | define | `include/gba/io_reg.h:52` | `harness/runtime/decomp-runtime.ts:100` · `include/gba/io_reg.ts:53` · `src/pokedex.ts:143` |
| `REG_OFFSET_DISPCNT` | define | `include/gba/io_reg.h:8` | `harness/runtime/decomp-runtime.ts:62` · `include/gba/io_reg.ts:9` · `src/battle_anim_effects_3.ts:376` · `src/field_screen_effect.ts:84` · `src/pokedex.ts:133` |
| `REG_OFFSET_MOSAIC` | define | `include/gba/io_reg.h:49` | `harness/runtime/decomp-runtime.ts:97` · `include/gba/io_reg.ts:50` · `src/battle_main.ts:799` |
| `REG_OFFSET_WIN0H` | define | `include/gba/io_reg.h:43` | `harness/runtime/decomp-runtime.ts:91` · `include/gba/io_reg.ts:44` · `src/battle_anim_effects_3.ts:377` · `src/battle_main.ts:298` · `src/field_screen_effect.ts:87` · `src/pokedex.ts:137` |
| `REG_OFFSET_WIN0V` | define | `include/gba/io_reg.h:45` | `harness/runtime/decomp-runtime.ts:93` · `include/gba/io_reg.ts:46` · `src/battle_anim_effects_3.ts:378` · `src/battle_main.ts:299` · `src/pokedex.ts:138` |
| `REG_OFFSET_WIN1H` | define | `include/gba/io_reg.h:44` | `harness/runtime/decomp-runtime.ts:92` · `include/gba/io_reg.ts:45` · `src/battle_main.ts:300` · `src/pokedex.ts:139` |
| `REG_OFFSET_WIN1V` | define | `include/gba/io_reg.h:46` | `harness/runtime/decomp-runtime.ts:94` · `include/gba/io_reg.ts:47` · `src/battle_main.ts:301` · `src/pokedex.ts:140` |
| `REG_OFFSET_WININ` | define | `include/gba/io_reg.h:47` | `harness/runtime/decomp-runtime.ts:95` · `include/gba/io_reg.ts:48` · `src/battle_main.ts:800` · `src/field_screen_effect.ts:88` · `src/pokedex.ts:135` |
| `REG_OFFSET_WINOUT` | define | `include/gba/io_reg.h:48` | `harness/runtime/decomp-runtime.ts:96` · `include/gba/io_reg.ts:49` · `src/battle_anim_effects_3.ts:379` · `src/battle_main.ts:801` · `src/field_screen_effect.ts:89` · `src/pokedex.ts:136` |
| `REMATCH_BRAWLY` | enum_member | `include/constants/rematches.h:71` | `src/gym_leader_rematch.ts:17` · `src/pokenav_match_call_data.ts:119` |
| `REMATCH_ELITE_FOUR_ENTRIES` | define | `include/constants/rematches.h:87` | `src/battle_setup.ts:770` · `src/pokenav_match_call_data.ts:139` |
| `REMATCH_FLANNERY` | enum_member | `include/constants/rematches.h:73` | `src/gym_leader_rematch.ts:19` · `src/pokenav_match_call_data.ts:121` |
| `REMATCH_JUAN` | enum_member | `include/constants/rematches.h:77` | `src/gym_leader_rematch.ts:23` · `src/pokenav_match_call_data.ts:124` |
| `REMATCH_NORMAN` | enum_member | `include/constants/rematches.h:74` | `src/gym_leader_rematch.ts:20` · `src/pokenav_match_call_data.ts:116` |
| `REMATCH_ROXANNE` | enum_member | `include/constants/rematches.h:70` | `src/gym_leader_rematch.ts:16` · `src/pokenav_match_call_data.ts:118` |
| `REMATCH_SPECIAL_TRAINER_START` | define | `include/constants/rematches.h:86` | `src/battle_setup.ts:768` · `src/match_call.ts:93` |
| `REMATCH_TABLE_ENTRIES` | enum_member | `include/constants/rematches.h:83` | `src/battle_setup.ts:766` · `src/match_call.ts:92` · `src/pokenav_match_call_data.ts:138` · `src/pokenav_match_call_list.ts:62` · `src/pokenav_menu_handler_gfx.ts:77` |
| `REMATCH_TATE_AND_LIZA` | enum_member | `include/constants/rematches.h:76` | `src/gym_leader_rematch.ts:22` · `src/pokenav_match_call_data.ts:123` |
| `REMATCH_WALLY_VR` | enum_member | `include/constants/rematches.h:69` | `src/battle_setup.ts:771` · `src/pokenav_match_call_data.ts:117` |
| `REMATCH_WATTSON` | enum_member | `include/constants/rematches.h:72` | `src/gym_leader_rematch.ts:18` · `src/pokenav_match_call_data.ts:120` |
| `REMATCH_WINONA` | enum_member | `include/constants/rematches.h:75` | `src/gym_leader_rematch.ts:21` · `src/pokenav_match_call_data.ts:122` |
| `REQUEST_ALL_BATTLE` | enum_member | `include/battle_controllers.h:5` | `src/battle_main.ts:4132` · `src/engine/battle/constants.ts:1308` |
| `RESOURCE_FLAG_FLASH_FIRE` | define | `include/battle.h:68` | `include/battle.ts:44` · `src/battle_ai_script_commands.ts:1438` · `src/battle_util.ts:2878` |
| `RGB` | func_macro | `include/constants/rgb.h:8` | `include/gba/defines.ts:88` · `src/pokemon_animation.ts:40` |
| `RGB_BLACK` | define | `include/constants/rgb.h:15` | `include/gba/defines.ts:91` · `src/battle_main.ts:6462` · `src/battle_transition.ts:324` · `src/easy_chat.ts:539` · `src/item_menu.ts:1168` · `src/pokedex.ts:150` · `src/pokedex_area_screen.ts:635` · `src/pokemon_animation.ts:41` · `src/pokemon_storage_system.ts:1342` |
| `RGB_BLUE` | define | `include/constants/rgb.h:19` | `src/field_screen_effect.ts:111` · `src/pokemon_animation.ts:44` |
| `RGB_RED` | define | `include/constants/rgb.h:17` | `src/field_screen_effect.ts:110` · `src/fldeff_sweetscent.ts:31` · `src/image_processing_effects.ts:55` · `src/pokemon_animation.ts:42` |
| `RGB_WHITE` | define | `include/constants/rgb.h:16` | `harness/boot/copyright-boot.ts:30` · `include/gba/defines.ts:92` · `src/battle_anim_effects_1.ts:671` · `src/battle_anim_effects_1b.ts:148` · `src/battle_transition.ts:325` |
| `RGB_WHITEALPHA` | define | `include/constants/rgb.h:23` | `include/gba/defines.ts:93` · `src/pokemon_storage_system.ts:5372` |
| `ROTATE_CLOCKWISE` | define, enum_member | `src/rotating_tile_puzzle.c:12` · `src/rotating_gate.c:172` | `src/rotating_gate.ts:61` · `src/rotating_tile_puzzle.ts:25` |
| `ROTATE_NONE` | define, enum_member | `src/rotating_tile_puzzle.c:13` · `src/rotating_gate.c:170` | `src/rotating_gate.ts:59` · `src/rotating_tile_puzzle.ts:27` |
| `RTC_ERR_FLAG_MASK` | define | `include/rtc.h:18` | `src/main_menu.ts:1242` · `src/rtc.ts:70` |
| `R_BUTTON` | define | `include/gba/io_reg.h:707` | `include/gba/io_reg.ts:965` · `src/battle_controllers.ts:1452` · `src/list_menu.ts:319` · `src/menu_helpers.ts:58` |
| `SAVED_TRENDS_COUNT` | define | `include/constants/global.h:65` | `include/constants/global.ts:62` · `src/dewford_trend.ts:40` · `src/engine/save/save-blocks.ts:68` |
| `SAVE_STATUS_CORRUPT` | define | `include/save.h:36` | `src/intro.ts:189` · `src/main_menu.ts:1243` · `src/save.ts:84` |
| `SAVE_STATUS_EMPTY` | define | `include/save.h:34` | `src/intro.ts:190` · `src/main_menu.ts:1244` · `src/save.ts:82` |
| `SAVE_STATUS_ERROR` | define | `include/save.h:38` | `src/main_menu.ts:1245` · `src/save.ts:86` |
| `SAVE_STATUS_NO_FLASH` | define | `include/save.h:37` | `src/main_menu.ts:1246` · `src/save.ts:85` |
| `SAVE_STATUS_OK` | define | `include/save.h:35` | `src/main_menu.ts:1247` · `src/save.ts:83` |
| `SCANLINE_EFFECT_REG_BG1HOFS` | define | `include/scanline_effect.h:10` | `src/intro.ts:191` · `src/scanline_effect.ts:46` · `src/title_screen.ts:81` |
| `SCANLINE_EFFECT_REG_BG1VOFS` | define | `include/scanline_effect.h:11` | `src/intro.ts:192` · `src/scanline_effect.ts:47` |
| `SECRET_BASES_COUNT` | define | `include/constants/global.h:48` | `include/constants/global.ts:45` · `src/engine/save/save-blocks.ts:59` |
| `SELECTWINDOW_ACTIONS` | define | `include/constants/party_menu.h:129` | `include/constants/party_menu.ts:123` · `src/party_menu.ts:2510` |
| `SELECTWINDOW_ITEM` | define | `include/constants/party_menu.h:130` | `include/constants/party_menu.ts:124` · `src/party_menu.ts:2511` |
| `SELECTWINDOW_MAIL` | define | `include/constants/party_menu.h:131` | `include/constants/party_menu.ts:125` · `src/party_menu.ts:2512` |
| `SELECTWINDOW_MOVES` | define | `include/constants/party_menu.h:132` | `include/constants/party_menu.ts:126` · `src/party_menu.ts:2513` |
| `SELECT_BUTTON` | define | `include/gba/io_reg.h:701` | `include/gba/io_reg.ts:959` · `src/battle_controllers.ts:1446` · `src/easy_chat.ts:529` |
| `SE_BALL_OPEN` | define | `include/constants/songs.h:21` | `include/constants/songs.ts:23` · `src/battle_anim_throw.ts:1428` |
| `SE_DOWNPOUR` | define | `include/constants/songs.h:89` | `include/constants/songs.ts:91` · `src/field_weather.ts:1128` |
| `SE_FAILURE` | define | `include/constants/songs.h:38` | `include/constants/songs.ts:40` · `src/easy_chat.ts:536` · `src/pokemon_summary_screen.ts:2411` |
| `SE_M_BUBBLE2` | define | `include/constants/songs.h:132` | `include/constants/songs.ts:133` · `src/battle_anim_effects_1.ts:669` · `src/battle_anim_effects_1b.ts:108` |
| `SE_M_CONFUSE_RAY` | define | `include/constants/songs.h:203` | `include/constants/songs.ts:204` · `src/battle_anim_ghost.ts:63` |
| `SE_M_ENCORE` | define | `include/constants/songs.h:229` | `include/constants/songs.ts:230` · `src/battle_anim_effects_3.ts:371` |
| `SE_M_HORN_ATTACK` | define | `include/constants/songs.h:173` | `include/constants/songs.ts:174` · `src/battle_anim_effects_2.ts:1111` |
| `SE_M_LEER` | define | `include/constants/songs.h:199` | `include/constants/songs.ts:200` · `src/battle_anim_effects_1.ts:666` · `src/battle_anim_effects_3.ts:369` |
| `SE_M_LOCK_ON` | define | `include/constants/songs.h:217` | `include/constants/songs.ts:218` · `src/battle_anim_effects_1.ts:668` |
| `SE_M_SKETCH` | define | `include/constants/songs.h:212` | `include/constants/songs.ts:213` · `src/battle_anim_effects_3.ts:370` |
| `SE_M_SWAGGER2` | define | `include/constants/songs.h:201` | `include/constants/songs.ts:202` · `src/battle_anim_effects_1.ts:667` |
| `SE_M_TELEPORT` | define | `include/constants/songs.h:210` | `include/constants/songs.ts:211` · `src/battle_anim_psychic.ts:74` |
| `SE_RAIN` | define | `include/constants/songs.h:91` | `include/constants/songs.ts:93` · `src/field_weather.ts:1126` |
| `SE_SELECT` | define | `include/constants/songs.h:11` | `include/constants/songs.ts:13` · `src/battle_controllers.ts:1459` · `src/easy_chat.ts:535` · `src/list_menu.ts:424` · `src/main_menu.ts:136` · `src/mon_markings.ts:183` · `src/pokemon_summary_screen.ts:2410` |
| `SE_THUNDERSTORM` | define | `include/constants/songs.h:87` | `include/constants/songs.ts:89` · `src/field_weather.ts:1127` |
| `SHADOW_SIZE_L` | define | `include/constants/event_objects.h:282` | `include/constants/event_object_movement.ts:361` · `include/constants/event_objects.ts:284` |
| `SHADOW_SIZE_M` | define | `include/constants/event_objects.h:281` | `include/constants/event_object_movement.ts:360` · `include/constants/event_objects.ts:283` |
| `SHADOW_SIZE_S` | define | `include/constants/event_objects.h:280` | `include/constants/event_object_movement.ts:359` · `include/constants/event_objects.ts:282` |
| `SHADOW_SIZE_XL` | define | `include/constants/event_objects.h:283` | `include/constants/event_object_movement.ts:362` · `include/constants/event_objects.ts:285` |
| `SMARTSHOPPER_NUM_ITEMS` | define | `include/constants/tv.h:276` | `include/constants/tv.ts:278` · `src/engine/save/save-blocks.ts:98` |
| `SOUND_PAN_ATTACKER` | define | `include/constants/battle_anim.h:324` | `include/constants/battle_anim.ts:601` · `src/battle_anim.ts:114` · `src/battle_anim_effects_1.ts:663` · `src/battle_anim_effects_1b.ts:109` · `src/battle_anim_effects_3.ts:372` |
| `SOUND_PAN_TARGET` | define | `include/constants/battle_anim.h:325` | `include/constants/battle_anim.ts:602` · `src/battle_anim.ts:115` · `src/battle_anim_effects_1.ts:664` · `src/battle_anim_effects_1b.ts:110` · `src/battle_anim_effects_3.ts:373` |
| `SPECIAL_FLAGS_START` | define | `include/constants/flags.h:1644` | `include/constants/flags.ts:1474` · `src/event_data.ts:43` |
| `SPECIAL_VARS_END` | define | `include/constants/vars.h:306` | `include/constants/vars.ts:289` · `src/event_data.ts:41` |
| `SPECIAL_VARS_START` | define | `include/constants/vars.h:280` | `include/constants/vars.ts:266` · `src/event_data.ts:40` |
| `SPECIES_BULBASAUR` | define | `include/constants/species.h:5` | `include/constants/species.ts:9` · `src/mail_data.ts:79` |
| `SPECIES_DEOXYS` | define | `include/constants/species.h:416` | `include/constants/species.ts:418` · `src/pokemon_icon.ts:23` |
| `SPECIES_EGG` | define | `include/constants/species.h:418` | `include/constants/species.ts:420` · `src/battle_controllers.ts:93` · `src/battle_main.ts:4165` · `src/battle_setup.ts:1486` |
| `SPECIES_GROUDON` | define | `include/constants/species.h:411` | `harness/runtime/decomp-globals.ts:1128` · `include/constants/species.ts:413` · `src/intro.ts:194` |
| `SPECIES_KYOGRE` | define | `include/constants/species.h:410` | `harness/runtime/decomp-globals.ts:1129` · `include/constants/species.ts:412` · `src/intro.ts:195` |
| `SPECIES_LOTAD` | define | `include/constants/species.h:301` | `include/constants/species.ts:303` · `src/main_menu.ts:1248` |
| `SPECIES_NONE` | define | `include/constants/species.h:4` | `include/constants/species.ts:8` · `src/battle_controllers.ts:92` · `src/battle_main.ts:4162` · `src/battle_setup.ts:1485` · `src/mail_data.ts:78` · `src/pokemon_storage_system.ts:1334` |
| `SPECIES_UNOWN` | define | `include/constants/species.h:205` | `include/constants/species.ts:209` · `src/mail_data.ts:80` |
| `SPRITES_INIT_STATE1` | define | `include/constants/battle_script_commands.h:290` | `include/constants/battle_script_commands.ts:65` · `src/battle_main.ts:4141` |
| `SPRITES_INIT_STATE2` | define | `include/constants/battle_script_commands.h:291` | `include/constants/battle_script_commands.ts:66` · `src/battle_main.ts:5961` |
| `SPRITE_NONE` | define | `include/sprite.h:6` | `include/sprite.ts:10` · `src/item_menu.ts:179` · `src/item_menu_icons.ts:37` · `src/main_menu.ts:1249` · `src/player_pc.ts:255` |
| `SS_TIDAL_LOCATION_CURRENTS` | define | `include/constants/field_specials.h:10` | `include/constants/field_specials.ts:11` · `src/region_map.ts:1325` |
| `SS_TIDAL_LOCATION_LILYCOVE` | define | `include/constants/field_specials.h:12` | `include/constants/field_specials.ts:13` · `src/region_map.ts:1327` |
| `SS_TIDAL_LOCATION_ROUTE124` | define | `include/constants/field_specials.h:13` | `include/constants/field_specials.ts:14` · `src/region_map.ts:1328` |
| `SS_TIDAL_LOCATION_ROUTE131` | define | `include/constants/field_specials.h:14` | `include/constants/field_specials.ts:15` · `src/region_map.ts:1329` |
| `SS_TIDAL_LOCATION_SLATEPORT` | define | `include/constants/field_specials.h:11` | `include/constants/field_specials.ts:12` · `src/region_map.ts:1326` |
| `START_BUTTON` | define | `include/gba/io_reg.h:702` | `include/gba/io_reg.ts:960` · `src/battle_controllers.ts:1447` · `src/easy_chat.ts:530` · `src/title_screen.ts:85` |
| `STAT_ANIM_MINUS1` | define | `include/battle_anim.h:197` | `include/battle_anim.ts:11` · `src/battle_script_commands.ts:2439` |
| `STAT_ANIM_MINUS2` | define | `include/battle_anim.h:198` | `include/battle_anim.ts:12` · `src/battle_script_commands.ts:2440` |
| `STAT_ANIM_MULTIPLE_MINUS1` | define | `include/battle_anim.h:201` | `include/battle_anim.ts:15` · `src/battle_script_commands.ts:2443` |
| `STAT_ANIM_MULTIPLE_MINUS2` | define | `include/battle_anim.h:202` | `include/battle_anim.ts:16` · `src/battle_script_commands.ts:2444` |
| `STAT_ANIM_MULTIPLE_PLUS1` | define | `include/battle_anim.h:199` | `include/battle_anim.ts:13` · `src/battle_script_commands.ts:2441` |
| `STAT_ANIM_MULTIPLE_PLUS2` | define | `include/battle_anim.h:200` | `include/battle_anim.ts:14` · `src/battle_script_commands.ts:2442` |
| `STAT_ANIM_PLUS1` | define | `include/battle_anim.h:195` | `include/battle_anim.ts:9` · `src/battle_script_commands.ts:2437` |
| `STAT_ANIM_PLUS2` | define | `include/battle_anim.h:196` | `include/battle_anim.ts:10` · `src/battle_script_commands.ts:2438` |
| `STAT_ATK` | define | `include/constants/pokemon.h:76` | `include/constants/pokemon.ts:72` · `src/menu_specialized.ts:85` |
| `STAT_DEF` | define | `include/constants/pokemon.h:77` | `include/constants/pokemon.ts:73` · `src/menu_specialized.ts:86` |
| `STAT_HP` | define | `include/constants/pokemon.h:75` | `include/constants/pokemon.ts:71` · `src/menu_specialized.ts:84` |
| `STAT_SPATK` | define | `include/constants/pokemon.h:79` | `include/constants/pokemon.ts:75` · `src/menu_specialized.ts:88` |
| `STAT_SPDEF` | define | `include/constants/pokemon.h:80` | `include/constants/pokemon.ts:76` · `src/menu_specialized.ts:89` |
| `STAT_SPEED` | define | `include/constants/pokemon.h:78` | `include/constants/pokemon.ts:74` · `src/menu_specialized.ts:87` |
| `STD_WINDOW_BASE_TILE_NUM` | define | `src/menu.c:27` | `src/field_message_box.ts:45` · `src/menu.ts:211` · `src/player_pc.ts:96` · `src/start_menu.ts:160` |
| `STD_WINDOW_PALETTE_NUM` | define | `src/menu.c:25` | `src/field_message_box.ts:46` · `src/menu.ts:208` · `src/player_pc.ts:95` · `src/start_menu.ts:159` |
| `STRINGID_INTROMSG` | define | `include/constants/battle_string_ids.h:4` | `include/constants/battle_string_ids.ts:8` · `src/battle_main.ts:4148` |
| `STRINGID_INTROSENDOUT` | define | `include/constants/battle_string_ids.h:5` | `include/constants/battle_string_ids.ts:9` · `src/battle_main.ts:4151` |
| `STRINGID_STATFELL` | define | `include/constants/battle_string_ids.h:212` | `include/constants/battle_string_ids.ts:214` · `src/battle_script_commands.ts:12880` |
| `STRINGID_STATHARSHLY` | define | `include/constants/battle_string_ids.h:211` | `include/constants/battle_string_ids.ts:213` · `src/battle_script_commands.ts:12879` |
| `STRINGID_STATROSE` | define | `include/constants/battle_string_ids.h:210` | `include/constants/battle_string_ids.ts:212` · `src/battle_script_commands.ts:12878` · `src/battle_util.ts:2216` |
| `STRINGID_STATSHARPLY` | define | `include/constants/battle_string_ids.h:209` | `include/constants/battle_string_ids.ts:211` · `src/battle_script_commands.ts:12877` · `src/battle_util.ts:2215` |
| `STR_CONV_MODE_LEADING_ZEROS` | enum_member | `include/string_util.h:13` | `include/string_util.ts:15` · `src/battle_message.ts:238` |
| `STR_CONV_MODE_LEFT_ALIGN` | enum_member | `include/string_util.h:11` | `include/string_util.ts:13` · `src/battle_message.ts:236` |
| `STR_CONV_MODE_RIGHT_ALIGN` | enum_member | `include/string_util.h:12` | `include/string_util.ts:14` · `src/battle_message.ts:237` |
| `ST_OAM_AFFINE_DOUBLE` | define | `include/gba/types.h:85` | `include/sprite.ts:18` · `src/event_object_movement.ts:5607` |
| `ST_OAM_AFFINE_NORMAL` | define | `include/gba/types.h:83` | `include/sprite.ts:16` · `src/event_object_movement.ts:5606` · `src/pokedex.ts:961` |
| `ST_OAM_AFFINE_OFF` | define | `include/gba/types.h:82` | `include/sprite.ts:15` · `src/decoration.ts:1095` · `src/event_object_movement.ts:5605` |
| `ScriptContext` | struct | `include/script.h:9` | `src/battle_setup.ts:100` · `src/script.ts:47` |
| `SpriteCallback` | typedef | `include/sprite.h:177` | `src/intro.ts:210` · `src/intro_credits_graphics.ts:75` · `src/main_menu.ts:1264` · `src/title_screen.ts:87` |
| `SpriteFrameImage` | struct | `include/sprite.h:26` | `include/sprite.ts:105` · `src/sprite.ts:1109` |
| `Subsprite` | struct | `include/sprite.h:159` | `src/data/object_events/object_event_subsprites.ts:23` · `src/list_menu.ts:899` |
| `SubspriteTable` | struct | `include/sprite.h:169` | `src/data/object_events/object_event_subsprites.ts:33` · `src/list_menu.ts:909` |
| `TAG_CONDITION_BALL` | enum_member | `include/menu_specialized.h:29` | `src/menu_specialized.ts:241` · `src/pokenav_conditions_gfx.ts:174` |
| `TAG_CONDITION_BALL_PLACEHOLDER` | enum_member | `include/menu_specialized.h:31` | `src/menu_specialized.ts:243` · `src/pokenav_conditions_gfx.ts:178` |
| `TAG_CONDITION_CANCEL` | enum_member | `include/menu_specialized.h:30` | `src/menu_specialized.ts:242` · `src/pokenav_conditions_gfx.ts:175` |
| `TAG_CONDITION_MARKINGS_MENU` | enum_member | `include/menu_specialized.h:34` | `src/menu_specialized.ts:246` · `src/pokenav_conditions_gfx.ts:176` |
| `TAG_CONDITION_MON` | enum_member | `include/menu_specialized.h:28` | `src/menu_specialized.ts:240` · `src/pokenav_conditions_gfx.ts:179` |
| `TAG_CONDITION_MON_MARKINGS` | enum_member | `include/menu_specialized.h:33` | `src/menu_specialized.ts:245` · `src/pokenav_conditions_gfx.ts:177` |
| `TAG_ITEM_ICON` | define, enum_member | `src/battle_pyramid_bag.c:38` · `src/field_specials.c:69` · `src/player_pc.c:82` · `src/item_menu_icons.c:17` | `src/item_menu_icons.ts:47` · `src/player_pc.ts:228` · `src/shop.ts:154` |
| `TAG_NONE` | define | `include/sprite.h:7` | `include/sprite.ts:11` · `src/credits.ts:1621` · `src/list_menu.ts:1043` · `src/sprite.ts:82` |
| `TASK_NONE` | define | `include/task.h:6` | `include/task.ts:9` · `src/item_menu.ts:181` · `src/list_menu.ts:411` · `src/scanline_effect.ts:35` |
| `TEXT_SKIP_DRAW` | define | `include/text.h:8` | `include/text.ts:40` · `src/main_menu.ts:1250` · `src/menu_specialized.ts:80` · `src/text.ts:298` |
| `TILE_SIZE_4BPP` | define | `include/gba/defines.h:81` | `src/field_door.ts:166` · `src/mon_markings.ts:23` · `src/pokemon_storage_system.ts:112` · `src/sprite.ts:86` · `src/tileset_anims.ts:73` |
| `TMHM_POCKET` | define | `include/constants/item.h:14` | `include/constants/item.ts:16` · `src/engine/bag/bag-types.ts:40` |
| `TOTAL_OBJ_TILE_COUNT` | define | `include/gba/defines.h:87` | `include/gba/defines.ts:72` · `src/sprite.ts:85` |
| `TRACKS_BIKE_TIRE` | define | `include/constants/event_objects.h:290` | `include/constants/event_object_movement.ts:367` · `include/constants/event_objects.ts:292` · `src/event_object_movement.ts:3281` |
| `TRACKS_FOOT` | define | `include/constants/event_objects.h:289` | `include/constants/event_object_movement.ts:366` · `include/constants/event_objects.ts:291` · `src/event_object_movement.ts:3280` |
| `TRACKS_NONE` | define | `include/constants/event_objects.h:288` | `include/constants/event_object_movement.ts:365` · `include/constants/event_objects.ts:290` · `src/event_object_movement.ts:3279` |
| `TRAINER_BATTLE_CONTINUE_SCRIPT_DOUBLE` | define | `include/constants/battle_setup.h:10` | `src/battle_setup.ts:72` · `src/trainer_see.ts:270` |
| `TRAINER_BATTLE_DOUBLE` | define | `include/constants/battle_setup.h:8` | `src/battle_setup.ts:70` · `src/trainer_see.ts:268` |
| `TRAINER_BATTLE_REMATCH_DOUBLE` | define | `include/constants/battle_setup.h:11` | `src/battle_setup.ts:73` · `src/trainer_see.ts:269` |
| `TRAINER_FLAGS_START` | define | `include/constants/flags.h:1343` | `include/constants/flags.ts:1211` · `src/battle_setup.ts:81` |
| `TRAINER_HILL_ENTRANCE` | define | `include/constants/trainer_hill.h:9` | `src/overworld.ts:1501` · `src/trainer_hill.ts:26` |
| `TRAINER_ID_LENGTH` | define | `include/constants/global.h:81` | `include/constants/global.ts:71` · `src/engine/save/save-blocks.ts:37` |
| `TRAINER_LINK_OPPONENT` | define | `include/constants/trainers.h:15` | `include/constants/trainers.ts:15` · `src/battle_message.ts:614` |
| `TRAINER_STEVEN_PARTNER` | define | `include/constants/trainers.h:17` | `include/constants/trainers.ts:17` · `src/battle_intro.ts:85` · `src/battle_main.ts:790` |
| `TRAINER_UNION_ROOM` | define | `include/constants/trainers.h:16` | `include/constants/trainers.ts:16` · `src/battle_main.ts:5963` · `src/battle_message.ts:612` |
| `TYPE_NONE` | define | `include/constants/pokemon.h:5` | `include/constants/pokemon.ts:8` · `src/pokedex.ts:2613` |
| `T_NOT_MOVING` | enum_member | `include/global.fieldmap.h:337` | `src/field_control_avatar.ts:196` · `src/field_player_avatar.ts:262` |
| `T_TILE_CENTER` | enum_member | `include/global.fieldmap.h:339` | `src/field_control_avatar.ts:198` · `src/field_player_avatar.ts:264` |
| `T_TILE_TRANSITION` | enum_member | `include/global.fieldmap.h:338` | `src/field_control_avatar.ts:197` · `src/field_player_avatar.ts:263` |
| `UNION_ROOM_KB_ROW_COUNT` | define | `include/constants/global.h:63` | `include/constants/global.ts:60` · `src/engine/save/save-blocks.ts:73` |
| `VARIOUS_ARENA_BOTH_MONS_LOST` | define | `include/constants/battle_script_commands.h:346` | `include/constants/battle_script_commands.ts:115` · `src/battle_script_commands.ts:11558` |
| `VARIOUS_ARENA_JUDGMENT_STRING` | define | `include/constants/battle_script_commands.h:350` | `include/constants/battle_script_commands.ts:119` · `src/battle_script_commands.ts:11562` |
| `VARIOUS_ARENA_JUDGMENT_WINDOW` | define | `include/constants/battle_script_commands.h:343` | `include/constants/battle_script_commands.ts:112` · `src/battle_script_commands.ts:11555` |
| `VARIOUS_ARENA_OPPONENT_MON_LOST` | define | `include/constants/battle_script_commands.h:344` | `include/constants/battle_script_commands.ts:113` · `src/battle_script_commands.ts:11556` |
| `VARIOUS_ARENA_PLAYER_MON_LOST` | define | `include/constants/battle_script_commands.h:345` | `include/constants/battle_script_commands.ts:114` · `src/battle_script_commands.ts:11557` |
| `VARIOUS_ARENA_WAIT_STRING` | define | `include/constants/battle_script_commands.h:351` | `include/constants/battle_script_commands.ts:120` · `src/battle_script_commands.ts:11563` |
| `VARIOUS_CANCEL_MULTI_TURN_MOVES` | define | `include/constants/battle_script_commands.h:334` | `include/constants/battle_script_commands.ts:103` · `src/battle_script_commands.ts:11546` |
| `VARIOUS_DRAW_ARENA_REF_TEXT_BOX` | define | `include/constants/battle_script_commands.h:348` | `include/constants/battle_script_commands.ts:117` · `src/battle_script_commands.ts:11560` |
| `VARIOUS_EMIT_YESNOBOX` | define | `include/constants/battle_script_commands.h:347` | `include/constants/battle_script_commands.ts:116` · `src/battle_script_commands.ts:11559` |
| `VARIOUS_ERASE_ARENA_REF_TEXT_BOX` | define | `include/constants/battle_script_commands.h:349` | `include/constants/battle_script_commands.ts:118` · `src/battle_script_commands.ts:11561` |
| `VARIOUS_GET_BATTLER_FAINTED` | define | `include/constants/battle_script_commands.h:338` | `include/constants/battle_script_commands.ts:107` · `src/battle_script_commands.ts:11550` |
| `VARIOUS_GET_MOVE_TARGET` | define | `include/constants/battle_script_commands.h:337` | `include/constants/battle_script_commands.ts:106` · `src/battle_script_commands.ts:11549` |
| `VARIOUS_IS_RUNNING_IMPOSSIBLE` | define | `include/constants/battle_script_commands.h:336` | `include/constants/battle_script_commands.ts:105` · `src/battle_script_commands.ts:11548` |
| `VARIOUS_PALACE_FLAVOR_TEXT` | define | `include/constants/battle_script_commands.h:342` | `include/constants/battle_script_commands.ts:111` · `src/battle_script_commands.ts:11554` |
| `VARIOUS_PALACE_TRY_ESCAPE_STATUS` | define | `include/constants/battle_script_commands.h:358` | `include/constants/battle_script_commands.ts:127` · `src/battle_script_commands.ts:11570` |
| `VARIOUS_PLAY_TRAINER_DEFEATED_MUSIC` | define | `include/constants/battle_script_commands.h:360` | `include/constants/battle_script_commands.ts:129` · `src/battle_script_commands.ts:11572` |
| `VARIOUS_RESET_INTIMIDATE_TRACE_BITS` | define | `include/constants/battle_script_commands.h:339` | `include/constants/battle_script_commands.ts:108` · `src/battle_script_commands.ts:11551` |
| `VARIOUS_RESET_PLAYER_FAINTED` | define | `include/constants/battle_script_commands.h:341` | `include/constants/battle_script_commands.ts:110` · `src/battle_script_commands.ts:11553` |
| `VARIOUS_RETURN_OPPONENT_MON1` | define | `include/constants/battle_script_commands.h:353` | `include/constants/battle_script_commands.ts:122` · `src/battle_script_commands.ts:11565` |
| `VARIOUS_RETURN_OPPONENT_MON2` | define | `include/constants/battle_script_commands.h:354` | `include/constants/battle_script_commands.ts:123` · `src/battle_script_commands.ts:11566` |
| `VARIOUS_SET_ALREADY_STATUS_MOVE_ATTEMPT` | define | `include/constants/battle_script_commands.h:357` | `include/constants/battle_script_commands.ts:126` · `src/battle_script_commands.ts:11569` |
| `VARIOUS_SET_MAGIC_COAT_TARGET` | define | `include/constants/battle_script_commands.h:335` | `include/constants/battle_script_commands.ts:104` · `src/battle_script_commands.ts:11547` |
| `VARIOUS_SET_TELEPORT_OUTCOME` | define | `include/constants/battle_script_commands.h:359` | `include/constants/battle_script_commands.ts:128` · `src/battle_script_commands.ts:11571` |
| `VARIOUS_UPDATE_CHOICE_MOVE_ON_LVL_UP` | define | `include/constants/battle_script_commands.h:340` | `include/constants/battle_script_commands.ts:109` · `src/battle_script_commands.ts:11552` |
| `VARIOUS_VOLUME_DOWN` | define | `include/constants/battle_script_commands.h:355` | `include/constants/battle_script_commands.ts:124` · `src/battle_script_commands.ts:11567` |
| `VARIOUS_VOLUME_UP` | define | `include/constants/battle_script_commands.h:356` | `include/constants/battle_script_commands.ts:125` · `src/battle_script_commands.ts:11568` |
| `VARIOUS_WAIT_CRY` | define | `include/constants/battle_script_commands.h:352` | `include/constants/battle_script_commands.ts:121` · `src/battle_script_commands.ts:11564` |
| `VARS_COUNT` | define | `include/constants/vars.h:278` | `include/constants/vars.ts:265` · `src/engine/save/save-blocks.ts:52` |
| `VARS_START` | define | `include/constants/vars.h:4` | `include/constants/vars.ts:4` · `src/event_data.ts:39` |
| `VAR_0x8004` | define | `include/constants/vars.h:287` | `include/constants/vars.ts:271` · `src/battle_tower.ts:46` |
| `VAR_BIRCH_STATE` | define | `include/constants/vars.h:93` | `include/constants/vars.ts:81` · `src/time_events.ts:113` |
| `VAR_MIRAGE_RND_H` | define | `include/constants/vars.h:54` | `include/constants/vars.ts:44` · `src/time_events.ts:36` |
| `VAR_MIRAGE_RND_L` | define | `include/constants/vars.h:55` | `include/constants/vars.ts:45` · `src/time_events.ts:37` |
| `VAR_POKELOT_RND1` | define | `include/constants/vars.h:95` | `include/constants/vars.ts:83` · `src/lottery_corner.ts:37` |
| `VAR_POKELOT_RND2` | define | `include/constants/vars.h:96` | `include/constants/vars.ts:84` · `src/lottery_corner.ts:38` |
| `VERSION_EMERALD` | define | `include/constants/global.h:10` | `include/constants/global.ts:10` · `src/battle_main.ts:5965` |
| `VERSION_RUBY` | define | `include/constants/global.h:9` | `include/constants/global.ts:9` · `src/battle_intro.ts:86` |
| `WARP_ID_NONE` | define | `include/constants/maps.h:28` | `src/battle_factory.ts:51` · `src/battle_palace.ts:24` · `src/battle_tent.ts:23` · `src/decoration.ts:1091` · `src/region_map.ts:1874` · `src/secret_base.ts:285` |
| `WEATHER_ABNORMAL` | define | `include/constants/weather.h:19` | `include/constants/weather.ts:23` · `src/field_weather_effect.ts:83` |
| `WEATHER_DOWNPOUR` | define | `include/constants/weather.h:17` | `include/constants/weather.ts:21` · `src/field_weather.ts:72` · `src/field_weather_effect.ts:81` |
| `WEATHER_DROUGHT` | define | `include/constants/weather.h:16` | `include/constants/weather.ts:20` · `src/field_weather.ts:71` · `src/field_weather_effect.ts:80` |
| `WEATHER_FOG_DIAGONAL` | define | `include/constants/weather.h:13` | `include/constants/weather.ts:17` · `src/field_weather.ts:68` · `src/field_weather_effect.ts:77` |
| `WEATHER_FOG_HORIZONTAL` | define | `include/constants/weather.h:10` | `include/constants/weather.ts:14` · `src/field_weather.ts:65` · `src/field_weather_effect.ts:74` |
| `WEATHER_NONE` | define | `include/constants/weather.h:4` | `include/constants/weather.ts:8` · `src/field_weather.ts:59` · `src/field_weather_effect.ts:68` |
| `WEATHER_RAIN` | define | `include/constants/weather.h:7` | `include/constants/weather.ts:11` · `src/field_weather.ts:62` · `src/field_weather_effect.ts:71` |
| `WEATHER_RAIN_THUNDERSTORM` | define | `include/constants/weather.h:9` | `include/constants/weather.ts:13` · `src/field_weather.ts:64` · `src/field_weather_effect.ts:73` |
| `WEATHER_ROUTE119_CYCLE` | define | `include/constants/weather.h:20` | `include/constants/weather.ts:24` · `src/field_weather_effect.ts:84` |
| `WEATHER_ROUTE123_CYCLE` | define | `include/constants/weather.h:21` | `include/constants/weather.ts:25` · `src/field_weather_effect.ts:85` |
| `WEATHER_SANDSTORM` | define | `include/constants/weather.h:12` | `include/constants/weather.ts:16` · `src/field_weather.ts:67` · `src/field_weather_effect.ts:76` |
| `WEATHER_SHADE` | define | `include/constants/weather.h:15` | `include/constants/weather.ts:19` · `src/field_weather.ts:70` · `src/field_weather_effect.ts:79` |
| `WEATHER_SNOW` | define | `include/constants/weather.h:8` | `include/constants/weather.ts:12` · `src/field_weather.ts:63` · `src/field_weather_effect.ts:72` |
| `WEATHER_SUNNY` | define | `include/constants/weather.h:6` | `include/constants/weather.ts:10` · `src/field_weather.ts:61` · `src/field_weather_effect.ts:70` |
| `WEATHER_SUNNY_CLOUDS` | define | `include/constants/weather.h:5` | `include/constants/weather.ts:9` · `src/field_weather.ts:60` · `src/field_weather_effect.ts:69` |
| `WEATHER_UNDERWATER` | define | `include/constants/weather.h:14` | `include/constants/weather.ts:18` · `src/field_weather.ts:69` · `src/field_weather_effect.ts:78` |
| `WEATHER_UNDERWATER_BUBBLES` | define | `include/constants/weather.h:18` | `include/constants/weather.ts:22` · `src/field_weather.ts:73` · `src/field_weather_effect.ts:82` |
| `WEATHER_VOLCANIC_ASH` | define | `include/constants/weather.h:11` | `include/constants/weather.ts:15` · `src/field_weather.ts:66` · `src/field_weather_effect.ts:75` |
| `WINDOW_NONE` | define | `include/window.h:43` | `src/item_menu.ts:180` · `src/match_call.ts:94` · `src/menu.ts:219` · `src/player_pc.ts:253` · `src/pokemon_summary_screen.ts:132` · `src/pokenav_list.ts:65` |
| `WININ_WIN0_ALL` | define | `include/gba/io_reg.h:557` | `src/battle_intro.ts:50` · `src/battle_transition.ts:328` · `src/fldeff_misc.ts:121` · `src/intro.ts:208` · `src/pokenav_menu_handler_gfx.ts:95` |
| `WININ_WIN0_BG0` | define | `include/gba/io_reg.h:550` | `src/easy_chat.ts:305` · `src/main_menu.ts:1251` · `src/option_menu.ts:542` |
| `WININ_WIN0_BG_ALL` | define | `include/gba/io_reg.h:554` | `harness/runtime/decomp-globals.ts:1595` · `src/battle_intro.ts:47` · `src/easy_chat.ts:309` · `src/field_screen_effect.ts:92` |
| `WININ_WIN0_CLR` | define | `include/gba/io_reg.h:556` | `src/easy_chat.ts:311` · `src/field_screen_effect.ts:94` |
| `WININ_WIN0_OBJ` | define | `include/gba/io_reg.h:555` | `harness/runtime/decomp-globals.ts:1596` · `src/easy_chat.ts:310` · `src/field_screen_effect.ts:93` |
| `WINOUT_WIN01_BG0` | define | `include/gba/io_reg.h:567` | `harness/runtime/decomp-globals.ts:1600` · `src/easy_chat.ts:312` · `src/main_menu.ts:1252` |
| `WINOUT_WIN01_BG1` | define | `include/gba/io_reg.h:568` | `src/easy_chat.ts:313` · `src/field_screen_effect.ts:95` · `src/option_menu.ts:543` |
| `WINOUT_WIN01_BG3` | define | `include/gba/io_reg.h:570` | `src/easy_chat.ts:314` · `src/field_screen_effect.ts:97` |
| `WINOUT_WIN01_OBJ` | define | `include/gba/io_reg.h:572` | `harness/runtime/decomp-globals.ts:1601` · `src/battle_intro.ts:53` · `src/easy_chat.ts:315` · `src/field_screen_effect.ts:98` |
| `WIN_ITEM_LIST` | enum_member | `src/item_menu.c:95` · `src/shop.c:55` | `src/item_menu.ts:156` · `src/shop.ts:168` |
| `WIN_MESSAGE` | enum_member | `src/item_menu.c:100` · `src/pokemon_storage_system.c:338` · `src/shop.c:59` | `src/item_menu.ts:161` · `src/shop.ts:180` |
| `WIN_MSG` | enum_member | `src/battle_pyramid_bag.c:46` · `src/berry_blender.c:112` · `src/easy_chat.c:387` · `src/mystery_event_menu.c:24` · `…` | `src/easy_chat.ts:274` · `src/wallclock.ts:83` |
| `WIN_RANGE` | func_macro | `include/gba/io_reg.h:584` | `harness/runtime/decomp-bridge.ts:83` · `harness/runtime/decomp-helpers.ts:223` · `src/battle_main.ts:804` · `src/battle_transition.ts:1200` · `src/field_effect_helpers.ts:1500` · `src/fldeff_misc.ts:124` |
| `WIN_TITLE` | enum_member | `src/berry_fix_program.c:18` · `src/easy_chat.c:386` · `src/field_region_map.c:28` · `src/pokeblock.c:49` · `…` | `src/easy_chat.ts:273` · `src/pokenav.ts:105` |
| `WONDER_CARD_BODY_TEXT_LINES` | define | `include/constants/global.h:105` | `include/constants/global.ts:94` · `src/engine/save/save-blocks.ts:90` |
| `WONDER_CARD_TEXT_LENGTH` | define | `include/constants/global.h:103` | `include/constants/global.ts:92` · `src/engine/save/save-blocks.ts:88` |
| `WONDER_NEWS_BODY_TEXT_LINES` | define | `include/constants/global.h:106` | `include/constants/global.ts:95` · `src/engine/save/save-blocks.ts:91` |
| `WONDER_NEWS_TEXT_LENGTH` | define | `include/constants/global.h:104` | `include/constants/global.ts:93` · `src/engine/save/save-blocks.ts:89` |
| `WarpData` | struct | `include/global.h:587` | `src/engine/save/save-blocks.ts:114` · `src/overworld.ts:789` |
| `_RGB` | func_macro | `include/constants/rgb.h:10` | `harness/runtime/decomp-helpers.ts:193` · `src/battle_anim_effects_1b.ts:147` · `src/battle_anim_throw.ts:2093` |
| `tState` | define | `src/battle_anim.c:1111` · `src/battle_anim_effects_3.c:3722` · `src/battle_anim_effects_3.c:3970` · `src/battle_anim_fire.c:776` · `…` | `src/decoration.ts:143` · `src/easy_chat.ts:580` |

## 2. MIROIR + HARNESS — 1 déclaration miroir + 1+ harness (adaptation moteur) — 143

Le harness héberge une adaptation du même symbole : à vérifier que le miroir délègue bien (pas deux vérités).

### Fonctions / globals / labels (51) — l'or de la dédup

| symbole | kind décomp | décomp | déclarations TS |
|---|---|---|---|
| `CB2_InitCopyrightScreenAfterBootup` | function | `src/intro.c:1147` | `harness/boot/copyright-boot.ts:133` · `src/intro.ts:2162` |
| `CB2_InitCopyrightScreenAfterTitleScreen` | function | `src/intro.c:1162` | `harness/boot/copyright-boot.ts:148` · `src/intro.ts:2177` |
| `CalcCenterToCornerVec` | function | `src/sprite.c:687` | `harness/runtime/decomp-helpers.ts:100` · `src/sprite.ts:1029` |
| `CanResetRTC` | function | `src/event_data.c:156` | `harness/runtime/decomp-globals.ts:2383` · `src/event_data.ts:210` |
| `Cos` | function | `src/trig.c:521` | `harness/runtime/decomp-helpers.ts:27` · `src/trig.ts:78` |
| `CreateBicycleBgAnimationTask` | function | `src/intro_credits_graphics.c:924` | `harness/runtime/decomp-globals.ts:753` · `src/intro_credits_graphics.ts:224` |
| `CreateIntroBrendanSprite` | function | `src/intro_credits_graphics.c:1118` | `harness/runtime/decomp-globals.ts:677` · `src/intro_credits_graphics.ts:300` |
| `CreateIntroFlygonSprite` | function | `src/intro_credits_graphics.c:1162` | `harness/runtime/decomp-globals.ts:726` · `src/intro_credits_graphics.ts:322` |
| `CreateIntroMaySprite` | function | `src/intro_credits_graphics.c:1126` | `harness/runtime/decomp-globals.ts:702` · `src/intro_credits_graphics.ts:311` |
| `DoMonFrontSpriteAnimation` | function | `src/pokemon.c:6779` | `harness/runtime/decomp-globals.ts:2484` · `src/pokemon_animation.ts:2140` |
| `FadeInBGM` | function | `src/sound.c:285` | `harness/runtime/decomp-globals.ts:2374` · `src/sound.ts:330` |
| `FadeOutBGM` | function | `src/sound.c:290` | `harness/runtime/decomp-globals.ts:2368` · `src/sound.ts:335` |
| `FreeMonSpritesGfx` | function | `src/battle_gfx_sfx_util.c:1316` | `harness/runtime/decomp-globals.ts:1222` · `src/battle_gfx_sfx_util.ts:122` |
| `FuncIsActiveTask` | function | `src/task.c:155` | `harness/runtime/decomp-globals.ts:1915` · `src/battle_anim_throw.ts:1463` |
| `GetSpriteTileStartByTag` | function | `src/sprite.c:1542` | `harness/runtime/decomp-globals.ts:1862` · `src/sprite.ts:784` |
| `HasTwoFramesAnimation` | function | `src/pokemon.c:6959` | `harness/runtime/decomp-globals.ts:2481` · `src/pokemon_animation.ts:1975` |
| `IndexOfSpritePaletteTag` | function | `src/sprite.c:1637` | `harness/runtime/decomp-globals.ts:1855` · `src/sprite.ts:306` |
| `IsCryFinished` | function | `src/sound.c:497` | `harness/runtime/decomp-globals.ts:1098` · `src/sound.ts:520` |
| `IsCryPlaying` | function | `src/sound.c:534` | `harness/runtime/decomp-globals.ts:1092` · `src/sound.ts:552` |
| `IsFanfareTaskInactive` | function | `src/sound.c:232` | `harness/runtime/decomp-globals.ts:1104` · `src/sound.ts:282` |
| `LaunchAnimationTaskForFrontSprite` | function | `src/pokemon_animation.c:941` | `harness/runtime/decomp-globals.ts:2480` · `src/pokemon_animation.ts:2119` |
| `LoadSpritePalette` | function | `src/sprite.c:1589` | `harness/runtime/decomp-globals.ts:1481` · `src/sprite.ts:433` |
| `LoadSpritePalettes` | function | `src/sprite.c:1610` | `harness/runtime/decomp-globals.ts:1827` · `src/sprite.ts:477` |
| `PlayCryInternal` | function | `src/sound.c:369` | `harness/runtime/decomp-globals.ts:1052` · `src/sound.ts:404` |
| `PlayFanfare` | function | `src/sound.c:213` | `harness/runtime/decomp-globals.ts:979` · `src/sound.ts:266` |
| `PlayFanfareByFanfareNum` | function | `src/sound.c:180` | `harness/runtime/decomp-globals.ts:985` · `src/sound.ts:238` |
| `SetOamMatrix` | function | `src/sprite.c:674` | `harness/runtime/decomp-helpers.ts:52` · `src/sprite.ts:636` |
| `SetUpCopyrightScreen` | function | `src/intro.c:1072` | `harness/boot/copyright-boot.ts:61` · `src/intro.ts:161` |
| `SetVBlankCallback` | function | `src/main.c:307` | `harness/runtime/decomp-bridge.ts:354` · `src/main.ts:27` |
| `Sin` | function | `src/trig.c:515` | `harness/runtime/decomp-helpers.ts:26` · `src/trig.ts:73` |
| `TaskDummy` | function | `src/task.c:135` | `harness/runtime/decomp-runtime.ts:589` · `src/pokeball.ts:256` |
| `UpdatePaletteFade` | function | `src/palette.c:116` | `harness/runtime/decomp-globals.ts:1490` · `src/palette.ts:318` |
| `WaitFanfare` | function | `src/sound.c:189` | `harness/runtime/decomp-globals.ts:991` · `src/sound.ts:246` |
| `gIntroCredits_MovingSceneryState` | global | `include/intro_credits_graphics.h:22` · `src/intro_credits_graphics.c:722` | `harness/runtime/decomp-globals.ts:239` · `src/intro.ts:170` |
| `gIntroCredits_MovingSceneryVBase` | global | `include/intro_credits_graphics.h:20` · `src/intro_credits_graphics.c:720` | `harness/runtime/decomp-globals.ts:235` · `src/intro.ts:168` |
| `gIntroCredits_MovingSceneryVOffset` | global | `include/intro_credits_graphics.h:21` · `src/intro_credits_graphics.c:721` | `harness/runtime/decomp-globals.ts:237` · `src/intro.ts:169` |
| `gMPlayInfo_BGM` | global | `include/m4a.h:21` · `src/m4a.c:13` | `harness/runtime/decomp-globals.ts:2396` · `src/m4a.ts:167` |
| `gSineTable` | global | `include/trig.h:4` · `src/trig.c:5` | `harness/runtime/decomp-helpers.ts:34` · `src/trig.ts:27` |
| `m4aMPlayAllStop` | function | `src/m4a.c:175` | `harness/runtime/decomp-globals.ts:910` · `src/m4a.ts:673` |
| `m4aSongNumStart` | function | `src/m4a.c:107` | `harness/runtime/decomp-globals.ts:892` · `src/m4a.ts:627` |
| `sAnim_Bicycle` | global | `src/intro_credits_graphics.c:495` | `harness/runtime/decomp-globals.ts:665` · `src/intro_credits_graphics.ts:153` |
| `sAnim_FlygonLeft` | global | `src/intro_credits_graphics.c:539` | `harness/runtime/decomp-globals.ts:670` · `src/intro_credits_graphics.ts:154` |
| `sAnim_FlygonRight` | global | `src/intro_credits_graphics.c:545` | `harness/runtime/decomp-globals.ts:671` · `src/intro_credits_graphics.ts:155` |
| `sAnims_Bicycle` | global | `src/intro_credits_graphics.c:504` | `harness/runtime/decomp-globals.ts:666` · `src/intro_credits_graphics.ts:159` |
| `sAnims_Flygon` | global | `src/intro_credits_graphics.c:551` | `harness/runtime/decomp-globals.ts:672` · `src/intro_credits_graphics.ts:161` |
| `sFlygonYOffset` | global | `src/intro.c:179` | `harness/runtime/decomp-globals.ts:231` · `src/intro.ts:167` |
| `sIntroCharacterGender` | global | `src/intro.c:177` | `harness/runtime/decomp-globals.ts:227` · `src/intro.ts:166` |
| `sOamData_Bicycle` | global | `src/intro_credits_graphics.c:487` | `harness/runtime/decomp-globals.ts:664` · `src/intro_credits_graphics.ts:145` |
| `sOamData_Flygon` | global | `src/intro_credits_graphics.c:531` | `harness/runtime/decomp-globals.ts:669` · `src/intro_credits_graphics.ts:147` |
| `sOamData_Player` | global | `src/intro_credits_graphics.c:443` | `harness/runtime/decomp-globals.ts:659` · `src/intro_credits_graphics.ts:143` |
| `sRoute119WaterTileData` | global | `src/wild_encounter.c:69` | `harness/devtools/dev-encounter-tools.ts:107` · `src/wild_encounter.ts:83` |

### Constantes (defines / enums / types) (92)

Constantes redéclarées localement au lieu d'être importées du miroir de header —
dédup moins urgente mais source de désynchronisation de valeurs.

| symbole | kind décomp | décomp | déclarations TS |
|---|---|---|---|
| `ANIM_SPRITES_START` | define | `include/constants/battle_anim.h:8` | `harness/runtime/decomp-helpers.ts:228` · `include/constants/battle_anim.ts:8` |
| `BGCNT_256COLOR` | define | `include/gba/io_reg.h:537` | `harness/runtime/decomp-runtime.ts:107` · `include/gba/io_reg.ts:776` |
| `BGCNT_AFF1024x1024` | define | `include/gba/io_reg.h:547` | `harness/runtime/decomp-runtime.ts:115` · `include/gba/io_reg.ts:785` |
| `BGCNT_AFF128x128` | define | `include/gba/io_reg.h:544` | `harness/runtime/decomp-runtime.ts:112` · `include/gba/io_reg.ts:782` |
| `BGCNT_AFF256x256` | define | `include/gba/io_reg.h:545` | `harness/runtime/decomp-runtime.ts:113` · `include/gba/io_reg.ts:783` |
| `BGCNT_AFF512x512` | define | `include/gba/io_reg.h:546` | `harness/runtime/decomp-runtime.ts:114` · `include/gba/io_reg.ts:784` |
| `BGCNT_CHARBASE` | func_macro | `include/gba/io_reg.h:534` | `harness/runtime/decomp-runtime.ts:104` · `src/battle_intro.ts:60` |
| `BGCNT_PRIORITY` | func_macro | `include/gba/io_reg.h:533` | `harness/runtime/decomp-runtime.ts:103` · `src/battle_intro.ts:59` |
| `BGCNT_SCREENBASE` | func_macro | `include/gba/io_reg.h:538` | `harness/runtime/decomp-runtime.ts:105` · `src/battle_intro.ts:61` |
| `BGCNT_TXT256x256` | define | `include/gba/io_reg.h:540` | `harness/runtime/decomp-runtime.ts:108` · `include/gba/io_reg.ts:778` |
| `BGCNT_TXT512x512` | define | `include/gba/io_reg.h:543` | `harness/runtime/decomp-runtime.ts:111` · `include/gba/io_reg.ts:781` |
| `BG_TILE_V_FLIP` | func_macro | `include/gba/defines.h:49` | `harness/runtime/decomp-helpers.ts:215` · `src/menu.ts:215` |
| `BLDCNT_TGT1_BG0` | define | `include/gba/io_reg.h:589` | `harness/runtime/decomp-runtime.ts:134` · `src/battle_transition.ts:1194` |
| `B_BUFF_ABILITY` | define | `include/battle_message.h:76` | `harness/runtime/decomp-bridge.ts:289` · `include/battle_message.ts:92` |
| `B_BUFF_EOS` | define | `include/battle_message.h:80` | `harness/runtime/decomp-bridge.ts:142` · `include/battle_message.ts:96` |
| `B_BUFF_ITEM` | define | `include/battle_message.h:77` | `harness/runtime/decomp-bridge.ts:140` · `include/battle_message.ts:93` |
| `B_BUFF_MON_NICK` | define | `include/battle_message.h:74` | `harness/runtime/decomp-bridge.ts:137` · `include/battle_message.ts:90` |
| `B_BUFF_MON_NICK_WITH_PREFIX` | define | `include/battle_message.h:71` | `harness/runtime/decomp-bridge.ts:134` · `include/battle_message.ts:87` |
| `B_BUFF_MOVE` | define | `include/battle_message.h:69` | `harness/runtime/decomp-bridge.ts:132` · `include/battle_message.ts:85` |
| `B_BUFF_NUMBER` | define | `include/battle_message.h:68` | `harness/runtime/decomp-bridge.ts:131` · `include/battle_message.ts:84` |
| `B_BUFF_PLACEHOLDER_BEGIN` | define | `include/battle_message.h:79` | `harness/runtime/decomp-bridge.ts:141` · `include/battle_message.ts:95` |
| `B_BUFF_SPECIES` | define | `include/battle_message.h:73` | `harness/runtime/decomp-bridge.ts:136` · `include/battle_message.ts:89` |
| `B_BUFF_STAT` | define | `include/battle_message.h:72` | `harness/runtime/decomp-bridge.ts:288` · `include/battle_message.ts:88` |
| `B_BUFF_STRING` | define | `include/battle_message.h:67` | `harness/runtime/decomp-bridge.ts:130` · `include/battle_message.ts:83` |
| `B_BUFF_TYPE` | define | `include/battle_message.h:70` | `harness/runtime/decomp-bridge.ts:133` · `include/battle_message.ts:86` |
| `CpuFill32` | func_macro | `include/gba/macro.h:24` | `harness/runtime/decomp-globals.ts:483` · `src/pokenav_conditions_gfx.ts:88` |
| `DISPCNT_BG1_ON` | define | `include/gba/io_reg.h:515` | `harness/runtime/decomp-runtime.ts:123` · `harness/scenes/TestOverworldScene.ts:269` · `include/gba/io_reg.ts:760` |
| `DISPCNT_BG2_ON` | define | `include/gba/io_reg.h:516` | `harness/runtime/decomp-runtime.ts:124` · `harness/scenes/TestOverworldScene.ts:270` · `include/gba/io_reg.ts:761` |
| `DISPCNT_BG3_ON` | define | `include/gba/io_reg.h:517` | `harness/runtime/decomp-runtime.ts:125` · `harness/scenes/TestOverworldScene.ts:271` · `include/gba/io_reg.ts:762` |
| `DISPCNT_BG_ALL_ON` | define | `include/gba/io_reg.h:518` | `harness/runtime/decomp-runtime.ts:130` · `include/gba/io_reg.ts:763` |
| `DISPCNT_FORCED_BLANK` | define | `include/gba/io_reg.h:513` | `harness/runtime/decomp-runtime.ts:131` · `include/gba/io_reg.ts:758` |
| `DISPCNT_MODE_0` | define | `include/gba/io_reg.h:505` | `harness/runtime/decomp-runtime.ts:118` · `include/gba/io_reg.ts:750` |
| `DISPCNT_MODE_1` | define | `include/gba/io_reg.h:506` | `harness/runtime/decomp-runtime.ts:119` · `include/gba/io_reg.ts:751` |
| `DISPCNT_MODE_2` | define | `include/gba/io_reg.h:507` | `harness/runtime/decomp-runtime.ts:120` · `include/gba/io_reg.ts:752` |
| `DISPCNT_OBJ_1D_MAP` | define | `include/gba/io_reg.h:512` | `harness/runtime/decomp-runtime.ts:121` · `harness/scenes/TestOverworldScene.ts:267` · `include/gba/io_reg.ts:757` |
| `DISPCNT_OBJ_ON` | define | `include/gba/io_reg.h:519` | `harness/runtime/decomp-runtime.ts:126` · `harness/scenes/TestOverworldScene.ts:266` · `include/gba/io_reg.ts:764` |
| `FAST_FADE` | enum_member | `src/palette.c:12` | `harness/runtime/decomp-runtime.ts:185` · `src/palette.ts:68` |
| `HARDWARE_FADE` | enum_member | `src/palette.c:13` | `harness/runtime/decomp-runtime.ts:186` · `src/palette.ts:69` |
| `HEAD_SENTINEL` | define | `include/task.h:4` | `harness/runtime/decomp-runtime.ts:561` · `include/task.ts:7` |
| `INTR_FLAG_VBLANK` | define | `include/gba/io_reg.h:717` | `harness/runtime/decomp-globals.ts:1610` · `src/battle_transition.ts:326` |
| `MUS_INTRO` | define | `include/constants/songs.h:345` | `harness/runtime/decomp-globals.ts:847` · `include/constants/songs.ts:342` |
| `MUS_INTRO_BATTLE` | define | `include/constants/songs.h:373` | `harness/runtime/decomp-globals.ts:848` · `include/constants/songs.ts:370` |
| `MUS_NONE` | define | `include/constants/songs.h:548` | `harness/runtime/decomp-globals.ts:951` · `include/constants/songs.ts:539` |
| `NORMAL_FADE` | enum_member | `src/palette.c:11` | `harness/runtime/decomp-runtime.ts:184` · `src/palette.ts:67` |
| `NUM_ALTERING_CAVE_TABLES` | define | `include/constants/wild_encounter.h:9` | `harness/devtools/dev-encounter-tools.ts:54` · `src/wild_encounter.ts:229` |
| `NUM_FEEBAS_SPOTS` | define | `src/wild_encounter.c:29` | `harness/devtools/dev-encounter-tools.ts:103` · `src/wild_encounter.ts:79` |
| `NUM_FISHING_SPOTS` | define | `src/wild_encounter.c:36` | `harness/devtools/dev-encounter-tools.ts:105` · `src/wild_encounter.ts:81` |
| `NUM_FISHING_SPOTS_1` | define | `src/wild_encounter.c:33` | `harness/devtools/dev-encounter-tools.ts:104` · `src/wild_encounter.ts:80` |
| `OAM` | define | `include/gba/defines.h:61` | `harness/runtime/decomp-globals.ts:1589` · `include/gba/defines.ts:55` |
| `OAM_SIZE` | define | `include/gba/defines.h:62` | `harness/runtime/decomp-globals.ts:1591` · `include/gba/defines.ts:56` |
| `ObjectEvent` | struct | `include/global.fieldmap.h:194` | `harness/devtools/dev-scope.ts:80` · `src/event_object_movement.ts:603` |
| `PALETTES_BG` | define | `include/palette.h:16` | `harness/runtime/decomp-globals.ts:182` · `src/palette.ts:49` |
| `PLTT` | define | `include/gba/defines.h:31` | `harness/runtime/decomp-globals.ts:1590` · `include/gba/defines.ts:32` |
| `PLTT_ID` | func_macro | `include/palette.h:20` | `harness/runtime/decomp-bridge.ts:97` · `src/palette.ts:54` |
| `POKENAV_MENUITEM_MATCH_CALL` | enum_member | `include/pokenav.h:152` | `harness/e2e/engine-sweep.ts:58` · `src/pokenav_menu_handler.ts:30` |
| `PlayerAvatar` | struct | `include/global.fieldmap.h:342` | `harness/devtools/dev-scope.ts:98` · `src/field_player_avatar.ts:297` |
| `REG_BASE` | define | `include/gba/io_reg.h:4` | `harness/m4a/native.ts:47` · `include/gba/io_reg.ts:8` |
| `REG_OFFSET_BG1CNT` | define | `include/gba/io_reg.h:12` | `harness/runtime/decomp-runtime.ts:64` · `include/gba/io_reg.ts:13` |
| `REG_OFFSET_BG2CNT` | define | `include/gba/io_reg.h:13` | `harness/runtime/decomp-runtime.ts:65` · `include/gba/io_reg.ts:14` |
| `REG_OFFSET_BG2PA` | define | `include/gba/io_reg.h:23` | `harness/runtime/decomp-runtime.ts:75` · `include/gba/io_reg.ts:24` |
| `REG_OFFSET_BG2PB` | define | `include/gba/io_reg.h:24` | `harness/runtime/decomp-runtime.ts:76` · `include/gba/io_reg.ts:25` |
| `REG_OFFSET_BG2PC` | define | `include/gba/io_reg.h:25` | `harness/runtime/decomp-runtime.ts:77` · `include/gba/io_reg.ts:26` |
| `REG_OFFSET_BG2PD` | define | `include/gba/io_reg.h:26` | `harness/runtime/decomp-runtime.ts:78` · `include/gba/io_reg.ts:27` |
| `REG_OFFSET_BG2X_H` | define | `include/gba/io_reg.h:29` | `harness/runtime/decomp-globals.ts:1614` · `harness/runtime/decomp-runtime.ts:80` · `include/gba/io_reg.ts:30` |
| `REG_OFFSET_BG2X_L` | define | `include/gba/io_reg.h:28` | `harness/runtime/decomp-globals.ts:1613` · `harness/runtime/decomp-runtime.ts:79` · `include/gba/io_reg.ts:29` |
| `REG_OFFSET_BG2Y_H` | define | `include/gba/io_reg.h:32` | `harness/runtime/decomp-globals.ts:1616` · `harness/runtime/decomp-runtime.ts:82` · `include/gba/io_reg.ts:33` |
| `REG_OFFSET_BG2Y_L` | define | `include/gba/io_reg.h:31` | `harness/runtime/decomp-globals.ts:1615` · `harness/runtime/decomp-runtime.ts:81` · `include/gba/io_reg.ts:32` |
| `REG_OFFSET_BG3CNT` | define | `include/gba/io_reg.h:14` | `harness/runtime/decomp-runtime.ts:66` · `include/gba/io_reg.ts:15` |
| `REG_OFFSET_BG3PA` | define | `include/gba/io_reg.h:33` | `harness/runtime/decomp-runtime.ts:83` · `include/gba/io_reg.ts:34` |
| `REG_OFFSET_BG3PB` | define | `include/gba/io_reg.h:34` | `harness/runtime/decomp-runtime.ts:84` · `include/gba/io_reg.ts:35` |
| `REG_OFFSET_BG3PC` | define | `include/gba/io_reg.h:35` | `harness/runtime/decomp-runtime.ts:85` · `include/gba/io_reg.ts:36` |
| `REG_OFFSET_BG3PD` | define | `include/gba/io_reg.h:36` | `harness/runtime/decomp-runtime.ts:86` · `include/gba/io_reg.ts:37` |
| `REG_OFFSET_BG3X_H` | define | `include/gba/io_reg.h:39` | `harness/runtime/decomp-runtime.ts:88` · `include/gba/io_reg.ts:40` |
| `REG_OFFSET_BG3X_L` | define | `include/gba/io_reg.h:38` | `harness/runtime/decomp-runtime.ts:87` · `include/gba/io_reg.ts:39` |
| `REG_OFFSET_BG3Y_H` | define | `include/gba/io_reg.h:42` | `harness/runtime/decomp-runtime.ts:90` · `include/gba/io_reg.ts:43` |
| `REG_OFFSET_BG3Y_L` | define | `include/gba/io_reg.h:41` | `harness/runtime/decomp-runtime.ts:89` · `include/gba/io_reg.ts:42` |
| `RGB2` | func_macro | `include/constants/rgb.h:9` | `harness/runtime/decomp-bridge.ts:90` · `src/palette.ts:123` |
| `SAFE_DIV` | func_macro | `include/global.h:94` · `include/global.h:96` | `harness/runtime/decomp-globals.ts:1180` · `src/pokedex.ts:605` |
| `SE_INTRO_BLAST` | define | `include/constants/songs.h:109` | `harness/runtime/decomp-globals.ts:1139` · `include/constants/songs.ts:111` |
| `SPECIES_RAYQUAZA` | define | `include/constants/species.h:412` | `harness/runtime/decomp-globals.ts:1130` · `include/constants/species.ts:414` |
| `ST_OAM_4BPP` | define | `include/gba/types.h:90` | `harness/runtime/decomp-helpers.ts:72` · `src/decoration.ts:1097` |
| `ST_OAM_AFFINE_DOUBLE_MASK` | define | `include/gba/types.h:88` | `harness/runtime/decomp-helpers.ts:68` · `src/sprite.ts:1014` |
| `ST_OAM_OBJ_NORMAL` | define | `include/gba/types.h:78` | `harness/runtime/decomp-helpers.ts:69` · `src/decoration.ts:1096` |
| `ST_OAM_OBJ_WINDOW` | define | `include/gba/types.h:80` | `harness/runtime/decomp-helpers.ts:71` · `src/battle_intro.ts:68` |
| `TAIL_SENTINEL` | define | `include/task.h:5` | `harness/runtime/decomp-runtime.ts:562` · `include/task.ts:8` |
| `TRAINER_GABBY_AND_TY_1` | define | `include/constants/opponents.h:55` | `harness/e2e/scenarios.ts:140` · `include/constants/opponents.ts:59` |
| `VAR_ALTERING_CAVE_WILD_SET` | define | `include/constants/vars.h:82` | `harness/devtools/dev-encounter-tools.ts:53` · `include/constants/vars.ts:70` |
| `VRAM` | define | `include/gba/defines.h:38` | `harness/runtime/decomp-globals.ts:1588` · `include/gba/defines.ts:41` |
| `VRAM_SIZE` | define | `include/gba/defines.h:39` | `harness/runtime/decomp-globals.ts:165` · `include/gba/defines.ts:42` |
| `WININ_WIN1_OBJ` | define | `include/gba/io_reg.h:563` | `harness/runtime/decomp-globals.ts:1598` · `src/battle_intro.ts:49` |
| `WINOUT_WIN01_BG_ALL` | define | `include/gba/io_reg.h:571` | `harness/runtime/decomp-globals.ts:1599` · `src/battle_intro.ts:52` |
| `WINOUT_WIN01_CLR` | define | `include/gba/io_reg.h:573` | `harness/runtime/decomp-globals.ts:1602` · `src/easy_chat.ts:316` |

## 3. HARNESS UNIQUEMENT — 2+ déclarations toutes dans `harness/` — 1

### Fonctions / globals / labels (1) — l'or de la dédup

| symbole | kind décomp | décomp | déclarations TS |
|---|---|---|---|
| `EnableInterrupts` | function | `src/gpu_regs.c:166` | `harness/runtime/decomp-globals.ts:1473` · `harness/runtime/decomp-helpers.ts:261` |

## 4. HORS-DÉCOMP — 272 symboles TS déclarés dans 2+ fichiers dont le nom N'EXISTE PAS dans la décomp

Noms inventés côté port (adaptations moteur) ou wrappers locaux. Un nom inventé déclaré
dans 2 fichiers = même classe de risque qu'une vraie dupe (ex. `MainCB2_BagMenuRun`).

### 4a. Noms pleins inventés (93) — à examiner comme les vraies dupes

| symbole | déclarations TS |
|---|---|
| `ASH_PNG` | `src/field_effect_helpers.ts:2950` · `src/field_weather_effect.ts:724` |
| `ASH_TILES_PER_FRAME` | `src/field_effect_helpers.ts:2952` · `src/field_weather_effect.ts:725` |
| `AUTOBOOT_KEY` | `harness/devtools/devtools-panel.ts:465` · `harness/devtools/registrations.ts:144` |
| `ActionHandler` | `src/battle_main.ts:2335` · `src/item_menu.ts:2180` |
| `AnimSprite` | `src/battle_anim_dark.ts:39` · `src/battle_anim_effects_1.ts:39` · `src/battle_anim_effects_3.ts:60` · `src/battle_anim_mon_movement.ts:40` · `src/battle_anim_normal.ts:57` |
| `AnimTask` | `src/battle_anim_mon_movement.ts:45` · `src/battle_anim_sound_tasks.ts:13` · `src/battle_anim_throw.ts:129` · `src/battle_anim_utility_funcs.ts:19` |
| `BASE` | `src/engine/data/game-data.ts:21` · `src/event_object_movement.ts:152` · `src/fieldmap.ts:347` |
| `BLDCNT_BLEND_TGT2ALL` | `src/battle_anim_effects_3.ts:382` · `src/battle_anim_ghost.ts:66` |
| `BYTECODE` | `src/engine/decomp-data/auto-asm-bytecode/data/battle_ai_scripts-bytecode.ts:567` · `src/engine/decomp-data/auto-asm-bytecode/data/battle_anim_scripts-bytecode.ts:670` · `src/engine/decomp-data/auto-asm-bytecode/data/battle_scripts_1-bytecode.ts:631` · `src/engine/decomp-data/auto-asm-bytecode/data/battle_scripts_2-bytecode.ts:38` |
| `CB2Callback` | `harness/runtime/decomp-runtime.ts:339` · `src/intro.ts:212` · `src/intro_credits_graphics.ts:77` · `src/main_menu.ts:1266` · `src/option_menu.ts:554` · `src/title_screen.ts:89` |
| `COLOR_BG_FG_SHADOW` | `src/coins.ts:93` · `src/money.ts:104` |
| `EASY_CHAT_TYPES` | `harness/devtools/devtools-panel.ts:143` · `harness/devtools/registrations.ts:119` |
| `EvoTask` | `src/evolution_graphics.ts:40` · `src/evolution_scene.ts:162` |
| `FALSE` | `include/gba/defines.ts:9` · `src/image_processing_effects.ts:60` · `src/secret_base.ts:227` |
| `FE_BASE` | `src/field_effect_helpers.ts:745` · `src/trainer_see.ts:97` |
| `FLASH_KEY` | `harness/devtools/registrations.ts:1056` · `src/save.ts:248` |
| `FUNCTIONS` | `include/battle_ai_switch_items.ts:36` · `include/battle_anim.ts:56` · `include/battle_transition.ts:75` · `include/bike.ts:47` · `include/constants/script_menu.ts:164` · `include/decoration.ts:40` · `include/fieldmap.ts:23` · `include/item_menu.ts:49` · `include/sprite.ts:35` |
| `GAME_H` | `harness/main.ts:187` · `src/engine/field/tilemap-loader.ts:7` |
| `GAME_W` | `harness/main.ts:186` · `src/engine/field/tilemap-loader.ts:6` |
| `GetSaveBlock1` | `src/engine/save/save-block-state.ts:42` · `src/save.ts:703` |
| `GetSaveBlock2` | `src/engine/save/save-block-state.ts:48` · `src/save.ts:706` |
| `GlobalProbe` | `harness/devtools/devtools-panel.ts:56` · `harness/devtools/registrations.ts:34` |
| `ICON_TILES_PER_FRAME` | `src/party_menu.ts:220` · `src/pokemon_icon.ts:24` |
| `INCLUDES` | `include/battle.ts:56` · `include/battle_anim.ts:187` · `include/constants/battle_frontier.ts:171` · `include/constants/event_objects.ts:307` · `include/constants/trainers.ts:368` · `include/fieldmap.ts:55` · `include/gba/defines.ts:79` · `include/item_menu.ts:90` |
| `LABELS` | `src/engine/decomp-data/auto-asm-bytecode/data/battle_ai_scripts-bytecode.ts:8` · `src/engine/decomp-data/auto-asm-bytecode/data/battle_anim_scripts-bytecode.ts:8` · `src/engine/decomp-data/auto-asm-bytecode/data/battle_scripts_1-bytecode.ts:8` · `src/engine/decomp-data/auto-asm-bytecode/data/battle_scripts_2-bytecode.ts:8` |
| `LZ77UnCompVram` | `harness/runtime/decomp-globals.ts:259` · `src/pokenav_conditions_gfx.ts:73` |
| `LZ77UnCompWram` | `src/pokenav_region_map.ts:72` · `src/region_map.ts:2363` |
| `MAPSEC_SLATEPORT_CITY` | `include/constants/region_map_sections.ts:16` · `src/battle_tent.ts:32` |
| `METLOC_SPECIAL_EGG` | `include/constants/region_map_sections.ts:225` · `src/daycare.ts:135` |
| `MULTISTRING_CHOOSER_IDX` | `src/battle_script_commands.ts:13191` · `src/battle_util.ts:2883` |
| `OAM_SIZES` | `harness/devtools/devtools-panel.ts:96` · `harness/devtools/registrations.ts:616` · `harness/gba/types.ts:197` |
| `PANEL_ID` | `harness/devtools/devtools-panel.ts:112` · `harness/devtools/panel-v2.ts:36` |
| `ResetAllMonAnimations` | `harness/runtime/decomp-globals.ts:2482` · `src/pokemon_animation.ts:2178` |
| `Rt` | `harness/devtools/dev-breakpoint-tools.ts:28` · `harness/devtools/dev-gfx-tools.ts:33` · `harness/e2e/runner.ts:62` |
| `S` | `harness/e2e/engine-sweep.ts:77` · `src/pokemon_animation.ts:135` |
| `STATS` | `src/engine/decomp-data/auto-asm-bytecode/data/battle_ai_scripts-bytecode.ts:569` · `src/engine/decomp-data/auto-asm-bytecode/data/battle_anim_scripts-bytecode.ts:672` · `src/engine/decomp-data/auto-asm-bytecode/data/battle_scripts_1-bytecode.ts:633` · `src/engine/decomp-data/auto-asm-bytecode/data/battle_scripts_2-bytecode.ts:40` |
| `STD_FRAME_PAL` | `src/party_menu.ts:126` · `src/shop.ts:119` · `src/trainer_card.ts:64` · `src/wallclock.ts:92` |
| `STD_FRAME_TILE` | `src/party_menu.ts:125` · `src/shop.ts:118` · `src/trainer_card.ts:63` · `src/wallclock.ts:91` |
| `SYMBOL_MARKER` | `src/engine/battle/battle-anim-registry.ts:60` · `src/engine/battle/memory-map.ts:371` · `src/engine/decomp-data/auto-asm-bytecode/_symbols-table.ts:94` |
| `SYMBOL_MASK` | `src/engine/battle/memory-map.ts:372` · `src/engine/decomp-data/auto-asm-bytecode/_symbols-table.ts:95` |
| `SignalWaitState` | `src/engine/field/region-map.ts:44` · `src/field_screen_effect.ts:78` · `src/scrcmd.ts:258` |
| `Spr` | `src/battle_gfx_sfx_util.ts:514` · `src/battle_interface.ts:437` |
| `StopMonFrontSpriteAnimation` | `harness/runtime/decomp-globals.ts:2483` · `src/pokemon_animation.ts:2171` |
| `SubState` | `src/player_pc.ts:187` · `src/start_menu.ts:110` |
| `T` | `src/field_effect_helpers.ts:902` · `src/pokemon_animation.ts:48` |
| `TASK_NAMES` | `include/battle_transition.ts:85` · `include/item_menu.ts:75` |
| `TELEPORT_TOWNS` | `harness/devtools/devtools-panel.ts:122` · `harness/devtools/registrations.ts:100` |
| `TRUE` | `include/gba/defines.ts:8` · `src/image_processing_effects.ts:61` · `src/secret_base.ts:226` |
| `TaskCallback` | `src/intro.ts:211` · `src/intro_credits_graphics.ts:76` · `src/main_menu.ts:1265` · `src/option_menu.ts:553` · `src/title_screen.ts:88` |
| `TrainerData` | `src/battle_main.ts:987` · `src/engine/data/game-data.ts:91` |
| `TrainerSeeBridge` | `src/battle_setup.ts:134` · `src/scrcmd_trainer.ts:25` |
| `WALDA_WALLPAPERS_COUNT` | `src/pokemon_storage_system.ts:5338` · `src/walda_phrase.ts:321` |
| `WALDA_WALLPAPER_ICONS_COUNT` | `src/pokemon_storage_system.ts:5339` · `src/walda_phrase.ts:322` |
| `bootScenario` | `harness/devtools/devtools-panel.ts:508` · `harness/devtools/registrations.ts:206` |
| `esc` | `harness/devtools/dev-audio-tools.ts:40` · `harness/devtools/devtools-panel.ts:91` · `harness/devtools/panel-v2.ts:52` · `harness/devtools/registrations.ts:75` |
| `g` | `harness/devtools/devtools-panel.ts:74` · `harness/devtools/registrations.ts:61` · `harness/e2e/engine-sweep.ts:87` · `harness/e2e/runner.ts:79` |
| `gameCanvas` | `harness/devtools/dev-gfx-tools.ts:50` · `harness/devtools/devtools-panel.ts:322` |
| `getBattlerControllerFunc` | `src/battle_controller_player.ts:244` · `src/engine/battle/state.ts:136` |
| `getContestMove` | `src/engine/data/game-data.ts:424` · `src/pokemon_summary_screen.ts:77` |
| `getItemNameFr` | `harness/runtime/data-tables.ts:111` · `src/engine/data/game-data.ts:450` |
| `getMove` | `src/engine/data/game-data.ts:349` · `src/pokemon_summary_screen.ts:74` |
| `getMoveDescription` | `src/engine/data/game-data.ts:359` · `src/pokemon_summary_screen.ts:76` |
| `getMoveName` | `src/engine/data/game-data.ts:354` · `src/pokemon_summary_screen.ts:75` |
| `getRuntime` | `harness/runtime/decomp-globals.ts:130` · `src/battle_anim_mon_movement.ts:36` |
| `getSpeciesInfo` | `src/engine/data/game-data.ts:329` · `src/pokemon_summary_screen.ts:73` |
| `getTrainer` | `harness/runtime/data-tables.ts:135` · `src/engine/data/game-data.ts:420` |
| `hex` | `harness/devtools/devtools-panel.ts:84` · `harness/devtools/registrations.ts:69` |
| `injectStyles` | `harness/devtools/devtools-panel.ts:862` · `harness/devtools/panel-v2.ts:553` |
| `installKeybind` | `harness/devtools/devtools-panel.ts:201` · `harness/devtools/panel-v2.ts:157` |
| `loadTileBin` | `harness/boot/intro-asset-loader.ts:48` · `harness/gba/png-loader.ts:207` |
| `loop` | `harness/devtools/devtools-panel.ts:209` · `harness/devtools/panel-v2.ts:168` |
| `markActiveSpeed` | `harness/devtools/devtools-panel.ts:851` · `harness/devtools/panel-v2.ts:301` |
| `paletteGrid` | `harness/devtools/devtools-panel.ts:260` · `harness/devtools/registrations.ts:622` |
| `pngTo1dObjLayout` | `src/event_object_movement.ts:1471` · `src/field_player_avatar.ts:651` |
| `queueAutoboot` | `harness/devtools/devtools-panel.ts:467` · `harness/devtools/registrations.ts:146` |
| `rdU16` | `src/m4a.ts:190` · `src/m4a_1.ts:118` |
| `rdU32` | `src/m4a.ts:183` · `src/m4a_1.ts:122` |
| `rdU8` | `src/m4a.ts:180` · `src/m4a_1.ts:115` |
| `renderLive` | `harness/devtools/devtools-panel.ts:230` · `harness/devtools/panel-v2.ts:177` |
| `resumeAutobootIfPending` | `harness/devtools/devtools-panel.ts:472` · `harness/devtools/registrations.ts:155` |
| `rgb15FromRgba` | `harness/devtools/devtools-panel.ts:88` · `harness/devtools/registrations.ts:72` |
| `rt` | `harness/devtools/dev-fieldfx-tools.ts:52` · `harness/devtools/dev-gfx-tools.ts:46` · `harness/devtools/devtools-panel.ts:76` · `harness/devtools/panel-v2.ts:46` · `harness/devtools/registrations.ts:63` · `harness/runtime/decomp-globals.ts:123` · `src/battle_intro.ts:36` · `src/scanline_effect.ts:28` |
| `s8` | `src/m4a.ts:206` · `src/m4a_1.ts:127` |
| `sIsOpen` | `src/player_pc.ts:204` · `src/start_menu.ts:126` |
| `sPal` | `src/battle_anim_dark.ts:23` · `src/battle_anim_effects_1.ts:31` · `src/battle_anim_effects_3.ts:51` · `src/battle_anim_fire.ts:37` · `src/battle_anim_ground.ts:29` · `src/battle_anim_water.ts:33` |
| `sSheet` | `src/battle_anim_dark.ts:22` · `src/battle_anim_effects_1.ts:30` · `src/battle_anim_effects_3.ts:50` · `src/battle_anim_fire.ts:36` · `src/battle_anim_ground.ts:28` · `src/battle_anim_water.ts:32` |
| `sSubState` | `src/player_pc.ts:209` · `src/shop.ts:198` · `src/start_menu.ts:130` |
| `setReservedSpritePaletteCount` | `harness/runtime/decomp-globals.ts:1268` · `src/sprite.ts:264` |
| `setVisible` | `harness/devtools/devtools-panel.ts:191` · `harness/devtools/panel-v2.ts:106` |
| `socleFrontierRef` | `src/battle_factory.ts:72` · `src/battle_palace.ts:35` · `src/battle_pike.ts:215` · `src/battle_tent.ts:41` |
| `step` | `harness/devtools/devtools-panel.ts:844` · `harness/devtools/panel-v2.ts:294` |
| `syncPlayerPosBeforeBoot` | `harness/devtools/devtools-panel.ts:498` · `harness/devtools/registrations.ts:196` |
| `toS16` | `src/battle_anim_mons.ts:77` · `src/pokeball.ts:250` |

### 4b. Wrappers locaux `_Nom` d'un symbole décomp (77) — pattern transpileur assumé (liste compacte)

Chaque fichier transpilé déclare ses propres alias préfixés `_` vers les symboles décomp
importés : dupes VOLONTAIRES par fichier, à résorber seulement lors des passes d'unification.

- `_AI_TrySwitchOrUseItem` × 2
- `_ALL_MOVES_MASK` × 2
- `_AnimFastTranslateLinear` × 3
- `_AnimFastTranslateLinearWaitEnd` × 3
- `_ArcTan2Neg` × 6
- `_BATTLE_PARTNER` × 4
- `_BLDALPHA_BLEND` × 5
- `_B_ANIM_SUBSTITUTE_TO_MON` × 3
- `_BattleAI_ChooseMoveOrAction` × 2
- `_BattleAI_SetupAIData` × 2
- `_BattleAnimAdjustPanning` × 2
- `_BattleMainCB1` × 2
- `_BeginNormalPaletteFade` × 2
- `_BufferStringBattle` × 2
- `_CancelMultiTurnMoves` × 2
- `_ChangeSpriteAffineAnim` × 2
- `_ClearTemporarySpeciesSpriteData` × 2
- `_DestroyAnimSprite` × 6
- `_DestroyAnimSpriteAfterTimer` × 2
- `_FlagGet` × 2
- `_GetAnimBattlerSpriteId` × 2
- `_GetBattlerSide` × 5
- `_GetBattlerSpriteBGPriority` × 7
- `_GetBattlerSpriteCoordAttr` × 2
- `_GetBattlerSpriteSubpriority` × 5
- `_GetBattlerYCoordWithElevation` × 2
- `_GetMostSuitableMonToSwitchInto` × 2
- `_GetMoveTarget` × 2
- `_HEALTHBOX_STATUS_ICON` × 2
- `_HandleLowHpMusicChange` × 2
- `_InitAndLaunchChosenStatusAnimation` × 2
- `_InitAndLaunchSpecialAnimation` × 3
- `_InitAndRunAnimFastLinearTranslation` × 2
- `_InitAnimFastLinearTranslation` × 3
- `_InitAnimFastLinearTranslationWithSpeed` × 2
- `_InitAnimLinearTranslationWithSpeed` × 5
- `_InitBattleControllers` × 2
- `_InitSpriteDataForLinearTranslation` × 2
- `_IsBattleSEPlaying` × 2
- `_IsBattlerSpriteVisible` × 5
- `_IsContest` × 5
- `_IsDma3ManagerBusyWithBgCopy` × 2
- `_IsDoubleBattle` × 8
- `_IsRunningFromBattleImpossible` × 2
- `_IsTextPrinterActive` × 3
- `_LoadBattleBarGfx` × 2
- `_PARTY_SIZE` × 3
- `_PlaySE` × 3
- `_PlaySE12WithPanning` × 8
- `_RunStoredCallbackWhenAffineAnimEnds` × 8
- `_RunStoredCallbackWhenAnimEnds` × 9
- `_SE_FAINT` × 2
- `_SOUND_PAN_ATTACKER` × 3
- `_SOUND_PAN_TARGET` × 3
- `_SetAverageBattlerPositions` × 7
- `_SetGpuReg` × 3
- `_SetHealthboxSpriteVisible` × 3
- `_SetUpBattleVarsAndBirchZigzagoon` × 2
- `_StartSpriteAffineAnim` × 11
- `_StartSpriteAnim` × 13
- `_TranslateSpriteInGrowingCircle` × 2
- `_TranslateSpriteLinear` × 2
- `_UpdateHealthboxAttribute` × 2
- `_UpdateHpTextInHealthbox` × 2
- `_WaitAnimForDuration` × 10
- `_convertScaleParam` × 2
- `_createTask` × 4
- `_gDoingBattleAnim` × 2
- `_gTasks` × 2
- `_getAnimBattlerSpriteId` × 2
- `_getBattlerSpriteSubpriority` × 2
- `_getMoveTarget` × 3
- `_paletteFadeActive` × 2
- `_recordAbilityBattle` × 2
- `_setBgTilemapPalette` × 2
- `_showBg` × 2
- `_task` × 3

### 4c. Helpers port `_xxx` sans homonyme décomp (102) — liste compacte

- `_AnimItf` × 2 (battle_controller_player.ts:1575, battle_controller_player_partner.ts:748)
- `_CompleteOnExpBarDone` × 2 (battle_controller_player.ts:2376, battle_controller_player_partner.ts:960)
- `_DUMMY_TASK` × 2 (battle_anim.ts:161, battle_anim_throw.ts:139)
- `_DestroyAnimSpriteCb` × 5 (battle_anim_dark.ts:129, battle_anim_electric.ts:61, battle_anim_fire.ts:79, …)
- `_ESprite` × 2 (battle_anim_effects_1.ts:652, battle_anim_effects_1b.ts:48)
- `_Rt` × 3 (battle_anim_effects_2.ts:171, battle_anim_electric.ts:44, battle_anim_flying.ts:56)
- `_RtOam` × 3 (battle_anim_effects_2.ts:170, battle_anim_electric.ts:43, battle_anim_flying.ts:55)
- `_ShowHealthboxOnSendOut` × 3 (battle_controller_opponent.ts:1425, battle_controller_player.ts:2309, battle_controller_player_partner.ts:198)
- `_SpTask` × 2 (battle_anim_effects_2.ts:1301, battle_anim_water.ts:905)
- `_VSprite` × 12 (battle_anim_bug.ts:37, battle_anim_dragon.ts:31, battle_anim_effects_2.ts:64, …)
- `_animItf` × 2 (battle_controller_player.ts:1584, battle_controller_player_partner.ts:757)
- `_applyFrame` × 2 (battle_anim_effects_3.ts:117, pokemon_animation.ts:1988)
- `_args` × 2 (battle_anim_effects_2.ts:197, battle_anim_mon_movement.ts:32)
- `_ashInit` × 2 (field_effect_helpers.ts:2961, field_weather_effect.ts:735)
- `_ashInitPromise` × 2 (field_effect_helpers.ts:2962, field_weather_effect.ts:736)
- `_ashTileStart` × 2 (field_effect_helpers.ts:2960, field_weather_effect.ts:733)
- `_assets` × 6 (party_menu.ts:437, pokedex.ts:294, pokedex_area_region_map.ts:29, …)
- `_assetsLoaded` × 2 (battle_interface.ts:1730, naming_screen.ts:441)
- `_assetsLoading` × 6 (party_menu.ts:438, pokedex.ts:295, pokedex_cry_screen.ts:84, …)
- `_assetsReady` × 2 (battle_transition.ts:84, pokedex_cry_screen.ts:85)
- `_b64ToU8` × 2 (save.ts:256, script.ts:412)
- `_ballPalSlot` × 2 (battle_transition.ts:106, pokemon_summary_screen.ts:230)
- `_battlerSpeciesName` × 2 (battle_anim_effects_1b.ts:115, battle_anim_effects_3.ts:467)
- `_battlerSprite` × 3 (battle_anim_effects_1.ts:48, battle_anim_effects_3.ts:75, battle_anim_normal.ts:70)
- `_battlerSpriteId` × 5 (battle_anim_effects_3.ts:404, battle_anim_mon_movement.ts:52, battle_anim_poison.ts:116, …)
- `_bldAlpha` × 2 (runtime, battle_interface.ts:715)
- `_commands` × 2 (devtools, engine)
- `_data` × 2 (engine, script_menu.ts:41)
- `_destroyAnimSpriteCb` × 2 (battle_anim_effects_1.ts:684, battle_anim_effects_2.ts:243)
- `_drawMapMetatileAt` × 2 (field_tasks.ts:138, fldeff_misc.ts:36)
- `_emptySprite` × 4 (intro.ts:214, intro_credits_graphics.ts:79, main_menu.ts:1268, …)
- `_emptyTask` × 5 (intro.ts:215, intro_credits_graphics.ts:80, main_menu.ts:1269, …)
- `_enc` × 2 (data, save.ts:138)
- `_ensureOwnMatrix` × 2 (battle_anim_electric.ts:105, battle_anim_flying.ts:162)
- `_findSpriteId` × 2 (battle_transition.ts:195, egg_hatch.ts:837)
- `_flItf` × 2 (battle_anim_flying.ts:827, battle_anim_utility_funcs.ts:445)
- `_freeMonSpriteAndHideHealthbox` × 2 (battle_controller_player.ts:1215, battle_controller_player_partner.ts:438)
- `_g` × 2 (devtools, engine)
- `_gHealthboxSpriteId` × 3 (battle_controller_opponent.ts:1418, battle_controller_player.ts:2283, battle_controller_player_partner.ts:193)
- `_getBattlerMonSpriteId` × 2 (battle_anim_electric.ts:438, battle_anim_flying.ts:148)
- `_getBattlerSpriteId` × 2 (battle_anim_throw.ts:679, battle_main.ts:3514)
- `_getHealthBoxAnimationState` × 3 (battle_controller_opponent.ts:1013, battle_controller_player.ts:1438, battle_controller_player_partner.ts:262)
- `_getMoveType` × 2 (battle_controller_player.ts:725, battle_util.ts:2853)
- `_getTrainerData` × 2 (battle_ai_script_commands.ts:295, battle_main.ts:1003)
- `_graphicsLoading` × 3 (party_menu.ts:492, pokemon_summary_screen.ts:509, trainer_card.ts:154)
- `_graphicsReady` × 3 (party_menu.ts:491, pokemon_summary_screen.ts:508, trainer_card.ts:153)
- `_gs` × 4 (intro.ts:216, intro_credits_graphics.ts:81, main_menu.ts:1270, …)
- `_gt` × 5 (intro.ts:217, intro_credits_graphics.ts:82, main_menu.ts:1271, …)
- `_healthBoxAnimStateWired` × 3 (battle_controller_opponent.ts:1023, battle_controller_player.ts:1445, battle_controller_player_partner.ts:258)
- `_inputTaskId` × 2 (party_menu.ts:442, pokemon_summary_screen.ts:507)
- `_installed` × 3 (devtools, runtime, bytevm-boot.ts:15)
- `_introEndDelay` × 2 (battle_controller_player.ts:2629, battle_controller_player_partner.ts:1141)
- `_isBehindSubstitute` × 3 (battle_controller_opponent.ts:1027, battle_controller_player.ts:1453, battle_controller_player_partner.ts:252)
- `_isOpen` × 4 (party_menu.ts:348, pokedex.ts:3691, pokemon_summary_screen.ts:505, …)
- `_isSpecialAnimActive` × 3 (battle_controller_opponent.ts:1031, battle_controller_player.ts:1457, battle_controller_player_partner.ts:242)
- `_itf` × 8 (battle_anim_dark.ts:45, battle_anim_effects_1.ts:45, battle_anim_effects_3.ts:72, …)
- `_loadAssets` × 5 (party_menu.ts:496, pokedex.ts:296, pokemon_summary_screen.ts:576, …)
- `_loadPromise` × 3 (engine)
- `_loaded` × 3 (data, script.ts:410)
- `_menuGfx` × 2 (mon_markings.ts:209, naming_screen.ts:447)
- `_monSprite` × 2 (battle_anim_dark.ts:48, battle_anim_ground.ts:40)
- `_moveAnimMove` × 2 (battle_controller_player.ts:1574, battle_controller_player_partner.ts:747)
- `_moveAnimState` × 2 (battle_controller_player.ts:1573, battle_controller_player_partner.ts:746)
- `_msgWid` × 2 (party_menu.ts:440, wallclock.ts:254)
- `_nameBytes` × 2 (engine, secret_base.ts:473)
- `_oamOf` × 2 (battle_anim_effects_3.ts:395, battle_anim_poison.ts:129)
- `_oamTileNumAdd` × 2 (battle_anim_effects_2.ts:303, battle_anim_electric.ts:91)
- `_observe` × 2 (devtools, runtime)
- `_palView` × 4 (intro.ts:218, intro_credits_graphics.ts:83, main_menu.ts:1272, …)
- `_party` × 2 (devtools, party_menu.ts:1613)
- `_phase` × 3 (party_menu.ts:349, pokemon_summary_screen.ts:506, trainer_card.ts:126)
- `_rand2` × 4 (battle_anim_effects_3.ts:363, battle_anim_fight.ts:48, battle_anim_ground.ts:47, …)
- `_revCharmap` × 2 (battle_message.ts:539, text.ts:1127)
- `_rt` × 17 (devtools, runtime, battle_anim_effects_2.ts:178, …)
- `_runtimeGetter` × 2 (palette.ts:73, sprite.ts:92)
- `_s16` × 7 (gba, battle_anim_ghost.ts:61, battle_anim_ice.ts:70, …)
- `_s8` × 2 (battle_ai_script_commands.ts:248, rtc.ts:104)
- `_seLog` × 2 (devtools)
- `_selectedSpriteId` × 2 (devtools)
- `_setHealthBoxAnimationState` × 3 (battle_controller_opponent.ts:1017, battle_controller_player.ts:1449, battle_controller_player_partner.ts:266)
- `_setMonToSwitchIntoId` × 3 (battle_controller_opponent.ts:621, battle_controller_player.ts:2170, battle_controller_player_partner.ts:325)
- `_setTaskFunc` × 2 (evolution_graphics.ts:43, evolution_scene.ts:167)
- `_shadowTileStart` × 2 (battle_gfx_sfx_util.ts:542, field_effect_helpers.ts:3959)
- `_showObj` × 2 (devtools)
- `_side` × 2 (battle_anim_effects_1b.ts:68, battle_anim_effects_3.ts:336)
- `_speciesName` × 2 (battle_anim_mons.ts:282, battle_message.ts:667)
- `_spr` × 4 (battle_gfx_sfx_util.ts:521, battle_interface.ts:448, mon_markings.ts:231, …)
- `_spriteIdOf` × 2 (battle_anim_bug.ts:134, battle_anim_throw.ts:763)
- `_spriteOamTileNumSet` × 3 (pokenav_main_menu.ts:754, pokenav_menu_handler_gfx.ts:576, pokenav_region_map.ts:139)
- `_sprites` × 2 (devtools, battle_anim_mon_movement.ts:47)
- `_startAnim` × 2 (battle_anim_fight.ts:26, battle_anim_throw.ts:774)
- `_state` × 6 (m4a, data, engine, …)
- `_swItf` × 2 (battle_anim_electric.ts:701, battle_anim_water.ts:47)
- `_tickMainMenu` × 2 (player_pc.ts:537, start_menu.ts:821)
- `_toS16` × 4 (battle_anim_bug.ts:45, battle_anim_effects_1b.ts:66, battle_anim_effects_2.ts:202, …)
- `_toS8` × 2 (battle_interface.ts:346, list_menu.ts:917)
- `_trainerPicMap` × 2 (battle_gfx_sfx_util.ts:201, pokenav_match_call_gfx.ts:79)
- `_trainerSee` × 2 (battle_setup.ts:142, scrcmd_trainer.ts:30)
- `_triggerFaintSlideAnim` × 2 (battle_controller_player.ts:1486, battle_controller_player_partner.ts:729)
- `_vItf` × 13 (battle_anim_bug.ts:38, battle_anim_dragon.ts:32, battle_anim_effects_1b.ts:56, …)
- `_visible` × 2 (devtools)
- `_visiblesOnly` × 2 (devtools)

---
_1393 doublons décomp + 272 hors-décomp — régénération : `node scripts/decomp-index.cjs` · requête : `--dupes`._
