// AUTO-GENERATED from src/battle_tower.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 1 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_StartBattleAfterTransition": {
    callsTo: ["DestroyTask","IsBattleTransitionDone","SetMainCallback2"],
    cb2Transitions: ["CB2_InitBattle"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 6,
    bodyC: "if (IsBattleTransitionDone() == TRUE)\n    {\n        gMain.savedCallback = HandleSpecialTrainerBattleEnd;\n        SetMainCallback2(CB2_InitBattle);\n        DestroyTask(taskId);\n    }",
  },
} as const;
