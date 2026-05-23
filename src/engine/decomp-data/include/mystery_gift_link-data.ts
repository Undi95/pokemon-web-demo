// AUTO-GENERATED from include/mystery_gift_link.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/mystery_gift_link.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MG_LINK_BUFFER_SIZE = 1024;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_MG_0 = {
  MG_LINKID_CLIENT_SCRIPT: 16,
  MG_LINKID_GAME_DATA: 17,
  MG_LINKID_GAME_STAT: 18,
  MG_LINKID_RESPONSE: 19,
  MG_LINKID_READY_END: 20,
  MG_LINKID_DYNAMIC_MSG: 21,
  MG_LINKID_CARD: 22,
  MG_LINKID_NEWS: 23,
  MG_LINKID_STAMP: 24,
  MG_LINKID_RAM_SCRIPT: 25,
  MG_LINKID_EREADER_TRAINER: 26,
  MG_LINKID_UNK_1: 27,
  MG_LINKID_UNK_2: 28,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'MysteryGiftLink_Init', ret: "void", arity: 3, params: "struct MysteryGiftLink *link, u32 sendPlayerId, u32 recvPlayerId" },
  { name: 'MysteryGiftLink_InitSend', ret: "void", arity: 4, params: "struct MysteryGiftLink *link, u32 ident, const void *src, u32 size" },
  { name: 'MysteryGiftLink_Recv', ret: "u32", arity: 1, params: "struct MysteryGiftLink *link" },
  { name: 'MysteryGiftLink_Send', ret: "u32", arity: 1, params: "struct MysteryGiftLink *link" },
  { name: 'MysteryGiftLink_InitRecv', ret: "void", arity: 3, params: "struct MysteryGiftLink *link, u32 ident, void *dest" },
] as const;
