// AUTO-GENERATED from src/pokemon_animation.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 1 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_HandleMonAnimation": {
    callsTo: ["ANIM_SPRITE","ARRAY_COUNT","DestroyTask"],
    spriteTransitions: ["sMonAnimFunctions"],
    dataReads: ["tAnimId","tBattlerId","tSpeciesId","tState"],
    dataWrites: ["tBattlerId","tSpeciesId","tState"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 21,
    bodyC: "u32 i;\n    struct Sprite *sprite = ANIM_SPRITE(taskId);\n\n    if (gTasks[taskId].tState == 0)\n    {\n        gTasks[taskId].tBattlerId = sprite->data[0];\n        gTasks[taskId].tSpeciesId = sprite->data[2];\n        sprite->sDontFlip = TRUE;\n        sprite->data[0] = 0;\n\n        for (i = 2; i < ARRAY_COUNT(sprite->data); i++)\n            sprite->data[i] = 0;\n\n        sprite->callback = sMonAnimFunctions[gTasks[taskId].tAnimId];\n        sIsSummaryAnim = FALSE;\n\n        gTasks[taskId].tState++;\n    }\n    if (sprite->callback == SpriteCallbackDummy)\n    {\n        sprite->data[0] = gTasks[taskId].tBattlerId;\n        sprite->data[2] = gTasks[taskId].tSpeciesId;\n        sprite->data[1] = 0;\n\n        DestroyTask(taskId);\n    }",
  },
} as const;
