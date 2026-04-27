// AUTO-GENERATED from src/rayquaza_scene.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 24 Task_, 2 CB2_, 11 SpriteCB_

export const TASKS = {
  "Task_EndAfterFadeScreen": {
    callsTo: ["DestroyTask","Free","FreeAllSpritePalettes","ResetSpriteData","SetMainCallback2"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 8,
    bodyC: "if (!gPaletteFade.active)\n    {\n        ResetSpriteData();\n        FreeAllSpritePalettes();\n        SetMainCallback2(sRayScene->exitCallback);\n        Free(sRayScene);\n        DestroyTask(taskId);\n    }",
  },
  "Task_SetNextAnim": {
    taskTransitions: ["Task_EndAfterFadeScreen","sTasksForAnimations"],
    externalChecks: { paletteFade: true },
    lineCount: 13,
    bodyC: "if (!gPaletteFade.active)\n    {\n        if (sRayScene->endEarly == TRUE)\n        {\n            gTasks[taskId].func = Task_EndAfterFadeScreen;\n        }\n        else\n        {\n            sRayScene->animId++;\n            sRayScene->unk = 0;\n            gTasks[taskId].func = sTasksForAnimations[sRayScene->animId];\n        }\n    }",
  },
  "Task_HandleDuoFightPre": {
    callsTo: ["DuoFightEnd","DuoFight_AnimateRain","DuoFight_Lightning1","DuoFight_Lightning2","DuoFight_LightningLong"],
    externalChecks: { paletteFade: true },
    lineCount: 27,
    bodyC: "s16 *data = gTasks[taskId].data;\n    DuoFight_AnimateRain();\n    if (!gPaletteFade.active)\n    {\n        s16 frame = tTimer;\n        if (frame == 64)\n        {\n            DuoFight_Lightning1();\n        }\n        else if (frame == 144)\n        {\n            DuoFight_Lightning2();\n        }\n        else\n        {\n            switch (frame)\n            {\n            case 328:\n                DuoFightEnd(taskId, 0);\n                return;\n            case 148:\n                DuoFight_LightningLong();\n                break;\n            }\n        }\n\n        tTimer++;\n    }",
  },
  "Task_DuoFightAnim": {
    callsTo: ["BeginNormalPaletteFade","BlendPalettes","CpuFastFill16","CreateTask","DuoFightPre_CreateGroudonSprites","DuoFightPre_CreateKyogreSprites","DuoFight_CreateGroudonSprites","DuoFight_CreateKyogreSprites","InitDuoFightSceneBgs","LoadDuoFightSceneGfx","PlaySE","ScanlineEffect_Clear","ScanlineEffect_SetParams","SetVBlankCallback","StopMapMusic"],
    taskTransitions: ["Task_HandleDuoFight","Task_HandleDuoFightPre"],
    lineCount: 25,
    bodyC: "s16 *data = gTasks[taskId].data;\n    ScanlineEffect_Clear();\n    InitDuoFightSceneBgs();\n    LoadDuoFightSceneGfx();\n    CpuFastFill16(0, gScanlineEffectRegBuffers, sizeof(gScanlineEffectRegBuffers));\n    ScanlineEffect_SetParams(sScanlineParams_DuoFight_Clouds);\n    tTimer = 0;\n    tHelperTaskId = CreateTask(Task_DuoFight_AnimateClouds, 0);\n    if (sRayScene->animId == RAY_ANIM_DUO_FIGHT_PRE)\n    {\n        tGroudonSpriteId = DuoFightPre_CreateGroudonSprites();\n        tKyogreSpriteId = DuoFightPre_CreateKyogreSprites();\n        gTasks[taskId].func = Task_HandleDuoFightPre;\n    }\n    else\n    {\n        tGroudonSpriteId = DuoFight_CreateGroudonSprites();\n        tKyogreSpriteId = DuoFight_CreateKyogreSprites();\n        gTasks[taskId].func = Task_HandleDuoFight;\n        StopMapMusic();\n    }\n\n    BlendPalettes(PALETTES_ALL, 0x10, RGB_BLACK);\n    BeginNormalPaletteFade(PALETTES_ALL, 0, 0x10, 0, RGB_BLACK);\n    SetVBlankCallback(VBlankCB_DuoFight);\n    PlaySE(SE_DOWNPOUR);",
  },
  "Task_DuoFight_AnimateClouds": {
    lineCount: 53,
    bodyC: "s16 i;\n    u16 *data = (u16*)gTasks[taskId].data;\n\n    for (i = 24; i < 92; i++)\n    {\n        if (i <= 47)\n        {\n            gScanlineEffectRegBuffers[0][i] = data[0] >> 8;\n            gScanlineEffectRegBuffers[1][i] = data[0] >> 8;\n        }\n        else if (i <= 63)\n        {\n            gScanlineEffectRegBuffers[0][i] = data[1] >> 8;\n            gScanlineEffectRegBuffers[1][i] = data[1] >> 8;\n        }\n        else if (i <= 75)\n        {\n            gScanlineEffectRegBuffers[0][i] = data[2] >> 8;\n            gScanlineEffectRegBuffers[1][i] = data[2] >> 8;\n        }\n        else if (i <= 83)\n        {\n            gScanlineEffectRegBuffers[0][i] = data[3] >> 8;\n            gScanlineEffectRegBuffers[1][i] = data[3] >> 8;\n        }\n        else if (i <= 87)\n        {\n            gScanlineEffectRegBuffers[0][i] = data[4] >> 8;\n            gScanlineEffectRegBuffers[1][i] = data[4] >> 8;\n        }\n        else\n        {\n            gScanlineEffectRegBuffers[0][i] = data[5] >> 8;\n            gScanlineEffectRegBuffers[1][i] = data[5] >> 8;\n        }\n    }\n\n    if (sRayScene->animId == RAY_ANIM_DUO_FIGHT_PRE)\n    {\n        data[0] += 448;\n        data[1] += 384;\n        data[2] += 320;\n        data[3] += 256;\n        data[4] += 192;\n        data[5] += 128;\n    }\n    else\n    {\n        data[0] += 768;\n        data[1] += 640;\n        data[2] += 512;\n        data[3] += 384;\n        data[4] += 256;\n        data[5] += 128;\n    }",
  },
  "Task_HandleDuoFight": {
    callsTo: ["DuoFightEnd","DuoFight_AnimateRain","DuoFight_Lightning1","DuoFight_Lightning2","DuoFight_LightningLong","ScanlineEffect_Stop","SetGpuReg"],
    taskTransitions: ["DuoFight_PanOffScene"],
    dataWrites: ["data[0]","data[2]","data[3]"],
    externalChecks: { paletteFade: true },
    lineCount: 36,
    bodyC: "s16 *data = gTasks[taskId].data;\n    DuoFight_AnimateRain();\n    if (!gPaletteFade.active)\n    {\n        s16 frame = tTimer;\n        if (frame == 32 || frame == 112)\n        {\n            DuoFight_Lightning1();\n        }\n        else if (frame == 216)\n        {\n            DuoFight_Lightning2();\n        }\n        else if (frame == 220)\n        {\n            DuoFight_LightningLong();\n        }\n        else\n        {\n            switch (frame)\n            {\n            case 412:\n                DuoFightEnd(taskId, 2);\n                return;\n            case 380:\n                SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG2 | BLDCNT_TGT2_BG1 | BLDCNT_EFFECT_BLEND);\n                gTasks[tHelperTaskId].func = DuoFight_PanOffScene;\n                gTasks[tHelperTaskId].data[0] = 0;\n                gTasks[tHelperTaskId].data[2] = data[2];\n                gTasks[tHelperTaskId].data[3] = data[3];\n                ScanlineEffect_Stop();\n                break;\n            }\n        }\n\n        tTimer++;\n    }",
  },
  "Task_DuoFightEnd": {
    callsTo: ["ChangeBgY","DestroyTask","DuoFight_AnimateRain","FreeAllSpritePalettes","ResetSpriteData","ScanlineEffect_Stop","SetVBlankCallback"],
    taskTransitions: ["Task_SetNextAnim"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 13,
    bodyC: "s16 *data = gTasks[taskId].data;\n    DuoFight_AnimateRain();\n    if (!gPaletteFade.active)\n    {\n        DestroyTask(tHelperTaskId);\n        ChangeBgY(1, 0, BG_COORD_SET);\n        SetVBlankCallback(NULL);\n        ScanlineEffect_Stop();\n        ResetSpriteData();\n        FreeAllSpritePalettes();\n        tTimer = 0;\n        gTasks[taskId].func = Task_SetNextAnim;\n    }",
  },
  "Task_RayTakesFlightAnim": {
    callsTo: ["BLDALPHA_BLEND","BlendPalettes","CreateTask","InitTakesFlightSceneBgs","LoadTakesFlightSceneGfx","PlayNewMapMusic","SetGpuReg","SetVBlankCallback"],
    taskTransitions: ["Task_HandleRayTakesFlight"],
    lineCount: 12,
    bodyC: "s16 *data = gTasks[taskId].data;\n    PlayNewMapMusic(MUS_RAYQUAZA_APPEARS);\n    InitTakesFlightSceneBgs();\n    LoadTakesFlightSceneGfx();\n    SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_OBJ | BLDCNT_TGT2_BG1 | BLDCNT_EFFECT_BLEND);\n    SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(8, 8));\n    BlendPalettes(PALETTES_ALL, 16, 0);\n    SetVBlankCallback(VBlankCB_RayquazaScene);\n    CreateTask(Task_TakesFlight_CreateSmoke, 0);\n    tState = 0;\n    tTimer = 0;\n    gTasks[taskId].func = Task_HandleRayTakesFlight;",
  },
  "Task_HandleRayTakesFlight": {
    callsTo: ["BeginNormalPaletteFade","SetBgAffine","Task_RayTakesFlightEnd"],
    lineCount: 57,
    bodyC: "s16 *data = gTasks[taskId].data;\n    switch (tState)\n    {\n    case 0:\n         \n        if (tTimer == 8)\n        {\n            BeginNormalPaletteFade(PALETTES_ALL, 0, 0x10, 0, RGB_BLACK);\n            tScale = 0;\n            tScaleSpeed = 30;\n            tYCoord = 0;\n            tYSpeed = 7;\n            tTimer = 0;\n            tState++;\n        }\n        else\n        {\n            tTimer++;\n        }\n        break;\n    case 1:\n         \n        tScale += tScaleSpeed;\n        tYCoord += tYSpeed;\n\n        if (tScaleSpeed > 3)\n            tScaleSpeed -= 3;\n\n        if (tYSpeed != 0)\n            tYSpeed--;\n\n        if (tScale > 255)\n        {\n            tScale = 256;\n            tScaleSpeed = 0;\n            tYOffset = 12;\n            tYOffsetDir = -1;\n            tTimer = 0;\n            tState++;\n        }\n        SetBgAffine(2, 0x7800, 0x1800, 120, tYCoord + 32, tScale, tScale, 0);\n        break;\n    case 2:\n         \n        tTimer++;\n        SetBgAffine(2, 0x7800, 0x1800, 120, tYCoord + 32 + (tYOffset >> 2), tScale, tScale, 0);\n        tYOffset += tYOffsetDir;\n        if (tYOffset == 12 || tYOffset == -12)\n        {\n            tYOffsetDir *= -1;\n            if (tTimer > 295)\n            {\n                tState++;\n                BeginNormalPaletteFade(PALETTES_ALL, 6, 0, 0x10, RGB_BLACK);\n            }\n        }\n        break;\n    case 3:\n         \n        tScale += 16;\n        SetBgAffine(2, 0x7800, 0x1800, 120, tYCoord + 32, tScale, tScale, 0);\n        Task_RayTakesFlightEnd(taskId);\n        break;\n    }",
  },
  "Task_RayTakesFlightEnd": {
    callsTo: ["FreeAllSpritePalettes","ResetSpriteData","SetVBlankCallback"],
    taskTransitions: ["Task_SetNextAnim"],
    externalChecks: { paletteFade: true },
    lineCount: 7,
    bodyC: "if (!gPaletteFade.active)\n    {\n        SetVBlankCallback(NULL);\n        ResetSpriteData();\n        FreeAllSpritePalettes();\n        gTasks[taskId].func = Task_SetNextAnim;\n    }",
  },
  "Task_TakesFlight_CreateSmoke": {
    callsTo: ["CreateSprite","DestroyTask","InitSpriteAffineAnim"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 23,
    bodyC: "s16 *data = gTasks[taskId].data;\n    if ((tTimer & 3) == 0)\n    {\n        u8 spriteId = CreateSprite(&sSpriteTemplate_TakesFlight_Smoke,\n                                   (sTakesFlight_SmokeCoords[tSmokeId][0] * 4) + 120,\n                                   (sTakesFlight_SmokeCoords[tSmokeId][1] * 4) + 80,\n                                   0);\n        gSprites[spriteId].sSmokeId = (s8)(tSmokeId);\n        gSprites[spriteId].oam.objMode = ST_OAM_OBJ_BLEND;\n        gSprites[spriteId].oam.affineMode = ST_OAM_AFFINE_DOUBLE;\n        gSprites[spriteId].oam.priority = 2;\n        InitSpriteAffineAnim(&gSprites[spriteId]);\n        if (tSmokeId == MAX_SMOKE - 1)\n        {\n            DestroyTask(taskId);\n            return;\n        }\n        else\n        {\n            tSmokeId++;\n        }\n    }\n\n    tTimer++;",
  },
  "Task_RayDescendsAnim": {
    callsTo: ["BLDALPHA_BLEND","BlendPalettes","InitDescendsSceneBgs","LoadDescendsSceneGfx","SetGpuReg","SetGpuRegBits","SetVBlankCallback"],
    taskTransitions: ["Task_HandleRayDescends"],
    lineCount: 15,
    bodyC: "s16 *data = gTasks[taskId].data;\n    InitDescendsSceneBgs();\n    LoadDescendsSceneGfx();\n    SetGpuRegBits(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG0 | BLDCNT_TGT2_BG1 | BLDCNT_TGT2_BG2 | BLDCNT_TGT2_BG3 | BLDCNT_TGT2_OBJ | BLDCNT_EFFECT_BLEND);\n    SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(0, 16));\n    BlendPalettes(PALETTES_ALL, 0x10, RGB_BLACK);\n    SetVBlankCallback(VBlankCB_RayquazaScene);\n    sRayScene->revealedLightLine = 0;\n    sRayScene->revealedLightTimer = 0;\n    tState = 0;\n    tTimer = 0;\n    data[2] = 0;  \n    data[3] = 0;\n    data[4] = 0x1000;\n    gTasks[taskId].func = Task_HandleRayDescends;",
  },
  "Task_HandleRayDescends": {
    callsTo: ["BeginNormalPaletteFade","CreateDescendsRayquazaSprite","EnableInterrupts","SetHBlankCallback"],
    taskTransitions: ["Task_RayDescendsEnd"],
    externalChecks: { paletteFade: true },
    lineCount: 55,
    bodyC: "s16 *data = gTasks[taskId].data;\n    switch (tState)\n    {\n    case 0:\n         \n        if (tTimer == 8)\n        {\n            BeginNormalPaletteFade(PALETTES_ALL, 0, 0x10, 0, RGB_BLACK);\n            tTimer = 0;\n            tState++;\n        }\n        else\n        {\n            tTimer++;\n        }\n        break;\n    case 1:\n        if (!gPaletteFade.active)\n        {\n             \n            if (tTimer == 10)\n            {\n                tTimer = 0;\n                tState++;\n                SetHBlankCallback(HBlankCB_RayDescends);\n                EnableInterrupts(INTR_FLAG_HBLANK | INTR_FLAG_VBLANK);\n            }\n            else\n            {\n                tTimer++;\n            }\n        }\n        break;\n    case 2:\n         \n        if (tTimer == 80)\n        {\n            tTimer = 0;\n            tState++;\n            CreateDescendsRayquazaSprite();\n        }\n        else\n        {\n            tTimer++;\n        }\n        break;\n    case 3:\n         \n        if (++tTimer == 368)\n        {\n            tTimer = 0;\n            tState++;\n        }\n        break;\n    case 4:\n         \n        BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 0x10, RGB_BLACK);\n        gTasks[taskId].func = Task_RayDescendsEnd;\n        break;\n    }",
  },
  "Task_RayDescendsEnd": {
    callsTo: ["FreeAllSpritePalettes","ResetSpriteData","SetHBlankCallback","SetVBlankCallback"],
    taskTransitions: ["Task_SetNextAnim"],
    externalChecks: { paletteFade: true },
    lineCount: 8,
    bodyC: "if (!gPaletteFade.active)\n    {\n        SetVBlankCallback(NULL);\n        SetHBlankCallback(NULL);\n        ResetSpriteData();\n        FreeAllSpritePalettes();\n        gTasks[taskId].func = Task_SetNextAnim;\n    }",
  },
  "Task_RayChargesAnim": {
    callsTo: ["BlendPalettes","CreateTask","InitChargesSceneBgs","LoadChargesSceneGfx","SetVBlankCallback","SetWindowsHideVertBorders"],
    taskTransitions: ["Task_HandleRayCharges"],
    lineCount: 10,
    bodyC: "s16 *data = gTasks[taskId].data;\n    InitChargesSceneBgs();\n    LoadChargesSceneGfx();\n    SetWindowsHideVertBorders();\n    BlendPalettes(PALETTES_ALL, 0x10, RGB_BLACK);\n    SetVBlankCallback(VBlankCB_RayquazaScene);\n    tState = 0;\n    tTimer = 0;\n    tRayquazaTaskId = CreateTask(Task_RayCharges_ShakeRayquaza, 0);\n    gTasks[taskId].func = Task_HandleRayCharges;",
  },
  "Task_HandleRayCharges": {
    callsTo: ["BeginNormalPaletteFade","PlaySE","RayCharges_AnimateBg"],
    taskTransitions: ["Task_RayChargesEnd","Task_RayCharges_FlyOffscreen"],
    lineCount: 47,
    bodyC: "s16 *data = gTasks[taskId].data;\n    RayCharges_AnimateBg();\n    if ((tSoundTimer & 7) == 0 && tState <= 1 && tTimer <= 89)\n        PlaySE(SE_INTRO_BLAST);\n\n    tSoundTimer++;\n    switch (tState)\n    {\n    case 0:\n         \n        if (tTimer == 8)\n        {\n            BeginNormalPaletteFade(PALETTES_ALL, 0, 0x10, 0, RGB_BLACK);\n            tTimer = 0;\n            tState++;\n        }\n        else\n        {\n            tTimer++;\n        }\n        break;\n    case 1:\n         \n        if (tTimer == 127)\n        {\n            tTimer = 0;\n            tState++;\n            gTasks[tRayquazaTaskId].func = Task_RayCharges_FlyOffscreen;\n        }\n        else\n        {\n            tTimer++;\n        }\n        break;\n    case 2:\n         \n        if (tTimer == 12)\n        {\n            tTimer = 0;\n            tState++;\n        }\n        else\n        {\n            tTimer++;\n        }\n        break;\n    case 3:\n         \n        BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 0x10, RGB_BLACK);\n        gTasks[taskId].func = Task_RayChargesEnd;\n        break;\n    }",
  },
  "Task_RayCharges_ShakeRayquaza": {
    callsTo: ["ChangeBgX","ChangeBgY","Random"],
    lineCount: 7,
    bodyC: "s16 *data = gTasks[taskId].data;\n    if ((tTimer & 3) == 0)\n    {\n        ChangeBgX(1, (Random() % 8 - 4) << 8, BG_COORD_SET);\n        ChangeBgY(1, (Random() % 8 - 4) << 8, BG_COORD_SET);\n    }\n\n    tTimer++;",
  },
  "Task_RayCharges_FlyOffscreen": {
    callsTo: ["ChangeBgX","ChangeBgY"],
    lineCount: 17,
    bodyC: "s16 *data = gTasks[taskId].data;\n    if (tState == 0)\n    {\n        ChangeBgX(1, 0, BG_COORD_SET);\n        ChangeBgY(1, 0, BG_COORD_SET);\n        tState++;\n        tOffset = 10;\n        tShakeDir = -1;\n    }\n    else if (tState == 1)\n    {\n        ChangeBgX(1, tOffset << 8, BG_COORD_SUB);\n        ChangeBgY(1, tOffset << 8, BG_COORD_ADD);\n        tOffset += tShakeDir;\n        if (tOffset == -10)\n            tShakeDir *= -1;\n    }",
  },
  "Task_RayChargesEnd": {
    callsTo: ["DestroyTask","RayCharges_AnimateBg","ResetWindowDimensions","SetVBlankCallback"],
    taskTransitions: ["Task_SetNextAnim"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 9,
    bodyC: "s16 *data = gTasks[taskId].data;\n    RayCharges_AnimateBg();\n    if (!gPaletteFade.active)\n    {\n        SetVBlankCallback(NULL);\n        ResetWindowDimensions();\n        DestroyTask(tRayquazaTaskId);\n        gTasks[taskId].func = Task_SetNextAnim;\n    }",
  },
  "Task_RayChasesAwayAnim": {
    callsTo: ["BLDALPHA_BLEND","BlendPalettes","ClearGpuRegBits","CreateTask","InitChasesAwaySceneBgs","LoadChasesAwaySceneGfx","SetGpuReg","SetVBlankCallback","SetWindowsHideVertBorders"],
    taskTransitions: ["Task_HandleRayChasesAway"],
    dataWrites: ["data[0]","data[1]","data[2]","data[3]","data[4]"],
    lineCount: 18,
    bodyC: "s16 *data = gTasks[taskId].data;\n    InitChasesAwaySceneBgs();\n    LoadChasesAwaySceneGfx();\n    SetWindowsHideVertBorders();\n    ClearGpuRegBits(REG_OFFSET_DISPCNT, DISPCNT_BG2_ON);\n    SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG0 | BLDCNT_TGT2_BG1 | BLDCNT_EFFECT_BLEND);\n    SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(9, 14));\n    BlendPalettes(PALETTES_ALL, 0x10, RGB_BLACK);\n    SetVBlankCallback(VBlankCB_RayquazaScene);\n    tState = 0;\n    tTimer = 0;\n    gTasks[taskId].func = Task_HandleRayChasesAway;\n    tBgTaskId = CreateTask(Task_ChasesAway_AnimateBg, 0);\n    gTasks[tBgTaskId].data[0] = 0;\n    gTasks[tBgTaskId].data[1] = 0;\n    gTasks[tBgTaskId].data[2] = 0;\n    gTasks[tBgTaskId].data[3] = 1;\n    gTasks[tBgTaskId].data[4] = 1;",
  },
  "Task_HandleRayChasesAway": {
    callsTo: ["BeginNormalPaletteFade","BlendPalettesGradually","ChasesAway_CreateTrioSprites","ChasesAway_GroudonStartLeave","ChasesAway_KyogreStartLeave"],
    taskTransitions: ["Task_RayChasesAwayEnd"],
    lineCount: 53,
    bodyC: "s16 *data = gTasks[taskId].data;\n    switch (tState)\n    {\n    case 0:\n         \n        if (tTimer == 8)\n        {\n            ChasesAway_CreateTrioSprites(taskId);\n            BeginNormalPaletteFade(PALETTES_ALL, 0, 0x10, 0, RGB_BLACK);\n            tTimer = 0;\n            tState++;\n        }\n        else\n        {\n            tTimer++;\n        }\n        break;\n    case 1:\n         \n        if (gSprites[data[5]].callback == SpriteCB_ChasesAway_RayquazaFloat)\n        {\n             \n            if (tTimer == 64)\n            {\n                ChasesAway_KyogreStartLeave(taskId);\n                ChasesAway_GroudonStartLeave(taskId);\n                tTimer = 0;\n                tState++;\n            }\n            else\n            {\n                tTimer++;\n            }\n        }\n        break;\n    case 2:\n         \n        if (tTimer == 448)\n        {\n            tTimer = 0;\n            tState++;\n        }\n        else\n        {\n             \n            tTimer++;\n            if (tTimer % 144 == 0)\n            {\n                BlendPalettesGradually(PALETTES_BG & ~1, 0, 16, 0, RGB_WHITEALPHA, 0, 0);\n                BlendPalettesGradually(PALETTES_OBJECTS, 0, 16, 0, RGB_BLACK,      0, 1);\n            }\n        }\n        break;\n    case 3:\n         \n        BeginNormalPaletteFade(PALETTES_ALL, 4, 0, 0x10, RGB_BLACK);\n        gTasks[taskId].func = Task_RayChasesAwayEnd;\n        break;\n    }",
  },
  "Task_ChasesAway_AnimateBg": {
    callsTo: ["SetGpuReg"],
    lineCount: 12,
    bodyC: "s16 *data = gTasks[taskId].data;\n    if ((tTimer & 0xF) == 0)\n    {\n        SetGpuReg(REG_OFFSET_BLDALPHA, ((tBlendHi + 14) << 8 & 0x1F00) | ((tBlendLo + 9) & 0xF));\n        tBlendHi -= tBlendHiDir;\n        tBlendLo += tBlendLoDir;\n        if (tBlendHi == -3 || tBlendHi == 0)\n            tBlendHiDir *= -1;\n        if (tBlendLo == 3 || tBlendLo == 0)\n            tBlendLoDir *= -1;\n    }\n\n    tTimer++;",
  },
  "Task_RayChasesAwayEnd": {
    callsTo: ["DestroyTask","FreeAllSpritePalettes","ResetSpriteData","ResetWindowDimensions","SetVBlankCallback","StopMapMusic"],
    taskTransitions: ["Task_SetNextAnim"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 22,
    bodyC: "s16 *data = gTasks[taskId].data;\n    if (!gPaletteFade.active)\n    {\n        StopMapMusic();\n        if (tTimer == 0)\n        {\n            SetVBlankCallback(NULL);\n            ResetWindowDimensions();\n            ResetSpriteData();\n            FreeAllSpritePalettes();\n            DestroyTask(tBgTaskId);\n        }\n\n        if (tTimer == 32)\n        {\n            tTimer = 0;\n            gTasks[taskId].func = Task_SetNextAnim;\n        }\n        else\n        {\n            tTimer++;\n        }\n    }",
  },
  "Task_ChasesAway_AnimateRing": {
    callsTo: ["ClearGpuRegBits","DestroyTask","PlaySE","SetBgAffine","SetGpuRegBits"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 39,
    bodyC: "s16 *data = gTasks[taskId].data;\n    switch (tState)\n    {\n    case 0:\n        SetBgAffine(2, 0x4000, 0x4000, 120, 64, 256, 256, 0);\n        SetGpuRegBits(REG_OFFSET_DISPCNT, DISPCNT_BG2_ON);\n        tScaleSpeed = 16;\n        tState++;\n        break;\n    case 1:\n        if (tSoundTimer == 8)\n            PlaySE(SE_SLIDING_DOOR);\n        if (tNumRings == 2)\n        {\n            tState++;\n        }\n        else\n        {\n            tScale += tScaleSpeed;\n            tSoundTimer++;\n            if (tScaleTimer % 3 == 0 && tScaleSpeed != 4)\n                tScaleSpeed -= 2;\n\n            tScaleTimer++;\n            SetBgAffine(2, 0x4000, 0x4000, 120, 64, 256 - tScale, 256 - tScale, 0);\n            if (tScale > 255)\n            {\n                tScale = 0;\n                tScaleTimer = 0;\n                tSoundTimer = 0;\n                tScaleSpeed = 16;\n                tNumRings++;\n            }\n        }\n        break;\n    case 2:\n        ClearGpuRegBits(REG_OFFSET_DISPCNT, DISPCNT_BG2_ON);\n        DestroyTask(taskId);\n        break;\n    }",
  },
} as const;

export const CB2S = {
  "CB2_InitRayquazaScene": {
    callsTo: ["BG_PLTT_ID","ClearScheduledBgCopiesToVram","CreateTask","FillPalette","FreeAllSpritePalettes","ResetPaletteFade","ResetSpriteData","ResetTasks","ScanlineEffect_Stop","SetMainCallback2","SetVBlankHBlankCallbacksToNull"],
    cb2Transitions: ["CB2_RayquazaScene"],
    lineCount: 10,
    bodyC: "SetVBlankHBlankCallbacksToNull();\n    ClearScheduledBgCopiesToVram();\n    ScanlineEffect_Stop();\n    FreeAllSpritePalettes();\n    ResetPaletteFade();\n    ResetSpriteData();\n    ResetTasks();\n    FillPalette(RGB_BLACK, BG_PLTT_ID(15), PLTT_SIZE_4BPP);\n    CreateTask(sTasksForAnimations[sRayScene->animId], 0);\n    SetMainCallback2(CB2_RayquazaScene);",
  },
  "CB2_RayquazaScene": {
    callsTo: ["AnimateSprites","BuildOamBuffer","DoScheduledBgTilemapCopiesToVram","RunTasks","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 5,
    bodyC: "RunTasks();\n    AnimateSprites();\n    BuildOamBuffer();\n    DoScheduledBgTilemapCopiesToVram();\n    UpdatePaletteFade();",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_DuoFightPre_Groudon": {
    lineCount: 32,
    bodyC: "s16 *data = sprite->data;\n    data[5]++;\n    data[5] &= 0x1F;\n    if (data[5] == 0 && sprite->x != 72)\n    {\n        sprite->x--;\n        gSprites[sprite->sGroudonBodySpriteId].x--;\n        gSprites[sGroudonShoulderSpriteId].x--;\n        gSprites[sGroudonClawSpriteId].x--;\n    }\n\n    switch (sprite->animCmdIndex)\n    {\n    case 0:\n        gSprites[sGroudonShoulderSpriteId].x2 = 0;\n        gSprites[sGroudonShoulderSpriteId].y2 = 0;\n        gSprites[sGroudonClawSpriteId].x2 = 0;\n        gSprites[sGroudonClawSpriteId].y2 = 0;\n        break;\n    case 1:\n    case 3:\n        gSprites[sGroudonShoulderSpriteId].x2 = -1;\n        gSprites[sGroudonShoulderSpriteId].y2 = 0;\n        gSprites[sGroudonClawSpriteId].x2 = -1;\n        gSprites[sGroudonClawSpriteId].y2 = 0;\n        break;\n    case 2:\n        gSprites[sGroudonShoulderSpriteId].x2 = -1;\n        gSprites[sGroudonShoulderSpriteId].y2 = 1;\n        gSprites[sGroudonClawSpriteId].x2 = -2;\n        gSprites[sGroudonClawSpriteId].y2 = 1;\n        break;\n    }",
  },
  "SpriteCB_DuoFightPre_Kyogre": {
    lineCount: 56,
    bodyC: "s16 *data = sprite->data;\n    data[5]++;\n    data[5] &= 0x1F;\n    if (data[5] == 0 && sprite->x != 152)\n    {\n        sprite->x++;\n        gSprites[sprite->data[0] >> 8].x++;\n        gSprites[sprite->data[0] & 0xFF].x++;\n        gSprites[data[1] >> 8].x++;\n        gSprites[data[1] & 0xFF].x++;\n        gSprites[data[2] >> 8].x++;\n        gSprites[data[2] & 0xFF].x++;\n        gSprites[data[3] >> 8].x++;\n        gSprites[data[3] & 0xFF].x++;\n        gSprites[data[4] >> 8].x++;\n        gSprites[data[4] & 0xFF].x++;\n    }\n\n    switch (gSprites[data[2] & 0xFF].animCmdIndex)\n    {\n    case 0:\n        sprite->y2 = 0;\n        gSprites[data[0] >> 8].y2 = 0;\n        gSprites[data[0] & 0xFF].y2 = 0;\n        gSprites[data[1] >> 8].y2 = 0;\n        gSprites[data[1] & 0xFF].y2 = 0;\n        gSprites[data[2] >> 8].y2 = 0;\n        gSprites[data[2] & 0xFF].y2 = 0;\n        gSprites[data[3] >> 8].y2 = 0;\n        gSprites[data[3] & 0xFF].y2 = 0;\n        gSprites[data[4] >> 8].y2 = 0;\n        gSprites[data[4] & 0xFF].y2 = 0;\n        break;\n    case 1:\n    case 3:\n        sprite->y2 = 1;\n        gSprites[data[0] >> 8].y2 = 1;\n        gSprites[data[0] & 0xFF].y2 = 1;\n        gSprites[data[1] >> 8].y2 = 1;\n        gSprites[data[1] & 0xFF].y2 = 1;\n        gSprites[data[2] >> 8].y2 = 1;\n        gSprites[data[2] & 0xFF].y2 = 1;\n        gSprites[data[3] >> 8].y2 = 1;\n        gSprites[data[3] & 0xFF].y2 = 1;\n        gSprites[data[4] >> 8].y2 = 1;\n        gSprites[data[4] & 0xFF].y2 = 1;\n        break;\n    case 2:\n        sprite->y2 = 2;\n        gSprites[data[0] >> 8].y2 = 2;\n        gSprites[data[0] & 0xFF].y2 = 2;\n        gSprites[data[1] >> 8].y2 = 2;\n        gSprites[data[1] & 0xFF].y2 = 2;\n        gSprites[data[2] >> 8].y2 = 2;\n        gSprites[data[4] & 0xFF].y2 = 2;\n        break;\n    }",
  },
  "SpriteCB_DuoFight_Groudon": {
    lineCount: 32,
    bodyC: "s16 *data = sprite->data;\n    data[5]++;\n    data[5] &= 0xF;\n    if (!(data[5] & 7) && sprite->x != 72)\n    {\n        sprite->x--;\n        gSprites[sprite->sGroudonBodySpriteId].x--;\n        gSprites[sGroudonShoulderSpriteId].x--;\n        gSprites[sGroudonClawSpriteId].x--;\n    }\n\n    switch (sprite->animCmdIndex)\n    {\n    case 0:\n        gSprites[sGroudonShoulderSpriteId].x2 = 0;\n        gSprites[sGroudonShoulderSpriteId].y2 = 0;\n        gSprites[sGroudonClawSpriteId].x2 = 0;\n        gSprites[sGroudonClawSpriteId].y2 = 0;\n        break;\n    case 1:\n    case 3:\n        gSprites[sGroudonShoulderSpriteId].x2 = -1;\n        gSprites[sGroudonShoulderSpriteId].y2 = 0;\n        gSprites[sGroudonClawSpriteId].x2 = -1;\n        gSprites[sGroudonClawSpriteId].y2 = 0;\n        break;\n    case 2:\n        gSprites[sGroudonShoulderSpriteId].x2 = -1;\n        gSprites[sGroudonShoulderSpriteId].y2 = 1;\n        gSprites[sGroudonClawSpriteId].x2 = -2;\n        gSprites[sGroudonClawSpriteId].y2 = 1;\n        break;\n    }",
  },
  "SpriteCB_DuoFight_Kyogre": {
    lineCount: 56,
    bodyC: "s16 *data = sprite->data;\n    data[5]++;\n    data[5] &= 0xF;\n    if (!(data[5] & 7) && sprite->x != 152)\n    {\n        sprite->x++;\n        gSprites[sprite->data[0] >> 8].x++;\n        gSprites[sprite->data[0] & 0xFF].x++;\n        gSprites[data[1] >> 8].x++;\n        gSprites[data[1] & 0xFF].x++;\n        gSprites[data[2] >> 8].x++;\n        gSprites[data[2] & 0xFF].x++;\n        gSprites[data[3] >> 8].x++;\n        gSprites[data[3] & 0xFF].x++;\n        gSprites[data[4] >> 8].x++;\n        gSprites[data[4] & 0xFF].x++;\n    }\n\n    switch (gSprites[data[2] & 0xFF].animCmdIndex)\n    {\n    case 0:\n        sprite->y2 = 0;\n        gSprites[data[0] >> 8].y2 = 0;\n        gSprites[data[0] & 0xFF].y2 = 0;\n        gSprites[data[1] >> 8].y2 = 0;\n        gSprites[data[1] & 0xFF].y2 = 0;\n        gSprites[data[2] >> 8].y2 = 0;\n        gSprites[data[2] & 0xFF].y2 = 0;\n        gSprites[data[3] >> 8].y2 = 0;\n        gSprites[data[3] & 0xFF].y2 = 0;\n        gSprites[data[4] >> 8].y2 = 0;\n        gSprites[data[4] & 0xFF].y2 = 0;\n        break;\n    case 1:\n    case 3:\n        sprite->y2 = 1;\n        gSprites[data[0] >> 8].y2 = 1;\n        gSprites[data[0] & 0xFF].y2 = 1;\n        gSprites[data[1] >> 8].y2 = 1;\n        gSprites[data[1] & 0xFF].y2 = 1;\n        gSprites[data[2] >> 8].y2 = 1;\n        gSprites[data[2] & 0xFF].y2 = 1;\n        gSprites[data[3] >> 8].y2 = 1;\n        gSprites[data[3] & 0xFF].y2 = 1;\n        gSprites[data[4] >> 8].y2 = 1;\n        gSprites[data[4] & 0xFF].y2 = 1;\n        break;\n    case 2:\n        sprite->y2 = 2;\n        gSprites[data[0] >> 8].y2 = 2;\n        gSprites[data[0] & 0xFF].y2 = 2;\n        gSprites[data[1] >> 8].y2 = 2;\n        gSprites[data[1] & 0xFF].y2 = 2;\n        gSprites[data[2] >> 8].y2 = 2;\n        gSprites[data[4] & 0xFF].y2 = 2;\n        break;\n    }",
  },
  "SpriteCB_TakesFlight_Smoke": {
    lineCount: 12,
    bodyC: "if (sprite->sTimer == 0)\n    {\n        sprite->x2 = 0;\n        sprite->y2 = 0;\n    }\n    else\n    {\n        sprite->x2 += sTakesFlight_SmokeCoords[sprite->sSmokeId][0];\n        sprite->y2 += sTakesFlight_SmokeCoords[sprite->sSmokeId][1];\n    }\n\n    sprite->sTimer++;\n    sprite->sTimer &= 0xF;",
  },
  "SpriteCB_Descends_Rayquaza": {
    lineCount: 48,
    bodyC: "s16 *data = sprite->data;\n    s16 frame = sTimer;\n\n     \n     \n    if (frame == 0)\n    {\n        sXMovePeriod = 12;\n        sYMovePeriod = 8;\n    }\n    else if (frame == 256)\n    {\n        sXMovePeriod = 9;\n        sYMovePeriod = 7;\n    }\n    else if (frame == 268)\n    {\n        sXMovePeriod = 8;\n        sYMovePeriod = 6;\n    }\n    else if (frame == 280)\n    {\n        sXMovePeriod = 7;\n        sYMovePeriod = 5;\n    }\n    else if (frame == 292)\n    {\n        sXMovePeriod = 6;\n        sYMovePeriod = 4;\n    }\n    else if (frame == 304)\n    {\n        sXMovePeriod = 5;\n        sYMovePeriod = 3;\n    }\n    else if (frame == 320)\n    {\n        sXMovePeriod = 4;\n        sYMovePeriod = 2;\n    }\n\n    if (sTimer % sXMovePeriod == 0)\n    {\n        sprite->x2--;\n        gSprites[sTailSpriteId].x2--;\n    }\n    if (sTimer % sYMovePeriod == 0)\n    {\n        sprite->y2++;\n        gSprites[sTailSpriteId].y2++;\n    }\n\n    sTimer++;",
  },
  "SpriteCB_ChasesAway_DuoRingPush": {
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 25,
    bodyC: "if ((sprite->sTimer & 7) == 0)\n    {\n        if (!sprite->sIsKyogre)\n        {\n            sprite->x -= sprite->sSpeed;\n            gSprites[sprite->sBodyPartSpriteId1].x -= sprite->sSpeed;\n        }\n        else\n        {\n            sprite->x += sprite->sSpeed;\n            gSprites[sprite->sBodyPartSpriteId1].x += sprite->sSpeed;\n            gSprites[sprite->sBodyPartSpriteId2].x += sprite->sSpeed;\n        }\n\n        sprite->sDecel++;\n        sprite->sSpeed -= sprite->sDecel;\n        if (sprite->sDecel == 3)\n        {\n            sprite->sTimer = 0;\n            sprite->sDecel = 0;\n            sprite->sSpeed = 0;\n            sprite->callback = SpriteCallbackDummy;\n            return;\n        }\n    }\n\n    sprite->sTimer++;",
  },
  "SpriteCB_ChasesAway_GroudonLeave": {
    lineCount: 21,
    bodyC: "switch (sprite->animCmdIndex)\n    {\n    case 0:\n    case 2:\n        if (sprite->animDelayCounter % 12 == 0)\n        {\n            sprite->x -= 2;\n            gSprites[sprite->data[0]].x -=2;\n        }\n        gSprites[sprite->data[0]].y2 = 0;\n        break;\n    case 1:\n    case 3:\n        gSprites[sprite->data[0]].y2 = -2;\n        if ((sprite->animDelayCounter & 15) == 0)\n        {\n            sprite->y++;\n            gSprites[sprite->data[0]].y++;\n        }\n        break;\n    }",
  },
  "SpriteCB_ChasesAway_KyogreLeave": {
    callsTo: ["CreateSprite","PlaySE"],
    lineCount: 31,
    bodyC: "if ((sprite->data[4] & 3) == 0)\n    {\n        if (sprite->x2 == 1)\n            sprite->x2 = -1;\n        else\n            sprite->x2 = 1;\n    }\n    if (sprite->data[5] == 128)\n    {\n        sprite->data[7] = CreateSprite(&sSpriteTemplate_ChasesAway_KyogreSplash, 152, 132, 0);\n        gSprites[sprite->data[7]].oam.priority = 1;\n        sprite->data[7] = CreateSprite(&sSpriteTemplate_ChasesAway_KyogreSplash, 224, 132, 0);\n        gSprites[sprite->data[7]].oam.priority = 1;\n        gSprites[sprite->data[7]].hFlip = 1;\n        sprite->data[5]++;\n    }\n    if (sprite->data[5] > 127)\n    {\n        if (sprite->y2 != 32)\n        {\n            sprite->data[6]++;\n            sprite->y2 = sprite->data[6] >> 4;\n        }\n    }\n    else\n    {\n        sprite->data[5]++;\n    }\n\n    if (sprite->data[4] % 64 == 0)\n        PlaySE(SE_M_WHIRLPOOL);\n\n    sprite->data[4]++;",
  },
  "SpriteCB_ChasesAway_Rayquaza": {
    callsTo: ["ChasesAway_PushDuoBack","ChasesAway_SetRayquazaAnim","CreateTask","FindTaskIdByFunc","PlayCry_Normal","PlaySE","SpriteCB_ChasesAway_RayquazaFloat"],
    spriteTransitions: ["SpriteCB_ChasesAway_RayquazaFloat"],
    lineCount: 63,
    bodyC: "s16 frame = sprite->sTimer;\n    if (frame <= 64)\n    {\n        sprite->y2 += 2;\n        gSprites[sprite->sTailSpriteId].y2 += 2;\n        if (sprite->sTimer == 64)\n        {\n            ChasesAway_SetRayquazaAnim(sprite, 1, 0, -48);\n            sprite->sYOffset = 5;\n            sprite->sYOffsetDir = -1;\n            gSprites[sprite->sTailSpriteId].sTailFloatDelay = 3;\n            gSprites[sprite->sTailSpriteId].sTailFloatPeak = 5;\n        }\n    }\n    else if (frame <= 111)\n    {\n        SpriteCB_ChasesAway_RayquazaFloat(sprite);\n        if (sprite->sYOffset == 0)\n            PlaySE(SE_MUGSHOT);\n        if (sprite->sYOffset == -3)\n            ChasesAway_SetRayquazaAnim(sprite, 2, 48, 16);\n    }\n    else if (frame == 112)\n    {\n        gSprites[sprite->sTailSpriteId].sTailFloatDelay = 7;\n        gSprites[sprite->sTailSpriteId].sTailFloatPeak = 3;\n        SpriteCB_ChasesAway_RayquazaFloat(sprite);\n    }\n    else if (frame <= 327)\n    {\n        SpriteCB_ChasesAway_RayquazaFloat(sprite);\n    }\n    else if (frame == 328)\n    {\n        SpriteCB_ChasesAway_RayquazaFloat(sprite);\n        ChasesAway_SetRayquazaAnim(sprite, 3, 48, 16);\n        sprite->x2 = 1;\n        gSprites[sprite->sTailSpriteId].x2 = 1;\n        PlayCry_Normal(SPECIES_RAYQUAZA, 0);\n        CreateTask(Task_ChasesAway_AnimateRing, 0);\n    }\n    else\n    {\n        switch (frame)\n        {\n        case 376:\n            sprite->x2 = 0;\n            gSprites[sprite->sTailSpriteId].x2 = 0;\n            SpriteCB_ChasesAway_RayquazaFloat(sprite);\n            ChasesAway_SetRayquazaAnim(sprite, 2, 48, 16);\n            sprite->callback = SpriteCB_ChasesAway_RayquazaFloat;\n            return;\n        case 352:\n            ChasesAway_PushDuoBack(FindTaskIdByFunc(Task_HandleRayChasesAway));\n            break;\n        }\n    }\n\n    if (sprite->sTimer > 328 && (sprite->sTimer & 1) == 0)\n    {\n        sprite->x2 *= -1;\n        gSprites[sprite->sTailSpriteId].x2 = sprite->x2;\n    }\n\n    sprite->sTimer++;",
  },
  "SpriteCB_ChasesAway_RayquazaFloat": {
    lineCount: 16,
    bodyC: "struct Sprite *tail = &gSprites[body->sTailSpriteId];\n    if (!(body->sFloatTimer & tail->sTailFloatDelay))\n    {\n        body->y2 += body->sYOffset;\n        gSprites[body->sTailSpriteId].y2 += body->sYOffset;  \n        body->sYOffset += body->sYOffsetDir;\n        if (body->sYOffset >= tail->sTailFloatPeak || body->sYOffset <= -tail->sTailFloatPeak)\n        {\n            if (body->sYOffset > tail->sTailFloatPeak)\n                body->sYOffset = tail->sTailFloatPeak;\n            else if (body->sYOffset < -tail->sTailFloatPeak)\n                body->sYOffset = -tail->sTailFloatPeak;\n\n            body->sYOffsetDir *= -1;\n        }\n    }\n\n    body->sFloatTimer++;",
  },
} as const;
