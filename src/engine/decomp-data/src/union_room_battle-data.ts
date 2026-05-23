// AUTO-GENERATED from src/union_room_battle.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/union_room_battle.c
// Generated: 2026-04-26

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplates = { bg: 0, tilemapLeft: 3, tilemapTop: 15, width: 24, height: 4, paletteNum: 14, baseBlock: 20 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = { bg: 0, charBaseIndex: 3, mapBaseIndex: 31 } as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_SetUpPartiesAndStartBattle', ret: "void", arity: 0, params: "void" },
  { name: 'AddTextPrinterForUnionRoomBattle', ret: "void", arity: 5, params: "u8 windowId, const u8 *str, u8 x, u8 y, s32 speed" },
  { name: 'PrintUnionRoomBattleMessage', ret: "bool32", arity: 3, params: "s16 *state, const u8 *str, s32 speed" },
  { name: 'VBlankCB_UnionRoomBattle', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_UnionRoomBattle', ret: "void", arity: 0, params: "void" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_SetUpPartiesAndStartBattle',
  'CB2_UnionRoomBattle',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'task.h',
  'text.h',
  'main.h',
  'bg.h',
  'palette.h',
  'gpu_regs.h',
  'malloc.h',
  'menu.h',
  'window.h',
  'text_window.h',
  'scanline_effect.h',
  'overworld.h',
  'strings.h',
  'party_menu.h',
  'battle_setup.h',
  'link.h',
  'union_room.h',
  'union_room_battle.h',
  'constants/rgb.h',
  'constants/trainers.h',
] as const;
