// AUTO-GENERATED from src/battle_anim_effects_1.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_effects_1.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const sMoveTimer_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sBlendTableIdx_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sBlendTimer_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sBlendCycleTime_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sX_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sY_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const sVelocX_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const sVelocY_EXPR = "data[7]";

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const gSleepPowderParticleSpriteTemplate = { tileTag: "ANIM_TAG_SLEEP_POWDER", paletteTag: "ANIM_TAG_SLEEP_POWDER", oam: "&gOamData_AffineOff_ObjNormal_8x16", anims: "gPowderParticlesAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimMovePowderParticle" } as const;
export const gStunSporeParticleSpriteTemplate = { tileTag: "ANIM_TAG_STUN_SPORE", paletteTag: "ANIM_TAG_STUN_SPORE", oam: "&gOamData_AffineOff_ObjNormal_8x16", anims: "gPowderParticlesAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimMovePowderParticle" } as const;
export const gPoisonPowderParticleSpriteTemplate = { tileTag: "ANIM_TAG_POISON_POWDER", paletteTag: "ANIM_TAG_POISON_POWDER", oam: "&gOamData_AffineOff_ObjNormal_8x16", anims: "gPowderParticlesAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimMovePowderParticle" } as const;
export const gPowerAbsorptionOrbSpriteTemplate = { tileTag: "ANIM_TAG_ORBS", paletteTag: "ANIM_TAG_ORBS", oam: "&gOamData_AffineNormal_ObjBlend_16x16", anims: "gPowerAbsorptionOrbAnimTable", images: 0, affineAnims: "gPowerAbsorptionOrbAffineAnimTable", callback: "AnimPowerAbsorptionOrb" } as const;
export const gSolarBeamBigOrbSpriteTemplate = { tileTag: "ANIM_TAG_ORBS", paletteTag: "ANIM_TAG_ORBS", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gSolarBeamBigOrbAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSolarBeamBigOrb" } as const;
export const gSolarBeamSmallOrbSpriteTemplate = { tileTag: "ANIM_TAG_ORBS", paletteTag: "ANIM_TAG_ORBS", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gSolarBeamSmallOrbAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSolarBeamSmallOrb" } as const;
export const gStockpileAbsorptionOrbSpriteTemplate = { tileTag: "ANIM_TAG_GRAY_ORB", paletteTag: "ANIM_TAG_GRAY_ORB", oam: "&gOamData_AffineDouble_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gStockpileAbsorptionOrbAffineAnimTable", callback: "AnimPowerAbsorptionOrb" } as const;
export const gAbsorptionOrbSpriteTemplate = { tileTag: "ANIM_TAG_ORBS", paletteTag: "ANIM_TAG_ORBS", oam: "&gOamData_AffineNormal_ObjBlend_16x16", anims: "gPowerAbsorptionOrbAnimTable", images: 0, affineAnims: "gAbsorptionOrbAffineAnimTable", callback: "AnimAbsorptionOrb" } as const;
export const gHyperBeamOrbSpriteTemplate = { tileTag: "ANIM_TAG_ORBS", paletteTag: "ANIM_TAG_ORBS", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gSolarBeamBigOrbAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimHyperBeamOrb" } as const;
export const gLeechSeedSpriteTemplate = { tileTag: "ANIM_TAG_SEED", paletteTag: "ANIM_TAG_SEED", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gLeechSeedAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimLeechSeed" } as const;
export const gSporeParticleSpriteTemplate = { tileTag: "ANIM_TAG_SPORE", paletteTag: "ANIM_TAG_SPORE", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gSporeParticleAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSporeParticle" } as const;
export const gPetalDanceBigFlowerSpriteTemplate = { tileTag: "ANIM_TAG_FLOWER", paletteTag: "ANIM_TAG_FLOWER", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gPetalDanceBigFlowerAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimPetalDanceBigFlower" } as const;
export const gPetalDanceSmallFlowerSpriteTemplate = { tileTag: "ANIM_TAG_FLOWER", paletteTag: "ANIM_TAG_FLOWER", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gPetalDanceSmallFlowerAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimPetalDanceSmallFlower" } as const;
export const gRazorLeafParticleSpriteTemplate = { tileTag: "ANIM_TAG_LEAF", paletteTag: "ANIM_TAG_LEAF", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gRazorLeafParticleAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimRazorLeafParticle" } as const;
export const gTwisterLeafSpriteTemplate = { tileTag: "ANIM_TAG_LEAF", paletteTag: "ANIM_TAG_LEAF", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gRazorLeafParticleAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimMoveTwisterParticle" } as const;
export const gRazorLeafCutterSpriteTemplate = { tileTag: "ANIM_TAG_RAZOR_LEAF", paletteTag: "ANIM_TAG_RAZOR_LEAF", oam: "&gOamData_AffineOff_ObjNormal_32x16", anims: "gRazorLeafCutterAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimTranslateLinearSingleSineWave" } as const;
export const gSwiftStarSpriteTemplate = { tileTag: "ANIM_TAG_YELLOW_STAR", paletteTag: "ANIM_TAG_YELLOW_STAR", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gSwiftStarAffineAnimTable", callback: "AnimTranslateLinearSingleSineWave" } as const;
export const gConstrictBindingSpriteTemplate = { tileTag: "ANIM_TAG_TENDRILS", paletteTag: "ANIM_TAG_TENDRILS", oam: "&gOamData_AffineNormal_ObjNormal_64x32", anims: "sAnims_ConstrictBinding", images: 0, affineAnims: "sAffineAnims_ConstrictBinding", callback: "AnimConstrictBinding" } as const;
export const gMimicOrbSpriteTemplate = { tileTag: "ANIM_TAG_ORBS", paletteTag: "ANIM_TAG_ORBS", oam: "&gOamData_AffineDouble_ObjNormal_16x16", anims: "gPowerAbsorptionOrbAnimTable", images: 0, affineAnims: "gMimicOrbAffineAnimTable", callback: "AnimMimicOrb" } as const;
export const gIngrainRootSpriteTemplate = { tileTag: "ANIM_TAG_ROOTS", paletteTag: "ANIM_TAG_ROOTS", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gIngrainRootAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimIngrainRoot" } as const;
export const gFrenzyPlantRootSpriteTemplate = { tileTag: "ANIM_TAG_ROOTS", paletteTag: "ANIM_TAG_ROOTS", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gIngrainRootAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimFrenzyPlantRoot" } as const;
export const gIngrainOrbSpriteTemplate = { tileTag: "ANIM_TAG_ORBS", paletteTag: "ANIM_TAG_ORBS", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gIngrainOrbAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimIngrainOrb" } as const;
export const gPresentSpriteTemplate = { tileTag: "ANIM_TAG_ITEM_BAG", paletteTag: "ANIM_TAG_ITEM_BAG", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "gFallingBagAnimTable", images: 0, affineAnims: "gFallingBagAffineAnimTable", callback: "AnimPresent" } as const;
export const gKnockOffItemSpriteTemplate = { tileTag: "ANIM_TAG_ITEM_BAG", paletteTag: "ANIM_TAG_ITEM_BAG", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "gFallingBagAnimTable", images: 0, affineAnims: "gFallingBagAffineAnimTable", callback: "AnimKnockOffItem" } as const;
export const gPresentHealParticleSpriteTemplate = { tileTag: "ANIM_TAG_GREEN_SPARKLE", paletteTag: "ANIM_TAG_GREEN_SPARKLE", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gPresentHealParticleAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimPresentHealParticle" } as const;
export const gItemStealSpriteTemplate = { tileTag: "ANIM_TAG_ITEM_BAG", paletteTag: "ANIM_TAG_ITEM_BAG", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "gFallingBagAnimTable", images: 0, affineAnims: "gFallingBagAffineAnimTable", callback: "AnimItemSteal" } as const;
export const gTrickBagSpriteTemplate = { tileTag: "ANIM_TAG_ITEM_BAG", paletteTag: "ANIM_TAG_ITEM_BAG", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "gFallingBagAnimTable", images: 0, affineAnims: "gTrickBagAffineAnimTable", callback: "AnimTrickBag" } as const;
export const gLeafBladeSpriteTemplate = { tileTag: "ANIM_TAG_LEAF", paletteTag: "ANIM_TAG_LEAF", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gLeafBladeAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const gAromatherapySmallFlowerSpriteTemplate = { tileTag: "ANIM_TAG_FLOWER", paletteTag: "ANIM_TAG_FLOWER", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gPetalDanceSmallFlowerAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimFlyingParticle" } as const;
export const gAromatherapyBigFlowerSpriteTemplate = { tileTag: "ANIM_TAG_FLOWER", paletteTag: "ANIM_TAG_FLOWER", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "gPetalDanceBigFlowerAnimTable", images: 0, affineAnims: "gAromatherapyBigFlowerAffineAnimTable", callback: "AnimFlyingParticle" } as const;
export const gSilverWindBigSparkSpriteTemplate = { tileTag: "ANIM_TAG_SPARKLE_6", paletteTag: "ANIM_TAG_SPARKLE_6", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gSilverWindBigSparkAffineAnimTable", callback: "AnimFlyingParticle" } as const;
export const gSilverWindMediumSparkSpriteTemplate = { tileTag: "ANIM_TAG_SPARKLE_6", paletteTag: "ANIM_TAG_SPARKLE_6", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gSilverWindMediumSparkAffineAnimTable", callback: "AnimFlyingParticle" } as const;
export const gSilverWindSmallSparkSpriteTemplate = { tileTag: "ANIM_TAG_SPARKLE_6", paletteTag: "ANIM_TAG_SPARKLE_6", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gSilverWindSmallSparkAffineAnimTable", callback: "AnimFlyingParticle" } as const;
export const gNeedleArmSpikeSpriteTemplate = { tileTag: "ANIM_TAG_GREEN_SPIKE", paletteTag: "ANIM_TAG_GREEN_SPIKE", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimNeedleArmSpike" } as const;
export const gSlamHitSpriteTemplate = { tileTag: "ANIM_TAG_SLAM_HIT", paletteTag: "ANIM_TAG_SLAM_HIT", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_Whip", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimWhipHit" } as const;
export const gVineWhipSpriteTemplate = { tileTag: "ANIM_TAG_WHIP_HIT", paletteTag: "ANIM_TAG_WHIP_HIT", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_Whip", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimWhipHit" } as const;
export const sSlidingHit1SpriteTemplate = { tileTag: "ANIM_TAG_HIT", paletteTag: "ANIM_TAG_HIT", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_SlidingHit", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSlidingHit" } as const;
export const sSlidingHit2SpriteTemplate = { tileTag: "ANIM_TAG_HIT_2", paletteTag: "ANIM_TAG_HIT_2", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_SlidingHit", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSlidingHit" } as const;
export const sFlickeringPunchSpriteTemplate = { tileTag: "ANIM_TAG_HANDS_AND_FEET", paletteTag: "ANIM_TAG_HANDS_AND_FEET", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_FlickeringPunch", callback: "AnimFlickeringPunch" } as const;
export const gCuttingSliceSpriteTemplate = { tileTag: "ANIM_TAG_CUT", paletteTag: "ANIM_TAG_CUT", oam: "&gOamData_AffineOff_ObjBlend_32x32", anims: "gCuttingSliceAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimCuttingSlice" } as const;
export const gAirCutterSliceSpriteTemplate = { tileTag: "ANIM_TAG_CUT", paletteTag: "ANIM_TAG_CUT", oam: "&gOamData_AffineOff_ObjBlend_32x32", anims: "gCuttingSliceAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimAirCutterSlice" } as const;
export const sCirclingMusicNoteSpriteTemplate = { tileTag: "ANIM_TAG_MUSIC_NOTES", paletteTag: "ANIM_TAG_MUSIC_NOTES", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "sAnims_CirclingMusicNote", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimCirclingMusicNote" } as const;
export const gProtectSpriteTemplate = { tileTag: "ANIM_TAG_PROTECT", paletteTag: "ANIM_TAG_PROTECT", oam: "&gOamData_AffineOff_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimProtect" } as const;
export const gMilkBottleSpriteTemplate = { tileTag: "ANIM_TAG_MILK_BOTTLE", paletteTag: "ANIM_TAG_MILK_BOTTLE", oam: "&gOamData_AffineNormal_ObjBlend_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gMilkBottleAffineAnimTable", callback: "AnimMilkBottle" } as const;
export const gGrantingStarsSpriteTemplate = { tileTag: "ANIM_TAG_SPARKLE_2", paletteTag: "ANIM_TAG_SPARKLE_2", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gGrantingStarsAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimGrantingStars" } as const;
export const gSparklingStarsSpriteTemplate = { tileTag: "ANIM_TAG_SPARKLE_2", paletteTag: "ANIM_TAG_SPARKLE_2", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gGrantingStarsAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSparklingStars" } as const;
export const sBubbleBurstSpriteTemplate = { tileTag: "ANIM_TAG_BUBBLE_BURST", paletteTag: "ANIM_TAG_BUBBLE_BURST", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "sAnims_BubbleBurst", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimBubbleBurst" } as const;
export const gSleepLetterZSpriteTemplate = { tileTag: "ANIM_TAG_LETTER_Z", paletteTag: "ANIM_TAG_LETTER_Z", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "gSleepLetterZAnimTable", images: 0, affineAnims: "gSleepLetterZAffineAnimTable", callback: "AnimSleepLetterZ" } as const;
export const gLockOnTargetSpriteTemplate = { tileTag: "ANIM_TAG_LOCK_ON", paletteTag: "ANIM_TAG_LOCK_ON", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimLockOnTarget" } as const;
export const gLockOnMoveTargetSpriteTemplate = { tileTag: "ANIM_TAG_LOCK_ON", paletteTag: "ANIM_TAG_LOCK_ON", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimLockOnMoveTarget" } as const;
export const gBowMonSpriteTemplate = { tileTag: 0, paletteTag: 0, oam: "&gDummyOamData", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimBowMon" } as const;
export const sTipMonSpriteTemplate = { tileTag: 0, paletteTag: 0, oam: "&gDummyOamData", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimTipMon" } as const;
export const gSlashSliceSpriteTemplate = { tileTag: "ANIM_TAG_SLASH", paletteTag: "ANIM_TAG_SLASH", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gSlashSliceAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSlashSlice" } as const;
export const gFalseSwipeSliceSpriteTemplate = { tileTag: "ANIM_TAG_SLASH_2", paletteTag: "ANIM_TAG_SLASH_2", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gSlashSliceAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimFalseSwipeSlice" } as const;
export const gFalseSwipePositionedSliceSpriteTemplate = { tileTag: "ANIM_TAG_SLASH_2", paletteTag: "ANIM_TAG_SLASH_2", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gSlashSliceAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimFalseSwipePositionedSlice" } as const;
export const gEndureEnergySpriteTemplate = { tileTag: "ANIM_TAG_FOCUS_ENERGY", paletteTag: "ANIM_TAG_FOCUS_ENERGY", oam: "&gOamData_AffineOff_ObjNormal_16x32", anims: "gEndureEnergyAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimEndureEnergy" } as const;
export const gSharpenSphereSpriteTemplate = { tileTag: "ANIM_TAG_SPHERE_TO_CUBE", paletteTag: "ANIM_TAG_SPHERE_TO_CUBE", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gSharpenSphereAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSharpenSphere" } as const;
export const gOctazookaBallSpriteTemplate = { tileTag: "ANIM_TAG_BLACK_BALL", paletteTag: "ANIM_TAG_BLACK_BALL", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "TranslateAnimSpriteToTargetMonLocation" } as const;
export const gOctazookaSmokeSpriteTemplate = { tileTag: "ANIM_TAG_GRAY_SMOKE", paletteTag: "ANIM_TAG_GRAY_SMOKE", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gOctazookaAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSpriteOnMonPos" } as const;
export const gConversionSpriteTemplate = { tileTag: "ANIM_TAG_CONVERSION", paletteTag: "ANIM_TAG_CONVERSION", oam: "&gOamData_AffineDouble_ObjBlend_8x8", anims: "gConversionAnimTable", images: 0, affineAnims: "gConversionAffineAnimTable", callback: "AnimConversion" } as const;
export const gConversion2SpriteTemplate = { tileTag: "ANIM_TAG_CONVERSION", paletteTag: "ANIM_TAG_CONVERSION", oam: "&gOamData_AffineDouble_ObjBlend_8x8", anims: "gConversion2AnimTable", images: 0, affineAnims: "gConversionAffineAnimTable", callback: "AnimConversion2" } as const;
export const gMoonSpriteTemplate = { tileTag: "ANIM_TAG_MOON", paletteTag: "ANIM_TAG_MOON", oam: "&gOamData_AffineOff_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimMoon" } as const;
export const gMoonlightSparkleSpriteTemplate = { tileTag: "ANIM_TAG_GREEN_SPARKLE", paletteTag: "ANIM_TAG_GREEN_SPARKLE", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gMoonlightSparkleAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimMoonlightSparkle" } as const;
export const gHealingBlueStarSpriteTemplate = { tileTag: "ANIM_TAG_BLUE_STAR", paletteTag: "ANIM_TAG_BLUE_STAR", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gHealingBlueStarAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSpriteOnMonPos" } as const;
export const gHornHitSpriteTemplate = { tileTag: "ANIM_TAG_HORN_HIT", paletteTag: "ANIM_TAG_HORN_HIT", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimHornHit" } as const;
export const gSuperFangSpriteTemplate = { tileTag: "ANIM_TAG_FANG_ATTACK", paletteTag: "ANIM_TAG_FANG_ATTACK", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gSuperFangAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSuperFang" } as const;
export const gWavyMusicNotesSpriteTemplate = { tileTag: "ANIM_TAG_MUSIC_NOTES", paletteTag: "ANIM_TAG_MUSIC_NOTES", oam: "&gOamData_AffineDouble_ObjNormal_16x16", anims: "gMusicNotesAnimTable", images: 0, affineAnims: "gMusicNotesAffineAnimTable", callback: "AnimWavyMusicNotes" } as const;
export const gFastFlyingMusicNotesSpriteTemplate = { tileTag: "ANIM_TAG_MUSIC_NOTES", paletteTag: "ANIM_TAG_MUSIC_NOTES", oam: "&gOamData_AffineDouble_ObjNormal_16x16", anims: "gMusicNotesAnimTable", images: 0, affineAnims: "gMusicNotesAffineAnimTable", callback: "AnimFlyingMusicNotes" } as const;
export const gBellyDrumHandSpriteTemplate = { tileTag: "ANIM_TAG_PURPLE_HAND_OUTLINE", paletteTag: "ANIM_TAG_PURPLE_HAND_OUTLINE", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimBellyDrumHand" } as const;
export const gSlowFlyingMusicNotesSpriteTemplate = { tileTag: "ANIM_TAG_MUSIC_NOTES", paletteTag: "ANIM_TAG_MUSIC_NOTES", oam: "&gOamData_AffineDouble_ObjNormal_16x16", anims: "gMusicNotesAnimTable", images: 0, affineAnims: "gSlowFlyingMusicNotesAffineAnimTable", callback: "AnimSlowFlyingMusicNotes" } as const;
export const gThoughtBubbleSpriteTemplate = { tileTag: "ANIM_TAG_THOUGHT_BUBBLE", paletteTag: "ANIM_TAG_THOUGHT_BUBBLE", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gMetronomeThroughtBubbleAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimThoughtBubble" } as const;
export const gMetronomeFingerSpriteTemplate = { tileTag: "ANIM_TAG_FINGER", paletteTag: "ANIM_TAG_FINGER", oam: "&gOamData_AffineDouble_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gMetronomeFingerAffineAnimTable", callback: "AnimMetronomeFinger" } as const;
export const gFollowMeFingerSpriteTemplate = { tileTag: "ANIM_TAG_FINGER", paletteTag: "ANIM_TAG_FINGER", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gMetronomeFingerAffineAnimTable", callback: "AnimFollowMeFinger" } as const;
export const gTauntFingerSpriteTemplate = { tileTag: "ANIM_TAG_FINGER_2", paletteTag: "ANIM_TAG_FINGER_2", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gTauntFingerAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimTauntFinger" } as const;

// ─── Inline palettes (RGB(r,g,b) → RGB888 ×8) ───────────────────────────────
export const gMagicalLeafBlendColors_COLORS = [{r:248,g:152,b:0}, {r:40,g:112,b:248}, {r:176,g:80,b:248}, {r:176,g:168,b:248}] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AnimMovePowderParticle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMovePowderParticle_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimPowerAbsorptionOrb', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSolarBeamBigOrb', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSolarBeamSmallOrb', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSolarBeamSmallOrb_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimAbsorptionOrb', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimAbsorptionOrb_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimHyperBeamOrb', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimHyperBeamOrb_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSporeParticle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSporeParticle_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimPetalDanceBigFlower', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimPetalDanceBigFlower_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimPetalDanceSmallFlower', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimPetalDanceSmallFlower_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimRazorLeafParticle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimRazorLeafParticle_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimRazorLeafParticle_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimLeechSeed', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimLeechSeed_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimLeechSeedSprouts', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTranslateLinearSingleSineWave', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTranslateLinearSingleSineWave_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimConstrictBinding', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimConstrictBinding_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimConstrictBinding_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMimicOrb', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimIngrainRoot', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFrenzyPlantRoot', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimRootFlickerOut', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimIngrainOrb', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimPresent', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimKnockOffItem', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimPresentHealParticle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimItemSteal', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimItemSteal_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimItemSteal_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimItemSteal_Step3', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTrickBag', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTrickBag_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTrickBag_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTrickBag_Step3', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFlyingParticle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFlyingParticle_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimNeedleArmSpike', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimNeedleArmSpike_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSlidingHit', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWhipHit', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFlickeringPunch', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimCuttingSlice', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimAirCutterSlice', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSlice_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimCirclingMusicNote', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimCirclingMusicNote_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimProtect', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimProtect_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMilkBottle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMilkBottle_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMilkBottle_Step2', ret: "void", arity: 3, params: "struct Sprite *, int, int" },
  { name: 'AnimGrantingStars', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSparklingStars', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBubbleBurst', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBubbleBurst_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSleepLetterZ', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSleepLetterZ_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimLockOnTarget', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimLockOnTarget_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimLockOnTarget_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimLockOnTarget_Step3', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimLockOnTarget_Step4', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimLockOnTarget_Step5', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimLockOnTarget_Step6', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimLockOnMoveTarget', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBowMon', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBowMon_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBowMon_Step1_Callback', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBowMon_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBowMon_Step3', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBowMon_Step4', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBowMon_Step3_Callback', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTipMon', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTipMon_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSlashSlice', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFalseSwipeSlice', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFalseSwipeSlice_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFalseSwipeSlice_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFalseSwipeSlice_Step3', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFalseSwipePositionedSlice', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimEndureEnergy', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimEndureEnergy_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSharpenSphere', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSharpenSphere_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimConversion', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimConversion2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimConversion2_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMoon', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMoon_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMoonlightSparkle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMoonlightSparkle_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimHornHit', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimHornHit_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSuperFang', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWavyMusicNotes', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWavyMusicNotes_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWavyMusicNotes_CalcVelocity', ret: "void", arity: 5, params: "s16, s16, s16 *, s16 *, s8" },
  { name: 'AnimFlyingMusicNotes', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFlyingMusicNotes_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBellyDrumHand', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSlowFlyingMusicNotes', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSlowFlyingMusicNotes_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimThoughtBubble', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimThoughtBubble_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMetronomeFinger', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMetronomeFinger_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFollowMeFinger', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFollowMeFinger_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFollowMeFinger_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTauntFinger', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTauntFinger_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTauntFinger_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMoveTwisterParticle_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_MoonlightEndFade_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_LeafBlade_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_DuplicateAndShrinkToPos_Step1', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_DuplicateAndShrinkToPos_Step2', ret: "void", arity: 1, params: "u8" },
  { name: 'LeafBladeGetPosFactor', ret: "s16", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_LeafBlade_Step2', ret: "void", arity: 2, params: "struct Task *, u8" },
  { name: 'AnimTask_LeafBlade_Step2_Callback', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_SkullBashPositionSet', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_SkullBashPositionReset', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_DoubleTeam_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimDoubleTeam', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_CreateSmallSolarBeamOrbs', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SporeDoubleBattle', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetAnimBgAttribute', ret: "else", arity: 3, params: "1, BG_ANIM_PRIORITY, 1" },
  { name: 'AnimMoveTwisterParticle', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'DestroyAnimSprite', ret: "else", arity: 1, params: "sprite" },
  { name: 'AnimTask_ShrinkTargetCopy', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'InitItemBagData', ret: "void", arity: 2, params: "struct Sprite *sprite, s16 c" },
  { name: 'moveAlongLinearPath', ret: "bool8", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimKnockOffOpponentsItem', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimTask_LeafBlade', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_CycleMagicalLeafPal', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimWhipHit_WaitEnd', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UnusedFlickerAnim', ret: "UNUSED", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimTask_SkullBashPosition', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ConversionAlphaBlend', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_Conversion2AlphaBlend', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_HideBattlersHealthbox', ret: "UNUSED", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ShowBattlersHealthbox', ret: "UNUSED", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_MoonlightEndFade', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_DoubleTeam', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ClearGpuRegBits', ret: "else", arity: 2, params: "REG_OFFSET_DISPCNT, DISPCNT_BG2_ON" },
  { name: 'SetGpuRegBits', ret: "else", arity: 2, params: "REG_OFFSET_DISPCNT, DISPCNT_BG2_ON" },
  { name: 'AnimTask_MusicNotesRainbowBlend', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_MusicNotesClearRainbowBlend', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetSpriteNextToMonHead', ret: "void", arity: 2, params: "u8 battler, struct Sprite *sprite" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'battle_anim.h',
  'battle_anim_internal.h',
  'battle_interface.h',
  'decompress.h',
  'gpu_regs.h',
  'graphics.h',
  'main.h',
  'math_util.h',
  'palette.h',
  'random.h',
  'scanline_effect.h',
  'sound.h',
  'trig.h',
  'util.h',
  'constants/rgb.h',
  'constants/songs.h',
] as const;
