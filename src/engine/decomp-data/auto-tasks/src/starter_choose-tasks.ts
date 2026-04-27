// AUTO-GENERATED from src/starter_choose.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 8 Task_, 2 CB2_, 3 SpriteCB_

export const TASKS = {
  "Task_StarterChoose": {
    callsTo: ["AddTextPrinterParameterized","CreateStarterPokemonLabel","DrawStdFrameWithCustomTileAndPalette","PutWindowTilemap","ScheduleBgCopyTilemapToVram"],
    taskTransitions: ["Task_HandleStarterChooseInput"],
    dataReads: ["tStarterSelection"],
    lineCount: 6,
    bodyC: "CreateStarterPokemonLabel(gTasks[taskId].tStarterSelection);\n    DrawStdFrameWithCustomTileAndPalette(0, FALSE, 0x2A8, 0xD);\n    AddTextPrinterParameterized(0, FONT_NORMAL, gText_BirchInTrouble, 0, 1, 0, NULL);\n    PutWindowTilemap(0);\n    ScheduleBgCopyTilemapToVram(0);\n    gTasks[taskId].func = Task_HandleStarterChooseInput;",
  },
  "Task_HandleStarterChooseInput": {
    callsTo: ["ClearStarterLabel","CreatePokemonFrontSprite","CreateSprite","GetStarterPokemon","JOY_NEW"],
    taskTransitions: ["Task_MoveStarterChooseCursor","Task_WaitForStarterSprite"],
    dataReads: ["tStarterSelection"],
    dataWrites: ["tCircleSpriteId","tPkmnSpriteId","tStarterSelection"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON","NEW:DPAD_LEFT","NEW:DPAD_RIGHT"] },
    lineCount: 23,
    bodyC: "u8 selection = gTasks[taskId].tStarterSelection;\n\n    if (JOY_NEW(A_BUTTON))\n    {\n        u8 spriteId;\n\n        ClearStarterLabel();\n\n         \n        spriteId = CreateSprite(&sSpriteTemplate_StarterCircle, sPokeballCoords[selection][0], sPokeballCoords[selection][1], 1);\n        gTasks[taskId].tCircleSpriteId = spriteId;\n\n         \n        spriteId = CreatePokemonFrontSprite(GetStarterPokemon(gTasks[taskId].tStarterSelection), sPokeballCoords[selection][0], sPokeballCoords[selection][1]);\n        gSprites[spriteId].affineAnims = &sAffineAnims_StarterPokemon;\n        gSprites[spriteId].callback = SpriteCB_StarterPokemon;\n\n        gTasks[taskId].tPkmnSpriteId = spriteId;\n        gTasks[taskId].func = Task_WaitForStarterSprite;\n    }\n    else if (JOY_NEW(DPAD_LEFT) && selection > 0)\n    {\n        gTasks[taskId].tStarterSelection--;\n        gTasks[taskId].func = Task_MoveStarterChooseCursor;\n    }\n    else if (JOY_NEW(DPAD_RIGHT) && selection < STARTER_MON_COUNT - 1)\n    {\n        gTasks[taskId].tStarterSelection++;\n        gTasks[taskId].func = Task_MoveStarterChooseCursor;\n    }",
  },
  "Task_WaitForStarterSprite": {
    taskTransitions: ["Task_AskConfirmStarter"],
    dataReads: ["tCircleSpriteId"],
    lineCount: 6,
    bodyC: "if (gSprites[gTasks[taskId].tCircleSpriteId].affineAnimEnded &&\n        gSprites[gTasks[taskId].tCircleSpriteId].x == STARTER_PKMN_POS_X &&\n        gSprites[gTasks[taskId].tCircleSpriteId].y == STARTER_PKMN_POS_Y)\n    {\n        gTasks[taskId].func = Task_AskConfirmStarter;\n    }",
  },
  "Task_AskConfirmStarter": {
    callsTo: ["AddTextPrinterParameterized","CreateYesNoMenu","FillWindowPixelBuffer","GetStarterPokemon","PIXEL_FILL","PlayCry_Normal","ScheduleBgCopyTilemapToVram"],
    taskTransitions: ["Task_HandleConfirmStarterInput"],
    dataReads: ["tStarterSelection"],
    lineCount: 6,
    bodyC: "PlayCry_Normal(GetStarterPokemon(gTasks[taskId].tStarterSelection), 0);\n    FillWindowPixelBuffer(0, PIXEL_FILL(1));\n    AddTextPrinterParameterized(0, FONT_NORMAL, gText_ConfirmStarterChoice, 0, 1, 0, NULL);\n    ScheduleBgCopyTilemapToVram(0);\n    CreateYesNoMenu(&sWindowTemplate_ConfirmStarter, 0x2A8, 0xD, 0);\n    gTasks[taskId].func = Task_HandleConfirmStarterInput;",
  },
  "Task_HandleConfirmStarterInput": {
    callsTo: ["DestroySprite","FreeAndDestroyMonPicSprite","FreeOamMatrix","Menu_ProcessInputNoWrapClearOnChoose","PlaySE","ResetAllPicSprites","SetMainCallback2"],
    taskTransitions: ["Task_DeclineStarter"],
    dataReads: ["tCircleSpriteId","tPkmnSpriteId","tStarterSelection"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 20,
    bodyC: "u8 spriteId;\n\n    switch (Menu_ProcessInputNoWrapClearOnChoose())\n    {\n    case 0:   \n         \n        gSpecialVar_Result = gTasks[taskId].tStarterSelection;\n        ResetAllPicSprites();\n        SetMainCallback2(gMain.savedCallback);\n        break;\n    case 1:   \n    case MENU_B_PRESSED:\n        PlaySE(SE_SELECT);\n        spriteId = gTasks[taskId].tPkmnSpriteId;\n        FreeOamMatrix(gSprites[spriteId].oam.matrixNum);\n        FreeAndDestroyMonPicSprite(spriteId);\n\n        spriteId = gTasks[taskId].tCircleSpriteId;\n        FreeOamMatrix(gSprites[spriteId].oam.matrixNum);\n        DestroySprite(&gSprites[spriteId]);\n        gTasks[taskId].func = Task_DeclineStarter;\n        break;\n    }",
  },
  "Task_DeclineStarter": {
    taskTransitions: ["Task_StarterChoose"],
    lineCount: 1,
    bodyC: "gTasks[taskId].func = Task_StarterChoose;",
  },
  "Task_MoveStarterChooseCursor": {
    callsTo: ["ClearStarterLabel"],
    taskTransitions: ["Task_CreateStarterLabel"],
    lineCount: 2,
    bodyC: "ClearStarterLabel();\n    gTasks[taskId].func = Task_CreateStarterLabel;",
  },
  "Task_CreateStarterLabel": {
    callsTo: ["CreateStarterPokemonLabel"],
    taskTransitions: ["Task_HandleStarterChooseInput"],
    dataReads: ["tStarterSelection"],
    lineCount: 2,
    bodyC: "CreateStarterPokemonLabel(gTasks[taskId].tStarterSelection);\n    gTasks[taskId].func = Task_HandleStarterChooseInput;",
  },
} as const;

export const CB2S = {
  "CB2_ChooseStarter": {
    callsTo: ["ARRAY_COUNT","BG_PLTT_ID","BG_SCREEN_ADDR","BeginNormalPaletteFade","ChangeBgX","ChangeBgY","ClearScheduledBgCopiesToVram","CreateSprite","CreateTask","DeactivateAllTextPrinters","DmaFill16","DmaFill32","EnableInterrupts","FreeAllSpritePalettes","GetOverworldTextboxPalettePtr","InitBgsFromTemplates","InitWindows","LZ77UnCompVram","LoadCompressedSpriteSheet","LoadPalette","LoadSpritePalettes","LoadUserWindowBorderGfx","ResetAllPicSprites","ResetBgsAndClearDma3BusyFlags","ResetPaletteFade","ResetSpriteData","ResetTasks","ScanlineEffect_Stop","SetGpuReg","SetMainCallback2","SetVBlankCallback","ShowBg"],
    cb2Transitions: ["CB2_StarterChoose"],
    lineCount: 68,
    bodyC: "u8 taskId;\n    u8 spriteId;\n\n    SetVBlankCallback(NULL);\n\n    SetGpuReg(REG_OFFSET_DISPCNT, 0);\n    SetGpuReg(REG_OFFSET_BG3CNT, 0);\n    SetGpuReg(REG_OFFSET_BG2CNT, 0);\n    SetGpuReg(REG_OFFSET_BG1CNT, 0);\n    SetGpuReg(REG_OFFSET_BG0CNT, 0);\n\n    ChangeBgX(0, 0, BG_COORD_SET);\n    ChangeBgY(0, 0, BG_COORD_SET);\n    ChangeBgX(1, 0, BG_COORD_SET);\n    ChangeBgY(1, 0, BG_COORD_SET);\n    ChangeBgX(2, 0, BG_COORD_SET);\n    ChangeBgY(2, 0, BG_COORD_SET);\n    ChangeBgX(3, 0, BG_COORD_SET);\n    ChangeBgY(3, 0, BG_COORD_SET);\n\n    DmaFill16(3, 0, VRAM, VRAM_SIZE);\n    DmaFill32(3, 0, OAM, OAM_SIZE);\n    DmaFill16(3, 0, PLTT, PLTT_SIZE);\n\n    LZ77UnCompVram(gBirchBagGrass_Gfx, (void *)VRAM);\n    LZ77UnCompVram(gBirchBagTilemap, (void *)(BG_SCREEN_ADDR(6)));\n    LZ77UnCompVram(gBirchGrassTilemap, (void *)(BG_SCREEN_ADDR(7)));\n\n    ResetBgsAndClearDma3BusyFlags(0);\n    InitBgsFromTemplates(0, sBgTemplates, ARRAY_COUNT(sBgTemplates));\n    InitWindows(sWindowTemplates);\n\n    DeactivateAllTextPrinters();\n    LoadUserWindowBorderGfx(0, 0x2A8, BG_PLTT_ID(13));\n    ClearScheduledBgCopiesToVram();\n    ScanlineEffect_Stop();\n    ResetTasks();\n    ResetSpriteData();\n    ResetPaletteFade();\n    FreeAllSpritePalettes();\n    ResetAllPicSprites();\n\n    LoadPalette(GetOverworldTextboxPalettePtr(), BG_PLTT_ID(14), PLTT_SIZE_4BPP);\n    LoadPalette(gBirchBagGrass_Pal, BG_PLTT_ID(0), sizeof(gBirchBagGrass_Pal));\n    LoadCompressedSpriteSheet(&sSpriteSheet_PokeballSelect[0]);\n    LoadCompressedSpriteSheet(&sSpriteSheet_StarterCircle[0]);\n    LoadSpritePalettes(sSpritePalettes_StarterChoose);\n    BeginNormalPaletteFade(PALETTES_ALL, 0, 0x10, 0, RGB_BLACK);\n\n    EnableInterrupts(DISPSTAT_VBLANK);\n    SetVBlankCallback(VblankCB_StarterChoose);\n    SetMainCallback2(CB2_StarterChoose);\n\n    SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR);\n    SetGpuReg(REG_OFFSET_WINOUT, WINOUT_WIN01_BG_ALL | WINOUT_WIN01_OBJ);\n    SetGpuReg(REG_OFFSET_WIN0H, 0);\n    SetGpuReg(REG_OFFSET_WIN0V, 0);\n    SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG1 | BLDCNT_TGT1_BG2 | BLDCNT_TGT1_BG3 | BLDCNT_TGT1_OBJ | BLDCNT_TGT1_BD | BLDCNT_EFFECT_DARKEN);\n    SetGpuReg(REG_OFFSET_BLDALPHA, 0);\n    SetGpuReg(REG_OFFSET_BLDY, 7);\n    SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON | DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);\n\n    ShowBg(0);\n    ShowBg(2);\n    ShowBg(3);\n\n    taskId = CreateTask(Task_StarterChoose, 0);\n    gTasks[taskId].tStarterSelection = 1;\n\n     \n    spriteId = CreateSprite(&sSpriteTemplate_Hand, 120, 56, 2);\n    gSprites[spriteId].data[0] = taskId;\n\n     \n    spriteId = CreateSprite(&sSpriteTemplate_Pokeball, sPokeballCoords[0][0], sPokeballCoords[0][1], 2);\n    gSprites[spriteId].sTaskId = taskId;\n    gSprites[spriteId].sBallId = 0;\n\n    spriteId = CreateSprite(&sSpriteTemplate_Pokeball, sPokeballCoords[1][0], sPokeballCoords[1][1], 2);\n    gSprites[spriteId].sTaskId = taskId;\n    gSprites[spriteId].sBallId = 1;\n\n    spriteId = CreateSprite(&sSpriteTemplate_Pokeball, sPokeballCoords[2][0], sPokeballCoords[2][1], 2);\n    gSprites[spriteId].sTaskId = taskId;\n    gSprites[spriteId].sBallId = 2;\n\n    sStarterLabelWindowId = WINDOW_NONE;",
  },
  "CB2_StarterChoose": {
    callsTo: ["AnimateSprites","BuildOamBuffer","DoScheduledBgTilemapCopiesToVram","RunTasks","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 5,
    bodyC: "RunTasks();\n    AnimateSprites();\n    BuildOamBuffer();\n    DoScheduledBgTilemapCopiesToVram();\n    UpdatePaletteFade();",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_SelectionHand": {
    callsTo: ["Sin"],
    lineCount: 4,
    bodyC: "sprite->x = sCursorCoords[gTasks[sprite->data[0]].tStarterSelection][0];\n    sprite->y = sCursorCoords[gTasks[sprite->data[0]].tStarterSelection][1];\n    sprite->y2 = Sin(sprite->data[1], 8);\n    sprite->data[1] = (u8)(sprite->data[1]) + 4;",
  },
  "SpriteCB_Pokeball": {
    callsTo: ["StartSpriteAnimIfDifferent"],
    lineCount: 4,
    bodyC: "if (gTasks[sprite->sTaskId].tStarterSelection == sprite->sBallId)\n        StartSpriteAnimIfDifferent(sprite, 1);\n    else\n        StartSpriteAnimIfDifferent(sprite, 0);",
  },
  "SpriteCB_StarterPokemon": {
    lineCount: 8,
    bodyC: "if (sprite->x > STARTER_PKMN_POS_X)\n        sprite->x -= 4;\n    if (sprite->x < STARTER_PKMN_POS_X)\n        sprite->x += 4;\n    if (sprite->y > STARTER_PKMN_POS_Y)\n        sprite->y -= 2;\n    if (sprite->y < STARTER_PKMN_POS_Y)\n        sprite->y += 2;",
  },
} as const;
