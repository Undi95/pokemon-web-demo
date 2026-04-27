// AUTO-GENERATED from src/save_failed_screen.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 0 Task_, 5 CB2_, 0 SpriteCB_

export const CB2S = {
  "CB2_SaveFailedScreen": {
    callsTo: ["ARRAY_COUNT","AddWindowWithoutTileMap","BG_PLTT_ID","BG_SCREEN_ADDR","BeginNormalPaletteFade","CopyWindowToVram","CpuFill32","DeactivateAllTextPrinters","DmaFill16","DmaFill32","DrawStdFrameWithCustomTileAndPalette","EnableInterrupts","FillWindowPixelBuffer","InitBgsFromTemplates","InitWindows","LZ77UnCompVram","LoadBgTiles","LoadPalette","OBJ_PLTT_ID","PIXEL_FILL","ResetBgsAndClearDma3BusyFlags","ResetPaletteFade","ResetSpriteData","ResetTasks","SaveFailedScreenTextPrint","SetBgTilemapBuffer","SetGpuReg","SetMainCallback2","SetVBlankCallback","SetWindowAttribute","ShowBg","UpdatePaletteFade"],
    cb2Transitions: ["CB2_WipeSave"],
    lineCount: 67,
    bodyC: "switch (gMain.state)\n    {\n    case 0:\n    default:\n        SetVBlankCallback(NULL);\n        SetGpuReg(REG_OFFSET_DISPCNT, 0);\n        SetGpuReg(REG_OFFSET_BG3CNT, 0);\n        SetGpuReg(REG_OFFSET_BG2CNT, 0);\n        SetGpuReg(REG_OFFSET_BG1CNT, 0);\n        SetGpuReg(REG_OFFSET_BG0CNT, 0);\n        SetGpuReg(REG_OFFSET_BG3HOFS, 0);\n        SetGpuReg(REG_OFFSET_BG3VOFS, 0);\n        SetGpuReg(REG_OFFSET_BG2HOFS, 0);\n        SetGpuReg(REG_OFFSET_BG2VOFS, 0);\n        SetGpuReg(REG_OFFSET_BG1HOFS, 0);\n        SetGpuReg(REG_OFFSET_BG1VOFS, 0);\n        SetGpuReg(REG_OFFSET_BG0HOFS, 0);\n        SetGpuReg(REG_OFFSET_BG0VOFS, 0);\n        DmaFill16(3, 0, VRAM, VRAM_SIZE);\n        DmaFill32(3, 0, OAM, OAM_SIZE);\n        DmaFill16(3, 0, PLTT, PLTT_SIZE);\n        LZ77UnCompVram(gBirchBagGrass_Gfx, (void *)VRAM);\n        LZ77UnCompVram(gBirchBagTilemap, (void *)(BG_SCREEN_ADDR(14)));\n        LZ77UnCompVram(gBirchGrassTilemap, (void *)(BG_SCREEN_ADDR(15)));\n        LZ77UnCompVram(sSaveFailedClockGfx, (void *)(OBJ_VRAM0 + 0x20));\n        ResetBgsAndClearDma3BusyFlags(0);\n        InitBgsFromTemplates(0, sBgTemplates, ARRAY_COUNT(sBgTemplates));\n        SetBgTilemapBuffer(0, (void *)&gDecompressionBuffer[0x2000]);\n        CpuFill32(0, &gDecompressionBuffer[0x2000], 0x800);\n        LoadBgTiles(0, gTextWindowFrame1_Gfx, 0x120, 0x214);\n        InitWindows(sDummyWindowTemplate);\n        sWindowIds[TEXT_WIN_ID] = AddWindowWithoutTileMap(sWindowTemplate_Text);\n        SetWindowAttribute(sWindowIds[TEXT_WIN_ID], 7, (u32)&gDecompressionBuffer[0x2800]);\n        sWindowIds[CLOCK_WIN_ID] = AddWindowWithoutTileMap(sWindowTemplate_Clock);\n        SetWindowAttribute(sWindowIds[CLOCK_WIN_ID], 7, (u32)&gDecompressionBuffer[0x3D00]);\n        DeactivateAllTextPrinters();\n        ResetSpriteData();\n        ResetTasks();\n        ResetPaletteFade();\n        LoadPalette(gBirchBagGrass_Pal, BG_PLTT_ID(0), 2 * PLTT_SIZE_4BPP);\n        LoadPalette(sSaveFailedClockPal, OBJ_PLTT_ID(0), PLTT_SIZE_4BPP);\n        LoadPalette(gTextWindowFrame1_Pal, BG_PLTT_ID(14), PLTT_SIZE_4BPP);\n        LoadPalette(gStandardMenuPalette, BG_PLTT_ID(15), PLTT_SIZE_4BPP);\n        DrawStdFrameWithCustomTileAndPalette(sWindowIds[TEXT_WIN_ID], FALSE, 0x214, 0xE);\n        DrawStdFrameWithCustomTileAndPalette(sWindowIds[CLOCK_WIN_ID], FALSE, 0x214, 0xE);\n        FillWindowPixelBuffer(sWindowIds[CLOCK_WIN_ID], PIXEL_FILL(1));  \n        FillWindowPixelBuffer(sWindowIds[TEXT_WIN_ID], PIXEL_FILL(1));\n        CopyWindowToVram(sWindowIds[CLOCK_WIN_ID], COPYWIN_GFX);  \n        CopyWindowToVram(sWindowIds[TEXT_WIN_ID], COPYWIN_MAP);\n        SaveFailedScreenTextPrint(gText_SaveFailedCheckingBackup, 1, 0);\n        BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK);\n        EnableInterrupts(1);\n        SetVBlankCallback(VBlankCB);\n        SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);\n        ShowBg(0);\n        ShowBg(2);\n        ShowBg(3);\n        gMain.state++;\n        break;\n    case 1:\n        if (!UpdatePaletteFade())\n        {\n            SetMainCallback2(CB2_WipeSave);\n            SetVBlankCallback(VBlankCB_UpdateClockGraphics);\n        }\n        break;\n    }",
  },
  "CB2_WipeSave": {
    callsTo: ["FillWindowPixelBuffer","HandleSavingData","PIXEL_FILL","SaveFailedScreenTextPrint","SetMainCallback2","WipeSectors"],
    cb2Transitions: ["CB2_FadeAndReturnToTitleScreen","CB2_GameplayCannotBeContinued"],
    lineCount: 35,
    bodyC: "u8 wipeTries = 0;\n\n    sClockInfo[CLOCK_RUNNING] = TRUE;\n\n    while (gDamagedSaveSectors != 0 && wipeTries < 3)\n    {\n        if (WipeSectors(gDamagedSaveSectors))\n        {\n            FillWindowPixelBuffer(sWindowIds[TEXT_WIN_ID], PIXEL_FILL(1));\n            SaveFailedScreenTextPrint(gText_BackupMemoryDamaged, 1, 0);\n            SetMainCallback2(CB2_GameplayCannotBeContinued);\n            return;\n        }\n\n        FillWindowPixelBuffer(sWindowIds[TEXT_WIN_ID], PIXEL_FILL(1));\n        SaveFailedScreenTextPrint(gText_CheckCompleted, 1, 0);\n        HandleSavingData(sSaveFailedType);\n\n        if (gDamagedSaveSectors != 0)\n        {\n            FillWindowPixelBuffer(sWindowIds[TEXT_WIN_ID], PIXEL_FILL(1));\n            SaveFailedScreenTextPrint(gText_SaveFailedCheckingBackup, 1, 0);\n        }\n\n        wipeTries++;\n    }\n\n    if (wipeTries == 3)\n    {\n        FillWindowPixelBuffer(sWindowIds[TEXT_WIN_ID], PIXEL_FILL(1));\n        SaveFailedScreenTextPrint(gText_BackupMemoryDamaged, 1, 0);\n    }\n    else\n    {\n        FillWindowPixelBuffer(sWindowIds[TEXT_WIN_ID], PIXEL_FILL(1));\n\n        if (gGameContinueCallback == NULL)\n            SaveFailedScreenTextPrint(gText_SaveCompleteGameCannotContinue, 1, 0);\n        else\n            SaveFailedScreenTextPrint(gText_SaveCompletePressA, 1, 0);\n    }\n\n    SetMainCallback2(CB2_FadeAndReturnToTitleScreen);",
  },
  "CB2_GameplayCannotBeContinued": {
    callsTo: ["FillWindowPixelBuffer","JOY_NEW","PIXEL_FILL","SaveFailedScreenTextPrint","SetMainCallback2","SetVBlankCallback"],
    cb2Transitions: ["CB2_FadeAndReturnToTitleScreen"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON"] },
    lineCount: 8,
    bodyC: "sClockInfo[CLOCK_RUNNING] = FALSE;\n\n    if (JOY_NEW(A_BUTTON))\n    {\n        FillWindowPixelBuffer(sWindowIds[TEXT_WIN_ID], PIXEL_FILL(1));\n        SaveFailedScreenTextPrint(gText_GamePlayCannotBeContinued, 1, 0);\n        SetVBlankCallback(VBlankCB);\n        SetMainCallback2(CB2_FadeAndReturnToTitleScreen);\n    }",
  },
  "CB2_FadeAndReturnToTitleScreen": {
    callsTo: ["BeginNormalPaletteFade","JOY_NEW","SetMainCallback2","SetVBlankCallback"],
    cb2Transitions: ["CB2_ReturnToTitleScreen"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON"] },
    lineCount: 7,
    bodyC: "sClockInfo[CLOCK_RUNNING] = FALSE;\n\n    if (JOY_NEW(A_BUTTON))\n    {\n        BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);\n        SetVBlankCallback(VBlankCB);\n        SetMainCallback2(CB2_ReturnToTitleScreen);\n    }",
  },
  "CB2_ReturnToTitleScreen": {
    callsTo: ["DoSoftReset","SetMainCallback2","UpdatePaletteFade"],
    cb2Transitions: ["gGameContinueCallback"],
    lineCount: 12,
    bodyC: "if (!UpdatePaletteFade())\n    {\n        if (gGameContinueCallback == NULL)  \n        {\n            DoSoftReset();\n        }\n        else\n        {\n            SetMainCallback2(gGameContinueCallback);\n            gGameContinueCallback = NULL;\n        }\n    }",
  },
} as const;
