// AUTO-GENERATED from src/union_room_player_avatar.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/union_room_player_avatar.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `(MAX_SPRITES - MAX_UNION_ROOM_LEADERS)` */
export const UR_SPRITE_START_ID_EXPR = "(MAX_SPRITES - MAX_UNION_ROOM_LEADERS)";

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u32", name: 'sUnionObjRefreshTimer', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CreateTask_AnimateUnionRoomPlayers', ret: "u8", arity: 0, params: "void" },
  { name: 'IsUnionRoomPlayerInvisible', ret: "u32", arity: 2, params: "u32, u32" },
  { name: 'SetUnionRoomObjectFacingDirection', ret: "void", arity: 3, params: "s32, s32, u8" },
  { name: 'IsPlayerStandingStill', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetUnionRoomPlayerGraphicsId', ret: "u8", arity: 2, params: "u32 gender, u32 id" },
  { name: 'GetUnionRoomPlayerCoords', ret: "void", arity: 4, params: "u32 leaderId, u32 memberId, s32 *x, s32 *y" },
  { name: 'IsUnionRoomPlayerAt', ret: "bool32", arity: 4, params: "u32 leaderId, u32 memberId, s32 x, s32 y" },
  { name: 'IsUnionRoomPlayerHidden', ret: "bool32", arity: 1, params: "u32 player_idx" },
  { name: 'HideUnionRoomPlayer', ret: "void", arity: 1, params: "u32 player_idx" },
  { name: 'ShowUnionRoomPlayer', ret: "void", arity: 1, params: "u32 player_idx" },
  { name: 'SetUnionRoomPlayerGfx', ret: "void", arity: 2, params: "u32 leaderId, u32 gfxId" },
  { name: 'CreateUnionRoomPlayerObjectEvent', ret: "void", arity: 1, params: "u32 leaderId" },
  { name: 'RemoveUnionRoomPlayerObjectEvent', ret: "void", arity: 1, params: "u32 leaderId" },
  { name: 'SetUnionRoomPlayerEnterExitMovement', ret: "bool32", arity: 2, params: "u32 leaderId, const u8 *movement" },
  { name: 'TryReleaseUnionRoomPlayerObjectEvent', ret: "bool32", arity: 1, params: "u32 leaderId" },
  { name: 'FreezeObjectEvent', ret: "else", arity: 1, params: "object" },
  { name: 'InitUnionRoomPlayerObjects', ret: "u8", arity: 1, params: "struct UnionRoomObject *players" },
  { name: 'AnimateUnionRoomPlayerDespawn', ret: "bool32", arity: 3, params: "s8 *state, u32 leaderId, struct UnionRoomObject *object" },
  { name: 'AnimateUnionRoomPlayerSpawn', ret: "bool32", arity: 3, params: "s8 *state, u32 leaderId, struct UnionRoomObject *object" },
  { name: 'SpawnGroupLeader', ret: "bool32", arity: 3, params: "u32 leaderId, u32 gender, u32 id" },
  { name: 'DespawnGroupLeader', ret: "bool32", arity: 1, params: "u32 leaderId" },
  { name: 'AnimateUnionRoomPlayer', ret: "void", arity: 2, params: "u32 leaderId, struct UnionRoomObject *object" },
  { name: 'Task_AnimateUnionRoomPlayers', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DestroyTask_AnimateUnionRoomPlayers', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyUnionRoomPlayerObjects', ret: "void", arity: 0, params: "void" },
  { name: 'CreateUnionRoomPlayerSprites', ret: "void", arity: 2, params: "u8 *spriteIds, s32 leaderId" },
  { name: 'DestroyUnionRoomPlayerSprites', ret: "void", arity: 1, params: "u8 *spriteIds" },
  { name: 'SetTilesAroundUnionRoomPlayersPassable', ret: "void", arity: 0, params: "void" },
  { name: 'GetNewFacingDirectionForUnionRoomPlayer', ret: "u8", arity: 3, params: "u32 memberId, u32 leaderId, struct RfuGameData *gameData" },
  { name: 'SpawnGroupMember', ret: "void", arity: 4, params: "u32 leaderId, u32 memberId, u8 graphicsId, struct RfuGameData *gameData" },
  { name: 'DespawnGroupMember', ret: "void", arity: 2, params: "u32 leaderId, u32 memberId" },
  { name: 'AssembleGroup', ret: "void", arity: 2, params: "u32 leaderId, struct RfuGameData *gameData" },
  { name: 'SpawnGroupLeaderAndMembers', ret: "void", arity: 2, params: "u32 leaderId, struct RfuGameData *gameData" },
  { name: 'DespawnGroupLeaderAndMembers', ret: "void", arity: 2, params: "u32 leaderId, struct RfuGameData *gameData" },
  { name: 'UpdateUnionRoomPlayerSprites', ret: "void", arity: 1, params: "struct WirelessLink_URoom *uroom" },
  { name: 'ScheduleUnionRoomPlayerRefresh', ret: "void", arity: 1, params: "struct WirelessLink_URoom *uroom" },
  { name: 'HandleUnionRoomPlayerRefresh', ret: "void", arity: 1, params: "struct WirelessLink_URoom *uroom" },
  { name: 'TryInteractWithUnionRoomMember', ret: "bool32", arity: 4, params: "struct RfuPlayerList *list, s16 *memberIdPtr, s16 *leaderIdPtr, u8 *spriteIds" },
  { name: 'UpdateUnionRoomMemberFacing', ret: "void", arity: 3, params: "u32 memberId, u32 leaderId, struct RfuPlayerList *list" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_AnimateUnionRoomPlayers',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'event_data.h',
  'event_object_movement.h',
  'field_player_avatar.h',
  'fieldmap.h',
  'script.h',
  'task.h',
  'union_room.h',
  'constants/event_objects.h',
  'constants/event_object_movement.h',
] as const;
