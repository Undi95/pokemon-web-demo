// AUTO-GENERATED from src/item_icon.c by extract-engine-helpers.mjs
// Do not edit — re-run `node scripts/extract-engine-helpers.mjs` to refresh.
//
// Generated: 2026-04-27
// Functions: 6

export const ENGINE_FUNCTIONS = {
  "AddCustomItemIconSprite": {
    returnType: "u8",
    params: "const struct SpriteTemplate *customSpriteTemplate, u16 tilesTag, u16 paletteTag, u16 itemId",
    callsTo: ["Alloc","AllocItemIconTemporaryBuffers","CopyItemIconPicTo4x4Buffer","CpuCopy16","CreateSprite","Free","FreeItemIconTemporaryBuffers","GetItemIconPicOrPalette","LZDecompressWram","LoadCompressedSpritePalette","LoadSpriteSheet"],
    lineCount: 28,
    bodyC: "if (!AllocItemIconTemporaryBuffers())\n    {\n        return MAX_SPRITES;\n    }\n    else\n    {\n        u8 spriteId;\n        struct SpriteSheet spriteSheet;\n        struct CompressedSpritePalette spritePalette;\n        struct SpriteTemplate *spriteTemplate;\n\n        LZDecompressWram(GetItemIconPicOrPalette(itemId, 0), gItemIconDecompressionBuffer);\n        CopyItemIconPicTo4x4Buffer(gItemIconDecompressionBuffer, gItemIcon4x4Buffer);\n        spriteSheet.data = gItemIcon4x4Buffer;\n        spriteSheet.size = 0x200;\n        spriteSheet.tag = tilesTag;\n        LoadSpriteSheet(&spriteSheet);\n\n        spritePalette.data = GetItemIconPicOrPalette(itemId, 1);\n        spritePalette.tag = paletteTag;\n        LoadCompressedSpritePalette(&spritePalette);\n\n        spriteTemplate = Alloc(sizeof(*spriteTemplate));\n        CpuCopy16(customSpriteTemplate, spriteTemplate, sizeof(*spriteTemplate));\n        spriteTemplate->tileTag = tilesTag;\n        spriteTemplate->paletteTag = paletteTag;\n        spriteId = CreateSprite(spriteTemplate, 0, 0, 0);\n\n        FreeItemIconTemporaryBuffers();\n        Free(spriteTemplate);\n\n        return spriteId;\n    }",
  },
  "AddItemIconSprite": {
    returnType: "u8",
    params: "u16 tilesTag, u16 paletteTag, u16 itemId",
    callsTo: ["Alloc","AllocItemIconTemporaryBuffers","CopyItemIconPicTo4x4Buffer","CpuCopy16","CreateSprite","Free","FreeItemIconTemporaryBuffers","GetItemIconPicOrPalette","LZDecompressWram","LoadCompressedSpritePalette","LoadSpriteSheet"],
    lineCount: 28,
    bodyC: "if (!AllocItemIconTemporaryBuffers())\n    {\n        return MAX_SPRITES;\n    }\n    else\n    {\n        u8 spriteId;\n        struct SpriteSheet spriteSheet;\n        struct CompressedSpritePalette spritePalette;\n        struct SpriteTemplate *spriteTemplate;\n\n        LZDecompressWram(GetItemIconPicOrPalette(itemId, 0), gItemIconDecompressionBuffer);\n        CopyItemIconPicTo4x4Buffer(gItemIconDecompressionBuffer, gItemIcon4x4Buffer);\n        spriteSheet.data = gItemIcon4x4Buffer;\n        spriteSheet.size = 0x200;\n        spriteSheet.tag = tilesTag;\n        LoadSpriteSheet(&spriteSheet);\n\n        spritePalette.data = GetItemIconPicOrPalette(itemId, 1);\n        spritePalette.tag = paletteTag;\n        LoadCompressedSpritePalette(&spritePalette);\n\n        spriteTemplate = Alloc(sizeof(*spriteTemplate));\n        CpuCopy16(&gItemIconSpriteTemplate, spriteTemplate, sizeof(*spriteTemplate));\n        spriteTemplate->tileTag = tilesTag;\n        spriteTemplate->paletteTag = paletteTag;\n        spriteId = CreateSprite(spriteTemplate, 0, 0, 0);\n\n        FreeItemIconTemporaryBuffers();\n        Free(spriteTemplate);\n\n        return spriteId;\n    }",
  },
  "AllocItemIconTemporaryBuffers": {
    returnType: "bool8",
    params: "void",
    callsTo: ["Alloc","AllocZeroed","Free"],
    lineCount: 10,
    bodyC: "gItemIconDecompressionBuffer = Alloc(0x120);\n    if (gItemIconDecompressionBuffer == NULL)\n        return FALSE;\n\n    gItemIcon4x4Buffer = AllocZeroed(0x200);\n    if (gItemIcon4x4Buffer == NULL)\n    {\n        Free(gItemIconDecompressionBuffer);\n        return FALSE;\n    }\n\n    return TRUE;",
  },
  "CopyItemIconPicTo4x4Buffer": {
    returnType: "void",
    params: "const void *src, void *dest",
    callsTo: ["CpuCopy16"],
    lineCount: 3,
    bodyC: "u8 i;\n\n    for (i = 0; i < 3; i++)\n        CpuCopy16(src + i * 96, dest + i * 128, 0x60);",
  },
  "FreeItemIconTemporaryBuffers": {
    returnType: "void",
    params: "void",
    callsTo: ["Free"],
    lineCount: 2,
    bodyC: "Free(gItemIconDecompressionBuffer);\n    Free(gItemIcon4x4Buffer);",
  },
  "GetItemIconPicOrPalette": {
    returnType: "const void *",
    params: "u16 itemId, u8 which",
    lineCount: 5,
    bodyC: "if (itemId == ITEM_LIST_END)\n        itemId = ITEMS_COUNT;  \n    else if (itemId >= ITEMS_COUNT)\n        itemId = 0;\n\n    return gItemIconTable[itemId][which];",
  },
} as const;
