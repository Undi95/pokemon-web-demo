// AUTO-GENERATED from src/fldeff_rocksmash.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/fldeff_rocksmash.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_DoFieldMove_Init', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_DoFieldMove_ShowMonAfterPose', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_DoFieldMove_WaitForMon', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_DoFieldMove_RunFunc', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'FieldCallback_RockSmash', ret: "void", arity: 0, params: "void" },
  { name: 'FieldMove_RockSmash', ret: "void", arity: 0, params: "void" },
  { name: 'CheckObjectGraphicsInFrontOfPlayer', ret: "bool8", arity: 1, params: "u8 graphicsId" },
  { name: 'CreateFieldMoveTask', ret: "u8", arity: 0, params: "void" },
  { name: 'SetUpFieldMove_RockSmash', ret: "bool8", arity: 0, params: "void" },
  { name: 'FldEff_UseRockSmash', ret: "bool8", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_DoFieldMove_Init',
  'Task_DoFieldMove_RunFunc',
  'Task_DoFieldMove_ShowMonAfterPose',
  'Task_DoFieldMove_WaitForMon',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'braille_puzzles.h',
  'event_data.h',
  'event_object_movement.h',
  'event_scripts.h',
  'field_effect.h',
  'field_player_avatar.h',
  'fldeff.h',
  'item_use.h',
  'overworld.h',
  'party_menu.h',
  'script.h',
  'sound.h',
  'sprite.h',
  'task.h',
  'constants/event_object_movement.h',
  'constants/event_objects.h',
  'constants/field_effects.h',
  'constants/map_types.h',
  'constants/songs.h',
] as const;
