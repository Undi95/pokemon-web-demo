// AUTO-GENERATED from src/fldeff_flash.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/fldeff_flash.c
// Generated: 2026-04-26

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sCaveTransitionPalette_White': { path: 'graphics/cave_transition/white.pal', ext: '.gbapal', type: 'u16' },
  'sCaveTransitionPalette_Black': { path: 'graphics/cave_transition/black.pal', ext: '.gbapal', type: 'u16' },
  'sCaveTransitionPalette_Enter': { path: 'graphics/cave_transition/enter.pal', ext: '.gbapal', type: 'u16' },
  'sCaveTransitionPalette_Exit': { path: 'graphics/cave_transition/exit.pal', ext: '.gbapal', type: 'u16' },
  'sCaveTransitionTilemap': { path: 'graphics/cave_transition/tilemap.bin', ext: '.lz', type: 'u32' },
  'sCaveTransitionTiles': { path: 'graphics/cave_transition/tiles.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'FieldCallback_Flash', ret: "void", arity: 0, params: "void" },
  { name: 'FldEff_UseFlash', ret: "void", arity: 0, params: "void" },
  { name: 'TryDoMapTransition', ret: "bool8", arity: 0, params: "void" },
  { name: 'DoExitCaveTransition', ret: "void", arity: 0, params: "void" },
  { name: 'Task_ExitCaveTransition1', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ExitCaveTransition2', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ExitCaveTransition3', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ExitCaveTransition4', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_ExitCaveTransition5', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DoEnterCaveTransition', ret: "void", arity: 0, params: "void" },
  { name: 'Task_EnterCaveTransition1', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_EnterCaveTransition2', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_EnterCaveTransition3', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_EnterCaveTransition4', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SetUpFieldMove_Flash', ret: "bool8", arity: 0, params: "void" },
  { name: 'CB2_ChangeMapMain', ret: "void", arity: 0, params: "void" },
  { name: 'VBC_ChangeMapVBlank', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_DoChangeMap', ret: "void", arity: 0, params: "void" },
  { name: 'GetMapPairFadeToType', ret: "bool8", arity: 2, params: "u8 _fromType, u8 _toType" },
  { name: 'GetMapPairFadeFromType', ret: "bool8", arity: 2, params: "u8 _fromType, u8 _toType" },
  { name: 'SetMainCallback2', ret: "else", arity: 1, params: "gMain.savedCallback" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_EnterCaveTransition1',
  'Task_EnterCaveTransition2',
  'Task_EnterCaveTransition3',
  'Task_EnterCaveTransition4',
  'Task_ExitCaveTransition1',
  'Task_ExitCaveTransition2',
  'Task_ExitCaveTransition3',
  'Task_ExitCaveTransition4',
  'Task_ExitCaveTransition5',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_ChangeMapMain',
  'CB2_DoChangeMap',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'braille_puzzles.h',
  'event_data.h',
  'event_scripts.h',
  'field_effect.h',
  'fldeff.h',
  'gpu_regs.h',
  'main.h',
  'overworld.h',
  'palette.h',
  'party_menu.h',
  'script.h',
  'sound.h',
  'sprite.h',
  'task.h',
  'constants/songs.h',
  'constants/map_types.h',
] as const;
