// AUTO-GENERATED from src/pokenav_ribbons_summary.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 0 Task_, 0 CB2_, 2 SpriteCB_

export const SPRITE_CBS = {
  "SpriteCB_MonSpriteSlide": {
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 15,
    bodyC: "if (sprite->sTime != 0)\n    {\n        sprite->sTime--;\n        sprite->sCurrX += sprite->sMoveIncr;\n        sprite->x = sprite->sCurrX >> 4;\n        if (sprite->x <= MON_SPRITE_X_OFF)\n            sprite->invisible = TRUE;\n        else\n            sprite->invisible = FALSE;\n    }\n    else\n    {\n        sprite->x = sprite->sDestX;\n        sprite->callback = SpriteCallbackDummy;\n    }",
  },
  "SpriteCB_WaitForRibbonAnimation": {
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 5,
    bodyC: "if (sprite->affineAnimEnded)\n    {\n        sprite->invisible = sprite->sInvisibleWhenDone;\n        sprite->callback = SpriteCallbackDummy;\n    }",
  },
} as const;
