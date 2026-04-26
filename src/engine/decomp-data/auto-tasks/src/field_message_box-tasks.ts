// AUTO-GENERATED from src/field_message_box.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 2 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_DrawFieldMessage": {
    callsTo: ["DestroyTask","DrawDialogueFrame","LoadMessageBoxAndBorderGfx","RunTextPrintersAndIsPrinter0Active"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 18,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    switch (task->tState)\n    {\n        case 0:\n            LoadMessageBoxAndBorderGfx();\n            task->tState++;\n            break;\n        case 1:\n            DrawDialogueFrame(0, TRUE);\n            task->tState++;\n            break;\n        case 2:\n            if (RunTextPrintersAndIsPrinter0Active() != TRUE)\n            {\n                sFieldMessageBoxMode = FIELD_MESSAGE_BOX_HIDDEN;\n                DestroyTask(taskId);\n            }\n    }",
  },
  "Task_HidePokenavMessageWhenDone": {
    callsTo: ["DestroyTask","IsMatchCallTaskActive"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 5,
    bodyC: "if (!IsMatchCallTaskActive())\n    {\n        sFieldMessageBoxMode = FIELD_MESSAGE_BOX_HIDDEN;\n        DestroyTask(taskId);\n    }",
  },
} as const;
