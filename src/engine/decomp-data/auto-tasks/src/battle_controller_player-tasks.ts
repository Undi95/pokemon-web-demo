// AUTO-GENERATED from src/battle_controller_player.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 7 Task_, 2 CB2_, 1 SpriteCB_

export const TASKS = {
  "Task_PlayerController_RestoreBgmAfterCry": {
    callsTo: ["DestroyTask","IsCryPlayingOrClearCrySongs","m4aMPlayVolumeControl"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 5,
    bodyC: "if (!IsCryPlayingOrClearCrySongs())\n    {\n        m4aMPlayVolumeControl(&gMPlayInfo_BGM, TRACKS_ALL, 0x100);\n        DestroyTask(taskId);\n    }",
  },
  "Task_GiveExpToMon": {
    callsTo: ["BATTLE_PARTNER","BtlController_EmitTwoReturnValues","CalculateMonStats","DestroyTask","GetMonData","IsDoubleBattle","SetMonData"],
    taskTransitions: ["DestroyExpTaskAndCompleteOnInactiveTextPrinter","Task_LaunchLvlUpAnim","Task_PrepareToGiveExpWithExpBar"],
    dataReads: ["tExpTask_battler","tExpTask_gainedExp","tExpTask_monId"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 38,
    bodyC: "u32 monId = (u8)(gTasks[taskId].tExpTask_monId);\n    u8 battler = gTasks[taskId].tExpTask_battler;\n    s16 gainedExp = gTasks[taskId].tExpTask_gainedExp;\n\n    if (IsDoubleBattle() == TRUE || monId != gBattlerPartyIndexes[battler])  \n    {\n        struct Pokemon *mon = &gPlayerParty[monId];\n        u16 species = GetMonData(mon, MON_DATA_SPECIES);\n        u8 level = GetMonData(mon, MON_DATA_LEVEL);\n        u32 currExp = GetMonData(mon, MON_DATA_EXP);\n        u32 nextLvlExp = gExperienceTables[gSpeciesInfo[species].growthRate][level + 1];\n\n        if (currExp + gainedExp >= nextLvlExp)\n        {\n            u8 savedActiveBattler;\n\n            SetMonData(mon, MON_DATA_EXP, &nextLvlExp);\n            CalculateMonStats(mon);\n            gainedExp -= nextLvlExp - currExp;\n            savedActiveBattler = gActiveBattler;\n            gActiveBattler = battler;\n            BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, RET_VALUE_LEVELED_UP, gainedExp);\n            gActiveBattler = savedActiveBattler;\n\n            if (IsDoubleBattle() == TRUE\n             && ((u16)(monId) == gBattlerPartyIndexes[battler] || (u16)(monId) == gBattlerPartyIndexes[BATTLE_PARTNER(battler)]))\n                gTasks[taskId].func = Task_LaunchLvlUpAnim;\n            else\n                gTasks[taskId].func = DestroyExpTaskAndCompleteOnInactiveTextPrinter;\n        }\n        else\n        {\n            currExp += gainedExp;\n            SetMonData(mon, MON_DATA_EXP, &currExp);\n            gBattlerControllerFuncs[battler] = CompleteOnInactiveTextPrinter;\n            DestroyTask(taskId);\n        }\n    }\n    else\n    {\n        gTasks[taskId].func = Task_PrepareToGiveExpWithExpBar;\n    }",
  },
  "Task_PrepareToGiveExpWithExpBar": {
    callsTo: ["GetMonData","PlaySE","SetBattleBarStruct"],
    taskTransitions: ["Task_GiveExpWithExpBar"],
    dataReads: ["tExpTask_battler","tExpTask_gainedExp","tExpTask_monId"],
    lineCount: 14,
    bodyC: "u8 monIndex = gTasks[taskId].tExpTask_monId;\n    s32 gainedExp = gTasks[taskId].tExpTask_gainedExp;\n    u8 battler = gTasks[taskId].tExpTask_battler;\n    struct Pokemon *mon = &gPlayerParty[monIndex];\n    u8 level = GetMonData(mon, MON_DATA_LEVEL);\n    u16 species = GetMonData(mon, MON_DATA_SPECIES);\n    u32 exp = GetMonData(mon, MON_DATA_EXP);\n    u32 currLvlExp = gExperienceTables[gSpeciesInfo[species].growthRate][level];\n    u32 expToNextLvl;\n\n    exp -= currLvlExp;\n    expToNextLvl = gExperienceTables[gSpeciesInfo[species].growthRate][level + 1] - currLvlExp;\n    SetBattleBarStruct(battler, gHealthboxSpriteIds[battler], expToNextLvl, exp, -gainedExp);\n    PlaySE(SE_EXP);\n    gTasks[taskId].func = Task_GiveExpWithExpBar;",
  },
  "Task_GiveExpWithExpBar": {
    callsTo: ["BtlController_EmitTwoReturnValues","CalculateMonStats","DestroyTask","GetMonData","MoveBattleBar","SetHealthboxSpriteVisible","SetMonData","m4aSongNumStop"],
    taskTransitions: ["Task_LaunchLvlUpAnim"],
    dataReads: ["tExpTask_battler","tExpTask_frames","tExpTask_gainedExp","tExpTask_monId"],
    dataWrites: ["tExpTask_frames"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 44,
    bodyC: "if (gTasks[taskId].tExpTask_frames < 13)\n    {\n        gTasks[taskId].tExpTask_frames++;\n    }\n    else\n    {\n        u8 monId = gTasks[taskId].tExpTask_monId;\n        s16 gainedExp = gTasks[taskId].tExpTask_gainedExp;\n        u8 battler = gTasks[taskId].tExpTask_battler;\n        s16 newExpPoints;\n\n        newExpPoints = MoveBattleBar(battler, gHealthboxSpriteIds[battler], EXP_BAR, 0);\n        SetHealthboxSpriteVisible(gHealthboxSpriteIds[battler]);\n        if (newExpPoints == -1)  \n        {\n            u8 level;\n            s32 currExp;\n            u16 species;\n            s32 expOnNextLvl;\n\n            m4aSongNumStop(SE_EXP);\n            level = GetMonData(&gPlayerParty[monId], MON_DATA_LEVEL);\n            currExp = GetMonData(&gPlayerParty[monId], MON_DATA_EXP);\n            species = GetMonData(&gPlayerParty[monId], MON_DATA_SPECIES);\n            expOnNextLvl = gExperienceTables[gSpeciesInfo[species].growthRate][level + 1];\n\n            if (currExp + gainedExp >= expOnNextLvl)\n            {\n                u8 savedActiveBattler;\n\n                SetMonData(&gPlayerParty[monId], MON_DATA_EXP, &expOnNextLvl);\n                CalculateMonStats(&gPlayerParty[monId]);\n                gainedExp -= expOnNextLvl - currExp;\n                savedActiveBattler = gActiveBattler;\n                gActiveBattler = battler;\n                BtlController_EmitTwoReturnValues(B_COMM_TO_ENGINE, RET_VALUE_LEVELED_UP, gainedExp);\n                gActiveBattler = savedActiveBattler;\n                gTasks[taskId].func = Task_LaunchLvlUpAnim;\n            }\n            else\n            {\n                currExp += gainedExp;\n                SetMonData(&gPlayerParty[monId], MON_DATA_EXP, &currExp);\n                gBattlerControllerFuncs[battler] = CompleteOnInactiveTextPrinter;\n                DestroyTask(taskId);\n            }\n        }\n    }",
  },
  "Task_LaunchLvlUpAnim": {
    callsTo: ["BATTLE_PARTNER","InitAndLaunchSpecialAnimation","IsDoubleBattle"],
    taskTransitions: ["Task_UpdateLvlInHealthbox"],
    dataReads: ["tExpTask_battler","tExpTask_monId"],
    lineCount: 6,
    bodyC: "u8 battler = gTasks[taskId].tExpTask_battler;\n    u8 monIndex = gTasks[taskId].tExpTask_monId;\n\n    if (IsDoubleBattle() == TRUE && monIndex == gBattlerPartyIndexes[BATTLE_PARTNER(battler)])\n        battler ^= BIT_FLANK;\n\n    InitAndLaunchSpecialAnimation(battler, battler, battler, B_ANIM_LVL_UP);\n    gTasks[taskId].func = Task_UpdateLvlInHealthbox;",
  },
  "Task_UpdateLvlInHealthbox": {
    callsTo: ["BATTLE_PARTNER","GetMonData","IsDoubleBattle","UpdateHealthboxAttribute"],
    taskTransitions: ["DestroyExpTaskAndCompleteOnInactiveTextPrinter"],
    dataReads: ["tExpTask_battler","tExpTask_monId"],
    lineCount: 11,
    bodyC: "u8 battler = gTasks[taskId].tExpTask_battler;\n\n    if (!gBattleSpritesDataPtr->healthBoxesData[battler].specialAnimActive)\n    {\n        u8 monIndex = gTasks[taskId].tExpTask_monId;\n\n        GetMonData(&gPlayerParty[monIndex], MON_DATA_LEVEL);   \n\n        if (IsDoubleBattle() == TRUE && monIndex == gBattlerPartyIndexes[BATTLE_PARTNER(battler)])\n            UpdateHealthboxAttribute(gHealthboxSpriteIds[BATTLE_PARTNER(battler)], &gPlayerParty[monIndex], HEALTHBOX_ALL);\n        else\n            UpdateHealthboxAttribute(gHealthboxSpriteIds[battler], &gPlayerParty[monIndex], HEALTHBOX_ALL);\n\n        gTasks[taskId].func = DestroyExpTaskAndCompleteOnInactiveTextPrinter;\n    }",
  },
  "Task_StartSendOutAnim": {
    callsTo: ["BattleLoadPlayerMonSpriteGfx","DestroyTask","IsDoubleBattle","StartSendOutAnim"],
    dataReads: ["tBattlerId","tStartTimer"],
    dataWrites: ["tStartTimer"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 27,
    bodyC: "if (gTasks[taskId].tStartTimer < 31)\n    {\n        gTasks[taskId].tStartTimer++;\n    }\n    else\n    {\n        u8 savedActiveBattler = gActiveBattler;\n\n        gActiveBattler = gTasks[taskId].tBattlerId;\n        if (!IsDoubleBattle() || (gBattleTypeFlags & BATTLE_TYPE_MULTI))\n        {\n            gBattleBufferA[gActiveBattler][1] = gBattlerPartyIndexes[gActiveBattler];\n            StartSendOutAnim(gActiveBattler, FALSE);\n        }\n        else\n        {\n            gBattleBufferA[gActiveBattler][1] = gBattlerPartyIndexes[gActiveBattler];\n            StartSendOutAnim(gActiveBattler, FALSE);\n            gActiveBattler ^= BIT_FLANK;\n            gBattleBufferA[gActiveBattler][1] = gBattlerPartyIndexes[gActiveBattler];\n            BattleLoadPlayerMonSpriteGfx(&gPlayerParty[gBattlerPartyIndexes[gActiveBattler]], gActiveBattler);\n            StartSendOutAnim(gActiveBattler, FALSE);\n            gActiveBattler ^= BIT_FLANK;\n        }\n        gBattlerControllerFuncs[gActiveBattler] = Intro_TryShinyAnimShowHealthbox;\n        gActiveBattler = savedActiveBattler;\n        DestroyTask(taskId);\n    }",
  },
} as const;

export const CB2S = {
  "CB2_SetUpReshowBattleScreenAfterMenu": {
    callsTo: ["SetMainCallback2"],
    cb2Transitions: ["ReshowBattleScreenAfterMenu"],
    lineCount: 1,
    bodyC: "SetMainCallback2(ReshowBattleScreenAfterMenu);",
  },
  "CB2_SetUpReshowBattleScreenAfterMenu2": {
    callsTo: ["SetMainCallback2"],
    cb2Transitions: ["ReshowBattleScreenAfterMenu"],
    lineCount: 1,
    bodyC: "SetMainCallback2(ReshowBattleScreenAfterMenu);",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_FreePlayerSpriteLoadMonSprite": {
    callsTo: ["BattleLoadPlayerMonSpriteGfx","DestroySprite","FreeSpriteOamMatrix","FreeSpritePaletteByTag","GetSpritePaletteTagByPaletteNum","StartSpriteAnim"],
    terminalMarkers: ["DestroySprite","FreeSpriteOamMatrix"],
    lineCount: 6,
    bodyC: "u8 battler = sprite->sBattlerId;\n\n     \n    FreeSpriteOamMatrix(sprite);\n    FreeSpritePaletteByTag(GetSpritePaletteTagByPaletteNum(sprite->oam.paletteNum));\n    DestroySprite(sprite);\n\n     \n    BattleLoadPlayerMonSpriteGfx(&gPlayerParty[gBattlerPartyIndexes[battler]], battler);\n    StartSpriteAnim(&gSprites[gBattlerSpriteIds[battler]], 0);",
  },
} as const;
