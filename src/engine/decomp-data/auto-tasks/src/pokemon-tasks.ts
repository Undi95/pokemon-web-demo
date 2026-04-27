// AUTO-GENERATED from src/pokemon.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 3 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_PlayMapChosenOrBattleBGM": {
    callsTo: ["DestroyTask","GetBattleBGM","PlayNewMapMusic"],
    dataReads: ["tSongId"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 5,
    bodyC: "if (gTasks[taskId].tSongId)\n        PlayNewMapMusic(gTasks[taskId].tSongId);\n    else\n        PlayNewMapMusic(GetBattleBGM());\n    DestroyTask(taskId);",
  },
  "Task_AnimateAfterDelay": {
    callsTo: ["DestroyTask","LaunchAnimationTaskForFrontSprite","READ_PTR_FROM_TASK"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 5,
    bodyC: "if (--gTasks[taskId].sAnimDelay == 0)\n    {\n        LaunchAnimationTaskForFrontSprite(READ_PTR_FROM_TASK(taskId, 0), gTasks[taskId].sAnimId);\n        DestroyTask(taskId);\n    }",
  },
  "Task_PokemonSummaryAnimateAfterDelay": {
    callsTo: ["DestroyTask","READ_PTR_FROM_TASK","StartMonSummaryAnimation","SummaryScreen_SetAnimDelayTaskId"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 6,
    bodyC: "if (--gTasks[taskId].sAnimDelay == 0)\n    {\n        StartMonSummaryAnimation(READ_PTR_FROM_TASK(taskId, 0), gTasks[taskId].sAnimId);\n        SummaryScreen_SetAnimDelayTaskId(TASK_NONE);\n        DestroyTask(taskId);\n    }",
  },
} as const;
