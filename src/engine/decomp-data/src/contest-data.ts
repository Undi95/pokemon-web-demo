// AUTO-GENERATED from src/contest.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/contest.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const CONTESTANT_TEXT_COLOR_START = 10;
/** Raw expr: `WIN_MOVE0` */
export const MOVE_WINDOWS_START_EXPR = "WIN_MOVE0";
export const TAG_CONTEST_SYMBOLS_PAL = 44000;
export const TAG_JUDGE_SYMBOLS_GFX = 44000;
export const TAG_FACES_GFX = 44001;
export const TAG_APPLAUSE_METER = 44002;
export const TAG_SLIDER_HEART = 20000;
export const TAG_JUDGE = 20001;
export const TAG_NEXT_TURN_PAL = 20002;
export const TAG_NEXT_TURN_1_GFX = 20002;
export const TAG_NEXT_TURN_2_GFX = 20003;
export const TAG_NEXT_TURN_3_GFX = 20004;
export const TAG_NEXT_TURN_4_GFX = 20005;
export const TAG_BLINK_EFFECT_CONTESTANT0 = 33000;
export const TAG_BLINK_EFFECT_CONTESTANT1 = 33001;
export const TAG_BLINK_EFFECT_CONTESTANT2 = 33002;
export const TAG_BLINK_EFFECT_CONTESTANT3 = 33003;
export const TILE_FILLED_APPEAL_HEART = 20498;
export const TILE_FILLED_JAM_HEART = 20500;
export const TILE_EMPTY_APPEAL_HEART = 20533;
export const TILE_EMPTY_JAM_HEART = 20534;
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[2]` */
export const tMonSpriteId_EXPR = "data[2]";
/** Raw expr: `data[10]` */
export const tCounter_EXPR = "data[10]";
/** Raw expr: `data[0]` */
export const tNumHearts_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tHeartsDelta_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tHeartsSign_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tContestant_EXPR = "data[3]";
/** Raw expr: `data[10]` */
export const tDelayTimer_EXPR = "data[10]";
/** Raw expr: `data[0]` */
export const sContestant_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sTargetX_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sMoveX_EXPR = "data[2]";
/** Raw expr: `data[10]` */
export const tDelay_EXPR = "data[10]";
/** Raw expr: `data[11]` */
export const tFrame_EXPR = "data[11]";
/** Raw expr: `data[12]` */
export const tCycles_EXPR = "data[12]";
/** Raw expr: `data[0]` */
export const tBlendColor_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tBlendCoeff_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tBlendDir_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tTargetBlendCoeff_EXPR = "data[3]";
/** Raw expr: `data[10]` */
export const tBlendDelay_EXPR = "data[10]";
/** Raw expr: `data[0]` */
export const tAnimId_EXPR = "data[0]";
export const APPEAL_MOVES_END = 65535;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_WIN_0 = {
  WIN_CONTESTANT0_NAME: 0,
  WIN_CONTESTANT1_NAME: 1,
  WIN_CONTESTANT2_NAME: 2,
  WIN_CONTESTANT3_NAME: 3,
  WIN_GENERAL_TEXT: 4,
  WIN_MOVE0: 5,
  WIN_MOVE1: 6,
  WIN_MOVE2: 7,
  WIN_MOVE3: 8,
  WIN_SLASH: 9,
  WIN_MOVE_DESCRIPTION: 10,
} as const;
export const ENUM_JUDGE_1 = {
  JUDGE_SYMBOL_SWIRL: 0,
  JUDGE_SYMBOL_SWIRL_UNUSED: 1,
  JUDGE_SYMBOL_ONE_EXCLAMATION: 2,
  JUDGE_SYMBOL_TWO_EXCLAMATIONS: 3,
  JUDGE_SYMBOL_NUMBER_ONE_UNUSED: 4,
  JUDGE_SYMBOL_NUMBER_ONE: 5,
  JUDGE_SYMBOL_NUMBER_FOUR: 6,
  JUDGE_SYMBOL_QUESTION_MARK: 7,
  JUDGE_SYMBOL_STAR: 8,
} as const;
export const ENUM_STAT_2 = {
  STAT_SYMBOL_CIRCLE: 0,
  STAT_SYMBOL_WAVE: 1,
  STAT_SYMBOL_X: 2,
  STAT_SYMBOL_SWIRL: 3,
  STAT_SYMBOL_SQUARE: 4,
} as const;
export const ENUM_CONTEST_3 = {
  CONTEST_DEBUG_MODE_OFF: 0,
  CONTEST_DEBUG_MODE_PRINT_POINT_TOTAL: 1,
  CONTEST_DEBUG_MODE_PRINT_WINNER_FLAGS: 2,
  CONTEST_DEBUG_MODE_PRINT_LOSER_FLAGS: 3,
} as const;
export const ENUM_SLIDER_4 = {
  SLIDER_HEART_ANIM_NORMAL: 0,
  SLIDER_HEART_ANIM_DISAPPEAR: 1,
  SLIDER_HEART_ANIM_APPEAR: 2,
} as const;
export const ENUM_APPEALSTATE_5 = {
  APPEALSTATE_START_TURN: 0,
  APPEALSTATE_WAIT_LINK: 1,
  APPEALSTATE_CHECK_SKIP_TURN: 2,
  APPEALSTATE_SLIDE_MON_IN: 3,
  APPEALSTATE_WAIT_SLIDE_MON: 4,
  APPEALSTATE_PRINT_USED_MOVE_MSG: 5,
  APPEALSTATE_WAIT_USED_MOVE_MSG: 6,
  APPEALSTATE_MOVE_ANIM: 7,
  APPEALSTATE_WAIT_MOVE_ANIM: 8,
  APPEALSTATE_MOVE_ANIM_MULTITURN: 9,
  APPEALSTATE_SLIDE_MON_OUT: 10,
  APPEALSTATE_FREE_MON_SPRITE: 11,
  APPEALSTATE_UPDATE_MOVE_USERS_HEARTS: 12,
  APPEALSTATE_WAIT_MOVE_USERS_HEARTS: 13,
  APPEALSTATE_PRINT_COMBO_MSG: 14,
  APPEALSTATE_TRY_UPDATE_HEARTS_FROM_COMBO: 15,
  APPEALSTATE_WAIT_HEARTS_FROM_COMBO: 16,
  APPEALSTATE_CHECK_REPEATED_MOVE: 17,
  APPEALSTATE_WAIT_HEARTS_FROM_REPEAT: 18,
  APPEALSTATE_UPDATE_HEARTS_FROM_REPEAT: 19,
  APPEALSTATE_START_TURN_END_DELAY: 20,
  APPEALSTATE_TURN_END_DELAY: 21,
  APPEALSTATE_START_NEXT_TURN: 22,
  APPEALSTATE_TRY_PRINT_MOVE_RESULT: 23,
  APPEALSTATE_WAIT_MOVE_RESULT_MSG: 24,
  APPEALSTATE_UPDATE_OPPONENTS: 25,
  APPEALSTATE_UPDATE_OPPONENT: 26,
  APPEALSTATE_WAIT_OPPONENT_RESPONSE_MSG: 27,
  APPEALSTATE_UPDATE_OPPONENT_HEARTS: 28,
  APPEALSTATE_WAIT_OPPONENT_HEARTS: 29,
  APPEALSTATE_UPDATE_OPPONENT_STATUS: 30,
  APPEALSTATE_PRINT_SKIP_TURN_MSG: 31,
  APPEALSTATE_WAIT_SKIP_TURN_MSG: 32,
  APPEALSTATE_PRINT_TOO_NERVOUS_MSG: 33,
  APPEALSTATE_WAIT_TOO_NERVOUS_MSG: 34,
  APPEALSTATE_TRY_JUDGE_STAR: 35,
  APPEALSTATE_WAIT_JUDGE_STAR: 36,
  APPEALSTATE_UPDATE_MOVE_USERS_STARS: 37,
  APPEALSTATE_WAIT_MOVE_USERS_STARS: 38,
  APPEALSTATE_UPDATE_OPPONENT_STARS: 39,
  APPEALSTATE_WAIT_OPPONENT_STARS: 40,
  APPEALSTATE_UPDATE_CROWD: 41,
  APPEALSTATE_42: 42,
  APPEALSTATE_WAIT_EXCITEMENT_HEARTS: 43,
  APPEALSTATE_44: 44,
  APPEALSTATE_WAIT_JUDGE_COMBO: 45,
  APPEALSTATE_WAIT_JUDGE_REPEATED_MOVE: 46,
  APPEALSTATE_TRY_SHOW_NEXT_TURN_GFX: 47,
  APPEALSTATE_CHECK_TURN_ORDER_MOD: 48,
  APPEALSTATE_WAIT_JUDGE_TURN_ORDER: 49,
  APPEALSTATE_UPDATE_MOVE_USERS_STATUS: 50,
  APPEALSTATE_TRY_PRINT_SKIP_NEXT_TURN_MSG: 51,
  APPEALSTATE_WAIT_SKIP_NEXT_TURN_MSG: 52,
  APPEALSTATE_DO_CROWD_UNEXCITED: 53,
  APPEALSTATE_DO_CROWD_EXCITED: 54,
  APPEALSTATE_SLIDE_APPLAUSE_OUT: 55,
  APPEALSTATE_WAIT_SLIDE_APPLAUSE: 56,
  APPEALSTATE_PRINT_CROWD_WATCHES_MSG: 57,
  APPEALSTATE_PRINT_MON_MOVE_IGNORED_MSG: 58,
  APPEALSTATE_WAIT_MON_MOVE_IGNORED_MSG: 59,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sContestWindowTemplates = [
  { bg: 0, tilemapLeft: 18, tilemapTop: 0, width: 12, height: 2, paletteNum: 15, baseBlock: 512 },
  { bg: 0, tilemapLeft: 18, tilemapTop: 5, width: 12, height: 2, paletteNum: 15, baseBlock: 536 },
  { bg: 0, tilemapLeft: 18, tilemapTop: 10, width: 12, height: 2, paletteNum: 15, baseBlock: 560 },
  { bg: 0, tilemapLeft: 18, tilemapTop: 15, width: 12, height: 2, paletteNum: 15, baseBlock: 584 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 15, width: 17, height: 4, paletteNum: 15, baseBlock: 608 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 31, width: 9, height: 2, paletteNum: 15, baseBlock: 676 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 33, width: 9, height: 2, paletteNum: 15, baseBlock: 694 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 35, width: 9, height: 2, paletteNum: 15, baseBlock: 712 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 37, width: 9, height: 2, paletteNum: 15, baseBlock: 730 },
  { bg: 0, tilemapLeft: 16, tilemapTop: 31, width: 1, height: 2, paletteNum: 15, baseBlock: 748 },
  { bg: 0, tilemapLeft: 11, tilemapTop: 35, width: 18, height: 4, paletteNum: 15, baseBlock: 750 },
] as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sContestBgTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 24, screenSize: 2, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 2, mapBaseIndex: 30, screenSize: 2, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 28, screenSize: 2, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 26, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOam_SliderHeart = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(8x8)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOam_NextTurn = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x8)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOam_Faces = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 0, paletteNum: 0 } as const;
export const sOam_ApplauseMeter = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x32)", x: 0, size: "SPRITE_SIZE(64x32)", tileNum: 0, priority: 0, paletteNum: 0 } as const;
export const sOam_Judge = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 3, paletteNum: 2 } as const;
export const sOam_ContestantsTurnBlinkEffect = { y: 0, affineMode: "ST_OAM_AFFINE_DOUBLE", objMode: "ST_OAM_OBJ_BLEND", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_SliderHeart = { tileTag: "TAG_SLIDER_HEART", paletteTag: "TAG_CONTEST_SYMBOLS_PAL", oam: "&sOam_SliderHeart", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_SliderHeart", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplates_NextTurn = [
  { tileTag: "TAG_NEXT_TURN_1_GFX", paletteTag: "TAG_NEXT_TURN_PAL", oam: "&sOam_NextTurn", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
  { tileTag: "TAG_NEXT_TURN_2_GFX", paletteTag: "TAG_NEXT_TURN_PAL", oam: "&sOam_NextTurn", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
  { tileTag: "TAG_NEXT_TURN_3_GFX", paletteTag: "TAG_NEXT_TURN_PAL", oam: "&sOam_NextTurn", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
  { tileTag: "TAG_NEXT_TURN_4_GFX", paletteTag: "TAG_NEXT_TURN_PAL", oam: "&sOam_NextTurn", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
] as const;
export const sSpriteTemplate_Faces = { tileTag: "TAG_FACES_GFX", paletteTag: "TAG_CONTEST_SYMBOLS_PAL", oam: "&sOam_Faces", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_ApplauseMeter = { tileTag: "TAG_APPLAUSE_METER", paletteTag: "TAG_APPLAUSE_METER", oam: "&sOam_ApplauseMeter", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Judge = { tileTag: "TAG_JUDGE", paletteTag: "TAG_JUDGE", oam: "&sOam_Judge", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_JudgeSpeechBubble = { tileTag: "TAG_JUDGE_SYMBOLS_GFX", paletteTag: "TAG_CONTEST_SYMBOLS_PAL", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplates_ContestantsTurnBlinkEffect = [
  { tileTag: "TAG_BLINK_EFFECT_CONTESTANT0", paletteTag: "TAG_BLINK_EFFECT_CONTESTANT0", oam: "&sOam_ContestantsTurnBlinkEffect", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_ContestantsTurnBlinkEffect", callback: "SpriteCallbackDummy" },
  { tileTag: "TAG_BLINK_EFFECT_CONTESTANT1", paletteTag: "TAG_BLINK_EFFECT_CONTESTANT1", oam: "&sOam_ContestantsTurnBlinkEffect", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_ContestantsTurnBlinkEffect", callback: "SpriteCallbackDummy" },
  { tileTag: "TAG_BLINK_EFFECT_CONTESTANT2", paletteTag: "TAG_BLINK_EFFECT_CONTESTANT2", oam: "&sOam_ContestantsTurnBlinkEffect", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_ContestantsTurnBlinkEffect", callback: "SpriteCallbackDummy" },
  { tileTag: "TAG_BLINK_EFFECT_CONTESTANT3", paletteTag: "TAG_BLINK_EFFECT_CONTESTANT3", oam: "&sOam_ContestantsTurnBlinkEffect", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_ContestantsTurnBlinkEffect", callback: "SpriteCallbackDummy" },
] as const;

// ─── SpriteSheet ─────────────────────────────────────────────────────────────
export const sSpriteSheet_SliderHeart = { data: "gContestSliderHeart_Gfx", size: 32, tag: "TAG_SLIDER_HEART" } as const;

// ─── CompressedSpriteSheet ─────────────────────────────────────────────────────────────
export const sSpriteSheet_NextTurn = [
  { data: "gContestNextTurnGfx", size: 256, tag: "TAG_NEXT_TURN_1_GFX" },
  { data: "gContestNextTurnGfx", size: 256, tag: "TAG_NEXT_TURN_2_GFX" },
  { data: "gContestNextTurnGfx", size: 256, tag: "TAG_NEXT_TURN_3_GFX" },
  { data: "gContestNextTurnGfx", size: 256, tag: "TAG_NEXT_TURN_4_GFX" },
] as const;
export const sSpriteSheet_Faces = { data: "gContestFaces_Gfx", size: 384, tag: "TAG_FACES_GFX" } as const;
export const sSpriteSheet_ApplauseMeter = { data: "gContestApplauseGfx", size: 1024, tag: "TAG_APPLAUSE_METER" } as const;
export const sSpriteSheet_Judge = { data: "gContestJudgeGfx", size: 2048, tag: "TAG_JUDGE" } as const;
export const sSpriteSheet_JudgeSymbols = { data: "gContestJudgeSymbolsGfx", size: 896, tag: "TAG_JUDGE_SYMBOLS_GFX" } as const;
export const sSpriteSheets_ContestantsTurnBlinkEffect = [
  { data: "gBlankGfxCompressed", size: 4096, tag: "TAG_BLINK_EFFECT_CONTESTANT0" },
  { data: "gBlankGfxCompressed", size: 4096, tag: "TAG_BLINK_EFFECT_CONTESTANT1" },
  { data: "gBlankGfxCompressed", size: 4096, tag: "TAG_BLINK_EFFECT_CONTESTANT2" },
  { data: "gBlankGfxCompressed", size: 4096, tag: "TAG_BLINK_EFFECT_CONTESTANT3" },
] as const;

// ─── SpritePalette ─────────────────────────────────────────────────────────────
export const sSpritePalette_NextTurn = { data: "gContestPal", tag: "TAG_NEXT_TURN_PAL" } as const;
export const sSpritePalette_ApplauseMeter = { data: "gContestPal", tag: "TAG_APPLAUSE_METER" } as const;
export const sSpritePalettes_ContestantsTurnBlinkEffect = [
  { data: "eContestTempSave.cachedWindowPalettes[5]", tag: "TAG_BLINK_EFFECT_CONTESTANT0" },
  { data: "eContestTempSave.cachedWindowPalettes[6]", tag: "TAG_BLINK_EFFECT_CONTESTANT1" },
  { data: "eContestTempSave.cachedWindowPalettes[7]", tag: "TAG_BLINK_EFFECT_CONTESTANT2" },
  { data: "eContestTempSave.cachedWindowPalettes[8]", tag: "TAG_BLINK_EFFECT_CONTESTANT3" },
] as const;

// ─── CompressedSpritePalette ─────────────────────────────────────────────────────────────
export const sSpritePalette_JudgeSymbols = { data: "gContestJudgeSymbolsPal", tag: "TAG_CONTEST_SYMBOLS_PAL" } as const;

// ─── SubspriteTable ─────────────────────────────────────────────────────────────
export const sSubspriteTable_NextTurn = { subspriteCount: "ARRAY_COUNT(sSubsprites_NextTurn)", subsprites: "sSubsprites_NextTurn" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sText_Pal': { path: 'graphics/contest/text.pal', ext: '.gbapal', type: 'u16' },
};

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "struct ContestPokemon", name: 'gContestMons', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "s16", name: 'gContestMonRound1Points', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "s16", name: 'gContestMonTotalPoints', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "s16", name: 'gContestMonAppealPointTotals', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "s16", name: 'gContestMonRound2Points', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gContestFinalStandings', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gContestMonPartyIndex', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gContestPlayerMonIndex', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gContestantTurnOrder', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gLinkContestFlags', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gContestLinkLeaderIndex', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gSpecialVar_ContestCategory', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'gSpecialVar_ContestRank', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gNumLinkContestPlayers', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gHighestRibbonRank', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sContestBgCopyFlags', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "struct ContestWinner", name: 'gCurContestWinner', isArray: false, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "bool8", name: 'gCurContestWinnerIsForArtist', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gCurContestWinnerSaveIdx', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u32", name: 'gContestRngValue', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'LoadContestPalettes', ret: "void", arity: 0, params: "void" },
  { name: 'Task_StartContestWaitFade', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_TryStartLinkContest', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_CommunicateMonIdxs', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_EndCommunicateMonIdxs', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ReadyStartLinkContest', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetupContestGraphics', ret: "bool8", arity: 1, params: "u8 *stateVar" },
  { name: 'Task_WaitToRaiseCurtainAtStart', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_RaiseCurtainAtStart', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'VBlankCB_Contest', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ContestMain', ret: "void", arity: 0, params: "void" },
  { name: 'Task_DisplayAppealNumberText', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_TryShowMoveSelectScreen', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ShowMoveSelectScreen', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_HandleMoveSelectInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DrawMoveSelectArrow', ret: "void", arity: 1, params: "s8" },
  { name: 'EraseMoveSelectArrow', ret: "void", arity: 1, params: "s8" },
  { name: 'Task_SelectedMove', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_EndCommunicateMoveSelections', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_HideMoveSelectScreen', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_HideApplauseMeterForAppealStart', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_WaitHideApplauseMeterForAppealStart', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_AppealSetup', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_DoAppeals', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_EndWaitForLink', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_MonSlideIn', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_MonSlideOut', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'Task_FinishRoundOfAppeals', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ReadyUpdateHeartSliders', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_UpdateHeartSliders', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WaitForHeartSliders', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_RestorePlttBufferUnfaded', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WaitPrintRoundResult', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_PrintRoundResultText', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ReUpdateHeartSliders', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WaitForHeartSlidersAgain', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_DropCurtainAtRoundEnd', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_TryStartNextRoundOfAppeals', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_StartNewRoundOfAppeals', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_EndAppeals', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WaitForOutOfTimeMsg', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_DropCurtainAtAppealsEnd', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_TryCommunicateFinalStandings', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_CommunicateFinalStandings', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_EndCommunicateFinalStandings', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ContestReturnToField', ret: "void", arity: 1, params: "u8" },
  { name: 'FieldCB_ContestReturnToField', ret: "void", arity: 0, params: "void" },
  { name: 'IsPlayerLinkLeader', ret: "bool8", arity: 0, params: "void" },
  { name: 'PrintContestantTrainerName', ret: "void", arity: 1, params: "u8" },
  { name: 'PrintContestantTrainerNameWithColor', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'PrintContestantMonName', ret: "void", arity: 1, params: "u8" },
  { name: 'PrintContestantMonNameWithColor', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'CreateJudgeSprite', ret: "u8", arity: 0, params: "void" },
  { name: 'CreateJudgeSpeechBubbleSprite', ret: "u8", arity: 0, params: "void" },
  { name: 'CreateContestantSprite', ret: "u8", arity: 4, params: "u16, u32, u32, u32" },
  { name: 'PrintContestMoveDescription', ret: "void", arity: 1, params: "u16" },
  { name: 'SanitizeSpecies', ret: "u16", arity: 1, params: "u16" },
  { name: 'ContestClearGeneralTextWindow', ret: "void", arity: 0, params: "void" },
  { name: 'GetChosenMove', ret: "u16", arity: 1, params: "u8" },
  { name: 'GetAllChosenMoves', ret: "void", arity: 0, params: "void" },
  { name: 'ContestPrintLinkStandby', ret: "void", arity: 0, params: "void" },
  { name: 'FillContestantWindowBgs', ret: "void", arity: 0, params: "void" },
  { name: 'CreateSliderHeartSprites', ret: "void", arity: 0, params: "void" },
  { name: 'SetBottomSliderHeartsInvisibility', ret: "void", arity: 1, params: "bool8" },
  { name: 'CreateNextTurnSprites', ret: "void", arity: 0, params: "void" },
  { name: 'CreateApplauseMeterSprite', ret: "void", arity: 0, params: "void" },
  { name: 'CreateJudgeAttentionEyeTask', ret: "void", arity: 0, params: "void" },
  { name: 'CreateUnusedBlendTask', ret: "void", arity: 0, params: "void" },
  { name: 'ContestDebugDoPrint', ret: "void", arity: 0, params: "void" },
  { name: 'DrawContestantWindows', ret: "void", arity: 0, params: "void" },
  { name: 'ApplyNextTurnOrder', ret: "void", arity: 0, params: "void" },
  { name: 'SlideApplauseMeterIn', ret: "void", arity: 0, params: "void" },
  { name: 'SlideApplauseMeterOut', ret: "void", arity: 0, params: "void" },
  { name: 'SetBgForCurtainDrop', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateContestantBoxOrder', ret: "void", arity: 0, params: "void" },
  { name: 'Task_StartDropCurtainAtRoundEnd', ret: "void", arity: 1, params: "u8" },
  { name: 'AnimateSliderHearts', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateInvisibleBattleTargetSprite', ret: "void", arity: 0, params: "void" },
  { name: 'Contest_StartTextPrinter', ret: "void", arity: 2, params: "const u8 *, u32" },
  { name: 'ContestBG_FillBoxWithIncrementingTile', ret: "void", arity: 8, params: "u8, u16, u8, u8, u8, u8, u8, s16" },
  { name: 'Contest_RunTextPrinters', ret: "bool32", arity: 0, params: "void" },
  { name: 'Contest_SetBgCopyFlags', ret: "void", arity: 1, params: "u32 flagIndex" },
  { name: 'CalculateFinalScores', ret: "void", arity: 0, params: "void" },
  { name: 'CalculateAppealMoveImpact', ret: "void", arity: 1, params: "u8" },
  { name: 'SetMoveAnimAttackerData', ret: "void", arity: 1, params: "u8" },
  { name: 'BlinkContestantBox', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'CreateContestantBoxBlinkSprites', ret: "u8", arity: 1, params: "u8" },
  { name: 'SanitizeMove', ret: "u16", arity: 1, params: "u16" },
  { name: 'SetMoveSpecificAnimData', ret: "void", arity: 1, params: "u8" },
  { name: 'SetMoveTargetPosition', ret: "void", arity: 1, params: "u16" },
  { name: 'ClearMoveAnimData', ret: "void", arity: 1, params: "u8" },
  { name: 'StopFlashJudgeAttentionEye', ret: "void", arity: 1, params: "u8" },
  { name: 'DrawUnnervedSymbols', ret: "void", arity: 0, params: "void" },
  { name: 'PrintAppealMoveResultText', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'DoJudgeSpeechBubble', ret: "void", arity: 1, params: "u8" },
  { name: 'ShowHideNextTurnGfx', ret: "void", arity: 1, params: "bool8" },
  { name: 'UpdateAppealHearts', ret: "u8", arity: 3, params: "s16, s16, u8" },
  { name: 'UpdateConditionStars', ret: "bool8", arity: 2, params: "u8, u8" },
  { name: 'DrawStatusSymbol', ret: "bool8", arity: 1, params: "u8" },
  { name: 'DrawStatusSymbols', ret: "void", arity: 0, params: "void" },
  { name: 'StartStopFlashJudgeAttentionEye', ret: "void", arity: 1, params: "u8" },
  { name: 'BlendAudienceBackground', ret: "void", arity: 2, params: "s8, s8" },
  { name: 'ShowAndUpdateApplauseMeter', ret: "void", arity: 1, params: "s8 unused" },
  { name: 'AnimateAudience', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateApplauseMeter', ret: "void", arity: 0, params: "void" },
  { name: 'RankContestants', ret: "void", arity: 0, params: "void" },
  { name: 'SetAttentionLevels', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateHeartSliders', ret: "void", arity: 0, params: "void" },
  { name: 'SlidersDoneUpdating', ret: "bool8", arity: 0, params: "void" },
  { name: 'ContestBG_FillBoxWithTile', ret: "void", arity: 7, params: "u8, u16, u8, u8, u8, u8, u8" },
  { name: 'Contest_PrintTextToBg0WindowStd', ret: "void", arity: 2, params: "u32, const u8 *" },
  { name: 'GetContestantRound2Points', ret: "s16", arity: 1, params: "u8" },
  { name: 'DetermineFinalStandings', ret: "void", arity: 0, params: "void" },
  { name: 'DidContestantPlaceHigher', ret: "bool8", arity: 3, params: "s32, s32, struct ContestFinalStandings *" },
  { name: 'Task_UpdateAppealHearts', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_UpdateHeartSlider', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'Task_FlashJudgeAttentionEye', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_StopFlashJudgeAttentionEye', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_UnusedBlend', ret: "void", arity: 1, params: "u8" },
  { name: 'InitUnusedBlendTaskData', ret: "void", arity: 1, params: "u8" },
  { name: 'UpdateBlendTaskContestantData', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_BlinkContestantBox', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_EndBlinkContestantBox', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'StartApplauseOverflowAnimation', ret: "u8", arity: 0, params: "void" },
  { name: 'Task_ApplauseOverflowAnimation', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_SlideApplauseMeterIn', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_SlideApplauseMeterOut', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ShowAndUpdateApplauseMeter', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_AnimateAudience', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_BlendAudienceBackground', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_UpdateCurtainDropAtRoundEnd', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ResetForNextRound', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WaitRaiseCurtainAtRoundEnd', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_StartRaiseCurtainAtRoundEnd', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WaitForSliderHeartAnim', ret: "void", arity: 1, params: "u8" },
  { name: 'SetBattleTargetSpritePosition', ret: "void", arity: 0, params: "void" },
  { name: 'CalculateContestLiveUpdateData', ret: "void", arity: 0, params: "void" },
  { name: 'SetConestLiveUpdateTVData', ret: "void", arity: 0, params: "void" },
  { name: 'SetContestLiveUpdateFlags', ret: "void", arity: 1, params: "u8" },
  { name: 'ContestDebugPrintBitStrings', ret: "void", arity: 0, params: "void" },
  { name: 'StripPlayerNameForLinkContest', ret: "void", arity: 1, params: "u8 *" },
  { name: 'StripMonNameForLinkContest', ret: "void", arity: 2, params: "u8 *, s32" },
  { name: 'SwapMoveDescAndContestTilemaps', ret: "void", arity: 0, params: "void" },
  { name: 'TaskDummy1', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ResetLinkContestBoolean', ret: "void", arity: 0, params: "void" },
  { name: 'SetupContestGpuRegs', ret: "void", arity: 0, params: "void" },
  { name: 'LoadContestBgAfterMoveAnim', ret: "void", arity: 0, params: "void" },
  { name: 'InitContestInfoBgs', ret: "void", arity: 0, params: "void" },
  { name: 'InitContestWindows', ret: "void", arity: 0, params: "void" },
  { name: 'InitContestResources', ret: "void", arity: 0, params: "void" },
  { name: 'AllocContestResources', ret: "void", arity: 0, params: "void" },
  { name: 'FreeContestResources', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_StartContest', ret: "void", arity: 0, params: "void" },
  { name: 'StringCopy', ret: "else", arity: 2, params: "gDisplayedStringBattle, gText_AppealNumButItCantParticipate" },
  { name: 'PlaySE', ret: "else", arity: 1, params: "SE_CONTEST_ICON_CLEAR" },
  { name: 'StringExpandPlaceholders', ret: "else", arity: 2, params: "gStringVar4, gText_MonsXGotTheCrowdGoing" },
  { name: 'Task_UpdateContestantBoxOrder', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'TryPutPlayerLast', ret: "void", arity: 0, params: "void" },
  { name: 'CreateContestMonFromParty', ret: "void", arity: 1, params: "u8 partyIndex" },
  { name: 'SetContestants', ret: "void", arity: 2, params: "u8 contestType, u8 rank" },
  { name: 'SetLinkAIContestants', ret: "void", arity: 3, params: "u8 contestType, u8 rank, bool32 isPostgame" },
  { name: 'GetContestEntryEligibility', ret: "u8", arity: 1, params: "struct Pokemon *pkmn" },
  { name: 'DrawContestantWindowText', ret: "void", arity: 0, params: "void" },
  { name: 'CalculateContestantRound1Points', ret: "u16", arity: 2, params: "u8 who, u8 contestCategory" },
  { name: 'CalculateRound1Points', ret: "void", arity: 1, params: "u8 contestCategory" },
  { name: 'HandleLoadSpecialPokePic_DontHandleDeoxys', ret: "else", arity: 4, params: "&gMonBackPicTable[species], gMonSpritesGfxPtr->sprites.ptr[B_POSITION_PLAYER_LEFT], species, personality" },
  { name: 'IsSpeciesNotUnown', ret: "bool8", arity: 1, params: "u16 species" },
  { name: 'GetMoveEffectSymbolTileOffset', ret: "u16", arity: 2, params: "u16 move, u8 contestant" },
  { name: 'DrawMoveEffectSymbol', ret: "void", arity: 2, params: "u16 move, u8 contestant" },
  { name: 'DrawMoveEffectSymbols', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'GetStarTileOffset', ret: "u16", arity: 0, params: "void" },
  { name: 'DrawConditionStars', ret: "void", arity: 0, params: "void" },
  { name: 'GetStatusSymbolTileOffset', ret: "u16", arity: 1, params: "u8 status" },
  { name: 'ContestantCanUseTurn', ret: "bool8", arity: 1, params: "u8 contestant" },
  { name: 'SetContestantStatusesForNextRound', ret: "void", arity: 0, params: "void" },
  { name: 'Contest_IsMonsTurnDisabled', ret: "bool8", arity: 1, params: "u8 contestant" },
  { name: 'CalculateTotalPointsForContestant', ret: "void", arity: 1, params: "u8 contestant" },
  { name: 'SaveLinkContestResults', ret: "void", arity: 0, params: "void" },
  { name: 'GetAppealHeartTileOffset', ret: "u16", arity: 1, params: "u8 contestant" },
  { name: 'GetNumHeartsFromAppealPoints', ret: "s8", arity: 1, params: "s16 appeal" },
  { name: 'UpdateHeartSlider', ret: "void", arity: 1, params: "u8 contestant" },
  { name: 'UpdateSliderHeartSpriteYPositions', ret: "void", arity: 0, params: "void" },
  { name: 'StartFlashJudgeAttentionEye', ret: "void", arity: 1, params: "u8 contestant" },
  { name: 'UpdateBlendTaskContestantsData', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyContestantBoxBlinkSprites', ret: "void", arity: 1, params: "u8 spriteId" },
  { name: 'SetBlendForContestantBoxBlink', ret: "void", arity: 0, params: "void" },
  { name: 'ResetBlendForContestantBoxBlink', ret: "void", arity: 0, params: "void" },
  { name: 'ContestDebugTogglePointTotal', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'SortContestants', ret: "void", arity: 1, params: "bool8 useRanking" },
  { name: 'SetContestantEffectStringID', ret: "void", arity: 2, params: "u8 contestant, u8 effectStringId" },
  { name: 'SetContestantEffectStringID2', ret: "void", arity: 2, params: "u8 contestant, u8 effectStringId" },
  { name: 'SetStartledString', ret: "void", arity: 2, params: "u8 contestant, u8 jam" },
  { name: 'MakeContestantNervous', ret: "void", arity: 1, params: "u8 p" },
  { name: 'SpriteCB_JudgeSpeechBubble', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'Contest_GetMoveExcitement', ret: "s8", arity: 1, params: "u16 move" },
  { name: 'HideApplauseMeterNoAnim', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'ShowApplauseMeterNoAnim', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'IsContestantAllowedToCombo', ret: "bool8", arity: 1, params: "u8 contestant" },
  { name: 'Task_UpdateRaiseCurtainAtRoundEnd', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Contest_PrintTextToBg0WindowAt', ret: "void", arity: 5, params: "u32 windowId, u8 *currChar, s32 x, s32 y, s32 fontId" },
  { name: 'ResetContestLinkResults', ret: "void", arity: 0, params: "void" },
  { name: 'SaveContestWinner', ret: "bool8", arity: 1, params: "u8 rank" },
  { name: 'GetContestWinnerSaveIdx', ret: "u8", arity: 2, params: "u8 rank, bool8 shift" },
  { name: 'ClearContestWinnerPicsInContestHall', ret: "void", arity: 0, params: "void" },
  { name: 'ContestDebugToggleBitfields', ret: "void", arity: 1, params: "bool8 loserFlags" },
  { name: 'GetMonNicknameLanguage', ret: "u8", arity: 1, params: "u8 *nickname" },
  { name: 'StripPlayerAndMonNamesForLinkContest', ret: "void", arity: 2, params: "struct ContestPokemon *mon, s32 language" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_AnimateAudience',
  'Task_AppealSetup',
  'Task_ApplauseOverflowAnimation',
  'Task_BlendAudienceBackground',
  'Task_CommunicateFinalStandings',
  'Task_CommunicateMonIdxs',
  'Task_ContestReturnToField',
  'Task_DisplayAppealNumberText',
  'Task_DoAppeals',
  'Task_DropCurtainAtAppealsEnd',
  'Task_DropCurtainAtRoundEnd',
  'Task_EndAppeals',
  'Task_EndCommunicateFinalStandings',
  'Task_EndCommunicateMonIdxs',
  'Task_EndCommunicateMoveSelections',
  'Task_EndWaitForLink',
  'Task_FinishRoundOfAppeals',
  'Task_FlashJudgeAttentionEye',
  'Task_HandleMoveSelectInput',
  'Task_HideApplauseMeterForAppealStart',
  'Task_HideMoveSelectScreen',
  'Task_PrintRoundResultText',
  'Task_RaiseCurtainAtStart',
  'Task_ReUpdateHeartSliders',
  'Task_ReadyStartLinkContest',
  'Task_ReadyUpdateHeartSliders',
  'Task_ResetForNextRound',
  'Task_RestorePlttBufferUnfaded',
  'Task_SelectedMove',
  'Task_ShowAndUpdateApplauseMeter',
  'Task_ShowMoveSelectScreen',
  'Task_SlideApplauseMeterIn',
  'Task_SlideApplauseMeterOut',
  'Task_StartContestWaitFade',
  'Task_StartDropCurtainAtRoundEnd',
  'Task_StartNewRoundOfAppeals',
  'Task_StartRaiseCurtainAtRoundEnd',
  'Task_StopFlashJudgeAttentionEye',
  'Task_TryCommunicateFinalStandings',
  'Task_TryShowMoveSelectScreen',
  'Task_TryStartLinkContest',
  'Task_TryStartNextRoundOfAppeals',
  'Task_UnusedBlend',
  'Task_UpdateAppealHearts',
  'Task_UpdateContestantBoxOrder',
  'Task_UpdateCurtainDropAtRoundEnd',
  'Task_UpdateHeartSliders',
  'Task_UpdateRaiseCurtainAtRoundEnd',
  'Task_WaitForHeartSliders',
  'Task_WaitForHeartSlidersAgain',
  'Task_WaitForOutOfTimeMsg',
  'Task_WaitForSliderHeartAnim',
  'Task_WaitHideApplauseMeterForAppealStart',
  'Task_WaitPrintRoundResult',
  'Task_WaitRaiseCurtainAtRoundEnd',
  'Task_WaitToRaiseCurtainAtStart',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_ContestMain',
  'CB2_StartContest',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'gpu_regs.h',
  'bg.h',
  'malloc.h',
  'battle.h',
  'battle_anim.h',
  'contest.h',
  'contest_link.h',
  'data.h',
  'decompress.h',
  'graphics.h',
  'link.h',
  'm4a.h',
  'main.h',
  'menu.h',
  'overworld.h',
  'palette.h',
  'random.h',
  'new_game.h',
  'script.h',
  'sound.h',
  'sprite.h',
  'string_util.h',
  'task.h',
  'text.h',
  'tv.h',
  'scanline_effect.h',
  'util.h',
  'contest_util.h',
  'dma3.h',
  'battle_message.h',
  'event_scripts.h',
  'event_data.h',
  'strings.h',
  'contest_effect.h',
  'contest_link.h',
  'international_string_util.h',
  'data.h',
  'contest_ai.h',
  'constants/event_objects.h',
  'constants/items.h',
  'constants/moves.h',
  'constants/rgb.h',
  'constants/songs.h',
  'data/contest_text_tables.h',
  'data/contest_opponents.h',
] as const;
