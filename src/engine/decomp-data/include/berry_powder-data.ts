// AUTO-GENERATED from include/berry_powder.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/berry_powder.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SetBerryPowder', ret: "void", arity: 2, params: "u32 *powder, u32 amount" },
  { name: 'ApplyNewEncryptionKeyToBerryPowder', ret: "void", arity: 1, params: "u32 encryptionKey" },
  { name: 'GiveBerryPowder', ret: "bool8", arity: 1, params: "u32 amountToAdd" },
  { name: 'GetBerryPowder', ret: "u32", arity: 0, params: "void" },
] as const;
