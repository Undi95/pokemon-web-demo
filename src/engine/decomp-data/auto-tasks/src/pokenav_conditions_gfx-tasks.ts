// AUTO-GENERATED from src/pokenav_conditions_gfx.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 0 Task_, 0 CB2_, 1 SpriteCB_

export const SPRITE_CBS = {
  "SpriteCB_PartyPokeball": {
    callsTo: ["GetConditionGraphCurrentListIndex","StartSpriteAnim"],
    lineCount: 4,
    bodyC: "if (sprite->data[0] == GetConditionGraphCurrentListIndex())\n        StartSpriteAnim(sprite, CONDITION_ICON_SELECTED);\n    else\n        StartSpriteAnim(sprite, CONDITION_ICON_UNSELECTED);",
  },
} as const;
