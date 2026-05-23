// AUTO-GENERATED from src/clear_save_data_screen.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/clear_save_data_screen.c
// Generated: 2026-04-26

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sClearSaveTextWindow = { bg: 0, tilemapLeft: 3, tilemapTop: 15, width: 26, height: 4, paletteNum: 15, baseBlock: 11 } as const;
export const sClearSaveYesNo = { bg: 0, tilemapLeft: 3, tilemapTop: 2, width: 5, height: 4, paletteNum: 15, baseBlock: 115 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sClearSaveBgTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_DoClearSaveDataScreenYesNo', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ClearSaveDataScreenYesNoChoice', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ClearSaveData', ret: "void", arity: 1, params: "u8" },
  { name: 'SetupClearSaveDataScreen', ret: "bool8", arity: 0, params: "void" },
  { name: 'CB2_FadeAndDoReset', ret: "void", arity: 0, params: "void" },
  { name: 'InitClearSaveDataScreenWindows', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_InitClearSaveDataScreen', ret: "void", arity: 0, params: "void" },
  { name: 'MainCB', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB', ret: "void", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_ClearSaveData',
  'Task_ClearSaveDataScreenYesNoChoice',
  'Task_DoClearSaveDataScreenYesNo',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_FadeAndDoReset',
  'CB2_InitClearSaveDataScreen',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'task.h',
  'text.h',
  'menu.h',
  'sound.h',
  'main.h',
  'save.h',
  'palette.h',
  'gpu_regs.h',
  'bg.h',
  'text_window.h',
  'constants/songs.h',
  'constants/rgb.h',
] as const;
