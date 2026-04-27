// AUTO-GENERATED from src/title_screen.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 3 Task_, 6 CB2_, 5 SpriteCB_

export const TASKS = {
  "Task_TitleScreenPhase1": {
    callsTo: ["ARRAY_COUNT","BLDALPHA_BLEND","CreateSprite","JOY_NEW","SetGpuReg","StartPokemonLogoShine"],
    taskTransitions: ["Task_TitleScreenPhase2"],
    dataReads: ["tCounter","tSkipToNext"],
    dataWrites: ["tCounter","tSkipToNext"],
    externalChecks: { joyButtons: ["NEW:A_B_START_SELECT"] },
    lineCount: 31,
    bodyC: "if (JOY_NEW(A_B_START_SELECT) || gTasks[taskId].tSkipToNext)\n    {\n        gTasks[taskId].tSkipToNext = TRUE;\n        gTasks[taskId].tCounter = 0;\n    }\n\n    if (gTasks[taskId].tCounter != 0)\n    {\n        u16 frameNum = gTasks[taskId].tCounter;\n        if (frameNum == 176)\n            StartPokemonLogoShine(SHINE_MODE_DOUBLE);\n        else if (frameNum == 64)\n            StartPokemonLogoShine(SHINE_MODE_SINGLE);\n\n        gTasks[taskId].tCounter--;\n    }\n    else\n    {\n        u8 spriteId;\n\n        SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_MODE_1 | DISPCNT_OBJ_1D_MAP | DISPCNT_BG2_ON | DISPCNT_OBJ_ON);\n        SetGpuReg(REG_OFFSET_WININ, 0);\n        SetGpuReg(REG_OFFSET_WINOUT, 0);\n        SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_OBJ | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_ALL);\n        SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(16, 0));\n        SetGpuReg(REG_OFFSET_BLDY, 0);\n\n         \n        spriteId = CreateSprite(&sVersionBannerLeftSpriteTemplate, VERSION_BANNER_LEFT_X, VERSION_BANNER_Y, 0);\n        gSprites[spriteId].sAlphaBlendIdx = ARRAY_COUNT(gTitleScreenAlphaBlend);\n        gSprites[spriteId].sParentTaskId = taskId;\n\n         \n        spriteId = CreateSprite(&sVersionBannerRightSpriteTemplate, VERSION_BANNER_RIGHT_X, VERSION_BANNER_Y, 0);\n        gSprites[spriteId].sParentTaskId = taskId;\n\n        gTasks[taskId].tCounter = 144;\n        gTasks[taskId].func = Task_TitleScreenPhase2;\n    }",
  },
  "Task_TitleScreenPhase2": {
    callsTo: ["BLDALPHA_BLEND","CreateCopyrightBanner","CreatePressStartBanner","JOY_NEW","SetGpuReg"],
    taskTransitions: ["Task_TitleScreenPhase3"],
    dataReads: ["tBg2Y","tCounter","tPointless","tSkipToNext"],
    dataWrites: ["data[5]","data[6]","tBg1Y","tBg2Y","tCounter","tPointless","tSkipToNext"],
    externalChecks: { joyButtons: ["NEW:A_B_START_SELECT"] },
    lineCount: 36,
    bodyC: "u32 yPos;\n\n     \n    if (JOY_NEW(A_B_START_SELECT) || gTasks[taskId].tSkipToNext)\n    {\n        gTasks[taskId].tSkipToNext = TRUE;\n        gTasks[taskId].tCounter = 0;\n    }\n\n    if (gTasks[taskId].tCounter != 0)\n    {\n        gTasks[taskId].tCounter--;\n    }\n    else\n    {\n        gTasks[taskId].tSkipToNext = TRUE;\n        SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG1 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_BG0 | BLDCNT_TGT2_BD);\n        SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(6, 15));\n        SetGpuReg(REG_OFFSET_BLDY, 0);\n        SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_MODE_1\n                                    | DISPCNT_OBJ_1D_MAP\n                                    | DISPCNT_BG0_ON\n                                    | DISPCNT_BG1_ON\n                                    | DISPCNT_BG2_ON\n                                    | DISPCNT_OBJ_ON);\n        CreatePressStartBanner(START_BANNER_X, 108);\n        CreateCopyrightBanner(START_BANNER_X, 148);\n        gTasks[taskId].tBg1Y = 0;\n        gTasks[taskId].func = Task_TitleScreenPhase3;\n    }\n\n    if (!(gTasks[taskId].tCounter & 3) && gTasks[taskId].tPointless != 0)\n        gTasks[taskId].tPointless++;\n    if (!(gTasks[taskId].tCounter & 1) && gTasks[taskId].tBg2Y != 0)\n        gTasks[taskId].tBg2Y++;\n\n     \n    yPos = gTasks[taskId].tBg2Y * 256;\n    SetGpuReg(REG_OFFSET_BG2Y_L, yPos);\n    SetGpuReg(REG_OFFSET_BG2Y_H, yPos / 0x10000);\n\n    gTasks[taskId].data[5] = 15;  \n    gTasks[taskId].data[6] = 6;",
  },
  "Task_TitleScreenPhase3": {
    callsTo: ["BeginNormalPaletteFade","CanResetRTC","FadeOutBGM","JOY_HELD","JOY_NEW","SetGpuReg","SetMainCallback2","UpdateLegendaryMarkingColor"],
    cb2Transitions: ["CB2_GoToBerryFixScreen","CB2_GoToClearSaveDataScreen","CB2_GoToCopyrightScreen","CB2_GoToMainMenu","CB2_GoToResetRtcScreen"],
    dataReads: ["tBg1Y","tCounter"],
    dataWrites: ["tBg1Y"],
    externalChecks: { joyButtons: ["HELD:BERRY_UPDATE_BUTTON_COMBO","HELD:CLEAR_SAVE_BUTTON_COMBO","HELD:RESET_RTC_BUTTON_COMBO","NEW:A_BUTTON","NEW:START_BUTTON"] },
    lineCount: 40,
    bodyC: "if ((JOY_NEW(A_BUTTON)) || (JOY_NEW(START_BUTTON)))\n    {\n        FadeOutBGM(4);\n        BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_WHITEALPHA);\n        SetMainCallback2(CB2_GoToMainMenu);\n    }\n    else if (JOY_HELD(CLEAR_SAVE_BUTTON_COMBO) == CLEAR_SAVE_BUTTON_COMBO)\n    {\n        SetMainCallback2(CB2_GoToClearSaveDataScreen);\n    }\n    else if (JOY_HELD(RESET_RTC_BUTTON_COMBO) == RESET_RTC_BUTTON_COMBO\n      && CanResetRTC() == TRUE)\n    {\n        FadeOutBGM(4);\n        BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);\n        SetMainCallback2(CB2_GoToResetRtcScreen);\n    }\n    else if (JOY_HELD(BERRY_UPDATE_BUTTON_COMBO) == BERRY_UPDATE_BUTTON_COMBO)\n    {\n        FadeOutBGM(4);\n        BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);\n        SetMainCallback2(CB2_GoToBerryFixScreen);\n    }\n    else\n    {\n        SetGpuReg(REG_OFFSET_BG2Y_L, 0);\n        SetGpuReg(REG_OFFSET_BG2Y_H, 0);\n        if (++gTasks[taskId].tCounter & 1)\n        {\n            gTasks[taskId].tBg1Y++;\n            gBattle_BG1_Y = gTasks[taskId].tBg1Y / 2;\n            gBattle_BG1_X = 0;\n        }\n        UpdateLegendaryMarkingColor(gTasks[taskId].tCounter);\n        if ((gMPlayInfo_BGM.status & 0xFFFF) == 0)\n        {\n            BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_WHITEALPHA);\n            SetMainCallback2(CB2_GoToCopyrightScreen);\n        }\n    }",
  },
} as const;

export const CB2S = {
  "CB2_InitTitleScreen": {
    callsTo: ["BGCNT_CHARBASE","BGCNT_PRIORITY","BGCNT_SCREENBASE","BG_CHAR_ADDR","BG_PLTT_ID","BG_SCREEN_ADDR","BeginNormalPaletteFade","CreateTask","DmaFill16","DmaFill32","EnableInterrupts","FreeAllSpritePalettes","LZ77UnCompVram","LoadCompressedSpriteSheet","LoadPalette","LoadSpritePalette","OBJ_PLTT_ID","PanFadeAndZoomScreen","ResetPaletteFade","ResetSpriteData","ResetTasks","ScanlineEffect_InitWave","ScanlineEffect_Stop","SetGpuReg","SetMainCallback2","SetVBlankCallback","StartPokemonLogoShine","UpdatePaletteFade","m4aSongNumStart"],
    cb2Transitions: ["MainCB2"],
    lineCount: 97,
    bodyC: "switch (gMain.state)\n    {\n    default:\n    case 0:\n        SetVBlankCallback(NULL);\n        SetGpuReg(REG_OFFSET_BLDCNT, 0);\n        SetGpuReg(REG_OFFSET_BLDALPHA, 0);\n        SetGpuReg(REG_OFFSET_BLDY, 0);\n        *((u16 *)PLTT) = RGB_WHITE;\n        SetGpuReg(REG_OFFSET_DISPCNT, 0);\n        SetGpuReg(REG_OFFSET_BG2CNT, 0);\n        SetGpuReg(REG_OFFSET_BG1CNT, 0);\n        SetGpuReg(REG_OFFSET_BG0CNT, 0);\n        SetGpuReg(REG_OFFSET_BG2HOFS, 0);\n        SetGpuReg(REG_OFFSET_BG2VOFS, 0);\n        SetGpuReg(REG_OFFSET_BG1HOFS, 0);\n        SetGpuReg(REG_OFFSET_BG1VOFS, 0);\n        SetGpuReg(REG_OFFSET_BG0HOFS, 0);\n        SetGpuReg(REG_OFFSET_BG0VOFS, 0);\n        DmaFill16(3, 0, (void *)VRAM, VRAM_SIZE);\n        DmaFill32(3, 0, (void *)OAM, OAM_SIZE);\n        DmaFill16(3, 0, (void *)(PLTT + 2), PLTT_SIZE - 2);\n        ResetPaletteFade();\n        gMain.state = 1;\n        break;\n    case 1:\n         \n        LZ77UnCompVram(gTitleScreenPokemonLogoGfx, (void *)(BG_CHAR_ADDR(0)));\n        LZ77UnCompVram(gTitleScreenPokemonLogoTilemap, (void *)(BG_SCREEN_ADDR(9)));\n        LoadPalette(gTitleScreenBgPalettes, BG_PLTT_ID(0), 15 * PLTT_SIZE_4BPP);\n         \n        LZ77UnCompVram(sTitleScreenRayquazaGfx, (void *)(BG_CHAR_ADDR(2)));\n        LZ77UnCompVram(sTitleScreenRayquazaTilemap, (void *)(BG_SCREEN_ADDR(26)));\n         \n        LZ77UnCompVram(sTitleScreenCloudsGfx, (void *)(BG_CHAR_ADDR(3)));\n        LZ77UnCompVram(gTitleScreenCloudsTilemap, (void *)(BG_SCREEN_ADDR(27)));\n        ScanlineEffect_Stop();\n        ResetTasks();\n        ResetSpriteData();\n        FreeAllSpritePalettes();\n        gReservedSpritePaletteCount = 9;\n        LoadCompressedSpriteSheet(&sSpriteSheet_EmeraldVersion[0]);\n        LoadCompressedSpriteSheet(&sSpriteSheet_PressStart[0]);\n        LoadCompressedSpriteSheet(&sPokemonLogoShineSpriteSheet[0]);\n        LoadPalette(gTitleScreenEmeraldVersionPal, OBJ_PLTT_ID(0), PLTT_SIZE_4BPP);\n        LoadSpritePalette(&sSpritePalette_PressStart[0]);\n        gMain.state = 2;\n        break;\n    case 2:\n    {\n        u8 taskId = CreateTask(Task_TitleScreenPhase1, 0);\n\n        gTasks[taskId].tCounter = 256;\n        gTasks[taskId].tSkipToNext = FALSE;\n        gTasks[taskId].tPointless = -16;\n        gTasks[taskId].tBg2Y = -32;\n        gMain.state = 3;\n        break;\n    }\n    case 3:\n        BeginNormalPaletteFade(PALETTES_ALL, 1, 16, 0, RGB_WHITEALPHA);\n        SetVBlankCallback(VBlankCB);\n        gMain.state = 4;\n        break;\n    case 4:\n        PanFadeAndZoomScreen(DISPLAY_WIDTH / 2, DISPLAY_HEIGHT / 2, 0x100, 0);\n        SetGpuReg(REG_OFFSET_BG2X_L, -29 * 256);\n        SetGpuReg(REG_OFFSET_BG2X_H, -1);\n        SetGpuReg(REG_OFFSET_BG2Y_L, -32 * 256);\n        SetGpuReg(REG_OFFSET_BG2Y_H, -1);\n        SetGpuReg(REG_OFFSET_WIN0H, 0);\n        SetGpuReg(REG_OFFSET_WIN0V, 0);\n        SetGpuReg(REG_OFFSET_WIN1H, 0);\n        SetGpuReg(REG_OFFSET_WIN1V, 0);\n        SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN1_BG_ALL | WININ_WIN1_OBJ);\n        SetGpuReg(REG_OFFSET_WINOUT, WINOUT_WIN01_BG_ALL | WINOUT_WIN01_OBJ | WINOUT_WINOBJ_ALL);\n        SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG2 | BLDCNT_EFFECT_LIGHTEN);\n        SetGpuReg(REG_OFFSET_BLDALPHA, 0);\n        SetGpuReg(REG_OFFSET_BLDY, 12);\n        SetGpuReg(REG_OFFSET_BG0CNT, BGCNT_PRIORITY(3) | BGCNT_CHARBASE(2) | BGCNT_SCREENBASE(26) | BGCNT_16COLOR | BGCNT_TXT256x256);\n        SetGpuReg(REG_OFFSET_BG1CNT, BGCNT_PRIORITY(2) | BGCNT_CHARBASE(3) | BGCNT_SCREENBASE(27) | BGCNT_16COLOR | BGCNT_TXT256x256);\n        SetGpuReg(REG_OFFSET_BG2CNT, BGCNT_PRIORITY(1) | BGCNT_CHARBASE(0) | BGCNT_SCREENBASE(9) | BGCNT_256COLOR | BGCNT_AFF256x256);\n        EnableInterrupts(INTR_FLAG_VBLANK);\n        SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_MODE_1\n                                    | DISPCNT_OBJ_1D_MAP\n                                    | DISPCNT_BG2_ON\n                                    | DISPCNT_OBJ_ON\n                                    | DISPCNT_WIN0_ON\n                                    | DISPCNT_OBJWIN_ON);\n        m4aSongNumStart(MUS_TITLE);\n        gMain.state = 5;\n        break;\n    case 5:\n        if (!UpdatePaletteFade())\n        {\n            StartPokemonLogoShine(SHINE_MODE_SINGLE_NO_BG_COLOR);\n            ScanlineEffect_InitWave(0, DISPLAY_HEIGHT, 4, 4, 0, SCANLINE_EFFECT_REG_BG1HOFS, TRUE);\n            SetMainCallback2(MainCB2);\n        }\n        break;\n    }",
  },
  "CB2_GoToMainMenu": {
    callsTo: ["SetMainCallback2","UpdatePaletteFade"],
    cb2Transitions: ["CB2_InitMainMenu"],
    lineCount: 2,
    bodyC: "if (!UpdatePaletteFade())\n        SetMainCallback2(CB2_InitMainMenu);",
  },
  "CB2_GoToCopyrightScreen": {
    callsTo: ["SetMainCallback2","UpdatePaletteFade"],
    cb2Transitions: ["CB2_InitCopyrightScreenAfterTitleScreen"],
    lineCount: 2,
    bodyC: "if (!UpdatePaletteFade())\n        SetMainCallback2(CB2_InitCopyrightScreenAfterTitleScreen);",
  },
  "CB2_GoToClearSaveDataScreen": {
    callsTo: ["SetMainCallback2","UpdatePaletteFade"],
    cb2Transitions: ["CB2_InitClearSaveDataScreen"],
    lineCount: 2,
    bodyC: "if (!UpdatePaletteFade())\n        SetMainCallback2(CB2_InitClearSaveDataScreen);",
  },
  "CB2_GoToResetRtcScreen": {
    callsTo: ["SetMainCallback2","UpdatePaletteFade"],
    cb2Transitions: ["CB2_InitResetRtcScreen"],
    lineCount: 2,
    bodyC: "if (!UpdatePaletteFade())\n        SetMainCallback2(CB2_InitResetRtcScreen);",
  },
  "CB2_GoToBerryFixScreen": {
    callsTo: ["SetMainCallback2","UpdatePaletteFade","m4aMPlayAllStop"],
    cb2Transitions: ["CB2_InitBerryFixProgram"],
    lineCount: 5,
    bodyC: "if (!UpdatePaletteFade())\n    {\n        m4aMPlayAllStop();\n        SetMainCallback2(CB2_InitBerryFixProgram);\n    }",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_VersionBannerLeft": {
    callsTo: ["SetGpuReg"],
    lineCount: 13,
    bodyC: "if (gTasks[sprite->sParentTaskId].tSkipToNext)\n    {\n        sprite->oam.objMode = ST_OAM_OBJ_NORMAL;\n        sprite->y = VERSION_BANNER_Y_GOAL;\n    }\n    else\n    {\n        if (sprite->y != VERSION_BANNER_Y_GOAL)\n            sprite->y++;\n        if (sprite->sAlphaBlendIdx != 0)\n            sprite->sAlphaBlendIdx--;\n        SetGpuReg(REG_OFFSET_BLDALPHA, gTitleScreenAlphaBlend[sprite->sAlphaBlendIdx]);\n    }",
  },
  "SpriteCB_VersionBannerRight": {
    lineCount: 10,
    bodyC: "if (gTasks[sprite->sParentTaskId].tSkipToNext)\n    {\n        sprite->oam.objMode = ST_OAM_OBJ_NORMAL;\n        sprite->y = VERSION_BANNER_Y_GOAL;\n    }\n    else\n    {\n        if (sprite->y != VERSION_BANNER_Y_GOAL)\n            sprite->y++;\n    }",
  },
  "SpriteCB_PressStartCopyrightBanner": {
    lineCount: 11,
    bodyC: "if (sprite->sAnimate == TRUE)\n    {\n         \n        if (++sprite->sTimer & 16)\n            sprite->invisible = FALSE;\n        else\n            sprite->invisible = TRUE;\n    }\n    else\n    {\n        sprite->invisible = FALSE;\n    }",
  },
  "SpriteCB_PokemonLogoShine": {
    callsTo: ["DestroySprite","RGB","_RGB"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 35,
    bodyC: "if (sprite->x < DISPLAY_WIDTH + 32)\n    {\n         \n         \n        if (sprite->sMode != SHINE_MODE_SINGLE_NO_BG_COLOR)\n        {\n            u16 backgroundColor;\n\n            if (sprite->x < DISPLAY_WIDTH / 2)\n            {\n                 \n                if (sprite->sBgColor < 31)\n                    sprite->sBgColor++;\n                if (sprite->sBgColor < 31)\n                    sprite->sBgColor++;\n            }\n            else\n            {\n                 \n                if (sprite->sBgColor != 0)\n                    sprite->sBgColor--;\n                if (sprite->sBgColor != 0)\n                    sprite->sBgColor--;\n            }\n\n            backgroundColor = _RGB(sprite->sBgColor, sprite->sBgColor, sprite->sBgColor);\n\n             \n             \n            if (sprite->x == DISPLAY_WIDTH / 2 + (3 * SHINE_SPEED)\n             || sprite->x == DISPLAY_WIDTH / 2 + (4 * SHINE_SPEED)\n             || sprite->x == DISPLAY_WIDTH / 2 + (5 * SHINE_SPEED)\n             || sprite->x == DISPLAY_WIDTH / 2 + (6 * SHINE_SPEED))\n                gPlttBufferFaded[0] = RGB(24, 31, 12);\n            else\n                gPlttBufferFaded[0] = backgroundColor;\n        }\n\n        sprite->x += SHINE_SPEED;\n    }\n    else\n    {\n         \n        gPlttBufferFaded[0] = RGB_BLACK;\n        DestroySprite(sprite);\n    }",
  },
  "SpriteCB_PokemonLogoShine_Fast": {
    callsTo: ["DestroySprite"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 4,
    bodyC: "if (sprite->x < DISPLAY_WIDTH + 32)\n        sprite->x += SHINE_SPEED * 2;\n    else\n        DestroySprite(sprite);",
  },
} as const;
