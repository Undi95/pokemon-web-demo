// AUTO-GENERATED from src/scanline_effect.c by extract-engine-helpers.mjs
// Do not edit — re-run `node scripts/extract-engine-helpers.mjs` to refresh.
//
// Generated: 2026-04-27
// Functions: 9

export const ENGINE_FUNCTIONS = {
  "CopyValue16Bit": {
    returnType: "static void",
    params: "void",
    lineCount: 3,
    bodyC: "vu16 *dest = (vu16 *)gScanlineEffect.dmaDest;\n    vu16 *src = (vu16 *)&gScanlineEffectRegBuffers[gScanlineEffect.srcBuffer];\n\n    *dest = *src;",
  },
  "CopyValue32Bit": {
    returnType: "static void",
    params: "void",
    lineCount: 3,
    bodyC: "vu32 *dest = (vu32 *)gScanlineEffect.dmaDest;\n    vu32 *src = (vu32 *)&gScanlineEffectRegBuffers[gScanlineEffect.srcBuffer];\n\n    *dest = *src;",
  },
  "GenerateWave": {
    returnType: "static void",
    params: "u16 *buffer, u8 frequency, u8 amplitude, u8 unused",
    lineCount: 8,
    bodyC: "u16 i = 0;\n    u8 theta = 0;\n\n    while (i < 256)\n    {\n        buffer[i] = (gSineTable[theta] * amplitude) / 256;\n        theta += frequency;\n        i++;\n    }",
  },
  "ScanlineEffect_Clear": {
    returnType: "void",
    params: "void",
    callsTo: ["CpuFill16"],
    lineCount: 10,
    bodyC: "CpuFill16(0, gScanlineEffectRegBuffers, sizeof(gScanlineEffectRegBuffers));\n    gScanlineEffect.dmaSrcBuffers[0] = NULL;\n    gScanlineEffect.dmaSrcBuffers[1] = NULL;\n    gScanlineEffect.dmaDest = NULL;\n    gScanlineEffect.dmaControl = 0;\n    gScanlineEffect.srcBuffer = 0;\n    gScanlineEffect.state = 0;\n    gScanlineEffect.unused16 = 0;\n    gScanlineEffect.unused17 = 0;\n    gScanlineEffect.waveTaskId = TASK_NONE;",
  },
  "ScanlineEffect_InitHBlankDmaTransfer": {
    returnType: "void",
    params: "void",
    callsTo: ["DmaSet","DmaStop","setFirstScanlineReg"],
    lineCount: 17,
    bodyC: "if (gScanlineEffect.state == 0)\n    {\n        return;\n    }\n    else if (gScanlineEffect.state == 3)\n    {\n        gScanlineEffect.state = 0;\n        DmaStop(0);\n        sShouldStopWaveTask = TRUE;\n    }\n    else\n    {\n        DmaStop(0);\n         \n         \n         \n        DmaSet(0, gScanlineEffect.dmaSrcBuffers[gScanlineEffect.srcBuffer], gScanlineEffect.dmaDest, gScanlineEffect.dmaControl);\n         \n        gScanlineEffect.setFirstScanlineReg();\n         \n        gScanlineEffect.srcBuffer ^= 1;\n    }",
  },
  "ScanlineEffect_InitWave": {
    returnType: "u8",
    params: "u8 startLine, u8 endLine, u8 frequency, u8 amplitude, u8 delayInterval, u8 regOffset, bool8 applyBattleBgOffsets",
    callsTo: ["CreateTask","GenerateWave","ScanlineEffect_Clear","ScanlineEffect_SetParams"],
    lineCount: 30,
    bodyC: "int i;\n    int offset;\n    struct ScanlineEffectParams params;\n    u8 taskId;\n\n    ScanlineEffect_Clear();\n\n    params.dmaDest = (void *)(REG_ADDR_BG0HOFS + regOffset);\n    params.dmaControl = SCANLINE_EFFECT_DMACNT_16BIT;\n    params.initState = 1;\n    params.unused9 = 0;\n    ScanlineEffect_SetParams(params);\n\n    taskId = CreateTask(TaskFunc_UpdateWavePerFrame, 0);\n\n    gTasks[taskId].tStartLine            = startLine;\n    gTasks[taskId].tEndLine              = endLine;\n    gTasks[taskId].tWaveLength           = 256 / frequency;\n    gTasks[taskId].tSrcBufferOffset      = 0;\n    gTasks[taskId].tFramesUntilMove      = delayInterval;\n    gTasks[taskId].tDelayInterval        = delayInterval;\n    gTasks[taskId].tRegOffset            = regOffset;\n    gTasks[taskId].tApplyBattleBgOffsets = applyBattleBgOffsets;\n\n    gScanlineEffect.waveTaskId = taskId;\n    sShouldStopWaveTask = FALSE;\n\n    GenerateWave(&gScanlineEffectRegBuffers[0][320], frequency, amplitude, endLine - startLine);\n\n    offset = 320;\n    for (i = startLine; i < endLine; i++)\n    {\n        gScanlineEffectRegBuffers[0][i] = gScanlineEffectRegBuffers[0][offset];\n        gScanlineEffectRegBuffers[1][i] = gScanlineEffectRegBuffers[0][offset];\n        offset++;\n    }\n\n    return taskId;",
  },
  "ScanlineEffect_SetParams": {
    returnType: "void",
    params: "struct ScanlineEffectParams params",
    lineCount: 17,
    bodyC: "if (params.dmaControl == SCANLINE_EFFECT_DMACNT_16BIT)   \n    {\n         \n         \n        gScanlineEffect.dmaSrcBuffers[0] = (u16 *)gScanlineEffectRegBuffers[0] + 1;\n        gScanlineEffect.dmaSrcBuffers[1] = (u16 *)gScanlineEffectRegBuffers[1] + 1;\n        gScanlineEffect.setFirstScanlineReg = CopyValue16Bit;\n    }\n    else   \n    {\n         \n         \n        gScanlineEffect.dmaSrcBuffers[0] = (u32 *)gScanlineEffectRegBuffers[0] + 1;\n        gScanlineEffect.dmaSrcBuffers[1] = (u32 *)gScanlineEffectRegBuffers[1] + 1;\n        gScanlineEffect.setFirstScanlineReg = CopyValue32Bit;\n    }\n\n    gScanlineEffect.dmaControl = params.dmaControl;\n    gScanlineEffect.dmaDest    = params.dmaDest;\n    gScanlineEffect.state      = params.initState;\n    gScanlineEffect.unused16   = params.unused9;\n    gScanlineEffect.unused17   = params.unused9;",
  },
  "ScanlineEffect_Stop": {
    returnType: "void",
    params: "void",
    callsTo: ["DestroyTask","DmaStop"],
    lineCount: 7,
    bodyC: "gScanlineEffect.state = 0;\n    DmaStop(0);\n    if (gScanlineEffect.waveTaskId != TASK_NONE)\n    {\n        DestroyTask(gScanlineEffect.waveTaskId);\n        gScanlineEffect.waveTaskId = TASK_NONE;\n    }",
  },
  "TaskFunc_UpdateWavePerFrame": {
    returnType: "static void",
    params: "u8 taskId",
    callsTo: ["DestroyTask"],
    lineCount: 64,
    bodyC: "int value = 0;\n    int i;\n    int offset;\n\n    if (sShouldStopWaveTask)\n    {\n        DestroyTask(taskId);\n        gScanlineEffect.waveTaskId = TASK_NONE;\n    }\n    else\n    {\n        if (gTasks[taskId].tApplyBattleBgOffsets)\n        {\n            switch (gTasks[taskId].tRegOffset)\n            {\n            case SCANLINE_EFFECT_REG_BG0HOFS:\n                value = gBattle_BG0_X;\n                break;\n            case SCANLINE_EFFECT_REG_BG0VOFS:\n                value = gBattle_BG0_Y;\n                break;\n            case SCANLINE_EFFECT_REG_BG1HOFS:\n                value = gBattle_BG1_X;\n                break;\n            case SCANLINE_EFFECT_REG_BG1VOFS:\n                value = gBattle_BG1_Y;\n                break;\n            case SCANLINE_EFFECT_REG_BG2HOFS:\n                value = gBattle_BG2_X;\n                break;\n            case SCANLINE_EFFECT_REG_BG2VOFS:\n                value = gBattle_BG2_Y;\n                break;\n            case SCANLINE_EFFECT_REG_BG3HOFS:\n                value = gBattle_BG3_X;\n                break;\n            case SCANLINE_EFFECT_REG_BG3VOFS:\n                value = gBattle_BG3_Y;\n                break;\n            }\n        }\n        if (gTasks[taskId].tFramesUntilMove != 0)\n        {\n            gTasks[taskId].tFramesUntilMove--;\n            offset = gTasks[taskId].tSrcBufferOffset + 320;\n            for (i = gTasks[taskId].tStartLine; i < gTasks[taskId].tEndLine; i++)\n            {\n                gScanlineEffectRegBuffers[gScanlineEffect.srcBuffer][i] = gScanlineEffectRegBuffers[0][offset] + value;\n                offset++;\n            }\n        }\n        else\n        {\n            gTasks[taskId].tFramesUntilMove = gTasks[taskId].tDelayInterval;\n            offset = gTasks[taskId].tSrcBufferOffset + 320;\n            for (i = gTasks[taskId].tStartLine; i < gTasks[taskId].tEndLine; i++)\n            {\n                gScanlineEffectRegBuffers[gScanlineEffect.srcBuffer][i] = gScanlineEffectRegBuffers[0][offset] + value;\n                offset++;\n            }\n\n             \n            gTasks[taskId].tSrcBufferOffset++;\n            if (gTasks[taskId].tSrcBufferOffset == gTasks[taskId].tWaveLength)\n                gTasks[taskId].tSrcBufferOffset = 0;\n        }\n    }",
  },
} as const;
