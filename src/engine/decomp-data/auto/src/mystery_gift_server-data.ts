// AUTO-GENERATED from src/mystery_gift_server.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/mystery_gift_server.c
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_FUNC_0 = {
  FUNC_INIT: 0,
  FUNC_DONE: 1,
  FUNC_RECV: 2,
  FUNC_SEND: 3,
  FUNC_RUN: 4,
} as const;

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sFuncTable = ['Server_Init', 'Server_Done', 'Server_Recv', 'Server_Send', 'Server_Run'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'MysteryGiftServer_Init', ret: "void", arity: 4, params: "struct MysteryGiftServer *, const void *, u32, u32" },
  { name: 'MysteryGiftServer_Free', ret: "void", arity: 1, params: "struct MysteryGiftServer *" },
  { name: 'MysteryGiftServer_CallFunc', ret: "u32", arity: 1, params: "struct MysteryGiftServer *" },
  { name: 'MysterGiftServer_CreateForNews', ret: "void", arity: 0, params: "void" },
  { name: 'MysterGiftServer_CreateForCard', ret: "void", arity: 0, params: "void" },
  { name: 'MysterGiftServer_Run', ret: "u32", arity: 1, params: "u16 *endVal" },
  { name: 'MysteryGiftServer_InitSend', ret: "void", arity: 4, params: "struct MysteryGiftServer *svr, u32 ident, const void *src, u32 size" },
  { name: 'MysteryGiftServer_GetSendData', ret: "void *", arity: 2, params: "const void *dynamicData, const void *defaultData" },
  { name: 'MysteryGiftServer_Compare', ret: "u32", arity: 2, params: "const void *a, const void *b" },
  { name: 'Server_Init', ret: "u32", arity: 1, params: "struct MysteryGiftServer *svr" },
  { name: 'Server_Done', ret: "u32", arity: 1, params: "struct MysteryGiftServer *svr" },
  { name: 'Server_Recv', ret: "u32", arity: 1, params: "struct MysteryGiftServer *svr" },
  { name: 'Server_Send', ret: "u32", arity: 1, params: "struct MysteryGiftServer *svr" },
  { name: 'Server_Run', ret: "u32", arity: 1, params: "struct MysteryGiftServer *svr" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'script.h',
  'mystery_gift.h',
  'mystery_gift_server.h',
  'mystery_gift_link.h',
] as const;
