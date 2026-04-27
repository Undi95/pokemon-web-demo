// AUTO-GENERATED from src/battle_script_commands.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 0 Task_, 0 CB2_, 1 SpriteCB_

export const SPRITE_CBS = {
  "SpriteCB_MonIconOnLvlUpBanner": {
    callsTo: ["DestroySprite","FreeSpritePaletteByTag","FreeSpriteTilesByTag"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 11,
    bodyC: "sprite->x2 = sprite->sXOffset - gBattle_BG2_X;\n\n    if (sprite->x2 != 0)\n    {\n        sprite->sDestroy = TRUE;\n    }\n    else if (sprite->sDestroy)\n    {\n        DestroySprite(sprite);\n        FreeSpriteTilesByTag(TAG_LVLUP_BANNER_MON_ICON);\n        FreeSpritePaletteByTag(TAG_LVLUP_BANNER_MON_ICON);\n    }",
  },
} as const;
