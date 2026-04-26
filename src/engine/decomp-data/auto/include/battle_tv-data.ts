// AUTO-GENERATED from include/battle_tv.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/battle_tv.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'BattleTv_SetDataBasedOnString', ret: "void", arity: 1, params: "u16 stringId" },
  { name: 'BattleTv_SetDataBasedOnMove', ret: "void", arity: 3, params: "u16 move, u16 weatherFlags, struct DisableStruct *disableStructPtr" },
  { name: 'BattleTv_SetDataBasedOnAnimation', ret: "void", arity: 1, params: "u8 animationId" },
  { name: 'TryPutLinkBattleTvShowOnAir', ret: "void", arity: 0, params: "void" },
  { name: 'BattleTv_ClearExplosionFaintCause', ret: "void", arity: 0, params: "void" },
  { name: 'GetBattlerMoveSlotId', ret: "u8", arity: 2, params: "u8 battler, u16 move" },
] as const;
