// AUTO-GENERATED from src/event_object_movement.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 0 Task_, 0 CB2_, 2 SpriteCB_

export const SPRITE_CBS = {
  "SpriteCB_CameraObject": {
    callsTo: ["ARRAY_COUNT","memcpy"],
    lineCount: 3,
    bodyC: "void (*callbacks[ARRAY_COUNT(sCameraObjectFuncs)])(struct Sprite *);\n\n    memcpy(callbacks, sCameraObjectFuncs, sizeof sCameraObjectFuncs);\n    callbacks[sprite->sCamera_State](sprite);",
  },
  "SpriteCB_VirtualObject": {
    callsTo: ["SetObjectSubpriorityByElevation","UpdateObjectEventSpriteInvisibility","VirtualObject_UpdateAnim"],
    lineCount: 3,
    bodyC: "VirtualObject_UpdateAnim(sprite);\n    SetObjectSubpriorityByElevation(sprite->sVirtualObjElev, sprite, 1);\n    UpdateObjectEventSpriteInvisibility(sprite, sprite->sInvisible);",
  },
} as const;
