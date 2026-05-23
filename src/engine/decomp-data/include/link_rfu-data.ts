// AUTO-GENERATED from include/link_rfu.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/link_rfu.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const RFUCMD_MASK = 65280;
export const RFUCMD_SEND_PACKET = 12032;
export const RFUCMD_BLENDER_SEND_KEYS = 17408;
export const RFUCMD_READY_CLOSE_LINK = 24320;
export const RFUCMD_READY_EXIT_STANDBY = 26112;
export const RFUCMD_SEND_PLAYER_IDS = 30464;
export const RFUCMD_SEND_PLAYER_IDS_NEW = 30720;
export const RFUCMD_SEND_BLOCK_INIT = 34816;
export const RFUCMD_SEND_BLOCK = 35072;
export const RFUCMD_SEND_BLOCK_REQ = 41216;
export const RFUCMD_SEND_HELD_KEYS = 48640;
export const RFUCMD_DISCONNECT = 60672;
export const RFUCMD_DISCONNECT_PARENT = 60928;
export const RFU_SERIAL_GAME = 2;
export const RFU_SERIAL_WONDER_DISTRIBUTOR = 32637;
export const RFU_SERIAL_UNKNOWN = 0;
export const RFU_SERIAL_END = 65535;
export const COMM_SLOT_LENGTH = 14;
export const RECV_QUEUE_NUM_SLOTS = 32;
export const SEND_QUEUE_NUM_SLOTS = 40;
export const BACKUP_QUEUE_NUM_SLOTS = 2;
export const RFU_PACKET_SIZE = 6;
export const RFU_STATUS_OK = 0;
export const RFU_STATUS_FATAL_ERROR = 1;
export const RFU_STATUS_CONNECTION_ERROR = 2;
export const RFU_STATUS_CHILD_SEND_COMPLETE = 3;
export const RFU_STATUS_NEW_CHILD_DETECTED = 4;
export const RFU_STATUS_JOIN_GROUP_OK = 5;
export const RFU_STATUS_JOIN_GROUP_NO = 6;
export const RFU_STATUS_WAIT_ACK_JOIN_GROUP = 7;
export const RFU_STATUS_LEAVE_GROUP_NOTICE = 8;
export const RFU_STATUS_LEAVE_GROUP = 9;
export const RFU_STATUS_CHILD_LEAVE_READY = 10;
export const RFU_STATUS_CHILD_LEAVE = 11;
export const RFU_STATUS_ACK_JOIN_GROUP = 12;
/** Raw expr: `(1 << 8)` */
export const F_RFU_ERROR_1_EXPR = "(1 << 8)";
/** Raw expr: `(1 << 9)` */
export const F_RFU_ERROR_2_EXPR = "(1 << 9)";
/** Raw expr: `(1 << 10)` */
export const F_RFU_ERROR_3_EXPR = "(1 << 10)";
/** Raw expr: `(1 << 11)` */
export const F_RFU_ERROR_4_EXPR = "(1 << 11)";
/** Raw expr: `(1 << 12)` */
export const F_RFU_ERROR_5_EXPR = "(1 << 12)";
/** Raw expr: `(1 << 13)` */
export const F_RFU_ERROR_6_EXPR = "(1 << 13)";
/** Raw expr: `(1 << 14)` */
export const F_RFU_ERROR_7_EXPR = "(1 << 14)";
/** Raw expr: `(1 << 15)` */
export const F_RFU_ERROR_8_EXPR = "(1 << 15)";
export const PINFO_TID_MASK = 7;
export const PINFO_GENDER_SHIFT = 3;
/** Raw expr: `(1 << 7)` */
export const PINFO_ACTIVE_FLAG_EXPR = "(1 << 7)";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_RFU_0 = {
  RFU_DISCONNECT_NONE: 0,
  RFU_DISCONNECT_ERROR: 1,
  RFU_DISCONNECT_NORMAL: 2,
} as const;
export const ENUM_RFU_1 = {
  RFU_ERROR_STATE_NONE: 0,
  RFU_ERROR_STATE_OCCURRED: 1,
  RFU_ERROR_STATE_PROCESSED: 2,
  RFU_ERROR_STATE_DISCONNECTING: 3,
  RFU_ERROR_STATE_IGNORE: 4,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'WipeTrainerNameRecords', ret: "void", arity: 0, params: "void" },
  { name: 'InitRFUAPI', ret: "void", arity: 0, params: "void" },
  { name: 'LinkRfu_Shutdown', ret: "void", arity: 0, params: "void" },
  { name: 'Rfu_SetBlockReceivedFlag', ret: "void", arity: 1, params: "u8 linkPlayerId" },
  { name: 'Rfu_ResetBlockReceivedFlag', ret: "void", arity: 1, params: "u8 linkPlayerId" },
  { name: 'IsSendingKeysToRfu', ret: "bool32", arity: 0, params: "void" },
  { name: 'StartSendingKeysToRfu', ret: "void", arity: 0, params: "void" },
  { name: 'Rfu_SetBerryBlenderLinkCallback', ret: "void", arity: 0, params: "void" },
  { name: 'Rfu_GetBlockReceivedStatus', ret: "u8", arity: 0, params: "void" },
  { name: 'Rfu_InitBlockSend', ret: "bool32", arity: 2, params: "const u8 *src, size_t size" },
  { name: 'ClearLinkRfuCallback', ret: "void", arity: 0, params: "void" },
  { name: 'Rfu_GetLinkPlayerCount', ret: "u8", arity: 0, params: "void" },
  { name: 'Rfu_GetMultiplayerId', ret: "u8", arity: 0, params: "void" },
  { name: 'Rfu_SendBlockRequest', ret: "bool8", arity: 1, params: "u8 type" },
  { name: 'IsLinkRfuTaskFinished', ret: "bool8", arity: 0, params: "void" },
  { name: 'Rfu_IsMaster', ret: "bool8", arity: 0, params: "void" },
  { name: 'Rfu_SetCloseLinkCallback', ret: "void", arity: 0, params: "void" },
  { name: 'Rfu_SetLinkStandbyCallback', ret: "void", arity: 0, params: "void" },
  { name: 'ResetLinkRfuGFLayer', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateWirelessStatusIndicatorSprite', ret: "void", arity: 0, params: "void" },
  { name: 'InitRFU', ret: "void", arity: 0, params: "void" },
  { name: 'RfuMain1', ret: "bool32", arity: 0, params: "void" },
  { name: 'RfuMain2', ret: "bool32", arity: 0, params: "void" },
  { name: 'RfuHasErrored', ret: "bool32", arity: 0, params: "void" },
  { name: 'IsRfuRecvQueueEmpty', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetRfuRecvQueueLength', ret: "u32", arity: 0, params: "void" },
  { name: 'RfuVSync', ret: "void", arity: 0, params: "void" },
  { name: 'RfuSetIgnoreError', ret: "void", arity: 1, params: "bool32 enable" },
  { name: 'RfuGetStatus', ret: "u8", arity: 0, params: "void" },
  { name: 'UpdateGameData_GroupLockedIn', ret: "void", arity: 1, params: "bool8 startedActivity" },
  { name: 'RfuSetErrorParams', ret: "void", arity: 1, params: "u32 errorInfo" },
  { name: 'RfuSetStatus', ret: "void", arity: 2, params: "u8 status, u16 errorInfo" },
  { name: 'Rfu_SetLinkRecovery', ret: "u8", arity: 1, params: "bool32 enable" },
  { name: 'CopyHostRfuGameDataAndUsername', ret: "void", arity: 2, params: "struct RfuGameData *gameData, u8 *username" },
  { name: 'SetHostRfuGameData', ret: "void", arity: 3, params: "u8 activity, u32 partnerInfo, bool32 startedActivity" },
  { name: 'InitializeRfuLinkManager_LinkLeader', ret: "void", arity: 1, params: "u32 groupMax" },
  { name: 'IsRfuCommunicatingWithAllChildren', ret: "bool32", arity: 0, params: "void" },
  { name: 'LinkRfu_StopManagerAndFinalizeSlots', ret: "void", arity: 0, params: "void" },
  { name: 'RfuTryDisconnectLeavingChildren', ret: "bool32", arity: 0, params: "void" },
  { name: 'HasTrainerLeftPartnersList', ret: "bool32", arity: 2, params: "u16 trainerId, const u8 *name" },
  { name: 'SendRfuStatusToPartner', ret: "void", arity: 3, params: "u8 status, u16 trainerId, const u8 *name" },
  { name: 'WaitSendRfuStatusToPartner', ret: "u32", arity: 2, params: "u16 trainerId, const u8 *name" },
  { name: 'RequestDisconnectSlotByTrainerNameAndId', ret: "void", arity: 2, params: "const u8 *name, u16 id" },
  { name: 'LmanAcceptSlotFlagIsNotZero', ret: "bool8", arity: 0, params: "void" },
  { name: 'WaitRfuState', ret: "bool32", arity: 1, params: "bool32 force" },
  { name: 'GetOtherPlayersInfoFlags', ret: "void", arity: 0, params: "void" },
  { name: 'InitializeRfuLinkManager_JoinGroup', ret: "void", arity: 0, params: "void" },
  { name: 'SendLeaveGroupNotice', ret: "void", arity: 0, params: "void" },
  { name: 'SaveLinkTrainerNames', ret: "void", arity: 0, params: "void" },
  { name: 'LinkRfu_CreateConnectionAsParent', ret: "void", arity: 0, params: "void" },
  { name: 'LinkRfu_StopManagerBeforeEnteringChat', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateGameData_SetActivity', ret: "void", arity: 3, params: "u8 activity, u32 partnerInfo, bool32 startedActivity" },
  { name: 'CreateTask_RfuReconnectWithParent', ret: "void", arity: 2, params: "const u8 *name, u16 trainerId" },
  { name: 'SetHostRfuWonderFlags', ret: "void", arity: 2, params: "bool32 hasNews, bool32 hasCard" },
  { name: 'ResetHostRfuGameData', ret: "void", arity: 0, params: "void" },
  { name: 'SetTradeBoardRegisteredMonInfo', ret: "void", arity: 3, params: "u32 type, u32 species, u32 level" },
  { name: 'InitializeRfuLinkManager_EnterUnionRoom', ret: "void", arity: 0, params: "void" },
  { name: 'TryConnectToUnionRoomParent', ret: "void", arity: 3, params: "const u8 *name, struct RfuGameData *parent, u8 activity" },
  { name: 'IsUnionRoomListenTaskActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'Rfu_SendPacket', ret: "void", arity: 1, params: "void *data" },
  { name: 'PlayerHasMetTrainerBefore', ret: "bool32", arity: 2, params: "u16 id, u8 *name" },
  { name: 'Rfu_DisconnectPlayerById', ret: "void", arity: 1, params: "u32 playerIdx" },
  { name: 'GetLinkPlayerInfoFlags', ret: "u8", arity: 1, params: "s32 playerId" },
  { name: 'StopUnionRoomLinkManager', ret: "void", arity: 0, params: "void" },
  { name: 'Rfu_GetCompatiblePlayerData', ret: "bool8", arity: 3, params: "struct RfuGameData *gameData, u8 *username, u8 idx" },
  { name: 'Rfu_GetWonderDistributorPlayerData', ret: "bool8", arity: 3, params: "struct RfuGameData *gameData, u8 *username, u8 idx" },
  { name: 'Rfu_GetIndexOfNewestChild', ret: "s32", arity: 1, params: "u8 bits" },
  { name: 'CreateTask_RfuIdle', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyTask_RfuIdle', ret: "void", arity: 0, params: "void" },
  { name: 'ClearRecvCommands', ret: "void", arity: 0, params: "void" },
  { name: 'LinkRfu_FatalError', ret: "void", arity: 0, params: "void" },
  { name: 'Rfu_IsPlayerExchangeActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'Rfu_StopPartnerSearch', ret: "void", arity: 0, params: "void" },
  { name: 'RfuSetNormalDisconnectMode', ret: "void", arity: 0, params: "void" },
  { name: 'SetUnionRoomChatPlayerData', ret: "void", arity: 1, params: "u32 numPlayers" },
  { name: 'IsRfuSerialNumberValid', ret: "bool32", arity: 1, params: "u32 serialNo" },
  { name: 'IsRfuRecoveringFromLinkLoss', ret: "bool8", arity: 0, params: "void" },
  { name: 'RfuRecvQueue_Reset', ret: "void", arity: 1, params: "struct RfuRecvQueue *queue" },
  { name: 'RfuSendQueue_Reset', ret: "void", arity: 1, params: "struct RfuSendQueue *queue" },
  { name: 'RfuRecvQueue_Enqueue', ret: "void", arity: 2, params: "struct RfuRecvQueue *queue, u8 *data" },
  { name: 'RfuSendQueue_Enqueue', ret: "void", arity: 2, params: "struct RfuSendQueue *queue, u8 *data" },
  { name: 'RfuRecvQueue_Dequeue', ret: "bool8", arity: 2, params: "struct RfuRecvQueue *queue, u8 *src" },
  { name: 'RfuSendQueue_Dequeue', ret: "bool8", arity: 2, params: "struct RfuSendQueue *queue, u8 *src" },
  { name: 'RfuBackupQueue_Enqueue', ret: "void", arity: 2, params: "struct RfuBackupQueue *queue, const u8 *data" },
  { name: 'RfuBackupQueue_Dequeue', ret: "bool8", arity: 2, params: "struct RfuBackupQueue *queue, u8 *src" },
  { name: 'InitHostRfuGameData', ret: "void", arity: 4, params: "struct RfuGameData *data, u8 activity, bool32 startedActivity, s32 partnerInfo" },
  { name: 'CreateWirelessStatusIndicatorSprite', ret: "void", arity: 2, params: "u8 x, u8 y" },
  { name: 'DestroyWirelessStatusIndicatorSprite', ret: "void", arity: 0, params: "void" },
  { name: 'LoadWirelessStatusIndicatorSpriteGfx', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'librfu.h',
  'link.h',
  'AgbRfu_LinkManager.h',
] as const;
