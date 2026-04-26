// AUTO-GENERATED from src/player_pc.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 1 Task_, 1 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_ItemStorage_Deposit": {
    callsTo: ["CB2_GoToItemDepositMenu","CleanupOverworldWindowsAndTilemaps","DestroyTask"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 6,
    bodyC: "if (!gPaletteFade.active)\n    {\n        CleanupOverworldWindowsAndTilemaps();\n        CB2_GoToItemDepositMenu();\n        DestroyTask(taskId);\n    }",
  },
} as const;

export const CB2S = {
  "CB2_PlayerPCExitBagMenu": {
    callsTo: ["SetMainCallback2"],
    cb2Transitions: ["CB2_ReturnToField"],
    lineCount: 2,
    bodyC: "gFieldCallback = ItemStorage_ReshowAfterBagMenu;\n    SetMainCallback2(CB2_ReturnToField);",
  },
} as const;
