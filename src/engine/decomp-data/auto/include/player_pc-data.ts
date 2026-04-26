// AUTO-GENERATED from include/player_pc.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/player_pc.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ReshowPlayerPC', ret: "void", arity: 1, params: "u8 var" },
  { name: 'CB2_PlayerPCExitBagMenu', ret: "void", arity: 0, params: "void" },
  { name: 'Mailbox_ReturnToMailListAfterDeposit', ret: "void", arity: 0, params: "void" },
  { name: 'NewGameInitPCItems', ret: "void", arity: 0, params: "void" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_PlayerPCExitBagMenu',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'menu.h',
] as const;
