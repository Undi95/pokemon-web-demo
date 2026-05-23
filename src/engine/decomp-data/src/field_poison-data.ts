// AUTO-GENERATED from src/field_poison.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/field_poison.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tPartyIdx_EXPR = "data[1]";

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'IsMonValidSpecies', ret: "bool32", arity: 1, params: "struct Pokemon *pokemon" },
  { name: 'AllMonsFainted', ret: "bool32", arity: 0, params: "void" },
  { name: 'FaintFromFieldPoison', ret: "void", arity: 1, params: "u8 partyIdx" },
  { name: 'MonFaintedFromPoison', ret: "bool32", arity: 1, params: "u8 partyIdx" },
  { name: 'Task_TryFieldPoisonWhiteOut', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'TryFieldPoisonWhiteOut', ret: "void", arity: 0, params: "void" },
  { name: 'DoPoisonFieldEffect', ret: "s32", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_TryFieldPoisonWhiteOut',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_pike.h',
  'battle_pyramid.h',
  'event_data.h',
  'field_message_box.h',
  'field_poison.h',
  'fldeff_misc.h',
  'frontier_util.h',
  'party_menu.h',
  'pokenav.h',
  'script.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'trainer_hill.h',
  'constants/field_poison.h',
  'constants/party_menu.h',
] as const;
