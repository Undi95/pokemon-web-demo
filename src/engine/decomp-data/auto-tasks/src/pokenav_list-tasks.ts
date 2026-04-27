// AUTO-GENERATED from src/pokenav_list.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 0 Task_, 0 CB2_, 3 SpriteCB_

export const SPRITE_CBS = {
  "SpriteCB_RightArrow": {
    callsTo: ["GetSubstructPtr"],
    lineCount: 2,
    bodyC: "struct PokenavList *list = GetSubstructPtr(POKENAV_SUBSTRUCT_LIST);\n    sprite->y2 = list->windowState.selectedIndexOffset << 4;",
  },
  "SpriteCB_DownArrow": {
    callsTo: ["ShouldShowDownArrow"],
    lineCount: 12,
    bodyC: "if (!sprite->sInvisible && ShouldShowDownArrow())\n        sprite->invisible = FALSE;\n    else\n        sprite->invisible = TRUE;\n\n    if (++sprite->sTimer > 3)\n    {\n        s16 offset;\n\n        sprite->sTimer = 0;\n        offset = (sprite->sOffset + 1) & 7;\n        sprite->sOffset = offset;\n        sprite->y2 = offset;\n    }",
  },
  "SpriteCB_UpArrow": {
    callsTo: ["ShouldShowUpArrow"],
    lineCount: 12,
    bodyC: "if (!sprite->sInvisible && ShouldShowUpArrow())\n        sprite->invisible = FALSE;\n    else\n        sprite->invisible = TRUE;\n\n    if (++sprite->sTimer > 3)\n    {\n        s16 offset;\n\n        sprite->sTimer = 0;\n        offset = (sprite->sOffset + 1) & 7;\n        sprite->sOffset = offset;\n        sprite->y2 = -1 * offset;\n    }",
  },
} as const;
