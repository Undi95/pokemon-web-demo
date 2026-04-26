// AUTO-GENERATED from src/battle_gfx_sfx_util.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 2 Task_, 0 CB2_, 5 SpriteCB_

export const TASKS = {
  "Task_ClearBitWhenBattleTableAnimDone": {
    callsTo: ["DestroyTask","gAnimScriptCallback"],
    dataReads: ["tBattlerId"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 6,
    bodyC: "gAnimScriptCallback();\n    if (!gAnimScriptActive)\n    {\n        gBattleSpritesDataPtr->healthBoxesData[gTasks[taskId].tBattlerId].animFromTableActive = 0;\n        DestroyTask(taskId);\n    }",
  },
  "Task_ClearBitWhenSpecialAnimDone": {
    callsTo: ["DestroyTask","gAnimScriptCallback"],
    dataReads: ["tBattlerId"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 6,
    bodyC: "gAnimScriptCallback();\n    if (!gAnimScriptActive)\n    {\n        gBattleSpritesDataPtr->healthBoxesData[gTasks[taskId].tBattlerId].specialAnimActive = 0;\n        DestroyTask(taskId);\n    }",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_WaitForBattlerBallReleaseAnim": {
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 14,
    bodyC: "u8 spriteId = sprite->data[1];\n\n    if (!gSprites[spriteId].affineAnimEnded)\n        return;\n    if (gSprites[spriteId].invisible)\n        return;\n\n    if (gSprites[spriteId].animPaused)\n    {\n        gSprites[spriteId].animPaused = 0;\n    }\n    else\n    {\n        if (gSprites[spriteId].animEnded)\n            sprite->callback = SpriteCallbackDummy;\n    }",
  },
  "SpriteCB_TrainerSlideIn": {
    spriteTransitions: ["SpriteCB_TrainerSlideVertical","SpriteCallbackDummy"],
    lineCount: 11,
    bodyC: "if (!(gIntroSlideFlags & 1))\n    {\n        sprite->x2 += sprite->sSpeedX;\n        if (sprite->x2 == 0)\n        {\n            if (sprite->y2 != 0)\n                sprite->callback = SpriteCB_TrainerSlideVertical;\n            else\n                sprite->callback = SpriteCallbackDummy;\n        }\n    }",
  },
  "SpriteCB_TrainerSlideVertical": {
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 3,
    bodyC: "sprite->y2 -= 2;\n    if (sprite->y2 == 0)\n        sprite->callback = SpriteCallbackDummy;",
  },
  "SpriteCB_EnemyShadow": {
    callsTo: ["IsBattlerSpritePresent"],
    spriteTransitions: ["SpriteCB_SetInvisible"],
    lineCount: 18,
    bodyC: "bool8 invisible = FALSE;\n    u8 battler = shadowSprite->tBattlerId;\n    struct Sprite *battlerSprite = &gSprites[gBattlerSpriteIds[battler]];\n\n    if (!battlerSprite->inUse || !IsBattlerSpritePresent(battler))\n    {\n        shadowSprite->callback = SpriteCB_SetInvisible;\n        return;\n    }\n    if (gAnimScriptActive || battlerSprite->invisible)\n        invisible = TRUE;\n    else if (gBattleSpritesDataPtr->battlerData[battler].transformSpecies != SPECIES_NONE\n             && gEnemyMonElevation[gBattleSpritesDataPtr->battlerData[battler].transformSpecies] == 0)\n        invisible = TRUE;\n\n    if (gBattleSpritesDataPtr->battlerData[battler].behindSubstitute)\n        invisible = TRUE;\n\n    shadowSprite->x = battlerSprite->x;\n    shadowSprite->x2 = battlerSprite->x2;\n    shadowSprite->invisible = invisible;",
  },
  "SpriteCB_SetInvisible": {
    lineCount: 1,
    bodyC: "sprite->invisible = TRUE;",
  },
} as const;
