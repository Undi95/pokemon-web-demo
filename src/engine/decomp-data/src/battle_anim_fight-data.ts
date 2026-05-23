// AUTO-GENERATED from src/battle_anim_fight.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_fight.c
// Generated: 2026-04-26

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sUnusedHumanoidFootSpriteTemplate = { tileTag: "ANIM_TAG_HUMANOID_FOOT", paletteTag: "ANIM_TAG_HUMANOID_FOOT", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimUnusedHumanoidFoot" } as const;
export const gKarateChopSpriteTemplate = { tileTag: "ANIM_TAG_HANDS_AND_FEET", paletteTag: "ANIM_TAG_HANDS_AND_FEET", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_HandsAndFeet", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSlideHandOrFootToTarget" } as const;
export const gJumpKickSpriteTemplate = { tileTag: "ANIM_TAG_HANDS_AND_FEET", paletteTag: "ANIM_TAG_HANDS_AND_FEET", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_HandsAndFeet", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimJumpKick" } as const;
export const gFistFootSpriteTemplate = { tileTag: "ANIM_TAG_HANDS_AND_FEET", paletteTag: "ANIM_TAG_HANDS_AND_FEET", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_HandsAndFeet", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimBasicFistOrFoot" } as const;
export const gFistFootRandomPosSpriteTemplate = { tileTag: "ANIM_TAG_HANDS_AND_FEET", paletteTag: "ANIM_TAG_HANDS_AND_FEET", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_HandsAndFeet", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimFistOrFootRandomPos" } as const;
export const gCrossChopHandSpriteTemplate = { tileTag: "ANIM_TAG_HANDS_AND_FEET", paletteTag: "ANIM_TAG_HANDS_AND_FEET", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "&sAnims_HandsAndFeet[3]", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimCrossChopHand" } as const;
export const gSlidingKickSpriteTemplate = { tileTag: "ANIM_TAG_HANDS_AND_FEET", paletteTag: "ANIM_TAG_HANDS_AND_FEET", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "&sAnims_HandsAndFeet[1]", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSlidingKick" } as const;
export const gSpinningHandOrFootSpriteTemplate = { tileTag: "ANIM_TAG_HANDS_AND_FEET", paletteTag: "ANIM_TAG_HANDS_AND_FEET", oam: "&gOamData_AffineDouble_ObjNormal_32x32", anims: "sAnims_HandsAndFeet", images: 0, affineAnims: "sAffineAnims_SpinningHandOrFoot", callback: "AnimSpinningKickOrPunch" } as const;
export const gMegaPunchKickSpriteTemplate = { tileTag: "ANIM_TAG_HANDS_AND_FEET", paletteTag: "ANIM_TAG_HANDS_AND_FEET", oam: "&gOamData_AffineDouble_ObjNormal_32x32", anims: "sAnims_HandsAndFeet", images: 0, affineAnims: "sAffineAnims_MegaPunchKick", callback: "AnimSpinningKickOrPunch" } as const;
export const gStompFootSpriteTemplate = { tileTag: "ANIM_TAG_HANDS_AND_FEET", paletteTag: "ANIM_TAG_HANDS_AND_FEET", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "&sAnims_HandsAndFeet[1]", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimStompFoot" } as const;
export const gDizzyPunchDuckSpriteTemplate = { tileTag: "ANIM_TAG_DUCK", paletteTag: "ANIM_TAG_DUCK", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimDizzyPunchDuck" } as const;
export const gBrickBreakWallSpriteTemplate = { tileTag: "ANIM_TAG_BLUE_LIGHT_WALL", paletteTag: "ANIM_TAG_BLUE_LIGHT_WALL", oam: "&gOamData_AffineOff_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimBrickBreakWall" } as const;
export const gBrickBreakWallShardSpriteTemplate = { tileTag: "ANIM_TAG_TORN_METAL", paletteTag: "ANIM_TAG_TORN_METAL", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimBrickBreakWallShard" } as const;
export const gSuperpowerOrbSpriteTemplate = { tileTag: "ANIM_TAG_CIRCLE_OF_LIGHT", paletteTag: "ANIM_TAG_CIRCLE_OF_LIGHT", oam: "&gOamData_AffineDouble_ObjBlend_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_SuperpowerOrb", callback: "AnimSuperpowerOrb" } as const;
export const gSuperpowerRockSpriteTemplate = { tileTag: "ANIM_TAG_FLAT_ROCK", paletteTag: "ANIM_TAG_FLAT_ROCK", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSuperpowerRock" } as const;
export const gSuperpowerFireballSpriteTemplate = { tileTag: "ANIM_TAG_METEOR", paletteTag: "ANIM_TAG_METEOR", oam: "&gOamData_AffineOff_ObjNormal_64x64", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimSuperpowerFireball" } as const;
export const gArmThrustHandSpriteTemplate = { tileTag: "ANIM_TAG_HANDS_AND_FEET", paletteTag: "ANIM_TAG_HANDS_AND_FEET", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_HandsAndFeet", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimArmThrustHit" } as const;
export const gRevengeSmallScratchSpriteTemplate = { tileTag: "ANIM_TAG_PURPLE_SCRATCH", paletteTag: "ANIM_TAG_PURPLE_SCRATCH", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_RevengeSmallScratch", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimRevengeScratch" } as const;
export const gRevengeBigScratchSpriteTemplate = { tileTag: "ANIM_TAG_PURPLE_SWIPE", paletteTag: "ANIM_TAG_PURPLE_SWIPE", oam: "&gOamData_AffineOff_ObjNormal_64x64", anims: "sAnims_RevengeBigScratch", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "AnimRevengeScratch" } as const;
export const gFocusPunchFistSpriteTemplate = { tileTag: "ANIM_TAG_HANDS_AND_FEET", paletteTag: "ANIM_TAG_HANDS_AND_FEET", oam: "&gOamData_AffineDouble_ObjNormal_32x32", anims: "sAnims_HandsAndFeet", images: 0, affineAnims: "sAffineAnims_FocusPunchFist", callback: "AnimFocusPunchFist" } as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AnimUnusedHumanoidFoot', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSlideHandOrFootToTarget', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimJumpKick', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBasicFistOrFoot', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFistOrFootRandomPos', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFistOrFootRandomPos_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimCrossChopHand', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimCrossChopHand_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSlidingKick', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSlidingKick_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSpinningKickOrPunch', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimStompFoot', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimStompFoot_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimStompFoot_End', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimDizzyPunchDuck', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBrickBreakWall', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBrickBreakWall_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBrickBreakWallShard', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimBrickBreakWallShard_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSuperpowerOrb', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSuperpowerOrb_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSuperpowerRock', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSuperpowerRock_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSuperpowerRock_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSuperpowerFireball', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimArmThrustHit', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimArmThrustHit_Step', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'AnimRevengeScratch', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimFocusPunchFist', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimSpinningKickOrPunchFinish', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'InitSpritePosToAnimTarget', ret: "else", arity: 2, params: "sprite, TRUE" },
  { name: 'AnimTask_MoveSkyUppercutBg', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_anim.h',
  'gpu_regs.h',
  'random.h',
  'task.h',
  'trig.h',
  'constants/rgb.h',
] as const;
