// AUTO-GENERATED from src/pokenav_conditions_gfx.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokenav_conditions_gfx.c
// Generated: 2026-04-26

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sMonNameGenderWindowTemplate = { bg: 1, tilemapLeft: 13, tilemapTop: 1, width: 13, height: 4, paletteNum: 15, baseBlock: 2 } as const;
export const sListIndexWindowTemplate = { bg: 1, tilemapLeft: 1, tilemapTop: 6, width: 7, height: 2, paletteNum: 15, baseBlock: 54 } as const;
export const sUnusedWindowTemplate1 = { bg: 1, tilemapLeft: 1, tilemapTop: 28, width: 5, height: 2, paletteNum: 15, baseBlock: 68 } as const;
export const sUnusedWindowTemplate2 = { bg: 1, tilemapLeft: 13, tilemapTop: 28, width: 3, height: 2, paletteNum: 15, baseBlock: 68 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sMenuBgTemplates = [
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 3, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 2, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'gConditionGraphData_Pal': { path: 'graphics/pokenav/condition/graph_data.pal', ext: '.gbapal', type: 'u16' },
  'gConditionText_Pal': { path: 'graphics/pokenav/condition/text.pal', ext: '.gbapal', type: 'u16' },
  'sConditionGraphData_Gfx': { path: 'graphics/pokenav/condition/graph_data.png', ext: '.4bpp.lz', type: 'u32' },
  'sConditionGraphData_Tilemap': { path: 'graphics/pokenav/condition/graph_data.bin', ext: '.lz', type: 'u32' },
  'sMonMarkings_Pal': { path: 'graphics/pokenav/condition/mon_markings.pal', ext: '.gbapal', type: 'u16' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'LoopedTask_TransitionMons', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_ExitConditionGraphMenu', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_MoveCursorNoTransition', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_SlideMonOut', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_OpenMonMarkingsWindow', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_CloseMonMarkingsWindow', ret: "u32", arity: 1, params: "s32" },
  { name: 'GetConditionGraphMenuCurrentLoadIndex', ret: "s8", arity: 0, params: "void" },
  { name: 'LoopedTask_OpenConditionGraphMenu', ret: "u32", arity: 1, params: "s32" },
  { name: 'GetConditionGraphMenuLoopedTaskActive', ret: "u32", arity: 0, params: "void" },
  { name: 'CreateConditionMonPic', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateMonMarkingsOrPokeballIndicators', ret: "void", arity: 0, params: "void" },
  { name: 'CopyUnusedConditionWindowsToVram', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateConditionGraphMenuWindows', ret: "bool32", arity: 3, params: "u8, u16, bool8" },
  { name: 'VBlankCB_PokenavConditionGraph', ret: "void", arity: 0, params: "void" },
  { name: 'DoConditionGraphEnterTransition', ret: "void", arity: 0, params: "void" },
  { name: 'DoConditionGraphExitTransition', ret: "void", arity: 0, params: "void" },
  { name: 'SetExitVBlank', ret: "void", arity: 0, params: "void" },
  { name: 'ToggleGraphData', ret: "void", arity: 1, params: "bool8" },
  { name: 'OpenConditionGraphMenu', ret: "bool32", arity: 0, params: "void" },
  { name: 'CreateConditionGraphMenuLoopedTask', ret: "void", arity: 1, params: "s32 id" },
  { name: 'IsConditionGraphMenuLoopedTaskActive', ret: "u32", arity: 0, params: "void" },
  { name: 'CopyWindowToVram', ret: "else", arity: 2, params: "menu->nameGenderWindowId, COPYWIN_GFX" },
  { name: 'SpriteCB_PartyPokeball', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'StartSpriteAnim', ret: "else", arity: 2, params: "sprite, CONDITION_ICON_UNSELECTED" },
  { name: 'HighlightCurrentPartyIndexPokeball', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'MonMarkingsCallback', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'FreeConditionMenuGfx', ret: "void", arity: 1, params: "struct Pokenav_ConditionMenuGfx *menu" },
  { name: 'FreeConditionGraphMenuSubstruct2', ret: "void", arity: 0, params: "void" },
  { name: 'MonPicGfxSpriteCallback', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'HideBg', ret: "else", arity: 1, params: "2" },
  { name: 'GetMonMarkingsData', ret: "u8", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'bg.h',
  'window.h',
  'pokenav.h',
  'decompress.h',
  'gpu_regs.h',
  'graphics.h',
  'menu.h',
  'menu_specialized.h',
  'mon_markings.h',
  'palette.h',
  'pokenav.h',
  'scanline_effect.h',
  'string_util.h',
  'strings.h',
  'text.h',
] as const;
