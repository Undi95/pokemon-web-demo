// AUTO-GENERATED from src/shop.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 12 Task_, 3 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_ShopMenu": {
    callsTo: ["Menu_ProcessInputNoWrap","PlaySE","Task_HandleShopMenuQuit","void_u8"],
    lineCount: 13,
    bodyC: "s8 inputCode = Menu_ProcessInputNoWrap();\n    switch (inputCode)\n    {\n    case MENU_NOTHING_CHOSEN:\n        break;\n    case MENU_B_PRESSED:\n        PlaySE(SE_SELECT);\n        Task_HandleShopMenuQuit(taskId);\n        break;\n    default:\n        sMartInfo.menuActions[inputCode].func.void_u8(taskId);\n        break;\n    }",
  },
  "Task_HandleShopMenuBuy": {
    callsTo: ["FadeScreen"],
    taskTransitions: ["Task_GoToBuyOrSellMenu"],
    lineCount: 5,
    bodyC: "s16 *data = gTasks[taskId].data;\n    tCallbackHi = (u32)CB2_InitBuyMenu >> 16;\n    tCallbackLo = (u32)CB2_InitBuyMenu;\n    gTasks[taskId].func = Task_GoToBuyOrSellMenu;\n    FadeScreen(FADE_TO_BLACK, 0);",
  },
  "Task_HandleShopMenuSell": {
    callsTo: ["FadeScreen"],
    taskTransitions: ["Task_GoToBuyOrSellMenu"],
    lineCount: 5,
    bodyC: "s16 *data = gTasks[taskId].data;\n    tCallbackHi = (u32)CB2_GoToSellMenu >> 16;\n    tCallbackLo = (u32)CB2_GoToSellMenu;\n    gTasks[taskId].func = Task_GoToBuyOrSellMenu;\n    FadeScreen(FADE_TO_BLACK, 0);",
  },
  "Task_HandleShopMenuQuit": {
    callsTo: ["ClearStdWindowAndFrameToTransparent","DestroyTask","RemoveWindow","TryPutSmartShopperOnAir","UnlockPlayerFieldControls","callback"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 7,
    bodyC: "ClearStdWindowAndFrameToTransparent(sMartInfo.windowId, 2);  \n    RemoveWindow(sMartInfo.windowId);\n    TryPutSmartShopperOnAir();\n    UnlockPlayerFieldControls();\n    DestroyTask(taskId);\n\n    if (sMartInfo.callback)\n        sMartInfo.callback();",
  },
  "Task_GoToBuyOrSellMenu": {
    callsTo: ["DestroyTask","SetMainCallback2"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 6,
    bodyC: "s16 *data = gTasks[taskId].data;\n    if (!gPaletteFade.active)\n    {\n        DestroyTask(taskId);\n        SetMainCallback2((MainCallback)((u16)tCallbackHi << 16 | (u16)tCallbackLo));\n    }",
  },
  "Task_ReturnToShopMenu": {
    callsTo: ["DisplayItemMessageOnField","IsWeatherNotFadingIn"],
    lineCount: 7,
    bodyC: "if (IsWeatherNotFadingIn() == TRUE)\n    {\n        if (sMartInfo.martType == MART_TYPE_DECOR2)\n            DisplayItemMessageOnField(taskId, gText_CanIHelpWithAnythingElse, ShowShopMenuAfterExitingBuyOrSellMenu);\n        else\n            DisplayItemMessageOnField(taskId, gText_AnythingElseICanHelp, ShowShopMenuAfterExitingBuyOrSellMenu);\n    }",
  },
  "Task_BuyMenu": {
    callsTo: ["BuyMenuDisplayMessage","BuyMenuPrintCursor","BuyMenuRemoveScrollIndicatorArrows","ClearWindowTilemap","ConvertIntToDecimalStringN","CopyItemName","ExitBuyMenu","GetItemPocket","GetItemPrice","IsEnoughMoney","IsPokeNewsActive","ItemIdToBattleMoveId","ListMenuGetScrollAndRow","ListMenu_ProcessInput","PlaySE","StringCopy","StringExpandPlaceholders"],
    externalChecks: { paletteFade: true },
    lineCount: 56,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (!gPaletteFade.active)\n    {\n        s32 itemId = ListMenu_ProcessInput(tListTaskId);\n        ListMenuGetScrollAndRow(tListTaskId, &sShopData->scrollOffset, &sShopData->selectedRow);\n\n        switch (itemId)\n        {\n        case LIST_NOTHING_CHOSEN:\n            break;\n        case LIST_CANCEL:\n            PlaySE(SE_SELECT);\n            ExitBuyMenu(taskId);\n            break;\n        default:\n            PlaySE(SE_SELECT);\n            tItemId = itemId;\n            ClearWindowTilemap(WIN_ITEM_DESCRIPTION);\n            BuyMenuRemoveScrollIndicatorArrows();\n            BuyMenuPrintCursor(tListTaskId, COLORID_GRAY_CURSOR);\n\n            if (sMartInfo.martType == MART_TYPE_NORMAL)\n                sShopData->totalCost = (GetItemPrice(itemId) >> IsPokeNewsActive(POKENEWS_SLATEPORT));\n            else\n                sShopData->totalCost = gDecorations[itemId].price;\n\n            if (!IsEnoughMoney(&gSaveBlock1Ptr->money, sShopData->totalCost))\n            {\n                BuyMenuDisplayMessage(taskId, gText_YouDontHaveMoney, BuyMenuReturnToItemList);\n            }\n            else\n            {\n                if (sMartInfo.martType == MART_TYPE_NORMAL)\n                {\n                    CopyItemName(itemId, gStringVar1);\n                    if (GetItemPocket(itemId) == POCKET_TM_HM)\n                    {\n                        StringCopy(gStringVar2, gMoveNames[ItemIdToBattleMoveId(itemId)]);\n                        BuyMenuDisplayMessage(taskId, gText_Var1CertainlyHowMany2, Task_BuyHowManyDialogueInit);\n                    }\n                    else\n                    {\n                        BuyMenuDisplayMessage(taskId, gText_Var1CertainlyHowMany, Task_BuyHowManyDialogueInit);\n                    }\n                }\n                else\n                {\n                    StringCopy(gStringVar1, gDecorations[itemId].name);\n                    ConvertIntToDecimalStringN(gStringVar2, sShopData->totalCost, STR_CONV_MODE_LEFT_ALIGN, 6);\n\n                    if (sMartInfo.martType == MART_TYPE_DECOR)\n                        StringExpandPlaceholders(gStringVar4, gText_Var1IsItThatllBeVar2);\n                    else  \n                        StringExpandPlaceholders(gStringVar4, gText_YouWantedVar1ThatllBeVar2);\n\n                    BuyMenuDisplayMessage(taskId, gStringVar4, BuyMenuConfirmPurchase);\n                }\n            }\n            break;\n        }\n    }",
  },
  "Task_BuyHowManyDialogueInit": {
    callsTo: ["BuyMenuPrint","BuyMenuPrintItemQuantityAndPrice","ConvertIntToDecimalStringN","CountTotalItemQuantityInBag","DrawStdFrameWithCustomTileAndPalette","GetMoney","ScheduleBgCopyTilemapToVram","StringExpandPlaceholders"],
    taskTransitions: ["Task_BuyHowManyDialogueHandleInput"],
    lineCount: 17,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    u16 quantityInBag = CountTotalItemQuantityInBag(tItemId);\n    u16 maxQuantity;\n\n    DrawStdFrameWithCustomTileAndPalette(WIN_QUANTITY_IN_BAG, FALSE, 1, 13);\n    ConvertIntToDecimalStringN(gStringVar1, quantityInBag, STR_CONV_MODE_RIGHT_ALIGN, MAX_ITEM_DIGITS + 1);\n    StringExpandPlaceholders(gStringVar4, gText_InBagVar1);\n    BuyMenuPrint(WIN_QUANTITY_IN_BAG, gStringVar4, 0, 1, 0, COLORID_NORMAL);\n    tItemCount = 1;\n    DrawStdFrameWithCustomTileAndPalette(WIN_QUANTITY_PRICE, FALSE, 1, 13);\n    BuyMenuPrintItemQuantityAndPrice(taskId);\n    ScheduleBgCopyTilemapToVram(0);\n\n    maxQuantity = GetMoney(&gSaveBlock1Ptr->money) / sShopData->totalCost;\n\n    if (maxQuantity > MAX_BAG_ITEM_CAPACITY)\n        sShopData->maxQuantity = MAX_BAG_ITEM_CAPACITY;\n    else\n        sShopData->maxQuantity = maxQuantity;\n\n    gTasks[taskId].func = Task_BuyHowManyDialogueHandleInput;",
  },
  "Task_BuyHowManyDialogueHandleInput": {
    callsTo: ["AdjustQuantityAccordingToDPadInput","BuyMenuDisplayMessage","BuyMenuPrintItemQuantityAndPrice","BuyMenuReturnToItemList","ClearStdWindowAndFrameToTransparent","ClearWindowTilemap","ConvertIntToDecimalStringN","CopyItemName","GetItemPrice","IsPokeNewsActive","JOY_NEW","PlaySE","PutWindowTilemap"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON","NEW:B_BUTTON"] },
    lineCount: 31,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (AdjustQuantityAccordingToDPadInput(&tItemCount, sShopData->maxQuantity) == TRUE)\n    {\n        sShopData->totalCost = (GetItemPrice(tItemId) >> IsPokeNewsActive(POKENEWS_SLATEPORT)) * tItemCount;\n        BuyMenuPrintItemQuantityAndPrice(taskId);\n    }\n    else\n    {\n        if (JOY_NEW(A_BUTTON))\n        {\n            PlaySE(SE_SELECT);\n            ClearStdWindowAndFrameToTransparent(WIN_QUANTITY_PRICE, FALSE);\n            ClearStdWindowAndFrameToTransparent(WIN_QUANTITY_IN_BAG, FALSE);\n            ClearWindowTilemap(WIN_QUANTITY_PRICE);\n            ClearWindowTilemap(WIN_QUANTITY_IN_BAG);\n            PutWindowTilemap(WIN_ITEM_LIST);\n            CopyItemName(tItemId, gStringVar1);\n            ConvertIntToDecimalStringN(gStringVar2, tItemCount, STR_CONV_MODE_LEFT_ALIGN, BAG_ITEM_CAPACITY_DIGITS);\n            ConvertIntToDecimalStringN(gStringVar3, sShopData->totalCost, STR_CONV_MODE_LEFT_ALIGN, 6);\n            BuyMenuDisplayMessage(taskId, gText_Var1AndYouWantedVar2, BuyMenuConfirmPurchase);\n        }\n        else if (JOY_NEW(B_BUTTON))\n        {\n            PlaySE(SE_SELECT);\n            ClearStdWindowAndFrameToTransparent(WIN_QUANTITY_PRICE, FALSE);\n            ClearStdWindowAndFrameToTransparent(WIN_QUANTITY_IN_BAG, FALSE);\n            ClearWindowTilemap(WIN_QUANTITY_PRICE);\n            ClearWindowTilemap(WIN_QUANTITY_IN_BAG);\n            BuyMenuReturnToItemList(taskId);\n        }\n    }",
  },
  "Task_ReturnToItemListAfterItemPurchase": {
    callsTo: ["AddBagItem","BuyMenuDisplayMessage","BuyMenuReturnToItemList","JOY_NEW","PlaySE"],
    lineCount: 9,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (JOY_NEW(A_BUTTON | B_BUTTON))\n    {\n        PlaySE(SE_SELECT);\n\n         \n        if (tItemId == ITEM_POKE_BALL && tItemCount >= 10 && AddBagItem(ITEM_PREMIER_BALL, 1) == TRUE)\n            BuyMenuDisplayMessage(taskId, gText_ThrowInPremierBall, BuyMenuReturnToItemList);\n        else\n            BuyMenuReturnToItemList(taskId);\n    }",
  },
  "Task_ReturnToItemListAfterDecorationPurchase": {
    callsTo: ["BuyMenuReturnToItemList","JOY_NEW","PlaySE"],
    lineCount: 5,
    bodyC: "if (JOY_NEW(A_BUTTON | B_BUTTON))\n    {\n        PlaySE(SE_SELECT);\n        BuyMenuReturnToItemList(taskId);\n    }",
  },
  "Task_ExitBuyMenu": {
    callsTo: ["BuyMenuFreeMemory","DestroyTask","RemoveMoneyLabelObject","SetMainCallback2"],
    cb2Transitions: ["CB2_ReturnToField"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 7,
    bodyC: "if (!gPaletteFade.active)\n    {\n        RemoveMoneyLabelObject();\n        BuyMenuFreeMemory();\n        SetMainCallback2(CB2_ReturnToField);\n        DestroyTask(taskId);\n    }",
  },
} as const;

export const CB2S = {
  "CB2_ExitSellMenu": {
    callsTo: ["SetMainCallback2"],
    cb2Transitions: ["CB2_ReturnToField"],
    lineCount: 2,
    bodyC: "gFieldCallback = MapPostLoadHook_ReturnToShopMenu;\n    SetMainCallback2(CB2_ReturnToField);",
  },
  "CB2_BuyMenu": {
    callsTo: ["AnimateSprites","BuildOamBuffer","DoScheduledBgTilemapCopiesToVram","RunTasks","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 5,
    bodyC: "RunTasks();\n    AnimateSprites();\n    BuildOamBuffer();\n    DoScheduledBgTilemapCopiesToVram();\n    UpdatePaletteFade();",
  },
  "CB2_InitBuyMenu": {
    callsTo: ["AllocZeroed","BeginNormalPaletteFade","BlendPalettes","BuyMenuAddScrollIndicatorArrows","BuyMenuBuildListMenuTemplate","BuyMenuDecompressBgGraphics","BuyMenuDrawGraphics","BuyMenuInitBgs","BuyMenuInitWindows","ClearScheduledBgCopiesToVram","CpuFastFill","CreateTask","FillBgTilemapBufferRect_Palette0","FreeAllSpritePalettes","FreeTempTileDataBuffersIfPossible","ListMenuInit","ResetPaletteFade","ResetSpriteData","ResetTasks","ResetTempTileDataBuffers","ScanlineEffect_Stop","SetMainCallback2","SetVBlankCallback","SetVBlankHBlankCallbacksToNull"],
    cb2Transitions: ["CB2_BuyMenu"],
    lineCount: 42,
    bodyC: "u8 taskId;\n\n    switch (gMain.state)\n    {\n    case 0:\n        SetVBlankHBlankCallbacksToNull();\n        CpuFastFill(0, (void *)OAM, OAM_SIZE);\n        ScanlineEffect_Stop();\n        ResetTempTileDataBuffers();\n        FreeAllSpritePalettes();\n        ResetPaletteFade();\n        ResetSpriteData();\n        ResetTasks();\n        ClearScheduledBgCopiesToVram();\n        sShopData = AllocZeroed(sizeof(struct ShopData));\n        sShopData->scrollIndicatorsTaskId = TASK_NONE;\n        sShopData->itemSpriteIds[0] = SPRITE_NONE;\n        sShopData->itemSpriteIds[1] = SPRITE_NONE;\n        BuyMenuBuildListMenuTemplate();\n        BuyMenuInitBgs();\n        FillBgTilemapBufferRect_Palette0(0, 0, 0, 0, 0x20, 0x20);\n        FillBgTilemapBufferRect_Palette0(1, 0, 0, 0, 0x20, 0x20);\n        FillBgTilemapBufferRect_Palette0(2, 0, 0, 0, 0x20, 0x20);\n        FillBgTilemapBufferRect_Palette0(3, 0, 0, 0, 0x20, 0x20);\n        BuyMenuInitWindows();\n        BuyMenuDecompressBgGraphics();\n        gMain.state++;\n        break;\n    case 1:\n        if (!FreeTempTileDataBuffersIfPossible())\n            gMain.state++;\n        break;\n    default:\n        BuyMenuDrawGraphics();\n        BuyMenuAddScrollIndicatorArrows();\n        taskId = CreateTask(Task_BuyMenu, 8);\n        gTasks[taskId].tListTaskId = ListMenuInit(&gMultiuseListMenuTemplate, 0, 0);\n        BlendPalettes(PALETTES_ALL, 16, RGB_BLACK);\n        BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK);\n        SetVBlankCallback(VBlankCB_BuyMenu);\n        SetMainCallback2(CB2_BuyMenu);\n        break;\n    }",
  },
} as const;
