// AUTO-GENERATED from src/diploma.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/diploma.c
// Generated: 2026-04-26

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sDiplomaWinTemplates = { bg: 0, tilemapLeft: 5, tilemapTop: 2, width: 20, height: 16, paletteNum: 15, baseBlock: 1 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sDiplomaBgTemplates = [
  { bg: 0, charBaseIndex: 1, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 6, screenSize: 1, paletteMode: 0, priority: 1, baseTile: 0 },
] as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sDiplomaTilemap': { path: 'graphics/diploma/tilemap.bin', ext: '.lz', type: 'u32' },
  'sDiplomaTiles': { path: 'graphics/diploma/tiles.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'MainCB2', ret: "void", arity: 0, params: "void" },
  { name: 'Task_DiplomaFadeIn', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_DiplomaWaitForKeyPress', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_DiplomaFadeOut', ret: "void", arity: 1, params: "u8" },
  { name: 'DisplayDiplomaText', ret: "void", arity: 0, params: "void" },
  { name: 'InitDiplomaBg', ret: "void", arity: 0, params: "void" },
  { name: 'InitDiplomaWindow', ret: "void", arity: 0, params: "void" },
  { name: 'PrintDiplomaText', ret: "void", arity: 3, params: "u8 *, u8, u8" },
  { name: 'VBlankCB', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ShowDiploma', ret: "void", arity: 0, params: "void" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_DiplomaFadeIn',
  'Task_DiplomaFadeOut',
  'Task_DiplomaWaitForKeyPress',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_ShowDiploma',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'diploma.h',
  'palette.h',
  'main.h',
  'gpu_regs.h',
  'scanline_effect.h',
  'task.h',
  'malloc.h',
  'decompress.h',
  'bg.h',
  'window.h',
  'string_util.h',
  'text.h',
  'overworld.h',
  'menu.h',
  'pokedex.h',
  'constants/rgb.h',
] as const;
