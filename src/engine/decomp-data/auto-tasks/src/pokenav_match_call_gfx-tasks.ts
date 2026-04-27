// AUTO-GENERATED from src/pokenav_match_call_gfx.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 1 Task_, 0 CB2_, 3 SpriteCB_

export const TASKS = {
  "Task_FlashPokeballIcons": {
    callsTo: ["BG_PLTT_ID","CpuCopy32","PokenavCopyPalette"],
    externalChecks: { paletteFade: true },
    lineCount: 10,
    bodyC: "s16 *data = gTasks[taskId].data;\n    if (tActive)\n    {\n        tSinIdx += 4;\n        tSinIdx &= 0x7F;\n        tSinVal = gSineTable[tSinIdx] >> 4;\n        PokenavCopyPalette(sPokeball_Pal, &sPokeball_Pal[0x10], 0x10, 0x10, tSinVal, &gPlttBufferUnfaded[BG_PLTT_ID(5)]);\n        if (!gPaletteFade.active)\n            CpuCopy32(&gPlttBufferUnfaded[BG_PLTT_ID(5)], &gPlttBufferFaded[BG_PLTT_ID(5)], PLTT_SIZE_4BPP);\n    }",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_OptionsCursor": {
    lineCount: 5,
    bodyC: "if (++sprite->data[0] > 3)\n    {\n        sprite->data[0] = 0;\n        sprite->x2 = (sprite->x2 + 1) & 7;\n    }",
  },
  "SpriteCB_TrainerPicSlideOnscreen": {
    callsTo: ["CheckForSpaceForDma3Request"],
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 19,
    bodyC: "switch (sprite->data[0])\n    {\n    case 0:\n        if (CheckForSpaceForDma3Request(sprite->data[7]) != -1)\n        {\n            sprite->x2 = -80;\n            sprite->invisible = FALSE;\n            sprite->data[0]++;\n        }\n        break;\n    case 1:\n        sprite->x2 += 8;\n        if (sprite->x2 >= 0)\n        {\n            sprite->x2 = 0;\n            sprite->callback = SpriteCallbackDummy;\n        }\n        break;\n    }",
  },
  "SpriteCB_TrainerPicSlideOffscreen": {
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 6,
    bodyC: "sprite->x2 -= 8;\n    if (sprite->x2 <= -80)\n    {\n        sprite->invisible = TRUE;\n        sprite->callback = SpriteCallbackDummy;\n    }",
  },
} as const;
