// AUTO-GENERATED from include/mystery_gift_client.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/mystery_gift_client.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const CLIENT_MAX_MSG_SIZE = 64;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_CLI_0 = {
  CLI_RET_INIT: 0,
  CLI_RET_ACTIVE: 1,
  CLI_RET_YES_NO: 2,
  CLI_RET_PRINT_MSG: 3,
  CLI_RET_ASK_TOSS: 4,
  CLI_RET_COPY_MSG: 5,
  CLI_RET_END: 6,
} as const;
export const ENUM_CLI_1 = {
  CLI_NONE: 0,
  CLI_RETURN: 1,
  CLI_RECV: 2,
  CLI_SEND_LOADED: 3,
  CLI_COPY_RECV: 4,
  CLI_YES_NO: 5,
  CLI_COPY_RECV_IF_N: 6,
  CLI_COPY_RECV_IF: 7,
  CLI_LOAD_GAME_DATA: 8,
  CLI_SAVE_NEWS: 9,
  CLI_SAVE_CARD: 10,
  CLI_PRINT_MSG: 11,
  CLI_COPY_MSG: 12,
  CLI_ASK_TOSS: 13,
  CLI_LOAD_TOSS_RESPONSE: 14,
  CLI_RUN_MEVENT_SCRIPT: 15,
  CLI_SAVE_STAMP: 16,
  CLI_SAVE_RAM_SCRIPT: 17,
  CLI_RECV_EREADER_TRAINER: 18,
  CLI_SEND_STAT: 19,
  CLI_SEND_READY_END: 20,
  CLI_RUN_BUFFER_SCRIPT: 21,
} as const;
export const ENUM_CLI_2 = {
  CLI_MSG_NOTHING_SENT: 0,
  CLI_MSG_RECORD_UPLOADED: 1,
  CLI_MSG_CARD_RECEIVED: 2,
  CLI_MSG_NEWS_RECEIVED: 3,
  CLI_MSG_STAMP_RECEIVED: 4,
  CLI_MSG_HAD_CARD: 5,
  CLI_MSG_HAD_STAMP: 6,
  CLI_MSG_HAD_NEWS: 7,
  CLI_MSG_NO_ROOM_STAMPS: 8,
  CLI_MSG_COMM_CANCELED: 9,
  CLI_MSG_CANT_ACCEPT: 10,
  CLI_MSG_COMM_ERROR: 11,
  CLI_MSG_TRAINER_RECEIVED: 12,
  CLI_MSG_BUFFER_SUCCESS: 13,
  CLI_MSG_BUFFER_FAILURE: 14,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'MysteryGiftClient_Create', ret: "void", arity: 1, params: "bool32 isWonderNews" },
  { name: 'MysteryGiftClient_Run', ret: "u32", arity: 1, params: "u16 *endVal" },
  { name: 'MysteryGiftClient_AdvanceState', ret: "void", arity: 0, params: "void" },
  { name: 'MysteryGiftClient_GetMsg', ret: "void *", arity: 0, params: "void" },
  { name: 'MysteryGiftClient_SetParam', ret: "void", arity: 1, params: "u32 val" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'mystery_gift_link.h',
] as const;
