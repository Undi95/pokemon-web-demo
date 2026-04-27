// AUTO-GENERATED from src/dodrio_berry_picking.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 7 Task_, 1 CB2_, 3 SpriteCB_

export const TASKS = {
  "Task_StartDodrioGame": {
    callsTo: ["BeginNormalPaletteFade","BlendPalettes","CreateBerrySprites","CreateCloudSprites","CreateDodrioGameTask","CreateDodrioSprite","CreateStatusBarSprites","CreateTask_","CreateWirelessStatusIndicatorSprite","DestroyTask","FuncIsActiveTask","InitGameGfx","IsGfxFuncActive","IsLinkTaskFinished","LoadBerryGfx","LoadDodrioGfx","LoadWirelessStatusIndicatorSpriteGfx","Rfu_SetLinkStandbyCallback","SetAllDodrioInvisibility","SetVBlankCallback","UpdatePaletteFade"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 64,
    bodyC: "u8 i, numPlayers;\n\n    switch (sGame->startState)\n    {\n    case 0:\n        SetVBlankCallback(NULL);\n        CreateTask_(Task_CommunicateMonInfo, 4);\n        sGame->startState++;\n        break;\n    case 1:\n        if (!FuncIsActiveTask(Task_CommunicateMonInfo))\n        {\n            InitGameGfx(&sGame->gfx);\n            sGame->startState++;\n        }\n        break;\n    case 2:\n        if (!IsGfxFuncActive())\n        {\n            Rfu_SetLinkStandbyCallback();\n            sGame->startState++;\n        }\n        break;\n    case 3:\n        if (IsLinkTaskFinished())\n        {\n            if (gReceivedRemoteLinkPlayers)\n            {\n                LoadWirelessStatusIndicatorSpriteGfx();\n                CreateWirelessStatusIndicatorSprite(0, 0);\n            }\n            sGame->startState++;\n        }\n        break;\n    case 4:\n        numPlayers = sGame->numPlayers;\n        LoadDodrioGfx();\n        for (i = 0; i < numPlayers; i++)\n            CreateDodrioSprite(&sGame->monInfo[sGame->posToPlayerId[i]], i, sGame->posToPlayerId[i], sGame->numPlayers);\n\n        SetAllDodrioInvisibility(FALSE, sGame->numPlayers);\n        sGame->startState++;\n        break;\n    case 5:\n        LoadBerryGfx();\n        CreateBerrySprites();\n        CreateCloudSprites();\n        CreateStatusBarSprites();\n        sGame->startState++;\n        break;\n    case 6:\n        BlendPalettes(PALETTES_ALL, 0x10, 0x00);\n        BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, 0);\n        SetVBlankCallback(VBlankCB_DodrioGame);\n        sGame->startState++;\n        break;\n    case 7:\n        UpdatePaletteFade();\n        if (!gPaletteFade.active)\n            sGame->startState++;\n        break;\n    default:\n        DestroyTask(taskId);\n        CreateDodrioGameTask(Task_NewGameIntro);\n        break;\n    }",
  },
  "Task_DodrioGame_Leader": {
    callsTo: ["RecvLinkData_Leader","SendLinkData_Leader","UpdateGame_Leader"],
    lineCount: 5,
    bodyC: "RecvLinkData_Leader();\n    sLeaderFuncs[sGame->funcId]();\n    if (!sExitingGame)\n        UpdateGame_Leader();\n\n    SendLinkData_Leader();",
  },
  "Task_DodrioGame_Member": {
    callsTo: ["RecvLinkData_Member","SendLinkData_Member","UpdateGame_Member"],
    lineCount: 5,
    bodyC: "RecvLinkData_Member();\n    sMemberFuncs[sGame->funcId]();\n    if (!sExitingGame)\n        UpdateGame_Member();\n\n    SendLinkData_Member();",
  },
  "Task_NewGameIntro": {
    callsTo: ["CreateDodrioGameTask","DestroyTask","DoStatusBarIntro","InitStatusBarPos","SlideTreeBordersOut"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 22,
    bodyC: "switch (sGame->state)\n    {\n    case 0:\n        if (SlideTreeBordersOut() == TRUE)\n            sGame->state++;\n        break;\n    case 1:\n        InitStatusBarPos();\n        sGame->state++;\n        break;\n    case 2:\n        if (DoStatusBarIntro() == TRUE)\n            sGame->state++;\n        break;\n    default:\n        if (sGame->isLeader)\n            CreateDodrioGameTask(Task_DodrioGame_Leader);\n        else\n            CreateDodrioGameTask(Task_DodrioGame_Member);\n\n        DestroyTask(taskId);\n        break;\n    }",
  },
  "Task_CommunicateMonInfo": {
    callsTo: ["AllLinkBlocksReceived","DestroyTask","IsLinkTaskFinished","SendBlock","SetGfxFuncById"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 32,
    bodyC: "s16 *data = gTasks[taskId].data;\n    u8 i;\n\n    switch (tState)\n    {\n    case 0:\n        if (SendBlock(0, &sGame->monInfo[sGame->multiplayerId].isShiny, sizeof(sGame->monInfo[sGame->multiplayerId].isShiny)))\n        {\n            sGame->playersReceived = 0;\n            tState++;\n        }\n        break;\n    case 1:\n        if (IsLinkTaskFinished())\n            tState++;\n        break;\n    case 2:\n        if (AllLinkBlocksReceived())\n        {\n            for (i = 0; i < sGame->numPlayers; i++)\n            {\n                *(u8 *)&sGame->monInfo[i] = *(u8 *)gBlockRecvBuffer[i];\n                sGame->playersReceived = sGame->numPlayers;\n            }\n        }\n        if (sGame->playersReceived >= sGame->numPlayers)\n        {\n            DestroyTask(taskId);\n            SetGfxFuncById(GFXFUNC_ERASE_MSG);\n            sGame->state++;\n        }\n        break;\n    }",
  },
  "Task_ShowDodrioBerryPickingRecords": {
    callsTo: ["ARRAY_COUNT","AddWindow","CopyWindowToVram","DestroyTask","GetStringWidth","IsDma3ManagerBusyWithBgCopy","JOY_NEW","PrintRecordsText","RemoveWindow","ScriptContext_Enable","rbox_fill_rectangle"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 45,
    bodyC: "struct WindowTemplate window;\n    s32 i, width, widthCurr;\n    s16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n    case 0:\n        window = sWindowTemplates_Records;\n        width = GetStringWidth(FONT_NORMAL, gText_BerryPickingRecords, 0);\n        for (i = 0; i < ARRAY_COUNT(sRecordsTexts); i++)\n        {\n            widthCurr = GetStringWidth(FONT_NORMAL, sRecordsTexts[i], 0) + 50;\n            if (widthCurr > width)\n                width = widthCurr;\n        }\n        width = (width + 7) / 8;\n        if (width & 1)\n            width++;\n        window.tilemapLeft = (30 - width) / 2;\n        window.width = width;\n        tWindowId = AddWindow(&window);\n        PrintRecordsText(tWindowId, width);\n        CopyWindowToVram(tWindowId, COPYWIN_FULL);\n        tState++;\n        break;\n    case 1:\n        if (!IsDma3ManagerBusyWithBgCopy())\n            tState++;\n        break;\n    case 2:\n        if (JOY_NEW(A_BUTTON | B_BUTTON))\n        {\n            rbox_fill_rectangle(tWindowId);\n            CopyWindowToVram(tWindowId, COPYWIN_MAP);\n            tState++;\n        }\n        break;\n    case 3:\n        if (!IsDma3ManagerBusyWithBgCopy())\n        {\n            RemoveWindow(tWindowId);\n            DestroyTask(taskId);\n            ScriptContext_Enable();\n        }\n        break;\n    }",
  },
  "Task_TryRunGfxFunc": {
    callsTo: ["GetGfxFunc"],
    lineCount: 2,
    bodyC: "if (!sGfx->finished)\n        GetGfxFunc()();",
  },
} as const;

export const CB2S = {
  "CB2_DodrioGame": {
    callsTo: ["AnimateSprites","BuildOamBuffer","RunTasks","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 4,
    bodyC: "RunTasks();\n    AnimateSprites();\n    BuildOamBuffer();\n    UpdatePaletteFade();",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_Dodrio": {
    callsTo: ["DoDodrioIntroAnim","DoDodrioMissedAnim"],
    lineCount: 11,
    bodyC: "switch (sprite->sState)\n    {\n    case 0:\n        break;\n    case 1:\n        DoDodrioMissedAnim(sprite);\n        break;\n    case 2:\n        DoDodrioIntroAnim(sprite);\n        break;\n    }",
  },
  "SpriteCB_Status": {
    lineCount: 0,
    bodyC: "",
  },
  "SpriteCB_Cloud": {
    lineCount: 13,
    bodyC: "u8 i;\n    static const u8 moveDelays[] = {30, 20};\n\n    if (sprite->sFrozen != TRUE)\n    {\n        for (i = 0; i < NUM_CLOUDS; i++)\n        {\n            if (++sCloudSpriteIds[i][1] > moveDelays[i])\n            {\n                sprite->x--;\n                sCloudSpriteIds[i][1] = 0;\n            }\n        }\n    }",
  },
} as const;
