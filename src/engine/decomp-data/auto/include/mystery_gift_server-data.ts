// AUTO-GENERATED from include/mystery_gift_server.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/mystery_gift_server.h
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_SVR_0 = {
  SVR_RET_INIT: 0,
  SVR_RET_ACTIVE: 1,
  SVR_RET_UNUSED: 2,
  SVR_RET_END: 3,
} as const;
export const ENUM_SVR_1 = {
  SVR_RETURN: 0,
  SVR_SEND: 1,
  SVR_RECV: 2,
  SVR_GOTO: 3,
  SVR_GOTO_IF_EQ: 4,
  SVR_COPY_GAME_DATA: 5,
  SVR_CHECK_GAME_DATA_CARD: 6,
  SVR_CHECK_EXISTING_CARD: 7,
  SVR_READ_RESPONSE: 8,
  SVR_CHECK_EXISTING_STAMPS: 9,
  SVR_GET_CARD_STAT: 10,
  SVR_CHECK_QUESTIONNAIRE: 11,
  SVR_COMPARE: 12,
  SVR_LOAD_CARD: 13,
  SVR_LOAD_NEWS: 14,
  SVR_LOAD_RAM_SCRIPT: 15,
  SVR_LOAD_STAMP: 16,
  SVR_LOAD_UNK_2: 17,
  SVR_LOAD_CLIENT_SCRIPT: 18,
  SVR_LOAD_EREADER_TRAINER: 19,
  SVR_LOAD_MSG: 20,
  SVR_COPY_STAMP: 21,
  SVR_COPY_CARD: 22,
  SVR_COPY_NEWS: 23,
  SVR_SET_RAM_SCRIPT: 24,
  SVR_SET_CLIENT_SCRIPT: 25,
  SVR_COPY_SAVED_CARD: 26,
  SVR_COPY_SAVED_NEWS: 27,
  SVR_COPY_SAVED_RAM_SCRIPT: 28,
  SVR_LOAD_UNK_1: 29,
  SVR_CHECK_GAME_DATA_NEWS: 30,
} as const;
export const ENUM_SVR_2 = {
  SVR_MSG_NOTHING_SENT: 0,
  SVR_MSG_RECORD_UPLOADED: 1,
  SVR_MSG_CARD_SENT: 2,
  SVR_MSG_NEWS_SENT: 3,
  SVR_MSG_STAMP_SENT: 4,
  SVR_MSG_HAS_CARD: 5,
  SVR_MSG_HAS_STAMP: 6,
  SVR_MSG_HAS_NEWS: 7,
  SVR_MSG_NO_ROOM_STAMPS: 8,
  SVR_MSG_CLIENT_CANCELED: 9,
  SVR_MSG_CANT_SEND_GIFT_1: 10,
  SVR_MSG_COMM_ERROR: 11,
  SVR_MSG_GIFT_SENT_1: 12,
  SVR_MSG_GIFT_SENT_2: 13,
  SVR_MSG_CANT_SEND_GIFT_2: 14,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'MysterGiftServer_CreateForCard', ret: "void", arity: 0, params: "void" },
  { name: 'MysterGiftServer_CreateForNews', ret: "void", arity: 0, params: "void" },
  { name: 'MysterGiftServer_Run', ret: "u32", arity: 1, params: "u16 *endVal" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'mystery_gift_link.h',
] as const;
