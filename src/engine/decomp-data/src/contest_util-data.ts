// AUTO-GENERATED from src/contest_util.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/contest_util.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_TEXT_WINDOW_BASE = 3009;
export const TAG_CONFETTI = 3017;
export const TAG_WIRELESS_INDICATOR_WINDOW = 22222;
export const NUM_BAR_SEGMENTS = 11;
export const BAR_SEGMENT_LENGTH = 8;
/** Raw expr: `(NUM_BAR_SEGMENTS * BAR_SEGMENT_LENGTH)` */
export const MAX_BAR_LENGTH_EXPR = "(NUM_BAR_SEGMENTS * BAR_SEGMENT_LENGTH)";
/** Raw expr: `(DISPLAY_WIDTH + 32)` */
export const TEXT_BOX_X_EXPR = "(DISPLAY_WIDTH + 32)";
/** Raw expr: `(DISPLAY_HEIGHT - 16)` */
export const TEXT_BOX_Y_EXPR = "(DISPLAY_HEIGHT - 16)";
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tTimer_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tCounter_EXPR = "data[2]";
/** Raw expr: `data[0]` */
export const tFinalStanding_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tMonIndex_EXPR = "data[1]";
/** Raw expr: `data[0]` */
export const tDelay_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tCoeff_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tDecreasing_EXPR = "data[2]";
/** Raw expr: `data[4]` */
export const sTargetX_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sSlideOutTimer_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const sSlideIncrement_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const sDistance_EXPR = "data[7]";
/** Raw expr: `data[1]` */
export const tNumFrames_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tSpecies_EXPR = "data[2]";
/** Raw expr: `data[11]` */
export const tBounced_EXPR = "data[11]";
/** Raw expr: `data[0]` */
export const tMonId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tTarget_EXPR = "data[1]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_SLIDING_0 = {
  SLIDING_TEXT_OFFSCREEN: 0,
  SLIDING_TEXT_ENTERING: 1,
  SLIDING_TEXT_ARRIVED: 2,
  SLIDING_TEXT_EXITING: 3,
} as const;
export const ENUM_SLIDING_1 = {
  SLIDING_MON_ENTERED: 1,
  SLIDING_MON_EXITED: 2,
} as const;
export const ENUM_TAG_2 = {
  TAG_RESULTS_TEXT_WINDOW_LEFT: 0,
  TAG_RESULTS_TEXT_WINDOW_MIDLEFT: 1,
  TAG_RESULTS_TEXT_WINDOW_MIDRIGHT: 2,
  TAG_RESULTS_TEXT_WINDOW_RIGHT: 3,
  TAG_LINK_TEXT_WINDOW_LEFT: 4,
  TAG_LINK_TEXT_WINDOW_MIDLEFT: 5,
  TAG_LINK_TEXT_WINDOW_MIDRIGHT: 6,
  TAG_LINK_TEXT_WINDOW_RIGHT: 7,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplates = [
  { bg: 1, tilemapLeft: 7, tilemapTop: 4, width: 12, height: 2, paletteNum: 15, baseBlock: 770 },
  { bg: 1, tilemapLeft: 7, tilemapTop: 7, width: 12, height: 2, paletteNum: 15, baseBlock: 794 },
  { bg: 1, tilemapLeft: 7, tilemapTop: 10, width: 12, height: 2, paletteNum: 15, baseBlock: 818 },
  { bg: 1, tilemapLeft: 7, tilemapTop: 13, width: 12, height: 2, paletteNum: 15, baseBlock: 842 },
] as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 24, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 28, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 26, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_ResultsTextWindow = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x32)", tileNum: 0, priority: 3, paletteNum: 2, affineParam: 0 } as const;
export const sOamData_Confetti = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(8x8)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_WirelessIndicatorWindow = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_ResultsTextWindow = { tileTag: "TAG_TEXT_WINDOW_BASE", paletteTag: "TAG_TEXT_WINDOW_BASE", oam: "&sOamData_ResultsTextWindow", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Confetti = { tileTag: "TAG_CONFETTI", paletteTag: "TAG_CONFETTI", oam: "&sOamData_Confetti", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Confetti" } as const;
export const sSpriteTemplate_WirelessIndicatorWindow = { tileTag: "TAG_WIRELESS_INDICATOR_WINDOW", paletteTag: 0, oam: "&sOamData_WirelessIndicatorWindow", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── SpriteSheet ─────────────────────────────────────────────────────────────
export const sSpriteSheets_ResultsTextWindow = [
  { data: "gMiscBlank_Gfx", size: 1024, tag: "TAG_RESULTS_TEXT_WINDOW_LEFT" },
  { data: "gMiscBlank_Gfx", size: 1024, tag: "TAG_RESULTS_TEXT_WINDOW_MIDLEFT" },
  { data: "gMiscBlank_Gfx", size: 1024, tag: "TAG_RESULTS_TEXT_WINDOW_MIDRIGHT" },
  { data: "gMiscBlank_Gfx", size: 1024, tag: "TAG_RESULTS_TEXT_WINDOW_RIGHT" },
  { data: "gMiscBlank_Gfx", size: 1024, tag: "TAG_LINK_TEXT_WINDOW_LEFT" },
  { data: "gMiscBlank_Gfx", size: 1024, tag: "TAG_LINK_TEXT_WINDOW_MIDLEFT" },
  { data: "gMiscBlank_Gfx", size: 1024, tag: "TAG_LINK_TEXT_WINDOW_MIDRIGHT" },
  { data: "gMiscBlank_Gfx", size: 1024, tag: "TAG_LINK_TEXT_WINDOW_RIGHT" },
] as const;
export const sSpriteSheet_WirelessIndicatorWindow = { data: "gMiscBlank_Gfx", size: 512, tag: "TAG_WIRELESS_INDICATOR_WINDOW" } as const;

// ─── CompressedSpriteSheet ─────────────────────────────────────────────────────────────
export const sSpriteSheet_Confetti = { data: "gConfetti_Gfx", size: 544, tag: "TAG_CONFETTI" } as const;

// ─── SpritePalette ─────────────────────────────────────────────────────────────
export const sSpritePalette_ResultsTextWindow = { data: "sMiscBlank_Pal", tag: "TAG_TEXT_WINDOW_BASE" } as const;

// ─── CompressedSpritePalette ─────────────────────────────────────────────────────────────
export const sSpritePalette_Confetti = { data: "gConfetti_Pal", tag: "TAG_CONFETTI" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sResultsTextWindow_Pal': { path: 'graphics/contest/results_screen/text_window.pal', ext: '.gbapal', type: 'u16' },
  'sResultsTextWindow_Gfx': { path: 'graphics/contest/results_screen/text_window.png', ext: '.4bpp', type: 'u8' },
  'sMiscBlank_Pal': { path: 'graphics/interface/blank.pal', ext: '.gbapal', type: 'u16' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GET_CONTEST_WINNER_ID', ret: "define", arity: 1, params: "i" },
  { name: 'LoadAllContestMonIconPalettes', ret: "void", arity: 0, params: "void" },
  { name: 'LoadContestResultsTitleBarTilemaps', ret: "void", arity: 0, params: "void" },
  { name: 'GetNumPreliminaryPoints', ret: "u8", arity: 2, params: "u8, bool8" },
  { name: 'GetNumRound2Points', ret: "s8", arity: 2, params: "u8, bool8" },
  { name: 'AddContestTextPrinter', ret: "void", arity: 3, params: "int, u8 *, int" },
  { name: 'AllocContestResults', ret: "void", arity: 0, params: "void" },
  { name: 'FreeContestResults', ret: "void", arity: 0, params: "void" },
  { name: 'LoadAllContestMonIcons', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'CreateResultsTextWindowSprites', ret: "void", arity: 0, params: "void" },
  { name: 'TryCreateWirelessSprites', ret: "void", arity: 0, params: "void" },
  { name: 'Task_StartShowContestResults', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CB2_StartShowContestResults', ret: "void", arity: 0, params: "void" },
  { name: 'Task_ShowContestResults', ret: "void", arity: 1, params: "u8" },
  { name: 'CB2_ShowContestResults', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_ShowContestResults', ret: "void", arity: 0, params: "void" },
  { name: 'Task_SlideContestResultsBg', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WaitForLinkPartnersBeforeResults', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_CommunicateMonIdxsForResults', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WaitForLinkPartnerMonIdxs', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_AnnouncePreliminaryResults', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_FlashStarsAndHearts', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ShowPreliminaryResults', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_AnnounceRound2Results', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ShowRound2Results', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_AnnounceWinner', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_DrawFinalStandingNumber', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_StartHighlightWinnersBox', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HighlightWinnersBox', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ShowWinnerMonBanner', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_SetSeenWinnerMon', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_TryDisconnectLinkPartners', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WaitForLinkPartnersDisconnect', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_TrySetContestInterviewData', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_EndShowContestResults', ret: "void", arity: 1, params: "u8" },
  { name: 'CalculateContestantsResultData', ret: "void", arity: 0, params: "void" },
  { name: 'ShowLinkResultsTextBox', ret: "void", arity: 1, params: "const u8 *" },
  { name: 'HideLinkResultsTextBox', ret: "void", arity: 0, params: "void" },
  { name: 'DrawResultsTextWindow', ret: "s32", arity: 2, params: "const u8 *, u8" },
  { name: 'StartTextBoxSlideIn', ret: "void", arity: 4, params: "s16, u16, u16, u16" },
  { name: 'UpdateContestResultBars', ret: "void", arity: 2, params: "bool8, u8" },
  { name: 'Task_UpdateContestResultBar', ret: "void", arity: 1, params: "u8" },
  { name: 'StartTextBoxSlideOut', ret: "void", arity: 1, params: "u16" },
  { name: 'BounceMonIconInBox', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'Task_BounceMonIconInBox', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_WinnerMonSlideIn', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_WinnerMonSlideOut', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'Task_CreateConfetti', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_TextBoxSlideIn', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_TextBoxSlideOut', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_EndTextBoxSlideIn', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'Task_StartCommunication', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_StartCommunicateRngRS', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_StartCommunicateLeaderIdsRS', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_StartCommunicateCategoryRS', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_LinkContest_SetUpContestRS', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_LinkContest_CalculateTurnOrderRS', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_LinkContest_Disconnect', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_LinkContest_WaitDisconnect', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_Confetti', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'Task_ShowContestEntryMonPic', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_LinkContestWaitForConnection', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'InitContestResultsDisplay', ret: "void", arity: 0, params: "void" },
  { name: 'LoadContestResultsBgGfx', ret: "void", arity: 0, params: "void" },
  { name: 'LoadContestMonName', ret: "void", arity: 1, params: "u8 monIndex" },
  { name: 'LoadAllContestMonNames', ret: "void", arity: 0, params: "void" },
  { name: 'PlayBGM', ret: "else", arity: 1, params: "MUS_CONTEST_RESULTS" },
  { name: 'LoadContestMonIcon', ret: "void", arity: 5, params: "u16 species, u8 monIndex, u8 srcOffset, u8 useDmaNow, u32 personality" },
  { name: 'EndTextBoxSlideOut', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'TryEnterContestMon', ret: "void", arity: 0, params: "void" },
  { name: 'HasMonWonThisContestBefore', ret: "u16", arity: 0, params: "void" },
  { name: 'GiveMonContestRibbon', ret: "void", arity: 0, params: "void" },
  { name: 'BufferContestantTrainerName', ret: "void", arity: 0, params: "void" },
  { name: 'BufferContestantMonNickname', ret: "void", arity: 0, params: "void" },
  { name: 'GetContestMonConditionRanking', ret: "void", arity: 0, params: "void" },
  { name: 'GetContestMonCondition', ret: "void", arity: 0, params: "void" },
  { name: 'GetContestWinnerId', ret: "void", arity: 0, params: "void" },
  { name: 'BufferContestWinnerTrainerName', ret: "void", arity: 0, params: "void" },
  { name: 'BufferContestWinnerMonName', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_SetStartContestCallback', ret: "void", arity: 0, params: "void" },
  { name: 'Task_StartContest', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'StartContest', ret: "void", arity: 0, params: "void" },
  { name: 'BufferContestantMonSpecies', ret: "void", arity: 0, params: "void" },
  { name: 'ShowContestResults', ret: "void", arity: 0, params: "void" },
  { name: 'GetContestPlayerId', ret: "void", arity: 0, params: "void" },
  { name: 'ContestLinkTransfer', ret: "void", arity: 1, params: "u8 category" },
  { name: 'LinkContest_GetLeaderIndex', ret: "u8", arity: 1, params: "u8 *ids" },
  { name: 'Task_LinkContest_FinalizeConnection', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetContestTrainerGfxIds', ret: "void", arity: 0, params: "void" },
  { name: 'GetNpcContestantLocalId', ret: "void", arity: 0, params: "void" },
  { name: 'BufferContestTrainerAndMonNames', ret: "void", arity: 0, params: "void" },
  { name: 'DoesContestCategoryHaveMuseumPainting', ret: "void", arity: 0, params: "void" },
  { name: 'SaveMuseumContestPainting', ret: "void", arity: 0, params: "void" },
  { name: 'ShouldReadyContestArtist', ret: "void", arity: 0, params: "void" },
  { name: 'CountPlayerMuseumPaintings', ret: "u8", arity: 0, params: "void" },
  { name: 'GetContestantNamesAtRank', ret: "void", arity: 0, params: "void" },
  { name: 'ExitContestPainting', ret: "void", arity: 0, params: "void" },
  { name: 'ShowContestPainting', ret: "void", arity: 0, params: "void" },
  { name: 'SetLinkContestPlayerGfx', ret: "void", arity: 0, params: "void" },
  { name: 'LoadLinkContestPlayerPalettes', ret: "void", arity: 0, params: "void" },
  { name: 'GiveMonArtistRibbon', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsContestDebugActive', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShowContestEntryMonPic', ret: "void", arity: 0, params: "void" },
  { name: 'HandleLoadSpecialPokePic_DontHandleDeoxys', ret: "else", arity: 4, params: "&gMonFrontPicTable[species], gMonSpritesGfxPtr->sprites.ptr[B_POSITION_OPPONENT_LEFT], species, personality" },
  { name: 'HideContestEntryMonPic', ret: "void", arity: 0, params: "void" },
  { name: 'GetContestMultiplayerId', ret: "void", arity: 0, params: "void" },
  { name: 'GenerateContestRand', ret: "void", arity: 0, params: "void" },
  { name: 'GetContestRand', ret: "u16", arity: 0, params: "void" },
  { name: 'LinkContestWaitForConnection', ret: "bool8", arity: 0, params: "void" },
  { name: 'LinkContestTryShowWirelessIndicator', ret: "void", arity: 0, params: "void" },
  { name: 'LinkContestTryHideWirelessIndicator', ret: "void", arity: 0, params: "void" },
  { name: 'IsContestWithRSPlayer', ret: "bool8", arity: 0, params: "void" },
  { name: 'ClearLinkContestFlags', ret: "void", arity: 0, params: "void" },
  { name: 'IsWirelessContest', ret: "bool8", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_AnnouncePreliminaryResults',
  'Task_AnnounceRound2Results',
  'Task_AnnounceWinner',
  'Task_BounceMonIconInBox',
  'Task_CommunicateMonIdxsForResults',
  'Task_CreateConfetti',
  'Task_DrawFinalStandingNumber',
  'Task_EndShowContestResults',
  'Task_FlashStarsAndHearts',
  'Task_HighlightWinnersBox',
  'Task_LinkContestWaitForConnection',
  'Task_LinkContest_CalculateTurnOrderRS',
  'Task_LinkContest_Disconnect',
  'Task_LinkContest_FinalizeConnection',
  'Task_LinkContest_SetUpContestRS',
  'Task_LinkContest_WaitDisconnect',
  'Task_SetSeenWinnerMon',
  'Task_ShowContestEntryMonPic',
  'Task_ShowContestResults',
  'Task_ShowPreliminaryResults',
  'Task_ShowRound2Results',
  'Task_ShowWinnerMonBanner',
  'Task_SlideContestResultsBg',
  'Task_StartCommunicateCategoryRS',
  'Task_StartCommunicateLeaderIdsRS',
  'Task_StartCommunicateRngRS',
  'Task_StartCommunication',
  'Task_StartContest',
  'Task_StartHighlightWinnersBox',
  'Task_StartShowContestResults',
  'Task_TryDisconnectLinkPartners',
  'Task_TrySetContestInterviewData',
  'Task_UpdateContestResultBar',
  'Task_WaitForLinkPartnerMonIdxs',
  'Task_WaitForLinkPartnersBeforeResults',
  'Task_WaitForLinkPartnersDisconnect',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_SetStartContestCallback',
  'CB2_ShowContestResults',
  'CB2_StartShowContestResults',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'battle.h',
  'battle_gfx_sfx_util.h',
  'bg.h',
  'contest.h',
  'contest_util.h',
  'contest_link.h',
  'contest_painting.h',
  'data.h',
  'decompress.h',
  'dma3.h',
  'event_data.h',
  'event_object_movement.h',
  'field_specials.h',
  'gpu_regs.h',
  'graphics.h',
  'international_string_util.h',
  'link.h',
  'link_rfu.h',
  'load_save.h',
  'main.h',
  'overworld.h',
  'palette.h',
  'pokedex.h',
  'pokemon.h',
  'pokemon_icon.h',
  'random.h',
  'save.h',
  'scanline_effect.h',
  'script.h',
  'script_menu.h',
  'sound.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'text.h',
  'trig.h',
  'tv.h',
  'util.h',
  'window.h',
  'constants/event_objects.h',
  'constants/field_specials.h',
  'constants/game_stat.h',
  'constants/rgb.h',
  'constants/songs.h',
  'contest.h',
] as const;
