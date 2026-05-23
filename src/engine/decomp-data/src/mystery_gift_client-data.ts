// AUTO-GENERATED from src/mystery_gift_client.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/mystery_gift_client.c
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_FUNC_0 = {
  FUNC_INIT: 0,
  FUNC_DONE: 1,
  FUNC_RECV: 2,
  FUNC_SEND: 3,
  FUNC_RUN: 4,
  FUNC_WAIT: 5,
  FUNC_RUN_MEVENT: 6,
  FUNC_RUN_BUFFER: 7,
} as const;

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const funcs = ['Client_Init', 'Client_Done', 'Client_Recv', 'Client_Send', 'Client_Run', 'Client_Wait', 'Client_RunMysteryEventScript', 'Client_RunBufferScript'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'MysteryGiftClient_Init', ret: "void", arity: 3, params: "struct MysteryGiftClient *, u32, u32" },
  { name: 'MysteryGiftClient_CallFunc', ret: "u32", arity: 1, params: "struct MysteryGiftClient *" },
  { name: 'MysteryGiftClient_Free', ret: "void", arity: 1, params: "struct MysteryGiftClient *" },
  { name: 'MysteryGiftClient_Create', ret: "void", arity: 1, params: "bool32 isWonderNews" },
  { name: 'MysteryGiftClient_Run', ret: "u32", arity: 1, params: "u16 *endVal" },
  { name: 'MysteryGiftClient_AdvanceState', ret: "void", arity: 0, params: "void" },
  { name: 'MysteryGiftClient_GetMsg', ret: "void *", arity: 0, params: "void" },
  { name: 'MysteryGiftClient_SetParam', ret: "void", arity: 1, params: "u32 val" },
  { name: 'MysteryGiftClient_CopyRecvScript', ret: "void", arity: 1, params: "struct MysteryGiftClient *client" },
  { name: 'MysteryGiftClient_InitSendWord', ret: "void", arity: 3, params: "struct MysteryGiftClient *client, u32 ident, u32 word" },
  { name: 'Client_Init', ret: "u32", arity: 1, params: "struct MysteryGiftClient *client" },
  { name: 'Client_Done', ret: "u32", arity: 1, params: "struct MysteryGiftClient *client" },
  { name: 'Client_Recv', ret: "u32", arity: 1, params: "struct MysteryGiftClient *client" },
  { name: 'Client_Send', ret: "u32", arity: 1, params: "struct MysteryGiftClient *client" },
  { name: 'Client_Run', ret: "u32", arity: 1, params: "struct MysteryGiftClient *client" },
  { name: 'Client_Wait', ret: "u32", arity: 1, params: "struct MysteryGiftClient *client" },
  { name: 'Client_RunMysteryEventScript', ret: "u32", arity: 1, params: "struct MysteryGiftClient *client" },
  { name: 'Client_RunBufferScript', ret: "u32", arity: 1, params: "struct MysteryGiftClient *client" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'decompress.h',
  'overworld.h',
  'script.h',
  'battle_tower.h',
  'mystery_gift.h',
  'mystery_event_script.h',
  'mystery_gift_client.h',
] as const;
