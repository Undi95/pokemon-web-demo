// AUTO-GENERATED from src/match_call.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 1 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_SpinPokenavIcon": {
    callsTo: ["CopyBgTilemapBufferToVram","WriteSequenceToBgTilemapBuffer"],
    lineCount: 10,
    bodyC: "s16 *data = gTasks[taskId].data;\n    if (++tTimer > 8)\n    {\n        tTimer = 0;\n        if (++tSpinStage > 7)\n            tSpinStage = 0;\n\n        tTileNum = (tSpinStage * 16) + TILE_POKENAV_ICON;\n        WriteSequenceToBgTilemapBuffer(0, tTileNum | ~0xFFF, 1, 15, 4, 4, 17, 1);\n        CopyBgTilemapBufferToVram(0);\n    }",
  },
} as const;
