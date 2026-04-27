// AUTO-GENERATED from src/pokedex_area_screen.c by extract-engine-helpers.mjs
// Do not edit — re-run `node scripts/extract-engine-helpers.mjs` to refresh.
//
// Generated: 2026-04-27
// Functions: 19

export const ENGINE_FUNCTIONS = {
  "BuildAreaGlowTilemap": {
    returnType: "static void",
    params: "void",
    callsTo: ["ARRAY_COUNT","GetRegionMapSecIdAt"],
    lineCount: 64,
    bodyC: "u16 i, y, x, j;\n\n     \n    for (i = 0; i < ARRAY_COUNT(sPokedexAreaScreen->areaGlowTilemap); i++)\n        sPokedexAreaScreen->areaGlowTilemap[i] = 0;\n\n     \n     \n    for (i = 0; i < sPokedexAreaScreen->numOverworldAreas; i++)\n    {\n        j = 0;\n        for (y = 0; y < AREA_SCREEN_HEIGHT; y++)\n        {\n            for (x = 0; x < AREA_SCREEN_WIDTH; x++)\n            {\n                if (GetRegionMapSecIdAt(x, y) == sPokedexAreaScreen->overworldAreasWithMons[i].regionMapSectionId)\n                    sPokedexAreaScreen->areaGlowTilemap[j] = GLOW_FULL;\n                j++;\n            }\n        }\n    }\n\n     \n    j = 0;\n    for (y = 0; y < AREA_SCREEN_HEIGHT; y++)\n    {\n        for (x = 0; x < AREA_SCREEN_WIDTH; x++)\n        {\n            if (sPokedexAreaScreen->areaGlowTilemap[j] == GLOW_FULL)\n            {\n                 \n                 \n\n                 \n                if (x != 0 && sPokedexAreaScreen->areaGlowTilemap[j - 1] != GLOW_FULL)\n                    sPokedexAreaScreen->areaGlowTilemap[j - 1] |= GLOW_EDGE_L;\n                if (x != AREA_SCREEN_WIDTH - 1 && sPokedexAreaScreen->areaGlowTilemap[j + 1] != GLOW_FULL)\n                    sPokedexAreaScreen->areaGlowTilemap[j + 1] |= GLOW_EDGE_R;\n                if (y != 0 && sPokedexAreaScreen->areaGlowTilemap[j - AREA_SCREEN_WIDTH] != GLOW_FULL)\n                    sPokedexAreaScreen->areaGlowTilemap[j - AREA_SCREEN_WIDTH] |= GLOW_EDGE_T;\n                if (y != AREA_SCREEN_HEIGHT - 1 && sPokedexAreaScreen->areaGlowTilemap[j + AREA_SCREEN_WIDTH] != GLOW_FULL)\n                    sPokedexAreaScreen->areaGlowTilemap[j + AREA_SCREEN_WIDTH] |= GLOW_EDGE_B;\n\n                 \n                if (x != 0 && y != 0 && sPokedexAreaScreen->areaGlowTilemap[j - AREA_SCREEN_WIDTH - 1] != GLOW_FULL)\n                    sPokedexAreaScreen->areaGlowTilemap[j - AREA_SCREEN_WIDTH - 1] |= GLOW_CORNER_TL;\n                if (x != AREA_SCREEN_WIDTH - 1 && y != 0 && sPokedexAreaScreen->areaGlowTilemap[j - AREA_SCREEN_WIDTH + 1] != GLOW_FULL)\n                    sPokedexAreaScreen->areaGlowTilemap[j - AREA_SCREEN_WIDTH + 1] |= GLOW_CORNER_TR;\n                if (x != 0 && y != AREA_SCREEN_HEIGHT - 1 && sPokedexAreaScreen->areaGlowTilemap[j + AREA_SCREEN_WIDTH - 1] != GLOW_FULL)\n                    sPokedexAreaScreen->areaGlowTilemap[j + AREA_SCREEN_WIDTH - 1] |= GLOW_CORNER_BL;\n                if (x != AREA_SCREEN_WIDTH - 1 && y != AREA_SCREEN_HEIGHT - 1 && sPokedexAreaScreen->areaGlowTilemap[j + AREA_SCREEN_WIDTH + 1] != GLOW_FULL)\n                    sPokedexAreaScreen->areaGlowTilemap[j + AREA_SCREEN_WIDTH + 1] |= GLOW_CORNER_BR;\n            }\n\n            j++;\n        }\n    }\n\n     \n     \n    for (i = 0; i < ARRAY_COUNT(sPokedexAreaScreen->areaGlowTilemap); i++)\n    {\n        if (sPokedexAreaScreen->areaGlowTilemap[i] == GLOW_FULL)\n        {\n            sPokedexAreaScreen->areaGlowTilemap[i] = GLOW_TILE_FULL;\n            sPokedexAreaScreen->areaGlowTilemap[i] |= (GLOW_PALETTE << 12);\n        }\n        else if (sPokedexAreaScreen->areaGlowTilemap[i])\n        {\n             \n             \n            if (sPokedexAreaScreen->areaGlowTilemap[i] & GLOW_EDGE_L)\n                sPokedexAreaScreen->areaGlowTilemap[i] &= ~(GLOW_CORNER_TL | GLOW_CORNER_BL);\n            if (sPokedexAreaScreen->areaGlowTilemap[i] & GLOW_EDGE_R)\n                sPokedexAreaScreen->areaGlowTilemap[i] &= ~(GLOW_CORNER_TR | GLOW_CORNER_BR);\n            if (sPokedexAreaScreen->areaGlowTilemap[i] & GLOW_EDGE_T)\n                sPokedexAreaScreen->areaGlowTilemap[i] &= ~(GLOW_CORNER_TR | GLOW_CORNER_TL);\n            if (sPokedexAreaScreen->areaGlowTilemap[i] & GLOW_EDGE_B)\n                sPokedexAreaScreen->areaGlowTilemap[i] &= ~(GLOW_CORNER_BR | GLOW_CORNER_BL);\n\n             \n            sPokedexAreaScreen->areaGlowTilemap[i] = sAreaGlowTilemapMapping[sPokedexAreaScreen->areaGlowTilemap[i]];\n            sPokedexAreaScreen->areaGlowTilemap[i] |= (GLOW_PALETTE << 12);\n        }\n    }",
  },
  "CreateAreaMarkerSprites": {
    returnType: "static void",
    params: "void",
    callsTo: ["CreateSprite","LoadSpritePalette","LoadSpriteSheet"],
    lineCount: 24,
    bodyC: "u8 spriteId;\n    static s16 x;\n    static s16 y;\n    static s16 i;\n    static mapsec_s16_t mapSecId;\n    static s16 numSprites;\n\n    LoadSpriteSheet(&sAreaMarkerSpriteSheet);\n    LoadSpritePalette(&sAreaMarkerSpritePalette);\n    numSprites = 0;\n    for (i = 0; i < sPokedexAreaScreen->numSpecialAreas; i++)\n    {\n        mapSecId = sPokedexAreaScreen->specialAreaRegionMapSectionIds[i];\n        x = 8 * (gRegionMapEntries[mapSecId].x + 1) + 4;\n        y = 8 * (gRegionMapEntries[mapSecId].y) + 28;\n        x += 4 * (gRegionMapEntries[mapSecId].width - 1);\n        y += 4 * (gRegionMapEntries[mapSecId].height - 1);\n        spriteId = CreateSprite(&sAreaMarkerSpriteTemplate, x, y, 0);\n        if (spriteId != MAX_SPRITES)\n        {\n            gSprites[spriteId].invisible = TRUE;\n            sPokedexAreaScreen->areaMarkerSprites[numSprites++] = &gSprites[spriteId];\n        }\n    }\n\n    sPokedexAreaScreen->numAreaMarkerSprites = numSprites;",
  },
  "CreateAreaUnknownSprites": {
    returnType: "static void",
    params: "void",
    callsTo: ["ARRAY_COUNT","CreateSprite"],
    lineCount: 22,
    bodyC: "u16 i;\n\n    if (sPokedexAreaScreen->numOverworldAreas || sPokedexAreaScreen->numSpecialAreas)\n    {\n         \n        for (i = 0; i < ARRAY_COUNT(sPokedexAreaScreen->areaUnknownSprites); i++)\n            sPokedexAreaScreen->areaUnknownSprites[i] = NULL;\n    }\n    else\n    {\n         \n        for (i = 0; i < ARRAY_COUNT(sPokedexAreaScreen->areaUnknownSprites); i++)\n        {\n            u8 spriteId = CreateSprite(&sAreaUnknownSpriteTemplate, i * 32 + 160, 140, 0);\n            if (spriteId != MAX_SPRITES)\n            {\n                gSprites[spriteId].oam.tileNum += i * 16;\n                sPokedexAreaScreen->areaUnknownSprites[i] = &gSprites[spriteId];\n            }\n            else\n            {\n                 \n                sPokedexAreaScreen->areaUnknownSprites[i] = NULL;\n            }\n        }\n    }",
  },
  "DestroyAreaScreenSprites": {
    returnType: "static void",
    params: "void",
    callsTo: ["ARRAY_COUNT","DestroySprite","FreeSpritePaletteByTag","FreeSpriteTilesByTag"],
    lineCount: 12,
    bodyC: "u16 i;\n\n     \n    FreeSpriteTilesByTag(TAG_AREA_MARKER);\n    FreeSpritePaletteByTag(TAG_AREA_MARKER);\n    for (i = 0; i < sPokedexAreaScreen->numAreaMarkerSprites; i++)\n        DestroySprite(sPokedexAreaScreen->areaMarkerSprites[i]);\n\n     \n    FreeSpriteTilesByTag(TAG_AREA_UNKNOWN);\n    FreeSpritePaletteByTag(TAG_AREA_UNKNOWN);\n    for (i = 0; i < ARRAY_COUNT(sPokedexAreaScreen->areaUnknownSprites); i++)\n    {\n        if (sPokedexAreaScreen->areaUnknownSprites[i])\n            DestroySprite(sPokedexAreaScreen->areaUnknownSprites[i]);\n    }",
  },
  "DoAreaGlow": {
    returnType: "static void",
    params: "void",
    callsTo: ["BLDALPHA_BLEND","SetGpuReg"],
    lineCount: 42,
    bodyC: "u16 x, y;\n    u16 i;\n\n    if (!sPokedexAreaScreen->showingMarkers)\n    {\n         \n        if (sPokedexAreaScreen->markerTimer == 0)\n        {\n            sPokedexAreaScreen->glowTimer++;\n            if (sPokedexAreaScreen->glowTimer & 1)\n                sPokedexAreaScreen->areaShadeBldArgLo = (sPokedexAreaScreen->areaShadeBldArgLo + 4) & 0x7f;\n            else\n                sPokedexAreaScreen->areaShadeBldArgHi = (sPokedexAreaScreen->areaShadeBldArgHi + 4) & 0x7f;\n\n            x = gSineTable[sPokedexAreaScreen->areaShadeBldArgLo] >> 4;\n            y = gSineTable[sPokedexAreaScreen->areaShadeBldArgHi] >> 4;\n            SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(x, y));\n            sPokedexAreaScreen->markerTimer = 0;\n            if (sPokedexAreaScreen->glowTimer == 64)\n            {\n                 \n                sPokedexAreaScreen->glowTimer = 0;\n                if (sPokedexAreaScreen->numSpecialAreas != 0)\n                    sPokedexAreaScreen->showingMarkers = TRUE;\n            }\n        }\n        else\n            sPokedexAreaScreen->markerTimer--;\n    }\n    else\n    {\n         \n        sPokedexAreaScreen->markerTimer++;\n        if (sPokedexAreaScreen->markerTimer > 12)\n        {\n            sPokedexAreaScreen->markerTimer = 0;\n\n             \n             \n            sPokedexAreaScreen->markerFlashCounter++;\n            for (i = 0; i < sPokedexAreaScreen->numSpecialAreas; i++)\n                sPokedexAreaScreen->areaMarkerSprites[i]->invisible = sPokedexAreaScreen->markerFlashCounter & 1;\n\n            if (sPokedexAreaScreen->markerFlashCounter > 4)\n            {\n                 \n                sPokedexAreaScreen->markerFlashCounter = 1;\n                if (sPokedexAreaScreen->numOverworldAreas != 0)\n                    sPokedexAreaScreen->showingMarkers = FALSE;\n            }\n        }\n    }",
  },
  "DrawAreaGlow": {
    returnType: "static bool8",
    params: "void",
    callsTo: ["BG_PLTT_ID","BuildAreaGlowTilemap","ChangeBgY","CpuCopy32","DecompressAndCopyTileDataToVram","FindMapsWithMon","FreeTempTileDataBuffersIfPossible","LoadBgTilemap"],
    lineCount: 27,
    bodyC: "switch (sPokedexAreaScreen->drawAreaGlowState)\n    {\n    case 0:\n        FindMapsWithMon(sPokedexAreaScreen->species);\n        break;\n    case 1:\n        BuildAreaGlowTilemap();\n        break;\n    case 2:\n        DecompressAndCopyTileDataToVram(2, sAreaGlow_Gfx, 0, 0, 0);\n        LoadBgTilemap(2, sPokedexAreaScreen->areaGlowTilemap, sizeof(sPokedexAreaScreen->areaGlowTilemap), 0);\n        break;\n    case 3:\n        if (!FreeTempTileDataBuffersIfPossible())\n        {\n            CpuCopy32(sAreaGlow_Pal, &gPlttBufferUnfaded[BG_PLTT_ID(GLOW_PALETTE)], sizeof(sAreaGlow_Pal));\n            sPokedexAreaScreen->drawAreaGlowState++;\n        }\n        return TRUE;\n    case 4:\n        ChangeBgY(2, -BG_SCREEN_SIZE, BG_COORD_SET);\n        break;\n    default:\n        return FALSE;\n    }\n\n    sPokedexAreaScreen->drawAreaGlowState++;\n    return TRUE;",
  },
  "FindMapsWithMon": {
    returnType: "static void",
    params: "u16 species",
    callsTo: ["ARRAY_COUNT","GetRoamerLocation","MAP_GROUP","MapHasSpecies","Overworld_GetMapHeaderByGroupAndId","SetAreaHasMon","SetSpecialMapHasMon","VarGet"],
    lineCount: 63,
    bodyC: "u16 i;\n    struct Roamer *roamer;\n\n    sPokedexAreaScreen->alteringCaveCounter = 0;\n    sPokedexAreaScreen->alteringCaveId = VarGet(VAR_ALTERING_CAVE_WILD_SET);\n    if (sPokedexAreaScreen->alteringCaveId >= NUM_ALTERING_CAVE_TABLES)\n        sPokedexAreaScreen->alteringCaveId = 0;\n\n    roamer = &gSaveBlock1Ptr->roamer;\n    if (species != roamer->species)\n    {\n        sPokedexAreaScreen->numOverworldAreas = 0;\n        sPokedexAreaScreen->numSpecialAreas = 0;\n\n         \n         \n        for (i = 0; i < ARRAY_COUNT(sSpeciesHiddenFromAreaScreen); i++)\n        {\n            if (sSpeciesHiddenFromAreaScreen[i] == species)\n                return;\n        }\n\n         \n         \n         \n         \n        for (i = 0; sFeebasData[i][0] != NUM_SPECIES; i++)\n        {\n            if (species == sFeebasData[i][0])\n            {\n                switch (sFeebasData[i][1])\n                {\n                case MAP_GROUP_TOWNS_AND_ROUTES:\n                    SetAreaHasMon(sFeebasData[i][1], sFeebasData[i][2]);\n                    break;\n                case MAP_GROUP_DUNGEONS:\n                case MAP_GROUP_SPECIAL_AREA:\n                    SetSpecialMapHasMon(sFeebasData[i][1], sFeebasData[i][2]);\n                    break;\n                }\n            }\n        }\n\n         \n        for (i = 0; gWildMonHeaders[i].mapGroup != MAP_GROUP(MAP_UNDEFINED); i++)\n        {\n            if (MapHasSpecies(&gWildMonHeaders[i], species))\n            {\n                switch (gWildMonHeaders[i].mapGroup)\n                {\n                case MAP_GROUP_TOWNS_AND_ROUTES:\n                    SetAreaHasMon(gWildMonHeaders[i].mapGroup, gWildMonHeaders[i].mapNum);\n                    break;\n                case MAP_GROUP_DUNGEONS:\n                case MAP_GROUP_SPECIAL_AREA:\n                    SetSpecialMapHasMon(gWildMonHeaders[i].mapGroup, gWildMonHeaders[i].mapNum);\n                    break;\n                }\n            }\n        }\n    }\n    else\n    {\n         \n        sPokedexAreaScreen->numSpecialAreas = 0;\n        if (roamer->active)\n        {\n            GetRoamerLocation(&sPokedexAreaScreen->overworldAreasWithMons[0].mapGroup, &sPokedexAreaScreen->overworldAreasWithMons[0].mapNum);\n            sPokedexAreaScreen->overworldAreasWithMons[0].regionMapSectionId = Overworld_GetMapHeaderByGroupAndId(sPokedexAreaScreen->overworldAreasWithMons[0].mapGroup, sPokedexAreaScreen->overworldAreasWithMons[0].mapNum)->regionMapSectionId;\n            sPokedexAreaScreen->numOverworldAreas = 1;\n        }\n        else\n        {\n            sPokedexAreaScreen->numOverworldAreas = 0;\n        }\n    }",
  },
  "GetRegionMapSectionId": {
    returnType: "static mapsec_u16_t",
    params: "u8 mapGroup, u8 mapNum",
    callsTo: ["Overworld_GetMapHeaderByGroupAndId"],
    lineCount: 1,
    bodyC: "return Overworld_GetMapHeaderByGroupAndId(mapGroup, mapNum)->regionMapSectionId;",
  },
  "LoadAreaUnknownGraphics": {
    returnType: "static void",
    params: "void",
    callsTo: ["LZ77UnCompWram","LoadSpritePalette","LoadSpriteSheet"],
    lineCount: 8,
    bodyC: "struct SpriteSheet spriteSheet = {\n        .data = sPokedexAreaScreen->areaUnknownGraphicsBuffer,\n        .size = sizeof(sPokedexAreaScreen->areaUnknownGraphicsBuffer),\n        .tag = TAG_AREA_UNKNOWN,\n    };\n    LZ77UnCompWram(gPokedexAreaScreenAreaUnknown_Gfx, sPokedexAreaScreen->areaUnknownGraphicsBuffer);\n    LoadSpriteSheet(&spriteSheet);\n    LoadSpritePalette(&sAreaUnknownSpritePalette);",
  },
  "MapHasSpecies": {
    returnType: "static bool8",
    params: "const struct WildPokemonHeader *info, u16 species",
    callsTo: ["GetRegionMapSectionId","MonListHasSpecies"],
    lineCount: 19,
    bodyC: "if (GetRegionMapSectionId(info->mapGroup, info->mapNum) == MAPSEC_ALTERING_CAVE)\n    {\n        sPokedexAreaScreen->alteringCaveCounter++;\n        if (sPokedexAreaScreen->alteringCaveCounter != sPokedexAreaScreen->alteringCaveId + 1)\n            return FALSE;\n    }\n\n    if (MonListHasSpecies(info->landMonsInfo, species, LAND_WILD_COUNT))\n        return TRUE;\n    if (MonListHasSpecies(info->waterMonsInfo, species, WATER_WILD_COUNT))\n        return TRUE;\n \n \n#ifdef BUGFIX\n    if (MonListHasSpecies(info->fishingMonsInfo, species, FISH_WILD_COUNT))\n#else\n    if (MonListHasSpecies(info->fishingMonsInfo, species, LAND_WILD_COUNT))\n#endif\n        return TRUE;\n    if (MonListHasSpecies(info->rockSmashMonsInfo, species, ROCK_WILD_COUNT))\n        return TRUE;\n    return FALSE;",
  },
  "MonListHasSpecies": {
    returnType: "static bool8",
    params: "const struct WildPokemonInfo *info, u16 species, u16 size",
    lineCount: 10,
    bodyC: "u16 i;\n    if (info != NULL)\n    {\n        for (i = 0; i < size; i++)\n        {\n            if (info->wildPokemon[i].species == species)\n                return TRUE;\n        }\n    }\n    return FALSE;",
  },
  "ResetDrawAreaGlowState": {
    returnType: "static void",
    params: "void",
    lineCount: 1,
    bodyC: "sPokedexAreaScreen->drawAreaGlowState = 0;",
  },
  "ResetPokedexAreaMapBg": {
    returnType: "static void",
    params: "void",
    callsTo: ["SetBgAttribute"],
    lineCount: 2,
    bodyC: "SetBgAttribute(3, BG_ATTR_CHARBASEINDEX, 0);\n    SetBgAttribute(3, BG_ATTR_PALETTEMODE, 0);",
  },
  "SetAreaHasMon": {
    returnType: "static void",
    params: "u16 mapGroup, u16 mapNum",
    callsTo: ["CorrectSpecialMapSecId","Overworld_GetMapHeaderByGroupAndId"],
    lineCount: 7,
    bodyC: "if (sPokedexAreaScreen->numOverworldAreas < MAX_AREA_HIGHLIGHTS)\n    {\n        sPokedexAreaScreen->overworldAreasWithMons[sPokedexAreaScreen->numOverworldAreas].mapGroup = mapGroup;\n        sPokedexAreaScreen->overworldAreasWithMons[sPokedexAreaScreen->numOverworldAreas].mapNum = mapNum;\n        sPokedexAreaScreen->overworldAreasWithMons[sPokedexAreaScreen->numOverworldAreas].regionMapSectionId = CorrectSpecialMapSecId(Overworld_GetMapHeaderByGroupAndId(mapGroup, mapNum)->regionMapSectionId);\n        sPokedexAreaScreen->numOverworldAreas++;\n    }",
  },
  "SetSpecialMapHasMon": {
    returnType: "static void",
    params: "u16 mapGroup, u16 mapNum",
    callsTo: ["ARRAY_COUNT","FlagGet","GetRegionMapSectionId"],
    lineCount: 28,
    bodyC: "int i;\n\n    if (sPokedexAreaScreen->numSpecialAreas < MAX_AREA_MARKERS)\n    {\n        mapsec_u16_t regionMapSectionId = GetRegionMapSectionId(mapGroup, mapNum);\n        if (regionMapSectionId < MAPSEC_NONE)\n        {\n             \n            for (i = 0; i < ARRAY_COUNT(sMovingRegionMapSections); i++)\n            {\n                if (regionMapSectionId == sMovingRegionMapSections[i])\n                    return;\n            }\n\n             \n            for (i = 0; sLandmarkData[i][0] != MAPSEC_NONE; i++)\n            {\n                if (regionMapSectionId == sLandmarkData[i][0] && !FlagGet(sLandmarkData[i][1]))\n                    return;\n            }\n\n             \n            for (i = 0; i < sPokedexAreaScreen->numSpecialAreas; i++)\n            {\n                if (sPokedexAreaScreen->specialAreaRegionMapSectionIds[i] == regionMapSectionId)\n                    break;\n            }\n\n            if (i == sPokedexAreaScreen->numSpecialAreas)\n            {\n                 \n                sPokedexAreaScreen->specialAreaRegionMapSectionIds[i] = regionMapSectionId;\n                sPokedexAreaScreen->numSpecialAreas++;\n            }\n        }\n    }",
  },
  "ShowPokedexAreaScreen": {
    returnType: "void",
    params: "u16 species, u8 *screenSwitchState",
    callsTo: ["AllocZeroed","CreateTask"],
    lineCount: 7,
    bodyC: "u8 taskId;\n\n    sPokedexAreaScreen = AllocZeroed(sizeof(*sPokedexAreaScreen));\n    sPokedexAreaScreen->species = species;\n    sPokedexAreaScreen->screenSwitchState = screenSwitchState;\n    screenSwitchState[0] = 0;\n    taskId = CreateTask(Task_ShowPokedexAreaScreen, 0);\n    gTasks[taskId].tState = 0;",
  },
  "StartAreaGlow": {
    returnType: "static void",
    params: "void",
    callsTo: ["BLDALPHA_BLEND","DoAreaGlow","SetGpuReg"],
    lineCount: 12,
    bodyC: "if (sPokedexAreaScreen->numSpecialAreas && sPokedexAreaScreen->numOverworldAreas == 0)\n        sPokedexAreaScreen->showingMarkers = TRUE;\n    else\n        sPokedexAreaScreen->showingMarkers = FALSE;\n\n    sPokedexAreaScreen->markerTimer = 0;\n    sPokedexAreaScreen->glowTimer = 0;\n    sPokedexAreaScreen->areaShadeBldArgLo = 0;\n    sPokedexAreaScreen->areaShadeBldArgHi = 64;\n    sPokedexAreaScreen->markerFlashCounter = 1;\n    SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG2 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_ALL);\n    SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(0, 16));\n    DoAreaGlow();",
  },
  "Task_HandlePokedexAreaScreenInput": {
    returnType: "static void",
    params: "u8 taskId",
    callsTo: ["BeginNormalPaletteFade","DestroyAreaScreenSprites","DestroyTask","DoAreaGlow","FREE_AND_SET_NULL","FreePokedexAreaMapBgNum","JOY_NEW","PlaySE","ResetPokedexAreaMapBg"],
    lineCount: 38,
    bodyC: "DoAreaGlow();\n    switch (gTasks[taskId].tState)\n    {\n    default:\n        gTasks[taskId].tState = 0;\n         \n    case 0:\n        if (gPaletteFade.active)\n            return;\n        break;\n    case 1:\n        if (JOY_NEW(B_BUTTON))\n        {\n            gTasks[taskId].data[1] = 1;\n            PlaySE(SE_PC_OFF);\n        }\n        else if (JOY_NEW(DPAD_RIGHT) || (JOY_NEW(R_BUTTON) && gSaveBlock2Ptr->optionsButtonMode == OPTIONS_BUTTON_MODE_LR))\n        {\n            gTasks[taskId].data[1] = 2;\n            PlaySE(SE_DEX_PAGE);\n        }\n        else\n            return;\n        break;\n    case 2:\n        BeginNormalPaletteFade(PALETTES_ALL & ~(0x14), 0, 0, 16, RGB_BLACK);\n        break;\n    case 3:\n        if (gPaletteFade.active)\n            return;\n        DestroyAreaScreenSprites();\n        sPokedexAreaScreen->screenSwitchState[0] = gTasks[taskId].data[1];\n        ResetPokedexAreaMapBg();\n        DestroyTask(taskId);\n        FreePokedexAreaMapBgNum();\n        FREE_AND_SET_NULL(sPokedexAreaScreen);\n        return;\n    }\n\n    gTasks[taskId].tState++;",
  },
  "Task_ShowPokedexAreaScreen": {
    returnType: "static void",
    params: "u8 taskId",
    callsTo: ["BeginNormalPaletteFade","CreateAreaMarkerSprites","CreateAreaUnknownSprites","CreateRegionMapPlayerIcon","DrawAreaGlow","FreeAllSpritePalettes","HideBg","LoadAreaUnknownGraphics","LoadPokedexAreaMapGfx","PokedexAreaMapChangeBgY","PokedexAreaScreen_UpdateRegionMapVariablesAndVideoRegs","ResetDrawAreaGlowState","ResetSpriteData","SetBgAttribute","SetGpuReg","SetGpuRegBits","ShowBg","ShowRegionMapForPokedexAreaScreen","StartAreaGlow","StringFill","TryShowPokedexAreaMap"],
    lineCount: 56,
    bodyC: "switch (gTasks[taskId].tState)\n    {\n    case 0:\n        ResetSpriteData();\n        FreeAllSpritePalettes();\n        HideBg(3);\n        HideBg(2);\n        HideBg(0);\n        break;\n    case 1:\n        SetBgAttribute(3, BG_ATTR_CHARBASEINDEX, 3);\n        LoadPokedexAreaMapGfx(&sPokedexAreaMapTemplate);\n        StringFill(sPokedexAreaScreen->charBuffer, CHAR_SPACE, 16);\n        break;\n    case 2:\n        if (TryShowPokedexAreaMap() == TRUE)\n            return;\n        PokedexAreaMapChangeBgY(-8);\n        break;\n    case 3:\n        ResetDrawAreaGlowState();\n        break;\n    case 4:\n        if (DrawAreaGlow())\n            return;\n        break;\n    case 5:\n        ShowRegionMapForPokedexAreaScreen(&sPokedexAreaScreen->regionMap);\n        CreateRegionMapPlayerIcon(1, 1);\n        PokedexAreaScreen_UpdateRegionMapVariablesAndVideoRegs(0, -8);\n        break;\n    case 6:\n        CreateAreaMarkerSprites();\n        break;\n    case 7:\n        LoadAreaUnknownGraphics();\n        break;\n    case 8:\n        CreateAreaUnknownSprites();\n        break;\n    case 9:\n        BeginNormalPaletteFade(PALETTES_ALL & ~(0x14), 0, 16, 0, RGB_BLACK);\n        break;\n    case 10:\n        SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG0 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_BG0 | BLDCNT_TGT2_ALL);\n        StartAreaGlow();\n        ShowBg(2);\n        ShowBg(3);  \n        SetGpuRegBits(REG_OFFSET_DISPCNT, DISPCNT_OBJ_ON);\n        break;\n    case 11:\n        gTasks[taskId].func = Task_HandlePokedexAreaScreenInput;\n        gTasks[taskId].tState = 0;\n        return;\n    }\n\n    gTasks[taskId].tState++;",
  },
} as const;
