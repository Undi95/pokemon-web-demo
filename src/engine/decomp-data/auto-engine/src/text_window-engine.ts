// AUTO-GENERATED from src/text_window.c by extract-engine-helpers.mjs
// Do not edit — re-run `node scripts/extract-engine-helpers.mjs` to refresh.
//
// Generated: 2026-04-27
// Functions: 11

export const ENGINE_FUNCTIONS = {
  "DrawTextBorderInner": {
    returnType: "void",
    params: "u8 windowId, u16 tileNum, u8 palNum",
    callsTo: ["FillBgTilemapBufferRect","GetWindowAttribute"],
    lineCount: 13,
    bodyC: "u8 bgLayer = GetWindowAttribute(windowId, WINDOW_BG);\n    u16 tilemapLeft = GetWindowAttribute(windowId, WINDOW_TILEMAP_LEFT);\n    u16 tilemapTop = GetWindowAttribute(windowId, WINDOW_TILEMAP_TOP);\n    u16 width = GetWindowAttribute(windowId, WINDOW_WIDTH);\n    u16 height = GetWindowAttribute(windowId, WINDOW_HEIGHT);\n\n    FillBgTilemapBufferRect(bgLayer, tileNum + 0, tilemapLeft,              tilemapTop,                 1,          1,          palNum);\n    FillBgTilemapBufferRect(bgLayer, tileNum + 1, tilemapLeft + 1,          tilemapTop,                 width - 2,  1,          palNum);\n    FillBgTilemapBufferRect(bgLayer, tileNum + 2, tilemapLeft + width - 1,  tilemapTop,                 1,          1,          palNum);\n    FillBgTilemapBufferRect(bgLayer, tileNum + 3, tilemapLeft,              tilemapTop + 1,             1,          height - 2, palNum);\n    FillBgTilemapBufferRect(bgLayer, tileNum + 5, tilemapLeft + width - 1,  tilemapTop + 1,             1,          height - 2, palNum);\n    FillBgTilemapBufferRect(bgLayer, tileNum + 6, tilemapLeft,              tilemapTop + height - 1,    1,          1,          palNum);\n    FillBgTilemapBufferRect(bgLayer, tileNum + 7, tilemapLeft + 1,          tilemapTop + height - 1,    width -     2,  1,      palNum);\n    FillBgTilemapBufferRect(bgLayer, tileNum + 8, tilemapLeft + width - 1,  tilemapTop + height - 1,    1,          1,          palNum);",
  },
  "DrawTextBorderOuter": {
    returnType: "void",
    params: "u8 windowId, u16 tileNum, u8 palNum",
    callsTo: ["FillBgTilemapBufferRect","GetWindowAttribute"],
    lineCount: 13,
    bodyC: "u8 bgLayer = GetWindowAttribute(windowId, WINDOW_BG);\n    u16 tilemapLeft = GetWindowAttribute(windowId, WINDOW_TILEMAP_LEFT);\n    u16 tilemapTop = GetWindowAttribute(windowId, WINDOW_TILEMAP_TOP);\n    u16 width = GetWindowAttribute(windowId, WINDOW_WIDTH);\n    u16 height = GetWindowAttribute(windowId, WINDOW_HEIGHT);\n\n    FillBgTilemapBufferRect(bgLayer, tileNum + 0, tilemapLeft - 1,      tilemapTop - 1,         1,      1,      palNum);\n    FillBgTilemapBufferRect(bgLayer, tileNum + 1, tilemapLeft,          tilemapTop - 1,         width,  1,      palNum);\n    FillBgTilemapBufferRect(bgLayer, tileNum + 2, tilemapLeft + width,  tilemapTop - 1,         1,      1,      palNum);\n    FillBgTilemapBufferRect(bgLayer, tileNum + 3, tilemapLeft - 1,      tilemapTop,             1,      height, palNum);\n    FillBgTilemapBufferRect(bgLayer, tileNum + 5, tilemapLeft + width,  tilemapTop,             1,      height, palNum);\n    FillBgTilemapBufferRect(bgLayer, tileNum + 6, tilemapLeft - 1,      tilemapTop + height,    1,      1,      palNum);\n    FillBgTilemapBufferRect(bgLayer, tileNum + 7, tilemapLeft,          tilemapTop + height,    width,  1,      palNum);\n    FillBgTilemapBufferRect(bgLayer, tileNum + 8, tilemapLeft + width,  tilemapTop + height,    1,      1,      palNum);",
  },
  "GetOverworldTextboxPalettePtr": {
    returnType: "const u16 *",
    params: "void",
    lineCount: 1,
    bodyC: "return gMessageBox_Pal;",
  },
  "GetTextWindowPalette": {
    returnType: "const u16 *",
    params: "u8 id",
    lineCount: 20,
    bodyC: "switch (id)\n    {\n    case 0:\n        id = 0x00;\n        break;\n    case 1:\n        id = 0x10;\n        break;\n    case 2:\n        id = 0x20;\n        break;\n    case 3:\n        id = 0x30;\n        break;\n    case 4:\n    default:\n        id = 0x40;\n        break;\n    }\n\n    return (const u16 *)(sTextWindowPalettes) + id;",
  },
  "GetWindowFrameTilesPal": {
    returnType: "const struct TilesPal *",
    params: "u8 id",
    lineCount: 4,
    bodyC: "if (id >= WINDOW_FRAMES_COUNT)\n        return &sWindowFrames[0];\n    else\n        return &sWindowFrames[id];",
  },
  "LoadMessageBoxGfx": {
    returnType: "void",
    params: "u8 windowId, u16 destOffset, u8 palOffset",
    callsTo: ["GetOverworldTextboxPalettePtr","GetWindowAttribute","LoadBgTiles","LoadPalette"],
    lineCount: 2,
    bodyC: "LoadBgTiles(GetWindowAttribute(windowId, WINDOW_BG), gMessageBox_Gfx, 0x1C0, destOffset);\n    LoadPalette(GetOverworldTextboxPalettePtr(), palOffset, PLTT_SIZE_4BPP);",
  },
  "LoadUserWindowBorderGfx": {
    returnType: "void",
    params: "u8 windowId, u16 destOffset, u8 palOffset",
    callsTo: ["LoadWindowGfx"],
    lineCount: 1,
    bodyC: "LoadWindowGfx(windowId, gSaveBlock2Ptr->optionsWindowFrameType, destOffset, palOffset);",
  },
  "LoadUserWindowBorderGfxOnBg": {
    returnType: "void",
    params: "u8 bg, u16 destOffset, u8 palOffset",
    callsTo: ["GetWindowFrameTilesPal","LoadBgTiles","LoadPalette"],
    lineCount: 2,
    bodyC: "LoadBgTiles(bg, sWindowFrames[gSaveBlock2Ptr->optionsWindowFrameType].tiles, 0x120, destOffset);\n    LoadPalette(GetWindowFrameTilesPal(gSaveBlock2Ptr->optionsWindowFrameType)->pal, palOffset, PLTT_SIZE_4BPP);",
  },
  "LoadUserWindowBorderGfx_": {
    returnType: "void",
    params: "u8 windowId, u16 destOffset, u8 palOffset",
    callsTo: ["LoadUserWindowBorderGfx"],
    lineCount: 1,
    bodyC: "LoadUserWindowBorderGfx(windowId, destOffset, palOffset);",
  },
  "LoadWindowGfx": {
    returnType: "void",
    params: "u8 windowId, u8 frameId, u16 destOffset, u8 palOffset",
    callsTo: ["GetWindowAttribute","LoadBgTiles","LoadPalette"],
    lineCount: 2,
    bodyC: "LoadBgTiles(GetWindowAttribute(windowId, WINDOW_BG), sWindowFrames[frameId].tiles, 0x120, destOffset);\n    LoadPalette(sWindowFrames[frameId].pal, palOffset, PLTT_SIZE_4BPP);",
  },
  "rbox_fill_rectangle": {
    returnType: "void",
    params: "u8 windowId",
    callsTo: ["FillBgTilemapBufferRect","GetWindowAttribute"],
    lineCount: 6,
    bodyC: "u8 bgLayer = GetWindowAttribute(windowId, WINDOW_BG);\n    u16 tilemapLeft = GetWindowAttribute(windowId, WINDOW_TILEMAP_LEFT);\n    u16 tilemapTop = GetWindowAttribute(windowId, WINDOW_TILEMAP_TOP);\n    u16 width = GetWindowAttribute(windowId, WINDOW_WIDTH);\n    u16 height = GetWindowAttribute(windowId, WINDOW_HEIGHT);\n\n    FillBgTilemapBufferRect(bgLayer, 0, tilemapLeft - 1, tilemapTop - 1, width + 2, height + 2, 0x11);",
  },
} as const;
