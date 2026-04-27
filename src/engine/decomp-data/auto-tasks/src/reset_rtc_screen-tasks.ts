// AUTO-GENERATED from src/reset_rtc_screen.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 6 Task_, 2 CB2_, 2 SpriteCB_

export const TASKS = {
  "Task_ResetRtc_SetFinished": {
    dataWrites: ["tFinished"],
    lineCount: 1,
    bodyC: "gTasks[taskId].tFinished = TRUE;",
  },
  "Task_ResetRtc_Exit": {
    callsTo: ["FreeCursorPalette","HideChooseTimeWindow"],
    taskTransitions: ["Task_ResetRtc_SetFinished"],
    lineCount: 4,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    HideChooseTimeWindow(tWindowId);\n    FreeCursorPalette();\n    gTasks[taskId].func = Task_ResetRtc_SetFinished;",
  },
  "Task_ResetRtc_HandleInput": {
    callsTo: ["CopyWindowToVram","JOY_NEW","JOY_REPEAT","MoveTimeUpDown","PlaySE","PrintTime"],
    taskTransitions: ["Task_ResetRtc_Exit"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON","NEW:B_BUTTON","NEW:DPAD_LEFT","NEW:DPAD_RIGHT"] },
    lineCount: 49,
    bodyC: "s16 *data = gTasks[taskId].data;\n    u8 selection = tSelection;\n    const struct ResetRtcInputMap *selectionInfo = &sInputMap[selection - 1];\n\n    if (JOY_NEW(B_BUTTON))\n    {\n        gTasks[taskId].func = Task_ResetRtc_Exit;\n        tSetTime = FALSE;\n        tSelection = SELECTION_NONE;\n        PlaySE(SE_SELECT);\n        return;\n    }\n\n    if (JOY_NEW(DPAD_RIGHT))\n    {\n        if (selectionInfo->right)\n        {\n            tSelection = selectionInfo->right;\n            PlaySE(SE_SELECT);\n            return;\n        }\n    }\n\n    if (JOY_NEW(DPAD_LEFT))\n    {\n        if (selectionInfo->left)\n        {\n            tSelection = selectionInfo->left;\n            PlaySE(SE_SELECT);\n            return;\n        }\n    }\n\n    if (selection == SELECTION_CONFIRM)\n    {\n        if (JOY_NEW(A_BUTTON))\n        {\n            gLocalTime.days = tDays;\n            gLocalTime.hours = tHours;\n            gLocalTime.minutes = tMinutes;\n            gLocalTime.seconds = tSeconds;\n            PlaySE(SE_SELECT);\n            gTasks[taskId].func = Task_ResetRtc_Exit;\n            tSetTime = TRUE;\n            tSelection = SELECTION_NONE;\n        }\n    }\n    else if (MoveTimeUpDown(&data[selectionInfo->dataIndex], selectionInfo->minVal, selectionInfo->maxVal, JOY_REPEAT(DPAD_UP | DPAD_DOWN)))\n    {\n        PlaySE(SE_SELECT);\n        PrintTime(tWindowId, 0, 1, tDays, tHours, tMinutes, tSeconds);\n        CopyWindowToVram(tWindowId, COPYWIN_GFX);\n    }",
  },
  "Task_ResetRtc_Init": {
    callsTo: ["AddWindow","CreateCursor","ShowChooseTimeWindow"],
    taskTransitions: ["Task_ResetRtc_HandleInput"],
    lineCount: 11,
    bodyC: "s16 *data = gTasks[taskId].data;\n    tFinished = FALSE;\n    tDays = gLocalTime.days;\n    tHours = gLocalTime.hours;\n    tMinutes = gLocalTime.minutes;\n    tSeconds = gLocalTime.seconds;\n    tWindowId = AddWindow(&sInputTimeWindow);\n    ShowChooseTimeWindow(tWindowId, tDays, tHours, tMinutes, tSeconds);\n    CreateCursor(taskId);\n    tSelection = SELECTION_HOURS;\n    gTasks[taskId].func = Task_ResetRtc_HandleInput;",
  },
  "Task_ShowResetRtcPrompt": {
    callsTo: ["AddTextPrinterParameterized","CopyWindowToVram","DestroyTask","DoSoftReset","DrawStdFrameWithCustomTileAndPalette","JOY_NEW","PlaySE","PrintTime","ScheduleBgCopyTilemapToVram","ShowMessage"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON","NEW:B_BUTTON"] },
    lineCount: 40,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n    case 0:\n        DrawStdFrameWithCustomTileAndPalette(WIN_TIME, FALSE, 0x214, 0xE);\n\n        AddTextPrinterParameterized(WIN_TIME, FONT_NORMAL, gText_PresentTime, 0, 1, TEXT_SKIP_DRAW, 0);\n        PrintTime(\n            WIN_TIME,\n            0,\n            17,\n            gLocalTime.days,\n            gLocalTime.hours,\n            gLocalTime.minutes,\n            gLocalTime.seconds);\n\n        AddTextPrinterParameterized(WIN_TIME, FONT_NORMAL, gText_PreviousTime, 0, 33, TEXT_SKIP_DRAW, 0);\n        PrintTime(\n            WIN_TIME,\n            0,\n            49,\n            gSaveBlock2Ptr->lastBerryTreeUpdate.days,\n            gSaveBlock2Ptr->lastBerryTreeUpdate.hours,\n            gSaveBlock2Ptr->lastBerryTreeUpdate.minutes,\n            gSaveBlock2Ptr->lastBerryTreeUpdate.seconds);\n\n        ShowMessage(gText_ResetRTCConfirmCancel);\n        CopyWindowToVram(WIN_TIME, COPYWIN_GFX);\n        ScheduleBgCopyTilemapToVram(0);\n        tState++;\n    case 1:\n        if (JOY_NEW(B_BUTTON))\n        {\n             \n            DestroyTask(taskId);\n            DoSoftReset();\n        }\n        else if (JOY_NEW(A_BUTTON))\n        {\n             \n            PlaySE(SE_SELECT);\n            DestroyTask(taskId);\n        }\n        break;\n    }",
  },
  "Task_ResetRtcScreen": {
    callsTo: ["BeginNormalPaletteFade","ClearStdWindowAndFrameToTransparent","CreateTask","DestroyTask","DisableResetRTC","DoSoftReset","FreeAllWindowBuffers","JOY_NEW","PlaySE","RtcCalcLocalTime","RtcCalcLocalTimeOffset","RtcReset","ShowMessage","TrySavingData","VarSet"],
    dataReads: ["tFinished","tSetTime"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true, joyButtons: ["NEW:A_BUTTON"] },
    lineCount: 89,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n    case MAINSTATE_FADE_IN:\n        BeginNormalPaletteFade(PALETTES_ALL, 1, 0x10, 0, RGB_WHITEALPHA);\n        tState = MAINSTATE_CHECK_SAVE;\n        break;\n    case MAINSTATE_CHECK_SAVE:\n        if (!gPaletteFade.active)\n        {\n            if (gSaveFileStatus == SAVE_STATUS_EMPTY\n             || gSaveFileStatus == SAVE_STATUS_CORRUPT)\n            {\n                ShowMessage(gText_NoSaveFileCantSetTime);\n                tState = MAINSTATE_WAIT_EXIT;\n            }\n            else\n            {\n                RtcCalcLocalTime();\n                tSubTaskId = CreateTask(Task_ShowResetRtcPrompt, 80);\n                tState = MAINSTATE_START_SET_TIME;\n            }\n        }\n        break;\n    case MAINSTATE_START_SET_TIME:\n         \n        if (gTasks[tSubTaskId].isActive != TRUE)\n        {\n            ClearStdWindowAndFrameToTransparent(WIN_TIME, FALSE);\n            ShowMessage(gText_PleaseResetTime);\n            gLocalTime = gSaveBlock2Ptr->lastBerryTreeUpdate;\n            tSubTaskId = CreateTask(Task_ResetRtc_Init, 80);\n            tState = MAINSTATE_WAIT_SET_TIME;\n        }\n        break;\n    case MAINSTATE_WAIT_SET_TIME:\n        if (gTasks[tSubTaskId].tFinished)\n        {\n            if (!gTasks[tSubTaskId].tSetTime)\n            {\n                 \n                DestroyTask(tSubTaskId);\n                tState = MAINSTATE_START_SET_TIME;\n            }\n            else\n            {\n                 \n                DestroyTask(tSubTaskId);\n                RtcReset();\n                RtcCalcLocalTimeOffset(\n                    gLocalTime.days,\n                    gLocalTime.hours,\n                    gLocalTime.minutes,\n                    gLocalTime.seconds);\n                gSaveBlock2Ptr->lastBerryTreeUpdate = gLocalTime;\n                VarSet(VAR_DAYS, gLocalTime.days);\n                DisableResetRTC();\n                ShowMessage(gText_ClockHasBeenReset);\n                tState = MAINSTATE_SAVE;\n            }\n        }\n        break;\n    case MAINSTATE_SAVE:\n        if (TrySavingData(SAVE_NORMAL) == SAVE_STATUS_OK)\n        {\n            ShowMessage(gText_SaveCompleted);\n            PlaySE(SE_DING_DONG);\n        }\n        else\n        {\n            ShowMessage(gText_SaveFailed);\n            PlaySE(SE_BOO);\n        }\n        tState = MAINSTATE_WAIT_EXIT;\n         \n    case MAINSTATE_WAIT_EXIT:\n        if (JOY_NEW(A_BUTTON))\n        {\n            BeginNormalPaletteFade(PALETTES_ALL, 1, 0, 0x10, RGB_WHITEALPHA);\n            tState = MAINSTATE_EXIT;\n             \n        }\n        else\n        {\n            break;\n        }\n    case MAINSTATE_EXIT:\n        if (!gPaletteFade.active)\n        {\n            DestroyTask(taskId);\n            FreeAllWindowBuffers();\n            DoSoftReset();\n        }\n    }",
  },
} as const;

export const CB2S = {
  "CB2_InitResetRtcScreen": {
    callsTo: ["CreateTask","DmaClear16","DmaFillLarge16","InitResetRtcScreenBgAndWindows","LoadOam","ResetOamRange","ResetPaletteFade","ResetSpriteData","ResetTasks","ScanlineEffect_Clear","ScanlineEffect_Stop","SetGpuReg","SetMainCallback2","SetVBlankCallback"],
    cb2Transitions: ["CB2_ResetRtcScreen"],
    lineCount: 15,
    bodyC: "SetGpuReg(REG_OFFSET_DISPCNT, 0);\n    SetVBlankCallback(NULL);\n    DmaClear16(3, PLTT, PLTT_SIZE);\n    DmaFillLarge16(3, 0, (u8 *)VRAM, VRAM_SIZE, 0x1000);\n    ResetOamRange(0, 128);\n    LoadOam();\n    ScanlineEffect_Stop();\n    ScanlineEffect_Clear();\n    ResetSpriteData();\n    ResetTasks();\n    ResetPaletteFade();\n    InitResetRtcScreenBgAndWindows();\n    SetVBlankCallback(VBlankCB);\n    SetMainCallback2(CB2_ResetRtcScreen);\n    CreateTask(Task_ResetRtcScreen, 80);",
  },
  "CB2_ResetRtcScreen": {
    callsTo: ["AnimateSprites","BuildOamBuffer","DoScheduledBgTilemapCopiesToVram","RunTasks","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 5,
    bodyC: "RunTasks();\n    AnimateSprites();\n    BuildOamBuffer();\n    DoScheduledBgTilemapCopiesToVram();\n    UpdatePaletteFade();",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_Cursor_UpOrRight": {
    callsTo: ["DestroySprite"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 46,
    bodyC: "int state = gTasks[sprite->sTaskId].tSelection;\n    if (state != sprite->sState)\n    {\n        sprite->sState = state;\n        switch (state)\n        {\n        case SELECTION_DAYS:\n            sprite->invisible = FALSE;\n            sprite->animNum = ARROW_UP;\n            sprite->animDelayCounter = 0;\n            sprite->x = 56;  \n            sprite->y = 68;\n            break;\n        case SELECTION_HOURS:\n            sprite->invisible = FALSE;\n            sprite->animNum = ARROW_UP;\n            sprite->animDelayCounter = 0;\n            sprite->x = 92;  \n            sprite->y = 68;\n            break;\n        case SELECTION_MINS:\n            sprite->invisible = FALSE;\n            sprite->animNum = ARROW_UP;\n            sprite->animDelayCounter = 0;\n            sprite->x = 107;  \n            sprite->y = 68;\n            break;\n        case SELECTION_SECS:\n            sprite->invisible = FALSE;\n            sprite->animNum = ARROW_UP;\n            sprite->animDelayCounter = 0;\n            sprite->x = 122;  \n            sprite->y = 68;\n            break;\n        case SELECTION_CONFIRM:\n            sprite->invisible = FALSE;\n            sprite->animNum = ARROW_RIGHT;\n            sprite->animDelayCounter = 0;\n            sprite->x = 153;\n            sprite->y = 80;\n            break;\n        case SELECTION_NONE:\n            DestroySprite(sprite);\n            break;\n        }\n    }",
  },
  "SpriteCB_Cursor_Down": {
    callsTo: ["DestroySprite"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 42,
    bodyC: "int state = gTasks[sprite->sTaskId].tSelection;\n    if (state != sprite->sState)\n    {\n        sprite->sState = state;\n        switch (state)\n        {\n        case SELECTION_DAYS:\n            sprite->invisible = FALSE;\n            sprite->animNum = ARROW_DOWN;\n            sprite->animDelayCounter = 0;\n            sprite->x = 56;  \n            sprite->y = 92;\n            break;\n        case SELECTION_HOURS:\n            sprite->invisible = FALSE;\n            sprite->animNum = ARROW_DOWN;\n            sprite->animDelayCounter = 0;\n            sprite->x = 92;  \n            sprite->y = 92;\n            break;\n        case SELECTION_MINS:\n            sprite->invisible = FALSE;\n            sprite->animNum = ARROW_DOWN;\n            sprite->animDelayCounter = 0;\n            sprite->x = 107;  \n            sprite->y = 92;\n            break;\n        case SELECTION_SECS:\n            sprite->invisible = FALSE;\n            sprite->animNum = ARROW_DOWN;\n            sprite->animDelayCounter = 0;\n            sprite->x = 122;  \n            sprite->y = 92;\n            break;\n        case SELECTION_CONFIRM:\n             \n             \n            sprite->invisible = TRUE;\n            break;\n        case SELECTION_NONE:\n            DestroySprite(sprite);\n            break;\n        }\n    }",
  },
} as const;
