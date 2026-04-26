// AUTO-GENERATED from src/battle_controller_wally.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 1 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_StartSendOutAnim": {
    callsTo: ["DestroyTask","StartSendOutAnim"],
    dataReads: ["data[0]","data[1]"],
    dataWrites: ["data[1]"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 14,
    bodyC: "if (gTasks[taskId].data[1] < 31)\n    {\n        gTasks[taskId].data[1]++;\n    }\n    else\n    {\n        u8 savedActiveBank = gActiveBattler;\n\n        gActiveBattler = gTasks[taskId].data[0];\n        gBattleBufferA[gActiveBattler][1] = gBattlerPartyIndexes[gActiveBattler];\n        StartSendOutAnim(gActiveBattler);\n        gBattlerControllerFuncs[gActiveBattler] = Intro_TryShinyAnimShowHealthbox;\n        gActiveBattler = savedActiveBank;\n        DestroyTask(taskId);\n    }",
  },
} as const;
