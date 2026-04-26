// AUTO-GENERATED from src/slot_machine.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 10 Task_, 2 CB2_, 26 SpriteCB_

export const TASKS = {
  "Task_FadeToSlotMachine": {
    callsTo: ["BeginNormalPaletteFade","DestroyTask","SetMainCallback2"],
    cb2Transitions: ["CB2_SlotMachineSetup"],
    dataReads: ["tState"],
    dataWrites: ["tState"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 14,
    bodyC: "switch (gTasks[taskId].tState)\n    {\n    case 0:\n        BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 0x10, RGB_BLACK);\n        gTasks[taskId].tState++;\n        break;\n    case 1:\n        if (!gPaletteFade.active)\n        {\n            SetMainCallback2(CB2_SlotMachineSetup);\n            DestroyTask(taskId);\n        }\n        break;\n    }",
  },
  "Task_SlotMachine": {
    lineCount: 2,
    bodyC: "while (sSlotTasks[sSlotMachine->state](&gTasks[taskId]))\n        ;",
  },
  "Task_Payout": {
    dataReads: ["data[0]"],
    lineCount: 2,
    bodyC: "while (sPayoutTasks[gTasks[taskId].data[0]](&gTasks[taskId]))\n        ;",
  },
  "Task_Reel": {
    dataReads: ["tState"],
    lineCount: 2,
    bodyC: "while (sReelTasks[gTasks[taskId].tState](&gTasks[taskId]))\n        ;",
  },
  "Task_PressStopReelButton": {
    dataReads: ["data[0]"],
    lineCount: 1,
    bodyC: "sReelStopButtonTasks[gTasks[taskId].data[0]](&gTasks[taskId], taskId);",
  },
  "Task_FlashSlotMachineLights": {
    callsTo: ["BG_PLTT_ID","LoadPalette"],
    lineCount: 9,
    bodyC: "struct Task *task = &gTasks[taskId];\n    if (!task->sDelayTimer--)\n    {\n        task->sDelayTimer = 4;\n        task->sFlashState += task->sFlashDir;\n        if (task->sFlashState == 0 || task->sFlashState == 2)\n            task->sFlashDir = -task->sFlashDir;\n    }\n    LoadPalette(sFlashingLightsPalTable[task->sFlashState], BG_PLTT_ID(1), PLTT_SIZE_4BPP);",
  },
  "Task_CreatePikaPowerBolt": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "sPikaPowerBoltTasks[gTasks[taskId].tState](&gTasks[taskId]);",
  },
  "Task_ReelTime": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "sReelTimeTasks[gTasks[taskId].tState](&gTasks[taskId]);",
  },
  "Task_InfoBox": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "sInfoBoxTasks[gTasks[taskId].tState](&gTasks[taskId]);",
  },
  "Task_DigitalDisplay": {
    dataReads: ["data[0]"],
    lineCount: 1,
    bodyC: "sDigitalDisplayTasks[gTasks[taskId].data[0]](&gTasks[taskId]);",
  },
} as const;

export const CB2S = {
  "CB2_SlotMachineSetup": {
    callsTo: ["AllocDigitalDisplayGfx","BeginNormalPaletteFade","CreateGameplayTasks","CreateSlotMachineSprites","InitSlotMachine","SetDigitalDisplayImagePtrs","SetMainCallback2","ShowBg","SlotMachineSetup_InitBgsWindows","SlotMachineSetup_InitGpuRegs","SlotMachineSetup_InitOAM","SlotMachineSetup_InitPalsSpritesTasks","SlotMachineSetup_InitTilemaps","SlotMachineSetup_InitVBlank","SlotMachineSetup_InitVRAM","SlotMachineSetup_LoadGfxAndTilemaps"],
    cb2Transitions: ["CB2_SlotMachine"],
    lineCount: 57,
    bodyC: "switch (gMain.state)\n    {\n        case 0:\n            SlotMachineSetup_InitBgsWindows();\n            InitSlotMachine();\n            gMain.state++;\n            break;\n        case 1:\n            SlotMachineSetup_InitVRAM();\n            gMain.state++;\n            break;\n        case 2:\n            SlotMachineSetup_InitOAM();\n            SlotMachineSetup_InitGpuRegs();\n            gMain.state++;\n            break;\n        case 3:\n            SlotMachineSetup_InitPalsSpritesTasks();\n            gMain.state++;\n            break;\n        case 4:\n            SlotMachineSetup_InitTilemaps();\n            gMain.state++;\n            break;\n        case 5:\n            SlotMachineSetup_LoadGfxAndTilemaps();\n            gMain.state++;\n            break;\n        case 6:\n            SlotMachineSetup_InitVBlank();\n            gMain.state++;\n            break;\n        case 7:\n            BeginNormalPaletteFade(-1, 0, 0x10, 0, RGB_BLACK);\n            ShowBg(0);\n            ShowBg(1);\n            ShowBg(2);\n            ShowBg(3);\n            gMain.state++;\n            break;\n        case 8:\n            AllocDigitalDisplayGfx();\n            gMain.state++;\n            break;\n        case 9:\n            SetDigitalDisplayImagePtrs();\n            gMain.state++;\n            break;\n        case 10:\n            CreateSlotMachineSprites();\n            CreateGameplayTasks();\n            gMain.state++;\n            break;\n        case 11:\n            SetMainCallback2(CB2_SlotMachine);\n            break;\n    }",
  },
  "CB2_SlotMachine": {
    callsTo: ["AnimateSprites","BuildOamBuffer","RunTasks","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 4,
    bodyC: "RunTasks();\n    AnimateSprites();\n    BuildOamBuffer();\n    UpdatePaletteFade();",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_FlashMatchingLines": {
    callsTo: ["MultiplyPaletteRGBComponents"],
    lineCount: 27,
    bodyC: "s16 maxColorChange;\n    if (sprite->sFlashing)\n    {\n        if (!sprite->sDelayTimer--)\n        {\n            sprite->sAtOriginalColor = FALSE;\n            sprite->sDelayTimer = 1;\n            sprite->sColor += sprite->sColorIncr;\n            maxColorChange = 4;\n            if (sprite->sNumFullFlashes)\n                maxColorChange = 8;\n            if (sprite->sColor <= 0)\n            {\n                 \n                sprite->sAtOriginalColor = TRUE;\n                sprite->sColorIncr = -sprite->sColorIncr;\n                if (sprite->sNumFullFlashes)\n                    sprite->sNumFullFlashes--;\n            }\n            else if (sprite->sColor >= maxColorChange)\n            {\n                 \n                sprite->sColorIncr = -sprite->sColorIncr;\n            }\n            if (sprite->sNumFullFlashes)\n                sprite->sDelayTimer <<= 1;\n        }\n        MultiplyPaletteRGBComponents(sMatchLinePalOffsets[sprite->sMatchLineId], sprite->sColor, sprite->sColor, sprite->sColor);\n    }",
  },
  "SpriteCB_ReelSymbol": {
    callsTo: ["GetSpriteTileStartByTag","GetSymbolAtRest","SetSpriteSheetFrameTileNum"],
    lineCount: 5,
    bodyC: "sprite->data[2] = sSlotMachine->reelPixelOffsets[sprite->data[0]] + sprite->data[1];\n    sprite->data[2] %= 120;\n    sprite->y = sSlotMachine->reelShockOffsets[sprite->data[0]] + 28 + sprite->data[2];\n    sprite->sheetTileStart = GetSpriteTileStartByTag(GetSymbolAtRest(sprite->data[0], sprite->data[2] / 24));\n    SetSpriteSheetFrameTileNum(sprite);",
  },
  "SpriteCB_CoinNumber": {
    callsTo: ["GetSpriteTileStartByTag","SetSpriteSheetFrameTileNum"],
    lineCount: 12,
    bodyC: "u16 tag = sSlotMachine->coins;\n    if (sprite->sIsPayout)\n        tag = sSlotMachine->payout;\n    if (sprite->sCurNum != tag)\n    {\n         \n        sprite->sCurNum = tag;\n        tag %= (u16)sprite->sDigitMax;\n        tag /= (u16)sprite->sDigitMin;\n\n        tag += GFXTAG_NUM_0;\n        sprite->sheetTileStart = GetSpriteTileStartByTag(tag);\n        SetSpriteSheetFrameTileNum(sprite);\n    }",
  },
  "SpriteCB_ReelTimePikachu": {
    lineCount: 7,
    bodyC: "sprite->y2 = sprite->x2 = 0;\n    if (sprite->animNum == 4)\n    {\n        sprite->y2 = sprite->x2 = 8;\n        if ((sprite->animCmdIndex != 0 && sprite->animDelayCounter != 0) || (sprite->animCmdIndex == 0 && sprite->animDelayCounter == 0))\n            sprite->y2 = -8;\n    }",
  },
  "SpriteCB_ReelTimeNumbers": {
    callsTo: ["GetReelTimeSymbol","StartSpriteAnimIfDifferent"],
    lineCount: 4,
    bodyC: "s16 r0 = (u16)(sSlotMachine->reeltimePixelOffset + sprite->data[7]);\n    r0 %= 40;\n    sprite->y = r0 + 59;\n    StartSpriteAnimIfDifferent(sprite, GetReelTimeSymbol(r0 / 20));",
  },
  "SpriteCB_ReelTimeBolt": {
    lineCount: 18,
    bodyC: "if (sprite->sDelayTimer != 0)\n    {\n        sprite->sDelayTimer--;\n        sprite->x2 = 0;\n        sprite->y2 = 0;\n        sprite->invisible = TRUE;\n    }\n    else\n    {\n        sprite->invisible = FALSE;\n        sprite->x2 += sprite->sXDir;\n        sprite->y2 += sprite->sYDir;\n        if (++sprite->sCounter >= 8)\n        {\n            sprite->sDelayTimer = sprite->sDelay;\n            sprite->sCounter = 0;\n        }\n    }",
  },
  "SpriteCB_ReelTimePikachuAura": {
    callsTo: ["IndexOfSpritePaletteTag","MultiplyInvertedPaletteRGBComponents","OBJ_PLTT_ID"],
    lineCount: 8,
    bodyC: "u8 colors[] = {16, 0};\n    if (sprite->sFlashPal && --sprite->sDelayTimer <= 0)\n    {\n        MultiplyInvertedPaletteRGBComponents(OBJ_PLTT_ID(IndexOfSpritePaletteTag(PALTAG_PIKA_AURA)) + 3, colors[sprite->sColorIdx], colors[sprite->sColorIdx], colors[sprite->sColorIdx]);\n        ++sprite->sColorIdx;\n        sprite->sColorIdx &= 1;\n        sprite->sDelayTimer = sprite->sDelay;\n    }",
  },
  "SpriteCB_ReelTimeExplosion": {
    lineCount: 1,
    bodyC: "sprite->y2 = gSpriteCoordOffsetY;",
  },
  "SpriteCB_ReelTimeDuck": {
    callsTo: ["Cos","Sin"],
    lineCount: 14,
    bodyC: "sprite->data[0] -= 2;\n    sprite->data[0] &= 0xff;\n    sprite->x2 = Cos(sprite->data[0], 20);\n    sprite->y2 = Sin(sprite->data[0], 6);\n    sprite->subpriority = 0;\n    if (sprite->data[0] >= 0x80)\n    {\n        sprite->subpriority = 2;\n    }\n    if (++sprite->data[1] >= 16)\n    {\n        sprite->hFlip ^= 1;\n        sprite->data[1] = 0;\n    }",
  },
  "SpriteCB_ReelTimeSmoke": {
    lineCount: 23,
    bodyC: "if (sprite->sState == 0)\n    {\n        if (sprite->affineAnimEnded)\n            sprite->sState++;\n    }\n    else if (sprite->sState == 1)\n    {\n        sprite->invisible ^= 1;\n        if (++sprite->sTimer >= 24)\n        {\n            sprite->sState++;\n            sprite->sTimer = 0;\n        }\n    }\n    else\n    {\n        sprite->invisible = TRUE;\n        if (++sprite->sTimer >= 16)\n            sprite->sAnimFinished = TRUE;\n    }\n    sprite->sMoveY &= 0xff;\n    sprite->sMoveY += 16;\n    sprite->y2 -= (sprite->sMoveY >> 8);",
  },
  "SpriteCB_PikaPowerBolt": {
    lineCount: 2,
    bodyC: "if (sprite->affineAnimEnded)\n        sprite->data[7] = TRUE;",
  },
  "SpriteCB_DigitalDisplay_Static": {
    lineCount: 1,
    bodyC: "sprite->sWaitForAnim = FALSE;",
  },
  "SpriteCB_DigitalDisplay_Smoke": {
    lineCount: 14,
    bodyC: "s16 targetX[] = {4, -4, 4, -4};\n    s16 targetY[] = {4, 4, -4, -4};\n\n    if (sprite->sCounter++ >= 16)\n    {\n        sprite->subspriteTableNum ^= 1;\n        sprite->sCounter = 0;\n    }\n    sprite->x2 = 0;\n    sprite->y2 = 0;\n    if (sprite->subspriteTableNum != 0)\n    {\n        sprite->x2 = targetX[sprite->sSpriteId];\n        sprite->y2 = targetY[sprite->sSpriteId];\n    }",
  },
  "SpriteCB_DigitalDisplay_SmokeNE": {
    callsTo: ["SpriteCB_DigitalDisplay_Smoke"],
    lineCount: 2,
    bodyC: "sprite->hFlip = TRUE;\n    SpriteCB_DigitalDisplay_Smoke(sprite);",
  },
  "SpriteCB_DigitalDisplay_SmokeSW": {
    callsTo: ["SpriteCB_DigitalDisplay_Smoke"],
    lineCount: 2,
    bodyC: "sprite->vFlip = TRUE;\n    SpriteCB_DigitalDisplay_Smoke(sprite);",
  },
  "SpriteCB_DigitalDisplay_SmokeSE": {
    callsTo: ["SpriteCB_DigitalDisplay_Smoke"],
    lineCount: 3,
    bodyC: "sprite->hFlip = TRUE;\n    sprite->vFlip = TRUE;\n    SpriteCB_DigitalDisplay_Smoke(sprite);",
  },
  "SpriteCB_DigitalDisplay_Reel": {
    lineCount: 23,
    bodyC: "switch (sprite->sState)\n    {\n    case 0:\n        sprite->x += 4;\n        if (sprite->x >= DISPLAY_WIDTH - 32)\n        {\n            sprite->x = DISPLAY_WIDTH - 32;\n            sprite->sState++;\n        }\n        break;\n    case 1:\n        if (++sprite->sCounter > 90)\n            sprite->sState++;\n        break;\n    case 2:\n        sprite->x += 4;\n        if (sprite->x >= DISPLAY_WIDTH + 32)\n            sprite->sState++;\n        break;\n    case 3:\n        sprite->sWaitForAnim = FALSE;\n        break;\n    }",
  },
  "SpriteCB_DigitalDisplay_Time": {
    lineCount: 23,
    bodyC: "switch (sprite->sState)\n    {\n    case 0:\n        sprite->x -= 4;\n        if (sprite->x <= DISPLAY_WIDTH - 32)\n        {\n            sprite->x = DISPLAY_WIDTH - 32;\n            sprite->sState++;\n        }\n        break;\n    case 1:\n        if (++sprite->sCounter > 90)\n            sprite->sState++;\n        break;\n    case 2:\n        sprite->x -= 4;\n        if (sprite->x <= 144)\n            sprite->sState++;\n        break;\n    case 3:\n        sprite->sWaitForAnim = FALSE;\n        break;\n    }",
  },
  "SpriteCB_DigitalDisplay_ReelTimeNumber": {
    callsTo: ["StartSpriteAnim"],
    lineCount: 33,
    bodyC: "switch (sprite->sState)\n    {\n    case 0:\n        StartSpriteAnim(sprite, sSlotMachine->reelTimeSpinsLeft - 1);\n        sprite->sState++;\n         \n    case 1:\n        if (++sprite->sCounter >= 4)\n        {\n            sprite->sState++;\n            sprite->sCounter = 0;\n        }\n        break;\n    case 2:\n        sprite->x += 4;\n        if (sprite->x >= DISPLAY_WIDTH - 32)\n        {\n            sprite->x = DISPLAY_WIDTH - 32;\n            sprite->sState++;\n        }\n        break;\n    case 3:\n        if (++sprite->sCounter > 90)\n            sprite->sState++;\n        break;\n    case 4:\n        sprite->x += 4;\n        if (sprite->x >= DISPLAY_WIDTH + 8)\n            sprite->sState++;\n        break;\n    case 5:\n        sprite->sWaitForAnim = FALSE;\n        break;\n    }",
  },
  "SpriteCB_DigitalDisplay_PokeballRocking": {
    lineCount: 35,
    bodyC: "switch (sprite->sState)\n    {\n    case 0:\n        sprite->animPaused = TRUE;\n        sprite->sState++;\n         \n    case 1:\n        sprite->y += 8;\n        if (sprite->y >= 0x70)\n        {\n            sprite->y = 0x70;\n            sprite->sCounter = 16;\n            sprite->sState++;\n        }\n        break;\n    case 2:\n        if (sprite->data[2] == 0)\n        {\n            sprite->y -= sprite->sCounter;\n            sprite->sCounter = -sprite->sCounter;\n            if (++sprite->data[3] >= 2)\n            {\n                sprite->sCounter >>= 2;\n                sprite->data[3] = 0;\n                if (sprite->sCounter == 0)\n                {\n                    sprite->sState++;\n                    sprite->sWaitForAnim = FALSE;\n                    sprite->animPaused = FALSE;\n                }\n            }\n        }\n        sprite->data[2]++;\n        sprite->data[2] &= 0x07;\n        break;\n    }",
  },
  "SpriteCB_DigitalDisplay_Stop": {
    lineCount: 16,
    bodyC: "switch (sprite->sState)\n    {\n    case 0:\n        if (++sprite->sCounter > 8)\n            sprite->sState++;\n        break;\n    case 1:\n        sprite->y += 2;\n        if (sprite->y >= 0x30)\n        {\n            sprite->y = 0x30;\n            sprite->sState++;\n            sprite->sWaitForAnim = FALSE;\n        }\n        break;\n    }",
  },
  "SpriteCB_DigitalDisplay_AButtonStop": {
    callsTo: ["SetGpuReg","StartSpriteAnim"],
    lineCount: 30,
    bodyC: "switch (sprite->sState)\n    {\n    case 0:\n        sprite->invisible = TRUE;\n        if (++sprite->sCounter > 0x20)\n        {\n            sprite->sState++;\n            sprite->sCounter = 5;\n            sprite->oam.mosaic = TRUE;\n            sprite->invisible = FALSE;\n            StartSpriteAnim(sprite, 1);\n            SetGpuReg(REG_OFFSET_MOSAIC, ((sprite->sCounter << 4) | sprite->sCounter) << 8);\n        }\n        break;\n    case 1:\n        sprite->sCounter -= (sprite->data[2] >> 8);\n        if (sprite->sCounter < 0)\n            sprite->sCounter = 0;\n        SetGpuReg(REG_OFFSET_MOSAIC, ((sprite->sCounter << 4) | sprite->sCounter) << 8);\n        sprite->data[2] &= 0xff;\n        sprite->data[2] += 0x80;\n        if (sprite->sCounter == 0)\n        {\n            sprite->sState++;\n            sprite->sWaitForAnim = FALSE;\n            sprite->oam.mosaic = FALSE;\n            StartSpriteAnim(sprite, 0);\n        }\n        break;\n    }",
  },
  "SpriteCB_DigitalDisplay_PokeballShining": {
    callsTo: ["IndexOfSpritePaletteTag","LoadPalette","OBJ_PLTT_ID","StartSpriteAnimIfDifferent"],
    lineCount: 20,
    bodyC: "if (sprite->sCounter < 3)\n    {\n        LoadPalette(sPokeballShiningPalTable[sprite->sCounter], OBJ_PLTT_ID(IndexOfSpritePaletteTag(PALTAG_DIG_DISPLAY)), PLTT_SIZE_4BPP);\n        if (++sprite->data[2] >= 4)\n        {\n            sprite->data[1]++;\n            sprite->data[2] = 0;\n        }\n    }\n    else\n    {\n        LoadPalette(sPokeballShiningPalTable[sprite->sCounter], OBJ_PLTT_ID(IndexOfSpritePaletteTag(PALTAG_DIG_DISPLAY)), PLTT_SIZE_4BPP);\n        if (++sprite->data[2] >= 25)\n        {\n            sprite->sCounter = 0;\n            sprite->data[2] = 0;\n        }\n    }\n    StartSpriteAnimIfDifferent(sprite, 1);\n    sprite->sWaitForAnim = FALSE;",
  },
  "SpriteCB_DigitalDisplay_RegBonus": {
    lineCount: 27,
    bodyC: "s16 letterXOffset[] = {  0, -40,   0,   0, 48,   0,  24,   0};\n    s16 letterYOffset[] = {-32,   0, -32, -48,  0, -48,   0, -48};\n    s16 letterDelay[]   = { 16,  12,  16,   0,  0,   4,   8,   8};\n\n    switch (sprite->sState)\n    {\n    case 0:\n        sprite->x2 = letterXOffset[sprite->sSpriteId];\n        sprite->y2 = letterYOffset[sprite->sSpriteId];\n        sprite->sCounter = letterDelay[sprite->sSpriteId];\n        sprite->sState++;\n         \n    case 1:\n        if (sprite->sCounter-- == 0)\n            sprite->sState++;\n        break;\n    case 2:\n        if (sprite->x2 > 0)\n            sprite->x2 -= 4;\n        else if (sprite->x2 < 0)\n            sprite->x2 += 4;\n\n        if (sprite->y2 > 0)\n            sprite->y2 -= 4;\n        else if (sprite->y2 < 0)\n            sprite->y2 += 4;\n\n        if (sprite->x2 == 0 && sprite->y2 == 0)\n            sprite->sState++;\n        break;\n    }",
  },
  "SpriteCB_DigitalDisplay_BigBonus": {
    callsTo: ["Cos","Sin"],
    lineCount: 10,
    bodyC: "s16 sp0[] = {160, 192, 224, 104, 80, 64, 48, 24};\n\n    if (sprite->sState == 0)\n    {\n        sprite->sState++;\n        sprite->sCounter = 12;\n    }\n    sprite->x2 = Cos(sp0[sprite->sSpriteId], sprite->sCounter);\n    sprite->y2 = Sin(sp0[sprite->sSpriteId], sprite->sCounter);\n    if (sprite->sCounter != 0)\n        sprite->sCounter--;",
  },
  "SpriteCB_DigitalDisplay_AButtonStart": {
    callsTo: ["AddDigitalDisplaySprite","WIN_RANGE"],
    lineCount: 48,
    bodyC: "switch (sprite->sState)\n    {\n        case 0:\n            sSlotMachine->winIn = WININ_WIN0_BG_ALL | WININ_WIN0_CLR;\n            sSlotMachine->winOut = WINOUT_WIN01_BG_ALL | WINOUT_WIN01_OBJ | WINOUT_WIN01_CLR;\n            sSlotMachine->win0v = WIN_RANGE(32, 136);\n            sprite->invisible = TRUE;\n            sprite->sState++;\n             \n        case 1:\n            sprite->sCounter += 2;\n            sprite->data[2] = sprite->sCounter + 176;\n            sprite->data[3] = DISPLAY_WIDTH - sprite->sCounter;\n            if (sprite->data[2] > 208)\n                sprite->data[2] = 208;\n            if (sprite->data[3] < 208)\n                sprite->data[3] = 208;\n            sSlotMachine->win0h = (sprite->data[2] << 8) | sprite->data[3];\n            if (sprite->sCounter > 51)\n            {\n                sprite->sState++;\n                sSlotMachine->winIn = WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR;\n            }\n            break;\n        case 2:\n            if (sSlotMachine->bet == 0)\n                break;\n            AddDigitalDisplaySprite(DIG_SPRITE_A_BUTTON, SpriteCallbackDummy, 208, 116, 0);\n            sSlotMachine->win0h = WIN_RANGE(192, 224);\n            sSlotMachine->win0v = WIN_RANGE(104, 128);\n            sSlotMachine->winIn = WININ_WIN0_BG_ALL | WININ_WIN0_CLR;\n            sprite->sState++;\n            sprite->sCounter = 0;\n             \n        case 3:\n            sprite->sCounter += 2;\n            sprite->data[2] = sprite->sCounter + 192;\n            sprite->data[3] = DISPLAY_WIDTH - 16 - sprite->sCounter;\n            if (sprite->data[2] > 208)\n                sprite->data[2] = 208;\n            if (sprite->data[3] < 208)\n                sprite->data[3] = 208;\n            sSlotMachine->win0h = (sprite->data[2] << 8) | sprite->data[3];\n            if (sprite->sCounter > 15)\n            {\n                sprite->sState++;\n                sSlotMachine->winIn = WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR;\n            }\n            break;\n    }",
  },
} as const;
