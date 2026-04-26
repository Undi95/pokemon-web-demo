// AUTO-GENERATED from src/battle_controller_player_partner.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 6 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_GiveExpToMon": {
    callsTo: ["BATTLE_PARTNER","BtlController_EmitTwoReturnValues","CalculateMonStats","DestroyTask","GetMonData","IsDoubleBattle","SetMonData"],
    taskTransitions: ["DestroyExpTaskAndCompleteOnInactiveTextPrinter","Task_LaunchLvlUpAnim","Task_PrepareToGiveExpWithExpBar"],
    dataReads: ["tExpTask_bank","tExpTask_gainedExp","tExpTask_monId"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 38,
    bodyC: "u32 monId = (u8)(gTasks[taskId].tExpTask_monId);\n    u8 battler = gTasks[taskId].tExpTask_bank;\n    s16 gainedExp = gTasks[taskId].tExpTask_gainedExp;\n\n    if (IsDoubleBattle() == TRUE || monId != gBattlerPartyIndexes[battler])  \n    {\n        struct Pokemon *mon = &gPlayerParty[monId];\n        u16 species = GetMonData(mon, MON_DATA_SPECIES);\n        u8 level = GetMonData(mon, MON_DATA_LEVEL);\n        u32 currExp = GetMonData(mon, MON_DATA_EXP);\n        u32 nextLvlExp = gExperienceTables[gSpeciesInfo[species].growthRate][level + 1];\n\n        if (currExp + gainedExp >= nextLvlExp)\n        {\n            u8 savedActiveBank;\n\n            SetMonData(mon, MON_DATA_EXP, &nextLvlExp);\n            CalculateMonStats(mon);\n            gainedExp -= nextLvlExp - currExp;\n            savedActiveBank = gActiveBattler;\n            gActiveBattler = battler;\n            BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, RET_VALUE_LEVELED_UP, gainedExp);\n            gActiveBattler = savedActiveBank;\n\n            if (IsDoubleBattle() == TRUE\n             && ((u16)(monId) == gBattlerPartyIndexes[battler] || (u16)(monId) == gBattlerPartyIndexes[BATTLE_PARTNER(battler)]))\n                gTasks[taskId].func = Task_LaunchLvlUpAnim;\n            else\n                gTasks[taskId].func = DestroyExpTaskAndCompleteOnInactiveTextPrinter;\n        }\n        else\n        {\n            currExp += gainedExp;\n            SetMonData(mon, MON_DATA_EXP, &currExp);\n            gBattlerControllerFuncs[battler] = CompleteOnInactiveTextPrinter;\n            DestroyTask(taskId);\n        }\n    }\n    else\n    {\n        gTasks[taskId].func = Task_PrepareToGiveExpWithExpBar;\n    }",
  },
  "Task_PrepareToGiveExpWithExpBar": {
    callsTo: ["GetMonData","PlaySE","SetBattleBarStruct"],
    taskTransitions: ["Task_GiveExpWithExpBar"],
    dataReads: ["tExpTask_bank","tExpTask_gainedExp","tExpTask_monId"],
    lineCount: 14,
    bodyC: "u8 monIndex = gTasks[taskId].tExpTask_monId;\n    s32 gainedExp = gTasks[taskId].tExpTask_gainedExp;\n    u8 battler = gTasks[taskId].tExpTask_bank;\n    struct Pokemon *mon = &gPlayerParty[monIndex];\n    u8 level = GetMonData(mon, MON_DATA_LEVEL);\n    u16 species = GetMonData(mon, MON_DATA_SPECIES);\n    u32 exp = GetMonData(mon, MON_DATA_EXP);\n    u32 currLvlExp = gExperienceTables[gSpeciesInfo[species].growthRate][level];\n    u32 expToNextLvl;\n\n    exp -= currLvlExp;\n    expToNextLvl = gExperienceTables[gSpeciesInfo[species].growthRate][level + 1] - currLvlExp;\n    SetBattleBarStruct(battler, gHealthboxSpriteIds[battler], expToNextLvl, exp, -gainedExp);\n    PlaySE(SE_EXP);\n    gTasks[taskId].func = Task_GiveExpWithExpBar;",
  },
  "Task_GiveExpWithExpBar": {
    callsTo: ["BtlController_EmitTwoReturnValues","CalculateMonStats","DestroyTask","GetMonData","MoveBattleBar","SetHealthboxSpriteVisible","SetMonData","m4aSongNumStop"],
    taskTransitions: ["Task_LaunchLvlUpAnim"],
    dataReads: ["tExpTask_bank","tExpTask_frames","tExpTask_gainedExp","tExpTask_monId"],
    dataWrites: ["tExpTask_frames"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 44,
    bodyC: "if (gTasks[taskId].tExpTask_frames < 13)\n    {\n        gTasks[taskId].tExpTask_frames++;\n    }\n    else\n    {\n        u8 monId = gTasks[taskId].tExpTask_monId;\n        s16 gainedExp = gTasks[taskId].tExpTask_gainedExp;\n        u8 battler = gTasks[taskId].tExpTask_bank;\n        s16 r4;\n\n        r4 = MoveBattleBar(battler, gHealthboxSpriteIds[battler], EXP_BAR, 0);\n        SetHealthboxSpriteVisible(gHealthboxSpriteIds[battler]);\n        if (r4 == -1)\n        {\n            u8 level;\n            s32 currExp;\n            u16 species;\n            s32 expOnNextLvl;\n\n            m4aSongNumStop(SE_EXP);\n            level = GetMonData(&gPlayerParty[monId], MON_DATA_LEVEL);\n            currExp = GetMonData(&gPlayerParty[monId], MON_DATA_EXP);\n            species = GetMonData(&gPlayerParty[monId], MON_DATA_SPECIES);\n            expOnNextLvl = gExperienceTables[gSpeciesInfo[species].growthRate][level + 1];\n\n            if (currExp + gainedExp >= expOnNextLvl)\n            {\n                u8 savedActiveBank;\n\n                SetMonData(&gPlayerParty[monId], MON_DATA_EXP, &expOnNextLvl);\n                CalculateMonStats(&gPlayerParty[monId]);\n                gainedExp -= expOnNextLvl - currExp;\n                savedActiveBank = gActiveBattler;\n                gActiveBattler = battler;\n                BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, RET_VALUE_LEVELED_UP, gainedExp);\n                gActiveBattler = savedActiveBank;\n                gTasks[taskId].func = Task_LaunchLvlUpAnim;\n            }\n            else\n            {\n                currExp += gainedExp;\n                SetMonData(&gPlayerParty[monId], MON_DATA_EXP, &currExp);\n                gBattlerControllerFuncs[battler] = CompleteOnInactiveTextPrinter;\n                DestroyTask(taskId);\n            }\n        }\n    }",
  },
  "Task_LaunchLvlUpAnim": {
    callsTo: ["BATTLE_PARTNER","InitAndLaunchSpecialAnimation","IsDoubleBattle"],
    taskTransitions: ["Task_UpdateLvlInHealthbox"],
    dataReads: ["tExpTask_bank","tExpTask_monId"],
    lineCount: 6,
    bodyC: "u8 battler = gTasks[taskId].tExpTask_bank;\n    u8 monIndex = gTasks[taskId].tExpTask_monId;\n\n    if (IsDoubleBattle() == TRUE && monIndex == gBattlerPartyIndexes[BATTLE_PARTNER(battler)])\n        battler ^= BIT_FLANK;\n\n    InitAndLaunchSpecialAnimation(battler, battler, battler, B_ANIM_LVL_UP);\n    gTasks[taskId].func = Task_UpdateLvlInHealthbox;",
  },
  "Task_UpdateLvlInHealthbox": {
    callsTo: ["BATTLE_PARTNER","GetMonData","IsDoubleBattle","UpdateHealthboxAttribute"],
    taskTransitions: ["DestroyExpTaskAndCompleteOnInactiveTextPrinter"],
    dataReads: ["tExpTask_bank","tExpTask_monId"],
    lineCount: 11,
    bodyC: "u8 battler = gTasks[taskId].tExpTask_bank;\n\n    if (!gBattleSpritesDataPtr->healthBoxesData[battler].specialAnimActive)\n    {\n        u8 monIndex = gTasks[taskId].tExpTask_monId;\n\n        GetMonData(&gPlayerParty[monIndex], MON_DATA_LEVEL);   \n\n        if (IsDoubleBattle() == TRUE && monIndex == gBattlerPartyIndexes[BATTLE_PARTNER(battler)])\n            UpdateHealthboxAttribute(gHealthboxSpriteIds[BATTLE_PARTNER(battler)], &gPlayerParty[monIndex], HEALTHBOX_ALL);\n        else\n            UpdateHealthboxAttribute(gHealthboxSpriteIds[battler], &gPlayerParty[monIndex], HEALTHBOX_ALL);\n\n        gTasks[taskId].func = DestroyExpTaskAndCompleteOnInactiveTextPrinter;\n    }",
  },
  "Task_StartSendOutAnim": {
    callsTo: ["BattleLoadPlayerMonSpriteGfx","DestroyTask","IsDoubleBattle","StartSendOutAnim"],
    dataReads: ["data[0]","data[1]"],
    dataWrites: ["data[1]"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 27,
    bodyC: "if (gTasks[taskId].data[1] < 24)\n    {\n        gTasks[taskId].data[1]++;\n    }\n    else\n    {\n        u8 savedActiveBank = gActiveBattler;\n\n        gActiveBattler = gTasks[taskId].data[0];\n        if (!IsDoubleBattle() || (gBattleTypeFlags & BATTLE_TYPE_MULTI))\n        {\n            gBattleBufferA[gActiveBattler][1] = gBattlerPartyIndexes[gActiveBattler];\n            StartSendOutAnim(gActiveBattler, FALSE);\n        }\n        else\n        {\n            gBattleBufferA[gActiveBattler][1] = gBattlerPartyIndexes[gActiveBattler];\n            StartSendOutAnim(gActiveBattler, FALSE);\n            gActiveBattler ^= BIT_FLANK;\n            gBattleBufferA[gActiveBattler][1] = gBattlerPartyIndexes[gActiveBattler];\n            BattleLoadPlayerMonSpriteGfx(&gPlayerParty[gBattlerPartyIndexes[gActiveBattler]], gActiveBattler);\n            StartSendOutAnim(gActiveBattler, FALSE);\n            gActiveBattler ^= BIT_FLANK;\n        }\n        gBattlerControllerFuncs[gActiveBattler] = Intro_ShowHealthbox;\n        gActiveBattler = savedActiveBank;\n        DestroyTask(taskId);\n    }",
  },
} as const;
