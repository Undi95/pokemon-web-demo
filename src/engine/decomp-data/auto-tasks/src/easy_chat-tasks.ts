// AUTO-GENERATED from src/easy_chat.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 2 Task_, 2 CB2_, 2 SpriteCB_

export const TASKS = {
  "Task_InitEasyChatScreen": {
    callsTo: ["InitEasyChatScreen","IsOverworldLinkActive","StartEasyChatScreen"],
    lineCount: 10,
    bodyC: "if (!IsOverworldLinkActive())\n    {\n        while (InitEasyChatScreen(taskId));\n    }\n    else\n    {\n        if (InitEasyChatScreen(taskId) == TRUE)\n            return;\n    }\n    StartEasyChatScreen(taskId, Task_EasyChatScreen);",
  },
  "Task_EasyChatScreen": {
    callsTo: ["BeginNormalPaletteFade","BlendPalettes","EnterQuizLadyScreen","ExitEasyChatScreen","GetWordTaskArg","HandleEasyChatInput","IsFuncIdForQuizLadyScreen","PlaySE","RunEasyChatFunction","SetVBlankCallback","StartEasyChatFunction"],
    externalChecks: { paletteFade: true },
    lineCount: 48,
    bodyC: "u16 funcId;\n    s16 *data;\n\n    data = gTasks[taskId].data;\n    switch (tState)\n    {\n    case MAINSTATE_FADE_IN:\n        SetVBlankCallback(VBlankCB_EasyChatScreen);\n        BlendPalettes(PALETTES_ALL, 16, 0);\n        BeginNormalPaletteFade(PALETTES_ALL, -1, 16, 0, RGB_BLACK);\n        tState = MAINSTATE_WAIT_FADE_IN;\n        break;\n    case MAINSTATE_HANDLE_INPUT:\n        funcId = HandleEasyChatInput();\n        if (IsFuncIdForQuizLadyScreen(funcId))\n        {\n             \n            BeginNormalPaletteFade(PALETTES_ALL, -2, 0, 16, RGB_BLACK);\n            tState = MAINSTATE_TO_QUIZ_LADY;\n            tFuncId = funcId;\n        }\n        else if (funcId == ECFUNC_EXIT)\n        {\n             \n            BeginNormalPaletteFade(PALETTES_ALL, -1, 0, 16, RGB_BLACK);\n            tState = MAINSTATE_EXIT;\n        }\n        else if (funcId != ECFUNC_NONE)\n        {\n            PlaySE(SE_SELECT);\n            StartEasyChatFunction(funcId);\n            tState++;  \n        }\n        break;\n    case MAINSTATE_RUN_FUNC:\n        if (!RunEasyChatFunction())\n            tState = MAINSTATE_HANDLE_INPUT;\n        break;\n    case MAINSTATE_TO_QUIZ_LADY:\n        if (!gPaletteFade.active)\n            EnterQuizLadyScreen(tFuncId);\n        break;\n    case MAINSTATE_EXIT:\n        if (!gPaletteFade.active)\n            ExitEasyChatScreen((MainCallback)GetWordTaskArg(taskId, TASKIDX_EXIT_CALLBACK));\n        break;\n    case MAINSTATE_WAIT_FADE_IN:\n        if (!gPaletteFade.active)\n            tState = MAINSTATE_HANDLE_INPUT;\n        break;\n    }",
  },
} as const;

export const CB2S = {
  "CB2_EasyChatScreen": {
    callsTo: ["AnimateSprites","BuildOamBuffer","RunTasks","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 4,
    bodyC: "RunTasks();\n    AnimateSprites();\n    BuildOamBuffer();\n    UpdatePaletteFade();",
  },
  "CB2_QuizLadyQuestion": {
    callsTo: ["CleanupOverworldWindowsAndTilemaps","DoQuizQuestionEasyChatScreen","FadeScreen","UpdatePaletteFade"],
    externalChecks: { paletteFade: true },
    lineCount: 18,
    bodyC: "LilycoveLady *lilycoveLady;\n\n    UpdatePaletteFade();\n    switch (gMain.state)\n    {\n    case 0:\n        FadeScreen(FADE_TO_BLACK, 0);\n        break;\n    case 1:\n        if (!gPaletteFade.active)\n        {\n            lilycoveLady = &gSaveBlock1Ptr->lilycoveLady;\n            lilycoveLady->quiz.playerAnswer = EC_EMPTY_WORD;\n            CleanupOverworldWindowsAndTilemaps();\n            DoQuizQuestionEasyChatScreen();\n        }\n        return;\n    }\n    gMain.state ++;",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_Cursor": {
    lineCount: 9,
    bodyC: "if (sprite->sAnimateCursor)\n    {\n        if (++sprite->sDelayTimer > 2)\n        {\n            sprite->sDelayTimer = 0;\n            if (++sprite->x2 > 0)\n                sprite->x2 = -6;\n        }\n    }",
  },
  "SpriteCB_WordSelectCursor": {
    lineCount: 6,
    bodyC: "if (++sprite->sDelayTimer > 2)\n    {\n        sprite->sDelayTimer = 0;\n        if (++sprite->x2 > 0)\n            sprite->x2 = -6;\n    }",
  },
} as const;
