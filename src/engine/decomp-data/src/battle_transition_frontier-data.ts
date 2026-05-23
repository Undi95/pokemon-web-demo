// AUTO-GENERATED from src/battle_transition_frontier.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_transition_frontier.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const PALTAG_LOGO_CIRCLES = 11920;
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tTimer_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tBlend_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tFadeTimer_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tCircle1SpriteId_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tCircle2SpriteId_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tCircle3SpriteId_EXPR = "data[6]";
/** Raw expr: `data[0]` */
export const sTargetX_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sTargetY_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sSpeedX_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sSpeedY_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sTimerX_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sTimerY_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const sDelayX_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const sDelayY_EXPR = "data[7]";
/** Raw expr: `data[2]` */
export const sAngle_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sRotateSpeed_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sRadius_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sTargetRadius_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const sRadiusDelta_EXPR = "data[6]";

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_LogoCircles = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_LogoCircles = { tileTag: "PALTAG_LOGO_CIRCLES", paletteTag: "PALTAG_LOGO_CIRCLES", oam: "&sOamData_LogoCircles", anims: "sAnimTable_LogoCircles", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── CompressedSpriteSheet ─────────────────────────────────────────────────────────────
export const sSpriteSheet_LogoCircles = { data: "sLogoCircles_Gfx", size: 6144, tag: "PALTAG_LOGO_CIRCLES" } as const;

// ─── SpritePalette ─────────────────────────────────────────────────────────────
export const sSpritePalette_LogoCircles = { data: "sLogo_Pal", tag: "PALTAG_LOGO_CIRCLES" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sLogoCircles_Gfx': { path: 'graphics/battle_transitions/frontier_logo_circles.png', ext: '.4bpp.lz', type: 'u32' },
  'sLogo_Pal': { path: 'graphics/battle_transitions/frontier_logo_circles.png', ext: '.gbapal', type: 'u16' },
};

// ─── INCBIN paths (raw binary includes) ─────────────────────────────────────
export const INCBIN_SOURCES: Record<string, { path: string; type: string }> = {
  'sLogoCenter_Tilemap': { path: 'graphics/battle_transitions/frontier_logo_center.bin', type: 'u32' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SpriteCB_LogoCircleSlide', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_LogoCircleSpiral', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'WaitForLogoCirclesAnim', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'FadeInCenterLogoCircle', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'Circles_Init', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'CirclesMeet_CreateSprites', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'CirclesMeet_End', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'CirclesCross_CreateSprites', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'CirclesCross_End', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'CirclesAsymmetricSpiral_CreateSprites', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'CirclesAsymmetricSpiral_End', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'CirclesSymmetricSpiral_CreateSprites', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'CirclesSymmetricSpiral_End', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'CirclesMeetInSeq_CreateSprites', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'CirclesMeetInSeq_End', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'CirclesCrossInSeq_CreateSprites', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'CirclesCrossInSeq_End', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'CirclesAsymmetricSpiralInSeq_CreateSprites', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'CirclesAsymmetricSpiralInSeq_End', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'CirclesSymmetricSpiralInSeq_CreateSprites', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'CirclesSymmetricSpiralInSeq_End', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'LoadLogoGfx', ret: "void", arity: 0, params: "void" },
  { name: 'CreateSlidingLogoCircleSprite', ret: "u8", arity: 7, params: "s16 x, s16 y, u8 delayX, u8 delayY, s8 speedX, s8 speedY, u8 spriteAnimNum" },
  { name: 'CreateSpiralingLogoCircleSprite', ret: "u8", arity: 8, params: "s16 x, s16 y, s16 angle, s16 rotateSpeed, s16 radiusStart, s16 radiusEnd, s16 radiusDelta, u8 spriteAnimNum" },
  { name: 'DestroyLogoCirclesGfx', ret: "void", arity: 1, params: "struct Task *task" },
  { name: 'IsLogoCirclesAnimFinished', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'Task_FrontierCirclesMeet', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_FrontierCirclesCross', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_FrontierCirclesAsymmetricSpiral', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_FrontierCirclesSymmetricSpiral', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_FrontierCirclesMeetInSeq', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_FrontierCirclesCrossInSeq', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_FrontierCirclesAsymmetricSpiralInSeq', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_FrontierCirclesSymmetricSpiralInSeq', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_FrontierCirclesAsymmetricSpiral',
  'Task_FrontierCirclesAsymmetricSpiralInSeq',
  'Task_FrontierCirclesCross',
  'Task_FrontierCirclesCrossInSeq',
  'Task_FrontierCirclesMeet',
  'Task_FrontierCirclesMeetInSeq',
  'Task_FrontierCirclesSymmetricSpiral',
  'Task_FrontierCirclesSymmetricSpiralInSeq',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'sprite.h',
  'decompress.h',
  'battle_transition_frontier.h',
  'battle_transition.h',
  'task.h',
  'palette.h',
  'trig.h',
  'bg.h',
  'gpu_regs.h',
  'constants/rgb.h',
] as const;
