// AUTO-GENERATED from data/scripts/field_poison.inc by extract-decomp-asm.mjs
// Do not edit manually — re-run `npm run extract:decomp-asm` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/data/scripts/field_poison.inc
// Generated: 2026-06-10

// ─── Labels (script entry points + local jumps) ─────────────────────────────
// instrIndex = 0-based index into OPS array (Nth tokenized instruction line).
export const LABELS = [
  { name: 'EventScript_FieldPoison', isGlobal: true, instrIndex: 0 },
  { name: 'EventScript_FieldWhiteOut', isGlobal: true, instrIndex: 6 },
  { name: 'EventScript_SetRespawnLavaridgePkmnCenter', isGlobal: true, instrIndex: 14 },
  { name: 'EventScript_FrontierFieldWhiteOut', isGlobal: true, instrIndex: 16 },
] as const;

// ─── Tokenized instruction stream (macro invocations + opcodes) ───────────
// 30 instructions. Each has { op, args[] } — args are unresolved strings/numbers.
export const OPS = [
  {op:"lockall",args:[]},
  {op:"special",args:["TryFieldPoisonWhiteOut"]},
  {op:"goto_if_eq",args:["VAR_RESULT","FLDPSN_WHITEOUT","EventScript_FieldWhiteOut"]},
  {op:"goto_if_eq",args:["VAR_RESULT","FLDPSN_FRONTIER_WHITEOUT","EventScript_FrontierFieldWhiteOut"]},
  {op:"releaseall",args:[]},
  {op:"end",args:[]},
  {op:"message",args:["gText_PlayerWhitedOut"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"special",args:["Script_FadeOutMapMusic"]},
  {op:"fadescreen",args:["FADE_TO_BLACK"]},
  {op:"call_if_set",args:["FLAG_WHITEOUT_TO_LAVARIDGE","EventScript_SetRespawnLavaridgePkmnCenter"]},
  {op:"special",args:["SetCB2WhiteOut"]},
  {op:"end",args:[]},
  {op:"setrespawn",args:["HEAL_LOCATION_LAVARIDGE_TOWN"]},
  {op:"return",args:[]},
  {op:"message",args:["gText_PlayerWhitedOut"]},
  {op:"waitmessage",args:[]},
  {op:"waitbuttonpress",args:[]},
  {op:"pike_inchallenge",args:[]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"BattleFrontier_BattlePike_EventScript_Retire"]},
  {op:"pyramid_getlocation",args:[]},
  {op:"goto_if_eq",args:["VAR_RESULT","PYRAMID_LOCATION_FLOOR","BattleFrontier_BattlePyramid_EventScript_WarpToLobbyLost"]},
  {op:"goto_if_eq",args:["VAR_RESULT","PYRAMID_LOCATION_TOP","BattleFrontier_BattlePyramid_EventScript_WarpToLobbyLost"]},
  {op:"trainerhill_inchallenge",args:[]},
  {op:"goto_if_eq",args:["VAR_RESULT",1,"TrainerHill_1F_EventScript_Lost"]},
  {op:"special",args:["Script_FadeOutMapMusic"]},
  {op:"fadescreen",args:["FADE_TO_BLACK"]},
  {op:"special",args:["SetCB2WhiteOut"]},
  {op:"end",args:[]},
] as const;
