// AUTO-GENERATED from src/evolution_graphics.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 17 Task_, 0 CB2_, 6 SpriteCB_

export const TASKS = {
  "Task_Sparkles_SpiralUpward_Init": {
    callsTo: ["BeginNormalPaletteFade","PlaySE","SetEvoSparklesMatrices"],
    taskTransitions: ["Task_Sparkles_SpiralUpward"],
    dataReads: ["tPalNum"],
    dataWrites: ["tTimer"],
    lineCount: 5,
    bodyC: "SetEvoSparklesMatrices();\n    gTasks[taskId].tTimer = 0;\n    BeginNormalPaletteFade(3 << gTasks[taskId].tPalNum, 0xA, 0, 0x10, RGB_WHITE);\n    gTasks[taskId].func = Task_Sparkles_SpiralUpward;\n    PlaySE(SE_M_MEGA_KICK);",
  },
  "Task_Sparkles_SpiralUpward": {
    callsTo: ["CreateSparkle_SpiralUpward"],
    taskTransitions: ["Task_Sparkles_SpiralUpward_End"],
    dataReads: ["tTimer"],
    dataWrites: ["tTimer"],
    lineCount: 15,
    bodyC: "if (gTasks[taskId].tTimer < 64)\n    {\n        if (!(gTasks[taskId].tTimer & 7))\n        {\n            u8 i;\n            for (i = 0; i < 4; i++)\n                CreateSparkle_SpiralUpward((gTasks[taskId].tTimer & 120) * 2 + i * 64);\n        }\n        gTasks[taskId].tTimer++;\n    }\n    else\n    {\n        gTasks[taskId].tTimer = 96;\n        gTasks[taskId].func = Task_Sparkles_SpiralUpward_End;\n    }",
  },
  "Task_Sparkles_SpiralUpward_End": {
    callsTo: ["DestroyTask"],
    dataReads: ["tTimer"],
    dataWrites: ["tTimer"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 4,
    bodyC: "if (gTasks[taskId].tTimer != 0)\n        gTasks[taskId].tTimer--;\n    else\n        DestroyTask(taskId);",
  },
  "Task_Sparkles_ArcDown_Init": {
    callsTo: ["PlaySE","SetEvoSparklesMatrices"],
    taskTransitions: ["Task_Sparkles_ArcDown"],
    dataWrites: ["tTimer"],
    lineCount: 4,
    bodyC: "SetEvoSparklesMatrices();\n    gTasks[taskId].tTimer = 0;\n    gTasks[taskId].func = Task_Sparkles_ArcDown;\n    PlaySE(SE_M_BUBBLE_BEAM2);",
  },
  "Task_Sparkles_ArcDown": {
    callsTo: ["CreateSparkle_ArcDown"],
    taskTransitions: ["Task_Sparkles_ArcDown_End"],
    dataReads: ["tTimer"],
    dataWrites: ["tTimer"],
    lineCount: 14,
    bodyC: "if (gTasks[taskId].tTimer < 96)\n    {\n        if (gTasks[taskId].tTimer < 6)\n        {\n            u8 i;\n            for (i = 0; i < 9; i++)\n                CreateSparkle_ArcDown(i * 16);\n        }\n        gTasks[taskId].tTimer++;\n    }\n    else\n    {\n        gTasks[taskId].func = Task_Sparkles_ArcDown_End;\n    }",
  },
  "Task_Sparkles_ArcDown_End": {
    callsTo: ["DestroyTask"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 1,
    bodyC: "DestroyTask(taskId);",
  },
  "Task_Sparkles_CircleInward_Init": {
    callsTo: ["PlaySE","SetEvoSparklesMatrices"],
    taskTransitions: ["Task_Sparkles_CircleInward"],
    dataWrites: ["tTimer"],
    lineCount: 4,
    bodyC: "SetEvoSparklesMatrices();\n    gTasks[taskId].tTimer = 0;\n    gTasks[taskId].func = Task_Sparkles_CircleInward;\n    PlaySE(SE_SHINY);",
  },
  "Task_Sparkles_CircleInward": {
    callsTo: ["CreateSparkle_CircleInward"],
    taskTransitions: ["Task_Sparkles_CircleInward_End"],
    dataReads: ["tTimer"],
    dataWrites: ["tTimer"],
    lineCount: 20,
    bodyC: "if (gTasks[taskId].tTimer < 48)\n    {\n        if (gTasks[taskId].tTimer == 0)\n        {\n            u8 i;\n            for (i = 0; i < 16; i++)\n                CreateSparkle_CircleInward(i * 16, 4);\n        }\n        if (gTasks[taskId].tTimer == 32)\n        {\n            u8 i;\n            for (i = 0; i < 16; i++)\n                CreateSparkle_CircleInward(i * 16, 8);\n        }\n        gTasks[taskId].tTimer++;\n    }\n    else\n    {\n        gTasks[taskId].func = Task_Sparkles_CircleInward_End;\n    }",
  },
  "Task_Sparkles_CircleInward_End": {
    callsTo: ["DestroyTask"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 1,
    bodyC: "DestroyTask(taskId);",
  },
  "Task_Sparkles_SprayAndFlash_Init": {
    callsTo: ["BG_PLTT_ID","BeginNormalPaletteFade","CpuCopy16","PlaySE","SetEvoSparklesMatrices"],
    taskTransitions: ["Task_Sparkles_SprayAndFlash"],
    dataWrites: ["tTimer"],
    lineCount: 6,
    bodyC: "SetEvoSparklesMatrices();\n    gTasks[taskId].tTimer = 0;\n    CpuCopy16(&gPlttBufferFaded[BG_PLTT_ID(2)], &gPlttBufferUnfaded[BG_PLTT_ID(2)], 3 * PLTT_SIZE_4BPP);\n    BeginNormalPaletteFade(0xFFF9041C, 0, 0, 0x10, RGB_WHITE);  \n    gTasks[taskId].func = Task_Sparkles_SprayAndFlash;\n    PlaySE(SE_M_PETAL_DANCE);",
  },
  "Task_Sparkles_SprayAndFlash": {
    callsTo: ["BeginNormalPaletteFade","CreateSparkle_Spray","Random"],
    taskTransitions: ["Task_Sparkles_SprayAndFlash_End"],
    dataReads: ["tTimer"],
    dataWrites: ["tTimer"],
    lineCount: 23,
    bodyC: "if (gTasks[taskId].tTimer < 128)\n    {\n        u8 i;\n        switch (gTasks[taskId].tTimer)\n        {\n        default:\n            if (gTasks[taskId].tTimer < 50)\n                CreateSparkle_Spray(Random() & 7);\n            break;\n        case 0:\n            for (i = 0; i < 8; i++)\n                CreateSparkle_Spray(i);\n            break;\n        case 32:\n            BeginNormalPaletteFade(0xFFFF041C, 0x10, 0x10, 0, RGB_WHITE);  \n            break;\n        }\n        gTasks[taskId].tTimer++;\n    }\n    else\n    {\n        gTasks[taskId].func = Task_Sparkles_SprayAndFlash_End;\n    }",
  },
  "Task_Sparkles_SprayAndFlash_End": {
    callsTo: ["DestroyTask"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 2,
    bodyC: "if (!gPaletteFade.active)\n        DestroyTask(taskId);",
  },
  "Task_Sparkles_SprayAndFlashTrade_Init": {
    callsTo: ["BG_PLTT_ID","BeginNormalPaletteFade","CpuCopy16","PlaySE","SetEvoSparklesMatrices"],
    taskTransitions: ["Task_Sparkles_SprayAndFlashTrade"],
    dataWrites: ["tTimer"],
    lineCount: 6,
    bodyC: "SetEvoSparklesMatrices();\n    gTasks[taskId].tTimer = 0;\n    CpuCopy16(&gPlttBufferFaded[BG_PLTT_ID(2)], &gPlttBufferUnfaded[BG_PLTT_ID(2)], 3 * PLTT_SIZE_4BPP);\n    BeginNormalPaletteFade(0xFFF90400, 0, 0, 0x10, RGB_WHITE);  \n    gTasks[taskId].func = Task_Sparkles_SprayAndFlashTrade;\n    PlaySE(SE_M_PETAL_DANCE);",
  },
  "Task_Sparkles_SprayAndFlashTrade": {
    callsTo: ["BeginNormalPaletteFade","CreateSparkle_Spray","Random"],
    taskTransitions: ["Task_Sparkles_SprayAndFlash_End"],
    dataReads: ["tTimer"],
    dataWrites: ["tTimer"],
    lineCount: 23,
    bodyC: "if (gTasks[taskId].tTimer < 128)\n    {\n        u8 i;\n        switch (gTasks[taskId].tTimer)\n        {\n        default:\n            if (gTasks[taskId].tTimer < 50)\n                CreateSparkle_Spray(Random() & 7);\n            break;\n        case 0:\n            for (i = 0; i < 8; i++)\n                CreateSparkle_Spray(i);\n            break;\n        case 32:\n            BeginNormalPaletteFade(0xFFFF0400, 0x10, 0x10, 0, RGB_WHITE);  \n            break;\n        }\n        gTasks[taskId].tTimer++;\n    }\n    else\n    {\n        gTasks[taskId].func = Task_Sparkles_SprayAndFlash_End;\n    }",
  },
  "Task_CycleEvolutionMonSprite_Init": {
    taskTransitions: ["Task_CycleEvolutionMonSprite_TryEnd"],
    dataWrites: ["tScaleSpeed","tShowingPostEvo"],
    lineCount: 3,
    bodyC: "gTasks[taskId].tShowingPostEvo = FALSE;\n    gTasks[taskId].tScaleSpeed = 8;\n    gTasks[taskId].func = Task_CycleEvolutionMonSprite_TryEnd;",
  },
  "Task_CycleEvolutionMonSprite_TryEnd": {
    callsTo: ["EndOnPostEvoMon","EndOnPreEvoMon"],
    taskTransitions: ["Task_CycleEvolutionMonSprite_UpdateSize"],
    dataReads: ["tEvoStopped","tShowingPostEvo"],
    dataWrites: ["tScaleSpeed"],
    lineCount: 14,
    bodyC: "if (gTasks[taskId].tEvoStopped)\n    {\n        EndOnPreEvoMon(taskId);\n    }\n    else if (gTasks[taskId].tScaleSpeed == 128)\n    {\n        EndOnPostEvoMon(taskId);\n    }\n    else\n    {\n        gTasks[taskId].tScaleSpeed += 2;\n        gTasks[taskId].tShowingPostEvo ^= 1;\n        gTasks[taskId].func = Task_CycleEvolutionMonSprite_UpdateSize;\n    }",
  },
  "Task_CycleEvolutionMonSprite_UpdateSize": {
    callsTo: ["SetOamMatrix"],
    taskTransitions: ["EndOnPreEvoMon","Task_CycleEvolutionMonSprite_TryEnd"],
    dataReads: ["tEvoStopped","tPostEvoScale","tPreEvoScale","tScaleSpeed","tShowingPostEvo"],
    dataWrites: ["tPostEvoScale","tPreEvoScale"],
    lineCount: 57,
    bodyC: "if (gTasks[taskId].tEvoStopped)\n    {\n        gTasks[taskId].func = EndOnPreEvoMon;\n    }\n    else\n    {\n        u16 oamMatrixArg;\n        u8 numSpritesFinished = 0;\n        if (!gTasks[taskId].tShowingPostEvo)\n        {\n             \n            if (gTasks[taskId].tPreEvoScale < MON_MAX_SCALE - gTasks[taskId].tScaleSpeed)\n            {\n                gTasks[taskId].tPreEvoScale += gTasks[taskId].tScaleSpeed;\n            }\n            else\n            {\n                gTasks[taskId].tPreEvoScale = MON_MAX_SCALE;\n                numSpritesFinished++;\n            }\n\n             \n            if (gTasks[taskId].tPostEvoScale > MON_MIN_SCALE + gTasks[taskId].tScaleSpeed)\n            {\n                gTasks[taskId].tPostEvoScale  -= gTasks[taskId].tScaleSpeed;\n            }\n            else\n            {\n                gTasks[taskId].tPostEvoScale = MON_MIN_SCALE;\n                numSpritesFinished++;\n            }\n        }\n        else\n        {\n             \n            if (gTasks[taskId].tPostEvoScale < MON_MAX_SCALE - gTasks[taskId].tScaleSpeed)\n            {\n                gTasks[taskId].tPostEvoScale += gTasks[taskId].tScaleSpeed;\n            }\n            else\n            {\n                gTasks[taskId].tPostEvoScale = MON_MAX_SCALE;\n                numSpritesFinished++;\n            }\n\n             \n            if (gTasks[taskId].tPreEvoScale > MON_MIN_SCALE + gTasks[taskId].tScaleSpeed)\n            {\n                gTasks[taskId].tPreEvoScale  -= gTasks[taskId].tScaleSpeed;\n            }\n            else\n            {\n                gTasks[taskId].tPreEvoScale = MON_MIN_SCALE;\n                numSpritesFinished++;\n            }\n        }\n\n         \n        oamMatrixArg = 65536 / gTasks[taskId].tPreEvoScale;\n        SetOamMatrix(MATRIX_PRE_EVO, oamMatrixArg, 0, 0, oamMatrixArg);\n\n         \n        oamMatrixArg = 65536 / gTasks[taskId].tPostEvoScale;\n        SetOamMatrix(MATRIX_POST_EVO, oamMatrixArg, 0, 0, oamMatrixArg);\n\n         \n        if (numSpritesFinished == 2)\n            gTasks[taskId].func = Task_CycleEvolutionMonSprite_TryEnd;\n    }",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_Sparkle_Dummy": {
    lineCount: 0,
    bodyC: "",
  },
  "SpriteCB_Sparkle_SpiralUpward": {
    callsTo: ["Cos","DestroySprite","Sin"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 23,
    bodyC: "if (sprite->y > 8)\n    {\n        u8 matrixNum;\n\n        sprite->y = 88 - (sprite->sTimer * sprite->sTimer) / 80;\n        sprite->y2 = Sin((u8)sprite->sTrigIdx, sprite->sAmplitude) / 4;\n        sprite->x2 = Cos((u8)sprite->sTrigIdx, sprite->sAmplitude);\n        sprite->sTrigIdx += 4;\n        if (sprite->sTimer & 1)\n            sprite->sAmplitude--;\n        sprite->sTimer++;\n        if (sprite->y2 > 0)\n            sprite->subpriority = 1;\n        else\n            sprite->subpriority = 20;\n        matrixNum = sprite->sAmplitude / 4 + 20;\n        if (matrixNum > 31)\n            matrixNum = 31;\n        sprite->oam.matrixNum = matrixNum;\n    }\n    else\n    {\n        DestroySprite(sprite);\n    }",
  },
  "SpriteCB_Sparkle_ArcDown": {
    callsTo: ["Cos","DestroySprite","Sin"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 12,
    bodyC: "if (sprite->y < 88)\n    {\n        sprite->y = 8 + (sprite->sTimer * sprite->sTimer) / 5;\n        sprite->y2 = Sin((u8)sprite->sTrigIdx, sprite->sAmplitude) / 4;\n        sprite->x2 = Cos((u8)sprite->sTrigIdx, sprite->sAmplitude);\n        sprite->sAmplitude = 8 + Sin((u8)(sprite->sTimer * 4), 40);\n        sprite->sTimer++;\n    }\n    else\n    {\n        DestroySprite(sprite);\n    }",
  },
  "SpriteCB_Sparkle_CircleInward": {
    callsTo: ["Cos","DestroySprite","Sin"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 11,
    bodyC: "if (sprite->sAmplitude > 8)\n    {\n        sprite->y2 = Sin((u8)sprite->sTrigIdx, sprite->sAmplitude);\n        sprite->x2 = Cos((u8)sprite->sTrigIdx, sprite->sAmplitude);\n        sprite->sAmplitude -= sprite->sSpeed;\n        sprite->sTrigIdx += 4;\n    }\n    else\n    {\n        DestroySprite(sprite);\n    }",
  },
  "SpriteCB_Sparkle_Spray": {
    callsTo: ["DestroySprite","Sin"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 29,
    bodyC: "if (!(sprite->sTimer & 3))\n        sprite->y++;\n    if (sprite->sTrigIdx < 128)\n    {\n        u8 matrixNum;\n\n        sprite->y2 = -Sin((u8)sprite->sTrigIdx, sprite->sAmplitude);\n        sprite->x = (DISPLAY_WIDTH / 2) + (sprite->sSpeed * sprite->sTimer) / 3;\n        sprite->sTrigIdx++;\n        matrixNum = 31 - (sprite->sTrigIdx * 12 / 128);\n        if (sprite->sTrigIdx > 64)\n        {\n            sprite->subpriority = 1;\n        }\n        else\n        {\n            sprite->invisible = FALSE;\n            sprite->subpriority = 20;\n            if (sprite->sTrigIdx > 112 && sprite->sTrigIdx & 1)\n                sprite->invisible = TRUE;\n        }\n        if (matrixNum < 20)\n            matrixNum = 20;\n        sprite->oam.matrixNum = matrixNum;\n        sprite->sTimer++;\n    }\n    else\n    {\n        DestroySprite(sprite);\n    }",
  },
  "SpriteCB_EvolutionMonSprite": {
    lineCount: 0,
    bodyC: "",
  },
} as const;
