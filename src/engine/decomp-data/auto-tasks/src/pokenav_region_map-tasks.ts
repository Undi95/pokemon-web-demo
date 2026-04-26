// AUTO-GENERATED from src/pokenav_region_map.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 1 Task_, 0 CB2_, 1 SpriteCB_

export const TASKS = {
  "Task_ChangeBgYForZoom": {
    callsTo: ["ChangeBgY","DestroyTask","UpdateCityZoomTextPosition"],
    dataReads: ["tZoomIn"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 18,
    bodyC: "if (gTasks[taskId].tZoomIn)\n    {\n        if (ChangeBgY(1, 0x480, BG_COORD_ADD) >= 0)\n        {\n            ChangeBgY(1, 0, BG_COORD_SET);\n            DestroyTask(taskId);\n        }\n\n        UpdateCityZoomTextPosition();\n    }\n    else\n    {\n        if (ChangeBgY(1, 0x480, BG_COORD_SUB) <= -0x6000)\n        {\n            ChangeBgY(1, -0x6000, BG_COORD_SET);\n            DestroyTask(taskId);\n        }\n\n        UpdateCityZoomTextPosition();\n    }",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_CityZoomText": {
    lineCount: 27,
    bodyC: "if (sprite->data[3])\n    {\n        sprite->data[3]--;\n        return;\n    }\n\n    if (++sprite->data[0] > 11)\n        sprite->data[0] = 0;\n\n    if (++sprite->data[1] > 60)\n        sprite->data[1] = 0;\n\n    sprite->oam.tileNum = sprite->data[2] + sprite->data[1];\n    if (sprite->data[5] < 4)\n    {\n        if (sprite->data[0] == 0)\n        {\n            sprite->data[5]++;\n            sprite->data[3] = 120;\n        }\n    }\n    else\n    {\n        if (sprite->data[1] == sprite->data[4])\n        {\n            sprite->data[5] = 0;\n            sprite->data[0] = 0;\n            sprite->data[3] = 120;\n        }\n    }",
  },
} as const;
