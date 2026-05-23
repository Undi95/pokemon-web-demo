// AUTO-GENERATED from include/cable_club.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/cable_club.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CreateTask_EnterCableClubSeat', ret: "void", arity: 1, params: "TaskFunc followupFunc" },
  { name: 'CreateTask_ReestablishCableClubLink', ret: "u8", arity: 0, params: "void" },
  { name: 'CB2_ReturnFromCableClubBattle', ret: "void", arity: 0, params: "void" },
  { name: 'AreBattleTowerLinkSpeciesSame', ret: "bool32", arity: 2, params: "u16 *speciesList1, u16 *speciesList2" },
  { name: 'Task_ReconnectWithLinkPlayers', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_WaitForLinkPlayerConnection', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'GetLinkTrainerCardColor', ret: "bool32", arity: 1, params: "u8 linkPlayerIndex" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_ReconnectWithLinkPlayers',
  'Task_WaitForLinkPlayerConnection',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_ReturnFromCableClubBattle',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'task.h',
  'constants/cable_club.h',
] as const;
