// AUTO-GENERATED from src/lottery_corner.c by extract-engine-helpers.mjs
// Do not edit — re-run `node scripts/extract-engine-helpers.mjs` to refresh.
//
// Generated: 2026-04-27
// Functions: 8

export const ENGINE_FUNCTIONS = {
  "GetLotteryNumber": {
    returnType: "u32",
    params: "void",
    callsTo: ["VarGet"],
    lineCount: 3,
    bodyC: "u16 highNum = VarGet(VAR_POKELOT_RND1);\n    u16 lowNum = VarGet(VAR_POKELOT_RND2);\n\n    return (lowNum << 16) | highNum;",
  },
  "GetMatchingDigits": {
    returnType: "static u8",
    params: "u16 winNumber, u16 otId",
    lineCount: 18,
    bodyC: "u8 i;\n    u8 matchingDigits = 0;\n\n    for (i = 0; i < 5; i++)\n    {\n        sWinNumberDigit = winNumber % 10;\n        sOtIdDigit = otId % 10;\n\n        if (sWinNumberDigit == sOtIdDigit)\n        {\n            winNumber = winNumber / 10;\n            otId = otId / 10;\n            matchingDigits++;\n        }\n        else\n        {\n            break;\n        }\n    }\n    return matchingDigits;",
  },
  "PickLotteryCornerTicket": {
    returnType: "void",
    params: "void",
    callsTo: ["GetBoxMonData","GetMatchingDigits","GetMonData","StringGet_Nickname"],
    lineCount: 62,
    bodyC: "u16 i;\n    u16 j;\n    u32 box;\n    u32 slot;\n\n    gSpecialVar_0x8004 = 0;\n    slot = 0;\n    box = 0;\n    for (i = 0; i < PARTY_SIZE; i++)\n    {\n        struct Pokemon *mon = &gPlayerParty[i];\n\n        if (GetMonData(mon, MON_DATA_SPECIES) != SPECIES_NONE)\n        {\n             \n            if (!GetMonData(mon, MON_DATA_IS_EGG))\n            {\n                u32 otId = GetMonData(mon, MON_DATA_OT_ID);\n                u8 numMatchingDigits = GetMatchingDigits(gSpecialVar_Result, otId);\n\n                if (numMatchingDigits > gSpecialVar_0x8004 && numMatchingDigits > 1)\n                {\n                    gSpecialVar_0x8004 = numMatchingDigits - 1;\n                    box = TOTAL_BOXES_COUNT;\n                    slot = i;\n                }\n            }\n        }\n        else  \n        {\n            break;\n        }\n    }\n\n    for (i = 0; i < TOTAL_BOXES_COUNT; i++)\n    {\n        for (j = 0; j < IN_BOX_COUNT; j++)\n        {\n            if (GetBoxMonData(&gPokemonStoragePtr->boxes[i][j], MON_DATA_SPECIES) != SPECIES_NONE &&\n            !GetBoxMonData(&gPokemonStoragePtr->boxes[i][j], MON_DATA_IS_EGG))\n            {\n                u32 otId = GetBoxMonData(&gPokemonStoragePtr->boxes[i][j], MON_DATA_OT_ID);\n                u8 numMatchingDigits = GetMatchingDigits(gSpecialVar_Result, otId);\n\n                if (numMatchingDigits > gSpecialVar_0x8004 && numMatchingDigits > 1)\n                {\n                    gSpecialVar_0x8004 = numMatchingDigits - 1;\n                    box = i;\n                    slot = j;\n                }\n            }\n        }\n    }\n\n    if (gSpecialVar_0x8004 != 0)\n    {\n        gSpecialVar_0x8005 = sLotteryPrizes[gSpecialVar_0x8004 - 1];\n\n        if (box == TOTAL_BOXES_COUNT)\n        {\n            gSpecialVar_0x8006 = 0;\n            GetMonData(&gPlayerParty[slot], MON_DATA_NICKNAME, gStringVar1);\n        }\n        else\n        {\n            gSpecialVar_0x8006 = 1;\n            GetBoxMonData(&gPokemonStoragePtr->boxes[box][slot], MON_DATA_NICKNAME, gStringVar1);\n        }\n        StringGet_Nickname(gStringVar1);\n    }",
  },
  "ResetLotteryCorner": {
    returnType: "void",
    params: "void",
    callsTo: ["Random","SetLotteryNumber","VarSet"],
    lineCount: 3,
    bodyC: "u16 rand = Random();\n\n    SetLotteryNumber((Random() << 16) | rand);\n    VarSet(VAR_POKELOT_PRIZE_ITEM, 0);",
  },
  "RetrieveLotteryNumber": {
    returnType: "void",
    params: "void",
    callsTo: ["GetLotteryNumber"],
    lineCount: 2,
    bodyC: "u16 lottoNumber = GetLotteryNumber();\n    gSpecialVar_Result = lottoNumber;",
  },
  "SetLotteryNumber": {
    returnType: "void",
    params: "u32 lotteryNum",
    callsTo: ["VarSet"],
    lineCount: 4,
    bodyC: "u16 lowNum = lotteryNum >> 16;\n    u16 highNum = lotteryNum;\n\n    VarSet(VAR_POKELOT_RND1, highNum);\n    VarSet(VAR_POKELOT_RND2, lowNum);",
  },
  "SetLotteryNumber16_Unused": {
    returnType: "void",
    params: "u16 lotteryNum",
    callsTo: ["SetLotteryNumber"],
    lineCount: 1,
    bodyC: "SetLotteryNumber(lotteryNum);",
  },
  "SetRandomLotteryNumber": {
    returnType: "void",
    params: "u16 i",
    callsTo: ["ISO_RANDOMIZE2","Random","SetLotteryNumber"],
    lineCount: 4,
    bodyC: "u32 var = Random();\n\n    while (--i != 0xFFFF)\n        var = ISO_RANDOMIZE2(var);\n\n    SetLotteryNumber(var);",
  },
} as const;
