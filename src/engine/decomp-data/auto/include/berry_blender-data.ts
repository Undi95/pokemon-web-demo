// AUTO-GENERATED from include/berry_blender.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/berry_blender.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const BLENDER_COMM_INPUT_STATE = 0;
export const BLENDER_COMM_RESP = 1;
export const BLENDER_COMM_SCORE = 2;
export const BLENDER_COMM_STOP_TYPE = 2;
export const BLENDER_COMM_PLAYER_ID = 3;
export const BLENDER_COMM_UNUSED = 4;
export const BLENDER_COMM_PROGRESS_BAR = 5;
export const BLENDER_COMM_ARROW_POS = 6;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'DoBerryBlending', ret: "void", arity: 0, params: "void" },
  { name: 'GetBlenderArrowPosition', ret: "u16", arity: 0, params: "void" },
  { name: 'ShowBerryBlenderRecordWindow', ret: "void", arity: 0, params: "void" },
] as const;
