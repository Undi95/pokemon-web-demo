// AUTO-GENERATED from include/link.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/link.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MAX_LINK_PLAYERS = 4;
export const MAX_RFU_PLAYERS = 5;
export const CMD_LENGTH = 8;
export const QUEUE_CAPACITY = 50;
export const OVERWORLD_RECV_QUEUE_MAX = 3;
export const BLOCK_BUFFER_SIZE = 256;
export const LINK_SLAVE = 0;
export const LINK_MASTER = 8;
export const LINK_STAT_LOCAL_ID = 3;
export const LINK_STAT_PLAYER_COUNT = 28;
export const LINK_STAT_PLAYER_COUNT_SHIFT = 2;
export const LINK_STAT_MASTER = 32;
export const LINK_STAT_MASTER_SHIFT = 5;
export const LINK_STAT_CONN_ESTABLISHED = 64;
export const LINK_STAT_CONN_ESTABLISHED_SHIFT = 6;
export const LINK_STAT_RECEIVED_NOTHING = 256;
export const LINK_STAT_RECEIVED_NOTHING_SHIFT = 8;
export const LINK_STAT_UNK_FLAG_9 = 512;
export const LINK_STAT_UNK_FLAG_9_SHIFT = 9;
export const LINK_STAT_ERRORS = 520192;
export const LINK_STAT_ERRORS_SHIFT = 12;
export const LINK_STAT_ERROR_HARDWARE = 4096;
export const LINK_STAT_ERROR_HARDWARE_SHIFT = 12;
export const LINK_STAT_ERROR_CHECKSUM = 8192;
export const LINK_STAT_ERROR_CHECKSUM_SHIFT = 13;
export const LINK_STAT_ERROR_QUEUE_FULL = 16384;
export const LINK_STAT_ERROR_QUEUE_FULL_SHIFT = 14;
export const LINK_STAT_ERROR_LAG_MASTER = 65536;
export const LINK_STAT_ERROR_LAG_MASTER_SHIFT = 16;
export const LINK_STAT_ERROR_INVALID_ID = 131072;
export const LINK_STAT_ERROR_INVALID_ID_SHIFT = 17;
export const LINK_STAT_ERROR_LAG_SLAVE = 262144;
export const LINK_STAT_ERROR_LAG_SLAVE_SHIFT = 18;
export const LINKCMD_BLENDER_STOP = 4369;
export const LINKCMD_SEND_LINK_TYPE = 8738;
export const LINKCMD_BLENDER_SCORE_MISS = 9029;
export const LINKCMD_READY_EXIT_STANDBY = 12286;
export const LINKCMD_SEND_PACKET = 12287;
export const LINKCMD_BLENDER_SEND_KEYS = 17476;
export const LINKCMD_BLENDER_SCORE_BEST = 17699;
export const LINKCMD_BLENDER_SCORE_GOOD = 21554;
export const LINKCMD_DUMMY_1 = 21845;
export const LINKCMD_DUMMY_2 = 21862;
export const LINKCMD_READY_CLOSE_LINK = 24575;
export const LINKCMD_SEND_EMPTY = 26214;
export const LINKCMD_SEND_0xEE = 30583;
export const LINKCMD_BLENDER_PLAY_AGAIN = 30585;
export const LINKCMD_COUNTDOWN = 32767;
export const LINKCMD_CONT_BLOCK = 34952;
export const LINKCMD_BLENDER_NO_BERRIES = 39321;
export const LINKCMD_BLENDER_NO_PBLOCK_SPACE = 43690;
export const LINKCMD_SEND_ITEM = 43691;
export const LINKCMD_READY_TO_TRADE = 43707;
export const LINKCMD_READY_FINISH_TRADE = 43981;
export const LINKCMD_INIT_BLOCK = 48059;
export const LINKCMD_READY_CANCEL_TRADE = 48076;
export const LINKCMD_SEND_HELD_KEYS = 51966;
export const LINKCMD_SEND_BLOCK_REQ = 52428;
export const LINKCMD_START_TRADE = 52445;
export const LINKCMD_CONFIRM_FINISH_TRADE = 56506;
export const LINKCMD_SET_MONS_TO_TRADE = 56797;
export const LINKCMD_PLAYER_CANCEL_TRADE = 56814;
export const LINKCMD_REQUEST_CANCEL = 61098;
export const LINKCMD_BOTH_CANCEL_TRADE = 61115;
export const LINKCMD_PARTNER_CANCEL_TRADE = 61132;
export const LINKCMD_NONE = 61439;
export const LINKTYPE_TRADE = 4369;
export const LINKTYPE_TRADE_CONNECTING = 4386;
export const LINKTYPE_TRADE_SETUP = 4403;
export const LINKTYPE_TRADE_DISCONNECTED = 4420;
export const LINKTYPE_BATTLE = 8721;
export const LINKTYPE_UNUSED_BATTLE = 8738;
export const LINKTYPE_SINGLE_BATTLE = 8755;
export const LINKTYPE_DOUBLE_BATTLE = 8772;
export const LINKTYPE_MULTI_BATTLE = 8789;
export const LINKTYPE_BATTLE_TOWER_50 = 8806;
export const LINKTYPE_BATTLE_TOWER_OPEN = 8823;
export const LINKTYPE_BATTLE_TOWER = 8840;
export const LINKTYPE_RECORD_MIX_BEFORE = 13073;
export const LINKTYPE_RECORD_MIX_AFTER = 13090;
export const LINKTYPE_BERRY_BLENDER_SETUP = 17425;
export const LINKTYPE_BERRY_BLENDER = 17442;
export const LINKTYPE_MYSTERY_EVENT = 21761;
export const LINKTYPE_EREADER_FRLG = 21762;
export const LINKTYPE_EREADER_EM = 21763;
export const LINKTYPE_CONTEST_GMODE = 26113;
export const LINKTYPE_CONTEST_EMODE = 26114;
export const MASTER_HANDSHAKE = 36863;
export const SLAVE_HANDSHAKE = 47520;
export const EREADER_HANDSHAKE = 52432;
/** Raw expr: `((struct SioMultiCnt *)REG_ADDR_SIOCNT)` */
export const SIO_MULTI_CNT_EXPR = "((struct SioMultiCnt *)REG_ADDR_SIOCNT)";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_BLOCK_0 = {
  BLOCK_REQ_SIZE_NONE: 0,
  BLOCK_REQ_SIZE_200: 1,
  BLOCK_REQ_SIZE_100: 2,
  BLOCK_REQ_SIZE_220: 3,
  BLOCK_REQ_SIZE_40: 4,
} as const;
export const ENUM_LINK_1 = {
  LINK_STATE_START0: 0,
  LINK_STATE_START1: 1,
  LINK_STATE_HANDSHAKE: 2,
  LINK_STATE_INIT_TIMER: 3,
  LINK_STATE_CONN_ESTABLISHED: 4,
} as const;
export const ENUM_EXCHANGE_2 = {
  EXCHANGE_NOT_STARTED: 0,
  EXCHANGE_COMPLETE: 1,
  EXCHANGE_TIMED_OUT: 2,
  EXCHANGE_DIFF_SELECTIONS: 3,
  EXCHANGE_PLAYER_NOT_READY: 4,
  EXCHANGE_PARTNER_NOT_READY: 5,
  EXCHANGE_WRONG_NUM_PLAYERS: 6,
  EXCHANGE_STAT_7: 7,
} as const;
export const ENUM_QUEUE_3 = {
  QUEUE_FULL_NONE: 0,
  QUEUE_FULL_SEND: 1,
  QUEUE_FULL_RECV: 2,
} as const;
export const ENUM_LAG_4 = {
  LAG_NONE: 0,
  LAG_MASTER: 1,
  LAG_SLAVE: 2,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'IsWirelessAdapterConnected', ret: "bool8", arity: 0, params: "void" },
  { name: 'Task_DestroySelf', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'OpenLink', ret: "void", arity: 0, params: "void" },
  { name: 'CloseLink', ret: "void", arity: 0, params: "void" },
  { name: 'LinkMain2', ret: "u16", arity: 1, params: "const u16 *heldKeys" },
  { name: 'ClearLinkCallback', ret: "void", arity: 0, params: "void" },
  { name: 'ClearLinkCallback_2', ret: "void", arity: 0, params: "void" },
  { name: 'GetLinkPlayerCount', ret: "u8", arity: 0, params: "void" },
  { name: 'OpenLinkTimed', ret: "void", arity: 0, params: "void" },
  { name: 'GetLinkPlayerDataExchangeStatusTimed', ret: "u8", arity: 2, params: "int minPlayers, int maxPlayers" },
  { name: 'IsLinkPlayerDataExchangeComplete', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetLinkPlayerTrainerId', ret: "u32", arity: 1, params: "u8 who" },
  { name: 'ResetLinkPlayers', ret: "void", arity: 0, params: "void" },
  { name: 'GetMultiplayerId', ret: "u8", arity: 0, params: "void" },
  { name: 'BitmaskAllOtherLinkPlayers', ret: "u8", arity: 0, params: "void" },
  { name: 'SendBlock', ret: "bool8", arity: 3, params: "u8 unused, const void *src, u16 size" },
  { name: 'GetBlockReceivedStatus', ret: "u8", arity: 0, params: "void" },
  { name: 'ResetBlockReceivedFlags', ret: "void", arity: 0, params: "void" },
  { name: 'ResetBlockReceivedFlag', ret: "void", arity: 1, params: "u8 who" },
  { name: 'GetLinkPlayerCount_2', ret: "u8", arity: 0, params: "void" },
  { name: 'IsLinkMaster', ret: "bool8", arity: 0, params: "void" },
  { name: 'CB2_LinkError', ret: "void", arity: 0, params: "void" },
  { name: 'GetSioMultiSI', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsLinkConnectionEstablished', ret: "bool8", arity: 0, params: "void" },
  { name: 'HasLinkErrorOccurred', ret: "bool8", arity: 0, params: "void" },
  { name: 'ResetSerial', ret: "void", arity: 0, params: "void" },
  { name: 'LinkVSync', ret: "void", arity: 0, params: "void" },
  { name: 'Timer3Intr', ret: "void", arity: 0, params: "void" },
  { name: 'SerialCB', ret: "void", arity: 0, params: "void" },
  { name: 'InUnionRoom', ret: "bool32", arity: 0, params: "void" },
  { name: 'LoadWirelessStatusIndicatorSpriteGfx', ret: "void", arity: 0, params: "void" },
  { name: 'IsLinkTaskFinished', ret: "bool8", arity: 0, params: "void" },
  { name: 'CreateWirelessStatusIndicatorSprite', ret: "void", arity: 2, params: "u8 x, u8 y" },
  { name: 'SetLinkStandbyCallback', ret: "void", arity: 0, params: "void" },
  { name: 'SetWirelessCommType1', ret: "void", arity: 0, params: "void" },
  { name: 'CheckShouldAdvanceLinkState', ret: "void", arity: 0, params: "void" },
  { name: 'SetCloseLinkCallback', ret: "void", arity: 0, params: "void" },
  { name: 'HandleLinkConnection', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetLinkDebugValues', ret: "void", arity: 2, params: "u32 seed, u32 flags" },
  { name: 'SetBerryBlenderLinkCallback', ret: "void", arity: 0, params: "void" },
  { name: 'SetSuppressLinkErrorMessage', ret: "void", arity: 1, params: "bool8 flag" },
  { name: 'ConvertLinkPlayerName', ret: "void", arity: 1, params: "struct LinkPlayer *player" },
  { name: 'ClearSavedLinkPlayers', ret: "void", arity: 0, params: "void" },
  { name: 'SetLinkErrorBuffer', ret: "void", arity: 4, params: "u32 status, u8 lastSendQueueCount, u8 lastRecvQueueCount, bool8 disconnected" },
  { name: 'LocalLinkPlayerToBlock', ret: "void", arity: 0, params: "void" },
  { name: 'LinkPlayerFromBlock', ret: "void", arity: 1, params: "u32 who" },
  { name: 'Link_AnyPartnersPlayingFRLG_JP', ret: "bool32", arity: 0, params: "void" },
  { name: 'ResetLinkPlayerCount', ret: "void", arity: 0, params: "void" },
  { name: 'SaveLinkPlayers', ret: "void", arity: 1, params: "u8 playerCount" },
  { name: 'SetWirelessCommType0', ret: "void", arity: 0, params: "void" },
  { name: 'IsLinkRecvQueueAtOverworldMax', ret: "bool32", arity: 0, params: "void" },
  { name: 'Link_AnyPartnersPlayingRubyOrSapphire', ret: "bool32", arity: 0, params: "void" },
  { name: 'LinkDummy_Return2', ret: "u32", arity: 0, params: "void" },
  { name: 'SetLocalLinkPlayerId', ret: "void", arity: 1, params: "u8 playerId" },
  { name: 'GetSavedPlayerCount', ret: "u8", arity: 0, params: "void" },
  { name: 'SendBlockRequest', ret: "bool8", arity: 1, params: "u8 blockReqType" },
  { name: 'GetLinkPlayerCountAsBitFlags', ret: "u8", arity: 0, params: "void" },
  { name: 'GetSavedLinkPlayerCountAsBitFlags', ret: "u8", arity: 0, params: "void" },
  { name: 'SetCloseLinkCallbackHandleJP', ret: "void", arity: 0, params: "void" },
  { name: 'CheckLinkPlayersMatchSaved', ret: "void", arity: 0, params: "void" },
  { name: 'StartSendingKeysToLink', ret: "void", arity: 0, params: "void" },
  { name: 'DoesLinkPlayerCountMatchSaved', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetCloseLinkCallbackAndType', ret: "void", arity: 1, params: "u16 type" },
  { name: 'IsSendingKeysToLink', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetLinkRecvQueueLength', ret: "u32", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_DestroySelf',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_LinkError',
] as const;
