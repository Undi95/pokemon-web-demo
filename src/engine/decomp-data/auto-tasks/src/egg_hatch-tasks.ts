// AUTO-GENERATED from src/egg_hatch.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 2 Task_, 2 CB2_, 7 SpriteCB_

export const TASKS = {
  "Task_EggHatch": {
    callsTo: ["CleanupOverworldWindowsAndTilemaps","DestroyTask","SetMainCallback2"],
    cb2Transitions: ["CB2_LoadEggHatch"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 7,
    bodyC: "if (!gPaletteFade.active)\n    {\n        CleanupOverworldWindowsAndTilemaps();\n        SetMainCallback2(CB2_LoadEggHatch);\n        gFieldCallback = FieldCB_ContinueScriptHandleMusic;\n        DestroyTask(taskId);\n    }",
  },
  "Task_EggHatchPlayBGM": {
    callsTo: ["DestroyTask","PlayBGM","PlayRainStoppingSoundEffect","StopMapMusic"],
    dataReads: ["tTimer"],
    dataWrites: ["tTimer"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 13,
    bodyC: "if (gTasks[taskId].tTimer == 0)\n    {\n        StopMapMusic();\n        PlayRainStoppingSoundEffect();\n    }\n\n    if (gTasks[taskId].tTimer == 1)\n        PlayBGM(MUS_EVOLUTION_INTRO);\n\n    if (gTasks[taskId].tTimer > 60)\n    {\n        PlayBGM(MUS_EVOLUTION);\n        DestroyTask(taskId);\n    }\n    gTasks[taskId].tTimer++;",
  },
} as const;

export const CB2S = {
  "CB2_LoadEggHatch": {
    callsTo: ["ARRAY_COUNT","AddHatchedMonToParty","Alloc","AllocateMonSpritesGfx","AnimateSprites","BG_PLTT_ID","BuildOamBuffer","ChangeBgX","ChangeBgY","CopyBgTilemapBufferToVram","CopyToBgTilemapBuffer","DeactivateAllTextPrinters","DecompressAndLoadBgGfxUsingHeap","EggHatchCreateMonSprite","FreeAllSpritePalettes","GetCurrentMapMusic","InitBgsFromTemplates","InitWindows","LoadBgTiles","LoadCompressedPalette","LoadPalette","LoadSpritePalette","LoadSpriteSheet","ResetBgsAndClearDma3BusyFlags","ResetPaletteFade","ResetSpriteData","ResetTasks","ResetTempTileDataBuffers","RunTasks","RunTextPrinters","ScanlineEffect_Stop","SetBgAttribute","SetBgTilemapBuffer","SetGpuReg","SetMainCallback2","SetVBlankCallback","UpdatePaletteFade","m4aSoundVSyncOn"],
    cb2Transitions: ["CB2_EggHatch"],
    externalChecks: { waitForVBlank: true },
    lineCount: 77,
    bodyC: "switch (gMain.state)\n    {\n    case 0:\n        SetGpuReg(REG_OFFSET_DISPCNT, 0);\n\n        sEggHatchData = Alloc(sizeof(*sEggHatchData));\n        AllocateMonSpritesGfx();\n        sEggHatchData->eggPartyId = gSpecialVar_0x8004;\n        sEggHatchData->eggShardVelocityId = 0;\n\n        SetVBlankCallback(VBlankCB_EggHatch);\n        gSpecialVar_0x8005 = GetCurrentMapMusic();\n\n        ResetTempTileDataBuffers();\n        ResetBgsAndClearDma3BusyFlags(0);\n        InitBgsFromTemplates(0, sBgTemplates_EggHatch, ARRAY_COUNT(sBgTemplates_EggHatch));\n\n        ChangeBgX(1, 0, BG_COORD_SET);\n        ChangeBgY(1, 0, BG_COORD_SET);\n        ChangeBgX(0, 0, BG_COORD_SET);\n        ChangeBgY(0, 0, BG_COORD_SET);\n\n        SetBgAttribute(1, BG_ATTR_PRIORITY, 2);\n        SetBgTilemapBuffer(1, Alloc(0x1000));\n        SetBgTilemapBuffer(0, Alloc(0x2000));\n\n        DeactivateAllTextPrinters();\n        ResetPaletteFade();\n        FreeAllSpritePalettes();\n        ResetSpriteData();\n        ResetTasks();\n        ScanlineEffect_Stop();\n        m4aSoundVSyncOn();\n        gMain.state++;\n        break;\n    case 1:\n        InitWindows(sWinTemplates_EggHatch);\n        sEggHatchData->windowId = 0;\n        gMain.state++;\n        break;\n    case 2:\n        DecompressAndLoadBgGfxUsingHeap(0, gBattleTextboxTiles, 0, 0, 0);\n        CopyToBgTilemapBuffer(0, gBattleTextboxTilemap, 0, 0);\n        LoadCompressedPalette(gBattleTextboxPalette, BG_PLTT_ID(0), PLTT_SIZE_4BPP);\n        gMain.state++;\n        break;\n    case 3:\n        LoadSpriteSheet(&sEggHatch_Sheet);\n        LoadSpriteSheet(&sEggShards_Sheet);\n        LoadSpritePalette(&sEgg_SpritePalette);\n        gMain.state++;\n        break;\n    case 4:\n        CopyBgTilemapBufferToVram(0);\n        AddHatchedMonToParty(sEggHatchData->eggPartyId);\n        gMain.state++;\n        break;\n    case 5:\n        EggHatchCreateMonSprite(FALSE, 0, sEggHatchData->eggPartyId, &sEggHatchData->species);\n        gMain.state++;\n        break;\n    case 6:\n        sEggHatchData->monSpriteId = EggHatchCreateMonSprite(FALSE, 1, sEggHatchData->eggPartyId, &sEggHatchData->species);\n        gMain.state++;\n        break;\n    case 7:\n        SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);\n        LoadPalette(gTradeGba2_Pal, BG_PLTT_ID(1), 5 * PLTT_SIZE_4BPP);\n        LoadBgTiles(1, gTradeGba_Gfx, 0x1420, 0);\n        CopyToBgTilemapBuffer(1, gTradePlatform_Tilemap, 0x1000, 0);\n        CopyBgTilemapBufferToVram(1);\n        gMain.state++;\n        break;\n    case 8:\n        SetMainCallback2(CB2_EggHatch);\n        sEggHatchData->state = 0;\n        break;\n    }\n    RunTasks();\n    RunTextPrinters();\n    AnimateSprites();\n    BuildOamBuffer();\n    UpdatePaletteFade();",
  },
  "CB2_EggHatch": {
    callsTo: ["AnimateSprites","BG_PLTT_ID","BeginNormalPaletteFade","BuildOamBuffer","CopyWindowToVram","CreateSprite","CreateTask","CreateYesNoMenu","DoMonFrontSpriteAnimation","DoNamingScreen","EggHatchPrintMessage","FillWindowPixelBuffer","Free","FreeMonSpritesGfx","GetMonData","GetMonGender","GetMonNickname2","IsFanfareTaskInactive","IsTextPrinterActive","LoadUserWindowBorderGfx","Menu_ProcessInputNoWrapClearOnChoose","PIXEL_FILL","PlayFanfare","PutWindowTilemap","RemoveWindow","RunTasks","RunTextPrinters","SetMainCallback2","ShowBg","StringExpandPlaceholders","UnsetBgTilemapBuffer","UpdatePaletteFade"],
    cb2Transitions: ["CB2_ReturnToField"],
    externalChecks: { paletteFade: true, waitForVBlank: true, msgBoxIsCancel: true },
    lineCount: 108,
    bodyC: "u16 species;\n    u8 gender;\n    u32 personality;\n\n    switch (sEggHatchData->state)\n    {\n    case 0:\n        BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK);\n        sEggHatchData->eggSpriteId = CreateSprite(&sSpriteTemplate_Egg, EGG_X, EGG_Y, 5);\n        ShowBg(0);\n        ShowBg(1);\n        sEggHatchData->state++;\n        CreateTask(Task_EggHatchPlayBGM, 5);\n        break;\n    case 1:\n        if (!gPaletteFade.active)\n        {\n            FillWindowPixelBuffer(sEggHatchData->windowId, PIXEL_FILL(0));\n            sEggHatchData->delayTimer = 0;\n            sEggHatchData->state++;\n        }\n        break;\n    case 2:\n        if (++sEggHatchData->delayTimer > 30)\n        {\n             \n            sEggHatchData->state++;\n            gSprites[sEggHatchData->eggSpriteId].callback = SpriteCB_Egg_Shake1;\n        }\n        break;\n    case 3:\n         \n        if (gSprites[sEggHatchData->eggSpriteId].callback == SpriteCallbackDummy)\n        {\n            species = GetMonData(&gPlayerParty[sEggHatchData->eggPartyId], MON_DATA_SPECIES);\n            DoMonFrontSpriteAnimation(&gSprites[sEggHatchData->monSpriteId], species, FALSE, 1);\n            sEggHatchData->state++;\n        }\n        break;\n    case 4:\n         \n        if (gSprites[sEggHatchData->monSpriteId].callback == SpriteCallbackDummy)\n            sEggHatchData->state++;\n        break;\n    case 5:\n         \n        GetMonNickname2(&gPlayerParty[sEggHatchData->eggPartyId], gStringVar1);\n        StringExpandPlaceholders(gStringVar4, gText_HatchedFromEgg);\n        EggHatchPrintMessage(sEggHatchData->windowId, gStringVar4, 0, 3, TEXT_SKIP_DRAW);\n        PlayFanfare(MUS_EVOLVED);\n        sEggHatchData->state++;\n        PutWindowTilemap(sEggHatchData->windowId);\n        CopyWindowToVram(sEggHatchData->windowId, COPYWIN_FULL);\n        break;\n    case 6:\n        if (IsFanfareTaskInactive())\n            sEggHatchData->state++;\n        break;\n    case 7:  \n        if (IsFanfareTaskInactive())\n            sEggHatchData->state++;\n        break;\n    case 8:\n         \n        GetMonNickname2(&gPlayerParty[sEggHatchData->eggPartyId], gStringVar1);\n        StringExpandPlaceholders(gStringVar4, gText_NicknameHatchPrompt);\n        EggHatchPrintMessage(sEggHatchData->windowId, gStringVar4, 0, 2, 1);\n        sEggHatchData->state++;\n        break;\n    case 9:\n         \n        if (!IsTextPrinterActive(sEggHatchData->windowId))\n        {\n            LoadUserWindowBorderGfx(sEggHatchData->windowId, 0x140, BG_PLTT_ID(14));\n            CreateYesNoMenu(&sYesNoWinTemplate, 0x140, 0xE, 0);\n            sEggHatchData->state++;\n        }\n        break;\n    case 10:\n         \n        switch (Menu_ProcessInputNoWrapClearOnChoose())\n        {\n        case 0:  \n            GetMonNickname2(&gPlayerParty[sEggHatchData->eggPartyId], gStringVar3);\n            species = GetMonData(&gPlayerParty[sEggHatchData->eggPartyId], MON_DATA_SPECIES);\n            gender = GetMonGender(&gPlayerParty[sEggHatchData->eggPartyId]);\n            personality = GetMonData(&gPlayerParty[sEggHatchData->eggPartyId], MON_DATA_PERSONALITY, 0);\n            DoNamingScreen(NAMING_SCREEN_NICKNAME, gStringVar3, species, gender, personality, EggHatchSetMonNickname);\n            break;\n        case 1:  \n        case MENU_B_PRESSED:\n            sEggHatchData->state++;\n            break;\n        }\n        break;\n    case 11:\n        BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);\n        sEggHatchData->state++;\n        break;\n    case 12:\n        if (!gPaletteFade.active)\n        {\n            FreeMonSpritesGfx();\n            RemoveWindow(sEggHatchData->windowId);\n            UnsetBgTilemapBuffer(0);\n            UnsetBgTilemapBuffer(1);\n            Free(sEggHatchData);\n            SetMainCallback2(CB2_ReturnToField);\n        }\n        break;\n    }\n\n    RunTasks();\n    RunTextPrinters();\n    AnimateSprites();\n    BuildOamBuffer();\n    UpdatePaletteFade();",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_Egg_Shake1": {
    callsTo: ["CreateRandomEggShardSprite","PlaySE","Sin","StartSpriteAnim"],
    spriteTransitions: ["SpriteCB_Egg_Shake2"],
    lineCount: 16,
    bodyC: "if (++sprite->sTimer > 20)\n    {\n        sprite->callback = SpriteCB_Egg_Shake2;\n        sprite->sTimer = 0;\n    }\n    else\n    {\n         \n        sprite->sSinIdx = (sprite->sSinIdx + 20) & 0xFF;\n        sprite->x2 = Sin(sprite->sSinIdx, 1);\n        if (sprite->sTimer == 15)\n        {\n             \n            PlaySE(SE_BALL);\n            StartSpriteAnim(sprite, EGG_ANIM_CRACKED_1);\n            CreateRandomEggShardSprite();\n        }\n    }",
  },
  "SpriteCB_Egg_Shake2": {
    callsTo: ["PlaySE","Sin","StartSpriteAnim"],
    spriteTransitions: ["SpriteCB_Egg_Shake3"],
    lineCount: 19,
    bodyC: "if (++sprite->sDelayTimer > 30)\n    {\n        if (++sprite->sTimer > 20)\n        {\n            sprite->callback = SpriteCB_Egg_Shake3;\n            sprite->sTimer = 0;\n            sprite->sDelayTimer = 0;\n        }\n        else\n        {\n             \n            sprite->sSinIdx = (sprite->sSinIdx + 20) & 0xFF;\n            sprite->x2 = Sin(sprite->sSinIdx, 2);\n            if (sprite->sTimer == 15)\n            {\n                 \n                PlaySE(SE_BALL);\n                StartSpriteAnim(sprite, EGG_ANIM_CRACKED_2);\n            }\n        }\n    }",
  },
  "SpriteCB_Egg_Shake3": {
    callsTo: ["CreateRandomEggShardSprite","GetMonData","PlaySE","Sin","StartSpriteAnim"],
    spriteTransitions: ["SpriteCB_Egg_WaitHatch"],
    lineCount: 30,
    bodyC: "if (++sprite->sDelayTimer > 30)\n    {\n        if (++sprite->sTimer > 38)\n        {\n            u16 UNUSED species;\n            sprite->callback = SpriteCB_Egg_WaitHatch;\n            sprite->sTimer = 0;\n            species = GetMonData(&gPlayerParty[sEggHatchData->eggPartyId], MON_DATA_SPECIES);\n            gSprites[sEggHatchData->monSpriteId].x2 = 0;\n            gSprites[sEggHatchData->monSpriteId].y2 = 0;\n        }\n        else\n        {\n             \n            sprite->sSinIdx = (sprite->sSinIdx + 20) & 0xFF;\n            sprite->x2 = Sin(sprite->sSinIdx, 2);\n            if (sprite->sTimer == 15)\n            {\n                 \n                 \n                 \n                PlaySE(SE_BALL);\n            #ifdef BUGFIX\n                StartSpriteAnim(sprite, EGG_ANIM_CRACKED_3);\n            #else\n                StartSpriteAnim(sprite, EGG_ANIM_CRACKED_2);\n            #endif\n                CreateRandomEggShardSprite();\n                CreateRandomEggShardSprite();\n            }\n            if (sprite->sTimer == 30)\n                PlaySE(SE_BALL);\n        }\n    }",
  },
  "SpriteCB_Egg_WaitHatch": {
    spriteTransitions: ["SpriteCB_Egg_Hatch"],
    lineCount: 5,
    bodyC: "if (++sprite->sTimer > 50)\n    {\n        sprite->callback = SpriteCB_Egg_Hatch;\n        sprite->sTimer = 0;\n    }",
  },
  "SpriteCB_Egg_Hatch": {
    callsTo: ["BeginNormalPaletteFade","CreateRandomEggShardSprite","PlaySE"],
    spriteTransitions: ["SpriteCB_Egg_Reveal"],
    externalChecks: { paletteFade: true },
    lineCount: 16,
    bodyC: "s16 i;\n\n     \n    if (sprite->sTimer == 0)\n        BeginNormalPaletteFade(PALETTES_ALL, -1, 0, 16, RGB_WHITEALPHA);\n\n     \n    if ((u32)sprite->sTimer < 4)\n    {\n        for (i = 0; i < 4; i++)\n            CreateRandomEggShardSprite();\n    }\n\n    sprite->sTimer++;\n\n    if (!gPaletteFade.active)\n    {\n         \n        PlaySE(SE_EGG_HATCH);\n        sprite->invisible = TRUE;\n        sprite->callback = SpriteCB_Egg_Reveal;\n        sprite->sTimer = 0;\n    }",
  },
  "SpriteCB_Egg_Reveal": {
    callsTo: ["BeginNormalPaletteFade","StartSpriteAffineAnim"],
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 12,
    bodyC: "if (sprite->sTimer == 0)\n    {\n         \n        gSprites[sEggHatchData->monSpriteId].invisible = FALSE;\n        StartSpriteAffineAnim(&gSprites[sEggHatchData->monSpriteId], BATTLER_AFFINE_EMERGE);\n    }\n\n     \n    if (sprite->sTimer == 8)\n        BeginNormalPaletteFade(PALETTES_ALL, -1, 16, 0, RGB_WHITEALPHA);\n\n    if (sprite->sTimer <= 9)\n        gSprites[sEggHatchData->monSpriteId].y--;\n\n    if (sprite->sTimer > 40)\n        sprite->callback = SpriteCallbackDummy;  \n\n    sprite->sTimer++;",
  },
  "SpriteCB_EggShard": {
    callsTo: ["DestroySprite"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 7,
    bodyC: "sprite->sDeltaX += sprite->sVelocX;\n    sprite->sDeltaY += sprite->sVelocY;\n\n    sprite->x2 = sprite->sDeltaX / 256;\n    sprite->y2 = sprite->sDeltaY / 256;\n\n    sprite->sVelocY += sprite->sAccelY;\n\n    if (sprite->y + sprite->y2 > sprite->y + 20 && sprite->sVelocY > 0)\n        DestroySprite(sprite);",
  },
} as const;
