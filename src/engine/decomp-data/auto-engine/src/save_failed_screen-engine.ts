// AUTO-GENERATED from src/save_failed_screen.c by extract-engine-helpers.mjs
// Do not edit — re-run `node scripts/extract-engine-helpers.mjs` to refresh.
//
// Generated: 2026-04-27
// Functions: 12

export const ENGINE_FUNCTIONS = {
  "CB2_FadeAndReturnToTitleScreen": {
    returnType: "static void",
    params: "void",
    callsTo: ["BeginNormalPaletteFade","JOY_NEW","SetMainCallback2","SetVBlankCallback"],
    lineCount: 7,
    bodyC: "sClockInfo[CLOCK_RUNNING] = FALSE;\n\n    if (JOY_NEW(A_BUTTON))\n    {\n        BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);\n        SetVBlankCallback(VBlankCB);\n        SetMainCallback2(CB2_ReturnToTitleScreen);\n    }",
  },
  "CB2_GameplayCannotBeContinued": {
    returnType: "static void",
    params: "void",
    callsTo: ["FillWindowPixelBuffer","JOY_NEW","PIXEL_FILL","SaveFailedScreenTextPrint","SetMainCallback2","SetVBlankCallback"],
    lineCount: 8,
    bodyC: "sClockInfo[CLOCK_RUNNING] = FALSE;\n\n    if (JOY_NEW(A_BUTTON))\n    {\n        FillWindowPixelBuffer(sWindowIds[TEXT_WIN_ID], PIXEL_FILL(1));\n        SaveFailedScreenTextPrint(gText_GamePlayCannotBeContinued, 1, 0);\n        SetVBlankCallback(VBlankCB);\n        SetMainCallback2(CB2_FadeAndReturnToTitleScreen);\n    }",
  },
  "CB2_ReturnToTitleScreen": {
    returnType: "static void",
    params: "void",
    callsTo: ["DoSoftReset","SetMainCallback2","UpdatePaletteFade"],
    lineCount: 12,
    bodyC: "if (!UpdatePaletteFade())\n    {\n        if (gGameContinueCallback == NULL)  \n        {\n            DoSoftReset();\n        }\n        else\n        {\n            SetMainCallback2(gGameContinueCallback);\n            gGameContinueCallback = NULL;\n        }\n    }",
  },
  "CB2_SaveFailedScreen": {
    returnType: "static void",
    params: "void",
    callsTo: ["ARRAY_COUNT","AddWindowWithoutTileMap","BG_PLTT_ID","BG_SCREEN_ADDR","BeginNormalPaletteFade","CopyWindowToVram","CpuFill32","DeactivateAllTextPrinters","DmaFill16","DmaFill32","DrawStdFrameWithCustomTileAndPalette","EnableInterrupts","FillWindowPixelBuffer","InitBgsFromTemplates","InitWindows","LZ77UnCompVram","LoadBgTiles","LoadPalette","OBJ_PLTT_ID","PIXEL_FILL","ResetBgsAndClearDma3BusyFlags","ResetPaletteFade","ResetSpriteData","ResetTasks","SaveFailedScreenTextPrint","SetBgTilemapBuffer","SetGpuReg","SetMainCallback2","SetVBlankCallback","SetWindowAttribute","ShowBg","UpdatePaletteFade"],
    lineCount: 67,
    bodyC: "switch (gMain.state)\n    {\n    case 0:\n    default:\n        SetVBlankCallback(NULL);\n        SetGpuReg(REG_OFFSET_DISPCNT, 0);\n        SetGpuReg(REG_OFFSET_BG3CNT, 0);\n        SetGpuReg(REG_OFFSET_BG2CNT, 0);\n        SetGpuReg(REG_OFFSET_BG1CNT, 0);\n        SetGpuReg(REG_OFFSET_BG0CNT, 0);\n        SetGpuReg(REG_OFFSET_BG3HOFS, 0);\n        SetGpuReg(REG_OFFSET_BG3VOFS, 0);\n        SetGpuReg(REG_OFFSET_BG2HOFS, 0);\n        SetGpuReg(REG_OFFSET_BG2VOFS, 0);\n        SetGpuReg(REG_OFFSET_BG1HOFS, 0);\n        SetGpuReg(REG_OFFSET_BG1VOFS, 0);\n        SetGpuReg(REG_OFFSET_BG0HOFS, 0);\n        SetGpuReg(REG_OFFSET_BG0VOFS, 0);\n        DmaFill16(3, 0, VRAM, VRAM_SIZE);\n        DmaFill32(3, 0, OAM, OAM_SIZE);\n        DmaFill16(3, 0, PLTT, PLTT_SIZE);\n        LZ77UnCompVram(gBirchBagGrass_Gfx, (void *)VRAM);\n        LZ77UnCompVram(gBirchBagTilemap, (void *)(BG_SCREEN_ADDR(14)));\n        LZ77UnCompVram(gBirchGrassTilemap, (void *)(BG_SCREEN_ADDR(15)));\n        LZ77UnCompVram(sSaveFailedClockGfx, (void *)(OBJ_VRAM0 + 0x20));\n        ResetBgsAndClearDma3BusyFlags(0);\n        InitBgsFromTemplates(0, sBgTemplates, ARRAY_COUNT(sBgTemplates));\n        SetBgTilemapBuffer(0, (void *)&gDecompressionBuffer[0x2000]);\n        CpuFill32(0, &gDecompressionBuffer[0x2000], 0x800);\n        LoadBgTiles(0, gTextWindowFrame1_Gfx, 0x120, 0x214);\n        InitWindows(sDummyWindowTemplate);\n        sWindowIds[TEXT_WIN_ID] = AddWindowWithoutTileMap(sWindowTemplate_Text);\n        SetWindowAttribute(sWindowIds[TEXT_WIN_ID], 7, (u32)&gDecompressionBuffer[0x2800]);\n        sWindowIds[CLOCK_WIN_ID] = AddWindowWithoutTileMap(sWindowTemplate_Clock);\n        SetWindowAttribute(sWindowIds[CLOCK_WIN_ID], 7, (u32)&gDecompressionBuffer[0x3D00]);\n        DeactivateAllTextPrinters();\n        ResetSpriteData();\n        ResetTasks();\n        ResetPaletteFade();\n        LoadPalette(gBirchBagGrass_Pal, BG_PLTT_ID(0), 2 * PLTT_SIZE_4BPP);\n        LoadPalette(sSaveFailedClockPal, OBJ_PLTT_ID(0), PLTT_SIZE_4BPP);\n        LoadPalette(gTextWindowFrame1_Pal, BG_PLTT_ID(14), PLTT_SIZE_4BPP);\n        LoadPalette(gStandardMenuPalette, BG_PLTT_ID(15), PLTT_SIZE_4BPP);\n        DrawStdFrameWithCustomTileAndPalette(sWindowIds[TEXT_WIN_ID], FALSE, 0x214, 0xE);\n        DrawStdFrameWithCustomTileAndPalette(sWindowIds[CLOCK_WIN_ID], FALSE, 0x214, 0xE);\n        FillWindowPixelBuffer(sWindowIds[CLOCK_WIN_ID], PIXEL_FILL(1));  \n        FillWindowPixelBuffer(sWindowIds[TEXT_WIN_ID], PIXEL_FILL(1));\n        CopyWindowToVram(sWindowIds[CLOCK_WIN_ID], COPYWIN_GFX);  \n        CopyWindowToVram(sWindowIds[TEXT_WIN_ID], COPYWIN_MAP);\n        SaveFailedScreenTextPrint(gText_SaveFailedCheckingBackup, 1, 0);\n        BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK);\n        EnableInterrupts(1);\n        SetVBlankCallback(VBlankCB);\n        SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);\n        ShowBg(0);\n        ShowBg(2);\n        ShowBg(3);\n        gMain.state++;\n        break;\n    case 1:\n        if (!UpdatePaletteFade())\n        {\n            SetMainCallback2(CB2_WipeSave);\n            SetVBlankCallback(VBlankCB_UpdateClockGraphics);\n        }\n        break;\n    }",
  },
  "CB2_WipeSave": {
    returnType: "static void",
    params: "void",
    callsTo: ["FillWindowPixelBuffer","HandleSavingData","PIXEL_FILL","SaveFailedScreenTextPrint","SetMainCallback2","WipeSectors"],
    lineCount: 35,
    bodyC: "u8 wipeTries = 0;\n\n    sClockInfo[CLOCK_RUNNING] = TRUE;\n\n    while (gDamagedSaveSectors != 0 && wipeTries < 3)\n    {\n        if (WipeSectors(gDamagedSaveSectors))\n        {\n            FillWindowPixelBuffer(sWindowIds[TEXT_WIN_ID], PIXEL_FILL(1));\n            SaveFailedScreenTextPrint(gText_BackupMemoryDamaged, 1, 0);\n            SetMainCallback2(CB2_GameplayCannotBeContinued);\n            return;\n        }\n\n        FillWindowPixelBuffer(sWindowIds[TEXT_WIN_ID], PIXEL_FILL(1));\n        SaveFailedScreenTextPrint(gText_CheckCompleted, 1, 0);\n        HandleSavingData(sSaveFailedType);\n\n        if (gDamagedSaveSectors != 0)\n        {\n            FillWindowPixelBuffer(sWindowIds[TEXT_WIN_ID], PIXEL_FILL(1));\n            SaveFailedScreenTextPrint(gText_SaveFailedCheckingBackup, 1, 0);\n        }\n\n        wipeTries++;\n    }\n\n    if (wipeTries == 3)\n    {\n        FillWindowPixelBuffer(sWindowIds[TEXT_WIN_ID], PIXEL_FILL(1));\n        SaveFailedScreenTextPrint(gText_BackupMemoryDamaged, 1, 0);\n    }\n    else\n    {\n        FillWindowPixelBuffer(sWindowIds[TEXT_WIN_ID], PIXEL_FILL(1));\n\n        if (gGameContinueCallback == NULL)\n            SaveFailedScreenTextPrint(gText_SaveCompleteGameCannotContinue, 1, 0);\n        else\n            SaveFailedScreenTextPrint(gText_SaveCompletePressA, 1, 0);\n    }\n\n    SetMainCallback2(CB2_FadeAndReturnToTitleScreen);",
  },
  "DoSaveFailedScreen": {
    returnType: "void",
    params: "u8 saveType",
    callsTo: ["SetMainCallback2"],
    lineCount: 6,
    bodyC: "SetMainCallback2(CB2_SaveFailedScreen);\n    sSaveFailedType = saveType;\n    sClockInfo[CLOCK_RUNNING] = FALSE;\n    sClockInfo[DEBUG_TIMER] = 0;\n    sWindowIds[TEXT_WIN_ID] = 0;\n    sWindowIds[CLOCK_WIN_ID] = 0;",
  },
  "SaveFailedScreenTextPrint": {
    returnType: "static void",
    params: "const u8 *text, u8 x, u8 y",
    callsTo: ["AddTextPrinterParameterized4"],
    lineCount: 5,
    bodyC: "u8 color[3];\n\n    color[0] = TEXT_COLOR_TRANSPARENT;\n    color[1] = TEXT_DYNAMIC_COLOR_6;\n    color[2] = TEXT_COLOR_LIGHT_GRAY;\n    AddTextPrinterParameterized4(sWindowIds[TEXT_WIN_ID], FONT_NORMAL, x * 8, y * 8 + 1, 0, 0, color, 0, text);",
  },
  "VBlankCB": {
    returnType: "static void",
    params: "void",
    callsTo: ["LoadOam","ProcessSpriteCopyRequests","TransferPlttBuffer"],
    lineCount: 3,
    bodyC: "LoadOam();\n    ProcessSpriteCopyRequests();\n    TransferPlttBuffer();",
  },
  "VBlankCB_UpdateClockGraphics": {
    returnType: "static void",
    params: "void",
    callsTo: ["CpuFastCopy"],
    lineCount: 16,
    bodyC: "u32 n = (gMain.vblankCounter2 >> 3) & 7;\n\n    gMain.oamBuffer[0] = sClockOamData;\n    gMain.oamBuffer[0].x = 112;\n    gMain.oamBuffer[0].y = (CLOCK_WIN_TOP + 1) * 8;\n\n    if (sClockInfo[CLOCK_RUNNING])\n    {\n        gMain.oamBuffer[0].tileNum = sClockFrames[n][0];\n        gMain.oamBuffer[0].matrixNum = (sClockFrames[n][2] << 4) | (sClockFrames[n][1] << 3);\n    }\n    else\n    {\n        gMain.oamBuffer[0].tileNum = 1;\n    }\n\n    CpuFastCopy(gMain.oamBuffer, (void *)OAM, 4);\n\n    if (sClockInfo[DEBUG_TIMER])\n        sClockInfo[DEBUG_TIMER]--;",
  },
  "VerifySectorWipe": {
    returnType: "static bool8",
    params: "u16 sector",
    callsTo: ["ReadFlash"],
    lineCount: 7,
    bodyC: "u32 *ptr = (u32 *)&gSaveDataBuffer;\n    u16 i;\n\n    ReadFlash(sector, 0, (u8 *)ptr, SECTOR_SIZE);\n\n     \n    for (i = 0; i < SECTOR_SIZE / 4; i++, ptr++)\n        if (*ptr)\n            return TRUE;  \n\n    return FALSE;",
  },
  "WipeSector": {
    returnType: "static bool8",
    params: "u16 sector",
    callsTo: ["ProgramFlashByte","VerifySectorWipe"],
    lineCount: 9,
    bodyC: "u16 i, j;\n    bool8 failed = TRUE;\n\n     \n    for (i = 0; failed && i < 130; i++)\n    {\n        for (j = 0; j < SECTOR_SIZE; j++)\n            ProgramFlashByte(sector, j, 0);\n\n        failed = VerifySectorWipe(sector);\n    }\n\n    return failed;",
  },
  "WipeSectors": {
    returnType: "static bool8",
    params: "u32 sectorBits",
    callsTo: ["WipeSector"],
    lineCount: 8,
    bodyC: "u16 i;\n\n    for (i = 0; i < SECTORS_COUNT; i++)\n        if ((sectorBits & (1 << i)) && !WipeSector(i))\n            sectorBits &= ~(1 << i);\n\n    if (sectorBits == 0)\n        return FALSE;\n    else\n        return TRUE;",
  },
} as const;
