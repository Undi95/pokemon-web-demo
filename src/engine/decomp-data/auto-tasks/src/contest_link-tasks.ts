// AUTO-GENERATED from src/contest_link.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 13 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_LinkContest_Init": {
    taskTransitions: ["Task_LinkContest_StartInitFlags"],
    dataWrites: ["tState"],
    lineCount: 5,
    bodyC: "u8 i;\n\n    for (i = 0; i < CONTESTANT_COUNT; i++)\n        gBlockRecvBuffer[i][0] = 0xFF;\n\n    gTasks[taskId].tState = 0;\n    gTasks[taskId].func = Task_LinkContest_StartInitFlags;",
  },
  "Task_LinkContest_StartInitFlags": {
    taskTransitions: ["Task_LinkContest_InitFlags"],
    lineCount: 1,
    bodyC: "gTasks[taskId].func = Task_LinkContest_InitFlags;",
  },
  "Task_LinkContest_InitFlags": {
    callsTo: ["GetLinkPlayerCount","GetMultiplayerId","SwitchTaskToFollowupFunc"],
    terminalMarkers: ["SwitchTaskToFollowupFunc"],
    lineCount: 13,
    bodyC: "int i;\n\n    if (!gReceivedRemoteLinkPlayers)\n        return;\n\n    gContestPlayerMonIndex = GetMultiplayerId();\n    gNumLinkContestPlayers = GetLinkPlayerCount();\n    gLinkContestFlags = LINK_CONTEST_FLAG_IS_LINK;\n    if (gWirelessCommType == 1)\n        gLinkContestFlags = LINK_CONTEST_FLAG_IS_LINK | LINK_CONTEST_FLAG_IS_WIRELESS;\n\n     \n    for (i = 0; i < gNumLinkContestPlayers && (u32)(gLinkPlayers[i].version & 0xFF) - 1 > VERSION_RUBY - 1; i++)\n        ;\n\n    if (i < gNumLinkContestPlayers)\n        gLinkContestFlags |= LINK_CONTEST_FLAG_HAS_RS_PLAYER;\n\n    SwitchTaskToFollowupFunc(taskId);",
  },
  "Task_LinkContest_CommunicateMonsRS": {
    callsTo: ["GetMultiplayerId","IsLinkTaskFinished","LinkContest_GetBlockReceivedFromAllPlayers","LinkContest_TryLinkStandby","SendBlockRequest","StripPlayerAndMonNamesForLinkContest","SwitchTaskToFollowupFunc","memcpy"],
    dataReads: ["tStandbyState","tState","tTimer"],
    dataWrites: ["tStandbyState","tState","tTimer"],
    terminalMarkers: ["SwitchTaskToFollowupFunc"],
    lineCount: 45,
    bodyC: "int i;\n\n    if (!LinkContest_TryLinkStandby(&gTasks[taskId].tStandbyState))\n        return;\n\n    switch (gTasks[taskId].tState)\n    {\n    case 0:\n         \n        if (GetMultiplayerId() == 0)\n        {\n            if (IsLinkTaskFinished())\n            {\n                memcpy(gBlockSendBuffer, &gContestMons[gContestPlayerMonIndex], sizeof(struct ContestPokemon));\n                gTasks[taskId].tState = 10;\n            }\n        }\n        else\n        {\n            memcpy(gBlockSendBuffer, &gContestMons[gContestPlayerMonIndex], sizeof(struct ContestPokemon));\n            gTasks[taskId].tState = 1;\n        }\n        break;\n    case 1:\n         \n        if (LinkContest_GetBlockReceivedFromAllPlayers())\n        {\n            for (i = 0; i < gNumLinkContestPlayers; i++)\n            {\n                memcpy(&gContestMons[i], gBlockRecvBuffer[i], sizeof(struct ContestPokemon));\n                StripPlayerAndMonNamesForLinkContest(&gContestMons[i], gLinkPlayers[i].language);\n            }\n\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 10:\n         \n        if (++gTasks[taskId].tTimer > 300)\n        {\n            SendBlockRequest(BLOCK_REQ_SIZE_100);\n            gTasks[taskId].tState = 1;\n        }\n        break;\n    default:\n        gTasks[taskId].tState = 0;\n        gTasks[taskId].tTimer = 0;\n        gTasks[taskId].tStandbyState = 0;\n        SwitchTaskToFollowupFunc(taskId);\n        break;\n    }",
  },
  "Task_LinkContest_CommunicateRngRS": {
    callsTo: ["GetMultiplayerId","IsLinkTaskFinished","LinkContest_GetBlockReceived","LinkContest_SendBlock","SwitchTaskToFollowupFunc","memcpy"],
    dataReads: ["tState"],
    dataWrites: ["tState"],
    terminalMarkers: ["SwitchTaskToFollowupFunc"],
    lineCount: 26,
    bodyC: "switch (gTasks[taskId].tState)\n    {\n    case 0:\n        if (GetMultiplayerId() == 0)\n        {\n            if (IsLinkTaskFinished() && LinkContest_SendBlock(&gRngValue, sizeof(gRngValue)) == TRUE)\n                gTasks[taskId].tState++;\n        }\n        else\n        {\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 1:\n        if (LinkContest_GetBlockReceived(0))\n        {\n            memcpy(&gRngValue, gBlockRecvBuffer[0], sizeof(gRngValue));\n            memcpy(&gContestRngValue, gBlockRecvBuffer[0], sizeof(gContestRngValue));\n            gTasks[taskId].tState++;\n        }\n        break;\n    default:\n        gTasks[taskId].tState = 0;\n        SwitchTaskToFollowupFunc(taskId);\n        break;\n    }",
  },
  "Task_LinkContest_CommunicateCategoryRS": {
    callsTo: ["GetMultiplayerId","IsLinkTaskFinished","LinkContest_GetBlockReceivedFromAllPlayers","LinkContest_TryLinkStandby","SendBlockRequest","SwitchTaskToFollowupFunc","tCategories"],
    dataReads: ["tCategories","tCategory","tStandbyState","tState","tTimer"],
    dataWrites: ["tStandbyState","tState","tTimer"],
    terminalMarkers: ["SwitchTaskToFollowupFunc"],
    lineCount: 39,
    bodyC: "int i;\n\n    if (!LinkContest_TryLinkStandby(&gTasks[taskId].tStandbyState))\n        return;\n\n    switch (gTasks[taskId].tState)\n    {\n    case 0:\n        gBlockSendBuffer[0] = gTasks[taskId].tCategory;\n        if (GetMultiplayerId() == 0)\n        {\n            if (IsLinkTaskFinished())\n                gTasks[taskId].tState = 10;\n        }\n        else\n        {\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 1:\n        if (LinkContest_GetBlockReceivedFromAllPlayers())\n        {\n            for (i = 0; i < gNumLinkContestPlayers; i++)\n                gTasks[taskId].tCategories(i) = gBlockRecvBuffer[i][0];\n\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 10:\n        if (++gTasks[taskId].tTimer > 10)\n        {\n            SendBlockRequest(BLOCK_REQ_SIZE_100);\n            gTasks[taskId].tState = 1;\n        }\n        break;\n    default:\n        gTasks[taskId].tState = 0;\n        gTasks[taskId].tTimer = 0;\n        gTasks[taskId].tStandbyState = 0;\n        SwitchTaskToFollowupFunc(taskId);\n        break;\n    }",
  },
  "Task_LinkContest_CommunicateMonIdxs": {
    callsTo: ["IsLinkTaskFinished","LinkContest_GetBlockReceivedFromAllPlayers","LinkContest_SendBlock","SwitchTaskToFollowupFunc"],
    dataReads: ["tState"],
    dataWrites: ["tState"],
    terminalMarkers: ["SwitchTaskToFollowupFunc"],
    lineCount: 18,
    bodyC: "switch (gTasks[taskId].tState)\n    {\n    case 0:\n        if (IsLinkTaskFinished())\n        {\n            if (LinkContest_SendBlock(&gContestPlayerMonIndex, sizeof(gContestPlayerMonIndex)) == TRUE)\n                gTasks[taskId].tState++;\n        }\n        break;\n    case 1:\n        if (LinkContest_GetBlockReceivedFromAllPlayers())\n            gTasks[taskId].tState++;\n        break;\n    default:\n        gTasks[taskId].tState = 0;\n        SwitchTaskToFollowupFunc(taskId);\n        break;\n    }",
  },
  "Task_LinkContest_CommunicateMoveSelections": {
    callsTo: ["IsLinkTaskFinished","LinkContest_GetBlockReceivedFromAllPlayers","LinkContest_SendBlock","SwitchTaskToFollowupFunc"],
    dataReads: ["tState"],
    dataWrites: ["tState"],
    terminalMarkers: ["SwitchTaskToFollowupFunc"],
    lineCount: 23,
    bodyC: "int i;\n\n    switch (gTasks[taskId].tState)\n    {\n    case 0:\n        if (IsLinkTaskFinished())\n        {\n             \n            if (LinkContest_SendBlock(&eContestantStatus[gContestPlayerMonIndex].currMove, sizeof(eContestantStatus[gContestPlayerMonIndex].currMove)) == TRUE)\n                gTasks[taskId].tState++;\n        }\n        break;\n    case 1:\n        if (LinkContest_GetBlockReceivedFromAllPlayers())\n        {\n             \n            for (i = 0; i < gNumLinkContestPlayers; i++)\n                eContestantStatus[i].currMove = gBlockRecvBuffer[i][0];\n\n            gTasks[taskId].tState++;\n        }\n        break;\n    default:\n        gTasks[taskId].tState = 0;\n        SwitchTaskToFollowupFunc(taskId);\n        break;\n    }",
  },
  "Task_LinkContest_CommunicateFinalStandings": {
    callsTo: ["IsLinkTaskFinished","LinkContest_GetBlockReceivedFromAllPlayers","LinkContest_SendBlock","SwitchTaskToFollowupFunc","memcpy"],
    dataReads: ["tDelayTimer","tState"],
    dataWrites: ["tDelayTimer","tState"],
    terminalMarkers: ["SwitchTaskToFollowupFunc"],
    lineCount: 73,
    bodyC: "switch (gTasks[taskId].tState)\n    {\n    case 0:\n        if (IsLinkTaskFinished())\n        {\n            if (LinkContest_SendBlock(gContestMonTotalPoints, sizeof(gContestMonTotalPoints)) == 1)\n                gTasks[taskId].tState++;\n        }\n        break;\n    case 1:\n        if (LinkContest_GetBlockReceivedFromAllPlayers())\n        {\n            memcpy(gContestMonTotalPoints, gBlockRecvBuffer[gContestLinkLeaderIndex], sizeof(gContestMonTotalPoints));\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 2:\n    case 5:\n    case 8:\n    case 11:\n        if (gTasks[taskId].tDelayTimer++ > 10)\n        {\n            gTasks[taskId].tDelayTimer = 0;\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 3:\n        if (IsLinkTaskFinished())\n        {\n            if (LinkContest_SendBlock(gContestMonAppealPointTotals, sizeof(gContestMonAppealPointTotals)) == 1)\n                gTasks[taskId].tState++;\n        }\n        break;\n    case 4:\n        if (LinkContest_GetBlockReceivedFromAllPlayers())\n        {\n            memcpy(gContestMonAppealPointTotals, gBlockRecvBuffer[gContestLinkLeaderIndex], sizeof(gContestMonAppealPointTotals));\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 6:\n        if (IsLinkTaskFinished())\n        {\n            if (LinkContest_SendBlock(gContestMonRound2Points, sizeof(gContestMonRound2Points)) == 1)\n                gTasks[taskId].tState++;\n        }\n        break;\n    case 7:\n        if (LinkContest_GetBlockReceivedFromAllPlayers())\n        {\n            memcpy(gContestMonRound2Points, gBlockRecvBuffer[gContestLinkLeaderIndex], sizeof(gContestMonRound2Points));\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 9:\n        if (IsLinkTaskFinished())\n        {\n            if (LinkContest_SendBlock(gContestFinalStandings, sizeof(gContestFinalStandings)) == 1)\n                gTasks[taskId].tState++;\n        }\n        break;\n    case 10:\n        if (LinkContest_GetBlockReceivedFromAllPlayers())\n        {\n            memcpy(gContestFinalStandings, gBlockRecvBuffer[gContestLinkLeaderIndex], sizeof(gContestFinalStandings));\n            gTasks[taskId].tState++;\n        }\n        break;\n    default:\n        gTasks[taskId].tState = 0;\n        SwitchTaskToFollowupFunc(taskId);\n        break;\n    }",
  },
  "Task_LinkContest_CommunicateAppealsState": {
    callsTo: ["IsLinkTaskFinished","LinkContest_GetBlockReceivedFromAllPlayers","LinkContest_SendBlock","SwitchTaskToFollowupFunc","memcpy"],
    dataReads: ["tDelayTimer","tState"],
    dataWrites: ["tDelayTimer","tState"],
    terminalMarkers: ["SwitchTaskToFollowupFunc"],
    lineCount: 73,
    bodyC: "switch (gTasks[taskId].tState)\n    {\n    case 0:\n        if (IsLinkTaskFinished())\n        {\n            if (LinkContest_SendBlock(eContestantStatus, CONTESTANT_COUNT * sizeof(struct ContestantStatus)) == 1)\n                gTasks[taskId].tState++;\n        }\n        break;\n    case 1:\n        if (LinkContest_GetBlockReceivedFromAllPlayers())\n        {\n            memcpy(eContestantStatus, gBlockRecvBuffer[gContestLinkLeaderIndex], CONTESTANT_COUNT * sizeof(struct ContestantStatus));\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 2:\n    case 5:\n    case 8:\n    case 11:\n        if (gTasks[taskId].tDelayTimer++ > 10)\n        {\n            gTasks[taskId].tDelayTimer = 0;\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 3:\n        if (IsLinkTaskFinished())\n        {\n            if (LinkContest_SendBlock(gContestResources->appealResults, sizeof(struct ContestAppealMoveResults)) == 1)\n                gTasks[taskId].tState++;\n        }\n        break;\n    case 4:\n        if (LinkContest_GetBlockReceivedFromAllPlayers())\n        {\n            memcpy(gContestResources->appealResults, gBlockRecvBuffer[gContestLinkLeaderIndex], sizeof(struct ContestAppealMoveResults));\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 6:\n        if (IsLinkTaskFinished())\n        {\n            if (LinkContest_SendBlock(gContestResources->excitement, sizeof(struct ContestExcitement)) == 1)\n                gTasks[taskId].tState++;\n        }\n        break;\n    case 7:\n        if (LinkContest_GetBlockReceivedFromAllPlayers())\n        {\n            memcpy(gContestResources->excitement, gBlockRecvBuffer[gContestLinkLeaderIndex], sizeof(struct ContestExcitement));\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 9:\n        if (IsLinkTaskFinished())\n        {\n            if (LinkContest_SendBlock(gContestantTurnOrder, sizeof(gContestantTurnOrder)) == 1)\n                gTasks[taskId].tState++;\n        }\n        break;\n    case 10:\n        if (LinkContest_GetBlockReceivedFromAllPlayers())\n        {\n            memcpy(gContestantTurnOrder, gBlockRecvBuffer[gContestLinkLeaderIndex], sizeof(gContestantTurnOrder));\n            gTasks[taskId].tState++;\n        }\n        break;\n    default:\n        gTasks[taskId].tState = 0;\n        SwitchTaskToFollowupFunc(taskId);\n        break;\n    }",
  },
  "Task_LinkContest_CommunicateLeaderIdsRS": {
    callsTo: ["GetMultiplayerId","IsLinkTaskFinished","LinkContest_GetBlockReceivedFromAllPlayers","LinkContest_TryLinkStandby","SendBlockRequest","SwitchTaskToFollowupFunc","tLeaderIds"],
    dataReads: ["tLeaderIds","tStandbyState","tState","tTimer"],
    dataWrites: ["tStandbyState","tState","tTimer"],
    terminalMarkers: ["SwitchTaskToFollowupFunc"],
    lineCount: 39,
    bodyC: "int i;\n\n    if (!LinkContest_TryLinkStandby(&gTasks[taskId].tStandbyState))\n        return;\n\n    switch (gTasks[taskId].tState)\n    {\n    case 0:\n        gBlockSendBuffer[0] = 0x6E;\n        if (GetMultiplayerId() == 0)\n        {\n            if (IsLinkTaskFinished())\n                gTasks[taskId].tState = 10;\n        }\n        else\n        {\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 1:\n        if (LinkContest_GetBlockReceivedFromAllPlayers())\n        {\n            for (i = 0; i < CONTESTANT_COUNT; i++)\n                gTasks[taskId].tLeaderIds(i) = gBlockRecvBuffer[i][0];\n\n            gTasks[taskId].tState++;\n        }\n        break;\n    case 10:\n        if (++gTasks[taskId].tTimer > 10)\n        {\n            SendBlockRequest(BLOCK_REQ_SIZE_100);\n            gTasks[taskId].tState = 1;\n        }\n        break;\n    default:\n        gTasks[taskId].tState = 0;\n        gTasks[taskId].tTimer = 0;\n        gTasks[taskId].tStandbyState = 0;\n        SwitchTaskToFollowupFunc(taskId);\n        break;\n    }",
  },
  "Task_LinkContest_CommunicateRound1Points": {
    callsTo: ["IsLinkTaskFinished","LinkContest_GetBlockReceivedFromAllPlayers","LinkContest_SendBlock","LinkContest_TryLinkStandby","SwitchTaskToFollowupFunc","memcpy"],
    dataReads: ["tStandbyState","tState"],
    dataWrites: ["tStandbyState","tState"],
    terminalMarkers: ["SwitchTaskToFollowupFunc"],
    lineCount: 24,
    bodyC: "if (!LinkContest_TryLinkStandby(&gTasks[taskId].tStandbyState))\n        return;\n\n    switch (gTasks[taskId].tState)\n    {\n    case 0:\n        if (IsLinkTaskFinished())\n        {\n            if (LinkContest_SendBlock(gContestMonRound1Points, sizeof(gContestMonRound1Points)) == 1)\n                gTasks[taskId].tState++;\n        }\n        break;\n    case 1:\n        if (LinkContest_GetBlockReceivedFromAllPlayers())\n        {\n            memcpy(gContestMonRound1Points, gBlockRecvBuffer[gContestLinkLeaderIndex], sizeof(gContestMonRound1Points));\n            gTasks[taskId].tState++;\n        }\n        break;\n    default:\n        gTasks[taskId].tState = 0;\n        gTasks[taskId].tStandbyState = 0;\n        SwitchTaskToFollowupFunc(taskId);\n        break;\n    }",
  },
  "Task_LinkContest_CommunicateTurnOrder": {
    callsTo: ["IsLinkTaskFinished","LinkContest_GetBlockReceivedFromAllPlayers","LinkContest_SendBlock","LinkContest_TryLinkStandby","SwitchTaskToFollowupFunc","memcpy"],
    dataReads: ["tStandbyState","tState"],
    dataWrites: ["tStandbyState","tState"],
    terminalMarkers: ["SwitchTaskToFollowupFunc"],
    lineCount: 24,
    bodyC: "if (!LinkContest_TryLinkStandby(&gTasks[taskId].tStandbyState))\n        return;\n\n    switch (gTasks[taskId].tState)\n    {\n    case 0:\n        if (IsLinkTaskFinished())\n        {\n            if (LinkContest_SendBlock(gContestantTurnOrder, sizeof(gContestantTurnOrder)) == 1)\n                gTasks[taskId].tState++;\n        }\n        break;\n    case 1:\n        if (LinkContest_GetBlockReceivedFromAllPlayers())\n        {\n            memcpy(gContestantTurnOrder, gBlockRecvBuffer[gContestLinkLeaderIndex], sizeof(gContestantTurnOrder));\n            gTasks[taskId].tState++;\n        }\n        break;\n    default:\n        gTasks[taskId].tState = 0;\n        gTasks[taskId].tStandbyState = 0;\n        SwitchTaskToFollowupFunc(taskId);\n        break;\n    }",
  },
} as const;
