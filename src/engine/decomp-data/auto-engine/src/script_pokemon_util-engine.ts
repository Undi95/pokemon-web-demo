// AUTO-GENERATED from src/script_pokemon_util.c by extract-engine-helpers.mjs
// Do not edit — re-run `node scripts/extract-engine-helpers.mjs` to refresh.
//
// Generated: 2026-04-27
// Functions: 13

export const ENGINE_FUNCTIONS = {
  "CB2_ReturnFromChooseBattleFrontierParty": {
    returnType: "static void",
    params: "void",
    callsTo: ["SetMainCallback2"],
    lineCount: 10,
    bodyC: "switch (gSelectedOrderFromParty[0])\n    {\n    case 0:\n        gSpecialVar_Result = FALSE;\n        break;\n    default:\n        gSpecialVar_Result = TRUE;\n        break;\n    }\n\n    SetMainCallback2(CB2_ReturnToFieldContinueScriptPlayMapMusic);",
  },
  "CB2_ReturnFromChooseHalfParty": {
    returnType: "static void",
    params: "void",
    callsTo: ["SetMainCallback2"],
    lineCount: 10,
    bodyC: "switch (gSelectedOrderFromParty[0])\n    {\n    case 0:\n        gSpecialVar_Result = FALSE;\n        break;\n    default:\n        gSpecialVar_Result = TRUE;\n        break;\n    }\n\n    SetMainCallback2(CB2_ReturnToFieldContinueScriptPlayMapMusic);",
  },
  "CheckPartyMonHasHeldItem": {
    returnType: "static bool8",
    params: "u16 item",
    callsTo: ["GetMonData"],
    lineCount: 8,
    bodyC: "int i;\n\n    for(i = 0; i < PARTY_SIZE; i++)\n    {\n        u16 species = GetMonData(&gPlayerParty[i], MON_DATA_SPECIES_OR_EGG);\n        if (species != SPECIES_NONE && species != SPECIES_EGG && GetMonData(&gPlayerParty[i], MON_DATA_HELD_ITEM) == item)\n            return TRUE;\n    }\n    return FALSE;",
  },
  "ChooseHalfPartyForBattle": {
    returnType: "void",
    params: "void",
    callsTo: ["InitChooseHalfPartyForBattle","VarSet"],
    lineCount: 3,
    bodyC: "gMain.savedCallback = CB2_ReturnFromChooseHalfParty;\n    VarSet(VAR_FRONTIER_FACILITY, FACILITY_MULTI_OR_EREADER);\n    InitChooseHalfPartyForBattle(0);",
  },
  "ChoosePartyForBattleFrontier": {
    returnType: "void",
    params: "void",
    callsTo: ["InitChooseHalfPartyForBattle"],
    lineCount: 2,
    bodyC: "gMain.savedCallback = CB2_ReturnFromChooseBattleFrontierParty;\n    InitChooseHalfPartyForBattle(gSpecialVar_0x8004 + 1);",
  },
  "CreateScriptedWildMon": {
    returnType: "void",
    params: "u16 species, u8 level, u16 item",
    callsTo: ["CreateMon","SetMonData","ZeroEnemyPartyMons"],
    lineCount: 9,
    bodyC: "u8 heldItem[2];\n\n    ZeroEnemyPartyMons();\n    CreateMon(&gEnemyParty[0], species, level, USE_RANDOM_IVS, 0, 0, OT_ID_PLAYER_ID, 0);\n    if (item)\n    {\n        heldItem[0] = item;\n        heldItem[1] = item >> 8;\n        SetMonData(&gEnemyParty[0], MON_DATA_HELD_ITEM, heldItem);\n    }",
  },
  "DoesPartyHaveEnigmaBerry": {
    returnType: "bool8",
    params: "void",
    callsTo: ["CheckPartyMonHasHeldItem","GetBerryNameByBerryType","ItemIdToBerryType"],
    lineCount: 4,
    bodyC: "bool8 hasItem = CheckPartyMonHasHeldItem(ITEM_ENIGMA_BERRY);\n    if (hasItem == TRUE)\n        GetBerryNameByBerryType(ItemIdToBerryType(ITEM_ENIGMA_BERRY), gStringVar1);\n\n    return hasItem;",
  },
  "HasEnoughMonsForDoubleBattle": {
    returnType: "void",
    params: "void",
    callsTo: ["GetMonsStateToDoubles"],
    lineCount: 12,
    bodyC: "switch (GetMonsStateToDoubles())\n    {\n    case PLAYER_HAS_TWO_USABLE_MONS:\n        gSpecialVar_Result = PLAYER_HAS_TWO_USABLE_MONS;\n        break;\n    case PLAYER_HAS_ONE_MON:\n        gSpecialVar_Result = PLAYER_HAS_ONE_MON;\n        break;\n    case PLAYER_HAS_ONE_USABLE_MON:\n        gSpecialVar_Result = PLAYER_HAS_ONE_USABLE_MON;\n        break;\n    }",
  },
  "HealPlayerParty": {
    returnType: "void",
    params: "void",
    callsTo: ["CalculatePPWithBonus","GetMonData","SetMonData"],
    lineCount: 21,
    bodyC: "u8 i, j;\n    u8 ppBonuses;\n    u8 arg[4];\n\n     \n    for(i = 0; i < gPlayerPartyCount; i++)\n    {\n        u16 maxHP = GetMonData(&gPlayerParty[i], MON_DATA_MAX_HP);\n        arg[0] = maxHP;\n        arg[1] = maxHP >> 8;\n        SetMonData(&gPlayerParty[i], MON_DATA_HP, arg);\n        ppBonuses = GetMonData(&gPlayerParty[i], MON_DATA_PP_BONUSES);\n\n         \n        for(j = 0; j < MAX_MON_MOVES; j++)\n        {\n            arg[0] = CalculatePPWithBonus(GetMonData(&gPlayerParty[i], MON_DATA_MOVE1 + j), ppBonuses, j);\n            SetMonData(&gPlayerParty[i], MON_DATA_PP1 + j, arg);\n        }\n\n         \n        arg[0] = 0;\n        arg[1] = 0;\n        arg[2] = 0;\n        arg[3] = 0;\n        SetMonData(&gPlayerParty[i], MON_DATA_STATUS, arg);\n    }",
  },
  "ReducePlayerPartyToSelectedMons": {
    returnType: "void",
    params: "void",
    callsTo: ["CalculatePlayerPartyCount","CpuFill32"],
    lineCount: 10,
    bodyC: "struct Pokemon party[MAX_FRONTIER_PARTY_SIZE];\n    int i;\n\n    CpuFill32(0, party, sizeof party);\n\n     \n    for (i = 0; i < MAX_FRONTIER_PARTY_SIZE; i++)\n        if (gSelectedOrderFromParty[i])  \n            party[i] = gPlayerParty[gSelectedOrderFromParty[i] - 1];  \n\n    CpuFill32(0, gPlayerParty, sizeof gPlayerParty);\n\n     \n    for (i = 0; i < MAX_FRONTIER_PARTY_SIZE; i++)\n        gPlayerParty[i] = party[i];\n\n    CalculatePlayerPartyCount();",
  },
  "ScriptGiveEgg": {
    returnType: "u8",
    params: "u16 species",
    callsTo: ["CreateEgg","GiveMonToPlayer","SetMonData"],
    lineCount: 6,
    bodyC: "struct Pokemon mon;\n    u8 isEgg;\n\n    CreateEgg(&mon, species, TRUE);\n    isEgg = TRUE;\n    SetMonData(&mon, MON_DATA_IS_EGG, &isEgg);\n\n    return GiveMonToPlayer(&mon);",
  },
  "ScriptGiveMon": {
    returnType: "u8",
    params: "u16 species, u8 level, u16 item, u32 unused1, u32 unused2, u8 unused3",
    callsTo: ["CreateMon","GetSetPokedexFlag","GiveMonToPlayer","SetMonData","SpeciesToNationalPokedexNum"],
    lineCount: 19,
    bodyC: "u16 nationalDexNum;\n    int sentToPc;\n    u8 heldItem[2];\n    struct Pokemon mon;\n\n    CreateMon(&mon, species, level, USE_RANDOM_IVS, FALSE, 0, OT_ID_PLAYER_ID, 0);\n    heldItem[0] = item;\n    heldItem[1] = item >> 8;\n    SetMonData(&mon, MON_DATA_HELD_ITEM, heldItem);\n    sentToPc = GiveMonToPlayer(&mon);\n    nationalDexNum = SpeciesToNationalPokedexNum(species);\n\n     \n    switch(sentToPc)\n    {\n    case MON_GIVEN_TO_PARTY:\n    case MON_GIVEN_TO_PC:\n        GetSetPokedexFlag(nationalDexNum, FLAG_SET_SEEN);\n        GetSetPokedexFlag(nationalDexNum, FLAG_SET_CAUGHT);\n        break;\n    }\n    return sentToPc;",
  },
  "ScriptSetMonMoveSlot": {
    returnType: "void",
    params: "u8 monIndex, u16 move, u8 slot",
    callsTo: ["SetMonMoveSlot"],
    lineCount: 7,
    bodyC: "#ifdef BUGFIX\n    if (monIndex >= PARTY_SIZE)\n#else\n    if (monIndex > PARTY_SIZE)\n#endif\n        monIndex = gPlayerPartyCount - 1;\n\n    SetMonMoveSlot(&gPlayerParty[monIndex], move, slot);",
  },
} as const;
