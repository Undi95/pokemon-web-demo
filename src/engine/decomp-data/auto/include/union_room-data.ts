// AUTO-GENERATED from include/union_room.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/union_room.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `(MAX_UNION_ROOM_LEADERS * MAX_RFU_PLAYERS)` */
export const NUM_UNION_ROOM_SPRITES_EXPR = "(MAX_UNION_ROOM_LEADERS * MAX_RFU_PLAYERS)";
export const MAX_RFU_PLAYER_LIST_SIZE = 16;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CreateTask_CreateTradeMenu', ret: "u8", arity: 0, params: "void" },
  { name: 'SetUsingUnionRoomStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'CreateTask_LinkMysteryGiftWithFriend', ret: "void", arity: 1, params: "u32 activity" },
  { name: 'CreateTask_LinkMysteryGiftOverWireless', ret: "void", arity: 1, params: "u32 activity" },
  { name: 'CreateTask_SendMysteryGift', ret: "void", arity: 1, params: "u32 activity" },
  { name: 'CreateTask_ListenToWireless', ret: "u8", arity: 0, params: "void" },
  { name: 'StartUnionRoomBattle', ret: "void", arity: 1, params: "u16 battleFlags" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'link_rfu.h',
  'link.h',
  'constants/union_room.h',
] as const;
