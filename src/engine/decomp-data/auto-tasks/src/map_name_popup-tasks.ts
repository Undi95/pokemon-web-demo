// AUTO-GENERATED from src/map_name_popup.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 1 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_MapNamePopUpWindow": {
    callsTo: ["ClearStdWindowAndFrame","GetMapNamePopUpWindowId","HideMapNamePopUpWindow","SetGpuReg","ShowMapNamePopUpWindow"],
    dataWrites: ["data[1]"],
    lineCount: 54,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    switch (task->tState)\n    {\n    case STATE_PRINT:\n         \n        if (++task->tPrintTimer > 30)\n        {\n            task->tState = STATE_SLIDE_IN;\n            task->tPrintTimer = 0;\n            ShowMapNamePopUpWindow();\n        }\n        break;\n    case STATE_SLIDE_IN:\n         \n        task->tYOffset -= POPUP_SLIDE_SPEED;\n        if (task->tYOffset <= 0 )\n        {\n            task->tYOffset = 0;\n            task->tState = STATE_WAIT;\n            gTasks[sPopupTaskId].data[1] = 0;\n        }\n        break;\n    case STATE_WAIT:\n         \n        if (++task->tOnscreenTimer > 120)\n        {\n            task->tOnscreenTimer = 0;\n            task->tState = STATE_SLIDE_OUT;\n        }\n        break;\n    case STATE_SLIDE_OUT:\n         \n        task->tYOffset += POPUP_SLIDE_SPEED;\n        if (task->tYOffset >= POPUP_OFFSCREEN_Y)\n        {\n            task->tYOffset = POPUP_OFFSCREEN_Y;\n            if (task->tIncomingPopUp)\n            {\n                 \n                 \n                task->tState = STATE_PRINT;\n                task->tPrintTimer = 0;\n                task->tIncomingPopUp = FALSE;\n            }\n            else\n            {\n                task->tState = STATE_ERASE;\n                return;\n            }\n        }\n        break;\n    case STATE_ERASE:\n        ClearStdWindowAndFrame(GetMapNamePopUpWindowId(), TRUE);\n        task->tState = STATE_END;\n        break;\n    case STATE_END:\n        HideMapNamePopUpWindow();\n        return;\n    }\n    SetGpuReg(REG_OFFSET_BG0VOFS, task->tYOffset);",
  },
} as const;
