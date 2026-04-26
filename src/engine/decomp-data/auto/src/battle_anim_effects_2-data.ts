// AUTO-GENERATED from src/battle_anim_effects_2.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_effects_2.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const NUM_MUSIC_NOTE_PAL_TAGS = 3;
/** Raw expr: `data[1]` */
export const sAmplitudeX_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sCircleSpeed_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sMoveSteps_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sAmplitudeY_EXPR = "data[4]";

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sCirclingFingerSpriteTemplate = { tileTag: "ANIM_TAG_FINGER", paletteTag: "ANIM_TAG_FINGER", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimCirclingFinger" } as const;
export const sBouncingMusicNoteSpriteTemplate = { tileTag: "ANIM_TAG_MUSIC_NOTES", paletteTag: "ANIM_TAG_MUSIC_NOTES", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimBouncingMusicNote" } as const;
export const sVibrateBattlerBackSpriteTemplate = { tileTag: 0, paletteTag: 0, oam: "&gDummyOamData", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimVibrateBattlerBack" } as const;
export const sMovingClampSpriteTemplate = { tileTag: "ANIM_TAG_CLAMP", paletteTag: "ANIM_TAG_CLAMP", oam: "&gOamData_AffineNormal_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gAffineAnims_Bite", callback: "AnimMovingClamp" } as const;
export const sSmallExplosionSpriteTemplate = { tileTag: "ANIM_TAG_EXPLOSION_6", paletteTag: "ANIM_TAG_EXPLOSION_6", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "sAnims_SmallExplosion", images: 0, affineAnims: "sAffineAnims_SmallExplosion", callback: "AnimSpriteOnMonPos" } as const;
export const gKinesisZapEnergySpriteTemplate = { tileTag: "ANIM_TAG_ALERT", paletteTag: "ANIM_TAG_ALERT", oam: "&gOamData_AffineOff_ObjNormal_32x16", anims: "gKinesisZapEnergyAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimKinesisZapEnergy" } as const;
export const gSwordsDanceBladeSpriteTemplate = { tileTag: "ANIM_TAG_SWORD", paletteTag: "ANIM_TAG_SWORD", oam: "&gOamData_AffineNormal_ObjBlend_32x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gSwordsDanceBladeAffineAnimTable", callback: "AnimSwordsDanceBlade" } as const;
export const gSonicBoomSpriteTemplate = { tileTag: "ANIM_TAG_AIR_WAVE", paletteTag: "ANIM_TAG_AIR_WAVE", oam: "&gOamData_AffineDouble_ObjBlend_32x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSonicBoomProjectile" } as const;
export const gAirWaveProjectileSpriteTemplate = { tileTag: "ANIM_TAG_AIR_WAVE", paletteTag: "ANIM_TAG_AIR_WAVE", oam: "&gOamData_AffineOff_ObjBlend_32x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimAirWaveProjectile" } as const;
export const gSupersonicRingSpriteTemplate = { tileTag: "ANIM_TAG_GOLD_RING", paletteTag: "ANIM_TAG_GOLD_RING", oam: "&gOamData_AffineDouble_ObjNormal_16x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gGrowingRingAffineAnimTable", callback: "TranslateAnimSpriteToTargetMonLocation" } as const;
export const gScreechRingSpriteTemplate = { tileTag: "ANIM_TAG_PURPLE_RING", paletteTag: "ANIM_TAG_PURPLE_RING", oam: "&gOamData_AffineDouble_ObjNormal_16x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gGrowingRingAffineAnimTable", callback: "TranslateAnimSpriteToTargetMonLocation" } as const;
export const gMetalSoundSpriteTemplate = { tileTag: "ANIM_TAG_METAL_SOUND_WAVES", paletteTag: "ANIM_TAG_METAL_SOUND_WAVES", oam: "&gOamData_AffineDouble_ObjNormal_32x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gGrowingRingAffineAnimTable", callback: "TranslateAnimSpriteToTargetMonLocation" } as const;
export const gWaterPulseRingSpriteTemplate = { tileTag: "ANIM_TAG_BLUE_RING_2", paletteTag: "ANIM_TAG_BLUE_RING_2", oam: "&gOamData_AffineDouble_ObjNormal_16x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gWaterPulseRingAffineAnimTable", callback: "AnimWaterPulseRing" } as const;
export const gEggThrowSpriteTemplate = { tileTag: "ANIM_TAG_LARGE_FRESH_EGG", paletteTag: "ANIM_TAG_LARGE_FRESH_EGG", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimThrowProjectile" } as const;
export const sVoidLinesSpriteTemplate = { tileTag: "ANIM_TAG_VOID_LINES", paletteTag: "ANIM_TAG_VOID_LINES", oam: "&gOamData_AffineOff_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimVoidLines" } as const;
export const gCoinThrowSpriteTemplate = { tileTag: "ANIM_TAG_COIN", paletteTag: "ANIM_TAG_COIN", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "gCoinAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimCoinThrow" } as const;
export const gFallingCoinSpriteTemplate = { tileTag: "ANIM_TAG_COIN", paletteTag: "ANIM_TAG_COIN", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "gCoinAnimTable", images: 0, affineAnims: "gFallingCoinAffineAnimTable", callback: "AnimFallingCoin" } as const;
export const gBulletSeedSpriteTemplate = { tileTag: "ANIM_TAG_SEED", paletteTag: "ANIM_TAG_SEED", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gBulletSeedAffineAnimTable", callback: "AnimBulletSeed" } as const;
export const gRazorWindTornadoSpriteTemplate = { tileTag: "ANIM_TAG_GUST", paletteTag: "ANIM_TAG_GUST", oam: "&gOamData_AffineNormal_ObjNormal_32x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gRazorWindTornadoAffineAnimTable", callback: "AnimRazorWindTornado" } as const;
export const gViceGripSpriteTemplate = { tileTag: "ANIM_TAG_CUT", paletteTag: "ANIM_TAG_CUT", oam: "&gOamData_AffineOff_ObjBlend_32x32", anims: "gViceGripAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimViceGripPincer" } as const;
export const gGuillotineSpriteTemplate = { tileTag: "ANIM_TAG_CUT", paletteTag: "ANIM_TAG_CUT", oam: "&gOamData_AffineOff_ObjBlend_32x32", anims: "gGuillotineAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimGuillotinePincer" } as const;
export const gBreathPuffSpriteTemplate = { tileTag: "ANIM_TAG_BREATH", paletteTag: "ANIM_TAG_BREATH", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gBreathPuffAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimBreathPuff" } as const;
export const gAngerMarkSpriteTemplate = { tileTag: "ANIM_TAG_ANGER", paletteTag: "ANIM_TAG_ANGER", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gAngerMarkAffineAnimTable", callback: "AnimAngerMark" } as const;
export const gPencilSpriteTemplate = { tileTag: "ANIM_TAG_PENCIL", paletteTag: "ANIM_TAG_PENCIL", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimPencil" } as const;
export const gSnoreZSpriteTemplate = { tileTag: "ANIM_TAG_SNORE_Z", paletteTag: "ANIM_TAG_SNORE_Z", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimTravelDiagonally" } as const;
export const gExplosionSpriteTemplate = { tileTag: "ANIM_TAG_EXPLOSION", paletteTag: "ANIM_TAG_EXPLOSION", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gExplosionAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSpriteOnMonPos" } as const;
export const gSoftBoiledEggSpriteTemplate = { tileTag: "ANIM_TAG_BREAKING_EGG", paletteTag: "ANIM_TAG_BREAKING_EGG", oam: "&gOamData_AffineDouble_ObjBlend_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gSoftBoiledEggAffineAnimTable", callback: "AnimSoftBoiledEgg" } as const;
export const gThinRingExpandingSpriteTemplate = { tileTag: "ANIM_TAG_THIN_RING", paletteTag: "ANIM_TAG_THIN_RING", oam: "&gOamData_AffineDouble_ObjNormal_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gThinRingExpandingAffineAnimTable", callback: "AnimSpriteOnMonPos" } as const;
export const gThinRingShrinkingSpriteTemplate = { tileTag: "ANIM_TAG_THIN_RING", paletteTag: "ANIM_TAG_THIN_RING", oam: "&gOamData_AffineDouble_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gThinRingShrinkingAffineAnimTable", callback: "AnimSpriteOnMonPos" } as const;
export const gBlendThinRingExpandingSpriteTemplate = { tileTag: "ANIM_TAG_THIN_RING", paletteTag: "ANIM_TAG_THIN_RING", oam: "&gOamData_AffineDouble_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gThinRingExpandingAffineAnimTable", callback: "AnimBlendThinRing" } as const;
export const gHyperVoiceRingSpriteTemplate = { tileTag: "ANIM_TAG_THIN_RING", paletteTag: "ANIM_TAG_THIN_RING", oam: "&gOamData_AffineDouble_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gHyperVoiceRingAffineAnimTable", callback: "AnimHyperVoiceRing" } as const;
export const gUproarRingSpriteTemplate = { tileTag: "ANIM_TAG_THIN_RING", paletteTag: "ANIM_TAG_THIN_RING", oam: "&gOamData_AffineDouble_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gThinRingExpandingAffineAnimTable", callback: "AnimUproarRing" } as const;
export const gSpeedDustSpriteTemplate = { tileTag: "ANIM_TAG_SPEED_DUST", paletteTag: "ANIM_TAG_SPEED_DUST", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gSpeedDustAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSpeedDust" } as const;
export const gBellSpriteTemplate = { tileTag: "ANIM_TAG_BELL", paletteTag: "ANIM_TAG_BELL", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gBellAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSpriteOnMonPos" } as const;
export const gHealBellMusicNoteSpriteTemplate = { tileTag: "ANIM_TAG_MUSIC_NOTES_2", paletteTag: "ANIM_TAG_MUSIC_NOTES_2", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimHealBellMusicNote" } as const;
export const gMagentaHeartSpriteTemplate = { tileTag: "ANIM_TAG_MAGENTA_HEART", paletteTag: "ANIM_TAG_MAGENTA_HEART", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimMagentaHeart" } as const;
export const gRedHeartProjectileSpriteTemplate = { tileTag: "ANIM_TAG_RED_HEART", paletteTag: "ANIM_TAG_RED_HEART", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimRedHeartProjectile" } as const;
export const gRedHeartBurstSpriteTemplate = { tileTag: "ANIM_TAG_RED_HEART", paletteTag: "ANIM_TAG_RED_HEART", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimParticleBurst" } as const;
export const gRedHeartRisingSpriteTemplate = { tileTag: "ANIM_TAG_RED_HEART", paletteTag: "ANIM_TAG_RED_HEART", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimRedHeartRising" } as const;
export const gHiddenPowerOrbSpriteTemplate = { tileTag: "ANIM_TAG_RED_ORB", paletteTag: "ANIM_TAG_RED_ORB", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gHiddenPowerOrbAffineAnimTable", callback: "AnimOrbitFast" } as const;
export const gHiddenPowerOrbScatterSpriteTemplate = { tileTag: "ANIM_TAG_RED_ORB", paletteTag: "ANIM_TAG_RED_ORB", oam: "&gOamData_AffineDouble_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gHiddenPowerOrbAffineAnimTable", callback: "AnimOrbitScatter" } as const;
export const gSpitUpOrbSpriteTemplate = { tileTag: "ANIM_TAG_RED_ORB_2", paletteTag: "ANIM_TAG_RED_ORB_2", oam: "&gOamData_AffineDouble_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gSpitUpOrbAffineAnimTable", callback: "AnimSpitUpOrb" } as const;
export const gEyeSparkleSpriteTemplate = { tileTag: "ANIM_TAG_EYE_SPARKLE", paletteTag: "ANIM_TAG_EYE_SPARKLE", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gEyeSparkleAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimEyeSparkle" } as const;
export const gAngelSpriteTemplate = { tileTag: "ANIM_TAG_ANGEL", paletteTag: "ANIM_TAG_ANGEL", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gAngelSpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimAngel" } as const;
export const gPinkHeartSpriteTemplate = { tileTag: "ANIM_TAG_PINK_HEART", paletteTag: "ANIM_TAG_PINK_HEART", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimPinkHeart" } as const;
export const gDevilSpriteTemplate = { tileTag: "ANIM_TAG_DEVIL", paletteTag: "ANIM_TAG_DEVIL", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gDevilAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimDevil" } as const;
export const gFurySwipesSpriteTemplate = { tileTag: "ANIM_TAG_SWIPE", paletteTag: "ANIM_TAG_SWIPE", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_FurySwipes", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimFurySwipes" } as const;
export const gMovementWavesSpriteTemplate = { tileTag: "ANIM_TAG_MOVEMENT_WAVES", paletteTag: "ANIM_TAG_MOVEMENT_WAVES", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gMovementWavesAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimMovementWaves" } as const;
export const gJaggedMusicNoteSpriteTemplate = { tileTag: "ANIM_TAG_JAGGED_MUSIC_NOTE", paletteTag: "ANIM_TAG_JAGGED_MUSIC_NOTE", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimJaggedMusicNote" } as const;
export const gPerishSongMusicNoteSpriteTemplate = { tileTag: "ANIM_TAG_MUSIC_NOTES_2", paletteTag: "ANIM_TAG_MUSIC_NOTES_2", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "gMusicNotesAnimTable", images: 0, affineAnims: "gPerishSongMusicNoteAffineAnimTable", callback: "AnimPerishSongMusicNote" } as const;
export const gPerishSongMusicNote2SpriteTemplate = { tileTag: "ANIM_TAG_MUSIC_NOTES_2", paletteTag: "ANIM_TAG_MUSIC_NOTES_2", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "gMusicNotesAnimTable", images: 0, affineAnims: "gPerishSongMusicNoteAffineAnimTable", callback: "AnimPerishSongMusicNote2" } as const;
export const gGuardRingSpriteTemplate = { tileTag: "ANIM_TAG_GUARD_RING", paletteTag: "ANIM_TAG_GUARD_RING", oam: "&gOamData_AffineDouble_ObjBlend_64x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gGuardRingAffineAnimTable", callback: "AnimGuardRing" } as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AnimCirclingFinger', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBouncingMusicNote', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBouncingMusicNote_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimVibrateBattlerBack', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMovingClamp', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMovingClamp_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMovingClamp_End', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimKinesisZapEnergy', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSwordsDanceBlade', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSwordsDanceBlade_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSonicBoomProjectile', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimAirWaveProjectile', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimAirWaveProjectile_Step1', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimAirWaveProjectile_Step2', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimVoidLines', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimVoidLines_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimCoinThrow', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFallingCoin', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFallingCoin_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBulletSeed', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBulletSeed_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBulletSeed_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimRazorWindTornado', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimViceGripPincer', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimViceGripPincer_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimGuillotinePincer', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimGuillotinePincer_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimGuillotinePincer_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimGuillotinePincer_Step3', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBreathPuff', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimAngerMark', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimPencil', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimPencil_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBlendThinRing', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimHyperVoiceRing', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimUproarRing', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSoftBoiledEgg', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSoftBoiledEgg_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSoftBoiledEgg_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSoftBoiledEgg_Step3', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSoftBoiledEgg_Step3_Callback1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSoftBoiledEgg_Step3_Callback2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSoftBoiledEgg_Step4', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSoftBoiledEgg_Step4_Callback', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSpeedDust', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimHealBellMusicNote', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMagentaHeart', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimRedHeartProjectile', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimRedHeartProjectile_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimRedHeartRising', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimRedHeartRising_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimOrbitFast', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimOrbitFast_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimOrbitScatter', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimOrbitScatter_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSpitUpOrb', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSpitUpOrb_Step', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimEyeSparkle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimEyeSparkle_Step', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimAngel', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimPinkHeart', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimDevil', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFurySwipes', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMovementWaves', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMovementWaves_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimJaggedMusicNote', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimJaggedMusicNote_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimPerishSongMusicNote2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimPerishSongMusicNote', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimPerishSongMusicNote_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimPerishSongMusicNote_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimGuardRing', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_Withdraw_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_GrowAndGrayscale_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_Minimize_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateMinimizeSprite', ret: "void", arity: 2, params: "struct Task *, u8" },
  { name: 'ClonedMinizeSprite_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_Splash_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_GrowAndShrink_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_ThrashMoveMonHorizontal_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_ThrashMoveMonVertical_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_SketchDrawMon_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_AttackerStretchAndDisappear_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_ExtremeSpeedImpact_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_ExtremeSpeedMonReappear_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_SpeedDust_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_FakeOut_Step1', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_FakeOut_Step2', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_HeartsBackground_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_ScaryFace_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_UproarDistortion_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimVibrateBattlerBack_Step', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimTask_Withdraw', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AirCutterProjectileStep2', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AirCutterProjectileStep1', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_AirCutterProjectile', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_GrowAndGrayscale', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_Minimize', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_Splash', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_GrowAndShrink', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ThrashMoveMonHorizontal', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ThrashMoveMonVertical', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SketchDrawMon', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimHyperVoiceRing_WaitEnd', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimTask_AttackerStretchAndDisappear', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ExtremeSpeedImpact', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ExtremeSpeedMonReappear', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SpeedDust', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_LoadMusicNotesPals', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_FreeMusicNotesPals', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetMusicNotePalette', ret: "void", arity: 3, params: "struct Sprite *sprite, u8 a, u8 b" },
  { name: 'AnimTask_FakeOut', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_StretchTargetUp', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_StretchAttackerUp', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimParticleBurst', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimTask_HeartsBackground', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ScaryFace', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimLoadCompressedBgTilemapHandleContest', ret: "else", arity: 3, params: "&animBg, &gBattleAnimBgTilemap_ScaryFaceOpponent, FALSE" },
  { name: 'AnimPinkHeart_Step', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'DestroyAnimSprite', ret: "else", arity: 1, params: "sprite" },
  { name: 'AnimTask_UproarDistortion', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_IsFuryCutterHitRight', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_GetFuryCutterHitCount', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'battle_anim.h',
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
