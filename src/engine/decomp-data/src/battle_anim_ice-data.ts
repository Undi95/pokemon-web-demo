// AUTO-GENERATED from src/battle_anim_ice.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_ice.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tSpriteCount_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tHailAffineAnimNum_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tHailStructId_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tInitialDelayTimer_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tHailSpawnTimer_EXPR = "data[5]";
/** Raw expr: `data[0]` */
export const sSpawnImpactEffect_EXPR = "data[0]";
/** Raw expr: `data[3]` */
export const sTargetX_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sTargetY_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sAffineAnimNum_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const sOwnerTaskId_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const sOwnerTaskSpriteCountField_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const sTimer_EXPR = "data[0]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_HAILSTRUCTTYPE_0 = {
  HAILSTRUCTTYPE_NEGATIVE_POS_MOD: 0,
  HAILSTRUCTTYPE_POSITIVE_POS_MOD: 1,
  HAILSTRUCTTYPE_FIXED_POSITION: 2,
} as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sUnusedIceCrystalThrowSpriteTemplate = { tileTag: "ANIM_TAG_ICE_CRYSTALS", paletteTag: "ANIM_TAG_ICE_CRYSTALS", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimUnusedIceCrystalThrow" } as const;
export const gIceCrystalSpiralInwardLarge = { tileTag: "ANIM_TAG_ICE_CRYSTALS", paletteTag: "ANIM_TAG_ICE_CRYSTALS", oam: "&gOamData_AffineDouble_ObjBlend_8x16", anims: "sAnims_IceCrystalLarge", images: 0, affineAnims: "sAffineAnims_IceCrystalSpiralInwardLarge", callback: "AnimIcePunchSwirlingParticle" } as const;
export const gIceCrystalSpiralInwardSmall = { tileTag: "ANIM_TAG_ICE_CRYSTALS", paletteTag: "ANIM_TAG_ICE_CRYSTALS", oam: "&gOamData_AffineOff_ObjBlend_8x8", anims: "sAnims_IceCrystalSmall", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimIcePunchSwirlingParticle" } as const;
export const gIceBeamInnerCrystalSpriteTemplate = { tileTag: "ANIM_TAG_ICE_CRYSTALS", paletteTag: "ANIM_TAG_ICE_CRYSTALS", oam: "&gOamData_AffineNormal_ObjBlend_8x16", anims: "sAnims_IceCrystalLarge", images: 0, affineAnims: "sAffineAnims_IceBeamInnerCrystal", callback: "AnimIceBeamParticle" } as const;
export const gIceBeamOuterCrystalSpriteTemplate = { tileTag: "ANIM_TAG_ICE_CRYSTALS", paletteTag: "ANIM_TAG_ICE_CRYSTALS", oam: "&gOamData_AffineOff_ObjBlend_8x8", anims: "sAnims_IceCrystalSmall", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimIceBeamParticle" } as const;
export const gIceCrystalHitLargeSpriteTemplate = { tileTag: "ANIM_TAG_ICE_CRYSTALS", paletteTag: "ANIM_TAG_ICE_CRYSTALS", oam: "&gOamData_AffineNormal_ObjBlend_8x16", anims: "sAnims_IceCrystalLarge", images: 0, affineAnims: "sAffineAnims_IceCrystalHit", callback: "AnimIceEffectParticle" } as const;
export const gIceCrystalHitSmallSpriteTemplate = { tileTag: "ANIM_TAG_ICE_CRYSTALS", paletteTag: "ANIM_TAG_ICE_CRYSTALS", oam: "&gOamData_AffineNormal_ObjBlend_8x8", anims: "sAnims_IceCrystalSmall", images: 0, affineAnims: "sAffineAnims_IceCrystalHit", callback: "AnimIceEffectParticle" } as const;
export const gSwirlingSnowballSpriteTemplate = { tileTag: "ANIM_TAG_ICE_CRYSTALS", paletteTag: "ANIM_TAG_ICE_CRYSTALS", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "sAnims_Snowball", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSwirlingSnowball" } as const;
export const gBlizzardIceCrystalSpriteTemplate = { tileTag: "ANIM_TAG_ICE_CRYSTALS", paletteTag: "ANIM_TAG_ICE_CRYSTALS", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "sAnims_BlizzardIceCrystal", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimMoveParticleBeyondTarget" } as const;
export const gPowderSnowSnowballSpriteTemplate = { tileTag: "ANIM_TAG_ICE_CRYSTALS", paletteTag: "ANIM_TAG_ICE_CRYSTALS", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "sAnims_Snowball", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimMoveParticleBeyondTarget" } as const;
export const gIceGroundSpikeSpriteTemplate = { tileTag: "ANIM_TAG_ICE_SPIKES", paletteTag: "ANIM_TAG_ICE_SPIKES", oam: "&gOamData_AffineOff_ObjBlend_8x16", anims: "sAnims_IceGroundSpike", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimWaveFromCenterOfTarget" } as const;
export const gMistCloudSpriteTemplate = { tileTag: "ANIM_TAG_MIST_CLOUD", paletteTag: "ANIM_TAG_MIST_CLOUD", oam: "&gOamData_AffineOff_ObjBlend_32x16", anims: "sAnims_Cloud", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "InitSwirlingFogAnim" } as const;
export const gSmogCloudSpriteTemplate = { tileTag: "ANIM_TAG_PURPLE_GAS_CLOUD", paletteTag: "ANIM_TAG_PURPLE_GAS_CLOUD", oam: "&gOamData_AffineOff_ObjBlend_32x16", anims: "sAnims_Cloud", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "InitSwirlingFogAnim" } as const;
export const gMistBallSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_BUBBLES", paletteTag: "ANIM_TAG_SMALL_BUBBLES", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimThrowMistBall" } as const;
export const gPoisonGasCloudSpriteTemplate = { tileTag: "ANIM_TAG_PURPLE_GAS_CLOUD", paletteTag: "ANIM_TAG_PURPLE_GAS_CLOUD", oam: "&gOamData_AffineOff_ObjBlend_32x16", anims: "sAnims_Cloud", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "InitPoisonGasCloudAnim" } as const;
export const gHailParticleSpriteTemplate = { tileTag: "ANIM_TAG_HAIL", paletteTag: "ANIM_TAG_HAIL", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_HailParticle", callback: "AnimHailBegin" } as const;
export const gWeatherBallIceDownSpriteTemplate = { tileTag: "ANIM_TAG_HAIL", paletteTag: "ANIM_TAG_HAIL", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_WeatherBallIceDown", callback: "AnimWeatherBallDown" } as const;
export const gIceBallChunkSpriteTemplate = { tileTag: "ANIM_TAG_ICE_CHUNK", paletteTag: "ANIM_TAG_ICE_CHUNK", oam: "&gOamData_AffineDouble_ObjNormal_32x32", anims: "sAnims_IceBallChunk", images: 0, affineAnims: "sAffineAnims_IceBallChunk", callback: "InitIceBallAnim" } as const;
export const gIceBallImpactShardSpriteTemplate = { tileTag: "ANIM_TAG_ICE_CRYSTALS", paletteTag: "ANIM_TAG_ICE_CRYSTALS", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "sAnims_IceCrystalSmall", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "InitIceBallParticle" } as const;

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sHazeBlendAmounts: readonly number[] = [0,1,2,2,2,2,3,4,4,4,5,6,6,6,6,7,8,8,8,9] as const;
export const sMistBlendAmounts: readonly number[] = [0,1,1,1,1,2,2,2,2,3,3,3,3,3,4,4,4,4,4,5] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AnimUnusedIceCrystalThrow', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimUnusedIceCrystalThrow_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimIcePunchSwirlingParticle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimIceBeamParticle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimIceEffectParticle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFlickerIceEffectParticle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSwirlingSnowball', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSwirlingSnowball_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSwirlingSnowball_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSwirlingSnowball_End', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMoveParticleBeyondTarget', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWiggleParticleTowardsTarget', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWaveFromCenterOfTarget', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'InitSwirlingFogAnim', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSwirlingFogAnim', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimThrowMistBall', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'InitPoisonGasCloudAnim', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'MovePoisonGasCloud', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimHailBegin', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimHailContinue', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'InitIceBallAnim', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimThrowIceBall', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'InitIceBallParticle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimIceBallParticle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_HazeScrollingFog_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_MistBallFog_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_Hail2', ret: "void", arity: 1, params: "u8" },
  { name: 'GenerateHailParticle', ret: "bool8", arity: 4, params: "u8 hailStructId, u8 affineAnimNum, u8 taskId, u8 c" },
  { name: 'AnimTask_HazeScrollingFog', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_MistBallFog', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_Hail', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_GetIceBallCounter', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_anim.h',
  'bg.h',
  'field_weather.h',
  'gpu_regs.h',
  'graphics.h',
  'main.h',
  'palette.h',
  'random.h',
  'sprite.h',
  'task.h',
  'trig.h',
  'constants/battle_anim.h',
  'constants/rgb.h',
] as const;
