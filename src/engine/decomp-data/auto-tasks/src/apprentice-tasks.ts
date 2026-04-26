// AUTO-GENERATED from src/apprentice.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 3 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_ChooseAnswer": {
    callsTo: ["DestroyTask","Menu_ProcessInput","Menu_ProcessInputNoWrap","PlaySE","RemoveAndHideWindow","ScriptContext_Enable"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 23,
    bodyC: "s8 input;\n    s16 *data = gTasks[taskId].data;\n\n    if (!tWrapAround)\n        input = Menu_ProcessInputNoWrap();\n    else\n        input = Menu_ProcessInput();\n\n    switch (input)\n    {\n    case MENU_NOTHING_CHOSEN:\n        return;\n    case MENU_B_PRESSED:\n         \n        if (tNoBButton)\n            return;\n\n        PlaySE(SE_SELECT);\n        gSpecialVar_Result = MULTI_B_PRESSED;\n        break;\n    default:\n        gSpecialVar_Result = input;\n        break;\n    }\n\n    RemoveAndHideWindow(tWindowId);\n    DestroyTask(taskId);\n    ScriptContext_Enable();",
  },
  "Task_WaitForPrintingMessage": {
    callsTo: ["DestroyTask","ExecuteFuncAfterButtonPress","RunTextPrintersAndIsPrinter0Active","ScriptContext_Enable"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 8,
    bodyC: "if (!RunTextPrintersAndIsPrinter0Active())\n    {\n        DestroyTask(taskId);\n        if (gSpecialVar_0x8005)\n            ExecuteFuncAfterButtonPress(ScriptContext_Enable);\n        else\n            ScriptContext_Enable();\n    }",
  },
  "Task_ExecuteFuncAfterButtonPress": {
    callsTo: ["DestroyTask","JOY_NEW","gApprenticeFunc"],
    dataReads: ["data[0]","data[1]"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON","NEW:B_BUTTON"] },
    lineCount: 6,
    bodyC: "if (JOY_NEW(A_BUTTON) || JOY_NEW(B_BUTTON))\n    {\n        gApprenticeFunc = (void *)(u32)(((u16)gTasks[taskId].data[0] | (gTasks[taskId].data[1] << 16)));\n        gApprenticeFunc();\n        DestroyTask(taskId);\n    }",
  },
} as const;
