// AUTO-GENERATED from src/dewford_trend.c by extract-engine-helpers.mjs
// Do not edit — re-run `node scripts/extract-engine-helpers.mjs` to refresh.
//
// Generated: 2026-04-27
// Functions: 13

export const ENGINE_FUNCTIONS = {
  "BufferTrendyPhraseString": {
    returnType: "void",
    params: "void",
    callsTo: ["ConvertEasyChatWordsToString"],
    lineCount: 2,
    bodyC: "struct DewfordTrend *trend = &gSaveBlock1Ptr->dewfordTrends[gSpecialVar_0x8004];\n    ConvertEasyChatWordsToString(gStringVar1, trend->words, 2, 1);",
  },
  "CompareTrends": {
    returnType: "static bool8",
    params: "struct DewfordTrend *a, struct DewfordTrend *b, u8 mode",
    callsTo: ["Random"],
    lineCount: 28,
    bodyC: "switch (mode)\n    {\n    case SORT_MODE_NORMAL:\n        if (a->trendiness > b->trendiness) return TRUE;\n        if (a->trendiness < b->trendiness) return FALSE;\n\n        if (a->maxTrendiness > b->maxTrendiness) return TRUE;\n        if (a->maxTrendiness < b->maxTrendiness) return FALSE;\n        break;\n    case SORT_MODE_MAX_FIRST:  \n        if (a->maxTrendiness > b->maxTrendiness) return TRUE;\n        if (a->maxTrendiness < b->maxTrendiness) return FALSE;\n\n        if (a->trendiness > b->trendiness) return TRUE;\n        if (a->trendiness < b->trendiness) return FALSE;\n        break;\n    case SORT_MODE_FULL:\n        if (a->trendiness > b->trendiness) return TRUE;\n        if (a->trendiness < b->trendiness) return FALSE;\n\n        if (a->maxTrendiness > b->maxTrendiness) return TRUE;\n        if (a->maxTrendiness < b->maxTrendiness) return FALSE;\n\n        if (a->rand > b->rand) return TRUE;\n        if (a->rand < b->rand) return FALSE;\n\n        if (a->words[0] > b->words[0]) return TRUE;\n        if (a->words[0] < b->words[0]) return FALSE;\n\n        if (a->words[1] > b->words[1]) return TRUE;\n        if (a->words[1] < b->words[1]) return FALSE;\n        return TRUE;\n    }\n\n     \n     \n    return Random() & 1;",
  },
  "GetDewfordHallPaintingNameIndex": {
    returnType: "void",
    params: "void",
    lineCount: 1,
    bodyC: "gSpecialVar_Result = (gSaveBlock1Ptr->dewfordTrends[0].words[0] + gSaveBlock1Ptr->dewfordTrends[0].words[1]) & 7;",
  },
  "GetSavedTrendIndex": {
    returnType: "static s16",
    params: "struct DewfordTrend *savedTrends, struct DewfordTrend *trend, u16 numSaved",
    callsTo: ["IsEasyChatPairEqual"],
    lineCount: 8,
    bodyC: "s16 i;\n    for (i = 0; i < numSaved; i++)\n    {\n        if (IsEasyChatPairEqual(trend->words, savedTrends->words))\n            return i;\n        savedTrends++;\n    }\n    return -1;",
  },
  "InitDewfordTrend": {
    returnType: "void",
    params: "void",
    callsTo: ["GetRandomEasyChatWordFromGroup","Random","SeedTrendRng","SortTrends"],
    lineCount: 12,
    bodyC: "u16 i;\n\n    for (i = 0; i < SAVED_TRENDS_COUNT; i++)\n    {\n        gSaveBlock1Ptr->dewfordTrends[i].words[0] = GetRandomEasyChatWordFromGroup(EC_GROUP_CONDITIONS);\n\n        if (Random() & 1)\n            gSaveBlock1Ptr->dewfordTrends[i].words[1] = GetRandomEasyChatWordFromGroup(EC_GROUP_LIFESTYLE);\n        else\n            gSaveBlock1Ptr->dewfordTrends[i].words[1] = GetRandomEasyChatWordFromGroup(EC_GROUP_HOBBIES);\n\n        gSaveBlock1Ptr->dewfordTrends[i].gainingTrendiness = Random() & 1;\n        SeedTrendRng(&(gSaveBlock1Ptr->dewfordTrends[i]));\n    }\n    SortTrends(gSaveBlock1Ptr->dewfordTrends, SAVED_TRENDS_COUNT, SORT_MODE_NORMAL);",
  },
  "IsEasyChatPairEqual": {
    returnType: "static bool8",
    params: "u16 *words1, u16 *words2",
    lineCount: 7,
    bodyC: "u16 i;\n\n    for (i = 0; i < 2; i++)\n    {\n        if (*(words1++) != *(words2++))\n            return FALSE;\n    }\n    return TRUE;",
  },
  "IsPhraseInSavedTrends": {
    returnType: "static bool8",
    params: "u16 *phrase",
    callsTo: ["IsEasyChatPairEqual"],
    lineCount: 7,
    bodyC: "u16 i;\n\n    for (i = 0; i < SAVED_TRENDS_COUNT; i++)\n    {\n        if (IsEasyChatPairEqual(phrase, gSaveBlock1Ptr->dewfordTrends[i].words))\n            return TRUE;\n    }\n    return FALSE;",
  },
  "IsTrendyPhraseBoring": {
    returnType: "void",
    params: "void",
    lineCount: 12,
    bodyC: "bool16 result = FALSE;\n\n    do\n    {\n        if (gSaveBlock1Ptr->dewfordTrends[0].trendiness - gSaveBlock1Ptr->dewfordTrends[1].trendiness > 1)\n            break;\n        if (gSaveBlock1Ptr->dewfordTrends[0].gainingTrendiness)\n            break;\n        if (!gSaveBlock1Ptr->dewfordTrends[1].gainingTrendiness)\n            break;\n        result = TRUE;\n    } while (0);\n\n    gSpecialVar_Result = result;",
  },
  "ReceiveDewfordTrendData": {
    returnType: "void",
    params: "struct DewfordTrend *linkedTrends, size_t size, u8 unused",
    callsTo: ["Alloc","Free","GetLinkPlayerCount","GetSavedTrendIndex","SortTrends","memcpy"],
    lineCount: 41,
    bodyC: "u16 i, j, numTrends, players;\n    struct DewfordTrend *linkedTrendsBuffer, *savedTrendsBuffer, *src, *dst, *temp;\n\n     \n    if (!(linkedTrendsBuffer = Alloc(BUFFER_SIZE)))\n        return;\n\n     \n    if (!(savedTrendsBuffer = Alloc(BUFFER_SIZE)))\n    {\n        Free(linkedTrendsBuffer);\n        return;\n    }\n\n     \n    players = GetLinkPlayerCount();\n    for (i = 0; i < players; i++)\n        memcpy(&linkedTrendsBuffer[i * SAVED_TRENDS_COUNT], (u8 *)linkedTrends + i * size, SAVED_TRENDS_SIZE);\n\n     \n     \n     \n    src = linkedTrendsBuffer;\n    dst = savedTrendsBuffer;\n    numTrends = 0;\n    for (i = 0; i < players; i++)\n    {\n        for (j = 0; j < SAVED_TRENDS_COUNT; j++)\n        {\n            s16 idx = GetSavedTrendIndex(savedTrendsBuffer, src, numTrends);\n            if (idx < 0)\n            {\n                 \n                *(dst++) = *src;\n                numTrends++;\n            }\n            else\n            {\n                 \n                 \n                temp = &savedTrendsBuffer[idx];\n                if (temp->trendiness < src->trendiness)\n                    *temp = *src;\n            }\n            src++;\n        }\n    }\n    SortTrends(savedTrendsBuffer, numTrends, SORT_MODE_FULL);\n\n     \n    src = savedTrendsBuffer;\n    dst = gSaveBlock1Ptr->dewfordTrends;\n    for (i = 0; i < SAVED_TRENDS_COUNT; i++)\n        *(dst++) = *(src++);\n\n    Free(linkedTrendsBuffer);\n    Free(savedTrendsBuffer);",
  },
  "SeedTrendRng": {
    returnType: "static void",
    params: "struct DewfordTrend *trend",
    callsTo: ["Random"],
    lineCount: 11,
    bodyC: "u16 rand;\n\n    rand = Random() % 98;\n    if (rand > 50)\n    {\n        rand = Random() % 98;\n        if (rand > 80)\n            rand = Random() % 98;\n    }\n    trend->maxTrendiness = rand + 30;\n    trend->trendiness = (Random() % (rand + 1)) + 30;\n    trend->rand = Random();",
  },
  "SortTrends": {
    returnType: "static void",
    params: "struct DewfordTrend *trends, u16 numTrends, u8 mode",
    callsTo: ["CompareTrends","SWAP"],
    lineCount: 13,
    bodyC: "u16 i;\n    for (i = 0; i < numTrends; i++)\n    {\n        u16 j;\n        for (j = i + 1; j < numTrends; j++)\n        {\n            if (CompareTrends(&trends[j], &trends[i], mode))\n            {\n                struct DewfordTrend temp;\n                SWAP(trends[j], trends[i], temp);\n            }\n        }\n    }",
  },
  "TrySetTrendyPhrase": {
    returnType: "bool8",
    params: "u16 *phrase",
    callsTo: ["CompareTrends","FlagGet","FlagSet","IsPhraseInSavedTrends","SeedTrendRng","TryPutTrendWatcherOnAir"],
    lineCount: 38,
    bodyC: "struct DewfordTrend trend = {0};\n    u16 i;\n\n    if (!IsPhraseInSavedTrends(phrase))\n    {\n        if (!FlagGet(FLAG_SYS_CHANGED_DEWFORD_TREND))\n        {\n            FlagSet(FLAG_SYS_CHANGED_DEWFORD_TREND);\n\n             \n            if (!FlagGet(FLAG_SYS_MIX_RECORD))\n            {\n                 \n                 \n                gSaveBlock1Ptr->dewfordTrends[0].words[0] = phrase[0];\n                gSaveBlock1Ptr->dewfordTrends[0].words[1] = phrase[1];\n                return TRUE;\n            }\n        }\n\n         \n        trend.words[0] = phrase[0];\n        trend.words[1] = phrase[1];\n        trend.gainingTrendiness = TRUE;\n        SeedTrendRng(&trend);\n\n        for (i = 0; i < SAVED_TRENDS_COUNT; i++)\n        {\n            if (CompareTrends(&trend, &(gSaveBlock1Ptr->dewfordTrends[i]), SORT_MODE_NORMAL))\n            {\n                 \n                 \n                u16 j = SAVED_TRENDS_COUNT - 1;\n                while (j > i)\n                {\n                    gSaveBlock1Ptr->dewfordTrends[j] = gSaveBlock1Ptr->dewfordTrends[j - 1];\n                    j--;\n                }\n                gSaveBlock1Ptr->dewfordTrends[i] = trend;\n\n                if (i == SAVED_TRENDS_COUNT - 1)\n                    TryPutTrendWatcherOnAir(phrase);\n\n                 \n                return (i == 0);\n            }\n        }\n\n         \n        gSaveBlock1Ptr->dewfordTrends[SAVED_TRENDS_COUNT - 1] = trend;\n        TryPutTrendWatcherOnAir(phrase);\n    }\n    return FALSE;",
  },
  "UpdateDewfordTrendPerDay": {
    returnType: "void",
    params: "u16 days",
    callsTo: ["SortTrends"],
    lineCount: 42,
    bodyC: "u16 i;\n\n    if (days != 0)\n    {\n        u32 clockRand = days * 5;\n\n        for (i = 0; i < SAVED_TRENDS_COUNT; i++)\n        {\n            u32 trendiness;\n            u32 rand = clockRand;\n            struct DewfordTrend *trend = &gSaveBlock1Ptr->dewfordTrends[i];\n\n            if (!trend->gainingTrendiness)\n            {\n                 \n                 \n                if (trend->trendiness >= (u16)rand)\n                {\n                    trend->trendiness -= rand;\n                    if (trend->trendiness == 0)\n                        trend->gainingTrendiness = TRUE;\n                    continue;\n                }\n                rand -= trend->trendiness;\n                trend->trendiness = 0;\n                trend->gainingTrendiness = TRUE;\n            }\n\n            trendiness = trend->trendiness + rand;\n            if ((u16)trendiness > trend->maxTrendiness)\n            {\n                 \n                u32 newTrendiness = trendiness % trend->maxTrendiness;\n                trendiness = trendiness / trend->maxTrendiness;\n\n                trend->gainingTrendiness = trendiness ^ 1;\n                if (trend->gainingTrendiness)\n                    trend->trendiness = newTrendiness;\n                else\n                    trend->trendiness = trend->maxTrendiness - newTrendiness;\n            }\n            else\n            {\n                 \n                trend->trendiness = trendiness;\n\n                 \n                if (trend->trendiness == trend->maxTrendiness)\n                    trend->gainingTrendiness = FALSE;\n            }\n        }\n        SortTrends(gSaveBlock1Ptr->dewfordTrends, SAVED_TRENDS_COUNT, SORT_MODE_NORMAL);\n    }",
  },
} as const;
