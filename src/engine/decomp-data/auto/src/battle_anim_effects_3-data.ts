// AUTO-GENERATED from src/battle_anim_effects_3.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_effects_3.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const IDX_ACTIVE_SPRITES = 2;
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tTimer_EXPR = "data[1]";
/** Raw expr: `data[IDX_ACTIVE_SPRITES]` */
export const tActiveSprites_EXPR = "data[IDX_ACTIVE_SPRITES]";
/** Raw expr: `data[3]` */
export const tNumSquishes_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tBaseX_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tBaseY_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tSubpriority_EXPR = "data[6]";
/** Raw expr: `data[15]` */
export const tBattlerSpriteId_EXPR = "data[15]";
/** Raw expr: `data[0]` */
export const sTimer_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sVelocX_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sVelocY_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sTaskId_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sActiveSpritesIdx_EXPR = "data[4]";
/** Raw expr: `data[2]` */
export const tPairNum_EXPR = "data[2]";
/** Raw expr: `data[5]` */
export const tPairMax_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tDotOffset_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tIsContest_EXPR = "data[7]";
/** Raw expr: `data[11]` */
export const tStartX_EXPR = "data[11]";
/** Raw expr: `data[12]` */
export const tStartY_EXPR = "data[12]";
/** Raw expr: `data[13]` */
export const tEndX_EXPR = "data[13]";
/** Raw expr: `data[14]` */
export const tEndY_EXPR = "data[14]";

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const gScratchSpriteTemplate = { tileTag: "ANIM_TAG_SCRATCH", paletteTag: "ANIM_TAG_SCRATCH", oam: "&gOamData_AffineOff_ObjBlend_32x32", anims: "gScratchAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSpriteOnMonPos" } as const;
export const gBlackSmokeSpriteTemplate = { tileTag: "ANIM_TAG_BLACK_SMOKE", paletteTag: "ANIM_TAG_BLACK_SMOKE", oam: "&gOamData_AffineOff_ObjNormal_32x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimBlackSmoke" } as const;
export const gBlackBallSpriteTemplate = { tileTag: "ANIM_TAG_BLACK_BALL", paletteTag: "ANIM_TAG_BLACK_BALL", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimThrowProjectile" } as const;
export const gOpeningEyeSpriteTemplate = { tileTag: "ANIM_TAG_OPENING_EYE", paletteTag: "ANIM_TAG_OPENING_EYE", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gOpeningEyeAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSpriteOnMonPos" } as const;
export const gWhiteHaloSpriteTemplate = { tileTag: "ANIM_TAG_ROUND_WHITE_HALO", paletteTag: "ANIM_TAG_ROUND_WHITE_HALO", oam: "&gOamData_AffineOff_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimWhiteHalo" } as const;
export const gTealAlertSpriteTemplate = { tileTag: "ANIM_TAG_TEAL_ALERT", paletteTag: "ANIM_TAG_TEAL_ALERT", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimTealAlert" } as const;
export const gMeanLookEyeSpriteTemplate = { tileTag: "ANIM_TAG_EYE", paletteTag: "ANIM_TAG_EYE", oam: "&gOamData_AffineDouble_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gMeanLookEyeAffineAnimTable", callback: "AnimMeanLookEye" } as const;
export const gSpikesSpriteTemplate = { tileTag: "ANIM_TAG_SPIKES", paletteTag: "ANIM_TAG_SPIKES", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSpikes" } as const;
export const gLeerSpriteTemplate = { tileTag: "ANIM_TAG_LEER", paletteTag: "ANIM_TAG_LEER", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gLeerAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimLeer" } as const;
export const gLetterZSpriteTemplate = { tileTag: "ANIM_TAG_LETTER_Z", paletteTag: "ANIM_TAG_LETTER_Z", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "gLetterZAnimTable", images: 0, affineAnims: "gLetterZAffineAnimTable", callback: "AnimLetterZ" } as const;
export const gFangSpriteTemplate = { tileTag: "ANIM_TAG_FANG_ATTACK", paletteTag: "ANIM_TAG_FANG_ATTACK", oam: "&gOamData_AffineDouble_ObjNormal_32x32", anims: "gFangAnimTable", images: 0, affineAnims: "gFangAffineAnimTable", callback: "AnimFang" } as const;
export const gSpotlightSpriteTemplate = { tileTag: "ANIM_TAG_SPOTLIGHT", paletteTag: "ANIM_TAG_SPOTLIGHT", oam: "&gOamData_AffineDouble_ObjNormal_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gSpotlightAffineAnimTable", callback: "AnimSpotlight" } as const;
export const gClappingHandSpriteTemplate = { tileTag: "ANIM_TAG_TAG_HAND", paletteTag: "ANIM_TAG_TAG_HAND", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimClappingHand" } as const;
export const gClappingHand2SpriteTemplate = { tileTag: "ANIM_TAG_TAG_HAND", paletteTag: "ANIM_TAG_TAG_HAND", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimClappingHand2" } as const;
export const gRapidSpinSpriteTemplate = { tileTag: "ANIM_TAG_RAPID_SPIN", paletteTag: "ANIM_TAG_RAPID_SPIN", oam: "&gOamData_AffineOff_ObjNormal_32x16", anims: "gRapidSpinAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimRapidSpin" } as const;
export const gTriAttackTriangleSpriteTemplate = { tileTag: "ANIM_TAG_TRI_ATTACK_TRIANGLE", paletteTag: "ANIM_TAG_TRI_ATTACK_TRIANGLE", oam: "&gOamData_AffineDouble_ObjNormal_64x64", anims: "gTriAttackTriangleAnimTable", images: 0, affineAnims: "gTriAttackTriangleAffineAnimTable", callback: "AnimTriAttackTriangle" } as const;
export const gEclipsingOrbSpriteTemplate = { tileTag: "ANIM_TAG_ECLIPSING_ORB", paletteTag: "ANIM_TAG_ECLIPSING_ORB", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gEclipsingOrbAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSpriteOnMonPos" } as const;
export const gBatonPassPokeballSpriteTemplate = { tileTag: "ANIM_TAG_POKEBALL", paletteTag: "ANIM_TAG_POKEBALL", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimBatonPassPokeball" } as const;
export const gWishStarSpriteTemplate = { tileTag: "ANIM_TAG_GOLD_STARS", paletteTag: "ANIM_TAG_GOLD_STARS", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimWishStar" } as const;
export const gMiniTwinklingStarSpriteTemplate = { tileTag: "ANIM_TAG_GOLD_STARS", paletteTag: "ANIM_TAG_GOLD_STARS", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimMiniTwinklingStar" } as const;
export const gSwallowBlueOrbSpriteTemplate = { tileTag: "ANIM_TAG_BLUE_ORB", paletteTag: "ANIM_TAG_BLUE_ORB", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSwallowBlueOrb" } as const;
export const gGreenStarSpriteTemplate = { tileTag: "ANIM_TAG_GREEN_STAR", paletteTag: "ANIM_TAG_GREEN_STAR", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gGreenStarAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimGreenStar" } as const;
export const gWeakFrustrationAngerMarkSpriteTemplate = { tileTag: "ANIM_TAG_ANGER", paletteTag: "ANIM_TAG_ANGER", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimWeakFrustrationAngerMark" } as const;
export const gSweetScentPetalSpriteTemplate = { tileTag: "ANIM_TAG_PINK_PETAL", paletteTag: "ANIM_TAG_PINK_PETAL", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gSweetScentPetalAnimCmdTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSweetScentPetal" } as const;
export const gPainSplitProjectileSpriteTemplate = { tileTag: "ANIM_TAG_PAIN_SPLIT", paletteTag: "ANIM_TAG_PAIN_SPLIT", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gPainSplitAnimCmdTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimPainSplitProjectile" } as const;
export const gFlatterConfettiSpriteTemplate = { tileTag: "ANIM_TAG_CONFETTI", paletteTag: "ANIM_TAG_CONFETTI", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimFlatterConfetti" } as const;
export const gFlatterSpotlightSpriteTemplate = { tileTag: "ANIM_TAG_SPOTLIGHT", paletteTag: "ANIM_TAG_SPOTLIGHT", oam: "&gOamData_AffineDouble_ObjNormal_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gSpotlightAffineAnimTable", callback: "AnimFlatterSpotlight" } as const;
export const gReversalOrbSpriteTemplate = { tileTag: "ANIM_TAG_BLUE_ORB", paletteTag: "ANIM_TAG_BLUE_ORB", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimReversalOrb" } as const;
export const gYawnCloudSpriteTemplate = { tileTag: "ANIM_TAG_PINK_CLOUD", paletteTag: "ANIM_TAG_PINK_CLOUD", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gYawnCloudAffineAnimTable", callback: "AnimYawnCloud" } as const;
export const gSmokeBallEscapeCloudSpriteTemplate = { tileTag: "ANIM_TAG_PINK_CLOUD", paletteTag: "ANIM_TAG_PINK_CLOUD", oam: "&gOamData_AffineDouble_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gSmokeBallEscapeCloudAffineAnimTable", callback: "AnimSmokeBallEscapeCloud" } as const;
export const gFacadeSweatDropSpriteTemplate = { tileTag: "ANIM_TAG_SWEAT_DROP", paletteTag: "ANIM_TAG_SWEAT_DROP", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimFacadeSweatDrop" } as const;
export const gRoarNoiseLineSpriteTemplate = { tileTag: "ANIM_TAG_NOISE_LINE", paletteTag: "ANIM_TAG_NOISE_LINE", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gRoarNoiseLineAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimRoarNoiseLine" } as const;
export const gGlareEyeDotSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_RED_EYE", paletteTag: "ANIM_TAG_SMALL_RED_EYE", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimGlareEyeDot" } as const;
export const gAssistPawprintSpriteTemplate = { tileTag: "ANIM_TAG_PAW_PRINT", paletteTag: "ANIM_TAG_PAW_PRINT", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimAssistPawprint" } as const;
export const gBarrageBallSpriteTemplate = { tileTag: "ANIM_TAG_RED_BALL", paletteTag: "ANIM_TAG_RED_BALL", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gBarrageBallAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const gSmellingSaltsHandSpriteTemplate = { tileTag: "ANIM_TAG_TAG_HAND", paletteTag: "ANIM_TAG_TAG_HAND", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSmellingSaltsHand" } as const;
export const gSmellingSaltExclamationSpriteTemplate = { tileTag: "ANIM_TAG_SMELLINGSALT_EFFECT", paletteTag: "ANIM_TAG_SMELLINGSALT_EFFECT", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSmellingSaltExclamation" } as const;
export const gHelpingHandClapSpriteTemplate = { tileTag: "ANIM_TAG_TAG_HAND", paletteTag: "ANIM_TAG_TAG_HAND", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimHelpingHandClap" } as const;
export const gForesightMagnifyingGlassSpriteTemplate = { tileTag: "ANIM_TAG_MAGNIFYING_GLASS", paletteTag: "ANIM_TAG_MAGNIFYING_GLASS", oam: "&gOamData_AffineOff_ObjBlend_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimForesightMagnifyingGlass" } as const;
export const gMeteorMashStarSpriteTemplate = { tileTag: "ANIM_TAG_GOLD_STARS", paletteTag: "ANIM_TAG_GOLD_STARS", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimMeteorMashStar" } as const;
export const sUnusedStarBurstSpriteTemplate = { tileTag: "ANIM_TAG_GOLD_STARS", paletteTag: "ANIM_TAG_GOLD_STARS", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimParticleBurst" } as const;
export const gBlockXSpriteTemplate = { tileTag: "ANIM_TAG_X_SIGN", paletteTag: "ANIM_TAG_X_SIGN", oam: "&gOamData_AffineOff_ObjNormal_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimBlockX" } as const;
export const sUnusedItemBagStealSpriteTemplate = { tileTag: "ANIM_TAG_ITEM_BAG", paletteTag: "ANIM_TAG_ITEM_BAG", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimUnusedItemBagSteal" } as const;
export const gKnockOffStrikeSpriteTemplate = { tileTag: "ANIM_TAG_SLAM_HIT_2", paletteTag: "ANIM_TAG_SLAM_HIT_2", oam: "&gOamData_AffineNormal_ObjNormal_64x64", anims: "gKnockOffStrikeAnimTable", images: 0, affineAnims: "gKnockOffStrikeAffineAnimTable", callback: "AnimKnockOffStrike" } as const;
export const gRecycleSpriteTemplate = { tileTag: "ANIM_TAG_RECYCLE", paletteTag: "ANIM_TAG_RECYCLE", oam: "&gOamData_AffineNormal_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gRecycleSpriteAffineAnimTable", callback: "AnimRecycle" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sUnusedPalette': { path: 'graphics/battle_anims/unused/unknown.pal', ext: '.gbapal', type: 'u16' },
};

// ─── Inline palettes (RGB(r,g,b) → RGB888 ×8) ───────────────────────────────
export const gFacadeBlendColors_COLORS = [{r:224,g:200,b:8}, {r:224,g:168,b:40}, {r:216,g:144,b:64}, {r:216,g:112,b:88}, {r:208,g:80,b:120}, {r:208,g:56,b:144}, {r:200,g:24,b:168}, {r:200,g:0,b:200}, {r:200,g:0,b:184}, {r:200,g:0,b:160}, {r:200,g:0,b:128}, {r:200,g:0,b:104}, {r:208,g:0,b:80}, {r:208,g:0,b:48}, {r:208,g:0,b:24}, {r:216,g:0,b:0}, {r:216,g:8,b:0}, {r:216,g:40,b:0}, {r:216,g:72,b:0}, {r:216,g:96,b:0}, {r:224,g:128,b:0}, {r:224,g:152,b:0}, {r:224,g:184,b:0}, {r:232,g:216,b:0}] as const;

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const gMorningSunLightBeamCoordsTable: readonly number[] = [232,24,252,0] as const;
export const gDoomDesireLightBeamCoordTable: readonly number[] = [120,80,40,0] as const;
export const gDoomDesireLightBeamDelayTable: readonly number[] = [0,0,0,0,50] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AnimBlackSmoke', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBlackSmoke_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWhiteHalo', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWhiteHalo_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWhiteHalo_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTealAlert', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMeanLookEye', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMeanLookEye_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMeanLookEye_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMeanLookEye_Step3', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMeanLookEye_Step4', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSpikes', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSpikes_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSpikes_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimLeer', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimLetterZ', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFang', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSpotlight', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSpotlight_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSpotlight_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimClappingHand', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimClappingHand_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimClappingHand2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimRapidSpin', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimRapidSpin_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTriAttackTriangle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBatonPassPokeball', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWishStar', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWishStar_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMiniTwinklingStar', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMiniTwinklingStar_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSwallowBlueOrb', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimGreenStar', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimGreenStar_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimGreenStar_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimGreenStar_Callback', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWeakFrustrationAngerMark', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSweetScentPetal', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSweetScentPetal_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimPainSplitProjectile', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFlatterConfetti', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFlatterConfetti_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFlatterSpotlight', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFlatterSpotlight_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimReversalOrb', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimReversalOrb_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimYawnCloud', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimYawnCloud_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSmokeBallEscapeCloud', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFacadeSweatDrop', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimRoarNoiseLine', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimRoarNoiseLine_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimGlareEyeDot', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimAssistPawprint', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSmellingSaltsHand', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSmellingSaltsHand_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSmellingSaltExclamation', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSmellingSaltExclamation_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimHelpingHandClap', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimHelpingHandClap_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimForesightMagnifyingGlass', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimForesightMagnifyingGlass_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMeteorMashStar', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMeteorMashStar_Step', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimBlockX', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBlockX_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimUnusedItemBagSteal', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimKnockOffStrike', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimKnockOffStrike_Step', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimRecycle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimRecycle_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SetPsychicBackground_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'FadeScreenToWhite_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'RapinSpinMonElevation_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'TormentAttacker_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'TormentAttacker_Callback', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_RockMonBackAndForth_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_FlailMovement_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_RolePlaySilhouette_Step1', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_RolePlaySilhouette_Step2', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_AcidArmor_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_DeepInhale_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_SquishAndSweatDroplets_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateSweatDroplets', ret: "void", arity: 2, params: "u8, bool8" },
  { name: 'AnimTask_FacadeColorBlend_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_GlareEyeDots_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'GetGlareEyeDotCoords', ret: "void", arity: 8, params: "s16, s16, s16, s16, u8, u8, s16 *, s16 *" },
  { name: 'AnimTask_BarrageBall_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_SmellingSaltsSquish_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_HelpingHandAttackerMovement_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_MonToSubstituteDoll', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_OdorSleuthMovementWaitFinish', ret: "void", arity: 1, params: "u8" },
  { name: 'MoveOdorSleuthClone', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_TeeterDanceMovement_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_SlackOffSquish_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_SmokescreenImpact', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SetPsychicBackground', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_FadeScreenToWhite', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_IsTargetPlayerSide', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_IsHealingMove', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_CreateSpotlight', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_RemoveSpotlight', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_RapinSpinMonElevation', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_TormentAttacker', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_DefenseCurlDeformMon', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_StockpileDeformMon', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SpitUpDeformMon', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SwallowDeformMon', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_TransformMon', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetAnimBgAttribute', ret: "else", arity: 3, params: "2, BG_ANIM_MOSAIC, 1" },
  { name: 'AnimTask_IsMonInvisible', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_CastformGfxDataChange', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_MorningSunLightBeam', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_DoomDesireLightBeam', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_StrongFrustrationGrowAndShrink', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_RockMonBackAndForth', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_FlailMovement', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_PainSplitMovement', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_RolePlaySilhouette', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_AcidArmor', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_DeepInhale', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'InitYawnCloudPosition', ret: "void", arity: 6, params: "struct Sprite *sprite, s16 startX, s16 startY, s16 destX, s16 destY, u16 duration" },
  { name: 'UpdateYawnCloudPosition', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimTask_SlideMonForFocusBand_Step2', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SlideMonForFocusBand_Step1', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SlideMonForFocusBand', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SquishAndSweatDroplets', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_FacadeColorBlend', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_StatusClearedEffect', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_GlareEyeDots', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_BarrageBall', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SmellingSaltsSquish', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_HelpingHandAttackerMovement', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_MonToSubstitute', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_OdorSleuthMovement', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_GetReturnPowerLevel', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SnatchOpposingMonMove', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SnatchPartnerMove', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_TeeterDanceMovement', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_GetWeather', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SlackOffSquish', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'battle.h',
  'battle_anim.h',
  'bg.h',
  'contest.h',
  'data.h',
  'decompress.h',
  'dma3.h',
  'gpu_regs.h',
  'graphics.h',
  'palette.h',
  'pokemon_icon.h',
  'random.h',
  'scanline_effect.h',
  'sound.h',
  'sprite.h',
  'task.h',
  'trig.h',
  'util.h',
  'constants/battle_anim.h',
  'constants/rgb.h',
  'constants/songs.h',
  'constants/weather.h',
] as const;
