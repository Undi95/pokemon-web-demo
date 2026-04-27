// AUTO-GENERATED from src/wireless_communication_status_screen.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 1 Task_, 3 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_WirelessCommunicationScreen": {
    callsTo: ["BeginNormalPaletteFade","ConvertIntToDecimalStringN","CopyBgTilemapBufferToVram","CopyWindowToVram","CyclePalette","DestroyTask","FillWindowPixelBuffer","JOY_NEW","PIXEL_FILL","PlaySE","PrintHeaderTexts","PutWindowTilemap","SetMainCallback2","ShowBg","UpdateCommunicationCounts","WCSS_AddTextPrinterParameterized"],
    cb2Transitions: ["CB2_ExitWirelessCommunicationStatusScreen"],
    dataReads: ["data[7]","data[8]","tState"],
    dataWrites: ["data[15]","tState"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true, joyButtons: ["NEW:A_BUTTON","NEW:B_BUTTON"] },
    lineCount: 53,
    bodyC: "s32 i;\n    switch (gTasks[taskId].tState)\n    {\n    case 0:\n        PrintHeaderTexts();\n        gTasks[taskId].tState++;\n        break;\n    case 1:\n        BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK);\n        ShowBg(1);\n        CopyBgTilemapBufferToVram(0);\n        ShowBg(0);\n        gTasks[taskId].tState++;\n        break;\n    case 2:\n        if (!gPaletteFade.active)\n            gTasks[taskId].tState++;\n        break;\n    case 3:\n        if (UpdateCommunicationCounts(sStatusScreen->groupCounts, sStatusScreen->prevGroupCounts, sStatusScreen->activities, sStatusScreen->rfuTaskId))\n        {\n            FillWindowPixelBuffer(WIN_GROUP_COUNTS, PIXEL_FILL(0));\n            for (i = 0; i < NUM_GROUPTYPES; i++)\n            {\n                ConvertIntToDecimalStringN(gStringVar4, sStatusScreen->groupCounts[i], STR_CONV_MODE_RIGHT_ALIGN, 2);\n                if (i != GROUPTYPE_TOTAL)\n                    WCSS_AddTextPrinterParameterized(WIN_GROUP_COUNTS, FONT_NORMAL, gStringVar4, 12, 30 * i + 8, COLORMODE_WHITE_LGRAY);\n                else\n                    WCSS_AddTextPrinterParameterized(WIN_GROUP_COUNTS, FONT_NORMAL, gStringVar4, 12, 98, COLORMODE_RED);\n            }\n            PutWindowTilemap(WIN_GROUP_COUNTS);\n            CopyWindowToVram(WIN_GROUP_COUNTS, COPYWIN_FULL);\n        }\n        if (JOY_NEW(A_BUTTON) || JOY_NEW(B_BUTTON))\n        {\n            PlaySE(SE_SELECT);\n            gTasks[sStatusScreen->rfuTaskId].data[15] = 0xFF;\n            gTasks[taskId].tState++;\n        }\n        CyclePalette(&gTasks[taskId].data[7], &gTasks[taskId].data[8]);\n        break;\n    case 4:\n        BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);\n        gTasks[taskId].tState++;\n        break;\n    case 5:\n        if (!gPaletteFade.active)\n        {\n            SetMainCallback2(CB2_ExitWirelessCommunicationStatusScreen);\n            DestroyTask(taskId);\n        }\n        break;\n    }",
  },
} as const;

export const CB2S = {
  "CB2_RunWirelessCommunicationScreen": {
    callsTo: ["AnimateSprites","BuildOamBuffer","IsDma3ManagerBusyWithBgCopy","RunTasks","RunTextPrinters","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 8,
    bodyC: "if (!IsDma3ManagerBusyWithBgCopy())\n    {\n        RunTasks();\n        RunTextPrinters();\n        AnimateSprites();\n        BuildOamBuffer();\n        UpdatePaletteFade();\n    }",
  },
  "CB2_InitWirelessCommunicationScreen": {
    callsTo: ["ARRAY_COUNT","Alloc","AllocZeroed","AnimateSprites","BG_PLTT_ID","BuildOamBuffer","ChangeBgX","ChangeBgY","CopyBgTilemapBufferToVram","CopyToBgTilemapBuffer","CreateTask","CreateTask_ListenToWireless","DeactivateAllTextPrinters","DecompressAndLoadBgGfxUsingHeap","DynamicPlaceholderTextUtil_Reset","FillBgTilemapBufferRect","InitBgsFromTemplates","InitWindows","LoadPalette","Menu_LoadStdPalAt","ResetBgsAndClearDma3BusyFlags","ResetPaletteFade","ResetSpriteData","ResetTasks","RunTasks","RunTextPrinters","ScanlineEffect_Stop","SetBgTilemapBuffer","SetGpuReg","SetMainCallback2","SetVBlankCallback","UpdatePaletteFade","m4aSoundVSyncOn"],
    cb2Transitions: ["CB2_RunWirelessCommunicationScreen"],
    externalChecks: { waitForVBlank: true },
    lineCount: 35,
    bodyC: "SetGpuReg(REG_OFFSET_DISPCNT, 0);\n    sStatusScreen = AllocZeroed(sizeof(struct WirelessCommunicationStatusScreen));\n    SetVBlankCallback(NULL);\n    ResetBgsAndClearDma3BusyFlags(0);\n    InitBgsFromTemplates(0, sBgTemplates, ARRAY_COUNT(sBgTemplates));\n    SetBgTilemapBuffer(1, Alloc(BG_SCREEN_SIZE));\n    SetBgTilemapBuffer(0, Alloc(BG_SCREEN_SIZE));\n    DecompressAndLoadBgGfxUsingHeap(1, sBgTiles_Gfx, 0, 0, 0);\n    CopyToBgTilemapBuffer(1, sBgTiles_Tilemap, 0, 0);\n    InitWindows(sWindowTemplates);\n    DeactivateAllTextPrinters();\n    ResetPaletteFade();\n    ResetSpriteData();\n    ResetTasks();\n    ScanlineEffect_Stop();\n    m4aSoundVSyncOn();\n    SetVBlankCallback(VBlankCB_WirelessCommunicationScreen);\n    sStatusScreen->taskId = CreateTask(Task_WirelessCommunicationScreen, 0);\n    sStatusScreen->rfuTaskId = CreateTask_ListenToWireless();\n    sStatusScreen->prevGroupCounts[GROUPTYPE_TOTAL] = 1;\n    ChangeBgX(0, 0, BG_COORD_SET);\n    ChangeBgY(0, 0, BG_COORD_SET);\n    ChangeBgX(1, 0, BG_COORD_SET);\n    ChangeBgY(1, 0, BG_COORD_SET);\n    LoadPalette(sPalettes, BG_PLTT_ID(0), PLTT_SIZE_4BPP);\n    Menu_LoadStdPalAt(BG_PLTT_ID(15));\n    DynamicPlaceholderTextUtil_Reset();\n    FillBgTilemapBufferRect(0, 0, 0, 0, 32, 32, 15);\n    CopyBgTilemapBufferToVram(1);\n    SetMainCallback2(CB2_RunWirelessCommunicationScreen);\n    RunTasks();\n    RunTextPrinters();\n    AnimateSprites();\n    BuildOamBuffer();\n    UpdatePaletteFade();",
  },
  "CB2_ExitWirelessCommunicationStatusScreen": {
    callsTo: ["ARRAY_COUNT","Free","FreeAllWindowBuffers","GetBgTilemapBuffer","SetMainCallback2"],
    cb2Transitions: ["CB2_ReturnToFieldContinueScriptPlayMapMusic"],
    lineCount: 8,
    bodyC: "s32 i;\n    FreeAllWindowBuffers();\n    for (i = 0; i < (int)ARRAY_COUNT(sBgTemplates); i++)\n    {\n        Free(GetBgTilemapBuffer(i));\n    }\n    Free(sStatusScreen);\n    SetMainCallback2(CB2_ReturnToFieldContinueScriptPlayMapMusic);",
  },
} as const;
