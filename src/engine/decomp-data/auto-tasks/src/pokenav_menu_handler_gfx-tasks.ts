// AUTO-GENERATED from src/pokenav_menu_handler_gfx.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 4 Task_, 0 CB2_, 3 SpriteCB_

export const TASKS = {
  "Task_OptionBlend": {
    callsTo: ["BLDALPHA_BLEND","DestroyTask","GetSubstructPtr","SetGpuReg"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 40,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    if (tBlendDelay == 0)\n    {\n        switch (tBlendState)\n        {\n        case 0:\n            tBlendTarget1 = 16;\n            tBlendTarget2 = 0;\n            SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_EFFECT_NONE | BLDCNT_TGT2_ALL);\n            SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(16, 0));\n            tBlendState++;\n            break;\n        case 1:\n            if (tBlendCounter & 1)\n            {\n                tBlendTarget1 -= 3;\n                if (tBlendTarget1 < 0)\n                    tBlendTarget1 = 0;\n            }\n            else\n            {\n                tBlendTarget2 += 3;\n                if (tBlendTarget2 > 16)\n                    tBlendTarget2 = 16;\n            }\n            SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(tBlendTarget1, tBlendTarget2));\n            tBlendCounter++;\n            if (tBlendCounter == 12)\n            {\n                ((struct Pokenav_MenuGfx *)GetSubstructPtr(POKENAV_SUBSTRUCT_MENU_GFX))->numIconsBlending--;\n                SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(0, 16));\n                DestroyTask(taskId);\n            }\n            break;\n        }\n    }\n    else\n    {\n        tBlendDelay--;\n    }",
  },
  "Task_MoveBgDots": {
    callsTo: ["ChangeBgX"],
    lineCount: 1,
    bodyC: "ChangeBgX(3, 0x80, BG_COORD_ADD);",
  },
  "Task_UpdateBgDotsPalette": {
    callsTo: ["BG_PLTT_ID","DestroyTask","GetWordTaskArg","LoadPalette","PLTT_SIZEOF","PokenavCopyPalette"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 8,
    bodyC: "u16 sp8[2];\n    s16 *data = gTasks[taskId].data;\n    const u16 *pal1 = (const u16 *)GetWordTaskArg(taskId, 1);\n    const u16 *pal2 = (const u16 *)GetWordTaskArg(taskId, 3);\n\n    PokenavCopyPalette(pal1, pal2, 2, 12, ++data[0], sp8);\n    LoadPalette(sp8, BG_PLTT_ID(3) + 1, PLTT_SIZEOF(2));\n    if (data[0] == 12)\n        DestroyTask(taskId);",
  },
  "Task_CurrentMenuOptionGlow": {
    callsTo: ["SetGpuReg"],
    lineCount: 9,
    bodyC: "s16 *data = gTasks[taskId].data;\n    data[0]++;\n    if (data[0] > 0)\n    {\n        data[0] = 0;\n        data[1] += 3;\n        data[1] &= 0x7F;\n        SetGpuReg(REG_OFFSET_BLDY, gSineTable[data[1]] >> 5);\n    }",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_OptionSlide": {
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 11,
    bodyC: "sprite->sSlideTime--;\n    if (sprite->sSlideTime != -1)\n    {\n        sprite->sSlideSpeed += sprite->sSlideAccel;\n        sprite->x = sprite->sSlideSpeed >> 4;\n    }\n    else\n    {\n        sprite->x = sprite->sSlideEndX;\n        sprite->callback = SpriteCallbackDummy;\n    }",
  },
  "SpriteCB_OptionZoom": {
    callsTo: ["CalcCenterToCornerVec","FreeOamMatrix","StartSpriteAffineAnim"],
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 48,
    bodyC: "s32 temp;\n    s32 x;\n    if (sprite->sZoomDelay == 0)\n    {\n        if (!sprite->sZoomSetAffine)\n        {\n            StartSpriteAffineAnim(sprite, 1);\n            sprite->sZoomSetAffine++;\n            sprite->sZoomSpeed = 0x100;\n            sprite->x += sprite->x2;\n            sprite->x2 = 0;\n        }\n        else\n        {\n            sprite->sZoomSpeed += 16;\n            temp = sprite->sZoomSpeed;\n            x = temp >> 3;\n            x = (x - 32) / 2;\n\n             \n            switch (sprite->sZoomSubspriteId)\n            {\n            case 0:\n                sprite->x2 = -x * 3;\n                break;\n            case 1:\n                sprite->x2 = -x;\n                break;\n            case 2:\n                sprite->x2 = x;\n                break;\n            case 3:\n                sprite->x2 = x * 3;\n                break;\n            }\n            if (sprite->affineAnimEnded)\n            {\n                sprite->invisible = TRUE;\n                FreeOamMatrix(sprite->oam.matrixNum);\n                CalcCenterToCornerVec(sprite, sprite->oam.shape, sprite->oam.size, ST_OAM_AFFINE_OFF);\n                sprite->oam.affineMode = ST_OAM_AFFINE_OFF;\n                sprite->oam.objMode = ST_OAM_OBJ_NORMAL;\n                sprite->callback = SpriteCallbackDummy;\n            }\n        }\n    }\n    else\n    {\n        sprite->sZoomDelay--;\n    }",
  },
  "SpriteCB_BlinkingBlueLight": {
    lineCount: 6,
    bodyC: "sprite->data[0]++;\n    if (sprite->data[0] > 8)\n    {\n        sprite->data[0] = 0;\n        sprite->invisible ^= 1;\n    }",
  },
} as const;
