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

## battle_util.c — ✅ SOLDÉ (tranche ×7 portée 1:1 dans src/game/battle_util.ts)
- [x] HandleAction_SafariZoneBallThrow — porté 1:1 (BattleScript_SafariBallThrow bytecode:22 ; gNumSafariBalls module ; boot safari = dette zone) @ L550-560
- [x] HandleAction_ThrowPokeblock — porté 1:1 QUIRK VANILLA reproduit (< pas <= = pokeblock throw glitch, safariEscapeFactor peut tomber à 0) + sPkblToEscapeFactor 5x3 @ L561-589
- [x] HandleAction_GoNear — porté 1:1 (tables sGoNearCounterToCatch/EscapeFactor, caps 20, B_MSG 0/1) @ L590-616
- [x] HandleAction_SafariZoneRun — porté 1:1 (SE_FLEE 17 + B_OUTCOME_RAN 4) @ L617-624
- [x] HandleAction_WallyBallThrow — porté 1:1 (PREPARE_MON_NICK_BUFFER + BattleScript_ActionWallyThrow + gActionsByTurnOrder[1]=FINISHED) @ L625-637
- [x] MarkAllBattlersForControllerExec — porté nominal — UNUSED explicite dans le .c (aucun caller) @ L830-845
- [x] MarkBattlerReceivedLinkData — porté 1:1 (GetLinkPlayerCount=0 hors link → clear-mask seule ; dette link) @ L854-863

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

## battle_setup.c — ✅ SOLDÉ (T-A 4491dad2 + T-B 9e6fc16f + T-C : portés ou dette explicite)
- [x] BattleSetup_StartBattlePikeWildBattle  @ L397-401 — DETTE EXPLICITE frontier (Battle Pike hors démo ; caller battle_pike.c non porté)
- [x] BattleSetup_StartRoamerBattle  @ L421-434 — DETTE EXPLICITE post-game (roamer.c non porté, inatteignable)
- [x] DoSafariBattle  @ L435-444 — DETTE EXPLICITE zone (Safari Zone hors démo ; chapitre safari dédié, cf. battle_controller_safari.c)
- [x] DoBattlePikeWildBattle  @ L445-458 — DETTE EXPLICITE frontier (idem Pike)
- [x] DoBattlePyramidTrainerHillBattle  @ L467-479 — DETTE EXPLICITE frontier (cohérent avec modes PYRAMID/HILL du Configure en dette T-A)
- [x] GetSpecialBattleTransition  @ L864-910 — DETTE EXPLICITE frontier (mux B_TRANSITION_* par VAR_FRONTIER_FACILITY, callers = facilities uniquement ; les transitions normales Wild/Trainer sont portées)
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
- [x] ConfigureTwoTrainersBattle (T-C) @ L1202-1208 — porté 1:1 structurel (battle_setup.ts ; caller trainer_see = dette, position {opcodes,idx} = trainerScript+1)
- [x] SetUpTwoTrainersBattle (T-C) @ L1209-1214 — porté (EventScript_StartTrainerApproach transpilé idx 0 ; run réel via contexte NPC trainer_see = dette)
- [x] GetTrainerFlagFromScriptPointer (T-C) @ L1215-1223 — porté 1:1 structurel (args[1] de l'opcode trainerbattle = TrainerBattleLoadArg16(data+2))
- [x] SetBattledTrainerFlag (T-A 4491dad2) @ L1252-1256
- [x] HasTrainerBeenFought (T-A 4491dad2) @ L1257-1261
- [x] SetTrainerFlag (T-A 4491dad2) @ L1262-1266
- [x] ClearTrainerFlag (T-A 4491dad2) @ L1267-1271
- [x] CB2_EndRematchBattle (T-B 9e6fc16f) @ L1351-1369
- [x] BattleSetup_GetScriptAddrAfterBattle (T-A 4491dad2) @ L1404-1411
- [x] BattleSetup_GetTrainerPostBattleScript (T-A 4491dad2) @ L1412-1434
- [x] ReturnEmptyStringIfNull (T-B 9e6fc16f) @ L1501-1508
- [x] GetTrainerWonSpeech (T-A 4491dad2) @ L1536-1540
- [x] FirstBattleTrainerIdToRematchTableId (T-B 9e6fc16f) @ L1546-1558
- [x] TrainerIdToRematchTableId (T-B 9e6fc16f) @ L1559-1577
- [x] IsRematchForbidden (T-B 9e6fc16f) @ L1578-1587
- [x] SetRematchIdForTrainer (T-B 9e6fc16f) @ L1588-1604
- [x] UpdateRandomTrainerRematches (T-B 9e6fc16f) @ L1605-1630
- [x] UpdateRematchIfDefeated (T-B 9e6fc16f) @ L1631-1636
- [x] DoesSomeoneWantRematchIn_ (T-B 9e6fc16f) @ L1637-1649
- [x] IsRematchTrainerIn_ (T-B 9e6fc16f) @ L1650-1662
- [x] IsTrainerReadyForRematch_ (T-B 9e6fc16f) @ L1677-1690
- [x] GetRematchTrainerIdFromTable (T-B 9e6fc16f) @ L1691-1711
- [x] GetLastBeatenRematchTrainerIdFromTable (T-B 9e6fc16f) @ L1712-1732
- [x] ClearTrainerWantRematchState (T-B 9e6fc16f) @ L1733-1740
- [x] GetTrainerMatchCallFlag (T-B 9e6fc16f) @ L1741-1753
- [x] RegisterTrainerInMatchCall (T-B 9e6fc16f) @ L1754-1763
- [x] HasAtLeastFiveBadges (T-B 9e6fc16f) @ L1776-1793
- [x] IsRematchStepCounterMaxed (T-B 9e6fc16f) @ L1805-1812
- [x] TryUpdateRandomTrainerRematches (T-B 9e6fc16f) @ L1813-1818
- [x] DoesSomeoneWantRematchIn (T-B 9e6fc16f) @ L1819-1823
- [x] IsRematchTrainerIn (T-B 9e6fc16f) @ L1824-1828
- [x] GetRematchTrainerId (T-B 9e6fc16f) @ L1829-1833
- [x] GetLastBeatenRematchTrainerId (T-B 9e6fc16f) @ L1834-1838
- [x] HandleRematchVarsOnBattleEnd (T-B 9e6fc16f) @ L1852-1857
- [x] CountBattledRematchTeams (T-B 9e6fc16f) @ L1873-1890

## battle_controllers.c — 64/68 fonctions couvertes (94%) · cite:58 + symbole:6 · 96 citations
- [ ] CreateTasksForSendRecvLinkBuffers  @ L701-733
- [ ] Task_HandleSendLinkBuffersData  @ L775-870
- [ ] TryReceiveLinkBattleData  @ L871-908
- [ ] Task_HandleCopyReceivedLinkBuffersData  @ L909-967

## battle_controller_player.c — 111/124 fonctions couvertes (90%) · cite:49 + symbole:62 · 89 citations
- [ ] CompleteOnBankSpritePosX_0  @ L227-232
- [ ] UnusedEndBounceEffect  @ L332-338
- [ ] HandleMoveInputUnused  @ L617-666
- [x] SetLinkBattleEndCallbacks @ L851-881 — DETTE EXPLICITE link (multi-joueur non porté, inatteignable)
- [x] SwitchIn_CleanShinyAnimShowSubstitute @ L1065-1086 — porté 1:1 (corps réel exporté ; câblage : la machine _sendOutPhase A/B-validée couvre intro+switch — re-câblage nominal au refactor send-out, dette douce)
- [x] SwitchIn_HandleSoundAndEnd @ L1087-1097 — porté 1:1 (specialAnim+cry → volume BGM hook + HandleLowHpMusicChange + completed)
- [x] Task_PlayerController_RestoreBgmAfterCry @ L1117-1125 — porté 1:1 (poll cri → restore volume → DestroyTask ; hooks cry/volume optionnels)
- [x] Task_GiveExpWithExpBar @ L1219-1270 — DETTE EXPLICITE divergence structurelle DOCUMENTÉE : notre flux EXP = controllerFunc (PlayerHandleExpUpdate→SetBattleBarStruct→_CompleteOnExpBarDone) + level-up engine-side (Cmd_getexp case 4, CalculateMonStats, bannière+box) — comportement A/B-validé (commits 0be2e866/f49c9d8d) ; la FORME task-chain décomp reste à migrer
- [x] Task_LaunchLvlUpAnim @ L1271-1282 — DETTE EXPLICITE idem (B_ANIM_LVL_UP lancé par le flux level-up box réel)
- [x] Task_UpdateLvlInHealthbox @ L1283-1301 — DETTE EXPLICITE idem (UpdateHealthboxAttribute appliqué par le flux réel)
- [x] DestroyExpTaskAndCompleteOnInactiveTextPrinter @ L1302-1313 — DETTE EXPLICITE idem (fin de chaîne task)
- [x] FreeMonSpriteAfterSwitchOutAnim  @ L1328-1338 — porté 1:1 commit 02fcd96c (battle_controller_player.ts, + DoSwitchOutAnimation 2244-2264 + PlayerHandleReturnMonToBall 2227-2242 ; A/B switch réel : shrink rendu + specialAnimActive 0→1→0)
- [x] CompleteOnFinishedBattleAnimation @ L1566-1571 — porté 1:1 (animFromTableActive — symétrique opponent 3ca8068c)

## battle_controller_opponent.c — 83/88 fonctions couvertes (94%) · cite:21 + symbole:62 · 52 citations
- [x] FreeMonSpriteAfterSwitchOutAnim  @ L422-433 — porté 1:1 commit 02fcd96c (battle_controller_opponent.ts _FreeMonSpriteAfterSwitchOutAnimOpp + _DoSwitchOutAnimationOpp 1217-1236 ; symétrique strict du player A/B-validé — IA switch non scriptable → A/B user à l'œil)
- [x] SwitchIn_ShowSubstitute (controllers 3ca8068c) @ L459-468 — chaîne SwitchIn 1:1 A/B Rick ×2 Wurmple (2e send-out réel) ; dette party-storage[1+] vide + ball throw anim
- [x] SwitchIn_HandleSoundAndEnd (controllers 3ca8068c) @ L469-481 — chaîne SwitchIn 1:1 A/B Rick ×2 Wurmple (2e send-out réel) ; dette party-storage[1+] vide + ball throw anim
- [x] SwitchIn_ShowHealthbox (controllers 3ca8068c) @ L482-499 — chaîne SwitchIn 1:1 A/B Rick ×2 Wurmple (2e send-out réel) ; dette party-storage[1+] vide + ball throw anim
- [x] CompleteOnFinishedBattleAnimation (controllers 3ca8068c) @ L521-526 — chaîne SwitchIn 1:1 A/B Rick ×2 Wurmple (2e send-out réel) ; dette party-storage[1+] vide + ball throw anim

## battle_controller_wally.c — 14/82 fonctions couvertes (17%) · cite:0 + symbole:14 · 5 citations
- [x] SpriteCB_Null7 @ L164-167 — dette tuto Wally (cf. en-tête section)
- [x] WallyBufferRunCommand @ L177-187 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleActions @ L188-247 — dette tuto Wally (cf. en-tête section)
- [x] CompleteOnFinishedAnimation @ L260-265 — dette tuto Wally (cf. en-tête section)
- [x] OpenBagAfterPaletteFade @ L266-276 — dette tuto Wally (cf. en-tête section)
- [x] CompleteOnChosenItem @ L277-285 — dette tuto Wally (cf. en-tête section)
- [x] CompleteOnFinishedBattleAnimation @ L398-403 — dette tuto Wally (cf. en-tête section)
- [x] WallyBufferExecCompleted @ L404-419 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleGetMonData @ L426-450 — dette tuto Wally (cf. en-tête section)
- [x] CopyWallyMonData @ L451-756 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleGetRawMonData @ L757-761 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleSetMonData @ L762-783 — dette tuto Wally (cf. en-tête section)
- [x] SetWallyMonData @ L784-1001 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleSetRawMonData @ L1002-1006 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleLoadMonSprite @ L1007-1011 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleSwitchInAnim @ L1012-1016 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleReturnMonToBall @ L1017-1034 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleDrawTrainerPic @ L1035-1049 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleTrainerSlide @ L1050-1066 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleTrainerSlideBack @ L1067-1071 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleFaintAnimation @ L1072-1076 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandlePaletteFade @ L1077-1081 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleSuccessBallThrowAnim @ L1082-1089 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleBallThrowAnim @ L1090-1099 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandlePause @ L1100-1104 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleMoveAnimation @ L1105-1127 — dette tuto Wally (cf. en-tête section)
- [x] WallyDoMoveAnimation @ L1128-1172 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandlePrintString @ L1173-1184 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandlePrintSelectionString @ L1185-1192 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleChooseAction @ L1203-1217 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleYesNoBox @ L1218-1222 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleChooseMove @ L1223-1250 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleChooseItem @ L1251-1257 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleChoosePokemon @ L1258-1262 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleCmd23 @ L1263-1267 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleHealthBarUpdate @ L1268-1292 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleExpUpdate @ L1293-1297 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleStatusIconUpdate @ L1298-1302 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleStatusAnimation @ L1303-1307 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleStatusXor @ L1308-1312 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleDataTransfer @ L1313-1317 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleDMA3Transfer @ L1318-1322 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandlePlayBGM @ L1323-1327 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleCmd32 @ L1328-1332 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleTwoReturnValues @ L1333-1337 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleChosenMonReturnValue @ L1338-1342 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleOneReturnValue @ L1343-1347 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleOneReturnValue_Duplicate @ L1348-1352 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleClearUnkVar @ L1353-1357 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleSetUnkVar @ L1358-1362 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleClearUnkFlag @ L1363-1367 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleToggleUnkFlag @ L1368-1372 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleHitAnimation @ L1373-1387 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleCantSwitch @ L1388-1392 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandlePlaySE @ L1393-1398 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandlePlayFanfareOrBGM @ L1399-1413 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleFaintingCry @ L1414-1423 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleIntroSlide @ L1424-1430 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleIntroTrainerBallThrow @ L1431-1460 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleDrawPartyStatusSummary @ L1507-1520 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleHidePartyStatusSummary @ L1521-1525 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleEndBounceEffect @ L1526-1530 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleSpriteInvisibility @ L1531-1535 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleBattleAnimation @ L1536-1546 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleLinkStandbyMsg @ L1547-1551 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleResetActionMoveSelection @ L1552-1556 — dette tuto Wally (cf. en-tête section)
- [x] WallyHandleEndLinkBattle @ L1557-1567 — dette tuto Wally (cf. en-tête section)
- [x] WallyCmdEnd @ L1568-1571 — dette tuto Wally (cf. en-tête section)

## battle_controller_safari.c — 8/73 fonctions couvertes (11%) · cite:0 + symbole:8 · 2 citations
- [x] SpriteCB_Null4 @ L150-153 — dette Safari Zone (cf. en-tête section)
- [x] SafariBufferRunCommand @ L159-169 — dette Safari Zone (cf. en-tête section)
- [x] CompleteOnHealthboxSpriteCallbackDummy @ L247-252 — dette Safari Zone (cf. en-tête section)
- [x] SafariSetBattleEndCallbacks @ L253-262 — dette Safari Zone (cf. en-tête section)
- [x] SafariOpenPokeblockCase @ L269-278 — dette Safari Zone (cf. en-tête section)
- [x] CompleteWhenChosePokeblock @ L279-287 — dette Safari Zone (cf. en-tête section)
- [x] CompleteOnFinishedBattleAnimation @ L288-293 — dette Safari Zone (cf. en-tête section)
- [x] SafariBufferExecCompleted @ L294-309 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleGetMonData @ L316-320 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleGetRawMonData @ L321-325 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleSetMonData @ L326-330 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleSetRawMonData @ L331-335 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleLoadMonSprite @ L336-340 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleSwitchInAnim @ L341-345 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleReturnMonToBall @ L346-352 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleDrawTrainerPic @ L353-370 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleTrainerSlide @ L371-375 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleTrainerSlideBack @ L376-380 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleFaintAnimation @ L381-385 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandlePaletteFade @ L386-390 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleSuccessBallThrowAnim @ L391-398 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleBallThrowAnim @ L399-408 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandlePause @ L409-413 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleMoveAnimation @ L414-418 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandlePrintString @ L419-430 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandlePrintSelectionString @ L431-438 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleChooseAction @ L449-463 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleYesNoBox @ L464-468 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleChooseMove @ L469-473 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleChooseItem @ L474-480 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleChoosePokemon @ L481-485 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleCmd23 @ L486-490 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleHealthBarUpdate @ L491-495 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleExpUpdate @ L496-500 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleStatusIconUpdate @ L501-506 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleStatusAnimation @ L507-511 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleStatusXor @ L512-516 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleDataTransfer @ L517-521 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleDMA3Transfer @ L522-526 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandlePlayBGM @ L527-531 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleCmd32 @ L532-536 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleTwoReturnValues @ L537-541 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleChosenMonReturnValue @ L542-546 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleOneReturnValue @ L547-551 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleOneReturnValue_Duplicate @ L552-556 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleClearUnkVar @ L557-561 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleSetUnkVar @ L562-566 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleClearUnkFlag @ L567-571 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleToggleUnkFlag @ L572-576 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleHitAnimation @ L577-581 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleCantSwitch @ L582-586 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandlePlaySE @ L587-599 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandlePlayFanfareOrBGM @ L600-614 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleFaintingCry @ L615-622 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleIntroSlide @ L623-629 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleIntroTrainerBallThrow @ L630-637 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleDrawPartyStatusSummary @ L638-642 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleHidePartyStatusSummary @ L643-647 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleEndBounceEffect @ L648-652 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleSpriteInvisibility @ L653-657 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleBattleAnimation @ L658-668 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleLinkStandbyMsg @ L669-673 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleResetActionMoveSelection @ L674-678 — dette Safari Zone (cf. en-tête section)
- [x] SafariHandleEndLinkBattle @ L679-688 — dette Safari Zone (cf. en-tête section)
- [x] SafariCmdEnd @ L689-692 — dette Safari Zone (cf. en-tête section)

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

## battle_transition.c — QUALIFIÉ : Slice+WhiteBarsFade+flash portés (battle-transition.ts) · infra=équivalence CB2 inline · 140 dette explicite (frontier/légendaires/E4/zones hors démo) · RESTE CHANTIER ATTEIGNABLE ↓ (Blur wild-faible, PokeballsTrail+AngledWipes dresseurs, + helpers BlackWipe)
- [x] CB2_TestBattleTransition @ L997-1019 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] TestBattleTransition @ L1020-1025 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] BattleTransition_StartOnField @ L1026-1031 — équivalence infra DOCUMENTÉE : _makeBattleStartTransitionCB2 (battle-decomp-loop.ts:144, CB2 inline = Task_BattleStart+Task_Intro+dispatch) — renommage nominal au déplacement miroir
- [x] BattleTransition_Start @ L1032-1040 — équivalence infra DOCUMENTÉE : _makeBattleStartTransitionCB2 (battle-decomp-loop.ts:144, CB2 inline = Task_BattleStart+Task_Intro+dispatch) — renommage nominal au déplacement miroir
- [x] LaunchBattleTransitionTask @ L1056-1062 — équivalence infra DOCUMENTÉE : _makeBattleStartTransitionCB2 (battle-decomp-loop.ts:144, CB2 inline = Task_BattleStart+Task_Intro+dispatch) — renommage nominal au déplacement miroir
- [x] Transition_StartIntro @ L1068-1084 — équivalence infra DOCUMENTÉE : _makeBattleStartTransitionCB2 (battle-decomp-loop.ts:144, CB2 inline = Task_BattleStart+Task_Intro+dispatch) — renommage nominal au déplacement miroir
- [x] Transition_WaitForIntro @ L1085-1097 — équivalence infra DOCUMENTÉE : _makeBattleStartTransitionCB2 (battle-decomp-loop.ts:144, CB2 inline = Task_BattleStart+Task_Intro+dispatch) — renommage nominal au déplacement miroir
- [x] Transition_StartMain @ L1098-1104 — équivalence infra DOCUMENTÉE : _makeBattleStartTransitionCB2 (battle-decomp-loop.ts:144, CB2 inline = Task_BattleStart+Task_Intro+dispatch) — renommage nominal au déplacement miroir
- [x] Transition_WaitForMain @ L1105-1115 — équivalence infra DOCUMENTÉE : _makeBattleStartTransitionCB2 (battle-decomp-loop.ts:144, CB2 inline = Task_BattleStart+Task_Intro+dispatch) — renommage nominal au déplacement miroir
- [x] Task_Intro @ L1116-1135 — équivalence infra DOCUMENTÉE : _makeBattleStartTransitionCB2 (battle-decomp-loop.ts:144, CB2 inline = Task_BattleStart+Task_Intro+dispatch) — renommage nominal au déplacement miroir
- [x] Task_Blur (cff54739) @ L1136-1140 — porté 1:1 (mosaic émulé ✓) ; A/B direct : mosaic 1→15 + fade + fin propre (sélection naturelle = zone FLASH hors démo)
- [x] Blur_Init (cff54739) @ L1141-1150 — porté 1:1 (mosaic émulé ✓) ; A/B direct : mosaic 1→15 + fade + fin propre (sélection naturelle = zone FLASH hors démo)
- [x] Blur_Main (cff54739) @ L1151-1168 — porté 1:1 (mosaic émulé ✓) ; A/B direct : mosaic 1→15 + fade + fin propre (sélection naturelle = zone FLASH hors démo)
- [x] Blur_End (cff54739) @ L1169-1188 — porté 1:1 (mosaic émulé ✓) ; A/B direct : mosaic 1→15 + fade + fin propre (sélection naturelle = zone FLASH hors démo)
- [x] Task_Swirl @ L1189-1193 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Swirl_Init @ L1194-1209 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Swirl_End @ L1210-1227 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] VBlankCB_Swirl @ L1228-1234 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] HBlankCB_Swirl @ L1235-1252 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Task_Shuffle @ L1253-1257 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Shuffle_Init @ L1258-1274 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Shuffle_End @ L1275-1298 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] VBlankCB_Shuffle @ L1299-1305 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] HBlankCB_Shuffle @ L1306-1339 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Task_BigPokeball @ L1340-1344 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Task_Aqua @ L1345-1349 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Task_Magma @ L1350-1354 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Task_Regice @ L1355-1359 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Task_Registeel @ L1360-1364 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Task_Regirock @ L1365-1369 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Task_Kyogre @ L1370-1374 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] InitPatternWeaveTransition @ L1375-1398 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Aqua_Init @ L1399-1413 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Magma_Init @ L1414-1428 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Regi_Init @ L1429-1442 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] BigPokeball_Init @ L1443-1456 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] BigPokeball_SetGfx @ L1457-1476 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Aqua_SetGfx @ L1477-1488 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Magma_SetGfx @ L1489-1500 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Regice_SetGfx @ L1501-1513 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Registeel_SetGfx @ L1514-1526 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Regirock_SetGfx @ L1527-1541 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Kyogre_Init @ L1542-1554 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Kyogre_PaletteFlash @ L1555-1571 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Kyogre_PaletteBrighten @ L1572-1588 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] WeatherDuo_FadeOut @ L1589-1595 — DETTE EXPLICITE (mugshots E4-Champion / weave-CircularMask machinery légendaires / frontier wrappers — hors démo)
- [x] WeatherDuo_End @ L1596-1611 — DETTE EXPLICITE (mugshots E4-Champion / weave-CircularMask machinery légendaires / frontier wrappers — hors démo)
- [x] PatternWeave_Blend1 @ L1612-1631 — DETTE EXPLICITE (mugshots E4-Champion / weave-CircularMask machinery légendaires / frontier wrappers — hors démo)
- [x] PatternWeave_Blend2 @ L1632-1651 — DETTE EXPLICITE (mugshots E4-Champion / weave-CircularMask machinery légendaires / frontier wrappers — hors démo)
- [x] PatternWeave_FinishAppear @ L1652-1671 — DETTE EXPLICITE (mugshots E4-Champion / weave-CircularMask machinery légendaires / frontier wrappers — hors démo)
- [x] FramesCountdown @ L1672-1678 — DETTE EXPLICITE (mugshots E4-Champion / weave-CircularMask machinery légendaires / frontier wrappers — hors démo)
- [x] WeatherTrio_BgFadeBlack @ L1679-1685 — DETTE EXPLICITE (mugshots E4-Champion / weave-CircularMask machinery légendaires / frontier wrappers — hors démo)
- [x] WeatherTrio_WaitFade @ L1686-1693 — DETTE EXPLICITE (mugshots E4-Champion / weave-CircularMask machinery légendaires / frontier wrappers — hors démo)
- [x] PatternWeave_CircularMask @ L1694-1724 — DETTE EXPLICITE (mugshots E4-Champion / weave-CircularMask machinery légendaires / frontier wrappers — hors démo)
- [x] VBlankCB_SetWinAndBlend @ L1725-1737 — DETTE EXPLICITE (mugshots E4-Champion / weave-CircularMask machinery légendaires / frontier wrappers — hors démo)
- [x] VBlankCB_PatternWeave @ L1738-1743 — DETTE EXPLICITE (mugshots E4-Champion / weave-CircularMask machinery légendaires / frontier wrappers — hors démo)
- [x] VBlankCB_CircularMask @ L1744-1765 — DETTE EXPLICITE (mugshots E4-Champion / weave-CircularMask machinery légendaires / frontier wrappers — hors démo)
- [x] Task_PokeballsTrail (8664e0b5) @ L1766-1770 — porté 1:1 src/game/battle_transition.ts (MIROIR créé) ; A/B pixel : noir 3→3840 progressif, combat boote, victoire
- [x] PokeballsTrail_Init (8664e0b5) @ L1771-1783 — porté 1:1 src/game/battle_transition.ts (MIROIR créé) ; A/B pixel : noir 3→3840 progressif, combat boote, victoire
- [x] PokeballsTrail_Main (8664e0b5) @ L1784-1808 — porté 1:1 src/game/battle_transition.ts (MIROIR créé) ; A/B pixel : noir 3→3840 progressif, combat boote, victoire
- [x] PokeballsTrail_End (8664e0b5) @ L1809-1818 — porté 1:1 src/game/battle_transition.ts (MIROIR créé) ; A/B pixel : noir 3→3840 progressif, combat boote, victoire
- [x] FldEff_PokeballTrail (8664e0b5) @ L1819-1831 — porté 1:1 src/game/battle_transition.ts (MIROIR créé) ; A/B pixel : noir 3→3840 progressif, combat boote, victoire
- [x] SpriteCB_FldEffPokeballTrail (8664e0b5) @ L1832-1878 — porté 1:1 src/game/battle_transition.ts (MIROIR créé) ; A/B pixel : noir 3→3840 progressif, combat boote, victoire
- [x] Task_ClockwiseWipe @ L1879-1883 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] ClockwiseWipe_Init @ L1884-1905 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] ClockwiseWipe_TopRight @ L1906-1930 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] ClockwiseWipe_Right @ L1931-1966 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] ClockwiseWipe_Bottom @ L1967-1987 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] ClockwiseWipe_Left @ L1988-2025 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] ClockwiseWipe_TopLeft @ L2026-2047 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] ClockwiseWipe_End @ L2048-2055 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] VBlankCB_ClockwiseWipe @ L2056-2077 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Task_Ripple @ L2078-2082 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Ripple_Init @ L2083-2101 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Ripple_Main @ L2102-2135 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] VBlankCB_Ripple @ L2136-2142 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] HBlankCB_Ripple @ L2143-2162 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Task_Wave @ L2163-2167 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Wave_Init @ L2168-2188 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Wave_Main @ L2189-2218 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Wave_End @ L2219-2226 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] VBlankCB_Wave @ L2227-2265 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Task_Sidney @ L2266-2271 — DETTE EXPLICITE (mugshots E4-Champion / weave-CircularMask machinery légendaires / frontier wrappers — hors démo)
- [x] Task_Phoebe @ L2272-2277 — DETTE EXPLICITE (mugshots E4-Champion / weave-CircularMask machinery légendaires / frontier wrappers — hors démo)
- [x] Task_Glacia @ L2278-2283 — DETTE EXPLICITE (mugshots E4-Champion / weave-CircularMask machinery légendaires / frontier wrappers — hors démo)
- [x] Task_Drake @ L2284-2289 — DETTE EXPLICITE (mugshots E4-Champion / weave-CircularMask machinery légendaires / frontier wrappers — hors démo)
- [x] Task_Champion @ L2290-2295 — DETTE EXPLICITE (mugshots E4-Champion / weave-CircularMask machinery légendaires / frontier wrappers — hors démo)
- [x] DoMugshotTransition @ L2296-2300 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Mugshot_Init @ L2301-2324 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Mugshot_SetGfx @ L2325-2349 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Mugshot_ShowBanner @ L2350-2403 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Mugshot_StartOpponentSlide @ L2404-2435 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Mugshot_WaitStartPlayerSlide @ L2436-2449 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Mugshot_WaitPlayerSlide @ L2450-2472 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Mugshot_GradualWhiteFade @ L2473-2517 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Mugshot_InitFadeWhiteToBlack @ L2518-2528 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Mugshot_FadeToBlack @ L2529-2541 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Mugshot_End @ L2542-2549 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] VBlankCB_Mugshots @ L2550-2562 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] VBlankCB_MugshotsFadeOut @ L2563-2572 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] HBlankCB_Mugshots @ L2573-2580 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Mugshots_CreateTrainerPics @ L2581-2619 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] SpriteCB_MugshotTrainerPic @ L2620-2625 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] MugshotTrainerPic_Pause @ L2626-2630 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] MugshotTrainerPic_Init @ L2631-2644 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] MugshotTrainerPic_Slide @ L2645-2656 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] MugshotTrainerPic_SlideSlow @ L2657-2676 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] MugshotTrainerPic_SlideOffscreen @ L2677-2685 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] SetTrainerPicSlideDirection @ L2686-2690 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] IncrementTrainerPicState @ L2691-2695 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Task_ShredSplit @ L2842-2846 — DETTE EXPLICITE (mugshots E4-Champion / weave-CircularMask machinery légendaires / frontier wrappers — hors démo)
- [x] ShredSplit_Init @ L2847-2881 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] ShredSplit_Main @ L2882-2993 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] ShredSplit_BrokenCheck @ L2994-3011 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] ShredSplit_End @ L3012-3034 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Task_Blackhole @ L3035-3039 — DETTE EXPLICITE (mugshots E4-Champion / weave-CircularMask machinery légendaires / frontier wrappers — hors démo)
- [x] Task_BlackholePulsate @ L3040-3045 — DETTE EXPLICITE (mugshots E4-Champion / weave-CircularMask machinery légendaires / frontier wrappers — hors démo)
- [x] Blackhole_Init @ L3046-3070 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Blackhole_GrowEnd @ L3071-3102 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Blackhole_Vibrate @ L3103-3124 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] BlackholePulsate_Main @ L3125-3185 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Task_RectangularSpiral @ L3186-3190 — DETTE EXPLICITE (mugshots E4-Champion / weave-CircularMask machinery légendaires / frontier wrappers — hors démo)
- [x] RectangularSpiral_Init @ L3191-3234 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] RectangularSpiral_Main @ L3235-3274 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] RectangularSpiral_End @ L3275-3283 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] UpdateRectangularSpiralLine @ L3284-3370 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Task_Groudon @ L3371-3375 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Groudon_Init @ L3376-3389 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Groudon_PaletteFlash @ L3390-3405 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Groudon_PaletteBrighten @ L3406-3433 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Task_Rayquaza @ L3434-3438 — DETTE EXPLICITE (mugshots E4-Champion / weave-CircularMask machinery légendaires / frontier wrappers — hors démo)
- [x] Rayquaza_Init @ L3439-3465 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Rayquaza_SetGfx @ L3466-3475 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Rayquaza_PaletteFlash @ L3476-3492 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Rayquaza_FadeToBlack @ L3493-3504 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Rayquaza_WaitFade @ L3505-3514 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Rayquaza_SetBlack @ L3515-3523 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Rayquaza_TriRing @ L3524-3553 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Task_GridSquares @ L3769-3773 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] GridSquares_Init @ L3774-3786 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] GridSquares_Main @ L3787-3807 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] GridSquares_End @ L3808-3828 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] Task_AngledWipes (0ec3866f) @ L3829-3833 — porté 1:1 (state machine inline du miroir) ; A/B sélecteur=11 cache chaud, visuel wipe = œil user (dette course __gTrainers 1er boot)
- [x] AngledWipes_Init (0ec3866f) @ L3834-3854 — porté 1:1 (buffers WIN0H pleins + WIN0 + HBlank) ; A/B sélecteur=11 cache chaud, visuel wipe = œil user (dette course __gTrainers 1er boot)
- [x] AngledWipes_SetWipeData (0ec3866f) @ L3855-3867 — porté 1:1 (InitBlackWipe + MoveData[wipeId]) ; A/B sélecteur=11 cache chaud, visuel wipe = œil user (dette course __gTrainers 1er boot)
- [x] AngledWipes_DoWipe (0ec3866f) @ L3868-3907 — porté 1:1 (16 pas/frame, resserre left/right selon dir) ; A/B sélecteur=11 cache chaud, visuel wipe = œil user (dette course __gTrainers 1er boot)
- [x] AngledWipes_TryEnd (0ec3866f) @ L3908-3926 — porté 1:1 (7 wipes puis FadeScreenBlack) ; A/B sélecteur=11 cache chaud, visuel wipe = œil user (dette course __gTrainers 1er boot)
- [x] AngledWipes_StartNext (0ec3866f) @ L3927-3938 — porté 1:1 (EndDelays) ; A/B sélecteur=11 cache chaud, visuel wipe = œil user (dette course __gTrainers 1er boot)
- [x] VBlankCB_AngledWipes (0ec3866f) @ L3939-3967 — porté (copy buf[0]→[1] + WIN0H par-scanline via HBlank du miroir) ; A/B sélecteur=11 cache chaud, visuel wipe = œil user (dette course __gTrainers 1er boot)
- [x] IsIntroTaskDone @ L3979-3986 — équivalence infra DOCUMENTÉE : _makeBattleStartTransitionCB2 (battle-decomp-loop.ts:144, CB2 inline = Task_BattleStart+Task_Intro+dispatch) — renommage nominal au déplacement miroir
- [x] GetBg0TilemapDst (0ec3866f) @ L4063-4069 — équivalence : bg(0).tilemap direct (vue runtime) — utilisé par PokeballsTrail/futures wipes BG0 ; A/B sélecteur=11 cache chaud, visuel wipe = œil user (dette course __gTrainers 1er boot)
- [x] GetBg0TilesDst @ L4070-4081 — équivalence infra DOCUMENTÉE : _makeBattleStartTransitionCB2 (battle-decomp-loop.ts:144, CB2 inline = Task_BattleStart+Task_Intro+dispatch) — renommage nominal au déplacement miroir
- [x] SetSinWave @ L4087-4093 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] SetCircularMask @ L4094-4145 — DETTE EXPLICITE zone (cave/eau/flash : Shuffle-BigPokeball-Wave-Ripple-ClockwiseWipe-GridSquares-Swirl ; scénario/légendaires : Aqua-Magma-Regi-Kyogre-Groudon — hors démo Littleroot/Routes 102-103)
- [x] InitBlackWipe (0ec3866f) @ L4146-4172 — porté 1:1 (:4146-4171, Bresenham init — réutilisable ClockwiseWipe etc.) ; A/B sélecteur=11 cache chaud, visuel wipe = œil user (dette course __gTrainers 1er boot)
- [x] UpdateBlackWipe (0ec3866f) @ L4173-4239 — porté 1:1 (:4173-4239) ; A/B sélecteur=11 cache chaud, visuel wipe = œil user (dette course __gTrainers 1er boot)
- [x] FrontierLogoWiggle_Init @ L4240-4253 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] FrontierLogoWiggle_SetGfx @ L4254-4265 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Task_FrontierLogoWiggle @ L4266-4285 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Task_FrontierLogoWave @ L4286-4290 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] FrontierLogoWave_Init @ L4291-4316 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] FrontierLogoWave_SetGfx @ L4317-4327 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] FrontierLogoWave_InitScanline @ L4328-4342 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] FrontierLogoWave_Main @ L4343-4397 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] VBlankCB_FrontierLogoWave @ L4398-4407 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] HBlankCB_FrontierLogoWave @ L4408-4433 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Task_FrontierSquares @ L4434-4438 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Task_FrontierSquaresSpiral @ L4439-4443 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Task_FrontierSquaresScroll @ L4444-4448 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] FrontierSquares_Init @ L4449-4470 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] FrontierSquares_Draw @ L4471-4492 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] FrontierSquares_Shrink @ L4493-4543 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] FrontierSquaresSpiral_Init @ L4544-4565 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] FrontierSquaresSpiral_Outward @ L4566-4584 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] FrontierSquaresSpiral_SetBlack @ L4585-4597 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] FrontierSquaresSpiral_Inward @ L4598-4631 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] FrontierSquares_End @ L4632-4649 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] Task_ScrollBg @ L4650-4660 — DETTE EXPLICITE (mugshots E4-Champion / weave-CircularMask machinery légendaires / frontier wrappers — hors démo)
- [x] FrontierSquaresScroll_Init @ L4661-4704 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] FrontierSquaresScroll_Draw @ L4705-4724 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] FrontierSquaresScroll_SetBlack @ L4725-4734 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] FrontierSquaresScroll_Erase @ L4735-4755 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)
- [x] FrontierSquaresScroll_End @ L4756-4777 — DETTE EXPLICITE (debug UNUSED / frontier / légendaires / mugshots gym-E4 / ShredSplit-Blackhole-Spiral frontier : zones hors démo)

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
