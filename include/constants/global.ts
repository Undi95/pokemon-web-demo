// EX-AUTO-GENERATED (générateur disparu — complété manuellement) from include/constants/global.h by extract-decomp-all.mjs
// Compléments manuels autorisés (aucun script ne régénère include/ depuis avril 2026).
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/constants/global.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const VERSION_SAPPHIRE = 1;
export const VERSION_RUBY = 2;
export const VERSION_EMERALD = 3;
export const VERSION_FIRE_RED = 4;
export const VERSION_LEAF_GREEN = 5;
export const VERSION_HEART_GOLD = 7;
export const VERSION_SOUL_SILVER = 8;
export const VERSION_DIAMOND = 10;
export const VERSION_PEARL = 11;
export const VERSION_PLATINUM = 12;
export const VERSION_GAMECUBE = 15;
export const LANGUAGE_JAPANESE = 1;
export const LANGUAGE_ENGLISH = 2;
export const LANGUAGE_FRENCH = 3;
export const LANGUAGE_ITALIAN = 4;
export const LANGUAGE_GERMAN = 5;
export const LANGUAGE_KOREAN = 6;
export const LANGUAGE_SPANISH = 7;
export const NUM_LANGUAGES = 7;
/** Raw expr: `(VERSION_EMERALD)` */
export const GAME_VERSION_EXPR = "(VERSION_EMERALD)";
/** Raw expr: `(LANGUAGE_FRENCH)` */
export const GAME_LANGUAGE_EXPR = "(LANGUAGE_FRENCH)";
export const PARTY_SIZE = 6;
/** Raw expr: `(PARTY_SIZE / 2)` */
export const MULTI_PARTY_SIZE_EXPR = "(PARTY_SIZE / 2)";
export const FRONTIER_PARTY_SIZE = 3;
export const FRONTIER_DOUBLES_PARTY_SIZE = 4;
export const FRONTIER_MULTI_PARTY_SIZE = 2;
/** Raw expr: `(max(FRONTIER_PARTY_SIZE,        \` */
export const MAX_FRONTIER_PARTY_SIZE_EXPR = "(max(FRONTIER_PARTY_SIZE,        \\";
export const UNION_ROOM_PARTY_SIZE = 2;
export const DAYCARE_MON_COUNT = 2;
export const POKEBLOCKS_COUNT = 40;
export const OBJECT_EVENTS_COUNT = 16;
/** Raw expr: `(10 + PARTY_SIZE)` */
export const MAIL_COUNT_EXPR = "(10 + PARTY_SIZE)";
export const SECRET_BASES_COUNT = 20;
export const POKE_NEWS_COUNT = 16;
export const PC_ITEMS_COUNT = 50;
export const BAG_ITEMS_COUNT = 30;
export const BAG_KEYITEMS_COUNT = 30;
export const BAG_POKEBALLS_COUNT = 16;
export const BAG_TMHM_COUNT = 64;
export const BAG_BERRIES_COUNT = 46;
export const OBJECT_EVENT_TEMPLATES_COUNT = 64;
export const DECOR_MAX_SECRET_BASE = 16;
export const DECOR_MAX_PLAYERS_HOUSE = 12;
export const APPRENTICE_COUNT = 4;
export const APPRENTICE_MAX_QUESTIONS = 9;
export const MAX_REMATCH_ENTRIES = 100;
export const NUM_CONTEST_WINNERS = 13;
export const UNION_ROOM_KB_ROW_COUNT = 10;
export const GIFT_RIBBONS_COUNT = 11;
export const SAVED_TRENDS_COUNT = 5;
export const PYRAMID_BAG_ITEMS_COUNT = 10;
export const HALL_FACILITIES_COUNT = 9;
export const HALL_RECORDS_COUNT = 3;
export const FRONTIER_LVL_50 = 0;
export const FRONTIER_LVL_OPEN = 1;
export const FRONTIER_LVL_MODE_COUNT = 2;
/** Raw expr: `FRONTIER_LVL_MODE_COUNT` */
export const FRONTIER_LVL_TENT_EXPR = "FRONTIER_LVL_MODE_COUNT";
export const TRAINER_ID_LENGTH = 4;
export const MAX_MON_MOVES = 4;
/** Raw expr: `((1 << MAX_MON_MOVES) - 1)` */
export const ALL_MOVES_MASK_EXPR = "((1 << MAX_MON_MOVES) - 1)";
export const CONTESTANT_COUNT = 4;
export const CONTEST_CATEGORY_COOL = 0;
export const CONTEST_CATEGORY_BEAUTY = 1;
export const CONTEST_CATEGORY_CUTE = 2;
export const CONTEST_CATEGORY_SMART = 3;
export const CONTEST_CATEGORY_TOUGH = 4;
export const CONTEST_CATEGORIES_COUNT = 5;
export const ITEM_NAME_LENGTH = 14;
export const POKEMON_NAME_LENGTH = 10;
/** Raw expr: `max(20, POKEMON_NAME_LENGTH + 1)` */
export const POKEMON_NAME_BUFFER_SIZE_EXPR = "max(20, POKEMON_NAME_LENGTH + 1)";
export const PLAYER_NAME_LENGTH = 7;
export const MAIL_WORDS_COUNT = 9;
export const EASY_CHAT_BATTLE_WORDS_COUNT = 6;
export const MOVE_NAME_LENGTH = 12;
export const NUM_QUESTIONNAIRE_WORDS = 4;
export const QUIZ_QUESTION_LEN = 9;
export const WONDER_CARD_TEXT_LENGTH = 40;
export const WONDER_NEWS_TEXT_LENGTH = 40;
export const WONDER_CARD_BODY_TEXT_LINES = 4;
export const WONDER_NEWS_BODY_TEXT_LINES = 10;
export const TYPE_NAME_LENGTH = 6;
export const ABILITY_NAME_LENGTH = 12;
export const TRAINER_NAME_LENGTH = 10;
export const MAX_STAMP_CARD_STAMPS = 7;
export const MALE = 0;
export const FEMALE = 1;
export const GENDER_COUNT = 2;
export const NUM_BARD_SONG_WORDS = 6;
export const NUM_STORYTELLER_TALES = 4;
export const NUM_TRADER_ITEMS = 4;
export const GIDDY_MAX_TALES = 10;
export const GIDDY_MAX_QUESTIONS = 8;
export const OPTIONS_BUTTON_MODE_NORMAL = 0;
export const OPTIONS_BUTTON_MODE_LR = 1;
export const OPTIONS_BUTTON_MODE_L_EQUALS_A = 2;
export const OPTIONS_TEXT_SPEED_SLOW = 0;
export const OPTIONS_TEXT_SPEED_MID = 1;
export const OPTIONS_TEXT_SPEED_FAST = 2;
export const OPTIONS_SOUND_MONO = 0;
export const OPTIONS_SOUND_STEREO = 1;
export const OPTIONS_BATTLE_STYLE_SHIFT = 0;
export const OPTIONS_BATTLE_STYLE_SET = 1;
export const OPTIONS_BATTLE_SCENE_ON = 0;
export const OPTIONS_BATTLE_SCENE_OFF = 1;
export const DIR_NONE = 0;
export const DIR_SOUTH = 1;
export const DIR_NORTH = 2;
export const DIR_WEST = 3;
export const DIR_EAST = 4;
export const DIR_SOUTHWEST = 5;
export const DIR_SOUTHEAST = 6;
export const DIR_NORTHWEST = 7;
export const DIR_NORTHEAST = 8;
export const CONNECTION_INVALID = -1;
export const CONNECTION_NONE = 0;
export const CONNECTION_SOUTH = 1;
export const CONNECTION_NORTH = 2;
export const CONNECTION_WEST = 3;
export const CONNECTION_EAST = 4;
export const CONNECTION_DIVE = 5;
export const CONNECTION_EMERGE = 6;

// ─── Compléments (unification lot 7, 2026-07-10) — #define constants/que l'ancien extracteur sautait (1<<N/composites), rapatriés de engine/battle/constants.ts ───
export const PARTY_SIZE_CONST = 6;
export const MULTI_PARTY_SIZE = 3;
