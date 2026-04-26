// AUTO-GENERATED from src/daycare.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 1 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_HandleDaycareLevelMenuInput": {
    callsTo: ["ClearStdWindowAndFrame","DestroyListMenuTask","DestroyTask","JOY_NEW","ListMenu_ProcessInput","RemoveWindow","ScriptContext_Enable"],
    dataReads: ["tMenuListTaskId","tWindowId"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON","NEW:B_BUTTON"] },
    lineCount: 28,
    bodyC: "u32 input = ListMenu_ProcessInput(gTasks[taskId].tMenuListTaskId);\n\n    if (JOY_NEW(A_BUTTON))\n    {\n        switch (input)\n        {\n        case 0:\n        case 1:\n            gSpecialVar_Result = input;\n            break;\n        case DAYCARE_LEVEL_MENU_EXIT:\n            gSpecialVar_Result = DAYCARE_EXITED_LEVEL_MENU;\n            break;\n        }\n        DestroyListMenuTask(gTasks[taskId].tMenuListTaskId, NULL, NULL);\n        ClearStdWindowAndFrame(gTasks[taskId].tWindowId, TRUE);\n        RemoveWindow(gTasks[taskId].tWindowId);\n        DestroyTask(taskId);\n        ScriptContext_Enable();\n    }\n    else if (JOY_NEW(B_BUTTON))\n    {\n        gSpecialVar_Result = DAYCARE_EXITED_LEVEL_MENU;\n        DestroyListMenuTask(gTasks[taskId].tMenuListTaskId, NULL, NULL);\n        ClearStdWindowAndFrame(gTasks[taskId].tWindowId, TRUE);\n        RemoveWindow(gTasks[taskId].tWindowId);\n        DestroyTask(taskId);\n        ScriptContext_Enable();\n    }",
  },
} as const;
