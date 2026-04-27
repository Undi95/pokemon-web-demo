// AUTO-GENERATED from src/pokedex_cry_screen.c by extract-engine-helpers.mjs
// Do not edit — re-run `node scripts/extract-engine-helpers.mjs` to refresh.
//
// Generated: 2026-04-27
// Functions: 14

export const ENGINE_FUNCTIONS = {
  "AdvancePlayhead": {
    returnType: "static void",
    params: "u8 windowId",
    callsTo: ["CopyToWindowPixelBuffer","ShiftWaveformOver"],
    lineCount: 7,
    bodyC: "u8 i;\n    u16 offset;\n\n    ShiftWaveformOver(windowId, sDexCryScreen->playhead, FALSE);\n    sDexCryScreen->playhead += 2;\n    offset = (sDexCryScreen->playhead / 8 + sDexCryScreen->playStartPos + 1) % 32;\n    for (i = 0; i < 7; i++)\n        CopyToWindowPixelBuffer(windowId, sCryScreenBg_Gfx, TILE_SIZE_4BPP, offset + (i * TILE_SIZE_4BPP));",
  },
  "BufferCryWaveformSegment": {
    returnType: "static void",
    params: "void",
    callsTo: ["ARRAY_COUNT"],
    lineCount: 10,
    bodyC: "u8 i;\n    s8 *baseBuffer;\n    s8 *buffer;\n\n    if (gPcmDmaCounter < 2)\n        baseBuffer = gSoundInfo.pcmBuffer;\n    else\n        baseBuffer = gSoundInfo.pcmBuffer + (gSoundInfo.pcmDmaPeriod + 1 - gPcmDmaCounter) * gSoundInfo.pcmSamplesPerVBlank;\n\n    buffer = baseBuffer + PCM_DMA_BUF_SIZE;\n    for (i = 0; i < ARRAY_COUNT(sDexCryScreen->cryWaveformBuffer); i++)\n        sDexCryScreen->cryWaveformBuffer[i] = buffer[i * 2] * 2;",
  },
  "CryScreenPlayButton": {
    returnType: "void",
    params: "u16 species",
    callsTo: ["IsCryPlaying","PlayCryScreenCry","StopCry"],
    lineCount: 17,
    bodyC: "if (gMPlayInfo_BGM.status & MUSICPLAYER_STATUS_PAUSE && !sDexCryScreen->cryOverrideCountdown)\n    {\n        if (!sDexCryScreen->cryRepeatDelay)\n        {\n            sDexCryScreen->cryRepeatDelay = 4;\n            if (IsCryPlaying() == TRUE)\n            {\n                StopCry();\n                sDexCryScreen->species = species;\n                sDexCryScreen->cryOverrideCountdown = 2;\n            }\n            else\n            {\n                PlayCryScreenCry(species);\n            }\n        }\n    }",
  },
  "DrawWaveformFlatline": {
    returnType: "static void",
    params: "void",
    callsTo: ["DrawWaveformSegment"],
    lineCount: 2,
    bodyC: "DrawWaveformSegment(sDexCryScreen->playStartPos * 8 + sDexCryScreen->playhead - 2, 0);\n    DrawWaveformSegment(sDexCryScreen->playStartPos * 8 + sDexCryScreen->playhead - 1, 0);",
  },
  "DrawWaveformSegment": {
    returnType: "static void",
    params: "u8 position, u8 amplitude",
    callsTo: ["PLAYHEAD_POS","PLAY_START_POS","VERT_SLICE"],
    lineCount: 35,
    bodyC: "#define PLAY_START_POS (position >> 3)\n    #define PLAYHEAD_POS   (position & ((1 << 3) - 1))\n    #define VERT_SLICE     (position & 1)\n\n    u8 currentPointY;\n    u8 nybble;\n    u16 offset;\n    u16 temp;\n    u8 y;\n\n    temp = (amplitude + 127) * 256;\n    y = temp / 1152.0;\n    if (y > WAVEFORM_WINDOW_HEIGHT - 1)\n        y = WAVEFORM_WINDOW_HEIGHT - 1;\n    currentPointY = y;\n    nybble = VERT_SLICE;\n    if (y > sDexCryScreen->waveformPreviousY)\n    {\n         \n        do\n        {\n            offset = sWaveformOffsets[PLAYHEAD_POS][y] + PLAY_START_POS * TILE_SIZE_4BPP;\n            sCryWaveformWindowTiledata[offset] &= sWaveformTileDataNybbleMasks[nybble];\n            sCryWaveformWindowTiledata[offset] |= sWaveformColor[nybble][((y / 3) - 1) & 0x0F];\n            y--;\n        } while (y > sDexCryScreen->waveformPreviousY);\n    }\n    else\n    {\n         \n        do\n        {\n            offset = sWaveformOffsets[PLAYHEAD_POS][y] + PLAY_START_POS * TILE_SIZE_4BPP;\n            sCryWaveformWindowTiledata[offset] &= sWaveformTileDataNybbleMasks[nybble];\n            sCryWaveformWindowTiledata[offset] |= sWaveformColor[nybble][((y / 3) - 1) & 0x0F];\n            y++;\n        } while (y < sDexCryScreen->waveformPreviousY);\n    }\n\n    sDexCryScreen->waveformPreviousY = currentPointY;",
  },
  "DrawWaveformWindow": {
    returnType: "static void",
    params: "u8 windowId",
    callsTo: ["CopyWindowToVram"],
    lineCount: 1,
    bodyC: "CopyWindowToVram(windowId, COPYWIN_GFX);",
  },
  "FreeCryScreen": {
    returnType: "void",
    params: "void",
    callsTo: ["DestroySprite","FREE_AND_SET_NULL","FreeSpritePaletteByTag","GetSpritePaletteTagByPaletteNum"],
    lineCount: 4,
    bodyC: "FreeSpritePaletteByTag(GetSpritePaletteTagByPaletteNum(gSprites[sCryMeterNeedle->spriteId].oam.paletteNum));\n    DestroySprite(gSprites + sCryMeterNeedle->spriteId);\n    FREE_AND_SET_NULL(sDexCryScreen);\n    FREE_AND_SET_NULL(sCryMeterNeedle);",
  },
  "LoadCryMeter": {
    returnType: "bool8",
    params: "struct CryScreenWindow *window, u8 windowId",
    callsTo: ["AllocZeroed","BG_PLTT_ID","CopyToWindowPixelBuffer","CreateSprite","LoadPalette","LoadSpritePalettes","LoadSpriteSheets"],
    lineCount: 21,
    bodyC: "bool8 finished = FALSE;\n\n    switch (gDexCryScreenState)\n    {\n    case 0:\n        if (!sCryMeterNeedle)\n            sCryMeterNeedle = AllocZeroed(sizeof(*sCryMeterNeedle));\n\n         \n        CopyToWindowPixelBuffer(windowId, gCryMeter_Gfx, 0, 0);\n        LoadPalette(gCryMeter_Pal, BG_PLTT_ID(window->paletteNo), PLTT_SIZE_4BPP);\n        gDexCryScreenState++;\n        break;\n    case 1:\n        LoadSpriteSheets(sCryMeterNeedleSpriteSheets);\n        LoadSpritePalettes(sCryMeterNeedleSpritePalettes);\n        sCryMeterNeedle->spriteId = CreateSprite(&sCryMeterNeedleSpriteTemplate, 40 + window->xPos * 8, 56 + window->yPos * 8, 1);\n        sCryMeterNeedle->rotation = MIN_NEEDLE_POS;\n        sCryMeterNeedle->targetRotation = MIN_NEEDLE_POS;\n        sCryMeterNeedle->moveIncrement = 0;\n        finished = TRUE;\n        break;\n    }\n\n    return finished;",
  },
  "LoadCryWaveformWindow": {
    returnType: "bool8",
    params: "struct CryScreenWindow *window, u8 windowId",
    callsTo: ["AllocZeroed","BG_PLTT_ID","CopyToWindowPixelBuffer","DrawWaveformSegment","DrawWaveformWindow","GetWindowAttribute","LoadPalette","ShiftWaveformOver"],
    lineCount: 34,
    bodyC: "u8 i;\n    u8 finished = FALSE;\n\n    switch (gDexCryScreenState)\n    {\n    case 0:\n        if (!sDexCryScreen)\n        {\n            sDexCryScreen = AllocZeroed(sizeof(*sDexCryScreen));\n            sCryWaveformWindowTiledata = (u8 *)GetWindowAttribute(windowId, WINDOW_TILE_DATA);\n        }\n\n        sDexCryScreen->unk = window->unk0;\n        sDexCryScreen->playStartPos = window->yPos;\n        sDexCryScreen->cryOverrideCountdown = 0;\n        sDexCryScreen->cryRepeatDelay = 0;\n        sDexCryScreen->cryState = 0;\n        sDexCryScreen->waveformPreviousY = WAVEFORM_WINDOW_HEIGHT / 2;\n        sDexCryScreen->playhead = 0;\n        ShiftWaveformOver(windowId, -8 * window->xPos, TRUE);  \n        for (i = 0; i < 224; i++)\n            CopyToWindowPixelBuffer(windowId, sCryScreenBg_Gfx, TILE_SIZE_4BPP, i);\n\n        gDexCryScreenState++;\n        break;\n    case 1:\n        for (i = 0; i < sDexCryScreen->playStartPos * 8; i++)\n            DrawWaveformSegment(i, 0);\n\n        gDexCryScreenState++;\n        break;\n    case 2:\n        DrawWaveformWindow(windowId);\n        LoadPalette(sCryScreenBg_Pal, BG_PLTT_ID(window->paletteNo), PLTT_SIZE_4BPP);\n        finished = TRUE;\n        break;\n    }\n\n    return finished;",
  },
  "PlayCryScreenCry": {
    returnType: "static void",
    params: "u16 species",
    callsTo: ["PlayCry_NormalNoDucking"],
    lineCount: 2,
    bodyC: "PlayCry_NormalNoDucking(species, 0, CRY_VOLUME_RS, CRY_PRIORITY_NORMAL);\n    sDexCryScreen->cryState = 1;",
  },
  "SetCryMeterNeedleTarget": {
    returnType: "static void",
    params: "s8 offset",
    lineCount: 5,
    bodyC: "u16 rotation = (MIN_NEEDLE_POS - offset) & 0xFF;\n\n     \n    if (rotation > MIN_NEEDLE_POS && rotation < (u8)MAX_NEEDLE_POS)\n        rotation = (u8)MAX_NEEDLE_POS;\n\n    sCryMeterNeedle->targetRotation = rotation;\n    sCryMeterNeedle->moveIncrement = NEEDLE_MOVE_INCREMENT;",
  },
  "ShiftWaveformOver": {
    returnType: "static void",
    params: "u8 windowId, s16 offset, bool8 rsVertical",
    callsTo: ["ChangeBgX","GetWindowAttribute"],
    lineCount: 5,
    bodyC: "if (!rsVertical)\n    {\n        u8 bg = GetWindowAttribute(windowId, WINDOW_BG);\n        ChangeBgX(bg, offset << 8, BG_COORD_SET);\n    }",
  },
  "SpriteCB_CryMeterNeedle": {
    returnType: "static void",
    params: "struct Sprite *sprite",
    callsTo: ["ARRAY_COUNT","ObjAffineSet","SetCryMeterNeedleTarget","SetOamMatrix"],
    lineCount: 67,
    bodyC: "u16 i;\n    s8 peakAmplitude;\n    s16 x;\n    s16 y;\n    struct ObjAffineSrcData affine;\n    struct OamMatrix matrix;\n    u8 amplitude;\n\n    gSprites[sCryMeterNeedle->spriteId].oam.affineMode = ST_OAM_AFFINE_NORMAL;\n    gSprites[sCryMeterNeedle->spriteId].oam.affineParam = 0;\n\n     \n     \n    switch (sDexCryScreen->cryState)\n    {\n    case 0:\n        sCryMeterNeedle->targetRotation = MIN_NEEDLE_POS;\n        if (sCryMeterNeedle->rotation > 0)\n        {\n            if (sCryMeterNeedle->moveIncrement != 1)\n                sCryMeterNeedle->moveIncrement--;\n        }\n        else\n        {\n            sCryMeterNeedle->moveIncrement = NEEDLE_MOVE_INCREMENT;\n        }\n        break;\n    case 2:\n        peakAmplitude = 0;\n        for (i = 0; i < ARRAY_COUNT(sDexCryScreen->cryWaveformBuffer); i++)\n        {\n            if (peakAmplitude < sDexCryScreen->cryWaveformBuffer[i])\n                peakAmplitude = sDexCryScreen->cryWaveformBuffer[i];\n        }\n        SetCryMeterNeedleTarget(peakAmplitude * 208 / 256);\n        break;\n    case 6:\n         \n        amplitude = sDexCryScreen->cryWaveformBuffer[10];\n        SetCryMeterNeedleTarget(amplitude * 208 / 256);\n        break;\n    }\n\n    if (sCryMeterNeedle->rotation == sCryMeterNeedle->targetRotation)\n    {\n         \n    }\n    else if (sCryMeterNeedle->rotation < sCryMeterNeedle->targetRotation)\n    {\n         \n        sCryMeterNeedle->rotation += sCryMeterNeedle->moveIncrement;\n        if (sCryMeterNeedle->rotation > sCryMeterNeedle->targetRotation)\n        {\n            sCryMeterNeedle->rotation = sCryMeterNeedle->targetRotation;\n            sCryMeterNeedle->targetRotation = 0;\n        }\n    }\n    else\n    {\n         \n        sCryMeterNeedle->rotation -= sCryMeterNeedle->moveIncrement;\n        if (sCryMeterNeedle->rotation < sCryMeterNeedle->targetRotation)\n        {\n            sCryMeterNeedle->rotation = sCryMeterNeedle->targetRotation;\n            sCryMeterNeedle->targetRotation = 0;\n        }\n    }\n\n    affine.xScale = 256;\n    affine.yScale = 256;\n    affine.rotation = sCryMeterNeedle->rotation * 256;\n    ObjAffineSet(&affine, &matrix, 1, 2);\n    SetOamMatrix(0, matrix.a, matrix.b, matrix.c, matrix.d);\n    x = gSineTable[((sCryMeterNeedle->rotation + 0x7F) & 0xFF)];\n    y = gSineTable[((sCryMeterNeedle->rotation + 0x7F) & 0xFF) + 64];\n    sprite->x2 = x * 24 / 256;\n    sprite->y2 = y * 24 / 256;",
  },
  "UpdateCryWaveformWindow": {
    returnType: "void",
    params: "u8 windowId",
    callsTo: ["AdvancePlayhead","BufferCryWaveformSegment","DrawWaveformFlatline","DrawWaveformSegment","DrawWaveformWindow","IsCryPlaying","PlayCryScreenCry"],
    lineCount: 39,
    bodyC: "u8 waveformIdx;\n\n    DrawWaveformWindow(windowId);\n    AdvancePlayhead(windowId);\n\n     \n    if (sDexCryScreen->cryRepeatDelay)\n        sDexCryScreen->cryRepeatDelay--;\n\n     \n    if (sDexCryScreen->cryOverrideCountdown)\n    {\n        sDexCryScreen->cryOverrideCountdown--;\n        if (!sDexCryScreen->cryOverrideCountdown)\n        {\n            PlayCryScreenCry(sDexCryScreen->species);\n            DrawWaveformFlatline();\n            return;\n        }\n    }\n\n     \n    if (sDexCryScreen->cryState == 0)\n    {\n        DrawWaveformFlatline();\n        return;\n    }\n\n     \n    if (sDexCryScreen->cryState == 1)\n    {\n        BufferCryWaveformSegment();\n    }\n    else if (sDexCryScreen->cryState > 8)\n    {\n         \n        if (!IsCryPlaying())\n        {\n            DrawWaveformFlatline();\n            sDexCryScreen->cryState = 0;\n            return;\n        }\n\n        BufferCryWaveformSegment();\n        sDexCryScreen->cryState = 1;\n    }\n\n     \n    waveformIdx = 2 * (sDexCryScreen->cryState - 1);\n    DrawWaveformSegment(sDexCryScreen->playStartPos * 8 + sDexCryScreen->playhead - 2, sDexCryScreen->cryWaveformBuffer[waveformIdx]);\n    DrawWaveformSegment(sDexCryScreen->playStartPos * 8 + sDexCryScreen->playhead - 1, sDexCryScreen->cryWaveformBuffer[waveformIdx + 1]);\n    sDexCryScreen->cryState++;",
  },
} as const;
