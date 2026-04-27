// AUTO-GENERATED from src/battle_pyramid_bag.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 9 Task_, 4 CB2_, 1 SpriteCB_

export const TASKS = {
  "Task_ChooseItemsToTossFromPyramidBag": {
    callsTo: ["CleanupOverworldWindowsAndTilemaps","DestroyTask","GoToBattlePyramidBagMenu"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 7,
    bodyC: "if (!gPaletteFade.active)\n    {\n        CleanupOverworldWindowsAndTilemaps();\n        gFieldCallback2 = CB2_FadeFromPartyMenu;\n        GoToBattlePyramidBagMenu(PYRAMIDBAG_LOC_CHOOSE_TOSS, CB2_ReturnToField);\n        DestroyTask(taskId);\n    }",
  },
  "Task_ClosePyramidBag": {
    callsTo: ["DestroyListMenuTask","DestroyTask","Free","FreeAllSpritePalettes","FreeAllWindowBuffers","RemoveScrollArrow","ResetSpriteData","SetMainCallback2"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 15,
    bodyC: "s16 *data = gTasks[taskId].data;\n    if (!gPaletteFade.active)\n    {\n        DestroyListMenuTask(tListTaskId, &gPyramidBagMenuState.scrollPosition, &gPyramidBagMenuState.cursorPosition);\n\n         \n         \n        if (gPyramidBagMenu->newScreenCallback != NULL)\n            SetMainCallback2(gPyramidBagMenu->newScreenCallback);\n        else\n            SetMainCallback2(gPyramidBagMenuState.exitCallback);\n        RemoveScrollArrow();\n        ResetSpriteData();\n        FreeAllSpritePalettes();\n        FreeAllWindowBuffers();\n        Free(gPyramidBagMenu);\n        DestroyTask(taskId);\n    }",
  },
  "Task_HandlePyramidBagInput": {
    callsTo: ["CloseBattlePyramidBag","JOY_NEW","ListMenuGetScrollAndRow","ListMenu_ProcessInput","MenuHelpers_ShouldWaitForLinkRecv","OpenContextMenu","PlaySE","Task_BeginItemSwap","TryCloseBagToGiveItem"],
    externalChecks: { paletteFade: true, joyButtons: ["NEW:SELECT_BUTTON"] },
    lineCount: 40,
    bodyC: "s16 *data = gTasks[taskId].data;\n    if (MenuHelpers_ShouldWaitForLinkRecv() == TRUE || gPaletteFade.active)\n        return;\n\n    if (JOY_NEW(SELECT_BUTTON))\n    {\n        if (gPyramidBagMenuState.location != PYRAMIDBAG_LOC_PARTY)\n        {\n            ListMenuGetScrollAndRow(tListTaskId, &gPyramidBagMenuState.scrollPosition, &gPyramidBagMenuState.cursorPosition);\n            if (gPyramidBagMenuState.scrollPosition + gPyramidBagMenuState.cursorPosition != gPyramidBagMenu->listMenuCount - 1)\n            {\n                PlaySE(SE_SELECT);\n                Task_BeginItemSwap(taskId);\n            }\n        }\n    }\n    else\n    {\n        s32 listId = ListMenu_ProcessInput(tListTaskId);\n        ListMenuGetScrollAndRow(tListTaskId, &gPyramidBagMenuState.scrollPosition, &gPyramidBagMenuState.cursorPosition);\n        switch (listId)\n        {\n        case LIST_NOTHING_CHOSEN:\n            break;\n        case LIST_CANCEL:\n            PlaySE(SE_SELECT);\n            gSpecialVar_ItemId = ITEM_NONE;\n            CloseBattlePyramidBag(taskId);\n            break;\n        default:\n            PlaySE(SE_SELECT);\n            gSpecialVar_ItemId = gSaveBlock2Ptr->frontier.pyramidBag.itemId[gSaveBlock2Ptr->frontier.lvlMode][listId];\n            tListPos = listId;\n            tQuantity = gSaveBlock2Ptr->frontier.pyramidBag.quantity[gSaveBlock2Ptr->frontier.lvlMode][listId];\n            if (gPyramidBagMenuState.location == PYRAMIDBAG_LOC_PARTY)\n                TryCloseBagToGiveItem(taskId);\n            else\n                OpenContextMenu(taskId);\n            break;\n        }\n    }",
  },
  "Task_ChooseHowManyToToss": {
    callsTo: ["AdjustQuantityAccordingToDPadInput","AskConfirmToss","ClearStdWindowAndFrameToTransparent","ClearWindowTilemap","DontTossItem","JOY_NEW","PlaySE","ScheduleBgCopyTilemapToVram","UpdateNumToToss"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON","NEW:B_BUTTON"] },
    lineCount: 21,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (AdjustQuantityAccordingToDPadInput(&tNumToToss, tQuantity) == TRUE)\n    {\n        UpdateNumToToss(tNumToToss);\n    }\n    else if (JOY_NEW(A_BUTTON))\n    {\n         \n        PlaySE(SE_SELECT);\n        ClearStdWindowAndFrameToTransparent(WIN_TOSS_NUM, FALSE);\n        ClearWindowTilemap(WIN_TOSS_NUM);\n        ScheduleBgCopyTilemapToVram(1);\n        AskConfirmToss(taskId);\n    }\n    else if (JOY_NEW(B_BUTTON))\n    {\n         \n        PlaySE(SE_SELECT);\n        ClearStdWindowAndFrameToTransparent(WIN_TOSS_NUM, FALSE);\n        ClearWindowTilemap(WIN_TOSS_NUM);\n        ScheduleBgCopyTilemapToVram(1);\n        DontTossItem(taskId);\n    }",
  },
  "Task_TossItem": {
    callsTo: ["DestroyListMenuTask","JOY_NEW","ListMenuInit","PlaySE","RemovePyramidBagItem","ScheduleBgCopyTilemapToVram","SetBagItemsListTemplate","SetTaskToMainPyramidBagInputHandler","UpdatePyramidBagCursorPos","UpdatePyramidBagList"],
    lineCount: 15,
    bodyC: "s16 *data = gTasks[taskId].data;\n    u16 *scrollOffset = &gPyramidBagMenuState.scrollPosition;\n    u16 *selectedRow = &gPyramidBagMenuState.cursorPosition;\n\n    if (JOY_NEW(A_BUTTON | B_BUTTON))\n    {\n        PlaySE(SE_SELECT);\n        RemovePyramidBagItem(gSpecialVar_ItemId, tNumToToss);\n        DestroyListMenuTask(tListTaskId, scrollOffset, selectedRow);\n        UpdatePyramidBagList();\n        UpdatePyramidBagCursorPos();\n        SetBagItemsListTemplate();\n        tListTaskId = ListMenuInit(&gMultiuseListMenuTemplate, *scrollOffset, *selectedRow);\n        ScheduleBgCopyTilemapToVram(0);\n        SetTaskToMainPyramidBagInputHandler(taskId);\n    }",
  },
  "Task_WaitCloseErrorMessage": {
    callsTo: ["JOY_NEW","PlaySE","Task_CloseBattlePyramidBagMessage"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON"] },
    lineCount: 5,
    bodyC: "if (JOY_NEW(A_BUTTON))\n    {\n        PlaySE(SE_SELECT);\n        Task_CloseBattlePyramidBagMessage(taskId);\n    }",
  },
  "Task_CloseBattlePyramidBagMessage": {
    callsTo: ["CloseBattlePyramidBagTextWindow","PrintItemDescription","PrintSelectorArrow","SetTaskToMainPyramidBagInputHandler"],
    lineCount: 5,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    CloseBattlePyramidBagTextWindow();\n    PrintItemDescription(tListPos);\n    PrintSelectorArrow(tListTaskId, COLORID_DARK_GRAY);\n    SetTaskToMainPyramidBagInputHandler(taskId);",
  },
  "Task_BeginItemSwap": {
    callsTo: ["CopyItemName","FillWindowPixelBuffer","ListMenuSetTemplateField","PIXEL_FILL","PrintSelectorArrow","PyramidBagPrint","StringExpandPlaceholders","UpdateSwapLinePos"],
    taskTransitions: ["Task_ItemSwapHandleInput"],
    lineCount: 11,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    tListPos = gPyramidBagMenuState.scrollPosition + gPyramidBagMenuState.cursorPosition;\n    gPyramidBagMenu->toSwapPos = tListPos;\n    ListMenuSetTemplateField(tListTaskId, LISTFIELD_CURSORKIND, CURSOR_INVISIBLE);\n    CopyItemName(gSaveBlock2Ptr->frontier.pyramidBag.itemId[gSaveBlock2Ptr->frontier.lvlMode][tListPos], gStringVar1);\n    StringExpandPlaceholders(gStringVar4, gText_MoveVar1Where);\n    FillWindowPixelBuffer(WIN_INFO, PIXEL_FILL(0));\n    PyramidBagPrint(WIN_INFO, gStringVar4, 3, 0, 0, 1, 0, COLORID_DARK_GRAY);\n    PrintSelectorArrow(tListTaskId, COLORID_LIGHT_GRAY);\n    UpdateSwapLinePos(tListPos);\n    gTasks[taskId].func = Task_ItemSwapHandleInput;",
  },
  "Task_ItemSwapHandleInput": {
    callsTo: ["CancelItemSwap","JOY_NEW","ListMenuGetScrollAndRow","ListMenu_ProcessInput","MenuHelpers_ShouldWaitForLinkRecv","PerformItemSwap","PlaySE","SetSwapLineInvisibility","UpdateSwapLinePos"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON","NEW:SELECT_BUTTON"] },
    lineCount: 33,
    bodyC: "s16 *data = gTasks[taskId].data;\n    if (MenuHelpers_ShouldWaitForLinkRecv() != TRUE)\n    {\n        if (JOY_NEW(SELECT_BUTTON))\n        {\n            PlaySE(SE_SELECT);\n            ListMenuGetScrollAndRow(tListTaskId, &gPyramidBagMenuState.scrollPosition, &gPyramidBagMenuState.cursorPosition);\n            PerformItemSwap(taskId);\n        }\n        else\n        {\n            s32 id = ListMenu_ProcessInput(tListTaskId);\n            ListMenuGetScrollAndRow(tListTaskId, &gPyramidBagMenuState.scrollPosition, &gPyramidBagMenuState.cursorPosition);\n            SetSwapLineInvisibility(FALSE);\n            UpdateSwapLinePos(gPyramidBagMenuState.cursorPosition);\n            switch (id)\n            {\n            case LIST_NOTHING_CHOSEN:\n                break;\n            case LIST_CANCEL:\n                PlaySE(SE_SELECT);\n                if (JOY_NEW(A_BUTTON))\n                    PerformItemSwap(taskId);\n                else\n                    CancelItemSwap(taskId);\n                break;\n            default:\n                PlaySE(SE_SELECT);\n                PerformItemSwap(taskId);\n                break;\n            }\n        }\n    }",
  },
} as const;

export const CB2S = {
  "CB2_PyramidBagMenuFromStartMenu": {
    callsTo: ["GoToBattlePyramidBagMenu"],
    lineCount: 1,
    bodyC: "GoToBattlePyramidBagMenu(PYRAMIDBAG_LOC_FIELD, CB2_ReturnToFieldWithOpenMenu);",
  },
  "CB2_ReturnToPyramidBagMenu": {
    callsTo: ["GoToBattlePyramidBagMenu"],
    lineCount: 1,
    bodyC: "GoToBattlePyramidBagMenu(PYRAMIDBAG_LOC_PREV, gPyramidBagMenuState.exitCallback);",
  },
  "CB2_PyramidBag": {
    callsTo: ["AnimateSprites","BuildOamBuffer","DoScheduledBgTilemapCopiesToVram","RunTasks","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 5,
    bodyC: "RunTasks();\n    AnimateSprites();\n    BuildOamBuffer();\n    DoScheduledBgTilemapCopiesToVram();\n    UpdatePaletteFade();",
  },
  "CB2_LoadPyramidBagMenu": {
    callsTo: ["LoadPyramidBagMenu","MenuHelpers_IsLinkActive","MenuHelpers_ShouldWaitForLinkRecv"],
    lineCount: 3,
    bodyC: "while (MenuHelpers_ShouldWaitForLinkRecv() != TRUE\n        && LoadPyramidBagMenu() != TRUE\n        && MenuHelpers_IsLinkActive() != TRUE);",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_BagWaitForShake": {
    callsTo: ["StartSpriteAffineAnim"],
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 5,
    bodyC: "if (sprite->affineAnimEnded)\n    {\n        StartSpriteAffineAnim(sprite, ANIM_BAG_STILL);\n        sprite->callback = SpriteCallbackDummy;\n    }",
  },
} as const;
