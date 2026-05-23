// AUTO-GENERATED from include/constants/battle_dome.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/constants/battle_dome.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const DOME_ROUND1 = 0;
export const DOME_ROUND2 = 1;
export const DOME_SEMIFINAL = 2;
export const DOME_FINAL = 3;
export const DOME_ROUNDS_COUNT = 4;
/** Raw expr: `DOME_TOURNAMENT_TRAINERS_COUNT - 1` */
export const DOME_TOURNAMENT_MATCHES_COUNT_EXPR = "DOME_TOURNAMENT_TRAINERS_COUNT - 1";
export const DOME_BATTLE_PARTY_SIZE = 2;
export const DOME_PLAYER_WON_MATCH = 1;
export const DOME_PLAYER_LOST_MATCH = 2;
export const DOME_PLAYER_RETIRED = 9;
export const BATTLE_DOME_FUNC_INIT = 0;
export const BATTLE_DOME_FUNC_GET_DATA = 1;
export const BATTLE_DOME_FUNC_SET_DATA = 2;
export const BATTLE_DOME_FUNC_GET_ROUND_TEXT = 3;
export const BATTLE_DOME_FUNC_GET_OPPONENT_NAME = 4;
export const BATTLE_DOME_FUNC_INIT_OPPONENT_PARTY = 5;
export const BATTLE_DOME_FUNC_SHOW_OPPONENT_INFO = 6;
export const BATTLE_DOME_FUNC_SHOW_TOURNEY_TREE = 7;
export const BATTLE_DOME_FUNC_SHOW_PREV_TOURNEY_TREE = 8;
export const BATTLE_DOME_FUNC_SET_OPPONENT_ID = 9;
export const BATTLE_DOME_FUNC_SET_OPPONENT_GFX = 10;
export const BATTLE_DOME_FUNC_SHOW_STATIC_TOURNEY_TREE = 11;
export const BATTLE_DOME_FUNC_RESOLVE_WINNERS = 12;
export const BATTLE_DOME_FUNC_SAVE = 13;
export const BATTLE_DOME_FUNC_INCREMENT_STREAK = 14;
export const BATTLE_DOME_FUNC_SET_TRAINERS = 15;
export const BATTLE_DOME_FUNC_RESET_SKETCH = 16;
export const BATTLE_DOME_FUNC_RESTORE_HELD_ITEMS = 17;
export const BATTLE_DOME_FUNC_REDUCE_PARTY = 18;
export const BATTLE_DOME_FUNC_COMPARE_SEEDS = 19;
export const BATTLE_DOME_FUNC_GET_WINNER_NAME = 20;
export const BATTLE_DOME_FUNC_INIT_RESULTS_TREE = 21;
export const BATTLE_DOME_FUNC_INIT_TRAINERS = 22;
export const DOME_DATA_WIN_STREAK = 0;
export const DOME_DATA_WIN_STREAK_ACTIVE = 1;
export const DOME_DATA_ATTEMPTED_SINGLES_50 = 2;
export const DOME_DATA_ATTEMPTED_SINGLES_OPEN = 3;
export const DOME_DATA_HAS_WON_SINGLES_50 = 4;
export const DOME_DATA_HAS_WON_SINGLES_OPEN = 5;
export const DOME_DATA_ATTEMPTED_CHALLENGE = 6;
export const DOME_DATA_HAS_WON_CHALLENGE = 7;
export const DOME_DATA_SELECTED_MONS = 8;
export const DOME_DATA_PREV_TOURNEY_TYPE = 9;
export const TOURNEY_TREE_CLOSE_BUTTON = 31;
export const TOURNEY_TREE_SELECTED_CLOSE = 0;
export const TOURNEY_TREE_NO_SELECTION = 1;
export const TOURNEY_TREE_SELECTED_TRAINER = 2;
export const TOURNEY_TREE_SELECTED_MATCH = 3;
export const INFOCARD_NEXT_OPPONENT = 0;
export const INFOCARD_TRAINER = 1;
export const INFOCARD_MATCH = 2;
export const INFOCARD_INPUT_NONE = 0;
export const TRAINERCARD_INPUT_UP = 1;
export const TRAINERCARD_INPUT_DOWN = 2;
export const TRAINERCARD_INPUT_LEFT = 3;
export const TRAINERCARD_INPUT_RIGHT = 4;
export const MATCHCARD_INPUT_UP = 5;
export const MATCHCARD_INPUT_DOWN = 6;
export const MATCHCARD_INPUT_LEFT = 7;
export const MATCHCARD_INPUT_RIGHT = 8;
export const INFOCARD_INPUT_AB = 9;
/** Raw expr: `(1 << 0)` */
export const CARD_ALTERNATE_SLOT_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 1)` */
export const MOVE_CARD_RIGHT_EXPR = "(1 << 1)";
/** Raw expr: `(1 << 2)` */
export const MOVE_CARD_DOWN_EXPR = "(1 << 2)";
/** Raw expr: `(1 << 3)` */
export const MOVE_CARD_LEFT_EXPR = "(1 << 3)";
/** Raw expr: `(1 << 4)` */
export const MOVE_CARD_UP_EXPR = "(1 << 4)";
/** Raw expr: `(MOVE_CARD_RIGHT | MOVE_CARD_DOWN | MOVE_CARD_LEFT | MOVE_CARD_UP)` */
export const MOVE_CARD_EXPR = "(MOVE_CARD_RIGHT | MOVE_CARD_DOWN | MOVE_CARD_LEFT | MOVE_CARD_UP)";
export const DOME_TEXT_NO_WINNER_YET = 0;
export const DOME_TEXT_WON_USING_MOVE = 1;
export const DOME_TEXT_CHAMP_USING_MOVE = 2;
export const DOME_TEXT_WON_ON_FORFEIT = 3;
export const DOME_TEXT_CHAMP_ON_FORFEIT = 4;
export const DOME_TEXT_WON_NO_MOVES = 5;
export const DOME_TEXT_CHAMP_NO_MOVES = 6;
export const DOME_TEXT_TWO_GOOD_STATS = 0;
export const DOME_TEXT_ONE_GOOD_STAT = 15;
export const DOME_TEXT_TWO_BAD_STATS = 21;
export const DOME_TEXT_ONE_BAD_STAT = 36;
export const DOME_TEXT_WELL_BALANCED = 42;
export const DOME_TEXT_HP = 0;
export const DOME_TEXT_ATK = 5;
export const DOME_TEXT_DEF = 9;
export const DOME_TEXT_SPEED = 12;
export const DOME_TEXT_SPATK = 14;
export const MOVE_POINTS_COMBO = 0;
export const MOVE_POINTS_STAT_RAISE = 1;
export const MOVE_POINTS_STAT_LOWER = 2;
export const MOVE_POINTS_RARE = 3;
export const MOVE_POINTS_HEAL = 4;
export const MOVE_POINTS_RISKY = 5;
export const MOVE_POINTS_STATUS = 6;
export const MOVE_POINTS_DMG = 7;
export const MOVE_POINTS_DEF = 8;
export const MOVE_POINTS_ACCURATE = 9;
export const MOVE_POINTS_POWERFUL = 10;
export const MOVE_POINTS_POPULAR = 11;
export const MOVE_POINTS_LUCK = 12;
export const MOVE_POINTS_STRONG = 13;
export const MOVE_POINTS_LOW_PP = 14;
export const MOVE_POINTS_EFFECT = 15;
export const NUM_MOVE_POINT_TYPES = 16;
export const DOME_BATTLE_STYLE_RISKY = 0;
export const DOME_BATTLE_STYLE_STALL = 1;
export const DOME_BATTLE_STYLE_VARIED = 2;
export const DOME_BATTLE_STYLE_COMBO_HIGH = 3;
export const DOME_BATTLE_STYLE_RARE_MOVES = 4;
export const DOME_BATTLE_STYLE_RARE_MOVE = 5;
export const DOME_BATTLE_STYLE_HP = 6;
export const DOME_BATTLE_STYLE_STORE_POWER = 7;
export const DOME_BATTLE_STYLE_ENFEEBLE_LOW = 8;
export const DOME_BATTLE_STYLE_LUCK = 9;
export const DOME_BATTLE_STYLE_REGAL = 10;
export const DOME_BATTLE_STYLE_LOW_PP = 11;
export const DOME_BATTLE_STYLE_STATUS_ATK = 12;
export const DOME_BATTLE_STYLE_ENDURE = 13;
export const DOME_BATTLE_STYLE_STATUS = 14;
export const DOME_BATTLE_STYLE_STRAIGHTFORWARD = 15;
export const DOME_BATTLE_STYLE_AGGRESSIVE = 16;
export const DOME_BATTLE_STYLE_DEF = 17;
export const DOME_BATTLE_STYLE_ENFEEBLE_HIGH = 18;
export const DOME_BATTLE_STYLE_POPULAR_POWER = 19;
export const DOME_BATTLE_STYLE_COMBO_LOW = 20;
export const DOME_BATTLE_STYLE_ACCURATE = 21;
export const DOME_BATTLE_STYLE_POWERFUL = 22;
export const DOME_BATTLE_STYLE_ATK_OVER_DEF = 23;
export const DOME_BATTLE_STYLE_DEF_OVER_ATK = 24;
export const DOME_BATTLE_STYLE_POPULAR_STRONG = 25;
export const DOME_BATTLE_STYLE_EFFECTS = 26;
export const DOME_BATTLE_STYLE_BALANCED = 27;
export const DOME_BATTLE_STYLE_UNUSED1 = 28;
export const DOME_BATTLE_STYLE_UNUSED2 = 29;
export const DOME_BATTLE_STYLE_UNUSED3 = 30;
export const DOME_BATTLE_STYLE_UNUSED4 = 31;
export const NUM_BATTLE_STYLES = 32;
