// AUTO-GENERATED from src/intro_credits_graphics.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 1 Task_, 0 CB2_, 5 SpriteCB_

export const TASKS = {
  "Task_BicycleBgAnimation": {
    callsTo: ["SetGpuReg"],
    dataReads: ["tBg1PosHi","tBg1PosLo","tBg1Speed","tBg2PosHi","tBg2PosLo","tBg2Speed","tBg3PosHi","tBg3PosLo","tBg3Speed","tMode"],
    dataWrites: ["tBg1PosHi","tBg1PosLo","tBg2PosHi","tBg2PosLo","tBg3PosHi","tBg3PosLo"],
    lineCount: 37,
    bodyC: "s16 bg1Speed;\n    s16 bg2Speed;\n    s16 bg3Speed;\n    s32 offset;\n\n     \n    bg1Speed = gTasks[taskId].tBg1Speed;\n    if (bg1Speed != 0)\n    {\n        offset = (gTasks[taskId].tBg1PosHi << 16) + (u16)gTasks[taskId].tBg1PosLo;\n        offset -= (u16)bg1Speed << 4;\n        gTasks[taskId].tBg1PosHi = offset >> 16;\n        gTasks[taskId].tBg1PosLo = offset;\n        SetGpuReg(REG_OFFSET_BG1HOFS, gTasks[taskId].tBg1PosHi);\n        SetGpuReg(REG_OFFSET_BG1VOFS, gIntroCredits_MovingSceneryVBase + gIntroCredits_MovingSceneryVOffset);\n    }\n\n     \n    bg2Speed = gTasks[taskId].tBg2Speed;\n    if (bg2Speed != 0)\n    {\n        offset = (gTasks[taskId].tBg2PosHi << 16) + (u16)gTasks[taskId].tBg2PosLo;\n        offset -= (u16)bg2Speed << 4;\n        gTasks[taskId].tBg2PosHi = offset >> 16;\n        gTasks[taskId].tBg2PosLo = offset;\n        SetGpuReg(REG_OFFSET_BG2HOFS, gTasks[taskId].tBg2PosHi);\n        if (gTasks[taskId].tMode != 0)\n            SetGpuReg(REG_OFFSET_BG2VOFS, gIntroCredits_MovingSceneryVBase + gIntroCredits_MovingSceneryVOffset);\n        else\n            SetGpuReg(REG_OFFSET_BG2VOFS, gIntroCredits_MovingSceneryVBase);\n    }\n\n     \n    bg3Speed = gTasks[taskId].tBg3Speed;\n    if (bg3Speed != 0)\n    {\n        offset = (gTasks[taskId].tBg3PosHi << 16) + (u16)gTasks[taskId].tBg3PosLo;\n        offset -= (u16)bg3Speed << 4;\n        gTasks[taskId].tBg3PosHi = offset >> 16;\n        gTasks[taskId].tBg3PosLo = offset;\n        SetGpuReg(REG_OFFSET_BG3HOFS, gTasks[taskId].tBg3PosHi);\n        SetGpuReg(REG_OFFSET_BG3VOFS, gIntroCredits_MovingSceneryVBase);\n    }",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_MovingScenery": {
    callsTo: ["DestroySprite"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 22,
    bodyC: "s32 x;\n    s16 state = gIntroCredits_MovingSceneryState;\n\n    if (state != INTROCRED_SCENERY_FROZEN)\n    {\n        switch (state)\n        {\n        default:  \n            DestroySprite(sprite);\n            break;\n        case INTROCRED_SCENERY_NORMAL:\n            x = ((sprite->x << 16) | (u16)sprite->tXPos) + (u16)sprite->tXOffset;\n            sprite->x = x >> 16;\n            sprite->tXPos = x;\n            if (sprite->x > 255)\n                sprite->x = -32;\n            if (sprite->tHasVerticalMove)\n                sprite->y2 = -(gIntroCredits_MovingSceneryVBase + gIntroCredits_MovingSceneryVOffset);\n            else\n                sprite->y2 = -gIntroCredits_MovingSceneryVBase;\n            break;\n        }\n    }",
  },
  "SpriteCB_Player": {
    lineCount: 0,
    bodyC: "",
  },
  "SpriteCB_Bicycle": {
    lineCount: 5,
    bodyC: "sprite->invisible = gSprites[sprite->sPlayerSpriteId].invisible;\n    sprite->x = gSprites[sprite->sPlayerSpriteId].x;\n    sprite->y = gSprites[sprite->sPlayerSpriteId].y + 8;\n    sprite->x2 = gSprites[sprite->sPlayerSpriteId].x2;\n    sprite->y2 = gSprites[sprite->sPlayerSpriteId].y2;",
  },
  "SpriteCB_FlygonLeftHalf": {
    lineCount: 0,
    bodyC: "",
  },
  "SpriteCB_FlygonRightHalf": {
    lineCount: 4,
    bodyC: "sprite->invisible = gSprites[sprite->sLeftSpriteId].invisible;\n    sprite->y = gSprites[sprite->sLeftSpriteId].y;\n    sprite->x2 = gSprites[sprite->sLeftSpriteId].x2;\n    sprite->y2 = gSprites[sprite->sLeftSpriteId].y2;",
  },
} as const;
