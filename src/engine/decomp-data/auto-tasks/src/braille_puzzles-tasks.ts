// AUTO-GENERATED from src/braille_puzzles.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 1 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_SealedChamberShakingEffect": {
    callsTo: ["DestroyTask","InstallCameraPanAheadCallback","ScriptContext_Enable","SetCameraPanning"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 15,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    task->tDelayCounter++;\n    if (task->tDelayCounter % task->tDelay == 0)\n    {\n        task->tDelayCounter = 0;\n        task->tShakeCounter++;\n        task->tVerticalPan = -task->tVerticalPan;\n        SetCameraPanning(0, task->tVerticalPan);\n        if (task->tShakeCounter == task->tNumShakes)\n        {\n            DestroyTask(taskId);\n            ScriptContext_Enable();\n            InstallCameraPanAheadCallback();\n        }\n    }",
  },
} as const;
