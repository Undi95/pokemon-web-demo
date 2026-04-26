// AUTO-GENERATED from src/battle_records.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_records.c
// Generated: 2026-04-26

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sTrainerHillRecordsWindowTemplates = { bg: 0, tilemapLeft: 2, tilemapTop: 1, width: 26, height: 18, paletteNum: 15, baseBlock: 20 } as const;
export const sLinkBattleRecordsWindow = { bg: 0, tilemapLeft: 2, tilemapTop: 1, width: 26, height: 17, paletteNum: 15, baseBlock: 1 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sTrainerHillRecordsBgTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 3, charBaseIndex: 1, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sTrainerHillWindowTileset': { path: 'graphics/trainer_hill/records_window.png', ext: '.4bpp', type: 'u32' },
  'sTrainerHillWindowPalette': { path: 'graphics/trainer_hill/records_window.png', ext: '.gbapal', type: 'u16' },
};

// ─── INCBIN paths (raw binary includes) ─────────────────────────────────────
export const INCBIN_SOURCES: Record<string, { path: string; type: string }> = {
  'sTrainerHillWindowTilemap': { path: 'graphics/trainer_hill/records_window.bin', type: 'u32' },
};

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'gRecordsWindowId', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_CloseTrainerHillRecordsOnButton', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_BeginPaletteFade', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ExitTrainerHillRecords', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'RemoveTrainerHillRecordsWindow', ret: "void", arity: 1, params: "u8 windowId" },
  { name: 'CB2_ShowTrainerHillRecords', ret: "void", arity: 0, params: "void" },
  { name: 'ClearLinkBattleRecord', ret: "void", arity: 1, params: "struct LinkBattleRecord *record" },
  { name: 'ClearLinkBattleRecords', ret: "void", arity: 1, params: "struct LinkBattleRecord *records" },
  { name: 'GetLinkBattleRecordTotalBattles', ret: "s32", arity: 1, params: "struct LinkBattleRecord *record" },
  { name: 'FindLinkBattleRecord', ret: "s32", arity: 3, params: "struct LinkBattleRecord *records, const u8 *name, u16 trainerId" },
  { name: 'SortLinkBattleRecords', ret: "void", arity: 1, params: "struct LinkBattleRecords *records" },
  { name: 'UpdateLinkBattleRecord', ret: "void", arity: 2, params: "struct LinkBattleRecord *record, s32 battleOutcome" },
  { name: 'UpdateLinkBattleGameStats', ret: "void", arity: 1, params: "s32 battleOutcome" },
  { name: 'UpdateLinkBattleRecords', ret: "void", arity: 5, params: "struct LinkBattleRecords *records, const u8 *name, u16 trainerId, s32 battleOutcome, u8 battler" },
  { name: 'ClearPlayerLinkBattleRecords', ret: "void", arity: 0, params: "void" },
  { name: 'IncTrainerCardWins', ret: "void", arity: 1, params: "s32 battler" },
  { name: 'IncTrainerCardLosses', ret: "void", arity: 1, params: "s32 battler" },
  { name: 'UpdateTrainerCardWinsLosses', ret: "void", arity: 1, params: "s32 battler" },
  { name: 'UpdatePlayerLinkBattleRecords', ret: "void", arity: 1, params: "s32 battler" },
  { name: 'PrintLinkBattleWinsLossesDraws', ret: "void", arity: 1, params: "struct LinkBattleRecord *records" },
  { name: 'PrintLinkBattleRecord', ret: "void", arity: 3, params: "struct LinkBattleRecord *record, u8 y, s32 language" },
  { name: 'ShowLinkBattleRecords', ret: "void", arity: 0, params: "void" },
  { name: 'RemoveRecordsWindow', ret: "void", arity: 0, params: "void" },
  { name: 'Task_TrainerHillWaitForPaletteFade', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ClearVramOamPlttRegs', ret: "void", arity: 0, params: "void" },
  { name: 'ClearTasksAndGraphicalStructs', ret: "void", arity: 0, params: "void" },
  { name: 'ResetBgCoordinates', ret: "void", arity: 0, params: "void" },
  { name: 'SetDispcntReg', ret: "void", arity: 0, params: "void" },
  { name: 'LoadTrainerHillRecordsWindowGfx', ret: "void", arity: 1, params: "u8 bgId" },
  { name: 'VblankCB_TrainerHillRecords', ret: "void", arity: 0, params: "void" },
  { name: 'MainCB2_TrainerHillRecords', ret: "void", arity: 0, params: "void" },
  { name: 'ShowTrainerHillRecords', ret: "void", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_BeginPaletteFade',
  'Task_CloseTrainerHillRecordsOnButton',
  'Task_ExitTrainerHillRecords',
  'Task_TrainerHillWaitForPaletteFade',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_ShowTrainerHillRecords',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle_records.h',
  'bg.h',
  'window.h',
  'link.h',
  'battle.h',
  'overworld.h',
  'text.h',
  'text_window.h',
  'strings.h',
  'string_util.h',
  'trainer_card.h',
  'menu.h',
  'menu_helpers.h',
  'palette.h',
  'main.h',
  'scanline_effect.h',
  'international_string_util.h',
  'sound.h',
  'constants/songs.h',
  'malloc.h',
  'gpu_regs.h',
  'constants/game_stat.h',
  'trainer_hill.h',
  'constants/rgb.h',
] as const;
