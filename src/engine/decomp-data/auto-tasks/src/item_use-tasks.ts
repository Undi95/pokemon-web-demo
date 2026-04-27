// AUTO-GENERATED from src/item_use.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 14 Task_, 2 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_CallItemUseOnFieldCallback": {
    callsTo: ["IsWeatherNotFadingIn","sItemUseOnFieldCB"],
    lineCount: 2,
    bodyC: "if (IsWeatherNotFadingIn() == 1)\n        sItemUseOnFieldCB(taskId);",
  },
  "Task_CloseCantUseKeyItemMessage": {
    callsTo: ["ClearDialogWindowAndFrame","DestroyTask","ScriptUnfreezeObjectEvents","UnlockPlayerFieldControls"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 4,
    bodyC: "ClearDialogWindowAndFrame(0, TRUE);\n    DestroyTask(taskId);\n    ScriptUnfreezeObjectEvents();\n    UnlockPlayerFieldControls();",
  },
  "Task_UseItemfinder": {
    callsTo: ["ARRAY_COUNT","GetDirectionToHiddenItem","GetPlayerFacingDirection","PlaySE","PlayerFaceHiddenItem"],
    taskTransitions: ["Task_HiddenItemNearby","Task_StandingOnHiddenItem"],
    lineCount: 32,
    bodyC: "u8 playerDir;\n    u8 playerDirToItem;\n    u8 i;\n    s16 *data = gTasks[taskId].data;\n    if (tCounter == 0)\n    {\n        if (tItemfinderBeeps == 4)\n        {\n            playerDirToItem = GetDirectionToHiddenItem(tItemDistanceX, tItemDistanceY);\n            if (playerDirToItem != DIR_NONE)\n            {\n                PlayerFaceHiddenItem(sClockwiseDirections[playerDirToItem - 1]);\n                gTasks[taskId].func = Task_HiddenItemNearby;\n            }\n            else\n            {\n                 \n                playerDir = GetPlayerFacingDirection();\n                for (i = 0; i < ARRAY_COUNT(sClockwiseDirections); i++)\n                {\n                    if (playerDir == sClockwiseDirections[i])\n                        tFacingDir = (i + 1) & 3;\n                }\n                gTasks[taskId].func = Task_StandingOnHiddenItem;\n                tCounter = 0;\n                tItemFound = 0;\n            }\n            return;\n        }\n        PlaySE(SE_ITEMFINDER);\n        tItemfinderBeeps++;\n    }\n    tCounter = (tCounter + 1) & 0x1F;",
  },
  "Task_CloseItemfinderMessage": {
    callsTo: ["ClearDialogWindowAndFrame","DestroyTask","ScriptUnfreezeObjectEvents","UnlockPlayerFieldControls"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 4,
    bodyC: "ClearDialogWindowAndFrame(0, TRUE);\n    ScriptUnfreezeObjectEvents();\n    UnlockPlayerFieldControls();\n    DestroyTask(taskId);",
  },
  "Task_HiddenItemNearby": {
    callsTo: ["DisplayItemMessageOnField","GetObjectEventIdByLocalIdAndMap","ObjectEventCheckHeldMovementStatus"],
    lineCount: 2,
    bodyC: "if (ObjectEventCheckHeldMovementStatus(&gObjectEvents[GetObjectEventIdByLocalIdAndMap(LOCALID_PLAYER, 0, 0)]) == TRUE)\n        DisplayItemMessageOnField(taskId, gText_ItemFinderNearby, Task_CloseItemfinderMessage);",
  },
  "Task_StandingOnHiddenItem": {
    callsTo: ["DisplayItemMessageOnField","GetObjectEventIdByLocalIdAndMap","ObjectEventCheckHeldMovementStatus","PlayerFaceHiddenItem"],
    lineCount: 11,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (ObjectEventCheckHeldMovementStatus(&gObjectEvents[GetObjectEventIdByLocalIdAndMap(LOCALID_PLAYER, 0, 0)]) == TRUE\n    || tItemFound == FALSE)\n    {\n         \n        PlayerFaceHiddenItem(sClockwiseDirections[tFacingDir]);\n        tItemFound = TRUE;\n        tFacingDir = (tFacingDir + 1) & 3;\n        tCounter++;\n\n        if (tCounter == 4)\n            DisplayItemMessageOnField(taskId, gText_ItemFinderOnTop, Task_CloseItemfinderMessage);\n    }",
  },
  "Task_OpenRegisteredPokeblockCase": {
    callsTo: ["CleanupOverworldWindowsAndTilemaps","DestroyTask","OpenPokeblockCase"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 6,
    bodyC: "if (!gPaletteFade.active)\n    {\n        CleanupOverworldWindowsAndTilemaps();\n        OpenPokeblockCase(PBLOCK_CASE_FIELD, CB2_ReturnToField);\n        DestroyTask(taskId);\n    }",
  },
  "Task_ShowTMHMContainedMessage": {
    callsTo: ["DisplayItemMessage","ItemIdToBattleMoveId","JOY_NEW","StringCopy","StringExpandPlaceholders"],
    lineCount: 6,
    bodyC: "if (JOY_NEW(A_BUTTON | B_BUTTON))\n    {\n        StringCopy(gStringVar1, gMoveNames[ItemIdToBattleMoveId(gSpecialVar_ItemId)]);\n        StringExpandPlaceholders(gStringVar4, gText_TMHMContainedVar1);\n        DisplayItemMessage(taskId, FONT_NORMAL, gStringVar4, UseTMHMYesNo);\n    }",
  },
  "Task_StartUseRepel": {
    callsTo: ["PlaySE"],
    taskTransitions: ["Task_UseRepel"],
    lineCount: 7,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (++data[8] > 7)\n    {\n        data[8] = 0;\n        PlaySE(SE_REPEL);\n        gTasks[taskId].func = Task_UseRepel;\n    }",
  },
  "Task_UseRepel": {
    callsTo: ["CurrentBattlePyramidLocation","DisplayItemMessage","DisplayItemMessageInBattlePyramid","GetItemHoldEffectParam","IsSEPlaying","RemoveUsedItem","VarSet"],
    lineCount: 9,
    bodyC: "if (!IsSEPlaying())\n    {\n        VarSet(VAR_REPEL_STEP_COUNT, GetItemHoldEffectParam(gSpecialVar_ItemId));\n        RemoveUsedItem();\n        if (CurrentBattlePyramidLocation() == PYRAMID_LOCATION_NONE)\n            DisplayItemMessage(taskId, FONT_NORMAL, gStringVar4, CloseItemMessage);\n        else\n            DisplayItemMessageInBattlePyramid(taskId, gStringVar4, Task_CloseBattlePyramidBagMessage);\n    }",
  },
  "Task_UsedBlackWhiteFlute": {
    callsTo: ["CurrentBattlePyramidLocation","DisplayItemMessage","DisplayItemMessageInBattlePyramid","PlaySE"],
    dataReads: ["data[8]"],
    lineCount: 8,
    bodyC: "if(++gTasks[taskId].data[8] > 7)\n    {\n        PlaySE(SE_GLASS_FLUTE);\n        if (CurrentBattlePyramidLocation() == PYRAMID_LOCATION_NONE)\n            DisplayItemMessage(taskId, FONT_NORMAL, gStringVar4, CloseItemMessage);\n        else\n            DisplayItemMessageInBattlePyramid(taskId, gStringVar4, Task_CloseBattlePyramidBagMessage);\n    }",
  },
  "Task_UseDigEscapeRopeOnField": {
    callsTo: ["DestroyTask","ResetInitialPlayerAvatarState","StartEscapeRopeFieldEffect"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 3,
    bodyC: "ResetInitialPlayerAvatarState();\n    StartEscapeRopeFieldEffect();\n    DestroyTask(taskId);",
  },
  "Task_CloseStatIncreaseMessage": {
    callsTo: ["CloseBattlePyramidBag","CurrentBattlePyramidLocation","JOY_NEW","Task_FadeAndCloseBagMenu"],
    lineCount: 7,
    bodyC: "if (JOY_NEW(A_BUTTON | B_BUTTON))\n    {\n        if (CurrentBattlePyramidLocation() == PYRAMID_LOCATION_NONE)\n            Task_FadeAndCloseBagMenu(taskId);\n        else\n            CloseBattlePyramidBag(taskId);\n    }",
  },
  "Task_UseStatIncreaseItem": {
    callsTo: ["CurrentBattlePyramidLocation","DisplayItemMessage","DisplayItemMessageInBattlePyramid","PlaySE","RemoveBagItem","UseStatIncreaseItem"],
    dataReads: ["data[8]"],
    lineCount: 9,
    bodyC: "if(++gTasks[taskId].data[8] > 7)\n    {\n        PlaySE(SE_USE_ITEM);\n        RemoveBagItem(gSpecialVar_ItemId, 1);\n        if (CurrentBattlePyramidLocation() == PYRAMID_LOCATION_NONE)\n            DisplayItemMessage(taskId, FONT_NORMAL, UseStatIncreaseItem(gSpecialVar_ItemId), Task_CloseStatIncreaseMessage);\n        else\n            DisplayItemMessageInBattlePyramid(taskId, UseStatIncreaseItem(gSpecialVar_ItemId), Task_CloseStatIncreaseMessage);\n    }",
  },
} as const;

export const CB2S = {
  "CB2_CheckMail": {
    callsTo: ["ReadMail"],
    lineCount: 3,
    bodyC: "struct Mail mail;\n    mail.itemId = gSpecialVar_ItemId;\n    ReadMail(&mail, CB2_ReturnToBagMenuPocket, FALSE);",
  },
  "CB2_OpenPokeblockFromBag": {
    callsTo: ["OpenPokeblockCase"],
    lineCount: 1,
    bodyC: "OpenPokeblockCase(PBLOCK_CASE_FIELD, CB2_ReturnToBagMenuPocket);",
  },
} as const;
