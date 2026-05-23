// AUTO-GENERATED from include/safari_zone.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/safari_zone.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetSafariZoneFlag', ret: "bool32", arity: 0, params: "void" },
  { name: 'SetSafariZoneFlag', ret: "void", arity: 0, params: "void" },
  { name: 'ResetSafariZoneFlag', ret: "void", arity: 0, params: "void" },
  { name: 'EnterSafariMode', ret: "void", arity: 0, params: "void" },
  { name: 'ExitSafariMode', ret: "void", arity: 0, params: "void" },
  { name: 'SafariZoneTakeStep', ret: "bool8", arity: 0, params: "void" },
  { name: 'SafariZoneRetirePrompt', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_EndSafariBattle', ret: "void", arity: 0, params: "void" },
  { name: 'SafariZoneActivatePokeblockFeeder', ret: "void", arity: 1, params: "u8 pkblId" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_EndSafariBattle',
] as const;
