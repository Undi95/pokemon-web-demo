// AUTO-GENERATED from src/trainer_card.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/trainer_card.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const STATE_HANDLE_INPUT_FRONT = 10;
export const STATE_HANDLE_INPUT_BACK = 11;
export const STATE_WAIT_FLIP_TO_BACK = 12;
export const STATE_WAIT_FLIP_TO_FRONT = 13;
export const STATE_CLOSE_CARD = 14;
export const STATE_WAIT_LINK_PARTNER = 15;
export const STATE_CLOSE_CARD_LINK = 16;
/** Raw expr: `data[0]` */
export const tFlipState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tCardTop_EXPR = "data[1]";
/** Raw expr: `((DISPLAY_HEIGHT / 2) - 3)` */
export const CARD_FLIP_Y_EXPR = "((DISPLAY_HEIGHT / 2) - 3)";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_WIN_0 = {
  WIN_MSG: 0,
  WIN_CARD_TEXT: 1,
  WIN_TRAINER_PIC: 2,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sTrainerCardWindowTemplates = [
  { bg: 1, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4, paletteNum: 15, baseBlock: 595 },
  { bg: 1, tilemapLeft: 1, tilemapTop: 1, width: 28, height: 18, paletteNum: 15, baseBlock: 1 },
  { bg: 3, tilemapLeft: 19, tilemapTop: 5, width: 9, height: 10, paletteNum: 8, baseBlock: 336 },
] as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sTrainerCardBgTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 27, screenSize: 2, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 1, charBaseIndex: 2, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 192 },
] as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sTrainerCardStickers_Gfx': { path: 'graphics/trainer_card/frlg/stickers.png', ext: '.4bpp.lz', type: 'u32' },
  'sUnused_Pal': { path: 'graphics/trainer_card/unused.pal', ext: '.gbapal', type: 'u16' },
  'sHoennTrainerCardBronze_Pal': { path: 'graphics/trainer_card/bronze.pal', ext: '.gbapal', type: 'u16' },
  'sKantoTrainerCardGreen_Pal': { path: 'graphics/trainer_card/frlg/green.pal', ext: '.gbapal', type: 'u16' },
  'sHoennTrainerCardCopper_Pal': { path: 'graphics/trainer_card/copper.pal', ext: '.gbapal', type: 'u16' },
  'sKantoTrainerCardBronze_Pal': { path: 'graphics/trainer_card/frlg/bronze.pal', ext: '.gbapal', type: 'u16' },
  'sHoennTrainerCardSilver_Pal': { path: 'graphics/trainer_card/silver.pal', ext: '.gbapal', type: 'u16' },
  'sKantoTrainerCardSilver_Pal': { path: 'graphics/trainer_card/frlg/silver.pal', ext: '.gbapal', type: 'u16' },
  'sHoennTrainerCardGold_Pal': { path: 'graphics/trainer_card/gold.pal', ext: '.gbapal', type: 'u16' },
  'sKantoTrainerCardGold_Pal': { path: 'graphics/trainer_card/frlg/gold.pal', ext: '.gbapal', type: 'u16' },
  'sHoennTrainerCardFemaleBg_Pal': { path: 'graphics/trainer_card/female_bg.pal', ext: '.gbapal', type: 'u16' },
  'sKantoTrainerCardFemaleBg_Pal': { path: 'graphics/trainer_card/frlg/female_bg.pal', ext: '.gbapal', type: 'u16' },
  'sHoennTrainerCardBadges_Pal': { path: 'graphics/trainer_card/badges.png', ext: '.gbapal', type: 'u16' },
  'sKantoTrainerCardBadges_Pal': { path: 'graphics/trainer_card/frlg/badges.png', ext: '.gbapal', type: 'u16' },
  'sTrainerCardStar_Pal': { path: 'graphics/trainer_card/star.pal', ext: '.gbapal', type: 'u16' },
  'sTrainerCardSticker1_Pal': { path: 'graphics/trainer_card/frlg/stickers1.pal', ext: '.gbapal', type: 'u16' },
  'sTrainerCardSticker2_Pal': { path: 'graphics/trainer_card/frlg/stickers2.pal', ext: '.gbapal', type: 'u16' },
  'sTrainerCardSticker3_Pal': { path: 'graphics/trainer_card/frlg/stickers3.pal', ext: '.gbapal', type: 'u16' },
  'sTrainerCardSticker4_Pal': { path: 'graphics/trainer_card/frlg/stickers4.pal', ext: '.gbapal', type: 'u16' },
  'sHoennTrainerCardBadges_Gfx': { path: 'graphics/trainer_card/badges.png', ext: '.4bpp.lz', type: 'u32' },
  'sKantoTrainerCardBadges_Gfx': { path: 'graphics/trainer_card/frlg/badges.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sLinkBattleTexts = ['gText_LinkBattles', 'gText_LinkCableBattles', 'gText_LinkBattles'] as const;

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const yOffsetsLine1: readonly number[] = [113,104] as const;
export const yOffsetsLine2: readonly number[] = [129,120] as const;
export const xOffsets: readonly number[] = [8,16] as const;
export const widths: readonly number[] = [216,216] as const;
export const yOffsets: readonly number[] = [7,7] as const;

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sTrainerCardFlipTasks = ['Task_BeginCardFlip', 'Task_AnimateCardFlipDown', 'Task_DrawFlippedCardSide', 'Task_SetCardFlipped', 'Task_AnimateCardFlipUp', 'Task_EndCardFlip'] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "struct TrainerCard", name: 'gTrainerCards', isArray: true, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'VblankCb_TrainerCard', ret: "void", arity: 0, params: "void" },
  { name: 'HblankCb_TrainerCard', ret: "void", arity: 0, params: "void" },
  { name: 'BlinkTimeColon', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_TrainerCard', ret: "void", arity: 0, params: "void" },
  { name: 'CloseTrainerCard', ret: "void", arity: 1, params: "u8 task" },
  { name: 'PrintAllOnCardFront', ret: "bool8", arity: 0, params: "void" },
  { name: 'DrawTrainerCardWindow', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateTrainerCardTrainerPic', ret: "void", arity: 0, params: "void" },
  { name: 'DrawCardScreenBackground', ret: "void", arity: 1, params: "u16 *" },
  { name: 'DrawCardFrontOrBack', ret: "void", arity: 1, params: "u16 *" },
  { name: 'DrawStarsAndBadgesOnCard', ret: "void", arity: 0, params: "void" },
  { name: 'PrintTimeOnCard', ret: "void", arity: 0, params: "void" },
  { name: 'FlipTrainerCard', ret: "void", arity: 0, params: "void" },
  { name: 'IsCardFlipTaskActive', ret: "bool8", arity: 0, params: "void" },
  { name: 'LoadCardGfx', ret: "bool8", arity: 0, params: "void" },
  { name: 'CB2_InitTrainerCard', ret: "void", arity: 0, params: "void" },
  { name: 'GetCappedGameStat', ret: "u32", arity: 2, params: "u8 statId, u32 maxValue" },
  { name: 'HasAllFrontierSymbols', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetRubyTrainerStars', ret: "u8", arity: 1, params: "struct TrainerCard *" },
  { name: 'GetCaughtMonsCount', ret: "u16", arity: 0, params: "void" },
  { name: 'SetPlayerCardData', ret: "void", arity: 2, params: "struct TrainerCard *, u8" },
  { name: 'TrainerCard_GenerateCardForPlayer', ret: "void", arity: 1, params: "struct TrainerCard *" },
  { name: 'VersionToCardType', ret: "u8", arity: 1, params: "u8" },
  { name: 'SetDataFromTrainerCard', ret: "void", arity: 0, params: "void" },
  { name: 'InitGpuRegs', ret: "void", arity: 0, params: "void" },
  { name: 'ResetGpuRegs', ret: "void", arity: 0, params: "void" },
  { name: 'InitBgsAndWindows', ret: "void", arity: 0, params: "void" },
  { name: 'SetTrainerCardCb2', ret: "void", arity: 0, params: "void" },
  { name: 'SetUpTrainerCardTask', ret: "void", arity: 0, params: "void" },
  { name: 'InitTrainerCardData', ret: "void", arity: 0, params: "void" },
  { name: 'GetSetCardType', ret: "u8", arity: 0, params: "void" },
  { name: 'PrintNameOnCardFront', ret: "void", arity: 0, params: "void" },
  { name: 'PrintIdOnCard', ret: "void", arity: 0, params: "void" },
  { name: 'PrintMoneyOnCard', ret: "void", arity: 0, params: "void" },
  { name: 'PrintPokedexOnCard', ret: "void", arity: 0, params: "void" },
  { name: 'PrintProfilePhraseOnCard', ret: "void", arity: 0, params: "void" },
  { name: 'PrintAllOnCardBack', ret: "bool8", arity: 0, params: "void" },
  { name: 'PrintNameOnCardBack', ret: "void", arity: 0, params: "void" },
  { name: 'PrintHofDebutTimeOnCard', ret: "void", arity: 0, params: "void" },
  { name: 'PrintLinkBattleResultsOnCard', ret: "void", arity: 0, params: "void" },
  { name: 'PrintTradesStringOnCard', ret: "void", arity: 0, params: "void" },
  { name: 'PrintBerryCrushStringOnCard', ret: "void", arity: 0, params: "void" },
  { name: 'PrintPokeblockStringOnCard', ret: "void", arity: 0, params: "void" },
  { name: 'PrintUnionStringOnCard', ret: "void", arity: 0, params: "void" },
  { name: 'PrintContestStringOnCard', ret: "void", arity: 0, params: "void" },
  { name: 'PrintPokemonIconsOnCard', ret: "void", arity: 0, params: "void" },
  { name: 'PrintBattleFacilityStringOnCard', ret: "void", arity: 0, params: "void" },
  { name: 'PrintStickersOnCard', ret: "void", arity: 0, params: "void" },
  { name: 'BufferTextsVarsForCardPage2', ret: "void", arity: 0, params: "void" },
  { name: 'BufferNameForCardBack', ret: "void", arity: 0, params: "void" },
  { name: 'BufferHofDebutTime', ret: "void", arity: 0, params: "void" },
  { name: 'BufferLinkBattleResults', ret: "void", arity: 0, params: "void" },
  { name: 'BufferNumTrades', ret: "void", arity: 0, params: "void" },
  { name: 'BufferBerryCrushPoints', ret: "void", arity: 0, params: "void" },
  { name: 'BufferUnionRoomStats', ret: "void", arity: 0, params: "void" },
  { name: 'BufferLinkPokeblocksNum', ret: "void", arity: 0, params: "void" },
  { name: 'BufferLinkContestNum', ret: "void", arity: 0, params: "void" },
  { name: 'BufferBattleFacilityStats', ret: "void", arity: 0, params: "void" },
  { name: 'PrintStatOnBackOfCard', ret: "void", arity: 4, params: "u8 top, const u8 *str1, u8 *str2, const u8 *color" },
  { name: 'LoadStickerGfx', ret: "void", arity: 0, params: "void" },
  { name: 'SetCardBgsAndPals', ret: "u8", arity: 0, params: "void" },
  { name: 'DrawCardBackStats', ret: "void", arity: 0, params: "void" },
  { name: 'Task_DoCardFlipTask', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_BeginCardFlip', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'Task_AnimateCardFlipDown', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'Task_DrawFlippedCardSide', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'Task_SetCardFlipped', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'Task_AnimateCardFlipUp', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'Task_EndCardFlip', ret: "bool8", arity: 1, params: "struct Task *task" },
  { name: 'UpdateCardFlipRegs', ret: "void", arity: 1, params: "u16" },
  { name: 'LoadMonIconGfx', ret: "void", arity: 0, params: "void" },
  { name: 'Task_TrainerCard', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'LZ77UnCompWram', ret: "else", arity: 2, params: "gKantoTrainerCardBg_Tilemap, sData->bgTilemap" },
  { name: 'CountPlayerTrainerStars', ret: "u32", arity: 0, params: "void" },
  { name: 'TrainerCard_GenerateCardForLinkPlayer', ret: "void", arity: 1, params: "struct TrainerCard *trainerCard" },
  { name: 'CopyTrainerCardData', ret: "void", arity: 3, params: "struct TrainerCard *dst, struct TrainerCard *src, u8 gameVersion" },
  { name: 'EnableInterrupts', ret: "else", arity: 1, params: "INTR_FLAG_VBLANK | INTR_FLAG_HBLANK" },
  { name: 'AddTextPrinterParameterized3', ret: "else", arity: 7, params: "WIN_CARD_TEXT, FONT_NORMAL, 16, 33, sTrainerCardTextColors, TEXT_SKIP_DRAW, buffer" },
  { name: 'GetTrainerCardStars', ret: "u8", arity: 1, params: "u8 cardId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_DoCardFlipTask',
  'Task_TrainerCard',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_InitTrainerCard',
  'CB2_TrainerCard',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'scanline_effect.h',
  'palette.h',
  'task.h',
  'main.h',
  'window.h',
  'malloc.h',
  'link.h',
  'bg.h',
  'sound.h',
  'frontier_pass.h',
  'overworld.h',
  'menu.h',
  'text.h',
  'event_data.h',
  'easy_chat.h',
  'money.h',
  'strings.h',
  'string_util.h',
  'trainer_card.h',
  'gpu_regs.h',
  'international_string_util.h',
  'pokedex.h',
  'pokemon_icon.h',
  'graphics.h',
  'pokemon_icon.h',
  'trainer_pokemon_sprites.h',
  'contest_util.h',
  'constants/songs.h',
  'constants/game_stat.h',
  'constants/battle_frontier.h',
  'constants/rgb.h',
  'constants/trainers.h',
  'constants/union_room.h',
] as const;
