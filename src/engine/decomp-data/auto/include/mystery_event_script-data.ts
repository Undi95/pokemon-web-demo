// AUTO-GENERATED from include/mystery_event_script.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/mystery_event_script.h
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_MEVENT_0 = {
  MEVENT_STATUS_LOAD_OK: 0,
  MEVENT_STATUS_LOAD_ERROR: 1,
  MEVENT_STATUS_SUCCESS: 2,
  MEVENT_STATUS_FAILURE: 3,
  MEVENT_STATUS_FF: 255,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitMysteryEventScriptContext', ret: "void", arity: 1, params: "u8 *script" },
  { name: 'RunMysteryEventScriptContextCommand', ret: "bool32", arity: 1, params: "u32 *status" },
  { name: 'RunMysteryEventScript', ret: "u32", arity: 1, params: "u8 *script" },
  { name: 'SetMysteryEventScriptStatus', ret: "void", arity: 1, params: "u32 status" },
  { name: 'GetRecordMixingGift', ret: "u16", arity: 0, params: "void" },
] as const;
