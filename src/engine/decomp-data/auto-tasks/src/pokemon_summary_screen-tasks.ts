// AUTO-GENERATED from src/pokemon_summary_screen.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 14 Task_, 1 CB2_, 2 SpriteCB_

export const TASKS = {
  "Task_HandleInput": {
    callsTo: ["BeginCloseSummaryScreen","ChangePage","ChangeSummaryPokemon","GetLRKeysPressed","JOY_NEW","MenuHelpers_ShouldWaitForLinkRecv","PlaySE","StopPokemonAnimations","SwitchToMoveSelection"],
    externalChecks: { paletteFade: true, joyButtons: ["NEW:A_BUTTON","NEW:B_BUTTON","NEW:DPAD_DOWN","NEW:DPAD_LEFT","NEW:DPAD_RIGHT","NEW:DPAD_UP"] },
    lineCount: 42,
    bodyC: "if (MenuHelpers_ShouldWaitForLinkRecv() != TRUE && !gPaletteFade.active)\n    {\n        if (JOY_NEW(DPAD_UP))\n        {\n            ChangeSummaryPokemon(taskId, -1);\n        }\n        else if (JOY_NEW(DPAD_DOWN))\n        {\n            ChangeSummaryPokemon(taskId, 1);\n        }\n        else if ((JOY_NEW(DPAD_LEFT)) || GetLRKeysPressed() == MENU_L_PRESSED)\n        {\n            ChangePage(taskId, -1);\n        }\n        else if ((JOY_NEW(DPAD_RIGHT)) || GetLRKeysPressed() == MENU_R_PRESSED)\n        {\n            ChangePage(taskId, 1);\n        }\n        else if (JOY_NEW(A_BUTTON))\n        {\n            if (sMonSummaryScreen->currPageIndex != PSS_PAGE_SKILLS)\n            {\n                if (sMonSummaryScreen->currPageIndex == PSS_PAGE_INFO)\n                {\n                    StopPokemonAnimations();\n                    PlaySE(SE_SELECT);\n                    BeginCloseSummaryScreen(taskId);\n                }\n                else  \n                {\n                    PlaySE(SE_SELECT);\n                    SwitchToMoveSelection(taskId);\n                }\n            }\n        }\n        else if (JOY_NEW(B_BUTTON))\n        {\n            StopPokemonAnimations();\n            PlaySE(SE_SELECT);\n            BeginCloseSummaryScreen(taskId);\n        }\n    }",
  },
  "Task_ChangeSummaryMon": {
    callsTo: ["CopyMonToSummaryStruct","CreateCaughtBallSprite","DestroySpriteAndFreeResources","DrawPokerusCuredSymbol","ExtractMonDataToSummaryStruct","FuncIsActiveTask","LimitEggSummaryPageDisplay","LoadMonGfxAndSprite","MenuHelpers_ShouldWaitForLinkRecv","PositionStatusSlidingWindow","PrintMonInfo","PrintPageSpecificText","RemoveAndCreateMonMarkingsSprite","SetTypeIcons","StopCryAndClearCrySongs","SummaryScreen_DestroyAnimDelayTask","TryDrawExperienceProgressBar"],
    taskTransitions: ["Task_HandleInput"],
    lineCount: 63,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    switch (data[0])\n    {\n    case 0:\n        StopCryAndClearCrySongs();\n        break;\n    case 1:\n        SummaryScreen_DestroyAnimDelayTask();\n        DestroySpriteAndFreeResources(&gSprites[sMonSummaryScreen->spriteIds[SPRITE_ARR_ID_MON]]);\n        break;\n    case 2:\n        DestroySpriteAndFreeResources(&gSprites[sMonSummaryScreen->spriteIds[SPRITE_ARR_ID_BALL]]);\n        break;\n    case 3:\n        CopyMonToSummaryStruct(&sMonSummaryScreen->currentMon);\n        sMonSummaryScreen->switchCounter = 0;\n        break;\n    case 4:\n        if (ExtractMonDataToSummaryStruct(&sMonSummaryScreen->currentMon) == FALSE)\n            return;\n        break;\n    case 5:\n        RemoveAndCreateMonMarkingsSprite(&sMonSummaryScreen->currentMon);\n        break;\n    case 6:\n        CreateCaughtBallSprite(&sMonSummaryScreen->currentMon);\n        break;\n    case 7:\n        if (sMonSummaryScreen->summary.ailment != AILMENT_NONE)\n            PositionStatusSlidingWindow(10, -2);\n        DrawPokerusCuredSymbol(&sMonSummaryScreen->currentMon);\n        data[1] = 0;\n        break;\n    case 8:\n        sMonSummaryScreen->spriteIds[SPRITE_ARR_ID_MON] = LoadMonGfxAndSprite(&sMonSummaryScreen->currentMon, &data[1]);\n        if (sMonSummaryScreen->spriteIds[SPRITE_ARR_ID_MON] == SPRITE_NONE)\n            return;\n        gSprites[sMonSummaryScreen->spriteIds[SPRITE_ARR_ID_MON]].data[2] = 1;\n        TryDrawExperienceProgressBar();\n        data[1] = 0;\n        break;\n    case 9:\n        SetTypeIcons();\n        break;\n    case 10:\n        PrintMonInfo();\n        break;\n    case 11:\n        PrintPageSpecificText(sMonSummaryScreen->currPageIndex);\n        LimitEggSummaryPageDisplay();\n        break;\n    case 12:\n        gSprites[sMonSummaryScreen->spriteIds[SPRITE_ARR_ID_MON]].data[2] = 0;\n        break;\n    default:\n        if (!MenuHelpers_ShouldWaitForLinkRecv() && !FuncIsActiveTask(Task_SlideStatusWindow))\n        {\n            data[0] = 0;\n            gTasks[taskId].func = Task_HandleInput;\n        }\n        return;\n    }\n    data[0]++;",
  },
  "Task_HandleInput_MoveSelect": {
    callsTo: ["ChangeSelectedMove","CloseMoveSelectMode","HasMoreThanOneMove","JOY_NEW","MenuHelpers_ShouldWaitForLinkRecv","PlaySE","SwitchToMovePositionSwitchMode"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON","NEW:B_BUTTON","NEW:DPAD_DOWN","NEW:DPAD_UP"] },
    lineCount: 37,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (MenuHelpers_ShouldWaitForLinkRecv() != TRUE)\n    {\n        if (JOY_NEW(DPAD_UP))\n        {\n            data[0] = 4;\n            ChangeSelectedMove(data, -1, &sMonSummaryScreen->firstMoveIndex);\n        }\n        else if (JOY_NEW(DPAD_DOWN))\n        {\n            data[0] = 4;\n            ChangeSelectedMove(data, 1, &sMonSummaryScreen->firstMoveIndex);\n        }\n        else if (JOY_NEW(A_BUTTON))\n        {\n            if (sMonSummaryScreen->lockMovesFlag == TRUE\n             || (sMonSummaryScreen->newMove == MOVE_NONE && sMonSummaryScreen->firstMoveIndex == MAX_MON_MOVES))\n            {\n                PlaySE(SE_SELECT);\n                CloseMoveSelectMode(taskId);\n            }\n            else if (HasMoreThanOneMove() == TRUE)\n            {\n                PlaySE(SE_SELECT);\n                SwitchToMovePositionSwitchMode(taskId);\n            }\n            else\n            {\n                PlaySE(SE_FAILURE);\n            }\n        }\n        else if (JOY_NEW(B_BUTTON))\n        {\n            PlaySE(SE_SELECT);\n            CloseMoveSelectMode(taskId);\n        }\n    }",
  },
  "Task_HandleInput_MovePositionSwitch": {
    callsTo: ["ChangeSelectedMove","ExitMovePositionSwitchMode","JOY_NEW","MenuHelpers_ShouldWaitForLinkRecv"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON","NEW:B_BUTTON","NEW:DPAD_DOWN","NEW:DPAD_UP"] },
    lineCount: 25,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (MenuHelpers_ShouldWaitForLinkRecv() != TRUE)\n    {\n        if (JOY_NEW(DPAD_UP))\n        {\n            data[0] = 3;\n            ChangeSelectedMove(&data[0], -1, &sMonSummaryScreen->secondMoveIndex);\n        }\n        else if (JOY_NEW(DPAD_DOWN))\n        {\n            data[0] = 3;\n            ChangeSelectedMove(&data[0], 1, &sMonSummaryScreen->secondMoveIndex);\n        }\n        else if (JOY_NEW(A_BUTTON))\n        {\n            if (sMonSummaryScreen->firstMoveIndex == sMonSummaryScreen->secondMoveIndex)\n                ExitMovePositionSwitchMode(taskId, FALSE);\n            else\n                ExitMovePositionSwitchMode(taskId, TRUE);\n        }\n        else if (JOY_NEW(B_BUTTON))\n        {\n            ExitMovePositionSwitchMode(taskId, FALSE);\n        }\n    }",
  },
  "Task_SetHandleReplaceMoveInput": {
    callsTo: ["CreateMoveSelectorSprites","SetNewMoveTypeIcon"],
    taskTransitions: ["Task_HandleReplaceMoveInput"],
    lineCount: 3,
    bodyC: "SetNewMoveTypeIcon();\n    CreateMoveSelectorSprites(SPRITE_ARR_ID_MOVE_SELECTOR1);\n    gTasks[taskId].func = Task_HandleReplaceMoveInput;",
  },
  "Task_HandleReplaceMoveInput": {
    callsTo: ["BeginCloseSummaryScreen","CanReplaceMove","ChangePage","ChangeSelectedMove","GetLRKeysPressed","JOY_NEW","MenuHelpers_ShouldWaitForLinkRecv","PlaySE","ShowCantForgetHMsWindow","StopPokemonAnimations"],
    externalChecks: { paletteFade: true, joyButtons: ["NEW:A_BUTTON","NEW:B_BUTTON","NEW:DPAD_DOWN","NEW:DPAD_LEFT","NEW:DPAD_RIGHT","NEW:DPAD_UP"] },
    lineCount: 49,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (MenuHelpers_ShouldWaitForLinkRecv() != TRUE)\n    {\n        if (gPaletteFade.active != TRUE)\n        {\n            if (JOY_NEW(DPAD_UP))\n            {\n                data[0] = 4;\n                ChangeSelectedMove(data, -1, &sMonSummaryScreen->firstMoveIndex);\n            }\n            else if (JOY_NEW(DPAD_DOWN))\n            {\n                data[0] = 4;\n                ChangeSelectedMove(data, 1, &sMonSummaryScreen->firstMoveIndex);\n            }\n            else if (JOY_NEW(DPAD_LEFT) || GetLRKeysPressed() == MENU_L_PRESSED)\n            {\n                ChangePage(taskId, -1);\n            }\n            else if (JOY_NEW(DPAD_RIGHT) || GetLRKeysPressed() == MENU_R_PRESSED)\n            {\n                ChangePage(taskId, 1);\n            }\n            else if (JOY_NEW(A_BUTTON))\n            {\n                if (CanReplaceMove() == TRUE)\n                {\n                    StopPokemonAnimations();\n                    PlaySE(SE_SELECT);\n                    sMoveSlotToReplace = sMonSummaryScreen->firstMoveIndex;\n                    gSpecialVar_0x8005 = sMoveSlotToReplace;\n                    BeginCloseSummaryScreen(taskId);\n                }\n                else\n                {\n                    PlaySE(SE_FAILURE);\n                    ShowCantForgetHMsWindow(taskId);\n                }\n            }\n            else if (JOY_NEW(B_BUTTON))\n            {\n                StopPokemonAnimations();\n                PlaySE(SE_SELECT);\n                sMoveSlotToReplace = MAX_MON_MOVES;\n                gSpecialVar_0x8005 = MAX_MON_MOVES;\n                BeginCloseSummaryScreen(taskId);\n            }\n        }\n    }",
  },
  "Task_HandleInputCantForgetHMsMoves": {
    callsTo: ["ChangePage","ChangeSelectedMove","ClearWindowTilemap","FuncIsActiveTask","GetLRKeysPressed","JOY_NEW","PositionAppealJamSlidingWindow","PositionPowerAccSlidingWindow","PrintMoveDetails","ScheduleBgCopyTilemapToVram"],
    taskTransitions: ["Task_HandleReplaceMoveInput"],
    externalChecks: { joyButtons: ["NEW:DPAD_DOWN","NEW:DPAD_LEFT","NEW:DPAD_RIGHT","NEW:DPAD_UP"] },
    lineCount: 61,
    bodyC: "s16 *data = gTasks[taskId].data;\n    u16 move;\n    if (FuncIsActiveTask(Task_SlidePowerAccWindow) != 1)\n    {\n        if (JOY_NEW(DPAD_UP))\n        {\n            data[1] = 1;\n            data[0] = 4;\n            ChangeSelectedMove(&data[0], -1, &sMonSummaryScreen->firstMoveIndex);\n            data[1] = 0;\n            gTasks[taskId].func = Task_HandleReplaceMoveInput;\n        }\n        else if (JOY_NEW(DPAD_DOWN))\n        {\n            data[1] = 1;\n            data[0] = 4;\n            ChangeSelectedMove(&data[0], 1, &sMonSummaryScreen->firstMoveIndex);\n            data[1] = 0;\n            gTasks[taskId].func = Task_HandleReplaceMoveInput;\n        }\n        else if (JOY_NEW(DPAD_LEFT) || GetLRKeysPressed() == MENU_L_PRESSED)\n        {\n            if (sMonSummaryScreen->currPageIndex != PSS_PAGE_BATTLE_MOVES)\n            {\n                ClearWindowTilemap(PSS_LABEL_WINDOW_PORTRAIT_SPECIES);\n                if (!gSprites[sMonSummaryScreen->spriteIds[SPRITE_ARR_ID_STATUS]].invisible)\n                    ClearWindowTilemap(PSS_LABEL_WINDOW_POKEMON_SKILLS_STATUS);\n                move = sMonSummaryScreen->summary.moves[sMonSummaryScreen->firstMoveIndex];\n                gTasks[taskId].func = Task_HandleReplaceMoveInput;\n                ChangePage(taskId, -1);\n                PositionPowerAccSlidingWindow(9, -2);\n                PositionAppealJamSlidingWindow(9, -2, move);\n            }\n        }\n        else if (JOY_NEW(DPAD_RIGHT) || GetLRKeysPressed() == MENU_R_PRESSED)\n        {\n            if (sMonSummaryScreen->currPageIndex != PSS_PAGE_CONTEST_MOVES)\n            {\n                ClearWindowTilemap(PSS_LABEL_WINDOW_PORTRAIT_SPECIES);\n                if (!gSprites[sMonSummaryScreen->spriteIds[SPRITE_ARR_ID_STATUS]].invisible)\n                    ClearWindowTilemap(PSS_LABEL_WINDOW_POKEMON_SKILLS_STATUS);\n                move = sMonSummaryScreen->summary.moves[sMonSummaryScreen->firstMoveIndex];\n                gTasks[taskId].func = Task_HandleReplaceMoveInput;\n                ChangePage(taskId, 1);\n                PositionPowerAccSlidingWindow(9, -2);\n                PositionAppealJamSlidingWindow(9, -2, move);\n            }\n        }\n        else if (JOY_NEW(A_BUTTON | B_BUTTON))\n        {\n            ClearWindowTilemap(PSS_LABEL_WINDOW_PORTRAIT_SPECIES);\n            if (!gSprites[sMonSummaryScreen->spriteIds[SPRITE_ARR_ID_STATUS]].invisible)\n                ClearWindowTilemap(PSS_LABEL_WINDOW_POKEMON_SKILLS_STATUS);\n            move = sMonSummaryScreen->summary.moves[sMonSummaryScreen->firstMoveIndex];\n            PrintMoveDetails(move);\n            ScheduleBgCopyTilemapToVram(0);\n            PositionPowerAccSlidingWindow(9, -3);\n            PositionAppealJamSlidingWindow(9, -3, move);\n            gTasks[taskId].func = Task_HandleReplaceMoveInput;\n        }\n    }",
  },
  "Task_SlidePowerAccWindow": {
    callsTo: ["CopyNColumnsToTilemap","DestroyTask","PutWindowTilemap","ScheduleBgCopyTilemapToVram"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 29,
    bodyC: "s16 *data = gTasks[taskId].data;\n    tVisibleColumns += tScrollingSpeed;\n    if (tVisibleColumns < 0)\n    {\n        tVisibleColumns = 0;\n    }\n    else if (tVisibleColumns > sPowerAccSlidingWindow.width)\n    {\n        tVisibleColumns = sPowerAccSlidingWindow.width;\n    }\n    CopyNColumnsToTilemap(&sPowerAccSlidingWindow, sMonSummaryScreen->bgTilemapBuffers[PSS_PAGE_BATTLE_MOVES][0], tVisibleColumns, TRUE);\n    if (tVisibleColumns <= 0 || tVisibleColumns >= sPowerAccSlidingWindow.width)\n    {\n        if (tScrollingSpeed < 0)\n        {\n            if (sMonSummaryScreen->currPageIndex == PSS_PAGE_BATTLE_MOVES)\n                PutWindowTilemap(PSS_LABEL_WINDOW_MOVES_POWER_ACC);\n        }\n        else\n        {\n            if (!gSprites[sMonSummaryScreen->spriteIds[SPRITE_ARR_ID_STATUS]].invisible)\n                PutWindowTilemap(PSS_LABEL_WINDOW_POKEMON_SKILLS_STATUS);\n            PutWindowTilemap(PSS_LABEL_WINDOW_PORTRAIT_SPECIES);\n        }\n        ScheduleBgCopyTilemapToVram(0);\n        DestroyTask(taskId);\n    }\n    ScheduleBgCopyTilemapToVram(1);\n    ScheduleBgCopyTilemapToVram(2);",
  },
  "Task_SlideAppealJamWindow": {
    callsTo: ["CopyNColumnsToTilemap","DestroyTask","DrawContestMoveHearts","FuncIsActiveTask","PutWindowTilemap","ScheduleBgCopyTilemapToVram"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 32,
    bodyC: "s16 *data = gTasks[taskId].data;\n    tVisibleColumns += tScrollingSpeed;\n    if (tVisibleColumns < 0)\n    {\n        tVisibleColumns = 0;\n    }\n    else if (tVisibleColumns > sAppealJamSlidingWindow.width)\n    {\n        tVisibleColumns = sAppealJamSlidingWindow.width;\n    }\n    CopyNColumnsToTilemap(&sAppealJamSlidingWindow, sMonSummaryScreen->bgTilemapBuffers[PSS_PAGE_CONTEST_MOVES][0], tVisibleColumns, TRUE);\n    if (tVisibleColumns <= 0 || tVisibleColumns >= sAppealJamSlidingWindow.width)\n    {\n        if (tScrollingSpeed < 0)\n        {\n            if (sMonSummaryScreen->currPageIndex == PSS_PAGE_CONTEST_MOVES && FuncIsActiveTask(PssScrollRight) == 0)\n                PutWindowTilemap(PSS_LABEL_WINDOW_MOVES_APPEAL_JAM);\n            DrawContestMoveHearts(tMove);\n        }\n        else\n        {\n            if (!gSprites[sMonSummaryScreen->spriteIds[SPRITE_ARR_ID_STATUS]].invisible)\n            {\n                PutWindowTilemap(PSS_LABEL_WINDOW_POKEMON_SKILLS_STATUS);\n            }\n            PutWindowTilemap(PSS_LABEL_WINDOW_PORTRAIT_SPECIES);\n        }\n        ScheduleBgCopyTilemapToVram(0);\n        DestroyTask(taskId);\n    }\n    ScheduleBgCopyTilemapToVram(1);\n    ScheduleBgCopyTilemapToVram(2);",
  },
  "Task_SlideStatusWindow": {
    callsTo: ["CopyNColumnsToTilemap","CreateSetStatusSprite","DestroyTask","PutWindowTilemap","ScheduleBgCopyTilemapToVram"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 19,
    bodyC: "s16 *data = gTasks[taskId].data;\n    tVisibleColumns += tScrollingSpeed;\n    if (tVisibleColumns < 0)\n        tVisibleColumns = 0;\n    else if (tVisibleColumns > sStatusSlidingWindow1.width)\n        tVisibleColumns = sStatusSlidingWindow1.width;\n    CopyNColumnsToTilemap(&sStatusSlidingWindow1, sMonSummaryScreen->bgTilemapBuffers[PSS_PAGE_INFO][0], tVisibleColumns, FALSE);\n    CopyNColumnsToTilemap(&sStatusSlidingWindow2, sMonSummaryScreen->bgTilemapBuffers[PSS_PAGE_INFO][0], tVisibleColumns, FALSE);\n    ScheduleBgCopyTilemapToVram(3);\n    if (tVisibleColumns <= 0 || tVisibleColumns >= sStatusSlidingWindow1.width)\n    {\n        if (tScrollingSpeed < 0)\n        {\n            CreateSetStatusSprite();\n            PutWindowTilemap(PSS_LABEL_WINDOW_POKEMON_SKILLS_STATUS);\n            ScheduleBgCopyTilemapToVram(0);\n        }\n        DestroyTask(taskId);\n    }",
  },
  "Task_PrintInfoPage": {
    callsTo: ["BufferMonTrainerMemo","DestroyTask","PrintMonAbilityDescription","PrintMonAbilityName","PrintMonOTID","PrintMonOTName","PrintMonTrainerMemo"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 26,
    bodyC: "s16 *data = gTasks[taskId].data;\n    switch (data[0])\n    {\n    case 1:\n        PrintMonOTName();\n        break;\n    case 2:\n        PrintMonOTID();\n        break;\n    case 3:\n        PrintMonAbilityName();\n        break;\n    case 4:\n        PrintMonAbilityDescription();\n        break;\n    case 5:\n        BufferMonTrainerMemo();\n        break;\n    case 6:\n        PrintMonTrainerMemo();\n        break;\n    case 7:\n        DestroyTask(taskId);\n        return;\n    }\n    data[0]++;",
  },
  "Task_PrintSkillsPage": {
    callsTo: ["BufferLeftColumnStats","BufferRightColumnStats","DestroyTask","PrintExpPointsNextLevel","PrintHeldItemName","PrintLeftColumnStats","PrintRibbonCount","PrintRightColumnStats"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 29,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    switch (data[0])\n    {\n    case 1:\n        PrintHeldItemName();\n        break;\n    case 2:\n        PrintRibbonCount();\n        break;\n    case 3:\n        BufferLeftColumnStats();\n        break;\n    case 4:\n        PrintLeftColumnStats();\n        break;\n    case 5:\n        BufferRightColumnStats();\n        break;\n    case 6:\n        PrintRightColumnStats();\n        break;\n    case 7:\n        PrintExpPointsNextLevel();\n        break;\n    case 8:\n        DestroyTask(taskId);\n        return;\n    }\n    data[0]++;",
  },
  "Task_PrintBattleMoves": {
    callsTo: ["DestroyTask","PrintMoveDetails","PrintMoveNameAndPP","PrintNewMoveDetailsOrCancelText"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 40,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    switch (data[0])\n    {\n    case 1:\n        PrintMoveNameAndPP(0);\n        break;\n    case 2:\n        PrintMoveNameAndPP(1);\n        break;\n    case 3:\n        PrintMoveNameAndPP(2);\n        break;\n    case 4:\n        PrintMoveNameAndPP(3);\n        break;\n    case 5:\n        if (sMonSummaryScreen->mode == SUMMARY_MODE_SELECT_MOVE)\n            PrintNewMoveDetailsOrCancelText();\n        break;\n    case 6:\n        if (sMonSummaryScreen->mode == SUMMARY_MODE_SELECT_MOVE)\n        {\n            if (sMonSummaryScreen->firstMoveIndex == MAX_MON_MOVES)\n                data[1] = sMonSummaryScreen->newMove;\n            else\n                data[1] = sMonSummaryScreen->summary.moves[sMonSummaryScreen->firstMoveIndex];\n        }\n        break;\n    case 7:\n        if (sMonSummaryScreen->mode == SUMMARY_MODE_SELECT_MOVE)\n        {\n            if (sMonSummaryScreen->newMove != MOVE_NONE || sMonSummaryScreen->firstMoveIndex != MAX_MON_MOVES)\n                PrintMoveDetails(data[1]);\n        }\n        break;\n    case 8:\n        DestroyTask(taskId);\n        return;\n    }\n    data[0]++;",
  },
  "Task_PrintContestMoves": {
    callsTo: ["DestroyTask","PrintContestMoveDescription","PrintMoveNameAndPP","PrintNewMoveDetailsOrCancelText"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 31,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    switch (data[0])\n    {\n    case 1:\n        PrintMoveNameAndPP(0);\n        break;\n    case 2:\n        PrintMoveNameAndPP(1);\n        break;\n    case 3:\n        PrintMoveNameAndPP(2);\n        break;\n    case 4:\n        PrintMoveNameAndPP(3);\n        break;\n    case 5:\n        if (sMonSummaryScreen->mode == SUMMARY_MODE_SELECT_MOVE)\n            PrintNewMoveDetailsOrCancelText();\n        break;\n    case 6:\n        if (sMonSummaryScreen->mode == SUMMARY_MODE_SELECT_MOVE)\n        {\n            if (sMonSummaryScreen->newMove != MOVE_NONE || sMonSummaryScreen->firstMoveIndex != MAX_MON_MOVES)\n                PrintContestMoveDescription(sMonSummaryScreen->firstMoveIndex);\n        }\n        break;\n    case 7:\n        DestroyTask(taskId);\n        return;\n    }\n    data[0]++;",
  },
} as const;

export const CB2S = {
  "CB2_InitSummaryScreen": {
    callsTo: ["LoadGraphics","MenuHelpers_IsLinkActive","MenuHelpers_ShouldWaitForLinkRecv"],
    lineCount: 1,
    bodyC: "while (MenuHelpers_ShouldWaitForLinkRecv() != TRUE && LoadGraphics() != TRUE && MenuHelpers_IsLinkActive() != TRUE);",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_Pokemon": {
    callsTo: ["IsMonSpriteNotFlipped","PlayMonCry","PokemonSummaryDoMonAnimation"],
    externalChecks: { paletteFade: true },
    lineCount: 7,
    bodyC: "struct PokeSummary *summary = &sMonSummaryScreen->summary;\n\n    if (!gPaletteFade.active && sprite->data[2] != 1)\n    {\n        sprite->data[1] = IsMonSpriteNotFlipped(sprite->data[0]);\n        PlayMonCry();\n        PokemonSummaryDoMonAnimation(sprite, sprite->data[0], summary->isEgg);\n    }",
  },
  "SpriteCB_MoveSelector": {
    lineCount: 17,
    bodyC: "if (sprite->animNum > 3 && sprite->animNum < 7)\n    {\n        sprite->data[1] = (sprite->data[1] + 1) & 0x1F;\n        if (sprite->data[1] > 24)\n            sprite->invisible = TRUE;\n        else\n            sprite->invisible = FALSE;\n    }\n    else\n    {\n        sprite->data[1] = 0;\n        sprite->invisible = FALSE;\n    }\n\n    if (sprite->data[0] == SPRITE_ARR_ID_MOVE_SELECTOR1)\n        sprite->y2 = sMonSummaryScreen->firstMoveIndex * 16;\n    else\n        sprite->y2 = sMonSummaryScreen->secondMoveIndex * 16;",
  },
} as const;
