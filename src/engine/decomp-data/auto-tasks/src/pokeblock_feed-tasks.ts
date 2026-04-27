// AUTO-GENERATED from src/pokeblock_feed.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 5 Task_, 1 CB2_, 2 SpriteCB_

export const TASKS = {
  "Task_HandlePokeblockFeed": {
    callsTo: ["CalculateMonAnimLength","CreatePokeblockSprite","DoPokeblockCaseThrowEffect","StartMonJumpForPokeblock","UpdateMonAnim"],
    taskTransitions: ["Task_PrintAtePokeblockMessage"],
    dataReads: ["tHorizontalThrow","tState"],
    dataWrites: ["tState"],
    externalChecks: { paletteFade: true },
    lineCount: 29,
    bodyC: "if (!gPaletteFade.active)\n    {\n        switch (gTasks[taskId].tState)\n        {\n        case 0:\n            sPokeblockFeed->animRunState = 0;\n            sPokeblockFeed->timer = 0;\n            CalculateMonAnimLength();\n            break;\n        case STATE_START_THROW:\n            DoPokeblockCaseThrowEffect(sPokeblockFeed->pokeblockCaseSpriteId, gTasks[taskId].tHorizontalThrow);\n            break;\n        case STATE_SPAWN_PBLOCK:\n            sPokeblockFeed->pokeblockSpriteId = CreatePokeblockSprite();\n            break;\n        case STATE_START_JUMP:\n            StartMonJumpForPokeblock(sPokeblockFeed->monSpriteId);\n            break;\n        case STATE_PRINT_MSG:\n            gTasks[taskId].func = Task_PrintAtePokeblockMessage;\n            return;\n        }\n\n        if (sPokeblockFeed->timer < sPokeblockFeed->monAnimLength)\n            UpdateMonAnim();\n        else if (sPokeblockFeed->timer == sPokeblockFeed->monAnimLength)\n            gTasks[taskId].tState = STATE_START_THROW - 1;\n\n        sPokeblockFeed->timer++;\n        gTasks[taskId].tState++;\n    }",
  },
  "Task_WaitForAtePokeblockMessage": {
    callsTo: ["RunTextPrintersRetIsActive"],
    taskTransitions: ["Task_FadeOutPokeblockFeed"],
    lineCount: 2,
    bodyC: "if (RunTextPrintersRetIsActive(0) != TRUE)\n        gTasks[taskId].func = Task_FadeOutPokeblockFeed;",
  },
  "Task_PrintAtePokeblockMessage": {
    callsTo: ["AddTextPrinterParameterized2","GetMonNickname","GetNature","GetPlayerTextSpeedDelay","PokeblockCopyName","PokeblockGetGain","StringExpandPlaceholders"],
    taskTransitions: ["Task_WaitForAtePokeblockMessage"],
    lineCount: 14,
    bodyC: "struct Pokemon *mon = &gPlayerParty[gPokeblockMonId];\n    struct Pokeblock *pokeblock = &gSaveBlock1Ptr->pokeblocks[gSpecialVar_ItemId];\n\n    gPokeblockGain = PokeblockGetGain(GetNature(mon), pokeblock);\n    GetMonNickname(mon, gStringVar1);\n    PokeblockCopyName(pokeblock, gStringVar2);\n\n    if (gPokeblockGain == 0)\n        StringExpandPlaceholders(gStringVar4, gText_Var1AteTheVar2);\n    else if (gPokeblockGain > 0)\n        StringExpandPlaceholders(gStringVar4, gText_Var1HappilyAteVar2);\n    else\n        StringExpandPlaceholders(gStringVar4, gText_Var1DisdainfullyAteVar2);\n\n    gTextFlags.canABSpeedUpPrint = TRUE;\n    AddTextPrinterParameterized2(0, FONT_NORMAL, gStringVar4, GetPlayerTextSpeedDelay(), NULL, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY);\n    gTasks[taskId].func = Task_WaitForAtePokeblockMessage;",
  },
  "Task_ExitPokeblockFeed": {
    callsTo: ["DestroyTask","Free","FreeAllSpritePalettes","FreeAllWindowBuffers","FreeMonSpritesGfx","ResetSpriteData","SetMainCallback2","m4aMPlayVolumeControl"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 11,
    bodyC: "if (!gPaletteFade.active)\n    {\n        ResetSpriteData();\n        FreeAllSpritePalettes();\n        m4aMPlayVolumeControl(&gMPlayInfo_BGM, TRACKS_ALL, 0x100);\n        SetMainCallback2(gMain.savedCallback);\n        DestroyTask(taskId);\n        FreeAllWindowBuffers();\n        Free(sPokeblockFeed);\n        FreeMonSpritesGfx();\n    }",
  },
  "Task_FadeOutPokeblockFeed": {
    callsTo: ["BeginNormalPaletteFade"],
    taskTransitions: ["Task_ExitPokeblockFeed"],
    lineCount: 2,
    bodyC: "BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);\n    gTasks[taskId].func = Task_ExitPokeblockFeed;",
  },
} as const;

export const CB2S = {
  "CB2_PokeblockFeed": {
    callsTo: ["AnimateSprites","BuildOamBuffer","DoScheduledBgTilemapCopiesToVram","RunTasks","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 5,
    bodyC: "RunTasks();\n    AnimateSprites();\n    BuildOamBuffer();\n    DoScheduledBgTilemapCopiesToVram();\n    UpdatePaletteFade();",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_MonJumpForPokeblock": {
    callsTo: ["PlayCry_Normal"],
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 7,
    bodyC: "sprite->x += 4;\n    sprite->y += sprite->sSpeed;\n    sprite->sSpeed += sprite->sAccel;\n\n     \n    if (sprite->sSpeed == 0)\n        PlayCry_Normal(sprite->sSpecies, 0);\n\n    if (sprite->sSpeed == 9)\n        sprite->callback = SpriteCallbackDummy;",
  },
  "SpriteCB_ThrownPokeblock": {
    callsTo: ["DestroySprite"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 5,
    bodyC: "sprite->x -= 4;\n    sprite->y += sprite->sSpeed;\n    sprite->sSpeed += sprite->sAccel;\n    if (sprite->sSpeed == 10)\n        DestroySprite(sprite);",
  },
} as const;
