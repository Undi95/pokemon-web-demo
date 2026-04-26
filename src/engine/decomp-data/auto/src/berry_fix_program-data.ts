// AUTO-GENERATED from src/berry_fix_program.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/berry_fix_program.c
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_WIN_0 = {
  WIN_TITLE: 0,
  WIN_MSG_BODY: 1,
  WIN_GAME_NAMES: 2,
  WIN_TURN_OFF_TITLE: 3,
} as const;
export const ENUM_SCENE_1 = {
  SCENE_ENSURE_CONNECT: 0,
  SCENE_TURN_OFF_POWER: 1,
  SCENE_TRANSMITTING: 2,
  SCENE_FOLLOW_INSTRUCT: 3,
  SCENE_TRANSMIT_FAILED: 4,
  SCENE_BEGIN: 5,
  SCENE_NONE: 6,
} as const;
export const ENUM_MAINSTATE_2 = {
  MAINSTATE_INIT: 0,
  MAINSTATE_BEGIN: 1,
  MAINSTATE_CONNECT: 2,
  MAINSTATE_INIT_MULTIBOOT: 3,
  MAINSTATE_MULTIBOOT: 4,
  MAINSTATE_TRANSMIT: 5,
  MAINSTATE_EXIT: 6,
  MAINSTATE_FAILED: 7,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sBerryFixWindowTemplates = [
  { bg: 0, tilemapLeft: 2, tilemapTop: 4, width: 26, height: 2, paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 11, width: 28, height: 8, paletteNum: 15, baseBlock: 53 },
  { bg: 0, tilemapLeft: 0, tilemapTop: 8, width: 30, height: 2, paletteNum: 15, baseBlock: 277 },
  { bg: 0, tilemapLeft: 8, tilemapTop: 0, width: 14, height: 2, paletteNum: 15, baseBlock: 337 },
] as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBerryFixBgTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
] as const;

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sBerryProgramTexts = ['sText_EnsureGBAConnectionMatches', 'sText_TurnOffPowerHoldingStartSelect', 'sText_TransmittingPleaseWait', 'sText_PleaseFollowInstructionsOnScreen', 'sText_TransmissionFailureTryAgain', 'sText_BerryProgramWillBeUpdatedPressA'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'BerryFix_Main', ret: "void", arity: 0, params: "void" },
  { name: 'BerryFix_GpuSet', ret: "void", arity: 0, params: "void" },
  { name: 'BerryFix_TrySetScene', ret: "int", arity: 1, params: "int" },
  { name: 'BerryFix_SetScene', ret: "void", arity: 1, params: "int" },
  { name: 'BerryFix_HideScene', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_InitBerryFixProgram', ret: "void", arity: 0, params: "void" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_InitBerryFixProgram',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'gpu_regs.h',
  'multiboot.h',
  'malloc.h',
  'bg.h',
  'graphics.h',
  'main.h',
  'sprite.h',
  'task.h',
  'scanline_effect.h',
  'window.h',
  'text.h',
  'menu.h',
  'm4a.h',
  'constants/rgb.h',
] as const;
