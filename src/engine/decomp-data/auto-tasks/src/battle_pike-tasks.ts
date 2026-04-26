// AUTO-GENERATED from src/battle_pike.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 1 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_DoStatusInflictionScreenFlash": {
    callsTo: ["DestroyTask","IsStatusInflictionScreenFlashTaskFinished","ScriptContext_Enable","StartStatusInflictionScreenFlash"],
    dataReads: ["data[0]"],
    dataWrites: ["data[0]"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 13,
    bodyC: "if (gTasks[taskId].data[0] == 0)\n    {\n        gTasks[taskId].data[0]++;\n        StartStatusInflictionScreenFlash(0, 0, 3, 2, 2);\n    }\n    else\n    {\n        if (IsStatusInflictionScreenFlashTaskFinished())\n        {\n            ScriptContext_Enable();\n            DestroyTask(taskId);\n        }\n    }",
  },
} as const;
