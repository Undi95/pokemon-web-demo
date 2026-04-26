// AUTO-GENERATED from include/intro_credits_graphics.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/intro_credits_graphics.h
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_INTROCRED_0 = {
  INTROCRED_SCENERY_NORMAL: 0,
  INTROCRED_SCENERY_DESTROY: 1,
  INTROCRED_SCENERY_FROZEN: 2,
} as const;
export const ENUM_SCENE_1 = {
  SCENE_OCEAN_MORNING: 0,
  SCENE_OCEAN_SUNSET: 1,
  SCENE_FOREST_RIVAL_ARRIVE: 2,
  SCENE_FOREST_CATCH_RIVAL: 3,
  SCENE_CITY_NIGHT: 4,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'LoadIntroPart2Graphics', ret: "void", arity: 1, params: "u8 scenery" },
  { name: 'SetIntroPart2BgCnt', ret: "void", arity: 1, params: "u8 scenery" },
  { name: 'LoadCreditsSceneGraphics', ret: "void", arity: 1, params: "u8 scene" },
  { name: 'SetCreditsSceneBgCnt', ret: "void", arity: 1, params: "u8 scene" },
  { name: 'CreateBicycleBgAnimationTask', ret: "u8", arity: 4, params: "u8 mode, u16 bg1Speed, u16 bg2Speed, u16 bg3Speed" },
  { name: 'CycleSceneryPalette', ret: "void", arity: 1, params: "u8 mode" },
  { name: 'CreateIntroBrendanSprite', ret: "u8", arity: 2, params: "s16 x, s16 y" },
  { name: 'CreateIntroMaySprite', ret: "u8", arity: 2, params: "s16 x, s16 y" },
  { name: 'CreateIntroFlygonSprite', ret: "u8", arity: 2, params: "s16 x, s16 y" },
] as const;
