// AUTO-GENERATED from src/dodrio_berry_picking.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/dodrio_berry_picking.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MAX_SCORE = 999990;
export const MAX_BERRIES = 9999;
export const PRIZE_SCORE = 3000;
export const NUM_DIFFICULTIES = 7;
export const MAX_FALL_DIST = 10;
export const EAT_FALL_DIST = 7;
export const NUM_BERRY_TYPES = 4;
/** Raw expr: `(BERRY_MISSED * 2)` */
export const ANIM_EATEN_EXPR = "(BERRY_MISSED * 2)";
export const NUM_STATUS_SQUARES = 10;
export const NUM_BERRY_COLUMNS = 11;
export const GFXTAG_DODRIO = 0;
export const GFXTAG_STATUS = 1;
export const GFXTAG_BERRIES = 2;
export const GFXTAG_CLOUD = 5;
export const GFXTAG_COUNTDOWN = 7;
export const PALTAG_DODRIO_NORMAL = 0;
export const PALTAG_DODRIO_SHINY = 1;
export const PALTAG_STATUS = 2;
export const PALTAG_BERRIES = 3;
export const PALTAG_CLOUD = 6;
export const PALTAG_COUNTDOWN = 8;
export const NUM_CLOUDS = 2;
export const PLAYER_NONE = 255;
export const x = 9;
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
export const NUM_RECORD_TYPES = 3;
/** Raw expr: `data[1]` */
export const tWindowId_EXPR = "data[1]";
/** Raw expr: `data[0]` */
export const sState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sTimer_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sUnused1_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sUnused2_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sUnused3_EXPR = "data[4]";
export const FRAMES_PER_STATE = 13;
/** Raw expr: `PICK_DISABLED` */
export const NUM_INTRO_PICK_STATES_EXPR = "PICK_DISABLED";
/** Raw expr: `data[1]` */
export const sFrozen_EXPR = "data[1]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_BG_0 = {
  BG_INTERFACE: 0,
  BG_TREE_LEFT: 1,
  BG_TREE_RIGHT: 2,
  BG_SCENERY: 3,
} as const;
export const ENUM_FUNC_1 = {
  FUNC_INTRO: 0,
  FUNC_INIT_COUNTDOWN: 1,
  FUNC_COUNTDOWN: 2,
  FUNC_WAIT_START: 3,
  FUNC_PLAY_GAME: 4,
  FUNC_INIT_RESULTS: 5,
  FUNC_RESULTS: 6,
  FUNC_ASK_PLAY_AGAIN: 7,
  FUNC_END_LINK: 8,
  FUNC_EXIT: 9,
  FUNC_RESET_GAME: 10,
  FUNC_WAIT_END_GAME: 11,
} as const;
export const ENUM_GFXFUNC_2 = {
  GFXFUNC_LOAD: 0,
  GFXFUNC_SHOW_NAMES: 1,
  GFXFUNC_SHOW_RESULTS: 2,
  GFXFUNC_MSG_PLAY_AGAIN: 3,
  GFXFUNC_MSG_SAVING: 4,
  GFXFUNC_MSG_COMM_STANDBY: 5,
  GFXFUNC_ERASE_MSG: 6,
  GFXFUNC_MSG_PLAYER_DROPPED: 7,
  GFXFUNC_STOP: 8,
  GFXFUNC_IDLE: 9,
} as const;
export const ENUM_PACKET_3 = {
  PACKET_READY_START: 1,
  PACKET_GAME_STATE: 2,
  PACKET_PICK_STATE: 3,
  PACKET_READY_END: 4,
} as const;
export const ENUM_PLAY_4 = {
  PLAY_AGAIN_NONE: 0,
  PLAY_AGAIN_YES: 1,
  PLAY_AGAIN_NO: 2,
  PLAY_AGAIN_DROPPED: 5,
} as const;
export const ENUM_PICK_5 = {
  PICK_NONE: 0,
  PICK_RIGHT: 1,
  PICK_MIDDLE: 2,
  PICK_LEFT: 3,
  PICK_DISABLED: 4,
} as const;
export const ENUM_BERRY_6 = {
  BERRY_BLUE: 0,
  BERRY_GREEN: 1,
  BERRY_GOLD: 2,
  BERRY_MISSED: 3,
  BERRY_PRIZE: 4,
  BERRY_IN_ROW: 5,
  NUM_BERRY_IDS: 6,
} as const;
export const ENUM_BERRYSTATE_7 = {
  BERRYSTATE_NONE: 0,
  BERRYSTATE_PICKED: 1,
  BERRYSTATE_EATEN: 2,
  BERRYSTATE_SQUISHED: 3,
} as const;
export const ENUM_INPUTSTATE_8 = {
  INPUTSTATE_NONE: 0,
  INPUTSTATE_TRY_PICK: 1,
  INPUTSTATE_PICKED: 2,
  INPUTSTATE_ATE_BERRY: 3,
  INPUTSTATE_BAD_MISS: 4,
} as const;
export const ENUM_STATUS_9 = {
  STATUS_YELLOW: 0,
  STATUS_GRAY: 1,
  STATUS_RED: 2,
} as const;
export const ENUM_PRIZE_10 = {
  PRIZE_RECEIVED: 0,
  PRIZE_FILLED_BAG: 1,
  PRIZE_NO_ROOM: 2,
  NO_PRIZE: 3,
} as const;
export const ENUM_WIN_11 = {
  WIN_PLAY_AGAIN: 0,
  WIN_YES_NO: 1,
} as const;
export const ENUM_COLORID_12 = {
  COLORID_GRAY: 0,
  COLORID_RED: 1,
  COLORID_BLUE: 2,
  COLORID_GREEN: 3,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplates_Records = { bg: 0, tilemapLeft: 5, tilemapTop: 1, width: 20, height: 11, paletteNum: 15, baseBlock: 1 } as const;
export const sWindowTemplates_Results = [
  { bg: "BG_INTERFACE", tilemapLeft: 1, tilemapTop: 1, width: 28, height: 2, paletteNum: 13, baseBlock: 19 },
  { bg: "BG_INTERFACE", tilemapLeft: 1, tilemapTop: 5, width: 28, height: 14, paletteNum: 13, baseBlock: 75 },
] as const;
export const sWindowTemplate_Prize = { bg: "BG_INTERFACE", tilemapLeft: 1, tilemapTop: 5, width: 28, height: 7, paletteNum: 13, baseBlock: 75 } as const;
export const sWindowTemplates_PlayAgain = [
  { bg: "BG_INTERFACE", tilemapLeft: 1, tilemapTop: 8, width: 19, height: 3, paletteNum: 13, baseBlock: 19 },
  { bg: "BG_INTERFACE", tilemapLeft: 22, tilemapTop: 7, width: 6, height: 4, paletteNum: 13, baseBlock: 76 },
] as const;
export const sWindowTemplate_DroppedOut = { bg: "BG_INTERFACE", tilemapLeft: 4, tilemapTop: 6, width: 22, height: 5, paletteNum: 13, baseBlock: 19 } as const;
export const sWindowTemplate_CommStandby = { bg: "BG_INTERFACE", tilemapLeft: 5, tilemapTop: 8, width: 19, height: 3, paletteNum: 13, baseBlock: 19 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = [
  { bg: "BG_INTERFACE", charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: "BG_TREE_LEFT", charBaseIndex: 2, mapBaseIndex: 12, screenSize: 1, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: "BG_TREE_RIGHT", charBaseIndex: 2, mapBaseIndex: 14, screenSize: 1, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: "BG_SCENERY", charBaseIndex: 3, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_Dodrio = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_16x16_Priority0 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_Berry = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_Cloud = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x32)", tileNum: 0, priority: 3, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const template = { tileTag: "GFXTAG_CLOUD", paletteTag: "PALTAG_CLOUD", oam: "&sOamData_Cloud", anims: "sAnims_Cloud", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Cloud" } as const;
export const berry = { tileTag: "GFXTAG_BERRIES", paletteTag: "PALTAG_BERRIES", oam: "&sOamData_Berry", anims: "sAnims_Berry", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const berryIcon = { tileTag: "GFXTAG_BERRIES", paletteTag: "PALTAG_BERRIES", oam: "&sOamData_16x16_Priority0", anims: "sAnims_Berry", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sDodrioNormal_Pal': { path: 'graphics/dodrio_berry_picking/dodrio.png', ext: '.gbapal', type: 'u16' },
  'sDodrioShiny_Pal': { path: 'graphics/dodrio_berry_picking/shiny.pal', ext: '.gbapal', type: 'u16' },
  'sStatus_Pal': { path: 'graphics/dodrio_berry_picking/status.png', ext: '.gbapal', type: 'u16' },
  'sBerries_Pal': { path: 'graphics/dodrio_berry_picking/berries.png', ext: '.gbapal', type: 'u16' },
  'sBerries_Gfx': { path: 'graphics/dodrio_berry_picking/berries.png', ext: '.4bpp.lz', type: 'u32' },
  'sCloud_Pal': { path: 'graphics/dodrio_berry_picking/cloud.png', ext: '.gbapal', type: 'u16' },
  'sBg_Gfx': { path: 'graphics/dodrio_berry_picking/bg.png', ext: '.4bpp.lz', type: 'u32' },
  'sTreeBorder_Gfx': { path: 'graphics/dodrio_berry_picking/tree_border.png', ext: '.4bpp.lz', type: 'u32' },
  'sStatus_Gfx': { path: 'graphics/dodrio_berry_picking/status.png', ext: '.4bpp.lz', type: 'u32' },
  'sCloud_Gfx': { path: 'graphics/dodrio_berry_picking/cloud.png', ext: '.4bpp.lz', type: 'u32' },
  'sDodrio_Gfx': { path: 'graphics/dodrio_berry_picking/dodrio.png', ext: '.4bpp.lz', type: 'u32' },
  'sBg_Tilemap': { path: 'graphics/dodrio_berry_picking/bg.bin', ext: '.lz', type: 'u32' },
  'sTreeBorderRight_Tilemap': { path: 'graphics/dodrio_berry_picking/tree_border_right.bin', ext: '.lz', type: 'u32' },
  'sTreeBorderLeft_Tilemap': { path: 'graphics/dodrio_berry_picking/tree_border_left.bin', ext: '.lz', type: 'u32' },
};

// ─── INCBIN paths (raw binary includes) ─────────────────────────────────────
export const INCBIN_SOURCES: Record<string, { path: string; type: string }> = {
  'sBg_Pal': { path: 'graphics/dodrio_berry_picking/bg.gbapal', type: 'u16' },
};

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sRecordsTexts = ['gText_BerriesPicked', 'gText_BestScore', 'gText_BerriesInRowFivePlayers'] as const;
export const sDebug_PlayerNames = ['sText_Letters', 'sText_Digits'] as const;
export const sRankingTexts = ['gText_1Colon', 'gText_2Colon', 'gText_3Colon', 'gText_4Colon', 'gText_5Colon'] as const;

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sBerryIconXCoords: readonly number[] = [88,128,168,208] as const;
export const moveDelays: readonly number[] = [30,20] as const;
export const sResultsXCoords: readonly number[] = [92,132,172,212] as const;
export const sResultsYCoords: readonly number[] = [33,49,65,81,97] as const;
export const sRankingYCoords: readonly number[] = [17,33,49,65,81] as const;

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sLeaderFuncs = ['DoGameIntro', 'InitCountdown', 'DoCountdown', 'WaitGameStart', 'PlayGame_Leader', 'InitResults_Leader', 'DoResults', 'AskPlayAgain', 'EndLink', 'ExitGame', 'ResetGame', 'WaitEndGame_Leader'] as const;
export const sMemberFuncs = ['DoGameIntro', 'InitCountdown', 'DoCountdown', 'WaitGameStart', 'PlayGame_Member', 'InitResults_Member', 'DoResults', 'AskPlayAgain', 'EndLink', 'ExitGame', 'ResetGame', 'WaitEndGame_Member'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ResetTasksAndSprites', ret: "void", arity: 0, params: "void" },
  { name: 'InitDodrioGame', ret: "void", arity: 1, params: "struct DodrioGame *" },
  { name: 'Task_StartDodrioGame', ret: "void", arity: 1, params: "u8" },
  { name: 'DoGameIntro', ret: "void", arity: 0, params: "void" },
  { name: 'InitCountdown', ret: "void", arity: 0, params: "void" },
  { name: 'DoCountdown', ret: "void", arity: 0, params: "void" },
  { name: 'WaitGameStart', ret: "void", arity: 0, params: "void" },
  { name: 'PlayGame_Leader', ret: "void", arity: 0, params: "void" },
  { name: 'PlayGame_Member', ret: "void", arity: 0, params: "void" },
  { name: 'WaitEndGame_Leader', ret: "void", arity: 0, params: "void" },
  { name: 'WaitEndGame_Member', ret: "void", arity: 0, params: "void" },
  { name: 'InitResults_Leader', ret: "void", arity: 0, params: "void" },
  { name: 'InitResults_Member', ret: "void", arity: 0, params: "void" },
  { name: 'DoResults', ret: "void", arity: 0, params: "void" },
  { name: 'AskPlayAgain', ret: "void", arity: 0, params: "void" },
  { name: 'EndLink', ret: "void", arity: 0, params: "void" },
  { name: 'ExitGame', ret: "void", arity: 0, params: "void" },
  { name: 'ResetGame', ret: "void", arity: 0, params: "void" },
  { name: 'Task_NewGameIntro', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_CommunicateMonInfo', ret: "void", arity: 1, params: "u8" },
  { name: 'RecvLinkData_Leader', ret: "void", arity: 0, params: "void" },
  { name: 'SendLinkData_Leader', ret: "void", arity: 0, params: "void" },
  { name: 'RecvLinkData_Member', ret: "void", arity: 0, params: "void" },
  { name: 'SendLinkData_Member', ret: "void", arity: 0, params: "void" },
  { name: 'HandleSound_Leader', ret: "void", arity: 0, params: "void" },
  { name: 'HandleSound_Member', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_DodrioGame', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_DodrioGame', ret: "void", arity: 0, params: "void" },
  { name: 'InitMonInfo', ret: "void", arity: 2, params: "struct DodrioGame_MonInfo *, struct Pokemon *" },
  { name: 'CreateTask_', ret: "void", arity: 2, params: "TaskFunc, u8" },
  { name: 'CreateDodrioGameTask', ret: "void", arity: 1, params: "TaskFunc" },
  { name: 'SetGameFunc', ret: "void", arity: 1, params: "u8" },
  { name: 'SlideTreeBordersOut', ret: "bool32", arity: 0, params: "void" },
  { name: 'InitFirstWaveOfBerries', ret: "void", arity: 0, params: "void" },
  { name: 'TryPickBerry', ret: "bool32", arity: 3, params: "u8, u8, u8" },
  { name: 'UpdateFallingBerries', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateGame_Leader', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateGame_Member', ret: "void", arity: 0, params: "void" },
  { name: 'GetActiveBerryColumns', ret: "void", arity: 3, params: "u8, u8 *, u8 *" },
  { name: 'AllPlayersReadyToStart', ret: "bool32", arity: 0, params: "void" },
  { name: 'ResetReadyToStart', ret: "void", arity: 0, params: "void" },
  { name: 'ReadyToEndGame_Leader', ret: "bool32", arity: 0, params: "void" },
  { name: 'ReadyToEndGame_Member', ret: "bool32", arity: 0, params: "void" },
  { name: 'TryIncrementDifficulty', ret: "void", arity: 1, params: "u8" },
  { name: 'GetPlayerIdAtColumn', ret: "u8", arity: 1, params: "u8" },
  { name: 'GetNewBerryId', ret: "u8", arity: 2, params: "u8, u8" },
  { name: 'IncrementBerryResult', ret: "void", arity: 3, params: "u8, u8, u8" },
  { name: 'UpdateBerriesPickedInRow', ret: "void", arity: 1, params: "bool32" },
  { name: 'SetMaxBerriesPickedInRow', ret: "void", arity: 0, params: "void" },
  { name: 'ResetForPlayAgainPrompt', ret: "void", arity: 0, params: "void" },
  { name: 'SetRandomPrize', ret: "void", arity: 0, params: "void" },
  { name: 'TryUpdateRecords', ret: "void", arity: 0, params: "void" },
  { name: 'UpdatePickStateQueue', ret: "u8", arity: 1, params: "u8" },
  { name: 'HandleWaitPlayAgainInput', ret: "void", arity: 0, params: "void" },
  { name: 'ResetPickState', ret: "void", arity: 0, params: "void" },
  { name: 'GetHighestScore', ret: "u32", arity: 0, params: "void" },
  { name: 'SendPacket_ReadyToStart', ret: "void", arity: 1, params: "bool32" },
  { name: 'SendPacket_GameState', ret: "void", arity: 9, params: "struct DodrioGame_Player *,\n                                 struct DodrioGame_PlayerCommData *,\n                                 struct DodrioGame_PlayerCommData *,\n                                 struct DodrioGame_PlayerCommData *,\n                                 struct DodrioGame_PlayerCommData *,\n                                 struct DodrioGame_PlayerCommData *,\n                                 u8 , bool32 , bool32" },
  { name: 'RecvPacket_GameState', ret: "bool32", arity: 10, params: "u32,\n                                   struct DodrioGame_Player *,\n                                   struct DodrioGame_PlayerCommData *,\n                                   struct DodrioGame_PlayerCommData *,\n                                   struct DodrioGame_PlayerCommData *,\n                                   struct DodrioGame_PlayerCommData *,\n                                   struct DodrioGame_PlayerCommData *,\n                                   u8 *, bool32 *, bool32 *" },
  { name: 'SendPacket_PickState', ret: "void", arity: 1, params: "u8" },
  { name: 'RecvPacket_PickState', ret: "bool32", arity: 2, params: "u32, u8 *" },
  { name: 'SendPacket_ReadyToEnd', ret: "void", arity: 1, params: "bool32" },
  { name: 'RecvPacket_ReadyToEnd', ret: "bool32", arity: 1, params: "u32" },
  { name: 'LoadDodrioGfx', ret: "void", arity: 0, params: "void" },
  { name: 'CreateDodrioSprite', ret: "void", arity: 4, params: "struct DodrioGame_MonInfo *, u8, u8, u8" },
  { name: 'StartDodrioMissedAnim', ret: "void", arity: 1, params: "u8" },
  { name: 'StartDodrioIntroAnim', ret: "void", arity: 1, params: "u8" },
  { name: 'FreeDodrioSprites', ret: "void", arity: 1, params: "u8" },
  { name: 'SetAllDodrioInvisibility', ret: "void", arity: 2, params: "bool8, u8" },
  { name: 'CreateStatusBarSprites', ret: "void", arity: 0, params: "void" },
  { name: 'FreeStatusBar', ret: "void", arity: 0, params: "void" },
  { name: 'SetStatusBarInvisibility', ret: "void", arity: 1, params: "bool8" },
  { name: 'InitStatusBarPos', ret: "void", arity: 0, params: "void" },
  { name: 'DoStatusBarIntro', ret: "bool32", arity: 0, params: "void" },
  { name: 'LoadBerryGfx', ret: "void", arity: 0, params: "void" },
  { name: 'CreateBerrySprites', ret: "void", arity: 0, params: "void" },
  { name: 'FreeBerrySprites', ret: "void", arity: 0, params: "void" },
  { name: 'CreateCloudSprites', ret: "void", arity: 0, params: "void" },
  { name: 'ResetCloudPos', ret: "void", arity: 0, params: "void" },
  { name: 'StartCloudMovement', ret: "void", arity: 0, params: "void" },
  { name: 'FreeCloudSprites', ret: "void", arity: 0, params: "void" },
  { name: 'SetCloudInvisibility', ret: "void", arity: 1, params: "bool8" },
  { name: 'ResetBerryAndStatusBarSprites', ret: "void", arity: 0, params: "void" },
  { name: 'ResetGfxState', ret: "void", arity: 0, params: "void" },
  { name: 'InitGameGfx', ret: "void", arity: 1, params: "struct DodrioGame_Gfx *" },
  { name: 'SetGfxFuncById', ret: "void", arity: 1, params: "u8" },
  { name: 'IsGfxFuncActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetPlayAgainState', ret: "u8", arity: 0, params: "void" },
  { name: 'SetBerryInvisibility', ret: "void", arity: 2, params: "u8, bool8" },
  { name: 'SetBerryIconsInvisibility', ret: "void", arity: 1, params: "bool8" },
  { name: 'SetBerryAnim', ret: "void", arity: 2, params: "u16, u8" },
  { name: 'SetBerryYPos', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'SetDodrioAnim', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'GetNewBerryIdByDifficulty', ret: "u8", arity: 2, params: "u8, u8" },
  { name: 'UpdateStatusBarAnim', ret: "void", arity: 1, params: "u8" },
  { name: 'RecvPacket_ReadyToStart', ret: "u32", arity: 1, params: "u32" },
  { name: 'IncrementWithLimit', ret: "u32", arity: 2, params: "u32, u32" },
  { name: 'Min', ret: "u32", arity: 2, params: "u32, u32" },
  { name: 'GetScore', ret: "u32", arity: 1, params: "u8" },
  { name: 'Task_ShowDodrioBerryPickingRecords', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_TryRunGfxFunc', ret: "void", arity: 1, params: "u8" },
  { name: 'PrintRecordsText', ret: "void", arity: 2, params: "u8, s32" },
  { name: 'SpriteCB_Status', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Dodrio', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'DoDodrioMissedAnim', ret: "u32", arity: 1, params: "struct Sprite *" },
  { name: 'DoDodrioIntroAnim', ret: "u32", arity: 1, params: "struct Sprite *" },
  { name: 'GetDodrioXPos', ret: "s16", arity: 2, params: "u8, u8" },
  { name: 'SetDodrioInvisibility', ret: "void", arity: 2, params: "bool8, u8" },
  { name: 'LoadGfx', ret: "void", arity: 0, params: "void" },
  { name: 'LoadBgGfx', ret: "bool32", arity: 0, params: "void" },
  { name: 'InitBgs', ret: "void", arity: 0, params: "void" },
  { name: 'ShowNames', ret: "void", arity: 0, params: "void" },
  { name: 'ShowResults', ret: "void", arity: 0, params: "void" },
  { name: 'Msg_WantToPlayAgain', ret: "void", arity: 0, params: "void" },
  { name: 'Msg_SavingDontTurnOff', ret: "void", arity: 0, params: "void" },
  { name: 'Msg_CommunicationStandby', ret: "void", arity: 0, params: "void" },
  { name: 'EraseMessage', ret: "void", arity: 0, params: "void" },
  { name: 'Msg_SomeoneDroppedOut', ret: "void", arity: 0, params: "void" },
  { name: 'StopGfxFuncs', ret: "void", arity: 0, params: "void" },
  { name: 'GfxIdle', ret: "void", arity: 0, params: "void" },
  { name: 'StartDodrioBerryPicking', ret: "void", arity: 2, params: "u16 partyId, MainCallback exitCallback" },
  { name: 'Task_DodrioGame_Leader', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_DodrioGame_Member', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'AllLinkBlocksReceived', ret: "bool32", arity: 0, params: "void" },
  { name: 'RecvLinkData_Gameplay', ret: "void", arity: 0, params: "void" },
  { name: 'RecvLinkData_ReadyToEnd', ret: "void", arity: 0, params: "void" },
  { name: 'HandlePickBerries', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateBerrySprites', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateAllDodrioAnims', ret: "void", arity: 0, params: "void" },
  { name: 'SetAllDodrioDisabled', ret: "void", arity: 0, params: "void" },
  { name: 'IsTotalBerriesMissedOver10', ret: "bool32", arity: 1, params: "u16 berryResults[MAX_RFU_PLAYERS][NUM_BERRY_IDS]" },
  { name: 'GetBerriesPicked', ret: "u32", arity: 1, params: "u8 playerId" },
  { name: 'GetPrizeItemId', ret: "u16", arity: 0, params: "void" },
  { name: 'GetNumPlayers', ret: "u8", arity: 0, params: "void" },
  { name: 'GetBerryResult', ret: "u16", arity: 2, params: "u8 playerId, u8 berryId" },
  { name: 'GetHighestBerryResult', ret: "u32", arity: 1, params: "u8 berryId" },
  { name: 'GetScoreByRanking', ret: "u32", arity: 1, params: "u8 ranking" },
  { name: 'SetScoreResults', ret: "u32", arity: 0, params: "void" },
  { name: 'GetScoreResults', ret: "void", arity: 2, params: "struct DodrioGame_ScoreResults *dst, u8 playerId" },
  { name: 'GetScoreRanking', ret: "UNUSED", arity: 1, params: "u8 playerId" },
  { name: 'TryGivePrize', ret: "u8", arity: 0, params: "void" },
  { name: 'GetPlayerIdByPos', ret: "u8", arity: 1, params: "u8 id" },
  { name: 'IsDodrioInParty', ret: "void", arity: 0, params: "void" },
  { name: 'ShowDodrioBerryPickingRecords', ret: "void", arity: 0, params: "void" },
  { name: 'Debug_UpdateNumPlayers', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'Debug_SetPlayerNamesAndResults', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'StartSpriteAnim', ret: "else", arity: 2, params: "&gSprites[sStatusBar->spriteIds[i]], STATUS_YELLOW" },
  { name: 'UnusedSetSpritePos', ret: "UNUSED", arity: 1, params: "u8 spriteId" },
  { name: 'SpriteCB_Cloud', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'LoadWindowFrameGfx', ret: "void", arity: 1, params: "u8 frameId" },
  { name: 'LoadUserWindowFrameGfx', ret: "void", arity: 0, params: "void" },
  { name: 'DrawYesNoMessageWindow', ret: "void", arity: 1, params: "const struct WindowTemplate *template" },
  { name: 'DrawMessageWindow', ret: "void", arity: 1, params: "const struct WindowTemplate *template" },
  { name: 'FreeAllWindowBuffers_', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'PrintRankedScores', ret: "void", arity: 1, params: "u8 numPlayers_" },
  { name: 'AddTextPrinterParameterized', ret: "else", arity: 7, params: "sGfx->windowIds[1], FONT_NORMAL, gStringVar4, sResultsXCoords[j] - width, sResultsYCoords[i], TEXT_SKIP_DRAW, NULL" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_CommunicateMonInfo',
  'Task_DodrioGame_Leader',
  'Task_DodrioGame_Member',
  'Task_NewGameIntro',
  'Task_ShowDodrioBerryPickingRecords',
  'Task_StartDodrioGame',
  'Task_TryRunGfxFunc',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_DodrioGame',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'bg.h',
  'dodrio_berry_picking.h',
  'dynamic_placeholder_text_util.h',
  'event_data.h',
  'gpu_regs.h',
  'international_string_util.h',
  'item.h',
  'link.h',
  'link_rfu.h',
  'm4a.h',
  'palette.h',
  'minigame_countdown.h',
  'random.h',
  'save.h',
  'script.h',
  'sound.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'text_window.h',
  'window.h',
  'constants/items.h',
  'constants/songs.h',
] as const;
