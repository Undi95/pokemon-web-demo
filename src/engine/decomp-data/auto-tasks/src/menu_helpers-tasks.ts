// AUTO-GENERATED from src/menu_helpers.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 2 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_ContinueTaskAfterMessagePrints": {
    callsTo: ["RunTextPrintersRetIsActive","sMessageNextTask"],
    lineCount: 2,
    bodyC: "if (!RunTextPrintersRetIsActive(sMessageWindowId))\n        sMessageNextTask(taskId);",
  },
  "Task_CallYesOrNoCallback": {
    callsTo: ["Menu_ProcessInputNoWrapClearOnChoose","PlaySE","noFunc","yesFunc"],
    lineCount: 12,
    bodyC: "switch (Menu_ProcessInputNoWrapClearOnChoose())\n    {\n    case 0:\n        PlaySE(SE_SELECT);\n        sYesNo.yesFunc(taskId);\n        break;\n    case 1:\n    case MENU_B_PRESSED:\n        PlaySE(SE_SELECT);\n        sYesNo.noFunc(taskId);\n        break;\n    }",
  },
} as const;
