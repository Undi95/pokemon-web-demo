// AUTO-GENERATED from src/contest_painting.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 0 Task_, 3 CB2_, 0 SpriteCB_

export const CB2S = {
  "CB2_ContestPainting": {
    callsTo: ["ShowContestPainting"],
    lineCount: 1,
    bodyC: "ShowContestPainting();",
  },
  "CB2_HoldContestPainting": {
    callsTo: ["HoldContestPainting","RunTextPrinters","UpdatePaletteFade"],
    lineCount: 3,
    bodyC: "HoldContestPainting();\n    RunTextPrinters();\n    UpdatePaletteFade();",
  },
  "CB2_QuitContestPainting": {
    callsTo: ["FREE_AND_SET_NULL","Free","FreeMonSpritesGfx","GetBgTilemapBuffer","RemoveWindow","SetMainCallback2"],
    lineCount: 6,
    bodyC: "SetMainCallback2(gMain.savedCallback);\n    FREE_AND_SET_NULL(gContestPaintingMonPalette);\n    FREE_AND_SET_NULL(gContestMonPixels);\n    RemoveWindow(sWindowId);\n    Free(GetBgTilemapBuffer(1));\n    FreeMonSpritesGfx();",
  },
} as const;
