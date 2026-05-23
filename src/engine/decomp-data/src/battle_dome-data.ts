// AUTO-GENERATED from src/battle_dome.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_dome.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_BUTTONS = 0;
/** Raw expr: `((FRONTIER_PARTY_SIZE + 1) * 4)` */
export const NUM_INFOCARD_SPRITES_EXPR = "((FRONTIER_PARTY_SIZE + 1) * 4)";
export const NUM_INFOCARD_TRAINERS = 2;
/** Raw expr: `gSaveBlock2Ptr->frontier.domeTrainers` */
export const DOME_TRAINERS_EXPR = "gSaveBlock2Ptr->frontier.domeTrainers";
/** Raw expr: `gSaveBlock2Ptr->frontier.domeMonIds` */
export const DOME_MONS_EXPR = "gSaveBlock2Ptr->frontier.domeMonIds";
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tNotInteractive_EXPR = "data[1]";
/** Raw expr: `data[4]` */
export const tIsPrevTourneyTree_EXPR = "data[4]";
/** Raw expr: `data[1]` */
export const tTournamentId_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tMode_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tPrevTaskId_EXPR = "data[3]";
export const NAME_ROW_HEIGHT = 16;
/** Raw expr: `(6 << 12)` */
export const LINE_PAL_EXPR = "(6 << 12)";
/** Raw expr: `(LINE_PAL | 0x21)` */
export const LINE_H_EXPR = "(LINE_PAL | 0x21)";
/** Raw expr: `(LINE_PAL | 0x23)` */
export const LINE_CORNER_R_EXPR = "(LINE_PAL | 0x23)";
/** Raw expr: `(LINE_PAL | 0x25)` */
export const LINE_CORNER_L_EXPR = "(LINE_PAL | 0x25)";
/** Raw expr: `(LINE_PAL | 0x27)` */
export const LINE_V_R_EXPR = "(LINE_PAL | 0x27)";
/** Raw expr: `(LINE_PAL | 0x29)` */
export const LINE_V_L_EXPR = "(LINE_PAL | 0x29)";
/** Raw expr: `(LINE_PAL | 0x2B)` */
export const LINE_H_BOTTOM_EXPR = "(LINE_PAL | 0x2B)";
/** Raw expr: `(LINE_PAL | 0x2C)` */
export const LINE_H_LOGO1_EXPR = "(LINE_PAL | 0x2C)";
/** Raw expr: `(LINE_PAL | 0x2D)` */
export const LINE_H_LOGO2_EXPR = "(LINE_PAL | 0x2D)";
/** Raw expr: `(LINE_PAL | 0x2E)` */
export const LINE_H_LOGO3_EXPR = "(LINE_PAL | 0x2E)";
/** Raw expr: `(LINE_PAL | 0x2F)` */
export const LINE_H_LOGO4_EXPR = "(LINE_PAL | 0x2F)";
/** Raw expr: `(LINE_PAL | 0x30)` */
export const LINE_V_R_LOGO1_EXPR = "(LINE_PAL | 0x30)";
/** Raw expr: `(LINE_PAL | 0x31)` */
export const LINE_V_R_LOGO2_EXPR = "(LINE_PAL | 0x31)";
/** Raw expr: `(LINE_PAL | 0x32)` */
export const LINE_V_R_LOGO3_EXPR = "(LINE_PAL | 0x32)";
/** Raw expr: `(LINE_PAL | 0x33)` */
export const LINE_V_R_LOGO4_EXPR = "(LINE_PAL | 0x33)";
/** Raw expr: `(LINE_PAL | 0x35)` */
export const LINE_V_L_LOGO1_EXPR = "(LINE_PAL | 0x35)";
/** Raw expr: `(LINE_PAL | 0x36)` */
export const LINE_V_L_LOGO2_EXPR = "(LINE_PAL | 0x36)";
/** Raw expr: `(LINE_PAL | 0x37)` */
export const LINE_V_L_LOGO3_EXPR = "(LINE_PAL | 0x37)";
/** Raw expr: `(LINE_PAL | 0x38)` */
export const LINE_V_L_LOGO4_EXPR = "(LINE_PAL | 0x38)";
/** Raw expr: `(LINE_PAL | 0x3B)` */
export const LINE_V_R_HALF_LOGO_EXPR = "(LINE_PAL | 0x3B)";
/** Raw expr: `(LINE_PAL | 0x3C)` */
export const LINE_V_L_HALF_LOGO_EXPR = "(LINE_PAL | 0x3C)";
/** Raw expr: `(LINE_PAL | 0x43)` */
export const LINE_CORNER_R_HALF_EXPR = "(LINE_PAL | 0x43)";
/** Raw expr: `(LINE_PAL | 0x45)` */
export const LINE_CORNER_L_HALF_EXPR = "(LINE_PAL | 0x45)";
/** Raw expr: `(LINE_PAL | 0x47)` */
export const LINE_V_R_HALF_EXPR = "(LINE_PAL | 0x47)";
/** Raw expr: `(LINE_PAL | 0x49)` */
export const LINE_V_L_HALF_EXPR = "(LINE_PAL | 0x49)";
/** Raw expr: `\` */
export const LINESECTION_SEMIFINAL_TOP_LEFT_EXPR = "\\";
/** Raw expr: `\` */
export const LINESECTION_SEMIFINAL_BOTTOM_LEFT_EXPR = "\\";
/** Raw expr: `\` */
export const LINESECTION_SEMIFINAL_TOP_RIGHT_EXPR = "\\";
/** Raw expr: `\` */
export const LINESECTION_SEMIFINAL_BOTTOM_RIGHT_EXPR = "\\";
/** Raw expr: `\` */
export const LINESECTION_FINAL_LEFT_EXPR = "\\";
/** Raw expr: `\` */
export const LINESECTION_FINAL_RIGHT_EXPR = "\\";
export const TYPE_x0 = 0;
export const TYPE_x0_25 = 5;
export const TYPE_x0_50 = 10;
export const TYPE_x1 = 20;
export const TYPE_x2 = 40;
export const TYPE_x4 = 80;
/** Raw expr: `TYPE_x2` */
export const WONDER_GUARD_EFFECTIVENESS_EXPR = "TYPE_x2";
/** Raw expr: `data[3]` */
export const sMonIconStill_EXPR = "data[3]";
export const STATE_FADE_IN = 0;
export const STATE_WAIT_FADE = 1;
export const STATE_GET_INPUT = 2;
export const STATE_REACT_INPUT = 3;
export const STATE_MOVE_UP = 4;
export const STATE_MOVE_DOWN = 5;
export const STATE_MOVE_LEFT = 6;
export const STATE_MOVE_RIGHT = 7;
export const STATE_CLOSE_CARD = 8;
/** Raw expr: `data[2]` */
export const tUsingAlternateSlot_EXPR = "data[2]";
/** Raw expr: `max(NUM_STATS * FRONTIER_PARTY_SIZE, NUM_MOVE_POINT_TYPES)` */
export const ALLOC_ARRAY_SIZE_EXPR = "max(NUM_STATS * FRONTIER_PARTY_SIZE, NUM_MOVE_POINT_TYPES)";
export const STATE_SHOW_INFOCARD_TRAINER = 3;
export const STATE_SHOW_INFOCARD_MATCH = 5;
export const STATE_CLOSE_TOURNEY_TREE = 7;
export const MOVE_DIR_UP = 0;
export const MOVE_DIR_DOWN = 1;
export const MOVE_DIR_LEFT = 2;
export const MOVE_DIR_RIGHT = 3;
export const MOVE_DIR_NONE = 4;
export const STATE_SHOW_RESULTS = 1;
export const STATE_DELAY = 2;
export const STATE_WAIT_FOR_INPUT = 3;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_EFFECTIVENESS_0 = {
  EFFECTIVENESS_MODE_GOOD: 0,
  EFFECTIVENESS_MODE_BAD: 1,
  EFFECTIVENESS_MODE_AI_VS_AI: 2,
} as const;
export const ENUM_TOURNEYWIN_1 = {
  TOURNEYWIN_NAMES_LEFT: 0,
  TOURNEYWIN_NAMES_RIGHT: 1,
  TOURNEYWIN_TITLE: 2,
} as const;
export const ENUM_WIN_2 = {
  WIN_TRAINER_NAME: 0,
  WIN_TRAINER_MON1_NAME: 1,
  WIN_TRAINER_MON2_NAME: 2,
  WIN_TRAINER_MON3_NAME: 3,
  WIN_TRAINER_FLAVOR_TEXT: 4,
  WIN_MATCH_NUMBER: 5,
  WIN_MATCH_TRAINER_NAME_LEFT: 6,
  WIN_MATCH_TRAINER_NAME_RIGHT: 7,
  WIN_MATCH_WIN_TEXT: 8,
  NUM_INFO_CARD_WINDOWS: 9,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sTourneyTreeWindowTemplates = [
  { bg: 0, tilemapLeft: 0, tilemapTop: 3, width: 8, height: 16, paletteNum: 15, baseBlock: 16 },
  { bg: 0, tilemapLeft: 22, tilemapTop: 3, width: 8, height: 16, paletteNum: 15, baseBlock: 144 },
  { bg: 0, tilemapLeft: 8, tilemapTop: 1, width: 14, height: 2, paletteNum: 15, baseBlock: 272 },
] as const;
export const sInfoCardWindowTemplates = [
  { bg: 0, tilemapLeft: 2, tilemapTop: 2, width: 26, height: 2, paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: 16, tilemapTop: 5, width: 8, height: 2, paletteNum: 15, baseBlock: 53 },
  { bg: 0, tilemapLeft: 19, tilemapTop: 7, width: 9, height: 3, paletteNum: 15, baseBlock: 69 },
  { bg: 0, tilemapLeft: 16, tilemapTop: 10, width: 8, height: 2, paletteNum: 15, baseBlock: 96 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 12, width: 26, height: 7, paletteNum: 15, baseBlock: 112 },
  { bg: 0, tilemapLeft: 5, tilemapTop: 2, width: 23, height: 2, paletteNum: 15, baseBlock: 294 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 5, width: 8, height: 2, paletteNum: 15, baseBlock: 340 },
  { bg: 0, tilemapLeft: 20, tilemapTop: 5, width: 8, height: 2, paletteNum: 15, baseBlock: 356 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 16, width: 26, height: 2, paletteNum: 15, baseBlock: 372 },
  { bg: 1, tilemapLeft: 2, tilemapTop: 2, width: 26, height: 2, paletteNum: 15, baseBlock: 1 },
  { bg: 1, tilemapLeft: 16, tilemapTop: 5, width: 8, height: 2, paletteNum: 15, baseBlock: 53 },
  { bg: 1, tilemapLeft: 19, tilemapTop: 7, width: 9, height: 3, paletteNum: 15, baseBlock: 69 },
  { bg: 1, tilemapLeft: 16, tilemapTop: 10, width: 8, height: 2, paletteNum: 15, baseBlock: 96 },
  { bg: 1, tilemapLeft: 2, tilemapTop: 12, width: 26, height: 7, paletteNum: 15, baseBlock: 112 },
  { bg: 1, tilemapLeft: 5, tilemapTop: 2, width: 23, height: 2, paletteNum: 15, baseBlock: 294 },
  { bg: 1, tilemapLeft: 2, tilemapTop: 5, width: 8, height: 2, paletteNum: 15, baseBlock: 340 },
  { bg: 1, tilemapLeft: 20, tilemapTop: 5, width: 8, height: 2, paletteNum: 15, baseBlock: 356 },
  { bg: 1, tilemapLeft: 2, tilemapTop: 16, width: 26, height: 2, paletteNum: 15, baseBlock: 372 },
] as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sTourneyTreeBgTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 28, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
] as const;
export const sInfoCardBgTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 20, screenSize: 3, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 24, screenSize: 3, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 28, screenSize: 3, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 3, charBaseIndex: 2, mapBaseIndex: 7, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_TourneyTreePokeball = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_TourneyTreeCloseButton = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x16)", tileNum: 0, priority: 0, paletteNum: 1, affineParam: 0 } as const;
export const sOamData_VerticalScrollArrow = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x8)", tileNum: 0, priority: 0, paletteNum: 2, affineParam: 0 } as const;
export const sOamData_HorizontalScrollArrow = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(8x16)", tileNum: 0, priority: 0, paletteNum: 2, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sTourneyTreePokeballSpriteTemplate = { tileTag: "TAG_BUTTONS", paletteTag: "TAG_NONE", oam: "&sOamData_TourneyTreePokeball", anims: "sSpriteAnimTable_TourneyTreePokeball", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sCancelButtonSpriteTemplate = { tileTag: "TAG_BUTTONS", paletteTag: "TAG_NONE", oam: "&sOamData_TourneyTreeCloseButton", anims: "sSpriteAnimTable_TourneyTreeCancelButton", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sExitButtonSpriteTemplate = { tileTag: "TAG_BUTTONS", paletteTag: "TAG_NONE", oam: "&sOamData_TourneyTreeCloseButton", anims: "sSpriteAnimTable_TourneyTreeExitButton", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sHorizontalScrollArrowSpriteTemplate = { tileTag: "TAG_BUTTONS", paletteTag: "TAG_NONE", oam: "&sOamData_HorizontalScrollArrow", anims: "sSpriteAnimTable_HorizontalScrollArrow", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_HorizontalScrollArrow" } as const;
export const sVerticalScrollArrowSpriteTemplate = { tileTag: "TAG_BUTTONS", paletteTag: "TAG_NONE", oam: "&sOamData_VerticalScrollArrow", anims: "sSpriteAnimTable_VerticalScrollArrow", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_VerticalScrollArrow" } as const;

// ─── CompressedSpriteSheet ─────────────────────────────────────────────────────────────
export const sTourneyTreeButtonsSpriteSheet = { data: "gDomeTourneyTreeButtons_Gfx", size: 1536, tag: "TAG_BUTTONS" } as const;

// ─── CompressedSpritePalette ─────────────────────────────────────────────────────────────
export const sTourneyTreeButtonsSpritePal = { data: "gDomeTourneyTreeButtons_Pal", tag: "TAG_BUTTONS" } as const;

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sUnusedArray: readonly number[] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,3,0,0,0,0,0,3,0,0,0,0,0,3,0,0,0,0,0,3,2,0,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,2,0,0,0,0,0,2,253,0,0,0,0,0,253,0,0,0,0,0,253,0,0,0,0,0,253,0,0,0,0,0,253,254,0,0,0,0,0,254,0,0,0,0,0,254,0,0,0,0,0,254,0,0,0,0,0,254,0,0,0,0,0] as const;
export const sSpeciesNameTextYCoords: readonly number[] = [0,4,0] as const;

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sBattleDomeFunctions = ['InitDomeChallenge', 'GetDomeData', 'SetDomeData', 'BufferDomeRoundText', 'BufferDomeOpponentName', 'InitDomeOpponentParty', 'ShowDomeOpponentInfo', 'ShowDomeTourneyTree', 'ShowPreviousDomeTourneyTree', 'SetDomeOpponentId', 'SetDomeOpponentGraphicsId', 'ShowNonInteractiveDomeTourneyTree', 'ResolveDomeRoundWinners', 'SaveDomeChallenge', 'IncrementDomeStreaks', 'SetFacilityTrainerAndMonPtrs', 'ResetSketchedMoves', 'RestoreDomePlayerPartyHeldItems', 'ReduceDomePlayerPartyToSelectedMons', 'GetPlayerSeededBeforeOpponent', 'BufferLastDomeWinnerName', 'InitRandomTourneyTreeResults', 'InitDomeTrainers'] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u32", name: 'gPlayerPartyLostHP', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u32", name: 'sPlayerPartyMaxHP', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetDomeTrainerMonIvs', ret: "u8", arity: 1, params: "u16" },
  { name: 'SwapDomeTrainers', ret: "void", arity: 3, params: "int, int, u16 *" },
  { name: 'CalcDomeMonStats', ret: "void", arity: 6, params: "u16, int, int, u8, u8, int *" },
  { name: 'CreateDomeOpponentMons', ret: "void", arity: 1, params: "u16" },
  { name: 'SelectOpponentMons_Good', ret: "int", arity: 2, params: "u16, bool8" },
  { name: 'SelectOpponentMons_Bad', ret: "int", arity: 2, params: "u16, bool8" },
  { name: 'GetTypeEffectivenessPoints', ret: "int", arity: 3, params: "int, int, int" },
  { name: 'SelectOpponentMonsFromParty', ret: "int", arity: 2, params: "int *, bool8" },
  { name: 'Task_ShowTourneyInfoCard', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleInfoCardInput', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_GetInfoCardInput', ret: "u8", arity: 1, params: "u8" },
  { name: 'SetFacilityTrainerAndMonPtrs', ret: "void", arity: 0, params: "void" },
  { name: 'TrainerIdToTournamentId', ret: "int", arity: 1, params: "u16" },
  { name: 'TrainerIdOfPlayerOpponent', ret: "u16", arity: 0, params: "void" },
  { name: 'Task_ShowTourneyTree', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleStaticTourneyTreeInput', ret: "void", arity: 1, params: "u8" },
  { name: 'CB2_TourneyTree', ret: "void", arity: 0, params: "void" },
  { name: 'VblankCb_TourneyInfoCard', ret: "void", arity: 0, params: "void" },
  { name: 'DisplayMatchInfoOnCard', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'DisplayTrainerInfoOnCard', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'BufferDomeWinString', ret: "int", arity: 2, params: "u8, u8 *" },
  { name: 'GetDomeBrainTrainerPicId', ret: "u8", arity: 0, params: "void" },
  { name: 'GetDomeBrainTrainerClass', ret: "u8", arity: 0, params: "void" },
  { name: 'CopyDomeBrainTrainerName', ret: "void", arity: 1, params: "u8 *" },
  { name: 'CopyDomeTrainerName', ret: "void", arity: 2, params: "u8 *, u16" },
  { name: 'HblankCb_TourneyTree', ret: "void", arity: 0, params: "void" },
  { name: 'VblankCb_TourneyTree', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateTourneyTreeCursor', ret: "u8", arity: 1, params: "u8" },
  { name: 'DecideRoundWinners', ret: "void", arity: 1, params: "u8" },
  { name: 'GetOpposingNPCTournamentIdByRound', ret: "u8", arity: 2, params: "u8, u8" },
  { name: 'DrawTourneyAdvancementLine', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'SpriteCB_HorizontalScrollArrow', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_VerticalScrollArrow', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'InitDomeChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'GetDomeData', ret: "void", arity: 0, params: "void" },
  { name: 'SetDomeData', ret: "void", arity: 0, params: "void" },
  { name: 'BufferDomeRoundText', ret: "void", arity: 0, params: "void" },
  { name: 'BufferDomeOpponentName', ret: "void", arity: 0, params: "void" },
  { name: 'InitDomeOpponentParty', ret: "void", arity: 0, params: "void" },
  { name: 'ShowDomeOpponentInfo', ret: "void", arity: 0, params: "void" },
  { name: 'ShowDomeTourneyTree', ret: "void", arity: 0, params: "void" },
  { name: 'ShowPreviousDomeTourneyTree', ret: "void", arity: 0, params: "void" },
  { name: 'SetDomeOpponentId', ret: "void", arity: 0, params: "void" },
  { name: 'SetDomeOpponentGraphicsId', ret: "void", arity: 0, params: "void" },
  { name: 'ShowNonInteractiveDomeTourneyTree', ret: "void", arity: 0, params: "void" },
  { name: 'ResolveDomeRoundWinners', ret: "void", arity: 0, params: "void" },
  { name: 'SaveDomeChallenge', ret: "void", arity: 0, params: "void" },
  { name: 'IncrementDomeStreaks', ret: "void", arity: 0, params: "void" },
  { name: 'ResetSketchedMoves', ret: "void", arity: 0, params: "void" },
  { name: 'RestoreDomePlayerPartyHeldItems', ret: "void", arity: 0, params: "void" },
  { name: 'ReduceDomePlayerPartyToSelectedMons', ret: "void", arity: 0, params: "void" },
  { name: 'GetPlayerSeededBeforeOpponent', ret: "void", arity: 0, params: "void" },
  { name: 'BufferLastDomeWinnerName', ret: "void", arity: 0, params: "void" },
  { name: 'InitRandomTourneyTreeResults', ret: "void", arity: 0, params: "void" },
  { name: 'InitDomeTrainers', ret: "void", arity: 0, params: "void" },
  { name: 'CallBattleDomeFunction', ret: "void", arity: 0, params: "void" },
  { name: 'CreateDomeOpponentMon', ret: "void", arity: 4, params: "u8 monPartyId, u16 tournamentTrainerId, u8 tournamentMonId, u32 otId" },
  { name: 'GetDomeTrainerSelectedMons', ret: "int", arity: 1, params: "u16 tournamentTrainerId" },
  { name: 'TournamentIdOfOpponent', ret: "int", arity: 2, params: "int roundId, int trainerId" },
  { name: 'SpriteCB_TrainerIconCardScrollUp', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_TrainerIconCardScrollDown', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_TrainerIconCardScrollLeft', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_TrainerIconCardScrollRight', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_MonIconDomeInfo', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_MonIconCardScrollUp', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_MonIconCardScrollDown', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_MonIconCardScrollLeft', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_MonIconCardScrollRight', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'Task_HandleTourneyTreeInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'GetWinningMove', ret: "u16", arity: 3, params: "int winnerTournamentId, int loserTournamentId, u8 roundId" },
  { name: 'CreateSprite', ret: "else", arity: 4, params: "&sCancelButtonSpriteTemplate, 218, 12, 0" },
  { name: 'TrainerIdToDomeTournamentId', ret: "int", arity: 1, params: "u16 trainerId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_HandleInfoCardInput',
  'Task_HandleStaticTourneyTreeInput',
  'Task_HandleTourneyTreeInput',
  'Task_ShowTourneyInfoCard',
  'Task_ShowTourneyTree',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_TourneyTree',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_dome.h',
  'battle.h',
  'battle_main.h',
  'battle_setup.h',
  'battle_tower.h',
  'frontier_util.h',
  'battle_message.h',
  'event_data.h',
  'overworld.h',
  'util.h',
  'malloc.h',
  'string_util.h',
  'random.h',
  'task.h',
  'main.h',
  'gpu_regs.h',
  'text.h',
  'bg.h',
  'window.h',
  'strings.h',
  'palette.h',
  'decompress.h',
  'party_menu.h',
  'menu.h',
  'sound.h',
  'pokemon_icon.h',
  'data.h',
  'international_string_util.h',
  'trainer_pokemon_sprites.h',
  'scanline_effect.h',
  'script_pokemon_util.h',
  'graphics.h',
  'constants/battle_dome.h',
  'constants/frontier_util.h',
  'constants/moves.h',
  'constants/trainers.h',
  'constants/abilities.h',
  'constants/songs.h',
  'constants/battle_frontier.h',
  'constants/rgb.h',
] as const;
