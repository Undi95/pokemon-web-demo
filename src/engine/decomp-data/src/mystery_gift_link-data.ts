// AUTO-GENERATED from src/mystery_gift_link.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/mystery_gift_link.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'MGL_Receive', ret: "u32", arity: 1, params: "struct MysteryGiftLink *" },
  { name: 'MGL_Send', ret: "u32", arity: 1, params: "struct MysteryGiftLink *" },
  { name: 'MysteryGiftLink_Recv', ret: "u32", arity: 1, params: "struct MysteryGiftLink *link" },
  { name: 'MysteryGiftLink_Send', ret: "u32", arity: 1, params: "struct MysteryGiftLink *link" },
  { name: 'MysteryGiftLink_Init', ret: "void", arity: 3, params: "struct MysteryGiftLink *link, u32 sendPlayerId, u32 recvPlayerId" },
  { name: 'MysteryGiftLink_InitSend', ret: "void", arity: 4, params: "struct MysteryGiftLink *link, u32 ident, const void *src, u32 size" },
  { name: 'MysteryGiftLink_InitRecv', ret: "void", arity: 3, params: "struct MysteryGiftLink *link, u32 ident, void *dest" },
  { name: 'MGL_ReceiveBlock', ret: "void", arity: 3, params: "u32 playerId, void *dest, size_t size" },
  { name: 'MGL_HasReceived', ret: "bool32", arity: 1, params: "u32 playerId" },
  { name: 'MGL_ResetReceived', ret: "void", arity: 1, params: "u32 playerId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'decompress.h',
  'util.h',
  'link.h',
  'link_rfu.h',
  'overworld.h',
  'script.h',
  'battle_tower.h',
  'mystery_event_script.h',
  'mystery_gift.h',
  'mystery_gift_link.h',
] as const;
