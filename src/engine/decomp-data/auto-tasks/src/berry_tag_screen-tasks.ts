// AUTO-GENERATED from src/berry_tag_screen.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 3 Task_, 2 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_CloseBerryTagScreen": {
    callsTo: ["DestroyBerrySprite","DestroyFlavorCircleSprites","DestroyTask","Free","FreeAllWindowBuffers","SetMainCallback2"],
    cb2Transitions: ["CB2_ReturnToBagMenuPocket"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 9,
    bodyC: "if (!gPaletteFade.active)\n    {\n        DestroyBerrySprite();\n        DestroyFlavorCircleSprites();\n        Free(sBerryTag);\n        FreeAllWindowBuffers();\n        SetMainCallback2(CB2_ReturnToBagMenuPocket);\n        DestroyTask(taskId);\n    }",
  },
  "Task_HandleInput": {
    callsTo: ["JOY_NEW","JOY_REPEAT","PrepareToCloseBerryTagScreen","TryChangeDisplayedBerry"],
    externalChecks: { paletteFade: true, joyButtons: ["REPEAT:DPAD_ANY"] },
    lineCount: 10,
    bodyC: "if (!gPaletteFade.active)\n    {\n        u16 arrowKeys = JOY_REPEAT(DPAD_ANY);\n        if (arrowKeys == DPAD_UP)\n            TryChangeDisplayedBerry(taskId, -1);\n        else if (arrowKeys == DPAD_DOWN)\n            TryChangeDisplayedBerry(taskId, 1);\n        else if (JOY_NEW(A_BUTTON | B_BUTTON))\n            PrepareToCloseBerryTagScreen(taskId);\n    }",
  },
  "Task_DisplayAnotherBerry": {
    callsTo: ["ChangeBgY","CreateBerrySprite","DestroyBerrySprite","FillWindowPixelBuffer","PIXEL_FILL","PrintBerryDescription1","PrintBerryDescription2","PrintBerryFirmness","PrintBerryNumberAndName","PrintBerrySize","SetFlavorCirclesVisiblity"],
    taskTransitions: ["Task_HandleInput"],
    lineCount: 90,
    bodyC: "u16 i;\n    s16 y;\n    s16 *data = gTasks[taskId].data;\n    tBerryY += DISPLAY_SPEED;\n    tBerryY &= 0xFF;\n\n    if (tBgOp == BG_COORD_ADD)\n    {\n        switch (tBerryY)\n        {\n        case 3 * DISPLAY_SPEED:\n            FillWindowPixelBuffer(WIN_BERRY_NAME, PIXEL_FILL(0));\n            break;\n        case 4 * DISPLAY_SPEED:\n            PrintBerryNumberAndName();\n            break;\n        case 5 * DISPLAY_SPEED:\n            DestroyBerrySprite();\n            CreateBerrySprite();\n            break;\n        case 6 * DISPLAY_SPEED:\n            FillWindowPixelBuffer(WIN_SIZE_FIRM, PIXEL_FILL(0));\n            break;\n        case 7 * DISPLAY_SPEED:\n            PrintBerrySize();\n            break;\n        case 8 * DISPLAY_SPEED:\n            PrintBerryFirmness();\n            break;\n        case 9 * DISPLAY_SPEED:\n            SetFlavorCirclesVisiblity();\n            break;\n        case 10 * DISPLAY_SPEED:\n            FillWindowPixelBuffer(WIN_DESC, PIXEL_FILL(0));\n            break;\n        case 11 * DISPLAY_SPEED:\n            PrintBerryDescription1();\n            break;\n        case 12 * DISPLAY_SPEED:\n            PrintBerryDescription2();\n            break;\n        }\n    }\n    else  \n    {\n        switch (tBerryY)\n        {\n        case 3 * DISPLAY_SPEED:\n            FillWindowPixelBuffer(WIN_DESC, PIXEL_FILL(0));\n            break;\n        case 4 * DISPLAY_SPEED:\n            PrintBerryDescription2();\n            break;\n        case 5 * DISPLAY_SPEED:\n            PrintBerryDescription1();\n            break;\n        case 6 * DISPLAY_SPEED:\n            SetFlavorCirclesVisiblity();\n            break;\n        case 7 * DISPLAY_SPEED:\n            FillWindowPixelBuffer(WIN_SIZE_FIRM, PIXEL_FILL(0));\n            break;\n        case 8 * DISPLAY_SPEED:\n            PrintBerryFirmness();\n            break;\n        case 9 * DISPLAY_SPEED:\n            PrintBerrySize();\n            break;\n        case 10 * DISPLAY_SPEED:\n            DestroyBerrySprite();\n            CreateBerrySprite();\n            break;\n        case 11 * DISPLAY_SPEED:\n            FillWindowPixelBuffer(WIN_BERRY_NAME, PIXEL_FILL(0));\n            break;\n        case 12 * DISPLAY_SPEED:\n            PrintBerryNumberAndName();\n            break;\n        }\n    }\n\n    if (tBgOp == BG_COORD_ADD)\n        y = -tBerryY;\n    else\n        y = tBerryY;\n\n    gSprites[sBerryTag->berrySpriteId].y2 = y;\n    for (i = 0; i < FLAVOR_COUNT; i++)\n        gSprites[sBerryTag->flavorCircleIds[i]].y2 = y;\n\n    ChangeBgY(1, 0x1000, tBgOp);\n    ChangeBgY(2, 0x1000, tBgOp);\n\n    if (tBerryY == 0)\n        gTasks[taskId].func = Task_HandleInput;",
  },
} as const;

export const CB2S = {
  "CB2_BerryTagScreen": {
    callsTo: ["AnimateSprites","BuildOamBuffer","DoScheduledBgTilemapCopiesToVram","RunTasks","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 5,
    bodyC: "RunTasks();\n    AnimateSprites();\n    BuildOamBuffer();\n    DoScheduledBgTilemapCopiesToVram();\n    UpdatePaletteFade();",
  },
  "CB2_InitBerryTagScreen": {
    callsTo: ["InitBerryTagScreen","MenuHelpers_IsLinkActive","MenuHelpers_ShouldWaitForLinkRecv"],
    lineCount: 9,
    bodyC: "while (1)\n    {\n        if (MenuHelpers_ShouldWaitForLinkRecv() == TRUE)\n            break;\n        if (InitBerryTagScreen() == TRUE)\n            break;\n        if (MenuHelpers_IsLinkActive() == TRUE)\n            break;\n    }",
  },
} as const;
