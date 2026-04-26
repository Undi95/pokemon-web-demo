// AUTO-GENERATED from src/mauville_old_man.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/mauville_old_man.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tWordState_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tDelay_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tCharIndex_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tLyricsIndex_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tUseNewSongLyrics_EXPR = "data[5]";
export const BARD_SONG_BASE_VOLUME = 256;
export const BARD_SONG_BASE_PITCH = 512;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_BARD_0 = {
  BARD_STATE_INIT: 0,
  BARD_STATE_WAIT_BGM: 1,
  BARD_STATE_GET_WORD: 2,
  BARD_STATE_HANDLE_WORD: 3,
  BARD_STATE_WAIT_WORD: 4,
  BARD_STATE_PAUSE: 5,
} as const;
export const ENUM_SOUND_1 = {
  SOUND_STATE_START: 0,
  SOUND_STATE_PLAY: 1,
  SOUND_STATE_SET_BASE: 2,
  SOUND_STATE_END: 3,
  SOUND_STATE_WAIT: 4,
} as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'COMMON_DATA', type: "struct BardSong", name: 'gBardSong', isArray: false, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sUnusedPitchTableIndex', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sStorytellerWindowId', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitGiddyTaleList', ret: "void", arity: 0, params: "void" },
  { name: 'StartBardSong', ret: "void", arity: 1, params: "bool8 useNewSongLyrics" },
  { name: 'Task_BardSong', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'StorytellerSetup', ret: "void", arity: 0, params: "void" },
  { name: 'Storyteller_ResetFlag', ret: "void", arity: 0, params: "void" },
  { name: 'SetupBard', ret: "void", arity: 0, params: "void" },
  { name: 'SetupHipster', ret: "void", arity: 0, params: "void" },
  { name: 'SetupStoryteller', ret: "void", arity: 0, params: "void" },
  { name: 'SetupGiddy', ret: "void", arity: 0, params: "void" },
  { name: 'SetupTrader', ret: "void", arity: 0, params: "void" },
  { name: 'SetMauvilleOldMan', ret: "void", arity: 0, params: "void" },
  { name: 'GetCurrentMauvilleOldMan', ret: "u8", arity: 0, params: "void" },
  { name: 'Script_GetCurrentMauvilleMan', ret: "void", arity: 0, params: "void" },
  { name: 'HasBardSongBeenChanged', ret: "void", arity: 0, params: "void" },
  { name: 'SaveBardSongLyrics', ret: "void", arity: 0, params: "void" },
  { name: 'PrepareSongText', ret: "void", arity: 0, params: "void" },
  { name: 'PlayBardSong', ret: "void", arity: 0, params: "void" },
  { name: 'HasHipsterTaughtWord', ret: "void", arity: 0, params: "void" },
  { name: 'SetHipsterTaughtWord', ret: "void", arity: 0, params: "void" },
  { name: 'HipsterTryTeachWord', ret: "void", arity: 0, params: "void" },
  { name: 'GiddyShouldTellAnotherTale', ret: "void", arity: 0, params: "void" },
  { name: 'GenerateGiddyLine', ret: "void", arity: 0, params: "void" },
  { name: 'ResetBardFlag', ret: "void", arity: 0, params: "void" },
  { name: 'ResetHipsterFlag', ret: "void", arity: 0, params: "void" },
  { name: 'ResetTraderFlag', ret: "void", arity: 0, params: "void" },
  { name: 'ResetStorytellerFlag', ret: "void", arity: 0, params: "void" },
  { name: 'ResetMauvilleOldManFlag', ret: "void", arity: 0, params: "void" },
  { name: 'EnableTextPrinters', ret: "void", arity: 0, params: "void" },
  { name: 'DisableTextPrinters', ret: "void", arity: 2, params: "struct TextPrinterTemplate *printer, u16 renderCmd" },
  { name: 'DrawSongTextWindow', ret: "void", arity: 1, params: "const u8 *str" },
  { name: 'BardSing', ret: "void", arity: 2, params: "struct Task *task, struct BardSong *song" },
  { name: 'SetMauvilleOldManObjEventGfx', ret: "void", arity: 0, params: "void" },
  { name: 'SanitizeMauvilleOldManForRuby', ret: "void", arity: 1, params: "union OldMan *oldMan" },
  { name: 'SetMauvilleOldManLanguage', ret: "UNUSED", arity: 4, params: "union OldMan *oldMan, u32 language1, u32 language2, u32 language3" },
  { name: 'SanitizeReceivedEmeraldOldMan', ret: "void", arity: 3, params: "union OldMan *oldMan, u32 version, u32 language" },
  { name: 'SanitizeReceivedRubyOldMan', ret: "void", arity: 3, params: "union OldMan *oldMan, u32 version, u32 language" },
  { name: 'StorytellerGetGameStat', ret: "u32", arity: 1, params: "u8 stat" },
  { name: 'GetFreeStorySlot', ret: "u8", arity: 0, params: "void" },
  { name: 'StorytellerGetRecordedTrainerStat', ret: "u32", arity: 1, params: "u32 trainer" },
  { name: 'StorytellerSetRecordedTrainerStat', ret: "void", arity: 2, params: "u32 trainer, u32 val" },
  { name: 'HasTrainerStatIncreased', ret: "bool32", arity: 1, params: "u32 trainer" },
  { name: 'GetStoryByStattellerPlayerName', ret: "void", arity: 2, params: "u32 player, void *dst" },
  { name: 'StorytellerSetPlayerName', ret: "void", arity: 2, params: "u32 player, const u8 *src" },
  { name: 'StorytellerRecordNewStat', ret: "void", arity: 2, params: "u32 player, u32 stat" },
  { name: 'ScrambleStatList', ret: "void", arity: 2, params: "u8 *arr, s32 count" },
  { name: 'StorytellerInitializeRandomStat', ret: "bool8", arity: 0, params: "void" },
  { name: 'StorytellerDisplayStory', ret: "void", arity: 1, params: "u32 player" },
  { name: 'PrintStoryList', ret: "void", arity: 0, params: "void" },
  { name: 'Task_StoryListMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'StorytellerStoryListMenu', ret: "void", arity: 0, params: "void" },
  { name: 'Script_StorytellerDisplayStory', ret: "void", arity: 0, params: "void" },
  { name: 'StorytellerGetFreeStorySlot', ret: "u8", arity: 0, params: "void" },
  { name: 'StorytellerUpdateStat', ret: "bool8", arity: 0, params: "void" },
  { name: 'HasStorytellerAlreadyRecorded', ret: "bool8", arity: 0, params: "void" },
  { name: 'Script_StorytellerInitializeRandomStat', ret: "bool8", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_BardSong',
  'Task_StoryListMenu',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'main.h',
  'constants/songs.h',
  'constants/event_objects.h',
  'mauville_old_man.h',
  'event_data.h',
  'string_util.h',
  'text.h',
  'easy_chat.h',
  'script.h',
  'random.h',
  'event_scripts.h',
  'task.h',
  'menu.h',
  'm4a.h',
  'bard_music.h',
  'sound.h',
  'strings.h',
  'overworld.h',
  'field_message_box.h',
  'script_menu.h',
  'trader.h',
  'm4a.h',
  'constants/mauville_old_man.h',
] as const;
