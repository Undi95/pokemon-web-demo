// AUTO-GENERATED from src/battle_anim_fire.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_fire.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const IDX_ACTIVE_SPRITES = 6;
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tTimer1_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tTimer2_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tTimer3_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tAttackerY_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tAttackerSide_EXPR = "data[5]";
/** Raw expr: `data[IDX_ACTIVE_SPRITES]` */
export const tActiveSprites_EXPR = "data[IDX_ACTIVE_SPRITES]";
/** Raw expr: `data[15]` */
export const tAttackerSpriteId_EXPR = "data[15]";
/** Raw expr: `data[0]` */
export const sSpeedDelay_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sLaunchStage_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sX_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sY_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sSpeedX_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sSpeedY_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const sTaskId_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const sActiveSpritesIdx_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const sState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sBounceTimer_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sBounceDir_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sEndTimer_EXPR = "data[3]";
/** Raw expr: `data[6]` */
export const sFallDelay_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const sTargetY_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const tShakeNum_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tMaxShakes_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tShakeOffset_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tVertical_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tPatternId_EXPR = "data[4]";

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const gFireSpiralInwardSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_EMBER", paletteTag: "ANIM_TAG_SMALL_EMBER", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_FireSpiralSpread", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimFireSpiralInward" } as const;
export const gFireSpreadSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_EMBER", paletteTag: "ANIM_TAG_SMALL_EMBER", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_FireSpiralSpread", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimFireSpread" } as const;
export const gLargeFlameSpriteTemplate = { tileTag: "ANIM_TAG_FIRE", paletteTag: "ANIM_TAG_FIRE", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "sAnims_LargeFlame", images: 0, affineAnims: "sAffineAnims_LargeFlame", callback: "AnimLargeFlame" } as const;
export const gLargeFlameScatterSpriteTemplate = { tileTag: "ANIM_TAG_FIRE", paletteTag: "ANIM_TAG_FIRE", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_LargeFlame", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimLargeFlame" } as const;
export const gFirePlumeSpriteTemplate = { tileTag: "ANIM_TAG_FIRE_PLUME", paletteTag: "ANIM_TAG_FIRE_PLUME", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_FirePlume", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimFirePlume" } as const;
export const sUnusedEmberFirePlumeSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_EMBER", paletteTag: "ANIM_TAG_SMALL_EMBER", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_FirePlume", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimFirePlume" } as const;
export const sUnusedSmallEmberSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_EMBER", paletteTag: "ANIM_TAG_SMALL_EMBER", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_UnusedSmallEmber", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimUnusedSmallEmber" } as const;
export const gSunlightRaySpriteTemplate = { tileTag: "ANIM_TAG_SUNLIGHT", paletteTag: "ANIM_TAG_SUNLIGHT", oam: "&gOamData_AffineNormal_ObjBlend_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_SunlightRay", callback: "AnimSunlight" } as const;
export const gEmberSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_EMBER", paletteTag: "ANIM_TAG_SMALL_EMBER", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "TranslateAnimSpriteToTargetMonLocation" } as const;
export const gEmberFlareSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_EMBER", paletteTag: "ANIM_TAG_SMALL_EMBER", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gAnims_BasicFire", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimEmberFlare" } as const;
export const gBurnFlameSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_EMBER", paletteTag: "ANIM_TAG_SMALL_EMBER", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gAnims_BasicFire", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimBurnFlame" } as const;
export const gFireBlastRingSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_EMBER", paletteTag: "ANIM_TAG_SMALL_EMBER", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gAnims_BasicFire", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimFireRing" } as const;
export const gFireBlastCrossSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_EMBER", paletteTag: "ANIM_TAG_SMALL_EMBER", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_FireBlastCross", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimFireCross" } as const;
export const gFireSpiralOutwardSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_EMBER", paletteTag: "ANIM_TAG_SMALL_EMBER", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gAnims_BasicFire", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimFireSpiralOutward" } as const;
export const gWeatherBallFireDownSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_EMBER", paletteTag: "ANIM_TAG_SMALL_EMBER", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gAnims_BasicFire", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimWeatherBallDown" } as const;
export const gEruptionLaunchRockSpriteTemplate = { tileTag: "ANIM_TAG_WARM_ROCK", paletteTag: "ANIM_TAG_WARM_ROCK", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimEruptionLaunchRock" } as const;
export const gEruptionFallingRockSpriteTemplate = { tileTag: "ANIM_TAG_WARM_ROCK", paletteTag: "ANIM_TAG_WARM_ROCK", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimEruptionFallingRock" } as const;
export const gWillOWispOrbSpriteTemplate = { tileTag: "ANIM_TAG_WISP_ORB", paletteTag: "ANIM_TAG_WISP_ORB", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "sAnims_WillOWispOrb", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimWillOWispOrb" } as const;
export const gWillOWispFireSpriteTemplate = { tileTag: "ANIM_TAG_WISP_FIRE", paletteTag: "ANIM_TAG_WISP_FIRE", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_WillOWispFire", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimWillOWispFire" } as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AnimFireSpiralInward', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFireSpread', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFirePlume', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimLargeFlame', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimLargeFlame_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimUnusedSmallEmber', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimUnusedSmallEmber_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSunlight', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimEmberFlare', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBurnFlame', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFireRing', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFireRing_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFireRing_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFireRing_Step3', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'UpdateFireRingCircleOffset', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFireCross', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFireSpiralOutward', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFireSpiralOutward_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFireSpiralOutward_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_EruptionLaunchRocks_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateEruptionLaunchRocks', ret: "void", arity: 3, params: "u8, u8, u8" },
  { name: 'AnimEruptionLaunchRock', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'GetEruptionLaunchRockInitialYPos', ret: "u16", arity: 1, params: "u8" },
  { name: 'InitEruptionLaunchRockCoordData', ret: "void", arity: 3, params: "struct Sprite *, s16, s16" },
  { name: 'UpdateEruptionLaunchRockPos', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimEruptionFallingRock', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimEruptionFallingRock_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWillOWispOrb', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWillOWispOrb_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWillOWispFire', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_MoveHeatWaveTargets_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_EruptionLaunchRocks', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'PrepareEruptAnimTaskData', ret: "else", arity: 7, params: "task, task->tAttackerSpriteId, 0xE0, 0x200, 0x180, 0xC0, 6" },
  { name: 'AnimTask_MoveHeatWaveTargets', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_BlendBackground', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ShakeTargetInPattern', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_anim.h',
  'constants/rgb.h',
  'constants/songs.h',
  'palette.h',
  'sound.h',
  'util.h',
  'task.h',
  'trig.h',
] as const;
