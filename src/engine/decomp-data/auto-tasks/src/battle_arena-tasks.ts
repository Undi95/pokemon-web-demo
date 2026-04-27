// AUTO-GENERATED from src/battle_arena.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 0 Task_, 0 CB2_, 1 SpriteCB_

export const SPRITE_CBS = {
  "SpriteCB_JudgmentIcon": {
    callsTo: ["DestroySprite"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 2,
    bodyC: "if (gBattleCommunication[0] > JUDGMENT_STATE_FINISHED)\n        DestroySprite(sprite);",
  },
} as const;
