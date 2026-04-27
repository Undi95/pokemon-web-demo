// AUTO-GENERATED from src/contest_painting.c by extract-engine-helpers.mjs
// Do not edit — re-run `node scripts/extract-engine-helpers.mjs` to refresh.
//
// Generated: 2026-04-27
// Functions: 20

export const ENGINE_FUNCTIONS = {
  "AllocPaintingResources": {
    returnType: "static void",
    params: "void",
    callsTo: ["AllocZeroed"],
    lineCount: 2,
    bodyC: "gContestPaintingMonPalette = AllocZeroed(OBJ_PLTT_SIZE);\n    gContestMonPixels = AllocZeroed(0x2000);",
  },
  "CB2_ContestPainting": {
    returnType: "void",
    params: "void",
    callsTo: ["ShowContestPainting"],
    lineCount: 1,
    bodyC: "ShowContestPainting();",
  },
  "CB2_HoldContestPainting": {
    returnType: "static void",
    params: "void",
    callsTo: ["HoldContestPainting","RunTextPrinters","UpdatePaletteFade"],
    lineCount: 3,
    bodyC: "HoldContestPainting();\n    RunTextPrinters();\n    UpdatePaletteFade();",
  },
  "CB2_QuitContestPainting": {
    returnType: "static void",
    params: "void",
    callsTo: ["FREE_AND_SET_NULL","Free","FreeMonSpritesGfx","GetBgTilemapBuffer","RemoveWindow","SetMainCallback2"],
    lineCount: 6,
    bodyC: "SetMainCallback2(gMain.savedCallback);\n    FREE_AND_SET_NULL(gContestPaintingMonPalette);\n    FREE_AND_SET_NULL(gContestMonPixels);\n    RemoveWindow(sWindowId);\n    Free(GetBgTilemapBuffer(1));\n    FreeMonSpritesGfx();",
  },
  "CreateContestPaintingPicture": {
    returnType: "static void",
    params: "u8 contestWinnerId, bool8 isForArtist",
    callsTo: ["AllocPaintingResources","DoContestPaintingImageProcessing","GetImageEffectForContestWinner","InitContestMonPixels","InitPaintingMonOamData","LoadContestPaintingFrame"],
    lineCount: 5,
    bodyC: "AllocPaintingResources();\n    InitContestMonPixels(gContestPaintingWinner->species, FALSE);\n    DoContestPaintingImageProcessing(GetImageEffectForContestWinner(contestWinnerId));\n    InitPaintingMonOamData(contestWinnerId);\n    LoadContestPaintingFrame(contestWinnerId, isForArtist);",
  },
  "DoContestPaintingImageProcessing": {
    returnType: "static void",
    params: "u8 imageEffect",
    callsTo: ["ApplyImageProcessingEffects","ApplyImageProcessingQuantization","ConvertImageProcessingToGBA","LoadPalette","OBJ_PLTT_ID"],
    lineCount: 30,
    bodyC: "gImageProcessingContext.canvasPixels = gContestMonPixels;\n    gImageProcessingContext.canvasPalette = gContestPaintingMonPalette;\n    gImageProcessingContext.paletteStart = 0;\n    gImageProcessingContext.personality = gContestPaintingWinner->personality % 256;\n    gImageProcessingContext.columnStart = 0;\n    gImageProcessingContext.rowStart = 0;\n    gImageProcessingContext.columnEnd = 64;\n    gImageProcessingContext.rowEnd = 64;\n    gImageProcessingContext.canvasWidth = 64;\n    gImageProcessingContext.canvasHeight = 64;\n\n    switch (imageEffect)\n    {\n    case IMAGE_EFFECT_CHARCOAL:\n    case IMAGE_EFFECT_GRAYSCALE_LIGHT:\n        gImageProcessingContext.quantizeEffect = QUANTIZE_EFFECT_GRAYSCALE;\n        break;\n    case IMAGE_EFFECT_OUTLINE_COLORED:\n    case IMAGE_EFFECT_SHIMMER:\n    case IMAGE_EFFECT_POINTILLISM:\n    default:\n        gImageProcessingContext.quantizeEffect = QUANTIZE_EFFECT_STANDARD_LIMITED_COLORS;\n        break;\n    }\n\n    gImageProcessingContext.var_16 = 2;\n    gImageProcessingContext.effect = imageEffect;\n    gImageProcessingContext.dest = (void *)OBJ_VRAM0;\n\n    ApplyImageProcessingEffects(&gImageProcessingContext);\n    ApplyImageProcessingQuantization(&gImageProcessingContext);\n    ConvertImageProcessingToGBA(&gImageProcessingContext);\n    LoadPalette(gContestPaintingMonPalette, OBJ_PLTT_ID(0), 16 * PLTT_SIZE_4BPP);",
  },
  "GetImageEffectForContestWinner": {
    returnType: "static u8",
    params: "u8 contestWinnerId",
    lineCount: 19,
    bodyC: "u8 contestCategory;\n\n    if (contestWinnerId < MUSEUM_CONTEST_WINNERS_START)\n        contestCategory = gContestPaintingWinner->contestCategory;\n    else\n        contestCategory = gContestPaintingWinner->contestCategory / NUM_PAINTING_CAPTIONS;\n\n    switch (contestCategory)\n    {\n    case CONTEST_CATEGORY_COOL:\n        return IMAGE_EFFECT_OUTLINE_COLORED;\n    case CONTEST_CATEGORY_BEAUTY:\n        return IMAGE_EFFECT_SHIMMER;\n    case CONTEST_CATEGORY_CUTE:\n        return IMAGE_EFFECT_POINTILLISM;\n    case CONTEST_CATEGORY_SMART:\n        return IMAGE_EFFECT_CHARCOAL;\n    case CONTEST_CATEGORY_TOUGH:\n        return IMAGE_EFFECT_GRAYSCALE_LIGHT;\n    }\n\n    return contestCategory;",
  },
  "HoldContestPainting": {
    returnType: "static void",
    params: "void",
    callsTo: ["BeginNormalPaletteFade","JOY_NEW","SetMainCallback2"],
    lineCount: 24,
    bodyC: "switch (sHoldState)\n    {\n    case 0:\n        if (!gPaletteFade.active)\n            sHoldState = 1;\n        if (sVarsInitialized && sFadeCounter)\n            sFadeCounter--;\n        break;\n    case 1:\n        if ((JOY_NEW(A_BUTTON)) || (JOY_NEW(B_BUTTON)))\n        {\n            sHoldState++;\n            BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);\n        }\n\n        if (sVarsInitialized)\n            sFadeCounter = 0;\n        break;\n    case 2:\n        if (!gPaletteFade.active)\n            SetMainCallback2(CB2_QuitContestPainting);\n        if (sVarsInitialized && sFadeCounter < 30)\n            sFadeCounter++;\n        break;\n    }",
  },
  "InitContestMonPixels": {
    returnType: "static void",
    params: "u16 species, bool8 backPic",
    callsTo: ["GetMonSpritePalFromSpeciesAndPersonality","HandleLoadSpecialPokePic_DontHandleDeoxys","LZDecompressVram","_InitContestMonPixels"],
    lineCount: 20,
    bodyC: "const void *pal = GetMonSpritePalFromSpeciesAndPersonality(species, gContestPaintingWinner->trainerId, gContestPaintingWinner->personality);\n    LZDecompressVram(pal, gContestPaintingMonPalette);\n    if (!backPic)\n    {\n        HandleLoadSpecialPokePic_DontHandleDeoxys(\n            &gMonFrontPicTable[species],\n            gMonSpritesGfxPtr->sprites.ptr[B_POSITION_OPPONENT_LEFT],\n            species,\n            gContestPaintingWinner->personality);\n        _InitContestMonPixels(gMonSpritesGfxPtr->sprites.ptr[B_POSITION_OPPONENT_LEFT], gContestPaintingMonPalette, (void *)gContestMonPixels);\n    }\n    else\n    {\n        HandleLoadSpecialPokePic_DontHandleDeoxys(\n            &gMonBackPicTable[species],\n            gMonSpritesGfxPtr->sprites.ptr[B_POSITION_PLAYER_LEFT],\n            species,\n            gContestPaintingWinner->personality);\n        _InitContestMonPixels(gMonSpritesGfxPtr->sprites.ptr[B_POSITION_PLAYER_LEFT], gContestPaintingMonPalette, (void *)gContestMonPixels);\n    }",
  },
  "InitContestPaintingBg": {
    returnType: "static void",
    params: "void",
    callsTo: ["BGCNT_CHARBASE","BGCNT_PRIORITY","BGCNT_SCREENBASE","SetGpuReg"],
    lineCount: 7,
    bodyC: "SetGpuReg(REG_OFFSET_DISPCNT, 0);\n    REG_IE |= INTR_FLAG_VBLANK;\n    SetGpuReg(REG_OFFSET_BG0CNT, BGCNT_PRIORITY(2) | BGCNT_CHARBASE(0) | BGCNT_SCREENBASE(12) | BGCNT_MOSAIC | BGCNT_16COLOR | BGCNT_TXT256x256);\n    SetGpuReg(REG_OFFSET_BG1CNT, BGCNT_PRIORITY(1) | BGCNT_CHARBASE(1) | BGCNT_SCREENBASE(10) | BGCNT_MOSAIC | BGCNT_16COLOR | BGCNT_TXT256x256);\n    SetGpuReg(REG_OFFSET_BLDCNT, 0);\n    SetGpuReg(REG_OFFSET_BLDALPHA, 0);\n    SetGpuReg(REG_OFFSET_BLDY, 0);",
  },
  "InitContestPaintingVars": {
    returnType: "static void",
    params: "bool8 reset",
    lineCount: 12,
    bodyC: "if (reset == FALSE)\n    {\n         \n        sVarsInitialized = FALSE;\n        sMosaicVal = 0;\n        sFadeCounter = 0;\n    }\n    else\n    {\n        sVarsInitialized = TRUE;\n        sMosaicVal = 15;\n        sFadeCounter = 30;\n    }",
  },
  "InitContestPaintingWindow": {
    returnType: "static void",
    params: "void",
    callsTo: ["ARRAY_COUNT","AddWindow","AllocZeroed","ChangeBgX","ChangeBgY","CopyWindowToVram","DeactivateAllTextPrinters","FillWindowPixelBuffer","InitBgsFromTemplates","PIXEL_FILL","PutWindowTilemap","ResetBgsAndClearDma3BusyFlags","SetBgTilemapBuffer","ShowBg"],
    lineCount: 11,
    bodyC: "ResetBgsAndClearDma3BusyFlags(0);\n    InitBgsFromTemplates(0, sBgTemplates, ARRAY_COUNT(sBgTemplates));\n    ChangeBgX(1, 0, BG_COORD_SET);\n    ChangeBgY(1, 0, BG_COORD_SET);\n    SetBgTilemapBuffer(1, AllocZeroed(BG_SCREEN_SIZE));\n    sWindowId = AddWindow(&sWindowTemplate);\n    DeactivateAllTextPrinters();\n    FillWindowPixelBuffer(sWindowId, PIXEL_FILL(0));\n    PutWindowTilemap(sWindowId);\n    CopyWindowToVram(sWindowId, COPYWIN_FULL);\n    ShowBg(1);",
  },
  "InitPaintingMonOamData": {
    returnType: "static void",
    params: "u8 contestWinnerId",
    lineCount: 12,
    bodyC: "gMain.oamBuffer[0] = sContestPaintingMonOamData;\n    gMain.oamBuffer[0].tileNum = 0;\n\n    if (contestWinnerId > 1)\n    {\n        gMain.oamBuffer[0].x = 88;\n        gMain.oamBuffer[0].y = 24;\n    }\n    else\n    {\n        gMain.oamBuffer[0].x = 88;  \n        gMain.oamBuffer[0].y = 24;\n    }",
  },
  "LoadContestPaintingFrame": {
    returnType: "static void",
    params: "u8 contestWinnerId, bool8 isForArtist",
    callsTo: ["BG_PLTT_ID","BG_SCREEN_ADDR","LoadPalette","RLUnCompVram","RLUnCompWram","VRAM_PICTURE_DATA"],
    lineCount: 71,
    bodyC: "u8 x, y;\n\n    LoadPalette(sPictureFramePalettes, BG_PLTT_ID(0), 8 * PLTT_SIZE_4BPP);\n    if (isForArtist == TRUE)\n    {\n         \n        switch (gContestPaintingWinner->contestCategory / NUM_PAINTING_CAPTIONS)\n        {\n        case CONTEST_CATEGORY_COOL:\n            RLUnCompVram(sPictureFrameTiles_Cool, (void *)VRAM);\n            RLUnCompWram(sPictureFrameTilemap_Cool, gContestMonPixels);\n            break;\n        case CONTEST_CATEGORY_BEAUTY:\n            RLUnCompVram(sPictureFrameTiles_Beauty, (void *)VRAM);\n            RLUnCompWram(sPictureFrameTilemap_Beauty, gContestMonPixels);\n            break;\n        case CONTEST_CATEGORY_CUTE:\n            RLUnCompVram(sPictureFrameTiles_Cute, (void *)VRAM);\n            RLUnCompWram(sPictureFrameTilemap_Cute, gContestMonPixels);\n            break;\n        case CONTEST_CATEGORY_SMART:\n            RLUnCompVram(sPictureFrameTiles_Smart, (void *)VRAM);\n            RLUnCompWram(sPictureFrameTilemap_Smart, gContestMonPixels);\n            break;\n        case CONTEST_CATEGORY_TOUGH:\n            RLUnCompVram(sPictureFrameTiles_Tough, (void *)VRAM);\n            RLUnCompWram(sPictureFrameTilemap_Tough, gContestMonPixels);\n            break;\n        }\n\n         \n        for (y = 0; y < 20; y++)\n        {\n            for (x = 0; x < 32; x++)\n                VRAM_PICTURE_DATA(x, y) = 0x1015;\n        }\n\n         \n        for (y = 0; y < 10; y++)\n        {\n            for (x = 0; x < 18; x++)\n                VRAM_PICTURE_DATA(x + 6, y + 2) = (*gContestMonPixels)[y + 2][x + 6];\n        }\n\n         \n        for (x = 0; x < 16; x++)\n            VRAM_PICTURE_DATA(x + 7, 2) = (*gContestMonPixels)[2][7];\n    }\n    else if (contestWinnerId < MUSEUM_CONTEST_WINNERS_START)\n    {\n         \n        RLUnCompVram(sPictureFrameTiles_HallLobby, (void *)VRAM);\n        RLUnCompVram(sPictureFrameTilemap_HallLobby, (void *)(BG_SCREEN_ADDR(12)));\n    }\n    else\n    {\n         \n        switch (gContestPaintingWinner->contestCategory / NUM_PAINTING_CAPTIONS)\n        {\n        case CONTEST_CATEGORY_COOL:\n            RLUnCompVram(sPictureFrameTiles_Cool, (void *)VRAM);\n            RLUnCompVram(sPictureFrameTilemap_Cool, (void *)(BG_SCREEN_ADDR(12)));\n            break;\n        case CONTEST_CATEGORY_BEAUTY:\n            RLUnCompVram(sPictureFrameTiles_Beauty, (void *)VRAM);\n            RLUnCompVram(sPictureFrameTilemap_Beauty, (void *)(BG_SCREEN_ADDR(12)));\n            break;\n        case CONTEST_CATEGORY_CUTE:\n            RLUnCompVram(sPictureFrameTiles_Cute, (void *)VRAM);\n            RLUnCompVram(sPictureFrameTilemap_Cute, (void *)(BG_SCREEN_ADDR(12)));\n            break;\n        case CONTEST_CATEGORY_SMART:\n            RLUnCompVram(sPictureFrameTiles_Smart, (void *)VRAM);\n            RLUnCompVram(sPictureFrameTilemap_Smart, (void *)(BG_SCREEN_ADDR(12)));\n            break;\n        case CONTEST_CATEGORY_TOUGH:\n            RLUnCompVram(sPictureFrameTiles_Tough, (void *)VRAM);\n            RLUnCompVram(sPictureFrameTilemap_Tough, (void *)(BG_SCREEN_ADDR(12)));\n            break;\n        }\n    }",
  },
  "PrintContestPaintingCaption": {
    returnType: "static void",
    params: "u8 contestType, bool8 isForArtist",
    callsTo: ["AddTextPrinterParameterized","BufferContestName","ConvertInternationalContestantName","CopyBgTilemapBufferToVram","GetStringCenterAlignXOffset","StringAppend","StringCopy","StringExpandPlaceholders"],
    lineCount: 23,
    bodyC: "int x;\n    u8 category;\n\n     \n    if (isForArtist == TRUE)\n        return;\n\n    category = gContestPaintingWinner->contestCategory;\n    if (contestType < MUSEUM_CONTEST_WINNERS_START)\n    {\n         \n        BufferContestName(gStringVar1, category);\n        StringAppend(gStringVar1, gText_Space);\n        StringAppend(gStringVar1, sContestRankNames[gContestPaintingWinner->contestRank]);\n        StringCopy(gStringVar2, gContestPaintingWinner->trainerName);\n        ConvertInternationalContestantName(gStringVar2);\n        StringCopy(gStringVar3, gContestPaintingWinner->monName);\n        StringExpandPlaceholders(gStringVar4, gContestHallPaintingCaption);\n    }\n    else\n    {\n         \n        StringCopy(gStringVar1, gContestPaintingWinner->monName);\n        StringExpandPlaceholders(gStringVar4, sMuseumCaptions[category]);\n    }\n\n    x = GetStringCenterAlignXOffset(FONT_NORMAL, gStringVar4, 208);\n    AddTextPrinterParameterized(sWindowId, FONT_NORMAL, gStringVar4, x, 1, 0, 0);\n    CopyBgTilemapBufferToVram(1);",
  },
  "SetContestWinnerForPainting": {
    returnType: "void",
    params: "int contestWinnerId",
    lineCount: 5,
    bodyC: "u8 *saveIdx = &gCurContestWinnerSaveIdx;\n    u8 *isForArtist = &gCurContestWinnerIsForArtist;\n    gCurContestWinner = gSaveBlock1Ptr->contestWinners[contestWinnerId - 1];\n    *saveIdx = contestWinnerId - 1;\n    *isForArtist = FALSE;",
  },
  "ShowContestPainting": {
    returnType: "static void",
    params: "void",
    callsTo: ["AllocateMonSpritesGfx","BeginFastPaletteFade","CreateContestPaintingPicture","DmaClear32","DmaFillLarge32","InitContestPaintingBg","InitContestPaintingVars","InitContestPaintingWindow","InitKeys","PrintContestPaintingCaption","ResetPaletteFade","ResetSpriteData","ScanlineEffect_Stop","SeedRng","SetBackdropFromPalette","SetGpuReg","SetMainCallback2","SetVBlankCallback"],
    lineCount: 38,
    bodyC: "switch (gMain.state)\n    {\n    case 0:\n        ScanlineEffect_Stop();\n        SetVBlankCallback(NULL);\n        AllocateMonSpritesGfx();\n        gContestPaintingWinner = &gCurContestWinner;\n        InitContestPaintingVars(TRUE);\n        InitContestPaintingBg();\n        gMain.state++;\n        break;\n    case 1:\n        ResetPaletteFade();\n        DmaFillLarge32(3, 0, (void *)VRAM, VRAM_SIZE, 0x1000);\n        ResetSpriteData();\n        gMain.state++;\n        break;\n    case 2:\n        SeedRng(gMain.vblankCounter1);\n        InitKeys();\n        InitContestPaintingWindow();\n        gMain.state++;\n        break;\n    case 3:\n        CreateContestPaintingPicture(gCurContestWinnerSaveIdx, gCurContestWinnerIsForArtist);\n        gMain.state++;\n        break;\n    case 4:\n        PrintContestPaintingCaption(gCurContestWinnerSaveIdx, gCurContestWinnerIsForArtist);\n        SetBackdropFromPalette(sBgPalette);\n        DmaClear32(3, PLTT, PLTT_SIZE);\n        BeginFastPaletteFade(2);\n        SetVBlankCallback(VBlankCB_ContestPainting);\n        sHoldState = 0;\n        SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_MODE_0 | DISPCNT_OBJ_1D_MAP | DISPCNT_BG0_ON | DISPCNT_BG1_ON | DISPCNT_OBJ_ON);\n        SetMainCallback2(CB2_HoldContestPainting);\n        break;\n    }",
  },
  "UpdateContestPaintingMosaicEffect": {
    returnType: "static void",
    params: "void",
    callsTo: ["BGCNT_CHARBASE","BGCNT_PRIORITY","BGCNT_SCREENBASE","SetGpuReg"],
    lineCount: 10,
    bodyC: "if (!sVarsInitialized)\n    {\n        SetGpuReg(REG_OFFSET_MOSAIC, 0);\n    }\n    else\n    {\n        SetGpuReg(REG_OFFSET_BG1CNT, BGCNT_PRIORITY(1) | BGCNT_CHARBASE(1) | BGCNT_SCREENBASE(10) | BGCNT_MOSAIC | BGCNT_16COLOR | BGCNT_TXT256x256);\n        sMosaicVal = sFadeCounter / 2;\n        SetGpuReg(REG_OFFSET_MOSAIC, (sMosaicVal << 12) | (sMosaicVal << 8) | (sMosaicVal << 4) | (sMosaicVal << 0));\n    }",
  },
  "VBlankCB_ContestPainting": {
    returnType: "static void",
    params: "void",
    callsTo: ["LoadOam","ProcessSpriteCopyRequests","TransferPlttBuffer","UpdateContestPaintingMosaicEffect"],
    lineCount: 4,
    bodyC: "UpdateContestPaintingMosaicEffect();\n    LoadOam();\n    ProcessSpriteCopyRequests();\n    TransferPlttBuffer();",
  },
  "_InitContestMonPixels": {
    returnType: "static void",
    params: "u8 *spriteGfx, u16 *palette, u16 (*destPixels)[64][64]",
    lineCount: 23,
    bodyC: "u16 tileY, tileX, pixelY, pixelX;\n    u8 colorIndex;\n\n    for (tileY = 0; tileY < 8; tileY++)\n    {\n        for (tileX = 0; tileX < 8; tileX++)\n        {\n            for (pixelY = 0; pixelY < 8; pixelY++)\n            {\n                for (pixelX = 0; pixelX < 8; pixelX++)\n                {\n                    colorIndex = spriteGfx[32 * (tileY * 8 + tileX) + (pixelY << 2) + (pixelX >> 1)];\n                    if (pixelX & 1)\n                        colorIndex >>= 4;\n                    else\n                        colorIndex &= 0xF;\n\n                    if (colorIndex == 0)  \n                        (*destPixels)[8 * tileY + pixelY][tileX * 8 + pixelX] = 0x8000;\n                    else\n                        (*destPixels)[8 * tileY + pixelY][tileX * 8 + pixelX] = palette[colorIndex];\n                }\n            }\n        }\n    }",
  },
} as const;
