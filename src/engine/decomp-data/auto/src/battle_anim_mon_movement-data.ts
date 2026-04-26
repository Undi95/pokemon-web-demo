// AUTO-GENERATED from src/battle_anim_mon_movement.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_mon_movement.c
// Generated: 2026-04-26

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const gHorizontalLungeSpriteTemplate = { tileTag: 0, paletteTag: 0, oam: "&gDummyOamData", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "DoHorizontalLunge" } as const;
export const gVerticalDipSpriteTemplate = { tileTag: 0, paletteTag: 0, oam: "&gDummyOamData", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "DoVerticalDip" } as const;
export const gSlideMonToOriginalPosSpriteTemplate = { tileTag: 0, paletteTag: 0, oam: "&gDummyOamData", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SlideMonToOriginalPos" } as const;
export const gSlideMonToOffsetSpriteTemplate = { tileTag: 0, paletteTag: 0, oam: "&gDummyOamData", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SlideMonToOffset" } as const;
export const gSlideMonToOffsetAndBackSpriteTemplate = { tileTag: 0, paletteTag: 0, oam: "&gDummyOamData", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SlideMonToOffsetAndBack" } as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AnimTask_ShakeMon_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ShakeMon2_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ShakeMonInPlace_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ShakeAndSinkMon_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_TranslateMonElliptical_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DoHorizontalLunge', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'ReverseHorizontalLungeDirection', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'DoVerticalDip', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'ReverseVerticalDipDirection', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SlideMonToOriginalPos', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SlideMonToOriginalPos_Step', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SlideMonToOffset', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SlideMonToOffsetAndBack', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SlideMonToOffsetAndBack_End', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimTask_WindUpLunge_Step1', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_WindUpLunge_Step2', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SwayMonStep', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ScaleMonAndRestore_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_RotateMonSpriteToSide_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ShakeTargetBasedOnMovePowerOrDmg_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SlideOffScreen_Step', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ShakeMon', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ShakeMon2', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ShakeMonInPlace', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ShakeAndSinkMon', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_TranslateMonElliptical', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_TranslateMonEllipticalRespectSide', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_WindUpLunge', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SlideOffScreen', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SwayMon', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ScaleMonAndRestore', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_RotateMonSpriteToSide', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_RotateMonToSideAndRestore', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ShakeTargetBasedOnMovePowerOrDmg', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_anim.h',
  'sprite.h',
  'task.h',
  'trig.h',
] as const;
