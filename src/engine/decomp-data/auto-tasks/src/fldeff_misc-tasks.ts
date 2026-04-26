// AUTO-GENERATED from src/fldeff_misc.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 11 Task_, 0 CB2_, 13 SpriteCB_

export const TASKS = {
  "Task_ComputerScreenOpenEffect": {
    callsTo: ["BlendPalettes","ClearGpuRegBits","DestroyTask","GetGpuReg","SetGpuReg","SetGpuRegBits","WIN_RANGE"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 55,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    switch (task->tState)\n    {\n    case 0:\n        task->tWinLeft = DISPLAY_WIDTH / 2;\n        task->tWinRight = DISPLAY_WIDTH / 2;\n        task->tWinTop = DISPLAY_HEIGHT / 2;\n        task->tWinBottom = DISPLAY_HEIGHT / 2 + 1;\n\n        SetGpuRegBits(REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON);\n        SetGpuReg(REG_OFFSET_WIN0H, WIN_RANGE(task->tWinLeft, task->tWinRight));\n        SetGpuReg(REG_OFFSET_WIN0V, WIN_RANGE(task->tWinTop, task->tWinBottom));\n        SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR);\n        SetGpuReg(REG_OFFSET_WINOUT, 0);\n\n        break;\n    case 1:\n        task->tBlendCnt = GetGpuReg(REG_OFFSET_BLDCNT);\n        task->tBlendY = GetGpuReg(REG_OFFSET_BLDY);\n\n        SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_ALL | BLDCNT_EFFECT_LIGHTEN);\n        SetGpuReg(REG_OFFSET_BLDY, 16);\n\n        break;\n    case 2:\n        task->tWinLeft -= task->tHorzIncrement;\n        task->tWinRight += task->tHorzIncrement;\n\n        if (task->tWinLeft < 1 || task->tWinRight > DISPLAY_WIDTH - 1)\n        {\n            task->tWinLeft = 0;\n            task->tWinRight = DISPLAY_WIDTH;\n            SetGpuReg(REG_OFFSET_BLDY, 0);\n            SetGpuReg(REG_OFFSET_BLDCNT, task->tBlendCnt);\n            BlendPalettes(PALETTES_ALL, 0, 0);\n            gPlttBufferFaded[0] = 0;\n        }\n        SetGpuReg(REG_OFFSET_WIN0H, WIN_RANGE(task->tWinLeft, task->tWinRight));\n\n        if (task->tWinLeft != 0)\n            return;\n        break;\n    case 3:\n        task->tWinTop -= task->tVertIncrement;\n        task->tWinBottom += task->tVertIncrement;\n\n        if (task->tWinTop < 1 || task->tWinBottom > DISPLAY_HEIGHT - 1)\n        {\n            task->tWinTop = 0;\n            task->tWinBottom = DISPLAY_HEIGHT;\n            ClearGpuRegBits(REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON);\n        }\n        SetGpuReg(REG_OFFSET_WIN0V, WIN_RANGE(task->tWinTop, task->tWinBottom));\n\n        if (task->tWinTop != 0)\n            return;\n        break;\n    default:\n        SetGpuReg(REG_OFFSET_BLDCNT, task->tBlendCnt);\n        DestroyTask(taskId);\n        return;\n    }\n    task->tState++;",
  },
  "Task_ComputerScreenCloseEffect": {
    callsTo: ["BlendPalettes","ClearGpuRegBits","DestroyTask","SetGpuReg","SetGpuRegBits","WIN_RANGE"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 53,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    switch (task->tState)\n    {\n    case 0:\n        gPlttBufferFaded[0] = 0;\n        break;\n    case 1:\n        task->tWinLeft = 0;\n        task->tWinRight = DISPLAY_WIDTH;\n        task->tWinTop = 0;\n        task->tWinBottom = DISPLAY_HEIGHT;\n\n        SetGpuRegBits(REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON);\n        SetGpuReg(REG_OFFSET_WIN0H, WIN_RANGE(task->tWinLeft, task->tWinRight));\n        SetGpuReg(REG_OFFSET_WIN0V, WIN_RANGE(task->tWinTop, task->tWinBottom));\n        SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR);\n        SetGpuReg(REG_OFFSET_WINOUT, 0);\n        break;\n    case 2:\n        task->tWinTop += task->tVertIncrement;\n        task->tWinBottom -= task->tVertIncrement;\n\n        if (task->tWinTop >= DISPLAY_HEIGHT / 2 || task->tWinBottom <= DISPLAY_HEIGHT / 2 + 1)\n        {\n            task->tWinTop = DISPLAY_HEIGHT / 2;\n            task->tWinBottom = DISPLAY_HEIGHT / 2 + 1;\n            SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_ALL | BLDCNT_EFFECT_LIGHTEN);\n            SetGpuReg(REG_OFFSET_BLDY, 16);\n        }\n        SetGpuReg(REG_OFFSET_WIN0V, WIN_RANGE(task->tWinTop, task->tWinBottom));\n\n        if (task->tWinTop != DISPLAY_HEIGHT / 2)\n            return;\n        break;\n    case 3:\n        task->tWinLeft += task->tHorzIncrement;\n        task->tWinRight -= task->tHorzIncrement;\n\n        if (task->tWinLeft >= DISPLAY_WIDTH / 2 || task->tWinRight <= DISPLAY_WIDTH / 2)\n        {\n            task->tWinLeft = DISPLAY_WIDTH / 2;\n            task->tWinRight = DISPLAY_WIDTH / 2;\n            BlendPalettes(PALETTES_ALL, 16, 0);\n            gPlttBufferFaded[0] = 0;\n        }\n        SetGpuReg(REG_OFFSET_WIN0H, WIN_RANGE(task->tWinLeft, task->tWinRight));\n\n        if (task->tWinLeft != DISPLAY_WIDTH / 2)\n            return;\n        break;\n    default:\n        ClearGpuRegBits(REG_OFFSET_DISPCNT, DISPCNT_WIN0_ON);\n        SetGpuReg(REG_OFFSET_BLDY, 0);\n        SetGpuReg(REG_OFFSET_BLDCNT, 0);\n        DestroyTask(taskId);\n        return;\n    }\n    task->tState++;",
  },
  "Task_SecretBasePCTurnOn": {
    callsTo: ["CurrentMapDrawMetatileAt","DestroyTask","FieldEffectActiveListRemove","MapGridSetMetatileIdAt","ScriptContext_Enable"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 22,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n    case 4:\n    case 12:\n        MapGridSetMetatileIdAt(tX, tY, METATILE_SecretBase_PC_On);\n        CurrentMapDrawMetatileAt(tX, tY);\n        break;\n    case 8:\n    case 16:\n        MapGridSetMetatileIdAt(tX, tY, METATILE_SecretBase_PC);\n        CurrentMapDrawMetatileAt(tX, tY);\n        break;\n    case 20:\n        MapGridSetMetatileIdAt(tX, tY, METATILE_SecretBase_PC_On);\n        CurrentMapDrawMetatileAt(tX, tY);\n        FieldEffectActiveListRemove(FLDEFF_PCTURN_ON);\n        ScriptContext_Enable();\n        DestroyTask(taskId);\n        return;\n    }\n\n    tState++;",
  },
  "Task_PopSecretBaseBalloon": {
    callsTo: ["CurrentMapDrawMetatileAt","DestroyTask","DoBalloonSoundEffect","MapGridSetMetatileIdAt"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 16,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (data[3] == 6)\n        data[3] = 0;\n    else\n        data[3]++;\n\n    if (data[3] == 0)\n    {\n        if (data[4] == 2)\n            DoBalloonSoundEffect(data[0]);\n\n        MapGridSetMetatileIdAt(data[1], data[2], data[0] + data[4]);\n        CurrentMapDrawMetatileAt(data[1], data[2]);\n\n        if (data[4] == 3)\n            DestroyTask(taskId);\n        else\n            data[4]++;\n    }",
  },
  "Task_ShatterSecretBaseBreakableDoor": {
    callsTo: ["DestroyTask","DoSecretBaseBreakableDoorEffect"],
    dataReads: ["data[0]","data[1]","data[2]"],
    dataWrites: ["data[0]"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 9,
    bodyC: "if (gTasks[taskId].data[0] == 7)\n    {\n        DoSecretBaseBreakableDoorEffect(gTasks[taskId].data[1], gTasks[taskId].data[2]);\n        DestroyTask(taskId);\n    }\n    else\n    {\n        gTasks[taskId].data[0]++;\n    }",
  },
  "Task_SecretBaseMusicNoteMatSound": {
    callsTo: ["DestroyTask","PlaySE"],
    dataReads: ["data[1]","tMetatileID"],
    dataWrites: ["data[1]"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 35,
    bodyC: "if (gTasks[taskId].data[1] == 7)\n    {\n        switch (gTasks[taskId].tMetatileID)\n        {\n        case METATILE_SecretBase_NoteMat_C_Low:\n            PlaySE(SE_NOTE_C);\n            break;\n        case METATILE_SecretBase_NoteMat_D:\n            PlaySE(SE_NOTE_D);\n            break;\n        case METATILE_SecretBase_NoteMat_E:\n            PlaySE(SE_NOTE_E);\n            break;\n        case METATILE_SecretBase_NoteMat_F:\n            PlaySE(SE_NOTE_F);\n            break;\n        case METATILE_SecretBase_NoteMat_G:\n            PlaySE(SE_NOTE_G);\n            break;\n        case METATILE_SecretBase_NoteMat_A:\n            PlaySE(SE_NOTE_A);\n            break;\n        case METATILE_SecretBase_NoteMat_B:\n            PlaySE(SE_NOTE_B);\n            break;\n        case METATILE_SecretBase_NoteMat_C_High:\n            PlaySE(SE_NOTE_C_HIGH);\n            break;\n        }\n\n        DestroyTask(taskId);\n    }\n    else\n    {\n        gTasks[taskId].data[1]++;\n    }",
  },
  "Task_FieldPoisonEffect": {
    callsTo: ["DestroyTask","SetGpuReg"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 18,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n    case 0:\n        tMosaic += 2;\n        if (tMosaic > 8)\n            tState++;\n        break;\n    case 1:\n        tMosaic -= 2;\n        if (tMosaic == 0)\n            tState++;\n        break;\n    case 2:\n        DestroyTask(taskId);\n        return;\n    }\n    SetGpuReg(REG_OFFSET_MOSAIC, (tMosaic << 4) | tMosaic);",
  },
  "Task_WateringBerryTreeAnim": {
    taskTransitions: ["Task_WateringBerryTreeAnim_Start"],
    lineCount: 1,
    bodyC: "gTasks[taskId].func = Task_WateringBerryTreeAnim_Start;",
  },
  "Task_WateringBerryTreeAnim_Start": {
    callsTo: ["GetPlayerFacingDirection","GetWalkInPlaceNormalMovementAction","ObjectEventClearHeldMovementIfFinished","ObjectEventIsMovementOverridden","ObjectEventSetHeldMovement","SetPlayerAvatarWatering"],
    taskTransitions: ["Task_WateringBerryTreeAnim_Continue"],
    lineCount: 8,
    bodyC: "struct ObjectEvent *playerObjEvent = &gObjectEvents[gPlayerAvatar.objectEventId];\n\n    if (!ObjectEventIsMovementOverridden(playerObjEvent)\n        || ObjectEventClearHeldMovementIfFinished(playerObjEvent))\n    {\n         \n        SetPlayerAvatarWatering(GetPlayerFacingDirection());\n        ObjectEventSetHeldMovement(playerObjEvent, GetWalkInPlaceNormalMovementAction(GetPlayerFacingDirection()));\n        gTasks[taskId].func = Task_WateringBerryTreeAnim_Continue;\n    }",
  },
  "Task_WateringBerryTreeAnim_Continue": {
    callsTo: ["GetPlayerFacingDirection","GetWalkInPlaceNormalMovementAction","ObjectEventClearHeldMovementIfFinished","ObjectEventSetHeldMovement"],
    taskTransitions: ["Task_WateringBerryTreeAnim_End"],
    dataReads: ["data[1]"],
    dataWrites: ["data[1]"],
    lineCount: 9,
    bodyC: "struct ObjectEvent *playerObjEvent = &gObjectEvents[gPlayerAvatar.objectEventId];\n\n    if (ObjectEventClearHeldMovementIfFinished(playerObjEvent))\n    {\n        s16 value = gTasks[taskId].data[1]++;\n\n         \n        if (value < 10)\n            ObjectEventSetHeldMovement(playerObjEvent, GetWalkInPlaceNormalMovementAction(GetPlayerFacingDirection()));\n        else\n            gTasks[taskId].func = Task_WateringBerryTreeAnim_End;\n    }",
  },
  "Task_WateringBerryTreeAnim_End": {
    callsTo: ["DestroyTask","GetPlayerAvatarFlags","ScriptContext_Enable","SetPlayerAvatarTransitionFlags"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 3,
    bodyC: "SetPlayerAvatarTransitionFlags(GetPlayerAvatarFlags());\n    DestroyTask(taskId);\n    ScriptContext_Enable();",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_CaveEntranceInit": {
    callsTo: ["PlaySE"],
    spriteTransitions: ["SpriteCB_CaveEntranceOpen"],
    lineCount: 3,
    bodyC: "PlaySE(SE_M_ROCK_THROW);\n\n    sprite->data[0] = 0;\n    sprite->callback = SpriteCB_CaveEntranceOpen;",
  },
  "SpriteCB_CaveEntranceOpen": {
    callsTo: ["ToggleSecretBaseEntranceMetatile"],
    spriteTransitions: ["SpriteCB_CaveEntranceEnd"],
    lineCount: 10,
    bodyC: "if (sprite->data[0] < 40)\n    {\n        if (++sprite->data[0] == 20)\n            ToggleSecretBaseEntranceMetatile();\n    }\n    else\n    {\n        sprite->data[0] = 0;\n        sprite->callback = SpriteCB_CaveEntranceEnd;\n    }",
  },
  "SpriteCB_CaveEntranceEnd": {
    callsTo: ["FieldEffectStop","ScriptContext_Enable"],
    lineCount: 2,
    bodyC: "FieldEffectStop(sprite, FLDEFF_SECRET_POWER_CAVE);\n    ScriptContext_Enable();",
  },
  "SpriteCB_TreeEntranceInit": {
    callsTo: ["PlaySE"],
    spriteTransitions: ["SpriteCB_TreeEntranceOpen"],
    lineCount: 4,
    bodyC: "PlaySE(SE_M_SCRATCH);\n\n    sprite->animNum = gFieldEffectArguments[7];\n    sprite->data[0] = 0;\n    sprite->callback = SpriteCB_TreeEntranceOpen;",
  },
  "SpriteCB_TreeEntranceOpen": {
    callsTo: ["ToggleSecretBaseEntranceMetatile"],
    spriteTransitions: ["SpriteCB_TreeEntranceEnd"],
    lineCount: 8,
    bodyC: "sprite->data[0]++;\n\n    if (sprite->data[0] >= 40)\n    {\n        if (gFieldEffectArguments[7] == 0 || gFieldEffectArguments[7] == 2)\n            ToggleSecretBaseEntranceMetatile();\n\n        sprite->data[0] = 0;\n        sprite->callback = SpriteCB_TreeEntranceEnd;\n    }",
  },
  "SpriteCB_TreeEntranceEnd": {
    callsTo: ["FieldEffectStop","ScriptContext_Enable"],
    lineCount: 2,
    bodyC: "FieldEffectStop(sprite, FLDEFF_SECRET_POWER_TREE);\n    ScriptContext_Enable();",
  },
  "SpriteCB_ShrubEntranceInit": {
    callsTo: ["PlaySE"],
    spriteTransitions: ["SpriteCB_ShrubEntranceOpen"],
    lineCount: 3,
    bodyC: "PlaySE(SE_M_POISON_POWDER);\n\n    sprite->data[0] = 0;\n    sprite->callback = SpriteCB_ShrubEntranceOpen;",
  },
  "SpriteCB_ShrubEntranceOpen": {
    callsTo: ["ToggleSecretBaseEntranceMetatile"],
    spriteTransitions: ["SpriteCB_ShrubEntranceEnd"],
    lineCount: 11,
    bodyC: "if (sprite->data[0] < 40)\n    {\n        sprite->data[0]++;\n\n        if (sprite->data[0] == 20)\n            ToggleSecretBaseEntranceMetatile();\n    }\n    else\n    {\n        sprite->data[0] = 0;\n        sprite->callback = SpriteCB_ShrubEntranceEnd;\n    }",
  },
  "SpriteCB_ShrubEntranceEnd": {
    callsTo: ["FieldEffectStop","ScriptContext_Enable"],
    lineCount: 2,
    bodyC: "FieldEffectStop(sprite, FLDEFF_SECRET_POWER_SHRUB);\n    ScriptContext_Enable();",
  },
  "SpriteCB_GlitterMatSparkle": {
    callsTo: ["DestroySprite","PlaySE"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 5,
    bodyC: "sprite->data[0]++;\n\n    if (sprite->data[0] == 8)\n        PlaySE(SE_M_HEAL_BELL);\n\n    if (sprite->data[0] >= 32)\n        DestroySprite(sprite);",
  },
  "SpriteCB_SandPillar_BreakTop": {
    callsTo: ["CurrentMapDrawMetatileAt","MapGridGetMetatileIdAt","MapGridSetMetatileIdAt","PlaySE"],
    spriteTransitions: ["SpriteCB_SandPillar_BreakBase"],
    lineCount: 10,
    bodyC: "PlaySE(SE_M_ROCK_THROW);\n\n    if (MapGridGetMetatileIdAt(gFieldEffectArguments[5], gFieldEffectArguments[6] - 1) == METATILE_SecretBase_SandOrnament_TopWall)\n        MapGridSetMetatileIdAt(gFieldEffectArguments[5], gFieldEffectArguments[6] - 1, METATILE_SecretBase_Wall_TopMid | MAPGRID_IMPASSABLE);\n    else\n        MapGridSetMetatileIdAt(gFieldEffectArguments[5], gFieldEffectArguments[6] - 1, METATILE_SecretBase_SandOrnament_BrokenTop);\n\n    MapGridSetMetatileIdAt(gFieldEffectArguments[5], gFieldEffectArguments[6], METATILE_SecretBase_Ground);\n    CurrentMapDrawMetatileAt(gFieldEffectArguments[5], gFieldEffectArguments[6] - 1);\n    CurrentMapDrawMetatileAt(gFieldEffectArguments[5], gFieldEffectArguments[6]);\n\n    sprite->data[0] = 0;\n    sprite->callback = SpriteCB_SandPillar_BreakBase;",
  },
  "SpriteCB_SandPillar_BreakBase": {
    callsTo: ["CurrentMapDrawMetatileAt","MapGridSetMetatileIdAt"],
    spriteTransitions: ["SpriteCB_SandPillar_End"],
    lineCount: 11,
    bodyC: "if (sprite->data[0] < 18)\n    {\n        sprite->data[0]++;\n    }\n    else\n    {\n        MapGridSetMetatileIdAt(gFieldEffectArguments[5], gFieldEffectArguments[6], METATILE_SecretBase_SandOrnament_BrokenBase | MAPGRID_IMPASSABLE);\n        CurrentMapDrawMetatileAt(gFieldEffectArguments[5], gFieldEffectArguments[6]);\n        sprite->data[0] = 0;\n        sprite->callback = SpriteCB_SandPillar_End;\n    }",
  },
  "SpriteCB_SandPillar_End": {
    callsTo: ["FieldEffectStop","ScriptContext_Enable"],
    lineCount: 2,
    bodyC: "FieldEffectStop(sprite, FLDEFF_SAND_PILLAR);\n    ScriptContext_Enable();",
  },
} as const;
