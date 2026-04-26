// AUTO-GENERATED from src/event_object_lock.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 3 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_FreezePlayer": {
    callsTo: ["DestroyTask","IsPlayerStandingStill","PlayerFreeze"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 5,
    bodyC: "if (IsPlayerStandingStill())\n    {\n        PlayerFreeze();\n        DestroyTask(taskId);\n    }",
  },
  "Task_FreezeSelectedObjectAndPlayer": {
    callsTo: ["DestroyTask","FreezeObjectEvent","IsPlayerStandingStill","PlayerFreeze"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 13,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    if (!task->tPlayerFrozen && IsPlayerStandingStill() == TRUE)\n    {\n        PlayerFreeze();\n        task->tPlayerFrozen = TRUE;\n    }\n    if (!task->tObjectFrozen && !gObjectEvents[gSelectedObjectEvent].singleMovementActive)\n    {\n        FreezeObjectEvent(&gObjectEvents[gSelectedObjectEvent]);\n        task->tObjectFrozen = TRUE;\n    }\n    if (task->tPlayerFrozen && task->tObjectFrozen)\n        DestroyTask(taskId);",
  },
  "Task_FreezeObjectAndPlayer": {
    callsTo: ["DestroyTask","FreezeObjectEvent","IsPlayerStandingStill","PlayerFreeze"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 14,
    bodyC: "struct Task *task = &gTasks[taskId];\n    u8 objectEventId = task->tObjectId;\n\n    if (!task->tPlayerFrozen && IsPlayerStandingStill() == TRUE)\n    {\n        PlayerFreeze();\n        task->tPlayerFrozen = TRUE;\n    }\n    if (!task->tObjectFrozen && !gObjectEvents[objectEventId].singleMovementActive)\n    {\n        FreezeObjectEvent(&gObjectEvents[objectEventId]);\n        task->tObjectFrozen = TRUE;\n    }\n    if (task->tPlayerFrozen && task->tObjectFrozen)\n        DestroyTask(taskId);",
  },
} as const;
