// AUTO-GENERATED from include/union_room_player_avatar.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/union_room_player_avatar.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitUnionRoomPlayerObjects', ret: "u8", arity: 1, params: "struct UnionRoomObject *players" },
  { name: 'DestroyUnionRoomPlayerObjects', ret: "void", arity: 0, params: "void" },
  { name: 'CreateUnionRoomPlayerSprites', ret: "void", arity: 2, params: "u8 *spriteIds, s32 leaderId" },
  { name: 'DestroyUnionRoomPlayerSprites', ret: "void", arity: 1, params: "u8 *spriteIds" },
  { name: 'SetTilesAroundUnionRoomPlayersPassable', ret: "void", arity: 0, params: "void" },
  { name: 'ScheduleUnionRoomPlayerRefresh', ret: "void", arity: 1, params: "struct WirelessLink_URoom *uroom" },
  { name: 'HandleUnionRoomPlayerRefresh', ret: "void", arity: 1, params: "struct WirelessLink_URoom *uroom" },
  { name: 'TryInteractWithUnionRoomMember', ret: "bool32", arity: 4, params: "struct RfuPlayerList *list, s16 *memberIdPtr, s16 *leaderIdPtr, u8 *spriteIds" },
  { name: 'UpdateUnionRoomMemberFacing', ret: "void", arity: 3, params: "u32 memberId, u32 leaderId, struct RfuPlayerList *list" },
] as const;
