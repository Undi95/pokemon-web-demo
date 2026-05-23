// AUTO-GENERATED from src/battle_anim_bug.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_bug.c
// Generated: 2026-04-26

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const gMegahornHornSpriteTemplate = { tileTag: "ANIM_TAG_HORN_HIT_2", paletteTag: "ANIM_TAG_HORN_HIT_2", oam: "&gOamData_AffineDouble_ObjNormal_32x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_MegahornHorn", callback: "AnimMegahornHorn" } as const;
export const gLeechLifeNeedleSpriteTemplate = { tileTag: "ANIM_TAG_NEEDLE", paletteTag: "ANIM_TAG_NEEDLE", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_LeechLifeNeedle", callback: "AnimLeechLifeNeedle" } as const;
export const gWebThreadSpriteTemplate = { tileTag: "ANIM_TAG_WEB_THREAD", paletteTag: "ANIM_TAG_WEB_THREAD", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimTranslateWebThread" } as const;
export const gStringWrapSpriteTemplate = { tileTag: "ANIM_TAG_STRING", paletteTag: "ANIM_TAG_STRING", oam: "&gOamData_AffineOff_ObjNormal_64x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimStringWrap" } as const;
export const gSpiderWebSpriteTemplate = { tileTag: "ANIM_TAG_SPIDER_WEB", paletteTag: "ANIM_TAG_SPIDER_WEB", oam: "&gOamData_AffineDouble_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_SpiderWeb", callback: "AnimSpiderWeb" } as const;
export const gLinearStingerSpriteTemplate = { tileTag: "ANIM_TAG_NEEDLE", paletteTag: "ANIM_TAG_NEEDLE", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimTranslateStinger" } as const;
export const gPinMissileSpriteTemplate = { tileTag: "ANIM_TAG_NEEDLE", paletteTag: "ANIM_TAG_NEEDLE", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimMissileArc" } as const;
export const gIcicleSpearSpriteTemplate = { tileTag: "ANIM_TAG_ICICLE_SPEAR", paletteTag: "ANIM_TAG_ICICLE_SPEAR", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimMissileArc" } as const;
export const gTailGlowOrbSpriteTemplate = { tileTag: "ANIM_TAG_CIRCLE_OF_LIGHT", paletteTag: "ANIM_TAG_CIRCLE_OF_LIGHT", oam: "&gOamData_AffineNormal_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_TailGlowOrb", callback: "AnimTailGlowOrb" } as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AnimMegahornHorn', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimLeechLifeNeedle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTranslateWebThread', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTranslateWebThread_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimStringWrap', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimStringWrap_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSpiderWeb', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSpiderWeb_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSpiderWeb_End', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTranslateStinger', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMissileArc', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMissileArc_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTailGlowOrb', ret: "void", arity: 1, params: "struct Sprite *" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_anim.h',
  'battle_anim_internal.h',
  'gpu_regs.h',
  'trig.h',
  'constants/rgb.h',
] as const;
