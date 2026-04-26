// AUTO-GENERATED from src/battle_anim_poison.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_poison.c
// Generated: 2026-04-26

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const gToxicBubbleSpriteTemplate = { tileTag: "ANIM_TAG_TOXIC_BUBBLE", paletteTag: "ANIM_TAG_TOXIC_BUBBLE", oam: "&gOamData_AffineOff_ObjNormal_16x32", anims: "sAnims_ToxicBubble", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSpriteOnMonPos" } as const;
export const gSludgeProjectileSpriteTemplate = { tileTag: "ANIM_TAG_POISON_BUBBLE", paletteTag: "ANIM_TAG_POISON_BUBBLE", oam: "&gOamData_AffineDouble_ObjNormal_16x16", anims: "sAnims_PoisonProjectile", images: 0, affineAnims: "sAffineAnims_PoisonProjectile", callback: "AnimSludgeProjectile" } as const;
export const gAcidPoisonBubbleSpriteTemplate = { tileTag: "ANIM_TAG_POISON_BUBBLE", paletteTag: "ANIM_TAG_POISON_BUBBLE", oam: "&gOamData_AffineDouble_ObjNormal_16x16", anims: "sAnims_PoisonProjectile", images: 0, affineAnims: "sAffineAnims_PoisonProjectile", callback: "AnimAcidPoisonBubble" } as const;
export const gSludgeBombHitParticleSpriteTemplate = { tileTag: "ANIM_TAG_POISON_BUBBLE", paletteTag: "ANIM_TAG_POISON_BUBBLE", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "&sAnims_PoisonProjectile[2]", images: 0, affineAnims: "sAffineAnims_SludgeBombHit", callback: "AnimSludgeBombHitParticle" } as const;
export const gAcidPoisonDropletSpriteTemplate = { tileTag: "ANIM_TAG_POISON_BUBBLE", paletteTag: "ANIM_TAG_POISON_BUBBLE", oam: "&gOamData_AffineDouble_ObjNormal_16x16", anims: "&sAnims_PoisonProjectile[1]", images: 0, affineAnims: "gAffineAnims_Droplet", callback: "AnimAcidPoisonDroplet" } as const;
export const gPoisonBubbleSpriteTemplate = { tileTag: "ANIM_TAG_POISON_BUBBLE", paletteTag: "ANIM_TAG_POISON_BUBBLE", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "sAnims_PoisonProjectile", images: 0, affineAnims: "sAffineAnims_Bubble", callback: "AnimBubbleEffect" } as const;
export const gWaterBubbleSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_BUBBLES", paletteTag: "ANIM_TAG_SMALL_BUBBLES", oam: "&gOamData_AffineNormal_ObjBlend_16x16", anims: "gAnims_WaterBubble", images: 0, affineAnims: "sAffineAnims_Bubble", callback: "AnimBubbleEffect" } as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AnimSludgeProjectile', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSludgeProjectile_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimAcidPoisonBubble', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimAcidPoisonBubble_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSludgeBombHitParticle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSludgeBombHitParticle_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimAcidPoisonDroplet', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBubbleEffect', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBubbleEffect_Step', ret: "void", arity: 1, params: "struct Sprite *" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_anim.h',
  'trig.h',
  'constants/rgb.h',
] as const;
