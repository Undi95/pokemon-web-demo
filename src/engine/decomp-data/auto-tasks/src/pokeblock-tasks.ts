// AUTO-GENERATED from src/pokeblock.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 4 Task_, 2 CB2_, 1 SpriteCB_

export const TASKS = {
  "Task_FreeDataAndExitPokeblockCase": {
    callsTo: ["DestroyListMenuTask","DestroyScrollArrows","DestroyTask","Free","FreeAllSpritePalettes","FreeAllWindowBuffers","ResetSpriteData","SetMainCallback2"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 17,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (!gPaletteFade.active)\n    {\n        if (sPokeblockMenu->caseId == PBLOCK_CASE_FEEDER || sPokeblockMenu->caseId == PBLOCK_CASE_GIVE)\n            gFieldCallback = FieldCB_ContinueScriptHandleMusic;\n\n        DestroyListMenuTask(tListTaskId, &sSavedPokeblockData.scrollOffset, &sSavedPokeblockData.selectedRow);\n        DestroyScrollArrows();\n        ResetSpriteData();\n        FreeAllSpritePalettes();\n\n        if (sPokeblockMenu->callbackOnUse != NULL)\n            SetMainCallback2(sPokeblockMenu->callbackOnUse);\n        else\n            SetMainCallback2(sSavedPokeblockData.callback);\n\n        FreeAllWindowBuffers();\n        Free(sPokeblockMenu);\n        DestroyTask(taskId);\n    }",
  },
  "Task_HandlePokeblockMenuInput": {
    callsTo: ["DrawPokeblockMenuHighlight","FadePaletteAndSetTaskToClosePokeblockCase","JOY_NEW","ListMenuGetScrollAndRow","ListMenu_ProcessInput","MenuHelpers_ShouldWaitForLinkRecv","PlaySE","ShowPokeblockActionsWindow"],
    taskTransitions: ["Task_HandlePokeblocksSwapInput"],
    externalChecks: { paletteFade: true, joyButtons: ["NEW:SELECT_BUTTON"] },
    lineCount: 43,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (!gPaletteFade.active && MenuHelpers_ShouldWaitForLinkRecv() != TRUE)\n    {\n        if (JOY_NEW(SELECT_BUTTON))\n        {\n            ListMenuGetScrollAndRow(tListTaskId, &sSavedPokeblockData.scrollOffset, &sSavedPokeblockData.selectedRow);\n            if (sSavedPokeblockData.scrollOffset + sSavedPokeblockData.selectedRow != sPokeblockMenu->itemsNo - 1)\n            {\n                 \n                PlaySE(SE_SELECT);\n                DrawPokeblockMenuHighlight(sSavedPokeblockData.selectedRow, TILE_HIGHLIGHT_RED);\n                tToSwapId = sSavedPokeblockData.scrollOffset + sSavedPokeblockData.selectedRow;\n                sPokeblockMenu->isSwapping = TRUE;\n                gTasks[taskId].func = Task_HandlePokeblocksSwapInput;\n            }\n        }\n        else\n        {\n            u16 oldPosition = sSavedPokeblockData.selectedRow;\n            s32 input = ListMenu_ProcessInput(tListTaskId);\n            ListMenuGetScrollAndRow(tListTaskId, &sSavedPokeblockData.scrollOffset, &sSavedPokeblockData.selectedRow);\n\n            if (oldPosition != sSavedPokeblockData.selectedRow)\n            {\n                 \n                DrawPokeblockMenuHighlight(oldPosition, TILE_HIGHLIGHT_NONE);\n                DrawPokeblockMenuHighlight(sSavedPokeblockData.selectedRow, TILE_HIGHLIGHT_BLUE);\n            }\n\n            switch (input)\n            {\n            case LIST_NOTHING_CHOSEN:\n                break;\n            case LIST_CANCEL:\n                PlaySE(SE_SELECT);\n                gSpecialVar_Result = 0xFFFF;\n                gSpecialVar_ItemId = 0;\n                FadePaletteAndSetTaskToClosePokeblockCase(taskId);\n                break;\n            default:\n                 \n                PlaySE(SE_SELECT);\n                gSpecialVar_ItemId = input;\n                ShowPokeblockActionsWindow(taskId);\n                break;\n            }\n        }\n    }",
  },
  "Task_HandlePokeblocksSwapInput": {
    callsTo: ["ARRAY_COUNT","DrawPokeblockMenuHighlight","JOY_NEW","ListMenuGetScrollAndRow","ListMenu_ProcessInput","MenuHelpers_ShouldWaitForLinkRecv","PlaySE","SetSwapLineSpritesInvisibility","UpdatePokeblockSwapMenu","UpdateSwapLineSpritesPos"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON","NEW:SELECT_BUTTON"] },
    lineCount: 45,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (MenuHelpers_ShouldWaitForLinkRecv() == TRUE)\n        return;\n\n    if (JOY_NEW(SELECT_BUTTON))\n    {\n         \n        PlaySE(SE_SELECT);\n        ListMenuGetScrollAndRow(tListTaskId, &sSavedPokeblockData.scrollOffset, &sSavedPokeblockData.selectedRow);\n        UpdatePokeblockSwapMenu(taskId, FALSE);\n    }\n    else\n    {\n        u16 i = sSavedPokeblockData.scrollOffset;\n        u16 row = sSavedPokeblockData.selectedRow;\n        s32 input = ListMenu_ProcessInput(tListTaskId);\n        ListMenuGetScrollAndRow(tListTaskId, &sSavedPokeblockData.scrollOffset, &sSavedPokeblockData.selectedRow);\n\n        if (i != sSavedPokeblockData.scrollOffset || row != sSavedPokeblockData.selectedRow)\n        {\n            for (i = 0; i < MAX_MENU_ITEMS; i++)\n            {\n                row = i + sSavedPokeblockData.scrollOffset;\n                if (row == tToSwapId)\n                    DrawPokeblockMenuHighlight(i, TILE_HIGHLIGHT_RED);\n                else\n                    DrawPokeblockMenuHighlight(i, TILE_HIGHLIGHT_NONE);\n            }\n        }\n\n        SetSwapLineSpritesInvisibility(sPokeblockMenu->swapLineSpriteIds, ARRAY_COUNT(sPokeblockMenu->swapLineSpriteIds), FALSE);\n        UpdateSwapLineSpritesPos(sPokeblockMenu->swapLineSpriteIds, ARRAY_COUNT(sPokeblockMenu->swapLineSpriteIds), 128, (sSavedPokeblockData.selectedRow * 16) + 8);\n\n        switch (input)\n        {\n        case LIST_NOTHING_CHOSEN:\n            break;\n        case LIST_CANCEL:\n            PlaySE(SE_SELECT);\n            if (JOY_NEW(A_BUTTON))  \n                UpdatePokeblockSwapMenu(taskId, FALSE);\n            else\n                UpdatePokeblockSwapMenu(taskId, TRUE);  \n            break;\n        default:\n             \n            PlaySE(SE_SELECT);\n            UpdatePokeblockSwapMenu(taskId, FALSE);\n            break;\n        }\n    }",
  },
  "Task_HandlePokeblockActionsInput": {
    callsTo: ["MenuHelpers_ShouldWaitForLinkRecv","Menu_ProcessInputNoWrap","PlaySE","PokeblockAction_Cancel","void_u8"],
    lineCount: 18,
    bodyC: "s8 itemId;\n\n    if (MenuHelpers_ShouldWaitForLinkRecv() == TRUE)\n        return;\n\n    itemId = Menu_ProcessInputNoWrap();\n    if (itemId == MENU_NOTHING_CHOSEN)\n    {\n        return;\n    }\n    else if (itemId == MENU_B_PRESSED)\n    {\n        PlaySE(SE_SELECT);\n        PokeblockAction_Cancel(taskId);\n    }\n    else\n    {\n        PlaySE(SE_SELECT);\n        sPokeblockMenuActions[sPokeblockMenu->pokeblockActionIds[itemId]].func.void_u8(taskId);\n    }",
  },
} as const;

export const CB2S = {
  "CB2_PokeblockMenu": {
    callsTo: ["AnimateSprites","BuildOamBuffer","DoScheduledBgTilemapCopiesToVram","RunTasks","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 5,
    bodyC: "RunTasks();\n    AnimateSprites();\n    BuildOamBuffer();\n    DoScheduledBgTilemapCopiesToVram();\n    UpdatePaletteFade();",
  },
  "CB2_InitPokeblockMenu": {
    callsTo: ["InitPokeblockMenu","MenuHelpers_IsLinkActive","MenuHelpers_ShouldWaitForLinkRecv"],
    lineCount: 9,
    bodyC: "while (1)\n    {\n        if (MenuHelpers_ShouldWaitForLinkRecv() == TRUE)\n            break;\n        if (InitPokeblockMenu() == TRUE)\n            break;\n        if (MenuHelpers_IsLinkActive() == TRUE)\n            break;\n    }",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_ShakePokeblockCase": {
    callsTo: ["FreeOamMatrix","InitSpriteAffineAnim"],
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 22,
    bodyC: "if (sprite->sState > 1)\n        sprite->sState = 0;\n\n    switch (sprite->sState)\n    {\n    case 0:\n        sprite->oam.affineMode = ST_OAM_AFFINE_NORMAL;\n        sprite->affineAnims = sAffineAnims_PokeblockCaseShake;\n        InitSpriteAffineAnim(sprite);\n        sprite->sState = 1;\n        sprite->sTimer = 0;\n        break;\n    case 1:\n        if (++sprite->sTimer > 11)\n        {\n            sprite->oam.affineMode = ST_OAM_AFFINE_OFF;\n            sprite->sState = 0;\n            sprite->sTimer = 0;\n            FreeOamMatrix(sprite->oam.matrixNum);\n            sprite->callback = SpriteCallbackDummy;\n        }\n        break;\n    }",
  },
} as const;
