// AUTO-GENERATED from src/battle_anim_smokescreen.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 0 Task_, 0 CB2_, 2 SpriteCB_

export const SPRITE_CBS = {
  "SpriteCB_SmokescreenImpactMain": {
    callsTo: ["DestroySprite","FreeSpritePaletteByTag","FreeSpriteTilesByTag"],
    spriteTransitions: ["SpriteCallbackDummy"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 9,
    bodyC: "if (sprite->sActiveSprites == 0)\n    {\n        FreeSpriteTilesByTag(sSmokescreenImpactSpriteSheet.tag);\n        FreeSpritePaletteByTag(sSmokescreenImpactSpritePalette.tag);\n        if (!sprite->sPersist)\n            DestroySprite(sprite);\n        else\n            sprite->callback = SpriteCallbackDummy;\n    }",
  },
  "SpriteCB_SmokescreenImpact": {
    callsTo: ["DestroySprite"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 5,
    bodyC: "if (sprite->animEnded)\n    {\n        gSprites[sprite->sMainSpriteId].sActiveSprites--;\n        DestroySprite(sprite);\n    }",
  },
} as const;
