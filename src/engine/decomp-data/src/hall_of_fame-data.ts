// AUTO-GENERATED from src/hall_of_fame.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/hall_of_fame.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const HALL_OF_FAME_MAX_TEAMS = 50;
export const TAG_CONFETTI = 1001;
/** Raw expr: `data[0]` */
export const tDontSaveData_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tDisplayedMonId_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tMonNumber_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tFrameCount_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tPlayerSpriteID_EXPR = "data[4]";
/** Raw expr: `data[1]` */
export const tDestinationX_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tDestinationY_EXPR = "data[2]";
/** Raw expr: `data[7]` */
export const tSpecies_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const tCurrTeamNo_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tCurrPageNo_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tCurrMonId_EXPR = "data[2]";
/** Raw expr: `data[4]` */
export const tMonNo_EXPR = "data[4]";
/** Raw expr: `data[0]` */
export const sSineIdx_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sExtraY_EXPR = "data[1]";
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tTimer_EXPR = "data[1]";
/** Raw expr: `data[15]` */
export const tConfettiCount_EXPR = "data[15]";
export const CONFETTI_SINE_IDX = 0;
export const CONFETTI_EXTRA_Y = 1;
export const CONFETTI_TASK_ID = 7;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sHof_WindowTemplate = { bg: 0, tilemapLeft: 2, tilemapTop: 2, width: 14, height: 6, paletteNum: 14, baseBlock: 1 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sHof_BgTemplates = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_Confetti = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(8x8)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_HofConfetti = { tileTag: "TAG_CONFETTI", paletteTag: "TAG_CONFETTI", oam: "&sOamData_Confetti", anims: "sAnims_Confetti", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_HofConfetti" } as const;

// ─── CompressedSpriteSheet ─────────────────────────────────────────────────────────────
export const sSpriteSheet_Confetti = { data: "gConfetti_Gfx", size: 544, tag: "TAG_CONFETTI" } as const;

// ─── CompressedSpritePalette ─────────────────────────────────────────────────────────────
export const sSpritePalette_Confetti = { data: "gConfetti_Pal", tag: "TAG_CONFETTI" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sHallOfFame_Pal': { path: 'graphics/misc/japanese_hof.png', ext: '.gbapal', type: 'u16' },
};

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sHallOfFame_SlotOrder: readonly number[] = [2,1,3,6,4,5] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u32", name: 'sHofFadePalettes', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ClearVramOamPltt_LoadHofPal', ret: "void", arity: 0, params: "void" },
  { name: 'LoadHofGfx', ret: "void", arity: 0, params: "void" },
  { name: 'InitHofBgs', ret: "void", arity: 0, params: "void" },
  { name: 'CreateHofConfettiSprite', ret: "bool8", arity: 0, params: "void" },
  { name: 'StartCredits', ret: "void", arity: 0, params: "void" },
  { name: 'LoadHofBgs', ret: "bool8", arity: 0, params: "void" },
  { name: 'Task_Hof_InitMonData', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Hof_InitTeamSaveData', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Hof_SetMonDisplayTask', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Hof_TrySaveData', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Hof_WaitToDisplayMon', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Hof_DisplayMon', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Hof_PrintMonInfoAfterAnimating', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Hof_TryDisplayAnotherMon', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Hof_PaletteFadeAndPrintWelcomeText', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Hof_DoConfetti', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Hof_WaitToDisplayPlayer', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Hof_DisplayPlayer', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Hof_WaitAndPrintPlayerInfo', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Hof_ExitOnKeyPressed', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Hof_HandlePaletteOnExit', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_Hof_HandleExit', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_HofPC_CopySaveData', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_HofPC_PrintDataIsCorrupted', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_HofPC_DrawSpritesPrintText', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_HofPC_PrintMonInfo', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_HofPC_HandleInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_HofPC_HandlePaletteOnExit', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_HofPC_HandleExit', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_HofPC_ExitOnButtonPress', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SpriteCB_GetOnScreenAndAnimate', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'HallOfFame_PrintMonInfo', ret: "void", arity: 3, params: "struct HallofFameMon *currMon, u8 unused1, u8 unused2" },
  { name: 'HallOfFame_PrintWelcomeText', ret: "void", arity: 2, params: "u8 unusedPossiblyWindowId, u8 unused2" },
  { name: 'HallOfFame_PrintPlayerInfo', ret: "void", arity: 2, params: "u8 unused1, u8 unused2" },
  { name: 'Task_DoDomeConfetti', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SpriteCB_HofConfetti', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'VBlankCB_HallOfFame', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_HallOfFame', ret: "void", arity: 0, params: "void" },
  { name: 'InitHallOfFameScreen', ret: "bool8", arity: 0, params: "void" },
  { name: 'CB2_DoHallOfFameScreen', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_DoHallOfFameScreenDontSaveData', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_DoHallOfFamePC', ret: "void", arity: 0, params: "void" },
  { name: 'HofPCTopBar_PrintPair', ret: "else", arity: 5, params: "gStringVar4, gText_PickNextCancel, FALSE, 0, TRUE" },
  { name: 'DoMonFrontSpriteAnimation', ret: "else", arity: 4, params: "sprite, species, FALSE, 3" },
  { name: 'DoDomeConfetti', ret: "void", arity: 0, params: "void" },
  { name: 'StopDomeConfetti', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateDomeConfetti', ret: "void", arity: 1, params: "struct ConfettiUtil *util" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_DoDomeConfetti',
  'Task_HofPC_CopySaveData',
  'Task_HofPC_DrawSpritesPrintText',
  'Task_HofPC_ExitOnButtonPress',
  'Task_HofPC_HandleExit',
  'Task_HofPC_HandleInput',
  'Task_HofPC_HandlePaletteOnExit',
  'Task_HofPC_PrintDataIsCorrupted',
  'Task_HofPC_PrintMonInfo',
  'Task_Hof_DisplayMon',
  'Task_Hof_DisplayPlayer',
  'Task_Hof_DoConfetti',
  'Task_Hof_ExitOnKeyPressed',
  'Task_Hof_HandleExit',
  'Task_Hof_HandlePaletteOnExit',
  'Task_Hof_InitMonData',
  'Task_Hof_InitTeamSaveData',
  'Task_Hof_PaletteFadeAndPrintWelcomeText',
  'Task_Hof_PrintMonInfoAfterAnimating',
  'Task_Hof_SetMonDisplayTask',
  'Task_Hof_TryDisplayAnotherMon',
  'Task_Hof_TrySaveData',
  'Task_Hof_WaitAndPrintPlayerInfo',
  'Task_Hof_WaitToDisplayMon',
  'Task_Hof_WaitToDisplayPlayer',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_DoHallOfFamePC',
  'CB2_DoHallOfFameScreen',
  'CB2_DoHallOfFameScreenDontSaveData',
  'CB2_HallOfFame',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'hall_of_fame.h',
  'task.h',
  'palette.h',
  'sprite.h',
  'pokemon.h',
  'text.h',
  'text_window.h',
  'malloc.h',
  'gpu_regs.h',
  'graphics.h',
  'main.h',
  'sound.h',
  'constants/songs.h',
  'decompress.h',
  'save.h',
  'strings.h',
  'window.h',
  'credits.h',
  'bg.h',
  'constants/game_stat.h',
  'util.h',
  'string_util.h',
  'm4a.h',
  'international_string_util.h',
  'scanline_effect.h',
  'trig.h',
  'random.h',
  'event_data.h',
  'overworld.h',
  'menu.h',
  'fldeff_misc.h',
  'trainer_pokemon_sprites.h',
  'data.h',
  'confetti_util.h',
  'constants/rgb.h',
] as const;
