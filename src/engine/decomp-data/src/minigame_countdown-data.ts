// AUTO-GENERATED from src/minigame_countdown.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/minigame_countdown.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_STATIC_COUNTDOWN = 8192;
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tFuncSetId_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tSpriteTemplateId_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tSpriteSheetId_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tSpritePalId_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tInterval_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tPriority_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tSubpriority_EXPR = "data[7]";
/** Raw expr: `data[8]` */
export const tNumSprites_EXPR = "data[8]";
/** Raw expr: `data[9]` */
export const tX_EXPR = "data[9]";
/** Raw expr: `data[10]` */
export const tY_EXPR = "data[10]";
/** Raw expr: `data[10]` */
export const tPrevTime_EXPR = "data[10]";
/** Raw expr: `data[11]` */
export const tTimer_EXPR = "data[11]";
/** Raw expr: `data[12]` */
export const tLinkTimer_EXPR = "data[12]";
/** Raw expr: `data[1]` */
export const sInterval_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sAnimNum_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sTaskId_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sId_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sNumberSpriteId_EXPR = "data[5]";
/** Raw expr: `data[2]` */
export const tTilesTag_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tPalTag_EXPR = "data[3]";
/** Raw expr: `data[7]` */
export const tSpriteId1_EXPR = "data[7]";
/** Raw expr: `data[8]` */
export const tSpriteId2_EXPR = "data[8]";
/** Raw expr: `data[9]` */
export const tSpriteId3_EXPR = "data[9]";
/** Raw expr: `data[0]` */
export const sState_EXPR = "data[0]";
/** Raw expr: `data[2]` */
export const sTimer_EXPR = "data[2]";
/** Raw expr: `data[4]` */
export const sYSpeed_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sY_EXPR = "data[5]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_STATE_0 = {
  STATE_IDLE: 1,
  STATE_START: 2,
  STATE_RUN: 3,
  STATE_END: 4,
} as const;
export const ENUM_FUNC_1 = {
  FUNC_INIT: 0,
  FUNC_FREE: 1,
  FUNC_START: 2,
  FUNC_RUN: 3,
} as const;
export const ENUM_ANIM_2 = {
  ANIM_THREE: 0,
  ANIM_TWO: 1,
  ANIM_ONE: 2,
  ANIM_START_LEFT: 3,
  ANIM_START_MID: 4,
  ANIM_START_RIGHT: 5,
} as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_Numbers = { y: 0, affineMode: "ST_OAM_AFFINE_DOUBLE", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x32)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_Start = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x32)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_StaticCountdown = { tileTag: "TAG_STATIC_COUNTDOWN", paletteTag: "TAG_STATIC_COUNTDOWN", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_StaticCountdown", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const spriteTemplate = { oam: "&sOamData_Start", anims: "sAnimTable_Start", affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  's321Start_Static_Pal': { path: 'graphics/link/321start_static.png', ext: '.gbapal', type: 'u16' },
  's321Start_Static_Gfx': { path: 'graphics/link/321start_static.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_StaticCountdown', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_StaticCountdown_Init', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_StaticCountdown_Free', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_StaticCountdown_Start', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_StaticCountdown_Run', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CreateStaticCountdownTask', ret: "UNUSED", arity: 2, params: "u8 funcSetId, u8 taskPriority" },
  { name: 'StartStaticCountdown', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'IsStaticCountdownRunning', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'StaticCountdown_CreateSprites', ret: "void", arity: 2, params: "u8 taskId, s16 *data" },
  { name: 'SpriteCB_StaticCountdown', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'Task_MinigameCountdown', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'RunMinigameCountdownDigitsAnim', ret: "bool32", arity: 1, params: "u8 spriteId" },
  { name: 'IsStartGraphicAnimRunning', ret: "bool32", arity: 1, params: "u8 spriteId" },
  { name: 'Load321StartGfx', ret: "void", arity: 2, params: "u16 tileTag, u16 palTag" },
  { name: 'CreateNumberSprite', ret: "u8", arity: 5, params: "u16 tileTag, u16 palTag, s16 x, s16 y, u8 subpriority" },
  { name: 'CreateStartSprite', ret: "void", arity: 7, params: "u16 tileTag, u16 palTag, s16 x, s16 y, u8 subpriority, s16 *spriteId1, s16 *spriteId2" },
  { name: 'InitStartGraphic', ret: "void", arity: 3, params: "u8 spriteId1, u8 spriteId2, u8 spriteId3" },
  { name: 'SpriteCB_Start', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'StartMinigameCountdown', ret: "void", arity: 5, params: "u16 tilesTag, u16 palTag, s16 x, s16 y, u8 subpriority" },
  { name: 'IsMinigameCountdownRunning', ret: "bool32", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_MinigameCountdown',
  'Task_StaticCountdown',
  'Task_StaticCountdown_Free',
  'Task_StaticCountdown_Init',
  'Task_StaticCountdown_Run',
  'Task_StaticCountdown_Start',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'decompress.h',
  'graphics.h',
  'link.h',
  'link_rfu.h',
  'sound.h',
  'task.h',
  'trig.h',
  'minigame_countdown.h',
  'constants/songs.h',
] as const;
