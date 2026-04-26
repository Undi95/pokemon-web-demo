// AUTO-GENERATED from src/battle_transition_frontier.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 8 Task_, 0 CB2_, 2 SpriteCB_

export const TASKS = {
  "Task_FrontierCirclesMeet": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sFrontierCirclesMeet_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_FrontierCirclesCross": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sFrontierCirclesCross_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_FrontierCirclesAsymmetricSpiral": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sFrontierCirclesAsymmetricSpiral_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_FrontierCirclesSymmetricSpiral": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sFrontierCirclesSymmetricSpiral_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_FrontierCirclesMeetInSeq": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sFrontierCirclesMeetInSeq_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_FrontierCirclesCrossInSeq": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sFrontierCirclesCrossInSeq_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_FrontierCirclesAsymmetricSpiralInSeq": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sFrontierCirclesAsymmetricSpiralInSeq_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
  "Task_FrontierCirclesSymmetricSpiralInSeq": {
    dataReads: ["tState"],
    lineCount: 1,
    bodyC: "while (sFrontierCirclesSymmetricSpiralInSeq_Funcs[gTasks[taskId].tState](&gTasks[taskId]));",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_LogoCircleSlide": {
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 26,
    bodyC: "s16 *data = sprite->data;\n\n    if (sprite->x == sTargetX && sprite->y == sTargetY)\n    {\n        sprite->callback = SpriteCallbackDummy;\n    }\n    else\n    {\n        if (sTimerX == sDelayX)\n        {\n            sprite->x += sSpeedX;\n            sTimerX = 0;\n        }\n        else\n        {\n            sTimerX++;\n        }\n\n        if (sTimerY == sDelayY)\n        {\n            sprite->y += sSpeedY;\n            sTimerY = 0;\n        }\n        else\n        {\n            sTimerY++;\n        }\n    }",
  },
  "SpriteCB_LogoCircleSpiral": {
    callsTo: ["Cos2","Sin2"],
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 7,
    bodyC: "sprite->x2 = (Sin2(sprite->sAngle) * sprite->sRadius) >> 12;  \n    sprite->y2 = (Cos2(sprite->sAngle) * sprite->sRadius) >> 12;  \n\n    sprite->sAngle = (sprite->sAngle + sprite->sRotateSpeed) % 360;\n\n    if (sprite->sRadius != sprite->sTargetRadius)\n        sprite->sRadius += sprite->sRadiusDelta;\n    else\n        sprite->callback = SpriteCallbackDummy;",
  },
} as const;
