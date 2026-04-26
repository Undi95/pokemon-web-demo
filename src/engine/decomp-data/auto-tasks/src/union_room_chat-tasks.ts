// AUTO-GENERATED from src/union_room_chat.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 2 Task_, 2 CB2_, 2 SpriteCB_

export const TASKS = {
  "Task_HandlePlayerInput": {
    callsTo: ["SetChatFunction"],
    lineCount: 16,
    bodyC: "switch (sChat->exitType)\n    {\n    case CHAT_EXIT_ONLY_LEADER:\n        SetChatFunction(CHAT_FUNC_EXIT);\n        sChat->exitType = CHAT_EXIT_NONE;\n        break;\n    case CHAT_EXIT_DROPPED:\n        SetChatFunction(CHAT_FUNC_DROP);\n        sChat->exitType = CHAT_EXIT_NONE;\n        break;\n    case CHAT_EXIT_DISBANDED:\n        SetChatFunction(CHAT_FUNC_DISBANDED);\n        sChat->exitType = CHAT_EXIT_NONE;\n        break;\n    }\n\n    sChatMainFunctions[sChat->funcId]();",
  },
  "Task_ReceiveChatMessage": {
    callsTo: ["DestroyTask","GetBlockReceivedStatus","GetLinkPlayerCount","IsDisplaySubtaskActive","ProcessReceivedChatMessage","ResetBlockReceivedFlag","Rfu_DisconnectPlayerById","Rfu_IsPlayerExchangeActive","Rfu_StopPartnerSearch","SetUnionRoomChatPlayerData","StartDisplaySubtask"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 92,
    bodyC: "u8 *buffer;\n    s16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n    case 0:\n        if (!gReceivedRemoteLinkPlayers)\n        {\n            DestroyTask(taskId);\n            return;\n        }\n\n        tState = 1;\n         \n    case 1:\n        tLinkPlayerCount = GetLinkPlayerCount();\n        if (sChat->linkPlayerCount != tLinkPlayerCount)\n        {\n            tState = 2;\n            sChat->linkPlayerCount = tLinkPlayerCount;\n            return;\n        }\n\n        tBlockReceivedStatus = GetBlockReceivedStatus();\n        if (!tBlockReceivedStatus && Rfu_IsPlayerExchangeActive())\n            return;\n\n        tI = 0;\n        tState = 3;\n         \n    case 3:\n        for (; tI < MAX_RFU_PLAYERS && ((tBlockReceivedStatus >> tI) & 1) == 0; tI++)\n            ;\n\n        if (tI == MAX_RFU_PLAYERS)\n        {\n            tState = 1;\n            return;\n        }\n\n        tCurrLinkPlayer = tI;\n        ResetBlockReceivedFlag(tCurrLinkPlayer);\n        buffer = (u8 *)gBlockRecvBuffer[tI];\n        switch (buffer[0])\n        {\n            default:\n            case CHAT_MESSAGE_CHAT:    tNextState = 3; break;\n            case CHAT_MESSAGE_JOIN:    tNextState = 3; break;\n            case CHAT_MESSAGE_LEAVE:   tNextState = 4; break;\n            case CHAT_MESSAGE_DROP:    tNextState = 5; break;\n            case CHAT_MESSAGE_DISBAND: tNextState = 6; break;\n        }\n\n        if (ProcessReceivedChatMessage(sChat->receivedMessage, (u8 *)gBlockRecvBuffer[tI]))\n        {\n            sChat->receivedPlayerIndex = tI;\n            StartDisplaySubtask(CHATDISPLAY_FUNC_SCROLL_CHAT, 2);\n            tState = 7;\n        }\n        else\n        {\n            tState = tNextState;\n        }\n\n        tI++;\n        break;\n    case 7:\n        if (!IsDisplaySubtaskActive(2))\n            tState = tNextState;\n        break;\n    case 4:\n        if (!sChat->multiplayerId && tCurrLinkPlayer)\n        {\n            if (GetLinkPlayerCount() == 2)\n            {\n                Rfu_StopPartnerSearch();\n                sChat->exitType = CHAT_EXIT_ONLY_LEADER;\n                DestroyTask(taskId);\n                return;\n            }\n            Rfu_DisconnectPlayerById(tCurrLinkPlayer);\n        }\n\n        tState = 3;\n        break;\n    case 5:\n        if (sChat->multiplayerId)\n            sChat->exitType = CHAT_EXIT_DROPPED;\n\n        DestroyTask(taskId);\n        break;\n    case 6:\n        sChat->exitType = CHAT_EXIT_DISBANDED;\n        DestroyTask(taskId);\n        break;\n    case 2:\n        if (!Rfu_IsPlayerExchangeActive())\n        {\n            if (!sChat->multiplayerId)\n                SetUnionRoomChatPlayerData(sChat->linkPlayerCount);\n\n            tState = 1;\n        }\n        break;\n    }",
  },
} as const;

export const CB2S = {
  "CB2_LoadInterface": {
    callsTo: ["BeginNormalPaletteFade","BlendPalettes","CreateTask","CreateWirelessStatusIndicatorSprite","FreeAllSpritePalettes","IsDisplaySubtask0Active","LoadWirelessStatusIndicatorSpriteGfx","ResetSpriteData","ResetTasks","RunDisplaySubtasks","SetMainCallback2","SetVBlankCallback","TryAllocDisplay","UpdatePaletteFade"],
    cb2Transitions: ["CB2_UnionRoomChatMain"],
    externalChecks: { paletteFade: true },
    lineCount: 31,
    bodyC: "switch (gMain.state)\n    {\n    case 0:\n        ResetTasks();\n        ResetSpriteData();\n        FreeAllSpritePalettes();\n        TryAllocDisplay();\n        gMain.state++;\n        break;\n    case 1:\n        RunDisplaySubtasks();\n        if (!IsDisplaySubtask0Active())\n        {\n            BlendPalettes(PALETTES_ALL, 16, RGB_BLACK);\n            BeginNormalPaletteFade(PALETTES_ALL, -1, 16, 0, RGB_BLACK);\n            SetVBlankCallback(VBlankCB_UnionRoomChatMain);\n            gMain.state++;\n        }\n        break;\n    case 2:\n        UpdatePaletteFade();\n        if (!gPaletteFade.active)\n        {\n            SetMainCallback2(CB2_UnionRoomChatMain);\n            sChat->handleInputTask = CreateTask(Task_HandlePlayerInput, 8);\n            sChat->receiveMessagesTask = CreateTask(Task_ReceiveChatMessage, 7);\n            LoadWirelessStatusIndicatorSpriteGfx();\n            CreateWirelessStatusIndicatorSprite(DISPLAY_WIDTH - 8, DISPLAY_HEIGHT - 10);\n        }\n        break;\n    }",
  },
  "CB2_UnionRoomChatMain": {
    callsTo: ["AnimateSprites","BuildOamBuffer","RunDisplaySubtasks","RunTasks","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 5,
    bodyC: "RunTasks();\n    RunDisplaySubtasks();\n    AnimateSprites();\n    BuildOamBuffer();\n    UpdatePaletteFade();",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_TextEntryCursor": {
    callsTo: ["GetTextEntryCursorPosition"],
    lineCount: 10,
    bodyC: "int pos = GetTextEntryCursorPosition();\n    if (pos == MAX_MESSAGE_LENGTH)\n    {\n        sprite->invisible = TRUE;\n    }\n    else\n    {\n        sprite->invisible = FALSE;\n        sprite->x = pos * 8 + 76;\n    }",
  },
  "SpriteCB_TextEntryArrow": {
    lineCount: 6,
    bodyC: "if (++sprite->data[0] > 4)\n    {\n        sprite->data[0] = 0;\n        if (++sprite->x2 > 4)\n            sprite->x2 = 0;\n    }",
  },
} as const;
