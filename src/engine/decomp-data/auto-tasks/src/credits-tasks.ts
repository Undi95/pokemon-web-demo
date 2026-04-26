// AUTO-GENERATED from src/credits.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 17 Task_, 2 CB2_, 4 SpriteCB_

export const TASKS = {
  "Task_WaitPaletteFade": {
    taskTransitions: ["Task_CreditsMain"],
    externalChecks: { paletteFade: true },
    lineCount: 2,
    bodyC: "if (!gPaletteFade.active)\n        gTasks[taskId].func = Task_CreditsMain;",
  },
  "Task_CreditsMain": {
    callsTo: ["BeginNormalPaletteFade"],
    taskTransitions: ["Task_CreditsTheEnd1","Task_ReadyBikeScene","Task_ReadyShowMons"],
    dataReads: ["tEndCredits","tNextMode","tTaskId_BikeScene"],
    dataWrites: ["tCurrentMode","tNextMode","tState","tTheEndDelay"],
    lineCount: 25,
    bodyC: "u16 mode;\n\n    if (gTasks[taskId].tEndCredits)\n    {\n        s16 bikeTaskId = gTasks[taskId].tTaskId_BikeScene;\n        gTasks[bikeTaskId].tState = 30;\n\n        gTasks[taskId].tTheEndDelay = 256;\n        gTasks[taskId].func = Task_CreditsTheEnd1;\n        return;\n    }\n\n    sUnkVar = 0;\n    mode = gTasks[taskId].tNextMode;\n\n    if (gTasks[taskId].tNextMode == MODE_BIKE_SCENE)\n    {\n         \n        gTasks[taskId].tCurrentMode = mode;\n        gTasks[taskId].tNextMode = MODE_NONE;\n        BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);\n        gTasks[taskId].func = Task_ReadyBikeScene;\n    }\n    else if (gTasks[taskId].tNextMode == MODE_SHOW_MONS)\n    {\n         \n        gTasks[taskId].tCurrentMode = mode;\n        gTasks[taskId].tNextMode = MODE_NONE;\n        BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);\n        gTasks[taskId].func = Task_ReadyShowMons;\n    }",
  },
  "Task_ReadyBikeScene": {
    callsTo: ["ResetCreditsTasks","SetGpuReg"],
    taskTransitions: ["Task_SetBikeScene"],
    externalChecks: { paletteFade: true },
    lineCount: 6,
    bodyC: "if (!gPaletteFade.active)\n    {\n        SetGpuReg(REG_OFFSET_DISPCNT, 0);\n        ResetCreditsTasks(taskId);\n        gTasks[taskId].func = Task_SetBikeScene;\n    }",
  },
  "Task_SetBikeScene": {
    callsTo: ["BeginNormalPaletteFade","EnableInterrupts","LoadBikeScene","SetVBlankCallback"],
    taskTransitions: ["Task_WaitPaletteFade"],
    dataReads: ["tSceneNum"],
    lineCount: 8,
    bodyC: "SetVBlankCallback(NULL);\n\n    if (LoadBikeScene(gTasks[taskId].tSceneNum, taskId))\n    {\n        BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK);\n        EnableInterrupts(INTR_FLAG_VBLANK);\n        SetVBlankCallback(VBlankCB_Credits);\n        gTasks[taskId].func = Task_WaitPaletteFade;\n    }",
  },
  "Task_ReadyShowMons": {
    callsTo: ["ResetCreditsTasks","SetGpuReg"],
    taskTransitions: ["Task_LoadShowMons"],
    externalChecks: { paletteFade: true },
    lineCount: 6,
    bodyC: "if (!gPaletteFade.active)\n    {\n        SetGpuReg(REG_OFFSET_DISPCNT, 0);\n        ResetCreditsTasks(taskId);\n        gTasks[taskId].func = Task_LoadShowMons;\n    }",
  },
  "Task_LoadShowMons": {
    callsTo: ["BGCNT_CHARBASE","BGCNT_PRIORITY","BGCNT_SCREENBASE","BG_PLTT_ID","BG_SCREEN_ADDR","BeginNormalPaletteFade","CreateTask","FreeAllSpritePalettes","LZ77UnCompVram","LoadPalette","LoadSpritePalette","LoadSpriteSheet","PLTT_SIZEOF","RGB","ResetAllPicSprites","ResetSpriteData","SetGpuReg"],
    taskTransitions: ["Task_WaitPaletteFade"],
    dataReads: ["tSceneNum","tTaskId_ShowMons"],
    dataWrites: ["tTaskId_ShowMons"],
    lineCount: 53,
    bodyC: "switch (gMain.state)\n    {\n    default:\n    case 0:\n    {\n        u16 i;\n        u16 *temp;\n\n        ResetSpriteData();\n        ResetAllPicSprites();\n        FreeAllSpritePalettes();\n        gReservedSpritePaletteCount = 8;\n        LZ77UnCompVram(gBirchBagGrass_Gfx, (void *)VRAM);\n        LZ77UnCompVram(gBirchGrassTilemap, (void *)(BG_SCREEN_ADDR(7)));\n        LoadPalette(gBirchBagGrass_Pal + 1, BG_PLTT_ID(0) + 1, PLTT_SIZEOF(2 * 16 - 1));\n\n        for (i = 0; i < MON_PIC_SIZE; i++)\n            gDecompressionBuffer[i] = 0x11;\n        for (i = 0; i < MON_PIC_SIZE; i++)\n            (gDecompressionBuffer + MON_PIC_SIZE)[i] = 0x22;\n        for (i = 0; i < MON_PIC_SIZE; i++)\n            (gDecompressionBuffer + MON_PIC_SIZE * 2)[i] = 0x33;\n\n        temp = (u16 *)(&gDecompressionBuffer[MONBG_OFFSET]);\n        temp[0] = RGB_BLACK;\n        temp[1] = RGB(31, 31, 20);  \n        temp[2] = RGB(31, 20, 20);  \n        temp[3] = RGB(20, 20, 31);  \n\n        LoadSpriteSheet(sSpriteSheet_MonBg);\n        LoadSpritePalette(sSpritePalette_MonBg);\n\n        gMain.state++;\n        break;\n    }\n    case 1:\n        gTasks[taskId].tTaskId_ShowMons = CreateTask(Task_ShowMons, 0);\n        gTasks[gTasks[taskId].tTaskId_ShowMons].tState = 1;\n        gTasks[gTasks[taskId].tTaskId_ShowMons].tMainTaskId = taskId;\n        gTasks[gTasks[taskId].tTaskId_ShowMons].data[2] = gTasks[taskId].tSceneNum;  \n\n        BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK);\n        SetGpuReg(REG_OFFSET_BG3HOFS, 0);\n        SetGpuReg(REG_OFFSET_BG3VOFS, 32);\n        SetGpuReg(REG_OFFSET_BG3CNT, BGCNT_PRIORITY(3)\n                                   | BGCNT_CHARBASE(0)\n                                   | BGCNT_SCREENBASE(7)\n                                   | BGCNT_16COLOR\n                                   | BGCNT_TXT256x256);\n        SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_MODE_0\n                                    | DISPCNT_OBJ_1D_MAP\n                                    | DISPCNT_BG0_ON\n                                    | DISPCNT_BG3_ON\n                                    | DISPCNT_OBJ_ON);\n\n        gMain.state = 0;\n        gIntroCredits_MovingSceneryState = INTROCRED_SCENERY_NORMAL;\n        gTasks[taskId].func = Task_WaitPaletteFade;\n        break;\n    }",
  },
  "Task_CreditsTheEnd1": {
    callsTo: ["BeginNormalPaletteFade"],
    taskTransitions: ["Task_CreditsTheEnd2"],
    dataReads: ["tTheEndDelay"],
    dataWrites: ["tTheEndDelay"],
    lineCount: 7,
    bodyC: "if (gTasks[taskId].tTheEndDelay)\n    {\n        gTasks[taskId].tTheEndDelay--;\n        return;\n    }\n\n    BeginNormalPaletteFade(PALETTES_ALL, 12, 0, 16, RGB_BLACK);\n    gTasks[taskId].func = Task_CreditsTheEnd2;",
  },
  "Task_CreditsTheEnd2": {
    callsTo: ["ResetCreditsTasks"],
    taskTransitions: ["Task_CreditsTheEnd3"],
    externalChecks: { paletteFade: true },
    lineCount: 5,
    bodyC: "if (!gPaletteFade.active)\n    {\n        ResetCreditsTasks(taskId);\n        gTasks[taskId].func = Task_CreditsTheEnd3;\n    }",
  },
  "Task_CreditsTheEnd3": {
    callsTo: ["BGCNT_CHARBASE","BGCNT_PRIORITY","BGCNT_SCREENBASE","BG_PLTT_ID","BeginNormalPaletteFade","EnableInterrupts","FreeAllSpritePalettes","LoadTheEndScreen","ResetGpuAndVram","ResetPaletteFade","ResetSpriteData","SetGpuReg"],
    taskTransitions: ["Task_CreditsTheEnd4"],
    dataWrites: ["tDelay"],
    lineCount: 17,
    bodyC: "ResetGpuAndVram();\n    ResetPaletteFade();\n    LoadTheEndScreen(0, 0x3800, BG_PLTT_ID(0));\n    ResetSpriteData();\n    FreeAllSpritePalettes();\n    BeginNormalPaletteFade(PALETTES_ALL, 8, 16, 0, RGB_BLACK);\n\n    SetGpuReg(REG_OFFSET_BG0CNT, BGCNT_PRIORITY(0)\n                               | BGCNT_CHARBASE(0)\n                               | BGCNT_SCREENBASE(7)\n                               | BGCNT_16COLOR\n                               | BGCNT_TXT256x256);\n    EnableInterrupts(INTR_FLAG_VBLANK);\n    SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_MODE_0\n                                | DISPCNT_OBJ_1D_MAP\n                                | DISPCNT_BG0_ON);\n\n    gTasks[taskId].tDelay = 235;  \n    gTasks[taskId].func = Task_CreditsTheEnd4;",
  },
  "Task_CreditsTheEnd4": {
    callsTo: ["BeginNormalPaletteFade"],
    taskTransitions: ["Task_CreditsTheEnd5"],
    dataReads: ["tDelay"],
    dataWrites: ["tDelay"],
    lineCount: 7,
    bodyC: "if (gTasks[taskId].tDelay)\n    {\n        gTasks[taskId].tDelay--;\n        return;\n    }\n\n    BeginNormalPaletteFade(PALETTES_ALL, 6, 0, 16, RGB_BLACK);\n    gTasks[taskId].func = Task_CreditsTheEnd5;",
  },
  "Task_CreditsTheEnd5": {
    callsTo: ["BeginNormalPaletteFade","DrawTheEnd"],
    taskTransitions: ["Task_CreditsTheEnd6"],
    dataWrites: ["tDelay"],
    externalChecks: { paletteFade: true },
    lineCount: 7,
    bodyC: "if (!gPaletteFade.active)\n    {\n        DrawTheEnd(0x3800, 0);\n\n        BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 0, RGB_BLACK);\n        gTasks[taskId].tDelay = 7200;\n        gTasks[taskId].func = Task_CreditsTheEnd6;\n    }",
  },
  "Task_CreditsTheEnd6": {
    callsTo: ["BeginNormalPaletteFade","FadeOutBGM","m4aSongNumStart"],
    taskTransitions: ["Task_CreditsSoftReset"],
    dataReads: ["tDelay"],
    dataWrites: ["tDelay"],
    externalChecks: { paletteFade: true },
    lineCount: 15,
    bodyC: "if (!gPaletteFade.active)\n    {\n        if (gTasks[taskId].tDelay == 0 || gMain.newKeys)\n        {\n            FadeOutBGM(4);\n            BeginNormalPaletteFade(PALETTES_ALL, 8, 0, 16, RGB_WHITEALPHA);\n            gTasks[taskId].func = Task_CreditsSoftReset;\n            return;\n        }\n\n        if (gTasks[taskId].tDelay == 7144)\n            FadeOutBGM(8);\n\n        if (gTasks[taskId].tDelay == 6840)\n            m4aSongNumStart(MUS_END);\n\n        gTasks[taskId].tDelay--;\n    }",
  },
  "Task_CreditsSoftReset": {
    callsTo: ["SoftReset"],
    externalChecks: { paletteFade: true },
    lineCount: 2,
    bodyC: "if (!gPaletteFade.active)\n        SoftReset(RESET_ALL);",
  },
  "Task_UpdatePage": {
    callsTo: ["BeginNormalPaletteFade","CheckChangeScene","CopyWindowToVram","DestroyTask","FREE_AND_SET_NULL","FillWindowPixelBuffer","FreeCreditsBgsAndWindows","PIXEL_FILL","PrintCreditsText"],
    dataReads: ["tCurrentPage","tDelay","tMainTaskId","tState"],
    dataWrites: ["tCurrentPage","tDelay","tState"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 89,
    bodyC: "int i;\n\n    switch (gTasks[taskId].tState)\n    {\n    case 0:\n    case 6:\n    case 7:\n    case 8:\n    case 9:\n    default:\n        if (!gPaletteFade.active)\n        {\n            gTasks[taskId].tState = 1;\n            gTasks[taskId].tDelay = 72;\n            gTasks[gTasks[taskId].tMainTaskId].tPrintedPage = FALSE;\n            sUnkVar = 0;\n        }\n        return;\n    case 1:\n        if (gTasks[taskId].tDelay != 0)\n        {\n            gTasks[taskId].tDelay--;\n            return;\n        }\n        gTasks[taskId].tState++;\n        return;\n    case 2:\n        if (gTasks[gTasks[taskId].tMainTaskId].func == Task_CreditsMain)\n        {\n            if (gTasks[taskId].tCurrentPage < PAGE_COUNT)\n            {\n                 \n                for (i = 0; i < ENTRIES_PER_PAGE; i++)\n                    PrintCreditsText(\n                        sCreditsEntryPointerTable[gTasks[taskId].tCurrentPage][i]->text,\n                         5 + i * 16,\n                         sCreditsEntryPointerTable[gTasks[taskId].tCurrentPage][i]->isTitle);\n                CopyWindowToVram(0, COPYWIN_GFX);\n\n                gTasks[taskId].tCurrentPage++;\n                gTasks[taskId].tState++;\n\n                gTasks[gTasks[taskId].tMainTaskId].tPrintedPage = TRUE;\n\n                if (gTasks[gTasks[taskId].tMainTaskId].tCurrentMode == MODE_BIKE_SCENE)\n                    BeginNormalPaletteFade(0x300, 0, 16, 0, COLOR_LIGHT_GREEN);\n                else  \n                    BeginNormalPaletteFade(0x300, 0, 16, 0, COLOR_DARK_GREEN);\n                return;\n            }\n\n             \n            gTasks[taskId].tState = 10;\n            return;\n        }\n        gTasks[gTasks[taskId].tMainTaskId].tPrintedPage = FALSE;\n        return;\n    case 3:\n        if (!gPaletteFade.active)\n        {\n            gTasks[taskId].tDelay = 121;  \n            gTasks[taskId].tState++;\n        }\n        return;\n    case 4:\n        if (gTasks[taskId].tDelay != 0)\n        {\n            gTasks[taskId].tDelay--;\n            return;\n        }\n\n        if (CheckChangeScene((u8)gTasks[taskId].tCurrentPage, (u8)gTasks[taskId].tMainTaskId))\n        {\n            gTasks[taskId].tState++;\n            return;\n        }\n        gTasks[taskId].tState++;\n        if (gTasks[gTasks[taskId].tMainTaskId].tCurrentMode == MODE_BIKE_SCENE)\n            BeginNormalPaletteFade(0x300, 0, 0, 16, COLOR_LIGHT_GREEN);\n        else  \n            BeginNormalPaletteFade(0x300, 0, 0, 16, COLOR_DARK_GREEN);\n        return;\n    case 5:\n        if (!gPaletteFade.active)\n        {\n             \n            FillWindowPixelBuffer(0, PIXEL_FILL(0));\n            CopyWindowToVram(0, COPYWIN_GFX);\n            gTasks[taskId].tState = 2;\n        }\n        return;\n    case 10:\n        gTasks[gTasks[taskId].tMainTaskId].tEndCredits = TRUE;\n        DestroyTask(taskId);\n        FreeCreditsBgsAndWindows();\n        FREE_AND_SET_NULL(sCreditsData);\n        return;\n    }",
  },
  "Task_ShowMons": {
    callsTo: ["CreateCreditsMonSprite"],
    dataReads: ["tDelay","tMainTaskId","tState"],
    dataWrites: ["tDelay","tState"],
    lineCount: 42,
    bodyC: "u8 spriteId;\n\n    switch (gTasks[taskId].tState)\n    {\n    case 0:\n        break;\n    case 1:\n        if (sCreditsData->nextImgPos == POS_LEFT && gTasks[gTasks[taskId].tMainTaskId].tPrintedPage == FALSE)\n            break;\n        gTasks[taskId].tState++;\n        break;\n    case 2:\n        if (sCreditsData->imgCounter == NUM_MON_SLIDES || gTasks[gTasks[taskId].tMainTaskId].func != Task_CreditsMain)\n            break;\n        spriteId = CreateCreditsMonSprite(sCreditsData->monToShow[sCreditsData->currShownMon],\n                                    sMonSpritePos[sCreditsData->nextImgPos][0],\n                                    sMonSpritePos[sCreditsData->nextImgPos][1],\n                                    sCreditsData->nextImgPos);\n        if (sCreditsData->currShownMon < sCreditsData->numMonToShow - 1)\n        {\n            sCreditsData->currShownMon++;\n            gSprites[spriteId].data[3] = 52;  \n        }\n        else\n        {\n            sCreditsData->currShownMon = 0;\n            gSprites[spriteId].data[3] = 512;\n        }\n        sCreditsData->imgCounter++;\n\n        if (sCreditsData->nextImgPos == POS_RIGHT)\n            sCreditsData->nextImgPos = POS_LEFT;\n        else\n            sCreditsData->nextImgPos++;\n\n        gTasks[taskId].tDelay = 52;  \n        gTasks[taskId].tState++;\n        break;\n    case 3:\n        if (gTasks[taskId].tDelay != 0)\n            gTasks[taskId].tDelay--;\n        else\n            gTasks[taskId].tState = 1;\n        break;\n    }",
  },
  "Task_BikeScene": {
    callsTo: ["Sin"],
    dataReads: ["tDelay","tPlayer","tRival","tSinIdx","tState"],
    dataWrites: ["tDelay","tSinIdx","tState"],
    lineCount: 79,
    bodyC: "switch (gTasks[taskId].tState)\n    {\n    case 0:\n        gIntroCredits_MovingSceneryVOffset = Sin((gTasks[taskId].tSinIdx >> 1) & 0x7F, 12);\n        gTasks[taskId].tSinIdx++;\n        break;\n    case 1:\n        if (gIntroCredits_MovingSceneryVOffset != 0)\n        {\n            gIntroCredits_MovingSceneryVOffset = Sin((gTasks[taskId].tSinIdx >> 1) & 0x7F, 12);\n            gTasks[taskId].tSinIdx++;\n        }\n        else\n        {\n            gSprites[gTasks[taskId].tPlayer].data[0] = 2;\n            gTasks[taskId].tSinIdx = 0;\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 2:\n        if (gTasks[taskId].tSinIdx < 64)\n        {\n            gTasks[taskId].tSinIdx++;\n            gIntroCredits_MovingSceneryVOffset = Sin(gTasks[taskId].tSinIdx & 0x7F, 20);\n        }\n        else\n        {\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 3:\n        gSprites[gTasks[taskId].tPlayer].data[0] = 3;\n        gSprites[gTasks[taskId].tRival].data[0] = 1;\n        gTasks[taskId].tDelay = 120;\n        gTasks[taskId].tState++;\n        break;\n    case 4:\n        if (gTasks[taskId].tDelay != 0)\n        {\n            gTasks[taskId].tDelay--;\n        }\n        else\n        {\n            gTasks[taskId].tSinIdx = 64;\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 5:\n        if (gTasks[taskId].tSinIdx > 0)\n        {\n            gTasks[taskId].tSinIdx--;\n            gIntroCredits_MovingSceneryVOffset = Sin(gTasks[taskId].tSinIdx & 0x7F, 20);\n        }\n        else\n        {\n            gSprites[gTasks[taskId].tPlayer].data[0] = 1;\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 6:\n        gTasks[taskId].tState = 50;\n        break;\n    case 10:\n        gSprites[gTasks[taskId].tRival].data[0] = 2;\n        gTasks[taskId].tState = 50;\n        break;\n    case 20:\n        gSprites[gTasks[taskId].tPlayer].data[0] = 4;\n        gTasks[taskId].tState = 50;\n        break;\n    case 30:\n        gSprites[gTasks[taskId].tPlayer].data[0] = 5;\n        gSprites[gTasks[taskId].tRival].data[0] = 3;\n        gTasks[taskId].tState = 50;\n        break;\n    case 50:\n        gTasks[taskId].tState = 0;\n        break;\n    }",
  },
  "Task_CycleSceneryPalette": {
    callsTo: ["CycleSceneryPalette"],
    dataReads: ["tMainTaskId","tSinIdx","tState","tTimer"],
    dataWrites: ["tState","tTimer"],
    lineCount: 49,
    bodyC: "s16 bikeTaskId;\n\n    switch (gTasks[taskId].tState)\n    {\n    default:\n    case SCENE_OCEAN_MORNING:\n        if (gTasks[taskId].tTimer != TIMER_STOP)\n        {\n            if (gTasks[gTasks[gTasks[taskId].tMainTaskId].tTaskId_UpdatePage].tCurrentPage == 2)\n            {\n                gTasks[gTasks[gTasks[taskId].tMainTaskId].tTaskId_BikeScene].tState = 20;\n                gTasks[taskId].tTimer = TIMER_STOP;\n            }\n        }\n        CycleSceneryPalette(0);\n        break;\n    case SCENE_OCEAN_SUNSET:\n        CycleSceneryPalette(0);\n        break;\n    case SCENE_FOREST_RIVAL_ARRIVE:\n        if (gTasks[taskId].tTimer != TIMER_STOP)\n        {\n            bikeTaskId = gTasks[gTasks[taskId].tMainTaskId].tTaskId_BikeScene;\n\n             \n            if ((gTasks[bikeTaskId].tSinIdx & -128) == 640)\n            {\n                gTasks[bikeTaskId].tState = 1;\n                gTasks[taskId].tTimer = TIMER_STOP;\n            }\n        }\n        CycleSceneryPalette(1);\n        break;\n    case SCENE_FOREST_CATCH_RIVAL:\n        if (gTasks[taskId].tTimer != TIMER_STOP)\n        {\n\n            if (gTasks[taskId].tTimer == 620)  \n            {\n                gTasks[gTasks[gTasks[taskId].tMainTaskId].tTaskId_BikeScene].tState = 10;\n                gTasks[taskId].tTimer = TIMER_STOP;\n            }\n            else\n            {\n                gTasks[taskId].tTimer++;\n            }\n        }\n        CycleSceneryPalette(1);\n        break;\n    case SCENE_CITY_NIGHT:\n        CycleSceneryPalette(2);\n        break;\n    }",
  },
} as const;

export const CB2S = {
  "CB2_Credits": {
    callsTo: ["AnimateSprites","BuildOamBuffer","JOY_HELD","RunTasks","UpdatePaletteFade","VBlankCB_Credits"],
    externalChecks: { joyButtons: ["HELD:B_BUTTON"], waitForVBlank: true },
    lineCount: 13,
    bodyC: "RunTasks();\n    AnimateSprites();\n\n    if ((JOY_HELD(B_BUTTON))\n     && gHasHallOfFameRecords\n     && gTasks[sSavedTaskId].func == Task_CreditsMain)\n    {\n         \n        VBlankCB_Credits();\n        RunTasks();\n        AnimateSprites();\n        sUsedSpeedUp = TRUE;\n    }\n    BuildOamBuffer();\n    UpdatePaletteFade();",
  },
  "CB2_StartCreditsSequence": {
    callsTo: ["AllocZeroed","BeginNormalPaletteFade","CreateTask","DeterminePokemonToShow","EnableInterrupts","InitCreditsBgsAndWindows","InitHeap","LoadBikeScene","ResetGpuAndVram","ResetPaletteFade","ResetTasks","SetGpuReg","SetMainCallback2","SetVBlankCallback","m4aSongNumStart"],
    cb2Transitions: ["CB2_Credits"],
    lineCount: 37,
    bodyC: "u8 taskId;\n    s16 bikeTaskId;\n    u8 pageTaskId;\n\n    ResetGpuAndVram();\n    SetVBlankCallback(NULL);\n    InitHeap(gHeap, HEAP_SIZE);\n    ResetPaletteFade();\n    ResetTasks();\n    InitCreditsBgsAndWindows();\n\n    taskId = CreateTask(Task_WaitPaletteFade, 0);\n\n    gTasks[taskId].tEndCredits = FALSE;\n    gTasks[taskId].tSceneNum = SCENE_OCEAN_MORNING;\n    gTasks[taskId].tNextMode = MODE_NONE;\n    gTasks[taskId].tCurrentMode = MODE_BIKE_SCENE;\n\n    while (TRUE)\n    {\n        if (LoadBikeScene(SCENE_OCEAN_MORNING, taskId))\n            break;\n    }\n\n    bikeTaskId = gTasks[taskId].tTaskId_BikeScene;\n    gTasks[bikeTaskId].tState = 40;\n\n    SetGpuReg(REG_OFFSET_BG0VOFS, 0xFFFC);\n\n    pageTaskId = CreateTask(Task_UpdatePage, 0);\n\n    gTasks[pageTaskId].tMainTaskId = taskId;\n    gTasks[taskId].tTaskId_UpdatePage = pageTaskId;\n\n    BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_BLACK);\n    EnableInterrupts(INTR_FLAG_VBLANK);\n    SetVBlankCallback(VBlankCB_Credits);\n    m4aSongNumStart(MUS_CREDITS);\n    SetMainCallback2(CB2_Credits);\n    sUsedSpeedUp = FALSE;\n    sCreditsData = AllocZeroed(sizeof(struct CreditsData));\n\n    DeterminePokemonToShow();\n\n    sCreditsData->imgCounter = 0;\n    sCreditsData->nextImgPos = POS_LEFT;\n    sCreditsData->currShownMon = 0;\n\n    sSavedTaskId = taskId;",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_Player": {
    callsTo: ["DestroySprite","StartSpriteAnimIfDifferent"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 32,
    bodyC: "if (gIntroCredits_MovingSceneryState != INTROCRED_SCENERY_NORMAL)\n    {\n        DestroySprite(sprite);\n        return;\n    }\n\n    switch (sprite->sState)\n    {\n    case 0:\n        StartSpriteAnimIfDifferent(sprite, 0);\n        break;\n    case 1:\n        StartSpriteAnimIfDifferent(sprite, 1);\n        if (sprite->x > -32)\n            sprite->x--;\n        break;\n    case 2:\n        StartSpriteAnimIfDifferent(sprite, 2);\n        break;\n    case 3:\n        StartSpriteAnimIfDifferent(sprite, 3);\n        break;\n    case 4:\n        StartSpriteAnimIfDifferent(sprite, 0);\n        if (sprite->x > DISPLAY_WIDTH / 2)\n            sprite->x--;\n        break;\n    case 5:\n        StartSpriteAnimIfDifferent(sprite, 0);\n        if (sprite->x > -32)\n            sprite->x--;\n        break;\n    }",
  },
  "SpriteCB_Rival": {
    callsTo: ["DestroySprite","StartSpriteAnimIfDifferent"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 32,
    bodyC: "if (gIntroCredits_MovingSceneryState != INTROCRED_SCENERY_NORMAL)\n    {\n        DestroySprite(sprite);\n        return;\n    }\n\n    switch (sprite->sState)\n    {\n    case 0:\n        sprite->y2 = 0;\n        StartSpriteAnimIfDifferent(sprite, 0);\n        break;\n    case 1:\n        if (sprite->x > 200)\n            StartSpriteAnimIfDifferent(sprite, 1);\n        else\n            StartSpriteAnimIfDifferent(sprite, 2);\n        if (sprite->x > -32)\n            sprite->x -= 2;\n        sprite->y2 = -gIntroCredits_MovingSceneryVOffset;\n        break;\n    case 2:\n        sprite->data[7]++;\n        StartSpriteAnimIfDifferent(sprite, 0);\n        if ((sprite->data[7] & 3) == 0)\n            sprite->x++;\n        break;\n    case 3:\n        StartSpriteAnimIfDifferent(sprite, 0);\n        if (sprite->x > -32)\n            sprite->x--;\n        break;\n    }",
  },
  "SpriteCB_CreditsMon": {
    callsTo: ["BLDALPHA_BLEND","FreeAndDestroyMonPicSprite","SetGpuReg","SetOamMatrix"],
    lineCount: 80,
    bodyC: "if (gIntroCredits_MovingSceneryState != INTROCRED_SCENERY_NORMAL)\n    {\n        FreeAndDestroyMonPicSprite(sprite->sSpriteId);\n        return;\n    }\n\n    sprite->data[7]++;\n    switch (sprite->sState)\n    {\n    case 0:\n    default:\n        sprite->oam.affineMode = ST_OAM_AFFINE_NORMAL;\n        sprite->oam.matrixNum = sprite->sPosition;\n        sprite->data[2] = 16;\n        SetOamMatrix(sprite->sPosition, 0x10000 / sprite->data[2], 0, 0, 0x10000 / sprite->data[2]);\n        sprite->invisible = FALSE;\n        sprite->sState = 1;\n        break;\n    case 1:\n        if (sprite->data[2] < 256)\n        {\n            sprite->data[2] += 8;\n            SetOamMatrix(sprite->sPosition, 0x10000 / sprite->data[2], 0, 0, 0x10000 / sprite->data[2]);\n        }\n        else\n        {\n            sprite->sState++;\n        }\n        switch (sprite->sPosition)\n        {\n        case POS_LEFT + 1:\n            if ((sprite->data[7] & 3) == 0)\n                sprite->y++;\n            sprite->x -= 2;\n            break;\n        case POS_CENTER + 1:\n            break;\n        case POS_RIGHT + 1:\n            if ((sprite->data[7] & 3) == 0)\n                sprite->y++;\n            sprite->x += 2;\n            break;\n        }\n        break;\n    case 2:\n        if (sprite->data[3] != 0)\n        {\n            sprite->data[3]--;\n        }\n        else\n        {\n            SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_BG0 | BLDCNT_TGT2_BG1 | BLDCNT_TGT2_BG2 | BLDCNT_TGT2_BG3);\n            SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(16, 0));\n            sprite->oam.objMode = ST_OAM_OBJ_BLEND;\n            sprite->data[3] = 16;\n            sprite->sState++;\n        }\n        break;\n    case 3:\n        if (sprite->data[3] != 0)\n        {\n            int data3;\n\n            sprite->data[3]--;\n\n            data3 = 16 - sprite->data[3];\n            SetGpuReg(REG_OFFSET_BLDALPHA, (data3 << 8) + sprite->data[3]);\n        }\n        else\n        {\n            sprite->invisible = TRUE;\n            sprite->sState = 9;\n        }\n        break;\n    case 9:\n        sprite->sState++;\n        break;\n    case 10:\n        SetGpuReg(REG_OFFSET_BLDCNT, 0);\n        SetGpuReg(REG_OFFSET_BLDALPHA, 0);\n        FreeAndDestroyMonPicSprite(sprite->data[6]);\n        break;\n    }",
  },
  "SpriteCB_CreditsMonBg": {
    callsTo: ["DestroySprite"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 12,
    bodyC: "if (gSprites[sprite->sMonSpriteId].data[0] == 10\n     || gIntroCredits_MovingSceneryState != INTROCRED_SCENERY_NORMAL)\n    {\n        DestroySprite(sprite);\n        return;\n    }\n\n     \n    sprite->invisible = gSprites[sprite->sMonSpriteId].invisible;\n    sprite->oam.objMode = gSprites[sprite->sMonSpriteId].oam.objMode;\n    sprite->oam.affineMode = gSprites[sprite->sMonSpriteId].oam.affineMode;\n    sprite->oam.matrixNum = gSprites[sprite->sMonSpriteId].oam.matrixNum;\n    sprite->x = gSprites[sprite->sMonSpriteId].x;\n    sprite->y = gSprites[sprite->sMonSpriteId].y;",
  },
} as const;
