// AUTO-GENERATED from include/AgbRfu_LinkManager.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/AgbRfu_LinkManager.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MODE_P_C_SWITCH = 2;
export const PCSWITCH_1ST_SC_START = 1;
export const PCSWITCH_1ST_SC = 2;
export const PCSWITCH_2ND_SP_START = 3;
export const PCSWITCH_2ND_SP = 4;
export const PCSWITCH_3RD_SC_START = 5;
export const PCSWITCH_3RD_SC = 6;
export const PCSWITCH_CP = 7;
export const PCSWITCH_SC_LOCK = 8;
export const PCSWITCH_FORCE_SP_START = 9;
export const PCSWITCH_ALL_PERIOD = 180;
export const PCSWITCH_SP_PERIOD = 40;
export const LMAN_ERROR_MANAGER_BUSY = 1;
export const LMAN_ERROR_AGB_CLK_SLAVE = 2;
export const LMAN_ERROR_PID_NOT_FOUND = 3;
export const LMAN_ERROR_ILLEGAL_PARAMETER = 4;
export const LMAN_ERROR_NOW_LINK_RECOVERY = 5;
export const LMAN_ERROR_NOW_COMMUNICATION = 6;
export const LMAN_ERROR_NOW_SEARCH_PARENT = 7;
export const LMAN_MSG_INITIALIZE_COMPLETED = 0;
export const LMAN_MSG_NEW_CHILD_CONNECT_DETECTED = 16;
export const LMAN_MSG_NEW_CHILD_CONNECT_ACCEPTED = 17;
export const LMAN_MSG_NEW_CHILD_CONNECT_REJECTED = 18;
export const LMAN_MSG_SEARCH_CHILD_PERIOD_EXPIRED = 19;
export const LMAN_MSG_END_WAIT_CHILD_NAME = 20;
export const LMAN_MSG_PARENT_FOUND = 32;
export const LMAN_MSG_SEARCH_PARENT_PERIOD_EXPIRED = 33;
export const LMAN_MSG_CONNECT_PARENT_SUCCESSED = 34;
export const LMAN_MSG_CONNECT_PARENT_FAILED = 35;
export const LMAN_MSG_CHILD_NAME_SEND_COMPLETED = 36;
export const LMAN_MSG_CHILD_NAME_SEND_FAILED_AND_DISCONNECTED = 37;
export const LMAN_MSG_LINK_LOSS_DETECTED_AND_DISCONNECTED = 48;
export const LMAN_MSG_LINK_LOSS_DETECTED_AND_START_RECOVERY = 49;
export const LMAN_MSG_LINK_RECOVERY_SUCCESSED = 50;
export const LMAN_MSG_LINK_RECOVERY_FAILED_AND_DISCONNECTED = 51;
export const LMAN_MSG_LINK_DISCONNECTED_BY_USER = 64;
export const LMAN_MSG_CHANGE_AGB_CLOCK_SLAVE = 65;
export const LMAN_MSG_CHANGE_AGB_CLOCK_MASTER = 69;
export const LMAN_MSG_RFU_POWER_DOWN = 66;
export const LMAN_MSG_MANAGER_STOPPED = 67;
export const LMAN_MSG_MANAGER_FORCED_STOPPED_AND_RFU_RESET = 68;
export const LMAN_MSG_RECV_DATA_REQ_COMPLETED = 80;
export const LMAN_MSG_REQ_API_ERROR = 240;
export const LMAN_MSG_WATCH_DOG_TIMER_ERROR = 241;
export const LMAN_MSG_CLOCK_SLAVE_MS_CHANGE_ERROR_BY_DMA = 242;
export const LMAN_MSG_LMAN_API_ERROR_RETURN = 243;
export const LMAN_MSG_RFU_FATAL_ERROR = 255;
export const RFU_CHILD_CLOCK_SLAVE_OFF = 0;
export const RFU_CHILD_CLOCK_SLAVE_ON = 1;
export const RFU_CHILD_CLOCK_SLAVE_OFF_REQ = 2;
export const LMAN_STATE_READY = 0;
export const LMAN_STATE_SOFT_RESET_AND_CHECK_ID = 1;
export const LMAN_STATE_RESET = 2;
export const LMAN_STATE_CONFIG_SYSTEM = 3;
export const LMAN_STATE_CONFIG_GAME_DATA = 4;
export const LMAN_STATE_START_SEARCH_CHILD = 5;
export const LMAN_STATE_POLL_SEARCH_CHILD = 6;
export const LMAN_STATE_END_SEARCH_CHILD = 7;
export const LMAN_STATE_WAIT_RECV_CHILD_NAME = 8;
export const LMAN_STATE_START_SEARCH_PARENT = 9;
export const LMAN_STATE_POLL_SEARCH_PARENT = 10;
export const LMAN_STATE_END_SEARCH_PARENT = 11;
export const LMAN_STATE_START_CONNECT_PARENT = 12;
export const LMAN_STATE_POLL_CONNECT_PARENT = 13;
export const LMAN_STATE_END_CONNECT_PARENT = 14;
export const LMAN_STATE_SEND_CHILD_NAME = 15;
export const LMAN_STATE_START_LINK_RECOVERY = 16;
export const LMAN_STATE_POLL_LINK_RECOVERY = 17;
export const LMAN_STATE_END_LINK_RECOVERY = 18;
export const LMAN_STATE_MS_CHANGE = 19;
export const LMAN_STATE_WAIT_CLOCK_MASTER = 20;
export const LMAN_STATE_STOP_MODE = 21;
export const LMAN_STATE_BACK_STATE = 22;
export const LMAN_FORCED_STOP_AND_RFU_RESET = 23;
export const LMAN_STATE_WAIT_CHANGE_CLOCK_MASTER = 24;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'rfu_LMAN_REQBN_softReset_and_checkID', ret: "u32", arity: 0, params: "void" },
  { name: 'rfu_LMAN_requestChangeAgbClockMaster', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_LMAN_initializeRFU', ret: "void", arity: 1, params: "INIT_PARAM *init_parameters" },
  { name: 'rfu_LMAN_establishConnection', ret: "u8", arity: 4, params: "u8 parent_child, u16 connect_period, u16 name_accept_period, u16 *acceptable_serialNo_list" },
  { name: 'rfu_LMAN_stopManager', ret: "void", arity: 1, params: "u8 forced_stop_and_RFU_reset_flag" },
  { name: 'rfu_LMAN_REQ_sendData', ret: "void", arity: 1, params: "bool8 clockChangeFlag" },
  { name: 'rfu_LMAN_powerDownRFU', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_LMAN_CHILD_connectParent', ret: "u8", arity: 2, params: "u16 parentId, u16 connect_period" },
  { name: 'rfu_LMAN_setLinkRecovery', ret: "u8", arity: 2, params: "u8 enable_flag, u16 recovery_period" },
  { name: 'rfu_LMAN_manager_entity', ret: "void", arity: 1, params: "u32 rand" },
  { name: 'rfu_LMAN_syncVBlank', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_LMAN_forceChangeSP', ret: "void", arity: 0, params: "void" },
] as const;
