// AUTO-GENERATED from src/battle_transition.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 38 Task_, 1 CB2_, 3 SpriteCB_

export const TASKS = {
  "Task_BattleTransition": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sTaskHandlers[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_Intro": {
    callsTo: ["CreateIntroTask","DestroyTask","IsIntroTaskDone"],
    dataReads: ["tState"],
    dataWrites: ["tState"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 9,
    bodyC: "if (gTasks[taskId].tState == 0)\n    {\n        gTasks[taskId].tState++;\n        CreateIntroTask(0, 0, 3, 2, 2);\n    }\n    else if (IsIntroTaskDone())\n    {\n        DestroyTask(taskId);\n    }",
  },
  "Task_Blur": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sBlur_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_Swirl": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sSwirl_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_Shuffle": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sShuffle_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_BigPokeball": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sBigPokeball_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_Aqua": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sAqua_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_Magma": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sMagma_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_Regice": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sRegice_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_Registeel": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sRegisteel_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_Regirock": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sRegirock_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_Kyogre": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sKyogre_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_PokeballsTrail": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sPokeballsTrail_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_ClockwiseWipe": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sClockwiseWipe_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_Ripple": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sRipple_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_Wave": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sWave_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_Sidney": {
    callsTo: ["DoMugshotTransition"],
    dataWrites: ["tMugshotId"],
    lineCount: 2,
    bodyC: "gTasks[taskId].tMugshotId = MUGSHOT_SIDNEY;\n    DoMugshotTransition(taskId);",
  },
  "Task_Phoebe": {
    callsTo: ["DoMugshotTransition"],
    dataWrites: ["tMugshotId"],
    lineCount: 2,
    bodyC: "gTasks[taskId].tMugshotId = MUGSHOT_PHOEBE;\n    DoMugshotTransition(taskId);",
  },
  "Task_Glacia": {
    callsTo: ["DoMugshotTransition"],
    dataWrites: ["tMugshotId"],
    lineCount: 2,
    bodyC: "gTasks[taskId].tMugshotId = MUGSHOT_GLACIA;\n    DoMugshotTransition(taskId);",
  },
  "Task_Drake": {
    callsTo: ["DoMugshotTransition"],
    dataWrites: ["tMugshotId"],
    lineCount: 2,
    bodyC: "gTasks[taskId].tMugshotId = MUGSHOT_DRAKE;\n    DoMugshotTransition(taskId);",
  },
  "Task_Champion": {
    callsTo: ["DoMugshotTransition"],
    dataWrites: ["tMugshotId"],
    lineCount: 2,
    bodyC: "gTasks[taskId].tMugshotId = MUGSHOT_CHAMPION;\n    DoMugshotTransition(taskId);",
  },
  "Task_Slice": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sSlice_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_ShredSplit": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sShredSplit_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_Blackhole": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sBlackhole_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_BlackholePulsate": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sBlackholePulsate_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_RectangularSpiral": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sRectangularSpiral_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_Groudon": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sGroudon_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_Rayquaza": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sRayquaza_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_WhiteBarsFade": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sWhiteBarsFade_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_GridSquares": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sGridSquares_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_AngledWipes": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sAngledWipes_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_BattleTransition_Intro": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sTransitionIntroFuncs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_FrontierLogoWiggle": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sFrontierLogoWiggle_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_FrontierLogoWave": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sFrontierLogoWave_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_FrontierSquares": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sFrontierSquares_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_FrontierSquaresSpiral": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sFrontierSquaresSpiral_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_FrontierSquaresScroll": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sFrontierSquaresScroll_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_ScrollBg": {
    callsTo: ["SetGpuReg"],
    dataReads: ["tScrollUpdateFlag","tScrollXDir","tScrollYDir"],
    lineCount: 7,
    bodyC: "if (!(gTasks[taskId].tScrollUpdateFlag ^= 1))\n    {\n        SetGpuReg(REG_OFFSET_BG0VOFS, gBattle_BG0_X);\n        SetGpuReg(REG_OFFSET_BG0HOFS, gBattle_BG0_Y);\n        gBattle_BG0_X += gTasks[taskId].tScrollXDir;\n        gBattle_BG0_Y += gTasks[taskId].tScrollYDir;\n    }",
  },
} as const;

export const CB2S = {
  "CB2_TestBattleTransition": {
    callsTo: ["AnimateSprites","BuildOamBuffer","IsBattleTransitionDone","LaunchBattleTransitionTask","RunTasks","SetMainCallback2","UpdatePaletteFade"],
    cb2Transitions: ["CB2_ReturnToField"],
    externalChecks: { waitForVBlank: true },
    lineCount: 18,
    bodyC: "switch (sTestingTransitionState)\n    {\n    case 0:\n        LaunchBattleTransitionTask(sTestingTransitionId);\n        sTestingTransitionState++;\n        break;\n    case 1:\n        if (IsBattleTransitionDone())\n        {\n            sTestingTransitionState = 0;\n            SetMainCallback2(CB2_ReturnToField);\n        }\n        break;\n    }\n\n    RunTasks();\n    AnimateSprites();\n    BuildOamBuffer();\n    UpdatePaletteFade();",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_FldEffPokeballTrail": {
    callsTo: ["ARRAY_COUNT","FieldEffectStop","SET_TILE","memcpy"],
    lineCount: 29,
    bodyC: "s16 speeds[ARRAY_COUNT(sPokeballsTrail_Speeds)];\n    memcpy(speeds, sPokeballsTrail_Speeds, sizeof(sPokeballsTrail_Speeds));\n\n    if (sprite->sDelay != 0)\n    {\n        sprite->sDelay--;\n    }\n    else\n    {\n        if (sprite->x >= 0 && sprite->x <= DISPLAY_WIDTH)\n        {\n             \n            s16 posX = sprite->x >> 3;\n            s16 posY = sprite->y >> 3;\n\n             \n            if (posX != sprite->sPrevX)\n            {\n                u32 var;\n                u16 *ptr;\n\n                sprite->sPrevX = posX;\n                var = ((REG_BG0CNT >> 8) & 0x1F) << 11;\n                ptr = (u16 *)(BG_VRAM + var);\n\n                SET_TILE(ptr, posY - 2, posX, 1);\n                SET_TILE(ptr, posY - 1, posX, 1);\n                SET_TILE(ptr, posY - 0, posX, 1);\n                SET_TILE(ptr, posY + 1, posX, 1);\n            }\n        }\n        sprite->x += speeds[sprite->sSide];\n        if (sprite->x < -15 || sprite->x > DISPLAY_WIDTH + 15)\n            FieldEffectStop(sprite, FLDEFF_POKEBALL_TRAIL);\n    }",
  },
  "SpriteCB_MugshotTrainerPic": {
    lineCount: 1,
    bodyC: "while (sMugshotTrainerPicFuncs[sprite->sState](sprite));",
  },
  "SpriteCB_WhiteBarFade": {
    callsTo: ["DestroySprite"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 35,
    bodyC: "if (sprite->sDelay)\n    {\n        sprite->sDelay--;\n        if (sprite->sIsMainSprite)\n            sTransitionData->VBlank_DMA = 1;\n    }\n    else\n    {\n        u16 i;\n        u16 *ptr1 = &gScanlineEffectRegBuffers[0][sprite->y];\n        u16 *ptr2 = &gScanlineEffectRegBuffers[0][sprite->y + DISPLAY_HEIGHT];\n        for (i = 0; i < DISPLAY_HEIGHT / NUM_WHITE_BARS; i++)\n        {\n            ptr1[i] = sprite->sFade >> 8;\n            ptr2[i] = (u8)sprite->x;\n        }\n        if (sprite->x == 0 && sprite->sFade == FADE_TARGET)\n            sprite->sFinished = TRUE;\n\n        sprite->x -= 16;\n        sprite->sFade += FADE_TARGET / 32;\n\n        if (sprite->x < 0)\n            sprite->x = 0;\n        if (sprite->sFade > FADE_TARGET)\n            sprite->sFade = FADE_TARGET;\n\n        if (sprite->sIsMainSprite)\n            sTransitionData->VBlank_DMA = 1;\n\n        if (sprite->sFinished)\n        {\n             \n             \n            if (!sprite->sIsMainSprite || (sTransitionData->counter >= NUM_WHITE_BARS - 1 && sprite->sDestroyAttempts++ > 7))\n            {\n                sTransitionData->counter++;\n                DestroySprite(sprite);\n            }\n        }\n    }",
  },
} as const;
