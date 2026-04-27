// AUTO-GENERATED from src/cable_car.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 4 Task_, 3 CB2_, 5 SpriteCB_

export const TASKS = {
  "Task_LoadCableCar": {
    callsTo: ["DestroyTask","SetMainCallback2"],
    cb2Transitions: ["CB2_LoadCableCar"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 5,
    bodyC: "if (!gPaletteFade.active)\n    {\n        SetMainCallback2(CB2_LoadCableCar);\n        DestroyTask(taskId);\n    }",
  },
  "Task_CableCar": {
    callsTo: ["BeginNormalPaletteFade","DestroyTask","FadeOutBGM","SetMainCallback2","SetNextWeather","SetVBlankCallback"],
    cb2Transitions: ["CB2_EndCableCar"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 60,
    bodyC: "u8 i = 0;\n\n    sCableCar->timer++;\n    switch (sCableCar->state)\n    {\n    case 0:\n         \n        if (sCableCar->timer == sCableCar->weatherDelay)\n        {\n            SetNextWeather(sCableCar->weather);\n            sCableCar->state = 1;\n        }\n        break;\n    case 1:\n         \n        switch (sCableCar->weather)\n        {\n        case WEATHER_VOLCANIC_ASH:\n            if (gWeatherPtr->sprites.s2.ashSprites[0] != NULL && gWeatherPtr->sprites.s2.ashSprites[0]->oam.priority != 0)\n            {\n                for (; i < NUM_ASH_SPRITES; i++)\n                {\n                    if (gWeatherPtr->sprites.s2.ashSprites[i])\n                        gWeatherPtr->sprites.s2.ashSprites[i]->oam.priority = 0;\n                }\n\n                sCableCar->state = 2;\n            }\n            break;\n        case WEATHER_SUNNY:\n            if (gWeatherPtr->currWeather == WEATHER_SUNNY)\n            {\n                sCableCar->state = 2;\n            }\n            else if (sCableCar->timer >= sCableCar->weatherDelay + 8)\n            {\n                for (; i < NUM_ASH_SPRITES; i++)\n                {\n                    if (gWeatherPtr->sprites.s2.ashSprites[i])\n                        gWeatherPtr->sprites.s2.ashSprites[i]->invisible ^= 1;\n                }\n            }\n            break;\n        }\n        break;\n    case 2:\n         \n        if (sCableCar->timer == 570)\n        {\n            sCableCar->state = 3;\n            BeginNormalPaletteFade(PALETTES_ALL, 3, 0, 16, RGB_BLACK);\n            FadeOutBGM(4);\n        }\n        break;\n    case 3:\n         \n        if (!gPaletteFade.active)\n            sCableCar->state = STATE_END;\n        break;\n    case STATE_END:\n        SetVBlankCallback(NULL);\n        DestroyTask(taskId);\n        DestroyTask(sCableCar->bgTaskId);\n        SetMainCallback2(CB2_EndCableCar);\n        break;\n    }",
  },
  "Task_AnimateBgGoingUp": {
    callsTo: ["AnimateGroundGoingUp","CopyToBgTilemapBufferRect_ChangePalette","FillBgTilemapBufferRect"],
    lineCount: 30,
    bodyC: "if (sCableCar->state != STATE_END)\n    {\n        sCableCar->bg3HorizontalOffset--;\n        if ((sCableCar->timer % 2) == 0)\n            sCableCar->bg3VerticalOffset--;\n\n        if ((sCableCar->timer % 8) == 0)\n        {\n            sCableCar->bg1HorizontalOffset--;\n            sCableCar->bg1VerticalOffset--;\n        }\n\n        switch (sCableCar->bg3HorizontalOffset)\n        {\n        case 175:\n            FillBgTilemapBufferRect(3, 0, 0, 22, 2, 10, 17);\n            break;\n        case 40:\n            FillBgTilemapBufferRect(3, 0, 3, 0, 2, 2, 17);\n            break;\n        case 32:\n            FillBgTilemapBufferRect(3, 0, 2, 0, 1, 2, 17);\n            break;\n        case 16:\n            CopyToBgTilemapBufferRect_ChangePalette(3, sCableCar->pylonTopTilemap, 0, 0, 5,  2, 17);\n            CopyToBgTilemapBufferRect_ChangePalette(3, sCableCar->pylonPoleTilemap, 0, 2, 2, 30, 17);\n            sCableCar->bg3VerticalOffset = 64;\n            break;\n        }\n    }\n\n    AnimateGroundGoingUp();\n    gSpriteCoordOffsetX = (gSpriteCoordOffsetX + 1) % 128;",
  },
  "Task_AnimateBgGoingDown": {
    callsTo: ["AnimateGroundGoingDown","CopyToBgTilemapBufferRect_ChangePalette","FillBgTilemapBufferRect"],
    lineCount: 37,
    bodyC: "if (sCableCar->state != STATE_END)\n    {\n        sCableCar->bg3HorizontalOffset++;\n        if ((sCableCar->timer % 2) == 0)\n            sCableCar->bg3VerticalOffset++;\n\n        if ((sCableCar->timer % 8) == 0)\n        {\n            sCableCar->bg1HorizontalOffset++;\n            sCableCar->bg1VerticalOffset++;\n        }\n\n        switch (sCableCar->bg3HorizontalOffset)\n        {\n        case 176:\n            CopyToBgTilemapBufferRect_ChangePalette(3, sCableCar->pylonPoleTilemap, 0, 2, 2, 30, 17);\n            break;\n        case 16:\n            FillBgTilemapBufferRect(3, 0, 2,  0, 3,  2, 17);\n            FillBgTilemapBufferRect(3, 0, 0, 22, 2, 10, 17);\n            sCableCar->bg3VerticalOffset = 192;\n            break;\n        case 32:\n            FillBgTilemapBufferRect(3, sCableCar->pylonTopTilemap[2], 2, 0, 1, 1, 17);\n            FillBgTilemapBufferRect(3, sCableCar->pylonTopTilemap[3], 3, 0, 1, 1, 17);\n            FillBgTilemapBufferRect(3, sCableCar->pylonTopTilemap[7], 2, 1, 1, 1, 17);\n            FillBgTilemapBufferRect(3, sCableCar->pylonTopTilemap[8], 3, 1, 1, 1, 17);\n            break;\n        case 40:\n            FillBgTilemapBufferRect(3, sCableCar->pylonTopTilemap[4], 4, 0, 1, 1, 17);\n            FillBgTilemapBufferRect(3, sCableCar->pylonTopTilemap[9], 4, 1, 1, 1, 17);\n            break;\n        }\n    }\n\n    AnimateGroundGoingDown();\n    if (sCableCar->timer < sCableCar->weatherDelay)\n        gSpriteCoordOffsetX = (gSpriteCoordOffsetX + 247) % 248;\n    else\n        gWeatherPtr->ashBaseSpritesX = (gWeatherPtr->ashBaseSpritesX + 247) % 248;",
  },
} as const;

export const CB2S = {
  "CB2_LoadCableCar": {
    callsTo: ["ARRAY_COUNT","AllocZeroed","BG_PLTT_ID","BeginNormalPaletteFade","CopyToBgTilemapBufferRect_ChangePalette","CreateCableCarSprites","CreateTask","DecompressAndCopyTileDataToVram","DmaFill16Defvars","DmaFill32Defvars","DmaFillLarge16","FadeInNewBGM","FreeAllSpritePalettes","FreeTempTileDataBuffersIfPossible","InitBgsFromTemplates","InitGroundTilemapData","InitMapMusic","LoadCompressedSpriteSheet","LoadPalette","LoadSpritePalettes","ResetBgsAndClearDma3BusyFlags","ResetMapMusic","ResetPaletteFade","ResetSpriteData","ResetTasks","ResetTempTileDataBuffers","RunTasks","ScanlineEffect_Stop","SetBgRegs","SetBgTilemapBuffer","SetMainCallback2","SetVBlankCallback","StartWeather","malloc_and_decompress"],
    cb2Transitions: ["CB2_CableCar"],
    lineCount: 114,
    bodyC: "u16 imebak;\n    u8 i = 0;\n    u32 sizeOut = 0;\n\n    switch (gMain.state)\n    {\n    case 0:\n    default:\n        SetVBlankCallback(NULL);\n        SetBgRegs(FALSE);\n        ScanlineEffect_Stop();\n        DmaFillLarge16(3, 0, (void *)VRAM, VRAM_SIZE, 0x1000);\n        DmaFill32Defvars(3, 0, (void *)OAM, OAM_SIZE);\n        DmaFill16Defvars(3, 0, (void *)PLTT, PLTT_SIZE);\n        sCableCar = AllocZeroed(sizeof(*sCableCar));\n        gMain.state++;\n        break;\n    case 1:\n        ResetSpriteData();\n        ResetTasks();\n        FreeAllSpritePalettes();\n        ResetPaletteFade();\n        ResetTempTileDataBuffers();\n        StartWeather();\n        for (i = 0; i < NUM_ASH_SPRITES; i++)\n            gWeatherPtr->sprites.s2.ashSprites[i] = NULL;\n\n        InitMapMusic();\n        ResetMapMusic();\n        ResetBgsAndClearDma3BusyFlags(0);\n        InitBgsFromTemplates(0, sBgTemplates, ARRAY_COUNT(sBgTemplates));\n        SetBgTilemapBuffer(0, sCableCar->bgTilemapBuffers[0]);\n        SetBgTilemapBuffer(1, sCableCar->bgTilemapBuffers[1]);\n        SetBgTilemapBuffer(2, sCableCar->bgTilemapBuffers[2]);\n        SetBgTilemapBuffer(3, sCableCar->bgTilemapBuffers[3]);\n        gSpriteCoordOffsetX = gSpriteCoordOffsetY = 0;\n        gMain.state++;\n        break;\n    case 2:\n        for (i = 0; i < ARRAY_COUNT(sSpriteSheets) - 1; i++)\n            LoadCompressedSpriteSheet(&sSpriteSheets[i]);\n\n        LoadSpritePalettes(sSpritePalettes);\n        sCableCar->groundTilemap = malloc_and_decompress(sGround_Tilemap, &sizeOut);\n        sCableCar->treesTilemap = malloc_and_decompress(sTrees_Tilemap, &sizeOut);\n        sCableCar->bgMountainsTilemap = malloc_and_decompress(sBgMountains_Tilemap, &sizeOut);\n        sCableCar->pylonPoleTilemap = malloc_and_decompress(sPylonPole_Tilemap, &sizeOut);\n        sCableCar->pylonTopTilemap = sPylonTop_Tilemap;\n        DecompressAndCopyTileDataToVram(0, gCableCarBg_Gfx, 0, 0, 0);\n        gMain.state++;\n        break;\n    case 3:\n        if (!FreeTempTileDataBuffersIfPossible())\n        {\n            LoadPalette(gCableCarBg_Pal, BG_PLTT_ID(0), 4 * PLTT_SIZE_4BPP);\n            gMain.state++;\n        }\n        break;\n    case 4:\n        CreateCableCarSprites();\n        RunTasks();\n        gMain.state++;\n        break;\n    case 5:\n        if (sCableCar->weather == WEATHER_VOLCANIC_ASH)\n        {\n            gMain.state++;\n        }\n        else if (gWeatherPtr->sprites.s2.ashSprites[0])\n        {\n            for (i = 0; i < NUM_ASH_SPRITES; i++)\n            {\n                if (gWeatherPtr->sprites.s2.ashSprites[i])\n                    gWeatherPtr->sprites.s2.ashSprites[i]->oam.priority = 0;\n            }\n\n            gMain.state++;\n        }\n        break;\n    case 6:\n        CopyToBgTilemapBufferRect_ChangePalette(1, sCableCar->treesTilemap, 0, 17, 32, 15, 17);\n        CopyToBgTilemapBufferRect_ChangePalette(2, sCableCar->bgMountainsTilemap, 0, 0, 30, 20, 17);\n        CopyToBgTilemapBufferRect_ChangePalette(3, sCableCar->pylonTopTilemap, 0, 0, 5, 2, 17);\n        CopyToBgTilemapBufferRect_ChangePalette(3, sCableCar->pylonPoleTilemap, 0, 2, 2, 20, 17);\n        gMain.state++;\n        break;\n    case 7:\n        InitGroundTilemapData(GOING_DOWN);\n        CopyToBgTilemapBufferRect_ChangePalette(0, sCableCar->groundTilemap +  0x48,  0, 14, 12, 3, 17);\n        CopyToBgTilemapBufferRect_ChangePalette(0, sCableCar->groundTilemap +  0x6C, 12, 17, 12, 3, 17);\n        CopyToBgTilemapBufferRect_ChangePalette(0, sCableCar->groundTilemap +  0x90, 24, 20, 12, 3, 17);\n        CopyToBgTilemapBufferRect_ChangePalette(0, sCableCar->groundTilemap +   0x0,  0, 17, 12, 3, 17);\n        CopyToBgTilemapBufferRect_ChangePalette(0, sCableCar->groundTilemap +  0x24,  0, 20, 12, 3, 17);\n        CopyToBgTilemapBufferRect_ChangePalette(0, sCableCar->groundTilemap +   0x0, 12, 20, 12, 3, 17);\n        CopyToBgTilemapBufferRect_ChangePalette(0, sCableCar->groundTilemap +  0x24, 12, 23, 12, 3, 17);\n        CopyToBgTilemapBufferRect_ChangePalette(0, sCableCar->groundTilemap +   0x0, 24, 23, 12, 3, 17);\n        gMain.state++;\n        break;\n    case 8:\n        BeginNormalPaletteFade(PALETTES_ALL, 3, 16, 0, RGB_BLACK);\n        FadeInNewBGM(MUS_CABLE_CAR, 1);\n        SetBgRegs(TRUE);\n        gMain.state++;\n        break;\n    case 9:\n        imebak = REG_IME;\n        REG_IME = 0;\n        REG_IE |= INTR_FLAG_VBLANK;\n        REG_IME = imebak;\n        SetVBlankCallback(VBlankCB_CableCar);\n        SetMainCallback2(CB2_CableCar);\n        CreateTask(Task_CableCar, 0);\n        if (!GOING_DOWN)\n            sCableCar->bgTaskId = CreateTask(Task_AnimateBgGoingUp, 1);\n        else\n            sCableCar->bgTaskId = CreateTask(Task_AnimateBgGoingDown, 1);\n        break;\n    }",
  },
  "CB2_CableCar": {
    callsTo: ["AnimateSprites","BuildOamBuffer","MapMusicMain","RunTasks","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 5,
    bodyC: "RunTasks();\n    AnimateSprites();\n    BuildOamBuffer();\n    UpdatePaletteFade();\n    MapMusicMain();",
  },
  "CB2_EndCableCar": {
    callsTo: ["DmaFill16Defvars","DmaFill32Defvars","DmaFillLarge16","FREE_AND_SET_NULL","HideBg","ResetBgsAndClearDma3BusyFlags","ResetPaletteFade","ResetSpriteData","ResetTasks","SetBgRegs","SetCurrentAndNextWeatherNoDelay","SetMainCallback2","UnsetBgTilemapBuffer","WarpIntoMap"],
    cb2Transitions: ["CB2_LoadMap"],
    lineCount: 30,
    bodyC: "u8 i = 0;\n\n    HideBg(0);\n    HideBg(1);\n    HideBg(2);\n    HideBg(3);\n    SetBgRegs(FALSE);\n    gSpriteCoordOffsetX = 0;\n    SetCurrentAndNextWeatherNoDelay(WEATHER_NONE);\n    for (i = 0; i < NUM_ASH_SPRITES; i++)\n        gWeatherPtr->sprites.s2.ashSprites[i] = NULL;\n\n    ResetTasks();\n    ResetSpriteData();\n    ResetPaletteFade();\n    UnsetBgTilemapBuffer(0);\n    UnsetBgTilemapBuffer(1);\n    UnsetBgTilemapBuffer(2);\n    UnsetBgTilemapBuffer(3);\n    ResetBgsAndClearDma3BusyFlags(0);\n    sCableCar->pylonTopTilemap = NULL;\n    FREE_AND_SET_NULL(sCableCar->pylonPoleTilemap);\n    FREE_AND_SET_NULL(sCableCar->bgMountainsTilemap);\n    FREE_AND_SET_NULL(sCableCar->treesTilemap);\n    FREE_AND_SET_NULL(sCableCar->groundTilemap);\n    FREE_AND_SET_NULL(sCableCar);\n    DmaFillLarge16(3, 0, (void *)VRAM, VRAM_SIZE, 0x1000);\n    DmaFill32Defvars(3, 0, (void *)OAM, OAM_SIZE);\n    DmaFill16Defvars(3, 0, (void *)PLTT, PLTT_SIZE);\n    WarpIntoMap();\n    gFieldCallback = NULL;\n    SetMainCallback2(CB2_LoadMap);",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_Cable": {
    lineCount: 0,
    bodyC: "",
  },
  "SpriteCB_CableCar": {
    callsTo: ["S16TOPOSFLOAT"],
    lineCount: 13,
    bodyC: "if (sCableCar->state != STATE_END)\n    {\n        if (!GOING_DOWN)\n        {\n            sprite->x = sprite->sXPos - (u8)(0.14f * S16TOPOSFLOAT(sCableCar->timer));\n            sprite->y = sprite->sYPos - (u8)(0.067f * S16TOPOSFLOAT(sCableCar->timer));\n        }\n        else\n        {\n            sprite->x = sprite->sXPos + (u8)(0.14f * S16TOPOSFLOAT(sCableCar->timer));\n            sprite->y = sprite->sYPos + (u8)(0.067f * S16TOPOSFLOAT(sCableCar->timer));\n        }\n    }",
  },
  "SpriteCB_Player": {
    callsTo: ["S16TOPOSFLOAT"],
    lineCount: 32,
    bodyC: "if (sCableCar->state != STATE_END)\n    {\n         \n        if (!GOING_DOWN)\n        {\n            sprite->x = sprite->sXPos - (u8)(0.14f * S16TOPOSFLOAT(sCableCar->timer));\n            sprite->y = sprite->sYPos - (u8)(0.067f * S16TOPOSFLOAT(sCableCar->timer));\n        }\n        else\n        {\n            sprite->x = sprite->sXPos + (u8)(0.14f * S16TOPOSFLOAT(sCableCar->timer));\n            sprite->y = sprite->sYPos + (u8)(0.067f * S16TOPOSFLOAT(sCableCar->timer));\n        }\n\n         \n        switch (sprite->sState)\n        {\n        case 0:\n            sprite->y2 = 17;\n            if (sprite->sTimer++ > 9)\n            {\n                sprite->sTimer = 0;\n                sprite->sState++;\n            }\n            break;\n        default:\n            sprite->y2 = 16;\n            if (sprite->sTimer++ > 9)\n            {\n                sprite->sTimer = 0;\n                sprite->sState = 0;\n            }\n            break;\n        }\n    }",
  },
  "SpriteCB_HikerGoingUp": {
    callsTo: ["DestroySprite"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 26,
    bodyC: "if (sprite->sTimer == 0)\n    {\n        sprite->x += 2 * sprite->centerToCornerVecX;\n        sprite->y += 16 + sprite->centerToCornerVecY;\n    }\n\n    if (++sprite->sTimer >= sprite->sDelay)\n    {\n        switch (sprite->sSameDir)\n        {\n        case FALSE:\n            sprite->x++;\n            if ((sprite->sTimer % 4) == 0)\n                sprite->y++;\n            break;\n        case TRUE:\n             \n            if ((sprite->sTimer % 2) != 0)\n            {\n                sprite->x++;\n                if ((sprite->x % 4) == 0)\n                    sprite->y++;\n            }\n            break;\n        }\n\n        if (sprite->y > DISPLAY_HEIGHT)\n            DestroySprite(sprite);\n    }",
  },
  "SpriteCB_HikerGoingDown": {
    callsTo: ["DestroySprite"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 23,
    bodyC: "if (sprite->sTimer == 0)\n        sprite->y += 16 + sprite->centerToCornerVecY;\n\n    if (++sprite->sTimer >= sprite->sDelay)\n    {\n        switch (sprite->sSameDir)\n        {\n        case FALSE:\n            sprite->x--;\n            if ((sprite->sTimer % 4) == 0)\n                sprite->y--;\n            break;\n        case TRUE:\n             \n            if ((sprite->sTimer % 2) != 0)\n            {\n                sprite->x--;\n                if ((sprite->x % 4) == 0)\n                    sprite->y--;\n            }\n            break;\n        }\n\n        if (sprite->y < 80)\n            DestroySprite(sprite);\n    }",
  },
} as const;
