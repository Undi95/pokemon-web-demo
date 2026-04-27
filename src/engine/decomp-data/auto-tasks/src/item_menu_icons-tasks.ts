// AUTO-GENERATED from src/item_menu_icons.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 0 Task_, 0 CB2_, 4 SpriteCB_

export const SPRITE_CBS = {
  "SpriteCB_BagVisualSwitchingPockets": {
    callsTo: ["StartSpriteAnim"],
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 9,
    bodyC: "if (sprite->y2 != 0)\n    {\n        sprite->y2++;\n    }\n    else\n    {\n        StartSpriteAnim(sprite, sprite->sPocketId);\n        sprite->callback = SpriteCallbackDummy;\n    }",
  },
  "SpriteCB_ShakeBagSprite": {
    callsTo: ["StartSpriteAffineAnim"],
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 5,
    bodyC: "if (sprite->affineAnimEnded)\n    {\n        StartSpriteAffineAnim(sprite, ANIM_BAG_NORMAL);\n        sprite->callback = SpriteCallbackDummy;\n    }",
  },
  "SpriteCB_SwitchPocketRotatingBallInit": {
    callsTo: ["InitSpriteAffineAnim","UpdateSwitchPocketRotatingBallCoords"],
    spriteTransitions: ["SpriteCB_SwitchPocketRotatingBallContinue"],
    lineCount: 10,
    bodyC: "sprite->oam.affineMode = ST_OAM_AFFINE_NORMAL;\n    if (sprite->data[0] == -1)\n        sprite->affineAnims = sRotatingBallAnimCmds;\n    else\n        sprite->affineAnims = sRotatingBallAnimCmds_FullRotation;\n\n    InitSpriteAffineAnim(sprite);\n    sprite->data[1] = sprite->centerToCornerVecX;\n    sprite->data[1] = sprite->centerToCornerVecY;\n    UpdateSwitchPocketRotatingBallCoords(sprite);\n    sprite->callback = SpriteCB_SwitchPocketRotatingBallContinue;",
  },
  "SpriteCB_SwitchPocketRotatingBallContinue": {
    callsTo: ["RemoveBagSprite","UpdateSwitchPocketRotatingBallCoords"],
    lineCount: 4,
    bodyC: "sprite->data[3]++;\n    UpdateSwitchPocketRotatingBallCoords(sprite);\n    if (sprite->data[3] == 16)\n        RemoveBagSprite(ITEMMENUSPRITE_BALL);",
  },
} as const;
