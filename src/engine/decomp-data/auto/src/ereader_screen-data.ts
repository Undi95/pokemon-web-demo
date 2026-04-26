// AUTO-GENERATED from src/ereader_screen.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/ereader_screen.c
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_TRANSFER_0 = {
  TRANSFER_ACTIVE: 0,
  TRANSFER_SUCCESS: 1,
  TRANSFER_CANCELED: 2,
  TRANSFER_TIMEOUT: 3,
} as const;
export const ENUM_RECV_1 = {
  RECV_STATE_INIT: 0,
  RECV_STATE_WAIT_START: 1,
  RECV_STATE_START: 2,
  RECV_STATE_EXCHANGE: 3,
  RECV_STATE_START_DISCONNECT: 4,
  RECV_STATE_WAIT_DISCONNECT: 5,
} as const;
export const ENUM_RECV_2 = {
  RECV_ACTIVE: 0,
  RECV_CANCELED: 1,
  RECV_SUCCESS: 2,
  RECV_ERROR: 3,
  RECV_DISCONNECTED: 4,
  RECV_TIMEOUT: 5,
} as const;
export const ENUM_ER_3 = {
  ER_STATE_START: 0,
  ER_STATE_INIT_LINK: 1,
  ER_STATE_INIT_LINK_WAIT: 2,
  ER_STATE_INIT_LINK_CHECK: 3,
  ER_STATE_MSG_SELECT_CONNECT: 4,
  ER_STATE_MSG_SELECT_CONNECT_WAIT: 5,
  ER_STATE_TRY_LINK: 6,
  ER_STATE_INCORRECT_LINK: 7,
  ER_STATE_CONNECTING: 8,
  ER_STATE_TRANSFER: 9,
  ER_STATE_TRANSFER_END: 10,
  ER_STATE_TRANSFER_SUCCESS: 11,
  ER_STATE_LOAD_CARD_START: 12,
  ER_STATE_LOAD_CARD: 13,
  ER_STATE_WAIT_RECV_CARD: 14,
  ER_STATE_VALIDATE_CARD: 15,
  ER_STATE_WAIT_DISCONNECT: 16,
  ER_STATE_SAVE: 17,
  ER_STATE_SUCCESS_MSG: 18,
  ER_STATE_SUCCESS_END: 19,
  ER_STATE_LINK_ERROR: 20,
  ER_STATE_LINK_ERROR_TRY_AGAIN: 21,
  ER_STATE_SAVE_FAILED: 22,
  ER_STATE_CANCELED_CARD_READ: 23,
  ER_STATE_UNUSED_1: 24,
  ER_STATE_UNUSED_2: 25,
  ER_STATE_END: 26,
} as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'COMMON_DATA', type: "UNUSED u8", name: 'gUnknownSpace', isArray: true, init: "{0}" },
  { segment: 'COMMON_DATA', type: "struct EReaderData", name: 'gEReaderData', isArray: false, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_EReader', ret: "void", arity: 1, params: "u8" },
  { name: 'EReader_Load', ret: "void", arity: 3, params: "struct EReaderData *eReader, int size, u32 *data" },
  { name: 'EReader_Reset', ret: "void", arity: 1, params: "struct EReaderData *eReader" },
  { name: 'EReader_Transfer', ret: "u8", arity: 1, params: "struct EReaderData *eReader" },
  { name: 'OpenEReaderLink', ret: "void", arity: 0, params: "void" },
  { name: 'ValidateEReaderConnection', ret: "bool32", arity: 0, params: "void" },
  { name: 'IsChildConnected', ret: "bool32", arity: 0, params: "void" },
  { name: 'TryReceiveCard', ret: "u32", arity: 2, params: "u8 *state, u16 *timer" },
  { name: 'CreateEReaderTask', ret: "void", arity: 0, params: "void" },
  { name: 'ResetTimer', ret: "void", arity: 1, params: "u16 *timer" },
  { name: 'UpdateTimer', ret: "bool32", arity: 2, params: "u16 *timer, u16 time" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_EReader',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'decompress.h',
  'ereader_helpers.h',
  'link.h',
  'main.h',
  'mystery_gift_menu.h',
  'mystery_gift_client.h',
  'save.h',
  'sound.h',
  'sprite.h',
  'task.h',
  'strings.h',
  'util.h',
  'constants/songs.h',
] as const;
