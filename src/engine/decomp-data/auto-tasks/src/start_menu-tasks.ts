// AUTO-GENERATED from src/start_menu.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 3 Task_, 2 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_ShowStartMenu": {
    callsTo: ["DestroyTask","InUnionRoom","SetUsingUnionRoomStartMenu","gMenuCallback"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 14,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    switch(task->data[0])\n    {\n    case 0:\n        if (InUnionRoom() == TRUE)\n            SetUsingUnionRoomStartMenu();\n\n        gMenuCallback = HandleStartMenuInput;\n        task->data[0]++;\n        break;\n    case 1:\n        if (gMenuCallback() == TRUE)\n            DestroyTask(taskId);\n        break;\n    }",
  },
  "Task_SaveAfterLinkBattle": {
    callsTo: ["AddTextPrinterParameterized2","BeginNormalPaletteFade","ClearContinueGameWarpStatus2","CopyWindowToVram","CreateTask","DestroyTask","DrawTextBorderOuter","FillWindowPixelBuffer","FreeAllWindowBuffers","FuncIsActiveTask","InUnionRoom","Link_AnyPartnersPlayingFRLG_JP","PIXEL_FILL","PutWindowTilemap","SetContinueGameWarpStatusToDynamicWarp","SetMainCallback2","WriteSaveBlock1Sector","WriteSaveBlock2"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 70,
    bodyC: "s16 *state = gTasks[taskId].data;\n\n    if (!gPaletteFade.active)\n    {\n        switch (*state)\n        {\n        case 0:\n            FillWindowPixelBuffer(0, PIXEL_FILL(1));\n            AddTextPrinterParameterized2(0,\n                                        FONT_NORMAL,\n                                        gText_SavingDontTurnOffPower,\n                                        TEXT_SKIP_DRAW,\n                                        NULL,\n                                        TEXT_COLOR_DARK_GRAY,\n                                        TEXT_COLOR_WHITE,\n                                        TEXT_COLOR_LIGHT_GRAY);\n            DrawTextBorderOuter(0, 8, 14);\n            PutWindowTilemap(0);\n            CopyWindowToVram(0, COPYWIN_FULL);\n            BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK);\n\n            if (gWirelessCommType != 0 && InUnionRoom())\n            {\n                if (Link_AnyPartnersPlayingFRLG_JP())\n                {\n                    *state = 1;\n                }\n                else\n                {\n                    *state = 5;\n                }\n            }\n            else\n            {\n                gSoftResetDisabled = TRUE;\n                *state = 1;\n            }\n            break;\n        case 1:\n            SetContinueGameWarpStatusToDynamicWarp();\n            WriteSaveBlock2();\n            *state = 2;\n            break;\n        case 2:\n            if (WriteSaveBlock1Sector())\n            {\n                ClearContinueGameWarpStatus2();\n                *state = 3;\n                gSoftResetDisabled = FALSE;\n            }\n            break;\n        case 3:\n            BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);\n            *state = 4;\n            break;\n        case 4:\n            FreeAllWindowBuffers();\n            SetMainCallback2(gMain.savedCallback);\n            DestroyTask(taskId);\n            break;\n        case 5:\n            CreateTask(Task_LinkFullSave, 5);\n            *state = 6;\n            break;\n        case 6:\n            if (!FuncIsActiveTask(Task_LinkFullSave))\n            {\n                *state = 3;\n            }\n            break;\n        }\n    }",
  },
  "Task_WaitForBattleTowerLinkSave": {
    callsTo: ["DestroyTask","FuncIsActiveTask","ScriptContext_Enable"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 5,
    bodyC: "if (!FuncIsActiveTask(Task_LinkFullSave))\n    {\n        DestroyTask(taskId);\n        ScriptContext_Enable();\n    }",
  },
} as const;

export const CB2S = {
  "CB2_SetUpSaveAfterLinkBattle": {
    callsTo: ["CreateTask","InitSaveWindowAfterLinkBattle","SetMainCallback2"],
    cb2Transitions: ["CB2_SaveAfterLinkBattle"],
    lineCount: 5,
    bodyC: "if (InitSaveWindowAfterLinkBattle(&gMain.state))\n    {\n        CreateTask(Task_SaveAfterLinkBattle, 0x50);\n        SetMainCallback2(CB2_SaveAfterLinkBattle);\n    }",
  },
  "CB2_SaveAfterLinkBattle": {
    callsTo: ["RunTasks","UpdatePaletteFade"],
    lineCount: 2,
    bodyC: "RunTasks();\n    UpdatePaletteFade();",
  },
} as const;
