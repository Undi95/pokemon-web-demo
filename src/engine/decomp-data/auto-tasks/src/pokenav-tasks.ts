// AUTO-GENERATED from src/pokenav.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 3 Task_, 3 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_RunLoopedTask": {
    callsTo: ["DestroyTask","GetWordTaskArg","LOOPED_TASK_DECODE_STATE","loopedTask"],
    dataReads: ["data[0]"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 26,
    bodyC: "LoopedTask loopedTask = (LoopedTask)GetWordTaskArg(taskId, 1);\n    s16 *state = &gTasks[taskId].data[0];\n    bool32 exitLoop = FALSE;\n\n    while (!exitLoop)\n    {\n        u32 action = loopedTask(*state);\n        switch (action)\n        {\n        case LT_INC_AND_CONTINUE:\n            (*state)++;\n            break;\n        case LT_INC_AND_PAUSE:\n            (*state)++;\n            return;\n        case LT_FINISH:\n            DestroyTask(taskId);\n            return;\n         \n        default:\n            *state = LOOPED_TASK_DECODE_STATE(action);\n            break;\n        case LT_CONTINUE:\n            break;\n        case LT_PAUSE:\n            return;\n        }\n    }",
  },
  "Task_RunLoopedTask_LinkMode": {
    callsTo: ["DestroyTask","GetWordTaskArg","LOOPED_TASK_DECODE_STATE","Overworld_IsRecvQueueAtMax","task"],
    dataReads: ["data[0]"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 24,
    bodyC: "LoopedTask task;\n    s16 *state;\n    u32 action;\n\n    if (Overworld_IsRecvQueueAtMax())\n        return;\n\n    task = (LoopedTask)GetWordTaskArg(taskId, 1);\n    state = &gTasks[taskId].data[0];\n    action = task(*state);\n    switch (action)\n    {\n    case LT_INC_AND_PAUSE:\n    case LT_INC_AND_CONTINUE:\n        (*state)++;\n        break;\n    case LT_FINISH:\n        DestroyTask(taskId);\n        break;\n     \n    default:\n        *state = LOOPED_TASK_DECODE_STATE(action);\n        break;\n    case LT_PAUSE:\n    case LT_CONTINUE:\n        break;\n    }",
  },
  "Task_Pokenav": {
    callsTo: ["FreeMenuHandlerSubstruct1","FreePokenavResources","GetCurrentMenuCB","InitPokenavMainMenu","IsActiveMenuLoopTaskActive","IsActiveMenuLoopTaskActive_","PokenavMainMenuLoopedTaskIsActive","RunMainMenuLoopedTask","SetActivePokenavMenu","SetMainCallback2","ShutdownPokenav","WaitForPokenavShutdownFade","free1","free2"],
    cb2Transitions: ["CB2_ReturnToFieldContinueScriptPlayMapMusic","CB2_ReturnToFieldWithOpenMenu"],
    lineCount: 63,
    bodyC: "u32 menuId;\n    s16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n    case 0:\n        InitPokenavMainMenu();\n        tState = 1;\n        break;\n    case 1:\n         \n        if (PokenavMainMenuLoopedTaskIsActive())\n            break;\n        SetActivePokenavMenu(POKENAV_MAIN_MENU);\n        tState = 4;\n        break;\n    case 2:\n        if (IsActiveMenuLoopTaskActive())\n            break;\n        tState = 3;\n    case 3:\n        menuId = GetCurrentMenuCB();\n        if (menuId == POKENAV_MENU_FUNC_EXIT)\n        {\n            ShutdownPokenav();\n            tState = 5;\n        }\n        else if (menuId >= POKENAV_MENU_IDS_START)\n        {\n            PokenavMenuCallbacks[gPokenavResources->currentMenuIndex].free2();\n            PokenavMenuCallbacks[gPokenavResources->currentMenuIndex].free1();\n            if (SetActivePokenavMenu(menuId))\n            {\n                tState = 4;\n            }\n            else\n            {\n                ShutdownPokenav();\n                tState = 5;\n            }\n        }\n        else if (menuId != 0)\n        {\n            RunMainMenuLoopedTask(menuId);\n            if (IsActiveMenuLoopTaskActive())\n                tState = 2;\n        }\n        break;\n    case 4:\n        if (!IsActiveMenuLoopTaskActive_())\n            tState = 3;\n        break;\n    case 5:\n        if (!WaitForPokenavShutdownFade())\n        {\n            bool32 calledFromScript = (gPokenavResources->mode != POKENAV_MODE_NORMAL);\n\n            FreeMenuHandlerSubstruct1();\n            FreePokenavResources();\n            if (calledFromScript)\n                SetMainCallback2(CB2_ReturnToFieldContinueScriptPlayMapMusic);\n            else\n                SetMainCallback2(CB2_ReturnToFieldWithOpenMenu);\n        }\n        break;\n    }",
  },
} as const;

export const CB2S = {
  "CB2_InitPokeNav": {
    callsTo: ["Alloc","CreateTask","InitPokenavResources","ResetTasks","SetMainCallback2","SetVBlankCallback"],
    cb2Transitions: ["CB2_Pokenav","CB2_ReturnToFieldWithOpenMenu"],
    lineCount: 14,
    bodyC: "gPokenavResources = Alloc(sizeof(*gPokenavResources));\n    if (gPokenavResources == NULL)\n    {\n        SetMainCallback2(CB2_ReturnToFieldWithOpenMenu);\n    }\n    else\n    {\n        InitPokenavResources(gPokenavResources);\n        ResetTasks();\n        SetVBlankCallback(NULL);\n        CreateTask(Task_Pokenav, 0);\n        SetMainCallback2(CB2_Pokenav);\n        SetVBlankCallback(VBlankCB_Pokenav);\n    }",
  },
  "CB2_InitPokenavForTutorial": {
    callsTo: ["Alloc","CreateTask","FreeAllSpritePalettes","InitPokenavResources","ResetSpriteData","ResetTasks","SetMainCallback2","SetVBlankCallback","UpdatePaletteFade"],
    cb2Transitions: ["CB2_Pokenav","CB2_ReturnToFieldContinueScriptPlayMapMusic"],
    externalChecks: { paletteFade: true },
    lineCount: 20,
    bodyC: "UpdatePaletteFade();\n    if (gPaletteFade.active)\n        return;\n\n    gPokenavResources = Alloc(sizeof(*gPokenavResources));\n    if (gPokenavResources == NULL)\n    {\n        SetMainCallback2(CB2_ReturnToFieldContinueScriptPlayMapMusic);\n    }\n    else\n    {\n        InitPokenavResources(gPokenavResources);\n        gPokenavResources->mode = POKENAV_MODE_FORCE_CALL_READY;\n        ResetTasks();\n        ResetSpriteData();\n        FreeAllSpritePalettes();\n        SetVBlankCallback(NULL);\n        CreateTask(Task_Pokenav, 0);\n        SetMainCallback2(CB2_Pokenav);\n        SetVBlankCallback(VBlankCB_Pokenav);\n    }",
  },
  "CB2_Pokenav": {
    callsTo: ["AnimateSprites","BuildOamBuffer","RunTasks","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 4,
    bodyC: "RunTasks();\n    AnimateSprites();\n    BuildOamBuffer();\n    UpdatePaletteFade();",
  },
} as const;
