// AUTO-GENERATED from src/wireless_communication_status_screen.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/wireless_communication_status_screen.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const GROUPTYPE_NONE = 255;
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_COLORMODE_0 = {
  COLORMODE_NORMAL: 0,
  COLORMODE_WHITE_LGRAY: 1,
  COLORMODE_RED: 2,
  COLORMODE_GREEN: 3,
  COLORMODE_WHITE_DGRAY: 4,
} as const;
export const ENUM_WIN_1 = {
  WIN_TITLE: 0,
  WIN_GROUP_NAMES: 1,
  WIN_GROUP_COUNTS: 2,
} as const;
export const ENUM_GROUPTYPE_2 = {
  GROUPTYPE_TRADE: 0,
  GROUPTYPE_BATTLE: 1,
  GROUPTYPE_UNION: 2,
  GROUPTYPE_TOTAL: 3,
  NUM_GROUPTYPES: 4,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplates = [
  { bg: 0, tilemapLeft: 3, tilemapTop: 0, width: 24, height: 3, paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: 3, tilemapTop: 4, width: 21, height: 15, paletteNum: 15, baseBlock: 73 },
  { bg: 0, tilemapLeft: 24, tilemapTop: 4, width: 3, height: 15, paletteNum: 15, baseBlock: 388 },
] as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, priority: 0 },
  { bg: 1, charBaseIndex: 0, mapBaseIndex: 8, priority: 1 },
] as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sBgTiles_Gfx': { path: 'graphics/wireless_status_screen/bg.png', ext: '.4bpp.lz', type: 'u32' },
  'sBgTiles_Tilemap': { path: 'graphics/wireless_status_screen/bg.bin', ext: '.lz', type: 'u32' },
};

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sHeaderTexts = ['gText_WirelessCommStatus', 'gText_PeopleTrading', 'gText_PeopleBattling', 'gText_PeopleInUnionRoom', 'gText_PeopleCommunicating'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_InitWirelessCommunicationScreen', ret: "void", arity: 0, params: "void" },
  { name: 'Task_WirelessCommunicationScreen', ret: "void", arity: 1, params: "u8" },
  { name: 'WCSS_AddTextPrinterParameterized', ret: "void", arity: 6, params: "u8, u8, const u8 *, u8, u8, u8" },
  { name: 'UpdateCommunicationCounts', ret: "bool32", arity: 4, params: "u32 *, u32 *, u32 *, u8" },
  { name: 'CB2_RunWirelessCommunicationScreen', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_WirelessCommunicationScreen', ret: "void", arity: 0, params: "void" },
  { name: 'ShowWirelessCommunicationScreen', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ExitWirelessCommunicationStatusScreen', ret: "void", arity: 0, params: "void" },
  { name: 'CyclePalette', ret: "void", arity: 2, params: "s16 *counter, s16 *palIdx" },
  { name: 'PrintHeaderTexts', ret: "void", arity: 0, params: "void" },
  { name: 'CountPlayersInGroupAndGetActivity', ret: "u32", arity: 2, params: "struct RfuPlayer *player, u32 *groupCounts" },
  { name: 'HaveCountsChanged', ret: "bool32", arity: 2, params: "u32 *currCounts, u32 *prevCounts" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_WirelessCommunicationScreen',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_ExitWirelessCommunicationStatusScreen',
  'CB2_InitWirelessCommunicationScreen',
  'CB2_RunWirelessCommunicationScreen',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'task.h',
  'bg.h',
  'palette.h',
  'gpu_regs.h',
  'malloc.h',
  'scanline_effect.h',
  'm4a.h',
  'dynamic_placeholder_text_util.h',
  'overworld.h',
  'strings.h',
  'string_util.h',
  'international_string_util.h',
  'sound.h',
  'menu.h',
  'librfu.h',
  'link_rfu.h',
  'union_room.h',
  'constants/songs.h',
  'constants/union_room.h',
  'constants/rgb.h',
] as const;
