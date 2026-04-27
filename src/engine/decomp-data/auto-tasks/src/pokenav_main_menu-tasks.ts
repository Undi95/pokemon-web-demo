// AUTO-GENERATED from src/pokenav_main_menu.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 0 Task_, 0 CB2_, 2 SpriteCB_

export const SPRITE_CBS = {
  "SpriteCB_SpinningPokenav": {
    callsTo: ["GetBgY"],
    lineCount: 1,
    bodyC: "sprite->y2 = (GetBgY(0) / 256u) * -1;",
  },
  "SpriteCB_MoveLeftHeader": {
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 15,
    bodyC: "if (sprite->data[2] != 0)\n    {\n        sprite->data[2]--;\n        sprite->data[0] += sprite->data[1];\n        sprite->x = sprite->data[0] >> 4;\n        if (sprite->x < -16 || sprite->x > 256)\n            sprite->invisible = TRUE;\n        else\n            sprite->invisible = FALSE;\n    }\n    else\n    {\n        sprite->x = sprite->data[7];\n        sprite->callback = SpriteCallbackDummy;\n    }",
  },
} as const;
