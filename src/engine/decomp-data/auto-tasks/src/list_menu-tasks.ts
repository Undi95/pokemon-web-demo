// AUTO-GENERATED from src/list_menu.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 4 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_ScrollIndicatorArrowPair": {
    lineCount: 10,
    bodyC: "struct ScrollIndicatorPair *data = (void *) gTasks[taskId].data;\n    u16 currItem = (*data->scrollOffset);\n\n    if (currItem == data->fullyUpThreshold && currItem != 0xFFFF)\n        gSprites[data->topSpriteId].invisible = TRUE;\n    else\n        gSprites[data->topSpriteId].invisible = FALSE;\n\n    if (currItem == data->fullyDownThreshold)\n        gSprites[data->bottomSpriteId].invisible = TRUE;\n    else\n        gSprites[data->bottomSpriteId].invisible = FALSE;",
  },
  "Task_ScrollIndicatorArrowPairOnMainMenu": {
    lineCount: 12,
    bodyC: "s16 *data = gTasks[taskId].data;\n    struct ScrollIndicatorPair *scrollData = (void *) data;\n\n    if (tIsScrolled)\n    {\n        gSprites[scrollData->topSpriteId].invisible = FALSE;\n        gSprites[scrollData->bottomSpriteId].invisible = TRUE;\n    }\n    else\n    {\n        gSprites[scrollData->topSpriteId].invisible = TRUE;\n        gSprites[scrollData->bottomSpriteId].invisible = FALSE;\n    }",
  },
  "Task_RedOutlineCursor": {
    lineCount: 0,
    bodyC: "",
  },
  "Task_RedArrowCursor": {
    lineCount: 0,
    bodyC: "",
  },
} as const;
