// AUTO-GENERATED from src/battle_anim_electric.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_electric.c
// Generated: 2026-04-26

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const gLightningSpriteTemplate = { tileTag: "ANIM_TAG_LIGHTNING", paletteTag: "ANIM_TAG_LIGHTNING", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_Lightning", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimLightning" } as const;
export const sUnusedSpinningFistSpriteTemplate = { tileTag: "ANIM_TAG_HANDS_AND_FEET", paletteTag: "ANIM_TAG_HANDS_AND_FEET", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_UnusedSpinningFist", callback: "AnimUnusedSpinningFist" } as const;
export const sUnusedCirclingShockSpriteTemplate = { tileTag: "ANIM_TAG_SHOCK", paletteTag: "ANIM_TAG_SHOCK", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_UnusedCirclingShock", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimUnusedCirclingShock" } as const;
export const gSparkElectricitySpriteTemplate = { tileTag: "ANIM_TAG_SPARK_2", paletteTag: "ANIM_TAG_SPARK_2", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSparkElectricity" } as const;
export const gZapCannonBallSpriteTemplate = { tileTag: "ANIM_TAG_BLACK_BALL_2", paletteTag: "ANIM_TAG_BLACK_BALL_2", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "TranslateAnimSpriteToTargetMonLocation" } as const;
export const gZapCannonSparkSpriteTemplate = { tileTag: "ANIM_TAG_SPARK_2", paletteTag: "ANIM_TAG_SPARK_2", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_FlashingSpark", callback: "AnimZapCannonSpark" } as const;
export const gThunderboltOrbSpriteTemplate = { tileTag: "ANIM_TAG_SHOCK_3", paletteTag: "ANIM_TAG_SHOCK_3", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "sAnims_ThunderboltOrb", images: 0, affineAnims: "sAffineAnims_ThunderboltOrb", callback: "AnimThunderboltOrb" } as const;
export const gSparkElectricityFlashingSpriteTemplate = { tileTag: "ANIM_TAG_SPARK_2", paletteTag: "ANIM_TAG_SPARK_2", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_FlashingSpark", callback: "AnimSparkElectricityFlashing" } as const;
export const gElectricitySpriteTemplate = { tileTag: "ANIM_TAG_SPARK_2", paletteTag: "ANIM_TAG_SPARK_2", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimElectricity" } as const;
export const gElectricBoltSegmentSpriteTemplate = { tileTag: "ANIM_TAG_SPARK", paletteTag: "ANIM_TAG_SPARK", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimElectricBoltSegment" } as const;
export const gThunderWaveSpriteTemplate = { tileTag: "ANIM_TAG_SPARK_H", paletteTag: "ANIM_TAG_SPARK_H", oam: "&gOamData_AffineOff_ObjNormal_32x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimThunderWave" } as const;
export const gElectricChargingParticlesSpriteTemplate = { tileTag: "ANIM_TAG_ELECTRIC_ORBS", paletteTag: "ANIM_TAG_ELECTRIC_ORBS", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "sAnims_ElectricChargingParticles", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const gGrowingChargeOrbSpriteTemplate = { tileTag: "ANIM_TAG_CIRCLE_OF_LIGHT", paletteTag: "ANIM_TAG_CIRCLE_OF_LIGHT", oam: "&gOamData_AffineNormal_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_GrowingElectricOrb", callback: "AnimGrowingChargeOrb" } as const;
export const gElectricPuffSpriteTemplate = { tileTag: "ANIM_TAG_ELECTRICITY", paletteTag: "ANIM_TAG_ELECTRICITY", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_ElectricPuff", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimElectricPuff" } as const;
export const gVoltTackleOrbSlideSpriteTemplate = { tileTag: "ANIM_TAG_CIRCLE_OF_LIGHT", paletteTag: "ANIM_TAG_CIRCLE_OF_LIGHT", oam: "&gOamData_AffineNormal_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_GrowingElectricOrb", callback: "AnimVoltTackleOrbSlide" } as const;
export const gVoltTackleBoltSpriteTemplate = { tileTag: "ANIM_TAG_SPARK", paletteTag: "ANIM_TAG_SPARK", oam: "&gOamData_AffineDouble_ObjNormal_8x16", anims: "sAnims_VoltTackleBolt", images: 0, affineAnims: "sAffineAnims_VoltTackleBolt", callback: "AnimVoltTackleBolt" } as const;
export const gGrowingShockWaveOrbSpriteTemplate = { tileTag: "ANIM_TAG_CIRCLE_OF_LIGHT", paletteTag: "ANIM_TAG_CIRCLE_OF_LIGHT", oam: "&gOamData_AffineNormal_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_GrowingElectricOrb", callback: "AnimGrowingShockWaveOrb" } as const;
export const gShockWaveProgressingBoltSpriteTemplate = { tileTag: "ANIM_TAG_SPARK", paletteTag: "ANIM_TAG_SPARK", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimShockWaveProgressingBolt" } as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AnimLightning', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimLightning_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimUnusedSpinningFist', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimUnusedSpinningFist_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimUnusedCirclingShock', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSparkElectricity', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimZapCannonSpark', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimZapCannonSpark_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimThunderboltOrb', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimThunderboltOrb_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSparkElectricityFlashing', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSparkElectricityFlashing_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimElectricity', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_ElectricBolt_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimElectricBoltSegment', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimThunderWave', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimThunderWave_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_ElectricChargingParticles_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimElectricChargingParticles', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimElectricChargingParticles_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimGrowingChargeOrb', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimElectricPuff', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimVoltTackleOrbSlide', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimVoltTackleOrbSlide_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'CreateVoltTackleBolt', ret: "bool8", arity: 2, params: "struct Task *task, u8 taskId" },
  { name: 'AnimVoltTackleBolt', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimGrowingShockWaveOrb', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'CreateShockWaveBoltSprite', ret: "bool8", arity: 2, params: "struct Task *task, u8 taskId" },
  { name: 'AnimShockWaveProgressingBolt', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'CreateShockWaveLightningSprite', ret: "bool8", arity: 2, params: "struct Task *task, u8 taskId" },
  { name: 'AnimShockWaveLightning', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimTask_ElectricBolt', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ElectricChargingParticles', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_VoltTackleAttackerReappear', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_VoltTackleBolt', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ShockWaveProgressingBolt', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ShockWaveLightning', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_anim.h',
  'constants/rgb.h',
  'trig.h',
  'constants/songs.h',
  'sound.h',
] as const;
