// AUTO-GENERATED from src/menu_specialized.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 0 Task_, 0 CB2_, 3 SpriteCB_

export const SPRITE_CBS = {
  "SpriteCB_ConditionSparkle_DoNextAfterDelay": {
    callsTo: ["SetNextConditionSparkle"],
    lineCount: 5,
    bodyC: "if (++sprite->sDelayTimer > 60)\n    {\n        sprite->sDelayTimer = 0;\n        SetNextConditionSparkle(sprite);\n    }",
  },
  "SpriteCB_ConditionSparkle_WaitForAllAnim": {
    spriteTransitions: ["SpriteCB_ConditionSparkle_DoNextAfterDelay"],
    lineCount: 5,
    bodyC: "if (sprite->animEnded)\n    {\n        sprite->sDelayTimer = 0;\n        sprite->callback = SpriteCB_ConditionSparkle_DoNextAfterDelay;\n    }",
  },
  "SpriteCB_ConditionSparkle": {
    callsTo: ["SeekSpriteAnim","SetConditionSparklePosition","ShowAllConditionSparkles"],
    spriteTransitions: ["SpriteCB_ConditionSparkle_DoNextAfterDelay","SpriteCB_ConditionSparkle_WaitForAllAnim","SpriteCallbackDummy"],
    lineCount: 28,
    bodyC: "if (sprite->sDelayTimer != 0)\n    {\n        if (--sprite->sDelayTimer != 0)\n            return;\n\n        SeekSpriteAnim(sprite, 0);\n        sprite->invisible = FALSE;\n    }\n\n    SetConditionSparklePosition(sprite);\n\n     \n    if (sprite->animEnded)\n    {\n        sprite->invisible = TRUE;\n        if (sprite->sCurSparkleId == sprite->sNumExtraSparkles)\n        {\n            if (sprite->sCurSparkleId == MAX_CONDITION_SPARKLES - 1)\n            {\n                ShowAllConditionSparkles(sprite);\n                sprite->callback = SpriteCB_ConditionSparkle_WaitForAllAnim;\n            }\n            else\n            {\n                sprite->callback = SpriteCB_ConditionSparkle_DoNextAfterDelay;\n            }\n        }\n        else\n        {\n            sprite->callback = SpriteCallbackDummy;\n        }\n    }",
  },
} as const;
