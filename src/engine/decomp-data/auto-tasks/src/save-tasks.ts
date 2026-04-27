// AUTO-GENERATED from src/save.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 1 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_LinkFullSave": {
    callsTo: ["ClearContinueGameWarpStatus2","DestroyTask","IsLinkTaskFinished","LinkFullSave_Init","LinkFullSave_ReplaceLastSector","LinkFullSave_SetLastSectorSignature","LinkFullSave_WriteSector","SaveMapView","SetContinueGameWarpStatusToDynamicWarp","SetLinkStandbyCallback"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 71,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n    case 0:\n        gSoftResetDisabled = TRUE;\n        tState = 1;\n        break;\n    case 1:\n        SetLinkStandbyCallback();\n        tState = 2;\n        break;\n    case 2:\n        if (IsLinkTaskFinished())\n        {\n            if (!tInBattleTower)\n                SaveMapView();\n            tState = 3;\n        }\n        break;\n    case 3:\n        if (!tInBattleTower)\n            SetContinueGameWarpStatusToDynamicWarp();\n        LinkFullSave_Init();\n        tState = 4;\n        break;\n    case 4:\n        if (++tTimer == 5)\n        {\n            tTimer = 0;\n            tState = 5;\n        }\n        break;\n    case 5:\n        if (LinkFullSave_WriteSector())\n            tState = 6;\n        else\n            tState = 4;  \n        break;\n    case 6:\n        LinkFullSave_ReplaceLastSector();\n        tState = 7;\n        break;\n    case 7:\n        if (!tInBattleTower)\n            ClearContinueGameWarpStatus2();\n        SetLinkStandbyCallback();\n        tState = 8;\n        break;\n    case 8:\n        if (IsLinkTaskFinished())\n        {\n            LinkFullSave_SetLastSectorSignature();\n            tState = 9;\n        }\n        break;\n    case 9:\n        SetLinkStandbyCallback();\n        tState = 10;\n        break;\n    case 10:\n        if (IsLinkTaskFinished())\n            tState++;\n        break;\n    case 11:\n        if (++tTimer > 5)\n        {\n            gSoftResetDisabled = FALSE;\n            DestroyTask(taskId);\n        }\n        break;\n    }",
  },
} as const;
