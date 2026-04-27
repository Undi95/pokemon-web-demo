// AUTO-GENERATED from src/field_door.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 1 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_AnimateDoor": {
    callsTo: ["AnimateDoorFrame","DestroyTask"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 5,
    bodyC: "u16 *data = (u16*) gTasks[taskId].data;\n    struct DoorAnimFrame *frames = (struct DoorAnimFrame *)(tFramesHi << 16 | tFramesLo);\n    struct DoorGraphics *gfx = (struct DoorGraphics *)(tGfxHi << 16 | tGfxLo);\n\n    if (AnimateDoorFrame(gfx, frames, data) == FALSE)\n        DestroyTask(taskId);",
  },
} as const;
