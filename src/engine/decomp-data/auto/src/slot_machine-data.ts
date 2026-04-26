// AUTO-GENERATED from src/slot_machine.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/slot_machine.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const SLOTMACHINE_GFX_TILES = 233;
export const MAX_BET = 3;
export const SYMBOLS_PER_REEL = 21;
export const REEL_SYMBOL_HEIGHT = 24;
/** Raw expr: `(SYMBOLS_PER_REEL * REEL_SYMBOL_HEIGHT)` */
export const REEL_HEIGHT_EXPR = "(SYMBOLS_PER_REEL * REEL_SYMBOL_HEIGHT)";
export const REELTIME_SYMBOLS = 6;
export const REELTIME_SYMBOL_HEIGHT = 20;
/** Raw expr: `(REELTIME_SYMBOLS * REELTIME_SYMBOL_HEIGHT)` */
export const REELTIME_REEL_HEIGHT_EXPR = "(REELTIME_SYMBOLS * REELTIME_SYMBOL_HEIGHT)";
/** Raw expr: `(1 << 0)` */
export const BIAS_REPLAY_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 1)` */
export const BIAS_CHERRY_EXPR = "(1 << 1)";
/** Raw expr: `(1 << 2)` */
export const BIAS_LOTAD_EXPR = "(1 << 2)";
/** Raw expr: `(1 << 3)` */
export const BIAS_AZURILL_EXPR = "(1 << 3)";
/** Raw expr: `(1 << 4)` */
export const BIAS_POWER_EXPR = "(1 << 4)";
/** Raw expr: `(1 << 5)` */
export const BIAS_REELTIME_EXPR = "(1 << 5)";
/** Raw expr: `(1 << 6)` */
export const BIAS_MIXED_7_EXPR = "(1 << 6)";
/** Raw expr: `(1 << 7)` */
export const BIAS_STRAIGHT_7_EXPR = "(1 << 7)";
/** Raw expr: `(BIAS_STRAIGHT_7 | BIAS_MIXED_7)` */
export const BIAS_7_EXPR = "(BIAS_STRAIGHT_7 | BIAS_MIXED_7)";
/** Raw expr: `(BIAS_7 | BIAS_REELTIME)` */
export const BIAS_SPECIAL_EXPR = "(BIAS_7 | BIAS_REELTIME)";
/** Raw expr: `(BIAS_REPLAY | BIAS_CHERRY | BIAS_LOATAD | BIAS_AZURILL | BIAS_POWER)` */
export const BIAS_REGULAR_EXPR = "(BIAS_REPLAY | BIAS_CHERRY | BIAS_LOATAD | BIAS_AZURILL | BIAS_POWER)";
export const MAX_EXTRA_TURNS = 4;
/** Raw expr: `(GFXTAG_7_RED)` */
export const GFXTAG_SYMBOLS_START_EXPR = "(GFXTAG_7_RED)";
/** Raw expr: `(GFXTAG_NUM_0)` */
export const GFXTAG_NUMBERS_START_EXPR = "(GFXTAG_NUM_0)";
export const REEL_NORMAL_SPEED = 8;
export const REEL_HALF_SPEED = 4;
export const REEL_QUARTER_SPEED = 2;
/** Raw expr: `{255, 0, 0}` */
export const DIG_SPRITE_DUMMY_EXPR = "{255, 0, 0}";
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const tMachineId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tExitCallback_EXPR = "data[1]";
/** Raw expr: `data[0]` */
export const tTimer_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tTimer2_EXPR = "data[1]";
/** Raw expr: `data[1]` */
export const tExtraTurns_EXPR = "data[1]";
/** Raw expr: `data[1]` */
export const tShockMagnitude_EXPR = "data[1]";
/** Raw expr: `data[14]` */
export const tMoving_EXPR = "data[14]";
/** Raw expr: `data[15]` */
export const tReelId_EXPR = "data[15]";
/** Raw expr: `data[0]` */
export const sMatchLineId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sFlashing_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sNumFullFlashes_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sDelayTimer_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sColor_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sColorIncr_EXPR = "data[5]";
/** Raw expr: `data[7]` */
export const sAtOriginalColor_EXPR = "data[7]";
/** Raw expr: `data[2]` */
export const sFlashState_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sFlashDir_EXPR = "data[3]";
/** Raw expr: `data[1]` */
export const tNumBolts_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tSpriteId_EXPR = "data[2]";
/** Raw expr: `data[15]` */
export const tAnimating_EXPR = "data[15]";
/** Raw expr: `data[1]` */
export const tReelSpeed_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tTimer3_EXPR = "data[2]";
/** Raw expr: `data[4]` */
export const tRtReelSpeed_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tTimer1_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tExplodeChecks_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const sWaitForAnim_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const sIsPayout_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sDigitMin_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sDigitMax_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sCurNum_EXPR = "data[3]";
/** Raw expr: `data[1]` */
export const sXDir_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sYDir_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sCounter_EXPR = "data[3]";
/** Raw expr: `data[7]` */
export const sDelay_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const sFlashPal_EXPR = "data[0]";
/** Raw expr: `data[5]` */
export const sColorIdx_EXPR = "data[5]";
/** Raw expr: `data[0]` */
export const sState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sMoveY_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sTimer_EXPR = "data[2]";
/** Raw expr: `data[7]` */
export const sAnimFinished_EXPR = "data[7]";
/** Raw expr: `data[6]` */
export const sSpriteId_EXPR = "data[6]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_SYMBOL_0 = {
  SYMBOL_7_RED: 0,
  SYMBOL_7_BLUE: 1,
  SYMBOL_AZURILL: 2,
  SYMBOL_LOTAD: 3,
  SYMBOL_CHERRY: 4,
  SYMBOL_POWER: 5,
  SYMBOL_REPLAY: 6,
} as const;
export const ENUM_GFXTAG_1 = {
  GFXTAG_7_RED: 0,
  GFXTAG_7_BLUE: 1,
  GFXTAG_AZURILL: 2,
  GFXTAG_LOTAD: 3,
  GFXTAG_CHERRY: 4,
  GFXTAG_POWER: 5,
  GFXTAG_REPLAY: 6,
  GFXTAG_NUM_0: 7,
  GFXTAG_NUM_1: 8,
  GFXTAG_NUM_2: 9,
  GFXTAG_NUM_3: 10,
  GFXTAG_NUM_4: 11,
  GFXTAG_NUM_5: 12,
  GFXTAG_NUM_6: 13,
  GFXTAG_NUM_7: 14,
  GFXTAG_NUM_8: 15,
  GFXTAG_NUM_9: 16,
  GFXTAG_REEL_BG: 17,
  GFXTAG_STOP: 18,
  GFXTAG_BONUS: 19,
  GFXTAG_BIG: 20,
  GFXTAG_REG: 21,
} as const;
export const ENUM_PALTAG_2 = {
  PALTAG_REEL: 0,
  PALTAG_REEL_TIME_PIKACHU: 1,
  PALTAG_REEL_TIME_MISC: 2,
  PALTAG_REEL_TIME_MACHINE: 3,
  PALTAG_MISC: 4,
  PALTAG_EXPLOSION: 5,
  PALTAG_DIG_DISPLAY: 6,
  PALTAG_PIKA_AURA: 7,
} as const;
export const ENUM_MATCH_3 = {
  MATCH_CHERRY: 0,
  MATCH_TOPBOT_CHERRY: 1,
  MATCH_REPLAY: 2,
  MATCH_LOTAD: 3,
  MATCH_AZURILL: 4,
  MATCH_POWER: 5,
  MATCH_MIXED_7: 6,
  MATCH_RED_7: 7,
  MATCH_BLUE_7: 8,
  MATCH_NONE: 9,
} as const;
export const ENUM_MATCH_4 = {
  MATCH_MIDDLE_ROW: 0,
  MATCH_TOP_ROW: 1,
  MATCH_BOTTOM_ROW: 2,
  MATCH_NWSE_DIAG: 3,
  MATCH_NESW_DIAG: 4,
  NUM_MATCH_LINES: 5,
} as const;
export const ENUM_LEFT_5 = {
  LEFT_REEL: 0,
  MIDDLE_REEL: 1,
  RIGHT_REEL: 2,
  NUM_REELS: 3,
} as const;
export const ENUM_SLOTTASK_6 = {
  SLOTTASK_UNFADE: 0,
  SLOTTASK_WAIT_FADE: 1,
  SLOTTASK_READY_NEW_SPIN: 2,
  SLOTTASK_READY_NEW_RT_SPIN: 3,
  SLOTTASK_ASK_INSERT_BET: 4,
  SLOTTASK_BET_INPUT: 5,
  SLOTTASK_MSG_NEED_3_COINS: 6,
  SLOTTASK_WAIT_MSG_NEED_3_COINS: 7,
  SLOTTASK_WAIT_INFO_BOX: 8,
  SLOTTASK_START_SPIN: 9,
  SLOTTASK_START_RT_SPIN: 10,
  SLOTTASK_RESET_BIAS_FAILURE: 11,
  SLOTTASK_WAIT_REEL_STOP: 12,
  SLOTTASK_WAIT_ALL_REELS_STOP: 13,
  SLOTTASK_CHECK_MATCHES: 14,
  SLOTTASK_WAIT_PAYOUT: 15,
  SLOTTASK_END_PAYOUT: 16,
  SLOTTASK_MATCHED_POWER: 17,
  SLOTTASK_WAIT_RT_ANIM: 18,
  SLOTTASK_RESET_BET_TILES: 19,
  SLOTTASK_NO_MATCHES: 20,
  SLOTTASK_ASK_QUIT: 21,
  SLOTTASK_HANDLE_QUIT_INPUT: 22,
  SLOTTASK_MSG_MAX_COINS: 23,
  SLOTTASK_WAIT_MSG_MAX_COINS: 24,
  SLOTTASK_MSG_NO_MORE_COINS: 25,
  SLOTTASK_WAIT_MSG_NO_MORE_COINS: 26,
  SLOTTASK_END: 27,
  SLOTTASK_FREE: 28,
} as const;
export const ENUM_PAYOUT_7 = {
  PAYOUT_TASK_INIT: 0,
  PAYOUT_TASK_GIVE_PAYOUT: 1,
  PAYOUT_TASK_FREE: 2,
} as const;
export const ENUM_REEL_8 = {
  REEL_TASK_STILL: 0,
  REEL_TASK_SPIN: 1,
  REEL_TASK_DECIDE_STOP: 2,
  REEL_TASK_STOP_MOVE: 3,
  REEL_TASK_STOP_SHAKE: 4,
} as const;
export const ENUM_PIKABOLT_9 = {
  PIKABOLT_TASK_IDLE: 0,
  PIKABOLT_TASK_ADD_BOLT: 1,
  PIKABOLT_TASK_WAIT_ANIM: 2,
  PIKABOLT_TASK_CLEAR_ALL: 3,
} as const;
export const ENUM_RT_10 = {
  RT_TASK_INIT: 0,
  RT_TASK_WINDOW_ENTER: 1,
  RT_TASK_WAIT_START_PIKA: 2,
  RT_TASK_PIKA_SPEEDUP1: 3,
  RT_TASK_PIKA_SPEEDUP2: 4,
  RT_TASK_WAIT_REEL: 5,
  RT_TASK_CHECK_EXPLODE: 6,
  RT_TASK_LAND: 7,
  RT_TASK_PIKA_REACT: 8,
  RT_TASK_WAIT_CLEAR_POWER: 9,
  RT_TASK_CLOSE_WINDOW_SUCCESS: 10,
  RT_TASK_DESTROY_SPRITES: 11,
  RT_TASK_SET_REEL_SPEED: 12,
  RT_TASK_END_SUCCESS: 13,
  RT_TASK_EXPLODE: 14,
  RT_TASK_WAIT_EXPLODE: 15,
  RT_TASK_WAIT_SMOKE: 16,
  RT_TASK_CLOSE_WINDOW_FAILURE: 17,
  RT_TASK_END_FAILURE: 18,
} as const;
export const ENUM_DIG_11 = {
  DIG_SPRITE_REEL: 0,
  DIG_SPRITE_TIME: 1,
  DIG_SPRITE_INSERT: 2,
  DIG_SPRITE_WIN: 3,
  DIG_SPRITE_LOSE: 4,
  DIG_SPRITE_A_BUTTON: 5,
  DIG_SPRITE_SMOKE: 6,
  DIG_SPRITE_NUMBER: 7,
  DIG_SPRITE_POKE_BALL: 8,
  DIG_SPRITE_D_PAD: 9,
  DIG_SPRITE_STOP_S: 10,
  DIG_SPRITE_STOP_T: 11,
  DIG_SPRITE_STOP_O: 12,
  DIG_SPRITE_STOP_P: 13,
  DIG_SPRITE_BONUS_B: 14,
  DIG_SPRITE_BONUS_O: 15,
  DIG_SPRITE_BONUS_N: 16,
  DIG_SPRITE_BONUS_U: 17,
  DIG_SPRITE_BONUS_S: 18,
  DIG_SPRITE_BIG_B: 19,
  DIG_SPRITE_BIG_I: 20,
  DIG_SPRITE_BIG_G: 21,
  DIG_SPRITE_REG_R: 22,
  DIG_SPRITE_REG_E: 23,
  DIG_SPRITE_REG_G: 24,
  DIG_SPRITE_EMPTY: 25,
  NUM_DIG_DISPLAY_SPRITES: 26,
} as const;
export const ENUM_DIG_12 = {
  DIG_DISPINFO_INSERT: 0,
  DIG_DISPINFO_STOP_S: 1,
  DIG_DISPINFO_STOP_T: 2,
  DIG_DISPINFO_STOP_O: 3,
  DIG_DISPINFO_STOP_P: 4,
  DIG_DISPINFO_A_BUTTON_STOP: 5,
  DIG_DISPINFO_POKE_BALL_ROCKING: 6,
  DIG_DISPINFO_WIN: 7,
  DIG_DISPINFO_LOSE: 8,
  DIG_DISPINFO_SMOKE_NW: 9,
  DIG_DISPINFO_SMOKE_NE: 10,
  DIG_DISPINFO_SMOKE_SW: 11,
  DIG_DISPINFO_SMOKE_SE: 12,
  DIG_DISPINFO_REEL: 13,
  DIG_DISPINFO_TIME: 14,
  DIG_DISPINFO_NUMBER: 15,
  DIG_DISPINFO_DPAD: 16,
  DIG_DISPINFO_POKE_BALL_SHINING: 17,
  DIG_DISPINFO_REG_R: 18,
  DIG_DISPINFO_REG_E: 19,
  DIG_DISPINFO_REG_G: 20,
  DIG_DISPINFO_REG_BONUS_B: 21,
  DIG_DISPINFO_REG_BONUS_O: 22,
  DIG_DISPINFO_REG_BONUS_N: 23,
  DIG_DISPINFO_REG_BONUS_U: 24,
  DIG_DISPINFO_REG_BONUS_S: 25,
  DIG_DISPINFO_BIG_B: 26,
  DIG_DISPINFO_BIG_I: 27,
  DIG_DISPINFO_BIG_G: 28,
  DIG_DISPINFO_BIG_BONUS_B: 29,
  DIG_DISPINFO_BIG_BONUS_O: 30,
  DIG_DISPINFO_BIG_BONUS_N: 31,
  DIG_DISPINFO_BIG_BONUS_U: 32,
  DIG_DISPINFO_BIG_BONUS_S: 33,
  DIG_DISPINFO_A_BUTTON_START: 34,
} as const;
export const ENUM_DIG_13 = {
  DIG_DISPLAY_INSERT_BET: 0,
  DIG_DISPLAY_STOP_REEL: 1,
  DIG_DISPLAY_WIN: 2,
  DIG_DISPLAY_LOSE: 3,
  DIG_DISPLAY_REEL_TIME: 4,
  DIG_DISPLAY_BONUS_REG: 5,
  DIG_DISPLAY_BONUS_BIG: 6,
} as const;
export const ENUM_WIN_14 = {
  WIN_MSG: 0,
  WIN_INFO: 1,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplates = { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4, paletteNum: 15, baseBlock: 404 } as const;
export const sWindowTemplate_InfoBox = { bg: 0, tilemapLeft: 1, tilemapTop: 3, width: 20, height: 13, paletteNum: 13, baseBlock: 1 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 28, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 1, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 1, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOam_8x8 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(8x8)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOam_8x16 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(8x16)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOam_16x16 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOam_16x32 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x32)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOam_32x32 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x32)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOam_32x64 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x64)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOam_64x32 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x32)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOam_64x64 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_ReelSymbol = { tileTag: "GFXTAG_SYMBOLS_START", paletteTag: "PALTAG_REEL", oam: "&sOam_32x32", anims: "sAnims_SingleFrame", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_ReelSymbol" } as const;
export const sSpriteTemplate_CoinNumber = { tileTag: "GFXTAG_NUMBERS_START", paletteTag: "PALTAG_MISC", oam: "&sOam_8x16", anims: "sAnims_SingleFrame", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_CoinNumber" } as const;
export const sSpriteTemplate_ReelBackground = { tileTag: "GFXTAG_REEL_BG", paletteTag: "PALTAG_REEL", oam: "&sOam_64x64", anims: "sAnims_SingleFrame", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_ReelTimePikachu = { tileTag: "TAG_NONE", paletteTag: "PALTAG_REEL_TIME_PIKACHU", oam: "&sOam_64x64", anims: "sAnims_ReelTimePikachu", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_ReelTimePikachu" } as const;
export const sSpriteTemplate_ReelTimeMachineAntennae = { tileTag: "TAG_NONE", paletteTag: "PALTAG_REEL_TIME_MISC", oam: "&sOam_8x16", anims: "sAnims_SingleFrame", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_ReelTimeMachine = { tileTag: "TAG_NONE", paletteTag: "PALTAG_REEL_TIME_MACHINE", oam: "&sOam_8x16", anims: "sAnims_SingleFrame", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_BrokenReelTimeMachine = { tileTag: "TAG_NONE", paletteTag: "PALTAG_REEL_TIME_MACHINE", oam: "&sOam_8x16", anims: "sAnims_SingleFrame", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_ReelTimeNumbers = { tileTag: "TAG_NONE", paletteTag: "PALTAG_MISC", oam: "&sOam_16x16", anims: "sAnims_ReelTimeNumbers", images: "sImageTable_ReelTimeNumbers", affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_ReelTimeNumbers" } as const;
export const sSpriteTemplate_ReelTimeShadow = { tileTag: "TAG_NONE", paletteTag: "PALTAG_MISC", oam: "&sOam_16x16", anims: "sAnims_SingleFrame", images: "sImageTable_ReelTimeShadow", affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_ReelTimeNumberGap = { tileTag: "TAG_NONE", paletteTag: "PALTAG_MISC", oam: "&sOam_16x16", anims: "sAnims_SingleFrame", images: "sImageTable_ReelTimeNumberGap", affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_ReelTimeBolt = { tileTag: "TAG_NONE", paletteTag: "PALTAG_MISC", oam: "&sOam_16x32", anims: "sAnims_ReelTimeBolt", images: "sImageTable_ReelTimeBolt", affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_ReelTimeBolt" } as const;
export const sSpriteTemplate_ReelTimePikachuAura = { tileTag: "TAG_NONE", paletteTag: "PALTAG_PIKA_AURA", oam: "&sOam_32x64", anims: "sAnims_SingleFrame", images: "sImageTable_ReelTimePikachuAura", affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_ReelTimePikachuAura" } as const;
export const sSpriteTemplate_ReelTimeExplosion = { tileTag: "TAG_NONE", paletteTag: "PALTAG_EXPLOSION", oam: "&sOam_32x32", anims: "sAnims_ReelTimeExplosion", images: "sImageTable_ReelTimeExplosion", affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_ReelTimeExplosion" } as const;
export const sSpriteTemplate_ReelTimeDuck = { tileTag: "TAG_NONE", paletteTag: "PALTAG_MISC", oam: "&sOam_8x8", anims: "sAnims_ReelTimeDuck", images: "sImageTable_ReelTimeDuck", affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_ReelTimeDuck" } as const;
export const sSpriteTemplate_ReelTimeSmoke = { tileTag: "TAG_NONE", paletteTag: "PALTAG_MISC", oam: "&sOam_16x16", anims: "sAnims_SingleFrame", images: "sImageTable_ReelTimeSmoke", affineAnims: "sAffineAnims_ReelTimeSmoke", callback: "SpriteCB_ReelTimeSmoke" } as const;
export const sSpriteTemplate_DigitalDisplay_Reel = { tileTag: "TAG_NONE", paletteTag: "PALTAG_DIG_DISPLAY", oam: "&sOam_8x8", anims: "sAnims_SingleFrame", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DigitalDisplay_Time = { tileTag: "TAG_NONE", paletteTag: "PALTAG_DIG_DISPLAY", oam: "&sOam_8x8", anims: "sAnims_SingleFrame", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DigitalDisplay_Insert = { tileTag: "TAG_NONE", paletteTag: "PALTAG_DIG_DISPLAY", oam: "&sOam_8x8", anims: "sAnims_SingleFrame", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DigitalDisplay_Stop = { tileTag: "GFXTAG_STOP", paletteTag: "PALTAG_DIG_DISPLAY", oam: "&sOam_8x8", anims: "sAnims_SingleFrame", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DigitalDisplay_Win = { tileTag: "TAG_NONE", paletteTag: "PALTAG_DIG_DISPLAY", oam: "&sOam_64x32", anims: "sAnims_SingleFrame", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DigitalDisplay_Lose = { tileTag: "TAG_NONE", paletteTag: "PALTAG_DIG_DISPLAY", oam: "&sOam_64x32", anims: "sAnims_SingleFrame", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DigitalDisplay_Bonus = { tileTag: "GFXTAG_BONUS", paletteTag: "PALTAG_DIG_DISPLAY", oam: "&sOam_8x8", anims: "sAnims_SingleFrame", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DigitalDisplay_Big = { tileTag: "GFXTAG_BIG", paletteTag: "PALTAG_DIG_DISPLAY", oam: "&sOam_8x8", anims: "sAnims_SingleFrame", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DigitalDisplay_Reg = { tileTag: "GFXTAG_REG", paletteTag: "PALTAG_DIG_DISPLAY", oam: "&sOam_8x8", anims: "sAnims_SingleFrame", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DigitalDisplay_AButton = { tileTag: "TAG_NONE", paletteTag: "PALTAG_DIG_DISPLAY", oam: "&sOam_32x32", anims: "sAnims_DigitalDisplay_AButton", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DigitalDisplay_Smoke = { tileTag: "TAG_NONE", paletteTag: "PALTAG_DIG_DISPLAY", oam: "&sOam_8x8", anims: "sAnims_SingleFrame", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DigitalDisplay_Number = { tileTag: "TAG_NONE", paletteTag: "PALTAG_DIG_DISPLAY", oam: "&sOam_16x16", anims: "sAnims_DigitalDisplay_Number", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DigitalDisplay_Pokeball = { tileTag: "TAG_NONE", paletteTag: "PALTAG_DIG_DISPLAY", oam: "&sOam_8x8", anims: "sAnims_DigitalDisplay_Pokeball", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_DigitalDisplay_DPad = { tileTag: "TAG_NONE", paletteTag: "PALTAG_DIG_DISPLAY", oam: "&sOam_8x8", anims: "sAnims_DigitalDisplay_DPad", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_PikaPowerBolt = { tileTag: "TAG_NONE", paletteTag: "PALTAG_MISC", oam: "&sOam_8x8", anims: "sAnims_SingleFrame", images: "sImageTable_PikaPowerBolt", affineAnims: "sAffineAnims_PikaPowerBolt", callback: "SpriteCB_PikaPowerBolt" } as const;

// ─── SpriteSheet ─────────────────────────────────────────────────────────────
export const sSlotMachineSpriteSheets = [
  { data: "gSlotMachineReelSymbol1Tiles", size: 512, tag: "GFXTAG_7_RED" },
  { data: "gSlotMachineReelSymbol2Tiles", size: 512, tag: "GFXTAG_7_BLUE" },
  { data: "gSlotMachineReelSymbol3Tiles", size: 512, tag: "GFXTAG_AZURILL" },
  { data: "gSlotMachineReelSymbol4Tiles", size: 512, tag: "GFXTAG_LOTAD" },
  { data: "gSlotMachineReelSymbol5Tiles", size: 512, tag: "GFXTAG_CHERRY" },
  { data: "gSlotMachineReelSymbol6Tiles", size: 512, tag: "GFXTAG_POWER" },
  { data: "gSlotMachineReelSymbol7Tiles", size: 512, tag: "GFXTAG_REPLAY" },
  { data: "gSlotMachineNumber0Tiles", size: 64, tag: "GFXTAG_NUM_0" },
  { data: "gSlotMachineNumber1Tiles", size: 64, tag: "GFXTAG_NUM_1" },
  { data: "gSlotMachineNumber2Tiles", size: 64, tag: "GFXTAG_NUM_2" },
  { data: "gSlotMachineNumber3Tiles", size: 64, tag: "GFXTAG_NUM_3" },
  { data: "gSlotMachineNumber4Tiles", size: 64, tag: "GFXTAG_NUM_4" },
  { data: "gSlotMachineNumber5Tiles", size: 64, tag: "GFXTAG_NUM_5" },
  { data: "gSlotMachineNumber6Tiles", size: 64, tag: "GFXTAG_NUM_6" },
  { data: "gSlotMachineNumber7Tiles", size: 64, tag: "GFXTAG_NUM_7" },
  { data: "gSlotMachineNumber8Tiles", size: 64, tag: "GFXTAG_NUM_8" },
  { data: "gSlotMachineNumber9Tiles", size: 64, tag: "GFXTAG_NUM_9" },
  { data: 0, size: 512, tag: "GFXTAG_STOP" },
  { data: 0, size: 512, tag: "GFXTAG_BONUS" },
  { data: 0, size: 768, tag: "GFXTAG_BIG" },
  { data: 0, size: 768, tag: "GFXTAG_REG" },
] as const;

// ─── SpritePalette ─────────────────────────────────────────────────────────────
export const sSlotMachineSpritePalettes = [
  { data: "gSlotMachineReelSymbols_Pal", tag: "PALTAG_REEL" },
  { data: "gSlotMachineReelTimePikachu_Pal", tag: "PALTAG_REEL_TIME_PIKACHU" },
  { data: "gSlotMachineReelTimeMisc_Pal", tag: "PALTAG_REEL_TIME_MISC" },
  { data: "gSlotMachineReelTimeMachine_Pal", tag: "PALTAG_REEL_TIME_MACHINE" },
  { data: "gSlotMachineMisc_Pal", tag: "PALTAG_MISC" },
  { data: "gSlotMachineReelTimeExplosion_Pal", tag: "PALTAG_EXPLOSION" },
  { data: "gSlotMachineDigitalDisplay_Pal", tag: "PALTAG_DIG_DISPLAY" },
  { data: "gSlotMachineMisc_Pal", tag: "PALTAG_PIKA_AURA" },
] as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sFlashingLightsInside_Pal': { path: 'graphics/slot_machine/flashing_lights_inside.pal', ext: '.gbapal', type: 'u16' },
  'sFlashingLightsMiddle_Pal': { path: 'graphics/slot_machine/flashing_lights_middle.pal', ext: '.gbapal', type: 'u16' },
  'sFlashingLightsOutside_Pal': { path: 'graphics/slot_machine/flashing_lights_outside.pal', ext: '.gbapal', type: 'u16' },
  'sPokeballShining0_Pal': { path: 'graphics/slot_machine/pokeball_shining_0.pal', ext: '.gbapal', type: 'u16' },
  'sPokeballShining1_Pal': { path: 'graphics/slot_machine/pokeball_shining_1.pal', ext: '.gbapal', type: 'u16' },
  'sPokeballShining2_Pal': { path: 'graphics/slot_machine/pokeball_shining_2.pal', ext: '.gbapal', type: 'u16' },
  'sReelTimeGfx': { path: 'graphics/slot_machine/reel_time_gfx.4bpp', ext: '.lz', type: 'u32' },
};

// ─── INCBIN paths (raw binary includes) ─────────────────────────────────────
export const INCBIN_SOURCES: Record<string, { path: string; type: string }> = {
  'sReelTimeWindow_Tilemap': { path: 'graphics/slot_machine/reel_time_window.bin', type: 'u16' },
};

// ─── Inline palettes (RGB(r,g,b) → RGB888 ×8) ───────────────────────────────
export const sUnusedColors_COLORS = [{r:216,g:216,b:216}, {r:64,g:88,b:208}, {r:88,g:168,b:104}, {r:248,g:248,b:248}, {r:128,g:208,b:168}, {r:0,g:176,b:248}, {r:208,g:168,b:0}, {r:208,g:168,b:0}, {r:232,g:120,b:0}, {r:232,g:120,b:0}] as const;
export const sMiddleRowLit_Pal_COLORS = [{r:136,g:224,b:248}] as const;
export const sTopRowLit_Pal_COLORS = [{r:248,g:232,b:128}] as const;
export const sBottomRowt_Pal_COLORS = [{r:248,g:232,b:128}] as const;
export const sNWSEDiagLit_Pal_COLORS = [{r:248,g:168,b:144}] as const;
export const sNESWDiagLit_Pal_COLORS = [{r:248,g:168,b:144}] as const;

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sReelStopShocks: readonly number[] = [2,4,4,4,8] as const;
export const sReelTimePikachuAnimIds: readonly number[] = [1,1,2,2] as const;
export const sReelTimeBoltDelays: readonly number[] = [64,48,24,8] as const;
export const sPikachuAuraFlashDelays: readonly number[] = [10,8,6,4] as const;
export const colors: readonly number[] = [16,0] as const;
export const sp: readonly number[] = [0,64,128,192] as const;
export const targetX: readonly number[] = [4,-4,4,-4] as const;
export const targetY: readonly number[] = [4,4,-4,-4] as const;
export const letterXOffset: readonly number[] = [0,-40,0,0,48,0,24,0] as const;
export const letterYOffset: readonly number[] = [-32,0,-32,-48,0,-48,0,-48] as const;
export const letterDelay: readonly number[] = [16,12,16,0,0,4,8,8] as const;
export const sp0: readonly number[] = [160,192,224,104,80,64,48,24] as const;
export const sReelTimeSymbols: readonly number[] = [1,0,5,4,3,2] as const;
export const sReelTimeExplodeProbability: readonly number[] = [128,175,200,225,256] as const;
export const sQuarterSpeed_ProbabilityBoost: readonly number[] = [0,5,10,15,20] as const;
export const sEmptyTilemap: readonly number[] = [0] as const;

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sSlotTasks = ['SlotTask_UnfadeScreen', 'SlotTask_WaitUnfade', 'SlotTask_ReadyNewSpin', 'SlotTask_ReadyNewReelTimeSpin', 'SlotTask_AskInsertBet', 'SlotTask_HandleBetInput', 'SlotTask_PrintMsg_Need3Coins', 'SlotTask_WaitMsg_Need3Coins', 'SlotTask_WaitInfoBox', 'SlotTask_StartSpin', 'SlotTask_StartReelTimeSpin', 'SlotTask_ResetBiasFailure', 'SlotTask_WaitReelStop', 'SlotTask_WaitAllReelsStop', 'SlotTask_CheckMatches', 'SlotTask_WaitPayout', 'SlotTask_EndPayout', 'SlotTask_MatchedPower', 'SlotTask_WaitReelTimeAnim', 'SlotTask_ResetBetTiles', 'SlotTask_NoMatches', 'SlotTask_AskQuit', 'SlotTask_HandleQuitInput', 'SlotTask_PrintMsg_MaxCoins', 'SlotTask_WaitMsg_MaxCoins', 'SlotTask_PrintMsg_NoMoreCoins', 'SlotTask_WaitMsg_NoMoreCoins', 'SlotTask_EndGame', 'SlotTask_FreeDataStructures'] as const;
export const sPayoutTasks = ['PayoutTask_Init', 'PayoutTask_GivePayout', 'PayoutTask_Free'] as const;
export const sReelTasks = ['ReelTask_StayStill', 'ReelTask_Spin', 'ReelTask_DecideStop', 'ReelTask_MoveToStop', 'ReelTask_ShakingStop'] as const;
export const sReelStopButtonTasks = ['StopReelButton_Press', 'StopReelButton_Wait', 'StopReelButton_Unpress'] as const;
export const sPikaPowerBoltTasks = ['PikaPowerBolt_Idle', 'PikaPowerBolt_AddBolt', 'PikaPowerBolt_WaitAnim', 'PikaPowerBolt_ClearAll'] as const;
export const sReelTimeTasks = ['ReelTime_Init', 'ReelTime_WindowEnter', 'ReelTime_WaitStartPikachu', 'ReelTime_PikachuSpeedUp1', 'ReelTime_PikachuSpeedUp2', 'ReelTime_WaitReel', 'ReelTime_CheckExplode', 'ReelTime_LandOnOutcome', 'ReelTime_PikachuReact', 'ReelTime_WaitClearPikaPower', 'ReelTime_CloseWindow', 'ReelTime_DestroySprites', 'ReelTime_SetReelSpeed', 'ReelTime_EndSuccess', 'ReelTime_ExplodeMachine', 'ReelTime_WaitExplode', 'ReelTime_WaitSmoke', 'ReelTime_CloseWindow', 'ReelTime_EndFailure'] as const;
export const sInfoBoxTasks = ['InfoBox_FadeIn', 'InfoBox_WaitFade', 'InfoBox_DrawWindow', 'InfoBox_WaitFade', 'InfoBox_AddText', 'InfoBox_WaitFade', 'InfoBox_WaitInput', 'InfoBox_WaitFade', 'InfoBox_LoadSlotMachineTilemap', 'InfoBox_WaitFade', 'InfoBox_CreateDigitalDisplay', 'InfoBox_WaitFade', 'InfoBox_LoadPikaPowerMeter', 'InfoBox_WaitFade', 'InfoBox_FreeTask'] as const;
export const sDigitalDisplayTasks = ['DigitalDisplay_Idle'] as const;
export const sDigitalDisplaySceneExitCallbacks = ['EndDigitalDisplayScene_InsertBet', 'EndDigitalDisplayScene_StopReel', 'EndDigitalDisplayScene_Win', 'EndDigitalDisplayScene_Dummy', 'EndDigitalDisplayScene_Dummy', 'EndDigitalDisplayScene_Win', 'EndDigitalDisplayScene_Win'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_SlotMachineSetup', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_SlotMachine', ret: "void", arity: 0, params: "void" },
  { name: 'PlaySlotMachine_Internal', ret: "void", arity: 2, params: "u8, MainCallback" },
  { name: 'SlotMachineDummyTask', ret: "void", arity: 1, params: "u8" },
  { name: 'SlotMachineSetup_InitBgsWindows', ret: "void", arity: 0, params: "void" },
  { name: 'SlotMachineSetup_InitVRAM', ret: "void", arity: 0, params: "void" },
  { name: 'SlotMachineSetup_InitOAM', ret: "void", arity: 0, params: "void" },
  { name: 'SlotMachineSetup_InitGpuRegs', ret: "void", arity: 0, params: "void" },
  { name: 'InitSlotMachine', ret: "void", arity: 0, params: "void" },
  { name: 'SlotMachineSetup_InitPalsSpritesTasks', ret: "void", arity: 0, params: "void" },
  { name: 'SlotMachineSetup_InitTilemaps', ret: "void", arity: 0, params: "void" },
  { name: 'SlotMachineSetup_LoadGfxAndTilemaps', ret: "void", arity: 0, params: "void" },
  { name: 'SlotMachineSetup_InitVBlank', ret: "void", arity: 0, params: "void" },
  { name: 'AllocDigitalDisplayGfx', ret: "void", arity: 0, params: "void" },
  { name: 'SetDigitalDisplayImagePtrs', ret: "void", arity: 0, params: "void" },
  { name: 'CreateSlotMachineSprites', ret: "void", arity: 0, params: "void" },
  { name: 'CreateGameplayTasks', ret: "void", arity: 0, params: "void" },
  { name: 'CreateSlotMachineTasks', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyDigitalDisplayScene', ret: "void", arity: 0, params: "void" },
  { name: 'Task_SlotMachine', ret: "void", arity: 1, params: "u8" },
  { name: 'SlotTask_UnfadeScreen', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_WaitUnfade', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_ReadyNewSpin', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_ReadyNewReelTimeSpin', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_AskInsertBet', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_HandleBetInput', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_PrintMsg_Need3Coins', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_WaitMsg_Need3Coins', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_WaitInfoBox', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_StartSpin', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_StartReelTimeSpin', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_ResetBiasFailure', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_WaitReelStop', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_WaitAllReelsStop', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_CheckMatches', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_WaitPayout', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_EndPayout', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_MatchedPower', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_WaitReelTimeAnim', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_ResetBetTiles', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_NoMatches', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_AskQuit', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_HandleQuitInput', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_PrintMsg_MaxCoins', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_WaitMsg_MaxCoins', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_PrintMsg_NoMoreCoins', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_WaitMsg_NoMoreCoins', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_EndGame', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'SlotTask_FreeDataStructures', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'DrawMachineBias', ret: "void", arity: 0, params: "void" },
  { name: 'ResetBiasFailure', ret: "void", arity: 0, params: "void" },
  { name: 'ShouldTrySpecialBias', ret: "bool8", arity: 0, params: "void" },
  { name: 'TrySelectBias_Special', ret: "u8", arity: 0, params: "void" },
  { name: 'ReelTimeSpeed', ret: "u16", arity: 0, params: "void" },
  { name: 'TrySelectBias_Regular', ret: "u8", arity: 0, params: "void" },
  { name: 'CheckMatch', ret: "void", arity: 0, params: "void" },
  { name: 'CheckMatch_CenterRow', ret: "void", arity: 0, params: "void" },
  { name: 'CheckMatch_TopAndBottom', ret: "void", arity: 0, params: "void" },
  { name: 'CheckMatch_Diagonals', ret: "void", arity: 0, params: "void" },
  { name: 'GetMatchFromSymbols', ret: "u8", arity: 3, params: "u8, u8, u8" },
  { name: 'AwardPayout', ret: "void", arity: 0, params: "void" },
  { name: 'Task_Payout', ret: "void", arity: 1, params: "u8" },
  { name: 'IsFinalTask_Task_Payout', ret: "bool8", arity: 0, params: "void" },
  { name: 'PayoutTask_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'PayoutTask_GivePayout', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'PayoutTask_Free', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'GetSymbolAtRest', ret: "u8", arity: 2, params: "u8, s16" },
  { name: 'CreateReelTasks', ret: "void", arity: 0, params: "void" },
  { name: 'SpinSlotReel', ret: "void", arity: 1, params: "u8" },
  { name: 'StopSlotReel', ret: "void", arity: 1, params: "u8" },
  { name: 'IsSlotReelMoving', ret: "bool8", arity: 1, params: "u8" },
  { name: 'Task_Reel', ret: "void", arity: 1, params: "u8" },
  { name: 'ReelTask_StayStill', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'ReelTask_Spin', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'ReelTask_DecideStop', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'ReelTask_MoveToStop', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'ReelTask_ShakingStop', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'DecideStop_Bias_Reel1', ret: "bool8", arity: 0, params: "void" },
  { name: 'DecideStop_Bias_Reel1_Bet1', ret: "bool8", arity: 2, params: "u8, u8" },
  { name: 'DecideStop_Bias_Reel1_Bet2or3', ret: "bool8", arity: 2, params: "u8, u8" },
  { name: 'DecideStop_Bias_Reel2', ret: "bool8", arity: 0, params: "void" },
  { name: 'DecideStop_Bias_Reel2_Bet1or2', ret: "bool8", arity: 0, params: "void" },
  { name: 'DecideStop_Bias_Reel2_Bet3', ret: "bool8", arity: 0, params: "void" },
  { name: 'DecideStop_Bias_Reel3', ret: "bool8", arity: 0, params: "void" },
  { name: 'DecideStop_Bias_Reel3_Bet1or2', ret: "bool8", arity: 1, params: "u8" },
  { name: 'DecideStop_Bias_Reel3_Bet3', ret: "bool8", arity: 1, params: "u8" },
  { name: 'DecideStop_NoBias_Reel1', ret: "void", arity: 0, params: "void" },
  { name: 'DecideStop_NoBias_Reel2', ret: "void", arity: 0, params: "void" },
  { name: 'DecideStop_NoBias_Reel2_Bet1', ret: "void", arity: 0, params: "void" },
  { name: 'DecideStop_NoBias_Reel2_Bet2', ret: "void", arity: 0, params: "void" },
  { name: 'DecideStop_NoBias_Reel2_Bet3', ret: "void", arity: 0, params: "void" },
  { name: 'DecideStop_NoBias_Reel3', ret: "void", arity: 0, params: "void" },
  { name: 'DecideStop_NoBias_Reel3_Bet1', ret: "void", arity: 0, params: "void" },
  { name: 'DecideStop_NoBias_Reel3_Bet2', ret: "void", arity: 0, params: "void" },
  { name: 'DecideStop_NoBias_Reel3_Bet3', ret: "void", arity: 0, params: "void" },
  { name: 'PressStopReelButton', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_PressStopReelButton', ret: "void", arity: 1, params: "u8" },
  { name: 'LightenBetTiles', ret: "void", arity: 1, params: "u8" },
  { name: 'StopReelButton_Press', ret: "void", arity: 2, params: "struct Task *, u8" },
  { name: 'StopReelButton_Wait', ret: "void", arity: 2, params: "struct Task *, u8" },
  { name: 'StopReelButton_Unpress', ret: "void", arity: 2, params: "struct Task *, u8" },
  { name: 'DarkenBetTiles', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateInvisibleFlashMatchLineSprites', ret: "void", arity: 0, params: "void" },
  { name: 'FlashMatchLine', ret: "void", arity: 1, params: "u8" },
  { name: 'IsMatchLineDoneFlashingBeforePayout', ret: "bool8", arity: 0, params: "void" },
  { name: 'TryStopMatchLinesFlashing', ret: "bool8", arity: 0, params: "void" },
  { name: 'TryStopMatchLineFlashing', ret: "bool8", arity: 1, params: "u8" },
  { name: 'SpriteCB_FlashMatchingLines', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'FlashSlotMachineLights', ret: "void", arity: 0, params: "void" },
  { name: 'TryStopSlotMachineLights', ret: "bool8", arity: 0, params: "void" },
  { name: 'Task_FlashSlotMachineLights', ret: "void", arity: 1, params: "u8" },
  { name: 'CreatePikaPowerBoltTask', ret: "void", arity: 0, params: "void" },
  { name: 'AddPikaPowerBolt', ret: "void", arity: 1, params: "u8" },
  { name: 'IsPikaPowerBoltAnimating', ret: "bool8", arity: 0, params: "void" },
  { name: 'Task_CreatePikaPowerBolt', ret: "void", arity: 1, params: "u8" },
  { name: 'PikaPowerBolt_Idle', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'PikaPowerBolt_AddBolt', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'PikaPowerBolt_WaitAnim', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'PikaPowerBolt_ClearAll', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'ResetPikaPowerBoltTask', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'LoadPikaPowerMeter', ret: "void", arity: 1, params: "u8" },
  { name: 'BeginReelTime', ret: "void", arity: 0, params: "void" },
  { name: 'IsReelTimeTaskDone', ret: "bool8", arity: 0, params: "void" },
  { name: 'Task_ReelTime', ret: "void", arity: 1, params: "u8" },
  { name: 'ReelTime_Init', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'ReelTime_WindowEnter', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'ReelTime_WaitStartPikachu', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'ReelTime_PikachuSpeedUp1', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'ReelTime_PikachuSpeedUp2', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'ReelTime_WaitReel', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'ReelTime_CheckExplode', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'ReelTime_LandOnOutcome', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'ReelTime_PikachuReact', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'ReelTime_WaitClearPikaPower', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'ReelTime_CloseWindow', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'ReelTime_DestroySprites', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'ReelTime_SetReelSpeed', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'ReelTime_EndSuccess', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'ReelTime_ExplodeMachine', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'ReelTime_WaitExplode', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'ReelTime_WaitSmoke', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'ReelTime_EndFailure', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'LoadReelTimeWindowTilemap', ret: "void", arity: 2, params: "s16, s16" },
  { name: 'ClearReelTimeWindowTilemap', ret: "void", arity: 1, params: "s16" },
  { name: 'OpenInfoBox', ret: "void", arity: 1, params: "u8" },
  { name: 'IsInfoBoxClosed', ret: "bool8", arity: 0, params: "void" },
  { name: 'Task_InfoBox', ret: "void", arity: 1, params: "u8" },
  { name: 'InfoBox_FadeIn', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'InfoBox_WaitFade', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'InfoBox_DrawWindow', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'InfoBox_WaitInput', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'InfoBox_AddText', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'InfoBox_LoadPikaPowerMeter', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'InfoBox_LoadSlotMachineTilemap', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'InfoBox_CreateDigitalDisplay', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'InfoBox_FreeTask', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'CreateDigitalDisplayTask', ret: "void", arity: 0, params: "void" },
  { name: 'CreateDigitalDisplayScene', ret: "void", arity: 1, params: "u8" },
  { name: 'IsDigitalDisplayAnimFinished', ret: "bool8", arity: 0, params: "void" },
  { name: 'DigitalDisplay_Idle', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'Task_DigitalDisplay', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateReelSymbolSprites', ret: "void", arity: 0, params: "void" },
  { name: 'CreateCreditPayoutNumberSprites', ret: "void", arity: 0, params: "void" },
  { name: 'CreateCoinNumberSprite', ret: "void", arity: 4, params: "s16, s16, u8, s16" },
  { name: 'CreateReelBackgroundSprite', ret: "void", arity: 0, params: "void" },
  { name: 'CreateReelTimePikachuSprite', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyReelTimePikachuSprite', ret: "void", arity: 0, params: "void" },
  { name: 'CreateReelTimeMachineSprites', ret: "void", arity: 0, params: "void" },
  { name: 'CreateBrokenReelTimeMachineSprite', ret: "void", arity: 0, params: "void" },
  { name: 'CreateReelTimeNumberSprites', ret: "void", arity: 0, params: "void" },
  { name: 'CreateReelTimeShadowSprites', ret: "void", arity: 0, params: "void" },
  { name: 'CreateReelTimeNumberGapSprite', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyReelTimeMachineSprites', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyReelTimeShadowSprites', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyBrokenReelTimeMachineSprite', ret: "void", arity: 0, params: "void" },
  { name: 'CreateReelTimeBoltSprites', ret: "void", arity: 0, params: "void" },
  { name: 'SetReelTimeBoltDelay', ret: "void", arity: 1, params: "s16" },
  { name: 'DestroyReelTimeBoltSprites', ret: "void", arity: 0, params: "void" },
  { name: 'CreateReelTimePikachuAuraSprites', ret: "void", arity: 0, params: "void" },
  { name: 'SetReelTimePikachuAuraFlashDelay', ret: "void", arity: 1, params: "s16" },
  { name: 'DestroyReelTimePikachuAuraSprites', ret: "void", arity: 0, params: "void" },
  { name: 'CreateReelTimeExplosionSprite', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyReelTimeExplosionSprite', ret: "void", arity: 0, params: "void" },
  { name: 'CreateReelTimeDuckSprites', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyReelTimeDuckSprites', ret: "void", arity: 0, params: "void" },
  { name: 'CreateReelTimeSmokeSprite', ret: "void", arity: 0, params: "void" },
  { name: 'IsReelTimeSmokeAnimFinished', ret: "bool8", arity: 0, params: "void" },
  { name: 'DestroyReelTimeSmokeSprite', ret: "void", arity: 0, params: "void" },
  { name: 'CreatePikaPowerBoltSprite', ret: "u8", arity: 2, params: "s16, s16" },
  { name: 'DestroyPikaPowerBoltSprite', ret: "void", arity: 1, params: "u8" },
  { name: 'LoadSlotMachineGfx', ret: "void", arity: 0, params: "void" },
  { name: 'LoadReelBackground', ret: "void", arity: 0, params: "void" },
  { name: 'LoadMenuGfx', ret: "void", arity: 0, params: "void" },
  { name: 'LoadMenuAndReelOverlayTilemaps', ret: "void", arity: 0, params: "void" },
  { name: 'SetReelButtonTilemap', ret: "void", arity: 5, params: "s16, u16, u16, u16, u16" },
  { name: 'LoadInfoBoxTilemap', ret: "void", arity: 0, params: "void" },
  { name: 'LoadSlotMachineMenuTilemap', ret: "void", arity: 0, params: "void" },
  { name: 'LoadSlotMachineReelOverlay', ret: "void", arity: 0, params: "void" },
  { name: 'CreateStdDigitalDisplaySprite', ret: "u8", arity: 3, params: "u8, u8, s16" },
  { name: 'SpriteCB_DigitalDisplay_Static', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_DigitalDisplay_Stop', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_DigitalDisplay_AButtonStop', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_DigitalDisplay_PokeballRocking', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_DigitalDisplay_Smoke', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_DigitalDisplay_SmokeNE', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_DigitalDisplay_SmokeSW', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_DigitalDisplay_SmokeSE', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_DigitalDisplay_Reel', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_DigitalDisplay_Time', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_DigitalDisplay_ReelTimeNumber', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_DigitalDisplay_PokeballShining', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_DigitalDisplay_RegBonus', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_DigitalDisplay_BigBonus', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_DigitalDisplay_AButtonStart', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'EndDigitalDisplayScene_InsertBet', ret: "void", arity: 0, params: "void" },
  { name: 'EndDigitalDisplayScene_StopReel', ret: "void", arity: 0, params: "void" },
  { name: 'EndDigitalDisplayScene_Win', ret: "void", arity: 0, params: "void" },
  { name: 'EndDigitalDisplayScene_Dummy', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_ReelSymbol', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_CoinNumber', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ReelTimePikachu', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ReelTimeNumbers', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ReelTimeBolt', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ReelTimePikachuAura', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ReelTimeExplosion', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ReelTimeDuck', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ReelTimeSmoke', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_PikaPowerBolt', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'Task_FadeToSlotMachine', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'PlaySlotMachine', ret: "void", arity: 2, params: "u8 machineId, MainCallback exitCallback" },
  { name: 'SlotMachine_VBlankCB', ret: "void", arity: 0, params: "void" },
  { name: 'SlotMachine_InitFromTask', ret: "void", arity: 0, params: "void" },
  { name: 'GetBiasSymbol', ret: "u8", arity: 1, params: "u8 machineBias" },
  { name: 'GetReelTimeSpinProbability', ret: "u8", arity: 1, params: "u8 spins" },
  { name: 'GetReelTimeDraw', ret: "void", arity: 0, params: "void" },
  { name: 'ShouldReelTimeMachineExplode', ret: "bool8", arity: 1, params: "u16 check" },
  { name: 'GetSymbol', ret: "u8", arity: 2, params: "u8 reel, s16 offset" },
  { name: 'GetReelTimeSymbol', ret: "u8", arity: 1, params: "s16 offset" },
  { name: 'AdvanceSlotReel', ret: "void", arity: 2, params: "u8 reelIndex, s16 value" },
  { name: 'AdvanceSlotReelToNextSymbol', ret: "s16", arity: 2, params: "u8 reelIndex, s16 value" },
  { name: 'AdvanceReeltimeReel', ret: "void", arity: 1, params: "s16 value" },
  { name: 'AdvanceReeltimeReelToNextSymbol', ret: "s16", arity: 1, params: "s16 value" },
  { name: 'EitherSymbolAtPos_Reel1', ret: "bool8", arity: 3, params: "s16 pos, u8 sym1, u8 sym2" },
  { name: 'AreCherriesOnScreen_Reel1', ret: "bool8", arity: 1, params: "s16 turns" },
  { name: 'BiasedTowardCherryOr7s', ret: "bool8", arity: 0, params: "void" },
  { name: 'IfSymbol7_SwitchColor', ret: "bool8", arity: 1, params: "u8 *symbol" },
  { name: 'MismatchedSyms_77', ret: "bool8", arity: 2, params: "u8 sym1, u8 sym2" },
  { name: 'MismatchedSyms_777', ret: "bool8", arity: 3, params: "u8 sym1, u8 sym2, u8 sym3" },
  { name: 'NeitherMatchNor7Mismatch', ret: "bool8", arity: 3, params: "u8 sym1, u8 sym2, u8 sym3" },
  { name: 'LightenMatchLine', ret: "void", arity: 1, params: "u8 matchLineId" },
  { name: 'DarkenMatchLine', ret: "void", arity: 1, params: "u8 matchLineId" },
  { name: 'ResetPikaPowerBolts', ret: "void", arity: 0, params: "void" },
  { name: 'AddDigitalDisplaySprite', ret: "void", arity: 5, params: "u8 templateIdx, SpriteCallback callback, s16 x, s16 y, s16 spriteId" },
  { name: 'CreateDigitalDisplaySprite', ret: "u8", arity: 5, params: "u8 templateIdx, SpriteCallback callback, s16 x, s16 y, s16 internalSpriteId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_CreatePikaPowerBolt',
  'Task_DigitalDisplay',
  'Task_FadeToSlotMachine',
  'Task_FlashSlotMachineLights',
  'Task_InfoBox',
  'Task_Payout',
  'Task_PressStopReelButton',
  'Task_Reel',
  'Task_ReelTime',
  'Task_SlotMachine',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_SlotMachine',
  'CB2_SlotMachineSetup',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'overworld.h',
  'field_effect.h',
  'random.h',
  'sound.h',
  'main.h',
  'slot_machine.h',
  'string_util.h',
  'decompress.h',
  'trig.h',
  'graphics.h',
  'palette.h',
  'util.h',
  'text.h',
  'menu.h',
  'malloc.h',
  'bg.h',
  'gpu_regs.h',
  'coins.h',
  'strings.h',
  'tv.h',
  'text_window.h',
  'main_menu.h',
  'bg.h',
  'window.h',
  'constants/coins.h',
  'constants/rgb.h',
  'constants/slot_machine.h',
  'constants/songs.h',
] as const;
