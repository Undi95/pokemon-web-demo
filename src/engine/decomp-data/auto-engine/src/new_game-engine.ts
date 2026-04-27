// AUTO-GENERATED from src/new_game.c by extract-engine-helpers.mjs
// Do not edit — re-run `node scripts/extract-engine-helpers.mjs` to refresh.
//
// Generated: 2026-04-27
// Functions: 13

export const ENGINE_FUNCTIONS = {
  "ClearAllContestWinnerPics": {
    returnType: "void",
    params: "void",
    callsTo: ["ClearContestWinnerPicsInContestHall"],
    lineCount: 4,
    bodyC: "s32 i;\n\n    ClearContestWinnerPicsInContestHall();\n\n     \n    for (i = MUSEUM_CONTEST_WINNERS_START; i < NUM_CONTEST_WINNERS; i++)\n        gSaveBlock1Ptr->contestWinners[i] = sContestWinnerPicDummy;",
  },
  "ClearFrontierRecord": {
    returnType: "static void",
    params: "void",
    callsTo: ["CpuFill32"],
    lineCount: 3,
    bodyC: "CpuFill32(0, &gSaveBlock2Ptr->frontier, sizeof(gSaveBlock2Ptr->frontier));\n\n    gSaveBlock2Ptr->frontier.opponentNames[0][0] = EOS;\n    gSaveBlock2Ptr->frontier.opponentNames[1][0] = EOS;",
  },
  "ClearPokedexFlags": {
    returnType: "static void",
    params: "void",
    callsTo: ["memset"],
    lineCount: 3,
    bodyC: "gUnusedPokedexU8 = 0;\n    memset(&gSaveBlock2Ptr->pokedex.owned, 0, sizeof(gSaveBlock2Ptr->pokedex.owned));\n    memset(&gSaveBlock2Ptr->pokedex.seen, 0, sizeof(gSaveBlock2Ptr->pokedex.seen));",
  },
  "CopyTrainerId": {
    returnType: "void",
    params: "u8 *dst, u8 *src",
    lineCount: 3,
    bodyC: "s32 i;\n    for (i = 0; i < TRAINER_ID_LENGTH; i++)\n        dst[i] = src[i];",
  },
  "GetTrainerId": {
    returnType: "u32",
    params: "u8 *trainerId",
    lineCount: 1,
    bodyC: "return (trainerId[3] << 24) | (trainerId[2] << 16) | (trainerId[1] << 8) | (trainerId[0]);",
  },
  "InitPlayerTrainerId": {
    returnType: "static void",
    params: "void",
    callsTo: ["GetGeneratedTrainerIdLower","Random","SetTrainerId"],
    lineCount: 2,
    bodyC: "u32 trainerId = (Random() << 16) | GetGeneratedTrainerIdLower();\n    SetTrainerId(trainerId, gSaveBlock2Ptr->playerTrainerId);",
  },
  "NewGameInitData": {
    returnType: "void",
    params: "void",
    callsTo: ["ClearAllContestWinnerPics","ClearAllMail","ClearBag","ClearBerryTrees","ClearDecorationInventories","ClearFrontierRecord","ClearMysteryGift","ClearPlayerLinkBattleRecords","ClearPokeblocks","ClearPokedexFlags","ClearRankingHallRecords","ClearRoamerData","ClearRoamerLocationData","ClearSav1","ClearSecretBases","ClearTVShowData","InitDewfordTrend","InitEasyChatPhrases","InitEventData","InitLilycoveLady","InitLotadSizeRecord","InitMatchCallCounters","InitPlayerTrainerId","InitSeedotSizeRecord","InitUnionRoomChatRegisteredTexts","NewGameInitPCItems","PlayTimeCounter_Reset","ResetAllApprenticeData","ResetContestLinkResults","ResetFanClub","ResetGabbyAndTy","ResetGameStats","ResetLinkContestBoolean","ResetLotteryCorner","ResetMiniGamesRecords","ResetPokedex","ResetPokemonStorageSystem","ResetTrainerHillResults","RtcReset","RunScriptImmediately","SetCoins","SetMauvilleOldMan","SetMoney","WarpToTruck","WipeTrainerNameRecords","ZeroEnemyPartyMons","ZeroPlayerPartyMons"],
    lineCount: 55,
    bodyC: "if (gSaveFileStatus == SAVE_STATUS_EMPTY || gSaveFileStatus == SAVE_STATUS_CORRUPT)\n        RtcReset();\n\n    gDifferentSaveFile = TRUE;\n    gSaveBlock2Ptr->encryptionKey = 0;\n    ZeroPlayerPartyMons();\n    ZeroEnemyPartyMons();\n    ResetPokedex();\n    ClearFrontierRecord();\n    ClearSav1();\n    ClearAllMail();\n    gSaveBlock2Ptr->specialSaveWarpFlags = 0;\n    gSaveBlock2Ptr->gcnLinkFlags = 0;\n    InitPlayerTrainerId();\n    PlayTimeCounter_Reset();\n    ClearPokedexFlags();\n    InitEventData();\n    ClearTVShowData();\n    ResetGabbyAndTy();\n    ClearSecretBases();\n    ClearBerryTrees();\n    SetMoney(&gSaveBlock1Ptr->money, 3000);\n    SetCoins(0);\n    ResetLinkContestBoolean();\n    ResetGameStats();\n    ClearAllContestWinnerPics();\n    ClearPlayerLinkBattleRecords();\n    InitSeedotSizeRecord();\n    InitLotadSizeRecord();\n    gPlayerPartyCount = 0;\n    ZeroPlayerPartyMons();\n    ResetPokemonStorageSystem();\n    ClearRoamerData();\n    ClearRoamerLocationData();\n    gSaveBlock1Ptr->registeredItem = ITEM_NONE;\n    ClearBag();\n    NewGameInitPCItems();\n    ClearPokeblocks();\n    ClearDecorationInventories();\n    InitEasyChatPhrases();\n    SetMauvilleOldMan();\n    InitDewfordTrend();\n    ResetFanClub();\n    ResetLotteryCorner();\n    WarpToTruck();\n    RunScriptImmediately(EventScript_ResetAllMapFlags);\n    ResetMiniGamesRecords();\n    InitUnionRoomChatRegisteredTexts();\n    InitLilycoveLady();\n    ResetAllApprenticeData();\n    ClearRankingHallRecords();\n    InitMatchCallCounters();\n    ClearMysteryGift();\n    WipeTrainerNameRecords();\n    ResetTrainerHillResults();\n    ResetContestLinkResults();",
  },
  "ResetMenuAndMonGlobals": {
    returnType: "void",
    params: "void",
    callsTo: ["ResetBagScrollPositions","ResetPokeblockScrollPositions","ResetPokedexScrollPositions","ZeroEnemyPartyMons","ZeroPlayerPartyMons"],
    lineCount: 6,
    bodyC: "gDifferentSaveFile = FALSE;\n    ResetPokedexScrollPositions();\n    ZeroPlayerPartyMons();\n    ZeroEnemyPartyMons();\n    ResetBagScrollPositions();\n    ResetPokeblockScrollPositions();",
  },
  "ResetMiniGamesRecords": {
    returnType: "static void",
    params: "void",
    callsTo: ["CpuFill16","ResetPokemonJumpRecords","SetBerryPowder"],
    lineCount: 4,
    bodyC: "CpuFill16(0, &gSaveBlock2Ptr->berryCrush, sizeof(struct BerryCrush));\n    SetBerryPowder(&gSaveBlock2Ptr->berryCrush.berryPowderAmount, 0);\n    ResetPokemonJumpRecords();\n    CpuFill16(0, &gSaveBlock2Ptr->berryPick, sizeof(struct BerryPickingResults));",
  },
  "Sav2_ClearSetDefault": {
    returnType: "void",
    params: "void",
    callsTo: ["ClearSav2","SetDefaultOptions"],
    lineCount: 2,
    bodyC: "ClearSav2();\n    SetDefaultOptions();",
  },
  "SetDefaultOptions": {
    returnType: "static void",
    params: "void",
    lineCount: 6,
    bodyC: "gSaveBlock2Ptr->optionsTextSpeed = OPTIONS_TEXT_SPEED_MID;\n    gSaveBlock2Ptr->optionsWindowFrameType = 0;\n    gSaveBlock2Ptr->optionsSound = OPTIONS_SOUND_MONO;\n    gSaveBlock2Ptr->optionsBattleStyle = OPTIONS_BATTLE_STYLE_SHIFT;\n    gSaveBlock2Ptr->optionsBattleSceneOff = FALSE;\n    gSaveBlock2Ptr->regionMapZoom = FALSE;",
  },
  "SetTrainerId": {
    returnType: "void",
    params: "u32 trainerId, u8 *dst",
    lineCount: 4,
    bodyC: "dst[0] = trainerId;\n    dst[1] = trainerId >> 8;\n    dst[2] = trainerId >> 16;\n    dst[3] = trainerId >> 24;",
  },
  "WarpToTruck": {
    returnType: "static void",
    params: "void",
    callsTo: ["MAP_GROUP","MAP_NUM","SetWarpDestination","WarpIntoMap"],
    lineCount: 2,
    bodyC: "SetWarpDestination(MAP_GROUP(MAP_INSIDE_OF_TRUCK), MAP_NUM(MAP_INSIDE_OF_TRUCK), WARP_ID_NONE, -1, -1);\n    WarpIntoMap();",
  },
} as const;
