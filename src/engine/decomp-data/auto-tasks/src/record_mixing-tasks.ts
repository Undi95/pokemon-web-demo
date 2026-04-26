// AUTO-GENERATED from src/record_mixing.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 9 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_RecordMixing_SoundEffect": {
    callsTo: ["PlaySE"],
    dataWrites: ["tCounter"],
    lineCount: 5,
    bodyC: "if (++gTasks[taskId].tCounter == 50)\n    {\n        PlaySE(SE_M_ATTRACT);\n        gTasks[taskId].tCounter = 0;\n    }",
  },
  "Task_RecordMixing_Main": {
    callsTo: ["Alloc","ClearDialogWindowAndFrame","CreateRecordMixingLights","CreateTask","CreateTask_ReestablishCableClubLink","DestroyRecordMixingLights","DestroyTask","FlagSet","Free","PlaySE","PrepareExchangePacket","PrintTextOnRecordMixing","ScriptContext_Enable","SetLinkWaitingForScript","SetLocalLinkPlayerId","VarSet"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 57,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n    case 0:  \n        sSentRecord = Alloc(sizeof(*sSentRecord));\n        sReceivedRecords = Alloc(sizeof(*sReceivedRecords) * MAX_LINK_PLAYERS);\n        SetLocalLinkPlayerId(gSpecialVar_0x8005);\n        VarSet(VAR_TEMP_MIXED_RECORDS, 1);\n        sReadyToReceive = FALSE;\n        PrepareExchangePacket();\n        CreateRecordMixingLights();\n        tState = 1;\n        tLinkTaskId = CreateTask(Task_MixingRecordsRecv, 80);\n        tSoundTaskId = CreateTask(Task_RecordMixing_SoundEffect, 81);\n        break;\n    case 1:  \n        if (!gTasks[tLinkTaskId].isActive)\n        {\n            tState = 2;\n            FlagSet(FLAG_SYS_MIX_RECORD);\n            DestroyRecordMixingLights();\n            DestroyTask(tSoundTaskId);\n        }\n        break;\n    case 2:\n        tLinkTaskId = CreateTask(Task_DoRecordMixing, 10);\n        tState = 3;\n        PlaySE(SE_M_BATON_PASS);\n        break;\n    case 3:  \n        if (!gTasks[tLinkTaskId].isActive)\n        {\n            tState = 4;\n            if (gWirelessCommType == 0)\n                tLinkTaskId = CreateTask_ReestablishCableClubLink();\n\n            PrintTextOnRecordMixing(gText_RecordMixingComplete);\n            tTimer = 0;\n        }\n        break;\n    case 4:  \n        if (++tTimer > 60)\n            tState = 5;\n        break;\n    case 5:  \n        if (!gTasks[tLinkTaskId].isActive)\n        {\n            Free(sReceivedRecords);\n            Free(sSentRecord);\n            SetLinkWaitingForScript();\n            if (gWirelessCommType != 0)\n                CreateTask(Task_ReturnToFieldRecordMixing, 10);\n            ClearDialogWindowAndFrame(0, TRUE);\n            DestroyTask(taskId);\n            ScriptContext_Enable();\n        }\n        break;\n    }",
  },
  "Task_MixingRecordsRecv": {
    callsTo: ["CheckShouldAdvanceLinkState","ClearLinkCallback_2","ConvertIntToDecimalStringN","CreateTask","GetLinkPlayerCount_2","GetMultiplayerId_","GetSavedPlayerCount","IsLinkMaster","Link_AnyPartnersPlayingRubyOrSapphire","PlaySE","PrintTextOnRecordMixing","StorePtrInTaskData"],
    dataReads: ["tRecvRecords"],
    dataWrites: ["tParentTaskId"],
    lineCount: 95,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    switch (task->tState)\n    {\n    case 0:\n        PrintTextOnRecordMixing(gText_MixingRecords);\n        task->data[8] = 0x708;\n        task->tState = 400;\n        ClearLinkCallback_2();\n        break;\n    case 100:  \n        if (++task->data[12] > 20)\n        {\n            task->data[12] = 0;\n            task->tState = 101;\n        }\n        break;\n    case 101:\n        {\n            u8 players = GetLinkPlayerCount_2();\n            if (IsLinkMaster() == TRUE)\n            {\n                if (players == GetSavedPlayerCount())\n                {\n                    PlaySE(SE_PIN);\n                    task->tState = 201;\n                    task->data[12] = 0;\n                }\n            }\n            else\n            {\n                PlaySE(SE_BOO);\n                task->tState = 301;\n            }\n        }\n        break;\n    case 201:\n         \n        if (GetSavedPlayerCount() == GetLinkPlayerCount_2() && ++task->data[12] > (GetLinkPlayerCount_2() * 30))\n        {\n            CheckShouldAdvanceLinkState();\n            task->tState = 1;\n        }\n        break;\n    case 301:\n        if (GetSavedPlayerCount() == GetLinkPlayerCount_2())\n            task->tState = 1;\n        break;\n    case 400:  \n        if (++task->data[12] > 20)\n        {\n            task->tState = 1;\n            task->data[12] = 0;\n        }\n        break;\n    case 1:  \n        if (gReceivedRemoteLinkPlayers)\n        {\n            ConvertIntToDecimalStringN(gStringVar1, GetMultiplayerId_(), STR_CONV_MODE_LEADING_ZEROS, 2);\n            task->tState = 5;\n        }\n        break;\n    case 2:\n        {\n            u8 subTaskId;\n\n            task->data[6] = GetLinkPlayerCount_2();\n            task->tState = 0;\n            task->tMultiplayerId = GetMultiplayerId_();\n            task->func = Task_SendPacket;\n            if (Link_AnyPartnersPlayingRubyOrSapphire())\n            {\n                StorePtrInTaskData(sSentRecord, &task->tSentRecord);\n                subTaskId = CreateTask(Task_CopyReceiveBuffer, 80);\n                task->tCopyTaskId = subTaskId;\n                gTasks[subTaskId].tParentTaskId = taskId;\n                StorePtrInTaskData(sReceivedRecords, &gTasks[subTaskId].tRecvRecords);\n                sRecordStructSize = sizeof(struct PlayerRecordRS);\n            }\n            else\n            {\n                StorePtrInTaskData(sSentRecord, &task->tSentRecord);\n                subTaskId = CreateTask(Task_CopyReceiveBuffer, 80);\n                task->tCopyTaskId = subTaskId;\n                gTasks[subTaskId].tParentTaskId = taskId;\n                StorePtrInTaskData(sReceivedRecords, &gTasks[subTaskId].tRecvRecords);\n                sRecordStructSize = sizeof(struct PlayerRecordEmerald);\n            }\n        }\n        break;\n    case 5:  \n        if (++task->data[10] > 60)\n        {\n            task->data[10] = 0;\n            task->tState = 2;\n        }\n        break;\n    }",
  },
  "Task_SendPacket": {
    callsTo: ["GetMultiplayerId","LoadPtrFromTaskData","SendBlockRequest","memcpy"],
    lineCount: 29,
    bodyC: "struct Task *task = &gTasks[taskId];\n    switch (task->tState)\n    {\n    case 0:  \n        {\n            void *recordData = LoadPtrFromTaskData(&task->tSentRecord) + task->tNumChunksSent * BUFFER_CHUNK_SIZE;\n\n            memcpy(gBlockSendBuffer, recordData, BUFFER_CHUNK_SIZE);\n            task->tState++;\n        }\n        break;\n    case 1:\n        if (GetMultiplayerId() == 0)\n            SendBlockRequest(BLOCK_REQ_SIZE_200);\n        task->tState++;\n        break;\n    case 2:\n        break;\n    case 3:\n         \n         \n        task->tNumChunksSent++;\n        if (task->tNumChunksSent == sRecordStructSize / BUFFER_CHUNK_SIZE + 1)\n            task->tState++;\n        else\n            task->tState = 0;\n        break;\n    case 4:\n        if (!gTasks[task->tCopyTaskId].isActive)\n            task->func = Task_SendPacket_SwitchToReceive;\n        break;\n    }",
  },
  "Task_CopyReceiveBuffer": {
    callsTo: ["DestroyTask","GetBlockReceivedStatus","GetLinkPlayerCount","GetLinkPlayerCountAsBitFlags","GetPlayerRecvBuffer","LoadPtrFromTaskData","ResetBlockReceivedFlag","memcpy","tNumChunksRecv"],
    dataReads: ["tState"],
    dataWrites: ["tState"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 26,
    bodyC: "struct Task *task = &gTasks[taskId];\n    u8 status = GetBlockReceivedStatus();\n    u8 handledPlayers = 0;\n\n    if (status == GetLinkPlayerCountAsBitFlags())\n    {\n        u8 i;\n        for (i = 0; i < GetLinkPlayerCount(); i++)\n        {\n            if ((status >> i) & 1)\n            {\n                void *dest = LoadPtrFromTaskData(&task->tRecvRecords) + task->tNumChunksRecv(i) * BUFFER_CHUNK_SIZE + sRecordStructSize * i;\n                void *src = GetPlayerRecvBuffer(i);\n                if ((task->tNumChunksRecv(i) + 1) * BUFFER_CHUNK_SIZE > sRecordStructSize)\n                    memcpy(dest, src, sRecordStructSize - task->tNumChunksRecv(i) * BUFFER_CHUNK_SIZE);\n                else\n                    memcpy(dest, src, BUFFER_CHUNK_SIZE);\n                ResetBlockReceivedFlag(i);\n                task->tNumChunksRecv(i)++;\n                if (task->tNumChunksRecv(i) == sRecordStructSize / BUFFER_CHUNK_SIZE + 1)\n                    handledPlayers++;\n            }\n        }\n        gTasks[task->tParentTaskId].tState++;\n    }\n\n    if (handledPlayers == GetLinkPlayerCount())\n        DestroyTask(taskId);",
  },
  "Task_WaitReceivePacket": {
    callsTo: ["DestroyTask"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 3,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n     \n    if (!gTasks[task->tCopyTaskId].isActive)\n        DestroyTask(taskId);",
  },
  "Task_ReceivePacket": {
    callsTo: ["ReceiveExchangePacket"],
    lineCount: 4,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    task->func = Task_WaitReceivePacket;\n    if (sReadyToReceive == TRUE)\n        ReceiveExchangePacket(task->tMultiplayerId);",
  },
  "Task_SendPacket_SwitchToReceive": {
    taskTransitions: ["Task_ReceivePacket"],
    lineCount: 2,
    bodyC: "gTasks[taskId].func = Task_ReceivePacket;\n    sReadyToReceive = TRUE;",
  },
  "Task_DoRecordMixing": {
    callsTo: ["ClearContinueGameWarpStatus2","CreateTask","DestroyTask","FuncIsActiveTask","IsLinkTaskFinished","Link_AnyPartnersPlayingRubyOrSapphire","Rfu_SetLinkRecovery","SetCloseLinkCallback","SetContinueGameWarpStatusToDynamicWarp","SetLinkStandbyCallback","WriteSaveBlock1Sector","WriteSaveBlock2"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 66,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    switch (task->tState)\n    {\n    case 0:\n        task->tState++;\n        break;\n    case 1:\n        if (Link_AnyPartnersPlayingRubyOrSapphire())\n            task->tState++;\n        else\n            task->tState = 6;\n        break;\n    case 2:\n         \n        SetContinueGameWarpStatusToDynamicWarp();\n        WriteSaveBlock2();\n        task->tState++;\n        break;\n    case 3:\n        if (WriteSaveBlock1Sector())\n        {\n            ClearContinueGameWarpStatus2();\n            task->tState = 4;\n            task->data[1] = 0;\n        }\n        break;\n    case 4:  \n        if (++task->data[1] > 10)\n        {\n            SetCloseLinkCallback();\n            task->tState++;\n        }\n        break;\n    case 5:\n         \n        if (gReceivedRemoteLinkPlayers == FALSE)\n            DestroyTask(taskId);\n        break;\n\n     \n    case 6:\n        if (!Rfu_SetLinkRecovery(FALSE))\n        {\n            CreateTask(Task_LinkFullSave, 5);\n            task->tState++;\n        }\n        break;\n    case 7:  \n        if (!FuncIsActiveTask(Task_LinkFullSave))\n        {\n            if (gWirelessCommType)\n            {\n                Rfu_SetLinkRecovery(TRUE);\n                task->tState = 8;\n            }\n            else\n            {\n                task->tState = 4;\n            }\n        }\n        break;\n    case 8:\n        SetLinkStandbyCallback();\n        task->tState++;\n        break;\n    case 9:\n        if (IsLinkTaskFinished())\n            DestroyTask(taskId);\n        break;\n    }",
  },
} as const;
