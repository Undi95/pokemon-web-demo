# Helper Bridge Manifest

Généré : 2026-05-08
Source : 295 fichiers `.c` du décomp (extracted-all/)

## Stats

- Fonctions définies dans le décomp : **14910**
- Helpers appelés / définis (= auto-portable) : **7686**
- Helpers externes (= libc / hardware / macros, need manual TS impl) : **527**
- Fonctions définies mais jamais appelées (= entry points) : **7224**

## Top 50 helpers internes (= les plus utilisés, à porter en priorité)

| Rank | Name | Calls | Defined in | Examples |
|------|------|-------|------------|----------|
| 1 | `DestroyTask` | 495 | `task` | apprentice.Task_ChooseAnswer, apprentice.Task_WaitForPrintingMessage, apprentice.Task_ExecuteFuncAfterButtonPress |
| 2 | `PlaySE` | 485 | `sound` | apprentice.Task_ChooseAnswer, battle_anim.Cmd_playse, battle_anim_ghost.AnimConfuseRayBallBounce_Step2 |
| 3 | `CreateTask` | 465 | `task` | apprentice.CreateChooseAnswerTask, apprentice.PrintApprenticeMessage, apprentice.ExecuteFuncAfterButtonPress |
| 4 | `SetGpuReg` | 424 | `gpu_regs` | battle_anim.MoveBattlerSpriteToBG, battle_anim.Cmd_setalpha, battle_anim.Cmd_setbldcnt |
| 5 | `SetMainCallback2` | 336 | `main` | battle_controller_opponent.OpponentHandleEndLinkBattle, battle_controller_player.SetLinkBattleEndCallbacks, battle_controller_player.SetBattleEndCallbacks |
| 6 | `GetBattlerSide` | 324 | `battle_anim_mons` | battle_ai_script_commands.BattleAI_SetupAIData, battle_ai_script_commands.Cmd_count_usable_party_mons, battle_ai_script_commands.Cmd_if_status_in_party |
| 7 | `CopyWindowToVram` | 316 | `window` | apprentice.CreateAndShowWindow, battle_dome.Task_HandleInfoCardInput, battle_dome.DisplayTrainerInfoOnCard |
| 8 | `CreateSprite` | 310 | `sprite` | battle_anim_effects_1.AnimTask_LeafBlade, battle_anim_effects_1.AnimTask_LeafBlade_Step2, battle_anim_effects_2.AirCutterProjectileStep1 |
| 9 | `Random` | 285 | `random` | apprentice.SetApprenticeId, apprentice.ShuffleApprenticeSpecies, apprentice.GetMonIdForQuestion |
| 10 | `StartSpriteAnim` | 277 | `sprite` | battle_anim_dark.AnimClawSlash, battle_anim_dragon.StartDragonFireTranslation, battle_anim_effects_1.AnimSolarBeamBigOrb |
| 11 | `FillWindowPixelBuffer` | 265 | `window` | battle_dome.Task_HandleInfoCardInput, battle_factory_screen.Select_ErasePopupMenu, battle_factory_screen.Select_PrintRentalPkmnString |
| 12 | `DestroySprite` | 254 | `sprite` | battle_anim.DestroyAnimSprite, battle_anim_dark.AnimTask_MetallicShine_Step, battle_anim_effects_1.AnimSolarBeamSmallOrb_Step |
| 13 | `BeginNormalPaletteFade` | 247 | `palette` | battle_anim_effects_1.AnimTask_MoonlightEndFade, battle_anim_effects_1.AnimTask_MoonlightEndFade_Step, battle_anim_ghost.AnimTask_CurseStretchingBlackBg_Step1 |
| 14 | `VarGet` | 247 | `event_data` | battle_dome.InitDomeChallenge, battle_dome.GetDomeData, battle_dome.SetDomeData |
| 15 | `DestroyAnimVisualTask` | 230 | `battle_anim` | battle_anim.Task_InitUpdateMonBg, battle_anim_dark.AnimTask_AttackerFadeToInvisible_Step, battle_anim_dark.AnimTask_AttackerFadeFromInvisible_Step |
| 16 | `Sin` | 217 | `trig` | battle_anim_bug.AnimTranslateWebThread_Step, battle_anim_dark.AnimUnusedBagSteal_Step, battle_anim_dragon.AnimDragonDanceOrb |
| 17 | `GetBattlerSpriteCoord` | 215 | `battle_anim_mons` | battle_anim.Cmd_createsprite, battle_anim_bug.AnimMegahornHorn, battle_anim_bug.AnimLeechLifeNeedle |
| 18 | `PutWindowTilemap` | 207 | `window` | apprentice.CreateAndShowWindow, battle_dome.DisplayTrainerInfoOnCard, battle_dome.DisplayMatchInfoOnCard |
| 19 | `LoadPalette` | 191 | `palette` | battle_anim.MoveBattlerSpriteToBG, battle_anim_effects_1.AnimLockOnTarget_Step4, battle_anim_effects_2.AnimTask_LoadMusicNotesPals |
| 20 | `ScheduleBgCopyTilemapToVram` | 171 | `menu` | battle_pyramid_bag.InitPyramidBagBgs, battle_pyramid_bag.BagAction_UseOnField, battle_pyramid_bag.BagAction_Cancel |
| 21 | `DestroyAnimSprite` | 169 | `battle_anim` | battle_anim_bug.AnimTranslateWebThread_Step, battle_anim_bug.AnimStringWrap_Step, battle_anim_bug.AnimSpiderWeb_End |
| 22 | `AddTextPrinterParameterized` | 164 | `text` | apprentice.CreateApprenticeMenu, battle_factory_screen.Select_PrintRentalPkmnString, battle_factory_screen.Select_PrintSelectMonString |
| 23 | `CopyBgTilemapBufferToVram` | 161 | `bg` | battle_anim_mons.ClearBattleAnimBg, battle_anim_mons.AnimLoadCompressedBgTilemap, battle_anim_mons.AnimLoadCompressedBgTilemapHandleContest |
| 24 | `SetVBlankCallback` | 150 | `main` | battle_dome.Task_ShowTourneyInfoCard, battle_dome.Task_ShowTourneyTree, battle_factory_screen.CB2_InitSelectScreen |
| 25 | `FlagGet` | 140 | `event_data` | battle_main.BufferPartyVsScreenHealth_AtStart, battle_main.EndLinkBattleInSteps, battle_main.GetWhoStrikesFirst |
| 26 | `StoreSpriteCallbackInData6` | 137 | `battle_anim_mons` | battle_anim_bug.AnimMegahornHorn, battle_anim_bug.AnimLeechLifeNeedle, battle_anim_bug.AnimTranslateStinger |
| 27 | `UpdatePaletteFade` | 136 | `palette` | battle_dome.CB2_TourneyTree, battle_factory_screen.CB2_SelectScreen, battle_factory_screen.Select_Task_Exit |
| 28 | `IsContest` | 132 | `battle_anim` | battle_anim.LaunchBattleAnimation, battle_anim.Cmd_end, battle_anim.Cmd_monbg |
| 29 | `SetMonData` | 130 | `pokemon` | battle_controllers.SetUpBattleVarsAndBirchZigzagoon, battle_controller_link_opponent.SetLinkOpponentMonData, battle_controller_link_partner.SetLinkPartnerMonData |
| 30 | `Free` | 130 | `malloc` | battle_dome.InitDomeTrainers, battle_dome.DisplayTrainerInfoOnCard, battle_dome.InitRandomTourneyTreeResults |
| 31 | `IsDma3ManagerBusyWithBgCopy` | 129 | `bg` | battle_arena.BattleArena_ShowJudgmentWindow, battle_controller_player.HandleChooseActionAfterDma3, battle_controller_player.HandleChooseMoveAfterDma3 |
| 32 | `LockPlayerFieldControls` | 119 | `script` | apprentice.Script_PrintApprenticeMessage, battle_pyramid_bag.ChooseItemsToTossFromPyramidBag, battle_setup.DoStandardWildBattle |
| 33 | `ShowBg` | 119 | `bg` | battle_dome.Task_ShowTourneyInfoCard, battle_dome.Task_ShowTourneyTree, battle_factory_screen.CB2_InitSelectScreen |
| 34 | `FindTaskIdByFunc` | 117 | `task` | battle_anim_rock.AnimRolloutParticle, battle_pike.StatusInflictionFadeIn, battle_pike.IsStatusInflictionScreenFlashTaskFinished |
| 35 | `ScriptReadHalfword` | 109 | `script` | mystery_event_script.MEScrCmd_checkcompat, mystery_event_script.MEScrCmd_setrecordmixinggift, scrcmd.ScrCmd_special |
| 36 | `GetMultiplayerId` | 102 | `link` | battle_controllers.InitLinkBtlControllers, battle_controller_link_opponent.LinkOpponentBufferExecCompleted, battle_controller_link_opponent.LinkOpponentHandleDrawTrainerPic |
| 37 | `AddWindow` | 101 | `window` | apprentice.CreateAndShowWindow, battle_pyramid_bag.OpenMenuActionWindowById, battle_records.ShowLinkBattleRecords |
| 38 | `ResetSpriteData` | 101 | `sprite` | battle_dome.Task_ShowTourneyInfoCard, battle_dome.Task_ShowTourneyTree, battle_factory_screen.CB2_InitSelectScreen |
| 39 | `VarSet` | 97 | `event_data` | apprentice.SetSavedApprenticeTrainerGfxId, apprentice.SetPlayerApprenticeTrainerGfxId, battle_arena.SaveArenaChallenge |
| 40 | `GetBattlerPosition` | 97 | `battle_anim_mons` | battle_ai_script_commands.Cmd_count_usable_party_mons, battle_ai_switch_items.ShouldSwitchIfWonderGuard, battle_ai_switch_items.FindMonThatAbsorbsOpponentsMove |
| 41 | `GetAnimBattlerSpriteId` | 95 | `battle_anim_mons` | battle_anim.Cmd_invisible, battle_anim.Cmd_visible, battle_anim.Cmd_teamattack_moveback |
| 42 | `Cos` | 95 | `trig` | battle_anim_dragon.AnimDragonDanceOrb, battle_anim_dragon.AnimDragonDanceOrb_Step, battle_anim_dragon.AnimOverheatFlame |
| 43 | `AnimateSprites` | 95 | `sprite` | battle_dome.CB2_TourneyTree, battle_factory_screen.CB2_SelectScreen, battle_factory_screen.Swap_CB2 |
| 44 | `BuildOamBuffer` | 95 | `sprite` | battle_dome.CB2_TourneyTree, battle_factory_screen.CB2_SelectScreen, battle_factory_screen.Swap_CB2 |
| 45 | `StartSpriteAffineAnim` | 94 | `sprite` | battle_anim_bug.AnimMegahornHorn, battle_anim_bug.AnimLeechLifeNeedle, battle_anim_dark.AnimBite |
| 46 | `RunTasks` | 93 | `task` | battle_dome.CB2_TourneyTree, battle_factory_screen.CB2_SelectScreen, battle_factory_screen.Swap_CB2 |
| 47 | `FreeAllSpritePalettes` | 91 | `sprite` | battle_dome.Task_ShowTourneyInfoCard, battle_dome.Task_ShowTourneyTree, battle_factory_screen.CB2_InitSelectScreen |
| 48 | `RemoveWindow` | 87 | `window` | apprentice.RemoveAndHideWindow, battle_interface.RemoveWindowOnHealthbox, battle_pyramid_bag.CloseMenuActionWindowById |
| 49 | `FreeSpritePaletteByTag` | 84 | `sprite` | battle_anim.Cmd_unloadspritegfx, battle_anim.Cmd_end, battle_anim_effects_1.AnimTask_DoubleTeam_Step |
| 50 | `FreeAllWindowBuffers` | 84 | `window` | battle_controller_player.SetLinkBattleEndCallbacks, battle_controller_player.OpenPartyMenuToChooseMon, battle_controller_player.OpenBagAndChooseItem |

## Top 50 helpers externes (= libc / hardware / macros — need TS bridge manuel)

| Rank | Name | Calls | Examples |
|------|------|-------|----------|
| 1 | `ARRAY_COUNT` | 499 | apprentice.ResetApprenticeStruct, apprentice.ResetAllApprenticeData, apprentice.SetApprenticeId |
| 2 | `GetMonData` | 485 | battle_ai_script_commands.Cmd_count_usable_party_mons, battle_ai_script_commands.Cmd_if_status_in_party, battle_ai_script_commands.Cmd_if_status_not_in_party |
| 3 | `StringCopy` | 309 | apprentice.ApprenticeBufferString, apprentice.SaveApprentice, battle_controller_player.MoveSelectionDisplayMoveNames |
| 4 | `PIXEL_FILL` | 272 | battle_dome.Task_HandleInfoCardInput, battle_factory_screen.Select_ErasePopupMenu, battle_factory_screen.Select_PrintRentalPkmnString |
| 5 | `BG_PLTT_ID` | 269 | battle_anim.MoveBattlerSpriteToBG, battle_anim.Task_UpdateMonBg, battle_anim.LoadMoveBg |
| 6 | `JOY_NEW` | 257 | apprentice.Task_ExecuteFuncAfterButtonPress, battle_controller_player.HandleInputChooseAction, battle_controller_player.HandleInputChooseTarget |
| 7 | `T1_READ_PTR` | 234 | battle_ai_script_commands.Cmd_if_random_less_than, battle_ai_script_commands.Cmd_if_random_greater_than, battle_ai_script_commands.Cmd_if_random_equal |
| 8 | `StringExpandPlaceholders` | 211 | apprentice.BufferApprenticeChallengeText, apprentice.PrintApprenticeMessage, battle_dome.DisplayMatchInfoOnCard |
| 9 | `GetSubstructPtr` | 208 | pokenav_conditions.GetConditionGraphMenuCallback, pokenav_conditions.HandleConditionMenuInput, pokenav_conditions.OpenMarkingsMenu |
| 10 | `ConvertIntToDecimalStringN` | 168 | apprentice.BufferApprenticeChallengeText, battle_controller_player.MoveSelectionDisplayPpNumber, battle_interface.UpdateLvlInHealthbox |
| 11 | `AllocZeroed` | 148 | apprentice.SetRandomQuestionData, apprentice.InitQuestionData, battle_anim_effects_2.AnimTask_LoadMusicNotesPals |
| 12 | `BLDALPHA_BLEND` | 128 | battle_anim_bug.AnimSpiderWeb, battle_anim_bug.AnimSpiderWeb_Step, battle_anim_dark.AnimTask_AttackerFadeToInvisible |
| 13 | `OBJ_PLTT_ID` | 100 | battle_anim.MoveBattlerSpriteToBG, battle_anim.Task_UpdateMonBg, battle_anim_effects_1.AnimTask_CycleMagicalLeafPal |
| 14 | `ScriptReadByte` | 98 | mystery_event_script.MEScrCmd_setstatus, mystery_event_script.MEScrCmd_setmsg, mystery_event_script.MEScrCmd_giveribbon |
| 15 | `CMD_ARGS` | 94 | battle_anim_bug.AnimMegahornHorn, battle_anim_bug.AnimLeechLifeNeedle, battle_anim_bug.AnimTranslateWebThread |
| 16 | `BATTLE_PARTNER` | 89 | battle_ai_script_commands.ChooseMoveOrAction_Doubles, battle_ai_script_commands.BattleAI_GetWantedBattler, battle_ai_script_commands.Cmd_count_usable_party_mons |
| 17 | `Alloc` | 74 | battle_factory_screen.CB2_InitSelectScreen, battle_factory_screen.CB2_InitSwapScreen, battle_main.CB2_PreInitMultiBattle |
| 18 | `CpuFill32` | 67 | battle_anim_mons.ClearBattleAnimBg, battle_anim_mons.AnimLoadCompressedBgGfx, battle_dome.Task_ShowTourneyInfoCard |
| 19 | `FREE_AND_SET_NULL` | 64 | apprentice.SetRandomQuestionData, apprentice.FreeQuestionData, battle_anim_effects_2.AnimTask_LoadMusicNotesPals |
| 20 | `CpuCopy16` | 64 | battle_bg.LoadBattleMenuWindowGfx, battle_factory_screen.CB2_InitSelectScreen, battle_factory_screen.CB2_InitSwapScreen |
| 21 | `MAP_NUM` | 62 | battle_pyramid.TrySetPyramidObjectEventPositionAtCoords, battle_setup.BattleSetup_GetEnvironmentId, braille_puzzles.ShouldDoBrailleDigEffect |
| 22 | `MAP_GROUP` | 59 | battle_pyramid.TrySetPyramidObjectEventPositionAtCoords, battle_setup.BattleSetup_GetEnvironmentId, braille_puzzles.ShouldDoBrailleDigEffect |
| 23 | `CpuFill16` | 54 | AgbRfu_LinkManager.rfu_LMAN_initializeManager, AgbRfu_LinkManager.rfu_LMAN_endManager, battle_anim.MoveBattlerSpriteToBG |
| 24 | `PLTT_SIZEOF` | 53 | battle_anim_effects_1.AnimLockOnTarget_Step4, battle_anim_utility_funcs.AnimTask_DrawFallingWhiteLinesOnAttacker, battle_bg.LoadBattleMenuWindowGfx |
| 25 | `GetBoxMonData` | 51 | battle_factory.SetRentalsToOpponentParty, battle_factory_screen.Select_CopyMonsToPlayerParty, battle_factory_screen.CopySwappedMonData |
| 26 | `CpuCopy32` | 50 | battle_anim.MoveBattlerSpriteToBG, battle_anim.Task_UpdateMonBg, battle_anim_effects_3.AnimTask_TransformMon |
| 27 | `BG_SCREEN_ADDR` | 44 | battle_anim.MoveBattlerSpriteToBG, battle_anim.LoadMoveBg, battle_bg.DrawMainBattleBackground |
| 28 | `LZ77UnCompWram` | 43 | berry_crush.CopyPlayerNameWindowGfxToBg, bg.CopyToBgTilemapBuffer, decompress.LZDecompressWram |
| 29 | `GetVarPointer` | 42 | battle_setup.CB2_GiveStarter, clock.UpdatePerDay, event_data.DisableNationalPokedex |
| 30 | `LZ77UnCompVram` | 41 | battle_transition.Aqua_Init, battle_transition.Magma_Init, battle_transition.Aqua_SetGfx |
| 31 | `GetFaceDirectionMovementAction` | 41 | event_object_movement.MovementType_WanderAround_Step1, event_object_movement.MovementType_LookAround_Step1, event_object_movement.MovementType_WanderUpAndDown_Step1 |
| 32 | `DecompressAndCopyTileDataToVram` | 39 | battle_pyramid_bag.LoadPyramidBagGfx, berry_crush.ShowGameDisplay, berry_tag_screen.LoadBerryTagGfx |
| 33 | `T1_READ_16` | 35 | battle_ai_script_commands.Cmd_if_move, battle_ai_script_commands.Cmd_if_not_move, battle_anim.Cmd_loadspritegfx |
| 34 | `JOY_REPEAT` | 35 | battle_controller_player.HandleInputChooseAction, battle_factory_screen.Select_Task_HandleYesNo, battle_factory_screen.Select_Task_HandleMenu |
| 35 | `T2_READ_PTR` | 34 | battle_anim.Cmd_call, battle_anim.Cmd_choosetwoturnanim, battle_anim.Cmd_jumpifmoveturn |
| 36 | `WIN_RANGE` | 34 | battle_anim_effects_2.AnimTask_FakeOut_Step1, battle_anim_effects_3.AnimTask_CreateSpotlight, battle_anim_ghost.AnimTask_CurseStretchingBlackBg |
| 37 | `StringAppend` | 34 | battle_dome.DisplayTrainerInfoOnCard, battle_interface.UpdateNickInHealthbox, battle_message.BattleStringExpandPlaceholders |
| 38 | `BGCNT_PRIORITY` | 32 | battle_dome.Task_ShowTourneyTree, battle_intro.BattleIntroSlide1, battle_intro.BattleIntroSlide2 |
| 39 | `JOY_HELD` | 30 | battle_controller_player.HandleInputChooseTarget, battle_controller_player.HandleInputChooseMove, battle_main.BattleMainCB2 |
| 40 | `SWAP` | 29 | apprentice.ShuffleApprenticeSpecies, apprentice.SetRandomQuestionData, battle_anim.FlipBattlerBgTiles |
| 41 | `BGCNT_SCREENBASE` | 29 | battle_dome.Task_ShowTourneyTree, battle_intro.BattleIntroSlide1, battle_intro.BattleIntroSlide2 |
| 42 | `GetMonNickname` | 29 | battle_script_commands.DrawLevelUpBannerText, fldeff_softboiled.Task_DisplayHPRestoredMessage, fldeff_strength.FldEff_UseStrength |
| 43 | `GetObjectEventGraphicsInfo` | 29 | event_object_movement.RemoveObjectEventInternal, event_object_movement.TrySetupObjectEventSprite, event_object_movement.TrySpawnObjectEventTemplate |
| 44 | `BGCNT_CHARBASE` | 28 | battle_dome.Task_ShowTourneyTree, battle_intro.BattleIntroSlide1, battle_intro.BattleIntroSlide2 |
| 45 | `BG_CHAR_ADDR` | 27 | battle_anim.LoadMoveBg, battle_bg.DrawMainBattleBackground, battle_bg.LoadBattleTextboxAndBackground |
| 46 | `TILE_OFFSET_4BPP` | 26 | field_door.CopyDoorTilesToVram, tileset_anims.QueueAnimTiles_General_Flower, tileset_anims.QueueAnimTiles_General_Water |
| 47 | `AllocSubstruct` | 26 | pokenav_conditions.PokenavCallback_Init_ConditionGraph_Party, pokenav_conditions.PokenavCallback_Init_ConditionGraph_Search, pokenav_conditions.InitPartyConditionListParameters |
| 48 | `BATTLE_OPPOSITE` | 25 | battle_ai_script_commands.BattleAI_SetupAIData, battle_ai_switch_items.ShouldSwitchIfWonderGuard, battle_ai_switch_items.HasSuperEffectiveMoveAgainstOpponents |
| 49 | `DmaStop` | 25 | battle_transition.WeatherDuo_End, battle_transition.PatternWeave_CircularMask, battle_transition.VBlankCB_SetWinAndBlend |
| 50 | `GetBgTilemapBuffer` | 25 | berry_tag_screen.AddBerryTagTextToBg0, contest_painting.CB2_QuitContestPainting, credits.FreeCreditsBgsAndWindows |

## Notes

- **Helpers internes** : sont auto-portés via `transpile-decomp-all.mjs`. Pour qu'ils
  fonctionnent à runtime, il faut juste les importer + résoudre leurs propres callsTo.
- **Helpers externes** : doivent être manuellement implémentés ou bridged. Beaucoup
  sont déjà dans `decomp-globals.ts` / `decomp-helpers.ts` (= LoadPalette, CpuFastFill,
  PlaySE, etc.). À auditer.
- **Fonctions inused** : entry points (= scripts pointers, callbacks) appelées par le
  runtime sans appel direct dans le code C. Probablement légitimes.

## Workflow recommandé pour activer un module auto-porté

1. Identifier le module cible (= e.g. `event_object_movement-all-auto.ts`).
2. Lister ses callsTo non-résolus (= ceux dans helpers externes manquants).
3. Pour chaque helper manquant :
   a. Si déjà dans `decomp-globals.ts` ou similaire → `import` direct.
   b. Sinon, écrire un stub minimal compatible avec le runtime.
4. Importer le module dans le runtime et tester.

Cf. `memory/audit-2026-05-09-total-1to1.md` pour les violations 1:1 connues.