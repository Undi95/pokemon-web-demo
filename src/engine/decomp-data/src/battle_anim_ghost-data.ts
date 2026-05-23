// AUTO-GENERATED from src/battle_anim_ghost.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_ghost.c
// Generated: 2026-04-26

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const gConfuseRayBallBounceSpriteTemplate = { tileTag: "ANIM_TAG_YELLOW_BALL", paletteTag: "ANIM_TAG_YELLOW_BALL", oam: "&gOamData_AffineDouble_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_ConfuseRayBallBounce", callback: "AnimConfuseRayBallBounce" } as const;
export const gConfuseRayBallSpiralSpriteTemplate = { tileTag: "ANIM_TAG_YELLOW_BALL", paletteTag: "ANIM_TAG_YELLOW_BALL", oam: "&gOamData_AffineOff_ObjBlend_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimConfuseRayBallSpiral" } as const;
export const gShadowBallSpriteTemplate = { tileTag: "ANIM_TAG_SHADOW_BALL", paletteTag: "ANIM_TAG_SHADOW_BALL", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_ShadowBall", callback: "AnimShadowBall" } as const;
export const gLickSpriteTemplate = { tileTag: "ANIM_TAG_LICK", paletteTag: "ANIM_TAG_LICK", oam: "&gOamData_AffineOff_ObjNormal_16x32", anims: "sAnims_Lick", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimLick" } as const;
export const gDestinyBondWhiteShadowSpriteTemplate = { tileTag: "ANIM_TAG_WHITE_SHADOW", paletteTag: "ANIM_TAG_WHITE_SHADOW", oam: "&gOamData_AffineOff_ObjBlend_64x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimDestinyBondWhiteShadow" } as const;
export const gCurseNailSpriteTemplate = { tileTag: "ANIM_TAG_NAIL", paletteTag: "ANIM_TAG_NAIL", oam: "&gOamData_AffineOff_ObjBlend_32x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimCurseNail" } as const;
export const gCurseGhostSpriteTemplate = { tileTag: "ANIM_TAG_GHOSTLY_SPIRIT", paletteTag: "ANIM_TAG_GHOSTLY_SPIRIT", oam: "&gOamData_AffineOff_ObjBlend_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimGhostStatusSprite" } as const;
export const gNightmareDevilSpriteTemplate = { tileTag: "ANIM_TAG_DEVIL", paletteTag: "ANIM_TAG_DEVIL", oam: "&gOamData_AffineOff_ObjBlend_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimGhostStatusSprite" } as const;
export const gGrudgeFlameSpriteTemplate = { tileTag: "ANIM_TAG_PURPLE_FLAME", paletteTag: "ANIM_TAG_PURPLE_FLAME", oam: "&gOamData_AffineOff_ObjBlend_16x32", anims: "sAnims_GrudgeFlame", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimGrudgeFlame" } as const;
export const sMonMoveCircularSpriteTemplate = { tileTag: 0, paletteTag: 0, oam: "&gDummyOamData", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimMonMoveCircular" } as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AnimConfuseRayBallBounce', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimConfuseRayBallBounce_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimConfuseRayBallBounce_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'UpdateConfuseRayBallBlend', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimConfuseRayBallSpiral', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimConfuseRayBallSpiral_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_NightShadeClone_Step1', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_NightShadeClone_Step2', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimShadowBall', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimShadowBall_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimLick', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimLick_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_NightmareClone_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SpiteTargetShadow_Step1', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SpiteTargetShadow_Step2', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SpiteTargetShadow_Step3', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimDestinyBondWhiteShadow', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimDestinyBondWhiteShadow_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_DestinyBondWhiteShadow_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_CurseStretchingBlackBg_Step1', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_CurseStretchingBlackBg_Step2', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimCurseNail', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimCurseNail_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimCurseNail_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimCurseNail_End', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimGhostStatusSprite', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimGhostStatusSprite_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_GrudgeFlames_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimGrudgeFlame', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMonMoveCircular', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMonMoveCircular_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_NightShadeClone', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_NightmareClone', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SpiteTargetShadow', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetGpuRegBits', ret: "else", arity: 2, params: "REG_OFFSET_DISPCNT, DISPCNT_BG2_ON" },
  { name: 'ClearGpuRegBits', ret: "else", arity: 2, params: "REG_OFFSET_DISPCNT, DISPCNT_BG2_ON" },
  { name: 'AnimTask_DestinyBondWhiteShadow', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_CurseStretchingBlackBg', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_GrudgeFlames', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_anim.h',
  'gpu_regs.h',
  'palette.h',
  'constants/rgb.h',
  'scanline_effect.h',
  'constants/songs.h',
  'sound.h',
  'trig.h',
  'util.h',
] as const;
