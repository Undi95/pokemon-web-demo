// AUTO-GENERATED from src/field_effect_helpers.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 0 Task_, 0 CB2_, 1 SpriteCB_

export const SPRITE_CBS = {
  "SpriteCB_UnderwaterSurfBlob": {
    lineCount: 5,
    bodyC: "struct Sprite *blobSprite = &gSprites[sprite->sSpriteId];\n\n     \n    if (((sprite->sTimer++) & 3) == 0)\n        blobSprite->y2 += sprite->sBobY;\n     \n    if ((sprite->sTimer & 15) == 0)\n        sprite->sBobY = -sprite->sBobY;",
  },
} as const;
