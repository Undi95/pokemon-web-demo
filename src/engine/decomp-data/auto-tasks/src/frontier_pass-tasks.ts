// AUTO-GENERATED from src/frontier_pass.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 3 Task_, 6 CB2_, 1 SpriteCB_

export const TASKS = {
  "Task_HandleFrontierPassInput": {
    callsTo: ["DestroyTask","GetCursorAreaFromCoords","JOY_HELD","JOY_NEW","PlaySE","PrintAreaDescription","SetMainCallback2","TryCallPassAreaFunction","UpdateAreaHighlight"],
    cb2Transitions: ["CB2_HideFrontierPass"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { joyButtons: ["HELD:DPAD_DOWN","HELD:DPAD_LEFT","HELD:DPAD_RIGHT","HELD:DPAD_UP","NEW:A_BUTTON","NEW:B_BUTTON"] },
    lineCount: 67,
    bodyC: "u8 var = FALSE;  \n\n    if (JOY_HELD(DPAD_UP) && sPassGfx->cursorSprite->y >= 9)\n    {\n        sPassGfx->cursorSprite->y -= 2;\n        if (sPassGfx->cursorSprite->y <= 7)\n            sPassGfx->cursorSprite->y = 2;\n        var = TRUE;\n    }\n    if (JOY_HELD(DPAD_DOWN) && sPassGfx->cursorSprite->y <= 135)\n    {\n        sPassGfx->cursorSprite->y += 2;\n        if (sPassGfx->cursorSprite->y >= 137)\n            sPassGfx->cursorSprite->y = 136;\n        var = TRUE;\n    }\n\n    if (JOY_HELD(DPAD_LEFT) && sPassGfx->cursorSprite->x >= 6)\n    {\n        sPassGfx->cursorSprite->x -= 2;\n        if (sPassGfx->cursorSprite->x <= 4)\n            sPassGfx->cursorSprite->x = 5;\n        var = TRUE;\n    }\n    if (JOY_HELD(DPAD_RIGHT) && sPassGfx->cursorSprite->x <= 231)\n    {\n        sPassGfx->cursorSprite->x += 2;\n        if (sPassGfx->cursorSprite->x >= 233)\n            sPassGfx->cursorSprite->x = 232;\n        var = TRUE;\n    }\n\n    if (!var)  \n    {\n        if (sPassData->cursorArea != CURSOR_AREA_NOTHING && JOY_NEW(A_BUTTON))\n        {\n            if (sPassData->cursorArea <= CURSOR_AREA_RECORD)  \n            {\n                PlaySE(SE_SELECT);\n                if (TryCallPassAreaFunction(taskId, sPassData->cursorArea))\n                    return;\n            }\n            else if (sPassData->cursorArea == CURSOR_AREA_CANCEL)\n            {\n                PlaySE(SE_PC_OFF);\n                SetMainCallback2(CB2_HideFrontierPass);\n                DestroyTask(taskId);\n                 \n                #ifdef BUGFIX\n                return;\n                #endif\n            }\n        }\n\n        if (JOY_NEW(B_BUTTON))\n        {\n            PlaySE(SE_PC_OFF);\n            SetMainCallback2(CB2_HideFrontierPass);\n            DestroyTask(taskId);\n        }\n    }\n    else\n    {\n        var = GetCursorAreaFromCoords(sPassGfx->cursorSprite->x - 5, sPassGfx->cursorSprite->y + 5);\n        if (sPassData->cursorArea != var)\n        {\n            PrintAreaDescription(var);\n            sPassData->previousCursorArea = sPassData->cursorArea;\n            sPassData->cursorArea = var;\n            UpdateAreaHighlight(sPassData->cursorArea, sPassData->previousCursorArea);\n        }\n    }",
  },
  "Task_PassAreaZoom": {
    callsTo: ["BeginNormalPaletteFade","BlendPalettes","DestroyTask","LoadCursorAndSymbolSprites","MathUtil_Inv16","Q_8_8","SetBgAttribute","SetGpuReg","SetMainCallback2","SetVBlankCallback","ShowBg","ShowHideZoomingArea","UpdatePaletteFade"],
    taskTransitions: ["Task_HandleFrontierPassInput"],
    cb2Transitions: ["CB2_ShowFrontierPassFeature"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 70,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    switch (sPassData->state)\n    {\n    case 0:\n         \n        if (!tZoomOut)\n        {\n             \n            ShowHideZoomingArea(TRUE, FALSE);\n            tScaleX = Q_8_8(1);\n            tScaleY = Q_8_8(1);\n            tScaleSpeedX = 0x15;\n            tScaleSpeedY = 0x15;\n            BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_WHITE);\n        }\n        else\n        {\n             \n            tScaleX = Q_8_8(1.984375);  \n            tScaleY = Q_8_8(1.984375);\n            tScaleSpeedX = -0x15;\n            tScaleSpeedY = -0x15;\n            SetGpuReg(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON | DISPCNT_OBJ_1D_MAP);\n            ShowBg(0);\n            ShowBg(1);\n            ShowBg(2);\n            LoadCursorAndSymbolSprites();\n            SetVBlankCallback(VBlankCB_FrontierPass);\n            BlendPalettes(PALETTES_ALL, 16, RGB_WHITE);\n            BeginNormalPaletteFade(PALETTES_ALL, 0, 16, 0, RGB_WHITE);\n        }\n        sPassGfx->zooming = TRUE;\n        sPassGfx->scaleX = MathUtil_Inv16(tScaleX);\n        sPassGfx->scaleY = MathUtil_Inv16(tScaleY);\n        break;\n    case 1:\n         \n        UpdatePaletteFade();\n        tScaleX += tScaleSpeedX;\n        tScaleY += tScaleSpeedY;\n        sPassGfx->scaleX = MathUtil_Inv16(tScaleX);\n        sPassGfx->scaleY = MathUtil_Inv16(tScaleY);\n\n         \n        if (!tZoomOut)\n        {\n            if (tScaleX <= Q_8_8(1.984375))\n                return;\n        }\n        else\n        {\n            if (tScaleX != Q_8_8(1))\n                return;\n        }\n        break;\n    case 2:\n        if (sPassGfx->zooming)\n            sPassGfx->zooming = FALSE;\n        if (UpdatePaletteFade())\n            return;\n\n        if (!tZoomOut)\n        {\n             \n            DestroyTask(taskId);\n            SetMainCallback2(CB2_ShowFrontierPassFeature);\n        }\n        else\n        {\n             \n            ShowHideZoomingArea(FALSE, FALSE);\n            sPassData->areaToShow = CURSOR_AREA_NOTHING;\n            gTasks[taskId].func = Task_HandleFrontierPassInput;\n        }\n        SetBgAttribute(2, BG_ATTR_WRAPAROUND, 0);\n        sPassData->state = 0;\n        return;\n    }\n\n    sPassData->state++;",
  },
  "Task_HandleFrontierMap": {
    callsTo: ["DestroyTask","ExitFrontierMap","FreeFrontierMap","HandleFrontierMapCursorMove","InitFrontierMap","JOY_NEW","PlaySE"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { joyButtons: ["NEW:B_BUTTON","NEW:DPAD_DOWN","NEW:DPAD_UP"] },
    lineCount: 64,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n    case 0:\n        if (InitFrontierMap())\n            break;\n        return;\n    case 1:\n        if (JOY_NEW(B_BUTTON))\n        {\n            PlaySE(SE_PC_OFF);\n            tState = 4;\n        }\n        else if (JOY_NEW(DPAD_DOWN))\n        {\n            if (sMapData->cursorPos >= NUM_FRONTIER_FACILITIES - 1)\n                HandleFrontierMapCursorMove(0);\n            else\n                tState = 2;\n        }\n        else if (JOY_NEW(DPAD_UP))\n        {\n            if (sMapData->cursorPos == 0)\n                HandleFrontierMapCursorMove(1);\n            else\n                tState = 3;\n        }\n        return;\n    case 2:\n        if (tMoveSteps > 3)\n        {\n            HandleFrontierMapCursorMove(0);\n            tMoveSteps = 0;\n            tState = 1;\n        }\n        else\n        {\n            sMapData->cursorSprite->y += 4;\n            tMoveSteps++;\n        }\n        return;\n    case 3:\n        if (tMoveSteps > 3)\n        {\n            HandleFrontierMapCursorMove(1);\n            tMoveSteps = 0;\n            tState = 1;\n        }\n        else\n        {\n            sMapData->cursorSprite->y -= 4;\n            tMoveSteps++;\n        }\n        return;\n    case 4:\n        if (ExitFrontierMap())\n            break;\n        return;\n    case 5:\n        DestroyTask(taskId);\n        FreeFrontierMap();\n        return;\n    }\n\n    tState++;",
  },
} as const;

export const CB2S = {
  "CB2_FrontierPass": {
    callsTo: ["AnimateSprites","BuildOamBuffer","RunTasks"],
    externalChecks: { waitForVBlank: true },
    lineCount: 3,
    bodyC: "RunTasks();\n    AnimateSprites();\n    BuildOamBuffer();",
  },
  "CB2_InitFrontierPass": {
    callsTo: ["CreateTask","InitFrontierPass","SetMainCallback2"],
    cb2Transitions: ["CB2_FrontierPass"],
    lineCount: 5,
    bodyC: "if (InitFrontierPass())\n    {\n        CreateTask(Task_HandleFrontierPassInput, 0);\n        SetMainCallback2(CB2_FrontierPass);\n    }",
  },
  "CB2_HideFrontierPass": {
    callsTo: ["HideFrontierPass","LeaveFrontierPass"],
    lineCount: 2,
    bodyC: "if (HideFrontierPass())\n        LeaveFrontierPass();",
  },
  "CB2_ReshowFrontierPass": {
    callsTo: ["CreateTask","InitFrontierPass","SetMainCallback2"],
    cb2Transitions: ["CB2_FrontierPass"],
    lineCount: 17,
    bodyC: "u8 taskId;\n\n    if (!InitFrontierPass())\n        return;\n\n    switch (sPassData->areaToShow)\n    {\n    case CURSOR_AREA_MAP:\n    case CURSOR_AREA_CARD:\n        taskId = CreateTask(Task_PassAreaZoom, 0);\n        gTasks[taskId].tZoomOut = TRUE;\n        break;\n    case CURSOR_AREA_RECORD:\n    default:\n        sPassData->areaToShow = CURSOR_AREA_NOTHING;\n        taskId = CreateTask(Task_HandleFrontierPassInput, 0);\n        break;\n    }\n\n    SetMainCallback2(CB2_FrontierPass);",
  },
  "CB2_ReturnFromRecord": {
    callsTo: ["AllocateFrontierPassData","CurrentBattlePyramidLocation","Overworld_PlaySpecialMapMusic","PlayBGM","SetMainCallback2","memset"],
    cb2Transitions: ["CB2_ReshowFrontierPass"],
    lineCount: 17,
    bodyC: "AllocateFrontierPassData(sSavedPassData.callback);\n    sPassData->cursorX = sSavedPassData.cursorX;\n    sPassData->cursorY = sSavedPassData.cursorY;\n    memset(&sSavedPassData, 0, sizeof(sSavedPassData));\n    switch (CurrentBattlePyramidLocation())\n    {\n    case PYRAMID_LOCATION_FLOOR:\n        PlayBGM(MUS_B_PYRAMID);\n        break;\n    case PYRAMID_LOCATION_TOP:\n        PlayBGM(MUS_B_PYRAMID_TOP);\n        break;\n    default:\n        Overworld_PlaySpecialMapMusic();\n        break;\n    }\n\n    SetMainCallback2(CB2_ReshowFrontierPass);",
  },
  "CB2_ShowFrontierPassFeature": {
    callsTo: ["FreeFrontierPassData","HideFrontierPass","PlayRecordedBattle","ShowFrontierMap","ShowPlayerTrainerCard"],
    lineCount: 18,
    bodyC: "if (!HideFrontierPass())\n        return;\n\n    switch (sPassData->areaToShow)\n    {\n    case CURSOR_AREA_MAP:\n        ShowFrontierMap(CB2_ReshowFrontierPass);\n        break;\n    case CURSOR_AREA_RECORD:\n        sSavedPassData.callback = sPassData->callback;\n        sSavedPassData.cursorX = sPassData->cursorX;\n        sSavedPassData.cursorY = sPassData->cursorY;\n        FreeFrontierPassData();\n        PlayRecordedBattle(CB2_ReturnFromRecord);\n        break;\n    case CURSOR_AREA_CARD:\n        ShowPlayerTrainerCard(CB2_ReshowFrontierPass);\n        break;\n    }",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_PlayerHead": {
    lineCount: 0,
    bodyC: "",
  },
} as const;
