// AUTO-GENERATED from src/palette.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 1 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_BlendPalettesGradually": {
    callsTo: ["BlendPalettes","DestroyTask","GetWordTaskArg"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 29,
    bodyC: "u32 palettes;\n    s16 *data;\n    s16 target;\n\n    data = gTasks[taskId].data;\n    palettes = GetWordTaskArg(taskId, tPalettes);\n\n    if (++tDelayTimer > tDelay)\n    {\n        tDelayTimer = 0;\n        BlendPalettes(palettes, tCoeff, tColor);\n        target = tCoeffTarget;\n        if (tCoeff == target)\n        {\n            DestroyTask(taskId);\n        }\n        else\n        {\n            tCoeff += tCoeffDelta;\n            if (tCoeffDelta >= 0)\n            {\n                if (tCoeff < target)\n                    return;\n            }\n            else if (tCoeff > target)\n            {\n                return;\n            }\n            tCoeff = target;\n        }\n    }",
  },
} as const;
