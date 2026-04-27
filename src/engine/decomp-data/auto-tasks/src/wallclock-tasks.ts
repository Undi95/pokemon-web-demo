// AUTO-GENERATED from src/wallclock.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 10 Task_, 3 CB2_, 4 SpriteCB_

export const TASKS = {
  "Task_SetClock_WaitFadeIn": {
    taskTransitions: ["Task_SetClock_HandleInput"],
    externalChecks: { paletteFade: true },
    lineCount: 4,
    bodyC: "if (!gPaletteFade.active)\n    {\n        gTasks[taskId].func = Task_SetClock_HandleInput;\n    }",
  },
  "Task_SetClock_HandleInput": {
    callsTo: ["AdvanceClock","CalcNewMinHandAngle","JOY_HELD","JOY_NEW"],
    taskTransitions: ["Task_SetClock_AskConfirm"],
    dataReads: ["tHours","tMinuteHandAngle","tMinutes","tMoveDir","tMoveSpeed"],
    dataWrites: ["tHourHandAngle","tMinuteHandAngle","tMoveDir","tMoveSpeed"],
    externalChecks: { joyButtons: ["HELD:DPAD_LEFT","HELD:DPAD_RIGHT","NEW:A_BUTTON"] },
    lineCount: 32,
    bodyC: "if (gTasks[taskId].tMinuteHandAngle % 6)\n    {\n        gTasks[taskId].tMinuteHandAngle = CalcNewMinHandAngle(gTasks[taskId].tMinuteHandAngle, gTasks[taskId].tMoveDir, gTasks[taskId].tMoveSpeed);\n    }\n    else\n    {\n        gTasks[taskId].tMinuteHandAngle = gTasks[taskId].tMinutes * 6;\n        gTasks[taskId].tHourHandAngle = (gTasks[taskId].tHours % 12) * 30 + (gTasks[taskId].tMinutes / 10) * 5;\n        if (JOY_NEW(A_BUTTON))\n        {\n            gTasks[taskId].func = Task_SetClock_AskConfirm;\n        }\n        else\n        {\n            gTasks[taskId].tMoveDir = MOVE_NONE;\n\n            if (JOY_HELD(DPAD_LEFT))\n                gTasks[taskId].tMoveDir = MOVE_BACKWARD;\n\n            if (JOY_HELD(DPAD_RIGHT))\n                gTasks[taskId].tMoveDir = MOVE_FORWARD;\n\n            if (gTasks[taskId].tMoveDir != MOVE_NONE)\n            {\n                if (gTasks[taskId].tMoveSpeed < 0xFF)\n                    gTasks[taskId].tMoveSpeed++;\n\n                gTasks[taskId].tMinuteHandAngle = CalcNewMinHandAngle(gTasks[taskId].tMinuteHandAngle, gTasks[taskId].tMoveDir, gTasks[taskId].tMoveSpeed);\n                AdvanceClock(taskId, gTasks[taskId].tMoveDir);\n            }\n            else\n            {\n                gTasks[taskId].tMoveSpeed = 0;\n            }\n        }\n    }",
  },
  "Task_SetClock_AskConfirm": {
    callsTo: ["AddTextPrinterParameterized","CreateYesNoMenu","DrawStdFrameWithCustomTileAndPalette","PutWindowTilemap","ScheduleBgCopyTilemapToVram"],
    taskTransitions: ["Task_SetClock_HandleConfirmInput"],
    lineCount: 6,
    bodyC: "DrawStdFrameWithCustomTileAndPalette(WIN_MSG, FALSE, 0x250, 0x0d);\n    AddTextPrinterParameterized(WIN_MSG, FONT_NORMAL, gText_IsThisTheCorrectTime, 0, 1, 0, NULL);\n    PutWindowTilemap(WIN_MSG);\n    ScheduleBgCopyTilemapToVram(0);\n    CreateYesNoMenu(&sWindowTemplate_ConfirmYesNo, 0x250, 0x0d, 1);\n    gTasks[taskId].func = Task_SetClock_HandleConfirmInput;",
  },
  "Task_SetClock_HandleConfirmInput": {
    callsTo: ["ClearStdWindowAndFrameToTransparent","ClearWindowTilemap","Menu_ProcessInputNoWrapClearOnChoose","PlaySE"],
    taskTransitions: ["Task_SetClock_Confirmed","Task_SetClock_HandleInput"],
    lineCount: 14,
    bodyC: "switch (Menu_ProcessInputNoWrapClearOnChoose())\n    {\n    case 0:  \n        PlaySE(SE_SELECT);\n        gTasks[taskId].func = Task_SetClock_Confirmed;\n        break;\n    case 1:  \n    case MENU_B_PRESSED:\n        PlaySE(SE_SELECT);\n        ClearStdWindowAndFrameToTransparent(WIN_MSG, FALSE);\n        ClearWindowTilemap(WIN_MSG);\n        gTasks[taskId].func = Task_SetClock_HandleInput;\n        break;\n    }",
  },
  "Task_SetClock_Confirmed": {
    callsTo: ["BeginNormalPaletteFade","RtcInitLocalTimeOffset"],
    taskTransitions: ["Task_SetClock_Exit"],
    dataReads: ["tHours","tMinutes"],
    lineCount: 3,
    bodyC: "RtcInitLocalTimeOffset(gTasks[taskId].tHours, gTasks[taskId].tMinutes);\n    BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);\n    gTasks[taskId].func = Task_SetClock_Exit;",
  },
  "Task_SetClock_Exit": {
    callsTo: ["FreeAllWindowBuffers","SetMainCallback2"],
    externalChecks: { paletteFade: true },
    lineCount: 5,
    bodyC: "if (!gPaletteFade.active)\n    {\n        FreeAllWindowBuffers();\n        SetMainCallback2(gMain.savedCallback);\n    }",
  },
  "Task_ViewClock_WaitFadeIn": {
    taskTransitions: ["Task_ViewClock_HandleInput"],
    externalChecks: { paletteFade: true },
    lineCount: 2,
    bodyC: "if (!gPaletteFade.active)\n        gTasks[taskId].func = Task_ViewClock_HandleInput;",
  },
  "Task_ViewClock_HandleInput": {
    callsTo: ["InitClockWithRtc","JOY_NEW"],
    taskTransitions: ["Task_ViewClock_FadeOut"],
    lineCount: 3,
    bodyC: "InitClockWithRtc(taskId);\n    if (JOY_NEW(A_BUTTON | B_BUTTON))\n        gTasks[taskId].func = Task_ViewClock_FadeOut;",
  },
  "Task_ViewClock_FadeOut": {
    callsTo: ["BeginNormalPaletteFade"],
    taskTransitions: ["Task_ViewClock_Exit"],
    lineCount: 2,
    bodyC: "BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);\n    gTasks[taskId].func = Task_ViewClock_Exit;",
  },
  "Task_ViewClock_Exit": {
    callsTo: ["SetMainCallback2"],
    externalChecks: { paletteFade: true },
    lineCount: 2,
    bodyC: "if (!gPaletteFade.active)\n        SetMainCallback2(gMain.savedCallback);",
  },
} as const;

export const CB2S = {
  "CB2_StartWallClock": {
    callsTo: ["AddTextPrinterParameterized","BG_SCREEN_ADDR","CreateSprite","CreateTask","LZ77UnCompVram","LoadWallClockGraphics","PutWindowTilemap","ScheduleBgCopyTilemapToVram","WallClockInit"],
    lineCount: 30,
    bodyC: "u8 taskId;\n    u8 spriteId;\n\n    LoadWallClockGraphics();\n    LZ77UnCompVram(gWallClockStart_Tilemap, (u16 *)BG_SCREEN_ADDR(7));\n\n    taskId = CreateTask(Task_SetClock_WaitFadeIn, 0);\n    gTasks[taskId].tHours = 10;\n    gTasks[taskId].tMinutes = 0;\n    gTasks[taskId].tMoveDir = 0;\n    gTasks[taskId].tPeriod = 0;\n    gTasks[taskId].tMoveSpeed = 0;\n    gTasks[taskId].tMinuteHandAngle = 0;\n    gTasks[taskId].tHourHandAngle = 300;\n\n    spriteId = CreateSprite(&sSpriteTemplate_MinuteHand, 120, 80, 1);\n    gSprites[spriteId].sTaskId = taskId;\n    gSprites[spriteId].oam.affineMode = ST_OAM_AFFINE_NORMAL;\n    gSprites[spriteId].oam.matrixNum = 0;\n\n    spriteId = CreateSprite(&sSpriteTemplate_HourHand, 120, 80, 0);\n    gSprites[spriteId].sTaskId = taskId;\n    gSprites[spriteId].oam.affineMode = ST_OAM_AFFINE_NORMAL;\n    gSprites[spriteId].oam.matrixNum = 1;\n\n    spriteId = CreateSprite(&sSpriteTemplate_PM, 120, 80, 2);\n    gSprites[spriteId].sTaskId = taskId;\n    gSprites[spriteId].data[1] = 45;\n\n    spriteId = CreateSprite(&sSpriteTemplate_AM, 120, 80, 2);\n    gSprites[spriteId].sTaskId = taskId;\n    gSprites[spriteId].data[1] = 90;\n\n    WallClockInit();\n\n    AddTextPrinterParameterized(WIN_BUTTON_LABEL, FONT_NORMAL, gText_Confirm3, 0, 1, 0, NULL);\n    PutWindowTilemap(WIN_BUTTON_LABEL);\n    ScheduleBgCopyTilemapToVram(2);",
  },
  "CB2_ViewWallClock": {
    callsTo: ["AddTextPrinterParameterized","BG_SCREEN_ADDR","CreateSprite","CreateTask","InitClockWithRtc","LZ77UnCompVram","LoadWallClockGraphics","PutWindowTilemap","ScheduleBgCopyTilemapToVram","WallClockInit"],
    lineCount: 36,
    bodyC: "u8 taskId;\n    u8 spriteId;\n    u8 angle1;\n    u8 angle2;\n\n    LoadWallClockGraphics();\n    LZ77UnCompVram(gWallClockView_Tilemap, (u16 *)BG_SCREEN_ADDR(7));\n\n    taskId = CreateTask(Task_ViewClock_WaitFadeIn, 0);\n    InitClockWithRtc(taskId);\n    if (gTasks[taskId].tPeriod == PERIOD_AM)\n    {\n        angle1 = 45;\n        angle2 = 90;\n    }\n    else\n    {\n        angle1 = 90;\n        angle2 = 135;\n    }\n\n    spriteId = CreateSprite(&sSpriteTemplate_MinuteHand, 120, 80, 1);\n    gSprites[spriteId].sTaskId = taskId;\n    gSprites[spriteId].oam.affineMode = ST_OAM_AFFINE_NORMAL;\n    gSprites[spriteId].oam.matrixNum = 0;\n\n    spriteId = CreateSprite(&sSpriteTemplate_HourHand, 120, 80, 0);\n    gSprites[spriteId].sTaskId = taskId;\n    gSprites[spriteId].oam.affineMode = ST_OAM_AFFINE_NORMAL;\n    gSprites[spriteId].oam.matrixNum = 1;\n\n    spriteId = CreateSprite(&sSpriteTemplate_PM, 120, 80, 2);\n    gSprites[spriteId].sTaskId = taskId;\n    gSprites[spriteId].data[1] = angle1;\n\n    spriteId = CreateSprite(&sSpriteTemplate_AM, 120, 80, 2);\n    gSprites[spriteId].sTaskId = taskId;\n    gSprites[spriteId].data[1] = angle2;\n\n    WallClockInit();\n\n    AddTextPrinterParameterized(WIN_BUTTON_LABEL, FONT_NORMAL, gText_Cancel4, 0, 1, 0, NULL);\n    PutWindowTilemap(WIN_BUTTON_LABEL);\n    ScheduleBgCopyTilemapToVram(2);",
  },
  "CB2_WallClock": {
    callsTo: ["AnimateSprites","BuildOamBuffer","DoScheduledBgTilemapCopiesToVram","RunTasks","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 5,
    bodyC: "RunTasks();\n    AnimateSprites();\n    BuildOamBuffer();\n    DoScheduledBgTilemapCopiesToVram();\n    UpdatePaletteFade();",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_MinuteHand": {
    callsTo: ["Cos2","SetOamMatrix","Sin2"],
    lineCount: 13,
    bodyC: "u16 angle = gTasks[sprite->sTaskId].tMinuteHandAngle;\n    s16 sin = Sin2(angle) / 16;\n    s16 cos = Cos2(angle) / 16;\n    u16 x, y;\n\n    SetOamMatrix(0, cos, sin, -sin, cos);\n    x = sClockHandCoords[angle][0];\n    y = sClockHandCoords[angle][1];\n\n    if (x > 128)\n        x |= 0xff00;\n    if (y > 128)\n        y |= 0xff00;\n\n    sprite->x2 = x;\n    sprite->y2 = y;",
  },
  "SpriteCB_HourHand": {
    callsTo: ["Cos2","SetOamMatrix","Sin2"],
    lineCount: 13,
    bodyC: "u16 angle = gTasks[sprite->sTaskId].tHourHandAngle;\n    s16 sin = Sin2(angle) / 16;\n    s16 cos = Cos2(angle) / 16;\n    u16 x, y;\n\n    SetOamMatrix(1, cos, sin, -sin, cos);\n    x = sClockHandCoords[angle][0];\n    y = sClockHandCoords[angle][1];\n\n    if (x > 128)\n        x |= 0xff00;\n    if (y > 128)\n        y |= 0xff00;\n\n    sprite->x2 = x;\n    sprite->y2 = y;",
  },
  "SpriteCB_PMIndicator": {
    callsTo: ["Cos2","Sin2"],
    lineCount: 16,
    bodyC: "if (gTasks[sprite->sTaskId].tPeriod != PERIOD_AM)\n    {\n        if (sprite->sAngle >= 60 && sprite->sAngle < 90)\n            sprite->sAngle += 5;\n        if (sprite->sAngle < 60)\n            sprite->sAngle++;\n    }\n    else\n    {\n        if (sprite->sAngle >= 46 && sprite->sAngle < 76)\n            sprite->sAngle -= 5;\n        if (sprite->sAngle > 75)\n            sprite->sAngle--;\n    }\n    sprite->x2 = Cos2(sprite->sAngle) * 30 / 0x1000;\n    sprite->y2 = Sin2(sprite->sAngle) * 30 / 0x1000;",
  },
  "SpriteCB_AMIndicator": {
    callsTo: ["Cos2","Sin2"],
    lineCount: 16,
    bodyC: "if (gTasks[sprite->sTaskId].tPeriod != PERIOD_AM)\n    {\n        if (sprite->sAngle >= 105 && sprite->sAngle < 135)\n            sprite->sAngle += 5;\n        if (sprite->sAngle < 105)\n            sprite->sAngle++;\n    }\n    else\n    {\n        if (sprite->sAngle >= 91 && sprite->sAngle < 121)\n            sprite->sAngle -= 5;\n        if (sprite->sAngle > 120)\n            sprite->sAngle--;\n    }\n    sprite->x2 = Cos2(sprite->sAngle) * 30 / 0x1000;\n    sprite->y2 = Sin2(sprite->sAngle) * 30 / 0x1000;",
  },
} as const;
