// AUTO-GENERATED from src/battle_anim_psychic.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_psychic.c
// Generated: 2026-04-26

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const gPsychUpSpiralSpriteTemplate = { tileTag: "ANIM_TAG_SPIRAL", paletteTag: "ANIM_TAG_SPIRAL", oam: "&gOamData_AffineNormal_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_PsychUpSpiral", callback: "AnimSpriteOnMonPos" } as const;
export const gLightScreenWallSpriteTemplate = { tileTag: "ANIM_TAG_GREEN_LIGHT_WALL", paletteTag: "ANIM_TAG_GREEN_LIGHT_WALL", oam: "&gOamData_AffineOff_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimDefensiveWall" } as const;
export const gReflectWallSpriteTemplate = { tileTag: "ANIM_TAG_BLUE_LIGHT_WALL", paletteTag: "ANIM_TAG_BLUE_LIGHT_WALL", oam: "&gOamData_AffineOff_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimDefensiveWall" } as const;
export const gMirrorCoatWallSpriteTemplate = { tileTag: "ANIM_TAG_RED_LIGHT_WALL", paletteTag: "ANIM_TAG_RED_LIGHT_WALL", oam: "&gOamData_AffineOff_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimDefensiveWall" } as const;
export const gBarrierWallSpriteTemplate = { tileTag: "ANIM_TAG_GRAY_LIGHT_WALL", paletteTag: "ANIM_TAG_GRAY_LIGHT_WALL", oam: "&gOamData_AffineOff_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimDefensiveWall" } as const;
export const gMagicCoatWallSpriteTemplate = { tileTag: "ANIM_TAG_ORANGE_LIGHT_WALL", paletteTag: "ANIM_TAG_ORANGE_LIGHT_WALL", oam: "&gOamData_AffineOff_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimDefensiveWall" } as const;
export const gReflectSparkleSpriteTemplate = { tileTag: "ANIM_TAG_SPARKLE_4", paletteTag: "ANIM_TAG_SPARKLE_4", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_ReflectSparkle", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimWallSparkle" } as const;
export const gSpecialScreenSparkleSpriteTemplate = { tileTag: "ANIM_TAG_SPARKLE_3", paletteTag: "ANIM_TAG_SPARKLE_3", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "sAnims_SpecialScreenSparkle", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimWallSparkle" } as const;
export const gGoldRingSpriteTemplate = { tileTag: "ANIM_TAG_GOLD_RING", paletteTag: "ANIM_TAG_GOLD_RING", oam: "&gOamData_AffineOff_ObjNormal_16x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "TranslateAnimSpriteToTargetMonLocation" } as const;
export const gBentSpoonSpriteTemplate = { tileTag: "ANIM_TAG_BENT_SPOON", paletteTag: "ANIM_TAG_BENT_SPOON", oam: "&gOamData_AffineOff_ObjNormal_16x32", anims: "sAnims_BentSpoon", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimBentSpoon" } as const;
export const gQuestionMarkSpriteTemplate = { tileTag: "ANIM_TAG_AMNESIA", paletteTag: "ANIM_TAG_AMNESIA", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_QuestionMark", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimQuestionMark" } as const;
export const gImprisonOrbSpriteTemplate = { tileTag: "ANIM_TAG_HOLLOW_ORB", paletteTag: "ANIM_TAG_HOLLOW_ORB", oam: "&gOamData_AffineOff_ObjBlend_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const gRedXSpriteTemplate = { tileTag: "ANIM_TAG_X_SIGN", paletteTag: "ANIM_TAG_X_SIGN", oam: "&gOamData_AffineOff_ObjNormal_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimRedX" } as const;
export const gSkillSwapOrbSpriteTemplate = { tileTag: "ANIM_TAG_BLUEGREEN_ORB", paletteTag: "ANIM_TAG_BLUEGREEN_ORB", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_SkillSwapOrb", callback: "AnimSkillSwapOrb" } as const;
export const gLusterPurgeCircleSpriteTemplate = { tileTag: "ANIM_TAG_WHITE_CIRCLE_OF_LIGHT", paletteTag: "ANIM_TAG_WHITE_CIRCLE_OF_LIGHT", oam: "&gOamData_AffineDouble_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_LusterPurgeCircle", callback: "AnimSpriteOnMonPos" } as const;
export const gPsychoBoostOrbSpriteTemplate = { tileTag: "ANIM_TAG_CIRCLE_OF_LIGHT", paletteTag: "ANIM_TAG_CIRCLE_OF_LIGHT", oam: "&gOamData_AffineDouble_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_PsychoBoostOrb", callback: "AnimPsychoBoost" } as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AnimDefensiveWall', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimDefensiveWall_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimDefensiveWall_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimDefensiveWall_Step3', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimDefensiveWall_Step4', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimDefensiveWall_Step5', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimWallSparkle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBentSpoon', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimQuestionMark', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimQuestionMark_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimQuestionMark_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimRedX', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSkillSwapOrb', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimPsychoBoost', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_MeditateStretchAttacker_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_Teleport_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_ImprisonOrbs_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_SkillSwap_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_ExtrasensoryDistortion_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_TransparentCloneGrowAndShrink_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'InitSpritePosToAnimTarget', ret: "else", arity: 2, params: "sprite, respectMonPicOffsets" },
  { name: 'AnimTask_MeditateStretchAttacker', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_Teleport', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ImprisonOrbs', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimRedX_Step', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimTask_SkillSwap', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ExtrasensoryDistortion', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_TransparentCloneGrowAndShrink', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_anim.h',
  'gpu_regs.h',
  'palette.h',
  'sound.h',
  'scanline_effect.h',
  'trig.h',
  'constants/rgb.h',
  'constants/songs.h',
] as const;
