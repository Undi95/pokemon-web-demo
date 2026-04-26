// AUTO-GENERATED from src/field_camera.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/field_camera.c
// Generated: 2026-04-26

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "bool8", name: 'gUnusedBikeCameraAheadPanback', isArray: false, init: "FALSE" },
  { segment: 'COMMON_DATA', type: "struct CameraObject", name: 'gFieldCamera', isArray: false, init: "{0}" },
  { segment: 'COMMON_DATA', type: "u16", name: 'gTotalCameraPixelOffsetY', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u16", name: 'gTotalCameraPixelOffsetX', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'RedrawMapSliceNorth', ret: "void", arity: 2, params: "struct FieldCameraOffset *, const struct MapLayout *" },
  { name: 'RedrawMapSliceSouth', ret: "void", arity: 2, params: "struct FieldCameraOffset *, const struct MapLayout *" },
  { name: 'RedrawMapSliceEast', ret: "void", arity: 2, params: "struct FieldCameraOffset *, const struct MapLayout *" },
  { name: 'RedrawMapSliceWest', ret: "void", arity: 2, params: "struct FieldCameraOffset *, const struct MapLayout *" },
  { name: 'MapPosToBgTilemapOffset', ret: "s32", arity: 3, params: "struct FieldCameraOffset *, s32, s32" },
  { name: 'DrawWholeMapViewInternal', ret: "void", arity: 3, params: "int, int, const struct MapLayout *" },
  { name: 'DrawMetatileAt', ret: "void", arity: 4, params: "const struct MapLayout *, u16, int, int" },
  { name: 'DrawMetatile', ret: "void", arity: 3, params: "s32, const u16 *, u16" },
  { name: 'CameraPanningCB_PanAhead', ret: "void", arity: 0, params: "void" },
  { name: 'ResetCameraOffset', ret: "void", arity: 1, params: "struct FieldCameraOffset *cameraOffset" },
  { name: 'AddCameraTileOffset', ret: "void", arity: 3, params: "struct FieldCameraOffset *cameraOffset, u32 xOffset, u32 yOffset" },
  { name: 'AddCameraPixelOffset', ret: "void", arity: 3, params: "struct FieldCameraOffset *cameraOffset, u32 xOffset, u32 yOffset" },
  { name: 'ResetFieldCamera', ret: "void", arity: 0, params: "void" },
  { name: 'FieldUpdateBgTilemapScroll', ret: "void", arity: 0, params: "void" },
  { name: 'GetCameraOffsetWithPan', ret: "void", arity: 2, params: "s16 *x, s16 *y" },
  { name: 'DrawWholeMapView', ret: "void", arity: 0, params: "void" },
  { name: 'RedrawMapSlicesForCameraUpdate', ret: "void", arity: 3, params: "struct FieldCameraOffset *cameraOffset, int x, int y" },
  { name: 'CurrentMapDrawMetatileAt', ret: "void", arity: 2, params: "int x, int y" },
  { name: 'DrawDoorMetatileAt', ret: "void", arity: 3, params: "int x, int y, u16 *tiles" },
  { name: 'CameraUpdateCallback', ret: "void", arity: 1, params: "struct CameraObject *fieldCamera" },
  { name: 'ResetCameraUpdateInfo', ret: "void", arity: 0, params: "void" },
  { name: 'InitCameraUpdateCallback', ret: "u32", arity: 1, params: "u8 trackedSpriteId" },
  { name: 'CameraUpdate', ret: "void", arity: 0, params: "void" },
  { name: 'MoveCameraAndRedrawMap', ret: "void", arity: 2, params: "int deltaX, int deltaY" },
  { name: 'SetCameraPanning', ret: "void", arity: 2, params: "s16 horizontal, s16 vertical" },
  { name: 'InstallCameraPanAheadCallback', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateCameraPanning', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'berry.h',
  'bike.h',
  'field_camera.h',
  'field_player_avatar.h',
  'fieldmap.h',
  'event_object_movement.h',
  'gpu_regs.h',
  'menu.h',
  'overworld.h',
  'rotating_gate.h',
  'sprite.h',
  'text.h',
] as const;
