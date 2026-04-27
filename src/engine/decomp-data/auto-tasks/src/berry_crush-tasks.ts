// AUTO-GENERATED from src/berry_crush.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 1 Task_, 0 CB2_, 5 SpriteCB_

export const TASKS = {
  "Task_ShowRankings": {
    callsTo: ["AddTextPrinterParameterized3","AddWindow","BG_PLTT_ID","ClearStdWindowAndFrameToTransparent","ClearWindowTilemap","ConvertIntToDecimalStringN","CopyWindowToVram","DestroyTask","DrawStdFrameWithCustomTileAndPalette","FillWindowPixelBuffer","GetStringWidth","JOY_NEW","LoadUserWindowBorderGfx_","PIXEL_FILL","PutWindowTilemap","RemoveWindow","ScriptContext_Enable","StringExpandPlaceholders","UnlockPlayerFieldControls","tPressingSpeeds"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 56,
    bodyC: "u8 i = 0, j, xPos, yPos;\n    u32 score = 0;\n    s16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n    case 0:\n        tWindowId = AddWindow(&sWindowTemplate_Rankings);\n        PutWindowTilemap(tWindowId);\n        FillWindowPixelBuffer(tWindowId, PIXEL_FILL(0));\n        LoadUserWindowBorderGfx_(tWindowId, 541, BG_PLTT_ID(13));\n        DrawStdFrameWithCustomTileAndPalette(tWindowId, FALSE, 541, 13);\n        break;\n    case 1:\n         \n        xPos = 96 - GetStringWidth(FONT_NORMAL, gText_BerryCrush2, -1) / 2u;\n        AddTextPrinterParameterized3(tWindowId, FONT_NORMAL, xPos, 1, sTextColorTable[COLORID_BLUE], 0, gText_BerryCrush2);\n        xPos = 96 - GetStringWidth(FONT_NORMAL, gText_PressingSpeedRankings, -1) / 2u;\n        AddTextPrinterParameterized3(tWindowId, FONT_NORMAL, xPos, 17, sTextColorTable[COLORID_BLUE], 0, gText_PressingSpeedRankings);\n\n         \n        yPos = 41;\n        for (i = 0; i < MAX_RFU_PLAYERS - 1; i++)\n        {\n            ConvertIntToDecimalStringN(gStringVar1, i + 2, STR_CONV_MODE_LEFT_ALIGN, 1);\n            StringExpandPlaceholders(gStringVar4, gText_Var1Players);\n            AddTextPrinterParameterized3(tWindowId, FONT_NORMAL, 0, yPos, sTextColorTable[COLORID_GRAY], 0, gStringVar4);\n            xPos = 192 - (u8)GetStringWidth(FONT_NORMAL, gText_TimesPerSec, -1);\n            AddTextPrinterParameterized3(tWindowId, FONT_NORMAL, xPos, yPos, sTextColorTable[COLORID_GRAY], 0, gText_TimesPerSec);\n            for (j = 0; j < 8; j++)\n            {\n                if (((tPressingSpeeds(i) & 0xFF) >> (7 - j)) & 1)\n                    score += sPressingSpeedConversionTable[j];\n            }\n            ConvertIntToDecimalStringN(gStringVar1, (u16)tPressingSpeeds(i) >> 8, STR_CONV_MODE_RIGHT_ALIGN, 3);\n            ConvertIntToDecimalStringN(gStringVar2, score / 1000000, STR_CONV_MODE_LEADING_ZEROS, 2);\n            StringExpandPlaceholders(gStringVar4, gText_XDotY3);\n            xPos -= GetStringWidth(FONT_NORMAL, gStringVar4, -1);\n            AddTextPrinterParameterized3(tWindowId, FONT_NORMAL, xPos, yPos, sTextColorTable[COLORID_GRAY], 0, gStringVar4);\n            yPos += 16;\n            score = 0;\n        }\n        CopyWindowToVram(tWindowId, COPYWIN_FULL);\n        break;\n    case 2:\n        if (JOY_NEW(A_BUTTON | B_BUTTON))\n            break;\n        else\n            return;\n    case 3:\n        ClearStdWindowAndFrameToTransparent(tWindowId, TRUE);\n        ClearWindowTilemap(tWindowId);\n        RemoveWindow(tWindowId);\n        DestroyTask(taskId);\n        ScriptContext_Enable();\n        UnlockPlayerFieldControls();\n        tState = 0;\n        return;\n    }\n    tState++;",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_DropBerryIntoCrusher": {
    callsTo: ["DestroySprite","FreeSpriteOamMatrix","Sin"],
    spriteTransitions: ["SpriteCallbackDummy"],
    terminalMarkers: ["DestroySprite","FreeSpriteOamMatrix"],
    lineCount: 21,
    bodyC: "s16 *data = sprite->data;\n\n    sYSpeed += sYAccel;\n    sprite->y2 += sYSpeed >> 8;\n    if (sBitfield & F_MOVE_HORIZ)\n    {\n        sprite->sX += sXSpeed;\n        sSinIdx += sSinSpeed;\n        sprite->x2 = Sin(sSinIdx >> 7, sAmplitude);\n        if ((sBitfield & F_MOVE_HORIZ) && (sSinIdx >> 7) > 126)\n        {\n            sprite->x2 = 0;\n            sBitfield &= MASK_TARGET_Y;\n        }\n    }\n\n    sprite->x = sX >> 7;\n    if (sprite->y + sprite->y2 >= (sBitfield & MASK_TARGET_Y))\n    {\n        sprite->callback = SpriteCallbackDummy;\n        FreeSpriteOamMatrix(sprite);\n        DestroySprite(sprite);\n    }",
  },
  "SpriteCB_Impact": {
    lineCount: 5,
    bodyC: "if (sprite->animEnded)\n    {\n        sprite->invisible = TRUE;\n        sprite->animPaused = TRUE;\n    }",
  },
  "SpriteCB_Sparkle_End": {
    callsTo: ["ARRAY_COUNT"],
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 8,
    bodyC: "u8 i;\n    for (i = 0; i < ARRAY_COUNT(sprite->data); i++)\n        sprite->data[i] = 0;\n    sprite->x2 = 0;\n    sprite->y2 = 0;\n    sprite->invisible = TRUE;\n    sprite->animPaused = TRUE;\n    sprite->callback = SpriteCallbackDummy;",
  },
  "SpriteCB_Sparkle": {
    callsTo: ["Sin"],
    spriteTransitions: ["SpriteCB_Sparkle_End"],
    lineCount: 17,
    bodyC: "s16 *data = sprite->data;\n\n    sYSpeed += sYAccel;\n    sprite->y2 += sYSpeed >> 8;\n    if (sBitfield & F_MOVE_HORIZ)\n    {\n        sprite->sX += sXSpeed;\n        sSinIdx += sSinSpeed;\n        sprite->x2 = Sin(sSinIdx >> 7, sAmplitude);\n        if (sBitfield & F_MOVE_HORIZ && sSinIdx >> 7 > 126)\n        {\n            sprite->x2 = 0;\n            sBitfield &= MASK_TARGET_Y;\n        }\n    }\n    sprite->x = sX >> 7;\n    if (sprite->y + sprite->y2 > (sBitfield & MASK_TARGET_Y))\n        sprite->callback = SpriteCB_Sparkle_End;",
  },
  "SpriteCB_Sparkle_Init": {
    callsTo: ["MathUtil_Div16Shift","MathUtil_Mul16Shift","Q_8_8"],
    spriteTransitions: ["SpriteCB_Sparkle"],
    lineCount: 22,
    bodyC: "s16 *data = sprite->data;\n    s16 xMult, xDiv;\n    s32 var;\n    u32 zero = 0;\n\n    var = 640;\n    sYSpeed = var;\n    sYAccel = 32;\n    sBitfield = 168;  \n    xMult = sprite->x2 * 128;\n    xDiv = MathUtil_Div16Shift(7, (168 - sprite->y) << 7, (var + 32) >> 1);\n    sprite->sX = sprite->x << 7;\n    sXSpeed = MathUtil_Div16Shift(7, xMult, xDiv);\n    var = MathUtil_Mul16Shift(7, xDiv, 85);\n    sSinIdx = zero;\n    sSinSpeed = MathUtil_Div16Shift(7, Q_8_8(63.5), var);\n    sAmplitude = sprite->x2 / 4;\n    sBitfield |= F_MOVE_HORIZ;\n    sprite->y2 = zero;\n    sprite->x2 = zero;\n    sprite->callback = SpriteCB_Sparkle;\n    sprite->animPaused = FALSE;\n    sprite->invisible = FALSE;",
  },
} as const;
