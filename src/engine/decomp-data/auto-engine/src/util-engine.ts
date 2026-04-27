// AUTO-GENERATED from src/util.c by extract-engine-helpers.mjs
// Do not edit — re-run `node scripts/extract-engine-helpers.mjs` to refresh.
//
// Generated: 2026-04-27
// Functions: 11

export const ENGINE_FUNCTIONS = {
  "BlendPalette": {
    returnType: "void",
    params: "u16 palOffset, u16 numEntries, u8 coeff, u16 blendColor",
    callsTo: ["RGB"],
    lineCount: 13,
    bodyC: "u16 i;\n    for (i = 0; i < numEntries; i++)\n    {\n        u16 index = i + palOffset;\n        struct PlttData *data1 = (struct PlttData *)&gPlttBufferUnfaded[index];\n        s8 r = data1->r;\n        s8 g = data1->g;\n        s8 b = data1->b;\n        struct PlttData *data2 = (struct PlttData *)&blendColor;\n        gPlttBufferFaded[index] = RGB(r + (((data2->r - r) * coeff) >> 4),\n                                      g + (((data2->g - g) * coeff) >> 4),\n                                      b + (((data2->b - b) * coeff) >> 4));\n    }",
  },
  "CalcByteArraySum": {
    returnType: "u32",
    params: "const u8 *data, u32 length",
    lineCount: 4,
    bodyC: "u32 sum, i;\n    for (sum = 0, i = 0; i < length; i++)\n        sum += data[i];\n    return sum;",
  },
  "CalcCRC16": {
    returnType: "u16",
    params: "const u8 *data, s32 length",
    lineCount: 14,
    bodyC: "u16 i, j;\n    u16 crc = 0x1121;\n\n    for (i = 0; i < length; i++)\n    {\n        crc ^= data[i];\n        for (j = 0; j < 8; j++)\n        {\n            if (crc & 1)\n                crc = (crc >> 1) ^ 0x8408;\n            else\n                crc >>= 1;\n        }\n    }\n    return ~crc;",
  },
  "CalcCRC16WithTable": {
    returnType: "u16",
    params: "const u8 *data, u32 length",
    lineCount: 10,
    bodyC: "u16 i;\n    u16 crc = 0x1121;\n    u8 byte;\n\n    for (i = 0; i < length; i++)\n    {\n        byte = crc >> 8;\n        crc ^= data[i];\n        crc = byte ^ sCrc16Table[(u8)crc];\n    }\n    return ~crc;",
  },
  "CopySpriteTiles": {
    returnType: "void",
    params: "u8 shape, u8 size, u8 *tiles, u16 *tilemap, u8 *output",
    callsTo: ["ALIGNED","CpuCopy32"],
    lineCount: 45,
    bodyC: "u8 x, y;\n    s8 i, j;\n    u8 ALIGNED(4) xflip[32];\n    u8 h = sSpriteDimensions[shape][size][1];\n    u8 w = sSpriteDimensions[shape][size][0];\n\n    for (y = 0; y < h; y++)\n    {\n        for (x = 0; x < w; x++)\n        {\n            int tile = (*tilemap & 0x3ff) * 32;\n\n            if ((*tilemap & 0xc00) == 0)\n            {\n                CpuCopy32(tiles + tile, output, 32);\n            }\n            else if ((*tilemap & 0xc00) == 0x800)   \n            {\n                for (i = 0; i < 8; i++)\n                    CpuCopy32(tiles + (tile + (7 - i) * 4), output + i * 4, 4);\n            }\n            else   \n            {\n                for (i = 0; i < 8; i++)\n                {\n                    for (j = 0; j < 4; j++)\n                    {\n                        u8 i2 = i * 4;\n                        xflip[i2 + (3-j)] = (tiles[tile + i2 + j] & 0xf) << 4;\n                        xflip[i2 + (3-j)] |= tiles[tile + i2 + j] >> 4;\n                    }\n                }\n                if (*tilemap & 0x800)   \n                {\n                    for (i = 0; i < 8; i++)\n                        CpuCopy32(xflip + (7 - i) * 4, output + i * 4, 4);\n                }\n                else\n                {\n                    CpuCopy32(xflip, output, 32);\n                }\n            }\n            tilemap++;\n            output += 32;\n        }\n        tilemap += (32 - w);\n    }",
  },
  "CountTrailingZeroBits": {
    returnType: "int",
    params: "u32 value",
    lineCount: 9,
    bodyC: "u8 i;\n\n    for (i = 0; i < 32; i++)\n    {\n        if ((value & 1) == 0)\n            value >>= 1;\n        else\n            return i;\n    }\n    return 0;",
  },
  "CreateInvisibleSpriteWithCallback": {
    returnType: "u8",
    params: "void (*callback)(struct Sprite *)",
    callsTo: ["CreateSprite"],
    lineCount: 4,
    bodyC: "u8 sprite = CreateSprite(&sInvisibleSpriteTemplate, DISPLAY_WIDTH + 8, DISPLAY_HEIGHT + 8, 14);\n    gSprites[sprite].invisible = TRUE;\n    gSprites[sprite].callback = callback;\n    return sprite;",
  },
  "DoBgAffineSet": {
    returnType: "void",
    params: "struct BgAffineDstData *dest, u32 texX, u32 texY, s16 scrX, s16 scrY, s16 sx, s16 sy, u16 alpha",
    callsTo: ["BgAffineSet","SetBgAffineStruct"],
    lineCount: 3,
    bodyC: "struct BgAffineSrcData src;\n\n    SetBgAffineStruct(&src, texX, texY, scrX, scrY, sx, sy, alpha);\n    BgAffineSet(&src, dest, 1);",
  },
  "LoadWordFromTwoHalfwords": {
    returnType: "void",
    params: "u16 *h, u32 *w",
    lineCount: 1,
    bodyC: "*w = h[0] | (s16)h[1] << 16;",
  },
  "SetBgAffineStruct": {
    returnType: "void",
    params: "struct BgAffineSrcData *src, u32 texX, u32 texY, s16 scrX, s16 scrY, s16 sx, s16 sy, u16 alpha",
    lineCount: 7,
    bodyC: "src->texX = texX;\n    src->texY = texY;\n    src->scrX = scrX;\n    src->scrY = scrY;\n    src->sx = sx;\n    src->sy = sy;\n    src->alpha = alpha;",
  },
  "StoreWordInTwoHalfwords": {
    returnType: "void",
    params: "u16 *h, u32 w",
    lineCount: 2,
    bodyC: "h[0] = (u16)(w);\n    h[1] = (u16)(w >> 16);",
  },
} as const;
