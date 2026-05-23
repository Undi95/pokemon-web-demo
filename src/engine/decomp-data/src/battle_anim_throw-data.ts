// AUTO-GENERATED from src/battle_anim_throw.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_anim_throw.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_PARTICLES_POKEBALL = 55020;
export const TAG_PARTICLES_GREATBALL = 55021;
export const TAG_PARTICLES_SAFARIBALL = 55022;
export const TAG_PARTICLES_ULTRABALL = 55023;
export const TAG_PARTICLES_MASTERBALL = 55024;
export const TAG_PARTICLES_NETBALL = 55025;
export const TAG_PARTICLES_DIVEBALL = 55026;
export const TAG_PARTICLES_NESTBALL = 55027;
export const TAG_PARTICLES_REPEATBALL = 55028;
export const TAG_PARTICLES_TIMERBALL = 55029;
export const TAG_PARTICLES_LUXURYBALL = 55030;
export const TAG_PARTICLES_PREMIERBALL = 55031;
/** Raw expr: `data[0]` */
export const tSpriteId_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const sDuration_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sTargetX_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sTargetY_EXPR = "data[2]";
/** Raw expr: `data[1]` */
export const sTargetXArg_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sTargetYArg_EXPR = "data[2]";
/** Raw expr: `data[1]` */
export const sOffsetX_EXPR = "data[1]";
/** Raw expr: `data[3]` */
export const sOffsetY_EXPR = "data[3]";
/** Raw expr: `data[5]` */
export const sAmplitude_EXPR = "data[5]";
/** Raw expr: `data[5]` */
export const sTimer_EXPR = "data[5]";
/** Raw expr: `data[5]` */
export const sTaskId_EXPR = "data[5]";
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[3]` */
export const sState_EXPR = "data[3]";
/** Raw expr: `data[5]` */
export const sPhase_EXPR = "data[5]";
export const BALL_FALLING = 0;
export const BALL_RISING = 1;
/** Raw expr: `data[4]` */
export const sDirection_EXPR = "data[4]";
/** Raw expr: `data[0]` */
export const sFrame_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const sDy_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sDx_EXPR = "data[1]";
/** Raw expr: `data[0]` */
export const tCoeff_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tdCoeff_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tTimer_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tPalOffset_EXPR = "data[3]";
/** Raw expr: `data[10]` */
export const tPaletteLo_EXPR = "data[10]";
/** Raw expr: `data[11]` */
export const tPaletteHi_EXPR = "data[11]";
/** Raw expr: `data[15]` */
export const tBallId_EXPR = "data[15]";
/** Raw expr: `data[0]` */
export const tBattler_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tStarMove_EXPR = "data[1]";
/** Raw expr: `data[10]` */
export const tStarTimer_EXPR = "data[10]";
/** Raw expr: `data[11]` */
export const tStarIdx_EXPR = "data[11]";
/** Raw expr: `data[12]` */
export const tNumStars_EXPR = "data[12]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_BALL_0 = {
  BALL_ROLL_1: 0,
  BALL_PIVOT_1: 1,
  BALL_ROLL_2: 2,
  BALL_PIVOT_2: 3,
  BALL_ROLL_3: 4,
  BALL_NEXT_MOVE: 5,
  BALL_WAIT_NEXT_SHAKE: 6,
} as const;
export const ENUM_MON_1 = {
  MON_SHRINK: 0,
  MON_SHRINK_STEP: 1,
  MON_SHRINK_INVISIBLE: 2,
  MON_SHRINK_FREE: 3,
} as const;
export const ENUM_SHINY_2 = {
  SHINY_STAR_ENCIRCLE: 0,
  SHINY_STAR_DIAGONAL: 1,
} as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sBallParticleSpriteTemplates = [
  { tileTag: "TAG_PARTICLES_POKEBALL", paletteTag: "TAG_PARTICLES_POKEBALL", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "sAnims_BallParticles", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
  { tileTag: "TAG_PARTICLES_GREATBALL", paletteTag: "TAG_PARTICLES_GREATBALL", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "sAnims_BallParticles", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
  { tileTag: "TAG_PARTICLES_SAFARIBALL", paletteTag: "TAG_PARTICLES_SAFARIBALL", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "sAnims_BallParticles", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
  { tileTag: "TAG_PARTICLES_ULTRABALL", paletteTag: "TAG_PARTICLES_ULTRABALL", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "sAnims_BallParticles", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
  { tileTag: "TAG_PARTICLES_MASTERBALL", paletteTag: "TAG_PARTICLES_MASTERBALL", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "sAnims_BallParticles", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
  { tileTag: "TAG_PARTICLES_NETBALL", paletteTag: "TAG_PARTICLES_NETBALL", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "sAnims_BallParticles", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
  { tileTag: "TAG_PARTICLES_DIVEBALL", paletteTag: "TAG_PARTICLES_DIVEBALL", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "sAnims_BallParticles", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
  { tileTag: "TAG_PARTICLES_NESTBALL", paletteTag: "TAG_PARTICLES_NESTBALL", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "sAnims_BallParticles", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
  { tileTag: "TAG_PARTICLES_REPEATBALL", paletteTag: "TAG_PARTICLES_REPEATBALL", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "sAnims_BallParticles", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
  { tileTag: "TAG_PARTICLES_TIMERBALL", paletteTag: "TAG_PARTICLES_TIMERBALL", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "sAnims_BallParticles", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
  { tileTag: "TAG_PARTICLES_LUXURYBALL", paletteTag: "TAG_PARTICLES_LUXURYBALL", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "sAnims_BallParticles", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
  { tileTag: "TAG_PARTICLES_PREMIERBALL", paletteTag: "TAG_PARTICLES_PREMIERBALL", oam: "&gOamData_AffineOff_ObjNormal_8x8", anims: "sAnims_BallParticles", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
] as const;
export const gPokeblockSpriteTemplate = { tileTag: "ANIM_TAG_POKEBLOCK", paletteTag: "ANIM_TAG_POKEBLOCK", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_PokeBlock_Throw" } as const;
export const sSafariRockSpriteTemplate = { tileTag: "ANIM_TAG_ROCKS", paletteTag: "ANIM_TAG_ROCKS", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_SafariRock", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_PokeBlock_Throw" } as const;

// ─── Inline palettes (RGB(r,g,b) → RGB888 ×8) ───────────────────────────────
export const gBallOpenFadeColors_COLORS = [{r:248,g:176,b:240}, {r:128,g:184,b:240}, {r:184,g:240,b:160}, {r:248,g:248,b:120}, {r:184,g:160,b:224}, {r:168,g:248,b:200}, {r:96,g:200,b:240}, {r:240,g:216,b:80}, {r:248,g:192,b:128}, {r:232,g:240,b:240}, {r:248,g:136,b:80}, {r:248,g:72,b:80}, {r:0,g:0,b:0}, {r:8,g:128,b:0}, {r:24,g:0,b:8}, {r:8,g:64,b:0}, {r:0,g:64,b:0}, {r:24,g:64,b:8}, {r:48,g:64,b:8}, {r:32,g:0,b:0}] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'COMMON_DATA', type: "u32", name: 'gMonShrinkDuration', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u16", name: 'gMonShrinkDelta', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u16", name: 'gMonShrinkDistance', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AnimTask_UnusedLevelUpHealthBox_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_FlashHealthboxOnLevelUp_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimTask_ThrowBall_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_Ball_Throw', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_ThrowBall_StandingTrainer_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_PlayerThrow_Wait', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_Ball_Arc', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Ball_Block', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Ball_MonShrink', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Ball_MonShrink_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Ball_Bounce', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Ball_Bounce_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Ball_Release', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Ball_Wobble', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Ball_Wobble_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Ball_Capture', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Ball_Release_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Ball_Capture_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'MakeCaptureStars', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Ball_FadeOut', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'DestroySpriteAfterOneFrame', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'LoadBallParticleGfx', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_CaptureStar_Flicker', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Ball_Release_Wait', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Ball_Block_Step', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'PokeBallOpenParticleAnimation_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'PokeBallOpenParticleAnimation_Step2', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'DestroyBallOpenAnimationParticle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'FanOutBallOpenParticles_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'RepeatBallOpenParticleAnimation_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'PremierBallOpenParticleAnimation_Step1', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'Task_FadeMon_ToBallColor', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_FadeMon_ToNormal', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_FadeMon_ToNormal_Step', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ShinyStars', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_ShinyStars_Encircle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ShinyStars_Diagonal', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'Task_ShinyStars_Wait', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_PokeBlock_LiftArm', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_PokeBlock_Arc', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ThrowPokeBlock_Free', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'PokeBallOpenParticleAnimation', ret: "void", arity: 1, params: "u8" },
  { name: 'GreatBallOpenParticleAnimation', ret: "void", arity: 1, params: "u8" },
  { name: 'SafariBallOpenParticleAnimation', ret: "void", arity: 1, params: "u8" },
  { name: 'UltraBallOpenParticleAnimation', ret: "void", arity: 1, params: "u8" },
  { name: 'MasterBallOpenParticleAnimation', ret: "void", arity: 1, params: "u8" },
  { name: 'DiveBallOpenParticleAnimation', ret: "void", arity: 1, params: "u8" },
  { name: 'RepeatBallOpenParticleAnimation', ret: "void", arity: 1, params: "u8" },
  { name: 'TimerBallOpenParticleAnimation', ret: "void", arity: 1, params: "u8" },
  { name: 'PremierBallOpenParticleAnimation', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_PokeBlock_Throw', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'AnimTask_UnusedLevelUpHealthBox', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'LoadHealthboxPalsForLevelUp', ret: "void", arity: 3, params: "u8 *paletteId1, u8 *paletteId2, u8 battler" },
  { name: 'AnimTask_LoadHealthboxPalsForLevelUp', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'FreeHealthboxPalsForLevelUp', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'AnimTask_FreeHealthboxPalsForLevelUp', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_FlashHealthboxOnLevelUp', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SwitchOutShrinkMon', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SwitchOutBallEffect', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_LoadBallGfx', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_FreeBallGfx', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_IsBallBlockedByTrainer', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ItemIdToBallId', ret: "u8", arity: 1, params: "u16 ballItem" },
  { name: 'AnimTask_ThrowBall', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_ThrowBall_StandingTrainer', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ChangeSpriteAffineAnim', ret: "else", arity: 2, params: "sprite, BALL_ROTATE_RIGHT" },
  { name: 'StartSpriteAffineAnim', ret: "else", arity: 2, params: "sprite, BALL_ROTATE_RIGHT" },
  { name: 'AnimateBallOpenParticles', ret: "u8", arity: 5, params: "u8 x, u8 y, u8 priority, u8 subpriority, u8 ballId" },
  { name: 'IncrBallParticleCount', ret: "void", arity: 0, params: "void" },
  { name: 'DestroySprite', ret: "else", arity: 1, params: "sprite" },
  { name: 'LaunchBallFadeMonTask', ret: "u8", arity: 4, params: "bool8 unfadeLater, u8 spritePalNum, u32 selectedPalettes, u8 ballId" },
  { name: 'AnimTask_SwapMonSpriteToFromSubstitute', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SubstituteFadeToInvisible', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetGpuReg', ret: "else", arity: 2, params: "REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG2 | BLDCNT_EFFECT_BLEND | BLDCNT_TGT2_ALL" },
  { name: 'AnimTask_IsAttackerBehindSubstitute', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SetTargetToEffectBattler', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'TryShinyAnimation', ret: "void", arity: 2, params: "u8 battler, struct Pokemon *mon" },
  { name: 'AnimTask_LoadPokeblockGfx', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_FreePokeblockGfx', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_SetAttackerTargetLeftPos', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_GetTrappedMoveAnimId', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AnimTask_GetBattlersFromArg', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_FadeMon_ToBallColor',
  'Task_FadeMon_ToNormal',
  'Task_FadeMon_ToNormal_Step',
  'Task_PlayerThrow_Wait',
  'Task_ShinyStars',
  'Task_ShinyStars_Wait',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_anim.h',
  'battle_controllers.h',
  'battle_interface.h',
  'decompress.h',
  'dma3.h',
  'gpu_regs.h',
  'graphics.h',
  'm4a.h',
  'main.h',
  'palette.h',
  'pokeball.h',
  'sound.h',
  'sprite.h',
  'task.h',
  'trig.h',
  'util.h',
  'data.h',
  'constants/items.h',
  'constants/moves.h',
  'constants/songs.h',
  'constants/rgb.h',
] as const;
