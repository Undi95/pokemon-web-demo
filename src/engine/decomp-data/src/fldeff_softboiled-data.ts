// AUTO-GENERATED from src/fldeff_softboiled.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/fldeff_softboiled.c
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_SoftboiledRestoreHealth', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_DisplayHPRestoredMessage', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_FinishSoftboiled', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CantUseSoftboiledOnMon', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetUpFieldMove_SoftBoiled', ret: "bool8", arity: 0, params: "void" },
  { name: 'ChooseMonForSoftboiled', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_TryUseSoftboiledOnPartyMon', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ChooseNewMonForSoftboiled', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_ChooseNewMonForSoftboiled',
  'Task_DisplayHPRestoredMessage',
  'Task_FinishSoftboiled',
  'Task_SoftboiledRestoreHealth',
  'Task_TryUseSoftboiledOnPartyMon',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'menu.h',
  'party_menu.h',
  'pokemon.h',
  'sound.h',
  'sprite.h',
  'string_util.h',
  'strings.h',
  'task.h',
  'constants/party_menu.h',
  'constants/songs.h',
] as const;
