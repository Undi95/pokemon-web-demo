// AUTO-GENERATED from src/battle_controller_link_opponent.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 1 Task_, 0 CB2_, 1 SpriteCB_

export const TASKS = {
  "Task_StartSendOutAnim": {
    callsTo: ["BATTLE_PARTNER","DestroyTask","IsDoubleBattle","StartSendOutAnim"],
    dataReads: ["data[0]"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 19,
    bodyC: "u8 savedActiveBank = gActiveBattler;\n\n    gActiveBattler = gTasks[taskId].data[0];\n    if (!IsDoubleBattle() || (gBattleTypeFlags & BATTLE_TYPE_MULTI))\n    {\n        gBattleBufferA[gActiveBattler][1] = gBattlerPartyIndexes[gActiveBattler];\n        StartSendOutAnim(gActiveBattler, FALSE);\n    }\n    else\n    {\n        gBattleBufferA[gActiveBattler][1] = gBattlerPartyIndexes[gActiveBattler];\n        StartSendOutAnim(gActiveBattler, FALSE);\n        gActiveBattler = BATTLE_PARTNER(gActiveBattler);\n        gBattleBufferA[gActiveBattler][1] = gBattlerPartyIndexes[gActiveBattler];\n        StartSendOutAnim(gActiveBattler, FALSE);\n        gActiveBattler = BATTLE_PARTNER(gActiveBattler);\n    }\n    gBattlerControllerFuncs[gActiveBattler] = Intro_TryShinyAnimShowHealthbox;\n    gActiveBattler = savedActiveBank;\n    DestroyTask(taskId);",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_FreeOpponentSprite": {
    callsTo: ["DestroySprite","FreeSpriteOamMatrix","FreeTrainerFrontPicPalette"],
    terminalMarkers: ["DestroySprite","FreeSpriteOamMatrix"],
    lineCount: 3,
    bodyC: "FreeTrainerFrontPicPalette(sprite->oam.affineParam);\n    FreeSpriteOamMatrix(sprite);\n    DestroySprite(sprite);",
  },
} as const;
