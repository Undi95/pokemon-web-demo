// AUTO-GENERATED from src/field_screen_effect.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 20 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_WaitForUnionRoomFade": {
    callsTo: ["DestroyTask","WaitForWeatherFadeIn"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 2,
    bodyC: "if (WaitForWeatherFadeIn() == TRUE)\n        DestroyTask(taskId);",
  },
  "Task_WaitForFadeAndEnableScriptCtx": {
    callsTo: ["DestroyTask","ScriptContext_Enable","WaitForWeatherFadeIn"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 5,
    bodyC: "if (WaitForWeatherFadeIn() == TRUE)\n    {\n        DestroyTask(taskID);\n        ScriptContext_Enable();\n    }",
  },
  "Task_ReturnToFieldCableLink": {
    callsTo: ["CreateTask_ReestablishCableClubLink","DestroyTask","UnlockPlayerFieldControls","WaitForWeatherFadeIn","WarpFadeInScreen"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 22,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    switch (task->tState)\n    {\n    case 0:\n        task->data[1] = CreateTask_ReestablishCableClubLink();\n        task->tState++;\n        break;\n    case 1:\n        if (gTasks[task->data[1]].isActive != TRUE)\n        {\n            WarpFadeInScreen();\n            task->tState++;\n        }\n        break;\n    case 2:\n        if (WaitForWeatherFadeIn() == TRUE)\n        {\n            UnlockPlayerFieldControls();\n            DestroyTask(taskId);\n        }\n        break;\n    }",
  },
  "Task_ReturnToFieldWirelessLink": {
    callsTo: ["DestroyTask","IsLinkTaskFinished","RfuSetErrorParams","SetLinkStandbyCallback","StartSendingKeysToLink","UnlockPlayerFieldControls","WaitForWeatherFadeIn","WarpFadeInScreen"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 28,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    switch (task->tState)\n    {\n    case 0:\n        SetLinkStandbyCallback();\n        task->tState++;\n        break;\n    case 1:\n        if (!IsLinkTaskFinished())\n        {\n            if (++task->data[1] > 1800)\n                RfuSetErrorParams(F_RFU_ERROR_6 | F_RFU_ERROR_7);\n        }\n        else\n        {\n            WarpFadeInScreen();\n            task->tState++;\n        }\n        break;\n    case 2:\n        if (WaitForWeatherFadeIn() == TRUE)\n        {\n            StartSendingKeysToLink();\n            UnlockPlayerFieldControls();\n            DestroyTask(taskId);\n        }\n        break;\n    }",
  },
  "Task_ReturnToFieldRecordMixing": {
    callsTo: ["DestroyTask","IsLinkTaskFinished","ResetAllMultiplayerState","SetLinkStandbyCallback","StartSendingKeysToLink","UnlockPlayerFieldControls"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 18,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    switch (task->tState)\n    {\n    case 0:\n        SetLinkStandbyCallback();\n        task->tState++;\n        break;\n    case 1:\n        if (IsLinkTaskFinished())\n            task->tState++;\n        break;\n    case 2:\n        StartSendingKeysToLink();\n        ResetAllMultiplayerState();\n        UnlockPlayerFieldControls();\n        DestroyTask(taskId);\n        break;\n    }",
  },
  "Task_ExitDoor": {
    callsTo: ["DestroyTask","FieldAnimateDoorClose","FieldSetDoorOpened","FreezeObjectEvents","GetObjectEventIdByLocalIdAndMap","IsPlayerStandingStill","ObjectEventClearHeldMovementIfFinished","ObjectEventSetHeldMovement","PlayerGetDestCoords","SetPlayerVisibility","UnfreezeObjectEvents","UnlockPlayerFieldControls","WaitForWeatherFadeIn"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 44,
    bodyC: "struct Task *task = &gTasks[taskId];\n    s16 *x = &task->data[2];\n    s16 *y = &task->data[3];\n\n    switch (task->tState)\n    {\n    case 0:\n        SetPlayerVisibility(FALSE);\n        FreezeObjectEvents();\n        PlayerGetDestCoords(x, y);\n        FieldSetDoorOpened(*x, *y);\n        task->tState = 1;\n        break;\n    case 1:\n        if (WaitForWeatherFadeIn())\n        {\n            u8 objEventId;\n            SetPlayerVisibility(TRUE);\n            objEventId = GetObjectEventIdByLocalIdAndMap(LOCALID_PLAYER, 0, 0);\n            ObjectEventSetHeldMovement(&gObjectEvents[objEventId], MOVEMENT_ACTION_WALK_NORMAL_DOWN);\n            task->tState = 2;\n        }\n        break;\n    case 2:\n        if (IsPlayerStandingStill())\n        {\n            u8 objEventId;\n            task->data[1] = FieldAnimateDoorClose(*x, *y);\n            objEventId = GetObjectEventIdByLocalIdAndMap(LOCALID_PLAYER, 0, 0);\n            ObjectEventClearHeldMovementIfFinished(&gObjectEvents[objEventId]);\n            task->tState = 3;\n        }\n        break;\n    case 3:\n        if (task->data[1] < 0 || gTasks[task->data[1]].isActive != TRUE)\n        {\n            UnfreezeObjectEvents();\n            task->tState = 4;\n        }\n        break;\n    case 4:\n        UnlockPlayerFieldControls();\n        DestroyTask(taskId);\n        break;\n    }",
  },
  "Task_ExitNonAnimDoor": {
    callsTo: ["DestroyTask","FreezeObjectEvents","GetObjectEventIdByLocalIdAndMap","GetPlayerFacingDirection","GetWalkNormalMovementAction","IsPlayerStandingStill","ObjectEventSetHeldMovement","PlayerGetDestCoords","SetPlayerVisibility","UnfreezeObjectEvents","UnlockPlayerFieldControls","WaitForWeatherFadeIn"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 33,
    bodyC: "struct Task *task = &gTasks[taskId];\n    s16 *x = &task->data[2];\n    s16 *y = &task->data[3];\n\n    switch (task->tState)\n    {\n    case 0:\n        SetPlayerVisibility(FALSE);\n        FreezeObjectEvents();\n        PlayerGetDestCoords(x, y);\n        task->tState = 1;\n        break;\n    case 1:\n        if (WaitForWeatherFadeIn())\n        {\n            u8 objEventId;\n            SetPlayerVisibility(TRUE);\n            objEventId = GetObjectEventIdByLocalIdAndMap(LOCALID_PLAYER, 0, 0);\n            ObjectEventSetHeldMovement(&gObjectEvents[objEventId], GetWalkNormalMovementAction(GetPlayerFacingDirection()));\n            task->tState = 2;\n        }\n        break;\n    case 2:\n        if (IsPlayerStandingStill())\n        {\n            UnfreezeObjectEvents();\n            task->tState = 3;\n        }\n        break;\n    case 3:\n        UnlockPlayerFieldControls();\n        DestroyTask(taskId);\n        break;\n    }",
  },
  "Task_ExitNonDoor": {
    callsTo: ["DestroyTask","FreezeObjectEvents","LockPlayerFieldControls","UnfreezeObjectEvents","UnlockPlayerFieldControls","WaitForWeatherFadeIn"],
    dataReads: ["tState"],
    dataWrites: ["tState"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 16,
    bodyC: "switch (gTasks[taskId].tState)\n    {\n    case 0:\n        FreezeObjectEvents();\n        LockPlayerFieldControls();\n        gTasks[taskId].tState++;\n        break;\n    case 1:\n        if (WaitForWeatherFadeIn())\n        {\n            UnfreezeObjectEvents();\n            UnlockPlayerFieldControls();\n            DestroyTask(taskId);\n        }\n        break;\n    }",
  },
  "Task_WaitForFadeShowStartMenu": {
    callsTo: ["CreateTask","DestroyTask","WaitForWeatherFadeIn"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 5,
    bodyC: "if (WaitForWeatherFadeIn() == TRUE)\n    {\n        DestroyTask(taskId);\n        CreateTask(Task_ShowStartMenu, 80);\n    }",
  },
  "Task_ReturnToFieldNoScript": {
    callsTo: ["DestroyTask","ScriptUnfreezeObjectEvents","UnlockPlayerFieldControls","WaitForWeatherFadeIn"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 6,
    bodyC: "if (WaitForWeatherFadeIn() == 1)\n    {\n        UnlockPlayerFieldControls();\n        DestroyTask(taskId);\n        ScriptUnfreezeObjectEvents();\n    }",
  },
  "Task_DoCableClubWarp": {
    callsTo: ["BGMusicStopped","DestroyTask","LockPlayerFieldControls","PaletteFadeActive","SetMainCallback2","WarpIntoMap"],
    cb2Transitions: ["CB2_ReturnToFieldCableClub"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 17,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    switch (task->tState)\n    {\n    case 0:\n        LockPlayerFieldControls();\n        task->tState++;\n        break;\n    case 1:\n        if (!PaletteFadeActive() && BGMusicStopped())\n            task->tState++;\n        break;\n    case 2:\n        WarpIntoMap();\n        SetMainCallback2(CB2_ReturnToFieldCableClub);\n        DestroyTask(taskId);\n        break;\n    }",
  },
  "Task_ReturnToWorldFromLinkRoom": {
    callsTo: ["BGMusicStopped","ClearLinkCallback_2","DestroyTask","FadeScreen","PaletteFadeActive","PlaySE","SetCloseLinkCallback","SetMainCallback2","TryFadeOutOldMapMusic","WarpIntoMap"],
    cb2Transitions: ["CB2_LoadMap"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 26,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n    case 0:\n        ClearLinkCallback_2();\n        FadeScreen(FADE_TO_BLACK, 0);\n        TryFadeOutOldMapMusic();\n        PlaySE(SE_EXIT);\n        tState++;\n        break;\n    case 1:\n        if (!PaletteFadeActive() && BGMusicStopped())\n        {\n            SetCloseLinkCallback();\n            tState++;\n        }\n        break;\n    case 2:\n        if (!gReceivedRemoteLinkPlayers)\n        {\n            WarpIntoMap();\n            SetMainCallback2(CB2_LoadMap);\n            DestroyTask(taskId);\n        }\n        break;\n    }",
  },
  "Task_WarpAndLoadMap": {
    callsTo: ["BGMusicStopped","ClearMirageTowerPulseBlendEffect","DestroyTask","FreezeObjectEvents","LockPlayerFieldControls","PaletteFadeActive","SetMainCallback2","WarpIntoMap"],
    cb2Transitions: ["CB2_LoadMap"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 26,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    switch (task->tState)\n    {\n    case 0:\n        FreezeObjectEvents();\n        LockPlayerFieldControls();\n        task->tState++;\n        break;\n    case 1:\n        if (!PaletteFadeActive())\n        {\n            if (task->data[1] == 0)\n            {\n                ClearMirageTowerPulseBlendEffect();\n                task->data[1] = 1;\n            }\n            if (BGMusicStopped())\n                task->tState++;\n        }\n        break;\n    case 2:\n        WarpIntoMap();\n        SetMainCallback2(CB2_LoadMap);\n        DestroyTask(taskId);\n        break;\n    }",
  },
  "Task_DoDoorWarp": {
    callsTo: ["FieldAnimateDoorClose","FieldAnimateDoorOpen","FreezeObjectEvents","GetDoorSoundEffect","GetObjectEventIdByLocalIdAndMap","IsPlayerStandingStill","ObjectEventClearHeldMovementIfActive","ObjectEventClearHeldMovementIfFinished","ObjectEventSetHeldMovement","PlayRainStoppingSoundEffect","PlaySE","PlayerGetDestCoords","SetPlayerVisibility","TryFadeOutOldMapMusic","WarpFadeOutScreen"],
    lineCount: 48,
    bodyC: "struct Task *task = &gTasks[taskId];\n    s16 *x = &task->data[2];\n    s16 *y = &task->data[3];\n\n    switch (task->tState)\n    {\n    case 0:\n        FreezeObjectEvents();\n        PlayerGetDestCoords(x, y);\n        PlaySE(GetDoorSoundEffect(*x, *y - 1));\n        task->data[1] = FieldAnimateDoorOpen(*x, *y - 1);\n        task->tState = 1;\n        break;\n    case 1:\n        if (task->data[1] < 0 || gTasks[task->data[1]].isActive != TRUE)\n        {\n            u8 objEventId;\n            objEventId = GetObjectEventIdByLocalIdAndMap(LOCALID_PLAYER, 0, 0);\n            ObjectEventClearHeldMovementIfActive(&gObjectEvents[objEventId]);\n            objEventId = GetObjectEventIdByLocalIdAndMap(LOCALID_PLAYER, 0, 0);\n            ObjectEventSetHeldMovement(&gObjectEvents[objEventId], MOVEMENT_ACTION_WALK_NORMAL_UP);\n            task->tState = 2;\n        }\n        break;\n    case 2:\n        if (IsPlayerStandingStill())\n        {\n            u8 objEventId;\n            task->data[1] = FieldAnimateDoorClose(*x, *y - 1);\n            objEventId = GetObjectEventIdByLocalIdAndMap(LOCALID_PLAYER, 0, 0);\n            ObjectEventClearHeldMovementIfFinished(&gObjectEvents[objEventId]);\n            SetPlayerVisibility(FALSE);\n            task->tState = 3;\n        }\n        break;\n    case 3:\n        if (task->data[1] < 0 || gTasks[task->data[1]].isActive != TRUE)\n        {\n            task->tState = 4;\n        }\n        break;\n    case 4:\n        TryFadeOutOldMapMusic();\n        WarpFadeOutScreen();\n        PlayRainStoppingSoundEffect();\n        task->tState = 0;\n        task->func = Task_WarpAndLoadMap;\n        break;\n    }",
  },
  "Task_DoContestHallWarp": {
    callsTo: ["BGMusicStopped","DestroyTask","FreezeObjectEvents","LockPlayerFieldControls","PaletteFadeActive","SetMainCallback2","WarpIntoMap"],
    cb2Transitions: ["CB2_ReturnToFieldContestHall"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 20,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    switch (task->tState)\n    {\n    case 0:\n        FreezeObjectEvents();\n        LockPlayerFieldControls();\n        task->tState++;\n        break;\n    case 1:\n        if (!PaletteFadeActive() && BGMusicStopped())\n        {\n            task->tState++;\n        }\n        break;\n    case 2:\n        WarpIntoMap();\n        SetMainCallback2(CB2_ReturnToFieldContestHall);\n        DestroyTask(taskId);\n        break;\n    }",
  },
  "Task_WaitForFlashUpdate": {
    callsTo: ["DestroyTask","FuncIsActiveTask","ScriptContext_Enable"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 5,
    bodyC: "if (!FuncIsActiveTask(UpdateFlashLevelEffect))\n    {\n        ScriptContext_Enable();\n        DestroyTask(taskId);\n    }",
  },
  "Task_SpinEnterWarp": {
    callsTo: ["DestroyTask","DoPlayerSpinEntrance","FreezeObjectEvents","IsPlayerSpinEntranceActive","LockPlayerFieldControls","UnfreezeObjectEvents","UnlockPlayerFieldControls","WaitForWeatherFadeIn"],
    dataReads: ["tState"],
    dataWrites: ["tState"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 17,
    bodyC: "switch (gTasks[taskId].tState)\n    {\n    case 0:\n        FreezeObjectEvents();\n        LockPlayerFieldControls();\n        DoPlayerSpinEntrance();\n        gTasks[taskId].tState++;\n        break;\n    case 1:\n        if (WaitForWeatherFadeIn() && IsPlayerSpinEntranceActive() != TRUE)\n        {\n            UnfreezeObjectEvents();\n            UnlockPlayerFieldControls();\n            DestroyTask(taskId);\n        }\n        break;\n    }",
  },
  "Task_SpinExitWarp": {
    callsTo: ["BGMusicStopped","DestroyTask","DoPlayerSpinExit","FreezeObjectEvents","IsPlayerSpinExitActive","LockPlayerFieldControls","PaletteFadeActive","PlaySE","SetMainCallback2","WarpFadeOutScreen","WarpIntoMap"],
    cb2Transitions: ["CB2_LoadMap"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 27,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    switch (task->tState)\n    {\n    case 0:\n        FreezeObjectEvents();\n        LockPlayerFieldControls();\n        PlaySE(SE_WARP_IN);\n        DoPlayerSpinExit();\n        task->tState++;\n        break;\n    case 1:\n        if (!IsPlayerSpinExitActive())\n        {\n            WarpFadeOutScreen();\n            task->tState++;\n        }\n        break;\n    case 2:\n        if (!PaletteFadeActive() && BGMusicStopped())\n            task->tState++;\n        break;\n    case 3:\n        WarpIntoMap();\n        SetMainCallback2(CB2_LoadMap);\n        DestroyTask(taskId);\n        break;\n    }",
  },
  "Task_OrbEffect": {
    callsTo: ["BLDALPHA_BLEND","BgDmaFill","ClearGpuRegBits","CpuFastSet","DestroyTask","FuncIsActiveTask","InstallCameraPanAheadCallback","LoadOrbEffectPalette","PIXEL_FILL","ScanlineEffect_SetParams","ScheduleBgCopyTilemapToVram","ScriptContext_Enable","SetBgTilemapPalette","SetCameraPanning","SetCameraPanningCallback","SetGpuReg","SetGpuRegBits","SetOrbFlashScanlineEffectWindowBoundaries","StartUpdateOrbFlashEffect","UpdateOrbEffectBlend"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 82,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n    case 0:\n        tDispCnt = REG_DISPCNT;\n        tBldCnt = REG_BLDCNT;\n        tBldAlpha = REG_BLDALPHA;\n        tWinIn = REG_WININ;\n        tWinOut = REG_WINOUT;\n        ClearGpuRegBits(REG_OFFSET_DISPCNT, DISPCNT_WIN1_ON);\n        SetGpuRegBits(REG_OFFSET_BLDCNT, gOrbEffectBackgroundLayerFlags[0]);\n        SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(12, 7));\n        SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR);\n        SetGpuReg(REG_OFFSET_WINOUT, WINOUT_WIN01_BG1 | WINOUT_WIN01_BG2 | WINOUT_WIN01_BG3 | WINOUT_WIN01_OBJ);\n        SetBgTilemapPalette(0, 0, 0, DISPLAY_TILE_WIDTH, DISPLAY_TILE_HEIGHT, 0xF);\n        ScheduleBgCopyTilemapToVram(0);\n        SetOrbFlashScanlineEffectWindowBoundaries(&gScanlineEffectRegBuffers[0][0], tCenterX, tCenterY, 1);\n        CpuFastSet(&gScanlineEffectRegBuffers[0], &gScanlineEffectRegBuffers[1], 480);\n        ScanlineEffect_SetParams(sFlashEffectParams);\n        tState = 1;\n        break;\n    case 1:\n        BgDmaFill(0, PIXEL_FILL(1), 0, 1);\n        LoadOrbEffectPalette(tBlueOrb);\n        StartUpdateOrbFlashEffect(tCenterX, tCenterY, 1, 160, 1, 2);\n        tState = 2;\n        break;\n    case 2:\n        if (!FuncIsActiveTask(UpdateOrbFlashEffect))\n        {\n            ScriptContext_Enable();\n            tState = 3;\n        }\n        break;\n    case 3:\n        InstallCameraPanAheadCallback();\n        SetCameraPanningCallback(NULL);\n        tShakeDir = 0;\n        tShakeDelay = 4;\n        tState = 4;\n        break;\n    case 4:\n        if (--tShakeDelay == 0)\n        {\n            s32 panning;\n            tShakeDelay = 4;\n            tShakeDir ^= 1;\n            if (tShakeDir)\n                panning = 4;\n            else\n                panning = -4;\n            SetCameraPanning(0, panning);\n        }\n        break;\n    case 6:\n        InstallCameraPanAheadCallback();\n        tShakeDelay = 8;\n        tState = 7;\n        break;\n    case 7:\n        if (--tShakeDelay == 0)\n        {\n            tShakeDelay = 8;\n            tShakeDir ^= 1;\n            if (UpdateOrbEffectBlend(tShakeDir) == TRUE)\n            {\n                tState = 5;\n                BgDmaFill(0, PIXEL_FILL(0), 0, 1);\n            }\n        }\n        break;\n    case 5:\n        SetGpuReg(REG_OFFSET_WIN0H, 255);\n        SetGpuReg(REG_OFFSET_DISPCNT, tDispCnt);\n        SetGpuReg(REG_OFFSET_BLDCNT, tBldCnt);\n        SetGpuReg(REG_OFFSET_BLDALPHA, tBldAlpha);\n        SetGpuReg(REG_OFFSET_WININ, tWinIn);\n        SetGpuReg(REG_OFFSET_WINOUT, tWinOut);\n        ScriptContext_Enable();\n        DestroyTask(taskId);\n        break;\n    }",
  },
  "Task_EnableScriptAfterMusicFade": {
    callsTo: ["BGMusicStopped","DestroyTask","ScriptContext_Enable"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 5,
    bodyC: "if (BGMusicStopped() == TRUE)\n    {\n        DestroyTask(taskId);\n        ScriptContext_Enable();\n    }",
  },
} as const;
