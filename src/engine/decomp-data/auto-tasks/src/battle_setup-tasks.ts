// AUTO-GENERATED from src/battle_setup.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 1 Task_, 7 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_BattleStart": {
    callsTo: ["BattleTransition_StartOnField","CleanupOverworldWindowsAndTilemaps","ClearMirageTowerPulseBlendEffect","ClearPoisonStepCounter","DestroyTask","FldEffPoison_IsActive","IsBattleTransitionDone","RestartWildEncounterImmunitySteps","SetMainCallback2"],
    cb2Transitions: ["CB2_InitBattle"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 22,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n    case 0:\n        if (!FldEffPoison_IsActive())  \n        {\n            BattleTransition_StartOnField(tTransition);\n            ClearMirageTowerPulseBlendEffect();\n            tState++;  \n        }\n        break;\n    case 1:\n        if (IsBattleTransitionDone() == TRUE)\n        {\n            CleanupOverworldWindowsAndTilemaps();\n            SetMainCallback2(CB2_InitBattle);\n            RestartWildEncounterImmunitySteps();\n            ClearPoisonStepCounter();\n            DestroyTask(taskId);\n        }\n        break;\n    }",
  },
} as const;

export const CB2S = {
  "CB2_EndWildBattle": {
    callsTo: ["CpuFill16","CurrentBattlePyramidLocation","InBattlePike","IsPlayerDefeated","ResetOamRange","SetMainCallback2"],
    cb2Transitions: ["CB2_ReturnToField","CB2_WhiteOut"],
    lineCount: 11,
    bodyC: "CpuFill16(0, (void *)(BG_PLTT), BG_PLTT_SIZE);\n    ResetOamRange(0, 128);\n\n    if (IsPlayerDefeated(gBattleOutcome) == TRUE && CurrentBattlePyramidLocation() == PYRAMID_LOCATION_NONE && !InBattlePike())\n    {\n        SetMainCallback2(CB2_WhiteOut);\n    }\n    else\n    {\n        SetMainCallback2(CB2_ReturnToField);\n        gFieldCallback = FieldCB_ReturnToFieldNoScriptCheckMusic;\n    }",
  },
  "CB2_EndScriptedWildBattle": {
    callsTo: ["CpuFill16","CurrentBattlePyramidLocation","IsPlayerDefeated","ResetOamRange","SetMainCallback2"],
    cb2Transitions: ["CB2_ReturnToFieldContinueScriptPlayMapMusic","CB2_WhiteOut"],
    lineCount: 13,
    bodyC: "CpuFill16(0, (void *)(BG_PLTT), BG_PLTT_SIZE);\n    ResetOamRange(0, 128);\n\n    if (IsPlayerDefeated(gBattleOutcome) == TRUE)\n    {\n        if (CurrentBattlePyramidLocation() != PYRAMID_LOCATION_NONE)\n            SetMainCallback2(CB2_ReturnToFieldContinueScriptPlayMapMusic);\n        else\n            SetMainCallback2(CB2_WhiteOut);\n    }\n    else\n    {\n        SetMainCallback2(CB2_ReturnToFieldContinueScriptPlayMapMusic);\n    }",
  },
  "CB2_GiveStarter": {
    callsTo: ["BattleTransition_Start","GetStarterPokemon","GetVarPointer","PlayBattleBGM","ResetTasks","ScriptGiveMon","SetMainCallback2"],
    cb2Transitions: ["CB2_StartFirstBattle"],
    lineCount: 8,
    bodyC: "u16 starterMon;\n\n    *GetVarPointer(VAR_STARTER_MON) = gSpecialVar_Result;\n    starterMon = GetStarterPokemon(gSpecialVar_Result);\n    ScriptGiveMon(starterMon, 5, ITEM_NONE, 0, 0, 0);\n    ResetTasks();\n    PlayBattleBGM();\n    SetMainCallback2(CB2_StartFirstBattle);\n    BattleTransition_Start(B_TRANSITION_BLUR);",
  },
  "CB2_StartFirstBattle": {
    callsTo: ["ClearPoisonStepCounter","FreeAllWindowBuffers","IncrementDailyWildBattles","IncrementGameStat","IsBattleTransitionDone","RestartWildEncounterImmunitySteps","RunTasks","SetMainCallback2","TryUpdateGymLeaderRematchFromWild","UpdatePaletteFade"],
    cb2Transitions: ["CB2_InitBattle"],
    lineCount: 15,
    bodyC: "UpdatePaletteFade();\n    RunTasks();\n\n    if (IsBattleTransitionDone() == TRUE)\n    {\n        gBattleTypeFlags = BATTLE_TYPE_FIRST_BATTLE;\n        gMain.savedCallback = CB2_EndFirstBattle;\n        FreeAllWindowBuffers();\n        SetMainCallback2(CB2_InitBattle);\n        RestartWildEncounterImmunitySteps();\n        ClearPoisonStepCounter();\n        IncrementGameStat(GAME_STAT_TOTAL_BATTLES);\n        IncrementGameStat(GAME_STAT_WILD_BATTLES);\n        IncrementDailyWildBattles();\n        TryUpdateGymLeaderRematchFromWild();\n    }",
  },
  "CB2_EndFirstBattle": {
    callsTo: ["Overworld_ClearSavedMusic","SetMainCallback2"],
    cb2Transitions: ["CB2_ReturnToFieldContinueScriptPlayMapMusic"],
    lineCount: 2,
    bodyC: "Overworld_ClearSavedMusic();\n    SetMainCallback2(CB2_ReturnToFieldContinueScriptPlayMapMusic);",
  },
  "CB2_EndTrainerBattle": {
    callsTo: ["CurrentBattlePyramidLocation","InTrainerHillChallenge","IsPlayerDefeated","RegisterTrainerInMatchCall","SetBattledTrainersFlags","SetMainCallback2"],
    cb2Transitions: ["CB2_ReturnToFieldContinueScriptPlayMapMusic","CB2_WhiteOut"],
    lineCount: 20,
    bodyC: "if (gTrainerBattleOpponent_A == TRAINER_SECRET_BASE)\n    {\n        SetMainCallback2(CB2_ReturnToFieldContinueScriptPlayMapMusic);\n    }\n    else if (IsPlayerDefeated(gBattleOutcome) == TRUE)\n    {\n        if (CurrentBattlePyramidLocation() != PYRAMID_LOCATION_NONE || InTrainerHillChallenge())\n            SetMainCallback2(CB2_ReturnToFieldContinueScriptPlayMapMusic);\n        else\n            SetMainCallback2(CB2_WhiteOut);\n    }\n    else\n    {\n        SetMainCallback2(CB2_ReturnToFieldContinueScriptPlayMapMusic);\n        if (CurrentBattlePyramidLocation() == PYRAMID_LOCATION_NONE && !InTrainerHillChallenge())\n        {\n            RegisterTrainerInMatchCall();\n            SetBattledTrainersFlags();\n        }\n    }",
  },
  "CB2_EndRematchBattle": {
    callsTo: ["HandleRematchVarsOnBattleEnd","IsPlayerDefeated","RegisterTrainerInMatchCall","SetBattledTrainersFlags","SetMainCallback2"],
    cb2Transitions: ["CB2_ReturnToFieldContinueScriptPlayMapMusic","CB2_WhiteOut"],
    lineCount: 15,
    bodyC: "if (gTrainerBattleOpponent_A == TRAINER_SECRET_BASE)\n    {\n        SetMainCallback2(CB2_ReturnToFieldContinueScriptPlayMapMusic);\n    }\n    else if (IsPlayerDefeated(gBattleOutcome) == TRUE)\n    {\n        SetMainCallback2(CB2_WhiteOut);\n    }\n    else\n    {\n        SetMainCallback2(CB2_ReturnToFieldContinueScriptPlayMapMusic);\n        RegisterTrainerInMatchCall();\n        SetBattledTrainersFlags();\n        HandleRematchVarsOnBattleEnd();\n    }",
  },
} as const;
