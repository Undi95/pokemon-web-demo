// AUTO-GENERATED from src/mon_markings.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 0 Task_, 0 CB2_, 3 SpriteCB_

export const SPRITE_CBS = {
  "SpriteCB_Dummy": {
    lineCount: 0,
    bodyC: "",
  },
  "SpriteCB_Marking": {
    callsTo: ["StartSpriteAnim"],
    lineCount: 4,
    bodyC: "if (sMenu->markingsArray[sprite->sMarkingId])\n        StartSpriteAnim(sprite, 2 * sprite->sMarkingId + 1);  \n    else\n        StartSpriteAnim(sprite, 2 * sprite->sMarkingId);",
  },
  "SpriteCB_Cursor": {
    lineCount: 1,
    bodyC: "sprite->y = (16 * sMenu->cursorPos) + sprite->sCursorYOffset;",
  },
} as const;
