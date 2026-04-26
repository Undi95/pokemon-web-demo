// AUTO-GENERATED from src/move_relearner.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 1 Task_, 3 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_WaitForFadeOut": {
    callsTo: ["DestroyTask","SetMainCallback2"],
    cb2Transitions: ["CB2_InitLearnMove"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 6,
    bodyC: "if (!gPaletteFade.active)\n    {\n        SetMainCallback2(CB2_InitLearnMove);\n        gFieldCallback = FieldCB_ContinueScriptHandleMusic;\n        DestroyTask(taskId);\n    }",
  },
} as const;

export const CB2S = {
  "CB2_InitLearnMove": {
    callsTo: ["AllocZeroed","ClearScheduledBgCopiesToVram","CreateLearnableMovesList","CreateUISprites","FreeAllSpritePalettes","InitMoveRelearnerBackgroundLayers","InitMoveRelearnerWindows","ListMenuInit","LoadSpritePalette","LoadSpriteSheet","ResetSpriteData","ResetTasks","SetBackdropFromColor","SetMainCallback2","SetVBlankCallback"],
    cb2Transitions: ["CB2_MoveRelearnerMain"],
    lineCount: 19,
    bodyC: "ResetSpriteData();\n    FreeAllSpritePalettes();\n    ResetTasks();\n    ClearScheduledBgCopiesToVram();\n    sMoveRelearnerStruct = AllocZeroed(sizeof(*sMoveRelearnerStruct));\n    sMoveRelearnerStruct->partyMon = gSpecialVar_0x8004;\n    SetVBlankCallback(VBlankCB_MoveRelearner);\n\n    InitMoveRelearnerBackgroundLayers();\n    InitMoveRelearnerWindows(FALSE);\n\n    sMoveRelearnerMenuState.listOffset = 0;\n    sMoveRelearnerMenuState.listRow = 0;\n    sMoveRelearnerMenuState.showContestInfo = FALSE;\n\n    CreateLearnableMovesList();\n\n    LoadSpriteSheet(&sMoveRelearnerSpriteSheet);\n    LoadSpritePalette(&sMoveRelearnerPalette);\n    CreateUISprites();\n\n    sMoveRelearnerStruct->moveListMenuTask = ListMenuInit(&gMultiuseListMenuTemplate, sMoveRelearnerMenuState.listOffset, sMoveRelearnerMenuState.listRow);\n    SetBackdropFromColor(RGB_BLACK);\n    SetMainCallback2(CB2_MoveRelearnerMain);",
  },
  "CB2_InitLearnMoveReturnFromSelectMove": {
    callsTo: ["AllocZeroed","ClearScheduledBgCopiesToVram","CreateLearnableMovesList","CreateUISprites","FreeAllSpritePalettes","InitMoveRelearnerBackgroundLayers","InitMoveRelearnerWindows","ListMenuInit","LoadSpritePalette","LoadSpriteSheet","ResetSpriteData","ResetTasks","SetBackdropFromColor","SetMainCallback2","SetVBlankCallback"],
    cb2Transitions: ["CB2_MoveRelearnerMain"],
    lineCount: 18,
    bodyC: "ResetSpriteData();\n    FreeAllSpritePalettes();\n    ResetTasks();\n    ClearScheduledBgCopiesToVram();\n    sMoveRelearnerStruct = AllocZeroed(sizeof(*sMoveRelearnerStruct));\n    sMoveRelearnerStruct->state = MENU_STATE_FADE_FROM_SUMMARY_SCREEN;\n    sMoveRelearnerStruct->partyMon = gSpecialVar_0x8004;\n    sMoveRelearnerStruct->moveSlot = gSpecialVar_0x8005;\n    SetVBlankCallback(VBlankCB_MoveRelearner);\n\n    InitMoveRelearnerBackgroundLayers();\n    InitMoveRelearnerWindows(sMoveRelearnerMenuState.showContestInfo);\n    CreateLearnableMovesList();\n\n    LoadSpriteSheet(&sMoveRelearnerSpriteSheet);\n    LoadSpritePalette(&sMoveRelearnerPalette);\n    CreateUISprites();\n\n    sMoveRelearnerStruct->moveListMenuTask = ListMenuInit(&gMultiuseListMenuTemplate, sMoveRelearnerMenuState.listOffset, sMoveRelearnerMenuState.listRow);\n    SetBackdropFromColor(RGB_BLACK);\n    SetMainCallback2(CB2_MoveRelearnerMain);",
  },
  "CB2_MoveRelearnerMain": {
    callsTo: ["AnimateSprites","BuildOamBuffer","DoMoveRelearnerMain","DoScheduledBgTilemapCopiesToVram","RunTasks","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 6,
    bodyC: "DoMoveRelearnerMain();\n    RunTasks();\n    AnimateSprites();\n    BuildOamBuffer();\n    DoScheduledBgTilemapCopiesToVram();\n    UpdatePaletteFade();",
  },
} as const;
