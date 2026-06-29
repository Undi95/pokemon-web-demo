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
 *
 * COMPLÉTÉ 2026-06-29 : 137 → 240 (1:1 enum complet, incl. MB_UNUSED_x + MB_SECRET_BASE_x)
 * + MB_INVALID + objet ENUM_MB_0 (forme consommée par tilemap-loader/metatile_behavior/tv ;
 * absorbé depuis decomp-data/include/constants/metatile_behaviors-data.ts). Reste un leaf 0-import.
 */

export const MB_NORMAL = 0x00;
export const MB_SECRET_BASE_WALL = 0x01;
export const MB_TALL_GRASS = 0x02;
export const MB_LONG_GRASS = 0x03;
export const MB_UNUSED_04 = 0x04;
export const MB_UNUSED_05 = 0x05;
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
export const MB_UNUSED_SOOTOPOLIS_DEEP_WATER = 0x18;
export const MB_NO_SURFACING = 0x19;
export const MB_UNUSED_SOOTOPOLIS_DEEP_WATER_2 = 0x1A;
export const MB_STAIRS_OUTSIDE_ABANDONED_SHIP = 0x1B;
export const MB_SHOAL_CAVE_ENTRANCE = 0x1C;
export const MB_UNUSED_1D = 0x1D;
export const MB_UNUSED_1E = 0x1E;
export const MB_UNUSED_1F = 0x1F;
export const MB_ICE = 0x20;
export const MB_SAND = 0x21;
export const MB_SEAWEED = 0x22;
export const MB_UNUSED_23 = 0x23;
export const MB_ASHGRASS = 0x24;
export const MB_FOOTPRINTS = 0x25;
export const MB_THIN_ICE = 0x26;
export const MB_CRACKED_ICE = 0x27;
export const MB_HOT_SPRINGS = 0x28;
export const MB_LAVARIDGE_GYM_B1F_WARP = 0x29;
export const MB_SEAWEED_NO_SURFACING = 0x2A;
export const MB_REFLECTION_UNDER_BRIDGE = 0x2B;
export const MB_UNUSED_2C = 0x2C;
export const MB_UNUSED_2D = 0x2D;
export const MB_UNUSED_2E = 0x2E;
export const MB_UNUSED_2F = 0x2F;
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
export const MB_UNUSED_49 = 0x49;
export const MB_UNUSED_4A = 0x4A;
export const MB_UNUSED_4B = 0x4B;
export const MB_UNUSED_4C = 0x4C;
export const MB_UNUSED_4D = 0x4D;
export const MB_UNUSED_4E = 0x4E;
export const MB_UNUSED_4F = 0x4F;
export const MB_EASTWARD_CURRENT = 0x50;
export const MB_WESTWARD_CURRENT = 0x51;
export const MB_NORTHWARD_CURRENT = 0x52;
export const MB_SOUTHWARD_CURRENT = 0x53;
export const MB_UNUSED_54 = 0x54;
export const MB_UNUSED_55 = 0x55;
export const MB_UNUSED_56 = 0x56;
export const MB_UNUSED_57 = 0x57;
export const MB_UNUSED_58 = 0x58;
export const MB_UNUSED_59 = 0x59;
export const MB_UNUSED_5A = 0x5A;
export const MB_UNUSED_5B = 0x5B;
export const MB_UNUSED_5C = 0x5C;
export const MB_UNUSED_5D = 0x5D;
export const MB_UNUSED_5E = 0x5E;
export const MB_UNUSED_5F = 0x5F;
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
export const MB_UNUSED_6F = 0x6F;
export const MB_BRIDGE_OVER_OCEAN = 0x70;
export const MB_BRIDGE_OVER_POND_LOW = 0x71;
export const MB_BRIDGE_OVER_POND_MED = 0x72;
export const MB_BRIDGE_OVER_POND_HIGH = 0x73;
export const MB_PACIFIDLOG_VERTICAL_LOG_TOP = 0x74;
export const MB_PACIFIDLOG_VERTICAL_LOG_BOTTOM = 0x75;
export const MB_PACIFIDLOG_HORIZONTAL_LOG_LEFT = 0x76;
export const MB_PACIFIDLOG_HORIZONTAL_LOG_RIGHT = 0x77;
export const MB_FORTREE_BRIDGE = 0x78;
export const MB_UNUSED_79 = 0x79;
export const MB_BRIDGE_OVER_POND_MED_EDGE_1 = 0x7A;
export const MB_BRIDGE_OVER_POND_MED_EDGE_2 = 0x7B;
export const MB_BRIDGE_OVER_POND_HIGH_EDGE_1 = 0x7C;
export const MB_BRIDGE_OVER_POND_HIGH_EDGE_2 = 0x7D;
export const MB_UNUSED_BRIDGE = 0x7E;
export const MB_BIKE_BRIDGE_OVER_BARRIER = 0x7F;
export const MB_COUNTER = 0x80;
export const MB_UNUSED_81 = 0x81;
export const MB_UNUSED_82 = 0x82;
export const MB_PC = 0x83;
export const MB_CABLE_BOX_RESULTS_1 = 0x84;
export const MB_REGION_MAP = 0x85;
export const MB_TELEVISION = 0x86;
export const MB_POKEBLOCK_FEEDER = 0x87;
export const MB_UNUSED_88 = 0x88;
export const MB_SLOT_MACHINE = 0x89;
export const MB_ROULETTE = 0x8A;
export const MB_CLOSED_SOOTOPOLIS_DOOR = 0x8B;
export const MB_TRICK_HOUSE_PUZZLE_DOOR = 0x8C;
export const MB_PETALBURG_GYM_DOOR = 0x8D;
export const MB_RUNNING_SHOES_INSTRUCTION = 0x8E;
export const MB_QUESTIONNAIRE = 0x8F;
export const MB_SECRET_BASE_SPOT_RED_CAVE = 0x90;
export const MB_SECRET_BASE_SPOT_RED_CAVE_OPEN = 0x91;
export const MB_SECRET_BASE_SPOT_BROWN_CAVE = 0x92;
export const MB_SECRET_BASE_SPOT_BROWN_CAVE_OPEN = 0x93;
export const MB_SECRET_BASE_SPOT_YELLOW_CAVE = 0x94;
export const MB_SECRET_BASE_SPOT_YELLOW_CAVE_OPEN = 0x95;
export const MB_SECRET_BASE_SPOT_TREE_LEFT = 0x96;
export const MB_SECRET_BASE_SPOT_TREE_LEFT_OPEN = 0x97;
export const MB_SECRET_BASE_SPOT_SHRUB = 0x98;
export const MB_SECRET_BASE_SPOT_SHRUB_OPEN = 0x99;
export const MB_SECRET_BASE_SPOT_BLUE_CAVE = 0x9A;
export const MB_SECRET_BASE_SPOT_BLUE_CAVE_OPEN = 0x9B;
export const MB_SECRET_BASE_SPOT_TREE_RIGHT = 0x9C;
export const MB_SECRET_BASE_SPOT_TREE_RIGHT_OPEN = 0x9D;
export const MB_UNUSED_9E = 0x9E;
export const MB_UNUSED_9F = 0x9F;
export const MB_BERRY_TREE_SOIL = 0xA0;
export const MB_UNUSED_A1 = 0xA1;
export const MB_UNUSED_A2 = 0xA2;
export const MB_UNUSED_A3 = 0xA3;
export const MB_UNUSED_A4 = 0xA4;
export const MB_UNUSED_A5 = 0xA5;
export const MB_UNUSED_A6 = 0xA6;
export const MB_UNUSED_A7 = 0xA7;
export const MB_UNUSED_A8 = 0xA8;
export const MB_UNUSED_A9 = 0xA9;
export const MB_UNUSED_AA = 0xAA;
export const MB_UNUSED_AB = 0xAB;
export const MB_UNUSED_AC = 0xAC;
export const MB_UNUSED_AD = 0xAD;
export const MB_UNUSED_AE = 0xAE;
export const MB_UNUSED_AF = 0xAF;
export const MB_SECRET_BASE_PC = 0xB0;
export const MB_SECRET_BASE_REGISTER_PC = 0xB1;
export const MB_SECRET_BASE_SCENERY = 0xB2;
export const MB_SECRET_BASE_TRAINER_SPOT = 0xB3;
export const MB_SECRET_BASE_DECORATION = 0xB4;
export const MB_HOLDS_SMALL_DECORATION = 0xB5;
export const MB_UNUSED_B6 = 0xB6;
export const MB_SECRET_BASE_NORTH_WALL = 0xB7;
export const MB_SECRET_BASE_BALLOON = 0xB8;
export const MB_SECRET_BASE_IMPASSABLE = 0xB9;
export const MB_SECRET_BASE_GLITTER_MAT = 0xBA;
export const MB_SECRET_BASE_JUMP_MAT = 0xBB;
export const MB_SECRET_BASE_SPIN_MAT = 0xBC;
export const MB_SECRET_BASE_SOUND_MAT = 0xBD;
export const MB_SECRET_BASE_BREAKABLE_DOOR = 0xBE;
export const MB_SECRET_BASE_SAND_ORNAMENT = 0xBF;
export const MB_IMPASSABLE_SOUTH_AND_NORTH = 0xC0;
export const MB_IMPASSABLE_WEST_AND_EAST = 0xC1;
export const MB_SECRET_BASE_HOLE = 0xC2;
export const MB_HOLDS_LARGE_DECORATION = 0xC3;
export const MB_SECRET_BASE_TV_SHIELD = 0xC4;
export const MB_PLAYER_ROOM_PC_ON = 0xC5;
export const MB_SECRET_BASE_DECORATION_BASE = 0xC6;
export const MB_SECRET_BASE_POSTER = 0xC7;
export const MB_UNUSED_C8 = 0xC8;
export const MB_UNUSED_C9 = 0xC9;
export const MB_UNUSED_CA = 0xCA;
export const MB_UNUSED_CB = 0xCB;
export const MB_UNUSED_CC = 0xCC;
export const MB_UNUSED_CD = 0xCD;
export const MB_UNUSED_CE = 0xCE;
export const MB_UNUSED_CF = 0xCF;
export const MB_MUDDY_SLOPE = 0xD0;
export const MB_BUMPY_SLOPE = 0xD1;
export const MB_CRACKED_FLOOR = 0xD2;
export const MB_ISOLATED_VERTICAL_RAIL = 0xD3;
export const MB_ISOLATED_HORIZONTAL_RAIL = 0xD4;
export const MB_VERTICAL_RAIL = 0xD5;
export const MB_HORIZONTAL_RAIL = 0xD6;
export const MB_UNUSED_D7 = 0xD7;
export const MB_UNUSED_D8 = 0xD8;
export const MB_UNUSED_D9 = 0xD9;
export const MB_UNUSED_DA = 0xDA;
export const MB_UNUSED_DB = 0xDB;
export const MB_UNUSED_DC = 0xDC;
export const MB_UNUSED_DD = 0xDD;
export const MB_UNUSED_DE = 0xDE;
export const MB_UNUSED_DF = 0xDF;
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
export const MB_UNUSED_EB = 0xEB;
export const MB_UNUSED_EC = 0xEC;
export const MB_UNUSED_ED = 0xED;
export const MB_UNUSED_EE = 0xEE;
export const MB_UNUSED_EF = 0xEF;

/** 1:1 décomp `#define MB_INVALID UCHAR_MAX` (metatile_behaviors.h:248). */
export const MB_INVALID = 0xFF;

/** Objet ENUM_MB_0 (240 clés) — forme consommée par tilemap-loader/metatile_behavior/tv
 *  (= remplace l'ancien decomp-data ENUM_MB_0). Shorthand sur les consts flat ci-dessus. */
export const ENUM_MB_0 = {
  MB_NORMAL,
  MB_SECRET_BASE_WALL,
  MB_TALL_GRASS,
  MB_LONG_GRASS,
  MB_UNUSED_04,
  MB_UNUSED_05,
  MB_DEEP_SAND,
  MB_SHORT_GRASS,
  MB_CAVE,
  MB_LONG_GRASS_SOUTH_EDGE,
  MB_NO_RUNNING,
  MB_INDOOR_ENCOUNTER,
  MB_MOUNTAIN_TOP,
  MB_BATTLE_PYRAMID_WARP,
  MB_MOSSDEEP_GYM_WARP,
  MB_MT_PYRE_HOLE,
  MB_POND_WATER,
  MB_INTERIOR_DEEP_WATER,
  MB_DEEP_WATER,
  MB_WATERFALL,
  MB_SOOTOPOLIS_DEEP_WATER,
  MB_OCEAN_WATER,
  MB_PUDDLE,
  MB_SHALLOW_WATER,
  MB_UNUSED_SOOTOPOLIS_DEEP_WATER,
  MB_NO_SURFACING,
  MB_UNUSED_SOOTOPOLIS_DEEP_WATER_2,
  MB_STAIRS_OUTSIDE_ABANDONED_SHIP,
  MB_SHOAL_CAVE_ENTRANCE,
  MB_UNUSED_1D,
  MB_UNUSED_1E,
  MB_UNUSED_1F,
  MB_ICE,
  MB_SAND,
  MB_SEAWEED,
  MB_UNUSED_23,
  MB_ASHGRASS,
  MB_FOOTPRINTS,
  MB_THIN_ICE,
  MB_CRACKED_ICE,
  MB_HOT_SPRINGS,
  MB_LAVARIDGE_GYM_B1F_WARP,
  MB_SEAWEED_NO_SURFACING,
  MB_REFLECTION_UNDER_BRIDGE,
  MB_UNUSED_2C,
  MB_UNUSED_2D,
  MB_UNUSED_2E,
  MB_UNUSED_2F,
  MB_IMPASSABLE_EAST,
  MB_IMPASSABLE_WEST,
  MB_IMPASSABLE_NORTH,
  MB_IMPASSABLE_SOUTH,
  MB_IMPASSABLE_NORTHEAST,
  MB_IMPASSABLE_NORTHWEST,
  MB_IMPASSABLE_SOUTHEAST,
  MB_IMPASSABLE_SOUTHWEST,
  MB_JUMP_EAST,
  MB_JUMP_WEST,
  MB_JUMP_NORTH,
  MB_JUMP_SOUTH,
  MB_JUMP_NORTHEAST,
  MB_JUMP_NORTHWEST,
  MB_JUMP_SOUTHEAST,
  MB_JUMP_SOUTHWEST,
  MB_WALK_EAST,
  MB_WALK_WEST,
  MB_WALK_NORTH,
  MB_WALK_SOUTH,
  MB_SLIDE_EAST,
  MB_SLIDE_WEST,
  MB_SLIDE_NORTH,
  MB_SLIDE_SOUTH,
  MB_TRICK_HOUSE_PUZZLE_8_FLOOR,
  MB_UNUSED_49,
  MB_UNUSED_4A,
  MB_UNUSED_4B,
  MB_UNUSED_4C,
  MB_UNUSED_4D,
  MB_UNUSED_4E,
  MB_UNUSED_4F,
  MB_EASTWARD_CURRENT,
  MB_WESTWARD_CURRENT,
  MB_NORTHWARD_CURRENT,
  MB_SOUTHWARD_CURRENT,
  MB_UNUSED_54,
  MB_UNUSED_55,
  MB_UNUSED_56,
  MB_UNUSED_57,
  MB_UNUSED_58,
  MB_UNUSED_59,
  MB_UNUSED_5A,
  MB_UNUSED_5B,
  MB_UNUSED_5C,
  MB_UNUSED_5D,
  MB_UNUSED_5E,
  MB_UNUSED_5F,
  MB_NON_ANIMATED_DOOR,
  MB_LADDER,
  MB_EAST_ARROW_WARP,
  MB_WEST_ARROW_WARP,
  MB_NORTH_ARROW_WARP,
  MB_SOUTH_ARROW_WARP,
  MB_CRACKED_FLOOR_HOLE,
  MB_AQUA_HIDEOUT_WARP,
  MB_LAVARIDGE_GYM_1F_WARP,
  MB_ANIMATED_DOOR,
  MB_UP_ESCALATOR,
  MB_DOWN_ESCALATOR,
  MB_WATER_DOOR,
  MB_WATER_SOUTH_ARROW_WARP,
  MB_DEEP_SOUTH_WARP,
  MB_UNUSED_6F,
  MB_BRIDGE_OVER_OCEAN,
  MB_BRIDGE_OVER_POND_LOW,
  MB_BRIDGE_OVER_POND_MED,
  MB_BRIDGE_OVER_POND_HIGH,
  MB_PACIFIDLOG_VERTICAL_LOG_TOP,
  MB_PACIFIDLOG_VERTICAL_LOG_BOTTOM,
  MB_PACIFIDLOG_HORIZONTAL_LOG_LEFT,
  MB_PACIFIDLOG_HORIZONTAL_LOG_RIGHT,
  MB_FORTREE_BRIDGE,
  MB_UNUSED_79,
  MB_BRIDGE_OVER_POND_MED_EDGE_1,
  MB_BRIDGE_OVER_POND_MED_EDGE_2,
  MB_BRIDGE_OVER_POND_HIGH_EDGE_1,
  MB_BRIDGE_OVER_POND_HIGH_EDGE_2,
  MB_UNUSED_BRIDGE,
  MB_BIKE_BRIDGE_OVER_BARRIER,
  MB_COUNTER,
  MB_UNUSED_81,
  MB_UNUSED_82,
  MB_PC,
  MB_CABLE_BOX_RESULTS_1,
  MB_REGION_MAP,
  MB_TELEVISION,
  MB_POKEBLOCK_FEEDER,
  MB_UNUSED_88,
  MB_SLOT_MACHINE,
  MB_ROULETTE,
  MB_CLOSED_SOOTOPOLIS_DOOR,
  MB_TRICK_HOUSE_PUZZLE_DOOR,
  MB_PETALBURG_GYM_DOOR,
  MB_RUNNING_SHOES_INSTRUCTION,
  MB_QUESTIONNAIRE,
  MB_SECRET_BASE_SPOT_RED_CAVE,
  MB_SECRET_BASE_SPOT_RED_CAVE_OPEN,
  MB_SECRET_BASE_SPOT_BROWN_CAVE,
  MB_SECRET_BASE_SPOT_BROWN_CAVE_OPEN,
  MB_SECRET_BASE_SPOT_YELLOW_CAVE,
  MB_SECRET_BASE_SPOT_YELLOW_CAVE_OPEN,
  MB_SECRET_BASE_SPOT_TREE_LEFT,
  MB_SECRET_BASE_SPOT_TREE_LEFT_OPEN,
  MB_SECRET_BASE_SPOT_SHRUB,
  MB_SECRET_BASE_SPOT_SHRUB_OPEN,
  MB_SECRET_BASE_SPOT_BLUE_CAVE,
  MB_SECRET_BASE_SPOT_BLUE_CAVE_OPEN,
  MB_SECRET_BASE_SPOT_TREE_RIGHT,
  MB_SECRET_BASE_SPOT_TREE_RIGHT_OPEN,
  MB_UNUSED_9E,
  MB_UNUSED_9F,
  MB_BERRY_TREE_SOIL,
  MB_UNUSED_A1,
  MB_UNUSED_A2,
  MB_UNUSED_A3,
  MB_UNUSED_A4,
  MB_UNUSED_A5,
  MB_UNUSED_A6,
  MB_UNUSED_A7,
  MB_UNUSED_A8,
  MB_UNUSED_A9,
  MB_UNUSED_AA,
  MB_UNUSED_AB,
  MB_UNUSED_AC,
  MB_UNUSED_AD,
  MB_UNUSED_AE,
  MB_UNUSED_AF,
  MB_SECRET_BASE_PC,
  MB_SECRET_BASE_REGISTER_PC,
  MB_SECRET_BASE_SCENERY,
  MB_SECRET_BASE_TRAINER_SPOT,
  MB_SECRET_BASE_DECORATION,
  MB_HOLDS_SMALL_DECORATION,
  MB_UNUSED_B6,
  MB_SECRET_BASE_NORTH_WALL,
  MB_SECRET_BASE_BALLOON,
  MB_SECRET_BASE_IMPASSABLE,
  MB_SECRET_BASE_GLITTER_MAT,
  MB_SECRET_BASE_JUMP_MAT,
  MB_SECRET_BASE_SPIN_MAT,
  MB_SECRET_BASE_SOUND_MAT,
  MB_SECRET_BASE_BREAKABLE_DOOR,
  MB_SECRET_BASE_SAND_ORNAMENT,
  MB_IMPASSABLE_SOUTH_AND_NORTH,
  MB_IMPASSABLE_WEST_AND_EAST,
  MB_SECRET_BASE_HOLE,
  MB_HOLDS_LARGE_DECORATION,
  MB_SECRET_BASE_TV_SHIELD,
  MB_PLAYER_ROOM_PC_ON,
  MB_SECRET_BASE_DECORATION_BASE,
  MB_SECRET_BASE_POSTER,
  MB_UNUSED_C8,
  MB_UNUSED_C9,
  MB_UNUSED_CA,
  MB_UNUSED_CB,
  MB_UNUSED_CC,
  MB_UNUSED_CD,
  MB_UNUSED_CE,
  MB_UNUSED_CF,
  MB_MUDDY_SLOPE,
  MB_BUMPY_SLOPE,
  MB_CRACKED_FLOOR,
  MB_ISOLATED_VERTICAL_RAIL,
  MB_ISOLATED_HORIZONTAL_RAIL,
  MB_VERTICAL_RAIL,
  MB_HORIZONTAL_RAIL,
  MB_UNUSED_D7,
  MB_UNUSED_D8,
  MB_UNUSED_D9,
  MB_UNUSED_DA,
  MB_UNUSED_DB,
  MB_UNUSED_DC,
  MB_UNUSED_DD,
  MB_UNUSED_DE,
  MB_UNUSED_DF,
  MB_PICTURE_BOOK_SHELF,
  MB_BOOKSHELF,
  MB_POKEMON_CENTER_BOOKSHELF,
  MB_VASE,
  MB_TRASH_CAN,
  MB_SHOP_SHELF,
  MB_BLUEPRINT,
  MB_CABLE_BOX_RESULTS_2,
  MB_WIRELESS_BOX_RESULTS,
  MB_TRAINER_HILL_TIMER,
  MB_SKY_PILLAR_CLOSED_DOOR,
  MB_UNUSED_EB,
  MB_UNUSED_EC,
  MB_UNUSED_ED,
  MB_UNUSED_EE,
  MB_UNUSED_EF,
} as const;
