// AUTO-GENERATED from src/link_rfu_2.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/link_rfu_2.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const RFUSTATE_PARENT_FINALIZE_START = 17;
export const RFUSTATE_PARENT_FINALIZE = 18;
export const RFUSTATE_UR_CONNECT = 17;
export const RFUSTATE_UR_CONNECT_END = 18;
export const RFUSTATE_FINALIZED = 20;
/** Raw expr: `data[7]` */
export const tConnectingForChat_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const tDisconnectPlayers_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tDisconnectMode_EXPR = "data[1]";
/** Raw expr: `data[15]` */
export const tTime_EXPR = "data[15]";
/** Raw expr: `data[1]` */
export const tActivity_EXPR = "data[1]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_RFUSTATE_0 = {
  RFUSTATE_INIT: 0,
  RFUSTATE_INIT_END: 1,
  RFUSTATE_PARENT_CONNECT: 2,
  RFUSTATE_PARENT_CONNECT_END: 3,
  RFUSTATE_STOP_MANAGER: 4,
  RFUSTATE_STOP_MANAGER_END: 5,
  RFUSTATE_CHILD_CONNECT: 6,
  RFUSTATE_CHILD_CONNECT_END: 7,
  RFUSTATE_UNUSED: 8,
  RFUSTATE_RECONNECTED: 9,
  RFUSTATE_CONNECTED: 10,
  RFUSTATE_CHILD_TRY_JOIN: 11,
  RFUSTATE_CHILD_JOINED: 12,
  RFUSTATE_UR_PLAYER_EXCHANGE: 13,
  RFUSTATE_UR_STOP_MANAGER: 14,
  RFUSTATE_UR_STOP_MANAGER_END: 15,
  RFUSTATE_UR_FINALIZE: 16,
} as const;
export const ENUM_RECV_1 = {
  RECV_STATE_READY: 0,
  RECV_STATE_RECEIVING: 1,
  RECV_STATE_FINISHED: 2,
} as const;

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sSlotToLinkPlayerTableId: readonly number[] = [0,0,1,1,2,2,2,2,3] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'COMMON_DATA', type: "u32", name: 'gRfuAPIBuffer', isArray: true, init: "{0}" },
  { segment: 'COMMON_DATA', type: "struct RfuManager", name: 'gRfu', isArray: false, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "struct RfuGameData", name: 'gHostRfuGameData', isArray: false, init: "{}" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'gHostRfuUsername', isArray: true, init: "{}" },
  { segment: 'EWRAM_DATA', type: "INIT_PARAM", name: 'sRfuReqConfig', isArray: false, init: "{}" },
  { segment: 'EWRAM_DATA', type: "struct RfuDebug", name: 'sRfuDebug', isArray: false, init: "{}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ResetSendDataManager', ret: "void", arity: 1, params: "struct RfuBlockSend *" },
  { name: 'InitChildRecvBuffers', ret: "void", arity: 0, params: "void" },
  { name: 'InitParentSendData', ret: "void", arity: 0, params: "void" },
  { name: 'MSCCallback_Child', ret: "void", arity: 1, params: "u16" },
  { name: 'MSCCallback_Parent', ret: "void", arity: 1, params: "u16" },
  { name: 'UpdateBackupQueue', ret: "void", arity: 0, params: "void" },
  { name: 'Task_PlayerExchange', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_PlayerExchangeUpdate', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_PlayerExchangeChat', ret: "void", arity: 1, params: "u8" },
  { name: 'RfuHandleReceiveCommand', ret: "void", arity: 1, params: "u8" },
  { name: 'CallRfuFunc', ret: "void", arity: 0, params: "void" },
  { name: 'RfuPrepareSendBuffer', ret: "void", arity: 1, params: "u16" },
  { name: 'HandleBlockSend', ret: "void", arity: 0, params: "void" },
  { name: 'SendNextBlock', ret: "void", arity: 0, params: "void" },
  { name: 'SendLastBlock', ret: "void", arity: 0, params: "void" },
  { name: 'GetPartnerIndexByNameAndTrainerID', ret: "u8", arity: 2, params: "const u8 *, u16" },
  { name: 'UpdateChildStatuses', ret: "void", arity: 0, params: "void" },
  { name: 'GetJoinGroupStatus', ret: "s32", arity: 0, params: "void" },
  { name: 'ClearSelectedLinkPlayerIds', ret: "void", arity: 1, params: "u16" },
  { name: 'ValidateAndReceivePokemonSioInfo', ret: "void", arity: 1, params: "void *" },
  { name: 'ParentResetChildRecvMetadata', ret: "void", arity: 1, params: "s32" },
  { name: 'CB2_RfuIdle', ret: "void", arity: 0, params: "void" },
  { name: 'RfuReqDisconnectSlot', ret: "void", arity: 1, params: "u32" },
  { name: 'SendDisconnectCommand', ret: "void", arity: 2, params: "u32, u32" },
  { name: 'Task_TryConnectToUnionRoomParent', ret: "void", arity: 1, params: "u8" },
  { name: 'Debug_PrintEmpty', ret: "void", arity: 0, params: "void" },
  { name: 'Task_Idle', ret: "void", arity: 1, params: "u8" },
  { name: 'Debug_PrintString', ret: "void", arity: 3, params: "const void *str, u8 x, u8 y" },
  { name: 'Debug_PrintNum', ret: "void", arity: 4, params: "u16 num, u8 x, u8 y, u8 numDigits" },
  { name: 'ResetLinkRfuGFLayer', ret: "void", arity: 0, params: "void" },
  { name: 'InitRFU', ret: "void", arity: 0, params: "void" },
  { name: 'InitRFUAPI', ret: "void", arity: 0, params: "void" },
  { name: 'Task_ParentSearchForChildren', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Rfu_GetIndexOfNewestChild', ret: "s32", arity: 1, params: "u8 bits" },
  { name: 'SetLinkPlayerIdsFromSlots', ret: "void", arity: 2, params: "s32 baseSlots, s32 addSlots" },
  { name: 'Task_ChildSearchForParent', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_UnionRoomListen', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CreateTask', ret: "else", arity: 2, params: "Task_PlayerExchange, 5" },
  { name: 'LinkRfu_CreateConnectionAsParent', ret: "void", arity: 0, params: "void" },
  { name: 'LinkRfu_StopManagerBeforeEnteringChat', ret: "void", arity: 0, params: "void" },
  { name: 'LinkRfu_Shutdown', ret: "void", arity: 0, params: "void" },
  { name: 'CreateTask_ParentSearchForChildren', ret: "void", arity: 0, params: "void" },
  { name: 'CanTryReconnectParent', ret: "bool8", arity: 0, params: "void" },
  { name: 'TryReconnectParent', ret: "bool32", arity: 0, params: "void" },
  { name: 'CreateTask_ChildSearchForParent', ret: "void", arity: 0, params: "void" },
  { name: 'LmanAcceptSlotFlagIsNotZero', ret: "bool8", arity: 0, params: "void" },
  { name: 'LinkRfu_StopManagerAndFinalizeSlots', ret: "void", arity: 0, params: "void" },
  { name: 'WaitRfuState', ret: "bool32", arity: 1, params: "bool32 force" },
  { name: 'StopUnionRoomLinkManager', ret: "void", arity: 0, params: "void" },
  { name: 'ReadySendDataForSlots', ret: "UNUSED", arity: 1, params: "u8 slots" },
  { name: 'ReadAllPlayerRecvCmds', ret: "void", arity: 0, params: "void" },
  { name: 'MoveSendCmdToRecv', ret: "void", arity: 0, params: "void" },
  { name: 'IsRfuRecvQueueEmpty', ret: "bool32", arity: 0, params: "void" },
  { name: 'RfuMain1_Parent', ret: "bool32", arity: 0, params: "void" },
  { name: 'RfuMain2_Parent', ret: "bool32", arity: 0, params: "void" },
  { name: 'ChildBuildSendCmd', ret: "void", arity: 2, params: "u16 *sendCmd, u8 *dst" },
  { name: 'RfuMain1_Child', ret: "bool32", arity: 0, params: "void" },
  { name: 'HandleSendFailure', ret: "void", arity: 2, params: "u8 unused, u32 flags" },
  { name: 'Rfu_SetBlockReceivedFlag', ret: "void", arity: 1, params: "u8 linkPlayerId" },
  { name: 'Rfu_ResetBlockReceivedFlag', ret: "void", arity: 1, params: "u8 linkPlayerId" },
  { name: 'LoadLinkPlayerIds', ret: "u8", arity: 1, params: "const u8 *ids" },
  { name: 'SendKeysToRfu', ret: "void", arity: 0, params: "void" },
  { name: 'IsSendingKeysToRfu', ret: "bool32", arity: 0, params: "void" },
  { name: 'StartSendingKeysToRfu', ret: "void", arity: 0, params: "void" },
  { name: 'ClearLinkRfuCallback', ret: "void", arity: 0, params: "void" },
  { name: 'Rfu_BerryBlenderSendHeldKeys', ret: "void", arity: 0, params: "void" },
  { name: 'Rfu_SetBerryBlenderLinkCallback', ret: "void", arity: 0, params: "void" },
  { name: 'AreAllPlayersReadyToReceive', ret: "bool8", arity: 0, params: "void" },
  { name: 'AreAllPlayersFinishedReceiving', ret: "bool8", arity: 0, params: "void" },
  { name: 'Rfu_GetBlockReceivedStatus', ret: "u8", arity: 0, params: "void" },
  { name: 'Rfu_SendPacket', ret: "void", arity: 1, params: "void *data" },
  { name: 'Rfu_InitBlockSend', ret: "bool32", arity: 2, params: "const u8 *src, size_t size" },
  { name: 'Rfu_SendBlockRequest', ret: "bool8", arity: 1, params: "u8 type" },
  { name: 'RfuShutdownAfterDisconnect', ret: "void", arity: 0, params: "void" },
  { name: 'DisconnectRfu', ret: "void", arity: 0, params: "void" },
  { name: 'TryDisconnectRfu', ret: "void", arity: 0, params: "void" },
  { name: 'LinkRfu_FatalError', ret: "void", arity: 0, params: "void" },
  { name: 'WaitAllReadyToCloseLink', ret: "void", arity: 0, params: "void" },
  { name: 'SendReadyCloseLink', ret: "void", arity: 0, params: "void" },
  { name: 'Task_TryReadyCloseLink', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Rfu_SetCloseLinkCallback', ret: "void", arity: 0, params: "void" },
  { name: 'SendReadyExitStandbyUntilAllReady', ret: "void", arity: 0, params: "void" },
  { name: 'LinkLeaderReadyToExitStandby', ret: "void", arity: 0, params: "void" },
  { name: 'Rfu_LinkStandby', ret: "void", arity: 0, params: "void" },
  { name: 'Rfu_SetLinkStandbyCallback', ret: "void", arity: 0, params: "void" },
  { name: 'IsRfuSerialNumberValid', ret: "bool32", arity: 1, params: "u32 serialNo" },
  { name: 'Rfu_SetLinkRecovery', ret: "u8", arity: 1, params: "bool32 enable" },
  { name: 'Rfu_StopPartnerSearch', ret: "void", arity: 0, params: "void" },
  { name: 'Rfu_GetMultiplayerId', ret: "u8", arity: 0, params: "void" },
  { name: 'Rfu_GetLinkPlayerCount', ret: "u8", arity: 0, params: "void" },
  { name: 'IsLinkRfuTaskFinished', ret: "bool8", arity: 0, params: "void" },
  { name: 'CheckForLeavingGroupMembers', ret: "bool8", arity: 0, params: "void" },
  { name: 'RfuTryDisconnectLeavingChildren', ret: "bool32", arity: 0, params: "void" },
  { name: 'HasTrainerLeftPartnersList', ret: "bool32", arity: 2, params: "u16 trainerId, const u8 *name" },
  { name: 'SendRfuStatusToPartner', ret: "void", arity: 3, params: "u8 status, u16 trainerId, const u8 *name" },
  { name: 'SendLeaveGroupNotice', ret: "void", arity: 0, params: "void" },
  { name: 'WaitSendRfuStatusToPartner', ret: "u32", arity: 2, params: "u16 trainerId, const u8 *name" },
  { name: 'ReceiveRfuLinkPlayers', ret: "void", arity: 1, params: "const struct SioInfo *sioInfo" },
  { name: 'RfuCheckErrorStatus', ret: "void", arity: 0, params: "void" },
  { name: 'RfuMain1_UnionRoom', ret: "void", arity: 0, params: "void" },
  { name: 'RfuMain1', ret: "bool32", arity: 0, params: "void" },
  { name: 'RfuMain2', ret: "bool32", arity: 0, params: "void" },
  { name: 'SetHostRfuUsername', ret: "void", arity: 0, params: "void" },
  { name: 'ResetHostRfuGameData', ret: "void", arity: 0, params: "void" },
  { name: 'SetHostRfuGameData', ret: "void", arity: 3, params: "u8 activity, u32 partnerInfo, bool32 startedActivity" },
  { name: 'SetHostRfuWonderFlags', ret: "void", arity: 2, params: "bool32 hasNews, bool32 hasCard" },
  { name: 'SetTradeBoardRegisteredMonInfo', ret: "void", arity: 3, params: "u32 type, u32 species, u32 level" },
  { name: 'GetLinkPlayerInfoFlags', ret: "u8", arity: 1, params: "s32 playerId" },
  { name: 'GetOtherPlayersInfoFlags', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateGameData_GroupLockedIn', ret: "void", arity: 1, params: "bool8 startedActivity" },
  { name: 'UpdateGameData_SetActivity', ret: "void", arity: 3, params: "u8 activity, u32 partnerInfo, bool32 startedActivity" },
  { name: 'SetUnionRoomChatPlayerData', ret: "void", arity: 1, params: "u32 numPlayers" },
  { name: 'RfuSetErrorParams', ret: "void", arity: 1, params: "u32 errorInfo" },
  { name: 'ResetErrorState', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'RfuSetIgnoreError', ret: "void", arity: 1, params: "bool32 enable" },
  { name: 'DisconnectNewChild', ret: "void", arity: 0, params: "void" },
  { name: 'StartDisconnectNewChild', ret: "void", arity: 0, params: "void" },
  { name: 'LinkManagerCB_Parent', ret: "void", arity: 2, params: "u8 msg, u8 paramCount" },
  { name: 'LinkManagerCB_Child', ret: "void", arity: 2, params: "u8 msg, u8 unused1" },
  { name: 'GetNewChildrenInUnionRoomChat', ret: "u8", arity: 1, params: "s32 emptySlotMask" },
  { name: 'LinkManagerCB_UnionRoom', ret: "void", arity: 2, params: "u8 msg, u8 paramCount" },
  { name: 'RfuSetNormalDisconnectMode', ret: "void", arity: 0, params: "void" },
  { name: 'RfuSetStatus', ret: "void", arity: 2, params: "u8 status, u16 errorInfo" },
  { name: 'RfuGetStatus', ret: "u8", arity: 0, params: "void" },
  { name: 'RfuHasErrored', ret: "bool32", arity: 0, params: "void" },
  { name: 'Rfu_IsPlayerExchangeActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'Rfu_IsMaster', ret: "bool8", arity: 0, params: "void" },
  { name: 'RfuVSync', ret: "void", arity: 0, params: "void" },
  { name: 'ClearRecvCommands', ret: "void", arity: 0, params: "void" },
  { name: 'VBlank_RfuIdle', ret: "void", arity: 0, params: "void" },
  { name: 'Debug_RfuIdle', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'IsUnionRoomListenTaskActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'CreateTask_RfuIdle', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyTask_RfuIdle', ret: "void", arity: 0, params: "void" },
  { name: 'InitializeRfuLinkManager_LinkLeader', ret: "void", arity: 1, params: "u32 groupMax" },
  { name: 'InitializeRfuLinkManager_JoinGroup', ret: "void", arity: 0, params: "void" },
  { name: 'InitializeRfuLinkManager_EnterUnionRoom', ret: "void", arity: 0, params: "void" },
  { name: 'ReadU16', ret: "u16", arity: 1, params: "const void *ptr" },
  { name: 'RequestDisconnectSlotByTrainerNameAndId', ret: "void", arity: 2, params: "const u8 *name, u16 id" },
  { name: 'Rfu_DisconnectPlayerById', ret: "void", arity: 1, params: "u32 playerIdx" },
  { name: 'Task_SendDisconnectCommand', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_RfuReconnectWithParent', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CreateTask_RfuReconnectWithParent', ret: "void", arity: 2, params: "const u8 *name, u16 trainerId" },
  { name: 'IsPartnerActivityIncompatible', ret: "bool32", arity: 2, params: "s16 activity, struct RfuGameData *partner" },
  { name: 'TryConnectToUnionRoomParent', ret: "void", arity: 3, params: "const u8 *name, struct RfuGameData *parent, u8 activity" },
  { name: 'IsRfuRecoveringFromLinkLoss', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsRfuCommunicatingWithAllChildren', ret: "bool32", arity: 0, params: "void" },
  { name: 'Debug_PrintStatus', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'GetRfuSendQueueLength', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'GetRfuRecvQueueLength', ret: "u32", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_ChildSearchForParent',
  'Task_Idle',
  'Task_ParentSearchForChildren',
  'Task_PlayerExchange',
  'Task_PlayerExchangeChat',
  'Task_PlayerExchangeUpdate',
  'Task_RfuReconnectWithParent',
  'Task_SendDisconnectCommand',
  'Task_TryConnectToUnionRoomParent',
  'Task_TryReadyCloseLink',
  'Task_UnionRoomListen',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_RfuIdle',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'battle.h',
  'berry_blender.h',
  'decompress.h',
  'event_data.h',
  'gpu_regs.h',
  'librfu.h',
  'link.h',
  'link_rfu.h',
  'overworld.h',
  'random.h',
  'palette.h',
  'union_room.h',
  'string_util.h',
  'task.h',
  'text.h',
  'save.h',
  'mystery_gift_menu.h',
] as const;
