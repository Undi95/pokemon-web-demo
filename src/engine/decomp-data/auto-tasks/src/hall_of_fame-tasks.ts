// AUTO-GENERATED from src/hall_of_fame.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 25 Task_, 4 CB2_, 2 SpriteCB_

export const TASKS = {
  "Task_Hof_InitMonData": {
    callsTo: ["GetMonData","tMonSpriteId"],
    taskTransitions: ["Task_Hof_InitTeamSaveData","Task_Hof_SetMonDisplayTask"],
    dataReads: ["tDontSaveData","tMonNumber","tMonSpriteId"],
    dataWrites: ["tDisplayedMonId","tMonNumber","tPlayerSpriteID"],
    lineCount: 36,
    bodyC: "u16 i, j;\n\n    gTasks[taskId].tMonNumber = 0;  \n\n    for (i = 0; i < PARTY_SIZE; i++)\n    {\n        u8 nickname[POKEMON_NAME_LENGTH + 1];\n        if (GetMonData(&gPlayerParty[i], MON_DATA_SPECIES))\n        {\n            sHofMonPtr->mon[i].species = GetMonData(&gPlayerParty[i], MON_DATA_SPECIES_OR_EGG);\n            sHofMonPtr->mon[i].tid = GetMonData(&gPlayerParty[i], MON_DATA_OT_ID);\n            sHofMonPtr->mon[i].personality = GetMonData(&gPlayerParty[i], MON_DATA_PERSONALITY);\n            sHofMonPtr->mon[i].lvl = GetMonData(&gPlayerParty[i], MON_DATA_LEVEL);\n            GetMonData(&gPlayerParty[i], MON_DATA_NICKNAME, nickname);\n            for (j = 0; j < POKEMON_NAME_LENGTH; j++)\n                sHofMonPtr->mon[i].nickname[j] = nickname[j];\n            gTasks[taskId].tMonNumber++;\n        }\n        else\n        {\n            sHofMonPtr->mon[i].species = SPECIES_NONE;\n            sHofMonPtr->mon[i].tid = 0;\n            sHofMonPtr->mon[i].personality = 0;\n            sHofMonPtr->mon[i].lvl = 0;\n            sHofMonPtr->mon[i].nickname[0] = EOS;\n        }\n    }\n\n    sHofFadePalettes = 0;\n    gTasks[taskId].tDisplayedMonId = 0;\n    gTasks[taskId].tPlayerSpriteID = SPRITE_NONE;\n\n    for (i = 0; i < PARTY_SIZE; i++)\n    {\n        gTasks[taskId].tMonSpriteId(i) = SPRITE_NONE;\n    }\n\n    if (gTasks[taskId].tDontSaveData)\n        gTasks[taskId].func = Task_Hof_SetMonDisplayTask;\n    else\n        gTasks[taskId].func = Task_Hof_InitTeamSaveData;",
  },
  "Task_Hof_InitTeamSaveData": {
    callsTo: ["AddTextPrinterParameterized2","CopyWindowToVram","DrawDialogueFrame","LoadGameSave","memset"],
    taskTransitions: ["Task_Hof_TrySaveData"],
    lineCount: 32,
    bodyC: "u16 i;\n    struct HallofFameTeam *lastSavedTeam = (struct HallofFameTeam *)(gDecompressionBuffer);\n\n    if (!gHasHallOfFameRecords)\n    {\n        memset(gDecompressionBuffer, 0, SECTOR_SIZE * NUM_HOF_SECTORS);\n    }\n    else\n    {\n        if (LoadGameSave(SAVE_HALL_OF_FAME) != SAVE_STATUS_OK)\n            memset(gDecompressionBuffer, 0, SECTOR_SIZE * NUM_HOF_SECTORS);\n    }\n\n    for (i = 0; i < HALL_OF_FAME_MAX_TEAMS; i++, lastSavedTeam++)\n    {\n        if (lastSavedTeam->mon[0].species == SPECIES_NONE)\n            break;\n    }\n    if (i >= HALL_OF_FAME_MAX_TEAMS)\n    {\n        struct HallofFameTeam *afterTeam = (struct HallofFameTeam *)(gDecompressionBuffer);\n        struct HallofFameTeam *beforeTeam = (struct HallofFameTeam *)(gDecompressionBuffer);\n        afterTeam++;\n        for (i = 0; i < HALL_OF_FAME_MAX_TEAMS - 1; i++, beforeTeam++, afterTeam++)\n        {\n            *beforeTeam = *afterTeam;\n        }\n        lastSavedTeam--;\n    }\n    *lastSavedTeam = *sHofMonPtr;\n\n    DrawDialogueFrame(0, FALSE);\n    AddTextPrinterParameterized2(0, FONT_NORMAL, gText_SavingDontTurnOffPower, 0, NULL, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY);\n    CopyWindowToVram(0, COPYWIN_FULL);\n    gTasks[taskId].func = Task_Hof_TrySaveData;",
  },
  "Task_Hof_TrySaveData": {
    callsTo: ["DestroyTask","FreeAllWindowBuffers","PlaySE","TRY_FREE_AND_SET_NULL","TrySavingData","UnsetBgTilemapBuffer"],
    taskTransitions: ["Task_Hof_WaitToDisplayMon"],
    dataWrites: ["tFrameCount"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 16,
    bodyC: "gGameContinueCallback = CB2_DoHallOfFameScreenDontSaveData;\n    if (TrySavingData(SAVE_HALL_OF_FAME) == SAVE_STATUS_ERROR && gDamagedSaveSectors != 0)\n    {\n        UnsetBgTilemapBuffer(1);\n        UnsetBgTilemapBuffer(3);\n        FreeAllWindowBuffers();\n\n        TRY_FREE_AND_SET_NULL(sHofGfxPtr);\n        TRY_FREE_AND_SET_NULL(sHofMonPtr);\n\n        DestroyTask(taskId);\n    }\n    else\n    {\n        PlaySE(SE_SAVE);\n        gTasks[taskId].func = Task_Hof_WaitToDisplayMon;\n        gTasks[taskId].tFrameCount = 32;\n    }",
  },
  "Task_Hof_WaitToDisplayMon": {
    taskTransitions: ["Task_Hof_SetMonDisplayTask"],
    dataReads: ["tFrameCount"],
    dataWrites: ["tFrameCount"],
    lineCount: 4,
    bodyC: "if (gTasks[taskId].tFrameCount)\n        gTasks[taskId].tFrameCount--;\n    else\n        gTasks[taskId].func = Task_Hof_SetMonDisplayTask;",
  },
  "Task_Hof_SetMonDisplayTask": {
    taskTransitions: ["Task_Hof_DisplayMon"],
    lineCount: 1,
    bodyC: "gTasks[taskId].func = Task_Hof_DisplayMon;",
  },
  "Task_Hof_DisplayMon": {
    callsTo: ["ClearDialogWindowAndFrame","CreateMonPicSprite_Affine","tMonSpriteId"],
    taskTransitions: ["Task_Hof_PrintMonInfoAfterAnimating"],
    dataReads: ["tDisplayedMonId","tMonNumber","tMonSpriteId"],
    lineCount: 29,
    bodyC: "u8 spriteId;\n    s16 startX, startY, destX, destY;\n\n    u16 currMonId = gTasks[taskId].tDisplayedMonId;\n    struct HallofFameMon *currMon = &sHofMonPtr->mon[currMonId];\n\n    if (gTasks[taskId].tMonNumber > PARTY_SIZE / 2)\n    {\n        startX = sHallOfFame_MonFullTeamPositions[currMonId][0];\n        startY = sHallOfFame_MonFullTeamPositions[currMonId][1];\n        destX = sHallOfFame_MonFullTeamPositions[currMonId][2];\n        destY = sHallOfFame_MonFullTeamPositions[currMonId][3];\n    }\n    else\n    {\n        startX = sHallOfFame_MonHalfTeamPositions[currMonId][0];\n        startY = sHallOfFame_MonHalfTeamPositions[currMonId][1];\n        destX = sHallOfFame_MonHalfTeamPositions[currMonId][2];\n        destY = sHallOfFame_MonHalfTeamPositions[currMonId][3];\n    }\n\n    if (currMon->species == SPECIES_EGG)\n        destY += 10;\n\n    spriteId = CreateMonPicSprite_Affine(currMon->species, currMon->tid, currMon->personality, MON_PIC_AFFINE_FRONT, startX, startY, currMonId, TAG_NONE);\n    gSprites[spriteId].tDestinationX = destX;\n    gSprites[spriteId].tDestinationY = destY;\n    gSprites[spriteId].data[0] = 0;\n    gSprites[spriteId].tSpecies = currMon->species;\n    gSprites[spriteId].callback = SpriteCB_GetOnScreenAndAnimate;\n    gTasks[taskId].tMonSpriteId(currMonId) = spriteId;\n    ClearDialogWindowAndFrame(0, TRUE);\n    gTasks[taskId].func = Task_Hof_PrintMonInfoAfterAnimating;",
  },
  "Task_Hof_PrintMonInfoAfterAnimating": {
    callsTo: ["HallOfFame_PrintMonInfo","tMonSpriteId"],
    taskTransitions: ["Task_Hof_TryDisplayAnotherMon"],
    dataReads: ["tDisplayedMonId","tMonSpriteId"],
    dataWrites: ["tFrameCount"],
    lineCount: 10,
    bodyC: "u16 currMonId = gTasks[taskId].tDisplayedMonId;\n    struct HallofFameMon *currMon = &sHofMonPtr->mon[currMonId];\n    struct Sprite *monSprite = &gSprites[gTasks[taskId].tMonSpriteId(currMonId)];\n\n    if (monSprite->callback == SpriteCallbackDummy)\n    {\n        monSprite->oam.affineMode = ST_OAM_AFFINE_OFF;\n        HallOfFame_PrintMonInfo(currMon, 0, 14);\n        gTasks[taskId].tFrameCount = 120;\n        gTasks[taskId].func = Task_Hof_TryDisplayAnotherMon;\n    }",
  },
  "Task_Hof_TryDisplayAnotherMon": {
    callsTo: ["BeginNormalPaletteFade","RGB","tMonSpriteId"],
    taskTransitions: ["Task_Hof_DisplayMon","Task_Hof_PaletteFadeAndPrintWelcomeText"],
    dataReads: ["tDisplayedMonId","tFrameCount","tMonSpriteId"],
    dataWrites: ["tDisplayedMonId","tFrameCount"],
    lineCount: 21,
    bodyC: "u16 currPokeID = gTasks[taskId].tDisplayedMonId;\n    struct HallofFameMon *currMon = &sHofMonPtr->mon[currPokeID];\n\n    if (gTasks[taskId].tFrameCount != 0)\n    {\n        gTasks[taskId].tFrameCount--;\n    }\n    else\n    {\n        sHofFadePalettes |= (0x10000 << gSprites[gTasks[taskId].tMonSpriteId(currPokeID)].oam.paletteNum);\n        if (gTasks[taskId].tDisplayedMonId < PARTY_SIZE - 1 && currMon[1].species != SPECIES_NONE)  \n        {\n            gTasks[taskId].tDisplayedMonId++;\n            BeginNormalPaletteFade(sHofFadePalettes, 0, 12, 12, RGB(16, 29, 24));\n            gSprites[gTasks[taskId].tMonSpriteId(currPokeID)].oam.priority = 1;\n            gTasks[taskId].func = Task_Hof_DisplayMon;\n        }\n        else\n        {\n            gTasks[taskId].func = Task_Hof_PaletteFadeAndPrintWelcomeText;\n        }\n    }",
  },
  "Task_Hof_PaletteFadeAndPrintWelcomeText": {
    callsTo: ["BeginNormalPaletteFade","HallOfFame_PrintWelcomeText","PlaySE","tMonSpriteId"],
    taskTransitions: ["Task_Hof_DoConfetti"],
    dataReads: ["tMonSpriteId"],
    dataWrites: ["tFrameCount"],
    lineCount: 11,
    bodyC: "u16 i;\n\n    BeginNormalPaletteFade(PALETTES_OBJECTS, 0, 0, 0, RGB_BLACK);\n    for (i = 0; i < PARTY_SIZE; i++)\n    {\n        if (gTasks[taskId].tMonSpriteId(i) != SPRITE_NONE)\n            gSprites[gTasks[taskId].tMonSpriteId(i)].oam.priority = 0;\n    }\n\n    HallOfFame_PrintWelcomeText(0, 15);\n    PlaySE(SE_APPLAUSE);\n    gTasks[taskId].tFrameCount = 400;\n    gTasks[taskId].func = Task_Hof_DoConfetti;",
  },
  "Task_Hof_DoConfetti": {
    callsTo: ["BeginNormalPaletteFade","CopyWindowToVram","CreateHofConfettiSprite","FillWindowPixelBuffer","PIXEL_FILL","RGB","tMonSpriteId"],
    taskTransitions: ["Task_Hof_WaitToDisplayPlayer"],
    dataReads: ["tFrameCount","tMonSpriteId"],
    dataWrites: ["tFrameCount"],
    lineCount: 20,
    bodyC: "if (gTasks[taskId].tFrameCount != 0)\n    {\n        gTasks[taskId].tFrameCount--;\n\n         \n         \n        if ((gTasks[taskId].tFrameCount & 3) == 0 && gTasks[taskId].tFrameCount > 110)\n            CreateHofConfettiSprite();\n    }\n    else\n    {\n        u16 i;\n        for (i = 0; i < PARTY_SIZE; i++)\n        {\n            if (gTasks[taskId].tMonSpriteId(i) != SPRITE_NONE)\n                gSprites[gTasks[taskId].tMonSpriteId(i)].oam.priority = 1;\n        }\n        BeginNormalPaletteFade(sHofFadePalettes, 0, 12, 12, RGB(16, 29, 24));\n        FillWindowPixelBuffer(0, PIXEL_FILL(0));\n        CopyWindowToVram(0, COPYWIN_FULL);\n        gTasks[taskId].tFrameCount = 7;\n        gTasks[taskId].func = Task_Hof_WaitToDisplayPlayer;\n    }",
  },
  "Task_Hof_WaitToDisplayPlayer": {
    callsTo: ["SetGpuReg"],
    taskTransitions: ["Task_Hof_DisplayPlayer"],
    dataReads: ["tFrameCount"],
    dataWrites: ["tFrameCount"],
    lineCount: 9,
    bodyC: "if (gTasks[taskId].tFrameCount >= 16)\n    {\n        gTasks[taskId].func = Task_Hof_DisplayPlayer;\n    }\n    else\n    {\n        gTasks[taskId].tFrameCount++;\n        SetGpuReg(REG_OFFSET_BLDALPHA, gTasks[taskId].tFrameCount * 256);\n    }",
  },
  "Task_Hof_DisplayPlayer": {
    callsTo: ["AddWindow","BG_PLTT_ID","CreateTrainerPicSprite","GetTextWindowPalette","LoadPalette","LoadWindowGfx","PlayerGenderToFrontTrainerPicId_Debug","SetGpuReg","ShowBg"],
    taskTransitions: ["Task_Hof_WaitAndPrintPlayerInfo"],
    dataWrites: ["tFrameCount","tPlayerSpriteID"],
    lineCount: 10,
    bodyC: "SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);\n    ShowBg(0);\n    ShowBg(1);\n    ShowBg(3);\n    gTasks[taskId].tPlayerSpriteID = CreateTrainerPicSprite(PlayerGenderToFrontTrainerPicId_Debug(gSaveBlock2Ptr->playerGender, TRUE), TRUE, 120, 72, 6, TAG_NONE);\n    AddWindow(&sHof_WindowTemplate);\n    LoadWindowGfx(1, gSaveBlock2Ptr->optionsWindowFrameType, 0x21D, BG_PLTT_ID(13));\n    LoadPalette(GetTextWindowPalette(1), BG_PLTT_ID(14), PLTT_SIZE_4BPP);\n    gTasks[taskId].tFrameCount = 120;\n    gTasks[taskId].func = Task_Hof_WaitAndPrintPlayerInfo;",
  },
  "Task_Hof_WaitAndPrintPlayerInfo": {
    callsTo: ["AddTextPrinterParameterized2","CopyWindowToVram","DrawDialogueFrame","FillBgTilemapBufferRect_Palette0","HallOfFame_PrintPlayerInfo"],
    taskTransitions: ["Task_Hof_ExitOnKeyPressed"],
    dataReads: ["tFrameCount","tPlayerSpriteID"],
    dataWrites: ["tFrameCount"],
    lineCount: 17,
    bodyC: "if (gTasks[taskId].tFrameCount != 0)\n    {\n        gTasks[taskId].tFrameCount--;\n    }\n    else if (gSprites[gTasks[taskId].tPlayerSpriteID].x != 192)\n    {\n        gSprites[gTasks[taskId].tPlayerSpriteID].x++;\n    }\n    else\n    {\n        FillBgTilemapBufferRect_Palette0(0, 0, 0, 0, 0x20, 0x20);\n        HallOfFame_PrintPlayerInfo(1, 2);\n        DrawDialogueFrame(0, FALSE);\n        AddTextPrinterParameterized2(0, FONT_NORMAL, gText_LeagueChamp, 0, NULL, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY);\n        CopyWindowToVram(0, COPYWIN_FULL);\n        gTasks[taskId].func = Task_Hof_ExitOnKeyPressed;\n    }",
  },
  "Task_Hof_ExitOnKeyPressed": {
    callsTo: ["FadeOutBGM","JOY_NEW"],
    taskTransitions: ["Task_Hof_HandlePaletteOnExit"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON"] },
    lineCount: 5,
    bodyC: "if (JOY_NEW(A_BUTTON))\n    {\n        FadeOutBGM(4);\n        gTasks[taskId].func = Task_Hof_HandlePaletteOnExit;\n    }",
  },
  "Task_Hof_HandlePaletteOnExit": {
    callsTo: ["BeginNormalPaletteFade","CpuCopy16"],
    taskTransitions: ["Task_Hof_HandleExit"],
    lineCount: 3,
    bodyC: "CpuCopy16(gPlttBufferFaded, gPlttBufferUnfaded, PLTT_SIZE);\n    BeginNormalPaletteFade(PALETTES_ALL, 8, 0, 0x10, RGB_BLACK);\n    gTasks[taskId].func = Task_Hof_HandleExit;",
  },
  "Task_Hof_HandleExit": {
    callsTo: ["DestroyTask","FreeAllWindowBuffers","FreeAndDestroyMonPicSprite","FreeAndDestroyTrainerPicSprite","FreeOamMatrix","HideBg","ResetBgsAndClearDma3BusyFlags","StartCredits","TRY_FREE_AND_SET_NULL","UnsetBgTilemapBuffer","tMonSpriteId"],
    dataReads: ["tMonSpriteId","tPlayerSpriteID"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 25,
    bodyC: "if (!gPaletteFade.active)\n    {\n        s32 i;\n\n        for (i = 0; i < PARTY_SIZE; i++)\n        {\n            u8 spriteId = gTasks[taskId].tMonSpriteId(i);\n            if (spriteId != SPRITE_NONE)\n            {\n                FreeOamMatrix(gSprites[spriteId].oam.matrixNum);\n                FreeAndDestroyMonPicSprite(spriteId);\n            }\n        }\n\n        FreeAndDestroyTrainerPicSprite(gTasks[taskId].tPlayerSpriteID);\n        HideBg(0);\n        HideBg(1);\n        HideBg(3);\n        FreeAllWindowBuffers();\n        UnsetBgTilemapBuffer(1);\n        UnsetBgTilemapBuffer(3);\n        ResetBgsAndClearDma3BusyFlags(0);\n        DestroyTask(taskId);\n\n        TRY_FREE_AND_SET_NULL(sHofGfxPtr);\n        TRY_FREE_AND_SET_NULL(sHofMonPtr);\n\n        StartCredits();\n    }",
  },
  "Task_HofPC_CopySaveData": {
    callsTo: ["CpuCopy16","GetGameStat","HofPCTopBar_AddWindow","LoadGameSave"],
    taskTransitions: ["Task_HofPC_DrawSpritesPrintText","Task_HofPC_PrintDataIsCorrupted"],
    dataWrites: ["tCurrPageNo","tCurrTeamNo"],
    lineCount: 23,
    bodyC: "HofPCTopBar_AddWindow(0, 30, 0, 12, 0x226);\n    if (LoadGameSave(SAVE_HALL_OF_FAME) != SAVE_STATUS_OK)\n    {\n        gTasks[taskId].func = Task_HofPC_PrintDataIsCorrupted;\n    }\n    else\n    {\n        u16 i;\n        struct HallofFameTeam *savedTeams;\n\n        CpuCopy16(gDecompressionBuffer, sHofMonPtr, SECTOR_SIZE * NUM_HOF_SECTORS);\n        savedTeams = sHofMonPtr;\n        for (i = 0; i < HALL_OF_FAME_MAX_TEAMS; i++, savedTeams++)\n        {\n            if (savedTeams->mon[0].species == SPECIES_NONE)\n                break;\n        }\n\n        if (i < HALL_OF_FAME_MAX_TEAMS)\n            gTasks[taskId].tCurrTeamNo = i - 1;\n        else\n            gTasks[taskId].tCurrTeamNo = HALL_OF_FAME_MAX_TEAMS - 1;\n\n        gTasks[taskId].tCurrPageNo = GetGameStat(GAME_STAT_ENTERED_HOF);\n\n        gTasks[taskId].func = Task_HofPC_DrawSpritesPrintText;\n    }",
  },
  "Task_HofPC_DrawSpritesPrintText": {
    callsTo: ["BlendPalettes","ConvertIntToDecimalStringN","CreateMonPicSprite_HandleDeoxys","HofPCTopBar_PrintPair","RGB","StringExpandPlaceholders","tMonSpriteId"],
    taskTransitions: ["Task_HofPC_PrintMonInfo"],
    dataReads: ["tCurrPageNo","tCurrTeamNo","tMonNo","tMonSpriteId"],
    dataWrites: ["tCurrMonId","tMonNo"],
    lineCount: 50,
    bodyC: "struct HallofFameTeam *savedTeams = sHofMonPtr;\n    struct HallofFameMon *currMon;\n    u16 i;\n\n    for (i = 0; i < gTasks[taskId].tCurrTeamNo; i++)\n        savedTeams++;\n\n    currMon = &savedTeams->mon[0];\n    sHofFadePalettes = 0;\n    gTasks[taskId].tCurrMonId = 0;\n    gTasks[taskId].tMonNo = 0;\n\n    for (i = 0; i < PARTY_SIZE; i++, currMon++)\n    {\n        if (currMon->species != 0)\n            gTasks[taskId].tMonNo++;\n    }\n\n    currMon = &savedTeams->mon[0];\n\n    for (i = 0; i < PARTY_SIZE; i++, currMon++)\n    {\n        if (currMon->species != 0)\n        {\n            u16 spriteId;\n            s16 posX, posY;\n\n            if (gTasks[taskId].tMonNo > PARTY_SIZE / 2)\n            {\n                posX = sHallOfFame_MonFullTeamPositions[i][2];\n                posY = sHallOfFame_MonFullTeamPositions[i][3];\n            }\n            else\n            {\n                posX = sHallOfFame_MonHalfTeamPositions[i][2];\n                posY = sHallOfFame_MonHalfTeamPositions[i][3];\n            }\n\n            if (currMon->species == SPECIES_EGG)\n                posY += 10;\n\n            spriteId = CreateMonPicSprite_HandleDeoxys(currMon->species, currMon->tid, currMon->personality, TRUE, posX, posY, i, TAG_NONE);\n            gSprites[spriteId].oam.priority = 1;\n            gTasks[taskId].tMonSpriteId(i) = spriteId;\n        }\n        else\n        {\n            gTasks[taskId].tMonSpriteId(i) = SPRITE_NONE;\n        }\n    }\n\n    BlendPalettes(PALETTES_OBJECTS, 0xC, RGB(16, 29, 24));\n\n    ConvertIntToDecimalStringN(gStringVar1, gTasks[taskId].tCurrPageNo, STR_CONV_MODE_RIGHT_ALIGN, 3);\n    StringExpandPlaceholders(gStringVar4, gText_HOFNumber);\n\n    if (gTasks[taskId].tCurrTeamNo <= 0)\n        HofPCTopBar_PrintPair(gStringVar4, gText_PickCancel, FALSE, 0, TRUE);\n    else\n        HofPCTopBar_PrintPair(gStringVar4, gText_PickNextCancel, FALSE, 0, TRUE);\n\n    gTasks[taskId].func = Task_HofPC_PrintMonInfo;",
  },
  "Task_HofPC_PrintMonInfo": {
    callsTo: ["BlendPalettesUnfaded","HallOfFame_PrintMonInfo","PlayCry_Normal","RGB","StopCryAndClearCrySongs","tMonSpriteId"],
    taskTransitions: ["Task_HofPC_HandleInput"],
    dataReads: ["tCurrMonId","tCurrTeamNo","tMonSpriteId"],
    lineCount: 24,
    bodyC: "struct HallofFameTeam *savedTeams = sHofMonPtr;\n    struct HallofFameMon *currMon;\n    u16 i;\n    u16 currMonID;\n\n    for (i = 0; i < gTasks[taskId].tCurrTeamNo; i++)\n        savedTeams++;\n\n    for (i = 0; i < PARTY_SIZE; i++)\n    {\n        u16 spriteId = gTasks[taskId].tMonSpriteId(i);\n        if (spriteId != SPRITE_NONE)\n            gSprites[spriteId].oam.priority = 1;\n    }\n\n    currMonID = gTasks[taskId].tMonSpriteId(gTasks[taskId].tCurrMonId);\n    gSprites[currMonID].oam.priority = 0;\n    sHofFadePalettes = (0x10000 << gSprites[currMonID].oam.paletteNum) ^ PALETTES_OBJECTS;\n    BlendPalettesUnfaded(sHofFadePalettes, 0xC, RGB(16, 29, 24));\n\n    currMon = &savedTeams->mon[gTasks[taskId].tCurrMonId];\n    if (currMon->species != SPECIES_EGG)\n    {\n        StopCryAndClearCrySongs();\n        PlayCry_Normal(currMon->species, 0);\n    }\n    HallOfFame_PrintMonInfo(currMon, 0, 14);\n\n    gTasks[taskId].func = Task_HofPC_HandleInput;",
  },
  "Task_HofPC_HandleInput": {
    callsTo: ["FreeAndDestroyMonPicSprite","IsCryPlayingOrClearCrySongs","JOY_NEW","StopCryAndClearCrySongs","m4aMPlayVolumeControl","tMonSpriteId"],
    taskTransitions: ["Task_HofPC_DrawSpritesPrintText","Task_HofPC_HandlePaletteOnExit","Task_HofPC_PrintMonInfo"],
    dataReads: ["tCurrMonId","tCurrPageNo","tCurrTeamNo","tMonNo","tMonSpriteId"],
    dataWrites: ["tCurrMonId","tCurrPageNo","tCurrTeamNo"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON","NEW:B_BUTTON","NEW:DPAD_DOWN","NEW:DPAD_UP"] },
    lineCount: 48,
    bodyC: "u16 i;\n\n    if (JOY_NEW(A_BUTTON))\n    {\n        if (gTasks[taskId].tCurrTeamNo != 0)  \n        {\n            gTasks[taskId].tCurrTeamNo--;\n            for (i = 0; i < PARTY_SIZE; i++)\n            {\n                u8 spriteId = gTasks[taskId].tMonSpriteId(i);\n                if (spriteId != SPRITE_NONE)\n                {\n                    FreeAndDestroyMonPicSprite(spriteId);\n                    gTasks[taskId].tMonSpriteId(i) = SPRITE_NONE;\n                }\n            }\n            if (gTasks[taskId].tCurrPageNo != 0)\n                gTasks[taskId].tCurrPageNo--;\n            gTasks[taskId].func = Task_HofPC_DrawSpritesPrintText;\n        }\n        else  \n        {\n            if (IsCryPlayingOrClearCrySongs())\n            {\n                StopCryAndClearCrySongs();\n                m4aMPlayVolumeControl(&gMPlayInfo_BGM, TRACKS_ALL, 0x100);\n            }\n            gTasks[taskId].func = Task_HofPC_HandlePaletteOnExit;\n        }\n    }\n    else if (JOY_NEW(B_BUTTON))  \n    {\n        if (IsCryPlayingOrClearCrySongs())\n        {\n            StopCryAndClearCrySongs();\n            m4aMPlayVolumeControl(&gMPlayInfo_BGM, TRACKS_ALL, 0x100);\n        }\n        gTasks[taskId].func = Task_HofPC_HandlePaletteOnExit;\n    }\n    else if (JOY_NEW(DPAD_UP) && gTasks[taskId].tCurrMonId != 0)  \n    {\n        gTasks[taskId].tCurrMonId--;\n        gTasks[taskId].func = Task_HofPC_PrintMonInfo;\n    }\n    else if (JOY_NEW(DPAD_DOWN) && gTasks[taskId].tCurrMonId < gTasks[taskId].tMonNo - 1)  \n    {\n        gTasks[taskId].tCurrMonId++;\n        gTasks[taskId].func = Task_HofPC_PrintMonInfo;\n    }",
  },
  "Task_HofPC_HandlePaletteOnExit": {
    callsTo: ["ComputerScreenCloseEffect","CpuCopy16"],
    taskTransitions: ["Task_HofPC_HandleExit"],
    lineCount: 6,
    bodyC: "struct HallofFameTeam *fameTeam;\n\n    CpuCopy16(gPlttBufferFaded, gPlttBufferUnfaded, PLTT_SIZE);\n    fameTeam = (struct HallofFameTeam *)(gDecompressionBuffer);\n    fameTeam->mon[0] = sDummyFameMon;\n    ComputerScreenCloseEffect(0, 0, 0);\n    gTasks[taskId].func = Task_HofPC_HandleExit;",
  },
  "Task_HofPC_HandleExit": {
    callsTo: ["DestroyTask","FreeAllWindowBuffers","FreeAndDestroyMonPicSprite","HideBg","HofPCTopBar_RemoveWindow","IsComputerScreenCloseEffectActive","ResetBgsAndClearDma3BusyFlags","ReturnFromHallOfFamePC","TRY_FREE_AND_SET_NULL","UnsetBgTilemapBuffer","tMonSpriteId"],
    dataReads: ["tMonSpriteId"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 25,
    bodyC: "if (!IsComputerScreenCloseEffectActive())\n    {\n        u8 i;\n\n        for (i = 0; i < PARTY_SIZE; i++)\n        {\n            u16 spriteId = gTasks[taskId].tMonSpriteId(i);\n            if (spriteId != SPRITE_NONE)\n            {\n                FreeAndDestroyMonPicSprite(spriteId);\n                gTasks[taskId].tMonSpriteId(i) = SPRITE_NONE;\n            }\n        }\n\n        HideBg(0);\n        HideBg(1);\n        HideBg(3);\n        HofPCTopBar_RemoveWindow();\n        FreeAllWindowBuffers();\n        UnsetBgTilemapBuffer(1);\n        UnsetBgTilemapBuffer(3);\n        ResetBgsAndClearDma3BusyFlags(0);\n        DestroyTask(taskId);\n\n        TRY_FREE_AND_SET_NULL(sHofGfxPtr);\n        TRY_FREE_AND_SET_NULL(sHofMonPtr);\n\n        ReturnFromHallOfFamePC();\n    }",
  },
  "Task_HofPC_PrintDataIsCorrupted": {
    callsTo: ["AddTextPrinterParameterized2","CopyWindowToVram","DrawDialogueFrame","HofPCTopBar_Print"],
    taskTransitions: ["Task_HofPC_ExitOnButtonPress"],
    lineCount: 5,
    bodyC: "HofPCTopBar_Print(gText_AButtonExit, 8, TRUE);\n    DrawDialogueFrame(0, FALSE);\n    AddTextPrinterParameterized2(0, FONT_NORMAL, gText_HOFCorrupted, 0, NULL, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY);\n    CopyWindowToVram(0, COPYWIN_FULL);\n    gTasks[taskId].func = Task_HofPC_ExitOnButtonPress;",
  },
  "Task_HofPC_ExitOnButtonPress": {
    callsTo: ["JOY_NEW"],
    taskTransitions: ["Task_HofPC_HandlePaletteOnExit"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON"] },
    lineCount: 2,
    bodyC: "if (JOY_NEW(A_BUTTON))\n        gTasks[taskId].func = Task_HofPC_HandlePaletteOnExit;",
  },
  "Task_DoDomeConfetti": {
    callsTo: ["ARRAY_COUNT","ConfettiUtil_AddNew","ConfettiUtil_Init","ConfettiUtil_SetCallback","ConfettiUtil_SetData","ConfettiUtil_Update","DestroyTask","LoadCompressedSpritePalette","LoadCompressedSpriteSheet","Random","StopDomeConfetti"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 46,
    bodyC: "u32 id = 0;\n    u16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n    case 0:\n        if (!ConfettiUtil_Init(64))\n        {\n             \n            DestroyTask(taskId);\n            gSpecialVar_0x8004 = 0;\n            gSpecialVar_0x8005 = 0xFFFF;\n        }\n        LoadCompressedSpriteSheet(sSpriteSheet_Confetti);\n        LoadCompressedSpritePalette(sSpritePalette_Confetti);\n        tState++;\n        break;\n    case 1:\n        if (tTimer != 0 && tTimer % 3 == 0)\n        {\n             \n            id = ConfettiUtil_AddNew(&sOamData_Confetti,\n                              TAG_CONFETTI,\n                              TAG_CONFETTI,\n                              Random() % DISPLAY_WIDTH,\n                              -(Random() % 8),\n                              Random() % ARRAY_COUNT(sAnims_Confetti),\n                              id);\n            if (id != 0xFF)\n            {\n                ConfettiUtil_SetCallback(id, UpdateDomeConfetti);\n\n                 \n                if ((Random() % 4) == 0)\n                    ConfettiUtil_SetData(id, CONFETTI_EXTRA_Y, 1);\n\n                ConfettiUtil_SetData(id, CONFETTI_TASK_ID, taskId);\n                tConfettiCount++;\n            }\n        }\n\n        ConfettiUtil_Update();\n        if (tTimer != 0)\n            tTimer--;\n        else if (tConfettiCount == 0)\n            tState = 0xFF;\n        break;\n    case 0xFF:\n        StopDomeConfetti();\n        gSpecialVar_0x8004 = 0;\n        gSpecialVar_0x8005 = 0xFFFF;\n        break;\n    }",
  },
} as const;

export const CB2S = {
  "CB2_HallOfFame": {
    callsTo: ["AnimateSprites","BuildOamBuffer","RunTasks","RunTextPrinters","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 5,
    bodyC: "RunTasks();\n    RunTextPrinters();\n    AnimateSprites();\n    BuildOamBuffer();\n    UpdatePaletteFade();",
  },
  "CB2_DoHallOfFameScreen": {
    callsTo: ["AllocZeroed","CreateTask","InitHallOfFameScreen"],
    lineCount: 6,
    bodyC: "if (!InitHallOfFameScreen())\n    {\n        u8 taskId = CreateTask(Task_Hof_InitMonData, 0);\n        gTasks[taskId].tDontSaveData = FALSE;\n        sHofMonPtr = AllocZeroed(sizeof(*sHofMonPtr));\n    }",
  },
  "CB2_DoHallOfFameScreenDontSaveData": {
    callsTo: ["AllocZeroed","CreateTask","InitHallOfFameScreen"],
    lineCount: 6,
    bodyC: "if (!InitHallOfFameScreen())\n    {\n        u8 taskId = CreateTask(Task_Hof_InitMonData, 0);\n        gTasks[taskId].tDontSaveData = TRUE;\n        sHofMonPtr = AllocZeroed(sizeof(*sHofMonPtr));\n    }",
  },
  "CB2_DoHallOfFamePC": {
    callsTo: ["AllocZeroed","AnimateSprites","BLDALPHA_BLEND","BuildOamBuffer","ClearVramOamPltt_LoadHofPal","ComputerScreenOpenEffect","CreateTask","InitHofBgs","IsComputerScreenOpenEffectActive","LoadHofBgs","LoadHofGfx","RunTasks","SetGpuReg","SetMainCallback2","SetVBlankCallback","UpdatePaletteFade","tMonSpriteId"],
    cb2Transitions: ["CB2_HallOfFame"],
    externalChecks: { waitForVBlank: true },
    lineCount: 54,
    bodyC: "switch (gMain.state)\n    {\n    case 0:\n    default:\n        SetVBlankCallback(NULL);\n        ClearVramOamPltt_LoadHofPal();\n        sHofGfxPtr = AllocZeroed(sizeof(*sHofGfxPtr));\n        gMain.state = 1;\n        break;\n    case 1:\n        LoadHofGfx();\n        gMain.state++;\n        break;\n    case 2:\n        SetGpuReg(REG_OFFSET_BLDCNT, 0);\n        SetGpuReg(REG_OFFSET_BLDALPHA, 0);\n        SetGpuReg(REG_OFFSET_BLDY, 0);\n        InitHofBgs();\n        gMain.state++;\n        break;\n    case 3:\n        if (!LoadHofBgs())\n        {\n            struct HallofFameTeam *fameTeam = (struct HallofFameTeam *)(gDecompressionBuffer);\n            fameTeam->mon[0] = sDummyFameMon;\n            ComputerScreenOpenEffect(0, 0, 0);\n            SetVBlankCallback(VBlankCB_HallOfFame);\n            gMain.state++;\n        }\n        break;\n    case 4:\n        RunTasks();\n        AnimateSprites();\n        BuildOamBuffer();\n        UpdatePaletteFade();\n        if (!IsComputerScreenOpenEffectActive())\n            gMain.state++;\n        break;\n    case 5:\n        {\n            u8 taskId, i;\n\n            SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG1 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_ALL);\n            SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(16, 7));\n            SetGpuReg(REG_OFFSET_BLDY, 0);\n            taskId = CreateTask(Task_HofPC_CopySaveData, 0);\n\n            for (i = 0; i < PARTY_SIZE; i++)\n            {\n                gTasks[taskId].tMonSpriteId(i) = SPRITE_NONE;\n            }\n\n            sHofMonPtr = AllocZeroed(SECTOR_SIZE * NUM_HOF_SECTORS);\n            SetMainCallback2(CB2_HallOfFame);\n        }\n        break;\n    }",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_GetOnScreenAndAnimate": {
    callsTo: ["DoMonFrontSpriteAnimation"],
    lineCount: 20,
    bodyC: "if (sprite->x != sprite->tDestinationX\n        || sprite->y != sprite->tDestinationY)\n    {\n        if (sprite->x < sprite->tDestinationX)\n            sprite->x += 15;\n        if (sprite->x > sprite->tDestinationX)\n            sprite->x -= 15;\n\n        if (sprite->y < sprite->tDestinationY)\n            sprite->y += 10;\n        if (sprite->y > sprite->tDestinationY)\n            sprite->y -= 10;\n    }\n    else\n    {\n        s16 species = sprite->tSpecies;\n\n        if (species == SPECIES_EGG)\n            DoMonFrontSpriteAnimation(sprite, species, TRUE, 3);\n        else\n            DoMonFrontSpriteAnimation(sprite, species, FALSE, 3);\n    }",
  },
  "SpriteCB_HofConfetti": {
    callsTo: ["DestroySprite","Random"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 15,
    bodyC: "if (sprite->y2 > 120)\n    {\n        DestroySprite(sprite);\n    }\n    else\n    {\n        u16 rand;\n        u8 sineIdx;\n\n        sprite->y2++;\n        sprite->y2 += sprite->sExtraY;\n\n        sineIdx = sprite->sSineIdx;\n        rand = (Random() % 4) + 8;\n        sprite->x2 = rand * gSineTable[sineIdx] / 256;\n\n        sprite->sSineIdx += 4;\n    }",
  },
} as const;
