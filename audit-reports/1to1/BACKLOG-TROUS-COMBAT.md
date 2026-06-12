# BACKLOG-TROUS-COMBAT — audit miroir par SYMBOLE (généré 2026-06-12)

> Signal : nom de fonction C jamais mentionné dans src/ manuel (hors decomp-data).
> Deux familles : VRAIS trous (à porter) et FAUX trous (statics TS renommés — à
> RE-NOMMER au nom C exact pour l'alignement miroir strict).
**TOTAL : 743 fonctions à traiter (vrais trous + renommages)**
> MAJ 2026-06-12 soir : battle_main.c SOLDÉ (commit a8c2e914), level-up banner/box
> SOLDÉ (commit 0be2e866). + 3 bugs user fixés (af4edffb).

## battle_main.c — SOLDÉ ✅ (commit a8c2e914)
- [x] BattleIntroSkipRecordMonsToDex  @ L3705-3710 — UNUSED décomp, dette documentée (non porté volontairement)
- [x] BattleIntroSwitchInPlayerMons  @ L3820-3840 — UNUSED décomp, dette documentée
- [x] RunBattleScriptCommands  @ L5266-5271 — porté 1:1 + BattleScriptPushCursorAndCallback (battle_util.c:3192)

## battle_util.c — 45/52 fonctions couvertes (87%) · cite:36 + symbole:9 · 191 citations
- [ ] HandleAction_SafariZoneBallThrow  @ L550-560
- [ ] HandleAction_ThrowPokeblock  @ L561-589
- [ ] HandleAction_GoNear  @ L590-616
- [ ] HandleAction_SafariZoneRun  @ L617-624
- [ ] HandleAction_WallyBallThrow  @ L625-637
- [ ] MarkAllBattlersForControllerExec  @ L830-845
- [ ] MarkBattlerReceivedLinkData  @ L854-863

## battle_script_commands.c — 287/287 ✅ hors Unused (commits a8c2e914 + 0be2e866)
- [ ] Unused_ApplyRandomDmgMultiplier  @ L1653-1657 (unused décomp — en bas de pile)
- [x] Cmd_waitstate  @ L3930-3935 — 1:1 réel (était stub « avance toujours ») + Cmd_pause aussi
- [x] InitLevelUpBanner  @ L6044-6056 — porté entier (+ SlideIn/Out)
- [x] DrawLevelUpBannerText  @ L6075-6135 — porté (dette : couleurs genre, glyphe Niv)
- [x] PutMonIconOnLvlUpBanner  @ L6152-6178 — porté (sheet+pal par TAG 55130)
- [x] SpriteCB_MonIconOnLvlUpBanner  @ L6179-6197 — porté (suit BG2_X, auto-free)
> BONUS découvert par l'A/B : le level-up ne recalculait JAMAIS les stats party
> (SetMonData(LEVEL) sans CalculateMonStats) → fixé 1:1 + copie gBattleMons
> complète (:3469-3498) + capture beforeLvlUp (:3436). Commit 0be2e866.

## battle_setup.c — T-A FAITE ✅ (commit 4491dad2 : miroir src/game/battle_setup.ts) — reste T-B/T-C
- [ ] BattleSetup_StartBattlePikeWildBattle  @ L397-401
- [ ] BattleSetup_StartRoamerBattle  @ L421-434
- [ ] DoSafariBattle  @ L435-444
- [ ] DoBattlePikeWildBattle  @ L445-458
- [ ] DoBattlePyramidTrainerHillBattle  @ L467-479
- [ ] GetSpecialBattleTransition  @ L864-910
- [x] TrainerBattleLoadArg32 (T-A 4491dad2) @ L969-973
- [x] TrainerBattleLoadArg16 (T-A 4491dad2) @ L974-978
- [x] TrainerBattleLoadArg8 (T-A 4491dad2) @ L979-983
- [x] GetTrainerBFlag (T-A 4491dad2) @ L989-993
- [x] IsPlayerDefeated (T-A 4491dad2) @ L994-1011
- [x] ResetTrainerOpponentIds (T-A 4491dad2) @ L1012-1017
- [x] InitTrainerBattleVariables (T-A 4491dad2) @ L1018-1038
- [x] SetU8 (T-A 4491dad2) @ L1039-1043
- [x] SetU16 (T-A 4491dad2) @ L1044-1048
- [x] SetU32 (T-A 4491dad2) @ L1049-1053
- [x] SetPtr (T-A 4491dad2) @ L1054-1058
- [x] SetMapVarsToTrainer (T-A 4491dad2) @ L1094-1102
- [ ] ConfigureTwoTrainersBattle  @ L1202-1208
- [ ] SetUpTwoTrainersBattle  @ L1209-1214
- [ ] GetTrainerFlagFromScriptPointer  @ L1215-1223
- [x] SetBattledTrainerFlag (T-A 4491dad2) @ L1252-1256
- [x] HasTrainerBeenFought (T-A 4491dad2) @ L1257-1261
- [x] SetTrainerFlag (T-A 4491dad2) @ L1262-1266
- [x] ClearTrainerFlag (T-A 4491dad2) @ L1267-1271
- [ ] CB2_EndRematchBattle  @ L1351-1369
- [x] BattleSetup_GetScriptAddrAfterBattle (T-A 4491dad2) @ L1404-1411
- [x] BattleSetup_GetTrainerPostBattleScript (T-A 4491dad2) @ L1412-1434
- [ ] ReturnEmptyStringIfNull  @ L1501-1508
- [x] GetTrainerWonSpeech (T-A 4491dad2) @ L1536-1540
- [ ] FirstBattleTrainerIdToRematchTableId  @ L1546-1558
- [ ] TrainerIdToRematchTableId  @ L1559-1577
- [ ] IsRematchForbidden  @ L1578-1587
- [ ] SetRematchIdForTrainer  @ L1588-1604
- [ ] UpdateRandomTrainerRematches  @ L1605-1630
- [ ] UpdateRematchIfDefeated  @ L1631-1636
- [ ] DoesSomeoneWantRematchIn_  @ L1637-1649
- [ ] IsRematchTrainerIn_  @ L1650-1662
- [ ] IsTrainerReadyForRematch_  @ L1677-1690
- [ ] GetRematchTrainerIdFromTable  @ L1691-1711
- [ ] GetLastBeatenRematchTrainerIdFromTable  @ L1712-1732
- [ ] ClearTrainerWantRematchState  @ L1733-1740
- [ ] GetTrainerMatchCallFlag  @ L1741-1753
- [ ] RegisterTrainerInMatchCall  @ L1754-1763
- [ ] HasAtLeastFiveBadges  @ L1776-1793
- [ ] IsRematchStepCounterMaxed  @ L1805-1812
- [ ] TryUpdateRandomTrainerRematches  @ L1813-1818
- [ ] DoesSomeoneWantRematchIn  @ L1819-1823
- [ ] IsRematchTrainerIn  @ L1824-1828
- [ ] GetRematchTrainerId  @ L1829-1833
- [ ] GetLastBeatenRematchTrainerId  @ L1834-1838
- [ ] HandleRematchVarsOnBattleEnd  @ L1852-1857
- [ ] CountBattledRematchTeams  @ L1873-1890

## battle_controllers.c — 64/68 fonctions couvertes (94%) · cite:58 + symbole:6 · 96 citations
- [ ] CreateTasksForSendRecvLinkBuffers  @ L701-733
- [ ] Task_HandleSendLinkBuffersData  @ L775-870
- [ ] TryReceiveLinkBattleData  @ L871-908
- [ ] Task_HandleCopyReceivedLinkBuffersData  @ L909-967

## battle_controller_player.c — 111/124 fonctions couvertes (90%) · cite:49 + symbole:62 · 89 citations
- [ ] CompleteOnBankSpritePosX_0  @ L227-232
- [ ] UnusedEndBounceEffect  @ L332-338
- [ ] HandleMoveInputUnused  @ L617-666
- [ ] SetLinkBattleEndCallbacks  @ L851-881
- [ ] SwitchIn_CleanShinyAnimShowSubstitute  @ L1065-1086
- [ ] SwitchIn_HandleSoundAndEnd  @ L1087-1097
- [ ] Task_PlayerController_RestoreBgmAfterCry  @ L1117-1125
- [ ] Task_GiveExpWithExpBar  @ L1219-1270
- [ ] Task_LaunchLvlUpAnim  @ L1271-1282
- [ ] Task_UpdateLvlInHealthbox  @ L1283-1301
- [ ] DestroyExpTaskAndCompleteOnInactiveTextPrinter  @ L1302-1313
- [x] FreeMonSpriteAfterSwitchOutAnim  @ L1328-1338 — porté 1:1 commit 02fcd96c (battle_controller_player.ts, + DoSwitchOutAnimation 2244-2264 + PlayerHandleReturnMonToBall 2227-2242 ; A/B switch réel : shrink rendu + specialAnimActive 0→1→0)
- [ ] CompleteOnFinishedBattleAnimation  @ L1566-1571

## battle_controller_opponent.c — 83/88 fonctions couvertes (94%) · cite:21 + symbole:62 · 52 citations
- [x] FreeMonSpriteAfterSwitchOutAnim  @ L422-433 — porté 1:1 commit 02fcd96c (battle_controller_opponent.ts _FreeMonSpriteAfterSwitchOutAnimOpp + _DoSwitchOutAnimationOpp 1217-1236 ; symétrique strict du player A/B-validé — IA switch non scriptable → A/B user à l'œil)
- [ ] SwitchIn_ShowSubstitute  @ L459-468
- [ ] SwitchIn_HandleSoundAndEnd  @ L469-481
- [ ] SwitchIn_ShowHealthbox  @ L482-499
- [ ] CompleteOnFinishedBattleAnimation  @ L521-526

## battle_controller_wally.c — 14/82 fonctions couvertes (17%) · cite:0 + symbole:14 · 5 citations
- [ ] SpriteCB_Null7  @ L164-167
- [ ] WallyBufferRunCommand  @ L177-187
- [ ] WallyHandleActions  @ L188-247
- [ ] CompleteOnFinishedAnimation  @ L260-265
- [ ] OpenBagAfterPaletteFade  @ L266-276
- [ ] CompleteOnChosenItem  @ L277-285
- [ ] CompleteOnFinishedBattleAnimation  @ L398-403
- [ ] WallyBufferExecCompleted  @ L404-419
- [ ] WallyHandleGetMonData  @ L426-450
- [ ] CopyWallyMonData  @ L451-756
- [ ] WallyHandleGetRawMonData  @ L757-761
- [ ] WallyHandleSetMonData  @ L762-783
- [ ] SetWallyMonData  @ L784-1001
- [ ] WallyHandleSetRawMonData  @ L1002-1006
- [ ] WallyHandleLoadMonSprite  @ L1007-1011
- [ ] WallyHandleSwitchInAnim  @ L1012-1016
- [ ] WallyHandleReturnMonToBall  @ L1017-1034
- [ ] WallyHandleDrawTrainerPic  @ L1035-1049
- [ ] WallyHandleTrainerSlide  @ L1050-1066
- [ ] WallyHandleTrainerSlideBack  @ L1067-1071
- [ ] WallyHandleFaintAnimation  @ L1072-1076
- [ ] WallyHandlePaletteFade  @ L1077-1081
- [ ] WallyHandleSuccessBallThrowAnim  @ L1082-1089
- [ ] WallyHandleBallThrowAnim  @ L1090-1099
- [ ] WallyHandlePause  @ L1100-1104
- [ ] WallyHandleMoveAnimation  @ L1105-1127
- [ ] WallyDoMoveAnimation  @ L1128-1172
- [ ] WallyHandlePrintString  @ L1173-1184
- [ ] WallyHandlePrintSelectionString  @ L1185-1192
- [ ] WallyHandleChooseAction  @ L1203-1217
- [ ] WallyHandleYesNoBox  @ L1218-1222
- [ ] WallyHandleChooseMove  @ L1223-1250
- [ ] WallyHandleChooseItem  @ L1251-1257
- [ ] WallyHandleChoosePokemon  @ L1258-1262
- [ ] WallyHandleCmd23  @ L1263-1267
- [ ] WallyHandleHealthBarUpdate  @ L1268-1292
- [ ] WallyHandleExpUpdate  @ L1293-1297
- [ ] WallyHandleStatusIconUpdate  @ L1298-1302
- [ ] WallyHandleStatusAnimation  @ L1303-1307
- [ ] WallyHandleStatusXor  @ L1308-1312
- [ ] WallyHandleDataTransfer  @ L1313-1317
- [ ] WallyHandleDMA3Transfer  @ L1318-1322
- [ ] WallyHandlePlayBGM  @ L1323-1327
- [ ] WallyHandleCmd32  @ L1328-1332
- [ ] WallyHandleTwoReturnValues  @ L1333-1337
- [ ] WallyHandleChosenMonReturnValue  @ L1338-1342
- [ ] WallyHandleOneReturnValue  @ L1343-1347
- [ ] WallyHandleOneReturnValue_Duplicate  @ L1348-1352
- [ ] WallyHandleClearUnkVar  @ L1353-1357
- [ ] WallyHandleSetUnkVar  @ L1358-1362
- [ ] WallyHandleClearUnkFlag  @ L1363-1367
- [ ] WallyHandleToggleUnkFlag  @ L1368-1372
- [ ] WallyHandleHitAnimation  @ L1373-1387
- [ ] WallyHandleCantSwitch  @ L1388-1392
- [ ] WallyHandlePlaySE  @ L1393-1398
- [ ] WallyHandlePlayFanfareOrBGM  @ L1399-1413
- [ ] WallyHandleFaintingCry  @ L1414-1423
- [ ] WallyHandleIntroSlide  @ L1424-1430
- [ ] WallyHandleIntroTrainerBallThrow  @ L1431-1460
- [ ] WallyHandleDrawPartyStatusSummary  @ L1507-1520
- [ ] WallyHandleHidePartyStatusSummary  @ L1521-1525
- [ ] WallyHandleEndBounceEffect  @ L1526-1530
- [ ] WallyHandleSpriteInvisibility  @ L1531-1535
- [ ] WallyHandleBattleAnimation  @ L1536-1546
- [ ] WallyHandleLinkStandbyMsg  @ L1547-1551
- [ ] WallyHandleResetActionMoveSelection  @ L1552-1556
- [ ] WallyHandleEndLinkBattle  @ L1557-1567
- [ ] WallyCmdEnd  @ L1568-1571

## battle_controller_safari.c — 8/73 fonctions couvertes (11%) · cite:0 + symbole:8 · 2 citations
- [ ] SpriteCB_Null4  @ L150-153
- [ ] SafariBufferRunCommand  @ L159-169
- [ ] CompleteOnHealthboxSpriteCallbackDummy  @ L247-252
- [ ] SafariSetBattleEndCallbacks  @ L253-262
- [ ] SafariOpenPokeblockCase  @ L269-278
- [ ] CompleteWhenChosePokeblock  @ L279-287
- [ ] CompleteOnFinishedBattleAnimation  @ L288-293
- [ ] SafariBufferExecCompleted  @ L294-309
- [ ] SafariHandleGetMonData  @ L316-320
- [ ] SafariHandleGetRawMonData  @ L321-325
- [ ] SafariHandleSetMonData  @ L326-330
- [ ] SafariHandleSetRawMonData  @ L331-335
- [ ] SafariHandleLoadMonSprite  @ L336-340
- [ ] SafariHandleSwitchInAnim  @ L341-345
- [ ] SafariHandleReturnMonToBall  @ L346-352
- [ ] SafariHandleDrawTrainerPic  @ L353-370
- [ ] SafariHandleTrainerSlide  @ L371-375
- [ ] SafariHandleTrainerSlideBack  @ L376-380
- [ ] SafariHandleFaintAnimation  @ L381-385
- [ ] SafariHandlePaletteFade  @ L386-390
- [ ] SafariHandleSuccessBallThrowAnim  @ L391-398
- [ ] SafariHandleBallThrowAnim  @ L399-408
- [ ] SafariHandlePause  @ L409-413
- [ ] SafariHandleMoveAnimation  @ L414-418
- [ ] SafariHandlePrintString  @ L419-430
- [ ] SafariHandlePrintSelectionString  @ L431-438
- [ ] SafariHandleChooseAction  @ L449-463
- [ ] SafariHandleYesNoBox  @ L464-468
- [ ] SafariHandleChooseMove  @ L469-473
- [ ] SafariHandleChooseItem  @ L474-480
- [ ] SafariHandleChoosePokemon  @ L481-485
- [ ] SafariHandleCmd23  @ L486-490
- [ ] SafariHandleHealthBarUpdate  @ L491-495
- [ ] SafariHandleExpUpdate  @ L496-500
- [ ] SafariHandleStatusIconUpdate  @ L501-506
- [ ] SafariHandleStatusAnimation  @ L507-511
- [ ] SafariHandleStatusXor  @ L512-516
- [ ] SafariHandleDataTransfer  @ L517-521
- [ ] SafariHandleDMA3Transfer  @ L522-526
- [ ] SafariHandlePlayBGM  @ L527-531
- [ ] SafariHandleCmd32  @ L532-536
- [ ] SafariHandleTwoReturnValues  @ L537-541
- [ ] SafariHandleChosenMonReturnValue  @ L542-546
- [ ] SafariHandleOneReturnValue  @ L547-551
- [ ] SafariHandleOneReturnValue_Duplicate  @ L552-556
- [ ] SafariHandleClearUnkVar  @ L557-561
- [ ] SafariHandleSetUnkVar  @ L562-566
- [ ] SafariHandleClearUnkFlag  @ L567-571
- [ ] SafariHandleToggleUnkFlag  @ L572-576
- [ ] SafariHandleHitAnimation  @ L577-581
- [ ] SafariHandleCantSwitch  @ L582-586
- [ ] SafariHandlePlaySE  @ L587-599
- [ ] SafariHandlePlayFanfareOrBGM  @ L600-614
- [ ] SafariHandleFaintingCry  @ L615-622
- [ ] SafariHandleIntroSlide  @ L623-629
- [ ] SafariHandleIntroTrainerBallThrow  @ L630-637
- [ ] SafariHandleDrawPartyStatusSummary  @ L638-642
- [ ] SafariHandleHidePartyStatusSummary  @ L643-647
- [ ] SafariHandleEndBounceEffect  @ L648-652
- [ ] SafariHandleSpriteInvisibility  @ L653-657
- [ ] SafariHandleBattleAnimation  @ L658-668
- [ ] SafariHandleLinkStandbyMsg  @ L669-673
- [ ] SafariHandleResetActionMoveSelection  @ L674-678
- [ ] SafariHandleEndLinkBattle  @ L679-688
- [ ] SafariCmdEnd  @ L689-692

## battle_interface.c — 42/53 fonctions couvertes (79%) · cite:36 + symbole:6 · 85 citations
- [ ] DummiedOutFunction  @ L770-774
- [ ] Debug_DrawNumber  @ L775-843
- [ ] Debug_DrawNumberPair  @ L844-868
- [ ] CreateSafariPlayerHealthboxSprites  @ L953-972
- [ ] UpdateHpTextInHealthboxInDoubles  @ L1216-1311
- [ ] PrintSafariMonInfo  @ L1312-1375
- [ ] GetStatusIconForBattlerId  @ L2074-2133
- [ ] UpdateSafariBallsTextOnHealthbox  @ L2134-2145
- [ ] UpdateLeftNoOfBallsTextOnHealthbox  @ L2146-2162
- [ ] Debug_TestHealthBar  @ L2462-2481
- [ ] Debug_TestHealthBar_Helper  @ L2482-2496

## battle_gfx_sfx_util.c — 49/53 fonctions couvertes (92%) · cite:9 + symbole:40 · 34 citations
- [x] Task_ClearBitWhenSpecialAnimDone  @ L535-547 — porté 1:1 commit 02fcd96c (battle_gfx_sfx_util.ts, avec InitAndLaunchSpecialAnimation :523-533 ; tick anim + clear specialAnimActive, A/B switch réel)
- [ ] BattleGfxSfxDummy1  @ L693-696
- [ ] BattleGfxSfxDummy2  @ L697-700
- [ ] BattleGfxSfxDummy3  @ L728-731

## battle_message.c — 9/10 fonctions couvertes (90%) · cite:8 + symbole:1 · 69 citations
- [ ] ChooseMoveUsedParticle  @ L2959-2998

## battle_transition.c — 27/210 fonctions couvertes (13%) · cite:23 + symbole:4 · 58 citations
- [ ] CB2_TestBattleTransition  @ L997-1019
- [ ] TestBattleTransition  @ L1020-1025
- [ ] BattleTransition_StartOnField  @ L1026-1031
- [ ] BattleTransition_Start  @ L1032-1040
- [ ] LaunchBattleTransitionTask  @ L1056-1062
- [ ] Transition_StartIntro  @ L1068-1084
- [ ] Transition_WaitForIntro  @ L1085-1097
- [ ] Transition_StartMain  @ L1098-1104
- [ ] Transition_WaitForMain  @ L1105-1115
- [ ] Task_Intro  @ L1116-1135
- [ ] Task_Blur  @ L1136-1140
- [ ] Blur_Init  @ L1141-1150
- [ ] Blur_Main  @ L1151-1168
- [ ] Blur_End  @ L1169-1188
- [ ] Task_Swirl  @ L1189-1193
- [ ] Swirl_Init  @ L1194-1209
- [ ] Swirl_End  @ L1210-1227
- [ ] VBlankCB_Swirl  @ L1228-1234
- [ ] HBlankCB_Swirl  @ L1235-1252
- [ ] Task_Shuffle  @ L1253-1257
- [ ] Shuffle_Init  @ L1258-1274
- [ ] Shuffle_End  @ L1275-1298
- [ ] VBlankCB_Shuffle  @ L1299-1305
- [ ] HBlankCB_Shuffle  @ L1306-1339
- [ ] Task_BigPokeball  @ L1340-1344
- [ ] Task_Aqua  @ L1345-1349
- [ ] Task_Magma  @ L1350-1354
- [ ] Task_Regice  @ L1355-1359
- [ ] Task_Registeel  @ L1360-1364
- [ ] Task_Regirock  @ L1365-1369
- [ ] Task_Kyogre  @ L1370-1374
- [ ] InitPatternWeaveTransition  @ L1375-1398
- [ ] Aqua_Init  @ L1399-1413
- [ ] Magma_Init  @ L1414-1428
- [ ] Regi_Init  @ L1429-1442
- [ ] BigPokeball_Init  @ L1443-1456
- [ ] BigPokeball_SetGfx  @ L1457-1476
- [ ] Aqua_SetGfx  @ L1477-1488
- [ ] Magma_SetGfx  @ L1489-1500
- [ ] Regice_SetGfx  @ L1501-1513
- [ ] Registeel_SetGfx  @ L1514-1526
- [ ] Regirock_SetGfx  @ L1527-1541
- [ ] Kyogre_Init  @ L1542-1554
- [ ] Kyogre_PaletteFlash  @ L1555-1571
- [ ] Kyogre_PaletteBrighten  @ L1572-1588
- [ ] WeatherDuo_FadeOut  @ L1589-1595
- [ ] WeatherDuo_End  @ L1596-1611
- [ ] PatternWeave_Blend1  @ L1612-1631
- [ ] PatternWeave_Blend2  @ L1632-1651
- [ ] PatternWeave_FinishAppear  @ L1652-1671
- [ ] FramesCountdown  @ L1672-1678
- [ ] WeatherTrio_BgFadeBlack  @ L1679-1685
- [ ] WeatherTrio_WaitFade  @ L1686-1693
- [ ] PatternWeave_CircularMask  @ L1694-1724
- [ ] VBlankCB_SetWinAndBlend  @ L1725-1737
- [ ] VBlankCB_PatternWeave  @ L1738-1743
- [ ] VBlankCB_CircularMask  @ L1744-1765
- [ ] Task_PokeballsTrail  @ L1766-1770
- [ ] PokeballsTrail_Init  @ L1771-1783
- [ ] PokeballsTrail_Main  @ L1784-1808
- [ ] PokeballsTrail_End  @ L1809-1818
- [ ] FldEff_PokeballTrail  @ L1819-1831
- [ ] SpriteCB_FldEffPokeballTrail  @ L1832-1878
- [ ] Task_ClockwiseWipe  @ L1879-1883
- [ ] ClockwiseWipe_Init  @ L1884-1905
- [ ] ClockwiseWipe_TopRight  @ L1906-1930
- [ ] ClockwiseWipe_Right  @ L1931-1966
- [ ] ClockwiseWipe_Bottom  @ L1967-1987
- [ ] ClockwiseWipe_Left  @ L1988-2025
- [ ] ClockwiseWipe_TopLeft  @ L2026-2047
- [ ] ClockwiseWipe_End  @ L2048-2055
- [ ] VBlankCB_ClockwiseWipe  @ L2056-2077
- [ ] Task_Ripple  @ L2078-2082
- [ ] Ripple_Init  @ L2083-2101
- [ ] Ripple_Main  @ L2102-2135
- [ ] VBlankCB_Ripple  @ L2136-2142
- [ ] HBlankCB_Ripple  @ L2143-2162
- [ ] Task_Wave  @ L2163-2167
- [ ] Wave_Init  @ L2168-2188
- [ ] Wave_Main  @ L2189-2218
- [ ] Wave_End  @ L2219-2226
- [ ] VBlankCB_Wave  @ L2227-2265
- [ ] Task_Sidney  @ L2266-2271
- [ ] Task_Phoebe  @ L2272-2277
- [ ] Task_Glacia  @ L2278-2283
- [ ] Task_Drake  @ L2284-2289
- [ ] Task_Champion  @ L2290-2295
- [ ] DoMugshotTransition  @ L2296-2300
- [ ] Mugshot_Init  @ L2301-2324
- [ ] Mugshot_SetGfx  @ L2325-2349
- [ ] Mugshot_ShowBanner  @ L2350-2403
- [ ] Mugshot_StartOpponentSlide  @ L2404-2435
- [ ] Mugshot_WaitStartPlayerSlide  @ L2436-2449
- [ ] Mugshot_WaitPlayerSlide  @ L2450-2472
- [ ] Mugshot_GradualWhiteFade  @ L2473-2517
- [ ] Mugshot_InitFadeWhiteToBlack  @ L2518-2528
- [ ] Mugshot_FadeToBlack  @ L2529-2541
- [ ] Mugshot_End  @ L2542-2549
- [ ] VBlankCB_Mugshots  @ L2550-2562
- [ ] VBlankCB_MugshotsFadeOut  @ L2563-2572
- [ ] HBlankCB_Mugshots  @ L2573-2580
- [ ] Mugshots_CreateTrainerPics  @ L2581-2619
- [ ] SpriteCB_MugshotTrainerPic  @ L2620-2625
- [ ] MugshotTrainerPic_Pause  @ L2626-2630
- [ ] MugshotTrainerPic_Init  @ L2631-2644
- [ ] MugshotTrainerPic_Slide  @ L2645-2656
- [ ] MugshotTrainerPic_SlideSlow  @ L2657-2676
- [ ] MugshotTrainerPic_SlideOffscreen  @ L2677-2685
- [ ] SetTrainerPicSlideDirection  @ L2686-2690
- [ ] IncrementTrainerPicState  @ L2691-2695
- [ ] Task_ShredSplit  @ L2842-2846
- [ ] ShredSplit_Init  @ L2847-2881
- [ ] ShredSplit_Main  @ L2882-2993
- [ ] ShredSplit_BrokenCheck  @ L2994-3011
- [ ] ShredSplit_End  @ L3012-3034
- [ ] Task_Blackhole  @ L3035-3039
- [ ] Task_BlackholePulsate  @ L3040-3045
- [ ] Blackhole_Init  @ L3046-3070
- [ ] Blackhole_GrowEnd  @ L3071-3102
- [ ] Blackhole_Vibrate  @ L3103-3124
- [ ] BlackholePulsate_Main  @ L3125-3185
- [ ] Task_RectangularSpiral  @ L3186-3190
- [ ] RectangularSpiral_Init  @ L3191-3234
- [ ] RectangularSpiral_Main  @ L3235-3274
- [ ] RectangularSpiral_End  @ L3275-3283
- [ ] UpdateRectangularSpiralLine  @ L3284-3370
- [ ] Task_Groudon  @ L3371-3375
- [ ] Groudon_Init  @ L3376-3389
- [ ] Groudon_PaletteFlash  @ L3390-3405
- [ ] Groudon_PaletteBrighten  @ L3406-3433
- [ ] Task_Rayquaza  @ L3434-3438
- [ ] Rayquaza_Init  @ L3439-3465
- [ ] Rayquaza_SetGfx  @ L3466-3475
- [ ] Rayquaza_PaletteFlash  @ L3476-3492
- [ ] Rayquaza_FadeToBlack  @ L3493-3504
- [ ] Rayquaza_WaitFade  @ L3505-3514
- [ ] Rayquaza_SetBlack  @ L3515-3523
- [ ] Rayquaza_TriRing  @ L3524-3553
- [ ] Task_GridSquares  @ L3769-3773
- [ ] GridSquares_Init  @ L3774-3786
- [ ] GridSquares_Main  @ L3787-3807
- [ ] GridSquares_End  @ L3808-3828
- [ ] Task_AngledWipes  @ L3829-3833
- [ ] AngledWipes_Init  @ L3834-3854
- [ ] AngledWipes_SetWipeData  @ L3855-3867
- [ ] AngledWipes_DoWipe  @ L3868-3907
- [ ] AngledWipes_TryEnd  @ L3908-3926
- [ ] AngledWipes_StartNext  @ L3927-3938
- [ ] VBlankCB_AngledWipes  @ L3939-3967
- [ ] IsIntroTaskDone  @ L3979-3986
- [ ] GetBg0TilemapDst  @ L4063-4069
- [ ] GetBg0TilesDst  @ L4070-4081
- [ ] SetSinWave  @ L4087-4093
- [ ] SetCircularMask  @ L4094-4145
- [ ] InitBlackWipe  @ L4146-4172
- [ ] UpdateBlackWipe  @ L4173-4239
- [ ] FrontierLogoWiggle_Init  @ L4240-4253
- [ ] FrontierLogoWiggle_SetGfx  @ L4254-4265
- [ ] Task_FrontierLogoWiggle  @ L4266-4285
- [ ] Task_FrontierLogoWave  @ L4286-4290
- [ ] FrontierLogoWave_Init  @ L4291-4316
- [ ] FrontierLogoWave_SetGfx  @ L4317-4327
- [ ] FrontierLogoWave_InitScanline  @ L4328-4342
- [ ] FrontierLogoWave_Main  @ L4343-4397
- [ ] VBlankCB_FrontierLogoWave  @ L4398-4407
- [ ] HBlankCB_FrontierLogoWave  @ L4408-4433
- [ ] Task_FrontierSquares  @ L4434-4438
- [ ] Task_FrontierSquaresSpiral  @ L4439-4443
- [ ] Task_FrontierSquaresScroll  @ L4444-4448
- [ ] FrontierSquares_Init  @ L4449-4470
- [ ] FrontierSquares_Draw  @ L4471-4492
- [ ] FrontierSquares_Shrink  @ L4493-4543
- [ ] FrontierSquaresSpiral_Init  @ L4544-4565
- [ ] FrontierSquaresSpiral_Outward  @ L4566-4584
- [ ] FrontierSquaresSpiral_SetBlack  @ L4585-4597
- [ ] FrontierSquaresSpiral_Inward  @ L4598-4631
- [ ] FrontierSquares_End  @ L4632-4649
- [ ] Task_ScrollBg  @ L4650-4660
- [ ] FrontierSquaresScroll_Init  @ L4661-4704
- [ ] FrontierSquaresScroll_Draw  @ L4705-4724
- [ ] FrontierSquaresScroll_SetBlack  @ L4725-4734
- [ ] FrontierSquaresScroll_Erase  @ L4735-4755
- [ ] FrontierSquaresScroll_End  @ L4756-4777

## pokeball.c — 22/37 fonctions couvertes (59%) · cite:19 + symbole:3 · 132 citations
- [ ] SpriteCB_BallThrow_ReachMon  @ L456-460
- [ ] SpriteCB_BallThrow_StartShrinkMon  @ L461-472
- [ ] SpriteCB_BallThrow_ShrinkMon  @ L473-492
- [ ] SpriteCB_BallThrow_Close  @ L493-509
- [ ] SpriteCB_BallThrow_FallToGround  @ L510-569
- [ ] SpriteCB_BallThrow_StartShakes  @ L570-582
- [ ] SpriteCB_BallThrow_Shake  @ L583-664
- [ ] SpriteCB_BallThrow_StartCaptureMon  @ L836-844
- [ ] SpriteCB_BallThrow_CaptureMon  @ L886-910
- [ ] LaunchBallFadeMonTaskForPokeball  @ L1012-1030
- [ ] CreateTradePokeballSprite  @ L1143-1159
- [ ] SpriteCB_TradePokeball  @ L1160-1193
- [ ] SpriteCB_TradePokeballSendOff  @ L1194-1216
- [ ] SpriteCB_TradePokeballEnd  @ L1217-1230
- [ ] DestroySpriteAndFreeResources_Ball  @ L1231-1240

## battle_anim.c — 79/79 fonctions couvertes (100%) · cite:79 + symbole:0 · 119 citations
- ✓ complet

## battle_anim_mons.c — 105/128 fonctions couvertes (82%) · cite:61 + symbole:44 · 219 citations
- [ ] GetSubstituteSpriteDefault_Y  @ L332-341
- [ ] TranslateSpriteInLissajousCurve  @ L489-515
- [ ] AnimPosToTranslateLinear  @ L572-578
- [ ] ConvertPosDataToTranslateLinearData  @ L579-592
- [ ] TranslateSpriteLinearFixedPointIconFrame  @ L623-640
- [ ] TranslateSpriteToBattleTargetPos  @ L641-650
- [ ] TranslateSpriteToBattleAttackerPos  @ L708-722
- [ ] EndUnkPaletteAnim  @ L723-728
- [ ] GetBattleAnimBgData  @ L933-958
- [ ] InitAnimBgTilemapBuffer  @ L1004-1009
- [ ] AnimLoadCompressedBgTilemapHandleContest  @ L1016-1023
- [ ] Trade_MoveSelectedMonToTarget  @ L1046-1054
- [ ] StartAnimLinearTranslation_SetCornerVecX  @ L1102-1110
- [ ] AnimTranslateLinear_WithFollowup_SetCornerVecX  @ L1148-1154
- [ ] ArcTan2_  @ L1363-1367
- [ ] GetSpritePalIdxByBattler  @ L1505-1509
- [ ] GetSpritePalIdxByPosition  @ L1510-1514
- [ ] AnimThrowProjectile_Step  @ L1585-1590
- [ ] AnimTask_BlendPalInAndOutSetup  @ L1726-1737
- [ ] AnimTask_BlendMonInAndOut_Step  @ L1738-1773
- [ ] SetPriorityForVisibleBattlers  @ L2009-2020
- [ ] AnimTranslateLinearAndFlicker_Flipped  @ L2335-2357
- [ ] AnimWeatherBallUp_Step  @ L2522-2533

## battle_anim_effects_1.c — 125/154 fonctions couvertes (81%) · cite:3 + symbole:122 · 89 citations
- [ ] AnimMovePowderParticle_Step  @ L2213-2229
- [ ] AnimSolarBeamSmallOrb_Step  @ L2274-2295
- [ ] AnimTask_CreateSmallSolarBeamOrbs  @ L2296-2314
- [ ] AnimAbsorptionOrb_Step  @ L2328-2335
- [ ] AnimLeechSeed_Step  @ L2399-2409
- [ ] AnimLeechSeedSprouts  @ L2410-2421
- [ ] AnimSporeParticle_Step  @ L2437-2462
- [ ] AnimRazorLeafParticle_Step1  @ L2564-2589
- [ ] AnimRazorLeafParticle_Step2  @ L2590-2609
- [ ] AnimTranslateLinearSingleSineWave_Step  @ L2641-2673
- [ ] AnimMoveTwisterParticle_Step  @ L2690-2718
- [ ] AnimTask_DuplicateAndShrinkToPos_Step1  @ L2792-2809
- [ ] AnimTask_DuplicateAndShrinkToPos_Step2  @ L2810-2839
- [ ] AnimKnockOffOpponentsItem  @ L3044-3061
- [ ] AnimKnockOffItem  @ L3062-3088
- [ ] LeafBladeGetPosFactor  @ L3466-3474
- [ ] AnimFlyingParticle_Step  @ L3571-3591
- [ ] AnimWhipHit_WaitEnd  @ L3697-3702
- [ ] AnimFlickeringPunch  @ L3734-3753
- [ ] UnusedFlickerAnim  @ L3854-3886
- [ ] AnimBubbleBurst_Step  @ L4174-4186
- [ ] AnimSleepLetterZ_Step  @ L4209-4218
- [ ] AnimTipMon  @ L4505-4510
- [ ] AnimTipMon_Step  @ L4511-4547
- [ ] AnimTask_SkullBashPositionSet  @ L4588-4678
- [ ] AnimTask_SkullBashPositionReset  @ L4679-4695
- [ ] AnimTask_HideBattlersHealthbox  @ L4920-4936
- [ ] AnimTask_ShowBattlersHealthbox  @ L4937-4945
- [ ] AnimTask_MoonlightEndFade_Step  @ L5030-5107

## battle_anim_effects_2.c — 97/121 fonctions couvertes (80%) · cite:55 + symbole:42 · 97 citations
- [ ] AnimCirclingFinger  @ L1270-1288
- [ ] AnimBouncingMusicNote  @ L1289-1302
- [ ] AnimBouncingMusicNote_Step  @ L1303-1323
- [ ] AnimVibrateBattlerBack_Step  @ L1324-1338
- [ ] AnimVibrateBattlerBack  @ L1339-1357
- [ ] AnimMovingClamp  @ L1358-1367
- [ ] AnimMovingClamp_Step  @ L1368-1376
- [ ] AnimMovingClamp_End  @ L1377-1386
- [ ] AnimTask_Withdraw_Step  @ L1393-1441
- [ ] AnimVoidLines  @ L1751-1757
- [ ] AnimVoidLines_Step  @ L1758-1777
- [ ] AnimTask_Minimize_Step  @ L2052-2117
- [ ] AnimTask_GrowAndShrink_Step  @ L2245-2254
- [ ] AnimTask_ThrashMoveMonHorizontal_Step  @ L2314-2321
- [ ] AnimTask_ThrashMoveMonVertical_Step  @ L2341-2391
- [ ] AnimTask_AttackerStretchAndDisappear_Step  @ L2803-2813
- [ ] AnimTask_ExtremeSpeedImpact_Step  @ L2837-2882
- [ ] AnimTask_ExtremeSpeedMonReappear_Step  @ L2897-2924
- [ ] AnimTask_SpeedDust_Step  @ L2943-3010
- [ ] AnimTask_FakeOut_Step1  @ L3100-3114
- [ ] AnimTask_FakeOut_Step2  @ L3115-3134
- [ ] AnimTask_HeartsBackground_Step  @ L3270-3325
- [ ] AnimTask_ScaryFace_Step  @ L3354-3414
- [ ] AnimTask_UproarDistortion_Step  @ L3672-3677

## battle_anim_effects_3.c — 105/140 fonctions couvertes (75%) · cite:33 + symbole:72 · 86 citations
- [ ] SetPsychicBackground_Step  @ L1378-1397
- [ ] FadeScreenToWhite_Step  @ L1404-1428
- [ ] AnimLeer  @ L1468-1476
- [ ] AnimFang  @ L1515-1520
- [ ] RapinSpinMonElevation_Step  @ L1833-1891
- [ ] TormentAttacker_Step  @ L1907-2005
- [ ] AnimTask_DoomDesireLightBeam  @ L2556-2657
- [ ] AnimTask_StrongFrustrationGrowAndShrink  @ L2658-2674
- [ ] AnimWeakFrustrationAngerMark  @ L2675-2701
- [ ] AnimTask_RockMonBackAndForth_Step  @ L2742-2799
- [ ] AnimTask_FlailMovement_Step  @ L2862-2936
- [ ] AnimTask_RolePlaySilhouette_Step1  @ L3263-3278
- [ ] AnimTask_RolePlaySilhouette_Step2  @ L3279-3295
- [ ] AnimTask_DeepInhale_Step  @ L3483-3511
- [ ] AnimSmokeBallEscapeCloud  @ L3570-3581
- [ ] AnimTask_SlideMonForFocusBand_Step2  @ L3582-3631
- [ ] AnimTask_SlideMonForFocusBand_Step1  @ L3632-3684
- [ ] AnimTask_SlideMonForFocusBand  @ L3685-3741
- [ ] AnimTask_SquishAndSweatDroplets_Step  @ L3767-3803
- [ ] CreateSweatDroplets  @ L3804-3845
- [ ] AnimFacadeSweatDrop  @ L3846-3874
- [ ] AnimTask_FacadeColorBlend_Step  @ L3886-3903
- [ ] AnimTask_GlareEyeDots_Step  @ L4017-4087
- [ ] GetGlareEyeDotCoords  @ L4088-4113
- [ ] AnimGlareEyeDot  @ L4114-4144
- [ ] AnimTask_BarrageBall_Step  @ L4185-4231
- [ ] AnimTask_SmellingSaltsSquish_Step  @ L4322-4354
- [ ] AnimTask_HelpingHandAttackerMovement_Step  @ L4528-4611
- [ ] AnimTask_OdorSleuthMovementWaitFinish  @ L5018-5023
- [ ] MoveOdorSleuthClone  @ L5024-5059
- [ ] AnimTask_SnatchOpposingMonMove  @ L5077-5221
- [ ] AnimUnusedItemBagSteal  @ L5222-5266
- [ ] AnimTask_SnatchPartnerMove  @ L5267-5327
- [ ] AnimTask_TeeterDanceMovement_Step  @ L5342-5375
- [ ] AnimTask_SlackOffSquish_Step  @ L5523-5548

## battle_anim_water.c — 38/48 fonctions couvertes (79%) · cite:15 + symbole:23 · 37 citations
- [ ] AnimRainDrop  @ L508-512
- [ ] AnimRainDrop_Step  @ L513-528
- [ ] AnimWaterBubbleProjectile_Step1  @ L566-587
- [ ] AnimWaterBubbleProjectile_Step2  @ L588-594
- [ ] AnimWaterBubbleProjectile_Step3  @ L595-601
- [ ] AnimTask_RotateAuroraRingColors_Step  @ L641-660
- [ ] AnimTask_RunSinAnimTimer  @ L711-718
- [ ] AnimTask_WaterSpoutLaunch_Step  @ L1065-1151
- [ ] AnimTask_WaterSpoutRain_Step  @ L1260-1302
- [ ] AnimTask_WaterSport_Step  @ L1374-1442

## battle_anim_fire.c — 32/35 fonctions couvertes (91%) · cite:20 + symbole:12 · 36 citations
- [ ] AnimUnusedSmallEmber_Step  @ L577-603
- [ ] AnimTask_EruptionLaunchRocks_Step  @ L815-921
- [ ] AnimTask_MoveHeatWaveTargets_Step  @ L1239-1328

## battle_anim_electric.c — 28/37 fonctions couvertes (76%) · cite:17 + symbole:11 · 30 citations
- [ ] AnimUnusedSpinningFist  @ L476-485
- [ ] AnimUnusedSpinningFist_Step  @ L486-491
- [ ] AnimUnusedCirclingShock  @ L492-514
- [ ] AnimTask_ElectricBolt_Step  @ L693-761
- [ ] AnimElectricBoltSegment  @ L762-778
- [ ] AnimTask_ElectricChargingParticles_Step  @ L831-879
- [ ] AnimElectricChargingParticles  @ L889-894
- [ ] CreateVoltTackleBolt  @ L1095-1124
- [ ] AnimVoltTackleBolt  @ L1125-1134

## battle_anim_ice.c — 27/32 fonctions couvertes (84%) · cite:20 + symbole:7 · 36 citations
- [ ] AnimUnusedIceCrystalThrow  @ L532-570
- [ ] AnimUnusedIceCrystalThrow_Step  @ L571-591
- [ ] AnimTask_HazeScrollingFog_Step  @ L1018-1089
- [ ] AnimTask_MistBallFog_Step  @ L1124-1193
- [ ] AnimTask_Hail2  @ L1354-1413

## battle_anim_ghost.c — 26/37 fonctions couvertes (70%) · cite:5 + symbole:21 · 18 citations
- [ ] AnimTask_NightShadeClone_Step1  @ L355-370
- [ ] AnimTask_NightShadeClone_Step2  @ L371-399
- [ ] AnimTask_NightmareClone_Step  @ L551-588
- [ ] AnimTask_SpiteTargetShadow_Step1  @ L599-689
- [ ] AnimTask_SpiteTargetShadow_Step2  @ L690-709
- [ ] AnimTask_SpiteTargetShadow_Step3  @ L710-745
- [ ] AnimDestinyBondWhiteShadow  @ L746-782
- [ ] AnimTask_DestinyBondWhiteShadow_Step  @ L868-944
- [ ] AnimTask_GrudgeFlames_Step  @ L1196-1280
- [ ] AnimMonMoveCircular  @ L1309-1321
- [ ] AnimMonMoveCircular_Step  @ L1322-1341

## battle_anim_psychic.c — 19/27 fonctions couvertes (70%) · cite:8 + symbole:11 · 37 citations
- [ ] AnimDefensiveWall_Step1  @ L485-504
- [ ] AnimDefensiveWall_Step2  @ L505-513
- [ ] AnimDefensiveWall_Step3  @ L514-535
- [ ] AnimDefensiveWall_Step4  @ L536-559
- [ ] AnimDefensiveWall_Step5  @ L560-581
- [ ] AnimTask_MeditateStretchAttacker_Step  @ L701-706
- [ ] AnimTask_Teleport_Step  @ L720-747
- [ ] AnimTask_ImprisonOrbs_Step  @ L769-838

## battle_anim_rock.c — 19/22 fonctions couvertes (86%) · cite:10 + symbole:9 · 28 citations
- [ ] AnimParticleInVortex_Step  @ L378-395
- [ ] AnimTask_LoadSandstormBackground_Step  @ L427-512
- [ ] AnimTask_Rollout_Step  @ L630-694

## battle_anim_ground.c — 22/25 fonctions couvertes (88%) · cite:10 + symbole:12 · 27 citations
- [ ] AnimTask_ShakePlatforms  @ L619-665
- [ ] AnimTask_ShakeBattlers  @ L666-707
- [ ] SetBattlersXOffsetForShake  @ L708-733

## battle_anim_flying.c — 24/31 fonctions couvertes (77%) · cite:21 + symbole:3 · 37 citations
- [ ] AnimTask_AnimateGustTornadoPalette_Step  @ L381-407
- [ ] AnimUnusedBubbleThrow  @ L895-902
- [ ] AnimUnusedFlashingLight  @ L1161-1167
- [ ] AnimUnusedFlashingLight_Step  @ L1168-1186
- [ ] AnimSkyAttackBird  @ L1187-1209
- [ ] AnimSkyAttackBird_Step  @ L1210-1222
- [ ] AnimTask_SetAttackerVisibility  @ L1223-1237

## battle_anim_normal.c — 32/36 fonctions couvertes (89%) · cite:20 + symbole:12 · 36 citations
- [ ] AnimConfusionDuck  @ L258-281
- [ ] AnimConfusionDuck_Step  @ L282-297
- [ ] AnimSimplePaletteBlend_Step  @ L329-343
- [ ] AnimCirclingSparkle  @ L416-446

## battle_anim_dark.c — 19/25 fonctions couvertes (76%) · cite:3 + symbole:16 · 29 citations
- [ ] AnimTask_AttackerFadeToInvisible_Step  @ L208-230
- [ ] AnimTask_AttackerFadeFromInvisible_Step  @ L241-264
- [ ] AnimUnusedBagSteal  @ L276-290
- [ ] AnimUnusedBagSteal_Step  @ L291-319
- [ ] AnimBite_Step1  @ L333-342
- [ ] AnimBite_Step2  @ L343-353

## battle_anim_dragon.c — 11/11 fonctions couvertes (100%) · cite:8 + symbole:3 · 18 citations
- ✓ complet

## battle_anim_bug.c — 13/13 fonctions couvertes (100%) · cite:13 + symbole:0 · 17 citations
- ✓ complet

## battle_anim_poison.c — 9/9 fonctions couvertes (100%) · cite:9 + symbole:0 · 17 citations
- ✓ complet

## battle_anim_fight.c — 28/31 fonctions couvertes (90%) · cite:24 + symbole:4 · 32 citations
- [ ] AnimUnusedHumanoidFoot  @ L412-420
- [ ] AnimFistOrFootRandomPos_Step  @ L512-529
- [ ] AnimSpinningKickOrPunchFinish  @ L622-635

## battle_anim_utility_funcs.c — 28/42 fonctions couvertes (67%) · cite:0 + symbole:28 · 19 citations
- [ ] AnimTask_HardwarePaletteFade_Step  @ L211-217
- [ ] AnimTask_TraceMonBlended_Step  @ L231-263
- [ ] AnimMonTrace  @ L264-277
- [ ] AnimTask_DrawFallingWhiteLinesOnAttacker  @ L278-347
- [ ] AnimTask_DrawFallingWhiteLinesOnAttacker_Step  @ L348-414
- [ ] InitStatsChangeAnimation  @ L415-425
- [ ] StatsChangeAnimation_Step1  @ L426-478
- [ ] StatsChangeAnimation_Step2  @ L479-566
- [ ] StatsChangeAnimation_Step3  @ L567-648
- [ ] AnimTask_UpdateSlidingBg  @ L762-779
- [ ] AnimTask_SetAnimAttackerAndTargetForEffectTgt  @ L1049-1055
- [ ] AnimTask_SetAnimTargetToBattlerTarget  @ L1066-1071
- [ ] AnimTask_SetAnimAttackerAndTargetForEffectAtk  @ L1072-1078
- [ ] AnimTask_WaitAndRestoreVisibility  @ L1094-1102

## battle_anim_sound_tasks.c — 10/15 fonctions couvertes (67%) · cite:4 + symbole:6 · 10 citations
- [ ] SoundTask_FireBlast  @ L23-41
- [ ] SoundTask_FireBlast_Step1  @ L42-63
- [ ] SoundTask_FireBlast_Step2  @ L64-77
- [ ] SoundTask_PlayDoubleCry_Step  @ L239-268
- [ ] SoundTask_PlayCryWithEcho_Step  @ L310-349

## battle_anim_status_effects.c — 3/12 fonctions couvertes (25%) · cite:1 + symbole:2 · 10 citations
- [ ] Task_FlashingCircleImpacts  @ L273-312
- [ ] Task_UpdateFlashingCircleImpacts  @ L313-345
- [ ] AnimFlashingCircleImpact  @ L346-359
- [ ] AnimFlashingCircleImpact_Step  @ L360-380
- [ ] AnimTask_FrozenIceCube_Step1  @ L399-414
- [ ] AnimTask_FrozenIceCube_Step2  @ L415-447
- [ ] AnimTask_FrozenIceCube_Step3  @ L448-463
- [ ] AnimTask_FrozenIceCube_Step4  @ L464-481
- [ ] AnimTask_StatsChange  @ L482-542

## battle_anim_throw.c — 60/78 fonctions couvertes (77%) · cite:51 + symbole:9 · 91 citations
- [ ] AnimTask_UnusedLevelUpHealthBox_Step  @ L484-543
- [ ] Task_PlayerThrow_Wait  @ L837-854
- [ ] IncrBallParticleCount  @ L1593-1598
- [ ] TimerBallOpenParticleAnimation  @ L1660-1693
- [ ] DiveBallOpenParticleAnimation  @ L1694-1728
- [ ] SafariBallOpenParticleAnimation  @ L1729-1763
- [ ] UltraBallOpenParticleAnimation  @ L1764-1798
- [ ] GreatBallOpenParticleAnimation  @ L1799-1843
- [ ] FanOutBallOpenParticles_Step1  @ L1844-1854
- [ ] RepeatBallOpenParticleAnimation  @ L1855-1885
- [ ] RepeatBallOpenParticleAnimation_Step1  @ L1886-1896
- [ ] MasterBallOpenParticleAnimation  @ L1897-1942
- [ ] PremierBallOpenParticleAnimation  @ L1943-1973
- [ ] PremierBallOpenParticleAnimation_Step1  @ L1974-1984
- [ ] SpriteCB_PokeBlock_Throw  @ L2423-2439
- [ ] SpriteCB_PokeBlock_LiftArm  @ L2440-2445
- [ ] SpriteCB_PokeBlock_Arc  @ L2446-2456
- [ ] SpriteCB_ThrowPokeBlock_Free  @ L2457-2468

## battle_anim_smokescreen.c — 3/3 fonctions couvertes (100%) · cite:1 + symbole:2 · 9 citations
- ✓ complet

## battle_anim_mon_movement.c — 28/34 fonctions couvertes (82%) · cite:5 + symbole:23 · 19 citations
- [ ] AnimTask_ShakeAndSinkMon_Step  @ L333-362
- [ ] AnimTask_TranslateMonElliptical_Step  @ L385-413
- [ ] AnimTask_SlideOffScreen_Step  @ L736-754
- [ ] AnimTask_ScaleMonAndRestore_Step  @ L841-865
- [ ] AnimTask_RotateMonSpriteToSide_Step  @ L948-974
- [ ] AnimTask_ShakeTargetBasedOnMovePowerOrDmg_Step  @ L1015-1053

## pokemon.c — 90/160 fonctions couvertes (56%) · cite:44 + symbole:46 · 195 citations
- [ ] ZeroBoxMonData  @ L2156-2163
- [ ] ZeroPlayerPartyMons  @ L2182-2188
- [ ] CreateMonWithGenderNatureLetter  @ L2319-2349
- [ ] CreateMaleMon  @ L2350-2363
- [ ] CreateMonWithIVsPersonality  @ L2364-2370
- [ ] CreateMonWithIVsOTID  @ L2371-2382
- [ ] CreateMonWithEVSpread  @ L2383-2414
- [ ] CreateBattleTowerMon  @ L2415-2468
- [ ] CreateBattleTowerMon_HandleLevel  @ L2469-2530
- [ ] CreateApprenticeMon  @ L2531-2562
- [ ] CreateMonWithEVSpreadNatureOTID  @ L2563-2596
- [ ] ConvertPokemonToBattleTowerPokemon  @ L2597-2633
- [ ] CreateEventMon  @ L2634-2642
- [ ] GetDeoxysStat  @ L2699-2715
- [ ] GetUnionRoomTrainerPic  @ L2744-2758
- [ ] GetUnionRoomTrainerClass  @ L2759-2773
- [ ] BoxMonToMon  @ L2899-2910
- [ ] SetBattleMonMoveSlot  @ L2981-2986
- [ ] GiveMonInitialMoveset  @ L2987-2991
- [ ] GiveBoxMonInitialMoveset  @ L2992-3014
- [ ] DeleteFirstMoveAndGiveMoveToMon  @ L3047-3073
- [ ] GetMonGender  @ L3448-3452
- [ ] GetBoxMonGender  @ L3453-3471
- [ ] SetMultiuseSpriteTemplateToTrainerFront  @ L3526-3536
- [ ] EncryptBoxMon  @ L3537-3546
- [ ] DecryptBoxMon  @ L3547-3603
- [ ] GetMonData3  @ L3643-3716
- [ ] GetMonsStateToDoubles_2  @ L4514-4532
- [ ] CreateSecretBaseEnemyParty  @ L4550-4583
- [ ] GetSecretBaseTrainerPicIndex  @ L4584-4589
- [ ] GetSecretBaseTrainerClass  @ L4590-4595
- [ ] IsPokemonStorageFull  @ L4607-4618
- [ ] GetSpeciesName  @ L4619-4636
- [ ] RemoveBattleMonPPBonus  @ L4650-4654
- [ ] ExecuteTableBasedItemEffect  @ L4710-4741
- [ ] BufferStatRoseMessage  @ L5425-5432
- [ ] UseStatIncreaseItem  @ L5433-5479
- [ ] HoennPokedexNumToSpecies  @ L5610-5627
- [ ] SpeciesToCryId  @ L5688-5786
- [ ] DrawSpindaSpotsUnused  @ L5787-5794
- [ ] DrawSpindaSpots  @ L5795-5800
- [ ] EvolutionRenameMon  @ L5801-5811
- [ ] GetPlayerFlankId  @ L5812-5828
- [ ] GetTrainerEncounterMusicId  @ L5855-5864
- [ ] UpdatePartyPokerusTime  @ L6157-6180
- [ ] TryIncrementMonLevel  @ L6211-6231
- [ ] CanSpeciesLearnTMHM  @ L6252-6270
- [ ] GetMoveRelearnerMoves  @ L6271-6309
- [ ] GetLevelUpMovesBySpecies  @ L6310-6320
- [ ] GetNumberOfRelearnableMoves  @ L6321-6363
- [ ] IsSpeciesInHoennDex  @ L6379-6386
- [ ] PlayMapChosenOrBattleBGM  @ L6466-6478
- [ ] CreateTask_PlayMapChosenOrBattleBGM  @ L6479-6489
- [ ] Task_PlayMapChosenOrBattleBGM  @ L6490-6500
- [ ] IsHMMove2  @ L6542-6552
- [ ] GetMonFlavorRelation  @ L6558-6563
- [ ] MonRestorePP  @ L6597-6601
- [ ] BoxMonRestorePP  @ L6602-6617
- [ ] SetMonPreventsSwitchingString  @ L6618-6636
- [ ] GetWildMonTableIdInAlteringCave  @ L6637-6645
- [ ] GetOwnOpposingLinkMultiBattlerId  @ L6869-6892
- [ ] GetOpposingLinkMultiBattlerId  @ L6893-6915
- [ ] FacilityClassToPicIndex  @ L6916-6920
- [ ] PlayerGenderToFrontTrainerPicId  @ L6921-6928
- [ ] GetTrainerClassNameFromId  @ L6945-6951
- [ ] GetTrainerNameFromId  @ L6952-6958
- [ ] InitMonSpritesGfx_Battle  @ L6993-7005
- [ ] CreateMonSpritesGfxManager  @ L7021-7117
- [ ] DestroyMonSpritesGfxManager  @ L7118-7141
- [ ] MonSpritesGfxManager_GetSpritePtr  @ L7142-7157
