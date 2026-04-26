// AUTO-GENERATED from src/time_events.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 1 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_WaitWeather": {
    callsTo: ["DestroyTask","IsWeatherChangeComplete","ScriptContext_Enable"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 5,
    bodyC: "if (IsWeatherChangeComplete())\n    {\n        ScriptContext_Enable();\n        DestroyTask(taskId);\n    }",
  },
} as const;
