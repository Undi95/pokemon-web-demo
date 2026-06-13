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
- [x] Unused_ApplyRandomDmgMultiplier @ L1653-1657 — DETTE — Unused décomp (préfixe)
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
- [x] CreateTasksForSendRecvLinkBuffers @ L701-733 — DETTE EXPLICITE link (multi-joueur non porté)
- [x] Task_HandleSendLinkBuffersData @ L775-870 — DETTE link
- [x] TryReceiveLinkBattleData @ L871-908 — DETTE link
- [x] Task_HandleCopyReceivedLinkBuffersData @ L909-967 — DETTE link

## battle_controller_player.c — 111/124 fonctions couvertes (90%) · cite:49 + symbole:62 · 89 citations
- [x] CompleteOnBankSpritePosX_0 @ L227-232 — ÉQUIVALENCE : notre TrainerSlideBack poll x2/visible (slide-back validé à chaque intro dresseur) — renommage nominal au déplacement miroir
- [x] UnusedEndBounceEffect @ L332-338 — DETTE — Unused décomp (préfixe)
- [x] HandleMoveInputUnused @ L617-666 — DETTE — Unused décomp (préfixe)
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

## battle_interface.c — ✅ SOLDÉ (42 portés + 11 qualifiés : debug/dummied ×5, safari ×3, doubles ×1, arène ×1, équivalence ×1)
- [x] DummiedOutFunction @ L770-774 — DETTE — dummied décomp (corps vide, args unused)
- [x] Debug_DrawNumber @ L775-843 — DETTE — debug UNUSED en release
- [x] Debug_DrawNumberPair @ L844-868 — DETTE — debug UNUSED
- [x] CreateSafariPlayerHealthboxSprites @ L953-972 — DETTE safari (healthbox safari — zone hors démo, cohérent contrôleur safari)
- [x] UpdateHpTextInHealthboxInDoubles @ L1216-1311 — DETTE doubles (combats doubles hors démo — à porter au chantier doubles)
- [x] PrintSafariMonInfo @ L1312-1375 — DETTE safari
- [x] GetStatusIconForBattlerId @ L2074-2133 — ÉQUIVALENCE : le mapping statusElementId+battler est inliné dans notre UpdateStatusIconInHealthbox (chemin ACTIF — icônes status A/B-validées, ball status Treecko BURN bug #1) ; renommage nominal au déplacement miroir battle_interface
- [x] UpdateSafariBallsTextOnHealthbox @ L2134-2145 — DETTE safari
- [x] UpdateLeftNoOfBallsTextOnHealthbox @ L2146-2162 — DETTE (texte balls restantes — arène/multi, aucun caller externe actif)
- [x] Debug_TestHealthBar @ L2462-2481 — DETTE — debug UNUSED
- [x] Debug_TestHealthBar_Helper @ L2482-2496 — DETTE — debug UNUSED

## battle_gfx_sfx_util.c — 49/53 fonctions couvertes (92%) · cite:9 + symbole:40 · 34 citations
- [x] Task_ClearBitWhenSpecialAnimDone  @ L535-547 — porté 1:1 commit 02fcd96c (battle_gfx_sfx_util.ts, avec InitAndLaunchSpecialAnimation :523-533 ; tick anim + clear specialAnimActive, A/B switch réel)
- [x] BattleGfxSfxDummy1 @ L693-696 — DETTE — dummy décomp (corps vide)
- [x] BattleGfxSfxDummy2 @ L697-700 — DETTE — dummy décomp
- [x] BattleGfxSfxDummy3 @ L728-731 — DETTE — dummy décomp

## battle_message.c — 9/10 fonctions couvertes (90%) · cite:8 + symbole:1 · 69 citations
- [x] ChooseMoveUsedParticle @ L2959-2998 — DETTE contest (particules du nom de move au concours — hors démo)

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

## pokeball.c — ✅ SOLDÉ (22 portés + 15 qualifiés : 10 code mort capture (flux réel=battle_anim_throw), 4 dette trade, 1 équivalence)
- [x] SpriteCB_BallThrow_ReachMon @ L456-460 — CODE MORT décomp pour la capture : le flux réel = battle_anim_throw.c SpriteCB_Ball_* (porté 1:1 battle_anim_throw.ts, A/B capture 100% commits 30faa4a0+417edf4b+de2df95e). Ces états du callback template (dispatch data[7] throwCaseId) ne tournent jamais : la capture passe par InitAndLaunchSpecialAnimation(B_ANIM_BALL_THROW), le send-out par SpriteCB_*MonSendOut (pokeball.ts #18-22 validé)
- [x] SpriteCB_BallThrow_StartShrinkMon @ L461-472 — CODE MORT décomp pour la capture : le flux réel = battle_anim_throw.c SpriteCB_Ball_* (porté 1:1 battle_anim_throw.ts, A/B capture 100% commits 30faa4a0+417edf4b+de2df95e). Ces états du callback template (dispatch data[7] throwCaseId) ne tournent jamais : la capture passe par InitAndLaunchSpecialAnimation(B_ANIM_BALL_THROW), le send-out par SpriteCB_*MonSendOut (pokeball.ts #18-22 validé)
- [x] SpriteCB_BallThrow_ShrinkMon @ L473-492 — CODE MORT décomp pour la capture : le flux réel = battle_anim_throw.c SpriteCB_Ball_* (porté 1:1 battle_anim_throw.ts, A/B capture 100% commits 30faa4a0+417edf4b+de2df95e). Ces états du callback template (dispatch data[7] throwCaseId) ne tournent jamais : la capture passe par InitAndLaunchSpecialAnimation(B_ANIM_BALL_THROW), le send-out par SpriteCB_*MonSendOut (pokeball.ts #18-22 validé)
- [x] SpriteCB_BallThrow_Close @ L493-509 — CODE MORT décomp pour la capture : le flux réel = battle_anim_throw.c SpriteCB_Ball_* (porté 1:1 battle_anim_throw.ts, A/B capture 100% commits 30faa4a0+417edf4b+de2df95e). Ces états du callback template (dispatch data[7] throwCaseId) ne tournent jamais : la capture passe par InitAndLaunchSpecialAnimation(B_ANIM_BALL_THROW), le send-out par SpriteCB_*MonSendOut (pokeball.ts #18-22 validé)
- [x] SpriteCB_BallThrow_FallToGround @ L510-569 — CODE MORT décomp pour la capture : le flux réel = battle_anim_throw.c SpriteCB_Ball_* (porté 1:1 battle_anim_throw.ts, A/B capture 100% commits 30faa4a0+417edf4b+de2df95e). Ces états du callback template (dispatch data[7] throwCaseId) ne tournent jamais : la capture passe par InitAndLaunchSpecialAnimation(B_ANIM_BALL_THROW), le send-out par SpriteCB_*MonSendOut (pokeball.ts #18-22 validé)
- [x] SpriteCB_BallThrow_StartShakes @ L570-582 — CODE MORT décomp pour la capture : le flux réel = battle_anim_throw.c SpriteCB_Ball_* (porté 1:1 battle_anim_throw.ts, A/B capture 100% commits 30faa4a0+417edf4b+de2df95e). Ces états du callback template (dispatch data[7] throwCaseId) ne tournent jamais : la capture passe par InitAndLaunchSpecialAnimation(B_ANIM_BALL_THROW), le send-out par SpriteCB_*MonSendOut (pokeball.ts #18-22 validé)
- [x] SpriteCB_BallThrow_Shake @ L583-664 — CODE MORT décomp pour la capture : le flux réel = battle_anim_throw.c SpriteCB_Ball_* (porté 1:1 battle_anim_throw.ts, A/B capture 100% commits 30faa4a0+417edf4b+de2df95e). Ces états du callback template (dispatch data[7] throwCaseId) ne tournent jamais : la capture passe par InitAndLaunchSpecialAnimation(B_ANIM_BALL_THROW), le send-out par SpriteCB_*MonSendOut (pokeball.ts #18-22 validé)
- [x] SpriteCB_BallThrow_StartCaptureMon @ L836-844 — CODE MORT décomp pour la capture : le flux réel = battle_anim_throw.c SpriteCB_Ball_* (porté 1:1 battle_anim_throw.ts, A/B capture 100% commits 30faa4a0+417edf4b+de2df95e). Ces états du callback template (dispatch data[7] throwCaseId) ne tournent jamais : la capture passe par InitAndLaunchSpecialAnimation(B_ANIM_BALL_THROW), le send-out par SpriteCB_*MonSendOut (pokeball.ts #18-22 validé)
- [x] SpriteCB_BallThrow_CaptureMon @ L886-910 — CODE MORT décomp pour la capture : le flux réel = battle_anim_throw.c SpriteCB_Ball_* (porté 1:1 battle_anim_throw.ts, A/B capture 100% commits 30faa4a0+417edf4b+de2df95e). Ces états du callback template (dispatch data[7] throwCaseId) ne tournent jamais : la capture passe par InitAndLaunchSpecialAnimation(B_ANIM_BALL_THROW), le send-out par SpriteCB_*MonSendOut (pokeball.ts #18-22 validé)
- [x] LaunchBallFadeMonTaskForPokeball @ L1012-1030 — wrapper privé du chemin code-mort ci-dessus ; le réel = LaunchBallFadeMonTask (pokeball-effects.ts, consommé par capture + switch-out + send-out)
- [x] CreateTradePokeballSprite @ L1143-1159 — DETTE EXPLICITE trade (échange hors démo — CreateTradePokeballSprite appelé par trade.c:3480/3951 uniquement)
- [x] SpriteCB_TradePokeball @ L1160-1193 — DETTE EXPLICITE trade (échange hors démo — CreateTradePokeballSprite appelé par trade.c:3480/3951 uniquement)
- [x] SpriteCB_TradePokeballSendOff @ L1194-1216 — DETTE EXPLICITE trade (échange hors démo — CreateTradePokeballSprite appelé par trade.c:3480/3951 uniquement)
- [x] SpriteCB_TradePokeballEnd @ L1217-1230 — DETTE EXPLICITE trade (échange hors démo — CreateTradePokeballSprite appelé par trade.c:3480/3951 uniquement)
- [x] DestroySpriteAndFreeResources_Ball @ L1231-1240 — équivalence : HandleBallAnimEnd (pokeball.ts) détruit ball+free par TAG — helper des chaînes code-mort/trade ci-dessus

## battle_anim.c — 79/79 fonctions couvertes (100%) · cite:79 + symbole:0 · 119 citations
- ✓ complet

## battle_anim_mons.c — 105/128 fonctions couvertes (82%) · cite:61 + symbole:44 · 219 citations
- [x] GetSubstituteSpriteDefault_Y @ L332-341 — PORTÉ 1:1 (battle_anim_mons.ts : +16 adverse/+17 joueur sur BATTLER_COORD_Y, & 0xFF) — consommateurs (gfx swap substitute :1078 + reshow :215) encore en dette R3 (SwapMonSpriteToFromSubstitute stub), la fonction est prête
- [x] TranslateSpriteInLissajousCurve @ L489-515 — DETTE — `static void UNUSED` (.c:489)
- [x] AnimPosToTranslateLinear @ L572-578 — DETTE LIÉE — callers uniques = TranslateSpriteToBattleTargetPos (:647, mort) + ToBattleAttackerPos (:714, mort)
- [x] ConvertPosDataToTranslateLinearData @ L579-592 — DETTE LIÉE — callers = AnimPosToTranslateLinear (lié-mort) + Trade_MoveSelectedMonToTarget (trade)
- [x] TranslateSpriteLinearFixedPointIconFrame @ L623-640 — DETTE LIÉE — caller unique :1051 = Trade_MoveSelectedMonToTarget (trade.c)
- [x] TranslateSpriteToBattleTargetPos @ L641-650 — DETTE — code mort total (déf seule, aucun caller .c ni .h)
- [x] TranslateSpriteToBattleAttackerPos @ L708-722 — DETTE — code mort total (idem)
- [x] EndUnkPaletteAnim @ L723-728 — DETTE — code mort total (resliquat UnkPaletteAnim RS)
- [x] GetBattleAnimBgData @ L933-958 — ÉQUIVALENCE — le struct-getter C (bgId→{bgTiles,bgTilemap,paletteId,tilesOffset}) est DISSOUS dans nos fonctions paramétrées par bgId (GetBattleAnimBg1Data interpreter:784 + ClearBattleAnimBg(bgId) :820 + AnimLoadCompressed*(bgId,…)) ; paletteId 8/9 posés aux sites (monbg, StatsChange)
- [x] InitAnimBgTilemapBuffer @ L1004-1009 — ÉQUIVALENCE INLINÉE — le memcpy src→buffer est inliné dans AnimLoadCompressedBgTilemap (interpreter:798), ses 2 seuls callers .c (:1012/:1018)
- [x] AnimLoadCompressedBgTilemapHandleContest @ L1016-1023 — ÉQUIVALENCE — = InitAnimBgTilemapBuffer + RelocateBattleBgPal SI contest (IsContest()=false 1:1 post-camion → no-op) + CopyBgTilemapBufferToVram = exactement notre AnimLoadCompressedBgTilemap (interpreter:798)
- [x] Trade_MoveSelectedMonToTarget @ L1046-1054 — DETTE — callers = trade.c uniquement (hors combat démo)
- [x] StartAnimLinearTranslation_SetCornerVecX @ L1102-1110 — DETTE — code mort total (déf seule)
- [x] AnimTranslateLinear_WithFollowup_SetCornerVecX @ L1148-1154 — DETTE — `// Functionally unused` (.c:1147 officiel) ; unique caller :1107 = StartAnimLinearTranslation_SetCornerVecX (code mort coché ci-dessus)
- [x] ArcTan2_ @ L1363-1367 — ÉQUIVALENCE — wrapper interne de ArcTan2 (caller unique :1370 = ArcTan2Neg, dont la copie TS locale battle_anim_flying.ts:835 consomme ArcTan2 du bridge directement)
- [x] GetSpritePalIdxByBattler @ L1505-1509 — ÉQUIVALENCE INLINÉE — corps = `return battler` (identité GBA slot==battler) ; le caller unique utility_funcs.c:103 `0x10000 << GetSpritePalIdxByBattler(b)` est inliné 1:1 dans le miroir utility (battle_anim_utility_funcs.ts:501 `1 << (battler + 16)`), la résolution slot-réel est faite en aval par le bridge palette (F72)
- [x] GetSpritePalIdxByPosition @ L1510-1514 — DETTE — code mort total (ByBattler ne l'appelle pas, aucun autre caller)
- [x] AnimThrowProjectile_Step @ L1585-1590 — renommé au nom C exact (ex-_ThrowProjectile_Step, corps 1:1 TranslateAnimHorizontalArc→destroy)
- [x] AnimTask_BlendPalInAndOutSetup @ L1726-1737 — renommé au nom C exact (ex-_BlendPalInAndOutSetup)
- [x] AnimTask_BlendMonInAndOut_Step @ L1738-1773 — renommé au nom C exact (ex-_BlendMonInAndOut_Step)
- [x] SetPriorityForVisibleBattlers @ L2009-2020 — DETTE — code mort total (déf seule)
- [x] AnimTranslateLinearAndFlicker_Flipped @ L2335-2357 — PORTÉ 1:1 + enregistré (registerAnimCallbacks) — NB : ses 2 seuls templates (status_effects.c:56 sFlickeringOrbFlipped + :199 sFlickeringShrinkOrb) sont marqués `// Unused` dans le .c → INATTEIGNABLE en jeu, port par complétude (sanity boot OK)
- [x] AnimWeatherBallUp_Step @ L2522-2533 — renommé au nom C exact (ex-_WeatherBallUp_Step)

## battle_anim_effects_1.c — 125/154 fonctions couvertes (81%) · cite:3 + symbole:122 · 89 citations
- [x] AnimMovePowderParticle_Step @ L2213-2229 — renommé au nom C exact (ex-_MovePowderParticle_Step)
- [x] AnimSolarBeamSmallOrb_Step @ L2274-2295 — renommé au nom C exact (ex-_SolarBeamSmallOrb_Step)
- [x] AnimTask_CreateSmallSolarBeamOrbs @ L2296-2314 — PORTÉ 1:1 (pose args {15,0,80,0} mutation buffer vivant + spawn gSolarBeamSmallOrbSpriteTemplate ×15 toutes les 7f, pattern F73 tags + callback local) + enregistré ; A/B TOUR RÉEL SolarBeam : task active, 11 orbes simultanés mesurés
- [x] AnimAbsorptionOrb_Step @ L2328-2335 — renommé au nom C exact (ex-_AbsorptionOrb_Step)
- [x] AnimLeechSeed_Step @ L2399-2409 — renommé au nom C exact (ex-_LeechSeed_Step)
- [x] AnimLeechSeedSprouts @ L2410-2421 — renommé au nom C exact (ex-_LeechSeedSprouts)
- [x] AnimSporeParticle_Step @ L2437-2462 — renommé au nom C exact (ex-_SporeParticle_Step)
- [x] AnimRazorLeafParticle_Step1 @ L2564-2589 — renommé au nom C exact (ex-_RazorLeaf_Step1)
- [x] AnimRazorLeafParticle_Step2 @ L2590-2609 — renommé au nom C exact (ex-_RazorLeaf_Step2)
- [x] AnimTranslateLinearSingleSineWave_Step @ L2641-2673 — renommé au nom C exact (ex-_TranslateLinearSingleSineWave_Step)
- [x] AnimMoveTwisterParticle_Step @ L2690-2718 — renommé au nom C exact (ex-_MoveTwisterParticle_Step)
- [x] AnimTask_DuplicateAndShrinkToPos_Step1 @ L2792-2809 — renommé au nom C exact (ex-_DuplicateAndShrink_Step1)
- [x] AnimTask_DuplicateAndShrinkToPos_Step2 @ L2810-2839 — renommé au nom C exact (ex-_DuplicateAndShrink_Step2)
- [x] AnimKnockOffOpponentsItem @ L3044-3061 — PORTÉ 1:1 (sous-système ITEM BAG complet .c:2947-3153 : InitItemBagData + moveAlongLinearPath + ItemSteal_Step1/2/3 + Present + ItemSteal + KnockOff ×2, 8 fns)
- [x] AnimKnockOffItem @ L3062-3088 — PORTÉ 1:1 + enregistré (callback de gKnockOffItemSpriteTemplate = General_ItemKnockoff, joue quand un objet est arraché en combat réel) ; verify MOVE_KNOCK_OFF fidele 0 defect
- [x] LeafBladeGetPosFactor @ L3466-3474 — renommé au nom C exact (ex-_lbGetPosFactor, ±8 selon data[4] vs y)
- [x] AnimFlyingParticle_Step @ L3571-3591 — renommé au nom C exact (ex-_FlyingParticle_Step)
- [x] AnimWhipHit_WaitEnd @ L3697-3702 — ÉQUIVALENCE — corps 1:1 (`if animEnded → destroy`) = _WaitTableAnimEnd_Destroy partagé avec AnimSlidingHit (corps C strictement identiques)
- [x] AnimFlickeringPunch @ L3734-3753 — DETTE — callback du seul sFlickeringPunchSpriteTemplate, marqué `// Unused` (.c:1205) → inatteignable
- [x] UnusedFlickerAnim @ L3854-3886 — DETTE — `static void UNUSED` (.c:3854)
- [x] AnimBubbleBurst_Step @ L4174-4186 — renommé au nom C exact (ex-_BubbleBurst_Step)
- [x] AnimSleepLetterZ_Step @ L4209-4218 — renommé au nom C exact (ex-_SleepLetterZ_Step)
- [x] AnimTipMon @ L4505-4510 — PORTÉ 1:1 (effects_1.ts, sprite contrôleur → Step)
- [x] AnimTipMon_Step @ L4511-4547 — PORTÉ 1:1 + enregistré (rotation attaquant ±0x200/f ×4 aller-retour via Prepare/SetSpriteRotScale + YOffsetFromRotation + Reset ; fall-through C → if-chain sémantique identique)
- [x] AnimTask_SkullBashPositionSet @ L4588-4678 — renommé au nom C exact (ex-_SkullBashSet, machine 5 états x2/RotScale/shake/dash)
- [x] AnimTask_SkullBashPositionReset @ L4679-4695 — renommé au nom C exact (ex-_SkullBashReset, RotScale inverse + Reset)
- [x] AnimTask_HideBattlersHealthbox @ L4920-4936 — DETTE — `static void UNUSED` (.c:4920)
- [x] AnimTask_ShowBattlersHealthbox @ L4937-4945 — DETTE — `static void UNUSED` (.c:4937)
- [x] AnimTask_MoonlightEndFade_Step @ L5030-5107 — renommé au nom C exact (ex-_MoonlightEndFade_Step)

## battle_anim_effects_2.c — 97/121 fonctions couvertes (80%) · cite:55 + symbole:42 · 97 citations
- [x] AnimCirclingFinger @ L1270-1288 — DETTE — callback du seul sCirclingFingerSpriteTemplate, marqué `// Unused` (.c effects_2) → inatteignable
- [x] AnimBouncingMusicNote @ L1289-1302 — DETTE — template sBouncingMusicNoteSpriteTemplate `// Unused` → inatteignable
- [x] AnimBouncingMusicNote_Step @ L1303-1323 — DETTE — step du précédent (Unused)
- [x] AnimVibrateBattlerBack_Step @ L1324-1338 — PORTÉ 1:1 (effects_2.ts : shake x2 alterné du sprite cible, reset + DestroySpriteAndMatrix)
- [x] AnimVibrateBattlerBack @ L1339-1357 — PORTÉ 1:1 + enregistré (contrôleur invisible ancré attaquant, secoue le battler cible)
- [x] AnimMovingClamp @ L1358-1367 — PORTÉ 1:1 + enregistré (WaitAnimForDuration → Step)
- [x] AnimMovingClamp_Step @ L1368-1376 — PORTÉ 1:1 (translate vers y+15 → End)
- [x] AnimMovingClamp_End @ L1377-1386 — PORTÉ 1:1 (data[5] répétitions puis destroy)
- [x] AnimTask_Withdraw_Step @ L1393-1441 — renommé au nom C exact (ex-_Withdraw_Step)
- [x] AnimVoidLines @ L1751-1757 — PORTÉ 1:1 + enregistré (data[0]=OBJ_PLTT_ID du bank du sprite)
- [x] AnimVoidLines_Step @ L1758-1777 — PORTÉ 1:1 (rotation couleurs 8..15 de la palette toutes les 2f ×24 — palette-cycle 1:1 sur gPlttBufferFaded)
- [x] AnimTask_Minimize_Step @ L2052-2117 — renommé au nom C exact (ex-_Minimize_Step)
- [x] AnimTask_GrowAndShrink_Step @ L2245-2254 — renommé au nom C exact (ex-_GrowAndShrink_Step)
- [x] AnimTask_ThrashMoveMonHorizontal_Step @ L2314-2321 — renommé au nom C exact (ex-_ThrashH_Step)
- [x] AnimTask_ThrashMoveMonVertical_Step @ L2341-2391 — renommé au nom C exact (ex-_ThrashV_Step)
- [x] AnimTask_AttackerStretchAndDisappear_Step @ L2803-2813 — renommé au nom C exact (ex-_StretchDisappear_Step)
- [x] AnimTask_ExtremeSpeedImpact_Step @ L2837-2882 — renommé au nom C exact (ex-_ExSpeedImpact_Step)
- [x] AnimTask_ExtremeSpeedMonReappear_Step @ L2897-2924 — renommé au nom C exact (ex-_ExSpeedReappear_Step)
- [x] AnimTask_SpeedDust_Step @ L2943-3010 — renommé au nom C exact (ex-_SpeedDust_Step)
- [x] AnimTask_FakeOut_Step1 @ L3100-3114 — renommé au nom C exact (ex-_FakeOut_Step1)
- [x] AnimTask_FakeOut_Step2 @ L3115-3134 — renommé au nom C exact (ex-_FakeOut_Step2)
- [x] AnimTask_HeartsBackground_Step @ L3270-3325 — renommé au nom C exact (ex-_HeartsBackground_Step)
- [x] AnimTask_ScaryFace_Step @ L3354-3414 — renommé au nom C exact (ex-_ScaryFace_Step)
- [x] AnimTask_UproarDistortion_Step @ L3672-3677 — renommé au nom C exact (ex-_Uproar_Step)

## battle_anim_effects_3.c — 105/140 fonctions couvertes (75%) · cite:33 + symbole:72 · 86 citations
- [x] SetPsychicBackground_Step @ L1378-1397 — renommé au nom C exact (ex-_PsychicBg_Step)
- [x] FadeScreenToWhite_Step @ L1404-1428 — renommé au nom C exact (ex-_FadeScreenToWhite_Step privé)
- [ ] AnimLeer  @ L1468-1476
- [ ] AnimFang  @ L1515-1520
- [x] RapinSpinMonElevation_Step @ L1833-1891 — renommé au nom C exact (typo « Rapin » = vanilla)
- [x] TormentAttacker_Step @ L1907-2005 — renommé au nom C exact
- [ ] AnimTask_DoomDesireLightBeam  @ L2556-2657
- [ ] AnimTask_StrongFrustrationGrowAndShrink  @ L2658-2674
- [ ] AnimWeakFrustrationAngerMark  @ L2675-2701
- [x] AnimTask_RockMonBackAndForth_Step @ L2742-2799 — renommé au nom C exact (ex-_RockMonBF_Step)
- [x] AnimTask_FlailMovement_Step @ L2862-2936 — renommé au nom C exact (ex-_Flail_Step)
- [x] AnimTask_RolePlaySilhouette_Step1 @ L3263-3278 — renommé au nom C exact
- [x] AnimTask_RolePlaySilhouette_Step2 @ L3279-3295 — renommé au nom C exact
- [x] AnimTask_DeepInhale_Step @ L3483-3511 — renommé au nom C exact (ex-_DeepInhale_Step)
- [ ] AnimSmokeBallEscapeCloud  @ L3570-3581
- [ ] AnimTask_SlideMonForFocusBand_Step2  @ L3582-3631
- [ ] AnimTask_SlideMonForFocusBand_Step1  @ L3632-3684
- [ ] AnimTask_SlideMonForFocusBand  @ L3685-3741
- [x] AnimTask_SquishAndSweatDroplets_Step @ L3767-3803 — renommé au nom C exact (ex-_SquishSweat_Step)
- [ ] CreateSweatDroplets  @ L3804-3845
- [ ] AnimFacadeSweatDrop  @ L3846-3874
- [x] AnimTask_FacadeColorBlend_Step @ L3886-3903 — renommé au nom C exact (ex-_FacadeBlend_Step)
- [x] AnimTask_GlareEyeDots_Step @ L4017-4087 — renommé au nom C exact (ex-_GlareEyeDots_Step)
- [x] GetGlareEyeDotCoords @ L4088-4113 — renommé au nom C exact (retour [x,y] TS ≡ out-params C)
- [x] AnimGlareEyeDot @ L4114-4144 — renommé au nom C exact (ex-_AnimGlareEyeDot)
- [x] AnimTask_BarrageBall_Step @ L4185-4231 — renommé au nom C exact (ex-_BarrageBall_Step)
- [x] AnimTask_SmellingSaltsSquish_Step @ L4322-4354 — renommé au nom C exact (ex-_SmellingSalts_Step)
- [x] AnimTask_HelpingHandAttackerMovement_Step @ L4528-4611 — renommé au nom C exact (ex-_HelpingHand_Step)
- [x] AnimTask_OdorSleuthMovementWaitFinish @ L5018-5023 — renommé au nom C exact (ex-_OdorSleuthWait)
- [x] MoveOdorSleuthClone @ L5024-5059 — renommé au nom C exact (ex-_MoveOdorSleuthClone)
- [ ] AnimTask_SnatchOpposingMonMove  @ L5077-5221
- [x] AnimUnusedItemBagSteal @ L5222-5266 — DETTE — préfixe Unused + template sUnusedItemBagStealSpriteTemplate (.c:1096) jamais référencé par les scripts → inatteignable
- [ ] AnimTask_SnatchPartnerMove  @ L5267-5327
- [x] AnimTask_TeeterDanceMovement_Step @ L5342-5375 — renommé au nom C exact (ex-_TeeterDance_Step)
- [x] AnimTask_SlackOffSquish_Step @ L5523-5548 — renommé au nom C exact (ex-_SlackOff_Step)

## battle_anim_water.c — 48/48 fonctions couvertes (100%) · cite:15 + symbole:23 · 37 citations
- [x] AnimRainDrop @ L508-512 — ÉQUIVALENCE : init inliné dans AnimTask_CreateRaindrops (le spawner assigne directement le _Step, base présente battle_anim_water.ts)
- [x] AnimRainDrop_Step @ L513-528 — renommé au nom C exact (ex-_AnimRainDrop_Step)
- [x] AnimWaterBubbleProjectile_Step1 @ L566-587 — DETTE DOUCE documentée (template → TranslateAnimSpriteToTargetMonLocation, trajectoire sinusoïdale absente, cf. en-tête battle_anim_water.ts:6)
- [x] AnimWaterBubbleProjectile_Step2 @ L588-594 — DETTE DOUCE (idem Step1)
- [x] AnimWaterBubbleProjectile_Step3 @ L595-601 — DETTE DOUCE (idem Step1)
- [x] AnimTask_RotateAuroraRingColors_Step @ L641-660 — renommé au nom C exact (ex-_RotateAuroraRingColors_Step, vague F80)
- [x] AnimTask_RunSinAnimTimer @ L711-718 — renommé au nom C exact (ex-_RunSinAnimTimer, le step d AnimTask_StartSinAnimTimer)
- [x] AnimTask_WaterSpoutLaunch_Step @ L1065-1151 — renommé au nom C exact (ex-_WaterSpoutLaunch_Step, state machine fallthrough 1:1 présente)
- [x] AnimTask_WaterSpoutRain_Step @ L1260-1302 — renommé au nom C exact (ex-_WaterSpoutRain_Step)
- [x] AnimTask_WaterSport_Step @ L1374-1442 — renommé au nom C exact (ex-_WaterSport_Step)

## battle_anim_fire.c — 32/35 fonctions couvertes (91%) · cite:20 + symbole:12 · 36 citations
- [x] AnimUnusedSmallEmber_Step @ L577-603 — DETTE — Unused décomp (préfixe)
- [x] AnimTask_EruptionLaunchRocks_Step @ L815-921 — ÉQUIVALENCE : _Step inliné dans le port de sa task (state machine fusionnée, convention des miroirs anims — base vérifiée présente src/game)
- [x] AnimTask_MoveHeatWaveTargets_Step @ L1239-1328 — ÉQUIVALENCE : _Step inliné dans le port de sa task (state machine fusionnée, convention des miroirs anims — base vérifiée présente src/game)

## battle_anim_electric.c — 37/37 fonctions couvertes (100%) · cite:17 + symbole:11 · 30 citations
- [x] AnimUnusedSpinningFist @ L476-485 — DETTE — Unused décomp (préfixe)
- [x] AnimUnusedSpinningFist_Step @ L486-491 — DETTE — Unused décomp (préfixe)
- [x] AnimUnusedCirclingShock @ L492-514 — DETTE — Unused décomp (préfixe)
- [x] AnimTask_ElectricBolt_Step @ L693-761 — renommé au nom C exact (ex-_ElectricBolt_Step, battle_anim_electric.ts ; A/B Thunderbolt 85 : fidèle 386f)
- [x] AnimElectricBoltSegment @ L762-778 — renommé au nom C exact (ex-_ElectricBoltSegment)
- [x] AnimTask_ElectricChargingParticles_Step @ L831-879 — renommé au nom C exact (ex-_ElectricChargingParticles_Step)
- [x] AnimElectricChargingParticles @ L889-894 — restructuré 1:1 graphe C (callback initial StartSpriteAnim(1) → AnimElectricChargingParticles_Step, ex-inline ; A/B Charge 268 : fin naturelle 720f sans résiduel — anim longue en ROM, flag « duree » du sweep = heuristique)
- [x] CreateVoltTackleBolt @ L1095-1124 — renommé au nom C exact (ex-_CreateVoltBolt ; A/B Volt Tackle 344 : fin naturelle 698f, 0 résiduel)
- [x] AnimVoltTackleBolt @ L1125-1134 — renommé au nom C exact (ex-_AnimVoltBolt)

## battle_anim_ice.c — 32/32 fonctions couvertes (100%) · cite:20 + symbole:7 · 36 citations
- [x] AnimUnusedIceCrystalThrow @ L532-570 — DETTE — Unused décomp (préfixe)
- [x] AnimUnusedIceCrystalThrow_Step @ L571-591 — DETTE — Unused décomp (préfixe)
- [x] AnimTask_HazeScrollingFog_Step @ L1018-1089 — renommé au nom C exact (ex-_HazeScrollingFog_Step, battle_anim_ice.ts ; A/B Haze 114 : fidèle 529f)
- [x] AnimTask_MistBallFog_Step @ L1124-1193 — renommé au nom C exact (ex-_MistBallFog_Step)
- [x] AnimTask_Hail2 @ L1354-1413 — renommé au nom C exact (ex-_Hail2_Step ; A/B Hail 258 : fidèle 460f, 3 tasks)

## battle_anim_ghost.c — 26/37 fonctions couvertes (70%) · cite:5 + symbole:21 · 18 citations
- [x] AnimTask_NightShadeClone_Step1 @ L355-370 — renommé au nom C exact (ex-_NightShadeClone_Step1, battle_anim_ghost.ts)
- [x] AnimTask_NightShadeClone_Step2 @ L371-399 — renommé au nom C exact (ex-_NightShadeClone_Step2)
- [x] AnimTask_NightmareClone_Step @ L551-588 — renommé au nom C exact (ex-_NightmareClone_Step)
- [x] AnimTask_SpiteTargetShadow_Step1 @ L599-689 — renommé au nom C exact (ex-_SpiteTargetShadow_Step1, vague F67) + 2 FIXES 1:1 : (a) clone.objMode=0 posé côté SPRITE (classe sync-écrase — l'OAM seul était ré-écrasé en BLEND chaque frame) ; (b) clone.invisible = battlerData[target].invisible (.c:627, manquait). A/B freeze-frame Spite réel : ombre violette RGB(13,0,15) VISIBLE, objMode sprite==oam==0, pal slot BENT_SPOON, prio 3
- [x] AnimTask_SpiteTargetShadow_Step2 @ L690-709 — renommé au nom C exact ; A/B : BLDALPHA sinusoïdal mesuré (39 échantillons, 0→0x1000, EVA/EVB alternés gSineTable/18)
- [x] AnimTask_SpiteTargetShadow_Step3 @ L710-745 — renommé au nom C exact ; A/B teardown : 0 task, BLDCNT/BLDALPHA 0, palette 10097 libérée, BG1/BG2 ré-affichés
- [x] AnimDestinyBondWhiteShadow @ L746-782 — ÉQUIVALENCE : init inliné dans le spawner de la task (assigne AnimDestinyBondWhiteShadow_Step directement, base présente)
- [x] AnimTask_DestinyBondWhiteShadow_Step @ L868-944 — renommé au nom C exact (ex-_DestinyBondWhiteShadow_Step)
- [x] AnimTask_GrudgeFlames_Step @ L1196-1280 — renommé au nom C exact (ex-_GrudgeFlames_Step)
- [x] AnimMonMoveCircular @ L1309-1321 — porté 1:1 (battle_anim_ghost.ts : sprite-pilote invisible, mon attaquant décrit un cercle Sin/Cos rayon 10, y+8 pendant l effet)
- [x] AnimMonMoveCircular_Step @ L1322-1341 — porté 1:1 (orbite pas angulaire args[0] pendant args[1] frames, restore x2/y2/y puis destroy)

## battle_anim_psychic.c — 27/27 fonctions couvertes (100%) · cite:8 + symbole:11 · 37 citations
- [x] AnimDefensiveWall_Step1 @ L485-504 — renommé au nom C exact (ex-_DefensiveWall_Step1, battle_anim_psychic.ts ; A/B Reflect 115 : fidèle 178f)
- [x] AnimDefensiveWall_Step2 @ L505-513 — renommé au nom C exact (ex-_DefensiveWall_Step2)
- [x] AnimDefensiveWall_Step3 @ L514-535 — renommé au nom C exact (ex-_DefensiveWall_Step3)
- [x] AnimDefensiveWall_Step4 @ L536-559 — renommé au nom C exact (ex-_DefensiveWall_Step4)
- [x] AnimDefensiveWall_Step5 @ L560-581 — renommé au nom C exact (ex-_DefensiveWall_Step5)
- [x] AnimTask_MeditateStretchAttacker_Step @ L701-706 — renommé au nom C exact (ex-_Meditate_Step ; A/B Meditate 96 : fidèle ×3 runs)
- [x] AnimTask_Teleport_Step @ L720-747 — renommé au nom C exact (ex-_Teleport_Step ; A/B Teleport 100 : fidèle 98f)
- [x] AnimTask_ImprisonOrbs_Step @ L769-838 — renommé au nom C exact (ex-_ImprisonOrbs_Step ; A/B Imprison 286 : fidèle 379f)

## battle_anim_rock.c — 19/22 fonctions couvertes (86%) · cite:10 + symbole:9 · 28 citations
- [x] AnimParticleInVortex_Step @ L378-395 — ÉQUIVALENCE : _Step inliné dans le port de sa task (state machine fusionnée, convention des miroirs anims — base vérifiée présente src/game)
- [x] AnimTask_LoadSandstormBackground_Step @ L427-512 — ÉQUIVALENCE : _Step inliné dans le port de sa task (state machine fusionnée, convention des miroirs anims — base vérifiée présente src/game)
- [x] AnimTask_Rollout_Step @ L630-694 — ÉQUIVALENCE : _Step inliné dans le port de sa task (state machine fusionnée, convention des miroirs anims — base vérifiée présente src/game)

## battle_anim_ground.c — 25/25 fonctions couvertes (100%) · cite:10 + symbole:12 · 27 citations
- [x] AnimTask_ShakePlatforms @ L619-665 — porté 1:1 (battle_anim_ground.ts, ex-_HS_Platforms renommé au nom C ; A/B Earthquake : BG3_X oscille ±13 puis 0)
- [x] AnimTask_ShakeBattlers @ L666-707 — porté 1:1 (ex-_HS_Battlers renommé ; boucle shake-all = 4 battlers + check IsBattlerSpriteVisible ajouté ; A/B : x2 des 2 battlers oscille +7/−6 puis 0)
- [x] SetBattlersXOffsetForShake @ L708-733 — porté 1:1 (ex-_HS_SetX renommé ; formule (off/2)+(off&1) / −(off/2) vérifiée A/B)
- ⚠ RACINE corrigée avec cette tranche : `MAX_BATTLERS_COUNT`/`(MAX_BATTLERS_COUNT + 1)` (et ~80 constantes : ANIM_ATTACKER ×3162, RGB(...) ×182, F_PAL_*, B_WAIT_TIME_*…) étaient compilées en MARQUEURS corrompus dans le bytecode (compile-decomp-bytecode.mjs ne scannait plus decomp-data/include/ depuis la migration 66dec4f5 + ne lisait pas les enums C / macros RGB). Bytecode entier régénéré : battle_scripts_1 unresolved 692→8, global 19495→9932. A/B : tour complet wild (move → 1121 dmg → KO → WON → OW) + 2e combat fuite.

## battle_anim_flying.c — 31/31 fonctions couvertes (100%) · cite:21 + symbole:3 · 37 citations
- [x] AnimTask_AnimateGustTornadoPalette_Step @ L381-407 — renommé au nom C exact (ex-_GustTornadoPal_Step, battle_anim_flying.ts)
- [x] AnimUnusedBubbleThrow @ L895-902 — DETTE — Unused décomp (préfixe)
- [x] AnimUnusedFlashingLight @ L1161-1167 — DETTE — Unused décomp (préfixe)
- [x] AnimUnusedFlashingLight_Step @ L1168-1186 — DETTE — Unused décomp (préfixe)
- [x] AnimSkyAttackBird @ L1187-1209 — porté 1:1 (battle_anim_flying.ts : vol attaquant→travers-écran 12f, ArcTan2Neg−90°, TrySetSpriteRotScale ; A/B __verifyMoveAnim(143) turn=1 : 1 sprite résolu, branche Unleash ≠ charge — débloqué par le câblage gAnimMoveTurn, wire mort #7)
- [x] AnimSkyAttackBird_Step @ L1210-1222 — porté 1:1 (fixed-point ×16, destroy hors écran via DestroySpriteAndMatrix)
- [x] AnimTask_SetAttackerVisibility @ L1223-1237 — DETTE — `static void UNUSED` décomp (jamais référencé)

## battle_anim_normal.c — 32/36 fonctions couvertes (89%) · cite:20 + symbole:12 · 36 citations
- [x] AnimConfusionDuck (e35a107a) @ L258-281
- [x] AnimConfusionDuck_Step (e35a107a) @ L282-297
- [x] AnimSimplePaletteBlend_Step @ L329-343 — ÉQUIVALENCE : _Step inliné dans le port de sa task (state machine fusionnée, convention des miroirs anims — base vérifiée présente src/game)
- [x] AnimCirclingSparkle (e35a107a) @ L416-446

## battle_anim_dark.c — 25/25 fonctions couvertes (100%) · cite:3 + symbole:16 · 29 citations
- [x] AnimTask_AttackerFadeToInvisible_Step @ L208-230 — renommé au nom C exact (ex-_FadeToInvisible_Step, battle_anim_dark.ts)
- [x] AnimTask_AttackerFadeFromInvisible_Step @ L241-264 — renommé au nom C exact (ex-_FadeFromInvisible_Step)
- [x] AnimUnusedBagSteal @ L276-290 — DETTE — Unused décomp (préfixe)
- [x] AnimUnusedBagSteal_Step @ L291-319 — DETTE — Unused décomp (préfixe)
- [x] AnimBite_Step1 @ L333-342 — renommé au nom C exact (ex-_Bite_Step1 ; A/B __verifyMoveAnim(44 Bite) : fidèle, 3 sprites, 0 défaut)
- [x] AnimBite_Step2 @ L343-353 — renommé au nom C exact (ex-_Bite_Step2)

## battle_anim_dragon.c — 11/11 fonctions couvertes (100%) · cite:8 + symbole:3 · 18 citations
- ✓ complet

## battle_anim_bug.c — 13/13 fonctions couvertes (100%) · cite:13 + symbole:0 · 17 citations
- ✓ complet

## battle_anim_poison.c — 9/9 fonctions couvertes (100%) · cite:9 + symbole:0 · 17 citations
- ✓ complet

## battle_anim_fight.c — 31/31 fonctions couvertes (100%) · cite:24 + symbole:4 · 32 citations
- [x] AnimUnusedHumanoidFoot @ L412-420 — DETTE — Unused décomp (préfixe)
- [x] AnimFistOrFootRandomPos_Step @ L512-529 — ÉQUIVALENCE : _Step inliné dans le port de sa task (state machine fusionnée, convention des miroirs anims — base vérifiée présente src/game)
- [x] AnimSpinningKickOrPunchFinish @ L622-635 — porté 1:1 (battle_anim_fight.ts : StartSpriteAffineAnim(0) + affineAnimPaused=1 + 20f → destroy, l'inline _SpinningKick_Wait omettait le reset affine « réapparaît à taille pleine » ; A/B MOVE_MEGA_PUNCH : sprite vu avec affineAnimNum=0+paused, 0 résiduel)

## battle_anim_utility_funcs.c — 28/42 fonctions couvertes (67%) · cite:0 + symbole:28 · 19 citations
- [x] AnimTask_HardwarePaletteFade_Step @ L211-217 — ÉQUIVALENCE : délégué au fade de l’interpreter (beginHardwarePaletteFade + poll paletteFadeActive, base AnimTask_HardwarePaletteFade présente)
- [x] AnimTask_TraceMonBlended_Step @ L231-263 — renommé au nom C exact (ex-_TraceMonBlended_Step, battle_anim_utility_funcs.ts)
- [x] AnimMonTrace @ L264-277 — renommé au nom C exact (ex-_AnimMonTrace)
- [ ] AnimTask_DrawFallingWhiteLinesOnAttacker  @ L278-347
- [ ] AnimTask_DrawFallingWhiteLinesOnAttacker_Step  @ L348-414
- [x] InitStatsChangeAnimation @ L415-425 — porté 1:1 (battle_anim_utility_funcs.ts, chaîne StatsChange complète, commit 23c2e2aa)
- [x] StatsChangeAnimation_Step1 @ L426-478 — porté 1:1 (regs fenêtre OBJ + species party)
- [x] StatsChangeAnimation_Step2 @ L479-566 — porté 1:1 (copie OBJ_WINDOW + BG1 gfx/tilemap/palette par stat + SE ; assets extract-stat-change-assets.cjs)
- [x] StatsChangeAnimation_Step3 @ L567-648 — porté 1:1 (scroll BG1 ±3 + fade in/wait/out + teardown ; A/B pixel-probe teardown diff 0)
- [x] AnimTask_UpdateSlidingBg @ L762-779 — renommé au nom C exact (ex-_UpdateSlidingBg)
- [x] AnimTask_SetAnimAttackerAndTargetForEffectTgt @ L1049-1055 — porté 1:1 (battle_anim_utility_funcs.ts : attacker=gBattlerTarget, target=gEffectBattler via setBattleAnimAttackerTarget)
- [x] AnimTask_SetAnimTargetToBattlerTarget @ L1066-1071 — porté 1:1 (target=gBattlerTarget)
- [x] AnimTask_SetAnimAttackerAndTargetForEffectAtk @ L1072-1078 — porté 1:1 (attacker=gBattlerAttacker, target=gEffectBattler)
- [x] AnimTask_WaitAndRestoreVisibility @ L1094-1102 — renommé au nom C exact (ex-_WaitAndRestoreVisibility, le restore du fix Rayquaza f478b2c4)

## battle_anim_sound_tasks.c — 15/15 fonctions couvertes (100%) · cite:4 + symbole:6 · 10 citations
- [x] SoundTask_FireBlast @ L23-41 — porté 1:1 (battle_anim_sound_tasks.ts : pan attaquant→cible incrément 2, plays toutes les 11f ; A/B Fire Blast 126 : fidèle 407f, 3 tasks, la sound task se détruit proprement)
- [x] SoundTask_FireBlast_Step1 @ L42-63 — porté 1:1 (111 frames de loop SE + pan glissant clampé)
- [x] SoundTask_FireBlast_Step2 @ L64-77 — porté 1:1 (SE final ×2 toutes les 6f → DestroyAnimSoundTask)
- [x] SoundTask_PlayDoubleCry_Step @ L239-268 — renommé au nom C exact (ex-_DoubleCry_Step, net-effect infra cris documenté ; A/B Growl 45 : fidèle)
- [x] SoundTask_PlayCryWithEcho_Step @ L310-349 — renommé au nom C exact (ex-_PlayCryWithEcho_Step, net-effect infra cris)

## battle_anim_status_effects.c — 11/12 fonctions couvertes (92%) · cite:1 + symbole:2 · 10 citations
- [x] Task_FlashingCircleImpacts @ L273-312 — DETTE — `static u8 UNUSED` décomp
- [x] Task_UpdateFlashingCircleImpacts @ L313-345 — DETTE — code mort transitif (créé uniquement par Task_FlashingCircleImpacts UNUSED, vérifié grep décomp : 0 autre caller)
- [x] AnimFlashingCircleImpact @ L346-359 — DETTE — code mort transitif (callback du template sFlashingCircleImpactSpriteTemplate, créé uniquement par la fonction UNUSED)
- [x] AnimFlashingCircleImpact_Step @ L360-380 — DETTE — code mort transitif (idem)
- [x] AnimTask_FrozenIceCube_Step1 @ L399-414 — renommé au nom C exact (ex-_FrozenIceCube_Step1, battle_anim_status_effects.ts)
- [x] AnimTask_FrozenIceCube_Step2 @ L415-447 — renommé au nom C exact (ex-_FrozenIceCube_Step2)
- [x] AnimTask_FrozenIceCube_Step3 @ L448-463 — renommé au nom C exact (ex-_FrozenIceCube_Step3)
- [x] AnimTask_FrozenIceCube_Step4 @ L464-481 — renommé au nom C exact (ex-_FrozenIceCube_Step4)
- [x] AnimTask_StatsChange @ L482-542 — porté 1:1 (battle_anim_status_effects.ts : décodeur 32 cases animArg via __battleAnimArg ; A/B tour réel Growl forcé : anim rendue sur le battler affecté, pixel-probe 690 pts)

## battle_anim_throw.c — 60/78 fonctions couvertes (77%) · cite:51 + symbole:9 · 91 citations
- [ ] AnimTask_UnusedLevelUpHealthBox_Step  @ L484-543
- [x] Task_PlayerThrow_Wait @ L837-854 — DETTE LIÉE — créé uniquement par AnimTask_ThrowBall_StandingTrainer_Step (.c:826) dont le port TS est en dette R3 (switch immédiat sans monitor animCmdIndex, battle_anim_throw.ts:313) ; le porter seul = orphelin sans effet. À porter AVEC le monitor du bras dresseur.
- [x] IncrBallParticleCount @ L1593-1598 — PORTÉ 1:1 (battle_anim_throw.ts : gMain.inBattle → numBallParticles++, nouveau champ 1:1 battle-sprites-data BattleAnimationInfo battle.h:546) — la chaîne particules ENTIÈRE est live (tables :130-370 + :1568-2023, palette 1:1 gBattleAnimSpritePal_CircleImpact extraite)
- [x] TimerBallOpenParticleAnimation @ L1660-1693 — porté 1:1 (8 étincelles fan-out d4=10/d5=2/d6=1, quirk data[7] dernier-sprite reproduit)
- [x] DiveBallOpenParticleAnimation @ L1694-1728 — porté 1:1 (8 étincelles d4=10/d5=1/d6=2)
- [x] SafariBallOpenParticleAnimation @ L1729-1763 — porté 1:1 (« Also used for Net Ball », 8 étincelles d4=4/d5=1/d6=1)
- [x] UltraBallOpenParticleAnimation @ L1764-1798 — porté 1:1 (« Also used for Nest Ball », 10 étincelles angle i*25, d4=5)
- [x] GreatBallOpenParticleAnimation @ L1799-1843 — porté 1:1 (« Also used for Luxury Ball », 2 vagues de 8 espacées de 8 frames via task.data[7] ; A/B profil mesuré 8→16→0)
- [x] FanOutBallOpenParticles_Step1 @ L1844-1854 — porté 1:1 (Sin/Cos rayons découplés d1/d2, 51 frames ; A/B Master Ball freeze-frame : double anneau VISIBLE à l'écran)
- [x] RepeatBallOpenParticleAnimation @ L1855-1885 — porté 1:1 (POKEBALL_COUNT=12 étincelles, angle i*21 ; A/B sondes : 12 sprites Step1)
- [x] RepeatBallOpenParticleAnimation_Step1 @ L1886-1896 — porté 1:1 (y2 = Cos(d0, Sin(d0, d2)))
- [x] MasterBallOpenParticleAnimation @ L1897-1942 — porté 1:1 (2 anneaux j=0 d5=2/d6=1, j=1 d5=1/d6=2 ; A/B freeze-frame : 16 sprites, 2 rayons 28/14 mesurés)
- [x] PremierBallOpenParticleAnimation @ L1943-1973 — porté 1:1 (8 étincelles → Step1 propre)
- [x] PremierBallOpenParticleAnimation_Step1 @ L1974-1984 — porté 1:1 (y2 = Cos(d0, Sin(d0 & 0x3F, d2)), angle +10 ; A/B sondes : 8 sprites Step1)
- [x] SpriteCB_PokeBlock_Throw @ L2423-2439 — DETTE — lancer de PokéBlock = SAFARI ZONE uniquement (hors démo, cohérent dette contrôleur Safari 6f928ed6)
- [x] SpriteCB_PokeBlock_LiftArm @ L2440-2445 — DETTE — Safari Zone (idem)
- [x] SpriteCB_PokeBlock_Arc @ L2446-2456 — DETTE — Safari Zone (idem)
- [x] SpriteCB_ThrowPokeBlock_Free @ L2457-2468 — DETTE — Safari Zone (idem)

## battle_anim_smokescreen.c — 3/3 fonctions couvertes (100%) · cite:1 + symbole:2 · 9 citations
- ✓ complet

## battle_anim_mon_movement.c — 34/34 fonctions couvertes (100%) · cite:5 + symbole:23 · 19 citations
- [x] AnimTask_ShakeAndSinkMon_Step @ L333-362 — renommé au nom C exact (ex-_ShakeAndSinkMon_Step, battle_anim_mon_movement.ts)
- [x] AnimTask_TranslateMonElliptical_Step @ L385-413 — renommé au nom C exact (ex-_TranslateMonElliptical_Step ; A/B Tail Whip 39 : fidèle 190f)
- [x] AnimTask_SlideOffScreen_Step @ L736-754 — renommé au nom C exact (ex-_SlideOffScreen_Step ; A/B Roar 46 : fidèle 264f)
- [x] AnimTask_ScaleMonAndRestore_Step @ L841-865 — renommé au nom C exact (ex-_ScaleMonAndRestore_Step ; A/B Leer 43 : fidèle 208f)
- [x] AnimTask_RotateMonSpriteToSide_Step @ L948-974 — renommé au nom C exact (ex-_RotateToSide_Step, partagé par RotateMonSpriteToSide ET RotateMonToSideAndRestore comme le .c)
- [x] AnimTask_ShakeTargetBasedOnMovePowerOrDmg_Step @ L1015-1053 — renommé au nom C exact (ex-AnimTask_ShakeTargetPowerDmg_Step abrégé)

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
