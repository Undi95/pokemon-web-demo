// AUTO-GENERATED from src/pokedex_area_screen.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 2 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_ShowPokedexAreaScreen": {
    callsTo: ["BeginNormalPaletteFade","CreateAreaMarkerSprites","CreateAreaUnknownSprites","CreateRegionMapPlayerIcon","DrawAreaGlow","FreeAllSpritePalettes","HideBg","LoadAreaUnknownGraphics","LoadPokedexAreaMapGfx","PokedexAreaMapChangeBgY","PokedexAreaScreen_UpdateRegionMapVariablesAndVideoRegs","ResetDrawAreaGlowState","ResetSpriteData","SetBgAttribute","SetGpuReg","SetGpuRegBits","ShowBg","ShowRegionMapForPokedexAreaScreen","StartAreaGlow","StringFill","TryShowPokedexAreaMap"],
    taskTransitions: ["Task_HandlePokedexAreaScreenInput"],
    dataReads: ["tState"],
    dataWrites: ["tState"],
    lineCount: 56,
    bodyC: "switch (gTasks[taskId].tState)\n    {\n    case 0:\n        ResetSpriteData();\n        FreeAllSpritePalettes();\n        HideBg(3);\n        HideBg(2);\n        HideBg(0);\n        break;\n    case 1:\n        SetBgAttribute(3, BG_ATTR_CHARBASEINDEX, 3);\n        LoadPokedexAreaMapGfx(&sPokedexAreaMapTemplate);\n        StringFill(sPokedexAreaScreen->charBuffer, CHAR_SPACE, 16);\n        break;\n    case 2:\n        if (TryShowPokedexAreaMap() == TRUE)\n            return;\n        PokedexAreaMapChangeBgY(-8);\n        break;\n    case 3:\n        ResetDrawAreaGlowState();\n        break;\n    case 4:\n        if (DrawAreaGlow())\n            return;\n        break;\n    case 5:\n        ShowRegionMapForPokedexAreaScreen(&sPokedexAreaScreen->regionMap);\n        CreateRegionMapPlayerIcon(1, 1);\n        PokedexAreaScreen_UpdateRegionMapVariablesAndVideoRegs(0, -8);\n        break;\n    case 6:\n        CreateAreaMarkerSprites();\n        break;\n    case 7:\n        LoadAreaUnknownGraphics();\n        break;\n    case 8:\n        CreateAreaUnknownSprites();\n        break;\n    case 9:\n        BeginNormalPaletteFade(PALETTES_ALL & ~(0x14), 0, 16, 0, RGB_BLACK);\n        break;\n    case 10:\n        SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG0 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_BG0 | BLDCNT_TGT2_ALL);\n        StartAreaGlow();\n        ShowBg(2);\n        ShowBg(3);  \n        SetGpuRegBits(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON);\n        break;\n    case 11:\n        gTasks[taskId].func = Task_HandlePokedexAreaScreenInput;\n        gTasks[taskId].tState = 0;\n        return;\n    }\n\n    gTasks[taskId].tState++;",
  },
  "Task_HandlePokedexAreaScreenInput": {
    callsTo: ["BeginNormalPaletteFade","DestroyAreaScreenSprites","DestroyTask","DoAreaGlow","FREE_AND_SET_NULL","FreePokedexAreaMapBgNum","JOY_NEW","PlaySE","ResetPokedexAreaMapBg"],
    dataReads: ["data[1]","tState"],
    dataWrites: ["data[1]","tState"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true, joyButtons: ["NEW:B_BUTTON","NEW:DPAD_RIGHT","NEW:R_BUTTON"] },
    lineCount: 38,
    bodyC: "DoAreaGlow();\n    switch (gTasks[taskId].tState)\n    {\n    default:\n        gTasks[taskId].tState = 0;\n         \n    case 0:\n        if (gPaletteFade.active)\n            return;\n        break;\n    case 1:\n        if (JOY_NEW(B_BUTTON))\n        {\n            gTasks[taskId].data[1] = 1;\n            PlaySE(SE_PC_OFF);\n        }\n        else if (JOY_NEW(DPAD_RIGHT) || (JOY_NEW(R_BUTTON) && gSaveBlock2Ptr->optionsButtonMode == OPTIONS_BUTTON_MODE_LR))\n        {\n            gTasks[taskId].data[1] = 2;\n            PlaySE(SE_DEX_PAGE);\n        }\n        else\n            return;\n        break;\n    case 2:\n        BeginNormalPaletteFade(PALETTES_ALL & ~(0x14), 0, 0, 16, RGB_BLACK);\n        break;\n    case 3:\n        if (gPaletteFade.active)\n            return;\n        DestroyAreaScreenSprites();\n        sPokedexAreaScreen->screenSwitchState[0] = gTasks[taskId].data[1];\n        ResetPokedexAreaMapBg();\n        DestroyTask(taskId);\n        FreePokedexAreaMapBgNum();\n        FREE_AND_SET_NULL(sPokedexAreaScreen);\n        return;\n    }\n\n    gTasks[taskId].tState++;",
  },
} as const;
