// AUTO-GENERATED from src/berry_crush.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/berry_crush.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `(10 * 60 * 60)` */
export const MAX_TIME_EXPR = "(10 * 60 * 60)";
export const TAG_CRUSHER_BASE = 1;
export const PALTAG_EFFECT = 2;
export const GFXTAG_IMPACT = 2;
export const GFXTAG_SPARKLE = 3;
export const TAG_TIMER_DIGITS = 4;
export const TAG_PLAYER1_BERRY = 5;
export const TAG_PLAYER2_BERRY = 6;
export const TAG_PLAYER3_BERRY = 7;
export const TAG_PLAYER4_BERRY = 8;
export const TAG_PLAYER5_BERRY = 9;
export const TAG_COUNTDOWN = 4096;
export const CRUSHER_START_Y = -104;
/** Raw expr: `(1 << 0)` */
export const F_MSG_CLEAR_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 1)` */
export const F_MSG_EXPAND_EXPR = "(1 << 1)";
/** Raw expr: `STATE_RESULTS_PRESSES` */
export const RESULTS_STATE_START_EXPR = "STATE_RESULTS_PRESSES";
/** Raw expr: `STATE_RESULTS_CRUSHING` */
export const RESULTS_STATE_END_EXPR = "STATE_RESULTS_CRUSHING";
export const PLAY_AGAIN_YES = 0;
export const PLAY_AGAIN_NO = 1;
export const PLAY_AGAIN_NO_BERRIES = 3;
/** Raw expr: `(1 << 0)` */
export const F_INPUT_HIT_A_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 1)` */
export const F_INPUT_HIT_B_EXPR = "(1 << 1)";
/** Raw expr: `(1 << 2)` */
export const F_INPUT_HIT_SYNC_EXPR = "(1 << 2)";
export const INPUT_FLAGS_PER_PLAYER = 3;
/** Raw expr: `((1 << INPUT_FLAGS_PER_PLAYER) - 1)` */
export const INPUT_FLAG_MASK_EXPR = "((1 << INPUT_FLAGS_PER_PLAYER) - 1)";
export const SEND_GAME_STATE = 2;
/** Raw expr: `playerIdsRanked[0][7]` */
export const randomPageId_EXPR = "playerIdsRanked[0][7]";
/** Raw expr: `data[0]` */
export const sX_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sYSpeed_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sYAccel_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sXSpeed_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sSinIdx_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sSinSpeed_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const sAmplitude_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const sBitfield_EXPR = "data[7]";
export const MASK_TARGET_Y = 32767;
export const F_MOVE_HORIZ = 32768;
/** Raw expr: `temp1` */
export const flags_EXPR = "temp1";
/** Raw expr: `temp1` */
export const yModifier_EXPR = "temp1";
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tWindowId_EXPR = "data[1]";
/** Raw expr: `sparkleAmount` */
export const field_EXPR = "sparkleAmount";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_RUN_0 = {
  RUN_CMD: 0,
  SCHEDULE_CMD: 1,
} as const;
export const ENUM_CMD_1 = {
  CMD_NONE: 0,
  CMD_FADE: 1,
  CMD_WAIT_FADE: 2,
  CMD_PRINT_MSG: 3,
  CMD_SHOW_GAME: 4,
  CMD_HIDE_GAME: 5,
  CMD_READY_BEGIN: 6,
  CMD_ASK_PICK_BERRY: 7,
  CMD_PICK_BERRY: 8,
  CMD_WAIT_BERRIES: 9,
  CMD_DROP_BERRIES: 10,
  CMD_DROP_LID: 11,
  CMD_COUNTDOWN: 12,
  CMD_PLAY_GAME_LEADER: 13,
  CMD_PLAY_GAME_MEMBER: 14,
  CMD_FINISH_GAME: 15,
  CMD_TIMES_UP: 16,
  CMD_CALC_RESULTS: 17,
  CMD_SHOW_RESULTS: 18,
  CMD_SAVE: 19,
  CMD_ASK_PLAY_AGAIN: 20,
  CMD_COMM_PLAY_AGAIN: 21,
  CMD_PLAY_AGAIN_YES: 22,
  CMD_PLAY_AGAIN_NO: 23,
  CMD_CLOSE_LINK: 24,
  CMD_QUIT: 25,
} as const;
export const ENUM_MSG_2 = {
  MSG_PICK_BERRY: 0,
  MSG_WAIT_PICK: 1,
  MSG_POWDER: 2,
  MSG_SAVING: 3,
  MSG_PLAY_AGAIN: 4,
  MSG_NO_BERRIES: 5,
  MSG_DROPPED: 6,
  MSG_TIMES_UP: 7,
  MSG_COMM_STANDBY: 8,
} as const;
export const ENUM_STATE_3 = {
  STATE_INIT: 1,
  STATE_RESET: 2,
  STATE_PICK_BERRY: 3,
  STATE_DROP_BERRIES: 4,
  STATE_DROP_LID: 5,
  STATE_COUNTDOWN: 6,
  STATE_PLAYING: 7,
  STATE_FINISHED: 8,
  STATE_TIMES_UP: 9,
  STATE_10: 10,
  STATE_RESULTS_PRESSES: 11,
  STATE_RESULTS_RANDOM: 12,
  STATE_RESULTS_CRUSHING: 13,
  STATE_14: 14,
  STATE_PLAY_AGAIN: 15,
} as const;
export const ENUM_RESULTS_4 = {
  RESULTS_PAGE_PRESSES: 0,
  RESULTS_PAGE_RANDOM: 1,
  RESULTS_PAGE_CRUSHING: 2,
  NUM_RESULTS_PAGES: 3,
} as const;
export const ENUM_RESULTS_5 = {
  RESULTS_PAGE_NEATNESS: 0,
  RESULTS_PAGE_COOPERATIVE: 1,
  RESULTS_PAGE_POWER: 2,
  NUM_RANDOM_RESULTS_PAGES: 3,
} as const;
export const ENUM_COLORID_6 = {
  COLORID_GRAY: 0,
  COLORID_BLACK: 1,
  COLORID_LIGHT_GRAY: 2,
  COLORID_BLUE: 3,
  COLORID_GREEN: 4,
  COLORID_RED: 5,
} as const;
export const ENUM_INPUT_7 = {
  INPUT_STATE_NONE: 0,
  INPUT_STATE_HIT: 1,
  INPUT_STATE_HIT_SYNC: 2,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplate_Rankings = { bg: 0, tilemapLeft: 3, tilemapTop: 4, width: 24, height: 13, paletteNum: 15, baseBlock: 1 } as const;
export const sWindowTemplates_PlayerNames = [
  { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 9, height: 2, paletteNum: 8, baseBlock: 1005 },
  { bg: 0, tilemapLeft: 0, tilemapTop: 3, width: 9, height: 2, paletteNum: 8, baseBlock: 987 },
  { bg: 0, tilemapLeft: 0, tilemapTop: 6, width: 9, height: 2, paletteNum: 8, baseBlock: 969 },
  { bg: 0, tilemapLeft: 21, tilemapTop: 3, width: 9, height: 2, paletteNum: 8, baseBlock: 951 },
  { bg: 0, tilemapLeft: 21, tilemapTop: 6, width: 9, height: 2, paletteNum: 8, baseBlock: 933 },
] as const;
export const sWindowTemplates_Results = [
  { bg: 0, tilemapLeft: 5, tilemapTop: 2, width: 20, height: 16, paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: 5, tilemapTop: 2, width: 20, height: 16, paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: 4, tilemapTop: 2, width: 22, height: 16, paletteNum: 15, baseBlock: 1 },
] as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 15, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 13, screenSize: 2, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 12, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 11, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_CrusherBase = { tileTag: "TAG_CRUSHER_BASE", paletteTag: "TAG_CRUSHER_BASE", oam: "&gOamData_AffineOff_ObjNormal_64x64", anims: "sAnims_CrusherBase", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Impact = { tileTag: "GFXTAG_IMPACT", paletteTag: "PALTAG_EFFECT", oam: "&gOamData_AffineOff_ObjNormal_32x32", anims: "sAnims_Impact", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Impact" } as const;
export const sSpriteTemplate_Sparkle = { tileTag: "GFXTAG_SPARKLE", paletteTag: "PALTAG_EFFECT", oam: "&gOamData_AffineOff_ObjNormal_16x16", anims: "sAnims_Sparkle", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Timer = { tileTag: "TAG_TIMER_DIGITS", paletteTag: "TAG_TIMER_DIGITS", oam: "&gOamData_AffineOff_ObjNormal_8x16", anims: "sAnims_Timer", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_PlayerBerry = { tileTag: "TAG_PLAYER1_BERRY", paletteTag: "TAG_PLAYER1_BERRY", oam: "&gOamData_AffineDouble_ObjNormal_32x32", anims: "sAnims_PlayerBerry", images: 0, affineAnims: "sAffineAnims_PlayerBerry", callback: "SpriteCallbackDummy" } as const;

// ─── CompressedSpriteSheet ─────────────────────────────────────────────────────────────
export const sSpriteSheets = [
  { data: "sCrusherBase_Gfx", size: 2048, tag: "TAG_CRUSHER_BASE" },
  { data: "sImpact_Gfx", size: 3584, tag: "GFXTAG_IMPACT" },
  { data: "sSparkle_Gfx", size: 1792, tag: "GFXTAG_SPARKLE" },
  { data: "sTimerDigits_Gfx", size: 704, tag: "TAG_TIMER_DIGITS" },
] as const;

// ─── SpritePalette ─────────────────────────────────────────────────────────────
export const sSpritePals = [
  { data: "sCrusherBase_Pal", tag: "TAG_CRUSHER_BASE" },
  { data: "sEffects_Pal", tag: "PALTAG_EFFECT" },
  { data: "sTimerDigits_Pal", tag: "TAG_TIMER_DIGITS" },
] as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sCrusherBase_Pal': { path: 'graphics/berry_crush/crusher_base.png', ext: '.gbapal', type: 'u16' },
  'sEffects_Pal': { path: 'graphics/berry_crush/effects.pal', ext: '.gbapal', type: 'u16' },
  'sTimerDigits_Pal': { path: 'graphics/berry_crush/timer_digits.png', ext: '.gbapal', type: 'u16' },
  'sCrusherBase_Gfx': { path: 'graphics/berry_crush/crusher_base.png', ext: '.4bpp.lz', type: 'u32' },
  'sImpact_Gfx': { path: 'graphics/berry_crush/impact.png', ext: '.4bpp.lz', type: 'u32' },
  'sSparkle_Gfx': { path: 'graphics/berry_crush/sparkle.png', ext: '.4bpp.lz', type: 'u32' },
  'sTimerDigits_Gfx': { path: 'graphics/berry_crush/timer_digits.png', ext: '.4bpp.lz', type: 'u32' },
  'sCrusherTop_Tilemap': { path: 'graphics/berry_crush/crusher_top.bin', ext: '.lz', type: 'u8' },
  'sContainerCap_Tilemap': { path: 'graphics/berry_crush/container_cap.bin', ext: '.lz', type: 'u8' },
  'sBg_Tilemap': { path: 'graphics/berry_crush/bg.bin', ext: '.lz', type: 'u8' },
};

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sMessages = ['gText_ReadyPickBerry', 'gText_WaitForAllChooseBerry', 'gText_EndedWithXUnitsPowder', 'gText_RecordingGameResults', 'gText_PlayBerryCrushAgain', 'gText_YouHaveNoBerries', 'gText_MemberDroppedOut', 'gText_TimesUpNoGoodPowder', 'gText_CommunicationStandby2'] as const;
export const sResultsTexts = ['gText_SpaceTimes2', 'gText_XDotY', 'gText_Var1Berry', 'gText_NeatnessRankings', 'gText_CoopRankings', 'gText_PressingPowerRankings'] as const;

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sPressingSpeedConversionTable: readonly number[] = [50000000,25000000,12500000,6250000,3125000,1562500,781250,390625] as const;
export const sReceivedPlayerBitmasks: readonly number[] = [3,7,15,31] as const;

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sBerryCrushCommands = [null, 'Cmd_BeginNormalPaletteFade', 'Cmd_WaitPaletteFade', 'Cmd_PrintMessage', 'Cmd_ShowGameDisplay', 'Cmd_HideGameDisplay', 'Cmd_SignalReadyToBegin', 'Cmd_AskPickBerry', 'Cmd_GoToBerryPouch', 'Cmd_WaitForOthersToPickBerries', 'Cmd_DropBerriesIntoCrusher', 'Cmd_DropLid', 'Cmd_Countdown', 'Cmd_PlayGame_Leader', 'Cmd_PlayGame_Member', 'Cmd_FinishGame', 'Cmd_HandleTimeUp', 'Cmd_TabulateResults', 'Cmd_ShowResults', 'Cmd_SaveGame', 'Cmd_AskPlayAgain', 'Cmd_CommunicatePlayAgainResponses', 'Cmd_PlayAgain', 'Cmd_StopGame', 'Cmd_CloseLink', 'Cmd_Quit'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'VBlankCB', ret: "void", arity: 0, params: "void" },
  { name: 'MainCB', ret: "void", arity: 0, params: "void" },
  { name: 'MainTask', ret: "void", arity: 1, params: "u8" },
  { name: 'SetNamesAndTextSpeed', ret: "void", arity: 1, params: "struct BerryCrushGame *" },
  { name: 'RunOrScheduleCommand', ret: "void", arity: 3, params: "u16, u8, u8 *" },
  { name: 'SetPaletteFadeArgs', ret: "void", arity: 7, params: "u8 *, bool8, u32, s8, u8, u8, u16" },
  { name: 'UpdateGame', ret: "s32", arity: 1, params: "struct BerryCrushGame *" },
  { name: 'CreatePlayerNameWindows', ret: "void", arity: 1, params: "struct BerryCrushGame *" },
  { name: 'DrawPlayerNameWindows', ret: "void", arity: 1, params: "struct BerryCrushGame *" },
  { name: 'CopyPlayerNameWindowGfxToBg', ret: "void", arity: 1, params: "struct BerryCrushGame *" },
  { name: 'CreateGameSprites', ret: "void", arity: 1, params: "struct BerryCrushGame *" },
  { name: 'DestroyGameSprites', ret: "void", arity: 1, params: "struct BerryCrushGame *" },
  { name: 'PrintTimer', ret: "void", arity: 2, params: "struct BerryCrushGame_Gfx *, u16" },
  { name: 'SpriteCB_Sparkle_Init', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'HideTimer', ret: "void", arity: 1, params: "struct BerryCrushGame_Gfx *" },
  { name: 'ResetGame', ret: "void", arity: 1, params: "struct BerryCrushGame *" },
  { name: 'SetPrintMessageArgs', ret: "void", arity: 5, params: "u8 *, u8, u8, u16, u8" },
  { name: 'SpriteCB_Impact', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'Cmd_BeginNormalPaletteFade', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_WaitPaletteFade', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_PrintMessage', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_ShowGameDisplay', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_HideGameDisplay', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_SignalReadyToBegin', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_AskPickBerry', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_GoToBerryPouch', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_WaitForOthersToPickBerries', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_DropBerriesIntoCrusher', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_DropLid', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_Countdown', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_PlayGame_Leader', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_PlayGame_Member', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_FinishGame', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_HandleTimeUp', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_TabulateResults', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_ShowResults', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_SaveGame', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_AskPlayAgain', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_CommunicatePlayAgainResponses', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_PlayAgain', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_StopGame', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_CloseLink', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'Cmd_Quit', ret: "u32", arity: 2, params: "struct BerryCrushGame *, u8 *" },
  { name: 'GetBerryCrushGame', ret: "BerryCrushGame *", arity: 0, params: "void" },
  { name: 'QuitBerryCrush', ret: "u32", arity: 1, params: "MainCallback exitCallback" },
  { name: 'StartBerryCrush', ret: "void", arity: 1, params: "MainCallback exitCallback" },
  { name: 'GetBerryFromBag', ret: "void", arity: 0, params: "void" },
  { name: 'RemoveBagItem', ret: "else", arity: 2, params: "gSpecialVar_ItemId, 1" },
  { name: 'ChooseBerry', ret: "void", arity: 0, params: "void" },
  { name: 'BerryCrush_SetVBlankCB', ret: "void", arity: 0, params: "void" },
  { name: 'BerryCrush_InitVBlankCB', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'SaveResults', ret: "void", arity: 0, params: "void" },
  { name: 'ShowGameDisplay', ret: "s32", arity: 0, params: "void" },
  { name: 'HideGameDisplay', ret: "s32", arity: 0, params: "void" },
  { name: 'ResetCrusherPos', ret: "void", arity: 1, params: "struct BerryCrushGame *game" },
  { name: 'CreateBerrySprites', ret: "void", arity: 2, params: "struct BerryCrushGame *game, struct BerryCrushGame_Gfx *gfx" },
  { name: 'SpriteCB_DropBerryIntoCrusher', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'BerryCrushFreeBerrySpriteGfx', ret: "void", arity: 2, params: "struct BerryCrushGame *game, struct BerryCrushGame_Gfx *gfx" },
  { name: 'UpdateInputEffects', ret: "void", arity: 2, params: "struct BerryCrushGame *game, struct BerryCrushGame_Gfx *gfx" },
  { name: 'StartSpriteAnim', ret: "else", arity: 2, params: "gfx->impactSprites[i], 0" },
  { name: 'PlaySE', ret: "else", arity: 1, params: "SE_BREAKABLE_DOOR" },
  { name: 'AreEffectsFinished', ret: "bool32", arity: 2, params: "struct BerryCrushGame *game, struct BerryCrushGame_Gfx *gfx" },
  { name: 'FramesToMinSec', ret: "void", arity: 2, params: "struct BerryCrushGame_Gfx *gfx, u16 frames" },
  { name: 'PrintTextCentered', ret: "void", arity: 4, params: "u8 windowId, u8 left, u8 colorId, const u8 *string" },
  { name: 'PrintResultsText', ret: "void", arity: 4, params: "struct BerryCrushGame *game, u8 page, u8 sp14, u8 baseY" },
  { name: 'StringCopy', ret: "else", arity: 2, params: "gStringVar3, gText_1DotF700" },
  { name: 'PrintCrushingResults', ret: "void", arity: 1, params: "struct BerryCrushGame *game" },
  { name: 'AddTextPrinterParameterized3', ret: "else", arity: 7, params: "game->gfx.resultsWindowId, FONT_SHORT, x, y, sTextColorTable[COLORID_GRAY], 0, gStringVar4" },
  { name: 'OpenResultsWindow', ret: "bool32", arity: 2, params: "struct BerryCrushGame *game, struct BerryCrushGame_Gfx *gfx" },
  { name: 'CloseResultsWindow', ret: "void", arity: 1, params: "struct BerryCrushGame *game" },
  { name: 'Task_ShowRankings', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ShowBerryCrushRankings', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_Sparkle_End', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_Sparkle', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'HandlePartnerInput', ret: "void", arity: 1, params: "struct BerryCrushGame *game" },
  { name: 'UpdateLeaderGameState', ret: "void", arity: 1, params: "struct BerryCrushGame *game" },
  { name: 'HandlePlayerInput', ret: "void", arity: 1, params: "struct BerryCrushGame *game" },
  { name: 'RecvLinkData', ret: "void", arity: 1, params: "struct BerryCrushGame *game" },
  { name: 'AddTextPrinterParameterized2', ret: "else", arity: 8, params: "0, FONT_NORMAL, sMessages[MSG_DROPPED], game->textSpeed, 0, TEXT_COLOR_DARK_GRAY, TEXT_COLOR_WHITE, TEXT_COLOR_LIGHT_GRAY" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_ShowRankings',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_anim.h',
  'berry.h',
  'berry_powder.h',
  'bg.h',
  'decompress.h',
  'dynamic_placeholder_text_util.h',
  'event_data.h',
  'gpu_regs.h',
  'graphics.h',
  'international_string_util.h',
  'item_icon.h',
  'item_menu.h',
  'link.h',
  'link_rfu.h',
  'main.h',
  'malloc.h',
  'math_util.h',
  'menu.h',
  'overworld.h',
  'palette.h',
  'minigame_countdown.h',
  'random.h',
  'digit_obj_util.h',
  'save.h',
  'scanline_effect.h',
  'script.h',
  'sound.h',
  'sprite.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'text.h',
  'text_window.h',
  'trig.h',
  'window.h',
  'constants/items.h',
  'constants/rgb.h',
  'constants/songs.h',
] as const;
