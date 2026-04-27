// AUTO-GENERATED from src/link.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 3 Task_, 3 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_DestroySelf": {
    callsTo: ["DestroyTask"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 1,
    bodyC: "DestroyTask(taskId);",
  },
  "Task_TriggerHandshake": {
    callsTo: ["DestroyTask"],
    dataWrites: ["data[0]"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 5,
    bodyC: "if (++gTasks[taskId].data[0] == 5)\n    {\n        gShouldAdvanceLinkState = 1;\n        DestroyTask(taskId);\n    }",
  },
  "Task_PrintTestData": {
    callsTo: ["EXTRACT_PLAYER_COUNT","GetBlockReceivedStatus","GetMultiplayerId","GetSioMultiSI","HasLinkErrorOccurred","IsLinkConnectionEstablished","IsSioMultiMaster","LinkTest_PrintHex","LinkTest_PrintString","strcpy"],
    lineCount: 20,
    bodyC: "char testTitle[32];\n    int i;\n\n    strcpy(testTitle, sASCIITestPrint);\n    LinkTest_PrintString(testTitle, 5, 2);\n    LinkTest_PrintHex(gShouldAdvanceLinkState, 2, 1, 2);\n    LinkTest_PrintHex(gLinkStatus, 15, 1, 8);\n    LinkTest_PrintHex(gLink.state, 2, 10, 2);\n    LinkTest_PrintHex(EXTRACT_PLAYER_COUNT(gLinkStatus), 15, 10, 2);\n    LinkTest_PrintHex(GetMultiplayerId(), 15, 12, 2);\n    LinkTest_PrintHex(gLastSendQueueCount, 25, 1, 2);\n    LinkTest_PrintHex(gLastRecvQueueCount, 25, 2, 2);\n    LinkTest_PrintHex(GetBlockReceivedStatus(), 15, 5, 2);\n    LinkTest_PrintHex(gLinkDebugSeed, 2, 12, 8);\n    LinkTest_PrintHex(gLinkDebugFlags, 2, 13, 8);\n    LinkTest_PrintHex(GetSioMultiSI(), 25, 5, 1);\n    LinkTest_PrintHex(IsSioMultiMaster(), 25, 6, 1);\n    LinkTest_PrintHex(IsLinkConnectionEstablished(), 25, 7, 1);\n    LinkTest_PrintHex(HasLinkErrorOccurred(), 25, 8, 1);\n\n    for (i = 0; i < MAX_LINK_PLAYERS; i++)\n        LinkTest_PrintHex(gLinkTestBlockChecksums[i], 10, 4 + i, 4);",
  },
} as const;

export const CB2S = {
  "CB2_LinkTest": {
    callsTo: ["AnimateSprites","BuildOamBuffer","LinkTestProcessKeyInput","RunTasks","TestBlockTransfer","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 6,
    bodyC: "LinkTestProcessKeyInput();\n    TestBlockTransfer(1, 1, 0);\n    RunTasks();\n    AnimateSprites();\n    BuildOamBuffer();\n    UpdatePaletteFade();",
  },
  "CB2_LinkError": {
    callsTo: ["ARRAY_COUNT","Alloc","AnimateSprites","BG_PLTT_ID","BuildOamBuffer","ClearGpuRegBits","CreateTask","DeactivateAllTextPrinters","FreeAllSpritePalettes","InitBgsFromTemplates","InitHeap","InitWindows","LoadPalette","ResetBgsAndClearDma3BusyFlags","ResetLinkRfuGFLayer","ResetPaletteFadeControl","ResetSpriteData","ResetTasks","ResetTempTileDataBuffers","RunTasks","ScanlineEffect_Stop","SetBackdropFromColor","SetBgTilemapBuffer","SetGpuReg","SetMainCallback2","SetVBlankCallback","StopMapMusic","UpdatePaletteFade","m4aMPlayStop"],
    cb2Transitions: ["CB2_PrintErrorMessage"],
    externalChecks: { waitForVBlank: true },
    lineCount: 45,
    bodyC: "u8 *tilemapBuffer;\n\n    SetGpuReg(REG_OFFSET_DISPCNT, 0);\n    m4aMPlayStop(&gMPlayInfo_SE1);\n    m4aMPlayStop(&gMPlayInfo_SE2);\n    m4aMPlayStop(&gMPlayInfo_SE3);\n    InitHeap(gHeap, HEAP_SIZE);\n    ResetSpriteData();\n    FreeAllSpritePalettes();\n    ResetPaletteFadeControl();\n    SetBackdropFromColor(RGB_BLACK);\n    ResetTasks();\n    ScanlineEffect_Stop();\n    if (gWirelessCommType)\n    {\n        if (!sLinkErrorBuffer.disconnected)\n            gWirelessCommType = 3;\n\n        ResetLinkRfuGFLayer();\n    }\n    SetVBlankCallback(VBlankCB_LinkError);\n    ResetBgsAndClearDma3BusyFlags(0);\n    InitBgsFromTemplates(0, sLinkErrorBgTemplates, ARRAY_COUNT(sLinkErrorBgTemplates));\n    sLinkErrorBgTilemapBuffer = tilemapBuffer = Alloc(BG_SCREEN_SIZE);\n    SetBgTilemapBuffer(1, tilemapBuffer);\n    if (InitWindows(sLinkErrorWindowTemplates))\n    {\n        DeactivateAllTextPrinters();\n        ResetTempTileDataBuffers();\n        SetGpuReg(REG_OFFSET_BLDCNT, 0);\n        SetGpuReg(REG_OFFSET_BLDALPHA, 0);\n        SetGpuReg(REG_OFFSET_BG0HOFS, 0);\n        SetGpuReg(REG_OFFSET_BG0VOFS, 0);\n        SetGpuReg(REG_OFFSET_BG1HOFS, 0);\n        SetGpuReg(REG_OFFSET_BG1VOFS, 0);\n        ClearGpuRegBits(REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON | DISPCNT_WIN1_ON | DISPCNT_OBJWIN_ON);\n        LoadPalette(gStandardMenuPalette, BG_PLTT_ID(15), PLTT_SIZE_4BPP);\n        gSoftResetDisabled = FALSE;\n        CreateTask(Task_DestroySelf, 0);\n        StopMapMusic();\n        gMain.callback1 = NULL;\n        RunTasks();\n        AnimateSprites();\n        BuildOamBuffer();\n        UpdatePaletteFade();\n        SetMainCallback2(CB2_PrintErrorMessage);\n    }",
  },
  "CB2_PrintErrorMessage": {
    callsTo: ["AddTextPrinterParameterized3","DoSoftReset","ErrorMsg_CheckConnections","ErrorMsg_MoveCloserToPartner","JOY_NEW","PlaySE","ReloadSave","ShowBg","rfu_REQ_stopMode","rfu_waitREQComplete"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON"] },
    lineCount: 53,
    bodyC: "switch (gMain.state)\n    {\n        case  00:\n             \n             \n            if (sLinkErrorBuffer.disconnected)\n                ErrorMsg_MoveCloserToPartner();\n            else\n                ErrorMsg_CheckConnections();\n            break;\n        case  02:\n            ShowBg(0);\n            if (sLinkErrorBuffer.disconnected)\n                ShowBg(1);\n            break;\n        case  30:\n            PlaySE(SE_BOO);\n            break;\n        case  60:\n            PlaySE(SE_BOO);\n            break;\n        case  90:\n            PlaySE(SE_BOO);\n            break;\n        case 130:\n            if (gWirelessCommType == 2)\n                AddTextPrinterParameterized3(WIN_LINK_ERROR_TOP, FONT_SHORT_COPY_1, 2, 20, sTextColors, 0, gText_ABtnTitleScreen);\n            else if (gWirelessCommType == 1)\n                AddTextPrinterParameterized3(WIN_LINK_ERROR_TOP, FONT_SHORT_COPY_1, 2, 20, sTextColors, 0, gText_ABtnRegistrationCounter);\n            break;\n    }\n    if (gMain.state == 160)\n    {\n        if (gWirelessCommType == 1)\n        {\n            if (JOY_NEW(A_BUTTON))\n            {\n                PlaySE(SE_PIN);\n                gWirelessCommType = 0;\n                sLinkErrorBuffer.disconnected = FALSE;\n                ReloadSave();\n            }\n        }\n        else if (gWirelessCommType == 2)\n        {\n            if (JOY_NEW(A_BUTTON))\n            {\n                rfu_REQ_stopMode();\n                rfu_waitREQComplete();\n                DoSoftReset();\n            }\n        }\n    }\n\n    if (gMain.state != 160)\n        gMain.state++;",
  },
} as const;
