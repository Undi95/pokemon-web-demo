// AUTO-GENERATED from src/region_map.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/region_map.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MAP_WIDTH = 28;
export const MAP_HEIGHT = 15;
export const MAPCURSOR_X_MIN = 1;
export const MAPCURSOR_Y_MIN = 2;
/** Raw expr: `(MAPCURSOR_X_MIN + MAP_WIDTH - 1)` */
export const MAPCURSOR_X_MAX_EXPR = "(MAPCURSOR_X_MIN + MAP_WIDTH - 1)";
/** Raw expr: `(MAPCURSOR_Y_MIN + MAP_HEIGHT - 1)` */
export const MAPCURSOR_Y_MAX_EXPR = "(MAPCURSOR_Y_MIN + MAP_HEIGHT - 1)";
export const FLYDESTICON_RED_OUTLINE = 6;
/** Raw expr: `data[0]` */
export const sY_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sX_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sVisible_EXPR = "data[2]";
/** Raw expr: `data[7]` */
export const sTimer_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const sIconMapSec_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sFlickerTimer_EXPR = "data[1]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_TAG_0 = {
  TAG_CURSOR: 0,
  TAG_PLAYER_ICON: 1,
  TAG_FLY_ICON: 2,
} as const;
export const ENUM_WIN_1 = {
  WIN_MAPSEC_NAME: 0,
  WIN_MAPSEC_NAME_TALL: 1,
  WIN_FLY_TO_WHERE: 2,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sFlyMapWindowTemplates = [
  { bg: 0, tilemapLeft: 17, tilemapTop: 17, width: 12, height: 2, paletteNum: 15, baseBlock: 1 },
  { bg: 0, tilemapLeft: 17, tilemapTop: 15, width: 12, height: 4, paletteNum: 15, baseBlock: 25 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 18, width: 14, height: 2, paletteNum: 15, baseBlock: 73 },
] as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sFlyMapBgTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0 },
  { bg: 1, charBaseIndex: 3, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 1 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 28, screenSize: 2, paletteMode: 1, priority: 2 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sRegionMapCursorOam = { shape: "SPRITE_SHAPE(16x16)", size: "SPRITE_SIZE(16x16)", priority: 1 } as const;
export const sRegionMapPlayerIconOam = { shape: "SPRITE_SHAPE(16x16)", size: "SPRITE_SIZE(16x16)", priority: 2 } as const;
export const sFlyDestIcon_OamData = { shape: "SPRITE_SHAPE(8x8)", size: "SPRITE_SIZE(8x8)", priority: 2 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sRegionMapCursorSpriteTemplate = { tileTag: "TAG_CURSOR", paletteTag: "TAG_CURSOR", oam: "&sRegionMapCursorOam", anims: "sRegionMapCursorAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_CursorMapFull" } as const;
export const sFlyDestIconSpriteTemplate = { tileTag: "TAG_FLY_ICON", paletteTag: "TAG_FLY_ICON", oam: "&sFlyDestIcon_OamData", anims: "sFlyDestIcon_Anims", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── SpritePalette ─────────────────────────────────────────────────────────────
export const sRegionMapCursorSpritePalette = { data: "sRegionMapCursorPal", tag: "TAG_CURSOR" } as const;
export const sFlyTargetIconsSpritePalette = { data: "sFlyTargetIcons_Pal", tag: "TAG_FLY_ICON" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sRegionMapCursorPal': { path: 'graphics/pokenav/region_map/cursor.pal', ext: '.gbapal', type: 'u16' },
  'sRegionMapCursorSmallGfxLZ': { path: 'graphics/pokenav/region_map/cursor_small.png', ext: '.4bpp.lz', type: 'u32' },
  'sRegionMapCursorLargeGfxLZ': { path: 'graphics/pokenav/region_map/cursor_large.png', ext: '.4bpp.lz', type: 'u32' },
  'sRegionMapBg_Pal': { path: 'graphics/pokenav/region_map/map.pal', ext: '.gbapal', type: 'u16' },
  'sRegionMapBg_TilemapLZ': { path: 'graphics/pokenav/region_map/map.bin', ext: '.lz', type: 'u32' },
  'sRegionMapPlayerIcon_BrendanPal': { path: 'graphics/pokenav/region_map/brendan_icon.png', ext: '.gbapal', type: 'u16' },
  'sRegionMapPlayerIcon_BrendanGfx': { path: 'graphics/pokenav/region_map/brendan_icon.png', ext: '.4bpp', type: 'u8' },
  'sRegionMapPlayerIcon_MayPal': { path: 'graphics/pokenav/region_map/may_icon.png', ext: '.gbapal', type: 'u16' },
  'sRegionMapPlayerIcon_MayGfx': { path: 'graphics/pokenav/region_map/may_icon.png', ext: '.4bpp', type: 'u8' },
  'sRegionMapFramePal': { path: 'graphics/pokenav/region_map/frame.png', ext: '.gbapal', type: 'u16' },
  'sRegionMapFrameGfxLZ': { path: 'graphics/pokenav/region_map/frame.png', ext: '.4bpp.lz', type: 'u32' },
  'sRegionMapFrameTilemapLZ': { path: 'graphics/pokenav/region_map/frame.bin', ext: '.lz', type: 'u32' },
  'sFlyTargetIcons_Pal': { path: 'graphics/pokenav/region_map/fly_target_icons.png', ext: '.gbapal', type: 'u16' },
  'sFlyTargetIcons_Gfx': { path: 'graphics/pokenav/region_map/fly_target_icons.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sEverGrandeCityNames = ['gText_PokemonLeague', 'gText_PokemonCenter'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ProcessRegionMapInput_Full', ret: "u8", arity: 0, params: "void" },
  { name: 'MoveRegionMapCursor_Full', ret: "u8", arity: 0, params: "void" },
  { name: 'ProcessRegionMapInput_Zoomed', ret: "u8", arity: 0, params: "void" },
  { name: 'MoveRegionMapCursor_Zoomed', ret: "u8", arity: 0, params: "void" },
  { name: 'CalcZoomScrollParams', ret: "void", arity: 7, params: "s16 scrollX, s16 scrollY, s16 c, s16 d, u16 e, u16 f, u8 rotation" },
  { name: 'GetMapSecIdAt', ret: "mapsec_u16_t", arity: 2, params: "u16 x, u16 y" },
  { name: 'RegionMap_SetBG2XAndBG2Y', ret: "void", arity: 2, params: "s16 x, s16 y" },
  { name: 'InitMapBasedOnPlayerLocation', ret: "void", arity: 0, params: "void" },
  { name: 'RegionMap_InitializeStateBasedOnSSTidalLocation', ret: "void", arity: 0, params: "void" },
  { name: 'GetMapsecType', ret: "u8", arity: 1, params: "mapsec_u16_t mapSecId" },
  { name: 'CorrectSpecialMapSecId_Internal', ret: "mapsec_u16_t", arity: 1, params: "mapsec_u16_t mapSecId" },
  { name: 'GetTerraOrMarineCaveMapSecId', ret: "mapsec_u16_t", arity: 0, params: "void" },
  { name: 'GetMarineCaveCoords', ret: "void", arity: 2, params: "u16 *x, u16 *y" },
  { name: 'IsPlayerInAquaHideout', ret: "bool32", arity: 1, params: "mapsec_u8_t mapSecId" },
  { name: 'GetPositionOfCursorWithinMapSec', ret: "void", arity: 0, params: "void" },
  { name: 'RegionMap_IsMapSecIdInNextRow', ret: "bool8", arity: 1, params: "u16 y" },
  { name: 'SpriteCB_CursorMapFull', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'FreeRegionMapCursorSprite', ret: "void", arity: 0, params: "void" },
  { name: 'HideRegionMapPlayerIcon', ret: "void", arity: 0, params: "void" },
  { name: 'UnhideRegionMapPlayerIcon', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_PlayerIconMapZoomed', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_PlayerIconMapFull', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_PlayerIcon', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'VBlankCB_FlyMap', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_FlyMap', ret: "void", arity: 0, params: "void" },
  { name: 'DrawFlyDestTextWindow', ret: "void", arity: 0, params: "void" },
  { name: 'LoadFlyDestIcons', ret: "void", arity: 0, params: "void" },
  { name: 'CreateFlyDestIcons', ret: "void", arity: 0, params: "void" },
  { name: 'TryCreateRedOutlineFlyDestIcons', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_FlyDestIcon', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'CB_FadeInFlyMap', ret: "void", arity: 0, params: "void" },
  { name: 'CB_HandleFlyMapInput', ret: "void", arity: 0, params: "void" },
  { name: 'CB_ExitFlyMap', ret: "void", arity: 0, params: "void" },
  { name: 'InitRegionMap', ret: "void", arity: 2, params: "struct RegionMap *regionMap, bool8 zoomed" },
  { name: 'InitRegionMapData', ret: "void", arity: 3, params: "struct RegionMap *regionMap, const struct BgTemplate *template, bool8 zoomed" },
  { name: 'ShowRegionMapForPokedexAreaScreen', ret: "void", arity: 1, params: "struct RegionMap *regionMap" },
  { name: 'LoadRegionMapGfx', ret: "bool8", arity: 0, params: "void" },
  { name: 'BlendRegionMap', ret: "void", arity: 2, params: "u16 color, u32 coeff" },
  { name: 'FreeRegionMapIconResources', ret: "void", arity: 0, params: "void" },
  { name: 'DoRegionMapInputCallback', ret: "u8", arity: 0, params: "void" },
  { name: 'SetRegionMapDataForZoom', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateRegionMapZoom', ret: "bool8", arity: 0, params: "void" },
  { name: 'UpdateRegionMapVideoRegs', ret: "void", arity: 0, params: "void" },
  { name: 'PokedexAreaScreen_UpdateRegionMapVariablesAndVideoRegs', ret: "void", arity: 2, params: "s16 x, s16 y" },
  { name: 'GetRegionMapSecIdAt', ret: "mapsec_u16_t", arity: 2, params: "u16 x, u16 y" },
  { name: 'CorrectSpecialMapSecId', ret: "mapsec_u16_t", arity: 1, params: "mapsec_u16_t mapSecId" },
  { name: 'SpriteCB_CursorMapZoomed', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'CreateRegionMapCursor', ret: "void", arity: 2, params: "u16 tileTag, u16 paletteTag" },
  { name: 'SetUnkCursorSpriteData', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'ClearUnkCursorSpriteData', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'CreateRegionMapPlayerIcon', ret: "void", arity: 2, params: "u16 tileTag, u16 paletteTag" },
  { name: 'TrySetPlayerIconBlink', ret: "void", arity: 0, params: "void" },
  { name: 'GetMapSecDimensions', ret: "void", arity: 5, params: "mapsec_u16_t mapSecId, u16 *x, u16 *y, u16 *width, u16 *height" },
  { name: 'IsRegionMapZoomed', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsEventIslandMapSecId', ret: "bool32", arity: 1, params: "mapsec_u8_t mapSecId" },
  { name: 'CB2_OpenFlyMap', ret: "void", arity: 0, params: "void" },
  { name: 'SetWarpDestinationToMapWarp', ret: "else", arity: 3, params: "sMapHealLocations[sFlyMap->regionMap.mapSecId][0], sMapHealLocations[sFlyMap->regionMap.mapSecId][1], WARP_ID_NONE" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_FlyMap',
  'CB2_OpenFlyMap',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'main.h',
  'text.h',
  'menu.h',
  'malloc.h',
  'gpu_regs.h',
  'palette.h',
  'party_menu.h',
  'trig.h',
  'overworld.h',
  'event_data.h',
  'secret_base.h',
  'string_util.h',
  'international_string_util.h',
  'strings.h',
  'text_window.h',
  'constants/songs.h',
  'm4a.h',
  'field_effect.h',
  'field_specials.h',
  'fldeff.h',
  'region_map.h',
  'constants/region_map_sections.h',
  'heal_location.h',
  'constants/field_specials.h',
  'constants/heal_locations.h',
  'constants/map_types.h',
  'constants/rgb.h',
  'constants/weather.h',
  'data/region_map/region_map_layout.h',
  'data/region_map/region_map_entries.h',
] as const;
