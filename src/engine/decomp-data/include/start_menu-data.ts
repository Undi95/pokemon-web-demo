// AUTO-GENERATED from include/start_menu.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/start_menu.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ShowReturnToFieldStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'Task_ShowStartMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ShowStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'ShowBattlePyramidStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'SaveGame', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_SetUpSaveAfterLinkBattle', ret: "void", arity: 0, params: "void" },
  { name: 'SaveForBattleTowerLink', ret: "void", arity: 0, params: "void" },
  { name: 'HideStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'AppendToList', ret: "void", arity: 3, params: "u8 *list, u8 *pos, u8 newEntry" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_ShowStartMenu',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_SetUpSaveAfterLinkBattle',
] as const;
