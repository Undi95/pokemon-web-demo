// AUTO-GENERATED from src/decoration.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 8 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_ShowDecorationItemsWindow": {
    callsTo: ["AddDecorationWindow","ShowDecorationItemsWindow"],
    lineCount: 2,
    bodyC: "AddDecorationWindow(WINDOW_DECORATION_CATEGORIES);\n    ShowDecorationItemsWindow(taskId);",
  },
  "Task_PlaceDecoration": {
    callsTo: ["ConfigureCameraObjectForPlacingDecoration","ContinueDecorating","FadeInFromBlack","IsWeatherNotFadingIn","SetInitialPositions","SetUpDecorationShape","SetUpPlacingDecorationPlayerAvatar"],
    dataReads: ["tState"],
    dataWrites: ["tDecorationItemsMenuCommand","tState"],
    externalChecks: { paletteFade: true },
    lineCount: 26,
    bodyC: "switch (gTasks[taskId].tState)\n    {\n        case 0:\n            if (!gPaletteFade.active)\n            {\n                SetInitialPositions(taskId);\n                gTasks[taskId].tState = 1;\n            }\n            break;\n        case 1:\n            gPaletteFade.bufferTransferDisabled = TRUE;\n            ConfigureCameraObjectForPlacingDecoration(&sPlaceDecorationGraphicsDataBuffer, gCurDecorationItems[gCurDecorationIndex]);\n            SetUpDecorationShape(taskId);\n            SetUpPlacingDecorationPlayerAvatar(taskId, &sPlaceDecorationGraphicsDataBuffer);\n            FadeInFromBlack();\n            gPaletteFade.bufferTransferDisabled = FALSE;\n            gTasks[taskId].tState = 2;\n            break;\n        case 2:\n            if (IsWeatherNotFadingIn() == TRUE)\n            {\n                gTasks[taskId].tDecorationItemsMenuCommand = DECOR_ITEMS_MENU_PLACE;\n                ContinueDecorating(taskId);\n            }\n            break;\n    }",
  },
  "Task_InitDecorationItemsWindow": {
    callsTo: ["HideSecretBaseDecorationSprites","IsWeatherNotFadingIn","LockPlayerFieldControls","ScriptContext_SetupScript"],
    taskTransitions: ["HandleDecorationItemsMenuInput"],
    lineCount: 20,
    bodyC: "s16 *data = gTasks[taskId].data;\n    switch (tState)\n    {\n    case 0:\n        HideSecretBaseDecorationSprites();\n        tState++;\n        break;\n    case 1:\n        ScriptContext_SetupScript(SecretBase_EventScript_InitDecorations);\n        tState++;\n        break;\n    case 2:\n        LockPlayerFieldControls();\n        tState++;\n        break;\n    case 3:\n        if (IsWeatherNotFadingIn() == TRUE)\n            gTasks[taskId].func = HandleDecorationItemsMenuInput;\n        break;\n    }",
  },
  "Task_SelectLocation": {
    callsTo: ["ApplyCursorMovement_IsInvalid","IsHoldingDirection","JOY_HELD","JOY_NEW","ResetCursorMovement","noFunc","yesFunc"],
    externalChecks: { joyButtons: ["HELD:DPAD_ANY","NEW:A_BUTTON","NEW:B_BUTTON"] },
    lineCount: 56,
    bodyC: "s16 *data = gTasks[taskId].data;\n    if (!gSprites[sDecor_CameraSpriteObjectIdx1].data[4])\n    {\n        if (tButton == A_BUTTON)\n        {\n            sPlacePutAwayYesNoFunctions[tDecorationItemsMenuCommand].yesFunc(taskId);\n            return;\n        }\n\n        if (tButton == B_BUTTON)\n        {\n            sPlacePutAwayYesNoFunctions[tDecorationItemsMenuCommand].noFunc(taskId);\n            return;\n        }\n\n        if ((JOY_HELD(DPAD_ANY)) == DPAD_UP)\n        {\n            sDecorationLastDirectionMoved = DIR_SOUTH;\n            gSprites[sDecor_CameraSpriteObjectIdx1].data[2] =  0;\n            gSprites[sDecor_CameraSpriteObjectIdx1].data[3] = -2;\n            tCursorY--;\n        }\n\n        if ((JOY_HELD(DPAD_ANY)) == DPAD_DOWN)\n        {\n            sDecorationLastDirectionMoved = DIR_NORTH;\n            gSprites[sDecor_CameraSpriteObjectIdx1].data[2] =  0;\n            gSprites[sDecor_CameraSpriteObjectIdx1].data[3] =  2;\n            tCursorY++;\n        }\n\n        if ((JOY_HELD(DPAD_ANY)) == DPAD_LEFT)\n        {\n            sDecorationLastDirectionMoved = DIR_WEST;\n            gSprites[sDecor_CameraSpriteObjectIdx1].data[2] = -2;\n            gSprites[sDecor_CameraSpriteObjectIdx1].data[3] =  0;\n            tCursorX--;\n        }\n\n        if ((JOY_HELD(DPAD_ANY)) == DPAD_RIGHT)\n        {\n            sDecorationLastDirectionMoved = DIR_EAST;\n            gSprites[sDecor_CameraSpriteObjectIdx1].data[2] =  2;\n            gSprites[sDecor_CameraSpriteObjectIdx1].data[3] =  0;\n            tCursorX++;\n        }\n\n        if (!IsHoldingDirection() || !ApplyCursorMovement_IsInvalid(taskId))\n            ResetCursorMovement();\n    }\n\n    if (sDecorationLastDirectionMoved)\n    {\n        gSprites[sDecor_CameraSpriteObjectIdx1].data[4]++;\n        gSprites[sDecor_CameraSpriteObjectIdx1].data[4] &= 7;\n    }\n\n    if (!tButton)\n    {\n        if (JOY_NEW(A_BUTTON))\n            tButton = A_BUTTON;\n\n        if (JOY_NEW(B_BUTTON))\n            tButton = B_BUTTON;\n    }",
  },
  "Task_PutAwayDecoration": {
    callsTo: ["ClearDialogWindowAndFrame","ClearRearrangementNonSprites","DisplayItemMessageOnField","DrawWholeMapView","FadeInFromBlack","IdentifyOwnedDecorationsCurrentlyInUseInternal","IsWeatherNotFadingIn","LockPlayerFieldControls","ScriptContext_SetupScript","StringExpandPlaceholders","TryPutSecretBaseVisitOnAir"],
    dataReads: ["tState"],
    dataWrites: ["tState"],
    externalChecks: { paletteFade: true },
    lineCount: 31,
    bodyC: "switch (gTasks[taskId].tState)\n    {\n    case 0:\n        ClearRearrangementNonSprites();\n        gTasks[taskId].tState = 1;\n        break;\n    case 1:\n        if (!gPaletteFade.active)\n        {\n            DrawWholeMapView();\n            ScriptContext_SetupScript(SecretBase_EventScript_PutAwayDecoration);\n            ClearDialogWindowAndFrame(0, TRUE);\n            gTasks[taskId].tState = 2;\n        }\n        break;\n    case 2:\n        LockPlayerFieldControls();\n        IdentifyOwnedDecorationsCurrentlyInUseInternal(taskId);\n        FadeInFromBlack();\n        gTasks[taskId].tState = 3;\n        break;\n    case 3:\n        if (IsWeatherNotFadingIn() == TRUE)\n        {\n            StringExpandPlaceholders(gStringVar4, gText_DecorationReturnedToPC);\n            DisplayItemMessageOnField(taskId, gStringVar4, ContinuePuttingAwayDecorationsPrompt);\n            if (gMapHeader.regionMapSectionId == MAPSEC_SECRET_BASE)\n                TryPutSecretBaseVisitOnAir();\n        }\n        break;\n    }",
  },
  "Task_ContinuePuttingAwayDecorations": {
    callsTo: ["ContinuePuttingAwayDecorations","FadeInFromBlack","IsWeatherNotFadingIn","SetInitialPositions","SetUpPuttingAwayDecorationPlayerAvatar"],
    externalChecks: { paletteFade: true },
    lineCount: 26,
    bodyC: "s16 *data;\n\n    data = gTasks[taskId].data;\n    switch (tState)\n    {\n    case 0:\n        if (!gPaletteFade.active)\n        {\n            SetInitialPositions(taskId);\n            tState = 1;\n            tDecorHeight = 1;\n            tDecorWidth = 1;\n        }\n        break;\n    case 1:\n        SetUpPuttingAwayDecorationPlayerAvatar();\n        FadeInFromBlack();\n        tState = 2;\n        break;\n    case 2:\n        if (IsWeatherNotFadingIn() == TRUE)\n        {\n            tDecorationItemsMenuCommand = DECOR_ITEMS_MENU_PUT_AWAY;\n            ContinuePuttingAwayDecorations(taskId);\n        }\n        break;\n    }",
  },
  "Task_StopPuttingAwayDecorations": {
    callsTo: ["DestroyTask","FreePlayerSpritePalette","SetMainCallback2","WarpToInitialPosition"],
    cb2Transitions: ["CB2_ReturnToField"],
    dataReads: ["tState"],
    dataWrites: ["tState"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 16,
    bodyC: "switch (gTasks[taskId].tState)\n    {\n    case 0:\n        if (!gPaletteFade.active)\n        {\n            WarpToInitialPosition(taskId);\n            gTasks[taskId].tState = 1;\n        }\n        break;\n    case 1:\n        FreePlayerSpritePalette();\n        gFieldCallback = FieldCB_StopPuttingAwayDecorations;\n        SetMainCallback2(CB2_ReturnToField);\n        DestroyTask(taskId);\n        break;\n    }",
  },
  "Task_ReinitializeDecorationMenuHandler": {
    callsTo: ["HideSecretBaseDecorationSprites","IsWeatherNotFadingIn","LockPlayerFieldControls","ScriptContext_SetupScript"],
    taskTransitions: ["HandleDecorationActionsMenuInput"],
    lineCount: 20,
    bodyC: "s16 *data = gTasks[taskId].data;\n    switch (tState)\n    {\n    case 0:\n        HideSecretBaseDecorationSprites();\n        tState++;\n        break;\n    case 1:\n        ScriptContext_SetupScript(SecretBase_EventScript_InitDecorations);\n        tState++;\n        break;\n    case 2:\n        LockPlayerFieldControls();\n        tState++;\n        break;\n    case 3:\n        if (IsWeatherNotFadingIn() == TRUE)\n            gTasks[taskId].func = HandleDecorationActionsMenuInput;\n        break;\n    }",
  },
} as const;
