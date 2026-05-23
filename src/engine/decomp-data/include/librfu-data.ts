// AUTO-GENERATED from include/librfu.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/librfu.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const LIBRFU_VERSION = 1026;
export const ID_RESET_REQ = 16;
export const ID_LINK_STATUS_REQ = 17;
export const ID_VERSION_STATUS_REQ = 18;
export const ID_SYSTEM_STATUS_REQ = 19;
export const ID_SLOT_STATUS_REQ = 20;
export const ID_CONFIG_STATUS_REQ = 21;
export const ID_GAME_CONFIG_REQ = 22;
export const ID_SYSTEM_CONFIG_REQ = 23;
export const ID_SC_START_REQ = 25;
export const ID_SC_POLL_REQ = 26;
export const ID_SC_END_REQ = 27;
export const ID_SP_START_REQ = 28;
export const ID_SP_POLL_REQ = 29;
export const ID_SP_END_REQ = 30;
export const ID_CP_START_REQ = 31;
export const ID_CP_POLL_REQ = 32;
export const ID_CP_END_REQ = 33;
export const ID_DATA_TX_REQ = 36;
export const ID_DATA_TX_AND_CHANGE_REQ = 37;
export const ID_DATA_RX_REQ = 38;
export const ID_MS_CHANGE_REQ = 39;
export const ID_DISCONNECT_REQ = 48;
export const ID_TEST_MODE_REQ = 49;
export const ID_CPR_START_REQ = 50;
export const ID_CPR_POLL_REQ = 51;
export const ID_CPR_END_REQ = 52;
export const ID_UNK35_REQ = 53;
export const ID_UNK36_REQ = 54;
export const ID_RESUME_RETRANSMIT_AND_CHANGE_REQ = 55;
export const ID_STOP_MODE_REQ = 61;
export const ID_CLOCK_SLAVE_MS_CHANGE_ERROR_BY_DMA_REQ = 255;
export const ID_DISCONNECTED_AND_CHANGE_REQ = 41;
export const ID_DATA_READY_AND_CHANGE_REQ = 40;
export const ID_DRAC_REQ_WITH_ACK_FLAG = 296;
export const RFU_ID = 32769;
export const RFU_MBOOT_DOWNLOADER_SERIAL_NO = 0;
export const RFU_API_BUFF_SIZE_RAM = 3684;
export const RFU_API_BUFF_SIZE_ROM = 1284;
export const RFU_CHILD_MAX = 4;
export const RFU_GAME_NAME_LENGTH = 13;
export const RFU_USER_NAME_LENGTH = 8;
export const RFU_H_DMA_MAX_CPU_CYCLE = 42;
export const RFU_LINK_ICON_LEVEL4_MAX = 255;
export const RFU_LINK_ICON_LEVEL4_MIN = 229;
export const RFU_LINK_ICON_LEVEL3_MAX = 228;
export const RFU_LINK_ICON_LEVEL3_MIN = 127;
export const RFU_LINK_ICON_LEVEL2_MAX = 126;
export const RFU_LINK_ICON_LEVEL2_MIN = 25;
export const RFU_LINK_ICON_LEVEL1_MAX = 24;
export const RFU_LINK_ICON_LEVEL1_MIN = 0;
export const RFU_MBOOT_FLAG = 1;
export const AVAIL_SLOT4 = 0;
export const AVAIL_SLOT3 = 1;
export const AVAIL_SLOT2 = 2;
export const AVAIL_SLOT1 = 3;
export const TYPE_UNI = 16;
export const TYPE_NI = 32;
export const TYPE_UNI_SEND = 1;
export const TYPE_UNI_RECV = 2;
export const TYPE_NI_SEND = 4;
export const TYPE_NI_RECV = 8;
export const REASON_DISCONNECTED = 0;
export const REASON_LINK_LOSS = 1;
export const AGB_CLK_SLAVE = 0;
export const AGB_CLK_MASTER = 1;
export const ERR_REQ_CMD = 0;
/** Raw expr: `(ERR_REQ_CMD | 0x0001)` */
export const ERR_REQ_CMD_CLOCK_DRIFT_EXPR = "(ERR_REQ_CMD | 0x0001)";
/** Raw expr: `(ERR_REQ_CMD | 0x0002)` */
export const ERR_REQ_CMD_SENDING_EXPR = "(ERR_REQ_CMD | 0x0002)";
/** Raw expr: `(ERR_REQ_CMD | 0x0003)` */
export const ERR_REQ_CMD_ACK_REJECTION_EXPR = "(ERR_REQ_CMD | 0x0003)";
/** Raw expr: `(ERR_REQ_CMD | 0x0004)` */
export const ERR_REQ_CMD_CLOCK_SLAVE_EXPR = "(ERR_REQ_CMD | 0x0004)";
/** Raw expr: `(ERR_REQ_CMD | 0x0006)` */
export const ERR_REQ_CMD_IME_DISABLE_EXPR = "(ERR_REQ_CMD | 0x0006)";
export const ERR_PID_NOT_FOUND = 256;
export const ERR_RFU_API_BUFF_SIZE = 1;
export const ERR_RFU_API_BUFF_ADR = 2;
export const ERR_ID_CHECK_IME_DISABLE = 4294967295;
/** Raw expr: `(ERR_REQ_CMD | 0x0010)` */
export const ERR_REQ_CMD_ID_EXPR = "(ERR_REQ_CMD | 0x0010)";
export const ERR_MODE = 768;
/** Raw expr: `(ERR_MODE | 0x0000)` */
export const ERR_MODE_NOT_PARENT_EXPR = "(ERR_MODE | 0x0000)";
/** Raw expr: `(ERR_MODE | 0x0001)` */
export const ERR_MODE_NOT_CONNECTED_EXPR = "(ERR_MODE | 0x0001)";
export const ERR_SLOT = 1024;
/** Raw expr: `(ERR_SLOT | 0x0000)` */
export const ERR_SLOT_NO_EXPR = "(ERR_SLOT | 0x0000)";
/** Raw expr: `(ERR_SLOT | 0x0001)` */
export const ERR_SLOT_NOT_CONNECTED_EXPR = "(ERR_SLOT | 0x0001)";
/** Raw expr: `(ERR_SLOT | 0x0002)` */
export const ERR_SLOT_BUSY_EXPR = "(ERR_SLOT | 0x0002)";
/** Raw expr: `(ERR_SLOT | 0x0003)` */
export const ERR_SLOT_NOT_SENDING_EXPR = "(ERR_SLOT | 0x0003)";
/** Raw expr: `(ERR_SLOT | 0x0004)` */
export const ERR_SLOT_TARGET_EXPR = "(ERR_SLOT | 0x0004)";
export const ERR_SUBFRAME_SIZE = 1280;
export const ERR_COMM_TYPE = 1536;
export const ERR_DATA_RECV = 1792;
/** Raw expr: `(ERR_DATA_RECV | 0x0001)` */
export const ERR_RECV_BUFF_OVER_EXPR = "(ERR_DATA_RECV | 0x0001)";
/** Raw expr: `(ERR_DATA_RECV | 0x0002)` */
export const ERR_RECV_REPLY_SUBFRAME_SIZE_EXPR = "(ERR_DATA_RECV | 0x0002)";
/** Raw expr: `(ERR_DATA_RECV | 0x0008)` */
export const ERR_RECV_DATA_OVERWRITED_EXPR = "(ERR_DATA_RECV | 0x0008)";
/** Raw expr: `(ERR_DATA_RECV | 0x0001 | 0x0008)` */
export const ERR_RECV_UNK_EXPR = "(ERR_DATA_RECV | 0x0001 | 0x0008)";
export const MODE_NEUTRAL = 255;
export const MODE_CHILD = 0;
export const MODE_PARENT = 1;
export const LLF_P_SIZE = 87;
export const LLF_C_SIZE = 16;
export const LLSF_P_HEADER_SIZE = 3;
export const LLSF_C_HEADER_SIZE = 2;
export const LCOM_NULL = 0;
export const LCOM_NI_START = 1;
export const LCOM_NI = 2;
export const LCOM_NI_END = 3;
export const LCOM_UNI = 4;
export const SLOT_BUSY_FLAG = 32768;
export const SLOT_SEND_FLAG = 32;
export const SLOT_RECV_FLAG = 64;
export const SLOT_STATE_READY = 0;
/** Raw expr: `(SLOT_BUSY_FLAG | SLOT_SEND_FLAG | LCOM_NI_START)` */
export const SLOT_STATE_SEND_START_EXPR = "(SLOT_BUSY_FLAG | SLOT_SEND_FLAG | LCOM_NI_START)";
/** Raw expr: `(SLOT_BUSY_FLAG | SLOT_SEND_FLAG | LCOM_NI)` */
export const SLOT_STATE_SENDING_EXPR = "(SLOT_BUSY_FLAG | SLOT_SEND_FLAG | LCOM_NI)";
/** Raw expr: `(SLOT_BUSY_FLAG | SLOT_SEND_FLAG | LCOM_NI_END)` */
export const SLOT_STATE_SEND_LAST_EXPR = "(SLOT_BUSY_FLAG | SLOT_SEND_FLAG | LCOM_NI_END)";
/** Raw expr: `(SLOT_BUSY_FLAG | SLOT_SEND_FLAG | LCOM_NULL)` */
export const SLOT_STATE_SEND_NULL_EXPR = "(SLOT_BUSY_FLAG | SLOT_SEND_FLAG | LCOM_NULL)";
/** Raw expr: `(                 SLOT_SEND_FLAG | 0x006)` */
export const SLOT_STATE_SEND_SUCCESS_EXPR = "(                 SLOT_SEND_FLAG | 0x006)";
/** Raw expr: `(                 SLOT_SEND_FLAG | 0x007)` */
export const SLOT_STATE_SEND_FAILED_EXPR = "(                 SLOT_SEND_FLAG | 0x007)";
/** Raw expr: `(SLOT_BUSY_FLAG | SLOT_RECV_FLAG | LCOM_NI_START)` */
export const SLOT_STATE_RECV_START_EXPR = "(SLOT_BUSY_FLAG | SLOT_RECV_FLAG | LCOM_NI_START)";
/** Raw expr: `(SLOT_BUSY_FLAG | SLOT_RECV_FLAG | LCOM_NI)` */
export const SLOT_STATE_RECEIVING_EXPR = "(SLOT_BUSY_FLAG | SLOT_RECV_FLAG | LCOM_NI)";
/** Raw expr: `(SLOT_BUSY_FLAG | SLOT_RECV_FLAG | LCOM_NI_END)` */
export const SLOT_STATE_RECV_LAST_EXPR = "(SLOT_BUSY_FLAG | SLOT_RECV_FLAG | LCOM_NI_END)";
/** Raw expr: `(                 SLOT_RECV_FLAG | 0x006)` */
export const SLOT_STATE_RECV_SUCCESS_EXPR = "(                 SLOT_RECV_FLAG | 0x006)";
/** Raw expr: `(                 SLOT_RECV_FLAG | 0x007)` */
export const SLOT_STATE_RECV_FAILED_EXPR = "(                 SLOT_RECV_FLAG | 0x007)";
/** Raw expr: `(SLOT_RECV_FLAG | 0x008)` */
export const SLOT_STATE_RECV_SUCCESS_AND_SENDSIDE_UNKNOWN_EXPR = "(SLOT_RECV_FLAG | 0x008)";
/** Raw expr: `(                 SLOT_RECV_FLAG | 0x009)` */
export const SLOT_STATE_RECV_IGNORE_EXPR = "(                 SLOT_RECV_FLAG | 0x009)";
/** Raw expr: `(SLOT_BUSY_FLAG | SLOT_SEND_FLAG | LCOM_UNI)` */
export const SLOT_STATE_SEND_UNI_EXPR = "(SLOT_BUSY_FLAG | SLOT_SEND_FLAG | LCOM_UNI)";
export const WINDOW_COUNT = 4;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'AgbRFU_checkID', ret: "s32", arity: 1, params: "u8 maxTries" },
  { name: 'rfu_initializeAPI', ret: "u16", arity: 4, params: "u32 *APIBuffer, u16 buffByteSize, IntrFunc *sioIntrTable_p, bool8 copyInterruptToRam" },
  { name: 'rfu_setTimerInterrupt', ret: "void", arity: 2, params: "u8 timerNo, IntrFunc *timerIntrTable_p" },
  { name: 'rfu_syncVBlank', ret: "u16", arity: 0, params: "void" },
  { name: 'rfu_waitREQComplete', ret: "u16", arity: 0, params: "void" },
  { name: 'rfu_REQBN_softReset_and_checkID', ret: "u32", arity: 0, params: "void" },
  { name: 'rfu_REQ_reset', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_REQ_stopMode', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_REQ_configSystem', ret: "void", arity: 3, params: "u16 availSlotFlag, u8 maxMFrame, u8 mcTimer" },
  { name: 'rfu_REQ_configGameData', ret: "void", arity: 4, params: "u8 mbootFlag, u16 serialNo, const u8 *gname, const u8 *uname" },
  { name: 'rfu_REQ_startSearchChild', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_REQ_pollSearchChild', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_REQ_endSearchChild', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_REQ_startSearchParent', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_REQ_pollSearchParent', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_REQ_endSearchParent', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_REQ_startConnectParent', ret: "void", arity: 1, params: "u16 pid" },
  { name: 'rfu_REQ_pollConnectParent', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_REQ_endConnectParent', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_getConnectParentStatus', ret: "u16", arity: 2, params: "u8 *status, u8 *connectSlotNo" },
  { name: 'rfu_REQ_CHILD_startConnectRecovery', ret: "void", arity: 1, params: "u8 bmRecoverySlot" },
  { name: 'rfu_REQ_CHILD_pollConnectRecovery', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_REQ_CHILD_endConnectRecovery', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_CHILD_getConnectRecoveryStatus', ret: "u16", arity: 1, params: "u8 *status" },
  { name: 'rfu_REQBN_watchLink', ret: "u16", arity: 4, params: "u16 reqCommandId, u8 *bmLinkLossSlot, u8 *linkLossReason, u8 *parentBmLinkRecoverySlot" },
  { name: 'rfu_REQ_disconnect', ret: "void", arity: 1, params: "u8 bmDisconnectSlot" },
  { name: 'rfu_REQ_changeMasterSlave', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_getMasterSlave', ret: "bool8", arity: 0, params: "void" },
  { name: 'rfu_clearAllSlot', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_clearSlot', ret: "u16", arity: 2, params: "u8 connTypeFlag, u8 slotStatusIndex" },
  { name: 'rfu_setRecvBuffer', ret: "u16", arity: 4, params: "u8 connType, u8 slotNo, void *buffer, u32 buffSize" },
  { name: 'rfu_UNI_setSendData', ret: "u16", arity: 3, params: "u8 bmSendSlot, const void *src, u8 size" },
  { name: 'rfu_UNI_readySendData', ret: "void", arity: 1, params: "u8 slotStatusIndex" },
  { name: 'rfu_UNI_changeAndReadySendData', ret: "u16", arity: 3, params: "u8 slotStatusIndex, const void *src, u8 size" },
  { name: 'rfu_UNI_PARENT_getDRAC_ACK', ret: "u16", arity: 1, params: "u8 *ackFlag" },
  { name: 'rfu_UNI_clearRecvNewDataFlag', ret: "void", arity: 1, params: "u8 slotStatusIndex" },
  { name: 'rfu_NI_setSendData', ret: "u16", arity: 4, params: "u8 bmSendSlot, u8 subFrameSize, const void *src, u32 size" },
  { name: 'rfu_NI_CHILD_setSendGameName', ret: "u16", arity: 2, params: "u8 slotNo, u8 subFrameSize" },
  { name: 'rfu_NI_stopReceivingData', ret: "u16", arity: 1, params: "u8 slotStatusIndex" },
  { name: 'rfu_changeSendTarget', ret: "u16", arity: 3, params: "u8 connType, u8 slotStatusIndex, u8 bmNewTgtSlot" },
  { name: 'rfu_REQ_sendData', ret: "void", arity: 1, params: "bool8 clockChangeFlag" },
  { name: 'rfu_REQ_PARENT_resumeRetransmitAndChange', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_REQ_recvData', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_MBOOT_CHILD_inheritanceLinkStatus', ret: "u16", arity: 0, params: "void" },
  { name: 'rfu_REQ_RFUStatus', ret: "void", arity: 0, params: "void" },
  { name: 'rfu_getRFUStatus', ret: "u16", arity: 1, params: "u8 *rfuState" },
  { name: 'rfu_REQ_noise', ret: "void", arity: 0, params: "void" },
  { name: 'IntrSIO32', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_init_all', ret: "void", arity: 3, params: "struct RfuIntrStruct *interruptStruct, IntrFunc *interrupt, bool8 copyInterruptToRam" },
  { name: 'STWI_set_MS_mode', ret: "void", arity: 1, params: "u8 mode" },
  { name: 'STWI_init_Callback_M', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_init_Callback_S', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_set_Callback_M', ret: "void", arity: 1, params: "void *callbackM" },
  { name: 'STWI_init_timer', ret: "void", arity: 2, params: "IntrFunc *interrupt, s32 timerSelect" },
  { name: 'AgbRFU_SoftReset', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_read_status', ret: "u16", arity: 1, params: "u8 index" },
  { name: 'STWI_poll_CommandEnd', ret: "u16", arity: 0, params: "void" },
  { name: 'STWI_send_DataRxREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_MS_ChangeREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_StopModeREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_SystemStatusREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_GameConfigREQ', ret: "void", arity: 2, params: "const u8 *serial_gname, const u8 *uname" },
  { name: 'STWI_send_ResetREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_LinkStatusREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_VersionStatusREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_SlotStatusREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_ConfigStatusREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_ResumeRetransmitAndChangeREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_SystemConfigREQ', ret: "void", arity: 3, params: "u16 availSlotFlag, u8 maxMFrame, u8 mcTimer" },
  { name: 'STWI_send_SC_StartREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_SC_PollingREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_SC_EndREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_SP_StartREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_SP_PollingREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_SP_EndREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_CP_StartREQ', ret: "void", arity: 1, params: "u16 unk1" },
  { name: 'STWI_send_CP_PollingREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_CP_EndREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_DataTxREQ', ret: "void", arity: 2, params: "const void *in, u8 size" },
  { name: 'STWI_send_DataTxAndChangeREQ', ret: "void", arity: 2, params: "const void *in, u8 size" },
  { name: 'STWI_send_DataReadyAndChangeREQ', ret: "void", arity: 1, params: "u8 unk" },
  { name: 'STWI_send_DisconnectedAndChangeREQ', ret: "void", arity: 2, params: "u8 unk0, u8 unk1" },
  { name: 'STWI_send_DisconnectREQ', ret: "void", arity: 1, params: "u8 unk" },
  { name: 'STWI_send_TestModeREQ', ret: "void", arity: 2, params: "u8 unk0, u8 unk1" },
  { name: 'STWI_send_CPR_StartREQ', ret: "void", arity: 3, params: "u16 unk0, u16 unk1, u8 unk2" },
  { name: 'STWI_send_CPR_PollingREQ', ret: "void", arity: 0, params: "void" },
  { name: 'STWI_send_CPR_EndREQ', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'main.h',
] as const;
