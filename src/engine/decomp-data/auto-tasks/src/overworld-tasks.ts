// AUTO-GENERATED from src/overworld.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 0 Task_, 18 CB2_, 1 SpriteCB_

export const CB2S = {
  "CB2_OverworldBasic": {
    callsTo: ["OverworldBasic"],
    lineCount: 1,
    bodyC: "OverworldBasic();",
  },
  "CB2_Overworld": {
    callsTo: ["OverworldBasic","SetFieldVBlankCallback","SetVBlankCallback"],
    externalChecks: { paletteFade: true },
    lineCount: 6,
    bodyC: "bool32 fading = (gPaletteFade.active != 0);\n    if (fading)\n        SetVBlankCallback(NULL);\n    OverworldBasic();\n    if (fading)\n        SetFieldVBlankCallback();",
  },
  "CB2_NewGame": {
    callsTo: ["DoMapLoadLoop","FieldClearVBlankHBlankCallbacks","NewGameInitData","PlayTimeCounter_Start","ResetInitialPlayerAvatarState","ResetSafariZoneFlag_","ScriptContext_Init","SetFieldVBlankCallback","SetMainCallback1","SetMainCallback2","StopMapMusic","UnlockPlayerFieldControls"],
    cb2Transitions: ["CB2_Overworld"],
    lineCount: 14,
    bodyC: "FieldClearVBlankHBlankCallbacks();\n    StopMapMusic();\n    ResetSafariZoneFlag_();\n    NewGameInitData();\n    ResetInitialPlayerAvatarState();\n    PlayTimeCounter_Start();\n    ScriptContext_Init();\n    UnlockPlayerFieldControls();\n    gFieldCallback = ExecuteTruckSequence;\n    gFieldCallback2 = NULL;\n    DoMapLoadLoop(&gMain.state);\n    SetFieldVBlankCallback();\n    SetMainCallback1(CB1_Overworld);\n    SetMainCallback2(CB2_Overworld);",
  },
  "CB2_WhiteOut": {
    callsTo: ["DoMapLoadLoop","DoWhiteOut","FieldClearVBlankHBlankCallbacks","ResetInitialPlayerAvatarState","ResetSafariZoneFlag_","ScriptContext_Init","SetFieldVBlankCallback","SetMainCallback1","SetMainCallback2","StopMapMusic","UnlockPlayerFieldControls"],
    cb2Transitions: ["CB2_Overworld"],
    lineCount: 17,
    bodyC: "u8 state;\n\n    if (++gMain.state >= 120)\n    {\n        FieldClearVBlankHBlankCallbacks();\n        StopMapMusic();\n        ResetSafariZoneFlag_();\n        DoWhiteOut();\n        ResetInitialPlayerAvatarState();\n        ScriptContext_Init();\n        UnlockPlayerFieldControls();\n        gFieldCallback = FieldCB_WarpExitFadeFromBlack;\n        state = 0;\n        DoMapLoadLoop(&state);\n        SetFieldVBlankCallback();\n        SetMainCallback1(CB1_Overworld);\n        SetMainCallback2(CB2_Overworld);\n    }",
  },
  "CB2_LoadMap": {
    callsTo: ["FieldClearVBlankHBlankCallbacks","ScriptContext_Init","SetMainCallback1","SetMainCallback2","UnlockPlayerFieldControls"],
    cb2Transitions: ["CB2_DoChangeMap"],
    lineCount: 6,
    bodyC: "FieldClearVBlankHBlankCallbacks();\n    ScriptContext_Init();\n    UnlockPlayerFieldControls();\n    SetMainCallback1(NULL);\n    SetMainCallback2(CB2_DoChangeMap);\n    gMain.savedCallback = CB2_LoadMap2;",
  },
  "CB2_LoadMap2": {
    callsTo: ["DoMapLoadLoop","SetFieldVBlankCallback","SetMainCallback1","SetMainCallback2"],
    cb2Transitions: ["CB2_Overworld"],
    lineCount: 4,
    bodyC: "DoMapLoadLoop(&gMain.state);\n    SetFieldVBlankCallback();\n    SetMainCallback1(CB1_Overworld);\n    SetMainCallback2(CB2_Overworld);",
  },
  "CB2_ReturnToFieldContestHall": {
    callsTo: ["FieldClearVBlankHBlankCallbacks","LoadMapInStepsLocal","ScriptContext_Init","SetFieldVBlankCallback","SetMainCallback1","SetMainCallback2","UnlockPlayerFieldControls"],
    cb2Transitions: ["CB2_Overworld"],
    lineCount: 13,
    bodyC: "if (!gMain.state)\n    {\n        FieldClearVBlankHBlankCallbacks();\n        ScriptContext_Init();\n        UnlockPlayerFieldControls();\n        SetMainCallback1(NULL);\n    }\n    if (LoadMapInStepsLocal(&gMain.state, TRUE))\n    {\n        SetFieldVBlankCallback();\n        SetMainCallback1(CB1_Overworld);\n        SetMainCallback2(CB2_Overworld);\n    }",
  },
  "CB2_ReturnToFieldCableClub": {
    callsTo: ["FieldClearVBlankHBlankCallbacks","SetMainCallback2"],
    cb2Transitions: ["CB2_LoadMapOnReturnToFieldCableClub"],
    lineCount: 3,
    bodyC: "FieldClearVBlankHBlankCallbacks();\n    gFieldCallback = FieldCB_ReturnToFieldWirelessLink;\n    SetMainCallback2(CB2_LoadMapOnReturnToFieldCableClub);",
  },
  "CB2_LoadMapOnReturnToFieldCableClub": {
    callsTo: ["LoadMapInStepsLink","ResetAllMultiplayerState","SetFieldVBlankCallback","SetMainCallback1","SetMainCallback2"],
    cb2Transitions: ["CB2_Overworld"],
    lineCount: 7,
    bodyC: "if (LoadMapInStepsLink(&gMain.state))\n    {\n        SetFieldVBlankCallback();\n        SetMainCallback1(CB1_OverworldLink);\n        ResetAllMultiplayerState();\n        SetMainCallback2(CB2_Overworld);\n    }",
  },
  "CB2_ReturnToField": {
    callsTo: ["FieldClearVBlankHBlankCallbacks","IsOverworldLinkActive","SetMainCallback2"],
    cb2Transitions: ["CB2_ReturnToFieldLink","CB2_ReturnToFieldLocal"],
    lineCount: 9,
    bodyC: "if (IsOverworldLinkActive() == TRUE)\n    {\n        SetMainCallback2(CB2_ReturnToFieldLink);\n    }\n    else\n    {\n        FieldClearVBlankHBlankCallbacks();\n        SetMainCallback2(CB2_ReturnToFieldLocal);\n    }",
  },
  "CB2_ReturnToFieldLocal": {
    callsTo: ["ReturnToFieldLocal","SetFieldVBlankCallback","SetMainCallback2"],
    cb2Transitions: ["CB2_Overworld"],
    lineCount: 5,
    bodyC: "if (ReturnToFieldLocal(&gMain.state))\n    {\n        SetFieldVBlankCallback();\n        SetMainCallback2(CB2_Overworld);\n    }",
  },
  "CB2_ReturnToFieldLink": {
    callsTo: ["Overworld_IsRecvQueueAtMax","ReturnToFieldLink","SetMainCallback2"],
    cb2Transitions: ["CB2_Overworld"],
    lineCount: 2,
    bodyC: "if (!Overworld_IsRecvQueueAtMax() && ReturnToFieldLink(&gMain.state))\n        SetMainCallback2(CB2_Overworld);",
  },
  "CB2_ReturnToFieldFromMultiplayer": {
    callsTo: ["CB2_ReturnToField","FieldClearVBlankHBlankCallbacks","ResetAllMultiplayerState","ScriptContext_Init","SetMainCallback1","StopMapMusic","UnlockPlayerFieldControls"],
    lineCount: 11,
    bodyC: "FieldClearVBlankHBlankCallbacks();\n    StopMapMusic();\n    SetMainCallback1(CB1_OverworldLink);\n    ResetAllMultiplayerState();\n\n    if (gWirelessCommType != 0)\n        gFieldCallback = FieldCB_ReturnToFieldWirelessLink;\n    else\n        gFieldCallback = FieldCB_ReturnToFieldCableLink;\n\n    ScriptContext_Init();\n    UnlockPlayerFieldControls();\n    CB2_ReturnToField();",
  },
  "CB2_ReturnToFieldWithOpenMenu": {
    callsTo: ["CB2_ReturnToField","FieldClearVBlankHBlankCallbacks"],
    lineCount: 3,
    bodyC: "FieldClearVBlankHBlankCallbacks();\n    gFieldCallback2 = FieldCB_ReturnToFieldOpenStartMenu;\n    CB2_ReturnToField();",
  },
  "CB2_ReturnToFieldContinueScript": {
    callsTo: ["CB2_ReturnToField","FieldClearVBlankHBlankCallbacks"],
    lineCount: 3,
    bodyC: "FieldClearVBlankHBlankCallbacks();\n    gFieldCallback = FieldCB_ContinueScript;\n    CB2_ReturnToField();",
  },
  "CB2_ReturnToFieldContinueScriptPlayMapMusic": {
    callsTo: ["CB2_ReturnToField","FieldClearVBlankHBlankCallbacks"],
    lineCount: 3,
    bodyC: "FieldClearVBlankHBlankCallbacks();\n    gFieldCallback = FieldCB_ContinueScriptHandleMusic;\n    CB2_ReturnToField();",
  },
  "CB2_ReturnToFieldFadeFromBlack": {
    callsTo: ["CB2_ReturnToField","FieldClearVBlankHBlankCallbacks"],
    lineCount: 3,
    bodyC: "FieldClearVBlankHBlankCallbacks();\n    gFieldCallback = FieldCB_WarpExitFadeFromBlack;\n    CB2_ReturnToField();",
  },
  "CB2_ContinueSavedGame": {
    callsTo: ["CB2_ReturnToField","ClearContinueGameWarpStatus","ClearDiveAndHoleWarps","DoTimeBasedEvents","FieldClearVBlankHBlankCallbacks","GetCurrentTrainerHillMapId","InitBattlePyramidMap","InitMapFromSavedGame","InitMatchCallCounters","InitTrainerHillMap","LoadBattlePyramidFloorObjectEventScripts","LoadSaveblockMapHeader","LoadSaveblockObjEventScripts","LoadTrainerHillFloorObjectEventScripts","PlayTimeCounter_Start","ResetSafariZoneFlag_","ResetWinStreaks","ScriptContext_Init","SetMainCallback1","SetMainCallback2","SetWarpDestinationToContinueGameWarp","StopMapMusic","TryPutTodaysRivalTrainerOnAir","UnfreezeObjectEvents","UnlockPlayerFieldControls","UpdateMiscOverworldStates","UseContinueGameWarp","WarpIntoMap"],
    cb2Transitions: ["CB2_LoadMap"],
    lineCount: 43,
    bodyC: "u8 trainerHillMapId;\n\n    FieldClearVBlankHBlankCallbacks();\n    StopMapMusic();\n    ResetSafariZoneFlag_();\n    if (gSaveFileStatus == SAVE_STATUS_ERROR)\n        ResetWinStreaks();\n\n    LoadSaveblockMapHeader();\n    ClearDiveAndHoleWarps();\n    trainerHillMapId = GetCurrentTrainerHillMapId();\n    if (gMapHeader.mapLayoutId == LAYOUT_BATTLE_FRONTIER_BATTLE_PYRAMID_FLOOR)\n        LoadBattlePyramidFloorObjectEventScripts();\n    else if (trainerHillMapId != 0 && trainerHillMapId != TRAINER_HILL_ENTRANCE)\n        LoadTrainerHillFloorObjectEventScripts();\n    else\n        LoadSaveblockObjEventScripts();\n\n    UnfreezeObjectEvents();\n    DoTimeBasedEvents();\n    UpdateMiscOverworldStates();\n    if (gMapHeader.mapLayoutId == LAYOUT_BATTLE_FRONTIER_BATTLE_PYRAMID_FLOOR)\n        InitBattlePyramidMap(TRUE);\n    else if (trainerHillMapId != 0)\n        InitTrainerHillMap();\n    else\n        InitMapFromSavedGame();\n\n    PlayTimeCounter_Start();\n    ScriptContext_Init();\n    UnlockPlayerFieldControls();\n    InitMatchCallCounters();\n    if (UseContinueGameWarp() == TRUE)\n    {\n        ClearContinueGameWarpStatus();\n        SetWarpDestinationToContinueGameWarp();\n        WarpIntoMap();\n        TryPutTodaysRivalTrainerOnAir();\n        SetMainCallback2(CB2_LoadMap);\n    }\n    else\n    {\n        TryPutTodaysRivalTrainerOnAir();\n        gFieldCallback = FieldCB_FadeTryShowMapPopup;\n        SetMainCallback1(CB1_Overworld);\n        CB2_ReturnToField();\n    }",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_LinkPlayer": {
    callsTo: ["ElevationToPriority","GetFaceDirectionAnimNum","GetMoveDirectionAnimNum","SetObjectSubpriorityByElevation","StartSpriteAnim","StartSpriteAnimIfDifferent","UpdateObjectEventSpriteInvisibility","linkDirection"],
    lineCount: 16,
    bodyC: "struct LinkPlayerObjectEvent *linkPlayerObjEvent = &gLinkPlayerObjectEvents[sprite->data[0]];\n    struct ObjectEvent *objEvent = &gObjectEvents[linkPlayerObjEvent->objEventId];\n    sprite->x = objEvent->initialCoords.x;\n    sprite->y = objEvent->initialCoords.y;\n    SetObjectSubpriorityByElevation(objEvent->previousElevation, sprite, 1);\n    sprite->oam.priority = ElevationToPriority(objEvent->previousElevation);\n\n    if (linkPlayerObjEvent->movementMode == MOVEMENT_MODE_FREE)\n        StartSpriteAnim(sprite, GetFaceDirectionAnimNum(linkDirection(objEvent)));\n    else\n        StartSpriteAnimIfDifferent(sprite, GetMoveDirectionAnimNum(linkDirection(objEvent)));\n\n    UpdateObjectEventSpriteInvisibility(sprite, FALSE);\n    if (objEvent->triggerGroundEffectsOnMove)\n    {\n        sprite->invisible = ((sprite->data[7] & 4) >> 2);\n        sprite->data[7]++;\n    }",
  },
} as const;
