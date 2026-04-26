// AUTO-GENERATED from src/battle_interface.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 4 Task_, 0 CB2_, 7 SpriteCB_

export const TASKS = {
  "Task_HidePartyStatusSummary": {
    callsTo: ["BLDALPHA_BLEND","GetBattlerSide","SetGpuReg","SetSubspriteTables","tBallIconSpriteId"],
    taskTransitions: ["Task_HidePartyStatusSummary_BattleStart_1","Task_HidePartyStatusSummary_DuringBattle"],
    dataReads: ["tBallIconSpriteId","tBattler","tIsBattleStart","tSummaryBarSpriteId"],
    dataWrites: ["tBlend"],
    lineCount: 45,
    bodyC: "u8 ballIconSpriteIds[PARTY_SIZE];\n    bool8 isBattleStart;\n    u8 summaryBarSpriteId;\n    u8 battler;\n    s32 i;\n\n    isBattleStart = gTasks[taskId].tIsBattleStart;\n    summaryBarSpriteId = gTasks[taskId].tSummaryBarSpriteId;\n    battler = gTasks[taskId].tBattler;\n\n    for (i = 0; i < PARTY_SIZE; i++)\n        ballIconSpriteIds[i] = gTasks[taskId].tBallIconSpriteId(i);\n\n    SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT2_ALL | BLDCNT_EFFECT_BLEND);\n    SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(16, 0));\n\n    gTasks[taskId].tBlend = 16;\n\n    for (i = 0; i < PARTY_SIZE; i++)\n        gSprites[ballIconSpriteIds[i]].oam.objMode = ST_OAM_OBJ_BLEND;\n\n    gSprites[summaryBarSpriteId].oam.objMode = ST_OAM_OBJ_BLEND;\n\n    if (isBattleStart)\n    {\n        for (i = 0; i < PARTY_SIZE; i++)\n        {\n            if (GetBattlerSide(battler) != B_SIDE_PLAYER)\n            {\n                gSprites[ballIconSpriteIds[PARTY_SIZE - 1 - i]].data[1] = 7 * i;\n                gSprites[ballIconSpriteIds[PARTY_SIZE - 1 - i]].data[3] = 0;\n                gSprites[ballIconSpriteIds[PARTY_SIZE - 1 - i]].data[4] = 0;\n                gSprites[ballIconSpriteIds[PARTY_SIZE - 1 - i]].callback = SpriteCB_StatusSummaryBalls_Exit;\n            }\n            else\n            {\n                gSprites[ballIconSpriteIds[i]].data[1] = 7 * i;\n                gSprites[ballIconSpriteIds[i]].data[3] = 0;\n                gSprites[ballIconSpriteIds[i]].data[4] = 0;\n                gSprites[ballIconSpriteIds[i]].callback = SpriteCB_StatusSummaryBalls_Exit;\n            }\n        }\n        gSprites[summaryBarSpriteId].data[0] /= 2;\n        gSprites[summaryBarSpriteId].data[1] = 0;\n        gSprites[summaryBarSpriteId].callback = SpriteCB_StatusSummaryBar_Exit;\n        SetSubspriteTables(&gSprites[summaryBarSpriteId], sStatusSummaryBar_SubspriteTable_Exit);\n        gTasks[taskId].func = Task_HidePartyStatusSummary_BattleStart_1;\n    }\n    else\n    {\n        gTasks[taskId].func = Task_HidePartyStatusSummary_DuringBattle;\n    }",
  },
  "Task_HidePartyStatusSummary_BattleStart_1": {
    callsTo: ["BLDALPHA_BLEND","SetGpuReg"],
    taskTransitions: ["Task_HidePartyStatusSummary_BattleStart_2"],
    dataReads: ["data[11]","tBlend"],
    dataWrites: ["data[11]","tBlend"],
    lineCount: 8,
    bodyC: "if ((gTasks[taskId].data[11]++ % 2) == 0)\n    {\n        if (--gTasks[taskId].tBlend < 0)\n            return;\n\n        SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(gTasks[taskId].tBlend, 16 - gTasks[taskId].tBlend));\n    }\n    if (gTasks[taskId].tBlend == 0)\n        gTasks[taskId].func = Task_HidePartyStatusSummary_BattleStart_2;",
  },
  "Task_HidePartyStatusSummary_BattleStart_2": {
    callsTo: ["DestroySprite","DestroySpriteAndFreeResources","DestroyTask","FreeSpriteOamMatrix","SetGpuReg","tBallIconSpriteId"],
    dataReads: ["tBallIconSpriteId","tBattler","tSummaryBarSpriteId"],
    dataWrites: ["tBlend"],
    terminalMarkers: ["DestroyTask","DestroySprite","FreeSpriteOamMatrix"],
    lineCount: 31,
    bodyC: "u8 ballIconSpriteIds[PARTY_SIZE];\n    s32 i;\n\n    u8 battler = gTasks[taskId].tBattler;\n    if (--gTasks[taskId].tBlend == -1)\n    {\n        u8 summaryBarSpriteId = gTasks[taskId].tSummaryBarSpriteId;\n\n        for (i = 0; i < PARTY_SIZE; i++)\n            ballIconSpriteIds[i] = gTasks[taskId].tBallIconSpriteId(i);\n\n        gBattleSpritesDataPtr->animationData->field_9_x1C--;\n        if (gBattleSpritesDataPtr->animationData->field_9_x1C == 0)\n        {\n            DestroySpriteAndFreeResources(&gSprites[summaryBarSpriteId]);\n            DestroySpriteAndFreeResources(&gSprites[ballIconSpriteIds[0]]);\n        }\n        else\n        {\n            FreeSpriteOamMatrix(&gSprites[summaryBarSpriteId]);\n            DestroySprite(&gSprites[summaryBarSpriteId]);\n            FreeSpriteOamMatrix(&gSprites[ballIconSpriteIds[0]]);\n            DestroySprite(&gSprites[ballIconSpriteIds[0]]);\n        }\n\n        for (i = 1; i < PARTY_SIZE; i++)\n            DestroySprite(&gSprites[ballIconSpriteIds[i]]);\n    }\n    else if (gTasks[taskId].tBlend == -3)\n    {\n        gBattleSpritesDataPtr->healthBoxesData[battler].partyStatusSummaryShown = 0;\n        SetGpuReg(REG_OFFSET_BLDCNT, 0);\n        SetGpuReg(REG_OFFSET_BLDALPHA, 0);\n        DestroyTask(taskId);\n    }",
  },
  "Task_HidePartyStatusSummary_DuringBattle": {
    callsTo: ["BLDALPHA_BLEND","DestroySprite","DestroySpriteAndFreeResources","DestroyTask","SetGpuReg","tBallIconSpriteId"],
    dataReads: ["tBallIconSpriteId","tBattler","tBlend","tSummaryBarSpriteId"],
    dataWrites: ["tBlend"],
    terminalMarkers: ["DestroyTask","DestroySprite"],
    lineCount: 24,
    bodyC: "u8 ballIconSpriteIds[PARTY_SIZE];\n    s32 i;\n    u8 battler = gTasks[taskId].tBattler;\n\n    if (--gTasks[taskId].tBlend >= 0)\n    {\n        SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(gTasks[taskId].tBlend, 16 - gTasks[taskId].tBlend));\n    }\n    else if (gTasks[taskId].tBlend == -1)\n    {\n        u8 summaryBarSpriteId = gTasks[taskId].tSummaryBarSpriteId;\n\n        for (i = 0; i < PARTY_SIZE; i++)\n            ballIconSpriteIds[i] = gTasks[taskId].tBallIconSpriteId(i);\n\n        DestroySpriteAndFreeResources(&gSprites[summaryBarSpriteId]);\n        DestroySpriteAndFreeResources(&gSprites[ballIconSpriteIds[0]]);\n\n        for (i = 1; i < PARTY_SIZE; i++)\n            DestroySprite(&gSprites[ballIconSpriteIds[i]]);\n    }\n    else if (gTasks[taskId].tBlend == -3)\n    {\n        gBattleSpritesDataPtr->healthBoxesData[battler].partyStatusSummaryShown = 0;\n        SetGpuReg(REG_OFFSET_BLDCNT, 0);\n        SetGpuReg(REG_OFFSET_BLDALPHA, 0);\n        DestroyTask(taskId);\n    }",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_HealthBar": {
    lineCount: 19,
    bodyC: "u8 healthboxSpriteId = sprite->hBar_HealthBoxSpriteId;\n\n    switch (sprite->hBar_Data6)\n    {\n    case 0:\n        sprite->x = gSprites[healthboxSpriteId].x + 16;\n        sprite->y = gSprites[healthboxSpriteId].y;\n        break;\n    case 1:\n        sprite->x = gSprites[healthboxSpriteId].x + 16;\n        sprite->y = gSprites[healthboxSpriteId].y;\n        break;\n    case 2:\n    default:\n        sprite->x = gSprites[healthboxSpriteId].x + 8;\n        sprite->y = gSprites[healthboxSpriteId].y;\n        break;\n    }\n\n    sprite->x2 = gSprites[healthboxSpriteId].x2;\n    sprite->y2 = gSprites[healthboxSpriteId].y2;",
  },
  "SpriteCB_HealthBoxOther": {
    lineCount: 5,
    bodyC: "u8 healthboxMainSpriteId = sprite->hOther_HealthBoxSpriteId;\n\n    sprite->x = gSprites[healthboxMainSpriteId].x + 64;\n    sprite->y = gSprites[healthboxMainSpriteId].y;\n\n    sprite->x2 = gSprites[healthboxMainSpriteId].x2;\n    sprite->y2 = gSprites[healthboxMainSpriteId].y2;",
  },
  "SpriteCB_StatusSummaryBar_Enter": {
    lineCount: 2,
    bodyC: "if (sprite->x2 != 0)\n        sprite->x2 += sprite->data[0];",
  },
  "SpriteCB_StatusSummaryBar_Exit": {
    lineCount: 6,
    bodyC: "sprite->data[1] += 32;\n    if (sprite->data[0] > 0)\n        sprite->x2 += sprite->data[1] >> 4;\n    else\n        sprite->x2 -= sprite->data[1] >> 4;\n    sprite->data[1] &= 0xF;",
  },
  "SpriteCB_StatusSummaryBalls_Enter": {
    callsTo: ["PlaySE1WithPanning","PlaySE2WithPanning"],
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 35,
    bodyC: "u8 var1;\n    u16 var2;\n    s8 pan;\n\n    if (sprite->data[1] > 0)\n    {\n        sprite->data[1]--;\n        return;\n    }\n\n    var1 = sprite->data[2];\n    var2 = sprite->data[3];\n    var2 += 56;\n    sprite->data[3] = var2 & 0xFFF0;\n\n    if (var1 != 0)\n    {\n        sprite->x2 += var2 >> 4;\n        if (sprite->x2 > 0)\n            sprite->x2 = 0;\n    }\n    else\n    {\n        sprite->x2 -= var2 >> 4;\n        if (sprite->x2 < 0)\n            sprite->x2 = 0;\n    }\n\n    if (sprite->x2 == 0)\n    {\n        pan = SOUND_PAN_TARGET;\n        if (var1 != 0)\n            pan = SOUND_PAN_ATTACKER;\n\n        if (sprite->data[7] != 0)\n            PlaySE2WithPanning(SE_BALL_TRAY_EXIT, pan);\n        else\n            PlaySE1WithPanning(SE_BALL_TRAY_BALL, pan);\n\n        sprite->callback = SpriteCallbackDummy;\n    }",
  },
  "SpriteCB_StatusSummaryBalls_Exit": {
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 21,
    bodyC: "u8 var1;\n    u16 var2;\n\n    if (sprite->data[1] > 0)\n    {\n        sprite->data[1]--;\n        return;\n    }\n    var1 = sprite->data[2];\n    var2 = sprite->data[3];\n    var2 += 56;\n    sprite->data[3] = var2 & 0xFFF0;\n    if (var1 != 0)\n        sprite->x2 += var2 >> 4;\n    else\n        sprite->x2 -= var2 >> 4;\n    if (sprite->x2 + sprite->x > 248\n     || sprite->x2 + sprite->x < -8)\n    {\n        sprite->invisible = TRUE;\n        sprite->callback = SpriteCallbackDummy;\n    }",
  },
  "SpriteCB_StatusSummaryBalls_OnSwitchout": {
    lineCount: 3,
    bodyC: "u8 barSpriteId = sprite->data[0];\n\n    sprite->x2 = gSprites[barSpriteId].x2;\n    sprite->y2 = gSprites[barSpriteId].y2;",
  },
} as const;
