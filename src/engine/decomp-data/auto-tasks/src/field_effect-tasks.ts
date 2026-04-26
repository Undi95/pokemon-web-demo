// AUTO-GENERATED from src/field_effect.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 24 Task_, 0 CB2_, 14 SpriteCB_

export const TASKS = {
  "Task_PokecenterHeal": {
    lineCount: 3,
    bodyC: "struct Task *task;\n    task = &gTasks[taskId];\n    sPokecenterHealEffectFuncs[task->tState](task);",
  },
  "Task_HallOfFameRecord": {
    lineCount: 3,
    bodyC: "struct Task *task;\n    task = &gTasks[taskId];\n    sHallOfFameRecordEffectFuncs[task->tState](task);",
  },
  "Task_UseFly": {
    callsTo: ["DestroyTask","FieldEffectActiveListContains","FieldEffectStart","GetCursorSelectionMonId","IsWeatherNotFadingIn","Overworld_ResetStateAfterFly","SetMainCallback2","WarpIntoMap"],
    cb2Transitions: ["CB2_LoadMap"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 20,
    bodyC: "struct Task *task;\n    task = &gTasks[taskId];\n    if (!task->data[0])\n    {\n        if (!IsWeatherNotFadingIn())\n            return;\n\n        gFieldEffectArguments[0] = GetCursorSelectionMonId();\n        if ((int)gFieldEffectArguments[0] > PARTY_SIZE - 1)\n            gFieldEffectArguments[0] = 0;\n\n        FieldEffectStart(FLDEFF_USE_FLY);\n        task->data[0]++;\n    }\n    if (!FieldEffectActiveListContains(FLDEFF_USE_FLY))\n    {\n        Overworld_ResetStateAfterFly();\n        WarpIntoMap();\n        SetMainCallback2(CB2_LoadMap);\n        gFieldCallback = FieldCallback_FlyIntoMap;\n        DestroyTask(taskId);\n    }",
  },
  "Task_FlyIntoMap": {
    callsTo: ["DestroyTask","FieldEffectActiveListContains","FieldEffectStart","UnfreezeObjectEvents","UnlockPlayerFieldControls"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 17,
    bodyC: "struct Task *task;\n    task = &gTasks[taskId];\n    if (task->data[0] == 0)\n    {\n        if (gPaletteFade.active)\n        {\n            return;\n        }\n        FieldEffectStart(FLDEFF_FLY_IN);\n        task->data[0]++;\n    }\n    if (!FieldEffectActiveListContains(FLDEFF_FLY_IN))\n    {\n        UnlockPlayerFieldControls();\n        UnfreezeObjectEvents();\n        DestroyTask(taskId);\n    }",
  },
  "Task_FallWarpFieldEffect": {
    lineCount: 3,
    bodyC: "struct Task *task;\n    task = &gTasks[taskId];\n    while (sFallWarpFieldEffectFuncs[task->tState](task));",
  },
  "Task_EscalatorWarpOut": {
    lineCount: 3,
    bodyC: "struct Task *task;\n    task = &gTasks[taskId];\n    while (sEscalatorWarpOutFieldEffectFuncs[task->tState](task));",
  },
  "Task_EscalatorWarpIn": {
    lineCount: 3,
    bodyC: "struct Task *task;\n    task = &gTasks[taskId];\n    while (sEscalatorWarpInFieldEffectFuncs[task->tState](task));",
  },
  "Task_UseWaterfall": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sWaterfallFieldEffectFuncs[gTasks[taskId].tState](&gTasks[taskId], &gObjectEvents[gPlayerAvatar.objectEventId]));",
  },
  "Task_UseDive": {
    dataReads: ["data[0]"],
    lineCount: 1,
    bodyC: "while (sDiveFieldEffectFuncs[gTasks[taskId].data[0]](&gTasks[taskId]));",
  },
  "Task_LavaridgeGymB1FWarp": {
    dataReads: ["data[0]"],
    lineCount: 1,
    bodyC: "while (sLavaridgeGymB1FWarpEffectFuncs[gTasks[taskId].data[0]](&gTasks[taskId], &gObjectEvents[gPlayerAvatar.objectEventId], &gSprites[gPlayerAvatar.spriteId]));",
  },
  "Task_LavaridgeGymB1FWarpExit": {
    dataReads: ["data[0]"],
    lineCount: 1,
    bodyC: "while (sLavaridgeGymB1FWarpExitEffectFuncs[gTasks[taskId].data[0]](&gTasks[taskId], &gObjectEvents[gPlayerAvatar.objectEventId], &gSprites[gPlayerAvatar.spriteId]));",
  },
  "Task_LavaridgeGym1FWarp": {
    dataReads: ["data[0]"],
    lineCount: 1,
    bodyC: "while(sLavaridgeGym1FWarpEffectFuncs[gTasks[taskId].data[0]](&gTasks[taskId], &gObjectEvents[gPlayerAvatar.objectEventId], &gSprites[gPlayerAvatar.spriteId]));",
  },
  "Task_EscapeRopeWarpOut": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "sEscapeRopeWarpOutEffectFuncs[gTasks[taskId].tState](&gTasks[taskId]);",
  },
  "Task_EscapeRopeWarpIn": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "sEscapeRopeWarpInEffectFuncs[gTasks[taskId].tState](&gTasks[taskId]);",
  },
  "Task_TeleportWarpOut": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "sTeleportWarpOutFieldEffectFuncs[gTasks[taskId].tState](&gTasks[taskId]);",
  },
  "Task_TeleportWarpIn": {
    dataReads: ["data[0]"],
    lineCount: 1,
    bodyC: "sTeleportWarpInFieldEffectFuncs[gTasks[taskId].data[0]](&gTasks[taskId]);",
  },
  "Task_FieldMoveShowMonOutdoors": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "sFieldMoveShowMonOutdoorsEffectFuncs[gTasks[taskId].tState](&gTasks[taskId]);",
  },
  "Task_FieldMoveShowMonIndoors": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "sFieldMoveShowMonIndoorsEffectFuncs[gTasks[taskId].tState](&gTasks[taskId]);",
  },
  "Task_SurfFieldEffect": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "sSurfFieldEffectFuncs[gTasks[taskId].tState](&gTasks[taskId]);",
  },
  "Task_FlyOut": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "sFlyOutFieldEffectFuncs[gTasks[taskId].tState](&gTasks[taskId]);",
  },
  "Task_FlyIn": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "sFlyInFieldEffectFuncs[gTasks[taskId].tState](&gTasks[taskId]);",
  },
  "Task_DeoxysRockCameraShake": {
    callsTo: ["DestroyTask","SetCameraPanning","UpdateCameraPanning"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 25,
    bodyC: "s16 *data = gTasks[taskId].data;\n    if (tEnding)\n    {\n        if (++tEndDelay > 20)\n        {\n            tEndDelay = 0;\n            if (tShake != 0)\n                tShake--;\n        }\n    }\n    else\n    {\n        tShake = 4;\n    }\n\n    if (++tShakeDelay > 1)\n    {\n        tShakeDelay = 0;\n\n        if (++tShakeUp & 1)\n            SetCameraPanning(0, -tShake);\n        else\n            SetCameraPanning(0, tShake);\n    }\n    UpdateCameraPanning();\n    if (tShake == 0)\n        DestroyTask(taskId);",
  },
  "Task_DestroyDeoxysRock": {
    callsTo: ["InstallCameraPanAheadCallback","SetCameraPanningCallback"],
    lineCount: 4,
    bodyC: "s16 *data = gTasks[taskId].data;\n    InstallCameraPanAheadCallback();\n    SetCameraPanningCallback(0);\n    sDestroyDeoxysRockEffectFuncs[tState](data, taskId);",
  },
  "Task_MoveDeoxysRock": {
    callsTo: ["DestroyTask","FieldEffectActiveListRemove","SAFE_DIV","ShiftStillObjectEventCoords"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 31,
    bodyC: "s16 *data = gTasks[taskId].data;\n    struct Sprite *sprite = &gSprites[tSpriteId];\n    switch (tState)\n    {\n        case 0:\n            tCurX = sprite->x << 4;\n            tCurY = sprite->y << 4;\n            tVelocityX = SAFE_DIV(tTargetX * 16 - tCurX, tMoveSteps);\n            tVelocityY = SAFE_DIV(tTargetY * 16 - tCurY, tMoveSteps);\n            tState++;\n             \n        case 1:\n            if (tMoveSteps != 0)\n            {\n                tMoveSteps--;\n                tCurX += tVelocityX;\n                tCurY += tVelocityY;\n                sprite->x = tCurX >> 4;\n                sprite->y = tCurY >> 4;\n            }\n            else\n            {\n                struct ObjectEvent *object = &gObjectEvents[tObjEventId];\n                sprite->x = tTargetX;\n                sprite->y = tTargetY;\n                ShiftStillObjectEventCoords(object);\n                object->triggerGroundEffectsOnStop = TRUE;\n                FieldEffectActiveListRemove(FLDEFF_MOVE_DEOXYS_ROCK);\n                DestroyTask(taskId);\n            }\n            break;\n    }",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_PokeballGlowEffect": {
    lineCount: 1,
    bodyC: "sPokeballGlowEffectFuncs[sprite->sState](sprite);",
  },
  "SpriteCB_PokeballGlow": {
    callsTo: ["FieldEffectFreeGraphicsResources"],
    lineCount: 4,
    bodyC: "if (gSprites[sprite->sEffectSpriteId].sState > 4)\n    {\n        FieldEffectFreeGraphicsResources(sprite);\n    }",
  },
  "SpriteCB_PokecenterMonitor": {
    callsTo: ["FieldEffectFreeGraphicsResources","StartSpriteAnim"],
    lineCount: 10,
    bodyC: "if (sprite->data[0] != 0)\n    {\n        sprite->data[0] = 0;\n        sprite->invisible = FALSE;\n        StartSpriteAnim(sprite, 1);\n    }\n    if (sprite->animEnded)\n    {\n        FieldEffectFreeGraphicsResources(sprite);\n    }",
  },
  "SpriteCB_HallOfFameMonitor": {
    callsTo: ["FieldEffectFreeGraphicsResources"],
    lineCount: 13,
    bodyC: "if (gTasks[sprite->data[0]].tStartHofFlash)\n    {\n        if (sprite->data[1] == 0 || (--sprite->data[1]) == 0)\n        {\n            sprite->data[1] = 16;\n            sprite->invisible ^= 1;\n        }\n        sprite->data[2]++;\n    }\n    if (sprite->data[2] > 127)\n    {\n        FieldEffectFreeGraphicsResources(sprite);\n    }",
  },
  "SpriteCB_AshLaunch": {
    callsTo: ["FieldEffectStop"],
    lineCount: 2,
    bodyC: "if (sprite->animEnded)\n        FieldEffectStop(sprite, FLDEFF_ASH_LAUNCH);",
  },
  "SpriteCB_AshPuff": {
    callsTo: ["FieldEffectStop"],
    lineCount: 2,
    bodyC: "if (sprite->animEnded)\n        FieldEffectStop(sprite, FLDEFF_ASH_PUFF);",
  },
  "SpriteCB_FieldMoveMonSlideOnscreen": {
    callsTo: ["PlayCry_Normal","PlayCry_NormalNoDucking"],
    spriteTransitions: ["SpriteCB_FieldMoveMonWaitAfterCry"],
    lineCount: 10,
    bodyC: "if ((sprite->x -= 20) <= DISPLAY_WIDTH / 2)\n    {\n        sprite->x = DISPLAY_WIDTH / 2;\n        sprite->sOnscreenTimer = 30;\n        sprite->callback = SpriteCB_FieldMoveMonWaitAfterCry;\n        if (sprite->data[6])\n            PlayCry_NormalNoDucking(sprite->sSpecies, 0, CRY_VOLUME_RS, CRY_PRIORITY_NORMAL);\n        else\n            PlayCry_Normal(sprite->sSpecies, 0);\n    }",
  },
  "SpriteCB_FieldMoveMonWaitAfterCry": {
    spriteTransitions: ["SpriteCB_FieldMoveMonSlideOffscreen"],
    lineCount: 2,
    bodyC: "if ((--sprite->sOnscreenTimer) == 0)\n        sprite->callback = SpriteCB_FieldMoveMonSlideOffscreen;",
  },
  "SpriteCB_FieldMoveMonSlideOffscreen": {
    lineCount: 4,
    bodyC: "if (sprite->x < -64)\n        sprite->sSlidOffscreen = TRUE;\n    else\n        sprite->x -= 20;",
  },
  "SpriteCB_NPCFlyOut": {
    callsTo: ["Cos","FieldEffectStop","Sin"],
    lineCount: 15,
    bodyC: "struct Sprite *npcSprite;\n\n    sprite->x2 = Cos(sprite->data[2], 0x8c);\n    sprite->y2 = Sin(sprite->data[2], 0x48);\n    sprite->data[2] = (sprite->data[2] + 4) & 0xff;\n    if (sprite->data[0])\n    {\n        npcSprite = &gSprites[sprite->data[1]];\n        npcSprite->coordOffsetEnabled = FALSE;\n        npcSprite->x = sprite->x + sprite->x2;\n        npcSprite->y = sprite->y + sprite->y2 - 8;\n        npcSprite->x2 = 0;\n        npcSprite->y2 = 0;\n    }\n\n    if (sprite->data[2] >= 0x80)\n        FieldEffectStop(sprite, FLDEFF_NPCFLY_OUT);",
  },
  "SpriteCB_FlyBirdLeaveBall": {
    callsTo: ["CalcCenterToCornerVec","Cos","FreeOamMatrix","InitSpriteAffineAnim","Sin","StartSpriteAffineAnim"],
    lineCount: 29,
    bodyC: "if (sprite->sAnimCompleted == FALSE)\n    {\n        if (sprite->data[0] == 0)\n        {\n            sprite->oam.affineMode = ST_OAM_AFFINE_DOUBLE;\n            sprite->affineAnims = sAffineAnims_FlyBird;\n            InitSpriteAffineAnim(sprite);\n            StartSpriteAffineAnim(sprite, 0);\n            sprite->x = 0x76;\n            sprite->y = -0x30;\n            sprite->data[0]++;\n            sprite->data[1] = 0x40;\n            sprite->data[2] = 0x100;\n        }\n        sprite->data[1] += (sprite->data[2] >> 8);\n        sprite->x2 = Cos(sprite->data[1], 0x78);\n        sprite->y2 = Sin(sprite->data[1], 0x78);\n        if (sprite->data[2] < 0x800)\n        {\n            sprite->data[2] += 0x60;\n        }\n        if (sprite->data[1] > 0x81)\n        {\n            sprite->sAnimCompleted++;\n            sprite->oam.affineMode = ST_OAM_AFFINE_OFF;\n            FreeOamMatrix(sprite->oam.matrixNum);\n            CalcCenterToCornerVec(sprite, sprite->oam.shape, sprite->oam.size, ST_OAM_AFFINE_OFF);\n        }\n    }",
  },
  "SpriteCB_FlyBirdSwoopDown": {
    callsTo: ["Cos","Sin"],
    lineCount: 16,
    bodyC: "sprite->x2 = Cos(sprite->data[2], 0x8c);\n    sprite->y2 = Sin(sprite->data[2], 0x48);\n    sprite->data[2] = (sprite->data[2] + 4) & 0xff;\n    if (sprite->sPlayerSpriteId != MAX_SPRITES)\n    {\n        struct Sprite *sprite1 = &gSprites[sprite->sPlayerSpriteId];\n        sprite1->coordOffsetEnabled = FALSE;\n        sprite1->x = sprite->x + sprite->x2;\n        sprite1->y = sprite->y + sprite->y2 - 8;\n        sprite1->x2 = 0;\n        sprite1->y2 = 0;\n    }\n    if (sprite->data[2] >= 0x80)\n    {\n        sprite->sAnimCompleted = TRUE;\n    }",
  },
  "SpriteCB_FlyBirdReturnToBall": {
    callsTo: ["Cos","FreeOamMatrix","InitSpriteAffineAnim","Sin","StartSpriteAffineAnim"],
    lineCount: 40,
    bodyC: "if (sprite->sAnimCompleted == FALSE)\n    {\n        if (sprite->data[0] == 0)\n        {\n            sprite->oam.affineMode = ST_OAM_AFFINE_DOUBLE;\n            sprite->affineAnims = sAffineAnims_FlyBird;\n            InitSpriteAffineAnim(sprite);\n            StartSpriteAffineAnim(sprite, 1);\n            sprite->x = 0x5e;\n            sprite->y = -0x20;\n            sprite->data[0]++;\n            sprite->data[1] = 0xf0;\n            sprite->data[2] = 0x800;\n            sprite->data[4] = 0x80;\n        }\n        sprite->data[1] += sprite->data[2] >> 8;\n        sprite->data[3] += sprite->data[2] >> 8;\n        sprite->data[1] &= 0xff;\n        sprite->x2 = Cos(sprite->data[1], 0x20);\n        sprite->y2 = Sin(sprite->data[1], 0x78);\n        if (sprite->data[2] > 0x100)\n        {\n            sprite->data[2] -= sprite->data[4];\n        }\n        if (sprite->data[4] < 0x100)\n        {\n            sprite->data[4] += 24;\n        }\n        if (sprite->data[2] < 0x100)\n        {\n            sprite->data[2] = 0x100;\n        }\n        if (sprite->data[3] >= 60)\n        {\n            sprite->sAnimCompleted++;\n            sprite->oam.affineMode = ST_OAM_AFFINE_OFF;\n            FreeOamMatrix(sprite->oam.matrixNum);\n            sprite->invisible = TRUE;\n        }\n    }",
  },
  "SpriteCB_DeoxysRockFragment": {
    callsTo: ["DestroySprite"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 21,
    bodyC: "switch (sprite->data[0])\n    {\n    case 0:\n        sprite->x -= 16;\n        sprite->y -= 12;\n        break;\n    case 1:\n        sprite->x += 16;\n        sprite->y -= 12;\n        break;\n    case 2:\n        sprite->x -= 16;\n        sprite->y += 12;\n        break;\n    case 3:\n        sprite->x += 16;\n        sprite->y += 12;\n        break;\n    }\n    if (sprite->x < -4 || sprite->x > DISPLAY_WIDTH + 4 || sprite->y < -4 || sprite->y > DISPLAY_HEIGHT + 4)\n        DestroySprite(sprite);",
  },
} as const;
