// AUTO-GENERATED from src/battle_anim_status_effects.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 2 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_UpdateFlashingCircleImpacts": {
    callsTo: ["BlendPalette","DestroyTask","OBJ_PLTT_ID"],
    dataReads: ["data[0]","data[1]","data[2]","data[3]","data[4]","data[5]"],
    dataWrites: ["data[2]","data[3]","data[4]","data[5]"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 28,
    bodyC: "if (gTasks[taskId].data[2] == 2)\n    {\n        gTasks[taskId].data[2] = 0;\n        BlendPalette(OBJ_PLTT_ID(gTasks[taskId].data[0]), 16, gTasks[taskId].data[4], gTasks[taskId].data[1]);\n        if (gTasks[taskId].data[5] == 0)\n        {\n            gTasks[taskId].data[4]++;\n            if (gTasks[taskId].data[4] > 8)\n                gTasks[taskId].data[5] ^= 1;\n        }\n        else\n        {\n            u16 var = gTasks[taskId].data[4];\n\n            gTasks[taskId].data[4]--;\n            if (gTasks[taskId].data[4] < 0)\n            {\n                gTasks[taskId].data[4] = var;\n                gTasks[taskId].data[5] ^= 1;\n                gTasks[taskId].data[3]++;\n                if (gTasks[taskId].data[3] == 2)\n                    DestroyTask(taskId);\n            }\n        }\n    }\n    else\n    {\n        gTasks[taskId].data[2]++;\n    }",
  },
  "Task_DoStatusAnimation": {
    callsTo: ["DestroyTask","gAnimScriptCallback"],
    dataReads: ["data[0]"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 6,
    bodyC: "gAnimScriptCallback();\n    if (!gAnimScriptActive)\n    {\n        gBattleSpritesDataPtr->healthBoxesData[gTasks[taskId].data[0]].statusAnimActive = FALSE;\n        DestroyTask(taskId);\n    }",
  },
} as const;
