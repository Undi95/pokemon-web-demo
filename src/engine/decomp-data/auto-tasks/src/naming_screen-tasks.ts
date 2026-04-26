// AUTO-GENERATED from src/naming_screen.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 4 Task_, 2 CB2_, 4 SpriteCB_

export const TASKS = {
  "Task_NamingScreen": {
    callsTo: ["MainState_Exit","MainState_FadeIn","MainState_FadeOut","MainState_HandleInput","MainState_MoveToOKButton","MainState_PressedOKButton","MainState_StartPageSwap","MainState_WaitFadeIn","MainState_WaitPageSwap","MainState_WaitSentToPCMessage","SetSpritesVisible","SetVBlank"],
    lineCount: 36,
    bodyC: "switch (sNamingScreen->state)\n    {\n    case STATE_FADE_IN:\n        MainState_FadeIn();\n        SetSpritesVisible();\n        SetVBlank();\n        break;\n    case STATE_WAIT_FADE_IN:\n        MainState_WaitFadeIn();\n        break;\n    case STATE_HANDLE_INPUT:\n        MainState_HandleInput();\n        break;\n    case STATE_MOVE_TO_OK_BUTTON:\n        MainState_MoveToOKButton();\n        MainState_HandleInput();\n        break;\n    case STATE_START_PAGE_SWAP:\n        MainState_StartPageSwap();\n        break;\n    case STATE_WAIT_PAGE_SWAP:\n        MainState_WaitPageSwap();\n        break;\n    case STATE_PRESSED_OK:\n        MainState_PressedOKButton();\n        break;\n    case STATE_WAIT_SENT_TO_PC_MESSAGE:\n        MainState_WaitSentToPCMessage();\n        break;\n    case STATE_FADE_OUT:\n        MainState_FadeOut();\n        break;\n    case STATE_EXIT:\n        MainState_Exit();\n        break;\n    }",
  },
  "Task_HandlePageSwapAnim": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sPageSwapAnimStateFuncs[gTasks[taskId].tState](&gTasks[taskId]) != 0);",
  },
  "Task_UpdateButtonFlash": {
    callsTo: ["GetButtonPalOffset","MultiplyInvertedPaletteRGBComponents"],
    lineCount: 35,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    if (task->tButtonId == BUTTON_COUNT || !task->tAllowFlash)\n        return;\n\n    MultiplyInvertedPaletteRGBComponents(GetButtonPalOffset(task->tButtonId), task->tColor, task->tColor, task->tColor);\n\n    if (task->tColorDelay && --task->tColorDelay)\n        return;\n\n    task->tColorDelay = 2;\n    if (task->tColorIncr >= 0)\n    {\n        if (task->tColor < 14)\n        {\n            task->tColor += task->tColorIncr;\n            task->tColorDelta += task->tColorIncr;\n        }\n        else\n        {\n            task->tColor = 16;\n            task->tColorDelta++;\n        }\n    }\n    else\n    {\n        task->tColor += task->tColorIncr;\n        task->tColorDelta += task->tColorIncr;\n    }\n\n    if (task->tColor == 16 && task->tColorDelta == 22)\n    {\n        task->tColorIncr = -4;\n    }\n    else if (task->tColor == 0)\n    {\n        task->tAllowFlash = task->tKeepFlashing;\n        task->tColorIncr = 2;\n        task->tColorDelta = 0;\n    }",
  },
  "Task_HandleInput": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "sInputFuncs[gTasks[taskId].tState](&gTasks[taskId]);",
  },
} as const;

export const CB2S = {
  "CB2_LoadNamingScreen": {
    callsTo: ["CreateHelperTasks","CreateNamingScreenTask","CreateSprites","FreeAllSpritePalettes","LoadGfx","LoadPalettes","NamingScreen_Init","NamingScreen_InitBGs","NamingScreen_ShowBgs","ResetPaletteFade","ResetSpriteData","ResetTasks","ResetVHBlank","UpdatePaletteFade"],
    lineCount: 43,
    bodyC: "switch (gMain.state)\n    {\n    case 0:\n        ResetVHBlank();\n        NamingScreen_Init();\n        gMain.state++;\n        break;\n    case 1:\n        NamingScreen_InitBGs();\n        gMain.state++;\n        break;\n    case 2:\n        ResetPaletteFade();\n        gMain.state++;\n        break;\n    case 3:\n        ResetSpriteData();\n        FreeAllSpritePalettes();\n        gMain.state++;\n        break;\n    case 4:\n        ResetTasks();\n        gMain.state++;\n        break;\n    case 5:\n        LoadPalettes();\n        gMain.state++;\n        break;\n    case 6:\n        LoadGfx();\n        gMain.state++;\n        break;\n    case 7:\n        CreateSprites();\n        UpdatePaletteFade();\n        NamingScreen_ShowBgs();\n        gMain.state++;\n        break;\n    default:\n        CreateHelperTasks();\n        CreateNamingScreenTask();\n        break;\n    }",
  },
  "CB2_NamingScreen": {
    callsTo: ["AnimateSprites","BuildOamBuffer","RunTasks","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 4,
    bodyC: "RunTasks();\n    AnimateSprites();\n    BuildOamBuffer();\n    UpdatePaletteFade();",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_Cursor": {
    callsTo: ["GetCurrentPageColumnCount","IndexOfSpritePaletteTag","MultiplyInvertedPaletteRGBComponents","OBJ_PLTT_ID","StartSpriteAnim"],
    lineCount: 29,
    bodyC: "if (sprite->animEnded)\n        StartSpriteAnim(sprite, 0);\n\n     \n    sprite->invisible = sprite->sInvisible;\n    if (sprite->sX == GetCurrentPageColumnCount())\n        sprite->invisible = TRUE;\n\n    if (sprite->invisible\n       || !(sprite->sFlashing)\n       || sprite->sX != sprite->sPrevX\n       || sprite->sY != sprite->sPrevY)\n    {\n        sprite->sColor = 0;\n        sprite->sColorIncr = 2;\n        sprite->sColorDelay = 2;\n    }\n\n    sprite->sColorDelay--;\n    if (sprite->sColorDelay == 0)\n    {\n        sprite->sColor += sprite->sColorIncr;\n        if (sprite->sColor == 16 || sprite->sColor == 0)\n            sprite->sColorIncr = -sprite->sColorIncr;\n        sprite->sColorDelay = 2;\n    }\n\n    if (sprite->sFlashing)\n    {\n        s8 gb = sprite->sColor;\n        s8 r = sprite->sColor >> 1;\n        u16 index = OBJ_PLTT_ID(IndexOfSpritePaletteTag(PALTAG_CURSOR)) + 1;\n\n        MultiplyInvertedPaletteRGBComponents(index, r, gb, gb);\n    }",
  },
  "SpriteCB_InputArrow": {
    callsTo: ["ARRAY_COUNT","MOD"],
    lineCount: 7,
    bodyC: "const s16 x[] = {0, -4, -2, -1};\n\n    if (sprite->sDelay == 0 || --sprite->sDelay == 0)\n    {\n        sprite->sDelay = 8;\n        sprite->sXPosId = MOD(sprite->sXPosId + 1, ARRAY_COUNT(x));\n    }\n    sprite->x2 = x[sprite->sXPosId];",
  },
  "SpriteCB_Underscore": {
    callsTo: ["ARRAY_COUNT","GetTextEntryPosition","MOD"],
    lineCount: 19,
    bodyC: "const s16 y[] = {2, 3, 2, 1};\n    u8 pos;\n\n    pos = GetTextEntryPosition();\n    if (pos != (u8)sprite->sId)\n    {\n        sprite->y2 = 0;\n        sprite->sYPosId = 0;\n        sprite->sDelay = 0;\n    }\n    else\n    {\n        sprite->y2 = y[sprite->sYPosId];\n        sprite->sDelay++;\n        if (sprite->sDelay > 8)\n        {\n            sprite->sYPosId = MOD(sprite->sYPosId + 1, ARRAY_COUNT(y));\n            sprite->sDelay = 0;\n        }\n    }",
  },
  "SpriteCB_PageSwap": {
    lineCount: 1,
    bodyC: "while (sPageSwapSpriteFuncs[sprite->sState](sprite));",
  },
} as const;
