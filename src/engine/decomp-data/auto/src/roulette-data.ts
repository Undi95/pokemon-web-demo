// AUTO-GENERATED from src/roulette.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/roulette.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const BALLS_PER_ROUND = 6;
export const NUM_BOARD_COLORS = 3;
export const NUM_BOARD_POKES = 4;
/** Raw expr: `(NUM_BOARD_COLORS * NUM_BOARD_POKES)` */
export const NUM_ROULETTE_SLOTS_EXPR = "(NUM_BOARD_COLORS * NUM_BOARD_POKES)";
/** Raw expr: `(360 / NUM_ROULETTE_SLOTS)` */
export const DEGREES_PER_SLOT_EXPR = "(360 / NUM_ROULETTE_SLOTS)";
/** Raw expr: `(DEGREES_PER_SLOT / 2 - 1)` */
export const SLOT_MIDPOINT_EXPR = "(DEGREES_PER_SLOT / 2 - 1)";
export const SELECTION_NONE = 0;
export const COL_WYNAUT = 1;
export const COL_AZURILL = 2;
export const COL_SKITTY = 3;
export const COL_MAKUHITA = 4;
/** Raw expr: `(COL_MAKUHITA + 1)` */
export const ROW_ORANGE_EXPR = "(COL_MAKUHITA + 1)";
/** Raw expr: `(ROW_ORANGE + COL_WYNAUT)` */
export const SQU_ORANGE_WYNAUT_EXPR = "(ROW_ORANGE + COL_WYNAUT)";
/** Raw expr: `(ROW_ORANGE + COL_AZURILL)` */
export const SQU_ORANGE_AZURILL_EXPR = "(ROW_ORANGE + COL_AZURILL)";
/** Raw expr: `(ROW_ORANGE + COL_SKITTY)` */
export const SQU_ORANGE_SKITTY_EXPR = "(ROW_ORANGE + COL_SKITTY)";
/** Raw expr: `(ROW_ORANGE + COL_MAKUHITA)` */
export const SQU_ORANGE_MAKUHITA_EXPR = "(ROW_ORANGE + COL_MAKUHITA)";
/** Raw expr: `(SQU_ORANGE_MAKUHITA + 1)` */
export const ROW_GREEN_EXPR = "(SQU_ORANGE_MAKUHITA + 1)";
/** Raw expr: `(ROW_GREEN + COL_WYNAUT)` */
export const SQU_GREEN_WYNAUT_EXPR = "(ROW_GREEN + COL_WYNAUT)";
/** Raw expr: `(ROW_GREEN + COL_AZURILL)` */
export const SQU_GREEN_AZURILL_EXPR = "(ROW_GREEN + COL_AZURILL)";
/** Raw expr: `(ROW_GREEN + COL_SKITTY)` */
export const SQU_GREEN_SKITTY_EXPR = "(ROW_GREEN + COL_SKITTY)";
/** Raw expr: `(ROW_GREEN + COL_MAKUHITA)` */
export const SQU_GREEN_MAKUHITA_EXPR = "(ROW_GREEN + COL_MAKUHITA)";
/** Raw expr: `(SQU_GREEN_MAKUHITA + 1)` */
export const ROW_PURPLE_EXPR = "(SQU_GREEN_MAKUHITA + 1)";
/** Raw expr: `(ROW_PURPLE + COL_WYNAUT)` */
export const SQU_PURPLE_WYNAUT_EXPR = "(ROW_PURPLE + COL_WYNAUT)";
/** Raw expr: `(ROW_PURPLE + COL_AZURILL)` */
export const SQU_PURPLE_AZURILL_EXPR = "(ROW_PURPLE + COL_AZURILL)";
/** Raw expr: `(ROW_PURPLE + COL_SKITTY)` */
export const SQU_PURPLE_SKITTY_EXPR = "(ROW_PURPLE + COL_SKITTY)";
/** Raw expr: `(ROW_PURPLE + COL_MAKUHITA)` */
export const SQU_PURPLE_MAKUHITA_EXPR = "(ROW_PURPLE + COL_MAKUHITA)";
/** Raw expr: `SQU_PURPLE_MAKUHITA` */
export const NUM_GRID_SELECTIONS_EXPR = "SQU_PURPLE_MAKUHITA";
/** Raw expr: `(1 << COL_WYNAUT)` */
export const F_WYNAUT_COL_EXPR = "(1 << COL_WYNAUT)";
/** Raw expr: `(1 << COL_AZURILL)` */
export const F_AZURILL_COL_EXPR = "(1 << COL_AZURILL)";
/** Raw expr: `(1 << COL_SKITTY)` */
export const F_SKITTY_COL_EXPR = "(1 << COL_SKITTY)";
/** Raw expr: `(1 << COL_MAKUHITA)` */
export const F_MAKUHITA_COL_EXPR = "(1 << COL_MAKUHITA)";
/** Raw expr: `(1 << ROW_ORANGE)` */
export const F_ORANGE_ROW_EXPR = "(1 << ROW_ORANGE)";
/** Raw expr: `(1 << SQU_ORANGE_WYNAUT)` */
export const F_ORANGE_WYNAUT_EXPR = "(1 << SQU_ORANGE_WYNAUT)";
/** Raw expr: `(1 << SQU_ORANGE_AZURILL)` */
export const F_ORANGE_AZURILL_EXPR = "(1 << SQU_ORANGE_AZURILL)";
/** Raw expr: `(1 << SQU_ORANGE_SKITTY)` */
export const F_ORANGE_SKITTY_EXPR = "(1 << SQU_ORANGE_SKITTY)";
/** Raw expr: `(1 << SQU_ORANGE_MAKUHITA)` */
export const F_ORANGE_MAKUHITA_EXPR = "(1 << SQU_ORANGE_MAKUHITA)";
/** Raw expr: `(1 << ROW_GREEN)` */
export const F_GREEN_ROW_EXPR = "(1 << ROW_GREEN)";
/** Raw expr: `(1 << SQU_GREEN_WYNAUT)` */
export const F_GREEN_WYNAUT_EXPR = "(1 << SQU_GREEN_WYNAUT)";
/** Raw expr: `(1 << SQU_GREEN_AZURILL)` */
export const F_GREEN_AZURILL_EXPR = "(1 << SQU_GREEN_AZURILL)";
/** Raw expr: `(1 << SQU_GREEN_SKITTY)` */
export const F_GREEN_SKITTY_EXPR = "(1 << SQU_GREEN_SKITTY)";
/** Raw expr: `(1 << SQU_GREEN_MAKUHITA)` */
export const F_GREEN_MAKUHITA_EXPR = "(1 << SQU_GREEN_MAKUHITA)";
/** Raw expr: `(1 << ROW_PURPLE)` */
export const F_PURPLE_ROW_EXPR = "(1 << ROW_PURPLE)";
/** Raw expr: `(1 << SQU_PURPLE_WYNAUT)` */
export const F_PURPLE_WYNAUT_EXPR = "(1 << SQU_PURPLE_WYNAUT)";
/** Raw expr: `(1 << SQU_PURPLE_AZURILL)` */
export const F_PURPLE_AZURILL_EXPR = "(1 << SQU_PURPLE_AZURILL)";
/** Raw expr: `(1 << SQU_PURPLE_SKITTY)` */
export const F_PURPLE_SKITTY_EXPR = "(1 << SQU_PURPLE_SKITTY)";
/** Raw expr: `(1 << SQU_PURPLE_MAKUHITA)` */
export const F_PURPLE_MAKUHITA_EXPR = "(1 << SQU_PURPLE_MAKUHITA)";
/** Raw expr: `(1 << 0)` */
export const F_FLASH_COLOR_O_WYNAUT_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 1)` */
export const F_FLASH_COLOR_G_AZURILL_EXPR = "(1 << 1)";
/** Raw expr: `(1 << 2)` */
export const F_FLASH_COLOR_P_SKITTY_EXPR = "(1 << 2)";
/** Raw expr: `(1 << 3)` */
export const F_FLASH_COLOR_O_MAKUHITA_EXPR = "(1 << 3)";
/** Raw expr: `(1 << 4)` */
export const F_FLASH_COLOR_G_WYNAUT_EXPR = "(1 << 4)";
/** Raw expr: `(1 << 5)` */
export const F_FLASH_COLOR_P_AZURILL_EXPR = "(1 << 5)";
/** Raw expr: `(1 << 6)` */
export const F_FLASH_COLOR_O_SKITTY_EXPR = "(1 << 6)";
/** Raw expr: `(1 << 7)` */
export const F_FLASH_COLOR_G_MAKUHITA_EXPR = "(1 << 7)";
/** Raw expr: `(1 << 8)` */
export const F_FLASH_COLOR_P_WYNAUT_EXPR = "(1 << 8)";
/** Raw expr: `(1 << 9)` */
export const F_FLASH_COLOR_O_AZURILL_EXPR = "(1 << 9)";
/** Raw expr: `(1 << 10)` */
export const F_FLASH_COLOR_G_SKITTY_EXPR = "(1 << 10)";
/** Raw expr: `(1 << 11)` */
export const F_FLASH_COLOR_P_MAKUHITA_EXPR = "(1 << 11)";
/** Raw expr: `(1 << 12)` */
export const F_FLASH_OUTER_EDGES_EXPR = "(1 << 12)";
/** Raw expr: `(NUM_ROULETTE_SLOTS + 1)` */
export const FLASH_ICON_EXPR = "(NUM_ROULETTE_SLOTS + 1)";
/** Raw expr: `(FLASH_ICON + 1)` */
export const FLASH_ICON_2_EXPR = "(FLASH_ICON + 1)";
/** Raw expr: `(FLASH_ICON + 2)` */
export const FLASH_ICON_3_EXPR = "(FLASH_ICON + 2)";
/** Raw expr: `(1 << FLASH_ICON)` */
export const F_FLASH_ICON_EXPR = "(1 << FLASH_ICON)";
/** Raw expr: `(1 << FLASH_ICON | 1 << FLASH_ICON_2 | 1 << FLASH_ICON_3)` */
export const F_FLASH_COLUMN_EXPR = "(1 << FLASH_ICON | 1 << FLASH_ICON_2 | 1 << FLASH_ICON_3)";
export const MAX_MULTIPLIER = 12;
export const PALTAG_SHADOW = 1;
export const PALTAG_BALL = 2;
export const PALTAG_BALL_COUNTER = 3;
export const PALTAG_CURSOR = 4;
export const PALTAG_INTERFACE = 5;
export const PALTAG_SHROOMISH = 6;
export const PALTAG_TAILLOW = 7;
export const PALTAG_GRID_ICONS = 8;
export const PALTAG_WYNAUT = 9;
export const PALTAG_AZURILL = 10;
export const PALTAG_SKITTY = 11;
export const PALTAG_MAKUHITA = 12;
export const GFXTAG_WHEEL_ICONS = 0;
export const GFXTAG_HEADERS = 4;
export const GFXTAG_GRID_ICONS = 5;
export const GFXTAG_WHEEL_CENTER = 6;
export const GFXTAG_CREDIT = 7;
export const GFXTAG_CREDIT_DIGIT = 8;
export const GFXTAG_MULTIPLIER = 9;
export const GFXTAG_BALL_COUNTER = 10;
export const GFXTAG_CURSOR = 11;
export const GFXTAG_BALL = 12;
export const GFXTAG_SHROOMISH_TAILLOW = 13;
export const GFXTAG_SHADOW = 14;
/** Raw expr: `(1 << 0)` */
export const HAS_SHROOMISH_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 1)` */
export const HAS_TAILLOW_EXPR = "(1 << 1)";
export const NO_DELAY = 65535;
/** Raw expr: `SPR_WHEEL_BALL_1` */
export const SPR_WHEEL_BALLS_EXPR = "SPR_WHEEL_BALL_1";
/** Raw expr: `SPR_WHEEL_ICON_ORANGE_WYNAUT` */
export const SPR_WHEEL_ICONS_EXPR = "SPR_WHEEL_ICON_ORANGE_WYNAUT";
/** Raw expr: `SPR_BALL_COUNTER_1` */
export const SPR_BALL_COUNTER_EXPR = "SPR_BALL_COUNTER_1";
/** Raw expr: `SPR_CREDIT_DIG_1` */
export const SPR_CREDIT_DIGITS_EXPR = "SPR_CREDIT_DIG_1";
/** Raw expr: `SPR_GRID_ICON_ORANGE_WYNAUT` */
export const SPR_GRID_ICONS_EXPR = "SPR_GRID_ICON_ORANGE_WYNAUT";
/** Raw expr: `SPR_POKE_HEADER_1` */
export const SPR_POKE_HEADERS_EXPR = "SPR_POKE_HEADER_1";
/** Raw expr: `SPR_COLOR_HEADER_1` */
export const SPR_COLOR_HEADERS_EXPR = "SPR_COLOR_HEADER_1";
/** Raw expr: `SPR_GRID_BALL_1` */
export const SPR_GRID_BALLS_EXPR = "SPR_GRID_BALL_1";
/** Raw expr: `data[2]` */
export const tMultiplier_EXPR = "data[2]";
/** Raw expr: `data[4]` */
export const tSelectionId_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tWonBet_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tBallNum_EXPR = "data[6]";
/** Raw expr: `data[8]` */
export const tTotalBallNum_EXPR = "data[8]";
/** Raw expr: `data[11]` */
export const tConsecutiveWins_EXPR = "data[11]";
/** Raw expr: `data[12]` */
export const tWinningSquare_EXPR = "data[12]";
/** Raw expr: `data[13]` */
export const tCoins_EXPR = "data[13]";
/** Raw expr: `data[1]` */
export const tPayout_EXPR = "data[1]";
/** Raw expr: `data[0]` */
export const sStuckOnWheelLeft_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sState_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sSlotMidpointDist_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sBallAngle_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sBallDistToCenter_EXPR = "data[4]";
/** Raw expr: `data[6]` */
export const sBallWheelAngle_EXPR = "data[6]";
/** Raw expr: `data[0]` */
export const sStillStuck_EXPR = "data[0]";
/** Raw expr: `data[4]` */
export const sMonSpriteId_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sBallShadowSpriteId_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const sMonShadowSpriteId_EXPR = "data[6]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_BALL_0 = {
  BALL_STATE_ROLLING: 0,
  BALL_STATE_STUCK: 1,
  BALL_STATE_LANDED: 255,
} as const;
export const ENUM_SELECT_1 = {
  SELECT_STATE_WAIT: 0,
  SELECT_STATE_DRAW: 1,
  SELECT_STATE_UPDATE: 2,
  SELECT_STATE_ERASE: 255,
} as const;
export const ENUM_SPR_2 = {
  SPR_WHEEL_BALL_1: 0,
  SPR_WHEEL_BALL_2: 1,
  SPR_WHEEL_BALL_3: 2,
  SPR_WHEEL_BALL_4: 3,
  SPR_WHEEL_BALL_5: 4,
  SPR_WHEEL_BALL_6: 5,
  SPR_WHEEL_CENTER: 6,
  SPR_WHEEL_ICON_ORANGE_WYNAUT: 7,
  SPR_WHEEL_ICON_GREEN_AZURILL: 8,
  SPR_WHEEL_ICON_PURPLE_SKITTY: 9,
  SPR_WHEEL_ICON_ORANGE_MAKUHITA: 10,
  SPR_WHEEL_ICON_GREEN_WYNAUT: 11,
  SPR_WHEEL_ICON_PURPLE_AZURILL: 12,
  SPR_WHEEL_ICON_ORANGE_SKITTY: 13,
  SPR_WHEEL_ICON_GREEN_MAKUHITA: 14,
  SPR_WHEEL_ICON_PURPLE_WYNAUT: 15,
  SPR_WHEEL_ICON_ORANGE_AZURILL: 16,
  SPR_WHEEL_ICON_GREEN_SKITTY: 17,
  SPR_WHEEL_ICON_PURPLE_MAKUHITA: 18,
  SPR_19: 19,
  SPR_CREDIT: 20,
  SPR_CREDIT_DIG_1: 21,
  SPR_CREDIT_DIG_10: 22,
  SPR_CREDIT_DIG_100: 23,
  SPR_CREDIT_DIG_1000: 24,
  SPR_MULTIPLIER: 25,
  SPR_BALL_COUNTER_1: 26,
  SPR_BALL_COUNTER_2: 27,
  SPR_BALL_COUNTER_3: 28,
  SPR_GRID_ICON_ORANGE_WYNAUT: 29,
  SPR_GRID_ICON_GREEN_AZURILL: 30,
  SPR_GRID_ICON_PURPLE_SKITTY: 31,
  SPR_GRID_ICON_ORANGE_MAKUHITA: 32,
  SPR_GRID_ICON_GREEN_WYNAUT: 33,
  SPR_GRID_ICON_PURPLE_AZURILL: 34,
  SPR_GRID_ICON_ORANGE_SKITTY: 35,
  SPR_GRID_ICON_GREEN_MAKUHITA: 36,
  SPR_GRID_ICON_PURPLE_WYNAUT: 37,
  SPR_GRID_ICON_ORANGE_AZURILL: 38,
  SPR_GRID_ICON_GREEN_SKITTY: 39,
  SPR_GRID_ICON_PURPLE_MAKUHITA: 40,
  SPR_POKE_HEADER_1: 41,
  SPR_POKE_HEADER_2: 42,
  SPR_POKE_HEADER_3: 43,
  SPR_POKE_HEADER_4: 44,
  SPR_COLOR_HEADER_1: 45,
  SPR_COLOR_HEADER_2: 46,
  SPR_COLOR_HEADER_3: 47,
  SPR_WIN_SLOT_CURSOR: 48,
  SPR_GRID_BALL_1: 49,
  SPR_GRID_BALL_2: 50,
  SPR_GRID_BALL_3: 51,
  SPR_GRID_BALL_4: 52,
  SPR_GRID_BALL_5: 53,
  SPR_GRID_BALL_6: 54,
  SPR_CLEAR_MON: 55,
  SPR_CLEAR_MON_SHADOW_1: 56,
  SPR_CLEAR_MON_SHADOW_2: 57,
  SPR_58: 58,
  SPR_59: 59,
  SPR_60: 60,
  SPR_61: 61,
  SPR_62: 62,
  SPR_63: 63,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplates = { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 26, height: 4, paletteNum: 15, baseBlock: 189 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 4, screenSize: 1, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 1, mapBaseIndex: 6, screenSize: 1, paletteMode: 1, priority: 2, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOam_GridHeader = { affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", shape: "SPRITE_SHAPE(32x32)", size: "SPRITE_SIZE(32x32)", priority: 1 } as const;
export const sOam_GridIcon = { affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", shape: "SPRITE_SHAPE(16x16)", size: "SPRITE_SIZE(16x16)", priority: 1 } as const;
export const sOam_WheelIcon = { y: 60, affineMode: "ST_OAM_AFFINE_DOUBLE", objMode: "ST_OAM_OBJ_NORMAL", shape: "SPRITE_SHAPE(16x32)", size: "SPRITE_SIZE(16x32)", priority: 2 } as const;
export const sOam_Credit = { affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", shape: "SPRITE_SHAPE(64x32)", size: "SPRITE_SIZE(64x32)", priority: 1 } as const;
export const sOam_CreditDigit = { affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", shape: "SPRITE_SHAPE(8x16)", size: "SPRITE_SIZE(8x16)", priority: 1 } as const;
export const sOam_Multiplier = { affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", shape: "SPRITE_SHAPE(32x16)", size: "SPRITE_SIZE(32x16)", priority: 1 } as const;
export const sOam_BallCounter = { affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", shape: "SPRITE_SHAPE(16x8)", size: "SPRITE_SIZE(16x8)", priority: 1 } as const;
export const sOam_Ball = { affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", shape: "SPRITE_SHAPE(16x16)", size: "SPRITE_SIZE(16x16)", priority: 2 } as const;
export const sOam_WheelCenter = { y: 81, affineMode: "ST_OAM_AFFINE_DOUBLE", objMode: "ST_OAM_OBJ_NORMAL", shape: "SPRITE_SHAPE(64x64)", size: "SPRITE_SIZE(64x64)", priority: 2 } as const;
export const sOam_Shroomish = { affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", shape: "SPRITE_SHAPE(32x32)", size: "SPRITE_SIZE(32x32)", priority: 2 } as const;
export const sOam_Taillow = { affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", shape: "SPRITE_SHAPE(32x32)", size: "SPRITE_SIZE(32x32)", priority: 2 } as const;
export const sOam_ShroomishBallShadow = { affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", shape: "SPRITE_SHAPE(16x16)", size: "SPRITE_SIZE(16x16)", priority: 2 } as const;
export const sOam_ShroomishShadow = { affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", shape: "SPRITE_SHAPE(32x16)", size: "SPRITE_SIZE(32x16)", priority: 2 } as const;
export const sOam_TaillowShadow = { affineMode: "ST_OAM_AFFINE_NORMAL", objMode: "ST_OAM_OBJ_NORMAL", shape: "SPRITE_SHAPE(32x16)", size: "SPRITE_SIZE(32x16)", priority: 2 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplates_PokeHeaders = [
  { tileTag: "GFXTAG_HEADERS", paletteTag: "PALTAG_GRID_ICONS", oam: "&sOam_GridHeader", anims: "sAnim_WynautHeader", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_GridSquare" },
  { tileTag: "GFXTAG_HEADERS", paletteTag: "PALTAG_GRID_ICONS", oam: "&sOam_GridHeader", anims: "sAnim_AzurillHeader", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_GridSquare" },
  { tileTag: "GFXTAG_HEADERS", paletteTag: "PALTAG_GRID_ICONS", oam: "&sOam_GridHeader", anims: "sAnim_SkittyHeader", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_GridSquare" },
  { tileTag: "GFXTAG_HEADERS", paletteTag: "PALTAG_GRID_ICONS", oam: "&sOam_GridHeader", anims: "sAnim_MakuhitaHeader", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_GridSquare" },
] as const;
export const sSpriteTemplates_ColorHeaders = [
  { tileTag: "GFXTAG_HEADERS", paletteTag: "PALTAG_GRID_ICONS", oam: "&sOam_GridHeader", anims: "sAnim_OrangeHeader", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_GridSquare" },
  { tileTag: "GFXTAG_HEADERS", paletteTag: "PALTAG_GRID_ICONS", oam: "&sOam_GridHeader", anims: "sAnim_GreenHeader", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_GridSquare" },
  { tileTag: "GFXTAG_HEADERS", paletteTag: "PALTAG_GRID_ICONS", oam: "&sOam_GridHeader", anims: "sAnim_PurpleHeader", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_GridSquare" },
] as const;
export const sSpriteTemplates_GridIcons = [
  { tileTag: "GFXTAG_GRID_ICONS", paletteTag: "PALTAG_GRID_ICONS", oam: "&sOam_GridIcon", anims: "sAnim_GridIcon_Wynaut", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_GridSquare" },
  { tileTag: "GFXTAG_GRID_ICONS", paletteTag: "PALTAG_GRID_ICONS", oam: "&sOam_GridIcon", anims: "sAnim_GridIcon_Azurill", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_GridSquare" },
  { tileTag: "GFXTAG_GRID_ICONS", paletteTag: "PALTAG_GRID_ICONS", oam: "&sOam_GridIcon", anims: "sAnim_GridIcon_Skitty", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_GridSquare" },
  { tileTag: "GFXTAG_GRID_ICONS", paletteTag: "PALTAG_GRID_ICONS", oam: "&sOam_GridIcon", anims: "sAnim_GridIcon_Makuhita", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_GridSquare" },
] as const;
export const sSpriteTemplates_WheelIcons = [
  { tileTag: "GFXTAG_WHEEL_ICONS", paletteTag: "PALTAG_WYNAUT", oam: "&sOam_WheelIcon", anims: "sAnim_WheelIcon_OrangeWynaut", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_WheelIcon" },
  { tileTag: "GFXTAG_WHEEL_ICONS", paletteTag: "PALTAG_AZURILL", oam: "&sOam_WheelIcon", anims: "sAnim_WheelIcon_GreenAzurill", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_WheelIcon" },
  { tileTag: "GFXTAG_WHEEL_ICONS", paletteTag: "PALTAG_SKITTY", oam: "&sOam_WheelIcon", anims: "sAnim_WheelIcon_PurpleSkitty", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_WheelIcon" },
  { tileTag: "GFXTAG_WHEEL_ICONS", paletteTag: "PALTAG_MAKUHITA", oam: "&sOam_WheelIcon", anims: "sAnim_WheelIcon_OrangeMakuhita", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_WheelIcon" },
  { tileTag: "GFXTAG_WHEEL_ICONS", paletteTag: "PALTAG_WYNAUT", oam: "&sOam_WheelIcon", anims: "sAnim_WheelIcon_GreenWynaut", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_WheelIcon" },
  { tileTag: "GFXTAG_WHEEL_ICONS", paletteTag: "PALTAG_AZURILL", oam: "&sOam_WheelIcon", anims: "sAnim_WheelIcon_PurpleAzurill", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_WheelIcon" },
  { tileTag: "GFXTAG_WHEEL_ICONS", paletteTag: "PALTAG_SKITTY", oam: "&sOam_WheelIcon", anims: "sAnim_WheelIcon_OrangeSkitty", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_WheelIcon" },
  { tileTag: "GFXTAG_WHEEL_ICONS", paletteTag: "PALTAG_MAKUHITA", oam: "&sOam_WheelIcon", anims: "sAnim_WheelIcon_GreenMakuhita", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_WheelIcon" },
  { tileTag: "GFXTAG_WHEEL_ICONS", paletteTag: "PALTAG_WYNAUT", oam: "&sOam_WheelIcon", anims: "sAnim_WheelIcon_PurpleWynaut", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_WheelIcon" },
  { tileTag: "GFXTAG_WHEEL_ICONS", paletteTag: "PALTAG_AZURILL", oam: "&sOam_WheelIcon", anims: "sAnim_WheelIcon_OrangeAzurill", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_WheelIcon" },
  { tileTag: "GFXTAG_WHEEL_ICONS", paletteTag: "PALTAG_SKITTY", oam: "&sOam_WheelIcon", anims: "sAnim_WheelIcon_GreenSkitty", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_WheelIcon" },
  { tileTag: "GFXTAG_WHEEL_ICONS", paletteTag: "PALTAG_MAKUHITA", oam: "&sOam_WheelIcon", anims: "sAnim_WheelIcon_PurpleMakuhita", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_WheelIcon" },
] as const;
export const sSpriteTemplate_Credit = { tileTag: "GFXTAG_CREDIT", paletteTag: "PALTAG_INTERFACE", oam: "&sOam_Credit", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_CreditDigit = { tileTag: "GFXTAG_CREDIT_DIGIT", paletteTag: "PALTAG_INTERFACE", oam: "&sOam_CreditDigit", anims: "sAnims_CreditDigit", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Multiplier = { tileTag: "GFXTAG_MULTIPLIER", paletteTag: "PALTAG_INTERFACE", oam: "&sOam_Multiplier", anims: "sAnims_Multiplier", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_GridSquare" } as const;
export const sSpriteTemplate_BallCounter = { tileTag: "GFXTAG_BALL_COUNTER", paletteTag: "PALTAG_BALL_COUNTER", oam: "&sOam_BallCounter", anims: "sAnims_BallCounter", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Cursor = { tileTag: "GFXTAG_CURSOR", paletteTag: "PALTAG_INTERFACE", oam: "&sOam_GridHeader", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Ball = { tileTag: "GFXTAG_BALL", paletteTag: "PALTAG_BALL", oam: "&sOam_Ball", anims: "sAnims_Ball", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_WheelCenter = { tileTag: "GFXTAG_WHEEL_CENTER", paletteTag: "PALTAG_BALL", oam: "&sOam_WheelCenter", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_WheelCenter" } as const;
export const sSpriteTemplate_Shroomish = { tileTag: "GFXTAG_SHROOMISH_TAILLOW", paletteTag: "PALTAG_SHROOMISH", oam: "&sOam_Shroomish", anims: "sAnims_Shroomish", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Taillow = { tileTag: "GFXTAG_SHROOMISH_TAILLOW", paletteTag: "PALTAG_TAILLOW", oam: "&sOam_Taillow", anims: "sAnims_Taillow", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Taillow" } as const;
export const sSpriteTemplate_ShroomishShadow = [
  { tileTag: "GFXTAG_SHADOW", paletteTag: "PALTAG_SHADOW", oam: "&sOam_ShroomishBallShadow", anims: "sAnims_ShroomishBallShadow", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
  { tileTag: "GFXTAG_SHADOW", paletteTag: "PALTAG_SHADOW", oam: "&sOam_ShroomishShadow", anims: "sAnims_UnstickMonShadow", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Shroomish" },
] as const;
export const sSpriteTemplate_TaillowShadow = { tileTag: "GFXTAG_SHADOW", paletteTag: "PALTAG_SHADOW", oam: "&sOam_TaillowShadow", anims: "sAnims_UnstickMonShadow", images: 0, affineAnims: "sAffineAnims_TaillowShadow", callback: "SpriteCB_Taillow" } as const;

// ─── CompressedSpriteSheet ─────────────────────────────────────────────────────────────
export const sSpriteSheet_WheelIcons = { data: "sWheelIcons_Gfx", size: 3072, tag: "GFXTAG_WHEEL_ICONS" } as const;
export const sSpriteSheet_Headers = { data: "gRouletteHeaders_Gfx", size: 5632, tag: "GFXTAG_HEADERS" } as const;
export const sSpriteSheet_GridIcons = { data: "sGridIcons_Gfx", size: 1024, tag: "GFXTAG_GRID_ICONS" } as const;
export const sSpriteSheets_Interface = [
  { data: "gRouletteCredit_Gfx", size: 1024, tag: "GFXTAG_CREDIT" },
  { data: "gRouletteNumbers_Gfx", size: 640, tag: "GFXTAG_CREDIT_DIGIT" },
  { data: "gRouletteMultiplier_Gfx", size: 1280, tag: "GFXTAG_MULTIPLIER" },
  { data: "sBallCounter_Gfx", size: 320, tag: "GFXTAG_BALL_COUNTER" },
  { data: "sCursor_Gfx", size: 512, tag: "GFXTAG_CURSOR" },
] as const;
export const sSpriteSheet_Ball = { data: "sBall_Gfx", size: 512, tag: "GFXTAG_BALL" } as const;
export const sSpriteSheet_WheelCenter = { data: "gRouletteCenter_Gfx", size: 2048, tag: "GFXTAG_WHEEL_CENTER" } as const;
export const sSpriteSheet_ShroomishTaillow = { data: "sShroomishTaillow_Gfx", size: 3584, tag: "GFXTAG_SHROOMISH_TAILLOW" } as const;
export const sSpriteSheet_Shadow = { data: "sShadow_Gfx", size: 384, tag: "GFXTAG_SHADOW" } as const;

// ─── SpritePalette ─────────────────────────────────────────────────────────────
export const sSpritePalettes = [
  { data: "gRouletteShadow_Pal", tag: "PALTAG_SHADOW" },
  { data: "gRouletteBall_Pal", tag: "PALTAG_BALL" },
  { data: "gRouletteBallCounter_Pal", tag: "PALTAG_BALL_COUNTER" },
  { data: "gRouletteCursor_Pal", tag: "PALTAG_CURSOR" },
  { data: "gRouletteCredit_Pal", tag: "PALTAG_INTERFACE" },
  { data: "gRouletteShroomish_Pal", tag: "PALTAG_SHROOMISH" },
  { data: "gRouletteTaillow_Pal", tag: "PALTAG_TAILLOW" },
  { data: "gRouletteGridIcons_Pal", tag: "PALTAG_GRID_ICONS" },
  { data: "gRouletteWynaut_Pal", tag: "PALTAG_WYNAUT" },
  { data: "gRouletteAzurill_Pal", tag: "PALTAG_AZURILL" },
  { data: "gRouletteSkitty_Pal", tag: "PALTAG_SKITTY" },
  { data: "gRouletteMakuhita_Pal", tag: "PALTAG_MAKUHITA" },
] as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sWheel_Pal': { path: 'graphics/roulette/wheel.png', ext: '.gbapal', type: 'u16' },
  'sGrid_Tilemap': { path: 'graphics/roulette/grid.bin', ext: '.lz', type: 'u32' },
  'sWheel_Tilemap': { path: 'graphics/roulette/wheel.bin', ext: '.lz', type: 'u32' },
  'sBall_Gfx': { path: 'graphics/roulette/ball.png', ext: '.4bpp.lz', type: 'u32' },
  'sBallCounter_Gfx': { path: 'graphics/roulette/ball_counter.png', ext: '.4bpp.lz', type: 'u32' },
  'sShroomishTaillow_Gfx': { path: 'graphics/roulette/roulette_tilt.4bpp', ext: '.lz', type: 'u32' },
  'sGridIcons_Gfx': { path: 'graphics/roulette/grid_icons.png', ext: '.4bpp.lz', type: 'u32' },
  'sWheelIcons_Gfx': { path: 'graphics/roulette/wheel_icons.4bpp', ext: '.lz', type: 'u32' },
  'sShadow_Gfx': { path: 'graphics/roulette/shadow.png', ext: '.4bpp.lz', type: 'u32' },
  'sCursor_Gfx': { path: 'graphics/roulette/cursor.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sTableMinBets: readonly number[] = [1,3,1,6] as const;
export const sShroomishShadowAlphas: readonly number[] = [2311,2056,1801,1546,1291,1036,781,526,271,16] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sTextWindowId', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_SpinWheel', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_StartPlaying', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ContinuePlaying', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_StopPlaying', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_SelectFirstEmptySquare', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleBetGridInput', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_SlideGridOffscreen', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_InitBallRoll', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_RollBall', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_RecordBallHit', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_SlideGridOnscreen', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_FlashBallOnWinningSquare', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_PrintSpinResult', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_PrintPayout', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_EndTurn', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_TryPrintEndTurnMsg', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ClearBoard', ret: "void", arity: 1, params: "u8" },
  { name: 'ExitRoulette', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ExitRoulette', ret: "void", arity: 1, params: "u8" },
  { name: 'StartTaskAfterDelayOrInput', ret: "void", arity: 4, params: "u8, TaskFunc, u16, u16" },
  { name: 'ResetBallDataForNewSpin', ret: "void", arity: 1, params: "u8" },
  { name: 'ResetHits', ret: "void", arity: 0, params: "void" },
  { name: 'Task_AcceptMinBet', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_DeclineMinBet', ret: "void", arity: 1, params: "u8" },
  { name: 'RecordHit', ret: "u8", arity: 2, params: "u8, u8" },
  { name: 'IsHitInBetSelection', ret: "bool8", arity: 2, params: "u8, u8" },
  { name: 'FlashSelectionOnWheel', ret: "void", arity: 1, params: "u8" },
  { name: 'DrawGridBackground', ret: "void", arity: 1, params: "u8" },
  { name: 'GetMultiplier', ret: "u8", arity: 1, params: "u8" },
  { name: 'UpdateWheelPosition', ret: "void", arity: 0, params: "void" },
  { name: 'LoadOrFreeMiscSpritePalettesAndSheets', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateGridSprites', ret: "void", arity: 0, params: "void" },
  { name: 'ShowHideGridIcons', ret: "void", arity: 2, params: "bool8, u8" },
  { name: 'CreateGridBallSprites', ret: "void", arity: 0, params: "void" },
  { name: 'ShowHideGridBalls', ret: "void", arity: 2, params: "bool8, u8" },
  { name: 'ShowHideWinSlotCursor', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateWheelIconSprites', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_WheelIcon', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'CreateInterfaceSprites', ret: "void", arity: 0, params: "void" },
  { name: 'SetCreditDigits', ret: "void", arity: 1, params: "u16" },
  { name: 'SetMultiplierSprite', ret: "void", arity: 1, params: "u8" },
  { name: 'SetBallCounterNumLeft', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_GridSquare', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'CreateWheelCenterSprite', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_WheelCenter', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'CreateWheelBallSprites', ret: "void", arity: 0, params: "void" },
  { name: 'HideWheelBalls', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_RollBall_Start', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'CreateShroomishSprite', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'CreateTaillowSprite', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SetBallStuck', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Shroomish', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Taillow', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'CB2_Roulette', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_Roulette', ret: "void", arity: 0, params: "void" },
  { name: 'InitRouletteBgAndWindows', ret: "void", arity: 0, params: "void" },
  { name: 'FreeRoulette', ret: "void", arity: 0, params: "void" },
  { name: 'InitRouletteTableData', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_LoadRoulette', ret: "void", arity: 0, params: "void" },
  { name: 'Task_AskKeepPlaying', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'UpdateGridSelectionRect', ret: "void", arity: 1, params: "u8 selectionId" },
  { name: 'UpdateGridSelection', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_StartHandleBetGridInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CanMoveSelectionInDir', ret: "bool8", arity: 2, params: "s16 *selectionId, u8 dir" },
  { name: 'ProcessBetGridInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_StartSpin', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_PlaceBet', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'GetRandomForBallTravelDistance', ret: "u8", arity: 2, params: "u16 ballNum, u16 rand" },
  { name: 'Task_TryIncrementWins', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_GivePayout', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_WaitForNextTask', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ShowMinBetYesNo', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_FadeToRouletteGame', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_NotEnoughForMinBet', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_PrintMinBet', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_PrintRouletteEntryMsg', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'PlayRoulette', ret: "void", arity: 0, params: "void" },
  { name: 'CreateWheelIconSprite', ret: "u8", arity: 3, params: "const struct SpriteTemplate *template, u8 r1, u16 *angle" },
  { name: 'DestroyGridSprites', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'GetMultiplierAnimId', ret: "u8", arity: 1, params: "u8 selectionId" },
  { name: 'UpdateBallRelativeWheelAngle', ret: "s16", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UpdateSlotBelowBall', ret: "u8", arity: 1, params: "struct Sprite *sprite" },
  { name: 'GetBallDistanceToSlotMidpoint', ret: "s16", arity: 1, params: "struct Sprite *sprite" },
  { name: 'UpdateBallPos', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_BallLandInSlot', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_UnstickBall_ShroomishBallFall', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_UnstickBall_Shroomish', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_UnstickBall_TaillowDrop', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_UnstickBall_TaillowPickUp', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_UnstickBall_Taillow', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_UnstickBall', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_RollBall_TryLandAdjacent', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_RollBall_TryLand', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_RollBall_Slow', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_RollBall_Medium', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_RollBall_Fast', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'PlayCry_Normal', ret: "else", arity: 2, params: "SPECIES_TAILLOW, 63" },
  { name: 'SpriteCB_ShroomishExit', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_ShroomishShakeScreen', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_ShroomishFall', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_TaillowShadow_Flash', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_Taillow_FlyAway', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_Taillow_PickUpBall', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_Taillow_FlyIn', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_TaillowShadow_FlyIn', ret: "void", arity: 1, params: "struct Sprite *sprite" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_AcceptMinBet',
  'Task_AskKeepPlaying',
  'Task_ClearBoard',
  'Task_ContinuePlaying',
  'Task_DeclineMinBet',
  'Task_EndTurn',
  'Task_ExitRoulette',
  'Task_FadeToRouletteGame',
  'Task_FlashBallOnWinningSquare',
  'Task_GivePayout',
  'Task_HandleBetGridInput',
  'Task_InitBallRoll',
  'Task_NotEnoughForMinBet',
  'Task_PlaceBet',
  'Task_PrintMinBet',
  'Task_PrintPayout',
  'Task_PrintRouletteEntryMsg',
  'Task_PrintSpinResult',
  'Task_RecordBallHit',
  'Task_RollBall',
  'Task_SelectFirstEmptySquare',
  'Task_ShowMinBetYesNo',
  'Task_SlideGridOffscreen',
  'Task_SlideGridOnscreen',
  'Task_SpinWheel',
  'Task_StartHandleBetGridInput',
  'Task_StartPlaying',
  'Task_StartSpin',
  'Task_StopPlaying',
  'Task_TryIncrementWins',
  'Task_TryPrintEndTurnMsg',
  'Task_WaitForNextTask',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_LoadRoulette',
  'CB2_Roulette',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'bg.h',
  'coins.h',
  'decompress.h',
  'event_data.h',
  'field_screen_effect.h',
  'gpu_regs.h',
  'graphics.h',
  'm4a.h',
  'main.h',
  'menu.h',
  'menu_helpers.h',
  'overworld.h',
  'palette.h',
  'palette_util.h',
  'random.h',
  'roulette.h',
  'rtc.h',
  'scanline_effect.h',
  'script.h',
  'sound.h',
  'sprite.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'trig.h',
  'tv.h',
  'window.h',
  'constants/coins.h',
  'constants/rgb.h',
  'constants/roulette.h',
  'constants/songs.h',
] as const;
