// AUTO-GENERATED from src/fldeff_rocksmash.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 4 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_DoFieldMove_Init": {
    callsTo: ["FieldEffectStart","LockPlayerFieldControls","ObjectEventClearHeldMovementIfFinished","ObjectEventIsMovementOverridden","ObjectEventSetHeldMovement","SetPlayerAvatarFieldMove"],
    taskTransitions: ["Task_DoFieldMove_ShowMonAfterPose","Task_DoFieldMove_WaitForMon"],
    lineCount: 19,
    bodyC: "u8 objEventId;\n\n    LockPlayerFieldControls();\n    gPlayerAvatar.preventStep = TRUE;\n    objEventId = gPlayerAvatar.objectEventId;\n    if (!ObjectEventIsMovementOverridden(&gObjectEvents[objEventId])\n     || ObjectEventClearHeldMovementIfFinished(&gObjectEvents[objEventId]))\n    {\n        if (gMapHeader.mapType == MAP_TYPE_UNDERWATER)\n        {\n             \n            FieldEffectStart(FLDEFF_FIELD_MOVE_SHOW_MON_INIT);\n            gTasks[taskId].func = Task_DoFieldMove_WaitForMon;\n        }\n        else\n        {\n             \n            SetPlayerAvatarFieldMove();\n            ObjectEventSetHeldMovement(&gObjectEvents[objEventId], MOVEMENT_ACTION_START_ANIM_IN_DIRECTION);\n            gTasks[taskId].func = Task_DoFieldMove_ShowMonAfterPose;\n        }\n    }",
  },
  "Task_DoFieldMove_ShowMonAfterPose": {
    callsTo: ["FieldEffectStart","ObjectEventCheckHeldMovementStatus"],
    taskTransitions: ["Task_DoFieldMove_WaitForMon"],
    lineCount: 5,
    bodyC: "if (ObjectEventCheckHeldMovementStatus(&gObjectEvents[gPlayerAvatar.objectEventId]) == TRUE)\n    {\n        FieldEffectStart(FLDEFF_FIELD_MOVE_SHOW_MON_INIT);\n        gTasks[taskId].func = Task_DoFieldMove_WaitForMon;\n    }",
  },
  "Task_DoFieldMove_WaitForMon": {
    callsTo: ["FieldEffectActiveListContains","FieldEffectActiveListRemove","GetPlayerAvatarGraphicsIdByCurrentState","GetPlayerFacingDirection","ObjectEventSetGraphicsId","StartSpriteAnim"],
    taskTransitions: ["Task_DoFieldMove_RunFunc"],
    lineCount: 16,
    bodyC: "if (!FieldEffectActiveListContains(FLDEFF_FIELD_MOVE_SHOW_MON))\n    {\n        gFieldEffectArguments[1] = GetPlayerFacingDirection();\n        if (gFieldEffectArguments[1] == DIR_SOUTH)\n            gFieldEffectArguments[2] = 0;\n        if (gFieldEffectArguments[1] == DIR_NORTH)\n            gFieldEffectArguments[2] = 1;\n        if (gFieldEffectArguments[1] == DIR_WEST)\n            gFieldEffectArguments[2] = 2;\n        if (gFieldEffectArguments[1] == DIR_EAST)\n            gFieldEffectArguments[2] = 3;\n        ObjectEventSetGraphicsId(&gObjectEvents[gPlayerAvatar.objectEventId], GetPlayerAvatarGraphicsIdByCurrentState());\n        StartSpriteAnim(&gSprites[gPlayerAvatar.spriteId], gFieldEffectArguments[2]);\n        FieldEffectActiveListRemove(FLDEFF_FIELD_MOVE_SHOW_MON);\n        gTasks[taskId].func = Task_DoFieldMove_RunFunc;\n    }",
  },
  "Task_DoFieldMove_RunFunc": {
    callsTo: ["DestroyTask","fieldMoveFunc"],
    dataReads: ["data[8]","data[9]"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 4,
    bodyC: "void (*fieldMoveFunc)(void) = (void (*)(void))(((u16)gTasks[taskId].data[8] << 16) | (u16)gTasks[taskId].data[9]);\n\n    fieldMoveFunc();\n    gPlayerAvatar.preventStep = FALSE;\n    DestroyTask(taskId);",
  },
} as const;
