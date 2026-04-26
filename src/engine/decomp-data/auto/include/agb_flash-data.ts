// AUTO-GENERATED from include/agb_flash.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/agb_flash.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'IdentifyFlash', ret: "u16", arity: 0, params: "void" },
  { name: 'ProgramFlashSectorAndVerify', ret: "u32", arity: 2, params: "u16 sectorNum, u8 *src" },
] as const;
