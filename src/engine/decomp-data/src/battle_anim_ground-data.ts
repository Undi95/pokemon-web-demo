// AUTO-GENERATED from src/battle_anim_ground.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_ground.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tDelay_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tTimer_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tMaxTime_EXPR = "data[3]";
/** Raw expr: `data[13]` */
export const tNumBattlers_EXPR = "data[13]";
/** Raw expr: `data[13]` */
export const tInitialX_EXPR = "data[13]";
/** Raw expr: `data[14]` */
export const tHorizOffset_EXPR = "data[14]";
/** Raw expr: `data[15]` */
export const tInitHorizOffset_EXPR = "data[15]";

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const gBonemerangSpriteTemplate = { tileTag: "ANIM_TAG_BONE", paletteTag: "ANIM_TAG_BONE", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_Bonemerang", callback: "AnimBonemerangProjectile" } as const;
export const gSpinningBoneSpriteTemplate = { tileTag: "ANIM_TAG_BONE", paletteTag: "ANIM_TAG_BONE", oam: "&gOamData_AffineNormal_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_SpinningBone", callback: "AnimBoneHitProjectile" } as const;
export const gSandAttackDirtSpriteTemplate = { tileTag: "ANIM_TAG_MUD_SAND", paletteTag: "ANIM_TAG_MUD_SAND", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimDirtScatter" } as const;
export const gMudSlapMudSpriteTemplate = { tileTag: "ANIM_TAG_MUD_SAND", paletteTag: "ANIM_TAG_MUD_SAND", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "sAnims_MudSlapMud", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimDirtScatter" } as const;
export const gMudsportMudSpriteTemplate = { tileTag: "ANIM_TAG_MUD_SAND", paletteTag: "ANIM_TAG_MUD_SAND", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimMudSportDirt" } as const;
export const gDirtPlumeSpriteTemplate = { tileTag: "ANIM_TAG_MUD_SAND", paletteTag: "ANIM_TAG_MUD_SAND", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimDirtPlumeParticle" } as const;
export const gDirtMoundSpriteTemplate = { tileTag: "ANIM_TAG_DIRT_MOUND", paletteTag: "ANIM_TAG_DIRT_MOUND", oam: "&gOamData_AffineOff_ObjNormal_32x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimDigDirtMound" } as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AnimBonemerangProjectile', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBoneHitProjectile', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimDirtScatter', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMudSportDirt', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimDirtPlumeParticle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimDirtPlumeParticle_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimDigDirtMound', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBonemerangProjectile_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBonemerangProjectile_End', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMudSportDirtRising', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimMudSportDirtFalling', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_DigBounceMovement', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_DigEndBounceMovementSetInvisible', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_DigSetVisibleUnderground', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_DigRiseUpFromHole', ret: "void", arity: 1, params: "u8" },
  { name: 'SetDigScanlineEffect', ret: "void", arity: 3, params: "u8, s16, s16" },
  { name: 'AnimTask_ShakePlatforms', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_ShakeBattlers', ret: "void", arity: 1, params: "u8" },
  { name: 'SetBattlersXOffsetForShake', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'WaitForFissureCompletion', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_DigDownMovement', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_DigUpMovement', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_HorizontalShake', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_IsPowerOver99', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_PositionFissureBgOnBattler', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_anim.h',
  'random.h',
  'scanline_effect.h',
  'task.h',
  'trig.h',
  'constants/rgb.h',
] as const;
