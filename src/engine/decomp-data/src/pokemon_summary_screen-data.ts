// AUTO-GENERATED from src/pokemon_summary_screen.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokemon_summary_screen.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const PSS_LABEL_WINDOW_POKEMON_INFO_TITLE = 0;
export const PSS_LABEL_WINDOW_POKEMON_SKILLS_TITLE = 1;
export const PSS_LABEL_WINDOW_BATTLE_MOVES_TITLE = 2;
export const PSS_LABEL_WINDOW_CONTEST_MOVES_TITLE = 3;
export const PSS_LABEL_WINDOW_PROMPT_CANCEL = 4;
export const PSS_LABEL_WINDOW_PROMPT_INFO = 5;
export const PSS_LABEL_WINDOW_PROMPT_SWITCH = 6;
export const PSS_LABEL_WINDOW_UNUSED1 = 7;
export const PSS_LABEL_WINDOW_POKEMON_INFO_RENTAL = 8;
export const PSS_LABEL_WINDOW_POKEMON_INFO_TYPE = 9;
export const PSS_LABEL_WINDOW_POKEMON_SKILLS_STATS_LEFT = 10;
export const PSS_LABEL_WINDOW_POKEMON_SKILLS_STATS_RIGHT = 11;
export const PSS_LABEL_WINDOW_POKEMON_SKILLS_EXP = 12;
export const PSS_LABEL_WINDOW_POKEMON_SKILLS_STATUS = 13;
export const PSS_LABEL_WINDOW_MOVES_POWER_ACC = 14;
export const PSS_LABEL_WINDOW_MOVES_APPEAL_JAM = 15;
export const PSS_LABEL_WINDOW_UNUSED2 = 16;
export const PSS_LABEL_WINDOW_PORTRAIT_DEX_NUMBER = 17;
export const PSS_LABEL_WINDOW_PORTRAIT_NICKNAME = 18;
export const PSS_LABEL_WINDOW_PORTRAIT_SPECIES = 19;
export const PSS_LABEL_WINDOW_END = 20;
export const PSS_DATA_WINDOW_INFO_ORIGINAL_TRAINER = 0;
export const PSS_DATA_WINDOW_INFO_ID = 1;
export const PSS_DATA_WINDOW_INFO_ABILITY = 2;
export const PSS_DATA_WINDOW_INFO_MEMO = 3;
export const PSS_DATA_WINDOW_SKILLS_HELD_ITEM = 0;
export const PSS_DATA_WINDOW_SKILLS_RIBBON_COUNT = 1;
export const PSS_DATA_WINDOW_SKILLS_STATS_LEFT = 2;
export const PSS_DATA_WINDOW_SKILLS_STATS_RIGHT = 3;
export const PSS_DATA_WINDOW_EXP = 4;
export const PSS_DATA_WINDOW_MOVE_NAMES = 0;
export const PSS_DATA_WINDOW_MOVE_PP = 1;
export const PSS_DATA_WINDOW_MOVE_DESCRIPTION = 2;
export const MOVE_SELECTOR_SPRITES_COUNT = 10;
/** Raw expr: `(MAX_MON_MOVES + 1)` */
export const TYPE_ICON_SPRITE_COUNT_EXPR = "(MAX_MON_MOVES + 1)";
export const TILE_EMPTY_APPEAL_HEART = 4153;
export const TILE_FILLED_APPEAL_HEART = 4154;
export const TILE_FILLED_JAM_HEART = 4156;
export const TILE_EMPTY_JAM_HEART = 4157;
export const TAG_MOVE_SELECTOR = 30000;
export const TAG_MON_STATUS = 30001;
export const TAG_MOVE_TYPES = 30002;
export const TAG_MON_MARKINGS = 30003;
/** Raw expr: `data[0]` */
export const tScrollingSpeed_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tVisibleColumns_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tMove_EXPR = "data[2]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_PSS_0 = {
  PSS_PAGE_INFO: 0,
  PSS_PAGE_SKILLS: 1,
  PSS_PAGE_BATTLE_MOVES: 2,
  PSS_PAGE_CONTEST_MOVES: 3,
  PSS_PAGE_COUNT: 4,
} as const;
export const ENUM_SPRITE_1 = {
  SPRITE_ARR_ID_MON: 0,
  SPRITE_ARR_ID_BALL: 1,
  SPRITE_ARR_ID_STATUS: 2,
  SPRITE_ARR_ID_TYPE: 3,
  SPRITE_ARR_ID_MOVE_SELECTOR1: 4,
  SPRITE_ARR_ID_MOVE_SELECTOR2: 5,
  SPRITE_ARR_ID_COUNT: 6,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sSummaryTemplate = [
  { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 11, height: 2, paletteNum: 6, baseBlock: 1 },
  { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 11, height: 2, paletteNum: 6, baseBlock: 23 },
  { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 11, height: 2, paletteNum: 6, baseBlock: 45 },
  { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 11, height: 2, paletteNum: 6, baseBlock: 67 },
  { bg: 0, tilemapLeft: 22, tilemapTop: 0, width: 8, height: 2, paletteNum: 7, baseBlock: 89 },
  { bg: 0, tilemapLeft: 22, tilemapTop: 0, width: 8, height: 2, paletteNum: 7, baseBlock: 105 },
  { bg: 0, tilemapLeft: 22, tilemapTop: 0, width: 8, height: 2, paletteNum: 7, baseBlock: 121 },
  { bg: 0, tilemapLeft: 11, tilemapTop: 4, width: 0, height: 2, paletteNum: 6, baseBlock: 137 },
  { bg: 0, tilemapLeft: 11, tilemapTop: 4, width: 18, height: 2, paletteNum: 6, baseBlock: 137 },
  { bg: 0, tilemapLeft: 11, tilemapTop: 6, width: 18, height: 2, paletteNum: 6, baseBlock: 173 },
  { bg: 0, tilemapLeft: 10, tilemapTop: 7, width: 6, height: 6, paletteNum: 6, baseBlock: 209 },
  { bg: 0, tilemapLeft: 22, tilemapTop: 7, width: 5, height: 6, paletteNum: 6, baseBlock: 245 },
  { bg: 0, tilemapLeft: 10, tilemapTop: 14, width: 11, height: 4, paletteNum: 6, baseBlock: 275 },
  { bg: 0, tilemapLeft: 0, tilemapTop: 18, width: 6, height: 2, paletteNum: 6, baseBlock: 319 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 15, width: 9, height: 4, paletteNum: 6, baseBlock: 331 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 15, width: 5, height: 4, paletteNum: 6, baseBlock: 367 },
  { bg: 0, tilemapLeft: 22, tilemapTop: 4, width: 0, height: 2, paletteNum: 6, baseBlock: 387 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 2, width: 4, height: 2, paletteNum: 7, baseBlock: 387 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 12, width: 9, height: 2, paletteNum: 6, baseBlock: 395 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 14, width: 9, height: 4, paletteNum: 6, baseBlock: 413 },
] as const;
export const sPageInfoTemplate = [
  { bg: 0, tilemapLeft: 11, tilemapTop: 4, width: 11, height: 2, paletteNum: 6, baseBlock: 449 },
  { bg: 0, tilemapLeft: 22, tilemapTop: 4, width: 7, height: 2, paletteNum: 6, baseBlock: 471 },
  { bg: 0, tilemapLeft: 11, tilemapTop: 9, width: 19, height: 4, paletteNum: 6, baseBlock: 485 },
  { bg: 0, tilemapLeft: 11, tilemapTop: 14, width: 18, height: 6, paletteNum: 6, baseBlock: 561 },
] as const;
export const sPageSkillsTemplate = [
  { bg: 0, tilemapLeft: 10, tilemapTop: 4, width: 10, height: 2, paletteNum: 6, baseBlock: 449 },
  { bg: 0, tilemapLeft: 20, tilemapTop: 4, width: 10, height: 2, paletteNum: 6, baseBlock: 469 },
  { bg: 0, tilemapLeft: 16, tilemapTop: 7, width: 6, height: 6, paletteNum: 6, baseBlock: 489 },
  { bg: 0, tilemapLeft: 27, tilemapTop: 7, width: 3, height: 6, paletteNum: 6, baseBlock: 525 },
  { bg: 0, tilemapLeft: 24, tilemapTop: 14, width: 6, height: 4, paletteNum: 6, baseBlock: 543 },
] as const;
export const sPageMovesTemplate = [
  { bg: 0, tilemapLeft: 15, tilemapTop: 4, width: 9, height: 10, paletteNum: 6, baseBlock: 449 },
  { bg: 0, tilemapLeft: 24, tilemapTop: 4, width: 6, height: 10, paletteNum: 8, baseBlock: 539 },
  { bg: 0, tilemapLeft: 10, tilemapTop: 15, width: 20, height: 4, paletteNum: 6, baseBlock: 599 },
] as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 2, mapBaseIndex: 27, screenSize: 1, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 25, screenSize: 1, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 2, mapBaseIndex: 29, screenSize: 1, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_MoveTypes = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x16)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_MoveSelector = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_StatusCondition = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x8)", tileNum: 0, priority: 3, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_MoveTypes = { tileTag: "TAG_MOVE_TYPES", paletteTag: "TAG_MOVE_TYPES", oam: "&sOamData_MoveTypes", anims: "sSpriteAnimTable_MoveTypes", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sMoveSelectorSpriteTemplate = { tileTag: "TAG_MOVE_SELECTOR", paletteTag: "TAG_MOVE_SELECTOR", oam: "&sOamData_MoveSelector", anims: "sSpriteAnimTable_MoveSelector", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_StatusCondition = { tileTag: "TAG_MON_STATUS", paletteTag: "TAG_MON_STATUS", oam: "&sOamData_StatusCondition", anims: "sSpriteAnimTable_StatusCondition", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── CompressedSpriteSheet ─────────────────────────────────────────────────────────────
export const sSpriteSheet_MoveTypes = { data: "gMoveTypes_Gfx", size: "(NUMBER_OF_MON_TYPES + CONTEST_CATEGORIES_COUNT) * 0x100", tag: "TAG_MOVE_TYPES" } as const;
export const sMoveSelectorSpriteSheet = { data: "gSummaryMoveSelect_Gfx", size: 1024, tag: "TAG_MOVE_SELECTOR" } as const;
export const sStatusIconsSpriteSheet = { data: "gStatusGfx_Icons", size: 896, tag: "TAG_MON_STATUS" } as const;

// ─── CompressedSpritePalette ─────────────────────────────────────────────────────────────
export const sMoveSelectorSpritePal = { data: "gSummaryMoveSelect_Pal", tag: "TAG_MOVE_SELECTOR" } as const;
export const sStatusIconsSpritePalette = { data: "gStatusPal_Icons", tag: "TAG_MON_STATUS" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sMarkings_Pal': { path: 'graphics/summary_screen/markings.pal', ext: '.gbapal', type: 'u16' },
};

// ─── INCBIN paths (raw binary includes) ─────────────────────────────────────
export const INCBIN_SOURCES: Record<string, { path: string; type: string }> = {
  'sStatusTilemap': { path: 'graphics/summary_screen/status_tilemap.bin', type: 'u16' },
};

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sMultiBattleOrder: readonly number[] = [0,2,3,1,4,5] as const;

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sTextPrinterFunctions = ['PrintInfoPageText', 'PrintSkillsPageText', 'PrintBattleMoves', 'PrintContestMoves'] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'gLastViewedMonIndex', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sMoveSlotToReplace', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sAnimDelayTaskId', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'LoadGraphics', ret: "bool8", arity: 0, params: "void" },
  { name: 'CB2_InitSummaryScreen', ret: "void", arity: 0, params: "void" },
  { name: 'InitBGs', ret: "void", arity: 0, params: "void" },
  { name: 'DecompressGraphics', ret: "bool8", arity: 0, params: "void" },
  { name: 'CopyMonToSummaryStruct', ret: "void", arity: 1, params: "struct Pokemon *" },
  { name: 'ExtractMonDataToSummaryStruct', ret: "bool8", arity: 1, params: "struct Pokemon *" },
  { name: 'SetDefaultTilemaps', ret: "void", arity: 0, params: "void" },
  { name: 'CloseSummaryScreen', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleInput', ret: "void", arity: 1, params: "u8" },
  { name: 'ChangeSummaryPokemon', ret: "void", arity: 2, params: "u8, s8" },
  { name: 'Task_ChangeSummaryMon', ret: "void", arity: 1, params: "u8" },
  { name: 'AdvanceMonIndex', ret: "s8", arity: 1, params: "s8" },
  { name: 'AdvanceMultiBattleMonIndex', ret: "s8", arity: 1, params: "s8" },
  { name: 'IsValidToViewInMulti', ret: "bool8", arity: 1, params: "struct Pokemon *" },
  { name: 'ChangePage', ret: "void", arity: 2, params: "u8, s8" },
  { name: 'PssScrollRight', ret: "void", arity: 1, params: "u8" },
  { name: 'PssScrollRightEnd', ret: "void", arity: 1, params: "u8" },
  { name: 'PssScrollLeft', ret: "void", arity: 1, params: "u8" },
  { name: 'PssScrollLeftEnd', ret: "void", arity: 1, params: "u8" },
  { name: 'TryDrawExperienceProgressBar', ret: "void", arity: 0, params: "void" },
  { name: 'SwitchToMoveSelection', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleInput_MoveSelect', ret: "void", arity: 1, params: "u8" },
  { name: 'HasMoreThanOneMove', ret: "bool8", arity: 0, params: "void" },
  { name: 'ChangeSelectedMove', ret: "void", arity: 3, params: "s16 *, s8, u8 *" },
  { name: 'CloseMoveSelectMode', ret: "void", arity: 1, params: "u8" },
  { name: 'SwitchToMovePositionSwitchMode', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleInput_MovePositionSwitch', ret: "void", arity: 1, params: "u8" },
  { name: 'ExitMovePositionSwitchMode', ret: "void", arity: 2, params: "u8, bool8" },
  { name: 'SwapMonMoves', ret: "void", arity: 3, params: "struct Pokemon *, u8, u8" },
  { name: 'SwapBoxMonMoves', ret: "void", arity: 3, params: "struct BoxPokemon *, u8, u8" },
  { name: 'Task_SetHandleReplaceMoveInput', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleReplaceMoveInput', ret: "void", arity: 1, params: "u8" },
  { name: 'CanReplaceMove', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShowCantForgetHMsWindow', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleInputCantForgetHMsMoves', ret: "void", arity: 1, params: "u8" },
  { name: 'DrawPagination', ret: "void", arity: 0, params: "void" },
  { name: 'PositionPowerAccSlidingWindow', ret: "void", arity: 2, params: "u16, s16" },
  { name: 'Task_SlidePowerAccWindow', ret: "void", arity: 1, params: "u8" },
  { name: 'PositionAppealJamSlidingWindow', ret: "void", arity: 3, params: "u16, s16, u16" },
  { name: 'Task_SlideAppealJamWindow', ret: "void", arity: 1, params: "u8" },
  { name: 'PositionStatusSlidingWindow', ret: "void", arity: 2, params: "u16, s16" },
  { name: 'Task_SlideStatusWindow', ret: "void", arity: 1, params: "u8" },
  { name: 'TilemapFiveMovesDisplay', ret: "void", arity: 3, params: "u16 *, u16, bool8" },
  { name: 'DrawPokerusCuredSymbol', ret: "void", arity: 1, params: "struct Pokemon *" },
  { name: 'DrawExperienceProgressBar', ret: "void", arity: 1, params: "struct Pokemon *" },
  { name: 'DrawContestMoveHearts', ret: "void", arity: 1, params: "u16" },
  { name: 'LimitEggSummaryPageDisplay', ret: "void", arity: 0, params: "void" },
  { name: 'ResetWindows', ret: "void", arity: 0, params: "void" },
  { name: 'PrintMonInfo', ret: "void", arity: 0, params: "void" },
  { name: 'PrintNotEggInfo', ret: "void", arity: 0, params: "void" },
  { name: 'PrintEggInfo', ret: "void", arity: 0, params: "void" },
  { name: 'PrintGenderSymbol', ret: "void", arity: 2, params: "struct Pokemon *, u16" },
  { name: 'PrintPageNamesAndStats', ret: "void", arity: 0, params: "void" },
  { name: 'PutPageWindowTilemaps', ret: "void", arity: 1, params: "u8" },
  { name: 'ClearPageWindowTilemaps', ret: "void", arity: 1, params: "u8" },
  { name: 'RemoveWindowByIndex', ret: "void", arity: 1, params: "u8" },
  { name: 'PrintPageSpecificText', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateTextPrinterTask', ret: "void", arity: 1, params: "u8" },
  { name: 'PrintInfoPageText', ret: "void", arity: 0, params: "void" },
  { name: 'Task_PrintInfoPage', ret: "void", arity: 1, params: "u8" },
  { name: 'PrintMonOTName', ret: "void", arity: 0, params: "void" },
  { name: 'PrintMonOTID', ret: "void", arity: 0, params: "void" },
  { name: 'PrintMonAbilityName', ret: "void", arity: 0, params: "void" },
  { name: 'PrintMonAbilityDescription', ret: "void", arity: 0, params: "void" },
  { name: 'BufferMonTrainerMemo', ret: "void", arity: 0, params: "void" },
  { name: 'PrintMonTrainerMemo', ret: "void", arity: 0, params: "void" },
  { name: 'BufferNatureString', ret: "void", arity: 0, params: "void" },
  { name: 'GetMetLevelString', ret: "void", arity: 1, params: "u8 *" },
  { name: 'DoesMonOTMatchOwner', ret: "bool8", arity: 0, params: "void" },
  { name: 'DidMonComeFromGBAGames', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsInGamePartnerMon', ret: "bool8", arity: 0, params: "void" },
  { name: 'PrintEggOTName', ret: "void", arity: 0, params: "void" },
  { name: 'PrintEggOTID', ret: "void", arity: 0, params: "void" },
  { name: 'PrintEggState', ret: "void", arity: 0, params: "void" },
  { name: 'PrintEggMemo', ret: "void", arity: 0, params: "void" },
  { name: 'Task_PrintSkillsPage', ret: "void", arity: 1, params: "u8" },
  { name: 'PrintHeldItemName', ret: "void", arity: 0, params: "void" },
  { name: 'PrintSkillsPageText', ret: "void", arity: 0, params: "void" },
  { name: 'PrintRibbonCount', ret: "void", arity: 0, params: "void" },
  { name: 'BufferLeftColumnStats', ret: "void", arity: 0, params: "void" },
  { name: 'PrintLeftColumnStats', ret: "void", arity: 0, params: "void" },
  { name: 'BufferRightColumnStats', ret: "void", arity: 0, params: "void" },
  { name: 'PrintRightColumnStats', ret: "void", arity: 0, params: "void" },
  { name: 'PrintExpPointsNextLevel', ret: "void", arity: 0, params: "void" },
  { name: 'PrintBattleMoves', ret: "void", arity: 0, params: "void" },
  { name: 'Task_PrintBattleMoves', ret: "void", arity: 1, params: "u8" },
  { name: 'PrintMoveNameAndPP', ret: "void", arity: 1, params: "u8" },
  { name: 'PrintContestMoves', ret: "void", arity: 0, params: "void" },
  { name: 'Task_PrintContestMoves', ret: "void", arity: 1, params: "u8" },
  { name: 'PrintContestMoveDescription', ret: "void", arity: 1, params: "u8" },
  { name: 'PrintMoveDetails', ret: "void", arity: 1, params: "u16" },
  { name: 'PrintNewMoveDetailsOrCancelText', ret: "void", arity: 0, params: "void" },
  { name: 'AddAndFillMoveNamesWindow', ret: "void", arity: 0, params: "void" },
  { name: 'SwapMovesNamesPP', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'PrintHMMovesCantBeForgotten', ret: "void", arity: 0, params: "void" },
  { name: 'ResetSpriteIds', ret: "void", arity: 0, params: "void" },
  { name: 'SetSpriteInvisibility', ret: "void", arity: 2, params: "u8, bool8" },
  { name: 'HidePageSpecificSprites', ret: "void", arity: 0, params: "void" },
  { name: 'SetTypeIcons', ret: "void", arity: 0, params: "void" },
  { name: 'CreateMoveTypeIcons', ret: "void", arity: 0, params: "void" },
  { name: 'SetMonTypeIcons', ret: "void", arity: 0, params: "void" },
  { name: 'SetMoveTypeIcons', ret: "void", arity: 0, params: "void" },
  { name: 'SetContestMoveTypeIcons', ret: "void", arity: 0, params: "void" },
  { name: 'SetNewMoveTypeIcon', ret: "void", arity: 0, params: "void" },
  { name: 'SwapMovesTypeSprites', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'LoadMonGfxAndSprite', ret: "u8", arity: 2, params: "struct Pokemon *, s16 *" },
  { name: 'CreateMonSprite', ret: "u8", arity: 1, params: "struct Pokemon *" },
  { name: 'SpriteCB_Pokemon', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'StopPokemonAnimations', ret: "void", arity: 0, params: "void" },
  { name: 'CreateMonMarkingsSprite', ret: "void", arity: 1, params: "struct Pokemon *" },
  { name: 'RemoveAndCreateMonMarkingsSprite', ret: "void", arity: 1, params: "struct Pokemon *" },
  { name: 'CreateCaughtBallSprite', ret: "void", arity: 1, params: "struct Pokemon *" },
  { name: 'CreateSetStatusSprite', ret: "void", arity: 0, params: "void" },
  { name: 'CreateMoveSelectorSprites', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_MoveSelector', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'DestroyMoveSelectorSprites', ret: "void", arity: 1, params: "u8" },
  { name: 'SetMainMoveSelectorColor', ret: "void", arity: 1, params: "u8" },
  { name: 'KeepMoveSelectorVisible', ret: "void", arity: 1, params: "u8" },
  { name: 'SummaryScreen_DestroyAnimDelayTask', ret: "void", arity: 0, params: "void" },
  { name: 'MainCB2', ret: "void", arity: 0, params: "void" },
  { name: 'VBlank', ret: "void", arity: 0, params: "void" },
  { name: 'CreateTask', ret: "else", arity: 2, params: "Task_SetHandleReplaceMoveInput, 0" },
  { name: 'FreeSummaryScreen', ret: "void", arity: 0, params: "void" },
  { name: 'BeginCloseSummaryScreen', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetTaskFuncWithFollowupFunc', ret: "else", arity: 3, params: "taskId, PssScrollLeft, gTasks[taskId].func" },
  { name: 'GetMoveSlotToReplace', ret: "u8", arity: 0, params: "void" },
  { name: 'CopyNColumnsToTilemap', ret: "void", arity: 4, params: "const struct SlidingWindow *slidingWindow, u16 *tilemapDest, u8 visibleColumns, bool8 isOpeningToTheLeft" },
  { name: 'SetMonPicBackgroundPalette', ret: "void", arity: 1, params: "bool8 isMonShiny" },
  { name: 'SetBgTilemapPalette', ret: "else", arity: 6, params: "3, 1, 4, 8, 8, 5" },
  { name: 'ScheduleBgCopyTilemapToVram', ret: "else", arity: 1, params: "2" },
  { name: 'ChangeBgX', ret: "else", arity: 3, params: "3, 0, BG_COORD_SET" },
  { name: 'PrintTextOnWindow', ret: "void", arity: 6, params: "u8 windowId, const u8 *string, u8 x, u8 y, u8 lineSpacing, u8 colorId" },
  { name: 'PrintAOrBButtonIcon', ret: "void", arity: 3, params: "u8 windowId, bool8 bButton, u32 x" },
  { name: 'AddWindowFromTemplateList', ret: "u8", arity: 2, params: "const struct WindowTemplate *template, u8 templateId" },
  { name: 'DidMonComeFromRSE', ret: "bool8", arity: 0, params: "void" },
  { name: 'PrintMovePowerAndAccuracy', ret: "void", arity: 1, params: "u16 moveIndex" },
  { name: 'DestroySpriteInArray', ret: "void", arity: 1, params: "u8 spriteArrayId" },
  { name: 'SetTypeSpritePosAndPal', ret: "void", arity: 4, params: "u8 typeId, u8 x, u8 y, u8 spriteArrayId" },
  { name: 'HandleLoadSpecialPokePic_2', ret: "else", arity: 4, params: "&gMonFrontPicTable[summary->species2],\n                                           gMonSpritesGfxPtr->sprites.ptr[B_POSITION_OPPONENT_LEFT],\n                                           summary->species2,\n                                           summary->pid" },
  { name: 'HandleLoadSpecialPokePic_DontHandleDeoxys', ret: "else", arity: 4, params: "&gMonFrontPicTable[summary->species2],\n                                                              gMonSpritesGfxPtr->sprites.ptr[B_POSITION_OPPONENT_LEFT],\n                                                              summary->species2,\n                                                              summary->pid" },
  { name: 'PlayMonCry', ret: "void", arity: 0, params: "void" },
  { name: 'PlayCry_ByMode', ret: "else", arity: 3, params: "summary->species2, 0, CRY_MODE_WEAK" },
  { name: 'SummaryScreen_SetAnimDelayTaskId', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'IsMonAnimationFinished', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'StartSpriteAnim', ret: "else", arity: 2, params: "&gSprites[spriteIds[i]], 6" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_ChangeSummaryMon',
  'Task_HandleInput',
  'Task_HandleInputCantForgetHMsMoves',
  'Task_HandleInput_MovePositionSwitch',
  'Task_HandleInput_MoveSelect',
  'Task_HandleReplaceMoveInput',
  'Task_PrintBattleMoves',
  'Task_PrintContestMoves',
  'Task_PrintInfoPage',
  'Task_PrintSkillsPage',
  'Task_SetHandleReplaceMoveInput',
  'Task_SlideAppealJamWindow',
  'Task_SlidePowerAccWindow',
  'Task_SlideStatusWindow',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_InitSummaryScreen',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'main.h',
  'battle.h',
  'battle_anim.h',
  'frontier_util.h',
  'battle_message.h',
  'battle_tent.h',
  'battle_factory.h',
  'bg.h',
  'contest.h',
  'contest_effect.h',
  'data.h',
  'daycare.h',
  'decompress.h',
  'dynamic_placeholder_text_util.h',
  'event_data.h',
  'gpu_regs.h',
  'graphics.h',
  'international_string_util.h',
  'item.h',
  'link.h',
  'm4a.h',
  'malloc.h',
  'menu.h',
  'menu_helpers.h',
  'mon_markings.h',
  'party_menu.h',
  'palette.h',
  'pokeball.h',
  'pokemon.h',
  'pokemon_storage_system.h',
  'pokemon_summary_screen.h',
  'region_map.h',
  'scanline_effect.h',
  'sound.h',
  'sprite.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'text.h',
  'tv.h',
  'window.h',
  'constants/items.h',
  'constants/moves.h',
  'constants/party_menu.h',
  'constants/region_map_sections.h',
  'constants/rgb.h',
  'constants/songs.h',
  'data/text/move_descriptions.h',
  'data/text/nature_names.h',
] as const;
