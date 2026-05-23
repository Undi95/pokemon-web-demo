// AUTO-GENERATED from src/new_game.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/new_game.c
// Generated: 2026-04-26

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "bool8", name: 'gDifferentSaveFile', isArray: false, init: "FALSE" },
  { segment: 'EWRAM_DATA', type: "bool8", name: 'gEnableContestDebugging', isArray: false, init: "FALSE" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ClearFrontierRecord', ret: "void", arity: 0, params: "void" },
  { name: 'WarpToTruck', ret: "void", arity: 0, params: "void" },
  { name: 'ResetMiniGamesRecords', ret: "void", arity: 0, params: "void" },
  { name: 'SetTrainerId', ret: "void", arity: 2, params: "u32 trainerId, u8 *dst" },
  { name: 'GetTrainerId', ret: "u32", arity: 1, params: "u8 *trainerId" },
  { name: 'CopyTrainerId', ret: "void", arity: 2, params: "u8 *dst, u8 *src" },
  { name: 'InitPlayerTrainerId', ret: "void", arity: 0, params: "void" },
  { name: 'SetDefaultOptions', ret: "void", arity: 0, params: "void" },
  { name: 'ClearPokedexFlags', ret: "void", arity: 0, params: "void" },
  { name: 'ClearAllContestWinnerPics', ret: "void", arity: 0, params: "void" },
  { name: 'Sav2_ClearSetDefault', ret: "void", arity: 0, params: "void" },
  { name: 'ResetMenuAndMonGlobals', ret: "void", arity: 0, params: "void" },
  { name: 'NewGameInitData', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'new_game.h',
  'random.h',
  'pokemon.h',
  'roamer.h',
  'pokemon_size_record.h',
  'script.h',
  'lottery_corner.h',
  'play_time.h',
  'mauville_old_man.h',
  'match_call.h',
  'lilycove_lady.h',
  'load_save.h',
  'pokeblock.h',
  'dewford_trend.h',
  'berry.h',
  'rtc.h',
  'easy_chat.h',
  'event_data.h',
  'money.h',
  'trainer_hill.h',
  'tv.h',
  'coins.h',
  'text.h',
  'overworld.h',
  'mail.h',
  'battle_records.h',
  'item.h',
  'pokedex.h',
  'apprentice.h',
  'frontier_util.h',
  'pokedex.h',
  'save.h',
  'link_rfu.h',
  'main.h',
  'contest.h',
  'item_menu.h',
  'pokemon_storage_system.h',
  'pokemon_jump.h',
  'decoration_inventory.h',
  'secret_base.h',
  'player_pc.h',
  'field_specials.h',
  'berry_powder.h',
  'mystery_gift.h',
  'union_room_chat.h',
  'constants/items.h',
] as const;
