// AUTO-GENERATED from src/mirage_tower.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 1 Task_, 0 CB2_, 2 SpriteCB_

export const TASKS = {
  "Task_FossilFallAndSink": {
    callsTo: ["AllocZeroed","CreateSprite","DestroySprite","FREE_AND_SET_NULL","Random","SWAP","ScriptContext_Enable"],
    dataReads: ["tState"],
    dataWrites: ["tState"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 57,
    bodyC: "u16 i;\n    u8 *buffer;\n\n    switch (gTasks[taskId].tState)\n    {\n    case 1:\n        sFallingFossil = AllocZeroed(sizeof(*sFallingFossil));\n        sFallingFossil->frameImageTiles = AllocZeroed(sizeof(sFossil_Gfx));\n        sFallingFossil->frameImage = AllocZeroed(sizeof(*sFallingFossil->frameImage));\n        sFallingFossil->disintegrateRand = AllocZeroed(FOSSIL_DISINTEGRATE_LENGTH * sizeof(u16));\n        sFallingFossil->disintegrateIdx = 0;\n        break;\n    case 2:\n        buffer = sFallingFossil->frameImageTiles;\n        for (i = 0; i < sizeof(sFossil_Gfx); i++, buffer++)\n            *buffer = sFossil_Gfx[i];\n        break;\n    case 3:\n        sFallingFossil->frameImage->data = sFallingFossil->frameImageTiles;\n        sFallingFossil->frameImage->size = sizeof(sFossil_Gfx);\n        break;\n    case 4:\n        {\n            struct SpriteTemplate fossilTemplate = sSpriteTemplate_FallingFossil;\n            fossilTemplate.images = sFallingFossil->frameImage;\n            sFallingFossil->spriteId = CreateSprite(&fossilTemplate, 128, -16, 1);\n            gSprites[sFallingFossil->spriteId].centerToCornerVecX = 0;\n            gSprites[sFallingFossil->spriteId].data[0] = gSprites[sFallingFossil->spriteId].x;\n            gSprites[sFallingFossil->spriteId].data[1] = 1;\n        }\n    case 5:\n         \n        for (i = 0; i < FOSSIL_DISINTEGRATE_LENGTH; i++)\n            sFallingFossil->disintegrateRand[i] = i;\n        break;\n    case 6:\n         \n        for (i = 0; i < FOSSIL_DISINTEGRATE_LENGTH * sizeof(u16); i++)\n        {\n            u16 rand1, rand2, temp;\n            rand1 = Random() % FOSSIL_DISINTEGRATE_LENGTH;\n            rand2 = Random() % FOSSIL_DISINTEGRATE_LENGTH;\n            SWAP(sFallingFossil->disintegrateRand[rand2], sFallingFossil->disintegrateRand[rand1], temp);\n        }\n        gSprites[sFallingFossil->spriteId].callback = SpriteCB_FallingFossil;\n        break;\n    case 7:\n         \n        if (gSprites[sFallingFossil->spriteId].callback != SpriteCallbackDummy)\n            return;\n        DestroySprite(&gSprites[sFallingFossil->spriteId]);\n        FREE_AND_SET_NULL(sFallingFossil->disintegrateRand);;\n        FREE_AND_SET_NULL(sFallingFossil->frameImage);\n        FREE_AND_SET_NULL(sFallingFossil->frameImageTiles);\n        FREE_AND_SET_NULL(sFallingFossil);\n        break;\n    case 8:\n        ScriptContext_Enable();\n        break;\n    }\n    gTasks[taskId].tState++;",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_CeilingCrumble": {
    callsTo: ["DestroySprite","IncrementCeilingCrumbleFinishedCount"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 7,
    bodyC: "sprite->sYOffset += 2;\n    sprite->y2 = sprite->sYOffset / 2;\n    if ((sprite->y + sprite->y2) >  sCeilingCrumblePositions[sprite->sIndex][2])\n    {\n        DestroySprite(sprite);\n        IncrementCeilingCrumbleFinishedCount();\n    }",
  },
  "SpriteCB_FallingFossil": {
    callsTo: ["StartSpriteAnim","UpdateDisintegrationEffect"],
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 15,
    bodyC: "if (sFallingFossil->disintegrateIdx >= FOSSIL_DISINTEGRATE_LENGTH)\n    {\n         \n        sprite->callback = SpriteCallbackDummy;\n    }\n    else if (sprite->y >= 96)\n    {\n         \n        u8 i;\n        for (i = 0; i < 2; i++)\n            UpdateDisintegrationEffect(sFallingFossil->frameImageTiles, sFallingFossil->disintegrateRand[sFallingFossil->disintegrateIdx++], 0, 16, 0);\n\n        StartSpriteAnim(sprite, 0);\n    }\n    else\n    {\n         \n        sprite->y++;\n    }",
  },
} as const;
