// AUTO-GENERATED from include/field_control_avatar.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/field_control_avatar.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'FieldClearPlayerInput', ret: "void", arity: 1, params: "struct FieldInput *input" },
  { name: 'FieldGetPlayerInput', ret: "void", arity: 3, params: "struct FieldInput *input, u16 newKeys, u16 heldKeys" },
  { name: 'ProcessPlayerFieldInput', ret: "int", arity: 1, params: "struct FieldInput *input" },
  { name: 'RestartWildEncounterImmunitySteps', ret: "void", arity: 0, params: "void" },
  { name: 'TryDoDiveWarp', ret: "bool8", arity: 2, params: "struct MapPosition *position, u16 metatileBehavior" },
  { name: 'SetCableClubWarp', ret: "int", arity: 0, params: "void" },
  { name: 'TrySetDiveWarp', ret: "u8", arity: 0, params: "void" },
  { name: 'ClearPoisonStepCounter', ret: "void", arity: 0, params: "void" },
] as const;
