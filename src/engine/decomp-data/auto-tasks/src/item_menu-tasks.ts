// AUTO-GENERATED from src/item_menu.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 17 Task_, 11 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_FadeAndCloseBagMenu": {
    callsTo: ["BeginNormalPaletteFade"],
    taskTransitions: ["Task_CloseBagMenu"],
    lineCount: 2,
    bodyC: "BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);\n    gTasks[taskId].func = Task_CloseBagMenu;",
  },
  "Task_CloseBagMenu": {
    callsTo: ["BagDestroyPocketScrollArrowPair","DestroyListMenuTask","DestroyTask","FreeAllSpritePalettes","FreeBagMenu","ResetSpriteData","SetMainCallback2"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 14,
    bodyC: "s16 *data = gTasks[taskId].data;\n    if (!gPaletteFade.active)\n    {\n        DestroyListMenuTask(tListTaskId, &gBagPosition.scrollPosition[gBagPosition.pocket], &gBagPosition.cursorPosition[gBagPosition.pocket]);\n\n         \n         \n        if (gBagMenu->newScreenCallback != NULL)\n            SetMainCallback2(gBagMenu->newScreenCallback);\n        else\n            SetMainCallback2(gBagPosition.exitCallback);\n\n        BagDestroyPocketScrollArrowPair();\n        ResetSpriteData();\n        FreeAllSpritePalettes();\n        FreeBagMenu();\n        DestroyTask(taskId);\n    }",
  },
  "Task_BagMenu_HandleInput": {
    callsTo: ["BagDestroyPocketScrollArrowPair","BagGetItemIdByPocketPosition","BagGetQuantityByPocketPosition","BagMenu_PrintCursor","CanSwapItems","GetSwitchBagPocketDirection","JOY_NEW","ListMenuGetScrollAndRow","ListMenu_ProcessInput","MenuHelpers_ShouldWaitForLinkRecv","PlaySE","StartItemSwap","SwitchBagPocket"],
    taskTransitions: ["Task_FadeAndCloseBagMenu"],
    externalChecks: { paletteFade: true, joyButtons: ["NEW:SELECT_BUTTON"] },
    lineCount: 57,
    bodyC: "s16 *data = gTasks[taskId].data;\n    u16 *scrollPos = &gBagPosition.scrollPosition[gBagPosition.pocket];\n    u16 *cursorPos = &gBagPosition.cursorPosition[gBagPosition.pocket];\n    s32 listPosition;\n\n    if (MenuHelpers_ShouldWaitForLinkRecv() != TRUE && !gPaletteFade.active)\n    {\n        switch (GetSwitchBagPocketDirection())\n        {\n        case SWITCH_POCKET_LEFT:\n            SwitchBagPocket(taskId, MENU_CURSOR_DELTA_LEFT, FALSE);\n            return;\n        case SWITCH_POCKET_RIGHT:\n            SwitchBagPocket(taskId, MENU_CURSOR_DELTA_RIGHT, FALSE);\n            return;\n        default:\n            if (JOY_NEW(SELECT_BUTTON))\n            {\n                if (CanSwapItems() == TRUE)\n                {\n                    ListMenuGetScrollAndRow(tListTaskId, scrollPos, cursorPos);\n                    if ((*scrollPos + *cursorPos) != gBagMenu->numItemStacks[gBagPosition.pocket] - 1)\n                    {\n                        PlaySE(SE_SELECT);\n                        StartItemSwap(taskId);\n                    }\n                }\n                return;\n            }\n            break;\n        }\n\n        listPosition = ListMenu_ProcessInput(tListTaskId);\n        ListMenuGetScrollAndRow(tListTaskId, scrollPos, cursorPos);\n        switch (listPosition)\n        {\n        case LIST_NOTHING_CHOSEN:\n            break;\n        case LIST_CANCEL:\n            if (gBagPosition.location == ITEMMENULOCATION_BERRY_BLENDER_CRUSH)\n            {\n                PlaySE(SE_FAILURE);\n                break;\n            }\n            PlaySE(SE_SELECT);\n            gSpecialVar_ItemId = ITEM_NONE;\n            gTasks[taskId].func = Task_FadeAndCloseBagMenu;\n            break;\n        default:  \n            PlaySE(SE_SELECT);\n            BagDestroyPocketScrollArrowPair();\n            BagMenu_PrintCursor(tListTaskId, COLORID_GRAY_CURSOR);\n            tListPosition = listPosition;\n            tQuantity = BagGetQuantityByPocketPosition(gBagPosition.pocket + 1, listPosition);\n            gSpecialVar_ItemId = BagGetItemIdByPocketPosition(gBagPosition.pocket + 1, listPosition);\n            sContextMenuFuncs[gBagPosition.location](taskId);\n            break;\n        }\n    }",
  },
  "Task_SwitchBagPocket": {
    callsTo: ["ChangeBagPocketId","CopyPocketNameToWindow","CreatePocketScrollArrowPair","CreatePocketSwitchArrowPair","DrawItemListBgRow","GetSwitchBagPocketDirection","IsWallysBag","ListMenuInit","LoadBagItemListBuffers","MenuHelpers_IsLinkActive","PutWindowTilemap","ScheduleBgCopyTilemapToVram","SwitchBagPocket","SwitchTaskToFollowupFunc"],
    terminalMarkers: ["SwitchTaskToFollowupFunc"],
    lineCount: 42,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (!MenuHelpers_IsLinkActive() && !IsWallysBag())\n    {\n        switch (GetSwitchBagPocketDirection())\n        {\n        case SWITCH_POCKET_LEFT:\n            ChangeBagPocketId(&gBagPosition.pocket, tPocketSwitchDir);\n            SwitchTaskToFollowupFunc(taskId);\n            SwitchBagPocket(taskId, MENU_CURSOR_DELTA_LEFT, TRUE);\n            return;\n        case SWITCH_POCKET_RIGHT:\n            ChangeBagPocketId(&gBagPosition.pocket, tPocketSwitchDir);\n            SwitchTaskToFollowupFunc(taskId);\n            SwitchBagPocket(taskId, MENU_CURSOR_DELTA_RIGHT, TRUE);\n            return;\n        }\n    }\n    switch (tPocketSwitchState)\n    {\n    case 0:\n        DrawItemListBgRow(tPocketSwitchTimer);\n        if (!(++tPocketSwitchTimer & 1))\n        {\n            if (tPocketSwitchDir == MENU_CURSOR_DELTA_RIGHT)\n                CopyPocketNameToWindow((u8)(tPocketSwitchTimer >> 1));\n            else\n                CopyPocketNameToWindow((u8)(8 - (tPocketSwitchTimer >> 1)));\n        }\n        if (tPocketSwitchTimer == 16)\n            tPocketSwitchState++;\n        break;\n    case 1:\n        ChangeBagPocketId(&gBagPosition.pocket, tPocketSwitchDir);\n        LoadBagItemListBuffers(gBagPosition.pocket);\n        tListTaskId = ListMenuInit(&gMultiuseListMenuTemplate, gBagPosition.scrollPosition[gBagPosition.pocket], gBagPosition.cursorPosition[gBagPosition.pocket]);\n        PutWindowTilemap(WIN_DESCRIPTION);\n        PutWindowTilemap(WIN_POCKET_NAME);\n        ScheduleBgCopyTilemapToVram(0);\n        CreatePocketScrollArrowPair();\n        CreatePocketSwitchArrowPair();\n        SwitchTaskToFollowupFunc(taskId);\n    }",
  },
  "Task_HandleSwappingItemsInput": {
    callsTo: ["CancelItemSwap","DoItemSwap","JOY_NEW","ListMenuGetScrollAndRow","ListMenu_ProcessInput","MenuHelpers_ShouldWaitForLinkRecv","PlaySE","SetItemMenuSwapLineInvisibility","UpdateItemMenuSwapLinePos"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON","NEW:SELECT_BUTTON"] },
    lineCount: 33,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (MenuHelpers_ShouldWaitForLinkRecv() != TRUE)\n    {\n        if (JOY_NEW(SELECT_BUTTON))\n        {\n            PlaySE(SE_SELECT);\n            ListMenuGetScrollAndRow(tListTaskId, &gBagPosition.scrollPosition[gBagPosition.pocket], &gBagPosition.cursorPosition[gBagPosition.pocket]);\n            DoItemSwap(taskId);\n        }\n        else\n        {\n            s32 input = ListMenu_ProcessInput(tListTaskId);\n            ListMenuGetScrollAndRow(tListTaskId, &gBagPosition.scrollPosition[gBagPosition.pocket], &gBagPosition.cursorPosition[gBagPosition.pocket]);\n            SetItemMenuSwapLineInvisibility(FALSE);\n            UpdateItemMenuSwapLinePos(gBagPosition.cursorPosition[gBagPosition.pocket]);\n            switch (input)\n            {\n            case LIST_NOTHING_CHOSEN:\n                break;\n            case LIST_CANCEL:\n                PlaySE(SE_SELECT);\n                if (JOY_NEW(A_BUTTON))\n                    DoItemSwap(taskId);\n                else\n                    CancelItemSwap(taskId);\n                break;\n            default:\n                PlaySE(SE_SELECT);\n                DoItemSwap(taskId);\n                break;\n            }\n        }\n    }",
  },
  "Task_ItemContext_Normal": {
    callsTo: ["OpenContextMenu"],
    taskTransitions: ["Task_ItemContext_MultipleRows","Task_ItemContext_SingleRow"],
    lineCount: 5,
    bodyC: "OpenContextMenu(taskId);\n\n     \n     \n    if (gBagMenu->contextMenuNumItems <= 2)\n        gTasks[taskId].func = Task_ItemContext_SingleRow;\n    else\n        gTasks[taskId].func = Task_ItemContext_MultipleRows;",
  },
  "Task_ItemContext_SingleRow": {
    callsTo: ["MenuHelpers_ShouldWaitForLinkRecv","Menu_ProcessInputNoWrap","PlaySE","void_u8"],
    lineCount: 17,
    bodyC: "if (MenuHelpers_ShouldWaitForLinkRecv() != TRUE)\n    {\n        s8 selection = Menu_ProcessInputNoWrap();\n        switch (selection)\n        {\n        case MENU_NOTHING_CHOSEN:\n            break;\n        case MENU_B_PRESSED:\n            PlaySE(SE_SELECT);\n            sItemMenuActions[ACTION_CANCEL].func.void_u8(taskId);\n            break;\n        default:\n            PlaySE(SE_SELECT);\n            sItemMenuActions[gBagMenu->contextMenuItemsPtr[selection]].func.void_u8(taskId);\n            break;\n        }\n    }",
  },
  "Task_ItemContext_MultipleRows": {
    callsTo: ["ChangeMenuGridCursorPosition","GetLRKeysPressed","IsValidContextMenuPos","JOY_NEW","MenuHelpers_ShouldWaitForLinkRecv","Menu_GetCursorPos","PlaySE","void_u8"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON","NEW:B_BUTTON","NEW:DPAD_DOWN","NEW:DPAD_LEFT","NEW:DPAD_RIGHT","NEW:DPAD_UP"] },
    lineCount: 46,
    bodyC: "if (MenuHelpers_ShouldWaitForLinkRecv() != TRUE)\n    {\n        s8 cursorPos = Menu_GetCursorPos();\n        if (JOY_NEW(DPAD_UP))\n        {\n            if (cursorPos > 0 && IsValidContextMenuPos(cursorPos - 2))\n            {\n                PlaySE(SE_SELECT);\n                ChangeMenuGridCursorPosition(MENU_CURSOR_DELTA_NONE, MENU_CURSOR_DELTA_UP);\n            }\n        }\n        else if (JOY_NEW(DPAD_DOWN))\n        {\n            if (cursorPos < (gBagMenu->contextMenuNumItems - 2) && IsValidContextMenuPos(cursorPos + 2))\n            {\n                PlaySE(SE_SELECT);\n                ChangeMenuGridCursorPosition(MENU_CURSOR_DELTA_NONE, MENU_CURSOR_DELTA_DOWN);\n            }\n        }\n        else if (JOY_NEW(DPAD_LEFT) || GetLRKeysPressed() == MENU_L_PRESSED)\n        {\n            if ((cursorPos & 1) && IsValidContextMenuPos(cursorPos - 1))\n            {\n                PlaySE(SE_SELECT);\n                ChangeMenuGridCursorPosition(MENU_CURSOR_DELTA_LEFT, MENU_CURSOR_DELTA_NONE);\n            }\n        }\n        else if (JOY_NEW(DPAD_RIGHT) || GetLRKeysPressed() == MENU_R_PRESSED)\n        {\n            if (!(cursorPos & 1) && IsValidContextMenuPos(cursorPos + 1))\n            {\n                PlaySE(SE_SELECT);\n                ChangeMenuGridCursorPosition(MENU_CURSOR_DELTA_RIGHT, MENU_CURSOR_DELTA_NONE);\n            }\n        }\n        else if (JOY_NEW(A_BUTTON))\n        {\n            PlaySE(SE_SELECT);\n            sItemMenuActions[gBagMenu->contextMenuItemsPtr[cursorPos]].func.void_u8(taskId);\n        }\n        else if (JOY_NEW(B_BUTTON))\n        {\n            PlaySE(SE_SELECT);\n            sItemMenuActions[ACTION_CANCEL].func.void_u8(taskId);\n        }\n    }",
  },
  "Task_ChooseHowManyToToss": {
    callsTo: ["AdjustQuantityAccordingToDPadInput","AskTossItems","BagMenu_RemoveWindow","CancelToss","JOY_NEW","PlaySE","PrintItemQuantity"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON","NEW:B_BUTTON"] },
    lineCount: 17,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (AdjustQuantityAccordingToDPadInput(&tItemCount, tQuantity) == TRUE)\n    {\n         \n        PrintItemQuantity(gBagMenu->windowIds[ITEMWIN_QUANTITY], tItemCount, 0);\n    }\n    else if (JOY_NEW(A_BUTTON))\n    {\n        PlaySE(SE_SELECT);\n        BagMenu_RemoveWindow(ITEMWIN_QUANTITY);\n        AskTossItems(taskId);\n    }\n    else if (JOY_NEW(B_BUTTON))\n    {\n        PlaySE(SE_SELECT);\n        BagMenu_RemoveWindow(ITEMWIN_QUANTITY);\n        CancelToss(taskId);\n    }",
  },
  "Task_RemoveItemFromBag": {
    callsTo: ["DestroyListMenuTask","JOY_NEW","ListMenuInit","LoadBagItemListBuffers","PlaySE","RemoveBagItem","ReturnToItemList","ScheduleBgCopyTilemapToVram","UpdatePocketItemList","UpdatePocketListPosition"],
    lineCount: 15,
    bodyC: "s16 *data = gTasks[taskId].data;\n    u16 *scrollPos = &gBagPosition.scrollPosition[gBagPosition.pocket];\n    u16 *cursorPos = &gBagPosition.cursorPosition[gBagPosition.pocket];\n\n    if (JOY_NEW(A_BUTTON | B_BUTTON))\n    {\n        PlaySE(SE_SELECT);\n        RemoveBagItem(gSpecialVar_ItemId, tItemCount);\n        DestroyListMenuTask(tListTaskId, scrollPos, cursorPos);\n        UpdatePocketItemList(gBagPosition.pocket);\n        UpdatePocketListPosition(gBagPosition.pocket);\n        LoadBagItemListBuffers(gBagPosition.pocket);\n        tListTaskId = ListMenuInit(&gMultiuseListMenuTemplate, *scrollPos, *cursorPos);\n        ScheduleBgCopyTilemapToVram(0);\n        ReturnToItemList(taskId);\n    }",
  },
  "Task_ItemContext_GiveToParty": {
    callsTo: ["CopyItemName","DisplayItemMessage","GetItemImportance","IsHoldingItemAllowed","IsWritingMailAllowed","PrintItemCantBeHeld","StringExpandPlaceholders","Task_FadeAndCloseBagMenu"],
    lineCount: 18,
    bodyC: "if (!IsWritingMailAllowed(gSpecialVar_ItemId))\n    {\n        DisplayItemMessage(taskId, FONT_NORMAL, gText_CantWriteMail, HandleErrorMessage);\n    }\n    else if (!IsHoldingItemAllowed(gSpecialVar_ItemId))\n    {\n        CopyItemName(gSpecialVar_ItemId, gStringVar1);\n        StringExpandPlaceholders(gStringVar4, gText_Var1CantBeHeldHere);\n        DisplayItemMessage(taskId, FONT_NORMAL, gStringVar4, HandleErrorMessage);\n    }\n    else if (gBagPosition.pocket != KEYITEMS_POCKET && !GetItemImportance(gSpecialVar_ItemId))\n    {\n        Task_FadeAndCloseBagMenu(taskId);\n    }\n    else\n    {\n        PrintItemCantBeHeld(taskId);\n    }",
  },
  "Task_ItemContext_GiveToPC": {
    callsTo: ["DisplayItemMessage","GetItemImportance","ItemIsMail","PrintItemCantBeHeld"],
    taskTransitions: ["Task_FadeAndCloseBagMenu"],
    lineCount: 6,
    bodyC: "if (ItemIsMail(gSpecialVar_ItemId) == TRUE)\n        DisplayItemMessage(taskId, FONT_NORMAL, gText_CantWriteMail, HandleErrorMessage);\n    else if (gBagPosition.pocket != KEYITEMS_POCKET && !GetItemImportance(gSpecialVar_ItemId))\n        gTasks[taskId].func = Task_FadeAndCloseBagMenu;\n    else\n        PrintItemCantBeHeld(taskId);",
  },
  "Task_ItemContext_Sell": {
    callsTo: ["CopyItemName","DisplayCurrentMoneyWindow","DisplayItemMessage","DisplaySellItemPriceAndConfirm","GetItemPrice","StringExpandPlaceholders"],
    lineCount: 22,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (GetItemPrice(gSpecialVar_ItemId) == 0)\n    {\n        CopyItemName(gSpecialVar_ItemId, gStringVar2);\n        StringExpandPlaceholders(gStringVar4, gText_CantBuyKeyItem);\n        DisplayItemMessage(taskId, FONT_NORMAL, gStringVar4, CloseItemMessage);\n    }\n    else\n    {\n        tItemCount = 1;\n        if (tQuantity == 1)\n        {\n            DisplayCurrentMoneyWindow();\n            DisplaySellItemPriceAndConfirm(taskId);\n        }\n        else\n        {\n            CopyItemName(gSpecialVar_ItemId, gStringVar2);\n            StringExpandPlaceholders(gStringVar4, gText_HowManyToSell);\n            DisplayItemMessage(taskId, FONT_NORMAL, gStringVar4, InitSellHowManyInput);\n        }\n    }",
  },
  "Task_ChooseHowManyToSell": {
    callsTo: ["AdjustQuantityAccordingToDPadInput","BagMenu_PrintCursor","BagMenu_RemoveWindow","DisplaySellItemPriceAndConfirm","GetItemPrice","JOY_NEW","PlaySE","PrintItemSoldAmount","RemoveItemMessageWindow","RemoveMoneyWindow","ReturnToItemList"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON","NEW:B_BUTTON"] },
    lineCount: 20,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (AdjustQuantityAccordingToDPadInput(&tItemCount, tQuantity) == TRUE)\n    {\n        PrintItemSoldAmount(gBagMenu->windowIds[ITEMWIN_QUANTITY_WIDE], tItemCount, (GetItemPrice(gSpecialVar_ItemId) / 2) * tItemCount);\n    }\n    else if (JOY_NEW(A_BUTTON))\n    {\n        PlaySE(SE_SELECT);\n        BagMenu_RemoveWindow(ITEMWIN_QUANTITY_WIDE);\n        DisplaySellItemPriceAndConfirm(taskId);\n    }\n    else if (JOY_NEW(B_BUTTON))\n    {\n        PlaySE(SE_SELECT);\n        BagMenu_PrintCursor(tListTaskId, COLORID_NORMAL);\n        RemoveMoneyWindow();\n        BagMenu_RemoveWindow(ITEMWIN_QUANTITY_WIDE);\n        RemoveItemMessageWindow(ITEMWIN_MESSAGE);\n        ReturnToItemList(taskId);\n    }",
  },
  "Task_ItemContext_Deposit": {
    callsTo: ["AddItemQuantityWindow","BagMenu_Print","CopyItemName","FillWindowPixelBuffer","PIXEL_FILL","StringExpandPlaceholders","TryDepositItem"],
    taskTransitions: ["Task_ChooseHowManyToDeposit"],
    lineCount: 15,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    tItemCount = 1;\n    if (tQuantity == 1)\n    {\n        TryDepositItem(taskId);\n    }\n    else\n    {\n        CopyItemName(gSpecialVar_ItemId, gStringVar1);\n        StringExpandPlaceholders(gStringVar4, gText_DepositHowManyVar1);\n        FillWindowPixelBuffer(WIN_DESCRIPTION, PIXEL_FILL(0));\n        BagMenu_Print(WIN_DESCRIPTION, FONT_NORMAL, gStringVar4, 3, 1, 0, 0, 0, COLORID_NORMAL);\n        AddItemQuantityWindow(ITEMWIN_QUANTITY);\n        gTasks[taskId].func = Task_ChooseHowManyToDeposit;\n    }",
  },
  "Task_ChooseHowManyToDeposit": {
    callsTo: ["AdjustQuantityAccordingToDPadInput","BagMenu_PrintCursor","BagMenu_RemoveWindow","JOY_NEW","PlaySE","PrintItemDescription","PrintItemQuantity","ReturnToItemList","TryDepositItem"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON","NEW:B_BUTTON"] },
    lineCount: 19,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (AdjustQuantityAccordingToDPadInput(&tItemCount, tQuantity) == TRUE)\n    {\n         \n        PrintItemQuantity(gBagMenu->windowIds[ITEMWIN_QUANTITY], tItemCount, 0);\n    }\n    else if (JOY_NEW(A_BUTTON))\n    {\n        PlaySE(SE_SELECT);\n        BagMenu_RemoveWindow(ITEMWIN_QUANTITY);\n        TryDepositItem(taskId);\n    }\n    else if (JOY_NEW(B_BUTTON))\n    {\n        PlaySE(SE_SELECT);\n        PrintItemDescription(tListPosition);\n        BagMenu_PrintCursor(tListTaskId, COLORID_NORMAL);\n        BagMenu_RemoveWindow(ITEMWIN_QUANTITY);\n        ReturnToItemList(taskId);\n    }",
  },
  "Task_WallyTutorialBagMenu": {
    callsTo: ["BagMenu_PrintCursor","DestroyListMenuTask","OpenContextMenu","PlaySE","RemoveContextWindow","RestoreBagAfterWallyTutorial","SwitchBagPocket","Task_FadeAndCloseBagMenu"],
    externalChecks: { paletteFade: true },
    lineCount: 29,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (!gPaletteFade.active)\n    {\n        switch (tTimer)\n        {\n        case WALLY_BAG_DELAY * 1:\n            PlaySE(SE_SELECT);\n            SwitchBagPocket(taskId, MENU_CURSOR_DELTA_RIGHT, FALSE);\n            tTimer++;\n            break;\n        case WALLY_BAG_DELAY * 2:\n            PlaySE(SE_SELECT);\n            BagMenu_PrintCursor(tListTaskId, COLORID_GRAY_CURSOR);\n            gSpecialVar_ItemId = ITEM_POKE_BALL;\n            OpenContextMenu(taskId);\n            tTimer++;\n            break;\n        case WALLY_BAG_DELAY * 3:\n            PlaySE(SE_SELECT);\n            RemoveContextWindow();\n            DestroyListMenuTask(tListTaskId, 0, 0);\n            RestoreBagAfterWallyTutorial();\n            Task_FadeAndCloseBagMenu(taskId);\n            break;\n        default:\n            tTimer++;\n            break;\n        }\n    }",
  },
} as const;

export const CB2S = {
  "CB2_BagMenuFromStartMenu": {
    callsTo: ["GoToBagMenu"],
    lineCount: 1,
    bodyC: "GoToBagMenu(ITEMMENULOCATION_FIELD, POCKETS_COUNT, CB2_ReturnToFieldWithOpenMenu);",
  },
  "CB2_BagMenuFromBattle": {
    callsTo: ["CurrentBattlePyramidLocation","GoToBagMenu","GoToBattlePyramidBagMenu"],
    lineCount: 4,
    bodyC: "if (CurrentBattlePyramidLocation() == PYRAMID_LOCATION_NONE)\n        GoToBagMenu(ITEMMENULOCATION_BATTLE, POCKETS_COUNT, CB2_SetUpReshowBattleScreenAfterMenu2);\n    else\n        GoToBattlePyramidBagMenu(PYRAMIDBAG_LOC_BATTLE, CB2_SetUpReshowBattleScreenAfterMenu2);",
  },
  "CB2_ChooseBerry": {
    callsTo: ["GoToBagMenu"],
    lineCount: 1,
    bodyC: "GoToBagMenu(ITEMMENULOCATION_BERRY_TREE, BERRIES_POCKET, CB2_ReturnToFieldContinueScript);",
  },
  "CB2_GoToSellMenu": {
    callsTo: ["GoToBagMenu"],
    lineCount: 1,
    bodyC: "GoToBagMenu(ITEMMENULOCATION_SHOP, POCKETS_COUNT, CB2_ExitSellMenu);",
  },
  "CB2_GoToItemDepositMenu": {
    callsTo: ["GoToBagMenu"],
    lineCount: 1,
    bodyC: "GoToBagMenu(ITEMMENULOCATION_ITEMPC, POCKETS_COUNT, CB2_PlayerPCExitBagMenu);",
  },
  "CB2_BagMenuRun": {
    callsTo: ["AnimateSprites","BuildOamBuffer","DoScheduledBgTilemapCopiesToVram","RunTasks","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 5,
    bodyC: "RunTasks();\n    AnimateSprites();\n    BuildOamBuffer();\n    DoScheduledBgTilemapCopiesToVram();\n    UpdatePaletteFade();",
  },
  "CB2_Bag": {
    callsTo: ["MenuHelpers_IsLinkActive","MenuHelpers_ShouldWaitForLinkRecv","SetupBagMenu"],
    lineCount: 2,
    bodyC: "while(MenuHelpers_ShouldWaitForLinkRecv() != TRUE && SetupBagMenu() != TRUE && MenuHelpers_IsLinkActive() != TRUE)\n        {};",
  },
  "CB2_ReturnToBagMenuPocket": {
    callsTo: ["GoToBagMenu"],
    lineCount: 1,
    bodyC: "GoToBagMenu(ITEMMENULOCATION_LAST, POCKETS_COUNT, NULL);",
  },
  "CB2_ApprenticeExitBagMenu": {
    callsTo: ["SetMainCallback2"],
    cb2Transitions: ["CB2_ReturnToField"],
    lineCount: 2,
    bodyC: "gFieldCallback = Apprentice_ScriptContext_Enable;\n    SetMainCallback2(CB2_ReturnToField);",
  },
  "CB2_FavorLadyExitBagMenu": {
    callsTo: ["SetMainCallback2"],
    cb2Transitions: ["CB2_ReturnToField"],
    lineCount: 2,
    bodyC: "gFieldCallback = FieldCallback_FavorLadyEnableScriptContexts;\n    SetMainCallback2(CB2_ReturnToField);",
  },
  "CB2_QuizLadyExitBagMenu": {
    callsTo: ["SetMainCallback2"],
    cb2Transitions: ["CB2_ReturnToField"],
    lineCount: 2,
    bodyC: "gFieldCallback = FieldCallback_QuizLadyEnableScriptContexts;\n    SetMainCallback2(CB2_ReturnToField);",
  },
} as const;
