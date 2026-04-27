// AUTO-GENERATED from src/diploma.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 3 Task_, 1 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_DiplomaFadeIn": {
    taskTransitions: ["Task_DiplomaWaitForKeyPress"],
    externalChecks: { paletteFade: true },
    lineCount: 2,
    bodyC: "if (!gPaletteFade.active)\n        gTasks[taskId].func = Task_DiplomaWaitForKeyPress;",
  },
  "Task_DiplomaWaitForKeyPress": {
    callsTo: ["BeginNormalPaletteFade","JOY_NEW"],
    taskTransitions: ["Task_DiplomaFadeOut"],
    lineCount: 5,
    bodyC: "if (JOY_NEW(A_BUTTON | B_BUTTON))\n    {\n        BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);\n        gTasks[taskId].func = Task_DiplomaFadeOut;\n    }",
  },
  "Task_DiplomaFadeOut": {
    callsTo: ["DestroyTask","Free","FreeAllWindowBuffers","SetMainCallback2"],
    cb2Transitions: ["CB2_ReturnToFieldFadeFromBlack"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 7,
    bodyC: "if (!gPaletteFade.active)\n    {\n        Free(sDiplomaTilemapPtr);\n        FreeAllWindowBuffers();\n        DestroyTask(taskId);\n        SetMainCallback2(CB2_ReturnToFieldFadeFromBlack);\n    }",
  },
} as const;

export const CB2S = {
  "CB2_ShowDiploma": {
    callsTo: ["Alloc","BG_PLTT_ID","BeginNormalPaletteFade","BlendPalettes","CopyBgTilemapBufferToVram","CreateTask","DecompressAndCopyTileDataToVram","DisplayDiplomaText","DmaFill16","DmaFill32","EnableInterrupts","FreeAllSpritePalettes","FreeTempTileDataBuffersIfPossible","InitDiplomaBg","InitDiplomaWindow","LZDecompressWram","LoadPalette","ResetPaletteFade","ResetSpriteData","ResetTasks","ResetTempTileDataBuffers","ScanlineEffect_Stop","SetGpuReg","SetMainCallback2","SetVBlankCallback"],
    cb2Transitions: ["MainCB2"],
    lineCount: 39,
    bodyC: "SetVBlankCallback(NULL);\n    SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_MODE_0);\n    SetGpuReg(REG_OFFSET_BG3CNT, 0);\n    SetGpuReg(REG_OFFSET_BG2CNT, 0);\n    SetGpuReg(REG_OFFSET_BG1CNT, 0);\n    SetGpuReg(REG_OFFSET_BG0CNT, 0);\n    SetGpuReg(REG_OFFSET_BG3HOFS, 0);\n    SetGpuReg(REG_OFFSET_BG3VOFS, 0);\n    SetGpuReg(REG_OFFSET_BG2HOFS, 0);\n    SetGpuReg(REG_OFFSET_BG2VOFS, 0);\n    SetGpuReg(REG_OFFSET_BG1HOFS, 0);\n    SetGpuReg(REG_OFFSET_BG1VOFS, 0);\n    SetGpuReg(REG_OFFSET_BG0HOFS, 0);\n    SetGpuReg(REG_OFFSET_BG0VOFS, 0);\n     \n    DmaFill16(3, 0, VRAM, VRAM_SIZE);\n    DmaFill32(3, 0, OAM, OAM_SIZE);\n    DmaFill16(3, 0, PLTT, PLTT_SIZE);\n    ScanlineEffect_Stop();\n    ResetTasks();\n    ResetSpriteData();\n    ResetPaletteFade();\n    FreeAllSpritePalettes();\n    LoadPalette(sDiplomaPalettes, BG_PLTT_ID(0), sizeof(sDiplomaPalettes));\n    sDiplomaTilemapPtr = Alloc(0x1000);\n    InitDiplomaBg();\n    InitDiplomaWindow();\n    ResetTempTileDataBuffers();\n    DecompressAndCopyTileDataToVram(1, &sDiplomaTiles, 0, 0, 0);\n    while (FreeTempTileDataBuffersIfPossible())\n        ;\n    LZDecompressWram(sDiplomaTilemap, sDiplomaTilemapPtr);\n    CopyBgTilemapBufferToVram(1);\n    DisplayDiplomaText();\n    BlendPalettes(PALETTES_ALL, 16, RGB_BLACK);\n    BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK);\n    EnableInterrupts(1);\n    SetVBlankCallback(VBlankCB);\n    SetMainCallback2(MainCB2);\n    CreateTask(Task_DiplomaFadeIn, 0);",
  },
} as const;
