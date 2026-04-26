// AUTO-GENERATED from src/AgbRfu_LinkManager.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/AgbRfu_LinkManager.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const RN_ACCEPT = 1;
export const RN_NAME_TIMER_CLEAR = 2;
export const RN_DISCONNECT = 4;
export const LINK_RECOVERY_OFF = 0;
export const LINK_RECOVERY_START = 1;
export const LINK_RECOVERY_EXE = 2;
export const LINK_RECOVERY_IMPOSSIBLE = 4;
export const FSP_ON = 1;
export const FSP_START = 2;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'COMMON_DATA', type: "LINK_MANAGER", name: 'lman', isArray: false, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'rfu_LMAN_clearVariables', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_LMAN_settingPCSWITCH', ret: "void", arity: 1, params: "u32 rand" },
  { name: 'rfu_LMAN_REQ_callback', ret: "void", arity: 2, params: "u16 reqCommandId, u16 reqResult" },
  { name: 'rfu_LMAN_MSC_callback', ret: "void", arity: 1, params: "u16 reqCommandId" },
  { name: 'rfu_LMAN_PARENT_checkRecvChildName', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_LMAN_CHILD_checkSendChildName', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_LMAN_CHILD_checkSendChildName2', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_LMAN_CHILD_linkRecoveryProcess', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_LMAN_CHILD_checkEnableParentCandidate', ret: "u8", arity: 0, params: "void" },
  { name: 'rfu_LMAN_occureCallback', ret: "void", arity: 2, params: "u8 msg, u8 param_count" },
  { name: 'rfu_LMAN_disconnect', ret: "void", arity: 1, params: "u8 bmDisconnectSlot" },
  { name: 'rfu_LMAN_reflectCommunicationStatus', ret: "void", arity: 1, params: "u8 bm_disconnectedSlot" },
  { name: 'rfu_LMAN_checkNICommunicateStatus', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_LMAN_managerChangeAgbClockMaster', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_LMAN_REQBN_softReset_and_checkID', ret: "u32", arity: 0, params: "void" },
  { name: 'rfu_LMAN_REQ_sendData', ret: "void", arity: 1, params: "bool8 clockChangeFlag" },
  { name: 'rfu_LMAN_endManager', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_LMAN_initializeRFU', ret: "void", arity: 1, params: "INIT_PARAM *init_parameters" },
  { name: 'rfu_LMAN_powerDownRFU', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_LMAN_establishConnection', ret: "u8", arity: 4, params: "u8 parent_child, u16 connect_period, u16 name_accept_period, u16 *acceptable_serialNo_list" },
  { name: 'rfu_LMAN_CHILD_connectParent', ret: "u8", arity: 2, params: "u16 parentId, u16 connect_period" },
  { name: 'rfu_LMAN_PARENT_stopWaitLinkRecoveryAndDisconnect', ret: "UNUSED", arity: 1, params: "u8 bm_targetSlot" },
  { name: 'rfu_LMAN_stopManager', ret: "void", arity: 1, params: "u8 forced_stop_and_RFU_reset_flag" },
  { name: 'rfu_LMAN_linkWatcher', ret: "bool8", arity: 1, params: "u16 REQ_commandID" },
  { name: 'rfu_LMAN_syncVBlank', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_LMAN_manager_entity', ret: "void", arity: 1, params: "u32 rand" },
  { name: 'rfu_LMAN_setLinkRecovery', ret: "u8", arity: 2, params: "u8 enable_flag, u16 recovery_period" },
  { name: 'rfu_LMAN_setNIFailCounterLimit', ret: "UNUSED", arity: 1, params: "u16 NI_failCounter_limit" },
  { name: 'rfu_LMAN_setFastSearchParent', ret: "UNUSED", arity: 1, params: "u8 enable_flag" },
  { name: 'rfu_LMAN_requestChangeAgbClockMaster', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_LMAN_forceChangeSP', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'librfu.h',
  'link_rfu.h',
] as const;
