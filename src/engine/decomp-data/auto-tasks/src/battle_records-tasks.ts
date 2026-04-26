// AUTO-GENERATED from src/battle_records.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 4 Task_, 1 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_TrainerHillWaitForPaletteFade": {
    taskTransitions: ["Task_CloseTrainerHillRecordsOnButton"],
    externalChecks: { paletteFade: true },
    lineCount: 2,
    bodyC: "if (!gPaletteFade.active)\n        gTasks[taskId].func = Task_CloseTrainerHillRecordsOnButton;",
  },
  "Task_CloseTrainerHillRecordsOnButton": {
    callsTo: ["JOY_NEW","PlaySE"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON","NEW:B_BUTTON"] },
    lineCount: 6,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    if (JOY_NEW(A_BUTTON) || JOY_NEW(B_BUTTON))\n    {\n        PlaySE(SE_SELECT);\n        task->func = Task_BeginPaletteFade;\n    }",
  },
  "Task_BeginPaletteFade": {
    callsTo: ["BeginNormalPaletteFade"],
    taskTransitions: ["Task_ExitTrainerHillRecords"],
    lineCount: 2,
    bodyC: "BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 0x10, RGB_BLACK);\n    gTasks[taskId].func = Task_ExitTrainerHillRecords;",
  },
  "Task_ExitTrainerHillRecords": {
    callsTo: ["DestroyTask","Free","FreeAllWindowBuffers","RemoveTrainerHillRecordsWindow","SetMainCallback2"],
    cb2Transitions: ["CB2_ReturnToFieldContinueScriptPlayMapMusic"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 8,
    bodyC: "if (!gPaletteFade.active)\n    {\n        SetMainCallback2(CB2_ReturnToFieldContinueScriptPlayMapMusic);\n        Free(sTilemapBuffer);\n        RemoveTrainerHillRecordsWindow(0);\n        FreeAllWindowBuffers();\n        DestroyTask(taskId);\n    }",
  },
} as const;

export const CB2S = {
  "CB2_ShowTrainerHillRecords": {
    callsTo: ["ARRAY_COUNT","AllocZeroed","BG_PLTT_ID","BeginNormalPaletteFade","ClearTasksAndGraphicalStructs","ClearVramOamPlttRegs","CopyBgTilemapBufferToVram","CreateTask","DeactivateAllTextPrinters","GetTextWindowPalette","InitBgsFromTemplates","InitWindows","IsDma3ManagerBusyWithBgCopy","LoadPalette","LoadTrainerHillRecordsWindowGfx","PrintOnTrainerHillRecordsWindow","ResetBgCoordinates","ResetBgsAndClearDma3BusyFlags","SetBgTilemapBuffer","SetDispcntReg","SetMainCallback2","SetVBlankCallback","ShowBg"],
    cb2Transitions: ["MainCB2_TrainerHillRecords"],
    lineCount: 51,
    bodyC: "switch (gMain.state)\n    {\n    case 0:\n        SetVBlankCallback(NULL);\n        ClearVramOamPlttRegs();\n        gMain.state++;\n        break;\n    case 1:\n        ClearTasksAndGraphicalStructs();\n        gMain.state++;\n        break;\n    case 2:\n        sTilemapBuffer = AllocZeroed(BG_SCREEN_SIZE);\n        ResetBgsAndClearDma3BusyFlags(0);\n        InitBgsFromTemplates(0, sTrainerHillRecordsBgTemplates, ARRAY_COUNT(sTrainerHillRecordsBgTemplates));\n        SetBgTilemapBuffer(3, sTilemapBuffer);\n        ResetBgCoordinates();\n        gMain.state++;\n        break;\n    case 3:\n        LoadTrainerHillRecordsWindowGfx(3);\n        LoadPalette(GetTextWindowPalette(0), BG_PLTT_ID(15), PLTT_SIZE_4BPP);\n        gMain.state++;\n        break;\n    case 4:\n        if (IsDma3ManagerBusyWithBgCopy() != TRUE)\n        {\n            ShowBg(0);\n            ShowBg(3);\n            CopyBgTilemapBufferToVram(3);\n            gMain.state++;\n        }\n        break;\n    case 5:\n        InitWindows(sTrainerHillRecordsWindowTemplates);\n        DeactivateAllTextPrinters();\n        gMain.state++;\n        break;\n    case 6:\n        BeginNormalPaletteFade(PALETTES_ALL, 0, 0x10, 0, RGB_BLACK);\n        gMain.state++;\n        break;\n    case 7:\n        SetDispcntReg();\n        SetVBlankCallback(VblankCB_TrainerHillRecords);\n        PrintOnTrainerHillRecordsWindow();\n        CreateTask(Task_TrainerHillWaitForPaletteFade, 8);\n        SetMainCallback2(MainCB2_TrainerHillRecords);\n        gMain.state = 0;\n        break;\n    }",
  },
} as const;
