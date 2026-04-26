// AUTO-GENERATED from src/battle_anim_status_effects.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_status_effects.c
// Generated: 2026-04-26

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sFlickeringOrbSpriteTemplate = { tileTag: "ANIM_TAG_ORB", paletteTag: "ANIM_TAG_ORB", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "sAnims_FlickeringOrb", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimTranslateLinearAndFlicker" } as const;
export const sFlickeringOrbFlippedSpriteTemplate = { tileTag: "ANIM_TAG_ORB", paletteTag: "ANIM_TAG_ORB", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "sAnims_FlickeringOrb", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimTranslateLinearAndFlicker_Flipped" } as const;
export const gWeatherBallUpSpriteTemplate = { tileTag: "ANIM_TAG_WEATHER_BALL", paletteTag: "ANIM_TAG_WEATHER_BALL", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_WeatherBallNormal", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimWeatherBallUp" } as const;
export const gWeatherBallNormalDownSpriteTemplate = { tileTag: "ANIM_TAG_WEATHER_BALL", paletteTag: "ANIM_TAG_WEATHER_BALL", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_WeatherBallNormal", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimWeatherBallDown" } as const;
export const gSpinningSparkleSpriteTemplate = { tileTag: "ANIM_TAG_SPARKLE_4", paletteTag: "ANIM_TAG_SPARKLE_4", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_SpinningSparkle", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSpinningSparkle" } as const;
export const sFlickeringFootSpriteTemplate = { tileTag: "ANIM_TAG_MONSTER_FOOT", paletteTag: "ANIM_TAG_MONSTER_FOOT", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimTranslateLinearAndFlicker" } as const;
export const sFlickeringImpactSpriteTemplate = { tileTag: "ANIM_TAG_IMPACT", paletteTag: "ANIM_TAG_IMPACT", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_FlickeringImpact", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimTranslateLinearAndFlicker" } as const;
export const sFlickeringShrinkOrbSpriteTemplate = { tileTag: "ANIM_TAG_ORB", paletteTag: "ANIM_TAG_ORB", oam: "&gOamData_AffineDouble_ObjNormal_16x16", anims: "sAnims_FlickeringShrinkOrb", images: 0, affineAnims: "sAffineAnims_FlickeringShrinkOrb", callback: "AnimTranslateLinearAndFlicker_Flipped" } as const;
export const sFrozenIceCubeSpriteTemplate = { tileTag: "ANIM_TAG_ICE_CUBE", paletteTag: "ANIM_TAG_ICE_CUBE", oam: "&gOamData_AffineOff_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sFlashingCircleImpactSpriteTemplate = { tileTag: "ANIM_TAG_CIRCLE_IMPACT", paletteTag: "ANIM_TAG_CIRCLE_IMPACT", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimFlashingCircleImpact" } as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_UpdateFlashingCircleImpacts', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_FrozenIceCube_Step1', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_FrozenIceCube_Step2', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_FrozenIceCube_Step3', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_FrozenIceCube_Step4', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_DoStatusAnimation', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimFlashingCircleImpact', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimFlashingCircleImpact_Step', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'Task_FlashingCircleImpacts', ret: "UNUSED", arity: 2, params: "u8 battler, bool8 red" },
  { name: 'DestroySprite', ret: "else", arity: 1, params: "sprite" },
  { name: 'AnimTask_FrozenIceCube', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_StatsChange', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'LaunchStatusAnimation', ret: "void", arity: 2, params: "u8 battler, u8 statusAnimId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_DoStatusAnimation',
  'Task_UpdateFlashingCircleImpacts',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_anim.h',
  'decompress.h',
  'gpu_regs.h',
  'palette.h',
  'sprite.h',
  'task.h',
  'trig.h',
  'util.h',
  'constants/battle_anim.h',
  'constants/rgb.h',
] as const;
