// AUTO-GENERATED from src/field_player_avatar.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 6 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_PushBoulder": {
    dataReads: ["tBoulderObjId","tState"],
    lineCount: 4,
    bodyC: "while (sPushBoulderFuncs[gTasks[taskId].tState](&gTasks[taskId],\n                                                     &gObjectEvents[gPlayerAvatar.objectEventId],\n                                                     &gObjectEvents[gTasks[taskId].tBoulderObjId]))\n        ;",
  },
  "Task_StopSurfingInit": {
    callsTo: ["GetJumpSpecialMovementAction","ObjectEventClearHeldMovementIfFinished","ObjectEventIsMovementOverridden","ObjectEventSetHeldMovement","SetSurfBlob_BobState"],
    taskTransitions: ["Task_WaitStopSurfing"],
    dataReads: ["data[0]"],
    lineCount: 9,
    bodyC: "struct ObjectEvent *playerObjEvent = &gObjectEvents[gPlayerAvatar.objectEventId];\n\n    if (ObjectEventIsMovementOverridden(playerObjEvent))\n    {\n        if (!ObjectEventClearHeldMovementIfFinished(playerObjEvent))\n            return;\n    }\n    SetSurfBlob_BobState(playerObjEvent->fieldEffectSpriteId, BOB_JUST_MON);\n    ObjectEventSetHeldMovement(playerObjEvent, GetJumpSpecialMovementAction((u8)gTasks[taskId].data[0]));\n    gTasks[taskId].func = Task_WaitStopSurfing;",
  },
  "Task_WaitStopSurfing": {
    callsTo: ["DestroySprite","DestroyTask","GetFaceDirectionMovementAction","GetPlayerAvatarGraphicsIdByStateId","ObjectEventClearHeldMovementIfFinished","ObjectEventSetGraphicsId","ObjectEventSetHeldMovement","UnlockPlayerFieldControls"],
    terminalMarkers: ["DestroyTask","DestroySprite"],
    lineCount: 13,
    bodyC: "struct ObjectEvent *playerObjEvent = &gObjectEvents[gPlayerAvatar.objectEventId];\n\n    if (ObjectEventClearHeldMovementIfFinished(playerObjEvent))\n    {\n        ObjectEventSetGraphicsId(playerObjEvent, GetPlayerAvatarGraphicsIdByStateId(PLAYER_AVATAR_STATE_NORMAL));\n        ObjectEventSetHeldMovement(playerObjEvent, GetFaceDirectionMovementAction(playerObjEvent->facingDirection));\n        gPlayerAvatar.preventStep = FALSE;\n        UnlockPlayerFieldControls();\n        DestroySprite(&gSprites[playerObjEvent->fieldEffectSpriteId]);\n#ifdef BUGFIX\n         \n        playerObjEvent->triggerGroundEffectsOnMove = TRUE;\n#endif\n        DestroyTask(taskId);\n    }",
  },
  "Task_Fishing": {
    dataReads: ["tStep"],
    lineCount: 2,
    bodyC: "while (sFishingStateFuncs[gTasks[taskId].tStep](&gTasks[taskId]))\n        ;",
  },
  "Task_DoPlayerSpinExit": {
    callsTo: ["CameraObjectFreeze","DestroyTask","ObjectEventClearHeldMovementIfFinished","SetSpinStartFacingDir","TrySpinPlayerForWarp"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 31,
    bodyC: "struct ObjectEvent *object = &gObjectEvents[gPlayerAvatar.objectEventId];\n    struct Sprite *sprite = &gSprites[object->spriteId];\n    s16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n        case 0:  \n            if (!ObjectEventClearHeldMovementIfFinished(object))\n                return;\n\n            SetSpinStartFacingDir(object->facingDirection);\n            tSpinDelayTimer = 0;\n            tSpeed = 1;\n            tCurY = (u16)(sprite->y + sprite->y2) << 4;\n            sprite->y2 = 0;\n            CameraObjectFreeze();\n            object->fixedPriority = TRUE;\n            sprite->oam.priority = 0;\n            sprite->subpriority = 0;\n            sprite->subspriteMode = SUBSPRITES_OFF;\n            tState++;\n        case 1:  \n            TrySpinPlayerForWarp(object, &tSpinDelayTimer);\n\n             \n            tCurY -= tSpeed;\n            tSpeed += 3;\n            sprite->y = tCurY >> 4;\n\n             \n            if (sprite->y + (s16)gTotalCameraPixelOffsetY < -32)\n                tState++;\n            break;\n        case 2:\n            DestroyTask(taskId);\n            break;\n    }",
  },
  "Task_DoPlayerSpinEntrance": {
    callsTo: ["CameraObjectFreeze","CameraObjectReset","DestroyTask","GetFaceDirectionMovementAction","GetSpinStartFacingDir","ObjectEventForceSetHeldMovement","TrySpinPlayerForWarp"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 51,
    bodyC: "struct ObjectEvent *object = &gObjectEvents[gPlayerAvatar.objectEventId];\n    struct Sprite *sprite = &gSprites[object->spriteId];\n    s16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n        case 0:\n             \n             \n             \n            tStartDir = GetSpinStartFacingDir();\n            ObjectEventForceSetHeldMovement(object, GetFaceDirectionMovementAction(sSpinDirections[tStartDir]));\n            tSpinDelayTimer = 0;\n            tSpeed = 116;\n            tDestY = sprite->y;\n            tPriority = sprite->oam.priority;\n            tSubpriority = sprite->subpriority;\n            tCurY = -((u16)sprite->y2 + 32) * 16;\n            sprite->y2 = 0;\n            CameraObjectFreeze();\n            object->fixedPriority = TRUE;\n            sprite->oam.priority = 1;\n            sprite->subpriority = 0;\n            sprite->subspriteMode = SUBSPRITES_OFF;\n            tState++;\n        case 1:  \n            TrySpinPlayerForWarp(object, &tSpinDelayTimer);\n\n             \n            tCurY += tSpeed;\n            tSpeed -= 3;\n            if (tSpeed < 4)\n                tSpeed = 4;\n            sprite->y = tCurY >> 4;\n\n             \n            if (sprite->y >= tDestY)\n            {\n                sprite->y = tDestY;\n                tGroundTimer = 0;\n                tState++;\n            }\n            break;\n        case 2:  \n            TrySpinPlayerForWarp(object, &tSpinDelayTimer);\n            if (++tGroundTimer > 8)\n                tState++;\n            break;\n        case 3:  \n            if (tStartDir == TrySpinPlayerForWarp(object, &tSpinDelayTimer))\n            {\n                object->fixedPriority = 0;\n                sprite->oam.priority = tPriority;\n                sprite->subpriority = tSubpriority;\n                CameraObjectReset();\n                DestroyTask(taskId);\n            }\n            break;\n    }",
  },
} as const;
