// AUTO-GENERATED from src/recorded_battle.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 1 Task_, 2 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_StartAfterCountdown": {
    callsTo: ["DestroyTask","SetMainCallback2"],
    cb2Transitions: ["CB2_InitBattle"],
    dataWrites: ["tFramesToWait"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 6,
    bodyC: "if (--gTasks[taskId].tFramesToWait == 0)\n    {\n        gMain.savedCallback = CB2_RecordedBattleEnd;\n        SetMainCallback2(CB2_InitBattle);\n        DestroyTask(taskId);\n    }",
  },
} as const;

export const CB2S = {
  "CB2_RecordedBattleEnd": {
    callsTo: ["RecordedBattle_RestoreSavedParties","SetMainCallback2"],
    cb2Transitions: ["sCallback2_AfterRecordedBattle"],
    lineCount: 8,
    bodyC: "gSaveBlock2Ptr->frontier.lvlMode = sLvlMode;\n    gBattleOutcome = 0;\n    gBattleTypeFlags = 0;\n    gTrainerBattleOpponent_A = 0;\n    gTrainerBattleOpponent_B = 0;\n    gPartnerTrainerId = 0;\n\n    RecordedBattle_RestoreSavedParties();\n    SetMainCallback2(sCallback2_AfterRecordedBattle);",
  },
  "CB2_RecordedBattle": {
    callsTo: ["AnimateSprites","BuildOamBuffer","RunTasks"],
    externalChecks: { waitForVBlank: true },
    lineCount: 3,
    bodyC: "AnimateSprites();\n    BuildOamBuffer();\n    RunTasks();",
  },
} as const;
