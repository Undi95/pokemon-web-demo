// AUTO-GENERATED from src/pokedex_area_screen.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokedex_area_screen.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `MAP_GROUP(MAP_PETALBURG_CITY)` */
export const MAP_GROUP_TOWNS_AND_ROUTES_EXPR = "MAP_GROUP(MAP_PETALBURG_CITY)";
/** Raw expr: `MAP_GROUP(MAP_METEOR_FALLS_1F_1R)` */
export const MAP_GROUP_DUNGEONS_EXPR = "MAP_GROUP(MAP_METEOR_FALLS_1F_1R)";
/** Raw expr: `MAP_GROUP(MAP_SAFARI_ZONE_NORTHWEST)` */
export const MAP_GROUP_SPECIAL_AREA_EXPR = "MAP_GROUP(MAP_SAFARI_ZONE_NORTHWEST)";
export const AREA_SCREEN_WIDTH = 32;
export const AREA_SCREEN_HEIGHT = 20;
export const GLOW_FULL = 65535;
/** Raw expr: `(1 << 0)` */
export const GLOW_EDGE_R_EXPR = "(1 << 0)";
/** Raw expr: `(1 << 1)` */
export const GLOW_EDGE_L_EXPR = "(1 << 1)";
/** Raw expr: `(1 << 2)` */
export const GLOW_EDGE_B_EXPR = "(1 << 2)";
/** Raw expr: `(1 << 3)` */
export const GLOW_EDGE_T_EXPR = "(1 << 3)";
/** Raw expr: `(1 << 4)` */
export const GLOW_CORNER_TL_EXPR = "(1 << 4)";
/** Raw expr: `(1 << 5)` */
export const GLOW_CORNER_BL_EXPR = "(1 << 5)";
/** Raw expr: `(1 << 6)` */
export const GLOW_CORNER_TR_EXPR = "(1 << 6)";
/** Raw expr: `(1 << 7)` */
export const GLOW_CORNER_BR_EXPR = "(1 << 7)";
export const GLOW_PALETTE = 10;
export const TAG_AREA_MARKER = 2;
export const TAG_AREA_UNKNOWN = 3;
export const MAX_AREA_HIGHLIGHTS = 64;
export const MAX_AREA_MARKERS = 32;
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";

// ─── OamData ─────────────────────────────────────────────────────────────
export const sAreaMarkerOamData = { shape: "SPRITE_SHAPE(16x16)", size: "SPRITE_SIZE(16x16)", priority: 1 } as const;
export const sAreaUnknownOamData = { shape: "SPRITE_SHAPE(32x32)", size: "SPRITE_SIZE(32x32)", priority: 1 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sAreaMarkerSpriteTemplate = { tileTag: "TAG_AREA_MARKER", paletteTag: "TAG_AREA_MARKER", oam: "&sAreaMarkerOamData", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sAreaUnknownSpriteTemplate = { tileTag: "TAG_AREA_UNKNOWN", paletteTag: "TAG_AREA_UNKNOWN", oam: "&sAreaUnknownOamData", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── SpriteSheet ─────────────────────────────────────────────────────────────
export const sAreaMarkerSpriteSheet = { data: "sAreaMarkerTiles", size: 128, tag: "TAG_AREA_MARKER" } as const;
export const spriteSheet = { data: "sPokedexAreaScreen->areaUnknownGraphicsBuffer", size: "sizeof(sPokedexAreaScreen->areaUnknownGraphicsBuffer)", tag: "TAG_AREA_UNKNOWN" } as const;

// ─── SpritePalette ─────────────────────────────────────────────────────────────
export const sAreaMarkerSpritePalette = { data: "sAreaMarkerPalette", tag: "TAG_AREA_MARKER" } as const;
export const sAreaUnknownSpritePalette = { data: "gPokedexAreaScreenAreaUnknown_Pal", tag: "TAG_AREA_UNKNOWN" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sAreaGlow_Pal': { path: 'graphics/pokedex/area_glow.png', ext: '.gbapal', type: 'u32' },
  'sAreaGlow_Gfx': { path: 'graphics/pokedex/area_glow.png', ext: '.4bpp.lz', type: 'u32' },
  'sAreaMarkerPalette': { path: 'graphics/pokedex/area_marker.png', ext: '.gbapal', type: 'u16' },
  'sAreaMarkerTiles': { path: 'graphics/pokedex/area_marker.png', ext: '.4bpp', type: 'u8' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'FindMapsWithMon', ret: "void", arity: 1, params: "u16" },
  { name: 'BuildAreaGlowTilemap', ret: "void", arity: 0, params: "void" },
  { name: 'SetAreaHasMon', ret: "void", arity: 2, params: "u16, u16" },
  { name: 'SetSpecialMapHasMon', ret: "void", arity: 2, params: "u16, u16" },
  { name: 'GetRegionMapSectionId', ret: "mapsec_u16_t", arity: 2, params: "u8, u8" },
  { name: 'MapHasSpecies', ret: "bool8", arity: 2, params: "const struct WildPokemonHeader *, u16" },
  { name: 'MonListHasSpecies', ret: "bool8", arity: 3, params: "const struct WildPokemonInfo *, u16, u16" },
  { name: 'DoAreaGlow', ret: "void", arity: 0, params: "void" },
  { name: 'Task_ShowPokedexAreaScreen', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateAreaMarkerSprites', ret: "void", arity: 0, params: "void" },
  { name: 'LoadAreaUnknownGraphics', ret: "void", arity: 0, params: "void" },
  { name: 'CreateAreaUnknownSprites', ret: "void", arity: 0, params: "void" },
  { name: 'Task_HandlePokedexAreaScreenInput', ret: "void", arity: 1, params: "u8" },
  { name: 'ResetPokedexAreaMapBg', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyAreaScreenSprites', ret: "void", arity: 0, params: "void" },
  { name: 'ResetDrawAreaGlowState', ret: "void", arity: 0, params: "void" },
  { name: 'DrawAreaGlow', ret: "bool8", arity: 0, params: "void" },
  { name: 'StartAreaGlow', ret: "void", arity: 0, params: "void" },
  { name: 'ShowPokedexAreaScreen', ret: "void", arity: 2, params: "u16 species, u8 *screenSwitchState" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_HandlePokedexAreaScreenInput',
  'Task_ShowPokedexAreaScreen',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'bg.h',
  'event_data.h',
  'gpu_regs.h',
  'graphics.h',
  'main.h',
  'malloc.h',
  'menu.h',
  'overworld.h',
  'palette.h',
  'pokedex_area_screen.h',
  'region_map.h',
  'roamer.h',
  'sound.h',
  'string_util.h',
  'trig.h',
  'pokedex_area_region_map.h',
  'wild_encounter.h',
  'constants/region_map_sections.h',
  'constants/rgb.h',
  'constants/songs.h',
  'data/pokedex_area_glow.h',
] as const;
