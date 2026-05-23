// AUTO-GENERATED from include/event_data.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/event_data.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitEventData', ret: "void", arity: 0, params: "void" },
  { name: 'ClearTempFieldEventData', ret: "void", arity: 0, params: "void" },
  { name: 'ClearDailyFlags', ret: "void", arity: 0, params: "void" },
  { name: 'DisableNationalPokedex', ret: "void", arity: 0, params: "void" },
  { name: 'EnableNationalPokedex', ret: "void", arity: 0, params: "void" },
  { name: 'IsNationalPokedexEnabled', ret: "bool32", arity: 0, params: "void" },
  { name: 'DisableMysteryEvent', ret: "void", arity: 0, params: "void" },
  { name: 'EnableMysteryEvent', ret: "void", arity: 0, params: "void" },
  { name: 'IsMysteryEventEnabled', ret: "bool32", arity: 0, params: "void" },
  { name: 'DisableMysteryGift', ret: "void", arity: 0, params: "void" },
  { name: 'EnableMysteryGift', ret: "void", arity: 0, params: "void" },
  { name: 'IsMysteryGiftEnabled', ret: "bool32", arity: 0, params: "void" },
  { name: 'ClearMysteryGiftFlags', ret: "void", arity: 0, params: "void" },
  { name: 'ClearMysteryGiftVars', ret: "void", arity: 0, params: "void" },
  { name: 'DisableResetRTC', ret: "void", arity: 0, params: "void" },
  { name: 'EnableResetRTC', ret: "void", arity: 0, params: "void" },
  { name: 'CanResetRTC', ret: "bool32", arity: 0, params: "void" },
  { name: 'VarGet', ret: "u16", arity: 1, params: "u16 id" },
  { name: 'VarSet', ret: "bool8", arity: 2, params: "u16 id, u16 value" },
  { name: 'VarGetObjectEventGraphicsId', ret: "u8", arity: 1, params: "u8 id" },
  { name: 'FlagSet', ret: "u8", arity: 1, params: "u16 id" },
  { name: 'FlagClear', ret: "u8", arity: 1, params: "u16 id" },
  { name: 'FlagGet', ret: "bool8", arity: 1, params: "u16 id" },
] as const;
