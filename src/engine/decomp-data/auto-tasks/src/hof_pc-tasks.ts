// AUTO-GENERATED from src/hof_pc.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 1 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_WaitForPaletteFade": {
    callsTo: ["DestroyTask"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 2,
    bodyC: "if (!gPaletteFade.active)\n        DestroyTask(taskId);",
  },
} as const;
