// AUTO-GENERATED from src/berry_blender.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/berry_blender.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `MAX_LINK_PLAYERS` */
export const BLENDER_MAX_PLAYERS_EXPR = "MAX_LINK_PLAYERS";
export const NO_PLAYER = 255;
export const MAX_PROGRESS_BAR = 1000;
export const MAX_ARROW_POS = 65536;
export const MIN_ARROW_SPEED = 128;
export const ARROW_FALL_ROTATION = 22528;
export const PROGRESS_BAR_FILLED_TOP = 33001;
export const PROGRESS_BAR_FILLED_BOTTOM = 33017;
export const PROGRESS_BAR_EMPTY_TOP = 32993;
export const PROGRESS_BAR_EMPTY_BOTTOM = 33009;
export const RPM_DIGIT = 32882;
export const GFXTAG_COUNTDOWN_NUMBERS = 12345;
export const GFXTAG_START = 12346;
export const GFXTAG_PARTICLES = 23456;
export const GFXTAG_PLAYER_ARROW = 46545;
export const GFXTAG_SCORE_SYMBOLS = 48888;
export const PALTAG_PLAYER_ARROW = 12312;
export const PALTAG_MISC = 46546;
/** Raw expr: `ITEM_TO_BERRY(ITEM_ASPEAR_BERRY)` */
export const NUM_NPC_BERRIES_EXPR = "ITEM_TO_BERRY(ITEM_ASPEAR_BERRY)";
/** Raw expr: `data[0]` */
export const sTargetY_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sX_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sY_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sBounceSpeed_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sYUpSpeed_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sBounces_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const sXSpeed_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const sYDownSpeed_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const tTimer_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tDelay_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tPlayerId_EXPR = "data[2]";
/** Raw expr: `data[0]` */
export const tDidInput_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const sState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sYPos_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sDelay_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sAnimId_EXPR = "data[3]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_SCORE_0 = {
  SCORE_BEST: 0,
  SCORE_GOOD: 1,
  SCORE_MISS: 2,
  NUM_SCORE_TYPES: 3,
} as const;
export const ENUM_PROXIMITY_1 = {
  PROXIMITY_MISS: 0,
  PROXIMITY_GOOD: 1,
  PROXIMITY_BEST: 2,
} as const;
export const ENUM_SCOREANIM_2 = {
  SCOREANIM_GOOD: 0,
  SCOREANIM_MISS: 1,
  SCOREANIM_BEST_FLASH: 2,
  SCOREANIM_BEST_STATIC: 3,
} as const;
export const ENUM_PLAY_3 = {
  PLAY_AGAIN_YES: 0,
  PLAY_AGAIN_NO: 1,
  CANT_PLAY_NO_BERRIES: 2,
  CANT_PLAY_NO_PKBLCK_SPACE: 3,
} as const;
export const ENUM_BLENDER_4 = {
  BLENDER_MISTER: 0,
  BLENDER_LADDIE: 1,
  BLENDER_LASSIE: 2,
  BLENDER_MASTER: 3,
  BLENDER_DUDE: 4,
  BLENDER_MISS: 5,
} as const;
export const ENUM_WIN_5 = {
  WIN_MSG: 0,
  WIN_RESULTS: 1,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplates = [
  { bg: 0, tilemapLeft: 1, tilemapTop: 6, width: 7, height: 2, paletteNum: 14, baseBlock: 40 },
  { bg: 0, tilemapLeft: 22, tilemapTop: 6, width: 7, height: 2, paletteNum: 14, baseBlock: 54 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 12, width: 7, height: 2, paletteNum: 14, baseBlock: 68 },
  { bg: 0, tilemapLeft: 22, tilemapTop: 12, width: 7, height: 2, paletteNum: 14, baseBlock: 82 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4, paletteNum: 14, baseBlock: 96 },
  { bg: 0, tilemapLeft: 5, tilemapTop: 3, width: 21, height: 14, paletteNum: 14, baseBlock: 96 },
] as const;
export const sYesNoWindowTemplate_ContinuePlaying = { bg: 0, tilemapLeft: 21, tilemapTop: 9, width: 5, height: 4, paletteNum: 14, baseBlock: 204 } as const;
export const winTemplate = { bg: 0, tilemapLeft: 6, tilemapTop: 4, width: 18, height: 11, paletteNum: 15, baseBlock: 8 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = [
  { bg: 0, charBaseIndex: 3, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 2, mapBaseIndex: 12, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 8, screenSize: 1, paletteMode: 1, priority: 0, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOam_PlayerArrow = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x32)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sOam_ScoreSymbols = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOam_Particles = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(8x8)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sOam_CountdownNumbers = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x32)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sOam_Start = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x32)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_PlayerArrow = { tileTag: "GFXTAG_PLAYER_ARROW", paletteTag: "PALTAG_PLAYER_ARROW", oam: "&sOam_PlayerArrow", anims: "sAnims_PlayerArrow", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_PlayerArrow" } as const;
export const sSpriteTemplate_ScoreSymbols = { tileTag: "GFXTAG_SCORE_SYMBOLS", paletteTag: "PALTAG_MISC", oam: "&sOam_ScoreSymbols", anims: "sAnims_ScoreSymbols", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_ScoreSymbol" } as const;
export const sSpriteTemplate_Particles = { tileTag: "GFXTAG_PARTICLES", paletteTag: "PALTAG_MISC", oam: "&sOam_Particles", anims: "sAnims_Particles", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_CountdownNumbers = { tileTag: "GFXTAG_COUNTDOWN_NUMBERS", paletteTag: "PALTAG_MISC", oam: "&sOam_CountdownNumbers", anims: "sAnims_CountdownNumbers", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_CountdownNumber" } as const;
export const sSpriteTemplate_Start = { tileTag: "GFXTAG_START", paletteTag: "PALTAG_MISC", oam: "&sOam_Start", anims: "sAnims_Start", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Start" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sBlenderOuter_Pal': { path: 'graphics/berry_blender/outer.png', ext: '.gbapal', type: 'u16' },
  'sUnused_Pal': { path: 'graphics/berry_blender/unused.pal', ext: '.gbapal', type: 'u16' },
};

// ─── INCBIN paths (raw binary includes) ─────────────────────────────────────
export const INCBIN_SOURCES: Record<string, { path: string; type: string }> = {
  'sBlenderCenter_Tilemap': { path: 'graphics/berry_blender/center_map.bin', type: 'u8' },
};

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sBlenderOpponentsNames = ['sText_Mister', 'sText_Laddie', 'sText_Lassie', 'sText_Master', 'sText_Dude', 'sText_Miss'] as const;

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sNumPlayersToSpeedDivisor: readonly number[] = [1,1,2,3,4] as const;
export const sUnused: readonly number[] = [254,2,2,206,208,55,68,7,31,12,16,0,255,254,145,114,206,208,55,68,7,31,12,16,0,255,6,39,2,255,0,12,72,2,255,0,1,31,2,255,0,22,55,2,255,0,13,80,75,2,255,6,6,6,6,5,3,3,3,2,2] as const;
export const sUnused2: readonly number[] = [3,3,3,3,2] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "s32", name: 'sDebug_PokeblockFactorFlavors', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "s32", name: 'sDebug_PokeblockFactorFlavorsAfterRPM', isArray: true, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u32", name: 'sDebug_PokeblockFactorRPM', isArray: false, init: "0" },
  { segment: 'COMMON_DATA', type: "u8", name: 'gInGameOpponentsNo', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SetBgPos', ret: "void", arity: 0, params: "void" },
  { name: 'Task_HandleOpponent1', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleOpponent2', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleOpponent3', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleBerryMaster', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_PlayPokeblockFanfare', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_PlayerArrow', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ScoreSymbol', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_CountdownNumber', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_Start', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ScoreSymbolBest', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'InitLocalPlayers', ret: "void", arity: 1, params: "u8" },
  { name: 'CB2_LoadBerryBlender', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateBlenderCenter', ret: "void", arity: 0, params: "void" },
  { name: 'PrintMessage', ret: "bool32", arity: 3, params: "s16 *, const u8 *, s32" },
  { name: 'StartBlender', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_StartBlenderLink', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_StartBlenderLocal', ret: "void", arity: 0, params: "void" },
  { name: 'Blender_DummiedOutFunc', ret: "void", arity: 2, params: "s16, s16" },
  { name: 'CB2_PlayBlender', ret: "void", arity: 0, params: "void" },
  { name: 'DrawBlenderCenter', ret: "void", arity: 1, params: "struct BgAffineSrcData *" },
  { name: 'UpdateBlenderLandScreenShake', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetPlayerIdMaps', ret: "void", arity: 0, params: "void" },
  { name: 'PrintPlayerNames', ret: "void", arity: 0, params: "void" },
  { name: 'InitBlenderBgs', ret: "void", arity: 0, params: "void" },
  { name: 'SetPlayerBerryData', ret: "void", arity: 2, params: "u8, u16" },
  { name: 'Blender_AddTextPrinter', ret: "void", arity: 6, params: "u8, const u8 *, u8, u8, s32, s32" },
  { name: 'ResetLinkCmds', ret: "void", arity: 0, params: "void" },
  { name: 'CreateParticleSprites', ret: "void", arity: 0, params: "void" },
  { name: 'ShakeBgCoordForHit', ret: "void", arity: 2, params: "s16 *, u16" },
  { name: 'TryUpdateProgressBar', ret: "void", arity: 2, params: "u16, u16" },
  { name: 'UpdateRPM', ret: "void", arity: 1, params: "u16" },
  { name: 'RestoreBgCoords', ret: "void", arity: 0, params: "void" },
  { name: 'ProcessLinkPlayerCmds', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_EndBlenderGame', ret: "void", arity: 0, params: "void" },
  { name: 'PrintBlendingRanking', ret: "bool8", arity: 0, params: "void" },
  { name: 'PrintBlendingResults', ret: "bool8", arity: 0, params: "void" },
  { name: 'CB2_CheckPlayAgainLocal', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_CheckPlayAgainLink', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateProgressBar', ret: "void", arity: 2, params: "u16, u16" },
  { name: 'PrintMadePokeblockString', ret: "void", arity: 2, params: "struct Pokeblock *, u8 *" },
  { name: 'TryAddContestLinkTvShow', ret: "bool32", arity: 2, params: "struct Pokeblock *, struct TvBlenderStruct *" },
  { name: 'UpdateHitPitch', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_BerryBlender', ret: "void", arity: 0, params: "void" },
  { name: 'LoadBerryBlenderGfx', ret: "bool8", arity: 0, params: "void" },
  { name: 'DrawBlenderBg', ret: "void", arity: 0, params: "void" },
  { name: 'InitBerryBlenderWindows', ret: "void", arity: 0, params: "void" },
  { name: 'DoBerryBlending', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_Berry', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'PlaySE', ret: "else", arity: 1, params: "SE_BALL_TRAY_EXIT" },
  { name: 'SetBerrySpriteData', ret: "void", arity: 6, params: "struct Sprite *sprite, s16 x, s16 y, s16 bounceSpeed, s16 xSpeed, s16 ySpeed" },
  { name: 'CreateBerrySprite', ret: "void", arity: 2, params: "u16 itemId, u8 playerId" },
  { name: 'ConvertItemToBlenderBerry', ret: "void", arity: 2, params: "struct BlenderBerry *berry, u16 itemId" },
  { name: 'StringCopy', ret: "else", arity: 2, params: "gLinkPlayers[1].name, sBlenderOpponentsNames[BLENDER_MISTER]" },
  { name: 'SetMainCallback2', ret: "else", arity: 1, params: "CB2_StartBlenderLocal" },
  { name: 'GetArrowProximity', ret: "u8", arity: 2, params: "u16 arrowPos, u8 playerId" },
  { name: 'SetOpponentsBerryData', ret: "void", arity: 3, params: "u16 playerBerryItemId, u8 playersNum, struct BlenderBerry *playerBerry" },
  { name: 'Task_OpponentMiss', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CreateOpponentMissTask', ret: "void", arity: 2, params: "u8 playerId, u8 delay" },
  { name: 'CreateScoreSymbolSprite', ret: "void", arity: 2, params: "u16 cmd, u8 arrowId" },
  { name: 'UpdateSpeedFromHit', ret: "void", arity: 1, params: "u16 cmd" },
  { name: 'CheckRecvCmdMatches', ret: "bool32", arity: 3, params: "u16 recvCmd, u16 linkCmd, u16 rfuCmd" },
  { name: 'UpdateOpponentScores', ret: "void", arity: 0, params: "void" },
  { name: 'm4aMPlayTempoControl', ret: "else", arity: 2, params: "&gMPlayInfo_BGM, 256" },
  { name: 'HandlePlayerInput', ret: "void", arity: 0, params: "void" },
  { name: 'AreBlenderBerriesSame', ret: "bool8", arity: 3, params: "struct BlenderBerry *berries, u8 a, u8 b" },
  { name: 'CalculatePokeblockColor', ret: "u32", arity: 4, params: "struct BlenderBerry *berries, s16 *_flavors, u8 numPlayers, u8 negativeFlavors" },
  { name: 'Debug_SetMaxRPMStage', ret: "void", arity: 1, params: "s16 value" },
  { name: 'Debug_GetMaxRPMStage', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'Debug_SetGameTimeStage', ret: "void", arity: 1, params: "s16 value" },
  { name: 'Debug_GetGameTimeStage', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'CalculatePokeblock', ret: "void", arity: 5, params: "struct BlenderBerry *berries, struct Pokeblock *pokeblock, u8 numPlayers, u8 *flavors, u16 maxRPM" },
  { name: 'Debug_CalculatePokeblock', ret: "UNUSED", arity: 5, params: "struct BlenderBerry *berries, struct Pokeblock *pokeblock, u8 numPlayers, u8 *flavors, u16 maxRPM" },
  { name: 'Debug_SetStageVars', ret: "void", arity: 0, params: "void" },
  { name: 'SendContinuePromptResponse', ret: "void", arity: 1, params: "u16 *cmd" },
  { name: 'IncrementGameStat', ret: "else", arity: 1, params: "GAME_STAT_POKEBLOCKS" },
  { name: 'LinkPlayAgainHandleSaving', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetBlenderArrowPosition', ret: "u16", arity: 0, params: "void" },
  { name: 'SpriteCB_Particle', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'ArrowSpeedToRPM', ret: "u32", arity: 1, params: "u16 speed" },
  { name: 'RestoreBgCoord', ret: "void", arity: 1, params: "s16 *coord" },
  { name: 'BlenderLandShakeBgCoord', ret: "void", arity: 2, params: "s16 *coord, u16 timer" },
  { name: 'TryUpdateBerryBlenderRecord', ret: "void", arity: 0, params: "void" },
  { name: 'SortBasedOnPoints', ret: "void", arity: 3, params: "u8 *places, u8 playersNum, u32 *scores" },
  { name: 'SortScores', ret: "void", arity: 0, params: "void" },
  { name: 'ShowBerryBlenderRecordWindow', ret: "void", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_HandleBerryMaster',
  'Task_HandleOpponent1',
  'Task_HandleOpponent2',
  'Task_HandleOpponent3',
  'Task_OpponentMiss',
  'Task_PlayPokeblockFanfare',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_CheckPlayAgainLink',
  'CB2_CheckPlayAgainLocal',
  'CB2_EndBlenderGame',
  'CB2_LoadBerryBlender',
  'CB2_PlayBlender',
  'CB2_StartBlenderLink',
  'CB2_StartBlenderLocal',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'overworld.h',
  'berry_blender.h',
  'bg.h',
  'window.h',
  'task.h',
  'sprite.h',
  'sound.h',
  'm4a.h',
  'bg.h',
  'palette.h',
  'decompress.h',
  'malloc.h',
  'gpu_regs.h',
  'text.h',
  'text_window.h',
  'event_data.h',
  'main.h',
  'link.h',
  'link_rfu.h',
  'item_menu_icons.h',
  'berry.h',
  'item.h',
  'string_util.h',
  'international_string_util.h',
  'random.h',
  'menu.h',
  'pokeblock.h',
  'trig.h',
  'tv.h',
  'item_menu.h',
  'battle_records.h',
  'graphics.h',
  'new_game.h',
  'save.h',
  'strings.h',
  'constants/game_stat.h',
  'constants/items.h',
  'constants/rgb.h',
  'constants/songs.h',
] as const;
