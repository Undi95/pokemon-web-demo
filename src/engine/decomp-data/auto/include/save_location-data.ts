// AUTO-GENERATED from include/save_location.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/save_location.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `(1 << 0)` */
export const CONTINUE_GAME_WARP_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 1)` */
export const POKECENTER_SAVEWARP_EXPR = "(1 << 1)";
/** Raw expr: `(1 << 2)` */
export const LOBBY_SAVEWARP_EXPR = "(1 << 2)";
/** Raw expr: `(1 << 3)` */
export const UNK_SPECIAL_SAVE_WARP_FLAG_3_EXPR = "(1 << 3)";
/** Raw expr: `(1 << 7)` */
export const CHAMPION_SAVEWARP_EXPR = "(1 << 7)";

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'TrySetMapSaveWarpStatus', ret: "void", arity: 0, params: "void" },
  { name: 'SetChampionSaveWarp', ret: "void", arity: 0, params: "void" },
] as const;
