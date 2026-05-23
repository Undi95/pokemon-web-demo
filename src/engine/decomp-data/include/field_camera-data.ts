// AUTO-GENERATED from include/field_camera.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/field_camera.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'DrawWholeMapView', ret: "void", arity: 0, params: "void" },
  { name: 'CurrentMapDrawMetatileAt', ret: "void", arity: 2, params: "int x, int y" },
  { name: 'GetCameraOffsetWithPan', ret: "void", arity: 2, params: "s16 *x, s16 *y" },
  { name: 'DrawDoorMetatileAt', ret: "void", arity: 3, params: "int x, int y, u16 *tiles" },
  { name: 'ResetFieldCamera', ret: "void", arity: 0, params: "void" },
  { name: 'ResetCameraUpdateInfo', ret: "void", arity: 0, params: "void" },
  { name: 'InitCameraUpdateCallback', ret: "u32", arity: 1, params: "u8 trackedSpriteId" },
  { name: 'CameraUpdate', ret: "void", arity: 0, params: "void" },
  { name: 'SetCameraPanning', ret: "void", arity: 2, params: "s16 horizontal, s16 vertical" },
  { name: 'InstallCameraPanAheadCallback', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateCameraPanning', ret: "void", arity: 0, params: "void" },
  { name: 'FieldUpdateBgTilemapScroll', ret: "void", arity: 0, params: "void" },
] as const;
