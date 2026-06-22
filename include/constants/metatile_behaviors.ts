/**
 * metatile-behavior-constants.ts — 1:1 décomp `include/constants/metatile_behaviors.h`.
 *
 * 137 constantes `MB_*` extraites pour casser le cycle ESM TDZ observé en HMR.
 *
 * BUG ROOT CAUSE :
 *   `decomp-bridge.ts` est un hub géant (~3300 lignes, 80+ imports) qui définissait
 *   tous les `MB_*` en plus de re-exporter les helpers. `metatile-behavior.ts`
 *   importe les `MB_*` depuis bridge ; bridge importe (transitivement) plein de
 *   modules dont certains finissent par re-toucher `metatile-behavior.ts` via
 *   le graph d'import. HMR Vite reload partiel → MB_NORMAL en cours d'init quand
 *   metatile-behavior.ts est ré-évalué → `ReferenceError: Cannot access 'MB_NORMAL'
 *   before initialization`.
 *
 * FIX :
 *   Module dédié SANS aucun import (= zéro dépendance). `decomp-bridge.ts` et
 *   `metatile-behavior.ts` re-importent depuis ici. Pas de cycle possible.
 *
 * Source : `decomps/pokeemeraude/include/constants/metatile_behaviors.h`.
 */

export const MB_NORMAL = 0x00;
export const MB_SECRET_BASE_WALL = 0x01;
export const MB_TALL_GRASS = 0x02;
export const MB_LONG_GRASS = 0x03;
export const MB_DEEP_SAND = 0x06;
export const MB_SHORT_GRASS = 0x07;
export const MB_CAVE = 0x08;
export const MB_LONG_GRASS_SOUTH_EDGE = 0x09;
export const MB_NO_RUNNING = 0x0A;
export const MB_INDOOR_ENCOUNTER = 0x0B;
export const MB_MOUNTAIN_TOP = 0x0C;
export const MB_BATTLE_PYRAMID_WARP = 0x0D;
export const MB_MOSSDEEP_GYM_WARP = 0x0E;
export const MB_MT_PYRE_HOLE = 0x0F;
export const MB_POND_WATER = 0x10;
export const MB_INTERIOR_DEEP_WATER = 0x11;
export const MB_DEEP_WATER = 0x12;
export const MB_WATERFALL = 0x13;
export const MB_SOOTOPOLIS_DEEP_WATER = 0x14;
export const MB_OCEAN_WATER = 0x15;
export const MB_PUDDLE = 0x16;
export const MB_SHALLOW_WATER = 0x17;
export const MB_NO_SURFACING = 0x19;
export const MB_STAIRS_OUTSIDE_ABANDONED_SHIP = 0x1B;
export const MB_SHOAL_CAVE_ENTRANCE = 0x1C;
export const MB_ICE = 0x20;
export const MB_SAND = 0x21;
export const MB_SEAWEED = 0x22;
export const MB_ASHGRASS = 0x24;
export const MB_FOOTPRINTS = 0x25;
export const MB_THIN_ICE = 0x26;
export const MB_CRACKED_ICE = 0x27;
export const MB_HOT_SPRINGS = 0x28;
export const MB_LAVARIDGE_GYM_B1F_WARP = 0x29;
export const MB_SEAWEED_NO_SURFACING = 0x2A;
export const MB_REFLECTION_UNDER_BRIDGE = 0x2B;
export const MB_IMPASSABLE_EAST = 0x30;
export const MB_IMPASSABLE_WEST = 0x31;
export const MB_IMPASSABLE_NORTH = 0x32;
export const MB_IMPASSABLE_SOUTH = 0x33;
export const MB_IMPASSABLE_NORTHEAST = 0x34;
export const MB_IMPASSABLE_NORTHWEST = 0x35;
export const MB_IMPASSABLE_SOUTHEAST = 0x36;
export const MB_IMPASSABLE_SOUTHWEST = 0x37;
export const MB_JUMP_EAST = 0x38;
export const MB_JUMP_WEST = 0x39;
export const MB_JUMP_NORTH = 0x3A;
export const MB_JUMP_SOUTH = 0x3B;
export const MB_JUMP_NORTHEAST = 0x3C;
export const MB_JUMP_NORTHWEST = 0x3D;
export const MB_JUMP_SOUTHEAST = 0x3E;
export const MB_JUMP_SOUTHWEST = 0x3F;
export const MB_WALK_EAST = 0x40;
export const MB_WALK_WEST = 0x41;
export const MB_WALK_NORTH = 0x42;
export const MB_WALK_SOUTH = 0x43;
export const MB_SLIDE_EAST = 0x44;
export const MB_SLIDE_WEST = 0x45;
export const MB_SLIDE_NORTH = 0x46;
export const MB_SLIDE_SOUTH = 0x47;
export const MB_TRICK_HOUSE_PUZZLE_8_FLOOR = 0x48;
export const MB_EASTWARD_CURRENT = 0x50;
export const MB_WESTWARD_CURRENT = 0x51;
export const MB_NORTHWARD_CURRENT = 0x52;
export const MB_SOUTHWARD_CURRENT = 0x53;
export const MB_NON_ANIMATED_DOOR = 0x60;
export const MB_LADDER = 0x61;
export const MB_EAST_ARROW_WARP = 0x62;
export const MB_WEST_ARROW_WARP = 0x63;
export const MB_NORTH_ARROW_WARP = 0x64;
export const MB_SOUTH_ARROW_WARP = 0x65;
export const MB_CRACKED_FLOOR_HOLE = 0x66;
export const MB_AQUA_HIDEOUT_WARP = 0x67;
export const MB_LAVARIDGE_GYM_1F_WARP = 0x68;
export const MB_ANIMATED_DOOR = 0x69;
export const MB_UP_ESCALATOR = 0x6A;
export const MB_DOWN_ESCALATOR = 0x6B;
export const MB_WATER_DOOR = 0x6C;
export const MB_WATER_SOUTH_ARROW_WARP = 0x6D;
export const MB_DEEP_SOUTH_WARP = 0x6E;
export const MB_BRIDGE_OVER_OCEAN = 0x70;
export const MB_BRIDGE_OVER_POND_LOW = 0x71;
export const MB_BRIDGE_OVER_POND_MED = 0x72;
export const MB_BRIDGE_OVER_POND_HIGH = 0x73;
export const MB_PACIFIDLOG_VERTICAL_LOG_TOP = 0x74;
export const MB_PACIFIDLOG_VERTICAL_LOG_BOTTOM = 0x75;
export const MB_PACIFIDLOG_HORIZONTAL_LOG_LEFT = 0x76;
export const MB_PACIFIDLOG_HORIZONTAL_LOG_RIGHT = 0x77;
export const MB_FORTREE_BRIDGE = 0x78;
export const MB_BRIDGE_OVER_POND_MED_EDGE_1 = 0x7A;
export const MB_BRIDGE_OVER_POND_MED_EDGE_2 = 0x7B;
export const MB_BRIDGE_OVER_POND_HIGH_EDGE_1 = 0x7C;
export const MB_BRIDGE_OVER_POND_HIGH_EDGE_2 = 0x7D;
export const MB_BIKE_BRIDGE_OVER_BARRIER = 0x7F;
export const MB_COUNTER = 0x80;
export const MB_PC = 0x83;
export const MB_CABLE_BOX_RESULTS_1 = 0x84;
export const MB_REGION_MAP = 0x85;
export const MB_TELEVISION = 0x86;
export const MB_POKEBLOCK_FEEDER = 0x87;
export const MB_SLOT_MACHINE = 0x89;
export const MB_ROULETTE = 0x8A;
export const MB_CLOSED_SOOTOPOLIS_DOOR = 0x8B;
export const MB_TRICK_HOUSE_PUZZLE_DOOR = 0x8C;
export const MB_PETALBURG_GYM_DOOR = 0x8D;
export const MB_RUNNING_SHOES_INSTRUCTION = 0x8E;
export const MB_QUESTIONNAIRE = 0x8F;
export const MB_BERRY_TREE_SOIL = 0xA0;
export const MB_SECRET_BASE_PC = 0xB0;
export const MB_SECRET_BASE_REGISTER_PC = 0xB1;
export const MB_HOLDS_SMALL_DECORATION = 0xB5;
export const MB_SECRET_BASE_NORTH_WALL = 0xB7;
export const MB_SECRET_BASE_BALLOON = 0xB8;
export const MB_SECRET_BASE_BREAKABLE_DOOR = 0xBE;
export const MB_IMPASSABLE_SOUTH_AND_NORTH = 0xC0;
export const MB_IMPASSABLE_WEST_AND_EAST = 0xC1;
export const MB_SECRET_BASE_HOLE = 0xC2;
export const MB_HOLDS_LARGE_DECORATION = 0xC3;
export const MB_PLAYER_ROOM_PC_ON = 0xC5;
export const MB_MUDDY_SLOPE = 0xD0;
export const MB_BUMPY_SLOPE = 0xD1;
export const MB_CRACKED_FLOOR = 0xD2;
export const MB_ISOLATED_VERTICAL_RAIL = 0xD3;
export const MB_ISOLATED_HORIZONTAL_RAIL = 0xD4;
export const MB_VERTICAL_RAIL = 0xD5;
export const MB_HORIZONTAL_RAIL = 0xD6;
export const MB_PICTURE_BOOK_SHELF = 0xE0;
export const MB_BOOKSHELF = 0xE1;
export const MB_POKEMON_CENTER_BOOKSHELF = 0xE2;
export const MB_VASE = 0xE3;
export const MB_TRASH_CAN = 0xE4;
export const MB_SHOP_SHELF = 0xE5;
export const MB_BLUEPRINT = 0xE6;
export const MB_CABLE_BOX_RESULTS_2 = 0xE7;
export const MB_WIRELESS_BOX_RESULTS = 0xE8;
export const MB_TRAINER_HILL_TIMER = 0xE9;
export const MB_SKY_PILLAR_CLOSED_DOOR = 0xEA;
