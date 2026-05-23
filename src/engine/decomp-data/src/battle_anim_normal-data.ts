// AUTO-GENERATED from src/battle_anim_normal.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_normal.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const sTimer_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sDelay_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sNumBlends_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sColor1_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sBlendY1_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sColor2_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const sBlendY2_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const sPaletteSelector_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const tPalSelector_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const tPalTag_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tDelay_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tNumBlends_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tInitialBlendY_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tTargetBlendY_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tBlendColor_EXPR = "data[5]";
/** Raw expr: `data[8]` */
export const tRestoreBlend_EXPR = "data[8]";
/** Raw expr: `data[9]` */
export const tPalSelectorHi_EXPR = "data[9]";
/** Raw expr: `data[10]` */
export const tPalSelectorLo_EXPR = "data[10]";
/** Raw expr: `data[0]` */
export const tTimer_EXPR = "data[0]";
/** Raw expr: `data[3]` */
export const tColor1_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tBlendY1_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tColor2_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tBlendY2_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tAnimTag_EXPR = "data[7]";
/** Raw expr: `data[1]` */
export const tLength_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tFlagsScenery_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tFlagsAttacker_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tFlagsTarget_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tColorR_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tColorG_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tColorB_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const sShakeVelocity_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sShakeTimer_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sShakeDuration_EXPR = "data[2]";
/** Raw expr: `data[4]` */
export const sOriginalValue_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sType_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const sShakePtrLo_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const sShakePtrHi_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const tXOffset_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tYOffset_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tNumShakes_EXPR = "data[2]";
/** Raw expr: `data[8]` */
export const tShakeDelay_EXPR = "data[8]";

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const gConfusionDuckSpriteTemplate = { tileTag: "ANIM_TAG_DUCK", paletteTag: "ANIM_TAG_DUCK", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "sAnims_ConfusionDuck", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimConfusionDuck" } as const;
export const gSimplePaletteBlendSpriteTemplate = { tileTag: 0, paletteTag: 0, oam: "&gDummyOamData", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSimplePaletteBlend" } as const;
export const gComplexPaletteBlendSpriteTemplate = { tileTag: 0, paletteTag: 0, oam: "&gDummyOamData", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimComplexPaletteBlend" } as const;
export const sCirclingSparkleSpriteTemplate = { tileTag: "ANIM_TAG_SPARKLE_4", paletteTag: "ANIM_TAG_SPARKLE_4", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_CirclingSparkle", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimCirclingSparkle" } as const;
export const gShakeMonOrPlatformSpriteTemplate = { tileTag: 0, paletteTag: 0, oam: "&gDummyOamData", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimShakeMonOrBattlePlatforms" } as const;
export const gBasicHitSplatSpriteTemplate = { tileTag: "ANIM_TAG_IMPACT", paletteTag: "ANIM_TAG_IMPACT", oam: "&gOamData_AffineNormal_ObjBlend_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_HitSplat", callback: "AnimHitSplatBasic" } as const;
export const gHandleInvertHitSplatSpriteTemplate = { tileTag: "ANIM_TAG_IMPACT", paletteTag: "ANIM_TAG_IMPACT", oam: "&gOamData_AffineNormal_ObjBlend_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_HitSplat", callback: "AnimHitSplatHandleInvert" } as const;
export const gWaterHitSplatSpriteTemplate = { tileTag: "ANIM_TAG_WATER_IMPACT", paletteTag: "ANIM_TAG_WATER_IMPACT", oam: "&gOamData_AffineNormal_ObjBlend_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_HitSplat", callback: "AnimHitSplatBasic" } as const;
export const gRandomPosHitSplatSpriteTemplate = { tileTag: "ANIM_TAG_IMPACT", paletteTag: "ANIM_TAG_IMPACT", oam: "&gOamData_AffineNormal_ObjBlend_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_HitSplat", callback: "AnimHitSplatRandom" } as const;
export const gMonEdgeHitSplatSpriteTemplate = { tileTag: "ANIM_TAG_IMPACT", paletteTag: "ANIM_TAG_IMPACT", oam: "&gOamData_AffineNormal_ObjBlend_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_HitSplat", callback: "AnimHitSplatOnMonEdge" } as const;
export const gCrossImpactSpriteTemplate = { tileTag: "ANIM_TAG_CROSS_IMPACT", paletteTag: "ANIM_TAG_CROSS_IMPACT", oam: "&gOamData_AffineOff_ObjBlend_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimCrossImpact" } as const;
export const gFlashingHitSplatSpriteTemplate = { tileTag: "ANIM_TAG_IMPACT", paletteTag: "ANIM_TAG_IMPACT", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_HitSplat", callback: "AnimFlashingHitSplat" } as const;
export const gPersistHitSplatSpriteTemplate = { tileTag: "ANIM_TAG_IMPACT", paletteTag: "ANIM_TAG_IMPACT", oam: "&gOamData_AffineNormal_ObjBlend_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_HitSplat", callback: "AnimHitSplatPersistent" } as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AnimConfusionDuck', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSimplePaletteBlend', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSimplePaletteBlend_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimComplexPaletteBlend', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimComplexPaletteBlend_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimComplexPaletteBlend_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimCirclingSparkle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimShakeMonOrBattlePlatforms', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimShakeMonOrBattlePlatforms_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimShakeMonOrBattlePlatforms_UpdateCoordOffsetEnabled', ret: "void", arity: 0, params: "void" },
  { name: 'AnimHitSplatBasic', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimHitSplatPersistent', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimHitSplatHandleInvert', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimHitSplatRandom', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimHitSplatOnMonEdge', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimCrossImpact', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFlashingHitSplat', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFlashingHitSplat_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimConfusionDuck_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'BlendColorCycle', ret: "void", arity: 3, params: "u8, u8, u8" },
  { name: 'AnimTask_BlendColorCycleLoop', ret: "void", arity: 1, params: "u8" },
  { name: 'BlendColorCycleExclude', ret: "void", arity: 3, params: "u8, u8, u8" },
  { name: 'AnimTask_BlendColorCycleExcludeLoop', ret: "void", arity: 1, params: "u8" },
  { name: 'BlendColorCycleByTag', ret: "void", arity: 3, params: "u8, u8, u8" },
  { name: 'AnimTask_BlendColorCycleByTagLoop', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_FlashAnimTagWithColor_Step1', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_FlashAnimTagWithColor_Step2', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_ShakeBattlePlatforms_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'UnpackSelectedBattlePalettes', ret: "u32", arity: 1, params: "s16 selector" },
  { name: 'BlendPalettes', ret: "else", arity: 3, params: "selectedPalettes, sprite->sBlendY2, sprite->sColor2" },
  { name: 'AnimTask_BlendColorCycle', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_BlendColorCycleExclude', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_BlendColorCycleByTag', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_FlashAnimTagWithColor', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_InvertScreenColor', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_TintPalettes', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ShakeBattlePlatforms', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'InitSpritePosToAnimTarget', ret: "else", arity: 2, params: "sprite, TRUE" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_anim.h',
  'battle_anim_internal.h',
  'palette.h',
  'random.h',
  'task.h',
  'trig.h',
  'constants/rgb.h',
] as const;
