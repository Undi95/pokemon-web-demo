// AUTO-GENERATED from src/fldeff_escalator.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 1 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_DrawEscalator": {
    callsTo: ["DrawWholeMapView","SetEscalatorMetatile"],
    lineCount: 33,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    tDrawingEscalator = TRUE;\n\n     \n    switch (tState)\n    {\n        case 0:\n            SetEscalatorMetatile(taskId, sEscalatorMetatiles_1F_0, 0);\n            break;\n        case 1:\n            SetEscalatorMetatile(taskId, sEscalatorMetatiles_1F_1, 0);\n            break;\n        case 2:\n            SetEscalatorMetatile(taskId, sEscalatorMetatiles_1F_2, MAPGRID_IMPASSABLE);\n            break;\n        case 3:\n            SetEscalatorMetatile(taskId, sEscalatorMetatiles_1F_3, 0);\n            break;\n        case 4:\n            SetEscalatorMetatile(taskId, sEscalatorMetatiles_2F_0, MAPGRID_IMPASSABLE);\n            break;\n        case 5:\n            SetEscalatorMetatile(taskId, sEscalatorMetatiles_2F_1, 0);\n            break;\n        case 6:\n            SetEscalatorMetatile(taskId, sEscalatorMetatiles_2F_2, 0);\n            break;\n    }\n\n    tState = (tState + 1) & 7;\n\n     \n    if (tState == 0)\n    {\n        DrawWholeMapView();\n        tTransitionStage = (tTransitionStage + 1) % ESCALATOR_STAGES;\n        tDrawingEscalator = FALSE;\n    }",
  },
} as const;
