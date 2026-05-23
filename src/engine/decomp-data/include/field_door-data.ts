// AUTO-GENERATED from include/field_door.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/field_door.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'FieldSetDoorOpened', ret: "void", arity: 2, params: "u32 x, u32 y" },
  { name: 'FieldSetDoorClosed', ret: "void", arity: 2, params: "u32 x, u32 y" },
  { name: 'FieldAnimateDoorClose', ret: "s8", arity: 2, params: "u32 x, u32 y" },
  { name: 'FieldAnimateDoorOpen', ret: "s8", arity: 2, params: "u32 x, u32 y" },
  { name: 'FieldIsDoorAnimationRunning', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetDoorSoundEffect', ret: "u32", arity: 2, params: "u32 x, u32 y" },
] as const;
