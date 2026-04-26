// AUTO-GENERATED from src/minigame_countdown.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 6 Task_, 0 CB2_, 2 SpriteCB_

export const TASKS = {
  "Task_StaticCountdown": {
    callsTo: ["DestroyTask"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 15,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n     \n    case STATE_START:\n        sStaticCountdownFuncs[tFuncSetId][FUNC_START](taskId);\n        tState = STATE_RUN;\n        break;\n    case STATE_RUN:\n        sStaticCountdownFuncs[tFuncSetId][FUNC_RUN](taskId);\n        break;\n    case STATE_END:\n        sStaticCountdownFuncs[tFuncSetId][FUNC_FREE](taskId);\n        DestroyTask(taskId);\n        break;\n    }",
  },
  "Task_StaticCountdown_Init": {
    callsTo: ["StartSpriteAnim","StaticCountdown_CreateSprites","tSpriteIds"],
    lineCount: 15,
    bodyC: "s16 *data = gTasks[taskId].data;\n    tSpriteTemplateId = 0;\n    tSpriteSheetId = 0;\n    tSpritePalId = 0;\n    tInterval = 60;\n    tPriority = 0;\n    tSubpriority = 0;\n    tNumSprites = 3;\n    tX = 120;\n    tY = 88;\n    StaticCountdown_CreateSprites(taskId, data);\n\n    StartSpriteAnim(&gSprites[tSpriteIds(1)], ANIM_START_MID);\n    gSprites[tSpriteIds(1)].x2 = -32;\n\n    StartSpriteAnim(&gSprites[tSpriteIds(2)], ANIM_START_RIGHT);\n    gSprites[tSpriteIds(2)].x2 = 32;",
  },
  "Task_StaticCountdown_Free": {
    callsTo: ["DestroySprite","FreeSpritePaletteByTag","FreeSpriteTilesByTag","tSpriteIds"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 6,
    bodyC: "u8 i = 0;\n    s16 *data = gTasks[taskId].data;\n\n    for (i = 0; i < tNumSprites; i++)\n        DestroySprite(&gSprites[tSpriteIds(i)]);\n    FreeSpriteTilesByTag(sSpriteSheet_321Start_Static[tSpriteSheetId].tag);\n    FreeSpritePaletteByTag(sSpritePalette_321Start_Static[tSpritePalId].tag);",
  },
  "Task_StaticCountdown_Start": {
    callsTo: ["PlaySE","tSpriteIds"],
    dataWrites: ["tState"],
    lineCount: 5,
    bodyC: "s16 *data = gTasks[taskId].data;\n    PlaySE(SE_BALL_BOUNCE_1);\n    gSprites[tSpriteIds(0)].callback = SpriteCB_StaticCountdown;\n    gSprites[tSpriteIds(0)].invisible = FALSE;\n    gTasks[taskId].tState = STATE_RUN;",
  },
  "Task_StaticCountdown_Run": {
    callsTo: ["GetMultiplayerId","Rfu_SendPacket","memset"],
    lineCount: 19,
    bodyC: "u16 packet[RFU_PACKET_SIZE];\n    s16 *data = gTasks[taskId].data;\n\n    if (gReceivedRemoteLinkPlayers)\n    {\n         \n        if (gRecvCmds[0][1] == LINKCMD_COUNTDOWN)\n            tTimer = gRecvCmds[0][2];\n\n        if (GetMultiplayerId() == 0)\n        {\n             \n             \n            tLinkTimer++;\n            memset(packet, 0, sizeof(packet));\n            packet[0] = LINKCMD_COUNTDOWN;\n            packet[1] = tLinkTimer;\n            Rfu_SendPacket(packet);\n        }\n    }\n    else\n    {\n         \n        tTimer++;\n    }",
  },
  "Task_MinigameCountdown": {
    callsTo: ["CreateNumberSprite","CreateStartSprite","DestroySprite","DestroyTask","FreeSpriteOamMatrix","FreeSpritePaletteByTag","FreeSpriteTilesByTag","InitStartGraphic","IsStartGraphicAnimRunning","Load321StartGfx","RunMinigameCountdownDigitsAnim"],
    terminalMarkers: ["DestroyTask","DestroySprite","FreeSpriteOamMatrix"],
    lineCount: 29,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n    case 0:\n        Load321StartGfx(tTilesTag, tPalTag);\n        tSpriteId1 = CreateNumberSprite(tTilesTag, tPalTag, tX, tY, tSubpriority);\n        CreateStartSprite(tTilesTag, tPalTag, tX, tY, tSubpriority, &tSpriteId2, &tSpriteId3);\n        tState++;\n        break;\n    case 1:\n        if (!RunMinigameCountdownDigitsAnim(tSpriteId1))\n        {\n            InitStartGraphic(tSpriteId1, tSpriteId2, tSpriteId3);\n            FreeSpriteOamMatrix(&gSprites[tSpriteId1]);\n            DestroySprite(&gSprites[tSpriteId1]);\n            tState++;\n        }\n        break;\n    case 2:\n        if (!IsStartGraphicAnimRunning(tSpriteId2))\n        {\n            DestroySprite(&gSprites[tSpriteId2]);\n            DestroySprite(&gSprites[tSpriteId3]);\n            FreeSpriteTilesByTag(tTilesTag);\n            FreeSpritePaletteByTag(tPalTag);\n            DestroyTask(taskId);\n        }\n        break;\n    }",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_StaticCountdown": {
    callsTo: ["PlaySE","StartSpriteAnim","tSpriteIds"],
    lineCount: 29,
    bodyC: "s16 *data = gTasks[sprite->sTaskId].data;\n\n    if (tTimer % tInterval != 0)\n        return;\n    if (tTimer == tPrevTime)\n        return;\n\n    tPrevTime = tTimer;\n    switch (sprite->sAnimNum)\n    {\n    case ANIM_THREE:\n        sprite->invisible = FALSE;\n    case ANIM_TWO:\n    case ANIM_ONE:\n         \n        PlaySE(SE_BALL_BOUNCE_1);\n        StartSpriteAnim(sprite, sprite->sAnimNum);\n        break;\n    case ANIM_START_LEFT:\n         \n        PlaySE(SE_PIN);\n        StartSpriteAnim(sprite, sprite->sAnimNum);\n        gSprites[tSpriteIds(1)].invisible = FALSE;\n        gSprites[tSpriteIds(2)].invisible = FALSE;\n        break;\n    case ANIM_START_LEFT + 1:  \n         \n        sprite->invisible = TRUE;\n        gSprites[tSpriteIds(1)].invisible = TRUE;\n        gSprites[tSpriteIds(2)].invisible = TRUE;\n        tState = STATE_END;\n        return;\n    }\n    sprite->sAnimNum++;",
  },
  "SpriteCB_Start": {
    callsTo: ["PlaySE"],
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 45,
    bodyC: "int y;\n    s16 *data = sprite->data;\n\n    switch (sState)\n    {\n    case 0:\n        sYSpeed = 64;\n        sY = sprite->y2 << 4;\n        sState++;\n    case 1:\n        sY += sYSpeed;\n        sYSpeed++;\n        sprite->y2 = sY >> 4;\n        if (sprite->y2 >= 0)\n        {\n            PlaySE(SE_BALL_BOUNCE_2);\n            sprite->y2 = 0;\n            sState++;\n        }\n        break;\n    case 2:\n        sTimer += 12;\n        if (sTimer >= 128)\n        {\n            PlaySE(SE_BALL_BOUNCE_2);\n            sTimer = 0;\n            sState++;\n        }\n        y = gSineTable[sTimer];\n        sprite->y2 = -(y >> 4);\n        break;\n    case 3:\n        sTimer += 16;\n        if (sTimer >= 128)\n        {\n            PlaySE(SE_BALL_BOUNCE_2);\n            sTimer = 0;\n            sState++;\n        }\n        sprite->y2 = -(gSineTable[sTimer] >> 5);\n        break;\n    case 4:\n        if (++sTimer > 40)\n            sprite->callback = SpriteCallbackDummy;\n        break;\n    }",
  },
} as const;
