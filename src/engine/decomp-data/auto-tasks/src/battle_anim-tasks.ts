// AUTO-GENERATED from src/battle_anim.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 8 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_InitUpdateMonBg": {
    callsTo: ["CreateTask","DestroyAnimVisualTask"],
    lineCount: 27,
    bodyC: "u8 updateTaskId;\n\n    s16 *data = gTasks[taskId].data;\n    u8 battlerSpriteId = gBattlerSpriteIds[tBattlerId];\n    gSprites[battlerSpriteId].invisible = TRUE;\n\n    if (!tActive)\n    {\n        DestroyAnimVisualTask(taskId);\n        return;\n    }\n\n    updateTaskId = CreateTask(Task_UpdateMonBg, 10);\n    gTasks[updateTaskId].t2_SpriteId = battlerSpriteId;\n    gTasks[updateTaskId].t2_SpriteX = gSprites[battlerSpriteId].x + gSprites[battlerSpriteId].x2;\n    gTasks[updateTaskId].t2_SpriteY = gSprites[battlerSpriteId].y + gSprites[battlerSpriteId].y2;\n\n    if (!tInBg2)\n    {\n        gTasks[updateTaskId].t2_BgX = gBattle_BG1_X;\n        gTasks[updateTaskId].t2_BgY = gBattle_BG1_Y;\n    }\n    else\n    {\n        gTasks[updateTaskId].t2_BgX = gBattle_BG2_X;\n        gTasks[updateTaskId].t2_BgY = gBattle_BG2_Y;\n    }\n\n    gTasks[updateTaskId].t2_InBg2 = tInBg2;\n    gTasks[updateTaskId].t2_BattlerId = tBattlerId;\n    sMonAnimTaskIdArray[tIsPartner] = updateTaskId;\n    DestroyAnimVisualTask(taskId);",
  },
  "Task_UpdateMonBg": {
    callsTo: ["BG_PLTT_ID","CpuCopy32","GetBattleAnimBg1Data","OBJ_PLTT_ID"],
    lineCount: 20,
    bodyC: "u8 spriteId, battler;\n    s16 x, y;\n    struct BattleAnimBgData animBg;\n\n    spriteId = gTasks[taskId].t2_SpriteId;\n    battler = gTasks[taskId].t2_BattlerId;\n    GetBattleAnimBg1Data(&animBg);\n    x = gTasks[taskId].t2_SpriteX - (gSprites[spriteId].x + gSprites[spriteId].x2);\n    y = gTasks[taskId].t2_SpriteY - (gSprites[spriteId].y + gSprites[spriteId].y2);\n\n    if (!gTasks[taskId].t2_InBg2)\n    {\n        gBattle_BG1_X = x + gTasks[taskId].t2_BgX;\n        gBattle_BG1_Y = y + gTasks[taskId].t2_BgY;\n        CpuCopy32(&gPlttBufferFaded[OBJ_PLTT_ID(battler)], &gPlttBufferFaded[BG_PLTT_ID(animBg.paletteId)], PLTT_SIZE_4BPP);\n    }\n    else\n    {\n        gBattle_BG2_X = x + gTasks[taskId].t2_BgX;\n        gBattle_BG2_Y = y + gTasks[taskId].t2_BgY;\n        CpuCopy32(&gPlttBufferFaded[OBJ_PLTT_ID(battler)], &gPlttBufferFaded[BG_PLTT_ID(9)], PLTT_SIZE_4BPP);\n    }",
  },
  "Task_ClearMonBg": {
    callsTo: ["DestroyTask","GetBattlerPosition","IsContest","ResetBattleAnimBg"],
    dataReads: ["data[0]","data[1]","data[2]"],
    dataWrites: ["data[1]"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 23,
    bodyC: "gTasks[taskId].data[1]++;\n    if (gTasks[taskId].data[1] != 1)\n    {\n        u8 to_BG2;\n        u8 position = GetBattlerPosition(gTasks[taskId].data[2]);\n        if (position == B_POSITION_OPPONENT_LEFT || position == B_POSITION_PLAYER_RIGHT || IsContest())\n            to_BG2 = FALSE;\n        else\n            to_BG2 = TRUE;\n\n        if (sMonAnimTaskIdArray[0] != TASK_NONE)\n        {\n            ResetBattleAnimBg(to_BG2);\n            DestroyTask(sMonAnimTaskIdArray[0]);\n            sMonAnimTaskIdArray[0] = TASK_NONE;\n        }\n        if (gTasks[taskId].data[0] > 1)\n        {\n            ResetBattleAnimBg(to_BG2 ^ 1);\n            DestroyTask(sMonAnimTaskIdArray[1]);\n            sMonAnimTaskIdArray[1] = TASK_NONE;\n        }\n        DestroyTask(taskId);\n    }",
  },
  "Task_ClearMonBgStatic": {
    callsTo: ["BATTLE_PARTNER","DestroyTask","GetBattlerPosition","IsBattlerSpriteVisible","IsContest","ResetBattleAnimBg"],
    dataReads: ["data[0]","data[1]","data[2]"],
    dataWrites: ["data[1]"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 16,
    bodyC: "gTasks[taskId].data[1]++;\n    if (gTasks[taskId].data[1] != 1)\n    {\n        bool8 toBG_2;\n        u8 battler = gTasks[taskId].data[2];\n        u8 position = GetBattlerPosition(battler);\n        if (position == B_POSITION_OPPONENT_LEFT || position == B_POSITION_PLAYER_RIGHT || IsContest())\n            toBG_2 = FALSE;\n        else\n            toBG_2 = TRUE;\n\n        if (IsBattlerSpriteVisible(battler))\n            ResetBattleAnimBg(toBG_2);\n        if (gTasks[taskId].data[0] > 1 && IsBattlerSpriteVisible(BATTLE_PARTNER(battler)))\n            ResetBattleAnimBg(toBG_2 ^ 1);\n\n        DestroyTask(taskId);\n    }",
  },
  "Task_FadeToBg": {
    callsTo: ["BeginHardwarePaletteFade","DestroyTask","LoadDefaultBg","LoadMoveBg"],
    dataReads: ["tBackgroundId","tState"],
    dataWrites: ["tState"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 31,
    bodyC: "if (gTasks[taskId].tState == 0)\n    {\n        BeginHardwarePaletteFade(0xE8, 0, 0, 16, 0);\n        gTasks[taskId].tState++;\n        return;\n    }\n    if (gPaletteFade.active)\n        return;\n    if (gTasks[taskId].tState == 1)\n    {\n        gTasks[taskId].tState++;\n        sAnimBackgroundFadeState = 2;\n    }\n    else if (gTasks[taskId].tState == 2)\n    {\n        s16 bgId = gTasks[taskId].tBackgroundId;\n\n        if (bgId == -1)\n            LoadDefaultBg();\n        else\n            LoadMoveBg(bgId);\n\n        BeginHardwarePaletteFade(0xE8, 0, 16, 0, 1);\n        gTasks[taskId].tState++;\n        return;\n    }\n    if (gPaletteFade.active)\n        return;\n    if (gTasks[taskId].tState == 3)\n    {\n        DestroyTask(taskId);\n        sAnimBackgroundFadeState = 0;\n    }",
  },
  "Task_PanFromInitialToTarget": {
    callsTo: ["DestroyTask","SE12PanpotControl"],
    dataReads: ["tCurrentPan","tFrameCounter","tFramesToWait","tIncrementPan","tInitialPan","tTargetPan"],
    dataWrites: ["tCurrentPan","tFrameCounter"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 34,
    bodyC: "bool32 destroyTask = FALSE;\n    if (gTasks[taskId].tFrameCounter++ >= gTasks[taskId].tFramesToWait)\n    {\n        s16 pan;\n        s16 initialPanning, targetPanning, currentPan, incrementPan;\n\n        gTasks[taskId].tFrameCounter = 0;\n        initialPanning = gTasks[taskId].tInitialPan;\n        targetPanning = gTasks[taskId].tTargetPan;\n        currentPan = gTasks[taskId].tCurrentPan;\n        incrementPan = gTasks[taskId].tIncrementPan;\n        pan = currentPan + incrementPan;\n        gTasks[taskId].tCurrentPan = pan;\n\n        if (incrementPan == 0)  \n        {\n            destroyTask = TRUE;\n        }\n        else if (initialPanning < targetPanning)  \n        {\n            if (pan >= targetPanning)  \n                destroyTask = TRUE;\n        }\n        else  \n        {\n            if (pan <= targetPanning)  \n                destroyTask = TRUE;\n        }\n\n        if (destroyTask)\n        {\n            pan = targetPanning;\n            DestroyTask(taskId);\n            gAnimSoundTaskCount--;\n        }\n\n        SE12PanpotControl(pan);\n    }",
  },
  "Task_LoopAndPlaySE": {
    callsTo: ["DestroyTask","PlaySE12WithPanning"],
    dataReads: ["tFrameCounter","tFramesToWait","tNumberOfPlays","tPanning","tSongId"],
    dataWrites: ["tFrameCounter"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 16,
    bodyC: "if (gTasks[taskId].tFrameCounter++ >= gTasks[taskId].tFramesToWait)\n    {\n        u16 songId;\n        s8 panning;\n        u8 numberOfPlays;\n\n        gTasks[taskId].tFrameCounter = 0;\n        songId = gTasks[taskId].tSongId;\n        panning = gTasks[taskId].tPanning;\n        numberOfPlays = --gTasks[taskId].tNumberOfPlays;\n        PlaySE12WithPanning(songId, panning);\n        if (numberOfPlays == 0)\n        {\n            DestroyTask(taskId);\n            gAnimSoundTaskCount--;\n        }\n    }",
  },
  "Task_WaitAndPlaySE": {
    callsTo: ["DestroyTask","PlaySE12WithPanning"],
    dataReads: ["tFramesToWait","tPanning","tSongId"],
    dataWrites: ["tFramesToWait"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 6,
    bodyC: "if (gTasks[taskId].tFramesToWait-- <= 0)\n    {\n        PlaySE12WithPanning(gTasks[taskId].tSongId, gTasks[taskId].tPanning);\n        DestroyTask(taskId);\n        gAnimSoundTaskCount--;\n    }",
  },
} as const;
