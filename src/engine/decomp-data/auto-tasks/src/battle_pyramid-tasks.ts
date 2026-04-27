// AUTO-GENERATED from src/battle_pyramid.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 1 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_SetPyramidFloorPalette": {
    callsTo: ["BG_PLTT_ID","CpuCopy16","DestroyTask"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 5,
    bodyC: "if (gPaletteFade.active)\n    {\n        CpuCopy16(gBattlePyramidFloor_Pal[gSaveBlock2Ptr->frontier.curChallengeBattleNum], &gPlttBufferUnfaded[BG_PLTT_ID(6)], PLTT_SIZE_4BPP);\n        DestroyTask(taskId);\n    }",
  },
} as const;
