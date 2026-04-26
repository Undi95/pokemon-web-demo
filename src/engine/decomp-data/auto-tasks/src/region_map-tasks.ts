// AUTO-GENERATED from src/region_map.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 0 Task_, 2 CB2_, 6 SpriteCB_

export const CB2S = {
  "CB2_OpenFlyMap": {
    callsTo: ["ARRAY_COUNT","AddTextPrinterParameterized","Alloc","BG_CHAR_ADDR","BG_PLTT_ID","BG_SCREEN_ADDR","BlendPalettes","ClearScheduledBgCopiesToVram","CreateRegionMapCursor","CreateRegionMapPlayerIcon","DeactivateAllTextPrinters","DrawFlyDestTextWindow","FillWindowPixelBuffer","FreeAllSpritePalettes","FreeSpriteTileRanges","InitBgsFromTemplates","InitRegionMap","InitWindows","LZ77UnCompVram","LoadFlyDestIcons","LoadPalette","LoadUserWindowBorderGfx","PIXEL_FILL","PutWindowTilemap","ResetBgsAndClearDma3BusyFlags","ResetPaletteFade","ResetSpriteData","ScheduleBgCopyTilemapToVram","SetFlyMapCallback","SetGpuReg","SetGpuRegBits","SetMainCallback2","SetVBlankCallback","ShowBg","StringFill"],
    cb2Transitions: ["CB2_FlyMap","CB2_ReturnToFieldWithOpenMenu"],
    lineCount: 88,
    bodyC: "switch (gMain.state)\n    {\n    case 0:\n        SetVBlankCallback(NULL);\n        SetGpuReg(REG_OFFSET_DISPCNT, 0);\n        SetGpuReg(REG_OFFSET_BG0HOFS, 0);\n        SetGpuReg(REG_OFFSET_BG0VOFS, 0);\n        SetGpuReg(REG_OFFSET_BG1HOFS, 0);\n        SetGpuReg(REG_OFFSET_BG1VOFS, 0);\n        SetGpuReg(REG_OFFSET_BG2VOFS, 0);\n        SetGpuReg(REG_OFFSET_BG2HOFS, 0);\n        SetGpuReg(REG_OFFSET_BG3HOFS, 0);\n        SetGpuReg(REG_OFFSET_BG3VOFS, 0);\n        sFlyMap = Alloc(sizeof(*sFlyMap));\n        if (sFlyMap == NULL)\n        {\n            SetMainCallback2(CB2_ReturnToFieldWithOpenMenu);\n        }\n        else\n        {\n            ResetPaletteFade();\n            ResetSpriteData();\n            FreeSpriteTileRanges();\n            FreeAllSpritePalettes();\n            gMain.state++;\n        }\n        break;\n    case 1:\n        ResetBgsAndClearDma3BusyFlags(0);\n        InitBgsFromTemplates(1, sFlyMapBgTemplates, ARRAY_COUNT(sFlyMapBgTemplates));\n        gMain.state++;\n        break;\n    case 2:\n        InitWindows(sFlyMapWindowTemplates);\n        DeactivateAllTextPrinters();\n        gMain.state++;\n        break;\n    case 3:\n        LoadUserWindowBorderGfx(0, 0x65, BG_PLTT_ID(13));\n        ClearScheduledBgCopiesToVram();\n        gMain.state++;\n        break;\n    case 4:\n        InitRegionMap(&sFlyMap->regionMap, FALSE);\n        CreateRegionMapCursor(TAG_CURSOR, TAG_CURSOR);\n        CreateRegionMapPlayerIcon(TAG_PLAYER_ICON, TAG_PLAYER_ICON);\n        sFlyMap->mapSecId = sFlyMap->regionMap.mapSecId;\n        StringFill(sFlyMap->nameBuffer, CHAR_SPACE, MAP_NAME_LENGTH);\n        sDrawFlyDestTextWindow = TRUE;\n        DrawFlyDestTextWindow();\n        gMain.state++;\n        break;\n    case 5:\n        LZ77UnCompVram(sRegionMapFrameGfxLZ, (u16 *)BG_CHAR_ADDR(3));\n        gMain.state++;\n        break;\n    case 6:\n        LZ77UnCompVram(sRegionMapFrameTilemapLZ, (u16 *)BG_SCREEN_ADDR(30));\n        gMain.state++;\n        break;\n    case 7:\n        LoadPalette(sRegionMapFramePal, BG_PLTT_ID(1), sizeof(sRegionMapFramePal));\n        PutWindowTilemap(WIN_FLY_TO_WHERE);\n        FillWindowPixelBuffer(WIN_FLY_TO_WHERE, PIXEL_FILL(0));\n        AddTextPrinterParameterized(WIN_FLY_TO_WHERE, FONT_NORMAL, gText_FlyToWhere, 0, 1, 0, NULL);\n        ScheduleBgCopyTilemapToVram(0);\n        gMain.state++;\n        break;\n    case 8:\n        LoadFlyDestIcons();\n        gMain.state++;\n        break;\n    case 9:\n        BlendPalettes(PALETTES_ALL, 16, 0);\n        SetVBlankCallback(VBlankCB_FlyMap);\n        gMain.state++;\n        break;\n    case 10:\n        SetGpuReg(REG_OFFSET_BLDCNT, 0);\n        SetGpuRegBits(REG_OFFSET_DISPCNT, DISPCNT_OBJ_1D_MAP | DISPCNT_OBJ_ON);\n        ShowBg(0);\n        ShowBg(1);\n        ShowBg(2);\n        SetFlyMapCallback(CB_FadeInFlyMap);\n        SetMainCallback2(CB2_FlyMap);\n        gMain.state++;\n        break;\n    }",
  },
  "CB2_FlyMap": {
    callsTo: ["AnimateSprites","BuildOamBuffer","DoScheduledBgTilemapCopiesToVram","callback"],
    externalChecks: { waitForVBlank: true },
    lineCount: 4,
    bodyC: "sFlyMap->callback();\n    AnimateSprites();\n    BuildOamBuffer();\n    DoScheduledBgTilemapCopiesToVram();",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_CursorMapFull": {
    lineCount: 6,
    bodyC: "if (sRegionMap->cursorMovementFrameCounter != 0)\n    {\n        sprite->x += 2 * sRegionMap->cursorDeltaX;\n        sprite->y += 2 * sRegionMap->cursorDeltaY;\n        sRegionMap->cursorMovementFrameCounter--;\n    }",
  },
  "SpriteCB_CursorMapZoomed": {
    lineCount: 0,
    bodyC: "",
  },
  "SpriteCB_PlayerIconMapZoomed": {
    callsTo: ["SpriteCB_PlayerIcon"],
    lineCount: 12,
    bodyC: "sprite->x2 = -2 * sRegionMap->scrollX;\n    sprite->y2 = -2 * sRegionMap->scrollY;\n    sprite->sY = sprite->y + sprite->y2 + sprite->centerToCornerVecY;\n    sprite->sX = sprite->x + sprite->x2 + sprite->centerToCornerVecX;\n    if (sprite->sY < -8 || sprite->sY > DISPLAY_HEIGHT + 8 || sprite->sX < -8 || sprite->sX > DISPLAY_WIDTH + 8)\n        sprite->sVisible = FALSE;\n    else\n        sprite->sVisible = TRUE;\n\n    if (sprite->sVisible == TRUE)\n        SpriteCB_PlayerIcon(sprite);\n    else\n        sprite->invisible = TRUE;",
  },
  "SpriteCB_PlayerIconMapFull": {
    callsTo: ["SpriteCB_PlayerIcon"],
    lineCount: 1,
    bodyC: "SpriteCB_PlayerIcon(sprite);",
  },
  "SpriteCB_PlayerIcon": {
    lineCount: 12,
    bodyC: "if (sRegionMap->blinkPlayerIcon)\n    {\n        if (++sprite->sTimer > 16)\n        {\n            sprite->sTimer = 0;\n            sprite->invisible = sprite->invisible ? FALSE : TRUE;\n        }\n    }\n    else\n    {\n        sprite->invisible = FALSE;\n    }",
  },
  "SpriteCB_FlyDestIcon": {
    lineCount: 13,
    bodyC: "if (sFlyMap->regionMap.mapSecId == sprite->sIconMapSec)\n    {\n        if (++sprite->sFlickerTimer > 16)\n        {\n            sprite->sFlickerTimer = 0;\n            sprite->invisible = sprite->invisible ? FALSE : TRUE;\n        }\n    }\n    else\n    {\n        sprite->sFlickerTimer = 16;\n        sprite->invisible = FALSE;\n    }",
  },
} as const;
