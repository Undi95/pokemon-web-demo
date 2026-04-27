// AUTO-GENERATED from src/secret_base.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 4 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_EnterSecretBase": {
    callsTo: ["DestroyTask","SetMainCallback2","SetSecretBaseWarpDestination","VarGet","WarpIntoMap"],
    cb2Transitions: ["CB2_LoadMap"],
    dataReads: ["tState"],
    dataWrites: ["tState"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 18,
    bodyC: "u16 secretBaseIdx;\n\n    switch (gTasks[taskId].tState)\n    {\n    case 0:\n        if (!gPaletteFade.active)\n            gTasks[taskId].tState = 1;\n        break;\n    case 1:\n        secretBaseIdx = VarGet(VAR_CURRENT_SECRET_BASE);\n        if (gSaveBlock1Ptr->secretBases[secretBaseIdx].numTimesEntered < 255)\n            gSaveBlock1Ptr->secretBases[secretBaseIdx].numTimesEntered++;\n\n        SetSecretBaseWarpDestination();\n        WarpIntoMap();\n        gFieldCallback = FieldCB_ContinueScriptHandleMusic;\n        SetMainCallback2(CB2_LoadMap);\n        DestroyTask(taskId);\n        break;\n    }",
  },
  "Task_EnterNewlyCreatedSecretBase": {
    callsTo: ["DestroyTask","GET_BASE_COMPUTER_X","GET_BASE_COMPUTER_Y","SECRET_BASE_ID_TO_GROUP","SetMainCallback2","SetWarpDestination","WarpIntoMap"],
    cb2Transitions: ["CB2_LoadMap"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 14,
    bodyC: "if (!gPaletteFade.active)\n    {\n        s8 secretBaseGroup = SECRET_BASE_ID_TO_GROUP(sCurSecretBaseId);\n        SetWarpDestination(\n            gSaveBlock1Ptr->location.mapGroup,\n            gSaveBlock1Ptr->location.mapNum,\n            WARP_ID_NONE,\n            GET_BASE_COMPUTER_X(secretBaseGroup),\n            GET_BASE_COMPUTER_Y(secretBaseGroup));\n        WarpIntoMap();\n        gFieldCallback = EnterNewlyCreatedSecretBase_StartFadeIn;\n        SetMainCallback2(CB2_LoadMap);\n        DestroyTask(taskId);\n    }",
  },
  "Task_WarpOutOfSecretBase": {
    callsTo: ["DestroyTask","LockPlayerFieldControls","SetMainCallback2","SetWarpDestinationToDynamicWarp","UnlockPlayerFieldControls","WarpIntoMap"],
    cb2Transitions: ["CB2_LoadMap"],
    dataReads: ["data[0]"],
    dataWrites: ["data[0]"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 19,
    bodyC: "switch (gTasks[taskId].data[0])\n    {\n    case 0:\n        LockPlayerFieldControls();\n        gTasks[taskId].data[0] = 1;\n        break;\n    case 1:\n        if (!gPaletteFade.active)\n            gTasks[taskId].data[0] = 2;\n        break;\n    case 2:\n        SetWarpDestinationToDynamicWarp(WARP_ID_SECRET_BASE);\n        WarpIntoMap();\n        gFieldCallback = FieldCB_DefaultWarpExit;\n        SetMainCallback2(CB2_LoadMap);\n        UnlockPlayerFieldControls();\n        DestroyTask(taskId);\n        break;\n    }",
  },
  "Task_ShowSecretBaseRegistryMenu": {
    callsTo: ["AddWindow","AllocZeroed","BuildRegistryMenuItems","ClearDialogWindowAndFrame","DisplayItemMessageOnField","FinalizeRegistryMenu","GetNumRegisteredSecretBases","LockPlayerFieldControls"],
    taskTransitions: ["HandleRegistryMenuInput"],
    lineCount: 18,
    bodyC: "s16 *data = gTasks[taskId].data;\n    LockPlayerFieldControls();\n    tNumBases = GetNumRegisteredSecretBases();\n    if (tNumBases != 0)\n    {\n        tSelectedRow = 0;\n        tScrollOffset = 0;\n        ClearDialogWindowAndFrame(0, FALSE);\n        sRegistryMenu = AllocZeroed(sizeof(*sRegistryMenu));\n        tMainWindowId = AddWindow(&sRegistryWindowTemplates[0]);\n        BuildRegistryMenuItems(taskId);\n        FinalizeRegistryMenu(taskId);\n        gTasks[taskId].func = HandleRegistryMenuInput;\n    }\n    else\n    {\n        DisplayItemMessageOnField(taskId, gText_NoRegistry, GoToSecretBasePCRegisterMenu);\n    }",
  },
} as const;
