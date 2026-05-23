// AUTO-GENERATED from src/bard_music.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/bard_music.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `{ .songId = NUM_PHONEME_SONGS }` */
export const PREV_BARD_SOUND_EXPR = "{ .songId = NUM_PHONEME_SONGS }";
/** Raw expr: `{ .songId = PHONEME_ID_NONE }` */
export const NULL_BARD_SOUND_EXPR = "{ .songId = PHONEME_ID_NONE }";
/** Raw expr: `(NUM_BARD_PITCH_TABLES_PER_SIZE * MAX_BARD_SOUNDS_PER_WORD)` */
export const BASE_PITCH_TABLE_INDEX_EXPR = "(NUM_BARD_PITCH_TABLES_PER_SIZE * MAX_BARD_SOUNDS_PER_WORD)";
export const PITCH_END = 6144;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetWordPitch', ret: "s16", arity: 2, params: "int tableIndex, int pitchIndex" },
  { name: 'CalcWordSounds', ret: "void", arity: 2, params: "struct BardSong *song, u16 pitchTableIndex" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'bard_music.h',
  'easy_chat.h',
  'constants/songs.h',
  'data/bard_music/pokemon.h',
  'data/bard_music/moves.h',
  'data/bard_music/trainer.h',
  'data/bard_music/status.h',
  'data/bard_music/battle.h',
  'data/bard_music/greetings.h',
  'data/bard_music/people.h',
  'data/bard_music/voices.h',
  'data/bard_music/speech.h',
  'data/bard_music/endings.h',
  'data/bard_music/feelings.h',
  'data/bard_music/conditions.h',
  'data/bard_music/actions.h',
  'data/bard_music/lifestyle.h',
  'data/bard_music/hobbies.h',
  'data/bard_music/time.h',
  'data/bard_music/misc.h',
  'data/bard_music/adjectives.h',
  'data/bard_music/events.h',
  'data/bard_music/trendysaying.h',
] as const;
