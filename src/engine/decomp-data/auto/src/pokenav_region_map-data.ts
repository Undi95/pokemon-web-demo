// AUTO-GENERATED from src/pokenav_region_map.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokenav_region_map.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const GFXTAG_CITY_ZOOM = 6;
export const PALTAG_CITY_ZOOM = 11;
export const NUM_CITY_MAPS = 22;
/** Raw expr: `data[0]` */
export const tZoomIn_EXPR = "data[0]";

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sMapSecInfoWindowTemplate = { bg: 1, tilemapLeft: 17, tilemapTop: 4, width: 13, height: 13, paletteNum: 1, baseBlock: 76 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sRegionMapBgTemplates = [
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 6, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 0, screenSize: 2, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sCityZoomTextSprite_OamData = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x8)", x: 0, size: "SPRITE_SIZE(32x8)", tileNum: 0, priority: 1, paletteNum: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sCityZoomTextSpriteTemplate = { tileTag: "GFXTAG_CITY_ZOOM", paletteTag: "PALTAG_CITY_ZOOM", oam: "&sCityZoomTextSprite_OamData", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_CityZoomText" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sMapSecInfoWindow_Pal': { path: 'graphics/pokenav/region_map/info_window.pal', ext: '.gbapal', type: 'u16' },
  'sRegionMapCityZoomTiles_Gfx': { path: 'graphics/pokenav/region_map/zoom_tiles.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'HandleRegionMapInput', ret: "u32", arity: 1, params: "struct Pokenav_RegionMapMenu *" },
  { name: 'HandleRegionMapInputZoomDisabled', ret: "u32", arity: 1, params: "struct Pokenav_RegionMapMenu *" },
  { name: 'GetExitRegionMapMenuId', ret: "u32", arity: 1, params: "struct Pokenav_RegionMapMenu *" },
  { name: 'LoopedTask_OpenRegionMap', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_DecompressCityMaps', ret: "u32", arity: 1, params: "s32" },
  { name: 'GetCurrentLoopedTaskActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'FreeCityZoomViewGfx', ret: "void", arity: 0, params: "void" },
  { name: 'LoadCityZoomViewGfx', ret: "void", arity: 0, params: "void" },
  { name: 'DecompressCityMaps', ret: "void", arity: 0, params: "void" },
  { name: 'IsDecompressCityMapsActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'LoadPokenavRegionMapGfx', ret: "void", arity: 1, params: "struct Pokenav_RegionMapGfx *" },
  { name: 'TryFreeTempTileDataBuffers', ret: "bool32", arity: 0, params: "void" },
  { name: 'UpdateMapSecInfoWindow', ret: "void", arity: 1, params: "struct Pokenav_RegionMapGfx *" },
  { name: 'IsDma3ManagerBusyWithBgCopy_', ret: "bool32", arity: 1, params: "struct Pokenav_RegionMapGfx *" },
  { name: 'ChangeBgYForZoom', ret: "void", arity: 1, params: "bool32" },
  { name: 'IsChangeBgYForZoomActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'CreateCityZoomTextSprites', ret: "void", arity: 0, params: "void" },
  { name: 'DrawCityMap', ret: "void", arity: 3, params: "struct Pokenav_RegionMapGfx *, mapsec_s32_t, int" },
  { name: 'PrintLandmarkNames', ret: "void", arity: 3, params: "struct Pokenav_RegionMapGfx *, mapsec_s32_t, int" },
  { name: 'SetCityZoomTextInvisibility', ret: "void", arity: 1, params: "bool32" },
  { name: 'Task_ChangeBgYForZoom', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'UpdateCityZoomTextPosition', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_CityZoomText', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'LoopedTask_UpdateInfoAfterCursorMove', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_RegionMapZoomOut', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_RegionMapZoomIn', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_ExitRegionMap', ret: "u32", arity: 1, params: "s32" },
  { name: 'PokenavCallback_Init_RegionMap', ret: "u32", arity: 0, params: "void" },
  { name: 'FreeRegionMapSubstruct1', ret: "void", arity: 0, params: "void" },
  { name: 'GetRegionMapCallback', ret: "u32", arity: 0, params: "void" },
  { name: 'GetZoomDisabled', ret: "bool32", arity: 0, params: "void" },
  { name: 'OpenPokenavRegionMap', ret: "bool32", arity: 0, params: "void" },
  { name: 'CreateRegionMapLoopedTask', ret: "void", arity: 1, params: "s32 index" },
  { name: 'IsRegionMapLoopedTaskActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'FreeRegionMapSubstruct2', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_RegionMap', ret: "void", arity: 0, params: "void" },
  { name: 'ShouldOpenRegionMapZoomed', ret: "bool8", arity: 0, params: "void" },
  { name: 'ChangeBgY', ret: "else", arity: 3, params: "1, 0, BG_COORD_SET" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_ChangeBgYForZoom',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'bg.h',
  'decompress.h',
  'landmark.h',
  'main.h',
  'menu.h',
  'palette.h',
  'pokenav.h',
  'region_map.h',
  'sound.h',
  'sprite.h',
  'string_util.h',
  'task.h',
  'text_window.h',
  'window.h',
  'constants/rgb.h',
  'constants/songs.h',
  'constants/region_map_sections.h',
  'data/region_map/city_map_tilemaps.h',
  'data/region_map/city_map_entries.h',
] as const;
