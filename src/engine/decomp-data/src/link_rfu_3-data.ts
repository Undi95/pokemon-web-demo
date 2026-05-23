// AUTO-GENERATED from src/link_rfu_3.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/link_rfu_3.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_GFX_STATUS_INDICATOR = 54321;
export const TAG_PAL_STATUS_INDICATOR = 54322;
export const UNUSED_QUEUE_NUM_SLOTS = 2;
export const UNUSED_QUEUE_SLOT_LENGTH = 256;
export const SEQ_ARRAY_MAX_SIZE = 200;
/** Raw expr: `data[0]` */
export const sNextAnimNum_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sSavedAnimNum_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sCurrAnimNum_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sFrameDelay_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sFrameIdx_EXPR = "data[4]";
/** Raw expr: `data[6]` */
export const sTileStart_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const sValidator_EXPR = "data[7]";
export const STATUS_INDICATOR_ACTIVE = 4660;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_WIRELESS_0 = {
  WIRELESS_STATUS_ANIM_3_BARS: 0,
  WIRELESS_STATUS_ANIM_2_BARS: 1,
  WIRELESS_STATUS_ANIM_1_BAR: 2,
  WIRELESS_STATUS_ANIM_SEARCHING: 3,
  WIRELESS_STATUS_ANIM_ERROR: 4,
} as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sWirelessStatusIndicatorOamData = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 0, paletteNum: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sWirelessStatusIndicatorSpriteTemplate = { tileTag: "TAG_GFX_STATUS_INDICATOR", paletteTag: "TAG_PAL_STATUS_INDICATOR", oam: "&sWirelessStatusIndicatorOamData", anims: "sWirelessStatusIndicatorAnims", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sWirelessLinkIconPalette': { path: 'graphics/link/wireless_icon.png', ext: '.gbapal', type: 'u16' },
  'sWirelessLinkIconPic': { path: 'graphics/link/wireless_icon.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'gWirelessStatusIndicatorSpriteId', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'RfuRecvQueue_Reset', ret: "void", arity: 1, params: "struct RfuRecvQueue *queue" },
  { name: 'RfuSendQueue_Reset', ret: "void", arity: 1, params: "struct RfuSendQueue *queue" },
  { name: 'RfuUnusedQueue_Reset', ret: "UNUSED", arity: 1, params: "struct RfuUnusedQueue *queue" },
  { name: 'RfuRecvQueue_Enqueue', ret: "void", arity: 2, params: "struct RfuRecvQueue *queue, u8 *data" },
  { name: 'RfuSendQueue_Enqueue', ret: "void", arity: 2, params: "struct RfuSendQueue *queue, u8 *data" },
  { name: 'RfuRecvQueue_Dequeue', ret: "bool8", arity: 2, params: "struct RfuRecvQueue *queue, u8 *src" },
  { name: 'RfuSendQueue_Dequeue', ret: "bool8", arity: 2, params: "struct RfuSendQueue *queue, u8 *src" },
  { name: 'RfuBackupQueue_Enqueue', ret: "void", arity: 2, params: "struct RfuBackupQueue *queue, const u8 *data" },
  { name: 'RfuBackupQueue_Dequeue', ret: "bool8", arity: 2, params: "struct RfuBackupQueue *queue, u8 *src" },
  { name: 'RfuUnusedQueue_Enqueue', ret: "UNUSED", arity: 2, params: "struct RfuUnusedQueue *queue, u8 *data" },
  { name: 'RfuUnusedQueue_Dequeue', ret: "UNUSED", arity: 2, params: "struct RfuUnusedQueue *queue, u8 *dest" },
  { name: 'PopulateArrayWithSequence', ret: "UNUSED", arity: 2, params: "u8 *arr, u8 mode" },
  { name: 'PkmnStrToASCII', ret: "UNUSED", arity: 2, params: "u8 *asciiStr, const u8 *pkmnStr" },
  { name: 'ASCIIToPkmnStr', ret: "UNUSED", arity: 2, params: "u8 *pkmnStr, const u8 *asciiStr" },
  { name: 'GetConnectedChildStrength', ret: "u8", arity: 1, params: "u8 maxFlags" },
  { name: 'InitHostRfuGameData', ret: "void", arity: 4, params: "struct RfuGameData *data, u8 activity, bool32 startedActivity, s32 partnerInfo" },
  { name: 'Rfu_GetCompatiblePlayerData', ret: "bool8", arity: 3, params: "struct RfuGameData *gameData, u8 *username, u8 idx" },
  { name: 'Rfu_GetWonderDistributorPlayerData', ret: "bool8", arity: 3, params: "struct RfuGameData *gameData, u8 *username, u8 idx" },
  { name: 'CopyHostRfuGameDataAndUsername', ret: "void", arity: 2, params: "struct RfuGameData *gameData, u8 *username" },
  { name: 'CreateWirelessStatusIndicatorSprite', ret: "void", arity: 2, params: "u8 x, u8 y" },
  { name: 'DestroyWirelessStatusIndicatorSprite', ret: "void", arity: 0, params: "void" },
  { name: 'LoadWirelessStatusIndicatorSpriteGfx', ret: "void", arity: 0, params: "void" },
  { name: 'GetParentSignalStrength', ret: "u8", arity: 0, params: "void" },
  { name: 'SetWirelessStatusIndicatorAnim', ret: "void", arity: 2, params: "struct Sprite *sprite, s32 animNum" },
  { name: 'UpdateWirelessStatusIndicatorSprite', ret: "void", arity: 0, params: "void" },
  { name: 'CopyTrainerRecord', ret: "void", arity: 3, params: "struct TrainerNameRecord *dest, u32 trainerId, const u8 *name" },
  { name: 'NameIsNotEmpty', ret: "bool32", arity: 1, params: "const u8 *name" },
  { name: 'SaveLinkTrainerNames', ret: "void", arity: 0, params: "void" },
  { name: 'PlayerHasMetTrainerBefore', ret: "bool32", arity: 2, params: "u16 id, u8 *name" },
  { name: 'WipeTrainerNameRecords', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'decompress.h',
  'link_rfu.h',
  'string_util.h',
  'random.h',
  'text.h',
  'event_data.h',
] as const;
