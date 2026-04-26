// AUTO-GENERATED from src/battle_anim_dark.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_dark.c
// Generated: 2026-04-26

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sUnusedBagStealSpriteTemplate = { tileTag: "ANIM_TAG_TIED_BAG", paletteTag: "ANIM_TAG_TIED_BAG", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimUnusedBagSteal" } as const;
export const gSharpTeethSpriteTemplate = { tileTag: "ANIM_TAG_SHARP_TEETH", paletteTag: "ANIM_TAG_SHARP_TEETH", oam: "&gOamData_AffineNormal_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gAffineAnims_Bite", callback: "AnimBite" } as const;
export const gClampJawSpriteTemplate = { tileTag: "ANIM_TAG_CLAMP", paletteTag: "ANIM_TAG_CLAMP", oam: "&gOamData_AffineNormal_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gAffineAnims_Bite", callback: "AnimBite" } as const;
export const gTearDropSpriteTemplate = { tileTag: "ANIM_TAG_SMALL_BUBBLES", paletteTag: "ANIM_TAG_SMALL_BUBBLES", oam: "&gOamData_AffineNormal_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_TearDrop", callback: "AnimTearDrop" } as const;
export const gClawSlashSpriteTemplate = { tileTag: "ANIM_TAG_CLAW_SLASH", paletteTag: "ANIM_TAG_CLAW_SLASH", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_ClawSlash", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimClawSlash" } as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AnimUnusedBagSteal', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimUnusedBagSteal_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBite', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTearDrop', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimClawSlash', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_AttackerFadeToInvisible_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_AttackerFadeFromInvisible_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimBite_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBite_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTearDrop_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_MoveAttackerMementoShadow_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_MoveTargetMementoShadow_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'DoMementoShadowEffect', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'SetAllBattlersSpritePriority', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_MetallicShine_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_AttackerFadeToInvisible', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetGpuReg', ret: "else", arity: 2, params: "REG_OFFSET_BLDCNT, BLDCNT_TGT2_ALL | BLDCNT_EFFECT_BLEND | BLDCNT_TGT1_BG2" },
  { name: 'AnimTask_AttackerFadeFromInvisible', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_InitAttackerFadeFromInvisible', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_MoveAttackerMementoShadow', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_MoveTargetMementoShadow', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_InitMementoShadow', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_MementoHandleBg', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_MetallicShine', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SetGrayscaleOrOriginalPal', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'GetIsDoomDesireHitTurn', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_anim.h',
  'battle_anim_internal.h',
  'contest.h',
  'gpu_regs.h',
  'graphics.h',
  'palette.h',
  'scanline_effect.h',
  'trig.h',
  'util.h',
  'constants/rgb.h',
] as const;
