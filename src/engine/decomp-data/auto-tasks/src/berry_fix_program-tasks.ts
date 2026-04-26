// AUTO-GENERATED from src/berry_fix_program.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 0 Task_, 1 CB2_, 0 SpriteCB_

export const CB2S = {
  "CB2_InitBerryFixProgram": {
    callsTo: ["AllocZeroed","DisableInterrupts","EnableInterrupts","ResetSpriteData","ResetTasks","ScanlineEffect_Stop","SetGpuReg","SetMainCallback2","SetVBlankCallback","m4aSoundVSyncOff"],
    cb2Transitions: ["BerryFix_Main"],
    lineCount: 12,
    bodyC: "DisableInterrupts(0xFFFF);  \n    EnableInterrupts(INTR_FLAG_VBLANK);\n    m4aSoundVSyncOff();\n    SetVBlankCallback(NULL);\n    ResetSpriteData();\n    ResetTasks();\n    ScanlineEffect_Stop();\n    SetGpuReg(REG_OFFSET_DISPCNT, 0);\n    sBerryFix = AllocZeroed(sizeof(*sBerryFix));\n    sBerryFix->state = MAINSTATE_INIT;\n    sBerryFix->curScene = SCENE_NONE;\n    SetMainCallback2(BerryFix_Main);",
  },
} as const;
