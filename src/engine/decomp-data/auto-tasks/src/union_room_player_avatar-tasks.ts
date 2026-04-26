// AUTO-GENERATED from src/union_room_player_avatar.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 1 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_AnimateUnionRoomPlayers": {
    callsTo: ["AnimateUnionRoomPlayer"],
    lineCount: 3,
    bodyC: "s32 i;\n    for (i = 0; i < MAX_UNION_ROOM_LEADERS; i++)\n        AnimateUnionRoomPlayer(i, &sUnionObjWork[i]);",
  },
} as const;
