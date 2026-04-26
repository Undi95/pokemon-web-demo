// AUTO-GENERATED from src/pokemon_jump.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokemon_jump.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MAX_JUMP_SCORE = 99990;
export const MAX_JUMPS = 9999;
export const JUMP_PEAK = -30;
export const PLAY_AGAIN_NO = 1;
export const PLAY_AGAIN_YES = 2;
export const TAG_MON1 = 0;
export const TAG_MON2 = 1;
export const TAG_MON3 = 2;
export const TAG_MON4 = 3;
export const TAG_MON5 = 4;
export const GFXTAG_VINE1 = 5;
export const GFXTAG_VINE2 = 6;
export const GFXTAG_VINE3 = 7;
export const GFXTAG_VINE4 = 8;
export const GFXTAG_COUNTDOWN = 9;
export const GFXTAG_STAR = 10;
export const PALTAG_1 = 5;
export const PALTAG_2 = 6;
export const PALTAG_COUNTDOWN = 7;
export const TAG_DIGITS = 800;
export const VINE_SPRITES_PER_SIDE = 4;
export const LINK_INTERVAL_NONE = 0;
export const LINK_INTERVAL_SHORT = 3;
export const LINK_INTERVAL_MEDIUM = 4;
export const LINK_INTERVAL_LONG = 5;
export const LINK_TIMER_STOPPED = 4369;
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tNumReceived_EXPR = "data[1]";
export const DATAIDX_GAME_STRUCT = 14;
/** Raw expr: `(1 << 0)` */
export const F_SE_JUMP_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 1)` */
export const F_SE_FAIL_EXPR = "(1 << 1)";
/** Raw expr: `data[0]` */
export const sState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sTimer_EXPR = "data[1]";
/** Raw expr: `data[7]` */
export const sOffset_EXPR = "data[7]";
/** Raw expr: `data[2]` */
export const sNumShakes_EXPR = "data[2]";
/** Raw expr: `data[1]` */
export const sHopPos_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sNumHops_EXPR = "data[2]";
/** Raw expr: `data[1]` */
export const tWindowId_EXPR = "data[1]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_BG_0 = {
  BG_INTERFACE: 0,
  BG_BONUSES: 1,
  BG_VENUSAUR: 2,
  BG_SCENERY: 3,
} as const;
export const ENUM_WIN_1 = {
  WIN_POINTS: 0,
  WIN_TIMES: 1,
  NUM_WINDOWS: 2,
} as const;
export const ENUM_PACKET_2 = {
  PACKET_MON_INFO: 1,
  PACKET_UNUSED: 2,
  PACKET_LEADER_STATE: 3,
  PACKET_MEMBER_STATE: 4,
} as const;
export const ENUM_JUMP_3 = {
  JUMP_TYPE_NORMAL: 0,
  JUMP_TYPE_FAST: 1,
  JUMP_TYPE_SLOW: 2,
} as const;
export const ENUM_FUNC_4 = {
  FUNC_GAME_INTRO: 0,
  FUNC_WAIT_ROUND: 1,
  FUNC_GAME_ROUND: 2,
  FUNC_GAME_OVER: 3,
  FUNC_ASK_PLAY_AGAIN: 4,
  FUNC_RESET_GAME: 5,
  FUNC_EXIT: 6,
  FUNC_GIVE_PRIZE: 7,
  FUNC_SAVE: 8,
  FUNC_NONE: 9,
} as const;
export const ENUM_GFXFUNC_5 = {
  GFXFUNC_LOAD: 0,
  GFXFUNC_SHOW_NAMES: 1,
  GFXFUNC_SHOW_NAMES_HIGHLIGHT: 2,
  GFXFUNC_ERASE_NAMES: 3,
  GFXFUNC_MSG_PLAY_AGAIN: 4,
  GFXFUNC_MSG_SAVING: 5,
  GFXFUNC_ERASE_MSG: 6,
  GFXFUNC_MSG_PLAYER_DROPPED: 7,
  GFXFUNC_MSG_COMM_STANDBY: 8,
  GFXFUNC_COUNTDOWN: 9,
} as const;
export const ENUM_VINE_6 = {
  VINE_HIGHEST: 0,
  VINE_DOWNSWING_HIGHER: 1,
  VINE_DOWNSWING_HIGH: 2,
  VINE_DOWNSWING_LOW: 3,
  VINE_DOWNSWING_LOWER: 4,
  VINE_LOWEST: 5,
  VINE_UPSWING_LOWER: 6,
  VINE_UPSWING_LOW: 7,
  VINE_UPSWING_HIGH: 8,
  VINE_UPSWING_HIGHER: 9,
  NUM_VINESTATES: 10,
} as const;
export const ENUM_MONSTATE_7 = {
  MONSTATE_NORMAL: 0,
  MONSTATE_JUMP: 1,
  MONSTATE_HIT: 2,
} as const;
export const ENUM_JUMPSTATE_8 = {
  JUMPSTATE_NONE: 0,
  JUMPSTATE_SUCCESS: 1,
  JUMPSTATE_FAILURE: 2,
} as const;
export const ENUM_VENUSAUR_9 = {
  VENUSAUR_NEUTRAL: 0,
  VENUSAUR_DOWN: 1,
  VENUSAUR_UP: 2,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplates = [
  { bg: "BG_INTERFACE", tilemapLeft: 19, tilemapTop: 0, width: 6, height: 2, paletteNum: 2, baseBlock: 19 },
  { bg: "BG_INTERFACE", tilemapLeft: 8, tilemapTop: 0, width: 6, height: 2, paletteNum: 2, baseBlock: 31 },
] as const;
export const sWindowTemplate_Records = { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 28, height: 9, paletteNum: 15, baseBlock: 1 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = [
  { bg: "BG_INTERFACE", charBaseIndex: 0, mapBaseIndex: 27, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: "BG_VENUSAUR", charBaseIndex: 1, mapBaseIndex: 30, screenSize: 2, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: "BG_BONUSES", charBaseIndex: 2, mapBaseIndex: 12, screenSize: 3, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: "BG_SCENERY", charBaseIndex: 3, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_JumpMon = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_Vine16x32 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x32)", tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_Vine32x32 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x32)", tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_Vine32x16 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x16)", tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_Star = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_JumpMon = { tileTag: "TAG_MON1", paletteTag: "TAG_MON1", oam: "&sOamData_JumpMon", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Vine1 = { tileTag: "GFXTAG_VINE1", paletteTag: "PALTAG_1", oam: "&sOamData_Vine16x32", anims: "sAnims_Vine", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Vine2 = { tileTag: "GFXTAG_VINE2", paletteTag: "PALTAG_1", oam: "&sOamData_Vine32x32", anims: "sAnims_VineTall", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Vine3 = { tileTag: "GFXTAG_VINE3", paletteTag: "PALTAG_1", oam: "&sOamData_Vine32x16", anims: "sAnims_Vine", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Vine4 = { tileTag: "GFXTAG_VINE4", paletteTag: "PALTAG_1", oam: "&sOamData_Vine32x16", anims: "sAnims_Vine", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Star = { tileTag: "GFXTAG_STAR", paletteTag: "PALTAG_1", oam: "&sOamData_Star", anims: "sAnims_Star", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sPokeJumpPal1': { path: 'graphics/pokemon_jump/pal1.pal', ext: '.gbapal', type: 'u16' },
  'sPokeJumpPal2': { path: 'graphics/pokemon_jump/pal2.pal', ext: '.gbapal', type: 'u16' },
  'sVine1_Gfx': { path: 'graphics/pokemon_jump/vine1.png', ext: '.4bpp.lz', type: 'u32' },
  'sVine2_Gfx': { path: 'graphics/pokemon_jump/vine2.png', ext: '.4bpp.lz', type: 'u32' },
  'sVine3_Gfx': { path: 'graphics/pokemon_jump/vine3.png', ext: '.4bpp.lz', type: 'u32' },
  'sVine4_Gfx': { path: 'graphics/pokemon_jump/vine4.png', ext: '.4bpp.lz', type: 'u32' },
  'sStar_Gfx': { path: 'graphics/pokemon_jump/star.png', ext: '.4bpp.lz', type: 'u32' },
  'sInterface_Pal': { path: 'graphics/pokemon_jump/interface.pal', ext: '.gbapal', type: 'u16' },
  'sBg_Pal': { path: 'graphics/pokemon_jump/bg.png', ext: '.gbapal', type: 'u16' },
  'sBg_Tilemap': { path: 'graphics/pokemon_jump/bg.bin', ext: '.lz', type: 'u32' },
  'sVenusaur_Pal': { path: 'graphics/pokemon_jump/venusaur.png', ext: '.gbapal', type: 'u16' },
  'sVenusaur_Gfx': { path: 'graphics/pokemon_jump/venusaur.png', ext: '.4bpp.lz', type: 'u32' },
  'sVenusaur_Tilemap': { path: 'graphics/pokemon_jump/venusaur.bin', ext: '.lz', type: 'u32' },
};

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sRecordsTexts = ['gText_JumpsInARow', 'gText_BestScore2', 'gText_ExcellentsInARow'] as const;

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sVineBaseSpeeds: readonly number[] = [26,31,36,41,46,51,56,61] as const;
export const sVineSpeedDelays: readonly number[] = [0,1,1,2] as const;
export const sPlayerNameWindowCoords_2Players: readonly number[] = [6,8,16,8] as const;
export const sPlayerNameWindowCoords_3Players: readonly number[] = [6,8,11,6,16,8] as const;
export const sPlayerNameWindowCoords_4Players: readonly number[] = [2,6,6,8,16,8,20,6] as const;
export const sPlayerNameWindowCoords_5Players: readonly number[] = [2,6,6,8,11,6,16,8,20,6] as const;
export const sMonXCoords_2Players: readonly number[] = [88,152] as const;
export const sMonXCoords_3Players: readonly number[] = [88,120,152] as const;
export const sMonXCoords_4Players: readonly number[] = [56,88,152,184] as const;
export const sMonXCoords_5Players: readonly number[] = [56,88,120,152,184] as const;

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sPokeJumpLeaderFuncs = ['GameIntro_Leader', 'WaitRound_Leader', 'GameRound_Leader', 'GameOver_Leader', 'AskPlayAgain_Leader', 'ResetGame_Leader', 'ExitGame', 'GivePrize_Leader', 'SavePokeJump'] as const;
export const sPokeJumpMemberFuncs = ['GameIntro_Member', 'WaitRound_Member', 'GameRound_Member', 'GameOver_Member', 'AskPlayAgain_Member', 'ResetGame_Member', 'ExitGame', 'GivePrize_Member', 'SavePokeJump'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitGame', ret: "void", arity: 1, params: "struct PokemonJump *" },
  { name: 'ResetForNewGame', ret: "void", arity: 1, params: "struct PokemonJump *" },
  { name: 'InitPlayerAndJumpTypes', ret: "void", arity: 0, params: "void" },
  { name: 'ResetPlayersForNewGame', ret: "void", arity: 0, params: "void" },
  { name: 'GetPokemonJumpSpeciesIdx', ret: "s16", arity: 1, params: "u16 species" },
  { name: 'InitJumpMonInfo', ret: "void", arity: 2, params: "struct PokemonJump_MonInfo *, struct Pokemon *" },
  { name: 'CB2_PokemonJump', ret: "void", arity: 0, params: "void" },
  { name: 'Task_StartPokemonJump', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_PokemonJump_Leader', ret: "void", arity: 1, params: "u8" },
  { name: 'SendLinkData_Leader', ret: "void", arity: 0, params: "void" },
  { name: 'Task_PokemonJump_Member', ret: "void", arity: 1, params: "u8" },
  { name: 'SendLinkData_Member', ret: "void", arity: 0, params: "void" },
  { name: 'GameIntro_Leader', ret: "bool32", arity: 0, params: "void" },
  { name: 'WaitRound_Leader', ret: "bool32", arity: 0, params: "void" },
  { name: 'GameRound_Leader', ret: "bool32", arity: 0, params: "void" },
  { name: 'GameOver_Leader', ret: "bool32", arity: 0, params: "void" },
  { name: 'GameOver_Member', ret: "bool32", arity: 0, params: "void" },
  { name: 'AskPlayAgain_Leader', ret: "bool32", arity: 0, params: "void" },
  { name: 'AskPlayAgain_Member', ret: "bool32", arity: 0, params: "void" },
  { name: 'ResetGame_Leader', ret: "bool32", arity: 0, params: "void" },
  { name: 'ResetGame_Member', ret: "bool32", arity: 0, params: "void" },
  { name: 'ExitGame', ret: "bool32", arity: 0, params: "void" },
  { name: 'GivePrize_Leader', ret: "bool32", arity: 0, params: "void" },
  { name: 'GivePrize_Member', ret: "bool32", arity: 0, params: "void" },
  { name: 'SavePokeJump', ret: "bool32", arity: 0, params: "void" },
  { name: 'DoGameIntro', ret: "bool32", arity: 0, params: "void" },
  { name: 'HandleSwingRound', ret: "bool32", arity: 0, params: "void" },
  { name: 'DoVineHitEffect', ret: "bool32", arity: 0, params: "void" },
  { name: 'GameIntro_Member', ret: "bool32", arity: 0, params: "void" },
  { name: 'WaitRound_Member', ret: "bool32", arity: 0, params: "void" },
  { name: 'GameRound_Member', ret: "bool32", arity: 0, params: "void" },
  { name: 'TryGivePrize', ret: "bool32", arity: 0, params: "void" },
  { name: 'DoPlayAgainPrompt', ret: "bool32", arity: 0, params: "void" },
  { name: 'ClosePokeJumpLink', ret: "bool32", arity: 0, params: "void" },
  { name: 'CloseMessageAndResetScore', ret: "bool32", arity: 0, params: "void" },
  { name: 'Task_CommunicateMonInfo', ret: "void", arity: 1, params: "u8" },
  { name: 'SetTaskWithPokeJumpStruct', ret: "void", arity: 2, params: "TaskFunc, u8" },
  { name: 'InitVineState', ret: "void", arity: 0, params: "void" },
  { name: 'ResetVineState', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateVineState', ret: "void", arity: 0, params: "void" },
  { name: 'GetVineSpeed', ret: "int", arity: 0, params: "void" },
  { name: 'UpdateVineSpeed', ret: "void", arity: 0, params: "void" },
  { name: 'PokeJumpRandom', ret: "int", arity: 0, params: "void" },
  { name: 'ResetVineAfterHit', ret: "void", arity: 0, params: "void" },
  { name: 'ResetPlayersJumpStates', ret: "void", arity: 0, params: "void" },
  { name: 'ResetPlayersMonState', ret: "void", arity: 0, params: "void" },
  { name: 'IsPlayersMonState', ret: "bool32", arity: 1, params: "u16" },
  { name: 'SetMonStateJump', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateGame', ret: "void", arity: 0, params: "void" },
  { name: 'TryUpdateVineSwing', ret: "void", arity: 0, params: "void" },
  { name: 'DisallowVineUpdates', ret: "void", arity: 0, params: "void" },
  { name: 'AllowVineUpdates', ret: "void", arity: 0, params: "void" },
  { name: 'HandleMonState', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateJump', ret: "void", arity: 1, params: "int" },
  { name: 'TryUpdateScore', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateVineHitStates', ret: "bool32", arity: 0, params: "void" },
  { name: 'AllPlayersJumpedOrHit', ret: "bool32", arity: 0, params: "void" },
  { name: 'DidAllPlayersClearVine', ret: "bool32", arity: 0, params: "void" },
  { name: 'ShouldPlayAgain', ret: "bool32", arity: 0, params: "void" },
  { name: 'AddJumpScore', ret: "void", arity: 1, params: "int" },
  { name: 'GetPlayersAtJumpPeak', ret: "int", arity: 0, params: "void" },
  { name: 'AreLinkQueuesEmpty', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetNumPlayersForBonus', ret: "int", arity: 1, params: "u8 *" },
  { name: 'ClearUnreadField', ret: "void", arity: 0, params: "void" },
  { name: 'GetScoreBonus', ret: "int", arity: 1, params: "int" },
  { name: 'TryUpdateExcellentsRecord', ret: "void", arity: 1, params: "u16" },
  { name: 'HasEnoughScoreForPrize', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetPrizeData', ret: "u16", arity: 0, params: "void" },
  { name: 'UnpackPrizeData', ret: "void", arity: 3, params: "u16, u16 *, u16 *" },
  { name: 'GetPrizeItemId', ret: "u16", arity: 0, params: "void" },
  { name: 'GetPrizeQuantity', ret: "u16", arity: 0, params: "void" },
  { name: 'GetQuantityLimitedByBag', ret: "u16", arity: 2, params: "u16, u16" },
  { name: 'SpriteCB_Star', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_MonHitShake', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_MonHitFlash', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_MonIntroBounce', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'UpdateVineSwing', ret: "void", arity: 1, params: "int" },
  { name: 'StartPokeJumpGfx', ret: "void", arity: 1, params: "struct PokemonJumpGfx *" },
  { name: 'InitPokeJumpGfx', ret: "void", arity: 1, params: "struct PokemonJumpGfx *" },
  { name: 'FreeWindowsAndDigitObj', ret: "void", arity: 0, params: "void" },
  { name: 'SetUpPokeJumpGfxFuncById', ret: "void", arity: 1, params: "int" },
  { name: 'IsPokeJumpGfxFuncFinished', ret: "bool32", arity: 0, params: "void" },
  { name: 'SetUpResetVineGfx', ret: "void", arity: 0, params: "void" },
  { name: 'ResetVineGfx', ret: "bool32", arity: 0, params: "void" },
  { name: 'PrintPrizeMessage', ret: "void", arity: 2, params: "u16, u16" },
  { name: 'PrintPrizeFilledBagMessage', ret: "void", arity: 1, params: "u16" },
  { name: 'PrintNoRoomForPrizeMessage', ret: "void", arity: 1, params: "u16" },
  { name: 'DoPrizeMessageAndFanfare', ret: "bool32", arity: 0, params: "void" },
  { name: 'ClearMessageWindow', ret: "void", arity: 0, params: "void" },
  { name: 'SetMonSpriteY', ret: "void", arity: 2, params: "u32, s16" },
  { name: 'StartMonHitShake', ret: "void", arity: 1, params: "u8" },
  { name: 'RemoveMessageWindow', ret: "bool32", arity: 0, params: "void" },
  { name: 'PrintScore', ret: "void", arity: 1, params: "int" },
  { name: 'HandlePlayAgainInput', ret: "s8", arity: 0, params: "void" },
  { name: 'DoSameJumpTimeBonus', ret: "int", arity: 1, params: "u8" },
  { name: 'PrintJumpsInRow', ret: "void", arity: 1, params: "u16" },
  { name: 'StartMonHitFlash', ret: "void", arity: 1, params: "u8" },
  { name: 'IsMonHitShakeActive', ret: "int", arity: 1, params: "int" },
  { name: 'StopMonHitFlash', ret: "void", arity: 0, params: "void" },
  { name: 'ResetMonSpriteSubpriorities', ret: "void", arity: 0, params: "void" },
  { name: 'StartMonIntroBounce', ret: "void", arity: 1, params: "int" },
  { name: 'IsMonIntroBounceActive', ret: "int", arity: 0, params: "void" },
  { name: 'SendPacket_MonInfo', ret: "void", arity: 1, params: "struct PokemonJump_MonInfo *" },
  { name: 'RecvPacket_MonInfo', ret: "bool32", arity: 2, params: "int, struct PokemonJump_MonInfo *" },
  { name: 'SendPacket_LeaderState', ret: "void", arity: 2, params: "struct PokemonJump_Player *, struct PokemonJump_CommData *" },
  { name: 'RecvPacket_LeaderState', ret: "bool32", arity: 2, params: "struct PokemonJump_Player *, struct PokemonJump_CommData *" },
  { name: 'SendPacket_MemberState', ret: "void", arity: 3, params: "struct PokemonJump_Player *, u8, u16" },
  { name: 'RecvPacket_MemberStateToLeader', ret: "bool32", arity: 4, params: "struct PokemonJump_Player *, int, u8 *, u16 *" },
  { name: 'RecvPacket_MemberStateToMember', ret: "bool32", arity: 2, params: "struct PokemonJump_Player *, int" },
  { name: 'TryUpdateRecords', ret: "bool32", arity: 3, params: "u32, u16, u16" },
  { name: 'IncrementGamesWithMaxPlayers', ret: "void", arity: 0, params: "void" },
  { name: 'Task_RunPokeJumpGfxFunc', ret: "void", arity: 1, params: "u8" },
  { name: 'ShowBonus', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_UpdateBonus', ret: "void", arity: 1, params: "u8" },
  { name: 'LoadPokeJumpGfx', ret: "void", arity: 0, params: "void" },
  { name: 'InitDigitPrinters', ret: "void", arity: 0, params: "void" },
  { name: 'PrintScoreSuffixes', ret: "void", arity: 0, params: "void" },
  { name: 'CreateJumpMonSprites', ret: "void", arity: 0, params: "void" },
  { name: 'AddPlayerNameWindows', ret: "void", arity: 0, params: "void" },
  { name: 'DrawPlayerNameWindows', ret: "void", arity: 0, params: "void" },
  { name: 'PrintPokeJumpPlayerNames', ret: "void", arity: 1, params: "bool32" },
  { name: 'AddMessageWindow', ret: "u32", arity: 4, params: "u32, u32, u32, u32" },
  { name: 'CreatePokeJumpYesNoMenu', ret: "void", arity: 3, params: "u16, u16, u8" },
  { name: 'PrintPlayerNamesNoHighlight', ret: "void", arity: 0, params: "void" },
  { name: 'PrintPlayerNamesWithHighlight', ret: "void", arity: 0, params: "void" },
  { name: 'ErasePlayerNames', ret: "void", arity: 0, params: "void" },
  { name: 'Msg_WantToPlayAgain', ret: "void", arity: 0, params: "void" },
  { name: 'Msg_SavingDontTurnOff', ret: "void", arity: 0, params: "void" },
  { name: 'EraseMessage', ret: "void", arity: 0, params: "void" },
  { name: 'Msg_SomeoneDroppedOut', ret: "void", arity: 0, params: "void" },
  { name: 'DoPokeJumpCountdown', ret: "void", arity: 0, params: "void" },
  { name: 'Msg_CommunicationStandby', ret: "void", arity: 0, params: "void" },
  { name: 'Task_ShowPokemonJumpRecords', ret: "void", arity: 1, params: "u8" },
  { name: 'PrintRecordsText', ret: "void", arity: 2, params: "u16, int" },
  { name: 'TruncateToFirstWordOnly', ret: "void", arity: 1, params: "u8 *" },
  { name: 'StartPokemonJump', ret: "void", arity: 2, params: "u16 partyId, MainCallback exitCallback" },
  { name: 'FreePokemonJump', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_PokemonJump', ret: "void", arity: 0, params: "void" },
  { name: 'SetPokeJumpTask', ret: "void", arity: 1, params: "TaskFunc func" },
  { name: 'SetLinkTimeInterval', ret: "void", arity: 1, params: "int intervalId" },
  { name: 'SetFunc_Leader', ret: "void", arity: 1, params: "u8 funcId" },
  { name: 'RecvLinkData_Leader', ret: "void", arity: 0, params: "void" },
  { name: 'SetFunc_Member', ret: "void", arity: 1, params: "u8 funcId" },
  { name: 'RecvLinkData_Member', ret: "void", arity: 0, params: "void" },
  { name: 'IsGameOver', ret: "int", arity: 0, params: "void" },
  { name: 'SetMonStateHit', ret: "void", arity: 0, params: "void" },
  { name: 'SetMonStateNormal', ret: "void", arity: 0, params: "void" },
  { name: 'GetNumPokeJumpPlayers', ret: "u16", arity: 0, params: "void" },
  { name: 'GetPokeJumpMultiplayerId', ret: "u16", arity: 0, params: "void" },
  { name: 'IsSpeciesAllowedInPokemonJump', ret: "bool32", arity: 1, params: "u16 species" },
  { name: 'IsPokemonJumpSpeciesInParty', ret: "void", arity: 0, params: "void" },
  { name: 'LoadSpriteSheetsAndPalettes', ret: "void", arity: 1, params: "struct PokemonJumpGfx *jumpGfx" },
  { name: 'ResetPokeJumpSpriteData', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'CreateJumpMonSprite', ret: "void", arity: 5, params: "struct PokemonJumpGfx *jumpGfx, struct PokemonJump_MonInfo *monInfo, s16 x, s16 y, u8 multiplayerId" },
  { name: 'DoStarAnim', ret: "void", arity: 2, params: "struct PokemonJumpGfx *jumpGfx, int multiplayerId" },
  { name: 'Gfx_StartMonHitShake', ret: "void", arity: 2, params: "struct PokemonJumpGfx *jumpGfx, int multiplayerId" },
  { name: 'Gfx_IsMonHitShakeActive', ret: "bool32", arity: 2, params: "struct PokemonJumpGfx *jumpGfx, int multiplayerId" },
  { name: 'Gfx_StartMonHitFlash', ret: "void", arity: 2, params: "struct PokemonJumpGfx *jumpGfx, int multiplayerId" },
  { name: 'Gfx_StopMonHitFlash', ret: "void", arity: 1, params: "struct PokemonJumpGfx *jumpGfx" },
  { name: 'Gfx_ResetMonSpriteSubpriorities', ret: "void", arity: 1, params: "struct PokemonJumpGfx *jumpGfx" },
  { name: 'Gfx_StartMonIntroBounce', ret: "void", arity: 2, params: "struct PokemonJumpGfx *jumpGfx, int multiplayerId" },
  { name: 'Gfx_IsMonIntroBounceActive', ret: "bool32", arity: 1, params: "struct PokemonJumpGfx *jumpGfx" },
  { name: 'CreateStarSprite', ret: "void", arity: 4, params: "struct PokemonJumpGfx *jumpGfx, s16 x, s16 y, u8 multiplayerId" },
  { name: 'CreateVineSprites', ret: "void", arity: 1, params: "struct PokemonJumpGfx *jumpGfx" },
  { name: 'UpdateVineAnim', ret: "void", arity: 2, params: "struct PokemonJumpGfx *jumpGfx, int vineState" },
  { name: 'StartPokeJumpCountdown', ret: "void", arity: 1, params: "struct PokemonJumpGfx *jumpGfx" },
  { name: 'IsPokeJumpCountdownRunning', ret: "bool32", arity: 0, params: "void" },
  { name: 'PrintPokeJumpPlayerName', ret: "void", arity: 4, params: "int multiplayerId, u8 bgColor, u8 fgColor, u8 shadow" },
  { name: 'UpdateBonus', ret: "bool32", arity: 0, params: "void" },
  { name: 'SendPacket_Unused', ret: "UNUSED", arity: 1, params: "u32 data" },
  { name: 'ResetPokemonJumpRecords', ret: "void", arity: 0, params: "void" },
  { name: 'ShowPokemonJumpRecords', ret: "void", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_CommunicateMonInfo',
  'Task_PokemonJump_Leader',
  'Task_PokemonJump_Member',
  'Task_RunPokeJumpGfxFunc',
  'Task_ShowPokemonJumpRecords',
  'Task_StartPokemonJump',
  'Task_UpdateBonus',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_PokemonJump',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'battle_anim.h',
  'bg.h',
  'data.h',
  'decompress.h',
  'dynamic_placeholder_text_util.h',
  'event_data.h',
  'graphics.h',
  'international_string_util.h',
  'item.h',
  'link.h',
  'link_rfu.h',
  'main.h',
  'menu.h',
  'minigame_countdown.h',
  'palette.h',
  'random.h',
  'digit_obj_util.h',
  'save.h',
  'script.h',
  'sound.h',
  'sprite.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'text_window.h',
  'trig.h',
  'pokemon.h',
  'pokemon_jump.h',
  'constants/rgb.h',
  'constants/songs.h',
  'constants/items.h',
] as const;
