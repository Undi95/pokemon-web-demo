// AUTO-GENERATED from src/field_tasks.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 3 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_RunPerStepCallback": {
    dataReads: ["tCallbackId"],
    lineCount: 2,
    bodyC: "int idx = gTasks[taskId].tCallbackId;\n    sPerStepCallbacks[idx](taskId);",
  },
  "Task_RunTimeBasedEvents": {
    callsTo: ["ArePlayerFieldControlsLocked","RunTimeBasedEvents","UpdateAmbientCry"],
    lineCount: 6,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (!ArePlayerFieldControlsLocked())\n    {\n        RunTimeBasedEvents(data);\n        UpdateAmbientCry(&tAmbientCryState, (u16*) &tAmbientCryDelay);\n    }",
  },
  "Task_MuddySlope": {
    callsTo: ["MapGridGetMetatileBehaviorAt","MetatileBehavior_IsMuddySlope","PlayerGetDestCoords","SetMuddySlopeMetatile","tSlopeAnimTime"],
    lineCount: 58,
    bodyC: "s16 x, y, cameraOffsetX, cameraOffsetY;\n    int i;\n    u16 mapId;\n    s16 *data = gTasks[taskId].data;\n    PlayerGetDestCoords(&x, &y);\n    mapId = (gSaveBlock1Ptr->location.mapGroup << 8) | gSaveBlock1Ptr->location.mapNum;\n    switch (tState)\n    {\n    case 0:\n        tMapId = mapId;\n        tPrevX = x;\n        tPrevY = y;\n        tState = 1;\n        tSlopeAnimTime(0) = 0;\n        tSlopeAnimTime(1) = 0;\n        tSlopeAnimTime(2) = 0;\n        tSlopeAnimTime(3) = 0;\n        break;\n    case 1:\n         \n        if (tPrevX == x && tPrevY == y)\n            break;\n\n        tPrevX = x;\n        tPrevY = y;\n        if (MetatileBehavior_IsMuddySlope(MapGridGetMetatileBehaviorAt(x, y)))\n        {\n            for (i = SLOPE_DATA_START; i <= SLOPE_DATA_END; i += SLOPE_DATA_SIZE)\n            {\n                if (data[i] == 0)\n                {\n                    data[i + SLOPE_TIME] = SLOPE_ANIM_TIME;\n                    data[i + SLOPE_X] = x;\n                    data[i + SLOPE_Y] = y;\n                    break;\n                }\n            }\n        }\n        break;\n    }\n\n    if (gCamera.active && mapId != tMapId)\n    {\n        tMapId = mapId;\n        cameraOffsetX = gCamera.x;\n        cameraOffsetY = gCamera.y;\n    }\n    else\n    {\n        cameraOffsetX = 0;\n        cameraOffsetY = 0;\n    }\n\n    for (i = SLOPE_DATA_START; i <= SLOPE_DATA_END; i += SLOPE_DATA_SIZE)\n    {\n        if (data[i + SLOPE_TIME])\n        {\n            data[i + SLOPE_X] -= cameraOffsetX;\n            data[i + SLOPE_Y] -= cameraOffsetY;\n            SetMuddySlopeMetatile(&data[i + SLOPE_TIME], data[i + SLOPE_X], data[i + SLOPE_Y]);\n        }\n    }",
  },
} as const;
