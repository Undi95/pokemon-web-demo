// AUTO-GENERATED from src/cable_club.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 25 Task_, 2 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_LinkupStart": {
    callsTo: ["AddWindow","OpenLinkTimed","ResetLinkPlayerCount","ResetLinkPlayers"],
    taskTransitions: ["Task_LinkupAwaitConnection"],
    lineCount: 13,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (data[0] == 0)\n    {\n        OpenLinkTimed();\n        ResetLinkPlayerCount();\n        ResetLinkPlayers();\n        tWindowId = AddWindow(&sWindowTemplate_LinkPlayerCount);\n    }\n    else if (data[0] > 9)\n    {\n        gTasks[taskId].func = Task_LinkupAwaitConnection;\n    }\n    data[0]++;",
  },
  "Task_LinkupAwaitConnection": {
    callsTo: ["CheckLinkCanceled","CheckLinkCanceledBeforeConnection","GetLinkPlayerCount_2","IsLinkMaster","PlaySE","SetSuppressLinkErrorMessage","ShowFieldAutoScrollMessage"],
    taskTransitions: ["Task_LinkupConfirmWhenReady","Task_LinkupExchangeDataWithLeader"],
    dataWrites: ["data[3]"],
    lineCount: 19,
    bodyC: "u32 playerCount = GetLinkPlayerCount_2();\n\n    if (CheckLinkCanceledBeforeConnection(taskId) == TRUE\n     || CheckLinkCanceled(taskId) == TRUE\n     || playerCount < 2)\n        return;\n\n    SetSuppressLinkErrorMessage(TRUE);\n    gTasks[taskId].data[3] = 0;\n    if (IsLinkMaster() == TRUE)\n    {\n        PlaySE(SE_PIN);\n        ShowFieldAutoScrollMessage(gText_ConfirmLinkWhenPlayersReady);\n        gTasks[taskId].func = Task_LinkupConfirmWhenReady;\n    }\n    else\n    {\n        PlaySE(SE_BOO);\n        ShowFieldAutoScrollMessage(gText_AwaitingLinkup);\n        gTasks[taskId].func = Task_LinkupExchangeDataWithLeader;\n    }",
  },
  "Task_LinkupConfirmWhenReady": {
    callsTo: ["CheckLinkCanceledBeforeConnection","CheckLinkErrored","CheckSioErrored","GetFieldMessageBoxMode"],
    taskTransitions: ["Task_LinkupAwaitConfirmation"],
    dataWrites: ["tNumPlayers"],
    lineCount: 9,
    bodyC: "if (CheckLinkCanceledBeforeConnection(taskId) == TRUE\n     || CheckSioErrored(taskId) == TRUE\n     || CheckLinkErrored(taskId) == TRUE)\n        return;\n\n    if (GetFieldMessageBoxMode() == FIELD_MESSAGE_BOX_HIDDEN)\n    {\n        gTasks[taskId].tNumPlayers = 0;\n        gTasks[taskId].func = Task_LinkupAwaitConfirmation;\n    }",
  },
  "Task_LinkupAwaitConfirmation": {
    callsTo: ["CheckLinkCanceledBeforeConnection","CheckLinkErrored","CheckSioErrored","ClearLinkPlayerCountWindow","ConvertIntToDecimalStringN","GetLinkPlayerCount_2","JOY_NEW","SaveLinkPlayers","ShowFieldAutoScrollMessage","UpdateLinkPlayerCountDisplay"],
    taskTransitions: ["Task_LinkupTryConfirmation"],
    externalChecks: { joyButtons: ["NEW:A_BUTTON"] },
    lineCount: 16,
    bodyC: "s16 *data = gTasks[taskId].data;\n    s32 linkPlayerCount = GetLinkPlayerCount_2();\n\n    if (CheckLinkCanceledBeforeConnection(taskId) == TRUE\n     || CheckSioErrored(taskId) == TRUE\n     || CheckLinkErrored(taskId) == TRUE)\n        return;\n\n    UpdateLinkPlayerCountDisplay(taskId, linkPlayerCount);\n\n    if (!(JOY_NEW(A_BUTTON)))\n        return;\n\n    if (linkPlayerCount < tMinPlayers)\n        return;\n\n    SaveLinkPlayers(linkPlayerCount);\n    ClearLinkPlayerCountWindow(tWindowId);\n    ConvertIntToDecimalStringN(gStringVar1, linkPlayerCount, STR_CONV_MODE_LEFT_ALIGN, 1);\n    ShowFieldAutoScrollMessage(gText_ConfirmStartLinkWithXPlayers);\n    gTasks[taskId].func = Task_LinkupTryConfirmation;",
  },
  "Task_LinkupTryConfirmation": {
    callsTo: ["CheckLinkCanceledBeforeConnection","CheckLinkErrored","CheckShouldAdvanceLinkState","CheckSioErrored","GetFieldMessageBoxMode","GetLinkPlayerCount_2","GetSavedPlayerCount","JOY_HELD","PlaySE","ShowFieldAutoScrollMessage"],
    taskTransitions: ["Task_LinkupConfirm","Task_LinkupConfirmWhenReady"],
    externalChecks: { joyButtons: ["HELD:A_BUTTON","HELD:B_BUTTON"] },
    lineCount: 23,
    bodyC: "if (CheckLinkCanceledBeforeConnection(taskId) == TRUE\n     || CheckSioErrored(taskId) == TRUE\n     || CheckLinkErrored(taskId) == TRUE)\n        return;\n\n    if (GetFieldMessageBoxMode() == FIELD_MESSAGE_BOX_HIDDEN)\n    {\n        if (GetSavedPlayerCount() != GetLinkPlayerCount_2())\n        {\n            ShowFieldAutoScrollMessage(gText_ConfirmLinkWhenPlayersReady);\n            gTasks[taskId].func = Task_LinkupConfirmWhenReady;\n        }\n        else if (JOY_HELD(B_BUTTON))\n        {\n            ShowFieldAutoScrollMessage(gText_ConfirmLinkWhenPlayersReady);\n            gTasks[taskId].func = Task_LinkupConfirmWhenReady;\n        }\n        else if (JOY_HELD(A_BUTTON))\n        {\n            PlaySE(SE_SELECT);\n            CheckShouldAdvanceLinkState();\n            gTasks[taskId].func = Task_LinkupConfirm;\n        }\n    }",
  },
  "Task_LinkupConfirm": {
    callsTo: ["CheckLinkErrored","ExchangeDataAndGetLinkupStatus","GetLinkPlayerCount_2","GetSavedPlayerCount","TryLinkTimeout"],
    taskTransitions: ["Task_LinkupCheckStatusAfterConfirm","Task_LinkupConnectionError"],
    dataReads: ["tMaxPlayers","tMinPlayers"],
    lineCount: 15,
    bodyC: "u8 minPlayers = gTasks[taskId].tMinPlayers;\n    u8 maxPlayers = gTasks[taskId].tMaxPlayers;\n\n    if (CheckLinkErrored(taskId) == TRUE\n     || TryLinkTimeout(taskId) == TRUE)\n        return;\n\n    if (GetLinkPlayerCount_2() != GetSavedPlayerCount())\n    {\n        gTasks[taskId].func = Task_LinkupConnectionError;\n    }\n    else\n    {\n        gSpecialVar_Result = ExchangeDataAndGetLinkupStatus(minPlayers, maxPlayers);\n        if (gSpecialVar_Result != LINKUP_ONGOING)\n            gTasks[taskId].func = Task_LinkupCheckStatusAfterConfirm;\n    }",
  },
  "Task_LinkupExchangeDataWithLeader": {
    callsTo: ["CheckLinkCanceledBeforeConnection","CheckLinkErrored","CloseLink","ExchangeDataAndGetLinkupStatus","GetLinkPlayerCount_2","GetMonData","GetMultiplayerId","HideFieldMessageBox","SaveLinkPlayers","SetCloseLinkCallback","TrainerCard_GenerateCardForLinkPlayer"],
    taskTransitions: ["Task_LinkupAwaitTrainerCardData","Task_StopLinkup"],
    dataReads: ["tMaxPlayers","tMinPlayers"],
    lineCount: 35,
    bodyC: "u8 minPlayers, maxPlayers;\n    struct TrainerCard *card;\n\n    minPlayers = gTasks[taskId].tMinPlayers;\n    maxPlayers = gTasks[taskId].tMaxPlayers;\n\n    if (CheckLinkCanceledBeforeConnection(taskId) == TRUE\n     || CheckLinkErrored(taskId) == TRUE)\n        return;\n\n    gSpecialVar_Result = ExchangeDataAndGetLinkupStatus(minPlayers, maxPlayers);\n    if (gSpecialVar_Result == LINKUP_ONGOING)\n        return;\n    if (gSpecialVar_Result == LINKUP_DIFF_SELECTIONS\n     || gSpecialVar_Result == LINKUP_WRONG_NUM_PLAYERS)\n    {\n        SetCloseLinkCallback();\n        HideFieldMessageBox();\n        gTasks[taskId].func = Task_StopLinkup;\n    }\n    else if (gSpecialVar_Result == LINKUP_PLAYER_NOT_READY\n          || gSpecialVar_Result == LINKUP_PARTNER_NOT_READY)\n    {\n        CloseLink();\n        HideFieldMessageBox();\n        gTasks[taskId].func = Task_StopLinkup;\n    }\n    else\n    {\n        gFieldLinkPlayerCount = GetLinkPlayerCount_2();\n        gLocalLinkPlayerId = GetMultiplayerId();\n        SaveLinkPlayers(gFieldLinkPlayerCount);\n        card = (struct TrainerCard *)gBlockSendBuffer;\n        TrainerCard_GenerateCardForLinkPlayer(card);\n        card->monSpecies[0] = GetMonData(&gPlayerParty[gSelectedOrderFromParty[0] - 1], MON_DATA_SPECIES, NULL);\n        card->monSpecies[1] = GetMonData(&gPlayerParty[gSelectedOrderFromParty[1] - 1], MON_DATA_SPECIES, NULL);\n        gTasks[taskId].func = Task_LinkupAwaitTrainerCardData;\n    }",
  },
  "Task_LinkupCheckStatusAfterConfirm": {
    callsTo: ["CheckLinkErrored","CloseLink","GetLinkPlayerCount_2","GetMonData","GetMultiplayerId","HideFieldMessageBox","Link_AnyPartnersPlayingRubyOrSapphire","SaveLinkPlayers","SendBlockRequest","SetCloseLinkCallback","TrainerCard_GenerateCardForLinkPlayer"],
    taskTransitions: ["Task_LinkupAwaitTrainerCardData","Task_StopLinkup"],
    lineCount: 43,
    bodyC: "struct TrainerCard *card;\n\n    if (CheckLinkErrored(taskId) == TRUE)\n        return;\n\n    if (gSpecialVar_Result == LINKUP_WRONG_NUM_PLAYERS)\n    {\n        if (!Link_AnyPartnersPlayingRubyOrSapphire())\n        {\n            SetCloseLinkCallback();\n            HideFieldMessageBox();\n            gTasks[taskId].func = Task_StopLinkup;\n        }\n        else\n        {\n            CloseLink();\n            HideFieldMessageBox();\n            gTasks[taskId].func = Task_StopLinkup;\n        }\n    }\n    else if (gSpecialVar_Result == LINKUP_DIFF_SELECTIONS)\n    {\n        SetCloseLinkCallback();\n        HideFieldMessageBox();\n        gTasks[taskId].func = Task_StopLinkup;\n    }\n    else if (gSpecialVar_Result == LINKUP_PLAYER_NOT_READY\n          || gSpecialVar_Result == LINKUP_PARTNER_NOT_READY)\n    {\n        CloseLink();\n        HideFieldMessageBox();\n        gTasks[taskId].func = Task_StopLinkup;\n    }\n    else\n    {\n        gFieldLinkPlayerCount = GetLinkPlayerCount_2();\n        gLocalLinkPlayerId = GetMultiplayerId();\n        SaveLinkPlayers(gFieldLinkPlayerCount);\n        card = (struct TrainerCard *)gBlockSendBuffer;\n        TrainerCard_GenerateCardForLinkPlayer(card);\n        card->monSpecies[0] = GetMonData(&gPlayerParty[gSelectedOrderFromParty[0] - 1], MON_DATA_SPECIES, NULL);\n        card->monSpecies[1] = GetMonData(&gPlayerParty[gSelectedOrderFromParty[1] - 1], MON_DATA_SPECIES, NULL);\n        gTasks[taskId].func = Task_LinkupAwaitTrainerCardData;\n        SendBlockRequest(BLOCK_REQ_SIZE_100);\n    }",
  },
  "Task_LinkupAwaitTrainerCardData": {
    callsTo: ["CheckLinkErrored","CopyTrainerCardData","FinishLinkup","GetBlockReceivedStatus","GetLinkPlayerCount","GetSavedLinkPlayerCountAsBitFlags","ResetBlockReceivedFlags","SetSuppressLinkErrorMessage"],
    lineCount: 12,
    bodyC: "u8 index;\n\n    if (CheckLinkErrored(taskId) == TRUE)\n        return;\n\n    if (GetBlockReceivedStatus() != GetSavedLinkPlayerCountAsBitFlags())\n        return;\n\n    for (index = 0; index < GetLinkPlayerCount(); index++)\n    {\n        CopyTrainerCardData(&gTrainerCards[index], (struct TrainerCard *)gBlockRecvBuffer[index], gLinkPlayers[index].version);\n    }\n\n    SetSuppressLinkErrorMessage(FALSE);\n    ResetBlockReceivedFlags();\n    FinishLinkup(&gSpecialVar_Result, taskId);",
  },
  "Task_StopLinkup": {
    callsTo: ["ClearLinkPlayerCountWindow","DestroyTask","RemoveWindow","ScriptContext_Enable"],
    dataReads: ["tWindowId"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 7,
    bodyC: "if (!gReceivedRemoteLinkPlayers)\n    {\n        ClearLinkPlayerCountWindow(gTasks[taskId].tWindowId);\n        ScriptContext_Enable();\n        RemoveWindow(gTasks[taskId].tWindowId);\n        DestroyTask(taskId);\n    }",
  },
  "Task_LinkupFailed": {
    callsTo: ["ClearLinkPlayerCountWindow","DestroyTask","RemoveWindow","ScriptContext_Enable","StopFieldMessage"],
    dataReads: ["tWindowId"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 6,
    bodyC: "gSpecialVar_Result = LINKUP_FAILED;\n    ClearLinkPlayerCountWindow(gTasks[taskId].tWindowId);\n    StopFieldMessage();\n    RemoveWindow(gTasks[taskId].tWindowId);\n    ScriptContext_Enable();\n    DestroyTask(taskId);",
  },
  "Task_LinkupConnectionError": {
    callsTo: ["ClearLinkPlayerCountWindow","DestroyTask","HideFieldMessageBox","RemoveWindow","ScriptContext_Enable"],
    dataReads: ["tWindowId"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 6,
    bodyC: "gSpecialVar_Result = LINKUP_CONNECTION_ERROR;\n    ClearLinkPlayerCountWindow(gTasks[taskId].tWindowId);\n    RemoveWindow(gTasks[taskId].tWindowId);\n    HideFieldMessageBox();\n    ScriptContext_Enable();\n    DestroyTask(taskId);",
  },
  "Task_ValidateMixingGameLanguage": {
    callsTo: ["DestroyTask","GetLinkPlayerCount","ScriptContext_Enable","SetCloseLinkCallbackHandleJP"],
    dataReads: ["tState"],
    dataWrites: ["tState"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 58,
    bodyC: "int playerCount;\n    int i;\n\n    switch (gTasks[taskId].tState)\n    {\n    case 0:\n        if (gSpecialVar_Result == LINKUP_SUCCESS)\n        {\n            bool32 mixingForeignGames = FALSE;\n            bool32 isEnglishRSLinked = FALSE;\n            bool32 isJapaneseEmeraldLinked = FALSE;\n\n            playerCount = GetLinkPlayerCount();\n            for (i = 0; i < playerCount; i++)\n            {\n                u32 version = (u8)gLinkPlayers[i].version;\n                u32 language = gLinkPlayers[i].language;\n\n                if (version == VERSION_RUBY || version == VERSION_SAPPHIRE)\n                {\n                    if (language == LANGUAGE_JAPANESE)\n                    {\n                        mixingForeignGames = TRUE;\n                        break;\n                    }\n                    else\n                    {\n                        isEnglishRSLinked = TRUE;\n                    }\n                }\n                else if (version == VERSION_EMERALD)\n                {\n                    if (language == LANGUAGE_JAPANESE)\n                    {\n                        isJapaneseEmeraldLinked = TRUE;\n                    }\n                }\n            }\n\n            if (isEnglishRSLinked && isJapaneseEmeraldLinked)\n            {\n                mixingForeignGames = TRUE;\n            }\n\n            if (mixingForeignGames)\n            {\n                gSpecialVar_Result = LINKUP_FOREIGN_GAME;\n                SetCloseLinkCallbackHandleJP();\n                gTasks[taskId].tState = 1;\n                return;\n            }\n        }\n        ScriptContext_Enable();\n        DestroyTask(taskId);\n        break;\n    case 1:\n        if (!gReceivedRemoteLinkPlayers)\n        {\n            ScriptContext_Enable();\n            DestroyTask(taskId);\n        }\n        break;\n    }",
  },
  "Task_ReestablishLink": {
    callsTo: ["CreateTask","OpenLink","ResetLinkPlayers"],
    taskTransitions: ["Task_ReestablishLinkAwaitConnection"],
    lineCount: 12,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (data[0] == 0)\n    {\n        OpenLink();\n        ResetLinkPlayers();\n        CreateTask(Task_WaitForLinkPlayerConnection, 80);\n    }\n    else if (data[0] >= 10)\n    {\n        gTasks[taskId].func = Task_ReestablishLinkAwaitConnection;\n    }\n    data[0]++;",
  },
  "Task_ReestablishLinkAwaitConnection": {
    callsTo: ["GetLinkPlayerCount_2","IsLinkMaster"],
    taskTransitions: ["Task_ReestablishLinkAwaitConfirmation","Task_ReestablishLinkLeader"],
    lineCount: 7,
    bodyC: "if (GetLinkPlayerCount_2() >= 2)\n    {\n        if (IsLinkMaster() == TRUE)\n            gTasks[taskId].func = Task_ReestablishLinkLeader;\n        else\n            gTasks[taskId].func = Task_ReestablishLinkAwaitConfirmation;\n    }",
  },
  "Task_ReestablishLinkLeader": {
    callsTo: ["CheckShouldAdvanceLinkState","GetLinkPlayerCount_2","GetSavedPlayerCount"],
    taskTransitions: ["Task_ReestablishLinkAwaitConfirmation"],
    lineCount: 5,
    bodyC: "if (GetSavedPlayerCount() == GetLinkPlayerCount_2())\n    {\n        CheckShouldAdvanceLinkState();\n        gTasks[taskId].func = Task_ReestablishLinkAwaitConfirmation;\n    }",
  },
  "Task_ReestablishLinkAwaitConfirmation": {
    callsTo: ["CheckLinkPlayersMatchSaved","DestroyTask","IsLinkPlayerDataExchangeComplete","StartSendingKeysToLink"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 7,
    bodyC: "if (gReceivedRemoteLinkPlayers == TRUE\n     && IsLinkPlayerDataExchangeComplete() == TRUE)\n    {\n        CheckLinkPlayersMatchSaved();\n        StartSendingKeysToLink();\n        DestroyTask(taskId);\n    }",
  },
  "Task_StartWiredCableClubBattle": {
    callsTo: ["CleanupOverworldWindowsAndTilemaps","ClearLinkCallback_2","DestroyTask","FadeScreen","PlayMapChosenOrBattleBGM","SetCloseLinkCallback","SetLinkBattleTypeFlags","SetMainCallback2"],
    cb2Transitions: ["CB2_InitBattle"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 39,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    switch (task->tState)\n    {\n    case 0:\n        FadeScreen(FADE_TO_BLACK, 0);\n        gLinkType = LINKTYPE_BATTLE;\n        ClearLinkCallback_2();\n        task->tState++;\n        break;\n    case 1:\n        if (!gPaletteFade.active)\n            task->tState++;\n        break;\n    case 2:\n        task->tTimer++;\n        if (task->tTimer > 20)\n            task->tState++;\n        break;\n    case 3:\n        SetCloseLinkCallback();\n        task->tState++;\n        break;\n    case 4:\n        if (!gReceivedRemoteLinkPlayers)\n            task->tState++;\n        break;\n    case 5:\n        if (gLinkPlayers[0].trainerId & 1)\n            PlayMapChosenOrBattleBGM(MUS_VS_GYM_LEADER);\n        else\n            PlayMapChosenOrBattleBGM(MUS_VS_TRAINER);\n\n        SetLinkBattleTypeFlags(gSpecialVar_0x8004);\n        CleanupOverworldWindowsAndTilemaps();\n        gTrainerBattleOpponent_A = TRAINER_LINK_OPPONENT;\n        SetMainCallback2(CB2_InitBattle);\n        gMain.savedCallback = CB2_ReturnFromCableClubBattle;\n        DestroyTask(taskId);\n        break;\n    }",
  },
  "Task_StartWirelessCableClubBattle": {
    callsTo: ["CleanupOverworldWindowsAndTilemaps","ClearLinkCallback_2","ConvertLinkPlayerName","DestroyTask","FadeScreen","GetBlockReceivedStatus","GetLinkPlayerCount","GetLinkPlayerCountAsBitFlags","IsLinkTaskFinished","PlayMapChosenOrBattleBGM","ResetBlockReceivedFlag","SendBlock","SetLinkBattleTypeFlags","SetLinkStandbyCallback","SetMainCallback2"],
    cb2Transitions: ["CB2_InitBattle"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 60,
    bodyC: "int i;\n    s16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n    case 0:\n        FadeScreen(FADE_TO_BLACK, 0);\n        gLinkType = LINKTYPE_BATTLE;\n        ClearLinkCallback_2();\n        tState = 1;\n        break;\n    case 1:\n        if (!gPaletteFade.active)\n            tState = 2;\n        break;\n    case 2:\n        SendBlock(0, &gLocalLinkPlayer, sizeof(gLocalLinkPlayer));\n        tState = 3;\n        break;\n    case 3:\n        if (GetBlockReceivedStatus() == GetLinkPlayerCountAsBitFlags())\n        {\n            for (i = 0; i < GetLinkPlayerCount(); i++)\n            {\n                struct LinkPlayer *player = (struct LinkPlayer *)gBlockRecvBuffer[i];\n                gLinkPlayers[i] = *player;\n                ConvertLinkPlayerName(&gLinkPlayers[i]);\n                ResetBlockReceivedFlag(i);\n            }\n            tState = 4;\n        }\n        break;\n    case 4:\n        tTimer++;\n        if (tTimer > 20)\n            tState = 5;\n        break;\n    case 5:\n        SetLinkStandbyCallback();\n        tState = 6;\n        break;\n    case 6:\n        if (IsLinkTaskFinished())\n        {\n            tState = 7;\n        }\n        break;\n    case 7:\n        if (gLinkPlayers[0].trainerId & 1)\n            PlayMapChosenOrBattleBGM(MUS_VS_GYM_LEADER);\n        else\n            PlayMapChosenOrBattleBGM(MUS_VS_TRAINER);\n\n        gLinkPlayers[0].linkType = LINKTYPE_BATTLE;\n        SetLinkBattleTypeFlags(gSpecialVar_0x8004);\n        CleanupOverworldWindowsAndTilemaps();\n        gTrainerBattleOpponent_A = TRAINER_LINK_OPPONENT;\n        SetMainCallback2(CB2_InitBattle);\n        gMain.savedCallback = CB2_ReturnFromCableClubBattle;\n        DestroyTask(taskId);\n        break;\n    }",
  },
  "Task_EnterCableClubSeat": {
    callsTo: ["DestroyTask","EraseFieldMessageBox","GetCableClubPartnersReady","HideFieldMessageBox","IsFieldMessageBoxHidden","ScriptContext_Enable","SetInCableClubSeat","SetLinkWaitingForScript","SetLocalLinkPlayerId","SetStartedCableClubActivity","ShowFieldMessage","SwitchTaskToFollowupFunc"],
    terminalMarkers: ["DestroyTask","SwitchTaskToFollowupFunc"],
    lineCount: 38,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    switch (task->tState)\n    {\n    case 0:\n        ShowFieldMessage(gText_PleaseWaitForLink);\n        task->tState = 1;\n        break;\n    case 1:\n        if (IsFieldMessageBoxHidden())\n        {\n            SetInCableClubSeat();\n            SetLocalLinkPlayerId(gSpecialVar_0x8005);\n            task->tState = 2;\n        }\n        break;\n    case 2:\n        switch (GetCableClubPartnersReady())\n        {\n        case CABLE_SEAT_WAITING:\n            break;\n        case CABLE_SEAT_SUCCESS:\n             \n            HideFieldMessageBox();\n            task->tState = 0;\n            SetStartedCableClubActivity();\n            SwitchTaskToFollowupFunc(taskId);\n            break;\n        case CABLE_SEAT_FAILED:\n            task->tState = 3;\n            break;\n        }\n        break;\n    case 3:\n         \n        SetLinkWaitingForScript();\n        EraseFieldMessageBox(TRUE);\n        DestroyTask(taskId);\n        ScriptContext_Enable();\n        break;\n    }",
  },
  "Task_StartWiredTrade": {
    callsTo: ["ClearLinkCallback_2","DestroyTask","FadeScreen","LockPlayerFieldControls","SetCloseLinkCallback","SetMainCallback2","m4aMPlayAllStop"],
    cb2Transitions: ["CB2_StartCreateTradeMenu"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 28,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    switch (task->tState)\n    {\n    case 0:\n        LockPlayerFieldControls();\n        FadeScreen(FADE_TO_BLACK, 0);\n        ClearLinkCallback_2();\n        task->tState++;\n        break;\n    case 1:\n        if (!gPaletteFade.active)\n            task->tState++;\n        break;\n    case 2:\n        gSelectedTradeMonPositions[TRADE_PLAYER] = 0;\n        gSelectedTradeMonPositions[TRADE_PARTNER] = 0;\n        m4aMPlayAllStop();\n        SetCloseLinkCallback();\n        task->tState++;\n        break;\n    case 3:\n        if (!gReceivedRemoteLinkPlayers)\n        {\n            SetMainCallback2(CB2_StartCreateTradeMenu);\n            DestroyTask(taskId);\n        }\n        break;\n    }",
  },
  "Task_StartWirelessTrade": {
    callsTo: ["ClearLinkRfuCallback","CreateTask_CreateTradeMenu","DestroyTask","FadeScreen","IsLinkTaskFinished","LockPlayerFieldControls","SetLinkStandbyCallback","m4aMPlayAllStop"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 28,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n    case 0:\n        LockPlayerFieldControls();\n        FadeScreen(FADE_TO_BLACK, 0);\n        ClearLinkRfuCallback();\n        tState++;\n        break;\n    case 1:\n        if (!gPaletteFade.active)\n            tState++;\n        break;\n    case 2:\n        gSelectedTradeMonPositions[TRADE_PLAYER] = 0;\n        gSelectedTradeMonPositions[TRADE_PARTNER] = 0;\n        m4aMPlayAllStop();\n        SetLinkStandbyCallback();\n        tState++;\n        break;\n    case 3:\n        if (IsLinkTaskFinished())\n        {\n            CreateTask_CreateTradeMenu();\n            DestroyTask(taskId);\n        }\n        break;\n    }",
  },
  "Task_WaitForLinkPlayerConnection": {
    callsTo: ["CloseLink","DestroyTask","DoesLinkPlayerCountMatchSaved","SetMainCallback2"],
    cb2Transitions: ["CB2_LinkError"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 24,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    task->tTimer++;\n    if (task->tTimer > 480)  \n    {\n        CloseLink();\n        SetMainCallback2(CB2_LinkError);\n        DestroyTask(taskId);\n    }\n\n    if (gReceivedRemoteLinkPlayers)\n    {\n         \n        if (gWirelessCommType == 0)\n        {\n            if (!DoesLinkPlayerCountMatchSaved())\n            {\n                CloseLink();\n                SetMainCallback2(CB2_LinkError);\n            }\n            DestroyTask(taskId);\n        }\n        else\n        {\n            DestroyTask(taskId);\n        }\n    }",
  },
  "Task_WaitExitToScript": {
    callsTo: ["DestroyTask","ScriptContext_Enable"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 5,
    bodyC: "if (!gReceivedRemoteLinkPlayers)\n    {\n        ScriptContext_Enable();\n        DestroyTask(taskId);\n    }",
  },
  "Task_ReconnectWithLinkPlayers": {
    callsTo: ["CheckShouldAdvanceLinkState","CreateTask","DestroyTask","GetLinkPlayerCount_2","GetSavedPlayerCount","IsLinkMaster","IsLinkPlayerDataExchangeComplete","OpenLink"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 46,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n    case 0:\n        if (gWirelessCommType != 0)\n        {\n            DestroyTask(taskId);\n        }\n        else\n        {\n            OpenLink();\n            CreateTask(Task_WaitForLinkPlayerConnection, 1);\n            tState++;\n        }\n        break;\n    case 1:\n        if (++tTimer > 11)\n        {\n            tTimer = 0;\n            tState++;\n        }\n        break;\n    case 2:\n        if (GetLinkPlayerCount_2() >= GetSavedPlayerCount())\n        {\n            if (IsLinkMaster())\n            {\n                if (++tTimer > 30)\n                {\n                    CheckShouldAdvanceLinkState();\n                    tState++;\n                }\n            }\n            else\n            {\n                tState++;\n            }\n        }\n        break;\n    case 3:\n        if (gReceivedRemoteLinkPlayers == TRUE && IsLinkPlayerDataExchangeComplete() == TRUE)\n        {\n            DestroyTask(taskId);\n        }\n        break;\n    }",
  },
} as const;

export const CB2S = {
  "CB2_ReturnFromUnionRoomBattle": {
    callsTo: ["GetLinkPlayerCount","RunTasks","SetCloseLinkCallback","SetMainCallback2"],
    cb2Transitions: ["CB2_ReturnToField"],
    lineCount: 38,
    bodyC: "u8 playerCount;\n    int i;\n    bool32 linkedWithFRLG;\n\n    switch (gMain.state)\n    {\n    case 0:\n        playerCount = GetLinkPlayerCount();\n        linkedWithFRLG = FALSE;\n        for (i = 0; i < playerCount; i++)\n        {\n            u32 version = (u8)gLinkPlayers[i].version;\n            if (version == VERSION_FIRE_RED || version == VERSION_LEAF_GREEN)\n            {\n                linkedWithFRLG = TRUE;\n                break;\n            }\n        }\n\n        if (linkedWithFRLG)\n        {\n            gMain.state = 2;\n        }\n        else\n        {\n            SetCloseLinkCallback();\n            gMain.state = 1;\n        }\n        break;\n    case 1:\n        if (!gReceivedRemoteLinkPlayers)\n        {\n            SetMainCallback2(CB2_ReturnToField);\n        }\n        break;\n    case 2:\n        SetMainCallback2(CB2_ReturnToField);\n        break;\n    }\n    RunTasks();",
  },
  "CB2_ReturnFromCableClubBattle": {
    callsTo: ["GetMultiplayerId","InUnionRoom","LoadPlayerParty","MysteryGift_TryIncrementStat","Overworld_ResetMapMusic","SavePlayerBag","SetMainCallback2","UpdatePlayerLinkBattleRecords","UpdateTrainerFansAfterLinkBattle"],
    cb2Transitions: ["CB2_SetUpSaveAfterLinkBattle"],
    lineCount: 26,
    bodyC: "gBattleTypeFlags &= ~BATTLE_TYPE_LINK_IN_BATTLE;\n    Overworld_ResetMapMusic();\n    LoadPlayerParty();\n    SavePlayerBag();\n    UpdateTrainerFansAfterLinkBattle();\n\n    if (gSpecialVar_0x8004 == USING_SINGLE_BATTLE || gSpecialVar_0x8004 == USING_DOUBLE_BATTLE)\n    {\n        UpdatePlayerLinkBattleRecords(gLocalLinkPlayerId ^ 1);\n        if (gWirelessCommType)\n        {\n            switch (gBattleOutcome)\n            {\n            case B_OUTCOME_WON:\n                MysteryGift_TryIncrementStat(CARD_STAT_BATTLES_WON, gLinkPlayers[GetMultiplayerId() ^ 1].trainerId);\n                break;\n            case B_OUTCOME_LOST:\n                MysteryGift_TryIncrementStat(CARD_STAT_BATTLES_LOST, gLinkPlayers[GetMultiplayerId() ^ 1].trainerId);\n                break;\n            }\n        }\n    }\n\n    if (InUnionRoom() == TRUE)\n        gMain.savedCallback = CB2_ReturnFromUnionRoomBattle;\n    else\n        gMain.savedCallback = CB2_ReturnToFieldFromMultiplayer;\n\n    SetMainCallback2(CB2_SetUpSaveAfterLinkBattle);",
  },
} as const;
