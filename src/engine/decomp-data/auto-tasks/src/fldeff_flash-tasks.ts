// AUTO-GENERATED from src/fldeff_flash.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 9 Task_, 2 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_ExitCaveTransition1": {
    taskTransitions: ["Task_ExitCaveTransition2"],
    lineCount: 1,
    bodyC: "gTasks[taskId].func = Task_ExitCaveTransition2;",
  },
  "Task_ExitCaveTransition2": {
    callsTo: ["BGCNT_CHARBASE","BGCNT_PRIORITY","BGCNT_SCREENBASE","BG_PLTT_ID","LZ77UnCompVram","LoadPalette","PLTT_SIZEOF","SetGpuReg"],
    taskTransitions: ["Task_ExitCaveTransition3"],
    dataWrites: ["data[0]","data[1]"],
    lineCount: 26,
    bodyC: "SetGpuReg(REG_OFFSET_DISPCNT, 0);\n    LZ77UnCompVram(sCaveTransitionTiles, (void *)(VRAM + 0xC000));\n    LZ77UnCompVram(sCaveTransitionTilemap, (void *)(VRAM + 0xF800));\n    LoadPalette(sCaveTransitionPalette_White, BG_PLTT_ID(14), PLTT_SIZE_4BPP);\n     \n    LoadPalette(sCaveTransitionPalette_Exit, BG_PLTT_ID(14), PLTT_SIZEOF(8));\n    SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG0\n                                | BLDCNT_EFFECT_BLEND\n                                | BLDCNT_TGT2_BG1\n                                | BLDCNT_TGT2_BG2\n                                | BLDCNT_TGT2_BG3\n                                | BLDCNT_TGT2_OBJ\n                                | BLDCNT_TGT2_BD);\n    SetGpuReg(REG_OFFSET_BLDALPHA, 0);\n    SetGpuReg(REG_OFFSET_BLDY, 0);\n    SetGpuReg(REG_OFFSET_BG0CNT, BGCNT_PRIORITY(0)\n                               | BGCNT_CHARBASE(3)\n                               | BGCNT_SCREENBASE(31)\n                               | BGCNT_16COLOR\n                               | BGCNT_TXT256x256);\n    SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_MODE_0\n                                | DISPCNT_OBJ_1D_MAP\n                                | DISPCNT_BG0_ON\n                                | DISPCNT_OBJ_ON);\n    gTasks[taskId].func = Task_ExitCaveTransition3;\n    gTasks[taskId].data[0] = 16;\n    gTasks[taskId].data[1] = 0;",
  },
  "Task_ExitCaveTransition3": {
    callsTo: ["SetGpuReg"],
    taskTransitions: ["Task_ExitCaveTransition4"],
    dataReads: ["data[1]"],
    dataWrites: ["data[1]","data[2]"],
    lineCount: 12,
    bodyC: "u16 count = gTasks[taskId].data[1];\n    u16 blend = count + 0x1000;\n\n    SetGpuReg(REG_OFFSET_BLDALPHA, blend);\n    if (count <= 16)\n    {\n        gTasks[taskId].data[1]++;\n    }\n    else\n    {\n        gTasks[taskId].data[2] = 0;\n        gTasks[taskId].func = Task_ExitCaveTransition4;\n    }",
  },
  "Task_ExitCaveTransition4": {
    callsTo: ["BG_PLTT_ID","BLDALPHA_BLEND","LoadPalette","PLTT_SIZEOF","SetGpuReg"],
    taskTransitions: ["Task_ExitCaveTransition5"],
    dataReads: ["data[2]"],
    dataWrites: ["data[2]"],
    lineCount: 14,
    bodyC: "u16 count;\n\n    SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(16, 16));\n    count = gTasks[taskId].data[2];\n\n    if (count < 8)\n    {\n        gTasks[taskId].data[2]++;\n         \n        LoadPalette(&sCaveTransitionPalette_Exit[count], BG_PLTT_ID(14), sizeof(sCaveTransitionPalette_Exit) - PLTT_SIZEOF(count));\n    }\n    else\n    {\n        LoadPalette(sCaveTransitionPalette_White, BG_PLTT_ID(0), PLTT_SIZE_4BPP);\n        gTasks[taskId].func = Task_ExitCaveTransition5;\n        gTasks[taskId].data[2] = 8;\n    }",
  },
  "Task_ExitCaveTransition5": {
    callsTo: ["SetMainCallback2"],
    dataReads: ["data[2]"],
    dataWrites: ["data[2]"],
    lineCount: 4,
    bodyC: "if (gTasks[taskId].data[2])\n        gTasks[taskId].data[2]--;\n    else\n        SetMainCallback2(gMain.savedCallback);",
  },
  "Task_EnterCaveTransition1": {
    taskTransitions: ["Task_EnterCaveTransition2"],
    lineCount: 1,
    bodyC: "gTasks[taskId].func = Task_EnterCaveTransition2;",
  },
  "Task_EnterCaveTransition2": {
    callsTo: ["BGCNT_CHARBASE","BGCNT_PRIORITY","BGCNT_SCREENBASE","BG_PLTT_ID","LZ77UnCompVram","LoadPalette","SetGpuReg"],
    taskTransitions: ["Task_EnterCaveTransition3"],
    dataWrites: ["data[0]","data[1]","data[2]"],
    lineCount: 21,
    bodyC: "SetGpuReg(REG_OFFSET_DISPCNT, 0);\n    LZ77UnCompVram(sCaveTransitionTiles, (void *)(VRAM + 0xC000));\n    LZ77UnCompVram(sCaveTransitionTilemap, (void *)(VRAM + 0xF800));\n    SetGpuReg(REG_OFFSET_BLDCNT, 0);\n    SetGpuReg(REG_OFFSET_BLDALPHA, 0);\n    SetGpuReg(REG_OFFSET_BLDY, 0);\n    SetGpuReg(REG_OFFSET_BG0CNT, BGCNT_PRIORITY(0)\n                               | BGCNT_CHARBASE(3)\n                               | BGCNT_SCREENBASE(31)\n                               | BGCNT_16COLOR\n                               | BGCNT_TXT256x256);\n    SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_MODE_0\n                                | DISPCNT_OBJ_1D_MAP\n                                | DISPCNT_BG0_ON\n                                | DISPCNT_OBJ_ON);\n    LoadPalette(sCaveTransitionPalette_White, BG_PLTT_ID(14), PLTT_SIZE_4BPP);\n    LoadPalette(sCaveTransitionPalette_Black, BG_PLTT_ID(0), PLTT_SIZE_4BPP);\n    gTasks[taskId].func = Task_EnterCaveTransition3;\n    gTasks[taskId].data[0] = 16;\n    gTasks[taskId].data[1] = 0;\n    gTasks[taskId].data[2] = 0;",
  },
  "Task_EnterCaveTransition3": {
    callsTo: ["BG_PLTT_ID","BLDALPHA_BLEND","LoadPalette","PLTT_SIZEOF","SetGpuReg"],
    taskTransitions: ["Task_EnterCaveTransition4"],
    dataReads: ["data[2]"],
    dataWrites: ["data[2]"],
    lineCount: 19,
    bodyC: "u16 count = gTasks[taskId].data[2];\n\n    if (count < 16)\n    {\n        gTasks[taskId].data[2]++;\n        gTasks[taskId].data[2]++;\n        LoadPalette(&sCaveTransitionPalette_Enter[15 - count], BG_PLTT_ID(14), PLTT_SIZEOF(count + 1));\n    }\n    else\n    {\n        SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(16, 16));\n        SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG0\n                                    | BLDCNT_EFFECT_BLEND\n                                    | BLDCNT_TGT2_BG1\n                                    | BLDCNT_TGT2_BG2\n                                    | BLDCNT_TGT2_BG3\n                                    | BLDCNT_TGT2_OBJ\n                                    | BLDCNT_TGT2_BD);\n        gTasks[taskId].func = Task_EnterCaveTransition4;\n    }",
  },
  "Task_EnterCaveTransition4": {
    callsTo: ["BG_PLTT_ID","LoadPalette","SetGpuReg","SetMainCallback2"],
    dataReads: ["data[1]"],
    dataWrites: ["data[1]"],
    lineCount: 12,
    bodyC: "u16 count = 16 - gTasks[taskId].data[1];\n    u16 blend = count + 0x1000;\n\n    SetGpuReg(REG_OFFSET_BLDALPHA, blend);\n    if (count)\n    {\n        gTasks[taskId].data[1]++;\n    }\n    else\n    {\n        LoadPalette(sCaveTransitionPalette_Black, BG_PLTT_ID(0), PLTT_SIZE_4BPP);\n        SetMainCallback2(gMain.savedCallback);\n    }",
  },
} as const;

export const CB2S = {
  "CB2_ChangeMapMain": {
    callsTo: ["AnimateSprites","BuildOamBuffer","RunTasks","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 4,
    bodyC: "RunTasks();\n    AnimateSprites();\n    BuildOamBuffer();\n    UpdatePaletteFade();",
  },
  "CB2_DoChangeMap": {
    callsTo: ["DmaFill16","DmaFill32","ResetPaletteFade","ResetSpriteData","ResetTasks","SetGpuReg","SetMainCallback2","SetVBlankCallback","TryDoMapTransition"],
    cb2Transitions: ["CB2_ChangeMapMain"],
    lineCount: 26,
    bodyC: "u16 ime;\n\n    SetVBlankCallback(NULL);\n    SetGpuReg(REG_OFFSET_DISPCNT, 0);\n    SetGpuReg(REG_OFFSET_BG2CNT, 0);\n    SetGpuReg(REG_OFFSET_BG1CNT, 0);\n    SetGpuReg(REG_OFFSET_BG0CNT, 0);\n    SetGpuReg(REG_OFFSET_BG2HOFS, 0);\n    SetGpuReg(REG_OFFSET_BG2VOFS, 0);\n    SetGpuReg(REG_OFFSET_BG1HOFS, 0);\n    SetGpuReg(REG_OFFSET_BG1VOFS, 0);\n    SetGpuReg(REG_OFFSET_BG0HOFS, 0);\n    SetGpuReg(REG_OFFSET_BG0VOFS, 0);\n    DmaFill16(3, 0, (void *)VRAM, VRAM_SIZE);\n    DmaFill32(3, 0, (void *)OAM, OAM_SIZE);\n    DmaFill16(3, 0, (void *)(PLTT + 2), PLTT_SIZE - 2);\n    ResetPaletteFade();\n    ResetTasks();\n    ResetSpriteData();\n    ime = REG_IME;\n    REG_IME = 0;\n    REG_IE |= INTR_FLAG_VBLANK;\n    REG_IME = ime;\n    SetVBlankCallback(VBC_ChangeMapVBlank);\n    SetMainCallback2(CB2_ChangeMapMain);\n    if (!TryDoMapTransition())\n        SetMainCallback2(gMain.savedCallback);",
  },
} as const;
