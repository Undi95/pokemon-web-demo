// AUTO-GENERATED from src/battle_anim_flying.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_flying.c
// Generated: 2026-04-26

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const gEllipticalGustSpriteTemplate = { tileTag: "ANIM_TAG_GUST", paletteTag: "ANIM_TAG_GUST", oam: "&gOamData_AffineOff_ObjNormal_32x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimEllipticalGust" } as const;
export const gGustToTargetSpriteTemplate = { tileTag: "ANIM_TAG_GUST", paletteTag: "ANIM_TAG_GUST", oam: "&gOamData_AffineNormal_ObjNormal_32x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_GustToTarget", callback: "AnimGustToTarget" } as const;
export const gAirWaveCrescentSpriteTemplate = { tileTag: "ANIM_TAG_AIR_WAVE_2", paletteTag: "ANIM_TAG_AIR_WAVE_2", oam: "&gOamData_AffineOff_ObjNormal_32x16", anims: "sAffineAnims_AirWaveCrescent", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimAirWaveCrescent" } as const;
export const gFlyBallUpSpriteTemplate = { tileTag: "ANIM_TAG_ROUND_SHADOW", paletteTag: "ANIM_TAG_ROUND_SHADOW", oam: "&gOamData_AffineDouble_ObjNormal_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_FlyBallUp", callback: "AnimFlyBallUp" } as const;
export const gFlyBallAttackSpriteTemplate = { tileTag: "ANIM_TAG_ROUND_SHADOW", paletteTag: "ANIM_TAG_ROUND_SHADOW", oam: "&gOamData_AffineNormal_ObjNormal_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_FlyBallAttack", callback: "AnimFlyBallAttack" } as const;
export const gFallingFeatherSpriteTemplate = { tileTag: "ANIM_TAG_WHITE_FEATHER", paletteTag: "ANIM_TAG_WHITE_FEATHER", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "sAnims_FallingFeather", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimFallingFeather" } as const;
export const sUnusedBubbleThrowSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_BUBBLES", paletteTag: "ANIM_TAG_SMALL_BUBBLES", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimUnusedBubbleThrow" } as const;
export const gWhirlwindLineSpriteTemplate = { tileTag: "ANIM_TAG_WHIRLWIND_LINES", paletteTag: "ANIM_TAG_WHIRLWIND_LINES", oam: "&gOamData_AffineOff_ObjNormal_32x16", anims: "sAnims_WhirlwindLines", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimWhirlwindLine" } as const;
export const gBounceBallShrinkSpriteTemplate = { tileTag: "ANIM_TAG_ROUND_SHADOW", paletteTag: "ANIM_TAG_ROUND_SHADOW", oam: "&gOamData_AffineDouble_ObjNormal_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_BounceBallShrink", callback: "AnimBounceBallShrink" } as const;
export const gBounceBallLandSpriteTemplate = { tileTag: "ANIM_TAG_ROUND_SHADOW", paletteTag: "ANIM_TAG_ROUND_SHADOW", oam: "&gOamData_AffineDouble_ObjNormal_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_BounceBallLand", callback: "AnimBounceBallLand" } as const;
export const gDiveBallSpriteTemplate = { tileTag: "ANIM_TAG_ROUND_SHADOW", paletteTag: "ANIM_TAG_ROUND_SHADOW", oam: "&gOamData_AffineDouble_ObjNormal_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_DiveBall", callback: "AnimDiveBall" } as const;
export const gDiveWaterSplashSpriteTemplate = { tileTag: "ANIM_TAG_SPLASH", paletteTag: "ANIM_TAG_SPLASH", oam: "&gOamData_AffineDouble_ObjNormal_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimDiveWaterSplash" } as const;
export const gSprayWaterDropletSpriteTemplate = { tileTag: "ANIM_TAG_SWEAT_BEAD", paletteTag: "ANIM_TAG_SWEAT_BEAD", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSprayWaterDroplet" } as const;
export const sUnusedFlashingLightSpriteTemplate = { tileTag: "ANIM_TAG_CIRCLE_OF_LIGHT", paletteTag: "ANIM_TAG_CIRCLE_OF_LIGHT", oam: "&gOamData_AffineOff_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimUnusedFlashingLight" } as const;
export const gSkyAttackBirdSpriteTemplate = { tileTag: "ANIM_TAG_BIRD", paletteTag: "ANIM_TAG_BIRD", oam: "&gOamData_AffineDouble_ObjNormal_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSkyAttackBird" } as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AnimEllipticalGust', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimEllipticalGust_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimGustToTarget', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimGustToTarget_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimAirWaveCrescent', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFlyBallUp', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFlyBallUp_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFlyBallAttack', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFlyBallAttack_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFallingFeather', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFallingFeather_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWhirlwindLine_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimUnusedBubbleThrow', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWhirlwindLine', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBounceBallShrink', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBounceBallLand', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimDiveBall', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimDiveBall_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimDiveBall_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimDiveWaterSplash', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSprayWaterDroplet', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSprayWaterDroplet_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimUnusedFlashingLight', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimUnusedFlashingLight_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSkyAttackBird', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSkyAttackBird_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_AnimateGustTornadoPalette_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_AnimateGustTornadoPalette', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DestroyAnimSpriteAfterTimer', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'InitSpritePosToAnimTarget', ret: "else", arity: 2, params: "sprite, FALSE" },
  { name: 'AnimTask_DrillPeckHitSplats', ret: "void", arity: 1, params: "u8 task" },
  { name: 'AnimTask_SetAttackerVisibility', ret: "UNUSED", arity: 1, params: "u8 taskId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_anim.h',
  'palette.h',
  'trig.h',
  'constants/battle_anim.h',
  'constants/rgb.h',
  'random.h',
] as const;
