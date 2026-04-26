// AUTO-GENERATED from src/battle_anim_dragon.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_dragon.c
// Generated: 2026-04-26

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const gOutrageFlameSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_EMBER", paletteTag: "ANIM_TAG_SMALL_EMBER", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_OutrageOverheatFire", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimOutrageFlame" } as const;
export const gDragonBreathFireSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_EMBER", paletteTag: "ANIM_TAG_SMALL_EMBER", oam: "&gOamData_AffineDouble_ObjNormal_32x32", anims: "sAnims_DragonBreathFire", images: 0, affineAnims: "sAffineAnims_DragonBreathFire", callback: "AnimDragonFireToTarget" } as const;
export const gDragonRageFirePlumeSpriteTemplate = { tileTag: "ANIM_TAG_FIRE_PLUME", paletteTag: "ANIM_TAG_FIRE_PLUME", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_DragonRageFirePlume", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimDragonRageFirePlume" } as const;
export const gDragonRageFireSpitSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_EMBER", paletteTag: "ANIM_TAG_SMALL_EMBER", oam: "&gOamData_AffineDouble_ObjNormal_32x32", anims: "sAnims_DragonRageFire", images: 0, affineAnims: "sAffineAnims_DragonRageFire", callback: "AnimDragonFireToTarget" } as const;
export const gDragonDanceOrbSpriteTemplate = { tileTag: "ANIM_TAG_HOLLOW_ORB", paletteTag: "ANIM_TAG_HOLLOW_ORB", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimDragonDanceOrb" } as const;
export const gOverheatFlameSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_EMBER", paletteTag: "ANIM_TAG_SMALL_EMBER", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_OutrageOverheatFire", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimOverheatFlame" } as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u16", name: 'sUnusedOverheatData', isArray: true, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AnimOutrageFlame', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimDragonRageFirePlume', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimDragonFireToTarget', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimDragonDanceOrb', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimDragonDanceOrb_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimOverheatFlame', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimOverheatFlame_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_DragonDanceWaver_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'UpdateDragonDanceScanlineEffect', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'StartDragonFireTranslation', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimTask_DragonDanceWaver', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_anim.h',
  'battle_anim_internal.h',
  'scanline_effect.h',
  'task.h',
  'trig.h',
  'constants/rgb.h',
] as const;
