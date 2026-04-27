// AUTO-GENERATED from src/battle_anim_throw.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 6 Task_, 0 CB2_, 23 SpriteCB_

export const TASKS = {
  "Task_PlayerThrow_Wait": {
    callsTo: ["DestroyTask","GetBattlerAtPosition","StartSpriteAnim"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 5,
    bodyC: "if (gSprites[gBattlerSpriteIds[GetBattlerAtPosition(B_POSITION_PLAYER_LEFT)]].animEnded)\n    {\n        StartSpriteAnim(&gSprites[gBattlerSpriteIds[GetBattlerAtPosition(B_POSITION_PLAYER_LEFT)]], 0);\n        DestroyTask(taskId);\n    }",
  },
  "Task_FadeMon_ToBallColor": {
    callsTo: ["BeginNormalPaletteFade","BlendPalette","DestroyTask","OBJ_PLTT_ID"],
    dataReads: ["tBallId","tCoeff","tPalOffset","tPaletteHi","tPaletteLo","tTimer"],
    dataWrites: ["tCoeff","tTimer"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 13,
    bodyC: "u8 ballId = gTasks[taskId].tBallId;\n\n    if (gTasks[taskId].tTimer <= 16)\n    {\n        BlendPalette(OBJ_PLTT_ID(gTasks[taskId].tPalOffset), 16, gTasks[taskId].tCoeff, gBallOpenFadeColors[ballId]);\n        gTasks[taskId].tCoeff += gTasks[taskId].tdCoeff;\n        gTasks[taskId].tTimer++;\n    }\n    else if (!gPaletteFade.active)\n    {\n        u32 selectedPalettes = (u16)gTasks[taskId].tPaletteLo | ((u16)gTasks[taskId].tPaletteHi << 16);\n        BeginNormalPaletteFade(selectedPalettes, 0, 16, 0, RGB_WHITE);\n        DestroyTask(taskId);\n    }",
  },
  "Task_FadeMon_ToNormal": {
    callsTo: ["BeginNormalPaletteFade"],
    taskTransitions: ["Task_FadeMon_ToNormal_Step"],
    dataReads: ["tPaletteHi","tPaletteLo"],
    externalChecks: { paletteFade: true },
    lineCount: 6,
    bodyC: "if (!gPaletteFade.active)\n    {\n        u32 selectedPalettes = (u16)gTasks[taskId].tPaletteLo | ((u16)gTasks[taskId].tPaletteHi << 16);\n        BeginNormalPaletteFade(selectedPalettes, 0, 16, 0, RGB_WHITE);\n        gTasks[taskId].func = Task_FadeMon_ToNormal_Step;\n    }",
  },
  "Task_FadeMon_ToNormal_Step": {
    callsTo: ["BlendPalette","DestroyTask","OBJ_PLTT_ID"],
    dataReads: ["tBallId","tCoeff","tPalOffset","tTimer"],
    dataWrites: ["tCoeff","tTimer"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 11,
    bodyC: "u8 ballId = gTasks[taskId].tBallId;\n\n    if (gTasks[taskId].tTimer <= 16)\n    {\n        BlendPalette(OBJ_PLTT_ID(gTasks[taskId].tPalOffset), 16, gTasks[taskId].tCoeff, gBallOpenFadeColors[ballId]);\n        gTasks[taskId].tCoeff += gTasks[taskId].tdCoeff;\n        gTasks[taskId].tTimer++;\n    }\n    else\n    {\n        DestroyTask(taskId);\n    }",
  },
  "Task_ShinyStars": {
    callsTo: ["CreateSprite","GetBattlerSide","GetBattlerSpriteCoord","PlaySE12WithPanning"],
    taskTransitions: ["Task_ShinyStars_Wait"],
    dataReads: ["tBattler","tNumStars","tStarIdx","tStarTimer","tTimer"],
    dataWrites: ["tNumStars","tStarIdx","tStarMove","tStarTimer","tTimer"],
    lineCount: 59,
    bodyC: "u8 battler;\n    u8 x, y;\n    u8 spriteId;\n    u16 timer;\n    s16 starIdx;\n    u8 pan;\n\n    if (gTasks[taskId].tTimer < 60)\n    {\n        gTasks[taskId].tTimer++;\n        return;\n    }\n\n     \n    if (gBattleSpritesDataPtr->animationData->numBallParticles)\n        return;\n\n    timer = gTasks[taskId].tStarTimer++;\n    if (timer % 4)  \n        return;\n\n    battler = gTasks[taskId].tBattler;\n    x = GetBattlerSpriteCoord(battler, BATTLER_COORD_X);\n    y = GetBattlerSpriteCoord(battler, BATTLER_COORD_Y);\n\n    starIdx = gTasks[taskId].tStarIdx;\n    if (starIdx == 0)  \n    {\n        spriteId = CreateSprite(&gWishStarSpriteTemplate, x, y, 5);\n    }\n    else if (starIdx >= 0 && gTasks[taskId].tStarIdx < 4)  \n    {\n        spriteId = CreateSprite(&gMiniTwinklingStarSpriteTemplate, x, y, 5);\n        gSprites[spriteId].oam.tileNum += 4;\n    }\n    else  \n    {\n        spriteId = CreateSprite(&gMiniTwinklingStarSpriteTemplate, x, y, 5);\n        gSprites[spriteId].oam.tileNum += 5;\n    }\n\n    if (gTasks[taskId].tStarMove == SHINY_STAR_ENCIRCLE)\n    {\n        gSprites[spriteId].callback = SpriteCB_ShinyStars_Encircle;\n    }\n    else\n    {\n        gSprites[spriteId].callback = SpriteCB_ShinyStars_Diagonal;\n        gSprites[spriteId].x2 = -32;\n        gSprites[spriteId].y2 = 32;\n        gSprites[spriteId].invisible = TRUE;\n        if (gTasks[taskId].tStarIdx == 0)\n        {\n            if (GetBattlerSide(battler) == B_SIDE_PLAYER)\n                pan = -64;\n            else\n                pan = 63;\n\n            PlaySE12WithPanning(SE_SHINY, pan);\n        }\n    }\n\n    gSprites[spriteId].sTaskId = taskId;\n    gTasks[taskId].tStarIdx++;\n    if (spriteId != MAX_SPRITES)\n        gTasks[taskId].tNumStars++;\n\n    if (gTasks[taskId].tStarIdx == 5)\n        gTasks[taskId].func = Task_ShinyStars_Wait;",
  },
  "Task_ShinyStars_Wait": {
    callsTo: ["DestroyTask"],
    dataReads: ["tBattler"],
    dataWrites: ["tNumStars","tStarMove"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 10,
    bodyC: "u8 battler;\n\n    if (gTasks[taskId].tNumStars == 0)\n    {\n        if (gTasks[taskId].tStarMove == SHINY_STAR_DIAGONAL)\n        {\n            battler = gTasks[taskId].tBattler;\n            gBattleSpritesDataPtr->healthBoxesData[battler].finishedShinyMonAnim = TRUE;\n        }\n\n        DestroyTask(taskId);\n    }",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_Ball_Throw": {
    callsTo: ["InitAnimArcTranslation"],
    spriteTransitions: ["SpriteCB_Ball_Arc"],
    lineCount: 9,
    bodyC: "u16 targetX = sprite->sTargetXArg;\n    u16 targetY = sprite->sTargetYArg;\n\n    sprite->sOffsetX = sprite->x;\n    sprite->sTargetX = targetX;\n    sprite->sOffsetY = sprite->y;\n    sprite->sTargetY = targetY;\n    sprite->sAmplitude = -40;\n    InitAnimArcTranslation(sprite);\n    sprite->callback = SpriteCB_Ball_Arc;",
  },
  "SpriteCB_Ball_Arc": {
    callsTo: ["AnimateBallOpenParticles","ItemIdToBallId","LaunchBallFadeMonTask","StartSpriteAnim","TranslateAnimHorizontalArc"],
    spriteTransitions: ["SpriteCB_Ball_Block","SpriteCB_Ball_MonShrink"],
    lineCount: 29,
    bodyC: "s32 i;\n    u8 ballId;\n\n    if (TranslateAnimHorizontalArc(sprite))\n    {\n        if (gBattleSpritesDataPtr->animationData->ballThrowCaseId == BALL_TRAINER_BLOCK)\n        {\n            sprite->callback = SpriteCB_Ball_Block;\n        }\n        else\n        {\n            StartSpriteAnim(sprite, 1);\n            sprite->x += sprite->x2;\n            sprite->y += sprite->y2;\n            sprite->x2 = 0;\n            sprite->y2 = 0;\n\n            for (i = 0; i < 8; i++)\n                sprite->data[i] = 0;\n\n            sprite->sTimer = 0;\n            sprite->callback = SpriteCB_Ball_MonShrink;\n\n            ballId = ItemIdToBallId(gLastUsedItem);\n            switch (ballId)\n            {\n            case 0 ... POKEBALL_COUNT - 1:\n                AnimateBallOpenParticles(sprite->x, sprite->y - 5, 1, 28, ballId);\n                LaunchBallFadeMonTask(FALSE, gBattleAnimTarget, 14, ballId);\n                break;\n            }\n        }\n    }",
  },
  "SpriteCB_Ball_MonShrink": {
    callsTo: ["CreateTask"],
    spriteTransitions: ["SpriteCB_Ball_MonShrink_Step"],
    lineCount: 6,
    bodyC: "if (++sprite->sTimer == 10)\n    {\n        sprite->sTaskId = CreateTask(TaskDummy, 50);\n        sprite->callback = SpriteCB_Ball_MonShrink_Step;\n        gSprites[gBattlerSpriteIds[gBattleAnimTarget]].data[1] = 0;\n    }",
  },
  "SpriteCB_Ball_MonShrink_Step": {
    callsTo: ["DestroyTask","PlaySE","PrepareBattlerSpriteForRotScale","ResetSpriteRotScale","SetSpriteRotScale","StartSpriteAnim"],
    spriteTransitions: ["SpriteCB_Ball_Bounce"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 41,
    bodyC: "u8 spriteId;\n    u8 taskId;\n\n    spriteId = gBattlerSpriteIds[gBattleAnimTarget];\n    taskId = sprite->sTaskId;\n\n    if (++gTasks[taskId].sTimer == 11)\n        PlaySE(SE_BALL_TRADE);\n\n    switch (gTasks[taskId].tState)\n    {\n    case MON_SHRINK:\n        PrepareBattlerSpriteForRotScale(spriteId, ST_OAM_OBJ_NORMAL);\n        gTasks[taskId].data[10] = 256;\n        gMonShrinkDuration = 28;\n        gMonShrinkDistance = (gSprites[spriteId].y + gSprites[spriteId].y2) - (sprite->y + sprite->y2);\n        gMonShrinkDelta = (u32)(gMonShrinkDistance * 256) / gMonShrinkDuration;\n        gTasks[taskId].data[2] = gMonShrinkDelta;\n        gTasks[taskId].tState++;  \n        break;\n    case MON_SHRINK_STEP:\n        gTasks[taskId].data[10] += 32;\n        SetSpriteRotScale(spriteId, gTasks[taskId].data[10], gTasks[taskId].data[10], 0);\n        gTasks[taskId].data[3] += gTasks[taskId].data[2];\n        gSprites[spriteId].y2 = -gTasks[taskId].data[3] >> 8;\n        if (gTasks[taskId].data[10] >= 1152)\n            gTasks[taskId].tState++;  \n        break;\n    case MON_SHRINK_INVISIBLE:\n        ResetSpriteRotScale(spriteId);\n        gSprites[spriteId].invisible = TRUE;\n        gTasks[taskId].tState++;  \n        break;\n    case MON_SHRINK_FREE:\n    default:\n        if (gTasks[taskId].data[1] > 10)\n        {\n            DestroyTask(taskId);\n            StartSpriteAnim(sprite, 2);\n            sprite->data[5] = 0;\n            sprite->callback = SpriteCB_Ball_Bounce;\n        }\n        break;\n    }",
  },
  "SpriteCB_Ball_Bounce": {
    callsTo: ["Cos"],
    spriteTransitions: ["SpriteCB_Ball_Bounce_Step"],
    lineCount: 11,
    bodyC: "s16 phase;\n\n    if (sprite->animEnded)\n    {\n        sprite->sState = 0;\n        sprite->sAmplitude = 40;\n        sprite->sPhase = 0;\n        phase = 0;\n        sprite->y += Cos(phase, 40);\n        sprite->y2 = -Cos(phase, sprite->sAmplitude);\n        sprite->callback = SpriteCB_Ball_Bounce_Step;\n    }",
  },
  "SpriteCB_Ball_Bounce_Step": {
    callsTo: ["BOUNCES","Cos","DIRECTION","FALL","PHASE_DELTA","PlaySE","RISE_FASTER"],
    spriteTransitions: ["SpriteCB_Ball_Release","SpriteCB_Ball_Wobble"],
    lineCount: 59,
    bodyC: "bool8 lastBounce;\n    s16 bounceCount;\n\n    lastBounce = FALSE;\n\n    switch (DIRECTION(sprite->sState))\n    {\n    case BALL_FALLING:\n        sprite->y2 = -Cos(sprite->sPhase, sprite->sAmplitude);\n        sprite->sPhase += PHASE_DELTA(sprite->sState) + 4;\n         \n        if (sprite->sPhase >= 64)\n        {\n            sprite->sAmplitude -= 10;\n            RISE_FASTER(sprite->sState);\n\n            bounceCount = BOUNCES(sprite->sState);\n            if (bounceCount == 4)\n                lastBounce = TRUE;\n\n            switch (bounceCount)\n            {\n            case 1:\n                PlaySE(SE_BALL_BOUNCE_1);\n                break;\n            case 2:\n                PlaySE(SE_BALL_BOUNCE_2);\n                break;\n            case 3:\n                PlaySE(SE_BALL_BOUNCE_3);\n                break;\n            default:\n                PlaySE(SE_BALL_BOUNCE_4);\n                break;\n            }\n        }\n        break;\n    case BALL_RISING:\n        sprite->y2 = -Cos(sprite->sPhase, sprite->sAmplitude);\n        sprite->sPhase -= PHASE_DELTA(sprite->sState) + 4;\n         \n        if (sprite->sPhase <= 0)\n        {\n             \n            sprite->sPhase = 0;\n            FALL(sprite->sState);\n        }\n        break;\n    }\n\n    if (lastBounce)\n    {\n        sprite->sState = 0;\n        sprite->y += Cos(64, 40);\n        sprite->y2 = 0;\n        if (gBattleSpritesDataPtr->animationData->ballThrowCaseId == BALL_NO_SHAKES)\n        {\n            sprite->sTimer = 0;\n            sprite->callback = SpriteCB_Ball_Release;\n        }\n        else\n        {\n            sprite->callback = SpriteCB_Ball_Wobble;\n            sprite->data[4] = 1;\n            sprite->data[5] = 0;\n        }\n    }",
  },
  "SpriteCB_Ball_Wobble": {
    callsTo: ["PlaySE","StartSpriteAffineAnim"],
    spriteTransitions: ["SpriteCB_Ball_Wobble_Step"],
    lineCount: 9,
    bodyC: "if (++sprite->sTimer == 31)\n    {\n        sprite->sState = 0;\n        sprite->affineAnimPaused = TRUE;\n        StartSpriteAffineAnim(sprite, BALL_ROTATE_RIGHT);\n        gBattleSpritesDataPtr->animationData->ballSubpx = 0;\n        sprite->callback = SpriteCB_Ball_Wobble_Step;\n        PlaySE(SE_BALL);\n    }",
  },
  "SpriteCB_Ball_Wobble_Step": {
    callsTo: ["ChangeSpriteAffineAnim","PlaySE","RESET_STATE","SHAKES","SHAKE_INC","STATE","StartSpriteAffineAnim"],
    spriteTransitions: ["SpriteCB_Ball_Capture","SpriteCB_Ball_Release"],
    lineCount: 133,
    bodyC: "s8 shakes;\n    u16 frame;\n\n    switch (STATE(sprite->sState))\n    {\n    case BALL_ROLL_1:\n         \n        if (gBattleSpritesDataPtr->animationData->ballSubpx > 255)\n        {\n            sprite->x2 += sprite->sDirection;\n            gBattleSpritesDataPtr->animationData->ballSubpx &= 0xFF;\n        }\n        else\n        {\n            gBattleSpritesDataPtr->animationData->ballSubpx += 176;\n        }\n\n        sprite->sTimer++;\n        sprite->affineAnimPaused = FALSE;\n        frame = sprite->sTimer + 7;\n        if (frame > 14)\n        {\n            gBattleSpritesDataPtr->animationData->ballSubpx = 0;\n            sprite->sState++;  \n            sprite->sTimer = 0;\n        }\n        break;\n    case BALL_PIVOT_1:\n        if (++sprite->sTimer == 1)\n        {\n            sprite->sTimer = 0;\n            sprite->sDirection = -sprite->sDirection;\n            sprite->sState++;  \n            sprite->affineAnimPaused = FALSE;\n            if (sprite->sDirection < 0)\n                ChangeSpriteAffineAnim(sprite, BALL_ROTATE_LEFT);\n            else\n                ChangeSpriteAffineAnim(sprite, BALL_ROTATE_RIGHT);\n        }\n        else\n        {\n            sprite->affineAnimPaused = TRUE;\n        }\n        break;\n    case BALL_ROLL_2:\n        if (gBattleSpritesDataPtr->animationData->ballSubpx > 255)\n        {\n            sprite->x2 += sprite->sDirection;\n            gBattleSpritesDataPtr->animationData->ballSubpx &= 0xFF;\n        }\n        else\n        {\n            gBattleSpritesDataPtr->animationData->ballSubpx += 176;\n        }\n\n        sprite->sTimer++;\n        sprite->affineAnimPaused = FALSE;\n        frame = sprite->sTimer + 12;\n        if (frame > 24)\n        {\n            gBattleSpritesDataPtr->animationData->ballSubpx = 0;\n            sprite->sState++;  \n            sprite->sTimer = 0;\n        }\n        break;\n    case BALL_PIVOT_2:\n        if (sprite->sTimer++ < 0)\n        {\n            sprite->affineAnimPaused = TRUE;\n            break;\n        }\n\n        sprite->sTimer = 0;\n        sprite->sDirection = -sprite->sDirection;\n        sprite->sState++;  \n        sprite->affineAnimPaused = FALSE;\n        if (sprite->sDirection < 0)\n            ChangeSpriteAffineAnim(sprite, BALL_ROTATE_LEFT);\n        else\n            ChangeSpriteAffineAnim(sprite, BALL_ROTATE_RIGHT);\n         \n    case BALL_ROLL_3:\n        if (gBattleSpritesDataPtr->animationData->ballSubpx > 0xFF)\n        {\n            sprite->x2 += sprite->sDirection;\n            gBattleSpritesDataPtr->animationData->ballSubpx &= 0xFF;\n        }\n        else\n        {\n            gBattleSpritesDataPtr->animationData->ballSubpx += 176;\n        }\n\n        sprite->sTimer++;\n        sprite->affineAnimPaused = FALSE;\n        frame = sprite->sTimer + 4;\n        if (frame > 8)\n        {\n            gBattleSpritesDataPtr->animationData->ballSubpx = 0;\n            sprite->sState++;  \n            sprite->sTimer = 0;\n            sprite->sDirection = -sprite->sDirection;\n        }\n        break;\n    case BALL_NEXT_MOVE:\n        SHAKE_INC(sprite->sState);\n        shakes = SHAKES(sprite->sState);\n        if (shakes == gBattleSpritesDataPtr->animationData->ballThrowCaseId)\n        {\n            sprite->affineAnimPaused = TRUE;\n            sprite->callback = SpriteCB_Ball_Release;\n        }\n        else\n        {\n            if (gBattleSpritesDataPtr->animationData->ballThrowCaseId == BALL_3_SHAKES_SUCCESS && shakes == 3)\n            {\n                sprite->callback = SpriteCB_Ball_Capture;\n                sprite->affineAnimPaused = TRUE;\n            }\n            else\n            {\n                sprite->sState++;  \n                sprite->affineAnimPaused = TRUE;\n            }\n        }\n        break;\n    case BALL_WAIT_NEXT_SHAKE:\n    default:\n        if (++sprite->sTimer == 31)\n        {\n            sprite->sTimer = 0;\n            RESET_STATE(sprite->sState);\n            StartSpriteAffineAnim(sprite, 3);\n            if (sprite->sDirection < 0)\n                StartSpriteAffineAnim(sprite, BALL_ROTATE_LEFT);\n            else\n                StartSpriteAffineAnim(sprite, BALL_ROTATE_RIGHT);\n\n            PlaySE(SE_BALL);\n        }\n        break;\n    }",
  },
  "SpriteCB_Ball_Release": {
    spriteTransitions: ["SpriteCB_Ball_Release_Step"],
    lineCount: 5,
    bodyC: "if (++sprite->sTimer == 31)\n    {\n        sprite->data[5] = 0;\n        sprite->callback = SpriteCB_Ball_Release_Step;\n    }",
  },
  "SpriteCB_Ball_Capture": {
    spriteTransitions: ["SpriteCB_Ball_Capture_Step"],
    lineCount: 5,
    bodyC: "sprite->animPaused = TRUE;\n    sprite->callback = SpriteCB_Ball_Capture_Step;\n    sprite->data[3] = 0;\n    sprite->sTimer = 0;\n    sprite->data[5] = 0;",
  },
  "SpriteCB_Ball_Capture_Step": {
    callsTo: ["BeginNormalPaletteFade","BlendPalettes","DestroySprite","FreeOamMatrix","MakeCaptureStars","PlaySE","UpdateOamPriorityInAllHealthboxes","m4aMPlayAllStop"],
    spriteTransitions: ["SpriteCB_Ball_FadeOut"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 26,
    bodyC: "u8 *battler = &gBattleAnimTarget;\n\n    sprite->sTimer++;\n    if (sprite->sTimer == 40)\n    {\n        PlaySE(SE_RG_BALL_CLICK);\n        BlendPalettes(0x10000 << sprite->oam.paletteNum, 6, RGB_BLACK);\n        MakeCaptureStars(sprite);\n    }\n    else if (sprite->sTimer == 60)\n    {\n        BeginNormalPaletteFade(0x10000 << sprite->oam.paletteNum, 2, 6, 0, RGB_BLACK);\n    }\n    else if (sprite->sTimer == 95)\n    {\n        gDoingBattleAnim = FALSE;\n        UpdateOamPriorityInAllHealthboxes(1);\n        m4aMPlayAllStop();\n        PlaySE(MUS_RG_CAUGHT_INTRO);\n    }\n    else if (sprite->sTimer == 315)\n    {\n        FreeOamMatrix(gSprites[gBattlerSpriteIds[*battler]].oam.matrixNum);\n        DestroySprite(&gSprites[gBattlerSpriteIds[*battler]]);\n\n        sprite->sState = 0;\n        sprite->callback = SpriteCB_Ball_FadeOut;\n    }",
  },
  "SpriteCB_Ball_FadeOut": {
    callsTo: ["BLDALPHA_BLEND","BeginNormalPaletteFade","IndexOfSpritePaletteTag","SetGpuReg"],
    spriteTransitions: ["DestroySpriteAfterOneFrame"],
    externalChecks: { paletteFade: true },
    lineCount: 37,
    bodyC: "u8 paletteIndex;\n\n    switch (sprite->sState)\n    {\n    case 0:\n        sprite->data[1] = 0;\n        sprite->data[2] = 0;\n        sprite->oam.objMode = ST_OAM_OBJ_BLEND;\n        SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_ALL);\n        SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(16, 0));\n        paletteIndex = IndexOfSpritePaletteTag(sprite->template->paletteTag);\n        BeginNormalPaletteFade(1 << (paletteIndex + 0x10), 0, 0, 16, RGB_WHITE);\n        sprite->sState++;\n        break;\n    case 1:\n        if (sprite->data[1]++ > 0)\n        {\n            sprite->data[1] = 0;\n            sprite->data[2]++;\n            SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(16 - sprite->data[2], sprite->data[2]));\n            if (sprite->data[2] == 16)\n                sprite->sState++;\n        }\n        break;\n    case 2:\n        sprite->invisible = TRUE;\n        sprite->sState++;\n        break;\n    default:\n        if (!gPaletteFade.active)\n        {\n            SetGpuReg(REG_OFFSET_BLDCNT, 0);\n            SetGpuReg(REG_OFFSET_BLDALPHA, 0);\n\n            sprite->sFrame = 0;\n            sprite->callback = DestroySpriteAfterOneFrame;\n        }\n        break;\n    }",
  },
  "SpriteCB_CaptureStar_Flicker": {
    callsTo: ["DestroySprite","TranslateAnimHorizontalArc"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 3,
    bodyC: "sprite->invisible = !sprite->invisible;\n    if (TranslateAnimHorizontalArc(sprite))\n        DestroySprite(sprite);",
  },
  "SpriteCB_Ball_Release_Step": {
    callsTo: ["AnimateBallOpenParticles","AnimateSprite","ItemIdToBallId","LaunchBallFadeMonTask","StartSpriteAffineAnim","StartSpriteAnim"],
    spriteTransitions: ["SpriteCB_Ball_Release_Wait"],
    lineCount: 16,
    bodyC: "u8 ballId;\n\n    StartSpriteAnim(sprite, 1);\n    StartSpriteAffineAnim(sprite, 0);\n    sprite->callback = SpriteCB_Ball_Release_Wait;\n\n    ballId = ItemIdToBallId(gLastUsedItem);\n    switch (ballId)\n    {\n    case 0 ... POKEBALL_COUNT - 1:\n        AnimateBallOpenParticles(sprite->x, sprite->y - 5, 1, 28, ballId);\n        LaunchBallFadeMonTask(TRUE, gBattleAnimTarget, 14, ballId);\n        break;\n    }\n\n     \n    gSprites[gBattlerSpriteIds[gBattleAnimTarget]].invisible = FALSE;\n    StartSpriteAffineAnim(&gSprites[gBattlerSpriteIds[gBattleAnimTarget]], BATTLER_AFFINE_EMERGE);\n    AnimateSprite(&gSprites[gBattlerSpriteIds[gBattleAnimTarget]]);\n    gSprites[gBattlerSpriteIds[gBattleAnimTarget]].sOffsetY = 4096;",
  },
  "SpriteCB_Ball_Release_Wait": {
    callsTo: ["StartSpriteAffineAnim","UpdateOamPriorityInAllHealthboxes"],
    spriteTransitions: ["DestroySpriteAfterOneFrame"],
    lineCount: 22,
    bodyC: "bool8 released = FALSE;\n\n    if (sprite->animEnded)\n        sprite->invisible = TRUE;\n\n    if (gSprites[gBattlerSpriteIds[gBattleAnimTarget]].affineAnimEnded)\n    {\n        StartSpriteAffineAnim(&gSprites[gBattlerSpriteIds[gBattleAnimTarget]], BATTLER_AFFINE_NORMAL);\n        released = TRUE;\n    }\n    else\n    {\n        gSprites[gBattlerSpriteIds[gBattleAnimTarget]].sOffsetY -= 288;\n        gSprites[gBattlerSpriteIds[gBattleAnimTarget]].y2 = gSprites[gBattlerSpriteIds[gBattleAnimTarget]].sOffsetY >> 8;\n    }\n\n    if (sprite->animEnded && released)\n    {\n        gSprites[gBattlerSpriteIds[gBattleAnimTarget]].y2 = 0;\n        gSprites[gBattlerSpriteIds[gBattleAnimTarget]].invisible = gBattleSpritesDataPtr->animationData->wildMonInvisible;\n        sprite->sFrame = 0;\n        sprite->callback = DestroySpriteAfterOneFrame;\n        gDoingBattleAnim = 0;\n        UpdateOamPriorityInAllHealthboxes(1);\n    }",
  },
  "SpriteCB_Ball_Block": {
    spriteTransitions: ["SpriteCB_Ball_Block_Step"],
    lineCount: 8,
    bodyC: "s32 i;\n\n    sprite->x += sprite->x2;\n    sprite->y += sprite->y2;\n    sprite->y2 = 0;\n    sprite->x2 = 0;\n    for (i = 0; i < 6; i++)\n        sprite->data[i] = 0;\n\n    sprite->callback = SpriteCB_Ball_Block_Step;",
  },
  "SpriteCB_Ball_Block_Step": {
    callsTo: ["UpdateOamPriorityInAllHealthboxes"],
    spriteTransitions: ["DestroySpriteAfterOneFrame"],
    lineCount: 14,
    bodyC: "s16 dy = sprite->sDy + 0x800;\n    s16 dx = sprite->sDx + 0x680;\n    sprite->x2 -= dx >> 8;\n    sprite->y2 += dy >> 8;\n    sprite->sDy = (sprite->sDy + 0x800) & 0xFF;\n    sprite->sDx = (sprite->sDx + 0x680) & 0xFF;\n\n    if (sprite->y + sprite->y2 > DISPLAY_HEIGHT\n     || sprite->x + sprite->x2 < -8)\n    {\n        sprite->sFrame = 0;\n        sprite->callback = DestroySpriteAfterOneFrame;\n        gDoingBattleAnim = 0;\n        UpdateOamPriorityInAllHealthboxes(1);\n    }",
  },
  "SpriteCB_ShinyStars_Encircle": {
    callsTo: ["Cos","DestroySprite","FreeSpriteOamMatrix","Sin"],
    terminalMarkers: ["DestroySprite","FreeSpriteOamMatrix"],
    lineCount: 9,
    bodyC: "sprite->x2 = Sin(sprite->sPhase, 24);\n    sprite->y2 = Cos(sprite->sPhase, 24);\n    sprite->sPhase += 12;\n    if (sprite->sPhase > 255)\n    {\n        gTasks[sprite->sTaskId].tNumStars--;\n        FreeSpriteOamMatrix(sprite);\n        DestroySprite(sprite);\n    }",
  },
  "SpriteCB_ShinyStars_Diagonal": {
    callsTo: ["DestroySprite","FreeSpriteOamMatrix"],
    terminalMarkers: ["DestroySprite","FreeSpriteOamMatrix"],
    lineCount: 16,
    bodyC: "if (sprite->sTimer < 4)\n    {\n        sprite->sTimer++;\n    }\n    else\n    {\n        sprite->invisible = FALSE;\n        sprite->x2 += 5;\n        sprite->y2 -= 5;\n        if (sprite->x2 > 32)\n        {\n            gTasks[sprite->sTaskId].tNumStars--;\n            FreeSpriteOamMatrix(sprite);\n            DestroySprite(sprite);\n        }\n    }",
  },
  "SpriteCB_PokeBlock_Throw": {
    callsTo: ["GetBattlerAtPosition","GetBattlerSpriteCoord","InitAnimArcTranslation","InitSpritePosToAnimAttacker"],
    spriteTransitions: ["SpriteCB_PokeBlock_LiftArm"],
    lineCount: 8,
    bodyC: "InitSpritePosToAnimAttacker(sprite, FALSE);\n    sprite->sDuration = 30;\n    sprite->sTargetX = GetBattlerSpriteCoord(GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT), BATTLER_COORD_X) + gBattleAnimArgs[2];\n    sprite->sTargetY = GetBattlerSpriteCoord(GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT), BATTLER_COORD_Y) + gBattleAnimArgs[3];\n    sprite->sAmplitude = -32;\n    InitAnimArcTranslation(sprite);\n    gSprites[gBattlerSpriteIds[gBattleAnimAttacker]].callback = SpriteCB_TrainerThrowObject;\n    sprite->callback = SpriteCB_PokeBlock_LiftArm;",
  },
  "SpriteCB_PokeBlock_LiftArm": {
    spriteTransitions: ["SpriteCB_PokeBlock_Arc"],
    lineCount: 2,
    bodyC: "if (gSprites[gBattlerSpriteIds[gBattleAnimAttacker]].animCmdIndex == 1)\n        sprite->callback = SpriteCB_PokeBlock_Arc;",
  },
  "SpriteCB_PokeBlock_Arc": {
    callsTo: ["TranslateAnimHorizontalArc"],
    spriteTransitions: ["SpriteCB_ThrowPokeBlock_Free"],
    lineCount: 6,
    bodyC: "if (TranslateAnimHorizontalArc(sprite))\n    {\n        sprite->data[0] = 0;\n        sprite->invisible = TRUE;\n        sprite->callback = SpriteCB_ThrowPokeBlock_Free;\n    }",
  },
  "SpriteCB_ThrowPokeBlock_Free": {
    callsTo: ["DestroyAnimSprite","StartSpriteAnim"],
    lineCount: 8,
    bodyC: "if (gSprites[gBattlerSpriteIds[gBattleAnimAttacker]].animEnded)\n    {\n        if (++sprite->data[0] > 0)\n        {\n            StartSpriteAnim(&gSprites[gBattlerSpriteIds[gBattleAnimAttacker]], 0);\n            DestroyAnimSprite(sprite);\n        }\n    }",
  },
} as const;
