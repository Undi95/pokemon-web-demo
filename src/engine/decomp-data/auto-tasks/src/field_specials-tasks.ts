// AUTO-GENERATED from src/field_specials.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 13 Task_, 1 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_PetalburgGymSlideOpenRoomDoors": {
    callsTo: ["ARRAY_COUNT","DestroyTask","PetalburgGymSetDoorMetatiles","ScriptContext_Enable"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 14,
    bodyC: "if (sSlidingDoorNextFrameDelay[sSlidingDoorFrame] == sSlidingDoorNextFrameCounter)\n    {\n        PetalburgGymSetDoorMetatiles(gSpecialVar_0x8004, sPetalburgGymSlidingDoorMetatiles[sSlidingDoorFrame]);\n        sSlidingDoorNextFrameCounter = 0;\n        if ((++sSlidingDoorFrame) == ARRAY_COUNT(sPetalburgGymSlidingDoorMetatiles))\n        {\n            DestroyTask(taskId);\n            ScriptContext_Enable();\n        }\n    }\n    else\n    {\n        sSlidingDoorNextFrameCounter++;\n    }",
  },
  "Task_PCTurnOnEffect": {
    callsTo: ["PCTurnOnEffect"],
    lineCount: 3,
    bodyC: "struct Task *task = &gTasks[taskId];\n    if (!task->tPaused)\n        PCTurnOnEffect(task);",
  },
  "Task_LotteryCornerComputerEffect": {
    callsTo: ["LotteryCornerComputerEffect"],
    lineCount: 3,
    bodyC: "struct Task *task = &gTasks[taskId];\n    if (!task->tPaused)\n        LotteryCornerComputerEffect(task);",
  },
  "Task_ShakeCamera": {
    callsTo: ["InstallCameraPanAheadCallback","SetCameraPanning","StopCameraShake"],
    lineCount: 15,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    tDelayCounter++;\n    if (tDelayCounter % tDelay == 0)\n    {\n        tDelayCounter = 0;\n        tNumShakes--;\n        tHorizontalPan = -tHorizontalPan;\n        tVerticalPan = -tVerticalPan;\n        SetCameraPanning(tHorizontalPan, tVerticalPan);\n        if (tNumShakes == 0)\n        {\n            StopCameraShake(taskId);\n            InstallCameraPanAheadCallback();\n        }\n    }",
  },
  "Task_MoveElevator": {
    callsTo: ["DestroyTask","InstallCameraPanAheadCallback","PlaySE","ScriptContext_Enable","SetCameraPanning"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 16,
    bodyC: "s16 *data = gTasks[taskId].data;\n    tTimer++;\n    if (tTimer % 3 == 0)\n    {\n        tTimer = 0;\n        tMoveCounter++;\n        tVerticalPan = -tVerticalPan;\n        SetCameraPanning(0, tVerticalPan);\n\n        if (tMoveCounter == tTotalMoves)\n        {\n             \n            PlaySE(SE_DING_DONG);\n            DestroyTask(taskId);\n            ScriptContext_Enable();\n            InstallCameraPanAheadCallback();\n        }\n    }",
  },
  "Task_MoveElevatorWindowLights": {
    callsTo: ["DestroyTask","DrawWholeMapView","MapGridSetMetatileIdAt"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 27,
    bodyC: "u8 x, y;\n    s16 *data = gTasks[taskId].data;\n\n    if (tTimer == 6)\n    {\n        tMoveCounter++;\n\n        if (!tDescending)\n        {\n             \n            for (y = 0; y < ELEVATOR_WINDOW_HEIGHT; y++)\n            {\n                for (x = 0; x < ELEVATOR_WINDOW_WIDTH; x++)\n                    MapGridSetMetatileIdAt(x + MAP_OFFSET + 1, y + MAP_OFFSET, sElevatorWindowTiles_Ascending[y][tMoveCounter % ELEVATOR_LIGHT_STAGES] | MAPGRID_IMPASSABLE);\n            }\n        }\n        else\n        {\n             \n            for (y = 0; y < ELEVATOR_WINDOW_HEIGHT; y++)\n            {\n                for (x = 0; x < ELEVATOR_WINDOW_WIDTH; x++)\n                    MapGridSetMetatileIdAt(x + MAP_OFFSET + 1, y + MAP_OFFSET, sElevatorWindowTiles_Descending[y][tMoveCounter % ELEVATOR_LIGHT_STAGES] | MAPGRID_IMPASSABLE);\n            }\n        }\n        DrawWholeMapView();\n        tTimer = 0;\n        if (tMoveCounter == tTotalMoves)\n            DestroyTask(taskId);\n    }\n    tTimer++;",
  },
  "Task_ShowScrollableMultichoice": {
    callsTo: ["AddWindow","AllocZeroed","ConvertPixelWidthToTileWidth","CreateWindowTemplate","DisplayTextAndGetWidth","FillFrontierExchangeCornerWindowAndItemIcon","InitScrollableMultichoice","ListMenuInit","LockPlayerFieldControls","ScheduleBgCopyTilemapToVram","ScrollableMultichoice_UpdateScrollArrows","SetStandardWindowBorderStyle","ShowBattleFrontierTutorWindow"],
    taskTransitions: ["ScrollableMultichoice_ProcessInput"],
    lineCount: 39,
    bodyC: "u32 width;\n    u8 i, windowId;\n    struct WindowTemplate template;\n    struct Task *task = &gTasks[taskId];\n\n    LockPlayerFieldControls();\n    sScrollableMultichoice_ScrollOffset = 0;\n    sScrollableMultichoice_ItemSpriteId = MAX_SPRITES;\n    FillFrontierExchangeCornerWindowAndItemIcon(task->tScrollMultiId, 0);\n    ShowBattleFrontierTutorWindow(task->tScrollMultiId, 0);\n    sScrollableMultichoice_ListMenuItem = AllocZeroed(task->tNumItems * sizeof(struct ListMenuItem));\n    sFrontierExchangeCorner_NeverRead = 0;\n    InitScrollableMultichoice();\n\n    for (width = 0, i = 0; i < task->tNumItems; i++)\n    {\n        const u8 *text = sScrollableMultichoiceOptions[gSpecialVar_0x8004][i];\n        sScrollableMultichoice_ListMenuItem[i].name = text;\n        sScrollableMultichoice_ListMenuItem[i].id = i;\n        width = DisplayTextAndGetWidth(text, width);\n    }\n\n    task->tWidth = ConvertPixelWidthToTileWidth(width);\n\n    if (task->tLeft + task->tWidth > MAX_MULTICHOICE_WIDTH + 1)\n    {\n        int adjustedLeft = MAX_MULTICHOICE_WIDTH + 1 - task->tWidth;\n        if (adjustedLeft < 0)\n            task->tLeft = 0;\n        else\n            task->tLeft = adjustedLeft;\n    }\n\n    template = CreateWindowTemplate(0, task->tLeft, task->tTop, task->tWidth, task->tHeight, 0xF, 0x64);\n    windowId = AddWindow(&template);\n    task->tWindowId = windowId;\n    SetStandardWindowBorderStyle(windowId, FALSE);\n\n    gScrollableMultichoice_ListMenuTemplate.totalItems = task->tNumItems;\n    gScrollableMultichoice_ListMenuTemplate.maxShowed = task->tMaxItemsOnScreen;\n    gScrollableMultichoice_ListMenuTemplate.windowId = task->tWindowId;\n\n    ScrollableMultichoice_UpdateScrollArrows(taskId);\n    task->tListTaskId = ListMenuInit(&gScrollableMultichoice_ListMenuTemplate, task->tScrollOffset, task->tSelectedRow);\n    ScheduleBgCopyTilemapToVram(0);\n    gTasks[taskId].func = ScrollableMultichoice_ProcessInput;",
  },
  "Task_ScrollableMultichoice_WaitReturnToList": {
    taskTransitions: ["Task_ScrollableMultichoice_ReturnToList"],
    dataReads: ["tKeepOpenAfterSelect"],
    dataWrites: ["tKeepOpenAfterSelect"],
    lineCount: 10,
    bodyC: "switch (gTasks[taskId].tKeepOpenAfterSelect)\n    {\n    case 1:\n    default:\n        break;\n    case 2:\n        gTasks[taskId].tKeepOpenAfterSelect = 1;\n        gTasks[taskId].func = Task_ScrollableMultichoice_ReturnToList;\n        break;\n    }",
  },
  "Task_ScrollableMultichoice_ReturnToList": {
    callsTo: ["LockPlayerFieldControls","ScrollableMultichoice_UpdateScrollArrows"],
    taskTransitions: ["ScrollableMultichoice_ProcessInput"],
    lineCount: 3,
    bodyC: "LockPlayerFieldControls();\n    ScrollableMultichoice_UpdateScrollArrows(taskId);\n    gTasks[taskId].func = ScrollableMultichoice_ProcessInput;",
  },
  "Task_DeoxysRockInteraction": {
    callsTo: ["ChangeDeoxysRockLevel","DestroyTask","FlagGet","FlagSet","ScriptContext_Enable","VarGet","VarSet"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 35,
    bodyC: "static const u8 sStoneMaxStepCounts[DEOXYS_ROCK_LEVELS - 1] = { 4, 8, 8, 8, 4, 4, 4, 6, 3, 3 };\n\n    if (FlagGet(FLAG_DEOXYS_ROCK_COMPLETE) == TRUE)\n    {\n        gSpecialVar_Result = DEOXYS_ROCK_COMPLETE;\n        ScriptContext_Enable();\n        DestroyTask(taskId);\n    }\n    else\n    {\n        u16 rockLevel = VarGet(VAR_DEOXYS_ROCK_LEVEL);\n        u16 stepCount = VarGet(VAR_DEOXYS_ROCK_STEP_COUNT);\n\n        VarSet(VAR_DEOXYS_ROCK_STEP_COUNT, 0);\n        if (rockLevel != 0 && sStoneMaxStepCounts[rockLevel - 1] < stepCount)\n        {\n             \n            ChangeDeoxysRockLevel(0);\n            VarSet(VAR_DEOXYS_ROCK_LEVEL, 0);\n            gSpecialVar_Result = DEOXYS_ROCK_FAILED;\n            DestroyTask(taskId);\n        }\n        else if (rockLevel == DEOXYS_ROCK_LEVELS - 1)\n        {\n            FlagSet(FLAG_DEOXYS_ROCK_COMPLETE);\n            gSpecialVar_Result = DEOXYS_ROCK_SOLVED;\n            ScriptContext_Enable();\n            DestroyTask(taskId);\n        }\n        else\n        {\n            rockLevel++;\n            ChangeDeoxysRockLevel(rockLevel);\n            VarSet(VAR_DEOXYS_ROCK_LEVEL, rockLevel);\n            gSpecialVar_Result = DEOXYS_ROCK_PROGRESSED;\n            DestroyTask(taskId);\n        }\n    }",
  },
  "Task_LinkRetireStatusWithBattleTowerPartner": {
    callsTo: ["BitmaskAllOtherLinkPlayers","DestroyTask","FuncIsActiveTask","GetBlockReceivedStatus","GetMultiplayerId","IsLinkTaskFinished","IsTextPrinterActive","ResetBlockReceivedFlag","ScriptContext_Enable","SendBlock","SetCloseLinkCallback","SetLinkStandbyCallback","ShowFieldAutoScrollMessage"],
    dataReads: ["tState"],
    dataWrites: ["tState"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { msgBoxIsCancel: true },
    lineCount: 107,
    bodyC: "switch (gTasks[taskId].tState)\n    {\n    case 0:\n        if (!FuncIsActiveTask(Task_ReconnectWithLinkPlayers))\n            gTasks[taskId].tState++;\n        break;\n    case 1:\n        if (IsLinkTaskFinished() == TRUE)\n        {\n            if (GetMultiplayerId() == 0)\n            {\n                 \n                gTasks[taskId].tState++;\n            }\n            else\n            {\n                 \n                 \n                SendBlock(BitmaskAllOtherLinkPlayers(), &gSpecialVar_0x8004, sizeof(gSpecialVar_0x8004));\n                gTasks[taskId].tState++;\n            }\n        }\n        break;\n    case 2:\n        if (GetBlockReceivedStatus() & 2)\n        {\n            if (GetMultiplayerId() == 0)\n            {\n                 \n                 \n                gSpecialVar_0x8005 = gBlockRecvBuffer[1][0];\n                ResetBlockReceivedFlag(1);\n\n                if (gSpecialVar_0x8004 == BATTLE_TOWER_LINK_RETIRE\n                 && gSpecialVar_0x8005 == BATTLE_TOWER_LINK_RETIRE)\n                    gSpecialVar_Result = BATTLE_TOWER_LINKSTAT_BOTH_RETIRE;\n                else if (gSpecialVar_0x8004 == BATTLE_TOWER_LINK_CONTINUE\n                      && gSpecialVar_0x8005 == BATTLE_TOWER_LINK_RETIRE)\n                    gSpecialVar_Result = BATTLE_TOWER_LINKSTAT_MEMBER_RETIRE;\n                else if (gSpecialVar_0x8004 == BATTLE_TOWER_LINK_RETIRE\n                      && gSpecialVar_0x8005 == BATTLE_TOWER_LINK_CONTINUE)\n                    gSpecialVar_Result = BATTLE_TOWER_LINKSTAT_LEADER_RETIRE;\n                else\n                    gSpecialVar_Result = BATTLE_TOWER_LINKSTAT_CONTINUE;\n            }\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 3:\n        if (IsLinkTaskFinished() == TRUE)\n        {\n            if (GetMultiplayerId() != 0)\n            {\n                 \n                gTasks[taskId].tState++;\n            }\n            else\n            {\n                 \n                SendBlock(BitmaskAllOtherLinkPlayers(), &gSpecialVar_Result, sizeof(gSpecialVar_Result));\n                gTasks[taskId].tState++;\n            }\n        }\n        break;\n    case 4:\n        if (GetBlockReceivedStatus() & 1)\n        {\n            if (GetMultiplayerId() != 0)\n            {\n                 \n                gSpecialVar_Result = gBlockRecvBuffer[0][0];\n                ResetBlockReceivedFlag(0);\n                gTasks[taskId].tState++;\n            }\n            else\n            {\n                gTasks[taskId].tState++;\n            }\n        }\n        break;\n    case 5:\n         \n        if (GetMultiplayerId() == 0)\n        {\n            if (gSpecialVar_Result == BATTLE_TOWER_LINKSTAT_MEMBER_RETIRE)\n                ShowFieldAutoScrollMessage(gText_YourPartnerHasRetired);\n        }\n        else\n        {\n            if (gSpecialVar_Result == BATTLE_TOWER_LINKSTAT_LEADER_RETIRE)\n                ShowFieldAutoScrollMessage(gText_YourPartnerHasRetired);\n        }\n        gTasks[taskId].tState++;\n        break;\n    case 6:\n        if (!IsTextPrinterActive(0))\n            gTasks[taskId].tState++;\n        break;\n    case 7:\n        if (IsLinkTaskFinished() == TRUE)\n        {\n            SetLinkStandbyCallback();\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 8:\n        if (IsLinkTaskFinished() == TRUE)\n            gTasks[taskId].tState++;\n        break;\n    case 9:\n        if (gWirelessCommType == 0)\n            SetCloseLinkCallback();\n\n        gBattleTypeFlags = sBattleTowerMultiBattleTypeFlags;\n        ScriptContext_Enable();\n        DestroyTask(taskId);\n        break;\n    }",
  },
  "Task_LoopWingFlapSE": {
    callsTo: ["DestroyTask","PlaySE"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 10,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    delay++;\n    if (delay == gSpecialVar_0x8005)\n    {\n        playCount++;\n        delay = 0;\n        PlaySE(SE_M_WING_ATTACK);\n    }\n\n    if (playCount == gSpecialVar_0x8004 - 1)\n        DestroyTask(taskId);",
  },
  "Task_CloseBattlePikeCurtain": {
    callsTo: ["DestroyTask","DrawWholeMapView","MapGridSetMetatileIdAt","ScriptContext_Enable"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 22,
    bodyC: "u8 x, y;\n    s16 *data = gTasks[taskId].data;\n\n    tFrameTimer[tCurrentFrame]--;\n    if (tFrameTimer[tCurrentFrame] == 0)\n    {\n        for (y = 0; y < CURTAIN_HEIGHT; y++)\n        {\n            for (x = 0; x < CURTAIN_WIDTH; x++)\n            {\n                MapGridSetMetatileIdAt(gSaveBlock1Ptr->pos.x + x + MAP_OFFSET - 1,\n                                       gSaveBlock1Ptr->pos.y + y + MAP_OFFSET - 3,\n                                       (x + METATILE_BattlePike_CurtainFrames_Start) + (y * METATILE_ROW_WIDTH) + (tCurrentFrame * CURTAIN_HEIGHT * METATILE_ROW_WIDTH));\n            }\n        }\n        DrawWholeMapView();\n        tCurrentFrame++;\n        if (tCurrentFrame == 3)\n        {\n            DestroyTask(taskId);\n            ScriptContext_Enable();\n        }\n    }",
  },
} as const;

export const CB2S = {
  "CB2_FieldShowRegionMap": {
    callsTo: ["FieldInitRegionMap"],
    lineCount: 1,
    bodyC: "FieldInitRegionMap(CB2_ReturnToFieldContinueScriptPlayMapMusic);",
  },
} as const;
