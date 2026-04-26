// AUTO-GENERATED from src/trader.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 1 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_HandleGetDecorationMenuInput": {
    callsTo: ["ConvertInternationalString","Menu_ProcessInput","PlaySE","StringCopy","Task_BufferDecorSelectionAndCloseWindow"],
    lineCount: 19,
    bodyC: "struct MauvilleOldManTrader *trader = &gSaveBlock1Ptr->oldMan.trader;\n    s8 input = Menu_ProcessInput();\n\n    switch (input)\n    {\n        case MENU_NOTHING_CHOSEN:\n            break;\n        case MENU_B_PRESSED:\n        case NUM_TRADER_ITEMS:  \n            PlaySE(SE_SELECT);\n            Task_BufferDecorSelectionAndCloseWindow(taskId, 0);\n            break;\n        default:\n            PlaySE(SE_SELECT);\n            gSpecialVar_0x8005 = input;\n            StringCopy(gStringVar1, trader->playerNames[input]);\n            ConvertInternationalString(gStringVar1, trader->language[input]);\n            Task_BufferDecorSelectionAndCloseWindow(taskId, trader->decorations[input]);\n            break;\n    }",
  },
} as const;
