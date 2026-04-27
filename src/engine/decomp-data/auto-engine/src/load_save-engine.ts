// AUTO-GENERATED from src/load_save.c by extract-engine-helpers.mjs
// Do not edit — re-run `node scripts/extract-engine-helpers.mjs` to refresh.
//
// Generated: 2026-04-27
// Functions: 21

export const ENGINE_FUNCTIONS = {
  "ApplyNewEncryptionKeyToAllEncryptedData": {
    returnType: "static void",
    params: "u32 encryptionKey",
    callsTo: ["ApplyNewEncryptionKeyToBagItems_","ApplyNewEncryptionKeyToBerryPowder","ApplyNewEncryptionKeyToGameStats","ApplyNewEncryptionKeyToHword","ApplyNewEncryptionKeyToWord"],
    lineCount: 5,
    bodyC: "ApplyNewEncryptionKeyToGameStats(encryptionKey);\n    ApplyNewEncryptionKeyToBagItems_(encryptionKey);\n    ApplyNewEncryptionKeyToBerryPowder(encryptionKey);\n    ApplyNewEncryptionKeyToWord(&gSaveBlock1Ptr->money, encryptionKey);\n    ApplyNewEncryptionKeyToHword(&gSaveBlock1Ptr->coins, encryptionKey);",
  },
  "ApplyNewEncryptionKeyToHword": {
    returnType: "void",
    params: "u16 *hWord, u32 newKey",
    lineCount: 2,
    bodyC: "*hWord ^= gSaveBlock2Ptr->encryptionKey;\n    *hWord ^= newKey;",
  },
  "ApplyNewEncryptionKeyToWord": {
    returnType: "void",
    params: "u32 *word, u32 newKey",
    lineCount: 2,
    bodyC: "*word ^= gSaveBlock2Ptr->encryptionKey;\n    *word ^= newKey;",
  },
  "CheckForFlashMemory": {
    returnType: "void",
    params: "void",
    callsTo: ["IdentifyFlash","InitFlashTimer"],
    lineCount: 9,
    bodyC: "if (!IdentifyFlash())\n    {\n        gFlashMemoryPresent = TRUE;\n        InitFlashTimer();\n    }\n    else\n    {\n        gFlashMemoryPresent = FALSE;\n    }",
  },
  "ClearContinueGameWarpStatus": {
    returnType: "void",
    params: "void",
    lineCount: 1,
    bodyC: "gSaveBlock2Ptr->specialSaveWarpFlags &= ~CONTINUE_GAME_WARP;",
  },
  "ClearContinueGameWarpStatus2": {
    returnType: "void",
    params: "void",
    lineCount: 1,
    bodyC: "gSaveBlock2Ptr->specialSaveWarpFlags &= ~CONTINUE_GAME_WARP;",
  },
  "ClearSav1": {
    returnType: "void",
    params: "void",
    callsTo: ["CpuFill16"],
    lineCount: 1,
    bodyC: "CpuFill16(0, &gSaveblock1, sizeof(struct SaveBlock1ASLR));",
  },
  "ClearSav2": {
    returnType: "void",
    params: "void",
    callsTo: ["CpuFill16"],
    lineCount: 1,
    bodyC: "CpuFill16(0, &gSaveblock2, sizeof(struct SaveBlock2ASLR));",
  },
  "CopyPartyAndObjectsFromSave": {
    returnType: "void",
    params: "void",
    callsTo: ["LoadObjectEvents","LoadPlayerParty"],
    lineCount: 2,
    bodyC: "LoadPlayerParty();\n    LoadObjectEvents();",
  },
  "CopyPartyAndObjectsToSave": {
    returnType: "void",
    params: "void",
    callsTo: ["SaveObjectEvents","SavePlayerParty"],
    lineCount: 2,
    bodyC: "SavePlayerParty();\n    SaveObjectEvents();",
  },
  "LoadObjectEvents": {
    returnType: "void",
    params: "void",
    lineCount: 3,
    bodyC: "int i;\n\n    for (i = 0; i < OBJECT_EVENTS_COUNT; i++)\n        gObjectEvents[i] = gSaveBlock1Ptr->objectEvents[i];",
  },
  "LoadPlayerBag": {
    returnType: "void",
    params: "void",
    lineCount: 14,
    bodyC: "int i;\n\n     \n    for (i = 0; i < BAG_ITEMS_COUNT; i++)\n        gLoadedSaveData.items[i] = gSaveBlock1Ptr->bagPocket_Items[i];\n\n     \n    for (i = 0; i < BAG_KEYITEMS_COUNT; i++)\n        gLoadedSaveData.keyItems[i] = gSaveBlock1Ptr->bagPocket_KeyItems[i];\n\n     \n    for (i = 0; i < BAG_POKEBALLS_COUNT; i++)\n        gLoadedSaveData.pokeBalls[i] = gSaveBlock1Ptr->bagPocket_PokeBalls[i];\n\n     \n    for (i = 0; i < BAG_TMHM_COUNT; i++)\n        gLoadedSaveData.TMsHMs[i] = gSaveBlock1Ptr->bagPocket_TMHM[i];\n\n     \n    for (i = 0; i < BAG_BERRIES_COUNT; i++)\n        gLoadedSaveData.berries[i] = gSaveBlock1Ptr->bagPocket_Berries[i];\n\n     \n    for (i = 0; i < MAIL_COUNT; i++)\n        gLoadedSaveData.mail[i] = gSaveBlock1Ptr->mail[i];\n\n    gLastEncryptionKey = gSaveBlock2Ptr->encryptionKey;",
  },
  "LoadPlayerParty": {
    returnType: "void",
    params: "void",
    lineCount: 4,
    bodyC: "int i;\n\n    gPlayerPartyCount = gSaveBlock1Ptr->playerPartyCount;\n\n    for (i = 0; i < PARTY_SIZE; i++)\n        gPlayerParty[i] = gSaveBlock1Ptr->playerParty[i];",
  },
  "MoveSaveBlocks_ResetHeap": {
    returnType: "void",
    params: "void",
    callsTo: ["ApplyNewEncryptionKeyToAllEncryptedData","InitHeap","Random","SetSaveBlocksPointers"],
    lineCount: 30,
    bodyC: "void *vblankCB, *hblankCB;\n    u32 encryptionKey;\n    struct SaveBlock2 *saveBlock2Copy;\n    struct SaveBlock1 *saveBlock1Copy;\n    struct PokemonStorage *pokemonStorageCopy;\n\n     \n    vblankCB = gMain.vblankCallback;\n    hblankCB = gMain.hblankCallback;\n    gMain.vblankCallback = NULL;\n    gMain.hblankCallback = NULL;\n    gTrainerHillVBlankCounter = NULL;\n\n    saveBlock2Copy = (struct SaveBlock2 *)(gHeap);\n    saveBlock1Copy = (struct SaveBlock1 *)(gHeap + sizeof(struct SaveBlock2));\n    pokemonStorageCopy = (struct PokemonStorage *)(gHeap + sizeof(struct SaveBlock2) + sizeof(struct SaveBlock1));\n\n     \n    *saveBlock2Copy = *gSaveBlock2Ptr;\n    *saveBlock1Copy = *gSaveBlock1Ptr;\n    *pokemonStorageCopy = *gPokemonStoragePtr;\n\n     \n     \n    SetSaveBlocksPointers(\n      saveBlock2Copy->playerTrainerId[0] +\n      saveBlock2Copy->playerTrainerId[1] +\n      saveBlock2Copy->playerTrainerId[2] +\n      saveBlock2Copy->playerTrainerId[3]);\n\n     \n    *gSaveBlock2Ptr = *saveBlock2Copy;\n    *gSaveBlock1Ptr = *saveBlock1Copy;\n    *gPokemonStoragePtr = *pokemonStorageCopy;\n\n     \n    InitHeap(gHeap, HEAP_SIZE);\n\n     \n    gMain.hblankCallback = hblankCB;\n    gMain.vblankCallback = vblankCB;\n\n     \n    encryptionKey = (Random() << 16) + (Random());\n    ApplyNewEncryptionKeyToAllEncryptedData(encryptionKey);\n    gSaveBlock2Ptr->encryptionKey = encryptionKey;",
  },
  "SaveObjectEvents": {
    returnType: "void",
    params: "void",
    lineCount: 3,
    bodyC: "int i;\n\n    for (i = 0; i < OBJECT_EVENTS_COUNT; i++)\n        gSaveBlock1Ptr->objectEvents[i] = gObjectEvents[i];",
  },
  "SavePlayerBag": {
    returnType: "void",
    params: "void",
    callsTo: ["ApplyNewEncryptionKeyToBagItems"],
    lineCount: 18,
    bodyC: "int i;\n    u32 encryptionKeyBackup;\n\n     \n    for (i = 0; i < BAG_ITEMS_COUNT; i++)\n        gSaveBlock1Ptr->bagPocket_Items[i] = gLoadedSaveData.items[i];\n\n     \n    for (i = 0; i < BAG_KEYITEMS_COUNT; i++)\n        gSaveBlock1Ptr->bagPocket_KeyItems[i] = gLoadedSaveData.keyItems[i];\n\n     \n    for (i = 0; i < BAG_POKEBALLS_COUNT; i++)\n        gSaveBlock1Ptr->bagPocket_PokeBalls[i] = gLoadedSaveData.pokeBalls[i];\n\n     \n    for (i = 0; i < BAG_TMHM_COUNT; i++)\n        gSaveBlock1Ptr->bagPocket_TMHM[i] = gLoadedSaveData.TMsHMs[i];\n\n     \n    for (i = 0; i < BAG_BERRIES_COUNT; i++)\n        gSaveBlock1Ptr->bagPocket_Berries[i] = gLoadedSaveData.berries[i];\n\n     \n    for (i = 0; i < MAIL_COUNT; i++)\n        gSaveBlock1Ptr->mail[i] = gLoadedSaveData.mail[i];\n\n    encryptionKeyBackup = gSaveBlock2Ptr->encryptionKey;\n    gSaveBlock2Ptr->encryptionKey = gLastEncryptionKey;\n    ApplyNewEncryptionKeyToBagItems(encryptionKeyBackup);\n    gSaveBlock2Ptr->encryptionKey = encryptionKeyBackup;",
  },
  "SavePlayerParty": {
    returnType: "void",
    params: "void",
    lineCount: 4,
    bodyC: "int i;\n\n    gSaveBlock1Ptr->playerPartyCount = gPlayerPartyCount;\n\n    for (i = 0; i < PARTY_SIZE; i++)\n        gSaveBlock1Ptr->playerParty[i] = gPlayerParty[i];",
  },
  "SetContinueGameWarpStatus": {
    returnType: "void",
    params: "void",
    lineCount: 1,
    bodyC: "gSaveBlock2Ptr->specialSaveWarpFlags |= CONTINUE_GAME_WARP;",
  },
  "SetContinueGameWarpStatusToDynamicWarp": {
    returnType: "void",
    params: "void",
    callsTo: ["SetContinueGameWarpToDynamicWarp"],
    lineCount: 2,
    bodyC: "SetContinueGameWarpToDynamicWarp(0);\n    gSaveBlock2Ptr->specialSaveWarpFlags |= CONTINUE_GAME_WARP;",
  },
  "SetSaveBlocksPointers": {
    returnType: "void",
    params: "u16 offset",
    callsTo: ["Random","SetBagItemsPointers","SetDecorationInventoriesPointers"],
    lineCount: 7,
    bodyC: "struct SaveBlock1 **sav1_LocalVar = &gSaveBlock1Ptr;\n\n    offset = (offset + Random()) & (SAVEBLOCK_MOVE_RANGE - 4);\n\n    gSaveBlock2Ptr = (void *)(&gSaveblock2) + offset;\n    *sav1_LocalVar = (void *)(&gSaveblock1) + offset;\n    gPokemonStoragePtr = (void *)(&gPokemonStorage) + offset;\n\n    SetBagItemsPointers();\n    SetDecorationInventoriesPointers();",
  },
  "UseContinueGameWarp": {
    returnType: "u32",
    params: "void",
    lineCount: 1,
    bodyC: "return gSaveBlock2Ptr->specialSaveWarpFlags & CONTINUE_GAME_WARP;",
  },
} as const;
