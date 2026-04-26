// AUTO-GENERATED from src/pokeball.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 2 Task_, 0 CB2_, 23 SpriteCB_

export const TASKS = {
  "Task_DoPokeballSendOutAnim": {
    callsTo: ["CreateSprite","DestroyTask","GetBattlerAtPosition","GetBattlerSide","GetBattlerSpriteCoord","GetMonData","InitAnimArcTranslation","ItemIdToBallId","LoadBallGfx","PlaySE"],
    taskTransitions: ["TaskDummy"],
    dataReads: ["tBattler","tFrames","tThrowId"],
    dataWrites: ["tFrames","tOpponentBattler"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 57,
    bodyC: "u16 throwCaseId;\n    u8 battler;\n    u16 itemId, ballId;\n    u8 ballSpriteId;\n    bool8 notSendOut = FALSE;\n\n    if (gTasks[taskId].tFrames == 0)\n    {\n        gTasks[taskId].tFrames++;\n        return;\n    }\n\n    throwCaseId = gTasks[taskId].tThrowId;\n    battler = gTasks[taskId].tBattler;\n\n    if (GetBattlerSide(battler) != B_SIDE_PLAYER)\n        itemId = GetMonData(&gEnemyParty[gBattlerPartyIndexes[battler]], MON_DATA_POKEBALL);\n    else\n        itemId = GetMonData(&gPlayerParty[gBattlerPartyIndexes[battler]], MON_DATA_POKEBALL);\n\n    ballId = ItemIdToBallId(itemId);\n    LoadBallGfx(ballId);\n    ballSpriteId = CreateSprite(&gBallSpriteTemplates[ballId], 32, 80, 29);\n    gSprites[ballSpriteId].data[0] = 0x80;\n    gSprites[ballSpriteId].data[1] = 0;\n    gSprites[ballSpriteId].data[7] = throwCaseId;\n\n    switch (throwCaseId)\n    {\n    case POKEBALL_PLAYER_SENDOUT:\n        gBattlerTarget = battler;\n        gSprites[ballSpriteId].x = 24;\n        gSprites[ballSpriteId].y = 68;\n        gSprites[ballSpriteId].callback = SpriteCB_PlayerMonSendOut_1;\n        break;\n    case POKEBALL_OPPONENT_SENDOUT:\n        gSprites[ballSpriteId].x = GetBattlerSpriteCoord(battler, BATTLER_COORD_X);\n        gSprites[ballSpriteId].y = GetBattlerSpriteCoord(battler, BATTLER_COORD_Y) + 24;\n        gBattlerTarget = battler;\n        gSprites[ballSpriteId].data[0] = 0;\n        gSprites[ballSpriteId].callback = SpriteCB_OpponentMonSendOut;\n        break;\n    default:\n        gBattlerTarget = GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT);\n        notSendOut = TRUE;\n        break;\n    }\n\n    gSprites[ballSpriteId].sBattler = gBattlerTarget;\n    if (!notSendOut)\n    {\n        DestroyTask(taskId);\n        return;\n    }\n\n     \n    gSprites[ballSpriteId].data[0] = 34;\n    gSprites[ballSpriteId].data[2] = GetBattlerSpriteCoord(gBattlerTarget, BATTLER_COORD_X);\n    gSprites[ballSpriteId].data[4] = GetBattlerSpriteCoord(gBattlerTarget, BATTLER_COORD_Y) - 16;\n    gSprites[ballSpriteId].data[5] = -40;\n    InitAnimArcTranslation(&gSprites[ballSpriteId]);\n    gSprites[ballSpriteId].oam.affineParam = taskId;\n    gTasks[taskId].tOpponentBattler = gBattlerTarget;\n    gTasks[taskId].func = TaskDummy;\n    PlaySE(SE_BALL_THROW);",
  },
  "Task_PlayCryWhenReleasedFromBall": {
    callsTo: ["DestroyTask","IsCryPlayingOrClearCrySongs","PlayCry_ByMode","PlayCry_ReleaseDouble","ShouldPlayNormalMonCry","StopCryAndClearCrySongs"],
    dataReads: ["tCryTaskBattler","tCryTaskFrames","tCryTaskMonPtr1","tCryTaskMonPtr2","tCryTaskMonSpriteId","tCryTaskPan","tCryTaskSpecies","tCryTaskState","tCryTaskWantedCry"],
    dataWrites: ["tCryTaskFrames","tCryTaskState"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 74,
    bodyC: "u8 wantedCry = gTasks[taskId].tCryTaskWantedCry;\n    s8 pan = gTasks[taskId].tCryTaskPan;\n    u16 species = gTasks[taskId].tCryTaskSpecies;\n    u8 battler = gTasks[taskId].tCryTaskBattler;\n    u8 monSpriteId = gTasks[taskId].tCryTaskMonSpriteId;\n    struct Pokemon *mon = (void *)(u32)((gTasks[taskId].tCryTaskMonPtr1 << 16) | (u16)(gTasks[taskId].tCryTaskMonPtr2));\n\n    switch (gTasks[taskId].tCryTaskState)\n    {\n    case 0:\n    default:\n        if (gSprites[monSpriteId].affineAnimEnded)\n            gTasks[taskId].tCryTaskState = wantedCry + 1;\n        break;\n    case 1:\n         \n        if (ShouldPlayNormalMonCry(mon) == TRUE)\n            PlayCry_ByMode(species, pan, CRY_MODE_NORMAL);\n        else\n            PlayCry_ByMode(species, pan, CRY_MODE_WEAK);\n        gBattleSpritesDataPtr->healthBoxesData[battler].waitForCry = FALSE;\n        DestroyTask(taskId);\n        break;\n    case 2:\n        StopCryAndClearCrySongs();\n        gTasks[taskId].tCryTaskFrames = 3;\n        gTasks[taskId].tCryTaskState = 20;\n        break;\n    case 20:\n        if (gTasks[taskId].tCryTaskFrames == 0)\n        {\n             \n            if (ShouldPlayNormalMonCry(mon) == TRUE)\n                PlayCry_ReleaseDouble(species, pan, CRY_MODE_DOUBLES);\n            else\n                PlayCry_ReleaseDouble(species, pan, CRY_MODE_WEAK_DOUBLES);\n\n            gBattleSpritesDataPtr->healthBoxesData[battler].waitForCry = FALSE;\n            DestroyTask(taskId);\n        }\n        else\n        {\n            gTasks[taskId].tCryTaskFrames--;\n        }\n        break;\n    case 3:\n        gTasks[taskId].tCryTaskFrames = 6;\n        gTasks[taskId].tCryTaskState = 30;\n        break;\n    case 30:\n        if (gTasks[taskId].tCryTaskFrames != 0)\n        {\n            gTasks[taskId].tCryTaskFrames--;\n            break;\n        }\n        gTasks[taskId].tCryTaskState++;\n         \n    case 31:\n        if (!IsCryPlayingOrClearCrySongs())\n        {\n            StopCryAndClearCrySongs();\n            gTasks[taskId].tCryTaskFrames = 3;\n            gTasks[taskId].tCryTaskState++;\n        }\n        break;\n    case 32:\n        if (gTasks[taskId].tCryTaskFrames != 0)\n        {\n            gTasks[taskId].tCryTaskFrames--;\n            break;\n        }\n         \n        if (ShouldPlayNormalMonCry(mon) == TRUE)\n            PlayCry_ReleaseDouble(species, pan, CRY_MODE_NORMAL);\n        else\n            PlayCry_ReleaseDouble(species, pan, CRY_MODE_WEAK);\n\n        gBattleSpritesDataPtr->healthBoxesData[battler].waitForCry = FALSE;\n        DestroyTask(taskId);\n        break;\n    }",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_BallThrow": {
    callsTo: ["AnimateBallOpenParticles","DestroyTask","GetBattlerPokeballItemId","ItemIdToBallId","LaunchBallFadeMonTask","StartSpriteAnim","TranslateAnimHorizontalArc"],
    spriteTransitions: ["SpriteCB_BallThrow_ReachMon"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 21,
    bodyC: "if (TranslateAnimHorizontalArc(sprite))\n    {\n        u16 ballId;\n        u8 taskId = sprite->oam.affineParam;\n        u8 opponentBattler = gTasks[taskId].tOpponentBattler;\n        u8 noOfShakes = gTasks[taskId].tThrowId;\n\n        StartSpriteAnim(sprite, 1);\n        sprite->affineAnimPaused = TRUE;\n        sprite->x += sprite->x2;\n        sprite->y += sprite->y2;\n        sprite->x2 = 0;\n        sprite->y2 = 0;\n        sprite->data[5] = 0;\n        ballId = ItemIdToBallId(GetBattlerPokeballItemId(opponentBattler));\n        AnimateBallOpenParticles(sprite->x, sprite->y - 5, 1, 28, ballId);\n        sprite->data[0] = LaunchBallFadeMonTask(FALSE, opponentBattler, 14, ballId);\n        sprite->sBattler = opponentBattler;\n        sprite->data[7] = noOfShakes;\n        DestroyTask(taskId);\n        sprite->callback = SpriteCB_BallThrow_ReachMon;\n    }",
  },
  "SpriteCB_BallThrow_ReachMon": {
    spriteTransitions: ["SpriteCB_BallThrow_StartShrinkMon"],
    lineCount: 1,
    bodyC: "sprite->callback = SpriteCB_BallThrow_StartShrinkMon;",
  },
  "SpriteCB_BallThrow_StartShrinkMon": {
    callsTo: ["AnimateSprite","StartSpriteAffineAnim"],
    spriteTransitions: ["SpriteCB_BallThrow_ShrinkMon"],
    lineCount: 8,
    bodyC: "if (++sprite->data[5] == 10)\n    {\n        sprite->data[5] = 0;\n        sprite->callback = SpriteCB_BallThrow_ShrinkMon;\n        StartSpriteAffineAnim(&gSprites[gBattlerSpriteIds[sprite->sBattler]], BATTLER_AFFINE_RETURN);\n        AnimateSprite(&gSprites[gBattlerSpriteIds[sprite->sBattler]]);\n        gSprites[gBattlerSpriteIds[sprite->sBattler]].data[1] = 0;\n    }",
  },
  "SpriteCB_BallThrow_ShrinkMon": {
    callsTo: ["PlaySE","StartSpriteAnim"],
    spriteTransitions: ["SpriteCB_BallThrow_Close"],
    lineCount: 15,
    bodyC: "sprite->data[5]++;\n    if (sprite->data[5] == 11)\n        PlaySE(SE_BALL_TRADE);\n\n    if (gSprites[gBattlerSpriteIds[sprite->sBattler]].affineAnimEnded)\n    {\n        StartSpriteAnim(sprite, 2);\n        gSprites[gBattlerSpriteIds[sprite->sBattler]].invisible = TRUE;\n        sprite->data[5] = 0;\n        sprite->callback = SpriteCB_BallThrow_Close;\n    }\n    else\n    {\n        gSprites[gBattlerSpriteIds[sprite->sBattler]].data[1] += 0x60;\n        gSprites[gBattlerSpriteIds[sprite->sBattler]].y2 = -gSprites[gBattlerSpriteIds[sprite->sBattler]].data[1] >> 8;\n    }",
  },
  "SpriteCB_BallThrow_Close": {
    callsTo: ["Cos"],
    spriteTransitions: ["SpriteCB_BallThrow_FallToGround"],
    lineCount: 13,
    bodyC: "if (sprite->animEnded)\n    {\n        sprite->data[5]++;\n        if (sprite->data[5] == 1)\n        {\n            sprite->data[3] = 0;\n            sprite->data[4] = 32;\n            sprite->data[5] = 0;\n            sprite->y += Cos(0, 32);\n            sprite->y2 = -Cos(0, sprite->data[4]);\n            sprite->callback = SpriteCB_BallThrow_FallToGround;\n        }\n    }",
  },
  "SpriteCB_BallThrow_FallToGround": {
    callsTo: ["Cos","PlaySE"],
    spriteTransitions: ["SpriteCB_BallThrow_StartShakes","SpriteCB_ReleaseMonFromBall"],
    lineCount: 55,
    bodyC: "bool8 r5 = FALSE;\n\n    switch (sprite->data[3] & 0xFF)\n    {\n    case 0:\n        sprite->y2 = -Cos(sprite->data[5], sprite->data[4]);\n        sprite->data[5] += 4 + (sprite->data[3] >> 8);\n        if (sprite->data[5] >= 64)\n        {\n            sprite->data[4] -= 10;\n            sprite->data[3] += 0x101;\n            if (sprite->data[3] >> 8 == 4)\n                r5 = TRUE;\n            switch (sprite->data[3] >> 8)\n            {\n            case 1:\n                PlaySE(SE_BALL_BOUNCE_1);\n                break;\n            case 2:\n                PlaySE(SE_BALL_BOUNCE_2);\n                break;\n            case 3:\n                PlaySE(SE_BALL_BOUNCE_3);\n                break;\n            default:\n                PlaySE(SE_BALL_BOUNCE_4);\n                break;\n            }\n        }\n        break;\n    case 1:\n        sprite->y2 = -Cos(sprite->data[5], sprite->data[4]);\n        sprite->data[5] -= 4 + (sprite->data[3] >> 8);\n        if (sprite->data[5] <= 0)\n        {\n            sprite->data[5] = 0;\n            sprite->data[3] &= 0xFF00;\n        }\n        break;\n    }\n    if (r5)\n    {\n        sprite->data[3] = 0;\n        sprite->y += Cos(64, 32);\n        sprite->y2 = 0;\n        if (sprite->data[7] == 0)\n        {\n            sprite->callback = SpriteCB_ReleaseMonFromBall;\n        }\n        else\n        {\n            sprite->callback = SpriteCB_BallThrow_StartShakes;\n            sprite->data[4] = 1;\n            sprite->data[5] = 0;\n        }\n    }",
  },
  "SpriteCB_BallThrow_StartShakes": {
    callsTo: ["PlaySE","StartSpriteAffineAnim"],
    spriteTransitions: ["SpriteCB_BallThrow_Shake"],
    lineCount: 9,
    bodyC: "sprite->data[3]++;\n    if (sprite->data[3] == 31)\n    {\n        sprite->data[3] = 0;\n        sprite->affineAnimPaused = TRUE;\n        StartSpriteAffineAnim(sprite, 1);\n        sprite->callback = SpriteCB_BallThrow_Shake;\n        PlaySE(SE_BALL);\n    }",
  },
  "SpriteCB_BallThrow_Shake": {
    callsTo: ["ChangeSpriteAffineAnim","PlaySE","StartSpriteAffineAnim"],
    spriteTransitions: ["SpriteCB_BallThrow_StartCaptureMon","SpriteCB_ReleaseMonFromBall"],
    lineCount: 67,
    bodyC: "switch (sprite->data[3] & 0xFF)\n    {\n    case 0:\n    case 2:\n        sprite->x2 += sprite->data[4];\n        sprite->data[5] += sprite->data[4];\n        sprite->affineAnimPaused = FALSE;\n        if (sprite->data[5] > 3 || sprite->data[5] < -3)\n        {\n            sprite->data[3]++;\n            sprite->data[5] = 0;\n        }\n        break;\n    case 1:\n        sprite->data[5]++;\n        if (sprite->data[5] == 1)\n        {\n            sprite->data[5] = 0;\n            sprite->data[4] = -sprite->data[4];\n            sprite->data[3]++;\n            sprite->affineAnimPaused = FALSE;\n            if (sprite->data[4] < 0)\n                ChangeSpriteAffineAnim(sprite, 2);\n            else\n                ChangeSpriteAffineAnim(sprite, 1);\n        }\n        else\n        {\n            sprite->affineAnimPaused = TRUE;\n        }\n        break;\n    case 3:\n        sprite->data[3] += 0x100;\n        if (sprite->data[3] >> 8 == sprite->data[7])\n        {\n            sprite->callback = SpriteCB_ReleaseMonFromBall;\n        }\n        else\n        {\n            if (sprite->data[7] == 4 && sprite->data[3] >> 8 == 3)\n            {\n                sprite->callback = SpriteCB_BallThrow_StartCaptureMon;\n                sprite->affineAnimPaused = TRUE;\n            }\n            else\n            {\n                sprite->data[3]++;\n                sprite->affineAnimPaused = TRUE;\n            }\n        }\n        break;\n    case 4:\n    default:\n        sprite->data[5]++;\n        if (sprite->data[5] == 31)\n        {\n            sprite->data[5] = 0;\n            sprite->data[3] &= 0xFF00;\n            StartSpriteAffineAnim(sprite, 3);\n            if (sprite->data[4] < 0)\n                StartSpriteAffineAnim(sprite, 2);\n            else\n                StartSpriteAffineAnim(sprite, 1);\n\n            PlaySE(SE_BALL);\n        }\n        break;\n    }",
  },
  "SpriteCB_ReleaseMonFromBall": {
    callsTo: ["AnimateBallOpenParticles","AnimateSprite","CreateTask","GetBattlerAtPosition","GetBattlerPokeballItemId","GetBattlerSide","GetMonData","IsBGMPlaying","IsDoubleBattle","ItemIdToBallId","LaunchBallFadeMonTask","StartSpriteAffineAnim","StartSpriteAnim","m4aMPlayStop","m4aMPlayVolumeControl"],
    spriteTransitions: ["HandleBallAnimEnd"],
    lineCount: 62,
    bodyC: "u8 battler = sprite->sBattler;\n    u32 ballId;\n\n    StartSpriteAnim(sprite, 1);\n    ballId = ItemIdToBallId(GetBattlerPokeballItemId(battler));\n    AnimateBallOpenParticles(sprite->x, sprite->y - 5, 1, 28, ballId);\n    sprite->data[0] = LaunchBallFadeMonTask(TRUE, sprite->sBattler, 14, ballId);\n    sprite->callback = HandleBallAnimEnd;\n\n    if (gMain.inBattle)\n    {\n        struct Pokemon *mon;\n        u16 species;\n        s8 pan;\n        u16 wantedCryCase;\n        u8 taskId;\n\n        if (GetBattlerSide(battler) != B_SIDE_PLAYER)\n        {\n            mon = &gEnemyParty[gBattlerPartyIndexes[battler]];\n            pan = 25;\n        }\n        else\n        {\n            mon = &gPlayerParty[gBattlerPartyIndexes[battler]];\n            pan = -25;\n        }\n\n        species = GetMonData(mon, MON_DATA_SPECIES);\n        if ((battler == GetBattlerAtPosition(B_POSITION_PLAYER_LEFT) || battler == GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT))\n         && IsDoubleBattle() && gBattleSpritesDataPtr->animationData->introAnimActive)\n        {\n            if (gBattleTypeFlags & BATTLE_TYPE_MULTI && gBattleTypeFlags & BATTLE_TYPE_LINK)\n            {\n                if (IsBGMPlaying())\n                    m4aMPlayStop(&gMPlayInfo_BGM);\n            }\n            else\n            {\n                m4aMPlayVolumeControl(&gMPlayInfo_BGM, TRACKS_ALL, 128);\n            }\n        }\n\n        if (!IsDoubleBattle() || !gBattleSpritesDataPtr->animationData->introAnimActive)\n            wantedCryCase = 0;\n        else if (battler == GetBattlerAtPosition(B_POSITION_PLAYER_LEFT) || battler == GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT))\n            wantedCryCase = 1;\n        else\n            wantedCryCase = 2;\n\n        gBattleSpritesDataPtr->healthBoxesData[battler].waitForCry = TRUE;\n\n        taskId = CreateTask(Task_PlayCryWhenReleasedFromBall, 3);\n        gTasks[taskId].tCryTaskSpecies = species;\n        gTasks[taskId].tCryTaskPan = pan;\n        gTasks[taskId].tCryTaskWantedCry = wantedCryCase;\n        gTasks[taskId].tCryTaskBattler = battler;\n        gTasks[taskId].tCryTaskMonSpriteId = gBattlerSpriteIds[sprite->sBattler];\n        gTasks[taskId].tCryTaskMonPtr1 = (u32)(mon) >> 16;\n        gTasks[taskId].tCryTaskMonPtr2 = (u32)(mon);\n        gTasks[taskId].tCryTaskState = 0;\n    }\n\n    StartSpriteAffineAnim(&gSprites[gBattlerSpriteIds[sprite->sBattler]], BATTLER_AFFINE_EMERGE);\n\n    if (GetBattlerSide(sprite->sBattler) == B_SIDE_OPPONENT)\n        gSprites[gBattlerSpriteIds[sprite->sBattler]].callback = SpriteCB_OpponentMonFromBall;\n    else\n        gSprites[gBattlerSpriteIds[sprite->sBattler]].callback = SpriteCB_PlayerMonFromBall;\n\n    AnimateSprite(&gSprites[gBattlerSpriteIds[sprite->sBattler]]);\n    gSprites[gBattlerSpriteIds[sprite->sBattler]].data[1] = 0x1000;",
  },
  "SpriteCB_BallThrow_StartCaptureMon": {
    spriteTransitions: ["SpriteCB_BallThrow_CaptureMon"],
    lineCount: 5,
    bodyC: "sprite->animPaused = TRUE;\n    sprite->callback = SpriteCB_BallThrow_CaptureMon;\n    sprite->data[3] = 0;\n    sprite->data[4] = 0;\n    sprite->data[5] = 0;",
  },
  "SpriteCB_BallThrow_CaptureMon": {
    callsTo: ["DestroySprite","DestroySpriteAndFreeResources","FreeOamMatrix","PlaySE","m4aMPlayAllStop"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 20,
    bodyC: "u8 battler = sprite->sBattler;\n\n    sprite->data[4]++;\n    if (sprite->data[4] == 40)\n    {\n        return;\n    }\n    else if (sprite->data[4] == 95)\n    {\n        gDoingBattleAnim = FALSE;\n        m4aMPlayAllStop();\n        PlaySE(MUS_EVOLVED);\n    }\n    else if (sprite->data[4] == 315)\n    {\n        FreeOamMatrix(gSprites[gBattlerSpriteIds[sprite->sBattler]].oam.matrixNum);\n        DestroySprite(&gSprites[gBattlerSpriteIds[sprite->sBattler]]);\n        DestroySpriteAndFreeResources(sprite);\n        if (gMain.inBattle)\n            gBattleSpritesDataPtr->healthBoxesData[battler].ballAnimActive = FALSE;\n    }",
  },
  "SpriteCB_PlayerMonSendOut_1": {
    callsTo: ["GetBattlerSpriteCoord","InitAnimArcTranslation"],
    spriteTransitions: ["SpriteCB_PlayerMonSendOut_2"],
    lineCount: 7,
    bodyC: "sprite->data[0] = 25;\n    sprite->data[2] = GetBattlerSpriteCoord(sprite->sBattler, BATTLER_COORD_X_2);\n    sprite->data[4] = GetBattlerSpriteCoord(sprite->sBattler, BATTLER_COORD_Y_PIC_OFFSET) + 24;\n    sprite->data[5] = -30;\n    sprite->oam.affineParam = sprite->sBattler;\n    InitAnimArcTranslation(sprite);\n    sprite->callback = SpriteCB_PlayerMonSendOut_2;",
  },
  "SpriteCB_PlayerMonSendOut_2": {
    callsTo: ["AnimTranslateLinear","GetBattlerAtPosition","HIBYTE","IsDoubleBattle","Sin","StartSpriteAffineAnim","TranslateAnimHorizontalArc"],
    spriteTransitions: ["SpriteCB_ReleaseMon2FromBall","SpriteCB_ReleaseMonFromBall"],
    lineCount: 48,
    bodyC: "u32 r6;\n    u32 r7;\n\n    if (HIBYTE(sprite->data[7]) >= 35 && HIBYTE(sprite->data[7]) < 80)\n    {\n        s16 r4;\n\n        if ((sprite->oam.affineParam & 0xFF00) == 0)\n        {\n            r6 = sprite->data[1] & 1;\n            r7 = sprite->data[2] & 1;\n            sprite->data[1] = ((sprite->data[1] / 3) & ~1) | r6;\n            sprite->data[2] = ((sprite->data[2] / 3) & ~1) | r7;\n            StartSpriteAffineAnim(sprite, 4);\n        }\n        r4 = sprite->data[0];\n        AnimTranslateLinear(sprite);\n        sprite->data[7] += sprite->sBattler / 3;\n        sprite->y2 += Sin(HIBYTE(sprite->data[7]), sprite->data[5]);\n        sprite->oam.affineParam += 0x100;\n        if ((sprite->oam.affineParam >> 8) % 3 != 0)\n            sprite->data[0] = r4;\n        else\n            sprite->data[0] = r4 - 1;\n        if (HIBYTE(sprite->data[7]) >= 80)\n        {\n            r6 = sprite->data[1] & 1;\n            r7 = sprite->data[2] & 1;\n            sprite->data[1] = ((sprite->data[1] * 3) & ~1) | r6;\n            sprite->data[2] = ((sprite->data[2] * 3) & ~1) | r7;\n        }\n    }\n    else\n    {\n        if (TranslateAnimHorizontalArc(sprite))\n        {\n            sprite->x += sprite->x2;\n            sprite->y += sprite->y2;\n            sprite->y2 = 0;\n            sprite->x2 = 0;\n            sprite->sBattler = sprite->oam.affineParam & 0xFF;\n            sprite->data[0] = 0;\n\n            if (IsDoubleBattle() && gBattleSpritesDataPtr->animationData->introAnimActive\n             && sprite->sBattler == GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT))\n                sprite->callback = SpriteCB_ReleaseMon2FromBall;\n            else\n                sprite->callback = SpriteCB_ReleaseMonFromBall;\n\n            StartSpriteAffineAnim(sprite, 0);\n        }\n    }",
  },
  "SpriteCB_ReleaseMon2FromBall": {
    spriteTransitions: ["SpriteCB_ReleaseMonFromBall"],
    lineCount: 5,
    bodyC: "if (sprite->data[0]++ > 24)\n    {\n        sprite->data[0] = 0;\n        sprite->callback = SpriteCB_ReleaseMonFromBall;\n    }",
  },
  "SpriteCB_OpponentMonSendOut": {
    callsTo: ["GetBattlerAtPosition","IsDoubleBattle"],
    spriteTransitions: ["SpriteCB_ReleaseMon2FromBall","SpriteCB_ReleaseMonFromBall"],
    lineCount: 10,
    bodyC: "sprite->data[0]++;\n    if (sprite->data[0] > 15)\n    {\n        sprite->data[0] = 0;\n        if (IsDoubleBattle() && gBattleSpritesDataPtr->animationData->introAnimActive\n         && sprite->sBattler == GetBattlerAtPosition(B_POSITION_OPPONENT_RIGHT))\n            sprite->callback = SpriteCB_ReleaseMon2FromBall;\n        else\n            sprite->callback = SpriteCB_ReleaseMonFromBall;\n    }",
  },
  "SpriteCB_PokeballReleaseMon": {
    callsTo: ["AnimateBallOpenParticlesForPokeball","AnimateSprite","LaunchBallFadeMonTaskForPokeball","StartSpriteAffineAnim","StartSpriteAnim"],
    spriteTransitions: ["SpriteCB_ReleasedMonFlyOut"],
    lineCount: 24,
    bodyC: "if (sprite->sDelay == 0)\n    {\n        u8 subpriority;\n        u8 spriteId = sprite->sMonSpriteId;\n        u8 monPalNum = sprite->sMonPalNum;\n        u32 selectedPalettes = (u16)sprite->sFadePalsLo | ((u16)sprite->sFadePalsHi << 16);\n\n        if (sprite->subpriority != 0)\n            subpriority = sprite->subpriority - 1;\n        else\n            subpriority = 0;\n\n        StartSpriteAnim(sprite, 1);\n        AnimateBallOpenParticlesForPokeball(sprite->x, sprite->y - 5, sprite->oam.priority, subpriority);\n         \n        sprite->sDelay = LaunchBallFadeMonTaskForPokeball(TRUE, monPalNum, selectedPalettes);\n        sprite->callback = SpriteCB_ReleasedMonFlyOut;\n        gSprites[spriteId].invisible = FALSE;\n        StartSpriteAffineAnim(&gSprites[spriteId], BATTLER_AFFINE_EMERGE);\n        AnimateSprite(&gSprites[spriteId]);\n        gSprites[spriteId].data[1] = 0x1000;\n        sprite->sTrigIdx = 0;\n    }\n    else\n    {\n        sprite->sDelay--;\n    }",
  },
  "SpriteCB_ReleasedMonFlyOut": {
    callsTo: ["DestroySpriteAndFreeResources","DoMonFrontSpriteAnimation","StartSpriteAffineAnim"],
    lineCount: 38,
    bodyC: "bool8 emergeAnimFinished = FALSE;\n    bool8 atFinalPosition = FALSE;\n    u8 monSpriteId = sprite->sMonSpriteId;\n    u16 x, y;\n\n    if (sprite->animEnded)\n        sprite->invisible = TRUE;\n\n    if (gSprites[monSpriteId].affineAnimEnded)\n    {\n        StartSpriteAffineAnim(&gSprites[monSpriteId], BATTLER_AFFINE_NORMAL);\n        emergeAnimFinished = TRUE;\n    }\n\n    x = (sprite->sFinalMonX - sprite->x) * sprite->sTrigIdx / 128 + sprite->x;\n    y = (sprite->sFinalMonY - sprite->y) * sprite->sTrigIdx / 128 + sprite->y;\n    gSprites[monSpriteId].x = x;\n    gSprites[monSpriteId].y = y;\n\n    if (sprite->sTrigIdx < 128)\n    {\n        s16 sine = -(gSineTable[(u8)sprite->sTrigIdx] / 8);\n\n        sprite->sTrigIdx += 4;\n        gSprites[monSpriteId].x2 = sine;\n        gSprites[monSpriteId].y2 = sine;\n    }\n    else\n    {\n        gSprites[monSpriteId].x = sprite->sFinalMonX;\n        gSprites[monSpriteId].y = sprite->sFinalMonY;\n        gSprites[monSpriteId].x2 = 0;\n        gSprites[monSpriteId].y2 = 0;\n        atFinalPosition = TRUE;\n    }\n    if (sprite->animEnded && emergeAnimFinished && atFinalPosition)\n    {\n        if (gSprites[monSpriteId].sSpecies == SPECIES_EGG)\n            DoMonFrontSpriteAnimation(&gSprites[monSpriteId], gSprites[monSpriteId].sSpecies, TRUE, 0);\n        else\n            DoMonFrontSpriteAnimation(&gSprites[monSpriteId], gSprites[monSpriteId].sSpecies, FALSE, 0);\n\n        DestroySpriteAndFreeResources(sprite);\n    }",
  },
  "SpriteCB_TradePokeball": {
    callsTo: ["AnimateBallOpenParticlesForPokeball","AnimateSprite","LaunchBallFadeMonTaskForPokeball","StartSpriteAffineAnim","StartSpriteAnim"],
    spriteTransitions: ["SpriteCB_TradePokeballSendOff"],
    lineCount: 25,
    bodyC: "if (sprite->sDelay == 0)\n    {\n        u8 subpriority;\n        u8 monSpriteId = sprite->sMonSpriteId;\n        u8 monPalNum = sprite->sMonPalNum;\n        u32 selectedPalettes = (u16)sprite->sFadePalsLo | ((u16)sprite->sFadePalsHi << 16);\n\n        if (sprite->subpriority != 0)\n            subpriority = sprite->subpriority - 1;\n        else\n            subpriority = 0;\n\n        StartSpriteAnim(sprite, 1);\n        AnimateBallOpenParticlesForPokeball(sprite->x, sprite->y - 5, sprite->oam.priority, subpriority);\n         \n        sprite->sDelay = LaunchBallFadeMonTaskForPokeball(TRUE, monPalNum, selectedPalettes);\n        sprite->callback = SpriteCB_TradePokeballSendOff;\n#ifdef BUGFIX\n         \n         \n        gSprites[monSpriteId].affineAnimPaused = FALSE;\n#endif  \n        StartSpriteAffineAnim(&gSprites[monSpriteId], BATTLER_AFFINE_RETURN);\n        AnimateSprite(&gSprites[monSpriteId]);\n        gSprites[monSpriteId].data[1] = 0;\n    }\n    else\n    {\n        sprite->sDelay--;\n    }",
  },
  "SpriteCB_TradePokeballSendOff": {
    callsTo: ["PlaySE","StartSpriteAnim"],
    spriteTransitions: ["SpriteCB_TradePokeballEnd"],
    lineCount: 17,
    bodyC: "u8 monSpriteId;\n\n    sprite->sTimer++;\n    if (sprite->sTimer == 11)\n        PlaySE(SE_BALL_TRADE);\n\n    monSpriteId = sprite->sMonSpriteId;\n    if (gSprites[monSpriteId].affineAnimEnded)\n    {\n        StartSpriteAnim(sprite, 2);\n        gSprites[monSpriteId].invisible = TRUE;\n        sprite->sTimer = 0;\n        sprite->callback = SpriteCB_TradePokeballEnd;\n    }\n    else\n    {\n        gSprites[monSpriteId].data[1] += 96;\n        gSprites[monSpriteId].y2 = -gSprites[monSpriteId].data[1] >> 8;\n    }",
  },
  "SpriteCB_TradePokeballEnd": {
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 2,
    bodyC: "if (sprite->animEnded)\n        sprite->callback = SpriteCallbackDummy;",
  },
  "SpriteCB_HealthboxSlideInDelayed": {
    spriteTransitions: ["SpriteCB_HealthboxSlideIn"],
    lineCount: 6,
    bodyC: "sprite->sDelayTimer++;\n    if (sprite->sDelayTimer == 20)\n    {\n        sprite->sDelayTimer = 0;\n        sprite->callback = SpriteCB_HealthboxSlideIn;\n    }",
  },
  "SpriteCB_HealthboxSlideIn": {
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 4,
    bodyC: "sprite->x2 -= sprite->sSpeedX;\n    sprite->y2 -= sprite->sSpeedY;\n    if (sprite->x2 == 0 && sprite->y2 == 0)\n        sprite->callback = SpriteCallbackDummy;",
  },
  "SpriteCB_HitAnimHealthoxEffect": {
    callsTo: ["DestroySprite"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 10,
    bodyC: "u8 r1 = sprite->data[1];\n\n    gSprites[r1].y2 = sprite->data[0];\n    sprite->data[0] = -sprite->data[0];\n    sprite->data[2]++;\n    if (sprite->data[2] == 21)\n    {\n        gSprites[r1].x2 = 0;\n        gSprites[r1].y2 = 0;\n        DestroySprite(sprite);\n    }",
  },
} as const;
