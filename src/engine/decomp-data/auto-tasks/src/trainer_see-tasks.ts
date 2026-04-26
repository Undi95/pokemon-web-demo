// AUTO-GENERATED from src/trainer_see.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 3 Task_, 0 CB2_, 1 SpriteCB_

export const TASKS = {
  "Task_RunTrainerSeeFuncList": {
    callsTo: ["SwitchTaskToFollowupFunc"],
    terminalMarkers: ["SwitchTaskToFollowupFunc"],
    lineCount: 10,
    bodyC: "struct Task *task = &gTasks[taskId];\n    struct ObjectEvent *trainerObj = &gObjectEvents[task->tTrainerObjectEventId];\n\n    if (!trainerObj->active)\n    {\n        SwitchTaskToFollowupFunc(taskId);\n    }\n    else\n    {\n        while (sTrainerSeeFuncList[task->tFuncId](taskId, task, trainerObj));\n    }",
  },
  "Task_SetBuriedTrainerMovement": {
    callsTo: ["ARRAY_COUNT","DestroyTask","FieldEffectActiveListContains","GetTrainerFacingDirectionMovementType","LoadWordFromTwoHalfwords","ObjectEventClearHeldMovement","SetTrainerMovementType","TryOverrideTemplateCoordsForObjectEvent"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 19,
    bodyC: "struct Task *task = &gTasks[taskId];\n    struct ObjectEvent *objEvent;\n\n    LoadWordFromTwoHalfwords((u16*) &task->tObjEvent, (u32 *)&objEvent);\n    if (!task->data[7])\n    {\n        ObjectEventClearHeldMovement(objEvent);\n        task->data[7]++;\n    }\n    sTrainerSeeFuncList2[task->tFuncId](taskId, task, objEvent);\n    if (task->tFuncId == ((int)ARRAY_COUNT(sTrainerSeeFuncList2) - 1) && !FieldEffectActiveListContains(FLDEFF_ASH_PUFF))\n    {\n        SetTrainerMovementType(objEvent, GetTrainerFacingDirectionMovementType(objEvent->facingDirection));\n        TryOverrideTemplateCoordsForObjectEvent(objEvent, GetTrainerFacingDirectionMovementType(objEvent->facingDirection));\n        DestroyTask(taskId);\n    }\n    else\n    {\n        objEvent->heldMovementFinished = 0;\n    }",
  },
  "Task_EndTrainerApproach": {
    callsTo: ["DestroyTask","ScriptContext_Enable"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 2,
    bodyC: "DestroyTask(taskId);\n    ScriptContext_Enable();",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_TrainerIcons": {
    callsTo: ["FieldEffectStop","TryGetObjectEventIdByLocalIdAndMap"],
    lineCount: 19,
    bodyC: "u8 objEventId;\n\n    if (TryGetObjectEventIdByLocalIdAndMap(sprite->sLocalId, sprite->sMapNum, sprite->sMapGroup, &objEventId)\n     || sprite->animEnded)\n    {\n        FieldEffectStop(sprite, sprite->sFldEffId);\n    }\n    else\n    {\n        struct Sprite *objEventSprite = &gSprites[gObjectEvents[objEventId].spriteId];\n        sprite->sYOffset += sprite->sYVelocity;\n        sprite->x = objEventSprite->x;\n        sprite->y = objEventSprite->y - 16;\n        sprite->x2 = objEventSprite->x2;\n        sprite->y2 = objEventSprite->y2 + sprite->sYOffset;\n        if (sprite->sYOffset)\n            sprite->sYVelocity++;\n        else\n            sprite->sYVelocity = 0;\n    }",
  },
} as const;
