// AUTO-GENERATED from src/field_region_map.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/field_region_map.c
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_WIN_0 = {
  WIN_MAPSEC_NAME: 0,
  WIN_TITLE: 1,
} as const;
export const ENUM_TAG_1 = {
  TAG_PLAYER_ICON: 0,
  TAG_CURSOR: 1,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sFieldRegionMapWindowTemplates = [
  { bg: 0, tilemapLeft: 17, tilemapTop: 17, width: 12, height: 2, paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: 22, tilemapTop: 1, width: 7, height: 2, paletteNum: 15, baseBlock: 25 },
] as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sFieldRegionMapBgTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 28, screenSize: 2, paletteMode: 1, priority: 2, baseTile: 0 },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'MCB2_InitRegionMapRegisters', ret: "void", arity: 0, params: "void" },
  { name: 'VBCB_FieldUpdateRegionMap', ret: "void", arity: 0, params: "void" },
  { name: 'MCB2_FieldUpdateRegionMap', ret: "void", arity: 0, params: "void" },
  { name: 'FieldUpdateRegionMap', ret: "void", arity: 0, params: "void" },
  { name: 'PrintRegionMapSecName', ret: "void", arity: 0, params: "void" },
  { name: 'FieldInitRegionMap', ret: "void", arity: 1, params: "MainCallback callback" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'bg.h',
  'gpu_regs.h',
  'international_string_util.h',
  'main.h',
  'malloc.h',
  'menu.h',
  'palette.h',
  'region_map.h',
  'strings.h',
  'text.h',
  'text_window.h',
  'window.h',
  'constants/rgb.h',
] as const;
