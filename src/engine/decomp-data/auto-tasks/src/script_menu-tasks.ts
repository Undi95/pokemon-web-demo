// AUTO-GENERATED from src/script_menu.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 4 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_HandleMultichoiceInput": {
    callsTo: ["ClearToTransparentAndRemoveWindow","DestroyTask","DrawLinkServicesMultichoiceMenu","JOY_NEW","Menu_ProcessInput","Menu_ProcessInputNoWrap","PlaySE","ScriptContext_Enable"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 37,
    bodyC: "s8 selection;\n    s16 *data = gTasks[taskId].data;\n\n    if (!gPaletteFade.active)\n    {\n        if (sProcessInputDelay)\n        {\n            sProcessInputDelay--;\n        }\n        else\n        {\n            if (!tDoWrap)\n                selection = Menu_ProcessInputNoWrap();\n            else\n                selection = Menu_ProcessInput();\n\n            if (JOY_NEW(DPAD_UP | DPAD_DOWN))\n            {\n                DrawLinkServicesMultichoiceMenu(tMultichoiceId);\n            }\n\n            if (selection != MENU_NOTHING_CHOSEN)\n            {\n                if (selection == MENU_B_PRESSED)\n                {\n                    if (tIgnoreBPress)\n                        return;\n                    PlaySE(SE_SELECT);\n                    gSpecialVar_Result = MULTI_B_PRESSED;\n                }\n                else\n                {\n                    gSpecialVar_Result = selection;\n                }\n                ClearToTransparentAndRemoveWindow(tWindowId);\n                DestroyTask(taskId);\n                ScriptContext_Enable();\n            }\n        }\n    }",
  },
  "Task_HandleYesNoInput": {
    callsTo: ["DestroyTask","Menu_ProcessInputNoWrapClearOnChoose","PlaySE","ScriptContext_Enable"],
    dataReads: ["tRight"],
    dataWrites: ["tRight"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 20,
    bodyC: "if (gTasks[taskId].tRight < 5)\n    {\n        gTasks[taskId].tRight++;\n        return;\n    }\n\n    switch (Menu_ProcessInputNoWrapClearOnChoose())\n    {\n    case MENU_NOTHING_CHOSEN:\n        return;\n    case MENU_B_PRESSED:\n    case 1:\n        PlaySE(SE_SELECT);\n        gSpecialVar_Result = 0;\n        break;\n    case 0:\n        gSpecialVar_Result = 1;\n        break;\n    }\n\n    DestroyTask(taskId);\n    ScriptContext_Enable();",
  },
  "Task_HandleMultichoiceGridInput": {
    callsTo: ["ClearToTransparentAndRemoveWindow","DestroyTask","Menu_ProcessGridInput","PlaySE","ScriptContext_Enable"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 19,
    bodyC: "s16 *data = gTasks[taskId].data;\n    s8 selection = Menu_ProcessGridInput();\n\n    switch (selection)\n    {\n    case MENU_NOTHING_CHOSEN:\n        return;\n    case MENU_B_PRESSED:\n        if (tIgnoreBPress)\n            return;\n        PlaySE(SE_SELECT);\n        gSpecialVar_Result = MULTI_B_PRESSED;\n        break;\n    default:\n        gSpecialVar_Result = selection;\n        break;\n    }\n\n    ClearToTransparentAndRemoveWindow(tWindowId);\n    DestroyTask(taskId);\n    ScriptContext_Enable();",
  },
  "Task_PokemonPicWindow": {
    callsTo: ["ClearToTransparentAndRemoveWindow","DestroyTask","FreeResourcesAndDestroySprite"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 17,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    switch (task->tState)\n    {\n    case 0:\n        task->tState++;\n        break;\n    case 1:\n         \n        break;\n    case 2:\n        FreeResourcesAndDestroySprite(&gSprites[task->tMonSpriteId], task->tMonSpriteId);\n        task->tState++;\n        break;\n    case 3:\n        ClearToTransparentAndRemoveWindow(task->tWindowId);\n        DestroyTask(taskId);\n        break;\n    }",
  },
} as const;
