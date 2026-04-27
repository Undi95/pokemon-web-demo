// AUTO-GENERATED from src/safari_zone.c by extract-engine-helpers.mjs
// Do not edit — re-run `node scripts/extract-engine-helpers.mjs` to refresh.
//
// Generated: 2026-04-27
// Functions: 17

export const ENGINE_FUNCTIONS = {
  "CB2_EndSafariBattle": {
    returnType: "void",
    params: "void",
    callsTo: ["RunScriptImmediately","ScriptContext_SetupScript","ScriptContext_Stop","SetMainCallback2","WarpIntoMap"],
    lineCount: 20,
    bodyC: "sSafariZonePkblkUses += gBattleResults.pokeblockThrows;\n    if (gBattleOutcome == B_OUTCOME_CAUGHT)\n        sSafariZoneCaughtMons++;\n    if (gNumSafariBalls != 0)\n    {\n        SetMainCallback2(CB2_ReturnToField);\n    }\n    else if (gBattleOutcome == B_OUTCOME_NO_SAFARI_BALLS)\n    {\n        RunScriptImmediately(SafariZone_EventScript_OutOfBallsMidBattle);\n        WarpIntoMap();\n        gFieldCallback = FieldCB_ReturnToFieldNoScriptCheckMusic;\n        SetMainCallback2(CB2_LoadMap);\n    }\n    else if (gBattleOutcome == B_OUTCOME_CAUGHT)\n    {\n        ScriptContext_SetupScript(SafariZone_EventScript_OutOfBalls);\n        ScriptContext_Stop();\n        SetMainCallback2(CB2_ReturnToFieldContinueScriptPlayMapMusic);\n    }",
  },
  "ClearAllPokeblockFeeders": {
    returnType: "static void",
    params: "void",
    callsTo: ["memset"],
    lineCount: 1,
    bodyC: "memset(sPokeblockFeeders, 0, sizeof(sPokeblockFeeders));",
  },
  "ClearPokeblockFeeder": {
    returnType: "static void",
    params: "u8 index",
    callsTo: ["memset"],
    lineCount: 1,
    bodyC: "memset(&sPokeblockFeeders[index], 0, sizeof(struct PokeblockFeeder));",
  },
  "DecrementFeederStepCounters": {
    returnType: "static void",
    params: "void",
    callsTo: ["ClearPokeblockFeeder"],
    lineCount: 10,
    bodyC: "u8 i;\n\n    for (i = 0; i < NUM_POKEBLOCK_FEEDERS; i++)\n    {\n        if (sPokeblockFeeders[i].stepCounter != 0)\n        {\n            sPokeblockFeeders[i].stepCounter--;\n            if (sPokeblockFeeders[i].stepCounter == 0)\n                ClearPokeblockFeeder(i);\n        }\n    }",
  },
  "EnterSafariMode": {
    returnType: "void",
    params: "void",
    callsTo: ["ClearAllPokeblockFeeders","IncrementGameStat","SetSafariZoneFlag"],
    lineCount: 7,
    bodyC: "IncrementGameStat(GAME_STAT_ENTERED_SAFARI_ZONE);\n    SetSafariZoneFlag();\n    ClearAllPokeblockFeeders();\n    gNumSafariBalls = 30;\n    sSafariZoneStepCounter = 500;\n    sSafariZoneCaughtMons = 0;\n    sSafariZonePkblkUses = 0;",
  },
  "ExitSafariMode": {
    returnType: "void",
    params: "void",
    callsTo: ["ClearAllPokeblockFeeders","ResetSafariZoneFlag","TryPutSafariFanClubOnAir"],
    lineCount: 5,
    bodyC: "TryPutSafariFanClubOnAir(sSafariZoneCaughtMons, sSafariZonePkblkUses);\n    ResetSafariZoneFlag();\n    ClearAllPokeblockFeeders();\n    gNumSafariBalls = 0;\n    sSafariZoneStepCounter = 0;",
  },
  "GetInFrontFeederPokeblockAndSteps": {
    returnType: "bool8",
    params: "void",
    callsTo: ["ConvertIntToDecimalStringN","GetPokeblockFeederInFront"],
    lineCount: 9,
    bodyC: "GetPokeblockFeederInFront();\n\n    if (gSpecialVar_Result == 0xFFFF)\n    {\n        return FALSE;\n    }\n\n    ConvertIntToDecimalStringN(gStringVar2,\n        sPokeblockFeeders[gSpecialVar_Result].stepCounter,\n        STR_CONV_MODE_LEADING_ZEROS, 3);\n\n    return TRUE;",
  },
  "GetPokeblockFeederInFront": {
    returnType: "void",
    params: "void",
    callsTo: ["GetXYCoordsOneStepInFrontOfPlayer","StringCopy"],
    lineCount: 15,
    bodyC: "s16 x, y;\n    u16 i;\n\n    GetXYCoordsOneStepInFrontOfPlayer(&x, &y);\n\n    for (i = 0; i < NUM_POKEBLOCK_FEEDERS; i++)\n    {\n        if (gSaveBlock1Ptr->location.mapNum == sPokeblockFeeders[i].mapNum\n         && sPokeblockFeeders[i].x == x\n         && sPokeblockFeeders[i].y == y)\n        {\n            gSpecialVar_Result = i;\n            StringCopy(gStringVar1, gPokeblockNames[sPokeblockFeeders[i].pokeblock.color]);\n            return;\n        }\n    }\n\n    gSpecialVar_Result = -1;",
  },
  "GetPokeblockFeederWithinRange": {
    returnType: "void",
    params: "void",
    callsTo: ["PlayerGetDestCoords"],
    lineCount: 21,
    bodyC: "s16 x, y;\n    u16 i;\n\n    PlayerGetDestCoords(&x, &y);\n\n    for (i = 0; i < NUM_POKEBLOCK_FEEDERS; i++)\n    {\n        if (gSaveBlock1Ptr->location.mapNum == sPokeblockFeeders[i].mapNum)\n        {\n             \n            x -= sPokeblockFeeders[i].x;\n            y -= sPokeblockFeeders[i].y;\n            if (x < 0)\n                x *= -1;\n            if (y < 0)\n                y *= -1;\n            if ((x + y) <= 5)\n            {\n                gSpecialVar_Result = i;\n                return;\n            }\n        }\n    }\n\n    gSpecialVar_Result = -1;",
  },
  "GetSafariZoneFlag": {
    returnType: "bool32",
    params: "void",
    callsTo: ["FlagGet"],
    lineCount: 1,
    bodyC: "return FlagGet(FLAG_SYS_SAFARI_MODE);",
  },
  "ResetSafariZoneFlag": {
    returnType: "void",
    params: "void",
    callsTo: ["FlagClear"],
    lineCount: 1,
    bodyC: "FlagClear(FLAG_SYS_SAFARI_MODE);",
  },
  "SafariZoneActivatePokeblockFeeder": {
    returnType: "void",
    params: "u8 pkblId",
    callsTo: ["GetXYCoordsOneStepInFrontOfPlayer"],
    lineCount: 17,
    bodyC: "s16 x, y;\n    u8 i;\n\n    for (i = 0; i < NUM_POKEBLOCK_FEEDERS; i++)\n    {\n         \n        if (sPokeblockFeeders[i].mapNum == 0\n         && sPokeblockFeeders[i].x == 0\n         && sPokeblockFeeders[i].y == 0)\n        {\n             \n            GetXYCoordsOneStepInFrontOfPlayer(&x, &y);\n            sPokeblockFeeders[i].mapNum = gSaveBlock1Ptr->location.mapNum;\n            sPokeblockFeeders[i].pokeblock = gSaveBlock1Ptr->pokeblocks[pkblId];\n            sPokeblockFeeders[i].stepCounter = 100;\n            sPokeblockFeeders[i].x = x;\n            sPokeblockFeeders[i].y = y;\n            break;\n        }\n    }",
  },
  "SafariZoneGetActivePokeblock": {
    returnType: "struct Pokeblock *",
    params: "void",
    callsTo: ["GetPokeblockFeederWithinRange"],
    lineCount: 5,
    bodyC: "GetPokeblockFeederWithinRange();\n\n    if (gSpecialVar_Result == 0xFFFF)\n        return NULL;\n    else\n        return &sPokeblockFeeders[gSpecialVar_Result].pokeblock;",
  },
  "SafariZoneGetPokeblockInFront": {
    returnType: "struct Pokeblock *",
    params: "void",
    callsTo: ["GetPokeblockFeederInFront"],
    lineCount: 5,
    bodyC: "GetPokeblockFeederInFront();\n\n    if (gSpecialVar_Result == 0xFFFF)\n        return NULL;\n    else\n        return &sPokeblockFeeders[gSpecialVar_Result].pokeblock;",
  },
  "SafariZoneRetirePrompt": {
    returnType: "void",
    params: "void",
    callsTo: ["ScriptContext_SetupScript"],
    lineCount: 1,
    bodyC: "ScriptContext_SetupScript(SafariZone_EventScript_RetirePrompt);",
  },
  "SafariZoneTakeStep": {
    returnType: "bool8",
    params: "void",
    callsTo: ["DecrementFeederStepCounters","GetSafariZoneFlag","ScriptContext_SetupScript"],
    lineCount: 12,
    bodyC: "if (GetSafariZoneFlag() == FALSE)\n    {\n        return FALSE;\n    }\n\n    DecrementFeederStepCounters();\n    sSafariZoneStepCounter--;\n    if (sSafariZoneStepCounter == 0)\n    {\n        ScriptContext_SetupScript(SafariZone_EventScript_TimesUp);\n        return TRUE;\n    }\n    return FALSE;",
  },
  "SetSafariZoneFlag": {
    returnType: "void",
    params: "void",
    callsTo: ["FlagSet"],
    lineCount: 1,
    bodyC: "FlagSet(FLAG_SYS_SAFARI_MODE);",
  },
} as const;
