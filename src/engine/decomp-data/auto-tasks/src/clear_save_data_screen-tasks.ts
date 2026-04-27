// AUTO-GENERATED from src/clear_save_data_screen.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 3 Task_, 2 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_DoClearSaveDataScreenYesNo": {
    callsTo: ["AddTextPrinterParameterized","CreateYesNoMenu","DrawStdFrameWithCustomTileAndPalette"],
    taskTransitions: ["Task_ClearSaveDataScreenYesNoChoice"],
    lineCount: 4,
    bodyC: "DrawStdFrameWithCustomTileAndPalette(0, FALSE, 2, 14);\n    AddTextPrinterParameterized(0, FONT_NORMAL, gText_ClearAllSaveData, 0, 1, 0, 0);\n    CreateYesNoMenu(sClearSaveYesNo, 2, 14, 1);\n    gTasks[taskId].func = Task_ClearSaveDataScreenYesNoChoice;",
  },
  "Task_ClearSaveDataScreenYesNoChoice": {
    callsTo: ["AddTextPrinterParameterized","DestroyTask","FillWindowPixelBuffer","Menu_ProcessInputNoWrapClearOnChoose","PIXEL_FILL","PlaySE","SetMainCallback2"],
    taskTransitions: ["Task_ClearSaveData"],
    cb2Transitions: ["CB2_FadeAndDoReset"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 13,
    bodyC: "switch (Menu_ProcessInputNoWrapClearOnChoose())\n    {\n    case 0:\n        FillWindowPixelBuffer(0, PIXEL_FILL(1));\n        AddTextPrinterParameterized(0, FONT_NORMAL, gText_ClearingData, 0, 1, 0, 0);\n        gTasks[taskId].func = Task_ClearSaveData;\n        break;\n    case 1:\n    case MENU_B_PRESSED:\n        PlaySE(SE_SELECT);\n        DestroyTask(taskId);\n        SetMainCallback2(CB2_FadeAndDoReset);\n    }",
  },
  "Task_ClearSaveData": {
    callsTo: ["ClearSaveData","DestroyTask","SetMainCallback2"],
    cb2Transitions: ["CB2_FadeAndDoReset"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 3,
    bodyC: "ClearSaveData();\n    DestroyTask(taskId);\n    SetMainCallback2(CB2_FadeAndDoReset);",
  },
} as const;

export const CB2S = {
  "CB2_InitClearSaveDataScreen": {
    callsTo: ["CreateTask","SetupClearSaveDataScreen"],
    lineCount: 2,
    bodyC: "if (SetupClearSaveDataScreen())\n        CreateTask(Task_DoClearSaveDataScreenYesNo, 0);",
  },
  "CB2_FadeAndDoReset": {
    callsTo: ["BeginNormalPaletteFade","DoSoftReset","FreeAllWindowBuffers","UpdatePaletteFade"],
    externalChecks: { paletteFade: true },
    lineCount: 16,
    bodyC: "switch(gMain.state)\n    {\n    case 0:\n    default:\n        BeginNormalPaletteFade(PALETTES_BG, 0, 0, 0x10, RGB_WHITEALPHA);\n        gMain.state = 1;\n        break;\n    case 1:\n        UpdatePaletteFade();\n        if(!gPaletteFade.active)\n        {\n            FreeAllWindowBuffers();\n            DoSoftReset();\n        }\n        break;\n    }",
  },
} as const;
