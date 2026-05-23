// AUTO-GENERATED from src/evolution_graphics.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/evolution_graphics.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_SPARKLE = 1001;
/** Raw expr: `data[3]` */
export const sSpeed_EXPR = "data[3]";
/** Raw expr: `data[5]` */
export const sAmplitude_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const sTrigIdx_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const sTimer_EXPR = "data[7]";
/** Raw expr: `data[1]` */
export const tPalNum_EXPR = "data[1]";
/** Raw expr: `data[15]` */
export const tTimer_EXPR = "data[15]";
/** Raw expr: `data[2]` */
export const tSpecies_EXPR = "data[2]";
/** Raw expr: `data[1]` */
export const tPreEvoSpriteId_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tPostEvoSpriteId_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tPreEvoScale_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tPostEvoScale_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tShowingPostEvo_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tScaleSpeed_EXPR = "data[6]";
/** Raw expr: `data[8]` */
export const tEvoStopped_EXPR = "data[8]";
export const MATRIX_PRE_EVO = 30;
export const MATRIX_POST_EVO = 31;
export const MON_MAX_SCALE = 256;
export const MON_MIN_SCALE = 16;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_EvoSparkle = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(8x8)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sEvoSparkleSpriteTemplate = { tileTag: "TAG_SPARKLE", paletteTag: "TAG_SPARKLE", oam: "&sOamData_EvoSparkle", anims: "sSpriteAnimTable_EvoSparkle", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Sparkle_Dummy" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sEvoSparkle_Pal': { path: 'graphics/misc/evo_sparkle.png', ext: '.gbapal', type: 'u16' },
  'sEvoSparkle_Gfx': { path: 'graphics/misc/evo_sparkle.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sEvoSparkleMatrices: readonly number[] = [960,896,832,768,704,640,576,512,448,384,320,256] as const;
export const sUnused: readonly number[] = [-4,16,-3,48,-2,80,-1,112,1,112,2,80,3,48,4,16] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SpriteCB_Sparkle_Dummy', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'Task_Sparkles_SpiralUpward_Init', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Sparkles_SpiralUpward', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Sparkles_SpiralUpward_End', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Sparkles_ArcDown_Init', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Sparkles_ArcDown', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Sparkles_ArcDown_End', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Sparkles_CircleInward_Init', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Sparkles_CircleInward', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Sparkles_CircleInward_End', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Sparkles_SprayAndFlash_Init', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Sparkles_SprayAndFlash', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Sparkles_SprayAndFlashTrade_Init', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Sparkles_SprayAndFlashTrade', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Sparkles_SprayAndFlash_End', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_CycleEvolutionMonSprite_Init', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_CycleEvolutionMonSprite_TryEnd', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_CycleEvolutionMonSprite_UpdateSize', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'EndOnPreEvoMon', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'EndOnPostEvoMon', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetEvoSparklesMatrices', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_Sparkle_SpiralUpward', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'CreateSparkle_SpiralUpward', ret: "void", arity: 1, params: "u8 trigIdx" },
  { name: 'SpriteCB_Sparkle_ArcDown', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'CreateSparkle_ArcDown', ret: "void", arity: 1, params: "u8 trigIdx" },
  { name: 'SpriteCB_Sparkle_CircleInward', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'CreateSparkle_CircleInward', ret: "void", arity: 2, params: "u8 trigIdx, u8 speed" },
  { name: 'SpriteCB_Sparkle_Spray', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'CreateSparkle_Spray', ret: "void", arity: 1, params: "u8 id" },
  { name: 'LoadEvoSparkleSpriteAndPal', ret: "void", arity: 0, params: "void" },
  { name: 'EvolutionSparkles_SpiralUpward', ret: "u8", arity: 1, params: "u16 palNum" },
  { name: 'DestroyTask', ret: "else", arity: 1, params: "taskId" },
  { name: 'EvolutionSparkles_ArcDown', ret: "u8", arity: 0, params: "void" },
  { name: 'EvolutionSparkles_CircleInward', ret: "u8", arity: 0, params: "void" },
  { name: 'EvolutionSparkles_SprayAndFlash', ret: "u8", arity: 1, params: "u16 species" },
  { name: 'EvolutionSparkles_SprayAndFlash_Trade', ret: "u8", arity: 1, params: "u16 species" },
  { name: 'SpriteCB_EvolutionMonSprite', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'CycleEvolutionMonSprite', ret: "u8", arity: 2, params: "u8 preEvoSpriteId, u8 postEvoSpriteId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_CycleEvolutionMonSprite_Init',
  'Task_CycleEvolutionMonSprite_TryEnd',
  'Task_CycleEvolutionMonSprite_UpdateSize',
  'Task_Sparkles_ArcDown',
  'Task_Sparkles_ArcDown_End',
  'Task_Sparkles_ArcDown_Init',
  'Task_Sparkles_CircleInward',
  'Task_Sparkles_CircleInward_End',
  'Task_Sparkles_CircleInward_Init',
  'Task_Sparkles_SpiralUpward',
  'Task_Sparkles_SpiralUpward_End',
  'Task_Sparkles_SpiralUpward_Init',
  'Task_Sparkles_SprayAndFlash',
  'Task_Sparkles_SprayAndFlashTrade',
  'Task_Sparkles_SprayAndFlashTrade_Init',
  'Task_Sparkles_SprayAndFlash_End',
  'Task_Sparkles_SprayAndFlash_Init',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'evolution_graphics.h',
  'sprite.h',
  'trig.h',
  'random.h',
  'decompress.h',
  'task.h',
  'sound.h',
  'constants/songs.h',
  'palette.h',
  'constants/rgb.h',
] as const;
