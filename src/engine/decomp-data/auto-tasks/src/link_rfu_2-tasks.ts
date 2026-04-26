// AUTO-GENERATED from src/link_rfu_2.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 11 Task_, 1 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_ParentSearchForChildren": {
    callsTo: ["CreateTask","DestroyTask","InitChildRecvBuffers","InitParentSendData","UpdateChildStatuses","rfu_LMAN_establishConnection","rfu_LMAN_initializeRFU","rfu_LMAN_setMSCCallback","rfu_LMAN_stopManager"],
    dataWrites: ["data[1]"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 34,
    bodyC: "UpdateChildStatuses();\n    switch (gRfu.state)\n    {\n    case RFUSTATE_INIT:\n        rfu_LMAN_initializeRFU(&sRfuReqConfig);\n        gRfu.state = RFUSTATE_INIT_END;\n        gTasks[taskId].data[1] = 1;\n        break;\n    case RFUSTATE_INIT_END:\n        break;\n    case RFUSTATE_PARENT_CONNECT:\n        rfu_LMAN_establishConnection(gRfu.parentChild, 0, 240, (u16 *)sAcceptedSerialNos);\n        gRfu.state = RFUSTATE_PARENT_CONNECT_END;\n        gTasks[taskId].data[1] = 6;\n        break;\n    case RFUSTATE_PARENT_CONNECT_END:\n        break;\n    case RFUSTATE_STOP_MANAGER:\n        rfu_LMAN_stopManager(FALSE);\n        gRfu.state = RFUSTATE_STOP_MANAGER_END;\n        break;\n    case RFUSTATE_STOP_MANAGER_END:\n        break;\n    case RFUSTATE_PARENT_FINALIZE:\n        gRfu.parentFinished = FALSE;\n        rfu_LMAN_setMSCCallback(MSCCallback_Parent);\n        InitChildRecvBuffers();\n        InitParentSendData();\n        gRfu.state = RFUSTATE_FINALIZED;\n        gTasks[taskId].data[1] = 8;\n        CreateTask(Task_PlayerExchange, 5);\n        DestroyTask(taskId);\n        break;\n    }",
  },
  "Task_ChildSearchForParent": {
    callsTo: ["CreateTask","Debug_PrintEmpty","DestroyTask","GetJoinGroupStatus","rfu_LMAN_establishConnection","rfu_LMAN_initializeRFU","rfu_LMAN_requestChangeAgbClockMaster","rfu_UNI_setSendData","rfu_clearSlot","rfu_setRecvBuffer"],
    dataWrites: ["data[1]"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 50,
    bodyC: "switch (gRfu.state)\n    {\n    case RFUSTATE_INIT:\n        rfu_LMAN_initializeRFU((INIT_PARAM *)&sRfuReqConfigTemplate);\n        gRfu.state = RFUSTATE_INIT_END;\n        gTasks[taskId].data[1] = 1;\n        break;\n    case RFUSTATE_INIT_END:\n        break;\n    case RFUSTATE_CHILD_CONNECT:\n        rfu_LMAN_establishConnection(gRfu.parentChild, 0, 240, (u16 *)sAcceptedSerialNos);\n        gRfu.state = RFUSTATE_CHILD_CONNECT_END;\n        gTasks[taskId].data[1] = 7;\n        break;\n    case RFUSTATE_CHILD_CONNECT_END:\n        break;\n    case RFUSTATE_RECONNECTED:\n        gTasks[taskId].data[1] = 10;\n        break;\n    case RFUSTATE_CHILD_TRY_JOIN:\n        switch (GetJoinGroupStatus())\n        {\n        case RFU_STATUS_JOIN_GROUP_OK:\n            gRfu.state = RFUSTATE_CHILD_JOINED;\n            break;\n        case RFU_STATUS_JOIN_GROUP_NO:\n        case RFU_STATUS_LEAVE_GROUP:\n            rfu_LMAN_requestChangeAgbClockMaster();\n            gRfu.disconnectMode = RFU_DISCONNECT_NORMAL;\n            DestroyTask(taskId);\n            break;\n        }\n        break;\n    case RFUSTATE_CHILD_JOINED:\n    {\n        u8 bmChildSlot = 1 << gRfu.childSlot;\n        rfu_clearSlot(TYPE_NI_SEND | TYPE_NI_RECV, gRfu.childSlot);\n        rfu_setRecvBuffer(TYPE_UNI, gRfu.childSlot, gRfu.childRecvQueue, sizeof(gRfu.childRecvQueue));\n        rfu_UNI_setSendData(bmChildSlot, gRfu.childSendBuffer,  sizeof(gRfu.childSendBuffer));\n        gTasks[taskId].data[1] = 8;\n        DestroyTask(taskId);\n        if (sRfuDebug.childJoinCount == 0)\n        {\n            Debug_PrintEmpty();\n            sRfuDebug.childJoinCount++;\n        }\n        CreateTask(Task_PlayerExchange, 5);\n        break;\n    }\n    }",
  },
  "Task_UnionRoomListen": {
    callsTo: ["CreateTask","DestroyTask","GetHostRfuGameData","InitChildRecvBuffers","InitParentSendData","RfuGetStatus","RfuSetStatus","UpdateGameData_GroupLockedIn","rfu_LMAN_establishConnection","rfu_LMAN_initializeRFU","rfu_LMAN_setMSCCallback","rfu_LMAN_stopManager","rfu_REQ_disconnect","rfu_UNI_setSendData","rfu_waitREQComplete"],
    dataReads: ["tConnectingForChat"],
    dataWrites: ["data[1]"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 53,
    bodyC: "if (GetHostRfuGameData()->activity == (ACTIVITY_PLYRTALK | IN_UNION_ROOM) && RfuGetStatus() == RFU_STATUS_NEW_CHILD_DETECTED)\n    {\n        rfu_REQ_disconnect(lman.acceptSlot_flag);\n        rfu_waitREQComplete();\n        RfuSetStatus(RFU_STATUS_OK, 0);\n    }\n    switch (gRfu.state)\n    {\n    case RFUSTATE_INIT:\n        rfu_LMAN_initializeRFU(&sRfuReqConfig);\n        gRfu.state = RFUSTATE_INIT_END;\n        gTasks[taskId].data[1] = 1;\n        break;\n    case RFUSTATE_INIT_END:\n        break;\n    case RFUSTATE_UR_CONNECT:\n        rfu_LMAN_establishConnection(MODE_P_C_SWITCH, 0, 240, (u16 *)sAcceptedSerialNos);\n        rfu_LMAN_setMSCCallback(MSCCallback_Child);\n        gRfu.state = RFUSTATE_UR_CONNECT_END;\n        break;\n    case RFUSTATE_UR_CONNECT_END:\n        break;\n    case RFUSTATE_UR_PLAYER_EXCHANGE:\n        if (rfu_UNI_setSendData(1 << gRfu.childSlot, gRfu.childSendBuffer, sizeof(gRfu.childSendBuffer)) == 0)\n        {\n            gRfu.parentChild = MODE_CHILD;\n            DestroyTask(taskId);\n            if (gTasks[taskId].tConnectingForChat)\n                CreateTask(Task_PlayerExchangeChat, 1);\n            else\n                CreateTask(Task_PlayerExchange, 5);\n        }\n        break;\n    case RFUSTATE_UR_STOP_MANAGER:\n        rfu_LMAN_stopManager(FALSE);\n        gRfu.state = RFUSTATE_UR_STOP_MANAGER_END;\n        break;\n    case RFUSTATE_UR_STOP_MANAGER_END:\n        break;\n    case RFUSTATE_UR_FINALIZE:\n        gRfu.parentFinished = FALSE;\n        rfu_LMAN_setMSCCallback(MSCCallback_Parent);\n        UpdateGameData_GroupLockedIn(TRUE);\n        InitChildRecvBuffers();\n        InitParentSendData();\n        gRfu.state = RFUSTATE_FINALIZED;\n        gTasks[taskId].data[1] = 8;\n        gRfu.parentChild = MODE_PARENT;\n        CreateTask(Task_PlayerExchange, 5);\n        gRfu.playerExchangeActive = TRUE;\n        DestroyTask(taskId);\n        break;\n    }",
  },
  "Task_TryReadyCloseLink": {
    callsTo: ["DestroyTask"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 6,
    bodyC: "if (gRfu.callback == NULL)\n    {\n        gRfu.stopNewConnections = TRUE;\n        gRfu.callback = SendReadyCloseLink;\n        DestroyTask(taskId);\n    }",
  },
  "Task_PlayerExchange": {
    callsTo: ["AreAllPlayersFinishedReceiving","AreAllPlayersReadyToReceive","DestroyTask","LinkPlayerFromBlock","LocalLinkPlayerToBlock","ResetBlockReceivedFlags","RfuPrepareSendBuffer","Rfu_ResetBlockReceivedFlag","rfu_LMAN_setLinkRecovery"],
    dataReads: ["tState"],
    dataWrites: ["tState"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 83,
    bodyC: "s32 i;\n\n    if (gRfu.status == RFU_STATUS_FATAL_ERROR || gRfu.status == RFU_STATUS_CONNECTION_ERROR)\n    {\n        gRfu.playerExchangeActive = FALSE;\n        DestroyTask(taskId);\n    }\n    switch (gTasks[taskId].tState)\n    {\n    case 0:\n        if (AreAllPlayersReadyToReceive())\n        {\n            ResetBlockReceivedFlags();\n            LocalLinkPlayerToBlock();\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 1:\n        if (gRfu.parentChild == MODE_PARENT)\n        {\n            if (gReceivedRemoteLinkPlayers)\n                RfuPrepareSendBuffer(RFUCMD_SEND_PLAYER_IDS_NEW);\n            else\n                RfuPrepareSendBuffer(RFUCMD_SEND_PLAYER_IDS);\n            gTasks[taskId].tState = 101;\n        }\n        else\n        {\n            gTasks[taskId].tState = 2;\n        }\n        break;\n    case 101:\n        if (gSendCmd[0] == 0)\n            gTasks[taskId].tState = 2;\n        break;\n    case 2:\n        if (gRfu.playerCount)\n            gTasks[taskId].tState++;\n        break;\n    case 3:\n        if (gRfu.parentChild == MODE_PARENT)\n        {\n            if (AreAllPlayersReadyToReceive())\n            {\n                gRfu.blockRequestType = BLOCK_REQ_SIZE_NONE;\n                RfuPrepareSendBuffer(RFUCMD_SEND_BLOCK_REQ);\n                gTasks[taskId].tState++;\n            }\n        }\n        else\n        {\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 4:\n        if (AreAllPlayersFinishedReceiving())\n            gTasks[taskId].tState++;\n        break;\n    case 5:\n        for (i = 0; i < gRfu.playerCount; i++)\n        {\n            LinkPlayerFromBlock(i);\n            Rfu_ResetBlockReceivedFlag(i);\n        }\n        gTasks[taskId].tState++;\n        break;\n    case 6:\n        DestroyTask(taskId);\n        gReceivedRemoteLinkPlayers = TRUE;\n        gRfu.playerExchangeActive = FALSE;\n        rfu_LMAN_setLinkRecovery(1, 600);\n        if (gRfu.newChildQueue)\n        {\n            for (i = 0; i < RFU_CHILD_MAX; i++)\n            {\n                if ((gRfu.newChildQueue >> i) & 1)\n                {\n                    gRfu.nextChildBits = 1 << i;\n                    gRfu.newChildQueue ^= (1 << i);\n                }\n            }\n        }\n        break;\n    }",
  },
  "Task_PlayerExchangeUpdate": {
    callsTo: ["ConvertLinkPlayerName","CpuFill16","DestroyTask","GetBlockReceivedStatus","IsLinkTaskFinished","ResetBlockReceivedFlag","RfuPrepareSendBuffer","SendBlock","memcpy","offsetof"],
    dataReads: ["tState"],
    dataWrites: ["tState"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 73,
    bodyC: "s32 i;\n    struct LinkPlayerBlock *playerBlock;\n    struct SioInfo *sio;\n    u8 playerId = gRfu.linkPlayerIdx[sSlotToLinkPlayerTableId[gRfu.incomingChild]];\n    if (gRfu.status == RFU_STATUS_FATAL_ERROR || gRfu.status == RFU_STATUS_CONNECTION_ERROR)\n    {\n        gRfu.playerExchangeActive = FALSE;\n        DestroyTask(taskId);\n    }\n    switch (gTasks[taskId].tState)\n    {\n    case 0:\n        if (gSendCmd[0] == 0)\n        {\n            ResetBlockReceivedFlag(playerId);\n            RfuPrepareSendBuffer(RFUCMD_SEND_PLAYER_IDS_NEW);\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 1:\n        if (gSendCmd[0] == 0)\n            gTasks[taskId].tState++;\n        break;\n    case 2:\n        if ((GetBlockReceivedStatus() >> playerId) & 1)\n        {\n            ResetBlockReceivedFlag(playerId);\n            playerBlock = (struct LinkPlayerBlock *)gBlockRecvBuffer[playerId];\n            gLinkPlayers[playerId] = playerBlock->linkPlayer;\n            ConvertLinkPlayerName(&gLinkPlayers[playerId]);\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 3:\n        sio = (struct SioInfo *)gBlockSendBuffer;\n        memcpy(sio->magic, sASCII_PokemonSioInfo, sizeof sASCII_PokemonSioInfo);\n        sio->playerCount = gRfu.playerCount;\n        for (i = 0; i < RFU_CHILD_MAX; i++)\n            sio->linkPlayerIdx[i] = gRfu.linkPlayerIdx[i];\n        memcpy(sio->linkPlayers, gLinkPlayers, sizeof gLinkPlayers);\n        gTasks[taskId].tState++;\n         \n    case 4:\n        sio = (struct SioInfo *)gBlockSendBuffer;\n        sio->playerCount = gRfu.playerCount;\n        for (i = 0; i < RFU_CHILD_MAX; i++)\n            sio->linkPlayerIdx[i] = gRfu.linkPlayerIdx[i];\n        memcpy(sio->linkPlayers, gLinkPlayers, sizeof(gLinkPlayers));\n         \n        if (SendBlock(0, gBlockSendBuffer, offsetof(struct SioInfo, filler)))\n            gTasks[taskId].tState++;\n        break;\n    case 5:\n        if (IsLinkTaskFinished() && GetBlockReceivedStatus() & 1)\n        {\n            CpuFill16(0, gBlockRecvBuffer, sizeof(struct SioInfo));\n            ResetBlockReceivedFlag(0);\n            gRfu.playerExchangeActive = FALSE;\n            if (gRfu.newChildQueue)\n            {\n                for (i = 0; i < RFU_CHILD_MAX; i++)\n                {\n                    if ((gRfu.newChildQueue >> i) & 1)\n                    {\n                        gRfu.nextChildBits = 1 << i;\n                        gRfu.newChildQueue ^= (1 << i);\n                        gRfu.playerExchangeActive = TRUE;\n                        break;\n                    }\n                }\n            }\n            DestroyTask(taskId);\n        }\n        break;\n    }",
  },
  "Task_PlayerExchangeChat": {
    callsTo: ["DestroyTask","GetBlockReceivedStatus","IsLinkTaskFinished","LocalLinkPlayerToBlock","ReceiveRfuLinkPlayers","ResetBlockReceivedFlag","SendBlock"],
    dataReads: ["tState"],
    dataWrites: ["tState"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 26,
    bodyC: "if (gRfu.status == RFU_STATUS_FATAL_ERROR || gRfu.status == RFU_STATUS_CONNECTION_ERROR)\n        DestroyTask(taskId);\n    switch (gTasks[taskId].tState)\n    {\n    case 0:\n        if (gRfu.playerCount)\n        {\n            LocalLinkPlayerToBlock();\n            SendBlock(0, gBlockSendBuffer, sizeof(struct LinkPlayerBlock));\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 1:\n        if (IsLinkTaskFinished())\n            gTasks[taskId].tState++;\n        break;\n    case 2:\n        if (GetBlockReceivedStatus() & 1)\n        {\n            ReceiveRfuLinkPlayers((const struct SioInfo *)gBlockRecvBuffer);\n            ResetBlockReceivedFlag(0);\n            gReceivedRemoteLinkPlayers = 1;\n            DestroyTask(taskId);\n        }\n        break;\n    }",
  },
  "Task_SendDisconnectCommand": {
    callsTo: ["DestroyTask","RfuPrepareSendBuffer"],
    dataReads: ["tDisconnectMode","tDisconnectPlayers"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 9,
    bodyC: "if (gSendCmd[0] == 0 && !gRfu.playerExchangeActive)\n    {\n        RfuPrepareSendBuffer(RFUCMD_DISCONNECT);\n        gSendCmd[1] = gTasks[taskId].tDisconnectPlayers;\n        gSendCmd[2] = gTasks[taskId].tDisconnectMode;\n        gRfu.playerCount -= sPlayerBitsToCount[gTasks[taskId].tDisconnectPlayers];\n        gSendCmd[3] = gRfu.playerCount;\n        DestroyTask(taskId);\n    }",
  },
  "Task_RfuReconnectWithParent": {
    callsTo: ["CanTryReconnectParent","DestroyTask","GetHostRfuGameData","GetPartnerIndexByNameAndTrainerID","ReadU16","RfuSetStatus","TryReconnectParent"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 38,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (CanTryReconnectParent())\n    {\n        u8 id = GetPartnerIndexByNameAndTrainerID((u8 *)data, ReadU16(&data[8]));\n        if (id != 0xFF)\n        {\n            if (gRfuLinkStatus->partner[id].slot != 0xFF)\n            {\n                gRfu.reconnectParentId = id;\n                if (TryReconnectParent())\n                    DestroyTask(taskId);\n            }\n            else if (GetHostRfuGameData()->activity == ACTIVITY_WONDER_CARD\n                  || GetHostRfuGameData()->activity == ACTIVITY_WONDER_NEWS)\n            {\n                tTime++;\n            }\n            else\n            {\n                 \n                RfuSetStatus(RFU_STATUS_CONNECTION_ERROR, F_RFU_ERROR_5 | F_RFU_ERROR_6 | F_RFU_ERROR_7);\n                DestroyTask(taskId);\n            }\n        }\n        else\n        {\n            tTime++;\n            gRfu.reconnectParentId = id;\n        }\n    }\n    else\n    {\n        tTime++;\n    }\n\n    if (tTime > 240)\n    {\n         \n        RfuSetStatus(RFU_STATUS_CONNECTION_ERROR, F_RFU_ERROR_5 | F_RFU_ERROR_6 | F_RFU_ERROR_7);\n        DestroyTask(taskId);\n    }",
  },
  "Task_TryConnectToUnionRoomParent": {
    callsTo: ["DestroyTask","GetPartnerIndexByNameAndTrainerID","IsPartnerActivityIncompatible","ReadU16","RfuSetStatus","rfu_LMAN_CHILD_connectParent"],
    dataReads: ["tActivity","tTime"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 28,
    bodyC: "if (gRfu.status == RFU_STATUS_NEW_CHILD_DETECTED)\n        DestroyTask(taskId);\n\n    if (++gTasks[taskId].tTime > 300)\n    {\n         \n        RfuSetStatus(RFU_STATUS_CONNECTION_ERROR, F_RFU_ERROR_5 | F_RFU_ERROR_6 | F_RFU_ERROR_7);\n        DestroyTask(taskId);\n    }\n\n     \n    if (gRfu.parentId != 0 && lman.parent_child == MODE_CHILD)\n    {\n         \n        u16 trainerId = ReadU16(gRfu.parent.compatibility.playerTrainerId);\n        u8 id = GetPartnerIndexByNameAndTrainerID(gRfu.parentName, trainerId);\n        if (id != 0xFF)\n        {\n             \n            if (!IsPartnerActivityIncompatible(gTasks[taskId].tActivity, (void *)gRfuLinkStatus->partner[id].gname))\n            {\n                if (gRfuLinkStatus->partner[id].slot != 0xFF && !rfu_LMAN_CHILD_connectParent(gRfuLinkStatus->partner[id].id, 90))\n                {\n                     \n                    gRfu.state = RFUSTATE_CONNECTED;\n                    DestroyTask(taskId);\n                }\n            }\n            else\n            {\n                 \n                RfuSetStatus(RFU_STATUS_CONNECTION_ERROR, F_RFU_ERROR_5 | F_RFU_ERROR_6 | F_RFU_ERROR_7);\n                DestroyTask(taskId);\n            }\n        }\n    }",
  },
  "Task_Idle": {
    lineCount: 0,
    bodyC: "",
  },
} as const;

export const CB2S = {
  "CB2_RfuIdle": {
    callsTo: ["AnimateSprites","BuildOamBuffer","RunTasks","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 4,
    bodyC: "RunTasks();\n    AnimateSprites();\n    BuildOamBuffer();\n    UpdatePaletteFade();",
  },
} as const;
